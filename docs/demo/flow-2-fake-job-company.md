# Demo Flow 2 — The Fake Job Company

## The Story

A bad actor registers a company on **Job Board**. The company looks real enough — a name, an email, a description. Within a short time, they've posted a wave of fake job listings: attractive titles, vague descriptions, designed to harvest resumes and personal data from unsuspecting applicants.

Applicants start noticing. The jobs lead nowhere. The interview requests feel off. People start hitting the Report button.

As community reports accumulate in TrustLayer, the organization's trust score collapses. TrustLayer blacklists it.

Then the same organization — or the person behind it — tries to register on **API Store**, a paid platform where organizations can sell their API endpoints to real developers. API Store uses TrustLayer for background checks on every organization that tries to sign up. The check comes back: this company is blacklisted. Registration denied.

So they try again under a fake name. A company that doesn't exist anywhere — no LinkedIn page, no Crunchbase entry, no news coverage, no business registry record. Bright Data scrapes all of it. Nothing comes back. TrustLayer returns a `not_found` verdict. Registration denied again.

---

## The Actors

- **The Bad Actor (Organization)** — running a fake company to harvest job applicant data from Job Board, and trying to exploit API Store's marketplace
- **Job Board** — the first platform to encounter the bad actor; becomes the source of the community intelligence that protects API Store
- **The Applicants** — real people who report suspicious job listings, unknowingly contributing to TrustLayer's intelligence network
- **API Store** — the high-stakes platform being protected; cannot afford to let fraudulent organizations sell API endpoints to its developer user base
- **TrustLayer** — the intelligence layer that carries the blacklist from Job Board to API Store, and runs the background check on the fake name attempt

---

## What Happens, Step by Step

### Step 1 — The Company Registers on Job Board

The bad actor creates an organization account on Job Board. The platform is not particularly strict — it allows organizations to register and start posting jobs without upfront verification. This is intentional; Job Board is a relatively open marketplace.

TrustLayer is notified of the new organization registration. It creates an `Organization` record and logs an `AccessEvent`. At this stage, the trust score is neutral (50). The organization posts jobs normally.

### Step 2 — The Fake Jobs Go Up

The organization starts posting job listings. They look legitimate at a glance — software engineer roles, marketing positions — but applicants who go through the process notice something is wrong. The job descriptions are copy-pasted and vague. The application process asks for unusually detailed personal information. Interview requests never materialize.

A small fraction of applicants hit the **Report** button on each job listing.

### Step 3 — Community Reports Accumulate in TrustLayer

Each report from a Job Board applicant is submitted to TrustLayer as a `CommunityReport` with:
- `targetType: organization`
- `category: fraud`
- `severity: medium`
- `reportingPlatformId: job-board`

TrustLayer's registry logic escalates the entry as reports accumulate:
- **1 report** → `RegistryEntry` created with severity `yellow_soft` — the org is monitored more closely
- **3 reports** → severity escalates to `orange_watch` — a `TrustSignal` of type `community_report` with negative weight fires against the org, dropping the trust score
- **5+ reports** → severity escalates to `red_hard` — the organization's `TrustStatus` is set to `blocked`, the registry entry is marked active, and a `TrustScoreSnapshot` records the score near 0

At this point the organization is **blacklisted** across the entire TrustLayer network.

### Step 4 — The Organization Tries to Register on API Store

The same organization (same name, same domain, same email) attempts to register on **API Store** as an organization that wants to sell API endpoints.

API Store is a paid, higher-stakes platform. It runs a TrustLayer background check on every organization at registration time. The background check does two things:

**Registry Lookup:** TrustLayer queries the `RegistryEntry` for this organization's domain and name hash. The blacklist entry from Step 3 is found. The check returns `overallVerdict: blocked`.

