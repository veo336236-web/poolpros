import { NextResponse } from "next/server";
import { generateAIResponse } from "@/lib/whatsapp";

export async function GET() {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_ID;
  const geminiKey = process.env.GEMINI_API_KEY;

  let aiReply = "";
  let aiError = "";
  try {
    aiReply = await generateAIResponse("Hello");
  } catch (e) {
    aiError = String(e);
  }

  // Test sending a message
  let sendResult = null;
  if (token && phoneId) {
    try {
      const res = await fetch(`https://graph.facebook.com/v22.0/${phoneId}/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: "96594770839",
          type: "text",
          text: { body: "Debug test from PoolPros" },
        }),
      });
      sendResult = await res.json();
    } catch (e) {
      sendResult = { error: String(e) };
    }
  }

  return NextResponse.json({
    env: {
      WHATSAPP_TOKEN: token ? `${token.slice(0, 10)}...` : "MISSING",
      WHATSAPP_PHONE_ID: phoneId || "MISSING",
      GEMINI_API_KEY: geminiKey ? `${geminiKey.slice(0, 10)}...` : "MISSING",
    },
    aiReply: aiReply || null,
    aiError: aiError || null,
    sendResult,
  });
}
