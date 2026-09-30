'use client';

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Sparkles,
  Target,
  Flame,
  TrendingUp,
  Compass,
  Trophy,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import {
  GLOVA_BUBBLE_TYPES,
  GLOVA_MOTION,
} from '@/lib/design-tokens/tokens';

export type GlovaBubbleVariant =
  | 'insight'
  | 'goal'
  | 'challenge'
  | 'progress'
  | 'discovery'
  | 'achievement'
  | 'custom';

export interface GlovaBubbleProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  variant?: GlovaBubbleVariant;
  size?: 'sm' | 'md' | 'lg' | 'hero';
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  pillText?: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  progress?: number; // 0 to 100
  interactive?: boolean;
  className?: string;
  children?: React.ReactNode;
}

const DEFAULT_ICONS: Record<Exclude<GlovaBubbleVariant, 'custom'>, React.ReactNode> = {
  insight: <Sparkles className="w-4 h-4" aria-hidden="true" />,
  goal: <Target className="w-4 h-4" aria-hidden="true" />,
  challenge: <Flame className="w-4 h-4" aria-hidden="true" />,
  progress: <TrendingUp className="w-4 h-4" aria-hidden="true" />,
  discovery: <Compass className="w-4 h-4" aria-hidden="true" />,
  achievement: <Trophy className="w-4 h-4" aria-hidden="true" />,
};

export const GlovaBubble: React.FC<GlovaBubbleProps> = ({
  variant = 'insight',
  size = 'md',
  title,
  subtitle,
  pillText,
  icon,
  action,
  progress,
  interactive = false,
  className = '',
  children,
  onClick,
  ...props
}) => {
  const shouldReduceMotion = useReducedMotion();
  const isInteractive = interactive || Boolean(onClick) || Boolean(action);

  // Resolved tokens for variant
  const typeConfig = variant !== 'custom' ? GLOVA_BUBBLE_TYPES[variant] : null;
  const resolvedIcon = icon || (variant !== 'custom' ? DEFAULT_ICONS[variant] : null);
  const resolvedPillText = pillText || (typeConfig ? typeConfig.titleEn : undefined);

  // Size styling maps
  const sizeStyles = {
    sm: 'p-3.5 rounded-[20px] gap-2',
    md: 'p-4 md:p-5 rounded-[24px] gap-3',
    lg: 'p-5 md:p-6 rounded-[28px] gap-4',
    hero: 'p-6 md:p-8 rounded-[32px] gap-5',
  }[size];

  const content = (
    <div className="flex flex-col h-full justify-between gap-3">
      {/* Top row: Pill badge + Icon / Progress */}
      {(resolvedPillText || resolvedIcon || typeof progress === 'number') && (
        <div className="flex items-center justify-between gap-2">
          {resolvedPillText && (
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase transition-colors"
              style={{
                backgroundColor: typeConfig?.pillBg || 'rgba(91, 92, 226, 0.1)',
                color: typeConfig?.pillText || '#5B5CE2',
              }}
            >
              {resolvedIcon}
              <span>{resolvedPillText}</span>
            </span>
          )}

          {typeof progress === 'number' && (
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <span>{Math.round(progress)}%</span>
              <div
                className="w-12 h-1.5 rounded-full overflow-hidden"
                style={{ backgroundColor: 'rgba(0, 0, 0, 0.06)' }}
                role="progressbar"
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className="h-full rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: `${Math.min(100, Math.max(0, progress))}%`,
                    backgroundColor: typeConfig?.accent || '#5B5CE2',
                  }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main copy */}
      <div className="flex flex-col gap-1">
        {title && (
          <h4
            className={`font-bold tracking-tight text-foreground ${
              size === 'hero'
                ? 'text-xl md:text-2xl'
                : size === 'lg'
                ? 'text-lg md:text-xl'
                : size === 'sm'
                ? 'text-sm font-semibold'
                : 'text-base font-bold'
            }`}
          >
            {title}
          </h4>
        )}
        {subtitle && (
          <p
            className={`text-muted-foreground leading-relaxed ${
              size === 'sm' ? 'text-xs' : 'text-xs md:text-sm'
            }`}
          >
            {subtitle}
          </p>
        )}
      </div>

      {/* Custom children injection */}
      {children}

      {/* Optional bottom action */}
      {action && (
        <div className="pt-1 mt-auto flex items-center justify-between">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              action.onClick();
            }}
            className="inline-flex items-center gap-1.5 text-xs md:text-sm font-semibold transition-all group"
            style={{ color: typeConfig?.accent || '#5B5CE2' }}
          >
            <span>{action.label}</span>
            <ArrowRight
              className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1"
              aria-hidden="true"
            />
          </button>
        </div>
      )}
    </div>
  );

  const containerClasses = `relative flex flex-col transition-all duration-200 border bg-[#F0EAE1] dark:bg-[#1A232C] border-[rgba(37,36,42,0.12)] dark:border-[rgba(255,255,255,0.08)] text-[#25242A] dark:text-[#EDEBE8] ${sizeStyles} ${className}`;
  const customBorderColor = typeConfig ? typeConfig.border : 'rgba(184, 167, 255, 0.16)';

  if (isInteractive) {
    return (
      <motion.div
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        onClick={onClick}
        onKeyDown={(e) => {
          if (onClick && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            onClick(e as any);
          }
        }}
        whileHover={
          shouldReduceMotion
            ? undefined
            : {
                scale: 1.018,
                y: -3,
                transition: GLOVA_MOTION.spring.gentle,
              }
        }
        whileTap={shouldReduceMotion ? undefined : { scale: 0.985 }}
        style={{
          borderColor: customBorderColor,
          boxShadow:
            '0 8px 30px -4px rgba(36, 35, 58, 0.06), 0 2px 10px -2px rgba(36, 35, 58, 0.04)',
        }}
        className={`${containerClasses} cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50`}
        {...(props as any)}
      >
        {content}
      </motion.div>
    );
  }

  return (
    <div
      style={{
        borderColor: customBorderColor,
        boxShadow:
          '0 6px 24px -4px rgba(36, 35, 58, 0.05), 0 2px 8px -2px rgba(36, 35, 58, 0.03)',
      }}
      className={containerClasses}
      {...props}
    >
      {content}
    </div>
  );
};

