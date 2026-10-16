import { test, expect, devices } from '@playwright/test';

test('desktop entry hides the phone before the lazy web screen loads', async ({ page }) => {
  let releaseWeb!: () => void;
  const webGate = new Promise<void>(resolve => { releaseWeb = resolve; });
  let webRequested!: () => void;
  const requested = new Promise<void>(resolve => { webRequested = resolve; });
  await page.route('**/src/WebOnboarding.tsx', async route => {
    webRequested();
    await webGate;
    await route.continue();
  });
  try {
    await page.goto('/?teacher=0&campaign=test#setup', { waitUntil: 'domcontentloaded' });
    await requested;
    await expect(page.locator('html')).toHaveAttribute('data-app-view', 'web');
    await expect(page.locator('#root')).toBeHidden();
    await expect(page.locator('.phone-stage')).toBeHidden();
    expect(new URL(page.url()).searchParams.get('campaign')).toBe('test');
    expect(new URL(page.url()).hash).toBe('#setup');
  } finally {
    releaseWeb();
  }
  await expect(page.getByTestId('web-onboarding-current')).toBeVisible();
  await page.getByRole('button', { name: 'Get started', exact: true }).click();
  await expect(page.getByTestId('web-onboarding-current')).toHaveAttribute('data-web-step', 'greeting');
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByTestId('web-onboarding-current')).toHaveAttribute('data-web-step', 'greeting');
  await page.getByRole('link', { name: 'Try the mobile preview' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-app-view', 'mobile');
  await expect(page.locator('.phone-stage')).toBeVisible();
});

test('phone entry selects mobile and respects explicit web override', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ ...devices['iPhone 13'], baseURL });
  const page = await context.newPage();
  try {
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('data-app-view', 'mobile');
    await expect(page.locator('.phone-stage')).toBeVisible();
    await page.goto('/?view=web');
    await expect(page.getByTestId('web-onboarding-current')).toBeVisible();
    await expect(page.locator('.phone-stage')).toBeHidden();
  } finally {
    await context.close();
  }
});

test('teacher entry selects desktop and keeps the explicit mobile workspace link', async ({ page }) => {
  await page.goto('/?teacher=1');
  await expect(page.locator('.teacher-web')).toBeVisible();
  await page.locator('.tw-device-link').click();
  await expect(page.locator('.teacher-mobile')).toBeVisible();
  expect(new URL(page.url()).searchParams.get('view')).toBe('mobile');
});
