# C. Trust Engine API Tests

Covers `trust_signals`, `trust_score_snapshots`, `trust_certificates`, and `certificate_verifications`.

---

## Environment Variables Needed

| Variable | How to obtain |
|---|---|
| `baseUrl` | Your local / staging API root |
| `apiKey` | `POST /v1/platform/api-keys` using a platform's ID |
| `platformId` | From `POST /admin/platforms` |
| `identityId` | From `POST /admin/identities` |
| `orgId` | From `POST /v1/organizations` |
| `trustSignalId` | From `POST /v1/trust-signals` |
| `snapshotId` | From `POST /v1/trust-score-snapshots` |
| `certificateId` | From `POST /v1/trust-certificates` |
| `verificationRequestId` | From `POST /v1/compliance/verification-requests` |
| `backgroundCheckId` | From `POST /v1/background-checks` |

---

## C.1 Trust Signals

### C.1.1 Create Trust Signal for Identity

- **Method:** `POST`
- **URL:** `{{baseUrl}}/v1/trust-signals`
- **Headers:**
  - `Content-Type: application/json`
  - `x-api-key: {{apiKey}}`
- **Body:**

```json
{
  "entityType": "identity",
  "identityId": "{{identityId}}",
  "signalType": "linkedin_verified",
  "weight": 10,
  "source": "background_check",
  "referenceId": "{{backgroundCheckId}}",
  "expiresAt": "2027-01-01T00:00:00Z"
}
```

**Field notes**
- `entityType`: `identity` | `organization`
- `signalType`: `linkedin_verified` | `vpn_detected` | `ofac_match` | `community_report` | `clean_history` | `behavioral_flag` | `kyc_passed`
- `source`: `background_check` | `behavioral` | `community_report` | `ml` | `manual`
- `weight`: positive or negative decimal.
- `expiresAt`: optional. After this date the signal is excluded from score computation.

**Assertions**
- HTTP `201` or `200`.
- Response contains `id`, `entityType`, `identityId`, `signalType`, `weight`, `source`, `referenceId`, `expiresAt`, `createdAt`.
- Save `id` as `{{trustSignalId}}`.

**Negative case**
- Missing `x-api-key` → `401`.
- Invalid `signalType` → `400`.
- Both `identityId` and `orgId` provided → `400` (exactly one entity must be targeted).

---

### C.1.2 Create Trust Signal for Organization

- **Method:** `POST`
- **URL:** `{{baseUrl}}/v1/trust-signals`
- **Headers:**
  - `Content-Type: application/json`
  - `x-api-key: {{apiKey}}`
- **Body:**

```json
{
  "entityType": "organization",
  "orgId": "{{orgId}}",
  "signalType": "clean_history",
  "weight": 5,
  "source": "background_check",
  "referenceId": "{{backgroundCheckId}}"
}
```

**Assertions**
- HTTP `201` or `200`.
- Response `orgId` matches request.
- Response `entityType` is `organization`.

---

### C.1.3 Compute Trust Score — Baseline

For an identity with **no active trust signals**:

- **Method:** `GET`
- **URL:** `{{baseUrl}}/v1/trust-score/identity/{{identityId}}`
- **Headers:** `x-api-key: {{apiKey}}`

**Assertions**
- HTTP `200`.
- Response `score` is `50` (baseline).
- Response `signalCount` is `0`.

---

### C.1.4 Compute Trust Score — Single Positive Signal

1. Create a trust signal with `weight: 10` for `{{identityId}}`.
2. Query the trust score.

**Assertions**
- `score` is `60` (50 + 10).
- `signalCount` is `1`.

---

### C.1.5 Compute Trust Score — Mixed Signals

1. Create three signals for the same identity:
   - `weight: +15` (`kyc_passed`)
   - `weight: -20` (`behavioral_flag`)
   - `weight: +5` (`clean_history`)
2. Query the trust score.

**Assertions**
- `score` is `50` (50 + 15 - 20 + 5 = 50).
- `signalCount` is `3`.

---

### C.1.6 Compute Trust Score — Clamped to Bounds

1. Create a signal with `weight: +100`.
2. Query the trust score.

**Assertions**
- `score` is `100` (not 150).

3. Create another signal with `weight: -200` (on a fresh identity).

**Assertions**
- `score` is `0` (not -150).

---

### C.1.7 Signal Expiry Exclusion

1. Create a trust signal with `expiresAt` in the past (e.g., `2020-01-01T00:00:00Z`).
2. Query the trust score.

**Assertions**
- `score` is `50` (baseline). The expired signal must not contribute.
- `signalCount` in the score response is `0`.

**Note:** To test this via HTTP, you must be able to create a backdated signal. If the API rejects past `expiresAt`, seed the signal directly via repository/service in test setup, or mock the clock.

