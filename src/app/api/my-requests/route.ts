import { NextResponse } from "next/server";
import { ensureDb } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await ensureDb();
    const auctions = await db.execute({
      sql: `SELECT a.*, (SELECT COUNT(*) FROM Bid WHERE auctionId = a.id) as bidCount
       FROM Auction a WHERE a.userId = ? ORDER BY a.createdAt DESC`,
      args: [user.id],
    });

    return NextResponse.json(auctions.rows);
  } catch {
    return NextResponse.json({ error: "Failed to fetch requests" }, { status: 500 });
  }
}
