const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { readPngDimensions } = require("./harness-helpers");

const root = path.resolve(__dirname, "..");
const mapDataSource = fs.readFileSync(path.join(root, "Aincrad", "Map", "mapData.js"), "utf8");
const context = vm.createContext({ console });

vm.runInContext(
  `${mapDataSource}\nthis.__coordinateApi = {\n  CALIBRATION_MAP_SIZE,\n  MAP_CALIBRATION,\n  MAP_COORDINATE_ALIGNMENT,\n  MAP_COORDINATE_ALIGNMENT_BY_WORLD,\n  getMapCoordinateAlignment,\n  mapToMinecraftCoordinate,\n  minecraftToMapCoordinate,\n  mapWebsiteCoordinates,\n  invertMapCoordinates\n};`,
  context,
  { filename: "Aincrad/Map/mapData.js" }
);

for (const floor of [1, 2, 3]) {
  const source = fs.readFileSync(path.join(root, "Aincrad", "Map", `maps_floor${floor}.js`), "utf8");
  vm.runInContext(source, context, { filename: `Aincrad/Map/maps_floor${floor}.js` });
}

const {
  CALIBRATION_MAP_SIZE,
  MAP_CALIBRATION,
  MAP_COORDINATE_ALIGNMENT,
  MAP_COORDINATE_ALIGNMENT_BY_WORLD,
  getMapCoordinateAlignment,
  mapToMinecraftCoordinate,
  minecraftToMapCoordinate,
  mapWebsiteCoordinates,
  invertMapCoordinates
} = context.__coordinateApi;
const data = vm.runInContext("DATA", context);

function assertClose(actual, expected, message, tolerance = 1e-9) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `${message}: expected ${expected}, got ${actual}`);
}

function assertRawPointClose(actual, expected, message) {
  assertClose(actual.rawX, expected.x, `${message} x`);
  assertClose(actual.rawY, expected.y, `${message} y`);
}

function assertGamePointClose(actual, expected, message) {
  assertClose(actual.x, expected.x, `${message} x`);
  assertClose(actual.z, expected.z, `${message} z`);
}

for (const floor of ["floor1", "floor2", "floor3"]) {
  const dimensions = readPngDimensions(path.join(root, "Aincrad", "Map", `${floor}.png`));
  const calibration = MAP_CALIBRATION[floor];
  assert.ok(calibration, `${floor} calibration is present`);

  const rawCases = [
    { x: 0, y: 0, label: "top-left boundary" },
    { x: dimensions.width - 1, y: dimensions.height - 1, label: "bottom-right boundary" },
    { x: dimensions.width / 2, y: dimensions.height / 2, label: "image center" },
    { x: dimensions.width * 0.1, y: dimensions.height * 0.9, label: "interior edge" }
  ];

  const imageCenter = { x: dimensions.width / 2, y: dimensions.height / 2 };
  const worldCenter = mapWebsiteCoordinates(imageCenter.x, imageCenter.y, floor, dimensions);
  assertGamePointClose(
    worldCenter,
    mapToMinecraftCoordinate(calibration.centerGame.x, calibration.centerGame.z),
    `${floor} image center maps to its calibration center in Minecraft coordinates`
  );

  const referenceSize = Math.min(dimensions.width, dimensions.height);
  const rawPixelDelta = (10 * referenceSize) / CALIBRATION_MAP_SIZE;
  const expectedBlockDelta = (10 * calibration.radiusGame) / calibration.radiusPixel;
  const imageXStep = mapWebsiteCoordinates(imageCenter.x + rawPixelDelta, imageCenter.y, floor, dimensions);
  assertClose(imageXStep.x, worldCenter.x + expectedBlockDelta, `${floor} image X maps only to Minecraft X`);
  assertClose(imageXStep.z, worldCenter.z, `${floor} image X does not change Minecraft Z`);
  const imageYStep = mapWebsiteCoordinates(imageCenter.x, imageCenter.y + rawPixelDelta, floor, dimensions);
  assertClose(imageYStep.x, worldCenter.x, `${floor} image Y does not change Minecraft X`);
  assertClose(imageYStep.z, worldCenter.z + expectedBlockDelta, `${floor} image Y maps only to Minecraft Z`);

  for (const raw of rawCases) {
    const game = mapWebsiteCoordinates(raw.x, raw.y, floor, dimensions);
    const roundTrip = invertMapCoordinates(game.x, game.z, floor, dimensions);
    assertRawPointClose(roundTrip, { x: raw.x, y: raw.y }, `${floor} ${raw.label} raw round-trip`);
  }

  const gameCases = [
    { x: calibration.centerGame.x, z: calibration.centerGame.z, label: "calibration center" },
    {
      x: calibration.centerGame.x + calibration.radiusGame * 0.75,
      z: calibration.centerGame.z + calibration.radiusGame * 0.75,
      label: "positive game coordinates"
    },
    {
      x: calibration.centerGame.x - calibration.radiusGame * 0.75,
      z: calibration.centerGame.z - calibration.radiusGame * 0.75,
      label: "negative-side game coordinates"
    },
    {
      x: calibration.centerGame.x + calibration.radiusGame,
      z: calibration.centerGame.z - calibration.radiusGame,
      label: "calibration boundary"
    }
  ];

  for (const game of gameCases) {
    const raw = invertMapCoordinates(game.x, game.z, floor, dimensions);
    const roundTrip = mapWebsiteCoordinates(raw.rawX, raw.rawY, floor, dimensions);
    assertGamePointClose(roundTrip, game, `${floor} ${game.label} game round-trip`);
  }
}

