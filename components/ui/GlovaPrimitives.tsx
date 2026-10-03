'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  Check,
  Lock,
  Sparkles,
  Star,
  Trophy,
  Zap,
  AlertCircle,
  ArrowRight,
  Clock,
  Swords,
  Shield,
  Compass,
  Flame,
  Layers,
  Terminal,
} from 'lucide-react';

// Re-export core Glova UI primitives for seamless backward compatibility
export * from './GlovaLogo';
export * from './GlovaButton';
export * from './GlovaIconButton';
export * from './GlovaCard';
export * from './GlovaBadge';
export * from './GlovaProgress';
export * from './GlovaLearningCard';
export * from './GlovaSectionHeader';
export * from './GlovaImage';
export * from './GlovaAvatar';
export * from './GlovaTooltip';
export * from './GlovaFeedbackBubble';
export * from './GlovaBubble';

// ============================================================================
// 1. UIVERSE.IO × DUOLINGO × VALORANT TACTILE 3D BUTTONS
// ============================================================================

export interface TactileButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | 'primary'
    | 'secondary'
    | 'surface'
    | 'neutral'
    | 'accent'
    | 'warning'
    | 'danger'
    | 'ghost'
    | 'valorant'
    | 'duolingo';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isLoading?: boolean;
}

export const TactileButton: React.FC<TactileButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  leftIcon,
  rightIcon,
  isLoading = false,
  className = '',
  disabled,
  onClick,
  ...props
}) => {
  const shouldReduceMotion = useReducedMotion();

  const sizeStyles = {
    sm: 'px-3.5 py-1.5 text-xs rounded-xl min-h-[36px]',
    md: 'px-5 py-2.5 text-sm rounded-2xl min-h-[44px]',
    lg: 'px-6 py-3.5 text-base rounded-2xl min-h-[48px]',
    xl: 'px-8 py-4 text-lg rounded-[22px] min-h-[56px]',
  }[size];

  // Physical tactile 3D extrusion (Dribbble Electric Cobalt + Tactile 3D ledge)
  const variantDepthStyles: Record<string, Record<string, string>> = {
    primary: {
      sm: 'bg-[#2155E6] hover:bg-[#1C4AC9] text-white shadow-[0_2.5px_0_0_#143DB8] active:shadow-none active:translate-y-[2.5px] border-t border-white/25 font-black',
      md: 'bg-[#2155E6] hover:bg-[#1C4AC9] text-white shadow-[0_4px_0_0_#143DB8] active:shadow-none active:translate-y-[4px] border-t border-white/25 font-black',
      lg: 'bg-[#2155E6] hover:bg-[#1C4AC9] text-white shadow-[0_5px_0_0_#143DB8] active:shadow-none active:translate-y-[5px] border-t-2 border-white/25 font-black',
      xl: 'bg-[#2155E6] hover:bg-[#1C4AC9] text-white shadow-[0_6px_0_0_#143DB8] active:shadow-none active:translate-y-[6px] border-t-2 border-white/25 font-black',
    },
    valorant: {
      sm: 'bg-[#FF4655] hover:bg-[#E63946] text-white shadow-[0_2.5px_0_0_#9E1B26] active:shadow-none active:translate-y-[2.5px] border-t border-white/30 font-black tracking-wide',
      md: 'bg-[#FF4655] hover:bg-[#E63946] text-white shadow-[0_4px_0_0_#9E1B26] active:shadow-none active:translate-y-[4px] border-t border-white/30 font-black tracking-wide',
      lg: 'bg-[#FF4655] hover:bg-[#E63946] text-white shadow-[0_5px_0_0_#9E1B26] active:shadow-none active:translate-y-[5px] border-t-2 border-white/30 font-black tracking-wide',
      xl: 'bg-[#FF4655] hover:bg-[#E63946] text-white shadow-[0_6px_0_0_#9E1B26] active:shadow-none active:translate-y-[6px] border-t-2 border-white/30 font-black tracking-wide',
    },
    duolingo: {
      sm: 'bg-[#10B981] hover:bg-[#059669] text-white shadow-[0_2.5px_0_0_#047857] active:shadow-none active:translate-y-[2.5px] border-t border-white/30 font-black',
      md: 'bg-[#10B981] hover:bg-[#059669] text-white shadow-[0_4px_0_0_#047857] active:shadow-none active:translate-y-[4px] border-t border-white/30 font-black',
      lg: 'bg-[#10B981] hover:bg-[#059669] text-white shadow-[0_5px_0_0_#047857] active:shadow-none active:translate-y-[5px] border-t-2 border-white/30 font-black',
      xl: 'bg-[#10B981] hover:bg-[#059669] text-white shadow-[0_6px_0_0_#047857] active:shadow-none active:translate-y-[6px] border-t-2 border-white/30 font-black',
    },
    secondary: {
      sm: 'bg-slate-100 hover:bg-slate-200 dark:bg-[#1C2430] dark:hover:bg-[#253040] text-slate-900 dark:text-[#EDEBE8] shadow-[0_2.5px_0_0_#CBD5E1] dark:shadow-[0_2.5px_0_0_#0D1318] active:shadow-none active:translate-y-[2.5px] border border-slate-300 dark:border-[rgba(255,255,255,0.08)] font-bold',
      md: 'bg-slate-100 hover:bg-slate-200 dark:bg-[#1C2430] dark:hover:bg-[#253040] text-slate-900 dark:text-[#EDEBE8] shadow-[0_3.5px_0_0_#CBD5E1] dark:shadow-[0_3.5px_0_0_#0D1318] active:shadow-none active:translate-y-[3.5px] border border-slate-300 dark:border-[rgba(255,255,255,0.08)] font-bold',
      lg: 'bg-slate-100 hover:bg-slate-200 dark:bg-[#1C2430] dark:hover:bg-[#253040] text-slate-900 dark:text-[#EDEBE8] shadow-[0_4.5px_0_0_#CBD5E1] dark:shadow-[0_4.5px_0_0_#0D1318] active:shadow-none active:translate-y-[4.5px] border border-slate-300 dark:border-[rgba(255,255,255,0.08)] font-bold',
      xl: 'bg-slate-100 hover:bg-slate-200 dark:bg-[#1C2430] dark:hover:bg-[#253040] text-slate-900 dark:text-[#EDEBE8] shadow-[0_5.5px_0_0_#CBD5E1] dark:shadow-[0_5.5px_0_0_#0D1318] active:shadow-none active:translate-y-[5.5px] border border-slate-300 dark:border-[rgba(255,255,255,0.08)] font-bold',
    },
    neutral: {
      sm: 'bg-slate-100 hover:bg-slate-200 dark:bg-[#1C2430] dark:hover:bg-[#253040] text-slate-900 dark:text-[#EDEBE8] shadow-[0_2.5px_0_0_#CBD5E1] dark:shadow-[0_2.5px_0_0_#0D1318] active:shadow-none active:translate-y-[2.5px] border border-slate-300 dark:border-[rgba(255,255,255,0.08)] font-bold',
      md: 'bg-slate-100 hover:bg-slate-200 dark:bg-[#1C2430] dark:hover:bg-[#253040] text-slate-900 dark:text-[#EDEBE8] shadow-[0_3.5px_0_0_#CBD5E1] dark:shadow-[0_3.5px_0_0_#0D1318] active:shadow-none active:translate-y-[3.5px] border border-slate-300 dark:border-[rgba(255,255,255,0.08)] font-bold',
      lg: 'bg-slate-100 hover:bg-slate-200 dark:bg-[#1C2430] dark:hover:bg-[#253040] text-slate-900 dark:text-[#EDEBE8] shadow-[0_4.5px_0_0_#CBD5E1] dark:shadow-[0_4.5px_0_0_#0D1318] active:shadow-none active:translate-y-[4.5px] border border-slate-300 dark:border-[rgba(255,255,255,0.08)] font-bold',
      xl: 'bg-slate-100 hover:bg-slate-200 dark:bg-[#1C2430] dark:hover:bg-[#253040] text-slate-900 dark:text-[#EDEBE8] shadow-[0_5.5px_0_0_#CBD5E1] dark:shadow-[0_5.5px_0_0_#0D1318] active:shadow-none active:translate-y-[5.5px] border border-slate-300 dark:border-[rgba(255,255,255,0.08)] font-bold',
    },
    surface: {
      sm: 'bg-white hover:bg-slate-50 dark:bg-[#1C2430] dark:hover:bg-[#253040] text-slate-900 dark:text-[#EDEBE8] shadow-[0_2.5px_0_0_#CBD5E1] dark:shadow-[0_2.5px_0_0_#0D1318] active:shadow-none active:translate-y-[2.5px] border border-slate-200 dark:border-[rgba(255,255,255,0.08)] font-semibold',
      md: 'bg-white hover:bg-slate-50 dark:bg-[#1C2430] dark:hover:bg-[#253040] text-slate-900 dark:text-[#EDEBE8] shadow-[0_3.5px_0_0_#CBD5E1] dark:shadow-[0_3.5px_0_0_#0D1318] active:shadow-none active:translate-y-[3.5px] border border-slate-200 dark:border-[rgba(255,255,255,0.08)] font-semibold',
      lg: 'bg-white hover:bg-slate-50 dark:bg-[#1C2430] dark:hover:bg-[#253040] text-slate-900 dark:text-[#EDEBE8] shadow-[0_4.5px_0_0_#CBD5E1] dark:shadow-[0_4.5px_0_0_#0D1318] active:shadow-none active:translate-y-[4.5px] border border-slate-200 dark:border-[rgba(255,255,255,0.08)] font-semibold',
      xl: 'bg-white hover:bg-slate-50 dark:bg-[#1C2430] dark:hover:bg-[#253040] text-slate-900 dark:text-[#EDEBE8] shadow-[0_5.5px_0_0_#CBD5E1] dark:shadow-[0_5.5px_0_0_#0D1318] active:shadow-none active:translate-y-[5.5px] border border-slate-200 dark:border-[rgba(255,255,255,0.08)] font-semibold',
    },
    accent: {
      sm: 'bg-[#E98278] hover:bg-[#D97167] text-white shadow-[0_2.5px_0_0_#B8574E] active:shadow-none active:translate-y-[2.5px] border-t border-white/25 font-bold',
      md: 'bg-[#E98278] hover:bg-[#D97167] text-white shadow-[0_4px_0_0_#B8574E] active:shadow-none active:translate-y-[4px] border-t border-white/25 font-bold',
      lg: 'bg-[#E98278] hover:bg-[#D97167] text-white shadow-[0_5px_0_0_#B8574E] active:shadow-none active:translate-y-[5px] border-t-2 border-white/25 font-bold',
      xl: 'bg-[#E98278] hover:bg-[#D97167] text-white shadow-[0_6px_0_0_#B8574E] active:shadow-none active:translate-y-[6px] border-t-2 border-white/25 font-bold',
    },
    warning: {
      sm: 'bg-[#E5A83B] hover:bg-[#D6962A] text-white shadow-[0_2.5px_0_0_#A86E12] active:shadow-none active:translate-y-[2.5px] border-t border-white/25 font-bold',
      md: 'bg-[#E5A83B] hover:bg-[#D6962A] text-white shadow-[0_4px_0_0_#A86E12] active:shadow-none active:translate-y-[4px] border-t border-white/25 font-bold',
      lg: 'bg-[#E5A83B] hover:bg-[#D6962A] text-white shadow-[0_5px_0_0_#A86E12] active:shadow-none active:translate-y-[5px] border-t-2 border-white/25 font-bold',
      xl: 'bg-[#E5A83B] hover:bg-[#D6962A] text-white shadow-[0_6px_0_0_#A86E12] active:shadow-none active:translate-y-[6px] border-t-2 border-white/25 font-bold',
    },
    danger: {
      sm: 'bg-[#E5484D] hover:bg-[#D4373C] text-white shadow-[0_2.5px_0_0_#9E2024] active:shadow-none active:translate-y-[2.5px] border-t border-white/25 font-bold',
      md: 'bg-[#E5484D] hover:bg-[#D4373C] text-white shadow-[0_4px_0_0_#9E2024] active:shadow-none active:translate-y-[4px] border-t border-white/25 font-bold',
      lg: 'bg-[#E5484D] hover:bg-[#D4373C] text-white shadow-[0_5px_0_0_#9E2024] active:shadow-none active:translate-y-[5px] border-t-2 border-white/25 font-bold',
      xl: 'bg-[#E5484D] hover:bg-[#D4373C] text-white shadow-[0_6px_0_0_#9E2024] active:shadow-none active:translate-y-[6px] border-t-2 border-white/25 font-bold',
    },
    ghost: {
      sm: 'bg-transparent hover:bg-slate-100 dark:hover:bg-[#1C2430] text-slate-800 dark:text-[#EDEBE8] shadow-none active:translate-y-0.5 border border-transparent font-medium',
      md: 'bg-transparent hover:bg-slate-100 dark:hover:bg-[#1C2430] text-slate-800 dark:text-[#EDEBE8] shadow-none active:translate-y-0.5 border border-transparent font-medium',
      lg: 'bg-transparent hover:bg-slate-100 dark:hover:bg-[#1C2430] text-slate-800 dark:text-[#EDEBE8] shadow-none active:translate-y-0.5 border border-transparent font-medium',
      xl: 'bg-transparent hover:bg-slate-100 dark:hover:bg-[#1C2430] text-slate-800 dark:text-[#EDEBE8] shadow-none active:translate-y-0.5 border border-transparent font-medium',
    },
  };

  const styleClasses = variantDepthStyles[variant]?.[size] || variantDepthStyles.primary[size];
  const depressDistance = variant === 'ghost' ? 1 : size === 'sm' ? 2.5 : size === 'lg' ? 5 : size === 'xl' ? 6 : 4;

  return (
    <motion.button
      whileHover={shouldReduceMotion || disabled ? undefined : { scale: 1.01 }}
      whileTap={shouldReduceMotion || disabled ? undefined : { y: depressDistance }}
      transition={{ type: 'spring', stiffness: 500, damping: 28 }}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`relative inline-flex items-center justify-center font-bold tracking-tight select-none transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-[#2155E6] disabled:opacity-50 disabled:pointer-events-none ${sizeStyles} ${styleClasses} ${
        fullWidth ? 'w-full' : ''
      } ${className}`}
      {...(props as any)}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4 text-current" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>Loading...</span>
        </span>
      ) : (
        <span className="flex items-center justify-center gap-2">
          {leftIcon && <span className="shrink-0">{leftIcon}</span>}
          <span>{children}</span>
          {rightIcon && <span className="shrink-0">{rightIcon}</span>}
        </span>
      )}
    </motion.button>
  );
};

