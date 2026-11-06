import { NextResponse } from 'next/server';
import { checkSpeedBattleHeartbeat } from '@/lib/ranked/speed-battle-engine';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { roomId, userId } = body;

    if (!roomId || !userId) {
      return NextResponse.json(
        { success: false, error: 'roomId and userId are required' },
        { status: 400 }
      );
    }

    const result = checkSpeedBattleHeartbeat(roomId, userId);

    if (!result.room) {
      return NextResponse.json({
        success: true,
        isDisconnected: true,
        isWalkoverWin: false,
        state: 'ROUND_ENDED',
        scores: { player_1: 0, player_2: 0 },
      });
    }

    return NextResponse.json({
      success: true,
      isDisconnected: result.isDisconnected,
      isWalkoverWin: result.isWalkoverWin,
      state: result.room.state,
      scores: {
        player_1: result.room.player1Score,
        player_2: result.room.player2Score,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Heartbeat check failed' },
      { status: 500 }
    );
  }
}
