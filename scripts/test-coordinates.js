const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { readPngDimensions } = require("./harness-helpers");

const root = path.resolve(__dirname, "..");
const mapDataSource = fs.readFileSync(path.join(root, "Aincrad", "Map", "mapData.js"), "utf8");
const context = vm.createContext({ console });

vm.runInContext(
  `${mapDataSource}\nthis.__coordinateApi = {\n  CALIBRATION_MAP_SIZE,\n  MAP_CALIBRATION,\n  getMapCalibration,\n  getStoredCoordinateMigration,\n  getStoredCoordinateMigrations,\n  mapWebsiteCoordinates,\n  invertMapCoordinates\n};`,
  context,
  { filename: "Aincrad/Map/mapData.js" }
);

const dataContext = vm.createContext({ console });
vm.runInContext(mapDataSource, dataContext, { filename: "Aincrad/Map/mapData.js" });
for (const file of ["Aincrad/Map/maps_floor1.js", "Aincrad/Map/maps_floor2.js", "Aincrad/Map/maps_floor3.js"]) {
  vm.runInContext(fs.readFileSync(path.join(root, file), "utf8"), dataContext, { filename: file });
}

const {
  CALIBRATION_MAP_SIZE,
  MAP_CALIBRATION,
  getMapCalibration,
  getStoredCoordinateMigration,
  getStoredCoordinateMigrations,
  mapWebsiteCoordinates,
  invertMapCoordinates
} = context.__coordinateApi;
const data = vm.runInContext("DATA", dataContext);

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

/* ---------------------------------------------------------------------------
   The coordinate engine is a single authoritative boundary.
   ------------------------------------------------------------------------- */

assert.ok(
  typeof MAP_COORDINATE_ALIGNMENT === "undefined" &&
    typeof mapToMinecraftCoordinate === "undefined" &&
    typeof minecraftToMapCoordinate === "undefined" &&
    typeof getMapCoordinateAlignment === "undefined",
  "the old alignment layer is gone: the calibration itself is the only boundary"
);

for (const floor of ["floor1", "floor2", "floor3"]) {
  assert.ok(getMapCalibration(floor), `${floor} has a calibration record`);
  assert.ok(Number.isFinite(MAP_CALIBRATION[floor].centerGame.x), `${floor} calibration centre X is finite`);
  assert.ok(Number.isFinite(MAP_CALIBRATION[floor].centerGame.z), `${floor} calibration centre Z is finite`);
}
assert.equal(getMapCalibration("floor1").coordinateSystem, "minecraft", "floor 1 is Minecraft-calibrated");
assert.equal(getMapCalibration("floor2").coordinateSystem, "map-local", "floor 2 keeps its own grid");
assert.equal(getMapCalibration("floor3").coordinateSystem, "map-local", "floor 3 keeps its own grid");
assert.equal(getMapCalibration("playerIsland"), null, "the Underworld has no calibration here");

/* ---------------------------------------------------------------------------
   Floor 1 calibration: derived from the verified Minecraft reference points.
   ------------------------------------------------------------------------- */

const floor1Calibration = getMapCalibration("floor1");
assertGamePointClose(
  floor1Calibration.centerGame,
  { x: 2544.6, z: 2563 },
  "floor 1 reference centre is the Minecraft coordinate of the image centre"
);
assertGamePointClose(
  floor1Calibration.legacyGrid.centerGame,
  { x: 2542.6, z: 2551 },
  "floor 1 preserves its pre-calibration grid for one-time data migration"
);
assert.deepEqual(
  { ...getStoredCoordinateMigration("floor1") },
  { x: 2, z: 12 },
  "the legacy grid sat 2 blocks west and 12 blocks north of Minecraft"
);
assert.equal(getStoredCoordinateMigration("floor2"), null, "floor 2 has no migration");
assert.equal(getStoredCoordinateMigration("floor3"), null, "floor 3 has no migration");
assert.deepEqual(
  JSON.parse(JSON.stringify(getStoredCoordinateMigrations("aincrad"))),
  { floor1: { x: 2, z: 12 } },
  "only floor 1 migrates stored Aincrad waypoints"
);
assert.equal(getStoredCoordinateMigrations("underworld"), null, "the Underworld never migrates");

