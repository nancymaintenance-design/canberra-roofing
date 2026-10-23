import React from 'react';
import { GAP_GUIDES, SERVICE_DEPTH } from './keyword-gap-content.js';

type ContentLink = { path: string; label: string };
type ContentSection = { heading: string; paragraphs: string[]; bullets?: string[]; links?: ContentLink[] };
export type GapArticle = {
  servicePath?: string;
  serviceTitle?: string;
  sections?: ContentSection[];
  faqs?: { q: string; a: string }[];
  related?: ContentLink[];
  sources?: ContentLink[];
};
function RelatedLinks({ links }: { links: ContentLink[] }) {
  return <ul className="topicLinks">{links.map(item => <li key={item.path}><a href={item.path}>{item.label}</a></li>)}</ul>;
}
export function ServiceDepth({ slug, headingLevel = 2 }: { slug: string; headingLevel?: 2 | 3 }) {
  const sections: ContentSection[] = SERVICE_DEPTH[slug] ?? [];
  const Heading = headingLevel === 3 ? "h3" : "h2";
  return sections.length ? <>{sections.map((item, index) => <section className="contentGuidance serviceDepthItem serviceAdviceItem" key={item.heading}><Heading>{item.heading}</Heading>{item.paragraphs.map(p => <p key={p}>{p}</p>)}{item.links?.length ? <RelatedLinks links={item.links} /> : null}{index === sections.length - 1 && <p><a href="/services">Compare roof repair and maintenance services</a>.</p>}</section>)}</> : null;
}
export function GapArticleSections({ article }: { article: GapArticle }) {
  const sections = article.sections ?? [];
  return <>
    <nav className="articleContents" aria-label="On this page"><strong>On this page</strong><ol>{sections.map((item, index) => <li key={item.heading}><a href={`#topic-${index + 1}`}>{item.heading}</a></li>)}</ol></nav>
    {article.servicePath && <p>For the on-site work and booking process, see <a href={article.servicePath}>{article.serviceTitle} in Canberra</a>.</p>}
    {sections.map((item, index) => <section key={item.heading} id={`topic-${index + 1}`} className="topicSection"><h2>{item.heading}</h2>{item.paragraphs.map(p => <p key={p}>{p}</p>)}{item.bullets?.length ? <ul>{item.bullets.map(b => <li key={b}>{b}</li>)}</ul> : null}{item.links?.length ? <RelatedLinks links={item.links} /> : null}</section>)}
    <section className="pageFaq"><h2>Questions before you arrange a visit</h2>{article.faqs?.map(item => <details key={item.q}><summary>{item.q}</summary><p>{item.a}</p></details>)}</section>
    {article.sources?.length ? <section className="articleSources"><h2>Further reading from the source</h2><ul>{article.sources.map(item => <li key={item.path}><a href={item.path} target="_blank" rel="noopener noreferrer">{item.label}</a></li>)}</ul></section> : null}
    <section className="guideNextSteps"><h2>Related guides and your next step</h2><RelatedLinks links={article.related ?? []} /><p><a href="/services">Compare Canberra roof services</a>, or <a href="/contact">contact Ellis Services Group to arrange an assessment</a>. Include your suburb and the concern; photographs are optional.</p></section>
  </>;
}
export function GapHubLinks() {
  return <section className="contentGuidance topicHub roofScopeComparison" id="roof-work-options">
    <h2>Repair, renovation or replacement?</h2>
    <p>Start with the roof condition and the problem you want to solve. Age, appearance or a ceiling stain alone does not determine the work needed.</p>
    <dl className="roofScopeRows">
      <div>
        <dt><a href="#repair-services">Targeted roof repairs</a></dt>
        <dd><strong>When to discuss it</strong>A particular tile, sheet, flashing or gutter component needs attention and the adjoining roof can be retained.</dd>
        <dd><strong>What to compare in the quote</strong>The affected components, suitable replacement materials and any connected defects that the repair will address.</dd>
      </div>
      <div>
        <dt><a href="/services/roof-renovation">Renovation and restoration</a></dt>
        <dd><strong>When to discuss it</strong>The existing covering may be suitable to retain, with wider repairs and finish work matched to its material and condition.</dd>
        <dd><strong>What to compare in the quote</strong>Repairs needed before finish work, included roof areas, preparation and the proposed materials or treatment.</dd>
      </div>
      <div>
        <dt><a href="/services/reroof-replacement">Roof replacement</a></dt>
        <dd><strong>When to discuss it</strong>The covering has deteriorated across wider areas, or you want to assess a change of roof material.</dd>
        <dd><strong>What to compare in the quote</strong>The covering and removal work, adjoining flashing and drainage, access, weather protection and any excluded work.</dd>
      </div>
    </dl>
    <p>If the suitable option is unclear, <a href="/contact?service=Roof%20Inspections">request a roof inspection and discuss the quote</a>. The assessment should explain what each proposed option addresses before you approve work.</p>
    <div className="roofScopeEvidence">
      <h3>See the scope in our project photographs</h3>
      <p><a href="/case-studies/tile-roof-repair-canberra">Our tile repair photo sequence</a> shows work in the affected area with the surrounding roof retained.</p>
      <p><a href="/case-studies/roof-gutter-clearing">Our roof-edge and gutter clearing record</a> shows debris removal and the exposed channels. Clearing and repairs to damaged components are assessed separately.</p>
    </div>
    <h3>Compare roof work, costs and maintenance</h3>
    <p>Use these guides to compare a repair scope, understand cleaning choices and prepare for an assessment. The service pages explain the work Ellis provides; the guides answer the questions behind your decision.</p>
    <RelatedLinks links={GAP_GUIDES.map(g => ({ path: `/news/${g.slug}`, label: g.title }))} />
  </section>;
}
const contextLinks: Record<string, ContentLink[]> = {
  'after-rain-roof-leak-check-canberra': [
    { path: '/news/roof-leak-vs-condensation-canberra', label: 'Roof leak or condensation: observations that help' },
    { path: '/news/gutters-overflowing-heavy-rain-canberra', label: 'Gutters overflowing during heavy rain' },
    { path: '/news/roof-repair-cost-canberra', label: 'Roof repair cost and quote inclusions' },
  ],
  'rebedding-vs-repointing-canberra-roofs': [{ path: '/news/roof-repointing-cost-canberra', label: 'Repointing costs: compare the work included' }],
  'when-to-arrange-roof-inspection-canberra': [
    { path: '/news/roof-repair-cost-canberra', label: 'Compare inspection and repair costs' },
    { path: '/news/roof-repair-vs-restoration-vs-replacement-canberra', label: 'Local repair or wider roof work?' },
  ],
  'cracked-slipped-missing-roof-tiles-canberra': [
    { path: '/news/roof-cleaning-methods-canberra', label: 'Cleaning and material condition on tiled roofs' },
    { path: '/news/roof-repair-vs-restoration-vs-replacement-canberra', label: 'Compare local repairs and renovation' },
  ],
};
export function GapContextLinks({ slug }: { slug: string }) {
  const links = contextLinks[slug];
  return links ? <section className="contentGuidance"><h2>Compare the scope before booking</h2><RelatedLinks links={links} /></section> : null;
}
