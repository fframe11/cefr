import { NextResponse } from 'next/server';
import { getRankedLeaderboard } from '@/lib/ranked/ranked-leaderboard-engine';
import { getRankedProfile } from '@/lib/ranked/user-profile-store';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filter = (searchParams.get('filter') || 'global') as 'global' | 'friends' | 'university';
    const userId = searchParams.get('userId') || 'user_current';

    const currentProfile = getRankedProfile(userId);
    const leaderboard = getRankedLeaderboard({ filter, currentProfile });

    return NextResponse.json({
      success: true,
      data: leaderboard,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
