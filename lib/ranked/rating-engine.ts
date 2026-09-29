/**
 * GLOVA RANKED COMPETITIVE RATING ENGINE (MMR & TIER PROGRESSION)
 *
 * Deterministic Elo rating adaptation with dynamic K-factors,
 * placement calibration, demotion protection buffers, and tier divisions.
 */

import { RankDivision, RankTier, TierInfo } from '@/types/ranked';

export interface TierThreshold {
  tier: RankTier;
  division: RankDivision;
  min: number;
  max: number;
  color: string;
  badgeBg: string;
  iconName: string;
}

export const TIER_THRESHOLDS: TierThreshold[] = [
  { tier: 'Bronze', division: 'III', min: 0, max: 199, color: '#CD7F32', badgeBg: 'bg-amber-900/10 text-amber-800 dark:text-amber-300', iconName: 'Shield' },
  { tier: 'Bronze', division: 'II', min: 200, max: 399, color: '#CD7F32', badgeBg: 'bg-amber-900/10 text-amber-800 dark:text-amber-300', iconName: 'Shield' },
  { tier: 'Bronze', division: 'I', min: 400, max: 599, color: '#CD7F32', badgeBg: 'bg-amber-900/15 text-amber-800 dark:text-amber-300', iconName: 'Shield' },

  { tier: 'Silver', division: 'III', min: 600, max: 749, color: '#94A3B8', badgeBg: 'bg-slate-500/10 text-slate-700 dark:text-slate-300', iconName: 'Shield' },
  { tier: 'Silver', division: 'II', min: 750, max: 899, color: '#94A3B8', badgeBg: 'bg-slate-500/10 text-slate-700 dark:text-slate-300', iconName: 'Shield' },
  { tier: 'Silver', division: 'I', min: 900, max: 1049, color: '#94A3B8', badgeBg: 'bg-slate-500/15 text-slate-700 dark:text-slate-300', iconName: 'Shield' },

  { tier: 'Gold', division: 'III', min: 1050, max: 1199, color: '#F59E0B', badgeBg: 'bg-amber-500/10 text-amber-700 dark:text-amber-300', iconName: 'Award' },
  { tier: 'Gold', division: 'II', min: 1200, max: 1349, color: '#F59E0B', badgeBg: 'bg-amber-500/10 text-amber-700 dark:text-amber-300', iconName: 'Award' },
  { tier: 'Gold', division: 'I', min: 1350, max: 1499, color: '#F59E0B', badgeBg: 'bg-amber-500/15 text-amber-700 dark:text-amber-300', iconName: 'Award' },

  { tier: 'Platinum', division: 'III', min: 1500, max: 1649, color: '#06B6D4', badgeBg: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-300', iconName: 'Zap' },
  { tier: 'Platinum', division: 'II', min: 1650, max: 1799, color: '#06B6D4', badgeBg: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-300', iconName: 'Zap' },
  { tier: 'Platinum', division: 'I', min: 1800, max: 1949, color: '#06B6D4', badgeBg: 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300', iconName: 'Zap' },

  { tier: 'Diamond', division: 'III', min: 1950, max: 2099, color: '#8B5CF6', badgeBg: 'bg-purple-500/10 text-purple-700 dark:text-purple-300', iconName: 'Gem' },
  { tier: 'Diamond', division: 'II', min: 2100, max: 2249, color: '#8B5CF6', badgeBg: 'bg-purple-500/10 text-purple-700 dark:text-purple-300', iconName: 'Gem' },
  { tier: 'Diamond', division: 'I', min: 2250, max: 2399, color: '#8B5CF6', badgeBg: 'bg-purple-500/15 text-purple-700 dark:text-purple-300', iconName: 'Gem' },

  { tier: 'Master', division: 'I', min: 2400, max: 99999, color: '#EF4444', badgeBg: 'bg-rose-500/15 text-rose-700 dark:text-rose-300', iconName: 'Crown' },
];

/**
 * Maps any rating to its corresponding tier and division.
 */
export function getTierFromRating(rating: number): { tier: RankTier; division: RankDivision; threshold: TierThreshold } {
  const safeRating = Math.max(0, Math.floor(rating));
  for (const t of TIER_THRESHOLDS) {
    if (safeRating >= t.min && safeRating <= t.max) {
      return { tier: t.tier, division: t.division, threshold: t };
    }
  }
  // Fallback to highest tier
  const highest = TIER_THRESHOLDS[TIER_THRESHOLDS.length - 1];
  return { tier: highest.tier, division: highest.division, threshold: highest };
}

/**
 * Calculates rating progress percentage within current division.
 */
export function getDivisionProgress(rating: number): { percent: number; current: number; max: number } {
  const { threshold } = getTierFromRating(rating);
  if (threshold.tier === 'Master') {
    return { percent: 100, current: rating - threshold.min, max: 1000 };
  }
  const range = threshold.max - threshold.min + 1;
  const current = Math.max(0, rating - threshold.min);
  const percent = Math.min(100, Math.max(0, Math.round((current / range) * 100)));
  return { percent, current, max: range };
}

/**
 * Determines K-factor based on placement status and current rating.
 */
export function getKFactor(rating: number, isPlacement: boolean): number {
  if (isPlacement) return 40;
  if (rating >= 2400) return 16;
  if (rating >= 1950) return 20;
  return 28;
}

export interface MatchRatingCalculationParams {
  playerRating: number;
  opponentRating: number;
  outcome: 'WIN' | 'LOSS' | 'DRAW';
  isPlacement: boolean;
  playerAccuracy: number; // 0..1
  demotionProtectedMatches: number;
}

export interface MatchRatingResult {
  ratingBefore: number;
  ratingAfter: number;
  ratingDelta: number;
  tierBefore: { tier: RankTier; division: RankDivision };
  tierAfter: { tier: RankTier; division: RankDivision };
  isPromotion: boolean;
  isDemotion: boolean;
  demotionProtectionRemaining: number;
  xpEarned: number;
}

/**
 * Server-authoritative Elo rating calculation.
 * Formula:
 * E_A = 1 / (1 + 10^((R_B - R_A)/400))
 * ΔR = K * (S_A - E_A) + AccuracyBonus
 */
export function calculateMatchRating(params: MatchRatingCalculationParams): MatchRatingResult {
  const {
    playerRating,
    opponentRating,
    outcome,
    isPlacement,
    playerAccuracy,
    demotionProtectedMatches,
  } = params;

  const tierBefore = getTierFromRating(playerRating);

  // Expected score
  const expected = 1 / (1 + Math.pow(10, (opponentRating - playerRating) / 400));

  // Actual score S
  let actual = 0.5;
  if (outcome === 'WIN') actual = 1.0;
  else if (outcome === 'LOSS') actual = 0.0;

  const k = getKFactor(playerRating, isPlacement);
  let rawDelta = Math.round(k * (actual - expected));

  // Accuracy bonus on win (up to +4 points for 90%+ accuracy)
  if (outcome === 'WIN') {
    if (playerAccuracy >= 0.9) rawDelta += 4;
    else if (playerAccuracy >= 0.8) rawDelta += 2;
    // Bounded win range: minimum +12, maximum +48
    rawDelta = Math.max(12, Math.min(48, rawDelta));
  } else if (outcome === 'LOSS') {
    // Placement match loss protection: soften loss by 40%
    if (isPlacement) {
      rawDelta = Math.round(rawDelta * 0.6);
    }
    // Bounded loss range: minimum -8, maximum -32
    rawDelta = Math.min(-8, Math.max(-32, rawDelta));
  } else {
    // Draw
    rawDelta = Math.max(-6, Math.min(6, rawDelta));
  }

  let ratingAfter = Math.max(0, playerRating + rawDelta);
  const tentativeTierAfter = getTierFromRating(ratingAfter);

  // Check demotion protection
  let isDemotion = false;
  let isPromotion = false;
  let demotionProtectionRemaining = demotionProtectedMatches;

  const tierWeightBefore = getTierWeight(tierBefore.tier, tierBefore.division);
  const tierWeightAfter = getTierWeight(tentativeTierAfter.tier, tentativeTierAfter.division);

  let finalTier = tentativeTierAfter;

  if (tierWeightAfter > tierWeightBefore) {
    // Promoted! Grant 2 matches of demotion protection
    isPromotion = true;
    demotionProtectionRemaining = 2;
  } else if (tierWeightAfter < tierWeightBefore) {
    if (demotionProtectionRemaining > 0 && !isPlacement) {
      // Shield active! Preserve current displayed tier
      demotionProtectionRemaining -= 1;
      finalTier = tierBefore;
      isDemotion = false;
    } else {
      isDemotion = true;
      demotionProtectionRemaining = 0;
    }
  }

  // Calculate learning XP earned
  let xpEarned = 15; // Base participation
  if (outcome === 'WIN') xpEarned = 40;
  else if (outcome === 'DRAW') xpEarned = 25;
  if (playerAccuracy >= 0.8) xpEarned += 10;

  return {
    ratingBefore: playerRating,
    ratingAfter,
    ratingDelta: rawDelta,
    tierBefore: { tier: tierBefore.tier, division: tierBefore.division },
    tierAfter: { tier: finalTier.tier, division: finalTier.division },
    isPromotion,
    isDemotion,
    demotionProtectionRemaining,
    xpEarned,
  };
}

/**
 * Helper to numerically compare tier and division rank for promotion/demotion checks.
 */
export function getTierWeight(tier: RankTier, division: RankDivision): number {
  const tierOrder: Record<RankTier, number> = {
    Bronze: 1,
    Silver: 2,
    Gold: 3,
    Platinum: 4,
    Diamond: 5,
    Master: 6,
  };
  const divOrder: Record<RankDivision, number> = {
    III: 1,
    II: 2,
    I: 3,
  };
  return tierOrder[tier] * 10 + divOrder[division];
}
