import { test, expect } from '@playwright/test'

test('top page loads with app title', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('link', { name: 'B-Routes' })).toBeVisible()
})
