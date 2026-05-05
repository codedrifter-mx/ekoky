import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const CreateOfferSchema = z.object({
  category: z.enum(["PRODUCE", "DAIRY", "BAKERY", "PREPARED", "PACKAGED", "BEVERAGES", "MIXED"]),
  title: z.string().min(3).max(200),
  description: z.string().min(10).max(2000),
  quantity: z.string().max(100).optional(),
  pickupAddress: z.string().max(300).optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  expiresAt: z.string().datetime(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const status = searchParams.get("status") ?? "ACTIVE";
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = parseInt(searchParams.get("limit") ?? "20");
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (category) where.category = category;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const [offers, total] = await Promise.all([
      prisma.offer.findMany({
        where,
        include: { creator: { select: { id: true, name: true, address: true, role: true } } },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.offer.count({ where }),
    ]);

    return NextResponse.json({ offers, total, page, limit });
  } catch (error) {
    console.error("Get offers failed:", error);
    return NextResponse.json({ error: "Failed to get offers" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { address: session.address },
    });
    if (!user || user.role !== "BUSINESS") {
      return NextResponse.json({ error: "Only businesses can create offers" }, { status: 403 });
    }

    const body = await request.json();
    const data = CreateOfferSchema.parse(body);

    const offer = await prisma.offer.create({
      data: {
        creatorId: user.id,
        category: data.category,
        title: data.title,
        description: data.description,
        quantity: data.quantity,
        pickupAddress: data.pickupAddress,
        latitude: data.latitude,
        longitude: data.longitude,
        expiresAt: new Date(data.expiresAt),
      },
      include: { creator: { select: { id: true, name: true, address: true, role: true } } },
    });

    return NextResponse.json(offer, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("Create offer failed:", error);
    return NextResponse.json({ error: "Failed to create offer" }, { status: 500 });
  }
}
