/**
 * Deterministic test credentials for all demo apps.
 * Using fixed values so tests are reproducible and easy to inspect.
 */

export const TEST_PASSWORD = 'TestPass123!'

export const API_STORE = {
  url: 'http://localhost:3002',
  individual: {
    name: 'Test User API',
    email: 'test.user.api@e2e.local',
    password: TEST_PASSWORD,
    bio: 'E2E test user for API Store',
    location: 'Test City',
    website: 'https://test.example.com',
  },
  organization: {
    name: 'Test Org API',
    email: 'test.org.api@e2e.local',
    password: TEST_PASSWORD,
    domain: 'testorg-api.example.com',
    linkedin: 'https://linkedin.com/company/testorg-api',
    regNumber: 'REG-API-12345',
    address: '123 API Test Lane, Test City',
    description: 'E2E test organization for API Store',
  },
  endpoint: {
    name: 'Test Hello Endpoint',
    description: 'A simple hello world endpoint for e2e testing',
    forwardUrl: 'http://localhost:8090',
    method: 'GET',
    pricePer1k: 1,
  },
} as const

export const JOB_BOARD = {
  url: 'http://localhost:3003',
  individual: {
    name: 'Test Seeker',
    email: 'test.seeker@e2e.local',
    password: TEST_PASSWORD,
    bio: 'E2E test job seeker',
    location: 'Test City',
    website: 'https://seeker.example.com',
  },
  organization: {
    name: 'Test Org Job',
    email: 'test.org.job@e2e.local',
    password: TEST_PASSWORD,
    domain: 'testorg-job.example.com',
    linkedin: 'https://linkedin.com/company/testorg-job',
    regNumber: 'REG-JOB-12345',
    address: '456 Job Test Ave, Test City',
    description: 'E2E test organization for Job Board',
  },
  job: {
    title: 'Senior E2E Tester',
    description: 'We are looking for a skilled e2e tester to validate our demo applications.',
    location: 'Remote',
    salaryMin: 80000,
    salaryMax: 120000,
    requirements: 'Playwright experience, TypeScript knowledge, attention to detail',
  },
  application: {
    coverLetter: 'I am excited to apply for this position. I have extensive experience in end-to-end testing.',
    expectedSalary: 100000,
    availability: 'Immediate',
    resumeUrl: 'https://example.com/resume.pdf',
  },
} as const

export const SOCIAL_MEDIA = {
  url: 'http://localhost:3001',
  individual: {
    name: 'Test Social',
    email: 'test.social@e2e.local',
    password: TEST_PASSWORD,
    bio: 'E2E test user for Social Media',
    location: 'Test City',
    website: 'https://social.example.com',
  },
  organization: {
    name: 'Test Org Social',
    email: 'test.org.social@e2e.local',
    password: TEST_PASSWORD,
    domain: 'testorg-social.example.com',
    linkedin: 'https://linkedin.com/company/testorg-social',
    regNumber: 'REG-SOC-12345',
    address: '789 Social Test Blvd, Test City',
    description: 'E2E test organization for Social Media',
  },
  seedUsers: [
    {
      name: 'Alice Seed',
      email: 'seed.user.1@e2e.local',
      password: TEST_PASSWORD,
      posts: [
        'Hello from Alice! This is a seeded post for e2e testing.',
        'Another day, another test. Excited to see how the demo works!',
      ],
    },
    {
      name: 'Bob Seed',
      email: 'seed.user.2@e2e.local',
      password: TEST_PASSWORD,
      posts: [
        'Bob here! Just seeding some data for the social media demo.',
        'Testing is fun when everything works as expected.',
      ],
    },
  ],
  newPost: {
    content: 'This is a brand new post created by our e2e test user!',
  },
  comment: 'Great post! This comment was added during e2e testing.',
} as const
