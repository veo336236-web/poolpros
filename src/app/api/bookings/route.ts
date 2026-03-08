import { NextRequest, NextResponse } from "next/server";
import { ensureDb } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { sendWhatsAppMessage } from "@/lib/whatsapp";

// GET — list bookings for current user (customer sees their bookings, partner sees incoming requests)
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await ensureDb();

    if (user.role === "partner") {
      const all = await db.execute("SELECT * FROM Booking ORDER BY createdAt DESC");
      return NextResponse.json(all.rows);
    }

    // Customers see their own bookings
    const bookings = await db.execute({
      sql: "SELECT * FROM Booking WHERE customerId = ? ORDER BY createdAt DESC",
      args: [user.id],
    });

    return NextResponse.json(bookings.rows);
  } catch (err) {
    console.error("Bookings GET error:", err);
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
  }
}

// POST — create a new booking request
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { providerId, providerName, serviceId, serviceName, preferredDate, notes } = await req.json();

    if (!providerId || !serviceId || !serviceName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const db = await ensureDb();
    const result = await db.execute({
      sql: `INSERT INTO Booking (customerId, customerName, customerPhone, providerId, providerName, serviceId, serviceName, preferredDate, notes, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      args: [
        user.id, user.name, user.phone,
        providerId, providerName || "", serviceId, serviceName,
        preferredDate || "", notes || "",
      ],
    });

    const bookingId = result.lastInsertRowid;

    // Send WhatsApp notification to provider
    try {
      const providerPhone = "96594770839";
      await sendWhatsAppMessage(
        providerPhone,
        `📋 طلب حجز جديد #${bookingId}\n\n👤 العميل: ${user.name}\n📱 الهاتف: +965${user.phone}\n🔧 الخدمة: ${serviceName}\n📅 التاريخ: ${preferredDate || "غير محدد"}\n📝 ملاحظات: ${notes || "لا يوجد"}\n\n━━━━━━━━━━\n✅ للقبول أرسل: قبول ${bookingId}\n❌ للرفض أرسل: رفض ${bookingId} السبب\n📋 عرض الكل: حجوزات`
      );
    } catch (e) {
      console.error("WhatsApp notification error:", e);
    }

    const booking = await db.execute({
      sql: "SELECT * FROM Booking WHERE id = ?",
      args: [bookingId!],
    });
    return NextResponse.json({ success: true, booking: booking.rows[0] });
  } catch (err) {
    console.error("Bookings POST error:", err);
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });
  }
}

// PATCH — update booking status (approve/reject/complete)
export async function PATCH(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { bookingId, status, rejectionReason } = await req.json();

    if (!bookingId || !status) {
      return NextResponse.json({ error: "Missing bookingId or status" }, { status: 400 });
    }

    const validStatuses = ["confirmed", "rejected", "completed", "cancelled"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const db = await ensureDb();
    const bookingResult = await db.execute({
      sql: "SELECT * FROM Booking WHERE id = ?",
      args: [bookingId],
    });
    const booking = bookingResult.rows[0] as unknown as {
      id: number; customerId: number; customerPhone: string; customerName: string;
      serviceName: string; providerName: string; status: string;
    } | undefined;

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (status === "cancelled" && booking.customerId !== user.id) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    await db.execute({
      sql: "UPDATE Booking SET status = ?, rejectionReason = ?, updatedAt = datetime('now') WHERE id = ?",
      args: [status, rejectionReason || "", bookingId],
    });

    // Send WhatsApp notification to customer
    try {
      const customerPhone = `965${booking.customerPhone}`;
      if (status === "confirmed") {
        await sendWhatsAppMessage(
          customerPhone,
          `✅ تم قبول حجزك!\n\n🔧 الخدمة: ${booking.serviceName}\n🏢 مزود الخدمة: ${booking.providerName}\n\nسيتم التواصل معك قريباً لتأكيد التفاصيل.`
        );
      } else if (status === "rejected") {
        await sendWhatsAppMessage(
          customerPhone,
          `❌ تم رفض طلب الحجز\n\n🔧 الخدمة: ${booking.serviceName}\n${rejectionReason ? `📝 السبب: ${rejectionReason}` : ""}\n\nيمكنك تجربة مزود خدمة آخر على poolpros.kw/explore`
        );
      } else if (status === "completed") {
        await sendWhatsAppMessage(
          customerPhone,
          `🎉 تم إنجاز الخدمة!\n\n🔧 الخدمة: ${booking.serviceName}\n\nشكراً لاستخدام بول بروز! يمكنك تقييم الخدمة على موقعنا.`
        );
      }
    } catch (e) {
      console.error("WhatsApp notification error:", e);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Bookings PATCH error:", err);
    return NextResponse.json({ error: "Failed to update booking" }, { status: 500 });
  }
}
