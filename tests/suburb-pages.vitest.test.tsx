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
