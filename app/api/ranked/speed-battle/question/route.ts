import { NextResponse } from 'next/server';
import { getClientNextQuestion } from '@/lib/ranked/speed-battle-engine';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get('roomId');
    const userId = searchParams.get('userId');

    if (!roomId || !userId) {
      return NextResponse.json(
        { success: false, error: 'roomId and userId are required' },
        { status: 400 }
      );
    }

    const question = getClientNextQuestion(roomId, userId);
    if (!question) {
      return NextResponse.json(
        { success: false, error: 'Question not found or match concluded' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      question,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch question' },
      { status: 500 }
    );
  }
}
