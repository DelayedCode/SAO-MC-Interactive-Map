/* Guards the shared map architecture introduced when the duplicated map UI was consolidated:

   1. The marker artwork both maps render comes from shared/sao-map-helpers.js, not from copies
      embedded in each controller.
   2. The mob-area mob list markup is shared, with the page supplying only its own strings/links.
   3. The map chrome/controls/marker styling both pages declared identically lives in
      shared/sao-map-ui.css, which each map page links before its own stylesheet, and the two page
      stylesheets no longer keep private copies of those rules.

   A change that re-forks any of the three is a regression, not a style preference. */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), "utf8");

const AINCRAD_CONTROLLER = "Aincrad/Map/maps.js";
const UNDERWORLD_CONTROLLER = "Fractured Underworld/Main UI/mainui.js";
const AINCRAD_STYLES = "Aincrad/Map/maps.css";
const UNDERWORLD_STYLES = "Fractured Underworld/Main UI/mainui.css";
const SHARED_STYLES = "shared/sao-map-ui.css";
const COMPETING_NOTE = "/* Rules that both map stylesheets declare identically but which also compete";

/* --- 1. shared marker icon library ----------------------------------------- */

const context = vm.createContext({
  console,
  Map,
  Set,
  Object,
  Array,
  String,
  Number,
  Boolean,
  Math,
  JSON,
  Error,
  document: {}
});
context.window = context;
context.globalThis = context;
vm.runInContext(read("shared/sao-map-helpers.js"), context, { filename: "shared/sao-map-helpers.js" });
const helpers = context.window.SAOMapHelpers;

const ICON_KINDS = ["biome", "dungeon", "boss", "sideQuest", "alchemist", "lumberjack", "mobArea"];
assert.equal(typeof helpers.MARKER_ICON_LIBRARY, "object", "MARKER_ICON_LIBRARY is exported");
assert.equal(typeof helpers.buildMarkerIcon, "function", "buildMarkerIcon is exported");
assert.ok(Object.isFrozen(helpers.MARKER_ICON_LIBRARY), "the icon library is frozen");
ICON_KINDS.forEach((kind) => {
  const markup = helpers.buildMarkerIcon(kind);
  assert.equal(typeof markup, "string", `${kind} icon markup is a string`);
  assert.match(markup, /^\s*<svg class="[a-z-]+-icon"/, `${kind} icon markup starts with its svg`);
  assert.ok(markup.trimEnd().endsWith("</svg>"), `${kind} icon markup is closed`);
  assert.equal(helpers.MARKER_ICON_LIBRARY[kind], markup, `${kind} is read straight from the library`);
});
assert.equal(helpers.buildMarkerIcon("not-a-kind"), null, "unknown kinds have no artwork");

[AINCRAD_CONTROLLER, UNDERWORLD_CONTROLLER].forEach((controller) => {
  const source = read(controller);
  ICON_KINDS.forEach((kind) => {
    const iconClass = helpers.buildMarkerIcon(kind).match(/class="([a-z-]+-icon)"/)[1];
    assert.ok(
      !source.includes(`<svg class="${iconClass}"`),
      `${controller} must render the shared ${iconClass} instead of embedding a copy`
    );
  });
  assert.ok(source.includes("buildMarkerIcon("), `${controller} uses the shared marker icon library`);
});

/* --- 2. shared mob-area mob list markup ------------------------------------ */

assert.equal(typeof helpers.buildMobAreaMobListMarkup, "function", "buildMobAreaMobListMarkup is exported");

{
  const empty = helpers.buildMobAreaMobListMarkup({ mobs: [], emptyText: "No mobs here." });
  assert.equal(empty, "<p>No mobs here.</p>", "an empty area renders the caller's empty-state text");
}

{
  const rendered = helpers.buildMobAreaMobListMarkup({
    mobs: [{ id: "Dire Wolf", name: "Dire Wolf" }, { name: "Boar" }],
    content: (key, fallback) => (key === "bestiary.mob.dire-wolf" ? "Lobo Feroz" : fallback),
    escapeHtml: (value) => String(value).replace(/</g, "&lt;"),
    emptyText: "none",
    selectLabel: "View",
    getHref: (mob) => `/bestiary.html?mob=${mob.name}`
  });
  assert.match(rendered, /<ul class="mob-area-entry-list">/, "the list wrapper is rendered");
  assert.equal((rendered.match(/mob-area-entry-item/g) || []).length, 2, "one entry per mob");
  assert.ok(rendered.includes(">Lobo Feroz<"), "localised mob names come from the caller's lookup");
  assert.ok(rendered.includes(">Boar<"), "an unmapped mob falls back to its own name");
  assert.ok(rendered.includes('data-waypoint-info-href="/bestiary.html?mob=Dire Wolf"'), "the caller builds the link");
  assert.ok(rendered.includes(">View<"), "the caller supplies the action label");
}

