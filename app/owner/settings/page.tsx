import { unstable_noStore as noStore } from "next/cache";
import { OwnerShell } from "@/components/owner/owner-shell";
import { getOwnerVerificationPageData } from "@/features/verification/data/owner-verification-queries";
import { requireOwner } from "@/lib/supabase/auth";
import { ownerRoutes } from "@/lib/owner-routes";
import OwnerSettingsPageClient from "./settings-page-client";
import type { OwnerSettingsPageData } from "./settings-types";

export default async function OwnerSettingsPage() {
  noStore();

  const [{ profile }, verificationData] = await Promise.all([
    requireOwner(),
    getOwnerVerificationPageData(),
  ]);

  const data: OwnerSettingsPageData = {
    profile: {
      address: profile.address,
      avatarUrl: profile.avatar_url,
      city: profile.city,
      country: profile.country,
      countryName: profile.country_name,
      createdAt: profile.created_at,
      displayName: profile.display_name,
      email: profile.email,
      emailVerified: profile.email_verified,
      fullName: profile.full_name,
      identityVerified: profile.identity_verified,
      phone: profile.phone,
      phoneVerified: profile.phone_verified,
      preferredCurrency: profile.preferred_currency,
      preferredLanguage: profile.preferred_language,
      updatedAt: profile.updated_at,
    },
    verification: {
      approvedAt: verificationData.verification.approvedAt,
      href: ownerRoutes.verification,
      rejectedAt: verificationData.verification.rejectedAt,
      status: verificationData.verification.status,
      statusLabel: verificationData.verification.statusLabel,
      submittedAt: verificationData.verification.submittedAt,
    },
  };

  return (
    <OwnerShell active="Settings">
      <OwnerSettingsPageClient data={data} />
    </OwnerShell>
  );
}
