import { AuthSplitShell } from "@/features/authentication/components/AuthSplitShell";
import { LoginCard } from "@/features/authentication/components/LoginCard";
import { LoginHero } from "@/features/authentication/components/LoginHero";

export default function LoginPage() {
  return (
    <AuthSplitShell
      card={<LoginCard />}
      cardMaxWidthClassName="max-w-[572px]"
      hero={<LoginHero />}
    />
  );
}
