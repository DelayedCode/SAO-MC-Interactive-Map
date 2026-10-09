/* Cursor artwork derivation, shared by the cursor regression tests.
 *
 * Every page links shared/sao-polish.css, where each cursor state is one custom property: an SVG
 * data URI plus the declared hotspot. Two suites need the same reading of that artwork - the
 * pure-Node coordinate test (which pins "the painted tip IS the hotspot") and the browser hotspot
 * test (which pins the runtime pointer -> readout -> waypoint -> export chain) - so the parsing,
 * the stroked-miter geometry and the rasterisation live here instead of being re-declared in both.
 *
 * Design rules, in the same spirit as scripts/harness-helpers.js:
 *  - No shared mutable state. Every call returns fresh data.
 *  - No browser dependency. sharp is required lazily by rasterize() only.
 *  - No assertions and no production logic; this module only measures the artwork.
 */
"use strict";

const fs = require("node:fs");
const path = require("node:path");

const REPO_ROOT = path.resolve(__dirname, "..");
const POLISH_CSS_PATH = path.join(REPO_ROOT, "shared", "sao-polish.css");

function readPolishCss() {
  return fs.readFileSync(POLISH_CSS_PATH, "utf8");
}

/* `--sao-cursor-<name>: url("data:image/svg+xml,<svg>") <x> <y>;` -> the decoded SVG plus the
   declared hotspot and the canvas size/viewBox the SVG is authored in. Throws when the variable is
   missing or malformed, so a renamed or restructured cursor fails loudly instead of silently
   skipping a check. */
function readCursor(name, css) {
  const sheet = css === undefined ? readPolishCss() : css;
  const match = sheet.match(
    new RegExp(`--sao-cursor-${name}:\\s*url\\("data:image\\/svg\\+xml,([^"]+)"\\)\\s*([\\d.]+)\\s+([\\d.]+)\\s*;`)
  );
  if (!match) throw new Error(`shared/sao-polish.css does not declare --sao-cursor-${name}`);
  const svg = decodeURIComponent(match[1]);
  const box = svg.match(/width='(\d+)' height='(\d+)' viewBox='([^']+)'/);
  return {
    name,
    svg,
    hotspot: { x: Number(match[2]), y: Number(match[3]) },
    size: box ? Number(box[1]) : null,
    height: box ? Number(box[2]) : null,
    viewBox: box ? box[3].trim().split(/\s+/).map(Number) : null
  };
}

function unit(vector) {
  const length = Math.hypot(vector[0], vector[1]);
  return [vector[0] / length, vector[1] / length];
}

/* The arrow's painted geometry, derived from the SVG itself rather than from the path's first
   vertex: the filled outline is stroked, so what the eye sees as "the tip" is the outer miter
   point, which sits `miterDistance` beyond the vertex along the outward bisector of the two edges
   that meet there. Everything needed to check that claim - and to check that the soft halo never
   reaches past it - is returned. */
