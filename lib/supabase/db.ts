/**
 * Supabase Helper — returns client if credentials configured, null otherwise.
 * Domain services use this to decide: real query or mock fallback.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cached: SupabaseClient | null = null;

export function getDb(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) return null;

  if (!cached) {
    cached = createClient(url, key);
  }
  return cached;
}
