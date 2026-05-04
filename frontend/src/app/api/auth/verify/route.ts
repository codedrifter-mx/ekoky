import { NextRequest, NextResponse } from "next/server";
import { verifyMessage } from "viem";
import { createSiweMessage, setSession } from "@/lib/siwe";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { message, signature } = await request.json();

    const recoveredAddress = verifyMessage({
      message: message,
      signature: signature as `0x${string}`,
    }) as string;

    if (!recoveredAddress) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const parsedMessage = parseSiweMessage(message);
    if (parsedMessage.address.toLowerCase() !== recoveredAddress.toLowerCase()) {
      return NextResponse.json({ error: "Address mismatch" }, { status: 401 });
    }

    await setSession({
      address: recoveredAddress.toLowerCase() as string,
      chainId: parsedMessage.chainId ?? 31337,
    });

    const user = await prisma.user.findUnique({
      where: { address: recoveredAddress.toLowerCase() },
    });

    return NextResponse.json({
      address: recoveredAddress.toLowerCase(),
      hasProfile: !!user,
      role: user?.role ?? null,
    });
  } catch (error) {
    console.error("SIWE verification failed:", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 401 });
  }
}

function parseSiweMessage(message: string): { address: string; chainId?: number } {
  const addressMatch = message.match(/^0x[0-9a-fA-F]{40}/m);
  const chainIdMatch = message.match(/Chain ID: (\d+)/);
  return {
    address: addressMatch ? addressMatch[0] : "",
    chainId: chainIdMatch ? parseInt(chainIdMatch[1], 10) : undefined,
  };
}
