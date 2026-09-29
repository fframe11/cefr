import { NextResponse, NextRequest } from 'next/server';
import {
  getUserSocialSummary,
  searchPublicLearners,
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  removeFriend,
} from '../../../../lib/gamification/social-engine';
import { updateAchievementProgress } from '../../../../lib/gamification/achievements';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId') || 'guest_user';
  const query = searchParams.get('search');

  if (query !== null) {
    const searchResults = searchPublicLearners(query, userId);
    return NextResponse.json({ success: true, data: searchResults });
  }

  const summary = getUserSocialSummary(userId);
  return NextResponse.json({ success: true, data: summary });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, userId, targetUserId, requestId } = body;

    if (!userId) {
      return NextResponse.json({ success: false, error: 'Missing userId' }, { status: 400 });
    }

    if (action === 'send') {
      const res = sendFriendRequest(userId, targetUserId);
      return NextResponse.json(res);
    }

    if (action === 'accept') {
      const res = acceptFriendRequest(userId, requestId);
      if (res.success) {
        updateAchievementProgress(userId, 'SOCIAL_BUTTERFLY', 1);
      }
      return NextResponse.json(res);
    }

    if (action === 'decline') {
      const res = declineFriendRequest(userId, requestId);
      return NextResponse.json(res);
    }

    if (action === 'remove') {
      const res = removeFriend(userId, targetUserId);
      return NextResponse.json(res);
    }

    return NextResponse.json({ success: false, error: 'Invalid social action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Social action failed' }, { status: 500 });
  }
}
