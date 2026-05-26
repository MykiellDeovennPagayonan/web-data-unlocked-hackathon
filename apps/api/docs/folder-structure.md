# API Folder Structure

This document describes the organization of the `apps/api/src` codebase.

## Design Philosophy

This codebase follows three core conventions:

1. **Service is a thin orchestrator.** It imports method files from `service-methods/`, handles dependency injection, and delegates. No raw logic inline.

2. **Repository is a thin query layer.** It imports from `repository-ops/`, calls Prisma, and returns typed results. No business logic ever.

3. **One file, one function.** You open `service-methods/` and you instantly know every operation that module supports. Same with `repository-ops/`. Navigation becomes reading a directory.

## Overview

The API is built with [NestJS](https://nestjs.com/) and follows a **domain-driven module structure**. Each folder under `modules/` corresponds to a major functional domain in the TrustLayer system.

```
src/
├── main.ts                    # Application entry point
├── app.module.ts              # Root module, aggregates all domains
├── common/                    # Cross-cutting concerns
├── config/                    # Configuration files
├── prisma/                    # Database client & extensions
├── modules/                   # Domain modules (core business logic)
├── integration/               # External service integrations
└── jobs/                      # Background job processors
```

---

## Common (`common/`)

Shared utilities used across all modules.

| Folder | Purpose |
|--------|---------|
| `guards/` | Authentication & authorization guards (API key, JWT) |
| `decorators/` | Custom decorators (e.g., `@CurrentPlatform()`, `@CurrentIdentity()`) |
| `filters/` | Exception filters for consistent error responses |
| `interceptors/` | Request/response interceptors (e.g., audit logging) |
| `pipes/` | Validation and transformation pipes |

---

## Configuration (`config/`)

Environment and service-specific configuration.

| File | Purpose |
|------|---------|
| `database.config.ts` | Prisma/Postgres configuration |
| `redis.config.ts` | Redis/cache configuration |
| `brightdata.config.ts` | Bright Data MCP integration settings |

---

## Prisma (`prisma/`)

Database layer configuration and extensions.

| Folder/File | Purpose |
|-------------|---------|
| `prisma.module.ts` | NestJS module for Prisma client |
| `prisma.service.ts` | Prisma client service with connection management |
| `extensions/logging.extension.ts` | Query logging extensions |

---

## Domain Modules (`modules/`)

Each module is self-contained with its own controllers, services, repositories, DTOs, and the new subfolder pattern.

### Standard Sub-Module Anatomy

Every sub-module follows this structure:

```
{sub-module}/
├── {sub-module}.controller.ts      # HTTP route handlers
├── {sub-module}.service.ts         # Thin orchestrator (DI + method delegation)
├── {sub-module}.repository.ts      # Thin query layer (DI + op delegation)
├── entities/
│   └── {entity}.entity.ts          # Domain interfaces, Prisma type extensions
├── dto/
│   ├── create-{entity}.dto.ts    # Request validation
│   └── update-{entity}.dto.ts    # Update validation
├── service-methods/                # One file per operation
│   ├── create-{entity}.ts
│   ├── get-{entity}-by-id.ts
│   └── update-{entity}.ts
└── repository-ops/               # One file per query
    ├── insert-{entity}.ts
    ├── find-{entity}-by-id.ts
    └── update-{entity}.ts
```

---

### 1. Platform Management (`platform-management/`)

Manages platforms (tenants) using TrustLayer and their configurations.

**Tables covered:** `platforms`, `api_keys`, `platform_rules`, `webhook_delivery_logs`

| Subfolder | Structure | Purpose |
|-----------|-----------|---------|
| `platforms/` | entities/, service-methods/, repository-ops/ | Platform CRUD, onboarding, status management |
| `api-keys/` | entities/, service-methods/, repository-ops/ | API key generation, rotation, revocation |
| `platform-rules/` | entities/, service-methods/, repository-ops/, engine/ | Custom security rules per platform |
| `webhooks/` | entities/, service-methods/, repository-ops/ | Webhook delivery and retry logic |

**Key service-methods:** `create-platform.ts`, `get-platform-by-id.ts`, `update-platform-status.ts`, `update-strictness-level.ts`

**Key repository-ops:** `insert-platform.ts`, `find-platform-by-id.ts`, `find-platform-by-domain.ts`

---

### 2. Identity (`identity/`)

Global identity management and platform-local accounts.

**Tables covered:** `identities`, `platform_users`, `organizations`, `entity_aliases`

| Subfolder | Structure | Purpose |
|-----------|-----------|---------|
| `identities/` | entities/, service-methods/, repository-ops/ | Global identity records, trust status |
| `platform-users/` | entities/, service-methods/, repository-ops/ | Platform-local account linking |
| `organizations/` | entities/, service-methods/, repository-ops/ | Organization/entity identity management |
| `entity-aliases/` | entities/, service-methods/, repository-ops/ | Linking signals to canonical entities |

**Key service-methods:** `create-identity.ts`, `get-identity-by-email-hash.ts`, `update-trust-status.ts`, `link-certificate.ts`

---

### 3. Device Intelligence (`device-intelligence/`)

Device fingerprinting, IP intelligence, and signal collection.

**Tables covered:** `devices`, `device_signals`, `ip_records`

| Subfolder | Structure | Purpose |
|-----------|-----------|---------|
| `devices/` | entities/, service-methods/, repository-ops/ | Device fingerprinting and risk scoring |
| `device-signals/` | entities/, service-methods/, repository-ops/ | Individual signal storage (user agent, canvas hash, etc.) |
| `ip-records/` | entities/, service-methods/, repository-ops/ | IP intelligence, VPN/Tor detection, geo data |

**Key service-methods:** `resolve-or-create-device.ts`, `flag-device.ts`, `update-device-risk-score.ts`, `get-ip-intelligence.ts`

---

### 4. Access & Sessions (`access-sessions/`)

Access event logging, session management, and behavioral monitoring.

**Tables covered:** `access_events`, `sessions`, `behavioral_events`

| Subfolder | Structure | Purpose |
|-----------|-----------|---------|
| `access-events/` | entities/, service-methods/, repository-ops/ | Registration/login/API call event logging |
| `sessions/` | entities/, service-methods/, repository-ops/ | Session lifecycle and risk tracking |
| `behavioral-events/` | entities/, service-methods/, repository-ops/ | Suspicious in-session activity detection |

**Key service-methods:** `log-access-event.ts`, `start-session.ts`, `end-session.ts`, `evaluate-session-behavior.ts`

---

### 5. Background Checks (`background-checks/`)

Automated background checks against external sources.

**Tables covered:** `background_checks`, `background_check_results`

| Subfolder | Structure | Purpose |
|-----------|-----------|---------|
| `background-checks/` | entities/, service-methods/, repository-ops/, orchestrator/workers/ | Check orchestration and workflow |
| `background-check-results/` | entities/, service-methods/, repository-ops/ | Result aggregation and LLM summarization |

**Key service-methods:** `trigger-check.ts`, `finalize-check.ts`, `summarize-results-with-llm.ts`

**Workers:** `ofac-worker.ts`, `linkedin-worker.ts`, `sanctions-worker.ts`, etc.

---

### 6. Trust Engine (`trust-engine/`)

Trust scoring, signals, and portable trust certificates.

**Tables covered:** `trust_signals`, `trust_score_snapshots`, `trust_certificates`, `certificate_verifications`

| Subfolder | Structure | Purpose |
|-----------|-----------|---------|
| `trust-signals/` | entities/, service-methods/, repository-ops/ | Atomic trust signals (positive/negative) |
| `trust-score-snapshots/` | entities/, service-methods/, repository-ops/ | Point-in-time score recording |
| `trust-certificates/` | entities/, service-methods/, repository-ops/ | Certificate issuance and blockchain anchoring |
| `certificate-verifications/` | entities/, service-methods/, repository-ops/ | Verification logging when platforms check certs |

**Key service-methods:** `add-signal.ts`, `expire-signal.ts`, `compute-score-from-signals.ts`, `issue-certificate.ts`, `anchor-to-blockchain.ts`

---

### 7. Registry (`registry/`)

Blacklist/whitelist registry and community reporting.

**Tables covered:** `registry_entries`, `registry_targets`, `community_reports`

| Subfolder | Structure | Purpose |
|-----------|-----------|---------|
| `registry-entries/` | entities/, service-methods/, repository-ops/ | Core blacklist/whitelist records |
| `registry-targets/` | entities/, service-methods/, repository-ops/ | Links entries to specific entities |
| `community-reports/` | entities/, service-methods/, repository-ops/ | Platform-submitted bad actor reports |

**Key service-methods:** `create-entry.ts`, `escalate-severity.ts`, `submit-report.ts`, `accept-report.ts`

---

### 8. Compliance (`compliance/`)

Audit logging, consent management, and KYC workflows.

**Tables covered:** `audit_logs`, `consent_records`, `verification_requests`

| Subfolder | Structure | Purpose |
|-----------|-----------|---------|
| `audit-logs/` | entities/, service-methods/, repository-ops/ | Immutable action logging |
| `consent-records/` | entities/, service-methods/, repository-ops/ | GDPR/CCPA consent tracking |
| `verification-requests/` | entities/, service-methods/, repository-ops/ | KYC verification state management |

**Key service-methods:** `log-action.ts`, `record-consent.ts`, `revoke-consent.ts`, `approve-verification.ts`

---

## Integrations (`integration/`)

External service integrations.

| Folder | Purpose |
|--------|---------|
| `brightdata/` | Bright Data MCP server integration |
| `brightdata/scrapers/` | LinkedIn, news, SERP scrapers |
| `brightdata/unlocker/` | Web Unlocker API for CAPTCHA bypass |
| `kyc-providers/` | Jumio, Onfido, manual verification |

---

## Jobs (`jobs/`)

Background job processors (BullMQ).

| Folder | Purpose |
|--------|---------|
| `processors/` | Background check scoring, score recalculation, webhook delivery |

---

## Module Dependencies

```
app.module.ts
├── common (global)
├── config (global)
├── prisma (global)
├── platform-management
├── identity
├── device-intelligence
├── access-sessions
│   └── depends on: device-intelligence, identity, platform-management
├── background-checks
│   └── depends on: integration/brightdata, identity, trust-engine
├── trust-engine
│   └── depends on: identity
├── registry
│   └── depends on: trust-engine, identity, device-intelligence
├── compliance
│   └── depends on: identity, platform-management
├── integration
│   └── brightdata
└── jobs
    └── depends on: background-checks, trust-engine, platform-management
```

---

## Naming Conventions

| Convention | Example |
|------------|---------|
| Folders | `kebab-case` (e.g., `platform-management`, `trust-engine`) |
| Controller/Services | `kebab-case` with domain prefix (e.g., `platforms.service.ts`, `trust-signals.controller.ts`) |
| Classes | PascalCase with domain (e.g., `PlatformsService`, `TrustSignalsController`) |
| **service-methods files** | `kebab-case` action + entity (e.g., `create-platform.ts`, `get-identity-by-id.ts`) |
| **repository-ops files** | `kebab-case` operation + entity (e.g., `insert-platform.ts`, `find-identity-by-email-hash.ts`) |
| DTOs | `kebab-case` action + `dto` suffix (e.g., `create-platform.dto.ts`, `update-trust-status.dto.ts`) |

---

## Adding New Modules

1. Create folder under `modules/{module-name}/`
2. Create `{module-name}.module.ts` as the entry point
3. Add to `app.module.ts` imports
4. Create sub-modules with the full structure:
   ```
   {sub-module}/
   ├── {sub-module}.controller.ts (if HTTP API needed)
   ├── {sub-module}.service.ts
   ├── {sub-module}.repository.ts
   ├── entities/
   ├── dto/
   ├── service-methods/
   └── repository-ops/
   ```

---

## Thin Orchestrator Pattern

Services and repositories remain thin by delegating to individual method files.

### Service Example

```typescript
// platforms.service.ts
import { Injectable } from '@nestjs/common';
import { PlatformsRepository } from './platforms.repository';
import { createPlatform } from './service-methods/create-platform';
import { getPlatformById } from './service-methods/get-platform-by-id';

@Injectable()
export class PlatformsService {
  constructor(private readonly repository: PlatformsRepository) {}

  createPlatform = (input: CreatePlatformInput) => 
    createPlatform(this.repository, input);

  getPlatformById = (id: string) => 
    getPlatformById(this.repository, id);
}
```

### Repository Example

```typescript
// platforms.repository.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { insertPlatform } from './repository-ops/insert-platform';
import { findPlatformById } from './repository-ops/find-platform-by-id';

@Injectable()
export class PlatformsRepository {
  constructor(private readonly prisma: PrismaService) {}

  insert = (data: CreatePlatformData) => 
    insertPlatform(this.prisma, data);

  findById = (id: string) => 
    findPlatformById(this.prisma, id);
}
```

### Individual Method File

```typescript
// service-methods/create-platform.ts
import { PlatformsRepository } from '../platforms.repository';

export async function createPlatform(
  repository: PlatformsRepository,
  input: CreatePlatformInput
): Promise<Platform> {
  // Business logic lives here
  const platform = await repository.insert(input);
  // ... additional orchestration
  return platform;
}
```

This pattern gives you:
- **Clear navigation**: Every operation is a file you can jump to
- **Testability**: Each method is independently testable
- **NestJS compatibility**: DI still works through the thin service wrapper
