import { NextResponse } from 'next/server';
import {
  cancelMatchmaking,
  enqueuePlayer,
  pollQueueStatus,
} from '@/lib/ranked/matchmaking-engine';
import { getRankedProfile } from '@/lib/ranked/user-profile-store';
import { CompetitiveGameMode } from '@/types/ranked';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const action = body.action || 'enqueue'; // 'enqueue' | 'poll' | 'cancel'
    const userId = body.userId || 'user_current';
    const mode = (body.mode || 'vocabulary') as CompetitiveGameMode;

    const profile = getRankedProfile(userId);

    if (action === 'cancel') {
      const cancelled = cancelMatchmaking(userId);
      return NextResponse.json({ success: true, cancelled });
    }

    if (action === 'poll') {
      const pollResult = pollQueueStatus(userId);
      return NextResponse.json({
        success: true,
        status: pollResult.status,
        matchId: pollResult.match?.matchId,
        match: pollResult.match
          ? {
              matchId: pollResult.match.matchId,
              player1: pollResult.match.player1,
              player2: pollResult.match.player2,
              sessionToken: pollResult.match.sessionToken,
              totalQuestions: pollResult.match.questions.length,
            }
          : undefined,
      });
    }

    // Default: enqueue
    const queueResult = enqueuePlayer({
      userId: profile.userId,
      username: profile.username,
      avatar: profile.avatar,
      rankFrame: profile.rankFrame,
      rating: profile.rating,
      tier: profile.tier,
      division: profile.division,
      queuedAt: Date.now(),
      mode,
      university: profile.university,
    });

    return NextResponse.json({
      success: true,
      status: queueResult.status,
      matchId: queueResult.match?.matchId,
      match: queueResult.match
        ? {
            matchId: queueResult.match.matchId,
            player1: queueResult.match.player1,
            player2: queueResult.match.player2,
            sessionToken: queueResult.match.sessionToken,
            totalQuestions: queueResult.match.questions.length,
          }
        : undefined,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
