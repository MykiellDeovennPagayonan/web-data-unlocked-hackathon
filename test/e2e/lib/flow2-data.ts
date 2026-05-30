/**
 * Test data for Flow 2 — Suspicious Email Block.
 */

export const TEST_PASSWORD = 'TestPass123!'

export const FLOW2 = {
  socialAttempts: [
    {
      name: 'Marcus Webb',
      email: 'mwebb@test.com',
      password: TEST_PASSWORD,
      expectedError: 'You have been flagged as a suspicious user.',
    },
    {
      name: 'Jordan Riley',
      email: 'j.riley@example.com',
      password: TEST_PASSWORD,
      expectedError: 'You have been flagged as a suspicious user.',
    },
    {
      name: 'Priya Nair',
      email: 'pnair@mailinator.com',
      password: TEST_PASSWORD,
      expectedError: 'You have been flagged as a suspicious user.',
    },
    {
      name: 'Daniel Okafor',
      email: 'testuser123@gmail.com',
      password: TEST_PASSWORD,
      expectedError: 'You have been flagged as a suspicious user.',
    },
    {
      name: 'Sophie Brennan',
      email: 'example.user99.test@gmail.com',
      password: TEST_PASSWORD,
      expectedError: 'You have been flagged as a suspicious user.',
    },
  ],

  // API Store attempts
  apiStoreAttempts: [
    {
      name: 'Elena Marsh',
      email: 'e.marsh@tempmail.com',
      password: TEST_PASSWORD,
      expectedError: 'You have been flagged as a suspicious user.',
    },
    {
      name: 'Ryan Cho',
      email: 'test.account88@gmail.com',
      password: TEST_PASSWORD,
      expectedError: 'You have been flagged as a suspicious user.',
    },
  ],
} as const