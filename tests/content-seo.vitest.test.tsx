// @vitest-environment jsdom
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { AppV3 } from "../src/main";
import { publishedRoutes, resolvePath } from "../src/route-meta";
import { SERVICE_CATALOG } from "../src/service-catalog.js";

function page(path: string) {
  const host = document.createElement("div");
  host.innerHTML = renderToStaticMarkup(<AppV3 pathname={path} />);
  return host;
}

describe("rendered Canberra content SEO", () => {
  it("keeps heading levels and internal destinations valid across published pages", () => {
    const paths = new Set(Object.keys(publishedRoutes));
    for (const path of paths) {
      const host = page(path);
      expect(host.querySelectorAll("main h1"), path).toHaveLength(1);
      let previous = 0;
      for (const heading of host.querySelectorAll("main h1, main h2, main h3, main h4")) {
        const level = Number(heading.tagName.slice(1));
        expect(level, `${path}: ${heading.textContent}`).toBeLessThanOrEqual(previous + 1);
        previous = level;
      }
      for (const link of host.querySelectorAll<HTMLAnchorElement>('a[href^="/"]')) {
        const target = new URL(link.getAttribute("href")!, "https://www.canberraroofkind.com.au");
        expect(paths.has(resolvePath(target.pathname)), `${path}: ${target.pathname}`).toBe(true);
      }
    }
  }, 15000);

  it("gives all nine services distinct booking FAQs, related services and quote preparation", () => {
    const questions = new Set<string>();
    for (const service of SERVICE_CATALOG) {
      const host = page(service.path);
      expect(host.querySelectorAll(".pageFaq details").length, service.path).toBeGreaterThanOrEqual(3);
      const last = host.querySelector(".pageFaq details:last-child summary")!.textContent!;
      questions.add(last);
      expect(host.querySelectorAll('.relatedServices a[href^="/services/"]').length).toBeGreaterThanOrEqual(2);
      expect(host.querySelector('.servicePlanning a[href="/news/when-to-arrange-roof-inspection-canberra"]')).not.toBeNull();
      expect(host.querySelector('.serviceView > a[href^="/contact?service="]')).not.toBeNull();
      expect(host.querySelector(".serviceBookingPrompt")!.textContent!.length).toBeGreaterThan(40);
      expect(host.textContent).toContain("15 years in roof repairs");
      expect(host.textContent).toContain("Trusted by 1,000+ customers");
    }
    expect(questions.size).toBe(9);
  });

  it("sections all five guides with attribution, revision date and contextual links", () => {
    const guides = Object.keys(publishedRoutes).filter(path => path.startsWith("/news/"));
    expect(guides).toHaveLength(5);
    for (const path of guides) {
      const host = page(path);
      expect(host.querySelectorAll(".articleBody h2").length, path).toBeGreaterThanOrEqual(6);
      expect(host.querySelector(".articleByline")!.textContent).toContain("Ellis Services Group");
      expect(host.querySelector('time[datetime="2026-10-10"]')).not.toBeNull();
      expect(host.querySelectorAll('.articleBody a[href^="/news/"]').length).toBeGreaterThanOrEqual(2);
      expect(host.querySelectorAll('.articleBody a[href^="/services/"]').length).toBeGreaterThanOrEqual(1);
      expect(host.querySelector('.articleBody a[href="/contact"]')).not.toBeNull();
      expect(host.querySelector(`.guideNextSteps a[href="${path}"]`), path).toBeNull();
    }
  });

  it("provides a contact checklist without requiring a photo or promising a price", () => {
    const host = page("/contact");
    expect(host.querySelectorAll(".enquiryChecklist li")).toHaveLength(4);
    expect(host.querySelector(".enquiryChecklist")!.textContent).toMatch(/fee.*excluded.*further investigation/);
    expect(host.textContent).toContain("You can request an assessment without a photo.");
    expect(page("/services/roof-renovation").querySelector(".servicePlanning")!.textContent).toMatch(/local repair.*renovation.*replacement/);
    expect(page("/areas/belconnen/aranda-roof-repairs").textContent).not.toContain("technicians with 15 years");
  });

  it("preserves brand proof and all four footer social destinations", () => {
    const home = page("/");
    const study = page("/case-studies/tile-roof-repair-canberra");
    expect(home.textContent).toContain("15 years in roof repairs");
    expect(home.textContent).toContain("Trusted by 1,000+ customers");
    expect(home.textContent).toContain("98% customer satisfaction");
    expect(study.textContent).toContain("98% customer satisfaction");
    const social = [...home.querySelectorAll<HTMLAnchorElement>(".footerSocialLinks a")].map(a => a.getAttribute("href"));
    expect(social).toEqual([
      "https://share.google/y50AZRJwjOdVOlj5o",
      "https://www.instagram.com/elliservices_group/",
      "https://share.google/Z4tImXHToPi9H4LmH",
      "https://share.google/tU1c5vEAlELqXCifu",
    ]);
  });
});
