import { NextResponse } from "next/server";
import { isDevAuthBypassEnabled } from "@/lib/auth/devAuthBypass";
import { resetDevStore } from "@/features/traveler/data/devStore";

export async function POST() {
  if (!isDevAuthBypassEnabled()) {
    return new NextResponse("Not found", { status: 404 });
  }

  resetDevStore();
  return NextResponse.json({ ok: true });
}
