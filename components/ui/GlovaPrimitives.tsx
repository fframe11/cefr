'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Check, Lock, Sparkles, Star, Trophy, Zap, AlertCircle, ArrowRight, Clock } from 'lucide-react';

// ============================================================================
// 1. UIVERSE-INSPIRED TACTILE BUTTONS & MICRO-CONTROLS
// ============================================================================

export interface TactileButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'warning' | 'danger' | 'ghost' | 'surface';
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

  // Size styling
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs rounded-xl shadow-[0_2.5px_0]',
    md: 'px-5 py-2.5 text-sm rounded-2xl shadow-[0_3.5px_0]',
    lg: 'px-6 py-3.5 text-base rounded-2xl shadow-[0_4.5px_0]',
    xl: 'px-8 py-4 text-lg rounded-[22px] shadow-[0_5px_0]',
  }[size];

  // Variant styling with physical tactile 3D bevel (bottom shadow)
  const variantStyles = {
    primary:
      'bg-[#5B5CE2] hover:bg-[#4A4BCB] text-white shadow-[#3A3B9E] active:shadow-none border-t border-white/20 font-black',
    secondary:
      'bg-[#F0EAE1] hover:bg-[#E6DED2] text-[#25242A] shadow-[#C8C0B5] active:shadow-none border border-[rgba(37,36,42,0.14)] font-bold',
    accent:
      'bg-[#E98278] hover:bg-[#D97167] text-white shadow-[#B8574E] active:shadow-none font-bold border-t border-white/20',
    warning:
      'bg-[#E5A83B] hover:bg-[#D6962A] text-white shadow-[#B57816] active:shadow-none font-bold',
    danger:
      'bg-[#E5484D] hover:bg-[#D4373C] text-white shadow-[#A82529] active:shadow-none font-bold border-t border-white/20',
    surface:
      'bg-[#F0EAE1] hover:bg-[#EDE6DD] text-[#25242A] shadow-[#DDD4C7] active:shadow-none border border-[rgba(37,36,42,0.12)] font-semibold',
    ghost:
      'bg-transparent hover:bg-[#F0EAE1] text-[#25242A] shadow-none hover:shadow-none border border-transparent font-medium',
  }[variant];

  return (
    <motion.button
      whileHover={shouldReduceMotion || disabled ? undefined : { scale: 1.01 }}
      whileTap={shouldReduceMotion || disabled ? undefined : { y: size === 'sm' ? 2 : size === 'lg' ? 4 : 3 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`relative inline-flex items-center justify-center font-bold tracking-tight select-none transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-[#5B5CE2] disabled:opacity-50 disabled:pointer-events-none ${sizeStyles} ${variantStyles} ${
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
// 2. 21ST.DEV-INSPIRED ANIMATED SLIDING TABS
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
      className={`inline-flex items-center p-1.5 rounded-2xl bg-[#DDD4C7] border border-[rgba(37,36,42,0.12)] max-w-full overflow-x-auto no-scrollbar ${className}`}
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
                ? 'text-[#25242A]'
                : 'text-[#6E6870] hover:text-[#25242A]'
            }`}
          >
            {isActive && (
              <motion.div
                layoutId={`active-tab-${variant}`}
                transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                className="absolute inset-0 bg-[#F0EAE1] rounded-xl shadow-[0_2px_8px_rgba(37,36,42,0.08)] border border-[rgba(37,36,42,0.10)] -z-10"
              />
            )}
            {tab.icon && <span className="w-4 h-4 shrink-0">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold ${
                  isActive
                    ? 'bg-[#5B5CE2]/15 text-[#5B5CE2]'
                    : 'bg-[#E6DED2] text-[#6E6870]'
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
// 3. REACT BITS-INSPIRED SHINY TEXT & ANIMATED NUMBER
// ============================================================================

export interface ShinyTextProps {
  children: React.ReactNode;
  className?: string;
  speedSec?: number;
}

export const ShinyText: React.FC<ShinyTextProps> = ({ children, className = '', speedSec = 4 }) => {
  return (
    <span
      className={`inline-block bg-[linear-gradient(110deg,#25242A,45%,#5B5CE2,55%,#25242A)] bg-[length:250%_100%] bg-clip-text text-transparent animate-shimmer ${className}`}
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
      // easeOutExpo
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
// 4. ACETERNITY-INSPIRED SUBTLE SPOTLIGHT CARD
// ============================================================================

export interface SpotlightCardProps {
  children: React.ReactNode;
  className?: string;
  spotlightColor?: string;
}

export const SpotlightCard: React.FC<SpotlightCardProps> = ({
  children,
  className = '',
  spotlightColor = 'rgba(91, 92, 226, 0.08)',
}) => {
  const divRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setOpacity(1)}
      onMouseLeave={() => setOpacity(0)}
      className={`relative overflow-hidden rounded-[24px] bg-[#F0EAE1] border border-[rgba(37,36,42,0.12)] shadow-[0_4px_24px_-4px_rgba(37,36,42,0.06)] ${className}`}
    >
      <div
        className="pointer-events-none absolute -inset-px transition-opacity duration-300"
        style={{
          opacity,
          background: `radial-gradient(400px circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 70%)`,
        }}
        aria-hidden="true"
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
};

// ============================================================================
// 5. GLOVA SIGNATURE LEARNING MODULE CARTRIDGE (ORIGINAL PRODUCT IDENTITY)
// ============================================================================

export interface GlovaCartridgeProps {
  id: string;
  level: string; // A1, A2, B1, B2, C1, C2
  skill: 'vocabulary' | 'grammar' | 'reading' | 'listening' | 'speaking' | 'writing' | 'ranked';
  title: string;
  subtitle?: string;
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
    vocabulary: 'text-[#5B5CE2] bg-[#5B5CE2]/10 border-[#5B5CE2]/25',
    grammar: 'text-[#E5A83B] bg-[#E5A83B]/10 border-[#E5A83B]/25',
    reading: 'text-[#58B993] bg-[#58B993]/10 border-[#58B993]/25',
    listening: 'text-[#3B82F6] bg-[#3B82F6]/10 border-[#3B82F6]/25',
    speaking: 'text-[#E98278] bg-[#E98278]/10 border-[#E98278]/25',
    writing: 'text-[#8B5CF6] bg-[#8B5CF6]/10 border-[#8B5CF6]/25',
    ranked: 'text-white bg-[#E98278] border-[#D97167] font-black',
  }[skill];

  return (
    <motion.div
      whileHover={shouldReduceMotion || status === 'locked' ? undefined : { y: -3, scale: 1.01 }}
      className={`relative p-5 rounded-2xl bg-[#F0EAE1] border transition-all duration-200 ${
        status === 'ready'
          ? 'border-[#5B5CE2] shadow-[0_8px_24px_-4px_rgba(91,92,226,0.15)] ring-1 ring-[#5B5CE2]/30'
          : status === 'completed'
          ? 'border-[#58B993] shadow-[0_4px_16px_-4px_rgba(88,185,147,0.15)]'
          : status === 'in-progress'
          ? 'border-[#5B5CE2]/40 shadow-[0_4px_16px_-4px_rgba(91,92,226,0.08)]'
          : 'border-[rgba(37,36,42,0.10)] opacity-60'
      } ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-black bg-[#E6DED2] text-[#25242A] border border-[rgba(37,36,42,0.14)]">
            {level}
          </span>
          <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border uppercase tracking-wider ${skillColorMap}`}>
            {skill}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#6E6870]">
          <Clock className="w-3.5 h-3.5 text-[#E5A83B]" />
          <span>{estimatedMinutes}m</span>
          <span className="text-[#25242A] font-bold">+{xpReward} XP</span>
        </div>
      </div>

      <div className="mt-3.5 space-y-1">
        <h4 className="text-base font-bold text-[#25242A] tracking-tight leading-snug">
          {title}
        </h4>
        {subtitle && (
          <p className="text-xs text-[#6E6870] leading-relaxed line-clamp-1">
            {subtitle}
          </p>
        )}
      </div>

      {status !== 'locked' && (
        <div className="mt-4 pt-3 border-t border-[rgba(37,36,42,0.10)] flex items-center justify-between gap-3">
          <div className="flex-1 space-y-1">
            <div className="flex justify-between text-[11px] font-semibold text-[#6E6870]">
              <span>{status === 'completed' ? 'Completed' : `${completedCount}/${lessonsCount} Lessons`}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-[#DDD4C7] overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  status === 'completed' ? 'bg-[#58B993]' : 'bg-[#5B5CE2]'
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="shrink-0">
            <TactileButton
              variant={status === 'completed' ? 'secondary' : status === 'ready' ? 'primary' : 'surface'}
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
        <div className="mt-4 pt-3 border-t border-[rgba(37,36,42,0.10)] flex items-center justify-between text-xs text-[#6E6870] font-semibold">
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
// 5.1 GLOVA SIGNATURE "NEXT MOVE" ACTION HERO
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
      className={`relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-[#F0EAE1] border-2 border-[#5B5CE2]/25 shadow-[0_12px_36px_-6px_rgba(37,36,42,0.08)] space-y-5 ${className}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#DCD9FF] text-[#5B5CE2] text-xs font-bold tracking-wide border border-[#5B5CE2]/30">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{categoryBadge}</span>
        </span>
        <div className="flex items-center gap-3 text-xs font-semibold text-[#6E6870]">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-[#E5A83B]" />
            <span>{estimatedMinutes} min</span>
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-[#E5A83B] text-white font-bold text-xs">
            +{xpReward} XP
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-xl sm:text-2xl font-black text-[#25242A] tracking-tight leading-snug">
          {title}
        </h2>
        <p className="text-sm text-[#6E6870] leading-relaxed max-w-2xl font-grotesk">
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
// 5.2 PROGRESSIVE LEARNING PATH NODE (GLOVA SIGNATURE PROGRESSION)
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

  // Status visual configurations with Glova palette
  const config = {
    completed: {
      bg: 'bg-[#58B993] hover:bg-[#4BA883] shadow-[#387D60]',
      ring: 'ring-[#58B993]/30',
      icon: <Check className="w-8 h-8 text-white stroke-[3]" />,
      badgeBg: 'bg-[#58B993] text-white',
    },
    active: {
      bg: 'bg-[#5B5CE2] hover:bg-[#4A4BCB] shadow-[#3A3B9E]',
      ring: 'ring-[#5B5CE2]/35',
      icon: <Star className="w-8 h-8 text-white fill-white stroke-[1.5]" />,
      badgeBg: 'bg-[#5B5CE2] text-white',
    },
    review: {
      bg: 'bg-[#E5A83B] hover:bg-[#D6962A] shadow-[#B57816]',
      ring: 'ring-[#E5A83B]/30',
      icon: <Zap className="w-8 h-8 text-white fill-current" />,
      badgeBg: 'bg-[#E5A83B] text-white',
    },
    locked: {
      bg: 'bg-[#DDD4C7] shadow-[#B8AE9F]',
      ring: 'ring-transparent',
      icon: <Lock className="w-6 h-6 text-[#6E6870]" />,
      badgeBg: 'bg-[#DDD4C7] text-[#6E6870]',
    },
  }[status];

  return (
    <div
      className="relative flex flex-col items-center my-6"
      style={{ transform: `translateX(${offsetPercent}%)` }}
    >
      {/* Active Node Pulsing Ambient Rings */}
      {status === 'active' && !shouldReduceMotion && (
        <motion.div
          animate={{ scale: [1, 1.25, 1], opacity: [0.6, 0, 0.6] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute w-24 h-24 rounded-full bg-[#5B5CE2]/20 -top-2"
          aria-hidden="true"
        />
      )}

      {/* Floating Prompt Speech Bubble for Active Node */}
      {status === 'active' && (
        <motion.div
          initial={{ y: 5, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-2 z-20"
        >
          <div className="relative px-3.5 py-1.5 rounded-full bg-[#5B5CE2] text-white text-xs font-black tracking-wider uppercase shadow-md flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-white" />
            <span>{ctaText}</span>
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#5B5CE2] rotate-45" />
          </div>
        </motion.div>
      )}

      {/* Tactile Circular Node Button */}
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

        {/* Level Tag Pill attached to node */}
        <span className="absolute -bottom-2 px-2 py-0.5 rounded-full text-[10px] font-mono font-black shadow-xs border border-[rgba(37,36,42,0.14)] bg-[#F0EAE1] text-[#25242A]">
          {level}
        </span>
      </motion.button>

      {/* Topic Title Label */}
      <div className="mt-3 text-center max-w-[160px]">
        <h4 className="text-xs sm:text-sm font-bold text-[#25242A] leading-tight line-clamp-2">
          {topicTitle}
        </h4>
        <span className="text-[11px] text-[#5B5CE2] font-semibold">
          +{xpReward} XP
        </span>
      </div>
    </div>
  );
};

// ============================================================================
// 6. GLOVA SIGNATURE LESSON FEEDBACK DRAWER
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
              ? 'bg-[#F0EAE1]/98 border-[#58B993] text-[#25242A] shadow-[0_-8px_32px_rgba(37,36,42,0.12)]'
              : 'bg-[#F0EAE1]/98 border-[#E98278] text-[#25242A] shadow-[0_-8px_32px_rgba(37,36,42,0.12)]'
          }`}
        >
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                  isCorrect ? 'bg-[#58B993] text-white' : 'bg-[#E98278] text-white'
                }`}
              >
                {isCorrect ? <Check className="w-7 h-7 stroke-[3]" /> : <AlertCircle className="w-7 h-7 stroke-[3]" />}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg sm:text-xl font-black tracking-tight text-[#25242A]">
                    {isCorrect ? 'Excellent!' : 'Correct solution:'}
                  </h3>
                  {isCorrect && (
                    <span className="px-2.5 py-0.5 rounded-full bg-[#58B993] text-white font-mono font-black text-xs">
                      +{xpEarned} XP
                    </span>
                  )}
                  {streakBonus && (
                    <span className="px-2 py-0.5 rounded-full bg-[#E5A83B] text-white font-black text-xs flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Streak!
                    </span>
                  )}
                </div>

                {!isCorrect && correctAnswerText && (
                  <p className="text-base font-bold text-[#E98278] leading-snug">
                    {correctAnswerText}
                  </p>
                )}

                {explanation && (
                  <p className="text-xs sm:text-sm font-medium text-[#6E6870] leading-relaxed max-w-xl">
                    {explanation}
                  </p>
                )}
              </div>
            </div>

            <div className="shrink-0 pt-2 sm:pt-0">
              <TactileButton
                variant={isCorrect ? 'primary' : 'danger'}
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
