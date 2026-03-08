import { NextRequest, NextResponse } from "next/server";
import { storeOtp, getUserByPhone } from "@/lib/auth";
import { sendWhatsAppOTP } from "@/lib/whatsapp";

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

    // Send OTP via WhatsApp (required for all registrations)
    const waToken = process.env.WHATSAPP_TOKEN;
    const waPhoneId = process.env.WHATSAPP_PHONE_ID;

    if (!waToken || !waPhoneId) {
      console.error("WhatsApp not configured - WHATSAPP_TOKEN or WHATSAPP_PHONE_ID missing");
      return NextResponse.json({ error: "WhatsApp service not configured" }, { status: 500 });
    }

    const result = await sendWhatsAppOTP(phone, code);
    console.log("OTP WhatsApp result:", JSON.stringify(result));

    if (result?.error) {
      console.error("WhatsApp OTP send error:", result.error);
      return NextResponse.json({ error: "فشل إرسال رمز التحقق عبر الواتساب. حاول مرة أخرى." }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Send OTP error:", err);
    return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 });
  }
}
