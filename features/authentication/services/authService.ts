"use client";

import { createClient } from "@/lib/supabase/client";
import { getSiteUrl } from "@/lib/supabase/config";
import type { LoginInput, OAuthProvider, PhoneSignUpInput, SignUpInput } from "../authTypes";
import { logAuthError, mapAuthError, mapOAuthError } from "./authErrors";
import { getRoleDestination } from "./authRedirects";
import {
  normalizeAccountType,
  validateEmail,
  validateFullName,
  validateOptionalPhone,
  validatePassword,
  validatePhone,
} from "./authValidation";
import { getCountryByCode } from "../data/countries";

function getAuthRedirectUrl(pathname: string) {
  return `${getSiteUrl()}${pathname}`;
}

function getClient() {
  return createClient();
}

function getOAuthProviderName(provider: OAuthProvider) {
  return provider === "google" ? "Google" : "Facebook";
}

function readOAuthPreflightMessage(payload: unknown, fallback: string) {
  if (!payload || typeof payload !== "object") {
    return fallback;
  }

  if ("msg" in payload && typeof payload.msg === "string") {
    return payload.msg;
  }

  if ("message" in payload && typeof payload.message === "string") {
    return payload.message;
  }

  if ("error" in payload && typeof payload.error === "string") {
    return payload.error;
  }

  return fallback;
}

async function resolveOAuthRedirectUrl(authorizeUrl: string) {
  const preflightUrl = new URL(authorizeUrl);
  preflightUrl.searchParams.set("skip_http_redirect", "true");

  const response = await fetch(preflightUrl.toString(), {
    headers: { Accept: "application/json" },
    method: "GET",
    redirect: "manual",
  });
  const text = await response.text();
  let payload: unknown = null;

  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    payload = null;
  }

  if (!response.ok) {
    throw new Error(readOAuthPreflightMessage(payload, text));
  }

  if (
    payload &&
    typeof payload === "object" &&
    "url" in payload &&
    typeof payload.url === "string" &&
    payload.url.startsWith("http")
  ) {
    return payload.url;
  }

  return authorizeUrl;
}

export async function loginWithEmail({ email, password, remember = true }: LoginInput) {
  try {
    const normalizedEmail = email.trim().toLowerCase();

    if (!validateEmail(normalizedEmail) || !password) {
      return {
        data: { session: null, user: null },
        err: "Please enter a valid email and password.",
      };
    }

    const supabase = remember ? getClient() : createClient({ persistSession: false });
    const result = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (result.error) {
      logAuthError("email login failed", result.error);
      return { data: result.data, err: mapAuthError(result.error) };
    }

    if (!result.data.session) {
      return { data: result.data, err: "Unable to start a session. Please try again." };
    }

    return { data: result.data, err: null };
  } catch (error) {
    logAuthError("email login transport failed", error);
    return {
      data: { session: null, user: null },
      err: mapAuthError(error),
    };
  }
}

export async function signUpWithEmail(input: SignUpInput) {
  try {
    const supabase = getClient();
    const { accountType, countryCode, countryName, dialingCode, email, fullName, password, phone } = input;
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedFullName = fullName.trim();
    const normalizedPhone = phone?.trim() ?? "";
    const safeAccountType = normalizeAccountType(accountType);
    const selectedCountry = getCountryByCode(countryCode);

    if (!validateFullName(normalizedFullName) || !validateEmail(normalizedEmail) || !validatePassword(password)) {
      return {
        data: { session: null, user: null },
        err: "Please check your name, email, and password.",
      };
    }

    if (!selectedCountry || selectedCountry.name !== countryName || selectedCountry.dialingCode !== dialingCode) {
      return {
        data: { session: null, user: null },
        err: "Please select a valid country.",
      };
    }

    if (!validateOptionalPhone(normalizedPhone)) {
      return {
        data: { session: null, user: null },
        err: "Please enter a valid phone number or leave it empty.",
      };
    }

    const result = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        data: {
          account_type: safeAccountType,
          country_code: countryCode,
          country_name: countryName,
          dialing_code: dialingCode,
          full_name: normalizedFullName,
          phone: normalizedPhone || null,
        },
        emailRedirectTo: getAuthRedirectUrl(
          `/auth/callback?next=${encodeURIComponent(getRoleDestination(safeAccountType))}&account_type=${safeAccountType}`,
        ),
      },
    });

    if (result.error) {
      logAuthError("email signup failed", result.error);
      return { data: result.data, err: mapAuthError(result.error) };
    }

    if (result.data.user && result.data.user.identities?.length === 0) {
      return {
        data: result.data,
        err: "An account with this email already exists. Please sign in instead.",
      };
    }

    return { data: result.data, err: null };
  } catch (error) {
    logAuthError("email signup transport failed", error);
    return {
      data: { session: null, user: null },
      err: mapAuthError(error),
    };
  }
}

