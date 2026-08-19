"use client";

import Link from "next/link";
import { type FormEvent, useState } from "react";
import {
  ArrowLeftIcon,
  Button,
  EyeIcon,
  EyeOffIcon,
  LockIcon,
  TextInput,
} from "@/components/ui";
import { updatePassword } from "../services/authService";
import { validatePassword } from "../services/authValidation";
import { BrandLogo } from "./BrandLogo";
import { PasswordRequirementList } from "./PasswordRequirementList";
import { SecurityCard } from "./SecurityCard";

type PasswordResetCardProps = {
  initialError?: string;
};

export function PasswordResetCard({ initialError = "" }: PasswordResetCardProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState(initialError);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setMessage("");

    if (initialError) {
      setErrorMessage(initialError);
      return;
    }

    if (!password || !confirmPassword) {
      setErrorMessage("Please enter and confirm your new password.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    if (!validatePassword(password)) {
      setErrorMessage("Password must be at least 8 characters and include an uppercase letter and a number.");
      return;
    }

    setIsLoading(true);
    const { err } = await updatePassword(password);
    setIsLoading(false);

    if (err) {
      setErrorMessage(err);
      return;
    }

    setMessage("Password updated. You can now sign in.");
  }

  return (
    <section className="auth-card-reset w-full max-w-[390px] rounded-[32px] border border-[#E5E7EB] bg-white px-6 py-8 shadow-[0_26px_90px_rgba(15,23,42,0.16)] sm:max-w-[604px] sm:px-10 sm:py-10 lg:max-w-[604px] lg:px-[52px] lg:py-[44px]">
      <div className="mb-10 flex items-center justify-between lg:hidden">
        <Link aria-label="Go to DAR homepage" className="block w-fit" href="/">
          <BrandLogo compact />
        </Link>
        <Link
          className="text-sm font-bold text-[#6C3DFF] transition hover:text-[#5A30E8] focus-visible:rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C3DFF] focus-visible:ring-offset-2"
          href="/login"
        >
          Login
        </Link>
      </div>

      <div className="mb-8 flex size-[66px] items-center justify-center rounded-full bg-[#F0E9FF] text-[#5E2FE5]">
        <LockIcon className="size-8" />
      </div>

      <header className="mb-8">
        <h1 className="text-[30px] font-bold leading-tight tracking-normal text-[#0F172A] sm:text-[32px]">
          Reset your password
        </h1>
        <p className="mt-3 text-[17px] leading-7 text-[#64748B]">
          Enter your new password below.
        </p>
      </header>

      <form className="space-y-[24px]" noValidate onSubmit={handleSubmit}>
        <TextInput
          autoComplete="new-password"
          endIcon={
            <EyeButton
              isVisible={showPassword}
              label={showPassword ? "Hide new password" : "Show new password"}
              onClick={() => setShowPassword((value) => !value)}
            />
          }
          icon={<LockIcon className="size-5" />}
          id="new-password"
          label="New password"
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Enter your new password"
          type={showPassword ? "text" : "password"}
          value={password}
        />

        <PasswordRequirementList />

        <TextInput
          autoComplete="new-password"
          endIcon={
            <EyeButton
              isVisible={showConfirmPassword}
              label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
              onClick={() => setShowConfirmPassword((value) => !value)}
            />
          }
          icon={<LockIcon className="size-5" />}
          id="confirm-new-password"
          label="Confirm new password"
          onChange={(event) => setConfirmPassword(event.target.value)}
          placeholder="Confirm your new password"
          type={showConfirmPassword ? "text" : "password"}
          value={confirmPassword}
        />

        {errorMessage ? (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {errorMessage}
          </p>
        ) : null}

        {message ? (
          <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            {message}
          </p>
        ) : null}

        <Button className="h-[54px] w-full text-base" disabled={isLoading || Boolean(initialError)} type="submit">
          {isLoading ? "Resetting..." : "Reset password"}
        </Button>
      </form>

      <div className="mt-8">
        <SecurityCard />
      </div>

      <div className="mt-8 flex justify-center">
        <Link
          className="inline-flex items-center gap-3 text-base font-bold text-[#5E2FE5] transition hover:text-[#4C22D4] focus-visible:rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C3DFF] focus-visible:ring-offset-2"
          href="/login"
        >
          <ArrowLeftIcon className="size-5" />
          Back to login
        </Link>
      </div>
    </section>
  );
}

function EyeButton({
  isVisible,
  label,
  onClick,
}: {
  isVisible: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      aria-label={label}
      className="rounded-md p-1 transition hover:text-[#6C3DFF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C3DFF]"
      onClick={onClick}
      type="button"
    >
      {isVisible ? <EyeIcon className="size-5" /> : <EyeOffIcon className="size-5" />}
    </button>
  );
}
