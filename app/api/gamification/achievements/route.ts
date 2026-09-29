import { NextResponse, NextRequest } from 'next/server';
import { getUserAchievements } from '../../../../lib/gamification/achievements';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId') || 'guest_user';

  const achievements = getUserAchievements(userId);
  return NextResponse.json({ success: true, data: achievements });
}
