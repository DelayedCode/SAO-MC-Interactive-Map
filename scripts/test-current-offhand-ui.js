/* Current-Data off-hand browser regression checks.

   Drives the real pages against the 32 supplied off-hand entries (shields, daggers, quivers,
   lanterns and grimoires):
     - the Offhand picker lists the selected class' off-hand equipment and nothing else;
     - every one of the 32 can be equipped in the Offhand slot and comes back after a reload;
     - the same-name variants stay separate cards and replace each other in the single slot;
     - a two-handed Main Hand weapon still locks the Offhand slot, refuses to equip while an
       Offhand item is held, and reopens the slot when a one-handed weapon takes over;
     - a stored build that pairs a two-handed Main Hand weapon with an Offhand item is sanitised;
     - Compendium > Weapons lists every entry with its source category and structured stat rows.
 */
"use strict";

const assert = require("node:assert/strict");
const { chromium } = require("playwright");
const { attachDiagnostics, ensureStaticServer } = require("./harness-helpers");

const rootUrl = process.env.SAO_BASE_URL || "http://127.0.0.1:8080";
const builderUrl = `${rootUrl}/Aincrad/Character%20Build/character-build.html`;
const compendiumUrl = `${rootUrl}/Aincrad/eCompendium/ecompendium.html?floor=floor1&dataset=current`;

/* The 32 supplied entries grouped by the class that can wear them. */
const OFFHAND_BY_CLASS = {
  guerrier: [
    "Ika's Shield",
    "Spiked Wooden Shield",
    "Copper Shield (Defensive)",
    "Copper Shield (Offensive)",
    "Tolbana Shield (Defensive)",
    "Tolbana Shield (Offensive)",
    "Iron Shield (Defensive)",
    "Iron Shield (Offensive)"
  ],
  assassin: ["Basic Dagger (Offhand)", "Copper Dagger (Offhand)", "Albal's Dagger", "Iron Dagger (Offhand)"],
  archer: ["Basic Quiver", "Copper Quiver", "Hunter's Quiver", "Iron Quiver"],
  mage: [
    "Basic Lantern (Mage)",
    "Grimoire Sylvestre",
    "Grimoire of the Revenants",
    "Copper Lantern (Mage)",
    "Magician's Grimoire (Mage)",
    "Magician's Lantern (Mage)",
    "Dark Grimoire (Mage)",
    "Iron Lantern (Mage)"
  ],
  shaman: [
    "Beastly Grimoire",
    "Basic Lantern (Shaman)",
    "Copper Lantern (Shaman)",
    "Skeletal Grimoire",
    "Magician's Lantern (Shaman)",
    "Sorcerer's Grimoire (Shaman)",
    "Iron Lantern (Shaman)",
    "Ghostly Grimoire"
  ]
};

/* Names the picker must never offer to the wrong class. */
const OTHER_CLASS_MARKERS = {
  guerrier: /Dagger|Quiver|Lantern|Grimoire/,
  assassin: /Shield|Quiver|Lantern|Grimoire/,
  archer: /Shield|Dagger|Lantern|Grimoire/,
  mage: /Shield|Dagger|Quiver/,
  shaman: /Shield|Dagger|Quiver/
};

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
  await page.waitForFunction(() => Boolean(document.querySelector("#weaponSlots [data-slot-id]")), null, {
    timeout: 15000
  });
  await page.waitForTimeout(300);
  return { context, page, ...diagnostics };
}

