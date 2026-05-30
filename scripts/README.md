# Scripts

## DDoS Demo — Hackathon Attack Simulation

### Quick Demo (5 seconds each)

```bash
# Step 1: Attack Social Media → some requests allowed, then blocked
node scripts/ddos-demo.js --target social-media --same-ip --ip 203.0.113.99 --workers 5 --duration 5 --stream

# Step 2: Pivot to Job Board with same IP → instantly blocked (cross-platform intelligence)
node scripts/ddos-demo.js --target job-board --ip 203.0.113.99 --workers 1 --duration 5 --stream

# Step 3: Clean up bot data for next run
node scripts/ddos-cleanup.js
```

### Display Modes

- `--stream` — Log each request as it happens (good for video recording)
- `--no-clear` — Compact one-line stats updating in-place
- `--dashboard` — Full-screen live dashboard (default in terminal)

### Other Options

- `--target` — `social-media` | `job-board` | `api-store`
- `--ip` — Spoofed IP (default: random 203.0.113.x)
- `--workers` — Concurrent attack units (default: 5)
- `--duration` — Attack duration in seconds (default: 30)
- `--same-ip` — All workers share one IP (faster blacklist)
- `--help` — Show all options
