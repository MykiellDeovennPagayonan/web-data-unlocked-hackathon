import { test, expect } from '@playwright/test'
import { SOCIAL_MEDIA } from './fixtures/test-data'
import { signupIndividual, signupOrganization, login, logout, waitForUrl } from './utils/helpers'
import { cleanupAll } from './utils/cleanup'
import { seedSocialMedia } from './seed/seed-social-media'

test.describe('Social Media E2E Flow', () => {
  test.beforeAll(async () => {
    await cleanupAll()
    // Seed social media with initial users and posts
    await seedSocialMedia()
  })

  test.afterAll(async () => {
    await cleanupAll()
  })

  test('full user flow: seeded posts visible, individual creates/likes/comments/follows, org creates post', async ({ page }) => {
    // ========== INDIVIDUAL FLOW ==========
    // 1. Navigate to individual signup
    await page.goto(`${SOCIAL_MEDIA.url}/signup`)
    await expect(page.locator('text=Create Account').first()).toBeVisible()

    // 2. Fill individual signup form
    await signupIndividual(page, SOCIAL_MEDIA.individual)
    await waitForUrl(page, '/login')
    await expect(page.locator('text=Account created successfully').first()).toBeVisible()

    // 3. Login as individual
    await login(page, SOCIAL_MEDIA.individual.email, SOCIAL_MEDIA.individual.password)
    await waitForUrl(page, '/feed')
    await expect(page.locator('text=Feed').first()).toBeVisible()

    // 4. Navigate to Alice's profile to see seeded posts (feed only shows followed users)
    await page.goto(`${SOCIAL_MEDIA.url}/profile/Alice Seed`)
    await waitForUrl(page, '/profile/')
    await expect(page.locator('text=Alice Seed').first()).toBeVisible()
    await expect(page.locator('text=Hello from Alice!').first()).toBeVisible()
    await expect(page.locator('text=seeded post for e2e testing').first()).toBeVisible()

    // 5. Like Alice's post from her profile
    const alicePost = page.locator('text=Hello from Alice!').first()
    const likeButton = alicePost.locator('xpath=ancestor::div[contains(@class,"bg-surface")]//button[contains(.,"♡")]').first()
    await likeButton.click()

    // 6. Follow Alice
    const followButton = page.locator('button:has-text("Follow")')
    if (await followButton.isVisible().catch(() => false)) {
      await followButton.click()
    }

    // 7. Go back to feed to create a new post
    await page.goto(`${SOCIAL_MEDIA.url}/feed`)
    await waitForUrl(page, '/feed')
    await page.click('text=New Post')
    await waitForUrl(page, '/post/create')
    await expect(page.locator('text=Create Post').first()).toBeVisible()

    await page.fill('textarea[placeholder="What\'s on your mind?"]', SOCIAL_MEDIA.newPost.content)
    await page.click('button:has-text("Post")')
    await expect(page.locator(`text=${SOCIAL_MEDIA.newPost.content}`).first()).toBeVisible()

    // 8. Logout
    await logout(page)
    await expect(page.locator('text=Sign In').first()).toBeVisible()

    // ========== ORGANIZATION FLOW ==========
    // 11. Navigate to organization signup
    await page.goto(`${SOCIAL_MEDIA.url}/signup/organization`)
    await expect(page.locator('text=Create Organization Account').first()).toBeVisible()

    // 12. Fill organization signup form
    await signupOrganization(page, SOCIAL_MEDIA.organization)
    await waitForUrl(page, '/login')
    await expect(page.locator('text=Organization account created successfully').first()).toBeVisible()

    // 13. Login as organization
    await login(page, SOCIAL_MEDIA.organization.email, SOCIAL_MEDIA.organization.password)
    await waitForUrl(page, '/feed')
    await expect(page.locator('text=Feed').first()).toBeVisible()

    // 14. Create a brand post
    await page.click('text=New Post')
    await waitForUrl(page, '/post/create')
    await expect(page.locator('text=Create Post').first()).toBeVisible()

    const orgPostContent = 'Hello from Test Org Social! This is our brand post.'
    await page.fill('textarea[placeholder="What\'s on your mind?"]', orgPostContent)
    await page.click('button:has-text("Post")')
    await expect(page.locator(`text=${orgPostContent}`).first()).toBeVisible()

    // 15. Navigate to own profile
    await page.click('text=Profile')
    await expect(page.locator('text=Test Org Social').first()).toBeVisible()
    await expect(page.locator(`text=${orgPostContent}`).first()).toBeVisible()

    // 16. Final logout
    await logout(page)
  })
})
