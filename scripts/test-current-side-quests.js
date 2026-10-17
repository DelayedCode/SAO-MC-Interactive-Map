/* Current-Data side quest regression checks.

   The eight Aincrad side quests the source notes supply ship in Current Data only:

     - Aincrad/Quests/quests_current.js holds the quest entries (`sq-1` .. `sq-8`), which is what
       the Quest page's Side filter renders while Current Data is active;
     - Aincrad/Map/maps_current.js holds their map markers, which keep the map's existing Side
       Quest category and carry `dataset: "current"` like every other Current Data waypoint;
     - shared/sao-content-translations.js curates their Spanish and French titles, objectives and
       marker descriptions.

   These checks pin the supplied titles, objective wording, kill counts, NPC names, coordinates,
   EXP and Col rewards, and the Current/Beta split of both the quest entries and the markers. */
"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { readFile } = require("./harness-helpers");
const { translatedContentLanguages } = require("./localization-languages");

const root = path.resolve(__dirname, "..");
/* The languages the content registry has translation slots for: these checks read localized content
   values, so they follow the content-slot configuration, not the site's UI language list. */
/* The content languages whose translations are complete (scripts/localization-languages.js). Italian
   is still being translated - the audit reports that backlog - so its glossary entries are not
   required to be translated here yet. */
const CONTENT_LANGUAGES = translatedContentLanguages();

/* Exactly the eight side quests the notes supply, with every supplied value verbatim. */
const EXPECTED_SIDE_QUESTS = [
  {
    id: "sq-1",
    number: 1,
    title: "Too Many Boars",
    npcName: "Guard Tomas",
    x: 1811,
    z: 3748,
    xpReward: 300,
    colReward: 80,
    objectives: ["Kill enraged boars (0/10)", "Return to Guard Tomas (1811, 3748)"]
  },
  {
    id: "sq-2",
    number: 2,
    title: "Webs to Burn",
    npcName: "Scout Raphael",
    x: 1440,
    z: 3449,
    xpReward: 550,
    colReward: 150,
    objectives: ["Kill young spiders (0/15)", "Return to Scout Raphael (1440, 3449)"]
  },
  {
    id: "sq-3",
    number: 3,
    title: "The Citadel's Cold",
    npcName: "Sentinel Kael",
    x: 4075,
    z: 1990,
    xpReward: 700,
    colReward: 200,
    objectives: ["Take down winter golems (0/10)", "Return to Sentinel Kael (4075, 1990)"]
  },
  {
    id: "sq-4",
    number: 4,
    title: "Frost Swarm",
    npcName: "Hunter Lysa",
    x: 4074,
    z: 1994,
    xpReward: 350,
    colReward: 100,
    objectives: ["Shoot down frost butterflies (0/12)", "Return to Shepherd Ivo (4074, 1994)"]
  },
  {
    id: "sq-5",
    number: 5,
    title: "Wolves of the Valley",
    npcName: "Shepherd Ivo",
    x: 2405,
    z: 4069,
    xpReward: 400,
    colReward: 100,
    objectives: ["Killing White Wolves (0/12)", "Return to Shepherd Ivo (2405, 4069)"]
  },
  {
    id: "sq-6",
    number: 6,
    title: "Clearing the Marsh",
    npcName: "Herbalist Nessa",
    x: 1542,
    z: 3460,
    xpReward: 450,
    colReward: 120,
    objectives: ["Kill spawn slimes (0/20)", "Return to Herbalist Nessa (1542, 3460)"]
  },
  {
    id: "sq-7",
    number: 7,
    title: "Bone and Dust",
    npcName: "Archivist Orin",
    x: 2765,
    z: 4396,
    xpReward: 600,
    colReward: 160,
    objectives: ["Slay skeleton warriors (0/20)", "Return to Archivist Orin (2765, 4396)"]
  },
  {
    id: "sq-8",
    number: 8,
    title: "The Road Is No Longer Safe",
    npcName: "Carter Milo",
    x: 3619,
    z: 3443,
    xpReward: 550,
    colReward: 150,
    objectives: ["Kill highway bandits (0/15)", "Return to Carter Milo (3619, 3443)"]
  }
];

