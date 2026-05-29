# Demo E2E Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. Use `test-driven-development` for every behavior change: write the failing test, run it and confirm the expected failure, implement the smallest fix, then rerun the test.

**Goal:** Fix the confirmed demo E2E failures from `DEMO_E2E_FINDINGS_REPORT.md` without weakening TrustLayer enforcement or changing public API contracts unnecessarily.

**Architecture:** Keep platform identity scoped by API key, not by caller-supplied request body fields. Fix the TrustLayer SDK/API validation mismatch first, then make API Store organization signup fail closed on blocked, flagged, unverifiable, or failed TrustLayer checks.

**Tech Stack:** pnpm workspace, Next.js demo apps, NestJS TrustLayer API, Prisma, Playwright E2E tests, Jest API tests, TypeScript.

---

## Command Convention

This plan is written for a macOS/Linux intern first.

- On macOS/Linux, run commands from the repository root with `bash`, `zsh`, or another POSIX shell.
- On Windows with WSL, prefer cloning/running from a Linux-native path such as `~/work/web-data-unlocked-hackathon`, matching the README performance guidance. Replace that path with the actual WSL path if different.
- Do not run the Windows/WSL wrapper on macOS.
- If a command fails because `pnpm` is unavailable, install/enable the project package manager first: `corepack enable && corepack prepare pnpm@10.29.3 --activate`.
- For documented demo E2E flows, prefer the root README commands:

```bash
pnpm demo:e2e:help
pnpm demo:e2e:flow1
pnpm demo:e2e:flow2
pnpm demo:e2e:flow3
pnpm demo:e2e:flow45
pnpm demo:e2e:stress
pnpm demo:e2e:all
```

- Each `pnpm demo:e2e:*` flow command runs cleanup first and writes `.tmp/demo-e2e-results.json` plus evidence under `.tmp/demo-evidence/`.

Example:

```bash
# macOS/Linux
pnpm --filter api build

# Windows/WSL
wsl -d Ubuntu -- bash -lc "cd ~/work/web-data-unlocked-hackathon && pnpm --filter api build"
```

## Improved Prompt For An Intern Or Agent

Use this prompt instead of the original broad E2E prompt when assigning the fix work:

```markdown
Task: Fix confirmed demo E2E bugs from `DEMO_E2E_FINDINGS_REPORT.md`.

Read first:
- `DEMO_E2E_FINDINGS_REPORT.md`
- `docs/demo/flow-1-free-tier-abuser.md`
- `docs/demo/flow-2-fake-job-company.md`
- `packages/tunai/src/identity.ts`
- `packages/tunai/src/organization.ts`
- `packages/tunai/src/platform-user.ts`
- `apps/api/src/modules/identity/platform-users/dto/create-platform-user.dto.ts`
- `apps/api/src/modules/identity/platform-users/platform-users.controller.ts`
- `apps/demo/api-store/app/api/users/route.ts`

Scope:
- Only test and modify the local repository/demo stack.
- Do not test public or external systems.
- Do not change database schema, auth, API key scoping, or production deployment settings.
- Preserve the current architecture: platform identity comes from the API key guard, not from untrusted request body input.

Required fixes:
1. `POST /v1/platform-users` must accept SDK/demo requests that omit `platformId`, because the backend already gets platform scope from `x-api-key`.
2. The `@trust-layer/tunai` SDK must continue enrolling individuals and organizations successfully through `/v1/platform-users`.
3. API Store organization registration must fail closed when TrustLayer enrollment/background-check fails or returns `blocked`, `flagged`, or `not_found`.
4. API Store must not leave local demo users behind after a rejected organization registration.

TDD rules:
- Write or update a failing test before each behavior change.
- Run the specific test and confirm it fails for the expected reason.
- Implement the smallest fix.
- Rerun the specific test and then the relevant broader validation command.

Expected deliverables:
- Minimal code changes.
- Tests proving the regression is fixed.
- Updated `DEMO_E2E_FINDINGS_REPORT.md` only if you rerun and replace evidence.
- A short completion note with commands run, pass/fail status, risks, and any remaining manual retest steps.
```

