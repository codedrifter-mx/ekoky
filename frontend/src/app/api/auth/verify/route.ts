import { recoverMessageAddress } from "viem";
import { NextRequest, NextResponse } from "next/server";
import { createSiweMessage, nonces, cleanExpiredNonces } from "@/lib/siwe";
import { setSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Input validation
    if (typeof body.message !== "string" || typeof body.signature !== "string") {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    if (!body.signature.match(/^0x[0-9a-fA-F]{130}$/)) {
      return NextResponse.json({ error: "Invalid signature format" }, { status: 400 });
    }

    const { message, signature } = body;

    // Parse SIWE message strictly
    const parsed = parseSiweMessage(message);
    if (!parsed.address || !parsed.nonce) {
      return NextResponse.json({ error: "Invalid message format" }, { status: 400 });
    }

    // Verify nonce
    cleanExpiredNonces();
    if (!nonces.has(parsed.nonce)) {
      return NextResponse.json({ error: "Invalid or expired nonce" }, { status: 401 });
    }
    nonces.delete(parsed.nonce); // One-time use

    // Recover address from signature
    const recoveredAddress = await recoverMessageAddress({
      message,
      signature: signature as `0x${string}`,
    });

    if (recoveredAddress.toLowerCase() !== parsed.address.toLowerCase()) {
      return NextResponse.json({ error: "Signature verification failed" }, { status: 401 });
    }

    await setSession({
      address: recoveredAddress.toLowerCase(),
      chainId: parsed.chainId ?? 31337,
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
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}

function parseSiweMessage(message: string): { address: string; nonce: string; chainId?: number } {
  const lines = message.split("\n");
  if (lines.length < 2) return { address: "", nonce: "" };
  
  // First line after the domain prefix should contain the address
  const addressMatch = lines[1]?.match(/^(0x[0-9a-fA-F]{40})$/);
  const address = addressMatch ? addressMatch[1] : "";
  
  // Find nonce line
  const nonceLine = lines.find((l) => l.startsWith("Nonce: "));
  const nonce = nonceLine ? nonceLine.replace("Nonce: ", "").trim() : "";
  
  // Find chain ID line
  const chainLine = lines.find((l) => l.startsWith("Chain ID: "));
  const chainId = chainLine ? parseInt(chainLine.replace("Chain ID: ", "").trim(), 10) : undefined;
  
  return { address, nonce, chainId };
}