/* --- The Current Data quest entries ------------------------------------------ */
const questContext = { console };
questContext.window = questContext;
vm.runInNewContext(readFile("Aincrad/Quests/quests_current.js"), questContext, {
  filename: "Aincrad/Quests/quests_current.js"
});
const sideQuests = questContext.window.SAO_CURRENT_SIDE_QUESTS;
const mainQuestline = questContext.window.SAO_MAIN_QUESTLINE;
const currentEntries = questContext.window.SAO_CURRENT_QUEST_ENTRIES_BY_FLOOR;

assert.equal(sideQuests.length, EXPECTED_SIDE_QUESTS.length, "Current Data ships exactly eight side quests");

EXPECTED_SIDE_QUESTS.forEach((expected) => {
  const entry = sideQuests.find((candidate) => candidate.id === expected.id);
  assert.ok(entry, `${expected.id} exists in the Current Data side quests`);
  assert.equal(entry.questNumber, expected.number, `${expected.id} quest number`);
  assert.equal(entry.questType, "side", `${expected.id} is a side quest`);
  assert.equal(entry.questName, expected.title, `${expected.id} title`);
  assert.equal(entry.npcName, expected.npcName, `${expected.id} NPC name`);
  assert.equal(entry.coordinates, `${expected.x} / ${expected.z}`, `${expected.id} coordinates`);
  assert.equal(entry.requirements, expected.objectives.join("\n"), `${expected.id} objective wording`);
  assert.equal(entry.xpReward, expected.xpReward, `${expected.id} EXP reward`);
  assert.equal(entry.colReward, expected.colReward, `${expected.id} Col reward`);
  assert.equal(entry.bonusItems, "N/A", `${expected.id} carries no bonus items`);
  assert.equal(entry.world, "aincrad", `${expected.id} belongs to Aincrad`);
  assert.deepEqual(
    { x: entry.markerCoords.x, z: entry.markerCoords.z },
    { x: expected.x, z: expected.z },
    `${expected.id} marker coordinates`
  );
  assert.ok(entry.requirements.includes(expected.objectives[0]), `${expected.id} keeps its kill count`);
  assert.ok(
    entry.requirements.includes(`(${expected.x}, ${expected.z})`),
    `${expected.id} keeps the NPC coordinates in its return step`
  );
});

/* No identifier may be reused: the `sq-` namespace is separate from the questline's `mq-`. */
const sideQuestIds = sideQuests.map((entry) => entry.id);
const mainQuestIds = mainQuestline.map((entry) => entry.id);
assert.equal(new Set(sideQuestIds).size, sideQuestIds.length, "the side quest ids are unique");
assert.equal(
  new Set(sideQuests.map((entry) => entry.questNumber)).size,
  sideQuests.length,
  "the side quest numbers are unique"
);
sideQuestIds.forEach((id) => assert.ok(!mainQuestIds.includes(id), `${id} does not collide with a Main Questline id`));
mainQuestIds.forEach((id) => assert.ok(!sideQuestIds.includes(id), `${id} is not renumbered by the side quests`));

/* --- Current Data surfaces them, Beta-Test Data never does ------------------- */
assert.deepEqual(
  Object.keys(currentEntries).sort(),
  ["floor1", "floor2", "floor3"],
  "Current Data keeps its per-floor entry map"
);
EXPECTED_SIDE_QUESTS.forEach((expected) => {
  const onFloor1 = currentEntries.floor1.filter((entry) => entry.id === expected.id);
  assert.equal(onFloor1.length, 1, `${expected.id} appears exactly once in the Current Data floor 1 entries`);
  assert.equal(onFloor1[0].questType, "side", `${expected.id} stays on the Side filter`);
});
assert.equal(
  currentEntries.floor1.length,
  mainQuestline.length + EXPECTED_SIDE_QUESTS.length,
  "Current Data floor 1 is the Main Questline plus the eight side quests"
);
assert.equal(currentEntries.floor2.length, 0, "Current Data ships no floor 2 entries");
assert.equal(currentEntries.floor3.length, 0, "Current Data ships no floor 3 entries");

