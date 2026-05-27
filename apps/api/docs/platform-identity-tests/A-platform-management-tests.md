# A. Platform Management API Tests

Covers `platforms`, `api_keys`, `platform_rules`, and `webhooks`.

---

## A.1 Platforms

Base URL variable: `{{baseUrl}}`

### A.1.1 Create Platform

- **Method:** `POST`
- **URL:** `{{baseUrl}}/admin/platforms`
- **Headers:**
  - `Content-Type: application/json`
- **Body (raw JSON):**

```json
{
  "name": "Test Platform Alpha",
  "domain": "alpha.example.com",
  "status": "trial",
  "strictnessLevel": "medium"
}
```

**Assertions to test**
- HTTP `201` or `200` (depending on Nest global config).
- Response body contains `id` (UUID), `name`, `domain`, `status`, `strictnessLevel`, `createdAt`, `updatedAt`.
- Save `id` into a Postman variable `{{platformId}}` for downstream tests.

---

### A.1.2 List Platforms

- **Method:** `GET`
- **URL:** `{{baseUrl}}/admin/platforms`
- **Headers:** `Content-Type: application/json`

**Test cases**
1. Plain list returns all platforms.
2. Filter by status: `{{baseUrl}}/admin/platforms?status=active`
3. Pagination: `{{baseUrl}}/admin/platforms?limit=10&offset=0`

**Assertions**
- HTTP `200`.
- Response is an array.
- When `?status=active`, every item has `status === "active"`.
- `limit` and `offset` trim the result set correctly.

---

### A.1.3 Get Platform by ID

- **Method:** `GET`
- **URL:** `{{baseUrl}}/admin/platforms/{{platformId}}`
- **Headers:** `Content-Type: application/json`

**Assertions**
- HTTP `200`.
- Response `id` matches `{{platformId}}`.

**Negative case**
- Use random UUID in path → expect `404` (or `200` with `null` body if service returns that).

---

### A.1.4 Update Platform Status

- **Method:** `PATCH`
- **URL:** `{{baseUrl}}/admin/platforms/{{platformId}}/status`
- **Headers:** `Content-Type: application/json`
- **Body:**

```json
{
  "status": "active"
}
```

**Test sequence**
1. `trial` → `active`
2. `active` → `suspended`
3. `suspended` → `active`

**Assertions**
- HTTP `200`.
- Response `status` matches request value.

**Negative case**
- Invalid enum (`"status": "banned"`) → expect `400 Bad Request`.

---

### A.1.5 Self-Service: Get Current Platform

- **Method:** `GET`
- **URL:** `{{baseUrl}}/v1/platform`
- **Headers:**
  - `Content-Type: application/json`
  - `x-api-key: {{apiKey}}`

**Assertions**
- HTTP `200`.
- Response `id` matches the platform that owns `{{apiKey}}`.

---

### A.1.6 Self-Service: Update Current Platform

- **Method:** `PATCH`
- **URL:** `{{baseUrl}}/v1/platform`
- **Headers:**
  - `Content-Type: application/json`
  - `x-api-key: {{apiKey}}`
- **Body:**

```json
{
  "name": "Updated Platform Name",
  "domain": "updated.example.com"
}
```

**Assertions**
- HTTP `200`.
- Response reflects new `name` and `domain`.
- Other fields (`id`, `status`, `strictnessLevel`) remain unchanged.

---

### A.1.7 Update Strictness Level

- **Method:** `PATCH`
- **URL:** `{{baseUrl}}/v1/platform/strictness`
- **Headers:**
  - `Content-Type: application/json`
  - `x-api-key: {{apiKey}}`
- **Body:**

```json
{
  "strictnessLevel": "high"
}
```

**Test values**
- `low`, `medium`, `high`, `custom`

**Assertions**
- HTTP `200`.
- Response `strictnessLevel` equals request value.

**Negative case**
- `"strictnessLevel": "extreme"` → expect `400`.

---

### A.1.8 Auth: Missing or Invalid API Key

For any `v1/platform/*` endpoint:

1. **Missing key**
   - No `x-api-key` header → expect `401 Unauthorized`.
