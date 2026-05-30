import type { Page } from '@playwright/test'

/**
 * Shared helpers for all e2e tests.
 */

/** Fill out the individual signup form and submit. */
export async function signupIndividual(
  page: Page,
  data: {
    name: string
    email: string
    password: string
    bio?: string
    location?: string
    website?: string
  }
) {
  await page.fill('input[name="name"]', data.name)
  await page.fill('input[name="email"]', data.email)
  await page.fill('input[name="password"]', data.password)
  if (data.bio) await page.fill('input[name="bio"]', data.bio)
  if (data.location) await page.fill('input[name="location"]', data.location)
  if (data.website) await page.fill('input[name="website"]', data.website)
  await page.click('button[type="submit"]')
}

/** Fill out the organization signup form and submit. */
export async function signupOrganization(
  page: Page,
  data: {
    name: string
    email: string
    password: string
    domain?: string
    linkedin?: string
    regNumber?: string
    address?: string
    description?: string
  }
) {
  await page.fill('input[name="name"]', data.name)
  await page.fill('input[name="email"]', data.email)
  await page.fill('input[name="password"]', data.password)
  if (data.domain) await page.fill('input[name="domain"]', data.domain)
  if (data.linkedin) await page.fill('input[name="linkedin"]', data.linkedin)
  if (data.regNumber) await page.fill('input[name="regNumber"]', data.regNumber)
  if (data.address) await page.fill('textarea[name="address"]', data.address)
  if (data.description) await page.fill('textarea[name="description"]', data.description)
  await page.click('button[type="submit"]')
}

/** Login with email and password. */
export async function login(
  page: Page,
  email: string,
  password: string
) {
  await page.fill('input[name="email"]', email)
  await page.fill('input[name="password"]', password)
  const sessionPromise = page.waitForResponse(/api\/auth\/session/)
  await page.click('button[type="submit"]')
  await sessionPromise.catch(() => {
    // Session endpoint may not be called if redirect happens first
  })
  await page.waitForLoadState('networkidle')
}

/** Click logout / sign out. Tries multiple common patterns. */
export async function logout(page: Page) {
  // Try social media avatar dropdown (round button with single initial)
  const avatarBtn = page.locator('button[class*="rounded-full"]').filter({ hasText: /^[A-Z]$/ })
  if (await avatarBtn.isVisible().catch(() => false)) {
    await avatarBtn.click()
    await page.locator('div[role="menuitem"]:has-text("Sign Out")').waitFor({ state: 'visible' })
    await page.locator('div[role="menuitem"]:has-text("Sign Out")').click()
    return
  }

  // Try dropdown first (social media legacy)
  const dropdownTrigger = page.locator('button:has-text("Test")')
  if (await dropdownTrigger.isVisible().catch(() => false)) {
    await dropdownTrigger.click()
    await page.click('text=Sign Out')
    return
  }

  // Try user menu dropdown (api store)
  const userMenuBtn = page.locator('button[aria-label="User menu"]')
  if (await userMenuBtn.isVisible().catch(() => false)) {
    await userMenuBtn.click()
    await page.click('text=Sign out')
    return
  }

  // Try sidebar button
  const signOutBtn = page.locator('button:has-text("Sign Out")')
  if (await signOutBtn.isVisible().catch(() => false)) {
    await signOutBtn.click()
    return
  }

  // Try navbar button (job board)
  const signoutBtn = page.locator('button:has-text("Sign out")')
  if (await signoutBtn.isVisible().catch(() => false)) {
    await signoutBtn.click()
    return
  }

  throw new Error('Could not find logout button')
}

/** Wait for navigation to a URL containing the given string. */
export async function waitForUrl(page: Page, urlPart: string) {
  await page.waitForURL((url: URL) => url.toString().includes(urlPart), { timeout: 15000 })
}
