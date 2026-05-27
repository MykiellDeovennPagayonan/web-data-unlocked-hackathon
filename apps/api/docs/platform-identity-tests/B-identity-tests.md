# B. Identity API Tests

Covers `identities`, `organizations`, `platform_users`, and `entity_aliases`.

---

## B.1 Identities

Base URL variable: `{{baseUrl}}`

### B.1.1 Create Identity

- **Method:** `POST`
- **URL:** `{{baseUrl}}/admin/identities`
- **Headers:**
  - `Content-Type: application/json`
- **Body:**

```json
{
  "emailHash": "aabbccdd1122...",
  "encryptedEmail": "AES_ENCRYPTED_BLOB_1",
  "encryptedFullName": "AES_ENCRYPTED_BLOB_2",
  "trustStatus": "clean"
}
```

**Field notes**
- `emailHash` — SHA-256 of the normalized email, used for cross-platform lookup.
- `encryptedEmail` / `encryptedFullName` — AES-encrypted values (KMS-managed keys).
- `trustStatus` is optional; defaults to `clean` in Prisma (`@default` not set in schema but service may apply it). Allowed values: `clean`, `flagged`, `limited`, `blocked`, `verified`.

**Assertions**
- HTTP `201` or `200`.
- Response contains `id` (UUID), `emailHash`, `encryptedEmail`, `encryptedFullName`, `trustStatus`, `isHumanVerified: false`, `createdAt`, `updatedAt`.
- Save `id` as `{{identityId}}`.

---

### B.1.2 Get Identity by ID

- **Method:** `GET`
- **URL:** `{{baseUrl}}/admin/identities/{{identityId}}`
- **Headers:** `Content-Type: application/json`

**Assertions**
- HTTP `200`.
- Response `id` matches `{{identityId}}`.

**Negative case**
- Random UUID → expect `404` (or `200` with `null`).

---

### B.1.3 Get Identity by Email Hash

- **Method:** `GET`
- **URL:** `{{baseUrl}}/admin/identities/by-email/{{emailHash}}`
- **Headers:** `Content-Type: application/json`

**Assertions**
- HTTP `200`.
- Response `emailHash` matches the path parameter.

**Negative case**
- Non-existent hash → expect `404` (or `null`).

---

### B.1.4 Update Trust Status

- **Method:** `PATCH`
- **URL:** `{{baseUrl}}/admin/identities/{{identityId}}/status`
- **Headers:** `Content-Type: application/json`
- **Body:**

```json
{
  "trustStatus": "blocked",
  "isHumanVerified": true,
  "certificateId": "{{certificateId}}"
}
```

**Test sequence**
1. `clean` → `flagged`
2. `flagged` → `blocked`
3. `blocked` → `verified`
4. `verified` → `clean`

**Assertions**
- HTTP `200`.
- Response `trustStatus` matches request.
- `isHumanVerified` flips to `true` when provided.
- `updatedAt` is later than `createdAt`.

**Negative case**
- `"trustStatus": "unknown"` → expect `400`.

---

## B.2 Organizations

### B.2.1 Create Organization (Admin)

- **Method:** `POST`
- **URL:** `{{baseUrl}}/admin/organizations`
- **Headers:**
  - `Content-Type: application/json`
- **Body:**

```json
{
  "legalName": "Acme Corp",
  "domain": "acme.example.com",
  "registrationNumber": "REG-12345",
  "country": "US",
  "industry": "Technology",
  "trustStatus": "clean",
  "submittedByPlatformId": "{{platformId}}"
}
```

**Assertions**
- HTTP `201` or `200`.
- Response contains `id`, `legalName`, `domain`, `registrationNumber`, `country`, `industry`, `trustStatus`, `submittedByPlatformId`, `createdAt`, `updatedAt`.
- Save `id` as `{{orgId}}`.

---

### B.2.2 Get Organization by ID

- **Method:** `GET`
- **URL:** `{{baseUrl}}/admin/organizations/{{orgId}}`
- **Headers:** `Content-Type: application/json`

**Assertions**
- HTTP `200`.
- Response `id` matches `{{orgId}}`.
- `submittedByPlatformId` equals the submitting platform.

---

### B.2.3 Get Organization by Domain

- **Method:** `GET`
- **URL:** `{{baseUrl}}/admin/organizations/by-domain/acme.example.com`
- **Headers:** `Content-Type: application/json`

**Assertions**
- HTTP `200`.
- Response `domain` matches path parameter.

**Negative case**
- Unknown domain → expect `404` (or `null`).

---

### B.2.4 Update Organization Trust Status

- **Method:** `PATCH`
- **URL:** `{{baseUrl}}/admin/organizations/{{orgId}}/status`
- **Headers:** `Content-Type: application/json`
- **Body:**

```json
{
  "trustStatus": "verified"
}
```

**Test values:** `clean`, `flagged`, `limited`, `blocked`, `verified`

**Assertions**
- HTTP `200`.
- Response `trustStatus` equals request value.

---

### B.2.5 Submit Organization (Platform-Scoped)

- **Method:** `POST`
- **URL:** `{{baseUrl}}/v1/organizations`
- **Headers:**
  - `Content-Type: application/json`
  - `x-api-key: {{apiKey}}`
- **Body:**

```json
{
  "legalName": "Beta Solutions Ltd",
  "domain": "beta.example.com",
  "registrationNumber": "REG-67890",
  "country": "GB",
  "industry": "Finance",
  "trustStatus": "clean"
}
```

**Note:** `submittedByPlatformId` is injected from the API key's platform context.

**Assertions**
- HTTP `201` or `200`.
- Response `submittedByPlatformId` matches the platform that owns `{{apiKey}}`.

