# TrustLayer Manual Test Flows — Exact curl Commands

> Run these against a locally started API (`pnpm dev` in `apps/api`, default port `8090`).  
> Every block is sequential within its flow — copy the shell variables from one step into the next.

---

## Quick Reference: Base URL & Headers

```bash
CONTENT_JSON='Content-Type: application/json'
```

---

# CORE FLOWS

---

## 1. Registration-Time Trust Evaluation: The Gate

**Goal:** A new user hits the platform and TrustLayer decides to `flag` them *before* they get inside.

### Step 1 — Create a high-strictness platform

```bash
curl -s -X POST "http://localhost:8090/admin/platforms" \
  -H "$CONTENT_JSON" \
  -d '{
    "name": "E-Shop Gamma",
    "domain": "eshop-gamma.example.com",
    "status": "trial",
    "strictnessLevel": "high"
  }' | jq
```

**Expected output:**
```json
{
  "id": "<PLATFORM_A_ID>",
  "name": "E-Shop Gamma",
  "domain": "eshop-gamma.example.com",
  "status": "trial",
  "strictnessLevel": "high",
  "createdAt": "2026-05-28T...",
  "updatedAt": "2026-05-28T..."
}
```

Save `PLATFORM_A_ID`.

### Step 2 — Create the first API key for Platform A

```bash
curl -s -X POST "http://localhost:8090/admin/api-keys/platforms/$PLATFORM_A_ID" \
  -H "$CONTENT_JSON" \
  -d '{ "name": "Bootstrap Key", "scopes": ["read", "write"] }' | jq
```

**Expected output:**
```json
{
  "apiKey": { "id": "...", "name": "Bootstrap Key", "scopes": ["read", "write"] },
  "rawKey": "<RAW_KEY>"
}
```

```bash
API_KEY_A="<RAW_KEY>"
```

### Step 3 — Create a global identity

```bash
curl -s -X POST "http://localhost:8090/admin/identities" \
  -H "$CONTENT_JSON" \
  -d '{
    "email": "reg@example.com",
    "encryptedEmail": "ENC(reg@example.com)",
    "encryptedFullName": "ENC(Reg User)",
    "trustStatus": "clean"
  }' | jq
```

**Expected output:**
```json
{
  "id": "<IDENTITY_ID>",
  "emailHash": "<SHA-256_HASH_OF_EMAIL>",
  "trustStatus": "clean",
  "isHumanVerified": false,
  "createdAt": "2026-05-28T...",
  "updatedAt": "2026-05-28T..."
}
```

Save `IDENTITY_ID`.

### Step 4 — Resolve device fingerprint

```bash
curl -s -X POST "http://localhost:8090/v1/intelligence/device" \
  -H "$CONTENT_JSON" \
  -H "x-api-key: $API_KEY_A" \
  -d '{
    "signals": [
      { "signalType": "canvas_hash", "value": "canvas_reg_001" },
      { "signalType": "webgl_hash", "value": "webgl_reg_001" },
      { "signalType": "screen_resolution", "value": "1920x1080" },
      { "signalType": "os", "value": "macOS" },
      { "signalType": "timezone", "value": "Asia/Manila" },
      { "signalType": "user_agent", "value": "Mozilla/5.0" },
      { "signalType": "browser", "value": "Chrome" },
      { "signalType": "language", "value": "en-US" }
    ]
  }' | jq
```

**Expected output:**
```json
{
  "device": {
    "id": "<DEVICE_ID>",
    "stableHash": "abc123...",
    "firstSeenAt": "2026-05-28T...",
    "lastSeenAt": "2026-05-28T...",
    "riskScore": 0,
    "isFlagged": false
  },
  "isNew": true
}
```

Save `DEVICE_ID`.

### Step 5 — Evaluate IP intelligence

```bash
curl -s -X POST "http://localhost:8090/v1/intelligence/ip" \
  -H "$CONTENT_JSON" \
  -H "x-api-key: $API_KEY_A" \
  -d '{ "ipAddress": "8.8.8.8" }' | jq
```

**Expected output:**
```json
{
  "id": "<IP_ID>",
  "ipAddress": "8.8.8.8",
  "ipType": "residential",
  "country": "US",
  "riskScore": 10,
  "isBlacklisted": false,
  "createdAt": "2026-05-28T..."
}
```

Save `IP_ID`.

### Step 6 — Create platform user

```bash
curl -s -X POST "http://localhost:8090/v1/platform-users" \
  -H "$CONTENT_JSON" \
  -H "x-api-key: $API_KEY_A" \
  -d "{
    \"identityId\": \"$IDENTITY_ID\",
    \"platformId\": \"$PLATFORM_A_ID\",
    \"externalUserId\": \"reg_user_001\",
    \"statusOnPlatform\": \"active\"
  }" | jq
```

**Expected output:**
```json
{
  "id": "<PLATFORM_USER_ID>",
  "identityId": "<IDENTITY_ID>",
  "platformId": "<PLATFORM_A_ID>",
  "externalUserId": "reg_user_001",
  "statusOnPlatform": "active",
  "joinedAt": "2026-05-28T..."
}
```

### Step 7 — Trigger registration-time background check

```bash
curl -s -X POST "http://localhost:8090/v1/background-checks" \
  -H "$CONTENT_JSON" \
  -H "x-api-key: $API_KEY_A" \
  -d "{
    \"entityType\": \"identity\",
    \"identityId\": \"$IDENTITY_ID\",
    \"triggeredBy\": \"registration\"
  }" | jq
```

**Expected output:**
```json
{
  "id": "<CHECK_ID>",
  "entityType": "identity",
  "identityId": "<IDENTITY_ID>",
  "triggeredBy": "registration",
  "overallVerdict": "clean",
  "createdAt": "2026-05-28T...",
  "completedAt": null
}
```

Save `CHECK_ID`.

### Step 8 — Add mixed results (one soft flag)

