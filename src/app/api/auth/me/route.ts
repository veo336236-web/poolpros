import { NextResponse } from "next/server";
import { getCurrentUser, safeUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ user: null });
    }
    return NextResponse.json({ user: safeUser(user) });
  } catch {
    return NextResponse.json({ user: null });
  }
}
