import { NextResponse, NextRequest } from 'next/server';
import { finishCompetitionSession } from '../../../../lib/gamification/competition-engine';
import { recordXPEvent } from '../../../../lib/gamification/xp-engine';
import { updateAchievementProgress } from '../../../../lib/gamification/achievements';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, userId } = body;

    if (!sessionId || !userId) {
      return NextResponse.json(
        { success: false, error: 'Missing sessionId or userId' },
        { status: 400 }
      );
    }

    const summary = finishCompetitionSession(sessionId, userId);

    // Record server-side XP for the match
    if (summary.totalXpEarned > 0) {
      recordXPEvent({
        userId,
        source: 'competition',
        sourceId: sessionId,
        bonus: summary.finalScore > 100 ? 20 : 0,
        metadata: {
          accuracy: summary.accuracyPercent,
          maxStreak: summary.maxStreak,
        },
      });
    }

    // Trigger achievement evaluations
    updateAchievementProgress(userId, 'COMPETITOR', 1);
    if (summary.accuracyPercent === 100 && summary.maxStreak >= 5) {
      updateAchievementProgress(userId, 'PERFECT_ROUND', 1);
    }
    if (summary.highestStageReached >= 5) {
      updateAchievementProgress(userId, 'HIGH_ROLLER', 1);
    }

    return NextResponse.json({
      success: true,
      data: summary,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to conclude battle' },
      { status: 500 }
    );
  }
}
