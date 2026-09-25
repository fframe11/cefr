import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';
import { getProfile, updateProfile as updateProfileApi } from '../lib/api/profile';
import { UserProfileData, UpdateProfileInput } from '../lib/api/types';

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

export interface AuthContextType {
  status: AuthStatus;
  user: User | null;
  session: Session | null;
  profile: UserProfileData | null;
  error: string | null;
  signInWithPassword: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUpWithPassword: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfile: (input: UpdateProfileInput) => Promise<UserProfileData>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export interface AuthProviderProps {
  children: ReactNode;
}

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
      // In development or if user profile is being initialized
      console.warn('[AuthProvider] Failed to fetch server profile:', err?.message || err);
    }
  }, []);

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
        } else if (isMounted) {
          setSession(null);
          setUser(null);
          setProfile(null);
          setStatus('unauthenticated');
        }
      } catch (err: any) {
        if (isMounted) {
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
  }, [fetchUserProfile]);

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
      }
      return { error: null };
    } catch (err: any) {
      const errMsg = err?.message || 'ลงทะเบียนไม่สำเร็จ';
      setError(errMsg);
      return { error: err };
    }
  };

  const signOut = async () => {
    try {
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
    signOut,
    refreshProfile,
    updateProfile,
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
