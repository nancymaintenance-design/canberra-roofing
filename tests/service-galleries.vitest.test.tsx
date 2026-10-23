// @vitest-environment jsdom
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { AppV3 } from "../src/main";

const serviceImages = (pathname: string) => {
  const host = document.createElement("div");
  host.innerHTML = renderToStaticMarkup(<AppV3 pathname={pathname} />);
  const hero = host.querySelector('.serviceHero img')!;
  expect(hero).not.toBeNull();
  expect(host.querySelector(`.serviceGallery img[src="${hero.getAttribute('src')}"]`)).toBeNull();
  const images = Array.from(host.querySelectorAll(".serviceHero img, .serviceGallery:not([data-project]) .serviceGalleryGrid img")).map(
    (image) => image.getAttribute("src"),
  );
  expect(new Set(images).size).toBe(images.length);
  return images.sort();
};

describe("service image galleries", () => {
  it("puts the supplied Chimney Flashing image in the established gallery", () => {
    expect(serviceImages("/services/chimney-flashing-repairs")).toContain(
      "/assets/services/chimney-flashing-completed-roof-detail.png",
    );
  });

  it("puts the supplied Roof Inspection image in the established gallery", () => {
    expect(serviceImages("/services/roof-inspections")).toContain(
      "/assets/services/roof-inspection-solar-roof-review.png",
    );
  });

  it("uses the four supplied metal roof photos once and retains the existing hero", () => {
    const images = serviceImages("/services/metal-roof-repairs");

    expect(images).toEqual([
      "/assets/services/metal-roof-wall-flashing-condition.png",
      "/assets/projects/site-metal-roof-overview.webp",
      "/assets/projects/site-metal-roof-fixing-points.webp",
      "/assets/projects/site-metal-roof-junction.webp",
      "/assets/projects/site-metal-roof-sheet-detail.webp",
    ].sort());
  });

  it("uses seven supplied Roof Cleaning site photos once across hero and gallery", () => {
    expect(serviceImages("/services/roof-cleaning")).toEqual([
      "/assets/projects/site-eaves-gutter-before.webp",
      "/assets/projects/site-eaves-gutter-cleared.webp",
      "/assets/projects/site-box-gutter-sediment.webp",
      "/assets/projects/site-box-gutter-cleared.webp",
      "/assets/projects/site-roof-edge-cleared-overview.webp",
      "/assets/projects/site-roof-junction-sediment.webp",
      "/assets/projects/site-garden-gutter-cleared.webp",
    ].sort());
  });

  it("uses seven supplied gutter site photos once across hero and gallery", () => {
    expect(serviceImages("/services/gutter-downpipe-maintenance")).toEqual([
      "/assets/projects/site-box-gutter-cleared.webp",
      "/assets/projects/site-gutter-outlet-before.webp",
      "/assets/projects/site-gutter-outlet-cleared.webp",
      "/assets/projects/site-side-gutter-before.webp",
      "/assets/projects/site-side-gutter-cleared.webp",
      "/assets/projects/site-eaves-moss-detail.webp",
      "/assets/projects/site-gutter-sediment-closeup.webp",
    ].sort());
  });
});
