import { test, expect } from './fixtures'

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
  })

  test('login page renders correctly', async ({ page }) => {
    await expect(page.getByText(/welcome to/i)).toBeVisible()
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.getByLabel(/password/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /log in/i })).toBeVisible()
  })

  test('login button is disabled when fields are empty', async ({ page }) => {
    const loginButton = page.getByRole('button', { name: /log in/i })
    await expect(loginButton).toBeDisabled()
  })

  test('login button is enabled when fields are filled', async ({ page }) => {
    await page.getByLabel(/email/i).fill('admin@example.com')
    await page.getByLabel(/password/i).fill('password123')

    const loginButton = page.getByRole('button', { name: /log in/i })
    await expect(loginButton).toBeEnabled()
  })

  test('shows error for invalid credentials', async ({ page }) => {
    await page.getByLabel(/email/i).fill('wrong@example.com')
    await page.getByLabel(/password/i).fill('wrongpassword')
    await page.getByRole('button', { name: /log in/i }).click()

    await expect(page.locator('.MuiAlert-root')).toBeVisible({ timeout: 10000 })
  })

  test('successful login redirects to dashboard', async ({ authenticatedPage }) => {
    await expect(authenticatedPage).not.toHaveURL(/login/)
    await expect(authenticatedPage.getByRole('heading', { name: /overview/i })).toBeVisible()
  })

  test('password visibility toggle works', async ({ page }) => {
    const passwordField = page.getByLabel(/password/i)
    await passwordField.fill('mypassword')

    await expect(passwordField).toHaveAttribute('type', 'password')

    await page.locator('button:has(i.ri-eye-line)').click()
    await expect(passwordField).toHaveAttribute('type', 'text')

    await page.locator('button:has(i.ri-eye-off-line)').click()
    await expect(passwordField).toHaveAttribute('type', 'password')
  })

  test('forgot password link is visible', async ({ page }) => {
    await expect(page.getByText(/forgot password/i)).toBeVisible()
  })
})

test.describe('Protected Routes', () => {
  test('unauthenticated user is redirected to login', async ({ page }) => {
    await page.goto('/')
    await page.waitForURL(/login/, { timeout: 10000 })
    await expect(page).toHaveURL(/login/)
  })

  test('accessing /users without auth redirects to login', async ({ page }) => {
    await page.goto('/users')
    await page.waitForURL(/login/, { timeout: 10000 })
    await expect(page).toHaveURL(/login/)
  })
})
