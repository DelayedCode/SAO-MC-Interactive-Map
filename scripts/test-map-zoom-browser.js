"use strict";

/* Zoom regression checks for both interactive maps.

   Pins the zoom curve (min / max / increment ceiling), that the displayed label never lies about
   the internal scale, that a wheel zoom keeps the point under the cursor fixed, that the adaptive
   image rendering switches exactly at 1:1, and - on the Aincrad map, which carries artwork - that
   the map <-> Minecraft conversion stays exact at every zoom level, after panning, and after
   pan + zoom. The Fractured Underworld map is placeholder artwork today, so it exercises the
   shared zoom controls (the coordinate half is covered on Aincrad).

   The coordinate calibration itself is owned by Aincrad/Map/mapData.js and is not re-derived here;
   these checks only prove the zoom system feeds it correct image-local pixels. */

const assert = require("node:assert/strict");
const { chromium } = require("playwright");
const { attachDiagnostics, ensureStaticServer } = require("./harness-helpers");

const rootUrl = process.env.SAO_BASE_URL || "http://127.0.0.1:8080";
const AINCRAD_URL = "/Aincrad/Map/maps.html?floor=floor1";
const UNDERWORLD_URL = "/Fractured%20Underworld/Main%20UI/mainui.html";

const ZOOM_MAX = 45;
const ZOOM_MIN = 0.5;
const ZOOM_FACTOR = 1.14;
const ZOOM_MAX_STEP = 1;

/* The two reported reference points. The map pixel the legacy grid labelled 1798,4178 must read
   Minecraft 1800,4190, and 1797,3974 must read 1799,3986. */
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

async function readZoomLabel(page) {
  return (await page.locator("#zoomLabel").textContent()).trim();
}

async function readImageRendering(page) {
  return page.evaluate(() => document.getElementById("mapImage").style.imageRendering || "");
}

/* The numeric value the label shows, so it can be compared with the internal zoom. */
function labelValue(label) {
  return Number.parseFloat(label.replace("x", ""));
}

async function clickZoomIn(page) {
  await page.locator("#zoomIn").click();
  return (await readTransform(page)).zoom;
}

async function clickZoomOut(page) {
  await page.locator("#zoomOut").click();
  return (await readTransform(page)).zoom;
}

async function zoomInTo(page, target) {
  for (let attempt = 0; attempt < 120; attempt += 1) {
    const zoom = (await readTransform(page)).zoom;
    if (zoom >= target - 1e-9) return zoom;
    await clickZoomIn(page);
  }
  throw new Error(`could not reach zoom ${target}`);
}

async function zoomOutTo(page, target) {
  for (let attempt = 0; attempt < 200; attempt += 1) {
    const zoom = (await readTransform(page)).zoom;
    if (zoom <= target + 1e-9) return zoom;
    await clickZoomOut(page);
  }
  throw new Error(`could not reach zoom ${target}`);
}

/* Mirrors shared/sao-map-helpers.js getImageLocalCoords in the other direction: a raw map pixel
   -> the client point that projects onto it. */
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

async function readOverlayReadout(page) {
  return page.evaluate(() => document.getElementById("overlayMappedCoords").textContent.trim());
}

/* The Minecraft coordinate the page's own conversion assigns to a client point. */
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
    return { x: Math.round(mapped.x), z: Math.round(mapped.z) };
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

/* Pans the map so a raw pixel lands near the viewport centre, then returns its client point. */
async function bringRawPixelIntoView(page, rawPixel) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
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
    const dx = Math.max(-700, Math.min(700, box.x + box.width / 2 - point.x));
    const dy = Math.max(-700, Math.min(700, box.y + box.height / 2 - point.y));
    await page.mouse.move(free.x, free.y);
    await page.mouse.down();
    await page.mouse.move(free.x + dx, free.y + dy, { steps: 10 });
    await page.mouse.up();
    await page.waitForTimeout(90);
  }
  return clientPointForRawPixel(page, rawPixel);
}

