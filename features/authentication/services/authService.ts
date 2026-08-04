"use client";

import { createClient } from "@/lib/supabase/client";
import { getSiteUrl } from "@/lib/supabase/config";
import type { LoginInput, OAuthProvider, SignUpInput } from "../authTypes";
import { logAuthError, mapAuthError, mapOAuthError } from "./authErrors";
import { getRoleDestination } from "./authRedirects";
import {
  normalizeAccountType,
  validateEmail,
  validateOptionalPhone,
  validatePassword,
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

    if (!normalizedFullName || !validateEmail(normalizedEmail) || !validatePassword(password)) {
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

    return { data: result.data, err: null };
  } catch (error) {
    logAuthError("email signup transport failed", error);
    return {
      data: { session: null, user: null },
      err: mapAuthError(error),
    };
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
