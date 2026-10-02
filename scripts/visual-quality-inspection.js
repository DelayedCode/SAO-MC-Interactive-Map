const { chromium } = require("playwright");
const { ensureStaticServer } = require("./harness-helpers");

const baseUrl = process.env.SAO_BASE_URL || "http://127.0.0.1:8080";
const viewports = [
  { name: "1440x1000", width: 1440, height: 1000 },
  { name: "1024x768", width: 1024, height: 768 },
  { name: "390x844", width: 390, height: 844 }
];

const pages = [
  { name: "Welcome Mat", url: "/index.html" },
  { name: "Character Build", url: "/Aincrad/Character%20Build/character-build.html" },
  { name: "Aincrad Map", url: "/Aincrad/Map/maps.html" },
  { name: "Bestiary", url: "/Aincrad/Bestiary/bestiary.html" },
  { name: "Equipment Compendium", url: "/Aincrad/eCompendium/ecompendium.html" },
  { name: "Quests", url: "/Aincrad/Quests/quests.html" },
  { name: "Patchnotes", url: "/Aincrad/Patchnotes/patchnotes.html" },
  { name: "Misc. Info", url: "/Aincrad/Misc%20Info/miscinfo.html" },
  { name: "Fractured Underworld Map", url: "/Fractured%20Underworld/Main%20UI/mainui.html" },
  { name: "Tower Defense", url: "/Fractured%20Underworld/Tower%20Defense/towerdefense.html" },
  { name: "Fractured Underworld Compendium", url: "/Fractured%20Underworld/Compendium/compendium.html" }
];

const languages = ["en", "es", "fr"];

async function inspectWelcomeMat(page, viewport, language) {
  const issues = [];
  const observations = [];

  // Check GGO button exists and has "Not Released" indicator
  const ggoButton = await page.locator("#ggoButton").count();
  if (ggoButton === 0) {
    issues.push("GGO button missing");
  } else {
    const ggoText = await page.locator("#ggoButton").textContent();
    if (
      !ggoText.toLowerCase().includes("not released") &&
      !ggoText.toLowerCase().includes("no disponible") &&
      !ggoText.toLowerCase().includes("pas encore")
    ) {
      issues.push("GGO button missing 'Not Released' indicator");
    }
    observations.push("GGO button present with Not Released indicator");
  }

  // Check world cards exist
  const worldCards = await page.locator(".mode-button").count();
  if (worldCards < 3) {
    issues.push(`Expected at least 3 world cards, found ${worldCards}`);
  } else {
    observations.push(`${worldCards} world cards present`);
  }

  // Check eyebrow label
  const eyebrow = await page.locator(".eyebrow").count();
  if (eyebrow > 0) {
    const eyebrowText = await page.locator(".eyebrow").textContent();
    observations.push(`Eyebrow label: "${eyebrowText}"`);
  }

  // Check vertical spacing (measure gaps)
  const introPanel = await page.locator(".intro-panel, .title-cluster").first();
  const worldGrid = await page.locator(".grid, .mode-button").first();

  if ((await introPanel.count()) > 0 && (await worldGrid.count()) > 0) {
    const introBox = await introPanel.boundingBox();
    const worldBox = await worldGrid.boundingBox();
    if (introBox && worldBox) {
      const gap = worldBox.y - (introBox.y + introBox.height);
      observations.push(`Intro to cards gap: ${Math.round(gap)}px`);
      if (gap > 150) {
        issues.push(`Large vertical gap (${Math.round(gap)}px) between intro and cards`);
      }
    }
  }

  return { issues, observations };
}

