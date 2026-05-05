import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/siwe";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const CreateInterestSchema = z.object({
  offerId: z.string().uuid(),
  message: z.string().max(500).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { address: session.address },
    });
    if (!user || user.role !== "INSTITUTION") {
      return NextResponse.json({ error: "Only institutions can express interest" }, { status: 403 });
    }

    const body = await request.json();
    const data = CreateInterestSchema.parse(body);

    const offer = await prisma.offer.findUnique({ where: { id: data.offerId } });
    if (!offer) {
      return NextResponse.json({ error: "Offer not found" }, { status: 404 });
    }
    if (offer.status !== "ACTIVE") {
      return NextResponse.json({ error: "Offer is not active" }, { status: 400 });
    }

    const existing = await prisma.interest.findUnique({
      where: { offerId_institutionId: { offerId: data.offerId, institutionId: user.id } },
    });
    if (existing) {
      return NextResponse.json({ error: "Already expressed interest" }, { status: 409 });
    }

    const interest = await prisma.interest.create({
      data: {
        offerId: data.offerId,
        institutionId: user.id,
        message: data.message,
      },
      include: {
        institution: { select: { id: true, name: true, address: true } },
        offer: { select: { id: true, title: true } },
      },
    });

    return NextResponse.json(interest, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("Create interest failed:", error);
    return NextResponse.json({ error: "Failed to express interest" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const { interestId, status } = z.object({
      interestId: z.string().uuid(),
      status: z.enum(["ACCEPTED", "REJECTED"]),
    }).parse(body);

    const interest = await prisma.interest.findUnique({ where: { id: interestId } });
    if (!interest) {
      return NextResponse.json({ error: "Interest not found" }, { status: 404 });
    }

    const offer = await prisma.offer.findUnique({ where: { id: interest.offerId } });
    const user = await prisma.user.findUnique({ where: { address: session.address } });
    if (!user || !offer || user.id !== offer.creatorId) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    const updated = await prisma.interest.update({
      where: { id: interestId },
      data: { status },
      include: {
        institution: { select: { id: true, name: true, address: true } },
      },
    });

    if (status === "ACCEPTED") {
      await prisma.offer.update({
        where: { id: offer.id },
        data: { status: "PENDING_FULFILLMENT" },
      });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update interest failed:", error);
    return NextResponse.json({ error: "Failed to update interest" }, { status: 500 });
  }
}
