import { NextResponse, NextRequest } from 'next/server';
import { getInviteInfo } from '../../../../lib/gamification/social-engine';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const userId = searchParams.get('userId') || 'guest_user';

  const invite = getInviteInfo(userId, origin);
  return NextResponse.json({ success: true, data: invite });
}
