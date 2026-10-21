import React from "react";
import { POST_RAIN_SERVICE_HEADINGS } from './post-rain-content.js';

export const SERVICE_THEMES = [
  { id: "what-we-repair", title: "What we repair" },
  { id: "how-we-handle-it", title: "How we handle it" },
  { id: "project-photos", title: "Roof details & photos" },
  { id: "costs-booking", title: "Costs & booking" },
  { id: "service-faq", title: "FAQ" },
] as const;

// Service-specific headings follow the keyword map; chapter anchors stay stable.
export const SERVICE_THEME_HEADINGS: Record<string, readonly [string, string, string, string, string]> = {
  "reroof-replacement": [
    "Roof replacement or local roof repairs",
    "Assessing the roof and defining the replacement scope",
    "Roof covering and junction details",
    "Roof replacement quotes and booking",
    "Roof replacement questions",
  ],
  "roof-leak-repairs": [
    "Recurring roof leaks & rainwater ingress investigation",
    "Tracing intermittent leaks and roof-entry paths",
    "Roof leak details and related tile repair photos",
    "Roof leak repair quotes & inspection booking",
    "Roof leak investigation & repair questions",
  ],
  "tile-roof-repairs": [
    "Small tile roof repairs & individual tile replacement",
    "Assessing broken tiles and matching replacement materials",
    "Tile roof repairs: photo sequence",
    "Small tile repair costs & assessment booking",
    "Individual roof tile replacement questions",
  ],
  "chimney-flashing-repairs": [
    "Chimney-area water ingress & flashing inspection",
    "Inspecting chimney junctions and planning flashing repairs",
    "Chimney flashing: context images & roof details",
    "Chimney flashing repair quotes & booking",
    "Chimney leaks & flashing repair questions",
  ],
  "rebedding-repointing": [
    "Ridge capping, rebedding & repointing",
    "Assessing ridge bedding and pointing before repairs",
    "Ridge capping repairs: context images",
    "Rebedding & repointing quotes and booking",
    "Ridge capping, bedding & pointing questions",
  ],
  "roof-inspections": [
    "Roof inspection purpose and condition assessment",
    "Agreeing roof access, photos and written findings",
    "Roof inspections: photos & condition details",
    "Roof inspection fees & appointment booking",
    "Roof inspection scope & documentation questions",
  ],
  "metal-roof-repairs": [
    "Metal roof fixings, flashings & leak repairs",
    "Inspecting Colorbond sheets, fasteners & roof junctions",
    "Metal roof repairs: context images & roof details",
    "Metal & Colorbond roof repair quotes and booking",
    "Metal roof fixings & leak repair questions",
  ],
  "roof-renovation": [
    "Local roof repairs or wider roof renovation",
    "Assessing roof condition and defining renovation work",
    "Related tile roof repair photo sequence",
    "Roof renovation scope, quotes & booking",
    "Roof repair versus renovation questions",
  ],
  "roof-cleaning": [
    "Roof moss, lichen & surface debris cleaning",
    "Choosing a cleaning approach for your roof material",
    "Roof cleaning: context images",
    "Roof cleaning quotes & assessment booking",
    "Roof moss, lichen & cleaning method questions",
  ],
  "gutter-downpipe-maintenance": [
    "Blocked gutters, downpipes & roof drainage maintenance",
    "Clearing gutter debris and assessing drainage paths",
    "Gutter debris clearing: real project photos",
    "Gutter & downpipe maintenance quotes and booking",
    "Blocked gutters & downpipe maintenance questions",
  ],
  "gutter-repairs": [
    "Leaking gutter joints & damaged gutter repairs",
    "Assessing gutter sections, joints & downpipe connections",
    "Gutter drainage: project photos & debris clearing",
    "Gutter repair quotes & assessment booking",
    "Gutter leaks, repairs & drainage questions",
  ],
  "emergency-roof-repairs": [
    "Active roof leaks & urgent roof repair enquiries",
    "Urgent roof leak assessment and repair planning",
    "Urgent roof leak repair: real project photos",
    "Urgent roof repair booking & after-hours fees",
    "Urgent roof leaks & appointment questions",
  ],
  "rental-property-roof-repairs": [
    "Roof repairs for property managers & remote landlords",
    "Coordinating access and agreeing inspection records",
    "Property roof maintenance: real project photos",
    "Rental property roof repair quotes & approvals",
    "Remote landlord & property manager repair questions",
  ],
};

for (const [slug, headings] of Object.entries(POST_RAIN_SERVICE_HEADINGS)) {
  const existing = SERVICE_THEME_HEADINGS[slug];
  SERVICE_THEME_HEADINGS[slug] = [headings[0], headings[1], existing[2], existing[3], existing[4]];
}

export function ServiceSectionNav() {
  return <nav className="serviceSectionNav" aria-label="On this service page">
    {SERVICE_THEMES.map(theme => <a key={theme.id} href={`#${theme.id}`}>{theme.title}</a>)}
  </nav>;
}

export function ServiceTheme({ index, serviceSlug, children }: { index: number; serviceSlug: string; children: React.ReactNode }) {
  const theme = SERVICE_THEMES[index];
  return <section className="serviceTheme" id={theme.id} aria-labelledby={`${theme.id}-title`}>
    <h2 id={`${theme.id}-title`}>{SERVICE_THEME_HEADINGS[serviceSlug][index]}</h2>
    <div className="serviceThemeContent">{children}</div>
  </section>;
}
