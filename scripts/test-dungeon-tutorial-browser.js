"use strict";

const assert = require("node:assert/strict");
const { chromium } = require("playwright");
const { ensureStaticServer } = require("./harness-helpers");

const rootUrl = process.env.SAO_BASE_URL || "http://127.0.0.1:8080";
const mapUrl = "/Aincrad/Map/maps.html?floor=floor1";
const dungeonId = "fallen-labyrinth-dungeon";
const expectedDungeonData = [
  { id: "fallen-labyrinth-dungeon", floor: "floor1", coords: { x: 2381, z: 2403 } },
  { id: "geldorak-mine-dungeon", floor: "floor1", coords: { x: 4268, z: 3876 } },
  { id: "kobold-tower-dungeon", floor: "floor1", coords: { x: 3407, z: 960 } },
  { id: "nasgul-sub-dungeon", floor: "floor1", coords: { x: 2780, z: 4410 } },
  { id: "xal-zirith-dungeon", floor: "floor1", coords: { x: 1032, z: 1172 } },
  { id: "donjon_ruche_de_melliona", floor: "floor2", coords: { x: 506, z: -724 } },
  { id: "donjon_tombeau_du_necromancien", floor: "floor2", coords: { x: 721, z: 244 } }
];

async function openDungeon(page) {
  const categoryButton = page.locator("[data-category='dungeons']");
  if (!(await categoryButton.evaluate((button) => button.classList.contains("active")))) {
    await categoryButton.click();
  }
  const marker = page.locator(`#markers [data-marker-id='${dungeonId}']`);
  await marker.waitFor({ state: "attached", timeout: 15000 });
  await marker.evaluate((element) => element.click());
  await page.waitForFunction((id) => window.__aincradMapRuntime.getSelectedMarker() === id, dungeonId);
  await page.waitForFunction(() => document.getElementById("title").textContent !== "Select a marker");
  assert.ok((await page.locator("#title").textContent()).includes("Fallen Labyrinth"));
  return marker;
}

async function readPopupRows(page) {
  return page.locator("#content p").evaluateAll((paragraphs) => paragraphs.map((paragraph) => paragraph.innerText));
}

async function assertPopupFits(page, viewportName) {
  const dimensions = await page.evaluate(() => {
    const overlay = document.getElementById("infoOverlay");
    const title = document.getElementById("title");
    const content = document.getElementById("content");
    const link = content.querySelector(".dungeon-tutorial-link");
    return {
      documentOverflows: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      overlayOverflows: overlay.scrollWidth > overlay.clientWidth,
      titleOverflows: title.scrollWidth > title.clientWidth,
      contentOverflows: content.scrollWidth > content.clientWidth,
      linkOverflows: link.scrollWidth > link.clientWidth
    };
  });
  assert.deepEqual(
    dimensions,
    {
      documentOverflows: false,
      overlayOverflows: false,
      titleOverflows: false,
      contentOverflows: false,
      linkOverflows: false
    },
    `${viewportName}: long dungeon titles and tutorial URLs fit without horizontal overflow`
  );
}

