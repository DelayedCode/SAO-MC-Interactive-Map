/* Dependency-free PNG analyzer/optimizer for the floor map images.
 *
 * The map images feed the coordinate calibration, which is derived from the image pixel
 * dimensions, so this tool is deliberately conservative:
 *   - it only handles 8-bit non-interlaced images with the color types the repository uses;
 *   - it never changes width/height;
 *   - every optimization is verified by re-decoding the result and comparing the decoded
 *     pixels to the original (a byte-for-byte identity check) before anything is written.
 *
 * Usage:
 *   node scripts/optimize-png.js --analyze <file...>
 *   node scripts/optimize-png.js --optimize --out <file> <file>     # single file
 *   node scripts/optimize-png.js --optimize --in-place <file...>
 */
"use strict";

const fs = require("node:fs");
const zlib = require("node:zlib");

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const CHANNELS_BY_COLOR_TYPE = Object.freeze({ 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 });

function hasPngSignature(buffer) {
  return buffer.length >= 8 && buffer.subarray(0, 8).equals(PNG_SIGNATURE);
}

function parseChunks(buffer) {
  if (!hasPngSignature(buffer)) throw new Error("Not a PNG file (bad signature).");
  const chunks = [];
  let offset = 8;
  while (offset + 8 <= buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.toString("ascii", offset + 4, offset + 8);
    const data = buffer.subarray(offset + 8, offset + 8 + length);
    chunks.push({ type, data, crc: buffer.readUInt32BE(offset + 8 + length) });
    offset += 12 + length;
    if (type === "IEND") break;
  }
  return chunks;
}

function readHeader(chunks) {
  const ihdr = chunks.find((chunk) => chunk.type === "IHDR");
  if (!ihdr || ihdr.data.length !== 13) throw new Error("Missing or malformed IHDR.");
  const width = ihdr.data.readUInt32BE(0);
  const height = ihdr.data.readUInt32BE(4);
  const bitDepth = ihdr.data[8];
  const colorType = ihdr.data[9];
  const compression = ihdr.data[10];
  const filter = ihdr.data[11];
  const interlace = ihdr.data[12];
  const channels = CHANNELS_BY_COLOR_TYPE[colorType];
  if (channels === undefined) throw new Error(`Unsupported color type ${colorType}.`);
  return { width, height, bitDepth, colorType, channels, compression, filter, interlace };
}

/* --- PNG filtering ---------------------------------------------------------- */

function paeth(a, b, c) {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  if (pa <= pb && pa <= pc) return a;
  if (pb <= pc) return b;
  return c;
}

/* Reconstructs the raw (unfiltered) pixel bytes from the inflated scanline stream. */
function unfilterScanlines(raw, width, height, bytesPerPixel) {
  const stride = width * bytesPerPixel;
  const pixels = Buffer.allocUnsafe(height * stride);
  let pos = 0;
  for (let y = 0; y < height; y += 1) {
    const filterType = raw[pos];
    pos += 1;
    const rowStart = y * stride;
    const prevStart = rowStart - stride;
    for (let x = 0; x < stride; x += 1) {
      const filtered = raw[pos];
      pos += 1;
      const a = x >= bytesPerPixel ? pixels[rowStart + x - bytesPerPixel] : 0;
      const b = y > 0 ? pixels[prevStart + x] : 0;
      const c = x >= bytesPerPixel && y > 0 ? pixels[prevStart + x - bytesPerPixel] : 0;
      let value;
      switch (filterType) {
        case 0:
          value = filtered;
          break;
        case 1:
          value = filtered + a;
          break;
        case 2:
          value = filtered + b;
          break;
        case 3:
          value = filtered + ((a + b) >> 1);
          break;
        case 4:
          value = filtered + paeth(a, b, c);
          break;
        default:
          throw new Error(`Unknown filter type ${filterType} on row ${y}.`);
      }
      pixels[rowStart + x] = value & 0xff;
    }
  }
  return pixels;
}

