const { chromium } = require("playwright");
const assert = require("node:assert/strict");
const { ensureStaticServer } = require("./harness-helpers");

const rootUrl = process.env.SAO_BASE_URL || "http://127.0.0.1:8080";
const equipmentCategories = ["accessory", "armor", "tool", "weapon"];

async function getExpectedEntries(page, floor, category) {
  return page.evaluate(
    ({ floor, category }) => {
      const entries = window[`FLOOR_${floor.slice(-1)}_DATA`]?.[category] || [];
      return entries
        .slice()
        .sort((first, second) => {
          const firstLevel = typeof first.level === "number" ? first.level : 0;
          const secondLevel = typeof second.level === "number" ? second.level : 0;
          return firstLevel - secondLevel || (first.name || "").localeCompare(second.name || "");
        })
        .map((entry) => ({
          name: entry.name,
          stats: Object.entries(entry.stats || {}).map(([name, value]) => [name, String(value)])
        }));
    },
    { floor, category }
  );
}

async function verifyCategory(page, floor, category) {
  const expected = await getExpectedEntries(page, floor, category);
  await page.locator(`.list-tab[data-category="${category}"]`).click();
  await page.waitForFunction(
    ({ count, firstName }) => {
      const cards = [...document.querySelectorAll(".ecompendium-card")];
      return (
        cards.length === count &&
        (!count || cards[0].querySelector(".ecompendium-name")?.textContent.trim() === firstName)
      );
    },
    { count: expected.length, firstName: expected[0]?.name || null }
  );

  const rendered = await page.locator(".ecompendium-card").evaluateAll((cards) =>
    cards.map((card) => ({
      name: card.querySelector(".ecompendium-name")?.textContent.trim(),
      stats: [...card.querySelectorAll(".stat-list li")].map((row) => [
        row.children[0].textContent,
        row.children[1].textContent
      ])
    }))
  );
  assert.deepEqual(rendered, expected, `${floor}/${category}: rendered names and stats match the source dataset`);
  return expected.length;
}

/* The Current dataset renders from window.SAO_CURRENT_EQUIPMENT_DATA. Every supplied item must
   appear in its category tab with its exact stats, level, set and crafting resources (including the
   Col cost). */
async function verifyCurrentDataset(page) {
  await page.goto(`${rootUrl}/Aincrad/eCompendium/ecompendium.html?floor=floor1&dataset=current`, {
    waitUntil: "networkidle",
    timeout: 120000
  });
  const expectedByCategory = await page.evaluate(() => {
    const floor = window.SAO_CURRENT_EQUIPMENT_DATA?.floor1 || {};
    const expected = {};
    Object.entries(floor).forEach(([category, entries]) => {
      if (!Array.isArray(entries) || entries.length === 0) return;
      expected[category] = entries
        .slice()
        .sort((first, second) => (first.level || 0) - (second.level || 0) || first.name.localeCompare(second.name))
        .map((entry) => ({
          name: entry.name,
          level: entry.level === undefined ? null : String(entry.level),
          set: entry.set || null,
          stats: Object.entries(entry.stats || {}).map(([name, value]) => [name, String(value)]),
          resources: (entry.craftingResources || []).map((resource) => [resource.item, String(resource.amount)])
        }));
    });
    return expected;
  });
  const categories = Object.keys(expectedByCategory);
  assert.ok(categories.length > 0, "the Current dataset ships equipment");

  let renderedCount = 0;
  for (const category of categories) {
    const expected = expectedByCategory[category];
    await page.locator(`.list-tab[data-category="${category}"]`).click();
    await page.locator("#ecompendiumSearch").fill("");
    await page.waitForFunction((count) => document.querySelectorAll(".ecompendium-card").length === count, expected.length, {
      timeout: 20000
    });

    const rendered = await page.locator(".ecompendium-card").evaluateAll((cards) =>
      cards.map((card) => {
        const meta = [...card.querySelectorAll(".ecompendium-meta p")].map((row) => [
          row.children[0].textContent,
          row.children[1].textContent
        ]);
        return {
          name: card.querySelector(".ecompendium-name")?.textContent.trim(),
          level: meta.find(([label]) => label === "Level")?.[1] ?? null,
          set: meta.find(([label]) => label === "Set")?.[1] ?? null,
          stats: [...card.querySelectorAll(".stat-list li")].map((row) => [row.children[0].textContent, row.children[1].textContent]),
          resources: [...card.querySelectorAll(".resource-list li")].map((row) => [
            row.querySelector("span").textContent,
            row.querySelector("strong").textContent.replace(/^x/, "")
          ])
        };
      })
    );

    assert.deepEqual(
      rendered.map((card) => card.name),
      expected.map((entry) => entry.name),
      `Current Data renders every supplied ${category} item`
    );
    expected.forEach((entry, index) => {
      const card = rendered[index];
      assert.equal(card.level, entry.level, `${entry.name}: rendered minimum level`);
      assert.equal(card.set, entry.set, `${entry.name}: rendered set`);
      assert.deepEqual(card.stats, entry.stats, `${entry.name}: rendered statistics`);
      assert.deepEqual(card.resources, entry.resources, `${entry.name}: rendered resources and Col cost`);
    });
    renderedCount += rendered.length;
  }
  return { categories, items: renderedCount };
}

