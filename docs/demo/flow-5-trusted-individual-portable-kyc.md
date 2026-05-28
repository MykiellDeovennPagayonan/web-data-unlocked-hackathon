# Demo Flow 5 — The Trusted Individual

## The Story

A real person has been a member of **Social Media App** for a while. They've gone through identity verification — KYC — on that platform. Their government ID was checked, their liveness was confirmed, their email is verified. TrustLayer issued them a Trust Certificate: a portable, signed credential that says this is a real, verified human identity.

Now they want to sign up for **API Store** to access developer tools. API Store normally requires individuals to go through their own onboarding before they can generate API keys and start making calls. But this person already went through verification on Social Media App.

Instead of filling out forms and waiting again, they present their TrustLayer Trust Certificate hash at signup. API Store calls TrustLayer to verify it. The certificate is valid, issued to a verified individual identity. API Store creates their account already marked as verified — no onboarding friction, no repeated KYC, instant access to the platform.

---

## The Actors

- **The Verified Individual** — a real person who completed KYC on Social Media App and now wants frictionless access elsewhere
- **Social Media App** — the platform where identity was originally established and verified
- **API Store** — the destination platform; accepts the certificate instead of requiring its own verification process
- **TrustLayer** — the identity authority that issued the certificate and verifies it on demand

---

## What Happens, Step by Step

### Step 1 — The Individual Completes KYC on Social Media App

The user signs up on Social Media App and voluntarily goes through identity verification. This is a **VerificationRequest** through TrustLayer with `verificationType: government_id` and `verificationType: liveness`. Both checks pass.

TrustLayer creates a `TrustSignal` of type `kyc_passed` with positive weight and updates the `Identity.isHumanVerified = true`. The trust score rises significantly — a verified human is a fundamentally more trustworthy signal than an anonymous registration.

The individual's `TrustStatus` is updated to `verified`.

### Step 2 — TrustLayer Issues a Trust Certificate

With a verified identity and a trust score above the issuance threshold, TrustLayer generates a **Trust Certificate** for this individual:

- `TrustCertificate.entityType: identity`
- `TrustCertificate.status: active`
- `TrustCertificate.certificateHash` — a signed hash anchored to their verified identity record
- `TrustCertificate.blockchainTxHash` — tamper-proof, independently auditable
- `TrustCertificate.expiresAt` — time-limited; the individual must renew periodically to maintain certified status

The user can see their certificate on Social Media App's profile page. It looks like a verified badge — but it's more than that. It's a portable credential they own and can take anywhere in the TrustLayer network.

### Step 3 — The Individual Goes to Sign Up on API Store

The user navigates to API Store to create an account. The standard individual signup form is there — name, email, password, bio, location, website.

But there is also an alternative path: **"Already verified? Present your TrustLayer Certificate."**

The user pastes their certificate hash.

### Step 4 — API Store Verifies the Certificate

API Store's signup handler calls TrustLayer's certificate verification endpoint with the submitted hash. TrustLayer checks:

- Does this certificate exist? **Yes.**
- Is it `status: active`? **Yes.**
- Is it expired? **No.**
- Is the certificate's `identityId` linked to an identity with `isHumanVerified: true` and `trustStatus: verified`? **Yes.**

TrustLayer returns `verdict: valid` along with the verified identity's `entityType: identity`.

API Store creates the user account with `isVerified: true` — no email confirmation loop, no manual review, no additional KYC step required. The user lands directly in their dashboard.

### Step 5 — Instant Access, No Friction

The user can immediately generate an API key and start making calls. The 50 free trial calls are available right away. There's no waiting period.

Their API Store profile shows a "TrustLayer Verified" indicator — visible to organizations whose endpoints this individual consumes. Those organizations can see they're dealing with a real, verified human — not an anonymous API caller who could be a bot or a fraudster.

---

## What This Demonstrates

### KYC Should Happen Once

The current state of the internet is that every platform that wants to verify a user's identity runs its own KYC process — separately, expensively, and in complete isolation from every other platform. A person who has verified their identity on five platforms has done KYC five times. TrustLayer breaks that pattern. Verification is done once, the certificate is issued, and every subsequent platform that accepts it skips the process entirely.

This is a direct cost saving for platforms (KYC is expensive) and a direct friction reduction for users (KYC is annoying).

### The Certificate as User-Owned Identity

The certificate belongs to the user, not to Social Media App. Social Media App cannot revoke the user's ability to present it to other platforms. This is a meaningful shift from how platform identity typically works — where each platform owns your verified status on their system and it goes nowhere else. TrustLayer makes verified identity portable and user-sovereign.

### Trust Flows Both Ways

This flow is the individual parallel to Flow 4's organizational story. Together they show that TrustLayer's certificate system works for both people and companies. The same mechanism — `TrustCertificate`, `CertificateVerification`, blockchain anchoring — applies uniformly. A judge watching both flows sees a coherent, complete system, not two separate features.

### What Isn't Shared

It's worth being explicit: API Store doesn't receive any personal information from Social Media App. The certificate verification tells API Store that the identity behind the certificate hash is verified and clean. It does not reveal what that person posted, who they follow, what their email is (unless the user chooses to provide it in the signup form), or anything else about their behavior on Social Media App. The platforms remain data-isolated. TrustLayer is the bridge, not a data pipe.

---

## The Moment to Show in the Demo

1. Open Social Media App. Show the user's profile with a "TrustLayer Verified" badge. Show the certificate in their account settings — hash, issued date, expiry.
2. Copy the certificate hash.
3. Navigate to API Store's individual signup page. Show the standard form.
4. Switch to the "Present Certificate" path. Paste the hash.
5. Submit. Show the instant account creation — `isVerified: true`, no additional steps.
6. Show the user landing directly in the dashboard with their API key available immediately.
7. Pull up the TrustLayer dashboard. Show the `CertificateVerification` log — API Store verified the certificate, verdict `valid`, the individual's `isHumanVerified` and `trustStatus` confirmed.

The punchline: *verified once, trusted everywhere — without any platform knowing anything about the others.*
