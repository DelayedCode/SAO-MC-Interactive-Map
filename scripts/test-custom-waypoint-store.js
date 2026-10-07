const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const source = fs.readFileSync(path.join(__dirname, "../shared/sao-custom-waypoints.js"), "utf8");
const values = new Map();
let writeCount = 0;
const storage = {
  getJSON(key, fallback) {
    if (!values.has(key)) return fallback;
    try {
      return JSON.parse(values.get(key));
    } catch {
      return fallback;
    }
  },
  setJSON(key, value) {
    writeCount += 1;
    values.set(key, JSON.stringify(value));
  }
};
const window = { SAOCustomWaypoints: null };
vm.runInNewContext(source, { window, Date, Math });

const createStore = window.SAOCustomWaypoints.createCustomWaypointStore;
const normalizeArray = (value) => (Array.isArray(value) ? Array.from(value) : value);
const emptyStore = createStore({ storage, world: "empty-custom-buttons", floorIds: ["floor1"] });
assert.deepEqual(
  normalizeArray(emptyStore.getCustomButtonsForFloor("floor1")),
  [],
  "no default button is created automatically"
);
const aincrad = createStore({ storage, world: "aincrad", floorIds: ["floor1", "floor2"] });
const cachedFloorTwoDataset = aincrad.getMarkerDataset("floor2");
const invalid = aincrad.add({ name: "No coordinates", x: "", z: "2", floor: "floor1" });
assert.equal(invalid, null, "empty coordinates are rejected");
const first = aincrad.add({
  name: "  Hidden cove  ",
  description: "  A quiet place  ",
  x: "12.5",
  z: "-4",
  floor: "floor1",
  logo: "star"
});
assert.ok(first && first.id, "valid records receive a stable ID");
assert.equal(first.world, "aincrad");
assert.equal(first.name, "Hidden cove");
assert.equal(aincrad.storageKey, "sao.customWaypoints.aincrad");
assert.equal(aincrad.countForFloor("floor1"), 1);
assert.equal(aincrad.countForFloor("floor2"), 0);
assert.equal(aincrad.getRecordsForFloor("floor2").length, 0);
assert.equal(aincrad.getMarkerDataset("floor2"), cachedFloorTwoDataset, "editing one floor keeps other floor caches");
assert.equal(Object.keys(aincrad.getMarkerDataset("floor1")).length, 0, "created categories remain hidden until enabled");
assert.equal(aincrad.setButtonEnabled("Default", "floor1", true), true);
assert.equal(aincrad.getMarkerDataset("floor1")[`custom:${first.id}`].customLogo, "star");
assert.equal(Object.keys(aincrad.getMarkerDataset("floor2")).length, 0);

const buttonRecord = aincrad.add({
  name: "Boss Route",
  x: "4",
  z: "7",
  floor: "floor1",
  button: "Alpha",
  logo: "home"
});
assert.ok(buttonRecord, "custom buttons persist with their own labels");
assert.equal(aincrad.countForButton("Alpha", "floor1"), 1, "button counts track per-floor categorization");
const floorButtons = aincrad.getCustomButtonsForFloor("floor1");
assert.equal(floorButtons.length, 2, "legacy records fall back to Default and custom buttons stay unique");
assert.equal(floorButtons[0], "Default");
assert.equal(floorButtons[1], "Alpha");
assert.equal(aincrad.removeButton("Alpha", "floor1"), 1, "removing a custom button removes every waypoint in it");
assert.equal(
  aincrad.getCustomButtonsForFloor("floor1").includes("Alpha"),
  false,
  "empty custom buttons disappear from the button list"
);

for (let index = 0; index < 12; index += 1) {
  const created = aincrad.add({
    name: `Button ${index}`,
    x: `${index + 20}`,
    z: `${index + 30}`,
    floor: "floor1",
    button: `Route ${index}`
  });
  assert.ok(created, `button ${index} is accepted without an arbitrary button cap`);
}
assert.equal(aincrad.getCustomButtonsForFloor("floor1").length, 13, "more than ten custom buttons remain available");
assert.ok(
  aincrad.add({
    name: "Button overflow",
    x: "99",
    z: "99",
    floor: "floor1",
    button: "Route overflow"
  }),
  "another category is accepted after more than ten already exist"
);

const underworld = createStore({ storage, world: "underworld", floorIds: ["playerIsland"] });
assert.equal(underworld.count(), 0, "world storage keys are isolated");
const underworldRecord = underworld.add({ name: "Manual", x: "0", z: "7", floor: "playerIsland", logo: "flag" });
assert.ok(underworldRecord, "Underworld allows explicitly entered coordinates");
assert.equal(underworldRecord.world, "underworld");

