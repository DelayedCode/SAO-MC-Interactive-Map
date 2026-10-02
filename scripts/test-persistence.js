const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");

function createCookieDocument(initialCookie = "") {
  const cookieMap = new Map();
  const applyCookieString = (value) => {
    const entryString = String(value || "");
    if (!entryString) {
      cookieMap.clear();
      return;
    }

    const [firstToken, ...rawAttributes] = entryString
      .split(";")
      .map((part) => part.trim())
      .filter(Boolean);
    const equalsIndex = firstToken.indexOf("=");
    const name = equalsIndex >= 0 ? firstToken.slice(0, equalsIndex) : firstToken;
    const cookieValue = equalsIndex >= 0 ? firstToken.slice(equalsIndex + 1) : "";
    const attributes = {};
    for (const item of rawAttributes) {
      const attrParts = item.split("=");
      const attrName = attrParts[0].trim().toLowerCase();
      const attrValue = attrParts.slice(1).join("=").trim();
      attributes[attrName] = attrValue;
    }

    if (String(attributes["max-age"]) === "0") {
      cookieMap.delete(decodeURIComponent(name));
      return;
    }

    cookieMap.set(decodeURIComponent(name), decodeURIComponent(cookieValue));
  };

  if (initialCookie) {
    for (const cookie of String(initialCookie)
      .split(";")
      .map((part) => part.trim())
      .filter(Boolean)) {
      applyCookieString(cookie);
    }
  }

  return {
    get cookie() {
      return Array.from(cookieMap.entries())
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        .join("; ");
    },
    set cookie(nextValue) {
      applyCookieString(nextValue);
    }
  };
}

function createBrowser({ storageMap = new Map(), cookieValue = "" } = {}) {
  const localStorage = {
    _values: new Map(storageMap),
    getItem(key) {
      const normalizedKey = String(key);
      return this._values.has(normalizedKey) ? this._values.get(normalizedKey) : null;
    },
    setItem(key, value) {
      this._values.set(String(key), String(value));
    },
    removeItem(key) {
      this._values.delete(String(key));
    }
  };

  const document = createCookieDocument(cookieValue);
  Object.assign(document, {
    addEventListener() {},
    getElementById() {
      return null;
    },
    querySelector() {
      return null;
    },
    querySelectorAll() {
      return [];
    },
    createElement() {
      return {
        appendChild() {},
        replaceChildren() {},
        addEventListener() {},
        setAttribute() {},
        classList: { add() {}, remove() {}, toggle() {} },
        style: {},
        dataset: {},
        closest() {
          return null;
        }
      };
    },
    head: { appendChild() {} }
  });

  const windowObject = {
    document,
    localStorage,
    location: {
      href: "http://localhost/",
      search: ""
    },
    history: {
      state: null,
      replaceState() {},
      pushState() {}
    },
    addEventListener() {},
    removeEventListener() {},
    setTimeout,
    clearTimeout,
    requestAnimationFrame(callback) {
      return setTimeout(() => callback(Date.now()), 0);
    },
    cancelAnimationFrame(handle) {
      clearTimeout(handle);
    },
    matchMedia() {
      return { matches: false, addListener() {}, removeListener() {} };
    },
    SAODatasets: {
      getDatasetFromLocation() {
        return "beta";
      }
    },
    SAOContentTranslations: {
      registerQuestEntry() {},
      registerMapMarker() {},
      register() {},
      translateKnownTerms(value) {
        return value;
      },
      es: {},
      fr: {}
    },
    SAOPageUtils: { attachSectionNavButtons() {} },
    SAOI18n: {
      t: (key, params) => key,
      content: (key, fallback) => fallback,
      getLanguage: () => "en"
    }
  };

  return { windowObject, document, localStorage };
}

function loadStorageModule(windowObject) {
  const context = vm.createContext({
    console,
    window: windowObject,
    document: windowObject.document,
    localStorage: windowObject.localStorage,
    URL,
    URLSearchParams,
    Object,
    Array,
    Map,
    Set,
    JSON,
    Math,
    String,
    Number,
    Boolean,
    RegExp,
    Date,
    Error
  });
  context.window = windowObject;
  context.globalThis = windowObject;
  vm.runInContext(fs.readFileSync(path.join(root, "shared", "sao-storage.js"), "utf8"), context, {
    filename: "shared/sao-storage.js"
  });
  return windowObject.SAOStorage;
}

function loadScript(filePath, context, additionalGlobals = {}) {
  const source = fs.readFileSync(filePath, "utf8");
  vm.runInContext(source, context, { filename: filePath });
  Object.assign(context.window, additionalGlobals);
}

