const assert = require("node:assert/strict");
const vm = require("node:vm");
const { loadScript, createClassList, createStyleStub } = require("./harness-helpers");

const UNDERWORLD_NAMESPACE = "underworld-map";
const LANGUAGES = ["en", "es", "fr"];

function createEventTarget() {
  const listeners = new Map();
  return {
    addEventListener(type, listener) {
      if (!listeners.has(type)) listeners.set(type, new Set());
      listeners.get(type).add(listener);
    },
    removeEventListener(type, listener) {
      listeners.get(type)?.delete(listener);
    },
    dispatchEvent() {
      return true;
    }
  };
}

function createNode(tagName = "div") {
  return {
    ...createEventTarget(),
    tagName,
    children: [],
    dataset: {},
    style: createStyleStub(),
    classList: createClassList(),
    innerHTML: "",
    textContent: "",
    value: "",
    checked: false,
    appendChild(child) {
      this.children.push(child);
      return child;
    },
    append(...nodes) {
      nodes.forEach((node) => this.appendChild(node));
    },
    replaceChildren() {
      this.children.length = 0;
    },
    remove() {},
    setAttribute() {},
    removeAttribute() {},
    focus() {},
    closest() {
      return null;
    },
    querySelector() {
      return null;
    },
    querySelectorAll() {
      return [];
    },
    get childElementCount() {
      return this.children.length;
    },
    getBoundingClientRect() {
      return { left: 0, top: 0, width: 1000, height: 1000 };
    }
  };
}

function createPageDom() {
  const ids = [
    "mapContainer",
    "sidebar",
    "sidebarResizeHandle",
    "mapLayer",
    "mapImage",
    "undergroundMapImage",
    "mobAreaLayer",
    "markers",
    "title",
    "content",
    "overlayMappedCoords",
    "search",
    "clearFilters",
    "zoomLabel",
    "resetView",
    "zoomIn",
    "zoomOut",
    "mapContextMenu",
    "globalToast",
    "journeyMapImportFile",
    "customWaypointDialog",
    "customWaypointForm",
    "customWaypointName",
    "customWaypointDescription",
    "customWaypointX",
    "customWaypointZ",
    "customWaypointLogo",
    "customWaypointStatus",
    "customWaypointStatusMessage",
    "customWaypointButtonSelect",
    "customWaypointButtonName",
    "customWaypointButtonNameRow",
    "customWaypointCategoryColorRow",
    "customWaypointCategoryColor",
    "customWaypointCategoryHex",
    "customWaypointCategorySwatch",
    "customWaypointCategoryColorHint",
    "customWaypointCancel",
    "customWaypointCopy",
    "customWaypointDeleteConfirm",
    "customWaypointDeleteCancel",
    "customWaypointDeleteDialog",
    "customWaypointSidebarList",
    "customButtonDeleteConfirm",
    "customButtonDeleteCancel",
    "customButtonDeleteDialog",
    "categoryList",
    "categorySectionHeader",
    "mapEmptyState",
    "mapEmptyStateLabel"
  ];
  const elements = Object.fromEntries(ids.map((id) => [id, createNode()]));
  elements.controls = createNode();
  elements.mapImage.naturalWidth = 0;
  elements.mapImage.naturalHeight = 0;
  elements.markers.clientWidth = 1600;
  elements.markers.clientHeight = 1200;

  const documentObject = {
    ...createEventTarget(),
    cookie: "",
    body: createNode("body"),
    head: { appendChild() {} },
    documentElement: { lang: "en", style: createStyleStub(), classList: createClassList() },
    getElementById(id) {
      return elements[id] || null;
    },
    querySelectorAll() {
      return [];
    },
    querySelector(selector) {
      return selector === ".controls" ? elements.controls : null;
    },
    createElement(tagName) {
      return createNode(tagName);
    },
    createElementNS(_namespace, tagName) {
      return createNode(tagName);
    },
    createDocumentFragment() {
      return createNode("fragment");
    }
  };
  return { elements, documentObject };
}

