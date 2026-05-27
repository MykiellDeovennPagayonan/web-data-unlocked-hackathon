# D. Curl Commands for Manual Testing

**Base URL:** `http://localhost:8090`

Replace placeholder values (e.g., `{{platformId}}`, `{{apiKey}}`, `{{identityId}}`) with actual UUIDs / strings returned by previous requests.

> **Tip:** Pipe responses through `jq` for readability: `curl ... | jq .`

---

## A.1 Platforms

### Create Platform

```bash
curl -X POST http://localhost:8090/admin/platforms \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Platform Alpha",
    "domain": "alpha.example.com",
    "status": "trial",
    "strictnessLevel": "medium"
  }'
```

### List Platforms

```bash
curl -X GET "http://localhost:8090/admin/platforms"
```

### List Platforms with Filters

```bash
curl -X GET "http://localhost:8090/admin/platforms?status=active&limit=10&offset=0"
```

### Get Platform by ID

```bash
curl -X GET "http://localhost:8090/admin/platforms/{{platformId}}"
```

### Update Platform Status

```bash
curl -X PATCH "http://localhost:8090/admin/platforms/{{platformId}}/status" \
  -H "Content-Type: application/json" \
  -d '{ "status": "active" }'
```

### Self-Service: Get Current Platform (auth required)

```bash
curl -X GET http://localhost:8090/v1/platform \
  -H "Content-Type: application/json" \
  -H "x-api-key: {{apiKey}}"
```

### Self-Service: Update Current Platform (auth required)

```bash
curl -X PATCH http://localhost:8090/v1/platform \
  -H "Content-Type: application/json" \
  -H "x-api-key: {{apiKey}}" \
  -d '{
    "name": "Updated Platform Name",
    "domain": "updated.example.com"
  }'
```

### Update Strictness Level (auth required)

```bash
curl -X PATCH http://localhost:8090/v1/platform/strictness \
  -H "Content-Type: application/json" \
  -H "x-api-key: {{apiKey}}" \
  -d '{ "strictnessLevel": "high" }'
```

### Auth Test: Missing API Key

```bash
curl -X GET http://localhost:8090/v1/platform \
  -H "Content-Type: application/json"
```

### Auth Test: Invalid API Key

```bash
curl -X GET http://localhost:8090/v1/platform \
  -H "Content-Type: application/json" \
  -H "x-api-key: invalid-key-123"
```

---

## A.2 API Keys

### List API Keys (auth required)

```bash
curl -X GET http://localhost:8090/v1/platform/api-keys \
  -H "Content-Type: application/json" \
  -H "x-api-key: {{apiKey}}"
```

### Create API Key (auth required)

```bash
curl -X POST http://localhost:8090/v1/platform/api-keys \
  -H "Content-Type: application/json" \
  -H "x-api-key: {{apiKey}}" \
  -d '{
    "name": "Production Key",
    "scopes": ["read", "write"],
    "expiresAt": "2026-12-31T23:59:59Z"
  }'
```

### Revoke API Key

```bash
curl -X DELETE "http://localhost:8090/v1/platform/api-keys/{{keyId}}" \
  -H "Content-Type: application/json"
```

### Rotate API Key (auth required)

```bash
curl -X POST "http://localhost:8090/v1/platform/api-keys/{{keyId}}/rotate" \
  -H "Content-Type: application/json" \
  -H "x-api-key: {{apiKey}}" \
  -d '{ "name": "Rotated Production Key" }'
```

---

## A.3 Platform Rules

### List Rules (auth required)

```bash
curl -X GET http://localhost:8090/v1/platform/rules \
  -H "Content-Type: application/json" \
  -H "x-api-key: {{apiKey}}"
```

### Create Rule (auth required)

```bash
curl -X POST http://localhost:8090/v1/platform/rules \
  -H "Content-Type: application/json" \
  -H "x-api-key: {{apiKey}}" \
  -d '{
    "ruleTrigger": "registration",
    "conditionJson": {
      "ipRiskScoreAbove": 70,
      "emailDomainAgeDaysBelow": 30
    },
    "action": "block"
  }'
```

