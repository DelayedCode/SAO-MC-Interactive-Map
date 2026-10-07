"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright");
const { attachDiagnostics, ensureStaticServer } = require("./harness-helpers");
const { parseJourneyMapDat, serializeJourneyMapNbt } = require("../shared/sao-journeymap-export.js");

const rootUrl = process.env.SAO_BASE_URL || "http://127.0.0.1:8080";
const aincradKey = "sao.customWaypoints.aincrad";
const underworldKey = "sao.customWaypoints.underworld";
const aincradUrl = "/Aincrad/Map/maps.html?floor=floor1";
const underworldUrl = "/Fractured%20Underworld/Main%20UI/mainui.html";

function journeyMapFile(groups) {
  return Buffer.from(
    serializeJourneyMapNbt({
      groups: {
        journeymap_all: {
          settings: {},
          groups: Object.fromEntries(
            Object.entries(groups).map(([name, value]) => {
              const definition = Array.isArray(value) ? { waypoints: value } : value;
              return [name, { settings: definition.settings || {}, waypoints: definition.waypoints || [] }];
            })
          )
        }
      }
    })
  );
}

async function openJourneyMapContextMenu(page) {
  const point = await page.evaluate(() => {
    const emptyState = document.getElementById("mapEmptyState");
    if (emptyState && !emptyState.classList.contains("is-hidden")) {
      const rect = emptyState.getBoundingClientRect();
      return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    }
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
    throw new Error("Could not find an unobstructed map point for the context menu.");
  });
  await page.mouse.click(point.x, point.y, { button: "right" });
  await page.waitForFunction(() => document.getElementById("mapContextMenu").hidden === false);
}

async function clickJourneyMapExportAction(page) {
  await openJourneyMapContextMenu(page);
  const action = page.locator("#mapContextMenu [data-map-action='journey-export']");
  assert.equal(await action.isDisabled(), false, "JourneyMap export context action is enabled");
  await action.click();
}

async function openImportAction(page) {
  await openJourneyMapContextMenu(page);
  const action = page.locator("[data-map-action='journey-import']");
  assert.equal(await action.isDisabled(), false, "JourneyMap import action is enabled");
  await page.evaluate(() => {
    const input = document.getElementById("journeyMapImportFile");
    input.__pickerOpened = false;
    input.click = () => {
      input.__pickerOpened = true;
    };
  });
  await action.click();
  assert.equal(
    await page.locator("#journeyMapImportFile").evaluate((input) => input.__pickerOpened),
    true,
    "the context action opens the file picker"
  );
  await page.evaluate(() => delete document.getElementById("journeyMapImportFile").click);
}

async function selectImportFile(page, filename, buffer) {
  await page.locator("#journeyMapImportFile").setInputFiles({
    name: filename,
    mimeType: "application/octet-stream",
    buffer
  });
}

async function readStorage(page, key) {
  return page.evaluate((storageKey) => JSON.parse(localStorage.getItem(storageKey) || "[]"), key);
}

async function captureJourneyMapExport(page) {
  await page.evaluate(() => {
    if (window.__journeyMapExportCaptureInstalled) return;
    window.__journeyMapExportCaptureInstalled = true;
    URL.createObjectURL = (blob) => {
      window.__journeyMapExportBlob = blob;
      return "blob:journeymap-test";
    };
    URL.revokeObjectURL = () => {};
    HTMLAnchorElement.prototype.click = function () {
      window.__journeyMapExportFilename = this.download;
    };
  });
  await clickJourneyMapExportAction(page);
  await page.waitForFunction(() => window.__journeyMapExportBlob instanceof Blob);
  const captured = await page.evaluate(async () => ({
    filename: window.__journeyMapExportFilename,
    bytes: Array.from(new Uint8Array(await window.__journeyMapExportBlob.arrayBuffer()))
  }));
  return { filename: captured.filename, payload: parseJourneyMapDat(Buffer.from(captured.bytes)) };
}

