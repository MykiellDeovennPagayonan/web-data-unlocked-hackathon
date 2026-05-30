/**
 * Test data for Flow 4 — Trusted Organization Certificate.
 */

export const TEST_PASSWORD = 'TestPass123!'

export const FLOW4 = {
  apiStoreOrg: {
    name: 'Certified Solutions Inc',
    email: 'certified.solutions@e2e.local',
    password: TEST_PASSWORD,
    domain: 'certified-solutions.io',
    linkedin: 'https://linkedin.com/company/certified-solutions',
    regNumber: 'US-CA-999888',
    address: '100 Trust Ave, San Francisco, CA 94105',
    description: 'Enterprise SaaS with a spotless compliance record.',
  },
  jobBoardOrg: {
    name: 'Certified Solutions Inc',
    email: 'certified.solutions.job@e2e.local',
    password: TEST_PASSWORD,
    domain: 'certified-solutions.io',
    linkedin: 'https://linkedin.com/company/certified-solutions',
    regNumber: 'US-CA-999888',
    address: '100 Trust Ave, San Francisco, CA 94105',
    description: 'Enterprise SaaS with a spotless compliance record.',
  },
} as const