2. **Invalid key**
   - `x-api-key: invalid-key-123` → expect `401 Unauthorized`.
3. **Expired key**
   - Use a key with `expiresAt` in the past → expect `401`.
4. **Revoked key**
   - Use a key that was revoked → expect `401`.

---

## A.2 API Keys

Assume `{{apiKey}}` is a valid, active key belonging to `{{platformId}}`.

### A.2.1 List API Keys

- **Method:** `GET`
- **URL:** `{{baseUrl}}/v1/platform/api-keys`
- **Headers:**
  - `Content-Type: application/json`
  - `x-api-key: {{apiKey}}`

**Assertions**
- HTTP `200`.
- Response is an array.
- Every item has `id`, `name`, `scopes`, `createdAt`.
- `keyHash` is **not** exposed in the response (only `mapToResponse` fields).
- Revoked keys still appear with `revokedAt !== null`.

---

### A.2.2 Create API Key

- **Method:** `POST`
- **URL:** `{{baseUrl}}/v1/platform/api-keys`
- **Headers:**
  - `Content-Type: application/json`
  - `x-api-key: {{apiKey}}`
- **Body:**

```json
{
  "name": "Production Key",
  "scopes": ["read", "write"],
  "expiresAt": "2026-12-31T23:59:59Z"
}
```

**Assertions**
- HTTP `200` or `201`.
- Response has shape:

```json
{
  "apiKey": {
    "id": "uuid",
    "name": "Production Key",
    "scopes": ["read", "write"],
    "createdAt": "...",
    "expiresAt": "...",
    "revokedAt": null,
    "lastUsedAt": null
  },
  "rawKey": "tl_live_..."
}
```

- Save `rawKey` into `{{newApiKey}}` and `id` into `{{newKeyId}}`.

---

### A.2.3 Revoke API Key

- **Method:** `DELETE`
- **URL:** `{{baseUrl}}/v1/platform/api-keys/{{newKeyId}}`
- **Headers:** `Content-Type: application/json`

**Assertions**
- HTTP `200`.
- Response `revokedAt` is now a timestamp (not `null`).
- Subsequent request using `{{newApiKey}}` returns `401`.

---

### A.2.4 Rotate API Key

- **Method:** `POST`
- **URL:** `{{baseUrl}}/v1/platform/api-keys/{{newKeyId}}/rotate`
- **Headers:**
  - `Content-Type: application/json`
  - `x-api-key: {{apiKey}}`
- **Body:**

```json
{
  "name": "Rotated Production Key"
}
```

**Assertions**
- HTTP `200`.
- Old key is revoked (`revokedAt` set).
- New `rawKey` is returned and is different from the old one.
- New key belongs to the same platform.

---

### A.2.5 Cross-Tenancy Protection

1. Create a second platform (`platformB`) and give it an API key (`apiKeyB`).
2. Using `apiKeyB`, call `GET {{baseUrl}}/v1/platform/api-keys`.
3. Verify the list **does not** contain keys from `{{platformId}}`.

---

## A.3 Platform Rules

### A.3.1 List Rules

- **Method:** `GET`
- **URL:** `{{baseUrl}}/v1/platform/rules`
- **Headers:**
  - `Content-Type: application/json`
  - `x-api-key: {{apiKey}}`

**Assertions**
- HTTP `200`.
- Response is an array scoped to `{{platformId}}`.

---

### A.3.2 Create Rule

- **Method:** `POST`
- **URL:** `{{baseUrl}}/v1/platform/rules`
- **Headers:**
  - `Content-Type: application/json`
  - `x-api-key: {{apiKey}}`
- **Body:**

```json
{
  "ruleTrigger": "registration",
  "conditionJson": {
    "ipRiskScoreAbove": 70,
    "emailDomainAgeDaysBelow": 30
  },
  "action": "block"
}
```

**Test combinations**

| `ruleTrigger` | `action` |
|---|---|
| `registration` | `block` |
| `login` | `flag` |
| `payment` | `throttle` |
| `data_export` | `require_reverification` |
| `api_call` | `block` |

