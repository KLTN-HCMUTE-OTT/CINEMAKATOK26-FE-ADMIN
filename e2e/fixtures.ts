import { test as base, expect, Page } from '@playwright/test'

const TEST_EMAIL = process.env.TEST_ADMIN_EMAIL
const TEST_PASSWORD = process.env.TEST_ADMIN_PASSWORD
const hasCredentials = !!(TEST_EMAIL && TEST_PASSWORD)

async function loginAs(page: Page) {
  const maxAttempts = 3

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    await page.goto('/login')
    await page.waitForLoadState('networkidle')
    await page.getByLabel(/email/i).fill(TEST_EMAIL!)
    await page.getByLabel(/password/i).fill(TEST_PASSWORD!)
    await page.getByRole('button', { name: /log in/i }).click()

    try {
      await page.waitForURL(url => !url.toString().includes('/login'), {
        timeout: 20000
      })
      return
    } catch {
      if (attempt === maxAttempts) throw new Error(`Login failed after ${maxAttempts} attempts`)
      await page.waitForTimeout(2000)
    }
  }
}

export const test = base.extend<{ authenticatedPage: Page }>({
  authenticatedPage: async ({ page }, use, testInfo) => {
    if (!hasCredentials) {
      testInfo.skip(true, 'Requires TEST_ADMIN_EMAIL and TEST_ADMIN_PASSWORD env vars')
    }
    await loginAs(page)
    await use(page)
  }
})

export { expect }
