# Suburb Service Areas Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish useful, truthful service-area pages for every existing Canberra suburb and make the complete roof repair, renovation, cleaning, gutter and downpipe-maintenance scope clear across the site.

**Architecture:** A single JavaScript catalog will own the approved service names, slugs and routes; a derived suburb-profile module will turn the existing `AREA_GROUPS` entries into stable local routes and page data. React, the head manager, prerenderer, discovery files and tests will consume those modules so the directory, 77 pages, sitemap, JSON feed and structured data cannot drift.

**Tech Stack:** React 19, TypeScript, Vite SSR/prerendering, Node test runner, Vitest, Playwright, Vercel static rewrites.

**Spec:** `docs/superpowers/specs/2026-09-28-suburb-service-areas-design.md`

## Global Constraints

- All public website copy is English.
- The five business-provided claims retain their qualifiers; no guarantee, ranking claim, fabricated local project history or fixed local-base claim is permitted.
- Approved service categories are roof repairs, roof renovation, roof cleaning, and gutter/downpipe cleaning and maintenance; copy must not imply unrelated work.
- Structured data and discovery feeds repeat only visible, matching facts; there is no hidden SEO content.
- Unknown or malformed suburb paths must keep returning a genuine 404.
- Keep the existing Contact form validation, consent, upload and selected-area behaviour.

## Review Focus

- Apostrophe and Unicode suburb names (such as `O’Connor` and `O’Malley`) produce stable ASCII paths and retain their correct visible labels; covered by Task 2 profile tests.
- Every profile is a valid, direct route with exactly one matching canonical URL and H1; covered by Task 3 route/head tests and Task 5 raw-HTML checks.
- The page’s full service list, selected form service options, JSON feed and JSON-LD stay aligned when a service is added; covered by Tasks 1, 4 and 5.
- An encoded separator, dot segment or invented suburb route cannot be normalised into an indexable page; covered by Task 3 hydration/404 tests and Task 5 HTTP checks.
- Static output is served by Vercel at canonical paths and does not accidentally rewrite assets, feeds, HTML aliases or unknown paths; covered by Task 5 deployment-style browser checks.

---

### Task 1: Establish the complete approved service catalog

**Files:**
- Create: `src/service-catalog.js`
- Modify: `src/contact-options.js:125-133`
- Modify: `src/main.tsx:1-430, 1394-1507`
- Modify: `src/route-meta.json`
- Modify: `vercel.json`
- Modify: `tests/enquiry-validation.test.mjs`
- Create: `tests/service-catalog.test.mjs`

**Interfaces:**
- Produces `SERVICE_CATALOG`, an ordered immutable list of `{ slug, title, path, shortLabel }`, and `SERVICE_TITLES` derived from it.
- Consumes the existing six service slugs and adds `roof-renovation`, `roof-cleaning`, and `gutter-downpipe-maintenance`.
- Produces three matching `Service` entries in `serviceSeed` and published route records for their `/services/...` paths.

- [ ] **Step 1: Write failing catalog and form-option tests**

```js
assert.deepEqual(SERVICE_TITLES.slice(-3), [
  "Roof Renovation",
  "Roof Cleaning",
  "Gutter & Downpipe Cleaning and Maintenance",
]);
assert.deepEqual(SERVICE_CATALOG.map(({ path }) => path).slice(-3), [
  "/services/roof-renovation",
  "/services/roof-cleaning",
  "/services/gutter-downpipe-maintenance",
]);
```

- [ ] **Step 2: Run the new test to verify it fails**

Run: `node --test tests/service-catalog.test.mjs`

Expected: FAIL because `src/service-catalog.js` and the three approved services do not exist.

- [ ] **Step 3: Implement the shared catalog and the three service pathways**

Create `src/service-catalog.js` as the sole ordered title/slug/path source. Make `contact-options.js` derive `SERVICE_TITLES` from it. Add narrowly scoped, English `serviceSeed` records for renovation, cleaning and gutter/downpipe maintenance with visible signs, assessment limits, scope, FAQ and related pathways. Add their cards, solution guidance, route metadata, canonical rewrites and Contact-service query support.

- [ ] **Step 4: Run service and enquiry validation tests**

Run: `node --test tests/service-catalog.test.mjs tests/enquiry-validation.test.mjs`

Expected: PASS; all nine service values are accepted and no invented service value is accepted.

- [ ] **Step 5: Commit the service catalog slice**

