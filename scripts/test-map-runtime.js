const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { createDom } = require("./harness-helpers");
const root = path.resolve(__dirname, "..");

function createEventTarget() {
  const listeners = new Map();
  return {
    listeners,
    addEventListener(type, listener) {
      if (!listeners.has(type)) listeners.set(type, new Set());
      listeners.get(type).add(listener);
    },
    removeEventListener(type, listener) {
      listeners.get(type)?.delete(listener);
    },
    dispatch(type, event = {}) {
      for (const listener of listeners.get(type) || []) {
        listener({ type, preventDefault() {}, ...event });
      }
    }
  };
}

function createResizeEnvironment(initialWidth = 320) {
  let width = initialWidth;
  const documentObject = createEventTarget();
  const windowObject = createEventTarget();
  const attributes = {};
  const handle = {
    ...createEventTarget(),
    setAttribute(name, value) {
      attributes[name] = value;
    },
    getAttribute(name) {
      return attributes[name];
    }
  };
  const sidebar = {
    getBoundingClientRect() {
      return { width };
    }
  };
  const dom = createDom({
    documentElement: {
      style: {
        setProperty(name, value) {
          if (name === "--sidebar-width") width = Number.parseFloat(value);
        }
      }
    }
  });
  return { dom, documentObject, windowObject, handle, sidebar, getWidth: () => width };
}

function makeAdapter(overrides = {}) {
  return {
    id: "world-test",
    label: "World Test",
    defaultFloor: "floor1",
    floors: { floor1: { label: "Floor 1" }, floor2: { label: "Floor 2" } },
    categories: { general: true, hidden: false },
    mapImageSources: { floor1: { surface: "floor1.png" } },
    markerDataset: { a1: { id: "a1", title: "Alpha", category: "general" } },
    mobAreaDataset: [{ id: "zone-1", title: "Zone 1" }],
    navigationSections: { maps: true },
    sectionPaths: { maps: "./maps.html" },
    walkthroughSteps: [{ title: "Step 1" }],
    walkthroughStorageKey: "sao.walkthrough.test.completed",
    ...overrides
  };
}

const runtimeApi = require(path.join(__dirname, "..", "shared", "map-runtime.js"));
const { createDisposer, createMapRuntime } = runtimeApi;

const disposer = createDisposer();
assert.equal(disposer.disposed, false, "new disposers are active");
let cleanupCount = 0;
disposer.add(() => {
  cleanupCount += 1;
});
disposer.dispose();
disposer.dispose();
assert.equal(cleanupCount, 1, "cleanup callbacks run exactly once");
assert.equal(disposer.disposed, true, "dispose marks the disposer as disposed");
disposer.add(() => {
  cleanupCount += 1;
});
assert.equal(cleanupCount, 2, "cleanup added after disposal runs immediately");

const runtime = createMapRuntime(makeAdapter(), {
  dom: createDom(),
  coordinateDependencies: {
    mapWebsiteCoordinates: (x, y) => ({ x: x * 2, z: y * 2 }),
    invertMapCoordinates: (x, z) => ({ rawX: x / 2, rawY: z / 2 })
  }
});

assert.ok(runtime && typeof runtime.init === "function");
assert.equal(runtime.isInitialized(), false);
assert.equal(runtime.getState().activeMapContextId, "floor1");
assert.deepEqual(runtime.getState().activeCategories, { general: true, hidden: false });
runtime.init();
assert.equal(runtime.isInitialized(), true);

const contextRuntime = createMapRuntime(makeAdapter({ id: "context-test" }), { dom: createDom() });
assert.equal(contextRuntime.getActiveMapContext(), "floor1", "context starts from the adapter-provided opaque default");
assert.equal(contextRuntime.setActiveMapContext("floor-2"), "floor-2");
assert.equal(contextRuntime.getActiveMapContext(), "floor-2");
const contextSnapshot = contextRuntime.getState();
contextSnapshot.activeMapContextId = "outside-mutation";
assert.equal(contextRuntime.getActiveMapContext(), "floor-2", "context snapshots are isolated");
assert.equal(contextRuntime.setActiveMapContext("player-island"), "player-island", "world-shaped IDs remain opaque");
assert.equal(contextRuntime.clearActiveMapContext(), null);
assert.equal(contextRuntime.getActiveMapContext(), null);
contextRuntime.setActiveMapContext("before-destroy");
contextRuntime.destroy();
assert.equal(contextRuntime.getActiveMapContext(), null, "destroy clears map context");
assert.equal(contextRuntime.getState().activeMapContextId, null);

