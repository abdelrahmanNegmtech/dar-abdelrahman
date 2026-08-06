import { cache } from "react";
import type { User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { DEV_AUTH_BYPASS_USER, isDevAuthBypassEnabled } from "@/lib/auth/devAuthBypass";
import type { AccountType, ProfileRow, UserAccountType } from "./database";
import { getSupabaseConfig } from "./config";
import { createClient } from "./server";

export type Profile = Pick<
  ProfileRow,
  | "account_type"
  | "address"
  | "avatar_url"
  | "city"
  | "country"
  | "country_code"
  | "country_name"
  | "created_at"
  | "date_of_birth"
  | "display_name"
  | "dialing_code"
  | "email"
  | "email_verified"
  | "emergency_contact_name"
  | "emergency_contact_phone"
  | "full_name"
  | "id"
  | "identity_verified"
  | "nationality"
  | "phone"
  | "phone_verified"
  | "preferred_currency"
  | "preferred_language"
  | "updated_at"
>;

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
  address: null,
  account_type: "guest",
  avatar_url: DEV_AUTH_BYPASS_USER.avatarUrl,
  city: null,
  country: null,
  country_code: "EG",
  country_name: "Egypt",
  created_at: "2026-01-01T00:00:00.000Z",
  date_of_birth: null,
  display_name: DEV_AUTH_BYPASS_USER.fullName.split(" ")[0] ?? DEV_AUTH_BYPASS_USER.fullName,
  dialing_code: "+20",
  email: DEV_AUTH_BYPASS_USER.email,
  email_verified: true,
  emergency_contact_name: null,
  emergency_contact_phone: null,
  full_name: DEV_AUTH_BYPASS_USER.fullName,
  id: DEV_AUTH_BYPASS_USER.id,
  identity_verified: false,
  nationality: null,
  phone: null,
  phone_verified: true,
  preferred_currency: null,
  preferred_language: null,
  updated_at: "2026-01-01T00:00:00.000Z",
};

const getCurrentUserInternal = cache(async (): Promise<User | null> => {
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
});

const getCurrentProfileInternal = cache(async (): Promise<Profile | null> => {
  if (isDevAuthBypassEnabled()) {
    // TEMPORARY LOCAL DEVELOPMENT PREVIEW BYPASS: keep this in sync with the
    // traveler preview profile and remove with the bypass.
    return devAuthBypassProfile;
  }

  const user = await getCurrentUserInternal();

  if (!user) {
    return null;
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select(
      "id, account_type, address, avatar_url, city, country, country_code, country_name, created_at, date_of_birth, display_name, dialing_code, email, email_verified, emergency_contact_name, emergency_contact_phone, full_name, identity_verified, nationality, phone, phone_verified, preferred_currency, preferred_language, updated_at",
    )
    .eq("id", user.id)
    .maybeSingle();

  return data ?? null;
});

export async function getCurrentUser(): Promise<User | null> {
  return getCurrentUserInternal();
}

export async function getCurrentProfile() {
  return getCurrentProfileInternal();
}

export async function requireAuthenticatedUser() {
  const user = await getCurrentUserInternal();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function requireUser() {
  return requireAuthenticatedUser();
}

export async function requireAccountType(
  requiredAccountType: AccountType | readonly AccountType[],
) {
  const user = await requireAuthenticatedUser();
  const profile = await getCurrentProfileInternal();
  const allowedAccountTypes = Array.isArray(requiredAccountType)
    ? requiredAccountType
    : [requiredAccountType];

  if (!profile || !allowedAccountTypes.includes(profile.account_type)) {
    redirect("/search");
  }

  return { profile, user };
}

export async function requireRole(role: UserAccountType) {
  return requireAccountType(role);
}

export async function requireAdmin() {
  return requireAccountType("admin");
}

export async function requireOwner() {
  return requireAccountType("owner");
}

export async function requireSupportStaff() {
  return requireAccountType("support_staff");
}

export async function signOut() {
  if (!getSupabaseConfig()) {
    return { error: null };
  }

  const supabase = await createClient();
  return supabase.auth.signOut();
}
