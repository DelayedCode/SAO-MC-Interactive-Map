"use strict";

const assert = require("node:assert/strict");
const { chromium } = require("playwright");
const { attachDiagnostics, ensureStaticServer } = require("./harness-helpers");

const rootUrl = process.env.SAO_BASE_URL || "http://127.0.0.1:8080";
const AINCRAD_URL = "/Aincrad/Map/maps.html?floor=floor1";
const UNDERWORLD_URL = "/Fractured%20Underworld/Main%20UI/mainui.html";
const AINCRAD_KEY = "sao.customWaypoints.aincrad";
const UNDERWORLD_KEY = "sao.customWaypoints.underworld";

async function findMapSurfacePoint(page) {
  return page.evaluate(() => {
    const layer = document.getElementById("mapLayer");
    const rect = layer.getBoundingClientRect();
    const markers = [...document.querySelectorAll("#markers .marker")].map((marker) => marker.getBoundingClientRect());
    const fractions = [0.34, 0.48, 0.62, 0.76, 0.88];
    for (const yFraction of fractions) {
      for (const xFraction of fractions) {
        const x = rect.left + rect.width * xFraction;
        const y = rect.top + rect.height * yFraction;
        const target = document.elementFromPoint(x, y);
        if (
          !target ||
          !layer.contains(target) ||
          target.closest(
            ".marker, button, input, select, textarea, label, dialog, #infoOverlay, #zoomControls, #mapEmptyState"
          )
        ) {
          continue;
        }
        if (
          markers.some((marker) => Math.hypot(marker.x + marker.width / 2 - x, marker.y + marker.height / 2 - y) < 60)
        ) {
          continue;
        }
        return { x, y };
      }
    }
    throw new Error("Could not find an unobstructed map surface point.");
  });
}

async function clickMap(page, count = 3) {
  const point = await findMapSurfacePoint(page);
  await page.mouse.click(point.x, point.y, { clickCount: count, delay: 25 });
  return point;
}

async function readRecords(page, key) {
  return page.evaluate((storageKey) => JSON.parse(localStorage.getItem(storageKey) || "[]"), key);
}

async function deleteVisibleWaypoint(page) {
  await page.locator("#content [data-custom-waypoint-delete]").click();
  await page.locator("#customWaypointDeleteConfirm").click();
}

async function createWaypoint(page, name, expectedCount) {
  await clickMap(page, 3);
  await page.waitForFunction(() => document.getElementById("customWaypointDialog").open);
  const expectedWarning = await page.evaluate(() => window.SAOI18n.t("page.maps.customWaypoint.performanceWarning"));
  const warning = page.locator("#customWaypointPerformanceWarning");
  assert.equal(await warning.isVisible(), true, "performance warning appears in the live creation dialog");
  assert.equal(await warning.textContent(), expectedWarning, "warning follows the active map-page locale");
  const xInput = page.locator("#customWaypointX");
  const zInput = page.locator("#customWaypointZ");
  const autoX = await xInput.inputValue();
  const autoZ = await zInput.inputValue();
  await page.locator("#customWaypointName").fill(name);
  await page.locator("#customWaypointDescription").fill(`${name} details`);
  if (autoX && autoZ) {
    await xInput.fill(String(Number(autoX) + 1));
    await zInput.fill(String(Number(autoZ) + 1));
  } else {
    await xInput.fill("12.5");
    await zInput.fill("-34.5");
  }
  await page.locator("#customWaypointLogo").selectOption("star");
  await page.locator("#customWaypointForm button[type='submit']").click();
  await page.waitForFunction(({ key, count }) => JSON.parse(localStorage.getItem(key) || "[]").length === count, {
    key: expectedCount === 1 || page.url().includes("maps.html") ? AINCRAD_KEY : UNDERWORLD_KEY,
    count: expectedCount
  });
  return { autoX, autoZ };
}

