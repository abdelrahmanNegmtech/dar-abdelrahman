import { createBrowserClient } from "@supabase/ssr";
import { getSupabasePublicConfig } from "./config";

type BrowserClientOptions = {
  persistSession?: boolean;
};

export function createClient(options: BrowserClientOptions = {}) {
  const config = getSupabasePublicConfig();

  return createBrowserClient(config.url, config.publicKey, {
    auth: {
      autoRefreshToken: true,
      detectSessionInUrl: true,
      persistSession: options.persistSession ?? true,
    },
  });
}
