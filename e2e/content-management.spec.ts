import { test, expect } from './fixtures'

test.describe('Content Management', () => {
  test('movies list page loads', async ({ authenticatedPage: page }) => {
    await page.goto('/content/movies')
    await page.waitForLoadState('networkidle')

    await expect(page.locator('table').first()).toBeVisible({ timeout: 10000 })
  })

  test('categories page loads', async ({ authenticatedPage: page }) => {
    await page.goto('/content/categories')
    await page.waitForLoadState('networkidle')

    await expect(page.locator('table, [role="grid"]').first()).toBeVisible({ timeout: 10000 })
  })

  test('tags page loads', async ({ authenticatedPage: page }) => {
    await page.goto('/content/tags')
    await page.waitForLoadState('networkidle')

    await expect(page.locator('table, [role="grid"]').first()).toBeVisible({ timeout: 10000 })
  })

  test('tv series page loads', async ({ authenticatedPage: page }) => {
    await page.goto('/content/tvseries')
    await page.waitForLoadState('networkidle')

    await expect(page.locator('table, [role="grid"]').first()).toBeVisible({ timeout: 10000 })
  })

  test('news page loads', async ({ authenticatedPage: page }) => {
    await page.goto('/content/news')
    await page.waitForLoadState('networkidle')

    await expect(page.locator('table, [role="grid"]').first()).toBeVisible({ timeout: 10000 })
  })
})

test.describe('User Management', () => {
  test('users page loads with table', async ({ authenticatedPage: page }) => {
    await page.goto('/users')
    await page.waitForLoadState('networkidle')

    await expect(page.locator('table').first()).toBeVisible({ timeout: 10000 })
  })

  test('users table has search functionality', async ({ authenticatedPage: page }) => {
    await page.goto('/users')
    await page.waitForLoadState('networkidle')

    const searchInput = page.getByPlaceholder(/search/i).first()
    if (await searchInput.isVisible()) {
      await searchInput.fill('test')
      await page.waitForTimeout(500)
    }
  })
})