```bash
git add src/service-catalog.js src/contact-options.js src/main.tsx src/route-meta.json vercel.json tests/service-catalog.test.mjs tests/enquiry-validation.test.mjs
git commit -m "feat: add roof maintenance service pathways"
```

### Task 2: Build one derived suburb-profile source of truth

**Files:**
- Create: `src/suburb-profiles.js`
- Modify: `src/contact-options.js:1-123`
- Create: `tests/suburb-profiles.test.mjs`

**Interfaces:**
- Consumes `AREA_GROUPS` and `SERVICE_CATALOG`.
- Produces `SUBURB_PROFILES`, `getSuburbProfile(pathname)`, `getSuburbRoute(suburb, district)`, and `SUBURB_PATHS`.
- Each profile has `{ suburb, district, areaOption, slug, path, title, description, h1, featuredServiceSlugs, servicePaths }`.

- [ ] **Step 1: Write failing profile tests**

```js
assert.equal(SUBURB_PROFILES.length, 77);
assert.equal(getSuburbRoute("Aranda", "Belconnen"), "/areas/belconnen/aranda-roof-repairs");
assert.equal(getSuburbRoute("O’Connor", "Inner North & City"), "/areas/inner-north-city/o-connor-roof-repairs");
assert.equal(getSuburbProfile("/areas/belconnen/aranda-roof-repairs").areaOption, "Aranda — Belconnen");
assert.equal(new Set(SUBURB_PATHS).size, 77);
```

- [ ] **Step 2: Run the profile test to verify it fails**

Run: `node --test tests/suburb-profiles.test.mjs`

Expected: FAIL because no suburb-profile module exists.

- [ ] **Step 3: Implement profile derivation without local-history assertions**

Create `src/suburb-profiles.js`; normalize apostrophes, ampersands and whitespace to deterministic ASCII slugs, reject collisions at module load and derive all text from the profile fields. Select three featured services deterministically, expose every catalog path as `servicePaths`, and phrase the local introduction as an enquiry pathway for properties in or near the suburb rather than evidence of a project or office there.

- [ ] **Step 4: Point Areas directory links at generated suburb paths**

Replace the direct Contact links in `Areas()` with `getSuburbRoute(s, district)`, retaining area search, district grouping and visible suburb labels.

- [ ] **Step 5: Run profile tests**

Run: `node --test tests/suburb-profiles.test.mjs`

Expected: PASS with 77 unique profile paths, valid labels and the full nine-service link list per profile.

- [ ] **Step 6: Commit the profile and directory slice**

```bash
git add src/suburb-profiles.js src/contact-options.js src/main.tsx tests/suburb-profiles.test.mjs
git commit -m "feat: derive suburb service-area profiles"
```

### Task 3: Render, route and mark up suburb pages safely

**Files:**
- Modify: `src/main.tsx:1642-1685, 2470-2504`
- Modify: `src/route-meta.tsx`
- Modify: `src/document-route.ts`
- Modify: `src/route-meta.json`
- Modify: `src/styles.css`
- Modify: `tests/route-hydration.vitest.test.tsx`
- Create: `tests/suburb-pages.vitest.test.tsx`

**Interfaces:**
- Consumes `SUBURB_PROFILES`, `getSuburbProfile`, `SERVICE_CATALOG`, `ContactForm` and the base JSON route registry.
- Produces `SuburbServiceAreaPage({ profile })`, dynamic `publishedRoutes`/`pagePaths`, and head data that includes `serviceAreaSchema` only for generated suburb routes.

- [ ] **Step 1: Write failing page, head and 404 tests**

```tsx
expect(renderToString(<AppV3 pathname="/areas/belconnen/aranda-roof-repairs" />)).toContain("Roof Repairs in Aranda, Belconnen");
expect(getRouteHead("/areas/belconnen/aranda-roof-repairs").canonical).toBe("https://www.canberraroofkind.com.au/areas/belconnen/aranda-roof-repairs");
expect(renderToString(<AppV3 pathname="/areas/belconnen/not-a-suburb-roof-repairs" />)).toContain("<h1>Page not found</h1>");
```

- [ ] **Step 2: Run the new page test to verify it fails**

Run: `pnpm vitest run tests/suburb-pages.vitest.test.tsx`

Expected: FAIL because the route is not registered or rendered.

- [ ] **Step 3: Implement the reusable suburb page template and dynamic route registration**