async function assertLocalizedDialog(
  page,
  language,
  expectedTitle,
  expectedCategory,
  expectedManual,
  expectedValidation
) {
  await page.evaluate((languageCode) => window.SAOI18n.setLanguage(languageCode), language);
  assert.ok((await page.locator("#customCategoryItem .sidebar-section-title").textContent()).includes(expectedCategory));
  await clickMap(page, 3);
  await page.waitForFunction(() => document.getElementById("customWaypointDialog").open);
  const title = await page.locator("#customWaypointDialogTitle").textContent();
  assert.equal(title.trim(), expectedTitle);
  const dialogText = await page.locator("#customWaypointDialog").innerText();
  assert.ok(!dialogText.includes("page.maps.customWaypoint"), `${language}: no raw localization keys`);
  await page.setViewportSize({ width: 360, height: 740 });
  const layout = await page.evaluate(() => {
    const dialog = document.getElementById("customWaypointDialog");
    const rect = dialog.getBoundingClientRect();
    return {
      documentOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      dialogOverflow: dialog.scrollWidth > dialog.clientWidth,
      dialogOutsideViewport: rect.left < 0 || rect.right > window.innerWidth
    };
  });
  assert.equal(layout.documentOverflow, false, `${language}: no page horizontal overflow`);
  assert.equal(layout.dialogOverflow, false, `${language}: dialog fits its content width`);
  assert.equal(layout.dialogOutsideViewport, false, `${language}: dialog stays in viewport`);
  const status = page.locator("#customWaypointStatusMessage");
  assert.equal(await status.textContent(), expectedManual, `${language}: manual-coordinate notice is translated`);
  const recordsBeforeValidation = await readRecords(page, UNDERWORLD_KEY);
  await page.locator("#customWaypointX").fill("7.25");
  await page.locator("#customWaypointZ").fill("-9.5");
  await page.locator("#customWaypointCopy").click();
  const localizedCopyStatus = await page.evaluate(() => window.SAOI18n.t("page.maps.customWaypoint.copySuccess"));
  await page.waitForFunction(
    (expectedStatus) => document.getElementById("customWaypointStatusMessage").textContent === expectedStatus,
    localizedCopyStatus
  );
  assert.equal(await status.textContent(), localizedCopyStatus, `${language}: copy success is translated`);
  assert.equal(await page.locator("#customWaypointDialog").evaluate((dialog) => dialog.open), true);
  assert.deepEqual(await readRecords(page, UNDERWORLD_KEY), recordsBeforeValidation, "copy creates no record");
  await page.evaluate(() => window.SAOI18n.setLanguage("en"));
  assert.equal(await status.textContent(), "Coordinates copied.", "open copy status updates to English");
  await page.evaluate((languageCode) => window.SAOI18n.setLanguage(languageCode), language);
  assert.equal(await status.textContent(), localizedCopyStatus, `${language}: open copy status updates back`);
  await page.locator("#customWaypointName").fill("");
  await page.locator("#customWaypointForm button[type='submit']").click();
  assert.equal(await status.textContent(), expectedValidation, `${language}: validation is translated`);
  await page.evaluate(() => window.SAOI18n.setLanguage("en"));
  assert.equal(await status.textContent(), "Enter a waypoint name.", "open validation updates to English");
  assert.deepEqual(
    await readRecords(page, UNDERWORLD_KEY),
    recordsBeforeValidation,
    "language switching saves nothing"
  );
  await page.evaluate((languageCode) => window.SAOI18n.setLanguage(languageCode), language);
  assert.equal(
    await status.textContent(),
    expectedValidation,
    `${language}: open validation updates when switched back`
  );
  assert.ok((await page.locator("#customCategoryItem .sidebar-section-title").textContent()).includes(expectedCategory));
  assert.equal(
    await page.locator("#customWaypointPerformanceWarning").textContent(),
    await page.evaluate(() => window.SAOI18n.t("page.maps.customWaypoint.performanceWarning")),
    `${language}: performance warning is translated`
  );
  await page.locator("#customWaypointCancel").click();
  await page.setViewportSize({ width: 1440, height: 960 });
}

