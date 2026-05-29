# DEMO E2E Findings Report

## 1. Test Environment

- Date/time: `2026-05-29T10:51:28.933Z` to `2026-05-29T10:52:20Z`
- Commit hash: `b1f6695f41edf1c0105a1ef446d634f4dd01069c`
- Services started:
  - `postgres`
  - `redis`
  - `api`
  - `web`
  - `social-media-app`
  - `demo-api-store`
  - `demo-job-board`
  - `seed-demo-platforms`
- Test tools used:
  - Playwright
  - Node `fetch`
  - `docker compose`
  - `psql`
  - TrustLayer backend APIs on `http://localhost:8090`

Notes:
- The `demo-api-store` container had exited once during the first pass and was restarted locally before the final run.
- All testing stayed on the local demo stack. No public or external systems were used.

## 2. Scenario Matrix

| Scenario | Actors | Main actions | Expected outcome |
|---|---|---|---|
| Flow 1 - Free-Tier Abuser | Bad Actor, API Store, Job Board, TrustLayer | Register multiple aliases on API Store, exhaust free calls, then apply on Job Board | Trust score drops, aliases link to one identity, third job application is throttled |
| Flow 2 - Fake Job Company | Fake org, Job Board applicants, API Store, TrustLayer | Register fake company on Job Board, collect reports, then try to register on API Store | Blacklist escalates, API Store blocks the org, fake-name fallback is rejected |
| Flow 3 - Bot Scraper Attack | Bot operator, Social Media App, Job Board, TrustLayer | Burst feed scraping from a datacenter-like IP, then pivot to Job Board | Velocity detection fires, IP is blacklisted, Job Board blocks the same IP |
| Flow 4 - Trusted Organization Certificate | Trusted org, API Store, Job Board, TrustLayer | Issue org certificate on API Store, verify it on Job Board | Certificate verifies instantly and org is accepted as trusted |
| Flow 5 - Trusted Individual Portable KYC | Verified individual, Social Media App, API Store, TrustLayer | Issue individual certificate on Social Media App, verify it on API Store | Certificate verifies instantly and individual is accepted as verified |
| API-limit abuse | Repeated IP traffic, TrustLayer | Repeated calls to IP velocity endpoint | Request count rises and enforcement escalates without bypass |
| DDoS-like load tests | Repeated local clients, Social Media App, TrustLayer | Burst, sustained, retry-storm traffic | Service stays up, returns graceful throttling or safe errors |
| Scraping/probing patterns | Probe client, Social Media App, Job Board | Pagination harvesting, repeated UA patterns | Repeated scraping is detected and blocked or throttled |
| Bad payload / edge behavior | Malformed clients, TrustLayer, Social Media App | Invalid JSON, oversized body, mixed valid/invalid requests | Validation fails safely, no crash, no inconsistent state |

## 3. Detailed Results Per Scenario

### Flow 1 - Free-Tier Abuser

- Doc actors: Bad Actor, API Store, Job Board, TrustLayer
- Doc expectation:
  - First API Store registration creates a neutral identity and device record.
  - Second and third registrations from the same fingerprint/IP become aliases.
  - Trust score drops below the job-board threshold.
  - The third Job Board application is throttled.
- Observed steps:
  1. API Store organization signup returned `201` and created the org user record.
  2. API Store endpoint creation returned `201`.
  3. 50 proxy calls to the endpoint returned `502` responses because the first upstream target was not reachable from inside the API Store container.
  4. Three alias signups returned `201, 201, 201`.
  5. TrustLayer trust-score lookups for the alias identities returned `200` with `score: 50` and `signalCount: 0`.
  6. Database inspection showed no `platform_users` rows for the created API Store user IDs and no `entity_aliases` rows.
- Actual result:
  - Flow did not reach the documented trust-score drop or Job Board throttling path.
  - The demo app did not complete TrustLayer enrollment for the signups, so the identities stayed neutral.
- Evidence:
  - `.tmp/demo-evidence/flow-1-signup-org.json`
  - `.tmp/demo-evidence/flow-1-alias-signups.json`
  - `.tmp/demo-evidence/flow-1-api-key.json`
  - `.tmp/demo-evidence/flow-1-endpoint.json`
  - `.tmp/demo-evidence/flow-1-proxy-calls.json`
  - `.tmp/demo-evidence/flow-1-trust-score.json`
  - `.tmp/demo-evidence/flow-1-api-store-org-dashboard.png`
  - `.tmp/demo-evidence/flow-1-job-board-org-dashboard.png`
  - TrustLayer trust-score lookup output for the alias IDs
  - `platform_users` / `entity_aliases` SQL query output

### Flow 2 - Fake Job Company

- Doc actors: Fake org, Job Board applicants, API Store, TrustLayer
- Doc expectation:
  - Fake company registers on Job Board and gets reported.
  - Community reports escalate the registry entry to blacklist.
  - API Store rejects the same org.
  - Fake-name fallback is also rejected as `not_found` / unverifiable.
