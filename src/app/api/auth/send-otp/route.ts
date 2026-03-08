import { NextRequest, NextResponse } from "next/server";
import { storeOtp, getUserByPhone } from "@/lib/auth";
import { sendWhatsAppMessage } from "@/lib/whatsapp";

export async function POST(req: NextRequest) {
  try {
    const { phone, purpose } = await req.json();

    if (!phone) {
      return NextResponse.json({ error: "Phone required" }, { status: 400 });
    }

    // For reset: check user exists
    if (purpose === "reset") {
      const user = getUserByPhone(phone);
      if (!user) {
        return NextResponse.json({ error: "Phone not found" }, { status: 404 });
      }
    }

    // For register: check user doesn't exist
    if (purpose === "register") {
      const user = getUserByPhone(phone);
      if (user) {
        return NextResponse.json({ error: "Phone already registered" }, { status: 409 });
      }
    }

    // Generate 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    storeOtp(phone, code);

    // Send via WhatsApp
    const waToken = process.env.WHATSAPP_TOKEN;
    const waPhoneId = process.env.WHATSAPP_PHONE_ID;

    if (waToken && waPhoneId) {
      await sendWhatsAppMessage(
        phone,
        `PoolPros - Your verification code is: *${code}*\n\nThis code expires in 5 minutes.\n\nرمز التحقق الخاص بك: *${code}*\nينتهي خلال 5 دقائق.`
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 });
  }
}
