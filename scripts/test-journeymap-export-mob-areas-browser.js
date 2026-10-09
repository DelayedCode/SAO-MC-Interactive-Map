"use strict";

/* End-to-end check: the live map export button must write Mob Areas into the .dat file for the
   active data mode. Modelled on test-journeymap-export-colors-browser.js: the real context-menu
   action runs, the produced Blob is parsed back with the project's own NBT readers. */

const assert = require("node:assert/strict");
const { chromium } = require("playwright");
const { parseJourneyMapDat, getNbtTagType } = require("../shared/sao-journeymap-import.js");
const { ensureStaticServer } = require("./harness-helpers");

const rootUrl = process.env.SAO_BASE_URL || "http://127.0.0.1:8080";

async function findMapPoint(page) {
  return page.evaluate(() => {
    const image = document.getElementById("mapImage");
    const rect = image.getBoundingClientRect();
    for (const fraction of [0.3, 0.45, 0.6, 0.75]) {
      const x = rect.left + rect.width * fraction;
      const y = rect.top + rect.height * fraction;
      const target = document.elementFromPoint(x, y);
      if (
        target &&
        image.contains(target) &&
        !target.closest(".marker, button, input, select, textarea, label, dialog, #infoOverlay, #zoomControls")
      ) {
        return { x, y };
      }
    }
    throw new Error("Could not find an unobstructed map point.");
  });
}

async function exportThroughTheButton(page) {
  const point = await findMapPoint(page);
  await page.mouse.click(point.x, point.y, { button: "right" });
  await page.locator("#mapContextMenu [data-map-action='journey-export']").click();
  await page.waitForFunction(() => window.__journeyMapMobAreaBlob instanceof Blob);
  const captured = await page.evaluate(async () => ({
    filename: window.__journeyMapMobAreaFilename,
    bytes: Array.from(new Uint8Array(await window.__journeyMapMobAreaBlob.arrayBuffer()))
  }));
  assert.equal(captured.filename, "WaypointData.dat", "the live export keeps the required filename");
  return Uint8Array.from(captured.bytes);
}

async function readMobAreaSource(page) {
  return page.evaluate(() => {
    const adapter = window.AincradMapAdapter;
    return adapter.getContextData("floor1").mobAreaDataset.map((area) => {
      const center = window.SAOMapHelpers.getMobAreaCenter(area);
      return { id: area.id, name: area.title, x: center.x, z: center.z };
    });
  });
}

