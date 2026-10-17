/* Current-Data waypoint regression checks.

   Current Data ships the Accessory Blacksmith (one smith per accessory set), the Secret Accessory
   Blacksmith and Occult Merchant
   waypoints on floor 1, the Materials Blacksmith locations (the Sewer Reshaper and the Cabinetmaker),
   the Floor 1 World Event, the Local Lumberjack loot buyer, the two accessory blacksmiths and the
   Equipment Blacksmith the accessory update adds (the Wolf and Bandit Accessories and the Nodachi
   Blacksmith) and the Candelia and Local Miner loot buyers, plus a copy of every Beta
   Biome-category waypoint and of every Beta Boss
   Spawn, Dungeon and Farming Spot - except the Birch Forest farming spot, which the accessory update
   merges into the renamed Oak/Birch Forest. Aincrad/Map/maps_current.js is their single source and
   every
   marker carries `dataset: "current"`, which shared/sao-datasets.js uses to keep them out of Beta
   mode. The same file carries the eight Current Data side quest markers (`sq-1` .. `sq-8`), which
   keep the map's existing Side Quest category. These checks pin the supplied
   coordinates and categories, the copied biome/boss/dungeon/farming waypoints, the three supplied
   boss-spawn corrections (the added Corrupted Pumba, the moved Albal, the removed Kazor), the three
   underground equipment locations, the category buttons behind them, the three merchant categories
   Current Data no longer carries, and the Beta/Current split. */
"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { readFile } = require("./harness-helpers");
const { uiLanguages } = require("./localization-languages");

const root = path.resolve(__dirname, "..");
/* The map category labels live in the UI dictionary, so every supported UI language has to carry one.
   The list is read from the shared configuration (scripts/localization-languages.js) so a new
   language is covered here without editing this file. */
