import { cookies } from "next/headers";
import { missingSupabaseConfigMessage, tryGetSupabasePublicConfig } from "@/lib/supabase/config";
import { getCurrentUser } from "@/lib/supabase/auth";
import { AuthSplitShell } from "@/features/authentication/components/AuthSplitShell";
import { PasswordResetCard } from "@/features/authentication/components/PasswordResetCard";
import { PasswordResetHero } from "@/features/authentication/components/PasswordResetHero";

export default async function PasswordResetPage() {
  const hasSupabaseConfig = Boolean(tryGetSupabasePublicConfig());
  let initialError = missingSupabaseConfigMessage;

  if (hasSupabaseConfig) {
    const user = await getCurrentUser();
    const recoveryCookie = (await cookies()).get("dar-password-recovery");
    const hasRecoverySession = Boolean(user && recoveryCookie?.value === "1");
    initialError = hasRecoverySession
      ? ""
      : "This password reset link is invalid or expired. Please request a new link.";
  }

  return (
    <AuthSplitShell
      card={<PasswordResetCard initialError={initialError} />}
      cardMaxWidthClassName="max-w-[604px]"
      hero={<PasswordResetHero />}
    />
  );
}
