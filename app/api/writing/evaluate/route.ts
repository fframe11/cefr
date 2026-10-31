import { NextRequest, NextResponse } from 'next/server';
import { evaluateWritingSubmission } from '@/lib/writing/aes-engine';
import { CEFRLevel } from '@/types';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    if (!body || typeof body.text !== 'string' || body.text.trim().length < 15) {
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
      text,
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
  } catch (error: any) {
    console.error('[API /api/writing/evaluate error]:', error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Internal server error while evaluating writing submission.',
        errorTh: 'เกิดข้อผิดพลาดในการประเมินผลงานเขียน กรุณาลองใหม่อีกครั้ง',
      },
      { status: 500 }
    );
  }
}
