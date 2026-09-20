"use client";
import { createBrowserClient } from "@supabase/ssr";

let client: ReturnType<typeof createBrowserClient> | null = null;

export function getSupabaseBrowser() {
  if (client) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    // Return a mock/no-op client when credentials are missing.
    // All domain services already handle the "no credentials" path via demo mode.
    return null as unknown as ReturnType<typeof createBrowserClient>;
  }

  client = createBrowserClient(url, key);
  return client;
}