## Current Failure Summary

Confirmed from `DEMO_E2E_FINDINGS_REPORT.md`:

- `BUG-1`: Demo signup TrustLayer enrollment fails because `POST /v1/platform-users` rejects SDK requests that omit `platformId`. Result: no `platform_users` rows, aliases do not link, and Flow 1 trust-score degradation never starts.
- `BUG-2`: API Store organization signup accepts blacklisted and unverifiable organizations because TrustLayer errors are caught as non-fatal and the route still returns `201`.

Important correction for implementers:

- Do not "fix" `BUG-1` by trusting a client-supplied `platformId` from demo apps.
- `PlatformUsersController.createPlatformUser()` already receives `platformId` from `@CurrentPlatform()`, which is populated by `ApiKeyGuard`.
- The correct fix is to make request-body `platformId` unnecessary for `/v1/platform-users`, while still passing the authenticated platform ID into the service layer.

## Files To Inspect Before Editing

- `DEMO_E2E_FINDINGS_REPORT.md`
- `docs/demo/flow-1-free-tier-abuser.md`
- `docs/demo/flow-2-fake-job-company.md`
- `apps/api/src/modules/identity/platform-users/dto/create-platform-user.dto.ts`
- `apps/api/src/modules/identity/platform-users/platform-users.controller.ts`
- `apps/api/src/modules/identity/platform-users/service-methods/create-platform-user.ts`
- `apps/api/test/e2e/platform-identity-tests/b-identity.e2e-spec.ts`
- `packages/tunai/src/identity.ts`
- `packages/tunai/src/organization.ts`
- `packages/tunai/src/types.ts`
- `apps/demo/api-store/app/api/users/route.ts`

## Files Expected To Change

- Modify: `apps/api/src/modules/identity/platform-users/dto/create-platform-user.dto.ts`
- Modify: `apps/api/test/e2e/platform-identity-tests/b-identity.e2e-spec.ts`
- Modify: `apps/demo/api-store/app/api/users/route.ts`
- Optional modify: `packages/tunai/src/types.ts`
- Optional modify: `test/e2e/api-store.spec.ts` or create a focused Playwright API regression spec if the intern chooses E2E coverage for API Store signup enforcement.

Do not modify:

- Prisma schema files unless a test proves the schema is actually wrong.
- Generated clients manually.
- Docker compose or deployment settings.
- API key authentication/scoping behavior.

## Task 1: Prove `/v1/platform-users` Should Not Require Body `platformId`

**Files:**
- Modify: `apps/api/test/e2e/platform-identity-tests/b-identity.e2e-spec.ts`
- Modify after RED: `apps/api/src/modules/identity/platform-users/dto/create-platform-user.dto.ts`

- [ ] **Step 1: Write the failing E2E test**

In `apps/api/test/e2e/platform-identity-tests/b-identity.e2e-spec.ts`, add this test inside `describe('B.3 Platform Users', ...)`, after `B.3.1 creates a platform user`:

```typescript
it('B.3.1b creates a platform user without trusting body platformId', async () => {
  const externalUserIdWithoutBodyPlatform = unique('user-no-body-platform');
  const emailWithoutBodyPlatform = `${unique('pu-no-body-platform')}@example.com`;

  const identityRes = await request(testApp.app.getHttpServer())
    .post('/admin/identities')
    .send({
      email: emailWithoutBodyPlatform,
      encryptedEmail: 'ENC(no-body-platform@example.com)',
      encryptedFullName: 'ENC(No Body Platform)',
      trustStatus: 'clean',
    })
    .expect(201);

  tracker.trackIdentity(identityRes.body.id);

  const res = await request(testApp.app.getHttpServer())
    .post('/v1/platform-users')
    .set('x-api-key', apiKey)
    .send({
      identityId: identityRes.body.id,
      externalUserId: externalUserIdWithoutBodyPlatform,
      statusOnPlatform: 'active',
    })
    .expect(201);

  expect(res.body).toHaveProperty('id');
  expect(res.body.identityId).toBe(identityRes.body.id);
  expect(res.body.platformId).toBe(platformId);
  expect(res.body.externalUserId).toBe(externalUserIdWithoutBodyPlatform);

  tracker.trackPlatformUser(res.body.id);
});
```

