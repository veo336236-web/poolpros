import { ensureDb } from "./db";
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
  categories: string;
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

export async function createUser(
  name: string,
  phone: string,
  password: string,
  role: "customer" | "partner" = "customer",
  businessName = "",
  categories = ""
): Promise<UserRow> {
  const db = await ensureDb();
  const salt = crypto.randomBytes(16).toString("hex");
  const passwordHash = hashPassword(password, salt);

  const result = await db.execute({
    sql: `INSERT INTO User (name, phone, passwordHash, salt, role, businessName, categories) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    args: [name, phone, passwordHash, salt, role, businessName, categories],
  });

  const row = await db.execute({
    sql: "SELECT * FROM User WHERE id = ?",
    args: [result.lastInsertRowid!],
  });
  return row.rows[0] as unknown as UserRow;
}

export function verifyPassword(user: UserRow, password: string): boolean {
  const hash = hashPassword(password, user.salt);
  return hash === user.passwordHash;
}

export async function createSession(userId: number): Promise<string> {
  const db = await ensureDb();
  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  await db.execute({
    sql: "INSERT INTO Session (token, userId, expiresAt) VALUES (?, ?, ?)",
    args: [token, userId, expiresAt],
  });

  return token;
}

export async function getUserByPhone(phone: string): Promise<UserRow | undefined> {
  const db = await ensureDb();
  const result = await db.execute({
    sql: "SELECT * FROM User WHERE phone = ?",
    args: [phone],
  });
  return result.rows[0] as unknown as UserRow | undefined;
}

export async function getUserBySession(token: string): Promise<UserRow | null> {
  const db = await ensureDb();
  const sessionResult = await db.execute({
    sql: "SELECT * FROM Session WHERE token = ? AND expiresAt > datetime('now')",
    args: [token],
  });

  const session = sessionResult.rows[0] as unknown as SessionRow | undefined;
  if (!session) return null;

  const userResult = await db.execute({
    sql: "SELECT * FROM User WHERE id = ?",
    args: [session.userId],
  });

  return (userResult.rows[0] as unknown as UserRow) || null;
}

export async function deleteSession(token: string): Promise<void> {
  const db = await ensureDb();
  await db.execute({
    sql: "DELETE FROM Session WHERE token = ?",
    args: [token],
  });
}

export async function getCurrentUser(): Promise<UserRow | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  if (!token) return null;
  return getUserBySession(token);
}

export async function storeOtp(phone: string, code: string): Promise<void> {
  const db = await ensureDb();
  await db.execute({ sql: "DELETE FROM Otp WHERE phone = ?", args: [phone] });
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
  await db.execute({
    sql: "INSERT INTO Otp (phone, code, expiresAt) VALUES (?, ?, ?)",
    args: [phone, code, expiresAt],
  });
}

export async function verifyOtp(phone: string, code: string): Promise<boolean> {
  const db = await ensureDb();
  try {
    const result = await db.execute({
      sql: "SELECT * FROM Otp WHERE phone = ? AND code = ? AND expiresAt > datetime('now')",
      args: [phone, code],
    });
    if (result.rows[0]) {
      await db.execute({ sql: "DELETE FROM Otp WHERE phone = ?", args: [phone] });
      return true;
    }
  } catch { /* table might not exist */ }
  return false;
}

export async function resetPassword(phone: string, newPassword: string): Promise<boolean> {
  const db = await ensureDb();
  const salt = crypto.randomBytes(16).toString("hex");
  const passwordHash = hashPassword(newPassword, salt);
  const result = await db.execute({
    sql: "UPDATE User SET passwordHash = ?, salt = ? WHERE phone = ?",
    args: [passwordHash, salt, phone],
  });
  return result.rowsAffected > 0;
}

export function safeUser(user: UserRow) {
  return {
    id: user.id,
    name: user.name,
    phone: user.phone,
    role: user.role,
    businessName: user.businessName,
    categories: user.categories || "",
    createdAt: user.createdAt,
  };
}
