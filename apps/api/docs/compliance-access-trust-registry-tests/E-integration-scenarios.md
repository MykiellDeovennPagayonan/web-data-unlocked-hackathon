# E. Cross-Module Integration Scenarios

End-to-end flows that exercise `compliance`, `access-sessions`, `trust-engine`, and `registry` together, often involving `platform-management` and `identity` as entry points.

---

## Environment Variables Needed

| Variable | How to obtain |
|---|---|
| `baseUrl` | Your local / staging API root |
| `adminPlatformId` | From `POST /admin/platforms` |
| `adminApiKeyRaw` | From `POST /v1/platform/api-keys` via service bootstrap |
| `platformBId` | From a second `POST /admin/platforms` |
| `platformBApiKeyRaw` | From service bootstrap for `platformBId` |
| `identityId` | From `POST /admin/identities` |
| `orgId` | From `POST /v1/organizations` |
| `deviceId` | From `POST /v1/intelligence/device` |
| `ipId` | From `POST /v1/intelligence/ip` |
| `backgroundCheckId` | From `POST /v1/background-checks` |
| `verificationRequestId` | From `POST /v1/compliance/verification-requests` |
| `certificateId` | From `POST /v1/trust-certificates` |
| `sessionId` | From `POST /v1/access/sessions` |
| `communityReportId` | From `POST /v1/registry/community-reports` |
| `ruleId` | From `POST /v1/platform/rules` |

---

## Scenario 1: KYC to Certificate Flow

**Goal:** A user completes KYC, gets a trust score boost, and receives a portable Trust Certificate that another platform can verify.

### Step 1 — Admin creates a platform

- `POST /admin/platforms` → save `adminPlatformId`
- Service-bootstrap `POST /v1/platform/api-keys` for that platform → save `adminApiKeyRaw`

### Step 2 — Create identity

- `POST /admin/identities`
- Save `identityId`

### Step 3 — Create verification request

- `POST /v1/compliance/verification-requests`
- Headers: `x-api-key: {{adminApiKeyRaw}}`
- Body:

```json
{
  "identityId": "{{identityId}}",
  "platformId": "{{adminPlatformId}}",
  "verificationType": "government_id",
  "provider": "jumio"
}
```

- Save `verificationRequestId`

### Step 4 — Submit verification request

- `PATCH /v1/compliance/verification-requests/{{verificationRequestId}}/submit`
- Headers: `x-api-key: {{adminApiKeyRaw}}`

### Step 5 — Admin approves verification

- `POST /admin/compliance/verification-requests/{{verificationRequestId}}/approve`

### Step 6 — Verify trust signal created

- `GET /v1/trust-signals?entityType=identity&identityId={{identityId}}&signalType=kyc_passed`
- Headers: `x-api-key: {{adminApiKeyRaw}}`

**Assertions**
- One signal exists with `weight: 15`, `source: manual`.

### Step 7 — Verify trust score

- `GET /v1/trust-score/identity/{{identityId}}`
- Headers: `x-api-key: {{adminApiKeyRaw}}`

**Assertions**
- `score` is `65` (50 baseline + 15 KYC).

### Step 8 — Verify trust score snapshot

- `GET /v1/trust-score-snapshots/identity/{{identityId}}`
- Headers: `x-api-key: {{adminApiKeyRaw}}`

**Assertions**
- Latest snapshot has `snapshotReason: certificate_issued` and `score: 65`.

### Step 9 — Issue trust certificate

- `POST /v1/trust-certificates`
- Headers: `x-api-key: {{adminApiKeyRaw}}`
- Body:

```json
{
  "entityType": "identity",
  "identityId": "{{identityId}}",
  "issuingCheckId": "{{verificationRequestId}}",
  "validDays": 90
}
```

- Save `certificateId`

### Step 10 — Create second platform to verify certificate

- `POST /admin/platforms` → save `platformBId`
- Service-bootstrap API key → save `platformBApiKeyRaw`

### Step 11 — Second platform verifies the certificate