- Observed steps:
  1. Job Board fake-org signup returned `201`.
  2. Five reporter signups returned `201, 201, 201, 201, 201`.
  3. Five community reports were accepted with `201` responses.
  4. Registry escalation produced active blacklist entries.
  5. API Store blacklisted-org signup returned `201`, not `403`.
  6. API Store fake-name signup returned `201`, not `403`.
- Actual result:
  - Community reporting and registry escalation worked.
  - The API Store registration path did not enforce the blacklist or the unverifiable-company verdict.
- Evidence:
  - `.tmp/demo-evidence/flow-2-job-org-signup.json`
  - `.tmp/demo-evidence/flow-2-reporter-signups.json`
  - `.tmp/demo-evidence/flow-2-reports.json`
  - `.tmp/demo-evidence/flow-2-accept.json`
  - `.tmp/demo-evidence/flow-2-registry.json`
  - `.tmp/demo-evidence/flow-2-api-store-blocked.json`
  - `.tmp/demo-evidence/flow-2-api-store-notfound.json`

### Flow 3 - Bot Scraper Attack

- Doc actors: Bot operator, Social Media App, Job Board, TrustLayer
- Doc expectation:
  - Rapid feed scraping from one IP triggers velocity detection.
  - The attacking IP is blacklisted.
  - Job Board rejects the same IP immediately.
  - Rotated IPs start fresh.
- Observed steps:
  1. Baseline feed request returned `200` in `194ms`.
  2. Burst test of 60 feed requests returned `28x 200` and `32x 429`.
  3. IP lookup returned a blacklisted record with `riskScore: 5` and `blacklistSource: behavioral:velocity`.
  4. Job Board request from the same IP returned `403` with the suspicious-activity message.
  5. Rotated IP probes returned `200, 200, 200`.
- Actual result:
  - The scraper was detected and throttled on Social Media App.
  - The same IP was blocked cross-platform on Job Board.
  - Fresh IPs were not immediately inheriting the prior blacklist.
- Evidence:
  - `.tmp/demo-evidence/flow-3-baseline.json`
  - `.tmp/demo-evidence/flow-3-burst.json`
  - `.tmp/demo-evidence/flow-3-ip-state.json`
  - `.tmp/demo-evidence/flow-3-job-board-blocked.json`
  - `.tmp/demo-evidence/flow-3-ip-rotation.json`

### Flows 4-5 - Trusted Certificates

- Doc actors: Trusted org / verified individual, API Store, Job Board, Social Media App, TrustLayer
- Doc expectation:
  - Issue a portable certificate.
  - Verify it on the other platform.
  - Accept instantly with no manual vetting.
- Observed steps:
  1. Trusted org creation returned `201`.
  2. Trusted org certificate issuance returned `active`.
  3. Job Board verification returned `201 / valid`.
  4. Trusted identity creation returned `201`.
  5. Trusted individual certificate issuance returned `active`.
  6. API Store verification returned `201 / valid`.
- Actual result:
  - Both certificate flows passed.
  - The trusted org and trusted individual were accepted via the portable certificate path.
- Evidence:
  - `.tmp/demo-evidence/flow-4-5-org-create.json`
  - `.tmp/demo-evidence/flow-4-5-org-certificate.json`
  - `.tmp/demo-evidence/flow-4-5-org-verify.json`
  - `.tmp/demo-evidence/flow-4-5-identity-create.json`
  - `.tmp/demo-evidence/flow-4-5-identity-certificate.json`
  - `.tmp/demo-evidence/flow-4-5-identity-verify.json`

### API-limit abuse

- Goal: stress the IP velocity endpoint and confirm escalation behavior.
- Expected protection: repeated requests should increment counters and eventually blacklist the IP.
- Actual:
  - 35 requests were accepted.
  - `requestCount` reached `35`.
  - `thresholdExceeded` was already `true` by the last samples.
  - `isBlacklisted` remained `false` in the sampled window.
- Evidence:
  - `.tmp/abuse-stress-results.json`
  - `.tmp/demo-evidence/abuse-stress-velocity.json`
  - `.tmp/demo-evidence/abuse-stress-velocity-alt-key.json`

### DDoS-like load tests

- Burst traffic:
  - Goal: verify graceful handling under local burst load.
  - Expected: throttling or safe degradation, no crash.
  - Actual: 80 requests completed in `952ms`.
  - Evidence: `.tmp/demo-evidence/abuse-stress-burst.json`
- Sustained RPS:
  - Goal: verify sustained sequential load does not crash the service.
  - Expected: rate limiting or blacklisting, no crash.
  - Actual: 25 sequential requests completed in `99ms`.
  - Evidence: `.tmp/demo-evidence/abuse-stress-sustained.json`
