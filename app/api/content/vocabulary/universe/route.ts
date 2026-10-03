import { NextRequest, NextResponse } from 'next/server';
import { queryExtendedUniverse, VocabTier } from '@/lib/vocabulary/extended-universe';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const q = searchParams.get('q') || undefined;
    const cefr = searchParams.get('cefr') || undefined;
    const pos = searchParams.get('pos') || undefined;
    const tier = (searchParams.get('tier') as VocabTier) || undefined;
    const domain = searchParams.get('domain') || undefined;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || searchParams.get('limit') || '25', 10);

    const result = queryExtendedUniverse({
      q,
      cefr,
      pos,
      tier,
      domain,
      page,
      pageSize,
    });

    return NextResponse.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to query extended vocabulary universe',
      },
      { status: 500 }
    );
  }
}
