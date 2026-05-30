/**
 * Programmatic seeding for Flow 1.
 * Uses direct HTTP calls to create orgs, endpoints, and jobs
 * so the visual E2E test can start from the abuser accounts.
 */

import { request } from '@playwright/test'
import { FLOW1 } from './flow1-data'

const API_STORE_URL = 'http://localhost:3002'
const JOB_BOARD_URL = 'http://localhost:3003'

async function loginNextAuth(context: any, baseUrl: string, email: string, password: string) {
  // 1. Get CSRF token
  const csrfRes = await context.get(`${baseUrl}/api/auth/csrf`)
  const csrfJson = await csrfRes.json()
  const csrfToken = csrfJson.csrfToken

  // 2. Login via credentials callback
  const loginRes = await context.post(`${baseUrl}/api/auth/callback/credentials`, {
    form: {
      csrfToken,
      email,
      password,
      callbackUrl: baseUrl,
      json: 'true',
    },
    maxRedirects: 0,
  })

  // NextAuth returns 302 redirect on success with Set-Cookie header
  if (loginRes.status() !== 302 && loginRes.status() !== 200) {
    const body = await loginRes.text().catch(() => '')
    throw new Error(`Login failed: ${loginRes.status()} ${body.slice(0, 200)}`)
  }
}

export async function seedFlow1() {
  const apiStoreContext = await request.newContext()
  const jobBoardContext = await request.newContext()

  try {
    // ─── API Store Org ───
    const apiStoreOrgRes = await apiStoreContext.post(`${API_STORE_URL}/api/users`, {
      data: { ...FLOW1.apiStoreOrg, role: 'ORGANIZATION' },
    })
    if (!apiStoreOrgRes.ok()) {
      const text = await apiStoreOrgRes.text().catch(() => '')
      throw new Error(`API Store org signup failed: ${apiStoreOrgRes.status()} ${text}`)
    }

    await loginNextAuth(apiStoreContext, API_STORE_URL, FLOW1.apiStoreOrg.email, FLOW1.apiStoreOrg.password)

    // ─── API Store Endpoint ───
    const endpointRes = await apiStoreContext.post(`${API_STORE_URL}/api/endpoints`, {
      data: FLOW1.endpoint,
    })
    if (!endpointRes.ok()) {
      const text = await endpointRes.text().catch(() => '')
      throw new Error(`Endpoint creation failed: ${endpointRes.status()} ${text}`)
    }
    const endpointJson = await endpointRes.json()
    const endpointId = endpointJson.id

    // ─── Job Board Org ───
    const jobBoardOrgRes = await jobBoardContext.post(`${JOB_BOARD_URL}/api/users`, {
      data: { ...FLOW1.jobBoardOrg, role: 'ORGANIZATION' },
    })
    if (!jobBoardOrgRes.ok()) {
      const text = await jobBoardOrgRes.text().catch(() => '')
      throw new Error(`Job Board org signup failed: ${jobBoardOrgRes.status()} ${text}`)
    }

    await loginNextAuth(jobBoardContext, JOB_BOARD_URL, FLOW1.jobBoardOrg.email, FLOW1.jobBoardOrg.password)

    // ─── Job Board Job 1 ───
    const job1Res = await jobBoardContext.post(`${JOB_BOARD_URL}/api/jobs`, {
      data: FLOW1.job,
    })
    if (!job1Res.ok()) {
      const text = await job1Res.text().catch(() => '')
      throw new Error(`Job creation failed: ${job1Res.status()} ${text}`)
    }
    const job1Json = await job1Res.json()
    const jobId1 = job1Json.id

    // ─── Job Board Job 2 (for 2nd application) ───
    const job2Res = await jobBoardContext.post(`${JOB_BOARD_URL}/api/jobs`, {
      data: {
        title: 'Platform Engineer',
        description: 'Build internal tooling and CI/CD pipelines.',
        location: 'Remote',
        salaryMin: 120000,
        salaryMax: 160000,
        requirements: '3+ years platform engineering experience.',
      },
    })
    if (!job2Res.ok()) {
      const text = await job2Res.text().catch(() => '')
      throw new Error(`Job 2 creation failed: ${job2Res.status()} ${text}`)
    }
    const job2Json = await job2Res.json()
    const jobId2 = job2Json.id

    console.log(`[seed-flow1] endpointId=${endpointId}, jobId1=${jobId1}, jobId2=${jobId2}`)

    return { endpointId, jobId1, jobId2 }
  } finally {
    await apiStoreContext.dispose()
    await jobBoardContext.dispose()
  }
}