const colorStore = createStore({ storage, world: "color-test", floorIds: ["floor1"] });
assert.equal(colorStore.setButtonColor("SAO Events", "floor1", "#8A2BE2"), "#8A2BE2");
assert.equal(colorStore.getButtonColor("SAO Events", "floor1"), "#8A2BE2");
assert.equal(colorStore.getButtonColor("Missing", "floor1"), null, "missing button colors remain unset");
const colorRecord = colorStore.add({
  name: "Festival Gate",
  x: "42",
  z: "81",
  floor: "floor1",
  button: "SAO Events",
  logo: "pin"
});
assert.ok(colorRecord, "custom categories can receive records after setting a color");
assert.equal(colorStore.getButtonColor("SAO Events", "floor1"), "#8A2BE2");
assert.equal(colorStore.setButtonColor("SAO Events", "floor1", "#123456"), "#123456");
assert.equal(colorStore.getButtonColor("SAO Events", "floor1"), "#123456");

const batchStore = createStore({ storage, world: "batch-test", floorIds: ["floor1"] });
const preservedRecord = batchStore.add({
  name: "Keep existing",
  x: "1",
  z: "2",
  floor: "floor1",
  button: "Existing"
});
assert.ok(preservedRecord, "batch test starts with an unrelated waypoint");
const importedBatch = [
  { id: "journeymap-one", name: "Imported One", x: 10, z: 20, floor: "floor1", button: "Biomes", logo: "star" },
  { id: "journeymap-two", name: "Imported Two", x: -3, z: 4, floor: "floor1", button: "Dungeons" }
];
const writesBeforePreflight = writeCount;
const revisionBeforePreflight = batchStore.getRevision();
assert.equal(batchStore.canAddMany(importedBatch), true, "a valid batch passes preflight");
assert.equal(writeCount, writesBeforePreflight, "preflight does not write storage");
assert.equal(batchStore.getRevision(), revisionBeforePreflight, "preflight does not change the store revision");
const writesBeforeImport = writeCount;
const importedResult = batchStore.addMany(importedBatch);
assert.equal(importedResult.records.length, 2, "all batch records are accepted together");
assert.equal(writeCount, writesBeforeImport + 1, "the whole batch is persisted with one write");
assert.equal(batchStore.getRecord(preservedRecord.id).name, "Keep existing", "unrelated waypoints remain untouched");
const revisionAfterImport = batchStore.getRevision();
const cachedBatchDataset = batchStore.getMarkerDataset("floor1");
const writesBeforeDuplicateImport = writeCount;
const duplicateResult = batchStore.addMany(importedBatch);
assert.equal(duplicateResult.records.length, 0, "repeated deterministic IDs are skipped");
assert.equal(duplicateResult.duplicateCount, 2, "repeat imports report duplicate records");
assert.equal(writeCount, writesBeforeDuplicateImport, "a duplicate-only batch performs no storage write");
assert.equal(batchStore.getRevision(), revisionAfterImport, "a duplicate-only batch does not change the revision");
assert.equal(batchStore.getMarkerDataset("floor1"), cachedBatchDataset, "duplicates do not invalidate marker caches");

const categoryImportStore = createStore({ storage, world: "category-import", floorIds: ["floor1"] });
const existingDefault = categoryImportStore.add({
  name: "Existing Default waypoint",
  x: "1",
  z: "2",
  floor: "floor1",
  button: "Default",
  buttonColor: "#445566"
});
assert.ok(existingDefault, "an existing Default category is set up before import");
const categoryImportRecords = ["Default", "Cat 1", "Cat 2"].flatMap((button, categoryIndex) =>
  Array.from({ length: 3 }, (_unused, waypointIndex) => ({
    id: `category-${categoryIndex}-${waypointIndex}`,
    name: `${button} waypoint ${waypointIndex + 1}`,
    description: "",
    x: categoryIndex * 10 + waypointIndex,
    z: categoryIndex * 20 + waypointIndex,
    floor: "floor1",
    button,
    buttonColor: ["#445566", "#224466", "#663322"][categoryIndex],
    waypointColor: `#${(categoryIndex * 3 + waypointIndex + 1).toString(16).padStart(6, "0")}`
  }))
);
const categoryImportResult = categoryImportStore.addMany(categoryImportRecords);
assert.equal(categoryImportResult.records.length, 9);
assert.deepEqual(normalizeArray(categoryImportStore.getCustomButtonsForFloor("floor1")), ["Default", "Cat 1", "Cat 2"]);
assert.equal(categoryImportStore.countForButton("Default", "floor1"), 4, "imported Default waypoints reuse the existing button");
assert.equal(categoryImportStore.getButtonColor("Cat 1", "floor1"), "#224466");
assert.equal(categoryImportStore.getRecord("category-1-0").waypointColor, "#000004");
categoryImportStore.setButtonEnabled("Cat 1", "floor1", true);
assert.equal(categoryImportStore.getMarkerDataset("floor1")["custom:category-1-0"].color, "#000004");
const repeatedCategoryImport = categoryImportStore.addMany(categoryImportRecords);
assert.equal(repeatedCategoryImport.records.length, 0, "reimporting the same waypoints does not add duplicates");
assert.equal(repeatedCategoryImport.duplicateCount, 9);

