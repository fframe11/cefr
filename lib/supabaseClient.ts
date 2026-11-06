import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  (typeof process !== 'undefined' && process.env ? process.env.SUPABASE_URL : '') ||
  '';

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  (typeof process !== 'undefined' && process.env ? process.env.SUPABASE_ANON_KEY : '') ||
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

export const getSupabaseClient = (): SupabaseClient => supabase;