async function verifyImportedCategoryState(browser, server) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 960 } });
  await context.addInitScript(() => {
    if (localStorage.getItem("__importStateSeeded") === "1") return;
    const categories = ["Default", "Custom A", "Custom B", "Unrelated Custom C", "Imported A", "Imported B"];
    const coordinates = {
      Default: [1800, 1800],
      "Custom A": [1000, 2500],
      "Custom B": [2542, 2500],
      "Unrelated Custom C": [4000, 2500],
      "Imported A": [1800, 3500],
      "Imported B": [3300, 1800]
    };
    localStorage.setItem(
      "sao.customWaypoints.aincrad",
      JSON.stringify(
        categories.map((button, index) => ({
          id: `seed-${index}`,
          name: `Existing ${button}`,
          description: `Existing ${button} details`,
          x: coordinates[button][0],
          z: coordinates[button][1],
          floor: "floor1",
          world: "aincrad",
          button,
          buttonColor: "#778899",
          logo: "pin"
        }))
      )
    );
    localStorage.setItem(
      "sao.customWaypoints.enabled.aincrad",
      JSON.stringify({
        "floor1:default": true,
        "floor1:custom a": true,
        "floor1:custom b": false,
        "floor1:unrelated custom c": false,
        "floor1:imported a": false,
        "floor1:imported b": false
      })
    );
    localStorage.setItem("sao.walkthrough.maps.completed", "1");
    localStorage.setItem("__importStateSeeded", "1");
  });

  try {
    const page = await context.newPage();
    const diagnostics = attachDiagnostics(page);
    await page.goto(`${server.url}${aincradUrl}`, { waitUntil: "load", timeout: 60000 });
    await page.waitForFunction(() => document.getElementById("mapImage")?.naturalWidth > 0, null, { timeout: 30000 });
    await openImportAction(page);

    const importedGroups = {
      Default: {
        waypoints: [
          { name: "Default 1", description: "not the title", x: 500, y: -30, z: 500, dim: "aincrad", uuid: "state-default-1", color: 0xffffff },
          { name: "Default 2", description: "not the title", x: 4500, y: -30, z: 500, dim: "aincrad", uuid: "state-default-2", color: 0xffffff }
        ]
      },
      "Imported A": {
        waypoints: [
          { name: "A 1", description: "not the title", x: 500, y: -30, z: 4500, dim: "aincrad", uuid: "state-a-1", color: 0x336699 },
          { name: "A 2", description: "not the title", x: 4500, y: -30, z: 4500, dim: "aincrad", uuid: "state-a-2", color: 0x336699 }
        ]
      },
      "Imported B": {
        waypoints: [
          { name: "B 1", description: "not the title", x: 2542, y: -30, z: 500, dim: "aincrad", uuid: "state-b-1", color: 0x996633 },
          { name: "B 2", description: "not the title", x: 2542, y: -30, z: 4500, dim: "aincrad", uuid: "state-b-2", color: 0x996633 }
        ]
      }
    };
    await selectImportFile(page, "category-state-import.dat", journeyMapFile(importedGroups));
    await page.waitForFunction(() =>
      ["Default 1", "Default 2", "A 1", "A 2", "B 1", "B 2"].every((name) =>
        JSON.parse(localStorage.getItem("sao.customWaypoints.aincrad") || "[]").some((record) => record.name === name)
      )
    );

    const records = await readStorage(page, aincradKey);
    const importedRecords = records.filter((record) => /^(Default [12]|A [12]|B [12])$/.test(record.name));
    assert.equal(importedRecords.length, 6, "all six waypoints were imported");
    assert.deepEqual(
      importedRecords.map(({ name, button, description }) => ({ name, button, description })).sort((a, b) => a.name.localeCompare(b.name)),
      [
        { name: "A 1", button: "Imported A", description: "" },
        { name: "A 2", button: "Imported A", description: "" },
        { name: "B 1", button: "Imported B", description: "" },
        { name: "B 2", button: "Imported B", description: "" },
        { name: "Default 1", button: "Default", description: "" },
        { name: "Default 2", button: "Default", description: "" }
      ],
      "JourneyMap title and group become waypoint name and button; descriptions are not copied"
    );
    const buttonCounts = await page.locator("#customWaypointSidebarList [data-custom-button]").evaluateAll((buttons) =>
      Object.fromEntries(buttons.map((button) => [button.dataset.customButton, Number(button.querySelector(".marker-count")?.textContent || 0)]))
    );
    for (const category of ["Default", "Imported A", "Imported B"]) {
      assert.equal(await page.locator(`#customWaypointSidebarList [data-custom-button='${category}']`).count(), 1, `${category} has one reusable button`);
      assert.equal(buttonCounts[category], 3, `${category} combines existing and imported waypoints`);
      assert.equal(await page.locator(`#customWaypointSidebarList [data-custom-button='${category}']`).getAttribute("aria-pressed"), "true");
    }

    const stateSnapshot = await page.evaluate(() => {
      const store = window.SAOCustomWaypoints.createCustomWaypointStore({
        storage: window.SAOPageHelpers.getStorage(),
        world: "aincrad",
        floorIds: ["floor1", "floor2", "floor3"]
      });
      return {
        states: Object.fromEntries(store.getCustomButtonsForFloor("floor1").map((name) => [name, store.getButtonEnabled(name, "floor1")])),
        dataset: store.getMarkerDataset("floor1")
      };
    });
    assert.equal(stateSnapshot.states.Default, true, "an already-enabled Default category remains enabled");
    assert.equal(stateSnapshot.states["Imported A"], true, "import enables/reuses Imported A in the store");
    assert.equal(stateSnapshot.states["Imported B"], true, "import enables/reuses Imported B in the store");
    assert.equal(stateSnapshot.states["Custom A"], true, "existing enabled category stays enabled");
    assert.equal(stateSnapshot.states["Custom B"], false, "existing disabled category stays disabled");
    assert.equal(stateSnapshot.states["Unrelated Custom C"], false, "unrelated disabled category stays disabled");
    const expectedColors = { "Imported A": "#336699", "Imported B": "#996633", Default: "#FFFFFF" };
    for (const record of importedRecords) {
      const marker = stateSnapshot.dataset[`custom:${record.id}`];
      assert.ok(marker, `${record.name} is present in the enabled marker dataset`);
      assert.equal(marker.title, record.name, `${record.name} uses its waypoint name as marker title`);
      assert.deepEqual(marker.coords, { x: record.x, z: record.z }, `${record.name} preserves JourneyMap X/Z`);
      assert.equal(marker.customWaypointButtonColor, expectedColors[record.button], `${record.name} uses its category color`);
      assert.equal(record.buttonColor, expectedColors[record.button], `${record.name} persists its category color`);
    }
    const importedMarkerIds = importedRecords.map((record) => `custom:${record.id}`);
    for (const markerId of importedMarkerIds) {
      assert.equal(await page.locator(`#markers [data-marker-id='${markerId}']`).count(), 1, `${markerId} is visible on the map`);
    }
    for (const category of ["Custom A", "Custom B", "Unrelated Custom C", "Imported A", "Imported B"]) {
      const button = page.locator(`#customWaypointSidebarList [data-custom-button='${category}']`);
      const expectedEnabled = ["Custom A", "Imported A", "Imported B"].includes(category);
      assert.equal(await button.getAttribute("aria-pressed"), String(expectedEnabled), `${category} button reflects store state`);
      assert.equal(await button.evaluate((element) => element.classList.contains("active")), expectedEnabled);
    }

    const toggleAndCheck = async (category, expectedEnabled, visible) => {
      const button = page.locator(`#customWaypointSidebarList [data-custom-button='${category}']`);
      if ((await button.getAttribute("aria-pressed")) !== String(expectedEnabled)) await button.click();
      await page.waitForFunction(
        ({ name, enabled }) => window.SAOCustomWaypoints.createCustomWaypointStore({
          storage: window.SAOPageHelpers.getStorage(), world: "aincrad", floorIds: ["floor1", "floor2", "floor3"]
        }).getButtonEnabled(name, "floor1") === enabled,
        { name: category, enabled: expectedEnabled }
      );
      assert.equal(await button.getAttribute("aria-pressed"), String(expectedEnabled));
      const categoryRecords = records.filter((record) => record.button === category);
      await page.waitForFunction(
        ({ ids, shouldBeVisible }) => ids.every((id) => Boolean(document.querySelector(`#markers [data-marker-id='custom:${id}']`)) === shouldBeVisible),
        { ids: categoryRecords.map((record) => record.id), shouldBeVisible: visible }
      );
      for (const record of categoryRecords) {
        assert.equal(
          await page.locator(`#markers [data-marker-id='custom:${record.id}']`).count(),
          visible ? 1 : 0,
          `${category} marker visibility follows its button state`
        );
      }
    };
    await toggleAndCheck("Custom B", true, true);
    await toggleAndCheck("Unrelated Custom C", false, false);
    await toggleAndCheck("Unrelated Custom C", true, true);
    await toggleAndCheck("Custom B", false, false);
    await toggleAndCheck("Custom A", true, true);

    await page.reload({ waitUntil: "load", timeout: 60000 });
    await page.waitForFunction(() => document.getElementById("mapImage")?.naturalWidth > 0, null, { timeout: 30000 });
    for (const [category, enabled] of [["Default", true], ["Custom A", true], ["Custom B", false], ["Unrelated Custom C", true], ["Imported A", true], ["Imported B", true]]) {
      assert.equal(await page.locator(`#customWaypointSidebarList [data-custom-button='${category}']`).getAttribute("aria-pressed"), String(enabled), `${category} state survives reload`);
    }

    await page.locator("#customWaypointSidebarList [data-custom-button-delete='Imported B']").click();
    const deleteConfirm = page.locator("#customButtonDeleteConfirm");
    assert.equal(await deleteConfirm.textContent(), "Delete", "delete dialog starts with Delete");
    await deleteConfirm.click();
    assert.equal(await deleteConfirm.textContent(), "Confirm", "first click explicitly asks for Confirm");
    await deleteConfirm.click();
    assert.match(await deleteConfirm.textContent(), /^Are you sure\? \(5\)$/);
    assert.equal(await deleteConfirm.isDisabled(), true, "existing countdown disables deletion");
    await page.waitForFunction(() => document.getElementById("customButtonDeleteConfirm").textContent === "Confirm Delete", null, { timeout: 8000 });
    assert.equal(await page.locator("#customButtonDeleteConfirm").isDisabled(), false);
    await page.locator("#customButtonDeleteConfirm").click();
    assert.equal(await page.locator("#customWaypointSidebarList [data-custom-button='Imported B']").count(), 0);
    assert.deepEqual(diagnostics.errors, [], "category-state and delete workflows report no browser errors");
    assert.deepEqual(diagnostics.failedRequests, [], "category-state and delete workflows load all resources");
  } finally {
    await context.close();
  }
}

