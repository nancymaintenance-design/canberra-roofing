// @vitest-environment jsdom
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { AppV3 } from "../src/main";

describe("About FAQ", () => {
  it("keeps every question in one compact, independently flowing list", () => {
    const documentMarkup = renderToStaticMarkup(<AppV3 pathname="/about" />);
    const host = document.createElement("div");
    host.innerHTML = documentMarkup;

    const faq = host.querySelector(".aboutFaq");
    const list = faq?.querySelector(":scope > .aboutFaqList");
    const questions = list?.querySelectorAll(":scope > details") ?? [];

    expect(list).not.toBeNull();
    expect(questions).toHaveLength(8);
    expect(questions[0].hasAttribute("open")).toBe(false);
    expect(questions[0].querySelector("summary")?.textContent).toContain(
      "Do I need to know the exact roof problem",
    );
    expect(host.textContent).toContain(
      "What details are most useful in a roof repair enquiry?",
    );
    expect(host.textContent).toContain(
      "Can you help if I am unsure whether the roof is tile or metal?",
    );
    expect(host.textContent).toContain(
      "What happens if weather makes an assessment unsafe?",
    );
    expect(host.textContent).toContain(
      "Do I need to be at the property for an assessment?",
    );
  });
});
