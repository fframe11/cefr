import { NextResponse, NextRequest } from 'next/server';
import { toggleFollowUser } from '../../../../lib/gamification/social-engine';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, targetUserId } = body;

    if (!userId || !targetUserId) {
      return NextResponse.json({ success: false, error: 'Missing userId or targetUserId' }, { status: 400 });
    }

    const result = toggleFollowUser(userId, targetUserId);
    return NextResponse.json({ success: true, data: result });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Failed to toggle follow' }, { status: 500 });
  }
}
