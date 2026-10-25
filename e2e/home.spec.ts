import { expect, test } from '@playwright/test';

test('navigates rooms and operates a light', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Living room', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Turn off Ceiling lights' }).click();
  await expect(page.getByRole('button', { name: 'Turn on Ceiling lights' })).toBeVisible();
  await page.getByRole('button', { name: 'Go to Kitchen' }).click();
  await expect(page.getByRole('button', { name: 'Go to Kitchen' })).toHaveAttribute('aria-current', 'page');
});

test('supports modal keyboard dismissal and expansion', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Open Television details' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.getByRole('button', { name: 'Expand Television' }).click();
  await expect(page.getByRole('slider', { name: 'Television volume' })).toBeVisible();
});

test('composes a light into a lighting group', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Arrange' }).click();
  const handle = await page.getByRole('button', { name: 'Move Reading' }).boundingBox();
  const target = await page.getByTestId('device-living-lights').boundingBox();
  if (!handle || !target) throw new Error('Drag geometry is unavailable');
  await page.mouse.move(handle.x + handle.width / 2, handle.y + handle.height / 2);
  await page.mouse.down();
  await page.mouse.move(handle.x + handle.width / 2 + 20, handle.y + handle.height / 2, { steps: 5 });
  await page.mouse.move(target.x + target.width / 2, target.y + target.height / 2, { steps: 15 });
  await page.mouse.up();
  await expect(page.getByRole('status').filter({ hasText: 'Reading is now grouped with Ceiling lights.' })).toBeVisible();
  await expect(page.getByTestId('device-reading-light')).toHaveCount(0);
});

test('transposes the spatial track in landscape', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 600 });
  await page.goto('/');
  await expect(page.locator('.room-track')).toHaveCSS('flex-direction', 'column');
  await expect(page.locator('#room-living')).toHaveCSS('overflow-x', 'auto');
});

test('keeps the four-column room canvas in portrait', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.locator('.room-track')).toHaveCSS('flex-direction', 'row');
  await expect(page.getByRole('button', { name: 'Turn off Ceiling lights' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
});