```bash
curl -s -X POST "http://localhost:8090/v1/background-checks/$CHECK_ID/results" \
  -H "$CONTENT_JSON" \
  -H "x-api-key: $API_KEY_A" \
  -d '{
    "source": "serp",
    "rawResult": { "results": [{ "title": "Adverse mention" }] },
    "normalizedVerdict": "soft_flag",
    "confidenceScore": 0.7,
    "llmSummary": "Adverse mention in search results."
  }' | jq
```

**Expected output:** `201` with `id`, `checkId`, `source: "serp"`, `normalizedVerdict: "soft_flag"`.

### Step 9 — Complete the check as `flagged`

```bash
curl -s -X POST "http://localhost:8090/v1/background-checks/$CHECK_ID/complete" \
  -H "$CONTENT_JSON" \
  -H "x-api-key: $API_KEY_A" \
  -d '{ "overallVerdict": "flagged" }' | jq
```

**Expected output:**
```json
{
  "id": "<CHECK_ID>",
  "overallVerdict": "flagged",
  "completedAt": "2026-05-28T..."
}
```

### Step 10 — Verify trust score dropped

```bash
curl -s -X GET "http://localhost:8090/v1/trust-score/identity/$IDENTITY_ID" \
  -H "x-api-key: $API_KEY_A" | jq
```

**Expected output:**
```json
{
  "score": 45,
  "signalCount": 1,
  "computedAt": "2026-05-28T..."
}
```
*(Baseline 50 minus a soft-flag penalty.)*

### Step 11 — Log a `flagged` registration access event

```bash
curl -s -X POST "http://localhost:8090/v1/access/events" \
  -H "$CONTENT_JSON" \
  -H "x-api-key: $API_KEY_A" \
  -d "{
    \"platformId\": \"$PLATFORM_A_ID\",
    \"identityId\": \"$IDENTITY_ID\",
    \"ipId\": \"$IP_ID\",
    \"deviceId\": \"$DEVICE_ID\",
    \"eventType\": \"registration\",
    \"verdict\": \"flagged\",
    \"scoreAtEvent\": 45,
    \"triggeredRules\": { \"trustScoreBelow\": 50 }
  }" | jq
```

**Expected output:**
```json
{
  "id": "<ACCESS_EVENT_ID>",
  "platformId": "<PLATFORM_A_ID>",
  "identityId": "<IDENTITY_ID>",
  "eventType": "registration",
  "verdict": "flagged",
  "scoreAtEvent": 45,
  "triggeredRules": { "trustScoreBelow": 50 },
  "createdAt": "2026-05-28T..."
}
```

---

## 2. Portable Trust Certificate: Cross-Platform Whitelist

**Goal:** A verified identity carries portable trust from **Platform A** to **Platform B**.

### Prerequisites

Run Flow 1 up through Step 7 (create background check), but this time with **all-clear** results.

### Step 1 — Platform A: create platform + key

Same as Flow 1 Step 1. Save `PLATFORM_A_ID` and `API_KEY_A`.

### Step 2 — Create identity + trigger background check

Same as Flow 1 Steps 3–7. Save `IDENTITY_ID` and `CHECK_ID`.

### Step 3 — Add all-clear results

```bash
for SRC in ofac linkedin opensanctions serp; do
  curl -s -X POST "http://localhost:8090/v1/background-checks/$CHECK_ID/results" \
    -H "$CONTENT_JSON" \
    -H "x-api-key: $API_KEY_A" \
    -d "{
      \"source\": \"$SRC\",
      \"rawResult\": { \"matches\": [] },
      \"normalizedVerdict\": \"clear\",
      \"confidenceScore\": 0.95,
      \"llmSummary\": \"No adverse findings.\"
    }"
done
```

**Expected output:** four `201` responses.

### Step 4 — Complete check as `clean`

```bash
curl -s -X POST "http://localhost:8090/v1/background-checks/$CHECK_ID/complete" \
  -H "$CONTENT_JSON" \
  -H "x-api-key: $API_KEY_A" \
  -d '{ "overallVerdict": "clean" }' | jq
```

**Expected output:** `overallVerdict: "clean"`, `completedAt` is non-null.

### Step 5 — Issue a Trust Certificate (30 days)

```bash
curl -s -X POST "http://localhost:8090/v1/trust-certificates" \
  -H "$CONTENT_JSON" \
  -H "x-api-key: $API_KEY_A" \
  -d "{
    \"entityType\": \"identity\",
    \"identityId\": \"$IDENTITY_ID\",
    \"issuingCheckId\": \"$CHECK_ID\",
    \"validDays\": 30
  }" | jq
```

**Expected output:**
```json
{
  "id": "<CERTIFICATE_ID>",
  "entityType": "identity",
  "identityId": "<IDENTITY_ID>",
  "status": "active",
  "issuedAt": "2026-05-28T...",
  "expiresAt": "2026-06-27T...",
  "certificateHash": "sha256:...",
  "blockchainTxHash": "0x..."
}
```

Save `CERTIFICATE_ID`.

### Step 6 — Create Platform B

```bash
curl -s -X POST "http://localhost:8090/admin/platforms" \
  -H "$CONTENT_JSON" \
  -d '{
    "name": "Verifier Platform",
    "domain": "verifier.example.com",
    "status": "trial",
    "strictnessLevel": "medium"
  }' | jq
```

Save `PLATFORM_B_ID`. Then create its first API key:

```bash
curl -s -X POST "http://localhost:8090/admin/api-keys/platforms/$PLATFORM_B_ID" \
  -H "$CONTENT_JSON" \
  -d '{ "name": "Bootstrap Key", "scopes": ["read", "write"] }' | jq '.rawKey'
```

```bash
API_KEY_B="<RAW_KEY_FROM_ABOVE>"
```

### Step 7 — Platform B verifies the certificate

```bash
curl -s -X POST "http://localhost:8090/v1/certificate-verifications/$CERTIFICATE_ID" \
  -H "$CONTENT_JSON" \
  -H "x-api-key: $API_KEY_B" \
  -d "{ \"verifiedByPlatformId\": \"$PLATFORM_B_ID\" }" | jq
```

