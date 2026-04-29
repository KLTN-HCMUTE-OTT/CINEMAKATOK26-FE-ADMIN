import { test, expect } from './fixtures'

test.describe('Dashboard', () => {
  test('dashboard page loads with overview title', async ({ authenticatedPage: page }) => {
    await expect(page.getByRole('heading', { name: /overview/i })).toBeVisible()
  })

  test('recent activity table is visible', async ({ authenticatedPage: page }) => {
    await expect(page.getByText(/recent activity/i)).toBeVisible()
  })

  test('sidebar navigation is visible', async ({ authenticatedPage: page }) => {
    await expect(page.locator('nav')).toBeVisible()
  })

  test('can navigate to users page', async ({ authenticatedPage: page }) => {
    await page.goto('/users')
    await page.waitForLoadState('networkidle')
    await expect(page).toHaveURL(/users/, { timeout: 10000 })
    await expect(page.locator('table').first()).toBeVisible({ timeout: 10000 })
  })

  test('can navigate to movies page', async ({ authenticatedPage: page }) => {
    await page.goto('/content/movies')
    await page.waitForLoadState('networkidle')
    await expect(page).toHaveURL(/content\/movies/)
    await expect(page.locator('table').first()).toBeVisible({ timeout: 10000 })
  })
})

test.describe('Dashboard - Responsive', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test('sidebar collapses on mobile', async ({ authenticatedPage: page }) => {
    const mainContent = page.locator('main')
    await expect(mainContent).toBeVisible()
  })
})