### Update Rule

```bash
curl -X PATCH "http://localhost:8090/v1/platform/rules/{{ruleId}}" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "throttle",
    "conditionJson": { "ipRiskScoreAbove": 50 }
  }'
```

### Delete Rule

```bash
curl -X DELETE "http://localhost:8090/v1/platform/rules/{{ruleId}}" \
  -H "Content-Type: application/json"
```

### Toggle Rule

```bash
curl -X POST "http://localhost:8090/v1/platform/rules/{{ruleId}}/toggle" \
  -H "Content-Type: application/json" \
  -d '{ "isActive": false }'
```

### Apply Preset Rules (auth required)

```bash
curl -X POST http://localhost:8090/v1/platform/rules/apply-preset \
  -H "Content-Type: application/json" \
  -H "x-api-key: {{apiKey}}" \
  -d '{ "strictnessLevel": "high" }'
```

---

## A.4 Webhooks

### List Webhook Logs (auth required)

```bash
curl -X GET "http://localhost:8090/v1/platform/webhooks/logs?status=failed&limit=5&offset=0" \
  -H "Content-Type: application/json" \
  -H "x-api-key: {{apiKey}}"
```

### Get Webhook Log by ID

```bash
curl -X GET "http://localhost:8090/v1/platform/webhooks/logs/{{logId}}" \
  -H "Content-Type: application/json"
```

### Retry Webhook

```bash
curl -X POST "http://localhost:8090/v1/platform/webhooks/logs/{{logId}}/retry" \
  -H "Content-Type: application/json" \
  -d '{}'
```

---

## B.1 Identities

### Create Identity

```bash
curl -X POST http://localhost:8090/admin/identities \
  -H "Content-Type: application/json" \
  -d '{
    "emailHash": "aabbccdd11223344...",
    "encryptedEmail": "AES_ENCRYPTED_BLOB_1",
    "encryptedFullName": "AES_ENCRYPTED_BLOB_2",
    "trustStatus": "clean"
  }'
```

### Get Identity by ID

```bash
curl -X GET "http://localhost:8090/admin/identities/{{identityId}}" \
  -H "Content-Type: application/json"
```

### Get Identity by Email Hash

```bash
curl -X GET "http://localhost:8090/admin/identities/by-email/aabbccdd11223344..." \
  -H "Content-Type: application/json"
```

### Update Trust Status

```bash
curl -X PATCH "http://localhost:8090/admin/identities/{{identityId}}/status" \
  -H "Content-Type: application/json" \
  -d '{
    "trustStatus": "blocked",
    "isHumanVerified": true,
    "certificateId": "{{certificateId}}"
  }'
```

---

## B.2 Organizations

### Create Organization (admin)

```bash
curl -X POST http://localhost:8090/admin/organizations \
  -H "Content-Type: application/json" \
  -d '{
    "legalName": "Acme Corp",
    "domain": "acme.example.com",
    "registrationNumber": "REG-12345",
    "country": "US",
    "industry": "Technology",
    "trustStatus": "clean",
    "submittedByPlatformId": "{{platformId}}"
  }'
```

### Get Organization by ID

```bash
curl -X GET "http://localhost:8090/admin/organizations/{{orgId}}" \
  -H "Content-Type: application/json"
```

### Get Organization by Domain

```bash
curl -X GET "http://localhost:8090/admin/organizations/by-domain/acme.example.com" \
  -H "Content-Type: application/json"
```

### Update Organization Trust Status

```bash
curl -X PATCH "http://localhost:8090/admin/organizations/{{orgId}}/status" \
  -H "Content-Type: application/json" \
  -d '{ "trustStatus": "verified" }'
```

### Submit Organization (platform-scoped, auth required)

```bash
curl -X POST http://localhost:8090/v1/organizations \
  -H "Content-Type: application/json" \
  -H "x-api-key: {{apiKey}}" \
  -d '{
    "legalName": "Beta Solutions Ltd",
    "domain": "beta.example.com",
    "registrationNumber": "REG-67890",
    "country": "GB",
    "industry": "Finance",
    "trustStatus": "clean"
  }'
```

