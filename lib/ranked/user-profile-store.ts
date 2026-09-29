/**
 * GLOVA RANKED USER PROFILE STORE
 *
 * In-memory / server state for player's ranked profile and match history.
 */

import { RankedProfile } from '@/types/ranked';
import { getTierFromRating } from './rating-engine';

// Default initial ranked profile for current active user
let defaultRankedProfile: RankedProfile = {
  userId: 'user_current',
  username: 'Frame_CU',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
  rankFrame: 'gaming_1',
  rating: 1284, // Gold II as specified in user prompt
  tier: 'Gold',
  division: 'II',
  peakRating: 1540,
  peakTier: 'Platinum',
  peakDivision: 'III',
  seasonId: 'season_1_2026',
  placementMatchesPlayed: 5, // Already placed
  placementRequired: 5,
  isPlaced: true,
  wins: 28,
  losses: 14,
  draws: 2,
  streak: 3,
  demotionProtectedMatches: 1,
  lastMatchOutcome: 'WIN',
  lastPlayedAt: new Date().toISOString(),
  university: 'Chulalongkorn University',
};

const profilesMap = new Map<string, RankedProfile>();
profilesMap.set(defaultRankedProfile.userId, defaultRankedProfile);

export function getRankedProfile(userId: string = 'user_current'): RankedProfile {
  let profile = profilesMap.get(userId);
  if (!profile) {
    const { tier, division } = getTierFromRating(1000);
    profile = {
      userId,
      username: 'GlovaStudent',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
      rankFrame: 'cute_1',
      rating: 1000,
      tier,
      division,
      peakRating: 1000,
      peakTier: tier,
      peakDivision: division,
      seasonId: 'season_1_2026',
      placementMatchesPlayed: 0,
      placementRequired: 5,
      isPlaced: false,
      wins: 0,
      losses: 0,
      draws: 0,
      streak: 0,
      demotionProtectedMatches: 0,
      lastPlayedAt: new Date().toISOString(),
      university: 'Chulalongkorn University',
    };
    profilesMap.set(userId, profile);
  }
  return { ...profile };
}

export function updateRankedProfile(userId: string, patch: Partial<RankedProfile>): RankedProfile {
  const current = getRankedProfile(userId);
  const updated: RankedProfile = { ...current, ...patch };

  // Recalculate tier & division if rating changed
  if (patch.rating !== undefined) {
    const { tier, division } = getTierFromRating(patch.rating);
    updated.tier = tier;
    updated.division = division;

    if (patch.rating > updated.peakRating) {
      updated.peakRating = patch.rating;
      updated.peakTier = tier;
      updated.peakDivision = division;
    }
  }

  profilesMap.set(userId, updated);
  return { ...updated };
}

export function resetRankedProfile(userId: string = 'user_current'): RankedProfile {
  profilesMap.set(userId, { ...defaultRankedProfile });
  return { ...defaultRankedProfile };
}
