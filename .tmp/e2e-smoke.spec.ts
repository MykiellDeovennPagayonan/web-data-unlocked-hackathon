import { test, expect } from 'playwright/test';

test('smoke', async ({ page }) => {
  await page.goto('data:text/html,<h1>ok</h1>');
  await expect(page.getByRole('heading', { name: 'ok' })).toBeVisible();
});
