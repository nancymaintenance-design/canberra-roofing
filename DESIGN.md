---
version: alpha
name: "Ellis Services Group Canberra Roofing"
description: "An English-only, enquiry-led website for Canberra roof repairs, using practical trade cues and calm safety-first guidance."
colors:
  roof-charcoal: "#182328"
  steel: "#33454D"
  warm-white: "#F5F4EF"
  safety-orange: "#E85D2A"
  eucalyptus: "#5E7568"
  cloud: "#DDE3E2"
  on-dark: "#FFFFFF"
typography:
  sans:
    fontFamily: "Arial, Helvetica, Segoe UI, system-ui, sans-serif"
  display:
    fontFamily: "Arial Narrow, Arial, Helvetica, Segoe UI, system-ui, sans-serif"
rounded:
  control: "0.25rem"
  card: "0.375rem"
  media: "0.125rem"
spacing:
  section-gap: "clamp(3.5rem, 7vw, 7rem)"
  page-max: "1440px"
components:
  button: {}
  service-card: {}
  enquiry-form: {}
  navigation: {}
---

# Ellis Services Group Canberra Roofing Design System

## Overview

### Creative North Star

A well-organised roof-work site: dark workwear, clear safety-orange markings, legible job notes and the geometric line of a residential roof. The site should feel calm, direct and practical—not like a luxury real-estate brochure or a generic template.

### Product context and register

- **Audience and primary job:** Canberra property owners who need to describe a visible roof concern safely, identify the closest repair pathway and make an enquiry.
- **Target market(s) and evidence:** Canberra, ACT homeowners and local repair enquiries, reflected in site headings, service pages, contact details and service-area content.
- **Locale(s) and language policy:** English only across all customer-facing UI, editorial content, metadata, alt text, forms and calls to action. Do not display Chinese or add language switching.
- **Usage scene:** A mobile-first search journey, often after a visible leak, damaged tile or weather event. Users need reassurance and scannable next steps before detail.
- **Register:** A service-business marketing site with safety-first operational content. Clear and useful language takes priority over sales pressure.
- **Memorable signature:** Deep charcoal image overlays and a sharp safety-orange keyline, finished with the clipped roofline silhouette at the bottom of the hero.
- **Restraint:** Forms, safety guidance, addresses, service comparisons and legal/insurance facts remain plain, high-contrast and familiar.
- **Anti-references:** Avoid glossy property-development imagery, rounded SaaS dashboards, excessive glass effects, oversized empty colour fields and generic stock-photo card grids.
- **Token ownership/runtime mapping:** This file mirrors the existing canonical CSS custom properties in `src/styles.css`; it does not generate runtime tokens. The `:root` variables in that file are the source of truth.

## Colors

`roof-charcoal` is the primary dark surface and text anchor. `warm-white` is the main page surface, while `cloud` and `eucalyptus` create restrained background, divider and contextual layers. `safety-orange` is reserved for primary actions, critical keylines, selected emphasis and focus visibility. `on-dark` is used on charcoal and orange surfaces. Maintain the existing visible focus outline and never rely on colour alone for safety or validation states.

## Typography

Use the `display` stack for H1–H3, brand marks and short service labels; it is condensed, bold and built for large English keyword-led headings. Use `sans` for explanatory copy, forms and navigation. Headings may use sentence case or controlled uppercase labels; body copy should use direct English sentences. Keep line lengths narrow enough for mobile scanning and do not insert multilingual copy.

## Layout

Content is contained to `1440px` with a responsive section rhythm of `clamp(3.5rem, 7vw, 7rem)`. The standard desktop grid moves from three service cards to a single column at `640px`. Primary page media uses a 3:2 editorial split and collapses cleanly on mobile. Do not create spacing solely to make a section look dramatic; every large gap should be justified by a visual transition, map, image or action.

## Elevation & Depth

Hierarchy comes from charcoal-versus-warm-white contrast, thin cloud borders, orange edge markers and the existing `--shadow-lift` / `--shadow-hover` shadows. Use modest elevation on interactive service cards and image frames. Do not use shadows on long-form reading content, safety notices or dense form controls where a crisp border is clearer.

## Shapes

Use the existing control, card and media radii exactly: `0.25rem`, `0.375rem` and `0.125rem`. The language is deliberately near-square and trade-like. Orange rules, border-left signals and roofline geometry provide the expressive shape vocabulary; avoid pill-heavy UI.

## Components

### Foundational visual states

Buttons, links, service cards and form fields must expose a visible `:focus-visible` state. Hover may lift a card or deepen a button to charcoal, but keyboard focus must not depend on hover. Preserve semantic labels, error text and native input support. Reduced-motion preferences must suppress nonessential transforms and transitions.

### Buttons and actions

The orange `.button` is the primary action and should state the next real-world step, such as “Send an enquiry” or “Explore Metal & Colorbond Roof Repairs”. Underlined `.textAction` links are secondary. Keep icons to the trailing edge and retain text labels.

### Navigation and data display

The sticky charcoal navigation uses a thin orange base rule and a service popover for the full set of repair pathways. Service cards use a small sequence label, concise title, practical description and a clear route link. On small screens, the navigation must collapse without hiding telephone or contact access.

### Forms and overlays

Use conventional labelled controls, inline validation and explicit consent wording. File upload remains accessible through a visible button paired with the native input. Do not introduce decorative overlays that obscure field labels or safety text.

### Iconography

Use Lucide icons with their default outlined stroke style. Icons support—not replace—English labels. Maintain consistent sizing with the existing 16–18px action icons.

### Motion

Motion is brief and functional: service/image hover feedback and navigation state changes. Existing hover depth uses approximately 0.45 seconds; no autoplaying, parallax or attention-seeking motion. Honour `prefers-reduced-motion`.

### Content and data visualization

Use plain English, safety-first wording, specific service names and verified business facts. Do not imply an inspection result, repair scope, product affiliation or guaranteed outcome before assessment. If numerical data is shown, pair it with plain-language context and an accessible text alternative.

## Do's and Don'ts

- **Do:** Lead every indexable page with a precise English Canberra roof-repair term that matches the page's actual content.
- **Do:** Pair visual distinction with concrete, safe next-step guidance.
- **Don't:** Use Chinese or mixed-language customer-facing copy.
- **Don't:** Fill pages with repetitive keywords, oversized decorative areas or unverified claims.
