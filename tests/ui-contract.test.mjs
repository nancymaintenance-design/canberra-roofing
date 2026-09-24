import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync(new URL('../src/main.tsx', import.meta.url), 'utf8');
const contactSource = fs.readFileSync(new URL('../src/contact-form.jsx', import.meta.url), 'utf8');
const css = fs.readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8');
const vercel = fs.readFileSync(new URL('../vercel.json', import.meta.url), 'utf8');
const renderedHome = source.match(/function HomeV2[\s\S]*?function About/)?.[0] || '';
const renderedHeroRule = css.match(/\.tradeHero\{[^}]+\}/)?.[0] || '';
const renderedAbout = source.match(/function About[\s\S]*?function Services/)?.[0] || '';
const renderedSolutions = source.match(/function Services[\s\S]*?function ServiceView/)?.[0] || '';
const renderedNews = source.match(/function News[\s\S]*?function FAQ/)?.[0] || '';
const renderedHomeMedia = renderedHome + renderedHeroRule;

assert.doesNotMatch(source, /images\.unsplash/);
assert.match(source, /aria-label="Primary navigation"/);
assert.match(renderedHome, /className="safetyNotes"/);
assert.match(renderedHome, /Do not use a ladder alone or in wet or windy conditions\./);
assert.match(renderedHome, /Keep children and pets clear of any damaged or dripping area\./);
assert.match(css, /\.safetyNotes\s*\{[^}]*grid-column:\s*2/s);
assert.match(css, /\.safeObservationActions\s*\{[^}]*grid-column:\s*1[^}]*grid-row:\s*2/s);
assert.match(css, /\.safeObservationActions::before\s*\{[^}]*Observe safely/s);
assert.match(source, /aria-label="Open main menu"/);
assert.match(source, /aria-expanded=\{mobileOpen\}/);
assert.match(source, /Close main menu/);
assert.match(source, /className="homeShowcase"/);
assert.match(source, /<ContactForm/);
assert.match(contactSource, /className="nativePhotoInput"/);
assert.match(contactSource, />Choose photo</);
assert.match(contactSource, /No photo selected/);
assert.match(contactSource, /Remove photo/);
assert.match(contactSource, /JPG, PNG or WebP\. Maximum 4 MB\./);
assert.match(contactSource, /tabIndex=\{-1\}/);
assert.match(contactSource, /autoComplete="off"/);
assert.doesNotMatch(source, /\bleads\b/);
assert.doesNotMatch(contactSource, /local demonstration|saved locally|no file is uploaded|does not send email/i);
assert.match(css, /\.nativePhotoInput\s*\{[^}]*opacity:\s*0/s);
assert.match(css, /\.nativePhotoInput:focus-visible\+\.photoButton/);

for (const asset of [
  'au-hero-act-tile-roof.png',
  'au-concrete-tile-detail.png',
  'au-colorbond-flashing-detail.png',
]) {
  assert.match(renderedHomeMedia, new RegExp(`/assets/home/${asset.replace('.', '\\.')}`));
}

assert.match(renderedAbout, /\/assets\/home\/canberra-roof-hero\.png/);
assert.match(renderedAbout, /REAL CASE STUDY/);
assert.match(renderedAbout, /98% Customer Satisfaction/);
assert.match(renderedAbout, /href="\/case-studies\/tile-roof-repair-canberra"/);
assert.match(renderedAbout, /className="caseStudyRail"/);
assert.match(renderedAbout, /className="aboutProcess"/);
assert.match(renderedAbout, /How a roof repair enquiry is arranged\./);
assert.match(renderedAbout, /className="aboutCredentials"/);
assert.match(renderedAbout, /Business record &amp; work requirements/);
assert.match(renderedAbout, /https:\/\/abr\.business\.gov\.au\/ABN\/View\?id=645821745/);
assert.match(renderedAbout, /121 Marcus Clarke St, Canberra, ACT 2600/);
assert.match(renderedAbout, /0405 878 406/);
assert.match(renderedAbout, /elliservices\.group@gmail\.com/);
assert.doesNotMatch(renderedAbout, /className="relatedCase aboutCaseStudy"/);
assert.doesNotMatch(renderedAbout, /\/assets\/about\/ellis-brand-safety-equipment\.png/);
assert.match(renderedSolutions, /\/assets\/home\/australian-residential-roof-context\.png/);
assert.match(renderedHome, /className="homeMap"/);
assert.match(renderedHome, /title="Google Map: 121 Marcus Clarke Street, Canberra"/);
assert.match(source, /https:\/\/www\.instagram\.com\/elliservices_group\//);
assert.match(source, /\/assets\/brand\/instagram-gradient\.png/);
assert.match(css, /\.caseStudyRail\s*\{[^}]*grid-template-columns:/s);
assert.match(css, /\.homeMapFrame\s*\{[^}]*aspect-ratio:/s);
assert.match(vercel, /frame-src https:\/\/www\.google\.com/);
assert.match(renderedNews, /className="newsGrid"/);
assert.match(renderedNews, /className="articleBody"/);

assert.doesNotMatch(renderedHomeMedia, /canberra-roof-hero|australian-residential-roof-context|tile-roof-detail/);
assert.doesNotMatch(renderedAbout, /australian-residential-roof-context|tile-roof-detail|\/assets\/home\/au-/);
assert.doesNotMatch(renderedSolutions, /canberra-roof-hero|tile-roof-detail|\/assets\/home\/au-/);
assert.doesNotMatch(renderedNews, /canberra-roof-hero|australian-residential-roof-context|\/assets\/home\/au-/);

assert.match(css, /\.pageMediaIntro\s*\{[^}]*grid-template-columns:\s*minmax\(0,3fr\)\s+minmax\([^,]+,2fr\)/s);
assert.match(css, /\.pageFeatureMedia\s*\{[^}]*overflow:\s*hidden[^}]*aspect-ratio:\s*(?:4\/3|5\/4)/s);
assert.match(css, /\.newsFeatureMedia img\s*\{[^}]*height:\s*116%[^}]*object-fit:\s*cover[^}]*object-position:\s*center top/s);
assert.match(css, /@media\(max-width:640px\)[\s\S]*\.pageMediaIntro[^}]*grid-template-columns:\s*1fr/s);
assert.doesNotMatch((renderedHome + renderedAbout + renderedSolutions + renderedNews).replace(/https:\/\/www\.google\.com\/[^"]+/g, '').replace(/https:\/\/abr\.business\.gov\.au\/ABN\/View\?id=645821745/g, ''), /https?:\/\/|Concept image|AppData\\Local\\Temp/);
assert.doesNotMatch(css, /@import|Playfair|Georgia|Times New Roman/);
assert.match(css, /--color-roof-charcoal:\s*#182328/i);
assert.match(css, /--color-safety-orange:\s*#E85D2A/i);
assert.match(css, /prefers-reduced-motion/);
assert.match(css, /\.serviceCards\s*\{[^}]*grid-template-columns:\s*repeat\(3,/s);
console.log('ui contract test passed');