const betaContext = { console };
betaContext.window = betaContext;
vm.runInNewContext(readFile("Aincrad/Quests/quests_floor1.js"), betaContext, {
  filename: "Aincrad/Quests/quests_floor1.js"
});
const betaEntries = betaContext.window.QUEST_ENTRIES_BY_FLOOR.floor1;
const betaTitles = new Set(betaEntries.map((entry) => entry.questName));
const betaNpcs = new Set(betaEntries.map((entry) => entry.npcName));
EXPECTED_SIDE_QUESTS.forEach((expected) => {
  assert.ok(!betaTitles.has(expected.title), `${expected.title} is not a Beta-Test quest entry`);
  assert.ok(!betaNpcs.has(expected.npcName), `${expected.npcName} is not a Beta-Test quest NPC`);
});
/* --- The Current Data map markers -------------------------------------------- */
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
vm.runInNewContext(`${bundleFiles.map((file) => readFile(file)).join("\n")}\nwindow.__data = DATA;\n`, dataContext, {
  filename: "map-data-bundle.js"
});
const data = dataContext.__data;

EXPECTED_SIDE_QUESTS.forEach((expected) => {
  const marker = data[expected.id];
  assert.ok(marker, `${expected.id} has a map marker`);
  assert.equal(marker.title, expected.title, `${expected.id} marker title`);
  assert.equal(marker.type, "Quest", `${expected.id} marker type`);
  assert.equal(marker.category, "sideQuests", `${expected.id} marker keeps the Side Quest category`);
  assert.equal(marker.dataset, "current", `${expected.id} marker is Current Data`);
  assert.equal(marker.floor, "floor1", `${expected.id} marker floor`);
  assert.equal(marker.questNumber, expected.number, `${expected.id} marker quest number`);
  assert.deepEqual(
    { x: marker.coords.x, z: marker.coords.z },
    { x: expected.x, z: expected.z },
    `${expected.id} marker coordinates match the quest entry`
  );
  assert.equal(marker.description, expected.objectives[1], `${expected.id} marker describes the NPC it stands on`);
  assert.ok(!/^\s*(Quest|Side Quest)\s*:/.test(marker.title), `${expected.id} title carries no label prefix`);
});

/* Marker ids are unique across the whole dataset, so no Beta marker is shadowed. */
const betaMarkerIds = Object.keys(data).filter((id) => data[id].dataset !== "current");
EXPECTED_SIDE_QUESTS.forEach((expected) => {
  assert.ok(!betaMarkerIds.includes(expected.id), `${expected.id} is not already a Beta-Test marker id`);
});
assert.equal(new Set(Object.keys(data)).size, Object.keys(data).length, "every map marker id is unique");

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
EXPECTED_SIDE_QUESTS.forEach((expected) => {
  assert.ok(currentMode[expected.id], `${expected.id} side quest marker is kept in Current Data`);
  assert.equal(betaMode[expected.id], undefined, `${expected.id} side quest marker is hidden in Beta-Test Data`);
});

/* --- The curated Spanish and French translations ----------------------------- */
const registryContext = { window: {}, console };
vm.runInNewContext(readFile("shared/sao-content-translations.js"), registryContext, {
  filename: "shared/sao-content-translations.js"
});
const registry = registryContext.window.SAOContentTranslations;
const slugify = (value) =>
  String(value || "unknown")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "unknown";

function assertTranslated(key, language, english, label) {
  const value = registry[language][key];
  assert.ok(value, `${label} has a ${language} translation`);
  assert.notEqual(value, english, `${label} is really translated into ${language}`);
}

EXPECTED_SIDE_QUESTS.forEach((expected) => {
  const entry = sideQuests.find((candidate) => candidate.id === expected.id);
  registry.registerQuestEntry(entry, slugify);
  CONTENT_LANGUAGES.forEach((language) => {
    assertTranslated(`quest.${expected.id}.questName`, language, expected.title, `${expected.id} title`);
    assertTranslated(
      `quest.${expected.id}.requirements`,
      language,
      expected.objectives.join("\n"),
      `${expected.id} objectives`
    );
  });
  registry.registerMapMarker(expected.id, data[expected.id]);
  CONTENT_LANGUAGES.forEach((language) => {
    assertTranslated(`map.${expected.id}.title`, language, expected.title, `${expected.id} marker title`);
    assertTranslated(
      `map.${expected.id}.description`,
      language,
      expected.objectives[1],
      `${expected.id} marker description`
    );
  });
});

console.log(
  JSON.stringify(
    {
      sideQuests: sideQuests.length,
      currentFloor1Entries: currentEntries.floor1.length,
      currentSideQuestMarkers: EXPECTED_SIDE_QUESTS.length,
      status: "passed"
    },
    null,
    2
  )
);