async function setClass(page, classId, level = 9) {
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

async function openOffhandPicker(page, search = "") {
  await page.locator('#weaponSlots [data-slot-id="offhand"]').click();
  await page.locator("#itemSearch").fill(search);
  await page.waitForTimeout(200);
}

function itemCard(page, itemName) {
  return page.locator("#itemList .item-card", { has: page.locator(`h3:text-is("${itemName}")`) }).first();
}

async function equipOffhand(page, itemName) {
  await openOffhandPicker(page, itemName);
  const card = itemCard(page, itemName);
  await card.waitFor();
  await card.locator(".equip-button").click();
  await page.waitForFunction(() => !document.getElementById("equipmentDialog").open);
  await page.waitForTimeout(120);
}

async function equippedName(page, slotId) {
  const slot = page.locator(`#weaponSlots [data-slot-id="${slotId}"]`);
  if (!(await slot.locator(".slot-item").count())) return null;
  return (await slot.locator(".slot-item").textContent()).trim();
}

async function t(page, key) {
  return page.evaluate((name) => window.SAOI18n.t(name), key);
}

/* Fills the compendium search and waits until exactly the expected cards are rendered, so
   assertions never race the batched re-render (the card count alone can match the previous
   query's result). */
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
      badge: (card.querySelector(".ecompendium-badge") || {}).textContent || null,
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

    /* --- class filtering and every entry equippable in Offhand ----------------- */
    let equipped = 0;
    for (const [classId, names] of Object.entries(OFFHAND_BY_CLASS)) {
      await setClass(page, classId);
      await openOffhandPicker(page, "");
      const listed = await page.locator("#itemList .item-card h3").allTextContents();
      await page.locator("#closeDialog").click();
      await page.waitForFunction(() => !document.getElementById("equipmentDialog").open);

      names.forEach((name) =>
        assert.ok(listed.includes(name), `${name} is offered to ${classId} in the Offhand slot`)
      );
      assert.equal(
        listed.some((name) => OTHER_CLASS_MARKERS[classId].test(name)),
        false,
        `${classId} is never offered another class' off-hand equipment (${listed.join(", ")})`
      );

      for (const name of names) {
        await equipOffhand(page, name);
        assert.equal(await equippedName(page, "offhand"), name, `${name} equips in the Offhand slot`);
        equipped += 1;
      }
    }
    assert.equal(equipped, 32, "all 32 supplied off-hand entries were equipped");
    results.push({ scope: "offhand-class-filtering-and-equip", entries: equipped, status: "passed" });

    /* --- the same-name variants stay separate cards ---------------------------- */
    await setClass(page, "guerrier");
    await openOffhandPicker(page, "Copper Shield");
    const variantNames = await page.locator("#itemList .item-card h3").allTextContents();
    assert.deepEqual(
      variantNames.sort(),
      ["Copper Shield (Defensive)", "Copper Shield (Offensive)"],
      "the two Copper Shield variants are listed as separate cards"
    );
    await itemCard(page, "Copper Shield (Defensive)").locator(".equip-button").click();
    await page.waitForFunction(() => !document.getElementById("equipmentDialog").open);
    assert.equal(await equippedName(page, "offhand"), "Copper Shield (Defensive)");
    await equipOffhand(page, "Copper Shield (Offensive)");
    assert.equal(
      await equippedName(page, "offhand"),
      "Copper Shield (Offensive)",
      "the other variant replaces it in the single Offhand slot"
    );
    results.push({ scope: "duplicate-name-variants", status: "passed" });

    /* --- a two-handed Main Hand weapon still governs the Offhand slot ---------- */
    await page.locator('#weaponSlots [data-slot-id="main-weapon"]').click();
    await page.locator("#itemSearch").fill("Copper Greatsword");
    const greatsword = itemCard(page, "Copper Greatsword");
    await greatsword.waitFor();
    await greatsword.locator(".equip-button").click();
    assert.equal(
      (await page.locator("#pickerNotice").textContent()).trim(),
      await t(page, "page.characterBuild.removeOffhandFirst"),
      "a two-handed Main Hand weapon is refused while an off-hand entry is held"
    );
    await page.locator("#closeDialog").click();
    assert.equal(await equippedName(page, "offhand"), "Copper Shield (Offensive)", "the off-hand entry is kept");

    /* Remove it, equip the two-handed weapon, and the Offhand slot locks. */
    await page.locator('#weaponSlots [data-slot-id="offhand"]').click();
    await page.locator("#removeItem").click();
    await page.waitForFunction(() => !document.getElementById("equipmentDialog").open);
    await page.locator('#weaponSlots [data-slot-id="main-weapon"]').click();
    await page.locator("#itemSearch").fill("Copper Greatsword");
    await itemCard(page, "Copper Greatsword").locator(".equip-button").click();
    await page.waitForFunction(() => !document.getElementById("equipmentDialog").open);
    assert.equal(await equippedName(page, "main-weapon"), "Copper Greatsword");
    const lockedSlot = page.locator('#weaponSlots .slot-button[data-slot-id="offhand"]');
    assert.equal(await lockedSlot.getAttribute("aria-disabled"), "true", "the Offhand slot is locked");
    /* No off-hand entry can slip past the lock: the delegated slot click is refused outright. */
    assert.equal(
      await page.evaluate(() => {
        document.querySelector('#weaponSlots [data-slot-id="offhand"]').click();
        return document.getElementById("equipmentDialog").open;
      }),
      false,
      "no off-hand entry bypasses the two-handed restriction"
    );
    results.push({ scope: "two-handed-locks-offhand", status: "passed" });

    /* --- a one-handed Main Hand weapon reopens the slot ------------------------ */
    await page.locator('#weaponSlots [data-slot-id="main-weapon"]').click();
    await page.locator("#itemSearch").fill("Guardian's Sword");
    await itemCard(page, "Guardian's Sword").locator(".equip-button").click();
    await page.waitForFunction(() => !document.getElementById("equipmentDialog").open);
    assert.equal(
      await page.locator('#weaponSlots .slot-button[data-slot-id="offhand"].is-locked').count(),
      0,
      "the Offhand slot reopens for a one-handed Main Hand weapon"
    );
    assert.equal(await equippedName(page, "offhand"), null, "nothing is equipped automatically");
    await equipOffhand(page, "Ika's Shield");
    assert.equal(await equippedName(page, "offhand"), "Ika's Shield", "an off-hand entry equips again");
    results.push({ scope: "one-handed-reopens-offhand", status: "passed" });

    /* --- the selection survives a reload --------------------------------------- */
    await page.reload({ waitUntil: "load" });
    await page.waitForFunction(() => Boolean(document.querySelector("#weaponSlots [data-slot-id]")), null, {
      timeout: 15000
    });
    await page.waitForTimeout(600);
    assert.equal(await equippedName(page, "offhand"), "Ika's Shield", "the off-hand entry is restored");
    assert.equal(
      await page.locator('#weaponSlots .slot-button[data-slot-id="offhand"].is-locked').count(),
      0,
      "the restored off-hand entry leaves the slot usable"
    );
    assert.deepEqual(session.errors, [], "no console errors while using the Offhand slot");
    assert.deepEqual(session.failedRequests, [], "no failed requests while using the Offhand slot");
    results.push({ scope: "reload-persistence", status: "passed" });
    await session.context.close();

    /* --- a stored build pairing a two-handed weapon with off-hand gear ---------- */
    const stale = await openBuilder(browser);
    await stale.page.evaluate(() => {
      const items = window.CharacterBuildAdapter.getItems("current");
      const byName = (name) => items.find((item) => item.name === name);
      window.localStorage.setItem(
        "sao.characterBuild.foundation",
        JSON.stringify({
          activeSlot: "1",
          builds: {
            1: {
              source: "current",
              level: 9,
              classId: "guerrier",
              equipment: { "main-weapon": byName("Copper Greatsword"), offhand: byName("Ika's Shield") },
              runes: {},
              selectedSkills: {}
            }
          }
        })
      );
    });
    await stale.page.reload({ waitUntil: "load" });
    await stale.page.waitForFunction(() => Boolean(document.querySelector("#weaponSlots [data-slot-id]")), null, {
      timeout: 15000
    });
    await stale.page.waitForTimeout(600);
    assert.equal(await equippedName(stale.page, "main-weapon"), "Copper Greatsword", "the stored weapon restores");
    assert.equal(
      await equippedName(stale.page, "offhand"),
      null,
      "a stored two-handed Main Hand + Offhand pair drops the off-hand entry"
    );
    assert.deepEqual(stale.errors, [], "no console errors while restoring the stored build");
    await stale.context.close();
    results.push({ scope: "stale-build-sanitised", status: "passed" });

    /* --- Compendium > Weapons lists the off-hand entries ----------------------- */
    const compendiumContext = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    await seedStoredState(compendiumContext);
    const compendiumPage = await compendiumContext.newPage();
    const compendiumDiagnostics = attachDiagnostics(compendiumPage);
    await compendiumPage.goto(compendiumUrl, { waitUntil: "load" });
    const expectedWeapons = await compendiumPage.evaluate(
      () => (window.SAO_CURRENT_EQUIPMENT_DATA?.floor1?.weapon || []).length
    );
    assert.equal(expectedWeapons, 95, "the weapon bucket holds 63 weapons and 32 off-hand entries");
    await compendiumPage.waitForFunction(
      (count) => document.querySelectorAll("#entryList .ecompendium-card").length === count,
      expectedWeapons,
      { timeout: 30000 }
    );
    const listedNames = await compendiumPage.evaluate(() =>
      [...document.querySelectorAll("#entryList .ecompendium-card .ecompendium-name")].map((node) =>
        node.textContent.trim()
      )
    );
    Object.values(OFFHAND_BY_CLASS)
      .flat()
      .forEach((name) => assert.ok(listedNames.includes(name), `${name} is listed in Compendium > Weapons`));
    results.push({ scope: "compendium-offhand-count", weapons: expectedWeapons, status: "passed" });

    await searchCompendium(compendiumPage, "Copper Shield", [
      "Copper Shield (Defensive)",
      "Copper Shield (Offensive)"
    ]);
    const shieldCards = await compendiumCards(compendiumPage);
    const defensive = shieldCards.find((card) => card.name === "Copper Shield (Defensive)");
    const offensive = shieldCards.find((card) => card.name === "Copper Shield (Offensive)");
    assert.ok(defensive && offensive, "both Copper Shield variants are listed as separate cards");
    assert.deepEqual(
      defensive.stats,
      [
        ["Class", "Warrior"],
        ["Weapon Category", "Second Hand [P1]"],
        ["Defense", "+3"],
        ["Guard Durability", "16"],
        ["Health", "+16"],
        ["Movement Speed", "-5%"]
      ],
      "the defensive variant renders its own stats as separate rows"
    );
    assert.deepEqual(
      offensive.stats,
      [
        ["Class", "Warrior"],
        ["Weapon Category", "Off-Hand [P1]"],
        ["Attack Damage", "0.75"],
        ["Guard Durability", "8"],
        ["Health", "+8"]
      ],
      "the offensive variant keeps its Off-Hand source category and its own stats"
    );
    assert.equal(defensive.badge, null, "off-hand equipment carries no two-handed badge");
    assert.equal(
      defensive.description,
      "Forged from copper, its large size and weight provide effective protection",
      "the compendium renders the supplied description"
    );
    assert.deepEqual(defensive.meta, [["Level", "5"]], "the minimum level is rendered");
    results.push({ scope: "compendium-shield-variants", status: "passed" });

    /* The class-specific lanterns stay separate and keep their own class. */
    await searchCompendium(compendiumPage, "Iron Lantern", ["Iron Lantern (Mage)", "Iron Lantern (Shaman)"]);
    const lanternCards = await compendiumCards(compendiumPage);
    assert.deepEqual(
      lanternCards.map((card) => card.name).sort(),
      ["Iron Lantern (Mage)", "Iron Lantern (Shaman)"],
      "the Mage and Shaman iron lanterns are separate entries"
    );
    assert.deepEqual(
      lanternCards
        .map((card) => [card.name, card.stats.find(([label]) => label === "Class")[1]])
        .sort((first, second) => first[0].localeCompare(second[0])),
      [
        ["Iron Lantern (Mage)", "Mage"],
        ["Iron Lantern (Shaman)", "Shaman"]
      ],
      "each lantern keeps its own class"
    );
    assert.deepEqual(
      lanternCards[0].stats.find(([label]) => label === "Magic Damage"),
      ["Magic Damage", "+2%"],
      "the lantern keeps its supplied Magic Damage"
    );

    /* A grimoire renders its canonical Max Mana stat, not the Maximum Mana spelling. */
    await searchCompendium(compendiumPage, "Dark Grimoire (Mage)", ["Dark Grimoire (Mage)"]);
    const grimoire = (await compendiumCards(compendiumPage))[0];
    assert.deepEqual(
      grimoire.stats,
      [
        ["Class", "Mage"],
        ["Weapon Category", "Second Hand [P1]"],
        ["Max Mana", "+3"]
      ],
      "the grimoire renders its canonical Max Mana row"
    );
    assert.deepEqual(compendiumDiagnostics.errors, [], "no console errors in the compendium");
    await compendiumContext.close();
    results.push({ scope: "compendium-offhand-rendering", status: "passed" });

    console.log(JSON.stringify({ results, status: "passed" }, null, 2));
    console.log("Current-Data off-hand UI regression checks passed.");
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
