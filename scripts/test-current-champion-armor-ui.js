/* Current-Data Champion's PvP armor browser regression checks.

   Drives the real pages against the 20 supplied PvP Set P1 armor pieces:
     - the four armor pickers list only the selected class' own piece for each slot;
     - every one of the 20 equips in its slot, and the four slots hold their own piece at once;
     - the helmet and chestplate expose their supplied rune slots (the legs and boots expose none);
     - the item card shows the name, class, level, Defense, Health, rune slots, set name, the three
       set-bonus tiers and the description;
     - a selection survives a reload, can be removed, and stays removed;
     - switching class drops the armor that is invalid for the new class;
     - Compendium > Armor lists all 20 entries, keeping the same-name pieces of different classes
       as separate cards.
   */
"use strict";

const assert = require("node:assert/strict");
const { chromium } = require("playwright");
const { attachDiagnostics, ensureStaticServer } = require("./harness-helpers");

const rootUrl = process.env.SAO_BASE_URL || "http://127.0.0.1:8080";
const builderUrl = `${rootUrl}/Aincrad/Character%20Build/character-build.html`;
const compendiumUrl = `${rootUrl}/Aincrad/eCompendium/ecompendium.html?floor=floor1&dataset=current`;

const SET_NAME = "PvP Set P1";
const PURIFIED = "Forged from purified metal, this armor protects those who have triumphed over corrupted ruins.";
const PURE = "Forged from pure metal, this armor protects those who have triumphed over corrupted ruins.";
const ARMOR_SLOTS = ["helmet", "chestplate", "leggings", "boots"];
/* The supplied rune slots per slot; the legs and boots carry none. */
const RUNE_SLOTS = { helmet: 1, chestplate: 2, leggings: 0, boots: 0 };
const STATS_BY_SLOT = {
  helmet: [["Defense", "+2"], ["Health", "+9"], ["Rune Slots", "1"]],
  chestplate: [["Defense", "+5"], ["Health", "+13"], ["Rune Slots", "2"]],
  leggings: [["Defense", "+3"], ["Health", "+11"]],
  boots: [["Defense", "+1"], ["Health", "+8"]]
};

/* The supplied matrix, per class. */
const PIECES_BY_CLASS = {
  shaman: {
    helmet: "Champion's Mask",
    chestplate: "Champion's Breastplate",
    leggings: "Champion's Leggings",
    boots: "Champion's Boots"
  },
  mage: {
    helmet: "Champion's Hat",
    chestplate: "Champion's Breastplate",
    leggings: "Champion's Leggings",
    boots: "Champion's Boots"
  },
  archer: {
    helmet: "Champion's Hood",
    chestplate: "Champion's Breastplate",
    leggings: "Champion's Leggings",
    boots: "Champion's Boots"
  },
  guerrier: {
    helmet: "Champion's Helm",
    chestplate: "Champion's Breastplate",
    leggings: "Champion's Leggings",
    boots: "Champion's Boots"
  },
  assassin: {
    helmet: "Champion's Hood",
    chestplate: "Champion's Breastplate",
    leggings: "Champion's Leggings",
    boots: "Boots of the Champion"
  }
};
const CLASS_LABEL_BY_ID = { shaman: "Shaman", mage: "Mage", archer: "Archer", guerrier: "Warrior", assassin: "Assassin" };
const ALL_CHAMPION_NAMES = [...new Set(Object.values(PIECES_BY_CLASS).flatMap((pieces) => Object.values(pieces)))];
const BOOT_DESCRIPTION_BY_CLASS = { shaman: PURIFIED, mage: PURE, archer: PURE, guerrier: PURE, assassin: PURE };

async function seedStoredState(context) {
  await context.addInitScript(() => {
    [
      "sao.walkthrough.index.completed",
      "sao.walkthrough.maps.completed",
      "sao.walkthrough.mainui.completed",
      "sao.walkthrough.characterBuild.completed"
    ].forEach((key) => window.localStorage.setItem(key, "1"));
    window.localStorage.setItem("sao.global.settings", JSON.stringify({ language: "en" }));
  });
}

