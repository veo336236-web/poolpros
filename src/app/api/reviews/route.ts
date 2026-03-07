import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
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

    const db = getDb();

    // Check partner exists and is a partner
    const partner = db.prepare("SELECT id, role FROM User WHERE id = ? AND role = 'partner'").get(partnerId);
    if (!partner) {
      return NextResponse.json({ error: "Partner not found" }, { status: 404 });
    }

    // Check if user already reviewed this partner
    const existing = db.prepare("SELECT id FROM Review WHERE partnerId = ? AND userId = ?").get(partnerId, user.id);
    if (existing) {
      return NextResponse.json({ error: "Already reviewed" }, { status: 409 });
    }

    const result = db.prepare(
      "INSERT INTO Review (partnerId, userId, rating, comment) VALUES (?, ?, ?, ?)"
    ).run(partnerId, user.id, rating, comment || "");

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

    const db = getDb();
    const reviews = db.prepare(
      `SELECT r.*, u.name as reviewerName
       FROM Review r
       JOIN User u ON r.userId = u.id
       WHERE r.partnerId = ?
       ORDER BY r.createdAt DESC`
    ).all(parseInt(partnerId));

    const stats = db.prepare(
      `SELECT COUNT(*) as count, ROUND(AVG(rating), 1) as avg
       FROM Review WHERE partnerId = ?`
    ).get(parseInt(partnerId)) as { count: number; avg: number | null };

    return NextResponse.json({
      reviews,
      stats: { count: stats.count, average: stats.avg || 0 },
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}
