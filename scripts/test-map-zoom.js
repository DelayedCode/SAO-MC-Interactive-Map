/* Regression tests for the shared zoom domain, the zoom-step curve and the adaptive map
   image rendering.

   The curve (factor + maxStep), the clamp range (min/max) and the rendering decision all live in
   shared/sao-map-helpers.js so both interactive maps read one definition; this pins that
   definition and the behaviour the two page controllers build on top of it. */

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

const { MAP_ZOOM_CONFIG, getNextZoom, getMapContentScale, getMapImageRendering, formatZoomLabel } =
  context.window.SAOMapHelpers;

// --- the shared zoom domain both maps read ---
assert.equal(MAP_ZOOM_CONFIG.factor, 1.14, "the multiplicative step stays 1.14");
assert.equal(MAP_ZOOM_CONFIG.maxStep, 1, "a single step never exceeds 1x");
assert.equal(MAP_ZOOM_CONFIG.min, 0.5, "the map zooms out to 0.5x");
assert.equal(MAP_ZOOM_CONFIG.max, 45.0, "the map zooms in to 45x");
assert.equal(Object.isFrozen(MAP_ZOOM_CONFIG), true, "the shared zoom domain cannot be mutated by a page");

// --- minimum / maximum clamp ---
assert.equal(getNextZoom(MAP_ZOOM_CONFIG.max, 1), 45, "zooming in at the ceiling stays at the ceiling");
assert.equal(getNextZoom(MAP_ZOOM_CONFIG.min, -1), 0.5, "zooming out at the floor stays at the floor");
assert.equal(getNextZoom(44.5, 1), 45, "a step that would overshoot the ceiling clamps to it");
assert.equal(getNextZoom(0.55, -1), 0.5, "a step that would undershoot the floor clamps to it");
assert.equal(getNextZoom(NaN, 1), 1.14, "an invalid zoom restarts from 1x");
assert.equal(getNextZoom(0, 1), 1.14, "a zero zoom restarts from 1x");

// --- multiplicative while zoomed out, additive once the step would exceed maxStep ---
assert.ok(Math.abs(getNextZoom(2, 1) - 2.28) < 1e-9, "zoomed out, one step is a 1.14x multiplier");
assert.ok(Math.abs(getNextZoom(2, -1) - 1.72) < 1e-9, "zooming out reverses the same multiplier");
assert.equal(getNextZoom(10, 1), 11, "past the crossover one step is a flat +1x");
assert.equal(getNextZoom(30, 1), 31, "at 30x the label advances by one, not by 3.5 as it used to");
assert.equal(getNextZoom(30, -1), 29, "stepping back down at 30x is symmetric");

// No step, in or out, is ever larger than maxStep across the whole domain.
for (let zoom = 0.5; zoom < 45; zoom = getNextZoom(zoom, 1)) {
  const step = getNextZoom(zoom, 1) - zoom;
  assert.ok(step > 0 && step <= 1 + 1e-9, `a step up from ${zoom}x stays inside (0, 1]`);
}

// --- both ends of the ladder are reachable and then stable ---
let zoomIn = 1;
let inSteps = 0;
while (zoomIn < 45 && inSteps < 500) {
  zoomIn = getNextZoom(zoomIn, 1);
  inSteps += 1;
}
assert.equal(zoomIn, 45, "the ladder reaches the 45x ceiling");
assert.ok(inSteps <= 60, `the ceiling is reachable in a reasonable number of clicks (took ${inSteps})`);
assert.equal(getNextZoom(45, 1), 45, "the ladder stops at the ceiling");

let zoomOut = 45;
let outSteps = 0;
while (zoomOut > 0.5 && outSteps < 500) {
  zoomOut = getNextZoom(zoomOut, -1);
  outSteps += 1;
}
assert.equal(zoomOut, 0.5, "the ladder reaches the 0.5x floor");
assert.equal(getNextZoom(0.5, -1), 0.5, "the ladder stops at the floor");

// --- the displayed label never lies about the internal zoom ---
for (const zoom of [0.5, 1, 1.2996, 6.2614, 12.0557, 26.4619, 30, 44.5, 45]) {
  const shown = parseFloat(formatZoomLabel(zoom).replace("x", ""));
  assert.ok(Math.abs(shown - zoom) <= 0.05, `${zoom}x is displayed as ${formatZoomLabel(zoom)}`);
}
assert.equal(formatZoomLabel(1), "1x", "a whole zoom drops the trailing .0");
assert.equal(formatZoomLabel(1.2996), "1.3x", "the label keeps 0.1x precision, not whole numbers");
assert.equal(formatZoomLabel(45), "45x", "the new ceiling reads as 45x");

// --- content scale: screen px per source px at 1x, from the letterbox fit ---
assert.equal(
  getMapContentScale({ naturalWidth: 5000, naturalHeight: 5000, offsetWidth: 1056, offsetHeight: 808 }),
  808 / 5000,
  "the content scale is the letterbox fit of the element box"
);
assert.equal(
  getMapContentScale({ naturalWidth: 5000, naturalHeight: 5000, offsetWidth: 400, offsetHeight: 400 }),
  0.08,
  "a square map keeps its aspect ratio inside a non-square box"
);
assert.equal(getMapContentScale(null), 0, "no image element means no scale");
assert.equal(
  getMapContentScale({ naturalWidth: 0, naturalHeight: 0, offsetWidth: 100, offsetHeight: 100 }),
  0,
  "an unloaded image means no scale"
);

// --- adaptive rendering: smooth while downscaled, crisp once upscaled past 1:1 ---
assert.equal(getMapImageRendering(1, 0.16), "auto", "at the fit view the map is downscaled, so it stays smooth");
assert.equal(getMapImageRendering(6, 0.16), "auto", "still below 1:1, still smooth");
assert.equal(getMapImageRendering(6.25, 0.16), "pixelated", "at 1:1 the map switches to nearest-neighbour");
assert.equal(getMapImageRendering(30, 0.1616), "pixelated", "the old 30x ceiling renders crisply");
assert.equal(getMapImageRendering(45, 0.1616), "pixelated", "the new 45x ceiling renders crisply");
assert.equal(getMapImageRendering(1, 0), "auto", "an unknown content scale falls back to smooth");
assert.equal(getMapImageRendering(NaN, 0.16), "auto", "an unknown zoom falls back to smooth");

console.log("Map zoom regression tests passed.");
