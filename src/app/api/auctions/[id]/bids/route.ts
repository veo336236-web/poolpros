import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

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

    const db = getDb();

    const auction = db.prepare("SELECT id, status FROM Auction WHERE id = ?").get(auctionId);
    if (!auction) {
      return NextResponse.json({ error: "Auction not found" }, { status: 404 });
    }

    const stmt = db.prepare(
      `INSERT INTO Bid (auctionId, providerName, phone, price, description, duration)
       VALUES (?, ?, ?, ?, ?, ?)`
    );
    const result = stmt.run(auctionId, providerName, phone, price, description, duration || "");

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
    const db = getDb();

    const auction = db.prepare("SELECT * FROM Auction WHERE id = ?").get(auctionId);
    if (!auction) {
      return NextResponse.json({ error: "Auction not found" }, { status: 404 });
    }

    const bids = db.prepare(
      "SELECT * FROM Bid WHERE auctionId = ? ORDER BY createdAt DESC"
    ).all(auctionId);

    return NextResponse.json({ auction, bids });
  } catch {
    return NextResponse.json({ error: "Failed to fetch bids" }, { status: 500 });
  }
}
