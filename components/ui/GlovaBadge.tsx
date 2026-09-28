import React from 'react';
import {
  Headphones,
  BookOpen,
  Mic,
  PenTool,
  CheckCircle2,
  Bookmark,
  Award,
} from 'lucide-react';
import { getCefrBadgeStyle, CEFRTier } from '@/lib/design-tokens/tokens';

export interface GlovaLevelBadgeProps {
  level: CEFRTier;
  showLabel?: boolean;
  score?: number;
  isActive?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Reusable CEFR Level Badge adhering to tokenized jewel-tone palette
 */
export const GlovaLevelBadge: React.FC<GlovaLevelBadgeProps> = ({
  level,
  showLabel = false,
  score,
  isActive = true,
  size = 'md',
  className = '',
}) => {
  const badgeStyle = getCefrBadgeStyle(level);

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs font-semibold px-2.5 py-1 gap-1.5',
    lg: 'text-sm font-bold px-3 py-1.5 gap-2',
  }[size];

  const opacityClass = isActive ? 'opacity-100' : 'opacity-40 grayscale';

  return (
    <span
      role="status"
      aria-label={`CEFR Level ${level} ${badgeStyle.label}`}
      className={`inline-flex items-center rounded-full border font-medium tracking-wide select-none ${badgeStyle.bgClass} ${badgeStyle.textClass} ${badgeStyle.borderClass} ${sizeClasses} ${opacityClass} ${className}`}
    >
      <Award className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
      <span>{level}</span>
      {showLabel && (
        <span className="opacity-90 font-normal">
          {badgeStyle.label}
        </span>
      )}
      {typeof score === 'number' && (
        <span className="ml-1 pl-1 border-l border-current/30 text-[11px] tabular-nums font-bold">
          {score}
        </span>
      )}
    </span>
  );
};

export type LearningSkill = 'listening' | 'reading' | 'speaking' | 'writing' | 'grammar' | 'vocabulary' | 'mockExam';

export interface GlovaSkillBadgeProps {
  skill: LearningSkill;
  score?: number;
  size?: 'sm' | 'md';
  className?: string;
}

/**
 * Reusable Skill Badge mapping English competencies to Lucide icons
 */
export const GlovaSkillBadge: React.FC<GlovaSkillBadgeProps> = ({
  skill,
  score,
  size = 'md',
  className = '',
}) => {
  const skillConfig = {
    listening: { label: 'Listening', icon: Headphones, color: 'text-sky-400 bg-sky-500/10 border-sky-500/20' },
    reading: { label: 'Reading', icon: BookOpen, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
    speaking: { label: 'Speaking', icon: Mic, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
    writing: { label: 'Writing', icon: PenTool, color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
    grammar: { label: 'Grammar', icon: CheckCircle2, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
    vocabulary: { label: 'Vocabulary', icon: Bookmark, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' },
    mockExam: { label: 'Mock Exam', icon: Award, color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' },
  }[skill];

  const IconComponent = skillConfig.icon;
  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-0.5 gap-1' : 'text-xs px-2.5 py-1 gap-1.5';

  return (
    <span
      role="status"
      aria-label={`Skill: ${skillConfig.label}`}
      className={`inline-flex items-center rounded-md border font-medium select-none ${skillConfig.color} ${sizeClasses} ${className}`}
    >
      <IconComponent className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
      <span>{skillConfig.label}</span>
      {typeof score === 'number' && (
        <span className="ml-1 pl-1 border-l border-current/30 tabular-nums font-semibold">
          {score}%
        </span>
      )}
    </span>
  );
};

export interface GlovaBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'success' | 'warning' | 'error' | 'accent' | 'danger';
  size?: 'sm' | 'md';
}

export const GlovaBadge: React.FC<GlovaBadgeProps> = ({
  variant = 'secondary',
  size = 'md',
  className = '',
  children,
  ...props
}) => {
  const variantStyles = {
    primary: 'bg-primary/10 text-primary border-primary/20',
    secondary: 'bg-secondary/60 text-foreground border-border/40',
    outline: 'bg-transparent text-muted-foreground border-border/60',
    success: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    error: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
    danger: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
    accent: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
  }[variant];

  const sizeStyles = size === 'sm' ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-1';

  return (
    <span
      className={`inline-flex items-center rounded-md border font-medium select-none ${variantStyles} ${sizeStyles} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};

