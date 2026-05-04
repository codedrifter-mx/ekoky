import { NextResponse } from "next/server";
import { clearSession } from "@/lib/siwe";

export async function DELETE() {
  await clearSession();
  return NextResponse.json({ success: true });
}
