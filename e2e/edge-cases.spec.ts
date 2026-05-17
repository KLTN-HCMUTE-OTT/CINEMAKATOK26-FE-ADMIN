import { test, expect } from './fixtures'

test.describe('Error States', () => {
  test('shows not-found or login for non-existent route', async ({ page }) => {
    await page.goto('/this-page-does-not-exist-xyz')

    await expect(page.getByText(/not found|404|login|sign/i)).toBeVisible({ timeout: 10000 })
  })

  test('navigating to a protected page without auth redirects to login', async ({ page }) => {
    await page.goto('/users')
    await page.waitForURL(/login/, { timeout: 10000 })
    await expect(page).toHaveURL(/login/)
  })

  test('page remains stable after navigating between sections', async ({ authenticatedPage: page }) => {
    await page.goto('/content/movies')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('body')).not.toBeEmpty()

    await page.goto('/users')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('body')).not.toBeEmpty()
  })
})

test.describe('Network Recovery', () => {
  test('login shows error then user can retry', async ({ page }) => {
    await page.goto('/login')

    await page.getByLabel(/email/i).fill('admin@cinema.com')
    await page.getByLabel(/password/i).fill('wrongpassword')
    await page.getByRole('button', { name: /log in/i }).click()

    await expect(page.locator('.MuiAlert-root')).toBeVisible({ timeout: 10000 })

    await page.getByLabel(/email/i).clear()
    await page.getByLabel(/email/i).fill('admin@cinema.com')
    await page.getByLabel(/password/i).clear()
    await page.getByLabel(/password/i).fill('Admin@123')

    const submitButton = page.getByRole('button', { name: /log in/i })
    await expect(submitButton).toBeEnabled()
  })
})

test.describe('Responsive - Mobile', () => {
  test.use({ viewport: { width: 375, height: 812 } })

  test('login page is usable on mobile', async ({ page }) => {
    await page.goto('/login')

    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.getByLabel(/password/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /log in/i })).toBeVisible()

    await page.getByLabel(/email/i).fill('test@test.com')
    await page.getByLabel(/password/i).fill('password')
    await expect(page.getByRole('button', { name: /log in/i })).toBeEnabled()
  })
})

test.describe('Responsive - Tablet', () => {
  test.use({ viewport: { width: 768, height: 1024 } })

  test('dashboard renders correctly on tablet', async ({ authenticatedPage: page }) => {
    await expect(page.getByRole('heading', { name: /overview/i })).toBeVisible()
  })
})
