import type { User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { DEV_AUTH_BYPASS_USER, isDevAuthBypassEnabled } from "@/lib/auth/devAuthBypass";
import { getSupabaseConfig } from "./config";
import { createClient } from "./server";

export type Profile = {
  account_type: "guest" | "owner" | null;
  avatar_url: string | null;
  country_code: string | null;
  country_name: string | null;
  created_at: string;
  dialing_code: string | null;
  email: string | null;
  full_name: string | null;
  id: string;
  phone: string | null;
  updated_at: string;
};

const devAuthBypassUser: User = {
  app_metadata: {
    provider: "dev",
    providers: ["dev"],
  },
  aud: "authenticated",
  created_at: "2026-01-01T00:00:00.000Z",
  email: DEV_AUTH_BYPASS_USER.email,
  id: DEV_AUTH_BYPASS_USER.id,
  role: "authenticated",
  user_metadata: {
    avatar_url: DEV_AUTH_BYPASS_USER.avatarUrl,
    full_name: DEV_AUTH_BYPASS_USER.fullName,
    role: DEV_AUTH_BYPASS_USER.role,
  },
};

const devAuthBypassProfile: Profile = {
  account_type: "guest",
  avatar_url: DEV_AUTH_BYPASS_USER.avatarUrl,
  country_code: "EG",
  country_name: "Egypt",
  created_at: "2026-01-01T00:00:00.000Z",
  dialing_code: "+20",
  email: DEV_AUTH_BYPASS_USER.email,
  full_name: DEV_AUTH_BYPASS_USER.fullName,
  id: DEV_AUTH_BYPASS_USER.id,
  phone: null,
  updated_at: "2026-01-01T00:00:00.000Z",
};

export async function getCurrentUser(): Promise<User | null> {
  if (isDevAuthBypassEnabled()) {
    // TEMPORARY LOCAL DEVELOPMENT PREVIEW BYPASS: returns a mock traveler only
    // during `next dev` when NEXT_PUBLIC_DEV_AUTH_BYPASS=true.
    return devAuthBypassUser;
  }

  if (!getSupabaseConfig()) {
    return null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    return null;
  }

  return data.user;
}

export async function getCurrentProfile() {
  if (isDevAuthBypassEnabled()) {
    // TEMPORARY LOCAL DEVELOPMENT PREVIEW BYPASS: keep this in sync with the
    // traveler preview profile and remove with the bypass.
    return devAuthBypassProfile;
  }

  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, email, phone, country_code, country_name, dialing_code, account_type, avatar_url, created_at, updated_at")
    .eq("id", user.id)
    .maybeSingle<Profile>();

  return data ?? null;
}

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function requireRole(role: "guest" | "owner") {
  const user = await requireUser();
  const profile = await getCurrentProfile();

  if (profile?.account_type !== role) {
    redirect("/search");
  }

  return { profile, user };
}

export async function signOut() {
  const supabase = await createClient();
  return supabase.auth.signOut();
}
