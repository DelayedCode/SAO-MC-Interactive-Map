/* Current-Data waypoint regression checks.

   Current Data ships the Accessory Blacksmith, Secret Accessory Blacksmith and Occult Merchant
   waypoints on floor 1, plus a copy of every Beta Biome-category waypoint. Aincrad/Map/
   maps_current.js is their single source and every marker carries `dataset: "current"`, which
   shared/sao-datasets.js uses to keep them out of Beta mode. These checks pin the supplied
   coordinates and categories, the copied biome waypoints, the category buttons behind them, and
   the Beta/Current split. */
"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { readFile } = require("./harness-helpers");

const root = path.resolve(__dirname, "..");

/* Load the Aincrad map data the way the page does: one shared DATA object created by mapData.js and
   filled in by the floor files, the Main Questline file and the Current Data file. */
const bundleFiles = [
  "Aincrad/Map/mapData.js",
  "Aincrad/Map/maps_floor1.js",
  "Aincrad/Map/maps_floor2.js",
  "Aincrad/Map/maps_floor3.js",
  "Aincrad/Map/maps_mainquests.js",
  "Aincrad/Map/maps_current.js"
];
const dataContext = { console };
dataContext.window = dataContext;
vm.runInNewContext(
  `${bundleFiles.map((file) => fs.readFileSync(path.join(root, file), "utf8")).join("\n")}\nwindow.__data = DATA;\n`,
  dataContext,
  { filename: "map-data-bundle.js" }
);
const data = dataContext.__data;

/* Exactly the waypoints Current Data supplies, with the coordinates and categories as given. */
const EXPECTED_WAYPOINTS = [
  { id: "current-accessories-blacksmith-iron", title: "Iron Accessories", category: "accessoriesBlacksmith", x: 1764, z: 4144 },
  { id: "current-accessories-blacksmith-copper", title: "Copper Accessories", category: "accessoriesBlacksmith", x: 1773, z: 345 },
  { id: "current-accessories-blacksmith-nepenthes", title: "Nepenthes Accessories", category: "accessoriesBlacksmith", x: 3151, z: 3701 },
  { id: "current-accessories-blacksmith-elite-treant", title: "Elite Treant Accessories", category: "accessoriesBlacksmith", x: 1491, z: 3419 },
  { id: "current-secret-accessory-blacksmith-ice-bracelet", title: "Bracelet of Ice", category: "secretAccessoryBlacksmith", x: 2416, z: 1800 },
  { id: "current-secret-accessory-blacksmith-aragorn-necklace", title: "Necklace of Aragorn", category: "secretAccessoryBlacksmith", x: 1114, z: 1172 },
  { id: "current-secret-accessory-blacksmith-sticky-ring", title: "Sticky Ring", category: "secretAccessoryBlacksmith", x: 390, z: 3064 },
  { id: "current-secret-accessory-blacksmith-skeleton-skull", title: "Skeleton Skull", category: "secretAccessoryBlacksmith", x: 1163, z: 3546 },
  { id: "current-secret-accessory-blacksmith-deer-belt", title: "Belt of the Stags", category: "secretAccessoryBlacksmith", x: 3650, z: 1331 },
  { id: "current-secret-accessory-blacksmith-leviathan-ring", title: "Ring of the Leviathan", category: "secretAccessoryBlacksmith", x: 1316, z: 2096 },
  { id: "current-occult-merchant-gloves", title: "Occult Merchant - Gloves", category: "occultMerchants", x: 3371, z: 1698 },
  { id: "current-occult-merchant-bracelet", title: "Occult Merchant - Bracelet", category: "occultMerchants", x: 3348, z: 1634 },
  { id: "current-occult-merchant-ring", title: "Occult Merchant - Ring", category: "occultMerchants", x: 3319, z: 1722 },
  { id: "current-occult-merchant-amulet", title: "Occult Merchant - Amulet", category: "occultMerchants", x: 3320, z: 1665 },
  { id: "current-occult-merchant-artifacts", title: "Occult Merchant - Artifacts", category: "occultMerchants", x: 867, z: 4033 },
  { id: "current-loot-buyer-magical-icy", title: "Magical & Icy Loot Buyer", category: "lootBuyers", x: 3317, z: 1642 },
  { id: "current-loot-buyer-virelune", title: "Virelune - Loot Buyer", category: "lootBuyers", x: 1604, z: 1970 },
  { id: "current-loot-buyer-vallhat", title: "Vallhat - Loot Buyer", category: "lootBuyers", x: 412, z: 3089 },
  { id: "current-loot-buyer-ika-citadel", title: "Ika Citadel - Loot Buyer", category: "lootBuyers", x: 3277, z: 4170 },
  { id: "current-loot-buyer-boar-and-wolf", title: "Boar and Wolf loot buyer", category: "lootBuyers", x: 1787, z: 4179 },
  { id: "current-loot-buyer-mizunari", title: "Mizunari Loot Buyer", category: "lootBuyers", x: 3132, z: 3704 },
  { id: "current-loot-buyer-geldorack-mine", title: "Geldorack Mine Dungeon - Loot Buyer", category: "lootBuyers", x: 4280, z: 3887 },
  { id: "current-loot-buyer-cursed-ruins", title: "Cursed Ruins - Loot Buyer", category: "lootBuyers", x: 2857, z: 4487 },
  { id: "current-loot-buyer-cursed-ruins-2", title: "Cursed Ruins - Loot Buyer (2)", category: "lootBuyers", x: 2832, z: 4709 },
  { id: "current-loot-buyer-hanaka", title: "Hanaka - Loot Buyer", category: "lootBuyers", x: 1504, z: 3396 },
  { id: "current-loot-buyer-fallen-labyrinth", title: "Labyrinth of the Fallen - Loot Buyer", category: "lootBuyers", x: 2403, z: 2385 },
  { id: "current-loot-buyer-fallen-labyrinth-2", title: "Labyrinth of the Fallen (2) - Loot Buyer", category: "lootBuyers", x: 2389, z: 2408 },
  { id: "current-loot-buyer-aragorn", title: "Aragorn's Lair - Loot Buyer", category: "lootBuyers", x: 1020, z: 1176 },
  { id: "current-starting-merchant", title: "Starting Merchant", category: "toolMerchants", x: 1787, z: 4179 },
  { id: "current-starting-town-tools", title: "F1 - Starting Town - Tools", category: "toolMerchants", x: 1787, z: 4161 },
  { id: "current-consumables-merchant-purification-alchemist", title: "F1 - PvP Purification Alchemist", category: "consumablesMerchants", x: 1813, z: 4180 },
  { id: "current-consumables-merchant-assistant", title: "The Assistant", category: "consumablesMerchants", x: 1772, z: 4102 },
  { id: "current-dungeon-guard-geldorack", title: "F1 - Geldorack Dungeon Guard - Starting Town", category: "keyBlacksmith", x: 4281, z: 3893 },
  { id: "current-dungeon-guard-fallen-labyrinth", title: "F1 - Fallen Labyrinth Dungeon Guard - Tolbana", category: "keyBlacksmith", x: 2378, z: 2410 },
  { id: "current-dungeon-guard-xal-zirith", title: "F1 - Xal'Zirith Dungeon Guard - Candelia", category: "keyBlacksmith", x: 1013, z: 1189 },
  { id: "current-kobold-dungeon-loot-info", title: "Kobold Dungeon - Loot Info", category: "dungeons", x: 3396, z: 1081 }
];