/* ------------------------------------------------------------------ *
 * The Fractured Underworld page, booted with the real localization
 * stack (sao-i18n.js + sao-content-translations.js) so the assertions
 * exercise the shipped lookup path rather than a stub.
 * ------------------------------------------------------------------ */
function loadUnderworldPage() {
  const page = createPageDom();
  const context = vm.createContext({
    console,
    document: page.documentObject,
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
    Error,
    history: { state: null, replaceState() {}, pushState() {} },
    location: {
      href: "https://example.test/Fractured%20Underworld/Main%20UI/mainui.html",
      pathname: "/Fractured Underworld/Main UI/mainui.html",
      search: "",
      origin: "https://example.test"
    }
  });
  context.window = context;
  context.globalThis = context;
  Object.assign(context.window, createEventTarget(), {
    document: page.documentObject,
    requestAnimationFrame() {
      return 1;
    },
    cancelAnimationFrame() {},
    setTimeout() {
      return 1;
    },
    clearTimeout() {},
    setInterval() {
      return 1;
    },
    clearInterval() {},
    getComputedStyle() {
      return { borderRadius: "0px" };
    },
    matchMedia() {
      return { matches: false };
    },
    getSelection() {
      return null;
    },
    SAOStorage: {
      getItem() {
        return null;
      },
      setItem() {},
      removeItem() {},
      getJSON(_key, fallback) {
        return fallback;
      },
      setJSON() {}
    },
    CustomEvent: class CustomEvent {
      constructor(type, init) {
        this.type = type;
        this.detail = init && init.detail;
      }
    }
  });

  loadScript("shared/sao-i18n.js", context);
  loadScript("shared/sao-content-translations.js", context);
  loadScript("shared/map-runtime.js", context);
  loadScript("shared/sao-page-helpers.js", context);
  loadScript("shared/sao-map-helpers.js", context);
  loadScript("shared/sao-custom-waypoints.js", context);
  loadScript("Fractured Underworld/Main UI/underworldData.js", context);
  loadScript("Fractured Underworld/Main UI/adapter.js", context);

  /* The guided walkthrough is not part of the localization contract. */
  vm.runInContext("window.createWalkthroughController = () => ({ start() { return false; }, destroy() {} });", context);

  loadScript("Fractured Underworld/Main UI/mainui.js", context);
  vm.runInContext(
    "window.__localizationProbe = { getMarkerText, getAreaText, registerUnderworldMapTranslations };",
    context
  );

  context.window.__initUnderworldMapRuntime();
  return { context, page };
}

/* The Aincrad datasets need their own context: mapData.js declares its own `const DATA`,
   while underworldData.js assigns window.DATA. */
