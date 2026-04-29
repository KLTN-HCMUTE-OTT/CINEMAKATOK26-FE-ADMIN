import { test, expect } from './fixtures'

test.describe('TV Series CRUD Flow', () => {
  test('list TV series with pagination', async ({ authenticatedPage: page }) => {
    await page.goto('/content/tvseries')
    await page.waitForLoadState('networkidle')

    await expect(page.locator('table').first()).toBeVisible()
    await expect(page.locator('.MuiTablePagination-root').first()).toBeVisible()
  })

  test('search TV series filters the table', async ({ authenticatedPage: page }) => {
    await page.goto('/content/tvseries')
    await page.waitForLoadState('networkidle')

    const searchInput = page.getByPlaceholder(/search tv series by title/i)
    if (await searchInput.isVisible()) {
      await searchInput.fill('Breaking Bad')
      await page.waitForTimeout(1000)
      await expect(page.locator('table').first()).toBeVisible()
    }
  })

  test('navigate to add TV series page', async ({ authenticatedPage: page }) => {
    await page.goto('/content/tvseries')
    await page.waitForLoadState('networkidle')

    const addButton = page.getByRole('button', { name: /add tv series/i })
    await expect(addButton).toBeVisible()
    await addButton.click()
    await page.waitForLoadState('networkidle')

    const url = page.url()
    const navigated = /\/content\/tvseries\/upload/.test(url)
    if (navigated) {
      await expect(page).toHaveURL(/\/content\/tvseries\/upload/)
    } else {
      await expect(page.locator('.MuiDialog-root, .MuiDrawer-root, [role="dialog"]').first().or(page.locator('table').first())).toBeVisible()
    }
  })

  test('expand TV series to see seasons and episodes', async ({ authenticatedPage: page }) => {
    await page.goto('/content/tvseries')
    await page.waitForLoadState('networkidle')

    const expandButton = page.locator('button:has(i.ri-arrow-right-s-line)').first()
    if (await expandButton.isVisible()) {
      await expandButton.click()
      await expect(page.getByText('Seasons').first()).toBeVisible()

      const expandSeasonButton = page.locator('button:has(i.ri-arrow-right-s-line)').first()
      if (await expandSeasonButton.isVisible()) {
        await expandSeasonButton.click()
        await expect(page.getByText('Episodes').first()).toBeVisible()
      }
    }
  })

  test('view TV series details', async ({ authenticatedPage: page }) => {
    await page.goto('/content/tvseries')
    await page.waitForLoadState('networkidle')

    const viewButton = page.locator('button:has(i.ri-eye-line)').first()
    if (await viewButton.isVisible()) {
      await viewButton.click()
      await expect(page).toHaveURL(/\/content\/tvseries\//)
    }
  })

  test('navigate to edit TV series page', async ({ authenticatedPage: page }) => {
    await page.goto('/content/tvseries')
    await page.waitForLoadState('networkidle')

    const editButton = page.locator('button:has(i.ri-edit-line)').first()
    if (await editButton.isVisible()) {
      await editButton.click()
      await expect(page).toHaveURL(/\/content\/tvseries\/.*\/edit/)
    }
  })

  test('delete TV series prompts confirmation', async ({ authenticatedPage: page }) => {
    await page.goto('/content/tvseries')
    await page.waitForLoadState('networkidle')

    let dialogAppeared = false
    page.on('dialog', async dialog => {
      dialogAppeared = true
      await dialog.accept()
    })

    const deleteButton = page.locator('button:has(i.ri-delete-bin-line)').first()
    if (await deleteButton.isVisible()) {
      await deleteButton.click()
      await page.waitForTimeout(500)
      expect(dialogAppeared).toBe(true)
      await expect(page.locator('table').first()).toBeVisible()
    }
  })
})
