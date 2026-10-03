'use client';
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';
import { getProfile, updateProfile as updateProfileApi } from '../lib/api/profile';
import { syncGuestProgress } from '../lib/api/guest-sync';
import { loadGuestAttempts, clearGuestAttempts } from '../services/storageService';
import { UserProfileData, UpdateProfileInput } from '../lib/api/types';
import { CambridgeExamCode } from '../types';

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

export interface AuthContextType {
  status: AuthStatus;
  user: User | null;
  session: Session | null;
  profile: UserProfileData | null;
  error: string | null;
  signInWithPassword: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUpWithPassword: (
    email: string,
    password: string
  ) => Promise<{ error: Error | null; confirmationRequired?: boolean }>;
  signInWithOAuth: (provider: 'google' | 'facebook') => Promise<{ error: Error | null; url?: string }>;
  signInAsDemoStudent: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfile: (input: UpdateProfileInput) => Promise<UserProfileData>;
  updateDisplayName: (displayName: string) => Promise<{ error: Error | null }>;
  updateAvatarUrl: (avatarUrl: string) => Promise<{ error: Error | null }>;
  syncGuestToAccount: () => Promise<{ syncedAttempts: number; error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export interface AuthProviderProps {
  children: ReactNode;
}

const createDemoUserAndSession = (): { user: User; session: Session; profile: UserProfileData } => {
  const demoUser: User = {
    id: 'demo-student-id',
    app_metadata: { provider: 'email' },
    user_metadata: { display_name: 'Demo Student', full_name: 'Demo Student' },
    aud: 'authenticated',
    created_at: new Date().toISOString(),
    email: 'student@glova.demo',
    role: 'authenticated',
  };
  const demoSession: Session = {
    access_token: 'demo-token',
    refresh_token: 'demo-refresh-token',
    expires_in: 86400,
    token_type: 'bearer',
    user: demoUser,
  };
  const demoProfile: UserProfileData = {
    id: 'demo-student-id',
    display_name: 'Demo Student',
    current_cefr_level: 'B1',
    target_exam: 'FCE',
    estimated_cambridge_score: 160,
    streak_days: 3,
    daily_goal_minutes: 20,
    last_active_date: new Date().toISOString().split('T')[0],
    assessment_completed: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  return { user: demoUser, session: demoSession, profile: demoProfile };
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchUserProfile = useCallback(async () => {
    try {
      const res = await getProfile();
      if (res && res.profile) {
        setProfile(res.profile);
      }
    } catch (err: any) {
      console.warn('[AuthProvider] Failed to fetch server profile:', err?.message || err);
    }
  }, []);

  const syncGuestToAccount = useCallback(async (): Promise<{ syncedAttempts: number; error: Error | null }> => {
    try {
      let syncedCount = 0;
      const attempts = loadGuestAttempts();
      if (attempts.length > 0) {
        const res = await syncGuestProgress({ practice_attempts: attempts });
        syncedCount = res.synced_count;
        clearGuestAttempts();
      }

      // Sync guest exam target and daily practice minutes if present in local storage
      if (typeof window !== 'undefined') {
        const savedExam = localStorage.getItem('cefr_platform_target_exam') as CambridgeExamCode | null;
        const savedMinutes = localStorage.getItem('cefr_platform_daily_goal_minutes');
        const updatePayload: UpdateProfileInput = {};

        if (savedExam && ['KET', 'PET', 'FCE', 'CAE'].includes(savedExam)) {
          updatePayload.target_exam = savedExam;
        }
        if (savedMinutes) {
          const parsed = parseInt(savedMinutes, 10);
          if (!isNaN(parsed) && parsed >= 5 && parsed <= 180) {
            updatePayload.daily_goal_minutes = parsed;
          }
        }

        if (Object.keys(updatePayload).length > 0) {
          try {
            await updateProfileApi(updatePayload);
          } catch {
            // Ignore if profile already configured
          }
        }
      }

      await fetchUserProfile();
      return { syncedAttempts: syncedCount, error: null };
    } catch (err: any) {
      console.warn('[AuthProvider] Guest migration error:', err?.message || err);
      return { syncedAttempts: 0, error: err };
    }
  }, [fetchUserProfile]);

  // Initialize session on mount
  useEffect(() => {
    let isMounted = true;

    async function initializeAuth() {
      try {
        const { data, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        if (data?.session && isMounted) {
          setSession(data.session);
          setUser(data.session.user);
          setStatus('authenticated');
          await fetchUserProfile();
          // Perform automatic guest progress sync if guest attempts are present
          await syncGuestToAccount();
        } else if (isMounted) {
          if (typeof window !== 'undefined' && localStorage.getItem('cefr_demo_session') === 'true') {
            const { user: dUser, session: dSession, profile: dProfile } = createDemoUserAndSession();
            setUser(dUser);
            setSession(dSession);
            setProfile(dProfile);
            setStatus('authenticated');
            return;
          }
          setSession(null);
          setUser(null);
          setProfile(null);
          setStatus('unauthenticated');
        }
      } catch (err: any) {
        if (isMounted) {
          if (typeof window !== 'undefined' && localStorage.getItem('cefr_demo_session') === 'true') {
            const { user: dUser, session: dSession, profile: dProfile } = createDemoUserAndSession();
            setUser(dUser);
            setSession(dSession);
            setProfile(dProfile);
            setStatus('authenticated');
            return;
          }
          setError(err?.message || 'Failed to initialize authentication.');
          setStatus('unauthenticated');
        }
      }
    }

    initializeAuth();

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      if (!isMounted) return;

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (currentSession) {
          setSession(currentSession);
          setUser(currentSession.user);
          setStatus('authenticated');
          setError(null);
          await fetchUserProfile();
          await syncGuestToAccount();
        }
      } else if (event === 'SIGNED_OUT') {
        setSession(null);
        setUser(null);
        setProfile(null);
        setStatus('unauthenticated');
      }
    });

    return () => {
      isMounted = false;
      authListener?.subscription.unsubscribe();
    };
  }, [fetchUserProfile, syncGuestToAccount]);

  const signInWithPassword = async (email: string, password: string) => {
    setError(null);
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) throw signInError;
      if (data?.session) {
        setSession(data.session);
        setUser(data.session.user);
        setStatus('authenticated');
        await fetchUserProfile();
        await syncGuestToAccount();
      }
      return { error: null };
    } catch (err: any) {
      const errMsg = err?.message || 'เข้าสู่ระบบไม่สำเร็จ';
      setError(errMsg);
      return { error: err };
    }
  };

  const signUpWithPassword = async (email: string, password: string) => {
    setError(null);
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
      if (signUpError) throw signUpError;
      if (data?.session) {
        setSession(data.session);
        setUser(data.session.user);
        setStatus('authenticated');
        await fetchUserProfile();
        await syncGuestToAccount();
        return { error: null, confirmationRequired: false };
      }
      return { error: null, confirmationRequired: true };
    } catch (err: any) {
      const errMsg = err?.message || 'ลงทะเบียนไม่สำเร็จ';
      setError(errMsg);
      return { error: err };
    }
  };

  const signInWithOAuth = async (provider: 'google' | 'facebook'): Promise<{ error: Error | null; url?: string }> => {
    setError(null);
    try {
      const redirectUrl =
        typeof window !== 'undefined'
          ? `${window.location.origin}/auth/callback?next=/dashboard`
          : 'http://localhost:3000/auth/callback?next=/dashboard';

      const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (oauthError) throw oauthError;
      if (data?.url) {
        window.location.href = data.url;
        return { error: null, url: data.url };
      }
      return { error: null };
    } catch (err: any) {
      const errMsg = err?.message || `${provider} OAuth sign-in failed.`;
      setError(errMsg);
      return { error: err };
    }
  };

  const updateDisplayName = async (displayName: string): Promise<{ error: Error | null }> => {
    try {
      const trimmed = displayName.trim();
      if (!trimmed) {
        throw new Error('Display name cannot be empty.');
      }
      const { data, error: updateError } = await supabase.auth.updateUser({
        data: {
          display_name: trimmed,
          full_name: trimmed,
        },
      });
      if (updateError) throw updateError;
      if (data?.user) {
        setUser(data.user);
      }
      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  };

  const updateAvatarUrl = async (avatarUrl: string): Promise<{ error: Error | null }> => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('glova_custom_avatar_url', avatarUrl);
      }
      if (status === 'authenticated') {
        const { data, error: updateError } = await supabase.auth.updateUser({
          data: {
            avatar_url: avatarUrl,
          },
        });
        if (updateError) throw updateError;
        if (data?.user) {
          setUser(data.user);
        }
      }
      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  };

  const signInAsDemoStudent = async () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cefr_demo_session', 'true');
    }
    const { user: dUser, session: dSession, profile: dProfile } = createDemoUserAndSession();
    setUser(dUser);
    setSession(dSession);
    setProfile(dProfile);
    setStatus('authenticated');
    setError(null);
  };

  const signOut = async () => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('cefr_demo_session');
      }
      await supabase.auth.signOut();
    } finally {
      setSession(null);
      setUser(null);
      setProfile(null);
      setStatus('unauthenticated');
      setError(null);
    }
  };

  const refreshProfile = async () => {
    if (status === 'authenticated') {
      await fetchUserProfile();
    }
  };

  const updateProfile = async (input: UpdateProfileInput): Promise<UserProfileData> => {
    const res = await updateProfileApi(input);
    if (res && res.profile) {
      setProfile(res.profile);
      return res.profile;
    }
    throw new Error('Update profile failed: invalid response.');
  };

  const value: AuthContextType = {
    status,
    user,
    session,
    profile,
    error,
    signInWithPassword,
    signUpWithPassword,
    signInWithOAuth,
    signInAsDemoStudent,
    signOut,
    refreshProfile,
    updateProfile,
    updateDisplayName,
    updateAvatarUrl,
    syncGuestToAccount,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
