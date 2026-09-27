import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const source = fs.readFileSync(
  new URL("../src/main.tsx", import.meta.url),
  "utf8",
);

test("recovery retains the six detailed service records", () => {
  const serviceBlock =
    source.match(
      /const serviceSeed:\s*Service\[\]\s*=\s*\[([\s\S]*?)\n\];/,
    )?.[1] || "";
  assert.equal((serviceBlock.match(/\{\s*slug:/g) || []).length, 6);
  for (const field of [
    "direct",
    "causes",
    "assessment",
    "pathways",
    "scope",
    "faqQ",
    "faqA",
    "next",
  ]) {
    assert.equal(
      (serviceBlock.match(new RegExp(`[,\\{]\\s*${field}:`, "g")) || []).length,
      6,
      `missing ${field} on a service record`,
    );
  }
});

test("recovery retains the comprehensive canonical FAQ set", () => {
  const faqBlock =
    source.match(
      /const canonicalFaqs:\s*Faq\[\]\s*=\s*\[([\s\S]*?)\n\];/,
    )?.[1] || "";
  assert.ok((faqBlock.match(/\{\s*q:/g) || []).length >= 20);
});

test("recovery retains service navigation and the development-only local editor", () => {
  assert.match(source, /aria-label="Primary navigation"/);
  assert.match(source, /servicesToggle/);
  assert.match(source, /className="servicesPopup"/);
  assert.match(source, /localStorage\.getItem\(store\)/);
  assert.match(source, /localStorage\.setItem\(store/);
  assert.match(
    source,
    /import\.meta\.env\.DEV\s*&&\s*\(\s*<button\s+className="adminBtn"[\s\S]*?>\s*Admin\s*<\/button>\s*\)/,
  );
  for (const control of [
    "Company name",
    "Phone",
    "Email",
    "News headline",
    "News copy",
    "FAQ JSON",
  ])
    assert.match(source, new RegExp(control));
});

test("only AppV3 is mounted and removed legacy components stay absent", () => {
  const client = fs.readFileSync(
    new URL("../src/entry-client.tsx", import.meta.url),
    "utf8",
  );
  assert.match(client, /hydrateRoot/);
  assert.match(client, /AppV3/);
  assert.doesNotMatch(source, /createRoot|hydrateRoot/);
  for (const removed of [
    "Layout",
    "LegacyContact",
    "AdminV2",
    "App",
    "AppV2",
  ]) {
    assert.doesNotMatch(source, new RegExp(`function ${removed}\\(`));
  }
});
