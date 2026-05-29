#!/usr/bin/env bash
set -euo pipefail

export CHOKIDAR_USEPOLLING=false
export E2E_HEADED=false
export E2E_DEBUG_ARTIFACTS=false
export PLAYWRIGHT_OUTPUT_DIR=/tmp/playwright-output

docker compose up -d postgres redis db-setup api social-media-app demo-api-store demo-job-board
pnpm --filter e2e-tests test:low-io
