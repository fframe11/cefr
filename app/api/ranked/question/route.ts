import { NextResponse } from 'next/server';
import { getClientQuestion } from '@/lib/ranked/matchmaking-engine';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const matchId = searchParams.get('matchId');
    const userId = searchParams.get('userId') || 'user_current';

    if (!matchId) {
      return NextResponse.json({ success: false, error: 'matchId is required' }, { status: 400 });
    }

    const question = getClientQuestion(matchId, userId);
    if (!question) {
      return NextResponse.json({ success: false, error: 'Match not found or already completed' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: question });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
