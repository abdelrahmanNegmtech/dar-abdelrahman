import { OwnerIdentityProvider } from "@/components/owner/owner-identity-context";
import { buildOwnerIdentity } from "@/components/owner/owner-identity";
import { getCurrentProfile } from "@/lib/supabase/auth";

export default async function OwnerDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const profile = await getCurrentProfile();

  return (
    <OwnerIdentityProvider value={buildOwnerIdentity(profile)}>
      <div className="dar-owner-dashboard contents">{children}</div>
    </OwnerIdentityProvider>
  );
}
