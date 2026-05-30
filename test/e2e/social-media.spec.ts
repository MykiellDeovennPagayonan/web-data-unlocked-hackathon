import { test, expect } from '@playwright/test'
import { SOCIAL_MEDIA } from './fixtures/test-data'
import { signupIndividual, signupOrganization, login, logout, waitForUrl, createPost } from './utils/helpers'
import { cleanupAll } from './utils/cleanup'
import { seedSocialMedia } from './seed/seed-social-media'

test.describe('Social Media E2E Flow', () => {
  test.beforeAll(async () => {
    await cleanupAll()
    await seedSocialMedia()
  })

  test.afterAll(async () => {
    await cleanupAll()
  })

  test('full user flow: seeded posts visible, individual creates/likes/comments/follows, org creates post', async ({ page }) => {
    // ========== INDIVIDUAL FLOW ==========
    // 1. Navigate to individual signup
    await page.goto(`${SOCIAL_MEDIA.url}/signup`)
    await expect(page.locator('text=Join Publish.').first()).toBeVisible()

    // 2. Fill individual signup form
    await signupIndividual(page, SOCIAL_MEDIA.individual)
    await waitForUrl(page, '/login')
    await expect(page.locator('text=Account created successfully').first()).toBeVisible()

    // 3. Login as individual
    await login(page, SOCIAL_MEDIA.individual.email, SOCIAL_MEDIA.individual.password)
    await waitForUrl(page, '/feed')
    await expect(page.locator('text=For you').first()).toBeVisible()

    // 4. Navigate to Alice's profile to see seeded posts
    await page.goto(`${SOCIAL_MEDIA.url}/profile/Alice%20Seed`)
    await waitForUrl(page, '/profile/')
    await expect(page.locator('text=Alice Seed').first()).toBeVisible()
    // The first seeded post's title (first line) should be visible
    await expect(page.locator('text=Hello from Alice!').first()).toBeVisible()

    // 5. Like Alice's first post from her profile
    const likeButton = page.locator('button[aria-label="Like"]').first()
    await likeButton.click()

    // 6. Follow Alice
    const followButton = page.locator('button:has-text("Follow")')
    if (await followButton.isVisible().catch(() => false)) {
      await followButton.click()
      await expect(page.locator('button:has-text("Following")').first()).toBeVisible()
    }

    // 7. Click into Alice's post detail page to comment
    await page.locator('text=Hello from Alice!').first().click()
    await waitForUrl(page, '/post/')
    await expect(page.locator('text=Comments').first()).toBeVisible()

    // 8. Add a comment on the post detail page
    await page.fill('textarea[placeholder="What are your thoughts?"]', SOCIAL_MEDIA.comment)
    await page.click('button:has-text("Respond")')
    await expect(page.locator(`text=${SOCIAL_MEDIA.comment}`).first()).toBeVisible()

    // 9. Go back to feed and create a new post
    await page.goto(`${SOCIAL_MEDIA.url}/feed`)
    await waitForUrl(page, '/feed')
    await createPost(page, SOCIAL_MEDIA.newPost.content)
    // After publish, redirects to feed
    await waitForUrl(page, '/feed')
    // Verify the new post title (first line) appears on feed
    await expect(page.locator('text=This is a brand new post!').first()).toBeVisible()

    // 10. Logout
    await logout(page)
    await expect(page.locator('text=Welcome back.').first()).toBeVisible()

    // ========== ORGANIZATION FLOW ==========
    // 11. Navigate to organization signup
    await page.goto(`${SOCIAL_MEDIA.url}/signup/organization`)
    await expect(page.locator('text=Register your organization.').first()).toBeVisible()

    // 12. Fill organization signup form
    await signupOrganization(page, SOCIAL_MEDIA.organization)
    await waitForUrl(page, '/login')
    await expect(page.locator('text=Organization account created successfully').first()).toBeVisible()

    // 13. Login as organization
    await login(page, SOCIAL_MEDIA.organization.email, SOCIAL_MEDIA.organization.password)
    await waitForUrl(page, '/feed')
    await expect(page.locator('text=For you').first()).toBeVisible()

    // 14. Create a brand post
    await createPost(page, 'Hello from Test Org Social!\nThis is our brand post for the e2e test.')
    // After publish, redirects to feed
    await waitForUrl(page, '/feed')
    await expect(page.locator('text=Hello from Test Org Social!').first()).toBeVisible()

    // 15. Navigate to own profile
    await page.goto(`${SOCIAL_MEDIA.url}/profile/Test%20Org%20Social`)
    await waitForUrl(page, '/profile/')
    await expect(page.locator('text=Test Org Social').first()).toBeVisible()
    await expect(page.locator('text=Hello from Test Org Social!').first()).toBeVisible()

    // 16. Final logout
    await logout(page)
    await expect(page.locator('text=Welcome back.').first()).toBeVisible()
  })
})
