// @vitest-environment jsdom
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { AppV3 } from "../src/main";
import { SERVICE_CATALOG } from "../src/service-catalog.js";
import { SERVICE_DEPTH } from "../src/keyword-gap-content.js";
import { INTENT_TOPICS, EXTRA_INTENT_TOPICS } from "../src/keyword-intent-content.js";
import { PROJECT_GALLERIES } from "../src/project-evidence.js";
import { ServicePlanning } from "../src/content-guidance";
import { OperatingHours } from "../src/keyword-intent-sections";

const sections = [
  ["what-we-repair", "What we repair"],
  ["how-we-handle-it", "How we handle it"],
  ["project-photos", "Roof details & photos"],
  ["costs-booking", "Costs & booking"],
  ["service-faq", "FAQ"],
];

const serviceFocus: Record<string, string> = {
  "reroof-replacement": "When local repairs may not resolve the roof condition",
  "roof-leak-repairs": "Roof leaks in heavy or wind-driven rain",
  "tile-roof-repairs": "Cracked, slipped or missing roof tiles",
  "chimney-flashing-repairs": "Water stains beside a chimney",
  "rebedding-repointing": "Loose ridge caps and cracked pointing",
  "roof-inspections": "Roof checks after leaks, storms or recurring dampness",
  "metal-roof-repairs": "Metal roof leaks around screws, laps and flashing",
  "roof-renovation": "Roof defects that need more than a surface finish",
  "roof-cleaning": "Moss, lichen and debris on tile or metal roofs",
  "gutter-downpipe-maintenance": "Gutters overflowing before or after cleaning",
  "gutter-repairs": "Leaking joints, sagging gutters and damaged connections",
  "emergency-roof-repairs": "Active roof leaks and visible storm damage",
  "rental-property-roof-repairs": "Tenant leak reports and recurring water stains",
};

function page(path: string) {
  const host = document.createElement("div");
  host.innerHTML = renderToStaticMarkup(<AppV3 pathname={path} />);
  return host;
}

describe("owner-approved five-theme service layout", () => {
  for (const service of SERVICE_CATALOG) {
    it(`${service.slug}: groups every service into the five ordered themes`, () => {
      const host = page(service.path);
      const view = host.querySelector(".serviceView")!;
      const headings = [...view.querySelectorAll("h2")].map(node => node.textContent!);
      expect(headings).toHaveLength(5);
      expect(headings[0]).toBe(serviceFocus[service.slug]);
      expect(new Set(headings).size).toBe(5);
      for (const [, genericTitle] of sections) expect(headings).not.toContain(genericTitle);
      expect(headings[3]).toMatch(/costs|quotes|booking|fees/i);
      expect(headings[4]).toMatch(/questions/i);
      expect([...view.querySelectorAll(".serviceTheme")].map(node => node.id)).toEqual(sections.map(([id]) => id));
      expect([...view.querySelectorAll(".serviceSectionNav a")].map(node => node.getAttribute("href"))).toEqual(sections.map(([id]) => `#${id}`));
      for (const [id] of sections) {
        const theme = view.querySelector(`#${id}`)!;
        expect(theme.tagName).toBe("SECTION");
        expect(theme.getAttribute("aria-labelledby")).toBe(`${id}-title`);
        expect(theme.querySelector(`h2#${id}-title`)).not.toBeNull();
        expect(theme.querySelector('.serviceThemeContent')!.textContent!.trim().length, `${service.slug}: ${id} must contain useful content`).toBeGreaterThan(40);
      }
      expect(view.querySelector(".serviceAdviceGrid, .serviceDetail")).toBeNull();
      expect(view.querySelector("#costs-booking a[href^='/contact?service=']")).not.toBeNull();
      expect(view.querySelector("#costs-booking")!.textContent).toContain("9:00 am–9:00 pm");
      expect(view.querySelector("#costs-booking")!.textContent).toContain("seven days a week");
      expect(view.querySelector("#costs-booking")!.textContent).toContain("on-site quote");
      expect(view.querySelectorAll("#service-faq details").length).toBeGreaterThanOrEqual(3);
      expect(view.querySelectorAll(".relatedServices a[href^='/services/']").length).toBeGreaterThanOrEqual(2);
    });

    it(`${service.slug}: retains keyword explanations and confirmed photos`, () => {
      const host = page(service.path);
      const view = host.querySelector(".serviceView")!;
      for (const item of SERVICE_DEPTH[service.slug] ?? []) {
        expect(view.textContent).toContain(item.heading);
        for (const paragraph of item.paragraphs) expect(view.textContent).toContain(paragraph);
      }
      for (const item of [...INTENT_TOPICS, ...EXTRA_INTENT_TOPICS].filter(item => item.slug === service.slug)) {
        expect(view.querySelector(`[data-topic="${item.id}"]`)).toBeNull();
        expect(view.querySelector("#service-faq")!.textContent).toContain(item.question);
        expect(view.querySelector("#service-faq")!.textContent).toContain(item.answer);
      }
      const project = PROJECT_GALLERIES[service.slug as keyof typeof PROJECT_GALLERIES];
      if (project) {
        const gallery = view.querySelector(`#${service.slug}-gallery-title-project`)!.closest(".serviceGallery")!;
        expect(gallery.closest("#project-photos")).not.toBeNull();
        const heroSource = view.querySelector('.serviceHero img')!.getAttribute('src');
        const galleryImages = project.images.filter(image => image.src !== heroSource);
        expect(gallery.querySelectorAll("figure")).toHaveLength(galleryImages.length);
        for (const image of project.images) expect(view.querySelectorAll(`img[src="${image.src}"]`)).toHaveLength(1);
        for (const image of galleryImages) expect(gallery.querySelector(`img[alt="${image.alt}"]`)).not.toBeNull();
        expect(gallery.querySelector(`img[src="${heroSource}"]`)).toBeNull();
      }
    });
  }

  it("shared content defaults to H2 outside service pages, and explicitly supports H3", () => {
    expect(renderToStaticMarkup(<ServicePlanning slug="tile-roof-repairs" />)).toContain("<h2");
    expect(renderToStaticMarkup(<ServicePlanning slug="tile-roof-repairs" headingLevel={3} />)).toContain("<h3");
    expect(renderToStaticMarkup(<OperatingHours />)).toContain("<h2");
    expect(renderToStaticMarkup(<OperatingHours headingLevel={3} />)).toContain("<h3");
  });

  it("renovation links to a clearly identified existing tile repair project", () => {
    const project = page('/services/roof-renovation').querySelector('#project-photos')!;
    expect(project.querySelector('a[href="/case-studies/tile-roof-repair-canberra"]')).not.toBeNull();
    expect(project.textContent).toContain('tile roof repair');
  });
});
