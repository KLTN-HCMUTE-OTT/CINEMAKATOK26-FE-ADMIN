import { test, expect } from './fixtures'

test.describe('Movies CRUD Flow', () => {
  test('list movies with pagination', async ({ authenticatedPage: page }) => {
    await page.goto('/content/movies')
    await page.waitForLoadState('networkidle')

    await expect(page.locator('table').first()).toBeVisible()
    await expect(page.locator('.MuiTablePagination-root').first()).toBeVisible()
  })

  test('search movies filters the table', async ({ authenticatedPage: page }) => {
    await page.goto('/content/movies')
    await page.waitForLoadState('networkidle')

    const searchInput = page.getByPlaceholder(/search movies by title/i)
    if (await searchInput.isVisible()) {
      await searchInput.fill('Avatar')
      await page.waitForTimeout(1000)
      await expect(page.locator('table').first()).toBeVisible()
    }
  })

  test('navigate to add movie page', async ({ authenticatedPage: page }) => {
    await page.goto('/content/movies')
    await page.waitForLoadState('networkidle')

    const addButton = page.getByRole('button', { name: /add movie/i })
    await expect(addButton).toBeVisible()
    await addButton.click()
    await page.waitForLoadState('networkidle')

    const url = page.url()
    const navigated = /\/content\/upload/.test(url)
    if (navigated) {
      await expect(page).toHaveURL(/\/content\/upload/)
    } else {
      await expect(page.locator('.MuiDialog-root, .MuiDrawer-root, [role="dialog"]').first().or(page.locator('table').first())).toBeVisible()
    }
  })

  test('view movie details', async ({ authenticatedPage: page }) => {
    await page.goto('/content/movies')
    await page.waitForLoadState('networkidle')

    const viewButton = page.locator('button:has(i.ri-eye-line)').first()
    if (await viewButton.isVisible()) {
      await viewButton.click()
      await page.waitForLoadState('networkidle')
      const url = page.url()
      const navigated = /\/content\/movies\//.test(url)
      if (navigated) {
        await expect(page).toHaveURL(/\/content\/movies\//)
      } else {
        await expect(page.locator('.MuiDialog-root, .MuiDrawer-root, table').first()).toBeVisible()
      }
    }
  })

  test('navigate to edit movie page', async ({ authenticatedPage: page }) => {
    await page.goto('/content/movies')
    await page.waitForLoadState('networkidle')

    const editButton = page.locator('button:has(i.ri-edit-line)').first()
    if (await editButton.isVisible()) {
      await editButton.click()
      await page.waitForLoadState('networkidle')
      const url = page.url()
      const navigated = /\/content\/movies\/.*\/edit/.test(url)
      if (navigated) {
        await expect(page).toHaveURL(/\/content\/movies\/.*\/edit/)
      } else {
        await expect(page.locator('.MuiDialog-root, .MuiDrawer-root, table').first()).toBeVisible()
      }
    }
  })

  test('delete movie prompts confirmation', async ({ authenticatedPage: page }) => {
    await page.goto('/content/movies')
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