const UI_LANGUAGES = uiLanguages();

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
  { id: "current-accessories-blacksmith-copper", title: "Copper Accessories", category: "accessoriesBlacksmith", x: 1771, z: 4131 },
  { id: "current-accessories-blacksmith-nepenthes", title: "Nepenthes Accessories", category: "accessoriesBlacksmith", x: 3151, z: 3701 },
  { id: "current-accessories-blacksmith-elite-treant", title: "Elite Treant Accessories", category: "accessoriesBlacksmith", x: 1491, z: 3419 },
  { id: "current-accessories-blacksmith-spider", title: "Spider Accessories", category: "accessoriesBlacksmith", x: 1996, z: 811 },
  { id: "current-accessories-blacksmith-slime", title: "Slime Accessories", category: "accessoriesBlacksmith", x: 394, z: 3084 },
  { id: "current-accessories-blacksmith-shark", title: "Shark Accessories", category: "accessoriesBlacksmith", x: 1570, z: 1994 },
  { id: "current-accessories-blacksmith-deer", title: "Deer Accessories", category: "accessoriesBlacksmith", x: 3232, z: 1474 },
  { id: "current-accessories-blacksmith-ice-golem", title: "Ice Golem Accessories", category: "accessoriesBlacksmith", x: 3238, z: 1477 },
  { id: "current-accessories-blacksmith-ice-spirit", title: "Ice Spirit Accessories", category: "accessoriesBlacksmith", x: 3228, z: 1488 },
  { id: "current-accessories-blacksmith-skeleton", title: "Skeleton Accessories", category: "accessoriesBlacksmith", x: 1226, z: 3601 },
  { id: "current-secret-accessory-blacksmith-ice-bracelet", title: "Bracelet of Ice", category: "secretAccessoryBlacksmith", x: 2416, z: 1800 },
  { id: "current-secret-accessory-blacksmith-aragorn-necklace", title: "Necklace of Aragorn", category: "secretAccessoryBlacksmith", x: 1114, z: 1172 },
  { id: "current-secret-accessory-blacksmith-sticky-ring", title: "Secret Sticky Ring Merchant", category: "secretAccessoryBlacksmith", x: 390, z: 3064 },
  { id: "current-secret-accessory-blacksmith-skeleton-skull", title: "Skeleton Skull", category: "secretAccessoryBlacksmith", x: 1163, z: 3546 },
  { id: "current-secret-accessory-blacksmith-deer-belt", title: "Secret Deer Belt Merchant", category: "secretAccessoryBlacksmith", x: 3650, z: 1331 },
  { id: "current-secret-accessory-blacksmith-leviathan-ring", title: "Ring of the Leviathan", category: "secretAccessoryBlacksmith", x: 1316, z: 2096 },
  { id: "current-secret-accessory-blacksmith-gloves-of-the-wolves", title: "Secret Accessory Blacksmith", category: "secretAccessoryBlacksmith", x: 2494, z: 3700 },
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
  { id: "current-alchemist", title: "Alchemist", category: "alchemist", x: 1771, z: 4097 },
  { id: "current-starting-merchant", title: "Starting Merchant", category: "toolMerchants", x: 1787, z: 4179 },
  { id: "current-starting-town-tools", title: "F1 - Starting Town - Tools", category: "toolMerchants", x: 1787, z: 4161 },
  { id: "current-consumables-merchant-purification-alchemist", title: "F1 - PvP Purification Alchemist", category: "consumablesMerchants", x: 1813, z: 4180 },
  { id: "current-consumables-merchant-assistant", title: "The Assistant", category: "consumablesMerchants", x: 1772, z: 4102 },
  { id: "current-dungeon-guard-geldorack", title: "F1 - Geldorack Dungeon Guard - Starting Town", category: "keyBlacksmith", x: 4281, z: 3893 },
  { id: "current-dungeon-guard-fallen-labyrinth", title: "F1 - Fallen Labyrinth Dungeon Guard - Tolbana", category: "keyBlacksmith", x: 2378, z: 2410 },
  { id: "current-dungeon-guard-xal-zirith", title: "F1 - Xal'Zirith Dungeon Guard - Candelia", category: "keyBlacksmith", x: 1013, z: 1189 },
  { id: "current-key-blacksmith-kobold", title: "Key Blacksmith", category: "keyBlacksmith", x: 3396, z: 1081 },
  /* The waypoints the later Current-Data update adds: the Sylve Accessories blacksmith, the secret
     Gelatinous Cloak location, the Local Lumberjack loot buyer, the two Materials Blacksmith
     locations (the underground Sewer Reshaper and the Cabinetmaker) and the Floor 1 World Event. */
  { id: "current-accessories-blacksmith-sylve", title: "Sylve Accessories", category: "accessoriesBlacksmith", x: 1538, z: 3525 },
  { id: "current-secret-accessory-blacksmith-gelatinous-cloak", title: "Secret Gelatinous Cloak", category: "secretAccessoryBlacksmith", x: 2854, z: 4657 },
  { id: "current-loot-buyer-local-lumberjack", title: "Local Lumberjack", category: "lootBuyers", x: 2467, z: 4320 },
  /* The waypoints the accessory update adds: the Wolf and Bandit accessory blacksmiths, the first
     Equipment Blacksmith (the Nodachi Blacksmith) and the Candelia and Local Miner loot buyers. */
  { id: "current-accessories-blacksmith-wolf", title: "Wolf Accessories", category: "accessoriesBlacksmith", x: 2397, z: 3568 },
  { id: "current-accessories-blacksmith-bandit", title: "Bandit Accessories", category: "accessoriesBlacksmith", x: 4169, z: 3933 },
  { id: "current-equipment-blacksmith-nodachi", title: "Nodachi Blacksmith", category: "equipmentBlacksmith", x: 3226, z: 1456 },
  { id: "current-loot-buyer-candelia", title: "Candelia", category: "lootBuyers", x: 2029, z: 790 },
  { id: "current-loot-buyer-local-miner", title: "Local Miner", category: "lootBuyers", x: 2400, z: 3560 },
  { id: "current-materials-blacksmith-sewer-reshaper", title: "Sewer Reshaper", category: "materialsBlacksmith", x: 2864, z: 4740 },
  { id: "current-materials-blacksmith-cabinetmaker", title: "Cabinetmaker", category: "materialsBlacksmith", x: 2461, z: 4301 },
  { id: "current-world-event-floor-1", title: "Floor 1 World Event", category: "worldEvents", x: 1947, z: 1990 }
];

/* The eight Current Data side quests ship as map markers in the same file: the `sq-` id, the
   map's existing Side Quest category, the floor 1 NPC location and the coordinates
   Aincrad/Quests/quests_current.js supplies. */
