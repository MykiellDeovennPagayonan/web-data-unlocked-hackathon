# F. Curl Commands for Manual Testing

**Base URL:** `http://localhost:8090`

Replace placeholder values (e.g., `{{platformId}}`, `{{apiKey}}`, `{{identityId}}`) with actual UUIDs / strings returned by previous requests.

> **Tip:** Pipe responses through `jq` for readability: `curl ... | jq .`

---

## A. Compliance

### A.1 Audit Logs

#### Create Audit Log

```bash
curl -X POST http://localhost:8090/admin/compliance/audit-logs \
  -H "Content-Type: application/json" \
  -d '{
    "actorType": "system",
    "actorId": "system",
    "action": "manual_block",
    "targetType": "identity",
    "targetId": "{{identityId}}",
    "oldValue": { "trustStatus": "clean" },
    "newValue": { "trustStatus": "blocked" }
  }'
```

#### List Audit Logs

```bash
curl -X GET "http://localhost:8090/admin/compliance/audit-logs?actorType=system&action=manual_block&from=2026-01-01T00:00:00Z"
```

---

### A.2 Consent Records

#### Record Consent

```bash
curl -X POST http://localhost:8090/v1/compliance/consent \
  -H "Content-Type: application/json" \
  -H "x-api-key: {{apiKey}}" \
  -d '{
    "identityId": "{{identityId}}",
    "platformId": "{{platformId}}",
    "consentType": "data_processing",
    "consentVersion": "v1.0.0",
    "ipAtConsent": "192.168.1.1"
  }'
```

#### Check Active Consent

```bash
curl -X GET "http://localhost:8090/v1/compliance/consent/check?identityId={{identityId}}&platformId={{platformId}}&consentType=data_processing" \
  -H "x-api-key: {{apiKey}}"
```

#### Revoke Consent

```bash
curl -X PATCH "http://localhost:8090/v1/compliance/consent/{{consentId}}/revoke" \
  -H "x-api-key: {{apiKey}}"
```

#### List Consent Records

```bash
curl -X GET "http://localhost:8090/v1/compliance/consent?identityId={{identityId}}&platformId={{platformId}}" \
  -H "x-api-key: {{apiKey}}"
```

---

### A.3 Verification Requests

#### Create Verification Request

```bash
curl -X POST http://localhost:8090/v1/compliance/verification-requests \
  -H "Content-Type: application/json" \
  -H "x-api-key: {{apiKey}}" \
  -d '{
    "identityId": "{{identityId}}",
    "platformId": "{{platformId}}",
    "verificationType": "government_id",
    "provider": "jumio"
  }'
```

#### Submit Verification Request

```bash
curl -X PATCH "http://localhost:8090/v1/compliance/verification-requests/{{verificationRequestId}}/submit" \
  -H "x-api-key: {{apiKey}}"
```

#### List Verification Requests

```bash
curl -X GET "http://localhost:8090/v1/compliance/verification-requests?identityId={{identityId}}&status=pending" \
  -H "x-api-key: {{apiKey}}"
```

#### Approve Verification Request

```bash
curl -X POST "http://localhost:8090/admin/compliance/verification-requests/{{verificationRequestId}}/approve" \
  -H "Content-Type: application/json"
```

#### Reject Verification Request

```bash
curl -X POST "http://localhost:8090/admin/compliance/verification-requests/{{verificationRequestId}}/reject" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "rejected",
    "rejectionReason": "Document unclear"
  }'
```

---

## B. Access & Sessions

### B.1 Sessions

#### Create Session

```bash
curl -X POST http://localhost:8090/v1/access/sessions \
  -H "Content-Type: application/json" \
  -H "x-api-key: {{apiKey}}" \
  -d '{
    "identityId": "{{identityId}}",
    "platformId": "{{platformId}}",
    "ipId": "{{ipId}}",
    "deviceId": "{{deviceId}}",
    "sessionTokenHash": "sha256_of_session_token",
    "riskScoreAtStart": 65
  }'
```

#### End Session

```bash
curl -X PATCH "http://localhost:8090/v1/access/sessions/{{sessionId}}/end" \
  -H "Content-Type: application/json" \
  -H "x-api-key: {{apiKey}}" \
  -d '{
    "riskScoreAtEnd": 45,
    "verdict": "flagged",
    "terminationReason": "suspicious_behavior"
  }'
```

