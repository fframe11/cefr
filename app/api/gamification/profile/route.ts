import { NextResponse, NextRequest } from 'next/server';
import { getUserTotalXP, getUserWeeklyXP } from '../../../../lib/gamification/xp-engine';
import { calculateGameLevel } from '../../../../lib/gamification/levels';
import { UserGameProfile } from '../../../../types/gamification';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId') || 'guest_user';
  const displayName = searchParams.get('displayName') || 'Learner';

  const totalXp = getUserTotalXP(userId);
  const weeklyXp = getUserWeeklyXP(userId);
  const levelInfo = calculateGameLevel(totalXp);

  const profile: UserGameProfile = {
    userId,
    displayName,
    gameLevel: levelInfo.level,
    totalXp,
    currentLevelXp: levelInfo.xpInCurrentLevel,
    nextLevelXp: levelInfo.xpNeededForNextLevel,
    levelProgressPercent: levelInfo.progressPercent,
    streakDays: 3,
    cefrLevel: 'B1',
    activeRankFrameId: 'cute_1',
    weeklyXp,
    monthlyXp: totalXp,
  };

  return NextResponse.json({ success: true, data: profile });
}
