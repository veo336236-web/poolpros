import { NextRequest, NextResponse } from "next/server";
import { verifyOtp } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { phone, code } = await req.json();

    if (!phone || !code) {
      return NextResponse.json({ error: "Phone and code required" }, { status: 400 });
    }

    const valid = verifyOtp(phone, code);
    if (!valid) {
      return NextResponse.json({ error: "Invalid or expired code" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
