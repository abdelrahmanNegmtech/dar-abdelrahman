"use client";

import { useState } from "react";
import Link from "next/link";
import { requestPasswordReset } from "../services/authService";
import { BrandLogo } from "./BrandLogo";
import { ForgotPasswordRequestCard } from "./ForgotPasswordRequestCard";
import { ChevronDownIcon, GlobeIcon } from "@/components/ui";

export function ForgotPasswordFlow() {
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="auth-forgot-flow w-full">
      <div className="mb-8 flex items-center justify-between lg:hidden">
        <Link aria-label="Go to DAR homepage" className="block w-fit" href="/">
          <BrandLogo compact />
        </Link>
        <ForgotPasswordLanguageAction mobile />
      </div>
      <ForgotPasswordRequestCard
        errorMessage={errorMessage}
        isLoading={isLoading}
        message={message}
        onRequestEmailReset={async (email) => {
          setErrorMessage("");
          setMessage("");
          setIsLoading(true);
          const { err } = await requestPasswordReset(email);
          setIsLoading(false);

          if (err) {
            setErrorMessage(err);
            return;
          }

          setMessage("If an account exists for this email, a reset link has been sent.");
        }}
      />
    </div>
  );
}

export function ForgotPasswordLanguageAction({ mobile = false }: { mobile?: boolean }) {
  return (
    <button
      className={`inline-flex items-center gap-3 rounded-full text-[14px] font-semibold transition focus-visible:outline-none focus-visible:ring-2 ${
        mobile
          ? "text-[#0F172A] focus-visible:ring-[#6C3DFF] focus-visible:ring-offset-2"
          : "text-white focus-visible:ring-white/80"
      }`}
      type="button"
    >
      <GlobeIcon className="size-5" />
      <span>English / EGP</span>
      <ChevronDownIcon className="size-4" />
    </button>
  );
}