#### Get Session by ID (Admin)

```bash
curl -X GET "http://localhost:8090/admin/access/sessions/{{sessionId}}"
```

---

### B.2 Access Events

#### Log Access Event

```bash
curl -X POST http://localhost:8090/v1/access/events \
  -H "Content-Type: application/json" \
  -H "x-api-key: {{apiKey}}" \
  -d '{
    "platformId": "{{platformId}}",
    "identityId": "{{identityId}}",
    "ipId": "{{ipId}}",
    "deviceId": "{{deviceId}}",
    "eventType": "registration",
    "verdict": "allowed",
    "scoreAtEvent": 65,
    "triggeredRules": {
      "ruleIds": [],
      "ruleCount": 0
    }
  }'
```

#### Log Blocked Access Event

```bash
curl -X POST http://localhost:8090/v1/access/events \
  -H "Content-Type: application/json" \
  -H "x-api-key: {{apiKey}}" \
  -d '{
    "platformId": "{{platformId}}",
    "identityId": "{{identityId}}",
    "ipId": "{{ipId}}",
    "deviceId": "{{deviceId}}",
    "eventType": "registration",
    "verdict": "blocked",
    "scoreAtEvent": 10,
    "triggeredRules": {
      "ruleIds": ["rule_001"],
      "ruleCount": 1,
      "matchedConditions": ["trustScoreBelow30"]
    }
  }'
```

#### Get Platform Events (Admin)

```bash
curl -X GET "http://localhost:8090/admin/access/events/platform/{{platformId}}"
```

---

### B.3 Behavioral Events

#### Log Behavioral Event

```bash
curl -X POST http://localhost:8090/v1/access/behavioral \
  -H "Content-Type: application/json" \
  -H "x-api-key: {{apiKey}}" \
  -d '{
    "sessionId": "{{sessionId}}",
    "identityId": "{{identityId}}",
    "platformId": "{{platformId}}",
    "eventType": "api_call",
    "endpoint": "/api/v1/products",
    "flagTriggered": false,
    "actionTaken": "none"
  }'
```

#### Log Behavioral Event with Flag

```bash
curl -X POST http://localhost:8090/v1/access/behavioral \
  -H "Content-Type: application/json" \
  -H "x-api-key: {{apiKey}}" \
  -d '{
    "sessionId": "{{sessionId}}",
    "identityId": "{{identityId}}",
    "platformId": "{{platformId}}",
    "eventType": "endpoint_probe",
    "endpoint": "/admin/secrets",
    "flagTriggered": true,
    "flagType": "unauthorized_endpoint_access",
    "actionTaken": "blocked"
  }'
```

#### Get Session Behavioral Events (Admin)

```bash
curl -X GET "http://localhost:8090/admin/access/behavioral/session/{{sessionId}}"
```

---

## C. Trust Engine

### C.1 Trust Signals

#### Create Trust Signal for Identity

```bash
curl -X POST http://localhost:8090/v1/trust-signals \
  -H "Content-Type: application/json" \
  -H "x-api-key: {{apiKey}}" \
  -d '{
    "entityType": "identity",
    "identityId": "{{identityId}}",
    "signalType": "linkedin_verified",
    "weight": 10,
    "source": "background_check",
    "referenceId": "{{backgroundCheckId}}",
    "expiresAt": "2027-01-01T00:00:00Z"
  }'
```

#### Create Trust Signal for Organization

```bash
curl -X POST http://localhost:8090/v1/trust-signals \
  -H "Content-Type: application/json" \
  -H "x-api-key: {{apiKey}}" \
  -d '{
    "entityType": "organization",
    "orgId": "{{orgId}}",
    "signalType": "clean_history",
    "weight": 5,
    "source": "background_check",
    "referenceId": "{{backgroundCheckId}}"
  }'
```

#### Compute Trust Score

```bash
curl -X GET "http://localhost:8090/v1/trust-score/identity/{{identityId}}" \
  -H "x-api-key: {{apiKey}}"
```

#### List Trust Signals

```bash
curl -X GET "http://localhost:8090/v1/trust-signals?entityType=identity&identityId={{identityId}}&signalType=kyc_passed" \
  -H "x-api-key: {{apiKey}}"
```

---

### C.2 Trust Score Snapshots

