# D. Curl Commands for Manual Testing

**Base URL:** `http://localhost:8090`

Replace placeholder values (e.g., `{{apiKey}}`, `{{deviceId}}`, `{{checkId}}`) with actual UUIDs / strings returned by previous requests.

> **Tip:** Pipe responses through `jq` for readability: `curl ... | jq .`

---

## A. Devices

### Resolve Device (New)

```bash
curl -X POST http://localhost:8090/v1/intelligence/device \
  -H "Content-Type: application/json" \
  -H "x-api-key: {{apiKey}}" \
  -d '{
    "signals": [
      { "signalType": "user_agent", "value": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)" },
      { "signalType": "os", "value": "macOS" },
      { "signalType": "browser", "value": "Chrome" },
      { "signalType": "screen_resolution", "value": "2560x1440" },
      { "signalType": "timezone", "value": "Asia/Manila" },
      { "signalType": "language", "value": "en-US" },
      { "signalType": "canvas_hash", "value": "abc123canvas" },
      { "signalType": "webgl_hash", "value": "def456webgl" }
    ]
  }'
```

### Resolve Device (Drifted Signals)

```bash
curl -X POST http://localhost:8090/v1/intelligence/device \
  -H "Content-Type: application/json" \
  -H "x-api-key: {{apiKey}}" \
  -d '{
    "signals": [
      { "signalType": "user_agent", "value": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36" },
      { "signalType": "os", "value": "macOS" },
      { "signalType": "browser", "value": "Chrome" },
      { "signalType": "screen_resolution", "value": "2560x1440" },
      { "signalType": "timezone", "value": "Asia/Manila" },
      { "signalType": "language", "value": "en-US" },
      { "signalType": "canvas_hash", "value": "abc123canvas" },
      { "signalType": "webgl_hash", "value": "def456webgl" }
    ]
  }'
```

### Get Device by ID (Admin)

```bash
curl -X GET "http://localhost:8090/admin/devices/{{deviceId}}" \
  -H "Content-Type: application/json"
```

### Update Device Risk Score

```bash
curl -X PATCH "http://localhost:8090/admin/devices/{{deviceId}}/risk" \
  -H "Content-Type: application/json" \
  -d '{ "riskScore": 75 }'
```

### Flag Device

```bash
curl -X PATCH "http://localhost:8090/admin/devices/{{deviceId}}/flag" \
  -H "Content-Type: application/json" \
  -d '{ "isFlagged": true }'
```

---

## B. IP Records

### Lookup IP (New)

```bash
curl -X POST http://localhost:8090/v1/intelligence/ip \
  -H "Content-Type: application/json" \
  -H "x-api-key: {{apiKey}}" \
  -d '{ "ipAddress": "1.1.1.1" }'
```

### Lookup IPv6

```bash
curl -X POST http://localhost:8090/v1/intelligence/ip \
  -H "Content-Type: application/json" \
  -H "x-api-key: {{apiKey}}" \
  -d '{ "ipAddress": "2001:4860:4860::8888" }'
```

### Lookup Invalid IP

```bash
curl -X POST http://localhost:8090/v1/intelligence/ip \
  -H "Content-Type: application/json" \
  -H "x-api-key: {{apiKey}}" \
  -d '{ "ipAddress": "not-an-ip" }'
```

### Get IP Record by IP (Admin)

```bash
curl -X GET "http://localhost:8090/admin/ip/1.1.1.1" \
  -H "Content-Type: application/json"
```

---

## C. Background Checks

### Create Background Check (Identity)

```bash
curl -X POST http://localhost:8090/v1/background-checks \
  -H "Content-Type: application/json" \
  -H "x-api-key: {{apiKey}}" \
  -d '{
    "entityType": "identity",
    "identityId": "{{identityId}}",
    "triggeredBy": "registration"
  }'
```

### Create Background Check (Organization)

```bash
curl -X POST http://localhost:8090/v1/background-checks \
  -H "Content-Type: application/json" \
  -H "x-api-key: {{apiKey}}" \
  -d '{
    "entityType": "organization",
    "orgId": "{{orgId}}",
    "triggeredBy": "manual"
  }'
```

### Get Background Check by ID

```bash
curl -X GET "http://localhost:8090/v1/background-checks/{{checkId}}" \
  -H "Content-Type: application/json" \
  -H "x-api-key: {{apiKey}}"
```

### Complete Background Check (Clean)