Add `SuburbServiceAreaPage` with one locality-keyword H1, transparent local-coverage explanation, three featured pathways, a complete nine-service linked list, safe-observation guidance, the five provided business statements, localized FAQ wording, related guides/case study and `ContactForm` prefilled with `profile.areaOption`. Merge generated entries with the base JSON registry in `route-meta.tsx`; use the same generated paths in `document-route.ts` so SSR route markers are trusted only for known paths.

- [ ] **Step 4: Implement visible-content-matching JSON-LD**

Add one escaped `WebPage` schema object for each suburb route, with a `Service` `mainEntity` and the Ellis Services Group `Organization` provider. Keep area references limited to the page’s visible locality and do not emit ratings, offers, a local office, reviews or service-area claims not shown to users. Update `HeadManager` to replace this schema on client navigation and remove it from non-suburb pages.

- [ ] **Step 5: Apply responsive styles**

Add component-scoped styles for the featured pathway cards, compact full-service list, business-evidence panel, FAQ, guide rail and embedded Contact form; preserve readable 390px layout without an oversized blank panel.

- [ ] **Step 6: Run route and rendering tests**

Run: `pnpm vitest run tests/suburb-pages.vitest.test.tsx tests/route-hydration.vitest.test.tsx`

Expected: PASS; canonical aliases hydrate, a profile page has exactly one H1 and matching JSON-LD, malformed paths stay 404.

- [ ] **Step 7: Commit page rendering slice**

```bash
git add src/main.tsx src/route-meta.tsx src/document-route.ts src/route-meta.json src/styles.css tests/suburb-pages.vitest.test.tsx tests/route-hydration.vitest.test.tsx
git commit -m "feat: render local roof service area pages"
```

### Task 4: Generate public discovery files from the same route data

**Files:**
- Create: `scripts/site-routes.mjs`
- Create: `scripts/generate-discovery.mjs`
- Modify: `package.json`
- Modify: `public/sitemap.xml` (generated)
- Create: `public/service-areas.json` (generated)
- Modify: `public/llms.txt` (generated section)
- Modify: `scripts/verify-dist.mjs`
- Create: `tests/discovery-files.test.mjs`

**Interfaces:**
- `scripts/site-routes.mjs` consumes the base route registry and `SUBURB_PROFILES`, producing one ordered set of published canonical paths.
- `scripts/generate-discovery.mjs` writes the sitemap, public JSON feed and an `llms.txt` service-area section before Vite copies `public/` to `dist/`.

- [ ] **Step 1: Write failing discovery consistency tests**

```js
assert.equal(feed.serviceAreas.length, 77);
assert.deepEqual(feed.serviceAreas[0], {
  suburb: "Aranda",
  district: "Belconnen",
  url: "https://www.canberraroofkind.com.au/areas/belconnen/aranda-roof-repairs",
  servicePaths: SERVICE_CATALOG.map(({ path }) => path),
});
assert.ok(sitemapUrls.has(feed.serviceAreas[0].url));
assert.match(llms, /https:\/\/www\.canberraroofkind\.com\.au\/service-areas\.json/);
```

- [ ] **Step 2: Run discovery test to verify it fails**

Run: `node --test tests/discovery-files.test.mjs`

Expected: FAIL because no generated feed or shared generator exists.

- [ ] **Step 3: Implement deterministic discovery generation**

Create the Node-compatible route helper and generator. Run it before `vite build` in the build script. Generate valid XML with every canonical published public page except Privacy, JSON with only the public visible profile fields and service paths, and an English `llms.txt` section linking the Areas directory, feed and all nine services.

- [ ] **Step 4: Make distribution verification use the shared path list**

Replace the JSON-only `expectedPages` source in `scripts/verify-dist.mjs` with the shared route helper so it validates every generated suburb HTML document and its expected head fields.

- [ ] **Step 5: Run generator and discovery tests**

Run: `node scripts/generate-discovery.mjs && node --test tests/discovery-files.test.mjs`

Expected: PASS; generated source artifacts are deterministic and mutually consistent.

- [ ] **Step 6: Commit discovery slice**

```bash
git add scripts/site-routes.mjs scripts/generate-discovery.mjs scripts/verify-dist.mjs package.json public/sitemap.xml public/service-areas.json public/llms.txt tests/discovery-files.test.mjs
git commit -m "feat: publish service-area discovery feed"
```

### Task 5: Cover static delivery, SEO contracts and production output

**Files:**
- Modify: `vercel.json`
- Modify: `tests/fixtures/seo-routes.json`
- Modify: `tests/seo-contract.test.mjs`
- Modify: `tests/seo-browser.spec.js`
- Modify: `tests/service-intent-links.test.mjs`
- Modify: `tests/core-keyword-content.test.mjs`

