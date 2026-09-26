const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const context = vm.createContext({
  console,
  Map,
  Set,
  URL,
  URLSearchParams,
  Object,
  Array,
  String,
  Number,
  Boolean,
  RegExp,
  Error,
  JSON,
  Math,
  document: { cookie: "" },
  location: {
    href: "https://example.test/Aincrad/Map/maps.html?floor=floor1",
    origin: "https://example.test"
  }
});
context.window = context;
context.globalThis = context;
vm.runInContext(
  fs.readFileSync(path.join(root, "shared", "sao-storage.js"), "utf8"),
  context,
  { filename: "shared/sao-storage.js" }
);

const resolver = context.window.SAOPageUtils.resolveSafeInternalHref;
const accepted = [
  ["https://example.test/other/page.html", "https://example.test/other/page.html"],
  ["../../index.html", "https://example.test/index.html"],
  ["../Map/maps.html?floor=floor2", "https://example.test/Aincrad/Map/maps.html?floor=floor2"],
  ["../Map/maps.html#markers", "https://example.test/Aincrad/Map/maps.html#markers"]
];
for (const [input, expected] of accepted) {
  assert.equal(resolver(input), expected, `accepts safe URL: ${input}`);
  assert.match(resolver(input), /^https?:\/\//, `accepted URL is absolute: ${input}`);
}

for (const input of [
  "https://external.test/page.html",
  "http://[",
  "",
  "   ",
  "javascript:alert(1)",
  "//external.test/page.html"
]) {
  assert.equal(resolver(input), null, `rejects unsafe URL: ${input || "empty"}`);
}

for (const controller of [
  path.join(root, "Aincrad", "Map", "maps.js"),
  path.join(root, "Fractured Underworld", "Main UI", "mainui.js")
]) {
  const source = fs.readFileSync(controller, "utf8");
  assert.equal(/function\s+resolveSafeInternalHref/.test(source), false, `${controller} has no local resolver`);
  assert.equal((source.match(/window\.SAOPageUtils\.resolveSafeInternalHref\(/g) || []).length, 2, `${controller} migrates both resolver callers`);
}

console.log("Navigation resolver regression tests passed.");
