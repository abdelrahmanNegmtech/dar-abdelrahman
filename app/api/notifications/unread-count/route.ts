import { NextResponse } from "next/server";
import { isDevAuthBypassEnabled } from "@/lib/auth/devAuthBypass";
import { getSupabaseConfig } from "@/lib/supabase/config";
import { getUnreadNotificationCount } from "@/features/notifications/data/notification-queries";

export async function GET() {
  if (isDevAuthBypassEnabled() || !getSupabaseConfig()) {
    return NextResponse.json({ unreadCount: 0 });
  }

  const unreadCount = await getUnreadNotificationCount();
  return NextResponse.json({ unreadCount });
}