**Interfaces:**
- Consumes `SUBURB_PATHS`, `SERVICE_CATALOG` and the generated discovery artifacts.
- Produces parameterised Vercel rewrite/redirect behavior for the two-segment suburb route shape and its `.html`/trailing-slash aliases without a broad fallback.

- [ ] **Step 1: Write failing static-route acceptance checks**

```js
assert.equal((await fetch(`${origin}/areas/belconnen/aranda-roof-repairs`)).status, 200);
assert.equal((await fetch(`${origin}/areas/belconnen/aranda-roof-repairs.html`, { redirect: "manual" })).status, 308);
assert.equal((await fetch(`${origin}/areas/belconnen/not-a-suburb-roof-repairs`)).status, 404);
assert.equal(document.querySelectorAll('script[type="application/ld+json"]').length, 1);
```

- [ ] **Step 2: Run the targeted SEO contract to verify it fails**

Run: `pnpm run build && pnpm run test:seo`

Expected: FAIL until local routes, aliases, sitemap and raw HTML assertions are implemented.

- [ ] **Step 3: Implement parameterised Vercel rewrite and alias rules**

Add rules constrained to `/areas/:district/:suburb-roof-repairs` and its canonical aliases, matching the project’s existing static-file policy. Do not introduce a catch-all rewrite; an unknown parameterised path must resolve to no static file and remain a 404, while system files remain unaffected.

- [ ] **Step 4: Update fixtures and end-to-end assertions**

Teach tests to calculate expected suburb route heads from the shared profile source instead of hand-maintaining 77 copies. Verify all directory chips are crawlable links, representative profiles cover different districts and Unicode names, all nine service paths appear on each local page, the form is preselected, and the JSON-LD/feed/sitemap agree.

- [ ] **Step 5: Run the full verification suite**

Run: `pnpm run build && pnpm run test && pnpm run test:seo && pnpm run test:browser`

Expected: PASS, including 77 prerendered suburb pages, correct direct HTML delivery and 390px browser coverage.

- [ ] **Step 6: Commit verification and delivery slice**

```bash
git add vercel.json tests/fixtures/seo-routes.json tests/seo-contract.test.mjs tests/seo-browser.spec.js tests/service-intent-links.test.mjs tests/core-keyword-content.test.mjs
git commit -m "test: verify local service area delivery"
```

### Task 6: Deploy and verify the production aliases

**Files:**
- No source changes expected.

**Interfaces:**
- Consumes the verified production build and existing Vercel project configuration.
- Produces a production deployment assigned to `www.canberraroofkind.com.au` and `canberraroofkind.com.au`.

- [ ] **Step 1: Run the final production build gate**

Run: `pnpm run build && pnpm run test && pnpm run test:seo`

Expected: PASS before deploying.

- [ ] **Step 2: Deploy the verified build**

Run: `pnpm dlx vercel@48.6.0 deploy --prod --yes`

Expected: successful production deployment for Vercel project `canberra-roofing`.

- [ ] **Step 3: Verify public canonical routes and discovery assets**

Run: `curl -I https://www.canberraroofkind.com.au/areas/belconnen/aranda-roof-repairs` and fetch the production sitemap plus `/service-areas.json`.

Expected: 200 for the canonical page/feed, an XML sitemap containing the canonical route, and an invalid local route returning 404.

- [ ] **Step 4: Commit deployment documentation only if an output artifact is added**

Do not create a source commit for deployment state alone.

## Self-Review

- **Spec coverage:** Task 1 implements all three newly confirmed service categories; Task 2 covers all existing suburb entries; Task 3 implements visible locality content, form and JSON-LD; Task 4 makes sitemap/feed/`llms.txt` agree; Task 5 protects static output and SEO contracts; Task 6 deploys and checks it.
- **Step scan:** Each task begins with a concrete failing assertion and ends with a narrow verification and commit. The interfaces define the cross-task names and data shape.
- **Type consistency:** `SERVICE_CATALOG` is the only service title/path source; `SUBURB_PROFILES` produces `SUBURB_PATHS`; these same values are consumed by React, Node scripts, Vercel generation and tests.
- **Review focus:** Unicode, route identity, catalog drift, hostile URLs and static Vercel delivery each have explicit owning tests.
- **Proportion:** The plan specifies interfaces, data ownership and exact acceptance checks without duplicating the implementation bodies or writing the 77 pages by hand.
