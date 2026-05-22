import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import type { UserRole } from "@prisma/client";

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || "dev-secret-change-me"
);

export const CUSTOMER_COOKIE = "sm_session";
export const ADMIN_COOKIE = "sm_admin_session";

export type SessionPayload = {
  userId: string;
  role: UserRole;
  username?: string | null;
  email?: string | null;
};

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createToken(payload: SessionPayload) {
  return new SignJWT(payload as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

async function getSessionFromCookie(name: string): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(name)?.value;
  if (!token) return null;
  return verifyToken(token);
}

/** Customer storefront session */
export async function getSession(): Promise<SessionPayload | null> {
  return getSessionFromCookie(CUSTOMER_COOKIE);
}

/** Admin portal session */
export async function getAdminSession(): Promise<SessionPayload | null> {
  const session = await getSessionFromCookie(ADMIN_COOKIE);
  if (!session || (session.role !== "ADMIN" && session.role !== "STAFF")) {
    return null;
  }
  return session;
}

export async function requireAdmin() {
  return getAdminSession();
}

export async function setCustomerSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(CUSTOMER_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function setAdminSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 24,
  });
}

/** @deprecated use setCustomerSessionCookie */
export async function setSessionCookie(token: string) {
  return setCustomerSessionCookie(token);
}

export async function clearCustomerSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(CUSTOMER_COOKIE);
}

export async function clearAdminSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE);
}

export async function clearSessionCookie() {
  await clearCustomerSessionCookie();
}

export async function loginUser(identifier: string, password: string) {
  const user = await prisma.user.findFirst({
    where: {
      OR: [{ username: identifier }, { email: identifier }],
    },
  });
  if (!user?.passwordHash) return null;
  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) return null;
  return user;
}

export async function loginAdmin(identifier: string, password: string) {
  const user = await loginUser(identifier, password);
  if (!user) return null;
  if (user.role !== "ADMIN" && user.role !== "STAFF") return null;
  return user;
}

export async function loginCustomer(identifier: string, password: string) {
  const user = await loginUser(identifier, password);
  if (!user) return null;
  if (user.role !== "CUSTOMER") return null;
  return user;
}
