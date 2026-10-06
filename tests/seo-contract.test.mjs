import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import test from "node:test";
import { JSDOM } from "jsdom";
import { startPreview } from "../scripts/preview.mjs";
import registry from "../src/route-meta.json" with { type: "json" };
import { DISTRICT_PROFILES, SUBURB_PROFILES } from "../src/suburb-profiles.js";

const origin = "https://www.canberraroofkind.com.au";
const staticRoutes = Object.entries(registry).map(([pathname, meta]) => ({ pathname, ...meta }));
const generatedRoutes = [...DISTRICT_PROFILES, ...SUBURB_PROFILES].map((profile) => ({
  ...profile,
  pathname: profile.path,
}));
const publishedRoutes = [...staticRoutes, ...generatedRoutes];
const preview = await startPreview();

test.after(async () => preview.close());

test("every published page has a unique, indexable search contract", async () => {
  const results = await Promise.all(
    publishedRoutes.map(async ({ pathname, title, description, canonical, h1 }) => {
      const response = await fetch(preview.origin + pathname);
      const html = await response.text();
      const dom = new JSDOM(html);
      const document = dom.window.document;
      try {
        assert.equal(response.status, 200, `${pathname} returns 200`);
        assert.match(response.headers.get("content-type") ?? "", /^text\/html/);
        assert.equal(document.querySelectorAll("head title").length, 1, `${pathname} has one title`);
        assert.equal(document.title, title, `${pathname} title matches its route data`);
        assert.equal(document.querySelectorAll('meta[name="description"]').length, 1, `${pathname} has one description`);
        assert.equal(document.querySelector('meta[name="description"]')?.content, description);
        assert.equal(document.querySelectorAll('link[rel="canonical"]').length, 1, `${pathname} has one canonical`);
        assert.equal(document.querySelector('link[rel="canonical"]')?.href, canonical ?? `${origin}${pathname}`);
        const robots = document.querySelector('meta[name="robots"]')?.content ?? "";
        const suburbRoute = pathname.startsWith("/areas/") && pathname.split("/").length === 4;
        if (suburbRoute)
          assert.match(robots, /noindex,follow/i, `${pathname} avoids thin or non-commercial index entries`);
        else if (pathname !== "/privacy") assert.doesNotMatch(robots, /noindex|nofollow/i);
        assert.equal(document.querySelectorAll("main h1").length, 1, `${pathname} has one H1`);
        assert.equal(document.querySelector("main h1")?.textContent?.replace(/\s+/g, " ").trim(), h1);
        assert.ok(document.querySelector('a[href="tel:0405878406"]'), `${pathname} retains the phone CTA`);
        assert.ok(document.querySelector('a[href="mailto:elliservices.group@gmail.com"]'), `${pathname} retains the official email`);
        return { pathname, title: document.title, description: document.querySelector('meta[name="description"]')?.content, body: createHash("sha256").update(html).digest("hex") };
      } finally {
        dom.window.close();
      }
    }),
  );
  assert.equal(new Set(results.map(({ title }) => title)).size, results.length, "each published page has a distinct title");
  assert.equal(new Set(results.map(({ description }) => description)).size, results.length, "each published page has a distinct description");
  assert.equal(new Set(results.map(({ body }) => body)).size, results.length, "published pages do not collapse into duplicate HTML");
});

test("the discovery files expose indexable pages without adding the suburb feed to the sitemap", async () => {
  const response = await fetch(preview.origin + "/sitemap.xml");
  assert.equal(response.status, 200);
  const xml = await response.text();
  const sitemap = new JSDOM(xml, { contentType: "application/xml" });
  try {
    const urls = [...sitemap.window.document.querySelectorAll("loc")].map((node) => node.textContent);
    const expected = new Set([
      ...staticRoutes.filter(({ pathname }) => pathname !== "/privacy").map(({ pathname }) => `${origin}${pathname}`),
      ...DISTRICT_PROFILES.map(({ path }) => `${origin}${path}`),
    ]);
    assert.deepEqual(new Set(urls), expected);
    for (const { path } of SUBURB_PROFILES) assert.ok(!urls.includes(`${origin}${path}`), `${path} stays in the area feed rather than the sitemap`);
  } finally {
    sitemap.window.close();
  }
});

test("structured business data and unknown routes remain safe for search visitors", async () => {
  const home = new JSDOM(await (await fetch(preview.origin + "/")).text());
  try {
    const entity = JSON.parse(home.window.document.querySelector('script[type="application/ld+json"]')?.textContent ?? "{}");
    assert.equal(entity.name, "Ellis Services Group");
    assert.equal(entity.email, "elliservices.group@gmail.com");
    assert.equal(entity.telephone, "+61405878406");
  } finally {
    home.window.close();
  }
  for (const pathname of ["/services/not-published", "/areas/not-published", "/assets/not-published.png", "/api/not-published"]) {
    const response = await fetch(preview.origin + pathname);
    assert.equal(response.status, 404, `${pathname} does not serve an indexable application page`);
  }
});
