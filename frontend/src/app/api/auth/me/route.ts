import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { address: session.address },
    });

    return NextResponse.json({
      authenticated: true,
      address: session.address,
      hasProfile: !!user,
      role: user?.role ?? null,
      name: user?.name ?? null,
    });
  } catch (error) {
    console.error("Get session failed:", error);
    return NextResponse.json({ error: "Failed to get session" }, { status: 500 });
  }
}
