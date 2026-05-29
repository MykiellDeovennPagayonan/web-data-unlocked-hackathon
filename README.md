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

### Lower-resource mode (WSL)

By default, file watcher polling is disabled in `docker-compose.yml` to avoid high WSL CPU/RAM/disk usage on Windows-mounted paths.

- Default (recommended): keep `CHOKIDAR_USEPOLLING` unset.
- Only if file changes are not detected: set `CHOKIDAR_USEPOLLING=true` for your session.

For routine development, start only required services instead of the full stack:

```bash
docker compose up -d postgres redis api web
```

For E2E in constrained machines, run low-I/O mode:

```bash
bash scripts/e2e-low-io.sh
```

This avoids `--build`, disables polling, runs headless, and writes Playwright artifacts to `/tmp` instead of `/mnt/d`.

Inside `test/e2e`, the default `pnpm test` now uses low-I/O settings automatically.
Use `pnpm run test:debug` only when you need HTML report/video/trace artifacts.

### Demo flow commands

Use these when you want to check only one demo scenario instead of the full matrix:

```bash
pnpm demo:e2e:help
pnpm demo:e2e:cleanup
pnpm demo:e2e:flow1
pnpm demo:e2e:flow2
pnpm demo:e2e:flow3
pnpm demo:e2e:flow45
pnpm demo:e2e:stress
pnpm demo:e2e:all
```

Each flow command runs cleanup first, then writes results to `.tmp/demo-e2e-results.json` and evidence files under `.tmp/demo-evidence/`.

Command summary:

- `pnpm demo:e2e:help` - print the available demo commands with one-line descriptions
- `pnpm demo:e2e:cleanup` - clear stale demo data before a run
- `pnpm demo:e2e:flow1` - run Flow 1 free-tier abuse
- `pnpm demo:e2e:flow2` - run Flow 2 fake job company
- `pnpm demo:e2e:flow3` - run Flow 3 bot scraper attack
- `pnpm demo:e2e:flow45` - run Flow 4 and Flow 5 certificate verification
- `pnpm demo:e2e:stress` - run the abuse and stress probes
- `pnpm demo:e2e:all` - run the full demo matrix

### Important for WSL performance

Running large monorepos from `/mnt/d/...` causes high metadata I/O in WSL. For heavy E2E/agent runs, prefer a Linux-native path:

```bash
mkdir -p ~/work
cd ~/work
git clone /mnt/d/projects/work/reelist8/web-data-unlocked-hackathon web-data-unlocked-hackathon
cd web-data-unlocked-hackathon
```

Then run your E2E commands from `~/work/...` to reduce host disk active time.
