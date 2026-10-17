/* Focused checks for shared/sao-argo-engine.js (Argo's data engine).
 *
 * The engine is loaded into a VM context together with the REAL repository data files, so most checks
 * are integration-style: they assert what the engine does with the data the site actually ships. A few
 * edge cases (malformed records, an entirely empty page) use small injected fixtures through the
 * engine's documented registerSources()/sources seam, because that state cannot be produced safely from
 * the real datasets.
 *
 * Nothing here writes to a dataset, storage or the network. */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

const ENGINE_SOURCE = read("shared/sao-argo-engine.js");

/* Shared modules the pages load before the engine (slug helper, dataset rules, content registry). */
const SHARED_FILES = ["shared/sao-page-helpers.js", "shared/sao-datasets.js", "shared/sao-content-translations.js"];

/* The Current-Data files a feature page loads, in the order the pages load them (mapData declares
   DATA/MOB_AREA_MOBS). Beta-Test files are deliberately absent: Argo does not support that mode. */
const AINCRAD_FILES = [
  "Aincrad/Map/mapData.js",
  "Aincrad/Map/maps_floor1.js",
  "Aincrad/Map/maps_floor2.js",
  "Aincrad/Map/maps_mainquests.js",
  "Aincrad/Map/maps_current.js",
  "Aincrad/Bestiary/bestiary_current.js",
  "Aincrad/eCompendium/ecompendium_current.js",
  "Aincrad/Quests/quests_current.js"
];

/* Every Beta-Test file Argo must never load or read. */
const BETA_FILES = [
  "Aincrad/Bestiary/bestiary_floor1.js",
  "Aincrad/Bestiary/bestiary_floor2.js",
  "Aincrad/Bestiary/bestiary_floor3.js",
  "Aincrad/eCompendium/ecompendium_floor1.js",
  "Aincrad/eCompendium/ecompendium_floor2.js",
  "Aincrad/eCompendium/ecompendium_floor3.js",
  "Aincrad/Quests/quests_floor1.js",
  "Aincrad/Quests/quests_floor2.js",
  "Aincrad/Quests/quests_floor3.js"
];

/* The Fractured Underworld loads its own data and never loads Aincrad's mapData.js. */
const UNDERWORLD_FILES = [
  "Fractured Underworld/Main UI/underworldData.js",
  "Fractured Underworld/Compendium/compendium_current.js",
  "Aincrad/Quests/quests_current.js"
];

function createHarness(options = {}) {
  const storageCalls = [];
  const record = (label) => {
    storageCalls.push(label);
  };
  const documentStub = {
    getElementById: () => null,
    createElement: () => ({
      style: {},
      classList: { add() {}, remove() {} },
      setAttribute() {},
      appendChild() {},
      addEventListener() {},
      remove() {}
    }),
    addEventListener() {},
    removeEventListener() {},
    querySelector: () => null,
    querySelectorAll: () => [],
    head: { appendChild() {} },
    body: { appendChild() {} }
  };
  Object.defineProperty(documentStub, "cookie", {
    get() {
      record("document.cookie:get");
      return "";
    },
    set(value) {
      record(`document.cookie:set:${value}`);
    }
  });

  const context = vm.createContext({
    console,
    URL,
    URLSearchParams,
    document: documentStub,
    location: { href: "https://example.test/", pathname: "/", search: options.search || "" },
    localStorage: {
      getItem() {
        record("localStorage.getItem");
        return null;
      },
      setItem() {
        record("localStorage.setItem");
      },
      removeItem() {
        record("localStorage.removeItem");
      }
    },
    sessionStorage: {
      getItem() {
        record("sessionStorage.getItem");
        return null;
      },
      setItem() {
        record("sessionStorage.setItem");
      }
    },
    setTimeout,
    clearTimeout
  });
  context.window = context;
  context.globalThis = context;
  context.SAOStorage = {
    getItem() {
      record("SAOStorage.getItem");
      return null;
    },
    setItem() {
      record("SAOStorage.setItem");
    },
    removeItem() {
      record("SAOStorage.removeItem");
    },
    getJSON(_key, fallback) {
      record("SAOStorage.getJSON");
      return fallback;
    },
    setJSON() {
      record("SAOStorage.setJSON");
    }
  };

  const files = (options.shared === false ? [] : SHARED_FILES).concat(options.dataFiles || []);
  for (const file of files) {
    vm.runInContext(read(file), context, { filename: file });
  }
  vm.runInContext(ENGINE_SOURCE, context, { filename: "shared/sao-argo-engine.js" });

  return {
    context,
    engine: context.SAOArgoEngine,
    storageCalls,
    documentStub,
    /* Convenience: query with an explicit context so no test depends on the page's URL. */
    ask(question, overrides) {
      return context.SAOArgoEngine.query(
        question,
        Object.assign({ world: "aincrad", dataset: "current", floor: "floor1" }, overrides || {})
      );
    }
  };
}

function aincradHarness(overrides) {
  return createHarness(Object.assign({ dataFiles: AINCRAD_FILES }, overrides || {}));
}

/* The Map page's own data: the shared map dataset and its Current markers, areas and corrections. */
const MAP_PAGE_FILES = [
  "Aincrad/Map/mapData.js",
  "Aincrad/Map/maps_floor1.js",
  "Aincrad/Map/maps_floor2.js",
  "Aincrad/Map/maps_mainquests.js",
  "Aincrad/Map/maps_current.js"
];

/* Emulates shared/sao-argo-data-frame.js: the real Current-Data files are loaded into a scratch realm
   and the resulting globals are captured, exactly as the frame posts them back to a page. */
function buildAincradSnapshot() {
  const scratch = createHarness({ shared: false, dataFiles: [] });
  const context = scratch.context;
  const run = (file) => vm.runInContext(read(file), context, { filename: file });
  const evaluate = (expression) => vm.runInContext(expression, context);

  MAP_PAGE_FILES.forEach(run);
  const snapshot = {
    markerData: evaluate("typeof DATA === 'undefined' ? undefined : DATA"),
    mobAreaMobs: evaluate("typeof MOB_AREA_MOBS === 'undefined' ? undefined : MOB_AREA_MOBS"),
    currentMobAreas: evaluate("window.SAO_CURRENT_MOB_AREAS"),
    currentMobAreaLinks: evaluate("window.SAO_CURRENT_MOB_AREA_MOB_LINKS")
  };

  run("Aincrad/Bestiary/bestiary_current.js");
  snapshot.currentBestiary = evaluate("window.SAO_CURRENT_BESTIARY_DATA");
  run("Aincrad/eCompendium/ecompendium_current.js");
  snapshot.currentEquipment = evaluate("window.SAO_CURRENT_EQUIPMENT_DATA");
  run("Aincrad/Quests/quests_current.js");
  snapshot.currentQuests = evaluate("window.SAO_CURRENT_QUEST_ENTRIES_BY_FLOOR");
  return snapshot;
}

/* The harness is exported so a diagnostic script (or a future test) can reuse it without running this
   file's checks; the checks themselves only run when this file is executed directly. */
module.exports = {
  createHarness,
  aincradHarness,
  SHARED_FILES,
  AINCRAD_FILES,
  BETA_FILES,
  UNDERWORLD_FILES,
  ENGINE_SOURCE
};

/* --- Checks ---------------------------------------------------------------- */

const CHECK_FIELDS = [
  "engine",
  "question",
  "normalizedQuestion",
  "context",
  "sources",
  "status",
  "intent",
  "shape",
  "entity",
  "entityType",
  "match",
  "candidates",
  "facts",
  "dataQuality",
  "confidence",
  "clarification",
  "unsupportedReason",
  /* Stage 5: what the question was understood as. */
  "plan"
];

function stripComments(source) {
  return String(source)
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:])\/\/.*$/gm, "$1");
}

/* Values returned by the engine live in the VM realm, so their prototypes differ from this file's
   objects and deepStrictEqual would reject an otherwise identical value. Comparing JSON keeps the
   assertions realm-safe. */
function sameJson(actual, expected, message) {
  assert.equal(JSON.stringify(actual), JSON.stringify(expected), message);
}