**Expected output:**
```json
{
  "id": "<VERIFICATION_ID>",
  "certificateId": "<CERTIFICATE_ID>",
  "verifiedByPlatformId": "<PLATFORM_B_ID>",
  "verdict": "valid",
  "verifiedAt": "2026-05-28T..."
}
```

### Step 8 — Revoke the certificate

```bash
curl -s -X PATCH "http://localhost:8090/v1/trust-certificates/$CERTIFICATE_ID/revoke" \
  -H "$CONTENT_JSON" \
  -H "x-api-key: $API_KEY_A" \
  -d '{ "reason": "compromised" }' | jq
```

**Expected output:**
```json
{
  "id": "<CERTIFICATE_ID>",
  "status": "revoked",
  "revocationReason": "compromised"
}
```

### Step 9 — Re-verify from Platform B → `revoked`

```bash
curl -s -X POST "http://localhost:8090/v1/certificate-verifications/$CERTIFICATE_ID" \
  -H "$CONTENT_JSON" \
  -H "x-api-key: $API_KEY_B" \
  -d "{ \"verifiedByPlatformId\": \"$PLATFORM_B_ID\" }" | jq
```

**Expected output:** `verdict: "revoked"`.

### Step 10 — Audit trail check

```bash
curl -s -X GET "http://localhost:8090/admin/compliance/audit-logs" \
  -H "$CONTENT_JSON" \
  -d "{ \"targetType\": \"trust_certificate\", \"targetId\": \"$CERTIFICATE_ID\" }" | jq
```

**Expected output:** Array with at least 1 entry (revocation action).

---

## 3. Community Reporting Network Effect: The Collective Blacklist

**Goal:** Three platforms report the same identity; the network auto-escalates the blacklist and degrades trust for everyone.

### Step 1 — Create 3 platforms + keys

Repeat the platform creation 3 times. Save `PLATFORM_X_ID`, `PLATFORM_Y_ID`, `PLATFORM_Z_ID`. Then create the first API key for each via the admin endpoint (same as Flow 1 Step 2), and set `API_KEY_X`, `API_KEY_Y`, `API_KEY_Z`.

### Step 2 — Create shared identity

```bash
curl -s -X POST "http://localhost:8090/admin/identities" \
  -H "$CONTENT_JSON" \
  -d '{
    "email": "bad@actor.com",
    "encryptedEmail": "ENC(bad@actor.com)",
    "encryptedFullName": "ENC(Bad Actor)",
    "trustStatus": "clean"
  }' | jq
```

Save `SHARED_IDENTITY_ID`.

### Step 3 — Baseline trust score

```bash
curl -s -X GET "http://localhost:8090/v1/trust-score/identity/$SHARED_IDENTITY_ID" \
  -H "x-api-key: $API_KEY_X" | jq
```

**Expected output:**
```json
{ "score": 50, "signalCount": 0 }
```

### Step 4 — Each platform submits a community report

```bash
for KEY in "$API_KEY_X" "$API_KEY_Y" "$API_KEY_Z"; do
  curl -s -X POST "http://localhost:8090/v1/registry/community-reports" \
    -H "$CONTENT_JSON" \
    -H "x-api-key: $KEY" \
    -d "{
      \"reportingPlatformId\": \"$PLATFORM_X_ID\",
      \"targetType\": \"identity\",
      \"identityId\": \"$SHARED_IDENTITY_ID\",
      \"severity\": \"high\",
      \"category\": \"fraud\",
      \"description\": \"Confirmed chargeback fraud.\"
    }" | jq '.id'
done
```

Save each returned ID as `REPORT_X_ID`, `REPORT_Y_ID`, `REPORT_Z_ID`.

**Expected output:** three UUID strings.

### Step 5 — Admin accepts each report

```bash
for RID in "$REPORT_X_ID" "$REPORT_Y_ID" "$REPORT_Z_ID"; do
  curl -s -X POST "http://localhost:8090/admin/community-reports/$RID/accept" \
    -H "$CONTENT_JSON" \
    -d '{ "severity": "orange_watch" }' | jq '.registryEntryId'
done
```

**Expected output:** Each returns a `registryEntryId`.

### Step 6 — Verify trust score degraded

```bash
curl -s -X GET "http://localhost:8090/v1/trust-score/identity/$SHARED_IDENTITY_ID" \
  -H "x-api-key: $API_KEY_X" | jq
```

**Expected output:**
```json
{ "score": 30, "signalCount": 3 }
```

### Step 7 — Verify active blacklist entries

```bash
curl -s -X GET "http://localhost:8090/admin/registry/entries?listType=blacklist&isActive=true" | jq
```

**Expected output:** Array with ≥ 3 entries, each with `listType: "blacklist"`, `severity: "orange_watch"`, `isActive: true`.

### Step 8 — Platform Z runs a new background check → score reflects flags

```bash
curl -s -X POST "http://localhost:8090/v1/background-checks" \
  -H "$CONTENT_JSON" \
  -H "x-api-key: $API_KEY_Z" \
  -d "{
    \"entityType\": \"identity\",
    \"identityId\": \"$SHARED_IDENTITY_ID\",
    \"triggeredBy\": \"registration\"
  }" | jq
```

**Expected output:** The check is created. The existing low trust score (30) is already visible in the system for this identity.

---

# SECONDARY FLOWS

---

## 4. Behavioral Exploit Detection → Session Termination

**Goal:** A user passes registration but triggers behavioral flags inside the session.

### Prerequisites

Platform `PLATFORM_A_ID` + `API_KEY_A`, identity `IDENTITY_ID`, device `DEVICE_ID`, IP `IP_ID` from Flow 1.

### Step 1 — Start a session