const EXPECTED_SIDE_QUEST_MARKERS = [
  { id: "sq-1", title: "Too Many Boars", x: 1811, z: 3748 },
  { id: "sq-2", title: "Webs to Burn", x: 1440, z: 3449 },
  { id: "sq-3", title: "The Citadel's Cold", x: 4075, z: 1990 },
  { id: "sq-4", title: "Frost Swarm", x: 4074, z: 1994 },
  { id: "sq-5", title: "Wolves of the Valley", x: 2405, z: 4069 },
  { id: "sq-6", title: "Clearing the Marsh", x: 1542, z: 3460 },
  { id: "sq-7", title: "Bone and Dust", x: 2765, z: 4396 },
  { id: "sq-8", title: "The Road Is No Longer Safe", x: 3619, z: 3443 }
];

/* --- The supplied Current waypoints are shipped in full ---------------------- */
const currentWaypoints = Object.values(data).filter((marker) => marker.dataset === "current");
const currentBiomes = currentWaypoints.filter((marker) => marker.category === "biomes");
const betaBiomes = Object.values(data).filter(
  (marker) => marker.category === "biomes" && marker.dataset !== "current"
);
const currentBossSpawns = currentWaypoints.filter((marker) => marker.category === "bossSpawns");
const currentDungeons = currentWaypoints.filter((marker) => marker.category === "dungeons");
const currentFarmingSpots = currentWaypoints.filter((marker) => marker.category === "farmingSpots");
/* The dungeons category ships the seven transferred dungeons and nothing else: the marker that used
   to sit in it was the Kobold key blacksmith, corrected into the Key Blacksmith category. */