/* Moves the real pointer onto the client point of a raw pixel and requires the on-screen readout
   to still name the expected Minecraft coordinate. The tolerance shrinks as one client pixel
   covers fewer blocks, so it stays honest at 1x while pinning the value tightly at high zoom.
   The cursor tip is the coordinate point, so this also proves zooming introduces no drift. */
async function assertRawPixelReadout(page, reference, context) {
  const point = await bringRawPixelIntoView(page, reference.rawPixel);
  const rounded = { x: Math.round(point.x), y: Math.round(point.y) };
  await page.mouse.move(rounded.x, rounded.y);
  await page.waitForTimeout(40);
  const readout = await readOverlayReadout(page);
  const match = /X:\s*(-?\d+)\s*Z:\s*(-?\d+)/.exec(readout);
  assert.ok(match, `${context}: the readout shows X and Z (got "${readout}")`);
  const got = { x: Number(match[1]), z: Number(match[2]) };
  const zoom = (await readTransform(page)).zoom;
  const displayScale = await page.evaluate(() => {
    const image = document.getElementById("mapImage");
    const rect = image.getBoundingClientRect();
    return Math.min(rect.width / image.naturalWidth, rect.height / image.naturalHeight);
  });
  /* One client pixel spans 1/displayScale raw pixels and a raw pixel is ~1 Minecraft block, so
     half a pixel of rounding is 0.5/displayScale blocks; +1 covers the readout's own rounding. */
  const tolerance = Math.ceil(0.5 / displayScale) + 1;
  assert.ok(
    Math.abs(got.x - reference.minecraft.x) <= tolerance && Math.abs(got.z - reference.minecraft.z) <= tolerance,
    `${context}: the pixel the legacy grid called ${reference.legacy.x},${reference.legacy.z} reads ` +
      `${reference.minecraft.x},${reference.minecraft.z} (got ${got.x},${got.z}; tolerance ${tolerance} at ${zoom}x)`
  );
  return got;
}


/* --- shared zoom controls: min, max, increments, and a label that matches the internal zoom --- */
async function checkZoomControls(page, mapName) {
  await page.locator("#resetView").click();
  await page.waitForTimeout(60);

  assert.equal((await readTransform(page)).zoom, 1, `${mapName}: the map starts at 1x`);
  assert.equal(await readZoomLabel(page), "1x", `${mapName}: the start label reads 1x`);

  const firstStep = await clickZoomIn(page);
  assert.ok(
    Math.abs(firstStep - ZOOM_FACTOR) < 1e-9,
    `${mapName}: one click while zoomed out is a 1.14x multiplier (got ${firstStep})`
  );
  assert.equal(await readZoomLabel(page), "1.1x", `${mapName}: the first click reads 1.1x`);

  /* Walk the whole ladder in, checking every step size and the label at every stop. */
  await page.locator("#resetView").click();
  let zoom = 1;
  let steps = 0;
  while (zoom < ZOOM_MAX && steps < 200) {
    const next = await clickZoomIn(page);
    const step = next - zoom;
    assert.ok(step > 0, `${mapName}: every zoom-in step moves forward (${zoom}x -> ${next}x)`);
    assert.ok(step <= ZOOM_MAX_STEP + 1e-9, `${mapName}: no step exceeds ${ZOOM_MAX_STEP}x (${zoom}x -> ${next}x)`);
    const label = await readZoomLabel(page);
    assert.ok(Math.abs(labelValue(label) - next) <= 0.05, `${mapName}: the label ${label} matches the internal ${next}x`);
    zoom = next;
    steps += 1;
  }
  assert.equal(zoom, ZOOM_MAX, `${mapName}: the ladder reaches the ${ZOOM_MAX}x ceiling`);
  assert.equal(await readZoomLabel(page), "45x", `${mapName}: the ceiling label reads 45x`);
  assert.equal(await clickZoomIn(page), ZOOM_MAX, `${mapName}: clicking in at the ceiling changes nothing`);

  /* Stepping back down from the top is symmetric (-1x), not a division. */
  const back = await clickZoomOut(page);
  assert.ok(Math.abs(back - (ZOOM_MAX - 1)) < 1e-9, `${mapName}: one step down from the ceiling is -1x (got ${back})`);

  const floor = await zoomOutTo(page, ZOOM_MIN);
  assert.equal(floor, ZOOM_MIN, `${mapName}: the ladder reaches the ${ZOOM_MIN}x floor`);
  assert.equal(await readZoomLabel(page), "0.5x", `${mapName}: the floor label reads 0.5x`);
  assert.equal(await clickZoomOut(page), ZOOM_MIN, `${mapName}: clicking out at the floor changes nothing`);

  await page.locator("#resetView").click();
  await page.waitForTimeout(60);
  assert.equal((await readTransform(page)).zoom, 1, `${mapName}: Reset View returns to 1x`);
  assert.equal(await readZoomLabel(page), "1x", `${mapName}: Reset View restores the 1x label`);
}