```bash
curl -s -X POST "http://localhost:8090/v1/access/sessions" \
  -H "$CONTENT_JSON" \
  -H "x-api-key: $API_KEY_A" \
  -d "{
    \"identityId\": \"$IDENTITY_ID\",
    \"platformId\": \"$PLATFORM_A_ID\",
    \"ipId\": \"$IP_ID\",
    \"deviceId\": \"$DEVICE_ID\",
    \"sessionTokenHash\": \"sess_hash_abc123\",
    \"riskScoreAtStart\": 65
  }" | jq
```

**Expected output:**
```json
{
  "id": "<SESSION_ID>",
  "identityId": "<IDENTITY_ID>",
  "platformId": "<PLATFORM_A_ID>",
  "riskScoreAtStart": 65,
  "startedAt": "2026-05-28T...",
  "sessionVerdict": "clean"
}
```

Save `SESSION_ID`.

### Step 2 — Log 4 normal behavioral events

```bash
for i in 1 2 3 4; do
  curl -s -X POST "http://localhost:8090/v1/access/behavioral" \
    -H "$CONTENT_JSON" \
    -H "x-api-key: $API_KEY_A" \
    -d "{
      \"sessionId\": \"$SESSION_ID\",
      \"identityId\": \"$IDENTITY_ID\",
      \"platformId\": \"$PLATFORM_A_ID\",
      \"eventType\": \"api_call\",
      \"endpoint\": \"/v1/orders\",
      \"flagTriggered\": false,
      \"actionTaken\": \"none\"
    }" | jq '.id'
done
```

**Expected output:** four UUIDs.

### Step 3 — Log the exploit event (flag triggered)

```bash
curl -s -X POST "http://localhost:8090/v1/access/behavioral" \
  -H "$CONTENT_JSON" \
  -H "x-api-key: $API_KEY_A" \
  -d "{
    \"sessionId\": \"$SESSION_ID\",
    \"identityId\": \"$IDENTITY_ID\",
    \"platformId\": \"$PLATFORM_A_ID\",
    \"eventType\": \"endpoint_probe\",
    \"endpoint\": \"/v1/payments\",
    \"flagTriggered\": true,
    \"flagType\": \"permission_violation\",
    \"actionTaken\": \"session_limited\"
  }" | jq
```

**Expected output:**
```json
{
  "id": "<BEHAVIORAL_EVENT_ID>",
  "sessionId": "<SESSION_ID>",
  "flagTriggered": true,
  "actionTaken": "session_limited"
}
```

### Step 4 — End session as `terminated`

```bash
curl -s -X PATCH "http://localhost:8090/v1/access/sessions/$SESSION_ID/end" \
  -H "$CONTENT_JSON" \
  -H "x-api-key: $API_KEY_A" \
  -d '{
    "riskScoreAtEnd": 45,
    "verdict": "terminated",
    "terminationReason": "behavioral_exploit"
  }' | jq
```

**Expected output:**
```json
{
  "id": "<SESSION_ID>",
  "sessionVerdict": "terminated",
  "terminationReason": "behavioral_exploit",
  "endedAt": "2026-05-28T..."
}
```

### Step 5 — Add a negative trust signal

```bash
curl -s -X POST "http://localhost:8090/v1/trust-signals" \
  -H "$CONTENT_JSON" \
  -H "x-api-key: $API_KEY_A" \
  -d "{
    \"entityType\": \"identity\",
    \"identityId\": \"$IDENTITY_ID\",
    \"signalType\": \"behavioral_flag\",
    \"weight\": -15,
    \"source\": \"behavioral\",
    \"referenceId\": \"$SESSION_ID\"
  }" | jq
```

**Expected output:** Signal created with `weight: -15`.

### Step 6 — Verify trust score dropped

```bash
curl -s -X GET "http://localhost:8090/v1/trust-score/identity/$IDENTITY_ID" \
  -H "x-api-key: $API_KEY_A" | jq
```

**Expected output:** Score is lower than baseline (e.g., 35).

---

## 5. Organization Verification & B2B Partner Onboarding

**Goal:** Verify a company, issue an org-level certificate, flag it later.

### Step 1 — Create platform + key

Same as Flow 1 Step 1. Save `PLATFORM_A_ID` and `API_KEY_A`.

### Step 2 — Submit an organization

```bash
curl -s -X POST "http://localhost:8090/v1/organizations" \
  -H "$CONTENT_JSON" \
  -H "x-api-key: $API_KEY_A" \
  -d '{
    "legalName": "Partner Logistics Inc",
    "domain": "partner-logistics.example.com",
    "registrationNumber": "REG-PL-2025",
    "country": "PH",
    "industry": "Logistics",
    "trustStatus": "clean"
  }' | jq
```

**Expected output:**
```json
{
  "id": "<ORG_ID>",
  "legalName": "Partner Logistics Inc",
  "domain": "partner-logistics.example.com",
  "submittedByPlatformId": "<PLATFORM_A_ID>",
  "trustStatus": "clean"
}
```

Save `ORG_ID`.

### Step 3 — Trigger org background check

```bash
curl -s -X POST "http://localhost:8090/v1/background-checks" \
  -H "$CONTENT_JSON" \
  -H "x-api-key: $API_KEY_A" \
  -d "{
    \"entityType\": \"organization\",
    \"orgId\": \"$ORG_ID\",
    \"triggeredBy\": \"manual\"
  }" | jq
```

Save `ORG_CHECK_ID`.

### Step 4 — Add verification results

```bash
for PAYLOAD in \
  '{"source":"business_registry","rawResult":{"found":true},"normalizedVerdict":"clear","confidenceScore":0.95,"llmSummary":"Verified in business registry."}' \
  '{"source":"ofac","rawResult":{"matches":[]},"normalizedVerdict":"clear","confidenceScore":0.99,"llmSummary":"No sanctions matches."}'; do
  curl -s -X POST "http://localhost:8090/v1/background-checks/$ORG_CHECK_ID/results" \
    -H "$CONTENT_JSON" \
    -H "x-api-key: $API_KEY_A" \
    -d "$PAYLOAD" | jq '.id'
done
```

### Step 5 — Complete as `clean`