const transferredDungeons = currentDungeons;
assert.equal(
  currentWaypoints.length,
  EXPECTED_WAYPOINTS.length +
    currentBiomes.length +
    EXPECTED_SIDE_QUEST_MARKERS.length +
    currentBossSpawns.length +
    transferredDungeons.length +
    currentFarmingSpots.length,
  "only the supplied Current waypoints, the copied biome/boss/dungeon/farming waypoints and the side quests are added"
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

EXPECTED_SIDE_QUEST_MARKERS.forEach((expected) => {
  const marker = data[expected.id];
  assert.ok(marker, `${expected.id} exists in the map data`);
  assert.equal(marker.title, expected.title, `${expected.id} title`);
  assert.equal(marker.category, "sideQuests", `${expected.id} keeps the Side Quest category`);
  assert.equal(marker.type, "Quest", `${expected.id} keeps the Quest marker type`);
  assert.equal(marker.floor, "floor1", `${expected.id} floor`);
  assert.equal(marker.dataset, "current", `${expected.id} is Current Data`);
  assert.deepEqual(
    { x: marker.coords.x, z: marker.coords.z },
    { x: expected.x, z: expected.z },
    `${expected.id} coordinates`
  );
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

/* --- Every Beta Boss Spawn, Dungeon and Farming Spot has a Current Data copy ---
   The copies keep the Beta marker's own title, floor and coordinates. Three supplied corrections
   apply to the copies only: the Kazor spawn at (2442, 957) is not copied, the Albal spawn moves
   from (2392, 3832) to (2513, 3722), and Corrupted Pumba is added at (1987, 3636). */
const betaCategory = (category) =>
  Object.values(data).filter((marker) => marker.category === category && marker.dataset !== "current");
const betaBossSpawns = betaCategory("bossSpawns");
const betaDungeons = betaCategory("dungeons");
const betaFarmingSpots = betaCategory("farmingSpots");
assert.equal(betaBossSpawns.length, 39, "the Beta-Test dataset ships 39 boss spawns");
assert.equal(betaDungeons.length, 7, "the Beta-Test dataset ships 7 dungeons");
assert.equal(betaFarmingSpots.length, 5, "the Beta-Test dataset ships 5 farming spots");
assert.equal(currentBossSpawns.length, 39, "Current Data ships all 39 supplied boss spawns");
assert.equal(
  currentDungeons.length,
  betaDungeons.length,
  "Current Data ships exactly the seven transferred dungeons, with the Kobold key blacksmith moved out of the category"
);
assert.equal(currentFarmingSpots.length, 4, "Current Data ships the four supplied farming spots");

const REMOVED_BOSS = { title: "Kazor", x: 2442, z: 957 };
const MOVED_BOSS = { title: "Albal", fromX: 2392, fromZ: 3832, toX: 2513, toZ: 3722 };
const ADDED_BOSS = { title: "Corrupted Pumba", x: 1987, z: 3636 };
/* The supplied boss-name correction: the Current copy of the ruins dungeon boss carries the exact
   bestiary name "Narax the Cursed Skeleton", while Beta-Test Data keeps its own spelling, so the
   copy is recognised by its coordinates instead of its title. */
const RENAMED_BOSS = {
  betaTitle: "Narax Cursed Skeleton",
  currentTitle: "Narax the Cursed Skeleton",
  x: 2722,
  z: 4332
};
/* The supplied resource-name corrections for the four Current farming spots: the Beta-Test copies
   keep their own wording, the Current copies use the confirmed item names. The Oak Forest copy took
   the supplied Oak/Birch Forest name and the Birch Forest copy is gone, so the Current set no longer
   mirrors the Beta set one for one; both are checked below. */
const FARMING_DROPS = {
  "West Mines": ["Coal Ore", "Copper Ingot", "Iron Ingot"],
  "East Mines": ["Coal Ore", "Copper Ingot", "Iron Ingot"],
  "Oak/Birch Forest": ["Oak Log"],
  Farm: ["Allium Flower", "Wheat"]
};
const copiedMarkers = [...currentBossSpawns, ...transferredDungeons, ...currentFarmingSpots];
const copiedSignatures = new Set(copiedMarkers.map(biomeSignature));
betaBossSpawns.forEach((marker) => {
  const atBetaPosition = marker.coords.x === REMOVED_BOSS.x && marker.coords.z === REMOVED_BOSS.z;
  const removed = marker.title === REMOVED_BOSS.title && atBetaPosition;
  const moved =
    marker.title === MOVED_BOSS.title && marker.coords.x === MOVED_BOSS.fromX && marker.coords.z === MOVED_BOSS.fromZ;
  const renamed =
    marker.title === RENAMED_BOSS.betaTitle && marker.coords.x === RENAMED_BOSS.x && marker.coords.z === RENAMED_BOSS.z;
  assert.equal(
    copiedSignatures.has(biomeSignature(marker)),
    !(removed || moved || renamed),
    removed || moved
      ? `${marker.title} at its Beta position (${marker.coords.x}, ${marker.coords.z}) is not copied`
      : renamed
        ? `${marker.title} keeps its Beta title and is copied under the corrected bestiary name`
        : `the Current ${marker.title} copy keeps the Beta title, floor and coordinates`
  );
});
/* Every Beta Dungeon is copied unchanged. The Farming Spots carry the supplied update: the Oak
   Forest copy takes the Oak/Birch Forest name while keeping the Beta floor and coordinates, and the
   Birch Forest copy is gone, merged into it, so those two are matched by name and position instead of
   by an unchanged signature. */
const RENAMED_FOREST = { betaTitle: "Oak Forest", currentTitle: "Oak/Birch Forest" };
const REMOVED_FOREST = { title: "Birch Forest", x: 1788, z: 1196 };
[...betaDungeons, ...betaFarmingSpots].forEach((marker) => {
  if (marker.title === REMOVED_FOREST.title) {
    assert.equal(
      copiedMarkers.filter((candidate) => candidate.title === REMOVED_FOREST.title).length,
      0,
      "Current Data ships no Birch Forest farming spot"
    );
    return;
  }
  if (marker.title === RENAMED_FOREST.betaTitle) {
    assert.ok(
      copiedSignatures.has(
        biomeSignature({ title: RENAMED_FOREST.currentTitle, floor: marker.floor, coords: marker.coords })
      ),
      "the Current Oak/Birch Forest keeps the Beta Oak Forest floor and coordinates"
    );
    return;
  }
  assert.ok(
    copiedSignatures.has(biomeSignature(marker)),
    `the Current ${marker.title} copy keeps the Beta title, floor and coordinates`
  );
});
assert.ok(
  copiedSignatures.has(biomeSignature({ title: ADDED_BOSS.title, floor: "floor1", coords: { x: ADDED_BOSS.x, z: ADDED_BOSS.z } })),
  `the added ${ADDED_BOSS.title} spawn sits at (${ADDED_BOSS.x}, ${ADDED_BOSS.z})`
);
assert.ok(
  copiedSignatures.has(
    biomeSignature({ title: MOVED_BOSS.title, floor: "floor1", coords: { x: MOVED_BOSS.toX, z: MOVED_BOSS.toZ } })
  ),
  `the moved ${MOVED_BOSS.title} spawn sits at (${MOVED_BOSS.toX}, ${MOVED_BOSS.toZ})`
);
assert.equal(
  copiedMarkers.filter((marker) => marker.title === REMOVED_BOSS.title).length,
  0,
  "Current Data ships no Kazor spawn"
);
assert.equal(
  copiedMarkers.filter(
    (marker) =>
      marker.title === ADDED_BOSS.title && marker.coords.x === ADDED_BOSS.x && marker.coords.z === ADDED_BOSS.z
  ).length,
  1,
  "Current Data ships exactly one Corrupted Pumba at (1987, 3636)"
);
assert.equal(
  copiedMarkers.filter(
    (marker) =>
      marker.title === MOVED_BOSS.title && marker.coords.x === MOVED_BOSS.fromX && marker.coords.z === MOVED_BOSS.fromZ
  ).length,
  0,
  "the old Albal position is gone from Current Data"
);

/* --- The corrected boss name --------------------------------------------------
   The Current copy carries the exact bestiary name so its View Waypoint Info button resolves,
   Beta-Test Data keeps the spelling it already shipped. */
const renamedBossCopy = copiedMarkers.find(
  (marker) =>
    marker.category === "bossSpawns" && marker.coords.x === RENAMED_BOSS.x && marker.coords.z === RENAMED_BOSS.z
);
assert.ok(renamedBossCopy, `the Current copy of the (${RENAMED_BOSS.x}, ${RENAMED_BOSS.z}) boss exists`);
assert.equal(renamedBossCopy.title, RENAMED_BOSS.currentTitle, "the corrected boss copy uses the bestiary name");
assert.equal(renamedBossCopy.floor, "floor1", "the corrected boss copy keeps its floor");
assert.equal(
  copiedMarkers.filter((marker) => marker.title === RENAMED_BOSS.betaTitle).length,
  0,
  "no Current marker keeps the old boss spelling"
);
assert.ok(
  betaBossSpawns.some(
    (marker) =>
      marker.title === RENAMED_BOSS.betaTitle && marker.coords.x === RENAMED_BOSS.x && marker.coords.z === RENAMED_BOSS.z
  ),
  "Beta-Test Data keeps its own boss spelling"
);

/* Every copy is Current Data, keeps its marker type, and keeps the Beta metadata (drops,
   description and the underground flag) unless it is one of the three corrected markers. */
copiedMarkers.forEach((marker) => {
  const original = [...betaBossSpawns, ...betaDungeons, ...betaFarmingSpots].find(
    (candidate) => biomeSignature(candidate) === biomeSignature(marker)
  );
  assert.equal(marker.dataset, "current", `${marker.title} (${marker.category}) is Current Data`);
  assert.ok(["Boss", "Dungeon", "Biome"].includes(marker.type), `${marker.title} keeps its marker type`);
  assert.equal(marker.floor, original ? original.floor : "floor1", `${marker.title} keeps its floor`);
  if (original) {
    if (marker.category === "farmingSpots") {
      /* The five Current farming spots carry the confirmed resource names instead of the Beta
         wording, so their drops and the description that lists them are checked against those.
         Array.from copies the VM-realm array into this realm before the comparison. */
      assert.deepEqual(
        Array.from(marker.drops),
        FARMING_DROPS[marker.title],
        `${marker.title} uses the confirmed resource names`
      );
      FARMING_DROPS[marker.title].forEach((resource) => {
        assert.ok(marker.description.includes(resource), `${marker.title} description names ${resource}`);
      });
    } else {
      assert.deepEqual(marker.drops, original.drops, `${marker.title} keeps the Beta drops`);
      assert.equal(marker.description, original.description, `${marker.title} keeps the Beta description`);
    }
    assert.equal(
      marker.underground === true,
      original.underground === true,
      `${marker.title} keeps the Beta underground flag`
    );
  }
});

/* The renamed forest keeps everything the Current Oak Forest shipped: its id, category, floor,
   coordinates, drops, surface placement and description shape. Only the name changed, so the
   description follows the marker naming convention with the new name. */
const RENAMED_FOREST_ID = "current-oak-forest";
const renamedForest = data[RENAMED_FOREST_ID];
assert.ok(renamedForest, "the Current Oak/Birch Forest farming spot exists under the Oak Forest id");
assert.equal(renamedForest.title, RENAMED_FOREST.currentTitle, "the renamed forest carries the supplied name");
assert.equal(renamedForest.category, "farmingSpots", "the renamed forest stays a farming spot");
assert.equal(renamedForest.floor, "floor1", "the renamed forest keeps its floor");
assert.deepEqual(
  { x: renamedForest.coords.x, z: renamedForest.coords.z },
  { x: 2459, z: 4320 },
  "the renamed forest keeps the Oak Forest coordinates"
);
assert.deepEqual(
  Array.from(renamedForest.drops),
  FARMING_DROPS[RENAMED_FOREST.currentTitle],
  "the renamed forest keeps its drops"
);
assert.equal(renamedForest.underground === true, false, "the renamed forest is a surface marker");
assert.ok(
  renamedForest.description.startsWith(`${RENAMED_FOREST.currentTitle} — Coordinates X: 2459 Z: 4320.`),
  "the renamed forest description carries the new name and the unchanged coordinates"
);
assert.equal(
  copiedMarkers.filter(
    (marker) => marker.category === "farmingSpots" && marker.coords.x === REMOVED_FOREST.x && marker.coords.z === REMOVED_FOREST.z
  ).length,
  0,
  "no farming spot sits at the removed Birch Forest coordinates"
);

/* --- The Kobold key blacksmith is no longer a dungeon loot-info marker --------
   The entry was supplied as "Kobold Dungeon - Loot Info" in the Dungeon category. It is a Key
   Blacksmith, so it carries the marker type, category and description the three Dungeon Guard key
   blacksmiths above use, with the supplied coordinates and floor unchanged. */
const KOBOLD_KEY_BLACKSMITH = { id: "current-key-blacksmith-kobold", x: 3396, z: 1081 };
const koboldKeyBlacksmith = data[KOBOLD_KEY_BLACKSMITH.id];
assert.ok(koboldKeyBlacksmith, `${KOBOLD_KEY_BLACKSMITH.id} exists in the map data`);
assert.equal(koboldKeyBlacksmith.title, "Key Blacksmith", "the corrected marker is named Key Blacksmith");
assert.equal(koboldKeyBlacksmith.type, "NPC", "the corrected marker uses the Key Blacksmith marker type");
assert.equal(koboldKeyBlacksmith.category, "keyBlacksmith", "the corrected marker sits in the Key Blacksmith category");
assert.equal(
  koboldKeyBlacksmith.description,
  "Key Blacksmith",
  "the corrected marker describes itself as a Key Blacksmith"
);
assert.equal(koboldKeyBlacksmith.dataset, "current", "the corrected marker is Current Data");
assert.equal(koboldKeyBlacksmith.floor, "floor1", "the corrected marker keeps its floor");
assert.deepEqual(
  { x: koboldKeyBlacksmith.coords.x, z: koboldKeyBlacksmith.coords.z },
  { x: KOBOLD_KEY_BLACKSMITH.x, z: KOBOLD_KEY_BLACKSMITH.z },
  "the corrected marker keeps its coordinates"
);
assert.equal(data["current-kobold-dungeon-loot-info"], undefined, "the old loot-info id is gone");
assert.equal(
  Object.values(data).some((marker) => /loot info/i.test(marker.title)),
  false,
  "no marker is called loot info"
);
/* The four key blacksmiths share one shape and four distinct positions, so the corrected entry is
   not a duplicate of the three Dungeon Guard key blacksmiths. */
const currentKeyBlacksmiths = Object.entries(data).filter(
  ([, marker]) => marker.dataset === "current" && marker.category === "keyBlacksmith"
);
assert.equal(currentKeyBlacksmiths.length, 4, "Current Data ships four key blacksmiths");
currentKeyBlacksmiths.forEach(([id, marker]) => {
  assert.equal(marker.type, "NPC", `${id} uses the Key Blacksmith marker type`);
  assert.equal(marker.description, "Key Blacksmith", `${id} describes itself as a Key Blacksmith`);
  assert.equal(marker.floor, "floor1", `${id} sits on floor 1`);
});
assert.equal(
  currentKeyBlacksmiths.filter(
    ([, marker]) => marker.coords.x === KOBOLD_KEY_BLACKSMITH.x && marker.coords.z === KOBOLD_KEY_BLACKSMITH.z
  ).length,
  1,
  "exactly one key blacksmith sits at the corrected coordinates"
);
assert.equal(
  new Set(currentKeyBlacksmiths.map(([, marker]) => `${marker.coords.x},${marker.coords.z}`)).size,
  4,
  "the four key blacksmiths keep four distinct positions"
);
/* The Kobold Key the corrected blacksmith makes points at the corrected location name. */
assert.match(
  readFile("Aincrad/eCompendium/ecompendium_current.js"),
  /name: "Kobold Key",[\s\S]{0,200}?craftingLocation: "Key Blacksmith"/,
  "the Kobold Key is crafted at the corrected Key Blacksmith location"
);
assert.doesNotMatch(
  readFile("Aincrad/eCompendium/ecompendium_current.js"),
  /Kobold Dungeon - Loot Info/,
  "no equipment entry still names the old dungeon loot-info location"
);
assert.match(
  readFile("shared/sao-content-translations.js"),
  /"Key Blacksmith": \["[^"]+", "[^"]+"(?:, "[^"]+")?\]/,
  "the Key Blacksmith label keeps its Spanish and French translation"
);

/* --- The two supplied equipment locations are underground --------------------
   The map runtime shows a marker on the underground layer when `underground` is true, so the two
   secret accessory blacksmiths the update names carry it. Their names, category, floor and
   coordinates are unchanged, and no other Current waypoint becomes underground. */
const UNDERGROUND_EQUIPMENT = [
  { id: "current-secret-accessory-blacksmith-deer-belt", title: "Secret Deer Belt Merchant", x: 3650, z: 1331 },
  { id: "current-secret-accessory-blacksmith-leviathan-ring", title: "Ring of the Leviathan", x: 1316, z: 2096 }
];
UNDERGROUND_EQUIPMENT.forEach((expected) => {
  const marker = data[expected.id];
  assert.ok(marker, `${expected.id} exists in the map data`);
  assert.equal(marker.title, expected.title, `${expected.id} keeps its name`);
  assert.equal(marker.category, "secretAccessoryBlacksmith", `${expected.id} keeps its category`);
  assert.equal(marker.dataset, "current", `${expected.id} is Current Data`);
  assert.equal(marker.floor, "floor1", `${expected.id} keeps its floor`);
  assert.equal(marker.underground, true, `${expected.title} is classified as underground`);
  assert.deepEqual(
    { x: marker.coords.x, z: marker.coords.z },
    { x: expected.x, z: expected.z },
    `${expected.id} keeps its coordinates`
  );
});
assert.deepEqual(
  currentWaypoints
    .filter((marker) => marker.category === "secretAccessoryBlacksmith" && marker.underground === true)
    .map((marker) => marker.title)
    .sort(),
  ["Ring of the Leviathan", "Secret Deer Belt Merchant", "Secret Gelatinous Cloak"],
  "the three supplied equipment locations are underground"
);
/* The Materials Blacksmith category ships two locations, and only the Sewer Reshaper is supplied as
   an underground one. */
assert.deepEqual(
  currentWaypoints
    .filter((marker) => marker.category === "materialsBlacksmith" && marker.underground === true)
    .map((marker) => marker.title),
  ["Sewer Reshaper"],
  "the Sewer Reshaper is underground and the Cabinetmaker is not"
);

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
    UI_LANGUAGES.length,
    `the ${category} label is translated in every supported language`
  );
  assert.match(readFile("shared/sao-color-utils.js"), new RegExp(`${category}:\\s*"#`), `the ${category} category keeps its colour`);
});
assert.match(readFile("shared/sao-map-helpers.js"), /secretAccessoryBlacksmith/, "the Secret Accessory Blacksmith category keeps its icon and grouping");

/* --- The categories this Current-Data update adds exist in the map's architecture --------------
   The Materials Blacksmith, the Equipment Blacksmith and the World Event are declared in the
   adapter, start disabled in the page state, own a sidebar button with a localized label in every
   supported language, carry a JourneyMap colour and - for the craftsman categories - the shared
   craftsman icon and grouping. */
["materialsBlacksmith", "equipmentBlacksmith", "worldEvents"].forEach((category) => {
  assert.match(
    readFile("Aincrad/Map/adapter.js"),
    new RegExp(`${category}:\\s*true`),
    `the map adapter declares the ${category} category`
  );
  assert.match(
    readFile("Aincrad/Map/maps.js"),
    new RegExp(`${category}:\\s*false`),
    `the ${category} category starts disabled`
  );
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
    UI_LANGUAGES.length,
    `the ${category} label is translated in every supported language`
  );
  assert.match(
    readFile("shared/sao-color-utils.js"),
    new RegExp(`${category}:\\s*"#`),
    `the ${category} category keeps its colour`
  );
});
assert.match(
  readFile("shared/sao-map-helpers.js"),
  /materialsBlacksmith/,
  "the Materials Blacksmith category keeps its icon and grouping"
);
assert.match(
  readFile("shared/sao-map-helpers.js"),
  /equipmentBlacksmith/,
  "the Equipment Blacksmith category keeps its icon and grouping"
);
assert.match(
  readFile("shared/sao-map-helpers.js"),
  /worldEvent:/,
  "the World Event glyph is part of the shared marker icon library"
);

