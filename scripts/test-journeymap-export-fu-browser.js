"use strict";

/* Fractured Underworld JourneyMap export.

   Every other JourneyMap browser check exports from the Aincrad page, so the Underworld half of
   the export flow (its page adapter: world id, dimension and the custom-category colour resolver
   feeding the shared category collector) had no automated coverage. This boots the real Underworld
   page, exports through the map context menu and asserts the resulting WaypointData.dat keeps the
   enabled built-in category, the enabled custom category and their colours. The page is put in
   Current mode first, because the Underworld markers are its Main Questline and Main Quest data is
   Current Data only. */

const assert = require("node:assert/strict");
const { chromium } = require("playwright");
const { attachDiagnostics, ensureStaticServer } = require("./harness-helpers");
const { parseJourneyMapDat } = require("../shared/sao-journeymap-export.js");

const rootUrl = process.env.SAO_BASE_URL || "http://127.0.0.1:8080";
const UNDERWORLD_URL = "/Fractured%20Underworld/Main%20UI/mainui.html";

async function openMapContextMenu(page) {
  const point = await page.evaluate(() => {
    const rect = document.getElementById("mapLayer").getBoundingClientRect();
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
  });
  await page.mouse.click(point.x, point.y, { button: "right" });
  await page.waitForFunction(() => document.getElementById("mapContextMenu").hidden === false);
}

async function captureExport(page) {
  await page.evaluate(() => {
    window.__fuExportBlob = null;
    URL.createObjectURL = (blob) => {
      window.__fuExportBlob = blob;
      return "blob:fu-export";
    };
    URL.revokeObjectURL = () => {};
    HTMLAnchorElement.prototype.click = function captureDownload() {
      window.__fuExportFilename = this.download;
    };
  });
  await openMapContextMenu(page);
  await page.locator("#mapContextMenu [data-map-action='journey-export']").click();
  await page.waitForFunction(() => window.__fuExportBlob instanceof Blob, null, { timeout: 10000 });
  const captured = await page.evaluate(async () => ({
    filename: window.__fuExportFilename,
    bytes: Array.from(new Uint8Array(await window.__fuExportBlob.arrayBuffer()))
  }));
  return { filename: captured.filename, payload: parseJourneyMapDat(Buffer.from(captured.bytes)) };
}

async function run() {
  const server = await ensureStaticServer(rootUrl);
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 960 } });
  await context.addInitScript(() => {
    localStorage.setItem("sao.walkthrough.mainui.completed", "1");
    /* The Underworld map markers are its Main Questline, and that is Current Data only, so the
       export has to run in Current mode to have built-in waypoints to export. */
    localStorage.setItem("sao.dataset.underworld", "current");
    localStorage.setItem(
      "sao.customWaypoints.underworld",
      JSON.stringify([
        {
          id: "fu-export-custom",
          name: "Underworld Test Marker",
          description: "",
          x: 10,
          z: 20,
          floor: "playerIsland",
          world: "underworld",
          button: "Underworld Test Category",
          logo: "pin"
        }
      ])
    );
    localStorage.setItem(
      "sao.customWaypoints.enabled.underworld",
      JSON.stringify({ "playerIsland:underworld test category": true })
    );
    localStorage.setItem(
      "sao.customWaypoints.colors.underworld",
      JSON.stringify({
        "playerIsland:underworld test category": "#123456",
        "underworld test category": "#123456"
      })
    );
  });

  try {
    const page = await context.newPage();
    const diagnostics = attachDiagnostics(page);
    await page.goto(`${server.url}${UNDERWORLD_URL}`, { waitUntil: "load", timeout: 60000 });
    await page.waitForFunction(() => window.__underworldMapRuntime?.isInitialized?.(), null, { timeout: 30000 });
    await page.waitForFunction(() => document.getElementById("mapContainer")?.clientWidth > 0);

    assert.equal(
      await page.evaluate(() => window.__underworldMapRuntime.getActiveMapContext()),
      "playerIsland",
      "the Underworld page starts on its default island"
    );

    await page.evaluate(() => {
      const runtime = window.__underworldMapRuntime;
      Object.keys(window.UnderworldMapAdapter.categories).forEach((category) =>
        runtime.setCategoryState(category, true)
      );
      runtime.setCategoryState("custom", true);
    });

    const exported = await captureExport(page);
    assert.equal(exported.filename, "WaypointData.dat", "the Underworld export keeps the JourneyMap filename");
    assert.deepEqual(
      Object.keys(exported.payload).sort(),
      ["groups", "waypoints"],
      "the Underworld export uses the real JourneyMap NBT roots"
    );

    const groups = Object.values(exported.payload.groups);
    const waypoints = Object.values(exported.payload.waypoints);

    const builtInGroup = groups.find((group) => group.name === "mainQuests");
    assert.ok(builtInGroup, "the enabled built-in category becomes a JourneyMap group");
    assert.equal(builtInGroup.color >>> 0, 0x00a86b, "the built-in category keeps its hardcoded colour");
    const builtInWaypoint = waypoints.find((waypoint) => waypoint.name === "The New World");
    assert.ok(builtInWaypoint, "a built-in Underworld waypoint is exported by name");
    assert.equal(builtInWaypoint.groupId, builtInGroup.guid);
    assert.equal(builtInWaypoint.pos.x, 0);
    assert.equal(builtInWaypoint.pos.z, 7);
    assert.equal(
      builtInWaypoint.color >>> 0,
      0xff00a86b,
      "the built-in waypoint colour is the opaque category colour"
    );

    const customGroup = groups.find((group) => group.name === "Underworld Test Category");
    assert.ok(customGroup, "the enabled custom category becomes a JourneyMap group");
    assert.equal(customGroup.color >>> 0, 0x00123456, "the custom category colour is preserved");
    const customWaypoint = waypoints.find((waypoint) => waypoint.groupId === customGroup.guid);
    assert.ok(customWaypoint, "the custom waypoint is exported");
    assert.equal(customWaypoint.name, "Underworld Test Marker");
    assert.equal(customWaypoint.pos.x, 10);
    assert.equal(customWaypoint.pos.z, 20);
    assert.equal(customWaypoint.color >>> 0, 0xff123456, "the custom waypoint colour is preserved");

    assert.deepEqual(diagnostics.errors, [], "the Underworld export raises no console or page errors");
    console.log("Fractured Underworld export browser regression checks passed.");
  } finally {
    await browser.close();
    await server.stop();
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});