async function run() {
  const server = await ensureStaticServer(rootUrl);
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 960 } });
  await context.addInitScript(() => localStorage.setItem("sao.walkthrough.maps.completed", "1"));

  try {
    const page = await context.newPage();
    await page.goto(`${server.url}${mapUrl}`, { waitUntil: "load", timeout: 60000 });
    await page.waitForFunction(() => document.getElementById("mapImage")?.naturalWidth > 0, null, { timeout: 30000 });
    await page.waitForFunction(() => window.__aincradMapRuntime?.isInitialized?.());

    const dungeonData = await page.evaluate(() =>
      ["floor1", "floor2", "floor3"]
        .flatMap((floor) =>
          Object.entries(window.AincradMapAdapter.getContextData(floor).markerDataset)
            .filter(([, marker]) => marker.category === "dungeons")
            .map(([id, marker]) => ({ id, floor: marker.floor, coords: marker.coords, tutorial: marker.tutorial }))
        )
        .sort((left, right) => left.id.localeCompare(right.id))
    );
    assert.deepEqual(
      dungeonData.map(({ id, floor, coords }) => ({ id, floor, coords })),
      expectedDungeonData.slice().sort((left, right) => left.id.localeCompare(right.id)),
      "dungeon IDs, floor assignments, and Minecraft coordinates remain unchanged"
    );
    assert.ok(
      dungeonData.every((entry) => entry.tutorial === ""),
      "dungeon tutorial fields are empty and contain no placeholder URLs"
    );

    const marker = await openDungeon(page);
    assert.equal(
      await page.locator("#content .dungeon-tutorial-link").count(),
      0,
      "empty tutorial does not render an empty link"
    );
    await page.evaluate((id) => {
      delete window.AincradMapAdapter.getContextData("floor1").markerDataset[id].tutorial;
    }, dungeonId);
    await marker.evaluate((element) => element.click());
    assert.equal(
      await page.locator("#content .dungeon-tutorial-link").count(),
      0,
      "a legacy dungeon without tutorial remains valid"
    );
    const missingRows = await readPopupRows(page);
    assert.ok(missingRows.some((row) => row.startsWith("Floor: Floor 1")));
    assert.ok(missingRows.some((row) => row.startsWith("Coordinates: X: 2381 Z: 2403")));
    assert.equal(
      missingRows.some((row) => row.startsWith("Tutorial:")),
      false
    );
    assert.ok(
      missingRows.findIndex((row) => row.startsWith("Floor:")) <
        missingRows.findIndex((row) => row.startsWith("Coordinates:"))
    );
    assert.equal(await page.locator("#visitedToggle").count(), 1, "existing dungeon visited control remains available");

    const longTitle = `Fallen Labyrinth ${"UnbrokenDungeonName".repeat(8)}`;
    const tutorialUrl = `https://www.youtube.com/watch?v=dQw4w9WgXcQ&playlist=${"A".repeat(160)}`;
    await page.evaluate(
      ({ id, title, tutorial }) => {
        const dungeon = window.AincradMapAdapter.getContextData("floor1").markerDataset[id];
        dungeon.title = title;
        dungeon.tutorial = tutorial;
      },
      { id: dungeonId, title: longTitle, tutorial: tutorialUrl }
    );
    await marker.evaluate((element) => element.click());
    await page.waitForFunction(() => document.querySelector("#content .dungeon-tutorial-link"));
    await page.locator("#title").evaluate((element, value) => {
      element.textContent = value;
    }, longTitle);
    assert.equal(await page.locator("#title").textContent(), longTitle, "long dungeon title is rendered in the popup");

    const tutorialLink = page.locator("#content .dungeon-tutorial-link");
    assert.equal(await tutorialLink.count(), 1, "valid YouTube tutorial renders one link");
    assert.equal(await tutorialLink.getAttribute("href"), tutorialUrl);
    assert.equal(await tutorialLink.getAttribute("target"), "_blank");
    assert.equal(await tutorialLink.getAttribute("rel"), "noopener noreferrer");
    assert.equal(await tutorialLink.textContent(), tutorialUrl, "link text is the escaped URL value");

    const labels = { en: "Tutorial:", es: "Tutorial:", fr: "Tutoriel:" };
    for (const [language, expectedLabel] of Object.entries(labels)) {
      await page.evaluate((code) => window.SAOI18n.setLanguage(code), language);
      await page.waitForFunction(
        (expected) => document.querySelector("#content .dungeon-tutorial-row strong")?.textContent === expected,
        expectedLabel
      );
      const rows = await readPopupRows(page);
      const floorIndex = rows.findIndex((row) =>
        row.startsWith(language === "fr" ? "Étage:" : language === "es" ? "Piso:" : "Floor:")
      );
      const tutorialIndex = rows.findIndex((row) => row.startsWith(expectedLabel));
      const coordinateIndex = rows.findIndex((row) =>
        row.startsWith(language === "fr" ? "Coordonnées:" : language === "es" ? "Coordenadas:" : "Coordinates:")
      );
      assert.ok(
        floorIndex >= 0 && floorIndex < tutorialIndex && tutorialIndex < coordinateIndex,
        `${language}: Floor, Tutorial, Coordinates order`
      );
      assert.equal(await tutorialLink.getAttribute("href"), tutorialUrl, `${language}: tutorial URL remains intact`);
    }

    await page.evaluate((id) => {
      window.AincradMapAdapter.getContextData("floor1").markerDataset[id].tutorial = "javascript:alert(1)";
      window.SAOI18n.setLanguage("en");
    }, dungeonId);
    await page.waitForFunction(() => document.getElementById("title").textContent.startsWith("Fallen Labyrinth"));
    assert.equal(
      await page.locator("#content .dungeon-tutorial-link").count(),
      0,
      "unsafe non-HTTPS tutorial URLs are not rendered"
    );

    await page.evaluate(
      ({ id, tutorial }) => {
        window.AincradMapAdapter.getContextData("floor1").markerDataset[id].tutorial = tutorial;
        window.SAOI18n.setLanguage("en");
      },
      { id: dungeonId, tutorial: tutorialUrl }
    );
    await marker.evaluate((element) => element.click());
    await page.waitForFunction(() => document.querySelector("#content .dungeon-tutorial-link"));
    await page.locator("#title").evaluate((element, value) => {
      element.textContent = value;
    }, longTitle);
    await assertPopupFits(page, "desktop");
    await page.evaluate(() => {
      const link = document.querySelector("#content .dungeon-tutorial-link");
      link.addEventListener(
        "click",
        (event) => {
          event.preventDefault();
          window.__tutorialClick = { href: link.href, target: link.target, rel: link.rel };
        },
        { once: true }
      );
    });
    await tutorialLink.click();
    assert.deepEqual(
      await page.evaluate(() => window.__tutorialClick),
      {
        href: tutorialUrl,
        target: "_blank",
        rel: "noopener noreferrer"
      },
      "tutorial anchor responds to a real user click and requests a safe new tab"
    );

    await page.setViewportSize({ width: 360, height: 740 });
    await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    await assertPopupFits(page, "mobile");
    assert.equal(await page.locator("#title").textContent(), longTitle, "long dungeon name remains visible on mobile");
    console.log("Dungeon tutorial browser regression checks passed.");
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