async function run() {
  const server = await ensureStaticServer(rootUrl);
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 960 } });
  await context.addInitScript(() => {
    ["sao.walkthrough.maps.completed", "sao.walkthrough.mainui.completed"].forEach((key) => {
      localStorage.setItem(key, "1");
    });
  });
  try {
    try {
      await context.grantPermissions(["clipboard-read", "clipboard-write"], { origin: new URL(server.url).origin });
    } catch (_error) {
      // Clipboard permission support varies across browser versions; the page fallback remains covered.
    }
    const page = await context.newPage();
    const diagnostics = attachDiagnostics(page);
    page.on("dialog", (dialog) => dialog.accept());

    await page.goto(`${server.url}${AINCRAD_URL}`, { waitUntil: "load", timeout: 60000 });
    await page.waitForFunction(() => document.getElementById("mapImage")?.naturalWidth > 0, null, { timeout: 30000 });

    const singlePoint = await findMapSurfacePoint(page);
    await page.mouse.click(singlePoint.x, singlePoint.y);
    assert.equal(await page.locator("#customWaypointDialog").evaluate((dialog) => dialog.open), false);
    await page.waitForTimeout(550);
    const doublePoint = await findMapSurfacePoint(page);
    await page.mouse.click(doublePoint.x, doublePoint.y, { clickCount: 2, delay: 25 });
    assert.equal(await page.locator("#customWaypointDialog").evaluate((dialog) => dialog.open), false);

    const startTransform = await page.locator("#mapLayer").evaluate((layer) => layer.style.transform);
    for (let dragIndex = 0; dragIndex < 3; dragIndex += 1) {
      const dragPoint = await findMapSurfacePoint(page);
      await page.mouse.move(dragPoint.x, dragPoint.y);
      await page.mouse.down();
      await page.mouse.move(dragPoint.x + 40, dragPoint.y + 22, { steps: 5 });
      await page.mouse.up();
    }
    assert.notEqual(await page.locator("#mapLayer").evaluate((layer) => layer.style.transform), startTransform);
    assert.equal(await page.locator("#customWaypointDialog").evaluate((dialog) => dialog.open), false);

    const zoomBefore = await page.locator("#zoomLabel").textContent();
    const zoomPoint = await findMapSurfacePoint(page);
    await page.mouse.move(zoomPoint.x, zoomPoint.y);
    await page.mouse.wheel(0, -160);
    await page.waitForFunction((oldZoom) => document.getElementById("zoomLabel").textContent !== oldZoom, zoomBefore);

    const creationPoint = await findMapSurfacePoint(page);
    creationPoint.x = Math.round(creationPoint.x);
    creationPoint.y = Math.round(creationPoint.y);
    const expectedCoordinates = await page.evaluate(({ x, y }) => {
      const image = document.getElementById("mapImage");
      const local = window.SAOMapHelpers.getImageLocalCoords(image, { clientX: x, clientY: y });
      const rawX = local.localX * (local.naturalWidth / local.contentWidth);
      const rawY = local.localY * (local.naturalHeight / local.contentHeight);
      const mapped = window.mapWebsiteCoordinates(rawX, rawY, document.getElementById("floorSelect").value, {
        width: local.naturalWidth,
        height: local.naturalHeight
      });
      return { x: Math.round(mapped.x), z: Math.round(mapped.z) };
    }, creationPoint);
    await page.mouse.click(creationPoint.x, creationPoint.y, { clickCount: 4, delay: 25 });
    await page.waitForFunction(() => document.getElementById("customWaypointDialog").open);
    const autoCoordinates = await page.evaluate(() => ({
      x: document.getElementById("customWaypointX").value,
      z: document.getElementById("customWaypointZ").value
    }));
    assert.match(autoCoordinates.x, /^-?\d+(\.\d+)?$/);
    assert.match(autoCoordinates.z, /^-?\d+(\.\d+)?$/);
    assert.equal(Number(autoCoordinates.x), expectedCoordinates.x, "Aincrad X matches calibrated conversion");
    assert.equal(Number(autoCoordinates.z), expectedCoordinates.z, "Aincrad Z matches calibrated conversion");
    await page.locator("#customWaypointCopy").click();
    const copiedCoordinates = await page.evaluate(() => navigator.clipboard.readText());
    assert.equal(copiedCoordinates, `X: ${autoCoordinates.x} Z: ${autoCoordinates.z}`);
    await page.locator("#customWaypointName").fill("");
    await page.locator("#customWaypointForm button[type='submit']").click();
    assert.equal(await page.locator("#customWaypointStatusMessage").textContent(), "Enter a waypoint name.");
    assert.equal(
      await page.locator("#customWaypointPerformanceWarning").isVisible(),
      true,
      "validation feedback does not hide the performance warning"
    );
    assert.equal(await readRecords(page, AINCRAD_KEY).then((records) => records.length), 0);
    await page.locator("#customWaypointName").fill("Pending waypoint");
    await page.locator("#customWaypointX").fill("");
    await page.locator("#customWaypointZ").fill("");
    await page.locator("#customWaypointForm button[type='submit']").click();
    assert.equal(await page.locator("#customWaypointStatusMessage").textContent(), "Enter valid X and Z coordinates.");
    assert.equal(await readRecords(page, AINCRAD_KEY).then((records) => records.length), 0);
    await page.locator("#customWaypointCancel").click();
    assert.equal(await readRecords(page, AINCRAD_KEY).then((records) => records.length), 0, "cancel creates nothing");
    assert.equal(await page.locator("#customCategoryItem").evaluate((item) => item.hidden), true);

    await page.locator("#resetView").click();
    const floorOneCoordinates = await createWaypoint(page, "Floor One Marker", 1);
    let aincradRecords = await readRecords(page, AINCRAD_KEY);
    assert.deepEqual(Object.keys(aincradRecords[0]).sort(), [
      "button",
      "buttonColor",
      "description",
      "floor",
      "id",
      "logo",
      "name",
      "world",
      "x",
      "z"
    ]);
    assert.equal(aincradRecords[0].button, "Default");
    assert.match(aincradRecords[0].buttonColor, /^#[0-9A-F]{6}$/i);
    assert.equal(aincradRecords[0].floor, "floor1");
    assert.equal(aincradRecords[0].world, "aincrad");
    assert.equal(aincradRecords[0].logo, "star");
    assert.equal(aincradRecords[0].x, Number(floorOneCoordinates.autoX) + 1, "edited Aincrad X persists");
    assert.equal(aincradRecords[0].z, Number(floorOneCoordinates.autoZ) + 1, "edited Aincrad Z persists");
    assert.equal(await page.locator("#customCategoryItem").evaluate((item) => item.hidden), false);
    assert.equal(await page.locator("#customWaypointSidebarList [data-custom-button='Default']").getAttribute("aria-pressed"), "true");
    await page.waitForSelector("#markers .marker.custom-marker", { timeout: 10000 });
    assert.equal(await page.locator("#markers .marker.custom-marker .custom-waypoint-icon").count(), 1);

    await page.locator("#markers .marker.custom-marker").click({ clickCount: 3, delay: 25 });
    assert.equal(await page.locator("#customWaypointDialog").evaluate((dialog) => dialog.open), false);
    await page.waitForFunction(() => document.getElementById("content").textContent.includes("Floor One Marker"));
    assert.match(await page.locator("#content").innerText(), /Floor One Marker details/);
    assert.equal(await page.locator("#content [data-custom-waypoint-delete]").count(), 1);

    const longWaypointName = `Waypoint ${"L".repeat(70)}`;
    const longWaypointDescription = "Detailed note ".repeat(70).trim();
    await clickMap(page, 3);
    await page.waitForFunction(() => document.getElementById("customWaypointDialog").open);
    await page.locator("#customWaypointName").fill(longWaypointName);
    await page.locator("#customWaypointDescription").fill(longWaypointDescription);
    await page.locator("#customWaypointX").fill("999999999999");
    await page.locator("#customWaypointZ").fill("-999999999999");
    await page.locator("#customWaypointForm button[type='submit']").click();
    await page.waitForFunction(
      () => JSON.parse(localStorage.getItem("sao.customWaypoints.aincrad") || "[]").length === 2
    );
    const longRecord = (await readRecords(page, AINCRAD_KEY)).find((record) => record.name === longWaypointName);
    assert.ok(longRecord, "long names survive creation");
    assert.equal(longRecord.description, longWaypointDescription, "long descriptions survive creation");
    assert.equal(longRecord.x, 999999999999, "large X values persist");
    assert.equal(longRecord.z, -999999999999, "large Z values persist");
    assert.ok((await page.locator("#title").textContent()).includes(longWaypointName));
    assert.ok((await page.locator("#content").textContent()).includes(longWaypointDescription));
    await deleteVisibleWaypoint(page);
    await page.waitForFunction(
      () => JSON.parse(localStorage.getItem("sao.customWaypoints.aincrad") || "[]").length === 1
    );

    await page.locator("#customWaypointSidebarList [data-custom-button='Default']").click({ clickCount: 3, delay: 25 });
    assert.equal(await page.locator("#customWaypointDialog").evaluate((dialog) => dialog.open), false);
    await page.locator("#customWaypointSidebarList [data-custom-button='Default']").click();
    const searchBox = await page.locator("#search").boundingBox();
    await page.mouse.click(searchBox.x + searchBox.width / 2, searchBox.y + searchBox.height / 2, {
      clickCount: 3,
      delay: 25
    });
    assert.equal(await page.locator("#customWaypointDialog").evaluate((dialog) => dialog.open), false);
    const zoomButton = await page.locator("#zoomIn").boundingBox();
    await page.mouse.click(zoomButton.x + zoomButton.width / 2, zoomButton.y + zoomButton.height / 2, {
      clickCount: 3,
      delay: 25
    });
    assert.equal(await page.locator("#customWaypointDialog").evaluate((dialog) => dialog.open), false);
    const floorSelector = await page.locator("#floorSelect").boundingBox();
    await page.mouse.click(floorSelector.x + floorSelector.width / 2, floorSelector.y + floorSelector.height / 2, {
      clickCount: 3,
      delay: 25
    });
    assert.equal(await page.locator("#customWaypointDialog").evaluate((dialog) => dialog.open), false);

    await page.locator("#floorSelect").selectOption("floor2");
    await page.waitForFunction(() => document.getElementById("floorSelect").value === "floor2");
    await page.waitForFunction(() => !document.querySelector("#markers .marker.custom-marker"));
    assert.equal(await page.locator("#markers .marker.custom-marker").count(), 0);
    const floorTwoCoordinates = await createWaypoint(page, "Floor Two Marker", 2);
    aincradRecords = await readRecords(page, AINCRAD_KEY);
    assert.deepEqual(aincradRecords.map((record) => record.floor).sort(), ["floor1", "floor2"]);
    const floorTwoRecord = aincradRecords.find((record) => record.floor === "floor2");
    assert.equal(floorTwoRecord.x, Number(floorTwoCoordinates.autoX) + 1);
    assert.equal(floorTwoRecord.z, Number(floorTwoCoordinates.autoZ) + 1);
    await page.locator("#floorSelect").selectOption("floor1");
    await page.waitForFunction(() => document.getElementById("floorSelect").value === "floor1");
    assert.equal(await page.locator("#customWaypointSidebarList [data-custom-button='Default'] .marker-count").textContent(), "1");
    await page.reload({ waitUntil: "load" });
    await page.waitForFunction(() => document.getElementById("customCategoryItem").hidden === false);
    if ((await page.locator("#customWaypointSidebarList [data-custom-button='Default']").getAttribute("aria-pressed")) !== "true") {
      await page.locator("#customWaypointSidebarList [data-custom-button='Default']").click();
    }
    assert.equal(await readRecords(page, AINCRAD_KEY).then((records) => records.length), 2);

    await page.locator("#floorSelect").selectOption("floor2");
    await page.waitForFunction(() => document.getElementById("floorSelect").value === "floor2");
    await page.waitForSelector("#markers .marker.custom-marker");
    await page.locator("#markers .marker.custom-marker").click();
    await deleteVisibleWaypoint(page);
    await page.waitForFunction(
      () => JSON.parse(localStorage.getItem("sao.customWaypoints.aincrad") || "[]").length === 1
    );
    assert.equal(await page.locator("#customCategoryItem").evaluate((item) => item.hidden), false);
    assert.equal((await readRecords(page, AINCRAD_KEY))[0].floor, "floor1");
    await page.reload({ waitUntil: "load" });
    await page.waitForFunction(() => document.getElementById("customCategoryItem").hidden === false);
    assert.equal(await readRecords(page, AINCRAD_KEY).then((records) => records.length), 1);
    await page.locator("[data-category='biomes']").click();
    await page.waitForSelector("#markers .marker.biome");
    await page.locator("#markers .marker.biome").first().click();
    assert.equal(await page.locator("#content [data-custom-waypoint-delete]").count(), 0);
    assert.equal(await page.locator("#customWaypointDialog").evaluate((dialog) => dialog.open), false);
    await page.locator("[data-category='biomes']").click();
    await page.locator("#floorSelect").selectOption("floor1");
    await page.waitForFunction(() => document.getElementById("floorSelect").value === "floor1");
    await page.waitForSelector("#markers .marker.custom-marker");
    await page.locator("#markers .marker.custom-marker").click();
    await deleteVisibleWaypoint(page);
    await page.waitForFunction(
      () => JSON.parse(localStorage.getItem("sao.customWaypoints.aincrad") || "[]").length === 0
    );
    assert.equal(await page.locator("#customCategoryItem").evaluate((item) => item.hidden), true);
    await page.reload({ waitUntil: "load" });
    assert.equal(await readRecords(page, AINCRAD_KEY).then((records) => records.length), 0);
    assert.equal(await page.locator("#customCategoryItem").evaluate((item) => item.hidden), true);
    await createWaypoint(page, "World Isolation Marker", 1);

    await page.goto(`${server.url}${UNDERWORLD_URL}`, { waitUntil: "load", timeout: 60000 });
    assert.equal(await readRecords(page, UNDERWORLD_KEY).then((records) => records.length), 0);
    assert.equal(await readRecords(page, AINCRAD_KEY).then((records) => records.length), 1);
    await clickMap(page, 3);
    await page.waitForFunction(() => document.getElementById("customWaypointDialog").open);
    assert.equal(await page.locator("#customWaypointX").inputValue(), "", "uncalibrated map does not invent X");
    assert.equal(await page.locator("#customWaypointZ").inputValue(), "", "uncalibrated map does not invent Z");
    await page.locator("#customWaypointName").fill("Island Manual Point");
    await page.locator("#customWaypointDescription").fill("Manual coordinates");
    await page.locator("#customWaypointX").fill("10");
    await page.locator("#customWaypointZ").fill("20");
    await page.locator("#customWaypointLogo").selectOption("flag");
    await page.locator("#customWaypointForm button[type='submit']").click();
    await page.waitForFunction(
      () => JSON.parse(localStorage.getItem("sao.customWaypoints.underworld") || "[]").length === 1
    );
    let underworldRecords = await readRecords(page, UNDERWORLD_KEY);
    assert.equal(underworldRecords[0].world, "underworld");
    assert.equal(underworldRecords[0].floor, "playerIsland");
    assert.equal(underworldRecords[0].logo, "flag");
    assert.equal(await page.locator("#customWaypointSidebarList [data-custom-button]").count(), 1);
    await page.waitForFunction(() => document.getElementById("title").textContent.includes("Island Manual Point"));
    assert.equal(await page.locator("#content [data-custom-waypoint-delete]").count(), 1);
    assert.equal(
      await page.locator("#markers .marker.custom-marker").count(),
      0,
      "Underworld remains unprojected without calibration"
    );

    await page.reload({ waitUntil: "load" });
    if ((await page.locator("#customWaypointSidebarList [data-custom-button='Default']").getAttribute("aria-pressed")) !== "true") {
      await page.locator("#customWaypointSidebarList [data-custom-button='Default']").click();
    }
    await page.waitForSelector(".custom-waypoint-list-item");
    assert.equal((await readRecords(page, UNDERWORLD_KEY)).length, 1, "Underworld data survives reload");
    await createWaypoint(page, "Second Island Point", 2);
    await assertLocalizedDialog(
      page,
      "es",
      "Crear punto de ruta personalizado",
      "Marcadores personalizados",
      "Introduce X y Z manualmente; este mapa aún no tiene calibración de coordenadas.",
      "Introduce un nombre para el punto de ruta."
    );
    await assertLocalizedDialog(
      page,
      "fr",
      "Créer un point de passage personnalisé",
      "Marqueurs personnalisés",
      "Saisis X et Z manuellement ; cette carte n'est pas encore calibrée.",
      "Saisis un nom pour le point de passage."
    );
    await page.evaluate(() => window.SAOI18n.setLanguage("en"));

    await page.locator(".island-nav-button[data-island='rulid']").click();
    await page.waitForFunction(() => window.__underworldMapRuntime.getActiveMapContext() === "rulid");
    assert.equal(await page.locator("#customWaypointSidebarList [data-custom-button='Default'] .marker-count").count(), 0);
    await createWaypoint(page, "Rulid Manual Point", 3);
    underworldRecords = await readRecords(page, UNDERWORLD_KEY);
    assert.deepEqual(underworldRecords.map((record) => record.floor).sort(), ["playerIsland", "playerIsland", "rulid"]);
    await deleteVisibleWaypoint(page);
    await page.waitForFunction(
      () => JSON.parse(localStorage.getItem("sao.customWaypoints.underworld") || "[]").length === 2
    );
    assert.equal(await page.locator("#customWaypointSidebarList [data-custom-button]").count(), 0);
    await page.locator(".island-nav-button[data-island='playerIsland']").click();
    await page.waitForFunction(() => window.__underworldMapRuntime.getActiveMapContext() === "playerIsland");
    await page.locator(".custom-waypoint-list-item [data-custom-waypoint-open]").first().click();
    await page.waitForFunction(() => document.getElementById("title").textContent.includes("Island Manual Point"));
    assert.match(await page.locator("#content").innerText(), /Manual coordinates/);
    await deleteVisibleWaypoint(page);
    await page.waitForFunction(
      () => JSON.parse(localStorage.getItem("sao.customWaypoints.underworld") || "[]").length === 1
    );
    assert.equal(await page.locator("#customWaypointSidebarList [data-custom-button]").count(), 1);
    await page.locator(".custom-waypoint-list-item [data-custom-waypoint-open]").first().click();
    await deleteVisibleWaypoint(page);
    await page.waitForFunction(
      () => JSON.parse(localStorage.getItem("sao.customWaypoints.underworld") || "[]").length === 0
    );
    assert.equal(await page.locator("#customWaypointSidebarList [data-custom-button]").count(), 0);

    const underworldStressRecords = Array.from({ length: 300 }, (_unused, index) => ({
      id: `underworld-stress-${index}`,
      name: `Island Stress ${index}`,
      description: "",
      x: index,
      z: -index,
      floor: "playerIsland",
      world: "underworld",
      logo: index % 3 === 0 ? "pin" : index % 3 === 1 ? "star" : "flag"
    }));
    await page.evaluate(({ key, records }) => window.SAOStorage.setJSON(key, records), {
      key: UNDERWORLD_KEY,
      records: underworldStressRecords
    });
    await page.reload({ waitUntil: "load" });
    const underworldCategory = page.locator("#customWaypointSidebarList [data-custom-button='Default']");
    await page.waitForFunction(() => document.querySelectorAll("#customWaypointSidebarList [data-custom-button]").length === 1);
    if ((await underworldCategory.getAttribute("aria-pressed")) === "true") await underworldCategory.click();
    const underworldRenderStartedAt = Date.now();
    await underworldCategory.click();
    await page.waitForFunction(
      () => document.querySelectorAll("#customWaypointFallbackList .custom-waypoint-list-item").length === 300
    );
    const underworldStressRenderMs = Date.now() - underworldRenderStartedAt;
    assert.ok(
      underworldStressRenderMs < 5000,
      `300 Underworld waypoints render in the fallback list within 5 seconds (${underworldStressRenderMs}ms)`
    );
    await page.evaluate(() => {
      window.__customWaypointFallbackList = document.getElementById("customWaypointFallbackList");
    });
    const zoomBeforeFallbackPan = await page.locator("#zoomLabel").textContent();
    const fallbackMapPoint = await findMapSurfacePoint(page);
    await page.mouse.move(fallbackMapPoint.x, fallbackMapPoint.y);
    await page.mouse.wheel(0, -140);
    await page.waitForFunction(
      (oldZoom) => document.getElementById("zoomLabel").textContent !== oldZoom,
      zoomBeforeFallbackPan
    );
    await page.waitForTimeout(100);
    assert.equal(
      await page.evaluate(
        () => window.__customWaypointFallbackList === document.getElementById("customWaypointFallbackList")
      ),
      true,
      "map zoom reuses the unchanged Underworld custom list DOM"
    );
    const underworldRenderAfterZoom = Date.now();
    const dragMapPoint = await findMapSurfacePoint(page);
    await page.mouse.move(dragMapPoint.x, dragMapPoint.y);
    await page.mouse.down();
    await page.mouse.move(dragMapPoint.x + 35, dragMapPoint.y + 20, { steps: 4 });
    await page.mouse.up();
    await page.waitForTimeout(100);
    assert.equal(
      await page.evaluate(
        () => window.__customWaypointFallbackList === document.getElementById("customWaypointFallbackList")
      ),
      true,
      "map pan reuses the unchanged Underworld custom list DOM"
    );
    assert.ok(Date.now() - underworldRenderAfterZoom < 1000, "Underworld custom list remains responsive while panning");

    await page.goto(`${server.url}${AINCRAD_URL}`, { waitUntil: "load", timeout: 60000 });
    await page.waitForFunction(() => document.getElementById("customCategoryItem").hidden === false);
    assert.equal((await readRecords(page, AINCRAD_KEY))[0].name, "World Isolation Marker");

    const stressRecords = Array.from({ length: 300 }, (_unused, index) => ({
      id: `stress-${index}`,
      name: `Stress ${index}`,
      description: "",
      x: 2542 + (index % 20) * 18,
      z: 2551 + Math.floor(index / 20) * 18,
      floor: "floor1",
      world: "aincrad",
      logo: index % 3 === 0 ? "pin" : index % 3 === 1 ? "star" : "flag"
    }));
    await page.evaluate(({ key, records }) => window.SAOStorage.setJSON(key, records), {
      key: AINCRAD_KEY,
      records: stressRecords
    });
    const reloadStartedAt = Date.now();
    await page.reload({ waitUntil: "load" });
    const stressReloadMs = Date.now() - reloadStartedAt;
    await page.waitForFunction(() => document.getElementById("customCategoryItem").hidden === false);
    const stressCategory = page.locator("#customWaypointSidebarList [data-custom-button='Default']");
    if ((await stressCategory.getAttribute("aria-pressed")) === "true") await stressCategory.click();
    const disableStartedAt = Date.now();
    await stressCategory.click();
    await page.waitForFunction(() => window.__aincradMapRuntime.getCategoryState("custom"));
    await page.waitForFunction(() =>
      document.querySelector("#markers .marker.cluster-marker, #markers .marker.custom-marker")
    );
    const categoryEnableMs = Date.now() - disableStartedAt;
    const floorSwitchStartedAt = Date.now();
    await page.locator("#floorSelect").selectOption("floor2");
    await page.waitForFunction(() => document.getElementById("floorSelect").value === "floor2");
    await page.waitForFunction(() => !document.querySelector("#markers .marker.custom-marker"));
    await page.locator("#floorSelect").selectOption("floor1");
    await page.waitForFunction(() => document.getElementById("floorSelect").value === "floor1");
    const floorSwitchMs = Date.now() - floorSwitchStartedAt;
    const languageSwitchStartedAt = Date.now();
    await page.evaluate(() => window.SAOI18n.setLanguage("fr"));
    await page.waitForFunction(() =>
      document.getElementById("customCategoryItem").textContent.includes("Marqueurs")
    );
    assert.equal(await readRecords(page, AINCRAD_KEY).then((records) => records.length), 300);
    await page.evaluate(() => window.SAOI18n.setLanguage("en"));
    const languageSwitchMs = Date.now() - languageSwitchStartedAt;
    const stressPanZoomStartedAt = Date.now();
    const zoomBeforeStress = await page.locator("#zoomLabel").textContent();
    const stressMapPoint = await findMapSurfacePoint(page);
    await page.mouse.move(stressMapPoint.x, stressMapPoint.y);
    await page.mouse.wheel(0, -140);
    await page.waitForFunction(
      (oldZoom) => document.getElementById("zoomLabel").textContent !== oldZoom,
      zoomBeforeStress
    );
    await page.mouse.move(stressMapPoint.x, stressMapPoint.y);
    await page.mouse.down();
    await page.mouse.move(stressMapPoint.x + 25, stressMapPoint.y + 16, { steps: 3 });
    await page.mouse.up();
    const stressPanZoomMs = Date.now() - stressPanZoomStartedAt;
    await page.locator("#resetView").click();
    const stressRenderMs = categoryEnableMs;
    assert.ok(stressRenderMs < 5000, `300 custom markers render within 5 seconds (${stressRenderMs}ms)`);
    const detailsStartedAt = Date.now();
    const stressMarker = page.locator("#markers .marker.cluster-marker, #markers .marker.custom-marker").first();
    await stressMarker.click();
    if ((await page.locator("#content .cluster-entry summary").count()) > 0) {
      await page.locator("#content .cluster-entry summary").first().click();
    }
    await page.waitForFunction(
      () => document.getElementById("content").querySelectorAll("[data-custom-waypoint-delete]").length > 0
    );
    const stressDetailsMs = Date.now() - detailsStartedAt;
    const customWaypointCopy = await page.locator("#content").innerText();
    assert.ok(customWaypointCopy.includes("Stress"), "large-set details open a custom waypoint");
    const createAtStressStartedAt = Date.now();
    await createWaypoint(page, "Stress Created Waypoint", 301);
    const stressCreateMs = Date.now() - createAtStressStartedAt;
    const deleteAtStressStartedAt = Date.now();
    await deleteVisibleWaypoint(page);
    await page.waitForFunction(
      () => JSON.parse(localStorage.getItem("sao.customWaypoints.aincrad") || "[]").length === 300
    );
    const stressDeleteMs = Date.now() - deleteAtStressStartedAt;
    const categoryDisableStartedAt = Date.now();
    await stressCategory.click();
    await page.waitForFunction(() => !window.__aincradMapRuntime.getCategoryState("custom"));
    await page.waitForTimeout(50);
    assert.equal(await page.locator("#markers .marker.custom-marker").count(), 0);
    const categoryDisableMs = Date.now() - categoryDisableStartedAt;
    const stressMeasurements = {
      reload: stressReloadMs,
      categoryEnable: categoryEnableMs,
      categoryDisable: categoryDisableMs,
      floorSwitch: floorSwitchMs,
      languageSwitch: languageSwitchMs,
      panZoom: stressPanZoomMs,
      render: stressRenderMs,
      details: stressDetailsMs,
      create: stressCreateMs,
      delete: stressDeleteMs
    };
    Object.entries(stressMeasurements).forEach(([operation, duration]) => {
      assert.ok(duration < 5000, `300 custom waypoint ${operation} completes within 5 seconds (${duration}ms)`);
    });

    assert.deepEqual(diagnostics.errors, [], "custom waypoint flows produce no console errors");
    assert.deepEqual(diagnostics.failedRequests, [], "custom waypoint flows produce no failed requests");
    console.log(
      JSON.stringify(
        {
          status: "passed",
          stressMarkers: stressRecords.length,
          stressRenderMs,
          underworldStressMarkers: underworldStressRecords.length,
          underworldStressRenderMs,
          stressMeasurements
        },
        null,
        2
      )
    );
  } finally {
    await context.close();
    await browser.close();
    await server.stop();
  }
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
