/**
 * Glova Design Tokens & Ergonomic Foundation
 * Phase: 6.3.1 (Foundation Only)
 * 
 * Centralized design tokens establishing the warm, radiant, and inclusive
 * visual language for Glova English Learning Platform.
 */

export type CEFRTier = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export type FeedbackCategory = 'CONTENT_ERROR' | 'BUG' | 'SUGGESTION' | 'PRAISE';

export type FeedbackState = 'CLOSED' | 'OPEN' | 'SUBMITTING' | 'SUCCESS' | 'ERROR';

export interface FeedbackSubmissionPayload {
  category: FeedbackCategory;
  rating?: number; // 1-5 scale
  message: string;
  includeMetadata: boolean;
  metadata: {
    url: string;
    view: string;
    exerciseId?: string;
    cefrLevel?: CEFRTier;
    targetExam?: string;
    viewport: {
      width: number;
      height: number;
    };
    userAgent: string;
    locale: string;
    timestamp: string;
  };
}

export const GLOVA_ORIGINAL_PALETTE = {
  environment: {
    background: '#E6DED2',     // Primary Page Background (Warm, muted, earthy base)
    surface: '#F0EAE1',        // Elevated Content Area / Cards
    surfaceSubtle: '#EDE6DD',  // Inset / Recessed Card
    track: '#DDD4C7',          // Sunken progress track
    border: 'rgba(37, 36, 42, 0.12)', // Crisp warm ink border
    borderStrong: 'rgba(37, 36, 42, 0.22)',
  },
  text: {
    primary: '#25242A',        // Dark Ink Text (WCAG AAA)
    secondary: '#6E6870',      // Secondary Text (WCAG AA)
    muted: '#8D8790',          // Muted labels / captions
    inverse: '#FAF7F2',        // Light text on dark/primary buttons
  },
  brand: {
    primary: '#FA5D5D',        // Glova Primary Radiant Coral Rose
    primaryHover: '#E04848',
    accent: '#E98278',         // Glova Accent (Terracotta / Coral Rose)
    accentHover: '#D97167',
    softPrimary: '#FFE8E6',    // Soft Coral Tint
    softAccent: '#FBE8E6',     // Soft Terracotta Tint
    gold: '#E5A83B',           // XP / Rank Gold
    mint: '#58B993',           // Success / Mastery
  },
};

export const GLOVA_COLLECTIBLE_ECOSYSTEM = {
  badge: { type: 'rank_emblem', base: '#F0EAE1', border: 'rgba(37, 36, 42, 0.16)' },
  trophy: { type: 'achievement_trophy', base: '#F0EAE1', highlight: '#E5A83B' },
  streak: { type: 'daily_flame', accent: '#E98278' },
  xpGem: { type: 'reward_crystal', accent: '#FA5D5D' },
  frame: { type: 'profile_frame', base: '#F0EAE1', border: '#FA5D5D' },
};

export const GLOVA_PALETTE = {
  brand: {
    indigo: '#6366F1',
    indigoDark: '#4F46E5',
    violet: '#8B5CF6',
    sunAmber: '#F59E0B',
    amberDark: '#D97706',
  },
  dark: {
    background: '#090D16', // Deep Obsidian Indigo
    card: '#111827',       // Slate 900
    cardSubtle: '#1F2937', // Slate 800
    foreground: '#F8FAFC', // Slate 50
    foregroundMuted: '#94A3B8', // Slate 400
    border: 'rgba(255, 255, 255, 0.08)',
    borderFocus: 'rgba(99, 102, 241, 0.4)',
  },
  light: {
    background: '#F8FAFC', // Crisp Alabaster
    card: '#FFFFFF',       // Pure White
    cardSubtle: '#F1F5F9', // Muted Slate 100
    foreground: '#0F172A', // Slate 900
    foregroundMuted: '#64748B', // Slate 500
    border: 'rgba(15, 23, 42, 0.08)',
    borderFocus: 'rgba(79, 70, 229, 0.3)',
  },
  editorial: {
    baseIvory: '#FAF7F2',
    pureWhite: '#FFFDF8',
    subtleCream: '#F4EFEA',
    deepInk: '#24233A',
    mutedPlum: '#77758A',
    glovaIndigo: '#FA5D5D',
    softLavender: '#E9E5FF',
    warmCoral: '#FF8F82',
    butterYellow: '#F6D978',
    softMint: '#B9E8D3',
    warmBorder: '#EDE8DF',
  },
  semantic: {
    success: '#10B981',
    successTint: 'rgba(16, 185, 129, 0.12)',
    warning: '#F59E0B',
    warningTint: 'rgba(245, 158, 11, 0.12)',
    danger: '#F43F5E',
    dangerTint: 'rgba(244, 63, 94, 0.12)',
    info: '#FA5D5D',
    infoTint: 'rgba(14, 165, 233, 0.12)',
  },
  cefrTiers: {
    A1: {
      tier: 'A1',
      label: 'Beginner',
      bgClass: 'bg-amber-500/10',
      textClass: 'text-amber-500',
      borderClass: 'border-amber-500/20',
      hex: '#FA5D5D',
    },
    A2: {
      tier: 'A2',
      label: 'Elementary',
      bgClass: 'bg-amber-500/15',
      textClass: 'text-amber-500',
      borderClass: 'border-amber-500/30',
      hex: '#FFBA38',
    },
    B1: {
      tier: 'B1',
      label: 'Intermediate',
      bgClass: 'bg-emerald-500/10',
      textClass: 'text-emerald-400',
      borderClass: 'border-emerald-500/20',
      hex: '#10B981',
    },
    B2: {
      tier: 'B2',
      label: 'Upper Intermediate',
      bgClass: 'bg-emerald-500/15',
      textClass: 'text-emerald-300',
      borderClass: 'border-emerald-500/30',
      hex: '#34D399',
    },
    C1: {
      tier: 'C1',
      label: 'Advanced',
      bgClass: 'bg-violet-500/10',
      textClass: 'text-violet-400',
      borderClass: 'border-violet-500/20',
      hex: '#8B5CF6',
    },
    C2: {
      tier: 'C2',
      label: 'Mastery',
      bgClass: 'bg-amber-500/15',
      textClass: 'text-amber-400',
      borderClass: 'border-amber-500/30',
      hex: '#F59E0B',
    },
  },
} as const;

