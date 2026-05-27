# D. Registry API Tests

Covers `registry_entries`, `registry_targets`, and `community_reports`.

---

## Environment Variables Needed

| Variable | How to obtain |
|---|---|
| `baseUrl` | Your local / staging API root |
| `apiKey` | `POST /v1/platform/api-keys` using a platform's ID |
| `platformId` | From `POST /admin/platforms` |
| `identityId` | From `POST /admin/identities` |
| `orgId` | From `POST /v1/organizations` |
| `deviceId` | From `POST /v1/intelligence/device` |
| `ipId` | From `POST /v1/intelligence/ip` |
| `registryEntryId` | From `POST /v1/registry/entries` |
| `registryTargetId` | From `POST /v1/registry/targets` |
| `communityReportId` | From `POST /v1/registry/community-reports` |

---

## D.1 Registry Entries

### D.1.1 Create Registry Entry

- **Method:** `POST`
- **URL:** `{{baseUrl}}/v1/registry/entries`
- **Headers:**
  - `Content-Type: application/json`
  - `x-api-key: {{apiKey}}`
- **Body:**

```json
{
  "listType": "blacklist",
  "severity": "yellow_soft",
  "sourceType": "external_db"
}
```

**Field notes**
- `listType`: `blacklist` | `whitelist`
- `severity`: `yellow_soft` | `orange_watch` | `red_hard`
- `sourceType`: `external_db` | `behavioral` | `community_report` | `manual`

**Assertions**
- HTTP `201` or `200`.
- Response contains `id`, `listType`, `severity`, `sourceType`, `reportCount: 0`, `isActive: true`, `createdAt`, `updatedAt`.
- Save `id` as `{{registryEntryId}}`.

**Negative case**
- Invalid `severity` → `400`.
- Invalid `listType` → `400`.

---

### D.1.2 Get Registry Entry by ID

- **Method:** `GET`
- **URL:** `{{baseUrl}}/v1/registry/entries/{{registryEntryId}}`
- **Headers:** `x-api-key: {{apiKey}}`

**Assertions**
- HTTP `200`.
- Response `id` matches `{{registryEntryId}}`.

**Negative case**
- Random UUID → `404` (or `200` with `null`).

---

### D.1.3 Update Registry Entry

- **Method:** `PATCH`
- **URL:** `{{baseUrl}}/v1/registry/entries/{{registryEntryId}}`
- **Headers:**
  - `Content-Type: application/json`
  - `x-api-key: {{apiKey}}`
- **Body:**

```json
{
  "severity": "orange_watch",
  "reportCount": 3,
  "isActive": true
}
```

**Assertions**
- HTTP `200`.
- Response `severity` is `orange_watch`.
- Response `reportCount` is `3`.
- Response `updatedAt` is newer than `createdAt`.
- Unspecified fields (`listType`, `sourceType`) remain unchanged.

---

### D.1.4 Deactivate Registry Entry

- **Method:** `PATCH`
- **URL:** `{{baseUrl}}/v1/registry/entries/{{registryEntryId}}`
- **Headers:**
  - `Content-Type: application/json`
  - `x-api-key: {{apiKey}}`
- **Body:**

```json
{
  "isActive": false
}
```

**Assertions**
- HTTP `200`.
- Response `isActive` is `false`.
- The entry is not deleted; it is soft-disabled.

---

### D.1.5 Escalate Severity

- **Method:** `POST`
- **URL:** `{{baseUrl}}/v1/registry/entries/{{registryEntryId}}/escalate`
- **Headers:** `x-api-key: {{apiKey}}`

**Test sequence**
1. Create entry with `severity: yellow_soft`.
2. Call escalate.

**Assertions**
- HTTP `200`.
- Response `severity` is `orange_watch`.

3. Call escalate again.

**Assertions**
- Response `severity` is `red_hard`.

4. Call escalate a third time.

**Assertions**
- Either stays `red_hard` (idempotent ceiling) or returns an error depending on implementation. Document actual behavior.

**Side-effects to verify**
- An audit log exists with `action: severity_escalated`.

---

### D.1.6 List Registry Entries

- **Method:** `GET`
- **URL:** `{{baseUrl}}/admin/registry/entries`
- **Headers:** `Content-Type: application/json`

**Test queries**
- `?listType=blacklist`
- `?severity=red_hard`
- `?sourceType=community_report`
- `?isActive=true`
- Combined: `?listType=blacklist&severity=red_hard&isActive=true`

**Assertions**
- HTTP `200`.
- Response is an array.
- Every item matches the filter parameters.
- Inactive entries are excluded when `isActive=true`.

---

