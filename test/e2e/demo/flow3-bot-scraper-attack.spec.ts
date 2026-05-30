import { test, expect } from '@playwright/test'
import { FLOW3 } from '../lib/flow3-data'
import { SOCIAL_MEDIA, JOB_BOARD } from '../fixtures/test-data'
import {
  waitForUrl,
  simulateBotScraper,
  botRequest,
} from '../utils/helpers'
import { cleanupAll } from '../utils/cleanup'
import * as path from 'path'
import * as fs from 'fs'

const SOCIAL_URL = SOCIAL_MEDIA.url
const JOB_BOARD_URL = JOB_BOARD.url
const TRUSTLAYER_API = 'http://localhost:8090'

// Load API key from the demo app's env so we can query TrustLayer directly
function envValue(file: string, key: string): string {
  const text = fs.readFileSync(file, 'utf8')
  const match = text.match(new RegExp(`^${key}="?([^\r\n"]+)"?$`, 'm'))
  if (!match) throw new Error(`Missing ${key} in ${file}`)
  return match[1]
}

const ENV_PATH = path.join(__dirname, '../../..', 'apps/demo/social-media-app/.env.local')
const SOCIAL_API_KEY = envValue(ENV_PATH, 'TRUSTLAYER_API_KEY')
const SOCIAL_PLATFORM_ID = envValue(ENV_PATH, 'TRUSTLAYER_PLATFORM_ID')

test.describe('Flow 3: Bot Scraper Attack', () => {
  test.beforeAll(async () => {
    await cleanupAll()
  })

  test.afterAll(async () => {
    await cleanupAll()
  })

  test('full flow: bot scrapes Social Media feed, gets blacklisted, then blocked on Job Board', async ({
    page,
  }) => {
    // ============================================================
    // ACT 1 — SEED: Fill the Social Media App with content
    // ============================================================
    const seedRes = await fetch(`${SOCIAL_URL}/api/seed`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer dev-seed-secret',
      },
      body: JSON.stringify({ users: [...FLOW3.seedUsers].reverse() }),
    })
    expect(seedRes.ok).toBe(true)

    // ============================================================
    // ACT 2 — SHOW THE FEED: Navigate to Social Media App
    // ============================================================
    await page.goto(`${SOCIAL_URL}/feed`)
    await expect(
      page.locator('text=Hello from Alice!').first()
    ).toBeVisible()
    await expect(
      page.locator('text=Bob here!').first()
    ).toBeVisible()
    await page.screenshot({
      path: 'test-results/flow3-01-feed-visible.png',
      fullPage: true,
    })

    // ============================================================
    // ACT 3 — THE BOT ATTACK: Rapidly scrape the feed API
    // ============================================================
    const botResult = await simulateBotScraper(
      page,
      SOCIAL_URL,
      FLOW3.burstCount,
      FLOW3.pagesToScrape,
      FLOW3.botIp,
      FLOW3.botUserAgent
    )

    // The bot should have harvested a lot of posts at first
    expect(botResult.harvestedPosts).toBeGreaterThan(0)

    // After enough requests, the bot should start getting blocked
    const blockedResponses = botResult.statuses.filter(
      (s) => s === 429 || s === 403
    )
    expect(blockedResponses.length).toBeGreaterThan(0)

    // Save evidence
    await page.evaluate(
      (data) => {
        console.log('[BOT SCRAPER] Harvested posts:', data.harvestedPosts)
        console.log(
          '[BOT SCRAPER] Blocked responses:',
          data.blockedCount,
          'of',
          data.totalCount
        )
        console.log(
          '[BOT SCRAPER] Status distribution:',
          data.statuses.reduce(
            (acc: Record<number, number>, s: number) => {
              acc[s] = (acc[s] || 0) + 1
              return acc
            },
            {} as Record<number, number>
          )
        )
      },
      {
        harvestedPosts: botResult.harvestedPosts,
        blockedCount: blockedResponses.length,
        totalCount: botResult.statuses.length,
        statuses: botResult.statuses,
      }
    )

    await page.screenshot({
      path: 'test-results/flow3-02-bot-attack-complete.png',
      fullPage: true,
    })

    // ============================================================
    // ACT 4 — VERIFY BLACKLIST: TrustLayer caught the bot
    // ============================================================
    const ipCheck = await fetch(
      `${TRUSTLAYER_API}/admin/ip/${FLOW3.botIp}`,
      {
        headers: { 'x-api-key': SOCIAL_API_KEY },
      }
    )
    expect(ipCheck.ok).toBe(true)
    const ipRecord = await ipCheck.json()
    expect(ipRecord.isBlacklisted).toBe(true)
    expect(ipRecord.riskScore).toBeGreaterThanOrEqual(90)

    // Verify access events were logged
    const eventsRes = await fetch(
      `${TRUSTLAYER_API}/admin/access/events/platform/${SOCIAL_PLATFORM_ID}`,
      {
        headers: { 'x-api-key': SOCIAL_API_KEY },
      }
    )
    expect(eventsRes.ok).toBe(true)
    const events = await eventsRes.json()
    expect(Array.isArray(events)).toBe(true)
    expect(events.length).toBeGreaterThan(0)

    // At least some events should be from our bot IP
    const botEvents = events.filter(
      (e: any) => e.ipId === ipRecord.id || e.verdict !== 'allowed'
    )
    expect(botEvents.length).toBeGreaterThan(0)

    // ============================================================
    // ACT 5 — CROSS-PLATFORM BLOCK: Bot pivots to Job Board
    // ============================================================
    await page.goto(`${JOB_BOARD_URL}/jobs`)
    await waitForUrl(page, '/jobs')

    // Fire a single request from the same blacklisted IP
    const jobBoardBot = await botRequest(
      page,
      `${JOB_BOARD_URL}/api/jobs`,
      FLOW3.botIp,
      FLOW3.botUserAgent
    )

    // The bot should be instantly blocked — no threshold needed
    expect(jobBoardBot.status).toBe(403)
    expect(jobBoardBot.text).toContain('Access denied')

    await page.screenshot({
      path: 'test-results/flow3-03-job-board-blocked.png',
      fullPage: true,
    })

    // ============================================================
    // ACT 6 — FINAL ASSERTIONS: Clean users are unaffected
    // ============================================================
    // A normal user (no bot headers) should still access Job Board
    const normalUser = await fetch(`${JOB_BOARD_URL}/api/jobs`)
    expect(normalUser.ok).toBe(true)
    const jobsData = await normalUser.json()
    expect(Array.isArray(jobsData)).toBe(true)
  })
})
