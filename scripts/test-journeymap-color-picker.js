"use strict";

const assert = require("node:assert/strict");
const { chromium } = require("playwright");
const { ensureStaticServer } = require("./harness-helpers");

const rootUrl = process.env.SAO_BASE_URL || "http://127.0.0.1:8080";
const MAP_PAGES = [
  "/Aincrad/Map/maps.html?floor=floor1",
  "/Fractured%20Underworld/Main%20UI/mainui.html"
];

async function openNewCategoryColorPicker(page, baseUrl, path) {
  await page.goto(`${baseUrl}${path}`, { waitUntil: "load", timeout: 60000 });
  await page.waitForFunction(() => window.__aincradMapRuntime || window.__underworldMapRuntime);
  await page.evaluate(() => {
    const select = document.getElementById("customWaypointButtonSelect");
    select.add(new Option("Create new", "__create__"));
    select.value = "__create__";
    document.getElementById("customWaypointButtonNameRow").hidden = false;
    select.dispatchEvent(new Event("change", { bubbles: true }));
  });
  await page.locator("#customWaypointDialog").evaluate((dialog) => dialog.showModal());
  const selectedCategory = await page.locator("#customWaypointButtonSelect").inputValue();
  const colorRowHidden = await page.locator("#customWaypointCategoryColorRow").evaluate((element) => element.hidden);
  assert.equal(selectedCategory, "__create__", `${path}: the create-category option is selected`);
  assert.equal(colorRowHidden, false, `${path}: the color controls are visible for a new category`);
}

async function assertPickerFlow(page) {
  const picker = page.locator("#customWaypointCategoryColor");
  const hex = page.locator("#customWaypointCategoryHex");
  const swatch = page.locator("#customWaypointCategorySwatch");
  const hint = page.locator("#customWaypointCategoryColorHint");
  const initial = await picker.inputValue();

  assert.match(initial, /^#[0-9a-f]{6}$/i, "new categories receive a valid generated color");
  assert.equal((await hex.inputValue()).toUpperCase(), initial.toUpperCase(), "HEX starts synchronized with the picker");
  assert.ok(await swatch.evaluate((element) => element.style.background), "the selected color fills the preview");
  assert.match(await hint.textContent(), /click to choose a color/i, "the control explains how to use it");
  assert.equal(await picker.getAttribute("aria-label"), "Choose JourneyMap category color");
  assert.equal(
    await picker.evaluate((element) => {
      const rect = element.closest(".custom-waypoint-color-picker").getBoundingClientRect();
      const target = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
      /* The site-wide click cursor is the SAO-skinned hand with its tip as the hotspot. */
      return target === element && / 6 0,\s*pointer$/.test(getComputedStyle(element).cursor);
    }),
    true,
    "the visible preview center is an obvious clickable color-input target"
  );

  await hex.fill("#5979A6");
  assert.equal(await picker.inputValue(), "#5979a6", "editing HEX updates the native picker");
  assert.equal(await swatch.evaluate((element) => element.style.background), "rgb(89, 121, 166)");

  await picker.evaluate((element) => {
    element.value = "#315579";
    element.dispatchEvent(new Event("input", { bubbles: true }));
  });
  assert.equal((await hex.inputValue()).toUpperCase(), "#315579", "choosing a color updates HEX");
  assert.equal(await swatch.evaluate((element) => element.style.background), "rgb(49, 85, 121)");

  await page.locator("#customWaypointButtonName").fill("Biomes");
  assert.equal(await picker.inputValue(), "#ffffff", "Biomes is fixed to white");
  assert.equal((await hex.inputValue()).toUpperCase(), "#FFFFFF");
  assert.equal(await picker.isDisabled(), true, "Biomes picker cannot be changed");
  assert.equal(await hex.evaluate((element) => element.readOnly), true, "Biomes HEX cannot be edited");
  assert.match(await hint.textContent(), /locked to white/i);
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
    const page = await context.newPage();
    for (const path of MAP_PAGES) {
      await openNewCategoryColorPicker(page, server.url, path);
      await assertPickerFlow(page);
      await page.locator("#customWaypointCancel").click();
    }
  } finally {
    await context.close();
    await browser.close();
    await server.stop();
  }

  console.log("JourneyMap color picker browser regression checks passed.");
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});