```bash
curl -X POST "http://localhost:8090/v1/background-checks/{{checkId}}/complete" \
  -H "Content-Type: application/json" \
  -H "x-api-key: {{apiKey}}" \
  -d '{ "overallVerdict": "clean" }'
```

### Complete Background Check (Blocked)

```bash
curl -X POST "http://localhost:8090/v1/background-checks/{{checkId}}/complete" \
  -H "Content-Type: application/json" \
  -H "x-api-key: {{apiKey}}" \
  -d '{ "overallVerdict": "blocked" }'
```

### List Background Checks (Admin)

```bash
curl -X GET "http://localhost:8090/admin/background-checks?entityType=identity&identityId={{identityId}}" \
  -H "Content-Type: application/json"
```

---

## D. Background Check Results

### Add Check Result

```bash
curl -X POST "http://localhost:8090/v1/background-checks/{{checkId}}/results" \
  -H "Content-Type: application/json" \
  -H "x-api-key: {{apiKey}}" \
  -d '{
    "source": "ofac",
    "rawResult": { "query": "John Doe", "matches": [] },
    "normalizedVerdict": "clear",
    "confidenceScore": 0.95,
    "llmSummary": "No OFAC matches found for '\''John Doe'\''."
  }'
```

### Add Hard-Flag Result

```bash
curl -X POST "http://localhost:8090/v1/background-checks/{{checkId}}/results" \
  -H "Content-Type: application/json" \
  -H "x-api-key: {{apiKey}}" \
  -d '{
    "source": "ofac",
    "rawResult": { "query": "Bad Actor", "matches": [{ "list": "OFAC-SDN" }] },
    "normalizedVerdict": "hard_flag",
    "confidenceScore": 0.99,
    "llmSummary": "Exact match on OFAC SDN list."
  }'
```

### List Results by Check

```bash
curl -X GET "http://localhost:8090/v1/background-checks/{{checkId}}/results" \
  -H "Content-Type: application/json" \
  -H "x-api-key: {{apiKey}}"
```

---

## E. Trust Engine Verification

### Get Trust Score (Identity)

```bash
curl -X GET "http://localhost:8090/v1/trust-score/identity/{{identityId}}" \
  -H "Content-Type: application/json" \
  -H "x-api-key: {{apiKey}}"
```

### List Trust Signals (Identity)

```bash
curl -X GET "http://localhost:8090/v1/trust-signals?identityId={{identityId}}" \
  -H "Content-Type: application/json" \
  -H "x-api-key: {{apiKey}}"
```

### Get Trust Score (Organization)

```bash
curl -X GET "http://localhost:8090/v1/trust-score/organization/{{orgId}}" \
  -H "Content-Type: application/json" \
  -H "x-api-key: {{apiKey}}"
```

---

## F. Integration Scenarios (Chained Commands)

These rely on values from previous steps. Use a shell script or manually substitute outputs.

### Scenario 1: Registration-Time Trust Evaluation

