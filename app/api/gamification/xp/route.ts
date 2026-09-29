import { NextResponse, NextRequest } from 'next/server';
import { recordXPEvent, getUserTotalXP } from '../../../../lib/gamification/xp-engine';
import { calculateGameLevel } from '../../../../lib/gamification/levels';
import { updateAchievementProgress } from '../../../../lib/gamification/achievements';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, source, sourceId, multiplier, bonus, metadata } = body;

    if (!userId || !source) {
      return NextResponse.json(
        { success: false, error: 'Missing required userId or source parameter' },
        { status: 400 }
      );
    }

    const result = recordXPEvent({
      userId,
      source,
      sourceId,
      multiplier,
      bonus,
      metadata,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.message },
        { status: 429 } // Rate limit / duplicate / cap reached
      );
    }

    // Check achievement triggers
    const { newlyUnlocked, achievement } = updateAchievementProgress(userId, 'FIRST_STEP', 1);

    const totalXp = getUserTotalXP(userId);
    const levelInfo = calculateGameLevel(totalXp);

    return NextResponse.json({
      success: true,
      data: {
        event: result.event,
        newTotalXp: totalXp,
        levelInfo,
        unlockedAchievement: newlyUnlocked ? achievement : undefined,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to record XP' },
      { status: 500 }
    );
  }
}
