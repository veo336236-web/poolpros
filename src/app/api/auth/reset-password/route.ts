import { NextRequest, NextResponse } from "next/server";
import { verifyOtp, resetPassword } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { phone, code, newPassword } = await req.json();

    if (!phone || !code || !newPassword) {
      return NextResponse.json({ error: "All fields required" }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    const valid = await verifyOtp(phone, code);
    if (!valid) {
      return NextResponse.json({ error: "Invalid or expired code" }, { status: 400 });
    }

    const success = await resetPassword(phone, newPassword);
    if (!success) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Reset failed" }, { status: 500 });
  }
}
