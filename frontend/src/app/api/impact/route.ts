import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [
      totalOffers,
      activeOffers,
      fulfilledOffers,
      totalInstitutions,
      totalBusinesses,
    ] = await Promise.all([
      prisma.offer.count(),
      prisma.offer.count({ where: { status: "ACTIVE" } }),
      prisma.offer.count({ where: { status: "FULFILLED" } }),
      prisma.user.count({ where: { role: "INSTITUTION" } }),
      prisma.user.count({ where: { role: "BUSINESS" } }),
    ]);

    const impactMetrics = await prisma.impactMetric.aggregate({
      _sum: { foodDivertedKg: true, co2SavedKg: true },
    });

    return NextResponse.json({
      totalOffers,
      activeOffers,
      fulfilledOffers,
      totalInstitutions,
      totalBusinesses,
      foodDivertedKg: impactMetrics._sum.foodDivertedKg ?? 0,
      co2SavedKg: impactMetrics._sum.co2SavedKg ?? 0,
    });
  } catch (error) {
    console.error("Get impact failed:", error);
    return NextResponse.json({ error: "Failed to get impact metrics" }, { status: 500 });
  }
}
