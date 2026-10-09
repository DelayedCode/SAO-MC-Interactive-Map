"use strict";

/* Cursor-hotspot regression: the exact point of the custom arrow cursor IS the exact point the
   map's coordinate pipeline uses.

   The chain under test, end to end:
     shared/sao-polish.css declares the arrow's hotspot
       -> the SVG artwork's outermost painted point is that same point (proved from the stroked
          geometry and again by rasterising the artwork at the size the browser draws it)
       -> the browser applies that cursor to the map surface
       -> event.clientX/clientY is the pointer the hotspot sits on
       -> getImageLocalCoords -> mapWebsiteCoordinates -> the on-screen readout
       -> the custom waypoint dialog
       -> the stored custom waypoint
       -> the JourneyMap export

   Every runtime step is pinned at 1x, 5x, 10x, 20x, 30x and 45x, and again after panning, so a
   hotspot, artwork or pipeline offset - constant or zoom-dependent - fails here. The readout is
   compared for *exact* string equality against the page's own conversion of the pointer position,
   which is what makes "the tip is the sampled point" testable rather than assumed.

   The coordinate calibration is owned by Aincrad/Map/mapData.js and is never re-derived, adjusted
   or worked around here; the reference points below are the site's verified Floor 1 pairs. */

const assert = require("node:assert/strict");
const { chromium } = require("playwright");
const { attachDiagnostics, ensureStaticServer } = require("./harness-helpers");
const { readCursor, readArrowGeometry, rasterize, outermostPaintedSample } = require("./cursor-artwork");
const { parseJourneyMapDat } = require("../shared/sao-journeymap-export.js");

const rootUrl = process.env.SAO_BASE_URL || "http://127.0.0.1:8080";
const AINCRAD_URL = "/Aincrad/Map/maps.html?floor=floor1";
const AINCRAD_KEY = "sao.customWaypoints.aincrad";
const WAYPOINT_NAME = "Cursor hotspot marker";
const ZOOM_LEVELS = [1, 5, 10, 20, 30, 45];
/* How far a rasterised sample can sit from the true edge, as a fraction of a sample. */
const SUPERSAMPLE = 16;

/* The two verified Floor 1 reference points: the map pixel the legacy grid labelled <legacy> reads
   Minecraft <minecraft>, and <rawPixel> is where invertMapCoordinates puts that Minecraft pair. */
const REFERENCE_POINTS = [
  {
    label: "reference point 1",
    legacy: { x: 1798, z: 4178 },
    minecraft: { x: 1800, z: 4190 },
    rawPixel: { x: 1754.83367359193, y: 4128.237460469957 }
  },
  {
    label: "reference point 2",
    legacy: { x: 1797, z: 3974 },
    minecraft: { x: 1799, z: 3986 },
    rawPixel: { x: 1753.8329130138907, y: 3924.0823025499376 }
  }
];

async function readTransform(page) {
  return page.evaluate(() => {
    const match = /translate\(([-\d.]+)px,\s*([-\d.]+)px\)\s*scale\(([-\d.]+)\)/.exec(
      document.getElementById("mapLayer").style.transform || ""
    );
    return match ? { x: Number(match[1]), y: Number(match[2]), zoom: Number(match[3]) } : null;
  });
}

async function readDisplayScale(page) {
  return page.evaluate(() => {
    const image = document.getElementById("mapImage");
    const rect = image.getBoundingClientRect();
    return Math.min(rect.width / image.naturalWidth, rect.height / image.naturalHeight);
  });
}

async function zoomInTo(page, target) {
  for (let attempt = 0; attempt < 120; attempt += 1) {
    const zoom = (await readTransform(page)).zoom;
    if (zoom >= target - 1e-9) return zoom;
    await page.locator("#zoomIn").click();
  }
  throw new Error(`could not reach zoom ${target}`);
}

/* Mirrors getImageLocalCoords in the other direction: a raw map pixel -> the client point that
   projects onto it, using the live (already transformed) image bounds. */
async function clientPointForRawPixel(page, rawPixel) {
  return page.evaluate((target) => {
    const image = document.getElementById("mapImage");
    const rect = image.getBoundingClientRect();
    const scale = Math.min(rect.width / image.naturalWidth, rect.height / image.naturalHeight);
    const offsetX = (rect.width - image.naturalWidth * scale) / 2;
    const offsetY = (rect.height - image.naturalHeight * scale) / 2;
    return { x: rect.left + offsetX + target.x * scale, y: rect.top + offsetY + target.y * scale };
  }, rawPixel);
}

