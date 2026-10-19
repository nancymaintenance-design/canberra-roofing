// @vitest-environment jsdom
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { AppV3 } from "../src/main";
import { publishedRoutes, resolvePath, bilingualPagePaths } from "../src/route-meta";
import { SERVICE_CATALOG } from "../src/service-catalog.js";
import { realpathSync, statSync } from 'node:fs';
import { resolve, relative, isAbsolute, sep } from 'node:path';

function publicAssetExists(pathname: string) {
  try {
    const root = realpathSync(resolve('public/assets'));
    const decoded = decodeURIComponent(pathname);
    if (!decoded.startsWith('/assets/') || decoded.includes('\\')) return false;
    const file = realpathSync(resolve('public', `.${decoded}`));
    const within = relative(root, file);
    return within !== '' && within !== '..' && !within.startsWith(`..${sep}`) && !isAbsolute(within) && statSync(file).isFile();
  } catch { return false; }
}

function page(path: string) {
  const host = document.createElement("div");
  host.innerHTML = renderToStaticMarkup(<AppV3 pathname={path} />);
  return host;
}

describe("rendered Canberra content SEO", () => {
  it("keeps heading levels and internal destinations valid across published pages", () => {
    const paths = new Set(Object.keys(publishedRoutes));
    const destinations = new Set(bilingualPagePaths);
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
        expect(target.pathname.startsWith('/assets/') ? publicAssetExists(target.pathname) : destinations.has(resolvePath(target.pathname)), `${path}: ${target.pathname}`).toBe(true);
      }
    }
  }, 15000);

  it('rejects missing assets and paths that escape the public asset directory', () => {
    expect(publicAssetExists('/assets/projects/confirmed-urgent-leak-1000.webp')).toBe(true);
    expect(publicAssetExists('/assets/projects/nonexistent-original-photo.webp')).toBe(false);
    expect(publicAssetExists('/assets/%2e%2e/%2e%2e/package.json')).toBe(false);
    expect(publicAssetExists('/assets/..%5c..%5cpackage.json')).toBe(false);
  });

  it("gives all twelve services distinct booking FAQs, related services and quote preparation", () => {
    const questions = new Set<string>();
    for (const service of SERVICE_CATALOG) {
      const host = page(service.path);
      expect(host.querySelectorAll(".pageFaq details").length, service.path).toBeGreaterThanOrEqual(3);
      const last = host.querySelector(".pageFaq details:last-child summary")!.textContent!;
      questions.add(last);
      expect(host.querySelectorAll('.relatedServices a[href^="/services/"]').length).toBeGreaterThanOrEqual(2);
      expect(host.querySelector('.servicePlanning a[href="/news/when-to-arrange-roof-inspection-canberra"]')).not.toBeNull();
      expect(host.querySelector('.serviceView #costs-booking a[href^="/contact?service="]')).not.toBeNull();
      expect(host.querySelector(".serviceBookingPrompt")!.textContent!.length).toBeGreaterThan(40);
      expect(host.textContent).toContain("On-site roof assessment");
      expect(host.textContent).toContain("Appointment timing confirmed separately");
    }
    expect(questions.size).toBe(13);
  });

  it("sections all twelve guides with attribution, revision date and contextual links", () => {
    const guides = Object.keys(publishedRoutes).filter(path => path.startsWith("/news/"));
    expect(guides).toHaveLength(12);
    for (const path of guides) {
      const host = page(path);
expect(host.querySelectorAll(".articleSection").length, path).toBe(4);
      expect(host.querySelector(".articleByline")!.textContent).toContain("Ellis Services Group");
      const revised = "2026-10-14";
      expect(host.querySelector(`time[datetime="${revised}"]`)).not.toBeNull();
      expect(host.querySelectorAll('.articleBody a[href^="/news/"]').length).toBeGreaterThanOrEqual(2);
expect(host.querySelectorAll('.articleServiceNote a[href^="/services/"]')).toHaveLength(1);
      expect(host.querySelector('.articleSidebar')).toBeNull();
      expect(host.querySelector(`.guideNextSteps a[href="${path}"]`), path).toBeNull();
    }
  });

  it("provides a contact checklist without requiring a photo or promising a price", () => {
    const host = page("/contact");
    expect(host.querySelectorAll(".contactEnquiryNotes li")).toHaveLength(3);
    expect(host.querySelector(".contactEnquiryNotes")!.textContent).toMatch(/fees.*scope.*exclusions/);
    expect(host.textContent).toContain("You can request an assessment without a photo.");
    expect(page("/services/roof-renovation").querySelector(".servicePlanning")!.textContent).toMatch(/local repair.*renovation.*replacement/);
    expect(page("/areas/belconnen/aranda-roof-repairs").textContent).not.toContain("technicians with 15 years");
  });

  it("preserves factual booking context and all four footer social destinations", () => {
    const home = page("/");
    const study = page("/case-studies/tile-roof-repair-canberra");
    expect(home.textContent).toContain("On-site roof assessment");
    expect(home.textContent).toContain("Repair scope and written quote before work");
    expect(home.textContent).not.toMatch(/98%|1,000|15 years|30 minutes/);
    expect(study.textContent).toContain("no measured customer outcome is established by these photos");
    const social = [...home.querySelectorAll<HTMLAnchorElement>(".footerSocialLinks a")].map(a => a.getAttribute("href"));
    expect(social).toEqual([
      "https://share.google/y50AZRJwjOdVOlj5o",
      "https://www.instagram.com/elliservices_group/",
      "https://share.google/Z4tImXHToPi9H4LmH",
      "https://www.facebook.com/p/Ellis-Services-Group-100082926022259/",
    ]);
  });
});
