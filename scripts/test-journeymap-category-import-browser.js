"use strict";

const assert = require("node:assert/strict");
const { chromium } = require("playwright");
const { buildJourneyMapExport, parseJourneyMapDat } = require("../shared/sao-journeymap-export.js");
const { ensureStaticServer } = require("./harness-helpers");

const rootUrl = process.env.SAO_BASE_URL || "http://127.0.0.1:8080";
const categorySpecs = [
  { name: "Default", categoryColor: "#445566", waypointColors: ["#FF0000", "#00FF00", "#0000FF"], prefix: "Def" },
  { name: "Cat 1", categoryColor: "#224466", waypointColors: ["#8A2BE2", "#FFD700", "#00FFFF"], prefix: "Cat 1" },
  { name: "Cat 2", categoryColor: "#663322", waypointColors: ["#FF69B4", "#7FFF00", "#FF4500"], prefix: "Cat 2" }
];

function fixtureBytes(specs) {
  const categories = Object.fromEntries(
    specs.map((spec, categoryIndex) => [
      spec.name,
      (spec.waypointColors || ["#13579B"]).map((waypointColor, waypointIndex) => ({
        name: `${spec.prefix || spec.name}-${waypointIndex + 1}`,
        x: 100 + categoryIndex * 10 + waypointIndex,
        y: -30,
        z: 200 + categoryIndex * 10 + waypointIndex,
        categoryColor: spec.categoryColor,
        waypointColor,
        icon: "pin"
      }))
    ])
  );
  return Buffer.from(buildJourneyMapExport({ world: "aincrad", dimensionId: "aincrad", categories }).toUint8Array());
}

async function importBytes(page, filename, bytes) {
  await page.locator("#journeyMapImportFile").setInputFiles({
    name: filename,
    mimeType: "application/octet-stream",
    buffer: bytes
  });
}

async function readRecords(page) {
  return page.evaluate(() => JSON.parse(localStorage.getItem("sao.customWaypoints.aincrad") || "[]"));
}

async function clickJourneyMapExport(page) {
  const point = await page.evaluate(() => {
    const image = document.getElementById("mapImage");
    const rect = image.getBoundingClientRect();
    for (const fraction of [0.3, 0.45, 0.6, 0.75]) {
      const x = rect.left + rect.width * fraction;
      const y = rect.top + rect.height * fraction;
      const target = document.elementFromPoint(x, y);
      if (target && image.contains(target) && !target.closest(".marker, button, input, select, textarea, label, dialog, #infoOverlay, #zoomControls")) {
        return { x, y };
      }
    }
    throw new Error("Could not find an unobstructed map point.");
  });
  await page.mouse.click(point.x, point.y, { button: "right" });
  await page.locator("#mapContextMenu [data-map-action='journey-export']").click();
}

