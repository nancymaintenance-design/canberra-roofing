# FIX-CBR-002 encoded-path routing consistency

Parent candidate: `32b8ae21a56b6ac4c14f5e586cfeef6c64e1bb02`.

## Root cause

The local acceptance server decoded its entire parsed pathname before matching
routes. That made encoded separators and dot segments become route syntax:
`/services%2Froof-leak-repairs`, `/%2e%2e/about`, and `/about%2ehtml` could
serve a published page. Conversely, the browser gave React the original encoded
pathname, so legal encodings such as `/%61bout` hydrated pre-rendered HTML as a
404 and removed its canonical. `new URL()` also normalizes encoded dot segments,
so checking only its pathname was too late. Separately, Windows static path
resolution collapsed `/about.html//` into an existing file.

## Contract

- Decode the raw request pathname exactly once only when it has no duplicate
  slash or percent-encoded `/`, `\\`, `%`, or `.`. Check the raw request before
  `new URL()` can normalize a dot segment.
- The client uses the same restriction before one decode, and then accepts only
  an exact published route or its established alias. Invalid percent escapes stay
  unresolved in the client; the acceptance server returns HTTP 400.
- Legal encodings of ordinary path characters may serve the published pre-rendered
  route and hydrate without a React mismatch. This is verified for `/%61bout`
  and `/services/r%6fof-leak-repairs`.
- Encoded slash, backslash, percent, dot, double encoding, encoded `.html`,
  duplicate slash, traversal and unknown paths do not serve a published page.
  They produce the normal 404 page (or 400 for malformed percent encoding), with
  no canonical. `/about.html//` is explicitly 404.

This deliberately does not add a global decode, redirect, catch-all rewrite, or
change Vercel routing configuration. The normal published route, alias, query,
Contact, SEO, sitemap and pre-render contracts remain the FIX-CBR-001 contract.

## Verification

Node 22.23.2 on 2026-09-05:

```text
pnpm build                         # 20-document verify-dist gate passes
pnpm test:legacy                   # 189 passed
pnpm test:unit                     # 84 passed
node node_modules/@playwright/test/cli.js test --workers=1  # 105 passed
node scripts/verify-dist.mjs       # 20 documents passed
```

The raw route contract uses a raw `node:http` request for unsafe cases so the
test can prove the server sees `/%2e%2e/about` before a client URL parser folds
it. Browser coverage uses real Edge for safe encoded page hydration and encoded
slash, `%25`, encoded `.html`, duplicate slash and unknown responses. Browser URL
parsers may normalize an encoded dot segment before sending it, so the raw HTTP
test covers that transport-level case instead of asserting a browser request that
was never sent.

No deployment, push, live form submission or email delivery is authorized. The
local acceptance server models the checked-in configuration only; authorized
Vercel Preview acceptance must retest actual encoded requests before release.

## Rollback

Undo this source change with `git revert <FIX-CBR-002-SHA>` or inspect its parent
in a separate worktree. That restores the known encoded-path vulnerability and
hydration defect, so it is not a release-ready result. Do not use the historical
baseline as a deployable rollback; any separately authorized production rollback
must use the last verified complete deployment.