- `POST /v1/certificate-verifications/{{certificateId}}`
- Headers: `x-api-key: {{platformBApiKeyRaw}}`
- Body:

```json
{
  "verifiedByPlatformId": "{{platformBId}}"
}
```

**Assertions**
- `verdict` is `valid`.
- `verifiedAt` is a timestamp.

### Step 12 — Revoke certificate

- `PATCH /v1/trust-certificates/{{certificateId}}/revoke`
- Headers: `x-api-key: {{adminApiKeyRaw}}`
- Body:

```json
{
  "reason": "identity_fraud_discovered"
}
```

### Step 13 — Re-verify after revocation

Repeat Step 11.

**Assertions**
- `verdict` is `revoked`.

### Step 14 — Audit trail completeness

- `GET /admin/compliance/audit-logs?targetId={{verificationRequestId}}` → contains `verification_approved`.
- `GET /admin/compliance/audit-logs?targetId={{certificateId}}` → contains `certificate_issued` and `certificate_revoked`.

---

## Scenario 2: Community Blacklist Flow

**Goal:** Two independent platforms report the same bad actor. The reports are accepted, creating a blacklist entry and dropping the actor's trust score.

### Step 1 — Create two platforms

Create `platformA` and `platformB` with separate API keys.

- Save `platformAId`, `platformBId`, `apiKeyA`, `apiKeyB`.

### Step 2 — Create a shared identity

- `POST /admin/identities`
- Save `identityId`

### Step 3 — Compute baseline trust score

- `GET /v1/trust-score/identity/{{identityId}}`
- Headers: `x-api-key: {{apiKeyA}}`

**Assertions**
- `score` is `50`.

### Step 4 — Platform A submits a report

- `POST /v1/registry/community-reports`
- Headers: `x-api-key: {{apiKeyA}}`
- Body:

```json
{
  "reportingPlatformId": "{{platformAId}}",
  "targetType": "identity",
  "identityId": "{{identityId}}",
  "severity": "high",
  "category": "fraud",
  "description": "Chargeback fraud on payment"
}
```

- Save `reportAId`

### Step 5 — Platform B submits a report for the same identity

- `POST /v1/registry/community-reports`
- Headers: `x-api-key: {{apiKeyB}}`
- Body:

```json
{
  "reportingPlatformId": "{{platformBId}}",
  "targetType": "identity",
  "identityId": "{{identityId}}",
  "severity": "high",
  "category": "identity_theft",
  "description": "Stolen credentials used"
}
```

- Save `reportBId`

### Step 6 — Admin accepts both reports

- `POST /admin/community-reports/{{reportAId}}/accept?severity=orange_watch`
- `POST /admin/community-reports/{{reportBId}}/accept?severity=red_hard`

### Step 7 — Verify registry entries and targets

For each accepted report, query:

- `GET /v1/registry/entries/{{registryEntryId}}`
- `GET /v1/registry/entries/{{registryEntryId}}/targets`

**Assertions**
- Each entry has `listType: blacklist`.
- One entry has `severity: orange_watch`, the other `severity: red_hard`.
- Targets point to `{{identityId}}`.

### Step 8 — Verify trust signals

- `GET /v1/trust-signals?entityType=identity&identityId={{identityId}}&signalType=community_report`
- Headers: `x-api-key: {{apiKeyA}}`

**Assertions**
- Two signals exist, each with `weight: -10`.

### Step 9 — Verify updated trust score

- `GET /v1/trust-score/identity/{{identityId}}`
- Headers: `x-api-key: {{apiKeyA}}`

**Assertions**
- `score` is `30` (50 - 10 - 10).

### Step 10 — Verify trust score snapshots

- `GET /v1/trust-score-snapshots/identity/{{identityId}}`
- Headers: `x-api-key: {{apiKeyA}}`

**Assertions**
- At least two new snapshots exist with `snapshotReason: community_report`.
- Scores reflect the progressive drop.

### Step 11 — Verify audit logs