[AINCRAD_CONTROLLER, UNDERWORLD_CONTROLLER].forEach((controller) => {
  const source = read(controller);
  assert.ok(source.includes("buildMobAreaMobListMarkup"), `${controller} uses the shared mob list markup`);
  assert.ok(!/<ul class="mob-area-entry-list">/.test(source), `${controller} must not embed its own mob list markup`);
});

/* --- 3. shared map UI stylesheet ------------------------------------------- */

const sharedStyles = read(SHARED_STYLES);
assert.ok(sharedStyles.includes(".marker"), "the shared stylesheet owns the map marker styling");

[
  { page: "Aincrad/Map/maps.html", pageStyles: "maps.css" },
  { page: "Fractured Underworld/Main UI/mainui.html", pageStyles: "mainui.css" }
].forEach(({ page, pageStyles }) => {
  const html = read(page);
  const sharedIndex = html.indexOf("sao-map-ui.css");
  const pageIndex = html.indexOf(`href="${pageStyles}"`);
  assert.ok(sharedIndex !== -1, `${page} links the shared map stylesheet`);
  assert.ok(pageIndex !== -1, `${page} links its own stylesheet`);
  assert.ok(sharedIndex < pageIndex, `${page} loads the shared map stylesheet before its own`);
});

/* The page stylesheets may only keep identical rules inside the documented competing-rules section
   (same selectors as page-local rules, where source order decides) - not private copies elsewhere. */
function splitTopLevelBlocks(text) {
  const blocks = [];
  let index = 0;
  let start = 0;
  let depth = 0;
  let inComment = false;
  let inString = null;
  const push = (end) => {
    const raw = text.slice(start, end);
    if (raw.trim()) blocks.push(raw);
    start = end;
  };
  while (index < text.length) {
    const char = text[index];
    const next = text[index + 1];
    if (inComment) {
      if (char === "*" && next === "/") {
        inComment = false;
        index += 1;
      }
    } else if (inString) {
      if (char === "\\") index += 1;
      else if (char === inString) inString = null;
    } else if (char === "/" && next === "*") {
      inComment = true;
      index += 1;
    } else if (char === '"' || char === "'") inString = char;
    else if (char === "{") depth += 1;
    else if (char === "}") {
      depth -= 1;
      if (depth === 0) push(index + 1);
    } else if (char === ";" && depth === 0) push(index + 1);
    index += 1;
  }
  push(text.length);
  return blocks;
}

const normaliseRule = (block) =>
  block
    /* Leading comments are documentation, not styling: two rules are the same rule even when one of
     them is preceded by a file or section comment. */
    .replace(/^\s*(?:\/\*[\s\S]*?\*\/\s*)+/, "")
    .replace(/\s+/g, " ")
    .trim();
const aincradText = read(AINCRAD_STYLES).replace(/\r\n/g, "\n");
const aincradKeys = new Set(splitTopLevelBlocks(aincradText).map(normaliseRule));
const duplicatedAcrossPages = splitTopLevelBlocks(read(UNDERWORLD_STYLES).replace(/\r\n/g, "\n"))
  .map((block) =>
    block
      .replace(/^\s*(?:\/\*[\s\S]*?\*\/\s*)+/, "")
      .replace(/\s+/g, " ")
      .trim()
  )
  .filter((key) => key && aincradKeys.has(key));

const noteIndex = aincradText.indexOf(COMPETING_NOTE);
assert.ok(noteIndex !== -1, "maps.css documents its competing-rules section");
const competingSection = new Set(splitTopLevelBlocks(aincradText.slice(noteIndex)).map(normaliseRule));

duplicatedAcrossPages.forEach((key) => {
  assert.ok(
    competingSection.has(key),
    `maps.css and mainui.css must not both keep this rule outside the competing section: ${key.slice(0, 90)}`
  );
});

assert.equal(
  sharedStyles.includes("!important"),
  false,
  "the shared map stylesheet relies on source order, not !important"
);

console.log(
  `Shared map architecture tests passed (${ICON_KINDS.length} shared icons, ${duplicatedAcrossPages.length} documented competing rules).`
);
