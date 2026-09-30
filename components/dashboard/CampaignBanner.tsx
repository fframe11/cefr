'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  Sparkles,
  Trophy,
  Flame,
  Swords,
  Gift,
  Megaphone,
  ArrowRight,
  Clock,
  Award,
} from 'lucide-react';
import { Campaign, CampaignType } from '../../types/campaign';
import { getActiveCampaigns } from '../../lib/campaigns';
import { useTranslation } from '../../i18n';
import { TactileButton } from '../ui/GlovaPrimitives';

export interface CampaignBannerProps {
  campaigns?: Campaign[];
  onNavigate?: (route: string) => void;
  className?: string;
  autoRotateInterval?: number;
}

const TYPE_ICONS: Record<CampaignType, React.ReactNode> = {
  RANKED: <Swords className="w-3.5 h-3.5 text-[#F6D978]" />,
  CHALLENGE: <Flame className="w-3.5 h-3.5 text-[#FF8F82]" />,
  EVENT: <Trophy className="w-3.5 h-3.5 text-[#F6D978]" />,
  REWARD: <Gift className="w-3.5 h-3.5 text-[#B9E8D3]" />,
  ANNOUNCEMENT: <Megaphone className="w-3.5 h-3.5 text-[#5B5CE2]" />,
  FEATURE: <Sparkles className="w-3.5 h-3.5 text-[#06B6D4]" />,
};

