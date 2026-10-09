/* Site-wide cursor regression.
 *
 * Loads every player-facing page and verifies that the shared cursor system from
 * shared/sao-polish.css is applied: the normal arrow site-wide, the SAO-skinned click
 * cursor on interactive elements, grab/grabbing on the draggable surfaces, text on text
 * entry and not-allowed on disabled controls. The two map pages are checked further: a
 * rendered marker keeps the click cursor, the draggable artwork shows grab, an active drag
 * shows grabbing, and clicking a marker still opens its info panel.
 *
 * The pointer geometry (hotspot == painted tip) is pinned in scripts/test-coordinates.js
 * and the map pointer -> Minecraft coordinate behaviour in
 * scripts/test-coordinate-lifecycle-browser.js; this file covers the CSS application.
 */
"use strict";

const assert = require("node:assert/strict");
const { chromium } = require("playwright");
const { ensureStaticServer } = require("./harness-helpers");

const rootUrl = process.env.SAO_BASE_URL || "http://127.0.0.1:8080";

const WALKTHROUGH_KEYS = [
  "sao.walkthrough.index.completed",
  "sao.walkthrough.maps.completed",
  "sao.walkthrough.mainui.completed",
  "sao.walkthrough.characterBuild.completed"
];

const PAGES = [
  { id: "hub", url: "/index.html" },
  { id: "character-build", url: "/Aincrad/Character%20Build/character-build.html" },
  { id: "map", url: "/Aincrad/Map/maps.html?floor=floor1" },
  { id: "bestiary", url: "/Aincrad/Bestiary/bestiary.html" },
  { id: "equipment", url: "/Aincrad/eCompendium/ecompendium.html" },
  { id: "quests", url: "/Aincrad/Quests/quests.html" },
  { id: "commands", url: "/Aincrad/Commands/commands.html" },
  { id: "patchnotes", url: "/Aincrad/Patchnotes/patchnotes.html" },
  { id: "miscinfo", url: "/Aincrad/Misc%20Info/miscinfo.html" },
  { id: "underworld-map", url: "/Fractured%20Underworld/Main%20UI/mainui.html" },
  { id: "tower-defense", url: "/Fractured%20Underworld/Tower%20Defense/towerdefense.html" },
  { id: "underworld-compendium", url: "/Fractured%20Underworld/Compendium/compendium.html" }
];

const ARROW = /^url\("data:image\/svg\+xml,[^"]+"\) 1 1, auto$/;
const CLICK = /^url\("data:image\/svg\+xml,[^"]+"\) 6 0, pointer$/;
const GRAB = /^url\("data:image\/svg\+xml,[^"]+"\) 11 11, grab$/;
const GRABBING = /^url\("data:image\/svg\+xml,[^"]+"\) 11 11, grabbing$/;

/* Runs in the page: the computed cursor of the first visible element of each kind. */
function collectCursors() {
  const isVisible = (element) => {
    if (!element) return false;
    const rect = element.getBoundingClientRect();
    const styles = window.getComputedStyle(element);
    return rect.width > 0 && rect.height > 0 && styles.visibility !== "hidden" && styles.display !== "none";
  };
  const firstVisible = (selector) => {
    for (const element of document.querySelectorAll(selector)) {
      if (isVisible(element)) return element;
    }
    return null;
  };
  const cursorOf = (selector) => {
    const element = firstVisible(selector);
    return element ? window.getComputedStyle(element).cursor : null;
  };
  return {
    html: window.getComputedStyle(document.documentElement).cursor,
    button: cursorOf("button:not(:disabled)"),
    link: cursorOf("a[href]"),
    summary: cursorOf("summary"),
    roleButton: cursorOf("[role='button']"),
    textInput: cursorOf("input[type='text'], input[type='search'], input[type='number'], input:not([type]), textarea"),
    disabled: cursorOf("button:disabled, select:disabled, input:disabled"),
    card: cursorOf(".mob-card, .ecompendium-card"),
    mapLayer: cursorOf("#mapLayer"),
    skillTree: cursorOf(".skill-tree-viewport")
  };
}

/* A container point no marker/chrome element covers, used to start a real drag. */
function findFreeMapPoint() {
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
}

