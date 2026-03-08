import { NextRequest, NextResponse } from "next/server";
import { sendWhatsAppMessage, sendWhatsAppOTP } from "@/lib/whatsapp";

export async function GET(req: NextRequest) {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_ID;
  const otpTemplate = process.env.WHATSAPP_OTP_TEMPLATE;
  const testPhone = req.nextUrl.searchParams.get("phone") || "96594770839";

  // Test 1: Check env vars
  const envCheck = {
    WHATSAPP_TOKEN: token ? `${token.slice(0, 15)}...` : "❌ MISSING",
    WHATSAPP_PHONE_ID: phoneId || "❌ MISSING",
    WHATSAPP_OTP_TEMPLATE: otpTemplate || "not set (will use text mode)",
  };

  // Test 2: Send a text message
  let textResult = null;
  if (token && phoneId) {
    try {
      textResult = await sendWhatsAppMessage(testPhone, "🔧 PoolPros WhatsApp Test - تجربة الواتساب");
    } catch (e) {
      textResult = { error: String(e) };
    }
  }

  // Test 3: Send OTP test
  let otpResult = null;
  if (token && phoneId) {
    try {
      otpResult = await sendWhatsAppOTP(testPhone, "123456");
    } catch (e) {
      otpResult = { error: String(e) };
    }
  }

  return NextResponse.json({
    env: envCheck,
    testPhone,
    textMessageResult: textResult,
    otpResult,
    diagnosis: getDiagnosis(textResult, otpResult),
  });
}

function getDiagnosis(textResult: unknown, otpResult: unknown): string {
  const text = textResult as Record<string, unknown> | null;
  const otp = otpResult as Record<string, unknown> | null;

  if (!text) return "❌ WhatsApp credentials missing. Set WHATSAPP_TOKEN and WHATSAPP_PHONE_ID in Vercel env vars.";

  const textErr = text?.error as Record<string, unknown> | undefined;
  const otpErr = otp?.error as Record<string, unknown> | undefined;

  if (textErr) {
    const code = textErr.code;
    const msg = textErr.message || JSON.stringify(textErr);
    if (code === 190) return `❌ Access token expired or invalid. Generate a new token in Meta Business > WhatsApp > API Setup. Error: ${msg}`;
    if (code === 131030) return `❌ Phone number not registered on WhatsApp. Error: ${msg}`;
    if (code === 131047) return `❌ 24-hour window expired. Need to use message templates. Create an OTP template in Meta Business. Error: ${msg}`;
    if (code === 131026) return `❌ Message not sent — recipient not opted in. Error: ${msg}`;
    if (code === 100) return `❌ Invalid parameter. Check WHATSAPP_PHONE_ID. Error: ${msg}`;
    return `❌ WhatsApp API error (code ${code}): ${msg}`;
  }

  if (text?.messages) {
    if (otpErr) return `✅ Text messages work, but OTP template failed. Set up an authentication template in Meta Business or leave WHATSAPP_OTP_TEMPLATE empty to use text mode.`;
    return "✅ WhatsApp is working! Both text and OTP messages sent successfully.";
  }

  return `⚠️ Unknown response: ${JSON.stringify(text)}`;
}
