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
  className = '',
}) => {
  return (
    <GlovaCard
      elevation={isPrimary ? 'glow' : 'subtle'}
      className={`border ${isPrimary ? 'border-indigo-500/30 bg-gradient-to-br from-card via-card to-indigo-950/20' : 'border-border/40'} ${className}`}
    >
      <GlovaCardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-start gap-4">
          {icon && (
            <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0">
              {icon}
            </div>
          )}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              {cefrLevel && <GlovaLevelBadge level={cefrLevel} size="sm" />}
              {typeof estimatedMinutes === 'number' && (
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full border border-border/30">
                  <Clock className="w-3 h-3" aria-hidden="true" />
                  <span>{estimatedMinutes} min</span>
                </span>
              )}
            </div>
            <h4 className="text-base md:text-lg font-bold text-foreground tracking-tight">
              {title}
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xl">
              {description}
            </p>
          </div>
        </div>

        <div className="shrink-0 flex items-center">
          <GlovaButton
            variant={isPrimary ? 'primary' : 'secondary'}
            size="md"
            rightIcon={<ArrowRight className="w-4 h-4" aria-hidden="true" />}
            onClick={onStart}
            className="w-full md:w-auto"
          >
            {ctaText}
          </GlovaButton>
        </div>
      </GlovaCardContent>
    </GlovaCard>
  );
};
