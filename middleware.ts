import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from './lib/supabase/middleware';

export const BLOCKED_BOT_PATTERNS = [
  /GPTBot/i,
  /ChatGPT-User/i,
  /ClaudeBot/i,
  /Claude-Web/i,
  /AnthropicAI/i,
  /Bytespider/i,
  /CCBot/i,
  /PerplexityBot/i,
  /cohere-ai/i,
  /Diffbot/i,
  /FacebookBot/i,
  /Google-Extended/i,
  /Omgilibot/i,
  /Scrapy/i,
  /python-requests/i,
  /aiohttp/i,
  /httpx/i,
  /Go-http-client/i,
  /node-fetch/i,
  /Wget/i,
];

export function isBlockedBot(userAgent: string | null | undefined): boolean {
  if (!userAgent) return false;
  return BLOCKED_BOT_PATTERNS.some((pattern) => pattern.test(userAgent));
}

export async function middleware(request: NextRequest) {
  const userAgent = request.headers.get('user-agent') || '';
  const pathname = request.nextUrl.pathname;

  // 1. Edge Shield: Block AI scrapers and automated crawling tools from API endpoints
  if (pathname.startsWith('/api/') && isBlockedBot(userAgent)) {
    return new NextResponse(
      JSON.stringify({
        error: 'Access denied: automated scraping and AI crawlers are strictly prohibited.',
      }),
      {
        status: 403,
        headers: {
          'content-type': 'application/json',
          'x-robots-tag': 'noindex, nofollow, noai, noimageai',
          'x-content-type-options': 'nosniff',
        },
      }
    );
  }

  // 2. Session refresh and standard middleware pipeline
  const response = await updateSession(request);

  // 3. Inject anti-scraping and defense-in-depth headers
  response.headers.set('X-Robots-Tag', 'noindex, nofollow, noai, noimageai');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
