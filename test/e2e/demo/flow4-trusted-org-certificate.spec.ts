import { test, expect } from '@playwright/test'
import { FLOW4 } from '../lib/flow4-data'
import { API_STORE, JOB_BOARD } from '../fixtures/test-data'
import {
  login,
  logout,
  waitForUrl,
  signupOrganizationWithCertificate,
} from '../utils/helpers'
import { cleanupAll } from '../utils/cleanup'

const API_STORE_URL = API_STORE.url
const JOB_BOARD_URL = JOB_BOARD.url
const TRUSTLAYER_API = 'http://localhost:8090'

function envValue(file: string, key: string): string {
  const fs = require('fs')
  const text = fs.readFileSync(file, 'utf8')
  const match = text.match(new RegExp(`^${key}="?([^\r\n"]+)"?$`, 'm'))
  if (!match) throw new Error(`Missing ${key} in ${file}`)
  return match[1]
}

const API_KEY = envValue('../../apps/demo/api-store/.env.local', 'TRUSTLAYER_API_KEY')

test.describe('Flow 4: Trusted Organization Certificate', () => {
  test.beforeAll(async () => {
    await cleanupAll()
  })

  test.afterAll(async () => {
    await cleanupAll()
  })

  test('org builds reputation on API Store, then uses certificate to skip vetting on Job Board', async ({ page }) => {
    // ===== ACT 1: Sign up org on API Store =====
    await page.goto(`${API_STORE_URL}/signup/organization`)
    await expect(page.locator('text=Create Organization Account').first()).toBeVisible()

    // Fill form manually so we can intercept the response
    await page.fill('input[name="name"]', FLOW4.apiStoreOrg.name)
    await page.fill('input[name="email"]', FLOW4.apiStoreOrg.email)
    await page.fill('input[name="password"]', FLOW4.apiStoreOrg.password)
    await page.fill('input[name="domain"]', FLOW4.apiStoreOrg.domain)
    await page.fill('input[name="linkedin"]', FLOW4.apiStoreOrg.linkedin)
    await page.fill('input[name="regNumber"]', FLOW4.apiStoreOrg.regNumber)
    await page.fill('textarea[name="address"]', FLOW4.apiStoreOrg.address)
    await page.fill('textarea[name="description"]', FLOW4.apiStoreOrg.description)

    const [signupResponse] = await Promise.all([
      page.waitForResponse(resp => resp.url().includes('/api/users') && resp.request().method() === 'POST'),
      page.click('button[type="submit"]'),
    ])
    const signupData = await signupResponse.json()
    const externalUserId = signupData.id

    await waitForUrl(page, '/login')
    await expect(page.locator('text=Organization account created successfully').first()).toBeVisible()

    // ===== ACT 2: Get org info from TrustLayer and issue certificate =====
    // Get platform user to find orgId
    const platformUserRes = await fetch(`${TRUSTLAYER_API}/v1/platform-users/${externalUserId}`, {
      headers: { 'x-api-key': API_KEY },
    })
    expect(platformUserRes.ok).toBe(true)
    const platformUser = await platformUserRes.json()
    const orgId = platformUser.orgId
    expect(orgId).toBeTruthy()

    // Run a background check and complete as clean
    const checkRes = await fetch(`${TRUSTLAYER_API}/v1/background-checks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
      },
      body: JSON.stringify({
        entityType: 'organization',
        orgId,
        triggeredBy: 'manual',
        entityName: FLOW4.apiStoreOrg.name,
      }),
    })
    expect(checkRes.ok).toBe(true)
    const check = await checkRes.json()

    await fetch(`${TRUSTLAYER_API}/v1/background-checks/${check.id}/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
      },
      body: JSON.stringify({ overallVerdict: 'clean' }),
    })

    // Issue certificate
    const certRes = await fetch(`${TRUSTLAYER_API}/v1/trust-certificates`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
      },
      body: JSON.stringify({
        entityType: 'organization',
        orgId,
        issuingCheckId: check.id,
        validDays: 30,
      }),
    })
    expect(certRes.ok).toBe(true)
    const certificate = await certRes.json()
    const certificateHash = certificate.certificateHash

    // ===== ACT 3: Sign up on Job Board with certificate =====
    await page.goto(`${JOB_BOARD_URL}/signup/organization`)
    await expect(page.locator('text=Create Organization Account').first()).toBeVisible()
    await signupOrganizationWithCertificate(page, {
      ...FLOW4.jobBoardOrg,
      certificateHash,
    })
    await waitForUrl(page, '/login')
    await expect(page.locator('text=Organization account created successfully').first()).toBeVisible()

    // ===== ACT 4: Login and verify instant access =====
    await login(page, FLOW4.jobBoardOrg.email, FLOW4.jobBoardOrg.password)
    await waitForUrl(page, '/dashboard')

    // Should be able to post a job immediately (no vetting delay)
    await page.goto(`${JOB_BOARD_URL}/dashboard/jobs`)
    await expect(page.locator('text=My Job Postings').first()).toBeVisible()
    await page.click('text=Post New Job')
    await waitForUrl(page, '/dashboard/jobs/new')
    await expect(page.locator('text=Post a New Job').first()).toBeVisible()

    await logout(page)
  })
})