async function verifyLocalizedEquipmentEntry(page, floor, itemName, expectedName, expectedResource) {
  await page.goto(`${rootUrl}/Aincrad/eCompendium/ecompendium.html?floor=${floor}&dataset=beta`, {
    waitUntil: "networkidle",
    timeout: 120000
  });
  await page.evaluate(() => window.SAOI18n.setLanguage("fr"));
  const category = await page.evaluate(
    ({ floor, itemName }) => {
      const data = window[`FLOOR_${floor.slice(-1)}_DATA`] || {};
      return Object.entries(data).find(([, entries]) => entries.some((entry) => entry.name === itemName))?.[0] || null;
    },
    { floor, itemName }
  );
  assert.ok(category, `${floor}: source entry exists for ${itemName}`);
  await page.locator(`.list-tab[data-category="${category}"]`).click();
  await page.locator("#ecompendiumSearch").fill(itemName);
  await page.waitForFunction(() => document.querySelectorAll(".ecompendium-card").length > 0);
  const card = page.locator(".ecompendium-card").first();
  if (expectedName) assert.equal(await card.locator(".ecompendium-name").textContent(), expectedName);
  if (expectedResource) {
    const resources = await card.locator(".resource-list li span").allTextContents();
    assert(resources.includes(expectedResource), `${itemName}: rendered resource uses its French term`);
  }
}

