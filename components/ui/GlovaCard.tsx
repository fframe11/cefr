'use client';

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { GLOVA_MOTION } from '@/lib/design-tokens/tokens';

export interface GlovaCardProps extends React.HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
  elevation?: 'flat' | 'subtle' | 'glow';
  variant?: 'default' | 'elevated' | 'interactive' | 'outline';
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

export const GlovaCard = React.forwardRef<HTMLDivElement, GlovaCardProps>(
  (
    {
      children,
      interactive = false,
      elevation,
      variant = 'default',
      className = '',
      onClick,
      ...props
    },
    ref
  ) => {
    const shouldReduceMotion = useReducedMotion();
    const isInteractive = interactive || variant === 'interactive';

    const resolvedElevation = elevation || (variant === 'elevated' ? 'subtle' : 'flat');

    const elevationStyles = {
      flat: 'bg-card border border-border/40 shadow-none',
      subtle: 'bg-card border border-border/40 shadow-sm',
      glow: 'bg-card border border-indigo-500/20 shadow-[0_4px_20px_-2px_rgba(99,102,241,0.12)]',
    }[resolvedElevation];

    const interactiveStyles = isInteractive
      ? 'cursor-pointer hover:border-indigo-500/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50'
      : '';

    if (isInteractive) {
      return (
        <motion.div
          ref={ref as any}
          tabIndex={interactive ? 0 : undefined}
          role={interactive ? 'button' : undefined}
          onClick={onClick}
          onKeyDown={(e) => {
            if (interactive && (e.key === 'Enter' || e.key === ' ')) {
              e.preventDefault();
              onClick?.(e as any);
            }
          }}
          whileHover={shouldReduceMotion ? undefined : GLOVA_MOTION.microInteractions.cardHover}
          transition={GLOVA_MOTION.spring.gentle}
          className={`rounded-xl overflow-hidden ${elevationStyles} ${interactiveStyles} ${className}`}
          {...(props as any)}
        >
          {children}
        </motion.div>
      );
    }

    return (
      <div
        ref={ref}
        className={`rounded-xl overflow-hidden ${elevationStyles} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);
GlovaCard.displayName = 'GlovaCard';

export const GlovaCardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = '',
  children,
  ...props
}) => {
  return (
    <div className={`p-5 flex flex-col gap-1.5 ${className}`} {...props}>
      {children}
    </div>
  );
};

export const GlovaCardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  className = '',
  children,
  ...props
}) => {
  return (
    <h3 className={`text-base md:text-lg font-semibold text-foreground tracking-tight ${className}`} {...props}>
      {children}
    </h3>
  );
};

export const GlovaCardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  className = '',
  children,
  ...props
}) => {
  return (
    <p className={`text-sm text-muted-foreground leading-relaxed ${className}`} {...props}>
      {children}
    </p>
  );
};

export const GlovaCardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = '',
  children,
  ...props
}) => {
  return (
    <div className={`p-5 pt-0 ${className}`} {...props}>
      {children}
    </div>
  );
};

export const GlovaCardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = '',
  children,
  ...props
}) => {
  return (
    <div className={`p-5 pt-0 mt-auto flex items-center justify-between border-t border-border/20 pt-4 ${className}`} {...props}>
      {children}
    </div>
  );
};
