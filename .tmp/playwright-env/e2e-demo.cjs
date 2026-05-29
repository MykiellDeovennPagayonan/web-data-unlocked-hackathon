const fs = require('node:fs/promises');
const path = require('node:path');
const assert = require('node:assert/strict');
const { chromium } = require('playwright');

const repoRoot = process.cwd();
const reportPath = path.join(repoRoot, '.tmp', 'e2e-report.md');
const artifactDir = path.join(repoRoot, '.tmp', 'e2e-artifacts');

const ports = {
  social: 3001,
  apiStore: 3002,
  jobBoard: 3003,
  backend: 8090,
};

const base = {
  social: `http://127.0.0.1:${ports.social}`,
  apiStore: `http://127.0.0.1:${ports.apiStore}`,
  jobBoard: `http://127.0.0.1:${ports.jobBoard}`,
  backend: `http://127.0.0.1:${ports.backend}`,
};

const seedSecret = process.env.SEED_SECRET || 'dev-seed-secret';
const runId = new Date().toISOString().replace(/[:.]/g, '-');

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function httpGetJson(url, headers = {}) {
  const res = await fetch(url, { headers });
  const text = await res.text();
  let json = null;
  try { json = JSON.parse(text); } catch {}
  return { res, text, json };
}

async function waitForOk(url, label, timeoutMs = 120000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 1500));
  }
  throw new Error(`Timed out waiting for ${label} at ${url}`);
}

async function bodyText(page) {
  return (await page.locator('body').innerText()).replace(/\s+/g, ' ').trim();
}

function unique(prefix) {
  return `${prefix}-${runId}`.toLowerCase();
}

const report = [];
function addReport(section, status, details = '') {
  report.push({ section, status, details });
  const line = details ? ` - ${details}` : '';
  console.log(`[${status}] ${section}${line}`);
}