```bash
curl -s -X POST "http://localhost:8090/v1/background-checks/$ORG_CHECK_ID/complete" \
  -H "$CONTENT_JSON" \
  -H "x-api-key: $API_KEY_A" \
  -d '{ "overallVerdict": "clean" }' | jq
```

### Step 6 — Verify org trust score

```bash
curl -s -X GET "http://localhost:8090/v1/trust-score/organization/$ORG_ID" \
  -H "x-api-key: $API_KEY_A" | jq
```

**Expected output:**
```json
{ "score": 60, "signalCount": 1 }
```

### Step 7 — Issue org Trust Certificate

```bash
curl -s -X POST "http://localhost:8090/v1/trust-certificates" \
  -H "$CONTENT_JSON" \
  -H "x-api-key: $API_KEY_A" \
  -d "{
    \"entityType\": \"organization\",
    \"orgId\": \"$ORG_ID\",
    \"issuingCheckId\": \"$ORG_CHECK_ID\",
    \"validDays\": 90
  }" | jq
```

### Step 8 — Flag the organization

```bash
curl -s -X PATCH "http://localhost:8090/admin/organizations/$ORG_ID/status" \
  -H "$CONTENT_JSON" \
  -d '{ "trustStatus": "flagged" }' | jq
```

**Expected output:** `trustStatus: "flagged"`.

### Step 9 — Re-lookup by domain

```bash
curl -s -X GET "http://localhost:8090/admin/organizations/by-domain/partner-logistics.example.com" | jq
```

**Expected output:**
```json
{
  "id": "<ORG_ID>",
  "trustStatus": "flagged"
}
```

---

## 6. Configurable Strictness: Same User, Different Outcomes

**Goal:** The same identity gets different treatment on a low-risk vs. high-risk platform.

### Step 1 — Create Platform Low

```bash
curl -s -X POST "http://localhost:8090/admin/platforms" \
  -H "$CONTENT_JSON" \
  -d '{
    "name": "Community Forum",
    "domain": "forum.example.com",
    "status": "trial",
    "strictnessLevel": "low"
  }' | jq
```

Save `PLATFORM_LOW_ID`. Then create its first API key:

```bash
curl -s -X POST "http://localhost:8090/admin/api-keys/platforms/$PLATFORM_LOW_ID" \
  -H "$CONTENT_JSON" \
  -d '{ "name": "Bootstrap Key", "scopes": ["read", "write"] }' | jq '.rawKey'
```

```bash
API_KEY_LOW="<RAW_KEY_FROM_ABOVE>"
```

### Step 2 — Create Platform High

```bash
curl -s -X POST "http://localhost:8090/admin/platforms" \
  -H "$CONTENT_JSON" \
  -d '{
    "name": "Trading Platform",
    "domain": "trading.example.com",
    "status": "trial",
    "strictnessLevel": "high"
  }' | jq
```

Save `PLATFORM_HIGH_ID`. Then create its first API key:

```bash
curl -s -X POST "http://localhost:8090/admin/api-keys/platforms/$PLATFORM_HIGH_ID" \
  -H "$CONTENT_JSON" \
  -d '{ "name": "Bootstrap Key", "scopes": ["read", "write"] }' | jq '.rawKey'
```

```bash
API_KEY_HIGH="<RAW_KEY_FROM_ABOVE>"
```

### Step 3 — Apply preset rules to each

```bash
# Low
curl -s -X POST "http://localhost:8090/v1/platform/rules/apply-preset" \
  -H "$CONTENT_JSON" \
  -H "x-api-key: $API_KEY_LOW" \
  -d '{ "strictnessLevel": "low" }' | jq

# High
curl -s -X POST "http://localhost:8090/v1/platform/rules/apply-preset" \
  -H "$CONTENT_JSON" \
  -H "x-api-key: $API_KEY_HIGH" \
  -d '{ "strictnessLevel": "high" }' | jq
```

**Expected output:** Both return `201`.

### Step 4 — List rules and compare

```bash
curl -s -X GET "http://localhost:8090/v1/platform/rules" \
  -H "x-api-key: $API_KEY_LOW" | jq '.[] | { trigger: .ruleTrigger, action: .action }'

curl -s -X GET "http://localhost:8090/v1/platform/rules" \
  -H "x-api-key: $API_KEY_HIGH" | jq '.[] | { trigger: .ruleTrigger, action: .action }'
```

**Expected output:** High-strictness platform has more `block` and `require_reverification` actions; low has more `flag` and `throttle`.

### Step 5 — Create borderline identity

```bash
curl -s -X POST "http://localhost:8090/admin/identities" \
  -H "$CONTENT_JSON" \
  -d '{
    "email": "border@example.com",
    "encryptedEmail": "ENC(border@example.com)",
    "encryptedFullName": "ENC(Borderline User)",
    "trustStatus": "clean"
  }' | jq
```

Save `BORDERLINE_IDENTITY_ID`.

### Step 6 — Set trust score to 55 (just above threshold)

```bash
curl -s -X POST "http://localhost:8090/v1/trust-signals" \
  -H "$CONTENT_JSON" \
  -H "x-api-key: $API_KEY_LOW" \
  -d "{
    \"entityType\": \"identity\",
    \"identityId\": \"$BORDERLINE_IDENTITY_ID\",
    \"signalType\": \"clean_history\",
    \"weight\": 5,
    \"source\": \"manual\",
    \"referenceId\": \"manual-001\"
  }" | jq
```

Verify score:
```bash
curl -s -X GET "http://localhost:8090/v1/trust-score/identity/$BORDERLINE_IDENTITY_ID" \
  -H "x-api-key: $API_KEY_LOW" | jq
```

**Expected output:** `score: 55`.

### Step 7 — Log access event on Platform Low → `allowed`

