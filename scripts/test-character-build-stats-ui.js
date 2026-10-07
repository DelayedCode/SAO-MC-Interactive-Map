const assert = require("node:assert/strict");
const { chromium } = require("playwright");
const { attachDiagnostics, ensureStaticServer } = require("./harness-helpers");

const pageUrl = `${process.env.SAO_BASE_URL || "http://127.0.0.1:8080"}/Aincrad/Character%20Build/character-build.html`;
const viewports = [
  { name: "desktop", width: 1440, height: 1000 },
  { name: "mobile", width: 390, height: 844 }
];

/* The current Character Build stat model. These lists mirror the supported whitelist and the
   documented per-level class gains exactly; the browser checks below assert the page against
   them instead of recalculating anything. */
const SUPPORTED_GROUPS = ["Offensive", "Defensive", "Mobility & Stamina", "Health & Regeneration"];
const SUPPORTED_STATS = [
  "Damage",
  "Magic Damage",
  "Skill Damage",
  "Projectile Damage",
  "Attack Speed",
  "Critical Hit Chance",
  "Critical Hit Damage",
  "Skill Critical Hit Chance",
  "Skill Critical Hit Damage",
  "Defense",
  "Health",
  "Evasion",
  "Damage Reduction",
  "Tenacity",
  "Movement Speed",
  "Mana",
  "Stamina",
  "Health Regeneration",
  "Mana Regeneration",
  "Stamina Regeneration"
];
const UNSUPPORTED_STAT_NAMES = [
  "Physical Damage",
  "Haste",
  "Block",
  "Blocking Mastery",
  "Blocking Power",
  "Block Proficiency",
  "Knockback Resistance",
  "Parry Chance",
  "Healing Power",
  "Bonus Healing",
  "Weapon Damage",
  "Flight Of Life",
  "Falls Reduction",
  "Omnivampirism",
  "Crouch Speed"
];
const gain = (flat, percent = 0) => ({ flat, percent });
const DOCUMENTED_CLASS_BONUSES = {
  assassin: {
    Health: gain(1.25),
    "Critical Hit Damage": gain(0, 0.25),
    "Health Regeneration": gain(0.1),
    "Mana Regeneration": gain(0.1),
    "Stamina Regeneration": gain(0.1)
  },
  archer: {
    Health: gain(1.25),
    "Critical Hit Chance": gain(0, 0.25),
    "Health Regeneration": gain(0.1),
    "Mana Regeneration": gain(0.1),
    "Stamina Regeneration": gain(0.1)
  },
  guerrier: {
    Health: gain(1.5),
    "Health Regeneration": gain(0.1),
    "Mana Regeneration": gain(0.1),
    "Stamina Regeneration": gain(0.1)
  },
  mage: {
    Health: gain(1.25),
    "Skill Critical Hit Damage": gain(0, 0.25),
    "Health Regeneration": gain(0.1),
    "Mana Regeneration": gain(0.1),
    "Stamina Regeneration": gain(0.1)
  },
  shaman: {
    Health: gain(1.25),
    "Skill Critical Hit Chance": gain(0, 0.25),
    "Health Regeneration": gain(0.1),
    "Mana Regeneration": gain(0.1),
    "Stamina Regeneration": gain(0.1)
  },
  /* The calculator defines no class-level bonuses for this class. */
  "martial-artist": {}
};
/* Level 1 is the base, so a build at level N holds (N - 1) increments. */
const LEVELS_TO_CHECK = [1, 2, 15, 25];

