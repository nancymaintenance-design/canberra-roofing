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
  "roof-leak-repairs": "Recurring roof leaks & rainwater ingress investigation",
  "tile-roof-repairs": "Small tile roof repairs & individual tile replacement",
  "chimney-flashing-repairs": "Chimney-area water ingress & flashing inspection",
  "rebedding-repointing": "Ridge capping, rebedding & repointing",
  "roof-inspections": "Roof inspection purpose and condition assessment",
  "metal-roof-repairs": "Metal roof fixings, flashings & leak repairs",
  "roof-renovation": "Local roof repairs or wider roof renovation",
  "roof-cleaning": "Roof moss, lichen & surface debris cleaning",
  "gutter-downpipe-maintenance": "Blocked gutters, downpipes & roof drainage maintenance",
  "gutter-repairs": "Leaking gutter joints & damaged gutter repairs",
  "emergency-roof-repairs": "Active roof leaks & urgent roof repair enquiries",
  "rental-property-roof-repairs": "Roof repairs for property managers & remote landlords",
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
        expect(view.textContent).toContain(item.body);
        expect(view.querySelector("#service-faq")!.textContent).toContain(item.question);
        expect(view.querySelector("#service-faq")!.textContent).toContain(item.answer);
      }
      const project = PROJECT_GALLERIES[service.slug as keyof typeof PROJECT_GALLERIES];
      if (project) {
        const gallery = view.querySelector(`#${service.slug}-gallery-title-project`)!.closest(".serviceGallery")!;
        expect(gallery.closest("#project-photos")).not.toBeNull();
        expect(gallery.querySelectorAll("figure")).toHaveLength(project.images.length);
        for (const image of project.images) expect(gallery.querySelector(`img[alt="${image.alt}"]`)).not.toBeNull();
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
