import { test, expect } from '@playwright/test'
import { FLOW5 } from '../lib/flow5-data'
import { SOCIAL_MEDIA, API_STORE } from '../fixtures/test-data'
import {
  signupIndividual,
  signupIndividualWithCertificate,
  login,
  logout,
  waitForUrl,
} from '../utils/helpers'
import { cleanupAll } from '../utils/cleanup'

const SOCIAL_URL = SOCIAL_MEDIA.url
const API_STORE_URL = API_STORE.url

test.describe('Flow 5: Trusted Individual Portable KYC', () => {
  test.beforeAll(async () => {
    await cleanupAll()
  })

  test.afterAll(async () => {
    await cleanupAll()
  })

  test('individual verifies on Social Media, then uses certificate to skip KYC on API Store', async ({ page }) => {
    // ===== ACT 1: Sign up on Social Media =====
    await page.goto(`${SOCIAL_URL}/signup`)
    await expect(page.locator('text=Join Publish.').first()).toBeVisible()
    await signupIndividual(page, { ...FLOW5.socialMediaUser, password: FLOW5.socialMediaUser.password })
    await waitForUrl(page, '/login')
    await expect(page.locator('text=Account created successfully').first()).toBeVisible()

    // ===== ACT 2: Complete KYC verification =====
    await login(page, FLOW5.socialMediaUser.email, FLOW5.socialMediaUser.password)
    await waitForUrl(page, '/feed')

    await page.goto(`${SOCIAL_URL}/verify`)
    await expect(page.locator('text=Identity Verification').first()).toBeVisible()
    await expect(page.locator('text=Start Identity Verification').first()).toBeVisible()

    await page.click('text=Start Identity Verification')
    // Wait for verification to complete
    await expect(page.locator('text=You are TrustLayer Verified').first()).toBeVisible({ timeout: 15000 })

    // Extract certificate hash from the page
    const certificateHash = await page.locator('code').textContent()
    expect(certificateHash).toBeTruthy()

    await logout(page)

    // ===== ACT 3: Sign up on API Store with certificate =====
    await page.goto(`${API_STORE_URL}/signup`)
    await expect(page.locator('text=Create Account').first()).toBeVisible()
    await signupIndividualWithCertificate(page, {
      ...FLOW5.apiStoreUser,
      password: FLOW5.apiStoreUser.password,
      certificateHash: certificateHash!,
    })
    await waitForUrl(page, '/login')
    await expect(page.locator('text=Account created successfully').first()).toBeVisible()

    // ===== ACT 4: Login and verify instant access =====
    await login(page, FLOW5.apiStoreUser.email, FLOW5.apiStoreUser.password)
    await waitForUrl(page, '/dashboard')
    await expect(page.locator('text=My Dashboard').first()).toBeVisible()

    // Should be able to generate API key immediately (no onboarding friction)
    await page.goto(`${API_STORE_URL}/keys`)
    await expect(page.locator('text=API Key').first()).toBeVisible()
    await page.click('button:has-text("Generate API Key")')
    await expect(page.locator('code')).toBeVisible()

    await logout(page)
  })
})