---

## B.3 Platform Users

### Create Platform User (auth required)

```bash
curl -X POST http://localhost:8090/v1/platform-users \
  -H "Content-Type: application/json" \
  -H "x-api-key: {{apiKey}}" \
  -d '{
    "identityId": "{{identityId}}",
    "platformId": "{{platformId}}",
    "externalUserId": "user_12345",
    "statusOnPlatform": "active"
  }'
```

### Get Platform User by External ID (auth required)

```bash
curl -X GET "http://localhost:8090/v1/platform-users/user_12345" \
  -H "Content-Type: application/json" \
  -H "x-api-key: {{apiKey}}"
```

### Update Platform User Status (auth required)

```bash
curl -X PATCH "http://localhost:8090/v1/platform-users/user_12345/status" \
  -H "Content-Type: application/json" \
  -H "x-api-key: {{apiKey}}" \
  -d '{ "statusOnPlatform": "blocked" }'
```

---

## B.4 Entity Aliases

### Create Alias

```bash
curl -X POST http://localhost:8090/admin/aliases \
  -H "Content-Type: application/json" \
  -d '{
    "canonicalEntityType": "identity",
    "canonicalEntityId": "{{identityId}}",
    "aliasType": "email",
    "aliasValueHash": "hash_of_alias_email@example.com",
    "aliasValueEncrypted": "AES_ENCRYPTED_ALIAS_VALUE",
    "confidence": 0.95,
    "source": "manual"
  }'
```

### List Aliases by Entity

```bash
curl -X GET "http://localhost:8090/admin/aliases/entity/identity/{{identityId}}" \
  -H "Content-Type: application/json"
```

### Resolve Canonical Entity

```bash
curl -X POST http://localhost:8090/admin/aliases/resolve \
  -H "Content-Type: application/json" \
  -d '{
    "aliasType": "email",
    "aliasValueHash": "hash_of_alias_email@example.com"
  }'
```

### Update Alias Confidence

```bash
curl -X PATCH "http://localhost:8090/admin/aliases/{{aliasId}}/confidence" \
  -H "Content-Type: application/json" \
  -d '{ "confidence": 0.72 }'
```

---

## C. Integration Scenarios (Chained Commands)

These rely on values from previous steps. Use a shell script or manually substitute outputs.

### Scenario 1: Full Onboarding

```bash
# 1. Create platform
PLATFORM=$(curl -s -X POST http://localhost:8090/admin/platforms \
  -H "Content-Type: application/json" \
  -d '{"name":"E-Shop Beta","domain":"eshop-beta.example.com","status":"trial","strictnessLevel":"medium"}')
PLATFORM_ID=$(echo $PLATFORM | jq -r '.id')
echo "Platform ID: $PLATFORM_ID"

# 2. Create API key for that platform (needs a bootstrap/admin key first)
KEY_RESPONSE=$(curl -s -X POST http://localhost:8090/v1/platform/api-keys \
  -H "Content-Type: application/json" \
  -H "x-api-key: {{adminApiKey}}" \
  -d '{"name":"E-Shop Beta Master Key","scopes":["read","write"]}')
RAW_KEY=$(echo $KEY_RESPONSE | jq -r '.rawKey')
echo "Raw API Key: $RAW_KEY"

# 3. Verify self-service read
curl -s http://localhost:8090/v1/platform \
  -H "Content-Type: application/json" \
  -H "x-api-key: $RAW_KEY" | jq .

# 4. Create identity
IDENTITY=$(curl -s -X POST http://localhost:8090/admin/identities \
  -H "Content-Type: application/json" \
  -d "{\"emailHash\":\"hash_${PLATFORM_ID}@example.com\",\"encryptedEmail\":\"ENC(email)\",\"encryptedFullName\":\"ENC(Name)\",\"trustStatus\":\"clean\"}")
IDENTITY_ID=$(echo $IDENTITY | jq -r '.id')
echo "Identity ID: $IDENTITY_ID"

# 5. Submit organization (platform-scoped)
curl -s -X POST http://localhost:8090/v1/organizations \
  -H "Content-Type: application/json" \
  -H "x-api-key: $RAW_KEY" \
  -d "{\"legalName\":\"E-Shop Beta Inc\",\"domain\":\"eshop-beta.example.com\",\"registrationNumber\":\"REG-99999\",\"country\":\"US\",\"industry\":\"E-commerce\",\"trustStatus\":\"clean\"}" | jq .

# 6. Create platform user
curl -s -X POST http://localhost:8090/v1/platform-users \
  -H "Content-Type: application/json" \
  -H "x-api-key: $RAW_KEY" \
  -d "{\"identityId\":\"$IDENTITY_ID\",\"platformId\":\"$PLATFORM_ID\",\"externalUserId\":\"ext_user_001\",\"statusOnPlatform\":\"active\"}" | jq .

# 7. Fetch platform user back
curl -s "http://localhost:8090/v1/platform-users/ext_user_001" \
  -H "Content-Type: application/json" \
  -H "x-api-key: $RAW_KEY" | jq .
```

