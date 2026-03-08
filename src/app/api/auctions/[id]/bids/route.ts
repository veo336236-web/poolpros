import { NextRequest, NextResponse } from "next/server";
import { ensureDb } from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auctionId = parseInt(id);
    const body = await req.json();
    const { providerName, phone, price, description, duration } = body;

    if (!providerName || !phone || !price || !description) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const db = await ensureDb();

    const auctionResult = await db.execute({
      sql: "SELECT id, status FROM Auction WHERE id = ?",
      args: [auctionId],
    });
    if (!auctionResult.rows[0]) {
      return NextResponse.json({ error: "Auction not found" }, { status: 404 });
    }

    const result = await db.execute({
      sql: `INSERT INTO Bid (auctionId, providerName, phone, price, description, duration)
       VALUES (?, ?, ?, ?, ?, ?)`,
      args: [auctionId, providerName, phone, price, description, duration || ""],
    });

    return NextResponse.json({ success: true, id: result.lastInsertRowid });
  } catch {
    return NextResponse.json({ error: "Failed to submit bid" }, { status: 500 });
  }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auctionId = parseInt(id);
    const db = await ensureDb();

    const auctionResult = await db.execute({
      sql: "SELECT * FROM Auction WHERE id = ?",
      args: [auctionId],
    });
    if (!auctionResult.rows[0]) {
      return NextResponse.json({ error: "Auction not found" }, { status: 404 });
    }

    const bids = await db.execute({
      sql: "SELECT * FROM Bid WHERE auctionId = ? ORDER BY createdAt DESC",
      args: [auctionId],
    });

    return NextResponse.json({ auction: auctionResult.rows[0], bids: bids.rows });
  } catch {
    return NextResponse.json({ error: "Failed to fetch bids" }, { status: 500 });
  }
}
