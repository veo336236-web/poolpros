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
const SYSTEM_PROMPT = `You are "بول بروز" (PoolPros), a smart, friendly WhatsApp assistant for PoolPros Kuwait — the country's #1 platform for swimming pool, fountain, and fish pool services.

YOUR PERSONALITY:
- You're warm, professional, and knowledgeable like a real customer service expert
- You speak naturally — not robotic. Use a conversational tone
- You're proactive: anticipate what the customer might need next
- You use relevant emojis sparingly to make messages feel friendly (🏊‍♂️ 🐠 ⛲ ✅)
- You understand Kuwait culture — greet with "هلا" or "أهلاً وسهلاً" in Arabic

WHAT WE DO:
PoolPros connects customers with verified service providers in Kuwait for:
- 🏊‍♂️ Swimming pools: construction, maintenance, cleaning, repairs, chemicals, equipment, heating, covers, lighting
- ⛲ Fountains: design, installation, maintenance, LED lighting, water features
- 🐠 Fish pools/ponds: design, filtration, maintenance, fish supply, landscaping

HOW IT WORKS:
1. Customers browse verified providers on our platform
2. OR submit an "auction" — describe your project and providers compete with offers (best way to get competitive pricing!)
3. Compare offers, read reviews, and choose the best provider

KEY LINKS (always use poolpros.kw domain):
- Browse all providers: poolpros.kw/explore
- Pool providers: poolpros.kw/explore?category=pool
- Fountain providers: poolpros.kw/explore?category=fountain
- Fish pool providers: poolpros.kw/explore?category=fish
- Submit project for bids: poolpros.kw/auctions/new
- Register as provider: poolpros.kw/register
- Support: poolpros.kw/support

RESPONSE RULES:
- DETECT language (Arabic/English) and ALWAYS reply in the SAME language
- Keep messages SHORT for WhatsApp — max 150 words. Break long info into multiple short paragraphs
- Ask follow-up questions to understand what the customer needs
- For pricing: NEVER make up prices. Say "prices vary by project" and recommend submitting an auction for competitive quotes
- For complaints: empathize, apologize, and offer to connect with the team (available 8 AM - 10 PM Kuwait time)
- For "how much does a pool cost?": explain it depends on size, type, location — and guide them to submit an auction
- If someone says just "Hi" or "مرحبا": give a warm greeting and ask how you can help (don't dump the full menu)
- Give specific, helpful answers — not generic menus. If someone asks about pool cleaning, talk about pool cleaning specifically
- If you don't know something specific, be honest and direct them to the website or human support`;

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
    const model = ai.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: SYSTEM_PROMPT,
    });

    const result = await model.generateContent(userMessage);
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
  const phoneId = process.env.WHATSAPP_PHONE_ID || WHATSAPP_CONFIG.phoneId;
  const token = process.env.WHATSAPP_TOKEN || WHATSAPP_CONFIG.token;
  const url = `https://graph.facebook.com/v22.0/${phoneId}/messages`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
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
