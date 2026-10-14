/* Current-Data weapon / two-handed browser regression checks.

   Exercises the Character Build UI against the 49 supplied Current-Data weapons:
     - the Current Data Main Hand selector offers the class' weapons and nothing else;
     - a two-handed Main Hand weapon locks the Offhand slot, and the Offhand slot only reopens
       once that weapon is removed;
     - selecting a two-handed weapon while an Offhand item is equipped is refused with a notice,
       so an invalid Main Hand + Offhand pair can never be created;
     - switching back to a one-handed weapon unlocks the Offhand slot without equipping anything;
     - the selection survives a reload, and a stored build that predates the rule comes back valid;
     - Compendium > Weapons renders the supplied entries with their stat rows and a two-handed badge.
 */
"use strict";

const assert = require("node:assert/strict");
const { chromium } = require("playwright");
const { attachDiagnostics, ensureStaticServer } = require("./harness-helpers");

const rootUrl = process.env.SAO_BASE_URL || "http://127.0.0.1:8080";
const builderUrl = `${rootUrl}/Aincrad/Character%20Build/character-build.html`;
const compendiumUrl = `${rootUrl}/Aincrad/eCompendium/ecompendium.html?floor=floor1&dataset=current`;

async function seedStoredState(context) {
  await context.addInitScript(() => {
    [
      "sao.walkthrough.index.completed",
      "sao.walkthrough.maps.completed",
      "sao.walkthrough.mainui.completed",
      "sao.walkthrough.characterBuild.completed"
    ].forEach((key) => window.localStorage.setItem(key, "1"));
    /* Pin the language so the rendered labels are predictable. */
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

async function setBuild(page, { classId, level }) {
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

async function openSlotPicker(page, slotId, search) {
  await page.locator(`#weaponSlots [data-slot-id="${slotId}"]`).click();
  await page.locator("#itemSearch").fill(search);
  await page.waitForTimeout(200);
}

function itemCard(page, itemName) {
  /* The Current dataset ships two distinct "Training Buckler" entries, so always take the first
     card whose heading matches. */
  return page.locator("#itemList .item-card", { has: page.locator(`h3:text-is("${itemName}")`) }).first();
}

async function equip(page, slotId, itemName) {
  await openSlotPicker(page, slotId, itemName);
  const card = itemCard(page, itemName);
  await card.waitFor();
  await card.locator(".equip-button").click();
  await page.waitForFunction(() => !document.getElementById("equipmentDialog").open);
  await page.waitForTimeout(150);
}

async function closeDialog(page) {
  await page.locator("#closeDialog").click();
  await page.waitForFunction(() => !document.getElementById("equipmentDialog").open);
}

async function equippedName(page, slotId) {
  const slot = page.locator(`#weaponSlots [data-slot-id="${slotId}"]`);
  if (!(await slot.locator(".slot-item").count())) return null;
  return (await slot.locator(".slot-item").textContent()).trim();
}

async function t(page, key) {
  return page.evaluate((name) => window.SAOI18n.t(name), key);
}

/* Fills the compendium search and waits until the first rendered card is the expected entry, so
   assertions never race the batched re-render. */
async function searchCompendium(page, name) {
  await page.locator("#ecompendiumSearch").fill(name);
  await page.waitForFunction(
    (expected) => {
      const card = document.querySelector("#entryList .ecompendium-card");
      return Boolean(card) && card.querySelector(".ecompendium-name").textContent.trim() === expected;
    },
    name,
    { timeout: 15000 }
  );
}

(async () => {
  await ensureStaticServer();
  const browser = await chromium.launch({ headless: true });
  const results = [];
  try {
    const session = await openBuilder(browser);
    const { page } = session;
    await setBuild(page, { classId: "guerrier", level: 9 });

    /* --- class filtering: a Warrior only ever sees Warrior weapons ------------- */
    await openSlotPicker(page, "main-weapon", "");
    const warriorWeapons = await page.locator("#itemList .item-card h3").allTextContents();
    assert.ok(warriorWeapons.includes("Copper Greatsword"), "a Warrior Main Hand lists the Warrior greatsword");
    assert.equal(
      warriorWeapons.some((name) => /Staff|Dagger|Scythe|Bow|Crossbow|Katana/.test(name)),
      false,
      "a Warrior Main Hand never lists another class' weapons"
    );
    await closeDialog(page);
    results.push({ scope: "class-filtered-main-hand", items: warriorWeapons.length, status: "passed" });

    /* --- a one-handed weapon leaves the Offhand slot open ---------------------- */
    await equip(page, "main-weapon", "Basic Sword");
    assert.equal(await equippedName(page, "main-weapon"), "Basic Sword", "the one-handed weapon equips");
    assert.equal(
      await page.locator('#weaponSlots .slot-button[data-slot-id="offhand"].is-locked').count(),
      0,
      "the Offhand slot stays available while a one-handed weapon is equipped"
    );

    await equip(page, "offhand", "Training Buckler");
    assert.equal(await equippedName(page, "offhand"), "Training Buckler", "the Offhand item equips");

    /* --- a two-handed weapon is refused while an Offhand item is equipped ------ */
    await openSlotPicker(page, "main-weapon", "Copper Greatsword");
    const greatsword = itemCard(page, "Copper Greatsword");
    await greatsword.waitFor();
    assert.equal(
      (await greatsword.locator(".item-badge").textContent()).trim(),
      await t(page, "page.characterBuild.twoHanded"),
      "the two-handed weapon is badged in the selector"
    );
    await greatsword.locator(".equip-button").click();
    assert.equal(
      await page.locator("#equipmentDialog").evaluate((dialog) => dialog.open),
      true,
      "the picker stays open while the Offhand item must be removed first"
    );
    assert.equal(
      (await page.locator("#pickerNotice").textContent()).trim(),
      await t(page, "page.characterBuild.removeOffhandFirst"),
      "the picker explains that the Offhand item must be removed first"
    );
    await closeDialog(page);
    assert.equal(await equippedName(page, "main-weapon"), "Basic Sword", "the Main Hand is unchanged");
    assert.equal(await equippedName(page, "offhand"), "Training Buckler", "the Offhand item is unchanged");
    results.push({ scope: "two-handed-refused-with-offhand", status: "passed" });

    /* --- the Remove action empties the Offhand slot ---------------------------- */
    await openSlotPicker(page, "offhand", "");
    assert.equal(await page.locator("#removeItem").isVisible(), true, "Remove is offered for a filled slot");
    await page.locator("#removeItem").click();
    await page.waitForFunction(() => !document.getElementById("equipmentDialog").open);
    assert.equal(await equippedName(page, "offhand"), null, "Remove empties the Offhand slot");
    results.push({ scope: "remove-action", status: "passed" });

    /* --- the two-handed weapon now equips and locks the Offhand slot ----------- */
    await equip(page, "main-weapon", "Copper Greatsword");
    assert.equal(await equippedName(page, "main-weapon"), "Copper Greatsword", "the two-handed weapon equips");
    const locked = page.locator('#weaponSlots .slot-button[data-slot-id="offhand"]');
    assert.equal(await locked.getAttribute("aria-disabled"), "true", "the locked Offhand slot is disabled");
    assert.equal(
      (await page.locator('#weaponSlots [data-slot-id="offhand"] .slot-empty').textContent()).trim(),
      await t(page, "page.characterBuild.offhandLocked"),
      "the locked Offhand slot says why it is locked"
    );
    /* aria-disabled makes the button unclickable for assistive tech and Playwright alike, so
       dispatch the click directly to prove the handler refuses to open the picker. */
    await locked.dispatchEvent("click");
    assert.equal(
      await page.locator("#equipmentDialog").evaluate((dialog) => dialog.open),
      false,
      "a locked Offhand slot does not open the picker"
    );
    results.push({ scope: "two-handed-locks-offhand", status: "passed" });

    /* --- the selection survives a reload --------------------------------------- */
    await page.reload({ waitUntil: "load" });
    await page.waitForFunction(() => Boolean(document.querySelector("#weaponSlots [data-slot-id]")), null, {
      timeout: 15000
    });
    await page.waitForTimeout(600);
    assert.equal(await equippedName(page, "main-weapon"), "Copper Greatsword", "the two-handed weapon restores");
    assert.equal(await equippedName(page, "offhand"), null, "the Offhand slot stays empty after a reload");
    assert.equal(
      await page.locator('#weaponSlots .slot-button[data-slot-id="offhand"].is-locked').count(),
      1,
      "the Offhand slot is still locked after a reload"
    );
    results.push({ scope: "reload-persistence", status: "passed" });

    /* --- switching back to a one-handed weapon reopens the Offhand slot -------- */
    await equip(page, "main-weapon", "Guardian's Sword");
    assert.equal(await equippedName(page, "main-weapon"), "Guardian's Sword", "the one-handed weapon equips");
    assert.equal(
      await page.locator('#weaponSlots .slot-button[data-slot-id="offhand"].is-locked').count(),
      0,
      "the Offhand slot is available again"
    );
    assert.equal(await equippedName(page, "offhand"), null, "no Offhand item is equipped automatically");
    results.push({ scope: "one-handed-reopens-offhand", status: "passed" });

    assert.deepEqual(session.errors, [], "no console errors while using the weapon selector");
    assert.deepEqual(session.failedRequests, [], "no failed requests while using the weapon selector");
    await session.context.close();

    /* --- a stored build that predates the rule comes back valid ---------------- */
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
              equipment: { "main-weapon": byName("Copper Greatsword"), offhand: byName("Training Buckler") },
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
      "an invalid stored Main Hand + Offhand pair drops the Offhand item instead of restoring it"
    );
    assert.deepEqual(stale.errors, [], "no console errors while restoring the stored build");
    await stale.context.close();
    results.push({ scope: "stale-build-sanitised", status: "passed" });

    /* --- Compendium > Weapons renders the supplied entries --------------------- */
    const compendiumContext = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    await seedStoredState(compendiumContext);
    const compendiumPage = await compendiumContext.newPage();
    const compendiumDiagnostics = attachDiagnostics(compendiumPage);
    await compendiumPage.goto(compendiumUrl, { waitUntil: "load" });
    const expectedWeapons = await compendiumPage.evaluate(
      () => (window.SAO_CURRENT_EQUIPMENT_DATA?.floor1?.weapon || []).length
    );
    await compendiumPage.waitForFunction(
      (count) => document.querySelectorAll("#entryList .ecompendium-card").length === count,
      expectedWeapons,
      { timeout: 30000 }
    );
    results.push({ scope: "compendium-weapon-count", weapons: expectedWeapons, status: "passed" });

    await searchCompendium(compendiumPage, "Copper Greatsword");
    const compendiumCard = compendiumPage.locator("#entryList .ecompendium-card").first();
    await compendiumCard.waitFor();
    const rendered = await compendiumCard.evaluate((card) => ({
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
    }));
    assert.equal(rendered.name, "Copper Greatsword", "the compendium renders the supplied name");
    assert.deepEqual(rendered.meta, [["Level", "5"]], "the compendium renders the supplied minimum level");
    assert.match(rendered.badge || "", /two-handed|dos manos|deux mains/i, "the compendium badges a two-handed weapon");
    assert.deepEqual(
      rendered.stats,
      [
        ["Class", "Warrior"],
        ["Weapon Category", "Greatsword [P1]"],
        ["Two-Handed", "Yes"],
        ["Attack Damage", "6"],
        ["Attack Speed", "1.2/s"],
        ["Critical Chance", "+1%"],
        ["Life Steal", "+5%"]
      ],
      "the compendium renders every supplied stat as its own row"
    );
    assert.equal(
      rendered.description,
      "Forged from copper, this greatsword is made to vanquish its enemies.",
      "the compendium renders the supplied description"
    );

    /* A one-handed staff is never badged and carries no invented rarity. */
    await searchCompendium(compendiumPage, "Iron Magic Staff (Mage)");
    const staffCard = compendiumPage.locator("#entryList .ecompendium-card").first();
    await staffCard.waitFor();
    assert.equal(await staffCard.locator(".ecompendium-badge").count(), 0, "a one-handed staff has no badge");
    assert.deepEqual(
      await staffCard.evaluate((card) =>
        [...card.querySelectorAll(".ecompendium-meta p")].map((row) => row.children[0].textContent.trim())
      ),
      ["Level"],
      "a supplied weapon shows only the level meta row, with no invented rarity or set"
    );
    assert.deepEqual(compendiumDiagnostics.errors, [], "no console errors in the compendium");
    await compendiumContext.close();
    results.push({ scope: "compendium-weapons", status: "passed" });

    console.log(JSON.stringify({ results, status: "passed" }, null, 2));
    console.log("Current-Data weapon UI regression checks passed.");
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
