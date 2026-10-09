"use strict";

/* End-to-end coordinate-lifecycle regression for the map <-> Minecraft boundary:
   map location -> calculated Minecraft coordinate -> create waypoint -> persist -> reload ->
   export to JourneyMap -> import back -> same physical map location -> same Minecraft coordinate.
   The two reported examples are pinned exactly, and both an existing Current waypoint and a newly
   created custom waypoint are checked, so this proves a real data/coordinate correction rather than
   a display change. */

const assert = require("node:assert/strict");
const { chromium } = require("playwright");
const { attachDiagnostics, ensureStaticServer } = require("./harness-helpers");
const { parseJourneyMapDat } = require("../shared/sao-journeymap-export.js");

const rootUrl = process.env.SAO_BASE_URL || "http://127.0.0.1:8080";
const AINCRAD_URL = "/Aincrad/Map/maps.html?floor=floor1";
const AINCRAD_KEY = "sao.customWaypoints.aincrad";
const WAYPOINT_NAME = "Coordinate lifecycle marker";
const ZOOM_WAYPOINT_NAME = "Zoomed cursor marker";
/* The second reported example: the map location the grid used to label 1797,3974 is Minecraft
   1799,3986, and that location carries no marker, so it is safe to click. */
const EXAMPLE_MINECRAFT = { x: 1799, z: 3986 };
const CURRENT_MARKER = { title: "Starting Merchant", minecraft: { x: 1787, z: 4179 } };

async function readRecords(page) {
  return page.evaluate((key) => JSON.parse(localStorage.getItem(key) || "[]"), AINCRAD_KEY);
}

/* Mirrors shared/sao-map-helpers.js getImageLocalCoords in the other direction: Minecraft
   coordinate -> the client point that projects onto it. */
async function clientPointForCoordinate(page, coordinate) {
  return page.evaluate((target) => {
    const image = document.getElementById("mapImage");
    const rect = image.getBoundingClientRect();
    const naturalWidth = image.naturalWidth;
    const naturalHeight = image.naturalHeight;
    const scale = Math.min(rect.width / naturalWidth, rect.height / naturalHeight);
    const offsetX = (rect.width - naturalWidth * scale) / 2;
    const offsetY = (rect.height - naturalHeight * scale) / 2;
    const raw = window.invertMapCoordinates(target.x, target.z, document.getElementById("floorSelect").value, {
      width: naturalWidth,
      height: naturalHeight
    });
    return { x: rect.left + offsetX + raw.rawX * scale, y: rect.top + offsetY + raw.rawY * scale };
  }, coordinate);
}

/* Mirrors shared/sao-map-helpers.js getImageLocalCoords in the other direction: raw map pixel
   -> the client point that projects onto it. */
async function clientPointForRawPixel(page, rawPixel) {
  return page.evaluate((target) => {
    const image = document.getElementById("mapImage");
    const rect = image.getBoundingClientRect();
    const naturalWidth = image.naturalWidth;
    const naturalHeight = image.naturalHeight;
    const scale = Math.min(rect.width / naturalWidth, rect.height / naturalHeight);
    const offsetX = (rect.width - naturalWidth * scale) / 2;
    const offsetY = (rect.height - naturalHeight * scale) / 2;
    return { x: rect.left + offsetX + target.x * scale, y: rect.top + offsetY + target.y * scale };
  }, rawPixel);
}

async function coordinateForClientPoint(page, point) {
  return page.evaluate(({ x, y }) => {
    const image = document.getElementById("mapImage");
    const local = window.SAOMapHelpers.getImageLocalCoords(image, { clientX: x, clientY: y });
    const rawX = local.localX * (local.naturalWidth / local.contentWidth);
    const rawY = local.localY * (local.naturalHeight / local.contentHeight);
    const mapped = window.mapWebsiteCoordinates(rawX, rawY, document.getElementById("floorSelect").value, {
      width: local.naturalWidth,
      height: local.naturalHeight
    });
    return { x: Math.round(mapped.x), z: Math.round(mapped.z) };
  }, point);
}

/* Confirms a marker is drawn exactly where its Minecraft coordinate projects, which is the "same
   physical map location" half of the invariant. Built-in markers are resolved through the adapter
   dataset; custom markers are addressed by selector with the coordinate from storage. */