function mapPhoneError(error: unknown) {
  const mapped = mapAuthError(error);
  const message = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();

  if (message.includes("phone provider") || message.includes("sms provider") || message.includes("phone signups are disabled")) {
    return "Phone registration is not configured yet.";
  }

  if (message.includes("token") || message.includes("otp") || message.includes("expired")) {
    return "The verification code is invalid or expired. Please request a new code.";
  }

  return mapped;
}

export async function requestPhoneSignUpCode(input: PhoneSignUpInput) {
  try {
    const selectedCountry = getCountryByCode(input.countryCode);
    const safeAccountType = normalizeAccountType(input.accountType);
    const normalizedFullName = input.fullName.trim();
    const normalizedPhone = input.phone.trim();

    if (!validateFullName(normalizedFullName) || !validatePhone(normalizedPhone)) {
      return { err: "Please enter a valid name and phone number." };
    }

    if (!selectedCountry || selectedCountry.name !== input.countryName || selectedCountry.dialingCode !== input.dialingCode) {
      return { err: "Please select a valid country." };
    }

    const supabase = getClient();
    const result = await supabase.auth.signInWithOtp({
      phone: normalizedPhone,
      options: {
        data: {
          account_type: safeAccountType,
          country_code: input.countryCode,
          country_name: input.countryName,
          dialing_code: input.dialingCode,
          full_name: normalizedFullName,
          phone: normalizedPhone,
        },
        shouldCreateUser: true,
      },
    });

    if (result.error) {
      logAuthError("phone signup code request failed", result.error);
      return { err: mapPhoneError(result.error) };
    }

    return { err: null };
  } catch (error) {
    logAuthError("phone signup code request transport failed", error);
    return { err: mapPhoneError(error) };
  }
}

export async function verifyPhoneSignUpCode(phone: string, token: string) {
  try {
    if (!validatePhone(phone) || !/^\d{6}$/.test(token.trim())) {
      return { data: { session: null, user: null }, err: "Enter the 6-digit verification code." };
    }

    const supabase = getClient();
    const result = await supabase.auth.verifyOtp({ phone, token: token.trim(), type: "sms" });

    if (result.error) {
      logAuthError("phone signup code verification failed", result.error);
      return { data: result.data, err: mapPhoneError(result.error) };
    }

    if (!result.data.user || !result.data.session) {
      return { data: result.data, err: "Unable to start a session. Please try again." };
    }

    const metadata = result.data.user.user_metadata;
    const accountType = normalizeAccountType(metadata?.account_type);
    const profile = {
      account_type: accountType,
      country_code: metadata?.country_code ?? null,
      country_name: metadata?.country_name ?? null,
      dialing_code: metadata?.dialing_code ?? null,
      full_name: metadata?.full_name ?? null,
      id: result.data.user.id,
      phone,
      updated_at: new Date().toISOString(),
    };
    const { error: profileError } = await supabase.from("profiles").upsert(profile, { onConflict: "id" });

    if (profileError) {
      logAuthError("phone signup profile sync failed", profileError);
      return { data: result.data, err: "Your account could not be fully created. Please contact support." };
    }

    return { data: result.data, err: null };
  } catch (error) {
    logAuthError("phone signup verification transport failed", error);
    return { data: { session: null, user: null }, err: mapPhoneError(error) };
  }
}