async function verifyBraceletCompendium(page, language, itemName, set, expectedStats) {
  await page.goto(`${rootUrl}/Aincrad/eCompendium/ecompendium.html?floor=floor3&dataset=beta`, {
    waitUntil: "networkidle",
    timeout: 120000
  });
  await page.evaluate((nextLanguage) => window.SAOI18n.setLanguage(nextLanguage), language);
  await page.locator('.list-tab[data-category="accessory"]').click();
  await page.locator("#ecompendiumSearch").fill(itemName);
  await page.waitForFunction(() => document.querySelectorAll(".ecompendium-card").length > 0);
  assert.equal(await page.locator(".ecompendium-card").count(), 1, `${language}: exactly one ${itemName} record`);

  const expected = await page.evaluate(
    ({ language, itemName, set, stats }) => {
      const entry = window.FLOOR_3_DATA.accessory.find((item) => item.name === itemName && item.set === set);
      if (!entry) return null;
      const slug = (value) =>
        String(value || "unknown")
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "") || "unknown";
      const id = entry.id || slug(entry.name);
      const translations = window.SAOContentTranslations;
      const nameKey = `equipment.${id}.name`;
      const localizedStats = stats.map(([name, value]) => {
        const statKey = `equipment.${id}.stat.${slug(name)}`;
        return [translations[language][statKey] || translations.translateKnownTerms(name, language), String(value)];
      });
      return {
        localizedName: translations[language][nameKey] || translations.translateKnownTerms(entry.name, language),
        setLabel: window.SAOI18n.t("page.ecompendium.labels.set"),
        localizedSet: translations.translateKnownTerms(entry.set, language),
        localizedStats
      };
    },
    { language, itemName, set, stats: expectedStats }
  );
  assert.ok(expected, `${language}: ${itemName} source record exists with ${set}`);
  const expectedNames = {
    en: { "Thief's Bracelet": "Thief's Bracelet", "Amethyst Bracelet": "Amethyst Bracelet" },
    es: { "Thief's Bracelet": "Brazalete del ladr\u00f3n", "Amethyst Bracelet": "Brazalete de amatista" },
    fr: { "Thief's Bracelet": "Bracelet du voleur", "Amethyst Bracelet": "Bracelet d'am\u00e9thyste" }
  };
  const expectedSets = {
    en: { "Thief Set": "Thief Set", "Amethyst Set": "Amethyst Set" },
    es: { "Thief Set": "Conjunto del ladr\u00f3n", "Amethyst Set": "Conjunto de amatista" },
    fr: { "Thief Set": "Ensemble du voleur", "Amethyst Set": "Ensemble d'am\u00e9thyste" }
  };
  assert.equal(
    expected.localizedName,
    expectedNames[language][itemName],
    `${language}: expected localized bracelet name`
  );
  assert.equal(expected.localizedSet, expectedSets[language][set], `${language}: expected localized bracelet set`);

  const card = page.locator(".ecompendium-card").first();
  assert.equal(
    await card.locator(".ecompendium-name").textContent(),
    expected.localizedName,
    `${language}: localized item name`
  );
  const setRow = card.locator(".ecompendium-meta p").filter({ hasText: expected.setLabel });
  assert.equal(
    (await setRow.textContent()).replace(/\s+/g, " ").trim(),
    `${expected.setLabel}${expected.localizedSet}`,
    `${language}: correct localized set`
  );
  const renderedStats = await card
    .locator(".stat-list li")
    .evaluateAll((rows) => rows.map((row) => [row.children[0].textContent, row.children[1].textContent]));
  assert.deepEqual(renderedStats, expected.localizedStats, `${language}: item stats match the authoritative source`);
}

