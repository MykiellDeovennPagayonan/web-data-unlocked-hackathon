/**
 * Test data for Flow 5 — Trusted Individual Portable KYC.
 */

export const TEST_PASSWORD = 'TestPass123!'

export const FLOW5 = {
  socialMediaUser: {
    name: 'Maya Chen',
    email: 'maya.chen@e2e.local',
    password: TEST_PASSWORD,
    bio: 'Full-stack developer and open-source contributor.',
    location: 'Singapore',
    website: 'https://mayachen.dev',
  },
  apiStoreUser: {
    name: 'Maya Chen',
    email: 'maya.chen.api@e2e.local',
    password: TEST_PASSWORD,
    bio: 'Full-stack developer and open-source contributor.',
    location: 'Singapore',
    website: 'https://mayachen.dev',
  },
} as const
