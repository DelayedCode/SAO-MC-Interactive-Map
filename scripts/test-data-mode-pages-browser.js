"use strict";

/* World-level data mode, end to end.

   The Welcome Mat chooses Beta-Test Data or Current Data once per world; every section then reads
   that stored mode instead of asking again. This drives the real pages: the hub mode chooser, the
   stored per-world mode, the map information banner, the Current empty states, the Main Quest
   migration and the Aincrad/FU separation. */

const assert = require("node:assert/strict");
const { chromium } = require("playwright");
const { attachDiagnostics, ensureStaticServer } = require("./harness-helpers");

const rootUrl = process.env.SAO_BASE_URL || "http://127.0.0.1:8080";
const HUB = "/index.html";
const AINCRAD_MAP = "/Aincrad/Map/maps.html";
const BESTIARY = "/Aincrad/Bestiary/bestiary.html";
const EQUIPMENT = "/Aincrad/eCompendium/ecompendium.html";
const QUESTS = "/Aincrad/Quests/quests.html";
const MISCINFO = "/Aincrad/Misc Info/miscinfo.html";
const PATCHNOTES = "/Aincrad/Patchnotes/patchnotes.html";
const FU_TD = "/Fractured Underworld/Tower Defense/towerdefense.html";
const FU_COMPENDIUM = "/Fractured Underworld/Compendium/compendium.html";

const AINCRAD_CARD = "button.mode-button.aincrad";
const FU_CARD = "button.mode-button.underworld";

async function dismissWarning(page) {
  await page.waitForFunction(() => Boolean(document.querySelector(".sao-warning-overlay")), null, { timeout: 15000 });
  await page.locator(".sao-warning-okay").click({ timeout: 25000 });
  await page.waitForFunction(() => !document.querySelector(".sao-warning-overlay"), null, { timeout: 8000 });
}

async function openHub(page, baseUrl) {
  await page.goto(`${baseUrl}${HUB}`, { waitUntil: "load", timeout: 60000 });
  await dismissWarning(page);
}

/* The map banner is written during map initialisation, so wait for the active key before reading it. */
async function waitForBannerMode(page, mode) {
  await page.waitForFunction(
    (expected) =>
      document.getElementById("mapDataModeBanner")?.getAttribute("data-i18n") ===
      `page.maps.dataModeBanner.${expected}`,
    mode,
    { timeout: 20000 }
  );
  return page.locator("#mapDataModeBanner").textContent();
}

async function assertBanner(page, mode, label) {
  const text = await waitForBannerMode(page, mode);
  const expected = await page.evaluate((key) => window.SAOI18n.t(key), `page.maps.dataModeBanner.${mode}`);
  assert.equal(text.trim(), expected.trim(), `${label}: banner shows the ${mode} text`);
}

/* The hub asks for the mode every time a world card is used, so the same entry point both sets the
   first mode and re-selects a different one. */
async function enterWorldFromHub(page, cardSelector, modeLabel) {
  await page.locator(cardSelector).click();
  await page.waitForSelector(".sao-dataset-dialog", { timeout: 6000 });
  const labels = await page.locator(".sao-dataset-choice strong").allTextContents();
  assert.deepEqual(labels, ["Beta-Test Data", "Current Data"], "the hub offers both data modes");
  await Promise.all([
    page.waitForURL((url) => !url.pathname.endsWith("/index.html"), { timeout: 10000 }),
    page.locator(".sao-dataset-choice", { hasText: modeLabel }).first().click()
  ]);
  await page.waitForLoadState("load");
}

async function readMode(page, world) {
  return page.evaluate((key) => localStorage.getItem(`sao.dataset.${key}`), world);
}

async function readStoredModes(page) {
  return page.evaluate(() => ({
    aincrad: localStorage.getItem("sao.dataset.aincrad"),
    underworld: localStorage.getItem("sao.dataset.underworld")
  }));
}