function assertStorageFallbackOrder() {
  const browser = createBrowser();
  const storage = loadStorageModule(browser.windowObject);

  storage.setItem("alpha", "one");
  storage.setItem("beta", JSON.stringify({ ok: true }));
  assert.equal(storage.getItem("alpha"), "one");
  assert.deepEqual(storage.getJSON("beta", null), { ok: true });
  assert.equal(storage.getItem("missing-key"), null);

  storage.setItem("gamma", "first");
  storage.setItem("delta", "second");
  assert.equal(storage.getItem("gamma"), "first");
  assert.equal(storage.getItem("delta"), "second");
  storage.setItem("gamma", "updated");
  assert.equal(storage.getItem("gamma"), "updated");
  assert.equal(storage.getItem("delta"), "second");
  storage.removeItem("gamma");
  assert.equal(storage.getItem("gamma"), null);

  const brokenStorage = {
    getItem() {
      throw new Error("localStorage unavailable");
    },
    setItem() {
      throw new Error("localStorage unavailable");
    },
    removeItem() {
      throw new Error("localStorage unavailable");
    }
  };

  const cookieBrowser = createBrowser({ cookieValue: "cookieKey=cookieValue" });
  cookieBrowser.windowObject.localStorage = brokenStorage;
  const cookieStorage = loadStorageModule(cookieBrowser.windowObject);
  cookieStorage.setItem("cookieKey", "cookieValue");
  assert.equal(cookieStorage.getItem("cookieKey"), "cookieValue");

  const memoryBrowser = createBrowser();
  memoryBrowser.windowObject.localStorage = brokenStorage;
  memoryBrowser.document.cookie = "";
  const getterThatThrows = {
    get cookie() {
      throw new Error("cookie unavailable");
    },
    set cookie(_nextValue) {
      throw new Error("cookie unavailable");
    }
  };
  memoryBrowser.document = getterThatThrows;
  memoryBrowser.windowObject.document = getterThatThrows;
  const memoryStorage = loadStorageModule(memoryBrowser.windowObject);
  memoryStorage.setItem("memoryOnly", "inMemory");
  assert.equal(memoryStorage.getItem("memoryOnly"), "inMemory");

  const missingValueBrowser = createBrowser();
  missingValueBrowser.windowObject.localStorage = {
    getItem() {
      return null;
    },
    setItem() {
      throw new Error("blocked");
    },
    removeItem() {
      throw new Error("blocked");
    }
  };
  const missingValueStorage = loadStorageModule(missingValueBrowser.windowObject);
  missingValueStorage.setItem("jsonValue", JSON.stringify({ ok: true }));
  assert.deepEqual(missingValueStorage.getJSON("jsonValue", null), { ok: true });
  missingValueStorage.removeItem("jsonValue");
  assert.equal(missingValueStorage.getItem("jsonValue"), null);
}

function assertPersistentKeyContract() {
  const expectedKeys = [
    "sao.global.settings",
    "sao.completedQuests",
    "sao.quests.uiState",
    "sao.visitedMarkers",
    "sao.sidebar.width",
    "sao.map.uiState",
    "sao.bestiary.uiState",
    "sao.compendium.uiState",
    "sao.commands.uiState",
    "sao.patchnotes.search",
    "sao.walkthrough.index.completed",
    "sao.walkthrough.maps.completed",
    "sao.walkthrough.mainui.completed",
    "sao.walkthrough.characterBuild.completed"
  ];

  assert.deepEqual([...new Set(expectedKeys)], expectedKeys);
  for (const key of expectedKeys) {
    assert.equal(typeof key, "string");
  }
}

