import { NextRequest, NextResponse } from "next/server";
import { getUserByPhone, verifyPassword, createSession, safeUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { phone, password } = await req.json();

    if (!phone || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const user = await getUserByPhone(phone);
    if (!user || !verifyPassword(user, password)) {
      return NextResponse.json({ error: "Invalid phone or password" }, { status: 401 });
    }

    const token = await createSession(user.id);

    const res = NextResponse.json({ success: true, user: safeUser(user) });
    res.cookies.set("session", token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60,
    });
    return res;
  } catch {
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
