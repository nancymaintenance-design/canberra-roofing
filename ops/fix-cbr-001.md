# FIX-CBR-001 route and hydration remediation

Parent candidate: `e2368321a15fddb5798aa0304315c778f26f5065`.
Historical baseline: `9d7be39179bc50135ec7819eb72e680750c26fc2`.

The previous candidate served published `.html` files as HTTP 200 but passed the
alias pathname to React, which rendered a 404 and removed the canonical. It also
returned HTTP 404 for trailing-slash paths that React normalized into published
pages. Edge reproduced the `.html` mismatch with React error #418.

## Routing contract

- Published clean paths serve HTTP 200 without redirects. The existing sitemap
  remains 18 clean URLs; Privacy is the nineteenth published, self-canonical page.
- `/index.html` and `/index.html/` redirect directly to `/` with HTTP 308.
- Each other published page's `.html`, `/`, and `.html/` aliases redirect directly
  to its clean path with HTTP 308. All query parameters, including duplicate keys,
  are preserved. Destinations do not introduce a second hop.
- Existing `/insights` remains a temporary 307 to `/faq`; `/insights/` goes directly
  to the same destination. `/insights.html` is not a published HTML alias.
- Unknown paths remain HTTP 404 with the 404 body, no canonical, and noindex.
  There is no global cleanUrls/trailingSlash redirect and no homepage catch-all.
- Google verification and contact-unavailable HTML keep their original direct URLs.
- React recognizes only published aliases if a static host exposes the HTML
  without redirecting. It retains the content and clean canonical without changing
  the browser URL or query, and does not normalize unknown paths into known pages.

Exact sources in `vercel.json` intentionally bound redirects to the published
route set. Vercel documents permanent redirects as 308 and its routing converter
uses strict, case-sensitive source matching. The local acceptance server executes
these exact redirect and rewrite rules before serving files. It is an equivalent
server for this contract, not a simulation of the complete Vercel platform.

References checked 2026-09-05:
- https://vercel.com/docs/project-configuration/vercel-json
- https://github.com/vercel/vercel/blob/main/packages/routing-utils/src/superstatic.ts

## Reproduce and verify (Node 22)

```text
pnpm build
pnpm test
pnpm test:browser
node node_modules/@playwright/test/cli.js test --config playwright.routes.config.js
node scripts/verify-dist.mjs
```

The focused browser command is optional when the complete browser suite has run.
The regression suite checks all 19 pages and 56 permanent aliases, GET/HEAD query
preservation and one-hop termination, and unknown paths. Both desktop and mobile
Edge exercise actual React menu events before asserting hydrated body/head, and
capture page exceptions and React/hydration console errors. Static fallback tests
serve real built HTML without redirects while loading the real production bundle.
Contact alias tests verify area/service selection without sending a form.

Existing complete-body fixtures, SEO metadata, Contact tests and the mandatory
20-document anti-truncation build gate remain in place. Existing browser delivery
tests intercept requests locally with controlled responses; no real delivery is
authorized. New routing browser tests permit local GET requests only.

Local verification on 2026-09-05 used Node 22.23.2 and Microsoft Edge
152.0.4191.62: build and 20-document integrity gate passed; all 176 legacy tests,
74 unit tests and 103 browser tests passed (zero skipped or flaky tests).
On this Windows host, repeated Edge context setup stalled before page assertions.
The GET-only route tests now reuse one context per device and load a fresh document
on each navigation. Run the full suite with one worker on constrained hosts:
`node node_modules/@playwright/test/cli.js test --workers=1`.

## Release and rollback

This is an appended local source commit only. No push or deployment is authorized.
QA-CBR-002 must be rerun by the release auditor against the complete new SHA.
Real Vercel Preview/production HTTP acceptance remains unperformed and requires a
separately authorized release step. Passing local equivalence tests is not evidence
of a deployed platform result.

To undo this source change, use `git revert <FIX-CBR-001-SHA>` on the review branch,
or create a separate branch/worktree at the parent candidate. Do not reset away
unrelated work. Reverting restores the known routing defect, so the resulting
candidate remains blocked from release. The historical baseline is not a validated
deployable rollback artifact. A production rollback, if ever separately authorized,
must use the last verified complete deployment, including HTML, assets and routing.
