import { NextResponse } from 'next/server';
import {
  enqueueSpeedBattlePlayer,
  pollSpeedBattleQueue,
  cancelSpeedBattleQueue,
} from '@/lib/ranked/speed-battle-engine';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const action = body.action || 'enqueue';
    const userId = body.userId || `user_${Math.random().toString(36).substring(2, 8)}`;
    const username = body.username || 'Learner';
    const avatarUrl = body.avatarUrl || '/avatars/default.png';
    const elo = Number(body.elo) || 1000;

    if (action === 'cancel') {
      const cancelled = cancelSpeedBattleQueue(userId);
      return NextResponse.json({ success: true, cancelled });
    }

    if (action === 'poll') {
      const pollResult = pollSpeedBattleQueue(userId);
      return NextResponse.json({
        success: true,
        status: pollResult.status,
        matchEvent: pollResult.matchEvent,
      });
    }

    // Default action: enqueue
    const queueResult = enqueueSpeedBattlePlayer({
      userId,
      username,
      avatarUrl,
      elo,
    });

    return NextResponse.json({
      success: true,
      status: queueResult.status,
      matchEvent: queueResult.matchEvent,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Matchmaking failed' },
      { status: 500 }
    );
  }
}