/* ---------------------------------------------------------------------------
   Round trips for every floor.
   ------------------------------------------------------------------------- */

for (const floor of ["floor1", "floor2", "floor3"]) {
  const dimensions = readPngDimensions(path.join(root, "Aincrad", "Map", `${floor}.png`));
  const calibration = getMapCalibration(floor);

  const rawCases = [
    { x: 0, y: 0, label: "top-left boundary" },
    { x: dimensions.width - 1, y: dimensions.height - 1, label: "bottom-right boundary" },
    { x: dimensions.width / 2, y: dimensions.height / 2, label: "image center" },
    { x: dimensions.width * 0.1, y: dimensions.height * 0.9, label: "interior edge" }
  ];

  const imageCenter = { x: dimensions.width / 2, y: dimensions.height / 2 };
  const worldCenter = mapWebsiteCoordinates(imageCenter.x, imageCenter.y, floor, dimensions);
  assertGamePointClose(worldCenter, calibration.centerGame, `${floor} image center maps to its calibration center`);

  const referenceSize = Math.min(dimensions.width, dimensions.height);
  const rawPixelDelta = (10 * referenceSize) / CALIBRATION_MAP_SIZE;
  const expectedBlockDelta = (10 * calibration.radiusGame) / calibration.radiusPixel;
  const imageXStep = mapWebsiteCoordinates(imageCenter.x + rawPixelDelta, imageCenter.y, floor, dimensions);
  assertClose(imageXStep.x, worldCenter.x + expectedBlockDelta, `${floor} image X maps only to world X`);
  assertClose(imageXStep.z, worldCenter.z, `${floor} image X does not change world Z`);
  const imageYStep = mapWebsiteCoordinates(imageCenter.x, imageCenter.y + rawPixelDelta, floor, dimensions);
  assertClose(imageYStep.x, worldCenter.x, `${floor} image Y does not change world X`);
  assertClose(imageYStep.z, worldCenter.z + expectedBlockDelta, `${floor} image Y maps only to world Z`);

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

/* Every marker's stored coordinate must round-trip through its own floor's calibration. */
for (const floor of ["floor1", "floor2", "floor3"]) {
  const dimensions = readPngDimensions(path.join(root, "Aincrad", "Map", `${floor}.png`));
  const marker = Object.values(data).find((entry) => entry.floor === floor && entry.coords);
  assert.ok(marker, `${floor} has a marker with coordinates`);
  const raw = invertMapCoordinates(marker.coords.x, marker.coords.z, floor, dimensions);
  const game = mapWebsiteCoordinates(raw.rawX, raw.rawY, floor, dimensions);
  assertGamePointClose(game, marker.coords, `${floor} marker ${marker.title}`);
}

/* ---------------------------------------------------------------------------
   The two reported reference points, pinned to their exact map pixels.
   ------------------------------------------------------------------------- */

const floor1Dimensions = readPngDimensions(path.join(root, "Aincrad", "Map", "floor1.png"));
const exampleCases = [
  {
    minecraft: { x: 1800, z: 4190 },
    legacyGrid: { x: 1798, z: 4178 },
    rawPixel: { x: 1754.83367359193, y: 4128.237460469957 }
  },
  {
    minecraft: { x: 1799, z: 3986 },
    legacyGrid: { x: 1797, z: 3974 },
    rawPixel: { x: 1753.8329130138907, y: 3924.0823025499376 }
  }
];

exampleCases.forEach((example, index) => {
  const readout = mapWebsiteCoordinates(example.rawPixel.x, example.rawPixel.y, "floor1", floor1Dimensions);
  assertGamePointClose(
    readout,
    example.minecraft,
    `example ${index + 1}: the map location now reports the true Minecraft coordinate`
  );
  const pixel = invertMapCoordinates(example.minecraft.x, example.minecraft.z, "floor1", floor1Dimensions);
  assertRawPointClose(pixel, example.rawPixel, `example ${index + 1} keeps its map pixel`);
  const migration = getStoredCoordinateMigration("floor1");
  assert.deepEqual(
    { x: example.legacyGrid.x + migration.x, z: example.legacyGrid.z + migration.z },
    example.minecraft,
    `example ${index + 1}: the legacy grid migrates to the Minecraft coordinate`
  );
});

/* ---------------------------------------------------------------------------
   Floor 1 marker regression against the user's exported waypoint file
   (OurNotWorkingWaypointData.dat carries the pre-calibration website grid).
   ------------------------------------------------------------------------- */

const exportedWaypoints = {
  "Swamp Putride": { x: 1343, z: 3051 },
  Vallhat: { x: 448, z: 3038 },
  "Town of Beginnings": { x: 1800, z: 4282 },
  "Petals Valley": { x: 1007, z: 4159 },
  "Geldorak Mine": { x: 4171, z: 3879 },
  Tolbana: { x: 3310, z: 1608 },
  "Garden of Giants": { x: 367, z: 2422 },
  Candelia: { x: 1999, z: 753 }
};

for (const [title, legacy] of Object.entries(exportedWaypoints)) {
  const marker = Object.values(data).find((entry) => entry.title === title && entry.coords && entry.floor === "floor1");
  assert.ok(marker, `the ${title} floor 1 marker exists`);
  assert.deepEqual(
    { x: marker.coords.x, z: marker.coords.z },
    { x: legacy.x + 2, z: legacy.z + 12 },
    `${title} stores the true Minecraft coordinate`
  );
}

/* ---------------------------------------------------------------------------
   Cross-check: the user-supplied Current Data markers (already Minecraft
   coordinates) agree with the calibrated floor markers describing the same NPCs.
   ------------------------------------------------------------------------- */

const currentContext = vm.createContext({ console });
vm.runInContext(mapDataSource, currentContext, { filename: "Aincrad/Map/mapData.js" });
vm.runInContext(
  fs.readFileSync(path.join(root, "Aincrad", "Map", "maps_current.js"), "utf8"),
  currentContext,
  { filename: "Aincrad/Map/maps_current.js" }
);
const currentData = vm.runInContext("DATA", currentContext);

const crossChecks = [
  { current: "Elite Treant Accessories", floorTitle: "Level 5 Weapon Buyer", tolerance: 4 },
  { current: "Nepenthes Accessories", floorTitle: "Tool Merchant", tolerance: 8 },
  { current: "Sticky Ring", floorTitle: "Manufacturer of the Glutinous Ring", tolerance: 4 },
  { current: "Skeleton Skull", floorTitle: "Skeleton Skull Manufacturer", tolerance: 8 },
  { current: "Occult Merchant - Bracelet", floorTitle: "Occult Bracelet Merchant", tolerance: 6 }
];

for (const crossCheck of crossChecks) {
  const currentMarker = Object.values(currentData).find((entry) => entry.title === crossCheck.current);
  assert.ok(currentMarker, `the Current Data ${crossCheck.current} marker exists`);
  /* Several floor markers share a title (e.g. merchants in different towns), so pick the
     same-NPC marker closest to the Current Data coordinate. */
  const candidates = Object.values(data).filter(
    (entry) => entry.title === crossCheck.floorTitle && entry.coords
  );
  assert.ok(candidates.length > 0, `the calibrated ${crossCheck.floorTitle} marker exists`);
  const floorMarker = candidates.reduce((closest, entry) => {
    const entryDistance = Math.hypot(entry.coords.x - currentMarker.coords.x, entry.coords.z - currentMarker.coords.z);
    return entryDistance < closest.distance ? { distance: entryDistance, entry } : closest;
  }, { distance: Infinity, entry: null }).entry;
  const distance = Math.hypot(
    currentMarker.coords.x - floorMarker.coords.x,
    currentMarker.coords.z - floorMarker.coords.z
  );
  assert.ok(
    distance <= crossCheck.tolerance,
    `${crossCheck.current} (${currentMarker.coords.x},${currentMarker.coords.z}) and ${crossCheck.floorTitle} ` +
      `(${floorMarker.coords.x},${floorMarker.coords.z}) agree within ${crossCheck.tolerance} blocks (got ${distance.toFixed(2)})`
  );
}

/* ---------------------------------------------------------------------------
   Uncalibrated floors keep their original grids and values.
   ------------------------------------------------------------------------- */

const floor2Alchemist = Object.values(data).find((entry) => entry.title === "Alchemist" && entry.floor === "floor2");
assert.deepEqual(
  { x: floor2Alchemist.coords.x, z: floor2Alchemist.coords.z },
  { x: -568, z: -293 },
  "floor 2 data keeps its original map-local values"
);
const floor3Boss = Object.values(data).find(
  (entry) => entry.title === "Furacas, Guardian of the Labyrinth" && entry.floor === "floor3"
);
assert.deepEqual(
  { x: floor3Boss.coords.x, z: floor3Boss.coords.z },
  { x: 393, z: 340 },
  "floor 3 data keeps its original map-local values"
);
const floor2Dimensions = readPngDimensions(path.join(root, "Aincrad", "Map", "floor2.png"));
const floor2Readout = mapWebsiteCoordinates(
  floor2Dimensions.width / 2,
  floor2Dimensions.height / 2,
  "floor2",
  floor2Dimensions
);
assertGamePointClose(floor2Readout, { x: -1.3, z: 0.8 }, "floor 2 keeps its original coordinate grid");

/* ---------------------------------------------------------------------------
   Main Questline data (floor 1) is stored in Minecraft coordinates.
   ------------------------------------------------------------------------- */

const questContext = vm.createContext({ console });
vm.runInContext(mapDataSource, questContext, { filename: "Aincrad/Map/mapData.js" });
vm.runInContext(
  fs.readFileSync(path.join(root, "Aincrad", "Map", "maps_mainquests.js"), "utf8"),
  questContext,
  { filename: "Aincrad/Map/maps_mainquests.js" }
);
const questData = vm.runInContext("DATA", questContext);
const questMarker = Object.values(questData).find((entry) => entry.title === "The Geldorack Mine");
assert.ok(questMarker, "the Main Questline marker is present");
assert.deepEqual(
  { x: questMarker.coords.x, z: questMarker.coords.z },
  { x: 4289, z: 3902 },
  "Main Questline markers hold Minecraft coordinates"
);
const questRaw = invertMapCoordinates(questMarker.coords.x, questMarker.coords.z, "floor1", floor1Dimensions);
const questRoundTrip = mapWebsiteCoordinates(questRaw.rawX, questRaw.rawY, "floor1", floor1Dimensions);
assertGamePointClose(questRoundTrip, questMarker.coords, "Main Questline coordinates round-trip through floor 1");

assert.ok(
  Number.isFinite(CALIBRATION_MAP_SIZE) && CALIBRATION_MAP_SIZE > 0,
  "the implementation exposes a positive calibration map size"
);

/* ---------------------------------------------------------------------------
   The map cursor's hotspot is the exact arrow tip.

   The browser places the cursor image so its declared hotspot sits on the real
   pointer, and the coordinate pipeline reads that same real pointer
   (event.clientX/clientY). The cursor is therefore exact only if the painted
   arrow tip lands on the declared hotspot; this recomputes the stroked miter
   tip from the CSS data URI and pins it to the hotspot.
   ------------------------------------------------------------------------- */

const mapCss = fs.readFileSync(path.join(root, "Aincrad", "Map", "maps.css"), "utf8");
const cursorRule = mapCss.match(
  /#mapContainer\s*\{[^}]*cursor:\s*url\("data:image\/svg\+xml,([^"]+)"\)\s*([\d.]+)\s+([\d.]+)\s*,\s*([a-z-]+)\s*;/
);
assert.ok(cursorRule, "the map container declares a data-URI SVG cursor with a hotspot and a fallback");
const cursorSvg = decodeURIComponent(cursorRule[1]);
const hotspot = { x: Number(cursorRule[2]), y: Number(cursorRule[3]) };
assert.equal(cursorRule[4], "auto", "an ordinary pointer remains the fallback cursor");

const cursorSize = Number((cursorSvg.match(/width='(\d+)'/) || [])[1]);
assert.ok(cursorSize >= 24 && cursorSize <= 32, `the cursor is 24-32px (got ${cursorSize})`);

const arrowPath = (cursorSvg.match(/<path d='(M[^']+)'/) || [])[1];
assert.ok(arrowPath, "the cursor SVG contains the arrow outline");
const outlineStrokeWidth = Number((cursorSvg.match(/stroke-width='([\d.]+)' stroke-linejoin='miter'/) || [])[1]);
assert.ok(Number.isFinite(outlineStrokeWidth), "the arrow outline uses a miter join so its tip stays sharp");

const vertices = [...arrowPath.matchAll(/(-?[\d.]+) (-?[\d.]+)/g)].map((match) => [Number(match[1]), Number(match[2])]);
assert.ok(vertices.length >= 3, "the arrow path has vertices");
const tipVertex = vertices[0];
const normalize = (v) => {
  const length = Math.hypot(v[0], v[1]);
  return [v[0] / length, v[1] / length];
};
const edgeA = normalize([vertices[1][0] - tipVertex[0], vertices[1][1] - tipVertex[1]]);
const edgeB = normalize([
  vertices[vertices.length - 1][0] - tipVertex[0],
  vertices[vertices.length - 1][1] - tipVertex[1]
]);
const inwardBisector = normalize([edgeA[0] + edgeB[0], edgeA[1] + edgeB[1]]);
const cosHalfAngle = edgeA[0] * inwardBisector[0] + edgeA[1] * inwardBisector[1];
const sinHalfAngle = Math.sqrt(1 - cosHalfAngle * cosHalfAngle);
const miterDistance = outlineStrokeWidth / 2 / sinHalfAngle;
const paintedTip = [
  tipVertex[0] - miterDistance * inwardBisector[0],
  tipVertex[1] - miterDistance * inwardBisector[1]
];
assertClose(paintedTip[0], hotspot.x, "the painted arrow tip X is the cursor hotspot", 0.01);
assertClose(paintedTip[1], hotspot.y, "the painted arrow tip Y is the cursor hotspot", 0.01);

/* The low-opacity halo uses a rounded join, whose tip cap stops short of the sharp tip, so
   nothing is painted beyond the hotspot either. */
const haloStrokeWidth = Number((cursorSvg.match(/stroke-width='([\d.]+)' stroke-linejoin='round'/) || [])[1]);
assert.ok(Number.isFinite(haloStrokeWidth), "the halo path is present and rounded");
assert.ok(
  miterDistance - haloStrokeWidth / 2 > 0,
  "the halo tip stays inside the sharp tip so it never paints past the hotspot"
);

/* The map chrome keeps ordinary cursors, and dragging still shows grabbing. */
assert.match(mapCss, /#infoOverlay,\s*#zoomControls\s*\{\s*cursor:\s*auto;/, "the info panel and zoom chrome keep a normal cursor");
const sharedMapUiCss = fs.readFileSync(path.join(root, "shared", "sao-map-ui.css"), "utf8");
assert.match(sharedMapUiCss, /#mapContainer\.grabbing\s*\{\s*cursor:\s*grabbing;/, "dragging still shows the grabbing cursor");
assert.match(mapCss, /\.marker\s*\{[^}]*cursor:\s*pointer;/, "markers keep the pointer cursor");

console.log("Coordinate regression tests passed.");
