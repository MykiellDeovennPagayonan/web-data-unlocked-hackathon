# Demo Flow 1 — The Free-Tier Abuser

## The Story

A bad actor discovers that **API Store** gives every new account 50 free API calls per endpoint. Rather than pay, they create a second account with a different email, exhaust another 50 free calls, then a third, a fourth. Same laptop, same IP, different aliases.

To them it looks like a harmless exploit of a free trial system. What they don't realize is that TrustLayer is watching every registration — not just the email, but the device fingerprint and IP address behind each one. The moment a pattern emerges, TrustLayer links all those aliases to a single identity and starts building a suspicion score.

By the time that same person walks over to **Job Board** and tries to apply for jobs, TrustLayer already knows who they are. They get two applications through — then on the third, they're quietly throttled. No error, no explanation that makes sense to them. Just a wall.

---

## The Actors

- **The Bad Actor** — an individual trying to exploit the free API trial by registering under multiple email aliases
- **API Store** — the platform being abused; loses revenue from unpaid API calls
- **Job Board** — a completely separate platform that unknowingly inherits the risk profile TrustLayer built on API Store
- **TrustLayer** — the intelligence layer sitting invisibly between both platforms

---

## What Happens, Step by Step

### Step 1 — First Registration on API Store

The bad actor signs up on API Store as `user1@gmail.com`. Normal registration. TrustLayer receives a signal from API Store at the moment of signup:

- The browser sends a **device fingerprint** — a hash built from canvas rendering, WebGL, user-agent, screen resolution, timezone, and language. This becomes the `Device.stableHash` in TrustLayer.
- The **IP address** is logged and evaluated — is it residential, a datacenter, a VPN, or a known proxy?
- A new `Identity` is created in TrustLayer, linked to this device and IP.
- Trust score starts at **50** (neutral baseline).

The user gets their 50 free calls, uses them, and moves on.

### Step 2 — Second and Third Registrations

The bad actor registers again as `user2@protonmail.com`, then `user3@outlook.com`. Different email providers. Different names. But the same laptop, the same browser, the same IP.

TrustLayer receives the same device fingerprint hash on each registration. It recognizes the device. Each new email that registers from an already-seen device gets flagged as an **EntityAlias** — a new identity that is linked back to the original with high confidence.

At this point TrustLayer fires a `TrustSignal` of type `behavioral_flag` with negative weight against the canonical identity. The trust score starts dropping.

By the third account the pattern is clear: one device, three emails, 150 free API calls consumed. TrustLayer has now assigned this device a risk score and flagged it.

### Step 3 — Trust Score Crosses the Threshold

After three registrations from the same device fingerprint and IP, TrustLayer's computed trust score for this identity drops below the threshold. The scoring is simple: each `behavioral_flag` signal carries a negative weight. Stack enough of them and the score floors.

The identity is now marked with `TrustStatus: flagged` in TrustLayer. Any platform in the TrustLayer network that queries this identity will get back a low trust score.

### Step 4 — The Bad Actor Moves to Job Board

The bad actor — or the same person using the same laptop — creates an account on **Job Board**. They use yet another email, but the same device and IP.

Job Board is integrated with TrustLayer. At registration, it sends the same device fingerprint and IP. TrustLayer immediately recognizes the device. It returns the flagged identity record and the low trust score.

Job Board doesn't block them at registration — the score is below the hard-block threshold but not in the hard-block zone. The user gets in.

### Step 5 — Two Applications Go Through

The user starts applying for jobs. Job Board checks with TrustLayer on each application submission. The trust score is low but not zero, so the first two applications are allowed through with a soft flag attached internally.

### Step 6 — The Third Application Is Throttled

On the third job application, Job Board's TrustLayer integration returns the current trust score. The platform's configured rule kicks in: **users below this score threshold are limited to 2 job applications**. The third attempt is rejected.

The user sees a message like: *"You've reached the application limit for your account. Please contact support to continue."*

They don't know why. There's no mention of TrustLayer. There's no accusation. But the damage they could have done — spamming dozens of employers — has been prevented.

---

## What This Demonstrates

### The Network Effect
API Store and Job Board are separate companies with separate databases. Neither one has any native way to know what the user did on the other platform. TrustLayer is the only thing connecting the dots. This is the core value proposition in action — **one platform's bad actor becomes every platform's protected risk**.

### Device Intelligence
The user changed their email three times. They could have used a VPN and changed their IP. But the browser fingerprint is much harder to spoof without significant effort. TrustLayer catches the pattern that email-level checks completely miss.

### Proportional Response
The user isn't banned from Job Board. They're throttled. TrustLayer's architecture supports `flagged`, `limited`, and `blocked` — the platform chose `limited`. This is realistic: a job board wouldn't hard-ban someone for having a suspicious API usage pattern. They'd quietly limit them and monitor.

### Bright Data's Role
When the IPs associated with these accounts are evaluated, TrustLayer uses Bright Data's **Proxy Network** in reverse — not to scrape, but to identify whether incoming IPs belong to known datacenter ranges, VPN providers, or residential addresses. A user registering from a datacenter IP is a strong signal even before the device fingerprint links come in.

---

## The Moment to Show in the Demo

1. Open API Store. Register as User 1. Use 50 free calls. Show the usage counter hit 50.
2. Register as User 2 (same browser, different email). Use 50 more calls.
3. Register as User 3. Show the usage counter again.
4. Switch to Job Board. Register with a new email (same browser).
5. Apply to Job 1. Success.
6. Apply to Job 2. Success.
7. Apply to Job 3. **Throttled.** Show the error message.
8. Pull up the TrustLayer dashboard. Show the identity with three aliases, the device fingerprint match, the trust score trajectory, and the flagged status.

The punchline: *three platforms, one bad actor, zero coordination between the platforms, and TrustLayer caught it anyway.*