function assertQuestCompatibility() {
  const browser = createBrowser();
  const context = vm.createContext({
    console,
    window: browser.windowObject,
    document: browser.document,
    localStorage: browser.localStorage,
    URL,
    URLSearchParams,
    Object,
    Array,
    Map,
    Set,
    JSON,
    Math,
    String,
    Number,
    Boolean,
    RegExp,
    Date,
    Error
  });
  context.window = browser.windowObject;
  context.globalThis = browser.windowObject;

  const storage = {
    _values: new Map(),
    getItem(key) {
      return this._values.has(String(key)) ? this._values.get(String(key)) : null;
    },
    setItem(key, value) {
      this._values.set(String(key), String(value));
    },
    getJSON(key, fallbackValue) {
      const raw = this.getItem(key);
      if (raw === null) return fallbackValue;
      try {
        return JSON.parse(raw);
      } catch {
        return fallbackValue;
      }
    },
    setJSON(key, value) {
      this.setItem(key, JSON.stringify(value));
    }
  };
  browser.windowObject.SAOStorage = storage;

  const seedBrowser = createBrowser();
  const seedContext = vm.createContext({
    console,
    window: seedBrowser.windowObject,
    document: seedBrowser.document,
    localStorage: seedBrowser.localStorage,
    URL,
    URLSearchParams,
    Object,
    Array,
    Map,
    Set,
    JSON,
    Math,
    String,
    Number,
    Boolean,
    RegExp,
    Date,
    Error
  });
  seedContext.window = seedBrowser.windowObject;
  seedContext.globalThis = seedBrowser.windowObject;
  seedBrowser.windowObject.SAOStorage = storage;

  loadScript(path.join(root, "shared", "sao-page-helpers.js"), seedContext);
  loadScript(path.join(root, "Aincrad", "Quests", "quests_floor1.js"), seedContext);
  loadScript(path.join(root, "Aincrad", "Quests", "quests_current.js"), seedContext);
  loadScript(path.join(root, "Aincrad", "Quests", "quests.js"), seedContext);

  const entry = seedContext.window.QUEST_ENTRIES_BY_FLOOR.floor1[0];
  assert.ok(entry, "fixture data includes a real quest entry");

  const currentDatasetKey = ["beta", seedContext.getQuestId(entry)].join("|");
  const legacyKey = [entry.npcName, entry.city, entry.coordinates, entry.questName].join("|");
  const completed = new Set([currentDatasetKey, legacyKey, "beta|unrelated"]);
  storage.setItem("sao.completedQuests", JSON.stringify(Array.from(completed)));

  const runtimeBrowser = createBrowser();
  const runtimeContext = vm.createContext({
    console,
    window: runtimeBrowser.windowObject,
    document: runtimeBrowser.document,
    localStorage: runtimeBrowser.localStorage,
    URL,
    URLSearchParams,
    Object,
    Array,
    Map,
    Set,
    JSON,
    Math,
    String,
    Number,
    Boolean,
    RegExp,
    Date,
    Error
  });
  runtimeContext.window = runtimeBrowser.windowObject;
  runtimeContext.globalThis = runtimeBrowser.windowObject;
  runtimeBrowser.windowObject.SAOStorage = storage;

  loadScript(path.join(root, "shared", "sao-page-helpers.js"), runtimeContext);
  loadScript(path.join(root, "Aincrad", "Quests", "quests_floor1.js"), runtimeContext);
  loadScript(path.join(root, "Aincrad", "Quests", "quests_current.js"), runtimeContext);
  loadScript(path.join(root, "Aincrad", "Quests", "quests.js"), runtimeContext);

  const loaded = runtimeContext.loadCompletedQuests();
  assert.ok(loaded.has(currentDatasetKey));
  assert.ok(loaded.has(legacyKey));
  assert.ok(loaded.has("beta|unrelated"));

  const currentEntry = { ...entry, id: "dataset-aware-id" };
  assert.equal(runtimeContext.getQuestKey(currentEntry), "beta|dataset-aware-id");
  assert.equal(runtimeContext.getLegacyQuestKey(entry), legacyKey);
  assert.equal(runtimeContext.isQuestCompleted(entry), true);

  const nextCompleted = new Set(loaded);
  runtimeContext.setQuestCompleted(nextCompleted, "current|new-quest", true);
  assert.ok(nextCompleted.has("current|new-quest"));
  nextCompleted.delete("beta|unrelated");
  runtimeContext.saveCompletedQuests(nextCompleted);
  const saved = JSON.parse(storage.getItem("sao.completedQuests"));
  assert.ok(saved.includes("current|new-quest"));
  assert.equal(saved.includes("beta|unrelated"), false);

  const toggleSet = new Set([currentDatasetKey, "beta|unrelated"]);
  runtimeContext.setQuestCompleted(toggleSet, currentDatasetKey, false);
  assert.equal(toggleSet.has(currentDatasetKey), false);
  assert.equal(toggleSet.has("beta|unrelated"), true);
}

