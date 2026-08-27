"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useState } from "react";
import {
  Button,
  Checkbox,
  EyeIcon,
  EyeOffIcon,
  LockIcon,
  MailIcon,
  TextInput,
} from "@/components/ui";
import { getOwnProfile, loginWithEmail } from "../services/authService";
import { getRoleDestination, getSafeRedirect } from "../services/authRedirects";
import { validateEmail } from "../services/authValidation";
import { SocialButtons } from "./SocialButtons";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [redirectTo, setRedirectTo] = useState<string | null>(null);

  useEffect(() => {
    const syncQueryState = () => {
      const searchParams = new URLSearchParams(window.location.search);

      setErrorMessage(
        searchParams.get("authError")
          ? "The authentication link is invalid or expired. Please try again."
          : null,
      );

      const value = searchParams.get("redirectTo");
      setRedirectTo(value ? getSafeRedirect(value, "") : null);
    };

    const timeoutId = window.setTimeout(syncQueryState, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isLoading) return;
    setErrorMessage(null);

    if (!email || !password) {
      setErrorMessage("Please enter your email and password.");
      return;
    }

    if (!validateEmail(email)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);
    const { err } = await loginWithEmail({ email, password, remember });

    if (err) {
      setIsLoading(false);
      setErrorMessage(err);
      return;
    }

    const { data: profile } = await getOwnProfile();
    const fallback = getRoleDestination(profile?.account_type);
    setIsLoading(false);
    router.replace(redirectTo || fallback || "/search");
    router.refresh();
  }

  function clearError() {
    if (errorMessage) setErrorMessage(null);
  }

  return (
    <form className="space-y-[24px]" noValidate onSubmit={handleSubmit}>
      <TextInput
        autoComplete="email"
        icon={<MailIcon className="size-5" />}
        id="email"
        label="Email address"
        onChange={(event) => {
          setEmail(event.target.value);
          clearError();
        }}
        placeholder="Enter your email"
        type="email"
        value={email}
      />

      <div className="space-y-[14px]">
        <TextInput
          autoComplete="current-password"
          endIcon={
            <button
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="rounded-md p-1 transition hover:text-[#6C3DFF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C3DFF]"
              onClick={() => setShowPassword((value) => !value)}
              type="button"
            >
              {showPassword ? (
                <EyeIcon className="size-5" />
              ) : (
                <EyeOffIcon className="size-5" />
              )}
            </button>
          }
          icon={<LockIcon className="size-5" />}
          id="password"
          label="Password"
          onChange={(event) => {
            setPassword(event.target.value);
            clearError();
          }}
          placeholder="Enter your password"
          type={showPassword ? "text" : "password"}
          value={password}
        />

        <div className="flex justify-end">
          <Link
            className="text-sm font-semibold text-[#6C3DFF] transition duration-200 hover:text-[#5A30E8] focus-visible:rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C3DFF] focus-visible:ring-offset-2"
            href="/forgot-password"
          >
            Forgot password?
          </Link>
        </div>

        <div className="pt-1">
          <Checkbox
            checked={remember}
            id="remember"
            label="Remember me"
            onChange={(event) => setRemember(event.target.checked)}
          />
        </div>
      </div>

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
        {isLoading ? "Logging in..." : "Login"}
      </Button>

      <div className="flex items-center gap-5 pt-1 text-sm text-[#64748B]">
        <span className="h-px flex-1 bg-[#E5E7EB]" />
        <span className="shrink-0">or continue with</span>
        <span className="h-px flex-1 bg-[#E5E7EB]" />
      </div>

      <SocialButtons />
    </form>
  );
}
