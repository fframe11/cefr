/**
 * GLOVA RANKED SEASON ENGINE
 *
 * Manages Season 1: Genesis, historical season preservation,
 * soft reset MMR formulas, and tier reward tiering.
 */

import { RankedSeason, RankTier } from '@/types/ranked';

export const CURRENT_SEASON: RankedSeason = {
  id: 'season_1_2026',
  name: 'Glova Ranked Season 1: Genesis',
  number: 1,
  startDate: '2026-10-01T00:00:00.000Z',
  endDate: '2026-11-30T23:59:59.000Z',
  status: 'ACTIVE',
  rewards: [
    { tier: 'Master', frameId: 'gaming_1', xpReward: 2000, achievementId: 'ach_master_conqueror' },
    { tier: 'Diamond', frameId: 'gaming_2', xpReward: 1200, achievementId: 'ach_diamond_ascendant' },
    { tier: 'Platinum', frameId: 'gaming_3', xpReward: 800, achievementId: 'ach_platinum_striker' },
    { tier: 'Gold', frameId: 'cute_1', xpReward: 500, achievementId: 'ach_gold_challenger' },
    { tier: 'Silver', frameId: 'cute_2', xpReward: 300 },
    { tier: 'Bronze', frameId: 'cute_3', xpReward: 150 },
  ],
};

/**
 * Historical archive of past seasons
 */
export const PAST_SEASONS: RankedSeason[] = [
  {
    id: 'season_pre_2026',
    name: 'Glova Ranked Alpha League',
    number: 0,
    startDate: '2026-08-01T00:00:00.000Z',
    endDate: '2026-09-30T23:59:59.000Z',
    status: 'CONCLUDED',
    rewards: [
      { tier: 'Gold', frameId: 'cute_1', xpReward: 500 },
      { tier: 'Silver', frameId: 'cute_2', xpReward: 300 },
    ],
  },
];

/**
 * Soft Reset formula at season end:
 * NewRating = max(600, round(1000 + 0.5 * (PrevRating - 1000)))
 * Compresses extreme ratings toward baseline while preserving relative standing.
 */
export function calculateSeasonSoftReset(prevRating: number): number {
  const base = 1000;
  const compressed = Math.round(base + 0.5 * (prevRating - base));
  return Math.max(600, compressed);
}

/**
 * Get rewards for tier achieved in a season
 */
export function getSeasonTierReward(tier: RankTier, season: RankedSeason = CURRENT_SEASON) {
  return season.rewards.find((r) => r.tier === tier);
}
