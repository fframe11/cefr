import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Fallback to support both Next.js and Vite environments
const supabaseUrl =
  (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SUPABASE_URL) ||
  import.meta.env.VITE_SUPABASE_URL ||
  '';

const supabaseAnonKey =
  (typeof process !== 'undefined' &&
    (process.env?.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY)) ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  '';

/**
 * Browser-safe Supabase Client.
 * Restricted strictly to public anonymous credentials.
 * Service role keys are NEVER exposed or imported here.
 */
export const supabase: SupabaseClient = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: 'cefr_supabase_auth_token',
    },
  }
);