**Bright Data Background Scrape:** In parallel, TrustLayer's background check orchestrator uses Bright Data to pull live signals:
- LinkedIn Company Dataset — searched for the organization name. Results analyzed.
- Crunchbase Dataset — cross-referenced for funding history, incorporation date, employee count.
- SERP API — Google search for `"CompanyName" fraud OR scam OR fake` — surfaces any negative press.
- News Scraper — full article content analyzed by an LLM to determine if the company is a subject of fraud coverage.

Even if the registry lookup alone is enough to block them, the Bright Data results provide the evidence trail — showing exactly which sources flagged the company and why.

API Store receives the verdict: **blocked**. The registration is rejected.

The user sees: *"Your organization could not be verified. Please contact support."*

### Step 5 — They Try Again Under a Fake Name

The bad actor tries a different approach. They register a new organization account on API Store under a completely fabricated company name — one that has never existed anywhere online.

This time there's no registry entry. The name is clean. But TrustLayer still runs the background check.

Bright Data scrapes:
- **LinkedIn Company Dataset** — no company found
- **Crunchbase Dataset** — no entry found
- **Business Registry** — no incorporation record found
- **SERP** — no meaningful search results for the company name
- **Glassdoor** — no employee reviews, no org presence

Every source returns `not_found`. The background check's `normalizedVerdict` for each result is `not_found`. TrustLayer's orchestrator computes an overall verdict: a company with zero digital footprint across five independent sources is not a real company.

The `overallVerdict` is set to `flagged` (not `blocked` — it's not confirmed malicious, just unverifiable). API Store's configured rule for organizations is strict: **only verified or clean verdicts are allowed to register**. `flagged` and `blocked` are both rejected.

Registration denied again.

---

## What This Demonstrates

### Cross-Platform Community Intelligence
No single platform could have stopped this. Job Board had no reason to block the company — it only discovered the problem through user reports. API Store had no visibility into what happened on Job Board. TrustLayer is the shared memory that carries Job Board's community intelligence to API Store's front door.

### Bright Data as the Evidence Layer
The background check on the fake company name is where Bright Data's value is most visible to judges. It's not just a database lookup — TrustLayer is actively scraping LinkedIn, Crunchbase, business registries, and news sources **in real time** to answer the question: does this company actually exist? The answer, when it comes back empty across five sources, is definitive.

### The Two-Layer Defense
API Store is protected twice:
1. **Blacklist layer** — the known bad actor is caught by the registry entry from Job Board's community reports
2. **Verification layer** — the fake identity fallback is caught by the inability to corroborate existence through any public source

This mirrors how TrustLayer works in the real world: the blacklist catches known threats, the whitelist verification catches unknown ones.

### Proportional, Platform-Specific Rules
Job Board allowed the company to register without upfront verification — that's appropriate for a job marketplace. API Store requires a clean background check before allowing organizations to sell — that's appropriate for a paid marketplace. TrustLayer doesn't force a one-size-fits-all policy. Each platform configures its own strictness level. The intelligence is shared; the enforcement is platform-specific.

---

## The Moment to Show in the Demo

1. Open Job Board. Register the fake organization. Post 5–6 suspiciously vague job listings.
2. Switch to an applicant account. Apply to a job. Notice something is off. Hit **Report**.
3. Repeat with 2–3 more applicant accounts reporting the same org.
4. Pull up the TrustLayer dashboard. Show the `CommunityReport` entries accumulating. Show the registry severity escalating from `yellow_soft` → `orange_watch` → `red_hard`. Show the trust score collapsing.
5. Switch to API Store. Attempt to register the same organization (same name/domain).
6. Show the background check running — Bright Data sources lighting up (LinkedIn, Crunchbase, SERP).
7. Show the **rejection**: "Your organization could not be verified."
8. Try again with a completely fake company name.
9. Show Bright Data returning empty across all sources.
10. Show the **second rejection**.

The punchline: *Job Board's users protected API Store's developers — and the fake company never got a foothold on either platform.*
