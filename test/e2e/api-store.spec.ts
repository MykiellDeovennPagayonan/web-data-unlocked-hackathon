import { test, expect } from '@playwright/test'
import { API_STORE } from './fixtures/test-data'
import { signupOrganization, signupIndividual, login, logout, waitForUrl } from './utils/helpers'
import { cleanupAll } from './utils/cleanup'

test.describe('API Store E2E Flow', () => {
  test.beforeAll(async () => {
    await cleanupAll()
  })

  test.afterAll(async () => {
    await cleanupAll()
  })

  test('full user flow: org creates endpoint, individual uses API, org sees usage', async ({ page }) => {
    // ========== ORGANIZATION FLOW ==========
    // 1. Navigate to org signup
    await page.goto(`${API_STORE.url}/signup/organization`)
    await expect(page.locator('text=Create Organization Account').first()).toBeVisible()

    // 2. Fill organization signup form
    await signupOrganization(page, API_STORE.organization)
    await waitForUrl(page, '/login')
    await expect(page.locator('text=Organization account created successfully').first()).toBeVisible()

    // 3. Login as organization
    await login(page, API_STORE.organization.email, API_STORE.organization.password)
    await waitForUrl(page, '/dashboard')
    await expect(page.locator('text=Organization Dashboard').first()).toBeVisible()
    await expect(page.locator('text=Test Org API').first()).toBeVisible()

    // 4. Create a new endpoint
    await page.click('text=New Endpoint')
    await waitForUrl(page, '/endpoints/new')
    await expect(page.locator('text=Create Endpoint').first()).toBeVisible()

    await page.fill('input[name="name"]', API_STORE.endpoint.name)
    await page.fill('textarea[name="description"]', API_STORE.endpoint.description)
    await page.fill('input[name="forwardUrl"]', API_STORE.endpoint.forwardUrl)
    await page.selectOption('select[name="method"]', API_STORE.endpoint.method)
    await page.fill('input[name="pricePer1k"]', String(API_STORE.endpoint.pricePer1k))
    await page.click('button:has-text("Create Endpoint")')
    await waitForUrl(page, '/endpoints')

    // 5. Logout
    await logout(page)
    await waitForUrl(page, '/login')
    await expect(page.locator('text=Sign In').first()).toBeVisible()

    // ========== INDIVIDUAL FLOW ==========
    // 6. Navigate to individual signup
    await page.goto(`${API_STORE.url}/signup`)
    await expect(page.locator('text=Create Account').first()).toBeVisible()

    // 7. Fill individual signup form
    await signupIndividual(page, API_STORE.individual)
    await waitForUrl(page, '/login')
    await expect(page.locator('text=Account created successfully').first()).toBeVisible()

    // 8. Login as individual
    await login(page, API_STORE.individual.email, API_STORE.individual.password)
    await waitForUrl(page, '/dashboard')
    await expect(page.locator('text=My Dashboard').first()).toBeVisible()
    await expect(page.locator('text=Test User API').first()).toBeVisible()

    // 9. Generate API key
    await page.click('button:has-text("Generate API Key")')
    await expect(page.locator('code')).toBeVisible()
    const apiKeyText = await page.locator('code').textContent()
    expect(apiKeyText).toBeTruthy()
    expect(apiKeyText!.length).toBeGreaterThan(10)

    // 10. Navigate to marketplace
    await page.click('text=Marketplace')
    await waitForUrl(page, '/marketplace')
    await expect(page.locator('text=API Marketplace').first()).toBeVisible()

    // 11. Click Try it on the Test Hello Endpoint card
    const helloCard = page.locator('div.rounded-xl').filter({ hasText: 'Test Hello Endpoint' }).first()
    await helloCard.locator('a:has-text("Try it")').click()
    await expect(page.locator('text=Test Endpoint').first()).toBeVisible()

    // 12. Copy proxy URL on the Try API page
    await page.click('button:has-text("Copy Proxy URL")')
    // Clipboard API may fail in headless browsers; just verify the button was clickable

    // 13. Run request via Try API page
    await page.selectOption('select', API_STORE.endpoint.method)
    await page.click('button:has-text("Run")')
    await expect(page.locator('text=Response').first()).toBeVisible()
    await expect(page.locator('text=200').first()).toBeVisible()

    // 14. Navigate to credits and top up
    await page.click('text=Credits')
    await waitForUrl(page, '/credits')
    await expect(page.locator('text=Credit Balance').first()).toBeVisible()

    await page.click('button:has-text("$10")')
    await page.click('button:has-text("Top Up")')
    await expect(page.locator('text=$10.0000').first()).toBeVisible()

    // 15. Logout
    await logout(page)
    await waitForUrl(page, '/login')
    await expect(page.locator('text=Sign In').first()).toBeVisible()

    // ========== ORGANIZATION RE-LOGIN ==========
    // 16. Login as organization again
    await login(page, API_STORE.organization.email, API_STORE.organization.password)
    await waitForUrl(page, '/dashboard')
    await expect(page.locator('text=Organization Dashboard').first()).toBeVisible()

    // 17. Verify usage stats show calls
    await expect(page.locator('text=Total API Calls').first()).toBeVisible()

    // 18. Final logout
    await logout(page)
    await waitForUrl(page, '/login')
  })
})