function decodePng(buffer) {
  const chunks = parseChunks(buffer);
  const header = readHeader(chunks);
  if (header.bitDepth !== 8) throw new Error(`Only 8-bit images are supported (got ${header.bitDepth}).`);
  if (header.interlace !== 0) throw new Error("Interlaced images are not supported.");
  if (header.compression !== 0 || header.filter !== 0) throw new Error("Unsupported PNG compression/filter method.");
  const idatParts = chunks.filter((chunk) => chunk.type === "IDAT").map((chunk) => chunk.data);
  if (idatParts.length === 0) throw new Error("No IDAT data found.");
  const inflated = zlib.inflateSync(Buffer.concat(idatParts));
  const expected = header.height * (1 + header.width * header.channels);
  if (inflated.length !== expected) {
    throw new Error(`Unexpected scanline length ${inflated.length} (expected ${expected}).`);
  }
  const pixels = unfilterScanlines(inflated, header.width, header.height, header.channels);
  return { ...header, pixels, chunks };
}

/* --- PNG encoding ----------------------------------------------------------- */

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(bytes) {
  let c = 0xffffffff;
  for (let i = 0; i < bytes.length; i += 1) c = CRC_TABLE[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function buildChunk(type, data) {
  const chunk = Buffer.allocUnsafe(12 + data.length);
  chunk.writeUInt32BE(data.length, 0);
  chunk.write(type, 4, "ascii");
  data.copy(chunk, 8);
  const crc = crc32(Buffer.concat([Buffer.from(type, "ascii"), data]));
  chunk.writeUInt32BE(crc, 8 + data.length);
  return chunk;
}

/* Picks the per-row filter (None/Sub/Up/Average/Paeth) that minimises the sum of the
   absolute signed filter values, the standard heuristic used by optipng/pngcrush. */
function filterRow(row, prev, bytesPerPixel) {
  const stride = row.length;
  let bestType = 0;
  let bestData = null;
  let bestScore = Infinity;
  for (let type = 0; type <= 4; type += 1) {
    const data = Buffer.allocUnsafe(stride);
    let score = 0;
    for (let x = 0; x < stride; x += 1) {
      const raw = row[x];
      const a = x >= bytesPerPixel ? row[x - bytesPerPixel] : 0;
      const b = prev ? prev[x] : 0;
      const c = prev && x >= bytesPerPixel ? prev[x - bytesPerPixel] : 0;
      let value;
      switch (type) {
        case 0:
          value = raw;
          break;
        case 1:
          value = raw - a;
          break;
        case 2:
          value = raw - b;
          break;
        case 3:
          value = raw - ((a + b) >> 1);
          break;
        default:
          value = raw - paeth(a, b, c);
          break;
      }
      value &= 0xff;
      data[x] = value;
      score += value < 128 ? value : 256 - value;
    }
    if (score < bestScore) {
      bestScore = score;
      bestType = type;
      bestData = data;
    }
  }
  return { type: bestType, data: bestData };
}

function buildFilteredScanlines(pixels, width, height, bytesPerPixel) {
  const stride = width * bytesPerPixel;
  const out = Buffer.allocUnsafe(height * (1 + stride));
  let prev = null;
  for (let y = 0; y < height; y += 1) {
    const row = pixels.subarray(y * stride, (y + 1) * stride);
    const filtered = filterRow(row, prev, bytesPerPixel);
    const offset = y * (1 + stride);
    out[offset] = filtered.type;
    filtered.data.copy(out, offset + 1);
    prev = row;
  }
  return out;
}

function deflateSmallest(filtered) {
  const strategies = [zlib.constants.Z_DEFAULT_STRATEGY, zlib.constants.Z_FILTERED];
  let best = null;
  for (const strategy of strategies) {
    const candidate = zlib.deflateSync(filtered, { level: 9, memLevel: 9, strategy });
    if (!best || candidate.length < best.length) best = candidate;
  }
  return best;
}

/* Builds a PNG with the given pixels. Ancillary chunks (everything except IHDR/IDAT/IEND)
   are preserved in order so no metadata the image relies on is silently dropped. */
function encodePng(header, pixels, chunks = []) {
  const filtered = buildFilteredScanlines(pixels, header.width, header.height, header.channels);
  const idat = deflateSmallest(filtered);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(header.width, 0);
  ihdr.writeUInt32BE(header.height, 4);
  ihdr[8] = 8;
  ihdr[9] = header.colorType;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  const parts = [PNG_SIGNATURE, buildChunk("IHDR", ihdr)];
  chunks
    .filter((chunk) => !["IHDR", "IDAT", "IEND"].includes(chunk.type))
    .forEach((chunk) => parts.push(buildChunk(chunk.type, chunk.data)));
  parts.push(buildChunk("IDAT", idat));
  parts.push(buildChunk("IEND", Buffer.alloc(0)));
  return Buffer.concat(parts);
}

/* --- Analysis + optimization ------------------------------------------------ */

function alphaStats(pixels, channels) {
  if (channels !== 4) return { hasAlpha: false, opaque: true, min: 255, max: 255, transparentCount: 0 };
  let min = 255;
  let max = 0;
  let transparent = 0;
  for (let i = 3; i < pixels.length; i += 4) {
    const value = pixels[i];
    if (value < min) min = value;
    if (value > max) max = value;
    if (value !== 255) transparent += 1;
  }
  return { hasAlpha: true, opaque: min === 255, min, max, transparentCount: transparent };
}

function dropAlpha(pixels) {
  const count = pixels.length / 4;
  const out = Buffer.allocUnsafe(count * 3);
  for (let i = 0, o = 0; i < pixels.length; i += 4, o += 3) {
    out[o] = pixels[i];
    out[o + 1] = pixels[i + 1];
    out[o + 2] = pixels[i + 2];
  }
  return out;
}

/* Counts distinct RGB colors, stopping once `limit` is exceeded (palette feasibility). */
function distinctColorCount(pixels, channels, limit = 300) {
  const seen = new Set();
  for (let i = 0; i < pixels.length; i += channels) {
    seen.add((pixels[i] << 16) | (pixels[i + 1] << 8) | pixels[i + 2]);
    if (seen.size > limit) return seen.size;
  }
  return seen.size;
}

function pixelsMatch(aPixels, aChannels, bPixels, bChannels) {
  if (aChannels === bChannels) return aPixels.equals(bPixels);
  if (aChannels !== 4 || bChannels !== 3) return false;
  if (bPixels.length !== (aPixels.length / 4) * 3) return false;
  for (let i = 0, o = 0; i < aPixels.length; i += 4, o += 3) {
    if (aPixels[i] !== bPixels[o] || aPixels[i + 1] !== bPixels[o + 1] || aPixels[i + 2] !== bPixels[o + 2]) {
      return false;
    }
  }
  return true;
}

/* Losslessly re-encodes a PNG: per-row filter selection + level-9 deflate, and drops a
   fully-opaque alpha channel (RGBA -> RGB) when it carries no transparency. The result is
   re-decoded and compared to the source before it is returned. */
function optimizeBuffer(buffer, options = {}) {
  const decoded = decodePng(buffer);
  const alpha = alphaStats(decoded.pixels, decoded.channels);
  const dropOpaque = options.dropOpaqueAlpha !== false && decoded.colorType === 6 && alpha.opaque;
  const targetChannels = dropOpaque ? 3 : decoded.channels;
  const targetColorType = dropOpaque ? 2 : decoded.colorType;
  const targetPixels = dropOpaque ? dropAlpha(decoded.pixels) : decoded.pixels;

  const output = encodePng(
    { ...decoded, colorType: targetColorType, channels: targetChannels },
    targetPixels,
    decoded.chunks
  );

  const verified = decodePng(output);
  if (verified.width !== decoded.width || verified.height !== decoded.height) {
    throw new Error("Verification failed: dimensions changed.");
  }
  if (!pixelsMatch(decoded.pixels, decoded.channels, verified.pixels, verified.channels)) {
    throw new Error("Verification failed: decoded pixels differ from the source.");
  }

  return {
    output,
    report: {
      width: decoded.width,
      height: decoded.height,
      sourceColorType: decoded.colorType,
      targetColorType,
      sourceSize: buffer.length,
      outputSize: output.length,
      droppedOpaqueAlpha: dropOpaque,
      alpha
    }
  };
}

function analyzeBuffer(buffer) {
  const decoded = decodePng(buffer);
  const alpha = alphaStats(decoded.pixels, decoded.channels);
  return {
    width: decoded.width,
    height: decoded.height,
    colorType: decoded.colorType,
    channels: decoded.channels,
    bitDepth: decoded.bitDepth,
    interlace: decoded.interlace,
    size: buffer.length,
    ancillary: decoded.chunks
      .filter((chunk) => !["IHDR", "IDAT", "IEND"].includes(chunk.type))
      .map((chunk) => `${chunk.type}(${chunk.data.length})`),
    alpha,
    colors: distinctColorCount(decoded.pixels, decoded.channels)
  };
}

function formatMiB(bytes) {
  return `${(bytes / 1048576).toFixed(2)} MiB`;
}

function runAnalyze(files) {
  for (const file of files) {
    const buffer = fs.readFileSync(file);
    const info = analyzeBuffer(buffer);
    const { report } = optimizeBuffer(buffer);
    const reduction = ((1 - report.outputSize / buffer.length) * 100).toFixed(1);
    console.log(`\n${file}`);
    console.log(`  size       ${buffer.length} bytes (${formatMiB(buffer.length)})`);
    console.log(
      `  dimensions ${info.width}x${info.height}  colorType=${info.colorType} channels=${info.channels} bitDepth=${info.bitDepth} interlace=${info.interlace}`
    );
    console.log(`  ancillary  ${info.ancillary.length ? info.ancillary.join(", ") : "(none)"}`);
    console.log(
      `  alpha      ${info.alpha.hasAlpha ? `min=${info.alpha.min} max=${info.alpha.max} nonOpaque=${info.alpha.transparentCount}${info.alpha.opaque ? " [fully opaque]" : ""}` : "none"}`
    );
    console.log(`  colors     ${info.colors > 300 ? ">300" : info.colors}`);
    console.log(
      `  optimized  ${report.outputSize} bytes (${formatMiB(report.outputSize)}) droppedAlpha=${report.droppedOpaqueAlpha} (${reduction}% smaller)`
    );
  }
}

function runOptimize(files, options) {
  for (const file of files) {
    const buffer = fs.readFileSync(file);
    const { output, report } = optimizeBuffer(buffer);
    const target = options.out || (options.inPlace ? file : `${file.replace(/\.png$/i, "")}.optimized.png`);
    fs.writeFileSync(target, output);
    const reduction = ((1 - report.outputSize / buffer.length) * 100).toFixed(1);
    console.log(
      `${file}: ${buffer.length} -> ${output.length} bytes (${reduction}% smaller), droppedAlpha=${report.droppedOpaqueAlpha}, dimensions ${report.width}x${report.height} -> written ${target}`
    );
  }
}

function main() {
  const args = process.argv.slice(2);
  const flags = new Set();
  const files = [];
  let out = null;
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === "--out") {
      out = args[i + 1];
      i += 1;
    } else if (arg.startsWith("--")) {
      flags.add(arg);
    } else {
      files.push(arg);
    }
  }
  if (files.length === 0) {
    console.error(
      "Usage: node scripts/optimize-png.js --analyze <file...> | --optimize [--in-place|--out <file>] <file...>"
    );
    process.exitCode = 2;
    return;
  }
  if (flags.has("--optimize")) {
    runOptimize(files, { inPlace: flags.has("--in-place"), out: files.length === 1 ? out : null });
  } else {
    runAnalyze(files);
  }
}

if (require.main === module) main();

module.exports = { decodePng, encodePng, analyzeBuffer, optimizeBuffer, alphaStats, distinctColorCount, crc32 };