async function markerProjection(page, { coordinate, title = null, selector = null }) {
  return page.evaluate(
    ({ target, markerTitle, elementSelector }) => {
      const adapter = window.AincradMapAdapter;
      let marker = null;
      let element = null;
      if (elementSelector) {
        element = document.querySelector(elementSelector);
        marker = { coords: target };
      } else {
        element = [...document.querySelectorAll("#markers .marker[data-marker-id]")].find((node) => {
          const candidate = adapter.markerDataset[node.dataset.markerId];
          return candidate && candidate.title === markerTitle;
        });
        marker = element ? adapter.markerDataset[element.dataset.markerId] : null;
      }
      if (!element || !marker || !marker.coords) return null;
      const image = document.getElementById("mapImage");
      const markerLayer = document.getElementById("markers");
      const scale = Math.min(
        markerLayer.clientWidth / image.naturalWidth,
        markerLayer.clientHeight / image.naturalHeight
      );
      const offsetX = (markerLayer.clientWidth - image.naturalWidth * scale) / 2;
      const offsetY = (markerLayer.clientHeight - image.naturalHeight * scale) / 2;
      const inverse = window.invertMapCoordinates(
        marker.coords.x,
        marker.coords.z,
        document.getElementById("floorSelect").value,
        { width: image.naturalWidth, height: image.naturalHeight }
      );
      return {
        coords: { x: marker.coords.x, z: marker.coords.z },
        deltaLeft: Math.abs(offsetX + inverse.rawX * scale - parseFloat(element.style.left)),
        deltaTop: Math.abs(offsetY + inverse.rawY * scale - parseFloat(element.style.top))
      };
    },
    { target: coordinate, markerTitle: title, elementSelector: selector }
  );
}

/* Reads the live pan/zoom transform of the movable map layer. */
async function readMapTransform(page) {
  return page.evaluate(() => {
    const match = /translate\(([-\d.]+)px,\s*([-\d.]+)px\)\s*scale\(([-\d.]+)\)/.exec(
      document.getElementById("mapLayer").style.transform || ""
    );
    return match ? { x: Number(match[1]), y: Number(match[2]), zoom: Number(match[3]) } : null;
  });
}

async function zoomMapTo(page, target) {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    const transform = await readMapTransform(page);
    if (transform && transform.zoom >= target) return transform;
    await page.locator("#zoomIn").click();
  }
  throw new Error(`Could not reach zoom ${target}`);
}

/* A container point that no marker/chrome element covers, so it can be used to drag the map. */
async function findFreeMapPoint(page) {
  return page.evaluate(() => {
    const container = document.getElementById("mapContainer");
    const rect = container.getBoundingClientRect();
    const fractions = [0.15, 0.3, 0.5, 0.7, 0.85];
    for (const fx of fractions) {
      for (const fy of fractions) {
        const point = { x: rect.left + rect.width * fx, y: rect.top + rect.height * fy };
        const target = document.elementFromPoint(point.x, point.y);
        if (
          target &&
          container.contains(target) &&
          !target.closest(".marker, button, input, select, textarea, label, dialog, #infoOverlay, #zoomControls")
        ) {
          return point;
        }
      }
    }
    return null;
  });
}

/* Drags the map so the given Minecraft coordinate lands near the viewport centre, then returns
   the (recomputed) client point of that coordinate. Panning moves a fixed world point by exactly
   the drag delta, so a couple of passes always converge. */
async function bringCoordinateIntoView(page, minecraft) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const point = await clientPointForCoordinate(page, minecraft);
    const box = await page.locator("#mapContainer").boundingBox();
    const margin = 48;
    const inside =
      point.x > box.x + margin &&
      point.x < box.x + box.width - margin &&
      point.y > box.y + margin &&
      point.y < box.y + box.height - margin;
    if (inside) return point;
    const free = await findFreeMapPoint(page);
    if (!free) break;
    const dx = Math.max(-640, Math.min(640, box.x + box.width / 2 - point.x));
    const dy = Math.max(-640, Math.min(640, box.y + box.height / 2 - point.y));
    await page.mouse.move(free.x, free.y);
    await page.mouse.down();
    await page.mouse.move(free.x + dx, free.y + dy, { steps: 8 });
    await page.mouse.up();
    await page.waitForTimeout(80);
  }
  return clientPointForCoordinate(page, minecraft);
}

/* Moves the real pointer onto the client point that the authoritative conversion assigns to the
   given Minecraft coordinate, then requires the on-screen readout to show that exact point. The
   readout is driven by the same real pointer the cursor hotspot sits on, so this pins the
   "cursor tip == readout" invariant at whatever zoom/pan state is active. */
