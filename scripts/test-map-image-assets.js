const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { readPngDimensions } = require("./harness-helpers");

/* Protects the map image assets.
 *
 * The coordinate calibration is derived from the image pixel dimensions, so every optimized
 * map image must keep exactly the same width and height as its PNG source, and the lossless
 * WebP sibling must be strictly smaller. This test locks both facts for every floor. */

const root = path.resolve(__dirname, "..");
const mapDir = path.join(root, "Aincrad", "Map");
const floors = ["floor1", "floor2", "floor3"];

/* Reads the intrinsic size of a WebP file from its VP8X / VP8L / VP8 header. */
function readWebpDimensions(filePath) {
  const bytes = fs.readFileSync(filePath);
  assert.equal(bytes.toString("ascii", 0, 4), "RIFF", `${filePath} is not a RIFF/WebP file`);
  assert.equal(bytes.toString("ascii", 8, 12), "WEBP", `${filePath} is not a RIFF/WebP file`);
  let offset = 12;
  while (offset + 8 <= bytes.length) {
    const fourcc = bytes.toString("ascii", offset, offset + 4);
    const size = bytes.readUInt32LE(offset + 4);
    const start = offset + 8;
    if (fourcc === "VP8X") {
      const width = (bytes[start + 4] | (bytes[start + 5] << 8) | (bytes[start + 6] << 16)) + 1;
      const height = (bytes[start + 7] | (bytes[start + 8] << 8) | (bytes[start + 9] << 16)) + 1;
      return { width, height };
    }
    if (fourcc === "VP8L") {
      const b0 = bytes[start + 1];
      const b1 = bytes[start + 2];
      const b2 = bytes[start + 3];
      const b3 = bytes[start + 4];
      return {
        width: (b0 | ((b1 & 0x3f) << 8)) + 1,
        height: ((b1 >> 6) | (b2 << 2) | ((b3 & 0x0f) << 10)) + 1
      };
    }
    if (fourcc === "VP8 ") {
      const s = start + 6;
      return {
        width: (bytes[s] | (bytes[s + 1] << 8)) & 0x3fff,
        height: (bytes[s + 2] | (bytes[s + 3] << 8)) & 0x3fff
      };
    }
    offset = start + size + (size % 2);
  }
  throw new Error(`No WebP image header found in ${filePath}`);
}

for (const floor of floors) {
  for (const suffix of ["", "underground"]) {
    const pngName = `${floor}${suffix}.png`;
    const webpName = `${floor}${suffix}.webp`;
    const pngPath = path.join(mapDir, pngName);
    const webpPath = path.join(mapDir, webpName);

    assert.ok(fs.existsSync(pngPath), `${pngName} exists as the PNG fallback`);
    assert.ok(fs.existsSync(webpPath), `${webpName} exists as the preferred source`);

    const png = readPngDimensions(pngPath);
    const webp = readWebpDimensions(webpPath);
    assert.deepEqual(
      webp,
      png,
      `${webpName} keeps the exact pixel dimensions of ${pngName} (${png.width}x${png.height})`
    );
    assert.ok(fs.statSync(webpPath).size < fs.statSync(pngPath).size, `${webpName} is smaller than ${pngName}`);
  }
}

/* The Aincrad adapter must expose the WebP siblings alongside the PNG paths. */
const adapterSource = fs.readFileSync(path.join(mapDir, "adapter.js"), "utf8");
for (const floor of floors) {
  assert.match(
    adapterSource,
    new RegExp(`surface:\\s*"${floor}\\.png"`),
    `${floor} adapter keeps the PNG surface path`
  );
  assert.match(
    adapterSource,
    new RegExp(`surfaceWebp:\\s*"${floor}\\.webp"`),
    `${floor} adapter exposes the WebP surface path`
  );
  assert.match(
    adapterSource,
    new RegExp(`undergroundWebp:\\s*"${floor}underground\\.webp"`),
    `${floor} adapter exposes the WebP underground path`
  );
}

/* The shared fallback helper must be exported for the controllers to use. */
const helperSource = fs.readFileSync(path.join(root, "shared", "sao-map-helpers.js"), "utf8");
assert.match(helperSource, /applyImageSourceWithFallback\s*\(/, "the shared fallback helper exists");
assert.match(helperSource, /^\s*applyImageSourceWithFallback\s*,?\s*$/m, "the shared fallback helper is exported");

console.log("Map image asset tests passed.");
