'use client';

import React from 'react';
import { ArrowRight, Clock } from 'lucide-react';
import { GlovaCard, GlovaCardContent } from './GlovaCard';
import { GlovaButton } from './GlovaButton';
import { GlovaLevelBadge } from './GlovaBadge';
import { CEFRTier } from '@/lib/design-tokens/tokens';

export interface GlovaLearningCardProps {
  title: string;
  description: string;
  estimatedMinutes?: number;
  cefrLevel?: CEFRTier;
  ctaText?: string;
  onStart: () => void;
  icon?: React.ReactNode;
  isPrimary?: boolean;
  variant?: 'default' | 'bubble';
  className?: string;
}

/**
 * Reusable Learning Action Card (70/30 focal layout)
 * Directly implements the cognitive-load reduction principles from Phase 6.3.1
 */
export const GlovaLearningCard: React.FC<GlovaLearningCardProps> = ({
  title,
  description,
  estimatedMinutes,
  cefrLevel,
  ctaText = 'Start Exercise',
  onStart,
  icon,
  isPrimary = false,
  variant = 'default',
  className = '',
}) => {
  const isBubble = variant === 'bubble';
  return (
    <GlovaCard
      elevation={isBubble ? 'bubble' : isPrimary ? 'glow' : 'subtle'}
      variant={isBubble ? 'bubble' : 'default'}
      className={`border ${
        isBubble
          ? 'border-[rgba(255,255,255,0.08)] bg-[#141A22] text-[#EDEBE8]'
          : isPrimary
          ? 'border-[#5B5CE2]/35 dark:border-[#5B5CE2]/50 bg-[#141A22] text-[#EDEBE8]'
          : 'border-[rgba(255,255,255,0.08)] bg-card text-foreground'
      } ${className}`}
    >
      <GlovaCardContent className="p-6 sm:p-7 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex-1 min-w-0 flex items-start gap-4 sm:gap-5">
          {icon && (
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 border border-indigo-500/20 flex items-center justify-center shrink-0">
              {icon}
            </div>
          )}
          <div className="flex-1 min-w-0 flex flex-col gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              {cefrLevel && <GlovaLevelBadge level={cefrLevel} size="sm" />}
              {typeof estimatedMinutes === 'number' && (
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-secondary px-2.5 py-0.5 rounded-full border border-border/30">
                  <Clock className="w-3 h-3" aria-hidden="true" />
                  <span>{estimatedMinutes} min</span>
                </span>
              )}
            </div>
            <h4 className="text-base sm:text-lg font-bold text-foreground tracking-tight leading-snug">
              {title}
            </h4>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {description}
            </p>
          </div>
        </div>

        <div className="shrink-0 flex items-center justify-end pl-0 lg:pl-6">
          <GlovaButton
            variant={isPrimary ? 'primary' : 'secondary'}
            size="md"
            rightIcon={<ArrowRight className="w-4 h-4" aria-hidden="true" />}
            onClick={onStart}
            className="w-full sm:w-auto px-5"
          >
            {ctaText}
          </GlovaButton>
        </div>
      </GlovaCardContent>
    </GlovaCard>
  );
};
