export const missingSupabaseConfigMessage =
  "Authentication is not configured for this environment.";

const placeholderValues = new Set([
  "https://xxxx.supabase.co",
  "https://your-project.supabase.co",
  "sb_publishable_xxxxx",
  "your-supabase-publishable-key",
  "your-supabase-anon-key",
]);

export class SupabaseConfigError extends Error {
  constructor(message = missingSupabaseConfigMessage) {
    super(message);
    this.name = "SupabaseConfigError";
  }
}

export type SupabasePublicConfig = {
  publicKey: string;
  status: "configured";
  url: string;
};

export type SupabaseConfigState =
  | SupabasePublicConfig
  | {
      message: string;
      reason: "invalid-url" | "missing" | "placeholder";
      status: "missing";
    };

function cleanEnvValue(value: string | undefined) {
  return value?.trim().replace(/^['"]|['"]$/g, "");
}

function isPlaceholder(value: string) {
  return placeholderValues.has(value) || value.includes("xxxx.supabase.co");
}

function isValidSupabaseUrl(value: string) {
  try {
    const url = new URL(value);
    const isHostedSupabase =
      url.protocol === "https:" && url.hostname.endsWith(".supabase.co");
    const isLocalSupabase =
      url.protocol === "http:" &&
      (url.hostname === "127.0.0.1" ||
        url.hostname === "localhost" ||
        url.hostname === "::1");

    return isHostedSupabase || isLocalSupabase;
  } catch {
    return false;
  }
}

export function getSupabaseConfigState(): SupabaseConfigState {
  const url = cleanEnvValue(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const publicKey = cleanEnvValue(
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );

  if (!url || !publicKey) {
    return {
      message: missingSupabaseConfigMessage,
      reason: "missing",
      status: "missing",
    };
  }

  if (isPlaceholder(url) || isPlaceholder(publicKey)) {
    return {
      message: missingSupabaseConfigMessage,
      reason: "placeholder",
      status: "missing",
    };
  }

  if (!isValidSupabaseUrl(url)) {
    return {
      message: "Supabase project URL is invalid for this environment.",
      reason: "invalid-url",
      status: "missing",
    };
  }

  return { publicKey, status: "configured", url };
}

export function getSupabasePublicConfig(): SupabasePublicConfig {
  const config = getSupabaseConfigState();

  if (config.status === "missing") {
    throw new SupabaseConfigError(config.message);
  }

  return config;
}

export function tryGetSupabasePublicConfig() {
  const config = getSupabaseConfigState();
  return config.status === "configured" ? config : null;
}

export function getSiteUrl() {
  const configuredUrl = cleanEnvValue(process.env.NEXT_PUBLIC_SITE_URL);

  if (configuredUrl) {
    return configuredUrl.replace(/\/+$/, "");
  }

  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  return "http://localhost:3000";
}

export const getSupabaseConfig = tryGetSupabasePublicConfig;