/* --- zooming keeps the map point under the cursor under the cursor --- */
async function checkFocalPoint(page, mapName) {
  await page.locator("#resetView").click();
  await zoomInTo(page, 12);
  await page.waitForTimeout(60);

  const box = await page.locator("#mapContainer").boundingBox();
  const anchor = { x: box.x + box.width * 0.42, y: box.y + box.height * 0.44 };
  const before = await coordinateForClientPoint(page, anchor);
  assert.ok(before, `${mapName}: a coordinate is readable under the anchor`);

  await page.mouse.move(anchor.x, anchor.y);
  await page.mouse.wheel(0, -120);
  await page.waitForTimeout(80);

  const after = await coordinateForClientPoint(page, anchor);
  const zoomed = (await readTransform(page)).zoom;
  assert.ok(zoomed > 12, `${mapName}: the wheel zoomed in (now ${zoomed}x)`);
  assert.ok(
    Math.abs(after.x - before.x) <= 1 && Math.abs(after.z - before.z) <= 1,
    `${mapName}: the map point under the cursor stays put across a wheel zoom ` +
      `(${before.x},${before.z} -> ${after.x},${after.z})`
  );
  await page.locator("#resetView").click();
}

/* --- adaptive image rendering: smooth while downscaled, crisp once upscaled past 1:1 --- */
async function checkImageRendering(page, mapName) {
  await page.locator("#resetView").click();
  await page.waitForTimeout(60);

  const displayScale = await page.evaluate(() => {
    const image = document.getElementById("mapImage");
    const rect = image.getBoundingClientRect();
    return Math.min(rect.width / image.naturalWidth, rect.height / image.naturalHeight);
  });
  assert.ok(displayScale > 0, `${mapName}: the map artwork has a measurable content scale`);

  /* Walk the whole ladder and require the rendering to be exactly what the displayed scale
     implies - smooth below 1:1, nearest-neighbour at and above it - so the switch boundary is
     pinned rather than sampled at one arbitrary zoom. */
  const seen = new Set();
  let zoom = 1;
  let steps = 0;
  while (zoom < ZOOM_MAX && steps < 200) {
    const rendering = await readImageRendering(page);
    const expected = displayScale * zoom >= 1 ? "pixelated" : "auto";
    assert.equal(
      rendering,
      expected,
      `${mapName}: at ${zoom}x (${(displayScale * zoom).toFixed(2)} screen px per source px) the map renders ${expected}`
    );
    seen.add(rendering);
    zoom = await clickZoomIn(page);
    steps += 1;
  }
  assert.equal(await readImageRendering(page), "pixelated", `${mapName}: the ceiling renders crisp`);
  assert.ok(seen.has("auto"), `${mapName}: the map stays smooth while it is downscaled`);
  assert.ok(seen.has("pixelated"), `${mapName}: the map turns crisp once it is upscaled`);
  await page.locator("#resetView").click();
}