- `GET /admin/compliance/audit-logs?action=report_accepted&targetId={{reportAId}}`
- `GET /admin/compliance/audit-logs?action=report_accepted&targetId={{reportBId}}`

**Assertions**
- Each query returns exactly one audit log with `actorType: system`.

---

## Scenario 3: Consent-Gated Access

**Goal:** An identity must grant consent before their data can be processed. After revocation, the access event system reflects the lack of consent.

### Step 1 — Create platform and identity

Standard setup. Save `platformId`, `apiKey`, `identityId`.

### Step 2 — Record consent

- `POST /v1/compliance/consent`
- Headers: `x-api-key: {{apiKey}}`
- Body:

```json
{
  "identityId": "{{identityId}}",
  "platformId": "{{platformId}}",
  "consentType": "data_processing",
  "consentVersion": "v1.0.0",
  "ipAtConsent": "203.0.113.1"
}
```

- Save `consentId`

### Step 3 — Check active consent

- `GET /v1/compliance/consent/check?identityId={{identityId}}&platformId={{platformId}}&consentType=data_processing`
- Headers: `x-api-key: {{apiKey}}`

**Assertions**
- Response is the active consent record.

### Step 4 — Log access event while consent is active

- `POST /v1/access/events`
- Headers: `x-api-key: {{apiKey}}`
- Body:

```json
{
  "platformId": "{{platformId}}",
  "identityId": "{{identityId}}",
  "ipId": "{{ipId}}",
  "deviceId": "{{deviceId}}",
  "eventType": "registration",
  "verdict": "allowed",
  "scoreAtEvent": 50,
  "triggeredRules": {}
}
```

**Assertions**
- HTTP `201` or `200`.
- Access event is created successfully.

### Step 5 — Revoke consent

- `PATCH /v1/compliance/consent/{{consentId}}/revoke`
- Headers: `x-api-key: {{apiKey}}`

### Step 6 — Check active consent after revocation

Repeat Step 3.

**Assertions**
- Response is `null`.

### Step 7 — Audit log for revocation

- `GET /admin/compliance/audit-logs?action=consent_revoked&targetId={{consentId}}`

**Assertions**
- One audit log exists documenting the revocation.

---

## Scenario 4: Platform Rules × Trust Score × Blocked Access

**Goal:** A platform defines a rule that blocks registration when trust score is below 30. A negative trust signal drops the identity's score, and the next access event evaluates to `blocked`.

### Step 1 — Create platform with custom rules

- `POST /admin/platforms`
- Body:

```json
{
  "name": "Strict Platform",
  "domain": "strict.example.com",
  "status": "active",
  "strictnessLevel": "custom"
}
```

- Save `strictPlatformId`
- Service-bootstrap API key → save `strictApiKey`.

### Step 2 — Create platform rule

- `POST /v1/platform/rules`
- Headers: `x-api-key: {{strictApiKey}}`
- Body:

```json
{
  "ruleTrigger": "registration",
  "conditionJson": {
    "trustScoreBelow": 30
  },
  "action": "block"
}
```

- Save `ruleId`

### Step 3 — Create identity with clean baseline

- `POST /admin/identities`
- Body:

```json
{
  "emailHash": "strict-hash-001",
  "encryptedEmail": "ENC(strict@example.com)",
  "encryptedFullName": "ENC(Strict Test)",
  "trustStatus": "clean"
}
```

- Save `identityId`

### Step 4 — Add heavy negative trust signal

- `POST /v1/trust-signals`
- Headers: `x-api-key: {{strictApiKey}}`
- Body:

```json
{
  "entityType": "identity",
  "identityId": "{{identityId}}",
  "signalType": "ofac_match",
  "weight": -40,
  "source": "manual",
  "referenceId": "manual_review_001"
}
```

### Step 5 — Verify low trust score

- `GET /v1/trust-score/identity/{{identityId}}`
- Headers: `x-api-key: {{strictApiKey}}`

**Assertions**
- `score` is `10` (50 - 40).

### Step 6 — Evaluate access for registration

Use the service-level `evaluateAccess` method (or HTTP equivalent if exposed):

