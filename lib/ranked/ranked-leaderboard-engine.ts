/**
 * GLOVA RANKED LEADERBOARD ENGINE
 *
 * Separate from XP activity leaderboard.
 * Ranks players strictly by competitive Rank Rating (MMR).
 * Provides Global, Friends, and University filters,
 * with Top 3 podium and surrounding player window.
 */

import { RankedLeaderboardEntry, RankedProfile } from '@/types/ranked';
import { getTierFromRating } from './rating-engine';

// Mock competitive university players for active leaderboard
const MOCK_RANKED_LEADERBOARD: RankedLeaderboardEntry[] = [
  {
    rank: 1,
    userId: 'user_r_1',
    username: 'Apex_Arthit',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    rankFrame: 'gaming_1',
    tier: 'Master',
    division: 'I',
    rating: 2485,
    wins: 112,
    losses: 18,
    winRate: 86,
    streak: 8,
    university: 'Chulalongkorn University',
  },
  {
    rank: 2,
    userId: 'user_r_2',
    username: 'Praew_Chulalongkorn',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80',
    rankFrame: 'gaming_2',
    tier: 'Diamond',
    division: 'I',
    rating: 2340,
    wins: 98,
    losses: 24,
    winRate: 80,
    streak: 5,
    university: 'Chulalongkorn University',
  },
  {
    rank: 3,
    userId: 'user_r_3',
    username: 'Non_Thammasat',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    rankFrame: 'gaming_3',
    tier: 'Diamond',
    division: 'II',
    rating: 2195,
    wins: 84,
    losses: 29,
    winRate: 74,
    streak: 4,
    university: 'Thammasat University',
  },
  {
    rank: 4,
    userId: 'user_r_4',
    username: 'Mook_Kasetsart',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
    rankFrame: 'cute_1',
    tier: 'Diamond',
    division: 'III',
    rating: 2040,
    wins: 76,
    losses: 31,
    winRate: 71,
    streak: 3,
    university: 'Kasetsart University',
  },
  {
    rank: 5,
    userId: 'user_r_5',
    username: 'Kao_Mahidol',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
    rankFrame: 'cute_2',
    tier: 'Platinum',
    division: 'I',
    rating: 1890,
    wins: 65,
    losses: 33,
    winRate: 66,
    streak: 2,
    university: 'Mahidol University',
  },
  {
    rank: 6,
    userId: 'user_r_6',
    username: 'Beam_CMU',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&auto=format&fit=crop&q=80',
    rankFrame: 'cute_3',
    tier: 'Platinum',
    division: 'II',
    rating: 1720,
    wins: 58,
    losses: 35,
    winRate: 62,
    streak: 1,
    university: 'Chiang Mai University',
  },
  {
    rank: 7,
    userId: 'user_r_7',
    username: 'Fah_KhonKaen',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    rankFrame: 'gaming_2',
    tier: 'Platinum',
    division: 'III',
    rating: 1560,
    wins: 52,
    losses: 38,
    winRate: 57,
    streak: 2,
    university: 'Khon Kaen University',
  },
  {
    rank: 8,
    userId: 'user_r_8',
    username: 'Tee_KMUTT',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    rankFrame: 'gaming_1',
    tier: 'Gold',
    division: 'I',
    rating: 1420,
    wins: 48,
    losses: 39,
    winRate: 55,
    streak: 0,
    university: 'KMUTT',
  },
  {
    rank: 9,
    userId: 'user_r_9',
    username: 'Pim_Chula',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80',
    rankFrame: 'cute_1',
    tier: 'Gold',
    division: 'I',
    rating: 1380,
    wins: 44,
    losses: 41,
    winRate: 51,
    streak: 1,
    university: 'Chulalongkorn University',
  },
  {
    rank: 10,
    userId: 'user_r_10',
    username: 'Win_Thammasat',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
    rankFrame: 'cute_2',
    tier: 'Gold',
    division: 'II',
    rating: 1320,
    wins: 39,
    losses: 42,
    winRate: 48,
    streak: 0,
    university: 'Thammasat University',
  },
];

export interface GetRankedLeaderboardParams {
  filter: 'global' | 'friends' | 'university';
  currentProfile: RankedProfile;
}

export interface RankedLeaderboardResponse {
  top3: RankedLeaderboardEntry[];
  entries: RankedLeaderboardEntry[];
  currentUserEntry: RankedLeaderboardEntry;
  totalParticipants: number;
}

export function getRankedLeaderboard(params: GetRankedLeaderboardParams): RankedLeaderboardResponse {
  const { filter, currentProfile } = params;

  // Build current user entry
  const totalMatches = currentProfile.wins + currentProfile.losses;
  const winRate = totalMatches > 0 ? Math.round((currentProfile.wins / totalMatches) * 100) : 50;
  const { tier, division } = getTierFromRating(currentProfile.rating);

  const currentUserEntry: RankedLeaderboardEntry = {
    rank: 11, // Will be computed dynamically
    userId: currentProfile.userId,
    username: currentProfile.username,
    avatar: currentProfile.avatar,
    rankFrame: currentProfile.rankFrame,
    tier,
    division,
    rating: currentProfile.rating,
    wins: currentProfile.wins,
    losses: currentProfile.losses,
    winRate,
    streak: currentProfile.streak,
    university: currentProfile.university || 'Chulalongkorn University',
    isCurrentUser: true,
  };

  // Merge mock entries with current user
  let fullList = [...MOCK_RANKED_LEADERBOARD.filter((e) => e.userId !== currentProfile.userId), currentUserEntry];

  // Apply filter
  if (filter === 'university' && currentProfile.university) {
    fullList = fullList.filter((e) => e.university === currentProfile.university);
  } else if (filter === 'friends') {
    // Top 5 simulate friends
    fullList = [MOCK_RANKED_LEADERBOARD[1], MOCK_RANKED_LEADERBOARD[2], MOCK_RANKED_LEADERBOARD[8], currentUserEntry];
  }

  // Sort descending by rating
  fullList.sort((a, b) => b.rating - a.rating);

  // Assign 1-indexed ranks
  fullList.forEach((entry, idx) => {
    entry.rank = idx + 1;
  });

  const top3 = fullList.slice(0, 3);

  // Surrounding slice around user (or top 10 if near top)
  const userIndex = fullList.findIndex((e) => e.userId === currentProfile.userId);
  let startIdx = Math.max(0, userIndex - 3);
  let endIdx = Math.min(fullList.length, userIndex + 4);
  if (endIdx - startIdx < 7 && fullList.length >= 7) {
    if (startIdx === 0) endIdx = Math.min(fullList.length, 7);
    else if (endIdx === fullList.length) startIdx = Math.max(0, fullList.length - 7);
  }

  const entries = fullList.slice(startIdx, endIdx);
  const updatedUserEntry = fullList.find((e) => e.userId === currentProfile.userId) || currentUserEntry;

  return {
    top3,
    entries,
    currentUserEntry: updatedUserEntry,
    totalParticipants: 4280 + fullList.length,
  };
}
