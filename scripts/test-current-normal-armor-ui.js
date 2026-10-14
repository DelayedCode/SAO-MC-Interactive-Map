/* Current-Data normal armor browser regression checks.

   Drives the real pages against the 51 supplied normal armor pieces (levels 3, 7 and 9 for the
   Warrior, Assassin, Archer, Mage and Shaman):
     - the armor pickers offer exactly the selected class' own pieces for each slot, at every
       supplied minimum level (a level 3 item is hidden at level 1 and listed at level 3);
     - all 51 pieces equip in their slot, and one class' four-piece set sits in the four slots at
       once;
     - the ten pieces the source gives a rune slot expose it (and the other 41 expose none);
     - the item card shows the slot, the minimum level, the class, the set, the supplied Defense,
       Health, rune slots, every set-bonus tier and the description;
     - a selection survives a reload, can be removed and stays removed, and switching class drops
       the armor that is invalid for the new class;
     - Compendium > Armor lists all 74 entries, keeps the same-name pieces of two classes as
       separate cards, and renders the supplied level, set, stats and description;
     - the supplied names and descriptions render in Spanish.
   */
"use strict";

const assert = require("node:assert/strict");
const { chromium } = require("playwright");
const { attachDiagnostics, ensureStaticServer } = require("./harness-helpers");

const rootUrl = process.env.SAO_BASE_URL || "http://127.0.0.1:8080";
const builderUrl = `${rootUrl}/Aincrad/Character%20Build/character-build.html`;
const compendiumUrl = `${rootUrl}/Aincrad/eCompendium/ecompendium.html?floor=floor1&dataset=current`;

const ARMOR_SLOTS = ["helmet", "chestplate", "leggings", "boots"];