- [ ] **Step 2: Run RED**

Run the focused API e2e test:

```bash
pnpm --filter api test:e2e -- --runInBand test/e2e/platform-identity-tests/b-identity.e2e-spec.ts
```

Windows/WSL equivalent:

```bash
wsl -d Ubuntu -- bash -lc "cd ~/work/web-data-unlocked-hackathon && pnpm --filter api test:e2e -- --runInBand test/e2e/platform-identity-tests/b-identity.e2e-spec.ts"
```

Expected RED result:

- The new test fails with a validation error that says `platformId must be a string`, or an equivalent `400` response.
- If it fails because the test DB/services are not running, start the documented local stack first and rerun. Do not implement until you see the expected validation failure.

- [ ] **Step 3: Implement the smallest API DTO fix**

Edit `apps/api/src/modules/identity/platform-users/dto/create-platform-user.dto.ts`.

Change:

```typescript
  @IsString()
  platformId!: string;
```

To:

```typescript
  @IsOptional()
  @IsString()
  platformId?: string;
```

Reason:

- The controller overwrites `platformId` with the authenticated platform ID:

```typescript
return this.platformUsersService.createPlatformUser({
  ...dto,
  platformId,
});
```

- Making the DTO field optional fixes validation while preserving server-side platform scoping.

- [ ] **Step 4: Run GREEN**

Run:

```bash
pnpm --filter api test:e2e -- --runInBand test/e2e/platform-identity-tests/b-identity.e2e-spec.ts
```

Windows/WSL equivalent:

```bash
wsl -d Ubuntu -- bash -lc "cd ~/work/web-data-unlocked-hackathon && pnpm --filter api test:e2e -- --runInBand test/e2e/platform-identity-tests/b-identity.e2e-spec.ts"
```

Expected GREEN result:

- The new `B.3.1b` test passes.
- Existing B.3 tests still pass, especially cross-tenancy isolation.

- [ ] **Step 5: Typecheck API and SDK**

Run:

```bash
pnpm --filter api build
pnpm --filter @trust-layer/tunai typecheck
```

Windows/WSL equivalent:

```bash
wsl -d Ubuntu -- bash -lc "cd ~/work/web-data-unlocked-hackathon && pnpm --filter api build && pnpm --filter @trust-layer/tunai typecheck"
```

Expected result:

- Both commands pass.

## Task 2: Guard Against Platform ID Spoofing Regression

**Files:**
- Modify: `apps/api/test/e2e/platform-identity-tests/b-identity.e2e-spec.ts`
- No production change expected unless this test fails.

- [ ] **Step 1: Write the failing-or-protective test**

Add this test after `B.3.1b`:

```typescript
it('B.3.1c ignores a spoofed body platformId and uses the API key platform', async () => {
  const platformBRes = await request(testApp.app.getHttpServer())
    .post('/admin/platforms')
    .send({
      name: 'Spoof Target Platform',
      domain: unique('spoof-target.example.com'),
      status: 'trial',
      strictnessLevel: 'low',
    })
    .expect(201);

  tracker.trackPlatform(platformBRes.body.id);

  const emailForSpoofTest = `${unique('pu-spoof-platform')}@example.com`;
  const identityRes = await request(testApp.app.getHttpServer())
    .post('/admin/identities')
    .send({
      email: emailForSpoofTest,
      encryptedEmail: 'ENC(spoof@example.com)',
      encryptedFullName: 'ENC(Spoof Test)',
      trustStatus: 'clean',
    })
    .expect(201);

  tracker.trackIdentity(identityRes.body.id);

  const externalUserIdForSpoofTest = unique('user-spoof-platform');

  const res = await request(testApp.app.getHttpServer())
    .post('/v1/platform-users')
    .set('x-api-key', apiKey)
    .send({
      identityId: identityRes.body.id,
      platformId: platformBRes.body.id,
      externalUserId: externalUserIdForSpoofTest,
      statusOnPlatform: 'active',
    })
    .expect(201);

  expect(res.body.platformId).toBe(platformId);
  expect(res.body.platformId).not.toBe(platformBRes.body.id);

  tracker.trackPlatformUser(res.body.id);
});
```

