/* Character Build picker regression tests.
 *
 * The builder must open on the same dataset the rest of the site defaults to (beta) and that
 * dataset must actually reach the slot pickers:
 *  - fresh visitors get the beta source selected and the equipment floor scripts load;
 *  - opening a slot lists the equipment that matches the slot, class and level;
 *  - choosing an item closes the picker, fills the slot and renders stats;
 *  - Reset Build clears the equipment again;
 *  - no console errors and no failed requests.
 *
 * Regression: the builder used to default to the "current" dataset, whose equipment data ships
 * as an empty stub, so every picker was empty on a first visit even though the beta data was
 * one undiscoverable toggle away.
 */
const assert = require("node:assert/strict");
const { chromium } = require("playwright");
const { attachDiagnostics, ensureStaticServer } = require("./harness-helpers");

const rootUrl = process.env.SAO_BASE_URL || "http://127.0.0.1:8080";
const builderUrl = `${rootUrl}/Aincrad/Character%20Build/character-build.html`;
const MAX_LEVEL = 25;

async function openBuilder(browser) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  await context.addInitScript(() => {
    [
      "sao.walkthrough.index.completed",
      "sao.walkthrough.maps.completed",
      "sao.walkthrough.mainui.completed",
      "sao.walkthrough.characterBuild.completed"
    ].forEach((key) => window.localStorage.setItem(key, "1"));
  });
  const page = await context.newPage();
  const diagnostics = attachDiagnostics(page);
  await page.goto(builderUrl, { waitUntil: "load" });
  await page.waitForFunction(() => Boolean(document.querySelector("#armorSlots [data-slot-id]")), null, {
    timeout: 10000
  });
  return { context, page, ...diagnostics };
}

(async () => {
  await ensureStaticServer();
  const browser = await chromium.launch({ headless: true });
  const results = [];
  try {
    const session = await openBuilder(browser);
    const { page } = session;

    /* --- the beta source is the default and its data loads on its own --- */
    const sourceState = await page.evaluate(() => ({
      active: Array.from(document.querySelectorAll("[data-source]"))
        .filter((button) => button.classList.contains("is-active"))
        .map((button) => button.dataset.source)
    }));
    assert.deepEqual(sourceState.active, ["beta"], "the builder selects the beta dataset by default");

    await page.waitForFunction(() => Boolean(window.FLOOR_1_DATA && window.FLOOR_2_DATA && window.FLOOR_3_DATA), null, {
      timeout: 15000
    });
    const loadedItems = await page.evaluate(() => window.CharacterBuildAdapter.getItems("beta").length);
    assert.ok(loadedItems > 100, `the beta equipment dataset loads (items=${loadedItems})`);
    results.push({ scope: "character-build-default-source", items: loadedItems, status: "passed" });

    /* --- a slot at the maximum level lists every compatible item --- */
    await page.evaluate((level) => {
      const input = document.getElementById("characterLevel");
      input.value = String(level);
      input.dispatchEvent(new Event("input", { bubbles: true }));
    }, MAX_LEVEL);
    await page.waitForTimeout(400);

    await page.locator('#weaponSlots [data-slot-id="main-weapon"]').click();
    await page.waitForTimeout(400);
    const picker = await page.evaluate(() => ({
      open: Boolean(document.getElementById("equipmentDialog")?.open),
      items: document.querySelectorAll("#itemList .equip-button").length,
      emptyText: (document.querySelector("#itemList .empty-state") || {}).textContent || ""
    }));
    assert.equal(picker.open, true, "clicking a slot opens the picker dialog");
    assert.ok(
      picker.items > 0,
      `the picker lists weapons at the maximum level (items=${picker.items} ${picker.emptyText})`
    );
    results.push({ scope: "character-build-picker-list", items: picker.items, status: "passed" });

    /* --- equipping fills the slot, closes the dialog and renders stats --- */
    await page.locator("#itemList .equip-button").first().click();
    await page.waitForTimeout(400);
    const equipped = await page.evaluate(() => ({
      dialogOpen: Boolean(document.getElementById("equipmentDialog")?.open),
      filled: document.querySelectorAll(".slot-button.is-filled").length,
      stats: (document.getElementById("statsGroups") || {}).textContent.replace(/\s+/g, " ").trim()
    }));
    assert.equal(equipped.dialogOpen, false, "choosing an item closes the picker dialog");
    assert.ok(equipped.filled > 0, "the chosen item fills its slot");
    assert.ok(equipped.stats.length > 0, "the stats panel renders after equipping");

    /* --- Reset Build clears the equipment again --- */
    await page.locator("#resetBuild").click();
    await page.waitForTimeout(400);
    const afterReset = await page.evaluate(() => document.querySelectorAll(".slot-button.is-filled").length);
    assert.equal(afterReset, 0, "Reset Build clears every equipped slot");
    results.push({ scope: "character-build-equip-reset", status: "passed" });

    assert.deepEqual(session.errors, [], "no console errors while using the builder");
    assert.deepEqual(session.failedRequests, [], "no failed requests while using the builder");
    await session.context.close();
  } finally {
    await browser.close();
  }

  console.log(JSON.stringify({ results, status: "passed" }, null, 2));
  console.log("Character Build picker regression tests passed.");
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
