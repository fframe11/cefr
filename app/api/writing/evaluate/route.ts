import { NextRequest, NextResponse } from 'next/server';
import { evaluateWritingSubmission } from '@/lib/writing/aes-engine';
import { evaluateEssay, EssayEvaluationError } from '@/lib/writing/evaluator';
import { CEFRLevel } from '@/types';
import { CEFRBand } from '@/lib/writing/types';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Content-Type must be application/json',
          errorTh: 'รูปแบบข้อมูลต้องเป็น application/json',
        },
        { status: 400 }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid or empty JSON body',
          errorTh: 'ข้อมูลคำขอไม่ถูกต้องหรือว่างเปล่า',
        },
        { status: 400 }
      );
    }

    // Format 1: evaluateEssay / Notion Cambridge Rubric contract (prompt_id, submission_text)
    if (typeof body.submission_text === 'string') {
      const submissionText = body.submission_text.trim();
      if (!submissionText || submissionText.length < 15) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'BAD_REQUEST',
              message: 'submission_text is required and must be at least 15 characters long.',
            },
          },
          { status: 400 }
        );
      }

      const evaluation = evaluateEssay({
        prompt_id: String(body.prompt_id || 'custom-prompt'),
        essay_type: body.essay_type,
        target_cefr: (body.target_cefr as CEFRBand) || 'B2',
        submission_text: submissionText,
        min_words: typeof body.min_words === 'number' ? body.min_words : 50,
        max_words: typeof body.max_words === 'number' ? body.max_words : 300,
      });

      return NextResponse.json(
        {
          success: true,
          data: evaluation,
        },
        {
          status: 200,
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate',
          },
        }
      );
    }

    // Format 2: evaluateWritingSubmission / AES Engine contract (text, promptId)
    const text = typeof body.text === 'string' ? body.text.trim() : '';
    if (text.length < 15) {
      return NextResponse.json(
        {
          success: false,
          error: 'Text is required and must be at least 15 characters long.',
          errorTh: 'กรุณากรอกข้อความงานเขียนอย่างน้อย 15 ตัวอักษรเพื่อรับการประเมิน',
        },
        { status: 400 }
      );
    }

    const {
      promptId,
      targetCefr,
      minWords,
      maxWords,
      topic,
      promptTitle,
    } = body;

    const result = evaluateWritingSubmission(text, {
      promptId: promptId || 'custom-writing',
      targetCefr: (targetCefr as CEFRLevel) || 'B2',
      minWords: typeof minWords === 'number' ? minWords : 100,
      maxWords: typeof maxWords === 'number' ? maxWords : 300,
      topic: topic || '',
      promptTitle: promptTitle || '',
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: unknown) {
    if (error instanceof EssayEvaluationError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: error.code === 'TOO_SHORT' ? 'WORD_COUNT_TOO_LOW' : 'BAD_REQUEST',
            message: error.message,
          },
        },
        { status: 400 }
      );
    }

    const errorMessage = error instanceof Error ? error.message : 'Internal server error while evaluating writing submission.';
    console.error('[API /api/writing/evaluate error]:', error);
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        errorTh: 'เกิดข้อผิดพลาดในการประเมินผลงานเขียน กรุณาลองใหม่อีกครั้ง',
      },
      { status: 500 }
    );
  }
}
