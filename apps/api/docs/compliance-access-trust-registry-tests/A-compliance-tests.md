# A. Compliance API Tests

Covers `audit_logs`, `consent_records`, and `verification_requests`.

---

## Environment Variables Needed

| Variable | How to obtain |
|---|---|
| `baseUrl` | Your local / staging API root |
| `apiKey` | `POST /v1/platform/api-keys` using a platform's ID |
| `platformId` | From `POST /admin/platforms` |
| `identityId` | From `POST /admin/identities` |
| `consentId` | From `POST /v1/compliance/consent` |
| `verificationRequestId` | From `POST /v1/compliance/verification-requests` |

---

## A.1 Audit Logs

### A.1.1 Create Audit Log

- **Method:** `POST`
- **URL:** `{{baseUrl}}/admin/compliance/audit-logs`
- **Headers:**
  - `Content-Type: application/json`
- **Body (raw JSON):**

```json
{
  "actorType": "system",
  "actorId": "system",
  "action": "manual_block",
  "targetType": "identity",
  "targetId": "{{identityId}}",
  "oldValue": { "trustStatus": "clean" },
  "newValue": { "trustStatus": "blocked" }
}
```

**Assertions**
- HTTP `201` or `200`.
- Response contains `id`, `actorType`, `actorId`, `action`, `targetType`, `targetId`, `oldValue`, `newValue`, `createdAt`.
- `createdAt` is a valid ISO timestamp.
- Save `id` as `{{auditLogId}}`.

**Negative case**
- Invalid `actorType` (e.g., `"unknown"`) → `400 Bad Request`.

---

### A.1.2 List Audit Logs with Filters

- **Method:** `GET`
- **URL:** `{{baseUrl}}/admin/compliance/audit-logs`
- **Headers:** `Content-Type: application/json`

**Test queries**
1. Plain list: no query params.
2. By actor: `?actorType=system&actorId=system`
3. By action: `?action=manual_block`
4. By target: `?targetType=identity&targetId={{identityId}}`
5. Date range: `?from=2026-01-01T00:00:00Z&to=2026-12-31T23:59:59Z`
6. Combined: `?actorType=system&action=manual_block&from=2026-01-01T00:00:00Z`

**Assertions**
- HTTP `200`.
- Response is an array.
- When `actorType=system`, every item has `actorType === "system"`.
- When `targetId` is provided, every item has `targetId` matching the filter.
- When date range is provided, every item's `createdAt` falls within the range.
- Results are ordered by `createdAt` descending (newest first).

---

### A.1.3 Audit Log Immutability

1. `POST /admin/compliance/audit-logs` with any payload.
2. Note the returned `id`.
3. Attempt to `PATCH` or `DELETE` the audit log.

**Assertions**
- `PATCH /admin/compliance/audit-logs/{{auditLogId}}` → `404` (no update endpoint exists).
- `DELETE /admin/compliance/audit-logs/{{auditLogId}}` → `404` (no delete endpoint exists).
- Re-fetching the log by ID returns the exact same `oldValue` and `newValue`.

---

## A.2 Consent Records

### A.2.1 Record Consent

- **Method:** `POST`
- **URL:** `{{baseUrl}}/v1/compliance/consent`
- **Headers:**
  - `Content-Type: application/json`
  - `x-api-key: {{apiKey}}`
- **Body:**

```json
{
  "identityId": "{{identityId}}",
  "platformId": "{{platformId}}",
  "consentType": "data_processing",
  "consentVersion": "v1.0.0",
  "ipAtConsent": "192.168.1.1"
}
```

**Field notes**
- `consentType`: `data_processing` | `background_check` | `cross_platform_sharing` | `marketing`
- `consentVersion`: arbitrary version string for policy tracking.
- `ipAtConsent`: the IP address from which consent was given.

**Assertions**
- HTTP `201` or `200`.
- Response contains `id`, `identityId`, `platformId`, `consentType`, `consentVersion`, `ipAtConsent`, `acceptedAt`, `revokedAt: null`, `createdAt`.
- Save `id` as `{{consentId}}`.

