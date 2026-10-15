// @vitest-environment jsdom
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import { AppV3 } from "../src/main";
import { SUBURB_PROFILES, DISTRICT_PROFILES } from "../src/suburb-profiles.js";
import { SERVICE_CATALOG } from "../src/service-catalog.js";

function page(path: string) {
  const host = document.createElement("div");
  host.innerHTML = renderToStaticMarkup(<AppV3 pathname={path} />);
  return host.querySelector(".suburbPage")!;
}

it.each(SUBURB_PROFILES)("$suburb: explained service choices and preselected enquiry", (profile) => {
    const view = page(profile.path);
    expect(view.querySelector('a[href="#local-roof-services"]')).not.toBeNull();
    expect(view.querySelector('a[href="#local-enquiry"]')).not.toBeNull();
    expect(view.querySelectorAll(".suburbFeatured .card")).toHaveLength(3);
    for (const card of view.querySelectorAll(".suburbFeatured .card")) {
      expect(card.querySelector("p")!.textContent!.length).toBeGreaterThan(30);
    }
    for (const service of SERVICE_CATALOG) {
      expect(view.querySelectorAll(`.suburbFeatured a[href="${service.path}"], .suburbAllServices a[href="${service.path}"]`)).toHaveLength(1);
    }
    const contact = view.querySelector("#local-enquiry")!;
    expect(contact.querySelector(".suburbContactIntro h2")!.textContent).toContain(profile.suburb);
    expect(contact.querySelector(".suburbContactIntro p")).not.toBeNull();
    expect([...contact.querySelectorAll("select option:checked")].some(option => option.textContent === profile.areaOption)).toBe(true);
    expect(view.textContent).toContain("Appointment timing confirmed separately");
    expect(view.textContent).toContain("Repair scope and written quote before work");
});

it("every district uses the same clearly labelled enquiry panel", () => {
  for (const profile of DISTRICT_PROFILES) {
    const view = page(profile.path);
    const contact = view.querySelector("#local-enquiry")!;
    expect(contact.querySelector(".suburbContactIntro h2")!.textContent).toContain(profile.district);
    expect(contact.querySelector(".suburbContactIntro p")).not.toBeNull();
    expect(contact.querySelector("form")).not.toBeNull();
  }
});
