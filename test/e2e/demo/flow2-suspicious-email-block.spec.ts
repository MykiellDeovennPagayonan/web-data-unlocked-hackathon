import { test, expect } from "@playwright/test";
import { FLOW2 } from "../lib/flow2-data";
import { SOCIAL_MEDIA, API_STORE } from "../fixtures/test-data";
import { signupIndividual } from "../utils/helpers";
import { cleanupAll } from "../utils/cleanup";

const SOCIAL_URL = SOCIAL_MEDIA.url;
const API_STORE_URL = API_STORE.url;

test.describe("Flow 2: Suspicious Email Block", () => {
  test.beforeAll(async () => {
    await cleanupAll();
  });

  test.afterAll(async () => {
    await cleanupAll();
  });

  test("full flow: suspicious domain and pattern blocks on Social Media App and API Store", async ({
    page,
  }) => {
    // ============================================================
    // ACT 1 — SOCIAL MEDIA APP: Three suspicious domain attempts
    // ============================================================
    await page.goto(SOCIAL_URL);
    await page.waitForTimeout(3000);
    for (let i = 0; i < 3; i++) {
      const attempt = FLOW2.socialAttempts[i];
      await page.goto(`${SOCIAL_URL}/signup`);
      await expect(page.locator("text=Join Publish.").first()).toBeVisible();
      await signupIndividual(page, attempt);
      await expect(page.getByText(attempt.expectedError).first()).toBeVisible({
        timeout: 5000,
      });
      await page.waitForTimeout(1500);
    }

    // ============================================================
    // ACT 2 — SOCIAL MEDIA APP: Two test-pattern @gmail.com attempts
    // ============================================================
    for (let i = 3; i < 5; i++) {
      const attempt = FLOW2.socialAttempts[i];
      await page.goto(`${SOCIAL_URL}/signup`);
      await expect(page.locator("text=Join Publish.").first()).toBeVisible();
      await signupIndividual(page, attempt);
      await expect(page.getByText(attempt.expectedError).first()).toBeVisible({
        timeout: 5000,
      });
      await page.waitForTimeout(1500);
    }

    // ============================================================
    // ACT 3 — API STORE: Two more failed attempts
    // ============================================================
    await page.goto(API_STORE_URL);
    await page.waitForTimeout(3000);
    for (let i = 0; i < FLOW2.apiStoreAttempts.length; i++) {
      const attempt = FLOW2.apiStoreAttempts[i];
      await page.goto(`${API_STORE_URL}/signup`);
      await expect(page.locator("text=Create Account").first()).toBeVisible();
      await signupIndividual(page, attempt);
      await expect(page.getByText(attempt.expectedError).first()).toBeVisible({
        timeout: 10000,
      });
      await page.waitForTimeout(1500);
    }
    await page.waitForTimeout(5000);
  });
});