**Negative case**
- Missing `x-api-key` → `401`.
- Invalid `consentType` → `400`.

---

### A.2.2 Check Active Consent

- **Method:** `GET`
- **URL:** `{{baseUrl}}/v1/compliance/consent/check?identityId={{identityId}}&platformId={{platformId}}&consentType=data_processing`
- **Headers:** `x-api-key: {{apiKey}}`

**Assertions**
- HTTP `200`.
- Response is the previously created consent record.
- `revokedAt` is `null`.

**Negative case**
- Query for a consent that was never recorded → `200` with `null` body (or `404`).

---

### A.2.3 Revoke Consent

- **Method:** `PATCH`
- **URL:** `{{baseUrl}}/v1/compliance/consent/{{consentId}}/revoke`
- **Headers:** `x-api-key: {{apiKey}}`

**Assertions**
- HTTP `200`.
- Response `revokedAt` is now a timestamp (not `null`).

---

### A.2.4 Check Active Consent After Revocation

- **Method:** `GET`
- **URL:** `{{baseUrl}}/v1/compliance/consent/check?identityId={{identityId}}&platformId={{platformId}}&consentType=data_processing`
- **Headers:** `x-api-key: {{apiKey}}`

**Assertions**
- HTTP `200`.
- Response is `null` (revoked consent is no longer active).

---

### A.2.5 List Consent by Identity

- **Method:** `GET`
- **URL:** `{{baseUrl}}/v1/compliance/consent?identityId={{identityId}}&platformId={{platformId}}&consentType=data_processing`
- **Headers:** `x-api-key: {{apiKey}}`

**Assertions**
- HTTP `200`.
- Response is an array containing the revoked record.
- Every item has `identityId === {{identityId}}`.

---

### A.2.6 Cross-Platform Consent Isolation

1. Create `platformA` and `platformB`, each with their own API key.
2. Using `apiKeyA`, record consent for `identityId` under `platformA`.
3. Using `apiKeyB`, call `GET /v1/compliance/consent/check?identityId={{identityId}}&platformId={{platformAId}}&consentType=data_processing`.

**Assertions**
- HTTP `200`.
- Response is the active consent record from `platformA` (consent is tied to the `(identity, platform)` pair, not the API key caller).
- Alternatively, if the endpoint scopes by the caller's platform, assert `404` or `null`.

---

## A.3 Verification Requests

### A.3.1 Create Verification Request

- **Method:** `POST`
- **URL:** `{{baseUrl}}/v1/compliance/verification-requests`
- **Headers:**
  - `Content-Type: application/json`
  - `x-api-key: {{apiKey}}`
- **Body:**

```json
{
  "identityId": "{{identityId}}",
  "platformId": "{{platformId}}",
  "verificationType": "government_id",
  "provider": "jumio"
}
```

**Field notes**
- `verificationType`: `email` | `phone` | `government_id` | `liveness` | `business_docs`
- `provider`: e.g., `jumio`, `onfido`, `manual`

**Assertions**
- HTTP `201` or `200`.
- Response contains `id`, `identityId`, `platformId`, `verificationType`, `provider`, `status: pending`, `submittedAt: null`, `decidedAt: null`, `rejectionReason: null`, `createdAt`.
- Save `id` as `{{verificationRequestId}}`.

**Negative case**
- Missing `x-api-key` → `401`.
- Invalid `verificationType` → `400`.

---

### A.3.2 Submit Verification Request

- **Method:** `PATCH`
- **URL:** `{{baseUrl}}/v1/compliance/verification-requests/{{verificationRequestId}}/submit`
- **Headers:** `x-api-key: {{apiKey}}`

**Assertions**
- HTTP `200`.
- Response `status` is `submitted`.
- Response `submittedAt` is a timestamp.

**Negative case**
- Submit an already-submitted request → assert idempotent or error depending on implementation.

---

