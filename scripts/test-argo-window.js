/* Focused checks for shared/sao-argo.js (Argo the Info Broker - Stage 1 launcher and chat window).
 *
 * The real module is run inside a VM against a small DOM stub, so the interaction rules - creation,
 * aria state, dragging, clamping, the closing sphere, conversation clearing and the no-persistence
 * guarantee - are verified without a browser. The layout checks that need real rendering live in
 * scripts/test-argo-window-browser.js.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { translatedUiLanguages } = require("./localization-languages");

const root = path.resolve(__dirname, "..");
const argoSource = fs.readFileSync(path.join(root, "shared", "sao-argo.js"), "utf8");
/* The site's own route table and safe-href resolver. Loaded only when a test asks for it, so the
   default harness keeps exercising the "this page publishes no routes" path Argo must survive. */
const pageUtilsSource = fs.readFileSync(path.join(root, "shared", "sao-page-utils.js"), "utf8");
const indexSource = fs.readFileSync(path.join(root, "index.html"), "utf8");
const i18nSource = fs.readFileSync(path.join(root, "shared", "sao-i18n.js"), "utf8");
const argoCss = fs.readFileSync(path.join(root, "shared", "sao-argo.css"), "utf8");
const mapUiCss = fs.readFileSync(path.join(root, "shared", "sao-map-ui.css"), "utf8");

/* The dialogue pools shared/sao-argo.js renders, with the sizes the module declares. Every pool is
   checked against the dictionaries below, so a pool cannot quietly shrink or lose a language. */
const LEAD_POOL_SIZES = Object.freeze({
  item: 20,
  recipe: 12,
  mob: 20,
  mobDrops: 14,
  drop: 14,
  npc: 12,
  quest: 14,
  location: 14
});
const CATEGORIES = Object.keys(LEAD_POOL_SIZES);
/* The four set categories have their own openers and closers rather than borrowing the single-record
   wording, so they are registered alongside the rest. */
const SET_CATEGORIES = Object.freeze(["collection", "ranking", "comparison", "farming"]);
const NOTE_POOL_SIZES = Object.freeze({
  itemRecordMissing: 3,
  bestiaryRecordMissing: 3,
  noDropRecord: 3,
  noRecipe: 3,
  noCraftingLocation: 3,
  noStats: 3,
  noSpawnArea: 3,
  markerNotFound: 3,
  questMarkerOnly: 3,
  absenceNotProof: 3,
  otherIsland: 3,
  englishOnly: 3,
  floorInferred: 3,
  otherFloorRecords: 3,
  rankingUnknown: 3,
  chanceNotRecorded: 3,
  noRecordedRate: 3,
  comparisonTruncated: 3
});
const STATUS_POOL_SIZES = Object.freeze({
  ambiguous: 8,
  missing: 8,
  unsupported: 8,
  datasetUnsupported: 4,
  error: 4,
  engineMissing: 4,
  candidates: 3,
  emptySet: 3
});
const TARGET_LABELS = ["quest", "boss", "mob", "item", "npc", "location", "dungeon", "area"];
const SET_LABEL_KEYS = [
  "unknown",
  "recordsFound",
  "moreRecords",
  "rankedBy",
  "highestFirst",
  "lowestFirst",
  "bestSource",
  "levelField",
  "typeField",
  "categoryField",
  "questType",
  "bestiaryTab"
];
const INTRO_SIZE = 10;
const FACT_SIZE = 3;
const CLOSE_SIZE = 12;
const HELP_SIZE = 4;
/* The set-answer pools: a real introduction per set category, and a closing remark per set category. */
const SET_LEAD_SIZE = 6;
const SET_CLOSE_SIZE = 4;
/* The one key Argo is allowed to write: its own small record of greetings already shown and the last
   line drawn from each answer pool. Nothing about the conversation itself may go in there. */
const DIALOGUE_KEY = "sao.argo.dialogue";

/* Emoji never appear in Argo's dialogue, in any language. */
const EMOJI = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}\u{200D}]/u;

/* Wording that would expose how Argo is built rather than what she knows. */
const INTERNAL_TERMS = [
  /\{dataset\}/,
  /the Bestiary has no entry/i,
  /no full item record/i,
  /\bsource key\b/i,
  /\bJSON\b/,
  /\biframe\b/i,
  /\bprovider\b/i,
  /\bengine\b/i,
  /sao-argo/i,
  /\bdatabase\b/i,
  /\bquery\b/i,
  /\bfilename\b/i,
  /\bsource files?\b/i
];

function poolKeys(prefix, count) {
  return Array.from({ length: count }, (_value, index) => `${prefix}.${index + 1}`);
}

/* Every dialogue key the response layer can render. */
const ARGO_TEXT_KEYS = [
  "argo.launcherLabel",
  "argo.title",
  "argo.closeLabel",
  "argo.logLabel",
  "argo.inputLabel",
  "argo.inputPlaceholder",
  "argo.sendLabel",
  "argo.dragHint",
  "argo.whoArgo",
  "argo.whoYou",
  ...poolKeys("argo.intro", INTRO_SIZE),
  ...CATEGORIES.flatMap((category) => poolKeys(`argo.lead.${category}`, LEAD_POOL_SIZES[category])),
  ...SET_CATEGORIES.flatMap((category) => poolKeys(`argo.lead.${category}`, SET_LEAD_SIZE)),
  ...CATEGORIES.flatMap((category) => poolKeys(`argo.facts.${category}`, FACT_SIZE)),
  ...poolKeys("argo.close", CLOSE_SIZE),
  ...SET_CATEGORIES.flatMap((category) => poolKeys(`argo.close.${category}`, SET_CLOSE_SIZE)),
  "argo.label.floor",
  "argo.label.level",
  "argo.label.stats",
  "argo.label.craftingLocation",
  "argo.label.craftingResources",
  "argo.label.droppedBy",
  "argo.label.drops",
  "argo.label.spawnArea",
  "argo.label.mobs",
  "argo.label.rewards",
  "argo.label.requirements",
  "argo.label.npc",
  "argo.label.sells",
  "argo.label.quests",
  ...SET_LABEL_KEYS.map((key) => `argo.label.${key}`),
  ...TARGET_LABELS.map((target) => `argo.label.target.${target}`),
  ...Object.entries(NOTE_POOL_SIZES).flatMap(([name, count]) => poolKeys(`argo.note.${name}`, count)),
  ...Object.entries(STATUS_POOL_SIZES).flatMap(([name, count]) => poolKeys(`argo.status.${name}`, count)),
  "argo.status.sourcesAvailable",
  "argo.status.noSources",
  ...poolKeys("argo.help.body", HELP_SIZE),
  "argo.type.item",
  "argo.type.mob",
  "argo.type.boss",
  "argo.type.npc",
  "argo.type.merchant",
  "argo.type.location",
  "argo.type.dungeon",
  "argo.type.quest"
];

/* The pools, as [prefix, size] pairs, for the shape checks below. */
const DIALOGUE_POOLS = [
  ["argo.intro", INTRO_SIZE],
  ...CATEGORIES.map((category) => [`argo.lead.${category}`, LEAD_POOL_SIZES[category]]),
  ...SET_CATEGORIES.map((category) => [`argo.lead.${category}`, SET_LEAD_SIZE]),
  ...CATEGORIES.map((category) => [`argo.facts.${category}`, FACT_SIZE]),
  ["argo.close", CLOSE_SIZE],
  ...SET_CATEGORIES.map((category) => [`argo.close.${category}`, SET_CLOSE_SIZE]),
  ...Object.entries(NOTE_POOL_SIZES).map(([name, count]) => [`argo.note.${name}`, count]),
  ...Object.entries(STATUS_POOL_SIZES).map(([name, count]) => [`argo.status.${name}`, count]),
  ["argo.help.body", HELP_SIZE]
];

/* --- DOM stub -------------------------------------------------------------- */

function matchesSimple(element, simple) {
  const selector = String(simple).trim();
  if (!selector) return false;
  if (selector.startsWith(".")) return element.classList.contains(selector.slice(1));
  if (selector.startsWith("#")) return element.id === selector.slice(1);
  const attribute = selector.match(/^\[([^=\]]+)(?:=['"]?([^'"\]]+)['"]?)?\]$/);
  if (attribute) {
    const value = element.getAttribute(attribute[1]);
    if (value === null) return false;
    return attribute[2] === undefined ? true : value === attribute[2];
  }
  return element.tagName === selector.toUpperCase();
}

function matches(element, selectorList) {
  return String(selectorList)
    .split(",")
    .some((simple) => matchesSimple(element, simple));
}

function createElement(tagName, dom) {
  const listeners = new Map();
  const attributes = new Map();
  const classes = new Set();
  const children = [];

  const element = {
    tagName: String(tagName).toUpperCase(),
    id: "",
    type: "",
    src: "",
    alt: "",
    width: 0,
    height: 0,
    value: "",
    hidden: false,
    tabIndex: 0,
    parentNode: null,
    children,
    style: {},
    rect: null,
    focused: false,
    animations: [],
    captures: [],
    classList: {
      add(...names) {
        names.forEach((name) => classes.add(String(name)));
      },
      remove(...names) {
        names.forEach((name) => classes.delete(String(name)));
      },
      contains(name) {
        return classes.has(String(name));
      }
    },
    get className() {
      return [...classes].join(" ");
    },
    set className(value) {
      classes.clear();
      String(value || "")
        .split(/\s+/)
        .filter(Boolean)
        .forEach((name) => classes.add(name));
    },
    /* textContent behaves as the DOM does: setting it replaces the children with a single text node, and
       reading it returns the text of this element and everything under it. That is what lets a message
       hold inline links - the anchors and the plain text between them - and still read back as one
       string. */
    get textContent() {
      return children.map((child) => child.textContent || "").join("");
    },
    set textContent(value) {
      children.length = 0;
      const text = String(value === undefined || value === null ? "" : value);
      if (text) children.push({ tagName: "#TEXT", textContent: text, parentNode: element });
    },
    setAttribute(name, value) {
      attributes.set(String(name), String(value));
    },
    getAttribute(name) {
      return attributes.has(String(name)) ? attributes.get(String(name)) : null;
    },
    appendChild(child) {
      child.parentNode = element;
      children.push(child);
      return child;
    },
    removeChild(child) {
      const index = children.indexOf(child);
      if (index >= 0) children.splice(index, 1);
      child.parentNode = null;
      return child;
    },
    remove() {
      if (element.parentNode) element.parentNode.removeChild(element);
    },
    addEventListener(type, handler) {
      if (!listeners.has(type)) listeners.set(type, new Set());
      listeners.get(type).add(handler);
    },
    removeEventListener(type, handler) {
      listeners.get(type)?.delete(handler);
    },
    dispatch(type, event = {}) {
      const payload = { type, target: element, currentTarget: element, ...event };
      for (const handler of [...(listeners.get(type) || [])]) handler(payload);
      return payload;
    },
    focus() {
      element.focused = true;
      dom.activeElement = element;
    },
    setPointerCapture(pointerId) {
      element.captures.push(pointerId);
    },
    releasePointerCapture(pointerId) {
      const index = element.captures.indexOf(pointerId);
      if (index >= 0) element.captures.splice(index, 1);
    },
    animate(keyframes, options) {
      element.animations.push({ keyframes, options });
      return { finished: Promise.resolve() };
    },
    closest(selectorList) {
      let node = element;
      while (node) {
        if (matches(node, selectorList)) return node;
        node = node.parentNode;
      }
      return null;
    },
    querySelector(selectorList) {
      return descendants(element).find((child) => matches(child, selectorList)) || null;
    },
    querySelectorAll(selectorList) {
      return descendants(element).filter((child) => matches(child, selectorList));
    },
    getBoundingClientRect() {
      const base = element.rect || {};
      const width = Number(base.width) || 0;
      const height = Number(base.height) || 0;
      const left = base.left !== undefined ? base.left : Number.parseFloat(element.style.left || "0") || 0;
      const top = base.top !== undefined ? base.top : Number.parseFloat(element.style.top || "0") || 0;
      return { left, top, width, height, right: left + width, bottom: top + height };
    }
  };

  /* Browsers without the Web Animations API are simulated by leaving animate() undefined. */
  if (!dom || dom.noAnimate !== true) {
    element.animate = (keyframes, options) => {
      element.animations.push({ keyframes, options });
      return { finished: Promise.resolve() };
    };
  }

  return element;
}

/* Every element below `element`, in document order. */
function descendants(element) {
  const list = [];
  for (const child of element.children) {
    /* Text nodes are not elements, so they never answer a selector or an id lookup - exactly as in the
       real DOM, where `children` holds elements only. */
    if (child.tagName === "#TEXT") continue;
    list.push(child);
    list.push(...descendants(child));
  }
  return list;
}

/* The element children of a node, the way the DOM's own `children` collection reads. */
function elementChildren(element) {
  return (element && element.children ? element.children : []).filter((child) => child.tagName !== "#TEXT");
}

/* --- Timers, translations and small helpers -------------------------------- */

function createTimers() {
  let nextId = 1;
  const pending = new Map();
  return {
    setTimeout(handler, delay) {
      const id = nextId;
      nextId += 1;
      pending.set(id, { handler, delay });
      return id;
    },
    clearTimeout(id) {
      pending.delete(id);
    },
    runAll() {
      const entries = [...pending.values()];
      pending.clear();
      entries.forEach(({ handler }) => handler());
    },
    pendingCount() {
      return pending.size;
    }
  };
}

function flush() {
  return new Promise((resolve) => setImmediate(resolve));
}

function stripComments(source) {
  return String(source)
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:])\/\/.*$/gm, "$1");
}

/* A faithful stand-in for the Stage 2 engine's result object (shared/sao-argo-engine.js). */
function engineResult(overrides) {
  return Object.assign(
    {
      engine: "1.0.0",
      question: "",
      normalizedQuestion: "",
      context: { world: "aincrad", dataset: "current", floor: "floor1", language: "en" },
      sources: {
        bestiary: true,
        equipment: true,
        markers: true,
        mobAreas: true,
        quests: true,
        compendium: false,
        contentTranslations: true
      },
      status: "answer",
      intent: "item",
      shape: "location",
      entity: { id: "item|sticky-ring", type: "item", name: "Sticky Ring", slug: "sticky-ring", recordPresent: true },
      entityType: "item",
      match: { matchedName: "Sticky Ring", matchedAlias: false, score: 1, quality: "exact" },
      candidates: [],
      facts: {},
      dataQuality: { complete: true, notes: [] },
      confidence: { level: "high", score: 1, quality: "exact" },
      clarification: null,
      unsupportedReason: null
    },
    overrides || {}
  );
}

/* Records every call, so a test can prove what the UI asked the engine and with which arguments. */
function createEngineStub(resultOrFactory) {
  const calls = [];
  return {
    calls,
    query(question, context) {
      calls.push({ question, context, argumentCount: arguments.length });
      if (typeof resultOrFactory === "function") return resultOrFactory(question, context);
      return resultOrFactory;
    }
  };
}

/* A stand-in for shared/sao-argo-data-provider.js: it resolves only when the test says so, which is how
   the "records are still being prepared" path is exercised without a browser. */
function createProviderStub(options = {}) {
  let settle = null;
  const pending = new Promise((resolve) => {
    settle = resolve;
  });
  return {
    ensureCalls: 0,
    isReadyCalls: 0,
    datasetHint: options.datasetHint || null,
    ensure() {
      this.ensureCalls += 1;
      return options.immediate ? Promise.resolve({ ready: true }) : pending;
    },
    isReady() {
      this.isReadyCalls += 1;
      return options.ready === true;
    },
    getDatasetHint() {
      return this.datasetHint;
    },
    setDatasetHint(value) {
      this.datasetHint = value;
    },
    settle(value) {
      settle(value || { ready: true });
    }
  };
}

/* Every line of a reply must be dialogue from the shared dictionaries or a line built from facts the
   engine supplied. Reading the dialogue out of the real English dictionary keeps this check honest as
   the pools grow, and proves no game fact can hide inside the wording. */
const DIALOGUE_LINES = (() => {
  const lines = new Set();
  const english = flatten(loadTranslations().en);
  for (const [key, value] of Object.entries(english)) {
    if (typeof value !== "string") continue;
    if (/^argo\.(intro|lead|facts|close|note|status|help|type)\./.test(key)) lines.add(value);
  }
  return lines;
})();

/* A rendered dialogue line is either a dictionary value as written, or a pool line whose placeholders
   were filled in - the collection opener carries {label} and {count}, so the rendered line is not the
   raw value. Facts never match a dialogue template, and a check that drops a fact line still fails
   against the expected list. */
const DIALOGUE_TEMPLATES = (() => {
  const english = flatten(loadTranslations().en);
  const templates = [];
  for (const [key, value] of Object.entries(english)) {
    if (typeof value !== "string" || !/\{\w+\}/.test(value)) continue;
    if (!/^argo\.(intro|lead|facts|close|note|status|help|type)\./.test(key)) continue;
    const escaped = value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\\\{\w+\\\}/g, ".*");
    templates.push(new RegExp(`^${escaped}$`));
  }
  return templates;
})();

function isDialogueLine(line) {
  return DIALOGUE_LINES.has(line) || DIALOGUE_TEMPLATES.some((template) => template.test(line));
}

/* The words of a line that name something: an opener and the transition under it must not share one, or
   the answer reads like a machine filling slots. Function words are ignored, and only the English
   dictionary is compared here (the localized pools are checked by localization-coverage). */
const ECHO_STOP_WORDS = new Set(
  (
    "this that these those there their here what which with have has let lets you your the and for from " +
    "about into just well more some than then them they when where will would could should only over " +
    "under same also very much many come comes like right sure now"
  ).split(/\s+/)
);
function topicWords(text) {
  return new Set(
    String(text)
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((word) => word.length >= 4 && !ECHO_STOP_WORDS.has(word))
  );
}

/* The values of one pool, in order, for the assertions that must not depend on rotation. */
function poolValues(bundle, prefix, size) {
  const flat = flatten(bundle);
  return poolKeys(prefix, size).map((key) => flat[key]);
}

function assertHasPoolLine(reply, values, message) {
  const lines = reply.split("\n");
  const found = lines.some((line) => values.includes(line));
  assert.equal(found, true, `${message} (reply: ${JSON.stringify(reply)})`);
}

/* Opens the window, reads the greeting it shows, and closes again - the shape every welcome check
   needs, and the only way a greeting is ever produced. */
function openOnce(harness) {
  harness.api.open();
  const text = harness.messageText(0);
  harness.api.close();
  return text;
}

/* The floor caveat is a pool whose lines carry {floor}, so a check compares against every variant with
   the floor filled in rather than against one hand-picked phrasing. */
function floorNoteValues(floor) {
  return poolValues(loadTranslations().en, "argo.note.floorInferred", NOTE_POOL_SIZES.floorInferred).map((line) =>
    String(line).replace("{floor}", String(floor))
  );
}

function assertOnlyKnownLines(reply, allowedPatterns, message) {
  const unknown = reply
    .split("\n")
    .filter(Boolean)
    .filter((line) => !isDialogueLine(line))
    .filter((line) => !allowedPatterns.some((pattern) => pattern.test(line)));
  assert.deepEqual(unknown, [], `${message} (unexpected lines: ${JSON.stringify(unknown)})`);
}

function flatten(source, prefix = "") {
  const output = {};
  for (const [key, value] of Object.entries(source || {})) {
    const nextKey = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === "object" && !Array.isArray(value)) Object.assign(output, flatten(value, nextKey));
    else output[nextKey] = value;
  }
  return output;
}

/* Reads the real dictionaries out of shared/sao-i18n.js without booting the page. */
function loadTranslations() {
  const source = i18nSource.replace("})(window);", "window.__SAOTranslations = translations;})(window);");
  const context = vm.createContext({
    console,
    window: {},
    document: { addEventListener() {} },
    localStorage: { getItem: () => null, setItem() {} }
  });
  vm.runInNewContext(source, context, { filename: "shared/sao-i18n.js" });
  return context.window.__SAOTranslations || {};
}

/* --- Harness --------------------------------------------------------------- */

/* A tiny deterministic generator (mulberry32). Selection is genuinely random on the page; the harness
   seeds it so every check below repeats exactly, and a check that needs a particular draw installs its
   own source through SAOArgo.setRandomSource(). */
