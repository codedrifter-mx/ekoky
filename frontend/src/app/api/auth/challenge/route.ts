import { NextResponse } from "next/server";
import { generateNonce } from "@/lib/siwe";

export async function GET() {
  const nonce = generateNonce();
  return NextResponse.json({ nonce });
}
