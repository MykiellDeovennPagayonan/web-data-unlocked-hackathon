# B. Background Check API Tests

Covers `background_checks` and `background_check_results`.

---

## Environment Variables Needed

| Variable | How to obtain |
|---|---|
| `baseUrl` | Your local / staging API root |
| `apiKey` | `POST /v1/platform/api-keys` using a platform's ID |
| `identityId` | `POST /admin/identities` |
| `orgId` | `POST /admin/organizations` or `POST /v1/organizations` |
| `checkId` | `POST /v1/background-checks` |
| `resultId` | `POST /v1/background-checks/:id/results` |

---

## B.1 Background Checks

### B.1.1 Create Background Check (Identity)

- **Method:** `POST`
- **URL:** `{{baseUrl}}/v1/background-checks`
- **Headers:**
  - `Content-Type: application/json`
  - `x-api-key: {{apiKey}}`
- **Body:**

```json
{
  "entityType": "identity",
  "identityId": "{{identityId}}",
  "triggeredBy": "registration"
}
```

**Field notes**
- `entityType`: `identity` | `organization`
- `triggeredBy`: `registration` | `manual` | `periodic_refresh` | `community_report`
- Exactly one of `identityId` or `orgId` must be provided.

**Assertions**
- HTTP `201` or `200`.
- Response contains `id`, `entityType`, `identityId`, `triggeredBy`.
- `overallVerdict` is `null`.
- `completedAt` is `null`.
- Save `id` as `{{checkId}}`.

**Audit check**
- `audit_logs` row exists with `action: 'background_check_created'`.

---

### B.1.2 Create Background Check (Organization)

- **Method:** `POST`
- **URL:** `{{baseUrl}}/v1/background-checks`
- **Headers:**
  - `Content-Type: application/json`
  - `x-api-key: {{apiKey}}`
- **Body:**

```json
{
  "entityType": "organization",
  "orgId": "{{orgId}}",
  "triggeredBy": "manual"
}
```

**Assertions**
- HTTP `201` or `200`.
- `orgId` matches request.
- `identityId` is absent or `null`.

---

### B.1.3 Negative: Missing Entity ID

- **Method:** `POST`
- **URL:** `{{baseUrl}}/v1/background-checks`
- **Headers:**
  - `Content-Type: application/json`
  - `x-api-key: {{apiKey}}`
- **Body:**

```json
{
  "entityType": "identity",
  "triggeredBy": "registration"
}
```

**Assertions**
- Expect `400 Bad Request` or `500` depending on service-level validation.
*(If your service does not enforce this yet, document that it currently creates a dangling check.)*

---

### B.1.4 Get Background Check by ID

- **Method:** `GET`
- **URL:** `{{baseUrl}}/v1/background-checks/{{checkId}}`
- **Headers:**
  - `Content-Type: application/json`
  - `x-api-key: {{apiKey}}`

**Assertions**
- HTTP `200`.
- `id` matches `{{checkId}}`.

**Negative case**
- Random UUID → `404` (or `200` with `null`).

---

### B.1.5 Complete Background Check — Clean

- **Method:** `POST`
- **URL:** `{{baseUrl}}/v1/background-checks/{{checkId}}/complete`
- **Headers:**
  - `Content-Type: application/json`
  - `x-api-key: {{apiKey}}`
- **Body:**

```json
{
  "overallVerdict": "clean"
}
```

**Assertions**
- HTTP `200`.
- `overallVerdict` is `"clean"`.
- `completedAt` is a timestamp (not `null`).

**Trust engine side-effect**
- `GET /v1/trust-signals?identityId={{identityId}}` → exactly one new signal.
  - `signalType`: `clean_history`
  - `weight`: `10`
  - `source`: `background_check`
  - `referenceId`: `{{checkId}}`
- `GET /v1/trust-score/identity/{{identityId}}` → score is `60` (baseline 50 + 10).

**Audit check**
- `audit_logs` row exists with `action: 'background_check_completed'` and old/new value snapshot.

---

### B.1.6 Complete Background Check — Blocked

1. Create a fresh background check (`checkIdBlocked`).
2. Complete it with:

```json
{
  "overallVerdict": "blocked"
}
```

**Assertions**
- HTTP `200`.
- `overallVerdict` is `"blocked"`.

**Trust engine side-effect**
- `GET /v1/trust-signals?identityId={{identityId}}` → signal exists.
  - `signalType`: `behavioral_flag`
  - `weight`: `-15`
- `GET /v1/trust-score/identity/{{identityId}}` → score is `35` (50 - 15, clamped).

---

### B.1.7 Complete Background Check — Flagged

1. Create a fresh background check (`checkIdFlagged`).
2. Complete it with:

```json
{
  "overallVerdict": "flagged"
}
```

**Assertions**
- HTTP `200`.
- `overallVerdict` is `"flagged"`.

**Trust engine side-effect**
- Signal `weight` is `-5`.
- Trust score is `45`.

---

### B.1.8 Negative: Complete Non-Existent Check

- **Method:** `POST`
- **URL:** `{{baseUrl}}/v1/background-checks/00000000-0000-0000-0000-000000000000/complete`
- **Headers:**
  - `Content-Type: application/json`
  - `x-api-key: {{apiKey}}`
- **Body:**

```json
{
  "overallVerdict": "clean"
}
```

**Assertions**
- HTTP `404` or `500` with message containing "not found".

---

## B.2 Background Check Results

### B.2.1 Add Check Result

- **Method:** `POST`
- **URL:** `{{baseUrl}}/v1/background-checks/{{checkId}}/results`
- **Headers:**
  - `Content-Type: application/json`
  - `x-api-key: {{apiKey}}`
- **Body:**

```json
{
  "source": "ofac",
  "rawResult": {
    "query": "John Doe",
    "matches": []
  },
  "normalizedVerdict": "clear",
  "confidenceScore": 0.95,
  "llmSummary": "No OFAC matches found for 'John Doe'."
}
```

**Field notes**
- `source` enum: `linkedin`, `crunchbase`, `ofac`, `opensanctions`, `news`, `serp`, `social_media`, `glassdoor`, `business_registry`
- `normalizedVerdict` enum: `clear`, `soft_flag`, `hard_flag`, `not_found`

**Assertions**
- HTTP `201` or `200`.
- Response contains `id`, `checkId`, `source`, `rawResult`, `normalizedVerdict`, `confidenceScore`, `llmSummary`, `checkedAt`.
- Save `id` as `{{resultId}}`.

---

### B.2.2 Add Multiple Results to Same Check

Repeat `B.2.1` with different sources:

| `source` | `normalizedVerdict` | `confidenceScore` |
|---|---|---|
| `linkedin` | `clear` | `0.80` |
| `opensanctions` | `clear` | `0.90` |
| `serp` | `clear` | `0.85` |
| `news` | `soft_flag` | `0.70` |

**Assertions after each**
- HTTP `201` or `200`.

---

### B.2.3 List Results by Check

- **Method:** `GET`
- **URL:** `{{baseUrl}}/v1/background-checks/{{checkId}}/results`
- **Headers:**
  - `Content-Type: application/json`
  - `x-api-key: {{apiKey}}`

**Assertions**
- HTTP `200`.
- Response is an array.
- Array length equals the number of results added.
- Every item has `checkId === {{checkId}}`.

---

### B.2.4 Result with Hard Flag

- **Method:** `POST`
- **URL:** `{{baseUrl}}/v1/background-checks/{{checkId}}/results`
- **Headers:**
  - `Content-Type: application/json`
  - `x-api-key: {{apiKey}}`
- **Body:**

```json
{
  "source": "ofac",
  "rawResult": {
    "query": "Bad Actor",
    "matches": [
      { "list": "OFAC-SDN", "entry": "..." }
    ]
  },
  "normalizedVerdict": "hard_flag",
  "confidenceScore": 0.99,
  "llmSummary": "Exact match on OFAC Specially Designated Nationals list."
}
```

**Assertions**
- HTTP `201` or `200`.
- `normalizedVerdict` is `"hard_flag"`.
- *(Later orchestrator logic should aggregate this to an overall `blocked` verdict.)*

---

## B.3 Admin Listings

### B.3.1 List Background Checks (Admin)

- **Method:** `GET`
- **URL:** `{{baseUrl}}/admin/background-checks`
- **Headers:** `Content-Type: application/json`

**Test queries**
- Plain: `{{baseUrl}}/admin/background-checks`
- Filter by entity: `?entityType=identity&identityId={{identityId}}`
- Filter by verdict: `?overallVerdict=clean`
- Filter by trigger: `?triggeredBy=registration`

**Assertions**
- HTTP `200`.
- Response is an array.
- Filters trim the result set correctly.

---

## Postman Environment Variables Summary

| Variable | Example | Purpose |
|---|---|---|
| `baseUrl` | `http://localhost:3000` | API root |
| `apiKey` | `tl_test_...` | Valid platform API key |
| `identityId` | `uuid` | Identity under check |
| `orgId` | `uuid` | Organization under check |
| `checkId` | `uuid` | Created background check ID |
| `checkIdBlocked` | `uuid` | Check completed as blocked |
| `checkIdFlagged` | `uuid` | Check completed as flagged |
| `resultId` | `uuid` | Created result ID |
