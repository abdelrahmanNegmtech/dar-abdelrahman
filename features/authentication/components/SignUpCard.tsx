import Link from "next/link";
import { BrandLogo } from "./BrandLogo";
import { AuthSegmentedControl } from "./AuthSegmentedControl";
import { SignUpForm } from "./SignUpForm";

type SignUpCardProps = {
  accountType?: "guest" | "owner";
};

export function SignUpCard({ accountType = "guest" }: SignUpCardProps) {
  return (
    <section className="auth-card-signup w-full max-w-[390px] rounded-[32px] border border-[#E5E7EB] bg-white px-6 py-8 shadow-[0_26px_90px_rgba(15,23,42,0.16)] sm:max-w-[610px] sm:px-9 sm:py-10 lg:max-w-[616px] lg:px-[64px] lg:py-[40px]">
      <div className="mb-9 flex items-center justify-center lg:hidden">
        <BrandLogo compact />
      </div>

      <header className="auth-card-header mb-6">
        <h1 className="text-3xl font-bold leading-tight tracking-normal text-[#0F172A] sm:text-[28px]">
          Create your account
        </h1>
        <p className="mt-2 text-[16px] leading-7 text-[#64748B]">
          Join DAR and start your journey
        </p>
      </header>

      <div className="auth-segmented-wrap mb-6">
        <AuthSegmentedControl />
      </div>

      <SignUpForm accountType={accountType} />

      <p className="mt-7 text-center text-[15px] text-[#64748B]">
        Already have an account?{" "}
        <Link
          className="font-bold text-[#6C3DFF] transition hover:text-[#4C22D4] focus-visible:rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C3DFF] focus-visible:ring-offset-2"
          href="/login"
        >
          Login
        </Link>
      </p>
    </section>
  );
}