async function openBuilder(browser) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  await seedStoredState(context);
  const page = await context.newPage();
  const diagnostics = attachDiagnostics(page);
  await page.goto(builderUrl, { waitUntil: "load" });
  await page.locator('[data-source="current"]').click();
  await page.waitForFunction(() => Boolean(window.SAO_CURRENT_EQUIPMENT_DATA), null, { timeout: 15000 });
  await page.waitForFunction(() => Boolean(document.querySelector("#armorSlots [data-slot-id]")), null, {
    timeout: 15000
  });
  await page.waitForTimeout(300);
  return { context, page, ...diagnostics };
}

async function setClass(page, classId, level = 7) {
  await page.evaluate(
    ({ classId, level }) => {
      const levelInput = document.getElementById("characterLevel");
      levelInput.value = String(level);
      levelInput.dispatchEvent(new Event("input", { bubbles: true }));
      const classSelect = document.getElementById("characterClass");
      classSelect.value = classId;
      classSelect.dispatchEvent(new Event("change", { bubbles: true }));
    },
    { classId, level }
  );
  await page.waitForTimeout(400);
}

async function openArmorPicker(page, slotId, search = "") {
  await page.locator(`#armorSlots [data-slot-id="${slotId}"]`).click();
  await page.locator("#itemSearch").fill(search);
  await page.waitForTimeout(200);
}

async function listedNames(page) {
  return page.locator("#itemList .item-card h3").allTextContents();
}

async function equipFromPicker(page, name) {
  const card = page.locator("#itemList .item-card", { has: page.locator(`h3:text-is("${name}")`) }).first();
  await card.waitFor();
  await card.locator(".equip-button").click();
  await page.waitForFunction(() => !document.getElementById("equipmentDialog").open);
  await page.waitForTimeout(120);
}

async function equippedName(page, slotId) {
  const slot = page.locator(`#armorSlots [data-slot-id="${slotId}"]`);
  if (!(await slot.locator(".slot-item").count())) return null;
  return (await slot.locator(".slot-item").textContent()).trim();
}

async function equippedArmor(page) {
  const names = {};
  for (const slotId of ARMOR_SLOTS) names[slotId] = await equippedName(page, slotId);
  return names;
}

/* Reads the rendered picker card for one item: its meta chips, its own stat rows, one entry per
   set-bonus tier and its description. */
function pickerCard(page, name) {
  return page.evaluate((itemName) => {
    const card = [...document.querySelectorAll("#itemList .item-card")].find(
      (node) => node.querySelector("h3").textContent.trim() === itemName
    );
    if (!card) return null;
    const rows = (group) =>
      [...group.querySelectorAll(".stat-entries li")].map((row) => [
        row.querySelector(".stat-entry-name").textContent.trim(),
        (row.querySelector(".stat-entry-value") || {}).textContent || ""
      ]);
    return {
      name: card.querySelector("h3").textContent.trim(),
      meta: [...card.querySelectorAll(".item-meta span")].map((node) => node.textContent.trim()),
      stats: [...card.querySelectorAll("[data-stat-group='item']")].flatMap(rows),
      tiers: [...card.querySelectorAll("[data-stat-group='set-bonus']")].map((group) => ({
        threshold: group.getAttribute("data-set-threshold"),
        title: group.querySelector(".stat-group-title").textContent.trim(),
        effects: rows(group)
      })),
      description: (card.querySelector(".item-description") || {}).textContent || null
    };
  }, name);
}

/* Fills the compendium search and waits until exactly the expected cards are rendered. */
async function searchCompendium(page, query, expectedNames) {
  await page.locator("#ecompendiumSearch").fill(query);
  await page.waitForFunction(
    (names) => {
      const rendered = [...document.querySelectorAll("#entryList .ecompendium-card .ecompendium-name")].map(
        (node) => node.textContent.trim()
      );
      return rendered.length === names.length && names.every((name) => rendered.includes(name));
    },
    expectedNames,
    { timeout: 15000 }
  );
}

