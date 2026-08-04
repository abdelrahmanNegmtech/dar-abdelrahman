"use client";

import Link from "next/link";
import { type FormEvent, useState } from "react";
import {
  ArrowLeftIcon,
  Button,
  LockIcon,
  MailIcon,
  PaperPlaneIcon,
  PhoneIcon,
} from "@/components/ui";
import { defaultCountry, type CountryOption } from "../data/countries";
import { validateEmail } from "../services/authValidation";
import { CountrySelect } from "./CountrySelect";

type ForgotPasswordRequestCardProps = {
  errorMessage: string;
  isLoading: boolean;
  message: string;
  onRequestEmailReset: (email: string) => Promise<void>;
};

export function ForgotPasswordRequestCard({
  errorMessage,
  isLoading,
  message,
  onRequestEmailReset,
}: ForgotPasswordRequestCardProps) {
  const [method, setMethod] = useState<"email" | "phone">("email");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState<CountryOption | null>(defaultCountry);
  const [phone, setPhone] = useState("");
  const [localError, setLocalError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLocalError("");

    if (method === "phone") {
      setLocalError("Phone and WhatsApp OTP are not available yet. Please use email recovery.");
      return;
    }

    if (!email) {
      setLocalError("Please enter your email address.");
      return;
    }

    if (!validateEmail(email)) {
      setLocalError("Please enter a valid email address.");
      return;
    }

    await onRequestEmailReset(email);
  }

  return (
    <section className="auth-card-forgot w-full rounded-xl border border-[#E5E7EB] bg-white px-6 py-8 shadow-[0_16px_45px_rgba(15,23,42,0.08)] sm:px-9 lg:px-[38px] lg:py-[34px]">
      <header>
        <h1 className="text-[28px] font-bold leading-tight text-[#0F172A] sm:text-[30px]">
          Forgot your password?
        </h1>
        <p className="mt-2 max-w-[360px] text-[15px] leading-6 text-[#475569]">
          Enter your email and we&apos;ll send a secure password reset link.
        </p>
      </header>

      <div className="mt-6 grid h-[44px] grid-cols-2 overflow-hidden rounded-md border border-[#D8DEE8] bg-white">
        <button
          aria-pressed={method === "email"}
          className={`inline-flex items-center justify-center gap-3 text-sm transition hover:bg-slate-50 ${
            method === "email"
              ? "rounded-[5px] border border-[#C8B7FF] bg-[#F7F2FF] font-bold text-[#5E2FE5]"
              : "font-semibold text-[#475569]"
          }`}
          onClick={() => setMethod("email")}
          type="button"
        >
          <MailIcon className="size-5" />
          Email
        </button>
        <button
          aria-pressed={method === "phone"}
          className="inline-flex cursor-not-allowed items-center justify-center gap-3 text-sm font-semibold text-[#64748B] opacity-60"
          disabled
          title="Phone and WhatsApp OTP are not configured yet"
          type="button"
        >
          <PhoneIcon className="size-5" />
          Phone / WhatsApp
        </button>
      </div>

      <ForgotPasswordStepper />

      <form className="mt-8" noValidate onSubmit={handleSubmit}>
        <h2 className="text-[18px] font-bold text-[#0F172A]">
          Verify your account
        </h2>
        <p className="mt-2 max-w-[310px] text-[14px] leading-6 text-[#64748B]">
          {method === "email"
            ? "Enter your email address to receive a password reset link."
            : "Phone and WhatsApp OTP are not configured for this project yet."}
        </p>

        <div className={method === "email" ? "mt-4" : "mt-4 grid gap-2 sm:grid-cols-[128px_1fr]"}>
          {method === "phone" ? (
            <CountrySelect
              compact
              hideLabel
              id="recovery-country"
              label="Recovery phone country"
              onChange={setCountry}
              value={country}
            />
          ) : null}
          <div className="h-[44px] rounded-xl border border-[#D8DEE8] bg-white px-4 text-[#64748B] transition hover:border-slate-300 focus-within:border-[#6C3DFF] focus-within:ring-4 focus-within:ring-[#6C3DFF]/10">
            <label className="sr-only" htmlFor={method === "email" ? "recovery-email" : "recovery-phone"}>
              {method === "email" ? "Email address" : "Phone number"}
            </label>
            <div className="flex h-full items-center gap-3">
              <input
                className="min-w-0 flex-1 bg-transparent text-[14px] text-[#0F172A] outline-none placeholder:text-[#64748B]"
                id={method === "email" ? "recovery-email" : "recovery-phone"}
                onChange={(event) =>
                  method === "email"
                    ? setEmail(event.target.value)
                    : setPhone(event.target.value)
                }
                placeholder={method === "email" ? "you@example.com" : "10 1234 5678"}
                type={method === "email" ? "email" : "tel"}
                value={method === "email" ? email : phone}
              />
              {method === "email" ? (
                <MailIcon className="size-5 shrink-0 text-[#64748B]" />
              ) : (
                <PhoneIcon className="size-5 shrink-0 text-[#64748B]" />
              )}
            </div>
          </div>
        </div>

        <div className="mt-5 flex items-center gap-5 text-sm text-[#64748B]">
          <span className="h-px flex-1 bg-[#E5E7EB]" />
          <span>or</span>
          <span className="h-px flex-1 bg-[#E5E7EB]" />
        </div>

        <div className="mt-4 text-center">
          <button
            className="text-[15px] font-semibold text-[#5E2FE5] transition hover:text-[#4C22D4] focus-visible:rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C3DFF]"
            onClick={() => setLocalError("Phone and WhatsApp OTP are not available yet. Please use email recovery.")}
            type="button"
          >
            Phone recovery unavailable
          </button>
        </div>

        {localError || errorMessage ? (
          <p className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {localError || errorMessage}
          </p>
        ) : null}

        {message ? (
          <p className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            {message}
          </p>
        ) : null}

      <Button className="mt-5 h-[50px] w-full text-base" disabled={isLoading} type="submit">
        {isLoading ? "Sending..." : method === "email" ? "Send reset email" : "Use email recovery"}
        <PaperPlaneIcon className="size-6" />
      </Button>
      </form>

      <Link
        className="mt-6 inline-flex items-center gap-2 text-[15px] font-semibold text-[#5E2FE5] transition hover:text-[#4C22D4] focus-visible:rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C3DFF]"
        href="/login"
      >
        <ArrowLeftIcon className="size-4" />
        Back to sign in
      </Link>

      <section className="mt-8 flex items-center gap-5 rounded-lg border border-[#E9E5FF] bg-[#F7F5FF] px-5 py-5">
        <div className="flex size-[58px] shrink-0 items-center justify-center rounded-full bg-white text-[#5E2FE5] shadow-[0_10px_24px_rgba(108,61,255,0.13)]">
          <LockIcon className="size-7" />
        </div>
        <div>
          <h2 className="text-[15px] font-bold text-[#0F172A]">
            Your security is our priority
          </h2>
          <p className="mt-1 text-[13px] leading-6 text-[#64748B]">
            Password reset links are single-use and expire automatically for
            your protection.
          </p>
        </div>
      </section>
    </section>
  );
}

function ForgotPasswordStepper() {
  const steps = ["Verify account", "Enter code", "Set new password"];

  return (
    <div className="mt-8">
      <div className="relative mx-auto flex max-w-[320px] items-center justify-between">
        <span className="absolute left-[38px] right-[38px] top-1/2 h-px -translate-y-1/2 border-t border-dashed border-[#D8DEE8]" />
        {[1, 2, 3].map((step) => (
          <div
            className={`relative z-10 flex size-9 items-center justify-center rounded-full border text-[15px] font-bold ${
              step === 1
                ? "border-[#5E2FE5] bg-[linear-gradient(180deg,#7443FF_0%,#5E2FE5_100%)] text-white shadow-[0_12px_24px_rgba(108,61,255,0.24)]"
                : "border-[#D8DEE8] bg-white text-[#0F172A]"
            }`}
            key={step}
          >
            {step}
          </div>
        ))}
      </div>
      <div className="mt-3 grid grid-cols-3 text-center text-[13px]">
        {steps.map((step, index) => (
          <span
            className={index === 0 ? "font-semibold text-[#5E2FE5]" : "text-[#475569]"}
            key={step}
          >
            {index + 1}. {step}
          </span>
        ))}
      </div>
    </div>
  );
}

