const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { readPngDimensions } = require("./harness-helpers");

const root = path.resolve(__dirname, "..");
const mapDataSource = fs.readFileSync(path.join(root, "Aincrad", "Map", "mapData.js"), "utf8");
const context = vm.createContext({ console });

vm.runInContext(
  `${mapDataSource}\nthis.__coordinateApi = {\n  CALIBRATION_MAP_SIZE,\n  MAP_CALIBRATION,\n  mapWebsiteCoordinates,\n  invertMapCoordinates\n};`,
  context,
  { filename: "Aincrad/Map/mapData.js" }
);

for (const floor of [1, 2, 3]) {
  const source = fs.readFileSync(path.join(root, "Aincrad", "Map", `maps_floor${floor}.js`), "utf8");
  vm.runInContext(source, context, { filename: `Aincrad/Map/maps_floor${floor}.js` });
}

const { CALIBRATION_MAP_SIZE, MAP_CALIBRATION, mapWebsiteCoordinates, invertMapCoordinates } = context.__coordinateApi;
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

assert.ok(
  Number.isFinite(CALIBRATION_MAP_SIZE) && CALIBRATION_MAP_SIZE > 0,
  "the implementation exposes a positive calibration map size"
);
console.log("Coordinate regression tests passed.");
