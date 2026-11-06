import { NextResponse } from 'next/server';
import { submitSpeedBattleAnswer } from '@/lib/ranked/speed-battle-engine';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { roomId, userId, questionIndex, selectedOptionIndex, responseTimeMs } = body;

    if (!roomId || !userId || questionIndex === undefined || selectedOptionIndex === undefined) {
      return NextResponse.json(
        { success: false, error: 'Missing required submission fields' },
        { status: 400 }
      );
    }

    const result = submitSpeedBattleAnswer({
      roomId,
      userId,
      questionIndex: Number(questionIndex),
      selectedOptionIndex: Number(selectedOptionIndex),
      responseTimeMs: Number(responseTimeMs) || 1500,
    });

    return NextResponse.json({
      success: true,
      isCorrect: result.isCorrect,
      pointsAwarded: result.pointsAwarded,
      scoreTick: result.scoreTick,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Submission failed' },
      { status: 500 }
    );
  }
}
