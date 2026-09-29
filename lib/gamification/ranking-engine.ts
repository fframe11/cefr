import { RankingEntry, RankingSeasonInfo, RankTier } from '../../types/gamification';

// Mock/Canonical active university learners for leaderboard pool
const SEED_LEARNERS: RankingEntry[] = [
  {
    rank: 1,
    userId: 'user_apex_01',
    displayName: 'Pimchanok K.',
    weeklyXp: 1840,
    totalXp: 8900,
    gameLevel: 28,
    cefrLevel: 'B2',
    tier: 'Diamond',
    frameId: 'cute_1',
  },
  {
    rank: 2,
    userId: 'user_apex_02',
    displayName: 'Thanathorn V.',
    weeklyXp: 1690,
    totalXp: 7450,
    gameLevel: 25,
    cefrLevel: 'B2',
    tier: 'Diamond',
    frameId: 'gaming_1',
  },
  {
    rank: 3,
    userId: 'user_apex_03',
    displayName: 'Nattapong S.',
    weeklyXp: 1520,
    totalXp: 6800,
    gameLevel: 23,
    cefrLevel: 'B1',
    tier: 'Platinum',
    frameId: 'cute_2',
  },
  {
    rank: 4,
    userId: 'user_apex_04',
    displayName: 'Aomam Chulalongkorn',
    weeklyXp: 1380,
    totalXp: 5900,
    gameLevel: 21,
    cefrLevel: 'B2',
    tier: 'Platinum',
    frameId: 'gaming_2',
  },
  {
    rank: 5,
    userId: 'user_apex_05',
    displayName: 'Kittisak Tech',
    weeklyXp: 1250,
    totalXp: 5200,
    gameLevel: 19,
    cefrLevel: 'B1',
    tier: 'Gold',
    frameId: 'cute_3',
  },
  {
    rank: 6,
    userId: 'user_apex_06',
    displayName: 'Sarisa Thammasat',
    weeklyXp: 1110,
    totalXp: 4600,
    gameLevel: 18,
    cefrLevel: 'B1',
    tier: 'Gold',
    frameId: 'gaming_3',
  },
  {
    rank: 7,
    userId: 'user_apex_07',
    displayName: 'Nutthida Arts',
    weeklyXp: 980,
    totalXp: 4100,
    gameLevel: 16,
    cefrLevel: 'A2',
    tier: 'Silver',
  },
  {
    rank: 8,
    userId: 'user_apex_08',
    displayName: 'Teerapat Eng',
    weeklyXp: 870,
    totalXp: 3800,
    gameLevel: 15,
    cefrLevel: 'B1',
    tier: 'Silver',
  },
  {
    rank: 9,
    userId: 'user_apex_09',
    displayName: 'Chayanin Bio',
    weeklyXp: 760,
    totalXp: 3200,
    gameLevel: 14,
    cefrLevel: 'A2',
    tier: 'Bronze',
  },
];

export function getLeaderboardData(params: {
  userId: string;
  userDisplayName?: string;
  userWeeklyXp?: number;
  userTotalXp?: number;
  userGameLevel?: number;
  filter: 'weekly' | 'monthly' | 'friends';
}): RankingSeasonInfo {
  const {
    userId,
    userDisplayName = 'คุณ (You)',
    userWeeklyXp = 640,
    userTotalXp = 2450,
    userGameLevel = 12,
  } = params;

  // Insert current user into the ranking pool dynamically
  const currentUserEntry: RankingEntry = {
    rank: 10,
    userId,
    displayName: userDisplayName,
    weeklyXp: userWeeklyXp,
    totalXp: userTotalXp,
    gameLevel: userGameLevel,
    cefrLevel: 'B1',
    tier: userWeeklyXp >= 1500 ? 'Diamond' : userWeeklyXp >= 1200 ? 'Platinum' : userWeeklyXp >= 900 ? 'Gold' : userWeeklyXp >= 500 ? 'Silver' : 'Bronze',
    isCurrentUser: true,
  };

  const allEntries = [...SEED_LEARNERS, currentUserEntry].sort((a, b) => b.weeklyXp - a.weeklyXp);

  // Recalculate rank numbers
  allEntries.forEach((entry, idx) => {
    entry.rank = idx + 1;
  });

  const currentUser = allEntries.find((e) => e.userId === userId) || currentUserEntry;
  const userRankIndex = allEntries.findIndex((e) => e.userId === userId);

  // Surrounding 5 entries for privacy and focused competition (#8, #9, YOU #10, #11, #12)
  const startIndex = Math.max(0, userRankIndex - 2);
  const surrounding = allEntries.slice(startIndex, startIndex + 5);

  return {
    seasonId: 'season_2026_w39',
    seasonName: 'Season 39 — Bangkok University League',
    endsInDays: 4,
    userRank: currentUser.rank,
    userWeeklyXp: currentUser.weeklyXp,
    userTier: currentUser.tier,
    topUsers: allEntries.slice(0, 5),
    surroundingUsers: surrounding,
  };
}
