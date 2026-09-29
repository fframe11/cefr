import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * GET /auth/callback
 * Next.js 15 Server Route Handler for Supabase Auth (OAuth & Email Magic Link).
 * Exchanges the temporary authorization 'code' for a persistent session.
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') || '/';
  const origin = requestUrl.origin;

  if (code) {
    const cookieStore = await cookies();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
    const supabaseAnonKey =
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.SUPABASE_ANON_KEY ||
      '';

    if (supabaseUrl && supabaseAnonKey) {
      const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                cookieStore.set(name, value, options);
              });
            } catch {
              // The `setAll` method was called from a Server Component / Route.
              // This can be ignored if middleware is refreshing sessions.
            }
          },
        },
      });

      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error && data?.user) {
        // Ensure user_profiles row exists for newly authenticated OAuth user
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (serviceRoleKey) {
          const adminSupabase = createServerClient(supabaseUrl, serviceRoleKey, {
            cookies: {
              getAll: () => [],
              setAll: () => {},
            },
          });

          const { data: existingProfile } = await adminSupabase
            .from('user_profiles')
            .select('id')
            .eq('id', data.user.id)
            .maybeSingle();

          if (!existingProfile) {
            await adminSupabase.from('user_profiles').insert({
              id: data.user.id,
              current_cefr_level: 'A1',
              target_exam: 'PET',
              estimated_cambridge_score: 100,
              streak_days: 0,
              daily_goal_minutes: 20,
              assessment_completed: false,
            });
          }
        }

        // Successfully authenticated, redirect to destination
        return NextResponse.redirect(`${origin}${next.startsWith('/') ? next : '/'}`);
      }
    }
  }

  // If code exchange failed or no code provided, redirect to home with error notice
  return NextResponse.redirect(`${origin}/?authError=callback_failed`);
}