const searchCategoryRuntime = createMapRuntime(makeAdapter({ id: "search-category-test" }), { dom: createDom() });
assert.equal(searchCategoryRuntime.getSearchQuery(), "");
assert.equal(searchCategoryRuntime.setSearchQuery("  Mixed Case Query  "), "mixed case query");
assert.equal(searchCategoryRuntime.getSearchQuery(), "mixed case query");
assert.equal(searchCategoryRuntime.normalizeSearchQuery("  Another Query "), "another query");
assert.equal(searchCategoryRuntime.clearSearchQuery(), "");
assert.deepEqual(searchCategoryRuntime.getCategoryStates(), { general: true, hidden: false });
assert.deepEqual(
  searchCategoryRuntime.replaceCategoryState({
    "aincrad-floor-specific": true,
    "underworld-island-specific": false
  }),
  {
    "aincrad-floor-specific": true,
    "underworld-island-specific": false
  }
);
assert.equal(searchCategoryRuntime.toggleCategory("underworld-island-specific"), true);
assert.equal(searchCategoryRuntime.getCategoryState("aincrad-floor-specific"), true);
assert.equal(searchCategoryRuntime.setCategoryState("unknown-category", true), true);
const searchCategorySnapshot = searchCategoryRuntime.getState();
searchCategorySnapshot.activeCategories["aincrad-floor-specific"] = false;
assert.equal(searchCategoryRuntime.getCategoryState("aincrad-floor-specific"), true, "category snapshots are isolated");
searchCategoryRuntime.setActiveMapContext("floor-2");
assert.equal(
  searchCategoryRuntime.getCategoryState("aincrad-floor-specific"),
  true,
  "context changes do not reinterpret category IDs"
);
assert.deepEqual(searchCategoryRuntime.clearCategoryState(), {
  "aincrad-floor-specific": false,
  "underworld-island-specific": false,
  "unknown-category": false
});
searchCategoryRuntime.destroy();

const selectionRuntime = createMapRuntime(makeAdapter({ id: "selection-test" }), { dom: createDom() });
assert.equal(selectionRuntime.getSelectedMarker(), null, "selection starts empty");
assert.equal(selectionRuntime.getState().selectedMarkerId, null);
assert.equal(selectionRuntime.setSelectedMarker("marker-one"), "marker-one");
assert.equal(selectionRuntime.getSelectedMarker(), "marker-one");
assert.equal(selectionRuntime.setSelectedMarker("marker-two"), "marker-two");
assert.equal(selectionRuntime.getSelectedMarker(), "marker-two");
const selectionSnapshot = selectionRuntime.getState();
selectionSnapshot.selectedMarkerId = "outside-mutation";
assert.equal(selectionRuntime.getSelectedMarker(), "marker-two", "selection snapshots are isolated");
assert.equal(selectionRuntime.clearSelectedMarker(), null);
assert.equal(selectionRuntime.getSelectedMarker(), null);
selectionRuntime.setSelectedMarker("before-destroy");
selectionRuntime.destroy();
assert.equal(selectionRuntime.getSelectedMarker(), null, "destroy clears selection");
assert.equal(selectionRuntime.getState().selectedMarkerId, null);

for (const id of ["aincrad-selection", "underworld-selection"]) {
  const pageRuntime = createMapRuntime(makeAdapter({ id }), { dom: createDom() });
  pageRuntime.setSelectedMarker(`${id}-marker`);
  assert.equal(pageRuntime.getSelectedMarker(), `${id}-marker`, `${id} can use shared selection state`);
}

