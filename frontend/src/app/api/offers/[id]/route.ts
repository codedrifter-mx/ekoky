import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const offer = await prisma.offer.findUnique({
      where: { id },
      include: {
        creator: { select: { id: true, name: true, address: true, role: true } },
        interests: {
          include: { institution: { select: { id: true, name: true, address: true } } },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!offer) {
      return NextResponse.json({ error: "Offer not found" }, { status: 404 });
    }

    return NextResponse.json(offer);
  } catch (error) {
    console.error("Get offer failed:", error);
    return NextResponse.json({ error: "Failed to get offer" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { id } = await params;
    const offer = await prisma.offer.findUnique({ where: { id } });
    if (!offer) {
      return NextResponse.json({ error: "Offer not found" }, { status: 404 });
    }

    const user = await prisma.user.findUnique({ where: { address: session.address } });
    if (!user || user.id !== offer.creatorId) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    const body = await request.json();
    const updated = await prisma.offer.update({
      where: { id },
      data: {
        title: body.title,
        description: body.description,
        quantity: body.quantity,
        pickupAddress: body.pickupAddress,
        latitude: body.latitude,
        longitude: body.longitude,
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : undefined,
      },
      include: { creator: { select: { id: true, name: true, address: true } } },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update offer failed:", error);
    return NextResponse.json({ error: "Failed to update offer" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { id } = await params;
    const offer = await prisma.offer.findUnique({ where: { id } });
    if (!offer) {
      return NextResponse.json({ error: "Offer not found" }, { status: 404 });
    }

    const user = await prisma.user.findUnique({ where: { address: session.address } });
    if (!user || user.id !== offer.creatorId) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    const cancelled = await prisma.offer.update({
      where: { id },
      data: { status: "CANCELLED" },
    });

    return NextResponse.json(cancelled);
  } catch (error) {
    console.error("Cancel offer failed:", error);
    return NextResponse.json({ error: "Failed to cancel offer" }, { status: 500 });
  }
}
