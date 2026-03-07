import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

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

    const db = getDb();
    const stmt = db.prepare(
      `INSERT INTO BusinessRegistration (businessName, ownerName, phone, category, governorate, description)
       VALUES (?, ?, ?, ?, ?, ?)`
    );
    const result = stmt.run(businessName, ownerName, phone, category, governorate, description || "");

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

    const db = getDb();
    db.prepare("UPDATE BusinessRegistration SET status = ? WHERE id = ?").run(status, id);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const db = getDb();
    const registrations = db.prepare("SELECT * FROM BusinessRegistration ORDER BY createdAt DESC").all();
    return NextResponse.json(registrations);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch registrations" },
      { status: 500 }
    );
  }
}
