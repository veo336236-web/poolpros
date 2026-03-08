import { NextRequest, NextResponse } from "next/server";
import { ensureDb } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { businessName, ownerName, phone, category, governorate, description } = body;

    if (!businessName || !ownerName || !phone || !category || !governorate) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const db = await ensureDb();
    const result = await db.execute({
      sql: `INSERT INTO BusinessRegistration (businessName, ownerName, phone, category, governorate, description)
       VALUES (?, ?, ?, ?, ?, ?)`,
      args: [businessName, ownerName, phone, category, governorate, description || ""],
    });

    return NextResponse.json({ success: true, id: result.lastInsertRowid });
  } catch {
    return NextResponse.json(
      { error: "Failed to save registration" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, status } = await req.json();

    if (!id || !status) {
      return NextResponse.json({ error: "Missing id or status" }, { status: 400 });
    }

    const db = await ensureDb();
    await db.execute({
      sql: "UPDATE BusinessRegistration SET status = ? WHERE id = ?",
      args: [status, id],
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const db = await ensureDb();
    const registrations = await db.execute("SELECT * FROM BusinessRegistration ORDER BY createdAt DESC");
    return NextResponse.json(registrations.rows);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch registrations" },
      { status: 500 }
    );
  }
}
