import { NextResponse } from 'next/server';
import { getRankedProfile } from '@/lib/ranked/user-profile-store';
import { getTierFromRating, getDivisionProgress } from '@/lib/ranked/rating-engine';
import { CURRENT_SEASON } from '@/lib/ranked/season-engine';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'user_current';

    const profile = getRankedProfile(userId);
    const tierInfo = getTierFromRating(profile.rating);
    const progress = getDivisionProgress(profile.rating);

    return NextResponse.json({
      success: true,
      data: {
        profile,
        tierInfo,
        progress,
        season: CURRENT_SEASON,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
