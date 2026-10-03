"use strict";

const assert = require("node:assert/strict");
const { chromium } = require("playwright");
const { parseJourneyMapDat, getNbtTagType } = require("../shared/sao-journeymap-import.js");
const { ensureStaticServer } = require("./harness-helpers");

const rootUrl = process.env.SAO_BASE_URL || "http://127.0.0.1:8080";
const customColors = {
  "SAO Events": "#00FF00",
  "Test Category": "#0000FF",
  "Another Category": "#8A2BE2"
};

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

async function createCategoryWaypoint(page, button, color, recordIndex) {
  const point = await findMapPoint(page);
  await page.mouse.click(point.x, point.y, { button: "right" });
  await page.locator("#mapContextMenu [data-map-action='create-custom-marker']").click();
  await page.waitForFunction(() => document.getElementById("customWaypointDialog")?.open);
  await page.locator("#customWaypointButtonSelect").selectOption("__create__");
  await page.locator("#customWaypointButtonName").fill(button);
  await page.locator("#customWaypointCategoryHex").fill(color);
  await page.locator("#customWaypointName").fill(`${button} waypoint`);
  await page.locator("#customWaypointForm button[type='submit']").click();
  await page.waitForFunction(
    (count) => JSON.parse(localStorage.getItem("sao.customWaypoints.aincrad") || "[]").length === count,
    recordIndex + 1
  );
  const saved = await page.evaluate(() => ({
    records: JSON.parse(localStorage.getItem("sao.customWaypoints.aincrad") || "[]"),
    colors: JSON.parse(localStorage.getItem("sao.customWaypoints.colors.aincrad") || "{}")
  }));
  const record = saved.records.find((entry) => entry.button === button);
  assert.equal(record.buttonColor, color, `${button} waypoint stores the selected HEX color`);
  assert.equal(saved.colors[`floor1:${button.toLowerCase()}`], color, `${button} category color persists by floor`);
}

async function clickJourneyMapExport(page) {
  const point = await findMapPoint(page);
  await page.mouse.click(point.x, point.y, { button: "right" });
  await page.locator("#mapContextMenu [data-map-action='journey-export']").click();
}

function groupColorAsHex(value) {
  return `0x${(value >>> 0).toString(16).padStart(8, "0")}`;
}

function findGroup(root, name) {
  return Object.entries(root.groups).find(([, group]) => group.name.toLowerCase() === name.toLowerCase());
}

async function run() {
  const server = await ensureStaticServer(rootUrl);
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 960 } });
  await context.addInitScript(() => {
    localStorage.setItem("sao.walkthrough.maps.completed", "1");
    localStorage.setItem("sao.journeymap.categoryColors", JSON.stringify({ "aincrad:dungeons": "#FF0000" }));
  });

  try {
    const page = await context.newPage();
    await page.goto(`${server.url}/Aincrad/Map/maps.html?floor=floor1`, { waitUntil: "load", timeout: 60000 });
    await page.waitForFunction(() => document.getElementById("mapImage")?.naturalWidth > 0, null, { timeout: 30000 });
    await page.waitForFunction(() => window.__aincradMapRuntime);
    let recordIndex = 0;
    for (const [button, color] of Object.entries(customColors)) {
      await createCategoryWaypoint(page, button, color, recordIndex);
      recordIndex += 1;
    }
    await page.reload({ waitUntil: "load", timeout: 60000 });
    await page.waitForFunction(() => document.getElementById("mapImage")?.naturalWidth > 0, null, { timeout: 30000 });
    await page.waitForFunction(() => window.__aincradMapRuntime);
    await page.evaluate(() => {
      ["biomes", "dungeons", "custom"].forEach((category) => {
        window.__aincradMapRuntime.setCategoryState(category, true);
      });
      URL.createObjectURL = (blob) => {
        window.__journeyMapColorBlob = blob;
        return "blob:journeymap-color-regression";
      };
      URL.revokeObjectURL = () => {};
      HTMLAnchorElement.prototype.click = function captureDownload() {
        window.__journeyMapColorFilename = this.download;
      };
    });
    await clickJourneyMapExport(page);
    await page.waitForFunction(() => window.__journeyMapColorBlob instanceof Blob);
    const captured = await page.evaluate(async () => ({
      filename: window.__journeyMapColorFilename,
      bytes: Array.from(new Uint8Array(await window.__journeyMapColorBlob.arrayBuffer()))
    }));
    assert.equal(captured.filename, "WaypointData.dat", "the live export keeps the required filename");

    const bytes = Uint8Array.from(captured.bytes);
    const root = parseJourneyMapDat(bytes);
    const cases = {
      Biomes: "#FFFFFF",
      Dungeons: "#FF0000",
      "SAO Events": "#00FF00",
      "Test Category": "#0000FF",
      "Another Category": "#8A2BE2"
    };
    for (const [name, hex] of Object.entries(cases)) {
      const groupEntry = findGroup(root, name);
      assert.ok(groupEntry, `${name} exists in the downloaded NBT`);
      const [groupId, group] = groupEntry;
      const rgb = Number.parseInt(hex.slice(1), 16);
      assert.equal(group.color, rgb, `${name} group contains RGB TAG_Int from downloaded NBT`);
      assert.equal(getNbtTagType(group, "color"), 3, `${name} group color is TAG_INT`);
      const waypoint = Object.values(root.waypoints).find((entry) => entry.groupId === groupId);
      assert.ok(waypoint, `${name} has an individual waypoint in downloaded NBT`);
      assert.equal(waypoint.color, (0xff000000 | rgb), `${name} waypoint contains opaque ARGB TAG_Int`);
      assert.equal(getNbtTagType(waypoint, "color"), 3, `${name} waypoint color is TAG_INT`);
      console.log(
        `${name}: group=${group.color} (${groupColorAsHex(group.color)}), waypoint=${waypoint.color} (${groupColorAsHex(waypoint.color)})`
      );
    }
  } finally {
    await context.close();
    await browser.close();
    await server.stop();
  }

  console.log("JourneyMap actual export color browser regression checks passed.");
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});