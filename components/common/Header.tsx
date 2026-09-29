'use client';
import React from 'react';
import Link from 'next/link';
import { Flame, Clock, Moon, Sun, RefreshCw, User as UserIcon } from 'lucide-react';
import { CEFRLevel, CambridgeExamCode } from '../../types';
import { useTranslation } from '../../i18n';
import { LanguageSwitcher } from './LanguageSwitcher';
import { GlovaLogo } from '../ui/GlovaLogo';
import { GlovaLevelBadge } from '../ui/GlovaBadge';
import { CEFRTier } from '@/lib/design-tokens/tokens';

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
}) => {
  const { t } = useTranslation();
  const goalPercent = Math.min(100, Math.round((minutesStudiedToday / dailyGoalMinutes) * 100));

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/50 bg-background/90 backdrop-blur-md transition-colors pt-safe">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Logo and Brand */}
        <Link href="/" className="flex items-center gap-2.5 min-w-0 group hover:opacity-90 transition-opacity">
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
            <p className="text-[11px] text-muted-foreground truncate hidden xs:block">
              {t('header.subtitle')}
            </p>
          </div>
        </Link>

        {/* Status Indicators & Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* CEFR Level Badge */}
          <GlovaLevelBadge
            level={currentLevel as CEFRTier}
            size="sm"
            className="hidden xs:inline-flex"
          />

          {/* Streak Counter */}
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-semibold shadow-xs"
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

          {/* Re-take Diagnostic Button */}
          <button
            onClick={onRetakeAssessment}
            className="touch-target p-2 text-muted-foreground hover:text-foreground hover:bg-secondary/60 rounded-md transition-colors"
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

          {/* Profile & Auth Modal Trigger */}
          <button
            onClick={onOpenProfile}
            className={`touch-target flex items-center gap-1.5 p-1.5 sm:px-2.5 sm:py-1.5 rounded-md border text-xs font-medium transition-colors ${
              isAuthenticated
                ? 'bg-primary/10 border-primary/20 text-primary hover:bg-primary/15'
                : 'bg-secondary/60 border-border/40 text-muted-foreground hover:text-foreground hover:bg-secondary'
            }`}
            title={isAuthenticated ? `${t('header.profile_title')}: ${userEmail || 'User'}` : t('header.login')}
            aria-label={t('header.profile_title')}
          >
            <UserIcon className="w-4 h-4 shrink-0" />
            <span className="hidden lg:inline max-w-[120px] truncate">
              {isAuthenticated ? (userEmail?.split('@')[0] || t('header.my_account')) : t('header.login')}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
