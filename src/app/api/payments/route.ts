import { NextRequest, NextResponse } from "next/server";
import { ensureDb } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

const TAP_SECRET_KEY = process.env.TAP_SECRET_KEY || "";
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://poolpros-blue.vercel.app";

// POST — create a payment (Tap Payments charge)
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { bookingId, amount } = await req.json();

    if (!bookingId || !amount || amount <= 0) {
      return NextResponse.json({ error: "Missing bookingId or amount" }, { status: 400 });
    }

    const db = await ensureDb();

    // Verify booking exists and belongs to this user
    const bookingResult = await db.execute({
      sql: "SELECT * FROM Booking WHERE id = ? AND customerId = ?",
      args: [bookingId, user.id],
    });
    const booking = bookingResult.rows[0];
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Check if already paid
    const existingPayment = await db.execute({
      sql: "SELECT * FROM Payment WHERE bookingId = ? AND status = 'paid'",
      args: [bookingId],
    });
    if (existingPayment.rows[0]) {
      return NextResponse.json({ error: "Already paid" }, { status: 400 });
    }

    // Create payment record
    const paymentResult = await db.execute({
      sql: "INSERT INTO Payment (bookingId, customerId, amount, status) VALUES (?, ?, ?, 'pending')",
      args: [bookingId, user.id, amount],
    });
    const paymentId = paymentResult.lastInsertRowid;

    // If Tap is configured, create a charge
    if (TAP_SECRET_KEY) {
      const tapResponse = await fetch("https://api.tap.company/v2/charges", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${TAP_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: amount,
          currency: "KWD",
          customer_initiated: true,
          threeDSecure: true,
          save_card: false,
          description: `PoolPros Booking #${bookingId} - ${booking.serviceName}`,
          metadata: {
            paymentId: String(paymentId),
            bookingId: String(bookingId),
          },
          receipt: { email: false, sms: true },
          customer: {
            first_name: user.name,
            phone: { country_code: "965", number: user.phone },
          },
          source: { id: "src_all" },
          redirect: {
            url: `${BASE_URL}/payment/callback?payment_id=${paymentId}`,
          },
          post: {
            url: `${BASE_URL}/api/payments/webhook`,
          },
        }),
      });

      const tapData = await tapResponse.json();

      if (tapData.id && tapData.transaction?.url) {
        // Update payment with Tap charge ID
        await db.execute({
          sql: "UPDATE Payment SET tapChargeId = ? WHERE id = ?",
          args: [tapData.id, paymentId],
        });

        return NextResponse.json({
          success: true,
          paymentId,
          paymentUrl: tapData.transaction.url,
        });
      } else {
        console.error("Tap charge creation failed:", tapData);
        return NextResponse.json({
          error: "Payment gateway error",
          details: tapData.errors || tapData.message,
        }, { status: 500 });
      }
    }

    // Fallback: No Tap configured — simulate payment for testing
    return NextResponse.json({
      success: true,
      paymentId,
      paymentUrl: `${BASE_URL}/payment/callback?payment_id=${paymentId}&test=true`,
    });
  } catch (err) {
    console.error("Payment create error:", err);
    return NextResponse.json({ error: "Payment failed" }, { status: 500 });
  }
}

// GET — check payment status
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const paymentId = req.nextUrl.searchParams.get("id");
    const bookingId = req.nextUrl.searchParams.get("bookingId");

    const db = await ensureDb();

    if (paymentId) {
      const result = await db.execute({
        sql: "SELECT * FROM Payment WHERE id = ?",
        args: [paymentId],
      });
      return NextResponse.json(result.rows[0] || null);
    }

    if (bookingId) {
      const result = await db.execute({
        sql: "SELECT * FROM Payment WHERE bookingId = ? ORDER BY createdAt DESC LIMIT 1",
        args: [bookingId],
      });
      return NextResponse.json(result.rows[0] || null);
    }

    // Get all payments for user
    const result = await db.execute({
      sql: "SELECT * FROM Payment WHERE customerId = ? ORDER BY createdAt DESC",
      args: [user.id],
    });
    return NextResponse.json(result.rows);
  } catch (err) {
    console.error("Payment GET error:", err);
    return NextResponse.json({ error: "Failed to fetch payment" }, { status: 500 });
  }
}
