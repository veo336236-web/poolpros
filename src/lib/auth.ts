import { getDb } from "./db";
import crypto from "crypto";
import { cookies } from "next/headers";

export interface UserRow {
  id: number;
  name: string;
  phone: string;
  passwordHash: string;
  salt: string;
  role: "customer" | "partner" | "admin";
  businessName: string;
  createdAt: string;
}

export interface SessionRow {
  id: number;
  token: string;
  userId: number;
  expiresAt: string;
}

function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex");
}

export function createUser(
  name: string,
  phone: string,
  password: string,
  role: "customer" | "partner" = "customer",
  businessName = ""
): UserRow {
  const db = getDb();
  const salt = crypto.randomBytes(16).toString("hex");
  const passwordHash = hashPassword(password, salt);

  const stmt = db.prepare(
    `INSERT INTO User (name, phone, passwordHash, salt, role, businessName)
     VALUES (?, ?, ?, ?, ?, ?)`
  );
  const result = stmt.run(name, phone, passwordHash, salt, role, businessName);
  return db.prepare("SELECT * FROM User WHERE id = ?").get(result.lastInsertRowid) as UserRow;
}

export function verifyPassword(user: UserRow, password: string): boolean {
  const hash = hashPassword(password, user.salt);
  return hash === user.passwordHash;
}

export function createSession(userId: number): string {
  const db = getDb();
  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days

  db.prepare(
    "INSERT INTO Session (token, userId, expiresAt) VALUES (?, ?, ?)"
  ).run(token, userId, expiresAt);

  return token;
}

export function getUserByPhone(phone: string): UserRow | undefined {
  const db = getDb();
  return db.prepare("SELECT * FROM User WHERE phone = ?").get(phone) as UserRow | undefined;
}

export function getUserBySession(token: string): UserRow | null {
  const db = getDb();
  const session = db.prepare(
    "SELECT * FROM Session WHERE token = ? AND expiresAt > datetime('now')"
  ).get(token) as SessionRow | undefined;

  if (!session) return null;

  const user = db.prepare("SELECT * FROM User WHERE id = ?").get(session.userId) as UserRow | undefined;
  return user || null;
}

export function deleteSession(token: string) {
  const db = getDb();
  db.prepare("DELETE FROM Session WHERE token = ?").run(token);
}

export async function getCurrentUser(): Promise<UserRow | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  if (!token) return null;
  return getUserBySession(token);
}

export function safeUser(user: UserRow) {
  return {
    id: user.id,
    name: user.name,
    phone: user.phone,
    role: user.role,
    businessName: user.businessName,
    createdAt: user.createdAt,
  };
}
