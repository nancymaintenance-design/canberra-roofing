import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const root = new URL("../", import.meta.url);
const source = fs.readFileSync(new URL("src/main.tsx", root), "utf8");
const routes = JSON.parse(
  fs.readFileSync(new URL("src/route-meta.json", root), "utf8"),
);

test("Metal and Colorbond roof repair has a dedicated Canberra service route", () => {
  assert.match(source, /slug:\s*"metal-roof-repairs"/);
  assert.match(source, /title:\s*"Metal & Colorbond Roof Repairs"/);
  assert.equal(
    routes["/services/metal-roof-repairs"]?.h1,
    "Metal & Colorbond Roof Repairs Canberra",
  );
});

test("primary enquiry pages use their mapped Canberra search intent in the H1", () => {
  const headings = {
    "/": "Roof Repairs Canberra | Ellis Services Group",
    "/about": "Canberra Roof Repairs by Ellis Services Group",
    "/solutions": "Canberra Roof Repair Solutions",
    "/areas": "Canberra-wide Roof Repair Service Areas",
    "/news": "Canberra Roof Repair Guides",
    "/faq": "Canberra Roof Repair FAQs",
    "/contact": "Contact a Canberra Roofer for Roof Repairs",
  };

  for (const [pathname, h1] of Object.entries(headings)) {
    assert.equal(routes[pathname]?.h1, h1, pathname);
  }
});

test("home removes the generic roof-material showcase in favour of service pathways", () => {
  const home = source.match(/function HomeV2[\s\S]*?function About/)?.[0] ?? "";
  assert.doesNotMatch(home, /homeShowcase/);
  assert.match(source, /<ServiceCards data=\{data\} \/>/);
});