#### Create Trust Score Snapshot

```bash
curl -X POST http://localhost:8090/v1/trust-score-snapshots \
  -H "Content-Type: application/json" \
  -H "x-api-key: {{apiKey}}" \
  -d '{
    "entityType": "identity",
    "identityId": "{{identityId}}",
    "score": 65,
    "snapshotReason": "certificate_issued",
    "referenceId": "{{verificationRequestId}}"
  }'
```

#### List Snapshots by Entity

```bash
curl -X GET "http://localhost:8090/v1/trust-score-snapshots/identity/{{identityId}}" \
  -H "x-api-key: {{apiKey}}"
```

---

### C.3 Trust Certificates

#### Issue Certificate for Identity

```bash
curl -X POST http://localhost:8090/v1/trust-certificates \
  -H "Content-Type: application/json" \
  -H "x-api-key: {{apiKey}}" \
  -d '{
    "entityType": "identity",
    "identityId": "{{identityId}}",
    "issuingCheckId": "{{backgroundCheckId}}",
    "validDays": 90
  }'
```

#### Issue Certificate for Organization

```bash
curl -X POST http://localhost:8090/v1/trust-certificates \
  -H "Content-Type: application/json" \
  -H "x-api-key: {{apiKey}}" \
  -d '{
    "entityType": "organization",
    "orgId": "{{orgId}}",
    "issuingCheckId": "{{backgroundCheckId}}",
    "validDays": 30
  }'
```

#### List Certificates by Entity

```bash
curl -X GET "http://localhost:8090/v1/trust-certificates?entityType=identity&entityId={{identityId}}" \
  -H "x-api-key: {{apiKey}}"
```

#### Revoke Certificate

```bash
curl -X PATCH "http://localhost:8090/v1/trust-certificates/{{certificateId}}/revoke" \
  -H "Content-Type: application/json" \
  -H "x-api-key: {{apiKey}}" \
  -d '{ "reason": "fraudulent_identity" }'
```

---

### C.4 Certificate Verifications

#### Verify Active Certificate

```bash
curl -X POST "http://localhost:8090/v1/certificate-verifications/{{certificateId}}" \
  -H "Content-Type: application/json" \
  -H "x-api-key: {{apiKey}}" \
  -d '{ "verifiedByPlatformId": "{{platformId}}" }'
```

#### List Verifications by Certificate

```bash
curl -X GET "http://localhost:8090/v1/certificate-verifications/{{certificateId}}" \
  -H "x-api-key: {{apiKey}}"
```

---

## D. Registry

### D.1 Registry Entries

#### Create Registry Entry (Blacklist)

```bash
curl -X POST http://localhost:8090/v1/registry/entries \
  -H "Content-Type: application/json" \
  -H "x-api-key: {{apiKey}}" \
  -d '{
    "listType": "blacklist",
    "severity": "yellow_soft",
    "sourceType": "external_db"
  }'
```

#### Create Registry Entry (Whitelist)

```bash
curl -X POST http://localhost:8090/v1/registry/entries \
  -H "Content-Type: application/json" \
  -H "x-api-key: {{apiKey}}" \
  -d '{
    "listType": "whitelist",
    "severity": "yellow_soft",
    "sourceType": "manual"
  }'
```

#### Get Registry Entry by ID

```bash
curl -X GET "http://localhost:8090/v1/registry/entries/{{registryEntryId}}" \
  -H "x-api-key: {{apiKey}}"
```

#### Update Registry Entry

```bash
curl -X PATCH "http://localhost:8090/v1/registry/entries/{{registryEntryId}}" \
  -H "Content-Type: application/json" \
  -H "x-api-key: {{apiKey}}" \
  -d '{
    "severity": "orange_watch",
    "reportCount": 3,
    "isActive": true
  }'
```

#### Escalate Severity

```bash
curl -X POST "http://localhost:8090/v1/registry/entries/{{registryEntryId}}/escalate" \
  -H "x-api-key: {{apiKey}}"
```

#### List Registry Entries (Admin)

```bash
curl -X GET "http://localhost:8090/admin/registry/entries?listType=blacklist&severity=red_hard&isActive=true"
```

---

### D.2 Registry Targets

#### Create Registry Target for Identity

