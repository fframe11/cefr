import React from 'react';
import { Flame, Clock, Award, Moon, Sun, GraduationCap, RefreshCw } from 'lucide-react';
import { CEFRLevel, CambridgeExamCode } from '../../types';

interface HeaderProps {
  currentLevel: CEFRLevel;
  streakDays: number;
  minutesStudiedToday: number;
  dailyGoalMinutes: number;
  targetExam: CambridgeExamCode;
  onRetakeAssessment: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
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
}) => {
  const goalPercent = Math.min(100, Math.round((minutesStudiedToday / dailyGoalMinutes) * 100));

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/50 bg-background/90 backdrop-blur-md transition-colors pt-safe">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Logo and Brand */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
            <GraduationCap className="w-5 h-5 text-primary" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm sm:text-base tracking-tight truncate text-foreground">
                CEFR English
              </span>
              <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium bg-muted text-muted-foreground border border-border">
                {targetExam} Prep
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground truncate hidden xs:block">
              Cambridge Exam Learning Platform
            </p>
          </div>
        </div>

        {/* Status Indicators & Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* CEFR Level Badge */}
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-primary/10 border border-primary/20 text-primary text-xs font-semibold"
            title={`Current CEFR Level: ${currentLevel}`}
          >
            <Award className="w-3.5 h-3.5 shrink-0" />
            <span>CEFR {currentLevel}</span>
          </div>

          {/* Streak Counter */}
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-medium"
            title={`${streakDays} Day Study Streak`}
          >
            <Flame className="w-3.5 h-3.5 shrink-0 fill-amber-500/20 text-amber-500" />
            <span className="font-semibold">{streakDays}</span>
            <span className="hidden md:inline text-muted-foreground">วัน</span>
          </div>

          {/* Daily Goal Progress */}
          <div
            className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-md bg-muted/60 border border-border text-xs"
            title={`Today: ${minutesStudiedToday} of ${dailyGoalMinutes} minutes`}
          >
            <Clock className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <span className="text-foreground font-medium">
              {minutesStudiedToday}/{dailyGoalMinutes}m
            </span>
            <div className="w-10 h-1.5 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                style={{ width: `${goalPercent}%` }}
              />
            </div>
          </div>

          {/* Re-take Diagnostic Button */}
          <button
            onClick={onRetakeAssessment}
            className="touch-target p-2 text-muted-foreground hover:text-foreground hover:bg-muted/60 rounded-md transition-colors"
            title="วัดระดับภาษาอังกฤษใหม่ (Diagnostic Assessment)"
            aria-label="วัดระดับใหม่"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            className="touch-target p-2 text-muted-foreground hover:text-foreground hover:bg-muted/60 rounded-md transition-colors"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};