/* The exact readout string the page produces for a client point, computed through the page's own
   helpers. Comparing the live readout against this is what proves the readout samples the pointer
   position itself rather than any adjusted point. */
async function coordinateForClientPoint(page, point) {
  return page.evaluate(({ x, y }) => {
    const image = document.getElementById("mapImage");
    const local = window.SAOMapHelpers.getImageLocalCoords(image, { clientX: x, clientY: y });
    if (!local.contentWidth || !local.contentHeight) return null;
    const rawX = local.localX * (local.naturalWidth / local.contentWidth);
    const rawY = local.localY * (local.naturalHeight / local.contentHeight);
    const mapped = window.mapWebsiteCoordinates(rawX, rawY, document.getElementById("floorSelect").value, {
      width: local.naturalWidth,
      height: local.naturalHeight
    });
    if (!mapped) return null;
    return {
      x: Number(mapped.x.toFixed(0)),
      z: Number(mapped.z.toFixed(0)),
      readout: `X: ${mapped.x.toFixed(0)} Z: ${mapped.z.toFixed(0)}`
    };
  }, point);
}

/* A container point no marker/chrome element covers, so it can be used to drag the map. */
async function findFreeMapPoint(page) {
  return page.evaluate(() => {
    const container = document.getElementById("mapContainer");
    const rect = container.getBoundingClientRect();
    for (const fx of [0.5, 0.3, 0.7, 0.15, 0.85]) {
      for (const fy of [0.5, 0.3, 0.7, 0.15, 0.85]) {
        const candidate = { x: rect.left + rect.width * fx, y: rect.top + rect.height * fy };
        const target = document.elementFromPoint(candidate.x, candidate.y);
        if (
          target &&
          container.contains(target) &&
          !target.closest(".marker, button, input, select, textarea, label, dialog, #infoOverlay, #zoomControls")
        ) {
          return candidate;
        }
      }
    }
    return null;
  });
}

/* Pans the map until a raw pixel is comfortably inside the viewport, then returns its client point.
   A drag moves the map by exactly the drag delta, so the pan converges; the step is generous enough
   to cross the whole artwork in a couple of passes at the top of the zoom range. */
async function bringRawPixelIntoView(page, rawPixel) {
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const point = await clientPointForRawPixel(page, rawPixel);
    const box = await page.locator("#mapContainer").boundingBox();
    const margin = 60;
    const inside =
      point.x > box.x + margin &&
      point.x < box.x + box.width - margin &&
      point.y > box.y + margin &&
      point.y < box.y + box.height - margin;
    if (inside) return point;
    const free = await findFreeMapPoint(page);
    if (!free) break;
    const dx = Math.max(-1200, Math.min(1200, box.x + box.width / 2 - point.x));
    const dy = Math.max(-1200, Math.min(1200, box.y + box.height / 2 - point.y));
    await page.mouse.move(free.x, free.y);
    await page.mouse.down();
    await page.mouse.move(free.x + dx, free.y + dy, { steps: 10 });
    await page.mouse.up();
    await page.waitForTimeout(90);
  }
  return clientPointForRawPixel(page, rawPixel);
}

/* Moves the real pointer onto the client point of a raw pixel and requires the on-screen readout to
   be exactly what the page's own conversion produces for that pointer position. Exact equality is
   the point: any hotspot/artwork/pipeline offset would move the readout off the pointer's own
   coordinate. The reference's Minecraft value is then checked within the quantisation one client
   pixel implies at the active zoom. */