assert.throws(() => createMapRuntime(null, { dom: createDom() }), /valid adapter/i);
assert.throws(
  () => createMapRuntime(makeAdapter(), { dom: createDom({ mapContainer: null }) }),
  /missing required DOM/i
);

const secondRuntime = createMapRuntime(makeAdapter(), { dom: createDom() });
assert.equal(secondRuntime.isInitialized(), false);
secondRuntime.init();
assert.equal(secondRuntime.isInitialized(), true);
assert.throws(() => secondRuntime.init(), /already been initialized/i);
secondRuntime.destroy();
assert.equal(secondRuntime.isDestroyed(), true);
assert.equal(secondRuntime.isInitialized(), false);

const coordinateRuntime = createMapRuntime(makeAdapter(), {
  dom: createDom(),
  coordinateDependencies: {
    mapWebsiteCoordinates: (x, y) => ({ x, z: y }),
    invertMapCoordinates: (x, z) => ({ rawX: x, rawY: z })
  }
});

const deps = coordinateRuntime.getCoordinateDependencies();
assert.equal(typeof deps.mapWebsiteCoordinates, "function");
assert.equal(typeof deps.invertMapCoordinates, "function");
assert.deepEqual(
  coordinateRuntime.parseUrlState("?floor=floor2&underground=1&search=alpha&categories=general,hidden"),
  {
    floor: "floor2",
    underground: true,
    search: "alpha",
    activeCategories: { general: true, hidden: true },
    hasParams: true
  }
);

assert.deepEqual(coordinateRuntime.parseUrlState(""), {
  floor: null,
  underground: false,
  search: "",
  activeCategories: {},
  hasParams: false
});
assert.equal(coordinateRuntime.parseUrlState("?unrelated=value").hasParams, false);
assert.equal(coordinateRuntime.parseUrlState("?floor=floor2").floor, "floor2");
assert.equal(coordinateRuntime.parseUrlState("?underground=1").underground, true);
assert.equal(coordinateRuntime.parseUrlState("?underground=true").underground, true);
assert.equal(coordinateRuntime.parseUrlState("?search=alpha").search, "alpha");
assert.equal(coordinateRuntime.parseUrlState("?q=beta").search, "beta");
assert.equal(coordinateRuntime.parseUrlState("?search=alpha&q=beta").search, "alpha");
assert.deepEqual(coordinateRuntime.parseUrlState("?categories=general,general,,hidden").activeCategories, {
  general: true,
  hidden: true
});
assert.deepEqual(coordinateRuntime.parseUrlState("?floor=floor2&underground=true&q=beta&categories=hidden,general"), {
  floor: "floor2",
  underground: true,
  search: "beta",
  activeCategories: { hidden: true, general: true },
  hasParams: true
});
assert.equal(coordinateRuntime.serializeUrlState({}), "");
assert.equal(coordinateRuntime.serializeUrlState({ floor: "floor2" }), "floor=floor2");
assert.equal(coordinateRuntime.serializeUrlState({ underground: true }), "underground=1");
assert.equal(coordinateRuntime.serializeUrlState({ search: "alpha" }), "search=alpha");
assert.equal(coordinateRuntime.serializeUrlState({ q: "beta" }), "search=beta");
assert.equal(
  coordinateRuntime.serializeUrlState({ activeCategories: { hidden: true, general: true } }),
  "categories=hidden%2Cgeneral"
);
assert.equal(
  coordinateRuntime.serializeUrlState({
    floor: "floor2",
    underground: true,
    search: "alpha",
    activeCategories: { general: true, hidden: false }
  }),
  "floor=floor2&underground=1&search=alpha&categories=general"
);
const serializedState = coordinateRuntime.serializeUrlState({
  floor: "floor2",
  underground: true,
  search: "alpha",
  activeCategories: { general: true, hidden: true }
});
assert.deepEqual(coordinateRuntime.parseUrlState(`?${serializedState}`), {
  floor: "floor2",
  underground: true,
  search: "alpha",
  activeCategories: { general: true, hidden: true },
  hasParams: true
});