export const GLOVA_TYPOGRAPHY = {
  fontFamily: "'Plus Jakarta Sans', 'Noto Sans Thai', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  scaleTiers: {
    tier1_focal: {
      name: 'Focal / Page Title',
      desktopClass: 'text-2xl md:text-3xl font-bold tracking-tight',
      mobileClass: 'text-xl font-bold',
      lineHeight: '1.25',
    },
    tier2_section: {
      name: 'Section / Card Heading',
      desktopClass: 'text-base md:text-lg font-semibold',
      mobileClass: 'text-sm font-semibold',
      lineHeight: '1.4',
    },
    tier3_body: {
      name: 'Body / Metadata',
      desktopClass: 'text-sm font-normal text-muted-foreground',
      mobileClass: 'text-xs font-normal text-muted-foreground',
      lineHeight: '1.5',
    },
  },
  maxScaleTiersPerViewport: 3,
} as const;

export const GLOVA_SPACING = {
  generous: '2rem', // 32px (sections, main horizons)
  generousLarge: '3rem', // 48px
  medium: '1rem',    // 16px (card paddings, form gaps)
  mediumLarge: '1.25rem', // 20px
  tight: '0.5rem',    // 8px (micro-elements, icon + label)
  tightMicro: '0.375rem', // 6px
  rule: '60-30-10 Spatial Rhythm',
} as const;

export const GLOVA_RADII = {
  outerCard: '0.75rem',    // 12px (rounded-xl)
  outerLarge: '1rem',      // 16px (rounded-2xl)
  innerElement: '0.375rem', // 6px (rounded-md)
  innerButton: '0.5rem',   // 8px (rounded-lg)
  pill: '9999px',          // rounded-full (chips, badges)
  // Glova Bubble UI Radius System (Consumer-First, Warm & Playful)
  bubbleControl: '0.875rem', // 14px (rounded-2xl / small interactive controls)
  bubbleCard: '1.625rem',    // 26px (rounded-3xl / tactile cards)
  bubbleHero: '2.25rem',     // 36px (rounded-[2.25rem] / hero learning blocks)
  bubbleFeature: '2.75rem',  // 44px (rounded-[2.75rem] / large feature modules)
  bubblePill: '9999px',      // rounded-full (badges, prompt chips, navigation pills)
  invariant: 'Inner component radius must always be strictly smaller than outer card radius',
} as const;

export const GLOVA_SHADOWS = {
  subtle: '0 2px 8px rgba(0, 0, 0, 0.08)',
  ambientPrimary: '0 4px 20px -2px rgba(99, 102, 241, 0.15)',
  ambientSun: '0 4px 20px -2px rgba(245, 158, 11, 0.15)',
  // Tactile Bubble Shadows
  bubble: '0 8px 30px -4px rgba(36, 35, 58, 0.06), 0 2px 10px -2px rgba(36, 35, 58, 0.04)',
  bubbleHover: '0 14px 38px -6px rgba(91, 92, 226, 0.12), 0 4px 14px -2px rgba(36, 35, 58, 0.06)',
  bubbleWarm: '0 12px 32px -4px rgba(255, 143, 130, 0.15)',
} as const;

