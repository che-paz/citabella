import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/** Anon Supabase client — no auth cookies (public booking flow). */
export function createAnonymousClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}
