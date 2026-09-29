import { NextResponse, NextRequest } from 'next/server';
import {
  createDuoStudySession,
  getDuoStudySession,
  submitDuoAnswer,
} from '../../../../lib/gamification/social-engine';
import { updateVocabularyMastery } from '../../../../lib/api/vocabulary-mastery';
import { recordLearningXP } from '../../../../lib/api/gamification';
import { CEFRLevel } from '@/types';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('sessionId');

  if (!sessionId) {
    return NextResponse.json({ success: false, error: 'Missing sessionId' }, { status: 400 });
  }

  const session = getDuoStudySession(sessionId);
  if (!session) {
    return NextResponse.json({ success: false, error: 'Session not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: session });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, hostUserId, partnerUserId, cefrLevel = 'B1', targetExam = 'PET', sessionId, userId, questionIndex, chosenIndex, timeMs } = body;

    if (action === 'create') {
      if (!hostUserId || !partnerUserId) {
        return NextResponse.json({ success: false, error: 'Missing hostUserId or partnerUserId' }, { status: 400 });
      }

      const session = createDuoStudySession(hostUserId, partnerUserId, cefrLevel as CEFRLevel, targetExam);
      return NextResponse.json({ success: true, data: session });
    }

    if (action === 'submit') {
      if (!sessionId || !userId || questionIndex === undefined || chosenIndex === undefined) {
        return NextResponse.json({ success: false, error: 'Missing submit parameters' }, { status: 400 });
      }

      const result = submitDuoAnswer(sessionId, userId, questionIndex, chosenIndex, timeMs || 2000);
      
      // If mistake, feed into spaced-repetition mastery review queue
      if (result.success && result.session && result.isCorrect === false) {
        const question = result.session.questions[questionIndex];
        if (question) {
          try {
            await updateVocabularyMastery({
              vocabulary_id: question.word,
              is_correct: false,
            });
          } catch {
            // Ignore API offline in development/testing
          }
        }
      }

      // If completed, award social study XP
      if (result.success && result.session?.status === 'COMPLETED') {
        try {
          await recordLearningXP({
            userId,
            source: 'competition',
            bonus: 50,
          });
        } catch {
          // Graceful fallback
        }
      }

      return NextResponse.json(result);
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Internal error' }, { status: 500 });
  }
}