**Negative case**
- Missing `x-api-key` → `401`.

---

## B.3 Platform Users

### B.3.1 Create Platform User

- **Method:** `POST`
- **URL:** `{{baseUrl}}/v1/platform-users`
- **Headers:**
  - `Content-Type: application/json`
  - `x-api-key: {{apiKey}}`
- **Body:**

```json
{
  "identityId": "{{identityId}}",
  "platformId": "{{platformId}}",
  "externalUserId": "user_12345",
  "statusOnPlatform": "active"
}
```

**Assertions**
- HTTP `201` or `200`.
- Response contains `id`, `identityId`, `platformId`, `externalUserId`, `statusOnPlatform`, `joinedAt`, `updatedAt`.
- Save `id` as `{{platformUserId}}`.

**Negative case**
- Duplicate `(platformId, externalUserId)` → expect DB uniqueness error (returns `409` or `500` depending on global exception filter).

---

### B.3.2 Get Platform User by External ID

- **Method:** `GET`
- **URL:** `{{baseUrl}}/v1/platform-users/{{externalUserId}}`
- **Headers:**
  - `Content-Type: application/json`
  - `x-api-key: {{apiKey}}`

**Assertions**
- HTTP `200`.
- Response `externalUserId` matches path parameter.
- Response `platformId` matches the authenticated platform.

**Negative case**
- Unknown `externalUserId` → `404` with message `Platform user 'user_99999' not found`.

---

### B.3.3 Update Platform User Status

- **Method:** `PATCH`
- **URL:** `{{baseUrl}}/v1/platform-users/{{externalUserId}}/status`
- **Headers:**
  - `Content-Type: application/json`
  - `x-api-key: {{apiKey}}`
- **Body:**

```json
{
  "statusOnPlatform": "blocked"
}
```

**Test values:** `active`, `flagged`, `blocked`

**Assertions**
- HTTP `200`.
- Response `statusOnPlatform` equals request value.
- `updatedAt` is newer than `joinedAt`.

---

### B.3.4 Cross-Tenancy Isolation

1. Create `user_12345` under `platformA` (`apiKeyA`).
2. Using `apiKeyB` (different platform), call `GET /v1/platform-users/user_12345`.
3. Assert `404` — Platform B must not see Platform A's users even if the `externalUserId` is known.

---

## B.4 Entity Aliases

### B.4.1 Create Alias

- **Method:** `POST`
- **URL:** `{{baseUrl}}/admin/aliases`
- **Headers:**
  - `Content-Type: application/json`
- **Body:**

```json
{
  "canonicalEntityType": "identity",
  "canonicalEntityId": "{{identityId}}",
  "aliasType": "email",
  "aliasValueHash": "hash_of_alias_email@example.com",
  "aliasValueEncrypted": "AES_ENCRYPTED_ALIAS_VALUE",
  "confidence": 0.95,
  "source": "manual"
}
```

**Field notes**
- `canonicalEntityType`: `identity` | `organization`
- `aliasType`: `email` | `ip` | `device` | `phone` | `username`
- `source`: `behavioral` | `background_check` | `manual` | `ml_inference`
- `confidence`: decimal `0.0` – `1.0`

**Assertions**
- HTTP `201` or `200`.
- Response contains `id`, `canonicalEntityType`, `canonicalEntityId`, `aliasType`, `aliasValueHash`, `confidence`, `source`, `createdAt`.
- Save `id` as `{{aliasId}}`.

---

### B.4.2 List Aliases by Entity

- **Method:** `GET`
- **URL:** `{{baseUrl}}/admin/aliases/entity/identity/{{identityId}}`
- **Headers:** `Content-Type: application/json`

**Assertions**
- HTTP `200`.
- Response is an array.
- Every item has `canonicalEntityId === {{identityId}}`.

---

### B.4.3 Resolve Canonical Entity

- **Method:** `POST`
- **URL:** `{{baseUrl}}/admin/aliases/resolve`
- **Headers:** `Content-Type: application/json`
- **Body:**

```json
{
  "aliasType": "email",
  "aliasValueHash": "hash_of_alias_email@example.com"
}
```

**Assertions**
- HTTP `200`.
- Response contains the alias row linking back to `{{identityId}}`.

**Negative case**
- Unknown hash → expect `200` with `null` body (or `404`).

---

### B.4.4 Update Alias Confidence

- **Method:** `PATCH`
- **URL:** `{{baseUrl}}/admin/aliases/{{aliasId}}/confidence`
- **Headers:** `Content-Type: application/json`
- **Body:**

```json
{
  "confidence": 0.72
}
```

**Assertions**
- HTTP `200`.
- Response `confidence` equals `0.72`.

---

### B.4.5 Duplicate Handling

1. Create an alias with the exact same `(canonicalEntityType, canonicalEntityId, aliasType, aliasValueHash)`.
2. Assert that the second call either:
   - Returns the existing alias (idempotent upsert), or
   - Returns a uniqueness error (`409` / `500`).

---

## Postman Environment Variables Summary

| Variable | Example | Purpose |
|---|---|---|
| `baseUrl` | `http://localhost:3000` | API root |
| `identityId` | `uuid` | Created identity ID |
| `orgId` | `uuid` | Created organization ID |
| `platformId` | `uuid` | Platform ID |
| `apiKey` | `tl_test_...` | Valid platform API key |
| `externalUserId` | `user_12345` | Client platform's user ID |
| `platformUserId` | `uuid` | Created platform user ID |
| `aliasId` | `uuid` | Created alias ID |
| `certificateId` | `uuid` | Optional cert for identity status update |