/* The Level 1 class base stats every build starts from; the level gains above are added on top. */
const DOCUMENTED_CLASS_BASE_STATS = {
  assassin: {
    Health: gain(24),
    Damage: gain(1),
    Mana: gain(20),
    Evasion: gain(5),
    "Attack Speed": gain(0, 12.5),
    "Critical Hit Chance": gain(0, 1),
    "Critical Hit Damage": gain(0, 200),
    "Movement Speed": gain(0, -68)
  },
  archer: {
    Health: gain(20),
    Damage: gain(1),
    Mana: gain(20),
    Evasion: gain(5),
    "Attack Speed": gain(0, 12.5),
    "Critical Hit Chance": gain(0, 1),
    "Critical Hit Damage": gain(0, 200),
    "Movement Speed": gain(0, 16)
  },
  guerrier: {
    Health: gain(28),
    Damage: gain(1),
    Mana: gain(20),
    Evasion: gain(5),
    "Attack Speed": gain(0, 12.5),
    "Critical Hit Chance": gain(0, 1),
    "Critical Hit Damage": gain(0, 200),
    "Movement Speed": gain(0, 10)
  },
  mage: {
    Health: gain(20),
    Damage: gain(1),
    Mana: gain(20),
    Evasion: gain(5),
    "Attack Speed": gain(0, 12.5),
    "Critical Hit Chance": gain(0, 1),
    "Critical Hit Damage": gain(0, 200),
    "Movement Speed": gain(0, 10)
  },
  shaman: {
    Health: gain(20),
    Damage: gain(1),
    Mana: gain(20),
    Evasion: gain(5),
    "Attack Speed": gain(0, 12.5),
    "Critical Hit Chance": gain(0, 1),
    "Critical Hit Damage": gain(0, 200),
    "Movement Speed": gain(0, 10)
  },
  /* The calculator defines no Level 1 base stats for this class. */
  "martial-artist": {}
};

function parseRenderedValue(text) {
  const clean = String(text).replace(/\*$/, "").trim();
  const percentMatch = clean.match(/\(([-+]?\d+(?:\.\d+)?)%\)/);
  const flatPart = clean.replace(/\(.*\)/, "").trim();
  return {
    flat: flatNumber(flatPart),
    percent: percentMatch ? Number(percentMatch[1]) : 0,
    modified: /\*$/.test(String(text).trim())
  };
}

