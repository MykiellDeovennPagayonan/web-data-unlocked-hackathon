# B. Access & Sessions API Tests

Covers `sessions`, `access_events`, and `behavioral_events`.

---

## Environment Variables Needed

| Variable | How to obtain |
|---|---|
| `baseUrl` | Your local / staging API root |
| `apiKey` | `POST /v1/platform/api-keys` using a platform's ID |
| `platformId` | From `POST /admin/platforms` |
| `identityId` | From `POST /admin/identities` |
| `deviceId` | From `POST /v1/intelligence/device` |
| `ipId` | From `POST /v1/intelligence/ip` |
| `sessionId` | From `POST /v1/access/sessions` |
| `accessEventId` | From `POST /v1/access/events` |
| `behavioralEventId` | From `POST /v1/access/behavioral` |

---

## B.1 Sessions

### B.1.1 Create Session

- **Method:** `POST`
- **URL:** `{{baseUrl}}/v1/access/sessions`
- **Headers:**
  - `Content-Type: application/json`
  - `x-api-key: {{apiKey}}`
- **Body:**

```json
{
  "identityId": "{{identityId}}",
  "platformId": "{{platformId}}",
  "ipId": "{{ipId}}",
  "deviceId": "{{deviceId}}",
  "sessionTokenHash": "sha256_of_session_token",
  "riskScoreAtStart": 65
}
```

**Assertions**
- HTTP `201` or `200`.
- Response contains `id`, `identityId`, `platformId`, `ipId`, `deviceId`, `sessionTokenHash`, `riskScoreAtStart: 65`, `riskScoreAtEnd: null`, `startedAt`, `endedAt: null`, `sessionVerdict: clean`, `terminationReason: null`.
- Save `id` as `{{sessionId}}`.

**Negative case**
- Missing `x-api-key` → `401`.
- Invalid UUID for any foreign key → `400` or `500` depending on validation layer.

---

### B.1.2 End Session

- **Method:** `PATCH`
- **URL:** `{{baseUrl}}/v1/access/sessions/{{sessionId}}/end`
- **Headers:**
  - `Content-Type: application/json`
  - `x-api-key: {{apiKey}}`
- **Body:**

```json
{
  "riskScoreAtEnd": 45,
  "verdict": "flagged",
  "terminationReason": "suspicious_behavior"
}
```

**Field notes**
- `verdict`: `clean` | `flagged` | `terminated`
- `terminationReason`: optional free-text field.

**Assertions**
- HTTP `200`.
- Response `riskScoreAtEnd` is `45`.
- Response `sessionVerdict` is `flagged`.
- Response `terminationReason` is `suspicious_behavior`.
- Response `endedAt` is a timestamp.
- `endedAt` is greater than or equal to `startedAt`.

**Negative case**
- End an already-ended session → assert idempotent or error.

---

### B.1.3 Get Session by ID

- **Method:** `GET`
- **URL:** `{{baseUrl}}/admin/access/sessions/{{sessionId}}`
- **Headers:** `Content-Type: application/json`

**Assertions**
- HTTP `200`.
- Response `id` matches `{{sessionId}}`.
- Response contains full session object with `identityId`, `platformId`, `ipId`, `deviceId`, `riskScoreAtStart`, `riskScoreAtEnd`, `sessionVerdict`, `startedAt`, `endedAt`.

**Negative case**
- Random UUID → `404` (or `200` with `null`).

---

### B.1.4 Session Audit Trail

After creating and ending a session, query the audit logs.

- **Method:** `GET`
- **URL:** `{{baseUrl}}/admin/compliance/audit-logs?targetType=session&targetId={{sessionId}}`

**Assertions**
- At least two audit log rows exist: one for `session_created` and one for `session_ended`.
- Each log has `actorType: system`.

---

### B.1.5 Session Lifecycle — Clean to Terminated

1. Create a session (`riskScoreAtStart: 80`).
2. End the session with `verdict: terminated`, `terminationReason: manual_review`.
3. Fetch the session.

**Assertions**
- `sessionVerdict` is `terminated`.
- `riskScoreAtEnd` is persisted.
- `endedAt` is set.

---

## B.2 Access Events

### B.2.1 Log Access Event

- **Method:** `POST`
- **URL:** `{{baseUrl}}/v1/access/events`
- **Headers:**
  - `Content-Type: application/json`
  - `x-api-key: {{apiKey}}`
- **Body:**

```json
{
  "platformId": "{{platformId}}",
  "identityId": "{{identityId}}",
  "orgId": null,
  "ipId": "{{ipId}}",
  "deviceId": "{{deviceId}}",
  "eventType": "registration",
  "verdict": "allowed",
  "scoreAtEvent": 65,
  "triggeredRules": {
    "ruleIds": [],
    "ruleCount": 0
  }
}
```

**Field notes**
- `eventType`: `registration` | `login` | `api_call` | `page_visit`
- `verdict`: `allowed` | `flagged` | `throttled` | `blocked`
- `scoreAtEvent`: the trust score at the time of the event.
- `triggeredRules`: JSON object capturing which platform rules fired.

**Assertions**
- HTTP `201` or `200`.
- Response contains `id`, `platformId`, `identityId`, `ipId`, `deviceId`, `eventType`, `verdict`, `scoreAtEvent`, `triggeredRules`, `createdAt`.
- Save `id` as `{{accessEventId}}`.

**Negative case**
- Missing `x-api-key` → `401`.
- Invalid `eventType` → `400`.
- Invalid `verdict` → `400`.

---

### B.2.2 Log Access Event — Blocked Registration

- **Method:** `POST`
- **URL:** `{{baseUrl}}/v1/access/events`
- **Headers:**
  - `Content-Type: application/json`
  - `x-api-key: {{apiKey}}`