/* The supplied matrix per class, in the order the source lists it. */
const PIECES_BY_CLASS = {
  guerrier: [
    { slot: "chestplate", name: "Ika Breastplate", level: 3 },
    { slot: "leggings", name: "Ika Leggings", level: 3 },
    { slot: "boots", name: "Ika Boots", level: 3 },
    { slot: "helmet", name: "Protector's Helmet (Warrior)", level: 7 },
    { slot: "chestplate", name: "Protector's Breastplate (Warrior)", level: 7 },
    { slot: "leggings", name: "Protector's Leggings (Warrior)", level: 7 },
    { slot: "boots", name: "Protector's Boots (Warrior)", level: 7 },
    { slot: "helmet", name: "Guardian's Helmet (Warrior)", level: 9 },
    { slot: "chestplate", name: "Guardian's Chestplate (Warrior)", level: 9 },
    { slot: "leggings", name: "Guardian's Leggings (Warrior)", level: 9 },
    { slot: "boots", name: "Guardian's Boots (Warrior)", level: 9 }
  ],
  assassin: [
    { slot: "chestplate", name: "Tactical Chestplate", level: 3 },
    { slot: "leggings", name: "Tactical Leggings", level: 3 },
    { slot: "boots", name: "Tactical Boots", level: 3 },
    { slot: "chestplate", name: "Ninja Tunic (Assassin)", level: 7 },
    { slot: "leggings", name: "Ninja Leggings (Assassin)", level: 7 },
    { slot: "boots", name: "Ninja Boots (Assassin)", level: 7 },
    { slot: "helmet", name: "Herald's Helmet (Assassin)", level: 9 },
    { slot: "chestplate", name: "Herald's Tunic (Assassin)", level: 9 },
    { slot: "leggings", name: "Herald's Leggings (Assassin)", level: 9 },
    { slot: "boots", name: "Herald's Boots (Assassin)", level: 9 }
  ],
  archer: [
    { slot: "chestplate", name: "Tactical Chestplate", level: 3 },
    { slot: "leggings", name: "Tactical Leggings", level: 3 },
    { slot: "boots", name: "Tactical Boots", level: 3 },
    { slot: "chestplate", name: "Hunter's Tunic (Archer)", level: 7 },
    { slot: "leggings", name: "Hunter's Leggings (Archer)", level: 7 },
    { slot: "boots", name: "Hunter's Boots (Archer)", level: 7 },
    { slot: "helmet", name: "Herald's Helmet (Archer)", level: 9 },
    { slot: "chestplate", name: "Herald's Tunic (Archer)", level: 9 },
    { slot: "leggings", name: "Herald's Leggings (Archer)", level: 9 },
    { slot: "boots", name: "Herald's Boots (Archer)", level: 9 }
  ],
  mage: [
    { slot: "chestplate", name: "Spectral Breastplate", level: 3 },
    { slot: "leggings", name: "Spectral Leggings", level: 3 },
    { slot: "boots", name: "Spectral Boots", level: 3 },
    { slot: "chestplate", name: "Sorcerer's Robe (Mage)", level: 7 },
    { slot: "leggings", name: "Sorcerer's Leggings (Mage)", level: 7 },
    { slot: "boots", name: "Sorcerer's Sandals (Mage)", level: 7 },
    { slot: "helmet", name: "Reaper's Helmet (Mage)", level: 9 },
    { slot: "chestplate", name: "Reaper's Chestplate (Mage)", level: 9 },
    { slot: "leggings", name: "Reaper's Leggings (Mage)", level: 9 },
    { slot: "boots", name: "Reaper's Boots (Mage)", level: 9 }
  ],
  shaman: [
    { slot: "chestplate", name: "Spectral Breastplate", level: 3 },
    { slot: "leggings", name: "Spectral Leggings", level: 3 },
    { slot: "boots", name: "Spectral Boots", level: 3 },
    { slot: "chestplate", name: "Magician's Robe (Shaman)", level: 7 },
    { slot: "leggings", name: "Magician's Leggings (Shaman)", level: 7 },
    { slot: "boots", name: "Magician's Sandals (Shaman)", level: 7 },
    { slot: "helmet", name: "Reaper's Helmet (Shaman)", level: 9 },
    { slot: "chestplate", name: "Reaper's Chestplate (Shaman)", level: 9 },
    { slot: "leggings", name: "Reaper's Leggings (Shaman)", level: 9 },
    { slot: "boots", name: "Reaper's Boots (Shaman)", level: 9 }
  ]
};
const CLASS_LABEL_BY_ID = {
  shaman: "Shaman",
  mage: "Mage",
  archer: "Archer",
  guerrier: "Warrior",
  assassin: "Assassin"
};
const ALL_PIECES = Object.values(PIECES_BY_CLASS).flat();
const NORMAL_NAMES = [...new Set(ALL_PIECES.map((piece) => piece.name))];
const RUNE_SLOT_ITEMS = [
  "Guardian's Chestplate (Warrior)",
  "Guardian's Leggings (Warrior)",
  "Herald's Tunic (Assassin)",
  "Herald's Leggings (Assassin)",
  "Herald's Tunic (Archer)",
  "Herald's Leggings (Archer)",
  "Reaper's Chestplate (Mage)",
  "Reaper's Leggings (Mage)",
  "Reaper's Chestplate (Shaman)",
  "Reaper's Leggings (Shaman)"
];
const GUARDIAN_DESCRIPTION = "Replica of the Guardian's Armor. Fallen: Heavy and unshakeable, it defies death itself.";
const SHAMAN_REAPER_LEGGINGS_DESCRIPTION =
  "A replica of the Fallen Reaper, it grants the shaman mana for both healing and striking.";

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

