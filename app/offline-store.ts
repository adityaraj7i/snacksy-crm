export type OfflineSnapshot = {
  tables: unknown[];
  orders: unknown[];
  menuItems: unknown[];
  staffMembers: unknown[];
  inventoryItems: unknown[];
  expenses: unknown[];
  savedAt: number;
};

export type QueuedRequest = {
  id: string;
  endpoint: string;
  method: "POST" | "DELETE";
  body: Record<string, unknown>;
  createdAt: number;
};

const DB_NAME = "snacksy-offline";
const DB_VERSION = 1;
const META_STORE = "meta";
const QUEUE_STORE = "queue";

const openDatabase = () => new Promise<IDBDatabase>((resolve, reject) => {
  const request = indexedDB.open(DB_NAME, DB_VERSION);
  request.onupgradeneeded = () => {
    const database = request.result;
    if (!database.objectStoreNames.contains(META_STORE)) database.createObjectStore(META_STORE);
    if (!database.objectStoreNames.contains(QUEUE_STORE)) database.createObjectStore(QUEUE_STORE, { keyPath: "id" });
  };
  request.onsuccess = () => resolve(request.result);
  request.onerror = () => reject(request.error);
});

const requestResult = <T>(request: IDBRequest<T>) => new Promise<T>((resolve, reject) => {
  request.onsuccess = () => resolve(request.result);
  request.onerror = () => reject(request.error);
});

const readMeta = async <T>(key: string): Promise<T | null> => {
  const database = await openDatabase();
  try {
    return (await requestResult(database.transaction(META_STORE).objectStore(META_STORE).get(key)) as T | undefined) ?? null;
  } finally {
    database.close();
  }
};

const writeMeta = async (key: string, value: unknown) => {
  const database = await openDatabase();
  try {
    const transaction = database.transaction(META_STORE, "readwrite");
    transaction.objectStore(META_STORE).put(value, key);
    await new Promise<void>((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error);
    });
  } finally {
    database.close();
  }
};

export const readOfflineSnapshot = () => readMeta<OfflineSnapshot>("snapshot");
export const writeOfflineSnapshot = (snapshot: OfflineSnapshot) => writeMeta("snapshot", snapshot);

export const enqueueOfflineRequest = async (item: QueuedRequest) => {
  const database = await openDatabase();
  try {
    const transaction = database.transaction(QUEUE_STORE, "readwrite");
    transaction.objectStore(QUEUE_STORE).put(item);
    await new Promise<void>((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error);
    });
  } finally {
    database.close();
  }
};

export const listOfflineRequests = async (): Promise<QueuedRequest[]> => {
  const database = await openDatabase();
  try {
    const items = await requestResult(database.transaction(QUEUE_STORE).objectStore(QUEUE_STORE).getAll()) as QueuedRequest[];
    return items.sort((a, b) => a.createdAt - b.createdAt);
  } finally {
    database.close();
  }
};

export const removeOfflineRequest = async (id: string) => {
  const database = await openDatabase();
  try {
    const transaction = database.transaction(QUEUE_STORE, "readwrite");
    transaction.objectStore(QUEUE_STORE).delete(id);
    await new Promise<void>((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error);
    });
  } finally {
    database.close();
  }
};

export const countOfflineRequests = async () => {
  const database = await openDatabase();
  try {
    return await requestResult(database.transaction(QUEUE_STORE).objectStore(QUEUE_STORE).count());
  } finally {
    database.close();
  }
};

export const readIdMappings = async () => (await readMeta<Record<string, number>>("id-mappings")) ?? {};
export const writeIdMappings = (mappings: Record<string, number>) => writeMeta("id-mappings", mappings);

type OfflinePin = { salt: string; digest: string };
const bytesToBase64 = (bytes: Uint8Array) => btoa(Array.from(bytes, byte => String.fromCharCode(byte)).join(""));
const base64ToBytes = (value: string) => Uint8Array.from(atob(value), character => character.charCodeAt(0));
const pinDigest = async (staffId: number, pin: string, salt: Uint8Array) => {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(`${staffId}:${pin}`), "PBKDF2", false, ["deriveBits"]);
  const digest = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: new Uint8Array(salt), iterations: 150000 }, key, 256);
  return bytesToBase64(new Uint8Array(digest));
};

export const rememberOfflinePin = async (staffId: number, pin: string) => {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  return writeMeta(`pin:${staffId}`, { salt: bytesToBase64(salt), digest: await pinDigest(staffId, pin, salt) } satisfies OfflinePin);
};
export const verifyOfflinePin = async (staffId: number, pin: string) => {
  const stored = await readMeta<OfflinePin>(`pin:${staffId}`);
  return Boolean(stored?.salt && stored.digest === await pinDigest(staffId, pin, base64ToBytes(stored.salt)));
};
