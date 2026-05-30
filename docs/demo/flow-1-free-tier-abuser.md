# Demo Flow 1 — The Free-Tier Abuser

## The Story

A bad actor discovers that **API Store** gives every new account 25 free API calls per endpoint. Rather than pay, they create a second account with a different email, exhaust another 25 free calls, then a third, a fourth. Same laptop, same IP, different aliases.

To them it looks like a harmless exploit of a free trial system. What they don't realize is that TrustLayer is watching every registration — not just the email, but the device fingerprint and IP address behind each one. The moment a pattern emerges, TrustLayer links all those aliases to a single identity and starts building a suspicion score.

By the time that same person walks over to **Job Board** and tries to sign up, TrustLayer already knows who they are. The signup is denied immediately. No error that makes sense to them. Just a wall.

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
- The **IP address** is logged and evaluated.
- A new `Identity` is created in TrustLayer, linked to this device and IP.
- Trust score starts at **50** (neutral baseline).

The user gets their 25 free calls, uses them, and moves on.

### Step 2 — Second Registration (Silent Tracking)

The bad actor registers again as `user2@protonmail.com`. Different email. Same laptop, same browser, same IP.

TrustLayer receives the same device fingerprint hash on this registration. It recognizes the device. TrustLayer creates an **EntityAlias** — linking this new identity back to the original canonical identity with high confidence.

At this stage the alias is logged but the actor is not blocked. The system is building a profile. The user gets their 25 free calls and moves on.

### Step 3 — Third Registration (The 10-Call Limit)

The bad actor registers again as `user3@outlook.com`. Same device, same IP. TrustLayer now sees **two aliases** tied to the same canonical identity. The pattern is undeniable.

A `behavioral_flag` TrustSignal is fired. The trust score drops from 50 to 10.

The user starts using their free API calls. But this time the system is watching. The free limit is capped at 10. On the **11th API call**, the request is **denied**.

The user sees: *"Access denied. Your account has been flagged for suspicious activity."*

### Step 4 — Fourth Registration (Hard Block)

Undeterred, the bad actor tries a fourth account. Same device, same IP, another new email.

At the moment of registration, TrustLayer looks up the device fingerprint. It finds the canonical identity with multiple aliases, a dropped trust score, and an active behavioral flag. This time, there is no ambiguity.

The signup request is **denied at registration**.

The user sees: *"You have been flagged for suspicious activity."*

They cannot create another account on API Store from this device.

### Step 5 — The Bad Actor Moves to Job Board (Hard Blocked)

The same person opens **Job Board** and tries to sign up with yet another email. Job Board also collects the device fingerprint and sends it to TrustLayer.

TrustLayer immediately recognizes the device. It finds the canonical identity with three aliases, a dropped trust score, and an active behavioral flag. This time, there is no ambiguity.

The signup request is **denied at registration**.

The user sees: *"You have been flagged for suspicious activity."*

They cannot create an account on Job Board from this device. The cross-platform network effect is immediate and total.

---

## What This Demonstrates

### The Network Effect
API Store and Job Board are separate companies with separate databases. Neither one has any native way to know what the user did on the other platform. TrustLayer is the only thing connecting the dots. This is the core value proposition in action — **one platform's bad actor becomes every platform's protected risk**.

### Device Intelligence
The user changed their email three times. They could have used a VPN and changed their IP. But the browser fingerprint is much harder to spoof without significant effort. TrustLayer catches the pattern that email-level checks completely miss.

### Proportional Response
The response escalates proportionally: Account 2 is silently tracked, Account 3 is limited on API calls, Account 4 and any cross-platform attempts are hard-blocked at registration. TrustLayer's architecture supports `flagged`, `limited`, and `blocked` — each platform can choose its response level based on the severity of the trust score.

### Bright Data's Role
When the IPs associated with these accounts are evaluated, TrustLayer uses Bright Data's **Proxy Network** in reverse — not to scrape, but to identify whether incoming IPs belong to known datacenter ranges, VPN providers, or residential addresses. A user registering from a datacenter IP is a strong signal even before the device fingerprint links come in.

---

## The Moment to Show in the Demo

1. Open API Store. Register as User 1 (`user1@gmail.com`). Use 25 free calls. Show the usage counter hit 25.
2. Register as User 2 (`user2@protonmail.com`, same browser, different email). Use 25 more calls. Nothing appears blocked yet.
3. Register as User 3 (`user3@outlook.com`). Start using free calls. Count up to **10**. On the 11th call, the request is **denied** with *"Access denied. Your account has been flagged for suspicious activity."*
4. Try to register as User 4. The signup form is **rejected immediately** with *"You have been flagged for suspicious activity."*
5. Switch to Job Board. Register with a new email (same browser). The signup is **rejected immediately** with *"You have been flagged for suspicious activity."*
6. Pull up the TrustLayer dashboard. Show the canonical identity with three aliases, the device fingerprint match, the trust score trajectory (50 → 30 → 10 → 0), the behavioral flags, and the progressive platform responses.

The punchline: *four accounts, two platforms, zero coordination, and TrustLayer caught every alias — progressively, proportionally, and automatically.*