export async function signInWithOAuth(provider: OAuthProvider, accountType = "guest") {
  try {
    if (provider !== "google" && provider !== "facebook") {
      return { err: "This social sign-in provider is not supported." };
    }

    const supabase = getClient();
    const safeAccountType = normalizeAccountType(accountType);
    const scopes: Record<OAuthProvider, string> = {
      facebook: "email public_profile",
      google: "openid email profile",
    };

    const result = await supabase.auth.signInWithOAuth({
      options: {
        redirectTo: getAuthRedirectUrl(
          `/auth/callback?next=${encodeURIComponent(getRoleDestination(safeAccountType))}&account_type=${safeAccountType}`,
        ),
        scopes: scopes[provider],
        skipBrowserRedirect: true,
      },
      provider,
    });

    if (result.error) {
      logAuthError(`${provider} OAuth authorize failed`, result.error);
      return { err: mapOAuthError(result.error, provider) };
    }

    if (!result.data.url) {
      return { err: `${getOAuthProviderName(provider)} Sign-In is currently unavailable.` };
    }

    const redirectUrl = await resolveOAuthRedirectUrl(result.data.url);
    window.location.assign(redirectUrl);
    return { err: null };
  } catch (error) {
    logAuthError(`${provider} OAuth transport failed`, error);
    return { err: mapOAuthError(error, provider) };
  }
}

export async function requestPasswordReset(email: string) {
  try {
    const normalizedEmail = email.trim().toLowerCase();

    if (!validateEmail(normalizedEmail)) {
      return { err: "Please enter a valid email address." };
    }

    const supabase = getClient();
    const result = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
      redirectTo: getAuthRedirectUrl("/auth/callback?next=/password-reset"),
    });

    if (result.error) {
      logAuthError("password reset request failed", result.error);
      return { err: mapAuthError(result.error) };
    }

    return { err: null };
  } catch (error) {
    logAuthError("password reset request transport failed", error);
    return { err: mapAuthError(error) };
  }
}

export async function updatePassword(password: string) {
  try {
    if (!validatePassword(password)) {
      return {
        data: { user: null },
        err: "Password must be at least 8 characters and include an uppercase letter and a number.",
      };
    }

    const supabase = getClient();
    const result = await supabase.auth.updateUser({ password });

    if (result.error) {
      logAuthError("password update failed", result.error);
      return { data: result.data, err: mapAuthError(result.error) };
    }

    return { data: result.data, err: null };
  } catch (error) {
    logAuthError("password update transport failed", error);
    return {
      data: { user: null },
      err: mapAuthError(error),
    };
  }
}

export async function resendVerificationEmail(email: string) {
  try {
    const normalizedEmail = email.trim().toLowerCase();

    if (!validateEmail(normalizedEmail)) {
      return { err: "Please enter a valid email address." };
    }

    const supabase = getClient();
    const result = await supabase.auth.resend({
      email: normalizedEmail,
      options: {
        emailRedirectTo: getAuthRedirectUrl("/auth/callback?next=/search"),
      },
      type: "signup",
    });

    if (result.error) {
      logAuthError("verification resend failed", result.error);
      return { err: mapAuthError(result.error) };
    }

    return { err: null };
  } catch (error) {
    logAuthError("verification resend transport failed", error);
    return { err: mapAuthError(error) };
  }
}

export async function getOwnProfile() {
  try {
    const supabase = getClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      if (userError) logAuthError("current user lookup failed", userError);
      return { data: null, err: userError ? mapAuthError(userError) : null };
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, email, phone, country_code, country_name, dialing_code, account_type, avatar_url")
      .eq("id", user.id)
      .maybeSingle();

    if (error) {
      logAuthError("profile lookup failed", error);
      return { data: null, err: mapAuthError(error) };
    }

    return { data, err: null };
  } catch (error) {
    logAuthError("profile lookup transport failed", error);
    return { data: null, err: mapAuthError(error) };
  }
}

export async function logout() {
  try {
    const supabase = getClient();
    const result = await supabase.auth.signOut();

    if (result.error) {
      logAuthError("logout failed", result.error);
      return { err: mapAuthError(result.error) };
    }

    return { err: null };
  } catch (error) {
    logAuthError("logout transport failed", error);
    return { err: mapAuthError(error) };
  }
}