export const CampaignBanner: React.FC<CampaignBannerProps> = ({
  campaigns: propCampaigns,
  onNavigate,
  className = '',
  autoRotateInterval = 5000,
}) => {
  const { isEnglish } = useTranslation();
  const isEn = isEnglish;
  const shouldReduceMotion = useReducedMotion();

  // 1. Resolve active campaigns
  const [campaigns, setCampaigns] = useState<Campaign[]>(() => {
    return propCampaigns !== undefined
      ? propCampaigns
      : getActiveCampaigns();
  });

  useEffect(() => {
    if (propCampaigns !== undefined) {
      setCampaigns(propCampaigns);
    } else {
      setCampaigns(getActiveCampaigns());
    }
  }, [propCampaigns]);

  const [currentIndex, setCurrentIndex] = useState(0);

  // Swipe gesture tracking
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const total = campaigns.length;

  // Safe navigation helpers
  const nextSlide = useCallback(() => {
    if (total <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const prevSlide = useCallback(() => {
    if (total <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  // 2. Auto-rotation timer (continuously advances slides)
  useEffect(() => {
    if (total <= 1 || shouldReduceMotion) {
      return;
    }

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % total);
    }, autoRotateInterval);

    return () => clearInterval(timer);
  }, [total, shouldReduceMotion, autoRotateInterval]);

  // 3. Touch swipe handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    const deltaX = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 45;

    if (deltaX > minSwipeDistance) {
      nextSlide();
    } else if (deltaX < -minSwipeDistance) {
      prevSlide();
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  // 4. Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      prevSlide();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      nextSlide();
    }
  };

  // If no campaigns to show, render nothing
  if (!campaigns || campaigns.length === 0) {
    return null;
  }

  const current = campaigns[currentIndex] || campaigns[0];
  const typeIcon = TYPE_ICONS[current.campaign_type] || <Sparkles className="w-3.5 h-3.5" />;
  const badgeText = isEn ? (current.badgeEn || current.campaign_type) : (current.badgeTh || current.badgeEn || current.campaign_type);
  const title = isEn ? current.titleEn : current.titleTh;
  const subtitle = isEn ? current.subtitleEn : current.subtitleTh;
  const description = isEn ? current.descriptionEn : current.descriptionTh;
  const ctaLabel = isEn ? current.cta_labelEn : current.cta_labelTh;
  const reward = isEn ? current.rewardEn : current.rewardTh;

  const bgGradient =
    current.theme?.backgroundGradient ||
    'from-[#5B5CE2]/15 via-[#FFFDF8] to-[#FFFDF8] dark:from-[#5B5CE2]/20 dark:via-[#24233A] dark:to-card';
  const borderAccent = current.theme?.borderAccent || 'border-[#5B5CE2]/25 dark:border-border/60';
  const badgeBg = current.theme?.badgeBg || 'bg-[#5B5CE2]';
  const badgeTextColor = current.theme?.badgeText || 'text-white';

  const handleCtaClick = () => {
    if (onNavigate && current.target_route) {
      onNavigate(current.target_route);
    }
  };

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label={isEn ? 'Promotional Campaigns and Events' : 'แคมเปญและกิจกรรมพิเศษ'}
      aria-live="polite"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className={`relative overflow-hidden rounded-[26px] border-2 ${borderAccent} bg-gradient-to-br ${bgGradient} p-5 sm:p-7 shadow-[0_6px_24px_-4px_rgba(91,92,226,0.08)] transition-all duration-300 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#5B5CE2] select-none ${className}`}
    >
      {/* Visual Accent Ambient Glow (Aceternity UI influence) */}
      <div
        className="pointer-events-none absolute -right-12 -top-12 h-56 w-56 rounded-full bg-[#5B5CE2]/15 blur-3xl dark:bg-[#5B5CE2]/25"
        aria-hidden="true"
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: -12 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6"
        >
          {/* LEFT: TEXT CONTENT & ACTIONS */}
          <div className="flex-1 space-y-3">
            {/* Header Tags & Metadata */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${badgeBg} ${badgeTextColor} text-[11px] font-black tracking-wide uppercase shadow-xs font-tech`}
              >
                {typeIcon}
                <span>{badgeText}</span>
              </span>

              {reward && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#F6D978]/25 text-[#24233A] dark:text-[#F6D978] text-[11px] font-bold border border-[#F6D978]/40">
                  <Award className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                  <span>{reward}</span>
                </span>
              )}
            </div>

            {/* Campaign Title & Subtitle */}
            <div>
              {subtitle && (
                <p className="text-xs font-bold text-[#5B5CE2] dark:text-indigo-400 uppercase tracking-wider font-tech mb-0.5">
                  {subtitle}
                </p>
              )}
              <h2 className="text-lg sm:text-xl lg:text-2xl font-black text-foreground tracking-tight leading-snug">
                {title}
              </h2>
            </div>

            {/* Concise Description */}
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-xl line-clamp-2 sm:line-clamp-3">
              {description}
            </p>

            {/* Primary Action Button */}
            <div className="pt-1.5 flex items-center gap-3">
              <TactileButton
                variant="primary"
                size="md"
                onClick={handleCtaClick}
                className="px-6 shadow-[0_4px_0_#4041B5]"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                {ctaLabel}
              </TactileButton>
            </div>
          </div>

          {/* RIGHT: TRANSPARENT EMBLEM / VISUAL ASSET SHOWCASE */}
          <div className="flex items-center justify-center md:justify-end shrink-0 py-2 sm:py-0">
            <div className="relative flex items-center justify-center">
              {/* Soft decorative backplate */}
              <div
                className="absolute w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-white/60 dark:bg-white/5 border border-white/80 dark:border-white/10 shadow-sm"
                aria-hidden="true"
              />

              {/* True Transparent RGBA PNG Asset with React Bits spring hover */}
              <motion.img
                whileHover={shouldReduceMotion ? {} : { scale: 1.06, rotate: 2 }}
                transition={{ type: 'spring', stiffness: 350, damping: 20 }}
                src={current.image}
                alt={isEn ? current.imageAltEn : current.imageAltTh}
                className="relative z-10 w-24 h-24 sm:w-32 sm:h-32 object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.12)] cursor-pointer"
                onClick={handleCtaClick}
                draggable={false}
              />
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Centered Pagination Indicators (Clickable to switch slides directly) */}
      {total > 1 && (
        <div className="relative z-10 mt-5 pt-3 border-t border-[#EDE8DF]/70 dark:border-border/30 flex items-center justify-center">
          <div className="flex items-center gap-1.5" role="tablist" aria-label={isEn ? 'Slide Navigation' : 'เลื่อนหน้าแคมเปญ'}>
            {campaigns.map((camp, idx) => {
              const isActive = idx === currentIndex;
              return (
                <button
                  key={camp.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-label={`${isEn ? 'Go to slide' : 'ไปยังสไลด์ที่'} ${idx + 1}`}
                  onClick={() => goToSlide(idx)}
                  className="p-1.5 -m-0.5 flex items-center justify-center cursor-pointer group focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#5B5CE2] rounded-full transition-transform active:scale-90"
                >
                  <span
                    className={`h-2.5 rounded-full transition-all duration-300 ${
                      isActive
                        ? 'w-7 bg-[#5B5CE2] shadow-sm shadow-[#5B5CE2]/30'
                        : 'w-2.5 bg-[#77758A]/35 dark:bg-[#77758A]/45 group-hover:bg-[#5B5CE2]/60 group-hover:scale-125'
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
