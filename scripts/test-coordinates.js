const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { readPngDimensions } = require("./harness-helpers");
const { readCursor, readArrowGeometry, rasterize, outermostPaintedSample } = require("./cursor-artwork");

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
   The site-wide cursor system.

   Every page links shared/sao-polish.css last, so the cursors are defined once
   there. The normal arrow is a custom SVG cursor whose painted tip is the
   declared hotspot; the browser places the image so that hotspot sits on the real
   pointer, and the map coordinate pipeline reads that same real pointer
   (event.clientX/clientY -> getImageLocalCoords -> mapWebsiteCoordinates). The
   arrow is therefore exact only if its *painted* tip lands on the declared
   hotspot; this recomputes the stroked miter tip from the CSS data URI and pins
   it to the hotspot. Click/grab/grabbing are custom SVG cursors too (standard
   silhouettes recoloured to the arrow's skin); their hotspots are checked to land
   on painted artwork. Nothing here alters any coordinate maths.
   ------------------------------------------------------------------------- */

const polishCss = fs.readFileSync(path.join(root, "shared", "sao-polish.css"), "utf8");
const mapCss = fs.readFileSync(path.join(root, "Aincrad", "Map", "maps.css"), "utf8");

/* Every custom cursor is a data URI SVG plus a declared hotspot. The parsing, the stroked-miter
   geometry and the rasterisation come from scripts/cursor-artwork.js, so this file and the browser
   hotspot test read the artwork identically instead of re-declaring the same regexes. */
function readCursorVariable(name) {
  let cursor = null;
  try {
    cursor = readCursor(name, polishCss);
  } catch (_error) {
    cursor = null;
  }
  assert.ok(cursor, `the shared sheet defines sao-cursor-${name} with a hotspot`);
  return cursor;
}

const arrowCursor = readCursorVariable("arrow");
const clickCursor = readCursorVariable("click");
const grabCursor = readCursorVariable("grab");
const grabbingCursor = readCursorVariable("grabbing");

assert.deepEqual(arrowCursor.hotspot, { x: 1, y: 1 }, "the normal cursor hotspot is the arrow tip");

const arrowSize = Number((arrowCursor.svg.match(/width='(\d+)'/) || [])[1]);
assert.ok(arrowSize >= 16 && arrowSize <= 32, `the cursor canvas is a normal pointer size (got ${arrowSize})`);
assert.equal(arrowCursor.size, arrowCursor.height, "the arrow canvas is square");
assert.deepEqual(arrowCursor.viewBox, [0, 0, arrowSize, arrowSize], "the arrow viewBox maps 1:1 onto the canvas");

/* The arrow's painted tip, derived from the SVG's own geometry (see scripts/cursor-artwork.js). The
   outline is stroked, so the visible tip is the outer *miter* point - which sits beyond the path
   vertex - and that point, not the vertex, is what has to land on the declared hotspot. */
const arrow = readArrowGeometry(arrowCursor);
assert.equal(arrow.join, "miter", "the arrow outline uses a miter join so its tip stays sharp");
assert.ok(
  arrow.miterDrawn,
  `the miter limit (${arrow.miterLimit}) is not exceeded by the tip (${arrow.miterRatio.toFixed(3)}), ` +
    "so SVG paints the sharp point instead of bevelling it away"
);
assert.ok(
  arrow.outward[0] < 0 && arrow.outward[1] < 0,
  "the arrow tip points up and to the left, the way the painted artwork reads"
);
assertClose(arrow.paintedTip[0], arrowCursor.hotspot.x, "the painted arrow tip X is the cursor hotspot", 0.001);
assertClose(arrow.paintedTip[1], arrowCursor.hotspot.y, "the painted arrow tip Y is the cursor hotspot", 0.001);
assertClose(arrow.tipVertex[0], 1.7, "the arrow path vertex X is where the artwork was authored", 1e-9);
assertClose(arrow.tipVertex[1], 2.71, "the arrow path vertex Y is where the artwork was authored", 1e-9);

/* The low-opacity halo uses a rounded join, whose tip cap stops short of the sharp tip, so
   nothing is painted beyond the hotspot either. */
assert.equal(arrow.haloJoin, "round", "the halo path is present and rounded");
assert.ok(
  arrow.miterDistance - arrow.haloReach > 0,
  "the halo tip stays inside the sharp tip so it never paints past the hotspot"
);

/* The painted arrow is a normal desktop-pointer size, not a large floating icon. */
const xs = arrow.vertices.map((vertex) => vertex[0]);
const ys = arrow.vertices.map((vertex) => vertex[1]);
const paintedLeft = Math.min(arrowCursor.hotspot.x, Math.min(...xs) - arrow.strokeWidth / 2);
const paintedRight = Math.max(...xs) + arrow.strokeWidth / 2;
const paintedTop = Math.min(arrowCursor.hotspot.y, Math.min(...ys) - arrow.strokeWidth / 2);
const paintedBottom = Math.max(...ys) + arrow.strokeWidth / 2;
assert.ok(
  paintedBottom - paintedTop >= 14 && paintedBottom - paintedTop <= 26,
  `the painted arrow height is normal-cursor sized (got ${(paintedBottom - paintedTop).toFixed(2)}px)`
);
assert.ok(
  paintedRight - paintedLeft >= 9 && paintedRight - paintedLeft <= 18,
  `the painted arrow width is normal-cursor sized (got ${(paintedRight - paintedLeft).toFixed(2)}px)`
);

/* The click/grab/grabbing states are custom artwork too, carrying the arrow's skin. */
assert.deepEqual(clickCursor.hotspot, { x: 6, y: 0 }, "the click cursor hotspot is the index fingertip");
assert.deepEqual(grabCursor.hotspot, { x: 11, y: 11 }, "the grab cursor hotspot is the palm centre");
assert.deepEqual(grabbingCursor.hotspot, { x: 11, y: 11 }, "the grabbing cursor hotspot is the grab point");
for (const [name, cursor] of [["click", clickCursor], ["grab", grabCursor], ["grabbing", grabbingCursor]]) {
  const size = Number((cursor.svg.match(/width='(\d+)'/) || [])[1]);
  assert.ok(size >= 16 && size <= 32, `the ${name} cursor canvas is a normal pointer size (got ${size})`);
  assert.ok(cursor.svg.includes("#0b1220") && cursor.svg.includes("#8bb7ff"), `the ${name} cursor uses the shared palette`);
  assert.ok(/stroke-opacity='0.2'/.test(cursor.svg), `the ${name} cursor carries the arrow's soft halo`);
  assert.ok(!cursor.svg.includes("Layer_1"), `the ${name} cursor carries no stray non-path data`);
  assert.ok(
    cursor.hotspot.x >= 0 && cursor.hotspot.y >= 0 && cursor.hotspot.x < size && cursor.hotspot.y < size,
    `the ${name} hotspot is inside the canvas`
  );
}

/* Exactly the four cursor states define artwork - no stray or leftover cursors. */
assert.deepEqual(
  [...polishCss.matchAll(/--sao-cursor-([a-z-]+):\s*url\(/g)].map((match) => match[1]).sort(),
  ["arrow", "click", "grab", "grabbing"],
  "exactly the four cursor states define custom artwork"
);
assert.ok(!/cursor:\s*url\(/.test(polishCss), "no cursor rule inlines custom artwork directly");

/* Where each cursor state is applied. */
assert.match(polishCss, /html\s*\{\s*cursor:\s*var\(--sao-cursor-arrow\),\s*auto;/, "the normal cursor applies site-wide");
assert.match(
  polishCss,
  /html a:not\(\[aria-disabled="true"\]\),\s*html button:not\(:disabled\),[\s\S]*?cursor:\s*var\(--sao-cursor-click\),\s*pointer;/,
  "clickable elements use the click cursor"
);
assert.match(polishCss, /html textarea,[\s\S]*?cursor:\s*text;/, "text entry keeps the text cursor");
assert.match(
  polishCss,
  /html #mapLayer\s*\{\s*cursor:\s*var\(--sao-cursor-arrow\),\s*auto;/,
  "the draggable map artwork keeps the arrow cursor"
);
assert.match(
  polishCss,
  /html \.skill-tree-viewport\s*\{\s*cursor:\s*var\(--sao-cursor-grab\),\s*grab;/,
  "the skill tree keeps the grab cursor"
);
assert.match(
  polishCss,
  /html #mapContainer\.grabbing #mapLayer,\s*html \.skill-tree-viewport\.is-dragging\s*\{\s*cursor:\s*var\(--sao-cursor-grabbing\),\s*grabbing;/,
  "active dragging uses the grabbing cursor"
);
assert.match(polishCss, /button:disabled,\s*select:disabled\s*\{\s*cursor:\s*not-allowed;/, "disabled controls keep not-allowed");
assert.ok(!mapCss.includes("data:image/svg+xml"), "the obsolete Aincrad-only cursor artwork is gone");

/* Rasterise the artwork at the real cursor size. The arrow is measured against the hotspot along
   the tip's own direction - nothing may paint past the pointer - and the other states must have
   their hotspot on painted artwork, with the pointing hand's fingertip as the topmost paint so
   nothing floats above the hotspot. */
(async () => {
  const paint = (cursor, supersample) => rasterize(cursor.svg, cursor.size, supersample);

  /* --- the arrow: the visible tip IS the hotspot --- */
  const nativeArrow = await paint(arrowCursor, 1);
  /* At this resolution the only two sample centres that lie outward of the hotspot are the two
     pixels sharing its corner; neither may carry visible paint. */
  assert.ok(nativeArrow.alpha(0, 0) <= 8, "the arrow paints nothing outward of its hotspot corner");
  assert.ok(nativeArrow.alpha(1, 0) <= 8, "the arrow paints nothing outward of its hotspot corner");
  const nativeTip = outermostPaintedSample(nativeArrow, arrow.outward, arrowCursor.hotspot);
  assert.ok(nativeTip, "the arrow paints something");
  assert.ok(
    nativeTip.overshoot <= 0.5,
    `no painted arrow pixel sits more than half a pixel past the hotspot ` +
      `(outermost ${nativeTip.overshoot.toFixed(3)}px)`
  );
  const nativeVisibleTip = outermostPaintedSample(nativeArrow, arrow.outward, arrowCursor.hotspot, 32);
  assert.ok(
    nativeVisibleTip.overshoot <= 0,
    `no visible arrow pixel crosses the hotspot in the tip direction ` +
      `(outermost visible ${nativeVisibleTip.overshoot.toFixed(3)}px)`
  );

  /* Supersampled, so the half-sample raster bound shrinks to a sixteenth of a pixel: the painted
     tip must land on the hotspot, neither falling short of it nor reaching past it. */
  const SUPERSAMPLE = 16;
  const supersampledArrow = await paint(arrowCursor, SUPERSAMPLE);
  const supersampledTip = outermostPaintedSample(supersampledArrow, arrow.outward, arrowCursor.hotspot);
  assert.ok(
    Math.abs(supersampledTip.overshoot) <= 1 / SUPERSAMPLE,
    `at ${SUPERSAMPLE}x the painted arrow tip lands on the hotspot (` +
      `${supersampledTip.overshoot >= 0 ? "beyond" : "short of"} by ` +
      `${Math.abs(supersampledTip.overshoot).toFixed(4)}px)`
  );

  for (const [name, cursor] of [["click", clickCursor], ["grab", grabCursor], ["grabbing", grabbingCursor]]) {
    const image = await paint(cursor, 1);
    assert.ok(
      image.alpha(cursor.hotspot.x, cursor.hotspot.y) > 100,
      `the ${name} hotspot sits on painted artwork, not empty space`
    );
  }

  const hand = await paint(clickCursor, 1);
  let topRow = -1;
  const rowXs = [];
  for (let y = 0; y < hand.height && topRow === -1; y += 1) {
    for (let x = 0; x < hand.width; x += 1) if (hand.alpha(x, y) > 100) rowXs.push(x);
    if (rowXs.length) topRow = y;
  }
  assert.ok(topRow >= 0, "the pointing hand paints something");
  const fingertip = (Math.min(...rowXs) + Math.max(...rowXs)) / 2;
  assert.ok(Math.abs(fingertip - clickCursor.hotspot.x) <= 2, "the click hotspot is centred on the fingertip");
  assert.ok(
    Math.abs(topRow - clickCursor.hotspot.y) <= 2,
    "the click hotspot is at the top of the fingertip; no artwork floats above it"
  );

  console.log("Coordinate regression tests passed.");
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
