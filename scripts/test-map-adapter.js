const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { createDom } = require("./harness-helpers");

const root = path.resolve(__dirname, "..");

function createBrowserGlobals() {
  const context = vm.createContext({
    console,
    window: {},
    document: {},
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

  context.window = context;
  context.globalThis = context;
  context.window.document = createDom();
  context.window.SAOStorage = {
    getItem() {
      return null;
    },
    setItem() {},
    getJSON(key, fallback) {
      return fallback;
    },
    setJSON() {}
  };

  context.window.mapWebsiteCoordinates = (x, z) => ({ x, z });
  context.window.invertMapCoordinates = (x, z) => ({ rawX: x, rawY: z });
  context.window.MAP_CALIBRATION = {
    floor1: { centerPixel: { x: 0, y: 0 }, centerGame: { x: 0, z: 0 }, radiusPixel: 10, radiusGame: 10 }
  };

  return context;
}

const browserContext = createBrowserGlobals();
vm.runInContext(fs.readFileSync(path.join(root, "Aincrad", "Map", "mapData.js"), "utf8"), browserContext, {
  filename: "Aincrad/Map/mapData.js"
});
for (const floorFile of ["maps_floor1.js", "maps_floor2.js", "maps_floor3.js"]) {
  vm.runInContext(fs.readFileSync(path.join(root, "Aincrad", "Map", floorFile), "utf8"), browserContext, {
    filename: `Aincrad/Map/${floorFile}`
  });
}
vm.runInContext(fs.readFileSync(path.join(root, "shared", "map-runtime.js"), "utf8"), browserContext, {
  filename: "shared/map-runtime.js"
});
vm.runInContext(fs.readFileSync(path.join(root, "Aincrad", "Map", "adapter.js"), "utf8"), browserContext, {
  filename: "Aincrad/Map/adapter.js"
});

const adapter = browserContext.window.AincradMapAdapter;
assert.ok(adapter, "Aincrad adapter loads");
assert.equal(adapter.mapId, "aincrad");
assert.equal(adapter.defaultFloor, "floor1");
assert.ok(adapter.floors && adapter.floors.floor1, "floor definitions are present");
assert.ok(adapter.markerDataset && Object.keys(adapter.markerDataset).length > 0, "marker dataset is present");
for (const floor of ["floor1", "floor2", "floor3"]) {
  assert.equal(adapter.mapImageSources[floor].surface, `${floor}.png`);
  assert.equal(adapter.mapImageSources[floor].underground, `${floor}underground.png`);
}
assert.equal(browserContext.window.DATA, undefined, "production-shaped test does not create a window DATA bridge");
assert.equal(
  browserContext.window.MOB_AREAS,
  undefined,
  "production-shaped test does not create a window MOB_AREAS bridge"
);
assert.equal(
  browserContext.window.MOB_AREA_MOBS,
  undefined,
  "production-shaped test does not create a window MOB_AREA_MOBS bridge"
);
for (const floor of ["floor1", "floor2", "floor3"]) {
  const contextData = adapter.getContextData(floor);
  assert.ok(Object.keys(contextData.markerDataset).length > 0, `${floor} marker data is present`);
  assert.ok(
    Object.values(contextData.markerDataset).every((marker) => marker.floor === floor),
    `${floor} markers stay floor-scoped`
  );
  assert.ok(
    contextData.mobAreaDataset.every((area) => area.floor === floor),
    `${floor} mob areas stay floor-scoped`
  );
}
assert.ok(
  Object.keys(adapter.getContextData("floor1").mobAreaMobLookup).length > 0,
  "Floor 1 mob lookup is context-scoped"
);
assert.ok(
  Object.keys(adapter.getContextData("floor2").mobAreaMobLookup).length > 0,
  "Floor 2 mob lookup is context-scoped"
);
assert.equal(typeof adapter.coordinateDependencies.mapWebsiteCoordinates, "function");
assert.equal(typeof adapter.coordinateDependencies.invertMapCoordinates, "function");
assert.equal(adapter.supportsVisitedCategory("biomes"), true, "Aincrad biome markers support visited state");
assert.equal(adapter.supportsVisitedCategory("dungeons"), true, "Aincrad dungeon markers support visited state");
assert.equal(adapter.supportsVisitedCategory("bossSpawns"), true, "Aincrad boss markers support visited state");
assert.equal(
  adapter.supportsVisitedCategory("farmingSpots"),
  false,
  "Aincrad farming markers preserve non-visited behavior"
);

const runtime = browserContext.window.createMapRuntime(adapter, {
  dom: createDom(),
  storage: browserContext.window.SAOStorage,
  coordinateDependencies: adapter.coordinateDependencies
});
assert.equal(runtime.isInitialized(), false);
runtime.init();
assert.equal(runtime.isInitialized(), true);
assert.equal(runtime.getState().activeMapContextId, "floor1");
assert.ok(runtime.getCoordinateDependencies().mapWebsiteCoordinates, "coordinate dependency is available");
runtime.destroy();
assert.equal(runtime.isDestroyed(), true);
const firstMarkerId = Object.keys(adapter.markerDataset)[0];
assert.ok(vm.runInContext("DATA", browserContext)[firstMarkerId], "lexical Aincrad data remains intact");

const aincradControllerSource = fs.readFileSync(path.join(root, "Aincrad", "Map", "maps.js"), "utf8");
assert.equal(aincradControllerSource.includes("typeof DATA"), false, "Aincrad controller does not read DATA directly");
assert.equal(
  aincradControllerSource.includes("typeof MOB_AREAS"),
  false,
  "Aincrad controller does not read MOB_AREAS directly"
);
assert.equal(
  aincradControllerSource.includes("typeof MOB_AREA_MOBS"),
  false,
  "Aincrad controller does not read MOB_AREA_MOBS directly"
);
assert.equal(/\bDATA\[/.test(aincradControllerSource), false, "Aincrad controller does not index DATA directly");
assert.equal(aincradControllerSource.includes('category === "biomes"'), false, "Aincrad visitability is adapter-owned");
assert.match(aincradControllerSource, /mapAdapter\?\.supportsVisitedCategory/);
assert.equal(
  /\$\{floorSelect\.value\}\.?png/.test(aincradControllerSource),
  false,
  "Aincrad controller does not reconstruct surface image paths"
);
assert.equal(
  /\$\{floorSelect\.value\}underground\.png/.test(aincradControllerSource),
  false,
  "Aincrad controller does not reconstruct underground image paths"
);
assert.match(aincradControllerSource, /mapAdapter\?\.mapImageSources/);

console.log("Aincrad adapter regression tests passed.");
