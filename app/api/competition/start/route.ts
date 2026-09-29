import { NextResponse, NextRequest } from 'next/server';
import { startCompetitionSession } from '../../../../lib/gamification/competition-engine';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const userId = body.userId || 'guest_user';

    const result = startCompetitionSession(userId);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to start competition' },
      { status: 500 }
    );
  }
}
