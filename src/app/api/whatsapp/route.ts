import { NextRequest, NextResponse } from "next/server";
import {
  WHATSAPP_CONFIG,
  sendWhatsAppMessage,
  generateAIResponse,
  generateCallTwiML,
} from "@/lib/whatsapp";

// GET - Webhook verification (required by Meta)
export async function GET(req: NextRequest) {
  const mode = req.nextUrl.searchParams.get("hub.mode");
  const token = req.nextUrl.searchParams.get("hub.verify_token");
  const challenge = req.nextUrl.searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === WHATSAPP_CONFIG.verifyToken) {
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

// POST - Receive incoming WhatsApp messages + Twilio voice calls
export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";

    // ── Twilio voice call (form-encoded) ──
    if (contentType.includes("application/x-www-form-urlencoded")) {
      const formData = await req.formData();
      const from = formData.get("From") as string;

      // Detect language from caller's country code
      const lang = from?.startsWith("+965") ? "ar" : "en";
      const twiml = generateCallTwiML(lang as "ar" | "en");

      return new NextResponse(twiml, {
        status: 200,
        headers: { "Content-Type": "application/xml" },
      });
    }

    // ── WhatsApp message (JSON) ──
    const body = await req.json();

    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;

    if (!value?.messages?.[0]) {
      return NextResponse.json({ status: "ok" });
    }

    const message = value.messages[0];
    const from = message.from;
    const messageText = message.text?.body || "";

    if (!messageText || !from) {
      return NextResponse.json({ status: "ok" });
    }

    // Generate AI response (Gemini)
    const reply = await generateAIResponse(messageText);

    // Send reply via WhatsApp Cloud API
    if (WHATSAPP_CONFIG.token && WHATSAPP_CONFIG.phoneId) {
      await sendWhatsAppMessage(from, reply);
    }

    return NextResponse.json({ status: "ok" });
  } catch {
    return NextResponse.json({ status: "error" }, { status: 500 });
  }
}