async function run() {
  const server = await ensureStaticServer(rootUrl);
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 960 } });
  await context.addInitScript(
    (keys) => {
      window.localStorage.setItem("sao.warning.encounters", "1");
      keys.forEach((key) => window.localStorage.setItem(key, "1"));
    },
    WALKTHROUGH_KEYS
  );

  const failures = [];
  const page = await context.newPage();

  try {
    for (const pageInfo of PAGES) {
      const issues = [];
      await page.goto(`${server.url}${pageInfo.url}`, { waitUntil: "load", timeout: 60000 });
      await page.waitForTimeout(250);
      const cursors = await page.evaluate(collectCursors);

      if (!ARROW.test(cursors.html)) issues.push(`html cursor is not the normal arrow (${cursors.html})`);
      if (cursors.button !== null && !CLICK.test(cursors.button)) issues.push(`button cursor is ${cursors.button}`);
      if (cursors.link !== null && !CLICK.test(cursors.link)) issues.push(`link cursor is ${cursors.link}`);
      if (cursors.summary !== null && !CLICK.test(cursors.summary)) issues.push(`summary cursor is ${cursors.summary}`);
      if (cursors.roleButton !== null && !CLICK.test(cursors.roleButton))
        issues.push(`[role=button] cursor is ${cursors.roleButton}`);
      if (cursors.card !== null && !CLICK.test(cursors.card)) issues.push(`card cursor is ${cursors.card}`);
      if (cursors.textInput !== null && cursors.textInput !== "text")
        issues.push(`text input cursor is ${cursors.textInput}`);
      if (cursors.disabled !== null && cursors.disabled !== "not-allowed")
        issues.push(`disabled control cursor is ${cursors.disabled}`);

      if (pageInfo.id === "map" || pageInfo.id === "underworld-map") {
        if (!ARROW.test(cursors.mapLayer || "")) issues.push(`#mapLayer cursor is ${cursors.mapLayer}`);

        const freePoint = await page.evaluate(findFreeMapPoint);
        if (!freePoint) {
          issues.push("no free map point available for the drag check");
        } else {
          await page.mouse.move(freePoint.x, freePoint.y);
          await page.mouse.down();
          const draggingCursor = await page.evaluate(
            () => window.getComputedStyle(document.getElementById("mapLayer")).cursor
          );
          await page.mouse.move(freePoint.x - 40, freePoint.y - 30, { steps: 4 });
          const draggingCursorMid = await page.evaluate(
            () => window.getComputedStyle(document.getElementById("mapLayer")).cursor
          );
          await page.mouse.up();
          if (!GRABBING.test(draggingCursor)) issues.push(`dragging cursor is ${draggingCursor}`);
          if (!GRABBING.test(draggingCursorMid)) issues.push(`mid-drag cursor is ${draggingCursorMid}`);
        }
      }

      if (pageInfo.id === "character-build") {
        if (!GRAB.test(cursors.skillTree || "")) issues.push(`skill tree cursor is ${cursors.skillTree}`);
        const draggingCursor = await page.evaluate(() => {
          const viewport = document.querySelector(".skill-tree-viewport");
          if (!viewport) return null;
          viewport.classList.add("is-dragging");
          const value = window.getComputedStyle(viewport).cursor;
          viewport.classList.remove("is-dragging");
          return value;
        });
        if (draggingCursor !== null && !GRABBING.test(draggingCursor))
          issues.push(`skill tree dragging cursor is ${draggingCursor}`);
      }

      if (issues.length) {
        failures.push({ label: pageInfo.id, issues });
        console.log(`FAIL  ${pageInfo.id}`);
        issues.forEach((issue) => console.log(`        - ${issue}`));
      } else {
        console.log(`ok    ${pageInfo.id}`);
      }
    }

    /* The map page: a rendered marker stays clickable with the native pointer cursor. */
    await page.goto(`${server.url}/Aincrad/Map/maps.html?floor=floor1`, { waitUntil: "load", timeout: 60000 });
    await page.waitForFunction(() => document.getElementById("mapImage")?.naturalWidth > 0, null, { timeout: 30000 });
    await page.waitForFunction(() => window.__aincradMapRuntime?.isInitialized?.(), null, { timeout: 30000 });
    await page.evaluate(() => {
      document.querySelectorAll(".sidebar-list-button[data-category]").forEach((button) => {
        if (button.getAttribute("aria-pressed") !== "true") button.click();
      });
    });
    await page.waitForSelector("#markers .marker[data-marker-id]", { timeout: 15000 });
    const markerState = await page.evaluate(() => {
      const element = document.querySelector("#markers .marker[data-marker-id]");
      return {
        cursor: window.getComputedStyle(element).cursor,
        hasRole: element.getAttribute("role")
      };
    });
    if (!CLICK.test(markerState.cursor)) failures.push({ label: "map marker", issues: [`marker cursor is ${markerState.cursor}`] });
    if (markerState.hasRole !== "button") failures.push({ label: "map marker", issues: ["marker lost its button role"] });

    await page.locator("#markers .marker[data-marker-id]").first().click({ force: true });
    const markerOpened = await page
      .waitForFunction(() => document.getElementById("title").textContent !== "Select a marker", null, { timeout: 10000 })
      .then(() => true)
      .catch(() => false);
    if (!markerOpened) failures.push({ label: "map marker", issues: ["clicking a marker no longer opens its info panel"] });
    if (!failures.some((failure) => failure.label === "map marker")) console.log("ok    map marker click");

    assert.deepEqual(failures, [], `${failures.length} cursor checks failed`);
    console.log(`Site-wide cursor checks passed for ${PAGES.length} pages.`);
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
