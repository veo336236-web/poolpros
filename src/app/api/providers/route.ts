import { NextResponse } from "next/server";
import { ensureDb } from "@/lib/db";
import { providers as hardcodedProviders } from "@/lib/data";
import { Provider } from "@/lib/types";

export async function GET() {
  try {
    const db = await ensureDb();

    // Fetch database partners (users with role='partner')
    const result = await db.execute(
      `SELECT u.id, u.name, u.businessName, u.phone, u.categories, u.description,
              u.governorate, u.location, u.whatsappNumber, u.basePrice, u.image, u.isVerified,
              (SELECT COUNT(*) FROM Review WHERE partnerId = u.id) as reviewCount,
              (SELECT ROUND(AVG(rating), 1) FROM Review WHERE partnerId = u.id) as avgRating
       FROM User u WHERE u.role = 'partner' ORDER BY u.createdAt DESC`
    );

    // Convert database partners to Provider format
    const dbProviders: Provider[] = result.rows.map((row) => {
      const r = row as Record<string, unknown>;
      const categories = String(r.categories || "pool");
      const firstCategory = categories.split(",")[0] as "pool" | "fountain" | "fish";

      return {
        id: `db-${r.id}`,
        name: String(r.businessName || r.name || ""),
        category: firstCategory,
        description: String(r.description || ""),
        descriptionAr: String(r.description || ""),
        rating: Number(r.avgRating) || 0,
        reviewCount: Number(r.reviewCount) || 0,
        location: String(r.location || r.governorate || "Kuwait"),
        locationAr: String(r.location || r.governorate || "الكويت"),
        governorate: String(r.governorate || "Capital"),
        basePrice: Number(r.basePrice) || 0,
        isVerified: Boolean(r.isVerified),
        whatsappNumber: String(r.whatsappNumber || r.phone || ""),
        image: String(r.image || ""),
        yearsInBusiness: 0,
        completedJobs: 0,
      };
    });

    // Merge: hardcoded first, then database partners
    const allProviders = [...hardcodedProviders, ...dbProviders];

    return NextResponse.json(allProviders);
  } catch (err) {
    console.error("Providers GET error:", err);
    // Fallback to hardcoded only
    return NextResponse.json(hardcodedProviders);
  }
}
