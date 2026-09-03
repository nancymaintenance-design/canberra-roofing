# Release checklist

This is a human-operated checklist. It does not authorize linking, deployment, environment entry, WAF publication, DNS changes, or a test email by itself.

## Candidate complete

- Confirm the candidate tests and production build pass.
- Confirm `package.json` pins Node 22 through `engines.node: "22.x"`.
- Confirm root `api/contact.js` uses Vercel's automatic official Node.js runtime. Do not add a `nodejs22.x` runtime field; confirm the dashboard Node setting later during an authorized release.
- Confirm `api/contact.js` has `maxDuration: 60`, providing platform headroom beyond Task 6's unchanged 10/10/15-second SMTP lifecycle for cleanup and response completion.
- Confirm no secrets, customer data, or non-empty environment values appear in the upload.

## Separate release gates

Complete and record each gate in order:

1. Candidate complete
2. Human acceptance
3. GitHub private upload
4. Preview
5. WAF publication
6. Production release
7. GoDaddy DNS
8. one authorized synthetic email
9. rollback evidence

## WAF publication record — do not publish from this document

At action time, select the approved project and create the rule with:

- Method POST
- Path `/api/contact`
- key source IP
- fixed window
- 5 requests
- 10 minutes
- deny
- status 429

Publish only after action-time confirmation from the authorized owner. Verify with honeypot requests 1–5, then confirm the edge-blocked sixth request returns 429 without sending mail or logging IP. Record only the approved rule values and redacted evidence.

## Preview and production checkpoints

- Use separately authorized Preview and Production environment entry by the owner; never copy values into this checklist.
- Before Production release, confirm the WAF record and the tested no-form fallback.
- After GoDaddy DNS action-time authorization, capture the prior DNS state for rollback.
- Send one authorized synthetic email only after the preceding gates complete, then retain only redacted evidence.
