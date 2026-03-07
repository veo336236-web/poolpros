import { NextRequest, NextResponse } from "next/server";
import { generateVoiceReplyTwiML } from "@/lib/whatsapp";

// POST - Twilio sends speech recognition result here
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const speechResult = formData.get("SpeechResult") as string;
    const from = formData.get("From") as string;

    if (!speechResult) {
      const lang = from?.startsWith("+965") ? "ar" : "en";
      const sorry =
        lang === "ar"
          ? "لم أتمكن من سماعك. يرجى المحاولة مرة أخرى."
          : "I couldn't hear you. Please try again.";

      return new NextResponse(
        `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say language="${lang === "ar" ? "ar-SA" : "en-US"}">${sorry}</Say>
  <Gather input="speech" language="${lang === "ar" ? "ar-SA" : "en-US"}" speechTimeout="3" action="/api/whatsapp/voice-reply" method="POST">
    <Say language="${lang === "ar" ? "ar-SA" : "en-US"}">${lang === "ar" ? "تفضل" : "Go ahead"}</Say>
  </Gather>
</Response>`,
        { status: 200, headers: { "Content-Type": "application/xml" } }
      );
    }

    // Detect language from speech or phone number
    const isArabic = /[\u0600-\u06FF]/.test(speechResult) || from?.startsWith("+965");
    const lang = isArabic ? "ar" : "en";

    const twiml = await generateVoiceReplyTwiML(speechResult, lang as "ar" | "en");

    return new NextResponse(twiml, {
      status: 200,
      headers: { "Content-Type": "application/xml" },
    });
  } catch {
    return new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>An error occurred. Please try again later.</Say>
</Response>`,
      { status: 200, headers: { "Content-Type": "application/xml" } }
    );
  }
}
