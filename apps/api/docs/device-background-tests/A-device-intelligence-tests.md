# A. Device Intelligence API Tests

Covers `devices`, `device_signals`, and `ip_records`.

---

## Environment Variables Needed

| Variable | How to obtain |
|---|---|
| `baseUrl` | Your local / staging API root |
| `apiKey` | `POST /v1/platform/api-keys` using a platform's ID |

---

## A.1 Devices

### A.1.1 Resolve Device (Create New)

- **Method:** `POST`
- **URL:** `{{baseUrl}}/v1/intelligence/device`
- **Headers:**
  - `Content-Type: application/json`
  - `x-api-key: {{apiKey}}`
- **Body:**

```json
{
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
}
```

**Assertions**
- HTTP `201` or `200`.
- Response has shape:

```json
{
  "device": {
    "id": "uuid",
    "stableHash": "sha256",
    "firstSeenAt": "...",
    "lastSeenAt": "...",
    "riskScore": 0,
    "isFlagged": false
  },
  "isNew": true
}
```

- Save `device.id` as `{{deviceId}}`.

---

### A.1.2 Resolve Device (Existing — Signal Drift)

- **Method:** `POST`
- **URL:** `{{baseUrl}}/v1/intelligence/device`
- **Headers:**
  - `Content-Type: application/json`
  - `x-api-key: {{apiKey}}`
- **Body:**

```json
{
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
}
```

**Test intent:** Only `user_agent` changed. The stable hash (computed from canvas, webgl, screen, os, timezone) should still match.

**Assertions**
- HTTP `201` or `200`.
- `isNew` is `false`.
- `device.id` equals `{{deviceId}}`.
- `device.lastSeenAt` is newer than `firstSeenAt`.

---

### A.1.3 Resolve Device (Stable Hash Changed)

- **Method:** `POST`
- **URL:** `{{baseUrl}}/v1/intelligence/device`
- **Headers:**
  - `Content-Type: application/json`
  - `x-api-key: {{apiKey}}`
- **Body:**

```json
{
  "signals": [
    { "signalType": "user_agent", "value": "Mozilla/5.0" },
    { "signalType": "os", "value": "Windows" },
    { "signalType": "browser", "value": "Firefox" },
    { "signalType": "screen_resolution", "value": "1920x1080" },
    { "signalType": "timezone", "value": "America/New_York" },
    { "signalType": "language", "value": "en-US" },
    { "signalType": "canvas_hash", "value": "xyz789canvas" },
    { "signalType": "webgl_hash", "value": "uvw012webgl" }
  ]
}
```

**Assertions**
- HTTP `201` or `200`.
- `isNew` is `true`.
- `device.id` is **different** from `{{deviceId}}`.
- Save this new ID as `{{deviceId2}}`.

---

### A.1.4 Get Device by ID (Admin)

- **Method:** `GET`
- **URL:** `{{baseUrl}}/admin/devices/{{deviceId}}`
- **Headers:** `Content-Type: application/json`

**Assertions**
- HTTP `200`.
- `id` matches `{{deviceId}}`.
- `stableHash` is a 64-char hex string.

**Negative case**
- Random UUID → `404` (or `200` with `null`).

---

### A.1.5 Update Device Risk Score

*(If exposed via admin or service call)*

- **Method:** `PATCH` or `POST` (whichever your admin route uses)
- **URL:** `{{baseUrl}}/admin/devices/{{deviceId}}/risk`
- **Headers:** `Content-Type: application/json`
- **Body:**

```json
{ "riskScore": 75 }
```

**Assertions**
- HTTP `200`.
- Response `riskScore` equals `75`.

**Edge cases**
- `riskScore: -10` → clamped to `0`.
- `riskScore: 150` → clamped to `100`.

---

### A.1.6 Flag / Unflag Device

- **Method:** `PATCH` or `POST`
- **URL:** `{{baseUrl}}/admin/devices/{{deviceId}}/flag`
- **Headers:** `Content-Type: application/json`
- **Body:**

```json
{ "isFlagged": true }
```

**Assertions**
- HTTP `200`.
- `isFlagged` is `true`.

**Audit check**
- An `audit_logs` row exists with `action: 'device_flagged'` or similar.

---

## A.2 IP Records

### A.2.1 Lookup IP (New)

- **Method:** `POST`
- **URL:** `{{baseUrl}}/v1/intelligence/ip`
- **Headers:**
  - `Content-Type: application/json`
  - `x-api-key: {{apiKey}}`
- **Body:**

```json
{
  "ipAddress": "1.1.1.1"
}
```

**Assertions**
- HTTP `200` or `201`.
- Response contains `id`, `ipAddress`, `ipType`, `country`, `region`, `asn`, `riskScore`, `lastEvaluatedAt`, `createdAt`.
- Save `id` as `{{ipId}}`.

---

### A.2.2 Lookup IP (Existing — Updates Timestamp)

- **Method:** `POST`
- **URL:** `{{baseUrl}}/v1/intelligence/ip`
- **Headers:**
  - `Content-Type: application/json`
  - `x-api-key: {{apiKey}}`
- **Body:**

```json
{
  "ipAddress": "1.1.1.1"
}
```

**Assertions**
- HTTP `200`.
- `id` equals `{{ipId}}` (same record returned).
- `lastEvaluatedAt` is newer than before.

---

### A.2.3 Lookup IPv6

- **Method:** `POST`
- **URL:** `{{baseUrl}}/v1/intelligence/ip`
- **Headers:**
  - `Content-Type: application/json`
  - `x-api-key: {{apiKey}}`
- **Body:**

```json
{
  "ipAddress": "2001:4860:4860::8888"
}
```

**Assertions**
- HTTP `200`.
- `ipAddress` stored correctly (Prisma `INET` handles both v4 and v6).

---

### A.2.4 Lookup Invalid IP

- **Method:** `POST`
- **URL:** `{{baseUrl}}/v1/intelligence/ip`
- **Headers:**
  - `Content-Type: application/json`
  - `x-api-key: {{apiKey}}`
- **Body:**

```json
{
  "ipAddress": "not-an-ip"
}
```

**Assertions**
- HTTP `400 Bad Request` (class-validator `@IsIP()` should reject).

---

### A.2.5 Get IP Record by IP (Admin)

- **Method:** `GET`
- **URL:** `{{baseUrl}}/admin/ip/1.1.1.1`
- **Headers:** `Content-Type: application/json`

**Assertions**
- HTTP `200`.
- `ipAddress` equals `"1.1.1.1"`.

---

## A.3 Auth & Scoping

### A.3.1 Missing API Key on Device Resolution

- **Method:** `POST`
- **URL:** `{{baseUrl}}/v1/intelligence/device`
- **Headers:** `Content-Type: application/json` (no `x-api-key`)
- **Body:** valid `ResolveDeviceDto`

**Assertions**
- HTTP `401 Unauthorized`.

---

### A.3.2 Missing API Key on IP Lookup

- **Method:** `POST`
- **URL:** `{{baseUrl}}/v1/intelligence/ip`
- **Headers:** `Content-Type: application/json` (no `x-api-key`)
- **Body:** `{ "ipAddress": "8.8.8.8" }`

**Assertions**
- HTTP `401 Unauthorized`.

---

## Postman Environment Variables Summary

| Variable | Example | Purpose |
|---|---|---|
| `baseUrl` | `http://localhost:3000` | API root |
| `apiKey` | `tl_test_...` | Valid platform API key |
| `deviceId` | `uuid` | Created / resolved device ID |
| `deviceId2` | `uuid` | Second distinct device ID |
| `ipId` | `uuid` | Created IP record ID |
