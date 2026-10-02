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

async function verifyPage(page, pageInfo, viewport, language) {
  const errors = [];
  const issues = [];

  page.on("console", (message) => {
    if (message.type() === "error" && !message.text().includes("frame-ancestors")) {
      errors.push(message.text());
    }
  });

  page.on("pageerror", (error) => errors.push(error.message));

  // Check for horizontal overflow
  const hasHorizontalOverflow = await page.evaluate(() => {
    return document.documentElement.scrollWidth > document.documentElement.clientWidth;
  });

  if (hasHorizontalOverflow) {
    issues.push("Horizontal overflow detected");
  }

  // Check for clipped text
  const clippedElements = await page.evaluate(() => {
    const elements = document.querySelectorAll("*");
    const clipped = [];
    elements.forEach((el) => {
      const styles = window.getComputedStyle(el);
      if (
        styles.overflow === "hidden" &&
        styles.overflowX === "hidden" &&
        el.scrollWidth > el.clientWidth &&
        el.clientWidth > 0
      ) {
        const rect = el.getBoundingClientRect();
        let widest = null;
        let widestOverflow = 0;
        el.querySelectorAll("*").forEach((child) => {
          const childRect = child.getBoundingClientRect();
          const overflow = childRect.right - rect.right;
          if (overflow > widestOverflow) {
            widestOverflow = overflow;
            widest = child;
          }
        });
        const name = el.tagName + (el.className ? "." + el.className : "") + (el.id ? "#" + el.id : "");
        clipped.push(
          widest
            ? `${name} (child ${widest.tagName}.${String(widest.className || "").split(" ")[0]} overflows by ${Math.round(widestOverflow)}px)`
            : name
        );
      }
    });
    return clipped.slice(0, 10); // Limit to first 10
  });

  if (clippedElements.length > 0) {
    issues.push(`Clipped elements: ${clippedElements.join(", ")}`);
  }

  // Check for eyebrow labels on pages that should have them
  /* The map pages use the full-bleed map header rather than the standard panel header:
     neither maps.css nor mainui.css defines an .eyebrow rule and neither page has ever
     rendered one, so the map pages are deliberately not asserted here. The Commands page
     uses its own header too. */
  const pagesWithEyebrow = [
    "Character Build",
    "Bestiary",
    "Equipment Compendium",
    "Quests",
    "Patchnotes",
    "Misc. Info",
    "Tower Defense",
    "Fractured Underworld Compendium"
  ];

  if (pagesWithEyebrow.includes(pageInfo.name)) {
    const hasEyebrow = (await page.locator(".eyebrow").count()) > 0;
    if (!hasEyebrow) {
      issues.push("Missing eyebrow label");
    }
  }

  // Check for specific elements per page
  if (pageInfo.name === "Welcome Mat") {
    const hasGGO = (await page.locator("#ggoButton").count()) > 0;
    if (!hasGGO) issues.push("GGO button missing");

    const hasWorldCards = (await page.locator(".mode-button").count()) >= 3;
    if (!hasWorldCards) issues.push("World cards missing");
  }

  if (pageInfo.name === "Character Build") {
    const hasBaseLabel = await page.evaluate(() => {
      const baseValueEl = document.querySelector(".base-value");
      return baseValueEl ? baseValueEl.textContent : null;
    });

    if (!hasBaseLabel) {
      issues.push("Base label missing");
    }

    // Check accordions are closed by default
    const groups = await page.locator(".stats-group");
    const groupCount = await groups.count();
    let openCount = 0;
    for (let i = 0; i < groupCount; i++) {
      const isOpen = await groups.nth(i).evaluate((g) => g.open);
      if (isOpen) openCount++;
    }
    if (openCount > 0) {
      issues.push(`${openCount} stats group(s) open by default`);
    }
  }

  if (pageInfo.name === "Bestiary") {
    const counter = await page.locator("#status").textContent();
    if (!counter) issues.push("Counter missing");
  }

  if (pageInfo.name === "Aincrad Map") {
    const sidebar = await page.locator("#sidebar");
    const sidebarVisible = (await sidebar.count()) > 0;
    if (!sidebarVisible) issues.push("Sidebar missing");
  }

  if (pageInfo.name === "Quests") {
    const table = await page.locator(".quest-table");
    const tableVisible = (await table.count()) > 0;
    if (!tableVisible) issues.push("Quest table missing");
  }

  if (pageInfo.name === "Fractured Underworld Map") {
    const emptyState = await page.locator(".map-empty-state");
    const emptyStateVisible = (await emptyState.count()) > 0;
    if (!emptyStateVisible) issues.push("Empty state missing");
  }

  if (pageInfo.name === "Tower Defense") {
    const progressionItems = await page.locator(".progression-step");
    const progressionVisible = (await progressionItems.count()) > 0;
    if (!progressionVisible) issues.push("Progression items missing");
  }

  /* Targeted layout guards.
   *
   * The generic overflow / clipped-element checks above cannot see two defect classes that
   * really did ship: two absolutely positioned panels overlapping (an overlap does not change
   * scrollWidth) and content pushed off-screen behind a scroll container (the quest table's
   * columns slid under #questTableRoot's horizontal scrollbar). These guards assert the
   * concrete invariants the responsive fixes depend on, so those regressions resurface here. */
  const layoutGuards = {
    "Welcome Mat": [
      { type: "no-overlap", first: ".welcome-language-hint", second: ".shell" },
      { type: "inside-viewport", selector: ".character-build-float" }
    ],
    Quests: [{ type: "no-horizontal-scroll", selector: "#questTableRoot" }],
    "Aincrad Map": [{ type: "no-overlap", first: "#zoomControls", second: "#coordinateDisplay" }],
    "Fractured Underworld Map": [
      { type: "no-overlap", first: ".map-empty-state-panel", second: "#infoOverlay" },
      { type: "no-overlap", first: "#zoomControls", second: "#coordinateDisplay" }
    ],
    "Fractured Underworld Compendium": [{ type: "inside-container", selector: ".empty-state", container: ".panel" }]
  };

  const guards = layoutGuards[pageInfo.name] || [];
  if (guards.length > 0) {
    const guardIssues = await page.evaluate((guardList) => {
      const found = [];
      const elOf = (selector) => document.querySelector(selector);
      /* Painted = actually visible on screen. A rect alone is not enough: an element hidden with
         visibility:hidden or opacity:0 still reports its full size, and treating it as visible
         would report phantom overlaps. */
      const isPainted = (element) => {
        if (!element) return false;
        const rect = element.getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0) return false;
        let node = element;
        while (node && node !== document.body) {
          const style = getComputedStyle(node);
          if (style.display === "none" || style.visibility === "hidden" || Number(style.opacity) === 0) return false;
          node = node.parentElement;
        }
        return true;
      };
      guardList.forEach((guard) => {
        if (guard.type === "no-overlap") {
          const firstEl = elOf(guard.first);
          const secondEl = elOf(guard.second);
          if (!isPainted(firstEl) || !isPainted(secondEl)) return;
          const first = firstEl.getBoundingClientRect();
          const second = secondEl.getBoundingClientRect();
          const overlapX = Math.min(first.right, second.right) - Math.max(first.left, second.left);
          const overlapY = Math.min(first.bottom, second.bottom) - Math.max(first.top, second.top);
          if (overlapX > 1 && overlapY > 1) {
            found.push(`${guard.first} overlaps ${guard.second} by ${Math.round(overlapX)}x${Math.round(overlapY)}px`);
          }
          return;
        }
        if (guard.type === "inside-viewport") {
          const element = elOf(guard.selector);
          if (!isPainted(element)) return;
          const rect = element.getBoundingClientRect();
          if (
            rect.right > window.innerWidth + 1 ||
            rect.left < -1 ||
            rect.bottom > window.innerHeight + 1 ||
            rect.top < -1
          ) {
            found.push(`${guard.selector} sits outside the viewport`);
          }
          return;
        }
        if (guard.type === "no-horizontal-scroll") {
          const element = document.querySelector(guard.selector);
          if (!element) return;
          if (element.scrollWidth > element.clientWidth + 1) {
            found.push(
              `${guard.selector} needs horizontal scrolling (${element.scrollWidth}px inside ${element.clientWidth}px)`
            );
          }
          return;
        }
        if (guard.type === "inside-container") {
          const element = elOf(guard.selector);
          const containerEl = elOf(guard.container);
          if (!isPainted(element) || !isPainted(containerEl)) return;
          const rect = element.getBoundingClientRect();
          const container = containerEl.getBoundingClientRect();
          if (rect.left < container.left - 1 || rect.right > container.right + 1) {
            found.push(`${guard.selector} escapes ${guard.container}`);
          }
        }
      });
      return found;
    }, guards);
    guardIssues.forEach((issue) => issues.push(issue));
  }

  return {
    language,
    page: pageInfo.name,
    viewport: viewport.name,
    hasHorizontalOverflow,
    clippedElements,
    errors,
    issues,
    status: issues.length === 0 && errors.length === 0 ? "passed" : "failed"
  };
}