---

### C.1.8 List Trust Signals by Entity

- **Method:** `GET`
- **URL:** `{{baseUrl}}/v1/trust-signals?entityType=identity&identityId={{identityId}}`
- **Headers:** `x-api-key: {{apiKey}}`

**Test queries**
- `?entityType=identity&identityId={{identityId}}`
- `?entityType=identity&identityId={{identityId}}&signalType=kyc_passed`
- `?entityType=identity&identityId={{identityId}}&source=manual`
- `?entityType=organization&orgId={{orgId}}`

**Assertions**
- HTTP `200`.
- Response is an array.
- Every item matches the filter parameters.
- Expired signals may or may not appear in the list depending on repository query logic; document whichever behavior is implemented.

---

## C.2 Trust Score Snapshots

### C.2.1 Create Trust Score Snapshot

- **Method:** `POST`
- **URL:** `{{baseUrl}}/v1/trust-score-snapshots`
- **Headers:**
  - `Content-Type: application/json`
  - `x-api-key: {{apiKey}}`
- **Body:**

```json
{
  "entityType": "identity",
  "identityId": "{{identityId}}",
  "score": 65,
  "snapshotReason": "certificate_issued",
  "referenceId": "{{verificationRequestId}}"
}
```

**Field notes**
- `snapshotReason`: `background_check` | `behavioral_flag` | `community_report` | `certificate_issued` | `manual_review` | `signal_expired`
- `referenceId`: FK to the triggering event (verification request, background check, etc.).

**Assertions**
- HTTP `201` or `200`.
- Response contains `id`, `entityType`, `identityId`, `score`, `snapshotReason`, `referenceId`, `createdAt`.
- Save `id` as `{{snapshotId}}`.

**Negative case**
- Invalid `snapshotReason` → `400`.

---

### C.2.2 List Snapshots by Entity

- **Method:** `GET`
- **URL:** `{{baseUrl}}/v1/trust-score-snapshots/identity/{{identityId}}`
- **Headers:** `x-api-key: {{apiKey}}`

**Assertions**
- HTTP `200`.
- Response is an array ordered by `createdAt` ascending (oldest first).
- Every item has `identityId === {{identityId}}`.

---

### C.2.3 Snapshot Immutability

1. Create a snapshot.
2. Attempt to `PATCH` or `DELETE` it.

**Assertions**
- No update endpoint exists → `404` for both `PATCH` and `DELETE`.
- Re-fetching the snapshot returns the exact same `score` and `snapshotReason`.

---

### C.2.4 Score History Reconstruction

1. Create three snapshots for the same identity:
   - `score: 50`, `snapshotReason: background_check`, `referenceId: check_1`
   - `score: 65`, `snapshotReason: certificate_issued`, `referenceId: cert_1`
   - `score: 45`, `snapshotReason: behavioral_flag`, `referenceId: beh_1`
2. List snapshots.

**Assertions**
- Array contains exactly 3 items.
- Items are ordered chronologically.
- The latest snapshot `score: 45` reflects the most recent state.
- Each snapshot's `referenceId` links back to the correct triggering event.

---

## C.3 Trust Certificates

### C.3.1 Issue Certificate for Identity

- **Method:** `POST`
- **URL:** `{{baseUrl}}/v1/trust-certificates`
- **Headers:**
  - `Content-Type: application/json`
  - `x-api-key: {{apiKey}}`
- **Body:**

```json
{
  "entityType": "identity",
  "identityId": "{{identityId}}",
  "issuingCheckId": "{{backgroundCheckId}}",
  "validDays": 90
}
```

**Assertions**
- HTTP `201` or `200`.
- Response contains `id`, `entityType`, `identityId`, `issuingCheckId`, `issuedAt`, `expiresAt`, `status: active`, `certificateHash`, `blockchainTxHash`.
- `expiresAt` is approximately `issuedAt + 90 days`.
- `certificateHash` is a non-empty string (fingerprint).
- `blockchainTxHash` starts with `0xMOCK_TX_` (or your real anchor prefix).
- Save `id` as `{{certificateId}}`.

**Negative case**
- Missing `issuingCheckId` → `400`.
- Invalid `entityType` → `400`.

---

### C.3.2 Issue Certificate for Organization

- **Method:** `POST`
- **URL:** `{{baseUrl}}/v1/trust-certificates`
- **Headers:**
  - `Content-Type: application/json`
  - `x-api-key: {{apiKey}}`
- **Body:**

```json
{
  "entityType": "organization",
  "orgId": "{{orgId}}",
  "issuingCheckId": "{{backgroundCheckId}}",
  "validDays": 30
}
```