async function run() {
  const server = await ensureStaticServer(rootUrl);
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 960 } });
  await context.addInitScript(() => {
    localStorage.setItem("sao.walkthrough.maps.completed", "1");
    localStorage.setItem(
      "sao.customWaypoints.aincrad",
      JSON.stringify([
        {
          id: "existing-default",
          name: "Existing Default waypoint",
          description: "",
          x: 1,
          z: 2,
          floor: "floor1",
          world: "aincrad",
          button: "Default",
          buttonColor: "#ABCDEF",
          logo: "pin"
        }
      ])
    );
    localStorage.setItem("sao.customWaypoints.colors.aincrad", JSON.stringify({ "floor1:default": "#ABCDEF", default: "#ABCDEF" }));
  });

  try {
    const page = await context.newPage();
    page.on("pageerror", (error) => console.error(`Browser page error: ${error.message}`));
    await page.goto(`${server.url}/Aincrad/Map/maps.html?floor=floor1`, { waitUntil: "load", timeout: 60000 });
    await page.waitForFunction(() => window.__aincradMapRuntime);
    await page.waitForFunction(() => document.getElementById("journeyMapImportFile"));

    const fixture = fixtureBytes(categorySpecs);
    await importBytes(page, "categories.dat", fixture);
    try {
      await page.waitForFunction(
        () => JSON.parse(localStorage.getItem("sao.customWaypoints.aincrad") || "[]").length === 10,
        null,
        { timeout: 10000 }
      );
    } catch (_error) {
      const failure = await page.evaluate(() => ({
        records: JSON.parse(localStorage.getItem("sao.customWaypoints.aincrad") || "[]").length,
        toast: document.getElementById("globalToast")?.textContent || ""
      }));
      throw new Error(`JourneyMap fixture import did not persist: ${JSON.stringify(failure)}`);
    }
    let records = await readRecords(page);
    const importedRecords = records.filter((record) => record.id !== "existing-default");
    assert.equal(importedRecords.length, 9);
    assert.deepEqual(
      Array.from(new Set(importedRecords.map((record) => record.button))).sort(),
      ["Cat 1", "Cat 2", "Default"]
    );
    assert.equal(records.filter((record) => record.button === "Default").length, 4, "existing Default is reused");

    for (const spec of categorySpecs) {
      const categoryRecords = importedRecords.filter((record) => record.button === spec.name);
      assert.equal(categoryRecords.length, 3, `${spec.name} receives exactly its three markers`);
      assert.equal(categoryRecords[0].buttonColor, spec.categoryColor, `${spec.name} keeps its group color`);
      categoryRecords.forEach((record, index) => {
        assert.equal(record.name, `${spec.prefix}-${index + 1}`);
        assert.equal(record.description, "");
        assert.equal(record.x, 100 + categorySpecs.indexOf(spec) * 10 + index);
        assert.equal(record.z, 200 + categorySpecs.indexOf(spec) * 10 + index);
        assert.equal(record.waypointColor, spec.waypointColors[index]);
      });
    }

    await importBytes(page, "categories-again.dat", fixture);
    await page.waitForFunction(
      () => document.getElementById("globalToast").textContent === "9 JourneyMap waypoints were already imported."
    );
    assert.equal((await readRecords(page)).length, 10, "reimporting the same file adds no duplicate buttons or waypoints");

    const additionalCategories = Array.from({ length: 12 }, (_unused, index) => ({
      name: `Imported ${index + 1}`,
      categoryColor: `#${(index + 1).toString(16).padStart(6, "0")}`,
      waypointColors: [`#${(index + 21).toString(16).padStart(6, "0")}`]
    }));
    await importBytes(page, "more-than-eight-categories.dat", fixtureBytes(additionalCategories));
    await page.waitForFunction(() => JSON.parse(localStorage.getItem("sao.customWaypoints.aincrad") || "[]").length === 22);
    records = await readRecords(page);
    const buttonNames = Array.from(new Set(records.map((record) => record.button)));
    assert.equal(buttonNames.length, 15, "all twelve imported categories are created beyond the old limit");
    assert.equal(buttonNames.filter((name) => name === "Default").length, 1, "only one Default button exists");
    assert.equal(records.filter((record) => record.button.startsWith("Imported ")).length, 12);

    await page.evaluate(() => {
      const exporter = window.SAOJourneyMapExport;
      const originalBuild = exporter.buildJourneyMapExport;
      exporter.buildJourneyMapExport = (config) => {
        window.__categoryImportExportConfig = config;
        try {
          return originalBuild(config);
        } catch (error) {
          window.__categoryImportExportError = error.stack || error.message;
          throw error;
        }
      };
      URL.createObjectURL = (blob) => {
        window.__categoryImportExportBlob = blob;
        return "blob:category-import-export";
      };
      URL.revokeObjectURL = () => {};
      HTMLAnchorElement.prototype.click = function captureDownload() {
        window.__categoryImportExportFilename = this.download;
      };
    });
    await clickJourneyMapExport(page);
    try {
      await page.waitForFunction(() => window.__categoryImportExportBlob instanceof Blob, null, { timeout: 10000 });
    } catch (_error) {
      const state = await page.evaluate(() => ({
        toast: document.getElementById("globalToast").textContent,
        error: window.__categoryImportExportError || "",
        categoryError: (() => {
          try {
            return typeof window.getJourneyMapExportCategories === "function"
              ? JSON.stringify(window.getJourneyMapExportCategories())
              : `not-global:${typeof window.getJourneyMapExportCategories}`;
          } catch (error) {
            return error.stack || error.message;
          }
        })(),
        categoryStates: window.__aincradMapRuntime.getCategoryStates(),
        categories: window.__categoryImportExportConfig
          ? Object.fromEntries(Object.entries(window.__categoryImportExportConfig.categories).map(([name, entries]) => [name, entries.length]))
          : null
      }));
      throw new Error(`Imported waypoint export did not produce a Blob: ${JSON.stringify(state)}`);
    }
    const exported = await page.evaluate(async () => ({
      filename: window.__categoryImportExportFilename,
      bytes: Array.from(new Uint8Array(await window.__categoryImportExportBlob.arrayBuffer()))
    }));
    assert.equal(exported.filename, "WaypointData.dat");
    const root = parseJourneyMapDat(Uint8Array.from(exported.bytes));
    for (const spec of categorySpecs) {
      const waypoint = Object.values(root.waypoints).find((entry) => entry.name === `${spec.prefix}-1`);
      assert.ok(waypoint, `${spec.name} first waypoint is exported`);
      const group = root.groups[waypoint.groupId];
      assert.equal(group.name, spec.name);
      assert.equal(group.color, Number.parseInt(spec.categoryColor.slice(1), 16));
      assert.equal(waypoint.color, 0xff000000 | Number.parseInt(spec.waypointColors[0].slice(1), 16));
    }
  } finally {
    await context.close();
    await browser.close();
    await server.stop();
  }

  console.log("JourneyMap category import browser regression checks passed.");
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});