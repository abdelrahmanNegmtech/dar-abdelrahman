import { AuthSplitShell } from "@/features/authentication/components/AuthSplitShell";
import { SignUpCard } from "@/features/authentication/components/SignUpCard";
import { SignUpHero } from "@/features/authentication/components/SignUpHero";

type SignUpPageProps = {
  searchParams?: Promise<{
    accountType?: string;
  }>;
};

export default async function SignUpPage({ searchParams }: SignUpPageProps) {
  const params = await searchParams;
  const accountType = params?.accountType === "owner" ? "owner" : "guest";

  return (
    <AuthSplitShell
      card={<SignUpCard accountType={accountType} />}
      cardMaxWidthClassName="max-w-[616px]"
      hero={<SignUpHero />}
    />
  );
}