// ============================================================================
// 2. 21ST.DEV × GODLY.DESIGN ANIMATED SLIDING TABS
// ============================================================================

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
}

export interface SlidingTabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  variant?: 'pill' | 'subtle';
  className?: string;
}

export const SlidingTabs: React.FC<SlidingTabsProps> = ({
  tabs,
  activeTab,
  onChange,
  variant = 'pill',
  className = '',
}) => {
  return (
    <div
      role="tablist"
      className={`inline-flex items-center p-1.5 rounded-2xl bg-slate-100 dark:bg-[#131920] border border-slate-200 dark:border-[rgba(255,255,255,0.08)] max-w-full overflow-x-auto no-scrollbar ${className}`}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold tracking-tight transition-colors z-10 shrink-0 select-none ${
              isActive
                ? 'text-slate-900 dark:text-[#EDEBE8]'
                : 'text-slate-500 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-[#EDEBE8]'
            }`}
          >
            {isActive && (
              <motion.div
                layoutId={`active-tab-${variant}`}
                transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                className="absolute inset-0 bg-white dark:bg-[#1C2430] rounded-xl shadow-xs dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)] border border-slate-200 dark:border-[rgba(255,255,255,0.12)] -z-10"
              />
            )}
            {tab.icon && <span className="w-4 h-4 shrink-0">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold ${
                  isActive
                    ? 'bg-[#5B5CE2]/15 text-[#5B5CE2] dark:text-[#A5A6F6]'
                    : 'bg-slate-200 dark:bg-[#222E3A] text-slate-600 dark:text-[#94A3B8]'
                }`}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

// ============================================================================
// 3. REACTBITS.DEV - DECRYPTED TEXT, SHINY TEXT & ANIMATED NUMBER (COUNTUP)
// ============================================================================

export interface DecryptedTextProps {
  text: string;
  speed?: number;
  maxIterations?: number;
  characters?: string;
  className?: string;
  animateOn?: 'hover' | 'view' | 'both';
  revealDirection?: 'start' | 'end' | 'center';
}

export const DecryptedText: React.FC<DecryptedTextProps> = ({
  text,
  speed = 32,
  maxIterations = 8,
  characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789//<>[]',
  className = '',
  animateOn = 'both',
  revealDirection = 'start',
}) => {
  const shouldReduceMotion = useReducedMotion();
  const [displayText, setDisplayText] = useState(text);
  const [isScrambling, setIsScrambling] = useState(false);

  const triggerScramble = () => {
    if (shouldReduceMotion || isScrambling) return;
    setIsScrambling(true);
    let iteration = 0;
    const interval = setInterval(() => {
      setDisplayText(
        text
          .split('')
          .map((char, idx) => {
            if (char === ' ') return ' ';
            if (idx < Math.floor((iteration / maxIterations) * text.length)) {
              return text[idx];
            }
            return characters[Math.floor(Math.random() * characters.length)];
          })
          .join('')
      );
      iteration += 1;
      if (iteration > maxIterations) {
        clearInterval(interval);
        setDisplayText(text);
        setIsScrambling(false);
      }
    }, speed);
  };

  useEffect(() => {
    setDisplayText(text);
  }, [text]);

  return (
    <span
      onMouseEnter={animateOn === 'hover' || animateOn === 'both' ? triggerScramble : undefined}
      className={`inline-block cursor-default ${className}`}
    >
      {displayText}
    </span>
  );
};

export interface ShinyTextProps {
  children: React.ReactNode;
  className?: string;
  speedSec?: number;
}

export const ShinyText: React.FC<ShinyTextProps> = ({ children, className = '', speedSec = 4 }) => {
  return (
    <span
      className={`inline-block bg-[linear-gradient(110deg,#0F172A,45%,#4F46E5,55%,#0F172A)] dark:bg-[linear-gradient(110deg,#EDEBE8,45%,#A5A6F6,55%,#EDEBE8)] bg-[length:250%_100%] bg-clip-text text-transparent animate-shimmer ${className}`}
      style={{ animationDuration: `${speedSec}s` }}
    >
      {children}
    </span>
  );
};

export const AnimatedNumber: React.FC<{ value: number; className?: string }> = ({ value, className = '' }) => {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    let start = displayValue;
    const end = value;
    if (start === end) return;

    const duration = 400;
    const startTime = performance.now();

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = Math.round(start + (end - start) * ease);
      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  }, [value]);

  return <span className={`font-mono tabular-nums ${className}`}>{displayValue.toLocaleString()}</span>;
};

