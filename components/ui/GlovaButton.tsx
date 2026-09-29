'use client';

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { GLOVA_MOTION } from '@/lib/design-tokens/tokens';

export interface GlovaButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'success';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const GlovaButton = React.forwardRef<HTMLButtonElement, GlovaButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled = false,
      className = '',
      onClick,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const shouldReduceMotion = useReducedMotion();
    const isDisabled = disabled || isLoading;

    // Base styling ensuring 44px touch target on default/large sizes with zero text wrapping
    const baseStyles =
      'inline-flex items-center justify-center whitespace-nowrap font-medium rounded-lg transition-colors select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50';

    const sizeStyles = {
      sm: 'text-xs h-9 px-3 gap-1.5 touch-target', // Still >= 44px tap target via .touch-target
      md: 'text-sm h-11 px-4 gap-2 min-h-[44px]',
      lg: 'text-base h-12 px-6 gap-2.5 min-h-[48px]',
    }[size];

    const variantStyles = {
      primary:
        'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-sm hover:from-indigo-500 hover:to-violet-500 active:from-indigo-700 active:to-violet-700',
      secondary:
        'bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border/40',
      outline:
        'border border-border bg-transparent hover:bg-muted/40 text-foreground',
      ghost:
        'bg-transparent hover:bg-muted/50 text-foreground hover:text-foreground',
      destructive:
        'bg-rose-600 text-white hover:bg-rose-500 active:bg-rose-700 shadow-sm',
      success:
        'bg-emerald-600 text-white hover:bg-emerald-500 active:bg-emerald-700 shadow-sm',
    }[variant];

    return (
      <motion.button
        ref={ref}
        type={type}
        disabled={isDisabled}
        onClick={onClick}
        aria-busy={isLoading}
        whileHover={shouldReduceMotion || isDisabled ? undefined : GLOVA_MOTION.microInteractions.buttonHover}
        whileTap={shouldReduceMotion || isDisabled ? undefined : GLOVA_MOTION.microInteractions.buttonTap}
        transition={GLOVA_MOTION.spring.snappy}
        className={`${baseStyles} ${sizeStyles} ${variantStyles} ${fullWidth ? 'w-full' : ''} ${className}`}
        {...(props as any)}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin shrink-0" aria-hidden="true" />
            <span className="whitespace-nowrap truncate">{children}</span>
          </>
        ) : (
          <span className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap">
            {leftIcon && <span className="shrink-0 inline-flex items-center justify-center">{leftIcon}</span>}
            <span className="whitespace-nowrap truncate">{children}</span>
            {rightIcon && <span className="shrink-0 inline-flex items-center justify-center">{rightIcon}</span>}
          </span>
        )}
      </motion.button>
    );
  }
);

GlovaButton.displayName = 'GlovaButton';
