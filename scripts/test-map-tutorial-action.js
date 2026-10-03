"use strict";

const assert = require("node:assert/strict");
const { chromium } = require("playwright");
const { ensureStaticServer } = require("./harness-helpers");

const rootUrl = process.env.SAO_BASE_URL || "http://127.0.0.1:8080";
const tutorialUrl = "https://www.youtube.com/watch?v=W9nZ6u15yis";
const translatedLabels = {
  es: "Tutorial: cómo importar/exportar puntos de ruta",
  fr: "Tutoriel : importer/exporter des points de passage"
};
const pages = [
  {
    path: "/Aincrad/Map/maps.html?floor=floor1",
    translationKey: "page.maps.mapContextMenu.waypointTutorial"
  },
  {
    path: "/Fractured%20Underworld/Main%20UI/mainui.html",
    translationKey: "page.mainui.mapContextMenu.waypointTutorial"
  }
];

async function verifyMenu(browser, server, pageConfig) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 960 } });
  await context.addInitScript(() => {
    localStorage.setItem("sao.walkthrough.maps.completed", "1");
    localStorage.setItem("sao.walkthrough.mainui.completed", "1");
  });
  await context.route("https://www.youtube.com/**", (route) =>
    route.fulfill({ status: 200, contentType: "text/html", body: "" })
  );

  try {
    const page = await context.newPage();
    await page.goto(`${server.url}${pageConfig.path}`, { waitUntil: "load", timeout: 60000 });

    const menu = page.locator("#mapContextMenu");
    const exportAction = menu.locator("[data-map-action='journey-export']");
    const importAction = menu.locator("[data-map-action='journey-import']");
    const tutorial = menu.locator(`[data-i18n='${pageConfig.translationKey}']`);
    assert.equal(await exportAction.count(), 1, "JourneyMap export action remains in the menu");
    assert.equal(await importAction.count(), 1, "JourneyMap import action remains in the menu");
    assert.equal(await tutorial.count(), 1, "tutorial action exists in the menu");
    assert.equal(await tutorial.textContent(), "How to Import/Export Waypoints Tutorial");
    for (const [language, label] of Object.entries(translatedLabels)) {
      await page.evaluate((nextLanguage) => window.SAOI18n.setLanguage(nextLanguage), language);
      assert.equal(await tutorial.textContent(), label, `${language} tutorial label is localized`);
    }
    await page.evaluate(() => window.SAOI18n.setLanguage("en"));

    const structure = await tutorial.evaluate((link) => ({
      href: link.href,
      target: link.target,
      rel: link.rel,
      previousClass: link.previousElementSibling?.className,
      beforeDividerAction: link.previousElementSibling?.previousElementSibling?.dataset.mapAction,
      textDecoration: getComputedStyle(link).textDecorationLine,
      boxSizing: getComputedStyle(link).boxSizing,
      display: getComputedStyle(link).display,
      padding: getComputedStyle(link).padding
    }));
    assert.equal(structure.href, tutorialUrl, "tutorial uses the exact YouTube URL");
    assert.equal(structure.target, "_blank", "tutorial opens in a new tab");
    assert.ok(structure.rel.split(/\s+/).includes("noopener"), "new tab is isolated from the opener");
    assert.equal(structure.previousClass, "map-context-menu-divider", "tutorial follows the new divider");
    assert.equal(structure.beforeDividerAction, "journey-import", "divider separates tutorial from import action");
    assert.equal(structure.textDecoration, "none", "tutorial link has no default underline");
    assert.equal(structure.boxSizing, "border-box", "tutorial width includes its existing padding");
    assert.equal(structure.display, "block", "tutorial uses the full-width menu item layout");
    assert.equal(structure.padding, "9px 12px", "tutorial uses the existing menu item spacing");

    await menu.evaluate((element) => {
      element.hidden = false;
    });
    for (const width of [360, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      const bounds = await page.evaluate(() => {
        const panel = document.getElementById("mapContextMenu");
        const importItem = panel.querySelector("[data-map-action='journey-import']");
        const tutorialItem = panel.querySelector("[data-i18n$='.waypointTutorial']");
        const panelStyle = getComputedStyle(panel);
        return {
          importRight: importItem.getBoundingClientRect().right,
          tutorialRight: tutorialItem.getBoundingClientRect().right,
          panelInnerRight: panel.getBoundingClientRect().right - Number.parseFloat(panelStyle.borderRightWidth)
        };
      });
      assert.ok(Math.abs(bounds.tutorialRight - bounds.importRight) < 1, `${width}px viewport: item edges match`);
      assert.ok(bounds.tutorialRight <= bounds.panelInnerRight + 0.5, `${width}px viewport: item stays inside panel`);
    }
    await page.setViewportSize({ width: 1440, height: 960 });
    const [popup] = await Promise.all([page.waitForEvent("popup"), tutorial.click()]);
    await popup.waitForLoadState("domcontentloaded");
    assert.equal(popup.url(), tutorialUrl, "click opens the tutorial externally in a new tab");
    await popup.close();
  } finally {
    await context.close();
  }
}

async function run() {
  const server = await ensureStaticServer(rootUrl);
  const browser = await chromium.launch({ headless: true });

  try {
    for (const pageConfig of pages) await verifyMenu(browser, server, pageConfig);
    console.log("Map tutorial action regression tests passed.");
  } finally {
    await browser.close();
    if (!server.reused) await server.stop();
  }
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});