- Context: `identityId: {{identityId}}`, `platformId: {{strictPlatformId}}`, `eventType: registration`

**Assertions**
- Verdict is `blocked`.
- `triggeredRules` contains `{{ruleId}}`.

### Step 7 — Log the blocked access event

- `POST /v1/access/events`
- Headers: `x-api-key: {{strictApiKey}}`
- Body:

```json
{
  "platformId": "{{strictPlatformId}}",
  "identityId": "{{identityId}}",
  "ipId": "{{ipId}}",
  "deviceId": "{{deviceId}}",
  "eventType": "registration",
  "verdict": "blocked",
  "scoreAtEvent": 10,
  "triggeredRules": {
    "ruleIds": ["{{ruleId}}"],
    "ruleCount": 1
  }
}
```

**Assertions**
- HTTP `201` or `200`.
- The event is persisted with `verdict: blocked`.

---

## Scenario 5: Alias Resolution → Registry Lookup

**Goal:** An identity is linked to an email alias. When that email is blacklisted via the registry, lookup by alias resolves the blacklist flag.

### Step 1 — Create platform and identity

Standard setup. Save `platformId`, `apiKey`, `identityId`.

### Step 2 — Create entity alias

- `POST /admin/aliases`
- Headers: `Content-Type: application/json`
- Body:

```json
{
  "canonicalEntityType": "identity",
  "canonicalEntityId": "{{identityId}}",
  "aliasType": "email",
  "aliasValueHash": "sha256_fraud_email@example.com",
  "aliasValueEncrypted": "ENC(fraud_email@example.com)",
  "confidence": 0.95,
  "source": "manual"
}
```

- Save `aliasId`

### Step 3 — Resolve alias

- `POST /admin/aliases/resolve`
- Headers: `Content-Type: application/json`
- Body:

```json
{
  "aliasType": "email",
  "aliasValueHash": "sha256_fraud_email@example.com"
}
```

**Assertions**
- Response contains the alias row with `canonicalEntityId === {{identityId}}`.

### Step 4 — Create blacklist registry entry

- `POST /v1/registry/entries`
- Headers: `x-api-key: {{apiKey}}`
- Body:

```json
{
  "listType": "blacklist",
  "severity": "red_hard",
  "sourceType": "external_db"
}
```

- Save `registryEntryId`

### Step 5 — Link registry target to email hash

- `POST /v1/registry/targets`
- Headers: `x-api-key: {{apiKey}}`
- Body:

```json
{
  "registryEntryId": "{{registryEntryId}}",
  "targetType": "email",
  "emailHash": "sha256_fraud_email@example.com"
}
```

### Step 6 — Lookup registry by email hash

- `GET /admin/registry/lookup?targetType=email&emailHash=sha256_fraud_email@example.com`

**Assertions**
- HTTP `200`.
- Response is an array containing one `registry_entry`.
- The entry has `severity: red_hard`, `listType: blacklist`.

### Step 7 — Cross-reference alias → blacklist

1. Resolve alias (Step 3) to get `identityId`.
2. Lookup registry by `identityId`:
   - `GET /admin/registry/lookup?targetType=identity&identityId={{identityId}}`

**Assertions**
- The blacklist entry is found because the email hash target is linked to the same identity via the alias resolution path.
- Alternatively, if the system does not auto-join aliases to registry targets, document that the lookup requires explicit identity linkage.

---

## Scenario 6: Registration-Time Trust Evaluation (Extended)

**Goal:** Simulate a full user registration on a high-strictness platform, from creation through behavioral monitoring.

### Step 1 — Create platform (strictness: high)

- `POST /admin/platforms`
- Body:

```json
{
  "name": "E-Shop Gamma",
  "domain": "eshop-gamma.example.com",
  "status": "trial",
  "strictnessLevel": "high"
}
```

- Save `adminPlatformId`
- Service-bootstrap API key → save `adminApiKeyRaw`.

### Step 2 — Create identity

- `POST /admin/identities`
- Body:

