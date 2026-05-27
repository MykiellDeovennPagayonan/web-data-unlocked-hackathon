# C. Cross-Module Integration Scenarios

These end-to-end flows exercise both `platform-management` and `identity` modules together.

---

## Environment Variables Needed

| Variable | How to obtain |
|---|---|
| `baseUrl` | Your local / staging API root |
| `adminPlatformId` | From `POST /admin/platforms` |
| `adminApiKeyRaw` | From `POST /v1/platform/api-keys` using `adminPlatformId` |
| `identityId` | From `POST /admin/identities` |
| `orgId` | From `POST /admin/organizations` or `POST /v1/organizations` |
| `platformUserId` | From `POST /v1/platform-users` |
| `externalUserId` | Arbitrary string you choose, e.g. `ext_user_001` |

---

## Scenario 1: Full Onboarding Flow

**Goal:** Simulate a new client signing up, getting an API key, and then using that key to create entities in TrustLayer.

### Step 1 — Admin creates a platform

- **Method:** `POST`
- **URL:** `{{baseUrl}}/admin/platforms`
- **Body:**

```json
{
  "name": "E-Shop Beta",
  "domain": "eshop-beta.example.com",
  "status": "trial",
  "strictnessLevel": "medium"
}
```

- **Save:** `response.id` → `{{adminPlatformId}}`

### Step 2 — Admin creates an API key for that platform

- **Method:** `POST`
- **URL:** `{{baseUrl}}/v1/platform/api-keys`
- **Headers:** `x-api-key: <temporary admin key or bootstrap key>`
- **Body:**

```json
{
  "name": "E-Shop Beta Master Key",
  "scopes": ["platform:read", "platform:write", "identity:write"]
}
```

- **Save:** `response.rawKey` → `{{adminApiKeyRaw}}`

### Step 3 — Platform uses its key to read its own profile

- **Method:** `GET`
- **URL:** `{{baseUrl}}/v1/platform`
- **Headers:** `x-api-key: {{adminApiKeyRaw}}`

- **Assert:** `response.id === {{adminPlatformId}}`

### Step 4 — Admin creates an identity

- **Method:** `POST`
- **URL:** `{{baseUrl}}/admin/identities`
- **Body:**

```json
{
  "emailHash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  "encryptedEmail": "ENC(email@eshop-beta.example.com)",
  "encryptedFullName": "ENC(Jane Doe)",
  "trustStatus": "clean"
}
```

- **Save:** `response.id` → `{{identityId}}`

### Step 5 — Platform submits an organization

- **Method:** `POST`
- **URL:** `{{baseUrl}}/v1/organizations`
- **Headers:** `x-api-key: {{adminApiKeyRaw}}`
- **Body:**

```json
{
  "legalName": "E-Shop Beta Inc",
  "domain": "eshop-beta.example.com",
  "registrationNumber": "US-REG-99999",
  "country": "US",
  "industry": "E-commerce",
  "trustStatus": "clean"
}
```

- **Assert:** `response.submittedByPlatformId === {{adminPlatformId}}`
- **Save:** `response.id` → `{{orgId}}`

### Step 6 — Platform creates a platform user linking the identity

- **Method:** `POST`
- **URL:** `{{baseUrl}}/v1/platform-users`
- **Headers:** `x-api-key: {{adminApiKeyRaw}}`
- **Body:**

```json
{
  "identityId": "{{identityId}}",
  "platformId": "{{adminPlatformId}}",
  "externalUserId": "ext_user_001",
  "statusOnPlatform": "active"
}
```

- **Assert:** `response.platformId === {{adminPlatformId}}`
- **Assert:** `response.identityId === {{identityId}}`
- **Save:** `response.id` → `{{platformUserId}}`

### Step 7 — Platform fetches the user back by external ID

- **Method:** `GET`
- **URL:** `{{baseUrl}}/v1/platform-users/ext_user_001`
- **Headers:** `x-api-key: {{adminApiKeyRaw}}`

- **Assert:** `response.externalUserId === "ext_user_001"`

---

## Scenario 2: Trust Status Propagation Check

**Goal:** Verify how an identity's trust status affects downstream operations.

### Step 1 — Create a fresh identity

- **Method:** `POST`
- **URL:** `{{baseUrl}}/admin/identities`
- **Body:**

