import { NextResponse } from 'next/server';
import { finalizeSpeedBattleMatch } from '@/lib/ranked/speed-battle-engine';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { roomId } = body;

    if (!roomId) {
      return NextResponse.json(
        { success: false, error: 'roomId is required' },
        { status: 400 }
      );
    }

    const roundEndedEvent = finalizeSpeedBattleMatch(roomId);

    return NextResponse.json({
      success: true,
      event: roundEndedEvent,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Match finalization failed' },
      { status: 500 }
    );
  }
}
