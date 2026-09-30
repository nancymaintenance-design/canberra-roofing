// @vitest-environment jsdom
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { AppV3 } from "../src/main";

const galleryImages = (pathname: string) => {
  const host = document.createElement("div");
  host.innerHTML = renderToStaticMarkup(<AppV3 pathname={pathname} />);
  return Array.from(host.querySelectorAll(".serviceGalleryGrid img")).map(
    (image) => image.getAttribute("src"),
  );
};

describe("service image galleries", () => {
  it("puts the supplied Chimney Flashing image in the established gallery", () => {
    expect(galleryImages("/services/chimney-flashing-repairs")).toContain(
      "/assets/services/chimney-flashing-completed-roof-detail.png",
    );
  });

  it("puts the supplied Roof Inspection image in the established gallery", () => {
    expect(galleryImages("/services/roof-inspections")).toContain(
      "/assets/services/roof-inspection-solar-roof-review.png",
    );
  });

  it("renders a complete five-image Metal and Colorbond repair gallery", () => {
    const images = galleryImages("/services/metal-roof-repairs");

    expect(images).toEqual([
      "/assets/services/metal-roof-repair-team-work.png",
      "/assets/services/metal-roof-wall-flashing-condition.png",
      "/assets/services/metal-roof-secure-fixing.png",
      "/assets/services/metal-roof-gutter-edge-repair.png",
      "/assets/services/metal-roof-completed-roof.png",
    ]);
  });

  it("renders the supplied five-image Roof Cleaning gallery", () => {
    expect(galleryImages("/services/roof-cleaning")).toEqual([
      "/assets/services/roof-cleaning-surface-condition.png",
      "/assets/services/roof-cleaning-gutter-debris.png",
      "/assets/services/roof-cleaning-controlled-wash.png",
      "/assets/services/roof-cleaning-site-overview.png",
      "/assets/services/roof-cleaning-completed-roof.png",
    ]);
  });

  it("renders the supplied five-image Gutter and Downpipe gallery", () => {
    expect(galleryImages("/services/gutter-downpipe-maintenance")).toEqual([
      "/assets/services/gutter-downpipe-valley-condition.jpg",
      "/assets/services/gutter-downpipe-roof-edge-condition.jpg",
      "/assets/services/gutter-downpipe-vegetation-build-up.jpg",
      "/assets/services/gutter-downpipe-solar-channel-debris.jpg",
      "/assets/services/gutter-downpipe-edge-debris.jpg",
    ]);
  });
});
