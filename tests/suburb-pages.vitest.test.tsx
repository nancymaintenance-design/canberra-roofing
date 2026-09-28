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
