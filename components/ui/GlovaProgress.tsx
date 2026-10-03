'use client';

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { GLOVA_MOTION } from '@/lib/design-tokens/tokens';

export interface GlovaProgressBarProps {
  value: number; // 0 to 100
  max?: number;
  label?: string;
  showLabel?: boolean;
  showValue?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'success' | 'amber' | 'sky';
  className?: string;
}

export const GlovaProgressBar: React.FC<GlovaProgressBarProps> = ({
  value,
  max,
  label,
  showLabel = true,
  showValue = false,
  size = 'md',
  variant = 'primary',
  className = '',
}) => {
  const shouldReduceMotion = useReducedMotion();
  const normalizedValue = max && max > 0 ? (value / max) * 100 : value;
  const clampedValue = Math.min(100, Math.max(0, normalizedValue));

  const heightStyles = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-3.5',
  }[size];

  const fillStyles = {
    primary: 'bg-gradient-to-r from-[#FA5D5D] to-violet-500',
    success: 'bg-gradient-to-r from-emerald-500 to-teal-500',
    amber: 'bg-gradient-to-r from-amber-500 to-orange-500',
    sky: 'bg-gradient-to-r from-amber-500 to-purple-500',
  }[variant];

  return (
    <div className={`w-full flex flex-col gap-1.5 ${className}`}>
      {showLabel && (label || showValue) && (
        <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
          {label && <span>{label}</span>}
          {showValue && <span className="tabular-nums font-semibold text-foreground">{Math.round(clampedValue)}%</span>}
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={clampedValue}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label || 'Progress'}
        className={`w-full overflow-hidden rounded-full bg-secondary/80 ${heightStyles}`}
      >
        <motion.div
          initial={shouldReduceMotion ? { width: `${clampedValue}%` } : { width: '0%' }}
          animate={{ width: `${clampedValue}%` }}
          transition={GLOVA_MOTION.spring.gentle}
          className={`h-full rounded-full ${fillStyles}`}
        />
      </div>
    </div>
  );
};

export interface GlovaProgressCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  progressPercent?: number;
  trendText?: string;
  trendType?: 'positive' | 'neutral' | 'negative';
  icon?: React.ReactNode;
  className?: string;
}

export const GlovaProgressCard: React.FC<GlovaProgressCardProps> = ({
  title,
  value,
  subtitle,
  progressPercent,
  trendText,
  trendType = 'positive',
  icon,
  className = '',
}) => {
  const trendColor = {
    positive: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    neutral: 'bg-secondary text-muted-foreground border-border/40',
    negative: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  }[trendType];

  return (
    <div className={`rounded-xl border border-border/40 bg-card p-4 sm:p-5 flex flex-col justify-between shadow-sm ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium text-muted-foreground">{title}</span>
          <span className="text-2xl font-bold tracking-tight text-foreground tabular-nums">{value}</span>
        </div>
        {icon && (
          <div className="p-2.5 rounded-lg bg-secondary text-primary shrink-0 border border-border/30">
            {icon}
          </div>
        )}
      </div>

      {(typeof progressPercent === 'number' || trendText || subtitle) && (
        <div className="mt-4 pt-3 border-t border-border/20 flex flex-col gap-2">
          {typeof progressPercent === 'number' && (
            <GlovaProgressBar value={progressPercent} size="sm" variant="primary" />
          )}
          <div className="flex items-center justify-between text-xs">
            {subtitle && <span className="text-muted-foreground">{subtitle}</span>}
            {trendText && (
              <span className={`inline-flex items-center rounded px-1.5 py-0.5 font-medium border text-[11px] ${trendColor}`}>
                {trendText}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export const GlovaProgress = GlovaProgressBar;
export type GlovaProgressProps = GlovaProgressBarProps;