### Scenario 2: Trust Status Propagation

```bash
# Create fresh identity
FRESH=$(curl -s -X POST http://localhost:8090/admin/identities \
  -H "Content-Type: application/json" \
  -d '{"emailHash":"fresh_hash","encryptedEmail":"ENC","encryptedFullName":"ENC","trustStatus":"clean"}')
FRESH_ID=$(echo $FRESH | jq -r '.id')

# Create platform user for it
curl -s -X POST http://localhost:8090/v1/platform-users \
  -H "Content-Type: application/json" \
  -H "x-api-key: {{apiKey}}" \
  -d "{\"identityId\":\"$FRESH_ID\",\"platformId\":\"{{platformId}}\",\"externalUserId\":\"fresh_user_001\",\"statusOnPlatform\":\"active\"}" | jq .

# Block the identity
curl -s -X PATCH "http://localhost:8090/admin/identities/$FRESH_ID/status" \
  -H "Content-Type: application/json" \
  -d '{"trustStatus":"blocked"}' | jq .

# Re-read the platform user
curl -s "http://localhost:8090/v1/platform-users/fresh_user_001" \
  -H "Content-Type: application/json" \
  -H "x-api-key: {{apiKey}}" | jq .
```

### Scenario 3: Key Rotation

```bash
# Create a short-lived key
KEY=$(curl -s -X POST http://localhost:8090/v1/platform/api-keys \
  -H "Content-Type: application/json" \
  -H "x-api-key: {{apiKey}}" \
  -d '{"name":"Short-Lived Key","scopes":["read"]}')
KEY_ID=$(echo $KEY | jq -r '.apiKey.id')
SHORT_KEY=$(echo $KEY | jq -r '.rawKey')
echo "Short key: $SHORT_KEY"

# Verify it works
curl -s http://localhost:8090/v1/platform/api-keys \
  -H "Content-Type: application/json" \
  -H "x-api-key: $SHORT_KEY" | jq .

# Rotate it
ROTATED=$(curl -s -X POST "http://localhost:8090/v1/platform/api-keys/$KEY_ID/rotate" \
  -H "Content-Type: application/json" \
  -H "x-api-key: {{apiKey}}" \
  -d '{"name":"Rotated Key"}')
NEW_KEY=$(echo $ROTATED | jq -r '.rawKey')
echo "New rotated key: $NEW_KEY"

# Old key should now fail
curl -s -w "%{http_code}" -o /dev/null http://localhost:8090/v1/platform/api-keys \
  -H "Content-Type: application/json" \
  -H "x-api-key: $SHORT_KEY"
echo " <- should be 401"

# New key should work
curl -s http://localhost:8090/v1/platform/api-keys \
  -H "Content-Type: application/json" \
  -H "x-api-key: $NEW_KEY" | jq .
```

### Scenario 4: Rule Preset + Strictness

