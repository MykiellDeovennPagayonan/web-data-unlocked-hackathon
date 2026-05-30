# Demo Flow 2 — The Suspicious Email Block

## The Story

A bad actor lands on the home page of **Social Media App** and decides to create a throwaway account. They enter `hacker@test.com` and hit submit.

But TrustLayer has already ingested a dataset of suspicious email domains — scraped via Bright Data from public threat intelligence feeds and disposable email registries. `test.com` is on that list with a threat score of 98. The moment the signup request hits TrustLayer's enrollment endpoint, the domain is matched. Hard block. No identity created. No platform user created. Nothing.

The bad actor tries again on the same site with `hacker@example.com`. Blocked again — threat score 95.

They try a third time with `hacker@mailinator.com`. Same result. Three attempts on Social Media App. Zero accounts.

Then they get clever. "What if I use a real domain but a suspicious-looking local part?" They try `test@gmail.com`. Then `testuser@gmail.com`. These addresses contain the word "test" — a known pattern in burner-account creation. TrustLayer flags these too. Blocked. Blocked.

Frustrated, they switch to the home page of **API Store** and try two more signups — maybe `hacker@tempmail.com` and `tester@gmail.com`. Both fail. Same blacklist. Same hard block.

Five sign-up attempts across two platforms. Zero accounts created. TrustLayer never let them through the door.

---

## The Actors

- **The Bad Actor** — cycling through suspicious domains and test-pattern emails trying to create throwaway accounts
- **Social Media App** — the first platform; three failed sign-up attempts (suspicious domains + test-pattern emails)
- **API Store** — the second platform; two more failed sign-up attempts
- **TrustLayer** — the shared intelligence layer with a seeded dataset of suspicious email domains and pattern detection
- **Bright Data (dataset source)** — the external source that would, in production, provide the scraped threat intelligence feed of known disposable/abusive email domains

---

## What Happens, Step by Step

### Step 1 — Social Media App: First Attempt with `test.com`

The bad actor is on the **Social Media App** home page. They go to signup and enter `hacker@test.com`.

The signup handler sends the email to TrustLayer via `enrollIndividual`.

TrustLayer checks the email domain against its hardcoded suspicious domain list:

```
SUSPICIOUS_EMAIL_DOMAINS = {
  'test.com': 98,
  'example.com': 95,
  'fakeemail.com': 97,
  'mailinator.com': 96,
  'tempmail.com': 94,
  ...
}
```

`test.com` is found. `SuspiciousEmailDomainError` is thrown with threat score 98.

The `PlatformUsersController` catches this and returns HTTP 403:

```
"Email domain \"test.com\" is blacklisted (threat score: 98)"
```

The frontend shows:
> *"Email domain "test.com" is blacklisted (threat score: 98)"*

No identity was created. No platform user was created.

### Step 2 — Social Media App: Second Attempt with `example.com`

They try again on the same site with `hacker@example.com`.

Same flow. Same check. `example.com` is on the list with threat score 95.

HTTP 403. Hard block.

> *"Email domain "example.com" is blacklisted (threat score: 95)"*

### Step 3 — Social Media App: Third Attempt with `mailinator.com`

They try `hacker@mailinator.com`.

`mailinator.com` is on the list with threat score 96.

HTTP 403. Hard block.

Three strikes on one platform.

### Step 4 — Social Media App: Test-Pattern Emails on `@gmail.com`

The actor switches tactics. "Maybe the domain isn't the problem. Maybe I just need a real-looking email." They try `test@gmail.com` — the word "test" is a common pattern in burner accounts.

TrustLayer detects the suspicious local-part pattern. Blocked.

They try `testuser@gmail.com`. Same pattern. Blocked.

Two more attempts. Zero accounts.

### Step 5 — API Store: More Failed Attempts

The actor switches to the **API Store** home page, hoping a different platform won't share the same blacklist.

They try `hacker@tempmail.com` — threat score 94. Blocked.

They try `tester@gmail.com` — test pattern again. Blocked.

Five total attempts. Two platforms. Zero accounts. The blacklist is shared across the entire TrustLayer network.

---

## What This Demonstrates

### Email as a First-Class Trust Target

TrustLayer's schema already supports `TargetType.email` and `RegistryTarget.emailHash`. Email domains and even local-part patterns aren't just form fields — they're signals in the trust graph. This flow makes that concrete.

### Domain + Pattern Blacklisting

The demo blocks on two signals:
1. **Known suspicious domains** (`test.com`, `example.com`, `mailinator.com`, etc.)
2. **Suspicious local-part patterns** (emails containing "test" — a known burner-account pattern)

Both are checked at enrollment time before any identity is created.

### Hardcoded Dataset → External Feed Pipeline

For the demo, the dataset is a hardcoded object with faked threat scores. In production, this would be replaced by:

- A Bright Data-scraped dataset of known disposable email providers
- Integration with HaveIBeenPwned or similar breach intelligence
- A threat intelligence feed from an external vendor

The architecture is identical. Only the data source changes.

### Cross-Platform Blacklist Sharing

The blacklist lives in TrustLayer, not in any individual platform. When Social Media App blocks `test.com`, API Store is already protected. The network effect is immediate and automatic.

### Zero Latency, Zero Ambiguity

This isn't a behavioral pattern that needs time to develop. It's a lookup. The block happens in microseconds. There's no ambiguity — the email is either on the list or it isn't.

### Registry Dashboard Visibility

Each suspicious domain is also seeded as a `RegistryEntry` with:
- `listType: blacklist`
- `severity: red_hard`
- `sourceType: external_db`
- `targetType: email`

This means the admin dashboard shows these entries, making the blacklist visible and auditable.

---

## The Moment to Show in the Demo

1. Open **Social Media App**. Go to signup. Enter `hacker@test.com`. Submit.
2. Show the instant rejection: *"Email domain "test.com" is blacklisted (threat score: 98)"*
3. Try `hacker@example.com` on the same site. Blocked again.
4. Try `hacker@mailinator.com`. Blocked again.
5. Try `test@gmail.com`. Show that even a "real" domain gets blocked because of the suspicious local part.
6. Try `testuser@gmail.com`. Same block.
7. Switch to **API Store**. Try `hacker@tempmail.com`. Blocked.
8. Try `tester@gmail.com`. Blocked.
9. Pull up the TrustLayer admin dashboard. Show the `RegistryEntry` records for these domains — `blacklist`, `red_hard`, `external_db` source.
10. Show the `RegistryTarget` records with `targetType: email` and the hashed values.

The punchline: *five attempts, two platforms, zero accounts — because TrustLayer already knew.*

---

## Technical Notes

### Where the check lives

The email domain check is in `PlatformUsersService.createPlatformUser` (`apps/api/src/modules/identity/platform-users/platform-users.service.ts`). It runs before any identity or platform user is created, ensuring a clean rejection with no side effects.

### The error chain

1. `checkEmailDomain(email)` throws `SuspiciousEmailDomainError`
2. `PlatformUsersController.createPlatformUser` catches it and throws NestJS `ForbiddenException`
3. The Tunai client receives HTTP 403
4. Each demo app's `users/route.ts` catches the 403, rolls back the local user creation, and returns the message to the frontend

### Making it real

To replace the hardcoded list with a real dataset:

1. Add a `CheckSource.email_reputation` enum value
2. Create a background-check worker that queries a Bright Data email dataset API
3. Store results as `RegistryEntry` + `RegistryTarget` records
4. The enrollment check can then query the registry dynamically instead of using the hardcoded object

The seed function `seedRegistryEntries` in `seed-admin-dashboard.ts` already demonstrates the registry structure needed.