/* --- The supplied Current waypoints are shipped in full ---------------------- */
const currentWaypoints = Object.values(data).filter((marker) => marker.dataset === "current");
const currentBiomes = currentWaypoints.filter((marker) => marker.category === "biomes");
const betaBiomes = Object.values(data).filter(
  (marker) => marker.category === "biomes" && marker.dataset !== "current"
);
assert.equal(
  currentWaypoints.length,
  EXPECTED_WAYPOINTS.length + currentBiomes.length,
  "only the supplied Current waypoints and the copied biome waypoints are added"
);

EXPECTED_WAYPOINTS.forEach((expected) => {
  const marker = data[expected.id];
  assert.ok(marker, `${expected.id} exists in the map data`);
  assert.equal(marker.title, expected.title, `${expected.id} title`);
  assert.equal(marker.category, expected.category, `${expected.id} category`);
  assert.equal(marker.floor, "floor1", `${expected.id} floor`);
  assert.equal(marker.dataset, "current", `${expected.id} is Current Data`);
  assert.deepEqual({ x: marker.coords.x, z: marker.coords.z }, { x: expected.x, z: expected.z }, `${expected.id} coordinates`);
});

/* --- The Beta Biome waypoints are copied into Current Data unchanged ---------- */
const biomeSignature = (marker) => `${marker.title}|${marker.floor}|${marker.coords.x}|${marker.coords.z}`;
assert.equal(currentBiomes.length, 71, "the Beta Biome category supplies 71 waypoints");
assert.equal(
  currentBiomes.length,
  betaBiomes.length,
  "every Beta biome waypoint has a Current Data copy"
);
const betaBiomeSignatures = new Set(betaBiomes.map(biomeSignature));
currentBiomes.forEach((marker) => {
  assert.equal(marker.dataset, "current", `${marker.title} biome is Current Data`);
  assert.equal(marker.type, "Biome", `${marker.title} biome keeps its type`);
  assert.ok(
    betaBiomeSignatures.has(biomeSignature(marker)),
    `the Current ${marker.title} biome carries the Beta coordinates unchanged`
  );
});

