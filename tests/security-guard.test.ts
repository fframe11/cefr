import { describe, it, expect } from 'vitest';
import { isBlockedBot, BLOCKED_BOT_PATTERNS } from '../middleware';
import { isInspectionKeyEvent } from '../components/security/AntiTamperGuard';

describe('Edge Anti-Bot & AI Scraper Shield', () => {
  it('blocks known AI crawler User-Agents', () => {
    const aiBots = [
      'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; GPTBot/1.2; +https://openai.com/gptbot)',
      'Mozilla/5.0 (compatible; ClaudeBot/1.0; +https://www.anthropic.com/claudebot)',
      'Bytespider; spider-feedback@bytedance.com',
      'CCBot/2.0 (https://commoncrawl.org/faq/)',
      'Mozilla/5.0 (compatible; PerplexityBot/1.0; +https://perplexity.ai/perplexitybot)',
      'Google-Extended',
      'Scrapy/2.11.0 (+https://scrapy.org)',
      'python-requests/2.31.0',
      'aiohttp/3.9.1',
      'Go-http-client/1.1',
      'Wget/1.21.3',
    ];

    aiBots.forEach((ua) => {
      expect(isBlockedBot(ua), `Expected ${ua} to be blocked`).toBe(true);
    });
  });

  it('allows legitimate human browser User-Agents', () => {
    const browsers = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2.1 Safari/605.1.15',
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1',
    ];

    browsers.forEach((ua) => {
      expect(isBlockedBot(ua), `Expected ${ua} to be allowed`).toBe(false);
    });
  });

  it('gracefully handles empty or missing User-Agent', () => {
    expect(isBlockedBot('')).toBe(false);
    expect(isBlockedBot(null)).toBe(false);
    expect(isBlockedBot(undefined)).toBe(false);
  });
});

describe('AntiTamperGuard Key Deterrent', () => {
  it('detects F12 key press', () => {
    expect(isInspectionKeyEvent({ key: 'F12' })).toBe(true);
  });

  it('detects Ctrl+Shift+I / Cmd+Shift+I (DevTools)', () => {
    expect(isInspectionKeyEvent({ key: 'I', ctrlKey: true, shiftKey: true })).toBe(true);
    expect(isInspectionKeyEvent({ key: 'i', metaKey: true, shiftKey: true })).toBe(true);
  });

  it('detects Ctrl+Shift+J / Cmd+Shift+J (Console)', () => {
    expect(isInspectionKeyEvent({ key: 'J', ctrlKey: true, shiftKey: true })).toBe(true);
    expect(isInspectionKeyEvent({ key: 'j', metaKey: true, shiftKey: true })).toBe(true);
  });

  it('detects Ctrl+Shift+C (Inspect Element)', () => {
    expect(isInspectionKeyEvent({ key: 'C', ctrlKey: true, shiftKey: true })).toBe(true);
  });

  it('detects Ctrl+U (View Source) and Ctrl+S', () => {
    expect(isInspectionKeyEvent({ key: 'U', ctrlKey: true })).toBe(true);
    expect(isInspectionKeyEvent({ key: 'S', ctrlKey: true })).toBe(true);
  });

  it('allows standard typing keys without false positives', () => {
    expect(isInspectionKeyEvent({ key: 'a' })).toBe(false);
    expect(isInspectionKeyEvent({ key: 'Enter' })).toBe(false);
    expect(isInspectionKeyEvent({ key: 'C', ctrlKey: true })).toBe(false); // standard copy
    expect(isInspectionKeyEvent({ key: 'V', ctrlKey: true })).toBe(false); // standard paste
    expect(isInspectionKeyEvent({ key: 'I' })).toBe(false); // normal letter I
  });
});



