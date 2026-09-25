/**
 * Server-side Environment Configuration for Supabase & Database access.
 * Runs strictly within Node.js / Vercel Serverless Function runtime.
 */

export interface ServerConfig {
  supabaseUrl: string;
  supabaseServiceRoleKey: string;
  supabaseAnonKey: string;
  nodeEnv: string;
  isProduction: boolean;
}

export function getServerConfig(): ServerConfig {
  const supabaseUrl =
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL ||
    '';
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  const supabaseAnonKey =
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    '';
  const nodeEnv = process.env.NODE_ENV || 'development';

  return {
    supabaseUrl,
    supabaseServiceRoleKey,
    supabaseAnonKey,
    nodeEnv,
    isProduction: nodeEnv === 'production',
  };
}
