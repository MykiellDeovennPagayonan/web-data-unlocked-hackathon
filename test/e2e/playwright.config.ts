import { defineConfig, devices } from '@playwright/test'

const headed = process.env.E2E_HEADED === 'true'
const debugArtifacts = process.env.E2E_DEBUG_ARTIFACTS === 'true'

export default defineConfig({
  testDir: '.',
  fullyParallel: false,
  workers: 1,
  reporter: debugArtifacts ? [['html', { open: 'never' }], ['list']] : [['list']],
  outputDir: process.env.PLAYWRIGHT_OUTPUT_DIR ?? '/tmp/playwright-output',
  use: {
    baseURL: 'http://localhost:3001',
    browserName: 'chromium',
    launchOptions: {
      slowMo: headed ? 200 : 0,
      headless: !headed,
    },
    viewport: { width: 1280, height: 720 },
    screenshot: debugArtifacts ? 'only-on-failure' : 'off',
    video: debugArtifacts ? 'retain-on-failure' : 'off',
    trace: debugArtifacts ? 'retain-on-failure' : 'off',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  timeout: 120000,
})
