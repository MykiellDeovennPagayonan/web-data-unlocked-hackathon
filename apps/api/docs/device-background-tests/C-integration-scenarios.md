# C. Cross-Module Integration Scenarios

End-to-end flows that exercise `device-intelligence`, `background-checks`, `trust-engine`, `platform-management`, and `identity` together.

---

## Environment Variables Needed

| Variable | How to obtain |
|---|---|
| `baseUrl` | Your local / staging API root |
| `adminPlatformId` | From `POST /admin/platforms` |
| `adminApiKeyRaw` | From `POST /v1/platform/api-keys` via service bootstrap |
| `identityId` | From `POST /admin/identities` |
| `orgId` | From `POST /v1/organizations` |
| `deviceId` | From `POST /v1/intelligence/device` |
| `ipId` | From `POST /v1/intelligence/ip` |
| `checkId` | From `POST /v1/background-checks` |

---

## Scenario 1: Registration-Time Trust Evaluation

**Goal:** Simulate a new user registering on a client platform. TrustLayer evaluates their device, IP, runs a background check, and computes a trust score — all before the user is fully onboarded.

### Step 1 — Create platform and API key

- `POST /admin/platforms` → save `adminPlatformId`
- Service-bootstrap `POST /v1/platform/api-keys` for that platform → save `adminApiKeyRaw`

### Step 2 — Create an identity

- `POST /admin/identities`
- Save `identityId`

### Step 3 — Resolve device intelligence

- `POST /v1/intelligence/device`
- Send realistic signals (user_agent, os, browser, screen, timezone, language, canvas_hash, webgl_hash)
- Save `deviceId`
- Assert `isNew: true` and `riskScore: 0`

### Step 4 — Evaluate IP

- `POST /v1/intelligence/ip`
- Body: `{ "ipAddress": "8.8.8.8" }`
- Save `ipId`
- Assert `riskScore` is present and `ipType` is classified.

### Step 5 — Create platform user linking identity + device + IP

- `POST /v1/platform-users`
- Link `identityId` to `adminPlatformId` with `externalUserId: "reg_user_001"`
- *(If your schema stores `deviceId` and `ipId` on the user or access_event, include them.)*

### Step 6 — Trigger registration-time background check

- `POST /v1/background-checks`
- Body:

```json
{
  "entityType": "identity",
  "identityId": "{{identityId}}",
  "triggeredBy": "registration"
}
```

- Save `checkId`

### Step 7 — Add mock source results

- `POST /v1/background-checks/{{checkId}}/results` — LinkedIn `clear`
- Same — OpenSanctions `clear`
- Same — OFAC `clear`
- Same — SERP `clear`

### Step 8 — Complete check as clean

- `POST /v1/background-checks/{{checkId}}/complete`
- Body: `{ "overallVerdict": "clean" }`

### Step 9 — Verify trust score

- `GET /v1/trust-score/identity/{{identityId}}`
- Assert `score === 60` (baseline 50 + clean signal +10)
- Assert `signalCount === 1`

### Step 10 — Verify trust signal details

- `GET /v1/trust-signals?identityId={{identityId}}`
- Assert array length `1`
- Assert `signalType === "clean_history"`
- Assert `weight === 10`
- Assert `source === "background_check"`
- Assert `referenceId === {{checkId}}`

---

## Scenario 2: Suspicious IP + Device → Flagged Registration

**Goal:** A user tries to register from a known VPN IP and a device with an elevated risk score. The platform's strictness rules and intelligence data should produce a low trust score.

### Step 1 — Setup

- Create platform with `strictnessLevel: high`
- Apply preset rules: `POST /v1/platform/rules/apply-preset` → `high`
- Bootstrap API key → `adminApiKeyRaw`
- Create identity → `identityId`

### Step 2 — Resolve device with high risk

- `POST /v1/intelligence/device`
- Save `deviceId`
- *(Simulate admin/internal route to set risk score)*
- `PATCH /admin/devices/{{deviceId}}/risk` → `{ "riskScore": 85 }`

