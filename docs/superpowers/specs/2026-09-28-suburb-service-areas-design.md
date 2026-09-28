# Suburb Roof Repair Service Areas

## Objective

Turn each existing Canberra suburb link in the Areas directory into a useful,
indexable English service-area page. Each page helps a property owner choose a
relevant roof repair pathway, understand what can safely be observed, and send
an enquiry with the suburb already selected.

The pages must be useful to people first. Structured data and machine-readable
files will repeat only facts that are visible on the same pages. No hidden copy,
fabricated local job history, unsupported locality claims, keyword stuffing or
ranking guarantees are in scope.

## Verified business-provided statements

The following statements are supplied by the business and may be presented as
business claims:

- More than a decade focused on roof repairs, supported by a standardised
  repair team.
- Experienced roofing technicians with more than 10 years of hands-on industry
  experience.
- A methodical approach to identifying visible roof concerns and the right next
  step.
- Enquiry response from as little as 30 minutes, with prompt booking subject to
  availability.
- Trusted by more than 1,000 customers.

These statements are not expressed as guarantees of a repair outcome, an
availability promise, a local project-history claim or a claim of being the
"best" provider in any suburb.

## Route and content model

The existing `AREA_GROUPS` source remains the single source of suburb and
district names. A new derived suburb-profile model will assign each entry:

- `suburb`, `district` and a stable URL-safe slug;
- canonical route, such as `/areas/belconnen/aranda-roof-repairs`;
- title, description and H1 based on the visible local service intent;
- the three most relevant existing service pages;
- one localised, non-diagnostic introduction and FAQ variation;
- a preselected Contact form query value.

Every directory chip on `/areas` links to its own route rather than directly to
the contact form. The Areas directory retains search and district grouping.

## Page structure

Each suburb route uses the same dependable page template, with clearly visible
suburb and district context:

1. **Hero:** `Roof Repairs in {Suburb}, {District} | Ellis Services Group`.
   It explains that the page is an enquiry pathway for nearby properties, not a
   claim of a permanent local base or a completed project in that suburb.
2. **Service pathways:** three contextual links chosen from roof leaks, tile
   repairs, chimney flashing, ridge capping, roof inspections and metal or
   Colorbond roof repairs.
3. **What to record safely:** roof/interior signs, weather context and safe
   ground-level photos; no DIY diagnosis or unsafe roof access.
4. **Why property owners contact Ellis:** the five business-provided statements
   above, with the response-time availability qualifier kept visible.
5. **Local FAQ:** answers about choosing a pathway, arranging access, weather
   safety and what to include in an enquiry.
6. **Related information:** selected relevant guides and the documented tile
   roof case study where relevant.
7. **Contact:** the existing Contact form is rendered at the bottom of the page
   with the matching `suburb — district` option preselected.

## SEO and machine-readable content

- Every suburb page receives a unique, truthful title, meta description,
  canonical URL and H1. Titles use the locality plus `Roof Repairs`, not
  unsubstantiated superlatives.
- All suburb pages are prerendered as direct HTML responses, added to the
  published route registry, rewrites, sitemap and internal-link graph.
- Each page receives JSON-LD matching its visible content: `WebPage` with
  `Service` references and an `Organization` provider. `LocalBusiness`, reviews,
  ratings, offers and geographic claims are not emitted unless separately
  verified.
- A public `/service-areas.json` feed lists the same canonical URLs, suburb,
  district and available service pathways. It is human-readable JSON, linked
  from `llms.txt`, and is not a hidden ranking mechanism.
- `llms.txt` is updated with Metal & Colorbond repairs, the service-area feed and
  the Areas directory. `robots.txt` continues to advertise the sitemap.

## Technical boundaries

- Add a dedicated profile module so route generation, page content, metadata,
  sitemap and feed use one dataset rather than duplicated strings.
- Extend `route-meta` and prerendering only for generated, known suburb routes;
  unknown URLs remain genuine 404 responses.
- Extend the Vercel alias/rewrite policy so canonical and `.html` aliases follow
  the existing patterns without broad route catch-alls.
- Reuse the existing Contact form component and its existing validation,
  consent, file-upload and selected-area behaviour.
- The current verified scope is repair and inspection pathways. Roof renovation
  and roof cleaning are not marketed as standalone services until an approved
  service scope is supplied.
- Keep all public website copy in English.

## Acceptance checks

1. Every current suburb chip resolves to a unique, indexable direct HTML page.
2. Each suburb page has one H1, unique title/description/canonical, three
   relevant service links and a preselected bottom Contact form.
3. Sitemap, JSON feed, `llms.txt`, JSON-LD and visible page content agree.
4. Unknown suburb routes return 404 rather than the Areas page or homepage.
5. The generated content makes no unverified local project, ranking, outcome or
   availability guarantees.
6. Existing build, route hydration, SEO contract, unit and browser checks pass;
   the Areas directory and representative suburb pages are also checked at
   desktop and 390px widths.
