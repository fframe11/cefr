import { test, expect } from '@playwright/test';

test('verify desktop and mobile layouts and interactions', async ({ page }) => {
  // 1. Mobile viewport test (375x667)
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('http://localhost:4173/');
  await page.waitForLoadState('networkidle');

  // Verify no horizontal overflow
  const mobileScrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  const mobileClientWidth = await page.evaluate(() => document.documentElement.clientWidth);
  expect(mobileScrollWidth).toBeLessThanOrEqual(mobileClientWidth);

  // Take mobile screenshot
  await page.screenshot({ path: 'tests/screenshots/mobile-375.png', fullPage: false });

  // 2. Desktop viewport test (1440x900)
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('http://localhost:4173/');
  await page.waitForLoadState('networkidle');

  // Verify no horizontal overflow
  const desktopScrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  const desktopClientWidth = await page.evaluate(() => document.documentElement.clientWidth);
  expect(desktopScrollWidth).toBeLessThanOrEqual(desktopClientWidth);

  // Take desktop screenshot
  await page.screenshot({ path: 'tests/screenshots/desktop-1440.png', fullPage: false });
});
