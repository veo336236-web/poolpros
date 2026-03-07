import { GoogleGenerativeAI } from "@google/generative-ai";

// ── Config ──────────────────────────────────────────────────────
// Set these in your .env.local:
//   WHATSAPP_TOKEN=your_meta_access_token
//   WHATSAPP_PHONE_ID=your_phone_number_id
//   WHATSAPP_VERIFY_TOKEN=poolpros_verify_2024
//   WHATSAPP_NUMBER=96550000000
//   GEMINI_API_KEY=your_google_ai_studio_key
//   TWILIO_ACCOUNT_SID=your_twilio_sid
//   TWILIO_AUTH_TOKEN=your_twilio_auth
//   TWILIO_PHONE_NUMBER=+96550000000

export const WHATSAPP_CONFIG = {
  token: process.env.WHATSAPP_TOKEN || "",
  phoneId: process.env.WHATSAPP_PHONE_ID || "",
  verifyToken: process.env.WHATSAPP_VERIFY_TOKEN || "poolpros_verify_2024",
  number: process.env.WHATSAPP_NUMBER || "96594770839",
  apiUrl: "https://graph.facebook.com/v22.0",
};

// ── Gemini AI ───────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are the AI customer support assistant for PoolPros Kuwait (بول بروز الكويت).

About PoolPros:
- Kuwait's leading platform for swimming pool, fountain, and fish pool services
- We connect customers with verified service providers
- Services: maintenance, cleaning, repairs, equipment, supplies, design, add-ons
- Auctions: customers can submit construction projects (pools, fountains, fish pools) and providers compete with offers
- Website: poolpros.kw

Key pages:
- Browse providers: poolpros.kw/explore
- Pools: poolpros.kw/explore?category=pool
- Fountains: poolpros.kw/explore?category=fountain
- Fish pools: poolpros.kw/explore?category=fish
- Submit auction: poolpros.kw/auctions/new
- Register: poolpros.kw/register
- Support: poolpros.kw/support

Rules:
- Detect the user's language (Arabic or English) and reply in the SAME language
- Be friendly, concise, and helpful
- Always guide users to the relevant page on the website
- For pricing questions, direct them to submit an auction request
- For complaints, apologize and offer to escalate to the human team
- If the user wants to talk to a real person, say the team is available during 8 AM - 10 PM Kuwait time
- Keep responses under 300 words
- Use bullet points and numbered lists for clarity
- Do NOT make up prices or availability — direct users to the platform`;

function getGemini() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  return new GoogleGenerativeAI(key);
}

export async function generateAIResponse(userMessage: string): Promise<string> {
  const ai = getGemini();

  // If Gemini is not configured, use fallback
  if (!ai) {
    console.log("Gemini not configured, GEMINI_API_KEY:", process.env.GEMINI_API_KEY ? "SET" : "MISSING");
    return fallbackResponse(userMessage);
  }

  try {
    const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" });
    const chat = model.startChat({
      history: [
        { role: "user", parts: [{ text: "system instructions" }] },
        { role: "model", parts: [{ text: SYSTEM_PROMPT }] },
      ],
    });

    const result = await chat.sendMessage(userMessage);
    const response = result.response.text();

    if (response && response.trim().length > 0) {
      return response.trim();
    }

    return fallbackResponse(userMessage);
  } catch (err) {
    console.error("Gemini error:", err);
    return fallbackResponse(userMessage);
  }
}

// ── Fallback (no API key) ───────────────────────────────────────
function fallbackResponse(message: string): string {
  const isArabic = /[\u0600-\u06FF]/.test(message);

  return isArabic
    ? "مرحباً بك في بول بروز الكويت!\n\nكيف يمكنني مساعدتك؟\n\n1. خدمات أحواض السباحة\n2. خدمات النوافير\n3. خدمات أحواض الأسماك\n4. المزادات والأسعار\n5. التسجيل كمزود خدمة\n6. الدعم والمساعدة\n\nزر موقعنا: poolpros.kw"
    : "Welcome to PoolPros Kuwait!\n\nHow can I help you?\n\n1. Swimming pool services\n2. Fountain services\n3. Fish pool services\n4. Auctions & pricing\n5. Register as a provider\n6. Support & help\n\nVisit our website: poolpros.kw";
}

// ── Send WhatsApp message ───────────────────────────────────────
export async function sendWhatsAppMessage(to: string, message: string) {
  const url = `${WHATSAPP_CONFIG.apiUrl}/${WHATSAPP_CONFIG.phoneId}/messages`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${WHATSAPP_CONFIG.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body: message },
    }),
  });

  return res.json();
}

// ── Twilio: Generate TwiML for AI voice call ────────────────────
export function generateCallTwiML(lang: "ar" | "en" = "ar"): string {
  const greeting =
    lang === "ar"
      ? "مرحباً بك في بول بروز الكويت. كيف يمكنني مساعدتك؟ تفضل بالتحدث بعد الصافرة."
      : "Welcome to PoolPros Kuwait. How can I help you? Please speak after the beep.";

  // TwiML: greet → gather speech → send to our AI endpoint
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say language="${lang === "ar" ? "ar-SA" : "en-US"}">${greeting}</Say>
  <Gather input="speech" language="${lang === "ar" ? "ar-SA" : "en-US"}" speechTimeout="3" action="/api/whatsapp/voice-reply" method="POST">
    <Say language="${lang === "ar" ? "ar-SA" : "en-US"}">${lang === "ar" ? "أنا أستمع" : "I'm listening"}</Say>
  </Gather>
  <Say language="${lang === "ar" ? "ar-SA" : "en-US"}">${lang === "ar" ? "شكراً لاتصالك. مع السلامة." : "Thank you for calling. Goodbye."}</Say>
</Response>`;
}

// ── Twilio: Generate AI voice reply TwiML ───────────────────────
export async function generateVoiceReplyTwiML(
  speechResult: string,
  lang: "ar" | "en" = "ar"
): Promise<string> {
  // Get AI response for what the caller said
  const aiReply = await generateAIResponse(speechResult);

  // Strip markdown/links for voice (keep it clean for TTS)
  const cleanReply = aiReply
    .replace(/https?:\/\/\S+/g, "")
    .replace(/[*_#]/g, "")
    .replace(/\n+/g, ". ")
    .trim();

  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say language="${lang === "ar" ? "ar-SA" : "en-US"}">${cleanReply}</Say>
  <Gather input="speech" language="${lang === "ar" ? "ar-SA" : "en-US"}" speechTimeout="3" action="/api/whatsapp/voice-reply" method="POST">
    <Say language="${lang === "ar" ? "ar-SA" : "en-US"}">${lang === "ar" ? "هل تحتاج مساعدة أخرى؟" : "Do you need anything else?"}</Say>
  </Gather>
  <Say language="${lang === "ar" ? "ar-SA" : "en-US"}">${lang === "ar" ? "شكراً لاتصالك ببول بروز. مع السلامة." : "Thank you for calling PoolPros. Goodbye."}</Say>
</Response>`;
}
