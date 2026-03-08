import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { sendWhatsAppMessage } from "@/lib/whatsapp";

// GET — list bookings for current user (customer sees their bookings, partner sees incoming requests)
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getDb();

    if (user.role === "partner") {
      // Partners see bookings for their phone number (matched by provider whatsapp)
      const bookings = db.prepare(
        "SELECT * FROM Booking WHERE providerId IN (SELECT id FROM User WHERE phone = ?) OR providerId = ? ORDER BY createdAt DESC"
      ).all(user.phone, String(user.id));

      // Also get bookings where providerName matches their businessName
      const byName = db.prepare(
        "SELECT * FROM Booking WHERE providerName = ? OR providerName = ? ORDER BY createdAt DESC"
      ).all(user.businessName, user.name);

      // Merge and deduplicate
      const allBookings = [...bookings];
      const existingIds = new Set(allBookings.map((b: unknown) => (b as { id: number }).id));
      for (const b of byName) {
        if (!existingIds.has((b as { id: number }).id)) {
          allBookings.push(b);
        }
      }

      // For now, since providers are mock data, match all bookings to the partner
      // In production, this would be filtered by actual provider-user mapping
      const all = db.prepare("SELECT * FROM Booking ORDER BY createdAt DESC").all();
      return NextResponse.json(all);
    }

    // Customers see their own bookings
    const bookings = db.prepare(
      "SELECT * FROM Booking WHERE customerId = ? ORDER BY createdAt DESC"
    ).all(user.id);

    return NextResponse.json(bookings);
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

    const db = getDb();
    const stmt = db.prepare(
      `INSERT INTO Booking (customerId, customerName, customerPhone, providerId, providerName, serviceId, serviceName, preferredDate, notes, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`
    );
    const result = stmt.run(
      user.id,
      user.name,
      user.phone,
      providerId,
      providerName || "",
      serviceId,
      serviceName,
      preferredDate || "",
      notes || ""
    );

    // Send WhatsApp notification to provider (your number)
    const bookingId = result.lastInsertRowid;
    try {
      const providerPhone = "96594770839";
      await sendWhatsAppMessage(
        providerPhone,
        `📋 طلب حجز جديد #${bookingId}\n\n👤 العميل: ${user.name}\n📱 الهاتف: +965${user.phone}\n🔧 الخدمة: ${serviceName}\n📅 التاريخ: ${preferredDate || "غير محدد"}\n📝 ملاحظات: ${notes || "لا يوجد"}\n\n━━━━━━━━━━\n✅ للقبول أرسل: قبول ${bookingId}\n❌ للرفض أرسل: رفض ${bookingId} السبب\n📋 عرض الكل: حجوزات`
      );
    } catch (e) {
      console.error("WhatsApp notification error:", e);
    }

    const booking = db.prepare("SELECT * FROM Booking WHERE id = ?").get(result.lastInsertRowid);
    return NextResponse.json({ success: true, booking });
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

    const db = getDb();
    const booking = db.prepare("SELECT * FROM Booking WHERE id = ?").get(bookingId) as {
      id: number; customerId: number; customerPhone: string; customerName: string;
      serviceName: string; providerName: string; status: string;
    } | undefined;

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Partners can approve/reject, customers can cancel their own
    if (status === "cancelled" && booking.customerId !== user.id) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    db.prepare(
      "UPDATE Booking SET status = ?, rejectionReason = ?, updatedAt = datetime('now') WHERE id = ?"
    ).run(status, rejectionReason || "", bookingId);

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
