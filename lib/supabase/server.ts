import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

let client: ReturnType<typeof createServerClient> | null = null;

export function getSupabaseServer() {
  if (client) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const secret = process.env.SUPABASE_SECRET_KEY;

  if (!url || !key || !secret) {
    return null as unknown as ReturnType<typeof createServerClient>;
  }

  const cookieStore = cookies();

  client = createServerClient(url, secret || key, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(_name: string, _value: string, _options: CookieOptions) {
        try {
          cookieStore.set({ name: _name, value: _value, ..._options });
        } catch {
          // Server Component — read-only. Ignore.
        }
      },
      remove(_name: string, _options: CookieOptions) {
        try {
          cookieStore.set({ name: _name, value: "", ..._options });
        } catch {
          // Server Component — read-only. Ignore.
        }
      },
    },
  });

  return client;
}
