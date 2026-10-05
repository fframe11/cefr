import { NextRequest, NextResponse } from 'next/server';
import { queryExamUniverse, primeExamCache } from '@/lib/vocabulary/exam-universe';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const searchParams = url.searchParams;

    const q = searchParams.get('q') || undefined;
    const exam = searchParams.get('exam') || undefined;
    const cefr = searchParams.get('cefr') || undefined;
    const pos = searchParams.get('pos') || undefined;
    const topic = searchParams.get('topic') || undefined;
    const dailyOnly = searchParams.get('daily') === 'true' || searchParams.get('daily_only') === 'true';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || searchParams.get('limit') || '25', 10);

    let result = queryExamUniverse({
      q,
      exam,
      cefr,
      pos,
      topic,
      daily_only: dailyOnly,
      page,
      pageSize,
    });

    // In Cloudflare isolate where fs cannot read disk, fetch from env.ASSETS
    if (result.stats.totalExamWords === 0) {
      try {
        const { getCloudflareContext } = await import('@opennextjs/cloudflare');
        const ctx = getCloudflareContext();
        const assets = (ctx as any)?.env?.ASSETS;
        if (assets && typeof assets.fetch === 'function') {
          const assetRes = await assets.fetch(new Request(new URL('/data/vocabulary-exam-compact.json', request.url)));
          if (assetRes.ok) {
            const rawItems = (await assetRes.json()) as any[];
            if (Array.isArray(rawItems) && rawItems.length > 0) {
              primeExamCache(rawItems);
              result = queryExamUniverse({
                q,
                exam,
                cefr,
                pos,
                topic,
                daily_only: dailyOnly,
                page,
                pageSize,
              });
            }
          }
        }
      } catch (cfErr) {
        // Fallback for non-Cloudflare environments
      }
    }

    return NextResponse.json(
      {
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to query exam vocabulary universe',
      },
      { status: 500 }
    );
  }
}
