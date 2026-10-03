'use client';

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { GLOVA_MOTION } from '@/lib/design-tokens/tokens';

export interface GlovaIconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  ariaLabel: string;
  variant?: 'default' | 'primary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  shape?: 'circle' | 'rounded';
}

export const GlovaIconButton = React.forwardRef<HTMLButtonElement, GlovaIconButtonProps>(
  (
    {
      icon,
      ariaLabel,
      variant = 'default',
      size = 'md',
      shape = 'rounded',
      disabled = false,
      className = '',
      onClick,
      ...props
    },
    ref
  ) => {
    const shouldReduceMotion = useReducedMotion();

    // Invariant: Touch target must always be >= 44x44px
    const sizeStyles = {
      sm: 'w-11 h-11 p-2 text-sm',
      md: 'w-11 h-11 p-2.5 text-base',
      lg: 'w-12 h-12 p-3 text-lg',
    }[size];

    const shapeStyles = shape === 'circle' ? 'rounded-full' : 'rounded-lg';

    const variantStyles = {
      default: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border/40',
      primary: 'bg-gradient-to-r from-[#FA5D5D] to-violet-600 text-white shadow-sm hover:from-[#FA5D5D] hover:to-violet-500',
      ghost: 'bg-transparent hover:bg-muted/50 text-foreground',
      outline: 'border border-border bg-transparent hover:bg-muted/40 text-foreground',
    }[variant];

    return (
      <motion.button
        ref={ref}
        type="button"
        disabled={disabled}
        onClick={onClick}
        aria-label={ariaLabel}
        whileHover={shouldReduceMotion || disabled ? undefined : { scale: 1.08 }}
        whileTap={shouldReduceMotion || disabled ? undefined : { scale: 0.94 }}
        transition={GLOVA_MOTION.spring.snappy}
        className={`inline-flex items-center justify-center transition-colors select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FA5D5D]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-40 shrink-0 ${sizeStyles} ${shapeStyles} ${variantStyles} ${className}`}
        {...(props as any)}
      >
        {icon}
      </motion.button>
    );
  }
);

GlovaIconButton.displayName = 'GlovaIconButton';
