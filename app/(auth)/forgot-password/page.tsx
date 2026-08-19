import {
  ForgotPasswordFlow,
  ForgotPasswordHero,
} from "@/features/authentication/components";
import { ForgotPasswordLanguageAction } from "@/features/authentication/components/ForgotPasswordFlow";
import { AuthSplitShell } from "@/features/authentication/components/AuthSplitShell";

export default function ForgotPasswordPage() {
  return (
    <AuthSplitShell
      card={<ForgotPasswordFlow />}
      cardMaxWidthClassName="max-w-[616px]"
      hero={<ForgotPasswordHero />}
      topAction={<ForgotPasswordLanguageAction />}
    />
  );
}