function journeyMapContent(payload) {
  const groups = payload.groups;
  const categoryNames = Object.values(groups)
    .filter((group) => !["All", "Death", "Temp", "Default"].includes(group.name))
    .map((group) => group.name)
    .sort();
  const waypoints = Object.values(payload.waypoints)
    .map((waypoint) => ({
      group: groups[waypoint.groupId]?.name,
      name: waypoint.name,
      color: waypoint.color,
      pos: waypoint.pos,
      origin: waypoint.origin,
      modId: waypoint.modId,
      icon: waypoint.icon,
      settings: waypoint.settings,
      dimensions: waypoint.dimensions
    }))
    .sort((left, right) => `${left.group}:${left.name}`.localeCompare(`${right.group}:${right.name}`));
  return { categoryNames, waypoints };
}

async function run() {
  const server = await ensureStaticServer(rootUrl);
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 960 } });
  await context.addInitScript(
    ({ aincradStorageKey, underworldStorageKey }) => {
      if (localStorage.getItem("__journeymapImportTestSeeded") === "1") return;
      localStorage.setItem(
        aincradStorageKey,
        JSON.stringify([
          {
            id: "existing-aincrad",
            name: "Keep Aincrad",
            description: "Existing data",
            x: 1,
            z: 2,
            floor: "floor1",
            world: "aincrad",
            button: "Existing",
            logo: "pin"
          }
        ])
      );
      localStorage.setItem(
        underworldStorageKey,
        JSON.stringify([
          {
            id: "existing-underworld",
            name: "Keep FU",
            description: "Existing FU data",
            x: 3,
            z: 4,
            floor: "playerIsland",
            world: "underworld",
            button: "Existing FU",
            logo: "pin"
          }
        ])
      );
      localStorage.setItem("sao.walkthrough.maps.completed", "1");
      localStorage.setItem("sao.walkthrough.mainui.completed", "1");
      localStorage.setItem("__journeymapImportTestSeeded", "1");
    },
    { aincradStorageKey: aincradKey, underworldStorageKey: underworldKey }
  );

  try {
    await verifyImportedCategoryState(browser, server);
    const page = await context.newPage();
    const diagnostics = attachDiagnostics(page);
    await page.goto(`${server.url}${aincradUrl}`, { waitUntil: "load", timeout: 60000 });
    await page.waitForFunction(() => document.getElementById("mapImage")?.naturalWidth > 0, null, { timeout: 30000 });
    const customRecordsBeforeExports = await readStorage(page, aincradKey);
    assert.equal(await page.locator("#mapContextMenu [data-map-action='journey-export']").count(), 1);
    assert.equal(await page.locator("#mapContextMenu [data-map-action='journey-import']").count(), 1);
    const builtInWaypointSnapshot = await page.evaluate(() =>
      JSON.stringify(
        Object.entries(window.AincradMapAdapter.markerDataset).map(([id, marker]) => [
          id,
          marker.floor,
          marker.coords || marker.x || null,
          marker.z || null
        ])
      )
    );
    await page.setViewportSize({ width: 360, height: 740 });
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth),
      true,
      "page has no horizontal overflow on a mobile viewport"
    );
    await page.setViewportSize({ width: 1440, height: 960 });

    await page.evaluate(() => {
      const runtime = window.__aincradMapRuntime;
      Object.keys(runtime.getCategoryStates()).forEach((category) => runtime.setCategoryState(category, false));
    });
    await clickJourneyMapExportAction(page);
    await page.waitForFunction(
      () => document.getElementById("globalToast").textContent === "Enable at least one waypoint category to export."
    );
    await page.evaluate(() => window.__aincradMapRuntime.setCategoryState("__emptyExportTest", true));
    await clickJourneyMapExportAction(page);
    await page.waitForFunction(
      () =>
        document.getElementById("globalToast").textContent === "The enabled categories contain no waypoints to export."
    );
    await page.evaluate(() => window.__aincradMapRuntime.setCategoryState("__emptyExportTest", false));

    await page.locator("[data-category='biomes']").click();
    await page.waitForFunction(() => window.__aincradMapRuntime.getCategoryState("biomes"));
    const oneCategoryExport = await captureJourneyMapExport(page);
    const oneCategoryGroup = Object.values(oneCategoryExport.payload.groups).find((group) => group.name === "biomes");
    assert.ok(oneCategoryGroup, "the enabled category is a sibling JourneyMap group");
    const oneCategoryWaypoints = Object.values(oneCategoryExport.payload.waypoints).filter(
      (waypoint) => waypoint.groupId === oneCategoryGroup.guid
    );
    assert.equal(oneCategoryExport.filename, "WaypointData.dat");
    assert.ok(oneCategoryWaypoints.length > 0, "export includes the enabled Biomes category");
    assert.ok((await page.locator("#globalToast").textContent()).includes(String(oneCategoryWaypoints.length)));
    const repeatedOneCategoryExport = await captureJourneyMapExport(page);
    assert.deepEqual(
      journeyMapContent(repeatedOneCategoryExport.payload),
      journeyMapContent(oneCategoryExport.payload),
      "repeated exports preserve waypoint content while generating fresh valid identities"
    );

    await page.locator("[data-category='dungeons']").click();
    await page.waitForFunction(() => window.__aincradMapRuntime.getCategoryState("dungeons"));
    const multipleCategoryExport = await captureJourneyMapExport(page);
    const multipleGroups = Object.values(multipleCategoryExport.payload.groups);
    const biomesExportGroup = multipleGroups.find((group) => group.name === "biomes");
    const dungeonsExportGroup = multipleGroups.find((group) => group.name === "dungeons");
    assert.ok(biomesExportGroup);
    assert.ok(dungeonsExportGroup);
    assert.ok(
      Object.values(multipleCategoryExport.payload.waypoints).some(
        (waypoint) => waypoint.groupId === biomesExportGroup.guid
      )
    );
    assert.ok(
      Object.values(multipleCategoryExport.payload.waypoints).some(
        (waypoint) => waypoint.groupId === dungeonsExportGroup.guid
      )
    );

    await page.evaluate(() => {
      URL.createObjectURL = () => {
        throw new Error("simulated download failure");
      };
    });
    await clickJourneyMapExportAction(page);
    await page.waitForFunction(
      () => document.getElementById("globalToast").textContent === "JourneyMap export failed."
    );
    await page.evaluate(() => {
      URL.createObjectURL = (blob) => {
        window.__journeyMapExportBlob = blob;
        return "blob:journeymap-test";
      };
    });
    await page.locator("#floorSelect").selectOption("floor2");
    await page.waitForFunction(() => document.getElementById("floorSelect").value === "floor2");
    await page.locator("#floorSelect").selectOption("floor1");
    await page.waitForFunction(() => document.getElementById("floorSelect").value === "floor1");
    assert.deepEqual(
      await readStorage(page, aincradKey),
      customRecordsBeforeExports,
      "export never changes Custom Waypoint storage"
    );
    await openImportAction(page);

    let originalAincrad = await readStorage(page, aincradKey);
    const originalUnderworld = await readStorage(page, underworldKey);
    const tooManyGroups = Object.fromEntries(
      Array.from({ length: 12 }, (_unused, index) => [
        `Imported Group ${index + 1}`,
        [{ name: `Imported marker ${index + 1}`, x: index, y: -30, z: index + 1, dim: "aincrad" }]
      ])
    );
    await selectImportFile(page, "too-many-groups.dat", journeyMapFile(tooManyGroups));
    await page.waitForFunction(
      (count) => JSON.parse(localStorage.getItem("sao.customWaypoints.aincrad") || "[]").length === count + 12,
      originalAincrad.length
    );
    const largeCategoryImport = (await readStorage(page, aincradKey)).slice(originalAincrad.length);
    assert.equal(largeCategoryImport.length, 12, "more than eight categories import successfully");
    assert.equal(new Set(largeCategoryImport.map((record) => record.button)).size, 12, "each imported group creates one button");
    await page.evaluate((ids) => {
      const store = window.SAOCustomWaypoints.createCustomWaypointStore({
        storage: window.SAOPageHelpers.getStorage(),
        world: "aincrad",
        floorIds: ["floor1", "floor2", "floor3"]
      });
      ids.forEach((id) => store.remove(id));
    }, largeCategoryImport.map((record) => record.id));
    assert.deepEqual(await readStorage(page, aincradKey), originalAincrad);
    await page.reload({ waitUntil: "load", timeout: 60000 });
    await page.waitForFunction(() => document.getElementById("mapImage")?.naturalWidth > 0, null, { timeout: 30000 });
    assert.deepEqual(
      await readStorage(page, underworldKey),
      originalUnderworld,
      "preflight failure does not partially add FU records"
    );

    await selectImportFile(
      page,
      "unknown-dimension.dat",
      journeyMapFile({ Unknown: [{ name: "Unknown world", x: 1, y: 0, z: 2, dim: "overworld" }] })
    );
    await page.waitForFunction(
      () =>
        document.getElementById("globalToast").textContent ===
        "This JourneyMap file uses an unsupported format or dimension."
    );
    assert.deepEqual(
      await readStorage(page, aincradKey),
      originalAincrad,
      "unknown dimensions are rejected before writes"
    );
    assert.deepEqual(await readStorage(page, underworldKey), originalUnderworld);

    const beforeMalformedLaterRecord = await readStorage(page, aincradKey);
    const beforeMalformedLaterForeign = await readStorage(page, underworldKey);
    await selectImportFile(
      page,
      "malformed-later-record.dat",
      journeyMapFile({
        Biomes: [
          { name: "Would be valid", x: 12, y: -30, z: 15, dim: "aincrad", uuid: "must-not-write" },
          { name: "Broken later record", x: "not-a-number", y: -30, z: 4, dim: "aincrad" }
        ]
      })
    );
    await page.waitForFunction(
      () => document.getElementById("globalToast").textContent === "This JourneyMap file is invalid."
    );
    assert.deepEqual(
      await readStorage(page, aincradKey),
      beforeMalformedLaterRecord,
      "a malformed later row writes no earlier rows"
    );
    assert.deepEqual(await readStorage(page, underworldKey), beforeMalformedLaterForeign);

    await selectImportFile(
      page,
      "unknown-dimension-after-valid.dat",
      journeyMapFile({
        Aincrad: [{ name: "Known first", x: 1, y: -30, z: 2, dim: "aincrad", uuid: "known-first" }],
        Unknown: [{ name: "Unknown later", x: 3, y: 0, z: 4, dim: "overworld", uuid: "unknown-later" }]
      })
    );
    await page.waitForFunction(
      () =>
        document.getElementById("globalToast").textContent ===
        "This JourneyMap file uses an unsupported format or dimension."
    );
    assert.deepEqual(
      await readStorage(page, aincradKey),
      beforeMalformedLaterRecord,
      "unknown later dimensions reject the full file"
    );

    await selectImportFile(
      page,
      "WaypointDataWorking.dat",
      fs.readFileSync(path.join(__dirname, "../WaypointDataWorking.dat"))
    );
    await page.waitForFunction(
      (count) => JSON.parse(localStorage.getItem("sao.customWaypoints.aincrad") || "[]").length === count + 9,
      beforeMalformedLaterRecord.length
    );
    const importedReference = (await readStorage(page, aincradKey)).slice(beforeMalformedLaterRecord.length);
    assert.equal(importedReference.length, 9, "ambiguous overworld waypoints import into the active map context");
    assert.ok(importedReference.every((record) => record.world === "aincrad" && record.floor === "floor1"));
    assert.deepEqual(
      Array.from(new Set(importedReference.map((record) => record.button))).sort(),
      ["Cat 1", "Cat 2", "Default"]
    );
    await page.evaluate((ids) => {
      const store = window.SAOCustomWaypoints.createCustomWaypointStore({
        storage: window.SAOPageHelpers.getStorage(),
        world: "aincrad",
        floorIds: ["floor1", "floor2", "floor3"]
      });
      ids.forEach((id) => store.remove(id));
    }, importedReference.map((record) => record.id));
    assert.deepEqual(await readStorage(page, aincradKey), beforeMalformedLaterRecord);
    await page.reload({ waitUntil: "load", timeout: 60000 });
    await page.waitForFunction(() => document.getElementById("mapImage")?.naturalWidth > 0, null, { timeout: 30000 });
    assert.deepEqual(await readStorage(page, underworldKey), beforeMalformedLaterForeign);

    const mixedWorldFile = journeyMapFile({
      Biomes: [
        {
          name: "Imported Forest",
          x: 120,
          y: -30,
          z: 240,
          dim: "aincrad",
          uuid: "browser-import-a",
          icon: "star",
          color: 0x00ff00
        }
      ],
      "FU Routes": [
        {
          name: "Imported Island",
          x: -15,
          y: 64,
          z: 45,
          dim: "underworld",
          uuid: "browser-import-fu",
          icon: "home",
          color: 0xff0000
        }
      ]
    });
    await page.evaluate(() => window.SAOI18n.setLanguage("es"));
    await openJourneyMapContextMenu(page);
    assert.equal(await page.locator("#mapContextMenu [data-map-action='journey-export']").textContent(), "Exportar puntos de JourneyMap");
    assert.equal(await page.locator("#mapContextMenu [data-map-action='journey-import']").textContent(), "Importar puntos de JourneyMap");
    await selectImportFile(page, "WaypointData.dat", mixedWorldFile);
    await page.waitForFunction(
      () =>
        JSON.parse(localStorage.getItem("sao.customWaypoints.aincrad") || "[]").some(
          (record) => record.name === "Imported Forest"
        ) &&
        JSON.parse(localStorage.getItem("sao.customWaypoints.underworld") || "[]").some(
          (record) => record.name === "Imported Island"
        )
    );

    const aincradRecords = await readStorage(page, aincradKey);
    const underworldRecords = await readStorage(page, underworldKey);
    assert.equal(aincradRecords.length, 2, "existing Aincrad records remain while new ones are added");
    assert.equal(underworldRecords.length, 2, "FU waypoints are routed to FU storage");
    assert.ok(
      aincradRecords.some((record) => record.id === "existing-aincrad"),
      "unrelated Aincrad waypoint is untouched"
    );
    assert.ok(
      underworldRecords.some((record) => record.id === "existing-underworld"),
      "unrelated FU waypoint is untouched"
    );
    const importedAincrad = aincradRecords.find((record) => record.name === "Imported Forest");
    const importedUnderworld = underworldRecords.find((record) => record.name === "Imported Island");
    assert.deepEqual(
      {
        name: importedAincrad.name,
        x: importedAincrad.x,
        z: importedAincrad.z,
        floor: importedAincrad.floor,
        button: importedAincrad.button
      },
      { name: "Imported Forest", x: 120, z: 240, floor: "floor1", button: "Biomes" }
    );
    assert.equal(importedAincrad.logo, "star");
    assert.equal(importedAincrad.description, "");
    assert.equal(
      importedAincrad.buttonColor,
      "#00FF00",
      "legacy group category color falls back to its waypoint color"
    );
    assert.equal(importedAincrad.waypointColor, "#00FF00", "legacy waypoint color is retained independently");
    assert.deepEqual(
      { world: importedUnderworld.world, floor: importedUnderworld.floor, button: importedUnderworld.button },
      { world: "underworld", floor: "playerIsland", button: "FU Routes" }
    );
    assert.equal(importedUnderworld.logo, "home");
    assert.equal(importedUnderworld.description, "");
    assert.equal(importedUnderworld.buttonColor, "#FF0000");
    assert.equal(importedUnderworld.waypointColor, "#FF0000");
    assert.equal(await page.locator("#globalToast").textContent(), "Se importaron 2 puntos de ruta de 2 categorías.");
    assert.equal(await page.locator("#customWaypointSidebarList [data-custom-button='Biomes']").count(), 1);
    await page.locator("#floorSelect").selectOption("floor2");
    await page.waitForFunction(() => document.getElementById("floorSelect").value === "floor2");
    const floorScopedMarkers = await page.evaluate(() => {
      const store = window.SAOCustomWaypoints.createCustomWaypointStore({
        storage: window.SAOPageHelpers.getStorage(),
        world: "aincrad",
        floorIds: ["floor1", "floor2", "floor3"]
      });
      return {
        floor1: Object.values(store.getMarkerDataset("floor1")).map((marker) => marker.title),
        floor2: Object.values(store.getMarkerDataset("floor2")).map((marker) => marker.title)
      };
    });
    assert.equal(importedAincrad.floor, "floor1", "floor switching does not move imported waypoints");
    assert.ok(floorScopedMarkers.floor1.includes("Imported Forest"));
    assert.equal(floorScopedMarkers.floor2.includes("Imported Forest"), false);
    await page.locator("#floorSelect").selectOption("floor1");
    await page.waitForFunction(() => document.getElementById("floorSelect").value === "floor1");

    const partialImportFile = journeyMapFile({
      Biomes: [
        { name: "Changed Forest", x: 999, y: -30, z: -999, dim: "aincrad", uuid: "browser-import-a", icon: "flag" },
        { name: "Imported Ridge", x: 155, y: -30, z: 275, dim: "aincrad", uuid: "browser-import-new" }
      ]
    });
    await selectImportFile(page, "mixed-import.dat", partialImportFile);
    await page.waitForFunction(() =>
      JSON.parse(localStorage.getItem("sao.customWaypoints.aincrad") || "[]").some(
        (record) => record.name === "Imported Ridge"
      )
    );
    assert.equal(
      await page.locator("#globalToast").textContent(),
      "Importados: 1 punto de ruta nuevo; omitidos: 1 punto de ruta duplicado."
    );
    const afterPartialImport = await readStorage(page, aincradKey);
    const preservedDuplicate = afterPartialImport.find((record) => record.name === "Imported Forest");
    assert.deepEqual(
      {
        name: preservedDuplicate.name,
        x: preservedDuplicate.x,
        z: preservedDuplicate.z,
        logo: preservedDuplicate.logo
      },
      { name: "Imported Forest", x: 120, z: 240, logo: "star" },
      "duplicate rows do not overwrite existing waypoint fields"
    );

    await page.reload({ waitUntil: "load" });
    await page.waitForFunction(() => document.getElementById("mapImage")?.naturalWidth > 0, null, { timeout: 30000 });
    assert.equal((await readStorage(page, aincradKey)).length, 3, "imported records persist after reload");
    assert.equal((await readStorage(page, underworldKey)).length, 2, "foreign-world records persist after reload");
    assert.equal(
      await page.evaluate(() =>
        JSON.stringify(
          Object.entries(window.AincradMapAdapter.markerDataset).map(([id, marker]) => [
            id,
            marker.floor,
            marker.coords || marker.x || null,
            marker.z || null
          ])
        )
      ),
      builtInWaypointSnapshot,
      "JourneyMap imports leave built-in marker coordinates and data unchanged"
    );
    await page.evaluate(() => {
      window.__destroyAincradMapRuntime();
      window.__initAincradMapRuntime();
    });
    await openImportAction(page);

    const bulkWaypoints = Array.from({ length: 100 }, (_, index) => ({
      name: `Bulk waypoint ${index}`,
      x: 2542 + (index % 10) * 8,
      y: -30,
      z: 2551 + Math.floor(index / 10) * 8,
      dim: "aincrad",
      uuid: `browser-bulk-${index}`
    }));
    const bulkImportFile = journeyMapFile({ Bulk: bulkWaypoints });
    await page.evaluate(() => window.SAOI18n.setLanguage("en"));
    const bulkImportStartedAt = Date.now();
    await selectImportFile(page, "WaypointData-100.dat", bulkImportFile);
    await page.waitForFunction(
      () => JSON.parse(localStorage.getItem("sao.customWaypoints.aincrad") || "[]").length === 103
    );
    assert.ok(Date.now() - bulkImportStartedAt < 5000, "100 waypoint import completes within five seconds");
    assert.equal(await page.locator("#globalToast").textContent(), "Imported 100 waypoints from 1 category.");
    await selectImportFile(page, "WaypointData-100.dat", bulkImportFile);
    await page.waitForFunction(
      () => document.getElementById("globalToast").textContent === "100 JourneyMap waypoints were already imported."
    );
    assert.equal((await readStorage(page, aincradKey)).length, 103, "repeating a large import adds no records");

    const bulkCategory = page.locator("#customWaypointSidebarList [data-custom-button='Bulk']");
    if ((await bulkCategory.getAttribute("aria-pressed")) !== "true") await bulkCategory.click();
    const zoomLabelBeforeZoom = await page.locator("#zoomLabel").textContent();
    for (let zoomStep = 0; zoomStep < 8; zoomStep += 1) {
      await page.locator("#zoomIn").click();
    }
    await page.waitForFunction(
      (beforeZoom) => document.getElementById("zoomLabel").textContent !== beforeZoom,
      zoomLabelBeforeZoom
    );
    const panPoint = await page.evaluate(() => {
      const rect = document.getElementById("mapContainer").getBoundingClientRect();
      return { x: rect.left + rect.width * 0.8, y: rect.top + rect.height * 0.5 };
    });
    const transformBeforePan = await page.locator("#mapLayer").evaluate((layer) => layer.style.transform);
    await page.mouse.move(panPoint.x, panPoint.y);
    await page.mouse.down();
    await page.mouse.move(panPoint.x + 35, panPoint.y + 20, { steps: 4 });
    await page.mouse.up();
    await page.waitForFunction(
      (beforeTransform) => document.getElementById("mapLayer").style.transform !== beforeTransform,
      transformBeforePan
    );

    const bulkMarker = page.locator("#markers .marker.custom-marker").first();
    await bulkMarker.click({ force: true });
    await page.waitForFunction(() => document.getElementById("title").textContent.includes("Bulk waypoint"));
    await page.locator("#content [data-custom-waypoint-delete]").click();
    await page.waitForFunction(() => document.getElementById("customWaypointDeleteDialog").open);
    await page.locator("#customWaypointDeleteConfirm").click();
    await page.waitForFunction(
      () => JSON.parse(localStorage.getItem("sao.customWaypoints.aincrad") || "[]").length === 102
    );
    assert.equal(await page.locator("#customWaypointSidebarList [data-custom-button='Bulk']").count(), 1);

    await page.evaluate(() => window.SAOI18n.setLanguage("fr"));
    await openJourneyMapContextMenu(page);
    assert.equal(await page.locator("#mapContextMenu [data-map-action='journey-export']").textContent(), "Exporter les points JourneyMap");
    assert.equal(await page.locator("#mapContextMenu [data-map-action='journey-import']").textContent(), "Importer les points JourneyMap");
    await selectImportFile(page, "WaypointData.dat", mixedWorldFile);
    await page.waitForFunction(
      () =>
        document.getElementById("globalToast").textContent ===
        "2 points de passage JourneyMap avaient déjà été importés."
    );
    assert.equal((await readStorage(page, aincradKey)).length, 102, "re-importing the same file adds no duplicates");
    assert.equal((await readStorage(page, underworldKey)).length, 2, "repeat import preserves foreign-world data");

    const beforeInvalid = await readStorage(page, aincradKey);
    await page.evaluate(() => window.SAOI18n.setLanguage("en"));
    await selectImportFile(page, "broken.dat", Buffer.from([10, 0]));
    await page.waitForFunction(
      () => document.getElementById("globalToast").textContent === "This JourneyMap file is invalid."
    );
    assert.deepEqual(await readStorage(page, aincradKey), beforeInvalid, "invalid NBT makes no partial writes");

    await selectImportFile(page, "empty-groups.dat", journeyMapFile({ Empty: [] }));
    await page.waitForFunction(
      () => document.getElementById("globalToast").textContent === "No valid waypoints were found in this file."
    );
    assert.deepEqual(await readStorage(page, aincradKey), beforeInvalid, "empty groups create no records");

    await page.goto(`${server.url}${underworldUrl}`, { waitUntil: "load", timeout: 60000 });
    await page.waitForFunction(() => document.getElementById("journeyMapImportFile"));
    await openJourneyMapContextMenu(page);
    assert.equal(await page.locator("#mapContextMenu [data-map-action='journey-export']").count(), 1);
    assert.equal(await page.locator("#mapContextMenu [data-map-action='journey-import']").count(), 1);
    await selectImportFile(
      page,
      "WaypointData-fu.dat",
      journeyMapFile({
        "Ice Cave": [{ name: "Imported Cave", x: 7, y: 20, z: 9, dim: "underworld", uuid: "browser-import-c" }]
      })
    );
    await page.waitForFunction(() =>
      JSON.parse(localStorage.getItem("sao.customWaypoints.underworld") || "[]").some(
        (record) => record.name === "Imported Cave"
      )
    );
    const finalUnderworldRecords = await readStorage(page, underworldKey);
    const importedCave = finalUnderworldRecords.find((record) => record.name === "Imported Cave");
    assert.equal(importedCave.floor, "playerIsland");
    assert.equal(importedCave.button, "Ice Cave");
    assert.equal(await page.locator("#customWaypointSidebarList [data-custom-button='Ice Cave']").count(), 1);
    assert.equal(await page.locator("#globalToast").textContent(), "Imported 1 waypoint from 1 category.");
    const underworldBeforeExport = await readStorage(page, underworldKey);
    await page.evaluate(() => window.__underworldMapRuntime.setCategoryState("custom", true));
    const underworldExport = await captureJourneyMapExport(page);
    assert.equal(underworldExport.filename, "WaypointData.dat");
    const exportedUnderworldPoints = Object.values(underworldExport.payload.waypoints);
    assert.ok(exportedUnderworldPoints.length > 0, "FU export includes enabled Custom Waypoints");
    assert.ok(exportedUnderworldPoints.every((waypoint) => waypoint.pos.dimension === "minecraft:overworld"));
    assert.deepEqual(await readStorage(page, underworldKey), underworldBeforeExport, "FU export is read-only");
    const underworldBeforeForeignImport = await readStorage(page, underworldKey);
    await selectImportFile(
      page,
      "WaypointData-aincrad.dat",
      journeyMapFile({
        "Aincrad from FU": [
          { name: "Imported while viewing FU", x: 40, y: -30, z: 55, dim: "aincrad", uuid: "browser-import-from-fu" }
        ]
      })
    );
    await page.waitForFunction(() =>
      JSON.parse(localStorage.getItem("sao.customWaypoints.aincrad") || "[]").some(
        (record) => record.name === "Imported while viewing FU"
      )
    );
    assert.deepEqual(
      await readStorage(page, underworldKey),
      underworldBeforeForeignImport,
      "Aincrad imports from the FU page never enter FU storage"
    );
    assert.equal(
      (await readStorage(page, aincradKey)).find((record) => record.name === "Imported while viewing FU").floor,
      "floor1"
    );
    assert.deepEqual(diagnostics.errors, [], "map pages report no browser errors during import");
    console.log("JourneyMap import browser regression tests passed.");
  } finally {
    await browser.close();
    if (!server.reused) await server.stop();
  }
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