```json
{
  "emailHash": "gamma-hash-001",
  "encryptedEmail": "ENC(gamma@example.com)",
  "encryptedFullName": "ENC(Gamma User)",
  "trustStatus": "clean"
}
```

- Save `identityId`

### Step 3 — Resolve device

- `POST /v1/intelligence/device`
- Headers: `x-api-key: {{adminApiKeyRaw}}`
- Body: realistic signals (user_agent, os, browser, screen, timezone, language, canvas_hash, webgl_hash)
- Save `deviceId`
- Assert `isNew: true` and `riskScore: 0`.

### Step 4 — Evaluate IP

- `POST /v1/intelligence/ip`
- Headers: `x-api-key: {{adminApiKeyRaw}}`
- Body: `{ "ipAddress": "8.8.8.8" }`
- Save `ipId`
- Assert `riskScore` is present and `ipType` is classified.

### Step 5 — Create platform user

- `POST /v1/platform-users`
- Headers: `x-api-key: {{adminApiKeyRaw}}`
- Body: link `identityId` to `adminPlatformId` with `externalUserId: "gamma_user_001"`
- Save `platformUserId`

### Step 6 — Run background check

- `POST /v1/background-checks`
- Headers: `x-api-key: {{adminApiKeyRaw}}`
- Body:

```json
{
  "entityType": "identity",
  "identityId": "{{identityId}}",
  "triggeredBy": "registration"
}
```

- Save `backgroundCheckId`

### Step 7 — Add background check result

- `POST /v1/background-checks/{{backgroundCheckId}}/results`
- Headers: `x-api-key: {{adminApiKeyRaw}}`
- Body:

```json
{
  "source": "ofac",
  "rawResult": { "match": false },
  "normalizedVerdict": "clear",
  "confidenceScore": 1.0,
  "llmSummary": "No OFAC match found."
}
```

### Step 8 — Complete background check

- `PATCH /v1/background-checks/{{backgroundCheckId}}/complete`
- Headers: `x-api-key: {{adminApiKeyRaw}}`
- Body:

```json
{
  "overallVerdict": "clean"
}
```

### Step 9 — Add positive trust signals

- `POST /v1/trust-signals`
- Headers: `x-api-key: {{adminApiKeyRaw}}`
- Signal 1: `clean_history`, `weight: 10`, `source: background_check`
- Signal 2: `linkedin_verified`, `weight: 5`, `source: background_check`

### Step 10 — Verify trust score

- `GET /v1/trust-score/identity/{{identityId}}`
- Headers: `x-api-key: {{adminApiKeyRaw}}`

**Assertions**
- `score` is `65` (50 + 10 + 5).

### Step 11 — Log registration access event

- `POST /v1/access/events`
- Headers: `x-api-key: {{adminApiKeyRaw}}`
- Body:

```json
{
  "platformId": "{{adminPlatformId}}",
  "identityId": "{{identityId}}",
  "ipId": "{{ipId}}",
  "deviceId": "{{deviceId}}",
  "eventType": "registration",
  "verdict": "allowed",
  "scoreAtEvent": 65,
  "triggeredRules": {}
}
```

**Assertions**
- HTTP `201` or `200`.
- `scoreAtEvent` matches the computed trust score.

### Step 12 — Create session

- `POST /v1/access/sessions`
- Headers: `x-api-key: {{adminApiKeyRaw}}`
- Body:

```json
{
  "identityId": "{{identityId}}",
  "platformId": "{{adminPlatformId}}",
  "ipId": "{{ipId}}",
  "deviceId": "{{deviceId}}",
  "sessionTokenHash": "sha256_session_gamma_001",
  "riskScoreAtStart": 65
}
```

- Save `sessionId`

### Step 13 — Log behavioral events inside session

- `POST /v1/access/behavioral`
- Headers: `x-api-key: {{adminApiKeyRaw}}`
- Event 1: `api_call`, `/api/v1/products`, `flagTriggered: false`
- Event 2: `api_call`, `/api/v1/checkout`, `flagTriggered: false`

