import { NextResponse } from "next/server";
import { clearSession } from "@/lib/siwe";

export async function DELETE() {
  try {
    await clearSession();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Logout failed:", error);
    return NextResponse.json({ error: "Logout failed" }, { status: 500 });
  }
}