```bash
# 1. Create platform
PLATFORM=$(curl -s -X POST http://localhost:8090/admin/platforms \
  -H "Content-Type: application/json" \
  -d '{"name":"E-Shop Gamma","domain":"eshop-gamma.example.com","status":"trial","strictnessLevel":"high"}')
PLATFORM_ID=$(echo $PLATFORM | jq -r '.id')
echo "Platform ID: $PLATFORM_ID"

# 2. Bootstrap API key (via service or admin endpoint)
# Replace with your actual bootstrap mechanism
# API_KEY=$(...)

# 3. Create identity
IDENTITY=$(curl -s -X POST http://localhost:8090/admin/identities \
  -H "Content-Type: application/json" \
  -d "{\"emailHash\":\"hash_${PLATFORM_ID}@example.com\",\"encryptedEmail\":\"ENC(email)\",\"encryptedFullName\":\"ENC(Name)\",\"trustStatus\":\"clean\"}")
IDENTITY_ID=$(echo $IDENTITY | jq -r '.id')
echo "Identity ID: $IDENTITY_ID"

# 4. Resolve device
DEVICE=$(curl -s -X POST http://localhost:8090/v1/intelligence/device \
  -H "Content-Type: application/json" \
  -H "x-api-key: $API_KEY" \
  -d '{"signals":[{"signalType":"canvas_hash","value":"canvas1"},{"signalType":"webgl_hash","value":"webgl1"},{"signalType":"screen_resolution","value":"1920x1080"},{"signalType":"os","value":"macOS"},{"signalType":"timezone","value":"Asia/Manila"},{"signalType":"user_agent","value":"Mozilla/5.0"},{"signalType":"browser","value":"Chrome"},{"signalType":"language","value":"en-US"}]}')
DEVICE_ID=$(echo $DEVICE | jq -r '.device.id')
echo "Device ID: $DEVICE_ID"

# 5. Evaluate IP
IP=$(curl -s -X POST http://localhost:8090/v1/intelligence/ip \
  -H "Content-Type: application/json" \
  -H "x-api-key: $API_KEY" \
  -d '{"ipAddress":"8.8.8.8"}')
IP_ID=$(echo $IP | jq -r '.id')
echo "IP ID: $IP_ID"

# 6. Create platform user
curl -s -X POST http://localhost:8090/v1/platform-users \
  -H "Content-Type: application/json" \
  -H "x-api-key: $API_KEY" \
  -d "{\"identityId\":\"$IDENTITY_ID\",\"platformId\":\"$PLATFORM_ID\",\"externalUserId\":\"reg_user_001\",\"statusOnPlatform\":\"active\"}" | jq .

# 7. Trigger background check
CHECK=$(curl -s -X POST http://localhost:8090/v1/background-checks \
  -H "Content-Type: application/json" \
  -H "x-api-key: $API_KEY" \
  -d "{\"entityType\":\"identity\",\"identityId\":\"$IDENTITY_ID\",\"triggeredBy\":\"registration\"}")
CHECK_ID=$(echo $CHECK | jq -r '.id')
echo "Check ID: $CHECK_ID"

# 8. Add results
curl -s -X POST "http://localhost:8090/v1/background-checks/$CHECK_ID/results" \
  -H "Content-Type: application/json" \
  -H "x-api-key: $API_KEY" \
  -d '{"source":"ofac","rawResult":{"matches":[]},"normalizedVerdict":"clear","confidenceScore":0.95,"llmSummary":"No OFAC matches."}' > /dev/null

curl -s -X POST "http://localhost:8090/v1/background-checks/$CHECK_ID/results" \
  -H "Content-Type: application/json" \
  -H "x-api-key: $API_KEY" \
  -d '{"source":"linkedin","rawResult":{"profiles":[]},"normalizedVerdict":"clear","confidenceScore":0.80,"llmSummary":"Profile corroborates identity."}' > /dev/null

# 9. Complete as clean
curl -s -X POST "http://localhost:8090/v1/background-checks/$CHECK_ID/complete" \
  -H "Content-Type: application/json" \
  -H "x-api-key: $API_KEY" \
  -d '{"overallVerdict":"clean"}' | jq .

# 10. Verify trust score
curl -s "http://localhost:8090/v1/trust-score/identity/$IDENTITY_ID" \
  -H "Content-Type: application/json" \
  -H "x-api-key: $API_KEY" | jq .
```

### Scenario 2: Suspicious IP + Device → Flagged

```bash
# Requires $PLATFORM_ID and $API_KEY from above

# Create identity
IDENTITY=$(curl -s -X POST http://localhost:8090/admin/identities \
  -H "Content-Type: application/json" \
  -d '{"emailHash":"suspicious_hash","encryptedEmail":"ENC","encryptedFullName":"ENC","trustStatus":"clean"}')
SUS_ID=$(echo $IDENTITY | jq -r '.id')

# Resolve device
DEVICE=$(curl -s -X POST http://localhost:8090/v1/intelligence/device \
  -H "Content-Type: application/json" \
  -H "x-api-key: $API_KEY" \
  -d '{"signals":[{"signalType":"canvas_hash","value":"sus_canvas"},{"signalType":"webgl_hash","value":"sus_webgl"},{"signalType":"screen_resolution","value":"1920x1080"},{"signalType":"os","value":"Windows"},{"signalType":"timezone","value":"UTC"}]}')
SUS_DEVICE_ID=$(echo $DEVICE | jq -r '.device.id')

# Set device risk score high
curl -s -X PATCH "http://localhost:8090/admin/devices/$SUS_DEVICE_ID/risk" \
  -H "Content-Type: application/json" \
  -d '{"riskScore":85}' > /dev/null

# Evaluate suspicious IP
IP=$(curl -s -X POST http://localhost:8090/v1/intelligence/ip \
  -H "Content-Type: application/json" \
  -H "x-api-key: $API_KEY" \
  -d '{"ipAddress":"10.0.0.1"}')
SUS_IP_ID=$(echo $IP | jq -r '.id')

# Background check + flagged
CHECK=$(curl -s -X POST http://localhost:8090/v1/background-checks \
  -H "Content-Type: application/json" \
  -H "x-api-key: $API_KEY" \
  -d "{\"entityType\":\"identity\",\"identityId\":\"$SUS_ID\",\"triggeredBy\":\"registration\"}")
SUS_CHECK_ID=$(echo $CHECK | jq -r '.id')

curl -s -X POST "http://localhost:8090/v1/background-checks/$SUS_CHECK_ID/results" \
  -H "Content-Type: application/json" \
  -H "x-api-key: $API_KEY" \
  -d '{"source":"serp","rawResult":{"results":[]},"normalizedVerdict":"soft_flag","confidenceScore":0.70,"llmSummary":"Adverse mention in search results."}' > /dev/null

curl -s -X POST "http://localhost:8090/v1/background-checks/$SUS_CHECK_ID/complete" \
  -H "Content-Type: application/json" \
  -H "x-api-key: $API_KEY" \
  -d '{"overallVerdict":"flagged"}' | jq .

# Verify low trust score
curl -s "http://localhost:8090/v1/trust-score/identity/$SUS_ID" \
  -H "Content-Type: application/json" \
  -H "x-api-key: $API_KEY" | jq .
```

