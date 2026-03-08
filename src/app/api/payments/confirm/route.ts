import { NextRequest, NextResponse } from "next/server";
import { ensureDb } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

// POST — confirm a test payment (when Tap is not configured)
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { paymentId } = await req.json();
    if (!paymentId) {
      return NextResponse.json({ error: "Missing paymentId" }, { status: 400 });
    }

    const db = await ensureDb();

    const paymentResult = await db.execute({
      sql: "SELECT * FROM Payment WHERE id = ? AND customerId = ?",
      args: [paymentId, user.id],
    });
    const payment = paymentResult.rows[0] as unknown as {
      id: number; bookingId: number; status: string;
    } | undefined;

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    // Mark as paid
    await db.execute({
      sql: "UPDATE Payment SET status = 'paid', method = 'test', updatedAt = datetime('now') WHERE id = ?",
      args: [paymentId],
    });

    // Confirm the booking
    await db.execute({
      sql: "UPDATE Booking SET status = 'confirmed', updatedAt = datetime('now') WHERE id = ?",
      args: [payment.bookingId],
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Payment confirm error:", err);
    return NextResponse.json({ error: "Confirm failed" }, { status: 500 });
  }
}