/* --- the map <-> Minecraft conversion stays exact across the zoom range --- */
async function checkCoordinates(page, mapName) {
  await page.locator("#resetView").click();
  await page.waitForTimeout(60);

  for (const zoom of [1, 2, 5, 10, 20, 30, 45]) {
    await zoomInTo(page, zoom);
    for (const reference of REFERENCE_POINTS) {
      await assertRawPixelReadout(page, reference, `${mapName}: ${reference.label} at ~${zoom}x`);
    }
  }

  /* After a pan at high zoom the same pixel must still read the same coordinate. */
  await zoomInTo(page, ZOOM_MAX);
  const free = await findFreeMapPoint(page);
  assert.ok(free, `${mapName}: a free map point is available for panning`);
  await page.mouse.move(free.x, free.y);
  await page.mouse.down();
  await page.mouse.move(free.x - 140, free.y - 110, { steps: 10 });
  await page.mouse.up();
  await page.waitForTimeout(80);
  for (const reference of REFERENCE_POINTS) {
    await assertRawPixelReadout(page, reference, `${mapName}: ${reference.label} at 45x panned`);
  }

  /* And after pan + a further zoom change. */
  await clickZoomOut(page);
  await clickZoomOut(page);
  for (const reference of REFERENCE_POINTS) {
    await assertRawPixelReadout(page, reference, `${mapName}: ${reference.label} after pan + zoom out`);
  }
  await page.locator("#resetView").click();
}

async function run() {
  const server = await ensureStaticServer(rootUrl);
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 960 } });
  await context.addInitScript(() => {
    localStorage.setItem("sao.walkthrough.maps.completed", "1");
    localStorage.setItem("sao.walkthrough.mainui.completed", "1");
  });

  try {
    /* --- Aincrad Floor 1: the full zoom + coordinate coverage --- */
    const aincrad = await context.newPage();
    const aincradDiagnostics = attachDiagnostics(aincrad);
    await aincrad.goto(`${server.url}${AINCRAD_URL}`, { waitUntil: "load", timeout: 60000 });
    await aincrad.waitForFunction(() => document.getElementById("mapImage")?.naturalWidth > 0, null, { timeout: 30000 });
    await aincrad.waitForFunction(() => window.__aincradMapRuntime?.isInitialized?.(), null, { timeout: 30000 });

    await checkZoomControls(aincrad, "Aincrad Floor 1");
    await checkImageRendering(aincrad, "Aincrad Floor 1");
    await checkFocalPoint(aincrad, "Aincrad Floor 1");
    await checkCoordinates(aincrad, "Aincrad Floor 1");

    assert.deepEqual(aincradDiagnostics.errors, [], "the zoom checks raise no console errors on Aincrad");
    assert.deepEqual(aincradDiagnostics.failedRequests, [], "the zoom checks load every resource on Aincrad");
    await aincrad.close();

    /* --- Fractured Underworld: the same shared zoom controls, its own floor architecture --- */
    const underworld = await context.newPage();
    const underworldDiagnostics = attachDiagnostics(underworld);
    await underworld.goto(`${server.url}${UNDERWORLD_URL}`, { waitUntil: "load", timeout: 60000 });
    await underworld.waitForFunction(() => typeof window.__initUnderworldMapRuntime === "function", null, {
      timeout: 30000
    });
    await underworld.waitForTimeout(400);

    await checkZoomControls(underworld, "Fractured Underworld");
    assert.deepEqual(underworldDiagnostics.errors, [], "the zoom checks raise no console errors on the Underworld");
    assert.deepEqual(underworldDiagnostics.failedRequests, [], "the zoom checks load every resource on the Underworld");
    await underworld.close();

    console.log("Map zoom browser regression checks passed.");
  } finally {
    await browser.close();
    await server.stop();
  }
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

