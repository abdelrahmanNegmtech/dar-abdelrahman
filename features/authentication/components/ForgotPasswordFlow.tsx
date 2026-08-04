"use client";

import { useState } from "react";
import { requestPasswordReset } from "../services/authService";
import { BrandLogo } from "./BrandLogo";
import { ForgotPasswordRequestCard } from "./ForgotPasswordRequestCard";
import { ChevronDownIcon, GlobeIcon } from "@/components/ui";

export function ForgotPasswordFlow() {
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  return (
    <section className="auth-forgot-flow relative z-10 flex min-h-dvh flex-1 flex-col bg-[#F8FAFC] px-5 py-7 sm:px-8 lg:h-full lg:min-h-0 lg:overflow-hidden lg:px-9 xl:px-[34px]">
      <div className="flex shrink-0 items-center justify-between pb-8 lg:absolute lg:right-9 lg:top-7 lg:z-20 lg:pb-0 xl:right-[34px]">
        <div className="lg:hidden">
          <BrandLogo compact />
        </div>
        <button
          className="inline-flex items-center gap-3 rounded-full text-[14px] font-semibold text-[#0F172A] transition hover:text-[#6C3DFF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C3DFF] focus-visible:ring-offset-2"
          type="button"
        >
          <GlobeIcon className="size-5" />
          <span>English / EGP</span>
          <ChevronDownIcon className="size-4" />
        </button>
      </div>

      <div className="relative mx-auto flex min-h-0 w-full max-w-[520px] flex-1 items-center justify-center overflow-x-hidden py-6 lg:overflow-visible">
        <div className="my-auto w-full">
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
      </div>
    </section>
  );
}