- [ ] **Step 2: Run the test**

Run:

```bash
pnpm --filter api test:e2e -- --runInBand test/e2e/platform-identity-tests/b-identity.e2e-spec.ts
```

Windows/WSL equivalent:

```bash
wsl -d Ubuntu -- bash -lc "cd ~/work/web-data-unlocked-hackathon && pnpm --filter api test:e2e -- --runInBand test/e2e/platform-identity-tests/b-identity.e2e-spec.ts"
```

Expected result:

- Test passes if the controller is already correctly overriding `platformId`.
- If it fails, fix only `PlatformUsersController.createPlatformUser()` so the spread order keeps `platformId` last:

```typescript
return this.platformUsersService.createPlatformUser({
  ...dto,
  platformId,
});
```

Do not change the API to accept caller-supplied platform scope.

## Task 3: Make API Store Organization Registration Fail Closed

**Files:**
- Modify after RED: `apps/demo/api-store/app/api/users/route.ts`
- Test: use focused route-level or Playwright/API-level coverage. Prefer Playwright API coverage if route-level mocking is too costly in this repo.

Current vulnerable behavior:

```typescript
      } catch (tlErr) {
        console.error("[TrustLayer] org registration/background check failed:", tlErr)
      }
```

This logs the error but continues to:

```typescript
return NextResponse.json(user, { status: 201 })
```

That is correct for low-risk individual demo enrollment only if product intentionally allows non-fatal telemetry failures. It is not correct for organization registration because API Store requires verification before allowing organizations to sell endpoints.

- [ ] **Step 1: Add a focused regression test**

Create `test/e2e/api-store-trustlayer-enforcement.spec.ts`.

Use direct API calls instead of browser selectors to avoid UI flakiness. This test covers the documented fake-company fallback from Flow 2: an organization with no credible public footprint must not be accepted by API Store.

```typescript
import { test, expect } from '@playwright/test';

const API_STORE_URL = process.env.API_STORE_URL ?? 'http://localhost:3002';

function unique(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
}

test.describe('API Store TrustLayer organization enforcement', () => {
  test('rejects unverifiable organizations instead of creating accounts', async ({ request }) => {
    const suffix = unique('phantom');
    const email = `${suffix}@e2e.local`;

    const res = await request.post(`${API_STORE_URL}/api/users`, {
      data: {
        email,
        password: 'Password123!',
        name: `Phantom Labs ${suffix}`,
        role: 'ORGANIZATION',
        domain: `${suffix}.invalid`,
        linkedin: '',
        regNumber: `REG-${suffix}`,
        address: '404 Nowhere Ave',
        description: 'No credible public footprint; should be rejected by API Store.',
      },
    });

    expect(res.status()).toBe(403);

    const body = await res.json();
    expect(body.message).toContain('could not be verified');
  });
});
```

For the blacklisted-known-org branch of Flow 2, use Task 5's manual retest because the setup requires a reporter session and community-report escalation across Job Board and TrustLayer. Do not skip that manual retest.

- [ ] **Step 2: Run RED**

Run:

```bash
pnpm --dir test/e2e test api-store-trustlayer-enforcement.spec.ts
```

Windows/WSL equivalent:

```bash
wsl -d Ubuntu -- bash -lc "cd ~/work/web-data-unlocked-hackathon && pnpm --dir test/e2e test api-store-trustlayer-enforcement.spec.ts"
```

Expected RED result:

- The unverifiable org scenario returns `201` before the fix, matching `.tmp/demo-evidence/flow-2-api-store-notfound.json`.
- If it already returns `403`, inspect recent changes before editing production code; the bug may already be partially fixed.

- [ ] **Step 3: Implement fail-closed handling**

In `apps/demo/api-store/app/api/users/route.ts`, keep the existing user creation flow but replace the organization TrustLayer catch with failure cleanup and `403`.

The intended shape:

```typescript
    if (role === "ORGANIZATION") {
      try {
        const org = await tl.enrollOrganization({
          legalName: name,
          domain: profileData.domain ?? "",
          registrationNumber: profileData.regNumber ?? "",
          country: "US",
          industry: "general",
          externalUserId: user.id,
        })

        const check = await tl.runBackgroundCheck({
          entityType: "organization",
          orgId: org.orgId,
          triggeredBy: "registration",
          entityName: name,
        })

        if (
          check.overallVerdict === "blocked" ||
          check.overallVerdict === "flagged" ||
          check.overallVerdict === "not_found"
        ) {
          await prisma.user.delete({ where: { id: user.id } })
          return NextResponse.json(
            {
              message:
                "Your organization could not be verified. Please contact support.",
              verdict: check.overallVerdict,
            },
            { status: 403 }
          )
        }
      } catch (tlErr) {
        console.error("[TrustLayer] org registration/background check failed:", tlErr)
        await prisma.user.delete({ where: { id: user.id } })
        return NextResponse.json(
          {
            message:
              "Your organization could not be verified. Please contact support.",
            verdict: "verification_failed",
          },
          { status: 403 }
        )
      }
    }
```

Implementation notes:

- Keep `blocked`, `flagged`, and `not_found` rejected for API Store organization signup.
- Do not reject `clean` or `null` unless product rules say pending checks must block. If `overallVerdict` can be `null` while pending, inspect background-check service behavior before choosing.
- Ensure local user cleanup happens before returning `403`.
- Do not swallow cleanup errors silently. If cleanup fails, return `500` or log clearly after inspecting existing error-handling style.

- [ ] **Step 4: Run GREEN**

Run the focused enforcement test:

```bash
pnpm --dir test/e2e test api-store-trustlayer-enforcement.spec.ts
```

Windows/WSL equivalent:

```bash
wsl -d Ubuntu -- bash -lc "cd ~/work/web-data-unlocked-hackathon && pnpm --dir test/e2e test api-store-trustlayer-enforcement.spec.ts"
```

Expected GREEN result:

- Blacklisted org signup returns `403`.
- Unverifiable org signup returns `403`.
- The local API Store user is not present after rejection.

- [ ] **Step 5: Run API Store build**

Run:

```bash
pnpm --filter demo-api-store build
```

Windows/WSL equivalent:

```bash
wsl -d Ubuntu -- bash -lc "cd ~/work/web-data-unlocked-hackathon && pnpm --filter demo-api-store build"
```

Expected result:

- Build passes.

## Task 4: Verify SDK Enrollment Still Works End-To-End

**Files:**
- Optional modify: `packages/tunai/src/types.ts`
- Optional modify: `packages/tunai/src/identity.ts`
- Optional modify: `packages/tunai/src/organization.ts`

This task may require no production change after Task 1. The purpose is to prevent accidental SDK drift.

- [ ] **Step 1: Confirm current SDK request shape is intentional**

Inspect:

```typescript
post<PlatformUser>(config, "/v1/platform-users", {
  identityId: identity.id,
  externalUserId: params.externalUserId,
})
```

And:

```typescript
post<PlatformUser>(config, "/v1/platform-users", {
  identityId: org.id,
  externalUserId,
})
```