- **Body:**

```json
{
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
}
```

**Assertions**
- HTTP `201` or `200`.
- Response `verdict` is `blocked`.
- Response `scoreAtEvent` is `10`.

---

### B.2.3 Get Platform Events

- **Method:** `GET`
- **URL:** `{{baseUrl}}/admin/access/events/platform/{{platformId}}`
- **Headers:** `Content-Type: application/json`

**Assertions**
- HTTP `200`.
- Response is an array.
- Every item has `platformId === {{platformId}}`.
- Results include both `allowed` and `blocked` events if both were logged.

**Negative case**
- Random platform UUID → `200` with empty array (or `404`).

---

### B.2.4 Access Event Score Integrity

1. Independently compute the trust score: `GET /v1/trust-score/identity/{{identityId}}`.
2. Log an access event with `scoreAtEvent` equal to the computed score.
3. Fetch the event by platform.

**Assertions**
- The logged `scoreAtEvent` matches the independently computed score.
- If the score changes later, the logged event's `scoreAtEvent` remains unchanged (immutable snapshot).

---

### B.2.5 Access Event Verdict Matrix

Test all combinations of `eventType` and `verdict` to ensure DTO validation accepts all documented pairs:

| `eventType` | `verdict` |
|---|---|
| `registration` | `allowed` |
| `registration` | `blocked` |
| `login` | `allowed` |
| `login` | `flagged` |
| `api_call` | `allowed` |
| `api_call` | `throttled` |
| `page_visit` | `allowed` |
| `page_visit` | `blocked` |

**Assertions**
- Every valid pair returns HTTP `201` or `200`.
- Every invalid pair (if any are invalid in your enum mapping) returns `400`.

---

## B.3 Behavioral Events

### B.3.1 Log Behavioral Event

- **Method:** `POST`
- **URL:** `{{baseUrl}}/v1/access/behavioral`
- **Headers:**
  - `Content-Type: application/json`
  - `x-api-key: {{apiKey}}`
- **Body:**

```json
{
  "sessionId": "{{sessionId}}",
  "identityId": "{{identityId}}",
  "platformId": "{{platformId}}",
  "eventType": "api_call",
  "endpoint": "/api/v1/products",
  "flagTriggered": false,
  "actionTaken": "none"
}
```

**Field notes**
- `eventType`: `api_call` | `endpoint_probe` | `scrape_pattern` | `rapid_action` | `permission_violation`
- `actionTaken`: `none` | `throttled` | `session_limited` | `blocked` | `reverification_required`

**Assertions**
- HTTP `201` or `200`.
- Response contains `id`, `sessionId`, `identityId`, `platformId`, `eventType`, `endpoint`, `flagTriggered`, `actionTaken`, `createdAt`.
- Save `id` as `{{behavioralEventId}}`.

**Negative case**
- Missing `x-api-key` → `401`.
- Invalid `eventType` → `400`.

---

### B.3.2 Log Behavioral Event with Flag

- **Method:** `POST`
- **URL:** `{{baseUrl}}/v1/access/behavioral`
- **Headers:**
  - `Content-Type: application/json`
  - `x-api-key: {{apiKey}}`
- **Body:**

```json
{
  "sessionId": "{{sessionId}}",
  "identityId": "{{identityId}}",
  "platformId": "{{platformId}}",
  "eventType": "endpoint_probe",
  "endpoint": "/admin/secrets",
  "flagTriggered": true,
  "flagType": "unauthorized_endpoint_access",
  "actionTaken": "blocked"
}
```

**Assertions**
- HTTP `201` or `200`.
- Response `flagTriggered` is `true`.
- Response `flagType` is `unauthorized_endpoint_access`.
- Response `actionTaken` is `blocked`.

---

### B.3.3 Get Session Behavioral Events

- **Method:** `GET`
- **URL:** `{{baseUrl}}/admin/access/behavioral/session/{{sessionId}}`
- **Headers:** `Content-Type: application/json`

**Assertions**
- HTTP `200`.
- Response is an array.
- Every item has `sessionId === {{sessionId}}`.
- Array length matches the number of behavioral events logged against this session.

**Negative case**
- Random session UUID → `200` with empty array (or `404`).

---

### B.3.4 Behavioral Exploit Detection Sequence

1. Create a session.
2. Log three flagged behavioral events in sequence:
   - `eventType: endpoint_probe`, `endpoint: /admin/config`, `flagTriggered: true`, `actionTaken: throttled`
   - `eventType: scrape_pattern`, `endpoint: /api/v1/content`, `flagTriggered: true`, `actionTaken: session_limited`
   - `eventType: rapid_action`, `endpoint: /api/v1/actions`, `flagTriggered: true`, `actionTaken: blocked`
3. End the session with `verdict: terminated`, `terminationReason: behavioral_flags`.
4. Fetch all behavioral events for the session.

**Assertions**
- All three events are returned in `GET /admin/access/behavioral/session/{{sessionId}}`.
- Each event has `flagTriggered: true`.
- Session `sessionVerdict` is `terminated`.
- An audit log exists for the session termination.

---

## Postman Environment Variables Summary

| Variable | Example | Purpose |
|---|---|---|
| `baseUrl` | `http://localhost:3000` | API root |
| `platformId` | `uuid` | Platform ID |
| `apiKey` | `tl_test_...` | Valid platform API key |
| `identityId` | `uuid` | Identity under test |
| `deviceId` | `uuid` | Resolved device ID |
| `ipId` | `uuid` | Resolved IP record ID |
| `sessionId` | `uuid` | Created session ID |
| `accessEventId` | `uuid` | Created access event ID |
| `behavioralEventId` | `uuid` | Created behavioral event ID |
