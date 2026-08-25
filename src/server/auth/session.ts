import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { Permission, RoleName } from "@/types";

export const SESSION_COOKIE_NAME = "snacksy_crm_session";
const SESSION_EXPIRATION_SECONDS = 8 * 60 * 60; // 8 hours

export interface SessionPayload {
  userId: string;
  email: string;
  fullName: string;
  organizationId: string;
  roles: RoleName[];
  permissions: Permission[];
  branchIds: string[];
}

function getSecretKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET || "development-secret-key-snacksy-crm-32-bytes";
  return new TextEncoder().encode(secret);
}

export async function createSession(payload: SessionPayload): Promise<string> {
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_EXPIRATION_SECONDS}s`)
    .sign(getSecretKey());

  return token;
}

export async function verifySessionToken(
  token: string
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return {
      userId: payload.userId as string,
      email: payload.email as string,
      fullName: payload.fullName as string,
      organizationId: payload.organizationId as string,
      roles: (payload.roles || []) as RoleName[],
      permissions: (payload.permissions || []) as Permission[],
      branchIds: (payload.branchIds || []) as string[],
    };
  } catch {
    return null;
  }
}

export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_EXPIRATION_SECONDS,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function getSessionFromCookies(): Promise<SessionPayload | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}
