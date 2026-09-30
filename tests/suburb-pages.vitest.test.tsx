// @vitest-environment jsdom
import { expect, it } from "vitest";
import { renderToString } from "react-dom/server";
import { AppV3 } from "../src/main";
import { getRouteHead } from "../src/route-meta";

it("renders a registered suburb page and preserves unknown paths as 404", () => {
  expect(renderToString(<AppV3 pathname="/areas/belconnen/aranda-roof-repairs" />)).toContain("Roof Repairs in Aranda, Belconnen");
  expect(getRouteHead("/areas/belconnen/aranda-roof-repairs").canonical).toBe("https://www.canberraroofkind.com.au/areas/belconnen/aranda-roof-repairs");
  expect(renderToString(<AppV3 pathname="/areas/belconnen/not-a-suburb-roof-repairs" />)).toContain("<h1>Page not found</h1>");
});

it("renders dense service cards with a practical assessment focus", () => {
  const html = renderToString(<AppV3 pathname="/services" />);
  expect(html).toContain("serviceCardLead");
  expect(html).toContain("Assessment focus");
  expect(html).toContain("Water marks, drips and rain-related damp patches.");
});

it("uses the roofline FAQ treatment on the About page", () => {
  const html = renderToString(<AppV3 pathname="/about" />);
  expect(html).toContain("rooflineFaq");
  expect(html).toContain("Do I need to know the exact roof problem before I contact you?");
});

it("uses the Canberra roof repair search intent in the home service heading", () => {
  const html = renderToString(<AppV3 pathname="/" />);
  expect(html).toContain("Canberra Roof Repair Services");
  expect(html).toContain("Specific roof repair, roof maintenance and cleaning services for Canberra homes.");
});

it("uses confident, clear service copy without internal SEO explanations", () => {
  const cleaningHtml = renderToString(<AppV3 pathname="/services/roof-cleaning" />);
  const metalHtml = renderToString(<AppV3 pathname="/services/metal-roof-repairs" />);
  const aboutHtml = renderToString(<AppV3 pathname="/about" />);
  const faqHtml = renderToString(<AppV3 pathname="/faq" />);

  expect(cleaningHtml).toContain("We confirm the recommended cleaning approach, scope and any applicable costs after assessing the property.");
  expect(cleaningHtml).not.toContain("This page does not promise that cleaning");
  expect(metalHtml).not.toContain("used here to describe a common roof-material search term");
  expect(aboutHtml).toContain("Images from Ellis Services Group project work");
  expect(faqHtml).toContain("We aim to respond promptly");
  expect(faqHtml).not.toContain("No response time is promised here.");
});
