import { NextResponse } from "next/server";
import { generateNonce, nonces } from "@/lib/siwe";

export async function GET() {
  const nonce = generateNonce();
  nonces.set(nonce, Date.now() + 10 * 60 * 1000); // 10 minute expiry
  return NextResponse.json({ nonce });
}