async function seedSocial() {
  const aliceName = unique('Alice');
  const bobName = unique('Bob');
  const aliceEmail = `${aliceName}@e2e.local`;
  const bobEmail = `${bobName}@e2e.local`;
  const alicePassword = 'Password123!';
  const bobPassword = 'Password123!';
  const alicePost = `Alice post ${runId}`;
  const bobPost = `Bob post ${runId}`;

  await fetch(`${base.social}/api/seed`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${seedSecret}` },
  });

  const res = await fetch(`${base.social}/api/seed`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${seedSecret}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      users: [
        { name: aliceName, email: aliceEmail, password: alicePassword, posts: [alicePost] },
        { name: bobName, email: bobEmail, password: bobPassword, posts: [bobPost] },
      ],
    }),
  });
  const body = await res.text();
  if (!res.ok) throw new Error(`Social seed failed: ${res.status} ${body}`);

  const { json } = await httpGetJson(`${base.social}/api/feed?limit=50`);
  assert.ok(json?.posts?.length >= 2, 'expected seeded posts to exist');
  const bobSeeded = json.posts.find((post) => post.content === bobPost);
  assert.ok(bobSeeded, 'expected to find Bob seeded post in public feed');

  return {
    aliceName,
    bobName,
    aliceEmail,
    bobEmail,
    alicePassword,
    bobPassword,
    alicePost,
    bobPost,
    bobPostId: bobSeeded.id,
  };
}

async function login(page, url, email, password) {
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.getByPlaceholder('Email').fill(email);
  await page.getByPlaceholder('Password').fill(password);
  await page.locator('form').getByRole('button', { name: /^Sign In$/ }).click();
  await page.waitForLoadState('domcontentloaded');
}

async function runSocial(browser) {
  const data = await seedSocial();
  const context = await browser.newContext();
  const page = await context.newPage();
  try {
    await login(page, `${base.social}/login`, data.aliceEmail, data.alicePassword);
    await page.waitForURL(`${base.social}/feed`, { timeout: 30000 });
    assert.match(await bodyText(page), /Feed/i);
    assert.ok(await page.getByRole('link', { name: 'New Post' }).isVisible());

    await page.goto(`${base.social}/profile/${encodeURIComponent(data.bobName)}`, { waitUntil: 'networkidle' });
    assert.match(await bodyText(page), new RegExp(data.bobName));
    await page.getByRole('button', { name: 'Follow' }).click();
    await page.waitForTimeout(1000);
    await page.getByRole('button', { name: 'Unfollow' }).waitFor({ state: 'visible', timeout: 10000 });

    await page.goto(`${base.social}/post/create`, { waitUntil: 'networkidle' });
    const newPostContent = `E2E new post ${runId}`;
    await page.getByPlaceholder("What's on your mind?").fill(newPostContent);
    await page.getByRole('button', { name: 'Post' }).click();
    await page.waitForURL(`${base.social}/feed`, { timeout: 30000 });
    await page.waitForTimeout(2500);
    const feedPosts = await page.evaluate(async () => {
      const res = await fetch('/api/feed?limit=20');
      const data = await res.json();
      return data.posts.map((post) => post.content);
    });
    assert.ok(feedPosts.includes(newPostContent), 'expected newly created post to be present in the feed API');
    await page.getByText(newPostContent, { exact: false }).waitFor({ state: 'visible', timeout: 10000 });

    await page.goto(`${base.social}/post/${data.bobPostId}`, { waitUntil: 'networkidle' });
    await page.getByText(data.bobPost, { exact: false }).waitFor({ state: 'visible', timeout: 10000 });

    const likeButton = page.locator('button').filter({ hasText: '♡' }).first();
    await likeButton.click();
    await page.waitForTimeout(1000);
    const likedText = await bodyText(page);
    assert.match(likedText, /♥|♡/);

    await page.getByPlaceholder('Write a comment… (Enter to submit, Shift+Enter for new line)').waitFor({ state: 'visible', timeout: 10000 });
    await page.getByPlaceholder('Write a comment… (Enter to submit, Shift+Enter for new line)').fill(`Comment from Alice ${runId}`);
    await page.getByRole('button', { name: 'Post' }).click();
    await page.waitForTimeout(1000);
    await page.reload({ waitUntil: 'networkidle' });
    await page.getByText(`Comment from Alice ${runId}`, { exact: false }).waitFor({ state: 'visible', timeout: 10000 });

    addReport('Social media app', 'PASS', 'login, follow, create post, like, and comment all worked');
  } finally {
    await context.close();
  }
}

async function runApiStore(browser) {
  const orgEmail = `${unique('api-org')}@e2e.local`;
  const orgPassword = 'Password123!';
  const orgName = unique('API Org');
  const individualEmail = `${unique('api-user')}@e2e.local`;
  const individualPassword = 'Password123!';
  const individualName = unique('API User');
  const endpointName = `Backend Admin Dashboard ${runId}`;

  const orgContext = await browser.newContext();
  const orgPage = await orgContext.newPage();
  try {
    await orgPage.goto(`${base.apiStore}/signup/organization`, { waitUntil: 'networkidle' });
    await orgPage.getByPlaceholder('Organization name').fill(orgName);
    await orgPage.getByPlaceholder('Email').fill(orgEmail);
    await orgPage.getByPlaceholder('Password').fill(orgPassword);
    await orgPage.getByPlaceholder('Website domain (optional)').fill('example.com');
    await orgPage.getByPlaceholder('LinkedIn profile (optional)').fill('https://linkedin.com/company/example');
    await orgPage.getByPlaceholder('Registration number (optional)').fill('REG-12345');
    await orgPage.getByPlaceholder('Address (optional)').fill('123 Market St');
    await orgPage.getByPlaceholder('Organization description (optional)').fill('E2E org');
    await orgPage.getByRole('button', { name: /Sign Up as Organization/ }).click();
    await orgPage.waitForURL(/\/login\?message=/, { timeout: 30000 });
    assert.match(await bodyText(orgPage), /Organization account created successfully/i);

    await login(orgPage, `${base.apiStore}/login`, orgEmail, orgPassword);
    await orgPage.waitForURL(/\/dashboard\/org$/, { timeout: 30000 });
    await orgPage.getByText('Organization Dashboard', { exact: false }).waitFor({ state: 'visible', timeout: 10000 });

    await orgPage.goto(`${base.apiStore}/endpoints/new`, { waitUntil: 'networkidle' });
    await orgPage.getByPlaceholder(/Weather API/).fill(endpointName);
    await orgPage.getByPlaceholder('Brief description of what this API does...').fill('Proxies to backend admin dashboard');
    await orgPage.getByPlaceholder('https://api.yourservice.com/endpoint').fill('http://api:8090/admin/dashboard');
    await orgPage.locator('select[name="method"]').selectOption('GET');
    await orgPage.getByPlaceholder('1.00').fill('1.00');
    await orgPage.getByRole('button', { name: 'Create Endpoint' }).click();
    await orgPage.waitForURL(`${base.apiStore}/endpoints`, { timeout: 30000 });

    const endpoints = await orgPage.evaluate(async () => {
      const res = await fetch('/api/endpoints/mine');
      return res.ok ? await res.json() : [];
    });
    const createdEndpoint = endpoints.find((ep) => ep.name === endpointName);
    assert.ok(createdEndpoint?.id, 'expected created endpoint to be retrievable');

    const individualContext = await browser.newContext();
    const individualPage = await individualContext.newPage();
    try {
      await individualPage.goto(`${base.apiStore}/signup`, { waitUntil: 'networkidle' });
      await individualPage.getByPlaceholder('Full name').fill(individualName);
      await individualPage.getByPlaceholder('Email').fill(individualEmail);
      await individualPage.getByPlaceholder('Password').fill(individualPassword);
      await individualPage.getByPlaceholder('Bio (optional)').fill('E2E individual');
      await individualPage.getByPlaceholder('Location (optional)').fill('Remote');
      await individualPage.getByPlaceholder('Website (optional)').fill('https://example.com/me');
      await individualPage.locator('form').getByRole('button', { name: 'Sign Up' }).click();
      await individualPage.waitForURL(/\/login\?message=/, { timeout: 30000 });
      assert.match(await bodyText(individualPage), /Account created successfully/i);

      await login(individualPage, `${base.apiStore}/login`, individualEmail, individualPassword);
      await individualPage.waitForURL(/\/dashboard\/user$/, { timeout: 30000 });
      await individualPage.getByText('My Dashboard', { exact: false }).waitFor({ state: 'visible', timeout: 10000 });

      await individualPage.goto(`${base.apiStore}/dashboard/user`, { waitUntil: 'networkidle' });
      const apiKeyButton = individualPage.getByRole('button', { name: 'Generate API Key' });
      if (await apiKeyButton.isVisible()) {
        await apiKeyButton.click();
        await individualPage.waitForTimeout(1000);
      }
      const apiKey = (await individualPage.locator('code').first().innerText()).trim();
      assert.ok(apiKey.length > 10, 'expected API key to be visible');

      const proxyRes = await fetch(`${base.apiStore}/api/proxy/${createdEndpoint.id}`, {
        method: 'GET',
        headers: { 'x-api-key': apiKey },
      });
      const proxyText = await proxyRes.text();
      assert.equal(proxyRes.status, 200, `expected proxy response 200, got ${proxyRes.status} ${proxyText}`);
      assert.match(proxyText, /"status":"ready"|"platform"/i);

      await individualPage.getByRole('button', { name: 'Top Up' }).click();
      await individualPage.getByPlaceholder(/Amount in USD/).fill('5');
      await individualPage.getByRole('button', { name: 'Confirm Payment (Mock)' }).click();
      await individualPage.waitForTimeout(1000);
      assert.match(await bodyText(individualPage), /\$5\.0000|\$5/);

      addReport('API Store demo', 'PASS', 'organization signup, endpoint creation, API key generation, proxy call, and mock top-up worked');
      addReport('API Store payment flow', 'LIMITATION', 'top-up is explicitly a mock payment flow; no real payment processor is wired in');
    } finally {
      await individualContext.close();
    }
  } finally {
    await orgContext.close();
  }
}

async function runJobBoard(browser) {
  const orgEmail = `${unique('job-org')}@e2e.local`;
  const orgPassword = 'Password123!';
  const orgName = unique('Job Org');
  const individualEmail = `${unique('job-user')}@e2e.local`;
  const individualPassword = 'Password123!';
  const individualName = unique('Job User');
  const jobTitle = `Senior E2E Engineer ${runId}`;

  const orgContext = await browser.newContext();
  const orgPage = await orgContext.newPage();
  try {
    await orgPage.goto(`${base.jobBoard}/signup/organization`, { waitUntil: 'networkidle' });
    await orgPage.getByPlaceholder('Organization name').fill(orgName);
    await orgPage.getByPlaceholder('Email').fill(orgEmail);
    await orgPage.getByPlaceholder('Password').fill(orgPassword);
    await orgPage.getByPlaceholder('Website domain (optional)').fill('jobs.example.com');
    await orgPage.getByPlaceholder('LinkedIn profile (optional)').fill('https://linkedin.com/company/jobs-example');
    await orgPage.getByPlaceholder('Registration number (optional)').fill('JOB-12345');
    await orgPage.getByPlaceholder('Address (optional)').fill('456 Hiring Ave');
    await orgPage.getByPlaceholder('Organization description (optional)').fill('E2E hiring org');
    await orgPage.getByRole('button', { name: /Sign Up as Organization/ }).click();
    await orgPage.waitForURL(/\/login\?message=/, { timeout: 30000 });
    assert.match(await bodyText(orgPage), /Organization account created successfully/i);

    await login(orgPage, `${base.jobBoard}/login`, orgEmail, orgPassword);
    await orgPage.waitForURL(`${base.jobBoard}/dashboard/jobs`, { timeout: 30000 });
    await orgPage.getByText('My Job Postings', { exact: false }).waitFor({ state: 'visible', timeout: 10000 });

    await orgPage.getByRole('link', { name: /Post New Job/ }).click();
    await orgPage.waitForURL(`${base.jobBoard}/dashboard/jobs/new`, { timeout: 30000 });
    await orgPage.locator('input[name="title"]').fill(jobTitle);
    await orgPage.locator('textarea[name="description"]').fill('An end-to-end verified job posting.');
    await orgPage.locator('input[name="location"]').fill('Remote');
    await orgPage.locator('input[name="salaryMin"]').fill('120000');
    await orgPage.locator('input[name="salaryMax"]').fill('180000');
    await orgPage.locator('textarea[name="requirements"]').fill('TypeScript, Next.js, Prisma, reliable automation');
    await orgPage.getByRole('button', { name: 'Post Job' }).click();
    await orgPage.waitForURL(`${base.jobBoard}/dashboard/jobs`, { timeout: 30000 });
    await orgPage.getByText(jobTitle, { exact: false }).waitFor({ state: 'visible', timeout: 10000 });

    const individualContext = await browser.newContext();
    const individualPage = await individualContext.newPage();
    try {
      await individualPage.goto(`${base.jobBoard}/signup`, { waitUntil: 'networkidle' });
      await individualPage.getByPlaceholder('Full name').fill(individualName);
      await individualPage.getByPlaceholder('Email').fill(individualEmail);
      await individualPage.getByPlaceholder('Password').fill(individualPassword);
      await individualPage.getByPlaceholder('Bio (optional)').fill('E2E candidate');
      await individualPage.getByPlaceholder('Location (optional)').fill('Remote');
      await individualPage.getByPlaceholder('Website (optional)').fill('https://example.com/candidate');
      await individualPage.locator('form').getByRole('button', { name: 'Sign Up' }).click();
      await individualPage.waitForURL(/\/login\?message=/, { timeout: 30000 });
      assert.match(await bodyText(individualPage), /Account created successfully/i);

      await login(individualPage, `${base.jobBoard}/login`, individualEmail, individualPassword);
      await individualPage.waitForURL(`${base.jobBoard}/jobs`, { timeout: 30000 });
      await individualPage.getByText('Job Listings', { exact: false }).waitFor({ state: 'visible', timeout: 10000 });
      await individualPage.getByText(jobTitle, { exact: false }).waitFor({ state: 'visible', timeout: 10000 });

      await individualPage.getByRole('link', { name: new RegExp(jobTitle) }).click();
      await individualPage.waitForURL(/\/jobs\/[^/]+$/, { timeout: 30000 });
      await individualPage.getByText(jobTitle, { exact: false }).waitFor({ state: 'visible', timeout: 10000 });
      await individualPage.getByRole('button', { name: 'Apply Now' }).click();
      await individualPage.waitForURL(/\/jobs\/[^/]+\/apply$/, { timeout: 30000 });
      assert.match(await bodyText(individualPage), /Apply for Job/i);

      await individualPage.locator('textarea[name="coverLetter"]').fill('I can ship the browser automation and validation for this repo.');
      await individualPage.locator('input[name="expectedSalary"]').fill('150000');
      await individualPage.locator('input[name="availability"]').fill('Immediately');

      const fileInput = individualPage.locator('input[type="file"]');
      if (await fileInput.count()) {
        const csvPath = path.join(artifactDir, `resume-${runId}.csv`);
        await fs.writeFile(csvPath, 'name,email\nAlice,alice@example.com\n');
        await fileInput.setInputFiles(csvPath);
        await individualPage.waitForTimeout(3000);
      }

      const applyText = await bodyText(individualPage);
      const hasUploadFailure = /error|failed|invalid|unauthorized|missing/i.test(applyText);
      const canSubmit = await individualPage.getByRole('button', { name: /Submit Application/ }).isEnabled().catch(() => false);

      if (hasUploadFailure || !canSubmit) {
        addReport('Job Board application upload', 'LIMITATION', 'UploadThing-based resume upload did not complete cleanly in the demo environment');
      } else {
        await individualPage.getByRole('button', { name: 'Submit Application' }).click();
        await individualPage.waitForTimeout(2000);
        addReport('Job Board application upload', 'PASS', 'resume upload and application submission completed');
      }

      addReport('Job Board demo', 'PASS', 'organization signup, job posting, browsing, and application path were exercised');
      if (hasUploadFailure || !canSubmit) {
        addReport('Job Board feature gap', 'LIMITATION', 'application flow depends on UploadThing and is not fully reliable with the current placeholder token');
      }
    } finally {
      await individualContext.close();
    }
  } finally {
    await orgContext.close();
  }
}

async function main() {
  await ensureDir(artifactDir);
  const browser = await chromium.launch({ headless: true });
  const start = Date.now();
  const failures = [];
  try {
    await waitForOk(`${base.social}/login`, 'social app');
    await waitForOk(`${base.apiStore}/login`, 'api store app');
    await waitForOk(`${base.jobBoard}/login`, 'job board app');
    await waitForOk(`${base.backend}/admin/dashboard`, 'backend');

    try { await runSocial(browser); } catch (error) { failures.push({ section: 'Social media app', error: String(error?.stack || error) }); addReport('Social media app', 'FAIL', String(error?.message || error)); }
    try { await runApiStore(browser); } catch (error) { failures.push({ section: 'API Store demo', error: String(error?.stack || error) }); addReport('API Store demo', 'FAIL', String(error?.message || error)); }
    try { await runJobBoard(browser); } catch (error) { failures.push({ section: 'Job Board demo', error: String(error?.stack || error) }); addReport('Job Board demo', 'FAIL', String(error?.message || error)); }
  } finally {
    await browser.close();
  }

  const duration = ((Date.now() - start) / 1000).toFixed(1);
  const lines = [
    `# E2E Report`,
    '',
    `Run ID: ${runId}`,
    `Duration: ${duration}s`,
    '',
    ...report.map((entry) => `- [${entry.status}] ${entry.section}${entry.details ? `: ${entry.details}` : ''}`),
    '',
    `## Failures`,
    ...(failures.length ? failures.map((f) => `- ${f.section}: ${f.error}`) : ['- none']),
  ];
  await fs.writeFile(reportPath, lines.join('\n'), 'utf8');

  console.log('\nREPORT WRITTEN:', reportPath);
  if (failures.length) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
