import { NextRequest, NextResponse } from "next/server";
import { ensureDb } from "@/lib/db";

// POST — Tap Payments webhook (called after payment completes)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const chargeId = body.id;
    const status = body.status;

    if (!chargeId) {
      return NextResponse.json({ error: "Missing charge ID" }, { status: 400 });
    }

    const db = await ensureDb();

    // Find payment by Tap charge ID
    const paymentResult = await db.execute({
      sql: "SELECT * FROM Payment WHERE tapChargeId = ?",
      args: [chargeId],
    });
    const payment = paymentResult.rows[0] as unknown as {
      id: number; bookingId: number; status: string;
    } | undefined;

    if (!payment) {
      console.error("Payment not found for charge:", chargeId);
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    // Map Tap status to our status
    let paymentStatus = "pending";
    if (status === "CAPTURED") paymentStatus = "paid";
    else if (status === "FAILED" || status === "DECLINED") paymentStatus = "failed";
    else if (status === "CANCELLED") paymentStatus = "cancelled";

    // Update payment
    await db.execute({
      sql: "UPDATE Payment SET status = ?, method = ?, transactionId = ?, updatedAt = datetime('now') WHERE id = ?",
      args: [paymentStatus, body.source?.payment_method || "", body.reference?.payment || "", payment.id],
    });

    // If paid, update booking status to confirmed
    if (paymentStatus === "paid") {
      await db.execute({
        sql: "UPDATE Booking SET status = 'confirmed', updatedAt = datetime('now') WHERE id = ? AND status = 'pending'",
        args: [payment.bookingId],
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Payment webhook error:", err);
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}