for (const floor of ["floor1", "floor2", "floor3"]) {
  const dimensions = readPngDimensions(path.join(root, "Aincrad", "Map", `${floor}.png`));
  const marker = Object.values(data).find((entry) => entry.floor === floor && entry.coords);
  assert.ok(marker, `${floor} has a marker with coordinates`);

  const raw = invertMapCoordinates(marker.coords.x, marker.coords.z, floor, dimensions);
  const game = mapWebsiteCoordinates(raw.rawX, raw.rawY, floor, dimensions);
  assertGamePointClose(game, marker.coords, `${floor} marker ${marker.title}`);
}

const waypoint = Object.values(data).find(
  (entry) => entry.floor === "floor2" && entry.type === "Quest" && entry.coords
);
assert.ok(waypoint, "a floor 2 waypoint with coordinates is present");
const waypointDimensions = readPngDimensions(path.join(root, "Aincrad", "Map", "floor2.png"));
const waypointRaw = invertMapCoordinates(waypoint.coords.x, waypoint.coords.z, "floor2", waypointDimensions);
const waypointGame = mapWebsiteCoordinates(waypointRaw.rawX, waypointRaw.rawY, "floor2", waypointDimensions);
assertGamePointClose(waypointGame, waypoint.coords, `floor 2 waypoint ${waypoint.title}`);

/* Focused regression for the two reported examples. The map location that the old grid labelled
   1798,4178 is the Minecraft position 1800,4190, and it must keep the exact same pixel: the
   correction moves coordinates, never markers. The raw pixel values below were captured from the
   conversion before the correction, so they pin the "same physical map location" invariant. */
assert.deepEqual(
  { ...MAP_COORDINATE_ALIGNMENT },
  { x: 2, z: 12 },
  "the shared boundary is the reported +2 X / +12 Z correction"
);
assert.deepEqual(
  { ...getMapCoordinateAlignment("aincrad") },
  { x: 2, z: 12 },
  "Aincrad is the world whose stored coordinates sit in the map grid"
);
assert.equal(getMapCoordinateAlignment("underworld"), null, "the Underworld map is not shifted");
assert.equal(MAP_COORDINATE_ALIGNMENT_BY_WORLD.underworld, undefined);

