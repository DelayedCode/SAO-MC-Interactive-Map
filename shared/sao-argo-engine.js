/* Argo the Info Broker - data engine (window.SAOArgoEngine).
 *
 * Answers questions from the site's own Current-Data records and nothing else. It never invents a stat,
 * drop rate, recipe, coordinate, reward or location: every fact it returns is copied straight out of an
 * existing dataset, and every gap is reported as a gap.
 *
 * Design notes:
 *  - Current Data only. Beta-Test Data is temporary, so Argo recognises the mode, reads nothing at all
 *    while it is selected, and reports the mode as unsupported instead of answering from Current Data
 *    or from Beta records. The shared map dataset still carries Beta markers, so those are filtered out
 *    through SAODatasets' own isCurrentDataMarker rule rather than mixed in.
 *  - DOM-independent and dependency-free. It reads data globals that the page has already loaded and
 *    tolerates any of them being absent, which is the only safe strategy here: the map datasets are
 *    declared with top-level `const` in classic scripts (Aincrad/Map/mapData.js declares `DATA` and
 *    `MOB_AREAS`, maps_floor*.js declares `MOB_AREA_MOBS`), so loading them onto a page that already
 *    has them would throw "Identifier has already been declared". The engine therefore never injects
 *    scripts; the caller hands data over through registerSources() (shared/sao-argo-data-provider.js
 *    does exactly that, from an isolated frame, so a page can answer from every Current dataset).
 *  - The active floor (or Underworld island) is the default context. A question that names a floor is
 *    answered from that floor, and a name that only one other floor holds is answered from there with a
 *    note; a name that matches several floors asks which one instead of merging them.
 *  - The engine returns structured facts plus status, never wording. Dialogue lives elsewhere.
 *
 * Loading order: after shared/sao-datasets.js. Every dependency is optional and probed defensively.
 */