async function assertTipReadout(page, minecraft, label) {
  const point = await bringCoordinateIntoView(page, minecraft);
  const box = await page.locator("#mapContainer").boundingBox();
  assert.ok(
    point.x > box.x && point.x < box.x + box.width && point.y > box.y && point.y < box.y + box.height,
    `${label}: the map location is inside the viewport`
  );
  const rounded = { x: Math.round(point.x), y: Math.round(point.y) };
  const expected = await coordinateForClientPoint(page, rounded);
  await page.mouse.move(rounded.x, rounded.y);
  await page.waitForFunction(
    (value) => document.getElementById("overlayMappedCoords").textContent.trim() === value,
    `X: ${expected.x} Z: ${expected.z}`
  );
  assert.ok(
    Math.abs(expected.x - minecraft.x) <= 4 && Math.abs(expected.z - minecraft.z) <= 4,
    `${label}: the point under the cursor tip is ${minecraft.x},${minecraft.z} (got ${expected.x},${expected.z})`
  );
  return { point: rounded, expected };
}


async function openJourneyMapContextMenu(page) {
  const point = await page.evaluate(() => {
    const layer = document.getElementById("mapLayer");
    const rect = layer.getBoundingClientRect();
    const fractions = [0.3, 0.42, 0.56, 0.7, 0.84];
    for (const fraction of fractions) {
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
    if (window.__coordinateLifecycleCapture) return;
    window.__coordinateLifecycleCapture = true;
    URL.createObjectURL = (blob) => {
      window.__coordinateLifecycleBlob = blob;
      return "blob:coordinate-lifecycle";
    };
    URL.revokeObjectURL = () => {};
    HTMLAnchorElement.prototype.click = function () {
      window.__coordinateLifecycleFilename = this.download;
    };
  });
  await openJourneyMapContextMenu(page);
  await page.locator("#mapContextMenu [data-map-action='journey-export']").click();
  await page.waitForFunction(() => window.__coordinateLifecycleBlob instanceof Blob);
  const captured = await page.evaluate(async () => ({
    filename: window.__coordinateLifecycleFilename,
    bytes: Array.from(new Uint8Array(await window.__coordinateLifecycleBlob.arrayBuffer()))
  }));
  return { filename: captured.filename, bytes: Buffer.from(captured.bytes) };
}

async function importJourneyMap(page, bytes) {
  await openJourneyMapContextMenu(page);
  await page.evaluate(() => {
    document.getElementById("journeyMapImportFile").click = () => {};
  });
  await page.locator("#mapContextMenu [data-map-action='journey-import']").click();
  await page.locator("#journeyMapImportFile").setInputFiles({
    name: "WaypointData.dat",
    mimeType: "application/octet-stream",
    buffer: bytes
  });
}


async function run() {
  const server = await ensureStaticServer(rootUrl);
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 960 },
    permissions: ["clipboard-read", "clipboard-write"]
  });
  await context.addInitScript(() => {
    localStorage.setItem("sao.walkthrough.maps.completed", "1");
  });

  try {
    const page = await context.newPage();
    const diagnostics = attachDiagnostics(page);
    await page.goto(`${server.url}${AINCRAD_URL}`, { waitUntil: "load", timeout: 60000 });
    await page.waitForFunction(() => document.getElementById("mapImage")?.naturalWidth > 0, null, {
      timeout: 30000
    });

    /* The two reported examples, straight through the authoritative calibration the page exposes. */
    const examples = await page.evaluate(() => ({
      floor1Center: { ...getMapCalibration("floor1").centerGame },
      floor1LegacyCenter: { ...getMapCalibration("floor1").legacyGrid.centerGame },
      floor1Migration: { ...getStoredCoordinateMigration("floor1") },
      aincradMigrations: getStoredCoordinateMigrations("aincrad"),
      underworldMigrations: getStoredCoordinateMigrations("underworld"),
      floor2System: getMapCalibration("floor2").coordinateSystem,
      globalAlignmentType: typeof MAP_COORDINATE_ALIGNMENT
    }));
    assert.deepEqual(examples.floor1Center, { x: 2544.6, z: 2563 }, "floor 1 calibration centre is Minecraft");
    assert.deepEqual(examples.floor1LegacyCenter, { x: 2542.6, z: 2551 }, "floor 1 keeps its legacy grid");
    assert.deepEqual(examples.floor1Migration, { x: 2, z: 12 }, "the legacy grid migrated +2 X / +12 Z");
    assert.deepEqual(examples.aincradMigrations, { floor1: { x: 2, z: 12 } }, "only floor 1 migrates stored waypoints");
    assert.equal(examples.underworldMigrations, null, "the Underworld map never migrates");
    assert.equal(examples.floor2System, "map-local", "floor 2 stays on its own map-local grid");
    assert.equal(examples.globalAlignmentType, "undefined", "no global coordinate correction constants remain");

    /* map location -> calculated Minecraft coordinate -> create waypoint. The browser dispatches
       integer client coordinates, so the click point is rounded first and the expected coordinate is
       derived from that exact point with the page's own conversion. */
    const point = await clientPointForCoordinate(page, EXAMPLE_MINECRAFT);
    const rounded = { x: Math.round(point.x), y: Math.round(point.y) };
    const expectedCoordinate = await coordinateForClientPoint(page, rounded);
    assert.ok(
      Math.abs(expectedCoordinate.x - EXAMPLE_MINECRAFT.x) <= 4 &&
        Math.abs(expectedCoordinate.z - EXAMPLE_MINECRAFT.z) <= 4,
      `the example map location still projects to ${EXAMPLE_MINECRAFT.x},${EXAMPLE_MINECRAFT.z} ` +
        `(got ${expectedCoordinate.x},${expectedCoordinate.z})`
    );

    await page.mouse.click(rounded.x, rounded.y, { clickCount: 4, delay: 25 });
    await page.waitForFunction(() => document.getElementById("customWaypointDialog").open);
    const autoCoordinates = await page.evaluate(() => ({
      x: Number(document.getElementById("customWaypointX").value),
      z: Number(document.getElementById("customWaypointZ").value)
    }));
    assert.deepEqual(
      autoCoordinates,
      expectedCoordinate,
      "creating a waypoint stores the Minecraft coordinate the map location represents"
    );
    await page.locator("#customWaypointName").fill(WAYPOINT_NAME);
    await page.locator("#customWaypointForm button[type='submit']").click();
    await page.waitForFunction(
      (name) => JSON.parse(localStorage.getItem("sao.customWaypoints.aincrad") || "[]").some((r) => r.name === name),
      WAYPOINT_NAME
    );

    /* persist -> reload. */
    let records = await readRecords(page);
    const created = records.find((record) => record.name === WAYPOINT_NAME);
    assert.ok(created, "the new waypoint is persisted");
    assert.deepEqual(
      { x: created.x, z: created.z },
      expectedCoordinate,
      "the persisted custom waypoint holds the Minecraft coordinate"
    );

    await page.reload({ waitUntil: "load", timeout: 60000 });
    await page.waitForFunction(() => document.getElementById("mapImage")?.naturalWidth > 0, null, {
      timeout: 30000
    });
    records = await readRecords(page);
    const reloaded = records.find((record) => record.name === WAYPOINT_NAME);
    assert.deepEqual(
      { x: reloaded.x, z: reloaded.z },
      expectedCoordinate,
      "reloading never re-applies the coordinate shift"
    );

    /* The reloaded waypoint is drawn at the same physical map location. */
    await page.evaluate(() => {
      const button = document.querySelector("#customWaypointSidebarList [data-custom-button='Default']");
      if (button && button.getAttribute("aria-pressed") !== "true") button.click();
    });
    await page.waitForSelector("#markers .marker.custom-marker", { timeout: 10000 });
    const projection = await markerProjection(page, {
      coordinate: expectedCoordinate,
      selector: "#markers .marker.custom-marker"
    });
    assert.ok(projection, "the custom waypoint marker is rendered");
    assert.deepEqual(projection.coords, expectedCoordinate, "the rendered marker keeps the Minecraft coordinate");
    assert.ok(
      projection.deltaLeft < 1.5 && projection.deltaTop < 1.5,
      `the marker stays on its physical map location (${projection.deltaLeft}px / ${projection.deltaTop}px)`
    );


    /* export to JourneyMap. */
    const exported = await exportJourneyMap(page);
    assert.equal(exported.filename, "WaypointData.dat", "the export keeps the JourneyMap filename");
    const payload = parseJourneyMapDat(exported.bytes);
    const exportedWaypoint = Object.values(payload.waypoints).find((waypoint) => waypoint.name === WAYPOINT_NAME);
    assert.ok(exportedWaypoint, "the custom waypoint is exported");
    assert.deepEqual(
      { x: exportedWaypoint.pos.x, z: exportedWaypoint.pos.z },
      expectedCoordinate,
      "JourneyMap receives the corrected Minecraft coordinate"
    );

    /* import from JourneyMap: same coordinate, no drift, no duplicate. */
    const countBeforeImport = records.length;
    await importJourneyMap(page, exported.bytes);
    await page.waitForFunction(
      (count) => JSON.parse(localStorage.getItem("sao.customWaypoints.aincrad") || "[]").length === count,
      countBeforeImport
    );
    records = await readRecords(page);
    const afterImport = records.find((record) => record.name === WAYPOINT_NAME);
    assert.deepEqual(
      { x: afterImport.x, z: afterImport.z },
      expectedCoordinate,
      "importing the exported file leaves the Minecraft coordinate unchanged"
    );
    assert.equal(records.length, countBeforeImport, "re-importing the same file adds no duplicate");

    /* --- The site-wide cursor. The arrow tip is the hotspot and the coordinate pipeline keeps
       reading the browser's real pointer, so the tip, the readout, the click, the created
       waypoint and the JourneyMap coordinate must agree at every zoom/pan state. --- */
    const cursorStyles = await page.evaluate(() => {
      const marker = document.querySelector("#markers .marker[data-marker-id]");
      return {
        html: getComputedStyle(document.documentElement).cursor,
        mapLayer: getComputedStyle(document.getElementById("mapLayer")).cursor,
        infoOverlay: getComputedStyle(document.getElementById("infoOverlay")).cursor,
        zoomIn: getComputedStyle(document.getElementById("zoomIn")).cursor,
        search: getComputedStyle(document.getElementById("search")).cursor,
        marker: marker ? getComputedStyle(marker).cursor : null
      };
    });
    assert.match(cursorStyles.html, / 1 1,\s*auto$/, "the normal site-wide cursor is the arrow with its tip as hotspot");
    assert.match(cursorStyles.mapLayer, / 1 1,\s*auto$/, "the draggable map artwork keeps the arrow cursor");
    assert.match(cursorStyles.infoOverlay, / 1 1,\s*auto$/, "the map info panel keeps the normal cursor");
    assert.match(cursorStyles.zoomIn, / 6 0,\s*pointer$/, "the zoom controls use the click cursor");
    assert.equal(cursorStyles.search, "text", "the marker search input keeps the text cursor");
    assert.ok(cursorStyles.marker === null || / 6 0,\s*pointer$/.test(cursorStyles.marker), "markers use the click cursor");

    /* Dragging still shows grabbing, on the artwork the pointer is over. */
    const dragPoint = await findFreeMapPoint(page);
    assert.ok(dragPoint, "a free map point is available for the drag check");
    await page.mouse.move(dragPoint.x, dragPoint.y);
    await page.mouse.down();
    const grabbingCursor = await page.evaluate(
      () => getComputedStyle(document.getElementById("mapLayer")).cursor
    );
    await page.mouse.up();
    assert.match(grabbingCursor, / 11 11,\s*grabbing$/, "dragging shows the grabbing cursor");

    const knownTips = [
      { label: "reference point 1", minecraft: { x: 1800, z: 4190 } },
      { label: "reference point 2", minecraft: { x: 1799, z: 3986 } }
    ];

    await page.locator("#resetView").click();
    for (const known of knownTips) {
      await assertTipReadout(page, known.minecraft, `${known.label} at 1x`);
    }

    /* The two reported reference points, checked as pointer positions: the map pixel the
       legacy grid called 1798,4178 must read Minecraft 1800,4190, and 1797,3974 must read
       1799,3986. These pin pointer placement and the coordinate conversion together; they are
       not cursor offsets. */
    const reportedExamples = [
      {
        legacy: { x: 1798, z: 4178 },
        minecraft: { x: 1800, z: 4190 },
        rawPixel: { x: 1754.83367359193, y: 4128.237460469957 }
      },
      {
        legacy: { x: 1797, z: 3974 },
        minecraft: { x: 1799, z: 3986 },
        rawPixel: { x: 1753.8329130138907, y: 3924.0823025499376 }
      }
    ];
    /* Zoomed in first, so one client pixel is about one block and the readout can be pinned
       exactly instead of within the fit-view quantisation. */
    await zoomMapTo(page, 4);
    for (const example of reportedExamples) {
      await bringCoordinateIntoView(page, example.minecraft);
      const point = await clientPointForRawPixel(page, example.rawPixel);
      const rounded = { x: Math.round(point.x), y: Math.round(point.y) };
      await page.mouse.move(rounded.x, rounded.y);
      const readout = await page.evaluate(() => document.getElementById("overlayMappedCoords").textContent.trim());
      const expectedReadout = `X: ${example.minecraft.x} Z: ${example.minecraft.z}`;
      assert.equal(
        readout,
        expectedReadout,
        `the pixel the legacy grid called ${example.legacy.x},${example.legacy.z} now reads ${expectedReadout}`
      );
    }
    await page.locator("#resetView").click();
    await page.waitForTimeout(80);

    await zoomMapTo(page, 3);
    for (const known of knownTips) {
      await assertTipReadout(page, known.minecraft, `${known.label} at 3x`);
    }

    const panPoint = await findFreeMapPoint(page);
    assert.ok(panPoint, "a free map point is available for panning");
    await page.mouse.move(panPoint.x, panPoint.y);
    await page.mouse.down();
    await page.mouse.move(panPoint.x - 130, panPoint.y - 95, { steps: 8 });
    await page.mouse.up();
    await page.waitForTimeout(80);
    for (const known of knownTips) {
      await assertTipReadout(page, known.minecraft, `${known.label} at 3x panned`);
    }

    await zoomMapTo(page, 6);
    for (const known of knownTips) {
      await assertTipReadout(page, known.minecraft, `${known.label} at 6x panned`);
    }

    /* A click under the cursor tip at zoom + pan must create the same coordinate. Every marker
       category - including the custom category that holds the waypoint created above - is turned
       off first so nothing can intercept the click. */
    await page.evaluate(() => {
      document.querySelectorAll(".sidebar-list-button[data-category]").forEach((button) => {
        if (button.classList.contains("active")) button.click();
      });
      const customButton = document.querySelector("#customWaypointSidebarList [data-custom-button='Default']");
      if (customButton && customButton.getAttribute("aria-pressed") === "true") customButton.click();
    });
    await page.waitForFunction(() => document.querySelectorAll("#markers .marker").length === 0, null, {
      timeout: 8000
    });

    const clickTip = await assertTipReadout(page, knownTips[1].minecraft, "click point at 6x panned");
    const tipIsClear = await page.evaluate(({ x, y }) => {
      const target = document.elementFromPoint(x, y);
      const container = document.getElementById("mapContainer");
      return Boolean(target && container.contains(target) && !target.closest(".marker"));
    }, clickTip.point);
    assert.ok(tipIsClear, "the click point under the cursor tip is clear of markers");

    await page.mouse.click(clickTip.point.x, clickTip.point.y, { clickCount: 4, delay: 25 });
    await page.waitForFunction(() => document.getElementById("customWaypointDialog").open);
    const zoomDialogCoords = await page.evaluate(() => ({
      x: Number(document.getElementById("customWaypointX").value),
      z: Number(document.getElementById("customWaypointZ").value)
    }));
    assert.deepEqual(
      zoomDialogCoords,
      clickTip.expected,
      "the click under the cursor tip prefills the same coordinate the readout showed"
    );
    await page.locator("#customWaypointName").fill(ZOOM_WAYPOINT_NAME);
    await page.locator("#customWaypointForm button[type='submit']").click();
    await page.waitForFunction(
      (name) => JSON.parse(localStorage.getItem("sao.customWaypoints.aincrad") || "[]").some((record) => record.name === name),
      ZOOM_WAYPOINT_NAME
    );
    const zoomRecord = (await readRecords(page)).find((record) => record.name === ZOOM_WAYPOINT_NAME);
    assert.deepEqual(
      { x: zoomRecord.x, z: zoomRecord.z },
      clickTip.expected,
      "the zoom + pan waypoint stores the authoritative coordinate"
    );

    /* The export reads stored markers, so reset the view first: the context-menu helper picks a
       point from the (untransformed) map layer rect and is only reliable at the default view. */
    await page.locator("#resetView").click();
    await page.waitForTimeout(120);

    const zoomExport = await exportJourneyMap(page);
    const zoomPayload = parseJourneyMapDat(zoomExport.bytes);
    const zoomExported = Object.values(zoomPayload.waypoints).find(
      (waypoint) => waypoint.name === ZOOM_WAYPOINT_NAME
    );
    assert.ok(zoomExported, "the zoom + pan waypoint reaches JourneyMap");
    assert.deepEqual(
      { x: zoomExported.pos.x, z: zoomExported.pos.z },
      clickTip.expected,
      "JourneyMap receives the same coordinate as the cursor tip"
    );

    /* An existing Current dataset waypoint keeps its Minecraft coordinate and its map location. */
    await page.evaluate(() => localStorage.setItem("sao.dataset.aincrad", "current"));
    await page.reload({ waitUntil: "load", timeout: 60000 });
    await page.waitForFunction(() => document.getElementById("mapImage")?.naturalWidth > 0, null, {
      timeout: 30000
    });
    await page.waitForFunction(() => window.__aincradMapRuntime?.isInitialized?.(), null, { timeout: 30000 });
    await page.evaluate(() => {
      document.querySelectorAll(".sidebar-list-button[data-category]").forEach((button) => {
        if (!button.classList.contains("active")) button.click();
      });
    });
    await page.waitForFunction(
      (title) =>
        Object.values(window.AincradMapAdapter.markerDataset).some((marker) => marker && marker.title === title),
      CURRENT_MARKER.title,
      { timeout: 15000 }
    );
    /* The map only renders the markers inside the viewport, so the dataset is the source of truth for
       the coordinate itself while a rendered Current marker proves the projection. */
    const currentDatasetMarker = await page.evaluate((title) => {
      const marker = Object.values(window.AincradMapAdapter.markerDataset).find((entry) => entry && entry.title === title);
      return marker ? { x: marker.coords.x, z: marker.coords.z } : null;
    }, CURRENT_MARKER.title);
    assert.deepEqual(
      currentDatasetMarker,
      CURRENT_MARKER.minecraft,
      "the existing Current waypoint already holds Minecraft coordinates"
    );
    const renderedCurrentMarker = await page.evaluate(() => {
      const adapter = window.AincradMapAdapter;
      const image = document.getElementById("mapImage");
      const markerLayer = document.getElementById("markers");
      const scale = Math.min(
        markerLayer.clientWidth / image.naturalWidth,
        markerLayer.clientHeight / image.naturalHeight
      );
      const offsetX = (markerLayer.clientWidth - image.naturalWidth * scale) / 2;
      const offsetY = (markerLayer.clientHeight - image.naturalHeight * scale) / 2;
      for (const element of document.querySelectorAll("#markers .marker[data-marker-id]")) {
        const marker = adapter.markerDataset[element.dataset.markerId];
        if (!marker || !marker.coords || marker.dataset !== "current") continue;
        const inverse = window.invertMapCoordinates(
          marker.coords.x,
          marker.coords.z,
          document.getElementById("floorSelect").value,
          { width: image.naturalWidth, height: image.naturalHeight }
        );
        return {
          coords: { x: marker.coords.x, z: marker.coords.z },
          deltaLeft: Math.abs(offsetX + inverse.rawX * scale - parseFloat(element.style.left)),
          deltaTop: Math.abs(offsetY + inverse.rawY * scale - parseFloat(element.style.top)),
          roundTrip: { ...window.mapWebsiteCoordinates(inverse.rawX, inverse.rawY, "floor1", { width: image.naturalWidth, height: image.naturalHeight }) }
        };
      }
      return null;
    });
    assert.ok(renderedCurrentMarker, "a Current dataset marker is rendered in Current mode");
    assert.ok(
      Math.abs(renderedCurrentMarker.roundTrip.x - renderedCurrentMarker.coords.x) < 1e-6 &&
        Math.abs(renderedCurrentMarker.roundTrip.z - renderedCurrentMarker.coords.z) < 1e-6,
      "the rendered Current marker projects back to its own Minecraft coordinate"
    );
    assert.ok(
      renderedCurrentMarker.deltaLeft < 1.5 && renderedCurrentMarker.deltaTop < 1.5,
      `the Current marker stays on its physical map location (${renderedCurrentMarker.deltaLeft}px / ${renderedCurrentMarker.deltaTop}px)`
    );

    assert.deepEqual(diagnostics.errors, [], "the coordinate lifecycle raises no console errors");
    assert.deepEqual(diagnostics.failedRequests, [], "the coordinate lifecycle loads every resource");
    console.log("Coordinate lifecycle browser regression checks passed.");
  } finally {
    await browser.close();
    await server.stop();
  }
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

