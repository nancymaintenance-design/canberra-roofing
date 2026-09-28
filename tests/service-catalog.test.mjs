import assert from "node:assert/strict";
import test from "node:test";

import { SERVICE_CATALOG, SERVICE_TITLES } from "../src/service-catalog.js";

test("the approved maintenance pathways have stable titles and routes", () => {
  assert.deepEqual(SERVICE_TITLES.slice(-3), [
    "Roof Renovation",
    "Roof Cleaning",
    "Gutter & Downpipe Cleaning and Maintenance",
  ]);
  assert.deepEqual(
    SERVICE_CATALOG.map(({ path }) => path).slice(-3),
    [
      "/services/roof-renovation",
      "/services/roof-cleaning",
      "/services/gutter-downpipe-maintenance",
    ],
  );
});