// ============================================================================
// 4. UI.ACETERNITY.COM - SPOTLIGHT CARD & VALORANT TACTICAL HUD FRAME
// ============================================================================

export interface BorderBeamProps {
  size?: number;
  duration?: number;
  delay?: number;
  colorFrom?: string;
  colorTo?: string;
  className?: string;
  style?: React.CSSProperties;
  reverse?: boolean;
  initialOffset?: number;
  borderWidth?: number;
}

export const BorderBeam: React.FC<BorderBeamProps> = ({
  className = '',
  size = 200,
  delay = 0,
  duration = 12,
  colorFrom = '#2155E6', // Dribbble Electric Cobalt
  colorTo = '#FFE600',   // Dribbble Electric Yellow
  reverse = false,
  initialOffset = 0,
  borderWidth = 1.5,
  style,
}) => {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return (
      <div
        className={`pointer-events-none absolute inset-0 rounded-[inherit] border border-[#2155E6]/30 ${className}`}
        style={style}
      />
    );
  }

  return (
    <div
      style={
        {
          '--border-beam-width': `${borderWidth}px`,
          ...style,
        } as React.CSSProperties
      }
      className={`pointer-events-none absolute inset-0 rounded-[inherit] border-[length:var(--border-beam-width)] border-transparent [mask-clip:padding-box,border-box] [mask-composite:intersect] [-webkit-mask-composite:source-out] [mask-image:linear-gradient(transparent,transparent),linear-gradient(#000,#000)] ${className}`}
    >
      <motion.div
        className="absolute aspect-square pointer-events-none"
        style={{
          width: size,
          offsetPath: `rect(0 auto auto 0 round calc(var(--border-beam-width) * 4))`,
          background: `linear-gradient(to left, ${colorFrom}, ${colorTo}, transparent)`,
        }}
        initial={{ offsetDistance: `${initialOffset}%` }}
        animate={{
          offsetDistance: reverse
            ? [`${100 - initialOffset}%`, `${-initialOffset}%`]
            : [`${initialOffset}%`, `${100 + initialOffset}%`],
        }}
        transition={{
          repeat: Infinity,
          ease: 'linear',
          duration,
          delay: -delay,
        }}
      />
    </div>
  );
};

export interface SpotlightCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  spotlightColor?: string;
  showBorderBeam?: boolean;
  borderBeamProps?: BorderBeamProps;
}