function compendiumCards(page) {
  return page.evaluate(() =>
    [...document.querySelectorAll("#entryList .ecompendium-card")].map((card) => ({
      name: card.querySelector(".ecompendium-name").textContent.trim(),
      meta: [...card.querySelectorAll(".ecompendium-meta p")].map((row) => [
        row.children[0].textContent.trim(),
        row.children[1].textContent.trim()
      ]),
      stats: [...card.querySelectorAll(".stat-list li")].map((row) => [
        row.children[0].textContent.trim(),
        row.children[1].textContent.trim()
      ]),
      description: (card.querySelector(".equipment-section p") || {}).textContent || null
    }))
  );
}


(async () => {
  await ensureStaticServer();
  const browser = await chromium.launch({ headless: true });
  const results = [];
  try {
    const session = await openBuilder(browser);
    const { page } = session;

    /* --- class and slot filtering, and every entry equippable ------------------ */
    let equipped = 0;
    const championIds = await page.evaluate(
      (setName) =>
        window.CharacterBuildAdapter.getItems("current")
          .filter((item) => item.set === setName)
          .map((item) => item.id),
      SET_NAME
    );
    for (const [classId, pieces] of Object.entries(PIECES_BY_CLASS)) {
      await setClass(page, classId, 7);
      for (const slotId of ARMOR_SLOTS) {
        const expectedName = pieces[slotId];
        /* The id of the record the picker must offer: the same-name pieces of the other classes
           share their name, so the id is what proves the class filter, not the name. */
        const expectedId = await page.evaluate(
          ({ slotId, classId, expectedName }) => {
            const item = window.CharacterBuildAdapter.getItemsForSlot("current", slotId, classId).find(
              (candidate) => candidate.name === expectedName
            );
            return item ? item.id : null;
          },
          { slotId, classId, expectedName }
        );
        await openArmorPicker(page, slotId, "");
        const listed = await listedNames(page);
        assert.deepEqual(
          listed.filter((name) => ALL_CHAMPION_NAMES.includes(name)),
          [expectedName],
          `${classId}'s ${slotId} picker offers exactly its own ${SET_NAME} piece (${expectedName})`
        );
        const listedIds = await page
          .locator("#itemList .equip-button")
          .evaluateAll((nodes) => nodes.map((node) => node.getAttribute("data-item-id")));
        assert.deepEqual(
          listedIds.filter((id) => championIds.includes(id)),
          [expectedId],
          `${classId}'s ${slotId} picker offers the ${CLASS_LABEL_BY_ID[classId]} record and no same-name record of another class`
        );
        await page.locator("#closeDialog").click();
        await page.waitForFunction(() => !document.getElementById("equipmentDialog").open);
      }
      /* The class' four pieces sit in the four slots at the same time. */
      for (const slotId of ARMOR_SLOTS) {
        await openArmorPicker(page, slotId, pieces[slotId]);
        await equipFromPicker(page, pieces[slotId]);
        assert.equal(
          await equippedName(page, slotId),
          pieces[slotId],
          `${pieces[slotId]} equips in the ${slotId} slot`
        );
        equipped += 1;
      }
      assert.deepEqual(
        await equippedArmor(page),
        pieces,
        `${CLASS_LABEL_BY_ID[classId]} wears its four ${SET_NAME} pieces at once`
      );
    }
    assert.equal(equipped, 20, "all 20 supplied armor entries were equipped");
    results.push({ scope: "class-and-slot-filtering", entries: equipped, status: "passed" });

    /* --- the supplied rune slots and the item card ----------------------------- */
    const shaman = PIECES_BY_CLASS.shaman;
    await setClass(page, "shaman", 7);
    for (const slotId of ARMOR_SLOTS) {
      await openArmorPicker(page, slotId, shaman[slotId]);
      await equipFromPicker(page, shaman[slotId]);
    }
    for (const slotId of ARMOR_SLOTS) {
      assert.equal(
        await page.locator(`#armorSlots .rune-button[data-armor-slot="${slotId}"]`).count(),
        RUNE_SLOTS[slotId],
        `the ${slotId} exposes ${RUNE_SLOTS[slotId]} rune slot(s)`
      );
    }
    await openArmorPicker(page, "helmet", "Champion's Mask");
    const maskCard = await pickerCard(page, "Champion's Mask");
    assert.deepEqual(
      maskCard.meta,
      ["Helmet", "Level 7", "Shaman", `Set: ${SET_NAME}`],
      "the card shows the slot, the minimum level, the class and the set"
    );
    assert.deepEqual(maskCard.stats, STATS_BY_SLOT.helmet, "the card shows the supplied Defense, Health and rune slots");
    assert.deepEqual(
      maskCard.tiers.map((tier) => tier.threshold),
      ["2", "3", "4"],
      "the card shows the three set-bonus tiers"
    );
    assert.deepEqual(
      maskCard.tiers.map((tier) => tier.effects),
      [
        [["PvP Reduction", "+5%"], ["PvP Tenacity", "+5%"]],
        [["PvP Damage", "+5%"]],
        [["Critical Resistance", "+5%"]]
      ],
      "each tier keeps its supplied effects, with PvP Reduction and PvP Tenacity as their own stats"
    );
    assert.equal(maskCard.description, PURIFIED, "the card shows the supplied description");
    await page.locator("#closeDialog").click();
    await page.waitForFunction(() => !document.getElementById("equipmentDialog").open);
    /* The Assassin boots carry the other supplied wording. */
    await setClass(page, "assassin", 7);
    await openArmorPicker(page, "boots", "Boots of the Champion");
    const bootsCard = await pickerCard(page, "Boots of the Champion");
    assert.deepEqual(bootsCard.stats, STATS_BY_SLOT.boots, "the Assassin boots carry no rune slots");
    assert.equal(bootsCard.description, PURE, "the Assassin boots keep the pure-metal wording");
    await page.locator("#closeDialog").click();
    await page.waitForFunction(() => !document.getElementById("equipmentDialog").open);
    results.push({ scope: "rune-slots-and-item-card", status: "passed" });


    /* --- the selection survives a reload, and a removed piece stays removed ---- */
    const assassin = PIECES_BY_CLASS.assassin;
    await setClass(page, "assassin", 7);
    for (const slotId of ARMOR_SLOTS) {
      await openArmorPicker(page, slotId, assassin[slotId]);
      await equipFromPicker(page, assassin[slotId]);
    }
    await page.reload({ waitUntil: "load" });
    await page.waitForFunction(() => Boolean(document.querySelector("#armorSlots [data-slot-id]")), null, {
      timeout: 15000
    });
    await page.waitForTimeout(600);
    assert.deepEqual(await equippedArmor(page), assassin, "the four Assassin pieces are restored after a reload");
    await page.locator('#armorSlots [data-slot-id="leggings"]').click();
    await page.locator("#removeItem").click();
    await page.waitForFunction(() => !document.getElementById("equipmentDialog").open);
    assert.equal(await equippedName(page, "leggings"), null, "the leggings are removed from their slot");
    await page.reload({ waitUntil: "load" });
    await page.waitForFunction(() => Boolean(document.querySelector("#armorSlots [data-slot-id]")), null, {
      timeout: 15000
    });
    await page.waitForTimeout(600);
    assert.equal(await equippedName(page, "leggings"), null, "the removal survives a reload");
    assert.equal(await equippedName(page, "helmet"), assassin.helmet, "the other three pieces stay equipped");

    /* --- switching class drops the armor that is invalid for it --------------- */
    await setClass(page, "mage", 7);
    assert.deepEqual(
      await equippedArmor(page),
      { helmet: null, chestplate: null, leggings: null, boots: null },
      "the Assassin pieces are dropped when the class changes to Mage"
    );
    for (const slotId of ARMOR_SLOTS) {
      await openArmorPicker(page, slotId, PIECES_BY_CLASS.mage[slotId]);
      await equipFromPicker(page, PIECES_BY_CLASS.mage[slotId]);
    }
    assert.deepEqual(await equippedArmor(page), PIECES_BY_CLASS.mage, "the Mage wears its own four pieces");
    assert.deepEqual(session.errors, [], "no console errors while using the armor slots");
    assert.deepEqual(session.failedRequests, [], "no failed requests while using the armor slots");
    results.push({ scope: "persistence-removal-class-switch", status: "passed" });
    await session.context.close();


    /* --- Compendium > Armor lists all 20 entries ------------------------------ */
    const compendiumContext = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    await seedStoredState(compendiumContext);
    const compendiumPage = await compendiumContext.newPage();
    const compendiumDiagnostics = attachDiagnostics(compendiumPage);
    await compendiumPage.goto(compendiumUrl, { waitUntil: "load" });
    await compendiumPage.locator('.list-tab[data-category="armor"]').click();
    const expectedArmor = await compendiumPage.evaluate(
      () => (window.SAO_CURRENT_EQUIPMENT_DATA?.floor1?.armor || []).length
    );
    assert.equal(expectedArmor, 74, "the armor bucket holds the three beginner pieces, the 20 PvP Set P1 pieces and the 51 normal armor pieces");
    await compendiumPage.waitForFunction(
      (count) => document.querySelectorAll("#entryList .ecompendium-card").length === count,
      expectedArmor,
      { timeout: 30000 }
    );
    const listedArmor = await compendiumPage.evaluate(() =>
      [...document.querySelectorAll("#entryList .ecompendium-card .ecompendium-name")].map((node) =>
        node.textContent.trim()
      )
    );
    ALL_CHAMPION_NAMES.forEach((name) =>
      assert.ok(listedArmor.includes(name), `${name} is listed in Compendium > Armor`)
    );
    assert.ok(listedArmor.includes("Beginner's Tunic"), "the existing armor entries are still listed");
    results.push({ scope: "compendium-armor-count", armor: expectedArmor, status: "passed" });

    /* The same-name pieces of different classes stay separate cards. */
    await searchCompendium(compendiumPage, "Champion's Breastplate", Array(5).fill("Champion's Breastplate"));
    const breastplates = await compendiumCards(compendiumPage);
    assert.deepEqual(
      breastplates.map((card) => card.stats.find(([label]) => label === "Class")[1]).sort(),
      ["Archer", "Assassin", "Mage", "Shaman", "Warrior"],
      "all five class breastplates are separate cards, one per class"
    );
    breastplates.forEach((card) => {
      const classLabel = card.stats.find(([label]) => label === "Class")[1];
      assert.deepEqual(
        card.stats,
        [
          ["Class", classLabel],
          ["Defense", "+5"],
          ["Health", "+13"],
          ["Rune Slots", "2"],
          ["2 Piece Set Bonus", "+5% PvP Reduction, +5% PvP Tenacity"],
          ["3 Piece Set Bonus", "+5% PvP Damage"],
          ["4 Piece Set Bonus", "+5% Critical Resistance"]
        ],
        `the ${classLabel} breastplate renders every supplied row`
      );
      assert.deepEqual(
        card.meta,
        [
          ["Level", "7"],
          ["Set", SET_NAME]
        ],
        `the ${classLabel} breastplate renders its minimum level and set`
      );
      assert.equal(card.description, PURIFIED, `the ${classLabel} breastplate renders its description`);
    });


    /* The Shaman mask keeps its canonical name and its own single rune slot. */
    await searchCompendium(compendiumPage, "Champion's Mask", ["Champion's Mask"]);
    const maskEntry = (await compendiumCards(compendiumPage))[0];
    assert.deepEqual(
      maskEntry.stats,
      [
        ["Class", "Shaman"],
        ["Defense", "+2"],
        ["Health", "+9"],
        ["Rune Slots", "1"],
        ["2 Piece Set Bonus", "+5% PvP Reduction, +5% PvP Tenacity"],
        ["3 Piece Set Bonus", "+5% PvP Damage"],
        ["4 Piece Set Bonus", "+5% Critical Resistance"]
      ],
      "the mask renders its supplied rows under its canonical name"
    );
    assert.deepEqual(compendiumDiagnostics.errors, [], "no console errors in the compendium");
    await compendiumContext.close();
    results.push({ scope: "compendium-armor-rendering", status: "passed" });

    console.log(JSON.stringify({ results, status: "passed" }, null, 2));
    console.log("Current-Data Champion's PvP armor UI regression checks passed.");
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

