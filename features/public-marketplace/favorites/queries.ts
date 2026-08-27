import "server-only";

import { unstable_noStore as noStore } from "next/cache";
import { isDevAuthBypassEnabled } from "@/lib/auth/devAuthBypass";
import { getSupabaseConfig } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { devTravelerData } from "@/features/traveler/data/devData";

export type FavoritesSnapshot = {
  isAuthenticated: boolean;
  savedPropertyIds: string[];
};

export async function getFavoritesSnapshot(): Promise<FavoritesSnapshot> {
  noStore();

  if (isDevAuthBypassEnabled()) {
    return {
      isAuthenticated: true,
      savedPropertyIds: devTravelerData.properties.filter((property) => property.isSaved).map((property) => property.id),
    };
  }

  if (!getSupabaseConfig()) {
    return {
      isAuthenticated: false,
      savedPropertyIds: [],
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      isAuthenticated: false,
      savedPropertyIds: [],
    };
  }

  const { data, error } = await supabase
    .from("saved_properties")
    .select("property_id")
    .order("created_at", { ascending: false });

  if (error) {
    return {
      isAuthenticated: true,
      savedPropertyIds: [],
    };
  }

  return {
    isAuthenticated: true,
    savedPropertyIds: (data ?? []).map((row) => row.property_id),
  };
}
