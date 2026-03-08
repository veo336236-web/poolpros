import { NextRequest, NextResponse } from "next/server";
import { ensureDb } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "partner") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await ensureDb();
    const products = await db.execute({
      sql: "SELECT * FROM PartnerProduct WHERE userId = ? ORDER BY createdAt DESC",
      args: [user.id],
    });

    return NextResponse.json(products.rows);
  } catch {
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "partner") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, description, category, price, image } = await req.json();
    if (!title || !category) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const db = await ensureDb();
    const result = await db.execute({
      sql: `INSERT INTO PartnerProduct (userId, title, description, category, price, image)
       VALUES (?, ?, ?, ?, ?, ?)`,
      args: [user.id, title, description || "", category, price || "", image || ""],
    });

    return NextResponse.json({ success: true, id: result.lastInsertRowid });
  } catch {
    return NextResponse.json({ error: "Failed to add product" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "partner") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await req.json();
    const db = await ensureDb();
    await db.execute({
      sql: "DELETE FROM PartnerProduct WHERE id = ? AND userId = ?",
      args: [id, user.id],
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
