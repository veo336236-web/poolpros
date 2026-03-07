import { NextRequest, NextResponse } from "next/server";
import { createUser, getUserByPhone, createSession, safeUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { name, phone, password, role, businessName } = await req.json();

    if (!name || !phone || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    const existing = getUserByPhone(phone);
    if (existing) {
      return NextResponse.json({ error: "Phone number already registered" }, { status: 409 });
    }

    const validRole = role === "partner" ? "partner" : "customer";
    const user = createUser(name, phone, password, validRole, businessName || "");
    const token = createSession(user.id);

    const res = NextResponse.json({ success: true, user: safeUser(user) });
    res.cookies.set("session", token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60,
    });
    return res;
  } catch {
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