```bash
curl -X POST http://localhost:8090/v1/registry/targets \
  -H "Content-Type: application/json" \
  -H "x-api-key: {{apiKey}}" \
  -d '{
    "registryEntryId": "{{registryEntryId}}",
    "targetType": "identity",
    "identityId": "{{identityId}}"
  }'
```

#### Create Registry Target for IP

```bash
curl -X POST http://localhost:8090/v1/registry/targets \
  -H "Content-Type: application/json" \
  -H "x-api-key: {{apiKey}}" \
  -d '{
    "registryEntryId": "{{registryEntryId}}",
    "targetType": "ip",
    "ipId": "{{ipId}}"
  }'
```

#### Create Registry Target for Email

```bash
curl -X POST http://localhost:8090/v1/registry/targets \
  -H "Content-Type: application/json" \
  -H "x-api-key: {{apiKey}}" \
  -d '{
    "registryEntryId": "{{registryEntryId}}",
    "targetType": "email",
    "emailHash": "sha256_of_fraud_email@example.com"
  }'
```

#### Get Targets by Entry

```bash
curl -X GET "http://localhost:8090/v1/registry/entries/{{registryEntryId}}/targets" \
  -H "x-api-key: {{apiKey}}"
```

#### Lookup Entries by Entity

```bash
curl -X GET "http://localhost:8090/admin/registry/lookup?targetType=identity&identityId={{identityId}}"
```

---

### D.3 Community Reports

#### Submit Community Report

```bash
curl -X POST http://localhost:8090/v1/registry/community-reports \
  -H "Content-Type: application/json" \
  -H "x-api-key: {{apiKey}}" \
  -d '{
    "reportingPlatformId": "{{platformId}}",
    "targetType": "identity",
    "identityId": "{{identityId}}",
    "severity": "high",
    "category": "fraud",
    "description": "User attempted chargeback fraud after KYC bypass.",
    "evidenceUrls": ["https://evidence.example.com/screenshot1.png"]
  }'
```

#### List Community Reports

```bash
curl -X GET "http://localhost:8090/v1/registry/community-reports?reportingPlatformId={{platformId}}&status=pending" \
  -H "x-api-key: {{apiKey}}"
```

#### Update Report Status

```bash
curl -X PATCH "http://localhost:8090/admin/community-reports/{{communityReportId}}/status" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "reviewed",
    "registryEntryId": null
  }'
```

#### Accept Community Report

```bash
curl -X POST "http://localhost:8090/admin/community-reports/{{communityReportId}}/accept?severity=orange_watch" \
  -H "Content-Type: application/json"
```

---

## E. Integration Scenarios

### Scenario 1: KYC to Certificate Flow

#### Create platform
```bash
curl -X POST http://localhost:8090/admin/platforms \
  -H "Content-Type: application/json" \
  -d '{
    "name": "KYC Test Platform",
    "domain": "kyc-test.example.com",
    "status": "trial",
    "strictnessLevel": "high"
  }'
```

#### Create identity
```bash
curl -X POST http://localhost:8090/admin/identities \
  -H "Content-Type: application/json" \
  -d '{
    "emailHash": "kyc-hash-001",
    "encryptedEmail": "ENC(kyc@example.com)",
    "encryptedFullName": "ENC(KYC Test User)",
    "trustStatus": "clean"
  }'
```

#### Create and submit verification request
```bash
curl -X POST http://localhost:8090/v1/compliance/verification-requests \
  -H "Content-Type: application/json" \
  -H "x-api-key: {{adminApiKeyRaw}}" \
  -d '{
    "identityId": "{{identityId}}",
    "platformId": "{{adminPlatformId}}",
    "verificationType": "government_id",
    "provider": "jumio"
  }'
```

#### Approve verification
```bash
curl -X POST "http://localhost:8090/admin/compliance/verification-requests/{{verificationRequestId}}/approve" \
  -H "Content-Type: application/json"
```

#### Issue trust certificate
```bash
curl -X POST http://localhost:8090/v1/trust-certificates \
  -H "Content-Type: application/json" \
  -H "x-api-key: {{adminApiKeyRaw}}" \
  -d '{
    "entityType": "identity",
    "identityId": "{{identityId}}",
    "issuingCheckId": "{{verificationRequestId}}",
    "validDays": 90
  }'
```

