import { NextRequest, NextResponse } from "next/server";
import { ensureDb } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get("id");
    const db = await ensureDb();

    if (id) {
      const partnerResult = await db.execute({
        sql: "SELECT id, name, phone, businessName, createdAt FROM User WHERE id = ? AND role = 'partner'",
        args: [parseInt(id)],
      });

      if (!partnerResult.rows[0]) {
        return NextResponse.json({ error: "Partner not found" }, { status: 404 });
      }

      const products = await db.execute({
        sql: "SELECT * FROM PartnerProduct WHERE userId = ? ORDER BY createdAt DESC",
        args: [parseInt(id)],
      });

      const stats = await db.execute({
        sql: "SELECT COUNT(*) as count, ROUND(AVG(rating), 1) as avg FROM Review WHERE partnerId = ?",
        args: [parseInt(id)],
      });
      const statsRow = stats.rows[0] as unknown as { count: number; avg: number | null };

      return NextResponse.json({
        partner: partnerResult.rows[0],
        products: products.rows,
        reviewStats: { count: statsRow.count, average: statsRow.avg || 0 },
      });
    }

    // List all partners
    const partners = await db.execute(
      `SELECT u.id, u.name, u.businessName, u.createdAt,
        (SELECT COUNT(*) FROM PartnerProduct WHERE userId = u.id) as productCount,
        (SELECT COUNT(*) FROM Review WHERE partnerId = u.id) as reviewCount,
        (SELECT ROUND(AVG(rating), 1) FROM Review WHERE partnerId = u.id) as avgRating
       FROM User u WHERE u.role = 'partner' ORDER BY u.createdAt DESC`
    );

    return NextResponse.json(partners.rows);
  } catch {
    return NextResponse.json({ error: "Failed to fetch partners" }, { status: 500 });
  }
}