async function inspectCharacterBuild(page, viewport, language) {
  const issues = [];
  const observations = [];

  // Check eyebrow label
  const eyebrow = await page.locator(".eyebrow").count();
  if (eyebrow > 0) {
    const eyebrowText = await page.locator(".eyebrow").textContent();
    observations.push(`Eyebrow label: "${eyebrowText}"`);
  }

  // Check the stats summary line (level / class / equipped count), not a "Base" caption
  const baseValue = await page.locator(".base-value").count();
  if (baseValue > 0) {
    const baseText = await page.locator(".base-value").textContent();
    observations.push(`Stats summary: "${baseText}"`);

    /* The summary is built from the live controls, so it must show the selected level. */
    const liveLevel = await page.evaluate(() => {
      const input = document.getElementById("characterLevel");
      return input ? Number(input.value) : null;
    });
    if (liveLevel === null || !baseText.includes(String(liveLevel))) {
      issues.push(`Stats summary does not show the selected level ${liveLevel}: "${baseText}"`);
    }
  } else {
    issues.push("Stats summary missing");
  }

  // Check stats accordions are closed by default
  const statsGroups = await page.locator(".stats-group");
  const groupCount = await statsGroups.count();
  let openCount = 0;
  for (let i = 0; i < groupCount; i++) {
    const isOpen = await statsGroups.nth(i).evaluate((g) => g.open);
    if (isOpen) openCount++;
  }
  if (openCount > 0) {
    issues.push(`${openCount} stats group(s) open by default`);
  } else {
    observations.push("All stats groups closed by default");
  }

  // Check stats icon (should not be emoji-like)
  const statsIcon = await page.locator('.heading-icon[data-cb-icon="stats"]').count();
  if (statsIcon > 0) {
    observations.push("Stats icon present and uses data-cb-icon system");
  }

  // Check equipment section
  const equipmentPanel = await page.locator(".equipment-panel").count();
  if (equipmentPanel > 0) {
    observations.push("Equipment panel present");
  }

  return { issues, observations };
}

async function inspectAincradMap(page, viewport, language) {
  const issues = [];
  const observations = [];

  // Check eyebrow label (the map header has none by design; the sidebar is the page chrome)
  const eyebrow = await page.locator(".eyebrow").count();
  if (eyebrow > 0) {
    const eyebrowText = await page.locator(".eyebrow").textContent();
    observations.push(`Eyebrow label: "${eyebrowText}"`);
  }

  // Check sidebar exists and has width
  const sidebar = await page.locator("#sidebar, .sidebar").count();
  if (sidebar > 0) {
    const sidebarBox = await page.locator("#sidebar, .sidebar").first().boundingBox();
    if (sidebarBox) {
      observations.push(`Sidebar width: ${Math.round(sidebarBox.width)}px`);
      if (sidebarBox.width < 300) {
        issues.push(`Sidebar too narrow (${Math.round(sidebarBox.width)}px)`);
      }
      if (sidebarBox.width > 400) {
        issues.push(`Sidebar too wide (${Math.round(sidebarBox.width)}px), may consume too much map space`);
      }
    }
  } else {
    issues.push("Sidebar missing");
  }

  // Check coordinate display
  const coords = await page.locator('[data-i18n-placeholder*="coordinates"], .coordinates').count();
  if (coords > 0) {
    observations.push("Coordinate display present");
  }

  // Check map container
  const mapContainer = await page.locator("#mapContainer, .map-container").count();
  if (mapContainer > 0) {
    observations.push("Map container present");
  }

  return { issues, observations };
}

async function inspectBestiary(page, viewport, language) {
  const issues = [];
  const observations = [];

  // Check eyebrow label
  const eyebrow = await page.locator(".eyebrow").count();
  if (eyebrow > 0) {
    const eyebrowText = await page.locator(".eyebrow").textContent();
    observations.push(`Eyebrow label: "${eyebrowText}"`);
  }

  // Check counter
  const counter = await page.locator("#status, .status").count();
  if (counter > 0) {
    const counterText = await page.locator("#status, .status").textContent();
    observations.push(`Counter text: "${counterText}"`);

    // Check if counter uses category-specific terms (language-aware)
    const categoryTerms = {
      en: ["boss", "dungeon", "regular"],
      es: ["jefe", "mazmorra", "regular"],
      fr: ["boss", "donjon", "régulier"]
    };

    const terms = categoryTerms[language] || categoryTerms.en;
    const lowerCounter = counterText.toLowerCase();
    const hasCategoryTerm = terms.some((term) => lowerCounter.includes(term));

    if (hasCategoryTerm) {
      observations.push("Counter uses category-specific terminology");
    }
  }

  // Check category tabs
  const categoryTabs = await page.locator('.category-tab, [role="tab"]').count();
  if (categoryTabs > 0) {
    observations.push(`${categoryTabs} category tabs present`);
  }

  return { issues, observations };
}