async function verifyOccultBonusRows(page, language) {
  await page.goto(`${rootUrl}/Aincrad/eCompendium/ecompendium.html?floor=floor1&dataset=beta`, {
    waitUntil: "networkidle",
    timeout: 120000
  });
  await page.evaluate((nextLanguage) => window.SAOI18n.setLanguage(nextLanguage), language);
  await page.locator('.list-tab[data-category="accessory"]').click();
  await page.locator("#ecompendiumSearch").fill("Occult Amulet");
  const targetName = {
    en: "Occult Amulet",
    es: "Amuleto oculto",
    fr: "Amulette occulte"
  }[language];
  const tierNames = {
    en: Array.from({ length: 6 }, (_, index) => `${index + 2} Piece Set Bonus`),
    es: Array.from({ length: 6 }, (_, index) => `Bonus de conjunto de ${index + 2} piezas`),
    fr: Array.from({ length: 6 }, (_, index) => `Bonus d'ensemble de ${index + 2} pi\u00e8ces`)
  }[language];
  const localizedBonus = {
    en: "+1.5/s Health Regeneration",
    es: "+1.5/s de regeneraci\u00f3n de salud",
    fr: "+1.5/s de r\u00e9g\u00e9n\u00e9ration de sant\u00e9"
  }[language];
  await page.waitForFunction(
    ({ name, labels, value }) => {
      const card = Array.from(document.querySelectorAll(".ecompendium-card")).find(
        (candidate) => candidate.querySelector(".ecompendium-name")?.textContent.trim() === name
      );
      if (!card) return false;
      const rows = Array.from(card.querySelectorAll(".stat-list li"))
        .map((row) => [row.children[0].textContent.trim(), row.children[1].textContent.trim()])
        .filter(([label]) => /(?:Piece Set Bonus|Bonus de conjunto|Bonus d'ensemble)/.test(label));
      return labels.every((label, index) => rows[index]?.[0] === label && rows[index]?.[1] === value);
    },
    { name: targetName, labels: tierNames, value: localizedBonus }
  );
  const rows = await page.locator(".ecompendium-card").evaluateAll((cards, name) => {
    const card = cards.find((candidate) => candidate.querySelector(".ecompendium-name")?.textContent.trim() === name);
    return Array.from(card?.querySelectorAll(".stat-list li") || [])
      .map((row) => [row.children[0].textContent, row.children[1].textContent])
      .filter(([label]) => /(?:Piece Set Bonus|Bonus de conjunto|Bonus d'ensemble)/.test(label));
  }, targetName);
  assert.deepEqual(
    rows,
    tierNames.map((label) => [label, localizedBonus]),
    `${language}: all six Occult set tiers render with +1.5/s Health Regeneration`
  );
}

(async () => {
  await ensureStaticServer();
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const browserErrors = [];
  page.on("pageerror", (error) => browserErrors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error" && !message.text().includes("frame-ancestors")) browserErrors.push(message.text());
  });

  try {
    let renderedEquipment = 0;
    for (const floor of ["floor1", "floor2", "floor3"]) {
      await page.goto(`${rootUrl}/Aincrad/eCompendium/ecompendium.html?floor=${floor}&dataset=beta`, {
        waitUntil: "networkidle",
        timeout: 120000
      });
      await page.evaluate(() => window.SAOI18n.setLanguage("en"));
      for (const category of equipmentCategories) renderedEquipment += await verifyCategory(page, floor, category);
    }

    for (const language of ["en", "es", "fr"]) {
      await page.evaluate((nextLanguage) => window.SAOI18n.setLanguage(nextLanguage), language);
      const localeState = await page.evaluate(() => ({
        language: document.documentElement.lang,
        heading: document.querySelector("h1")?.textContent.trim(),
        expectedHeading: window.SAOI18n.t("page.ecompendium.heading")
      }));
      assert.equal(localeState.language, language);
      assert.equal(localeState.heading, localeState.expectedHeading);
    }

    await page.setViewportSize({ width: 390, height: 844 });
    for (const language of ["en", "es", "fr"]) {
      await page.evaluate((nextLanguage) => window.SAOI18n.setLanguage(nextLanguage), language);
      const mobileLocale = await page.evaluate(() => ({
        language: document.documentElement.lang,
        heading: document.querySelector("h1")?.textContent.trim(),
        expectedHeading: window.SAOI18n.t("page.ecompendium.heading"),
        noOverflow: document.documentElement.scrollWidth <= document.documentElement.clientWidth
      }));
      assert.equal(mobileLocale.language, language);
      assert.equal(mobileLocale.heading, mobileLocale.expectedHeading);
      assert.equal(mobileLocale.noOverflow, true, `${language}: mobile Compendium has no horizontal overflow`);
    }

    for (const pagePath of ["/Aincrad/Map/maps.html", "/Fractured%20Underworld/Main%20UI/mainui.html"]) {
      await page.goto(`${rootUrl}${pagePath}?dataset=beta`, { waitUntil: "networkidle", timeout: 120000 });
      for (const language of ["en", "es", "fr"]) {
        await page.evaluate((nextLanguage) => window.SAOI18n.setLanguage(nextLanguage), language);
        const altLabels = await page.evaluate((isUnderworld) => {
          const expectedMap = isUnderworld
            ? `${window.SAOI18n.t("page.mainui.islandOptions.playerIsland")} ${window.SAOI18n.t("page.mainui.mapSuffix")}`
            : window.SAOI18n.t("page.maps.mapAlt");
          const expectedUnderground = isUnderworld
            ? `${window.SAOI18n.t("page.mainui.islandOptions.playerIsland")} ${window.SAOI18n.t("page.mainui.undergroundSuffix")}`
            : window.SAOI18n.t("page.maps.undergroundAlt");
          return {
            map: document.getElementById("mapImage")?.alt,
            expectedMap,
            underground: document.getElementById("undergroundMapImage")?.alt,
            expectedUnderground
          };
        }, pagePath.includes("Fractured%20Underworld"));
        assert.equal(altLabels.map, altLabels.expectedMap, `${pagePath}/${language}: map alt is localized`);
        assert.equal(
          altLabels.underground,
          altLabels.expectedUnderground,
          `${pagePath}/${language}: underground alt is localized`
        );
      }
    }

    await verifyLocalizedEquipmentEntry(page, "floor1", "Oceiros Bracelet", "Bracelet d'Oceiros", null);
    await verifyLocalizedEquipmentEntry(page, "floor1", "Bestial Grimoire", "Grimoire bestial", "Grimoire bestial");
    await verifyLocalizedEquipmentEntry(page, "floor2", "Corrupted Mask", null, "Tissu spectral");
    const braceletStats = {
      "Thief's Bracelet": [
        ["Critical Hit Chance", "5%"],
        ["Defense", "2"],
        ["Stamina Regeneration", "0.3/s"]
      ],
      "Amethyst Bracelet": [
        ["Health", "10"],
        ["Stamina Regeneration", "0.1/s"],
        ["Defense", "3"],
        ["Requirement: Defense Car", "2"],
        ["Requirement: Vitality", "2"]
      ]
    };
    for (const language of ["en", "es", "fr"]) {
      await verifyBraceletCompendium(
        page,
        language,
        "Thief's Bracelet",
        "Thief Set",
        braceletStats["Thief's Bracelet"]
      );
      await verifyBraceletCompendium(
        page,
        language,
        "Amethyst Bracelet",
        "Amethyst Set",
        braceletStats["Amethyst Bracelet"]
      );
      await verifyOccultBonusRows(page, language);
    }

    /* The Current dataset ships its own floor 1 equipment (accessories, the beginner weapons and
       armour, the Starting Town tools, consumables, dungeon keys and materials), and
       verifyCurrentDataset below renders every supplied category. A category the dataset still
       leaves out keeps its localized empty state. The Compendium restores the last category and
       search it stored, so both are set explicitly before asserting. */
    await page.goto(`${rootUrl}/Aincrad/eCompendium/ecompendium.html?floor=floor1&dataset=current`, {
      waitUntil: "networkidle",
      timeout: 120000
    });
    await page.locator("#ecompendiumSearch").fill("");
    const currentEmptyCategory = await page.evaluate(() => {
      const floor = window.SAO_CURRENT_EQUIPMENT_DATA?.floor1 || {};
      const categories = [...document.querySelectorAll(".list-tab")].map((tab) => tab.dataset.category);
      return categories.find((category) => !Array.isArray(floor[category]) || floor[category].length === 0) || null;
    });
    assert.ok(currentEmptyCategory, "the Current dataset still leaves at least one category without records");
    await page.locator(`.list-tab[data-category="${currentEmptyCategory}"]`).click();
    await page.locator(".empty-state").waitFor();
    assert.equal(
      await page.locator(".ecompendium-card").count(),
      0,
      `Current Data ships no ${currentEmptyCategory} records`
    );
    await page.evaluate(() => window.SAOI18n.setLanguage("es"));
    assert.equal(
      await page.locator(".empty-state").textContent(),
      await page.evaluate(() => window.SAOI18n.t("page.ecompendium.noEntriesFound"))
    );
    await page.evaluate(() => window.SAOI18n.setLanguage("en"));
    const currentDataset = await verifyCurrentDataset(page);
    assert.deepEqual(browserErrors, []);
    console.log(
      JSON.stringify(
        {
          renderedEquipment,
          categories: equipmentCategories,
          floors: ["floor1", "floor2", "floor3"],
          languages: ["en", "es", "fr"],
          mobile: "passed",
          currentEquipment: {
            emptyWeaponCategory: true,
            categories: currentDataset.categories,
            items: currentDataset.items
          },
          status: "passed"
        },
        null,
        2
      )
    );
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