### D.1.7 Whitelist Entry

- **Method:** `POST`
- **URL:** `{{baseUrl}}/v1/registry/entries`
- **Headers:** `x-api-key: {{apiKey}}`
- **Body:**

```json
{
  "listType": "whitelist",
  "severity": "yellow_soft",
  "sourceType": "manual"
}
```

**Assertions**
- HTTP `201` or `200`.
- Response `listType` is `whitelist`.
- Save `id` as `{{whitelistEntryId}}`.

---

## D.2 Registry Targets

### D.2.1 Create Registry Target for Identity

- **Method:** `POST`
- **URL:** `{{baseUrl}}/v1/registry/targets`
- **Headers:**
  - `Content-Type: application/json`
  - `x-api-key: {{apiKey}}`
- **Body:**

```json
{
  "registryEntryId": "{{registryEntryId}}",
  "targetType": "identity",
  "identityId": "{{identityId}}"
}
```

**Field notes**
- `targetType`: `identity` | `organization` | `ip` | `email` | `device`
- Exactly one of `identityId`, `orgId`, `ipId`, `deviceId`, `emailHash` must be provided, matching `targetType`.

**Assertions**
- HTTP `201` or `200`.
- Response contains `id`, `registryEntryId`, `targetType`, `identityId`, `createdAt`.
- Save `id` as `{{registryTargetId}}`.

**Negative case**
- `targetType: identity` but `identityId` is missing → `400`.

---

### D.2.2 Create Multiple Targets for One Entry (Fraud Ring)

1. Create a single registry entry.
2. Create three targets against the same entry:
   - `targetType: identity`, `identityId: {{identityId}}`
   - `targetType: ip`, `ipId: {{ipId}}`
   - `targetType: email`, `emailHash: "sha256_of_fraud_email@example.com"`

**Assertions**
- All three creations return `201` or `200`.
- Each target has the same `registryEntryId`.

---

### D.2.3 Get Targets by Entry

- **Method:** `GET`
- **URL:** `{{baseUrl}}/v1/registry/entries/{{registryEntryId}}/targets`
- **Headers:** `x-api-key: {{apiKey}}`

**Assertions**
- HTTP `200`.
- Response is an array.
- Every item has `registryEntryId === {{registryEntryId}}`.
- Array length matches the number of targets created.

---

### D.2.4 Lookup Entries by Entity

- **Method:** `GET`
- **URL:** `{{baseUrl}}/admin/registry/lookup?targetType=identity&identityId={{identityId}}`
- **Headers:** `Content-Type: application/json`

**Test queries**
- `?targetType=identity&identityId={{identityId}}`
- `?targetType=organization&orgId={{orgId}}`
- `?targetType=ip&ipId={{ipId}}`
- `?targetType=device&deviceId={{deviceId}}`
- `?targetType=email&emailHash=sha256_of_fraud_email@example.com`

**Assertions**
- HTTP `200`.
- Response is an array of `RegistryEntry` objects (not targets).
- Every returned entry is linked to the queried entity via a registry target.

**Negative case**
- Lookup by `identityId` for an identity that has no targets → `200` with empty array.

---

### D.2.5 Cross-Entity Isolation

1. Create a registry entry with a target for `identityId: id_A`.
2. Lookup by `targetType=identity&identityId=id_B` (a different identity).

**Assertions**
- Response is an empty array.
- The entry linked to `id_A` is not returned.

---

### D.2.6 Fraud Ring Lookup

1. Create a blacklist entry with severity `red_hard`.
2. Link it to three targets: one identity, one IP, one email.
3. Lookup by the email hash.
4. Lookup by the IP.
5. Lookup by the identity.

**Assertions**
- All three lookups return the same parent `registry_entry`.
- The entry has `severity: red_hard` and `listType: blacklist`.

---

## D.3 Community Reports

### D.3.1 Submit Community Report

- **Method:** `POST`
- **URL:** `{{baseUrl}}/v1/registry/community-reports`
- **Headers:**
  - `Content-Type: application/json`
  - `x-api-key: {{apiKey}}`
- **Body:**

```json
{
  "reportingPlatformId": "{{platformId}}",
  "targetType": "identity",
  "identityId": "{{identityId}}",
  "severity": "high",
  "category": "fraud",
  "description": "User attempted chargeback fraud after KYC bypass.",
  "evidenceUrls": ["https://evidence.example.com/screenshot1.png"]
}
```

**Field notes**
- `targetType`: `identity` | `organization` | `ip` | `email` | `device`
- `severity`: `low` | `medium` | `high`
- `category`: `fraud` | `bot` | `scraping` | `spam` | `identity_theft` | `other`
- Exactly one target identifier must be provided (`identityId`, `orgId`, `ipId`, or `emailHash`).