async function inspectEquipmentCompendium(page, viewport, language) {
  const issues = [];
  const observations = [];

  // Check eyebrow label
  const eyebrow = await page.locator(".eyebrow").count();
  if (eyebrow > 0) {
    const eyebrowText = await page.locator(".eyebrow").textContent();
    observations.push(`Eyebrow label: "${eyebrowText}"`);
  }

  // Check for "Town of Beginnings" or similar long location names
  const locationText = await page.evaluate(() => {
    const metadataElements = document.querySelectorAll('.item-meta, .metadata-value, [data-field*="location"');
    return Array.from(metadataElements)
      .map((el) => el.textContent)
      .join(" ");
  });

  const locationKeywords = {
    en: ["town of beginnings", "beginnings"],
    es: ["pueblo de los comienzos", "comienzos"],
    fr: ["ville des débuts", "débuts"]
  };

  const keywords = locationKeywords[language] || locationKeywords.en;
  const lowerLocation = locationText.toLowerCase();
  const hasLocation = keywords.some((keyword) => lowerLocation.includes(keyword));

  if (hasLocation) {
    observations.push("Location metadata present");
  }

  // Check cards
  const cards = await page.locator(".item-card, .equipment-card").count();
  if (cards > 0) {
    observations.push(`${cards} equipment cards present`);
  }

  // Check category navigation
  const categoryNav = await page.locator(".category-nav, .category-tabs").count();
  if (categoryNav > 0) {
    observations.push("Category navigation present");
  }

  return { issues, observations };
}

async function inspectQuests(page, viewport, language) {
  const issues = [];
  const observations = [];

  // Check eyebrow label
  const eyebrow = await page.locator(".eyebrow").count();
  if (eyebrow > 0) {
    const eyebrowText = await page.locator(".eyebrow").textContent();
    observations.push(`Eyebrow label: "${eyebrowText}"`);
  }

  // Check table
  const table = await page.locator(".quest-table, table").count();
  if (table > 0) {
    observations.push("Quest table present");

    // Check for "Town of Beginnings" in table (language-aware)
    const tableText = await page.locator("table").evaluate((el) => el.textContent);
    const locationKeywords = {
      en: ["town of beginnings", "beginnings"],
      es: ["pueblo de los comienzos", "comienzos"],
      fr: ["ville des débuts", "débuts"]
    };

    const keywords = locationKeywords[language] || locationKeywords.en;
    const lowerTable = tableText.toLowerCase();
    const hasLocation = keywords.some((keyword) => lowerTable.includes(keyword));

    if (hasLocation) {
      observations.push("Location data present in table");
    }
  }

  // Check Completed control
  const completedCheckbox = await page.locator('[type="checkbox"], .completed-control').count();
  if (completedCheckbox > 0) {
    observations.push("Completed control present");
  }

  return { issues, observations };
}

async function inspectPatchnotes(page, viewport, language) {
  const issues = [];
  const observations = [];

  // Check eyebrow label
  const eyebrow = await page.locator(".eyebrow").count();
  if (eyebrow > 0) {
    const eyebrowText = await page.locator(".eyebrow").textContent();
    observations.push(`Eyebrow label: "${eyebrowText}"`);
  }

  // Check for V1.3 patchnote
  const patchText = await page.evaluate(() => document.body.textContent);
  if (patchText.includes("v1.3") || patchText.includes("1.3")) {
    observations.push("V1.3 patchnote present");

    // Check if the historical wording is appropriate
    if (
      patchText.toLowerCase().includes("translation coverage was still incomplete") ||
      patchText.toLowerCase().includes("la cobertura de traducción") ||
      patchText.toLowerCase().includes("la couverture de traduction")
    ) {
      observations.push("V1.3 uses historical translation wording");
    }
  }

  // Check patchnote cards
  const patchCards = await page.locator(".patch-card, .note-card").count();
  if (patchCards > 0) {
    observations.push(`${patchCards} patchnote cards present`);
  }

  return { issues, observations };
}