```bash
curl -s -X POST "http://localhost:8090/v1/access/events" \
  -H "$CONTENT_JSON" \
  -H "x-api-key: $API_KEY_LOW" \
  -d "{
    \"platformId\": \"$PLATFORM_LOW_ID\",
    \"identityId\": \"$BORDERLINE_IDENTITY_ID\",
    \"ipId\": \"$IP_ID\",
    \"deviceId\": \"$DEVICE_ID\",
    \"eventType\": \"login\",
    \"verdict\": \"allowed\",
    \"scoreAtEvent\": 55,
    \"triggeredRules\": {}
  }" | jq
```

**Expected output:** `verdict: "allowed"`.

### Step 8 — Log access event on Platform High → `throttled` or `require_reverification`

```bash
curl -s -X POST "http://localhost:8090/v1/access/events" \
  -H "$CONTENT_JSON" \
  -H "x-api-key: $API_KEY_HIGH" \
  -d "{
    \"platformId\": \"$PLATFORM_HIGH_ID\",
    \"identityId\": \"$BORDERLINE_IDENTITY_ID\",
    \"ipId\": \"$IP_ID\",
    \"deviceId\": \"$DEVICE_ID\",
    \"eventType\": \"login\",
    \"verdict\": \"throttled\",
    \"scoreAtEvent\": 55,
    \"triggeredRules\": { \"scoreBelowHighThreshold\": true }
  }" | jq
```

**Expected output:** `verdict: "throttled"`, triggered rules populated.

---

## 7. Device Fingerprint Evasion Detection

**Goal:** A bad actor changes email but keeps the same device — TrustLayer recognizes them.

### Step 1 — Create platform + key + identity A

Same as Flow 1. Save `PLATFORM_A_ID`, `API_KEY_A`, `ALICE_IDENTITY_ID`.

### Step 2 — Resolve device for Alice

```bash
curl -s -X POST "http://localhost:8090/v1/intelligence/device" \
  -H "$CONTENT_JSON" \
  -H "x-api-key: $API_KEY_A" \
  -d '{
    "signals": [
      { "signalType": "canvas_hash", "value": "canvas_stable_abc" },
      { "signalType": "webgl_hash", "value": "webgl_stable_xyz" },
      { "signalType": "screen_resolution", "value": "2560x1440" },
      { "signalType": "os", "value": "macOS" },
      { "signalType": "timezone", "value": "Asia/Manila" },
      { "signalType": "user_agent", "value": "Mozilla/5.0 v1" },
      { "signalType": "browser", "value": "Chrome" },
      { "signalType": "language", "value": "en-US" }
    ]
  }' | jq
```

Save `DEVICE_A_ID` and `STABLE_HASH`.

**Expected output:** `isNew: true`.

### Step 3 — Create identity B (new email, same persona)

```bash
curl -s -X POST "http://localhost:8090/admin/identities" \
  -H "$CONTENT_JSON" \
  -d '{
    "email": "bob@example.com",
    "encryptedEmail": "ENC(bob@example.com)",
    "encryptedFullName": "ENC(Bob Smith)",
    "trustStatus": "clean"
  }' | jq
```

Save `BOB_IDENTITY_ID`.

### Step 4 — Send same stable signals, different user agent

```bash
curl -s -X POST "http://localhost:8090/v1/intelligence/device" \
  -H "$CONTENT_JSON" \
  -H "x-api-key: $API_KEY_A" \
  -d '{
    "signals": [
      { "signalType": "canvas_hash", "value": "canvas_stable_abc" },
      { "signalType": "webgl_hash", "value": "webgl_stable_xyz" },
      { "signalType": "screen_resolution", "value": "2560x1440" },
      { "signalType": "os", "value": "macOS" },
      { "signalType": "timezone", "value": "Asia/Manila" },
      { "signalType": "user_agent", "value": "Mozilla/5.0 v2" },
      { "signalType": "browser", "value": "Chrome" },
      { "signalType": "language", "value": "en-GB" }
    ]
  }' | jq
```

**Expected output:**
```json
{
  "device": {
    "id": "<DEVICE_A_ID>",
    "stableHash": "<STABLE_HASH>"
  },
  "isNew": false
}
```

### Step 5 — Create entity alias linking Bob back to Alice

```bash
curl -s -X POST "http://localhost:8090/admin/aliases" \
  -H "$CONTENT_JSON" \
  -d "{
    \"canonicalEntityType\": \"identity\",
    \"canonicalEntityId\": \"$ALICE_IDENTITY_ID\",
    \"aliasType\": \"email\",
    \"aliasValueHash\": \"hash-bob-001\",
    \"aliasValueEncrypted\": \"ENC(bob@example.com)\",
    \"confidence\": 0.92,
    \"source\": \"behavioral\"
  }" | jq
```

**Expected output:** Alias created with `canonicalEntityId` pointing to Alice.

### Step 6 — Resolve alias

```bash
curl -s -X POST "http://localhost:8090/admin/aliases/resolve" \
  -H "$CONTENT_JSON" \
  -d '{
    "aliasType": "email",
    "aliasValueHash": "hash-bob-001"
  }' | jq
```

**Expected output:**
```json
{
  "canonicalEntityId": "<ALICE_IDENTITY_ID>",
  "canonicalEntityType": "identity",
  "confidence": 0.92
}
```

---

# SETUP / BOOTSTRAP FLOWS

---

## 8. Platform Onboarding & API Key Lifecycle

### Create platform

```bash
curl -s -X POST "http://localhost:8090/admin/platforms" \
  -H "$CONTENT_JSON" \
  -d '{
    "name": "Test Platform",
    "domain": "test.example.com",
    "status": "trial",
    "strictnessLevel": "medium"
  }' | jq
```

Save `PLATFORM_ID`.

### Create the first API key (admin endpoint)

```bash
curl -s -X POST "http://localhost:8090/admin/api-keys/platforms/$PLATFORM_ID" \
  -H "$CONTENT_JSON" \
  -d '{ "name": "Bootstrap Key", "scopes": ["read", "write"] }' | jq
```

**Expected output:**
```json
{
  "apiKey": { "id": "...", "name": "Bootstrap Key", "scopes": ["read", "write"] },
  "rawKey": "<RAW_KEY>"
}
```