const noDefaultImportStore = createStore({ storage, world: "no-default-import", floorIds: ["floor1"] });
noDefaultImportStore.addMany(categoryImportRecords.filter((record) => record.button !== "Default"));
assert.deepEqual(normalizeArray(noDefaultImportStore.getCustomButtonsForFloor("floor1")), ["Cat 1", "Cat 2"]);

const manyCategoryStore = createStore({ storage, world: "many-category-import", floorIds: ["floor1"] });
const manyCategoryRecords = Array.from({ length: 12 }, (_unused, index) => ({
  id: `many-category-${index}`,
  name: `Many category waypoint ${index}`,
  x: index,
  z: -index,
  floor: "floor1",
  button: `Category ${index}`,
  buttonColor: `#${(index + 1).toString(16).padStart(6, "0")}`,
  waypointColor: `#${(index + 20).toString(16).padStart(6, "0")}`
}));
assert.equal(manyCategoryStore.addMany(manyCategoryRecords).records.length, 12);
assert.equal(manyCategoryStore.getCustomButtonsForFloor("floor1").length, 12);

const buttonStateStore = createStore({ storage, world: "independent-button-state", floorIds: ["floor1"] });
buttonStateStore.addMany(
  ["A", "B", "C"].map((button) => ({
    id: `state-${button}`,
    name: `Waypoint ${button}`,
    x: button.charCodeAt(0),
    z: -button.charCodeAt(0),
    floor: "floor1",
    button
  }))
);
buttonStateStore.setButtonEnabled("A", "floor1", true);
const buttonStateCombinations = [
  [[true, false, false], ["A"]],
  [[true, true, false], ["A", "B"]],
  [[true, true, true], ["A", "B", "C"]],
  [[false, true, true], ["B", "C"]],
  [[false, false, true], ["C"]],
  [[false, false, false], []]
];
for (const [enabledState, expectedButtons] of buttonStateCombinations) {
  ["A", "B", "C"].forEach((button, index) => {
    buttonStateStore.setButtonEnabled(button, "floor1", enabledState[index]);
  });
  assert.deepEqual(normalizeArray(buttonStateStore.getEnabledButtonsForFloor("floor1")).sort(), expectedButtons);
  const visibleButtons = Object.values(buttonStateStore.getMarkerDataset("floor1")).map(
    (marker) => marker.customWaypointButton
  );
  assert.deepEqual(normalizeArray(visibleButtons).sort(), expectedButtons);
}
const restoredButtonStateStore = createStore({ storage, world: "independent-button-state", floorIds: ["floor1"] });
assert.deepEqual(
  normalizeArray(restoredButtonStateStore.getEnabledButtonsForFloor("floor1")),
  [],
  "independent disabled state persists across store reloads"
);

const largeBatch = Array.from({ length: 5000 }, (_, index) => ({
  id: `large-import-${index}`,
  name: `Large Import ${index}`,
  x: index,
  z: -index,
  floor: "floor1",
  button: "Large"
}));
const writesBeforeLargeImport = writeCount;
const largeImportResult = batchStore.addMany(largeBatch);
assert.equal(largeImportResult.records.length, 5000, "large batches add all waypoints");
assert.equal(writeCount, writesBeforeLargeImport + 1, "large batches still persist once");
const writesBeforeLargeDuplicate = writeCount;
assert.equal(
  batchStore.addMany(largeBatch).duplicateCount,
  5000,
  "large repeated imports are recognized as duplicates"
);
assert.equal(writeCount, writesBeforeLargeDuplicate, "large duplicate-only imports do not rewrite storage");

