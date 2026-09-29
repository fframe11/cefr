import { NextResponse } from 'next/server';
import { finishRankedMatch } from '@/lib/ranked/matchmaking-engine';
import { getRankedProfile, updateRankedProfile } from '@/lib/ranked/user-profile-store';
import { recordXPEvent } from '@/lib/gamification/xp-engine';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { matchId, userId = 'user_current' } = body;

    if (!matchId) {
      return NextResponse.json({ success: false, error: 'matchId is required' }, { status: 400 });
    }

    const currentProfile = getRankedProfile(userId);
    const result = finishRankedMatch(matchId, userId, currentProfile);

    if (!result) {
      return NextResponse.json({ success: false, error: 'Match not found or already finalized' }, { status: 404 });
    }

    // Update player profile in store
    const wins = currentProfile.wins + (result.outcome === 'WIN' ? 1 : 0);
    const losses = currentProfile.losses + (result.outcome === 'LOSS' ? 1 : 0);
    const draws = currentProfile.draws + (result.outcome === 'DRAW' ? 1 : 0);
    const streak = result.outcome === 'WIN' ? currentProfile.streak + 1 : 0;
    const placementMatchesPlayed = Math.min(5, currentProfile.placementMatchesPlayed + 1);

    updateRankedProfile(userId, {
      rating: result.player1.ratingAfter,
      tier: result.player1.tierAfter.tier,
      division: result.player1.tierAfter.division,
      wins,
      losses,
      draws,
      streak,
      placementMatchesPlayed,
      isPlaced: placementMatchesPlayed >= 5,
      lastMatchOutcome: result.outcome,
      lastPlayedAt: new Date().toISOString(),
    });

    // Record legitimate XP event in server ledger
    if (result.player1.xpEarned > 0) {
      recordXPEvent({
        userId,
        source: 'competition',
        sourceId: `ranked_${matchId}`,
        bonus: result.player1.xpEarned - 15,
        metadata: {
          mode: 'ranked_battle',
          matchId,
          outcome: result.outcome,
          ratingDelta: result.player1.ratingDelta,
        },
      });
    }

    return NextResponse.json({ success: true, data: result });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