export const SpotlightCard: React.FC<SpotlightCardProps> = ({
  children,
  className = '',
  spotlightColor = 'rgba(33, 85, 230, 0.08)',
  showBorderBeam = false,
  borderBeamProps,
  onMouseMove,
  onMouseEnter,
  onMouseLeave,
  ...props
}) => {
  const divRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (onMouseMove) onMouseMove(e);
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={(e) => {
        setOpacity(1);
        if (onMouseEnter) onMouseEnter(e);
      }}
      onMouseLeave={(e) => {
        setOpacity(0);
        if (onMouseLeave) onMouseLeave(e);
      }}
      className={`relative overflow-hidden rounded-[24px] bg-white dark:bg-[#070B16]/90 backdrop-blur-md border border-slate-200/80 dark:border-white/10 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_24px_-4px_rgba(0,0,0,0.5)] text-slate-900 dark:text-slate-100 ${className}`}
      {...props}
    >
      <div
        className="pointer-events-none absolute -inset-px transition-opacity duration-300"
        style={{
          opacity,
          background: `radial-gradient(400px circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 70%)`,
        }}
        aria-hidden="true"
      />
      {showBorderBeam && (
        <BorderBeam
          size={borderBeamProps?.size ?? 250}
          duration={borderBeamProps?.duration ?? 10}
          colorFrom={borderBeamProps?.colorFrom ?? '#2155E6'}
          colorTo={borderBeamProps?.colorTo ?? '#FFE600'}
          borderWidth={borderBeamProps?.borderWidth ?? 2}
          {...borderBeamProps}
        />
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
};

export interface TacticalHudFrameProps {
  children: React.ReactNode;
  calloutCode?: string;
  agentName?: string;
  biomeLabel?: string;
  statusText?: string;
  accentVariant?: 'crimson' | 'indigo' | 'emerald' | 'gold' | 'amber' | 'purple';
  accentColor?: 'crimson' | 'indigo' | 'emerald' | 'gold' | 'amber' | 'purple' | string;
  className?: string;
}

export const TacticalHudFrame: React.FC<TacticalHudFrameProps> = ({
  children,
  calloutCode,
  agentName,
  biomeLabel,
  statusText,
  accentVariant,
  accentColor,
  className = '',
}) => {
  const effectiveCode = agentName || calloutCode || 'CEFR // TACTICAL HUD';
  const effectiveLabel = statusText || biomeLabel;
  const rawVariant = (accentColor || accentVariant || 'indigo') as string;
  const variantKey = rawVariant === 'amber' ? 'gold' : rawVariant;

  const cornerColor: Record<string, string> = {
    crimson: 'border-[#FF4655]',
    indigo: 'border-[#2155E6] dark:border-[#2155E6]',
    emerald: 'border-[#10B981]',
    gold: 'border-[#F59E0B]',
    purple: 'border-[#8B5CF6]',
  };

  const badgeStyle: Record<string, string> = {
    crimson: 'bg-[#FF4655]/10 text-[#E11D48] dark:text-[#FF4655] border-[#FF4655]/30',
    indigo: 'bg-[#4F46E5]/10 text-[#4F46E5] dark:text-[#A5A6F6] border-[#4F46E5]/30',
    emerald: 'bg-[#10B981]/10 text-[#059669] dark:text-[#34D399] border-[#10B981]/30',
    gold: 'bg-[#F59E0B]/10 text-[#D97706] dark:text-[#FBBF24] border-[#F59E0B]/30',
    purple: 'bg-[#8B5CF6]/10 text-[#7C3AED] dark:text-[#C4B5FD] border-[#8B5CF6]/30',
  };

  const activeCorner = cornerColor[variantKey] || cornerColor.indigo;
  const activeBadge = badgeStyle[variantKey] || badgeStyle.indigo;

  return (
    <div
      className={`relative rounded-2xl bg-white dark:bg-[#141A22] border border-slate-200/90 dark:border-[rgba(255,255,255,0.08)] p-5 shadow-xs text-slate-900 dark:text-[#EDEBE8] ${className}`}
    >
      {/* Valorant Angular Corner Brackets */}
      <span className={`pointer-events-none absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 rounded-tl-md ${activeCorner}`} />
      <span className={`pointer-events-none absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 rounded-tr-md ${activeCorner}`} />
      <span className={`pointer-events-none absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 rounded-bl-md ${activeCorner}`} />
      <span className={`pointer-events-none absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 rounded-br-md ${activeCorner}`} />

      {(effectiveCode || effectiveLabel) && (
        <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-100 dark:border-[rgba(255,255,255,0.06)]">
          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-black uppercase tracking-wider border ${activeBadge}`}>
            {effectiveCode}
          </span>
          {effectiveLabel && (
            <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-[#94A3B8]">
              {effectiveLabel}
            </span>
          )}
        </div>
      )}
      {children}
    </div>
  );
};

// ============================================================================
// 5. TERRARIA × VALORANT × DUOLINGO - HOTBAR INVENTORY & BIOME BANNER
// ============================================================================

export interface TerrariaHotbarSlotItem {
  slotNumber: number;
  id: string;
  label: string;
  rarity: 'copper' | 'silver' | 'gold' | 'hallowed' | 'crimson' | 'celestial';
  stackCount: string;
  icon: React.ReactNode;
  image?: string;
  isActive?: boolean;
  onSelect: () => void;
}

export const TerrariaHotbarBar: React.FC<{
  items: TerrariaHotbarSlotItem[];
  title?: string;
  subtitle?: string;
  className?: string;
}> = ({ items, title, subtitle, className = '' }) => {
  const rarityStyles: Record<TerrariaHotbarSlotItem['rarity'], { border: string; glow: string; bg: string; dot: string }> = {
    copper: {
      border: 'border-amber-400/80 hover:border-amber-300',
      glow: 'hover:shadow-[0_0_20px_rgba(245,158,11,0.4)]',
      bg: 'bg-gradient-to-b from-amber-500/20 via-[#0F172A] to-black/90',
      dot: 'bg-amber-400 shadow-[0_0_6px_#F59E0B]',
    },
    silver: {
      border: 'border-sky-400/80 hover:border-sky-300',
      glow: 'hover:shadow-[0_0_20px_rgba(56,189,248,0.4)]',
      bg: 'bg-gradient-to-b from-sky-500/20 via-[#0F172A] to-black/90',
      dot: 'bg-sky-400 shadow-[0_0_6px_#38BDF8]',
    },
    gold: {
      border: 'border-yellow-400/90 hover:border-yellow-300',
      glow: 'hover:shadow-[0_0_20px_rgba(255,230,0,0.45)]',
      bg: 'bg-gradient-to-b from-yellow-500/20 via-[#0F172A] to-black/90',
      dot: 'bg-[#FFE600] shadow-[0_0_6px_#FFE600]',
    },
    hallowed: {
      border: 'border-[#2155E6] hover:border-blue-400',
      glow: 'hover:shadow-[0_0_20px_rgba(33,85,230,0.45)]',
      bg: 'bg-gradient-to-b from-[#2155E6]/25 via-[#0F172A] to-black/90',
      dot: 'bg-[#2155E6] shadow-[0_0_6px_#2155E6]',
    },
    crimson: {
      border: 'border-[#FF4655] hover:border-red-400',
      glow: 'hover:shadow-[0_0_20px_rgba(255,70,85,0.5)]',
      bg: 'bg-gradient-to-b from-[#FF4655]/25 via-[#0F172A] to-black/90',
      dot: 'bg-[#FF4655] shadow-[0_0_6px_#FF4655]',
    },
    celestial: {
      border: 'border-emerald-400/80 hover:border-emerald-300',
      glow: 'hover:shadow-[0_0_20px_rgba(16,185,129,0.45)]',
      bg: 'bg-gradient-to-b from-emerald-500/20 via-[#0F172A] to-black/90',
      dot: 'bg-emerald-400 shadow-[0_0_6px_#10B981]',
    },
  };

  return (
    <div
      className={`p-3.5 sm:p-5 rounded-[24px] bg-gradient-to-b from-[#0F172A] via-[#0B1224] to-[#060A14] border border-slate-700/60 shadow-[0_12px_40px_rgba(0,0,0,0.5)] space-y-3.5 text-white ${className}`}
    >
      <div className="flex items-center justify-between gap-2 flex-wrap px-1">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#FFE600] animate-pulse shadow-[0_0_8px_#FFE600]" />
          <span className="text-xs sm:text-sm font-black text-white tracking-wide uppercase font-display">
            {title || 'STUDIO LOADOUT'}
          </span>
        </div>
        <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
          HOTBAR • QUICK SELECT
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {items.map((slot) => {
          const r = rarityStyles[slot.rarity];
          return (
            <motion.button
              key={slot.id}
              type="button"
              whileHover={{ y: -3, scale: 1.03 }}
              whileTap={{ y: 2, scale: 0.97 }}
              onClick={slot.onSelect}
              className={`relative aspect-[4/5] p-3 rounded-2xl border-2 flex flex-col items-center justify-between text-center transition-all cursor-pointer select-none group shadow-[inset_0_1px_1px_rgba(255,255,255,0.15),0_6px_20px_rgba(0,0,0,0.4)] ${r.bg} ${r.border} ${r.glow}`}
            >
              {/* Top rarity indicator pip (NO NUMBERS) */}
              <div className="w-full flex items-center justify-between">
                <span className={`w-2 h-2 rounded-full ${r.dot}`} />
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400 group-hover:text-white transition-colors">
                  {slot.rarity}
                </span>
              </div>

              {/* Large Hero 3D Item graphic */}
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 my-auto flex items-center justify-center">
                {slot.image ? (
                  <img
                    src={slot.image}
                    alt={slot.label}
                    className="w-full h-full object-cover rounded-2xl drop-shadow-[0_8px_16px_rgba(0,0,0,0.8)] group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-300 pointer-events-none border border-white/10"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
                    {slot.icon}
                  </div>
                )}
              </div>

              {/* Clean game title */}
              <span className="text-xs font-black text-white tracking-tight leading-tight line-clamp-1 group-hover:text-[#FFE600] transition-colors drop-shadow-sm w-full">
                {slot.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

// ============================================================================
// 5.1 5-SITES VIBE-CODER ENGINE MATRIX (21st.dev, Godly, Aceternity, Uiverse, ReactBits)
// ============================================================================

export const VIBE_CODER_SOURCES = [
  {
    id: '21st',
    rank: '#1',
    name: '21st.dev',
    url: 'https://21st.dev/',
    roleTh: 'Hero Bento & คลัง Component ระดับโปรดักชัน',
    roleEn: 'Production Hero Bento & Modular Registry',
    fusionTag: 'PRODUCTION BENTO',
    badgeClass: 'bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-[#2155E6]/20 dark:text-[#6893FF] dark:border-[#2155E6]/40',
  },
  {
    id: 'godly',
    rank: '#2',
    name: 'Godly.design (Melius)',
    url: 'https://godly.design/website/melius/',
    roleTh: 'โครงสร้าง Asymmetric 2-Column & Motion Pacing',
    roleEn: 'Editorial Asymmetric Framing & Pacing',
    fusionTag: 'EDITORIAL ASYMMETRIC HUD',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/40',
  },
  {
    id: 'aceternity',
    rank: '#3',
    name: 'Aceternity UI',
    url: 'https://ui.aceternity.com/',
    roleTh: 'Spotlight Card, 3D Tilt & Tactical Border Beam',
    roleEn: 'Spotlight Card, 3D Tilt & Tactical Border Beam',
    fusionTag: 'TACTICAL AMBIENT GLOW',
    badgeClass: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-[#FF4655]/20 dark:text-[#FF4655] dark:border-[#FF4655]/40',
  },
  {
    id: 'uiverse',
    rank: '#4',
    name: 'Uiverse.io',
    url: 'https://uiverse.io/',
    roleTh: 'ปุ่มกด 3D Tactile & ช่องเลือกโมดูลเรียนรู้ Hotbar',
    roleEn: 'Tactile 3D Push Buttons & Modular Hotbar Slots',
    fusionTag: 'TACTILE 3D HUD',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/40',
  },
  {
    id: 'reactbits',
    rank: '#5',
    name: 'React Bits',
    url: 'https://reactbits.dev/',
    roleTh: 'Decrypted Text, Shiny Text & ตัวเลขวิ่ง CountUp',
    roleEn: 'Decrypted Cipher Text, ShinyText & CountUp',
    fusionTag: 'CIPHER TEXT REVEAL',
    badgeClass: 'bg-sky-100 text-sky-800 border-sky-300 dark:bg-sky-500/20 dark:text-sky-300 dark:border-sky-500/40',
  },
] as const;

export const VibeCoderSourceDock: React.FC<{ isEn?: boolean; className?: string }> = ({
  isEn = false,
  className = '',
}) => {
  return (
    <div
      className={`p-5 rounded-[24px] bg-gradient-to-r from-indigo-50/80 via-white to-rose-50/70 dark:from-[#0B1224] dark:via-[#0B1224] dark:to-[#101A30] border border-slate-200/90 dark:border-[rgba(255,255,255,0.08)] shadow-xs space-y-4 text-slate-900 dark:text-[#EDEBE8] ${className}`}
    >
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-[#2155E6] text-white">
            COMPONENT ARCHITECTURE // 5 SITES
          </span>
          <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-[#EDEBE8]">
            {isEn
              ? 'Engineered with 5 Premier Frontend Component Registries'
              : 'สถาปัตยกรรม UI คุณภาพสูงจากคลังคอมโพเนนต์ชั้นนำทั้ง 5 แหล่ง'}
          </h3>
        </div>
        <span className="text-[11px] font-mono font-bold text-[#4F46E5] dark:text-[#A5A6F6]">
          MIT / Open-Source Registry Active
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
        {VIBE_CODER_SOURCES.map((site) => (
          <div
            key={site.id}
            className="p-3 rounded-2xl bg-white dark:bg-[#1C2430] border border-slate-200/90 dark:border-[rgba(255,255,255,0.08)] flex flex-col justify-between gap-2 shadow-2xs"
          >
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-1">
                <span className="text-[10px] font-mono font-black text-slate-500 dark:text-[#94A3B8]">
                  {site.rank} {site.name}
                </span>
                <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-black border ${site.badgeClass}`}>
                  {site.fusionTag}
                </span>
              </div>
              <p className="text-xs font-bold text-slate-900 dark:text-[#EDEBE8] leading-snug">
                {isEn ? site.roleEn : site.roleTh}
              </p>
            </div>
            <div className="text-[10px] font-mono text-slate-500 dark:text-[#94A3B8] truncate">
              {site.url.replace('https://', '')}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// 5.2 GLOVA SIGNATURE LEARNING MODULE CARTRIDGE (TERRARIA × VALORANT × DUOLINGO)
// ============================================================================

export interface GlovaCartridgeProps {
  id: string;
  level: string; // A1, A2, B1, B2, C1, C2
  skill: 'vocabulary' | 'grammar' | 'reading' | 'listening' | 'speaking' | 'writing' | 'ranked';
  title: string;
  subtitle?: string;
  image?: string;
  status: 'ready' | 'in-progress' | 'completed' | 'locked';
  progress?: number; // 0 to 100
  lessonsCount?: number;
  completedCount?: number;
  xpReward?: number;
  estimatedMinutes?: number;
  onLaunch?: () => void;
  className?: string;
}

export const GlovaCartridge: React.FC<GlovaCartridgeProps> = ({
  id,
  level,
  skill,
  title,
  subtitle,
  image,
  status,
  progress = 0,
  lessonsCount = 5,
  completedCount = 0,
  xpReward = 15,
  estimatedMinutes = 5,
  onLaunch,
  className = '',
}) => {
  const shouldReduceMotion = useReducedMotion();

  const skillColorMap = {
    vocabulary: 'text-[#4F46E5] dark:text-[#818CF8] bg-[#4F46E5]/10 border-[#4F46E5]/25',
    grammar: 'text-[#D97706] dark:text-[#FBBF24] bg-[#F59E0B]/10 border-[#F59E0B]/25',
    reading: 'text-[#059669] dark:text-[#34D399] bg-[#10B981]/10 border-[#10B981]/25',
    listening: 'text-[#2563EB] dark:text-[#60A5FA] bg-[#3B82F6]/10 border-[#3B82F6]/25',
    speaking: 'text-[#E11D48] dark:text-[#FB7185] bg-[#F43F5E]/10 border-[#F43F5E]/25',
    writing: 'text-[#7C3AED] dark:text-[#A78BFA] bg-[#8B5CF6]/10 border-[#8B5CF6]/25',
    ranked: 'text-white bg-[#FF4655] border-[#D93746] font-black',
  }[skill];

  const biomeTagMap: Record<string, string> = {
    A1: 'Forest Biome // Iron',
    A2: 'Cavern Biome // Bronze',
    B1: 'Jungle Temple // Silver',
    B2: 'Dungeon Keep // Gold',
    C1: 'Hallowed Spire // Diamond',
    C2: 'Celestial Nebula // Radiant',
  };

  return (
    <motion.div
      whileHover={shouldReduceMotion || status === 'locked' ? undefined : { y: -3, scale: 1.01 }}
      className={`relative p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#101A30] border transition-all duration-200 group flex flex-col justify-between ${
        status === 'ready'
          ? 'border-[#2155E6] shadow-[0_8px_24px_-4px_rgba(33,85,230,0.15)] ring-1 ring-[#2155E6]/30'
          : status === 'completed'
          ? 'border-[#10B981] shadow-[0_4px_16px_-4px_rgba(16,185,129,0.15)]'
          : status === 'in-progress'
          ? 'border-[#2155E6]/40 shadow-[0_4px_16px_-4px_rgba(33,85,230,0.08)]'
          : 'border-slate-200 dark:border-[rgba(255,255,255,0.08)] opacity-60'
      } ${className}`}
    >
      <div>
        {image ? (
          <div className="relative w-full h-32 sm:h-36 rounded-xl overflow-hidden mb-3.5 border border-slate-200/80 dark:border-white/10 bg-slate-100 dark:bg-slate-900">
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
            <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap">
              <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-black bg-black/60 text-white backdrop-blur-md border border-white/20">
                {level}
              </span>
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase backdrop-blur-md ${skillColorMap}`}>
                {skill}
              </span>
            </div>
            <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-[#FFE600] text-slate-950 shadow-sm">
              +{xpReward} XP
            </div>
          </div>
        ) : (
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-black bg-slate-100 dark:bg-[#15203B] text-slate-900 dark:text-[#EDEBE8] border border-slate-200 dark:border-[rgba(255,255,255,0.08)]">
                {level}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border uppercase tracking-wider ${skillColorMap}`}>
                {skill}
              </span>
              <span className="hidden sm:inline-block text-[10px] font-mono font-bold text-slate-500 dark:text-[#94A3B8]">
                {biomeTagMap[level] || 'Forest Biome'}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-[#94A3B8] shrink-0">
              <Clock className="w-3.5 h-3.5 text-[#FFE600]" />
              <span>{estimatedMinutes}m</span>
              <span className="text-slate-900 dark:text-[#EDEBE8] font-bold">+{xpReward} XP</span>
            </div>
          </div>
        )}

        <div className="space-y-1">
          <h4 className="text-base font-black text-slate-900 dark:text-[#EDEBE8] tracking-tight leading-snug">
            {title}
          </h4>
          {subtitle && (
            <p className="text-xs text-slate-600 dark:text-[#94A3B8] leading-relaxed line-clamp-1">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {status !== 'locked' && (
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-[rgba(255,255,255,0.08)] flex items-center justify-between gap-3">
          <div className="flex-1 space-y-1">
            <div className="flex justify-between text-[11px] font-semibold text-slate-500 dark:text-[#94A3B8]">
              <span>{status === 'completed' ? 'Completed' : `${completedCount}/${lessonsCount} Lessons`}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-[#131920] overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  status === 'completed' ? 'bg-[#10B981]' : skill === 'ranked' ? 'bg-[#FF4655]' : 'bg-[#2155E6]'
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="shrink-0">
            <TactileButton
              variant={
                status === 'completed'
                  ? 'duolingo'
                  : skill === 'ranked'
                  ? 'valorant'
                  : status === 'ready'
                  ? 'primary'
                  : 'surface'
              }
              size="sm"
              onClick={onLaunch}
              className="text-xs font-bold"
            >
              {status === 'completed' ? 'Review' : status === 'ready' ? 'Start' : 'Continue'}
            </TactileButton>
          </div>
        </div>
      )}

      {status === 'locked' && (
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-[rgba(255,255,255,0.08)] flex items-center justify-between text-xs text-slate-500 dark:text-[#94A3B8] font-semibold">
          <span className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5" /> Complete prior module
          </span>
          <span className="text-[11px]">Locked</span>
        </div>
      )}
    </motion.div>
  );
};

// ============================================================================
// 5.3 GLOVA SIGNATURE "NEXT MOVE" ACTION HERO
// ============================================================================

export interface GlovaNextMoveProps {
  title: string;
  description: string;
  categoryBadge: string;
  estimatedMinutes: number;
  xpReward: number;
  primaryActionLabel: string;
  secondaryActionLabel?: string;
  onPrimaryAction: () => void;
  onSecondaryAction?: () => void;
  className?: string;
}

export const GlovaNextMove: React.FC<GlovaNextMoveProps> = ({
  title,
  description,
  categoryBadge,
  estimatedMinutes,
  xpReward,
  primaryActionLabel,
  secondaryActionLabel,
  onPrimaryAction,
  onSecondaryAction,
  className = '',
}) => {
  return (
    <div
      className={`relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0B1224] border-2 border-[#2155E6]/30 shadow-[0_12px_36px_-6px_rgba(33,85,230,0.1)] space-y-5 ${className}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2155E6]/10 text-[#2155E6] dark:bg-[#2155E6]/20 dark:text-[#6893FF] text-xs font-bold tracking-wide border border-[#2155E6]/30">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{categoryBadge}</span>
        </span>
        <div className="flex items-center gap-3 text-xs font-semibold text-slate-500 dark:text-[#94A3B8]">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-[#FFE600]" />
            <span>{estimatedMinutes} min</span>
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-[#FFE600] text-[#0B1224] font-bold text-xs">
            +{xpReward} XP
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-[#EDEBE8] tracking-tight leading-snug">
          {title}
        </h2>
        <p className="text-sm text-slate-600 dark:text-[#94A3B8] leading-relaxed max-w-2xl font-grotesk">
          {description}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3 pt-1">
        <TactileButton
          variant="primary"
          size="lg"
          onClick={onPrimaryAction}
          className="px-7 text-sm sm:text-base font-bold tracking-wide"
          rightIcon={<ArrowRight className="w-4 h-4 ml-1" />}
        >
          {primaryActionLabel}
        </TactileButton>

        {secondaryActionLabel && onSecondaryAction && (
          <TactileButton
            variant="surface"
            size="lg"
            onClick={onSecondaryAction}
            className="px-5 text-sm font-semibold"
          >
            {secondaryActionLabel}
          </TactileButton>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// 5.4 PROGRESSIVE LEARNING PATH NODE (DUOLINGO × TERRARIA STEPPING STONES)
// ============================================================================

export interface LearningPathNodeProps {
  level: string;
  unitTitle: string;
  topicTitle: string;
  status: 'completed' | 'active' | 'review' | 'locked';
  xpReward?: number;
  lessonCount?: number;
  offsetPercent?: number;
  onClick?: () => void;
  ctaText?: string;
}

export const LearningPathNode: React.FC<LearningPathNodeProps> = ({
  level,
  unitTitle,
  topicTitle,
  status,
  xpReward = 15,
  lessonCount = 5,
  offsetPercent = 0,
  onClick,
  ctaText = 'START',
}) => {
  const shouldReduceMotion = useReducedMotion();
  const [isHovered, setIsHovered] = useState(false);

  const config = {
    completed: {
      bg: 'bg-[#10B981] hover:bg-[#059669] shadow-[#047857]',
      ring: 'ring-[#10B981]/30',
      icon: <Check className="w-8 h-8 text-white stroke-[3]" />,
      badgeBg: 'bg-[#10B981] text-white',
    },
    active: {
      bg: 'bg-[#2155E6] hover:bg-[#1C4AC9] shadow-[#143DB8]',
      ring: 'ring-[#2155E6]/35',
      icon: <Star className="w-8 h-8 text-white fill-white stroke-[1.5]" />,
      badgeBg: 'bg-[#2155E6] text-white',
    },
    review: {
      bg: 'bg-[#FF4655] hover:bg-[#E63946] shadow-[#9E1B26]',
      ring: 'ring-[#FF4655]/30',
      icon: <Zap className="w-8 h-8 text-white fill-current" />,
      badgeBg: 'bg-[#FF4655] text-white',
    },
    locked: {
      bg: 'bg-slate-200 dark:bg-[#222E3A] shadow-[#CBD5E1] dark:shadow-[#131920]',
      ring: 'ring-transparent',
      icon: <Lock className="w-6 h-6 text-slate-500 dark:text-[#94A3B8]" />,
      badgeBg: 'bg-slate-200 dark:bg-[#222E3A] text-slate-600 dark:text-[#94A3B8]',
    },
  }[status];

  return (
    <div
      className="relative flex flex-col items-center my-6"
      style={{ transform: `translateX(${offsetPercent}%)` }}
    >
      {status === 'active' && !shouldReduceMotion && (
        <motion.div
          animate={{ scale: [1, 1.25, 1], opacity: [0.6, 0, 0.6] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute w-24 h-24 rounded-full bg-[#2155E6]/20 -top-2"
          aria-hidden="true"
        />
      )}

      {status === 'active' && (
        <motion.div
          initial={{ y: 5, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-2 z-20"
        >
          <div className="relative px-3.5 py-1.5 rounded-full bg-[#2155E6] text-white text-xs font-black tracking-wider uppercase shadow-md flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-white" />
            <span>{ctaText}</span>
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#2155E6] rotate-45" />
          </div>
        </motion.div>
      )}

      <motion.button
        type="button"
        disabled={status === 'locked'}
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        whileHover={shouldReduceMotion || status === 'locked' ? undefined : { scale: 1.06 }}
        whileTap={shouldReduceMotion || status === 'locked' ? undefined : { y: 4 }}
        className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center shadow-[0_6px_0] active:shadow-none border-t border-white/30 transition-all select-none focus:outline-none focus-visible:ring-4 ${config.bg} ${config.ring} ${
          status === 'locked' ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'
        }`}
        aria-label={`${topicTitle} - ${status}`}
      >
        {config.icon}

        <span className="absolute -bottom-2 px-2 py-0.5 rounded-full text-[10px] font-mono font-black shadow-xs border border-slate-200 dark:border-[rgba(255,255,255,0.08)] bg-white dark:bg-[#1C2430] text-slate-900 dark:text-[#EDEBE8]">
          {level}
        </span>
      </motion.button>

      <div className="mt-3 text-center max-w-[160px]">
        <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-[#EDEBE8] leading-tight line-clamp-2">
          {topicTitle}
        </h4>
        <span className="text-[11px] text-[#4F46E5] dark:text-[#A5A6F6] font-semibold">
          +{xpReward} XP
        </span>
      </div>
    </div>
  );
};

// ============================================================================
// 6. DUOLINGO × VALORANT SIGNATURE LESSON FEEDBACK DRAWER
// ============================================================================

export interface LessonFeedbackDrawerProps {
  isOpen: boolean;
  isCorrect: boolean;
  explanation?: string;
  correctAnswerText?: string;
  xpEarned?: number;
  streakBonus?: boolean;
  onContinue: () => void;
  ctaText?: string;
}

export const LessonFeedbackDrawer: React.FC<LessonFeedbackDrawerProps> = ({
  isOpen,
  isCorrect,
  explanation,
  correctAnswerText,
  xpEarned = 15,
  streakBonus = false,
  onContinue,
  ctaText = 'CONTINUE',
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', stiffness: 400, damping: 35 }}
          className={`fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6 border-t-2 shadow-2xl backdrop-blur-md ${
            isCorrect
              ? 'bg-white/98 dark:bg-[#1A232C]/98 border-[#10B981] text-slate-900 dark:text-[#EDEBE8] shadow-[0_-8px_32px_rgba(15,23,42,0.12)]'
              : 'bg-white/98 dark:bg-[#1A232C]/98 border-[#FF4655] text-slate-900 dark:text-[#EDEBE8] shadow-[0_-8px_32px_rgba(15,23,42,0.12)]'
          }`}
        >
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                  isCorrect ? 'bg-[#10B981] text-white' : 'bg-[#FF4655] text-white'
                }`}
              >
                {isCorrect ? <Check className="w-7 h-7 stroke-[3]" /> : <AlertCircle className="w-7 h-7 stroke-[3]" />}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg sm:text-xl font-black tracking-tight text-slate-900 dark:text-[#EDEBE8]">
                    {isCorrect ? 'Excellent!' : 'Correct solution:'}
                  </h3>
                  {isCorrect && (
                    <span className="px-2.5 py-0.5 rounded-full bg-[#10B981] text-white font-mono font-black text-xs">
                      +{xpEarned} XP
                    </span>
                  )}
                  {streakBonus && (
                    <span className="px-2 py-0.5 rounded-full bg-[#F59E0B] text-white font-black text-xs flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Streak!
                    </span>
                  )}
                </div>

                {!isCorrect && correctAnswerText && (
                  <p className="text-base font-bold text-[#E11D48] dark:text-[#FB7185] leading-snug">
                    {correctAnswerText}
                  </p>
                )}

                {explanation && (
                  <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-[#94A3B8] leading-relaxed max-w-xl">
                    {explanation}
                  </p>
                )}
              </div>
            </div>

            <div className="shrink-0 pt-2 sm:pt-0">
              <TactileButton
                variant={isCorrect ? 'duolingo' : 'valorant'}
                size="lg"
                onClick={onContinue}
                className="w-full sm:w-auto px-8"
                rightIcon={<ArrowRight className="w-5 h-5" />}
              >
                {ctaText}
              </TactileButton>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ============================================================================
// 7. GLOVA PHYSICAL STUDIO TELEMETRY & RUNIC METRICS
// ============================================================================

export interface StudioMetricProps {
  label: string;
  value: string | number;
  delta?: string;
  icon?: React.ReactNode;
  variant?: 'gold' | 'mint' | 'indigo' | 'coral' | 'neutral';
  className?: string;
}

export const StudioMetric: React.FC<StudioMetricProps> = ({
  label,
  value,
  delta,
  icon,
  variant = 'neutral',
  className = '',
}) => {
  const accentColor = {
    gold: 'text-[#D97706] dark:text-[#E5A93C]',
    mint: 'text-[#059669] dark:text-[#10B981]',
    indigo: 'text-[#4F46E5] dark:text-[#818CF8]',
    coral: 'text-[#E11D48] dark:text-[#FF4655]',
    neutral: 'text-slate-900 dark:text-[#EDEBE8]',
  }[variant];

  return (
    <div className={`p-4 rounded-xl bg-white dark:bg-[#141A22] border border-slate-200/90 dark:border-[rgba(255,255,255,0.08)] shadow-xs dark:shadow-inner space-y-1.5 ${className}`}>
      <div className="flex items-center justify-between text-xs font-mono text-slate-500 dark:text-[#94A3B8]">
        <span>{label}</span>
        {icon && <span className="w-4 h-4 shrink-0 text-slate-500 dark:text-[#94A3B8]">{icon}</span>}
      </div>
      <div className="flex items-baseline justify-between">
        <span className={`text-2xl font-black font-mono tracking-tight ${accentColor}`}>
          {value}
        </span>
        {delta && (
          <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-[#1C2430] text-slate-600 dark:text-[#94A3B8] border border-slate-200 dark:border-[rgba(255,255,255,0.06)]">
            {delta}
          </span>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// 8. 21ST.DEV - BENTO GRID & BENTO CARD
// ============================================================================

export interface BentoGridProps {
  children: React.ReactNode;
  className?: string;
  cols?: number;
}

export const BentoGrid: React.FC<BentoGridProps> = ({ children, className = '', cols = 3 }) => {
  const colClass =
    cols === 4
      ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 auto-rows-auto'
      : cols === 2
      ? 'grid-cols-1 md:grid-cols-2 auto-rows-auto'
      : 'grid-cols-1 md:grid-cols-3 auto-rows-[22rem]';

  return (
    <div className={`grid gap-4 w-full ${colClass} ${className}`}>
      {children}
    </div>
  );
};

export interface BentoCardProps {
  name?: string;
  className?: string;
  background?: React.ReactNode;
  icon?: React.ReactNode;
  description?: string;
  href?: string;
  cta?: string;
  onCtaClick?: () => void;
  badge?: string;
  accentVariant?: 'indigo' | 'crimson' | 'emerald' | 'amber';
  children?: React.ReactNode;
  colSpan?: number;
}

export const BentoCard: React.FC<BentoCardProps> = ({
  name,
  className = '',
  background,
  icon,
  description,
  cta = 'Enter Studio',
  onCtaClick,
  badge,
  accentVariant = 'indigo',
  children,
  colSpan = 3,
}) => {
  const accentBorder = {
    indigo: 'hover:border-[#2155E6]/60 hover:shadow-[0_8px_30px_rgba(33,85,230,0.12)]',
    crimson: 'hover:border-[#FF4655]/60 hover:shadow-[0_8px_30px_rgba(255,70,85,0.12)]',
    emerald: 'hover:border-[#10B981]/60 hover:shadow-[0_8px_30px_rgba(16,185,129,0.12)]',
    amber: 'hover:border-[#F59E0B]/60 hover:shadow-[0_8px_30px_rgba(245,158,11,0.12)]',
  }[accentVariant];

  const colSpanClass =
    colSpan === 1
      ? 'col-span-1'
      : colSpan === 2
      ? 'col-span-1 md:col-span-2'
      : 'col-span-1 md:col-span-3';

  if (children && !name) {
    return (
      <div
        className={`relative flex flex-col justify-between overflow-hidden rounded-[22px] bg-white dark:bg-[#141A22] border border-slate-200/90 dark:border-[rgba(255,255,255,0.08)] shadow-xs transition-all duration-300 ${colSpanClass} ${className}`}
      >
        {children}
      </div>
    );
  }

  return (
    <div
      key={name}
      className={`group relative ${colSpanClass} flex flex-col justify-between overflow-hidden rounded-[26px] bg-white dark:bg-[#141A22] border border-slate-200/90 dark:border-[rgba(255,255,255,0.08)] shadow-xs transition-all duration-300 ${accentBorder} ${className}`}
    >
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-40 group-hover:opacity-75 transition-opacity">
        {background}
      </div>

      <div className="pointer-events-none z-10 flex transform-gpu flex-col gap-2 p-6 transition-all duration-300">
        <div className="flex items-center justify-between">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-[#1C2430] border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-800 dark:text-[#EDEBE8] group-hover:scale-110 transition-transform">
            {icon}
          </div>
          {badge && (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-100 dark:bg-[#1C2430] text-slate-600 dark:text-[#94A3B8] border border-slate-200 dark:border-white/10">
              {badge}
            </span>
          )}
        </div>
        <h3 className="text-xl font-black text-slate-900 dark:text-[#EDEBE8] tracking-tight mt-2">
          {name}
        </h3>
        <p className="max-w-lg text-xs sm:text-sm text-slate-600 dark:text-[#94A3B8] leading-relaxed">
          {description}
        </p>
      </div>

      <div className="pointer-events-auto z-10 p-6 pt-0">
        <TactileButton
          variant={accentVariant === 'crimson' ? 'valorant' : 'primary'}
          size="sm"
          onClick={onCtaClick}
          className="text-xs font-bold"
          rightIcon={<ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />}
        >
          {cta}
        </TactileButton>
      </div>
    </div>
  );
};

// ============================================================================
// 9. 21ST.DEV × MAGIC UI - SHIMMER BUTTON (HIGH IMPACT CTA)
// ============================================================================

export interface ShimmerButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  shimmerColor?: string;
  shimmerSize?: string;
  borderRadius?: string;
  shimmerDuration?: string;
  background?: string;
  className?: string;
  children?: React.ReactNode;
}

export const ShimmerButton: React.FC<ShimmerButtonProps> = ({
  shimmerColor = '#ffffff',
  shimmerSize = '0.08em',
  shimmerDuration = '2.5s',
  borderRadius = '18px',
  background = 'rgba(91, 92, 226, 1)',
  className = '',
  children,
  onClick,
  disabled,
  ...props
}) => {
  return (
    <button
      style={
        {
          '--spread': '90deg',
          '--shimmer-color': shimmerColor,
          '--radius': borderRadius,
          '--speed': shimmerDuration,
          '--cut': shimmerSize,
          '--bg': background,
        } as React.CSSProperties
      }
      className={`group relative z-0 flex cursor-pointer items-center justify-center overflow-hidden [border-radius:var(--radius)] border border-white/20 px-6 py-3 whitespace-nowrap text-white [background:var(--bg)] font-black text-sm select-none shadow-[0_4px_16px_rgba(91,92,226,0.3)] transform-gpu transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none ${className}`}
      onClick={onClick}
      disabled={disabled}
      {...(props as any)}
    >
      <div className="absolute inset-0 -z-30 overflow-hidden pointer-events-none">
        <div
          className="absolute -inset-full animate-spin"
          style={{
            animationDuration: shimmerDuration,
            background:
              'conic-gradient(from 270deg, transparent 0, var(--shimmer-color) 45deg, transparent 90deg)',
          }}
        />
      </div>

      <span className="relative z-10 flex items-center justify-center gap-2 font-display">
        {children}
      </span>

      <div className="absolute inset-0 size-full rounded-[inherit] px-4 py-1.5 shadow-[inset_0_-4px_8px_rgba(255,255,255,0.2)] group-hover:shadow-[inset_0_-6px_10px_rgba(255,255,255,0.35)] transition-all pointer-events-none" />
    </button>
  );
};

// ============================================================================
// 10. REACTBITS.DEV - BLUR TEXT REVEAL
// ============================================================================

export interface BlurTextProps {
  text: string;
  delay?: number;
  className?: string;
  animateBy?: 'words' | 'letters';
  direction?: 'top' | 'bottom';
}

export const BlurText: React.FC<BlurTextProps> = ({
  text,
  delay = 50,
  className = '',
  animateBy = 'words',
  direction = 'top',
}) => {
  const shouldReduceMotion = useReducedMotion();
  const elements = animateBy === 'words' ? text.split(' ') : text.split('');

  if (shouldReduceMotion) {
    return <span className={className}>{text}</span>;
  }

  return (
    <span className={`inline-block ${className}`}>
      {elements.map((el, i) => (
        <motion.span
          key={i}
          initial={{
            filter: 'blur(8px)',
            opacity: 0,
            y: direction === 'top' ? -12 : 12,
          }}
          animate={{
            filter: 'blur(0px)',
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.35,
            delay: (i * delay) / 1000,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
          className="inline-block"
        >
          {el}
          {animateBy === 'words' && i < elements.length - 1 && '\u00A0'}
        </motion.span>
      ))}
    </span>
  );
};
