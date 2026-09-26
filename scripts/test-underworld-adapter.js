const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");

function createDom() {
  return {
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
}

const data = {
  npcOne: {
    id: "npcOne",
    title: "Underworld NPC",
    category: "npc",
    floor: "playerIsland",
    coords: { x: 10, z: 20 }
  }
};
const mobAreas = [{ id: "areaOne", title: "Underworld Area", floor: "playerIsland" }];
const mobAreaMobs = { areaOne: [{ id: "mobOne", name: "Underworld Mob" }] };

const context = vm.createContext({
  console,
  window: {},
  document: {},
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
  Error,
  URL,
  URLSearchParams
});
context.window = context;
context.globalThis = context;
context.window.document = createDom();
context.window.DATA = data;
context.window.MOB_AREAS = mobAreas;
context.window.MOB_AREA_MOBS = mobAreaMobs;

const runtimeSource = fs.readFileSync(path.join(root, "shared", "map-runtime.js"), "utf8");
const adapterSource = fs.readFileSync(path.join(root, "Fractured Underworld", "Main UI", "adapter.js"), "utf8");
vm.runInContext(runtimeSource, context, { filename: "shared/map-runtime.js" });
vm.runInContext(adapterSource, context, { filename: "Fractured Underworld/Main UI/adapter.js" });

const adapter = context.window.UnderworldMapAdapter;
assert.ok(adapter, "Underworld adapter loads");
assert.equal(adapter.id, "underworld");
assert.equal(adapter.translationNamespace, "page.mainui");
assert.equal(adapter.defaultFloor, "playerIsland");
assert.deepEqual(Object.keys(adapter.floors), ["playerIsland", "gigasCedar", "iceCave", "rulid", "fishingIsland"]);
assert.deepEqual(Object.keys(adapter.categories), ["npc", "rulid", "fishingSpot", "oakWood", "copper", "iron", "coal"]);
assert.equal(adapter.markerDataset, data, "existing Underworld marker data remains accessible");
assert.equal(adapter.mobAreaDataset, mobAreas, "existing Underworld area data remains accessible");
assert.equal(adapter.mobAreaMobLookup, mobAreaMobs, "existing Underworld mob lookup remains accessible");
assert.deepEqual(Object.keys(adapter.getContextData("playerIsland").markerDataset), ["npcOne"]);
for (const contextId of ["gigasCedar", "iceCave", "rulid", "fishingIsland"]) {
  assert.deepEqual(adapter.getContextData(contextId).markerDataset, {}, `${contextId} remains empty`);
  assert.deepEqual(adapter.getContextData(contextId).mobAreaDataset, [], `${contextId} mob areas remain empty`);
  assert.deepEqual(adapter.getContextData(contextId).mobAreaMobLookup, {}, `${contextId} mob lookup remains empty`);
}

for (const floor of Object.keys(adapter.floors)) {
  assert.equal(adapter.assetAvailability[floor], false, `${floor} remains placeholder-only`);
  assert.equal(adapter.mapImageSources[floor].placeholder, true, `${floor} placeholder behavior is explicit`);
  assert.equal(adapter.mapImageSources[floor].surface, null);
  assert.equal(adapter.mapImageSources[floor].underground, null);
}
assert.equal(adapter.supportsVisitedCategory("npc"), false, "Underworld visitability is explicitly disabled for its current data contract");
assert.equal(adapter.supportsVisitedCategory("rulid"), false, "Underworld category visitability remains explicit");
assert.equal(adapter.categoryFloorRules.copper.includes("iceCave"), true, "Underworld category rules are adapter-owned");
assert.equal(adapter.mapImageSources.iceCave.placeholder, true, "Underworld image source configuration remains placeholder-backed");

assert.equal(adapter.coordinateDependencies.mapWebsiteCoordinates, null, "forward coordinate support remains optional");
assert.equal(adapter.coordinateDependencies.invertMapCoordinates, null, "inverse coordinate support remains optional");

const runtime = context.window.createMapRuntime(adapter, {
  dom: createDom(),
  coordinateDependencies: adapter.coordinateDependencies
});
assert.equal(runtime.isInitialized(), false);
runtime.init();
assert.equal(runtime.isInitialized(), true);
assert.equal(runtime.getState().activeMapContextId, "playerIsland");
assert.equal(runtime.applySearch("  NPC  "), "npc");
runtime.setCategoryState("npc", false);
runtime.setSelectedMarker("npcOne");
assert.equal(runtime.getSelectedMarker(), "npcOne");
assert.equal(runtime.getState().selectedMarkerId, "npcOne");
assert.equal(runtime.getCoordinateDependencies().mapWebsiteCoordinates, null);
assert.equal(runtime.getCoordinateDependencies().invertMapCoordinates, null);

runtime.destroy();
assert.equal(runtime.isDestroyed(), true);
assert.equal(context.window.DATA.npcOne.title, "Underworld NPC", "destroy does not corrupt Underworld globals");
assert.equal(context.window.MOB_AREAS[0].id, "areaOne", "destroy does not corrupt area globals");

const underworldControllerSource = fs.readFileSync(path.join(root, "Fractured Underworld", "Main UI", "mainui.js"), "utf8");
assert.equal(underworldControllerSource.includes("typeof DATA"), false, "Underworld controller does not read DATA directly");
assert.equal(underworldControllerSource.includes("typeof MOB_AREAS"), false, "Underworld controller does not read MOB_AREAS directly");
assert.equal(underworldControllerSource.includes("typeof MOB_AREA_MOBS"), false, "Underworld controller does not read MOB_AREA_MOBS directly");
assert.equal(/\bDATA\[/.test(underworldControllerSource), false, "Underworld controller does not index DATA directly");
assert.equal(underworldControllerSource.includes("MAP_IMAGE_AVAILABILITY"), false, "Underworld image availability is adapter-owned");
assert.equal(underworldControllerSource.includes("MAIN_CATEGORY_FLOOR_RULES"), false, "Underworld category floor rules are adapter-owned");
assert.equal(underworldControllerSource.includes('category === "biomes"'), false, "Underworld has no Aincrad visitability list");
assert.match(underworldControllerSource, /mapAdapter\?\.supportsVisitedCategory/);
assert.match(underworldControllerSource, /mapAdapter\?\.mapImageSources/);
assert.match(underworldControllerSource, /mapAdapter\?\.categoryFloorRules/);

for (const forbidden of ["playerIsland", "gigasCedar", "iceCave", "rulid", "fishingIsland", "page.mainui."]) {
  assert.equal(runtimeSource.includes(forbidden), false, `shared runtime has no Underworld-specific constant: ${forbidden}`);
}
for (const forbidden of [
  "MAP_CALIBRATION",
  "rawToCalibrationPixels",
  "calibrationPixelsToRaw",
  "function mapWebsiteCoordinates",
  "function invertMapCoordinates"
]) {
  assert.equal(adapterSource.includes(forbidden), false, `adapter does not copy coordinate implementation: ${forbidden}`);
}

console.log("Underworld adapter regression tests passed.");
