'use client';
import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Flame,
  Clock,
  Moon,
  Sun,
  RefreshCw,
  User as UserIcon,
  Menu,
  ChevronDown,
  LogOut,
  Target,
  BarChart2,
  Sparkles,
} from 'lucide-react';
import { CEFRLevel, CambridgeExamCode } from '../../types';
import { useTranslation } from '../../i18n';
import { useAuth } from '../../context/AuthContext';
import { LanguageSwitcher } from './LanguageSwitcher';
import { GlovaLogo } from '../ui/GlovaLogo';
import { GlovaLevelBadge } from '../ui/GlovaBadge';
import { CEFRTier } from '@/lib/design-tokens/tokens';

function getInitials(nameOrEmail?: string | null): string {
  if (!nameOrEmail) return 'GL';
  const clean = nameOrEmail.trim();
  if (clean.includes('@')) {
    return clean.split('@')[0].slice(0, 2).toUpperCase();
  }
  const parts = clean.split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return clean.slice(0, 2).toUpperCase();
}

interface HeaderProps {
  currentLevel: CEFRLevel;
  streakDays: number;
  minutesStudiedToday: number;
  dailyGoalMinutes: number;
  targetExam: CambridgeExamCode;
  onRetakeAssessment: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  onOpenProfile?: () => void;
  isAuthenticated?: boolean;
  userEmail?: string | null;
  onOpenMobileNav?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentLevel,
  streakDays,
  minutesStudiedToday,
  dailyGoalMinutes,
  targetExam,
  onRetakeAssessment,
  isDark,
  onToggleTheme,
  onOpenProfile,
  isAuthenticated = false,
  userEmail,
  onOpenMobileNav,
}) => {
  const router = useRouter();
  const { t, language } = useTranslation();
  const { user, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const goalPercent = Math.min(100, Math.round((minutesStudiedToday / dailyGoalMinutes) * 100));

  useEffect(() => {
    if (!isMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMenuOpen]);

  const handleSignOut = async () => {
    setIsMenuOpen(false);
    await signOut();
    router.push('/landing');
  };

  const displayName = user?.user_metadata?.full_name || user?.email || userEmail || 'Learner';
  const initials = getInitials(displayName);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/90 dark:border-white/10 bg-white/95 dark:bg-[#141A22]/95 backdrop-blur-md transition-colors pt-safe shadow-xs dark:shadow-[0_4px_16px_rgba(0,0,0,0.5)]">
      <div className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        {/* Left: Mobile Nav Toggle + Studio Brand */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {onOpenMobileNav && (
            <button
              type="button"
              onClick={onOpenMobileNav}
              className="md:hidden touch-target p-2 text-slate-600 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-[#EDEBE8] hover:bg-slate-100 dark:hover:bg-[#1C2430] rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B5CE2]"
              aria-label="Open mobile navigation menu"
            >
              <Menu className="w-5 h-5" aria-hidden="true" />
            </button>
          )}

          <Link
            href="/landing"
            className="flex items-center gap-2 sm:gap-2.5 shrink-0 group hover:opacity-95 transition-all outline-none focus-visible:ring-2 focus-visible:ring-[#5B5CE2] rounded-xl p-1 -m-1"
            aria-label="Glova Home - Brand Showcase"
          >
            <div className="flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-200">
              <GlovaLogo size={32} variant="radiant" ariaLabel="Glova Brand Logo" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-black text-base sm:text-lg tracking-tight font-display text-slate-900 dark:text-[#EDEBE8] flex items-center gap-1">
                  Glova
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E5A93C] shadow-[0_0_8px_#E5A93C]" />
                </span>
                <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-50 dark:bg-[#1C2430] text-amber-700 dark:text-[#E5A93C] border border-amber-300 dark:border-[#E5A93C]/30 shadow-xs">
                  {targetExam} {t('header.prep_suffix')}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-[#94A3B8] font-mono truncate hidden md:block">
                Cambridge CEFR Linguistic Studio
              </p>
            </div>
          </Link>
        </div>

        {/* Center/Right Status Indicators & Hardware Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* CEFR Level Badge */}
          <GlovaLevelBadge
            level={currentLevel as CEFRTier}
            size="sm"
            className="hidden sm:inline-flex"
          />

          {/* Streak Flame Telemetry */}
          <div
            className="flex items-center gap-1 sm:gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 dark:bg-[#0F141C] border border-amber-200 dark:border-amber-500/25 text-amber-700 dark:text-[#E5A93C] text-xs font-mono font-bold shadow-xs dark:shadow-inner"
            title={`${streakDays} Day Study Streak`}
          >
            <Flame className="w-3.5 h-3.5 shrink-0 fill-amber-500/30 text-amber-600 dark:text-[#E5A93C]" />
            <span className="tabular-nums">{streakDays}</span>
            <span className="hidden md:inline text-amber-800 dark:text-amber-300/80 font-normal">{t('common.days')}</span>
          </div>

          {/* Daily Goal Telemetry */}
          <div
            className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-[#0F141C] border border-slate-200 dark:border-white/10 text-xs font-mono"
            title={`Today: ${minutesStudiedToday} of ${dailyGoalMinutes} minutes`}
          >
            <Clock className="w-3.5 h-3.5 text-slate-500 dark:text-[#94A3B8] shrink-0" />
            <span className="text-slate-900 dark:text-[#EDEBE8] font-bold tabular-nums">
              {minutesStudiedToday}/{dailyGoalMinutes}m
            </span>
            <div className="w-10 h-1.5 bg-slate-200 dark:bg-[#1C2430] rounded-full overflow-hidden border border-slate-300 dark:border-white/10">
              <div
                className="h-full bg-[#10B981] rounded-full transition-all duration-300 shadow-[0_0_6px_#10B981]"
                style={{ width: `${goalPercent}%` }}
              />
            </div>
          </div>

          {/* Language Switcher */}
          <LanguageSwitcher />

          {/* Re-take Diagnostic Button */}
          <button
            onClick={onRetakeAssessment}
            className="hidden sm:inline-flex touch-target p-2 text-slate-600 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-[#EDEBE8] hover:bg-slate-100 dark:hover:bg-[#1C2430] rounded-md border border-slate-200 dark:border-white/10 transition-colors active:scale-95"
            title={t('header.retake_assessment')}
            aria-label={t('header.retake_assessment')}
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Theme Switcher Toggle */}
          <button
            onClick={onToggleTheme}
            className="touch-target p-2 text-slate-600 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-[#EDEBE8] hover:bg-slate-100 dark:hover:bg-[#1C2430] rounded-md border border-slate-200 dark:border-white/10 transition-colors active:scale-95"
            title={t('header.switch_theme')}
            aria-label={t('header.switch_theme')}
          >
            {isDark ? <Sun className="w-4 h-4 text-[#E5A93C]" /> : <Moon className="w-4 h-4 text-[#5B5CE2]" />}
          </button>

          {/* Account Profile Capsule */}
          {isAuthenticated ? (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="touch-target flex items-center gap-2 p-1 sm:px-2.5 sm:py-1 rounded-full sm:rounded-xl border border-slate-200 dark:border-white/15 bg-slate-100 dark:bg-[#1C2430] hover:bg-slate-200/80 dark:hover:bg-[#222E3A] text-xs font-medium text-slate-900 dark:text-[#EDEBE8] transition-all shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B5CE2]"
                aria-expanded={isMenuOpen}
                aria-haspopup="menu"
                aria-label={t('auth.menu_profile')}
              >
                <div className="w-6 h-6 rounded-full bg-[#5B5CE2] text-white font-mono font-bold text-[10px] flex items-center justify-center shrink-0 border border-white/20">
                  {initials}
                </div>
                <span className="hidden sm:inline font-mono text-[11px] truncate max-w-[100px]">
                  {displayName}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500 dark:text-[#94A3B8] hidden sm:block shrink-0" />
              </button>

              {/* Profile Dropdown Menu */}
              {isMenuOpen && (
                <div
                  role="menu"
                  aria-orientation="vertical"
                  className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 dark:border-white/15 bg-white dark:bg-[#141A22] text-slate-900 dark:text-[#EDEBE8] shadow-2xl p-1.5 space-y-1 z-50 animate-in fade-in-50 zoom-in-95 duration-100"
                >
                  <div className="px-3 py-2 border-b border-slate-200 dark:border-white/10">
                    <p className="text-xs font-bold text-slate-900 dark:text-[#EDEBE8] truncate">{displayName}</p>
                    <p className="text-[10px] text-slate-500 dark:text-[#94A3B8] font-mono truncate">{user?.email}</p>
                    <div className="mt-1 flex items-center gap-1.5">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                      <span className="text-[10px] text-slate-600 dark:text-[#94A3B8] font-mono">
                        CEFR {currentLevel} • {targetExam}
                      </span>
                    </div>
                  </div>

                  <button
                    role="menuitem"
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      if (onOpenProfile) onOpenProfile();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-slate-800 dark:text-[#EDEBE8] hover:bg-slate-100 dark:hover:bg-[#1C2430] transition-colors"
                  >
                    <UserIcon className="w-4 h-4 text-slate-500 dark:text-[#94A3B8]" />
                    <span>{t('auth.menu_profile')}</span>
                  </button>

                  <button
                    role="menuitem"
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      router.push('/analytics');
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-slate-900 dark:text-[#EDEBE8] hover:bg-slate-100 dark:bg-[#1C2430] transition-colors"
                  >
                    <BarChart2 className="w-4 h-4 text-[#94A3B8]" />
                    <span>{t('sidebar.analytics')}</span>
                  </button>

                  <div className="border-t border-slate-200/80 dark:border-white/10 pt-1">
                    <button
                      role="menuitem"
                      type="button"
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-[#F43F5E] hover:bg-[#F43F5E]/10 transition-colors"
                    >
                      <LogOut className="w-4 h-4 text-[#F43F5E]" />
                      <span>{t('auth.sign_out')}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenProfile}
              className="touch-target inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 dark:bg-[#5B5CE2] text-white text-xs font-bold shadow-[0_2px_0_#3730A3] dark:shadow-[0_2px_0_#3839A0] hover:bg-indigo-700 dark:hover:bg-[#4E4FD6] active:translate-y-0.5 transition-all"
              aria-label={language === 'en' ? 'Sign In' : 'เข้าสู่ระบบ'}
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>{language === 'en' ? 'Sign In' : 'เข้าสู่ระบบ'}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