const exampleCases = [
  {
    grid: { x: 1798, z: 4178 },
    minecraft: { x: 1800, z: 4190 },
    rawPixel: { x: 1754.83367359193, y: 4128.237460469957 }
  },
  {
    grid: { x: 1797, z: 3974 },
    minecraft: { x: 1799, z: 3986 },
    rawPixel: { x: 1753.8329130138907, y: 3924.0823025499376 }
  }
];
const exampleDimensions = readPngDimensions(path.join(root, "Aincrad", "Map", "floor1.png"));

exampleCases.forEach((example, index) => {
  assert.deepEqual(
    { ...mapToMinecraftCoordinate(example.grid.x, example.grid.z) },
    example.minecraft,
    `example ${index + 1}: grid ${example.grid.x},${example.grid.z} is Minecraft ${example.minecraft.x},${example.minecraft.z}`
  );
  assert.deepEqual(
    { ...minecraftToMapCoordinate(example.minecraft.x, example.minecraft.z) },
    example.grid,
    `example ${index + 1}: the Minecraft coordinate maps back to the same grid coordinate`
  );

  const pixel = invertMapCoordinates(example.minecraft.x, example.minecraft.z, "floor1", exampleDimensions);
  assertRawPointClose(pixel, example.rawPixel, `example ${index + 1} keeps its pre-correction map pixel`);

  const readout = mapWebsiteCoordinates(example.rawPixel.x, example.rawPixel.y, "floor1", exampleDimensions);
  assertGamePointClose(
    readout,
    example.minecraft,
    `example ${index + 1} map location now reports the corrected Minecraft coordinate`
  );
});

/* The Beta datasets were moved to Minecraft coordinates, so their stored values and their own
   displayed coordinate text agree, while the Current dataset (already Minecraft) is untouched. */
const mineMarker = Object.values(data).find((entry) => entry.title === "West Mines");
assert.ok(mineMarker, "the migrated farming marker is present");
assert.deepEqual({ x: mineMarker.coords.x, z: mineMarker.coords.z }, { x: 986, z: 3491 });
assert.match(mineMarker.description, /Coordinates X: 986 Z: 3491/, "displayed coordinate text agrees with the marker");

/* The Main Questline loads on its own so its description triples can be checked without changing the
   marker set the floor assertions above search. */
const questContext = vm.createContext({ console });
vm.runInContext(mapDataSource, questContext, { filename: "Aincrad/Map/mapData.js" });
vm.runInContext(
  fs.readFileSync(path.join(root, "Aincrad", "Map", "maps_mainquests.js"), "utf8"),
  questContext,
  { filename: "Aincrad/Map/maps_mainquests.js" }
);
const questData = vm.runInContext("DATA", questContext);
const questMarker = Object.values(questData).find((entry) => entry.title === "The Geldorack Mine");
assert.ok(questMarker, "the migrated Main Questline marker is present");
assert.deepEqual(
  { x: questMarker.coords.x, z: questMarker.coords.z },
  { x: 4289, z: 3902 },
  "Main Questline markers hold Minecraft coordinates"
);
assert.match(
  questMarker.description,
  /\(4289, \d+, 3902\)/,
  "the Main Questline description triple carries the same Minecraft coordinate"
);

const currentContext = vm.createContext({ console });
vm.runInContext(mapDataSource, currentContext, { filename: "Aincrad/Map/mapData.js" });
vm.runInContext(
  fs.readFileSync(path.join(root, "Aincrad", "Map", "maps_current.js"), "utf8"),
  currentContext,
  { filename: "Aincrad/Map/maps_current.js" }
);
const currentData = vm.runInContext("DATA", currentContext);
const currentMarker = Object.values(currentData).find((entry) => entry.title === "Starting Merchant");
assert.ok(currentMarker, "the Current dataset marker is present");
assert.deepEqual(
  { x: currentMarker.coords.x, z: currentMarker.coords.z },
  { x: 1787, z: 4179 },
  "the Current dataset is already in Minecraft coordinates and was not shifted"
);

assert.ok(
  Number.isFinite(CALIBRATION_MAP_SIZE) && CALIBRATION_MAP_SIZE > 0,
  "the implementation exposes a positive calibration map size"
);
console.log("Coordinate regression tests passed.");
