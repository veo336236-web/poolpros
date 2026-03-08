import { NextRequest, NextResponse } from "next/server";
import { ensureDb } from "@/lib/db";

// One-time setup endpoint to make a user admin
// DELETE THIS FILE after use
export async function POST(req: NextRequest) {
  try {
    const { phone, secret } = await req.json();

    // Simple secret to prevent random access
    if (secret !== "poolpros_admin_setup_2024") {
      return NextResponse.json({ error: "Invalid secret" }, { status: 403 });
    }

    const db = await ensureDb();
    const result = await db.execute({
      sql: "UPDATE User SET role = 'admin' WHERE phone = ?",
      args: [phone],
    });

    if (result.rowsAffected === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: `User ${phone} is now admin` });
  } catch (err) {
    console.error("Setup admin error:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
