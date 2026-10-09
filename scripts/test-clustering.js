const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
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
  window: {}
});
context.window = context;
context.globalThis = context;
vm.runInContext(fs.readFileSync(path.join(root, "shared", "sao-map-helpers.js"), "utf8"), context, {
  filename: "shared/sao-map-helpers.js"
});

const { CLUSTER_RADIUS_PX, CLUSTER_DISABLE_ZOOM, CLUSTER_ID_PREFIX, isClusteringEnabled, buildScreenClusters } =
  context.window.SAOMapHelpers;

// --- constants match the Aincrad cutoff contract ---
assert.equal(CLUSTER_RADIUS_PX, 46, "cluster radius is 46px");
assert.equal(CLUSTER_DISABLE_ZOOM, 7, "clustering disables at 7x");
assert.equal(CLUSTER_ID_PREFIX, "cluster:", "cluster ids stay prefixed");
assert.equal(isClusteringEnabled(1), true, "clustering on below 7x");
assert.equal(isClusteringEnabled(7), false, "clustering off at exactly 7x");
assert.equal(isClusteringEnabled(9), false, "clustering off above 7x");

// --- co-located points always group while clustering is enabled ---
const coLocated = [
  { id: "a", x: 100, y: 100 },
  { id: "b", x: 100, y: 100 },
  { id: "c", x: 100, y: 100 }
];
const co = buildScreenClusters(coLocated, { radiusPx: CLUSTER_RADIUS_PX, zoom: 1 });
assert.equal(co.clusters.length, 1, "co-located points make one cluster");
assert.equal(co.clusters[0].memberIds.length, 3, "cluster holds all three members");
assert.equal(co.clusters[0].id, "cluster:a", "cluster id derives from the anchor");
assert.equal(co.byMember.get("b"), "cluster:a", "members map back to the cluster");
assert.equal(co.clusters[0].x, 100, "cluster sits at the member average");

// --- a lone point never clusters ---
assert.equal(
  buildScreenClusters([{ id: "solo", x: 10, y: 10 }], { radiusPx: CLUSTER_RADIUS_PX, zoom: 1 }).clusters.length,
  0,
  "single point does not cluster"
);

// --- progressive release: 20px apart groups at 1x, splits once radius/zoom < 20 ---
const pair = [
  { id: "p1", x: 200, y: 200 },
  { id: "p2", x: 220, y: 200 }
];
assert.equal(
  buildScreenClusters(pair, { radiusPx: CLUSTER_RADIUS_PX, zoom: 1 }).clusters.length,
  1,
  "20px pair clusters at 1x (46px radius)"
);
assert.equal(
  buildScreenClusters(pair, { radiusPx: CLUSTER_RADIUS_PX, zoom: 2 }).clusters.length,
  1,
  "20px pair still clusters at 2x (23px radius)"
);
assert.equal(
  buildScreenClusters(pair, { radiusPx: CLUSTER_RADIUS_PX, zoom: 3 }).clusters.length,
  0,
  "20px pair releases at 3x (15px radius)"
);
assert.equal(
  buildScreenClusters(pair, { radiusPx: CLUSTER_RADIUS_PX, zoom: 6.9 }).clusters.length,
  0,
  "released pair stays released near the cutoff"
);

// --- the caller-side cutoff is what disables clustering ---
assert.equal(
  buildScreenClusters(coLocated, { radiusPx: CLUSTER_RADIUS_PX, zoom: 7, disabled: !isClusteringEnabled(7) }).clusters
    .length,
  0,
  "no clusters once the 7x cutoff is applied"
);

// --- multiple independent groups ---
const groups = [
  { id: "g1a", x: 0, y: 0 },
  { id: "g1b", x: 5, y: 0 },
  { id: "g2a", x: 500, y: 500 },
  { id: "g2b", x: 505, y: 500 }
];
const multi = buildScreenClusters(groups, { radiusPx: CLUSTER_RADIUS_PX, zoom: 1 });
assert.equal(multi.clusters.length, 2, "separate groups stay separate");

// --- viewport checker/grid squares scale with the existing zoom value ---
const { GRID_SQUARE_BASE_PX, getGridSquareSize } = context.window.SAOMapHelpers;
assert.equal(GRID_SQUARE_BASE_PX, 48, "grid square base size is 48px");
assert.equal(getGridSquareSize(1), 48, "grid keeps the existing square size at the default zoom");
assert.equal(getGridSquareSize(0.5), 24, "grid squares shrink when zoomed out");
assert.equal(getGridSquareSize(2), 96, "grid squares grow when zoomed in");
assert.equal(getGridSquareSize(7), 336, "grid squares keep scaling past the cluster cutoff");
assert.equal(getGridSquareSize(6.9), GRID_SQUARE_BASE_PX * 6.9, "grid scaling is continuous, not stepped");
assert.equal(getGridSquareSize(NaN), 48, "an invalid zoom falls back to the default grid size");
assert.equal(getGridSquareSize(0), 48, "a zero zoom falls back to the default grid size");
for (const zoom of [0.5, 0.75, 1, 1.37, 2.4, 4.15, 6.31, 7.19, 9.3, 30]) {
  assert.equal(getGridSquareSize(zoom), GRID_SQUARE_BASE_PX * zoom, `grid size stays proportional to zoom at ${zoom}x`);
}

