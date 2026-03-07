import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getDb();
    const auctions = db.prepare(
      `SELECT a.*, (SELECT COUNT(*) FROM Bid WHERE auctionId = a.id) as bidCount
       FROM Auction a WHERE a.userId = ? ORDER BY a.createdAt DESC`
    ).all(user.id);

    return NextResponse.json(auctions);
  } catch {
    return NextResponse.json({ error: "Failed to fetch requests" }, { status: 500 });
  }
}