### Step 3 — Evaluate a suspicious IP

- `POST /v1/intelligence/ip`
- Body: `{ "ipAddress": "10.0.0.1" }`
- Save `ipId`
- *(Simulate admin/internal classification)*
- `ipType` should be `vpn` or `proxy` if your classification logic assigns it.
- Update risk score: `PATCH .../risk` → `{ "riskScore": 90 }`

### Step 4 — Create background check and complete as flagged

- `POST /v1/background-checks` → `checkId`
- Add one result with `normalizedVerdict: soft_flag`
- `POST /v1/background-checks/{{checkId}}/complete` → `{ "overallVerdict": "flagged" }`

### Step 5 — Verify cumulative trust score

- `GET /v1/trust-score/identity/{{identityId}}`
- Assert score is low. Exact value depends on your signal math:
  - Background-check flagged = -5
  - If you also added device/IP signals manually, include those weights.
  - With only the flagged check: `score === 45`

### Step 6 — Verify rule evaluation

- If your rule engine evaluates `(device.riskScore > 70 OR ip.riskScore > 70)`:
  - The `high` strictness preset should have a rule for `registration` → `block` or `flag` when risk is high.
  - Assert that evaluating the ruleset against this identity/device/IP yields `action: block` or `action: flag`.

---

## Scenario 3: Organization Background Check → Trust Certificate Pipeline

**Goal:** A platform submits a partner organization, TrustLayer verifies it via background checks, and the organization becomes eligible for a trust certificate.

### Step 1 — Platform submits organization

- `POST /v1/organizations`
- Headers: `x-api-key: {{adminApiKeyRaw}}`
- Body:

```json
{
  "legalName": "Partner Logistics",
  "domain": "partner-logistics.example.com",
  "registrationNumber": "REG-PL-2025",
  "country": "PH",
  "industry": "Logistics",
  "trustStatus": "clean"
}
```

- Save `orgId`
- Assert `submittedByPlatformId === {{adminPlatformId}}`

### Step 2 — Admin creates background check for organization

- `POST /v1/background-checks`
- Body:

```json
{
  "entityType": "organization",
  "orgId": "{{orgId}}",
  "triggeredBy": "manual"
}
```

- Save `orgCheckId`

### Step 3 — Add verification results

- `POST /v1/background-checks/{{orgCheckId}}/results` — business_registry `clear`
- Same — `ofac` `clear`
- Same — `opensanctions` `clear`

### Step 4 — Complete as clean

- `POST /v1/background-checks/{{orgCheckId}}/complete`
- Body: `{ "overallVerdict": "clean" }`

### Step 5 — Verify organization trust score

- `GET /v1/trust-score/organization/{{orgId}}`
- Assert `score > 50`
- Assert `signalCount >= 1`

### Step 6 — Verify domain lookup reflects status

- `GET /admin/organizations/by-domain/partner-logistics.example.com`
- Assert `trustStatus === "clean"` (or `"verified"` if your status update hook exists).

---

## Scenario 4: Device Fingerprint Re-recognition Across Sessions

**Goal:** Prove that a returning device is recognized even when non-stable signals drift.

### Step 1 — First session

- `POST /v1/intelligence/device` with a full signal set.
- Save `deviceId` and `stableHash`.

### Step 2 — Second session (drifted signals)

- `POST /v1/intelligence/device` with:
  - Same `canvas_hash`, `webgl_hash`, `screen_resolution`, `os`, `timezone`
  - **Changed** `user_agent` and `browser`
- Assert `isNew: false`
- Assert `device.id === {{deviceId}}`

### Step 3 — Third session (stable signals changed)

- `POST /v1/intelligence/device` with:
  - Different `canvas_hash`, `webgl_hash`, `screen_resolution`, `os`, `timezone`
- Assert `isNew: true`
- Assert `device.id !== {{deviceId}}`

---

## Scenario 5: Background Check Orchestrator Simulation

**Goal:** Test the orchestrator layer (or your mock workers) that runs multiple source checks in parallel and aggregates a verdict.