const visitedStorage = {
  values: { "sao.visitedMarkers": ["legacy-marker", "floor2:already-visited"] },
  getJSON(key, fallback) {
    return Object.prototype.hasOwnProperty.call(this.values, key) ? this.values[key] : fallback;
  },
  setJSON(key, value) {
    this.values[key] = value;
  }
};
const visitedRuntime = createMapRuntime(makeAdapter({ id: "visited-test" }), {
  dom: createDom(),
  storage: visitedStorage
});
assert.equal(
  visitedRuntime.isMarkerVisited("floor1", "legacy-marker"),
  true,
  "legacy raw marker IDs remain compatible"
);
assert.equal(
  visitedRuntime.isMarkerVisited("floor2", "already-visited"),
  true,
  "floor-aware marker IDs remain compatible"
);
assert.equal(visitedRuntime.isMarkerVisited("floor1", "new-marker"), false);
const visitedStateSnapshot = visitedRuntime.getState();
visitedStateSnapshot.visitedMarkerIds.add("outside-mutation");
assert.equal(
  visitedRuntime.isMarkerVisited("floor1", "outside-mutation"),
  false,
  "visited state snapshots are isolated"
);
assert.equal(visitedRuntime.setMarkerVisited("floor1", "new-marker", true), true);
assert.equal(visitedRuntime.isMarkerVisited("floor1", "new-marker"), true);
assert.deepEqual(visitedStorage.values["sao.visitedMarkers"], [
  "legacy-marker",
  "floor2:already-visited",
  "floor1:new-marker"
]);
assert.equal(visitedRuntime.setMarkerVisited("floor1", "legacy-marker", false), false);
assert.equal(visitedRuntime.isMarkerVisited("floor1", "legacy-marker"), false);
assert.deepEqual(visitedStorage.values["sao.visitedMarkers"], ["floor2:already-visited", "floor1:new-marker"]);
visitedRuntime.destroy();

const resizeEnvironment = createResizeEnvironment();
const resizeEvents = { changed: [], started: 0, ended: [] };
const resizeRuntime = createMapRuntime(makeAdapter({ id: "resize-test" }), {
  dom: resizeEnvironment.dom
});
const resizeController = resizeRuntime.initializeSidebarResize({
  sidebar: resizeEnvironment.sidebar,
  handle: resizeEnvironment.handle,
  document: resizeEnvironment.documentObject,
  window: resizeEnvironment.windowObject,
  onWidthChange: (width) => resizeEvents.changed.push(width),
  onResizeStart: () => {
    resizeEvents.started += 1;
  },
  onResizeEnd: (width) => resizeEvents.ended.push(width)
});
assert.ok(resizeController, "sidebar resize initializes with valid elements");
assert.throws(
  () =>
    resizeRuntime.initializeSidebarResize({
      sidebar: resizeEnvironment.sidebar,
      handle: resizeEnvironment.handle,
      document: resizeEnvironment.documentObject,
      window: resizeEnvironment.windowObject
    }),
  /already been initialized/i
);
assert.equal(resizeRuntime.setSidebarWidth(100), 260, "sidebar width enforces minimum");
assert.equal(resizeRuntime.setSidebarWidth(999), 520, "sidebar width enforces maximum");
assert.equal(resizeEnvironment.handle.getAttribute("aria-valuemin"), "260");
assert.equal(resizeEnvironment.handle.getAttribute("aria-valuemax"), "520");
assert.equal(resizeEnvironment.handle.getAttribute("aria-valuenow"), "520");

resizeRuntime.setSidebarWidth(320);
resizeEnvironment.handle.dispatch("mousedown", { button: 0, clientX: 400 });
assert.equal(resizeRuntime.getSidebarResizeState().active, true);
assert.equal(resizeEvents.started, 1);
resizeEnvironment.windowObject.dispatch("mousemove", { clientX: 300 });
assert.equal(resizeEnvironment.getWidth(), 420, "pointer movement updates sidebar width");
resizeEnvironment.documentObject.dispatch("mouseup");
assert.equal(resizeRuntime.getSidebarResizeState().active, false, "resize completion clears active state");
assert.deepEqual(resizeEvents.ended, [420]);