```bash
# Set strictness to high
curl -s -X PATCH http://localhost:8090/v1/platform/strictness \
  -H "Content-Type: application/json" \
  -H "x-api-key: {{apiKey}}" \
  -d '{"strictnessLevel":"high"}' | jq .

# Apply preset
curl -s -X POST http://localhost:8090/v1/platform/rules/apply-preset \
  -H "Content-Type: application/json" \
  -H "x-api-key: {{apiKey}}" \
  -d '{"strictnessLevel":"high"}'

# Verify rules list
curl -s http://localhost:8090/v1/platform/rules \
  -H "Content-Type: application/json" \
  -H "x-api-key: {{apiKey}}" | jq .
```

### Scenario 5: Alias Recognition

```bash
# Create Alice's identity
ALICE=$(curl -s -X POST http://localhost:8090/admin/identities \
  -H "Content-Type: application/json" \
  -d '{"emailHash":"alice_hash","encryptedEmail":"ENC","encryptedFullName":"ENC Alice","trustStatus":"clean"}')
ALICE_ID=$(echo $ALICE | jq -r '.id')

# Create platform user
curl -s -X POST http://localhost:8090/v1/platform-users \
  -H "Content-Type: application/json" \
  -H "x-api-key: {{apiKey}}" \
  -d "{\"identityId\":\"$ALICE_ID\",\"platformId\":\"{{platformId}}\",\"externalUserId\":\"alice_001\",\"statusOnPlatform\":\"active\"}" | jq .

# Register new email alias for Alice
curl -s -X POST http://localhost:8090/admin/aliases \
  -H "Content-Type: application/json" \
  -d "{\"canonicalEntityType\":\"identity\",\"canonicalEntityId\":\"$ALICE_ID\",\"aliasType\":\"email\",\"aliasValueHash\":\"new_email_hash\",\"aliasValueEncrypted\":\"ENC\",\"confidence\":0.88,\"source\":\"behavioral\"}" | jq .

# Resolve the alias
curl -s -X POST http://localhost:8090/admin/aliases/resolve \
  -H "Content-Type: application/json" \
  -d '{"aliasType":"email","aliasValueHash":"new_email_hash"}' | jq .

# List all aliases for Alice
curl -s "http://localhost:8090/admin/aliases/entity/identity/$ALICE_ID" \
  -H "Content-Type: application/json" | jq .
```

### Scenario 6: Organization Lookup & Flagging

```bash
# Submit organization
curl -s -X POST http://localhost:8090/v1/organizations \
  -H "Content-Type: application/json" \
  -H "x-api-key: {{apiKey}}" \
  -d '{"legalName":"Partner Logistics","domain":"partner-logistics.example.com","registrationNumber":"REG-PL-2025","country":"PH","industry":"Logistics","trustStatus":"clean"}' | jq .

# Lookup by domain
curl -s "http://localhost:8090/admin/organizations/by-domain/partner-logistics.example.com" \
  -H "Content-Type: application/json" | jq .

# Admin flags it (need the orgId from previous response)
# curl -s -X PATCH "http://localhost:8090/admin/organizations/{{orgId}}/status" \
#   -H "Content-Type: application/json" \
#   -d '{"trustStatus":"flagged"}' | jq .

# Re-lookup to verify flagged status
curl -s "http://localhost:8090/admin/organizations/by-domain/partner-logistics.example.com" \
  -H "Content-Type: application/json" | jq .
```

---

## Placeholder Quick Reference

| Placeholder | Where it comes from |
|---|---|
| `{{platformId}}` | `POST /admin/platforms` → `.id` |
| `{{apiKey}}` | `POST /v1/platform/api-keys` → `.rawKey` |
| `{{keyId}}` | `POST /v1/platform/api-keys` → `.apiKey.id` |
| `{{identityId}}` | `POST /admin/identities` → `.id` |
| `{{orgId}}` | `POST /admin/organizations` or `POST /v1/organizations` → `.id` |
| `{{ruleId}}` | `POST /v1/platform/rules` → `.id` |
| `{{aliasId}}` | `POST /admin/aliases` → `.id` |
| `{{logId}}` | From webhook logs list or DB seed |
| `{{certificateId}}` | From trust certificates module (not yet implemented) |
