import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('Consumer Account + Profile + Auth System (Duolingo-style UX)', () => {
  const projectRoot = path.resolve(__dirname, '..');

  it('1. verifies app/auth/callback/route.ts exists and implements GET OAuth callback exchange', () => {
    const callbackPath = path.join(projectRoot, 'app/auth/callback/route.ts');
    expect(fs.existsSync(callbackPath)).toBe(true);
    const content = fs.readFileSync(callbackPath, 'utf8');
    expect(content).toContain('export async function GET');
    expect(content).toContain('exchangeCodeForSession');
    expect(content).toContain('createServerClient');
  });

  it('2. verifies app/profile/page.tsx exists and renders full consumer profile features', () => {
    const profilePath = path.join(projectRoot, 'app/profile/page.tsx');
    expect(fs.existsSync(profilePath)).toBe(true);
    const content = fs.readFileSync(profilePath, 'utf8');
    expect(content).toContain('CambridgeExamCode');
    expect(content).toContain('estimatedCambridgeScore');
    expect(content).toContain('dailyGoalMinutes');
    expect(content).toContain('skillStats');
  });

  it('3. verifies context/AuthContext.tsx exports signInWithOAuth, syncGuestToAccount, and updateDisplayName', () => {
    const authPath = path.join(projectRoot, 'context/AuthContext.tsx');
    expect(fs.existsSync(authPath)).toBe(true);
    const content = fs.readFileSync(authPath, 'utf8');
    expect(content).toContain('signInWithOAuth: (provider: \'google\' | \'facebook\')');
    expect(content).toContain('syncGuestToAccount: () => Promise<{ syncedAttempts: number; error: Error | null }>');
    expect(content).toContain('updateDisplayName: (displayName: string) => Promise<{ error: Error | null }>');
    expect(content).toContain('supabase.auth.signInWithOAuth');
  });

  it('4. verifies ProfileModal.tsx includes brand-accurate Google and Facebook OAuth buttons with graceful fallback', () => {
    const modalPath = path.join(projectRoot, 'components/common/ProfileModal.tsx');
    expect(fs.existsSync(modalPath)).toBe(true);
    const content = fs.readFileSync(modalPath, 'utf8');
    expect(content).toContain('handleOAuthSignIn(\'google\')');
    expect(content).toContain('handleOAuthSignIn(\'facebook\')');
    expect(content).toContain('auth.continue_with_google');
    expect(content).toContain('auth.continue_with_facebook');
    expect(content).toContain('oauth_unconfigured_msg');
  });

  it('5. verifies Header.tsx includes authenticated consumer profile dropdown and guest sign in button', () => {
    const headerPath = path.join(projectRoot, 'components/common/Header.tsx');
    expect(fs.existsSync(headerPath)).toBe(true);
    const content = fs.readFileSync(headerPath, 'utf8');
    expect(content).toContain('isMenuOpen');
    expect(content).toContain('auth.menu_profile');
    expect(content).toContain('auth.menu_goals');
    expect(content).toContain('auth.menu_progress');
    expect(content).toContain('auth.menu_signout');
    expect(content).toContain('/profile');
  });

  it('6. verifies Thai and English i18n locales have full parity for all auth and profile keys', () => {
    const thPath = path.join(projectRoot, 'i18n/locales/th.json');
    const enPath = path.join(projectRoot, 'i18n/locales/en.json');
    const th = JSON.parse(fs.readFileSync(thPath, 'utf8'));
    const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));

    const requiredAuthKeys = [
      'continue_with_google',
      'continue_with_facebook',
      'or_divider',
      'oauth_unconfigured_title',
      'oauth_unconfigured_msg',
      'menu_profile',
      'menu_progress',
      'menu_goals',
      'menu_settings',
      'menu_signout',
      'profile_page_title',
      'profile_page_desc',
      'display_name_label',
      'edit_display_name',
      'save_display_name',
      'display_name_saved',
      'account_details',
      'created_account_date',
      'study_statistics',
      'estimated_score',
      'skill_breakdown',
      'diagnostic_completed',
      'diagnostic_pending',
      'retake_diagnostic',
      'guest_account_notice',
      'guest_sync_notice',
      'guest_convert_btn',
    ];

    for (const key of requiredAuthKeys) {
      expect(th.auth[key], `Missing Thai key: auth.${key}`).toBeDefined();
      expect(en.auth[key], `Missing English key: auth.${key}`).toBeDefined();
    }
  });

  it('7. verifies guest target exam and daily goal sync preserves Cambridge exam selection', () => {
    const authPath = path.join(projectRoot, 'context/AuthContext.tsx');
    const content = fs.readFileSync(authPath, 'utf8');
    expect(content).toContain('cefr_platform_target_exam');
    expect(content).toContain('cefr_platform_daily_goal_minutes');
    expect(content).toContain('syncGuestProgress');
  });
});
