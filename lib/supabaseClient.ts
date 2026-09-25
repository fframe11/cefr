import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const getEnvVar = (nextKey: string, viteKey: string): string => {
  if (typeof process !== 'undefined' && process.env) {
    if (process.env[nextKey]) return process.env[nextKey]!;
    if (process.env[viteKey]) return process.env[viteKey]!;
  }
  try {
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      // @ts-ignore
      if (import.meta.env[nextKey]) return import.meta.env[nextKey];
      // @ts-ignore
      if (import.meta.env[viteKey]) return import.meta.env[viteKey];
    }
  } catch {
    // Ignore in non-Vite environments
  }
  return '';
};

const supabaseUrl = getEnvVar('NEXT_PUBLIC_SUPABASE_URL', 'VITE_SUPABASE_URL');
const supabaseAnonKey =
  (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) ||
  getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'VITE_SUPABASE_ANON_KEY');

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
