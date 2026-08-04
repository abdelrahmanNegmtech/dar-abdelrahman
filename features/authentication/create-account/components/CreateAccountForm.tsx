"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type ChangeEvent, type FormEvent, type ReactNode, useState } from "react";
import {
  Button,
  CheckIcon,
  EyeIcon,
  EyeOffIcon,
  LockIcon,
  MailIcon,
  PhoneIcon,
  SmartphoneIcon,
  UserIcon,
} from "@/components/ui";
import type { AccountType } from "../../authTypes";
import { CountrySelect } from "../../components/CountrySelect";
import { defaultCountry, type CountryOption } from "../../data/countries";
import { getRoleDestination } from "../../services/authRedirects";
import { signInWithOAuth, signUpWithEmail } from "../../services/authService";
import {
  validateEmail,
  validateOptionalPhone,
  validatePassword,
} from "../../services/authValidation";
import { formatPhoneForDisplay } from "../../services/phoneUtils";
import { AccountTypeSelector } from "./AccountTypeSelector";

export function CreateAccountForm() {
  const router = useRouter();
  const [accountType, setAccountType] = useState<AccountType>("guest");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState<CountryOption | null>(defaultCountry);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [method, setMethod] = useState<"email" | "sms">("email");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeProvider, setActiveProvider] = useState<"facebook" | "google" | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isLoading) return;
    setErrorMessage("");

    if (!fullName || !email || !password || !confirmPassword) {
      setErrorMessage("Please complete the required fields.");
      return;
    }

    if (!country) {
      setErrorMessage("Please select your country.");
      return;
    }

    if (!validateEmail(email)) {
      setErrorMessage("Please enter a valid email address.");
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

    const formattedPhone = formatPhoneForDisplay(country, phone);

    if (!validateOptionalPhone(formattedPhone)) {
      setErrorMessage("Please enter a valid phone number or leave it empty.");
      return;
    }

    if (!acceptedTerms) {
      setErrorMessage("Please accept the terms before creating your account.");
      return;
    }

    setIsLoading(true);
    const { data, err } = await signUpWithEmail({
      accountType,
      countryCode: country.code,
      countryName: country.name,
      dialingCode: country.dialingCode,
      email,
      fullName,
      password,
      phone: formattedPhone,
    });
    setIsLoading(false);

    if (err) {
      setErrorMessage(err);
      return;
    }

    if (data.session) {
      router.replace(getRoleDestination(accountType));
      router.refresh();
      return;
    }

    router.replace(`/verify-email?email=${encodeURIComponent(email)}`);
  }

  function clearError() {
    if (errorMessage) setErrorMessage("");
  }

  return (
    <section className="w-full rounded-lg border border-[#E5E7EB] bg-white px-5 py-5 shadow-[0_16px_52px_rgba(15,23,42,0.08)] sm:px-6 lg:px-[22px]">
      <div className="grid grid-cols-2 border-b border-[#E5E7EB] text-center text-[15px]">
        <button className="pb-4 text-[#334155]" type="button">
          Sign in
        </button>
        <button
          aria-pressed="true"
          className="border-b-2 border-[#6C3DFF] pb-4 font-semibold text-[#5E2FE5]"
          type="button"
        >
          Create account
        </button>
      </div>

      <div className="mt-6">
        <h2 className="text-[15px] font-medium text-[#0F172A]">
          Choose account type
        </h2>
        <div className="mt-3">
          <AccountTypeSelector onChange={setAccountType} value={accountType} />
        </div>
      </div>

      <form className="mt-5 space-y-3.5" noValidate onSubmit={handleSubmit}>
        <CompactField
          icon={<UserIcon className="size-5" />}
          id="create-full-name"
          label="Full name"
          onChange={(event) => {
            setFullName(event.target.value);
            clearError();
          }}
          placeholder="Enter your full name"
          value={fullName}
        />
        <CompactField
          icon={<MailIcon className="size-5" />}
          id="create-email"
          label="Email address"
          onChange={(event) => {
            setEmail(event.target.value);
            clearError();
          }}
          placeholder="you@example.com"
          type="email"
          value={email}
        />

        <div className="space-y-2">
          <label className="block text-[13px] font-medium text-[#334155]">
            Phone number
          </label>
          <div className="grid grid-cols-[114px_1fr] gap-3">
            <CountrySelect
              className="min-w-0"
              compact
              hideLabel
              id="create-country"
              label="Country code"
              onChange={(value) => {
                setCountry(value);
                clearError();
              }}
              value={country}
            />
            <div className="flex h-9 items-center gap-3 rounded-md border border-[#D8DEE8] bg-white px-3 text-[#64748B] transition focus-within:border-[#6C3DFF] focus-within:ring-4 focus-within:ring-[#6C3DFF]/10">
              <input
                className="min-w-0 flex-1 bg-transparent text-[13px] text-[#0F172A] outline-none placeholder:text-[#64748B]"
                onChange={(event) => {
                  setPhone(event.target.value);
                  clearError();
                }}
                placeholder="10 1234 5678"
                type="tel"
                value={phone}
              />
              <PhoneIcon className="size-4 shrink-0" />
            </div>
          </div>
        </div>

        <CompactField
          endIcon={
            <EyeButton
              isVisible={showPassword}
              label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword((current) => !current)}
            />
          }
          icon={<LockIcon className="size-5" />}
          id="create-password"
          label="Password"
          onChange={(event) => {
            setPassword(event.target.value);
            clearError();
          }}
          placeholder="Create a strong password"
          type={showPassword ? "text" : "password"}
          value={password}
        />
        <CompactField
          endIcon={
            <EyeButton
              isVisible={showConfirmPassword}
              label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
              onClick={() => setShowConfirmPassword((current) => !current)}
            />
          }
          icon={<LockIcon className="size-5" />}
          id="create-confirm-password"
          label="Confirm password"
          onChange={(event) => {
            setConfirmPassword(event.target.value);
            clearError();
          }}
          placeholder="Confirm your password"
          type={showConfirmPassword ? "text" : "password"}
          value={confirmPassword}
        />

        <div className="space-y-2">
          <p className="text-[13px] font-medium text-[#334155]">
            Verification method
          </p>
          <div className="grid h-[42px] grid-cols-2 overflow-hidden rounded-md border border-[#D8DEE8] bg-white">
            <button
              aria-pressed={method === "email"}
              className={`inline-flex items-center justify-center gap-2 border text-[13px] font-semibold ${
                method === "email"
                  ? "border-[#C8B7FF] bg-[#FBFAFF] text-[#5E2FE5]"
                  : "border-transparent text-[#64748B]"
              }`}
              onClick={() => setMethod("email")}
              type="button"
            >
              <MailIcon className="size-5" />
              Email link
            </button>
            <button
              aria-pressed={method === "sms"}
              className={`inline-flex items-center justify-center gap-2 border text-[13px] font-medium ${
                method === "sms"
                  ? "border-[#C8B7FF] bg-[#FBFAFF] text-[#5E2FE5]"
                  : "border-transparent text-[#64748B]"
              }`}
              disabled
              title="SMS and WhatsApp OTP are not configured yet"
              type="button"
            >
              <SmartphoneIcon className="size-5" />
              SMS / WhatsApp OTP
            </button>
          </div>
        </div>

        <label className="flex cursor-pointer items-start gap-3 text-[12px] leading-5 text-[#475569]">
          <span className="relative mt-0.5 flex size-4 shrink-0 items-center justify-center">
            <input
              checked={acceptedTerms}
              className="peer size-4 appearance-none rounded border border-[#E5E7EB] bg-white transition checked:border-[#6C3DFF] checked:bg-[#6C3DFF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C3DFF]"
              onChange={(event) => {
                setAcceptedTerms(event.target.checked);
                clearError();
              }}
              type="checkbox"
            />
            <CheckIcon className="pointer-events-none absolute size-3 text-white opacity-0 peer-checked:opacity-100" />
          </span>
          <span>
            I agree to the{" "}
            <Link className="font-medium text-[#5E2FE5]" href="/legal/terms">
              Terms
            </Link>
            ,{" "}
            <Link className="font-medium text-[#5E2FE5]" href="/legal/privacy">
              Privacy
            </Link>{" "}
            and{" "}
            <Link className="font-medium text-[#5E2FE5]" href="/legal/cancellation">
              Cancellation Policy
            </Link>
            .
          </span>
        </label>

        {errorMessage ? (
          <p
            aria-live="polite"
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
            role="alert"
          >
            {errorMessage}
          </p>
        ) : null}

        <Button className="h-[46px] w-full text-base" disabled={isLoading} type="submit">
          {isLoading ? "Creating account..." : "Create account"}
        </Button>

        <div className="flex items-center gap-4 pt-1 text-[13px] text-[#64748B]">
          <span className="h-px flex-1 bg-[#E5E7EB]" />
          <span className="shrink-0">or continue with</span>
          <span className="h-px flex-1 bg-[#E5E7EB]" />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <SocialButton
            isLoading={activeProvider === "google"}
            label="Continue with Google"
            onClick={async () => {
              setActiveProvider("google");
              const { err } = await signInWithOAuth("google", accountType);
              if (err) {
                setActiveProvider(null);
                setErrorMessage(err);
              }
            }}
            provider="google"
          />
          <SocialButton
            isLoading={activeProvider === "facebook"}
            label="Continue with Facebook"
            onClick={async () => {
              setActiveProvider("facebook");
              const { err } = await signInWithOAuth("facebook", accountType);
              if (err) {
                setActiveProvider(null);
                setErrorMessage(err);
              }
            }}
            provider="facebook"
          />
        </div>

        <p className="pt-1 text-center text-[14px] text-[#334155]">
          Already have an account?{" "}
          <Link className="font-semibold text-[#5E2FE5]" href="/login">
            Sign in
          </Link>
        </p>
      </form>
    </section>
  );
}

