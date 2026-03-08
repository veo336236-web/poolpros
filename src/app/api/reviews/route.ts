import { NextRequest, NextResponse } from "next/server";
import { ensureDb } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Login required" }, { status: 401 });
    }

    const { partnerId, rating, comment } = await req.json();

    if (!partnerId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    const db = await ensureDb();

    const partnerResult = await db.execute({
      sql: "SELECT id, role FROM User WHERE id = ? AND role = 'partner'",
      args: [partnerId],
    });
    if (!partnerResult.rows[0]) {
      return NextResponse.json({ error: "Partner not found" }, { status: 404 });
    }

    const existingResult = await db.execute({
      sql: "SELECT id FROM Review WHERE partnerId = ? AND userId = ?",
      args: [partnerId, user.id],
    });
    if (existingResult.rows[0]) {
      return NextResponse.json({ error: "Already reviewed" }, { status: 409 });
    }

    const result = await db.execute({
      sql: "INSERT INTO Review (partnerId, userId, rating, comment) VALUES (?, ?, ?, ?)",
      args: [partnerId, user.id, rating, comment || ""],
    });

    return NextResponse.json({ success: true, id: result.lastInsertRowid });
  } catch {
    return NextResponse.json({ error: "Failed to submit review" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const partnerId = req.nextUrl.searchParams.get("partnerId");
    if (!partnerId) {
      return NextResponse.json({ error: "Missing partnerId" }, { status: 400 });
    }

    const db = await ensureDb();
    const reviews = await db.execute({
      sql: `SELECT r.*, u.name as reviewerName
       FROM Review r
       JOIN User u ON r.userId = u.id
       WHERE r.partnerId = ?
       ORDER BY r.createdAt DESC`,
      args: [parseInt(partnerId)],
    });

    const stats = await db.execute({
      sql: `SELECT COUNT(*) as count, ROUND(AVG(rating), 1) as avg
       FROM Review WHERE partnerId = ?`,
      args: [parseInt(partnerId)],
    });
    const statsRow = stats.rows[0] as unknown as { count: number; avg: number | null };

    return NextResponse.json({
      reviews: reviews.rows,
      stats: { count: statsRow.count, average: statsRow.avg || 0 },
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}