(function (global) {
  "use strict";

  const ENGINE_VERSION = "1.3.0";

  /* Result statuses. */
  const STATUS = Object.freeze({
    ANSWER: "answer",
    AMBIGUOUS: "ambiguous",
    MISSING: "missing",
    UNSUPPORTED: "unsupported"
  });

  /* Entity kinds the engine can resolve. Items known only from a drop list are still `item` entities;
     their missing equipment record is reported through dataQuality instead of a separate type. A mob
     area is a `location` too, so a biome marker and the spawn area that shares its name stay one
     entity with both sets of facts. */
  const ENTITY_TYPES = Object.freeze({
    ITEM: "item",
    MOB: "mob",
    BOSS: "boss",
    NPC: "npc",
    MERCHANT: "merchant",
    LOCATION: "location",
    DUNGEON: "dungeon",
    QUEST: "quest"
  });

  /* Answer intents (what the visitor is asking for, not what the entity is). */
  const INTENTS = Object.freeze({
    ITEM: "item",
    MOB: "mob",
    DROP: "drop",
    MOB_DROPS: "mobDrops",
    NPC: "npc",
    RECIPE: "recipe",
    QUEST: "quest",
    LOCATION: "location",
    HELP: "help",
    /* Stage 5: questions about sets of records rather than one record. */
    COLLECTION: "collection",
    RANKING: "ranking",
    COMPARISON: "comparison",
    FARMING: "farming",
    UNKNOWN: "unknown"
  });

  /* What a collection, ranking or comparison is *about*. Each one maps to fields that actually exist
     in the Current datasets (see the ingest* functions); nothing here invents a field. */
  const TARGETS = Object.freeze({
    QUEST: "quest",
    BOSS: "boss",
    MOB: "mob",
    ITEM: "item",
    NPC: "npc",
    LOCATION: "location",
    DUNGEON: "dungeon",
    AREA: "area"
  });

  /* How many records a ranking returns when the visitor does not say. Collections return every match
     (the caller decides what it can display); rankings are a top list by definition. */
  const DEFAULT_RANKING_LIMIT = 5;
  const MAX_COMPARISON_ENTITIES = 4;
  const MAX_COMPARISON_ROWS = 12;
  const MAX_COLLECTION_RECORDS = 200;

  /* Every dataset value the site can select. Only `SUPPORTED_DATASETS` are answered: Beta-Test Data is
     temporary, so Argo recognises it and says so instead of reading either dataset. */
  const DATASETS = Object.freeze(["beta", "current"]);
  const SUPPORTED_DATASETS = Object.freeze(["current"]);
  /* The value used when nothing else resolves - the same fallback shared/sao-datasets.js uses for a
     missing or invalid dataset. It is deliberately NOT treated as Current Data. */
  const DEFAULT_DATASET = "beta";
  const WORLDS = Object.freeze(["aincrad", "underworld"]);
  const DEFAULT_WORLD = "aincrad";
  const DEFAULT_FLOOR = "floor1";
  /* Aincrad floors, in the order the pages load them. Underworld "floors" are island ids, which are
     not enumerable here, so a cross-floor search only ever runs for Aincrad. */
  const FLOORS = Object.freeze(["floor1", "floor2", "floor3"]);

  const MAX_CANDIDATES = 8;
  const MIN_PARTIAL_SCORE = 0.5;

  /* Bestiary tabs, in the order Aincrad/Bestiary/bestiary.js declares them. */
  const BESTIARY_TABS = Object.freeze(["regular", "boss", "dungeonMobs", "dungeonBoss"]);
  /* Marker categories that describe a merchant/service, taken from Aincrad/Map/adapter.js. */
  const MERCHANT_CATEGORIES = Object.freeze({
    alchemist: true,
    lumberjack: true,
    lootBuyers: true,
    weaponSellers: true,
    travelingMerchants: true,
    equipmentMerchants: true,
    toolMerchants: true,
    accessoriesMerchants: true,
    occultMerchants: true,
    consumablesMerchants: true,
    weaponsmith: true,
    armorBlacksmith: true,
    ingotBlacksmith: true,
    keyBlacksmith: true,
    materialsBlacksmith: true,
    accessoriesBlacksmith: true,
    secretAccessoryBlacksmith: true,
    runeCraftsmen: true,
    refaire: true
  });
  const DUNGEON_CATEGORIES = Object.freeze({ dungeons: true, bossSpawns: true, mobAreas: true });

  /* Words that never carry entity meaning, so they are dropped when a question is matched by tokens.
     Roman numerals are deliberately NOT listed: "i" is part of real item names such as "Health Potion I",
     and dropping it would silently collapse every tier of a potion into one entity. */
  const STOP_WORDS = Object.freeze(
    new Set([
      "a",
      "about",
      "an",
      "and",
      "any",
      "are",
      "as",
      "at",
      "be",
      "buy",
      "by",
      "can",
      "could",
      "do",
      "does",
      "find",
      "for",
      "from",
      "get",
      "give",
      "has",
      "have",
      "how",
      "in",
      "info",
      "information",
      "is",
      "it",
      "its",
      "know",
      "list",
      "located",
      "location",
      "me",
      "mob",
      "mobs",
      "monster",
      "monsters",
      "my",
      "of",
      "on",
      "or",
      "please",
      "show",
      "tell",
      "that",
      "the",
      "their",
      "them",
      "there",
      "this",
      "to",
      "was",
      "were",
      "what",
      "when",
      "where",
      "which",
      "who",
      "why",
      "with",
      "you",
      "your"
    ])
  );

  /* --- Small helpers -------------------------------------------------------- */

  /* Lowercase, accent-stripped, punctuation-free token string. The original text is never changed. */
  function normalizeQuestion(value) {
    return String(value === undefined || value === null ? "" : value)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function tokenize(normalized) {
    if (!normalized) return [];
    return normalized.split(" ").filter(Boolean);
  }

  /* Mirrors shared/sao-page-helpers.js slugifyContentId, which is preferred when it is loaded. */
  function slugify(value, fallback) {
    const helpers = global.SAOPageHelpers;
    if (helpers && typeof helpers.slugifyContentId === "function") {
      try {
        return helpers.slugifyContentId(value, fallback);
      } catch (_error) {
        /* Fall through to the local copy. */
      }
    }
    const emptyToken = fallback === undefined ? "unknown" : String(fallback);
    return (
      String(value || emptyToken)
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") || emptyToken
    );
  }

  function isPlainObject(value) {
    return Boolean(value) && typeof value === "object" && !Array.isArray(value);
  }

  function toArray(value) {
    return Array.isArray(value) ? value : [];
  }

  function hasOwn(object, key) {
    return Boolean(object) && Object.prototype.hasOwnProperty.call(object, key);
  }

  function textOf(value) {
    return typeof value === "string" ? value : "";
  }

  function uniqueStrings(values) {
    const seen = new Set();
    const output = [];
    for (const value of values) {
      const text = textOf(value).trim();
      if (!text || seen.has(text)) continue;
      seen.add(text);
      output.push(text);
    }
    return output;
  }

  /* The "N/A" placeholders the datasets use for "nothing recorded" are not facts. A number is a value:
     the Current quest entries store XP and Col rewards as numbers, not as strings. */
  function isPlaceholder(value) {
    if (typeof value === "number") return !Number.isFinite(value);
    const text = textOf(value).trim();
    return !text || /^n\/?a$/i.test(text);
  }

  /* A quest field as a value: a finite number stays a number, a placeholder becomes unknown, and any
     other text is kept as written. */
  function questFieldValue(value) {
    if (typeof value === "number") return Number.isFinite(value) ? value : null;
    return isPlaceholder(value) ? null : textOf(value).trim() || null;
  }
  /* --- Source access -------------------------------------------------------- */

  /* Injected overrides (tests, and any future page-level loader that wants to hand over data). */
  let injectedSources = null;

  /* Lexical probes. The map dataset is declared with a top-level `const` by a classic script, so it is
     reachable as a global but is NOT a property of window - the same reason Aincrad/Map/adapter.js reads
     DATA through `typeof DATA !== "undefined"`. `typeof` on an undeclared identifier is safe and needs
     no eval (which the page CSP forbids anyway). */
  const LEXICAL_PROBES = Object.freeze({
    DATA: () => (typeof DATA === "undefined" ? undefined : DATA),
    MOB_AREA_MOBS: () => (typeof MOB_AREA_MOBS === "undefined" ? undefined : MOB_AREA_MOBS)
  });

  function readLexical(name) {
    const probe = LEXICAL_PROBES[name];
    if (!probe) return undefined;
    try {
      return probe();
    } catch (_error) {
      return undefined;
    }
  }

  function readGlobal(name) {
    try {
      return global ? global[name] : undefined;
    } catch (_error) {
      return undefined;
    }
  }

  function pickSource(scope, key, readers) {
    const overrides = scope.injected;
    if (overrides && hasOwn(overrides, key)) return overrides[key];
    for (const read of readers) {
      const value = read();
      if (value !== undefined && value !== null) return value;
    }
    return undefined;
  }

  function normalizeEnum(value, allowed) {
    const text = textOf(value).trim().toLowerCase();
    return allowed.includes(text) ? text : null;
  }

  function resolveDataset(scope, datasets) {
    const explicit = normalizeEnum(scope.dataset, DATASETS);
    if (explicit) return explicit;
    if (datasets && typeof datasets.getDatasetFromLocation === "function") {
      try {
        const active = normalizeEnum(datasets.getDatasetFromLocation(), DATASETS);
        if (active) return active;
      } catch (_error) {
        /* Fall through to the default. */
      }
    }
    return DEFAULT_DATASET;
  }

  function resolveWorld(scope, datasets) {
    const explicit = normalizeEnum(scope.world, WORLDS);
    if (explicit) return explicit;
    if (datasets && typeof datasets.resolveWorld === "function") {
      try {
        const active = normalizeEnum(datasets.resolveWorld(), WORLDS);
        if (active) return active;
      } catch (_error) {
        /* Fall through to the default. */
      }
    }
    return DEFAULT_WORLD;
  }

  /* Aincrad floors are validated to floor1..floor3 (SAOPageHelpers.getRequestedFloor); the Fractured
     Underworld reuses the same ?floor= parameter for island ids, which are not validated. */
  function resolveFloor(scope, world) {
    const explicit = textOf(scope.floor).trim();
    if (explicit) return explicit;
    const location = global.location;
    const search = location && typeof location.search === "string" ? location.search : "";
    if (search) {
      try {
        const requested = new URLSearchParams(search).get("floor");
        if (requested) {
          if (world === "underworld") return requested;
          if (/^floor[123]$/.test(requested)) return requested;
        }
      } catch (_error) {
        /* Fall through to the default. */
      }
    }
    return world === "underworld" ? "playerIsland" : DEFAULT_FLOOR;
  }

  function resolveLanguage(scope) {
    const explicit = textOf(scope.language).trim().toLowerCase();
    if (explicit) return explicit;
    const i18n = readGlobal("SAOI18n");
    if (i18n && typeof i18n.getLanguage === "function") {
      try {
        const active = textOf(i18n.getLanguage()).trim().toLowerCase();
        if (active) return active;
      } catch (_error) {
        /* Fall through to English. */
      }
    }
    return "en";
  }

  /* Bumped whenever the registered sources change, so a cached index is never reused across them. */
  let sourcesVersion = 0;
  let lastPatch = null;
  let lastMerged = null;

  /* The per-call patch object identity is memoised, so repeating a query with the same fixture keeps
     hitting the index cache instead of rebuilding it. */
  function mergeInjectedSources(patch) {
    const safePatch = isPlainObject(patch) ? patch : null;
    if (!injectedSources && !safePatch) return null;
    if (safePatch && safePatch === lastPatch && lastMerged) return lastMerged;
    const merged = Object.assign({}, injectedSources || {}, safePatch || {});
    lastPatch = safePatch;
    lastMerged = Object.keys(merged).length ? merged : null;
    return lastMerged;
  }

  function resolveScope(context) {
    const config = isPlainObject(context) ? context : {};
    const datasets = readGlobal("SAODatasets");
    const scope = {
      dataset: resolveDataset(config, datasets),
      world: resolveWorld(config, datasets),
      language: resolveLanguage(config),
      patch: isPlainObject(config.sources) ? config.sources : null
    };
    /* Beta-Test Data is not supported, so the caller's records are not even copied for it: a question
       that cannot be answered never reads a single source. */
    scope.injected = SUPPORTED_DATASETS.includes(scope.dataset) ? mergeInjectedSources(scope.patch) : null;
    scope.floor = resolveFloor(config, scope.world);
    return scope;
  }
  /* Reads every Current-Data source the engine can see for a scope. Missing sources stay undefined, and
     no source is ever loaded by the engine itself (see the header comment for why). Beta-Test sources
     are deliberately absent: Argo answers from Current Data only. */
  function collectSources(scope) {
    return {
      markerData: pickSource(scope, "markerData", [() => readLexical("DATA"), () => readGlobal("DATA")]),
      /* The area -> mob table is shared data: Aincrad/Map/adapter.js reads the same table for Current
         Data and applies Aincrad/Map/maps_current.js's corrections on top of it, so Current answers need
         it exactly like the map does. It is never Beta wording on its own. */
      mobAreaMobs: pickSource(scope, "mobAreaMobs", [
        () => readLexical("MOB_AREA_MOBS"),
        () => readGlobal("MOB_AREA_MOBS")
      ]),
      currentMobAreas: pickSource(scope, "currentMobAreas", [() => readGlobal("SAO_CURRENT_MOB_AREAS")]),
      currentMobAreaLinks: pickSource(scope, "currentMobAreaLinks", [
        () => readGlobal("SAO_CURRENT_MOB_AREA_MOB_LINKS")
      ]),
      currentBestiary: pickSource(scope, "currentBestiary", [() => readGlobal("SAO_CURRENT_BESTIARY_DATA")]),
      currentEquipment: pickSource(scope, "currentEquipment", [() => readGlobal("SAO_CURRENT_EQUIPMENT_DATA")]),
      currentQuests: pickSource(scope, "currentQuests", [() => readGlobal("SAO_CURRENT_QUEST_ENTRIES_BY_FLOOR")]),
      underworldCompendium: pickSource(scope, "underworldCompendium", [
        () => readGlobal("SAO_CURRENT_FU_COMPENDIUM_DATA")
      ]),
      contentTranslations: pickSource(scope, "contentTranslations", [() => readGlobal("SAOContentTranslations")])
    };
  }

  /* --- Dataset readers (mirroring the pages that own each dataset) ----------- */

  /* Bestiary rows are TSV lines of "name \t drops \t xp"; drop tokens may carry "(85%)" and notes.
     This mirrors buildMobList()/parseDropToken() in Aincrad/Bestiary/bestiary.js exactly so the engine
     reads the same numbers the Bestiary page shows. */
  function parseDropToken(token) {
    const cleaned = textOf(token).trim();
    if (!cleaned) return null;
    const groups = [...cleaned.matchAll(/\(([^)]+)\)/g)].map((match) => match[1].trim());
    const notes = [];
    let chance = null;
    const explicitChance = cleaned.match(/(\d+(?:\.\d+)?)%/);
    if (explicitChance) chance = Number(explicitChance[1]);
    groups.forEach((group) => {
      const chanceMatch = group.match(/^(\d+(?:\.\d+)?)%$/);
      if (chanceMatch) {
        chance = Number(chanceMatch[1]);
        return;
      }
      notes.push(group);
    });
    let item = cleaned
      .replace(/\([^)]*\)/g, "")
      .replace(/\d+(?:\.\d+)?%/g, "")
      .trim();
    if (!item) item = "N/A";
    return {
      item,
      itemId: slugify(item, "n-a"),
      chance: Number.isFinite(chance) ? chance : null,
      notesText: notes.length ? `(${notes.join(", ")})` : ""
    };
  }

  function parseBestiaryText(rawText) {
    return String(rawText || "")
      .trim()
      .split("\n")
      .map((line) => line.split("\t"))
      .filter((parts) => parts.length >= 3)
      .map(([name, dropsRaw, xpRaw]) => {
        const mobName = name.trim();
        return {
          name: mobName,
          slug: slugify(mobName, "n-a"),
          xp: isPlaceholder(xpRaw) ? null : textOf(xpRaw).trim(),
          drops: String(dropsRaw || "")
            .split(",")
            .map(parseDropToken)
            .filter(Boolean)
        };
      })
      .filter((mob) => Boolean(mob.name));
  }

  /* The active Bestiary source: the Current per-floor object the page (or the provider) supplies. */
  function bestiaryTabsFrom(source) {
    const value = isPlainObject(source) ? source : {};
    return Object.fromEntries(BESTIARY_TABS.map((tab) => [tab, textOf(value[tab])]));
  }

  /* Current Data ships one object keyed by floor, so the active floor's Bestiary text is selected from
     it - including floors this page never loaded, because the provider hands the whole object over. */
  function readBestiaryTabs(sources, scope) {
    const floors = isPlainObject(sources.currentBestiary) ? sources.currentBestiary : {};
    return bestiaryTabsFrom(floors[scope.floor]);
  }

  /* Current Data ships one object keyed by floor: SAO_CURRENT_EQUIPMENT_DATA[floor]. */
  function readEquipmentFloorData(sources, scope) {
    const floors = isPlainObject(sources.currentEquipment) ? sources.currentEquipment : {};
    return isPlainObject(floors[scope.floor]) ? floors[scope.floor] : {};
  }

  /* The Current quest file buckets the Aincrad main questline and the Underworld questline together
     under floor1, so an Aincrad question must filter the Underworld entries out instead of mixing two
     worlds in one answer. */
  function isAincradQuestEntry(entry) {
    return isPlainObject(entry) && textOf(entry.world).trim().toLowerCase() !== "underworld";
  }

  function readQuestEntries(sources, scope) {
    const current = isPlainObject(sources.currentQuests) ? sources.currentQuests : {};
    if (scope.world === "underworld") {
      /* The questline is grouped under floor1 rather than under island keys - like the Quests page - so
         it is selected by world, and each entry keeps its own island for the caller to filter on. A
         single-record question therefore answers across islands and reports the mismatch (that is the
         documented behaviour the tests pin down); collection queries apply the active island themselves. */
      return Object.values(current)
        .flatMap((entries) => toArray(entries))
        .filter((entry) => isPlainObject(entry) && textOf(entry.world) === "underworld");
    }
    return toArray(current[scope.floor]).filter(isAincradQuestEntry);
  }
  /* --- Entity index --------------------------------------------------------- */

  function coordsOf(value) {
    if (!isPlainObject(value)) return null;
    const x = Number(value.x);
    const z = Number(value.z);
    if (!Number.isFinite(x) || !Number.isFinite(z)) return null;
    return { x, z };
  }

  /* Marker category/type -> the kind of entity the visitor is really asking about. */
  function markerEntityType(marker) {
    const category = textOf(marker.category);
    const type = textOf(marker.type).toLowerCase();
    if (MERCHANT_CATEGORIES[category]) return ENTITY_TYPES.MERCHANT;
    /* A boss spawn is a boss: the map marks it with `type: "Boss"`, and answering "what does X drop"
       for one has to reach the Bestiary record rather than a dungeon entry. */
    if (type === "boss") return ENTITY_TYPES.BOSS;
    if (DUNGEON_CATEGORIES[category] || type === "dungeon") return ENTITY_TYPES.DUNGEON;
    if (category === "mainQuests" || category === "sideQuests") return ENTITY_TYPES.QUEST;
    if (type === "npc") return ENTITY_TYPES.NPC;
    return ENTITY_TYPES.LOCATION;
  }

  /* SAODatasets owns this rule (it keeps the two map adapters from drifting); the local copy is only
     a fallback for a page where the shared module is missing. */
  function isCurrentMarker(marker) {
    const datasets = readGlobal("SAODatasets");
    if (datasets && typeof datasets.isCurrentDataMarker === "function") {
      try {
        return Boolean(datasets.isCurrentDataMarker(marker));
      } catch (_error) {
        /* Fall through to the local rule. */
      }
    }
    return marker.dataset === "current" || marker.category === "mainQuests";
  }

  /* Mirrors applyMobAreaMobLinks() in Aincrad/Map/adapter.js, which patches the shared area -> mob table
     with the Current Data corrections. The table itself is never edited, so the corrections stay the
     only Current-only part of the link. */
  function applyMobAreaMobLinks(lookup, overrides) {
    const areaIds = Object.keys(isPlainObject(overrides) ? overrides : {});
    if (!areaIds.length) return lookup;
    const merged = Object.assign({}, lookup);
    areaIds.forEach((areaId) => {
      const rows = toArray(lookup[areaId]);
      const plan = isPlainObject(overrides[areaId]) ? overrides[areaId] : {};
      const removed = new Set(toArray(plan.remove));
      const replaced = isPlainObject(plan.replace) ? plan.replace : {};
      const updated = isPlainObject(plan.update) ? plan.update : {};
      merged[areaId] = rows
        .filter((row) => isPlainObject(row) && !removed.has(row.name))
        .map((row) => {
          if (replaced[row.name]) return Object.assign({}, row, replaced[row.name]);
          if (updated[row.name]) return Object.assign({}, row, updated[row.name]);
          return row;
        })
        .concat(toArray(plan.add).map((row) => Object.assign({}, row)));
    });
    return merged;
  }

  function createEntityStore() {
    const byId = new Map();
    return {
      /* Merges by type+slug so a mob's Bestiary row, its spawn areas and its drop rows stay one entity. */
      upsert(type, name, slug) {
        const safeName = textOf(name).trim();
        if (!safeName) return null;
        const safeSlug = slug || slugify(safeName);
        const id = `${type}|${safeSlug}`;
        let entity = byId.get(id);
        if (!entity) {
          entity = {
            id,
            type,
            name: safeName,
            slug: safeSlug,
            aliases: [],
            contentKeys: [],
            bestiary: null,
            equipment: null,
            markers: [],
            spawnAreas: [],
            areas: [],
            quests: [],
            npcEntries: [],
            compendium: [],
            dropRows: []
          };
          byId.set(id, entity);
        }
        return entity;
      },
      list() {
        return Array.from(byId.values());
      }
    };
  }
  /* --- Ingestion ------------------------------------------------------------ */

  function ingestBestiary(store, sources, scope, availability) {
    const tabs = readBestiaryTabs(sources, scope);
    let found = 0;
    for (const tab of BESTIARY_TABS) {
      const mobs = parseBestiaryText(tabs[tab]);
      found += mobs.length;
      for (const mob of mobs) {
        const isBossTab = tab === "boss" || tab === "dungeonBoss";
        const entity = store.upsert(isBossTab ? ENTITY_TYPES.BOSS : ENTITY_TYPES.MOB, mob.name, mob.slug);
        if (!entity) continue;
        entity.contentKeys.push(`bestiary.mob.${mob.slug}`);
        entity.bestiary = { tab, xp: mob.xp, drops: mob.drops, floor: scope.floor, dataset: scope.dataset };
        for (const drop of mob.drops) {
          /* A drop name that has no equipment record still becomes an item entity, so "which mobs drop
             X" works for it - the missing record is reported through dataQuality instead. */
          const dropEntity = store.upsert(ENTITY_TYPES.ITEM, drop.item, drop.itemId);
          if (!dropEntity) continue;
          dropEntity.contentKeys.push(`bestiary.item.${drop.itemId}`);
          dropEntity.dropRows.push({
            mobId: entity.id,
            mobName: entity.name,
            tab,
            chance: drop.chance,
            notesText: drop.notesText,
            floor: scope.floor,
            dataset: scope.dataset
          });
        }
      }
    }
    availability.bestiary = found > 0;
  }

  function ingestEquipment(store, sources, scope, availability) {
    const floorData = readEquipmentFloorData(sources, scope);
    let found = 0;
    for (const category of Object.keys(floorData)) {
      for (const entry of toArray(floorData[category])) {
        if (!isPlainObject(entry)) continue;
        const name = textOf(entry.name).trim();
        if (!name) continue;
        found += 1;
        const slug = slugify(name);
        const entity = store.upsert(ENTITY_TYPES.ITEM, name, slug);
        if (!entity) continue;
        entity.contentKeys.push(`equipment.${slug}.name`);
        entity.equipment = {
          name,
          category,
          level: Number.isFinite(Number(entry.level)) ? Number(entry.level) : null,
          rarity: textOf(entry.rarity).trim() || null,
          description: textOf(entry.description).trim() || null,
          set: textOf(entry.set).trim() || null,
          craftingLocation: isPlaceholder(entry.craftingLocation) ? null : textOf(entry.craftingLocation).trim(),
          craftingResources: toArray(entry.craftingResources)
            .filter(isPlainObject)
            .map((resource) => ({
              item: textOf(resource.item).trim(),
              itemId: slugify(resource.item),
              amount: Number.isFinite(Number(resource.amount)) ? Number(resource.amount) : null
            }))
            .filter((resource) => Boolean(resource.item)),
          stats: isPlainObject(entry.stats) ? Object.assign({}, entry.stats) : {},
          floor: scope.floor,
          dataset: scope.dataset
        };
      }
    }
    availability.equipment = found > 0;
  }

  function ingestMarkers(store, sources, scope, availability) {
    const data = isPlainObject(sources.markerData) ? sources.markerData : null;
    if (!data) {
      availability.markers = false;
      return;
    }
    let found = 0;
    for (const [id, marker] of Object.entries(data)) {
      if (!isPlainObject(marker)) continue;
      if (textOf(marker.floor) !== scope.floor) continue;
      /* The shared map dataset also carries the site's Beta-Test markers; Argo answers from Current
         Data, so they are skipped rather than mixed in. */
      if (!isCurrentMarker(marker)) continue;
      const title = textOf(marker.title).trim();
      if (!title) continue;
      found += 1;
      const entity = store.upsert(markerEntityType(marker), title, slugify(title, id));
      if (!entity) continue;
      /* The Map page registers a marker's localized title as `map.<id>.title` (Aincrad/Map/maps.js calls
         registerMapMarker with no namespace, which defaults to "map"), so that is the key a localized
         name can be matched through. A page that has not registered the marker adds nothing. */
      entity.contentKeys.push(`map.${id}.title`);
      entity.markers.push({
        id,
        title,
        type: textOf(marker.type).trim() || null,
        category: textOf(marker.category).trim() || null,
        floor: textOf(marker.floor),
        coords: coordsOf(marker.coords),
        description: textOf(marker.description).trim() || null,
        dataset: "current"
      });
    }
    availability.markers = found > 0;
  }
  function ingestMobAreas(store, sources, scope, availability) {
    /* Current Data ships its own area list (Aincrad/Map/maps_current.js) and corrects the shared
       area -> mob table through its own links table, exactly like Aincrad/Map/adapter.js does. */
    const baseLookup = isPlainObject(sources.mobAreaMobs) ? sources.mobAreaMobs : {};
    const lookup = applyMobAreaMobLinks(baseLookup, sources.currentMobAreaLinks);
    const areas = toArray(sources.currentMobAreas).filter(
      (area) => isPlainObject(area) && textOf(area.floor) === scope.floor
    );
    const areaById = new Map();
    for (const area of areas) {
      const title = textOf(area.title).trim();
      if (!title) continue;
      const entity = store.upsert(ENTITY_TYPES.LOCATION, title, slugify(title, area.id));
      if (!entity) continue;
      const record = {
        id: textOf(area.id).trim(),
        title,
        floor: textOf(area.floor),
        underground: area.underground === true,
        corners: toArray(area.corners).map(coordsOf).filter(Boolean),
        dataset: scope.dataset
      };
      entity.areas.push(record);
      areaById.set(record.id, record);
    }

    for (const [areaId, rows] of Object.entries(lookup)) {
      const area = areaById.get(areaId);
      if (!area) continue; /* An area that is not on the active floor is out of scope. */
      for (const row of toArray(rows)) {
        if (!isPlainObject(row)) continue;
        /* The map lists `name` and links to the Bestiary with `search`; the Bestiary name is what the
           mob entity is keyed by, so the listed wording is kept as an alias. A row is a spawn-area
           relationship only - it is never treated as a drop. */
        const listed = textOf(row.name).trim();
        const canonical = textOf(row.search).trim() || listed;
        if (!canonical) continue;
        const mob = store.upsert(ENTITY_TYPES.MOB, canonical, slugify(canonical, "n-a"));
        if (!mob) continue;
        if (listed && listed !== canonical) mob.aliases.push(listed);
        mob.spawnAreas.push({
          areaId,
          areaTitle: area.title,
          floor: area.floor,
          underground: area.underground,
          category: textOf(row.category).trim() || (area.underground ? "dungeonMobs" : "regular"),
          listedAs: listed || null,
          dataset: scope.dataset
        });
      }
    }
    availability.mobAreas = areas.length > 0;
  }

  function ingestQuests(store, sources, scope, availability) {
    const entries = readQuestEntries(sources, scope);
    availability.quests = entries.length > 0;
    for (const entry of entries) {
      if (!isPlainObject(entry)) continue;
      const npcName = isPlaceholder(entry.npcName) ? null : textOf(entry.npcName).trim();
      const questName = isPlaceholder(entry.questName) ? null : textOf(entry.questName).trim();
      const record = {
        id: textOf(entry.id).trim() || null,
        questName,
        questType: textOf(entry.questType).trim() || null,
        questNumber: Number.isFinite(Number(entry.questNumber)) ? Number(entry.questNumber) : null,
        npcName,
        city: isPlaceholder(entry.city) ? null : textOf(entry.city).trim(),
        coordinates: isPlaceholder(entry.coordinates) ? null : textOf(entry.coordinates).trim(),
        requirements: isPlaceholder(entry.requirements) ? null : textOf(entry.requirements).trim(),
        xpReward: questFieldValue(entry.xpReward),
        colReward: questFieldValue(entry.colReward),
        bonusItems: questFieldValue(entry.bonusItems),
        markerCoords: coordsOf(entry.markerCoords),
        world: textOf(entry.world).trim() || (scope.world === "underworld" ? "underworld" : "aincrad"),
        island: textOf(entry.island).trim() || null,
        floor: scope.floor,
        dataset: scope.dataset
      };

      if (questName) {
        const questEntity = store.upsert(ENTITY_TYPES.QUEST, questName, slugify(questName));
        if (questEntity) {
          /* The Quests page reads quest.<id>.<field>; Current entries carry ids (mq-7, sq-1). */
          questEntity.contentKeys.push(`quest.${record.id || slugify(questName)}.questName`);
          questEntity.quests.push(record);
        }
      }
      if (npcName) {
        const npcEntity = store.upsert(ENTITY_TYPES.NPC, npcName, slugify(npcName));
        if (npcEntity) {
          /* A row without a quest name is an NPC request; the NPC name is the findable entity. */
          npcEntity.npcEntries.push(Object.assign({ kind: questName ? "questNpc" : "request" }, record));
        }
      }
    }
  }

  /* The Fractured Underworld Compendium is a Current-only list with its own entry shape. */
  function ingestCompendium(store, sources, scope, availability) {
    if (scope.world !== "underworld") return;
    const entries = toArray(sources.underworldCompendium);
    availability.compendium = entries.length > 0;
    for (const entry of entries) {
      if (!isPlainObject(entry)) continue;
      const name = textOf(entry.name).trim();
      if (!name) continue;
      const entity = store.upsert(ENTITY_TYPES.ITEM, name, slugify(name));
      if (!entity) continue;
      entity.compendium.push({
        name,
        category: textOf(entry.category).trim() || null,
        type: textOf(entry.type).trim() || null,
        description: textOf(entry.description).trim() || null,
        details: textOf(entry.details).trim() || null,
        stats: isPlainObject(entry.stats) ? Object.assign({}, entry.stats) : {},
        floor: scope.floor,
        world: scope.world,
        dataset: "current"
      });
    }
  }
  /* --- Index assembly ------------------------------------------------------- */

  /* Adds the active language's name for an entity when the existing content registry already has one.
     No registry is created and no string is invented: an absent key simply adds nothing. */
  function addLocalizedAliases(entities, sources, scope) {
    const registry = sources.contentTranslations;
    if (!isPlainObject(registry) || !scope.language || scope.language === "en") return;
    const dictionary = isPlainObject(registry[scope.language]) ? registry[scope.language] : null;
    if (!dictionary) return;
    for (const entity of entities) {
      for (const key of entity.contentKeys) {
        const localized = textOf(dictionary[key]).trim();
        if (localized && localized !== entity.name) entity.aliases.push(localized);
      }
    }
  }

  function buildIndex(scope) {
    const sources = collectSources(scope);
    const availability = {
      bestiary: false,
      equipment: false,
      markers: false,
      mobAreas: false,
      quests: false,
      compendium: false,
      contentTranslations: isPlainObject(sources.contentTranslations)
    };
    const store = createEntityStore();
    ingestBestiary(store, sources, scope, availability);
    ingestEquipment(store, sources, scope, availability);
    ingestMarkers(store, sources, scope, availability);
    ingestMobAreas(store, sources, scope, availability);
    ingestQuests(store, sources, scope, availability);
    ingestCompendium(store, sources, scope, availability);

    const entities = store.list();
    addLocalizedAliases(entities, sources, scope);

    const byNormalizedName = new Map();
    for (const entity of entities) {
      entity.matchNames = uniqueStrings([entity.name].concat(entity.aliases));
      for (const name of entity.matchNames) {
        const normalized = normalizeQuestion(name);
        if (!normalized) continue;
        if (!byNormalizedName.has(normalized)) byNormalizedName.set(normalized, []);
        byNormalizedName.get(normalized).push(entity);
      }
    }
    const byId = new Map(entities.map((entity) => [entity.id, entity]));
    /* Every numeric stat key the active floor uses, so a ranking or a threshold can only ever be built
       on a field the data actually has. */
    const statKeys = new Set();
    for (const entity of entities) {
      for (const key of Object.keys((entity.equipment && entity.equipment.stats) || {})) {
        if (isNumericStatKey(key)) statKeys.add(key);
      }
    }
    return { scope, sources, availability, entities, byId, byNormalizedName, statKeys: [...statKeys] };
  }

  /* Indexes are cached per world+dataset+floor+language. The datasets are static once the page has
     loaded them, so a question never rebuilds or re-copies a dataset. */
  const indexCache = new Map();

  function getIndex(scope) {
    const key = [scope.world, scope.dataset, scope.floor, scope.language].join("|");
    const cached = indexCache.get(key);
    if (cached && cached.version === sourcesVersion && cached.patch === scope.patch) return cached.index;
    const index = buildIndex(scope);
    indexCache.set(key, { version: sourcesVersion, patch: scope.patch, index });
    return index;
  }

  function clearCache() {
    indexCache.clear();
  }

  /* --- Matching ------------------------------------------------------------- */

  function phraseTokens(normalized) {
    return tokenize(normalized).filter((token) => !STOP_WORDS.has(token));
  }

  function jaccard(left, right) {
    if (!left.length || !right.length) return 0;
    const setLeft = new Set(left);
    const setRight = new Set(right);
    let intersection = 0;
    for (const token of setLeft) if (setRight.has(token)) intersection += 1;
    const union = setLeft.size + setRight.size - intersection;
    return union ? intersection / union : 0;
  }

  /* The forms a word can plausibly take, so a singular question matches a plural record name and the
     other way round: a visitor asking for the "Occult Glove" means the recorded "Occult Gloves", and one
     asking for "Occult Robes" means the recorded "Occult Robe". Shallow on purpose - a final s / es / ies,
     and only on a word long enough for the ending to really be a plural - never a stemmer. A word may
     reduce two ways ("gloves" -> "glove" by the s, "boxes" -> "box" by the es), so both are offered and
     two words count as the same when their forms overlap. */
  function tokenForms(token) {
    const forms = new Set([token]);
    if (token.length <= 3 || token.endsWith("ss") || token.endsWith("us") || token.endsWith("is")) return forms;
    if (token.endsWith("ies") && token.length > 4) forms.add(`${token.slice(0, -3)}y`);
    if (token.endsWith("s")) forms.add(token.slice(0, -1));
    if (token.endsWith("es")) forms.add(token.slice(0, -2));
    return forms;
  }

  function sameWord(left, right) {
    if (left === right) return true;
    const leftForms = tokenForms(left);
    for (const form of tokenForms(right)) {
      if (leftForms.has(form)) return true;
    }
    return false;
  }

  /* True when `needle` appears as a contiguous run inside `haystack`. Keeping the strong partial match
     sequence-based stops the pronoun "i" from matching a roman numeral elsewhere in the question. */
  function containsRun(haystack, needle, equals) {
    const isEqual = typeof equals === "function" ? equals : (left, right) => left === right;
    if (!needle.length || needle.length > haystack.length) return false;
    for (let start = 0; start + needle.length <= haystack.length; start += 1) {
      let matched = true;
      for (let offset = 0; offset < needle.length; offset += 1) {
        if (!isEqual(haystack[start + offset], needle[offset])) {
          matched = false;
          break;
        }
      }
      if (matched) return true;
    }
    return false;
  }

  /* Exact-first scoring: an entity name that appears in the question as a whole word sequence wins
     outright (the longest such name wins), and only then is conservative token overlap considered. */
  function scoreEntity(entity, normalizedQuestion, questionTokens) {
    const names = entity.matchNames && entity.matchNames.length ? entity.matchNames : [entity.name];
    let exactName = null;
    let exactLength = 0;
    for (const name of names) {
      const normalizedName = normalizeQuestion(name);
      if (!normalizedName) continue;
      if (` ${normalizedQuestion} `.includes(` ${normalizedName} `) && normalizedName.length > exactLength) {
        exactLength = normalizedName.length;
        exactName = name;
      }
    }
    if (exactName) return { score: 1, quality: "exact", matchedName: exactName };

    /* The same name with only a trailing plural difference is still the visitor naming that record, so it
       counts as exact rather than approximate - and the longest such name wins, exactly as the strict
       pass above decides. That is what keeps "Occult Gloves" reachable from "Occult Glove" without the
       shorter record that merely sits inside the question taking its place. */
    let pluralName = null;
    let pluralLength = 0;
    for (const name of names) {
      const nameTokens = phraseTokens(normalizeQuestion(name));
      if (!nameTokens.length || !questionTokens.length) continue;
      if (!containsRun(questionTokens, nameTokens, sameWord)) continue;
      const length = normalizeQuestion(name).length;
      if (length > pluralLength) {
        pluralLength = length;
        pluralName = name;
      }
    }
    if (pluralName) return { score: 1, quality: "exact", matchedName: pluralName };

    let bestScore = 0;
    let bestName = null;
    for (const name of names) {
      const nameTokens = phraseTokens(normalizeQuestion(name));
      if (!nameTokens.length || !questionTokens.length) continue;
      /* Only the words the question actually asks with, once a trailing plural is allowed to differ. */
      const questionInName = questionTokens.every((token) =>
        nameTokens.some((nameToken) => sameWord(token, nameToken))
      );
      const score = questionInName ? 0.7 : jaccard(questionTokens, nameTokens);
      if (score > bestScore) {
        bestScore = score;
        bestName = name;
      }
    }
    if (bestScore < MIN_PARTIAL_SCORE) return null;
    return { score: bestScore, quality: bestScore >= 0.9 ? "strong" : "partial", matchedName: bestName };
  }

  function findEntities(index, normalizedQuestion) {
    const questionTokens = phraseTokens(normalizedQuestion);
    const results = [];
    for (const entity of index.entities) {
      const scored = scoreEntity(entity, normalizedQuestion, questionTokens);
      if (!scored) continue;
      results.push({ entity, score: scored.score, quality: scored.quality, matchedName: scored.matchedName });
    }
    results.sort((left, right) => {
      if (right.score !== left.score) return right.score - left.score;
      const leftLength = normalizeQuestion(left.matchedName || left.entity.name).length;
      const rightLength = normalizeQuestion(right.matchedName || right.entity.name).length;
      if (rightLength !== leftLength) return rightLength - leftLength;
      return left.entity.name.localeCompare(right.entity.name);
    });
    return results;
  }
  /* --- Question vocabulary (Stage 5) ---------------------------------------- */

  /* Words that mean the same thing to the *parser*. Only the visitor's own wording is rewritten; record
     names are never touched, because a name is matched against the datasets exactly as they spell it. */
  const TOKEN_ALIASES = Object.freeze({
    exp: "xp",
    experience: "xp",
    xps: "xp",
    gear: "equipment",
    equip: "equipment",
    items: "item",
    weapons: "weapon",
    wep: "weapon",
    armors: "armor",
    armour: "armor",
    armours: "armor",
    accessories: "accessory",
    acc: "accessory",
    mats: "material",
    materials: "material",
    consumables: "consumable",
    foods: "food",
    tools: "tool",
    runes: "rune",
    dungeons: "dungeon",
    monsters: "mob",
    monster: "mob",
    mobs: "mob",
    enemies: "mob",
    enemy: "mob",
    creatures: "mob",
    creature: "mob",
    npcs: "npc",
    merchants: "merchant",
    vendors: "merchant",
    places: "location",
    locations: "location",
    areas: "area",
    biomes: "biome",
    quests: "quest",
    bosses: "boss",
    stats: "stat",
    statistics: "stat",
    defence: "defense",
    def: "defense",
    dmg: "damage",
    atk: "attack",
    hp: "health",
    mp: "mana",
    sp: "stamina",
    crit: "critical",
    qty: "quantity",
    lvl: "level",
    loot: "drops",
    looted: "drops"
  });

  /* The same cues in the site's other two languages, so a visitor who types Spanish or French is
     understood for the *shape* of the question. Record names are still the datasets' own names (plus
     the localized aliases the content registry already provides). These words are unambiguous enough
     that applying them to every question cannot change an English one. */
  const LOCALIZED_ALIASES = Object.freeze({
    es: Object.freeze({
      todo: "all",
      toda: "all",
      todos: "all",
      todas: "all",
      lista: "all",
      listar: "all",
      muestra: "all",
      muestrame: "all",
      dime: "all",
      cuantos: "howmany",
      cuantas: "howmany",
      cuales: "which",
      cual: "which",
      mejor: "best",
      mejores: "best",
      peor: "worst",
      mayor: "highest",
      mas: "more",
      menor: "lowest",
      ordena: "sort",
      ordenar: "sort",
      ordenados: "sort",
      por: "by",
      descendente: "descending",
      ascendente: "ascending",
      compara: "compare",
      comparar: "compare",
      comparame: "compare",
      diferencia: "difference",
      diferencias: "difference",
      entre: "between",
      contra: "versus",
      donde: "where",
      obtener: "get",
      consigo: "get",
      conseguir: "get",
      farmear: "farm",
      farmeo: "farm",
      granjear: "farm",
      suelta: "drops",
      sueltan: "drops",
      botin: "drops",
      botines: "drops",
      mision: "quest",
      misiones: "quest",
      secundaria: "side",
      secundarias: "side",
      principal: "main",
      principales: "main",
      jefe: "boss",
      jefes: "boss",
      monstruos: "mob",
      monstruo: "mob",
      objetos: "item",
      objeto: "item",
      arma: "weapon",
      armas: "weapon",
      armadura: "armor",
      armaduras: "armor",
      accesorio: "accessory",
      accesorios: "accessory",
      material: "material",
      materiales: "material",
      consumible: "consumable",
      consumibles: "consumable",
      comida: "food",
      herramienta: "tool",
      herramientas: "tool",
      mazmorra: "dungeon",
      mazmorras: "dungeon",
      mercader: "merchant",
      mercaderes: "merchant",
      vendedor: "merchant",
      lugar: "location",
      lugares: "location",
      zona: "area",
      zonas: "area",
      experiencia: "xp",
      defensa: "defense",
      ataque: "attack",
      dano: "damage",
      salud: "health",
      vida: "health",
      velocidad: "speed",
      nivel: "level",
      precio: "price",
      /* Words the audit showed were missing: without them a natural Spanish question fell back to the
         default intent, or leaked the word into a keyword filter and matched nothing. Every value is a
         canonical cue the parser already understands. */
      alto: "highest",
      bajo: "lowest",
      menos: "less",
      rango: "rank",
      cada: "each",
      contar: "count",
      cuenta: "count",
      enemigo: "mob",
      enemigos: "mob",
      criatura: "mob",
      criaturas: "mob",
      bestiario: "bestiary",
      objetivo: "objective",
      objetivos: "objective",
      ubicacion: "location",
      ubicaciones: "location",
      sitio: "place",
      sitios: "place",
      mapa: "map",
      bioma: "biome",
      biomas: "biome",
      equipo: "equipment",
      equipamiento: "equipment",
      herrero: "blacksmith",
      herreros: "blacksmith",
      vendedores: "vendor",
      tendero: "shopkeeper",
      tenderos: "shopkeeper",
      receta: "recipe",
      recetas: "recipe",
      ingrediente: "ingredients",
      ingredientes: "ingredients",
      fabricar: "craft",
      fabrico: "craft",
      estadistica: "stat",
      estadisticas: "stat",
      bonificacion: "bonus",
      bonificaciones: "bonus",
      critico: "critical",
      estamina: "stamina",
      cantidad: "quantity",
      valor: "value",
      curacion: "healing",
      esquiva: "dodge",
      bloqueo: "block",
      regeneracion: "regeneration",
      robo: "steal"
    }),
    fr: Object.freeze({
      tout: "all",
      toute: "all",
      tous: "all",
      toutes: "all",
      liste: "all",
      lister: "all",
      montre: "all",
      montrez: "all",
      affiche: "all",
      afficher: "all",
      combien: "howmany",
      quels: "which",
      quelles: "which",
      quel: "which",
      meilleur: "best",
      meilleure: "best",
      pire: "worst",
      plus: "more",
      moins: "less",
      trie: "sort",
      trier: "sort",
      classe: "sort",
      classer: "sort",
      par: "by",
      descendant: "descending",
      decroissant: "descending",
      ascendant: "ascending",
      croissant: "ascending",
      compare: "compare",
      comparer: "compare",
      difference: "difference",
      differences: "difference",
      entre: "between",
      versus: "versus",
      ou: "where",
      obtenir: "get",
      trouve: "find",
      farmer: "farm",
      cultiver: "farm",
      lache: "drops",
      lachent: "drops",
      butin: "drops",
      quete: "quest",
      quetes: "quest",
      secondaire: "side",
      secondaires: "side",
      principale: "main",
      principales: "main",
      monstres: "mob",
      monstre: "mob",
      objets: "item",
      objet: "item",
      arme: "weapon",
      armes: "weapon",
      armure: "armor",
      armures: "armor",
      accessoire: "accessory",
      accessoires: "accessory",
      materiaux: "material",
      consommable: "consumable",
      consommables: "consumable",
      nourriture: "food",
      outil: "tool",
      outils: "tool",
      donjon: "dungeon",
      donjons: "dungeon",
      marchand: "merchant",
      marchands: "merchant",
      lieu: "location",
      lieux: "location",
      zones: "area",
      defense: "defense",
      attaque: "attack",
      degats: "damage",
      sante: "health",
      vie: "health",
      vitesse: "speed",
      niveau: "level",
      prix: "price",
      /* The same audit, the same class of gap, in French. "quelle" was the one that broke a ranking. */
      quelle: "which",
      meilleurs: "best",
      meilleures: "best",
      pires: "worst",
      rang: "rank",
      chaque: "each",
      compter: "count",
      ennemi: "mob",
      ennemis: "mob",
      bestiaire: "bestiary",
      objectif: "objective",
      objectifs: "objective",
      endroit: "place",
      endroits: "place",
      carte: "map",
      equipement: "equipment",
      forgeron: "blacksmith",
      vendeur: "vendor",
      vendeurs: "vendor",
      boutiquier: "shopkeeper",
      recette: "recipe",
      recettes: "recipe",
      ingredient: "ingredients",
      ingredients: "ingredients",
      fabriquer: "craft",
      fabrique: "craft",
      artisanat: "craft",
      statistique: "stat",
      statistiques: "stat",
      critique: "critical",
      endurance: "stamina",
      quantite: "quantity",
      valeur: "value",
      soin: "healing",
      esquive: "dodge",
      blocage: "block",
      regeneration: "regeneration"
    })
  });

  /* The visitor's words -> canonical cue words. A token that is already canonical is left alone. */
  function canonicalToken(token) {
    const text = textOf(token).trim().toLowerCase();
    if (!text) return "";
    if (hasOwn(TOKEN_ALIASES, text)) return TOKEN_ALIASES[text];
    for (const language of ["es", "fr"]) {
      const table = LOCALIZED_ALIASES[language];
      if (table && hasOwn(table, text)) return table[text];
    }
    return text;
  }

  function canonicalTokens(tokens) {
    return toArray(tokens).map(canonicalToken).filter(Boolean);
  }

  /* Every word the parser understands. Typo tolerance is limited to this list, so a misspelled cue can
     be recognised while a record name is never rewritten into something it is not. */
  const CUE_VOCABULARY = Object.freeze(
    [
      ...Object.values(TOKEN_ALIASES),
      ...Object.values(LOCALIZED_ALIASES.es),
      ...Object.values(LOCALIZED_ALIASES.fr),
      "all",
      "every",
      "each",
      "list",
      "howmany",
      "which",
      "count",
      "highest",
      "lowest",
      "most",
      "least",
      "best",
      "worst",
      "top",
      "sort",
      "order",
      "rank",
      "compare",
      "difference",
      "versus",
      "between",
      "farm",
      "grinding",
      "chance",
      "descending",
      "ascending",
      "quest",
      "boss",
      "mob",
      "item",
      "npc",
      "merchant",
      "location",
      "area",
      "dungeon",
      "weapon",
      "armor",
      "accessory",
      "material",
      "consumable",
      "food",
      "tool",
      "rune",
      "currency",
      "xp",
      "col",
      "level",
      "defense",
      "attack",
      "damage",
      "health",
      "mana",
      "speed",
      "critical",
      "chance",
      "side",
      "main"
    ].filter((word, index, list) => list.indexOf(word) === index)
  );

  /* One edit away (insert, delete, replace or swap a neighbouring pair), used only to snap a word to
     CUE_VOCABULARY. Short words are excluded: at four letters or fewer, two different words are often one
     edit apart. */
  function withinOneEdit(left, right) {
    if (left === right) return true;
    const a = textOf(left);
    const b = textOf(right);
    if (Math.abs(a.length - b.length) > 1) return false;
    let indexA = 0;
    let indexB = 0;
    let edits = 0;
    while (indexA < a.length && indexB < b.length) {
      if (a[indexA] === b[indexB]) {
        indexA += 1;
        indexB += 1;
        continue;
      }
      edits += 1;
      if (edits > 1) return false;
      /* A swapped neighbouring pair ("quets" for "quest") is a single typing slip. */
      if (a[indexA] === b[indexB + 1] && a[indexA + 1] === b[indexB]) {
        indexA += 2;
        indexB += 2;
      } else if (a.length > b.length) {
        indexA += 1;
      } else if (b.length > a.length) {
        indexB += 1;
      } else {
        indexA += 1;
        indexB += 1;
      }
    }
    return edits + (a.length - indexA) + (b.length - indexB) <= 1;
  }

  function snapToken(token) {
    const text = textOf(token).trim().toLowerCase();
    if (!text || text.length < 5) return text;
    for (const word of CUE_VOCABULARY) {
      if (word.length < 5) continue;
      if (withinOneEdit(text, word)) return word;
    }
    return text;
  }

  /* Question tokens: canonical, then typo-snapped. Record names are matched from the original tokens
     instead, so this can never rewrite a name. */
  function questionTokens(normalized) {
    return canonicalTokens(tokenize(normalized).map(snapToken));
  }

  /* The datasets write numbers as display strings ("+2", "1.1/s", "+5%", "600") and sometimes as real
     numbers. The first signed number is the value; a value with no number in it is unknown - never zero. */
  function numericValue(raw) {
    if (typeof raw === "number") return Number.isFinite(raw) ? raw : null;
    const text = textOf(raw).trim();
    if (!text) return null;
    const match = text.match(/-?\d+(?:\.\d+)?/);
    if (!match) return null;
    const value = Number(match[0]);
    return Number.isFinite(value) ? value : null;
  }

  /* Stat keys whose values are labels rather than numbers. Reading "Sword [P1]" as the number 1 would
     invent a ranking, so these keys are never treated as numeric. */
  const NON_NUMERIC_STAT_KEYS = Object.freeze(new Set(["class", "weapon category", "two-handed", "unique"]));

  function isNumericStatKey(key) {
    return !NON_NUMERIC_STAT_KEYS.has(textOf(key).trim().toLowerCase());
  }

  /* --- Question plans (Stage 5) --------------------------------------------- */

  /* Cue words the parser keys on, matched against the canonical question tokens. */
  const COLLECTIVE_CUES = Object.freeze(new Set(["all", "every", "each", "list", "everything", "howmany", "count"]));
  const RANKING_CUES = Object.freeze(
    new Set(["highest", "lowest", "most", "least", "best", "worst", "top", "sort", "order", "rank", "more", "less"])
  );
  const COMPARISON_CUES = Object.freeze(new Set(["compare", "difference", "versus", "between"]));
  const FARMING_CUES = Object.freeze(new Set(["farm", "grinding"]));
  const HIGH_CUES = Object.freeze(new Set(["highest", "most", "best", "top", "more"]));
  const LOW_CUES = Object.freeze(new Set(["lowest", "least", "worst", "less"]));
  const ASCENDING_CUES = Object.freeze(new Set(["ascending", "lowestfirst"]));
  const DESCENDING_CUES = Object.freeze(new Set(["descending", "highestfirst"]));
  /* Thresholds are phrases ("more than 3", "at least 5"), so they are matched on the normalized text
     rather than token by token. */
  const THRESHOLD_ABOVE_PATTERN = /\b(above|over|more than|at least|minimum|greater than|higher than)\b/;
  const THRESHOLD_BELOW_PATTERN = /\b(below|under|less than|at most|maximum|lower than)\b/;
  const THRESHOLD_ABOVE_STRICT_PATTERN = /\b(above|over|more than|greater than|higher than)\b/;
  const THRESHOLD_BELOW_STRICT_PATTERN = /\b(below|under|less than|lower than)\b/;

  /* What the question is about. The first target whose cue appears wins, so a question that mentions
     both "boss" and "mob" is a boss question. */
  const TARGET_CUES = Object.freeze([
    { target: TARGETS.QUEST, cues: ["quest", "questline", "mission", "objective"] },
    { target: TARGETS.BOSS, cues: ["boss", "raid"] },
    { target: TARGETS.MOB, cues: ["mob", "monster", "enemy", "creature", "bestiary"] },
    { target: TARGETS.NPC, cues: ["npc", "merchant", "vendor", "shopkeeper", "blacksmith"] },
    { target: TARGETS.DUNGEON, cues: ["dungeon"] },
    { target: TARGETS.LOCATION, cues: ["location", "place", "biome", "map", "waypoint"] },
    { target: TARGETS.AREA, cues: ["area", "zone", "spawnarea"] },
    {
      target: TARGETS.ITEM,
      cues: [
        "item",
        "equipment",
        "gear",
        "drop",
        "loot",
        "price",
        "weapon",
        "armor",
        "accessory",
        "rune",
        "tool",
        "food",
        "consumable",
        "material",
        "currency"
      ]
    }
  ]);

  /* Equipment categories, spelled the way Aincrad/eCompendium/ecompendium_current.js keys them. */
  const CATEGORY_CUES = Object.freeze({
    weapon: ["weapon"],
    armor: ["armor"],
    accessory: ["accessory"],
    rune: ["rune"],
    tool: ["tool"],
    food: ["food"],
    consumable: ["consumable"],
    material: ["material"],
    currency: ["currency"],
    quest_item: ["questitem"],
    resource: ["resource"]
  });

  /* Fields a ranking can use, per target. `xp`/`col` are the quest reward fields the Quests page
     renders and the Bestiary's XP column; `level` and the numeric stats are equipment fields. Nothing
     here is derived from anything the datasets do not record. */
  const RANK_FIELDS = Object.freeze({
    [TARGETS.QUEST]: { xp: "xpReward", col: "colReward", level: null, stat: false },
    [TARGETS.MOB]: { xp: "xp", col: null, level: null, stat: false },
    [TARGETS.BOSS]: { xp: "xp", col: null, level: null, stat: false },
    [TARGETS.ITEM]: { xp: null, col: null, level: "level", stat: true }
  });

  /* Matches the visitor's words to a stat key the active floor actually uses ("attack" -> "Attack
     Damage"). A tie means the request is ambiguous, and an ambiguous request is reported rather than
     guessed. */
  const STAT_KEY_PREFERENCES = Object.freeze({ attack: "Attack Damage", damage: "Attack Damage" });

  function resolveStatKey(requestedTokens, availableKeys) {
    const words = canonicalTokens(requestedTokens).filter((token) => !STOP_WORDS.has(token) && !/^\d+$/.test(token));
    if (!words.length) return { key: null, candidates: [] };
    let bestScore = 0;
    let best = [];
    for (const key of toArray(availableKeys)) {
      const keyWords = tokenize(normalizeQuestion(key));
      const score = words.filter((word) => keyWords.includes(word)).length;
      if (!score) continue;
      if (score > bestScore) {
        bestScore = score;
        best = [key];
      } else if (score === bestScore) {
        best.push(key);
      }
    }
    if (best.length === 1) return { key: best[0], candidates: [] };
    /* A word that several fields contain is read as the field the game itself treats as the primary one
       ("attack" -> "Attack Damage" on weapons), so the common question is still answered; any other tie
       is reported as ambiguous. */
    const preference = words.map((word) => STAT_KEY_PREFERENCES[word]).find(Boolean);
    if (preference && best.includes(preference)) return { key: preference, candidates: [] };
    /* More than one field matches the wording: the caller asks which one instead of choosing. */
    return { key: null, candidates: best };
  }

  /* The field a ranking should use for the active target, or null when the data has no such field. */
  function resolveRankField(target, tokens, index) {
    const fields = RANK_FIELDS[target] || null;
    if (!fields) return null;
    if (tokens.includes("xp") && fields.xp) return { field: fields.xp, kind: "xp" };
    if (tokens.includes("col") && fields.col) return { field: fields.col, kind: "col" };
    if (tokens.includes("level") && fields.level) return { field: fields.level, kind: "level" };
    if (fields.stat) {
      const resolved = resolveStatKey(tokens, index.statKeys);
      if (resolved.key) return { field: resolved.key, kind: "stat" };
      if (resolved.candidates.length) return { field: null, kind: "stat", candidates: resolved.candidates };
    }
    return null;
  }

  /* Numbers written in the question ("defense above 3", "level 10 to 20"). */
  function numbersIn(normalized) {
    return [...textOf(normalized).matchAll(/\d+(?:\.\d+)?/g)].map((match) => Number(match[0]));
  }

  /* Words that describe the request rather than a record, so they never become a keyword filter. The
     Spanish and French articles and particles are listed too: a localized question would otherwise leave
     them behind as a keyword and match nothing. */
  const FILTER_STOP_WORDS = Object.freeze(
    new Set([
      "floor",
      "floors",
      "island",
      "islands",
      "thing",
      "things",
      "which",
      "what",
      "who",
      "there",
      "side",
      "main",
      /* threshold and comparison words: they describe the request, never a record */
      "above",
      "below",
      "over",
      "under",
      "least",
      "most",
      "more",
      "less",
      "than",
      "greater",
      "higher",
      "lower",
      "between",
      /* Spanish */
      "los",
      "las",
      "el",
      "la",
      "un",
      "una",
      "unos",
      "unas",
      "de",
      "del",
      "en",
      "para",
      "con",
      "que",
      "se",
      "su",
      "sus",
      "es",
      "son",
      "hay",
      /* French */
      "les",
      "le",
      "la",
      "des",
      "du",
      "une",
      "aux",
      "dans",
      "sur",
      "pour",
      "avec",
      "est",
      "sont",
      "il",
      "y",
      "a",
      /* Spanish and French request words. They describe the question rather than a record, and without
         them a localized collection or ranking quietly filtered on them and matched nothing at all. */
      "dame",
      "quiero",
      "quiere",
      "quieres",
      "ver",
      "ensename",
      "tiene",
      "tienen",
      "puedo",
      "puedes",
      "puede",
      "como",
      "esta",
      "estan",
      "sabes",
      "necesito",
      "busco",
      "tengo",
      "hacer",
      "moi",
      "toi",
      "je",
      "tu",
      "on",
      "ce",
      "cette",
      "ces",
      "qui",
      "quoi",
      "comment",
      "veux",
      "veut",
      "voir",
      "donne",
      "peux",
      "peut",
      "puis",
      "sais",
      "cherche",
      "faire",
      "as",
      "ai",
      /* The elided fragments tokenize leaves behind ("d'attaque" -> "d", "y a t il" -> "t"). */
      "d",
      "t",
      /* What the French "trouve" canonicalises to, and it describes the request too. */
      "find"
    ])
  );
  const ITEM_WORDS = Object.freeze(new Set(["item", "equipment", "gear", "loot", "drop"]));

  function detectTarget(tokens) {
    /* "dungeon gear" is equipment; "all dungeons" is a place on the map. */
    if (tokens.includes("dungeon") && tokens.some((token) => ITEM_WORDS.has(token))) return TARGETS.ITEM;
    for (const entry of TARGET_CUES) {
      if (entry.cues.some((cue) => tokens.includes(cue))) return entry.target;
    }
    return null;
  }

  function detectCategory(tokens) {
    for (const [category, cues] of Object.entries(CATEGORY_CUES)) {
      if (cues.some((cue) => tokens.includes(cue))) return category;
    }
    return null;
  }

  /* The keyword a collection is filtered by: the words left once every cue and stop word is removed.
     "show me all occult gear" -> ["occult"]. A single letter is dropped as well - it is never a qualifier,
     it is the possessive left behind by "where's". */
  function detectTextFilter(tokens, cueWords) {
    return tokens.filter(
      (token) =>
        token.length > 1 &&
        !STOP_WORDS.has(token) &&
        !FILTER_STOP_WORDS.has(token) &&
        !cueWords.has(token) &&
        !/^\d+$/.test(token)
    );
  }

  /* A numeric threshold read from the question: min, max, or both ("level 10 to 20"). "above 4" and
     "below 10" are strict; "at least 4" and "at most 10" include the number. */
  function detectThreshold(normalized, numbers) {
    const above = THRESHOLD_ABOVE_PATTERN.test(normalized);
    const below = THRESHOLD_BELOW_PATTERN.test(normalized);
    const minStrict = THRESHOLD_ABOVE_STRICT_PATTERN.test(normalized);
    const maxStrict = THRESHOLD_BELOW_STRICT_PATTERN.test(normalized);
    if (!numbers.length) return { min: null, max: null, asked: false, minStrict: false, maxStrict: false };
    if (numbers.length >= 2 && !above && !below) {
      return { min: numbers[0], max: numbers[1], asked: true, minStrict: false, maxStrict: false };
    }
    if (above && !below) return { min: numbers[0], max: null, asked: true, minStrict, maxStrict: false };
    if (below && !above) return { min: null, max: numbers[0], asked: true, minStrict: false, maxStrict };
    return { min: null, max: null, asked: false, minStrict: false, maxStrict: false };
  }

  /* The direction a ranking asks for. "highest", "most" and "descending" mean the largest value first;
     "lowest", "least" and "ascending" mean the smallest first. Largest first is the default, which is what
     "which is the best" questions mean. A question that names both ends ("highest to lowest", "lowest to
     highest") is read from the first one, so the phrase the visitor wrote is the direction they get. */
  function rankingDirection(cues, tokens) {
    if ([...ASCENDING_CUES].some((cue) => cues.has(cue))) return "asc";
    if ([...DESCENDING_CUES].some((cue) => cues.has(cue))) return "desc";
    const named = [];
    toArray(tokens).forEach((token, index) => {
      if (HIGH_CUES.has(token)) named.push({ index, direction: "desc" });
      else if (LOW_CUES.has(token)) named.push({ index, direction: "asc" });
    });
    if (named.length) {
      named.sort((left, right) => left.index - right.index);
      return named[0].direction;
    }
    return "desc";
  }

  /* Words that can name a numeric field. They are cues rather than keyword filters, so "which weapon has
     the highest attack" does not turn "attack" into a name filter. */
  const STAT_WORD_CUES = Object.freeze(
    new Set([
      "attack",
      "damage",
      "defense",
      "health",
      "mana",
      "stamina",
      "speed",
      "critical",
      "crit",
      "chance",
      "cooldown",
      "healing",
      "dodge",
      "block",
      "regeneration",
      "steal",
      "quantity",
      "price",
      "value",
      "stat"
    ])
  );

  /* Turns a normalized question into a plan: what it is about, which filters and sort it asks for, and
     how many records it wants. The plan only describes the request - the handlers below decide what the
     data can actually support, and report everything it cannot. */
  function planQuestion(normalized, index) {
    const tokens = questionTokens(normalized);
    const cues = new Set(tokens);
    const numbers = numbersIn(normalized);
    const cueWords = new Set(
      [
        ...COLLECTIVE_CUES,
        ...RANKING_CUES,
        ...COMPARISON_CUES,
        ...FARMING_CUES,
        ...HIGH_CUES,
        ...LOW_CUES,
        ...ASCENDING_CUES,
        ...DESCENDING_CUES,
        ...TARGET_CUES.flatMap((entry) => entry.cues),
        ...Object.values(CATEGORY_CUES).flat(),
        ...STAT_WORD_CUES,
        "xp",
        "col",
        "level",
        /* The alias tables canonicalise "loot", "sueltan", "lachent" and "butin" to "drops", so the
           plural is a cue word too. Without it those words became a keyword filter and a collection of
           monsters that drop loot matched nothing, in every language. */
        "drops"
      ].filter(Boolean)
    );
    const plan = {
      kind: "single",
      target: null,
      tokens,
      filters: {
        questType: null,
        category: null,
        text: [],
        stats: [],
        level: { min: null, max: null, minStrict: false, maxStrict: false }
      },
      sort: null,
      limit: null,
      ambiguousStat: null,
      superlative: [...HIGH_CUES, ...LOW_CUES].some((cue) => cues.has(cue))
    };

    if (cues.has("compare") || cues.has("difference") || cues.has("versus") || /\bvs\b/.test(normalized)) {
      plan.kind = "comparison";
    } else if (cues.has("farm") || cues.has("grinding") || (cues.has("chance") && plan.superlative)) {
      plan.kind = "farming";
    }

    plan.target = detectTarget(tokens);
    if (cues.has("side")) plan.filters.questType = "side";
    else if (cues.has("main")) plan.filters.questType = "main";
    plan.filters.category = detectCategory(tokens);
    if (plan.filters.category === "dungeon" && plan.target !== TARGETS.ITEM) plan.filters.category = null;

    const threshold = detectThreshold(normalized, numbers);
    if (threshold.asked && cues.has("level")) {
      plan.filters.level = {
        min: threshold.min,
        max: threshold.max,
        minStrict: threshold.minStrict,
        maxStrict: threshold.maxStrict
      };
    } else if (threshold.asked) {
      const resolved = resolveStatKey(tokens, index.statKeys);
      if (resolved.key) {
        plan.filters.stats.push({
          key: resolved.key,
          min: threshold.min,
          max: threshold.max,
          minStrict: threshold.minStrict,
          maxStrict: threshold.maxStrict
        });
      } else if (resolved.candidates.length) {
        plan.ambiguousStat = { candidates: resolved.candidates };
      }
    }

    if (plan.kind === "single") {
      const rankingAsked = [...RANKING_CUES].some((cue) => cues.has(cue));
      const collective = [...COLLECTIVE_CUES].some((cue) => cues.has(cue));
      const filtered =
        plan.filters.stats.length > 0 || plan.filters.level.min !== null || plan.filters.level.max !== null;
      /* "defense at least 4" reads like a ranking because of "least", but a threshold with no sorting word
         is a filtered list. */
      const sortCue = cues.has("sort") || cues.has("order") || cues.has("rank");
      if (filtered && !sortCue) {
        plan.kind = "collection";
      } else if (rankingAsked) {
        const rankField = plan.target ? resolveRankField(plan.target, tokens, index) : null;
        if (rankField && rankField.field) {
          plan.kind = "ranking";
          plan.sort = { field: rankField.field, kind: rankField.kind, direction: rankingDirection(cues, tokens) };
          plan.limit = DEFAULT_RANKING_LIMIT;
        } else if (rankField && rankField.candidates.length) {
          plan.kind = "ranking";
          plan.ambiguousStat = { candidates: rankField.candidates };
        } else {
          /* Either the target has no sortable field at all, or the request names none: say so rather
             than ranking on something the datasets do not record. */
          plan.kind = "ranking-unsupported";
        }
      } else if (collective || filtered) {
        plan.kind = "collection";
      }
    }

    if (plan.kind === "collection" || plan.kind === "ranking") {
      plan.filters.text = detectTextFilter(tokens, cueWords);
    }

    /* A question that names a category and a qualifier but no collective word may still be about the whole
       set rather than one record: "where's the occult gear" is asking about the occult items, not about a
       record by that name. The plan stays a single lookup - a record that really carries the name must
       still win - and the resolver falls back to this set when no record does. The filter is worked out
       here, where the cue words are already to hand. A location question is left alone: "where is the
       occult camp" is a miss, not a list of every occult record. */
    if (plan.kind === "single" && plan.target && plan.target !== TARGETS.LOCATION) {
      /* The words that asked the question rather than named anything - "craft", "where", "get" - are left
         out, so the filter is the qualifier itself: "where can i craft the occult gear" filters to
         "occult". */
      const shapeWords = tokens.filter((token) => detectShape(token));
      plan.setFallback = { text: detectTextFilter(tokens, new Set([...cueWords, ...shapeWords])) };
    }
    return plan;
  }

  /* What kind of fact is being asked for, independent of which entity it is about. The list is
     ordered: the first matching rule wins, and the entity's own type refines the final intent. */
  const SHAPE_RULES = Object.freeze([
    {
      id: "help",
      /* A question about Argo herself only, not one that merely starts like it. "What do you know about
         the Corrupted Boar" and "help me find the Corrupted Boar" both name a record, so those phrases
         must not swallow the lookup: the phrase has to be the whole question to be a help request. The
         Spanish and French forms are anchored for the same reason - "¿Qué puedes hacer?" is a question
         about Argo, while "¿Qué puedes hacer con el Training Bow?" names a record. */
      patterns: [
        /\bwhat can you do\b/,
        /^what do you know(?: (?:about|of))?$/,
        /\bwhat can i ask\b/,
        /^help me$/,
        /^help$/,
        /^que (?:puedes|sabes|sabrias) hacer$/,
        /^(?:ayuda|ayudame)$/,
        /^que (?:peux|sais)(?: tu)? faire$/,
        /^(?:aide|aide moi)$/
      ]
    },
    {
      id: "dropSource",
      patterns: [
        /\b(which|what|who)\b[^?]*\b(mobs?|monsters?|enem(?:y|ies)|creatures?|bosses?|boss)\b[^?]*\b(drops?|dropping|have|has|give|gives)\b/,
        /\b(dropped by|drops from|drop from|comes from|come from|coming from|sourced from|obtained from)\b/,
        /\bwho\s+drops\b/
      ]
    },
    { id: "mobDrops", patterns: [/\b(drops?|loot|drop list|loot table)\b/] },
    {
      id: "recipe",
      /* The craft verbs a visitor actually uses. "make" and "build" are common enough to be worth
         recognising, and they are safe here because a drop question ("what makes X drop Y") is matched by
         the dropSource rule above before this one is ever reached. */
      patterns: [
        /\b(craft|crafts|crafting|recipe|recipes|ingredients?|materials?|requires?|requirements?|make|makes|making|made|build|builds|building|built)\b/
      ]
    },
    {
      id: "stats",
      patterns: [/\b(stats?|statistics?|bonuses?|effects?|damage|defen[cs]e|how much|what does .* do)\b/]
    },
    { id: "quest", patterns: [/\b(quest|quests|questline|objective|objectives|rewards?|xp|col)\b/] },
    {
      id: "location",
      patterns: [/\b(where|location|located|find|spawn|spawns|sell|sells|sold|buy|bought|obtain|obtained|get it)\b/]
    },
    { id: "identity", patterns: [/\b(who|what)\b/] }
  ]);

  function detectShape(normalizedQuestion) {
    for (const rule of SHAPE_RULES) {
      for (const pattern of rule.patterns) {
        if (pattern.test(normalizedQuestion)) return rule.id;
      }
    }
    return null;
  }

  /* When a name is shared by entities of different kinds, the question shape decides which is meant. */
  function preferredTypes(shapeId) {
    switch (shapeId) {
      case "recipe":
      case "stats":
      case "dropSource":
        return [ENTITY_TYPES.ITEM];
      case "mobDrops":
        return [ENTITY_TYPES.MOB, ENTITY_TYPES.BOSS];
      case "quest":
        return [ENTITY_TYPES.QUEST];
      case "location":
        return [ENTITY_TYPES.MERCHANT, ENTITY_TYPES.LOCATION, ENTITY_TYPES.DUNGEON, ENTITY_TYPES.NPC];
      default:
        return [];
    }
  }

  function pickCandidate(shapeId, results) {
    if (!results.length) return { entity: null, candidates: [] };
    const top = results[0];
    /* An exact hit is a specificity contest: only names of the same length are true ties (which is how
       "the secret sticky ring merchant" beats the shorter "sticky ring" inside it). Partial hits are
       equally speculative, so every result at the top score stays a tie and is offered as a choice. */
    const isExact = top.score >= 1;
    const topLength = normalizeQuestion(top.matchedName || top.entity.name).length;
    const tied = results.filter((result) => {
      if (result.score !== top.score) return false;
      if (!isExact) return true;
      return normalizeQuestion(result.matchedName || result.entity.name).length === topLength;
    });
    const distinctNames = new Set(tied.map((result) => normalizeQuestion(result.matchedName || result.entity.name)));
    /* Different entities matched equally well by different names: never guess. */
    if (distinctNames.size > 1) return { entity: null, candidates: tied };
    if (tied.length === 1) return { entity: tied[0].entity, candidates: [] };
    const preferred = preferredTypes(shapeId);
    const preferredMatch = tied.find((result) => preferred.includes(result.entity.type));
    if (preferredMatch) return { entity: preferredMatch.entity, candidates: [] };
    return { entity: null, candidates: tied };
  }

  /* Shape + entity type -> the answer intent the caller should word a reply for. */
  function resolveIntent(shapeId, entityType) {
    const isMob = entityType === ENTITY_TYPES.MOB || entityType === ENTITY_TYPES.BOSS;
    const isItem = entityType === ENTITY_TYPES.ITEM;
    switch (shapeId) {
      case "help":
        return INTENTS.HELP;
      case "dropSource":
      case "mobDrops":
        return isMob ? INTENTS.MOB_DROPS : INTENTS.DROP;
      case "recipe":
        return isItem ? INTENTS.RECIPE : INTENTS.ITEM;
      case "stats":
        if (isItem) return INTENTS.ITEM;
        return isMob ? INTENTS.MOB : INTENTS.LOCATION;
      case "quest":
        return entityType === ENTITY_TYPES.QUEST ? INTENTS.QUEST : INTENTS.LOCATION;
      case "location":
      case "identity":
      default:
        if (isMob) return INTENTS.MOB;
        if (isItem) return INTENTS.ITEM;
        if (entityType === ENTITY_TYPES.QUEST) return INTENTS.QUEST;
        if (entityType === ENTITY_TYPES.MERCHANT || entityType === ENTITY_TYPES.NPC) return INTENTS.NPC;
        return INTENTS.LOCATION;
    }
  }
  /* --- Facts ---------------------------------------------------------------- */

  function hasRecord(entity) {
    return Boolean(
      entity.bestiary ||
      entity.equipment ||
      entity.markers.length ||
      entity.quests.length ||
      entity.areas.length ||
      entity.npcEntries.length ||
      entity.compendium.length
    );
  }

  function entitySummary(entity) {
    return {
      id: entity.id,
      type: entity.type,
      name: entity.name,
      slug: entity.slug,
      contentKey: entity.contentKeys.length ? entity.contentKeys[0] : null,
      recordPresent: hasRecord(entity)
    };
  }

  function markerSummary(marker) {
    return {
      id: marker.id,
      title: marker.title,
      markerType: marker.type,
      category: marker.category,
      floor: marker.floor,
      coords: marker.coords,
      description: marker.description,
      dataset: marker.dataset
    };
  }

  function questSummary(quest) {
    return {
      id: quest.id,
      questName: quest.questName,
      questType: quest.questType,
      questNumber: quest.questNumber,
      npcName: quest.npcName,
      city: quest.city,
      coordinates: quest.coordinates,
      requirements: quest.requirements,
      xpReward: quest.xpReward,
      colReward: quest.colReward,
      bonusItems: quest.bonusItems,
      markerCoords: quest.markerCoords,
      world: quest.world,
      island: quest.island,
      floor: quest.floor,
      dataset: quest.dataset
    };
  }

  function areaSummary(area) {
    return {
      id: area.id,
      title: area.title,
      floor: area.floor,
      underground: area.underground,
      corners: area.corners,
      dataset: area.dataset
    };
  }

  /* The equipment record behind a name, when the active floor has one. */
  function itemRecordFor(index, name) {
    const matches = index.byNormalizedName.get(normalizeQuestion(name));
    if (!matches) return null;
    for (const entity of matches) {
      if (entity.equipment) return entity.equipment;
    }
    return null;
  }

  /* Exact-title marker lookup. It is used only to turn a documented craftingLocation string into a map
     location when the map data happens to be loaded; no fuzzy matching, so a wrong merchant is never
     invented. */
  function markerForTitle(index, title) {
    const matches = index.byNormalizedName.get(normalizeQuestion(title));
    if (!matches) return null;
    for (const entity of matches) {
      if (entity.markers.length) return markerSummary(entity.markers[0]);
    }
    return null;
  }

  /* Every mob entity whose spawn-area rows list this area (the reverse of the area -> mob table). */
  function mobsInArea(index, areaId) {
    const output = [];
    for (const entity of index.entities) {
      for (const area of entity.spawnAreas) {
        if (area.areaId !== areaId) continue;
        output.push({ mob: entity.name, mobId: entity.id, bestiaryTab: area.category, listedAs: area.listedAs });
      }
    }
    return output;
  }
  function buildItemFacts(entity, index) {
    const notes = [];
    const equipment = entity.equipment;
    const facts = { name: entity.name, record: null, droppedBy: [], craftingLocationMarker: null };
    if (!equipment) {
      notes.push("item-record-missing");
    } else {
      facts.record = {
        category: equipment.category,
        level: equipment.level,
        rarity: equipment.rarity,
        description: equipment.description,
        set: equipment.set,
        stats: equipment.stats,
        craftingResources: equipment.craftingResources,
        craftingLocation: equipment.craftingLocation,
        floor: equipment.floor,
        dataset: equipment.dataset
      };
      if (!equipment.craftingLocation) notes.push("crafting-location-absent");
      if (!equipment.craftingResources.length) notes.push("crafting-resources-absent");
      if (!Object.keys(equipment.stats).length) notes.push("stats-absent");
      facts.craftingLocationMarker = equipment.craftingLocation
        ? markerForTitle(index, equipment.craftingLocation)
        : null;
      if (equipment.craftingLocation && !facts.craftingLocationMarker) notes.push("merchant-marker-not-found");
    }
    /* Documented drop origins only - a drop relationship is never turned into a recipe. */
    facts.droppedBy = entity.dropRows.map((row) => ({
      mob: row.mobName,
      mobId: row.mobId,
      bestiaryTab: row.tab,
      chance: row.chance,
      notes: row.notesText || null,
      floor: row.floor,
      dataset: row.dataset
    }));
    if (facts.droppedBy.length) notes.push("origins-listed-in-bestiary");
    if (entity.compendium.length) facts.compendium = entity.compendium;
    if (entity.markers.length) facts.markers = entity.markers.map(markerSummary);
    return { facts, notes };
  }

  function buildMobFacts(entity, index) {
    const notes = [];
    const facts = { name: entity.name, bestiary: null, drops: [], spawnAreas: [], markers: [], quests: [] };
    if (entity.bestiary) {
      facts.bestiary = {
        tab: entity.bestiary.tab,
        xp: entity.bestiary.xp,
        floor: entity.bestiary.floor,
        dataset: entity.bestiary.dataset
      };
      facts.drops = entity.bestiary.drops.map((drop) => ({
        item: drop.item,
        itemId: drop.itemId,
        chance: drop.chance,
        notes: drop.notesText || null,
        recordPresent: Boolean(itemRecordFor(index, drop.item))
      }));
      if (facts.drops.some((drop) => drop.chance === null)) notes.push("chance-not-recorded");
    } else {
      notes.push("bestiary-record-missing");
    }
    if (entity.spawnAreas.length) {
      facts.spawnAreas = entity.spawnAreas.map((area) => ({
        areaId: area.areaId,
        area: area.areaTitle,
        floor: area.floor,
        underground: area.underground,
        bestiaryTab: area.category,
        listedAs: area.listedAs,
        dataset: area.dataset
      }));
      /* A spawn area documents where a mob lives, not what it drops. */
      notes.push("spawn-area-is-not-a-drop");
    } else if (index.availability.mobAreas) {
      notes.push("no-spawn-area-recorded");
    }
    facts.markers = entity.markers.map(markerSummary);
    facts.quests = entity.quests.map(questSummary);
    return { facts, notes };
  }
  /* One Bestiary drop row as structured data. recordPresent says whether an equipment record exists for
     the dropped item - it is never a claim about the game, only about the dataset. */
  function dropSummary(drop, index) {
    return {
      item: drop.item,
      itemId: drop.itemId,
      chance: drop.chance,
      notes: drop.notesText || null,
      recordPresent: Boolean(itemRecordFor(index, drop.item))
    };
  }

  function buildDropFacts(entity, index) {
    const notes = [];
    const facts = {
      item: entity.name,
      itemRecordPresent: Boolean(entity.equipment),
      droppedBy: entity.dropRows.map((row) => {
        const mobEntity = index.byId.get(row.mobId);
        return {
          mob: row.mobName,
          mobId: row.mobId,
          bestiaryTab: row.tab,
          chance: row.chance,
          notes: row.notesText || null,
          floor: row.floor,
          dataset: row.dataset,
          mobRecordPresent: Boolean(mobEntity && mobEntity.bestiary)
        };
      })
    };
    if (!facts.droppedBy.length) notes.push("no-drop-record");
    if (!entity.equipment) notes.push("item-record-missing");
    if (facts.droppedBy.some((row) => row.chance === null)) notes.push("chance-not-recorded");
    return { facts, notes };
  }

  function buildMobDropFacts(entity, index) {
    const notes = [];
    const facts = { mob: entity.name, bestiaryTab: null, xp: null, drops: [] };
    if (!entity.bestiary) {
      notes.push("bestiary-record-missing");
      return { facts, notes };
    }
    facts.bestiaryTab = entity.bestiary.tab;
    facts.xp = entity.bestiary.xp;
    facts.drops = entity.bestiary.drops.map((drop) => dropSummary(drop, index));
    if (!facts.drops.length) notes.push("no-drop-record");
    if (facts.drops.some((drop) => drop.chance === null)) notes.push("chance-not-recorded");
    return { facts, notes };
  }

  /* A recipe is only ever the documented craftingResources/craftingLocation of an item record. It is
     never derived from a drop relationship. */
  function buildRecipeFacts(entity, index) {
    const notes = [];
    const equipment = entity.equipment;
    const facts = {
      item: entity.name,
      recordPresent: Boolean(equipment),
      craftingResources: [],
      craftingLocation: null,
      craftingLocationMarker: null
    };
    if (!equipment) {
      notes.push("item-record-missing");
      return { facts, notes };
    }
    facts.craftingResources = equipment.craftingResources;
    facts.craftingLocation = equipment.craftingLocation;
    facts.craftingLocationMarker = equipment.craftingLocation
      ? markerForTitle(index, equipment.craftingLocation)
      : null;
    if (!equipment.craftingResources.length) notes.push("crafting-resources-absent");
    if (!equipment.craftingLocation) notes.push("crafting-location-absent");
    if (equipment.craftingLocation && !facts.craftingLocationMarker) notes.push("merchant-marker-not-found");
    return { facts, notes };
  }

  function buildNpcFacts(entity, index) {
    const notes = [];
    const facts = {
      name: entity.name,
      markers: entity.markers.map(markerSummary),
      requests: [],
      appearsIn: [],
      sells: []
    };
    facts.requests = entity.npcEntries.filter((entry) => entry.kind === "request").map(questSummary);
    facts.appearsIn = entity.npcEntries.filter((entry) => entry.kind === "questNpc").map(questSummary);
    /* Items whose documented craftingLocation names one of this entity's markers. */
    for (const marker of entity.markers) {
      const wanted = normalizeQuestion(marker.title);
      for (const other of index.entities) {
        if (!other.equipment || !other.equipment.craftingLocation) continue;
        if (normalizeQuestion(other.equipment.craftingLocation) !== wanted) continue;
        facts.sells.push({ item: other.name, itemId: other.id, category: other.equipment.category });
      }
    }
    if (!facts.markers.length && !facts.requests.length && !facts.appearsIn.length) notes.push("npc-record-missing");
    if (!facts.sells.length) notes.push("no-documented-services");
    return { facts, notes };
  }

  function buildLocationFacts(entity, index) {
    const notes = [];
    const facts = {
      name: entity.name,
      markers: entity.markers.map(markerSummary),
      areas: entity.areas.map(areaSummary),
      mobs: []
    };
    for (const area of entity.areas) {
      facts.mobs.push(...mobsInArea(index, area.id));
    }
    if (!facts.markers.length && !facts.areas.length) notes.push("location-record-missing");
    if (entity.areas.length) notes.push("area-mobs-are-spawn-areas");
    return { facts, notes };
  }

  function buildQuestFacts(entity, index, scope) {
    const notes = [];
    const facts = {
      name: entity.name,
      quests: entity.quests.map(questSummary),
      markers: entity.markers.map(markerSummary)
    };
    if (!entity.quests.length && entity.markers.length) notes.push("quest-entry-missing");
    if (!entity.quests.length && !entity.markers.length) notes.push("quest-record-missing");
    /* The Underworld questline spans islands: entries belonging to another island are reported with
       their island rather than hidden. */
    if (scope.world === "underworld") {
      const islands = uniqueStrings(facts.quests.map((quest) => quest.island));
      if (islands.length) facts.islands = islands;
      if (islands.some((island) => island !== scope.floor)) notes.push("quest-spans-islands");
    }
    return { facts, notes };
  }

  function buildHelpFacts(index, scope) {
    return {
      facts: {
        intents: Object.values(INTENTS).filter((intent) => intent !== INTENTS.UNKNOWN),
        entityTypes: Object.values(ENTITY_TYPES),
        world: scope.world,
        dataset: scope.dataset,
        floor: scope.floor
      },
      notes: []
    };
  }
  /* --- Collections, rankings, comparisons and farming (Stage 5) -------------- */

  /* One record as a caller sees it. Only fields the dataset actually has are copied, so a collection can
     never show a value that was not in the data. */
  function collectionRecord(entity) {
    const record = { id: entity.id, name: entity.name, type: entity.type, source: "records" };
    if (entity.equipment) {
      record.source = "equipment";
      record.category = entity.equipment.category;
      record.level = entity.equipment.level;
      record.stats = Object.assign({}, entity.equipment.stats);
      record.craftingLocation = entity.equipment.craftingLocation;
    }
    if (entity.quests.length) {
      const quest = entity.quests[0];
      record.source = "quest";
      record.questType = quest.questType;
      record.questNumber = quest.questNumber;
      record.npcName = quest.npcName;
      record.island = quest.island || null;
      record.xpReward = numericValue(quest.xpReward);
      record.colReward = numericValue(quest.colReward);
      record.coordinates = quest.coordinates;
    }
    if (entity.bestiary) {
      record.source = "bestiary";
      record.bestiaryTab = entity.bestiary.tab;
      record.xp = numericValue(entity.bestiary.xp);
      record.dropCount = entity.bestiary.drops.length;
    }
    if (entity.markers.length) {
      record.markerCount = entity.markers.length;
      record.markerType = entity.markers[0].type;
      record.coords = entity.markers[0].coords;
      record.floor = entity.markers[0].floor;
      if (record.source === "records") record.source = "map";
    }
    if (entity.areas.length) {
      record.areaCount = entity.areas.length;
      record.floor = entity.areas[0].floor;
    }
    if (entity.compendium.length) {
      record.category = entity.compendium[0].category;
      record.stats = Object.assign({}, entity.compendium[0].stats);
      record.source = "compendium";
    }
    return record;
  }

  /* Which entities a target covers. Every rule reads a field the ingest functions actually fill. */
  function matchesTarget(entity, target) {
    switch (target) {
      case TARGETS.QUEST:
        return entity.quests.length > 0;
      case TARGETS.BOSS:
        return Boolean(
          (entity.bestiary && (entity.bestiary.tab === "boss" || entity.bestiary.tab === "dungeonBoss")) ||
          entity.markers.some((marker) => textOf(marker.type).trim().toLowerCase() === "boss")
        );
      case TARGETS.MOB:
        return Boolean(entity.bestiary);
      case TARGETS.NPC:
        return (
          entity.type === ENTITY_TYPES.NPC || entity.type === ENTITY_TYPES.MERCHANT || entity.npcEntries.length > 0
        );
      case TARGETS.DUNGEON:
        return entity.markers.some(
          (marker) => textOf(marker.category) === "dungeons" || textOf(marker.type).trim().toLowerCase() === "dungeon"
        );
      case TARGETS.AREA:
        return (
          entity.areas.length > 0 ||
          entity.markers.some((marker) => ["biomes", "farmingSpots"].includes(textOf(marker.category)))
        );
      case TARGETS.LOCATION:
        return entity.markers.length > 0 || entity.areas.length > 0;
      case TARGETS.ITEM:
        return Boolean(entity.equipment) || entity.dropRows.length > 0 || entity.compendium.length > 0;
      default:
        return false;
    }
  }

  function nonEmpty(value) {
    if (Array.isArray(value)) return value.length > 0;
    return Boolean(value);
  }

  /* Applies the plan's filters. Each filter reads a field the record really has; a record that lacks the
     field never matches a filter that asks about it. */
  function recordMatchesFilters(record, filters) {
    if (filters.questType && record.questType !== filters.questType) return false;
    if (filters.category && textOf(record.category) !== filters.category) return false;
    if (filters.text.length) {
      const haystack = normalizeQuestion([record.name, record.craftingLocation].filter(Boolean).join(" "));
      if (!filters.text.every((word) => haystack.includes(word))) return false;
    }
    if (filters.level.min !== null || filters.level.max !== null) {
      if (!Number.isFinite(record.level)) return false;
      if (
        filters.level.min !== null &&
        (filters.level.minStrict ? record.level <= filters.level.min : record.level < filters.level.min)
      ) {
        return false;
      }
      if (
        filters.level.max !== null &&
        (filters.level.maxStrict ? record.level >= filters.level.max : record.level > filters.level.max)
      ) {
        return false;
      }
    }
    for (const filter of filters.stats) {
      const value = numericValue((record.stats || {})[filter.key]);
      if (value === null) return false;
      if (filter.min !== null && (filter.minStrict ? value <= filter.min : value < filter.min)) return false;
      if (filter.max !== null && (filter.maxStrict ? value >= filter.max : value > filter.max)) return false;
    }
    return true;
  }

  function recordsForPlan(index, plan, scope) {
    const records = [];
    for (const entity of index.entities) {
      if (!matchesTarget(entity, plan.target)) continue;
      const record = collectionRecord(entity);
      if (!recordInScope(record, scope)) continue;
      if (!recordMatchesFilters(record, plan.filters)) continue;
      records.push(record);
    }
    return records;
  }

  /* A collection never mixes worlds or islands. On the Underworld, a record that belongs to another
     island is out of scope; a record with no recorded island is kept, because nothing is known about it. */
  function recordInScope(record, scope) {
    if (scope.world !== "underworld") return true;
    const island = textOf(record.island).trim();
    return !island || island === scope.floor;
  }

  /* Records the same question would find on the other Aincrad floors. They are counted, never merged:
     the visitor is told they exist, and only the active floor's records are listed. */
  function otherFloorCounts(scope, plan) {
    if (scope.world !== "aincrad") return [];
    const counts = [];
    for (const floor of FLOORS) {
      if (floor === scope.floor) continue;
      const otherScope = Object.assign({}, scope, { floor });
      const count = recordsForPlan(getIndex(otherScope), plan, otherScope).length;
      if (count) counts.push({ floor, count });
    }
    return counts;
  }

  function planScopeSummary(scope) {
    return { world: scope.world, floor: scope.floor, dataset: scope.dataset };
  }

  /* Every match on the active floor, in a stable order. Nothing is dropped silently: `total` is the
     number of matches and `truncated` says whether the safety cap cut the list short. */
  function buildCollectionFacts(index, plan, scope) {
    const notes = [];
    const matched = recordsForPlan(index, plan, scope);
    matched.sort((left, right) => left.name.localeCompare(right.name));
    const records = matched.slice(0, MAX_COLLECTION_RECORDS);
    const facts = {
      target: plan.target,
      total: matched.length,
      shown: records.length,
      truncated: matched.length > records.length,
      filters: {
        questType: plan.filters.questType,
        category: plan.filters.category,
        text: plan.filters.text.slice(),
        stats: plan.filters.stats.map((filter) => Object.assign({}, filter)),
        level: Object.assign({}, plan.filters.level)
      },
      records,
      otherFloors: otherFloorCounts(scope, plan),
      scope: planScopeSummary(scope)
    };
    if (!matched.length) notes.push("no-collection-match");
    if (facts.truncated) notes.push("collection-truncated");
    if (facts.otherFloors.length) notes.push("other-floor-records-exist");
    return { facts, notes };
  }

  /* The value a record exposes for a ranking field. A field the record does not have is unknown, and an
     unknown value is never read as zero. */
  function rankingValue(record, field) {
    if (field === "level") return Number.isFinite(record.level) ? record.level : null;
    if (field === "xpReward") return Number.isFinite(record.xpReward) ? record.xpReward : null;
    if (field === "colReward") return Number.isFinite(record.colReward) ? record.colReward : null;
    if (field === "xp") return Number.isFinite(record.xp) ? record.xp : null;
    return numericValue((record.stats || {})[field]);
  }

  /* A ranking lists the records that have a recorded value for the field, highest or lowest first, and
     reports the records that do not separately - so a missing value can never look like a low one. */
  function buildRankingFacts(index, plan, scope) {
    const notes = [];
    const field = plan.sort.field;
    const known = [];
    const unknown = [];
    for (const entity of index.entities) {
      if (!matchesTarget(entity, plan.target)) continue;
      const record = collectionRecord(entity);
      if (!recordInScope(record, scope)) continue;
      if (!recordMatchesFilters(record, plan.filters)) continue;
      const value = rankingValue(record, field);
      if (value === null) unknown.push(record.name);
      else known.push(Object.assign({ value }, record));
    }
    const direction = plan.sort.direction === "asc" ? 1 : -1;
    known.sort((left, right) =>
      left.value === right.value ? left.name.localeCompare(right.name) : (left.value - right.value) * direction
    );
    unknown.sort((left, right) => left.localeCompare(right));
    const facts = {
      target: plan.target,
      field,
      fieldKind: plan.sort.kind,
      direction: plan.sort.direction,
      superlative: plan.superlative,
      total: known.length + unknown.length,
      rankedCount: known.length,
      unknownCount: unknown.length,
      unknownNames: unknown.slice(0, 8),
      ranked: known.slice(0, plan.limit).map((record) => ({
        id: record.id,
        name: record.name,
        type: record.type,
        value: record.value,
        category: record.category || null,
        questType: record.questType || null,
        bestiaryTab: record.bestiaryTab || null
      })),
      best: known.length ? { id: known[0].id, name: known[0].name, value: known[0].value } : null,
      worst: known.length
        ? { id: known[known.length - 1].id, name: known[known.length - 1].name, value: known[known.length - 1].value }
        : null,
      tiedAtTop: known.filter((record) => record.value === known[0].value).length > 1,
      filters: {
        questType: plan.filters.questType,
        category: plan.filters.category,
        text: plan.filters.text.slice()
      },
      otherFloors: otherFloorCounts(scope, plan),
      scope: planScopeSummary(scope)
    };
    if (!known.length) notes.push("no-ranked-values");
    if (unknown.length) notes.push("ranking-has-unknown-values");
    if (facts.otherFloors.length) notes.push("other-floor-records-exist");
    return { facts, notes };
  }

  /* The words that join two names in a comparison question. */
  /* The words that join two names in a comparison question, in every supported language. The Spanish
     "y"/"e"/"con" and the French "et"/"avec" are the equivalents of "and"/"with", so a comparison asked
     in either language splits into the same parts an English one does. This pattern is only ever used
     for a comparison question, so the short connectors cannot affect any other query. */
  const COMPARISON_SPLIT_PATTERN =
    /\b(?:and|vs|versus|or|compare|compared|between|difference|than|against|to|y|e|con|et|avec)\b/;

  /* The records a comparison names. Each part of the question is matched exactly like a single question,
     and only a part with real content counts - so "what is the difference between" contributes nothing
     while "training bow" does. */
  function comparisonTargets(index, normalized) {
    const parts = textOf(normalized)
      .split(COMPARISON_SPLIT_PATTERN)
      .map((part) => part.trim())
      .filter(Boolean);
    const entities = [];
    const unresolved = [];
    for (const part of parts) {
      if (!phraseTokens(normalizeQuestion(part)).length) continue;
      const matches = findEntities(index, part);
      const exact = matches.find((match) => match.score >= 1);
      const pick = exact || matches[0];
      if (!pick) {
        unresolved.push(part);
        continue;
      }
      if (!entities.includes(pick.entity) && entities.length < MAX_COMPARISON_ENTITIES) entities.push(pick.entity);
    }
    return { entities, unresolved };
  }

  /* Field-by-field rows for the named records. A field appears only when at least one of them has it, and
     a record without it shows as unknown rather than as an empty or zero value. */
  function buildComparisonFacts(entities) {
    const valuesOf = (reader) => entities.map((entity) => reader(entity));
    const statsOf = (entity) =>
      (entity.equipment && entity.equipment.stats) || (entity.compendium[0] && entity.compendium[0].stats) || {};
    const rows = [];
    const push = (key, kind, values) => rows.push({ key, kind, values });
    push(
      "type",
      "entityType",
      valuesOf((entity) => entity.type)
    );
    if (entities.some((entity) => entity.equipment || entity.compendium.length)) {
      push(
        "category",
        "category",
        valuesOf(
          (entity) =>
            (entity.equipment && entity.equipment.category) ||
            (entity.compendium[0] && entity.compendium[0].category) ||
            null
        )
      );
    }
    if (entities.some((entity) => entity.equipment)) {
      push(
        "level",
        "number",
        valuesOf((entity) => (entity.equipment ? entity.equipment.level : null))
      );
    }
    if (entities.some((entity) => entity.quests.length)) {
      push(
        "questType",
        "questType",
        valuesOf((entity) => (entity.quests[0] ? entity.quests[0].questType : null))
      );
      push(
        "npcName",
        "text",
        valuesOf((entity) => (entity.quests[0] ? entity.quests[0].npcName : null))
      );
      push(
        "xpReward",
        "number",
        valuesOf((entity) => numericValue(entity.quests[0] && entity.quests[0].xpReward))
      );
      push(
        "colReward",
        "number",
        valuesOf((entity) => numericValue(entity.quests[0] && entity.quests[0].colReward))
      );
    }
    if (entities.some((entity) => entity.bestiary)) {
      push(
        "bestiaryTab",
        "bestiaryTab",
        valuesOf((entity) => (entity.bestiary ? entity.bestiary.tab : null))
      );
      push(
        "xp",
        "number",
        valuesOf((entity) => numericValue(entity.bestiary && entity.bestiary.xp))
      );
    }
    if (entities.some((entity) => entity.equipment && entity.equipment.craftingLocation)) {
      push(
        "craftingLocation",
        "text",
        valuesOf((entity) => (entity.equipment ? entity.equipment.craftingLocation : null))
      );
    }
    const statKeys = [];
    for (const entity of entities) {
      for (const key of Object.keys(statsOf(entity))) if (!statKeys.includes(key)) statKeys.push(key);
    }
    statKeys.sort((left, right) => left.localeCompare(right));
    for (const key of statKeys) {
      push(
        key,
        "stat",
        valuesOf((entity) => {
          const value = statsOf(entity)[key];
          return value === undefined ? null : value;
        })
      );
    }
    const unknownCounts = entities.map(() => 0);
    for (const row of rows) {
      row.values.forEach((value, index) => {
        if (value === null || value === undefined || value === "") unknownCounts[index] += 1;
      });
    }
    return {
      facts: {
        entities: entities.map((entity) => ({
          id: entity.id,
          name: entity.name,
          type: entity.type,
          recordPresent: Boolean(entity.equipment || entity.bestiary || entity.quests.length || entity.markers.length)
        })),
        rows: rows.slice(0, MAX_COMPARISON_ROWS),
        rowCount: rows.length,
        truncated: rows.length > MAX_COMPARISON_ROWS,
        unknownCounts
      },
      notes: rows.length > MAX_COMPARISON_ROWS ? ["comparison-truncated"] : []
    };
  }

  /* Farming: every documented source of an item, best documented rate first. A rate the Bestiary does not
     record stays unknown, and no rate is ever invented or guessed. */
  function buildFarmingFacts(entity, index) {
    const notes = [];
    const sources = entity.dropRows.map((row) => {
      const mobEntity = index.byId.get(row.mobId);
      return {
        mob: row.mobName,
        mobId: row.mobId,
        bestiaryTab: row.tab,
        chance: row.chance,
        notes: row.notesText || null,
        floor: row.floor,
        spawnAreas: mobEntity
          ? mobEntity.spawnAreas.slice(0, 3).map((area) => ({
              area: area.areaTitle,
              floor: area.floor,
              underground: area.underground
            }))
          : []
      };
    });
    sources.sort((left, right) => {
      if (left.chance === null && right.chance === null) return left.mob.localeCompare(right.mob);
      if (left.chance === null) return 1;
      if (right.chance === null) return -1;
      return right.chance - left.chance;
    });
    const rated = sources.filter((source) => source.chance !== null);
    const facts = {
      item: entity.name,
      itemId: entity.id,
      itemRecordPresent: Boolean(entity.equipment),
      sources,
      sourceCount: sources.length,
      ratedCount: rated.length,
      unratedCount: sources.length - rated.length,
      best: rated.length
        ? { mob: rated[0].mob, mobId: rated[0].mobId, chance: rated[0].chance, bestiaryTab: rated[0].bestiaryTab }
        : null,
      tiedAtBest: rated.filter((source) => source.chance === rated[0].chance).length > 1,
      dropFloors: uniqueStrings(sources.map((source) => source.floor))
    };
    if (!sources.length) notes.push("no-drop-record");
    if (facts.unratedCount) notes.push("chance-not-recorded");
    if (sources.length && !facts.best) notes.push("no-recorded-drop-rate");
    if (!entity.equipment) notes.push("item-record-missing");
    return { facts, notes };
  }

  /* Runs a planned question that is not about one entity: collections, rankings and comparisons. Returns
     null when the plan still needs an entity (farming, or a plain single question). */
  function answerPlannedQuestion(plan, index, scope, result) {
    if (
      plan.kind !== "collection" &&
      plan.kind !== "ranking" &&
      plan.kind !== "comparison" &&
      plan.kind !== "ranking-unsupported"
    ) {
      return null;
    }
    if (plan.kind === "ranking-unsupported") {
      result.unsupportedReason = "no-sortable-field";
      result.dataQuality.notes.push("no-sortable-field");
      return result;
    }
    if (plan.ambiguousStat) {
      result.status = STATUS.AMBIGUOUS;
      result.clarification = {
        reason: "ambiguous-stat-field",
        options: plan.ambiguousStat.candidates.map((key) => ({ id: null, type: null, name: key }))
      };
      result.candidates = plan.ambiguousStat.candidates.map((key) => ({
        id: null,
        type: null,
        name: key,
        matchedName: key
      }));
      result.confidence = confidenceFor(1, "ambiguous");
      result.dataQuality.notes.push("ambiguous-stat-field");
      return result;
    }
    if (!plan.target && (plan.kind === "collection" || plan.kind === "ranking")) {
      result.unsupportedReason = "no-collection-target";
      result.dataQuality.notes.push("no-collection-target");
      return result;
    }
    if (plan.kind === "collection") {
      const built = buildCollectionFacts(index, plan, scope);
      result.intent = INTENTS.COLLECTION;
      result.facts = built.facts;
      result.status = decideStatus(INTENTS.COLLECTION, built.facts, result.shape);
      result.dataQuality = { complete: built.notes.length === 0, notes: built.notes };
      result.confidence = confidenceFor(1, "collection");
      return result;
    }
    if (plan.kind === "ranking") {
      const built = buildRankingFacts(index, plan, scope);
      result.intent = INTENTS.RANKING;
      result.facts = built.facts;
      result.status = decideStatus(INTENTS.RANKING, built.facts, result.shape);
      result.dataQuality = { complete: built.notes.length === 0, notes: built.notes };
      result.confidence = confidenceFor(1, "ranking");
      return result;
    }
    if (plan.kind === "comparison") {
      const targets = comparisonTargets(index, result.normalizedQuestion);
      if (targets.entities.length < 2) {
        /* Nothing safe to compare: ask which records were meant instead of guessing. */
        result.status = STATUS.AMBIGUOUS;
        result.intent = INTENTS.COMPARISON;
        result.candidates = targets.entities.map((entity) => entitySummary(entity));
        result.clarification = {
          reason: "comparison-needs-names",
          options: targets.entities.map((entity) => ({ id: entity.id, type: entity.type, name: entity.name }))
        };
        result.confidence = confidenceFor(0, "ambiguous");
        result.dataQuality.notes.push("comparison-needs-names");
        return result;
      }
      const built = buildComparisonFacts(targets.entities);
      result.intent = INTENTS.COMPARISON;
      result.facts = built.facts;
      result.status = STATUS.ANSWER;
      result.dataQuality = { complete: built.notes.length === 0, notes: built.notes };
      result.confidence = confidenceFor(1, "comparison");
      return result;
    }
    return null;
  }

  /* --- Status and dispatch -------------------------------------------------- */

  function buildFactsFor(intent, entity, index, scope) {
    switch (intent) {
      case INTENTS.RECIPE:
        return buildRecipeFacts(entity, index);
      case INTENTS.DROP:
        return buildDropFacts(entity, index);
      case INTENTS.MOB_DROPS:
        return buildMobDropFacts(entity, index);
      case INTENTS.FARMING:
        return buildFarmingFacts(entity, index);
      case INTENTS.MOB:
        return buildMobFacts(entity, index);
      case INTENTS.NPC:
        return buildNpcFacts(entity, index);
      case INTENTS.QUEST:
        return buildQuestFacts(entity, index, scope);
      case INTENTS.LOCATION:
        return buildLocationFacts(entity, index);
      case INTENTS.HELP:
        return buildHelpFacts(index, scope);
      case INTENTS.ITEM:
      default:
        return buildItemFacts(entity, index);
    }
  }

  /* A result is only an answer when the requested fact actually exists in the data. Everything else is
     reported as missing, never filled in. */
  function decideStatus(intent, facts, shape) {
    switch (intent) {
      case INTENTS.HELP:
        return STATUS.ANSWER;
      case INTENTS.COLLECTION:
        return nonEmpty(facts.records) ? STATUS.ANSWER : STATUS.MISSING;
      case INTENTS.RANKING:
        return nonEmpty(facts.ranked) ? STATUS.ANSWER : STATUS.MISSING;
      case INTENTS.COMPARISON:
        return nonEmpty(facts.entities) ? STATUS.ANSWER : STATUS.MISSING;
      case INTENTS.FARMING:
        return nonEmpty(facts.sources) ? STATUS.ANSWER : STATUS.MISSING;
      case INTENTS.RECIPE:
        return nonEmpty(facts.craftingResources) ? STATUS.ANSWER : STATUS.MISSING;
      case INTENTS.DROP:
        return nonEmpty(facts.droppedBy) ? STATUS.ANSWER : STATUS.MISSING;
      case INTENTS.MOB_DROPS:
        return nonEmpty(facts.drops) ? STATUS.ANSWER : STATUS.MISSING;
      case INTENTS.MOB:
        return nonEmpty(facts.bestiary) ||
          nonEmpty(facts.spawnAreas) ||
          nonEmpty(facts.markers) ||
          nonEmpty(facts.quests)
          ? STATUS.ANSWER
          : STATUS.MISSING;
      case INTENTS.ITEM:
        if (nonEmpty(facts.record) || nonEmpty(facts.compendium) || nonEmpty(facts.markers)) return STATUS.ANSWER;
        /* A "where can I find it" question is answered by the Bestiary's documented drop origins even
           when the item itself has no equipment record; the missing record is reported in the notes. */
        if (shape === "location" && nonEmpty(facts.droppedBy)) return STATUS.ANSWER;
        return STATUS.MISSING;
      case INTENTS.NPC:
        return nonEmpty(facts.markers) || nonEmpty(facts.requests) || nonEmpty(facts.appearsIn)
          ? STATUS.ANSWER
          : STATUS.MISSING;
      case INTENTS.QUEST:
        return nonEmpty(facts.quests) || nonEmpty(facts.markers) ? STATUS.ANSWER : STATUS.MISSING;
      case INTENTS.LOCATION:
        return nonEmpty(facts.markers) || nonEmpty(facts.areas) ? STATUS.ANSWER : STATUS.MISSING;
      default:
        return STATUS.MISSING;
    }
  }

  function confidenceFor(score, quality) {
    const level = score >= 1 ? "high" : score >= 0.9 ? "medium" : score > 0 ? "low" : "none";
    return { level, score, quality: quality || null };
  }
  /* --- Public entry point --------------------------------------------------- */

  /* A question that names a floor is answered from that floor. "floor 2", "floor2" and "2nd floor" are
     the forms a visitor actually types; anything vaguer stays with the active floor. */
  /* A question that names a floor is answered from that floor. "floor 2", "floor2" and "2nd floor" are
     the forms a visitor actually types; the Spanish "piso" and the French "étage" are their equivalents.
     The French "niveau" is deliberately absent: it means both "floor" and "level", so reading it as a
     floor would silently re-scope a level question such as "les armes de niveau 2". */
  const FLOOR_HINT_PATTERNS = Object.freeze([
    /\bfloor\s*([123])\b/,
    /\b([123])\s*(?:st|nd|rd|th)\s+floor\b/,
    /\b(?:piso|etage)\s*([123])\b/,
    /\b([123])\s*(?:er|eme|e)\s+(?:piso|etage)\b/
  ]);

  function detectFloorHint(normalized) {
    const text = textOf(normalized);
    if (!text) return null;
    for (const pattern of FLOOR_HINT_PATTERNS) {
      const match = pattern.exec(text);
      if (match) return `floor${match[1]}`;
    }
    return null;
  }

  /* The result skeleton every path starts from, so the unsupported-dataset answer has the same shape as
     any other result and callers never have to special-case it. */
  function createResult(scope, originalText, normalized, availability) {
    return {
      engine: ENGINE_VERSION,
      question: originalText,
      normalizedQuestion: normalized,
      context: { world: scope.world, dataset: scope.dataset, floor: scope.floor, language: scope.language },
      sources: Object.assign({}, availability),
      status: STATUS.UNSUPPORTED,
      intent: INTENTS.UNKNOWN,
      shape: null,
      entity: null,
      entityType: null,
      match: null,
      candidates: [],
      facts: {},
      dataQuality: { complete: false, notes: [] },
      confidence: confidenceFor(0, null),
      clarification: null,
      unsupportedReason: null,
      /* What the question was understood as: "single", "collection", "ranking", "comparison",
         "farming", "ranking-unsupported" or null when it was never planned (empty question, help). */
      plan: null
    };
  }

  function answerQuestion(scope, originalText, normalized) {
    const index = getIndex(scope);
    const result = createResult(scope, originalText, normalized, index.availability);

    if (!normalized) {
      result.unsupportedReason = "empty-question";
      return result;
    }

    /* The shape cues are English words, so a question asked in Spanish or French is checked a second
       time against its canonical form - the same tokens the planner reads ("donde" -> "where",
       "suelta" -> "drops"). The raw question is always tried first, so an English question can never
       change its shape because of an alias, and a localized one stops falling back to a bare intent. */
    const shape = detectShape(normalized) || detectShape(canonicalTokens(tokenize(normalized)).join(" "));
    result.shape = shape;

    if (shape === "help") {
      const help = buildHelpFacts(index, scope);
      result.status = STATUS.ANSWER;
      result.intent = INTENTS.HELP;
      result.facts = help.facts;
      result.dataQuality = { complete: true, notes: help.notes };
      result.confidence = confidenceFor(1, "intent");
      return result;
    }

    /* Stage 5: a question about a set of records, a ranking, a comparison or a farming target is planned
       before any name is matched. Collections, rankings and comparisons are answered from the index
       directly; a farming question still needs the item it names, so it falls through to the matcher. */
    const plan = planQuestion(normalized, index);
    result.plan = plan.kind;
    const planned = answerPlannedQuestion(plan, index, scope, result);
    if (planned) return planned;

    const matches = findEntities(index, normalized);
    if (!matches.length) {
      /* No record carries that name. A question that named a category and a qualifier is still a question
         about those records taken together - the same scope, the same records, and an empty result is
         reported honestly rather than as a name nobody has heard of. */
      if (plan.setFallback && plan.setFallback.text.length) {
        const setPlan = Object.assign({}, plan, {
          kind: "collection",
          filters: Object.assign({}, plan.filters, { text: plan.setFallback.text })
        });
        /* The result is put back exactly as it was if the set turns out to be empty, so a name the active
           floor simply does not hold still falls through to the site's own cross-floor behaviour. */
        const before = {
          status: result.status,
          plan: result.plan,
          facts: result.facts,
          notes: result.dataQuality.notes.slice()
        };
        const setAnswer = answerPlannedQuestion(setPlan, index, scope, result);
        if (setAnswer && toArray(setAnswer.facts && setAnswer.facts.records).length) {
          result.plan = "collection";
          return setAnswer;
        }
        Object.assign(result, { status: before.status, plan: before.plan, facts: before.facts });
        result.dataQuality.notes = before.notes;
      }
      result.unsupportedReason = shape ? "no-entity-match" : "no-supported-question";
      result.dataQuality.notes.push("absence-is-not-proof");
      if (!shape) result.dataQuality.notes.push("unsupported-question-shape");
      return result;
    }

    const picked = pickCandidate(shape, matches);
    if (!picked.entity) {
      const candidates = picked.candidates.slice(0, MAX_CANDIDATES).map((candidate) =>
        Object.assign(entitySummary(candidate.entity), {
          matchedName: candidate.matchedName || null,
          score: candidate.score
        })
      );
      result.status = STATUS.AMBIGUOUS;
      result.candidates = candidates;
      result.clarification = {
        reason: "multiple-matches",
        options: candidates.map((candidate) => ({
          id: candidate.id,
          type: candidate.type,
          name: candidate.name
        }))
      };
      result.confidence = confidenceFor(matches[0].score, matches[0].quality);
      result.dataQuality.notes.push("ambiguous-question");
      return result;
    }

    const entity = picked.entity;
    const pickedResult = matches.find((candidate) => candidate.entity === entity) || matches[0];
    const intent = plan.kind === "farming" ? INTENTS.FARMING : resolveIntent(shape, entity.type);
    const built = buildFactsFor(intent, entity, index, scope);
    const status = decideStatus(intent, built.facts, shape);

    result.status = status;
    result.intent = intent;
    result.entity = entitySummary(entity);
    result.entityType = entity.type;
    result.match = {
      matchedName: pickedResult.matchedName || null,
      matchedAlias: Boolean(pickedResult.matchedName && pickedResult.matchedName !== entity.name),
      score: pickedResult.score,
      quality: pickedResult.quality
    };
    result.facts = built.facts;
    result.dataQuality = { complete: status === STATUS.ANSWER && built.notes.length === 0, notes: built.notes };
    result.confidence = confidenceFor(pickedResult.score, pickedResult.quality);
    return result;
  }

  /* Only runs when the active floor produced no match at all. One other floor with a hit is answered
     from that floor (flagged so the caller can say where it came from); several floors with hits ask
     which one was meant. Records from different floors are never merged into one answer. */
  function searchOtherFloors(scope, originalText, normalized, base) {
    if (scope.world !== "aincrad") return null;
    const hits = [];
    for (const floor of FLOORS) {
      if (floor === scope.floor) continue;
      const otherScope = Object.assign({}, scope, { floor });
      const matches = findEntities(getIndex(otherScope), normalized);
      if (matches.length) hits.push({ scope: otherScope, matches });
    }
    if (!hits.length) return null;

    if (hits.length === 1) {
      const answered = answerQuestion(hits[0].scope, originalText, normalized);
      if (!answered.entity) return null;
      answered.dataQuality.notes.push("floor-inferred");
      return answered;
    }

    const options = [];
    for (const hit of hits) {
      for (const match of hit.matches) {
        options.push({ match, floor: hit.scope.floor });
        if (options.length >= MAX_CANDIDATES) break;
      }
      if (options.length >= MAX_CANDIDATES) break;
    }
    options.sort((left, right) => right.match.score - left.match.score);
    const candidates = options.map((option) =>
      Object.assign(entitySummary(option.match.entity), {
        floor: option.floor,
        matchedName: option.match.matchedName || null,
        score: option.match.score
      })
    );
    return Object.assign({}, base, {
      status: STATUS.AMBIGUOUS,
      candidates,
      clarification: {
        reason: "multiple-floor-matches",
        options: candidates.map((candidate) => ({
          id: candidate.id,
          type: candidate.type,
          name: candidate.name,
          floor: candidate.floor
        }))
      },
      confidence: confidenceFor(options[0].match.score, options[0].match.quality),
      dataQuality: { complete: false, notes: ["ambiguous-question", "ambiguous-floor"] }
    });
  }

  function query(question, context) {
    const scope = resolveScope(context);
    const originalText = typeof question === "string" ? question : "";
    const normalized = normalizeQuestion(originalText);

    /* Argo is a Current-Data broker. When the site is on Beta-Test Data nothing is read at all - not
       the page's globals, not the provider's records, not even an index - so a Beta answer can never be
       produced and Current Data is never passed off as Beta. */
    if (!SUPPORTED_DATASETS.includes(scope.dataset)) {
      const blocked = createResult(scope, originalText, normalized, null);
      blocked.unsupportedReason = "dataset-unsupported";
      blocked.dataQuality.notes.push("dataset-unsupported");
      return blocked;
    }

    /* Floors are an Aincrad concept; on the Underworld the same field holds island ids, so a question
       that happens to mention "floor 2" must never move the visitor off their island. */
    const floorHint = scope.world === "aincrad" ? detectFloorHint(normalized) : null;
    const contextNotes = [];

    if (floorHint && floorHint !== scope.floor) {
      scope.floor = floorHint;
      contextNotes.push("floor-from-question");
    }

    let result = answerQuestion(scope, originalText, normalized);
    if (!floorHint && !result.entity && result.status === STATUS.UNSUPPORTED) {
      const elsewhere = searchOtherFloors(scope, originalText, normalized, result);
      if (elsewhere) result = elsewhere;
    }
    for (const note of contextNotes) {
      if (!result.dataQuality.notes.includes(note)) result.dataQuality.notes.push(note);
    }
    return result;
  }

  /* Reports which datasets the engine can currently see, so a caller can be honest about gaps. In Beta
     mode it reports the mode as unsupported and indexes nothing. */
  function describeSources(context) {
    const scope = resolveScope(context);
    const described = {
      engine: ENGINE_VERSION,
      supported: SUPPORTED_DATASETS.includes(scope.dataset),
      context: { world: scope.world, dataset: scope.dataset, floor: scope.floor, language: scope.language },
      sources: {},
      entityCount: 0
    };
    if (!described.supported) return described;
    const index = getIndex(scope);
    described.sources = Object.assign({}, index.availability);
    described.entityCount = index.entities.length;
    return described;
  }

  /* A scoped engine: same behaviour, with the caller's context applied by default. */
  function createEngine(options) {
    const base = isPlainObject(options) ? options : {};
    return Object.freeze({
      version: ENGINE_VERSION,
      query(question, context) {
        return query(question, Object.assign({}, base, isPlainObject(context) ? context : {}));
      },
      describeSources(context) {
        return describeSources(Object.assign({}, base, isPlainObject(context) ? context : {}));
      },
      clearCache
    });
  }

  /* Hands the engine data it cannot see itself (tests, or a future page-level loader). */
  function registerSources(patch) {
    if (!isPlainObject(patch)) return null;
    injectedSources = Object.assign({}, injectedSources || {}, patch);
    sourcesVersion += 1;
    lastPatch = null;
    lastMerged = null;
    clearCache();
    return injectedSources;
  }

  function resetSources() {
    injectedSources = null;
    sourcesVersion += 1;
    lastPatch = null;
    lastMerged = null;
    clearCache();
  }

  const api = Object.freeze({
    version: ENGINE_VERSION,
    statuses: STATUS,
    intents: INTENTS,
    entityTypes: ENTITY_TYPES,
    datasets: DATASETS,
    supportedDatasets: SUPPORTED_DATASETS,
    worlds: WORLDS,
    floors: FLOORS,
    targets: TARGETS,
    normalizeQuestion,
    detectFloorHint,
    planQuestion,
    query,
    createEngine,
    describeSources,
    clearCache,
    registerSources,
    resetSources
  });

  global.SAOArgoEngine = api;
})(typeof window !== "undefined" ? window : globalThis);
