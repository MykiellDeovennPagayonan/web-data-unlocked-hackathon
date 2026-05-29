# Demo Flow 3 — The Bot Scraper Attack

## The Story

A bot operator targets **Social Media App** — a content platform with a public feed full of posts, comments, and user profiles. The goal is to scrape it clean: harvest user data, content, and emails at machine speed to resell or repurpose.

The bot hammers the API. Hundreds of requests per minute, all from IPs belonging to a datacenter range. No human browses like this. TrustLayer notices immediately — the request velocity, the endpoint patterns, the IP signatures all point to automated scraping.

TrustLayer flags the IPs, fires behavioral anomaly signals, and blacklists the offending address range. Social Media App starts returning blocks.

Then the bot operator pivots. Same infrastructure, same IPs, new target: **Job Board**. They want to scrape job listings and applicant data. But Job Board is also integrated with TrustLayer. The moment the first request arrives from one of those IPs, TrustLayer recognizes it — already blacklisted from the Social Media App incident. The bot never gets a single response. It is blocked before it touches a single route.

---

## The Actors

- **The Bot Operator** — running automated scrapers against content platforms to harvest data at scale
- **Social Media App** — the first target; the platform where TrustLayer first detects and flags the attack
- **Job Board** — the second target; a completely separate platform that is protected automatically because of what TrustLayer learned from Social Media App
- **TrustLayer** — the shared intelligence layer that carries the IP blacklist from one platform to the other
- **Bright Data (inverted role)** — Bright Data's Proxy Network is used by TrustLayer to identify that the attacking IPs belong to known datacenter ASN ranges — the same infrastructure Bright Data uses for legitimate scraping, here turned into a detection signal

---

## What Happens, Step by Step

### Step 1 — The Bot Hits Social Media App

The bot operator points their scraper at Social Media App's public feed and post endpoints. The requests look like this from the outside: same user-agent string repeated, no browser fingerprint signals, request intervals measured in milliseconds, sequential pagination through every post on the platform.

TrustLayer receives an `AccessEvent` for each request. The IP is evaluated:

- **IP type check via Bright Data Proxy Network:** The IP resolves to a known datacenter ASN — not a residential address. `IpRecord.ipType` is set to `datacenter`. This alone is a soft signal.
- **Request velocity check:** Hundreds of `api_call` events per minute from the same IP against the same set of endpoints. TrustLayer fires a `BehavioralEvent` of type `scrape_pattern`.
- **Endpoint probe detection:** The bot cycles through paginated endpoints methodically. Another `BehavioralEvent` fires with type `endpoint_probe`.

Each behavioral flag carries a negative weight into the trust score for this IP. After the first cluster of flags, the `IpRecord.riskScore` crosses the threshold.

### Step 2 — TrustLayer Blacklists the IP Range

TrustLayer doesn't just flag the single IP — it evaluates the ASN. Multiple IPs from the same datacenter block are all showing the same scraping patterns. TrustLayer creates a `RegistryEntry` of type `blacklist` with `sourceType: behavioral` covering the IP range.

Each IP in the range gets `IpRecord.isBlacklisted = true`. The `AccessVerdict` for all subsequent requests from these IPs is set to `blocked`.

Social Media App starts returning blocks. The scraper hits a wall.

### Step 3 — The Bot Pivots to Job Board

The bot operator doesn't know why they're blocked. They assume it's Social Media App's own rate limiting. They point the same scraper infrastructure — same datacenter IPs — at Job Board instead. Job listings are valuable data. Applicant information is more valuable still.

The first request arrives at Job Board from one of the blacklisted IPs.

### Step 4 — Instant Block, Zero Latency

Job Board queries TrustLayer on every incoming request as part of its IP intelligence check. TrustLayer looks up the IP: `isBlacklisted = true`, `riskScore` near maximum, active `RegistryEntry`. The `AccessVerdict` is `blocked` before the request is processed.

The bot operator gets nothing. No job listings. No applicant data. No response worth scraping.

They have no idea that the reason they're blocked on Job Board is because of what they did on Social Media App. To them, two unrelated platforms both suddenly stopped working. From TrustLayer's perspective, one known bad actor tried the same attack twice.

---

## What This Demonstrates

### Real-Time IP Intelligence
TrustLayer evaluates IPs at access time using behavioral signals combined with Bright Data's infrastructure intelligence. A datacenter IP is a signal. That same IP paginating through every endpoint in sequence is a pattern. The combination is a confident verdict, reached in real time.

### The Bright Data Inversion
This is a sharp moment for judges who know what Bright Data is: the same proxy network infrastructure that powers legitimate web scraping is used here *as a detection signal*. Bright Data knows what datacenter ranges look like because they operate at that scale. TrustLayer uses that knowledge to identify when those ranges are being weaponized. The tool that enables scraping also enables protection against scraping.

### Zero-Config Cross-Platform Protection
Job Board's team did nothing special to be protected from this attacker. They didn't configure a block list. They didn't know Social Media App was under attack. They simply integrated TrustLayer, and the shared intelligence did the rest. This is the network effect at its most automatic — protection that improves passively as more platforms join.

### Behavioral Detection, Not Just IP Lists
The block isn't just "this IP is on a list." It was earned through observed behavior — scrape patterns, endpoint probing, request velocity — logged as `BehavioralEvent` records and weighted into a score. Static blocklists go stale. TrustLayer's behavioral layer catches attackers even when they rotate to fresh IPs, because the patterns are consistent.

---

## The Moment to Show in the Demo

1. Open Social Media App. Show the public feed with posts.
2. Simulate the bot attack — run a script that fires 50+ rapid requests to `/api/posts` and `/api/feed` from a single IP.
3. Show the TrustLayer dashboard lighting up: `BehavioralEvent` entries for `scrape_pattern` and `endpoint_probe`, `IpRecord.riskScore` climbing, then the `RegistryEntry` being created with `blacklist` status.
4. Show Social Media App returning blocks for subsequent requests.
5. Point the same script at Job Board — same IP, no other changes.
6. Show the immediate block on the first request — no behavioral events needed this time, the IP is already known.
7. Pull up the TrustLayer registry entry. Show that one behavioral detection event on Social Media App automatically protected Job Board.

The punchline: *the attacker changed targets — TrustLayer didn't have to.*
