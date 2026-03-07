import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

    const registration = await prisma.businessRegistration.create({
      data: {
        businessName,
        ownerName,
        phone,
        category,
        governorate,
        description: description || "",
      },
    });

    return NextResponse.json({ success: true, id: registration.id });
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

    await prisma.businessRegistration.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const registrations = await prisma.businessRegistration.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(registrations);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch registrations" },
      { status: 500 }
    );
  }
}