```bash
RAW_KEY="<RAW_KEY>"
```

### Self-service create additional keys (once you have one)

With an existing key for that platform, you can now curl the self-service endpoint:

```bash
curl -s -X POST "http://localhost:8090/v1/platform/api-keys" \
  -H "$CONTENT_JSON" \
  -H "x-api-key: $RAW_KEY" \
  -d '{ "name": "Production Key", "scopes": ["read", "write"] }' | jq
```

**Expected output:**
```json
{
  "apiKey": { "id": "...", "name": "Production Key", "scopes": ["read", "write"] },
  "rawKey": "<NEW_RAW_KEY>"
}
```

Save `NEW_RAW_KEY` and `KEY_ID`.

### Self-read

```bash
curl -s -X GET "http://localhost:8090/v1/platform" \
  -H "x-api-key: $RAW_KEY" | jq
```

**Expected output:** Your own platform object.

### List keys

```bash
curl -s -X GET "http://localhost:8090/v1/platform/api-keys" \
  -H "x-api-key: $RAW_KEY" | jq
```

**Expected output:** Array containing the newly created key.

### Rotate key

```bash
curl -s -X POST "http://localhost:8090/v1/platform/api-keys/$KEY_ID/rotate" \
  -H "$CONTENT_JSON" \
  -H "x-api-key: $RAW_KEY" \
  -d '{ "name": "Rotated Key" }' | jq
```

**Expected output:** New `rawKey` returned.

Save `NEW_RAW_KEY`.

### Verify old key is dead

```bash
curl -s -o /dev/null -w "%{http_code}" -X GET "http://localhost:8090/v1/platform" \
  -H "x-api-key: $RAW_KEY"
```

**Expected output:** `401`

### Verify new key works

```bash
curl -s -o /dev/null -w "%{http_code}" -X GET "http://localhost:8090/v1/platform" \
  -H "x-api-key: $NEW_RAW_KEY"
```

**Expected output:** `200`

### Revoke key

```bash
curl -s -X DELETE "http://localhost:8090/v1/platform/api-keys/$KEY_ID" \
  -H "x-api-key: $NEW_RAW_KEY" | jq
```

**Expected output:** Key with `revokedAt` populated.

### Update strictness

```bash
curl -s -X PATCH "http://localhost:8090/v1/platform/strictness" \
  -H "$CONTENT_JSON" \
  -H "x-api-key: $NEW_RAW_KEY" \
  -d '{ "strictnessLevel": "high" }' | jq
```

**Expected output:** `strictnessLevel: "high"`.

---

## 9. Identity & Cross-Platform User Linking

### Create global identity

```bash
curl -s -X POST "http://localhost:8090/admin/identities" \
  -H "$CONTENT_JSON" \
  -d '{
    "email": "cross@example.com",
    "encryptedEmail": "ENC(cross@example.com)",
    "encryptedFullName": "ENC(Cross User)",
    "trustStatus": "clean"
  }' | jq
```

Save `CROSS_IDENTITY_ID`.

### Link to Platform A

```bash
curl -s -X POST "http://localhost:8090/v1/platform-users" \
  -H "$CONTENT_JSON" \
  -H "x-api-key: $API_KEY_A" \
  -d "{
    \"identityId\": \"$CROSS_IDENTITY_ID\",
    \"platformId\": \"$PLATFORM_A_ID\",
    \"externalUserId\": \"user_001\",
    \"statusOnPlatform\": \"active\"
  }" | jq
```

**Expected output:** Platform user with `platformId` and `identityId` populated.

### Fetch by external ID

```bash
curl -s -X GET "http://localhost:8090/v1/platform-users/user_001" \
  -H "x-api-key: $API_KEY_A" | jq
```

**Expected output:** `externalUserId: "user_001"`.

### Link same identity to Platform B

```bash
curl -s -X POST "http://localhost:8090/v1/platform-users" \
  -H "$CONTENT_JSON" \
  -H "x-api-key: $API_KEY_B" \
  -d "{
    \"identityId\": \"$CROSS_IDENTITY_ID\",
    \"platformId\": \"$PLATFORM_B_ID\",
    \"externalUserId\": \"user_002\",
    \"statusOnPlatform\": \"active\"
  }" | jq
```

### Admin blocks identity globally

```bash
curl -s -X PATCH "http://localhost:8090/admin/identities/$CROSS_IDENTITY_ID/status" \
  -H "$CONTENT_JSON" \
  -d '{ "trustStatus": "blocked" }' | jq
```

**Expected output:** `trustStatus: "blocked"`.

### Verify Platform A local user still active

```bash
curl -s -X GET "http://localhost:8090/v1/platform-users/user_001" \
  -H "x-api-key: $API_KEY_A" | jq '.statusOnPlatform'
```

**Expected output:** `"active"` (global/local split).

---

## 10. Background Check Orchestration

### Trigger check

```bash
curl -s -X POST "http://localhost:8090/v1/background-checks" \
  -H "$CONTENT_JSON" \
  -H "x-api-key: $API_KEY_A" \
  -d "{
    \"entityType\": \"identity\",
    \"identityId\": \"$IDENTITY_ID\",
    \"triggeredBy\": \"manual\"
  }" | jq
```

Save `MANUAL_CHECK_ID`.

### Add multi-source results

```bash
for PAYLOAD in \
  '{"source":"ofac","rawResult":{"matches":[]},"normalizedVerdict":"clear","confidenceScore":0.95,"llmSummary":"No OFAC hits."}' \
  '{"source":"linkedin","rawResult":{"profiles":[{}]},"normalizedVerdict":"clear","confidenceScore":0.8,"llmSummary":"Profile found."}' \
  '{"source":"opensanctions","rawResult":{"hits":[]},"normalizedVerdict":"clear","confidenceScore":0.9,"llmSummary":"Clean."}' \
  '{"source":"serp","rawResult":{"results":[]},"normalizedVerdict":"clear","confidenceScore":0.85,"llmSummary":"No adverse news."}'; do
  curl -s -X POST "http://localhost:8090/v1/background-checks/$MANUAL_CHECK_ID/results" \
    -H "$CONTENT_JSON" \
    -H "x-api-key: $API_KEY_A" \
    -d "$PAYLOAD" | jq '.id'
done
```