async function run() {
  const results = [];

  /* 1. Public API and invalid input. */
  {
    const harness = aincradHarness();
    const engine = harness.engine;
    assert.equal(typeof engine, "object", "the engine publishes a global namespace");
    assert.equal(engine.version, "1.3.0", "the engine reports its version");
    assert.equal(engine.supportedDatasets.join(","), "current", "only Current Data is supported");
    assert.equal(engine.datasets.join(","), "beta,current", "Beta-Test is still recognised so it can be refused");
    for (const key of [
      "normalizeQuestion",
      "detectFloorHint",
      "query",
      "createEngine",
      "describeSources",
      "clearCache",
      "registerSources",
      "resetSources"
    ]) {
      assert.equal(typeof engine[key], "function", `the engine exposes ${key}()`);
    }
    assert.deepEqual(Object.values(engine.statuses).sort(), ["ambiguous", "answer", "missing", "unsupported"]);
    for (const intent of ["item", "mob", "drop", "mobDrops", "npc", "recipe", "quest", "location", "help"]) {
      assert.ok(Object.values(engine.intents).includes(intent), `the intents include ${intent}`);
    }

    for (const invalid of [undefined, null, "", "   ", "!!!", "??", 123, {}, []]) {
      const result = engine.query(invalid, { world: "aincrad", dataset: "current", floor: "floor1" });
      assert.equal(result.status, "unsupported", `invalid input ${JSON.stringify(invalid)} is unsupported`);
      assert.equal(result.unsupportedReason, "empty-question", "invalid input is reported as an empty question");
      assert.equal(result.entity, null, "invalid input resolves no entity");
      sameJson(result.facts, {}, "invalid input produces no facts");
      sameJson(result.candidates, [], "invalid input produces no candidates");
    }

    /* The dataset check comes first: nothing at all is read while Beta-Test Data is selected, not even
       for input that could never be answered. */
    const betaBlocked = engine.query("", { world: "aincrad", dataset: "beta", floor: "floor1" });
    assert.equal(betaBlocked.unsupportedReason, "dataset-unsupported", "Beta is refused before anything else");

    const shaped = engine.query("where is spider silk", { world: "aincrad", dataset: "current", floor: "floor1" });
    for (const field of CHECK_FIELDS) {
      assert.ok(Object.prototype.hasOwnProperty.call(shaped, field), `results carry ${field}`);
    }
    assert.equal(shaped.question, "where is spider silk", "the original question text is preserved");
    sameJson(shaped.context, { world: "aincrad", dataset: "current", floor: "floor1", language: "en" });
    results.push("public-api-and-invalid-input");
  }

  /* 2. Normalization. */
  {
    const harness = aincradHarness();
    const { normalizeQuestion } = harness.engine;
    assert.equal(normalizeQuestion("Where can I find Ice Spirit?!"), "where can i find ice spirit");
    assert.equal(normalizeQuestion("  Jabalí   CORRUPTO  "), "jabali corrupto");
    assert.equal(normalizeQuestion("What's Spider-Silk's drop?"), "what s spider silk s drop");
    assert.equal(normalizeQuestion("Arakh'Nol"), "arakh nol");
    assert.equal(normalizeQuestion(null), "");
    assert.equal(normalizeQuestion(42), "42");

    const result = harness.ask("Where can I find ICE   Spirit?", { dataset: "current" });
    assert.equal(result.question, "Where can I find ICE   Spirit?", "the display text is untouched");
    assert.equal(result.normalizedQuestion, "where can i find ice spirit", "matching uses the normalized text");
    assert.equal(result.entity.name, "Ice Spirit", "the normalized question still resolves the entity");
    results.push("normalization");
  }

  /* 3. Item facts (statistics) and the recipe intent. */
  {
    const harness = aincradHarness();
    const stats = harness.ask("what are the stats of the sticky ring", { dataset: "current" });
    assert.equal(stats.status, "answer", "the Sticky Ring has a record");
    assert.equal(stats.intent, "item");
    assert.equal(stats.entityType, "item");
    assert.equal(stats.entity.name, "Sticky Ring");
    assert.equal(stats.entity.contentKey, "equipment.sticky-ring.name", "the entity carries its content key");
    assert.equal(stats.facts.record.level, 5);
    assert.equal(stats.facts.record.set, "Little Slime Set");
    assert.equal(stats.facts.record.stats.Defense, "+1");
    assert.equal(stats.facts.record.category, "accessory");
    assert.equal(stats.facts.record.dataset, "current");
    assert.equal(stats.dataQuality.complete, true, "a fully documented item is a complete answer");

    const recipe = harness.ask("how do i craft the sticky ring", { dataset: "current" });
    assert.equal(recipe.intent, "recipe");
    assert.equal(recipe.status, "answer");
    assert.equal(recipe.facts.craftingResources.length, 4, "the documented recipe lists every resource");
    sameJson(recipe.facts.craftingResources[0], { item: "Slime Jelly", itemId: "slime-jelly", amount: 12 });
    assert.equal(recipe.facts.craftingLocation, "Secret Sticky Ring Merchant");
    assert.equal(recipe.facts.craftingLocationMarker.id, "current-secret-accessory-blacksmith-sticky-ring");
    sameJson(recipe.facts.craftingLocationMarker.coords, { x: 390, z: 3064 });
    assert.equal(recipe.dataQuality.complete, true, "recipe + location is a complete answer");

    /* The same question in Beta-Test mode is refused outright: the Beta equipment file is never read. */
    const betaRecipe = harness.ask("how do i craft curved bow", { dataset: "beta" });
    assert.equal(betaRecipe.status, "unsupported", "Beta mode never reads the Beta equipment file");
    assert.equal(betaRecipe.unsupportedReason, "dataset-unsupported");
    assert.equal(betaRecipe.facts.craftingResources, undefined, "no Beta recipe is produced");

    /* A real item that documents resources but no crafting location. */
    const partial = harness.ask("how do i craft training sword", { dataset: "current" });
    assert.equal(partial.status, "answer");
    assert.equal(partial.facts.craftingLocation, null);
    assert.ok(partial.dataQuality.notes.includes("crafting-location-absent"));
    assert.equal(partial.dataQuality.complete, false, "an incomplete record is not a complete answer");
    results.push("item-and-recipe-intents");
  }

  /* 4. Mob facts and mob drops. */
  {
    const harness = aincradHarness();
    const spawn = harness.ask("where does forest spider spawn", { dataset: "current" });
    assert.equal(spawn.status, "answer");
    assert.equal(spawn.intent, "mob");
    assert.equal(spawn.entity.name, "Forest Spider");
    assert.equal(spawn.facts.bestiary.tab, "regular");
    assert.equal(spawn.facts.spawnAreas.length, 1);
    assert.equal(spawn.facts.spawnAreas[0].areaId, "arakh-nol-mobs");
    assert.equal(spawn.facts.spawnAreas[0].area, "Arakh'Nol");
    assert.equal(spawn.facts.spawnAreas[0].dataset, "current");

    const drops = harness.ask("what does forest spider drop", { dataset: "current" });
    assert.equal(drops.intent, "mobDrops");
    assert.equal(drops.status, "answer");
    const silk = drops.facts.drops.find((drop) => drop.item === "Spider Silk");
    assert.ok(silk, "the Bestiary drop list is returned");
    assert.equal(silk.chance, 85, "the documented chance is returned as a number");
    assert.equal(silk.recordPresent, false, "the engine reports that no item record exists for the drop");
    assert.equal(drops.facts.drops.find((drop) => drop.item === "Spider Cloth").chance, 70);
    results.push("mob-and-mob-drop-intents");
  }

  /* 5. Drop-source intent, including an item with no record of its own. */
  {
    const harness = aincradHarness();
    const result = harness.ask("which mobs drop spider silk", { dataset: "current" });
    assert.equal(result.status, "answer", "a listed drop is answerable without an item record");
    assert.equal(result.intent, "drop");
    assert.equal(result.entity.name, "Spider Silk");
    assert.equal(result.entity.recordPresent, false, "the entity reports its missing record");
    assert.equal(result.facts.itemRecordPresent, false);
    assert.equal(result.facts.droppedBy.length, 1);
    assert.equal(result.facts.droppedBy[0].mob, "Forest Spider");
    assert.equal(result.facts.droppedBy[0].mobRecordPresent, true);
    assert.equal(result.facts.droppedBy[0].chance, 85);
    assert.ok(result.dataQuality.notes.includes("item-record-missing"));

    const beta = harness.ask("what does spider silk come from", { dataset: "beta" });
    assert.equal(beta.status, "unsupported", "a drop-source question in Beta mode is refused");
    assert.equal(beta.unsupportedReason, "dataset-unsupported");
    assert.equal(beta.facts.droppedBy, undefined, "no Beta drop row is produced");

    const current = harness.ask("which mobs drop spider silk", { dataset: "current" });
    assert.equal(current.facts.droppedBy[0].notes, null, "Current rows carry no Beta note");
    results.push("drop-source-intent");
  }

  /* 6. NPC/merchant, quest, location and help intents. */
  {
    const harness = aincradHarness();
    const merchant = harness.ask("where is the secret sticky ring merchant", { dataset: "current" });
    assert.equal(merchant.status, "answer");
    assert.equal(merchant.intent, "npc");
    assert.equal(merchant.entityType, "merchant");
    assert.equal(merchant.entity.name, "Secret Sticky Ring Merchant");
    assert.equal(merchant.facts.markers.length, 1);
    assert.equal(merchant.facts.markers[0].category, "secretAccessoryBlacksmith");
    sameJson(merchant.facts.markers[0].coords, { x: 390, z: 3064 });
    assert.equal(merchant.facts.sells.length, 1, "the item whose craftingLocation names this merchant is listed");
    assert.equal(merchant.facts.sells[0].item, "Sticky Ring");

    /* A Current biome marker and the Current mob area that shares its title are one entity with both
       sets of facts - the merge the map's own Current data relies on. */
    const merged = harness.ask("where is arakh nol", { dataset: "current" });
    assert.equal(merged.status, "answer");
    assert.equal(merged.entity.name, "Arakh'Nol");
    assert.ok(merged.facts.markers.length >= 1, "the Current biome marker is kept");
    assert.ok(merged.facts.areas.length >= 1, "and the Current mob area of the same name merges in");
    assert.ok(
      merged.facts.mobs.some((mob) => mob.mob === "Forest Spider"),
      "the Current area lists its own mob rows"
    );

    const quest = harness.ask("where is a new world", { dataset: "current" });
    assert.equal(quest.intent, "quest");
    assert.equal(quest.status, "answer");
    assert.equal(quest.entityType, "quest");
    assert.equal(quest.facts.quests[0].id, "mq-1");
    assert.equal(quest.facts.quests[0].questNumber, 1);
    assert.equal(quest.facts.quests[0].npcName, "Mysterious Character");
    assert.equal(quest.facts.quests[0].requirements, "Talk to the Mysterious Character (0, 200, 5)");
    assert.ok(quest.facts.markers.length >= 1, "the quest marker is merged onto the quest entity");
    assert.ok(
      quest.facts.markers.some((marker) => marker.coords && marker.coords.x === 2 && marker.coords.z === 17),
      "the quest marker keeps its documented coordinates"
    );

    const location = harness.ask("where is swamp putride", { dataset: "current" });
    assert.equal(location.intent, "location");
    assert.equal(location.status, "answer");
    assert.ok(location.facts.markers.length >= 1, "the Current biome marker is found");
    assert.ok(location.facts.areas.length >= 1, "the Current mob area with the same name is merged in");
    const areaMobs = location.facts.mobs.map((mob) => mob.mob);
    assert.ok(areaMobs.includes("Treant Warrior"), "the Current area lists its mob rows");
    assert.equal(location.facts.areas[0].dataset, "current");

    const help = harness.ask("what can you do", { dataset: "current" });
    assert.equal(help.intent, "help");
    assert.equal(help.status, "answer");
    for (const intent of ["item", "mob", "drop", "mobDrops", "npc", "recipe", "quest", "location"]) {
      assert.ok(help.facts.intents.includes(intent), `the help intent lists ${intent}`);
    }
    assert.equal(help.entity, null, "the help intent resolves no entity");
    results.push("npc-quest-location-help-intents");
  }

  /* 7. Ambiguous, missing and unsupported questions. */
  {
    const harness = aincradHarness();

    const ambiguous = harness.ask("where is the slime", { dataset: "current" });
    assert.equal(ambiguous.status, "ambiguous", "a partial name that fits many entities is not guessed");
    assert.equal(ambiguous.entity, null);
    sameJson(ambiguous.facts, {}, "an ambiguous question carries no facts");
    assert.ok(ambiguous.candidates.length >= 3, "the candidates are offered");
    assert.equal(ambiguous.clarification.reason, "multiple-matches");
    assert.equal(ambiguous.clarification.options.length, ambiguous.candidates.length);
    assert.ok(ambiguous.candidates.every((candidate) => candidate.id && candidate.type && candidate.name));
    assert.equal(ambiguous.confidence.quality, "partial");

    const missing = harness.ask("what is spider silk", { dataset: "current" });
    assert.equal(missing.status, "missing", "a known drop with no item record is reported as missing data");
    assert.equal(missing.entity.name, "Spider Silk");
    assert.ok(missing.dataQuality.notes.includes("item-record-missing"));
    assert.equal(missing.dataQuality.complete, false);

    const unsupported = harness.ask("what is the weather in tokyo", { dataset: "current" });
    assert.equal(unsupported.status, "unsupported");
    assert.equal(unsupported.entity, null);
    sameJson(unsupported.facts, {}, "an unsupported question fabricates nothing");
    assert.ok(unsupported.dataQuality.notes.includes("absence-is-not-proof"));

    const noEntity = harness.ask("where is the fluffy unicorn of doom", { dataset: "current" });
    assert.equal(noEntity.status, "unsupported");
    assert.equal(noEntity.unsupportedReason, "no-entity-match");

    const noShape = harness.ask("spider silk", { dataset: "current" });
    assert.equal(noShape.entity.name, "Spider Silk", "a bare name still resolves the entity");
    assert.equal(noShape.intent, "item");
    results.push("ambiguous-missing-unsupported");
  }

  /* 8. Similar names must not silently resolve to the wrong entity. */
  {
    const harness = aincradHarness();

    /* "Health Potion" is a real tiered family: the question matches several records equally well, so the
       engine asks instead of picking a tier. */
    const potion = harness.ask("where can i find a health potion", { dataset: "current" });
    assert.equal(potion.status, "ambiguous", "a tiered name is not silently collapsed");
    assert.equal(potion.entity, null);
    const names = potion.candidates.map((candidate) => candidate.name);
    assert.ok(names.includes("Health Potion I"), "the tier names are offered as choices");
    assert.ok(names.length >= 2, "more than one tier is offered");

    /* A long exact name inside a shorter one resolves to the more specific record. */
    const merchant = harness.ask("where is the secret sticky ring merchant", { dataset: "current" });
    assert.equal(merchant.status, "answer", "the longer exact name wins over the shorter one inside it");
    assert.equal(merchant.entity.name, "Secret Sticky Ring Merchant");

    /* Current Data's own correction is what maps that area row to the Current Bestiary name, and the
       Beta-Test wording is not silently claimed in its place. */
    const currentSpirit = harness.ask("where does ice spirit spawn", { dataset: "current" });
    assert.equal(currentSpirit.facts.spawnAreas.length, 1, "the Current link table maps that row to Ice Spirit");
    assert.equal(currentSpirit.facts.spawnAreas[0].areaId, "snow-citadel-mobs");
    assert.equal(
      currentSpirit.facts.spawnAreas[0].listedAs,
      "Ice Spirit",
      "the row carries the Current wording, never the Beta-Test one"
    );
    results.push("similar-name-safety");
  }

  /* 9. Spawn areas are not drops, and drops are not recipes. */
  {
    const harness = aincradHarness();
    const spawn = harness.ask("where does forest spider spawn", { dataset: "current" });
    assert.ok(spawn.dataQuality.notes.includes("spawn-area-is-not-a-drop"));
    const areaTitles = spawn.facts.spawnAreas.map((area) => area.area);
    assert.ok(areaTitles.includes("Arakh'Nol"));
    const serializedDrops = JSON.stringify(spawn.facts.drops);
    for (const title of areaTitles) {
      assert.equal(serializedDrops.includes(title), false, `the spawn area ${title} never appears as a drop`);
    }
    assert.ok(
      spawn.facts.drops.every((drop) => drop.chance !== undefined && drop.item),
      "every drop entry comes from the Bestiary drop list"
    );

    /* A recipe is never derived from a drop list. */
    const recipe = harness.ask("how do i craft spider silk", { dataset: "current" });
    assert.equal(recipe.intent, "recipe");
    assert.equal(recipe.status, "missing", "a drop-only item has no recipe");
    sameJson(recipe.facts.craftingResources, []);
    assert.equal(recipe.facts.craftingLocation, null);
    assert.ok(recipe.dataQuality.notes.includes("item-record-missing"));

    /* And a drop list is never derived from a recipe. */
    const drop = harness.ask("which mobs drop slime jelly", { dataset: "current" });
    assert.equal(drop.intent, "drop");
    assert.ok(
      drop.facts.droppedBy.every((row) => typeof row.chance === "number" || row.chance === null),
      "drop rows only ever come from the Bestiary"
    );
    results.push("area-drop-recipe-separation");
  }

  /* 10. Beta-Test Data is recognised and refused: nothing is read, nothing is answered, and no Beta
     record is ever indexed. */
  {
    const harness = aincradHarness();
    const betaQuestions = [
      "how do i craft curved bow",
      "where can i buy the sticky ring",
      "where is the secret sticky ring merchant",
      "which mobs drop spider silk",
      "where is arakh nol",
      "where is a new world",
      "what does forest spider drop"
    ];
    for (const question of betaQuestions) {
      const refused = harness.ask(question, { dataset: "beta" });
      assert.equal(refused.status, "unsupported", `"${question}" is refused in Beta mode`);
      assert.equal(refused.unsupportedReason, "dataset-unsupported", "the reason names the dataset, not the question");
      assert.ok(refused.dataQuality.notes.includes("dataset-unsupported"));
      assert.equal(refused.entity, null, "no entity is resolved in Beta mode");
      assert.equal(refused.intent, "unknown");
      sameJson(refused.facts, {}, "no facts at all are produced in Beta mode");
      sameJson(refused.candidates, [], "no candidates are offered in Beta mode");
    }

    /* The same questions are answered in Current Data, so the refusal is about the mode and not the data. */
    assert.equal(harness.ask("where can i buy the sticky ring", { dataset: "current" }).status, "answer");
    assert.equal(harness.ask("where is the secret sticky ring merchant", { dataset: "current" }).status, "answer");
    assert.equal(harness.ask("where is arakh nol", { dataset: "current" }).status, "answer");

    /* Nothing is read from the page either: the same page globals produce an empty index in Beta mode. */
    const betaSources = harness.engine.describeSources({ world: "aincrad", dataset: "beta", floor: "floor1" });
    assert.equal(betaSources.supported, false, "describeSources reports the mode as unsupported");
    assert.equal(betaSources.entityCount, 0, "and indexes nothing at all");
    assert.equal(
      Object.values(betaSources.sources).some(Boolean),
      false,
      "no source is reported as available in Beta mode"
    );

    /* A question in Beta mode reads no source at all - not even one the provider handed over. */
    let reads = 0;
    const counted = {};
    for (const key of [
      "markerData",
      "mobAreaMobs",
      "currentMobAreas",
      "currentMobAreaLinks",
      "currentBestiary",
      "currentEquipment",
      "currentQuests"
    ]) {
      Object.defineProperty(counted, key, {
        enumerable: true,
        get() {
          reads += 1;
          return buildAincradSnapshot()[key];
        }
      });
    }
    harness.engine.clearCache();
    harness.engine.query("where can i buy the sticky ring", {
      world: "aincrad",
      dataset: "beta",
      floor: "floor1",
      sources: counted
    });
    assert.equal(reads, 0, "a Beta-mode question never touches a Current-Data source");

    /* Every answer reports the dataset it came from. */
    const result = harness.ask("where can i buy the sticky ring", { dataset: "current" });
    assert.equal(result.context.dataset, "current");
    assert.equal(result.facts.record.dataset, "current");
    results.push("beta-mode-unsupported");
  }

  /* 11. World, floor and island context. */
  {
    /* Current floor 2 ships no equipment or Bestiary records of its own, and Argo never invents any. */
    const floor2 = createHarness({ dataFiles: AINCRAD_FILES });
    const floor2Sources = floor2.engine.describeSources({ world: "aincrad", dataset: "current", floor: "floor2" });
    assert.equal(floor2Sources.sources.equipment, false, "the empty Current floor 2 has no equipment records");
    assert.equal(floor2Sources.sources.bestiary, false, "and no Bestiary records");
    const floor2Empty = floor2.engine.query("what does corrupted boar drop", {
      world: "aincrad",
      dataset: "current",
      floor: "floor2"
    });
    assert.equal(floor2Empty.context.floor, "floor1", "a name only floor 1 holds is answered from floor 1");
    assert.ok(floor2Empty.dataQuality.notes.includes("floor-inferred"), "and the answer says so");
    assert.equal(floor2Empty.facts.drops.length >= 1, true, "with the real floor 1 drop list");

    /* The Fractured Underworld: its own data, its own island ids, and no Aincrad records at all. */
    const underworld = createHarness({ dataFiles: UNDERWORLD_FILES });
    const currentSources = underworld.engine.describeSources({
      world: "underworld",
      dataset: "current",
      floor: "playerIsland"
    });
    assert.equal(currentSources.supported, true, "the Underworld is a supported context");
    assert.equal(currentSources.sources.markers, true, "the Underworld questline markers are visible");
    assert.equal(currentSources.sources.quests, true, "the Underworld questline entries are visible");
    assert.equal(currentSources.sources.bestiary, false, "the Underworld has no Bestiary data");
    assert.equal(currentSources.sources.compendium, false, "the Underworld Compendium list is empty today");

    const underworldBeta = underworld.engine.describeSources({
      world: "underworld",
      dataset: "beta",
      floor: "playerIsland"
    });
    assert.equal(underworldBeta.supported, false, "Beta is unsupported in the Underworld too");
    assert.equal(underworldBeta.entityCount, 0, "and nothing is indexed there either");

    const islandQuest = underworld.engine.query("where is the new world", {
      world: "underworld",
      dataset: "current",
      floor: "playerIsland"
    });
    assert.equal(islandQuest.status, "answer");
    assert.equal(islandQuest.intent, "quest");
    assert.equal(islandQuest.facts.quests[0].island, "playerIsland");
    assert.equal(islandQuest.facts.quests[0].world, "underworld");
    assert.ok(islandQuest.facts.markers.length >= 1, "the marker on the active island is found");

    const otherIsland = underworld.engine.query("where is the new world", {
      world: "underworld",
      dataset: "current",
      floor: "iceCave"
    });
    assert.equal(otherIsland.facts.markers.length, 0, "markers from another island are filtered out");
    assert.ok(otherIsland.dataQuality.notes.includes("quest-spans-islands"), "the island mismatch is reported");

    const islandOnly = underworld.engine.query("where is azure crystals", {
      world: "underworld",
      dataset: "current",
      floor: "iceCave"
    });
    assert.equal(islandOnly.status, "answer");
    assert.equal(islandOnly.facts.quests[0].island, "iceCave");
    assert.equal(islandOnly.dataQuality.notes.includes("quest-spans-islands"), false);

    const underworldBetaQuery = underworld.engine.query("where is the new world", {
      world: "underworld",
      dataset: "beta",
      floor: "playerIsland"
    });
    assert.equal(underworldBetaQuery.status, "unsupported", "Beta mode has no Underworld records");
    assert.equal(underworldBetaQuery.unsupportedReason, "dataset-unsupported");
    results.push("world-floor-island-context");
  }

  /* 12. Missing data globals and the scoped-engine helper. */
  {
    /* The engine on its own, with no shared modules and no datasets at all. */
    const bare = createHarness({ shared: false, dataFiles: [] });
    const result = bare.engine.query("where is spider silk", { world: "aincrad", dataset: "current", floor: "floor1" });
    assert.equal(result.status, "unsupported");
    sameJson(result.facts, {});
    sameJson(result.sources, {
      bestiary: false,
      equipment: false,
      markers: false,
      mobAreas: false,
      quests: false,
      compendium: false,
      contentTranslations: false
    });
    const described = bare.engine.describeSources({ world: "aincrad", dataset: "current", floor: "floor1" });
    assert.equal(described.entityCount, 0, "an empty page yields an empty index");
    assert.equal(described.supported, true, "an empty page is still a supported dataset");
    assert.equal(
      bare.engine.query("help", { dataset: "current" }).intent,
      "help",
      "the help intent works with no data at all"
    );
    assert.equal(
      bare.engine.query("help", {}).unsupportedReason,
      "dataset-unsupported",
      "with no dataset authority at all the mode cannot be confirmed, so nothing is answered"
    );

    /* A bound engine applies its own context, and an explicit context still wins. */
    const harness = aincradHarness();
    const scoped = harness.engine.createEngine({ world: "aincrad", dataset: "current", floor: "floor1" });
    const scopedAnswer = scoped.query("where can i buy the sticky ring");
    assert.equal(scopedAnswer.status, "answer");
    assert.equal(scopedAnswer.context.dataset, "current");
    const overridden = scoped.query("where can i buy the sticky ring", { dataset: "beta" });
    assert.equal(overridden.status, "unsupported", "an explicit context overrides the bound one");
    assert.equal(overridden.unsupportedReason, "dataset-unsupported");
    results.push("missing-globals-and-scoped-engine");
  }

  /* 13. Malformed optional records never throw, and Beta-Test source keys are ignored entirely. */
  {
    const harness = createHarness({ shared: false, dataFiles: [] });
    const patch = {
      markerData: {
        broken: null,
        number: 5,
        untitled: { floor: "floor1", category: "biomes", dataset: "current" },
        weird: { title: 42, floor: "floor1", category: "biomes", dataset: "current" },
        odd: {
          title: "Odd Marker",
          floor: "floor1",
          category: "biomes",
          dataset: "current",
          coords: "not-a-coordinate"
        },
        beta: { title: "Beta Marker", floor: "floor1", category: "biomes", coords: { x: 1, z: 2 } }
      },
      currentMobAreas: "not-an-array",
      mobAreaMobs: { area: [null, 5, { name: "" }, { name: "Nameless" }] },
      currentBestiary: { floor1: { regular: "Only\tOne\nBad\tLine\t3\t4\nGood Mob\tThing (10%)\tN/A" } },
      currentEquipment: {
        floor1: {
          weapon: [
            null,
            "nope",
            { name: "" },
            { name: "Broken Blade", stats: "nope" },
            {
              name: "Lonely Blade",
              craftingLocation: "Nowhere Smith",
              craftingResources: [{ item: "Col", amount: 5 }]
            }
          ]
        }
      },
      /* A Beta-Test key is not a source the engine knows: it must be ignored, never read. */
      betaBestiary: { regular: "Beta Mob\tBeta Thing (50%)\tN/A" },
      betaEquipment: { weapon: [{ name: "Beta Blade" }] },
      betaQuests: { floor1: [{ questName: "Beta Quest", npcName: "Beta Npc" }] }
    };
    assert.equal(typeof harness.engine.registerSources(patch), "object", "a source patch is accepted");
    assert.equal(harness.engine.registerSources("nope"), null, "a non-object patch is refused");

    const marker = harness.engine.query("where is odd marker", {
      world: "aincrad",
      dataset: "current",
      floor: "floor1"
    });
    assert.equal(marker.status, "answer");
    assert.equal(marker.entity.name, "Odd Marker");
    assert.equal(marker.facts.markers[0].coords, null, "an unreadable coordinate is dropped, not invented");

    const mob = harness.engine.query("what does good mob drop", {
      world: "aincrad",
      dataset: "current",
      floor: "floor1"
    });
    assert.equal(mob.status, "answer", "a well-formed line inside malformed text is still read");
    assert.equal(mob.entity.name, "Good Mob");
    sameJson(mob.facts.drops, [{ item: "Thing", itemId: "thing", chance: 10, notes: null, recordPresent: false }]);

    const item = harness.engine.query("what are the stats of broken blade", {
      world: "aincrad",
      dataset: "current",
      floor: "floor1"
    });
    assert.equal(item.status, "answer", "an entry with malformed stats still resolves");
    sameJson(item.facts.record.stats, {});
    assert.ok(item.dataQuality.notes.includes("stats-absent"));

    /* A documented crafting location with no matching marker is reported, never invented. */
    const lonely = harness.engine.query("how do i craft lonely blade", {
      world: "aincrad",
      dataset: "current",
      floor: "floor1"
    });
    assert.equal(lonely.status, "answer");
    assert.equal(lonely.facts.craftingLocation, "Nowhere Smith");
    assert.equal(lonely.facts.craftingLocationMarker, null);
    assert.ok(lonely.dataQuality.notes.includes("merchant-marker-not-found"));

    /* Nothing in the Beta keys of the patch is reachable, in any mode, and a marker the shared map
       dataset marks as Beta-Test is filtered out of the Current index. */
    for (const question of [
      "what does beta mob drop",
      "what are the stats of beta blade",
      "where is beta quest",
      "where is beta marker"
    ]) {
      const ignored = harness.engine.query(question, { world: "aincrad", dataset: "current", floor: "floor1" });
      assert.notEqual(ignored.status, "answer", `"${question}" cannot be answered from a Beta record`);
      assert.equal(ignored.entity, null, "and no Beta entity is produced");
    }

    harness.engine.resetSources();
    assert.equal(harness.engine.query("where is odd marker", {}).status, "unsupported", "reset drops the patch");
    results.push("malformed-records");
  }

  /* 14. No storage, cookie or network use. */
  {
    const harness = aincradHarness();
    for (const question of [
      "where can i buy the sticky ring",
      "which mobs drop spider silk",
      "what does forest spider drop",
      "where is the secret sticky ring merchant",
      "how do i craft the sticky ring",
      "where is a new world",
      "what can you do",
      "what is the weather in tokyo"
    ]) {
      harness.ask(question, { dataset: "current" });
    }
    assert.deepEqual(harness.storageCalls, [], "queries never touch storage, cookies or the session");

    const executable = stripComments(ENGINE_SOURCE);
    assert.equal(
      /localStorage|sessionStorage|indexedDB|document\.cookie|fetch\(|XMLHttpRequest|sendBeacon|SAOStorage/.test(
        executable
      ),
      false,
      "the engine source contains no persistence or network call"
    );
    assert.equal(
      /addEventListener|setInterval|setTimeout|requestAnimationFrame/.test(executable),
      false,
      "the engine registers no listeners, timers or animation loops"
    );
    results.push("no-storage-or-network");
  }

  /* 15. Repeated queries are consistent, cached and rebuild identically. */
  {
    const harness = aincradHarness();
    const question = "where can i buy the sticky ring";
    const first = harness.ask(question, { dataset: "current" });
    const second = harness.ask(question, { dataset: "current" });
    assert.deepEqual(second, first, "the same question returns the same structured result");
    assert.notEqual(second, first, "each call returns its own result object");

    const before = harness.engine.describeSources({ world: "aincrad", dataset: "current", floor: "floor1" });
    for (let index = 0; index < 25; index += 1) harness.ask(question, { dataset: "current" });
    const after = harness.engine.describeSources({ world: "aincrad", dataset: "current", floor: "floor1" });
    assert.deepEqual(after, before, "repeated queries do not change the index");

    harness.engine.clearCache();
    const rebuilt = harness.ask(question, { dataset: "current" });
    assert.deepEqual(rebuilt, first, "a rebuilt index answers exactly the same way");
    results.push("repeat-consistency");
  }

  /* 16. Cross-page records: a page that only loaded the Map answers from every Current-Data source. */
  {
    const snapshot = buildAincradSnapshot();
    const mapPage = createHarness({ dataFiles: MAP_PAGE_FILES });
    const ask = (question, overrides) =>
      mapPage.engine.query(
        question,
        Object.assign({ world: "aincrad", dataset: "current", floor: "floor1", sources: snapshot }, overrides || {})
      );

    /* On its own the Map page can only answer map questions. */
    const before = mapPage.engine.describeSources({ world: "aincrad", dataset: "current", floor: "floor1" });
    assert.equal(before.sources.markers, true, "the Map page has its own Current markers");
    assert.equal(before.sources.mobAreas, true, "the Map page has its own Current mob areas");
    assert.equal(before.sources.bestiary, false, "the Map page alone has no Bestiary records");
    assert.equal(before.sources.equipment, false, "the Map page alone has no equipment records");
    assert.equal(before.sources.quests, false, "the Map page alone has no quest records");
    const mapOnlyBestiary = mapPage.engine.query("what does sinister white wolf drop", {
      world: "aincrad",
      dataset: "current",
      floor: "floor1"
    });
    assert.equal(mapOnlyBestiary.status, "missing", "without the provider the Map page has no drop list to give");
    assert.equal(mapOnlyBestiary.facts.drops.length, 0, "and it invents nothing to fill the gap");
    assert.equal(mapOnlyBestiary.sources.bestiary, false, "the missing source is reported honestly");

    /* A Bestiary mob and its documented drops. */
    const mob = ask("what does sinister white wolf drop");
    assert.equal(mob.status, "answer");
    assert.equal(mob.intent, "mobDrops");
    assert.ok(
      mob.facts.drops.some((drop) => drop.item === "Wolf Fur" && drop.chance === 85),
      "the documented Current drop rate comes back"
    );

    /* An equipment record with its documented statistics. */
    const stats = ask("what are the stats on training bow");
    assert.equal(stats.status, "answer");
    assert.equal(stats.intent, "item");
    assert.equal(stats.entity.name, "Training Bow");
    assert.equal(stats.facts.record.stats["Attack Damage"], "3", "the real statistics come back");
    assert.equal(stats.facts.record.stats.Class, "Archer");
    assert.equal(stats.facts.record.description, "A rudimentary bow used by first-time shooters");

    /* A crafting recipe with its resources and crafting location. */
    const recipe = ask("how do i craft the sticky ring");
    assert.equal(recipe.status, "answer");
    assert.equal(recipe.intent, "recipe");
    assert.ok(
      recipe.facts.craftingResources.some((resource) => resource.item === "Slime Jelly" && resource.amount === 12),
      "the documented recipe comes back"
    );
    assert.equal(recipe.facts.craftingLocation, "Secret Sticky Ring Merchant");

    /* A quest NPC recorded in the Current questline. */
    const npc = ask("where is the mysterious character");
    assert.equal(npc.status, "answer");
    assert.equal(npc.intent, "npc");
    assert.ok(npc.facts.appearsIn.length >= 1, "the Current quest that names this NPC comes back");
    assert.equal(npc.facts.appearsIn[0].questName, "A New World");

    /* The questline itself is reachable from the same page. */
    const quest = ask("where do i start a new world");
    assert.equal(quest.status, "answer");
    assert.equal(quest.intent, "quest");
    assert.equal(quest.facts.quests[0].world, "aincrad", "an Aincrad page never returns the Underworld questline");

    /* The records were handed over once, not rebuilt per question. */
    let reads = 0;
    const counted = Object.defineProperty({}, "markerData", {
      enumerable: true,
      get() {
        reads += 1;
        return snapshot.markerData;
      }
    });
    Object.keys(snapshot).forEach((key) => {
      if (key !== "markerData") counted[key] = snapshot[key];
    });
    mapPage.engine.clearCache();
    const askCounted = (question) =>
      mapPage.engine.query(question, { world: "aincrad", dataset: "current", floor: "floor1", sources: counted });
    askCounted("where is arakh nol");
    askCounted("where is arakh nol");
    assert.equal(reads, 1, "a repeated question reuses the built index instead of re-reading the sources");
    results.push("cross-page-records");
  }

  /* 17. Floor context: the active floor leads, a named floor is honoured, and floors are never merged.
     Current Data ships records for floor 1 only, so the multi-floor behaviour is exercised with a
     Current-shaped fixture: the same source shape the provider hands over, with minimal records. */
  {
    const snapshot = buildAincradSnapshot();
    const floors = Object.assign({}, snapshot, {
      currentEquipment: {
        floor1: {
          weapon: [
            { name: "Alpha Relic", level: 1 },
            { name: "Twin Relic", level: 2 }
          ]
        },
        floor2: {
          weapon: [{ name: "Floor Two Blade", level: 11, rarity: "Epic", craftingLocation: "Floor Two Smith" }]
        },
        floor3: { weapon: [{ name: "Twin Relic", level: 21 }] }
      },
      currentBestiary: { floor1: { regular: "" }, floor2: { regular: "" }, floor3: { regular: "" } },
      currentMobAreas: [],
      currentMobAreaLinks: {},
      mobAreaMobs: {},
      currentQuests: { floor1: [], floor2: [], floor3: [] }
    });
    const page = createHarness({ dataFiles: MAP_PAGE_FILES });
    const ask = (question, overrides) =>
      page.engine.query(
        question,
        Object.assign({ world: "aincrad", dataset: "current", floor: "floor1", sources: floors }, overrides || {})
      );

    /* A question that names a floor is answered from that floor. */
    assert.equal(page.engine.detectFloorHint("what is on floor 2"), "floor2");
    assert.equal(page.engine.detectFloorHint("what is on 3rd floor"), "floor3");
    assert.equal(page.engine.detectFloorHint("where is the alchemist"), null);

    const named = ask("what are the stats on floor two blade on floor 2");
    assert.equal(named.status, "answer");
    assert.equal(named.context.floor, "floor2", "the named floor becomes the context");
    assert.equal(named.facts.record.level, 11, "the floor 2 record comes back");
    assert.ok(named.dataQuality.notes.includes("floor-from-question"), "the floor the visitor named is recorded");
    assert.equal(named.dataQuality.notes.includes("floor-inferred"), false, "nothing was inferred");

    /* A record that only exists on another floor is answered from there, and says so. */
    const inferred = ask("what are the stats on floor two blade");
    assert.equal(inferred.status, "answer");
    assert.equal(inferred.context.floor, "floor2", "the floor that actually holds the record is reported");
    assert.equal(inferred.facts.record.rarity, "Epic");
    assert.equal(inferred.facts.record.craftingLocation, "Floor Two Smith");
    assert.ok(inferred.dataQuality.notes.includes("floor-inferred"), "the answer says it came from another floor");

    /* A name that several floors hold is not merged: the visitor is asked which one they meant. */
    const several = ask("where is twin relic", { floor: "floor2" });
    assert.equal(several.status, "ambiguous");
    assert.equal(several.clarification.reason, "multiple-floor-matches");
    assert.ok(several.candidates.length >= 2, "each floor contributes its own candidate");
    const candidateFloors = several.candidates.map((candidate) => candidate.floor);
    assert.ok(
      candidateFloors.includes("floor1") && candidateFloors.includes("floor3"),
      "the candidates keep their own floors"
    );
    assert.equal(candidateFloors.includes("floor2"), false, "the active floor is not mixed in when it has no match");
    assert.ok(several.dataQuality.notes.includes("ambiguous-floor"));

    /* The active floor always wins when it has the record. */
    const active = ask("what are the stats on twin relic", { floor: "floor1" });
    assert.equal(active.status, "answer");
    assert.equal(active.context.floor, "floor1");
    assert.equal(active.dataQuality.notes.includes("floor-inferred"), false);

    /* An empty Current floor answers nothing of its own. */
    const emptyCurrent = ask("what are the stats on floor two blade", { floor: "floor3" });
    assert.equal(emptyCurrent.context.floor, "floor2", "the record is reported from the floor that holds it");
    assert.ok(emptyCurrent.dataQuality.notes.includes("floor-inferred"));
    const unknown = ask("what are the stats on a made up relic", { floor: "floor2" });
    assert.notEqual(unknown.status, "answer", "a name no floor holds is never answered");
    assert.equal(Boolean(unknown.facts.record), false, "and no record is invented for it");
    results.push("cross-floor-context");
  }

  /* 18. Isolation across pages: Current records never leak into another world, and Beta never answers. */
  {
    const snapshot = buildAincradSnapshot();
    const page = createHarness({ dataFiles: MAP_PAGE_FILES });
    const ask = (question, overrides) =>
      page.engine.query(
        question,
        Object.assign({ world: "aincrad", dataset: "current", floor: "floor1", sources: snapshot }, overrides || {})
      );

    /* A Beta-Test record is never reachable, and Beta mode answers nothing at all. */
    const betaOnlyInCurrent = ask("what are the stats on curved bow", { dataset: "current" });
    assert.equal(Boolean(betaOnlyInCurrent.facts.record), false, "the Beta-only record is not in Current");
    const betaMode = ask("what are the stats on training bow", { dataset: "beta" });
    assert.equal(betaMode.status, "unsupported", "Beta mode does not fall back to the Current record");
    assert.equal(betaMode.unsupportedReason, "dataset-unsupported");
    assert.equal(Boolean(betaMode.facts.record), false, "and produces no record");

    /* The Underworld is a different world: with only its own sources it never answers with Aincrad records. */
    const underworld = createHarness({ dataFiles: UNDERWORLD_FILES });
    const underworldSources = { currentQuests: snapshot.currentQuests, underworldCompendium: [] };
    const askUnderworld = (question, overrides) =>
      underworld.engine.query(
        question,
        Object.assign(
          { world: "underworld", dataset: "current", floor: "playerIsland", sources: underworldSources },
          overrides || {}
        )
      );

    const aincradMob = askUnderworld("where is sinister white wolf");
    assert.notEqual(aincradMob.status, "answer", "no Aincrad mob is answerable in the Underworld");
    assert.equal(aincradMob.entity, null, "and no Aincrad entity is offered");
    const aincradItem = askUnderworld("what are the stats on training bow");
    assert.equal(Boolean(aincradItem.facts.record), false, "no Aincrad equipment record is offered in the Underworld");

    /* Its own questline is answerable, with the island it belongs to. */
    const islandQuest = askUnderworld("where is the new world");
    assert.equal(islandQuest.status, "answer");
    assert.equal(islandQuest.facts.quests[0].world, "underworld");
    assert.equal(islandQuest.facts.quests[0].island, "playerIsland");

    /* Beta mode has no Underworld records either - and never borrows an Aincrad one. */
    const betaUnderworld = askUnderworld("where is the new world", { dataset: "beta" });
    assert.equal(betaUnderworld.status, "unsupported");
    assert.equal(betaUnderworld.unsupportedReason, "dataset-unsupported");
    assert.equal(Boolean(betaUnderworld.facts.quests), false, "Beta mode has no Underworld quest facts");

    /* A question that mentions a floor never moves an Underworld visitor off their island. */
    const islandKept = askUnderworld("what is on floor 2");
    assert.equal(islandKept.context.floor, "playerIsland", "the island context survives a floor-shaped question");
    results.push("cross-page-isolation");
  }

  /* 19. Question vocabulary: synonyms, abbreviations, typo tolerance and the site's other languages. */
  {
    const harness = aincradHarness();
    /* The stat keys the active floor really uses, so a ranking can be planned against them. */
    const plan = (question) =>
      harness.engine.planQuestion(harness.engine.normalizeQuestion(question), {
        statKeys: ["Attack Damage", "Attack Speed", "Defense", "Health", "Max Mana", "Max Stamina"]
      });
    const asked = (question) => harness.ask(question, { dataset: "current" });

    /* XP, EXP and experience are the same field. */
    const byXp = asked("sort quests by xp, highest to lowest");
    const byExp = asked("sort quests by exp, highest to lowest");
    const byExperience = asked("sort quests by experience, highest to lowest");
    for (const result of [byXp, byExp, byExperience]) {
      assert.equal(result.status, "answer");
      assert.equal(result.intent, "ranking");
      assert.equal(result.facts.field, "xpReward", "xp, exp and experience all mean the XP column");
      assert.equal(result.facts.direction, "desc");
    }
    sameJson(
      byXp.facts.ranked.map((record) => record.name),
      byExperience.facts.ranked.map((record) => record.name),
      "the three spellings produce the same ranking"
    );

    /* Common abbreviations. */
    assert.equal(plan("which weapon has the highest atk").sort.field, "Attack Damage", "atk means attack");
    assert.equal(plan("sort weapons by dmg, highest first").sort.field, "Attack Damage", "dmg means damage");
    assert.equal(plan("find armor with def above 4").filters.stats[0].key, "Defense", "def means defense");
    assert.equal(plan("show me all wep").target, "item", "wep means weapon");
    assert.equal(plan("show me all mats").filters.category, "material", "mats means materials");
    assert.equal(plan("show me all acc").filters.category, "accessory", "acc means accessory");

    /* Typo tolerance: a misspelled cue word is understood, and a name is left alone. */
    assert.equal(plan("show me all occult weopon").filters.category, "weapon", "a misspelled cue is understood");
    assert.equal(plan("show me all side quets").target, "quest", "and so is a misspelled target");
    assert.equal(plan("where is the sticky ring").kind, "single", "an ordinary question is untouched");
    assert.equal(asked("where is the sticky ring").entity.name, "Sticky Ring", "and still resolves its name");

    /* Spanish and French question wording is understood; names stay English. */
    const spanish = asked("muéstrame todas las misiones secundarias");
    assert.equal(spanish.intent, "collection", "a Spanish collection question is understood");
    assert.equal(spanish.facts.target, "quest");
    assert.equal(spanish.facts.filters.questType, "side");
    assert.equal(spanish.facts.total, 8, "and finds the same eight side quests");

    const french = asked("classe les quêtes par expérience");
    assert.equal(french.intent, "ranking", "a French ranking question is understood");
    assert.equal(french.facts.field, "xpReward");
    assert.equal(french.facts.direction, "desc");

    const frenchCollection = asked("montre toutes les armes");
    assert.equal(frenchCollection.intent, "collection");
    assert.equal(frenchCollection.facts.filters.category, "weapon");
    results.push("question-vocabulary");
  }

  /* 20. Collections: every match in scope, filtered by real fields, never merged across floors. */
  {
    const harness = aincradHarness();
    const asked = (question, overrides) =>
      harness.ask(question, Object.assign({ dataset: "current", floor: "floor1" }, overrides || {}));

    /* The active floor's side quests: all eight of them, and nothing from anywhere else. */
    const sideQuests = asked("show me all side quests");
    assert.equal(sideQuests.status, "answer");
    assert.equal(sideQuests.intent, "collection");
    assert.equal(sideQuests.facts.target, "quest");
    assert.equal(sideQuests.facts.total, 8, "the eight Current side quests on floor 1");
    assert.equal(sideQuests.facts.shown, 8, "every match is returned, not just the first");
    assert.equal(sideQuests.facts.truncated, false);
    assert.equal(
      sideQuests.facts.records.every((record) => record.questType === "side"),
      true,
      "and every record really is a side quest"
    );
    assert.equal(
      sideQuests.facts.records.every((record) => record.floor === "floor1"),
      true,
      "with nothing from another floor merged in"
    );
    assert.equal(sideQuests.facts.otherFloors.length, 0, "no other floor holds any");

    /* The same question on a floor with none: an empty list, plus the honest note that floor 1 has them. */
    const floor2 = asked("show me all side quests", { floor: "floor2" });
    assert.equal(floor2.status, "missing");
    assert.equal(floor2.facts.total, 0, "floor 2 holds no Current side quests");
    sameJson(floor2.facts.otherFloors, [{ floor: "floor1", count: 8 }], "and the note says where they are");
    assert.ok(floor2.dataQuality.notes.includes("other-floor-records-exist"));

    /* An explicit floor request is honoured, and the answer says which floor it used. */
    const otherFloor = asked("list all bosses on floor 2", { floor: "floor1" });
    assert.equal(otherFloor.context.floor, "floor2", "the question's floor wins over the page's");
    assert.equal(otherFloor.facts.scope.floor, "floor2");
    assert.ok(otherFloor.facts.total >= 1, "and floor 2 does hold bosses");

    /* Bosses: the Bestiary's boss tabs plus the map's boss markers - Current ones only. */
    const bosses = asked("show me all bosses");
    assert.equal(bosses.intent, "collection");
    assert.equal(bosses.facts.total, 15, "seven Bestiary bosses and eight the map knows");
    assert.equal(
      bosses.facts.records.some((record) => record.name === "Kazor"),
      false,
      "a Beta-Test boss marker is never listed"
    );
    assert.equal(
      bosses.facts.records.some((record) => record.source === "bestiary"),
      true,
      "the Bestiary bosses are in the list"
    );

    /* A keyword filter over real names. */
    const occult = asked("show me all occult gear");
    assert.equal(occult.facts.total, 7, "the seven Occult accessories");
    assert.equal(
      occult.facts.records.every((record) => /occult/i.test(record.name)),
      true,
      "and every one of them carries the keyword"
    );

    /* A category filter, a stat threshold, and both at once. "above" is strict, "at least" is not. */
    assert.equal(asked("show me all materials").facts.total, 3, "the three material entries");
    const toughArmor = asked("find armor with a defense value above 4");
    assert.equal(toughArmor.intent, "collection");
    assert.equal(toughArmor.facts.total, 1, "one armor piece records a Defense strictly above 4");
    assert.equal(toughArmor.facts.records[0].name, "Champion's Breastplate");
    assert.equal(toughArmor.facts.filters.category, "armor");
    sameJson(
      toughArmor.facts.filters.stats,
      [{ key: "Defense", min: 4, max: null, minStrict: true, maxStrict: false }],
      "the threshold and its strictness are kept"
    );
    const atLeastArmor = asked("show me all armor with defense at least 4");
    assert.equal(atLeastArmor.facts.total, 6, "at least 4 includes the pieces that record exactly 4");
    assert.equal(
      atLeastArmor.facts.records.every((record) => Number(String(record.stats.Defense).replace(/[^0-9.]/g, "")) >= 4),
      true,
      "and every record really passes it"
    );
    const rangeArmor = asked("show me all armor with level 1 to 3");
    assert.equal(
      rangeArmor.facts.records.every((record) => record.level >= 1 && record.level <= 3),
      true,
      "a level range is applied to every record"
    );
    assert.ok(rangeArmor.facts.total > 0 && rangeArmor.facts.total < 56, "and it narrows the list");

    /* Dungeons: a place on the map, with the other floor counted but not merged. */
    const dungeons = asked("show me all dungeons");
    assert.equal(dungeons.facts.total, 5, "the five floor 1 dungeons");
    sameJson(dungeons.facts.otherFloors, [{ floor: "floor2", count: 2 }], "floor 2's dungeons are counted only");

    /* A set question with no target at all is turned down rather than guessed. */
    const noTarget = asked("show me all");
    assert.equal(noTarget.status, "unsupported");
    assert.equal(noTarget.unsupportedReason, "no-collection-target");
    results.push("collections");
  }

  /* 21. Rankings: documented values only, both directions, and unknowns kept out of the list. */
  {
    const harness = aincradHarness();
    const asked = (question) => harness.ask(question, { dataset: "current", floor: "floor1" });

    const byXp = asked("sort quests by experience, highest to lowest");
    assert.equal(byXp.status, "answer");
    assert.equal(byXp.intent, "ranking");
    assert.equal(byXp.facts.field, "xpReward");
    assert.equal(byXp.facts.direction, "desc");
    assert.equal(byXp.facts.ranked[0].name, "The Citadel's Cold");
    assert.equal(byXp.facts.ranked[0].value, 700);
    assert.equal(byXp.facts.best.value, 700, "the highest value is named");
    const values = byXp.facts.ranked.map((record) => record.value);
    sameJson(
      values.slice().sort((left, right) => right - left),
      values,
      "the list really is highest first"
    );

    /* The other direction, from the same data. */
    const ascending = asked("sort quests by experience, lowest to highest");
    assert.equal(ascending.facts.direction, "asc");
    assert.equal(ascending.facts.ranked[0].name, "Too Many Boars");
    assert.equal(ascending.facts.ranked[0].value, 300, "the smallest recorded XP comes first");

    /* Unknown is not zero: the main questline records no XP, so it is left out and reported. */
    assert.ok(byXp.facts.unknownCount > 0, "records without a value are counted");
    assert.equal(
      byXp.facts.ranked.every((record) => Number.isFinite(record.value) && record.value > 0),
      true,
      "and no record without a value appears in the list"
    );
    assert.ok(byXp.dataQuality.notes.includes("ranking-has-unknown-values"));

    /* Weapons by Attack Damage: the dataset's own stat key, not a derived score. */
    const weapons = asked("which weapon has the highest attack");
    assert.equal(weapons.facts.field, "Attack Damage");
    assert.equal(weapons.facts.fieldKind, "stat");
    assert.equal(weapons.facts.ranked[0].name, "Herald's Scythe");
    assert.equal(weapons.facts.ranked[0].value, 19);
    assert.ok(weapons.facts.unknownCount > 0, "most weapons record no Attack Damage at all");
    assert.equal(weapons.facts.tiedAtTop, false);

    /* Mobs by XP: only a few rows in the whole Bestiary carry one. */
    const mobs = asked("which mob has the highest xp");
    assert.equal(mobs.intent, "ranking");
    assert.equal(mobs.facts.ranked[0].name, "Nasgul");
    assert.equal(mobs.facts.ranked[0].value, 600);
    assert.equal(mobs.facts.ranked[1].value, 480);
    assert.ok(mobs.facts.unknownCount >= 30, "the rest have none recorded, and are never ranked as zero");

    /* A target with nothing to rank by is turned down rather than invented. */
    const unsortable = asked("which location has the highest value");
    assert.equal(unsortable.status, "unsupported");
    assert.equal(unsortable.unsupportedReason, "no-sortable-field");

    /* Wording that fits two fields asks which one instead of choosing. */
    const ambiguous = asked("sort weapons by speed, highest first");
    assert.equal(ambiguous.status, "ambiguous");
    assert.equal(ambiguous.clarification.reason, "ambiguous-stat-field");
    sameJson(
      ambiguous.clarification.options
        .map((option) => option.name)
        .slice()
        .sort(),
      ["Attack Speed", "Increased Speed", "Movement Speed"],
      "every field whose wording matches is offered, and none is chosen"
    );
    results.push("rankings");
  }

  /* 22. Comparisons: side by side, from documented fields, with unknown where the data is silent. */
  {
    const harness = aincradHarness();
    const asked = (question) => harness.ask(question, { dataset: "current", floor: "floor1" });
    const rowOf = (result, key) => result.facts.rows.find((row) => row.key === key);

    const weapons = asked("compare training bow and training sword");
    assert.equal(weapons.status, "answer");
    assert.equal(weapons.intent, "comparison");
    sameJson(
      weapons.facts.entities.map((entity) => entity.name),
      ["Training Bow", "Training Sword"]
    );
    assert.equal(rowOf(weapons, "Attack Damage").values[0], "3", "the dataset's own value is copied through");
    assert.equal(rowOf(weapons, "Attack Damage").values[1], "2.5");
    assert.equal(rowOf(weapons, "level").values[0], 1);
    assert.equal(rowOf(weapons, "type").kind, "entityType", "the kind of record is a row like any other");

    /* A field only one of them has: the other side is unknown, and never zero. */
    const mixed = asked("compare training bow and champion's breastplate");
    const defense = rowOf(mixed, "Defense");
    assert.ok(defense, "the field appears because one of them records it");
    assert.equal(defense.values[0], null, "the bow records no Defense");
    assert.equal(defense.values[1], "+5");
    assert.ok(mixed.facts.unknownCounts[0] >= 1, "and the gap is counted for that side");
    assert.equal(
      mixed.facts.rows.some((row) => row.values.some((value) => value === 0)),
      false,
      "no missing value is turned into zero"
    );

    /* A name that is not in the records at all: ask which was meant instead of inventing one. */
    const unknown = asked("compare the fluffy unicorn of doom and the training bow");
    assert.equal(unknown.status, "ambiguous");
    assert.equal(unknown.clarification.reason, "comparison-needs-names");
    assert.equal(Boolean(unknown.facts.entities), false, "and no comparison table is invented");

    /* No names at all: ask for them. */
    const nameless = asked("what is the difference between these armors");
    assert.equal(nameless.status, "ambiguous");
    assert.equal(nameless.clarification.reason, "comparison-needs-names");
    results.push("comparisons");
  }

  /* 23. Farming: documented sources and rates only; an unrecorded rate stays unknown. */
  {
    const harness = aincradHarness();
    const asked = (question) => harness.ask(question, { dataset: "current", floor: "floor1" });

    const farm = asked("where can i farm sylvan bark");
    assert.equal(farm.status, "answer");
    assert.equal(farm.intent, "farming");
    assert.equal(farm.entity.name, "Sylvan Bark");
    assert.equal(farm.facts.best.mob, "Elite Treant", "the one documented source is named");
    assert.equal(farm.facts.best.chance, 80);
    assert.equal(farm.facts.sourceCount, 1);
    assert.equal(farm.facts.unratedCount, 0);
    assert.equal(farm.facts.sources[0].bestiaryTab, "regular", "and its Bestiary list travels with it");

    /* The same question worded as a superlative is still a farming question with the same answer. */
    const best = asked("which mob has the best chance of dropping sylvan bark");
    assert.equal(best.intent, "farming");
    sameJson(best.facts.best, farm.facts.best);

    /* An item with several sources keeps every one, ordered by the recorded rate. */
    const hide = asked("where can i farm boar hide");
    assert.ok(hide.facts.sourceCount >= 1, "the documented sources are listed");
    const chances = hide.facts.sources.map((source) => source.chance).filter((chance) => chance !== null);
    sameJson(
      chances.slice().sort((left, right) => right - left),
      chances,
      "the rated sources are highest first"
    );
    if (hide.facts.unratedCount) assert.ok(hide.dataQuality.notes.includes("chance-not-recorded"));

    /* An item nobody records a drop for: no sources, no best, and no invented rate. */
    const none = asked("where can i farm purification elixir");
    assert.equal(none.intent, "farming");
    assert.equal(none.status, "missing");
    assert.equal(none.facts.sources.length, 0, "nothing is invented for it");
    assert.equal(Boolean(none.facts.best), false, "and no best source is claimed");
    assert.ok(none.dataQuality.notes.includes("no-drop-record"));

    /* The wording still separates a source question from a farming question. */
    assert.equal(asked("what drops sylvan bark").intent, "drop", '"what drops X" lists the sources');
    assert.equal(asked("where do i get sylvan bark").intent, "item", '"where do i get X" is an item question');
    assert.equal(asked("which mobs drop sylvan bark").intent, "drop");
    results.push("farming");
  }

  /* 24. Scope: floors, worlds, islands and datasets hold for set questions too. */
  {
    const harness = aincradHarness();
    const snapshot = buildAincradSnapshot();
    const asked = (question, overrides) =>
      harness.ask(question, Object.assign({ dataset: "current", floor: "floor1", world: "aincrad" }, overrides || {}));

    /* A collection stays on the active floor: floor 2 holds no Current quest entries at all. */
    const floor2 = asked("show me all quests", { floor: "floor2" });
    assert.equal(floor2.facts.total, 0, "floor 2 has no Current quest entries");
    sameJson(floor2.facts.otherFloors, [{ floor: "floor1", count: 41 }], "floor 1's are counted, never merged");
    assert.equal(
      floor2.facts.records.every((record) => record.floor === "floor2"),
      true,
      "and every record really is from the active floor"
    );

    /* Beta-Test Data: a set question reads nothing at all and answers nothing. */
    let reads = 0;
    const counted = {};
    for (const key of ["markerData", "currentBestiary", "currentEquipment", "currentQuests", "currentMobAreas"]) {
      Object.defineProperty(counted, key, {
        enumerable: true,
        get() {
          reads += 1;
          return snapshot[key];
        }
      });
    }
    harness.engine.clearCache();
    const beta = harness.engine.query("show me all side quests", {
      dataset: "beta",
      floor: "floor1",
      sources: counted
    });
    assert.equal(beta.status, "unsupported");
    assert.equal(beta.unsupportedReason, "dataset-unsupported");
    assert.equal(reads, 0, "a Beta set question reads no source at all");
    assert.equal(Boolean(beta.facts.records), false, "and produces no collection");

    /* The Underworld: its own questline, its own island, and never an Aincrad record. */
    const underworld = createHarness({ dataFiles: UNDERWORLD_FILES });
    const underworldSources = { currentQuests: snapshot.currentQuests };
    const askUnderworld = (question, island) =>
      underworld.engine.query(question, {
        world: "underworld",
        dataset: "current",
        floor: island,
        sources: underworldSources
      });

    const gigas = askUnderworld("show me all quests", "gigasCedar");
    assert.equal(gigas.intent, "collection");
    assert.equal(gigas.facts.total, 4, "the four quests recorded for that island");
    assert.equal(
      gigas.facts.records.every((record) => record.island === "gigasCedar"),
      true,
      "and only those"
    );

    const rulid = askUnderworld("show me all quests", "rulid");
    assert.equal(rulid.facts.total, 3);
    assert.equal(
      rulid.facts.records.some((record) => record.island === "gigasCedar"),
      false,
      "no other island's quests leak in"
    );

    const aincradGear = askUnderworld("show me all occult gear", "rulid");
    assert.equal(aincradGear.facts.total, 0, "no Aincrad equipment is listed in the Underworld");
    assert.equal(aincradGear.status, "missing", "and the empty list is reported as such");
    const aincradRanking = askUnderworld("which weapon has the highest attack", "rulid");
    assert.notEqual(aincradRanking.status, "answer", "and no Aincrad ranking either");
    const aincradBosses = askUnderworld("show me all bosses", "rulid");
    assert.notEqual(aincradBosses.status, "answer", "nor any Aincrad boss list");
    results.push("stage5-scope-and-isolation");
  }

  /* 25. The help shape answers questions about Argo herself, and never swallows a lookup that merely
     starts with one of her own phrases. */
  {
    const harness = aincradHarness();
    const ask = (question) => harness.ask(question, { dataset: "current" });

    /* A phrase that is the whole question stays a capability question. */
    for (const question of [
      "what can you do",
      "what do you know",
      "what do you know about",
      "what do you know of",
      "what can i ask",
      "help me",
      "help"
    ]) {
      const result = ask(question);
      assert.equal(result.intent, "help", `"${question}" is still a help question`);
      assert.equal(result.status, "answer", `"${question}" is still answered`);
      assert.equal(result.entity, null, `"${question}" resolves no entity`);
    }

    /* The same phrase with a record after it is a lookup, and resolves that record. */
    for (const question of ["what do you know about the corrupted boar", "help me find the corrupted boar"]) {
      const result = ask(question);
      assert.notEqual(result.intent, "help", `"${question}" is a lookup, not a help question`);
      assert.equal(result.status, "answer", `"${question}" is answered`);
      assert.equal(result.entity && result.entity.name, "Corrupted Boar", `"${question}" resolves the record`);
      assert.equal(result.intent, "mob", `"${question}" is answered as a mob`);
      assert.ok(result.facts.bestiary, `"${question}" carries the mob's own facts`);
    }

    /* A phrase with an unknown name after it is still a miss, not a capability question. */
    const unknown = ask("what do you know about the fluffy unicorn of doom");
    assert.notEqual(unknown.intent, "help", "an unknown name is not turned into a help question");
    assert.equal(unknown.status, "unsupported");
    assert.equal(unknown.unsupportedReason, "no-entity-match");
    results.push("help-shape-scope");
  }

  /* 26. A question asked in Spanish or French resolves the same record, the same intent and the same
     facts as the English one, and the help, floor-scope and unknown-name paths behave the same way. */
  {
    const harness = aincradHarness();
    const ask = (question, language) => harness.ask(question, { dataset: "current", language });

    /* The same single-record question in all three languages. */
    const equivalents = [
      {
        name: "location",
        en: "where is Castlebrume",
        es: "donde esta Castlebrume",
        fr: "ou est Castlebrume",
        intent: "location",
        entity: "Castlebrume"
      },
      {
        name: "accented location",
        en: "where is Castlebrume",
        es: "d\u00F3nde est\u00E1 Castlebrume",
        fr: "o\u00F9 est Castlebrume",
        intent: "location",
        entity: "Castlebrume"
      },
      {
        name: "stats",
        en: "what are the stats on the training bow",
        es: "cuales son las estadisticas de la training bow",
        fr: "quelles sont les statistiques de la training bow",
        intent: "item",
        entity: "Training Bow"
      },
      {
        name: "mob",
        en: "where is the corrupted boar",
        es: "donde esta el corrupted boar",
        fr: "ou est le corrupted boar",
        intent: "mob",
        entity: "Corrupted Boar"
      },
      {
        name: "mob drops",
        en: "what does the corrupted boar drop",
        es: "que suelta el corrupted boar",
        fr: "que lache le corrupted boar",
        intent: "mobDrops",
        entity: "Corrupted Boar"
      },
      {
        name: "recipe",
        en: "how do i craft the training bow",
        es: "como fabricar la training bow",
        fr: "comment fabriquer la training bow",
        intent: "recipe",
        entity: "Training Bow"
      },
      {
        name: "quest",
        en: "where is a new world",
        es: "donde esta a new world",
        fr: "ou est a new world",
        intent: "quest",
        entity: "A New World"
      },
      {
        name: "npc",
        en: "where is the alchemist",
        es: "donde esta el alchemist",
        fr: "ou est l'alchemist",
        intent: "npc",
        entity: "Alchemist"
      },
      {
        name: "farming",
        en: "where can i farm boar hide",
        es: "donde puedo farmear boar hide",
        fr: "ou puis je farmer boar hide",
        intent: "farming",
        entity: "Boar Hide"
      }
    ];

    for (const entry of equivalents) {
      const reference = ask(entry.en, "en");
      assert.equal(reference.status, "answer", `${entry.name}: the English question is answered`);
      assert.equal(reference.intent, entry.intent, `${entry.name}: the English intent`);
      assert.equal(reference.entity.name, entry.entity, `${entry.name}: the English record`);
      /* Deliberately explicit: these are Argo's own question languages - its cue tables and the
         per-language question strings below - not the site's supported UI languages. A new language
         needs its own cue aliases in shared/sao-argo-engine.js and its own questions here first. */
      for (const language of ["es", "fr"]) {
        const result = ask(entry[language], language);
        assert.equal(result.status, reference.status, `${entry.name} (${language}): the same status`);
        assert.equal(result.intent, reference.intent, `${entry.name} (${language}): the same intent`);
        assert.equal(result.entity && result.entity.name, entry.entity, `${entry.name} (${language}): the same record`);
        assert.equal(result.shape, reference.shape, `${entry.name} (${language}): the same question shape`);
        sameJson(result.facts, reference.facts, `${entry.name} (${language}): the same facts`);
        sameJson(
          result.dataQuality.notes,
          reference.dataQuality.notes,
          `${entry.name} (${language}): the same caveats`
        );
      }
    }
    /* The same set question in all three languages: the same records, in the same order. */
    const setQuestions = [
      {
        name: "collection",
        en: "show me all side quests",
        es: "muestrame todas las misiones secundarias",
        fr: "montre moi toutes les quetes secondaires"
      },
      {
        name: "ranking",
        en: "which weapon has the highest attack damage",
        es: "cual arma tiene mas ataque",
        fr: "quelle arme a le plus d'attaque"
      },
      {
        name: "comparison",
        en: "compare training bow and training sword",
        es: "compara training bow y training sword",
        fr: "compare training bow et training sword"
      }
    ];

    for (const entry of setQuestions) {
      const reference = ask(entry.en, "en");
      assert.equal(reference.status, "answer", `${entry.name}: the English question is answered`);
      /* Argo's question languages are its own (cue tables plus the question strings above), not the
         site's supported UI languages, so they stay explicit until Argo supports a new language. */
      for (const language of ["es", "fr"]) {
        const result = ask(entry[language], language);
        assert.equal(result.status, reference.status, `${entry.name} (${language}): the same status`);
        assert.equal(result.intent, reference.intent, `${entry.name} (${language}): the same intent`);
        sameJson(result.facts, reference.facts, `${entry.name} (${language}): the same records in the same order`);
      }
    }

    /* A cue word the aliases produce is never mistaken for a keyword filter. Each of these used to come
       back empty because a function word was used as a name filter. */
    const filterQuestions = [
      ["cual arma tiene mas ataque", "es"],
      ["que armas tienen mas de 10 de ataque", "es"],
      ["dame todas las armaduras", "es"],
      ["quiero ver todos los jefes", "es"],
      ["quelle arme a le plus d'attaque", "fr"],
      ["donne moi toutes les armures", "fr"],
      ["je veux voir tous les boss", "fr"],
      ["montre moi les monstres qui lachent du butin", "fr"],
      ["muestrame los monstruos que sueltan botin", "es"]
    ];
    for (const [question, language] of filterQuestions) {
      const result = ask(question, language);
      assert.equal(result.status, "answer", `"${question}" is answered`);
      sameJson(result.facts.filters.text, [], `"${question}" leaks no word into the keyword filter`);
      assert.ok(result.facts.total > 0, `"${question}" matches records`);
    }
    /* A capability question stays one in every language, and never swallows a lookup. */
    const helpQuestions = [
      ["what can you do", "en"],
      ["what do you know", "en"],
      ["help", "en"],
      ["que puedes hacer", "es"],
      ["ayuda", "es"],
      ["que peux tu faire", "fr"],
      ["aide moi", "fr"]
    ];
    for (const [question, language] of helpQuestions) {
      const result = ask(question, language);
      assert.equal(result.intent, "help", `"${question}" is a help question`);
      assert.equal(result.status, "answer", `"${question}" is answered`);
      assert.equal(result.entity, null, `"${question}" resolves no record`);
    }
    const lookups = [
      ["what do you know about the corrupted boar", "en"],
      ["que puedes hacer con el corrupted boar", "es"],
      ["que peux tu faire avec le corrupted boar", "fr"]
    ];
    for (const [question, language] of lookups) {
      const result = ask(question, language);
      assert.notEqual(result.intent, "help", `"${question}" is a lookup, not a help question`);
      assert.equal(result.entity && result.entity.name, "Corrupted Boar", `"${question}" resolves the record`);
    }

    /* A record whose localized name the content registry really holds is matched through it. */
    const localizedNames = [
      ["donde esta el jabali corrupto", "es", "Corrupted Boar"],
      ["ou est le sanglier corrompu", "fr", "Corrupted Boar"]
    ];
    for (const [question, language, entity] of localizedNames) {
      const result = ask(question, language);
      assert.equal(result.status, "answer", `"${question}" is answered`);
      assert.equal(result.entity && result.entity.name, entity, `"${question}" resolves the record`);
      assert.equal(result.match.matchedAlias, true, `"${question}" matched through the localized name`);
    }

    /* A map marker's localized title is only matchable once the page has registered it, and then it
       resolves the same record. Nothing is invented while it is unregistered. */
    const markerQuestion = "donde esta niebla del castillo";
    assert.equal(ask(markerQuestion, "es").status, "unsupported", "an unregistered localized marker name is a miss");
    harness.context.SAOContentTranslations.registerMapMarker("current-castlebrume", {
      title: "Castlebrume",
      type: "Biome"
    });
    harness.engine.clearCache();
    const spanishMarker = ask(markerQuestion, "es");
    assert.equal(spanishMarker.status, "answer", "the registered Spanish marker name is answered");
    assert.equal(spanishMarker.entity.name, "Castlebrume", "and resolves the marker's record");
    assert.equal(spanishMarker.match.matchedAlias, true, "through the localized title");
    const frenchMarker = ask("ou est brume du chateau", "fr");
    assert.equal(frenchMarker.entity && frenchMarker.entity.name, "Castlebrume", "the French marker name too");

    /* Explicit scope survives translation: a floor named in Spanish or French is honoured. */
    assert.equal(harness.engine.detectFloorHint("que hay en el piso 2"), "floor2");
    assert.equal(harness.engine.detectFloorHint("qu est ce qu il y a au 2eme etage"), "floor2");
    assert.equal(ask("que hay en el piso 2", "es").context.floor, "floor2", "the Spanish floor is honoured");
    assert.equal(ask("que hay en el etage 2", "fr").context.floor, "floor2", "the French floor is honoured");
    assert.equal(
      harness.engine.detectFloorHint("les armes de niveau 2"),
      null,
      "the French 'niveau' stays a level reference, not a floor"
    );

    /* A name no dataset holds is a miss in every language, never an invented answer. */
    const unknowns = [
      ["where is the fluffy unicorn of doom", "en"],
      ["donde esta el unicornio peludo de la perdicion", "es"],
      ["ou est la licorne duveteuse de la perdition", "fr"]
    ];
    for (const [question, language] of unknowns) {
      const result = ask(question, language);
      assert.equal(result.status, "unsupported", `"${question}" is not answered`);
      assert.equal(result.entity, null, `"${question}" invents no record`);
      assert.equal(result.unsupportedReason, "no-entity-match", `"${question}" is a genuine miss`);
      sameJson(result.facts, {}, `"${question}" carries no facts`);
    }
    results.push("multilingual-coverage");
  }

  /* 27. A record is reachable by its own name in either number, and an item question is answered from
     that item's own equipment record. The canonical shipped name here is the plural "Occult Gloves". */
  {
    const harness = aincradHarness();
    const ask = (question, language) => harness.ask(question, { language: language || "en" });

    const canonical = ask("occult gloves");
    assert.equal(canonical.status, "answer", "the canonical name resolves");
    assert.equal(canonical.entity.name, "Occult Gloves", "and it is the recorded item");
    assert.equal(canonical.intent, "item", "as an item");

    /* The exact question from the report, in the forms a visitor actually types. */
    const phrasings = [
      "What're the Occult Glove stats?",
      "What are the Occult Gloves stats?",
      "What stats does the Occult Gloves have?",
      "Tell me the stats for Occult Gloves",
      "occult glove stats",
      "show me the occult gloves stats",
      "what does the occult glove give"
    ];
    for (const question of phrasings) {
      const result = ask(question);
      assert.equal(result.status, "answer", `"${question}" is answered`);
      assert.equal(result.entity && result.entity.name, "Occult Gloves", `"${question}" resolves the item`);
      assert.equal(result.intent, "item", `"${question}" is an item question`);
      const stats = (result.facts.record && result.facts.record.stats) || {};
      assert.equal(Object.keys(stats).length > 0, true, `"${question}" carries the recorded stats`);
      assert.equal(stats["Life Steal"], "+2%", `"${question}" carries the record's own values`);
    }

    /* Either number: a singular question about a plural record, and the other way round. */
    for (const [question, expected] of [
      ["occult glove", "Occult Gloves"],
      ["occult robe", "Occult Robe"],
      ["occult robes", "Occult Robe"],
      ["training bow", "Training Bow"],
      ["training bows", "Training Bow"],
      ["occult rings", "Occult Ring"],
      ["corrupted boars", "Corrupted Boar"]
    ]) {
      const result = ask(question);
      assert.equal(result.entity && result.entity.name, expected, `"${question}" resolves ${expected}`);
    }

    /* A name the records do not hold stays unresolved: a near miss is never turned into a record. */
    for (const question of ["occult gauntlets stats", "occult mittens", "excalibur stats"]) {
      const result = ask(question);
      assert.equal(result.status, "unsupported", `"${question}" is not answered`);
      assert.equal(result.entity, null, `"${question}" invents no record`);
    }

    /* An item whose record really has no stats is resolved and says so, rather than being called unknown. */
    const statless = ask("what are the teleportation crystal stats");
    assert.equal(statless.status, "answer", "an item with no recorded stats is still resolved");
    assert.equal(statless.entity.name, "Teleportation Crystal", "and identified by name");
    assert.equal(Object.keys(statless.facts.record.stats || {}).length, 0, "with no stats invented");
    assert.equal(statless.dataQuality.notes.includes("stats-absent"), true, "and the gap admitted");

    /* The crafting verbs a visitor really uses reach the recipe, and a drop question is left alone. */
    for (const question of [
      "how do i make the training bow",
      "how is the training bow made",
      "how do i build the training bow"
    ]) {
      const result = ask(question);
      assert.equal(result.intent, "recipe", `"${question}" is a recipe question`);
      assert.equal(result.entity.name, "Training Bow", `"${question}" resolves the item`);
    }
    assert.equal(
      ask("what makes the corrupted boar drop boar hide").intent,
      "mobDrops",
      "a drop question is still a drop question"
    );

    /* The same coverage on a translated page. */
    for (const [question, language] of [
      ["cuales son las estadisticas de las occult gloves", "es"],
      ["donde encuentro las occult gloves", "es"],
      ["quelles sont les statistiques des occult gloves", "fr"],
      ["ou trouver les occult gloves", "fr"]
    ]) {
      const result = ask(question, language);
      assert.equal(result.status, "answer", `${language}: "${question}" is answered`);
      assert.equal(result.entity && result.entity.name, "Occult Gloves", `${language}: the item resolves`);
    }
    results.push("item-plural-and-stats");
  }

  /* 28. A question about a set of records rather than one record: "where's the occult gear" is answered
     from the real equipment records, with each item's own crafting location, and it never invents one. */
  {
    const harness = aincradHarness();
    const ask = (question) => harness.ask(question);

    for (const question of [
      "where's the occult gear",
      "where is the occult gear",
      "where do i get the occult gear",
      "where can i craft the occult gear",
      "where are the occult items"
    ]) {
      const result = ask(question);
      assert.equal(result.status, "answer", `"${question}" is answered`);
      assert.equal(result.intent, "collection", `"${question}" is answered as the set`);
      const records = result.facts.records || [];
      assert.equal(records.length, 7, `"${question}" returns every matching item`);
      assert.equal(
        records.every((record) => /occult/i.test(record.name)),
        true,
        `"${question}" returns only matching items`
      );
      /* Each item keeps its own merchant: the records do not all share one source. */
      assert.equal(
        records.every((record) => typeof record.craftingLocation === "string" && record.craftingLocation),
        true,
        `"${question}" gives each item its own crafting location`
      );
      assert.equal(
        new Set(records.map((record) => record.craftingLocation)).size > 1,
        true,
        `"${question}" does not imply they share one location`
      );
    }

    /* One record by name is still one record, not a list. */
    const single = ask("where is the occult gloves");
    assert.equal(single.intent, "item", "a real record name is still a single lookup");
    assert.equal(single.entity.name, "Occult Gloves", "and resolves that record");

    /* A qualifier nothing matches is an honest miss, never an invented list. */
    const none = ask("where's the occult gauntlets gear");
    assert.equal(none.status, "unsupported", "a set nothing matches is not answered");
    assert.equal(none.entity, null, "and invents no record");
    results.push("set-question-recognition");
  }

  return results;
}

if (require.main === module) {
  run()
    .then((results) => {
      console.log(`Argo engine checks passed (${results.length} groups):`);
      results.forEach((name) => console.log(`  - ${name}`));
    })
    .catch((error) => {
      console.error(error);
      process.exitCode = 1;
    });
}
