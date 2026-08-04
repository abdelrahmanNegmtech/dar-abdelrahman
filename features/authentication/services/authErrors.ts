import { SupabaseConfigError } from "@/lib/supabase/config";

type AuthErrorDetails = {
  code?: string;
  message: string;
  name?: string;
  status?: number;
};

function getAuthErrorDetails(error: unknown): AuthErrorDetails {
  if (error instanceof Error) {
    const record = error as Error & { code?: string; status?: number };

    return {
      code: record.code,
      message: error.message,
      name: error.name,
      status: record.status,
    };
  }

  if (typeof error === "object" && error) {
    const record = error as { code?: unknown; message?: unknown; name?: unknown; status?: unknown };

    return {
      code: typeof record.code === "string" ? record.code : undefined,
      message: typeof record.message === "string" ? record.message : "",
      name: typeof record.name === "string" ? record.name : undefined,
      status: typeof record.status === "number" ? record.status : undefined,
    };
  }

  return { message: "" };
}

export function mapAuthError(error: unknown) {
  const details = getAuthErrorDetails(error);
  const message = details.message;

  const normalized = message.toLowerCase();
  const normalizedCode = details.code?.toLowerCase() ?? "";

  if (
    error instanceof SupabaseConfigError ||
    normalized.includes("authentication is not configured") ||
    normalized.includes("supabase is not configured") ||
    normalized.includes("supabase project url is invalid")
  ) {
    return "Authentication is not configured for this environment.";
  }

  if (
    normalized.includes("failed to fetch") ||
    normalized.includes("load failed") ||
    normalized.includes("networkerror") ||
    details.name === "AbortError"
  ) {
    return "We could not reach the authentication service. Check your connection and try again.";
  }

  if (normalized.includes("email not confirmed")) {
    return "Please verify your email address before signing in.";
  }

  if (
    normalizedCode.includes("invalid_credentials") ||
    normalized.includes("invalid login") ||
    normalized.includes("invalid credentials") ||
    normalized.includes("user not found")
  ) {
    return "The email or password you entered is incorrect.";
  }

  if (normalized.includes("cancel")) {
    return "Sign-in was cancelled.";
  }

  if (normalized.includes("provider") || normalized.includes("oauth")) {
    return "Social sign-in could not be completed. Please try again.";
  }

  if (
    normalizedCode.includes("user_already_exists") ||
    normalized.includes("already registered") ||
    normalized.includes("already exists") ||
    normalized.includes("user already registered")
  ) {
    return "An account with this email already exists. Please sign in instead.";
  }

  if (
    normalizedCode.includes("weak_password") ||
    normalized.includes("weak password") ||
    normalized.includes("password should be")
  ) {
    return "Please choose a stronger password.";
  }

  if (
    normalized.includes("rate limit") ||
    normalized.includes("too many") ||
    normalized.includes("over_email_send_rate_limit")
  ) {
    return "Too many attempts. Please wait a moment and try again.";
  }

  if (normalized.includes("signup") && normalized.includes("disabled")) {
    return "Account creation is currently disabled.";
  }

  if (
    normalized.includes("database error") ||
    normalized.includes("saving new user") ||
    normalized.includes("profile")
  ) {
    return "Your account could not be fully created. Please contact support.";
  }

  if (
    normalized.includes("expired") ||
    normalized.includes("invalid_grant") ||
    normalized.includes("otp")
  ) {
    return "This link is invalid or expired. Please request a new link.";
  }

  if (details.status && details.status >= 500) {
    return "Authentication service is temporarily unavailable. Please try again shortly.";
  }

  if (details.status === 401 || details.status === 403) {
    return "Authentication is not configured for this environment.";
  }

  return "Something went wrong. Please try again.";
}

export function logAuthError(context: string, error: unknown) {
  if (process.env.NODE_ENV !== "development") {
    return;
  }

  console.warn(`[auth] ${context}`, error);
}

export function mapOAuthError(error: unknown, provider: "facebook" | "google") {
  logAuthError(`${provider} OAuth failed`, error);

  const { message, name } = getAuthErrorDetails(error);
  const normalized = message.toLowerCase();
  const providerName = provider === "google" ? "Google" : "Facebook";

  if (error instanceof SupabaseConfigError || normalized.includes("authentication is not configured")) {
    return "Authentication is not configured for this environment.";
  }

  if (normalized.includes("failed to fetch") || normalized.includes("load failed") || name === "AbortError") {
    return `We could not reach ${providerName} authentication. Check your connection and try again.`;
  }

  if (
    normalized.includes("unsupported provider") ||
    normalized.includes("provider is not enabled") ||
    normalized.includes("validation_failed")
  ) {
    return `${providerName} authentication is not configured yet.`;
  }

  if (normalized.includes("cancel")) {
    return `${providerName} sign-in was cancelled.`;
  }

  return `${providerName} Sign-In is currently unavailable.`;
}
