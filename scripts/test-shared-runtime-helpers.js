const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");

/* Controllable scheduling so the tracked-lifecycle behaviour can be asserted
   without a real event loop. */
const rafQueue = new Map();
const timeoutQueue = new Map();
let rafCounter = 0;
let timeoutCounter = 0;

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
  document: {},
  requestAnimationFrame(callback) {
    const id = ++rafCounter;
    rafQueue.set(id, callback);
    return id;
  },
  cancelAnimationFrame(id) {
    rafQueue.delete(id);
  },
  setTimeout(callback, delay) {
    const id = ++timeoutCounter;
    timeoutQueue.set(id, { callback, delay });
    return id;
  },
  clearTimeout(id) {
    timeoutQueue.delete(id);
  }
});
context.window = context;
context.globalThis = context;

const load = (relativePath) =>
  vm.runInContext(fs.readFileSync(path.join(root, relativePath), "utf8"), context, { filename: relativePath });

load("shared/map-runtime.js");
load("shared/sao-map-helpers.js");

const { createPageLifecycle, createMapContextAccessors } = context.window.SAOMapHelpers;
assert.equal(typeof createPageLifecycle, "function", "createPageLifecycle is exported");
assert.equal(typeof createMapContextAccessors, "function", "createMapContextAccessors is exported");

/* --- clearTimeout / cancelAnimationFrame are actually invoked by dispose --- */
assert.equal(typeof context.window.createDisposer, "function", "map runtime supplies the disposer");

/* --- createPageLifecycle: tracked listeners --------------------------------- */
{
  const lifecycle = createPageLifecycle();
  const target = {
    listeners: new Set(),
    addEventListener(type, listener) {
      this.listeners.add(listener);
    },
    removeEventListener(type, listener) {
      this.listeners.delete(listener);
    }
  };
  let calls = 0;
  lifecycle.addListener(target, "click", () => {
    calls += 1;
  });
  assert.equal(target.listeners.size, 1, "listener is registered");
  for (const listener of target.listeners) listener();
  assert.equal(calls, 1, "registered listener runs");
  lifecycle.getDisposer().dispose();
  assert.equal(target.listeners.size, 0, "dispose removes the listener");
  assert.equal(lifecycle.getDisposer().disposed, false, "a fresh disposer is created after dispose");
}

/* --- createPageLifecycle: tracked timeout + animation frame ------------------ */
{
  const state = { renderMarkersRafId: null };
  const lifecycle = createPageLifecycle();
  let timeouts = 0;
  lifecycle.scheduleTimeout(() => {
    timeouts += 1;
  }, 500);
  assert.equal(timeoutQueue.size, 1, "timeout is scheduled");
  const rafHandle = lifecycle.scheduleAnimationFrame(state, "renderMarkersRafId", () => {});
  assert.equal(state.renderMarkersRafId, rafHandle, "animation frame handle is stored on state");
  assert.equal(rafQueue.size, 1, "animation frame is scheduled");

  lifecycle.getDisposer().dispose();
  assert.equal(timeoutQueue.size, 0, "dispose clears the scheduled timeout");
  assert.equal(rafQueue.size, 0, "dispose cancels the scheduled frame");
  assert.equal(state.renderMarkersRafId, null, "dispose clears the pending handle");
  assert.equal(timeouts, 0, "a disposed timeout never fires");

  const afterHandler = lifecycle.scheduleTimeout(() => {
    timeouts += 1;
  }, 10);
  assert.ok(afterHandler, "scheduling resumes with the replacement disposer");
}

/* --- createMapContextAccessors: caching + lookup + invalidation -------------- */
{
  const floors = {
    floor1: {
      markerDataset: { a: { id: "a", floor: "floor1" } },
      mobAreaDataset: [{ id: "area1" }],
      mobAreaMobLookup: { area1: ["mob"] }
    }
  };
  let adapterCalls = 0;
  const adapter = {
    getContextData(id) {
      adapterCalls += 1;
      return floors[id] || null;
    }
  };
  let current = "floor1";
  let invalidations = 0;
  const accessors = createMapContextAccessors({
    getAdapter: () => adapter,
    getContextId: () => current,
    onContextChange: () => {
      invalidations += 1;
    }
  });

  assert.equal(accessors.getContextData(), floors.floor1, "resolves the active context");
  assert.equal(adapterCalls, 1, "context data is cached");
  accessors.getContextData();
  assert.equal(adapterCalls, 1, "a repeat read does not re-resolve");
  assert.equal(accessors.getMobAreaLookup().get("area1").id, "area1", "mob-area lookup is derived");
  assert.deepEqual(
    accessors.getDataEntries().map(([id]) => id),
    ["a"],
    "marker entries are exposed"
  );
  assert.deepEqual(accessors.getMobAreaMobLookup(), { area1: ["mob"] }, "mob-area mob lookup is exposed");
  assert.equal(invalidations, 1, "the first resolve signals a context change");

  current = "floor2";
  assert.equal(
    JSON.stringify(accessors.getContextData()),
    JSON.stringify({ markerDataset: {}, mobAreaDataset: [], mobAreaMobLookup: {} }),
    "a missing context falls back to empty data"
  );
  assert.equal(adapterCalls, 2, "a new context re-resolves");
  assert.equal(invalidations, 2, "a context change signals the invalidation hook");
}

console.log("Shared runtime helper regression tests passed.");
