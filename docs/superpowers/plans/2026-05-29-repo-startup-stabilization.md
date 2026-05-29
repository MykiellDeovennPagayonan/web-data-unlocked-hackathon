# Repository Startup Stabilization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the backend, main frontend, and demo apps start reliably both locally and under Docker without missing-env failures.

**Architecture:** Keep the existing monorepo layout and app boundaries intact. Add only the bootstrap artifacts needed for reliable startup: per-app env files, a Docker Compose stack with the shared database and Redis dependencies, and a small amount of documentation so each service can be started with the right working directory and env file.

**Tech Stack:** pnpm workspaces, NestJS, Next.js, Vite, Prisma, Docker Compose, PostgreSQL, Redis

---

### Task 1: Inventory startup requirements and decide the bootstrap contract

**Files:**
- Modify: `docs/superpowers/plans/2026-05-29-repo-startup-stabilization.md`

- [ ] **Step 1: Confirm required startup inputs**

Required values discovered from the app code:
- `apps/api`: `PORT`, `DATABASE_URL`, `REDIS_URL`, `BRIGHT_DATA_API_KEY`, `BRIGHT_DATA_SERP_URL`, `BRIGHT_DATA_SANCTIONS_URL`
- `apps/web`: `TUNAI_API_BASE_URL` or `NEXT_PUBLIC_API_BASE_URL`
- `apps/demo/social-media-app`: `DATABASE_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `SEED_SECRET`, `TRUSTLAYER_API_URL`, `TRUSTLAYER_API_KEY`, `TRUSTLAYER_PLATFORM_ID`
- `apps/demo/api-store`: `DATABASE_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `TRUSTLAYER_API_URL`, `TRUSTLAYER_API_KEY`, `TRUSTLAYER_PLATFORM_ID`
- `apps/demo/job-board`: `DATABASE_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `UPLOADTHING_TOKEN`, `TRUSTLAYER_API_URL`, `TRUSTLAYER_API_KEY`, `TRUSTLAYER_PLATFORM_ID`

- [ ] **Step 2: Decide local defaults**

Use stable localhost defaults that match the current app ports and backend dependencies:
- API on `8090`
- Web on `3000`
- Social media demo on `3001`
- API store demo on `3002`
- Job board demo on `3003`
- PostgreSQL on `127.0.0.1:5501`
- Redis on `127.0.0.1:56380`

### Task 2: Add missing env files and make startup values explicit

**Files:**
- Create: `apps/api/.env`
- Create: `apps/web/.env.local`
- Create: `apps/web/.env.local.example`
- Create: `apps/demo/social-media-app/.env.local`
- Create: `apps/demo/api-store/.env.local`
- Create: `apps/demo/job-board/.env.local`

- [ ] **Step 1: Seed backend env**

Populate `apps/api/.env` with:
```dotenv
PORT=8090
DATABASE_URL="postgresql://user:trustlayer123@127.0.0.1:5501/trust-later"
REDIS_URL="redis://127.0.0.1:56380"
BRIGHT_DATA_API_KEY=""
BRIGHT_DATA_SERP_URL="https://api.brightdata.com/serp/google"
BRIGHT_DATA_SANCTIONS_URL="https://api.brightdata.com/datasets/v3/trigger"
```

- [ ] **Step 2: Seed web env**

Populate `apps/web/.env.local` and `apps/web/.env.local.example` with:
```dotenv
NEXT_PUBLIC_API_BASE_URL="http://localhost:8090"
TUNAI_API_BASE_URL="http://localhost:8090"
```

- [ ] **Step 3: Seed demo env placeholders**

Populate the demo app env files with safe local placeholders:
```dotenv
DATABASE_URL="postgresql://user:trustlayer123@127.0.0.1:5501/<demo-db-name>"
NEXTAUTH_URL="http://localhost:<port>"
NEXTAUTH_SECRET="your-secret-key-change-this-in-production"
TRUSTLAYER_API_URL="http://localhost:8090"
TRUSTLAYER_API_KEY="tl_your_api_key_here"
TRUSTLAYER_PLATFORM_ID="your-platform-id-here"
```

For `apps/demo/social-media-app/.env.local`, also include:
```dotenv
SEED_SECRET="dev-seed-secret"
```

For `apps/demo/job-board/.env.local`, also include:
```dotenv
UPLOADTHING_TOKEN="your-uploadthing-token-here"
```

- [ ] **Step 4: Keep env placeholders consistent with the seed script**

Make sure the demo `.env.local` files can be overwritten by `apps/api/scripts/seed-demo-platforms.ts` without changing file structure.

### Task 3: Add Docker support for the shared stack

**Files:**
- Create: `Dockerfile.api`
- Create: `Dockerfile.web`
- Create: `Dockerfile.demo`
- Create: `docker-compose.yml`
- Create: `.dockerignore`

- [ ] **Step 1: Containerize the API**

Build the API from the workspace root, install dependencies, copy the repo, and run `pnpm --filter api start:prod` after building.

- [ ] **Step 2: Containerize the Next.js apps**

Reuse a single Next.js Docker pattern for the main web app and each demo app. The container entrypoint must accept the app workspace name so the compose file can launch `web`, `social-media-app`, `demo-api-store`, and `demo-job-board` without duplicating Docker logic.

- [ ] **Step 3: Add compose services**

Define services for:
- `postgres`
- `redis`
- `api`
- `web`
- `social-media-app`
- `demo-api-store`
- `demo-job-board`

Expose the same ports used locally and wire the app services to the API/database dependencies.

- [ ] **Step 4: Wire startup order**

Use `depends_on` and health checks so app containers wait for PostgreSQL, Redis, and the API before starting.

### Task 4: Document the bootstrap sequence

**Files:**
- Modify: `README.md`
- Modify: `apps/api/README.md`
- Modify: `apps/web/README.md`
- Modify: `apps/demo/social-media-app/README.md`
- Modify: `apps/demo/api-store/README.md`
- Modify: `apps/demo/job-board/README.md`

- [ ] **Step 1: Document local startup**

Add the exact commands needed to:
- start PostgreSQL and Redis
- run the backend
- seed the demo TrustLayer platform IDs and API keys
- start the frontend and demo apps

- [ ] **Step 2: Document Docker startup**

Add one command for the full stack and one for rebuilding after env changes.

- [ ] **Step 3: List required secrets**

Call out that `BRIGHT_DATA_API_KEY` and `UPLOADTHING_TOKEN` are optional for basic startup but required for the affected features.

### Task 5: Validate the full stack

**Files:**
- None

- [ ] **Step 1: Build and run the API**

Run the API build and startup flow and confirm it listens on `8090`.

- [ ] **Step 2: Build and run the web app**

Run the web build and startup flow and confirm the admin dashboard loads with the configured API base URL.

- [ ] **Step 3: Build and run each demo app**

Run the social media, API store, and job board demos and confirm they can start with the seeded env files.

- [ ] **Step 4: Validate Docker**

Run `docker compose up --build` and confirm all services reach a running state with clean startup logs.

- [ ] **Step 5: Re-seed demo envs if needed**

If the backend creates new platform IDs or API keys, run the seed script again and confirm the `.env.local` files are updated in place.

