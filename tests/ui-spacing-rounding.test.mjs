import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const css = readFileSync(new URL("../src/styles.css", import.meta.url), "utf8");
const source = readFileSync(new URL("../src/main.tsx", import.meta.url), "utf8");
const design = readFileSync(new URL("../DESIGN.md", import.meta.url), "utf8");

test("home guidance has the same bounded gutters as the surrounding sections", () => {
  assert.match(source, /className="homeGuidance">\s*<IntentServiceContent slug="home"\s*\/>\s*<OperatingHours\s*\/>\s*<\/div>/);
  assert.match(css, /\.homeGuidance\s*\{[^}]*width:\s*min\(100% - 3rem, var\(--container\)\)[^}]*margin-inline:\s*auto/s);
  assert.match(css, /\.contentGuidance > p\s*\{[^}]*max-width:\s*75ch/s);
});

test("shared card and media tokens match the approved rounded design", () => {
  for (const role of ["card", "media"]) {
    assert.match(css, new RegExp(`--radius-${role}:\\s*0\\.75rem`));
    assert.match(design, new RegExp(`${role}: "0\\.75rem"`));
  }
  assert.match(css, /--radius-control:\s*0\.25rem/);
  for (const selector of [".newsCard", ".safeObservation", ".homeCta", ".articleContents", ".suburbEvidence", ".suburbContact", ".guidance > aside", ".caseEvidenceGrid > figure", ".rooflineFaq details"]) {
    const rules = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)];
    assert.ok(rules.some(([, selectors, declarations]) => selectors.split(",").some(value => value.trim() === selector) && /border-radius:\s*var\(--radius-card\)/.test(declarations)), `${selector} must consume the shared card radius`);
  }
});

test("nested service prose retains a readable measure without constraining tables", () => {
  for (const selector of [".contentGuidance > section > p:not(.eyebrow)", ".serviceDetail > article > p:not(.eyebrow)"]) {
    assert.ok([...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].some(([, selectors, declarations]) => selectors.split(",").some(value => value.trim() === selector) && /max-width:\s*75ch/.test(declarations)), `${selector} has a bounded reading measure`);
  }
});

test("footer columns wrap and shrink at intermediate viewport widths", () => {
  assert.ok(/footer\s*\{[^}]*flex-wrap:\s*wrap/s.test(css), "footer columns can wrap before they overflow");
  assert.ok(/footer > div\s*\{[^}]*min-width:\s*0[^}]*flex:\s*1 1 15rem/s.test(css), "each column has a shrinkable flex basis");
  assert.ok(/\.footerSocialLinks\s*\{[^}]*grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\)/s.test(css), "social links must not impose a max-content overflow floor");
});

test("contact form fields can shrink below their native intrinsic width", () => {
  assert.ok(/\.contact form\s*\{[^}]*grid-template-columns:\s*minmax\(0, 1fr\)/s.test(css), "form track must not grow to its inputs' intrinsic width");
  assert.ok(/\.contact form > \*,\s*\.contact form label,\s*\.contact form \.formGrid > \*\s*\{[^}]*min-width:\s*0/s.test(css), "form grid items must shrink");
  assert.ok(/input,\s*textarea,\s*select\s*\{[^}]*min-width:\s*0/s.test(css), "native fields must fit narrow tracks");
});

test("privacy checkbox retains its visible size when neighbouring text wraps", () => {
  assert.ok(/\.check input\s*\{[^}]*min-width:\s*22px[^}]*flex:\s*0 0 22px/s.test(css), "consent checkbox must not shrink like a text input");
  assert.ok(/\.check\s*\{[^}]*overflow-wrap:\s*anywhere/s.test(css), "unbroken email in consent text must wrap within the form");
});

test("card keylines follow the rounded corner without clipping keyboard focus", () => {
  for (const [selector, property] of [[".card::before", "left"], [".homeServices::before", "right"]]) {
    const rules = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].filter(([, selectors]) => selectors.trim() === selector);
    assert.ok(rules.some(([, , declarations]) => declarations.includes(`${property}: var(--radius-card)`)), `${selector} must start after the rounded corner`);
    assert.ok(rules.some(([, , declarations]) => /pointer-events:\s*none/.test(declarations)), `${selector} is decoration only`);
  }
  assert.ok(/\.card::before\s*\{[^}]*width:\s*calc\(100% - 2 \* var\(--radius-card\)\)/s.test(css), "card stripe must end before the other rounded corner");
  assert.ok(/\.homeCta::before\s*\{[^}]*inset:\s*0 auto auto var\(--radius-card\)/s.test(css), "CTA stripe must start after the rounded corner");
  const cardRules = [...css.matchAll(/\.card\s*\{([^{}]*)\}/g)];
  assert.ok(cardRules.every(([, declarations]) => !/overflow:\s*(hidden|clip)/.test(declarations)));
  assert.match(css, /\.contentTableScroll\s*\{[^}]*overflow-x:\s*auto/s);
  assert.match(css, /details\s*\{[^}]*border-radius:\s*var\(--radius-card\)/s);
  const faqRules = [...css.matchAll(/\.rooflineFaq details\s*\{([^{}]*)\}/g)];
  assert.ok(faqRules.every(([, declarations]) => !/overflow:\s*(hidden|clip)|clip-path:/.test(declarations)), "FAQ corners and summary focus must not be clipped");
});
