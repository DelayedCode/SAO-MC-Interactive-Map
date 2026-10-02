const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { readPngDimensions, createClassList, createStyleStub } = require("./harness-helpers");

const root = path.resolve(__dirname, "..");

function createNode(tagName = "div") {
  const children = [];
  return {
    tagName,
    children,
    childNodes: children,
    dataset: {},
    style: createStyleStub(),
    classList: createClassList(),
    appendChild(child) {
      children.push(child);
      return child;
    },
    append(...nodes) {
      nodes.forEach((node) => this.appendChild(node));
    },
    replaceChildren(...nodes) {
      children.splice(0, children.length, ...nodes);
    },
    remove() {
      const index = this.parentNode?.children.indexOf(this);
      if (index >= 0) this.parentNode.children.splice(index, 1);
    },
    setAttribute() {},
    querySelector() {
      return null;
    },
    querySelectorAll() {
      return [];
    },
    get childElementCount() {
      return children.length;
    },
    getBoundingClientRect() {
      return { left: 0, top: 0, width: 1000, height: 1000 };
    }
  };
}

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
    dispatchEvent() {}
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
    "floorSelect",
    "undergroundToggle",
    "search",
    "clearFilters",
    "zoomLabel",
    "resetView"
  ];
  const elements = Object.fromEntries(ids.map((id) => [id, createNode()]));
  elements.mapImage.naturalWidth = 1600;
  elements.mapImage.naturalHeight = 1200;
  elements.mapImage.getBoundingClientRect = () => ({ left: 0, top: 0, width: 1600, height: 1200 });
  elements.markers.clientWidth = 1600;
  elements.markers.clientHeight = 1200;
  elements.floorSelect.value = "floor1";
  elements.undergroundToggle.checked = false;
  elements.search.value = "";
  elements.documentElement = { style: createStyleStub() };

  const documentObject = {
    ...createEventTarget(),
    body: createNode("body"),
    documentElement: elements.documentElement,
    getElementById(id) {
      return elements[id] || null;
    },
    querySelectorAll() {
      return [];
    },
    querySelector() {
      return null;
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

function createContext() {
  const page = createPageDom();
  const context = vm.createContext({
    console,
    window: {},
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
    history: { state: null, replaceState() {} },
    location: { search: "", pathname: "/maps.html" }
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
      getJSON(_key, fallback) {
        return fallback;
      },
      setJSON() {}
    }
  });
  context.window.SAOI18n = {
    t(key) {
      return key;
    },
    getLanguage() {
      return "en";
    }
  };
  context.window.SAOContentTranslations = { registerMapMarker() {}, register() {} };
  context.window.SAODatasets = null;
  return { context, page };
}

function load(sourcePath, context) {
  vm.runInContext(fs.readFileSync(sourcePath, "utf8"), context, { filename: sourcePath });
}

function attachAincradHooks(context) {
  vm.runInContext(
    `window.__renderingHooks = {
    adapter: window.AincradMapAdapter,
    runtime: window.__aincradMapRuntime,
    state,
    getContextData,
    getDataEntries,
    getMobAreas,
    getInverseCoords,
    getInverseMarkerCoords,
    getInvertedMobAreaCorners,
    getMarkerViewportBounds,
    getMarkerRenderSignature,
    renderMarkers,
    updateTransform
  };`,
    context
  );
}

function loadAincrad() {
  const page = createContext();
  const { context } = page;
  load(path.join(root, "Aincrad", "Map", "mapData.js"), context);
  for (const floor of ["maps_floor1.js", "maps_floor2.js", "maps_floor3.js"]) {
    load(path.join(root, "Aincrad", "Map", floor), context);
  }
  vm.runInContext("window.DATA = DATA; window.MOB_AREAS = MOB_AREAS; window.MOB_AREA_MOBS = MOB_AREA_MOBS;", context);
  load(path.join(root, "shared", "map-runtime.js"), context);
  load(path.join(root, "shared", "sao-page-helpers.js"), context);
  load(path.join(root, "shared", "sao-map-helpers.js"), context);
  load(path.join(root, "Aincrad", "Map", "adapter.js"), context);
  context.window.mapWebsiteCoordinates = context.mapWebsiteCoordinates;
  context.window.invertMapCoordinates = context.invertMapCoordinates;
  load(path.join(root, "Aincrad", "Map", "maps.js"), context);
  attachAincradHooks(context);
  return page;
}

function loadUnderworld() {
  const page = createContext();
  const { context } = page;
  load(path.join(root, "shared", "map-runtime.js"), context);
  load(path.join(root, "shared", "sao-page-helpers.js"), context);
  load(path.join(root, "shared", "sao-map-helpers.js"), context);
  load(path.join(root, "Fractured Underworld", "Main UI", "adapter.js"), context);
  load(path.join(root, "Fractured Underworld", "Main UI", "mainui.js"), context);
  vm.runInContext(
    `window.__renderingHooks = {
    adapter: window.UnderworldMapAdapter,
    runtime: window.__underworldMapRuntime,
    state,
    getContextData,
    getDataEntries,
    getMobAreas,
    getInverseCoords,
    getInverseMarkerCoords,
    getInvertedMobAreaCorners,
    getMarkerViewportBounds,
    getMarkerRenderSignature,
    renderMarkers,
    updateTransform
  };`,
    context
  );
  return page;
}

function markerIds(page) {
  return page.page.elements.markers.children.map((element) => element.dataset.markerId);
}

function resetRenderedMarkers(page, hooks) {
  page.page.elements.markers.replaceChildren();
  hooks.state.markerCache.clear();
  hooks.state.markerRenderSignature = "";
  hooks.state.zoom = 1;
  hooks.state.translateX = 0;
  hooks.state.translateY = 0;
}

/* Marker-identity assertions need clustering out of the way (7x+) and the view centred on
   the marker, because the zoomed viewport is much smaller. */
function focusMarkerWithoutClustering(page, hooks, marker) {
  const projection = hooks.getInverseMarkerCoords(marker, "floor1", { width: 1600, height: 1200 });
  const zoom = 7;
  hooks.state.zoom = zoom;
  hooks.state.translateX = page.page.elements.markers.clientWidth / 2 - projection.rawX * zoom;
  hooks.state.translateY = page.page.elements.markers.clientHeight / 2 - projection.rawY * zoom;
}

const aincrad = loadAincrad();
const aincradHooks = aincrad.context.window.__renderingHooks;
const aincradDimensions = readPngDimensions(path.join(root, "Aincrad", "Map", "floor1.png"));
aincradHooks.runtime.init();
aincradHooks.runtime.replaceCategoryState({
  biomes: true,
  dungeons: true,
  bossSpawns: true,
  farmingSpots: true,
  mobAreas: true,
  sideQuests: true
});

for (const floor of ["floor1", "floor2", "floor3"]) {
  aincrad.page.elements.floorSelect.value = floor;
  aincradHooks.runtime.setActiveMapContext(floor);
  assert.ok(aincradHooks.getContextData().markerDataset);
  assert.ok(Object.values(aincradHooks.getContextData().markerDataset).every((marker) => marker.floor === floor));
  assert.ok(aincradHooks.getMobAreas().every((area) => area.floor === floor));
  resetRenderedMarkers(aincrad, aincradHooks);
  aincradHooks.renderMarkers();
  assert.ok(markerIds(aincrad).length > 0, `${floor} renders actual markers`);
  assert.ok(
    markerIds(aincrad).every((id) => {
      if (id.startsWith("cluster:")) {
        /* Clusters are render-time groups; the anchor must belong to the current context. */
        return Boolean(aincradHooks.getContextData().markerDataset[id.slice("cluster:".length)]);
      }
      if (aincradHooks.getContextData().markerDataset[id]) return true;
      if (!id.startsWith("mob-area:")) return false;
      return aincradHooks.getMobAreas().some((area) => `mob-area:${area.id}` === id);
    }),
    `${floor} rendering is context-isolated`
  );
}

const floor1Marker = Object.values(aincradHooks.adapter.getContextData("floor1").markerDataset).find(
  (marker) => marker.coords
);
assert.ok(floor1Marker, "floor 1 has a coordinate marker");
const floor1Context = aincradHooks.adapter.getContextData("floor1");
aincrad.page.elements.floorSelect.value = "floor1";
aincradHooks.runtime.setActiveMapContext("floor1");
const optionalCoordinateMarker = Object.values(floor1Context.markerDataset).find((marker) => !marker.coords);
if (optionalCoordinateMarker) {
  assert.equal(aincradHooks.getInverseMarkerCoords(optionalCoordinateMarker, "floor1", aincradDimensions), null);
}
const statefulEntry =
  Object.entries(floor1Context.markerDataset).find(
    ([, marker]) => marker.coords && ["biomes", "dungeons", "bossSpawns"].includes(marker.category)
  ) || Object.entries(floor1Context.markerDataset).find(([, marker]) => marker === floor1Marker);
const statefulMarkerId = statefulEntry[0];
const statefulMarker = statefulEntry[1];
aincradHooks.runtime.replaceCategoryState(
  Object.fromEntries(Object.keys(aincradHooks.adapter.categories).map((category) => [category, true]))
);
aincradHooks.runtime.clearSearchQuery();
resetRenderedMarkers(aincrad, aincradHooks);
/* Marker state assertions run with clustering disabled (7x+) so each marker renders
   individually; cluster behaviour is covered by the dedicated checks further down. */
focusMarkerWithoutClustering(aincrad, aincradHooks, statefulMarker);
aincradHooks.runtime.setMarkerVisited("floor1", statefulMarkerId, true);
aincradHooks.runtime.setSelectedMarker(statefulMarkerId);
aincradHooks.renderMarkers();
const selectedElement = aincrad.page.elements.markers.children.find(
  (element) => element.dataset.markerId === statefulMarkerId
);
assert.ok(selectedElement, "selected marker reaches rendering");
assert.equal(selectedElement.classList.contains("active-marker"), true);
assert.equal(
  selectedElement.classList.contains("visited"),
  ["biomes", "dungeons", "bossSpawns"].includes(statefulMarker.category)
);

aincradHooks.runtime.clearSelectedMarker();
aincradHooks.runtime.setMarkerVisited("floor1", statefulMarkerId, false);
aincradHooks.runtime.setSearchQuery(statefulMarker.title);
resetRenderedMarkers(aincrad, aincradHooks);
focusMarkerWithoutClustering(aincrad, aincradHooks, statefulMarker);
aincradHooks.renderMarkers();
assert.ok(markerIds(aincrad).includes(statefulMarkerId), "search-filtered marker reaches rendering");

aincradHooks.runtime.clearSearchQuery();
aincradHooks.runtime.replaceCategoryState({ [statefulMarker.category]: true, mobAreas: false });
resetRenderedMarkers(aincrad, aincradHooks);
focusMarkerWithoutClustering(aincrad, aincradHooks, statefulMarker);
aincradHooks.renderMarkers();
assert.ok(
  markerIds(aincrad).every((id) => floor1Context.markerDataset[id]?.category === statefulMarker.category),
  "category filtering precedes rendering"
);

/* Clustering is disabled at 7x and above: every waypoint renders at its own coordinate. */
assert.ok(
  markerIds(aincrad).every((id) => !id.startsWith("cluster:")),
  "clustering is off at 7x"
);

/* Back to the default zoom for the remaining viewport checks. */
aincradHooks.state.zoom = 1;

aincradHooks.runtime.replaceCategoryState(
  Object.fromEntries(Object.keys(aincradHooks.adapter.categories).map((category) => [category, true]))
);
resetRenderedMarkers(aincrad, aincradHooks);
aincradHooks.state.translateX = -100000;
aincradHooks.state.translateY = -100000;
aincradHooks.renderMarkers();
assert.deepEqual(markerIds(aincrad), [], "clearly out-of-viewport markers are culled");

const projected = aincradHooks.getInverseMarkerCoords(floor1Marker, "floor1", aincradDimensions);
assert.ok(projected && Number.isFinite(projected.rawX) && Number.isFinite(projected.rawY));
const corners = aincradHooks.getInvertedMobAreaCorners(
  aincradHooks.adapter.getContextData("floor1").mobAreaDataset.find((area) => Array.isArray(area.corners)),
  "floor1",
  aincradDimensions
);
assert.ok(corners.length >= 3, "Aincrad mob-area corners use the inverse projection path");

aincradHooks.state.zoom = 1;
aincradHooks.state.translateX = 0;
aincradHooks.state.translateY = 0;
const baseBounds = aincradHooks.getMarkerViewportBounds();
assert.deepEqual(JSON.parse(JSON.stringify(baseBounds)), { left: -80, top: -80, right: 1680, bottom: 1280 });
aincradHooks.state.zoom = 2;
aincradHooks.state.translateX = -300;
aincradHooks.state.translateY = -200;
const zoomedBounds = aincradHooks.getMarkerViewportBounds();
assert.deepEqual(JSON.parse(JSON.stringify(zoomedBounds)), { left: 110, top: 60, right: 990, bottom: 740 });

const aincradSignature = aincradHooks.getMarkerRenderSignature("floor1", "boss");
aincradHooks.state.zoom = 3;
assert.notEqual(
  aincradHooks.getMarkerRenderSignature("floor1", "boss"),
  aincradSignature,
  "zoom invalidates marker signature"
);
assert.notEqual(
  aincradHooks.getMarkerRenderSignature("floor2", "boss"),
  aincradSignature,
  "context invalidates marker signature"
);
assert.notEqual(
  aincradHooks.getMarkerRenderSignature("floor1", "quest"),
  aincradSignature,
  "search invalidates marker signature"
);
aincradHooks.runtime.setCategoryState("biomes", false);
assert.notEqual(
  aincradHooks.getMarkerRenderSignature("floor1", "boss"),
  aincradSignature,
  "category invalidates marker signature"
);
aincradHooks.runtime.setCategoryState("biomes", true);
aincradHooks.state.zoom = 1;
aincradHooks.state.translateX = 0;
aincradHooks.state.translateY = 0;
aincradHooks.updateTransform();
assert.match(aincrad.page.elements.mapLayer.style.transform, /translate\(0px, 0px\) scale\(1\)/);

assert.equal(
  aincrad.page.elements.mapContainer.style.getPropertyValue("--map-grid-size"),
  "48px",
  "the viewport grid keeps its base square size at 1x zoom"
);
aincradHooks.state.zoom = 4;
aincradHooks.updateTransform();
assert.equal(
  aincrad.page.elements.mapContainer.style.getPropertyValue("--map-grid-size"),
  "192px",
  "the viewport grid square size follows the zoom value"
);
aincradHooks.state.zoom = 1;
aincradHooks.updateTransform();

const underworld = loadUnderworld();
const underworldHooks = underworld.context.window.__renderingHooks;
underworldHooks.runtime.init();
underworldHooks.runtime.replaceCategoryState({ npc: true, mobAreas: true });
underworld.page.elements.floorSelect.value = "playerIsland";
underworldHooks.runtime.setActiveMapContext("playerIsland");
resetRenderedMarkers(underworld, underworldHooks);
underworldHooks.renderMarkers();
assert.deepEqual(markerIds(underworld), [], "Player Island safely renders its actual empty dataset");
assert.deepEqual(Array.from(underworldHooks.getMobAreas()), []);
for (const contextId of ["gigasCedar", "iceCave", "rulid", "fishingIsland"]) {
  underworld.page.elements.floorSelect.value = contextId;
  underworldHooks.runtime.setActiveMapContext(contextId);
  assert.deepEqual(
    Object.keys(underworldHooks.getContextData().markerDataset),
    [],
    `${contextId} marker dataset stays empty`
  );
  assert.deepEqual(Array.from(underworldHooks.getMobAreas()), [], `${contextId} mob areas stay empty`);
  resetRenderedMarkers(underworld, underworldHooks);
  underworldHooks.renderMarkers();
  assert.deepEqual(markerIds(underworld), [], `${contextId} renders safely with no data`);
}

const welcomeMarkup = fs.readFileSync(path.join(root, "index.html"), "utf8");
assert.doesNotMatch(
  welcomeMarkup,
  /\.mode-button:hover\s*\{[^}]*filter\s*:\s*brightness\(/,
  "Welcome Mat hover state avoids expensive filter-based repaint work"
);

console.log("Rendering and projection regression tests passed.");