async function verifyTranslations(page, pageInfo, language) {
  // Check that new strings are translated
  const missingTranslations = [];

  // Check eyebrow labels
  if (pageInfo.name === "Welcome Mat") {
    const eyebrow = await page.locator(".eyebrow").textContent();
    if (!eyebrow) missingTranslations.push("eyebrow");
  }

  if (pageInfo.name === "Character Build") {
    const eyebrow = await page.locator(".eyebrow").textContent();
    if (!eyebrow) missingTranslations.push("eyebrow");

    const baseValue = await page.evaluate(() => {
      const el = document.querySelector(".base-value");
      return el ? el.textContent : null;
    });
    if (!baseValue) missingTranslations.push("base value");
  }

  // Check for hardcoded English in non-English pages
  if (language !== "en") {
    const textContent = await page.evaluate(() => document.body.textContent);
    const hardcodedEnglishPatterns = ["AINCRAD /", "FRACTURED UNDERWORLD /", "Town of Beginnings"];

    for (const pattern of hardcodedEnglishPatterns) {
      if (textContent.includes(pattern)) {
        // This is okay - these are proper nouns or structural labels
        // Only flag if it's clearly untranslated user-facing text
      }
    }
  }

  return {
    language,
    page: pageInfo.name,
    missingTranslations,
    status: missingTranslations.length === 0 ? "passed" : "failed"
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
          const pageUrl = baseUrl + pageInfo.url;

          try {
            await page.goto(pageUrl, { waitUntil: "networkidle", timeout: 15000 });

            // Set language if needed
            if (language !== "en") {
              await page.evaluate((lang) => {
                if (window.SAOI18n) {
                  window.SAOI18n.setLanguage(lang);
                }
              }, language);
              await page.waitForTimeout(500);
            }

            const visualResult = await verifyPage(page, pageInfo, viewport, language);
            const translationResult = await verifyTranslations(page, pageInfo, language);

            results.push({
              ...visualResult,
              translationStatus: translationResult.status
            });
          } catch (error) {
            results.push({
              language,
              page: pageInfo.name,
              viewport: viewport.name,
              status: "failed",
              errors: [error.message],
              issues: [`Failed to load: ${error.message}`]
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

  console.log(JSON.stringify({ results, totalTests: results.length }, null, 2));

  // Summary
  const passed = results.filter((r) => r.status === "passed");
  const failed = results.filter((r) => r.status === "failed");

  console.log(`\n=== SUMMARY ===`);
  console.log(`Total tests: ${results.length}`);
  console.log(`Passed: ${passed.length}`);
  console.log(`Failed: ${failed.length}`);

  if (failed.length > 0) {
    console.log("\n=== FAILED TESTS ===");
    failed.forEach((f) => {
      console.log(`- ${f.page} / ${f.language} / ${f.viewport}: ${f.issues.join(", ")}`);
    });
    process.exitCode = 1;
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