Expected:

- Neither request should include `platformId`.
- Platform scope should come from `x-api-key`.

- [ ] **Step 2: Run SDK typecheck**

Run:

```bash
pnpm --filter @trust-layer/tunai typecheck
```

Windows/WSL equivalent:

```bash
wsl -d Ubuntu -- bash -lc "cd ~/work/web-data-unlocked-hackathon && pnpm --filter @trust-layer/tunai typecheck"
```

Expected result:

- Typecheck passes.

- [ ] **Step 3: Only if typecheck fails, update SDK types**

If `PlatformUser` or enrollment types assume a client-supplied `platformId`, split request and response types in `packages/tunai/src/types.ts`.

Do not change runtime SDK behavior to send `platformId`.

## Task 5: Manual Retest Of Demo Flows 1 And 2

**Files:**
- No production code edits expected.
- Evidence may go under `.tmp/demo-evidence/`.
- Update `DEMO_E2E_FINDINGS_REPORT.md` only if explicitly refreshing the findings report.

- [ ] **Step 1: Start the local demo stack**

Use one of the README-supported startup paths. The demo E2E commands do cleanup and run scenarios, but they do not replace starting the local services.

Option A, full Docker stack:

```bash
docker compose up --build
```

Option B, local development stack:

```bash
pnpm install
docker compose up -d postgres redis
pnpm --filter api start:dev
pnpm --filter api exec ts-node --project tsconfig.scripts.json scripts/seed-demo-platforms.ts
pnpm --filter web dev
pnpm --filter social-media-app dev
pnpm --filter demo-api-store dev
pnpm --filter demo-job-board dev
```

Notes:

- Run the long-lived service commands in separate terminals unless using Docker.
- For constrained WSL machines, follow README lower-resource guidance and prefer a Linux-native path like `~/work/web-data-unlocked-hackathon`.
- Do not run demo flow commands until the API and demo apps are reachable locally.

- [ ] **Step 2: Retest Flow 1**

Run the current README demo command. It runs cleanup first and writes `.tmp/demo-e2e-results.json` plus evidence under `.tmp/demo-evidence/`.

```bash
pnpm demo:e2e:flow1
```

Windows/WSL equivalent:

```bash
wsl -d Ubuntu -- bash -lc "cd ~/work/web-data-unlocked-hackathon && pnpm demo:e2e:flow1"
```

Use `docs/demo/flow-1-free-tier-abuser.md` to interpret the result file.

Required checks:

- API Store individual signups return `201`.
- TrustLayer has `platform_users` rows for created API Store users.
- Repeated same-device/same-IP aliases create alias or risk evidence.
- Trust score drops from neutral baseline.
- Job Board third application is throttled after the same actor pivots.

Evidence to collect:

- Signup response JSON.
- Trust score response JSON.
- SQL query or API output showing `platform_users`.
- SQL query or API output showing alias/risk evidence.
- Job Board third application response.
- `.tmp/demo-e2e-results.json`
- `.tmp/demo-evidence/flow-1-*.json`

- [ ] **Step 3: Retest Flow 2**

Run:

```bash
pnpm demo:e2e:flow2
```

Windows/WSL equivalent:

```bash
wsl -d Ubuntu -- bash -lc "cd ~/work/web-data-unlocked-hackathon && pnpm demo:e2e:flow2"
```

Use `docs/demo/flow-2-fake-job-company.md` to interpret the result file.

Required checks:

- Job Board fake org registration succeeds.
- Community reports escalate registry severity to active blacklist.
- API Store signup for same org returns `403`.
- API Store signup for fake/unverifiable fallback returns `403`.
- No rejected API Store organization user remains in the local app database.

Evidence to collect:

- Community report responses.
- Registry response or DB output.
- API Store rejected signup responses.
- DB query showing cleanup after rejection.
- `.tmp/demo-e2e-results.json`
- `.tmp/demo-evidence/flow-2-*.json`