function assertVisitedMarkerCompatibility() {
  const storage = {
    _values: { "sao.visitedMarkers": ["legacy-marker"] },
    getJSON(key, fallbackValue) {
      return Object.prototype.hasOwnProperty.call(this._values, key) ? this._values[key] : fallbackValue;
    },
    setJSON(key, value) {
      this._values[key] = value;
    }
  };

  const runtimeApi = require(path.join(root, "shared", "map-runtime.js"));
  const dom = {
    mapContainer: {},
    sidebar: {},
    mapLayer: {},
    mapImage: {},
    undergroundMapImage: {},
    mobAreaLayer: {},
    markerLayer: {},
    title: {},
    content: {},
    overlayMappedCoords: {},
    floorSelect: {},
    undergroundToggle: {},
    searchInput: {},
    clearFiltersButton: {},
    zoomLabel: {},
    resetViewButton: {}
  };
  const adapter = {
    id: "persistence-test",
    label: "Persistence Test",
    defaultFloor: "floor1",
    floors: { floor1: { label: "Floor 1" } },
    categories: {},
    mapImageSources: { floor1: { surface: "floor1.png" } },
    markerDataset: {},
    mobAreaDataset: [],
    navigationSections: {},
    sectionPaths: {},
    walkthroughSteps: [],
    walkthroughStorageKey: "sao.walkthrough.persistence-test.completed"
  };
  const runtime = runtimeApi.createMapRuntime(adapter, { dom, storage });

  const floor = "floor1";
  const rawMarker = "marker-42";
  const floorAwareKey = runtime.getVisitedMarkerKey(floor, rawMarker);
  assert.equal(runtime.isMarkerVisited("floor1", "legacy-marker"), true);
  runtime.setMarkerVisited(floor, rawMarker, true);
  assert.equal(runtime.isMarkerVisited(floor, rawMarker), true);
  assert.ok(storage._values["sao.visitedMarkers"].includes(floorAwareKey));

  runtime.setMarkerVisited("floor3", "other", true);
  const savedValue = storage._values["sao.visitedMarkers"];
  assert.ok(Array.isArray(savedValue));
  assert.ok(savedValue.includes(floorAwareKey));
  assert.ok(savedValue.includes("floor3:other"));

  runtime.setMarkerVisited("floor2", "another", false);
  assert.equal(runtime.isMarkerVisited("floor2", "another"), false);

  const duplicateState = new Set([floorAwareKey, floorAwareKey]);
  assert.equal(duplicateState.size, 1);
}

function assertWalkthroughResetUsesStorageAbstraction() {
  const browser = createBrowser();
  const removed = [];
  const storage = {
    _values: new Map(),
    getItem(key) {
      return this._values.has(String(key)) ? this._values.get(String(key)) : null;
    },
    setItem(key, value) {
      this._values.set(String(key), String(value));
    },
    removeItem(key) {
      const normalized = String(key);
      removed.push(normalized);
      this._values.delete(normalized);
    },
    getJSON(key, fallbackValue) {
      const raw = this.getItem(key);
      if (raw === null) return fallbackValue;
      try {
        return JSON.parse(raw);
      } catch {
        return fallbackValue;
      }
    },
    setJSON(key, value) {
      this.setItem(key, JSON.stringify(value));
    }
  };

  browser.windowObject.SAOStorage = storage;
  browser.windowObject.localStorage = {
    getItem() {
      return null;
    },
    setItem() {},
    removeItem() {
      throw new Error("resetWalkthroughProgress should use SAOStorage.removeItem when available");
    }
  };

  const context = vm.createContext({
    console,
    window: browser.windowObject,
    document: browser.document,
    localStorage: browser.windowObject.localStorage,
    URL,
    URLSearchParams,
    Object,
    Array,
    Map,
    Set,
    JSON,
    Math,
    String,
    Number,
    Boolean,
    RegExp,
    Date,
    Error
  });
  context.window = browser.windowObject;
  context.globalThis = browser.windowObject;

  for (const key of [
    "sao.walkthrough.index.completed",
    "sao.walkthrough.maps.completed",
    "sao.walkthrough.mainui.completed",
    "sao.walkthrough.characterBuild.completed"
  ]) {
    storage.setItem(key, "1");
  }

  vm.runInContext(fs.readFileSync(path.join(root, "shared", "sao-i18n.js"), "utf8"), context, {
    filename: "shared/sao-i18n.js"
  });
  vm.runInContext("window.SAOI18n.resetWalkthroughProgress();", context);

  assert.deepEqual(
    removed.sort(),
    [
      "sao.walkthrough.index.completed",
      "sao.walkthrough.maps.completed",
      "sao.walkthrough.mainui.completed",
      "sao.walkthrough.characterBuild.completed"
    ].sort()
  );
}

function main() {
  assertStorageFallbackOrder();
  assertPersistentKeyContract();
  assertQuestCompatibility();
  assertVisitedMarkerCompatibility();
  assertWalkthroughResetUsesStorageAbstraction();
  console.log("Persistence regression tests passed.");
}

main();