const countBeforeInvalidBatch = batchStore.count();
const writesBeforeInvalidBatch = writeCount;
const revisionBeforeInvalidBatch = batchStore.getRevision();
const invalidBatch = [
  { id: "not-written", name: "Would be valid", x: 1, z: 2, floor: "floor1", button: "Biomes" },
  { id: "invalid", name: "Invalid", x: Number.NaN, z: 2, floor: "floor1", button: "Biomes" }
];
assert.equal(batchStore.canAddMany(invalidBatch), false, "an invalid member fails full-batch preflight");
assert.equal(batchStore.addMany(invalidBatch), null, "an invalid member rejects the complete batch");
assert.equal(batchStore.count(), countBeforeInvalidBatch, "invalid batches add no partial records");
assert.equal(writeCount, writesBeforeInvalidBatch, "invalid batches do not write storage");
assert.equal(batchStore.getRevision(), revisionBeforeInvalidBatch, "invalid batches do not change the store revision");
assert.equal(batchStore.getRecord(preservedRecord.id).name, "Keep existing", "invalid batches preserve old records");

const cleanupStore = createStore({ storage, world: "aincrad-cleanup", floorIds: ["floor1"] });
const cleanupRecord = cleanupStore.add({ name: "Cleanup route", x: "1", z: "2", floor: "floor1", logo: "pin" });
assert.ok(cleanupRecord, "cleanup stores can add a valid record");
assert.equal(cleanupStore.remove(cleanupRecord.id), true, "deleting the only record works");
assert.equal(cleanupStore.hasAny(), false, "deleting the final record removes category availability");
assert.equal(cleanupStore.remove(cleanupRecord.id), false, "unknown IDs are harmless");

const restoredAincrad = createStore({ storage, world: "aincrad", floorIds: ["floor1", "floor2"] });
assert.equal(restoredAincrad.getRecord(first.id).z, -4, "records restore from local storage");
assert.equal(restoredAincrad.remove(first.id), true, "removing a known record succeeds");
assert.equal(restoredAincrad.remove(first.id), false, "unknown IDs are harmless");

/* Focused regression for the one-time coordinate migration: waypoints created on the map were stored
   in the map's own grid, JourneyMap-imported waypoints already hold Minecraft coordinates, and the
   version key makes sure the shift happens exactly once. */
const migrationWorld = "migration-check";
storage.setJSON(`sao.customWaypoints.${migrationWorld}`, [
  {
    id: "map-created-1",
    name: "Map created",
    description: "",
    x: 1798,
    z: 4178,
    floor: "floor1",
    world: migrationWorld,
    button: "Default",
    logo: "pin"
  },
  {
    id: "journeymap-import-1234567890abcdef",
    name: "Imported",
    description: "",
    x: 1798,
    z: 4178,
    floor: "floor1",
    world: migrationWorld,
    button: "Default",
    logo: "pin"
  }
]);
const migrationAlignment = { x: 2, z: 12 };
const migrationStore = createStore({
  storage,
  world: migrationWorld,
  floorIds: ["floor1"],
  coordinateAlignment: migrationAlignment
});
assert.equal(migrationStore.getRecord("map-created-1").x, 1800, "map-created waypoints move to Minecraft X");
assert.equal(migrationStore.getRecord("map-created-1").z, 4190, "map-created waypoints move to Minecraft Z");
assert.equal(
  migrationStore.getRecord("journeymap-import-1234567890abcdef").x,
  1798,
  "JourneyMap-imported waypoints already hold Minecraft coordinates"
);
assert.equal(
  migrationStore.getRecord("journeymap-import-1234567890abcdef").z,
  4178,
  "JourneyMap-imported waypoints are never shifted"
);
assert.equal(migrationStore.getCoordinateMigrationVersion(), 2, "the migration records its version");

const migrationReload = createStore({
  storage,
  world: migrationWorld,
  floorIds: ["floor1"],
  coordinateAlignment: migrationAlignment
});
assert.equal(migrationReload.getRecord("map-created-1").x, 1800, "reloading never shifts a record twice");
assert.equal(migrationReload.getRecord("map-created-1").z, 4190, "reloading never shifts a record twice");

const unshiftedStore = createStore({ storage, world: migrationWorld, floorIds: ["floor1"] });
assert.equal(unshiftedStore.getRecord("map-created-1").x, 1800, "a store without an alignment never shifts records");

console.log("Custom waypoint store regression tests passed.");