/* --- The three merchant categories Current Data no longer carries -------------------------------
   The Accessories Merchant, the Equipment Merchant and the Traveling Merchants have no Current Data
   waypoint behind them, so they are declared as Beta-only categories: their buttons disappear while
   Current Data is active and Beta keeps every button and marker. */
["accessoriesMerchants", "equipmentMerchants", "travelingMerchants"].forEach((category) => {
  const adapterSource = readFile("Aincrad/Map/adapter.js");
  assert.equal(
    (adapterSource.match(new RegExp(`${category}:\\s*true`, "g")) || []).length,
    2,
    `the ${category} category stays declared and is listed as Beta-only`
  );
  assert.equal(
    currentWaypoints.filter((marker) => marker.category === category).length,
    0,
    `Current Data ships no ${category} waypoint`
  );
});

/* --- The CastleMist biome is renamed Castlebrume ------------------------------
   The rename reaches the biome marker of both datasets, the side quest NPC descriptions that name
   the city and the Beta side quests' own city field. Coordinates, boundaries, colours and the
   description are untouched, and the Beta marker itself is not removed. */
const RENAMED_BIOME = { currentId: "current-castlebrume", betaId: "castlebrume", x: 2872, z: 2987 };
[RENAMED_BIOME.currentId, RENAMED_BIOME.betaId].forEach((id) => {
  const marker = data[id];
  assert.ok(marker, `${id} exists in the map data`);
  assert.equal(marker.title, "Castlebrume", `${id} carries the new biome name`);
  assert.equal(marker.type, "Biome", `${id} keeps its marker type`);
  assert.equal(marker.category, "biomes", `${id} keeps its category`);
  assert.deepEqual(
    { x: marker.coords.x, z: marker.coords.z },
    { x: RENAMED_BIOME.x, z: RENAMED_BIOME.z },
    `${id} keeps its coordinates`
  );
});
assert.equal(data["current-castlemist"], undefined, "the old Current biome id is gone");
assert.equal(data.castlemist, undefined, "the old Beta biome id is gone");
assert.equal(
  Object.values(data).some((marker) => /castlemist/i.test(marker.title)),
  false,
  "no marker still carries the old biome name"
);
/* The side quest NPCs that name the city follow the rename, in the map data and in the quests. */
assert.equal(
  Object.values(data).filter((marker) => marker.description === "Side Quest NPC in Castlebrume.").length,
  3,
  "the three side quest NPCs that name the city follow the rename"
);
assert.equal(
  Object.values(data).some((marker) => /castlemist/i.test(marker.description || "")),
  false,
  "no marker description still names CastleMist"
);
const betaQuestCities = [...readFile("Aincrad/Quests/quests_floor1.js").matchAll(/city: "([^"]+)"/g)].map(
  (match) => match[1]
);
assert.equal(
  betaQuestCities.filter((city) => city === "Castlebrume").length,
  3,
  "the three Beta side quests name the renamed city"
);
assert.doesNotMatch(
  readFile("Aincrad/Quests/quests_floor1.js"),
  /CastleMist/,
  "no Beta quest still names CastleMist"
);
assert.match(
  readFile("shared/sao-content-translations.js"),
  /Castlebrume: \["[^"]+", "[^"]+", "[^"]+"\]/,
  "the renamed biome keeps its Spanish, French and Italian labels"
);

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

EXPECTED_SIDE_QUEST_MARKERS.forEach((expected) => {
  assert.ok(currentMode[expected.id], `${expected.id} side quest marker is kept in Current mode`);
  assert.equal(betaMode[expected.id], undefined, `${expected.id} side quest marker is hidden in Beta mode`);
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
  EXPECTED_WAYPOINTS.length +
    currentBiomes.length +
    EXPECTED_SIDE_QUEST_MARKERS.length +
    currentBossSpawns.length +
    transferredDungeons.length +
    currentFarmingSpots.length +
    Object.values(data).filter((marker) => marker.category === "mainQuests").length,
  "Current mode is the Main Questline plus the supplied Current waypoints, the copied Beta waypoints and the side quests"
);

console.log(
  JSON.stringify(
    {
      currentWaypoints: currentWaypoints.length,
      currentSideQuestMarkers: EXPECTED_SIDE_QUEST_MARKERS.length,
      currentModeMarkers: Object.keys(currentMode).length,
      betaModeMarkers: Object.keys(betaMode).length,
      status: "passed"
    },
    null,
    2
  )
);