/**
 * Pre-configured Archetype: InsightBubble
 */
export const InsightBubble: React.FC<{
  title: string;
  description: string;
  className?: string;
  onClick?: () => void;
}> = ({ title, description, className = '', onClick }) => (
  <GlovaBubble
    variant="insight"
    size="md"
    title={title}
    subtitle={description}
    interactive={Boolean(onClick)}
    onClick={onClick}
    className={className}
  />
);

/**
 * Pre-configured Archetype: GoalBubble
 */
export const GoalBubble: React.FC<{
  minutesTarget: number;
  minutesCompleted: number;
  className?: string;
  onContinue?: () => void;
}> = ({ minutesTarget, minutesCompleted, className = '', onContinue }) => {
  const percent = Math.min(100, Math.round((minutesCompleted / Math.max(1, minutesTarget)) * 100));
  return (
    <GlovaBubble
      variant="goal"
      size="md"
      pillText={`${minutesCompleted}/${minutesTarget} min`}
      title="Daily Momentum"
      subtitle={`${minutesTarget - minutesCompleted > 0 ? `${minutesTarget - minutesCompleted} minutes remaining to hit your target` : 'Daily learning goal accomplished!'}`}
      progress={percent}
      action={
        onContinue
          ? {
              label: 'Keep Learning',
              onClick: onContinue,
            }
          : undefined
      }
      className={className}
    />
  );
};

/**
 * Pre-configured Archetype: ChallengeBubble
 */
export const ChallengeBubble: React.FC<{
  title?: string;
  topic?: string;
  durationMinutes?: number;
  onStart: () => void;
  className?: string;
}> = ({
  title = '7-Minute Daily Sprint',
  topic = 'Collocations & Natural Expressions',
  durationMinutes = 7,
  onStart,
  className = '',
}) => (
  <GlovaBubble
    variant="challenge"
    size="lg"
    pillText={`${durationMinutes} min active`}
    title={title}
    subtitle={`Bite-sized challenge in ${topic}. Designed for high retention.`}
    action={{
      label: 'Start Challenge',
      onClick: onStart,
    }}
    interactive
    onClick={onStart}
    className={className}
  />
);

/**
 * Pre-configured Archetype: ProgressBubble
 */
export const ProgressBubble: React.FC<{
  currentTier: string;
  targetTier: string;
  progressPercent: number;
  onViewPathway?: () => void;
  className?: string;
}> = ({ currentTier, targetTier, progressPercent, onViewPathway, className = '' }) => (
  <GlovaBubble
    variant="progress"
    size="md"
    pillText={`${currentTier} → ${targetTier}`}
    title={`${targetTier} is within reach`}
    subtitle={`You have mastered ${progressPercent}% of the essential descriptors for ${targetTier}.`}
    progress={progressPercent}
    action={
      onViewPathway
        ? {
            label: 'View Learning Map',
            onClick: onViewPathway,
          }
        : undefined
    }
    className={className}
  />
);

/**
 * Pre-configured Archetype: DiscoveryBubble
 */
export const DiscoveryBubble: React.FC<{
  word: string;
  phonetic?: string;
  translation: string;
  onExplore?: () => void;
  className?: string;
}> = ({ word, phonetic, translation, onExplore, className = '' }) => (
  <GlovaBubble
    variant="discovery"
    size="md"
    pillText="Word of the Moment"
    title={
      <div className="flex items-baseline gap-2">
        <span className="text-lg font-bold">{word}</span>
        {phonetic && (
          <span className="text-xs font-mono font-normal text-muted-foreground">{phonetic}</span>
        )}
      </div>
    }
    subtitle={translation}
    action={
      onExplore
        ? {
            label: 'Explore Usage',
            onClick: onExplore,
          }
        : undefined
    }
    className={className}
  />
);

/**
 * Pre-configured Archetype: AchievementBubble
 */
export const AchievementBubble: React.FC<{
  streakDays: number;
  badgeLabel?: string;
  className?: string;
}> = ({ streakDays, badgeLabel = 'Consistency Champion', className = '' }) => (
  <GlovaBubble
    variant="achievement"
    size="sm"
    pillText={`${streakDays}-Day Streak`}
    title={`${streakDays} Days in Rhythm`}
    subtitle={badgeLabel}
    className={className}
  />
);