async function run() {
  const server = await ensureStaticServer(rootUrl);
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 960 } });
  await context.addInitScript(() => {
    /* The guided tours are not part of this contract; skipping them keeps the hub clickable. */
    localStorage.setItem("sao.walkthrough.index.completed", "1");
    localStorage.setItem("sao.walkthrough.maps.completed", "1");
    localStorage.setItem("sao.walkthrough.mainui.completed", "1");
    /* Past the encounter threshold the warning's Okay button becomes an immediate Skip. */
    localStorage.setItem("sao.warning.encounters", "5");
  });

  try {
    const page = await context.newPage();
    const diagnostics = attachDiagnostics(page);

    /* --- Welcome Mat ------------------------------------------------------ */
    await openHub(page, server.url);
    assert.equal(
      await page.locator(".guild-badge span").textContent(),
      "Guild: Moonlit Black Cats",
      "the Welcome Mat guild line names the Moonlit Black Cats"
    );
    assert.deepEqual(await readStoredModes(page), { aincrad: null, underworld: null }, "no mode is stored yet");

    /* --- Aincrad -> Current ----------------------------------------------- */
    await enterWorldFromHub(page, AINCRAD_CARD, "Current Data");
    assert.equal(await readMode(page, "aincrad"), "current", "choosing Current stores it for Aincrad");
    await assertBanner(page, "current", "Aincrad Current");
    assert.deepEqual(
      await page.evaluate(() => ({
        inHeader: Boolean(document.querySelector(".header-main > #mapDataModeBanner")),
        inMapBox: Boolean(document.querySelector("#mapContainer #mapDataModeBanner"))
      })),
      { inHeader: true, inMapBox: false },
      "the banner sits in the map header, not over the map image"
    );
    assert.equal(
      await page.evaluate(() => window.AincradMapAdapter.getContextData("floor1").mobAreaDataset.length),
      0,
      "Current carries no Beta mob areas"
    );
    assert.ok(
      await page.evaluate(() =>
        Object.values(window.AincradMapAdapter.getContextData("floor1").markerDataset).every(
          (marker) => marker.category === "mainQuests" || marker.dataset === "current"
        )
      ),
      "the Current map dataset keeps only the Main Questline and the Current waypoints"
    );

    /* Enabled Beta-only categories stay empty; the Main Quest waypoints still render. */
    for (const category of ["biomes", "mobAreas", "sideQuests", "mainQuests"]) {
      await page.locator(`[data-category='${category}']`).click();
      await page.waitForFunction((name) => window.__aincradMapRuntime.getCategoryState(name), category);
    }
    await page.waitForFunction(() => document.querySelectorAll("#markers .marker").length > 0, null, {
      timeout: 10000
    });
    const renderedIds = await page.evaluate(() =>
      Array.from(document.querySelectorAll("#markers .marker")).map((element) => element.dataset.markerId)
    );
    assert.ok(
      renderedIds.every((id) => id.startsWith("mq-") || id.startsWith("cluster:mq-")),
      `Current renders only Main Quest waypoints (got ${renderedIds.slice(0, 6).join(", ")})`
    );
    assert.ok(
      renderedIds.some((id) => id.startsWith("mq-")),
      "Current renders the Main Quest waypoints themselves"
    );

    /* The Current accessory waypoints sit behind three category buttons that already belong to the
       map: the regular Accessories Blacksmith, the Secret Accessory Blacksmith and the Occult
       Merchant. Each one is enabled on its own and renders exactly its own Current waypoints. */
    const currentWaypointCategories = {
      accessoriesBlacksmith: ["Iron Accessories", "Copper Accessories", "Nepenthes Accessories", "Elite Treant Accessories"],
      secretAccessoryBlacksmith: ["Bracelet of Ice", "Necklace of Aragorn", "Sticky Ring", "Skeleton Skull", "Belt of the Stags", "Ring of the Leviathan"],
      occultMerchants: [
        "Occult Merchant - Gloves",
        "Occult Merchant - Bracelet",
        "Occult Merchant - Ring",
        "Occult Merchant - Amulet",
        "Occult Merchant - Artifacts"
      ],
      lootBuyers: [
        "Magical & Icy Loot Buyer",
        "Virelune - Loot Buyer",
        "Vallhat - Loot Buyer",
        "Ika Citadel - Loot Buyer",
        "Boar and Wolf loot buyer",
        "Mizunari Loot Buyer",
        "Geldorack Mine Dungeon - Loot Buyer",
        "Cursed Ruins - Loot Buyer",
        "Cursed Ruins - Loot Buyer (2)",
        "Hanaka - Loot Buyer",
        "Labyrinth of the Fallen - Loot Buyer",
        "Labyrinth of the Fallen (2) - Loot Buyer",
        "Aragorn's Lair - Loot Buyer"
      ],
      toolMerchants: ["Starting Merchant", "F1 - Starting Town - Tools"],
      keyBlacksmith: [
        "F1 - Geldorack Dungeon Guard - Starting Town",
        "F1 - Fallen Labyrinth Dungeon Guard - Tolbana",
        "F1 - Xal'Zirith Dungeon Guard - Candelia"
      ],
      dungeons: ["Kobold Dungeon - Loot Info"]
    };
    for (const [category, titles] of Object.entries(currentWaypointCategories)) {
      const button = page.locator(`.sidebar-list-button[data-category='${category}']`);
      assert.equal(await button.count(), 1, `the Current map lists the ${category} category`);
      const buttonLabel = await button.evaluate((element) => {
        const clone = element.cloneNode(true);
        clone.querySelector(".marker-count")?.remove();
        return clone.textContent.trim();
      });
      assert.equal(
        buttonLabel,
        await page.evaluate((name) => window.SAOI18n.t(`page.maps.categories.${name}`), category),
        `the ${category} button uses its localized label`
      );
      assert.deepEqual(
        await page.evaluate(
          (name) =>
            Object.values(window.AincradMapAdapter.getContextData("floor1").markerDataset)
              .filter((marker) => marker.category === name)
              .map((marker) => marker.title)
              .sort(),
          category
        ),
        [...titles].sort(),
        `the Current marker dataset carries exactly the ${category} waypoints`
      );
      const expectedMarkerIds = await page.evaluate(
        (name) =>
          Object.entries(window.AincradMapAdapter.getContextData("floor1").markerDataset)
            .filter(([, marker]) => marker.category === name)
            .map(([id]) => id)
            .sort(),
        category
      );
      await page.locator("#clearFilters").click();
      await button.click();
      await page.waitForFunction((name) => window.__aincradMapRuntime.getCategoryState(name), category);
      await page.waitForFunction(() => document.querySelectorAll("#markers .marker").length > 0, null, {
        timeout: 10000
      });
      /* Close waypoints collapse into a cluster marker, so the rendered ids are checked for
         membership rather than for an exact one-to-one match. */
      const renderedIds = await page.evaluate(() =>
        Array.from(document.querySelectorAll("#markers .marker")).map((element) => element.dataset.markerId)
      );
      renderedIds.forEach((id) =>
        assert.ok(
          expectedMarkerIds.includes(id.replace(/^cluster:/, "")),
          `${id} rendered by the ${category} category belongs to it`
        )
      );
    }

    /* The Beta-only categories keep their buttons in Beta but have no Current Data waypoints, so
       their sidebar buttons are hidden while Current Data is active. */
    const betaOnlyCategories = [
      "weaponsmith",
      "runeCraftsmen",
      "refaire",
      "ingotBlacksmith",
      "armorBlacksmith",
      "weaponSellers"
    ];
    assert.deepEqual(
      await page.evaluate(
        (names) =>
          names.filter((name) => {
            const button = document.querySelector(`.sidebar-list-button[data-category='${name}']`);
            return (button?.closest("li") || button)?.hidden === true;
          }),
        betaOnlyCategories
      ),
      betaOnlyCategories,
      "the Beta-only category buttons are hidden in Current Data"
    );

    /* --- Sections keep the stored mode without re-asking ------------------- */
    await page.locator("button[data-nav-target='bestiary']").click();
    await page.waitForURL((url) => url.pathname.endsWith("/Aincrad/Bestiary/bestiary.html"), { timeout: 10000 });
    assert.equal(await page.locator(".sao-dataset-dialog").count(), 0, "the Bestiary does not re-ask for a mode");
    await page.waitForSelector("#mobList .empty-state", { timeout: 10000 });
    assert.equal(await page.locator("#mobList .mob-card").count(), 0, "Current Bestiary is empty");

    await page.goto(`${server.url}${EQUIPMENT}?floor=floor1`, { waitUntil: "load", timeout: 60000 });
    assert.equal(await page.locator(".sao-dataset-dialog").count(), 0, "Equipment does not re-ask for a mode");
    await page.waitForSelector("#entryList .empty-state", { timeout: 10000 });
    assert.equal(await page.locator("#entryList .ecompendium-card").count(), 0, "Current Equipment is empty");

    await page.goto(`${server.url}${QUESTS}?floor=floor1`, { waitUntil: "load", timeout: 60000 });
    await page.waitForFunction(() => document.querySelectorAll("#questTableRoot tbody tr").length > 0);
    assert.ok((await page.locator("#questTableRoot tbody tr").count()) > 0, "Current Quests show the Main Questline");
    await page.locator("button[data-quest-type='side']").click();
    await page.waitForFunction(() => document.querySelectorAll("#questTableRoot tbody tr").length === 0);
    assert.equal(await page.locator("#questTableRoot tbody tr").count(), 0, "Current Side Quests are empty");

    await page.goto(`${server.url}${MISCINFO}`, { waitUntil: "load", timeout: 60000 });
    await page.waitForSelector("#progressionTableRoot .empty-state", { timeout: 10000 });
    assert.equal(await page.locator("#progressionTableRoot table").count(), 0, "Current Misc. Info shows no Beta table");

    await page.goto(`${server.url}${PATCHNOTES}`, { waitUntil: "load", timeout: 60000 });
    await page.waitForFunction(() => document.getElementById("patchnotesList").childElementCount > 0);
    const currentPatchnotes = await page.evaluate(() => document.getElementById("patchnotesList").childElementCount);
    assert.ok(currentPatchnotes > 0, "Patchnotes stay available in Current");
    assert.equal(await page.locator(".sao-dataset-dialog").count(), 0, "Patchnotes never ask for a data mode");

    /* Reopening the map keeps the mode that was chosen at the Welcome Mat. */
    await page.goto(`${server.url}${AINCRAD_MAP}`, { waitUntil: "load", timeout: 60000 });
    await assertBanner(page, "current", "Aincrad Current after reopening the map");
    assert.equal(await readMode(page, "aincrad"), "current", "the stored mode survives a reload");

    /* The banner follows the active language as well as the active mode. */
    await page.evaluate(() => window.SAOI18n.setLanguage("es"));
    await page.waitForFunction(
      () =>
        document.getElementById("mapDataModeBanner").textContent.trim() ===
        window.SAOI18n.t("page.maps.dataModeBanner.current")
    );
    assert.equal(
      (await page.locator("#mapDataModeBanner").textContent()).trim(),
      await page.evaluate(() => window.SAOI18n.t("page.maps.dataModeBanner.current")),
      "the banner follows a language change"
    );
    await page.evaluate(() => window.SAOI18n.setLanguage("en"));
    await assertBanner(page, "current", "Aincrad Current after switching back to English");

    /* --- Back to the hub, re-choose Aincrad -> Beta ------------------------ */
    await openHub(page, server.url);
    await enterWorldFromHub(page, AINCRAD_CARD, "Beta-Test Data");
    assert.equal(await readMode(page, "aincrad"), "beta", "re-choosing from the hub overwrites the mode");
    await assertBanner(page, "beta", "Aincrad Beta");
    assert.equal(await readMode(page, "underworld"), null, "the Aincrad choice never touches FU");

    /* Beta drops the Main Questline waypoints but keeps the rest of its map data. */
    assert.ok(
      await page.evaluate(() => {
        const markers = Object.values(window.AincradMapAdapter.getContextData("floor1").markerDataset);
        return (
          markers.length > 0 &&
          markers.every((marker) => marker.category !== "mainQuests" && marker.dataset !== "current")
        );
      }),
      "the Beta map dataset keeps its own waypoints and drops the Main Questline and the Current waypoints"
    );
    await page.locator("[data-category='mainQuests']").click();
    await page.waitForFunction((name) => window.__aincradMapRuntime.getCategoryState(name), "mainQuests");
    await page.waitForTimeout(400);
    assert.equal(
      await page.evaluate(
        () =>
          Array.from(document.querySelectorAll("#markers .marker")).filter((element) =>
            (element.dataset.markerId || "").startsWith("mq-")
          ).length
      ),
      0,
      "Beta renders no Main Quest waypoints"
    );

    /* The Beta-only category buttons are all back in Beta. */
    assert.deepEqual(
      await page.evaluate(
        (names) =>
          names.filter((name) => {
            const button = document.querySelector(`.sidebar-list-button[data-category='${name}']`);
            const row = button?.closest("li");
            return Boolean(button) && !(row || button).hidden;
          }),
        betaOnlyCategories
      ),
      betaOnlyCategories,
      "the Beta-only category buttons stay visible in Beta Data"
    );

    await page.goto(`${server.url}${BESTIARY}?floor=floor1`, { waitUntil: "load", timeout: 60000 });
    await page.waitForFunction(() => document.querySelectorAll("#mobList .mob-card").length > 0);
    assert.ok((await page.locator("#mobList .mob-card").count()) > 0, "Beta Bestiary shows Beta data");

    await page.goto(`${server.url}${EQUIPMENT}?floor=floor1`, { waitUntil: "load", timeout: 60000 });
    await page.waitForFunction(() => document.querySelectorAll("#entryList .ecompendium-card").length > 0);
    assert.ok((await page.locator("#entryList .ecompendium-card").count()) > 0, "Beta Equipment shows Beta data");

    await page.goto(`${server.url}${QUESTS}?floor=floor1`, { waitUntil: "load", timeout: 60000 });
    await page.waitForFunction(() => document.querySelectorAll("#questTableRoot tbody tr").length > 0);
    assert.ok((await page.locator("#questTableRoot tbody tr").count()) > 0, "Beta Side Quests show Beta data");
    await page.locator("button[data-quest-type='main']").click();
    assert.equal(
      await page.locator("#questTableRoot tbody tr").count(),
      0,
      "Beta Quests have no Main Questline entries"
    );

    await page.goto(`${server.url}${MISCINFO}`, { waitUntil: "load", timeout: 60000 });
    await page.waitForSelector("#progressionTableRoot table.progression-table", { timeout: 10000 });
    assert.equal(await page.locator("#progressionTableRoot .empty-state").count(), 0, "Beta Misc. Info shows its table");

    await page.goto(`${server.url}${PATCHNOTES}`, { waitUntil: "load", timeout: 60000 });
    await page.waitForFunction(() => document.getElementById("patchnotesList").childElementCount > 0);
    assert.equal(
      await page.evaluate(() => document.getElementById("patchnotesList").childElementCount),
      currentPatchnotes,
      "Patchnotes are identical in Beta and Current"
    );

    /* --- FU keeps its own mode -------------------------------------------- */
    await openHub(page, server.url);
    await enterWorldFromHub(page, FU_CARD, "Beta-Test Data");
    assert.deepEqual(
      await readStoredModes(page),
      { aincrad: "beta", underworld: "beta" },
      "entering FU only writes the FU mode"
    );
    await assertBanner(page, "beta", "FU Beta");
    assert.deepEqual(
      await page.evaluate(() => ({
        inHeader: Boolean(document.querySelector(".header-main > #mapDataModeBanner")),
        inMapBox: Boolean(document.querySelector("#mapContainer #mapDataModeBanner"))
      })),
      { inHeader: true, inMapBox: false },
      "the FU banner sits in the map header, not over the map image"
    );
    /* The FU markers are its Main Questline, so Beta must render none of them. */
    assert.equal(
      await page.evaluate(
        () => Object.keys(window.UnderworldMapAdapter.getContextData("playerIsland").markerDataset).length
      ),
      0,
      "FU Beta drops the Fractured Underworld Main Questline"
    );

    await page.goto(`${server.url}${FU_TD}`, { waitUntil: "load", timeout: 60000 });
    await page.waitForFunction(() => document.getElementById("towerDefenseShopList").childElementCount > 0);
    assert.ok(
      (await page.evaluate(() => document.getElementById("towerDefenseShopList").childElementCount)) > 0,
      "FU Tower Defense shows Beta data in Beta mode"
    );

    await openHub(page, server.url);
    await enterWorldFromHub(page, FU_CARD, "Current Data");
    assert.deepEqual(
      await readStoredModes(page),
      { aincrad: "beta", underworld: "current" },
      "switching FU to Current leaves Aincrad untouched"
    );
    await assertBanner(page, "current", "FU Current");
    assert.ok(
      await page.evaluate(() => {
        const markers = Object.values(window.UnderworldMapAdapter.getContextData("playerIsland").markerDataset);
        return markers.length > 0 && markers.every((marker) => marker.category === "mainQuests");
      }),
      "FU Current shows the Fractured Underworld Main Questline"
    );

    await page.goto(`${server.url}${FU_TD}`, { waitUntil: "load", timeout: 60000 });
    await page.waitForFunction(() => Boolean(document.getElementById("towerDefenseShopList")));
    assert.equal(
      await page.evaluate(() => document.getElementById("towerDefenseShopList").childElementCount),
      0,
      "FU Tower Defense does not fall back to Beta data in Current"
    );

    await page.goto(`${server.url}${FU_COMPENDIUM}`, { waitUntil: "load", timeout: 60000 });
    await page.waitForSelector("#entryList .empty-state", { timeout: 10000 });
    assert.equal(
      (await page.locator("#entryList .empty-state").textContent()).trim(),
      await page.evaluate(() => window.SAOI18n.t("page.uwcompendium.noEntries")),
      "FU Compendium shows its Current empty state rather than Beta content"
    );

    assert.deepEqual(diagnostics.errors, [], "the data-mode flow raises no console or page errors");
    console.log("World data mode browser regression checks passed.");
  } finally {
    await browser.close();
    await server.stop();
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