async function setClass(page, classId, level) {
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

async function listedItemIds(page) {
  return page
    .locator("#itemList .equip-button")
    .evaluateAll((nodes) => nodes.map((node) => node.getAttribute("data-item-id")));
}

async function equipFromPicker(page, name) {
  const card = page.locator("#itemList .item-card", { has: page.locator(`h3:text-is("${name}")`) }).first();
  await card.waitFor();
  await card.locator(".equip-button").click();
  await page.waitForFunction(() => !document.getElementById("equipmentDialog").open);
  await page.waitForTimeout(120);
}

async function closePicker(page) {
  await page.locator("#closeDialog").click();
  await page.waitForFunction(() => !document.getElementById("equipmentDialog").open);
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

/* The ids of every normal armor record the picker may list, read from the adapter the page uses. */
async function normalArmorIds(page) {
  return page.evaluate(
    (names) =>
      window.CharacterBuildAdapter.getItems("current")
        .filter((item) => item.category === "armor" && names.includes(item.name))
        .map((item) => item.id),
    NORMAL_NAMES
  );
}

/* The ids of the records the picker must offer for one class and slot. */
async function expectedIdsFor(page, slotId, classId) {
  return page.evaluate(
    ({ slotId, classId, names }) =>
      window.CharacterBuildAdapter.getItemsForSlot("current", slotId, classId)
        .filter((item) => names.includes(item.name))
        .map((item) => item.id)
        .sort(),
    { slotId, classId, names: NORMAL_NAMES }
  );
}

/* The names of the records the picker must offer for one class and slot. */
async function expectedNamesFor(page, slotId, classId) {
  return page.evaluate(
    ({ slotId, classId, names }) =>
      window.CharacterBuildAdapter.getItemsForSlot("current", slotId, classId)
        .filter((item) => names.includes(item.name))
        .map((item) => item.name)
        .sort(),
    { slotId, classId, names: NORMAL_NAMES }
  );
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
      const rendered = [...document.querySelectorAll("#entryList .ecompendium-card .ecompendium-name")].map((node) =>
        node.textContent.trim()
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
    const normalIds = await normalArmorIds(page);

    /* Only the ten supplied pieces expose a rune slot. */
    const runeSlotNames = await page.evaluate(
      (names) =>
        window.CharacterBuildAdapter.getItems("current")
          .filter(
            (item) =>
              item.category === "armor" &&
              names.includes(item.name) &&
              window.CharacterBuildAdapter.getRuneSlots(item) > 0
          )
          .map((item) => item.name),
      NORMAL_NAMES
    );
    assert.deepEqual(
      [...new Set(runeSlotNames)].sort(),
      [...RUNE_SLOT_ITEMS].sort(),
      "exactly the ten supplied items expose a rune slot"
    );

    /* --- the minimum level gates the picker ---------------------------------- */
    const ika = PIECES_BY_CLASS.guerrier[0];
    for (const level of [1, 2]) {
      await setClass(page, "guerrier", level);
      await openArmorPicker(page, ika.slot, "");
      const listed = await listedNames(page);
      assert.deepEqual(
        listed.filter((name) => NORMAL_NAMES.includes(name)),
        [],
        `the level ${ika.level} ${ika.name} is not offered at level ${level}`
      );
      await closePicker(page);
    }
    await setClass(page, "guerrier", 3);
    await openArmorPicker(page, ika.slot, "");
    assert.deepEqual(
      (await listedNames(page)).filter((name) => NORMAL_NAMES.includes(name)),
      ["Ika Breastplate"],
      "at level 3 only the level 3 Warrior chestplate is offered"
    );
    await closePicker(page);
    await setClass(page, "guerrier", 7);
    await openArmorPicker(page, ika.slot, "");
    assert.deepEqual(
      (await listedNames(page)).filter((name) => NORMAL_NAMES.includes(name)),
      ["Ika Breastplate", "Protector's Breastplate (Warrior)"],
      "at level 7 the level 9 Warrior chestplate is still hidden"
    );
    await closePicker(page);
    results.push({ scope: "minimum-level-gating", status: "passed" });

    /* --- class and slot filtering, and every entry equippable ---------------- */
    let equipped = 0;
    for (const [classId, pieces] of Object.entries(PIECES_BY_CLASS)) {
      await setClass(page, classId, 9);
      for (const slotId of ARMOR_SLOTS) {
        const expectedIds = await expectedIdsFor(page, slotId, classId);
        await openArmorPicker(page, slotId, "");
        assert.deepEqual(
          (await listedItemIds(page)).filter((id) => normalIds.includes(id)).sort(),
          expectedIds,
          `${classId}'s ${slotId} picker offers exactly its own normal armor records`
        );
        assert.deepEqual(
          (await listedNames(page)).filter((name) => NORMAL_NAMES.includes(name)).sort(),
          await expectedNamesFor(page, slotId, classId),
          `${classId}'s ${slotId} picker lists exactly the class' own normal armor names`
        );
        await closePicker(page);
      }
      /* Every piece of the class equips in its own slot. */
      for (const piece of pieces) {
        await openArmorPicker(page, piece.slot, piece.name);
        await equipFromPicker(page, piece.name);
        assert.equal(
          await equippedName(page, piece.slot),
          piece.name,
          `${piece.name} equips in the ${piece.slot} slot`
        );
        equipped += 1;
      }
      const lastBySlot = {};
      pieces.forEach((piece) => {
        lastBySlot[piece.slot] = piece.name;
      });
      assert.deepEqual(
        await equippedArmor(page),
        lastBySlot,
        `${CLASS_LABEL_BY_ID[classId]} holds one piece per slot at the same time`
      );
    }
    assert.equal(equipped, 51, "all 51 supplied armor entries were equipped");
    results.push({ scope: "class-and-slot-filtering", entries: equipped, status: "passed" });

    /* --- the supplied rune slots and the item card --------------------------- */
    const shamanPieces = PIECES_BY_CLASS.shaman;
    const lastBySlotOf = (pieces, slotId) => [...pieces].reverse().find((candidate) => candidate.slot === slotId);
    await setClass(page, "shaman", 9);
    for (const slotId of ARMOR_SLOTS) {
      const piece = lastBySlotOf(shamanPieces, slotId);
      await openArmorPicker(page, slotId, piece.name);
      await equipFromPicker(page, piece.name);
    }
    /* The Shaman Reaper's set: the helmet and boots carry no rune slot, the chestplate and leggings
       carry the one the source gives them. */
    const shamanRuneSlots = { helmet: 0, chestplate: 1, leggings: 1, boots: 0 };
    for (const slotId of ARMOR_SLOTS) {
      assert.equal(
        await page.locator(`#armorSlots .rune-button[data-armor-slot="${slotId}"]`).count(),
        shamanRuneSlots[slotId],
        `the ${slotId} exposes ${shamanRuneSlots[slotId]} rune slot(s)`
      );
    }
    const shamanHelmet = lastBySlotOf(shamanPieces, "helmet");
    await openArmorPicker(page, "helmet", shamanHelmet.name);
    const helmetCard = await pickerCard(page, shamanHelmet.name);
    assert.deepEqual(
      helmetCard.meta,
      ["Helmet", "Level 9", "Shaman", "Set: Attentive Reaper Set"],
      "the card shows the slot, the minimum level, the class and the supplied set"
    );
    assert.deepEqual(
      helmetCard.stats,
      [
        ["Defense", "+1"],
        ["Health", "+5"]
      ],
      "the helmet shows its supplied Defense and Health and no invented rune row"
    );
    assert.deepEqual(
      helmetCard.tiers.map((tier) => [tier.threshold, tier.effects]),
      [
        ["2", [["Mana/s", "+0.15"]]],
        ["3", [["Bonus Healing", "+1.5"]]],
        ["4", [["Ability Haste", "+2%"]]]
      ],
      "the helmet shows its three supplied set-bonus tiers"
    );
    assert.equal(
      helmetCard.description,
      "A replica of the Fallen Reaper, it floods the shaman with mana for both healing and striking.",
      "the helmet shows its supplied description"
    );
    await closePicker(page);
    /* The chestplate carries the supplied rune slot, and the leggings the source's own wording. */
    const shamanChestplate = lastBySlotOf(shamanPieces, "chestplate");
    await openArmorPicker(page, "chestplate", shamanChestplate.name);
    const chestplateCard = await pickerCard(page, shamanChestplate.name);
    assert.deepEqual(
      chestplateCard.stats,
      [
        ["Defense", "+4"],
        ["Health", "+15"],
        ["Rune Slots", "1"]
      ],
      "the chestplate shows its supplied rune slot"
    );
    await closePicker(page);
    const shamanReaperLeggings = lastBySlotOf(shamanPieces, "leggings");
    await openArmorPicker(page, "leggings", shamanReaperLeggings.name);
    const leggingsCard = await pickerCard(page, shamanReaperLeggings.name);
    assert.equal(
      leggingsCard.description,
      SHAMAN_REAPER_LEGGINGS_DESCRIPTION,
      "the Shaman leggings keep the source's own wording"
    );
    await closePicker(page);
    /* The Sorcerer's 3-piece tier lists two effects, and the Guardian chestplate its single slot. */
    await setClass(page, "mage", 9);
    await openArmorPicker(page, "chestplate", "Sorcerer's Robe (Mage)");
    const robeCard = await pickerCard(page, "Sorcerer's Robe (Mage)");
    assert.deepEqual(
      robeCard.tiers.map((tier) => [tier.threshold, tier.effects]),
      [
        ["2", [["Mana/s", "+0.15"]]],
        [
          "3",
          [
            ["Bonus Healing", "+1"],
            ["Ability Haste", "+2%"]
          ]
        ]
      ],
      "the Sorcerer's 3-piece tier keeps both supplied effects"
    );
    await closePicker(page);
    await setClass(page, "guerrier", 9);
    await openArmorPicker(page, "chestplate", "Guardian's Chestplate (Warrior)");
    const guardianCard = await pickerCard(page, "Guardian's Chestplate (Warrior)");
    assert.deepEqual(
      guardianCard.stats,
      [
        ["Defense", "+4"],
        ["Health", "+20"],
        ["Rune Slots", "1"]
      ],
      "the Guardian chestplate shows its supplied rune slot"
    );
    assert.equal(guardianCard.description, GUARDIAN_DESCRIPTION, "the Guardian chestplate keeps its description");
    await closePicker(page);
    results.push({ scope: "rune-slots-and-item-card", status: "passed" });

    /* --- the selection survives a reload, and a removed piece stays removed -- */
    const assassinPieces = PIECES_BY_CLASS.assassin;
    await setClass(page, "assassin", 9);
    for (const slotId of ARMOR_SLOTS) {
      const piece = lastBySlotOf(assassinPieces, slotId);
      await openArmorPicker(page, slotId, piece.name);
      await equipFromPicker(page, piece.name);
    }
    const assassinExpected = await equippedArmor(page);
    await page.reload({ waitUntil: "load" });
    await page.waitForFunction(() => Boolean(document.querySelector("#armorSlots [data-slot-id]")), null, {
      timeout: 15000
    });
    await page.waitForTimeout(600);
    assert.deepEqual(
      await equippedArmor(page),
      assassinExpected,
      "the four Assassin pieces are restored after a reload"
    );
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
    assert.equal(await equippedName(page, "helmet"), assassinExpected.helmet, "the other three pieces stay equipped");

    /* --- switching class drops the armor that is invalid for it -------------- */
    await setClass(page, "mage", 9);
    assert.deepEqual(
      await equippedArmor(page),
      { helmet: null, chestplate: null, leggings: null, boots: null },
      "the Assassin pieces are dropped when the class changes to Mage"
    );
    for (const slotId of ARMOR_SLOTS) {
      const piece = lastBySlotOf(PIECES_BY_CLASS.mage, slotId);
      await openArmorPicker(page, slotId, piece.name);
      await equipFromPicker(page, piece.name);
    }
    const mageExpected = {};
    PIECES_BY_CLASS.mage.forEach((piece) => {
      mageExpected[piece.slot] = piece.name;
    });
    assert.deepEqual(await equippedArmor(page), mageExpected, "the Mage wears its own pieces");
    assert.deepEqual(session.errors, [], "no console errors while using the armor slots");
    assert.deepEqual(session.failedRequests, [], "no failed requests while using the armor slots");
    results.push({ scope: "persistence-removal-class-switch", status: "passed" });
    await session.context.close();

    /* --- Compendium > Armor lists all 74 entries ----------------------------- */
    const compendiumContext = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    await seedStoredState(compendiumContext);
    const compendiumPage = await compendiumContext.newPage();
    const compendiumDiagnostics = attachDiagnostics(compendiumPage);
    await compendiumPage.goto(compendiumUrl, { waitUntil: "load" });
    await compendiumPage.locator('.list-tab[data-category="armor"]').click();
    const expectedArmor = await compendiumPage.evaluate(
      () => (window.SAO_CURRENT_EQUIPMENT_DATA?.floor1?.armor || []).length
    );
    assert.equal(
      expectedArmor,
      74,
      "the armor bucket holds the three beginner pieces, the 20 PvP Set P1 pieces and the 51 normal armor pieces"
    );
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
    NORMAL_NAMES.forEach((name) => assert.ok(listedArmor.includes(name), `${name} is listed in Compendium > Armor`));
    assert.ok(listedArmor.includes("Beginner's Tunic"), "the existing armor entries are still listed");
    results.push({ scope: "compendium-armor-count", armor: expectedArmor, status: "passed" });

    /* The Ika Breastplate renders every supplied row under its canonical name. */
    await searchCompendium(compendiumPage, "Ika Breastplate", ["Ika Breastplate"]);
    const ikaEntry = (await compendiumCards(compendiumPage))[0];
    assert.deepEqual(
      ikaEntry.stats,
      [
        ["Class", "Warrior"],
        ["Defense", "+2"],
        ["Health", "+12"],
        ["2 Piece Set Bonus", "+0.5 Stamina"],
        ["3 Piece Set Bonus", "+0.5 Health"]
      ],
      "the Ika Breastplate renders its supplied stats and both set-bonus tiers"
    );
    assert.deepEqual(
      ikaEntry.meta,
      [
        ["Level", "3"],
        ["Set", "Ika Set"]
      ],
      "the Ika Breastplate renders its minimum level and set"
    );
    assert.equal(
      ikaEntry.description,
      "Carved from the shell of the ancient Ika turtles, it absorbs the initial blows.",
      "the Ika Breastplate renders its description"
    );

    /* The same-name pieces of two classes stay separate cards, with their own class, set and stats. */
    await searchCompendium(compendiumPage, "Tactical Chestplate", ["Tactical Chestplate", "Tactical Chestplate"]);
    const tacticalCards = await compendiumCards(compendiumPage);
    assert.deepEqual(
      tacticalCards.map((card) => card.stats.find(([label]) => label === "Class")[1]).sort(),
      ["Archer", "Assassin"],
      "both Tactical Chestplates are listed, one per class"
    );
    assert.deepEqual(
      tacticalCards.map((card) => card.meta.find(([label]) => label === "Set")[1]).sort(),
      ["Stealth Set", "Tactical Set"],
      "each class' Tactical Chestplate keeps its own supplied set"
    );
    tacticalCards.forEach((card) => {
      assert.deepEqual(
        card.stats,
        [
          ["Class", card.stats[0][1]],
          ["Defense", "+2"],
          ["Health", "+9"],
          ["2 Piece Set Bonus", card.meta[1][1] === "Stealth Set" ? "+2% Dodge Chance" : "+0.05 Stamina/s"],
          ["3 Piece Set Bonus", card.meta[1][1] === "Stealth Set" ? "+1% Critical Damage" : "+0.25 Attack Damage"]
        ],
        "the Tactical Chestplate renders the stats its class' set supplies"
      );
    });

    /* The Shaman Reaper's Leggings keep the wording the source gives them. */
    await searchCompendium(compendiumPage, "Reaper's Leggings", [
      "Reaper's Leggings (Mage)",
      "Reaper's Leggings (Shaman)"
    ]);
    const reaperLeggings = await compendiumCards(compendiumPage);
    const shamanLeggings = reaperLeggings.find((card) => card.name.includes("(Shaman)"));
    assert.equal(shamanLeggings.description, SHAMAN_REAPER_LEGGINGS_DESCRIPTION, "the Shaman wording is kept");
    assert.deepEqual(
      shamanLeggings.stats,
      [
        ["Class", "Shaman"],
        ["Defense", "+3"],
        ["Health", "+11"],
        ["Rune Slots", "1"],
        ["2 Piece Set Bonus", "+0.15 Mana/s"],
        ["3 Piece Set Bonus", "+1.5 Bonus Healing"],
        ["4 Piece Set Bonus", "+2% Ability Haste"]
      ],
      "the Shaman leggings render every supplied row"
    );
    assert.deepEqual(
      shamanLeggings.meta,
      [
        ["Level", "9"],
        ["Set", "Attentive Reaper Set"]
      ],
      "the Shaman leggings render their minimum level and set"
    );

    /* The Guardian chestplate keeps its name and its supplied rune slot. */
    await searchCompendium(compendiumPage, "Guardian's Chestplate", ["Guardian's Chestplate (Warrior)"]);
    const guardianEntry = (await compendiumCards(compendiumPage))[0];
    assert.deepEqual(
      guardianEntry.stats,
      [
        ["Class", "Warrior"],
        ["Defense", "+4"],
        ["Health", "+20"],
        ["Rune Slots", "1"],
        ["2 Piece Set Bonus", "+1.5 Max Stamina"],
        ["3 Piece Set Bonus", "+0.15 Health/s"],
        ["4 Piece Set Bonus", "+2% Block Chance"]
      ],
      "the Guardian chestplate renders its supplied rune slot and tiers"
    );
    assert.equal(guardianEntry.description, GUARDIAN_DESCRIPTION, "the Guardian chestplate renders its description");
    assert.deepEqual(compendiumDiagnostics.errors, [], "no console errors in the compendium");

    /* --- the supplied names and descriptions render in Spanish ---------------- */
    await searchCompendium(compendiumPage, "Ika Breastplate", ["Ika Breastplate"]);
    await compendiumPage.evaluate(() => window.SAOI18n.setLanguage("es"));
    await compendiumPage.waitForFunction(
      () =>
        document.querySelector("#entryList .ecompendium-card .ecompendium-name")?.textContent.trim() ===
        "Coraza de Ika",
      null,
      { timeout: 15000 }
    );
    const spanishEntry = (await compendiumCards(compendiumPage))[0];
    assert.deepEqual(
      spanishEntry.stats,
      [
        ["Clase", "Guerrero"],
        ["Defensa", "+2"],
        ["Salud", "+12"],
        ["Bonus de conjunto de 2 piezas", "+0.5 Resistencia"],
        ["Bonus de conjunto de 3 piezas", "+0.5 Salud"]
      ],
      "the Spanish card keeps the supplied values under the localized stat labels"
    );
    assert.equal(
      spanishEntry.description,
      "Tallada en el caparazón de las antiguas tortugas Ika, absorbe los primeros golpes.",
      "the Spanish card renders the supplied description in Spanish"
    );
    await compendiumContext.close();
    results.push({ scope: "compendium-armor-rendering", status: "passed" });

    console.log(JSON.stringify({ results, status: "passed" }, null, 2));
    console.log("Current-Data normal armor UI regression checks passed.");
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