function loadAincradData() {
  const context = vm.createContext({
    console,
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
  context.window = context;
  context.globalThis = context;
  loadScript("Aincrad/Map/mapData.js", context);
  ["maps_floor1.js", "maps_floor2.js", "maps_floor3.js"].forEach((file) => loadScript(`Aincrad/Map/${file}`, context));
  return vm.runInContext("Object.entries(DATA)", context);
}

/* ------------------------------------------------------------------ *
 * Assertions
 * ------------------------------------------------------------------ */
const underworld = loadUnderworldPage();
const uwWindow = underworld.context.window;
const i18n = uwWindow.SAOI18n;
const registry = uwWindow.SAOContentTranslations;
const probe = uwWindow.__localizationProbe;
const uwMarkers = Object.entries(uwWindow.DATA || {});

assert.ok(uwMarkers.length > 0, "Underworld Beta data exposes markers");

const uwKeys = (language) =>
  Object.keys(registry[language] || {}).filter((key) => key.startsWith(`${UNDERWORLD_NAMESPACE}.`));
const rawKeyPattern = new RegExp(`^(?:${UNDERWORLD_NAMESPACE}|map)\\.`);

/* 1. The page registers its own namespace instead of relying on English fallbacks, and never
      writes Underworld markers into Aincrad's `map.*` namespace. */
for (const language of LANGUAGES) {
  assert.ok(uwKeys(language).length > 0, `the Underworld page registers ${language} content`);
}
for (const [id] of uwMarkers) {
  assert.equal(
    registry.en[`map.${id}.title`],
    undefined,
    `Underworld marker ${id} does not enter Aincrad's map.* namespace`
  );
}

/* 2. Every Underworld marker field is registered for every marker, not only the active island. */
for (const [id, marker] of uwMarkers) {
  for (const field of ["title", "type", "description"]) {
    if (!marker[field]) continue;
    for (const language of LANGUAGES) {
      assert.equal(
        typeof registry[language][`${UNDERWORLD_NAMESPACE}.${id}.${field}`],
        "string",
        `${UNDERWORLD_NAMESPACE}.${id}.${field} is registered for ${language}`
      );
    }
  }
}

/* 3. Marker titles resolve through SAOI18n.content() in all three languages. */
for (const [id, marker] of uwMarkers) {
  if (!marker.title) continue;
  for (const language of LANGUAGES) {
    i18n.setLanguage(language);
    const localized = probe.getMarkerText(marker, "title", id);
    assert.equal(typeof localized, "string", `${id} title resolves for ${language}`);
    assert.ok(localized.length > 0, `${id} title is not empty for ${language}`);
    assert.doesNotMatch(localized, rawKeyPattern, `${id} title never returns a raw key for ${language}`);
  }
  i18n.setLanguage("en");
  assert.equal(probe.getMarkerText(marker, "title", id), marker.title, `${id} English title keeps the data value`);
}

/* 4. Curated es/fr translations from the shared registry reach the page. */
function localizedTitle(id, language) {
  const marker = uwMarkers.find(([markerId]) => markerId === id)?.[1];
  assert.ok(marker, `${id} exists in the Underworld data`);
  i18n.setLanguage(language);
  return probe.getMarkerText(marker, "title", id);
}
assert.equal(localizedTitle("mq-8", "es"), "Hacia el Cedro Gigas...", "mq-8 title resolves in Spanish");
assert.equal(localizedTitle("mq-8", "fr"), "Vers le Cèdre Gigas...", "mq-8 title resolves in French");
assert.equal(localizedTitle("mq-13", "es"), "El pueblo de Rulid...", "mq-13 title resolves in Spanish");
assert.equal(localizedTitle("mq-13", "fr"), "Le village de Rulid...", "mq-13 title resolves in French");
assert.equal(
  localizedTitle("mq-18", "fr"),
  "Labyrinthe de la mémoire : la grotte des gobelins de Rulid",
  "mq-18 title resolves in French"
);
assert.notEqual(
  localizedTitle("mq-8", "fr"),
  localizedTitle("mq-8", "en"),
  "French differs from English when a translation exists"
);
assert.notEqual(
  localizedTitle("mq-8", "es"),
  localizedTitle("mq-8", "en"),
  "Spanish differs from English when a translation exists"
);

/* 5. Marker types resolve too. */
const typeMarker = uwMarkers.find(([, marker]) => marker.type)?.[1];
assert.ok(typeMarker, "Underworld markers carry a type");
i18n.setLanguage("en");
assert.equal(probe.getMarkerText(typeMarker, "type", "mq-7"), "Quest", "type resolves in English");
i18n.setLanguage("es");
assert.equal(probe.getMarkerText(typeMarker, "type", "mq-7"), "Misión", "type resolves in Spanish");
i18n.setLanguage("fr");
assert.equal(probe.getMarkerText(typeMarker, "type", "mq-7"), "Quête", "type resolves in French");

/* 6. Mob areas use the same namespace machinery. The repository ships no Underworld mob-area
   records yet, so the mechanism is exercised with a curated entry placed in the shared
   dictionaries first - exactly how Aincrad's curated mob-area titles are supplied. */
const mobArea = { id: "localization-mechanism-area", title: "Mechanism Area Mobs" };
const mobAreaKey = `${UNDERWORLD_NAMESPACE}.mob-area.${mobArea.id}.title`;
registry.es[mobAreaKey] = "Zona de mecanismo";
registry.fr[mobAreaKey] = "Zone de mécanisme";
registry.registerMapMobArea(mobArea, UNDERWORLD_NAMESPACE);
assert.equal(registry.en[mobAreaKey], mobArea.title, "mob-area English value is registered");
i18n.setLanguage("es");
assert.equal(probe.getAreaText(mobArea), "Zona de mecanismo", "mob-area title resolves in Spanish");
i18n.setLanguage("fr");
assert.equal(probe.getAreaText(mobArea), "Zone de mécanisme", "mob-area title resolves in French");
assert.doesNotMatch(probe.getAreaText(mobArea), rawKeyPattern, "mob-area title never returns a raw key");
i18n.setLanguage("en");
assert.equal(probe.getAreaText(mobArea), mobArea.title, "mob-area title resolves in English");

/* 7. An unregistered mob area falls back to its data value, never to a raw key. */
const unregisteredArea = { id: "localization-unregistered-area", title: "Unregistered Area Mobs" };
assert.equal(
  probe.getAreaText(unregisteredArea),
  unregisteredArea.title,
  "unknown mob-area falls back to the data title"
);
assert.doesNotMatch(probe.getAreaText(unregisteredArea), rawKeyPattern, "unknown mob-area never returns a raw key");

/* 8. Namespace isolation: the Underworld must not write into Aincrad's `map.*` namespace. */
assert.equal(registry.en["map.mq-8.title"], undefined, "Underworld registration does not create Aincrad map.* keys");
assert.ok(registry.en[`${UNDERWORLD_NAMESPACE}.mq-8.title`], "Underworld markers live under the Underworld namespace");

/* 9. Aincrad keeps the historical default namespace and its curated translations. */
const aincradMarkers = loadAincradData();
assert.ok(aincradMarkers.length > 0, "Aincrad map data exposes markers");
aincradMarkers.forEach(([id, marker]) => registry.registerMapMarker(id, marker));
const curatedAincrad = aincradMarkers.find(
  ([id, marker]) => marker.title && registry.es[`map.${id}.title`] && registry.es[`map.${id}.title`] !== marker.title
);
assert.ok(curatedAincrad, "at least one Aincrad marker has a curated Spanish title");
const [curatedId, curatedMarker] = curatedAincrad;
i18n.setLanguage("es");
assert.equal(
  i18n.content(`map.${curatedId}.title`, curatedMarker.title),
  registry.es[`map.${curatedId}.title`],
  "Aincrad map titles still resolve their curated Spanish value"
);
i18n.setLanguage("fr");
assert.equal(
  i18n.content(`map.${curatedId}.title`, curatedMarker.title),
  registry.fr[`map.${curatedId}.title`],
  "Aincrad map titles still resolve their curated French value"
);

/* 10. The namespace argument is optional and defaults to the historical `map` prefix. */
registry.registerMapMarker("namespace-default-probe", { title: "Namespace Default Probe" });
for (const language of LANGUAGES) {
  assert.equal(
    registry[language]["map.namespace-default-probe.title"],
    "Namespace Default Probe",
    `registerMapMarker keeps the map.* default for ${language}`
  );
  assert.equal(
    registry[language][`${UNDERWORLD_NAMESPACE}.namespace-default-probe.title`],
    undefined,
    `the default namespace does not leak into ${UNDERWORLD_NAMESPACE} for ${language}`
  );
}

/* 11. Missing content still falls back instead of surfacing a raw key. */
i18n.setLanguage("fr");
assert.equal(
  i18n.content("underworld-map.absent-marker.title", "Fallback Title"),
  "Fallback Title",
  "missing content returns the supplied fallback"
);
assert.equal(
  i18n.content("underworld-map.absent-marker.title"),
  "underworld-map.absent-marker.title",
  "missing content without a fallback returns the key itself, as before"
);

console.log(
  JSON.stringify(
    {
      underworldMarkers: uwMarkers.length,
      underworldRegisteredKeys: Object.fromEntries(LANGUAGES.map((language) => [language, uwKeys(language).length])),
      aincradMarkers: aincradMarkers.length,
      status: "passed"
    },
    null,
    2
  )
);
console.log("Underworld map localization regression tests passed.");
