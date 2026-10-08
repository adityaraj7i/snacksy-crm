import { neon } from "@neondatabase/serverless";

type Row = Record<string, unknown>;

let client: ReturnType<typeof neon> | null = null;
let schemaReady: Promise<void> | null = null;

function getClient() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("DATABASE_URL is not configured.");
  client ??= neon(databaseUrl);
  return client;
}

function normalizeQuery(query: string) {
  let parameter = 0;
  return query
    .replace(/\?/g, () => `$${++parameter}`)
    .replace(/\bAS\s+([a-z]+[A-Z]\w*)/g, 'AS "$1"');
}

function normalizeRows(rows: Row[]) {
  const numericFields = new Set(["id", "count", "seats", "price", "total", "discount", "quantity", "reorderLevel", "amount", "updatedAt", "createdAt", "completedAt"]);
  return rows.map(row => Object.fromEntries(Object.entries(row).map(([key, value]) => [
    key,
    numericFields.has(key) && typeof value === "string" && /^-?\d+$/.test(value) ? Number(value) : value,
  ])));
}

async function ensureSchema() {
  if (!schemaReady) {
    const sql = getClient();
    schemaReady = (async () => {
      await sql.query(`CREATE TABLE IF NOT EXISTS cafe_tables (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        seats INTEGER NOT NULL DEFAULT 2,
        zone TEXT NOT NULL DEFAULT 'Main floor'
      )`);
      await sql.query(`CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        table_name TEXT NOT NULL,
        items TEXT NOT NULL,
        total INTEGER NOT NULL,
        discount INTEGER NOT NULL DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'kitchen',
        waiter TEXT NOT NULL,
        payment_method TEXT,
        created_at BIGINT NOT NULL,
        completed_at BIGINT
      )`);
      await sql.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount INTEGER NOT NULL DEFAULT 0`);
      await sql.query(`CREATE INDEX IF NOT EXISTS idx_orders_status ON orders (status)`);
      await sql.query(`CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders (created_at)`);
      await sql.query(`CREATE TABLE IF NOT EXISTS menu_items (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        category TEXT NOT NULL,
        price INTEGER NOT NULL,
        available INTEGER NOT NULL DEFAULT 1,
        image_key TEXT
      )`);
      await sql.query(`CREATE TABLE IF NOT EXISTS staff_members (
        id SERIAL PRIMARY KEY,
        role TEXT NOT NULL,
        name TEXT NOT NULL,
        pin TEXT NOT NULL,
        active INTEGER NOT NULL DEFAULT 1,
        created_at BIGINT NOT NULL
      )`);
      await sql.query(`CREATE INDEX IF NOT EXISTS idx_staff_members_role ON staff_members (role)`);
      await sql.query(`CREATE TABLE IF NOT EXISTS inventory_items (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        unit TEXT NOT NULL DEFAULT 'units',
        quantity INTEGER NOT NULL DEFAULT 0,
        reorder_level INTEGER NOT NULL DEFAULT 0,
        updated_at BIGINT NOT NULL
      )`);
      await sql.query(`CREATE TABLE IF NOT EXISTS expenses (
        id SERIAL PRIMARY KEY,
        category TEXT NOT NULL,
        note TEXT NOT NULL,
        amount INTEGER NOT NULL,
        created_at BIGINT NOT NULL
      )`);
      await sql.query(`CREATE INDEX IF NOT EXISTS idx_expenses_created_at ON expenses (created_at)`);
      await sql.query(`CREATE TABLE IF NOT EXISTS offline_mutations (
        id SERIAL PRIMARY KEY,
        mutation_id TEXT NOT NULL UNIQUE,
        response_json TEXT NOT NULL,
        created_at BIGINT NOT NULL
      )`);
      await sql.query(`CREATE INDEX IF NOT EXISTS idx_offline_mutations_created_at ON offline_mutations (created_at)`);
    })().catch(error => {
      schemaReady = null;
      throw error;
    });
  }
  await schemaReady;
}

class PreparedStatement {
  constructor(private readonly query: string, private readonly values: unknown[] = []) {}

  bind(...values: unknown[]) {
    return new PreparedStatement(this.query, values);
  }

  async execute() {
    await ensureSchema();
    const isInsert = /^\s*INSERT\b/i.test(this.query);
    const query = normalizeQuery(isInsert ? `${this.query} RETURNING id` : this.query);
    const rows = normalizeRows(await getClient().query(query, this.values) as Row[]);
    return { results: rows, meta: { last_row_id: Number(rows[0]?.id || 0) } };
  }

  async first<T = Row>() {
    const result = await this.execute();
    return (result.results[0] as T | undefined) ?? null;
  }

  async run() {
    return this.execute();
  }
}

const database = {
  prepare(query: string) {
    return new PreparedStatement(query);
  },
  async batch(statements: PreparedStatement[]) {
    const results = [];
    for (const statement of statements) results.push(await statement.execute());
    return results;
  },
};

export function getD1() {
  return database;
}