async function assertCursorTipReadout(page, reference, context) {
  const point = await bringRawPixelIntoView(page, reference.rawPixel);
  const rounded = { x: Math.round(point.x), y: Math.round(point.y) };
  const expected = await coordinateForClientPoint(page, rounded);
  assert.ok(expected, `${context}: the pointer position converts to a coordinate`);
  await page.mouse.move(rounded.x, rounded.y);
  await page.waitForFunction(
    (value) => document.getElementById("overlayMappedCoords").textContent.trim() === value,
    expected.readout
  );
  const zoom = (await readTransform(page)).zoom;
  const displayScale = await readDisplayScale(page);
  /* One client pixel spans 1/displayScale raw pixels and a raw pixel is ~1 Minecraft block, so half
     a pixel of rounding is 0.5/displayScale blocks; +1 covers the readout's own rounding. */
  const tolerance = Math.ceil(0.5 / displayScale) + 1;
  assert.ok(
    Math.abs(expected.x - reference.minecraft.x) <= tolerance &&
      Math.abs(expected.z - reference.minecraft.z) <= tolerance,
    `${context}: the pixel the legacy grid called ${reference.legacy.x},${reference.legacy.z} reads ` +
      `${reference.minecraft.x},${reference.minecraft.z} under the cursor tip (got ${expected.x},${expected.z}; ` +
      `tolerance ${tolerance} at ${zoom}x)`
  );
  /* Past ~1:1 one client pixel spans well under a Minecraft block, so rounding the pointer onto the
     pixel grid cannot move the readout at all: the tip must name the exact reference coordinate.
     This is the zero-offset proof - a constant or zoom-dependent offset would show up here. */
  if (displayScale >= 2) {
    assert.deepEqual(
      { x: expected.x, z: expected.z },
      reference.minecraft,
      `${context}: at ${zoom}x the cursor tip names the exact reference coordinate, with no offset`
    );
  }
  return { point: rounded, expected, zoom };
}

/* --- 1-4. The artwork: the declared hotspot IS the outermost painted point of the arrow ---

   The outline is stroked, so the visible tip is the outer *miter* point, which sits beyond the path
   vertex; that point - not the vertex - has to land on the declared hotspot. Proved twice: from the
   stroked geometry, and by rasterising the artwork at the size the browser actually draws it. */
async function verifyCursorArtwork() {
  const arrow = readCursor("arrow");
  assert.deepEqual(arrow.hotspot, { x: 1, y: 1 }, "the shared sheet declares the arrow hotspot as the tip");

  const geometry = readArrowGeometry(arrow);
  assert.equal(geometry.join, "miter", "the arrow outline is mitred so its tip stays sharp");
  assert.ok(
    geometry.miterDrawn,
    `the miter limit (${geometry.miterLimit}) is not exceeded (${geometry.miterRatio.toFixed(3)}), so SVG ` +
      "paints the sharp point instead of bevelling it away"
  );
  assert.ok(
    Math.abs(geometry.paintedTip[0] - arrow.hotspot.x) <= 0.001 &&
      Math.abs(geometry.paintedTip[1] - arrow.hotspot.y) <= 0.001,
    `the stroked miter tip (${geometry.paintedTip[0].toFixed(4)}, ${geometry.paintedTip[1].toFixed(4)}) is the ` +
      `declared hotspot (${arrow.hotspot.x}, ${arrow.hotspot.y})`
  );
  assert.ok(
    geometry.miterDistance - geometry.haloReach > 0,
    "the soft halo stops short of the sharp tip, so it never paints past the hotspot"
  );

  /* Rasterised at the real cursor size: nothing visible may cross the hotspot in the tip direction. */
  const native = await rasterize(arrow.svg, arrow.size, 1);
  assert.ok(
    native.alpha(0, 0) <= 8 && native.alpha(1, 0) <= 8,
    "the pixels outward of the hotspot carry no visible paint"
  );
  const nativeVisible = outermostPaintedSample(native, geometry.outward, arrow.hotspot, 32);
  assert.ok(
    nativeVisible.overshoot <= 0,
    `no visible arrow pixel crosses the hotspot in the tip direction ` +
      `(outermost visible ${nativeVisible.overshoot.toFixed(3)}px)`
  );

  /* Supersampled, so the half-sample raster bound shrinks to a sixteenth of a pixel: the painted tip
     must land on the hotspot, neither falling short of it nor reaching past it. */
  const supersampled = await rasterize(arrow.svg, arrow.size, SUPERSAMPLE);
  const tip = outermostPaintedSample(supersampled, geometry.outward, arrow.hotspot);
  assert.ok(
    Math.abs(tip.overshoot) <= 1 / SUPERSAMPLE,
    `at ${SUPERSAMPLE}x the painted arrow tip lands on the hotspot ` +
      `(${tip.overshoot >= 0 ? "beyond" : "short of"} by ${Math.abs(tip.overshoot).toFixed(4)}px)`
  );

  return { arrow, geometry };
}

/* --- 6-7. The tip -> readout relationship across the whole zoom range, and after panning ---

   The ladder is walked incrementally and the reference is re-centred at every stop: each stop is
   only a few times the previous zoom, so the pan stays in reach and the pointer ends up on the same
   physical map pixel at 1x, 5x, 10x, 20x, 30x and 45x. */
