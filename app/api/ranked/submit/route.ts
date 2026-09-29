import { NextResponse } from 'next/server';
import { submitRankedAnswer } from '@/lib/ranked/matchmaking-engine';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { matchId, userId = 'user_current', chosenIndex, sessionToken } = body;

    if (!matchId || chosenIndex === undefined || !sessionToken) {
      return NextResponse.json(
        { success: false, error: 'matchId, chosenIndex, and sessionToken are required' },
        { status: 400 }
      );
    }

    const result = submitRankedAnswer(matchId, userId, chosenIndex, sessionToken);
    if (!result) {
      return NextResponse.json(
        { success: false, error: 'Invalid match, expired session, or unauthorized submission' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, data: result });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
