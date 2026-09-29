import { NextResponse, NextRequest } from 'next/server';
import { submitCompetitionAnswer } from '../../../../lib/gamification/competition-engine';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, userId, questionId, selectedOption } = body;

    if (!sessionId || !userId || !questionId || !selectedOption) {
      return NextResponse.json(
        { success: false, error: 'Missing required answer parameters' },
        { status: 400 }
      );
    }

    const result = submitCompetitionAnswer({
      sessionId,
      userId,
      questionId,
      selectedOption,
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (err: any) {
    const isClientError =
      err?.message?.includes('Replay') ||
      err?.message?.includes('not found') ||
      err?.message?.includes('unauthorized');

    return NextResponse.json(
      { success: false, error: err?.message || 'Answer submission failed' },
      { status: isClientError ? 400 : 500 }
    );
  }
}