async function verifyZoomAndPan(page) {
  await page.locator("#resetView").click();
  await page.waitForTimeout(60);

  for (const zoom of ZOOM_LEVELS) {
    await zoomInTo(page, zoom);
    for (const reference of REFERENCE_POINTS) {
      await assertCursorTipReadout(page, reference, `${reference.label} at ~${zoom}x`);
    }
  }

  /* Pan at the top of the range, then require the same tip -> readout equality again. */
  const free = await findFreeMapPoint(page);
  assert.ok(free, "a free map point is available for panning");
  await page.mouse.move(free.x, free.y);
  await page.mouse.down();
  await page.mouse.move(free.x - 240, free.y - 180, { steps: 12 });
  await page.mouse.up();
  await page.waitForTimeout(90);
  for (const reference of REFERENCE_POINTS) {
    await assertCursorTipReadout(page, reference, `${reference.label} at 45x after panning`);
  }

  await page.locator("#resetView").click();
  await page.waitForTimeout(60);
}

async function openJourneyMapContextMenu(page) {
  const point = await page.evaluate(() => {
    const layer = document.getElementById("mapLayer");
    const rect = layer.getBoundingClientRect();
    for (const fraction of [0.3, 0.42, 0.56, 0.7, 0.84]) {
      const x = rect.left + rect.width * fraction;
      const y = rect.top + rect.height * fraction;
      const target = document.elementFromPoint(x, y);
      if (
        target &&
        layer.contains(target) &&
        !target.closest(".marker, button, input, select, textarea, dialog, #infoOverlay, #mapEmptyState")
      ) {
        return { x, y };
      }
    }
    throw new Error("Could not find an unobstructed map point.");
  });
  await page.mouse.click(point.x, point.y, { button: "right" });
  await page.waitForSelector("#mapContextMenu [data-map-action='journey-export']");
}

async function exportJourneyMap(page) {
  await page.evaluate(() => {
    if (window.__cursorHotspotCapture) return;
    window.__cursorHotspotCapture = true;
    URL.createObjectURL = (blob) => {
      window.__cursorHotspotBlob = blob;
      return "blob:cursor-hotspot";
    };
    URL.revokeObjectURL = () => {};
    HTMLAnchorElement.prototype.click = function () {
      window.__cursorHotspotFilename = this.download;
    };
  });
  await openJourneyMapContextMenu(page);
  await page.locator("#mapContextMenu [data-map-action='journey-export']").click();
  await page.waitForFunction(() => window.__cursorHotspotBlob instanceof Blob);
  const captured = await page.evaluate(async () => ({
    filename: window.__cursorHotspotFilename,
    bytes: Array.from(new Uint8Array(await window.__cursorHotspotBlob.arrayBuffer()))
  }));
  return { filename: captured.filename, bytes: Buffer.from(captured.bytes) };
}

/* --- 5. The browser really applies that cursor, with that hotspot, to the map surface --- */
async function verifyAppliedCursor(page) {
  const cursors = await page.evaluate(() => ({
    html: getComputedStyle(document.documentElement).cursor,
    mapLayer: getComputedStyle(document.getElementById("mapLayer")).cursor,
    mapImage: getComputedStyle(document.getElementById("mapImage")).cursor
  }));
  assert.match(cursors.html, / 1 1,\s*auto$/, "the site-wide cursor is the arrow with its tip as the hotspot");
  assert.match(cursors.mapLayer, / 1 1,\s*auto$/, "the draggable map artwork keeps the arrow cursor");
  assert.match(cursors.mapImage, / 1 1,\s*auto$/, "the map image under the pointer keeps the arrow cursor");
}

/* --- 8-9. At high zoom: cursor tip = readout = dialog = stored waypoint = JourneyMap export ---

   The view is reset before exporting so the context menu has an on-screen point to open from; that
   also proves the exported coordinate is the stored one and not a function of the live view. */