### Step 1 — Create identity and check

- `POST /admin/identities` → `identityId`
- `POST /v1/background-checks` → `checkId`

### Step 2 — Run mock workers (via internal endpoint or test script)

If you expose an orchestrator endpoint:
- `POST /v1/background-checks/{{checkId}}/run`
- Assert the check now has 5 results (OFAC, LinkedIn, OpenSanctions, SERP, News).

If testing the mock functions directly:
- Call `runAllMockChecks("John Doe")`
- Assert returned array length is `5`.
- Assert every result has `normalizedVerdict`, `confidenceScore`, `llmSummary`.

### Step 3 — Aggregate verdict logic

*(This is usually an internal service method, but you can test it via an admin endpoint or unit test.)*

| Worker Result | Normalized Verdict | Suggested Overall |
|---|---|---|
| OFAC | `hard_flag` | `blocked` |
| LinkedIn | `clear` | — |
| OpenSanctions | `clear` | — |
| SERP | `soft_flag` | — |
| News | `clear` | — |

**Aggregation rule:** Any `hard_flag` → `blocked`. Any `soft_flag` and no `hard_flag` → `flagged`. All `clear` → `clean`.

**Assertions**
- With the table above, overall should be `blocked`.
- If you change OFAC to `clear` and SERP to `soft_flag`, overall should be `flagged`.
- If all are `clear`, overall should be `clean`.

### Step 4 — Complete with aggregated verdict

- `POST /v1/background-checks/{{checkId}}/complete`
- Body: `{ "overallVerdict": "blocked" }`

- Verify trust score dropped accordingly.

---

## Scenario 6: Full Access Event Simulation

**Goal:** Simulate the first line of defense — a user hits a platform, and TrustLayer evaluates everything before the request reaches the platform's logic.

### Step 1 — Setup

- Create platform with `strictnessLevel: high`
- Create identity → `identityId`
- Create platform user → `externalUserId: "access_user_001"`

### Step 2 — Incoming access event (simulated)

Your `access-events` module (if implemented) would receive:

```json
{
  "platformId": "{{adminPlatformId}}",
  "identityId": "{{identityId}}",
  "ipAddress": "45.142.214.0",
  "deviceSignals": [
    { "signalType": "user_agent", "value": "..." },
    { "signalType": "canvas_hash", "value": "..." }
  ],
  "eventType": "login"
}
```

### Step 3 — What TrustLayer should do

1. **IP lookup** → classify IP type, get risk score.
2. **Device resolve** → match or create device, get risk score.
3. **Trust score compute** → fetch current score for identity.
4. **Rule evaluation** → apply platform's `high` strictness rules.
5. **Verdict** → `allowed`, `flagged`, `throttled`, or `blocked`.

### Step 4 — Assert the verdict

- If IP is `vpn` with `riskScore: 90` and platform rule says `block on ipRiskScoreAbove: 70`:
  - Assert verdict is `blocked`.
  - Assert `access_events` row is written with `verdict: blocked`, `triggeredRules: [...]`.

---

## Quick-Start Postman Collection Skeleton

Create a collection named **"TrustLayer Device & Background"** with folders:

1. `01 - Device Fingerprinting`
2. `02 - IP Intelligence`
3. `03 - Background Checks`
4. `04 - Trust Score Verification`
5. `05 - Registration Flow`
6. `06 - Organization Verification`

In each request, set:
- **Pre-request Script:** (optional) `pm.environment.set("timestamp", Date.now())`
- **Tests tab:**

```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response has id", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property("id");
    pm.environment.set("checkId", jsonData.id);
});
```

---

## Notes for Future Expansion

- When `access_events` and `sessions` modules are added, extend **Scenario 6** to assert real-time rule firing and session creation.
- When `registry_entries` and `community_reports` are added, extend **Scenario 2** to assert that a flagged device/IP combo lands on a shared blacklist.
- When `trust_certificates` issuance is automated, extend **Scenario 3** to assert certificate creation after a clean background check.