### Scenario 3: Organization Verification

```bash
# Requires $API_KEY and $PLATFORM_ID from above

# Submit organization
ORG=$(curl -s -X POST http://localhost:8090/v1/organizations \
  -H "Content-Type: application/json" \
  -H "x-api-key: $API_KEY" \
  -d '{"legalName":"Partner Logistics","domain":"partner-logistics.example.com","registrationNumber":"REG-PL-2025","country":"PH","industry":"Logistics","trustStatus":"clean"}')
ORG_ID=$(echo $ORG | jq -r '.id')
echo "Org ID: $ORG_ID"

# Create org background check
CHECK=$(curl -s -X POST http://localhost:8090/v1/background-checks \
  -H "Content-Type: application/json" \
  -H "x-api-key: $API_KEY" \
  -d "{\"entityType\":\"organization\",\"orgId\":\"$ORG_ID\",\"triggeredBy\":\"manual\"}")
ORG_CHECK_ID=$(echo $CHECK | jq -r '.id')

# Add verification results
curl -s -X POST "http://localhost:8090/v1/background-checks/$ORG_CHECK_ID/results" \
  -H "Content-Type: application/json" \
  -H "x-api-key: $API_KEY" \
  -d '{"source":"business_registry","rawResult":{"found":true},"normalizedVerdict":"clear","confidenceScore":0.95,"llmSummary":"Verified in business registry."}' > /dev/null

curl -s -X POST "http://localhost:8090/v1/background-checks/$ORG_CHECK_ID/results" \
  -H "Content-Type: application/json" \
  -H "x-api-key: $API_KEY" \
  -d '{"source":"ofac","rawResult":{"matches":[]},"normalizedVerdict":"clear","confidenceScore":0.99,"llmSummary":"No sanctions matches."}' > /dev/null

# Complete as clean
curl -s -X POST "http://localhost:8090/v1/background-checks/$ORG_CHECK_ID/complete" \
  -H "Content-Type: application/json" \
  -H "x-api-key: $API_KEY" \
  -d '{"overallVerdict":"clean"}' | jq .

# Verify org trust score
curl -s "http://localhost:8090/v1/trust-score/organization/$ORG_ID" \
  -H "Content-Type: application/json" \
  -H "x-api-key: $API_KEY" | jq .

# Lookup by domain
curl -s "http://localhost:8090/admin/organizations/by-domain/partner-logistics.example.com" \
  -H "Content-Type: application/json" | jq .
```

---

## Placeholder Quick Reference

| Placeholder | Where it comes from |
|---|---|
| `{{apiKey}}` | `POST /v1/platform/api-keys` → `.rawKey` |
| `{{deviceId}}` | `POST /v1/intelligence/device` → `.device.id` |
| `{{ipId}}` | `POST /v1/intelligence/ip` → `.id` |
| `{{identityId}}` | `POST /admin/identities` → `.id` |
| `{{orgId}}` | `POST /v1/organizations` or `POST /admin/organizations` → `.id` |
| `{{checkId}}` | `POST /v1/background-checks` → `.id` |
| `{{resultId}}` | `POST /v1/background-checks/:id/results` → `.id` |
