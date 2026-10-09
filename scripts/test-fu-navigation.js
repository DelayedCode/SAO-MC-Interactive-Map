const assert = require("node:assert/strict");
const { chromium } = require("playwright");
const { attachDiagnostics, describeUrl, ensureStaticServer } = require("./harness-helpers");

const rootUrl = process.env.SAO_BASE_URL || "http://127.0.0.1:8080";
const mainuiUrl = `${rootUrl}/Fractured%20Underworld/Main%20UI/mainui.html`;
const compendiumUrl = `${rootUrl}/Fractured%20Underworld/Compendium/compendium.html`;

async function openPage(browser, url) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  await context.addInitScript(() => {
    window.localStorage.setItem("sao.walkthrough.mainui.completed", "1");
  });
  const page = await context.newPage();
  const diagnostics = attachDiagnostics(page);
  await page.goto(url, { waitUntil: "load" });
  return { context, page, ...diagnostics };
}

async function assertLanguageIntegrity(page, label) {
  const state = await page.evaluate(() => ({
    lang: document.documentElement.getAttribute("lang"),
    rawKeys: document.body.innerText.match(/\b(?:ui|page)\.[a-zA-Z]/g) || []
  }));
  assert.ok(state.lang, `${label}: html[lang] is present`);
  assert.deepEqual(state.rawKeys, [], `${label}: no raw i18n keys leak`);
  return state.lang;
}

(async () => {
  await ensureStaticServer();
  const browser = await chromium.launch({ headless: true });
  const results = [];
  try {
    for (const island of ["playerIsland", "iceCave"]) {
      // --- menu -> hub (no floor, no dataset) ------------------------------
      const menuSession = await openPage(browser, `${mainuiUrl}?floor=${island}`);
      const menuButton = menuSession.page.locator('button[data-nav-target="menu"]');
      assert.equal(await menuButton.count(), 1, `${island}: FU menu is a wired nav button`);
      await menuButton.click();
      await menuSession.page.waitForURL((url) => decodeURIComponent(url.pathname) === "/index.html", { timeout: 8000 });
      await menuSession.page.waitForTimeout(200);
      const menuLanding = describeUrl(menuSession.page.url());
      assert.equal(menuLanding.pathname, "/index.html", `${island}: menu lands on the hub`);
      assert.equal(menuLanding.floor, null, `${island}: menu drops the island`);
      assert.equal(menuLanding.dataset, null, `${island}: menu adds no dataset`);
      await assertLanguageIntegrity(menuSession.page, `${island}/menu`);
      assert.deepEqual(menuSession.errors, [], `${island}/menu: no console errors`);
      assert.deepEqual(menuSession.failedRequests, [], `${island}/menu: no failed requests`);
      results.push({ island, target: "menu", url: `${menuLanding.pathname}${menuLanding.search}` });
      await menuSession.context.close();

      // --- compendium -> direct navigation, island preserved, no re-prompt --
      const compSession = await openPage(browser, `${mainuiUrl}?floor=${island}`);
      await compSession.page.locator('button[data-nav-target="compendium"]').click();
      await compSession.page.waitForURL(
        (url) => decodeURIComponent(url.pathname) === "/Fractured Underworld/Compendium/compendium.html",
        { timeout: 8000 }
      );
      await compSession.page.waitForTimeout(250);
      const compLanding = describeUrl(compSession.page.url());
      assert.equal(
        compLanding.pathname,
        "/Fractured Underworld/Compendium/compendium.html",
        `${island}: compendium landing`
      );
      assert.equal(compLanding.floor, island, `${island}: compendium preserves the island`);
      assert.equal(
        await compSession.page.locator(".sao-dataset-dialog").count(),
        0,
        `${island}: compendium does not re-ask for the data mode`
      );
      assert.deepEqual(compSession.errors, [], `${island}/compendium: no console errors`);
      assert.deepEqual(compSession.failedRequests, [], `${island}/compendium: no failed requests`);
      results.push({ island, target: "compendium", url: `${compLanding.pathname}${compLanding.search}` });
      await compSession.context.close();

      // --- towerDefense -> direct navigation, island preserved, no re-prompt -
      const tdSession = await openPage(browser, `${mainuiUrl}?floor=${island}`);
      await tdSession.page.locator('button[data-nav-target="towerDefense"]').click();
      await tdSession.page.waitForURL(
        (url) => decodeURIComponent(url.pathname) === "/Fractured Underworld/Tower Defense/towerdefense.html",
        { timeout: 8000 }
      );
      await tdSession.page.waitForTimeout(250);
      const tdLanding = describeUrl(tdSession.page.url());
      assert.equal(
        tdLanding.pathname,
        "/Fractured Underworld/Tower Defense/towerdefense.html",
        `${island}: tower defense landing`
      );
      assert.equal(tdLanding.floor, island, `${island}: tower defense preserves the island`);
      assert.equal(
        await tdSession.page.locator(".sao-dataset-dialog").count(),
        0,
        `${island}: tower defense does not re-ask for the data mode`
      );
      assert.deepEqual(tdSession.errors, [], `${island}/towerDefense: no console errors`);
      assert.deepEqual(tdSession.failedRequests, [], `${island}/towerDefense: no failed requests`);
      results.push({ island, target: "towerDefense", url: `${tdLanding.pathname}${tdLanding.search}` });
      await tdSession.context.close();
    }

    // --- FU Compendium navigation ------------------------------------------
    const compendium = await openPage(browser, `${compendiumUrl}?floor=iceCave`);
    const activeTarget = await compendium.page.evaluate(() => {
      const current = document.querySelector('button[data-nav-target][aria-current="page"]');
      return current ? current.dataset.navTarget : null;
    });
    assert.equal(activeTarget, "compendium", "FU Compendium highlights its own section as active");

    // "Go back to Map" (mainui) -> direct navigation, floor preserved, no dialog
    await compendium.page.locator('button[data-nav-target="mainui"]').click();
    await compendium.page.waitForURL(
      (url) => decodeURIComponent(url.pathname) === "/Fractured Underworld/Main UI/mainui.html",
      { timeout: 8000 }
    );
    await compendium.page.waitForTimeout(250);
    const mainuiLanding = describeUrl(compendium.page.url());
    assert.equal(mainuiLanding.pathname, "/Fractured Underworld/Main UI/mainui.html", "compendium back-to-map landing");
    assert.equal(mainuiLanding.floor, "iceCave", "compendium back-to-map preserves the island");
    assert.equal(mainuiLanding.dataset, null, "compendium back-to-map adds no dataset");
    await assertLanguageIntegrity(compendium.page, "compendium/mainui");
    assert.deepEqual(compendium.errors, [], "compendium/mainui: no console errors");
    assert.deepEqual(compendium.failedRequests, [], "compendium/mainui: no failed requests");
    results.push({ island: "iceCave", target: "mainui", url: `${mainuiLanding.pathname}${mainuiLanding.search}` });
    await compendium.context.close();

    console.log(JSON.stringify({ results, status: "passed" }, null, 2));
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
