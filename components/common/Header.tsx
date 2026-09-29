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
  const { t } = useTranslation();
  const { user, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const goalPercent = Math.min(100, Math.round((minutesStudiedToday / dailyGoalMinutes) * 100));

  // Close menu on click outside or escape key
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
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMenuOpen]);

  const displayName =
    user?.user_metadata?.display_name ||
    user?.user_metadata?.full_name ||
    userEmail?.split('@')[0] ||
    'Learner';

  const initials = getInitials(displayName);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/50 bg-background/90 backdrop-blur-md transition-colors pt-safe">
      <div className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        {/* Left: Mobile Nav Toggle + Logo and Brand */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {onOpenMobileNav && (
            <button
              type="button"
              onClick={onOpenMobileNav}
              className="md:hidden touch-target p-2 text-muted-foreground hover:text-foreground hover:bg-secondary/60 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              aria-label="Open mobile navigation menu"
            >
              <Menu className="w-5 h-5" aria-hidden="true" />
            </button>
          )}

          <Link href="/" className="flex items-center gap-2 sm:gap-2.5 shrink-0 group hover:opacity-90 transition-opacity">
            <div className="flex items-center justify-center shrink-0">
              <GlovaLogo size={32} variant="radiant" ariaLabel="Glova" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-base sm:text-lg tracking-tight truncate bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-500 bg-clip-text text-transparent">
                  Glova
                </span>
                <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium bg-secondary text-muted-foreground border border-border/40">
                  {targetExam} {t('header.prep_suffix')}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground truncate hidden md:block">
                {t('header.subtitle')}
              </p>
            </div>
          </Link>
        </div>

        {/* Status Indicators & Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* CEFR Level Badge */}
          <GlovaLevelBadge
            level={currentLevel as CEFRTier}
            size="sm"
            className="hidden sm:inline-flex"
          />

          {/* Streak Counter */}
          <div
            className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-semibold shadow-xs"
            title={`${streakDays} Day Study Streak`}
          >
            <Flame className="w-3.5 h-3.5 shrink-0 fill-amber-500/30 text-amber-500" />
            <span className="tabular-nums font-bold">{streakDays}</span>
            <span className="hidden md:inline text-amber-400/80 font-normal">{t('common.days')}</span>
          </div>

          {/* Daily Goal Progress */}
          <div
            className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-md bg-secondary/60 border border-border/40 text-xs"
            title={`Today: ${minutesStudiedToday} of ${dailyGoalMinutes} minutes`}
          >
            <Clock className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <span className="text-foreground font-medium tabular-nums">
              {minutesStudiedToday}/{dailyGoalMinutes}m
            </span>
            <div className="w-10 h-1.5 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                style={{ width: `${goalPercent}%` }}
              />
            </div>
          </div>

          {/* Language Switcher */}
          <LanguageSwitcher />

          {/* Re-take Diagnostic Button (Desktop / Tablet only) */}
          <button
            onClick={onRetakeAssessment}
            className="hidden sm:inline-flex touch-target p-2 text-muted-foreground hover:text-foreground hover:bg-secondary/60 rounded-md transition-colors"
            title={t('header.retake_assessment')}
            aria-label={t('header.retake_assessment')}
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            className="touch-target p-2 text-muted-foreground hover:text-foreground hover:bg-secondary/60 rounded-md transition-colors"
            title={t('header.switch_theme')}
            aria-label={t('header.switch_theme')}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Profile / Account Control */}
          {isAuthenticated ? (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="touch-target flex items-center gap-2 p-1 sm:px-2.5 sm:py-1 rounded-full sm:rounded-xl border border-border/60 bg-secondary/50 hover:bg-secondary text-xs font-medium text-foreground transition-all shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                aria-expanded={isMenuOpen}
                aria-haspopup="menu"
                aria-label={t('auth.menu_profile')}
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-500 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                  {initials}
                </div>
                <span className="hidden lg:inline max-w-[100px] truncate font-semibold">
                  {displayName}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {isMenuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-64 rounded-2xl bg-card border border-border/80 shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                >
                  {/* User Header Preview */}
                  <div className="p-3 rounded-xl bg-secondary/40 border border-border/40 mb-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-foreground truncate max-w-[140px]">{displayName}</span>
                      <GlovaLevelBadge level={currentLevel as CEFRTier} size="sm" />
                    </div>
                    <p className="text-[11px] text-muted-foreground truncate">{userEmail}</p>
                  </div>

                  {/* Menu Items */}
                  <div className="space-y-0.5 text-xs font-medium">
                    <Link
                      href="/profile"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-foreground hover:bg-secondary transition-colors"
                      role="menuitem"
                    >
                      <UserIcon className="w-4 h-4 text-primary shrink-0" />
                      <span>{t('auth.menu_profile')}</span>
                    </Link>

                    <button
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false);
                        if (onOpenProfile) onOpenProfile();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-foreground hover:bg-secondary transition-colors text-left"
                      role="menuitem"
                    >
                      <Target className="w-4 h-4 text-primary shrink-0" />
                      <span>{t('auth.menu_goals')}</span>
                    </button>

                    <Link
                      href="/analytics"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-foreground hover:bg-secondary transition-colors"
                      role="menuitem"
                    >
                      <BarChart2 className="w-4 h-4 text-indigo-500 shrink-0" />
                      <span>{t('auth.menu_progress')}</span>
                    </Link>

                    <div className="my-1 border-t border-border/50" />

                    <button
                      type="button"
                      onClick={async () => {
                        setIsMenuOpen(false);
                        await signOut();
                        router.push('/');
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-destructive hover:bg-destructive/10 transition-colors text-left"
                      role="menuitem"
                    >
                      <LogOut className="w-4 h-4 shrink-0" />
                      <span>{t('auth.menu_signout')}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenProfile}
              className="touch-target flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border/60 bg-secondary/60 text-xs font-semibold text-foreground hover:bg-secondary transition-colors"
              title={t('auth.signin_button')}
              aria-label={t('auth.signin_button')}
            >
              <UserIcon className="w-4 h-4 shrink-0 text-primary" />
              <span className="hidden sm:inline">{t('auth.signin_button')}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
