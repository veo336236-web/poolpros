import { NextRequest, NextResponse } from "next/server";
import {
  sendWhatsAppMessage,
  generateAIResponse,
  generateCallTwiML,
} from "@/lib/whatsapp";
import { getDb } from "@/lib/db";

const PARTNER_PHONE = "96594770839";

// GET - Webhook verification (required by Meta)
export async function GET(req: NextRequest) {
  const mode = req.nextUrl.searchParams.get("hub.mode");
  const token = req.nextUrl.searchParams.get("hub.verify_token");
  const challenge = req.nextUrl.searchParams.get("hub.challenge");

  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || "poolpros_verify_2024";

  if (mode === "subscribe" && token === verifyToken) {
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

// Handle booking commands from partner via WhatsApp
async function handleBookingCommand(text: string, from: string): Promise<string | null> {
  // Only the partner can manage bookings
  if (from !== PARTNER_PHONE) return null;

  const trimmed = text.trim();

  // "قبول 5" or "approve 5"
  const approveMatch = trimmed.match(/^(?:قبول|approve|ok|نعم|yes)\s+(\d+)$/i);
  if (approveMatch) {
    const bookingId = parseInt(approveMatch[1]);
    return await updateBookingViaWhatsApp(bookingId, "confirmed");
  }

  // "رفض 5 السبب" or "reject 5 reason"
  const rejectMatch = trimmed.match(/^(?:رفض|reject|no|لا)\s+(\d+)\s*(.*)$/i);
  if (rejectMatch) {
    const bookingId = parseInt(rejectMatch[1]);
    const reason = rejectMatch[2]?.trim() || "";
    return await updateBookingViaWhatsApp(bookingId, "rejected", reason);
  }

  // "تم 5" or "done 5" — mark complete
  const doneMatch = trimmed.match(/^(?:تم|done|complete|إنجاز)\s+(\d+)$/i);
  if (doneMatch) {
    const bookingId = parseInt(doneMatch[1]);
    return await updateBookingViaWhatsApp(bookingId, "completed");
  }

  // "حجوزات" or "bookings" — list pending bookings
  if (/^(?:حجوزات|bookings|طلبات|pending)$/i.test(trimmed)) {
    return listPendingBookings();
  }

  return null; // Not a booking command
}

async function updateBookingViaWhatsApp(bookingId: number, status: string, reason?: string): Promise<string> {
  try {
    const db = getDb();
    const booking = db.prepare("SELECT * FROM Booking WHERE id = ?").get(bookingId) as {
      id: number; customerPhone: string; customerName: string;
      serviceName: string; providerName: string; status: string;
    } | undefined;

    if (!booking) {
      return `❌ الحجز رقم ${bookingId} غير موجود\nBooking #${bookingId} not found`;
    }

    if (booking.status !== "pending" && status === "confirmed") {
      return `⚠️ الحجز رقم ${bookingId} حالته "${booking.status}" وليس "قيد الانتظار"\nBooking #${bookingId} is "${booking.status}", not "pending"`;
    }

    db.prepare(
      "UPDATE Booking SET status = ?, rejectionReason = ?, updatedAt = datetime('now') WHERE id = ?"
    ).run(status, reason || "", bookingId);

    // Notify customer
    const customerPhone = `965${booking.customerPhone}`;
    if (status === "confirmed") {
      await sendWhatsAppMessage(
        customerPhone,
        `✅ تم قبول حجزك!\n\n🔧 الخدمة: ${booking.serviceName}\n🏢 مزود الخدمة: ${booking.providerName}\n\nسيتم التواصل معك قريباً لتأكيد التفاصيل.\n\n---\n✅ Your booking has been approved!\n\n🔧 Service: ${booking.serviceName}\n🏢 Provider: ${booking.providerName}\n\nWe'll contact you soon to confirm details.`
      );
      return `✅ تم قبول الحجز رقم ${bookingId} بنجاح\nتم إبلاغ العميل ${booking.customerName}\n\n✅ Booking #${bookingId} approved\nCustomer ${booking.customerName} notified`;
    } else if (status === "rejected") {
      await sendWhatsAppMessage(
        customerPhone,
        `❌ تم رفض طلب الحجز\n\n🔧 الخدمة: ${booking.serviceName}\n${reason ? `📝 السبب: ${reason}` : ""}\n\nيمكنك تجربة مزود خدمة آخر.\n\n---\n❌ Your booking request was declined\n\n🔧 Service: ${booking.serviceName}\n${reason ? `📝 Reason: ${reason}` : ""}\n\nYou can try another service provider.`
      );
      return `❌ تم رفض الحجز رقم ${bookingId}\nتم إبلاغ العميل ${booking.customerName}\n\n❌ Booking #${bookingId} rejected\nCustomer ${booking.customerName} notified`;
    } else if (status === "completed") {
      await sendWhatsAppMessage(
        customerPhone,
        `🎉 تم إنجاز الخدمة!\n\n🔧 الخدمة: ${booking.serviceName}\n\nشكراً لاستخدام بول بروز! يمكنك تقييم الخدمة على موقعنا.\n\n---\n🎉 Service completed!\n\n🔧 Service: ${booking.serviceName}\n\nThank you for using PoolPros! You can rate the service on our website.`
      );
      return `🎉 تم تحديث الحجز رقم ${bookingId} كمكتمل\n\n🎉 Booking #${bookingId} marked as completed`;
    }

    return `✅ تم تحديث الحجز رقم ${bookingId}`;
  } catch (err) {
    console.error("Booking WhatsApp update error:", err);
    return `❌ حدث خطأ أثناء تحديث الحجز\nError updating booking`;
  }
}

function listPendingBookings(): string {
  try {
    const db = getDb();
    const pending = db.prepare(
      "SELECT * FROM Booking WHERE status = 'pending' ORDER BY createdAt DESC LIMIT 10"
    ).all() as { id: number; customerName: string; serviceName: string; preferredDate: string; createdAt: string }[];

    if (pending.length === 0) {
      return "📋 لا توجد حجوزات قيد الانتظار\n\n📋 No pending bookings";
    }

    let msg = `📋 حجوزات قيد الانتظار (${pending.length}):\n\n`;
    for (const b of pending) {
      msg += `🔹 #${b.id} - ${b.serviceName}\n   👤 ${b.customerName}\n   📅 ${b.preferredDate || "غير محدد"}\n\n`;
    }
    msg += `\n✅ للقبول: "قبول [رقم]"\n❌ للرفض: "رفض [رقم] السبب"\n\n✅ To approve: "approve [number]"\n❌ To reject: "reject [number] reason"`;

    return msg;
  } catch (err) {
    console.error("List bookings error:", err);
    return "❌ حدث خطأ\nError fetching bookings";
  }
}

// POST - Receive incoming WhatsApp messages + Twilio voice calls
export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";

    // ── Twilio voice call (form-encoded) ──
    if (contentType.includes("application/x-www-form-urlencoded")) {
      const formData = await req.formData();
      const from = formData.get("From") as string;

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

    const waToken = process.env.WHATSAPP_TOKEN;
    const waPhoneId = process.env.WHATSAPP_PHONE_ID;

    if (!waToken || !waPhoneId) {
      console.log("WhatsApp not configured:", { token: !!waToken, phoneId: !!waPhoneId });
      return NextResponse.json({ status: "ok" });
    }

    // Check if this is a booking command from the partner
    const bookingReply = await handleBookingCommand(messageText, from);
    if (bookingReply) {
      await sendWhatsAppMessage(from, bookingReply);
      return NextResponse.json({ status: "ok" });
    }

    // Generate AI response (Gemini) for regular messages
    const reply = await generateAIResponse(messageText);
    const result = await sendWhatsAppMessage(from, reply);
    console.log("WhatsApp send result:", JSON.stringify(result));

    return NextResponse.json({ status: "ok" });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json({ status: "error" }, { status: 500 });
  }
}
