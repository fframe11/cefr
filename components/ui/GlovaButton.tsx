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
      'inline-flex items-center justify-center whitespace-nowrap font-bold transition-all select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B5CE2] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';

    const sizeStyles = {
      sm: 'text-xs h-9 px-3.5 gap-1.5 touch-target rounded-xl',
      md: 'text-sm h-11 px-5 gap-2 min-h-[44px] rounded-2xl',
      lg: 'text-base h-12 px-6 gap-2.5 min-h-[48px] rounded-2xl',
    }[size];

    const variantDepthStyles: Record<string, Record<string, string>> = {
      primary: {
        sm: 'bg-[#5B5CE2] hover:bg-[#4E4FD6] text-white shadow-[0_2.5px_0_0_#38399E] active:shadow-none active:translate-y-[2.5px] border-t border-white/25',
        md: 'bg-[#5B5CE2] hover:bg-[#4E4FD6] text-white shadow-[0_4px_0_0_#38399E] active:shadow-none active:translate-y-[4px] border-t border-white/25',
        lg: 'bg-[#5B5CE2] hover:bg-[#4E4FD6] text-white shadow-[0_5px_0_0_#38399E] active:shadow-none active:translate-y-[5px] border-t-2 border-white/25',
      },
      secondary: {
        sm: 'bg-[#F0EAE1] hover:bg-[#EDE6DD] dark:bg-[#1A232C] dark:hover:bg-[#222E3A] text-[#25242A] dark:text-[#EDEBE8] shadow-[0_2.5px_0_0_#C5BDB2] dark:shadow-[0_2.5px_0_0_#0F141B] active:shadow-none active:translate-y-[2.5px] border border-[rgba(37,36,42,0.14)] dark:border-[rgba(255,255,255,0.1)]',
        md: 'bg-[#F0EAE1] hover:bg-[#EDE6DD] dark:bg-[#1A232C] dark:hover:bg-[#222E3A] text-[#25242A] dark:text-[#EDEBE8] shadow-[0_3.5px_0_0_#C5BDB2] dark:shadow-[0_3.5px_0_0_#0F141B] active:shadow-none active:translate-y-[3.5px] border border-[rgba(37,36,42,0.14)] dark:border-[rgba(255,255,255,0.1)]',
        lg: 'bg-[#F0EAE1] hover:bg-[#EDE6DD] dark:bg-[#1A232C] dark:hover:bg-[#222E3A] text-[#25242A] dark:text-[#EDEBE8] shadow-[0_4.5px_0_0_#C5BDB2] dark:shadow-[0_4.5px_0_0_#0F141B] active:shadow-none active:translate-y-[4.5px] border border-[rgba(37,36,42,0.14)] dark:border-[rgba(255,255,255,0.1)]',
      },
      outline: {
        sm: 'bg-[#F0EAE1]/80 hover:bg-[#F0EAE1] dark:bg-[#1A232C]/80 dark:hover:bg-[#1A232C] text-[#25242A] dark:text-[#EDEBE8] shadow-[0_2px_0_0_#C5BDB2] dark:shadow-[0_2px_0_0_#0F141B] active:shadow-none active:translate-y-[2px] border-2 border-[rgba(37,36,42,0.16)] dark:border-[rgba(255,255,255,0.14)]',
        md: 'bg-[#F0EAE1]/80 hover:bg-[#F0EAE1] dark:bg-[#1A232C]/80 dark:hover:bg-[#1A232C] text-[#25242A] dark:text-[#EDEBE8] shadow-[0_3px_0_0_#C5BDB2] dark:shadow-[0_3px_0_0_#0F141B] active:shadow-none active:translate-y-[3px] border-2 border-[rgba(37,36,42,0.16)] dark:border-[rgba(255,255,255,0.14)]',
        lg: 'bg-[#F0EAE1]/80 hover:bg-[#F0EAE1] dark:bg-[#1A232C]/80 dark:hover:bg-[#1A232C] text-[#25242A] dark:text-[#EDEBE8] shadow-[0_4px_0_0_#C5BDB2] dark:shadow-[0_4px_0_0_#0F141B] active:shadow-none active:translate-y-[4px] border-2 border-[rgba(37,36,42,0.16)] dark:border-[rgba(255,255,255,0.14)]',
      },
      ghost: {
        sm: 'bg-transparent hover:bg-[#F0EAE1] dark:hover:bg-[#1A232C] text-[#25242A] dark:text-[#EDEBE8] shadow-none active:translate-y-0.5 border border-transparent font-medium',
        md: 'bg-transparent hover:bg-[#F0EAE1] dark:hover:bg-[#1A232C] text-[#25242A] dark:text-[#EDEBE8] shadow-none active:translate-y-0.5 border border-transparent font-medium',
        lg: 'bg-transparent hover:bg-[#F0EAE1] dark:hover:bg-[#1A232C] text-[#25242A] dark:text-[#EDEBE8] shadow-none active:translate-y-0.5 border border-transparent font-medium',
      },
      destructive: {
        sm: 'bg-[#E5484D] hover:bg-[#D4373C] text-white shadow-[0_2.5px_0_0_#9E2024] active:shadow-none active:translate-y-[2.5px] border-t border-white/25',
        md: 'bg-[#E5484D] hover:bg-[#D4373C] text-white shadow-[0_4px_0_0_#9E2024] active:shadow-none active:translate-y-[4px] border-t border-white/25',
        lg: 'bg-[#E5484D] hover:bg-[#D4373C] text-white shadow-[0_5px_0_0_#9E2024] active:shadow-none active:translate-y-[5px] border-t-2 border-white/25',
      },
      success: {
        sm: 'bg-[#10B981] hover:bg-[#059669] text-white shadow-[0_2.5px_0_0_#047857] active:shadow-none active:translate-y-[2.5px] border-t border-white/25',
        md: 'bg-[#10B981] hover:bg-[#059669] text-white shadow-[0_4px_0_0_#047857] active:shadow-none active:translate-y-[4px] border-t border-white/25',
        lg: 'bg-[#10B981] hover:bg-[#059669] text-white shadow-[0_5px_0_0_#047857] active:shadow-none active:translate-y-[5px] border-t-2 border-white/25',
      },
    };

    const styleClasses = variantDepthStyles[variant]?.[size] || variantDepthStyles.primary[size];
    const depressDistance = variant === 'ghost' ? 1 : size === 'sm' ? 2.5 : size === 'lg' ? 5 : 4;

    return (
      <motion.button
        ref={ref}
        type={type}
        disabled={isDisabled}
        onClick={onClick}
        aria-busy={isLoading}
        whileHover={shouldReduceMotion || isDisabled ? undefined : { scale: 1.01 }}
        whileTap={shouldReduceMotion || isDisabled ? undefined : { y: depressDistance }}
        transition={{ type: 'spring', stiffness: 500, damping: 28 }}
        className={`${baseStyles} ${sizeStyles} ${styleClasses} ${fullWidth ? 'w-full' : ''} ${className}`}
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