type CompactFieldProps = {
  endIcon?: ReactNode;
  icon: ReactNode;
  id: string;
  label: string;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  type?: string;
  value?: string;
};

function CompactField({
  endIcon,
  icon,
  id,
  label,
  onChange,
  placeholder,
  type = "text",
  value,
}: CompactFieldProps) {
  return (
    <div className="space-y-2">
      <label className="block text-[13px] font-medium text-[#334155]" htmlFor={id}>
        {label}
      </label>
      <div className="flex h-9 items-center gap-3 rounded-md border border-[#D8DEE8] bg-white px-3 text-[#64748B] transition focus-within:border-[#6C3DFF] focus-within:ring-4 focus-within:ring-[#6C3DFF]/10">
        <input
          className="min-w-0 flex-1 bg-transparent text-[13px] text-[#0F172A] outline-none placeholder:text-[#64748B]"
          id={id}
          onChange={onChange}
          placeholder={placeholder}
          type={type}
          value={value}
        />
        <span className="shrink-0">{endIcon ?? icon}</span>
      </div>
    </div>
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

function SocialButton({
  isLoading,
  label,
  onClick,
  provider,
}: {
  isLoading: boolean;
  label: string;
  onClick: () => void;
  provider: "facebook" | "google";
}) {
  return (
    <button
      className="inline-flex h-[42px] items-center justify-center gap-3 rounded-md border border-[#D8DEE8] bg-white px-4 text-[14px] font-bold text-[#0F172A] shadow-[0_3px_8px_rgba(15,23,42,0.05)] transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
      disabled={isLoading}
      onClick={onClick}
      type="button"
    >
      {provider === "google" ? <GoogleIcon /> : <FacebookIcon />}
      {isLoading ? "Connecting..." : label}
    </button>
  );
}

function GoogleIcon() {
  return (
    <svg aria-hidden="true" className="size-5" viewBox="0 0 24 24">
      <path d="M21.6 12.23c0-.78-.07-1.53-.2-2.23H12v4.22h5.38a4.6 4.6 0 0 1-2 3.02v2.51h3.24c1.9-1.75 2.98-4.32 2.98-7.52Z" fill="#4285F4" />
      <path d="M12 22c2.7 0 4.97-.9 6.62-2.44l-3.24-2.51c-.9.6-2.05.96-3.38.96-2.6 0-4.8-1.76-5.58-4.12H3.07v2.59A10 10 0 0 0 12 22Z" fill="#34A853" />
      <path d="M6.42 13.89A6 6 0 0 1 6.1 12c0-.66.11-1.3.32-1.89V7.52H3.07A10 10 0 0 0 2 12c0 1.61.39 3.14 1.07 4.48l3.35-2.59Z" fill="#FBBC05" />
      <path d="M12 5.99c1.47 0 2.79.5 3.82 1.5l2.87-2.87C16.96 3.01 14.7 2 12 2a10 10 0 0 0-8.93 5.52l3.35 2.59C7.2 7.75 9.4 5.99 12 5.99Z" fill="#EA4335" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg aria-hidden="true" className="size-5" viewBox="0 0 24 24">
      <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.88 3.77-3.88 1.09 0 2.23.2 2.23.2v2.45h-1.26c-1.24 0-1.62.77-1.62 1.56V12h2.77l-.44 2.89h-2.33v6.99A10 10 0 0 0 22 12Z" fill="#1877F2" />
      <path d="m15.89 14.89.44-2.89h-2.77v-1.87c0-.79.38-1.56 1.62-1.56h1.26V6.12s-1.14-.2-2.23-.2c-2.28 0-3.77 1.38-3.77 3.88V12H7.9v2.89h2.54v6.99a10.2 10.2 0 0 0 3.12 0v-6.99h2.33Z" fill="#fff" />
    </svg>
  );
}