```json
{
  "emailHash": "hash_of_fresh_user@example.com",
  "encryptedEmail": "ENC(fresh_user@example.com)",
  "encryptedFullName": "ENC(Fresh User)",
  "trustStatus": "clean"
}
```

- **Save:** `response.id` → `{{freshIdentityId}}`

### Step 2 — Create a platform user for that identity

- **Method:** `POST`
- **URL:** `{{baseUrl}}/v1/platform-users`
- **Headers:** `x-api-key: {{adminApiKeyRaw}}`
- **Body:**

```json
{
  "identityId": "{{freshIdentityId}}",
  "platformId": "{{adminPlatformId}}",
  "externalUserId": "fresh_user_001",
  "statusOnPlatform": "active"
}
```

- **Assert:** `201` success.

### Step 3 — Admin blocks the identity

- **Method:** `PATCH`
- **URL:** `{{baseUrl}}/admin/identities/{{freshIdentityId}}/status`
- **Body:**

```json
{
  "trustStatus": "blocked"
}
```

- **Assert:** `response.trustStatus === "blocked"`

### Step 4 — Re-read the platform user

- **Method:** `GET`
- **URL:** `{{baseUrl}}/v1/platform-users/fresh_user_001`
- **Headers:** `x-api-key: {{adminApiKeyRaw}}`

- **Observation:** The user record still exists and is `active`.  
  *(If business logic later enforces automatic platform-user status sync, this test would need to assert that `statusOnPlatform` flipped to `blocked`.)*

---

## Scenario 3: API Key Lifecycle & Self-Service

**Goal:** Verify rotation invalidates old keys and new keys work immediately.

### Step 1 — Create a key

- **Method:** `POST`
- **URL:** `{{baseUrl}}/v1/platform/api-keys`
- **Headers:** `x-api-key: {{adminApiKeyRaw}}`
- **Body:**

```json
{
  "name": "Short-Lived Key",
  "scopes": ["read"]
}
```

- **Save:** `response.apiKey.id` → `{{rotatedKeyId}}`
- **Save:** `response.rawKey` → `{{shortLivedKey}}`

### Step 2 — Verify the new key works

- **Method:** `GET`
- **URL:** `{{baseUrl}}/v1/platform/api-keys`
- **Headers:** `x-api-key: {{shortLivedKey}}`

- **Assert:** `200` and list contains the key.

### Step 3 — Rotate the key

- **Method:** `POST`
- **URL:** `{{baseUrl}}/v1/platform/api-keys/{{rotatedKeyId}}/rotate`
- **Headers:** `x-api-key: {{adminApiKeyRaw}}`
- **Body:**

```json
{
  "name": "Rotated Short-Lived Key"
}
```

- **Save:** `response.rawKey` → `{{rotatedKeyRaw}}`

### Step 4 — Old key is dead

- **Method:** `GET`
- **URL:** `{{baseUrl}}/v1/platform/api-keys`
- **Headers:** `x-api-key: {{shortLivedKey}}`

- **Assert:** `401 Unauthorized`

### Step 5 — New rotated key works

- **Method:** `GET`
- **URL:** `{{baseUrl}}/v1/platform/api-keys`
- **Headers:** `x-api-key: {{rotatedKeyRaw}}`

- **Assert:** `200`

---

## Scenario 4: Rule Preset + Strictness Alignment

**Goal:** Ensure applying a strictness preset updates the platform's rule set consistently.

### Step 1 — Set platform strictness to `high`

- **Method:** `PATCH`
- **URL:** `{{baseUrl}}/v1/platform/strictness`
- **Headers:** `x-api-key: {{adminApiKeyRaw}}`
- **Body:**

```json
{
  "strictnessLevel": "high"
}
```

- **Assert:** `response.strictnessLevel === "high"`

### Step 2 — Apply the high-strictness preset rules

- **Method:** `POST`
- **URL:** `{{baseUrl}}/v1/platform/rules/apply-preset`
- **Headers:** `x-api-key: {{adminApiKeyRaw}}`
- **Body:**

```json
{
  "strictnessLevel": "high"
}
```

- **Assert:** `200` (or `204`)

### Step 3 — List rules and verify preset contents

- **Method:** `GET`
- **URL:** `{{baseUrl}}/v1/platform/rules`
- **Headers:** `x-api-key: {{adminApiKeyRaw}}`

- **Assert:** Response array contains the expected high-strictness default rules (e.g., registration blocks on VPN/Tor, payment requires reverification, etc.).

