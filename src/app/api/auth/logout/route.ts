import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { deleteSession } from "@/lib/auth";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;
    if (token) deleteSession(token);

    const res = NextResponse.json({ success: true });
    res.cookies.set("session", "", { httpOnly: true, path: "/", maxAge: 0 });
    return res;
  } catch {
    return NextResponse.json({ error: "Logout failed" }, { status: 500 });
  }
}