resizeEnvironment.handle.dispatch("keydown", { key: "Home" });
assert.equal(resizeEnvironment.getWidth(), 260);
resizeEnvironment.handle.dispatch("keydown", { key: "End" });
assert.equal(resizeEnvironment.getWidth(), 520);
assert.ok(resizeEvents.changed.length > 0, "width callback receives changes");

resizeRuntime.destroy();
resizeRuntime.destroy();
assert.equal(resizeEnvironment.handle.listeners.get("mousedown")?.size || 0, 0, "destroy removes handle listeners");
assert.equal(
  resizeEnvironment.windowObject.listeners.get("mousemove")?.size || 0,
  0,
  "destroy removes window listeners"
);

const missingResizeRuntime = createMapRuntime(makeAdapter({ id: "missing-resize-test" }), { dom: createDom() });
const missingResizeEnvironment = createResizeEnvironment();
const missingResizeController = missingResizeRuntime.initializeSidebarResize({
  sidebar: missingResizeEnvironment.sidebar,
  handle: null,
  document: missingResizeEnvironment.documentObject,
  window: missingResizeEnvironment.windowObject
});
assert.ok(missingResizeController, "missing optional resize handle is safe");
assert.equal(missingResizeRuntime.setSidebarWidth(300), 300);
missingResizeRuntime.destroy();

for (const id of ["aincrad-sidebar-config", "underworld-sidebar-config"]) {
  const environment = createResizeEnvironment();
  const runtimeForPage = createMapRuntime(makeAdapter({ id }), { dom: environment.dom });
  assert.ok(
    runtimeForPage.initializeSidebarResize({
      sidebar: environment.sidebar,
      handle: environment.handle,
      document: environment.documentObject,
      window: environment.windowObject
    }),
    `${id} can use the shared sidebar mechanism`
  );
  runtimeForPage.destroy();
}

const noWorldSpecificRuntime = createMapRuntime(
  makeAdapter({
    id: "generic-adapter",
    label: "Generic",
    defaultFloor: "floor1",
    categories: { alpha: true },
    markerDataset: {},
    mobAreaDataset: [],
    navigationSections: {},
    sectionPaths: {},
    walkthroughSteps: []
  }),
  { dom: createDom() }
);
assert.equal(noWorldSpecificRuntime.getAdapter().id, "generic-adapter");
assert.equal(noWorldSpecificRuntime.getState().activeMapContextId, "floor1");

const firstInstance = createMapRuntime(makeAdapter({ id: "instance-1" }), { dom: createDom() });
const secondInstance = createMapRuntime(makeAdapter({ id: "instance-2" }), { dom: createDom() });
firstInstance.setCategoryState("general", true);
secondInstance.setCategoryState("general", false);
assert.equal(firstInstance.getState().activeCategories.general, true);
assert.equal(secondInstance.getState().activeCategories.general, false);
assert.notEqual(firstInstance.getState(), secondInstance.getState());

for (const controllerPath of [
  path.join(root, "Aincrad", "Map", "maps.js"),
  path.join(root, "Fractured Underworld", "Main UI", "mainui.js")
]) {
  const controllerSource = fs.readFileSync(controllerPath, "utf8");
  assert.doesNotMatch(
    controllerSource,
    /function\s+parseUrlState\s*\(/,
    `${controllerPath} delegates URL parsing to the shared runtime`
  );
  assert.doesNotMatch(
    controllerSource,
    /function\s+buildUrlFromState\s*\(/,
    `${controllerPath} does not wrap URL serialization`
  );
  assert.match(controllerSource, /sharedMapRuntime\.parseUrlState\(window\.location\.search\)/);
  assert.match(controllerSource, /sharedMapRuntime\.serializeUrlState\(mapState\)/);
}

assert.equal(typeof createMapRuntime, "function");
console.log("Shared map runtime regression tests passed.");
