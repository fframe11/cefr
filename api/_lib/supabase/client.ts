import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { getServerConfig } from './config';

/**
 * 1. Service Role Client (Privileged Server Operations)
 * Used by serverless functions to perform admin/system operations:
 * - Server-side grading of practice & mock exam submissions
 * - Writing to audit ledgers and derived state tables
 * - Generating presigned storage upload URLs
 *
 * CRITICAL SECURITY INVARIANT:
 * Never send or leak the client instance or key to the browser.
 * Always run with persistSession: false to maintain stateless transaction pooling.
 */
export function createServiceRoleClient(): SupabaseClient {
  const config = getServerConfig();
  if (!config.supabaseUrl || !config.supabaseServiceRoleKey) {
    throw new Error(
      '[Supabase Server] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in server environment.'
    );
  }

  return createClient(config.supabaseUrl, config.supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    db: {
      schema: 'public',
    },
  });
}

/**
 * 2. Authenticated User Scoped Client (Respects RLS)
 * Used when the serverless API executes operations on behalf of an authenticated user,
 * enforcing PostgreSQL Row Level Security (RLS) policies.
 */
export function createServerUserClient(jwt: string): SupabaseClient {
  const config = getServerConfig();
  if (!config.supabaseUrl || !config.supabaseAnonKey) {
    throw new Error(
      '[Supabase Server] Missing SUPABASE_URL or SUPABASE_ANON_KEY in server environment.'
    );
  }

  return createClient(config.supabaseUrl, config.supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    },
    db: {
      schema: 'public',
    },
  });
}

/**
 * 3. Public Read Server Client
 * Used for querying public unauthenticated content (CEFR metadata, active vocabulary, reading lessons)
 * from serverless functions.
 */
export function createPublicServerClient(): SupabaseClient {
  const config = getServerConfig();
  if (!config.supabaseUrl || !config.supabaseAnonKey) {
    throw new Error(
      '[Supabase Server] Missing SUPABASE_URL or SUPABASE_ANON_KEY in server environment.'
    );
  }

  return createClient(config.supabaseUrl, config.supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    db: {
      schema: 'public',
    },
  });
}
