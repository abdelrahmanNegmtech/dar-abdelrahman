"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button, LockIcon } from "@/components/ui";
import { resendVerificationEmail } from "../services/authService";
import { validateEmail } from "../services/authValidation";
import { BrandLogo } from "./BrandLogo";
import { EmailIllustration } from "./EmailIllustration";
import { EmailInformationCard } from "./EmailInformationCard";

type VerifyEmailCardProps = {
  email?: string;
};

export function VerifyEmailCard({ email = "" }: VerifyEmailCardProps) {
  const [countdown, setCountdown] = useState(45);
  const [helpOpen, setHelpOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = window.setInterval(() => setCountdown((current) => Math.max(0, current - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [countdown]);

  async function handleResend() {
    setErrorMessage("");
    setMessage("");

    if (!email || !validateEmail(email)) {
      setErrorMessage("Please return to account creation and enter your email again.");
      return;
    }

    setIsResending(true);
    const { err } = await resendVerificationEmail(email);
    setIsResending(false);

    if (err) {
      setErrorMessage(err);
      return;
    }

    setCountdown(45);
    setMessage("Verification email sent. Please check your inbox.");
  }

  return (
    <section className="auth-card-verify w-full max-w-[390px] rounded-[32px] border border-[#E5E7EB] bg-white px-6 py-8 text-center shadow-[0_26px_90px_rgba(15,23,42,0.16)] sm:max-w-[580px] sm:px-10 sm:py-10 lg:max-w-[580px] lg:px-[58px] lg:py-[48px]">
      <div className="mb-10 flex items-center justify-between lg:hidden">
        <BrandLogo compact />
        <button
          className="inline-flex items-center gap-2 text-sm font-bold text-[#6C3DFF] transition hover:text-[#5A30E8] focus-visible:rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C3DFF] focus-visible:ring-offset-2"
          onClick={() => setHelpOpen((current) => !current)}
          type="button"
        >
          Need help?
        </button>
      </div>

      <EmailIllustration />

      <header className="mt-4">
        <h1 className="text-[32px] font-bold leading-tight text-[#0F172A]">
          Verify your email
        </h1>
        <p className="mx-auto mt-4 max-w-[360px] text-[18px] leading-7 text-[#334155]">
          We&apos;ve sent a verification link to
          <br />
          {email ? (
            <a className="font-bold text-[#5E2FE5]" href={`mailto:${email}`}>
              {email}
            </a>
          ) : (
            <span className="font-bold text-[#5E2FE5]">your email address</span>
          )}
        </p>
      </header>

      {helpOpen ? (
        <div className="mt-5 rounded-lg border border-[#E9E5FF] bg-[#F7F5FF] px-4 py-3 text-left text-[13px] leading-5 text-[#334155]">
          Check spam first. If it still does not arrive, resend the link or change the email address.
        </div>
      ) : null}

      <div className="mt-9">
        <EmailInformationCard />
      </div>

      <div className="mt-8 text-[16px] leading-7 text-[#334155]">
        <p>Haven&apos;t received the email?</p>
        <p className="font-bold text-[#5E2FE5]">
          {countdown > 0 ? `Resend link in 00:${String(countdown).padStart(2, "0")}` : "You can resend now"}
        </p>
      </div>

      {message ? (
        <p className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-[13px] font-semibold text-emerald-700">
          {message}
        </p>
      ) : null}

      {errorMessage ? (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[13px] font-semibold text-red-700">
          {errorMessage}
        </p>
      ) : null}

      <Button className="mt-8 h-[54px] w-full text-base" disabled={countdown > 0 || isResending} onClick={handleResend} type="button">
        {isResending ? "Sending..." : "Resend verification email"}
      </Button>

      <div className="mt-8 flex items-center gap-5 text-sm text-[#64748B]">
        <span className="h-px flex-1 bg-[#E5E7EB]" />
        <span className="shrink-0">or</span>
        <span className="h-px flex-1 bg-[#E5E7EB]" />
      </div>

      <Button
        className="mt-8 h-[54px] w-full border-[#6C3DFF] text-base font-bold text-[#5E2FE5] shadow-none hover:border-[#5A30E8] hover:bg-[#F7F5FF]"
        type="button"
        variant="outline"
      >
        <Link className="flex size-full items-center justify-center" href="/sign-up">
          Change email address
        </Link>
      </Button>

      <footer className="mt-10 flex items-center justify-center gap-3 text-[16px] text-[#64748B]">
        <LockIcon className="size-5" />
        <span>Your information is safe with us</span>
      </footer>
    </section>
  );
}