### Complete check

```bash
curl -s -X POST "http://localhost:8090/v1/background-checks/$MANUAL_CHECK_ID/complete" \
  -H "$CONTENT_JSON" \
  -H "x-api-key: $API_KEY_A" \
  -d '{ "overallVerdict": "clean" }' | jq
```

**Expected output:** `overallVerdict: "clean"`, `completedAt` set.

### Auto-generated trust signal

```bash
curl -s -X GET "http://localhost:8090/v1/trust-signals?identityId=$IDENTITY_ID" \
  -H "x-api-key: $API_KEY_A" | jq
```

**Expected output:** At least one signal with `signalType: "clean_history"`, `source: "background_check"`, `weight: 10`.

### Verify score

```bash
curl -s -X GET "http://localhost:8090/v1/trust-score/identity/$IDENTITY_ID" \
  -H "x-api-key: $API_KEY_A" | jq
```

**Expected output:** `score: 60` (50 baseline + 10 clean_history).

---

## 11. Registry Entry + Multi-Target Linking

### Create blacklist entry

```bash
curl -s -X POST "http://localhost:8090/v1/registry/entries" \
  -H "$CONTENT_JSON" \
  -H "x-api-key: $API_KEY_A" \
  -d '{
    "listType": "blacklist",
    "severity": "orange_watch",
    "sourceType": "manual"
  }' | jq
```

Save `REGISTRY_ENTRY_ID`.

### Link to identity

```bash
curl -s -X POST "http://localhost:8090/v1/registry/targets" \
  -H "$CONTENT_JSON" \
  -H "x-api-key: $API_KEY_A" \
  -d "{
    \"registryEntryId\": \"$REGISTRY_ENTRY_ID\",
    \"targetType\": \"identity\",
    \"identityId\": \"$IDENTITY_ID\"
  }" | jq
```

### Link to IP

```bash
curl -s -X POST "http://localhost:8090/v1/registry/targets" \
  -H "$CONTENT_JSON" \
  -H "x-api-key: $API_KEY_A" \
  -d "{
    \"registryEntryId\": \"$REGISTRY_ENTRY_ID\",
    \"targetType\": \"ip\",
    \"ipId\": \"$IP_ID\"
  }" | jq
```

### Link to email hash

```bash
curl -s -X POST "http://localhost:8090/v1/registry/targets" \
  -H "$CONTENT_JSON" \
  -H "x-api-key: $API_KEY_A" \
  -d "{
    \"registryEntryId\": \"$REGISTRY_ENTRY_ID\",
    \"targetType\": \"email\",
    \"email\": \"reg@example.com\"
  }" | jq
```

### Lookup by email

```bash
curl -s -X GET "http://localhost:8090/admin/registry/lookup" \
  -H "$CONTENT_JSON" \
  -d "{ \"targetType\": \"email\", \"email\": \"reg@example.com\" }" | jq
```

**Expected output:** Array with the blacklist entry.

### Escalate severity

```bash
curl -s -X POST "http://localhost:8090/v1/registry/entries/$REGISTRY_ENTRY_ID/escalate" \
  -H "x-api-key: $API_KEY_A" | jq
```

**Expected output:** `severity: "red_hard"`.

---

## 12. Consent-Gated Data Processing

### Record consent

```bash
curl -s -X POST "http://localhost:8090/v1/compliance/consent" \
  -H "$CONTENT_JSON" \
  -H "x-api-key: $API_KEY_A" \
  -d "{
    \"identityId\": \"$IDENTITY_ID\",
    \"platformId\": \"$PLATFORM_A_ID\",
    \"consentType\": \"data_processing\",
    \"consentVersion\": \"v1.0\",
    \"ipAtConsent\": \"192.168.1.1\"
  }" | jq
```

Save `CONSENT_ID`.

**Expected output:**
```json
{
  "id": "<CONSENT_ID>",
  "identityId": "<IDENTITY_ID>",
  "platformId": "<PLATFORM_A_ID>",
  "consentType": "data_processing",
  "acceptedAt": "2026-05-28T..."
}
```

### Check active consent

```bash
curl -s -X GET "http://localhost:8090/v1/compliance/consent/check" \
  -H "x-api-key: $API_KEY_A" \
  -G \
  -d "identityId=$IDENTITY_ID" \
  -d "platformId=$PLATFORM_A_ID" \
  -d "consentType=data_processing" | jq
```

**Expected output:** Consent record with `revokedAt: null`.

### Revoke consent

```bash
curl -s -X PATCH "http://localhost:8090/v1/compliance/consent/$CONSENT_ID/revoke" \
  -H "x-api-key: $API_KEY_A" | jq
```

**Expected output:** `revokedAt` is now populated.

### Check again → empty/null

```bash
curl -s -X GET "http://localhost:8090/v1/compliance/consent/check" \
  -H "x-api-key: $API_KEY_A" \
  -G \
  -d "identityId=$IDENTITY_ID" \
  -d "platformId=$PLATFORM_A_ID" \
  -d "consentType=data_processing" | jq
```

**Expected output:** `{}` or `null`.

---

## Tips for Running These Manually

1. **Use `jq` for readability.** If you don't have `jq`, pipe to `python -m json.tool` or remove the `| jq`.
2. **Export variables between steps.** Set `PLATFORM_A_ID`, `API_KEY_A`, etc. in your shell so later commands can reuse them.
3. **Watch the database.** Open Prisma Studio (`pnpm prisma studio`) in parallel to confirm rows are written correctly.
4. **Check the server logs.** NestJS logs show validation errors clearly — if a curl returns `400`, the body will tell you which field failed.
5. **Reset between flows.** These flows are independent. Wipe the test database between runs (`pnpm prisma migrate reset`) if you want clean state.
