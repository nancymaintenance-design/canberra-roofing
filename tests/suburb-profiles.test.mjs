import assert from "node:assert/strict";
import test from "node:test";
import { SUBURB_PROFILES, SUBURB_PATHS, getSuburbProfile, getSuburbRoute } from "../src/suburb-profiles.js";

test("suburb profiles use stable unique local roof-repair paths", () => {
  assert.equal(SUBURB_PROFILES.length, 77);
  assert.equal(getSuburbRoute("Aranda", "Belconnen"), "/areas/belconnen/aranda-roof-repairs");
  assert.equal(getSuburbRoute("O’Connor", "Inner North & City"), "/areas/inner-north-city/o-connor-roof-repairs");
  assert.equal(getSuburbProfile("/areas/belconnen/aranda-roof-repairs").areaOption, "Aranda — Belconnen");
  assert.equal(new Set(SUBURB_PATHS).size, 77);
});
