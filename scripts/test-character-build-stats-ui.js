const assert = require("node:assert/strict");
const { chromium } = require("playwright");

const pageUrl = "http://localhost:8080/Aincrad/Character%20Build/character-build.html";
const viewports = [
  { name: "desktop", width: 1440, height: 1000 },
  { name: "mobile", width: 390, height: 844 }
];

async function verifyBraceletDetails(page, language, viewportName) {
  const bracelets = await page.evaluate(language => {
    const expected = [
      { name: "Thief's Bracelet", set: "Thief Set", stats: ["Critical Hit Chance", "Defense", "Stamina Regeneration"] },
      { name: "Amethyst Bracelet", set: "Amethyst Set", stats: ["Health", "Stamina Regeneration", "Defense"] }
    ];
    return expected.map(record => {
      const item = window.CharacterBuildAdapter.getItems("beta").find(candidate =>
        candidate.category === "accessory" && candidate.name === record.name && candidate.set === record.set
      );
      if (!item) return null;
      const statLabels = Object.fromEntries(record.stats.map(stat => {
        const key = stat.replace(/[^a-zA-Z0-9]+(.)/g, (_match, character) => character.toUpperCase());
        return [stat, window.SAOI18n.t(`page.characterBuild.statNames.${key.charAt(0).toLowerCase()}${key.slice(1)}`)];
      }));
      return {
        id: item.id,
        name: item.name,
        set: item.set,
        localizedName: window.CharacterBuildAdapter.getText(item, "name"),
        localizedSet: window.SAOContentTranslations.translateKnownTerms(item.set, language),
        setLabel: window.SAOI18n.t("page.ecompendium.labels.set"),
        stats: record.stats.map(stat => ({ name: stat, label: statLabels[stat], value: String(item.stats[stat]) }))
      };
    });
  }, language);

  assert.equal(bracelets.length, 2, `${language}/${viewportName}: both bracelet variants are available`);
  assert.ok(bracelets.every(Boolean), `${language}/${viewportName}: both bracelet records have the expected set`);
  assert.notEqual(bracelets[0].id, bracelets[1].id, `${language}/${viewportName}: bracelet records remain distinct`);
  assert.notEqual(bracelets[0].name, bracelets[1].name, `${language}/${viewportName}: bracelet names remain distinct`);

  for (const bracelet of bracelets) {
    await page.locator('#accessorySlots [data-slot-id="bracelet"]').click();
    await page.locator("#itemSearch").fill(bracelet.name);
    const card = page.locator(`#itemList .item-card:has([data-item-id="${bracelet.id}"])`);
    await card.waitFor();
    assert.equal(await card.locator("h3").textContent(), bracelet.localizedName, `${language}/${viewportName}: localized bracelet name`);
    assert((await card.locator(".item-meta").textContent()).includes(`${bracelet.setLabel}: ${bracelet.localizedSet}`), `${language}/${viewportName}: localized set appears in item details`);
    const effectText = await card.locator(".item-effect").textContent();
    bracelet.stats.forEach(stat => {
      assert(effectText.includes(stat.label), `${language}/${viewportName}: ${stat.name} label appears in item details`);
      assert(effectText.includes(stat.value), `${language}/${viewportName}: ${stat.name} value appears in item details`);
    });
    await card.locator(`[data-item-id="${bracelet.id}"]`).click();
    await page.waitForFunction(() => !document.getElementById("equipmentDialog").open);
    assert.equal(await page.locator('#accessorySlots [data-slot-id="bracelet"] .slot-item').textContent(), bracelet.localizedName, `${language}/${viewportName}: equipped slot name`);
  }
}