async function inspectMiscInfo(page, viewport, language) {
  const issues = [];
  const observations = [];

  // Check eyebrow label
  const eyebrow = await page.locator(".eyebrow").count();
  if (eyebrow > 0) {
    const eyebrowText = await page.locator(".eyebrow").textContent();
    observations.push(`Eyebrow label: "${eyebrowText}"`);
  }

  // Check Skills section
  const skillsSection = await page.locator('#skillsHeading, [aria-labelledby="skillsHeading"]').count();
  if (skillsSection > 0) {
    observations.push("Skills section present");
  }

  return { issues, observations };
}

async function inspectFracturedUnderworldMap(page, viewport, language) {
  const issues = [];
  const observations = [];

  // Check empty state
  const emptyState = await page.locator(".map-empty-state, .empty-state").count();
  if (emptyState > 0) {
    const emptyText = await page.locator(".map-empty-state, .empty-state").textContent();
    observations.push(`Empty state present: "${emptyText.substring(0, 50)}..."`);

    // Check if it looks intentional (language-aware)
    const developmentKeywords = {
      en: ["being developed", "currently", "development"],
      es: ["desarrollo", "actualmente", "en curso"],
      fr: ["développement", "actuellement", "en cours"]
    };

    const keywords = developmentKeywords[language] || developmentKeywords.en;
    const lowerEmpty = emptyText.toLowerCase();
    const isIntentional = keywords.some((keyword) => lowerEmpty.includes(keyword));

    if (isIntentional) {
      observations.push("Empty state wording indicates intentional development state");
    }
  } else {
    issues.push("Empty state missing");
  }

  // Check navigation buttons (Player Island, Gigas Cedar, etc.)
  const navButtons = await page.locator(".location-nav button, [data-location]").count();
  if (navButtons > 0) {
    observations.push(`${navButtons} navigation buttons present`);
  }

  return { issues, observations };
}

async function inspectTowerDefense(page, viewport, language) {
  const issues = [];
  const observations = [];

  // Check eyebrow label
  const eyebrow = await page.locator(".eyebrow").count();
  if (eyebrow > 0) {
    const eyebrowText = await page.locator(".eyebrow").textContent();
    observations.push(`Eyebrow label: "${eyebrowText}"`);
  }

  // Check progression items
  const progressionItems = await page.locator(".progression-step, .progression-item").count();
  if (progressionItems > 0) {
    observations.push(`${progressionItems} progression items present`);
  }

  // Check unit cards
  const unitCards = await page.locator(".unit-card, .tower-card").count();
  if (unitCards > 0) {
    observations.push(`${unitCards} unit cards present`);
  }

  // Check for "Current" stats label (language-aware)
  const currentLabel = await page.evaluate(() => {
    const elements = document.querySelectorAll("*");
    for (const el of elements) {
      const text = el.textContent.toLowerCase();
      if (text.includes("current") || text.includes("actual") || text.includes("actuel")) {
        return el.textContent;
      }
    }
    return null;
  });

  if (currentLabel) {
    observations.push(`Current stats label present: "${currentLabel.substring(0, 30)}..."`);
  }

  return { issues, observations };
}

async function inspectFracturedUnderworldCompendium(page, viewport, language) {
  const issues = [];
  const observations = [];

  // Check eyebrow label
  const eyebrow = await page.locator(".eyebrow").count();
  if (eyebrow > 0) {
    const eyebrowText = await page.locator(".eyebrow").textContent();
    observations.push(`Eyebrow label: "${eyebrowText}"`);
  }

  // Check cards (should match Equipment Compendium style)
  const cards = await page.locator(".entry-card, .item-card").count();
  if (cards > 0) {
    observations.push(`${cards} compendium cards present`);
  }

  // Check category navigation
  const categoryNav = await page.locator(".category-nav, .category-tabs").count();
  if (categoryNav > 0) {
    observations.push("Category navigation present");
  }

  // Check search
  const searchInput = await page.locator('input[type="search"]').count();
  if (searchInput > 0) {
    observations.push("Search input present");
  }

  return { issues, observations };
}

