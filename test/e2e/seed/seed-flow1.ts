/**
 * Seed script for Flow 1: Free-Tier Abuser.
 * Uses a headless Playwright browser to create the org accounts,
 * API Store endpoint, and Job Board job that the e2e test depends on.
 *
 * Run via: pnpm --filter e2e exec tsx test/e2e/seed/seed-flow1.ts
 */

import { chromium } from '@playwright/test'
import { FLOW1 } from '../lib/flow1-data'
import { API_STORE, JOB_BOARD } from '../fixtures/test-data'
import { signupOrganization, login, waitForUrl } from '../utils/helpers'

const API_STORE_URL = API_STORE.url
const JOB_BOARD_URL = JOB_BOARD.url

async function seedFlow1() {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } })

  // ========== API Store: Org + Endpoint ==========
  console.log('[seed] Creating API Store org...')
  await page.goto(`${API_STORE_URL}/signup/organization`)
  await signupOrganization(page, FLOW1.apiStoreOrg)
  await waitForUrl(page, '/login')

  await login(page, FLOW1.apiStoreOrg.email, FLOW1.apiStoreOrg.password)
  await waitForUrl(page, '/dashboard')

  console.log('[seed] Creating endpoint...')
  await page.click('text=New Endpoint')
  await waitForUrl(page, '/endpoints/new')
  await page.fill('input[name="name"]', FLOW1.endpoint.name)
  await page.fill('textarea[name="description"]', FLOW1.endpoint.description)
  await page.fill('input[name="forwardUrl"]', FLOW1.endpoint.forwardUrl)
  await page.selectOption('select[name="method"]', FLOW1.endpoint.method)
  await page.fill('input[name="pricePer1k"]', String(FLOW1.endpoint.pricePer1k))
  await page.click('button:has-text("Create Endpoint")')
  await waitForUrl(page, '/endpoints')
  console.log('[seed] Endpoint created:', FLOW1.endpoint.name)

  // ========== Job Board: Org + Job ==========
  console.log('[seed] Creating Job Board org...')
  await page.goto(`${JOB_BOARD_URL}/signup/organization`)
  await signupOrganization(page, FLOW1.jobBoardOrg)
  await waitForUrl(page, '/login')

  await login(page, FLOW1.jobBoardOrg.email, FLOW1.jobBoardOrg.password)
  await page.goto(`${JOB_BOARD_URL}/dashboard/jobs`)

  console.log('[seed] Posting job...')
  await page.click('text=Post New Job')
  await waitForUrl(page, '/dashboard/jobs/new')
  await page.fill('input[name="title"]', FLOW1.job.title)
  await page.fill('textarea[name="description"]', FLOW1.job.description)
  await page.fill('input[name="location"]', FLOW1.job.location)
  await page.fill('input[name="salaryMin"]', String(FLOW1.job.salaryMin))
  await page.fill('input[name="salaryMax"]', String(FLOW1.job.salaryMax))
  await page.fill('textarea[name="requirements"]', FLOW1.job.requirements)
  await page.click('button:has-text("Post Job")')
  await waitForUrl(page, '/dashboard/jobs')
  console.log('[seed] Job posted:', FLOW1.job.title)

  await browser.close()
  console.log('[seed] Flow 1 seeding complete.')
}

seedFlow1().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