async function verifyOccultSetDetails(page, language, viewportName) {
  const occult = await page.evaluate(language => {
    const items = window.CharacterBuildAdapter.getItems("beta");
    const amulet = items.find(item => item.name === "Occult Amulet" && item.set === "Shadow Neophyte F1");
    const ring = items.find(item => item.name === "Occult Ring" && item.set === "Shadow Neophyte F1");
    if (!amulet || !ring) return null;
    const localizeEffect = effect => {
      const match = String(effect).match(/^([^:]+):\s*(.*)$/);
      if (!match) return effect;
      return `${window.SAOContentTranslations.translateKnownTerms(match[1], language)}: ${window.SAOContentTranslations.translateKnownTerms(match[2], language)}`;
    };
    const tierDetails = amulet.effects.filter(effect => /^[2-7] Piece Set Bonus:/.test(effect)).map(localizeEffect);
    const result = window.CharacterBuildCalculator.calculateBuildStats({
      equipment: { amulet, "ring-1": ring },
      isAvailable: () => true
    });
    return {
      amuletId: amulet.id,
      ringId: ring.id,
      tierDetails,
      healthRegenerationLabel: window.SAOI18n.t("page.characterBuild.statNames.healthRegeneration"),
      healthRegenerationValue: window.CharacterBuildCalculator.formatValue(result["Health Regeneration"])
    };
  }, language);
  assert.ok(occult, `${language}/${viewportName}: Shadow Neophyte Amulet and Ring are available`);
  assert.equal(occult.tierDetails.length, 6, `${language}/${viewportName}: all six Occult tiers reach item details`);

  for (const [slot, itemName, itemId] of [
    ["amulet", "Occult Amulet", occult.amuletId],
    ["ring-1", "Occult Ring", occult.ringId]
  ]) {
    await page.locator(`#accessorySlots [data-slot-id="${slot}"]`).click();
    await page.locator("#itemSearch").fill(itemName);
    const card = page.locator(`#itemList .item-card:has([data-item-id="${itemId}"])`);
    await card.waitFor();
    const effectText = await card.locator(".item-effect").textContent();
    occult.tierDetails.forEach(effect => assert(effectText.includes(effect), `${language}/${viewportName}: item detail renders ${effect}`));
    await card.locator(`[data-item-id="${itemId}"]`).click();
    await page.waitForFunction(() => !document.getElementById("equipmentDialog").open);
  }

  const regenerationGroup = page.locator('.stats-group[data-stats-group="3"]');
  if (!(await regenerationGroup.evaluate(group => group.open))) await regenerationGroup.locator("summary").click();
  const visibleRegeneration = await regenerationGroup.locator("li").evaluateAll((rows, label) => {
    const row = rows.find(item => item.children[0]?.textContent.trim() === label);
    return row ? row.children[1]?.textContent.trim() : null;
  }, occult.healthRegenerationLabel);
  assert.equal(visibleRegeneration, occult.healthRegenerationValue, `${language}/${viewportName}: two-piece Occult bonus is reflected in the character sheet`);
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const results = [];
  try {
    for (const language of ["en", "es", "fr"]) {
      for (const viewport of viewports) {
      const page = await browser.newPage({ viewport });
      const errors = [];
      const failedRequests = [];
      page.on("console", message => {
        if (message.type() === "error" && !message.text().includes("frame-ancestors")) errors.push(message.text());
      });
      page.on("pageerror", error => errors.push(error.message));
      page.on("requestfailed", request => failedRequests.push(request.url()));

      await page.addInitScript(() => localStorage.setItem("sao.walkthrough.characterBuild.completed", "1"));
      await page.goto(pageUrl, { waitUntil: "networkidle" });
      await page.evaluate(nextLanguage => window.SAOI18n.setLanguage(nextLanguage), language);
      assert.equal(await page.locator("html").getAttribute("lang"), language, `${language}/${viewport.name}: active document language`);
      const groups = page.locator(".stats-group");
      assert.equal(await groups.count(), 5, `${viewport.name}: expected five stats groups`);
      assert.equal(await groups.nth(0).evaluate(group => group.open), false, `${viewport.name}: Offensive starts collapsed`);

      await groups.nth(0).locator("summary").click();
      assert.equal(await groups.nth(0).evaluate(group => group.open), true, `${viewport.name}: Offensive opens manually`);

      for (const level of [5, 6, 7, 8]) {
        await page.locator("#characterLevel").fill(String(level));
        assert.equal(await groups.nth(0).evaluate(group => group.open), true, `${viewport.name}: Offensive stays open at level ${level}`);
      }

      await groups.nth(1).locator("summary").click();
      assert.equal(await groups.nth(1).evaluate(group => group.open), true, `${viewport.name}: Defensive opens independently`);

      await page.evaluate(() => document.dispatchEvent(new Event("sao:languagechange")));
      assert.equal(await groups.nth(0).evaluate(group => group.open), true, `${viewport.name}: Offensive stays open after language rerender`);
      assert.equal(await groups.nth(1).evaluate(group => group.open), true, `${viewport.name}: Defensive stays open after language rerender`);

      await groups.nth(0).locator("summary").click();
      await page.evaluate(() => document.dispatchEvent(new Event("sao:languagechange")));
      assert.equal(await groups.nth(0).evaluate(group => group.open), false, `${viewport.name}: Offensive stays collapsed after second rerender`);

      await page.locator('[data-source="beta"]').click();
      await page.waitForFunction(() => window.FLOOR_1_DATA?.weapon?.length > 0);
      await page.locator("#characterLevel").fill("25");
      const expectedItem = await page.evaluate(() => {
        const classId = document.getElementById("characterClass").value;
        const item = window.CharacterBuildAdapter.getItemsForSlot("beta", "main-weapon", classId)
          .find(candidate => Object.keys(candidate.stats).includes("Damage"));
        if (!item) return null;
        const statName = "Damage";
        const dataKey = String(statName).replace(/[^a-zA-Z0-9]+(.)/g, (_match, character) => character.toUpperCase());
        const statLabel = window.SAOI18n.t(`page.characterBuild.statNames.${dataKey.charAt(0).toLowerCase()}${dataKey.slice(1)}`);
        const groupIndex = Object.values(window.CharacterBuildCalculator.groups).findIndex(stats => stats.includes(statName));
        const calculated = window.CharacterBuildCalculator.calculateBuildStats({ equipment: { "main-weapon": item }, isAvailable: () => true });
        return {
          id: item.id,
          name: item.name,
          statName,
          statValue: String(item.stats[statName]),
          statLabel,
          expectedValue: window.CharacterBuildCalculator.formatValue(calculated[statName]),
          groupIndex
        };
      });
      assert.ok(expectedItem, `${language}/${viewport.name}: a populated helmet is available`);

      await page.locator('#weaponSlots [data-slot-id="main-weapon"]').click();
      const dialog = page.locator("#equipmentDialog");
      assert.equal(await dialog.evaluate(element => element.open), true, `${language}/${viewport.name}: equipment picker opens`);
      const expectedDialogTitle = await page.evaluate(() => window.SAOI18n.t("page.characterBuild.selectSlot", {
        slot: window.SAOI18n.t("page.characterBuild.slotNames.main-weapon")
      }));
      assert.equal(await page.locator("#dialogTitle").textContent(), expectedDialogTitle, `${language}/${viewport.name}: picker title is localized`);
      await page.locator("#itemSearch").fill(expectedItem.name);
      const itemButton = page.locator(`#itemList [data-item-id="${expectedItem.id}"]`);
      await itemButton.waitFor();
      const effectText = await page.locator(".item-card").first().locator(".item-effect").textContent();
      assert(effectText.includes(expectedItem.statLabel), `${language}/${viewport.name}: picker displays the localized stat label`);
      assert(effectText.includes(expectedItem.statValue), `${language}/${viewport.name}: picker displays the source stat value`);
      await itemButton.click();
      await page.waitForFunction(() => !document.getElementById("equipmentDialog").open);

      const statsGroup = page.locator(`.stats-group[data-stats-group="${expectedItem.groupIndex}"]`);
      if (!(await statsGroup.evaluate(group => group.open))) await statsGroup.locator("summary").click();
      const visibleStat = await statsGroup.locator("li").evaluateAll((rows, label) => rows
        .map(row => ({ label: row.children[0]?.textContent.trim(), value: row.children[1]?.textContent.trim() }))
        .find(row => row.label === label) || null, expectedItem.statLabel);
      assert.deepEqual(visibleStat, { label: expectedItem.statLabel, value: expectedItem.expectedValue }, `${language}/${viewport.name}: calculated stats match the selected item's source data`);
      await verifyBraceletDetails(page, language, viewport.name);
      await verifyOccultSetDetails(page, language, viewport.name);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth), true, `${viewport.name}: no horizontal overflow`);
      assert.deepEqual(errors, [], `${language}/${viewport.name}: no browser errors`);
      assert.deepEqual(failedRequests, [], `${language}/${viewport.name}: no failed requests`);
      results.push({ language, viewport: viewport.name, status: "passed" });
      await page.close();
      }
    }
  } finally {
    await browser.close();
  }
  console.log(JSON.stringify({ results, status: "passed" }, null, 2));
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
