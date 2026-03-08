import { NextRequest, NextResponse } from "next/server";
import { ensureDb } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") return null;
  return user;
}

// GET — fetch admin data (users, bookings, stats)
export async function GET(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const section = req.nextUrl.searchParams.get("section") || "stats";
  const db = await ensureDb();

  try {
    if (section === "stats") {
      const users = await db.execute("SELECT COUNT(*) as count FROM User");
      const customers = await db.execute("SELECT COUNT(*) as count FROM User WHERE role = 'customer'");
      const partners = await db.execute("SELECT COUNT(*) as count FROM User WHERE role = 'partner'");
      const bookings = await db.execute("SELECT COUNT(*) as count FROM Booking");
      const pendingBookings = await db.execute("SELECT COUNT(*) as count FROM Booking WHERE status = 'pending'");
      const confirmedBookings = await db.execute("SELECT COUNT(*) as count FROM Booking WHERE status = 'confirmed'");
      const completedBookings = await db.execute("SELECT COUNT(*) as count FROM Booking WHERE status = 'completed'");
      const auctions = await db.execute("SELECT COUNT(*) as count FROM Auction");
      const registrations = await db.execute("SELECT COUNT(*) as count FROM BusinessRegistration WHERE status = 'pending'");
      const reviews = await db.execute("SELECT COUNT(*) as count FROM Review");

      return NextResponse.json({
        totalUsers: (users.rows[0] as unknown as { count: number }).count,
        customers: (customers.rows[0] as unknown as { count: number }).count,
        partners: (partners.rows[0] as unknown as { count: number }).count,
        totalBookings: (bookings.rows[0] as unknown as { count: number }).count,
        pendingBookings: (pendingBookings.rows[0] as unknown as { count: number }).count,
        confirmedBookings: (confirmedBookings.rows[0] as unknown as { count: number }).count,
        completedBookings: (completedBookings.rows[0] as unknown as { count: number }).count,
        totalAuctions: (auctions.rows[0] as unknown as { count: number }).count,
        pendingRegistrations: (registrations.rows[0] as unknown as { count: number }).count,
        totalReviews: (reviews.rows[0] as unknown as { count: number }).count,
      });
    }

    if (section === "users") {
      const result = await db.execute(
        "SELECT id, name, phone, role, businessName, createdAt FROM User ORDER BY createdAt DESC"
      );
      return NextResponse.json(result.rows);
    }

    if (section === "bookings") {
      const result = await db.execute(
        "SELECT * FROM Booking ORDER BY createdAt DESC"
      );
      return NextResponse.json(result.rows);
    }

    if (section === "registrations") {
      const result = await db.execute(
        "SELECT * FROM BusinessRegistration ORDER BY createdAt DESC"
      );
      return NextResponse.json(result.rows);
    }

    return NextResponse.json({ error: "Invalid section" }, { status: 400 });
  } catch (err) {
    console.error("Admin GET error:", err);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}

// PATCH — admin actions (delete user, update user role, update booking/registration)
export async function PATCH(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { action, id, value } = await req.json();
    const db = await ensureDb();

    if (action === "updateRole") {
      const validRoles = ["customer", "partner", "admin"];
      if (!validRoles.includes(value)) {
        return NextResponse.json({ error: "Invalid role" }, { status: 400 });
      }
      await db.execute({
        sql: "UPDATE User SET role = ? WHERE id = ?",
        args: [value, id],
      });
      return NextResponse.json({ success: true });
    }

    if (action === "deleteUser") {
      // Don't allow deleting yourself
      if (id === admin.id) {
        return NextResponse.json({ error: "Cannot delete yourself" }, { status: 400 });
      }
      await db.execute({ sql: "DELETE FROM Session WHERE userId = ?", args: [id] });
      await db.execute({ sql: "DELETE FROM Review WHERE userId = ?", args: [id] });
      await db.execute({ sql: "DELETE FROM PartnerProduct WHERE userId = ?", args: [id] });
      await db.execute({ sql: "DELETE FROM Booking WHERE customerId = ?", args: [id] });
      await db.execute({ sql: "DELETE FROM User WHERE id = ?", args: [id] });
      return NextResponse.json({ success: true });
    }

    if (action === "updateBookingStatus") {
      await db.execute({
        sql: "UPDATE Booking SET status = ?, updatedAt = datetime('now') WHERE id = ?",
        args: [value, id],
      });
      return NextResponse.json({ success: true });
    }

    if (action === "updateRegistration") {
      await db.execute({
        sql: "UPDATE BusinessRegistration SET status = ? WHERE id = ?",
        args: [value, id],
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err) {
    console.error("Admin PATCH error:", err);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}
