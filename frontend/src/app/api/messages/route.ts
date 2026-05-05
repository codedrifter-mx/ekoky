import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const offerId = searchParams.get("offerId");
    if (!offerId) {
      return NextResponse.json({ error: "offerId required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { address: session.address } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const messages = await prisma.message.findMany({
      where: { offerId },
      include: {
        sender: { select: { id: true, name: true, address: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error("Get messages failed:", error);
    return NextResponse.json({ error: "Failed to get messages" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const schema = z.object({
      offerId: z.string().uuid(),
      receiverId: z.string().uuid(),
      content: z.string().min(1).max(2000),
    });
    const data = schema.parse(body);

    const sender = await prisma.user.findUnique({ where: { address: session.address } });
    if (!sender) {
      return NextResponse.json({ error: "Sender not found" }, { status: 404 });
    }

    const message = await prisma.message.create({
      data: {
        offerId: data.offerId,
        senderId: sender.id,
        receiverId: data.receiverId,
        content: data.content,
      },
      include: {
        sender: { select: { id: true, name: true, address: true } },
      },
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("Create message failed:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
