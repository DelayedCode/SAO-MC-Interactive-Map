/* Argo's cross-page data provider (window.SAOArgoData).
 *
 * Makes the active world's Current-Data records available to shared/sao-argo-engine.js, whichever page
 * the visitor happens to be on. It does that by loading shared/sao-argo-data-frame.html in a hidden,
 * sandboxed iframe: the frame loads the site's real Current-Data files in its own global scope and posts
 * the records back, so this page never declares a second `DATA`/`MOB_AREA_MOBS` and nothing else on the
 * page can be disturbed. Beta-Test Data is not loaded, registered or answered at all.
 *
 * World isolation is enforced here, before the engine ever sees the records: an Aincrad page is only ever
 * handed Aincrad sources, an Underworld page only Underworld ones. The dataset is resolved per question
 * (see getDatasetHint) so changing the site's dataset mode while the window is open is honoured.
 *
 * Privacy and cost: nothing is written to storage, nothing is sent anywhere, no conversation is kept.
 * The frame loads once per page session, only when the window is opened or a question is asked, and the
 * engine caches its index per world+dataset+floor, so later questions are lookups.
 */
(function (global) {
  "use strict";

  const FRAME_FILE = "sao-argo-data-frame.html";
  const FRAME_ID = "argo-data-frame";
  const MESSAGE_TYPE = "sao-argo-data";
  const SCRIPT_FILE_NAME = "sao-argo-data-provider.js";
  const LOAD_TIMEOUT_MS = 12000;
  /* The Character Build page keeps its own data-source toggle instead of the site-wide dataset
     authority, so that control is read directly rather than assumed. */
  const CHARACTER_BUILD_SOURCE_SELECTOR = ".source-control [data-source].is-active";
  const DATASET_VALUES = Object.freeze(["current", "beta"]);

  /* Which snapshot keys the engine may be given for each world. This list is the isolation boundary:
     an Underworld page is never handed an Aincrad record, and vice versa. Only Current-Data sources are
     listed - the engine answers from Current Data alone. */
  const AINCRAD_SOURCE_KEYS = Object.freeze([
    "markerData",
    "mobAreaMobs",
    "currentMobAreas",
    "currentMobAreaLinks",
    "currentBestiary",
    "currentEquipment",
    "currentQuests"
  ]);
  const UNDERWORLD_SOURCE_KEYS = Object.freeze(["underworldCompendium", "currentQuests"]);

  const state = {
    promise: null,
    frame: null,
    snapshot: null,
    sources: null,
    world: null,
    ready: false,
    failed: false,
    cleanup: null
  };

  function isPlainObject(value) {
    return Boolean(value) && typeof value === "object" && !Array.isArray(value);
  }

  /* Resolved from this script's own src, so the frame is found from any page depth. It has to be read
     while this script is still executing: document.currentScript is null once the load is over. */
  function detectScriptUrl() {
    const doc = global.document;
    if (!doc) return "";
    try {
      if (doc.currentScript && doc.currentScript.src) return doc.currentScript.src;
    } catch (_error) {
      /* Fall through to the selector lookup. */
    }
    try {
      const tag = doc.querySelector(`script[src*="${SCRIPT_FILE_NAME}"]`);
      return tag && tag.src ? tag.src : "";
    } catch (_error) {
      return "";
    }
  }

  let scriptSrcCache = null;

  function scriptUrl() {
    if (scriptSrcCache === null) scriptSrcCache = detectScriptUrl();
    return scriptSrcCache;
  }

  /* The page's own world decides which dataset family the frame loads. Never forced: this is the same
     resolver the maps and the engine use. */
  function resolveWorld() {
    const datasets = global.SAODatasets;
    if (datasets && typeof datasets.resolveWorld === "function") {
      try {
        const world = String(datasets.resolveWorld() || "").toLowerCase();
        if (world === "underworld" || world === "aincrad") return world;
      } catch (_error) {
        /* Fall through to the default. */
      }
    }
    return "aincrad";
  }

  function createToken() {
    return `argo-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  }

  /* The dataset the page is on right now, resolved per question so switching the site's dataset mode
     while the window is open is honoured immediately. SAODatasets is the site-wide authority; the
     Character Build page keeps its own data-source toggle instead of it, so that control is read
     directly rather than assuming the page is on Current Data. Returns null when the page cannot say,
     which the engine reports as an unsupported mode instead of guessing. */
  function getDatasetHint() {
    const datasets = global.SAODatasets;
    if (datasets && typeof datasets.getDatasetFromLocation === "function") {
      try {
        const value = String(datasets.getDatasetFromLocation() || "")
          .trim()
          .toLowerCase();
        if (DATASET_VALUES.includes(value)) return value;
      } catch (_error) {
        /* Fall through to the page's own control. */
      }
    }
    const doc = global.document;
    if (!doc || typeof doc.querySelector !== "function") return null;
    try {
      const active = doc.querySelector(CHARACTER_BUILD_SOURCE_SELECTOR);
      const value = active
        ? String(active.getAttribute("data-source") || "")
            .trim()
            .toLowerCase()
        : "";
      return DATASET_VALUES.includes(value) ? value : null;
    } catch (_error) {
      return null;
    }
  }

  /* The pure part of the bridge, exported so it can be tested without a browser: a frame snapshot in,
     the engine's source bag out, restricted to the given world. */
  function toEngineSources(snapshot, world) {
    const safe = isPlainObject(snapshot) ? snapshot : {};
    const keys = world === "underworld" ? UNDERWORLD_SOURCE_KEYS : AINCRAD_SOURCE_KEYS;
    const sources = {};
    for (const key of keys) {
      const value = safe[key];
      if (value === undefined || value === null) continue;
      sources[key] = value;
    }
    return sources;
  }

  function removeFrame() {
    const frame = state.frame;
    state.frame = null;
    if (!frame) return;
    if (typeof frame.remove === "function") {
      frame.remove();
      return;
    }
    const parent = frame.parentNode;
    if (parent && typeof parent.removeChild === "function") parent.removeChild(frame);
  }

  function finish(resolve, payload, settled) {
    if (settled.done) return;
    settled.done = true;
    if (settled.timer) global.clearTimeout(settled.timer);
    if (state.cleanup) state.cleanup();
    state.cleanup = null;
    removeFrame();
    resolve(payload);
  }

  function start() {
    return new Promise((resolve) => {
      const settled = { done: false, timer: null };
      const doc = global.document;
      const engine = global.SAOArgoEngine;
      if (!doc || !doc.body || typeof doc.createElement !== "function") {
        resolve(unavailable("no-document"));
        return;
      }
      if (!engine || typeof engine.registerSources !== "function") {
        resolve(unavailable("no-engine"));
        return;
      }
      const base = scriptUrl();
      if (!base) {
        resolve(unavailable("no-script-url"));
        return;
      }

      const world = resolveWorld();
      state.world = world;
      const token = createToken();
      const origin =
        global.location && global.location.origin && global.location.origin !== "null" ? global.location.origin : "";

      const accept = (payload) => {
        const sources = payload && payload.ready ? toEngineSources(payload.sources, world) : {};
        if (!Object.keys(sources).length) {
          state.failed = true;
          finish(resolve, { ready: false, world, sources: {} }, settled);
          return;
        }
        try {
          engine.registerSources(sources);
        } catch (_error) {
          state.failed = true;
          finish(resolve, { ready: false, world, sources: {} }, settled);
          return;
        }
        state.snapshot = payload.sources;
        state.sources = sources;
        state.ready = true;
        finish(resolve, { ready: true, world, sources }, settled);
      };

      const onMessage = (event) => {
        const data = event && event.data;
        if (!data || data.type !== MESSAGE_TYPE || data.token !== token) return;
        accept({ ready: data.ready === true, sources: data.sources || null });
      };

      global.addEventListener("message", onMessage);
      state.cleanup = () => global.removeEventListener?.("message", onMessage);
      settled.timer = global.setTimeout(() => {
        /* One watchdog, not a poll: if the frame never reports back (blocked, offline, still loading) the
           window keeps answering from the data this page already has. */
        state.failed = true;
        finish(resolve, { ready: false, world, sources: {} }, settled);
      }, LOAD_TIMEOUT_MS);

      try {
        const frame = doc.createElement("iframe");
        frame.id = FRAME_ID;
        frame.setAttribute("aria-hidden", "true");
        frame.setAttribute("tabindex", "-1");
        frame.setAttribute("title", "");
        frame.setAttribute("sandbox", "allow-scripts");
        frame.style.display = "none";
        frame.style.position = "absolute";
        frame.style.width = "0";
        frame.style.height = "0";
        frame.style.border = "0";
        frame.src = new URL(
          `${FRAME_FILE}?world=${encodeURIComponent(world)}&token=${encodeURIComponent(token)}&origin=${encodeURIComponent(origin)}`,
          base
        ).href;
        state.frame = frame;
        doc.body.appendChild(frame);
      } catch (_error) {
        state.failed = true;
        finish(resolve, { ready: false, world, sources: {} }, settled);
      }
    });
  }

  function unavailable(reason) {
    state.failed = true;
    if (!state.world) state.world = resolveWorld();
    return { ready: false, world: state.world, sources: {}, reason };
  }

  /* Resolves once the page's data has been prepared (or once it is clear that it cannot be). Repeated
     calls share the same promise, so the frame loads exactly once per page session. */
  function ensure() {
    if (!state.promise) {
      state.promise = start().catch(() => unavailable("error"));
    }
    return state.promise;
  }

  function getState() {
    return {
      ready: state.ready,
      failed: state.failed,
      world: state.world,
      keys: state.sources ? Object.keys(state.sources) : []
    };
  }

  /* Drops the prepared data and the frame. Used by tests; the engine's own cache is cleared too, so the
     next question rebuilds from whatever this page can see. */
  function reset() {
    if (state.cleanup) state.cleanup();
    state.cleanup = null;
    removeFrame();
    state.promise = null;
    state.snapshot = null;
    state.sources = null;
    state.world = null;
    state.ready = false;
    state.failed = false;
    const engine = global.SAOArgoEngine;
    if (engine && typeof engine.resetSources === "function") engine.resetSources();
  }

  /* Capture the frame's base URL now, while document.currentScript still points at this script. */
  scriptSrcCache = detectScriptUrl();

  global.SAOArgoData = Object.freeze({
    frameId: FRAME_ID,
    messageType: MESSAGE_TYPE,
    aincradSourceKeys: AINCRAD_SOURCE_KEYS,
    underworldSourceKeys: UNDERWORLD_SOURCE_KEYS,
    ensure,
    isReady: () => state.ready,
    getState,
    getDatasetHint,
    toEngineSources,
    reset
  });
})(typeof window !== "undefined" ? window : globalThis);
