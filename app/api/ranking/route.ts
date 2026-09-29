import { NextResponse, NextRequest } from 'next/server';
import { getLeaderboardData } from '../../../lib/gamification/ranking-engine';
import { getUserWeeklyXP, getUserTotalXP } from '../../../lib/gamification/xp-engine';
import { calculateGameLevel } from '../../../lib/gamification/levels';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId') || 'guest_user';
  const filter = (searchParams.get('filter') as 'weekly' | 'monthly' | 'friends') || 'weekly';

  const userWeeklyXp = getUserWeeklyXP(userId) || 320;
  const userTotalXp = getUserTotalXP(userId) || 1200;
  const levelInfo = calculateGameLevel(userTotalXp);

  const leaderboard = getLeaderboardData({
    userId,
    userWeeklyXp,
    userTotalXp,
    userGameLevel: levelInfo.level,
    filter,
  });

  return NextResponse.json({
    success: true,
    data: leaderboard,
  });
}