### Step 14 — Fetch session behavioral events

- `GET /admin/access/behavioral/session/{{sessionId}}`

**Assertions**
- HTTP `200`.
- Array contains exactly 2 items.
- Both items have `sessionId === {{sessionId}}`.

### Step 15 — End session cleanly

- `PATCH /v1/access/sessions/{{sessionId}}/end`
- Headers: `x-api-key: {{adminApiKeyRaw}}`
- Body:

```json
{
  "riskScoreAtEnd": 65,
  "verdict": "clean"
}
```

**Assertions**
- `sessionVerdict` is `clean`.
- `endedAt` is set.

---

## Scenario 7: Certificate Expiry & Renewal

**Goal:** A certificate is valid on day 1, expires after its validity period, and re-verification returns `expired`.

### Step 1 — Create platform, identity, background check

Standard setup. Save `platformId`, `apiKey`, `identityId`, `backgroundCheckId`.

### Step 2 — Issue short-lived certificate

- `POST /v1/trust-certificates`
- Headers: `x-api-key: {{apiKey}}`
- Body:

```json
{
  "entityType": "identity",
  "identityId": "{{identityId}}",
  "issuingCheckId": "{{backgroundCheckId}}",
  "validDays": 1
}
```

- Save `certificateId`

### Step 3 — Verify immediately

- `POST /v1/certificate-verifications/{{certificateId}}`
- Headers: `x-api-key: {{apiKey}}`
- Body:

```json
{
  "verifiedByPlatformId": "{{platformId}}"
}
```

**Assertions**
- `verdict` is `valid`.

### Step 4 — Wait 24 hours OR time-travel

**For automated tests:** Directly manipulate the database or use a repository method to set `expiresAt` to a past date.

### Step 5 — Verify after expiry

Repeat Step 3.

**Assertions**
- `verdict` is `expired`.

### Step 6 — Verify certificate list still returns the expired cert

- `GET /v1/trust-certificates?entityType=identity&entityId={{identityId}}`
- Headers: `x-api-key: {{apiKey}}`

**Assertions**
- The certificate is still in the list.
- Its `status` is `active` (expiry is a temporal check, not a status change).

---

## Scenario 8: Behavioral Exploit Detection → Session Termination

**Goal:** A session accumulates multiple behavioral flags and is terminated by the system.

### Step 1 — Create platform, identity, device, IP, session

Standard setup. Save `sessionId`.

### Step 2 — Log flagged behavioral events

Log three events in sequence:

- Event 1: `endpoint_probe`, `/admin/users`, `flagTriggered: true`, `flagType: unauthorized_admin_access`, `actionTaken: throttled`
- Event 2: `scrape_pattern`, `/api/v1/content?page=1`, `flagTriggered: true`, `flagType: rapid_scraping`, `actionTaken: session_limited`
- Event 3: `rapid_action`, `/api/v1/vote`, `flagTriggered: true`, `flagType: bot_like_behavior`, `actionTaken: blocked`

### Step 3 — End session as terminated

- `PATCH /v1/access/sessions/{{sessionId}}/end`
- Headers: `x-api-key: {{apiKey}}`
- Body:

```json
{
  "riskScoreAtEnd": 15,
  "verdict": "terminated",
  "terminationReason": "behavioral_flags"
}
```

**Assertions**
- `sessionVerdict` is `terminated`.
- `terminationReason` is `behavioral_flags`.
- `riskScoreAtEnd` is `15`.

### Step 4 — Verify audit logs

- `GET /admin/compliance/audit-logs?targetType=session&targetId={{sessionId}}`

**Assertions**
- At least two logs: one for `session_created` and one for `session_ended`.
- The `session_ended` log has `newValue.sessionVerdict: terminated`.

### Step 5 — Verify behavioral event count

- `GET /admin/access/behavioral/session/{{sessionId}}`

**Assertions**
- Array length is `3`.
- Every item has `flagTriggered: true`.
- `actionTaken` values are `throttled`, `session_limited`, and `blocked` respectively.
