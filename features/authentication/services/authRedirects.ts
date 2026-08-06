import type { AccountType } from "@/lib/supabase/database";

export function getSafeRedirect(value: string | null | undefined, fallback = "/search") {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return fallback;
  }

  if (/^\/[a-z][a-z\d+\-.]*:/i.test(value)) {
    return fallback;
  }

  return value;
}

export function getRoleDestination(accountType?: AccountType | null) {
  return accountType === "owner" ? "/owner" : "/search";
}
