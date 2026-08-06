import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./database.types";
import { getSupabasePublicConfig } from "./config";

type BrowserClientOptions = {
  persistSession?: boolean;
};

export function createClient(options: BrowserClientOptions = {}) {
  const config = getSupabasePublicConfig();

  return createBrowserClient<Database>(config.url, config.publicKey, {
    auth: {
      autoRefreshToken: true,
      detectSessionInUrl: true,
      persistSession: options.persistSession ?? true,
    },
  });
}
