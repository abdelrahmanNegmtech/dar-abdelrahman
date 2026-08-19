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
import { defaultCountry, type CountryOption } from "../data/countries";
import {
  requestPhoneSignUpCode,
  signUpWithEmail,
  verifyPhoneSignUpCode,
} from "../services/authService";
import { getRoleDestination } from "../services/authRedirects";
import {
  validateEmail,
  validateFullName,
  validateOptionalPhone,
  validatePassword,
  validatePhone,
} from "../services/authValidation";
import { formatPhoneForDisplay } from "../services/phoneUtils";
import type { RegistrationMethod } from "./AuthSegmentedControl";
import { CountrySelect } from "./CountrySelect";
import { PasswordRequirements } from "./PasswordRequirements";
import { SocialButtons } from "./SocialButtons";

type SignUpFormProps = {
  accountType?: "guest" | "owner";
  method: RegistrationMethod;
};

type FieldErrors = Partial<
  Record<"confirmPassword" | "country" | "email" | "fullName" | "otp" | "password" | "phone" | "terms", string>
>;

export function SignUpForm({ accountType = "guest", method }: SignUpFormProps) {
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
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [phoneCodeSent, setPhoneCodeSent] = useState(false);
  const [phoneForVerification, setPhoneForVerification] = useState("");
  const [otp, setOtp] = useState("");

  const passwordChecks = useMemo(
    () => [password.length >= 8, /\d/.test(password), /[A-Z]/.test(password)],
    [password],
  );

  function clearFieldError(field: keyof FieldErrors) {
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
    if (errorMessage) setErrorMessage("");
  }

  function validateSharedFields(formattedPhone: string, phoneRequired: boolean) {
    const errors: FieldErrors = {};
    if (!validateFullName(fullName)) errors.fullName = "Enter your full name (at least 2 characters).";
    if (!country) errors.country = "Select your country or nationality.";
    if (phoneRequired ? !validatePhone(formattedPhone) : !validateOptionalPhone(formattedPhone)) {
      errors.phone = phoneRequired ? "Enter a valid phone number." : "Enter a valid phone number or leave it empty.";
    }
    if (!acceptedTerms) errors.terms = "You must accept the Terms and Privacy Policy.";
    return errors;
  }

  async function handleEmailSubmit() {
    const formattedPhone = country ? formatPhoneForDisplay(country, phone) : "";
    const errors = validateSharedFields(formattedPhone, false);

    if (!validateEmail(email)) errors.email = "Enter a valid email address.";
    if (!validatePassword(password)) errors.password = "Password does not meet the requirements.";
    if (!confirmPassword || password !== confirmPassword) errors.confirmPassword = "Passwords do not match.";

    if (Object.keys(errors).length || !country) {
      setFieldErrors(errors);
      return;
    }

    setIsLoading(true);
    const { data, err } = await signUpWithEmail({
      accountType,
      countryCode: country.code,
      countryName: country.name,
      dialingCode: country.dialingCode,
      email: email.trim().toLowerCase(),
      fullName: fullName.trim(),
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

    router.replace(`/verify-email?email=${encodeURIComponent(email.trim().toLowerCase())}`);
  }

  async function sendPhoneCode() {
    const formattedPhone = country ? formatPhoneForDisplay(country, phone) : "";
    const errors = validateSharedFields(formattedPhone, true);

    if (Object.keys(errors).length || !country) {
      setFieldErrors(errors);
      return;
    }

    setIsLoading(true);
    const { err } = await requestPhoneSignUpCode({
      accountType,
      countryCode: country.code,
      countryName: country.name,
      dialingCode: country.dialingCode,
      fullName: fullName.trim(),
      phone: formattedPhone,
    });
    setIsLoading(false);

    if (err) {
      setErrorMessage(err);
      return;
    }

    setPhoneForVerification(formattedPhone);
    setPhoneCodeSent(true);
    setOtp("");
  }

  async function verifyPhoneCode() {
    if (!/^\d{6}$/.test(otp)) {
      setFieldErrors({ otp: "Enter the 6-digit verification code." });
      return;
    }

    setIsLoading(true);
    const { data, err } = await verifyPhoneSignUpCode(phoneForVerification, otp);
    setIsLoading(false);

    if (err) {
      setErrorMessage(err);
      return;
    }

    if (data.session) {
      router.replace(getRoleDestination(accountType));
      router.refresh();
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isLoading) return;
    setErrorMessage("");
    setFieldErrors({});

    if (method === "email") {
      await handleEmailSubmit();
    } else if (phoneCodeSent) {
      await verifyPhoneCode();
    } else {
      await sendPhoneCode();
    }
  }

  return (
    <form className="space-y-[22px]" noValidate onSubmit={handleSubmit}>
      {method === "email" ? (
        <EmailFields
          confirmPassword={confirmPassword}
          email={email}
          errors={fieldErrors}
          fullName={fullName}
          onConfirmPasswordChange={(value) => {
            setConfirmPassword(value);
            clearFieldError("confirmPassword");
          }}
          onEmailChange={(value) => {
            setEmail(value);
            clearFieldError("email");
          }}
          onFullNameChange={(value) => {
            setFullName(value);
            clearFieldError("fullName");
          }}
          onPasswordChange={(value) => {
            setPassword(value);
            clearFieldError("password");
          }}
          onToggleConfirmPassword={() => setShowConfirmPassword((value) => !value)}
          onTogglePassword={() => setShowPassword((value) => !value)}
          password={password}
          passwordChecks={passwordChecks}
          showConfirmPassword={showConfirmPassword}
          showPassword={showPassword}
        />
      ) : phoneCodeSent ? (
        <div className="space-y-4">
          <p className="rounded-xl border border-[#DDD6FE] bg-[#F7F3FF] px-4 py-3 text-[13px] font-medium leading-5 text-[#4C1D95]">
            We sent a verification code to <strong>{phoneForVerification}</strong>.
          </p>
          <div>
            <TextInput
              autoComplete="one-time-code"
              compact
              icon={<PhoneIcon className="size-5" />}
              id="phoneOtp"
              inputMode="numeric"
              label="Verification code"
              maxLength={6}
              onChange={(event) => {
                setOtp(event.target.value.replace(/\D/g, "").slice(0, 6));
                clearFieldError("otp");
              }}
              placeholder="Enter 6-digit code"
              value={otp}
            />
            <FieldError message={fieldErrors.otp} />
          </div>
          <button
            className="text-sm font-semibold text-[#6C3DFF] focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C3DFF]"
            disabled={isLoading}
            onClick={sendPhoneCode}
            type="button"
          >
            Resend verification code
          </button>
        </div>
      ) : (
        <PhoneFields
          country={country}
          errors={fieldErrors}
          fullName={fullName}
          onCountryChange={(value) => {
            setCountry(value);
            clearFieldError("country");
          }}
          onFullNameChange={(value) => {
            setFullName(value);
            clearFieldError("fullName");
          }}
          onPhoneChange={(value) => {
            setPhone(value.replace(/[^\d\s()-]/g, ""));
            clearFieldError("phone");
          }}
          phone={phone}
        />
      )}

      {method === "email" ? (
        <PhoneAndCountryFields
          country={country}
          errors={fieldErrors}
          onCountryChange={(value) => {
            setCountry(value);
            clearFieldError("country");
          }}
          onPhoneChange={(value) => {
            setPhone(value.replace(/[^\d\s()+-]/g, ""));
            clearFieldError("phone");
          }}
          phone={phone}
        />
      ) : null}

      {!phoneCodeSent || method === "email" ? (
        <TermsControl
          accepted={acceptedTerms}
          error={fieldErrors.terms}
          onChange={(value) => {
            setAcceptedTerms(value);
            clearFieldError("terms");
          }}
        />
      ) : null}

      {errorMessage ? (
        <p aria-live="polite" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700" role="alert">
          {errorMessage}
        </p>
      ) : null}

      <Button className="h-[54px] w-full text-base" disabled={isLoading} type="submit">
        {isLoading
          ? method === "phone" && phoneCodeSent
            ? "Verifying code..."
            : method === "phone"
              ? "Sending code..."
              : "Creating account..."
          : method === "phone" && phoneCodeSent
            ? "Verify and create account"
            : method === "phone"
              ? "Send verification code"
              : "Create account"}
      </Button>

      <div className="flex items-center gap-5 pt-1 text-sm text-[#64748B]">
        <span className="h-px flex-1 bg-[#E5E7EB]" />
        <span className="shrink-0">or continue with</span>
        <span className="h-px flex-1 bg-[#E5E7EB]" />
      </div>

      <SocialButtons accountType={accountType} />

      {accountType === "owner" ? (
        <p className="rounded-xl border border-[#DDD6FE] bg-[#F7F3FF] px-4 py-3 text-center text-[13px] font-semibold leading-6 text-[#4C1D95]">
          Owner accounts require DAR review before listings can be published.
        </p>
      ) : null}

      <p className="mx-auto max-w-[430px] text-center text-[14px] leading-6 text-[#64748B]">
        By creating an account, you agree to our <LegalLink href="/legal/terms">Terms of Service</LegalLink> and acknowledge our{" "}
        <LegalLink href="/legal/privacy">Privacy Policy</LegalLink>.
      </p>
    </form>
  );
}

function EmailFields(props: {
  confirmPassword: string;
  email: string;
  errors: FieldErrors;
  fullName: string;
  onConfirmPasswordChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onFullNameChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onToggleConfirmPassword: () => void;
  onTogglePassword: () => void;
  password: string;
  passwordChecks: boolean[];
  showConfirmPassword: boolean;
  showPassword: boolean;
}) {
  return (
    <>
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <TextInput autoComplete="name" compact icon={<UserIcon className="size-5" />} id="fullName" label="Full name" onChange={(event) => props.onFullNameChange(event.target.value)} placeholder="Enter your full name" value={props.fullName} />
          <FieldError message={props.errors.fullName} />
        </div>
        <div>
          <TextInput autoComplete="email" compact icon={<MailIcon className="size-5" />} id="signUpEmail" label="Email address" onChange={(event) => props.onEmailChange(event.target.value)} placeholder="Enter your email" type="email" value={props.email} />
          <FieldError message={props.errors.email} />
        </div>
      </div>
      <div className="space-y-3">
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <TextInput autoComplete="new-password" compact endIcon={<EyeButton isVisible={props.showPassword} onClick={props.onTogglePassword} />} icon={<LockIcon className="size-5" />} id="signUpPassword" label="Password" onChange={(event) => props.onPasswordChange(event.target.value)} placeholder="Create a password" type={props.showPassword ? "text" : "password"} value={props.password} />
            <FieldError message={props.errors.password} />
          </div>
          <div>
            <TextInput autoComplete="new-password" compact endIcon={<EyeButton isVisible={props.showConfirmPassword} onClick={props.onToggleConfirmPassword} />} icon={<LockIcon className="size-5" />} id="confirmPassword" label="Confirm password" onChange={(event) => props.onConfirmPasswordChange(event.target.value)} placeholder="Confirm your password" type={props.showConfirmPassword ? "text" : "password"} value={props.confirmPassword} />
            <FieldError message={props.errors.confirmPassword} />
          </div>
        </div>
        <PasswordRequirements activeChecks={props.passwordChecks} />
      </div>
    </>
  );
}

function PhoneAndCountryFields(props: { country: CountryOption | null; errors: FieldErrors; onCountryChange: (value: CountryOption) => void; onPhoneChange: (value: string) => void; phone: string }) {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      <CountrySelect error={props.errors.country} id="country" onChange={props.onCountryChange} value={props.country} />
      <div>
        <TextInput autoComplete="tel-national" compact icon={<PhoneIcon className="size-5" />} id="phoneNumber" inputMode="tel" label="Phone number (Optional)" onChange={(event) => props.onPhoneChange(event.target.value)} placeholder="10 123 456 78" type="tel" value={props.phone} />
        <FieldError message={props.errors.phone} />
      </div>
    </div>
  );
}

function PhoneFields(props: { country: CountryOption | null; errors: FieldErrors; fullName: string; onCountryChange: (value: CountryOption) => void; onFullNameChange: (value: string) => void; onPhoneChange: (value: string) => void; phone: string }) {
  return (
    <div className="space-y-5">
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <TextInput autoComplete="name" compact icon={<UserIcon className="size-5" />} id="phoneFullName" label="Full name" onChange={(event) => props.onFullNameChange(event.target.value)} placeholder="Enter your full name" value={props.fullName} />
          <FieldError message={props.errors.fullName} />
        </div>
        <CountrySelect error={props.errors.country} id="phoneCountry" onChange={props.onCountryChange} value={props.country} />
      </div>
      <div>
        <TextInput autoComplete="tel-national" compact icon={<PhoneIcon className="size-5" />} id="registrationPhone" inputMode="tel" label="Phone number" onChange={(event) => props.onPhoneChange(event.target.value)} placeholder="10 123 456 78" type="tel" value={props.phone} />
        <FieldError message={props.errors.phone} />
      </div>
    </div>
  );
}

function TermsControl({ accepted, error, onChange }: { accepted: boolean; error?: string; onChange: (value: boolean) => void }) {
  return (
    <div>
      <div className="flex items-center gap-3 text-[14px] leading-6 text-[#0F172A]">
        <label className="relative flex size-5 shrink-0 cursor-pointer items-center justify-center" htmlFor="terms">
          <input checked={accepted} className="peer size-5 appearance-none rounded-md border border-[#E5E7EB] bg-white transition duration-200 checked:border-[#6C3DFF] checked:bg-[#6C3DFF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C3DFF] focus-visible:ring-offset-2" id="terms" onChange={(event) => onChange(event.target.checked)} type="checkbox" />
          <CheckIcon className="pointer-events-none absolute size-3.5 text-white opacity-0 transition peer-checked:opacity-100" />
        </label>
        <span>
          I agree to the <LegalLink href="/legal/terms">Terms of Service</LegalLink> and <LegalLink href="/legal/privacy">Privacy Policy</LegalLink>
        </span>
      </div>
      <FieldError message={error} />
    </div>
  );
}

function LegalLink({ children, href }: { children: React.ReactNode; href: string }) {
  return <Link className="font-semibold text-[#6C3DFF] focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C3DFF]" href={href}>{children}</Link>;
}

function FieldError({ message }: { message?: string }) {
  return message ? <p className="mt-1.5 text-[12px] font-medium text-red-600">{message}</p> : null;
}

function EyeButton({ isVisible, onClick }: { isVisible: boolean; onClick: () => void }) {
  return (
    <button aria-label={isVisible ? "Hide password" : "Show password"} className="rounded-md p-1 transition hover:text-[#6C3DFF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C3DFF]" onClick={onClick} type="button">
      {isVisible ? <EyeIcon className="size-5" /> : <EyeOffIcon className="size-5" />}
    </button>
  );
}
