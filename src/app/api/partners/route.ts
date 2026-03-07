import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get("id");
    const db = getDb();

    if (id) {
      // Get single partner with products and review stats
      const partner = db.prepare(
        "SELECT id, name, phone, businessName, createdAt FROM User WHERE id = ? AND role = 'partner'"
      ).get(parseInt(id));

      if (!partner) {
        return NextResponse.json({ error: "Partner not found" }, { status: 404 });
      }

      const products = db.prepare(
        "SELECT * FROM PartnerProduct WHERE userId = ? ORDER BY createdAt DESC"
      ).all(parseInt(id));

      const stats = db.prepare(
        "SELECT COUNT(*) as count, ROUND(AVG(rating), 1) as avg FROM Review WHERE partnerId = ?"
      ).get(parseInt(id)) as { count: number; avg: number | null };

      return NextResponse.json({
        partner,
        products,
        reviewStats: { count: stats.count, average: stats.avg || 0 },
      });
    }

    // List all partners
    const partners = db.prepare(
      `SELECT u.id, u.name, u.businessName, u.createdAt,
        (SELECT COUNT(*) FROM PartnerProduct WHERE userId = u.id) as productCount,
        (SELECT COUNT(*) FROM Review WHERE partnerId = u.id) as reviewCount,
        (SELECT ROUND(AVG(rating), 1) FROM Review WHERE partnerId = u.id) as avgRating
       FROM User u WHERE u.role = 'partner' ORDER BY u.createdAt DESC`
    ).all();

    return NextResponse.json(partners);
  } catch {
    return NextResponse.json({ error: "Failed to fetch partners" }, { status: 500 });
  }
}
