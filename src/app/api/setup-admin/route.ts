import { NextRequest, NextResponse } from "next/server";
import { ensureDb } from "@/lib/db";

// One-time setup endpoint to make a user admin
// DELETE THIS FILE after use

// GET — clickable link version
export async function GET(req: NextRequest) {
  try {
    const phone = req.nextUrl.searchParams.get("phone");
    const secret = req.nextUrl.searchParams.get("secret");

    if (secret !== "poolpros_admin_setup_2024") {
      return new NextResponse("<h1>Invalid secret</h1>", { status: 403, headers: { "Content-Type": "text/html" } });
    }

    if (!phone) {
      return new NextResponse("<h1>Missing phone</h1>", { status: 400, headers: { "Content-Type": "text/html" } });
    }

    const db = await ensureDb();
    const result = await db.execute({
      sql: "UPDATE User SET role = 'admin' WHERE phone = ?",
      args: [phone],
    });

    if (result.rowsAffected === 0) {
      return new NextResponse(`<h1>User ${phone} not found. Make sure you registered first.</h1>`, { status: 404, headers: { "Content-Type": "text/html" } });
    }

    return new NextResponse(`<h1>Success! User ${phone} is now admin.</h1><p><a href="/">Go to homepage</a></p>`, { headers: { "Content-Type": "text/html" } });
  } catch (err) {
    console.error("Setup admin error:", err);
    return new NextResponse("<h1>Failed</h1>", { status: 500, headers: { "Content-Type": "text/html" } });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { phone, secret } = await req.json();

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
