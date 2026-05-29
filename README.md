# web-data-unlocked-hackathon

Monorepo for the TrustLayer backend, admin web app, and demo apps.

## Local setup

1. Install dependencies:

```bash
pnpm install
```

2. Start the shared database and Redis:

```bash
docker compose up -d postgres redis
```

3. Start the backend:

```bash
pnpm --filter api start:dev
```

4. Seed the demo TrustLayer platform IDs and API keys:

```bash
pnpm --filter api exec ts-node --project tsconfig.scripts.json scripts/seed-demo-platforms.ts
```

5. Start the web app and demos:

```bash
pnpm --filter web dev
pnpm --filter social-media-app dev
pnpm --filter demo-api-store dev
pnpm --filter demo-job-board dev
```

## Docker setup

Run the full stack:

```bash
docker compose up --build
```

The compose stack starts PostgreSQL, Redis, the backend, the main web app, and all three demos. It also runs the TrustLayer demo seeding step so the demo apps receive real API keys and platform IDs.