// --- shared zoom domain: Aincrad and the Fractured Underworld read one definition ---
const { MAP_ZOOM_CONFIG } = context.window.SAOMapHelpers;
assert.deepEqual(
  {
    factor: MAP_ZOOM_CONFIG.factor,
    maxStep: MAP_ZOOM_CONFIG.maxStep,
    min: MAP_ZOOM_CONFIG.min,
    max: MAP_ZOOM_CONFIG.max
  },
  { factor: 1.14, maxStep: 1, min: 0.5, max: 45.0 },
  "the shared zoom domain keeps the wheel step and clamp range both maps shipped"
);
assert.equal(Object.isFrozen(MAP_ZOOM_CONFIG), true, "the shared zoom domain cannot be mutated by a page");

// --- letterbox pointer geometry: the image element is passed in, not closed over ---
const { getImageLocalCoords } = context.window.SAOMapHelpers;

function makeImage({ left, top, width, height, naturalWidth, naturalHeight }) {
  return {
    naturalWidth,
    naturalHeight,
    getBoundingClientRect: () => ({ left, top, width, height })
  };
}

// Taller artwork in a wide box: the height fit wins, so the artwork is pillarboxed.
const wideBox = makeImage({ left: 100, top: 50, width: 400, height: 200, naturalWidth: 1000, naturalHeight: 400 });
const wideCoords = getImageLocalCoords(wideBox, { clientX: 300, clientY: 150 });
assert.equal(wideCoords.scale, 0.4, "scale is the smaller of the two fit ratios");
assert.equal(wideCoords.naturalWidth, 1000, "natural width is reported for the caller's projection");
assert.equal(wideCoords.naturalHeight, 400, "natural height is reported for the caller's projection");
assert.equal(wideCoords.contentWidth, 400, "content width fills the element box");
assert.equal(wideCoords.contentHeight, 160, "content height keeps the artwork aspect ratio");
assert.equal(wideCoords.offsetX, 0, "no horizontal letterbox when the artwork fills the width");
assert.equal(wideCoords.offsetY, 20, "vertical letterbox is split evenly around the artwork");
assert.equal(wideCoords.localX, 200, "local x is measured inside the artwork, not the element box");
assert.equal(wideCoords.localY, 80, "local y is measured inside the artwork, not the element box");

// Wide artwork in a square box: the width fit wins, so the artwork is letterboxed on the sides.
const tallBox = makeImage({ left: 0, top: 0, width: 400, height: 400, naturalWidth: 500, naturalHeight: 1000 });
const tallCoords = getImageLocalCoords(tallBox, { clientX: 250, clientY: 200 });
assert.equal(tallCoords.scale, 0.4, "wide artwork is fitted by height");
assert.equal(tallCoords.contentWidth, 200, "content width keeps the artwork aspect ratio");
assert.equal(tallCoords.offsetX, 100, "horizontal letterbox is split evenly around the artwork");
assert.equal(tallCoords.offsetY, 0, "no vertical letterbox when the artwork fills the height");
assert.equal(tallCoords.localX, 150, "local x subtracts the horizontal letterbox");
assert.equal(tallCoords.localY, 200, "local y is unobstructed when there is no vertical letterbox");

// An image that has not decoded yet reports 0 natural size and falls back to the element box.
const undecodedBox = makeImage({ left: 0, top: 0, width: 600, height: 300, naturalWidth: 0, naturalHeight: 0 });
const undecodedCoords = getImageLocalCoords(undecodedBox, { clientX: 150, clientY: 90 });
assert.equal(undecodedCoords.naturalWidth, 600, "an undecoded image falls back to the element width");
assert.equal(undecodedCoords.naturalHeight, 300, "an undecoded image falls back to the element height");
assert.equal(undecodedCoords.scale, 1, "the fallback box has no letterboxing");
assert.equal(undecodedCoords.localX, 150, "local x is unaffected by the natural-size fallback");
assert.equal(undecodedCoords.localY, 90, "local y is unaffected by the natural-size fallback");

// The helper works off whichever image element it is handed, so both maps share the maths.
const otherBox = makeImage({ left: 10, top: 10, width: 200, height: 200, naturalWidth: 200, naturalHeight: 200 });
assert.equal(
  getImageLocalCoords(otherBox, { clientX: 60, clientY: 110 }).localX,
  50,
  "the same maths serves a second map image without page-local state"
);
assert.equal(getImageLocalCoords.length, 2, "the shared helper takes the image element and the pointer event");

console.log("Shared map helper regression tests passed.");
