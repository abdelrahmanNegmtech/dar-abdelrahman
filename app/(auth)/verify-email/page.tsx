import { AuthSplitShell } from "@/features/authentication/components/AuthSplitShell";
import { VerifyEmailCard } from "@/features/authentication/components/VerifyEmailCard";
import { VerifyEmailHero } from "@/features/authentication/components/VerifyEmailHero";

type VerifyEmailPageProps = {
  searchParams?: Promise<{
    email?: string;
  }>;
};

export default async function VerifyEmailPage({ searchParams }: VerifyEmailPageProps) {
  const params = await searchParams;
  const email = params?.email ?? "";

  return (
    <AuthSplitShell
      card={<VerifyEmailCard email={email} />}
      cardMaxWidthClassName="max-w-[580px]"
      hero={<VerifyEmailHero />}
    />
  );
}