function readArrowGeometry(cursor) {
  const outline = cursor.svg.match(
    /<path d='(M[^']+)' fill='#0b1220' stroke='([^']+)' stroke-width='([\d.]+)' stroke-linejoin='([a-z]+)'(?: stroke-miterlimit='([\d.]+)')?/
  );
  if (!outline) throw new Error("the arrow cursor has no filled outline path");
  const halo = cursor.svg.match(
    /<path d='(M[^']+)' fill='none' stroke='([^']+)' stroke-opacity='([\d.]+)' stroke-width='([\d.]+)' stroke-linejoin='([a-z]+)'/
  );
  if (!halo) throw new Error("the arrow cursor has no halo path");

  const vertices = [...outline[1].matchAll(/(-?[\d.]+) (-?[\d.]+)/g)].map((match) => [
    Number(match[1]),
    Number(match[2])
  ]);
  const strokeWidth = Number(outline[3]);
  const haloStrokeWidth = Number(halo[4]);
  const tipVertex = vertices[0];
  const edgeA = unit([vertices[1][0] - tipVertex[0], vertices[1][1] - tipVertex[1]]);
  const last = vertices[vertices.length - 1];
  const edgeB = unit([last[0] - tipVertex[0], last[1] - tipVertex[1]]);
  const inwardBisector = unit([edgeA[0] + edgeB[0], edgeA[1] + edgeB[1]]);
  const cosHalfAngle = edgeA[0] * inwardBisector[0] + edgeA[1] * inwardBisector[1];
  const sinHalfAngle = Math.sqrt(1 - cosHalfAngle * cosHalfAngle);
  const miterDistance = strokeWidth / 2 / sinHalfAngle;
  const miterLimit = outline[5] === undefined ? 4 : Number(outline[5]);
  const miterRatio = 1 / sinHalfAngle;

  return {
    vertices,
    tipVertex,
    strokeWidth,
    strokeColor: outline[2],
    haloStrokeWidth,
    join: outline[4],
    haloJoin: halo[5],
    inwardBisector,
    outward: [-inwardBisector[0], -inwardBisector[1]],
    halfAngleDeg: (Math.acos(cosHalfAngle) * 180) / Math.PI,
    sinHalfAngle,
    miterDistance,
    miterLimit,
    /* SVG draws the miter only while its length stays within stroke-miterlimit x stroke-width;
       past that it falls back to a bevel and the artwork would stop short of the vertex. */
    miterRatio,
    miterDrawn: miterRatio <= miterLimit,
    /* The outermost point the stroked outline paints, measured from the path vertex. */
    paintedTip: [
      tipVertex[0] - miterDistance * inwardBisector[0],
      tipVertex[1] - miterDistance * inwardBisector[1]
    ],
    /* A round join caps the halo with a disc of this radius, so it reaches this far from the vertex
       in every direction - including straight out along the tip's own direction. */
    haloReach: haloStrokeWidth / 2
  };
}

/* Rasterise a cursor's SVG at `size` CSS px, optionally supersampled, and return an alpha probe in
   device samples. The SVG is re-emitted at the sample size, so the vector artwork - not a resampled
   bitmap - is what gets measured. */
async function rasterize(svg, size, supersample = 1) {
  const sharp = require("sharp");
  const pixels = Math.round(size * supersample);
  const scaled = svg.replace(/width='(\d+)' height='(\d+)'/, `width='${pixels}' height='${pixels}'`);
  const { data, info } = await sharp(Buffer.from(scaled)).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return {
    width: info.width,
    height: info.height,
    scale: info.width / size,
    alpha(x, y) {
      if (x < 0 || y < 0 || x >= info.width || y >= info.height) return 0;
      return data[(y * info.width + x) * 4 + 3];
    }
  };
}

/* The painted sample furthest along `direction` (a unit vector), reported against the hotspot's own
   projection on that direction. `overshoot > 0` means artwork is painted beyond the hotspot, so the
   visible shape would stick out past the real pointer. Samples are pixel centres, so a raster is
   only accurate to half a sample; callers supersample to tighten that bound. */
function outermostPaintedSample(image, direction, hotspot, threshold = 0) {
  const hotspotProjection = hotspot.x * direction[0] + hotspot.y * direction[1];
  let best = null;
  for (let y = 0; y < image.height; y += 1) {
    for (let x = 0; x < image.width; x += 1) {
      const alpha = image.alpha(x, y);
      if (alpha <= threshold) continue;
      const sourceX = (x + 0.5) / image.scale;
      const sourceY = (y + 0.5) / image.scale;
      const projection = sourceX * direction[0] + sourceY * direction[1];
      if (best === null || projection > best.projection) {
        best = { projection, alpha, sample: { x, y }, source: { x: sourceX, y: sourceY } };
      }
    }
  }
  if (!best) return null;
  return { ...best, hotspotProjection, overshoot: best.projection - hotspotProjection };
}

module.exports = {
  readPolishCss,
  readCursor,
  readArrowGeometry,
  rasterize,
  outermostPaintedSample
};