const DEFAULT_SEED = 20240607;
function createSeededRandom(seed) {
  let state = Number(seed) >>> 0;
  if (!state) state = 1;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function createHarness(options = {}) {
  const timers = createTimers();
  const storageCalls = [];
  const documentListeners = new Map();
  const windowListeners = new Map();
  const dom = { activeElement: null, noAnimate: options.withoutAnimation === true };

  const documentStub = {
    readyState: "complete",
    currentScript: { src: "https://example.test/shared/sao-argo.js" },
    body: null,
    createElement: (tagName) => createElement(tagName, dom),
    createTextNode: (value) => ({ tagName: "#TEXT", textContent: String(value), parentNode: null }),
    addEventListener(type, handler) {
      if (!documentListeners.has(type)) documentListeners.set(type, new Set());
      documentListeners.get(type).add(handler);
    },
    removeEventListener(type, handler) {
      documentListeners.get(type)?.delete(handler);
    },
    dispatch(type, event = {}) {
      for (const handler of [...(documentListeners.get(type) || [])]) handler({ type, ...event });
    }
  };
  Object.defineProperty(documentStub, "cookie", {
    get() {
      storageCalls.push("cookie:get");
      return "";
    },
    set(value) {
      storageCalls.push(`cookie:set:${value}`);
    }
  });

  const documentElement = createElement("html", dom);
  const body = createElement("body", dom);
  documentElement.appendChild(body);
  documentStub.body = body;
  documentStub.getElementById = (id) => descendants(documentElement).find((child) => child.id === id) || null;
  documentStub.querySelector = (selector) => documentElement.querySelector(selector);
  documentStub.querySelectorAll = (selector) => documentElement.querySelectorAll(selector);

  const i18n = {
    calls: [],
    t(key) {
      i18n.calls.push(key);
      return options.translatePrefix ? `${options.translatePrefix}${key}` : key;
    },
    getLanguage() {
      return options.language || "en";
    },
    applyTranslations() {}
  };

  /* The shared storage helper (shared/sao-storage.js), reduced to the calls Argo makes: a keyed store
     that records every access, so a check can prove exactly which keys are touched. Passing the same
     `storageValues` object into a second harness is what a page reload looks like. `withoutStorage`
     makes every call throw instead, which is how a blocked or full browser behaves. */
  const storageValues = options.storageValues || {};
  const storageStub = {
    getItem(key) {
      storageCalls.push(`get:${key}`);
      if (options.withoutStorage) throw new Error("storage unavailable");
      return Object.prototype.hasOwnProperty.call(storageValues, String(key)) ? storageValues[String(key)] : null;
    },
    setItem(key, value) {
      storageCalls.push(`set:${key}`);
      if (options.withoutStorage) throw new Error("storage unavailable");
      storageValues[String(key)] = String(value);
    },
    removeItem(key) {
      storageCalls.push(`remove:${key}`);
      if (options.withoutStorage) throw new Error("storage unavailable");
      delete storageValues[String(key)];
    },
    getJSON(key, fallbackValue) {
      storageCalls.push(`getJSON:${key}`);
      if (options.withoutStorage) throw new Error("storage unavailable");
      const raw = storageStub.getItem(key);
      if (raw === null) return fallbackValue;
      try {
        return JSON.parse(raw);
      } catch (_error) {
        return fallbackValue;
      }
    },
    setJSON(key, value) {
      storageCalls.push(`setJSON:${key}`);
      if (options.withoutStorage) throw new Error("storage unavailable");
      storageStub.setItem(key, JSON.stringify(value));
    }
  };

  const globals = {
    console,
    URL,
    URLSearchParams,
    document: documentStub,
    SAOI18n: i18n,
    SAOStorage: storageStub,
    localStorage: storageStub,
    innerWidth: options.width || 1000,
    innerHeight: options.height || 1000,
    setTimeout: timers.setTimeout,
    clearTimeout: timers.clearTimeout,
    matchMedia: (query) => ({ matches: options.reducedMotion === true, media: query }),
    addEventListener(type, handler) {
      if (!windowListeners.has(type)) windowListeners.set(type, new Set());
      windowListeners.get(type).add(handler);
    },
    removeEventListener(type, handler) {
      windowListeners.get(type)?.delete(handler);
    },
    dispatch(type, event = {}) {
      for (const handler of [...(windowListeners.get(type) || [])]) handler({ type, ...event });
    }
  };
  /* Browsers without requestAnimationFrame are simulated by leaving it undefined. */
  if (options.withoutAnimationFrame !== true) {
    globals.requestAnimationFrame = (callback) => {
      callback();
      return 1;
    };
  }
  /* The UI reads the engine lazily on submit, so a test can install a stub (or leave it out). */
  if (options.engine !== undefined) globals.SAOArgoEngine = options.engine;
  if (options.provider !== undefined) globals.SAOArgoData = options.provider;
  /* A page that publishes the site's routes (and so can be linked to). The default leaves them out, the
     way Aincrad/Tower Defense does, which is the path Argo has to keep working without. */
  if (options.pageRoutes === true) {
    globals.location = {
      href: options.pageHref || "https://example.test/Aincrad/Bestiary/bestiary.html",
      origin: "https://example.test",
      pathname: "/Aincrad/Bestiary/bestiary.html",
      search: ""
    };
  }
  const context = vm.createContext(globals);
  context.window = context;
  context.globalThis = context;

  if (options.pageRoutes === true) {
    vm.runInContext(pageUtilsSource, context, { filename: "shared/sao-page-utils.js" });
  }
  vm.runInContext(argoSource, context, { filename: "shared/sao-argo.js" });

  const api = context.SAOArgo;
  /* Wording and layout are drawn at random. The harness installs a seeded source so every check below
     repeats exactly; a check that needs a particular draw installs its own. */
  api.setRandomSource(createSeededRandom(options.seed === undefined ? DEFAULT_SEED : options.seed));
  const launcher = documentStub.getElementById("argo-launcher");
  const windowEl = documentStub.getElementById("argo-window");
  const log = windowEl.querySelector(".argo-log");
  launcher.rect = { left: 16, top: 938, width: 46, height: 46 };
  windowEl.rect = { width: 360, height: 420 };

  const harness = {
    api,
    context,
    document: documentStub,
    documentElement,
    i18n,
    launcher,
    windowEl,
    log,
    titlebar: windowEl.querySelector(".argo-titlebar"),
    closeButton: windowEl.querySelector(".argo-close"),
    form: windowEl.querySelector(".argo-form"),
    input: windowEl.querySelector(".argo-input"),
    timers,
    storageCalls,
    storageValues,
    count(id) {
      return descendants(documentElement).filter((child) => child.id === id).length;
    },
    messages() {
      return log.children.filter((child) => child.classList.contains("argo-message"));
    },
    messageText(index) {
      const message = harness.messages()[index];
      return message ? message.querySelector(".argo-message-body").textContent : "";
    },
    spheres() {
      return descendants(documentElement).filter((child) => child.classList.contains("argo-sphere"));
    },
    sphereCount() {
      return harness.spheres().length;
    },
    lastSphere() {
      const list = harness.spheres();
      return list[list.length - 1] || null;
    }
  };
  return harness;
}

/* --- Checks ---------------------------------------------------------------- */

async function run() {
  const results = [];

  /* 1. Creation: one launcher, one window, correct semantics. */
  {
    const h = createHarness();
    assert.equal(h.launcher.tagName, "BUTTON", "the launcher is a real button");
    assert.equal(h.launcher.getAttribute("aria-expanded"), "false", "the closed launcher reports collapsed");
    assert.equal(h.launcher.getAttribute("aria-controls"), "argo-window", "the launcher points at the window");
    assert.ok(h.launcher.getAttribute("aria-label"), "the launcher has an accessible label");
    assert.equal(
      h.launcher.querySelector(".argo-launcher-image").src,
      "https://example.test/assets/images/MoonlitBlackCats.webp",
      "the launcher image resolves from the script's own src"
    );
    assert.equal(h.windowEl.hidden, true, "the window starts hidden");
    assert.equal(h.windowEl.getAttribute("role"), "dialog", "the window is a dialog");
    assert.equal(
      h.windowEl.querySelector(".argo-title").textContent,
      "Argo the Info Broker",
      "the title bar names Argo"
    );
    assert.equal(
      h.windowEl.querySelector(".argo-titlebar-image").src,
      "https://example.test/assets/images/MoonlitBlackCats.webp",
      "the title bar shows the same image"
    );
    assert.equal(
      h.closeButton.getAttribute("aria-label"),
      "Close Argo the Info Broker",
      "the close button is labelled"
    );
    assert.equal(h.log.getAttribute("role"), "log", "the conversation area is a log");
    assert.equal(h.log.getAttribute("aria-live"), "polite", "the conversation area announces politely");
    assert.equal(h.input.getAttribute("aria-label"), "Ask Argo about game information", "the input is labelled");
    assert.ok(h.input.getAttribute("placeholder"), "the input has a placeholder");
    assert.equal(h.form.querySelector(".argo-send").textContent, "Send", "the send control is present");
    assert.equal(h.api.launcherId, "argo-launcher", "the launcher id is part of the public API");
    assert.equal(h.api.windowId, "argo-window", "the window id is part of the public API");

    h.api.init();
    h.api.init();
    assert.equal(h.count("argo-launcher"), 1, "repeated initialization keeps exactly one launcher");
    assert.equal(h.count("argo-window"), 1, "repeated initialization keeps exactly one window");
    results.push("creation-and-idempotency");
  }

  /* 2. Open and close update visibility and accessibility state. */
  {
    const h = createHarness();
    assert.equal(h.api.open(), true, "open() reports success");
    assert.equal(h.api.isOpen(), true, "the window is open");
    assert.equal(h.windowEl.hidden, false, "the open window is not hidden");
    assert.equal(h.windowEl.classList.contains("is-open"), true, "the open animation class is applied");
    assert.equal(h.launcher.getAttribute("aria-expanded"), "true", "the launcher reports expanded");
    assert.equal(h.launcher.classList.contains("is-hidden"), true, "the launcher hides while the window is open");
    assert.equal(h.input.focused, true, "opening focuses the input");
    assert.equal(h.messages().length, 1, "opening shows a single greeting");
    assert.equal(h.messages()[0].classList.contains("is-argo"), true, "the greeting is Argo's");
    assertHasPoolLine(
      h.messageText(0),
      poolValues(loadTranslations().en, "argo.intro", INTRO_SIZE),
      "the greeting invites a question"
    );

    h.api.close();
    await flush();
    assert.equal(h.api.isOpen(), false, "close() closes the window");
    assert.equal(h.windowEl.hidden, true, "the closed window is hidden");
    assert.equal(h.windowEl.classList.contains("is-open"), false, "the open class is removed");
    assert.equal(h.launcher.getAttribute("aria-expanded"), "false", "the launcher reports collapsed again");
    assert.equal(h.launcher.classList.contains("is-hidden"), false, "the launcher is restored");
    assert.equal(h.launcher.focused, true, "closing returns focus to the launcher");
    assert.equal(h.messages().length, 0, "closing clears every message node");
    results.push("open-and-close-state");
  }

  /* 3. Sending, clearing, and a fresh conversation on reopen. */
  {
    const engine = createEngineStub(
      engineResult({
        question: "Where can I find Spider Silk?",
        facts: { item: "Spider Silk", itemRecordPresent: false, droppedBy: [{ mob: "Forest Spider", chance: 85 }] },
        dataQuality: { complete: false, notes: ["item-record-missing"] },
        entity: { id: "item|spider-silk", type: "item", name: "Spider Silk", slug: "spider-silk", recordPresent: false }
      })
    );
    const h = createHarness({ engine });
    h.api.open();
    h.input.value = "Where can I find Spider Silk?";
    h.form.dispatch("submit", {});
    assert.equal(h.messages().length, 3, "a question adds the user message and one reply");
    assert.match(h.messageText(1), /Spider Silk/, "the visitor's text is shown");
    assert.equal(h.messages()[1].classList.contains("is-user"), true, "the visitor's message is marked as theirs");
    assert.match(h.messageText(2), /Forest Spider/, "the reply carries the engine's documented origin");
    assert.equal(h.input.value, "", "sending clears the input");
    assert.equal(engine.calls.length, 1, "the engine is asked exactly once per question");

    h.form.dispatch("submit", {});
    assert.equal(h.messages().length, 3, "an empty submit adds nothing");
    assert.equal(engine.calls.length, 1, "an empty submit never reaches the engine");

    h.api.close();
    await flush();
    assert.equal(h.input.value, "", "closing clears the input");
    assert.equal(h.messages().length, 0, "closing clears the conversation");

    h.api.open();
    assert.equal(h.messages().length, 1, "reopening starts a fresh conversation");
    assertHasPoolLine(
      h.messageText(0),
      poolValues(loadTranslations().en, "argo.intro", INTRO_SIZE),
      "the fresh conversation shows the greeting"
    );
    assert.equal(engine.calls.length, 1, "opening the window never queries the engine");
    results.push("conversation-clearing");
  }

  /* 4. The closing sphere travels from the live window box to the live launcher box. */
  {
    const h = createHarness();
    h.api.open();
    assert.equal(h.sphereCount(), 0, "no sphere exists while the window is open");
    h.api.close();
    assert.equal(h.sphereCount(), 1, "closing creates the travel sphere");
    const { keyframes, options } = h.lastSphere().animations[0];
    const windowRect = h.windowEl.getBoundingClientRect();
    const launcherRect = h.launcher.getBoundingClientRect();
    const expectedFrom = `translate(${windowRect.left + windowRect.width / 2 - 10}px, ${windowRect.top + windowRect.height / 2 - 10}px) scale(1)`;
    const expectedTo = `translate(${launcherRect.left + launcherRect.width / 2 - 10}px, ${launcherRect.top + launcherRect.height / 2 - 10}px) scale(0.6)`;
    assert.equal(keyframes[0].transform, expectedFrom, "the sphere starts at the window's centre");
    assert.equal(keyframes[1].transform, expectedTo, "the sphere ends at the launcher's centre");
    assert.ok(options.duration > 0 && options.duration <= 400, "the travel stays brief");
    await flush();
    assert.equal(h.sphereCount(), 0, "the sphere is removed once the travel settles");
    assert.equal(h.windowEl.hidden, true, "the window hides after the travel");
    assert.equal(h.launcher.classList.contains("is-hidden"), false, "the launcher is available again");
    results.push("closing-sphere-uses-live-boxes");
  }

  /* 5. A dragged window still animates from its real position. */
  {
    const h = createHarness();
    h.api.open();
    const startLeft = h.windowEl.getBoundingClientRect().left;
    const startTop = h.windowEl.getBoundingClientRect().top;
    h.titlebar.dispatch("pointerdown", {
      target: h.titlebar,
      pointerId: 1,
      pointerType: "mouse",
      button: 0,
      clientX: 100,
      clientY: 100
    });
    h.titlebar.dispatch("pointermove", { pointerId: 1, clientX: 320, clientY: 140 });
    h.titlebar.dispatch("pointerup", { pointerId: 1 });
    const moved = h.windowEl.getBoundingClientRect();
    assert.equal(moved.left, startLeft + 220, "the title bar drags the window horizontally");
    assert.equal(moved.top, startTop + 40, "the title bar drags the window vertically");

    h.api.close();
    const { keyframes } = h.lastSphere().animations[0];
    const expectedFrom = `translate(${moved.left + moved.width / 2 - 10}px, ${moved.top + moved.height / 2 - 10}px) scale(1)`;
    assert.equal(
      keyframes[0].transform,
      expectedFrom,
      "the sphere starts from the dragged position, not a default one"
    );
    await flush();
    results.push("closing-sphere-after-drag");
  }

  /* 6. Dragging starts only from the title bar. */
  {
    const h = createHarness();
    h.api.open();
    const startLeft = h.windowEl.getBoundingClientRect().left;

    h.closeButton.dispatch("pointerdown", {
      target: h.closeButton,
      pointerId: 3,
      pointerType: "mouse",
      button: 0,
      clientX: 10,
      clientY: 10
    });
    h.titlebar.dispatch("pointermove", { pointerId: 3, clientX: 400, clientY: 400 });
    assert.equal(h.windowEl.getBoundingClientRect().left, startLeft, "a press on the close button never starts a drag");
    assert.equal(h.api.isOpen(), true, "a press on the close button does not close the window");

    h.input.dispatch("pointerdown", {
      target: h.input,
      pointerId: 9,
      pointerType: "mouse",
      button: 0,
      clientX: 10,
      clientY: 10
    });
    h.titlebar.dispatch("pointermove", { pointerId: 9, clientX: 400, clientY: 400 });
    assert.equal(h.windowEl.getBoundingClientRect().left, startLeft, "a press on the input never starts a drag");

    h.titlebar.dispatch("pointerdown", {
      target: h.titlebar,
      pointerId: 4,
      pointerType: "mouse",
      button: 0,
      clientX: 10,
      clientY: 10
    });
    h.titlebar.dispatch("pointermove", { pointerId: 4, clientX: 60, clientY: 60 });
    assert.equal(h.windowEl.getBoundingClientRect().left, startLeft + 50, "the title bar itself drags");
    h.titlebar.dispatch("pointerup", { pointerId: 4 });
    h.titlebar.dispatch("pointermove", { pointerId: 4, clientX: 500, clientY: 500 });
    assert.equal(h.windowEl.getBoundingClientRect().left, startLeft + 50, "the drag ends on pointer up");

    h.titlebar.dispatch("pointerdown", {
      target: h.titlebar,
      pointerId: 6,
      pointerType: "mouse",
      button: 2,
      clientX: 10,
      clientY: 10
    });
    h.titlebar.dispatch("pointermove", { pointerId: 6, clientX: 300, clientY: 300 });
    assert.equal(
      h.windowEl.getBoundingClientRect().left,
      startLeft + 50,
      "a secondary mouse button never starts a drag"
    );
    results.push("drag-starts-only-on-titlebar");
  }

  /* 7. Movement is clamped inside the viewport. */
  {
    const h = createHarness({ width: 1000, height: 1000 });
    h.api.open();
    h.titlebar.dispatch("pointerdown", {
      target: h.titlebar,
      pointerId: 5,
      pointerType: "mouse",
      button: 0,
      clientX: 0,
      clientY: 0
    });
    h.titlebar.dispatch("pointermove", { pointerId: 5, clientX: -900, clientY: -900 });
    assert.equal(h.windowEl.getBoundingClientRect().left, 8, "the window cannot leave the left edge");
    assert.equal(h.windowEl.getBoundingClientRect().top, 8, "the window cannot leave the top edge");
    h.titlebar.dispatch("pointermove", { pointerId: 5, clientX: 5000, clientY: 5000 });
    assert.equal(h.windowEl.getBoundingClientRect().left, 1000 - 360 - 8, "the window cannot leave the right edge");
    assert.equal(h.windowEl.getBoundingClientRect().top, 1000 - 420 - 8, "the window cannot leave the bottom edge");
    h.titlebar.dispatch("pointerup", { pointerId: 5 });

    /* A resize re-clamps a window that is now outside the smaller viewport. */
    h.context.innerWidth = 500;
    h.context.innerHeight = 600;
    h.context.dispatch("resize", {});
    assert.equal(
      h.windowEl.getBoundingClientRect().left,
      500 - 360 - 8,
      "a resize pulls the window back in from the right"
    );
    assert.equal(
      h.windowEl.getBoundingClientRect().top,
      600 - 420 - 8,
      "a resize pulls the window back in from the bottom"
    );
    results.push("viewport-clamping");
  }

  /* 8. Keyboard movement, including the larger Shift step. */
  {
    const h = createHarness();
    h.api.open();
    const start = h.windowEl.getBoundingClientRect();
    h.titlebar.dispatch("keydown", { key: "ArrowRight" });
    assert.equal(h.windowEl.getBoundingClientRect().left, start.left + 16, "an arrow key nudges the window");
    h.titlebar.dispatch("keydown", { key: "ArrowDown", shiftKey: true });
    assert.equal(h.windowEl.getBoundingClientRect().top, start.top + 48, "Shift moves the window further");
    h.titlebar.dispatch("keydown", { key: "ArrowLeft", shiftKey: true });
    assert.equal(
      h.windowEl.getBoundingClientRect().left,
      Math.max(8, start.left + 16 - 48),
      "Shift also works on the other axis"
    );
    results.push("keyboard-movement");
  }

  /* 9. Escape closes and returns focus. */
  {
    const h = createHarness();
    h.api.open();
    h.document.dispatch("keydown", { key: "Escape" });
    await flush();
    assert.equal(h.api.isOpen(), false, "Escape closes the window");
    assert.equal(h.windowEl.hidden, true, "Escape hides the window");
    assert.equal(h.launcher.focused, true, "Escape returns focus to the launcher");

    h.document.dispatch("keydown", { key: "Escape" });
    assert.equal(h.api.isOpen(), false, "Escape on a closed window does nothing");
    results.push("escape-closes");
  }

  /* 10. Reduced motion closes immediately with no travel. */
  {
    const h = createHarness({ reducedMotion: true });
    h.api.open();
    h.api.close();
    assert.equal(h.sphereCount(), 0, "reduced motion creates no sphere");
    assert.equal(h.windowEl.hidden, true, "reduced motion hides the window immediately");
    assert.equal(h.api.isClosing(), false, "reduced motion leaves no close in progress");
    assert.equal(h.launcher.classList.contains("is-hidden"), false, "the launcher is restored");
    assert.equal(h.messages().length, 0, "the conversation is still cleared");
    results.push("reduced-motion-close");
  }

  /* 11. Rapid clicks and interrupted animations cannot wedge the UI. */
  {
    const h = createHarness();
    h.api.open();
    h.api.close();
    assert.equal(h.api.isClosing(), true, "the window reports that it is closing");
    assert.equal(h.api.open(), true, "re-opening during the close animation opens");
    await flush();
    assert.equal(h.api.isOpen(), true, "the window is open after the interrupted close");
    assert.equal(h.windowEl.hidden, false, "the window is visible after the interrupted close");
    assert.equal(h.sphereCount(), 0, "no sphere is left behind by the interruption");

    h.api.close();
    assert.equal(h.api.close(), false, "a second close is ignored while closing");
    await flush();
    assert.equal(h.api.isOpen(), false, "the window ends closed");
    assert.equal(h.sphereCount(), 0, "the sphere is always cleaned up");
    assert.equal(h.windowEl.hidden, true, "the window ends hidden");

    h.api.toggle();
    assert.equal(h.api.isOpen(), true, "toggle() opens");
    h.api.toggle();
    await flush();
    assert.equal(h.api.isOpen(), false, "toggle() closes");
    results.push("rapid-clicks-and-interruptions");
  }

  /* 12. A browser without the Web Animations API still closes cleanly. */
  {
    const h = createHarness({ withoutAnimation: true, withoutAnimationFrame: true });
    h.api.open();
    assert.equal(h.windowEl.hidden, false, "the window still opens without requestAnimationFrame");
    h.api.close();
    assert.equal(h.sphereCount(), 1, "the fallback path still shows the travel sphere");
    assert.equal(h.api.isClosing(), true, "the fallback waits for its own timer");
    h.timers.runAll();
    assert.equal(h.sphereCount(), 0, "the fallback path cleans the sphere up");
    assert.equal(h.api.isClosing(), false, "the fallback path completes the close");
    assert.equal(h.windowEl.hidden, true, "the fallback path hides the window");
    results.push("closing-fallback");
  }

  /* 13. The conversation is never persisted: the only storage Argo touches is its own small dialogue
     record, under one key, and the module still makes no network call of any kind. */
  {
    const h = createHarness();
    h.api.open();
    h.input.value = "Where can I find Ice Spirit?";
    h.form.dispatch("submit", {});
    h.api.close();
    await flush();
    h.api.open();
    h.api.close();
    await flush();

    assert.ok(h.storageCalls.length > 0, "opening the window remembers the greeting it just showed");
    assert.deepEqual(
      h.storageCalls.filter((call) => !call.endsWith(`:${DIALOGUE_KEY}`)),
      [],
      "and touches nothing else in storage, cookies or the session"
    );
    assert.deepEqual(Object.keys(h.storageValues), [DIALOGUE_KEY], "exactly one key is ever written");
    const stored = String(h.storageValues[DIALOGUE_KEY] || "");
    assert.equal(stored.includes("Ice Spirit"), false, "no question is stored");
    assert.equal(/\{\s*"text"/.test(stored), false, "no message is stored");

    const executable = stripComments(argoSource);
    assert.equal(
      /localStorage|sessionStorage|indexedDB|document\.cookie|fetch\(|XMLHttpRequest|sendBeacon/.test(executable),
      false,
      "the module contains no persistence or network calls of its own"
    );
    /* The single key it does write goes through the site's shared storage helper, never the raw APIs. */
    assert.equal(executable.includes("SAOStorage"), true, "the dialogue record goes through the shared storage layer");
    results.push("no-persistence");
  }

  /* 14. Localized labels are used when the i18n layer provides them. */
  {
    const h = createHarness({ translatePrefix: "T:" });
    assert.equal(h.launcher.getAttribute("aria-label"), "T:argo.launcherLabel", "the launcher label comes from i18n");
    assert.equal(h.windowEl.querySelector(".argo-title").textContent, "T:argo.title", "the title comes from i18n");
    assert.equal(h.input.getAttribute("placeholder"), "T:argo.inputPlaceholder", "the placeholder comes from i18n");
    assert.equal(h.form.querySelector(".argo-send").textContent, "T:argo.sendLabel", "the send label comes from i18n");
    h.api.open();
    assert.match(h.messageText(0), /T:argo\.intro\./, "the greeting comes from i18n");
    const firstGreeting = h.messageText(0);
    h.document.dispatch("sao:languagechange", {});
    assert.equal(h.messageText(0), firstGreeting, "a language change re-renders the same greeting variant");
    results.push("localized-labels");
  }

  /* 15. The Welcome Mat no longer carries Argo: no launcher step, no Argo script, no Argo stylesheet. */
  {
    const block = indexSource.slice(indexSource.indexOf("const buildWalkthroughSteps = () => ["));
    const steps = block.slice(0, block.indexOf("];"));
    assert.equal((steps.match(/selector:/g) || []).length, 5, "the hub walkthrough is back to five steps");
    assert.equal(steps.includes("argo"), false, "no Argo step is left in the hub walkthrough");
    assert.equal(indexSource.includes("SAOArgo"), false, "the Welcome Mat never reaches for Argo");
    assert.equal(indexSource.includes("sao-argo"), false, "the Welcome Mat loads no Argo asset at all");
    results.push("welcome-mat-without-argo");
  }

  /* 16. Every Argo string exists in all three supported languages. */
  {
    const bundles = loadTranslations();
    const en = flatten(bundles.en);
    const es = flatten(bundles.es);
    const fr = flatten(bundles.fr);
    for (const key of ARGO_TEXT_KEYS) {
      for (const [language, flat] of [
        ["en", en],
        ["es", es],
        ["fr", fr]
      ]) {
        assert.equal(typeof flat[key], "string", `${language} is missing ${key}`);
        assert.ok(String(flat[key]).trim().length > 0, `${language} has an empty value for ${key}`);
      }
    }
    assert.notEqual(es["argo.title"], en["argo.title"], "the Spanish title is translated");
    assert.notEqual(fr["argo.title"], en["argo.title"], "the French title is translated");
    assert.notEqual(es["argo.inputPlaceholder"], en["argo.inputPlaceholder"], "the Spanish placeholder is translated");
    assert.notEqual(fr["argo.sendLabel"], en["argo.sendLabel"], "the French send label is translated");
    assert.notEqual(es["argo.label.floor"], en["argo.label.floor"], "the Spanish floor label is translated");
    /* The removed walkthrough strings must not linger in the dictionaries. */
    assert.equal(
      Object.keys(en).filter((key) => key.startsWith("ui.walkthrough.argo")).length,
      0,
      "the Argo walkthrough strings are gone"
    );

    /* Every dialogue pool holds the number of lines the module declares, every line is a distinct
       sentence, and no line is shared between pools (no template with a swapped word). */
    const owners = new Map();
    for (const [prefix, size] of DIALOGUE_POOLS) {
      const keys = poolKeys(prefix, size);
      const values = keys.map((key) => en[key]);
      assert.equal(new Set(values).size, size, `the ${prefix} pool holds ${size} distinct lines`);
      for (const [index, value] of values.entries()) {
        const key = keys[index];
        assert.equal(typeof value, "string", `${key} is missing`);
        assert.ok(value.trim().length > 0, `${key} is empty`);
        const owner = owners.get(value);
        assert.equal(owner, undefined, `${key} reuses the line of ${owner}`);
        owners.set(value, key);
      }
      /* Localized dialogue is real dialogue: the English line is never copied across. */
      for (const key of keys) {
        assert.notEqual(es[key], en[key], `Spanish is missing a translation for ${key}`);
        assert.notEqual(fr[key], en[key], `French is missing a translation for ${key}`);
      }
      /* The pools are the personality: they must not be filler, and never emoji. */
      for (const key of keys) {
        for (const [language, flat] of [
          ["en", en],
          ["es", es],
          ["fr", fr]
        ]) {
          assert.equal(EMOJI.test(flat[key]), false, `${language} ${key} contains an emoji`);
        }
      }
    }

    /* Player-facing wording never names a dataset token, a source key or any other internals. */
    for (const [prefix, size] of DIALOGUE_POOLS) {
      for (const key of poolKeys(prefix, size)) {
        for (const [language, flat] of [
          ["en", en],
          ["es", es],
          ["fr", fr]
        ]) {
          for (const term of INTERNAL_TERMS) {
            assert.equal(term.test(flat[key]), false, `${language} ${key} exposes an implementation detail (${term})`);
          }
        }
      }
    }

    /* Every rendered key has an English fallback in the module itself. */
    for (const key of ARGO_TEXT_KEYS) {
      assert.ok(argoSource.includes(`"${key}":`), `shared/sao-argo.js has an English fallback for ${key}`);
    }
    results.push("localization-coverage");
  }

  /* 17. Every intended page loads the module, and the asset/map wiring is in place. */
  {
    /* The Welcome Mat (index.html) is deliberately NOT in this list: Argo was removed from it. */
    const pages = [
      "Aincrad/Bestiary/bestiary.html",
      "Aincrad/Quests/quests.html",
      "Aincrad/eCompendium/ecompendium.html",
      "Aincrad/Map/maps.html",
      "Aincrad/Commands/commands.html",
      "Aincrad/Patchnotes/patchnotes.html",
      "Aincrad/Misc Info/miscinfo.html",
      "Aincrad/Character Build/character-build.html",
      "Fractured Underworld/Main UI/mainui.html",
      "Fractured Underworld/Tower Defense/towerdefense.html",
      "Fractured Underworld/Compendium/compendium.html"
    ];
    for (const page of pages) {
      const source = fs.readFileSync(path.join(root, page), "utf8");
      assert.ok(source.includes("shared/sao-argo.css"), `${page} links the Argo stylesheet`);
      assert.ok(source.includes("shared/sao-argo.js"), `${page} loads the Argo module`);
      assert.ok(source.includes("shared/sao-argo-engine.js"), `${page} loads the answer engine`);
      assert.ok(source.includes("shared/sao-argo-data-provider.js"), `${page} loads the cross-page provider`);
      /* Compare the script tags themselves: a comment elsewhere in the page may mention the files. */
      const engineTag = source.indexOf('shared/sao-argo-engine.js"></script>');
      const providerTag = source.indexOf('shared/sao-argo-data-provider.js"></script>');
      const windowTag = source.indexOf('shared/sao-argo.js"></script>');
      assert.ok(
        engineTag > -1 && providerTag > -1 && windowTag > -1 && engineTag < providerTag && providerTag < windowTag,
        `${page} loads the engine and the provider before the window that uses them`
      );
    }
    const welcomeMat = fs.readFileSync(path.join(root, "index.html"), "utf8");
    assert.equal(welcomeMat.includes("sao-argo"), false, "the Welcome Mat loads no Argo asset");
    assert.equal(welcomeMat.includes("SAOArgo"), false, "the Welcome Mat never reaches for Argo");

    assert.ok(argoCss.includes("#argo-launcher"), "the launcher styles exist");
    assert.ok(argoCss.includes("border-radius: 50%"), "the circular crop is CSS-only");
    assert.ok(argoCss.includes("#argo-window[hidden]"), "the closed window is explicitly hidden");
    assert.ok(argoCss.includes("prefers-reduced-motion"), "reduced motion is respected in CSS");
    assert.ok(argoCss.includes(".argo-sphere"), "the travel sphere is styled");
    assert.ok(argoSource.includes('"../assets/images/MoonlitBlackCats.webp"'), "the shared asset path is used");
    assert.ok(argoSource.includes("currentScript"), "the asset path derives from the script's own src");
    assert.ok(mapUiCss.includes("body #argo-launcher"), "the map pages lift the launcher clear of the zoom bar");
    assert.ok(
      fs.existsSync(path.join(root, "assets", "images", "MoonlitBlackCats.webp")),
      "the shared guild image exists"
    );
    results.push("page-wiring-and-assets");
  }

  /* 18. Successful answers render exactly the facts the engine supplied, per intent. */
  {
    const fixtures = {
      item: engineResult({
        facts: {
          name: "Sticky Ring",
          record: {
            category: "accessory",
            level: 5,
            set: "Little Slime Set",
            description: "A ring coated in a slimy layer; Hardly elegant, but surprising",
            stats: { Defense: "+1", Health: "+2" },
            craftingResources: [{ item: "Slime Jelly", itemId: "slime-jelly", amount: 12 }],
            craftingLocation: "Secret Sticky Ring Merchant",
            floor: "floor1",
            dataset: "current"
          },
          droppedBy: [],
          craftingLocationMarker: { id: "sticky", title: "Secret Sticky Ring Merchant", coords: { x: 390, z: 3064 } }
        }
      }),
      mobDrops: engineResult({
        intent: "mobDrops",
        entity: { id: "mob|forest-spider", type: "mob", name: "Forest Spider", recordPresent: true },
        entityType: "mob",
        facts: { mob: "Forest Spider", bestiaryTab: "regular", xp: null, drops: [{ item: "Spider Silk", chance: 85 }] }
      }),
      recipe: engineResult({
        intent: "recipe",
        entity: { id: "item|curved-bow", type: "item", name: "Curved Bow", recordPresent: true },
        facts: {
          item: "Curved Bow",
          craftingResources: [{ item: "Col", amount: 100 }],
          craftingLocation: "Equipment Merchant",
          craftingLocationMarker: null
        },
        dataQuality: { complete: false, notes: ["merchant-marker-not-found"] }
      }),
      npc: engineResult({
        intent: "npc",
        entity: { id: "merchant|alchemist", type: "merchant", name: "Alchemist", recordPresent: true },
        entityType: "merchant",
        facts: {
          name: "Alchemist",
          markers: [{ id: "alchemist-1", title: "Alchemist", coords: { x: 1772, z: 4096 }, description: "Alchemist" }],
          requests: [],
          appearsIn: [],
          sells: [{ item: "Health Potion" }]
        }
      }),
      quest: engineResult({
        intent: "quest",
        entity: { id: "quest|a-new-world", type: "quest", name: "A New World", recordPresent: true },
        entityType: "quest",
        facts: {
          name: "A New World",
          quests: [
            {
              id: "mq-1",
              questName: "A New World",
              questNumber: 1,
              npcName: "Mysterious Character",
              coordinates: "0 / 5",
              requirements: "Talk to the Mysterious Character (0, 200, 5)",
              xpReward: null,
              colReward: null,
              bonusItems: null
            }
          ],
          markers: [{ id: "mq-1", title: "A New World", coords: { x: 2, z: 17 } }]
        }
      }),
      location: engineResult({
        intent: "location",
        entity: { id: "location|snow-citadel", type: "location", name: "Snow Citadel", recordPresent: true },
        entityType: "location",
        facts: {
          name: "Snow Citadel",
          markers: [
            {
              id: "snow-citadel",
              title: "Snow Citadel",
              coords: { x: 3994, z: 2010 },
              description: "A frozen citadel."
            }
          ],
          areas: [{ id: "snow-citadel-mobs", title: "Snow Citadel" }],
          mobs: [{ mob: "Ice Spiritist" }]
        }
      })
    };
    const routes = [
      [/sticky ring/i, fixtures.item],
      [/drop/i, fixtures.mobDrops],
      [/craft/i, fixtures.recipe],
      [/alchemist/i, fixtures.npc],
      [/new world/i, fixtures.quest],
      [/snow citadel/i, fixtures.location]
    ];
    const engine = createEngineStub((question) => {
      const route = routes.find(([pattern]) => pattern.test(question));
      return route ? route[1] : engineResult();
    });
    const h = createHarness({ engine });
    h.api.open();
    const english = loadTranslations().en;
    const ask = (question) => {
      h.input.value = question;
      h.form.dispatch("submit", {});
      return h.messageText(h.messages().length - 1);
    };

    const itemReply = ask("where can i buy the sticky ring");
    assert.match(itemReply, /Sticky Ring/);
    assert.match(itemReply, /Accessory/, "the dataset category is rendered as a readable label");
    assert.match(itemReply, /Lv 5/);
    assert.match(itemReply, /Little Slime Set/);
    assert.match(itemReply, /Stats: Defense \+1 · Health \+2/);
    assert.match(itemReply, /Crafting resources: Slime Jelly x12/);
    assert.match(itemReply, /Crafting location: Secret Sticky Ring Merchant \(X: 390 Z: 3064\)/);
    assertOnlyKnownLines(
      itemReply,
      [
        /Sticky Ring/,
        /Accessory/,
        /A ring coated in a slimy layer/,
        /^Stats: /,
        /^Crafting resources: /,
        /^Crafting location: /
      ],
      "the item answer only contains supplied facts"
    );
    const dropsReply = ask("what does forest spider drop");
    assert.match(dropsReply, /Forest Spider/);
    assert.match(dropsReply, /Drops: Spider Silk \(85%\)/);
    assertOnlyKnownLines(
      dropsReply,
      [/Forest Spider/, /Regular/, /^Drops: /],
      "the mob-drop answer only contains supplied facts"
    );

    const recipeReply = ask("how do i craft curved bow");
    assert.match(recipeReply, /Curved Bow/);
    assert.match(recipeReply, /Crafting resources: Col x100/);
    assert.match(recipeReply, /Crafting location: Equipment Merchant/);
    assertHasPoolLine(
      recipeReply,
      poolValues(english, "argo.note.markerNotFound", NOTE_POOL_SIZES.markerNotFound),
      "the missing-marker note is explained"
    );

    const npcReply = ask("where is the alchemist");
    assert.match(npcReply, /Alchemist/);
    assert.match(npcReply, /Coordinates: X: 1772 Z: 4096/);
    assert.match(npcReply, /Sells: Health Potion/);

    const questReply = ask("where is a new world");
    assert.match(questReply, /1\. A New World/);
    assert.match(questReply, /NPC: Mysterious Character/);
    assert.match(questReply, /Coordinates: 0 \/ 5/);
    assert.match(questReply, /Requirements: Talk to the Mysterious Character \(0, 200, 5\)/);
    assert.match(questReply, /Coordinates: X: 2 Z: 17/);
    assert.equal(/Rewards/.test(questReply), false, "absent rewards are not invented");

    const locationReply = ask("where is snow citadel");
    assert.match(locationReply, /Snow Citadel/);
    assert.match(locationReply, /Coordinates: X: 3994 Z: 2010/);
    assert.match(locationReply, /Spawn area: Snow Citadel/);
    assert.match(locationReply, /Mobs: Ice Spiritist/);
    assert.equal(/Drops:/.test(locationReply), false, "a spawn area is never rendered as a drop list");

    /* A repeated question carries the same facts. An item answer can present them in either of its two
       reading orders, so the fact lines are compared as a multiset rather than as a sequence: that is
       still proof that no fact was added, dropped or duplicated by the layout. */
    const itemAgain = ask("where can i buy the sticky ring");
    const factsOf = (reply) => reply.split("\n").filter((line) => line && !isDialogueLine(line));
    assert.deepEqual(
      factsOf(itemAgain).slice().sort(),
      factsOf(itemReply).slice().sort(),
      "a repeated question returns the same facts, whatever order they are read in"
    );
    assert.notEqual(itemAgain, itemReply, "the wording and the reading order vary between answers");
    results.push("engine-answer-rendering");
  }

  /* 19. Ambiguous, missing, unsupported and unavailable-source paths. */
  {
    const engine = createEngineStub((question) => {
      if (/slime/i.test(question)) {
        const options = [
          { id: "mob|small-slime", type: "mob", name: "Small Slime" },
          { id: "item|slime-jelly", type: "item", name: "Slime Jelly" },
          { id: "mob|slime-warrior", type: "mob", name: "Slime Warrior" }
        ];
        return engineResult({
          status: "ambiguous",
          intent: "unknown",
          entity: null,
          entityType: null,
          facts: {},
          candidates: options,
          clarification: { reason: "multiple-matches", options },
          confidence: { level: "low", score: 0.7, quality: "partial" },
          dataQuality: { complete: false, notes: ["ambiguous-question"] }
        });
      }
      if (/spider silk/i.test(question)) {
        return engineResult({
          status: "missing",
          intent: "item",
          entity: { id: "item|spider-silk", type: "item", name: "Spider Silk", recordPresent: false },
          facts: {
            name: "Spider Silk",
            record: null,
            droppedBy: [{ mob: "Forest Spider", chance: 85 }],
            craftingLocationMarker: null
          },
          dataQuality: { complete: false, notes: ["item-record-missing", "origins-listed-in-bestiary"] }
        });
      }
      if (/unicorn/i.test(question)) {
        return engineResult({
          status: "unsupported",
          intent: "unknown",
          entity: null,
          facts: {},
          unsupportedReason: "no-entity-match",
          dataQuality: { complete: false, notes: ["absence-is-not-proof"] }
        });
      }
      if (/drake/i.test(question)) {
        return engineResult({
          status: "missing",
          intent: "mob",
          entity: { id: "mob|drake", type: "mob", name: "Drake", recordPresent: false },
          facts: { name: "Drake", bestiary: null, drops: [], spawnAreas: [], markers: [], quests: [] },
          sources: {
            bestiary: true,
            equipment: false,
            markers: false,
            mobAreas: false,
            quests: false,
            compendium: false,
            contentTranslations: true
          },
          dataQuality: { complete: false, notes: ["bestiary-record-missing"] }
        });
      }
      return engineResult({
        status: "unsupported",
        intent: "unknown",
        entity: null,
        facts: {},
        unsupportedReason: "no-supported-question",
        dataQuality: { complete: false, notes: ["absence-is-not-proof", "unsupported-question-shape"] }
      });
    });
    const h = createHarness({ engine });
    h.api.open();
    const ask = (question) => {
      h.input.value = question;
      h.form.dispatch("submit", {});
      return h.messageText(h.messages().length - 1);
    };

    /* Ambiguous: the real candidates are offered and none is chosen. */
    const english = loadTranslations().en;
    const ambiguous = ask("where is the slime");
    assertHasPoolLine(
      ambiguous,
      poolValues(english, "argo.status.ambiguous", STATUS_POOL_SIZES.ambiguous),
      "an ambiguous question gets one of the ambiguous outcome lines"
    );
    assertHasPoolLine(
      ambiguous,
      poolValues(english, "argo.status.candidates", STATUS_POOL_SIZES.candidates),
      "and a label for the candidate list"
    );
    assert.match(ambiguous, /Small Slime \(Mob\)/);
    assert.match(ambiguous, /Slime Jelly \(Item\)/);
    assert.match(ambiguous, /Slime Warrior \(Mob\)/);
    assert.equal(/Stats:|Drops:|Coordinates:/.test(ambiguous), false, "no facts are offered for an ambiguous match");

    /* Missing: the found name, the documented origin and the honest limitation. */
    const missing = ask("what is spider silk");
    assertHasPoolLine(
      missing,
      poolValues(english, "argo.status.missing", STATUS_POOL_SIZES.missing),
      "a partly-known answer says so in character"
    );
    assert.match(missing, /Spider Silk/);
    assert.match(missing, /Dropped by: Forest Spider \(85%\)/);
    assertHasPoolLine(
      missing,
      poolValues(english, "argo.note.itemRecordMissing", NOTE_POOL_SIZES.itemRecordMissing),
      "the thin record is admitted in plain language"
    );
    assert.equal(
      /Current Data|Bestiary has no entry|dataset/i.test(missing),
      false,
      "the missing-record note never names the data behind it"
    );
    assert.equal(/invented|assumed|probably/.test(missing), false, "missing data is never guessed");

    /* Missing because a source is not loaded on this page: say so. */
    const partial = ask("where is the drake");
    assertHasPoolLine(
      partial,
      poolValues(english, "argo.note.bestiaryRecordMissing", NOTE_POOL_SIZES.bestiaryRecordMissing),
      "a record with nothing behind it is admitted honestly"
    );
    assert.match(partial, /On this page I can only see: Bestiary\./, "the unavailable sources are named honestly");

    /* Unsupported: a friendly redirect and no fabricated facts. */
    const unrelated = ask("what is the weather in tokyo");
    assertHasPoolLine(
      unrelated,
      poolValues(english, "argo.status.unsupported", STATUS_POOL_SIZES.unsupported),
      "an unsupported question is turned down in character"
    );
    assertHasPoolLine(
      unrelated,
      poolValues(english, "argo.help.body", HELP_SIZE),
      "the redirect lists the supported topics"
    );
    assert.equal(/Tokyo|sunny|forecast/i.test(unrelated), false, "an unrelated question is never answered");

    /* Unsupported but game-shaped: the absence-is-not-proof caveat is included. */
    const unknownEntity = ask("where is the fluffy unicorn of doom");
    assertHasPoolLine(
      unknownEntity,
      poolValues(english, "argo.note.absenceNotProof", NOTE_POOL_SIZES.absenceNotProof),
      "a game-shaped miss keeps the absence-is-not-proof caveat"
    );
    assertHasPoolLine(unknownEntity, poolValues(english, "argo.help.body", HELP_SIZE), "and still offers the topics");

    /* The UI passes no world or floor context of its own: the engine resolves those itself. */
    assert.ok(engine.calls.length >= 5, "the engine was consulted for each question");
    assert.deepEqual(
      engine.calls.map((call) => call.argumentCount),
      engine.calls.map(() => 1),
      "without a provider hint the UI passes no context at all"
    );
    assert.deepEqual(
      engine.calls.map((call) => call.context),
      engine.calls.map(() => undefined)
    );
    assert.deepEqual(
      h.storageCalls.filter((call) => !call.endsWith(`:${DIALOGUE_KEY}`)),
      [],
      "answering questions touches nothing but Argo's own dialogue record"
    );
    results.push("engine-status-paths");
  }

  /* 20. A missing or failing engine never breaks the window or leaks internals. */
  {
    /* No engine at all. */
    const withoutEngine = createHarness();
    withoutEngine.api.open();
    withoutEngine.input.value = "where is the alchemist";
    withoutEngine.form.dispatch("submit", {});
    const missingEngineReply = withoutEngine.messageText(withoutEngine.messages().length - 1);
    const english = loadTranslations().en;
    assertHasPoolLine(
      missingEngineReply,
      poolValues(english, "argo.status.engineMissing", STATUS_POOL_SIZES.engineMissing),
      "a page without the engine says so in character"
    );
    assert.equal(withoutEngine.messages().length, 3, "the window still shows one reply");
    assert.equal(withoutEngine.api.isOpen(), true, "the window stays usable without an engine");

    /* An engine that throws. */
    const throwing = createHarness({
      engine: {
        query() {
          throw new Error("SAOArgoEngine blew up at line 42: internal detail");
        }
      }
    });
    throwing.api.open();
    throwing.input.value = "where is the alchemist";
    throwing.form.dispatch("submit", {});
    const errorReply = throwing.messageText(throwing.messages().length - 1);
    assertHasPoolLine(
      errorReply,
      poolValues(english, "argo.status.error", STATUS_POOL_SIZES.error),
      "a failed question gets one of the apology lines"
    );
    assert.equal(/blew up|line 42|internal detail|Error/.test(errorReply), false, "no stack trace or internals leak");
    assert.equal(throwing.messages().length, 3, "a failed question still produces exactly one reply");

    /* An engine that returns nonsense. */
    const nonsense = createHarness({ engine: { query: () => null } });
    nonsense.api.open();
    nonsense.input.value = "where is the alchemist";
    nonsense.form.dispatch("submit", {});
    assertHasPoolLine(
      nonsense.messageText(nonsense.messages().length - 1),
      poolValues(english, "argo.status.error", STATUS_POOL_SIZES.error),
      "nonsense from the engine is reported the same way"
    );
    results.push("engine-failure-paths");
  }

  /* 20b. Question matching is English-shaped, and the window says so on a translated page. */
  {
    const engine = createEngineStub(() =>
      engineResult({
        status: "unsupported",
        intent: "unknown",
        entity: null,
        facts: {},
        unsupportedReason: "no-supported-question",
        dataQuality: { complete: false, notes: ["absence-is-not-proof", "unsupported-question-shape"] }
      })
    );
    const english = createHarness({ engine });
    english.api.open();
    english.input.value = "what is the weather in tokyo";
    english.form.dispatch("submit", {});
    const englishReply = english.messageText(english.messages().length - 1);
    /* The stub returns the key, so the module renders its English fallback: the same pool values the
       English dictionary holds, which is what these assertions compare against. */
    const englishLines = loadTranslations().en;
    const englishOnlyValues = poolValues(englishLines, "argo.note.englishOnly", NOTE_POOL_SIZES.englishOnly);
    assert.equal(
      englishOnlyValues.some((line) => englishReply.includes(line)),
      false,
      "no English-only warning is shown on an English page"
    );

    const spanish = createHarness({ engine, language: "es" });
    spanish.api.open();
    spanish.input.value = "que tiempo hace en tokio";
    spanish.form.dispatch("submit", {});
    const spanishReply = spanish.messageText(spanish.messages().length - 1);
    assert.equal(
      englishOnlyValues.some((line) => spanishReply.includes(line)),
      true,
      "the window is honest about English-shaped question matching on a translated page"
    );
    assertHasPoolLine(
      spanishReply,
      poolValues(englishLines, "argo.help.body", HELP_SIZE),
      "the redirect is still offered"
    );
    results.push("engine-language-limits");
  }

  /* 21. The response layer adds no persistence and no network of its own beyond the dialogue record. */
  {
    const executable = stripComments(argoSource);
    assert.equal(
      /localStorage|sessionStorage|indexedDB|document\.cookie|fetch\(|XMLHttpRequest|sendBeacon/.test(executable),
      false,
      "the window module contains no persistence or network call"
    );
    const h = createHarness({
      engine: createEngineStub(engineResult({ facts: { name: "Sticky Ring", record: null, droppedBy: [] } }))
    });
    h.api.open();
    h.input.value = "what is sticky ring";
    h.form.dispatch("submit", {});
    h.api.close();
    await flush();
    assert.deepEqual(
      h.storageCalls.filter((call) => !call.endsWith(`:${DIALOGUE_KEY}`)),
      [],
      "the whole conversation cycle touches nothing but Argo's own dialogue record"
    );
    assert.equal(
      String(h.storageValues[DIALOGUE_KEY] || "").includes("sticky ring"),
      false,
      "and never the question or the answer"
    );
    results.push("engine-no-persistence");
  }

  /* 22. Cross-page records: the window waits for the provider, and never answers into a closed chat. */
  {
    const engine = createEngineStub(
      engineResult({ facts: { name: "Sticky Ring", record: null, droppedBy: [{ mob: "Small Slime", chance: 30 }] } })
    );

    const provider = createProviderStub();
    const h = createHarness({ engine, provider });
    h.api.open();
    assert.equal(provider.ensureCalls, 1, "opening the window starts preparing the cross-page records");
    assert.equal(h.messages().length, 1, "the greeting is shown straight away");

    h.input.value = "what is sticky ring";
    h.form.dispatch("submit", {});
    assert.equal(h.messages().length, 2, "the question is shown while the records are still being prepared");
    assert.equal(engine.calls.length, 0, "the engine is not asked before the records are ready");

    provider.settle();
    await flush();
    await flush();
    assert.equal(engine.calls.length, 1, "the engine is asked once the records are ready");
    assert.equal(h.messages().length, 3, "the answer arrives after the records are prepared");
    assert.match(h.messageText(2), /Small Slime/, "the answer carries the engine's facts");
    assert.equal(provider.isReadyCalls >= 1, true, "the provider readiness is checked before querying");

    /* An answer that lands after the window closed must not reopen the conversation. */
    const late = createProviderStub();
    const lateHarness = createHarness({ engine, provider: late });
    lateHarness.api.open();
    lateHarness.input.value = "what is sticky ring";
    lateHarness.form.dispatch("submit", {});
    lateHarness.api.close();
    await flush();
    assert.equal(lateHarness.messages().length, 0, "closing clears the conversation while records load");
    late.settle();
    await flush();
    await flush();
    assert.equal(lateHarness.messages().length, 0, "a late answer never lands in a closed conversation");
    lateHarness.api.open();
    await flush();
    assert.equal(lateHarness.messages().length, 1, "reopening still starts a fresh conversation");

    /* A provider that cannot prepare anything leaves the window answering from this page's own data. */
    const failing = {
      ensureCalls: 0,
      ensure() {
        this.ensureCalls += 1;
        return Promise.reject(new Error("frame blocked"));
      },
      isReady: () => false
    };
    const failingHarness = createHarness({ engine, provider: failing });
    failingHarness.api.open();
    failingHarness.input.value = "what is sticky ring";
    failingHarness.form.dispatch("submit", {});
    await flush();
    await flush();
    assert.equal(failing.ensureCalls >= 1, true, "the provider was asked");
    assert.equal(failingHarness.messages().length, 3, "the window still answers when the provider fails");
    assert.match(failingHarness.messageText(2), /Small Slime/, "the page-local answer is still real");

    /* An already-prepared provider answers synchronously. */
    const readyProvider = createProviderStub({ ready: true });
    const readyHarness = createHarness({ engine, provider: readyProvider });
    readyHarness.api.open();
    readyHarness.input.value = "what is sticky ring";
    readyHarness.form.dispatch("submit", {});
    assert.equal(readyHarness.messages().length, 3, "a prepared provider answers in the same turn");
    assert.equal(readyProvider.ensureCalls, 1, "opening still prepared the records");
    results.push("cross-page-provider");
  }

  /* 23. Floor context: an inferred floor is stated, and candidates carry their floor. */
  {
    const engine = createEngineStub((question) => {
      if (/slime/.test(question)) {
        const options = [
          { id: "mob|small-slime", type: "mob", name: "Small Slime", floor: "floor2" },
          { id: "item|slime-jelly", type: "item", name: "Slime Jelly", floor: "floor3" }
        ];
        return engineResult({
          status: "ambiguous",
          intent: "unknown",
          entity: null,
          entityType: null,
          facts: {},
          candidates: options,
          clarification: { reason: "multiple-floor-matches", options },
          dataQuality: { complete: false, notes: ["ambiguous-question", "ambiguous-floor"] }
        });
      }
      if (/floor 2/.test(question)) {
        return engineResult({
          intent: "location",
          context: { world: "aincrad", dataset: "beta", floor: "floor2", language: "en" },
          facts: {
            name: "Arid Desert",
            markers: [{ id: "arid-desert", title: "Arid Desert", coords: { x: 10, z: 20 } }],
            areas: []
          },
          dataQuality: { complete: false, notes: ["floor-from-question"] }
        });
      }
      return engineResult({
        intent: "item",
        context: { world: "aincrad", dataset: "beta", floor: "floor2", language: "en" },
        facts: { name: "Sticky Ring", record: null, droppedBy: [{ mob: "Small Slime", chance: 30 }] },
        dataQuality: { complete: false, notes: ["floor-inferred"] }
      });
    });
    const h = createHarness({ engine });
    h.api.open();
    const ask = (question) => {
      h.input.value = question;
      h.form.dispatch("submit", {});
      return h.messageText(h.messages().length - 1);
    };

    const inferred = ask("what is sticky ring");
    assert.equal(
      floorNoteValues(2).some((line) => inferred.includes(line)),
      true,
      `an answer from another floor says which floor (got ${JSON.stringify(inferred)})`
    );

    const named = ask("what is on floor 2");
    const anyFloorNote = [1, 2, 3].flatMap((floor) => floorNoteValues(floor));
    assert.equal(
      anyFloorNote.some((line) => named.includes(line)),
      false,
      "a floor the visitor named themselves is not announced back to them"
    );

    const multi = ask("where is the slime");
    assert.match(multi, /Small Slime \(Mob · Floor 2\)/, "a candidate from another floor is labelled with it");
    assert.match(multi, /Slime Jelly \(Item · Floor 3\)/, "each candidate keeps its own floor");
    results.push("floor-aware-rendering");
  }

  /* 24. Dataset handling: the page's selection is passed per question, and Beta is refused in character. */
  {
    const engine = createEngineStub((question, context) => {
      const dataset = context && context.dataset;
      if (dataset !== "current") {
        return engineResult({
          status: "unsupported",
          intent: "unknown",
          entity: null,
          facts: {},
          context: { world: "aincrad", dataset: dataset || "beta", floor: "floor1", language: "en" },
          unsupportedReason: "dataset-unsupported",
          dataQuality: { complete: false, notes: ["dataset-unsupported"] }
        });
      }
      return engineResult({
        facts: { name: "Sticky Ring", record: null, droppedBy: [{ mob: "Small Slime", chance: 30 }] }
      });
    });
    const provider = createProviderStub({ ready: true, datasetHint: "beta" });
    const h = createHarness({ engine, provider });
    h.api.open();
    const ask = (question) => {
      h.input.value = question;
      h.form.dispatch("submit", {});
      return h.messageText(h.messages().length - 1);
    };

    /* Beta-Test Data: one in-character line, nothing else, and no records touched. */
    const datasetNotice = poolValues(
      loadTranslations().en,
      "argo.status.datasetUnsupported",
      STATUS_POOL_SIZES.datasetUnsupported
    );
    const betaReply = ask("where can i buy the sticky ring");
    assert.equal(
      datasetNotice.includes(betaReply),
      true,
      `Beta mode gets one of the in-character notices (reply: ${JSON.stringify(betaReply)})`
    );
    assert.match(betaReply, /dataset/i, "and tells the visitor what to change");
    assert.equal(/Ask me about items and gear/.test(betaReply), false, "no help text is bolted on");
    assert.equal(/\n/.test(betaReply), false, "the notice is a single line");
    assert.equal(
      h.i18n.calls.some((key) => key.startsWith("argo.status.datasetUnsupported.")),
      true,
      "the notice is a localized string"
    );

    /* The hint is read for every question, so switching mode while the window is open works. */
    provider.setDatasetHint("current");
    const currentReply = ask("where can i buy the sticky ring");
    assert.match(currentReply, /Sticky Ring/, "the same question answers once the mode is Current");

    /* Switching back is honoured immediately, with no stale context. */
    provider.setDatasetHint("beta");
    assert.equal(datasetNotice.includes(ask("where can i buy the sticky ring")), true);

    /* Every call carried the dataset the page reported, and nothing else. */
    assert.equal(
      JSON.stringify(engine.calls.map((call) => call.context)),
      JSON.stringify([{ dataset: "beta" }, { dataset: "current" }, { dataset: "beta" }]),
      "the UI passes exactly the page's dataset selection, never a world or floor of its own"
    );
    results.push("dataset-mode-handling");
  }

  /* 25. Welcome wording and answer wording are separate pools. */
  {
    const engine = createEngineStub(() =>
      engineResult({
        intent: "item",
        facts: { name: "Sticky Ring", record: null, droppedBy: [{ mob: "Small Slime", chance: 30 }] }
      })
    );
    const h = createHarness({ engine });
    h.api.open();
    const english = loadTranslations().en;
    const introValues = poolValues(english, "argo.intro", INTRO_SIZE);
    const answerValues = [
      ...poolValues(english, "argo.lead.item", LEAD_POOL_SIZES.item),
      ...poolValues(english, "argo.facts.item", FACT_SIZE),
      ...poolValues(english, "argo.close", CLOSE_SIZE)
    ];
    const greeting = h.messageText(0);
    assert.equal(introValues.includes(greeting), true, "the greeting is one of the welcome lines");
    assert.equal(answerValues.includes(greeting), false, "the welcome pool is never used as an answer line");

    h.input.value = "where can i buy the sticky ring";
    h.form.dispatch("submit", {});
    const reply = h.messageText(h.messages().length - 1);
    assert.equal(h.messageText(0), greeting, "answering never rewrites the greeting");
    assert.equal(
      reply.split("\n").some((line) => introValues.includes(line)),
      false,
      "no welcome line leaks into an answer"
    );
    assert.equal(
      reply.split("\n").some((line) => answerValues.includes(line)),
      true,
      "the answer draws on its own pools"
    );
    results.push("dialogue-pool-separation");
  }

  /* 26. Each pool rotates, never landing the same line twice in a row, and the facts never move. */
  {
    const engine = createEngineStub((question) => {
      if (/spider silk/i.test(question)) {
        return engineResult({
          status: "missing",
          intent: "item",
          entity: { id: "item|spider-silk", type: "item", name: "Spider Silk", recordPresent: false },
          facts: { name: "Spider Silk", record: null, droppedBy: [{ mob: "Forest Spider", chance: 85 }] },
          dataQuality: { complete: false, notes: ["item-record-missing"] }
        });
      }
      return engineResult({
        intent: "item",
        facts: { name: "Sticky Ring", record: null, droppedBy: [{ mob: "Small Slime", chance: 30 }] }
      });
    });
    const h = createHarness({ engine });
    h.api.open();
    const english = loadTranslations().en;
    const ask = (question) => {
      h.input.value = question;
      h.form.dispatch("submit", {});
      return h.messageText(h.messages().length - 1);
    };
    const linesFrom = (reply, values) => reply.split("\n").filter((line) => values.includes(line));
    const assertNoRepeat = (lines, message) => {
      for (let index = 1; index < lines.length; index += 1) {
        assert.notEqual(lines[index], lines[index - 1], message);
      }
    };

    const itemLeads = poolValues(english, "argo.lead.item", LEAD_POOL_SIZES.item);
    const itemTransitions = poolValues(english, "argo.facts.item", FACT_SIZE);
    const closeValues = poolValues(english, "argo.close", CLOSE_SIZE);
    const replies = [];
    for (let index = 0; index < 6; index += 1) replies.push(ask("where can i buy the sticky ring"));

    const leads = replies.map((reply) => linesFrom(reply, itemLeads)[0]).filter(Boolean);
    assert.equal(leads.length, replies.length, "every single-record answer opens with a lead-in");
    assertNoRepeat(leads, "a lead-in never lands twice in a row");
    assert.equal(new Set(leads).size, leads.length, "and never the same line twice while the pool lasts");

    const transitions = replies.map((reply) => linesFrom(reply, itemTransitions)[0]);
    assert.equal(transitions.filter(Boolean).length, 6, "every longer answer introduces its list");
    assertNoRepeat(transitions, "a list transition never lands twice in a row");

    const closes = replies.map((reply) => linesFrom(reply, closeValues)[0]);
    assert.equal(closes.filter(Boolean).length, 6, "a clean answer is signed off");
    assertNoRepeat(closes, "a sign-off never lands twice in a row");

    /* The facts are the engine's, whatever the wording is doing. */
    const factsOf = (reply) => reply.split("\n").filter((line) => line && !isDialogueLine(line));
    for (const reply of replies.slice(1)) {
      assert.deepEqual(factsOf(reply), factsOf(replies[0]), "changing the wording never changes a fact");
    }

    /* Every line of a pool is used before any of them comes back, and a wrap cannot repeat either. */
    const longRun = createHarness({ engine });
    longRun.api.open();
    const longLeads = [];
    for (let index = 0; index < itemLeads.length; index += 1) {
      const reply = longRun.messageText(
        (() => {
          longRun.input.value = "where can i buy the sticky ring";
          longRun.form.dispatch("submit", {});
          return longRun.messages().length - 1;
        })()
      );
      longLeads.push(linesFrom(reply, itemLeads)[0] || "");
    }
    const drawn = longLeads.filter(Boolean);
    assert.equal(drawn.length, itemLeads.length, "one lead-in for every answer");
    assert.equal(new Set(drawn).size, itemLeads.length, "the whole pool is used before any line comes back");
    assertNoRepeat(drawn, "and a wrap never repeats the line it just finished on");

    /* Selection is a real draw, not a fixed rotation: another seed gives another order, and the pool's
       own order is not the order the visitor sees. */
    const otherSeed = createHarness({ engine, seed: 987654321 });
    otherSeed.api.open();
    const otherLeads = [];
    for (let index = 0; index < 6; index += 1) {
      otherSeed.input.value = "where can i buy the sticky ring";
      otherSeed.form.dispatch("submit", {});
      otherLeads.push(linesFrom(otherSeed.messageText(otherSeed.messages().length - 1), itemLeads)[0] || "");
    }
    assert.notDeepEqual(
      otherLeads,
      replies.map((reply) => linesFrom(reply, itemLeads)[0] || ""),
      "another draw gives another order"
    );
    assert.notDeepEqual(leads, itemLeads.slice(0, leads.length), "and the pool's own order is not the order shown");

    /* The missing-record note is drawn the same way: all three lines before any of them repeats. */
    const noteValues = poolValues(english, "argo.note.itemRecordMissing", NOTE_POOL_SIZES.itemRecordMissing);
    const notes = [0, 1, 2].map(() => linesFrom(ask("what is spider silk"), noteValues)[0]);
    assert.equal(new Set(notes).size, 3, "the note pool uses every line before repeating one");

    /* Closing and reopening keeps the memory, so the next answer cannot replay the last line. */
    const reopen = createHarness({ engine });
    reopen.api.open();
    const reopenAsk = (question) => {
      reopen.input.value = question;
      reopen.form.dispatch("submit", {});
      return reopen.messageText(reopen.messages().length - 1);
    };
    const beforeClose = linesFrom(reopenAsk("where can i buy the sticky ring"), itemLeads)[0];
    reopen.api.close();
    await flush();
    reopen.api.open();
    const afterReopen = linesFrom(reopenAsk("where can i buy the sticky ring"), itemLeads)[0];
    assert.ok(beforeClose && afterReopen, "both answers open with a lead-in");
    assert.notEqual(afterReopen, beforeClose, "reopening does not replay the line that was just read");
    results.push("dialogue-variety");
  }

  /* 27. Dialogue never crowds a short answer, and never sounds sure when something is missing. */
  {
    const engine = createEngineStub((question) => {
      if (/drake/i.test(question)) {
        return engineResult({
          intent: "mobDrops",
          entity: { id: "mob|drake", type: "mob", name: "Drake", recordPresent: true },
          entityType: "mob",
          facts: { name: "Drake", drops: [] }
        });
      }
      return engineResult({
        intent: "item",
        facts: { name: "Sticky Ring", record: null, droppedBy: [{ mob: "Small Slime", chance: 30 }] },
        dataQuality: { complete: false, notes: ["no-drop-record"] }
      });
    });
    const h = createHarness({ engine });
    h.api.open();
    const english = loadTranslations().en;
    const ask = (question) => {
      h.input.value = question;
      h.form.dispatch("submit", {});
      return h.messageText(h.messages().length - 1);
    };
    const mobDropTransitions = poolValues(english, "argo.facts.mobDrops", FACT_SIZE);
    const closeValues = poolValues(english, "argo.close", CLOSE_SIZE);
    const noteValues = poolValues(english, "argo.note.noDropRecord", NOTE_POOL_SIZES.noDropRecord);

    /* An answer that admits a gap carries the caveat instead of a confident sign-off. */
    const cautious = ask("where can i buy the sticky ring");
    assert.equal(
      cautious.split("\n").some((line) => noteValues.includes(line)),
      true,
      "the missing piece is admitted in plain language"
    );
    assert.equal(
      cautious.split("\n").some((line) => closeValues.includes(line)),
      false,
      "and no sign-off claims the records are complete"
    );

    /* A short answer still opens conversationally, but it is not padded: no transition, no sign-off. */
    const short = ask("what do you know about the drake");
    assert.equal(short.split("\n").length <= 2, true, `a short answer stays short (got ${JSON.stringify(short)})`);
    assertHasPoolLine(
      short,
      poolValues(english, "argo.lead.mobDrops", LEAD_POOL_SIZES.mobDrops),
      "a short answer still opens with an opener"
    );
    assert.equal(
      short.split("\n").some((line) => mobDropTransitions.includes(line)),
      false,
      "no list transition is bolted onto a short answer"
    );
    assert.equal(
      short.split("\n").some((line) => closeValues.includes(line)),
      false,
      "and no sign-off either"
    );
    results.push("dialogue-caveat-gating");
  }

  /* 28. The greeting is drawn at random, never repeats while it is fresh, and is remembered across
     closing, reopening and a reload. */
  {
    const introValues = poolValues(loadTranslations().en, "argo.intro", INTRO_SIZE);

    /* Five openings, five different greetings: the recent ones are skipped rather than replayed. */
    const h = createHarness();
    const greetings = [];
    for (let index = 0; index < 5; index += 1) {
      greetings.push(openOnce(h));
      await flush();
    }
    assert.equal(
      greetings.every((line) => introValues.includes(line)),
      true,
      "every greeting comes from the welcome pool"
    );
    assert.equal(new Set(greetings).size, 5, "five openings show five different greetings");
    assert.notDeepEqual(greetings, introValues.slice(0, 5), "and never in the pool's own order");
    assert.deepEqual(
      h.storageCalls.filter((call) => !call.endsWith(`:${DIALOGUE_KEY}`)),
      [],
      "and only Argo's own dialogue record is touched"
    );

    /* A reload: a brand-new harness sharing the same store must not replay those greetings. */
    const reloaded = createHarness({ storageValues: h.storageValues });
    const afterReload = openOnce(reloaded);
    assert.equal(
      greetings.includes(afterReload),
      false,
      `a reload does not replay a greeting that is still fresh (got ${JSON.stringify(afterReload)})`
    );
    assert.equal(introValues.includes(afterReload), true, "and it is still a real greeting");

    /* Another draw gives another order: the welcome is random, not a sequence. */
    const otherSeed = createHarness({ seed: 987654321 });
    const otherGreetings = [];
    for (let index = 0; index < 3; index += 1) {
      otherGreetings.push(openOnce(otherSeed));
      await flush();
    }
    assert.notDeepEqual(otherGreetings, greetings.slice(0, 3), "another draw gives another order");

    /* A greeting cannot come back while it is still one of the five most recent. */
    const thorough = createHarness();
    const seen = [];
    for (let index = 0; index < 8; index += 1) {
      seen.push(openOnce(thorough));
      await flush();
    }
    seen.forEach((line, index) => {
      const recent = seen.slice(Math.max(0, index - 5), index);
      assert.equal(recent.includes(line), false, `greeting ${index + 1} is not one of the five shown before it`);
    });
    results.push("welcome-rotation");
  }

  /* 28b. The greeting survives a browser where storage is missing, full, blocked or full of nonsense. */
  {
    const introValues = poolValues(loadTranslations().en, "argo.intro", INTRO_SIZE);
    const unusable = [
      ["with no usable storage", { withoutStorage: true }],
      ["with unparseable storage", { storageValues: { [DIALOGUE_KEY]: "{not json" } }],
      ["with a record of the wrong shape", { storageValues: { [DIALOGUE_KEY]: '{"intro":"nope","pools":[]}' } }],
      [
        "with a record holding the wrong types",
        { storageValues: { [DIALOGUE_KEY]: '{"intro":[7,null],"pools":{"x":"y"}}' } }
      ]
    ];
    for (const [name, options] of unusable) {
      const h = createHarness(options);
      assert.equal(h.messageText(0), "", `${name}: nothing is shown before the window is opened`);
      const first = openOnce(h);
      assert.equal(introValues.includes(first), true, `${name}: the greeting still comes from the pool`);
      await flush();
      const second = openOnce(h);
      assert.equal(introValues.includes(second), true, `${name}: reopening still works`);
      assert.notEqual(second, first, `${name}: and does not replay the greeting just shown`);
    }
    results.push("welcome-storage-fallback");
  }

  /* 29. Collections, rankings, comparisons and farming render from the engine's facts only. */
  {
    const collectionRecord = (index) => ({
      id: `quest|q-${index}`,
      name: `Quest ${index}`,
      type: "quest",
      source: "quest",
      questType: "side",
      questNumber: index,
      npcName: "Guard Tomas",
      island: null,
      xpReward: 100 + index,
      colReward: 10,
      coordinates: "1 / 2",
      markerCount: 1,
      markerType: "Quest",
      coords: { x: index, z: index },
      floor: "floor1"
    });
    const engine = createEngineStub((question) => {
      if (/farm/i.test(question)) {
        return engineResult({
          intent: "farming",
          plan: "farming",
          entity: { id: "item|sylvan-bark", type: "item", name: "Sylvan Bark", recordPresent: false },
          entityType: "item",
          facts: {
            item: "Sylvan Bark",
            itemId: "item|sylvan-bark",
            itemRecordPresent: false,
            sources: [
              {
                mob: "Elite Treant",
                mobId: "mob|elite-treant",
                bestiaryTab: "regular",
                chance: 80,
                notes: null,
                floor: "floor1",
                spawnAreas: [{ area: "Vallhat", floor: "floor1", underground: false }]
              },
              {
                mob: "Treant Warrior",
                mobId: "mob|treant-warrior",
                bestiaryTab: "regular",
                chance: null,
                notes: null,
                floor: "floor1",
                spawnAreas: []
              }
            ],
            sourceCount: 2,
            ratedCount: 1,
            unratedCount: 1,
            best: { mob: "Elite Treant", mobId: "mob|elite-treant", chance: 80, bestiaryTab: "regular" },
            tiedAtBest: false,
            dropFloors: ["floor1"]
          },
          dataQuality: { complete: false, notes: ["chance-not-recorded"] }
        });
      }
      if (/highest/i.test(question)) {
        return engineResult({
          intent: "ranking",
          plan: "ranking",
          facts: {
            target: "quest",
            field: "xpReward",
            fieldKind: "xp",
            direction: "desc",
            superlative: true,
            total: 9,
            rankedCount: 2,
            unknownCount: 7,
            unknownNames: ["A New World"],
            ranked: [
              {
                id: "quest|the-citadels-cold",
                name: "The Citadel's Cold",
                type: "quest",
                value: 700,
                category: null,
                questType: "side",
                bestiaryTab: null
              },
              {
                id: "quest|bone-and-dust",
                name: "Bone and Dust",
                type: "quest",
                value: 600,
                category: null,
                questType: "side",
                bestiaryTab: null
              }
            ],
            best: { id: "quest|the-citadels-cold", name: "The Citadel's Cold", value: 700 },
            worst: { id: "quest|bone-and-dust", name: "Bone and Dust", value: 600 },
            tiedAtTop: false,
            filters: { questType: "side", category: null, text: [] },
            otherFloors: [],
            scope: { world: "aincrad", floor: "floor1", dataset: "current" }
          },
          dataQuality: { complete: false, notes: ["ranking-has-unknown-values"] }
        });
      }
      return engineResult({
        intent: "collection",
        plan: "collection",
        facts: {
          target: "quest",
          total: 12,
          shown: 12,
          truncated: false,
          filters: { questType: "side", category: null, text: [], stats: [], level: { min: null, max: null } },
          records: Array.from({ length: 12 }, (_value, index) => collectionRecord(index + 1)),
          otherFloors: [],
          scope: { world: "aincrad", floor: "floor1", dataset: "current" }
        },
        dataQuality: { complete: true, notes: [] }
      });
    });
    const h = createHarness({ engine });
    h.api.open();
    const ask = (question) => {
      h.input.value = question;
      h.form.dispatch("submit", {});
      return h.messageText(h.messages().length - 1);
    };

    /* A collection: it opens with a real introduction that carries the set and its size, the records are
       listed, and the cap is admitted. The plain count heading is not repeated after the opener. */
    const collection = ask("show me all side quests");
    const collectionLines = collection.split("\n");
    const collectionOpeners = poolValues(loadTranslations().en, "argo.lead.collection", SET_LEAD_SIZE).map((line) =>
      line.replace("{label}", "Side Quests").replace("{count}", "12")
    );
    assert.equal(
      collectionOpeners.includes(collectionLines[0]),
      true,
      `the collection opens with a conversational line that names the set and its size (got ${JSON.stringify(collectionLines[0])})`
    );
    assert.equal(
      collection.includes("Side Quests: 12"),
      false,
      "the bare count heading is not repeated under the opener"
    );
    assert.match(collection, /• Quest 1 \(Side Quests · XP 101 · X: 1 Z: 1\)/);
    assert.match(collection, /and 2 more \(of 12\)/, "the display cap is stated, not hidden");
    assert.equal(collection.includes("{"), false, "and no placeholder is left in it");
    assertHasPoolLine(
      collection,
      poolValues(loadTranslations().en, "argo.close.collection", SET_CLOSE_SIZE),
      "and it closes with a remark about the list, not the single-record sign-off"
    );

    /* A ranking: the direction and the field are named, and unknown values are separated. */
    const ranking = ask("which quest has the highest xp");
    assert.match(ranking, /Side Quests by XP, highest first:/);
    assert.match(ranking, /1\. The Citadel's Cold — XP 700 \(Side Quests\)/);
    assert.match(ranking, /7 of them have no recorded value/, "records without a value are called out");
    assertHasPoolLine(
      ranking,
      poolValues(loadTranslations().en, "argo.lead.ranking", SET_LEAD_SIZE),
      "a ranking opens with a conversational line"
    );
    results.push("set-question-rendering");
  }

  /* 29b. Every reachable list category carries a conversational element, and no list answer opens on a
     bare label: the four set categories introduce themselves and close with a remark of their own. */
  {
    const english = loadTranslations().en;
    const record = (index) => ({
      id: `quest|q-${index}`,
      name: `Quest ${index}`,
      type: "quest",
      questType: "side",
      xpReward: 100 + index,
      coords: { x: index, z: index },
      floor: "floor1"
    });
    const setFacts = {
      collection: {
        target: "quest",
        total: 2,
        shown: 2,
        filters: { questType: "side", category: null, text: [], stats: [], level: { min: null, max: null } },
        records: [record(1), record(2)],
        otherFloors: []
      },
      ranking: {
        target: "quest",
        field: "xpReward",
        fieldKind: "xp",
        direction: "desc",
        total: 2,
        rankedCount: 2,
        unknownCount: 0,
        ranked: [
          { id: "quest|q-2", name: "Quest 2", type: "quest", value: 102, questType: "side" },
          { id: "quest|q-1", name: "Quest 1", type: "quest", value: 101, questType: "side" }
        ],
        filters: { questType: "side", category: null, text: [] }
      },
      comparison: {
        entities: [
          { id: "quest|q-1", name: "Quest 1", type: "quest" },
          { id: "quest|q-2", name: "Quest 2", type: "quest" }
        ],
        rows: [
          { key: "xpReward", kind: "number", values: [101, 102] },
          { key: "questType", kind: "questType", values: ["side", "side"] }
        ]
      },
      farming: {
        item: "Sylvan Bark",
        sourceCount: 2,
        best: { mob: "Elite Treant", chance: 80 },
        sources: [
          { mob: "Elite Treant", chance: 80, bestiaryTab: "regular", spawnAreas: [{ area: "Vallhat" }] },
          { mob: "Treant Warrior", chance: null, bestiaryTab: "regular", spawnAreas: [] }
        ]
      }
    };

    for (const category of SET_CATEGORIES) {
      const engine = createEngineStub(() =>
        engineResult({
          intent: category,
          plan: category,
          facts: setFacts[category],
          dataQuality: { complete: true, notes: [] }
        })
      );
      const h = createHarness({ engine });
      h.api.open();
      h.input.value = `a ${category} question`;
      h.form.dispatch("submit", {});
      const reply = h.messageText(h.messages().length - 1);
      const lines = reply.split("\n").filter(Boolean);

      /* It opens with a real introduction, drawn from that category's own pool. */
      assertHasPoolLine(
        lines[0],
        poolValues(english, `argo.lead.${category}`, SET_LEAD_SIZE).map((line) =>
          line.replace("{label}", "Side Quests").replace("{count}", "2")
        ),
        `a ${category} answer opens with its own introduction`
      );
      assert.equal(
        lines.some((line) => isDialogueLine(line)),
        true,
        `a ${category} answer carries dialogue rather than only data`
      );
      assert.equal(/\{\w+\}/.test(reply), false, `a ${category} answer leaves no placeholder`);
      /* And it closes with a remark about that kind of list, not the single-record sign-off. */
      assertHasPoolLine(
        reply,
        poolValues(english, `argo.close.${category}`, SET_CLOSE_SIZE),
        `a ${category} answer closes with its own remark`
      );
      assert.equal(
        lines.some((line) => poolValues(english, "argo.close", CLOSE_SIZE).includes(line)),
        false,
        `a ${category} answer does not borrow the single-record sign-off`
      );
    }
    results.push("set-conversation-coverage");
  }

  /* 29c. Every single-record category carries dialogue too, whichever line the draw lands on. */
  {
    const fixtures = {
      item: {
        intent: "item",
        entityType: "item",
        facts: {
          name: "Sticky Ring",
          record: {
            category: "accessory",
            level: 5,
            stats: { Defense: "+1" },
            craftingResources: [],
            craftingLocation: "Secret Sticky Ring Merchant"
          },
          droppedBy: []
        }
      },
      recipe: {
        intent: "recipe",
        entityType: "item",
        facts: {
          item: "Sticky Ring",
          recordPresent: true,
          craftingResources: [{ item: "Slime Jelly", amount: 2 }],
          craftingLocation: "Secret Sticky Ring Merchant"
        }
      },
      mob: {
        intent: "mob",
        entityType: "mob",
        facts: {
          name: "Corrupted Boar",
          bestiary: { tab: "regular", xp: 1 },
          drops: [{ item: "Boar Hide", chance: 90 }],
          spawnAreas: [{ area: "Wild Boar Zone" }],
          markers: [],
          quests: []
        }
      },
      mobDrops: {
        intent: "mobDrops",
        entityType: "mob",
        facts: { mob: "Corrupted Boar", bestiaryTab: "regular", xp: 1, drops: [{ item: "Boar Hide", chance: 90 }] }
      },
      drop: {
        intent: "drop",
        entityType: "item",
        facts: { item: "Boar Hide", itemRecordPresent: false, droppedBy: [{ mob: "Corrupted Boar", chance: 90 }] }
      },
      npc: {
        intent: "npc",
        entityType: "npc",
        facts: {
          name: "Guard Tomas",
          markers: [{ title: "Guard Tomas", coords: { x: 1, z: 2 } }],
          requests: [],
          appearsIn: [],
          sells: []
        }
      },
      quest: {
        intent: "quest",
        entityType: "quest",
        facts: {
          name: "A New World",
          quests: [
            {
              questName: "A New World",
              questType: "main",
              npcName: "Mysterious Character",
              requirements: "Talk to the Mysterious Character",
              xpReward: 300,
              colReward: 100
            }
          ],
          markers: [{ title: "A New World", coords: { x: 2, z: 17 } }]
        }
      },
      location: {
        intent: "location",
        entityType: "location",
        facts: {
          name: "Snow Citadel",
          markers: [{ title: "Snow Citadel", coords: { x: 3994, z: 2010 } }],
          areas: [],
          mobs: []
        }
      }
    };

    const english = loadTranslations().en;
    for (const [category, fixture] of Object.entries(fixtures)) {
      const engine = createEngineStub(() => engineResult(fixture));
      const h = createHarness({ engine });
      h.api.open();
      const ask = (question) => {
        h.input.value = question;
        h.form.dispatch("submit", {});
        return h.messageText(h.messages().length - 1);
      };
      const openers = poolValues(english, `argo.lead.${category}`, LEAD_POOL_SIZES[category]);
      const reply = ask(`a ${category} question`);
      assert.equal(
        reply
          .split("\n")
          .filter(Boolean)
          .some((line) => isDialogueLine(line)),
        true,
        `a ${category} answer carries dialogue rather than only data (got ${JSON.stringify(reply)})`
      );
      assert.equal(/\{\w+\}/.test(reply), false, `a ${category} answer leaves no placeholder`);
      assert.equal(reply.split("\n").filter(Boolean).length > 0, true, `a ${category} answer says something`);

      /* Every repeat opens with one of that category's own openers, the same opener never lands twice in
         a row, and the transition under it never repeats the opener's words. */
      const repeatedOpeners = [];
      for (let index = 0; index < 25; index += 1) {
        const repeated = ask(`a ${category} question`);
        const lines = repeated.split("\n").filter(Boolean);
        assert.equal(
          openers.includes(lines[0]),
          true,
          `${category}: every answer opens with one of its own openers (got ${JSON.stringify(lines[0])})`
        );
        repeatedOpeners.push(lines[0]);
        if (lines.length < 3) continue;
        assert.deepEqual(
          [...topicWords(lines[0])].filter((word) => topicWords(lines[1]).has(word)),
          [],
          `${category}: the opener does not echo the transition under it (${JSON.stringify(lines.slice(0, 2))})`
        );
      }
      for (let index = 1; index < repeatedOpeners.length; index += 1) {
        assert.notEqual(repeatedOpeners[index], repeatedOpeners[index - 1], `${category}: no immediate repeat`);
      }
      assert.equal(new Set(repeatedOpeners).size > 1, true, `${category}: repeated questions draw different openers`);

      /* Every supported UI language that is not the source language: the wording comes from that
         language's own UI dictionary (scripts/localization-languages.js). */
      for (const language of translatedUiLanguages()) {
        const localized = createHarness({ engine, language, translatePrefix: "T:" });
        localized.api.open();
        localized.input.value = `a ${category} question`;
        localized.form.dispatch("submit", {});
        const first = localized
          .messageText(localized.messages().length - 1)
          .split("\n")
          .filter(Boolean)[0];
        assert.equal(
          first.startsWith(`T:argo.lead.${category}.`),
          true,
          `${category}: ${language} opens with its own dictionary opener (got ${JSON.stringify(first)})`
        );
      }
    }
    results.push("single-record-conversation-coverage");
  }

  /* 29d. The new list wording goes through the dictionary like everything else: on a localized page
     every line of a set answer is fetched from it, so every translated UI language gets its own pools. */
  {
    const collection = engineResult({
      intent: "collection",
      plan: "collection",
      facts: {
        target: "quest",
        total: 2,
        shown: 2,
        filters: { questType: "side", category: null, text: [], stats: [], level: { min: null, max: null } },
        records: [
          { id: "quest|q-1", name: "Quest 1", type: "quest", questType: "side", xpReward: 101 },
          { id: "quest|q-2", name: "Quest 2", type: "quest", questType: "side", xpReward: 102 }
        ],
        otherFloors: []
      },
      dataQuality: { complete: true, notes: [] }
    });
    for (const language of translatedUiLanguages()) {
      const h = createHarness({ engine: createEngineStub(() => collection), language, translatePrefix: "T:" });
      h.api.open();
      h.input.value = "a collection question";
      h.form.dispatch("submit", {});
      const lines = h
        .messageText(h.messages().length - 1)
        .split("\n")
        .filter(Boolean);
      assert.equal(
        lines[0].startsWith("T:argo.lead.collection."),
        true,
        `${language}: the opener is fetched from the dictionary`
      );
      assert.equal(
        lines[lines.length - 1].startsWith("T:argo.close.collection."),
        true,
        `${language}: the closer is fetched from the dictionary`
      );
      /* The localized pool really holds its own wording, never the English copy. */
      const localized = flatten(loadTranslations()[language]);
      const english = flatten(loadTranslations().en);
      for (const key of ["argo.lead.collection.1", "argo.close.collection.1", "argo.lead.farming.1"]) {
        assert.equal(typeof localized[key], "string", `${language}: ${key} is translated`);
        assert.notEqual(localized[key], english[key], `${language}: ${key} is not the English copy`);
      }
    }
    results.push("set-answer-localization");
  }

  /* 29g. A field the record simply does not have is never rendered as a value: no "Lv null", no
     "X: null Z: null", and nothing invented in its place. */
  {
    const engine = createEngineStub(() =>
      engineResult({
        intent: "item",
        entity: { id: "item|teleportation-crystal", type: "item", name: "Teleportation Crystal", recordPresent: true },
        entityType: "item",
        facts: {
          record: {
            category: "consumable",
            level: null,
            stats: {},
            craftingResources: [],
            craftingLocation: "Starting Merchant"
          },
          droppedBy: [],
          craftingLocationMarker: { title: "Starting Merchant", coords: { x: 1787, z: 4179 } }
        },
        dataQuality: { complete: false, notes: ["stats-absent", "no-recipe"] }
      })
    );
    const h = createHarness({ engine });
    h.api.open();
    h.input.value = "what are the teleportation crystal stats";
    h.form.dispatch("submit", {});
    const reply = h.messageText(h.messages().length - 1);
    assert.equal(
      /\bnull\b|\bundefined\b|\bNaN\b/.test(reply),
      false,
      `an absent field is never rendered as a value (got ${JSON.stringify(reply)})`
    );
    assert.match(reply, /Teleportation Crystal — Consumable/, "the header keeps what the record does have");
    assert.match(reply, /Crafting location: Starting Merchant \(X: 1787 Z: 4179\)/, "and its real fields");

    /* A marker without coordinates contributes no coordinate line at all, rather than a broken one. */
    const noCoords = createEngineStub(() =>
      engineResult({
        intent: "location",
        entity: { id: "location|markerless-camp", type: "location", name: "Markerless Camp", recordPresent: true },
        entityType: "location",
        facts: {
          name: "Markerless Camp",
          markers: [{ title: "Markerless Camp", coords: null, description: "A camp." }],
          areas: [],
          mobs: []
        }
      })
    );
    const bare = createHarness({ engine: noCoords });
    bare.api.open();
    bare.input.value = "where is markerless camp";
    bare.form.dispatch("submit", {});
    const bareReply = bare.messageText(bare.messages().length - 1);
    assert.equal(
      /Coordinates: X: null|undefined|NaN/.test(bareReply),
      false,
      `a marker without coordinates shows no coordinate line (got ${JSON.stringify(bareReply)})`
    );
    results.push("absent-field-rendering");
  }

  /* 30. A location answer has more than one reading order, and the facts never change with it. */
  {
    const location = engineResult({
      intent: "location",
      entity: { id: "location|snow-citadel", type: "location", name: "Snow Citadel", recordPresent: true },
      entityType: "location",
      facts: {
        name: "Snow Citadel",
        markers: [
          { id: "snow-citadel", title: "Snow Citadel", coords: { x: 3994, z: 2010 }, description: "A frozen citadel." }
        ],
        areas: [{ id: "snow-citadel-mobs", title: "Snow Citadel" }],
        mobs: [{ mob: "Ice Spiritist" }]
      }
    });
    const h = createHarness({ engine: createEngineStub(() => location) });
    h.api.open();
    const ask = (question) => {
      h.input.value = question;
      h.form.dispatch("submit", {});
      return h.messageText(h.messages().length - 1);
    };
    /* Every line that is not dialogue is a fact line, kept in the order the answer chose. */
    const factLines = (reply) => reply.split("\n").filter((line) => line && !isDialogueLine(line));
    const expectedFacts = [
      "Snow Citadel",
      "A frozen citadel.",
      "Coordinates: X: 3994 Z: 2010",
      "Spawn area: Snow Citadel",
      "Mobs: Ice Spiritist"
    ];

    const replies = [ask("where is snow citadel"), ask("where is snow citadel"), ask("where is snow citadel")];
    const bodies = replies.map(factLines);

    /* The same facts whatever the order: a multiset is compared, not a sequence. */
    bodies.forEach((body, index) => {
      assert.deepEqual(
        body.slice().sort(),
        expectedFacts.slice().sort(),
        `answer ${index + 1} carries exactly the supplied facts`
      );
    });

    /* The orders genuinely differ - at least two presentations of the same facts. */
    const orders = new Set(bodies.map((body) => body.join(" | ")));
    assert.ok(
      orders.size >= 2,
      `repeated location questions use more than one order (got ${JSON.stringify([...orders])})`
    );

    /* And the difference is the reading order itself: the answer does not always open on the name. */
    const openingLines = bodies.map((body) => body[0]);
    assert.ok(
      openingLines.includes("Snow Citadel") && openingLines.includes("Coordinates: X: 3994 Z: 2010"),
      `both reading orders are reachable (openings: ${JSON.stringify(openingLines)})`
    );
    assert.notEqual(bodies[0].join(" | "), bodies[1].join(" | "), "two identical questions read differently");
    for (const [index, reply] of replies.entries()) {
      assert.equal(/\{\w+\}/.test(reply), false, `answer ${index + 1} leaves no unresolved placeholder`);
    }

    /* A record with no coordinates has one usable order: it does not rotate and is not padded. */
    const noCoordinates = engineResult({
      intent: "location",
      entity: { id: "location|markerless-camp", type: "location", name: "Markerless Camp", recordPresent: true },
      entityType: "location",
      facts: {
        name: "Markerless Camp",
        markers: [{ id: "markerless-camp", title: "Markerless Camp", coords: null, description: "A camp." }],
        areas: [],
        mobs: []
      }
    });
    const bare = createHarness({ engine: createEngineStub(() => noCoordinates) });
    bare.api.open();
    const askBare = (question) => {
      bare.input.value = question;
      bare.form.dispatch("submit", {});
      return bare.messageText(bare.messages().length - 1);
    };
    const bareOnce = factLines(askBare("where is markerless camp"));
    const bareAgain = factLines(askBare("where is markerless camp"));
    assert.deepEqual(bareOnce, ["Markerless Camp", "A camp."], "a record without coordinates keeps its single order");
    assert.deepEqual(bareAgain, bareOnce, "and it does not rotate");
    assert.equal(
      bareOnce.every((line) => line.trim().length > 0),
      true,
      "no blank line is introduced for a record with no coordinates"
    );
    results.push("location-structure-variety");
  }

  /* 31. A record answered from another floor names that floor exactly once, with the number filled in. */
  {
    const english = loadTranslations().en;
    const floorTemplates = poolValues(english, "argo.note.floorInferred", NOTE_POOL_SIZES.floorInferred);
    /* The rendered caveat, filled in - and the raw template as well, so a second copy that lost its
       floor number is still counted as a cross-floor note rather than slipping past the count. */
    const floorNoteLines = (number) =>
      floorTemplates.concat(floorTemplates.map((template) => template.replace("{floor}", String(number))));

    const crossFloor = engineResult({
      intent: "location",
      context: { world: "aincrad", dataset: "current", floor: "floor2", language: "en" },
      entity: { id: "location|kaelor", type: "location", name: "Kaelor", recordPresent: true },
      entityType: "location",
      facts: {
        name: "Kaelor",
        markers: [
          { id: "current-kaelor", title: "Kaelor", coords: { x: -583, z: -264 }, description: "A remote biome." }
        ],
        areas: [],
        mobs: []
      },
      dataQuality: { complete: false, notes: ["floor-inferred"] }
    });
    const h = createHarness({ engine: createEngineStub(() => crossFloor) });
    h.api.open();
    const ask = (question) => {
      h.input.value = question;
      h.form.dispatch("submit", {});
      return h.messageText(h.messages().length - 1);
    };

    for (let index = 0; index < 3; index += 1) {
      const reply = ask("where is kaelor");
      const lines = reply.split("\n").filter(Boolean);
      const floorLines = lines.filter((line) => floorNoteLines(2).includes(line));
      assert.equal(
        floorLines.length,
        1,
        `answer ${index + 1} carries exactly one cross-floor note (reply: ${JSON.stringify(reply)})`
      );
      assert.equal(
        lines.some((line) => line.includes("{floor}")),
        false,
        `answer ${index + 1} fills the floor number in (reply: ${JSON.stringify(reply)})`
      );
      assert.equal(/\{\w+\}/.test(reply), false, `answer ${index + 1} leaves no unresolved placeholder`);
    }

    /* A second caveat still lands beside it, and the pair is still capped at two lines. */
    const mixed = engineResult({
      intent: "item",
      context: { world: "aincrad", dataset: "current", floor: "floor3", language: "en" },
      entity: { id: "item|spider-silk", type: "item", name: "Spider Silk", recordPresent: false },
      facts: { name: "Spider Silk", record: null, droppedBy: [{ mob: "Forest Spider", chance: 85 }] },
      dataQuality: { complete: false, notes: ["item-record-missing", "floor-inferred"] }
    });
    const mixedHarness = createHarness({ engine: createEngineStub(() => mixed) });
    mixedHarness.api.open();
    mixedHarness.input.value = "what is spider silk";
    mixedHarness.form.dispatch("submit", {});
    const mixedReply = mixedHarness.messageText(mixedHarness.messages().length - 1);
    const mixedLines = mixedReply.split("\n").filter(Boolean);
    const itemNotes = poolValues(english, "argo.note.itemRecordMissing", NOTE_POOL_SIZES.itemRecordMissing);
    assert.equal(
      mixedLines.filter((line) => floorNoteLines(3).includes(line)).length,
      1,
      `the cross-floor note is still emitted once beside another caveat (reply: ${JSON.stringify(mixedReply)})`
    );
    assert.equal(
      mixedLines.filter((line) => itemNotes.includes(line)).length,
      1,
      `the other caveat is unaffected (reply: ${JSON.stringify(mixedReply)})`
    );
    assert.equal(/\{\w+\}/.test(mixedReply), false, "no placeholder reaches a two-caveat answer");

    /* Every caveat that carries a placeholder renders it filled in, not just the cross-floor one. */
    const placeholderCases = [
      { note: "floor-inferred", context: { floor: "floor2" }, facts: {} },
      { note: "other-floor-records-exist", facts: { otherFloors: [{ floor: "floor2", count: 3 }] } },
      { note: "ranking-has-unknown-values", facts: { unknownCount: 4 } },
      { note: "comparison-truncated", facts: { rowCount: 9 } }
    ];
    for (const testCase of placeholderCases) {
      const single = createHarness({
        engine: createEngineStub(() =>
          engineResult({
            intent: "item",
            context: Object.assign(
              { world: "aincrad", dataset: "current", floor: "floor1", language: "en" },
              testCase.context || {}
            ),
            facts: Object.assign(
              { name: "Spider Silk", record: null, droppedBy: [{ mob: "Forest Spider", chance: 85 }] },
              testCase.facts
            ),
            dataQuality: { complete: false, notes: [testCase.note] }
          })
        )
      });
      single.api.open();
      single.input.value = "what is spider silk";
      single.form.dispatch("submit", {});
      const reply = single.messageText(single.messages().length - 1);
      assert.equal(
        /\{\w+\}/.test(reply),
        false,
        `${testCase.note} renders without a placeholder (reply: ${JSON.stringify(reply)})`
      );
    }
    results.push("cross-floor-note-once");
  }

  /* 32. An equipment answer has two reading orders, and neither adds, drops nor duplicates a fact. */
  {
    const item = engineResult({
      intent: "item",
      entity: { id: "item|sticky-ring", type: "item", name: "Sticky Ring", recordPresent: true },
      entityType: "item",
      facts: {
        name: "Sticky Ring",
        record: {
          category: "accessory",
          level: 5,
          set: "Little Slime Set",
          description: "A ring coated in a slimy layer.",
          stats: { Defense: "+1", Health: "+2" },
          craftingResources: [{ item: "Slime Jelly", itemId: "slime-jelly", amount: 12 }],
          craftingLocation: "Secret Sticky Ring Merchant",
          floor: "floor1",
          dataset: "current"
        },
        droppedBy: [{ mob: "Small Slime", chance: 30 }],
        craftingLocationMarker: null
      }
    });
    const h = createHarness({ engine: createEngineStub(() => item) });
    h.api.open();
    const ask = (question) => {
      h.input.value = question;
      h.form.dispatch("submit", {});
      return h.messageText(h.messages().length - 1);
    };
    const factLines = (reply) => reply.split("\n").filter((line) => line && !isDialogueLine(line));
    const expected = [
      "Sticky Ring — Accessory · Lv 5 · Little Slime Set",
      "A ring coated in a slimy layer.",
      "Stats: Defense +1 · Health +2",
      "Crafting resources: Slime Jelly x12",
      "Crafting location: Secret Sticky Ring Merchant",
      "Dropped by: Small Slime (30%)"
    ];

    const replies = [ask("what is the sticky ring"), ask("what is the sticky ring"), ask("what is the sticky ring")];
    const bodies = replies.map(factLines);

    /* The multiset is identical every time: no fact is added, dropped or duplicated by the layout. */
    bodies.forEach((body, index) => {
      assert.deepEqual(
        body.slice().sort(),
        expected.slice().sort(),
        `equipment answer ${index + 1} carries every fact exactly once`
      );
    });

    /* The two orders are genuinely different, and both are reachable. Which one comes first is drawn,
       so the check is that both appear and that neither ever lands twice in a row. */
    const orders = new Set(bodies.map((body) => body.join(" | ")));
    assert.ok(orders.size >= 2, `equipment answers use more than one order (got ${JSON.stringify([...orders])})`);
    const secondLines = bodies.map((body) => body[1]);
    assert.equal(
      secondLines.includes("A ring coated in a slimy layer."),
      true,
      "one order leads with what the item does"
    );
    assert.equal(
      secondLines.includes("Crafting location: Secret Sticky Ring Merchant"),
      true,
      "the other leads with how it is obtained"
    );
    for (let index = 1; index < secondLines.length; index += 1) {
      assert.notEqual(secondLines[index], secondLines[index - 1], "and the same order never lands twice in a row");
    }
    for (const [index, reply] of replies.entries()) {
      assert.equal(/\{\w+\}/.test(reply), false, `equipment answer ${index + 1} leaves no unresolved placeholder`);
    }

    /* A record with no acquisition fields has one layout, no blank line and no empty section. */
    const bare = engineResult({
      intent: "item",
      entity: { id: "item|plain-blade", type: "item", name: "Plain Blade", recordPresent: true },
      entityType: "item",
      facts: {
        name: "Plain Blade",
        record: {
          category: "weapon",
          level: 1,
          set: null,
          description: null,
          stats: { Damage: "3" },
          craftingResources: [],
          craftingLocation: null
        },
        droppedBy: []
      }
    });
    const bareHarness = createHarness({ engine: createEngineStub(() => bare) });
    bareHarness.api.open();
    const askBare = (question) => {
      bareHarness.input.value = question;
      bareHarness.form.dispatch("submit", {});
      return bareHarness.messageText(bareHarness.messages().length - 1);
    };
    const bareOnce = factLines(askBare("what is the plain blade"));
    const bareAgain = factLines(askBare("what is the plain blade"));
    assert.deepEqual(
      bareOnce,
      ["Plain Blade — Weapon · Lv 1", "Stats: Damage 3"],
      "a record with no acquisition fields keeps its single order"
    );
    assert.deepEqual(bareAgain, bareOnce, "and it does not rotate");
    assert.equal(
      bareOnce.every((line) => line.trim().length > 0),
      true,
      "no blank line is introduced for it"
    );
    results.push("item-structure-variety");
  }

  /* 33. A mob answer has two reading orders: what it drops, or where to hunt it. */
  {
    const mob = engineResult({
      intent: "mob",
      entity: { id: "mob|ice-spiritist", type: "mob", name: "Ice Spiritist", recordPresent: true },
      entityType: "mob",
      facts: {
        name: "Ice Spiritist",
        bestiary: { tab: "regular", xp: "14", floor: "floor1", dataset: "current" },
        drops: [{ item: "Frozen Shard", itemId: "frozen-shard", chance: 40, recordPresent: true }],
        spawnAreas: [{ areaId: "a1", area: "Frozen Hollow", floor: "floor1", underground: false }],
        markers: [{ id: "m1", title: "Ice Spiritist", coords: { x: 100, z: 200 }, description: null }],
        quests: []
      }
    });
    const h = createHarness({ engine: createEngineStub(() => mob) });
    h.api.open();
    const ask = (question) => {
      h.input.value = question;
      h.form.dispatch("submit", {});
      return h.messageText(h.messages().length - 1);
    };
    const factLines = (reply) => reply.split("\n").filter((line) => line && !isDialogueLine(line));
    const expected = [
      "Ice Spiritist",
      "Regular · XP 14",
      "Drops: Frozen Shard (40%)",
      "Spawn area: Frozen Hollow",
      "Coordinates: X: 100 Z: 200"
    ];

    const replies = [
      ask("where is the ice spiritist"),
      ask("where is the ice spiritist"),
      ask("where is the ice spiritist")
    ];
    const bodies = replies.map(factLines);

    bodies.forEach((body, index) => {
      assert.deepEqual(
        body.slice().sort(),
        expected.slice().sort(),
        `mob answer ${index + 1} carries every fact exactly once`
      );
    });

    const orders = new Set(bodies.map((body) => body.join(" | ")));
    assert.ok(orders.size >= 2, `mob answers use more than one order (got ${JSON.stringify([...orders])})`);
    /* Both reading orders appear, and the same one never lands twice in a row. */
    const mobTails = bodies.map((body) => body[2]);
    assert.equal(mobTails.includes("Drops: Frozen Shard (40%)"), true, "one order keeps the loot beside the entry");
    assert.equal(
      mobTails.includes("Coordinates: X: 100 Z: 200"),
      true,
      "the other leads its tail with the hunting grounds"
    );
    for (let index = 1; index < mobTails.length; index += 1) {
      assert.notEqual(mobTails[index], mobTails[index - 1], "and the same order never lands twice in a row");
    }
    /* Whichever order it uses, the loot is either straight after the entry or last, never in the middle. */
    bodies.forEach((body, index) => {
      const dropsIndex = body.indexOf("Drops: Frozen Shard (40%)");
      assert.equal(dropsIndex === 2 || dropsIndex === body.length - 1, true, `mob answer ${index + 1} places the loot`);
    });
    for (const [index, reply] of replies.entries()) {
      assert.equal(/\{\w+\}/.test(reply), false, `mob answer ${index + 1} leaves no unresolved placeholder`);
    }

    /* A mob with no spawn area and no mark has one layout, and neither section is forced in. */
    const lone = engineResult({
      intent: "mob",
      entity: { id: "mob|lone-wisp", type: "mob", name: "Lone Wisp", recordPresent: true },
      entityType: "mob",
      facts: {
        name: "Lone Wisp",
        bestiary: { tab: "regular", xp: null, floor: "floor1", dataset: "current" },
        drops: [],
        spawnAreas: [],
        markers: [],
        quests: []
      }
    });
    const loneHarness = createHarness({ engine: createEngineStub(() => lone) });
    loneHarness.api.open();
    const askLone = (question) => {
      loneHarness.input.value = question;
      loneHarness.form.dispatch("submit", {});
      return loneHarness.messageText(loneHarness.messages().length - 1);
    };
    const loneOnce = factLines(askLone("where is the lone wisp"));
    const loneAgain = factLines(askLone("where is the lone wisp"));
    assert.deepEqual(loneOnce, ["Lone Wisp", "Regular"], "a mob with nothing else to say keeps its single order");
    assert.deepEqual(loneAgain, loneOnce, "and it does not rotate");
    assert.equal(
      loneOnce.some((line) => /^Drops:|^Spawn area:|^Coordinates:/.test(line)),
      false,
      "no empty drop, spawn-area or coordinate section is added"
    );
    results.push("mob-structure-variety");
  }

  /* 34. A quest answer has two reading orders: the logistics first, or the job and its pay first. */
  {
    const quest = engineResult({
      intent: "quest",
      entity: { id: "quest|a-new-world", type: "quest", name: "A New World", recordPresent: true },
      entityType: "quest",
      facts: {
        name: "A New World",
        quests: [
          {
            id: "mq-1",
            questName: "A New World",
            questNumber: 1,
            npcName: "Mysterious Character",
            coordinates: "0 / 5",
            requirements: "Talk to the Mysterious Character (0, 200, 5)",
            xpReward: 300,
            colReward: 100,
            bonusItems: null
          }
        ],
        markers: [{ id: "mq-1", title: "A New World", coords: { x: 2, z: 17 } }]
      }
    });
    const h = createHarness({ engine: createEngineStub(() => quest) });
    h.api.open();
    const ask = (question) => {
      h.input.value = question;
      h.form.dispatch("submit", {});
      return h.messageText(h.messages().length - 1);
    };
    const factLines = (reply) => reply.split("\n").filter((line) => line && !isDialogueLine(line));
    const expected = [
      "1. A New World",
      "NPC: Mysterious Character",
      "Coordinates: 0 / 5",
      "Requirements: Talk to the Mysterious Character (0, 200, 5)",
      "Rewards: XP 300 · Col 100",
      "Coordinates: X: 2 Z: 17"
    ];

    const replies = [ask("where is a new world"), ask("where is a new world"), ask("where is a new world")];
    const bodies = replies.map(factLines);

    bodies.forEach((body, index) => {
      assert.deepEqual(
        body.slice().sort(),
        expected.slice().sort(),
        `quest answer ${index + 1} carries every fact exactly once`
      );
    });

    const orders = new Set(bodies.map((body) => body.join(" | ")));
    assert.ok(orders.size >= 2, `quest answers use more than one order (got ${JSON.stringify([...orders])})`);
    /* Both reading orders appear, and the same one never lands twice in a row. */
    const jobIndex = bodies.map((body) => body.indexOf(expected[3]));
    assert.equal(jobIndex.includes(3), true, "one order keeps the job after who and where");
    assert.equal(jobIndex.includes(1), true, "the other leads with the job itself");
    for (let index = 1; index < jobIndex.length; index += 1) {
      assert.notEqual(jobIndex[index], jobIndex[index - 1], "and the same order never lands twice in a row");
    }
    /* Whichever order it uses, the job is followed by its pay and then the logistics. */
    bodies.forEach((body, index) => {
      if (jobIndex[index] !== 1) return;
      assert.equal(body[2], "Rewards: XP 300 · Col 100", `quest answer ${index + 1} puts the pay after the job`);
      assert.equal(body[3], "NPC: Mysterious Character", `quest answer ${index + 1} leaves the logistics after that`);
    });
    for (const [index, reply] of replies.entries()) {
      assert.equal(/\{\w+\}/.test(reply), false, `quest answer ${index + 1} leaves no unresolved placeholder`);
    }

    /* A quest with no recorded reward shows no reward section, in either order. */
    const noRewards = engineResult({
      intent: "quest",
      entity: { id: "quest|quiet-errand", type: "quest", name: "Quiet Errand", recordPresent: true },
      entityType: "quest",
      facts: {
        name: "Quiet Errand",
        quests: [
          {
            id: "sq-9",
            questName: "Quiet Errand",
            questNumber: 9,
            npcName: "Fira",
            coordinates: "3395 / 2948",
            requirements: "1 Icy Magic Radiance",
            xpReward: null,
            colReward: null,
            bonusItems: null
          }
        ],
        markers: []
      }
    });
    const noRewardsHarness = createHarness({ engine: createEngineStub(() => noRewards) });
    noRewardsHarness.api.open();
    const askNoRewards = (question) => {
      noRewardsHarness.input.value = question;
      noRewardsHarness.form.dispatch("submit", {});
      return noRewardsHarness.messageText(noRewardsHarness.messages().length - 1);
    };
    const rewardless = [askNoRewards("where is quiet errand"), askNoRewards("where is quiet errand")];
    for (const [index, reply] of rewardless.entries()) {
      const lines = factLines(reply);
      assert.equal(
        lines.some((line) => /^Rewards:/.test(line)),
        false,
        `quest answer ${index + 1} invents no reward line`
      );
      assert.deepEqual(
        lines.slice().sort(),
        ["9. Quiet Errand", "NPC: Fira", "Coordinates: 3395 / 2948", "Requirements: 1 Icy Magic Radiance"].sort(),
        `quest answer ${index + 1} carries exactly the recorded fields`
      );
    }

    /* A quest with no sheet yet is a name and its map mark: one order, no empty section. */
    const sheetless = engineResult({
      intent: "quest",
      entity: { id: "quest|ghost-quest", type: "quest", name: "Ghost Quest", recordPresent: true },
      entityType: "quest",
      facts: { name: "Ghost Quest", quests: [], markers: [{ id: "gq", title: "Ghost Quest", coords: { x: 9, z: 9 } }] }
    });
    const sheetlessHarness = createHarness({ engine: createEngineStub(() => sheetless) });
    sheetlessHarness.api.open();
    const askSheetless = (question) => {
      sheetlessHarness.input.value = question;
      sheetlessHarness.form.dispatch("submit", {});
      return sheetlessHarness.messageText(sheetlessHarness.messages().length - 1);
    };
    const sheetlessOnce = factLines(askSheetless("where is ghost quest"));
    const sheetlessAgain = factLines(askSheetless("where is ghost quest"));
    assert.deepEqual(
      sheetlessOnce,
      ["Ghost Quest", "Coordinates: X: 9 Z: 9"],
      "a quest with no sheet keeps its single order"
    );
    assert.deepEqual(sheetlessAgain, sheetlessOnce, "and it does not rotate");
    results.push("quest-structure-variety");
  }

  /* 35. Structural variety is confined to the categories that have it: a collection's records and a
     ranking's positions keep the order the engine chose, question after question. */
  {
    const records = ["Alpha", "Beta", "Gamma"].map((name, index) => ({
      id: `quest|${name.toLowerCase()}`,
      name,
      type: "quest",
      source: "quest",
      questType: "side",
      xpReward: 100 - index * 10
    }));
    const engine = createEngineStub((question) => {
      if (/highest/i.test(question)) {
        return engineResult({
          intent: "ranking",
          plan: "ranking",
          facts: {
            target: "quest",
            field: "xpReward",
            fieldKind: "xp",
            direction: "desc",
            superlative: true,
            total: 3,
            rankedCount: 3,
            unknownCount: 0,
            unknownNames: [],
            ranked: records.map((record, index) => ({
              id: record.id,
              name: record.name,
              type: "quest",
              value: 100 - index * 10,
              category: null,
              questType: "side",
              bestiaryTab: null
            })),
            best: { id: records[0].id, name: records[0].name, value: 100 },
            worst: { id: records[2].id, name: records[2].name, value: 80 },
            tiedAtTop: false,
            filters: { questType: null, category: null, text: [] },
            otherFloors: [],
            scope: { world: "aincrad", floor: "floor1", dataset: "current" }
          },
          dataQuality: { complete: true, notes: [] }
        });
      }
      return engineResult({
        intent: "collection",
        plan: "collection",
        facts: {
          target: "quest",
          total: 3,
          shown: 3,
          truncated: false,
          filters: { questType: null, category: null, text: [], stats: [], level: { min: null, max: null } },
          records,
          otherFloors: [],
          scope: { world: "aincrad", floor: "floor1", dataset: "current" }
        },
        dataQuality: { complete: true, notes: [] }
      });
    });
    const h = createHarness({ engine });
    h.api.open();
    const ask = (question) => {
      h.input.value = question;
      h.form.dispatch("submit", {});
      return h.messageText(h.messages().length - 1);
    };
    const listed = (reply) => reply.split("\n").filter((line) => line.startsWith("• "));
    const positions = (reply) => reply.split("\n").filter((line) => /^\d+\. /.test(line));

    const collectionOnce = listed(ask("show me all side quests"));
    const collectionTwice = listed(ask("show me all side quests"));
    assert.deepEqual(
      collectionOnce,
      ["• Alpha (Side Quests · XP 100)", "• Beta (Side Quests · XP 90)", "• Gamma (Side Quests · XP 80)"],
      "a collection lists the records in the engine's order"
    );
    assert.deepEqual(collectionTwice, collectionOnce, "and a repeated collection question keeps that order");

    const rankingOnce = positions(ask("which quest has the highest xp"));
    const rankingTwice = positions(ask("which quest has the highest xp"));
    assert.deepEqual(
      rankingOnce,
      ["1. Alpha — XP 100 (Side Quests)", "2. Beta — XP 90 (Side Quests)", "3. Gamma — XP 80 (Side Quests)"],
      "a ranking keeps its positions and values"
    );
    assert.deepEqual(rankingTwice, rankingOnce, "and a repeated ranking keeps them too");
    results.push("structure-variety-scope");
  }

  /* 36. A fact list too long for one line is continued on indented lines, and no item is lost. */
  {
    const longStats = {
      "Life Steal": "+2%",
      "Spell Vampirism": "+2%",
      Health: "+3",
      "Mana Regeneration": "+0.1/s",
      "Stamina Regeneration": "+0.1/s",
      "2 Piece Set Bonus": "-0.6/s Health Regeneration, -50% Healing Received"
    };
    const longRequirements = [
      "Find 3 clues in the village of Vallhat (466, 87, 2999), (398, 126, 3080), (450, 119, 3116)",
      "Talk to the villager who saw the creatures"
    ].join("\n");
    const engine = createEngineStub((question) => {
      if (/suspended city/i.test(question)) {
        return engineResult({
          intent: "quest",
          entity: { id: "quest|the-suspended-city", type: "quest", name: "The Suspended City", recordPresent: true },
          entityType: "quest",
          facts: {
            name: "The Suspended City",
            quests: [
              {
                id: "sq-29",
                questName: "The Suspended City",
                questNumber: 29,
                npcName: "Baldim",
                coordinates: "466 / 2999",
                requirements: longRequirements,
                xpReward: 900,
                colReward: 500,
                bonusItems: null
              }
            ],
            markers: []
          }
        });
      }
      return engineResult({
        intent: "item",
        entity: { id: "item|occult-gloves", type: "item", name: "Occult Gloves", recordPresent: true },
        entityType: "item",
        facts: {
          name: "Occult Gloves",
          record: {
            category: "accessory",
            level: 10,
            set: "Shadow Neophyte Set",
            description: null,
            stats: longStats,
            craftingResources: [],
            craftingLocation: null
          },
          droppedBy: []
        }
      });
    });
    const h = createHarness({ engine });
    h.api.open();
    const ask = (question) => {
      h.input.value = question;
      h.form.dispatch("submit", {});
      return h.messageText(h.messages().length - 1);
    };
    const factLines = (reply) => reply.split("\n").filter((line) => line && !isDialogueLine(line));
    /* The labelled line plus the indented continuation lines that belong to it. */
    const blockAfter = (lines, prefix) => {
      const start = lines.findIndex((line) => line.startsWith(prefix));
      if (start < 0) return [];
      const block = [lines[start]];
      for (let index = start + 1; index < lines.length && lines[index].startsWith("  "); index += 1) {
        block.push(lines[index]);
      }
      return block;
    };
    /* The items of a block, rejoined: the label is dropped and each continuation is trimmed, so the
       result is the one-line list the block was built from. */
    const itemsOf = (block, label) =>
      block.map((line, index) => (index === 0 ? line.replace(`${label}: `, "") : line.trim())).join(" · ");

    const itemReply = ask("what are the stats on occult gloves");
    const itemLines = factLines(itemReply);
    const statsBlock = blockAfter(itemLines, "Stats: ");
    const expectedStats = Object.entries(longStats)
      .map(([key, value]) => `${key} ${value}`)
      .join(" · ");
    assert.ok(
      statsBlock.length > 1,
      `a long stats list is continued on indented lines (got ${JSON.stringify(statsBlock)})`
    );
    assert.equal(itemsOf(statsBlock, "Stats"), expectedStats, "the wrapped stats list carries exactly the same items");
    assert.equal(
      statsBlock.slice(1).every((line) => line.startsWith("  ")),
      true,
      "every continuation is indented under its label"
    );
    assert.equal(
      itemLines.some((line) => line.trim().length === 0),
      false,
      "the wrapping introduces no blank line"
    );
    assert.equal(/\{\w+\}/.test(itemReply), false, "the wrapped answer leaves no unresolved placeholder");

    const questReply = ask("where is the suspended city");
    const questLines = factLines(questReply);
    const requirementBlock = blockAfter(questLines, "Requirements: ");
    const expectedRequirements = longRequirements.split("\n").join(" · ");
    assert.ok(requirementBlock.length > 1, "a long requirement list is continued on indented lines");
    assert.equal(
      itemsOf(requirementBlock, "Requirements"),
      expectedRequirements,
      "the wrapped requirement list carries exactly the same steps"
    );
    assert.equal(/\{\w+\}/.test(questReply), false, "the wrapped quest answer leaves no unresolved placeholder");

    /* A list that already fits is left on one line, exactly as it always was. */
    const shortItem = engineResult({
      intent: "item",
      entity: { id: "item|plain-ring", type: "item", name: "Plain Ring", recordPresent: true },
      entityType: "item",
      facts: {
        name: "Plain Ring",
        record: {
          category: "accessory",
          level: 2,
          set: null,
          description: null,
          stats: { Defense: "+1", Health: "+2" },
          craftingResources: [],
          craftingLocation: null
        },
        droppedBy: []
      }
    });
    const shortHarness = createHarness({ engine: createEngineStub(() => shortItem) });
    shortHarness.api.open();
    shortHarness.input.value = "what are the stats on plain ring";
    shortHarness.form.dispatch("submit", {});
    const shortLines = factLines(shortHarness.messageText(shortHarness.messages().length - 1));
    assert.deepEqual(
      shortLines,
      ["Plain Ring — Accessory · Lv 2", "Stats: Defense +1 · Health +2"],
      "a list that fits stays on one line"
    );
    results.push("long-list-formatting");
  }

  /* 37. The "I can only see…" caveat appears only when a source the world really needs is missing. */
  {
    const english = flatten(loadTranslations().en);
    const sourcesTemplate = english["argo.status.sourcesAvailable"];
    const availabilityLine = (sources) => sourcesTemplate.replace("{sources}", sources);
    const aincradContext = { world: "aincrad", dataset: "current", floor: "floor1", language: "en" };
    const underworldContext = { world: "underworld", dataset: "current", floor: "playerIsland", language: "en" };

    const cases = [
      {
        name: "aincrad with every source the world has",
        context: aincradContext,
        status: "unsupported",
        sources: {
          bestiary: true,
          equipment: true,
          markers: true,
          mobAreas: true,
          quests: true,
          compendium: false,
          contentTranslations: true
        },
        expected: null
      },
      {
        name: "aincrad with only the Bestiary loaded",
        context: aincradContext,
        status: "unsupported",
        sources: {
          bestiary: true,
          equipment: false,
          markers: false,
          mobAreas: false,
          quests: false,
          compendium: false,
          contentTranslations: true
        },
        expected: "Bestiary"
      },
      {
        name: "aincrad with a partly known record and every source",
        context: aincradContext,
        status: "missing",
        intent: "item",
        entity: { id: "item|spider-silk", type: "item", name: "Spider Silk", recordPresent: false },
        facts: { name: "Spider Silk", record: null, droppedBy: [{ mob: "Forest Spider", chance: 85 }] },
        sources: {
          bestiary: true,
          equipment: true,
          markers: true,
          mobAreas: true,
          quests: true,
          compendium: false,
          contentTranslations: true
        },
        expected: null
      },
      {
        name: "underworld with every source the island has",
        context: underworldContext,
        status: "unsupported",
        sources: {
          bestiary: false,
          equipment: false,
          markers: false,
          mobAreas: false,
          quests: true,
          compendium: true,
          contentTranslations: true
        },
        expected: null
      },
      {
        name: "underworld with no compendium",
        context: underworldContext,
        status: "unsupported",
        sources: {
          bestiary: false,
          equipment: false,
          markers: false,
          mobAreas: false,
          quests: true,
          compendium: false,
          contentTranslations: true
        },
        expected: "Quests"
      }
    ];

    for (const testCase of cases) {
      const h = createHarness({
        engine: createEngineStub(() =>
          engineResult({
            status: testCase.status,
            intent: testCase.intent || "unknown",
            entity: testCase.entity || null,
            entityType: testCase.entity ? testCase.entity.type : null,
            facts: testCase.facts || {},
            context: testCase.context,
            sources: testCase.sources,
            unsupportedReason: "no-entity-match",
            dataQuality: { complete: false, notes: ["absence-is-not-proof"] }
          })
        )
      });
      h.api.open();
      h.input.value = "where is the fluffy unicorn of doom";
      h.form.dispatch("submit", {});
      const lines = h
        .messageText(h.messages().length - 1)
        .split("\n")
        .filter(Boolean);
      const shown = lines.filter((line) => line.startsWith("On this page I can only see"));
      if (testCase.expected === null) {
        assert.deepEqual(shown, [], `${testCase.name} does not claim a source is missing`);
      } else {
        assert.deepEqual(
          shown,
          [availabilityLine(testCase.expected)],
          `${testCase.name} names exactly what it can see`
        );
      }
      /* A world the engine cannot name keeps the conservative full check. */
      if (testCase.expected === null) {
        assert.equal(/\{\w+\}/.test(lines.join("\n")), false, `${testCase.name} leaves no unresolved placeholder`);
      }
    }

    /* Without a world in the result the full source list is still required, so nothing silently stops
       reporting a genuinely missing source for an older caller. */
    const unknownWorld = createHarness({
      engine: createEngineStub(() =>
        engineResult({
          status: "unsupported",
          context: {},
          sources: {
            bestiary: true,
            equipment: true,
            markers: true,
            mobAreas: true,
            quests: true,
            compendium: false,
            contentTranslations: true
          },
          unsupportedReason: "no-entity-match",
          dataQuality: { complete: false, notes: ["absence-is-not-proof"] }
        })
      )
    });
    unknownWorld.api.open();
    unknownWorld.input.value = "where is the fluffy unicorn of doom";
    unknownWorld.form.dispatch("submit", {});
    assert.equal(
      unknownWorld
        .messageText(unknownWorld.messages().length - 1)
        .split("\n")
        .some((line) => line.startsWith("On this page I can only see")),
      true,
      "a result with no world keeps the conservative source check"
    );
    results.push("source-availability");
  }

  /* 38. A help answer stays the single help line, and the phrasing that names a record renders that
     record's facts. The wording layer renders whatever the engine resolved, so the engine's own reading
     of a help-shaped question shows through unchanged (the engine suite pins that interpretation). */
  {
    const english = loadTranslations().en;
    const helpValues = poolValues(english, "argo.help.body", HELP_SIZE);
    const helpHarness = createHarness({
      engine: createEngineStub(() =>
        engineResult({
          status: "answer",
          intent: "help",
          entity: null,
          entityType: null,
          shape: "help",
          facts: { intents: [] }
        })
      )
    });
    helpHarness.api.open();
    helpHarness.input.value = "what can you do";
    helpHarness.form.dispatch("submit", {});
    const helpReply = helpHarness.messageText(helpHarness.messages().length - 1);
    assert.equal(helpReply.split("\n").length, 1, "a help answer is a single line");
    assert.equal(helpValues.includes(helpReply), true, "and it is one of the help lines");

    const lookupHarness = createHarness({
      engine: createEngineStub(() =>
        engineResult({
          status: "answer",
          intent: "mob",
          entity: { id: "mob|corrupted-boar", type: "mob", name: "Corrupted Boar", recordPresent: true },
          entityType: "mob",
          shape: "identity",
          facts: {
            name: "Corrupted Boar",
            bestiary: { tab: "regular", xp: "1", floor: "floor1", dataset: "current" },
            drops: [{ item: "Boar Hide", itemId: "boar-hide", chance: 90, recordPresent: true }],
            spawnAreas: [{ areaId: "a1", area: "Wild Boar Zone", floor: "floor1", underground: false }],
            markers: [],
            quests: []
          }
        })
      )
    });
    lookupHarness.api.open();
    lookupHarness.input.value = "what do you know about the corrupted boar";
    lookupHarness.form.dispatch("submit", {});
    const lookupReply = lookupHarness.messageText(lookupHarness.messages().length - 1);
    const lookupLines = lookupReply.split("\n");
    assert.match(lookupReply, /Corrupted Boar/, "the named record is answered");
    assert.match(lookupReply, /Drops: Boar Hide \(90%\)/, "with its own facts");
    assert.equal(
      helpValues.some((line) => lookupLines.includes(line)),
      false,
      "and never with the capability list instead"
    );
    results.push("help-phrase-lookups");
  }

  /* 39. Every rendered string goes through the i18n layer, every argo.* key the module renders is in the
     localization list, and the UI never overrides the page's own language. */
  {
    const engine = createEngineStub(() =>
      engineResult({
        intent: "item",
        entity: { id: "item|spider-silk", type: "item", name: "Spider Silk", recordPresent: false },
        entityType: "item",
        facts: { name: "Spider Silk", record: null, droppedBy: [{ mob: "Forest Spider", chance: 85 }] },
        context: { world: "aincrad", dataset: "current", floor: "floor1", language: "es" },
        dataQuality: { complete: false, notes: ["item-record-missing", "floor-inferred"] }
      })
    );
    const provider = { isReady: () => true, ensure: () => Promise.resolve(), getDatasetHint: () => "current" };
    const h = createHarness({ engine, provider, translatePrefix: "T:", language: "es" });
    h.api.open();
    h.input.value = "donde esta spider silk";
    h.form.dispatch("submit", {});
    const reply = h.messageText(h.messages().length - 1);
    const lines = reply.split("\n").filter(Boolean);
    /* Every dialogue line is fetched through the i18n layer, never hardcoded in English. */
    const dialogue = lines.filter((line) => !/^Spider Silk|^Dropped by:/.test(line));
    assert.ok(dialogue.length > 0, "the answer carries dialogue lines");
    assert.equal(
      dialogue.every((line) => line.startsWith("T:")),
      true,
      `every dialogue line is localized (reply: ${JSON.stringify(reply)})`
    );
    assert.equal(/\{\w+\}/.test(reply), false, "no unresolved placeholder reaches a localized answer");

    /* The UI hands the engine the dataset and nothing else, so the engine resolves the language from the
       page itself and a localized question is never forced into English. */
    assert.equal(engine.calls.length > 0, true, "the engine was consulted");
    assert.equal(
      engine.calls.every((call) => JSON.stringify(call.context) === JSON.stringify({ dataset: "current" })),
      true,
      `the UI passes no language of its own (${JSON.stringify(engine.calls.map((call) => call.context))})`
    );

    /* Every argo.* key the module renders is covered by the localization key list. */
    const literals = [
      ...new Set([...argoSource.matchAll(/"argo\.[A-Za-z0-9.]+"/g)].map((match) => match[0].slice(1, -1)))
    ];
    assert.ok(literals.length > 0, "the module renders argo.* keys");
    for (const literal of literals) {
      assert.equal(
        ARGO_TEXT_KEYS.some((key) => key === literal || key.startsWith(`${literal}.`)),
        true,
        `${literal} is covered by the localization key list`
      );
    }
    results.push("localized-rendering");
  }

  /* 40. An answer links to the site's own page for the record it is about, with only the parameters the
     target page really reads and only when this page publishes the route. */
  {
    const HOST = "https://example.test";
    const AINCRAD_PAGE = `${HOST}/Aincrad/Bestiary/bestiary.html`;
    const UNDERWORLD_PAGE = `${HOST}/Fractured%20Underworld/Compendium/compendium.html`;
    const aincrad = { world: "aincrad", dataset: "current", floor: "floor1", language: "en" };
    const underworld = { world: "underworld", dataset: "current", floor: "playerIsland", language: "en" };

    const linksOf = (message) => descendants(message).filter((child) => child.tagName === "A");
    const askOnce = (result, pageHref) => {
      const h = createHarness({
        engine: createEngineStub(() => result),
        pageRoutes: true,
        pageHref: pageHref || AINCRAD_PAGE
      });
      h.api.open();
      h.input.value = "where is it";
      h.form.dispatch("submit", {});
      const message = h.messages()[h.messages().length - 1];
      return { message, links: linksOf(message) };
    };
    const entity = (type, name) => ({
      id: `${type}|${name.toLowerCase().replace(/\s+/g, "-")}`,
      type,
      name,
      recordPresent: true
    });

    const cases = [
      {
        name: "a location opens the map, filtered to the marker",
        context: aincrad,
        href: `${HOST}/Aincrad/Map/maps.html?floor=floor1&search=Castlebrume`,
        label: "→ Map",
        overrides: {
          intent: "location",
          entityType: "location",
          entity: entity("location", "Castlebrume"),
          facts: { name: "Castlebrume", markers: [], areas: [], mobs: [] }
        }
      },
      {
        name: "a dungeon opens the map too",
        context: aincrad,
        href: `${HOST}/Aincrad/Map/maps.html?floor=floor1&search=Geldorack`,
        label: "→ Map",
        overrides: {
          intent: "location",
          entityType: "dungeon",
          entity: entity("dungeon", "Geldorack"),
          facts: { name: "Geldorack", markers: [], areas: [], mobs: [] }
        }
      },
      {
        name: "a merchant opens the map",
        context: aincrad,
        href: `${HOST}/Aincrad/Map/maps.html?floor=floor1&search=Alchemist`,
        label: "→ Map",
        overrides: {
          intent: "npc",
          entityType: "merchant",
          entity: entity("merchant", "Alchemist"),
          facts: { name: "Alchemist", markers: [], requests: [], appearsIn: [], sells: [] }
        }
      },
      {
        name: "a mob opens the Bestiary, filtered to it",
        context: aincrad,
        href: `${HOST}/Aincrad/Bestiary/bestiary.html?floor=floor1&search=Corrupted+Boar&category=regular`,
        label: "→ Bestiary",
        overrides: {
          intent: "mob",
          entityType: "mob",
          entity: entity("mob", "Corrupted Boar"),
          facts: {
            name: "Corrupted Boar",
            bestiary: { tab: "regular", xp: "1" },
            drops: [],
            spawnAreas: [],
            markers: [],
            quests: []
          }
        }
      },
      {
        name: "a boss opens the Bestiary on the Boss List",
        context: aincrad,
        href: `${HOST}/Aincrad/Bestiary/bestiary.html?floor=floor1&search=Illfang&category=boss`,
        label: "→ Bestiary",
        overrides: {
          intent: "mobDrops",
          entityType: "boss",
          entity: entity("boss", "Illfang"),
          facts: { mob: "Illfang", bestiaryTab: "boss", xp: null, drops: [] }
        }
      },
      {
        name: "a drop lookup opens the Bestiary, whose search matches drop names",
        context: aincrad,
        href: `${HOST}/Aincrad/Bestiary/bestiary.html?floor=floor1&search=Boar+Hide`,
        label: "→ Bestiary",
        overrides: {
          intent: "drop",
          entityType: "item",
          entity: entity("item", "Boar Hide"),
          facts: {
            item: "Boar Hide",
            itemRecordPresent: false,
            droppedBy: [{ mob: "Corrupted Boar", bestiaryTab: "regular", chance: 90 }]
          }
        }
      },
      {
        name: "a farming lookup opens the Bestiary too",
        context: aincrad,
        href: `${HOST}/Aincrad/Bestiary/bestiary.html?floor=floor1&search=Boar+Hide`,
        label: "→ Bestiary",
        overrides: {
          intent: "farming",
          entityType: "item",
          entity: entity("item", "Boar Hide"),
          facts: {
            item: "Boar Hide",
            sourceCount: 1,
            sources: [{ mob: "Corrupted Boar", bestiaryTab: "regular", chance: 90 }]
          }
        }
      },
      {
        /* A source with no Bestiary tab recorded cannot be linked to a list, so the section link is the
           only way into the Bestiary and it stays. */
        name: "a drop source with no recorded list keeps the section link",
        context: aincrad,
        keepsSection: true,
        href: `${HOST}/Aincrad/Bestiary/bestiary.html?floor=floor1&search=Boar+Hide`,
        label: "→ Bestiary",
        overrides: {
          intent: "drop",
          entityType: "item",
          entity: entity("item", "Boar Hide"),
          facts: {
            item: "Boar Hide",
            itemRecordPresent: false,
            droppedBy: [{ mob: "Corrupted Boar", chance: 90 }]
          }
        }
      },
      {
        name: "an item opens the equipment section on its own tab, filtered to it",
        context: aincrad,
        href: `${HOST}/Aincrad/eCompendium/ecompendium.html?floor=floor1&search=Training+Bow&category=weapon`,
        label: "→ Equipment",
        overrides: {
          intent: "item",
          entityType: "item",
          entity: entity("item", "Training Bow"),
          facts: { name: "Training Bow", record: { category: "weapon", level: 1 }, droppedBy: [] }
        }
      },
      {
        /* The recipe facts carry no equipment record, so nothing in the answer can be linked to the page
           itself: the section link is the only navigation and it stays. */
        name: "a recipe opens the equipment section, filtered to the item",
        context: aincrad,
        keepsSection: true,
        href: `${HOST}/Aincrad/eCompendium/ecompendium.html?floor=floor1&search=Training+Bow`,
        label: "→ Equipment",
        overrides: {
          intent: "recipe",
          entityType: "item",
          entity: entity("item", "Training Bow"),
          facts: { item: "Training Bow", craftingResources: [], craftingLocation: null }
        }
      },
      {
        /* A drop-only item has no equipment record, so the eCompendium would show nothing for it. Its
           drop origins live in the Bestiary, whose search matches drop names. */
        name: "a drop-only item opens the Bestiary, where its drop origins really are",
        context: aincrad,
        href: `${HOST}/Aincrad/Bestiary/bestiary.html?floor=floor1&search=Spider+Silk`,
        label: "→ Bestiary",
        overrides: {
          intent: "item",
          entityType: "item",
          entity: entity("item", "Spider Silk"),
          facts: { name: "Spider Silk", record: null, droppedBy: [{ mob: "Forest Spider", chance: 85 }] }
        }
      },
      {
        /* A mob the Bestiary has no row for is only on the map, by its spawn area - and its own name is
           not a map marker, so the spawn area is what the search has to carry. */
        name: "a mob with no Bestiary row opens the map on its spawn area, with the area category on",
        context: aincrad,
        href: `${HOST}/Aincrad/Map/maps.html?floor=floor1&search=Wild+Boar+Zone&categories=mobAreas`,
        label: "→ Map",
        overrides: {
          intent: "mob",
          entityType: "mob",
          entity: entity("mob", "Deer"),
          facts: {
            name: "Deer",
            bestiary: null,
            drops: [],
            spawnAreas: [{ area: "Wild Boar Zone" }],
            markers: [],
            quests: []
          }
        }
      },
      {
        /* The mobDrops facts carry the tab rather than the record and no spawn area at all, so a mob the
           Bestiary does not hold gets the map section without a search term the map could not match. */
        name: "a drop question about a mob with no Bestiary row opens the map unfiltered",
        context: aincrad,
        href: `${HOST}/Aincrad/Map/maps.html?floor=floor1`,
        label: "→ Map",
        overrides: {
          intent: "mobDrops",
          entityType: "mob",
          entity: entity("mob", "Deer"),
          facts: { mob: "Deer", bestiaryTab: null, xp: null, drops: [] }
        }
      },
      {
        /* A location's facts carry mobs, never spawn areas, so the spawn-area rule cannot reach it. */
        name: "a location still searches the map for its own name",
        context: aincrad,
        href: `${HOST}/Aincrad/Map/maps.html?floor=floor1&search=Castlebrume`,
        label: "→ Map",
        overrides: {
          intent: "location",
          entityType: "location",
          entity: entity("location", "Castlebrume"),
          facts: { name: "Castlebrume", markers: [], areas: [], mobs: [{ name: "Deer" }] }
        }
      },

      {
        /* The Quests page pre-fills its own search box from ?search= and opens the type's tab from ?type=,
           exactly as the map's waypoint links do (Aincrad/Map/maps.js getFloorSpecificQuestsUrl). */
        name: "a quest opens the Quests section filtered to that quest and its own tab",
        context: aincrad,
        href: `${HOST}/Aincrad/Quests/quests.html?floor=floor1&search=A+New+World&type=main`,
        label: "→ Quests",
        overrides: {
          intent: "quest",
          entityType: "quest",
          entity: entity("quest", "A New World"),
          facts: { name: "A New World", quests: [{ questName: "A New World", questType: "main" }], markers: [] }
        }
      },
      {
        /* A list of quests has no single record to select, so only its tab travels with the link. */
        name: "a collection of quests opens the Quests section on the type it listed",
        context: aincrad,
        /* No record rows came back, so there is nothing to link to individually and the section link is
           the only way into the list. */
        keepsSection: true,
        href: `${HOST}/Aincrad/Quests/quests.html?floor=floor1&type=side`,
        label: "→ Quests",
        overrides: {
          intent: "collection",
          entityType: null,
          entity: null,
          facts: { target: "quest", total: 3, shown: 3, records: [], filters: { questType: "side" } }
        }
      },
      {
        name: "a collection of mobs opens the Bestiary",
        context: aincrad,
        keepsSection: true,
        href: `${HOST}/Aincrad/Bestiary/bestiary.html?floor=floor1`,
        label: "→ Bestiary",
        overrides: {
          intent: "collection",
          entityType: null,
          entity: null,
          facts: { target: "mob", total: 34, shown: 10, records: [], filters: {} }
        }
      },
      {
        name: "a ranking of weapons opens the equipment section",
        context: aincrad,
        href: `${HOST}/Aincrad/eCompendium/ecompendium.html?floor=floor1`,
        label: "→ Equipment",
        overrides: {
          intent: "ranking",
          entityType: null,
          entity: null,
          facts: {
            target: "item",
            field: "Attack Damage",
            ranked: [{ name: "Herald's Scythe", type: "item", category: "weapon", value: 19 }],
            filters: {}
          }
        }
      },
      {
        name: "an Underworld compendium item opens the Compendium with the island",
        context: underworld,
        href: `${HOST}/Fractured%20Underworld/Compendium/compendium.html?floor=playerIsland`,
        label: "→ Equipment",
        overrides: {
          intent: "item",
          entityType: "item",
          entity: entity("item", "Some Relic"),
          facts: {
            name: "Some Relic",
            record: null,
            droppedBy: [],
            compendium: [{ name: "Some Relic", category: "relic" }]
          }
        }
      }
    ];

    for (const testCase of cases) {
      const result = engineResult(Object.assign({ context: testCase.context }, testCase.overrides));
      const page = testCase.context === underworld ? UNDERWORLD_PAGE : AINCRAD_PAGE;
      const { message, links } = askOnce(result, page);
      const body = message.querySelector(".argo-message-body");
      const elementNodes = elementChildren(body);
      /* The record link is inside the answer, so the section link is the one that carries the site's own
         navigation label. */
      const sectionLinks = links.filter((anchor) => anchor.textContent.startsWith("→ "));
      const recordLinks = links.filter((anchor) => !anchor.textContent.startsWith("→ "));
      const expectedPath = new URL(testCase.href).pathname;

      if (!testCase.keepsSection) {
        /* The record link has taken the section link's place: the answer already reaches that page, and
           more precisely than a section link could. */
        assert.equal(sectionLinks.length, 0, `${testCase.name}: no redundant section link`);
        assert.ok(recordLinks.length > 0, `${testCase.name}: the record itself is linked`);
        for (const anchor of recordLinks) {
          const href = anchor.getAttribute("href");
          assert.equal(new URL(href).pathname, expectedPath, `${testCase.name}: the record link goes to the page`);
          assert.equal(href.startsWith(HOST), true, `${testCase.name}: same origin`);
          assert.equal(body.textContent.includes(anchor.textContent), true, `${testCase.name}: it names something said`);
        }
        assert.equal(
          links[links.length - 1],
          recordLinks[recordLinks.length - 1],
          `${testCase.name}: nothing trails it`
        );
      } else {
        assert.equal(sectionLinks.length, 1, `${testCase.name}: exactly one section link`);
        assert.equal(sectionLinks[0].getAttribute("href"), testCase.href, `${testCase.name}: the destination`);
        assert.equal(
          sectionLinks[0].textContent,
          testCase.label,
          `${testCase.name}: the site's own section name is the label`
        );
        assert.equal(
          elementNodes[elementNodes.length - 1],
          sectionLinks[0],
          `${testCase.name}: the link follows the facts`
        );
        /* Anything else linked inside the answer names something the answer actually says. */
        for (const anchor of recordLinks) {
          assert.equal(
            body.textContent.includes(anchor.textContent),
            true,
            `${testCase.name}: the record link names something in the answer`
          );
        }
      }
      assert.ok(body.textContent.split("\n").length > 1, `${testCase.name}: the answer itself is unchanged`);
      /* The href is resolved against this page, so it is always same-origin http(s). */
      assert.equal(links[0].getAttribute("href").startsWith(HOST), true, `${testCase.name}: same origin`);
      assert.equal(
        /\bjavascript:|\bdata:/i.test(links[0].getAttribute("href")),
        false,
        `${testCase.name}: no unsafe scheme`
      );
    }
    results.push("answer-link-destinations");
  }

  /* 40b. The record links: the name Argo says is the link, and the destination really shows that record.
     The fixtures mirror the shipped records exactly - the Occult Gloves row, the two Boar Hide sources
     with their own Bestiary tabs, and the Castlebrume biome marker. */
  {
    const HOST = "https://example.test";
    const AINCRAD_PAGE = `${HOST}/Aincrad/Bestiary/bestiary.html`;
    const aincrad = { world: "aincrad", dataset: "current", floor: "floor1", language: "en" };
    const routes = { pageRoutes: true, pageHref: AINCRAD_PAGE };
    const ask = (result) => {
      const h = createHarness(Object.assign({ engine: createEngineStub(() => result) }, routes));
      h.api.open();
      h.input.value = "a question";
      h.form.dispatch("submit", {});
      const body = h.messages()[h.messages().length - 1].querySelector(".argo-message-body");
      return { text: body.textContent, anchors: elementChildren(body).filter((child) => child.tagName === "A") };
    };
    const hrefOf = (answer, name) => {
      const found = answer.anchors.find((anchor) => anchor.textContent === name);
      return found ? found.getAttribute("href") : null;
    };

    /* The reported question: the item's own name opens its own equipment record. */
    const item = engineResult({
      context: aincrad,
      intent: "item",
      entityType: "item",
      entity: { id: "item|occult-gloves", type: "item", name: "Occult Gloves", recordPresent: true },
      facts: {
        name: "Occult Gloves",
        record: {
          category: "accessory",
          level: 10,
          set: "Shadow Neophyte Set",
          stats: { "Life Steal": "+2%" },
          craftingResources: [],
          craftingLocation: "Occult Merchant - Gloves"
        },
        droppedBy: [],
        craftingLocationMarker: null
      }
    });
    const itemAnswer = ask(item);
    assert.equal(
      hrefOf(itemAnswer, "Occult Gloves"),
      `${HOST}/Aincrad/eCompendium/ecompendium.html?floor=floor1&search=Occult+Gloves&category=accessory`,
      "the item name opens its own equipment record on its own tab"
    );
    assert.match(itemAnswer.text, /Occult Gloves/, "and the name is still part of the answer");

    /* A collection: every record name opens its own result, and the metadata stays. */
    const collection = engineResult({
      context: aincrad,
      intent: "collection",
      entity: null,
      entityType: null,
      facts: {
        target: "item",
        total: 2,
        shown: 2,
        filters: { category: null, text: ["occult"] },
        records: [
          {
            id: "item|occult-amulet",
            name: "Occult Amulet",
            type: "item",
            source: "equipment",
            category: "accessory",
            level: 10,
            craftingLocation: "Occult Merchant - Amulet"
          },
          {
            id: "item|occult-gloves",
            name: "Occult Gloves",
            type: "item",
            source: "equipment",
            category: "accessory",
            level: 10,
            craftingLocation: "Occult Merchant - Gloves"
          }
        ],
        otherFloors: []
      }
    });
    const listAnswer = ask(collection);
    for (const [name, merchant] of [
      ["Occult Amulet", "Occult Merchant - Amulet"],
      ["Occult Gloves", "Occult Merchant - Gloves"]
    ]) {
      assert.equal(
        hrefOf(listAnswer, name),
        `${HOST}/Aincrad/eCompendium/ecompendium.html?floor=floor1&search=${name.replace(" ", "+")}&category=accessory`,
        `${name} opens its own record`
      );
      assert.equal(listAnswer.text.includes(merchant), true, `${name} keeps its own crafting location`);
    }
    assert.match(listAnswer.text, /• Occult Amulet \(Accessory · Lv 10/, "the record metadata is kept");

    results.push("record-links");
  }

  /* 40c. The trailing section link is only kept when it adds something. Once the answer links records
     into a section, a second link to that same page is noise: the record links already reach it, and more
     precisely. When nothing in the answer reached that section - a result with no name to link, a record
     the datasets do not hold - the section link stays, because there it is the only way in. Records are
     never deduplicated against each other: two sources, two items, two tabs all keep their own link. */
  {
    const HOST = "https://example.test";
    const AINCRAD_PAGE = `${HOST}/Aincrad/Bestiary/bestiary.html`;
    const aincrad = { world: "aincrad", dataset: "current", floor: "floor1", language: "en" };
    const routes = { pageRoutes: true, pageHref: AINCRAD_PAGE };
    const ask = (result) => {
      const h = createHarness(Object.assign({ engine: createEngineStub(() => result) }, routes));
      h.api.open();
      h.input.value = "a question";
      h.form.dispatch("submit", {});
      const body = h.messages()[h.messages().length - 1].querySelector(".argo-message-body");
      const anchors = elementChildren(body).filter((child) => child.tagName === "A");
      return {
        anchors,
        sectionLinks: anchors.filter((child) => child.textContent.startsWith("→ ")),
        recordLinks: anchors.filter((child) => !child.textContent.startsWith("→ "))
      };
    };
    const hrefOf = (answer, name) => {
      const found = answer.recordLinks.find((anchor) => anchor.textContent === name);
      return found ? found.getAttribute("href") : null;
    };

    /* The reported map answer: Castlebrume is linked to the marker itself, so no generic Map link trails. */
    const location = ask(
      engineResult({
        context: aincrad,
        intent: "location",
        entityType: "location",
        entity: { id: "location|castlebrume", type: "location", name: "Castlebrume", recordPresent: true },
        facts: { name: "Castlebrume", markers: [{ category: "biomes" }], areas: [], mobs: [] }
      })
    );
    assert.equal(location.sectionLinks.length, 0, "a linked location needs no second link to the map");
    assert.equal(
      hrefOf(location, "Castlebrume"),
      `${HOST}/Aincrad/Map/maps.html?floor=floor1&search=Castlebrume&categories=biomes`,
      "the direct link keeps its category and search"
    );

    /* The reported item answer: the item's own record is linked, so no generic Equipment link trails. */
    const item = ask(
      engineResult({
        context: aincrad,
        intent: "item",
        entityType: "item",
        entity: { id: "item|occult-gloves", type: "item", name: "Occult Gloves", recordPresent: true },
        facts: {
          name: "Occult Gloves",
          record: { category: "accessory", level: 10, stats: {}, craftingResources: [], craftingLocation: null },
          droppedBy: [],
          craftingLocationMarker: null
        }
      })
    );
    assert.equal(item.sectionLinks.length, 0, "a linked item needs no second link to the equipment list");
    assert.equal(
      hrefOf(item, "Occult Gloves"),
      `${HOST}/Aincrad/eCompendium/ecompendium.html?floor=floor1&search=Occult+Gloves&category=accessory`,
      "the direct link keeps its own tab and search"
    );

    /* A collection: every item keeps its own link, and no generic Equipment link is added on top. */
    const collection = ask(
      engineResult({
        context: aincrad,
        intent: "collection",
        entity: null,
        entityType: null,
        facts: {
          target: "item",
          total: 3,
          shown: 3,
          filters: {},
          records: [
            { id: "item|a", name: "Occult Amulet", type: "item", source: "equipment", category: "accessory" },
            { id: "item|b", name: "Occult Gloves", type: "item", source: "equipment", category: "accessory" },
            { id: "item|c", name: "Occult Ring", type: "item", source: "equipment", category: "accessory" }
          ]
        }
      })
    );
    assert.equal(collection.sectionLinks.length, 0, "the item links already provide the navigation");
    assert.deepEqual(
      collection.recordLinks.map((anchor) => anchor.textContent).sort(),
      ["Occult Amulet", "Occult Gloves", "Occult Ring"],
      "each item keeps its own link"
    );
    assert.deepEqual(
      collection.recordLinks.map((anchor) => anchor.getAttribute("href")).sort(),
      [
        `${HOST}/Aincrad/eCompendium/ecompendium.html?floor=floor1&search=Occult+Amulet&category=accessory`,
        `${HOST}/Aincrad/eCompendium/ecompendium.html?floor=floor1&search=Occult+Gloves&category=accessory`,
        `${HOST}/Aincrad/eCompendium/ecompendium.html?floor=floor1&search=Occult+Ring&category=accessory`
      ],
      "three records on one page are not deduplicated against each other"
    );

    /* A drop lookup: each source opens its own Bestiary list, so no generic Bestiary search trails. */
    const drop = ask(
      engineResult({
        context: aincrad,
        intent: "drop",
        entityType: "item",
        entity: { id: "item|boar-hide", type: "item", name: "Boar Hide", recordPresent: false },
        facts: {
          item: "Boar Hide",
          itemRecordPresent: false,
          droppedBy: [
            { mob: "Corrupted Boar", bestiaryTab: "regular", chance: 90 },
            { mob: "Corrupted Boar King", bestiaryTab: "boss", chance: 25 }
          ]
        }
      })
    );
    assert.equal(drop.sectionLinks.length, 0, "the sources' own links already reach the Bestiary");
    assert.deepEqual(
      drop.recordLinks.map((anchor) => anchor.getAttribute("href")).sort(),
      [
        `${HOST}/Aincrad/Bestiary/bestiary.html?floor=floor1&search=Corrupted+Boar&category=regular`,
        `${HOST}/Aincrad/Bestiary/bestiary.html?floor=floor1&search=Corrupted+Boar+King&category=boss`
      ],
      "each source keeps its own list, so two tabs on one page both survive"
    );

    /* A result with no name to link keeps the section link: there it is the only way in. */
    const nameless = ask(
      engineResult({
        context: aincrad,
        intent: "location",
        entityType: "location",
        entity: { id: "location|x", type: "location", name: "", recordPresent: false },
        facts: { name: "", markers: [], areas: [], mobs: [] }
      })
    );
    assert.deepEqual(nameless.recordLinks, [], "nothing can be linked to a record");
    assert.equal(nameless.sectionLinks.length, 1, "so the section link stays");
    assert.equal(nameless.sectionLinks[0].textContent, "→ Map", "and it is the site's own section name");
    assert.equal(
      nameless.sectionLinks[0].getAttribute("href"),
      `${HOST}/Aincrad/Map/maps.html?floor=floor1`,
      "pointed at the section, with no search invented"
    );

    /* Every anchor is still a plain same-origin link holding the record's own name. */
    for (const anchor of location.anchors.concat(item.anchors, collection.anchors, drop.anchors)) {
      assert.equal(anchor.getAttribute("href").startsWith(HOST), true, "same origin");
      assert.equal(/[<>"']/.test(anchor.getAttribute("href")), false, "no raw markup in the href");
      assert.equal(elementChildren(anchor).length, 0, "the anchor holds text only");
    }
    results.push("trailing-section-link-dedup");
  }

  /* 41. A link is offered only when it is safe and real: no destination means no link, and a tampered
     route table, an injected record name or a missing one can never become a broken or unsafe href. */
  {
    const HOST = "https://example.test";
    const AINCRAD_PAGE = `${HOST}/Aincrad/Bestiary/bestiary.html`;
    const aincrad = { world: "aincrad", dataset: "current", floor: "floor1", language: "en" };
    const linksOf = (message) => descendants(message).filter((child) => child.tagName === "A");
    const askWith = (result, options) => {
      const h = createHarness(Object.assign({ engine: createEngineStub(() => result) }, options || {}));
      h.api.open();
      h.input.value = "where is it";
      h.form.dispatch("submit", {});
      const message = h.messages()[h.messages().length - 1];
      return {
        harness: h,
        message,
        links: linksOf(message),
        text: message.querySelector(".argo-message-body").textContent
      };
    };
    const withRoutes = { pageRoutes: true, pageHref: AINCRAD_PAGE };

    /* No destination at all: nothing is invented, and the answer is still readable. */
    const noDestination = [
      {
        name: "a help answer",
        overrides: { status: "answer", intent: "help", entity: null, entityType: null, facts: {} }
      },
      {
        name: "an unsupported question",
        overrides: {
          status: "unsupported",
          intent: "unknown",
          entity: null,
          entityType: null,
          facts: {},
          unsupportedReason: "no-supported-question"
        }
      },
      {
        name: "an ambiguous match",
        overrides: {
          status: "ambiguous",
          intent: "unknown",
          entity: null,
          entityType: null,
          facts: {},
          candidates: [{ id: "mob|a", type: "mob", name: "A" }],
          clarification: { reason: "multiple-matches", options: [{ id: "mob|a", type: "mob", name: "A" }] }
        }
      },
      {
        name: "an Underworld quest, which has no page of its own",
        overrides: {
          status: "answer",
          intent: "quest",
          entity: { id: "quest|a", type: "quest", name: "A", recordPresent: true },
          entityType: "quest",
          context: { world: "underworld", dataset: "current", floor: "playerIsland", language: "en" },
          facts: { name: "A", quests: [{ questName: "A", questType: "main" }], markers: [] }
        }
      }
    ];
    for (const testCase of noDestination) {
      const result = engineResult(Object.assign({ context: aincrad }, testCase.overrides));
      const answer = askWith(result, withRoutes);
      assert.deepEqual(answer.links, [], `${testCase.name}: no link is invented`);
      assert.ok(answer.text.length > 0, `${testCase.name}: the answer is still readable`);
    }

    /* A page that publishes no routes - Aincrad/Tower Defense loads none of them - gets no link, and the
       answer text is byte-for-byte what it is on a page that does. */
    const location = engineResult({
      context: aincrad,
      intent: "location",
      entityType: "location",
      entity: { id: "location|castlebrume", type: "location", name: "Castlebrume", recordPresent: true },
      facts: { name: "Castlebrume", markers: [], areas: [], mobs: [] }
    });
    const withoutRoutes = askWith(location);
    const withRouteSupport = askWith(location, withRoutes);
    assert.deepEqual(withoutRoutes.links, [], "a page without the site's routes gets no link");
    assert.equal(withRouteSupport.links.length, 1, "a page with them does");
    /* The answer itself is unchanged: the record link either takes the place of the name already in the
       sentence or is added on its own line beneath it. */
    assert.equal(
      withRouteSupport.text === withoutRoutes.text ||
        withRouteSupport.text.startsWith(`${withoutRoutes.text}\n`),
      true,
      "the answer text is identical either way"
    );
    assert.equal(
      withRouteSupport.text.includes(withRouteSupport.links[0].textContent),
      true,
      "the link carries the record's own name, never new prose"
    );
    /* A record name is data, never markup: it is percent-encoded into the query, never used as the link
       text, and never parsed as an element. */
    const hostile = '"><img src=x onerror=alert(1)>';
    const hostileResult = engineResult({
      context: aincrad,
      intent: "location",
      entityType: "location",
      entity: { id: "location|hostile", type: "location", name: hostile, recordPresent: true },
      facts: { name: hostile, markers: [], areas: [], mobs: [] }
    });
    const hostileAnswer = askWith(hostileResult, withRoutes);
    /* The record name is the only link this answer carries, and it is a plain anchor holding text. */
    assert.equal(hostileAnswer.links.length, 1, "a hostile name still produces one ordinary record link");
    const hostileRecordLink = hostileAnswer.links[0];
    const hostileHref = hostileRecordLink.getAttribute("href");
    assert.equal(/[<>"']/.test(hostileHref), false, `the href carries no raw markup (${hostileHref})`);
    assert.equal(hostileRecordLink.textContent, hostile, "the link text is the record's own name, never markup");
    assert.equal(elementChildren(hostileRecordLink).length, 0, "the anchor holds text only, never an element");
    assert.equal(
      new URL(hostileHref).searchParams.get("search"),
      hostile,
      "the record name survives intact in the query"
    );
    assert.equal(new URL(hostileHref).origin, HOST, "and the destination is still this site");

    /* A tampered route table cannot turn a link into an external or an executable destination: the
       site's own resolver refuses both. */
    const tamperedRoutes = [
      ["another origin", "https://evil.example/steal.html"],
      ["an executable scheme", "javascript:alert(1)"]
    ];
    for (const [name, path] of tamperedRoutes) {
      const h = createHarness({ engine: createEngineStub(() => location), pageRoutes: true, pageHref: AINCRAD_PAGE });
      h.api.open();
      h.context.SAOPageUtils = Object.assign({}, h.context.SAOPageUtils, { SECTION_PATHS: { maps: path } });
      h.input.value = "where is it";
      h.form.dispatch("submit", {});
      assert.deepEqual(linksOf(h.messages()[h.messages().length - 1]), [], `a route to ${name} is refused`);
    }

    /* A record with no usable name still reaches its section, with no empty search parameter. */
    const nameless = engineResult({
      context: aincrad,
      intent: "location",
      entityType: "location",
      entity: { id: "location|nameless", type: "location", name: "   ", recordPresent: true },
      facts: { name: "   ", markers: [], areas: [], mobs: [] }
    });
    const namelessAnswer = askWith(nameless, withRoutes);
    assert.equal(namelessAnswer.links.length, 1, "the section is still reachable");
    assert.equal(
      namelessAnswer.links[0].getAttribute("href"),
      `${HOST}/Aincrad/Map/maps.html?floor=floor1`,
      "no empty search parameter is added"
    );

    /* A result with no context at all falls back to the Aincrad routes and invents no floor. */
    const contextless = engineResult({
      context: {},
      intent: "quest",
      entityType: "quest",
      entity: { id: "quest|a", type: "quest", name: "A", recordPresent: true },
      facts: { name: "A", quests: [{ questName: "A", questType: "main" }], markers: [] }
    });
    const contextlessAnswer = askWith(contextless, withRoutes);
    const contextlessSection = contextlessAnswer.links.filter((anchor) => anchor.textContent.startsWith("→ "));
    assert.equal(contextlessSection.length, 0, "no section link repeats what the record link already reaches");
    /* The quest's own name is the link, with no floor parameter invented. */
    assert.equal(
      contextlessAnswer.links.length,
      1,
      "a contextless result still links the record itself"
    );
    assert.equal(
      contextlessAnswer.links[0].getAttribute("href"),
      `${HOST}/Aincrad/Quests/quests.html?search=A&type=main`,
      "and invents no floor"
    );
    assert.equal(contextlessAnswer.links[0].textContent, "A", "the record's own name is the link text");

    /* An unknown record type has no destination, so the answer stays link-free. */
    const unknownType = engineResult({
      context: aincrad,
      intent: "unknown",
      entityType: null,
      entity: { id: "unknown|thing", type: "unknown", name: "Thing", recordPresent: true },
      facts: {}
    });
    assert.deepEqual(askWith(unknownType, withRoutes).links, [], "an unknown record type gets no link");
    results.push("answer-link-safety");
  }

  return results;
}

run()
  .then((results) => {
    console.log(`Argo window checks passed (${results.length} groups):`);
    results.forEach((name) => console.log(`  - ${name}`));
  })
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