async function runCase(page, dataset, expected) {
  await page.goto(`${rootUrl}/Aincrad/Map/maps.html?dataset=${dataset}&floor=floor1`, {
    waitUntil: "load",
    timeout: 60000
  });
  await page.waitForFunction(() => document.getElementById("mapImage")?.naturalWidth > 0, null, { timeout: 30000 });
  await page.waitForFunction(() => window.__aincradMapRuntime && window.SAOMapHelpers);

  const source = await readMobAreaSource(page);
  assert.equal(source.length, expected.mobAreas, `${dataset}: the live map resolves ${expected.mobAreas} floor 1 mob areas`);
  assert.equal(
    source.some((area) => area.name === "Wild Boar Meadow"),
    expected.hasMeadow,
    `${dataset}: Wild Boar Meadow ${expected.hasMeadow ? "is" : "is not"} part of the dataset`
  );

  await page.evaluate(() => {
    ["mobAreas", "biomes"].forEach((category) => window.__aincradMapRuntime.setCategoryState(category, true));
    URL.createObjectURL = (blob) => {
      window.__journeyMapMobAreaBlob = blob;
      return "blob:journeymap-mob-area-regression";
    };
    URL.revokeObjectURL = () => {};
    HTMLAnchorElement.prototype.click = function captureDownload() {
      window.__journeyMapMobAreaFilename = this.download;
    };
  });

  const bytes = await exportThroughTheButton(page);
  /* The import module's parser keeps the NBT tag types, so one parse covers values and types. */
  const root = parseJourneyMapDat(bytes);
  const mobAreaGroup = Object.values(root.groups).find((group) => group.name === "mobAreas");
  assert.ok(mobAreaGroup, `${dataset}: the downloaded NBT carries a Mob Areas group`);
  assert.equal(mobAreaGroup.color, 0xff8c00, `${dataset}: the Mob Areas group keeps its category RGB`);
  assert.equal(getNbtTagType(root.groups[mobAreaGroup.guid], "color"), 3, `${dataset}: the group colour is TAG_INT`);

  const mobAreaWaypoints = Object.values(root.waypoints).filter((waypoint) => waypoint.groupId === mobAreaGroup.guid);
  assert.equal(mobAreaWaypoints.length, expected.mobAreas, `${dataset}: every mob area becomes one waypoint`);
  assert.equal(
    new Set(mobAreaWaypoints.map((waypoint) => waypoint.guid)).size,
    mobAreaWaypoints.length,
    `${dataset}: mob-area waypoints are unique`
  );
  assert.equal(
    new Set(mobAreaWaypoints.map((waypoint) => waypoint.name)).size,
    mobAreaWaypoints.length,
    `${dataset}: mob-area waypoint names are unique`
  );
  assert.ok(
    mobAreaWaypoints.every((waypoint) => waypoint.color === (0xffff8c00 | 0)),
    `${dataset}: mob-area waypoints keep the opaque category ARGB`
  );
  assert.ok(
    mobAreaWaypoints.every((waypoint) => waypoint.pos.dimension === "minecraft:overworld"),
    `${dataset}: mob-area waypoints use the Aincrad dimension`
  );
  assert.ok(
    mobAreaWaypoints.every((waypoint) => getNbtTagType(root.waypoints[waypoint.guid], "name") === 8),
    `${dataset}: mob-area waypoint names stay TAG_STRING`
  );
  assert.ok(
    mobAreaWaypoints.every(
      (waypoint) =>
        getNbtTagType(root.waypoints[waypoint.guid].pos, "x") === 3 &&
        getNbtTagType(root.waypoints[waypoint.guid].pos, "z") === 3
    ),
    `${dataset}: mob-area coordinates stay TAG_INT`
  );

  /* Every source area must appear with its own name and the exact centre the map pins it to. */
  source.forEach((area) => {
    const waypoint = mobAreaWaypoints.find((candidate) => candidate.name === area.name);
    assert.ok(waypoint, `${dataset}: ${area.name} is exported by name`);
    assert.equal(waypoint.pos.x, area.x, `${dataset}: ${area.name} exports the map's X centre`);
    assert.equal(waypoint.pos.z, area.z, `${dataset}: ${area.name} exports the map's Z centre`);
  });
  assert.equal(
    mobAreaWaypoints.some((waypoint) => waypoint.name === "Wild Boar Meadow"),
    expected.hasMeadow,
    `${dataset}: the file ${expected.hasMeadow ? "keeps" : "never contains"} Wild Boar Meadow`
  );

  /* Existing categories keep working beside the mob areas. */
  const biomesGroup = Object.values(root.groups).find((group) => group.name === "biomes");
  assert.ok(biomesGroup, `${dataset}: the biomes category is still exported`);
  const biomeWaypoints = Object.values(root.waypoints).filter((waypoint) => waypoint.groupId === biomesGroup.guid);
  assert.ok(biomeWaypoints.length > 0, `${dataset}: biomes still produce waypoints`);
  assert.equal(
    Object.values(root.waypoints).length,
    mobAreaWaypoints.length + biomeWaypoints.length,
    `${dataset}: the file holds exactly the mob-area and biome waypoints`
  );
  assert.notEqual(biomesGroup.guid, mobAreaGroup.guid, `${dataset}: biomes and mob areas stay separate groups`);

  console.log(
    `${dataset}: ${mobAreaWaypoints.length} mob-area waypoints (meadow ${expected.hasMeadow}), ` +
      `${biomeWaypoints.length} biome waypoints, ${bytes.length} bytes`
  );
}

async function run() {
  const server = await ensureStaticServer(rootUrl);
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 960 } });
  await context.addInitScript(() => {
    localStorage.setItem("sao.walkthrough.maps.completed", "1");
    localStorage.setItem("sao.walkthrough.index.completed", "1");
  });

  try {
    const page = await context.newPage();
    page.on("pageerror", (error) => console.error(`page error: ${error}`));
    await runCase(page, "current", { mobAreas: 15, hasMeadow: false });
    await runCase(page, "beta", { mobAreas: 16, hasMeadow: true });
  } finally {
    await context.close();
    await browser.close();
    await server.stop();
  }

  console.log("JourneyMap mob-area export browser regression checks passed.");
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