function flatNumber(value) {
  const parsed = Number(String(value).replace(/[^0-9.+-]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

async function setClassAndLevel(page, classId, level) {
  await page.selectOption("#characterClass", classId);
  await page.locator("#characterLevel").fill(String(level));
  await page.evaluate(() => {
    document.getElementById("characterLevel").dispatchEvent(new Event("input", { bubbles: true }));
  });
  await page.waitForTimeout(120);
}

async function readStatValues(page) {
  return page.locator(".stats-group li").evaluateAll((rows) => rows.map((row) => row.children[1].textContent.trim()));
}

async function verifyBraceletDetails(page, language, viewportName) {
  const bracelets = await page.evaluate((language) => {
    const expected = [
      { name: "Thief's Bracelet", set: "Thief Set", stats: ["Critical Hit Chance", "Defense", "Stamina Regeneration"] },
      { name: "Amethyst Bracelet", set: "Amethyst Set", stats: ["Health", "Stamina Regeneration", "Defense"] }
    ];
    return expected.map((record) => {
      const item = window.CharacterBuildAdapter.getItems("beta").find(
        (candidate) =>
          candidate.category === "accessory" && candidate.name === record.name && candidate.set === record.set
      );
      if (!item) return null;
      const statLabels = Object.fromEntries(
        record.stats.map((stat) => {
          const key = stat.replace(/[^a-zA-Z0-9]+(.)/g, (_match, character) => character.toUpperCase());
          return [
            stat,
            window.SAOI18n.t(`page.characterBuild.statNames.${key.charAt(0).toLowerCase()}${key.slice(1)}`)
          ];
        })
      );
      return {
        id: item.id,
        name: item.name,
        set: item.set,
        localizedName: window.CharacterBuildAdapter.getText(item, "name"),
        localizedSet: window.SAOContentTranslations.translateKnownTerms(item.set, language),
        setLabel: window.SAOI18n.t("page.ecompendium.labels.set"),
        stats: record.stats.map((stat) => ({ name: stat, label: statLabels[stat], value: String(item.stats[stat]) }))
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
    assert.equal(
      await card.locator("h3").textContent(),
      bracelet.localizedName,
      `${language}/${viewportName}: localized bracelet name`
    );
    assert(
      (await card.locator(".item-meta").textContent()).includes(`${bracelet.setLabel}: ${bracelet.localizedSet}`),
      `${language}/${viewportName}: localized set appears in item details`
    );
    const effectText = await card.locator(".item-effect").textContent();
    bracelet.stats.forEach((stat) => {
      assert(
        effectText.includes(stat.label),
        `${language}/${viewportName}: ${stat.name} label appears in item details`
      );
      assert(
        effectText.includes(stat.value),
        `${language}/${viewportName}: ${stat.name} value appears in item details`
      );
    });
    await card.locator(`[data-item-id="${bracelet.id}"]`).click();
    await page.waitForFunction(() => !document.getElementById("equipmentDialog").open);
    assert.equal(
      await page.locator('#accessorySlots [data-slot-id="bracelet"] .slot-item').textContent(),
      bracelet.localizedName,
      `${language}/${viewportName}: equipped slot name`
    );
  }
}

async function verifyOccultSetDetails(page, language, viewportName) {
  const occult = await page.evaluate((language) => {
    const items = window.CharacterBuildAdapter.getItems("beta");
    const amulet = items.find((item) => item.name === "Occult Amulet" && item.set === "Shadow Neophyte F1");
    const ring = items.find((item) => item.name === "Occult Ring" && item.set === "Shadow Neophyte F1");
    if (!amulet || !ring) return null;
    const localizeEffect = (effect) => {
      const match = String(effect).match(/^([^:]+):\s*(.*)$/);
      if (!match) return effect;
      return `${window.SAOContentTranslations.translateKnownTerms(match[1], language)}: ${window.SAOContentTranslations.translateKnownTerms(match[2], language)}`;
    };
    const tierDetails = amulet.effects.filter((effect) => /^[2-7] Piece Set Bonus:/.test(effect)).map(localizeEffect);
    /* The sheet also carries the live class/level gains, so compare against the real calculator
       with the same inputs the panel uses instead of a set-bonus-only figure. */
    const result = window.CharacterBuildCalculator.calculateBuildStats({
      equipment: { amulet, "ring-1": ring },
      classId: document.getElementById("characterClass").value,
      level: Number(document.getElementById("characterLevel").value),
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
    occult.tierDetails.forEach((effect) =>
      assert(effectText.includes(effect), `${language}/${viewportName}: item detail renders ${effect}`)
    );
    await card.locator(`[data-item-id="${itemId}"]`).click();
    await page.waitForFunction(() => !document.getElementById("equipmentDialog").open);
  }

  const regenerationGroup = page.locator('.stats-group[data-stats-group="3"]');
  if (!(await regenerationGroup.evaluate((group) => group.open))) await regenerationGroup.locator("summary").click();
  const visibleRegeneration = await regenerationGroup.locator("li").evaluateAll((rows, label) => {
    const row = rows.find((item) => item.children[0]?.textContent.trim() === label);
    return row ? row.children[1]?.textContent.trim() : null;
  }, occult.healthRegenerationLabel);
  assert.equal(
    visibleRegeneration,
    `${occult.healthRegenerationValue} *`,
    `${language}/${viewportName}: two-piece Occult bonus is reflected in the character sheet`
  );
}

async function openCharacterBuild(browser, language) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  await context.addInitScript(() => localStorage.setItem("sao.walkthrough.characterBuild.completed", "1"));
  const page = await context.newPage();
  const diagnostics = attachDiagnostics(page);
  await page.goto(pageUrl, { waitUntil: "load" });
  await page.evaluate((nextLanguage) => window.SAOI18n.setLanguage(nextLanguage), language);
  await page.waitForTimeout(400);
  return { context, page, ...diagnostics };
}

/* Asserts the rendered stats equal the class' Level 1 base plus the documented gains for the level. */
function assertStatsMatch(values, { label, classId, level }) {
  const bonuses = DOCUMENTED_CLASS_BONUSES[classId] || {};
  const bases = DOCUMENTED_CLASS_BASE_STATS[classId] || {};
  const increments = level - 1;
  assert.equal(values.length, SUPPORTED_STATS.length, `${label}: every supported stat renders`);
  SUPPORTED_STATS.forEach((stat, index) => {
    const bonus = bonuses[stat] || { flat: 0, percent: 0 };
    const base = bases[stat] || { flat: 0, percent: 0 };
    const expectedFlat = base.flat + bonus.flat * increments;
    const expectedPercent = base.percent + bonus.percent * increments;
    const rendered = parseRenderedValue(values[index]);
    assert.ok(
      Math.abs(rendered.flat - expectedFlat) < 1e-6,
      `${label}: ${stat} should be ${expectedFlat} after ${increments} increment(s) (rendered ${values[index]})`
    );
    assert.ok(
      Math.abs(rendered.percent - expectedPercent) < 1e-6,
      `${label}: ${stat} percent should be ${expectedPercent}% (rendered ${values[index]})`
    );
    const expectedModified = expectedFlat !== base.flat || expectedPercent !== base.percent;
    assert.equal(
      rendered.modified,
      expectedModified,
      `${label}: ${stat} modified marker should be ${expectedModified}`
    );
  });
}

/* Level 1 is the base, so a build at level N holds (N - 1) increments of the class gains. */
async function verifyClassLevelProgression(browser, language) {
  const session = await openCharacterBuild(browser, language);
  const { page, context } = session;
  try {
    assert.equal(
      await page.locator(".stats-group li").count(),
      SUPPORTED_STATS.length,
      `${language}: exactly the ${SUPPORTED_STATS.length} supported stats are rendered`
    );

    for (const classId of Object.keys(DOCUMENTED_CLASS_BONUSES)) {
      for (const level of LEVELS_TO_CHECK) {
        const label = `${language}/${classId}/L${level}`;
        await setClassAndLevel(page, classId, level);
        assertStatsMatch(await readStatValues(page), { label, classId, level });
      }
    }

    assert.deepEqual(session.errors, [], `${language}: no browser errors during the class/level sweep`);
    assert.deepEqual(session.failedRequests, [], `${language}: no failed requests during the class/level sweep`);
  } finally {
    await context.close();
  }
  return { language, scope: "class-level-progression", status: "passed" };
}

async function verifyRuneAndResetFlow(browser, language) {
  const session = await openCharacterBuild(browser, language);
  const { page, context } = session;
  try {
    await page.locator('[data-source="beta"]').click();
    await page.waitForFunction(
      () => window.FLOOR_1_DATA && window.FLOOR_1_DATA.weapon && window.FLOOR_1_DATA.weapon.length > 0
    );

    const armor = await page.evaluate(() => {
      const items = window.CharacterBuildAdapter.getItems("beta");
      const candidate = items.find(
        (item) =>
          ["Helmet", "Chestplate", "Leggings", "Boots"].includes(item.slot) &&
          window.CharacterBuildAdapter.getRuneSlots(item) > 0 &&
          (item.levelRequirement === null || item.levelRequirement <= 25)
      );
      if (!candidate) return null;
      return {
        id: candidate.id,
        name: candidate.name,
        slot: candidate.slot,
        runeSlots: window.CharacterBuildAdapter.getRuneSlots(candidate),
        classId: candidate.classes[0] || "archer"
      };
    });
    assert.ok(armor, `${language}: a rune-bearing armour piece exists in the beta data`);

    await setClassAndLevel(page, armor.classId, 25);
    const slotId = armor.slot.toLowerCase();
    await page.locator(`#armorSlots [data-slot-id="${slotId}"]`).click();
    await page.locator("#itemSearch").fill(armor.name);
    await page.locator(`#itemList [data-item-id="${armor.id}"]`).click();
    await page.waitForFunction(() => !document.getElementById("equipmentDialog").open);
    await page.waitForTimeout(200);

    const runeButtons = page.locator(`#armorSlots [data-armor-slot="${slotId}"][data-rune-slot]`);
    assert.equal(
      await runeButtons.count(),
      armor.runeSlots,
      `${language}: ${armor.name} exposes its ${armor.runeSlots} rune slot(s)`
    );
    assert.equal(
      (await page.locator(`#armorSlots [data-slot-id="${slotId}"] .slot-item`).textContent()).trim().length > 0,
      true,
      `${language}: the armour slot shows the equipped item`
    );

    await runeButtons.first().click();
    await page.waitForTimeout(200);
    const runeOptions = page.locator("#itemList [data-rune-id]");
    assert.ok((await runeOptions.count()) > 0, `${language}: the rune picker lists runes`);
    const runeName = (await page.locator("#itemList .item-card h3").first().textContent()).trim();
    await runeOptions.first().click();
    await page.waitForFunction(() => !document.getElementById("equipmentDialog").open);
    await page.waitForTimeout(200);

    const filledRunes = page.locator("#armorSlots .rune-button.is-filled");
    assert.equal(await filledRunes.count(), 1, `${language}: the picked rune fills its slot`);
    assert.ok(
      (await filledRunes.first().textContent()).includes(runeName),
      `${language}: the filled rune slot shows the rune name`
    );

    await page.locator("#resetBuild").click();
    await page.waitForTimeout(300);
    assert.equal(
      await page.locator("#armorSlots .rune-button.is-filled").count(),
      0,
      `${language}: reset clears the runes`
    );
    assert.equal(
      await page.locator(`#armorSlots [data-slot-id="${slotId}"] .slot-item`).count(),
      0,
      `${language}: reset clears the equipped armour`
    );

    /* Reset returns the build to its base state, so assert against what the controls now show. */
    const afterReset = await page.evaluate(() => ({
      level: Number(document.getElementById("characterLevel").value),
      classId: document.getElementById("characterClass").value
    }));
    assert.equal(afterReset.level, 1, `${language}: reset returns the build to level 1`);
    assertStatsMatch(await readStatValues(page), {
      label: `${language}/reset/L${afterReset.level}`,
      classId: afterReset.classId,
      level: afterReset.level
    });

    assert.deepEqual(session.errors, [], `${language}: no browser errors during the rune/reset flow`);
    assert.deepEqual(session.failedRequests, [], `${language}: no failed requests during the rune/reset flow`);
  } finally {
    await context.close();
  }
  return { language, scope: "rune-and-reset", status: "passed" };
}

(async () => {
  await ensureStaticServer();
  const browser = await chromium.launch({ headless: true });
  const results = [];
  try {
    for (const language of ["en", "es", "fr"]) {
      results.push(await verifyClassLevelProgression(browser, language));
      results.push(await verifyRuneAndResetFlow(browser, language));
      for (const viewport of viewports) {
        const page = await browser.newPage({ viewport });
        const { errors, failedRequests } = attachDiagnostics(page);

        await page.addInitScript(() => localStorage.setItem("sao.walkthrough.characterBuild.completed", "1"));
        await page.goto(pageUrl, { waitUntil: "networkidle" });
        await page.evaluate((nextLanguage) => window.SAOI18n.setLanguage(nextLanguage), language);
        assert.equal(
          await page.locator("html").getAttribute("lang"),
          language,
          `${language}/${viewport.name}: active document language`
        );
        const groups = page.locator(".stats-group");
        assert.equal(
          await groups.count(),
          SUPPORTED_GROUPS.length,
          `${viewport.name}: the stats panel renders the ${SUPPORTED_GROUPS.length} documented groups`
        );
        assert.equal(
          await page.locator(".stats-group li").count(),
          SUPPORTED_STATS.length,
          `${viewport.name}: the stats panel renders exactly the ${SUPPORTED_STATS.length} supported stats`
        );
        if (language === "en") {
          assert.deepEqual(
            await page.locator(".stats-group summary").allTextContents(),
            SUPPORTED_GROUPS,
            `${viewport.name}: the stats groups are the documented ones, in order`
          );
          assert.deepEqual(
            await page.locator(".stats-group li > span").allTextContents(),
            SUPPORTED_STATS,
            `${viewport.name}: the stats are the documented whitelist, in order`
          );
          const panelText = await page.locator(".stats-panel").textContent();
          const leaked = UNSUPPORTED_STAT_NAMES.filter((name) =>
            new RegExp(`(?:^|[^A-Za-z])${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?![A-Za-z])`).test(panelText)
          );
          assert.deepEqual(leaked, [], `${viewport.name}: no removed or unsupported stat is shown in the stats panel`);
        }
        assert.equal(
          await groups.nth(0).evaluate((group) => group.open),
          false,
          `${viewport.name}: Offensive starts collapsed`
        );

        await groups.nth(0).locator("summary").click();
        assert.equal(
          await groups.nth(0).evaluate((group) => group.open),
          true,
          `${viewport.name}: Offensive opens manually`
        );

        for (const level of [5, 6, 7, 8]) {
          await page.locator("#characterLevel").fill(String(level));
          assert.equal(
            await groups.nth(0).evaluate((group) => group.open),
            true,
            `${viewport.name}: Offensive stays open at level ${level}`
          );
        }

        await groups.nth(1).locator("summary").click();
        assert.equal(
          await groups.nth(1).evaluate((group) => group.open),
          true,
          `${viewport.name}: Defensive opens independently`
        );

        await page.evaluate(() => document.dispatchEvent(new Event("sao:languagechange")));
        assert.equal(
          await groups.nth(0).evaluate((group) => group.open),
          true,
          `${viewport.name}: Offensive stays open after language rerender`
        );
        assert.equal(
          await groups.nth(1).evaluate((group) => group.open),
          true,
          `${viewport.name}: Defensive stays open after language rerender`
        );

        await groups.nth(0).locator("summary").click();
        await page.evaluate(() => document.dispatchEvent(new Event("sao:languagechange")));
        assert.equal(
          await groups.nth(0).evaluate((group) => group.open),
          false,
          `${viewport.name}: Offensive stays collapsed after second rerender`
        );

        await page.locator('[data-source="beta"]').click();
        await page.waitForFunction(() => window.FLOOR_1_DATA?.weapon?.length > 0);
        await page.locator("#characterLevel").fill("25");
        const expectedItem = await page.evaluate(() => {
          const classId = document.getElementById("characterClass").value;
          const item = window.CharacterBuildAdapter.getItemsForSlot("beta", "main-weapon", classId).find((candidate) =>
            Object.keys(candidate.stats).includes("Damage")
          );
          if (!item) return null;
          const statName = "Damage";
          const dataKey = String(statName).replace(/[^a-zA-Z0-9]+(.)/g, (_match, character) => character.toUpperCase());
          const statLabel = window.SAOI18n.t(
            `page.characterBuild.statNames.${dataKey.charAt(0).toLowerCase()}${dataKey.slice(1)}`
          );
          const groupIndex = Object.values(window.CharacterBuildCalculator.groups).findIndex((stats) =>
            stats.includes(statName)
          );
          const calculated = window.CharacterBuildCalculator.calculateBuildStats({
            equipment: { "main-weapon": item },
            /* The sheet also carries the live Level 1 class base and the level gains, so the
               expectation uses the same class and level the panel is showing. */
            classId: document.getElementById("characterClass").value,
            level: Number(document.getElementById("characterLevel").value),
            isAvailable: () => true
          });
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
        assert.equal(
          await dialog.evaluate((element) => element.open),
          true,
          `${language}/${viewport.name}: equipment picker opens`
        );
        const expectedDialogTitle = await page.evaluate(() =>
          window.SAOI18n.t("page.characterBuild.selectSlot", {
            slot: window.SAOI18n.t("page.characterBuild.slotNames.main-weapon")
          })
        );
        assert.equal(
          await page.locator("#dialogTitle").textContent(),
          expectedDialogTitle,
          `${language}/${viewport.name}: picker title is localized`
        );
        await page.locator("#itemSearch").fill(expectedItem.name);
        const itemButton = page.locator(`#itemList [data-item-id="${expectedItem.id}"]`);
        await itemButton.waitFor();
        const effectText = await page.locator(".item-card").first().locator(".item-effect").textContent();
        assert(
          effectText.includes(expectedItem.statLabel),
          `${language}/${viewport.name}: picker displays the localized stat label`
        );
        assert(
          effectText.includes(expectedItem.statValue),
          `${language}/${viewport.name}: picker displays the source stat value`
        );
        await itemButton.click();
        await page.waitForFunction(() => !document.getElementById("equipmentDialog").open);

        const statsGroup = page.locator(`.stats-group[data-stats-group="${expectedItem.groupIndex}"]`);
        if (!(await statsGroup.evaluate((group) => group.open))) await statsGroup.locator("summary").click();
        const visibleStat = await statsGroup.locator("li").evaluateAll(
          (rows, label) =>
            rows
              .map((row) => ({
                label: row.children[0]?.textContent.trim(),
                value: row.children[1]?.textContent.trim()
              }))
              .find((row) => row.label === label) || null,
          expectedItem.statLabel
        );
        assert.deepEqual(
          visibleStat,
          { label: expectedItem.statLabel, value: `${expectedItem.expectedValue} *` },
          `${language}/${viewport.name}: calculated stats match the selected item's source data and are marked as modified`
        );
        await verifyBraceletDetails(page, language, viewport.name);
        await verifyOccultSetDetails(page, language, viewport.name);
        assert.equal(
          await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth),
          true,
          `${viewport.name}: no horizontal overflow`
        );
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
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