async function inspectPage(page, pageInfo, viewport, language) {
  const pageUrl = baseUrl + pageInfo.url;
  const errors = [];

  page.on("console", (message) => {
    if (message.type() === "error" && !message.text().includes("frame-ancestors")) {
      errors.push(message.text());
    }
  });

  page.on("pageerror", (error) => errors.push(error.message));

  await page.goto(pageUrl, { waitUntil: "networkidle", timeout: 15000 });

  // Set language
  if (language !== "en") {
    await page.evaluate((lang) => {
      if (window.SAOI18n) {
        window.SAOI18n.setLanguage(lang);
      }
    }, language);
    await page.waitForTimeout(500);
  }

  let result = { issues: [], observations: [] };

  switch (pageInfo.name) {
    case "Welcome Mat":
      result = await inspectWelcomeMat(page, viewport, language);
      break;
    case "Character Build":
      result = await inspectCharacterBuild(page, viewport, language);
      break;
    case "Aincrad Map":
      result = await inspectAincradMap(page, viewport, language);
      break;
    case "Bestiary":
      result = await inspectBestiary(page, viewport, language);
      break;
    case "Equipment Compendium":
      result = await inspectEquipmentCompendium(page, viewport, language);
      break;
    case "Quests":
      result = await inspectQuests(page, viewport, language);
      break;
    case "Patchnotes":
      result = await inspectPatchnotes(page, viewport, language);
      break;
    case "Misc. Info":
      result = await inspectMiscInfo(page, viewport, language);
      break;
    case "Fractured Underworld Map":
      result = await inspectFracturedUnderworldMap(page, viewport, language);
      break;
    case "Tower Defense":
      result = await inspectTowerDefense(page, viewport, language);
      break;
    case "Fractured Underworld Compendium":
      result = await inspectFracturedUnderworldCompendium(page, viewport, language);
      break;
  }

  return {
    language,
    page: pageInfo.name,
    viewport: viewport.name,
    issues: result.issues,
    observations: result.observations,
    errors,
    status: result.issues.length === 0 && errors.length === 0 ? "passed" : "needs-attention"
  };
}

(async () => {
  await ensureStaticServer();
  const browser = await chromium.launch({ headless: true });
  const results = [];

  try {
    for (const pageInfo of pages) {
      for (const language of languages) {
        for (const viewport of viewports) {
          const page = await browser.newPage({ viewport });

          try {
            const result = await inspectPage(page, pageInfo, viewport, language);
            results.push(result);
          } catch (error) {
            results.push({
              language,
              page: pageInfo.name,
              viewport: viewport.name,
              issues: [`Failed to inspect: ${error.message}`],
              observations: [],
              errors: [error.message],
              status: "failed"
            });
          } finally {
            await page.close();
          }
        }
      }
    }
  } finally {
    await browser.close();
  }

  console.log(JSON.stringify({ results, totalInspections: results.length }, null, 2));

  // Summary
  const passed = results.filter((r) => r.status === "passed");
  const needsAttention = results.filter((r) => r.status === "needs-attention" || r.status === "failed");

  console.log(`\n=== VISUAL QUALITY INSPECTION SUMMARY ===`);
  console.log(`Total inspections: ${results.length}`);
  console.log(`Passed: ${passed.length}`);
  console.log(`Needs attention: ${needsAttention.length}`);

  if (needsAttention.length > 0) {
    console.log("\n=== INSPECTIONS NEEDING ATTENTION ===");
    needsAttention.forEach((item) => {
      console.log(`\n${item.page} / ${item.language} / ${item.viewport}:`);
      if (item.issues.length > 0) {
        console.log("  Issues:");
        item.issues.forEach((issue) => console.log(`    - ${issue}`));
      }
      if (item.errors.length > 0) {
        console.log("  Errors:");
        item.errors.forEach((error) => console.log(`    - ${error}`));
      }
    });
  }

  console.log("\n=== DETAILED OBSERVATIONS ===");
  results.forEach((result) => {
    if (result.observations.length > 0) {
      console.log(`\n${result.page} / ${result.language} / ${result.viewport}:`);
      result.observations.forEach((obs) => console.log(`  ✓ ${obs}`));
    }
  });

  process.exitCode = needsAttention.length > 0 ? 1 : 0;
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
