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
vm.runInContext(fs.readFileSync(path.join(root, "shared", "sao-page-utils.js"), "utf8"), context, {
  filename: "shared/sao-page-utils.js"
});

const SAOPageUtils = context.window.SAOPageUtils;

// --- safe internal-href resolver -------------------------------------------
const resolver = SAOPageUtils.resolveSafeInternalHref;
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
  "//external.test/page.html",
  "data:text/html,<script>alert(1)</script>"
]) {
  assert.equal(resolver(input), null, `rejects unsafe URL: ${input || "empty"}`);
}

// --- Aincrad section router (floor propagation) ----------------------------
const aincradFloorAware = [
  ["maps", "floor1", "../Map/maps.html?floor=floor1"],
  ["maps", "floor2", "../Map/maps.html?floor=floor2"],
  ["maps", "floor3", "../Map/maps.html?floor=floor3"],
  ["bestiary", "floor2", "../Bestiary/bestiary.html?floor=floor2"],
  ["equipment", "floor3", "../eCompendium/ecompendium.html?floor=floor3"],
  ["quests", "floor1", "../Quests/quests.html?floor=floor1"],
  ["commands", "floor3", "../Commands/commands.html?floor=floor3"]
];
for (const [section, floor, expected] of aincradFloorAware) {
  assert.equal(SAOPageUtils.buildSectionUrl(section, floor), expected, `${section} + ${floor}`);
}
for (const section of ["patchnotes", "miscinfo", "menu"]) {
  assert.equal(
    SAOPageUtils.buildSectionUrl(section, "floor1"),
    SAOPageUtils.SECTION_PATHS[section],
    `${section} is not floor-aware`
  );
}
assert.equal(SAOPageUtils.buildSectionUrl("maps", null), "../Map/maps.html");
assert.equal(SAOPageUtils.buildSectionUrl("maps", ""), "../Map/maps.html");
assert.equal(SAOPageUtils.buildSectionUrl("missing", "floor1"), "#");

// --- Fractured Underworld section router -----------------------------------
const underworldFloorAware = [
  ["towerDefense", "iceCave", "../Tower Defense/towerdefense.html?floor=iceCave"],
  ["compendium", "gigasCedar", "../Compendium/compendium.html?floor=gigasCedar"],
  ["mainui", "playerIsland", "../Main UI/mainui.html?floor=playerIsland"]
];
for (const [section, floor, expected] of underworldFloorAware) {
  assert.equal(
    SAOPageUtils.buildSectionUrl(
      section,
      floor,
      SAOPageUtils.UNDERWORLD_SECTION_PATHS,
      SAOPageUtils.UNDERWORLD_FLOOR_AWARE_SECTIONS
    ),
    expected,
    `underworld ${section} + ${floor}`
  );
}
assert.equal(
  SAOPageUtils.buildSectionUrl(
    "menu",
    "iceCave",
    SAOPageUtils.UNDERWORLD_SECTION_PATHS,
    SAOPageUtils.UNDERWORLD_FLOOR_AWARE_SECTIONS
  ),
  "../../index.html",
  "underworld menu carries no island"
);

// --- query URL building -----------------------------------------------------
assert.equal(
  SAOPageUtils.buildQueryUrl("../Bestiary/bestiary.html", { floor: "floor1", category: "boss", search: "alpha" }),
  "../Bestiary/bestiary.html?floor=floor1&category=boss&search=alpha"
);
assert.equal(
  SAOPageUtils.buildQueryUrl("../Quests/quests.html", { floor: "", search: null, q: undefined }),
  "../Quests/quests.html"
);

// --- duplication removed from page controllers ------------------------------
for (const controller of [
  path.join(root, "Aincrad", "Map", "maps.js"),
  path.join(root, "Fractured Underworld", "Main UI", "mainui.js")
]) {
  const source = fs.readFileSync(controller, "utf8");
  assert.equal(/function\s+resolveSafeInternalHref/.test(source), false, `${controller} has no local resolver`);
  assert.equal(/const\s+SECTION_PATHS\s*=/.test(source), false, `${controller} has no local route table`);
  assert.equal(/function\s+buildSectionUrl/.test(source), false, `${controller} has no local section URL builder`);
  // The waypoint-info deep link still resolves through the shared resolver.
  assert.equal(
    (source.match(/window\.SAOPageUtils\.resolveSafeInternalHref\(/g) || []).length,
    1,
    `${controller} routes the waypoint-info link through the shared resolver`
  );
  assert.match(source, /window\.SAOPageUtils\.navigateToSection\(/, `${controller} uses the shared nav handler`);
}

const characterBuild = fs.readFileSync(path.join(root, "Aincrad", "Character Build", "character-build.js"), "utf8");
assert.equal(
  /window\.location\.href\s*=\s*path/.test(characterBuild),
  false,
  "Character Build drops its local route map"
);
assert.match(characterBuild, /window\.SAOPageUtils/, "Character Build references the shared nav module");
assert.match(characterBuild, /attachSectionNavButtons/, "Character Build uses the shared nav wiring");

const compendium = fs.readFileSync(path.join(root, "Fractured Underworld", "Compendium", "compendium.js"), "utf8");
assert.equal(/function\s+buildNavUrl/.test(compendium), false, "FU Compendium drops its local route builder");
assert.match(compendium, /SAOPageUtils\.attachSectionNavButtons/, "FU Compendium uses the shared nav wiring");

console.log("Navigation resolver regression tests passed.");