- Retry storm:
  - Goal: verify repeated retries do not create 5xx instability.
  - Expected: consistent non-5xx responses.
  - Actual: 15 responses were `200`.
  - Evidence: `.tmp/demo-evidence/abuse-stress-retry.json`

### Scraping/probing patterns

- Endpoint probing:
  - Goal: repeated pagination harvesting should be tracked.
  - Expected: throttling after repeated probing.
  - Actual: 20 requests all returned `200`.
  - Evidence: `.tmp/demo-evidence/abuse-stress-probe.json`
- Repeated UA probing:
  - Goal: same user-agent scraping pattern should be observed or throttled.
  - Expected: repeated behavior detection without crashing.
  - Actual: 5 requests all returned `200`.
  - Evidence: `.tmp/demo-evidence/abuse-stress-ua.json`

### Bad payload / edge behavior

- Goal: verify malformed and oversized payloads fail safely.
- Expected: `4xx` validation or auth failures, no crash.
- Actual:
  - Malformed JSON returned `400`.
  - Oversized POST to Social Media App returned `401 Unauthorized`.
  - Mixed behavioral requests returned `400` validation errors.
- Evidence:
  - `.tmp/demo-evidence/abuse-stress-payloads.json`

### Baseline vs stress comparison

- Baseline feed request: `194ms`, `200`
- Burst run: 80 local requests completed in `952ms`
- Summary comparison:
  - The local burst run did not crash the service.
  - Throttling was visible under burst load.
  - The dedicated harness run also recorded a higher average burst latency than baseline (`370ms` average for the first sampled burst requests versus `250ms` baseline in the runner summary).

## 4. Confirmed Bugs

### BUG-1

- Severity: High
- Impact:
  - Demo app TrustLayer enrollment is incomplete because the signup routes do not pass `platformId` into `POST /v1/platform-users`.
  - As a result, the backend returns `platformId must be a string`, no `platform_users` row is created, aliasing does not occur, and Flow 1 trust-score degradation never starts.
- Reproducible steps:
  1. Sign up an organization and multiple individuals on API Store.
  2. Inspect TrustLayer trust scores for the created identities.
  3. Query the backend `platform_users` table.
- Expected vs actual:
  - Expected: TrustLayer enrolls the user, stores the platform mapping, and later alias signups reduce trust.
  - Actual: trust-score stays at `50`, `signalCount` stays `0`, and no `platform_users` row exists for the app-created users.

### BUG-2

- Severity: High
- Impact:
  - API Store does not fail closed when the organization registration verdict is blocked or unverifiable.
  - The route catches TrustLayer errors as non-fatal and still returns `201`, so a blacklisted org and a fake-name org both get accepted.
- Reproducible steps:
  1. Create a fake org on Job Board.
  2. Submit community reports until the registry escalates to blacklist.
  3. Register the same org on API Store.
  4. Register a fabricated org name on API Store.
- Expected vs actual:
  - Expected: `403` rejection for the blacklisted org and the unverifiable org.
  - Actual: both registrations returned `201`.

## 5. Suspected Risks

- The IP velocity escalation path marked `thresholdExceeded: true` by request 31-35, but the sampled window did not flip `isBlacklisted` to `true`. This may be a softer policy than the demo story implies, or a threshold gap.
- Endpoint probing and repeated user-agent scraping were not throttled in the sampled local window of 20/5 requests, so the detection threshold may be higher than the demo flow suggests.
- The demo app proxy endpoints must target reachable Docker-network hosts. Using container-local `localhost` inside the API Store container produces `502` upstream failures.
- The existing Playwright suite showed selector/redirect flakiness earlier in the session, so it is not a dependable regression guard without updates.

## 6. Hardening Suggestions

- Pass `PLATFORM_ID` through the demo signup routes and fail closed if `POST /v1/platform-users` fails.
- Remove the non-fatal catch for blocked/unverifiable organization enrollment in `apps/demo/api-store/app/api/users/route.ts`.
- Add regression tests that assert the TrustLayer identity mapping exists before returning success from signup.
- Add a regression test that blacklisted org registration on API Store returns `403`.
- Document proxy endpoints with reachable Docker-network upstreams instead of `localhost` from inside the app container.
- Surface registry and trust-score evidence in the dashboard so demo validation does not depend on backend inspection alone.

## 7. Retest Checklist

- Re-run Flow 1 after fixing `platformId` wiring in the demo app signup routes.
- Re-run Flow 1 with a reachable upstream for the proxy endpoint and confirm the 50-call free-trial path.
- Re-run Flow 2 and verify API Store now returns `403` for blacklisted and unverifiable orgs.
- Re-run Flow 3 from a fresh IP and verify the blacklist/cross-platform block still works.
- Re-run the certificate flows and confirm both org and individual certificate verification still return `valid`.
- Re-run the local load tests and compare baseline latency against burst latency.
- Re-check the IP velocity endpoint to confirm the blacklist escalation threshold is intentional and documented.