## Task 6: Broader Regression Validation

Run these after all targeted tests pass:

- [ ] **API platform identity e2e**

```bash
pnpm --filter api test:e2e -- --runInBand test/e2e/platform-identity-tests/b-identity.e2e-spec.ts
```

- [ ] **API build**

```bash
pnpm --filter api build
```

- [ ] **SDK typecheck**

```bash
pnpm --filter @trust-layer/tunai typecheck
```

- [ ] **API Store build**

```bash
pnpm --filter demo-api-store build
```

- [ ] **Relevant E2E tests**

```bash
pnpm demo:e2e:flow1
pnpm demo:e2e:flow2
pnpm demo:e2e:flow45
```

Optional full demo matrix:

```bash
pnpm demo:e2e:all
```

Windows/WSL equivalents for the broad validation commands:

```bash
wsl -d Ubuntu -- bash -lc "cd ~/work/web-data-unlocked-hackathon && pnpm --filter api test:e2e -- --runInBand test/e2e/platform-identity-tests/b-identity.e2e-spec.ts"
wsl -d Ubuntu -- bash -lc "cd ~/work/web-data-unlocked-hackathon && pnpm --filter api build"
wsl -d Ubuntu -- bash -lc "cd ~/work/web-data-unlocked-hackathon && pnpm --filter @trust-layer/tunai typecheck"
wsl -d Ubuntu -- bash -lc "cd ~/work/web-data-unlocked-hackathon && pnpm --filter demo-api-store build"
wsl -d Ubuntu -- bash -lc "cd ~/work/web-data-unlocked-hackathon && pnpm demo:e2e:flow1"
wsl -d Ubuntu -- bash -lc "cd ~/work/web-data-unlocked-hackathon && pnpm demo:e2e:flow2"
wsl -d Ubuntu -- bash -lc "cd ~/work/web-data-unlocked-hackathon && pnpm demo:e2e:flow45"
```

If the Playwright suite fails due existing selector/redirect flakiness noted in the findings report, document:

- The failing selector or navigation.
- Whether the failure is related to this fix.
- The manual API-level evidence that still proves the fixed behavior.

## Review Checklist Before Handoff

- [ ] `POST /v1/platform-users` works without body `platformId`.
- [ ] A spoofed body `platformId` cannot override API-key platform scope.
- [ ] `@trust-layer/tunai` enrollment still omits body `platformId`.
- [ ] API Store rejects `blocked`, `flagged`, and `not_found` organization verdicts.
- [ ] API Store rejects organization signup when TrustLayer enrollment/background check errors.
- [ ] Rejected organization signup deletes the local demo user.
- [ ] Flow 1 has evidence that `platform_users` rows now exist.
- [ ] Flow 2 has evidence that API Store returns `403`.
- [ ] Certificate flows 4 and 5 were not changed.
- [ ] No schema, auth, API key, or deployment changes were introduced.

## Risks And Guardrails

- A client-supplied `platformId` is a cross-tenant spoofing risk. Never rely on it for platform scope.
- Failing closed on API Store organizations may reject signups when TrustLayer is unavailable. That is intentional for this high-stakes demo path because organizations can sell endpoints.
- Do not apply the same fail-closed policy to every individual signup without product confirmation; the original code treats individual TrustLayer enrollment as non-fatal.
- The backend `BackgroundCheckVerdict` TypeScript type includes `not_found`, but the generated backend enum may only include `clean`, `flagged`, and `blocked`. If TypeScript complains, inspect actual API response behavior before changing types.
- Existing Playwright UI tests may be flaky. Prefer direct API assertions for security/enforcement regressions, then use UI tests for demo confidence.

## Completion Report Format For The Intern

When done, reply with:

1. Summary of what changed
2. Files modified
3. Tests added or updated
4. Commands run and exact pass/fail results
5. Evidence paths for Flow 1 and Flow 2 retests
6. Remaining risks or follow-up needed
