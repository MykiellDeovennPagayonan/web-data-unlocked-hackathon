# TrustLayer

A shared intelligence layer for identity trust and access security.

TrustLayer evaluates people, devices, emails, IPs, and organizations in real time, so you can grant the right access with confidence. The platform provides a Trust Gateway for identity and policy evaluation, Trust Certificates for verified identities, and a comprehensive dashboard for monitoring trust decisions.

## Project Structure

- **apps/api** - Backend API server with PostgreSQL and Redis
- **apps/web** - Next.js web application with landing page and admin dashboard

## Local Setup

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

4. Start the web app:

```bash
pnpm --filter web dev
```

## Docker Setup

Run the full stack:

```bash
docker compose up --build
```

The compose stack starts PostgreSQL, Redis, the backend, and the web app.

For routine development, start only required services:

```bash
docker compose up -d postgres redis api web
```

By default, file watcher polling is disabled in `docker-compose.yml` to avoid high WSL CPU/RAM/disk usage on Windows-mounted paths.

- Default (recommended): keep `CHOKIDAR_USEPOLLING` unset.
- Only if file changes are not detected: set `CHOKIDAR_USEPOLLING=true` for your session.
