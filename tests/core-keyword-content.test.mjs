import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { JSDOM } from "jsdom";
import { startPreview } from "../scripts/preview.mjs";

const sitemap = await readFile(
  new URL("../public/sitemap.xml", import.meta.url),
  "utf8",
);
const preview = await startPreview();
test.after(async () => preview.close());

test("the sitemap excludes the four retired service URLs that return 404", () => {
  for (const pathname of [
    "/services/metal-colorbond-roof-repairs",
    "/services/roof-restoration",
    "/services/reroof-replacement",
    "/services/gutter-fascia-repairs",
  ]) {
    assert.doesNotMatch(sitemap, new RegExp(pathname));
  }
});

async function page(pathname) {
  const response = await fetch(preview.origin + pathname);
  assert.equal(response.status, 200);
  return new JSDOM(await response.text());
}

test("the home page invites Canberra repair enquiries with a clear next step and verified proof points", async () => {
  const dom = await page("/");
  try {
    const document = dom.window.document;
    const copy = document.querySelector("main")?.textContent ?? "";
    assert.equal(
      document.title,
      "Roof Repairs Canberra | Ellis Services Group",
    );
    assert.equal(
      document.querySelector("main h1")?.textContent,
      "Roof Repairs Canberra | Ellis Services Group",
    );
    assert.match(copy, /roofer in Canberra/i);
    assert.match(copy, /small roof repair/i);
    assert.match(copy, /We arrange an on-site assessment, identify the affected components and confirm the repair plan and written quote before work begins/i);
    assert.doesNotMatch(copy, /does not confirm that a job can be accepted/i);
    assert.match(copy, /Request a roof assessment/i);
    assert.match(copy, /15 years in roof repairs/i);
    assert.match(copy, /Response from as little as 30 minutes/i);
    assert.match(copy, /Trusted by 1,000\+ customers/i);
  } finally {
    dom.window.close();
  }
});

test("every priority service page gives substantial, question-led guidance", async () => {
  const expectations = [
    [
      "/services/roof-leak-repairs",
      ["roof leak detection", "roof flashing", "still leaks after a repair"],
    ],
    [
      "/services/tile-roof-repairs",
      ["terracotta", "concrete", "one or two damaged tiles"],
    ],
    [
      "/services/chimney-flashing-repairs",
      ["chimney flashing repairs", "wind-driven rain", "roof inspection"],
    ],
    [
      "/services/rebedding-repointing",
      ["roof repointing", "roof rebedding", "ridge capping"],
    ],
    [
      "/services/roof-inspections",
      [
        "roof inspection",
        "before deciding what to repair",
        "visual and non-invasive",
      ],
    ],
    [
      "/services/metal-roof-repairs",
      ["metal roof repairs", "Colorbond", "Do not climb onto a metal roof"],
    ],
  ];

  for (const [pathname, phrases] of expectations) {
    const dom = await page(pathname);
    try {
      const document = dom.window.document;
      const copy = document.querySelector("main")?.textContent ?? "";
      const words = copy.match(/[A-Za-z0-9][A-Za-z0-9'-]*/g)?.length ?? 0;
      assert.ok(
        words >= 500,
        `${pathname} has at least 500 visible English words`,
      );
      assert.ok(
        document.querySelectorAll(".pageFaq details").length >= 3,
        `${pathname} has at least three page-specific FAQs`,
      );
      for (const phrase of phrases) assert.match(copy, new RegExp(phrase, "i"));
    } finally {
      dom.window.close();
    }
  }
});

test("every Canberra service page foregrounds verified experience, response and customer proof", async () => {
  const servicePaths = [
    "/services/roof-leak-repairs",
    "/services/tile-roof-repairs",
    "/services/chimney-flashing-repairs",
    "/services/rebedding-repointing",
    "/services/roof-inspections",
    "/services/metal-roof-repairs",
    "/services/roof-renovation",
    "/services/roof-cleaning",
    "/services/gutter-downpipe-maintenance",
  ];

  for (const pathname of servicePaths) {
    const dom = await page(pathname);
    try {
      const document = dom.window.document;
      const copy = document.querySelector("main")?.textContent ?? "";
      assert.equal(
        document.querySelectorAll(".serviceAdvantages li").length,
        3,
        `${pathname} shows the three verified Ellis advantages`,
      );
      assert.match(copy, /15 years in roof repairs/i);
      assert.match(copy, /Response from as little as 30 minutes/i);
      assert.match(copy, /Trusted by 1,000\+ customers/i);
      assert.match(
        copy,
        /Before arranging a visit, we explain any inspection or booking fee that applies\. Repair pricing is confirmed after assessment and before work begins\./i,
      );
      assert.doesNotMatch(copy, /enquiry pathway|assessment pathway|compare services|any applicable costs/i);
    } finally {
      dom.window.close();
    }
  }
});

test("metal and drainage pages lead with their service value instead of a limitation", async () => {
  for (const [pathname, phrase] of [
    [
      "/services/metal-roof-repairs",
      "metal and Colorbond roof repairs in Canberra",
    ],
    [
      "/services/gutter-downpipe-maintenance",
      "provides gutter and downpipe cleaning and maintenance in Canberra",
    ],
  ]) {
    const dom = await page(pathname);
    try {
      const directAnswer =
        dom.window.document.querySelector(".directAnswer")?.textContent ?? "";
      assert.match(directAnswer, new RegExp(phrase, "i"));
      assert.doesNotMatch(directAnswer, /does not confirm|does not by itself/i);
    } finally {
      dom.window.close();
    }
  }
});

test("chimney and inspection pages use their approved Canberra P1 wording", async () => {
  for (const [pathname, title, h1] of [
    [
      "/services/chimney-flashing-repairs",
      "Chimney Flashing Repairs Canberra | Ellis Services Group",
      "Chimney Flashing Repairs Canberra",
    ],
    [
      "/services/roof-inspections",
      "Roof Inspection Canberra | Ellis Services Group",
      "Roof Inspection Canberra",
    ],
    [
      "/services/metal-roof-repairs",
      "Metal & Colorbond Roof Repairs Canberra | Ellis Services Group",
      "Metal & Colorbond Roof Repairs Canberra",
    ],
  ]) {
    const dom = await page(pathname);
    try {
      assert.equal(dom.window.document.title, title);
      assert.equal(
        dom.window.document.querySelector("main h1")?.textContent,
        h1,
      );
    } finally {
      dom.window.close();
    }
  }
});

test("the chimney service page links users to leak and inspection pathways", async () => {
  const dom = await page("/services/chimney-flashing-repairs");
  try {
    const links = [...dom.window.document.querySelectorAll("main a")].map(
      (link) => link.getAttribute("href"),
    );
    assert.ok(links.includes("/services/roof-leak-repairs"));
    assert.ok(links.includes("/services/roof-inspections"));
  } finally {
    dom.window.close();
  }
});

test("the tile service page distinguishes terracotta and concrete tile context without promising a match", async () => {
  const dom = await page("/services/tile-roof-repairs");
  try {
    const copy = dom.window.document.querySelector("main")?.textContent ?? "";
    assert.match(copy, /terracotta/i);
    assert.match(copy, /concrete/i);
    assert.match(copy, /inspect.*terracotta or concrete.*on site/i);
    assert.match(copy, /quote.*tile match.*weathering/i);
  } finally {
    dom.window.close();
  }
});
