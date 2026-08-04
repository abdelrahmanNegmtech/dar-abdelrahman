"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useMemo, useState } from "react";
import {
  Button,
  CheckIcon,
  EyeIcon,
  EyeOffIcon,
  LockIcon,
  MailIcon,
  PhoneIcon,
  TextInput,
  UserIcon,
} from "@/components/ui";
import { signUpWithEmail } from "../services/authService";
import { getRoleDestination } from "../services/authRedirects";
import {
  validateEmail,
  validateOptionalPhone,
  validatePassword,
} from "../services/authValidation";
import { defaultCountry, type CountryOption } from "../data/countries";
import { CountrySelect } from "./CountrySelect";
import { PasswordRequirements } from "./PasswordRequirements";
import { formatPhoneForDisplay } from "../services/phoneUtils";
import { SocialButtons } from "./SocialButtons";

type SignUpFormProps = {
  accountType?: "guest" | "owner";
};

export function SignUpForm({ accountType = "guest" }: SignUpFormProps) {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [country, setCountry] = useState<CountryOption | null>(defaultCountry);
  const [phone, setPhone] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const passwordChecks = useMemo(
    () => [password.length >= 8, /\d/.test(password), /[A-Z]/.test(password)],
    [password],
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isLoading) return;
    setErrorMessage("");

    if (!fullName || !email || !password || !confirmPassword) {
      setErrorMessage("Please complete the required fields.");
      return;
    }

    if (!country) {
      setErrorMessage("Please select your country or nationality.");
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
    <form className="space-y-[22px]" noValidate onSubmit={handleSubmit}>
      <div className="grid gap-5 md:grid-cols-2">
        <TextInput
          autoComplete="name"
          compact
          icon={<UserIcon className="size-5" />}
          id="fullName"
          label="Full name"
          onChange={(event) => {
            setFullName(event.target.value);
            clearError();
          }}
          placeholder="Enter your full name"
          type="text"
          value={fullName}
        />
        <TextInput
          autoComplete="email"
          compact
          icon={<MailIcon className="size-5" />}
          id="signUpEmail"
          label="Email address"
          onChange={(event) => {
            setEmail(event.target.value);
            clearError();
          }}
          placeholder="Enter your email"
          type="email"
          value={email}
        />
      </div>

      <div className="space-y-3">
        <div className="grid gap-5 md:grid-cols-2">
          <TextInput
            autoComplete="new-password"
            compact
            endIcon={
              <EyeButton
                isVisible={showPassword}
                onClick={() => setShowPassword((value) => !value)}
              />
            }
            icon={<LockIcon className="size-5" />}
            id="signUpPassword"
            label="Password"
            onChange={(event) => {
              setPassword(event.target.value);
              clearError();
            }}
            placeholder="Create a password"
            type={showPassword ? "text" : "password"}
            value={password}
          />
          <TextInput
            autoComplete="new-password"
            compact
            endIcon={
              <EyeButton
                isVisible={showConfirmPassword}
                onClick={() => setShowConfirmPassword((value) => !value)}
              />
            }
            icon={<LockIcon className="size-5" />}
            id="confirmPassword"
            label="Confirm password"
            onChange={(event) => {
              setConfirmPassword(event.target.value);
              clearError();
            }}
            placeholder="Confirm your password"
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
          />
        </div>
        <PasswordRequirements activeChecks={passwordChecks} />
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <CountrySelect
          id="country"
          onChange={(value) => {
            setCountry(value);
            clearError();
          }}
          value={country}
        />
        <TextInput
          autoComplete="tel-national"
          compact
          icon={<PhoneIcon className="size-5" />}
          id="phoneNumber"
          label="Phone number (Optional)"
          onChange={(event) => {
            setPhone(event.target.value);
            clearError();
          }}
          placeholder="10 123 456 78"
          type="tel"
          value={phone}
        />
      </div>

      <label
        className="flex cursor-pointer items-center gap-3 text-[14px] leading-6 text-[#0F172A]"
        htmlFor="terms"
      >
        <span className="relative flex size-5 shrink-0 items-center justify-center">
          <input
            checked={acceptedTerms}
            className="peer size-5 appearance-none rounded-md border border-[#E5E7EB] bg-white transition duration-200 checked:border-[#6C3DFF] checked:bg-[#6C3DFF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C3DFF] focus-visible:ring-offset-2"
            id="terms"
            onChange={(event) => {
              setAcceptedTerms(event.target.checked);
              clearError();
            }}
            type="checkbox"
          />
          <CheckIcon className="pointer-events-none absolute size-3.5 text-white opacity-0 transition peer-checked:opacity-100" />
        </span>
        <span>
          I agree to the{" "}
          <Link className="font-semibold text-[#6C3DFF]" href="/legal/terms">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link className="font-semibold text-[#6C3DFF]" href="/legal/privacy">
            Privacy Policy
          </Link>
        </span>
      </label>

      {errorMessage ? (
        <p
          aria-live="polite"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
          role="alert"
        >
          {errorMessage}
        </p>
      ) : null}

      <Button className="h-[54px] w-full text-base" disabled={isLoading} type="submit">
        {isLoading ? "Creating account..." : "Create account"}
      </Button>

      <div className="flex items-center gap-5 pt-1 text-sm text-[#64748B]">
        <span className="h-px flex-1 bg-[#E5E7EB]" />
        <span className="shrink-0">or continue with</span>
        <span className="h-px flex-1 bg-[#E5E7EB]" />
      </div>

      <SocialButtons />

      {accountType === "owner" ? (
        <p className="rounded-xl border border-[#DDD6FE] bg-[#F7F3FF] px-4 py-3 text-center text-[13px] font-semibold leading-6 text-[#4C1D95]">
          Owner accounts require DAR review before listings can be published.
        </p>
      ) : null}

      <p className="mx-auto max-w-[430px] text-center text-[14px] leading-6 text-[#64748B]">
        By creating an account, you agree to our{" "}
        <Link className="font-semibold text-[#6C3DFF]" href="/legal/terms">
          Terms of Service
        </Link>{" "}
        and acknowledge our{" "}
        <Link className="font-semibold text-[#6C3DFF]" href="/legal/privacy">
          Privacy Policy
        </Link>
        .
      </p>
    </form>
  );
}

function EyeButton({
  isVisible,
  onClick,
}: {
  isVisible: boolean;
  onClick: () => void;
}) {
  return (
    <button
      aria-label={isVisible ? "Hide password" : "Show password"}
      className="rounded-md p-1 transition hover:text-[#6C3DFF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C3DFF]"
      onClick={onClick}
      type="button"
    >
      {isVisible ? <EyeIcon className="size-5" /> : <EyeOffIcon className="size-5" />}
    </button>
  );
}
