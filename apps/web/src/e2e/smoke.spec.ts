import { expect, test } from '@playwright/test';

test('home page renders discovery surfaces', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /Find the next title/i })).toBeVisible();
  await expect(page.getByRole('link', { name: /Browse movies/i })).toBeVisible();
});
