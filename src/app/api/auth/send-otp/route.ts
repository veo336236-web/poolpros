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
      const user = await getUserByPhone(phone);
      if (!user) {
        return NextResponse.json({ error: "Phone not found" }, { status: 404 });
      }
    }

    // For register: check user doesn't exist
    if (purpose === "register") {
      const user = await getUserByPhone(phone);
      if (user) {
        return NextResponse.json({ error: "Phone already registered" }, { status: 409 });
      }
    }

    // Generate 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    await storeOtp(phone, code);

    // Skip OTP entirely when ENABLE_OTP is not set to "true"
    // This allows registration without WhatsApp verification
    if (process.env.ENABLE_OTP !== "true") {
      console.log("OTP disabled, skipping for:", phone);
      return NextResponse.json({ success: true, skipOtp: true });
    }

    // Send via WhatsApp
    const waToken = process.env.WHATSAPP_TOKEN;
    const waPhoneId = process.env.WHATSAPP_PHONE_ID;

    if (waToken && waPhoneId) {
      const result = await sendWhatsAppMessage(
        phone,
        `PoolPros - Your verification code is: *${code}*\n\nThis code expires in 5 minutes.\n\nرمز التحقق الخاص بك: *${code}*\nينتهي خلال 5 دقائق.`
      );
      console.log("OTP WhatsApp result:", JSON.stringify(result));

      if (result?.error) {
        console.error("WhatsApp OTP send error:", result.error);
        // If WhatsApp fails, skip OTP so user can still register
        return NextResponse.json({ success: true, skipOtp: true });
      }
      return NextResponse.json({ success: true });
    } else {
      console.log("WhatsApp not configured, skipping OTP for:", phone);
      return NextResponse.json({ success: true, skipOtp: true });
    }
  } catch (err) {
    console.error("Send OTP error:", err);
    return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 });
  }
}
