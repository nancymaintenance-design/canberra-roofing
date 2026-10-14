import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const css = readFileSync(new URL("../src/styles.css", import.meta.url), "utf8");
const main = readFileSync(new URL("../src/main.tsx", import.meta.url), "utf8");
const design = readFileSync(new URL("../DESIGN.md", import.meta.url), "utf8");
const depth = readFileSync(new URL("../src/keyword-gap-sections.tsx", import.meta.url), "utf8");
const hasRule = (selector, declaration) => [...css.replace(/\/\*[\s\S]*?\*\//g, "").matchAll(/([^{}]+)\{([^{}]*)\}/g)].some(([, selectors, declarations]) => selectors.split(",").some(value => value.trim() === selector) && declaration.test(declarations));

test("guide-to-case spacing does not retain the preceding larger collapsed margin", () => {
  assert.ok(hasRule(".relatedGuides", /margin-bottom:\s*1\.5rem/));
});

test("service pages use the approved five-theme readable shell instead of the rejected advice grid", () => {
  assert.ok(main.includes('className="servicePageSections"'));
  assert.ok(hasRule(".servicePageSections", /max-width:\s*1440px/));
  assert.ok(hasRule(".serviceThemeContent", /max-width:\s*none/));
  assert.ok(depth.includes('className="contentGuidance serviceDepthItem serviceAdviceItem"'));
  assert.ok(depth.includes('index === sections.length - 1'));
  assert.ok(!css.includes(".serviceAdviceGrid"));
});

test("gallery cards use bounded crops and retain access to original project evidence", () => {
  assert.ok(hasRule(".serviceTheme .serviceGalleryGrid img", /height:\s*clamp\(280px, 24vw, 360px\)/));
  assert.ok(hasRule(".serviceTheme .serviceGallery", /display:\s*block/));
  assert.ok(main.includes('View original project collage'));
  assert.ok(main.includes('data-image-count={gallery.images.length}'));
});

test("home topics and gallery intros use the available desktop width", () => {
  assert.ok(hasRule(".homeGuidance", /grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\)/));
  assert.ok(hasRule(".serviceGalleryIntro", /grid-template-columns:\s*minmax\(0, 0\.8fr\) minmax\(0, 1\.2fr\)/));
  assert.ok(hasRule(".serviceGalleryIntro h2", /font-size:\s*clamp\(1\.75rem, 2\.8vw, 2\.75rem\)/));
});

test("service themes use one visual treatment and retain booking hours within their grouping", () => {
  assert.ok(hasRule(".serviceTheme", /border-radius:\s*var\(--radius-card\)/));
  assert.ok(hasRule(".serviceTheme h3", /font-size:\s*clamp\(1\.2rem, 1\.6vw, 1\.375rem\)/));
  const service = main.match(/function ServiceView[\s\S]*?function Areas/)?.[0] ?? main;
  assert.ok(!service.includes('className="serviceAdviceGrid"'));
  assert.ok(service.indexOf('<OperatingHours headingLevel={3} />') > service.indexOf('<ServiceTheme index={3}>'));
});

test("section rhythm is compact and documented without widening reading copy", () => {
  assert.ok(css.includes("--space-section: clamp(2.5rem, 4vw, 4rem)"));
  assert.ok(design.includes('section-gap: "clamp(2.5rem, 4vw, 4rem)"'));
  assert.ok(hasRule(".contentGuidance > p", /max-width:\s*75ch/));
  assert.ok(hasRule(".newsArticle", /max-width:\s*1120px/));
  assert.ok(hasRule(".privacyPage", /max-width:\s*1120px/));
});

test("index, case and sibling-card transitions do not stack oversized padding", () => {
  assert.ok(hasRule(".servicesOverview > .guidance", /padding:\s*1\.25rem/));
  assert.ok(hasRule(".caseStudyDetail", /padding-block:\s*2rem/));
  assert.ok(hasRule(".areaGrid article > h3", /margin-top:\s*0/));
  assert.ok(hasRule(".privacyBody section:last-child", /padding-bottom:\s*0/));
  assert.ok(hasRule(".serviceRelatedLinks ul", /display:\s*block/));
});