**Assertions**
- HTTP `201` or `200`.
- Response contains `id`, `reportingPlatformId`, `targetType`, `identityId`, `severity`, `category`, `description`, `evidenceUrls`, `status: pending`, `registryEntryId: null`, `createdAt`.
- Save `id` as `{{communityReportId}}`.

**Negative case**
- Missing `x-api-key` → `401`.
- Invalid `category` → `400`.

---

### D.3.2 Get Community Report by ID

- **Method:** `GET`
- **URL:** `{{baseUrl}}/v1/registry/community-reports/{{communityReportId}}`
- **Headers:** `x-api-key: {{apiKey}}`

**Assertions**
- HTTP `200`.
- Response `id` matches `{{communityReportId}}`.

---

### D.3.3 List Community Reports

- **Method:** `GET`
- **URL:** `{{baseUrl}}/v1/registry/community-reports`
- **Headers:** `x-api-key: {{apiKey}}`

**Test queries**
- `?reportingPlatformId={{platformId}}`
- `?status=pending`
- `?targetType=identity`
- Combined: `?reportingPlatformId={{platformId}}&status=pending`

**Assertions**
- HTTP `200`.
- Response is an array.
- Every item matches the filter parameters.

---

### D.3.4 Update Report Status

- **Method:** `PATCH`
- **URL:** `{{baseUrl}}/admin/community-reports/{{communityReportId}}/status`
- **Headers:** `Content-Type: application/json`
- **Body:**

```json
{
  "status": "reviewed",
  "registryEntryId": null
}
```

**Assertions**
- HTTP `200`.
- Response `status` is `reviewed`.

---

### D.3.5 Accept Community Report

- **Method:** `POST`
- **URL:** `{{baseUrl}}/admin/community-reports/{{communityReportId}}/accept?severity=orange_watch`
- **Headers:** `Content-Type: application/json`

**Assertions**
- HTTP `200`.
- Response `status` is `accepted`.
- Response `registryEntryId` is now a valid UUID (not `null`).

**Side-effects to verify**
1. **Registry Entry created**: `GET /v1/registry/entries/{{registryEntryId}}` returns an entry with `listType: blacklist`, `severity: orange_watch`, `sourceType: community_report`.
2. **Registry Target created**: `GET /v1/registry/entries/{{registryEntryId}}/targets` returns at least one target pointing to the reported entity.
3. **Trust Signal created**: `GET /v1/trust-signals?entityType=identity&identityId={{identityId}}&signalType=community_report` returns a signal with `weight: -10`, `source: community_report`, `referenceId` matching `{{communityReportId}}`.
4. **Audit Log created**: `GET /admin/compliance/audit-logs?action=report_accepted&targetId={{communityReportId}}` returns one log.

---

### D.3.6 Multi-Report Accumulation

1. Create two platforms: `platformA` and `platformB`.
2. Create one identity.
3. `platformA` submits a community report for the identity (`severity: high`).
4. `platformB` submits a community report for the **same** identity (`severity: high`).
5. Admin accepts both reports.

**Assertions**
- Two `registry_entries` are created (or one entry with two targets, depending on implementation). Assert whichever is true.
- Two `trust_signals` exist with `signalType: community_report`.
- The identity's trust score is `30` (50 baseline - 10 - 10 = 30).

---

### D.3.7 Reject Community Report

1. Submit a report.
2. Admin updates status to `rejected`.

- **Method:** `PATCH`
- **URL:** `{{baseUrl}}/admin/community-reports/{{communityReportId}}/status`
- **Body:**

```json
{
  "status": "rejected"
}
```

**Assertions**
- Response `status` is `rejected`.
- No `registry_entry` is created (`registryEntryId` remains `null`).
- No `trust_signal` is created.

---

## Postman Environment Variables Summary

| Variable | Example | Purpose |
|---|---|---|
| `baseUrl` | `http://localhost:3000` | API root |
| `platformId` | `uuid` | Reporting platform ID |
| `apiKey` | `tl_test_...` | Valid platform API key |
| `identityId` | `uuid` | Identity under test |
| `orgId` | `uuid` | Organization under test |
| `deviceId` | `uuid` | Device under test |
| `ipId` | `uuid` | IP record under test |
| `registryEntryId` | `uuid` | Created registry entry ID |
| `registryTargetId` | `uuid` | Created registry target ID |
| `communityReportId` | `uuid` | Created community report ID |
| `whitelistEntryId` | `uuid` | Whitelist entry ID |
