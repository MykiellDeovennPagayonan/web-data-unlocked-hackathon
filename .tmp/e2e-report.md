# E2E Report

Run ID: 2026-05-29T09-10-03-414Z
Duration: 166.6s

- [FAIL] Social media app: locator.waitFor: Timeout 10000ms exceeded.
Call log:
[2m  - waiting for getByText('Comment from Alice 2026-05-29T09-10-03-414Z') to be visible[22m

- [PASS] API Store demo: organization signup, endpoint creation, API key generation, proxy call, and mock top-up worked
- [LIMITATION] API Store payment flow: top-up is explicitly a mock payment flow; no real payment processor is wired in
- [FAIL] Job Board demo: page.waitForURL: Timeout 30000ms exceeded.
=========================== logs ===========================
waiting for navigation to "http://127.0.0.1:3003/dashboard/jobs" until "load"
============================================================

## Failures
- Social media app: locator.waitFor: Timeout 10000ms exceeded.
Call log:
[2m  - waiting for getByText('Comment from Alice 2026-05-29T09-10-03-414Z') to be visible[22m

    at runSocial (D:\projects\work\reelist8\web-data-unlocked-hackathon\.tmp\playwright-env\e2e-demo.cjs:167:75)
    at async main (D:\projects\work\reelist8\web-data-unlocked-hackathon\.tmp\playwright-env\e2e-demo.cjs:385:11)
- Job Board demo: page.waitForURL: Timeout 30000ms exceeded.
=========================== logs ===========================
waiting for navigation to "http://127.0.0.1:3003/dashboard/jobs" until "load"
============================================================
    at runJobBoard (D:\projects\work\reelist8\web-data-unlocked-hackathon\.tmp\playwright-env\e2e-demo.cjs:309:19)
    at async main (D:\projects\work\reelist8\web-data-unlocked-hackathon\.tmp\playwright-env\e2e-demo.cjs:387:11)