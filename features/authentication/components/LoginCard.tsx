import Link from "next/link";
import { BrandLogo } from "./BrandLogo";
import { LoginForm } from "./LoginForm";
import { SecurityCard } from "./SecurityCard";

export function LoginCard() {
  return (
    <section className="auth-card-login w-full max-w-[390px] rounded-[32px] border border-[#E5E7EB] bg-white px-6 py-8 shadow-[0_26px_90px_rgba(15,23,42,0.16)] sm:max-w-[560px] sm:px-9 sm:py-10 lg:max-w-[572px] lg:px-[48px] lg:py-[52px]">
      <div className="mb-11 flex items-center justify-center lg:hidden">
        <BrandLogo compact />
      </div>

      <header className="auth-card-header mb-8 lg:mb-[34px]">
        <h1 className="text-3xl font-bold leading-tight tracking-normal text-[#0F172A] sm:text-[33px]">
          Login to your account
        </h1>
        <p className="mt-3 text-[17px] leading-7 text-[#64748B]">
          Enter your details to access your account
        </p>
      </header>

      <LoginForm />

      <div className="auth-security-card-wrap mt-[34px]">
        <SecurityCard />
      </div>

      <p className="mt-7 text-center text-[15px] text-[#64748B]">
        Don&apos;t have an account?{" "}
        <Link
          className="font-bold text-[#6C3DFF] transition hover:text-[#4C22D4] focus-visible:rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C3DFF] focus-visible:ring-offset-2"
          href="/sign-up"
        >
          Sign up
        </Link>
      </p>
    </section>
  );
}
