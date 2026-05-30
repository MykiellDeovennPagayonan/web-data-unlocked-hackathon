/**
 * Test data for Flow 2 — Suspicious Email Block.
 * Uses randomized local parts so repeated runs don't hit "already exists".
 */

export const TEST_PASSWORD = 'TestPass123!'

const runPrefix = `f2-${Date.now()}`

export const FLOW2 = {
  runPrefix,

  // Social Media App attempts
  socialAttempts: [
    {
      name: 'Hacker One',
      email: `${runPrefix}.hacker@test.com`,
      password: TEST_PASSWORD,
      expectedError: 'You have been flagged as a suspicious user.',
    },
    {
      name: 'Hacker Two',
      email: `${runPrefix}.hacker@example.com`,
      password: TEST_PASSWORD,
      expectedError: 'You have been flagged as a suspicious user.',
    },
    {
      name: 'Hacker Three',
      email: `${runPrefix}.hacker@mailinator.com`,
      password: TEST_PASSWORD,
      expectedError: 'You have been flagged as a suspicious user.',
    },
    {
      name: 'Test User',
      email: `${runPrefix}.test@gmail.com`,
      password: TEST_PASSWORD,
      expectedError: 'You have been flagged as a suspicious user.',
    },
    {
      name: 'Test User 2',
      email: `${runPrefix}.testuser@gmail.com`,
      password: TEST_PASSWORD,
      expectedError: 'You have been flagged as a suspicious user.',
    },
  ],

  // API Store attempts
  apiStoreAttempts: [
    {
      name: 'Hacker Four',
      email: `${runPrefix}.hacker@tempmail.com`,
      password: TEST_PASSWORD,
      expectedError: 'You have been flagged as a suspicious user.',
    },
    {
      name: 'Tester',
      email: `${runPrefix}.tester@gmail.com`,
      password: TEST_PASSWORD,
      expectedError: 'You have been flagged as a suspicious user.',
    },
  ],
} as const