### A.3.3 List Verification Requests

- **Method:** `GET`
- **URL:** `{{baseUrl}}/v1/compliance/verification-requests`
- **Headers:** `x-api-key: {{apiKey}}`

**Test queries**
- `?identityId={{identityId}}`
- `?platformId={{platformId}}`
- `?status=pending`
- `?verificationType=government_id`
- Combined: `?identityId={{identityId}}&status=submitted`

**Assertions**
- HTTP `200`.
- Response is an array scoped to the filter.
- Every item matches the provided query parameters.

---

### A.3.4 Get Verification Request by ID

- **Method:** `GET`
- **URL:** `{{baseUrl}}/v1/compliance/verification-requests/{{verificationRequestId}}`
- **Headers:** `x-api-key: {{apiKey}}`

**Assertions**
- HTTP `200`.
- Response `id` matches `{{verificationRequestId}}`.

**Negative case**
- Random UUID → `404` (or `200` with `null`).

---

### A.3.5 Approve Verification Request

- **Method:** `POST`
- **URL:** `{{baseUrl}}/admin/compliance/verification-requests/{{verificationRequestId}}/approve`
- **Headers:** `Content-Type: application/json`

**Assertions**
- HTTP `200`.
- Response `status` is `approved`.
- Response `decidedAt` is a timestamp.

**Side-effects to verify**
1. **Trust Signal created**: Query `GET /v1/trust-signals?entityType=identity&identityId={{identityId}}&signalType=kyc_passed`. Assert a signal exists with `weight: 15`, `source: manual`, `referenceId` matching `{{verificationRequestId}}`.
2. **Trust Score Snapshot created**: Query `GET /v1/trust-score-snapshots/identity/{{identityId}}`. Assert the newest snapshot has `snapshotReason: certificate_issued` and a score of `65` (50 baseline + 15 KYC signal).
3. **Audit Log created**: Query `GET /admin/compliance/audit-logs?action=verification_approved&targetId={{verificationRequestId}}`. Assert exactly one log exists with `actorType: system`.

---

### A.3.6 Reject Verification Request

- **Method:** `POST`
- **URL:** `{{baseUrl}}/admin/compliance/verification-requests/{{verificationRequestId}}/reject`
- **Headers:** `Content-Type: application/json`
- **Body:**

```json
{
  "status": "rejected",
  "rejectionReason": "Document unclear"
}
```

**Assertions**
- HTTP `200`.
- Response `status` is `rejected`.
- Response `decidedAt` is a timestamp.
- Response `rejectionReason` matches request.

**Side-effects to verify**
1. **Audit Log**: Query `GET /admin/compliance/audit-logs?action=verification_rejected&targetId={{verificationRequestId}}`. Assert one log exists.
2. **No KYC trust signal**: Query `GET /v1/trust-signals?entityType=identity&identityId={{identityId}}&signalType=kyc_passed`. Assert no signal was created for this rejection.

---

### A.3.7 Verification Request Status Machine

Create a fresh verification request and walk through the full state machine:

1. `POST /v1/compliance/verification-requests` → `status: pending`
2. `PATCH .../submit` → `status: submitted`
3. `POST .../approve` → `status: approved`
4. Create another request → `pending` → `submitted` → `POST .../reject` → `status: rejected`

**Assertions**
- Each transition returns the expected status.
- `decidedAt` is only set on `approved` or `rejected`.
- `submittedAt` is only set on `submitted`, `approved`, or `rejected`.

---

## Postman Environment Variables Summary

| Variable | Example | Purpose |
|---|---|---|
| `baseUrl` | `http://localhost:3000` | API root |
| `platformId` | `uuid` | Platform ID |
| `apiKey` | `tl_test_...` | Valid platform API key |
| `identityId` | `uuid` | Identity under test |
| `consentId` | `uuid` | Created consent record ID |
| `verificationRequestId` | `uuid` | Created verification request ID |
| `auditLogId` | `uuid` | Created audit log ID |
