import { test, expect } from '@playwright/test'
import { JOB_BOARD } from './fixtures/test-data'
import { signupOrganization, signupIndividual, login, logout, waitForUrl } from './utils/helpers'
import { cleanupAll } from './utils/cleanup'

test.describe('Job Board E2E Flow', () => {
  test.use({ baseURL: JOB_BOARD.url })

  test.beforeAll(async () => {
    await cleanupAll()
  })

  test.afterAll(async () => {
    await cleanupAll()
  })

  test('full user flow: org posts job, individual applies, org reviews and updates status', async ({ page }) => {
    // ========== ORGANIZATION FLOW ==========
    // 1. Navigate to org signup
    await page.goto(`${JOB_BOARD.url}/signup/organization`)
    await expect(page.locator('text=Create Organization Account').first()).toBeVisible()

    // 2. Fill organization signup form
    await signupOrganization(page, JOB_BOARD.organization)
    await waitForUrl(page, '/login')
    await expect(page.locator('text=Organization account created successfully').first()).toBeVisible()

    // 3. Login as organization
    await login(page, JOB_BOARD.organization.email, JOB_BOARD.organization.password)
    await page.goto(`${JOB_BOARD.url}/dashboard/jobs`)
    await expect(page.locator('text=My Job Postings').first()).toBeVisible()

    // 4. Post a new job
    await page.click('text=Post New Job')
    await waitForUrl(page, '/dashboard/jobs/new')
    await expect(page.locator('text=Post a New Job').first()).toBeVisible()

    await page.fill('input[name="title"]', JOB_BOARD.job.title)
    await page.fill('textarea[name="description"]', JOB_BOARD.job.description)
    await page.fill('input[name="location"]', JOB_BOARD.job.location)
    await page.fill('input[name="salaryMin"]', String(JOB_BOARD.job.salaryMin))
    await page.fill('input[name="salaryMax"]', String(JOB_BOARD.job.salaryMax))
    await page.fill('textarea[name="requirements"]', JOB_BOARD.job.requirements)
    await page.click('button:has-text("Post Job")')
    await waitForUrl(page, '/dashboard/jobs')
    await expect(page.locator(`text=${JOB_BOARD.job.title}`)).toBeVisible()

    // 5. Logout
    await logout(page)
    await waitForUrl(page, '/')
    // await expect(page.locator('text=Job Board')).toBeVisible()

    // ========== INDIVIDUAL FLOW ==========
    // 6. Navigate to individual signup
    await page.goto(`${JOB_BOARD.url}/signup`)
    await expect(page.locator('text=Create Account').first()).toBeVisible()

    // 7. Fill individual signup form
    await signupIndividual(page, JOB_BOARD.individual)
    await waitForUrl(page, '/login')
    await expect(page.locator('text=Account created successfully').first()).toBeVisible()

    // 8. Login as individual
    await login(page, JOB_BOARD.individual.email, JOB_BOARD.individual.password)
    await page.goto(`${JOB_BOARD.url}/jobs`)
    await expect(page.locator('text=Job Listings').first()).toBeVisible()

    // 9. Browse jobs and click on the posted job
    await expect(page.locator(`text=${JOB_BOARD.job.title}`)).toBeVisible()
    await page.click(`text=${JOB_BOARD.job.title}`)
    await waitForUrl(page, '/jobs/')
    await expect(page.locator(`text=${JOB_BOARD.job.title}`)).toBeVisible()
    await expect(page.locator('text=Test Org Job').first()).toBeVisible()

    // 10. Apply for the job
    await page.click('text=Apply Now')
    await waitForUrl(page, '/apply')
    await expect(page.locator('text=Apply for Job').first()).toBeVisible()

    await page.fill('textarea[name="coverLetter"]', JOB_BOARD.application.coverLetter)
    await page.fill('input[name="expectedSalary"]', String(JOB_BOARD.application.expectedSalary))
    await page.fill('input[name="availability"]', JOB_BOARD.application.availability)

    // The apply page uses UploadThing for resume upload which is complex in e2e.
    // We use the API directly to submit the application.
    const jobId = page.url().split('/jobs/')[1]?.split('/')[0]
    expect(jobId).toBeTruthy()

    // Use page context to call the API
    const applyResponse = await page.evaluate(async (args: { jobId: string; coverLetter: string; expectedSalary: number; availability: string }) => {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: args.jobId,
          coverLetter: args.coverLetter,
          expectedSalary: args.expectedSalary,
          availability: args.availability,
          resumeUrl: 'https://example.com/resume.pdf'
        })
      })
      return { ok: res.ok, status: res.status }
    }, { jobId, coverLetter: JOB_BOARD.application.coverLetter, expectedSalary: JOB_BOARD.application.expectedSalary, availability: JOB_BOARD.application.availability })
    expect(applyResponse.ok).toBe(true)

    // 11. Navigate to My Applications and verify
    await page.goto(`${JOB_BOARD.url}/dashboard/applications`)
    await expect(page.getByRole('heading', { name: 'My Applications' })).toBeVisible()
    await expect(page.locator(`text=${JOB_BOARD.job.title}`)).toBeVisible()
    await expect(page.getByText('Pending').first()).toBeVisible()

    // 12. Logout
    await logout(page)
    await waitForUrl(page, '/')

    // ========== ORGANIZATION RE-LOGIN ==========
    // 13. Login as organization
    await page.goto(`${JOB_BOARD.url}/login`)
    await login(page, JOB_BOARD.organization.email, JOB_BOARD.organization.password)
    await page.goto(`${JOB_BOARD.url}/dashboard/jobs`)
    await expect(page.locator('text=My Job Postings').first()).toBeVisible()

    // 14. View applicants
    await page.click('text=View Applicants')
    await waitForUrl(page, '/applicants')
    await expect(page.locator('text=Job Applicants').first()).toBeVisible()
    await expect(page.locator('text=Test Seeker').first()).toBeVisible()
    await expect(page.locator('text=test.seeker@e2e.local').first()).toBeVisible()

    // 15. Update application status to INTERVIEWING
    await page.click('[role="combobox"]')
    await page.click('text=Interviewing')
    await expect(page.locator('text=Interviewing').first()).toBeVisible()

    // 16. Final logout
    await logout(page)
    await waitForUrl(page, '/')
  })
})
