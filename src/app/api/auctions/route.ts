import { NextRequest, NextResponse } from "next/server";
import { ensureDb } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Login required" }, { status: 401 });
    }

    const body = await req.json();
    const { category, title, description, governorate, budget, fileName } = body;

    if (!category || !title || !description || !governorate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const db = await ensureDb();
    const result = await db.execute({
      sql: `INSERT INTO Auction (customerName, phone, category, title, description, governorate, budget, fileName, userId)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [user.name, user.phone, category, title, description, governorate, budget || "", fileName || "", user.id],
    });

    return NextResponse.json({ success: true, id: result.lastInsertRowid });
  } catch {
    return NextResponse.json({ error: "Failed to create auction" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const db = await ensureDb();
    const auctions = await db.execute(
      `SELECT a.*, (SELECT COUNT(*) FROM Bid WHERE auctionId = a.id) as bidCount
       FROM Auction a ORDER BY a.createdAt DESC`
    );
    return NextResponse.json(auctions.rows);
  } catch {
    return NextResponse.json({ error: "Failed to fetch auctions" }, { status: 500 });
  }
}