#### Verify certificate from second platform
```bash
curl -X POST "http://localhost:8090/v1/certificate-verifications/{{certificateId}}" \
  -H "Content-Type: application/json" \
  -H "x-api-key: {{platformBApiKeyRaw}}" \
  -d '{ "verifiedByPlatformId": "{{platformBId}}" }'
```

#### Revoke certificate
```bash
curl -X PATCH "http://localhost:8090/v1/trust-certificates/{{certificateId}}/revoke" \
  -H "Content-Type: application/json" \
  -H "x-api-key: {{adminApiKeyRaw}}" \
  -d '{ "reason": "identity_fraud_discovered" }'
```

---

### Scenario 2: Community Blacklist Flow

#### Submit report from Platform A
```bash
curl -X POST http://localhost:8090/v1/registry/community-reports \
  -H "Content-Type: application/json" \
  -H "x-api-key: {{apiKeyA}}" \
  -d '{
    "reportingPlatformId": "{{platformAId}}",
    "targetType": "identity",
    "identityId": "{{identityId}}",
    "severity": "high",
    "category": "fraud",
    "description": "Chargeback fraud on payment"
  }'
```

#### Submit report from Platform B
```bash
curl -X POST http://localhost:8090/v1/registry/community-reports \
  -H "Content-Type: application/json" \
  -H "x-api-key: {{apiKeyB}}" \
  -d '{
    "reportingPlatformId": "{{platformBId}}",
    "targetType": "identity",
    "identityId": "{{identityId}}",
    "severity": "high",
    "category": "identity_theft",
    "description": "Stolen credentials used"
  }'
```

#### Accept both reports
```bash
curl -X POST "http://localhost:8090/admin/community-reports/{{reportAId}}/accept?severity=orange_watch" \
  -H "Content-Type: application/json"

curl -X POST "http://localhost:8090/admin/community-reports/{{reportBId}}/accept?severity=red_hard" \
  -H "Content-Type: application/json"
```

#### Check trust score drop
```bash
curl -X GET "http://localhost:8090/v1/trust-score/identity/{{identityId}}" \
  -H "x-api-key: {{apiKeyA}}"
```

---

### Scenario 3: Consent-Gated Access

#### Record consent
```bash
curl -X POST http://localhost:8090/v1/compliance/consent \
  -H "Content-Type: application/json" \
  -H "x-api-key: {{apiKey}}" \
  -d '{
    "identityId": "{{identityId}}",
    "platformId": "{{platformId}}",
    "consentType": "data_processing",
    "consentVersion": "v1.0.0",
    "ipAtConsent": "203.0.113.1"
  }'
```

#### Log access event
```bash
curl -X POST http://localhost:8090/v1/access/events \
  -H "Content-Type: application/json" \
  -H "x-api-key: {{apiKey}}" \
  -d '{
    "platformId": "{{platformId}}",
    "identityId": "{{identityId}}",
    "ipId": "{{ipId}}",
    "deviceId": "{{deviceId}}",
    "eventType": "registration",
    "verdict": "allowed",
    "scoreAtEvent": 50,
    "triggeredRules": {}
  }'
```

#### Revoke consent
```bash
curl -X PATCH "http://localhost:8090/v1/compliance/consent/{{consentId}}/revoke" \
  -H "x-api-key: {{apiKey}}"
```

---

### Scenario 4: Platform Rules × Trust Score

#### Create platform rule
```bash
curl -X POST http://localhost:8090/v1/platform/rules \
  -H "Content-Type: application/json" \
  -H "x-api-key: {{strictApiKey}}" \
  -d '{
    "ruleTrigger": "registration",
    "conditionJson": { "trustScoreBelow": 30 },
    "action": "block"
  }'
```

#### Add negative trust signal
```bash
curl -X POST http://localhost:8090/v1/trust-signals \
  -H "Content-Type: application/json" \
  -H "x-api-key: {{strictApiKey}}" \
  -d '{
    "entityType": "identity",
    "identityId": "{{identityId}}",
    "signalType": "ofac_match",
    "weight": -40,
    "source": "manual",
    "referenceId": "manual_review_001"
  }'
```

#### Log blocked access event
```bash
curl -X POST http://localhost:8090/v1/access/events \
  -H "Content-Type: application/json" \
  -H "x-api-key: {{strictApiKey}}" \
  -d '{
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
  }'
```