/* --- The waypoint categories exist in the map's own architecture ------------- */
assert.match(readFile("Aincrad/Map/adapter.js"), /accessoriesBlacksmith:\s*true/, "the map adapter declares the Accessories Blacksmith category");
assert.match(readFile("Aincrad/Map/adapter.js"), /secretAccessoryBlacksmith:\s*true/, "the map adapter declares the Secret Accessory Blacksmith category");
assert.match(readFile("Aincrad/Map/adapter.js"), /occultMerchants:\s*true/, "the map adapter declares the Occult Merchant category");
assert.match(readFile("Aincrad/Map/maps.js"), /secretAccessoryBlacksmith:\s*false/, "the Secret Accessory Blacksmith category starts disabled");

["accessoriesBlacksmith", "secretAccessoryBlacksmith", "occultMerchants"].forEach((category) => {
  assert.match(
    readFile("Aincrad/Map/maps.html"),
    new RegExp(`data-category="${category}"`),
    `the map sidebar carries the ${category} button`
  );
  assert.match(
    readFile("Aincrad/Map/maps.html"),
    new RegExp(`data-i18n="page\\.maps\\.categories\\.${category}"`),
    `the ${category} button uses the localized label`
  );
  assert.equal(
    (readFile("shared/sao-i18n.js").match(new RegExp(`${category}:\\s*"`, "g")) || []).length,
    3,
    `the ${category} label is translated in English, Spanish and French`
  );
  assert.match(readFile("shared/sao-color-utils.js"), new RegExp(`${category}:\\s*"#`), `the ${category} category keeps its colour`);
});
assert.match(readFile("shared/sao-map-helpers.js"), /secretAccessoryBlacksmith/, "the Secret Accessory Blacksmith category keeps its icon and grouping");

/* --- The markers are Current Data only --------------------------------------- */
["Aincrad/Map/maps_floor1.js", "Aincrad/Map/maps_floor2.js", "Aincrad/Map/maps_floor3.js"].forEach((file) =>
  assert.doesNotMatch(readFile(file), /dataset:\s*"current"/, `${file} carries no Current Data marker`)
);
assert.doesNotMatch(readFile("Aincrad/Map/maps_mainquests.js"), /dataset:\s*"current"/, "the Main Questline file needs no Current Data marker");

/* --- The shared mode filter keeps the two datasets apart --------------------- */
function loadDatasets(search) {
  const pagePath = "/Aincrad/Map/maps.html";
  const context = vm.createContext({
    console,
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
    Map,
    Set,
    document: { createElement: () => null, head: { appendChild() {} }, body: { appendChild() {} } },
    SAOStorage: { getItem: () => null, setItem() {} },
    SAOI18n: { t: (key) => key },
    location: {
      href: `https://example.test${pagePath}${search}`,
      pathname: pagePath,
      search: search || "",
      origin: "https://example.test"
    }
  });
  context.window = context;
  context.globalThis = context;
  vm.runInContext(fs.readFileSync(path.join(root, "shared", "sao-datasets.js"), "utf8"), context, {
    filename: "shared/sao-datasets.js"
  });
  return context.window.SAODatasets;
}

const currentMode = loadDatasets("?dataset=current").filterMarkerDatasetForActiveMode(data);
const betaMode = loadDatasets("").filterMarkerDatasetForActiveMode(data);

EXPECTED_WAYPOINTS.forEach((expected) => {
  assert.ok(currentMode[expected.id], `${expected.id} is kept in Current mode`);
  assert.equal(betaMode[expected.id], undefined, `${expected.id} is hidden in Beta mode`);
});
assert.ok(
  Object.values(currentMode).every((marker) => marker.category === "mainQuests" || marker.dataset === "current"),
  "Current mode keeps only the Main Questline and the Current waypoints"
);
assert.ok(
  Object.values(betaMode).every((marker) => marker.category !== "mainQuests" && marker.dataset !== "current"),
  "Beta mode keeps neither the Main Questline nor the Current waypoints"
);
assert.equal(
  Object.keys(currentMode).length,
  EXPECTED_WAYPOINTS.length + currentBiomes.length + Object.values(data).filter((marker) => marker.category === "mainQuests").length,
  "Current mode is the Main Questline plus the supplied Current waypoints"
);

console.log(
  JSON.stringify(
    {
      currentWaypoints: currentWaypoints.length,
      currentModeMarkers: Object.keys(currentMode).length,
      betaModeMarkers: Object.keys(betaMode).length,
      status: "passed"
    },
    null,
    2
  )
);