**Assertions**
- HTTP `201` or `200`.
- Response `orgId` matches request.
- Response `status` is `active`.

---

### C.3.3 List Certificates by Entity

- **Method:** `GET`
- **URL:** `{{baseUrl}}/v1/trust-certificates?entityType=identity&entityId={{identityId}}`
- **Headers:** `x-api-key: {{apiKey}}`

**Assertions**
- HTTP `200`.
- Response is an array.
- Every item has `identityId === {{identityId}}` or `orgId === {{orgId}}` depending on query.

---

### C.3.4 Revoke Certificate

- **Method:** `PATCH`
- **URL:** `{{baseUrl}}/v1/trust-certificates/{{certificateId}}/revoke`
- **Headers:**
  - `Content-Type: application/json`
  - `x-api-key: {{apiKey}}`
- **Body:**

```json
{
  "reason": "fraudulent_identity"
}
```

**Assertions**
- HTTP `200`.
- Response `status` is `revoked`.
- Response `revocationReason` is `fraudulent_identity`.

**Side-effects to verify**
- An audit log exists with `action: certificate_revoked` and `targetId: {{certificateId}}`.

---

### C.3.5 Certificate Default Validity

Issue a certificate without providing `validDays`.

- **Method:** `POST`
- **URL:** `{{baseUrl}}/v1/trust-certificates`
- **Body:**

```json
{
  "entityType": "identity",
  "identityId": "{{identityId}}",
  "issuingCheckId": "{{backgroundCheckId}}"
}
```

**Assertions**
- `expiresAt` is approximately `issuedAt + 90 days` (the default).

---

## C.4 Certificate Verifications

### C.4.1 Verify Active Certificate

- **Method:** `POST`
- **URL:** `{{baseUrl}}/v1/certificate-verifications/{{certificateId}}`
- **Headers:**
  - `Content-Type: application/json`
  - `x-api-key: {{apiKey}}`
- **Body:**

```json
{
  "verifiedByPlatformId": "{{platformId}}"
}
```

**Assertions**
- HTTP `201` or `200`.
- Response contains `id`, `certificateId`, `verifiedByPlatformId`, `verdict: valid`, `verifiedAt`.
- Save `id` as `{{verificationId}}`.

---

### C.4.2 Verify Revoked Certificate

1. Revoke a certificate.
2. Attempt to verify it.

**Assertions**
- `verdict` is `revoked`.
- `verifiedAt` is set.

---

### C.4.3 Verify Expired Certificate

1. Issue a certificate with `validDays: 1`.
2. Wait 24 hours OR directly manipulate the database to set `expiresAt` in the past.
3. Verify the certificate.

**Assertions**
- `verdict` is `expired`.

**Note:** For automated tests, prefer repository-level seeding to time-travel rather than real waits.

---

### C.4.4 Verify Non-Existent Certificate

- **Method:** `POST`
- **URL:** `{{baseUrl}}/v1/certificate-verifications/00000000-0000-0000-0000-000000000000`
- **Body:**

```json
{
  "verifiedByPlatformId": "{{platformId}}"
}
```

**Assertions**
- `verdict` is `not_found`.

---

### C.4.5 List Verifications by Certificate

- **Method:** `GET`
- **URL:** `{{baseUrl}}/v1/certificate-verifications/{{certificateId}}`
- **Headers:** `x-api-key: {{apiKey}}`

**Assertions**
- HTTP `200`.
- Response is an array of all verification attempts against this certificate.
- Each item has `certificateId === {{certificateId}}`.

---

### C.4.6 Multi-Platform Verification Audit

1. Create two platforms: `platformA` and `platformB`.
2. Issue a certificate for an identity under `platformA`.
3. `platformA` verifies the certificate → `valid`.
4. `platformB` verifies the same certificate → `valid`.
5. List verifications.

**Assertions**
- The list contains exactly 2 rows.
- One row has `verifiedByPlatformId === platformA`.
- One row has `verifiedByPlatformId === platformB`.
- Both rows have `verdict: valid`.

---

## Postman Environment Variables Summary

| Variable | Example | Purpose |
|---|---|---|
| `baseUrl` | `http://localhost:3000` | API root |
| `platformId` | `uuid` | Platform ID |
| `apiKey` | `tl_test_...` | Valid platform API key |
| `identityId` | `uuid` | Identity under test |
| `orgId` | `uuid` | Organization under test |
| `trustSignalId` | `uuid` | Created trust signal ID |
| `snapshotId` | `uuid` | Created trust score snapshot ID |
| `certificateId` | `uuid` | Created trust certificate ID |
| `verificationRequestId` | `uuid` | Verification request ID |
| `backgroundCheckId` | `uuid` | Background check ID |