export const GLOVA_BUBBLE_TYPES = {
  insight: {
    bg: '#FFFDF8',
    tint: '#FAF7F2',
    border: 'rgba(250, 93, 93, 0.16)',
    accent: '#FA5D5D',
    pillBg: 'rgba(250, 93, 93, 0.10)',
    pillText: '#FA5D5D',
    titleEn: 'Insight',
    titleTh: 'ข้อสังเกต',
  },
  goal: {
    bg: '#FFFDF8',
    tint: '#FFF9E6',
    border: 'rgba(246, 217, 120, 0.45)',
    accent: '#D97706',
    pillBg: 'rgba(246, 217, 120, 0.35)',
    pillText: '#92400E',
    titleEn: "Today's Goal",
    titleTh: 'เป้าหมายวันนี้',
  },
  challenge: {
    bg: '#FFFDF8',
    tint: '#FFF3F0',
    border: 'rgba(255, 143, 130, 0.3)',
    accent: '#FF8F82',
    pillBg: 'rgba(255, 143, 130, 0.20)',
    pillText: '#C53030',
    titleEn: '7-Min Challenge',
    titleTh: 'ชาเลนจ์ 7 นาที',
  },
  progress: {
    bg: '#FFFDF8',
    tint: '#EEFBF5',
    border: 'rgba(185, 232, 211, 0.45)',
    accent: '#10B981',
    pillBg: 'rgba(185, 232, 211, 0.4)',
    pillText: '#065F46',
    titleEn: 'CEFR Progress',
    titleTh: 'ความก้าวหน้า CEFR',
  },
  discovery: {
    bg: '#FFFDF8',
    tint: '#F5F3FF',
    border: 'rgba(233, 229, 255, 0.7)',
    accent: '#7C3AED',
    pillBg: 'rgba(233, 229, 255, 0.65)',
    pillText: '#5B21B6',
    titleEn: 'Discovery',
    titleTh: 'ค้นพบคำใหม่',
  },
  achievement: {
    bg: '#FFFDF8',
    tint: '#FFF7ED',
    border: 'rgba(251, 146, 60, 0.3)',
    accent: '#EA580C',
    pillBg: 'rgba(254, 215, 170, 0.4)',
    pillText: '#C2410C',
    titleEn: 'Streak',
    titleTh: 'สถิติต่อเนื่อง',
  },
} as const;

export const GLOVA_MOTION = {
  spring: {
    snappy: { type: 'spring', stiffness: 400, damping: 30, mass: 0.8 },
    gentle: { type: 'spring', stiffness: 300, damping: 25, mass: 1 },
    bouncy: { type: 'spring', stiffness: 350, damping: 20, mass: 1.1 },
  },
  timing: {
    instant: 0.1,    // 100ms
    standard: 0.2,   // 200ms
    extended: 0.35,  // 350ms
  },
  microInteractions: {
    buttonHover: { scale: 1.02 },
    buttonTap: { scale: 0.98 },
    cardHover: { scale: 1.015 },
    floatingBubbleHover: { scale: 1.08 },
  },
} as const;

export const FEEDBACK_BUBBLE_CONFIG = {
  categories: [
    { id: 'CONTENT_ERROR', labelTh: 'เนื้อหา / คำศัพท์ / แปลผิด', labelEn: 'Content / Vocab / Translation', icon: 'FileQuestion' },
    { id: 'BUG', labelTh: 'พบปัญหาการใช้งาน / Bug', labelEn: 'Technical Bug / Layout', icon: 'AlertCircle' },
    { id: 'SUGGESTION', labelTh: 'ข้อเสนอแนะ / อยากให้มีฟีเจอร์นี้', labelEn: 'Feature Suggestion', icon: 'Lightbulb' },
    { id: 'PRAISE', labelTh: 'ชมเชย / สิ่งที่ชอบ', labelEn: 'Praise / What I Love', icon: 'Heart' },
  ],
  desktopBounds: { bottom: '24px', right: '24px', size: '48px' },
  mobileBounds: { bottom: '80px', right: '16px', size: '48px' },
  maxMessageLength: 1000,
  minMessageLength: 3,
} as const;

/**
 * Returns the tokenized styling classes for any given CEFR level.
 */
export function getCefrBadgeStyle(level: CEFRTier) {
  const match = GLOVA_PALETTE.cefrTiers[level];
  if (!match) {
    return GLOVA_PALETTE.cefrTiers.A1;
  }
  return match;
}

/**
 * Calculates luminance for a given hex color code.
 */
function getRelativeLuminance(hex: string): number {
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
  const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
  const b = parseInt(cleanHex.substring(4, 6), 16) / 255;

  const toLinear = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));

  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

/**
 * Computes the WCAG contrast ratio between two hex colors.
 */
export function calculateContrastRatio(fgHex: string, bgHex: string): number {
  const lum1 = getRelativeLuminance(fgHex);
  const lum2 = getRelativeLuminance(bgHex);
  const brighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (brighter + 0.05) / (darker + 0.05);
}
