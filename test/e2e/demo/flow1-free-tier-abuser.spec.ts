import { test, expect } from '@playwright/test'
import { FLOW1 } from '../lib/flow1-data'
import { API_STORE, JOB_BOARD } from '../fixtures/test-data'
import {
  signupIndividual,
  login,
  logout,
  waitForUrl,
} from '../utils/helpers'
import { cleanupAll } from '../utils/cleanup'
import { seedFlow1 } from '../lib/seed-flow1'

const API_STORE_URL = API_STORE.url
const JOB_BOARD_URL = JOB_BOARD.url

test.describe('Flow 1: Free-Tier Abuser', () => {
  test.beforeAll(async () => {
    await cleanupAll()
  })

  test.afterAll(async () => {
    await cleanupAll()
  })

  test('full flow: seed, 4 API Store accounts, then Job Board progressive throttle', async ({ page }) => {
    // ========== SEED: API Store Org + Endpoint, Job Board Org + Jobs (via API) ==========
    const { endpointId, jobId1, jobId2 } = await seedFlow1()

    // ========== ACCOUNT 1: Alex Morgan — 3 API calls, all succeed ==========
    const alex = FLOW1.abusers[0]
    await page.goto(`${API_STORE_URL}/signup`)
    await expect(page.locator('text=Create Account').first()).toBeVisible()
    await signupIndividual(page, { ...alex, password: FLOW1.apiStoreOrg.password })
    await waitForUrl(page, '/login')
    await expect(page.locator('text=Account created successfully').first()).toBeVisible()

    await login(page, alex.email, FLOW1.apiStoreOrg.password)
    await waitForUrl(page, '/dashboard')
    await expect(page.locator('text=My Dashboard').first()).toBeVisible()

    // Generate API key
    await page.goto(`${API_STORE_URL}/keys`)
    await expect(page.locator('text=API Key').first()).toBeVisible()
    await page.click('button:has-text("Generate API Key")')
    await expect(page.locator('code.truncate')).toBeVisible()

    // Navigate to endpoint Try API page
    await page.goto(`${API_STORE_URL}/marketplace`)
    await expect(page.locator('text=API Marketplace').first()).toBeVisible()
    const card = page.locator('div.rounded-xl').filter({ hasText: FLOW1.endpoint.name }).first()
    await expect(card).toBeVisible()
    await card.locator('text=Try it').click()
    await expect(page.locator(`text=${FLOW1.endpoint.name}`).first()).toBeVisible()
    await expect(page.locator('select[aria-label="HTTP method"]')).toHaveValue('GET')

    for (let i = 0; i < 25; i++) {
      await page.click('button:has-text("Run Request")')
      await expect(page.locator('text=Response').first()).toBeVisible()
      await expect(page.locator('text=200').first()).toBeVisible()
      // Wait for button to become enabled again before next click
      await expect(page.locator('button:has-text("Run Request")')).toBeEnabled()
    }

    await logout(page)
    await waitForUrl(page, '/login')

    const jordan = FLOW1.abusers[1]
    await page.goto(`${API_STORE_URL}/signup`)
    await expect(page.locator('text=Create Account').first()).toBeVisible()
    await signupIndividual(page, { ...jordan, password: FLOW1.apiStoreOrg.password })
    await waitForUrl(page, '/login')

    await login(page, jordan.email, FLOW1.apiStoreOrg.password)
    await waitForUrl(page, '/dashboard')

    // Generate key, navigate to endpoint
    await page.goto(`${API_STORE_URL}/keys`)
    await page.click('button:has-text("Generate API Key")')
    await expect(page.locator('code.truncate')).toBeVisible()

    await page.goto(`${API_STORE_URL}/marketplace`)
    const card2 = page.locator('div.rounded-xl').filter({ hasText: FLOW1.endpoint.name }).first()
    await card2.locator('text=Try it').click()
    await expect(page.locator(`text=${FLOW1.endpoint.name}`).first()).toBeVisible()
    await expect(page.locator('select[aria-label="HTTP method"]')).toHaveValue('GET')

    // Make 25 API calls (all free for trusted accounts)
    for (let i = 0; i < 25; i++) {
      await page.click('button:has-text("Run Request")')
      await expect(page.locator('text=Response').first()).toBeVisible()
      await expect(page.locator('text=200').first()).toBeVisible()
      // Wait for button to become enabled again before next click
      await expect(page.locator('button:has-text("Run Request")')).toBeEnabled()
    }

    await logout(page)
    await waitForUrl(page, '/login')

    // ========== ACCOUNT 3: Taylor Reed — rapid API abuse triggers trust score drop ==========
    const taylor = FLOW1.abusers[2]
    await page.goto(`${API_STORE_URL}/signup`)
    await expect(page.locator('text=Create Account').first()).toBeVisible()
    await signupIndividual(page, { ...taylor, password: FLOW1.apiStoreOrg.password })
    await waitForUrl(page, '/login')

    await login(page, taylor.email, FLOW1.apiStoreOrg.password)
    await waitForUrl(page, '/dashboard')

    // Generate key, navigate to endpoint
    await page.goto(`${API_STORE_URL}/keys`)
    await page.click('button:has-text("Generate API Key")')
    await expect(page.locator('code.truncate')).toBeVisible()

    await page.goto(`${API_STORE_URL}/marketplace`)
    const card3 = page.locator('div.rounded-xl').filter({ hasText: FLOW1.endpoint.name }).first()
    await card3.locator('text=Try it').click()
    await expect(page.locator(`text=${FLOW1.endpoint.name}`).first()).toBeVisible()
    await expect(page.locator('select[aria-label="HTTP method"]')).toHaveValue('GET')

    // Account 3 shares the same device as Accounts 1 and 2.
    // 2 cross-device aliases apply a -40 penalty → score = 10.
    // freeLimit = max(0, 10) = 10. The 11th call should be blocked.
    for (let i = 0; i < 10; i++) {
      await page.click('button:has-text("Run Request")')
      await expect(page.locator('text=Response').first()).toBeVisible()
      await expect(page.locator('text=200').first()).toBeVisible()
      await expect(page.locator('button:has-text("Run Request")')).toBeEnabled()
    }

    // 11th call — should be blocked with 403
    await page.click('button:has-text("Run Request")')
    await expect(page.locator('text=Response').first()).toBeVisible()
    await expect(page.locator('text=403').first()).toBeVisible()
    await expect(page.locator('text=Access denied').first()).toBeVisible()

    await logout(page)
    await waitForUrl(page, '/login')

    // ========== ACCOUNT 4: Casey Drew — blocked at signup due to device aliasing ==========
    const casey = FLOW1.abusers[3]
    await page.goto(`${API_STORE_URL}/signup`)
    await expect(page.locator('text=Create Account').first()).toBeVisible()
    await signupIndividual(page, { ...casey, password: FLOW1.apiStoreOrg.password })
    // Account 4 shares the same device → 3 cross-aliases → score = 0.
    // Signup is blocked immediately.
    await expect(page.locator('text=flagged for suspicious activity').first()).toBeVisible()

    // ========== JOB BOARD: Riley Chen — blocked at signup (cross-platform) ==========
    const riley = FLOW1.jobSeeker
    await page.goto(`${JOB_BOARD_URL}/signup`)
    await expect(page.locator('text=Create Account').first()).toBeVisible()
    await signupIndividual(page, { ...riley, password: FLOW1.jobBoardOrg.password })
    // Riley shares the same device fingerprint as the 3 API Store abusers.
    // TrustLayer links them to the canonical identity and their score is 0.
    // Job Board blocks them at registration.
    await expect(page.locator('text=flagged for suspicious activity').first()).toBeVisible()
  })
})
