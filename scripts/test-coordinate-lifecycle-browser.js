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