**Assertions**
- HTTP `200` or `201`.
- Response contains `id`, `platformId` (auto-set), `ruleTrigger`, `conditionJson`, `action`, `isActive: true`.
- Save `id` as `{{ruleId}}`.

---

### A.3.3 Update Rule

- **Method:** `PATCH`
- **URL:** `{{baseUrl}}/v1/platform/rules/{{ruleId}}`
- **Headers:** `Content-Type: application/json`
- **Body:**

```json
{
  "action": "throttle",
  "conditionJson": {
    "ipRiskScoreAbove": 50
  }
}
```

**Assertions**
- HTTP `200`.
- `action` and `conditionJson` updated; other fields unchanged.

---

### A.3.4 Delete Rule

- **Method:** `DELETE`
- **URL:** `{{baseUrl}}/v1/platform/rules/{{ruleId}}`
- **Headers:** `Content-Type: application/json`

**Assertions**
- HTTP `200`.
- Subsequent `GET` list no longer contains `{{ruleId}}`.

---

### A.3.5 Toggle Rule

- **Method:** `POST`
- **URL:** `{{baseUrl}}/v1/platform/rules/{{ruleId}}/toggle`
- **Headers:** `Content-Type: application/json`
- **Body:**

```json
{
  "isActive": false
}
```

**Assertions**
- HTTP `200`.
- Response `isActive` equals request value.

---

### A.3.6 Apply Preset Rules

- **Method:** `POST`
- **URL:** `{{baseUrl}}/v1/platform/rules/apply-preset`
- **Headers:**
  - `Content-Type: application/json`
  - `x-api-key: {{apiKey}}`
- **Body:**

```json
{
  "strictnessLevel": "high"
}
```

**Test values:** `low`, `medium`, `high`, `custom`

**Assertions**
- HTTP `200` (returns `void` — expect empty body or `204` if configured).
- List rules again and verify rules match the selected preset set.

---

### A.3.7 Rule Scoping

1. Create rules under `platformA` (`apiKeyA`).
2. Using `apiKeyB` (different platform), call `GET /v1/platform/rules`.
3. Assert that `platformB` list does **not** contain `platformA` rules.

---

## A.4 Webhooks

### A.4.1 List Webhook Logs

- **Method:** `GET`
- **URL:** `{{baseUrl}}/v1/platform/webhooks/logs`
- **Headers:**
  - `Content-Type: application/json`
  - `x-api-key: {{apiKey}}`

**Test queries**
- `?status=delivered`
- `?status=failed`
- `?limit=5&offset=0`

**Assertions**
- HTTP `200`.
- Response is an array of `WebhookLog`.
- `status=delivered` filters to items with non-null `deliveredAt`.
- `limit`/`offset` paginate correctly.

---

### A.4.2 Get Webhook Log by ID

- **Method:** `GET`
- **URL:** `{{baseUrl}}/v1/platform/webhooks/logs/{{webhookLogId}}`
- **Headers:** `Content-Type: application/json`

**Assertions**
- HTTP `200`.
- Response contains `id`, `eventType`, `payload`, `responseStatus`, `attemptNumber`, `deliveredAt`, `createdAt`.

---

### A.4.3 Retry Webhook

- **Method:** `POST`
- **URL:** `{{baseUrl}}/v1/platform/webhooks/logs/{{webhookLogId}}/retry`
- **Headers:** `Content-Type: application/json`
- **Body:**

```json
{}
```

**Assertions**
- HTTP `200`.
- Response `attemptNumber` is incremented (or delivery queued for retry).

---

## Postman Environment Variables Summary

| Variable | Example | Purpose |
|---|---|---|
| `baseUrl` | `http://localhost:3000` | API root |
| `platformId` | `uuid` | Created platform ID |
| `apiKey` | `tl_test_...` | Valid key for auth tests |
| `newKeyId` | `uuid` | Key created in create-test |
| `newApiKey` | `tl_test_...` | Raw key from create/rotate |
| `ruleId` | `uuid` | Created rule ID |
| `webhookLogId` | `uuid` | Existing webhook log ID |