async function verifyWaypointChain(page) {
  const reference = REFERENCE_POINTS[1];

  await page.locator("#resetView").click();
  await page.waitForTimeout(60);
  let point = null;
  for (const zoom of ZOOM_LEVELS) {
    await zoomInTo(page, zoom);
    point = await bringRawPixelIntoView(page, reference.rawPixel);
  }

  const rounded = { x: Math.round(point.x), y: Math.round(point.y) };
  const expected = await coordinateForClientPoint(page, rounded);
  await page.mouse.move(rounded.x, rounded.y);
  await page.waitForFunction(
    (value) => document.getElementById("overlayMappedCoords").textContent.trim() === value,
    expected.readout
  );
  /* One client pixel is a fraction of a block at 45x, so the tip must land on the exact reference. */
  assert.deepEqual(
    { x: expected.x, z: expected.z },
    reference.minecraft,
    `the cursor tip at 45x reads ${reference.minecraft.x},${reference.minecraft.z}`
  );

  /* The waypoint dialog is seeded from that same point... */
  await page.mouse.click(rounded.x, rounded.y, { clickCount: 4, delay: 25 });
  await page.waitForFunction(() => document.getElementById("customWaypointDialog").open);
  const dialogCoordinates = await page.evaluate(() => ({
    x: Number(document.getElementById("customWaypointX").value),
    z: Number(document.getElementById("customWaypointZ").value)
  }));
  assert.deepEqual(
    dialogCoordinates,
    { x: expected.x, z: expected.z },
    "the waypoint dialog holds the cursor tip coordinate"
  );

  /* ...and so is the stored record... */
  await page.locator("#customWaypointName").fill(WAYPOINT_NAME);
  await page.locator("#customWaypointForm button[type='submit']").click();
  await page.waitForFunction(
    ({ key, name }) =>
      JSON.parse(localStorage.getItem(key) || "[]").some((record) => record.name === name),
    { key: AINCRAD_KEY, name: WAYPOINT_NAME }
  );
  const stored = await page.evaluate(
    ({ key, name }) => JSON.parse(localStorage.getItem(key) || "[]").find((record) => record.name === name),
    { key: AINCRAD_KEY, name: WAYPOINT_NAME }
  );
  assert.ok(stored, "the custom waypoint is stored");
  assert.deepEqual(
    { x: stored.x, z: stored.z },
    { x: expected.x, z: expected.z },
    "the stored waypoint holds the cursor tip coordinate"
  );

  /* ...and the JourneyMap export, which must carry the canonical coordinate. */
  await page.locator("#resetView").click();
  await page.waitForTimeout(60);
  await page.evaluate(() => {
    const category = document.querySelector("[data-category='custom']");
    if (category && category.getAttribute("aria-pressed") !== "true") category.click();
    const button = document.querySelector("#customWaypointSidebarList [data-custom-button='Default']");
    if (button && button.getAttribute("aria-pressed") !== "true") button.click();
  });
  const exported = await exportJourneyMap(page);
  assert.equal(exported.filename, "WaypointData.dat", "the export keeps the JourneyMap filename");
  const payload = parseJourneyMapDat(exported.bytes);
  const exportedWaypoint = Object.values(payload.waypoints).find((waypoint) => waypoint.name === WAYPOINT_NAME);
  assert.ok(exportedWaypoint, "the custom waypoint is exported");
  assert.deepEqual(
    { x: exportedWaypoint.pos.x, z: exportedWaypoint.pos.z },
    { x: expected.x, z: expected.z },
    "JourneyMap receives the cursor tip coordinate"
  );
  assert.deepEqual(
    { x: exportedWaypoint.pos.x, z: exportedWaypoint.pos.z },
    reference.minecraft,
    "JourneyMap receives the canonical Minecraft coordinate"
  );
}

async function run() {
  const server = await ensureStaticServer(rootUrl);
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 960 } });
  await context.addInitScript(() => {
    localStorage.setItem("sao.walkthrough.maps.completed", "1");
  });

  try {
    /* 1-4. The artwork itself, before the browser is involved. */
    await verifyCursorArtwork();

    const page = await context.newPage();
    const diagnostics = attachDiagnostics(page);
    await page.goto(`${server.url}${AINCRAD_URL}`, { waitUntil: "load", timeout: 60000 });
    await page.waitForFunction(() => document.getElementById("mapImage")?.naturalWidth > 0, null, { timeout: 30000 });
    await page.waitForFunction(() => window.__aincradMapRuntime?.isInitialized?.(), null, { timeout: 30000 });

    /* 5. The browser applies that cursor, with that hotspot, to the map surface. */
    await verifyAppliedCursor(page);

    /* 6-7. Tip -> readout at every zoom level, and again after panning. */
    await verifyZoomAndPan(page);

    /* 8-9. Tip -> dialog -> store -> JourneyMap export, with no drift. */
    await verifyWaypointChain(page);

    assert.deepEqual(diagnostics.errors, [], "the cursor hotspot checks raise no console errors");
    assert.deepEqual(diagnostics.failedRequests, [], "the cursor hotspot checks load every resource");
    console.log("Cursor hotspot browser regression checks passed.");
  } finally {
    await browser.close();
    await server.stop();
  }
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
