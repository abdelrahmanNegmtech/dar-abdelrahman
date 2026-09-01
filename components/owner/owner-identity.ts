import type { Profile } from "@/lib/supabase/auth";

export type OwnerIdentity = {
  accountLabel: string;
  avatarUrl: string | null;
  currencyLabel: string | null;
  displayName: string;
  fullName: string;
  languageLabel: string | null;
  locationLabel: string | null;
  publicProfile: null;
};

export const fallbackOwnerIdentity: OwnerIdentity = {
  accountLabel: "Owner account",
  avatarUrl: null,
  currencyLabel: null,
  displayName: "Owner account",
  fullName: "Owner account",
  languageLabel: null,
  locationLabel: null,
  publicProfile: null,
};

function pickDisplayName(profile: Profile | null) {
  const displayName = profile?.display_name?.trim();

  if (displayName) {
    return displayName;
  }

  const fullName = profile?.full_name?.trim();

  if (fullName) {
    return fullName;
  }

  return profile?.email ?? fallbackOwnerIdentity.displayName;
}

export function buildOwnerIdentity(profile: Profile | null): OwnerIdentity {
  const displayName = pickDisplayName(profile);
  const fullName = profile?.full_name?.trim() || displayName;
  const locationParts = [profile?.city, profile?.country_name ?? profile?.country].filter(
    (value): value is string => Boolean(value?.trim()),
  );

  return {
    accountLabel: profile?.identity_verified ? "Verified Owner" : "Owner account",
    avatarUrl: profile?.avatar_url ?? null,
    currencyLabel: profile?.preferred_currency?.trim() || null,
    displayName,
    fullName,
    languageLabel: profile?.preferred_language?.trim() || null,
    locationLabel: locationParts.length > 0 ? locationParts.join(", ") : null,
    publicProfile: null,
  };
}

export function getOwnerPreferenceSummary(identity: OwnerIdentity) {
  if (identity.languageLabel && identity.currencyLabel) {
    return `${identity.languageLabel} / ${identity.currencyLabel}`;
  }

  return identity.languageLabel ?? identity.currencyLabel ?? "Preferences";
}