---

## Scenario 5: Entity Alias Recognition Flow

**Goal:** Simulate a user returning with a new email and device — alias resolution links them back.

### Step 1 — Create an identity

- **Method:** `POST`
- **URL:** `{{baseUrl}}/admin/identities`
- **Body:**

```json
{
  "emailHash": "hash_original@example.com",
  "encryptedEmail": "ENC(original@example.com)",
  "encryptedFullName": "ENC(Alice Smith)",
  "trustStatus": "clean"
}
```

- **Save:** `response.id` → `{{aliceIdentityId}}`

### Step 2 — Create a platform user for Alice

- **Method:** `POST`
- **URL:** `{{baseUrl}}/v1/platform-users`
- **Headers:** `x-api-key: {{adminApiKeyRaw}}`
- **Body:**

```json
{
  "identityId": "{{aliceIdentityId}}",
  "platformId": "{{adminPlatformId}}",
  "externalUserId": "alice_001",
  "statusOnPlatform": "active"
}
```

### Step 3 — Register an alias for Alice (new email)

- **Method:** `POST`
- **URL:** `{{baseUrl}}/admin/aliases`
- **Body:**

```json
{
  "canonicalEntityType": "identity",
  "canonicalEntityId": "{{aliceIdentityId}}",
  "aliasType": "email",
  "aliasValueHash": "hash_new_email@example.com",
  "aliasValueEncrypted": "ENC(new_email@example.com)",
  "confidence": 0.88,
  "source": "behavioral"
}
```

### Step 4 — Resolve the alias

- **Method:** `POST`
- **URL:** `{{baseUrl}}/admin/aliases/resolve`
- **Body:**

```json
{
  "aliasType": "email",
  "aliasValueHash": "hash_new_email@example.com"
}
```

- **Assert:** `response.canonicalEntityId === {{aliceIdentityId}}`

### Step 5 — Verify alias scoping

- **Method:** `GET`
- **URL:** `{{baseUrl}}/admin/aliases/entity/identity/{{aliceIdentityId}}`

- **Assert:** Array contains both the original and the new alias records (or at minimum the new alias).

---

## Scenario 6: Organization Lookup by Domain (Client-Side Check)

**Goal:** A platform wants to verify a partner organization before allowing integration.

### Step 1 — Submit an organization

- **Method:** `POST`
- **URL:** `{{baseUrl}}/v1/organizations`
- **Headers:** `x-api-key: {{adminApiKeyRaw}}`
- **Body:**

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

- **Save:** `response.id` → `{{partnerOrgId}}`

### Step 2 — Lookup by domain

- **Method:** `GET`
- **URL:** `{{baseUrl}}/admin/organizations/by-domain/partner-logistics.example.com`

- **Assert:** `response.id === {{partnerOrgId}}`
- **Assert:** `response.trustStatus === "clean"`

### Step 3 — Admin flags the organization

- **Method:** `PATCH`
- **URL:** `{{baseUrl}}/admin/organizations/{{partnerOrgId}}/status`
- **Body:**

```json
{
  "trustStatus": "flagged"
}
```

### Step 4 — Re-lookup

- **Method:** `GET`
- **URL:** `{{baseUrl}}/admin/organizations/by-domain/partner-logistics.example.com`

- **Assert:** `response.trustStatus === "flagged"`

---

## Quick-Start Postman Collection Skeleton

Create a collection named **"TrustLayer Integration"** with folders:

1. `01 - Platform Onboarding`
2. `02 - Identity & User Lifecycle`
3. `03 - Key Rotation`
4. `04 - Rules & Strictness`
5. `05 - Alias Resolution`
6. `06 - Organization Trust`

In each request, set:
- **Pre-request Script:** (optional) `pm.environment.set("timestamp", Date.now())`
- **Tests tab:** Write assertions using Postman’s `pm.test(...)` syntax, e.g.:

```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response has id", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property("id");
    pm.environment.set("identityId", jsonData.id);
});
```

---

## Notes for Future Expansion

- When `background_checks` and `trust_signals` modules are added, extend Scenario 2 to assert that a blocked identity triggers a negative `trust_signal`.
- When `access_events` and `sessions` are added, add a scenario that sends a mock access event and verifies the platform's strictness rules fired correctly.
- When `community_reports` and `registry_entries` are added, add a scenario where a platform reports a bad actor and the entity lands on the blacklist.
