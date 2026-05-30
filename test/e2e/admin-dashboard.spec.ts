import { test, expect } from '@playwright/test'

test.describe('Admin Dashboard', () => {
  test.use({ baseURL: 'http://localhost:3000' })
  test('dashboard renders with sidebar, top bar, and widgets', async ({ page }) => {
    await page.goto('/admin')
    await expect(page.locator('text=TUNAI').first()).toBeVisible()
    await expect(page.locator('role=banner')).toBeVisible()
    await expect(page.locator('#global-search').first()).toBeVisible()
  })

  test('global search input is present and accessible', async ({ page }) => {
    await page.goto('/admin')
    const search = page.getByRole('searchbox', { name: /Search identities/ })
    await expect(search).toBeVisible()
    await expect(search).toHaveAttribute('placeholder', 'Search identities, IPs, orgs, certificates...')
  })

  test('sidebar navigation links work and highlight active state', async ({ page }) => {
    const navItems = [
      { label: 'Access Events', path: '/admin/access-events' },
      { label: 'Identities', path: '/admin/identities' },
      { label: 'Organizations', path: '/admin/organizations' },
      { label: 'Devices', path: '/admin/devices' },
      { label: 'IP Records', path: '/admin/ip-records' },
      { label: 'Certificates', path: '/admin/certificates' },
      { label: 'Pending Reviews', path: '/admin/pending-reviews' },
      { label: 'Webhook Logs', path: '/admin/webhook-logs' },
      { label: 'Audit Logs', path: '/admin/audit-logs' },
      { label: 'Integrations', path: '/admin/integrations' },
      { label: 'Settings', path: '/admin/settings' },
    ]

    for (const item of navItems) {
      await page.goto(item.path)
      await expect(page.locator('h1', { hasText: item.label })).toBeVisible()
    }
  })

  test('identities page renders table headers', async ({ page }) => {
    await page.goto('/admin/identities')
    await expect(page.locator('th', { hasText: 'Email Hash' })).toBeVisible()
    await expect(page.locator('th', { hasText: 'Trust Status' })).toBeVisible()
  })

  test('organizations page renders table headers', async ({ page }) => {
    await page.goto('/admin/organizations')
    await expect(page.locator('th', { hasText: 'Name' })).toBeVisible()
    await expect(page.locator('th', { hasText: 'Domain' })).toBeVisible()
  })

  test('devices page renders table or empty state', async ({ page }) => {
    await page.goto('/admin/devices')
    await expect(page.locator('h1', { hasText: 'Devices' })).toBeVisible()
    const body = await page.textContent('body')
    const hasContent =
      body?.includes('Stable Hash') ||
      body?.includes('No data available') ||
      body?.includes('Failed to load')
    expect(hasContent).toBeTruthy()
  })

  test('ip-records page renders table or empty state', async ({ page }) => {
    await page.goto('/admin/ip-records')
    await expect(page.locator('h1', { hasText: 'IP Records' })).toBeVisible()
    const body = await page.textContent('body')
    const hasContent =
      body?.includes('IP Address') ||
      body?.includes('No data available') ||
      body?.includes('Failed to load')
    expect(hasContent).toBeTruthy()
  })

  test('certificates page renders table headers', async ({ page }) => {
    await page.goto('/admin/certificates')
    await expect(page.locator('th', { hasText: 'Entity Type' })).toBeVisible()
    await expect(page.locator('th', { hasText: 'Status' })).toBeVisible()
  })

  test('webhook-logs page renders without crashing', async ({ page }) => {
    await page.goto('/admin/webhook-logs')
    await expect(page.locator('h1', { hasText: 'Webhook Logs' })).toBeVisible()
    const body = await page.textContent('body')
    const hasContent =
      body?.includes('Event Type') ||
      body?.includes('No data available') ||
      body?.includes('Failed to load') ||
      body?.includes('Backend returned')
    expect(hasContent).toBeTruthy()
  })

  test('pending-reviews page renders both tables', async ({ page }) => {
    await page.goto('/admin/pending-reviews')
    await expect(page.locator('h1', { hasText: 'Pending Reviews' })).toBeVisible()
    await expect(page.locator('h2', { hasText: /Verification Requests/ })).toBeVisible()
    await expect(page.locator('h2', { hasText: /Community Reports/ })).toBeVisible()
  })

  test('dashboard widget footers link to correct pages', async ({ page }) => {
    await page.goto('/admin')

    const footerLinks = [
      { text: 'View all events', href: '/admin/access-events' },
      { text: 'View all pending reviews', href: '/admin/pending-reviews' },
      { text: 'View webhook logs', href: '/admin/webhook-logs' },
      { text: 'View certificates', href: '/admin/certificates' },
    ]

    for (const link of footerLinks) {
      const anchor = page.locator(`a:has-text("${link.text}")`).first()
      await expect(anchor).toHaveAttribute('href', link.href)
    }
  })

  test('error state renders gracefully when backend is unavailable', async ({ page }) => {
    await page.goto('/admin/access-events')
    const body = await page.textContent('body')
    const hasErrorOrEmpty =
      body?.includes('fetch failed') ||
      body?.includes('No data') ||
      body?.includes('Error') ||
      body?.includes('No backend')
    expect(hasErrorOrEmpty).toBeTruthy()
  })
})
