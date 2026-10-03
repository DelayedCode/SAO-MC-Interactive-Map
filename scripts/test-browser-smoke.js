/* Browser smoke guardrail.
 *
 * Loads every player-facing page in English, Spanish and French at the three canonical
 * viewports and fails if any combination produces a JavaScript console error, a failed
 * request for a local resource, a page crash, a horizontal document overflow, or clipped
 * text. It also records the Character Build stats summary width so the localized-summary
 * overflow can be watched directly.
 *
 * Data-driven on purpose: later prompts can widen the matrix (more pages, more viewports,
 * query states) by extending the arrays below, without adding new test cases.
 *
 * Usage:
 *   node scripts/test-browser-smoke.js
 *   node scripts/test-browser-smoke.js --pages=character --languages=es
 *   node scripts/test-browser-smoke.js --viewports=mobile --layout=off
 */
"use strict";

const assert = require("node:assert/strict");
const { chromium } = require("playwright");
const { attachDiagnostics, ensureStaticServer } = require("./harness-helpers");

const pages = [
  { id: "hub", url: "/index.html" },
  { id: "character-build", url: "/Aincrad/Character%20Build/character-build.html" },
  { id: "map", url: "/Aincrad/Map/maps.html" },
  { id: "bestiary", url: "/Aincrad/Bestiary/bestiary.html" },
  { id: "equipment", url: "/Aincrad/eCompendium/ecompendium.html" },
  { id: "quests", url: "/Aincrad/Quests/quests.html" },
  { id: "commands", url: "/Aincrad/Commands/commands.html" },
  { id: "patchnotes", url: "/Aincrad/Patchnotes/patchnotes.html" },
  { id: "miscinfo", url: "/Aincrad/Misc%20Info/miscinfo.html" },
  { id: "underworld-map", url: "/Fractured%20Underworld/Main%20UI/mainui.html" },
  { id: "tower-defense", url: "/Fractured%20Underworld/Tower%20Defense/towerdefense.html" },
  { id: "underworld-compendium", url: "/Fractured%20Underworld/Compendium/compendium.html" }
];

const languages = ["en", "es", "fr"];
const viewports = [
  { name: "1440x1000", width: 1440, height: 1000 },
  { name: "1024x768", width: 1024, height: 768 },
  { name: "768x1024", width: 768, height: 1024 },
  { name: "390x844", width: 390, height: 844 },
  { name: "360x800", width: 360, height: 800 }
];

const WALKTHROUGH_KEYS = [
  "sao.walkthrough.index.completed",
  "sao.walkthrough.maps.completed",
  "sao.walkthrough.mainui.completed",
  "sao.walkthrough.characterBuild.completed"
];

function readFilter(name, items, key) {
  const prefix = `--${name}=`;
  const argument = process.argv.find((value) => value.startsWith(prefix));
  if (!argument) return items;
  const wanted = argument
    .slice(prefix.length)
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
  const filtered = items.filter((item) => {
    const value = typeof item === "string" ? item : String(item[key] === undefined ? "" : item[key]);
    return wanted.some((wantedValue) => value.toLowerCase().includes(wantedValue));
  });
  return filtered.length ? filtered : items;
}

/* Runs in the page. Reports horizontal overflow, clipped text (the same signal the UI
   polish check uses), and the Character Build stats summary geometry. */
function collectLayout() {
  const documentElement = document.documentElement;
  const horizontalOverflow = documentElement.scrollWidth > documentElement.clientWidth;

  const describe = (element) => {
    const className = typeof element.className === "string" ? element.className.split(/\s+/)[0] : "";
    return element.tagName + (className ? "." + className : "") + (element.id ? "#" + element.id : "");
  };

  const clipped = [];
  document.querySelectorAll("*").forEach((element) => {
    const styles = window.getComputedStyle(element);
    if (
      styles.overflow === "hidden" &&
      styles.overflowX === "hidden" &&
      element.clientWidth > 0 &&
      element.scrollWidth > element.clientWidth
    ) {
      const rect = element.getBoundingClientRect();
      let widest = null;
      let widestOverflow = 0;
      element.querySelectorAll("*").forEach((child) => {
        const childRect = child.getBoundingClientRect();
        const overflow = childRect.right - rect.right;
        if (overflow > widestOverflow) {
          widestOverflow = overflow;
          widest = child;
        }
      });
      clipped.push({
        element: describe(element),
        overflow: Math.round(widestOverflow),
        child: widest ? describe(widest) : null
      });
    }
  });

  let summary = null;
  const panel = document.querySelector(".stats-panel");
  const baseValue = document.querySelector(".stats-panel .base-value");
  if (panel && baseValue) {
    const panelStyles = window.getComputedStyle(panel);
    const panelRect = panel.getBoundingClientRect();
    const baseRect = baseValue.getBoundingClientRect();
    const contentRight =
      panelRect.right - parseFloat(panelStyles.paddingRight || "0") - parseFloat(panelStyles.borderRightWidth || "0");
    const contentLeft =
      panelRect.left + parseFloat(panelStyles.paddingLeft || "0") + parseFloat(panelStyles.borderLeftWidth || "0");
    summary = {
      text: baseValue.textContent || "",
      pastContentRight: Math.round(baseRect.right - contentRight),
      pastContentLeft: Math.round(contentLeft - baseRect.left),
      selfClipped: baseValue.scrollWidth > baseValue.clientWidth,
      lines: Math.round(baseRect.height)
    };
  }

  return { horizontalOverflow, clipped, summary };
}

module.exports = { pages, languages, viewports, collectLayout };

async function main() {
  const selectedPages = readFilter("pages", pages, "id");
  const selectedLanguages = readFilter("languages", languages, "self");
  const selectedViewports = readFilter("viewports", viewports, "name");
  const layoutArgument = process.argv.find((value) => value.startsWith("--layout="));
  const checkLayout = layoutArgument ? layoutArgument.split("=")[1] !== "off" : true;

  const rootUrl = (await ensureStaticServer(process.env.SAO_BASE_URL)).url;
  const browser = await chromium.launch({ headless: true });
  const failures = [];
  const summaryRows = [];

  try {
    for (const language of selectedLanguages) {
      for (const pageInfo of selectedPages) {
        for (const viewport of selectedViewports) {
          const context = await browser.newContext({
            viewport: { width: viewport.width, height: viewport.height }
          });
          await context.addInitScript(
            ({ lang, keys }) => {
              window.localStorage.setItem("sao.global.settings", JSON.stringify({ language: lang }));
              keys.forEach((key) => window.localStorage.setItem(key, "1"));
            },
            { lang: language, keys: WALKTHROUGH_KEYS }
          );

          const page = await context.newPage();
          const diagnostics = attachDiagnostics(page);
          const label = `${pageInfo.id} / ${language} / ${viewport.name}`;
          const issues = [];

          try {
            await page.goto(`${rootUrl}${pageInfo.url}`, { waitUntil: "load", timeout: 30000 });
            let appliedLanguage = null;
            await page
              .waitForFunction((lang) => document.documentElement.lang === lang, language, { timeout: 5000 })
              .then(() => {
                appliedLanguage = language;
              })
              .catch(() => {});
            await page.waitForTimeout(350);

            if (appliedLanguage !== language) {
              const actual = await page.evaluate(() => document.documentElement.lang);
              issues.push(`html[lang] is "${actual}" instead of "${language}"`);
            }

            if (pageInfo.id === "hub") {
              const hasStandaloneTilde = await page.locator("body").evaluate((body) =>
                body.innerText.split(/\n/).some((line) => line.trim() === "~")
              );
              if (hasStandaloneTilde) issues.push("Welcome Mat contains a stray standalone tilde");
            }

            const title = await page.title();
            if (!title) issues.push("page title is empty");

            const layout = await page.evaluate(collectLayout);
            if (checkLayout) {
              if (layout.horizontalOverflow) issues.push("horizontal document overflow");
              layout.clipped.forEach((item) => {
                issues.push(
                  `clipped ${item.element}${item.child ? ` (child ${item.child})` : ""} by ${item.overflow}px`
                );
              });
            }

            if (pageInfo.id === "character-build" && layout.summary) {
              summaryRows.push({
                language,
                viewport: viewport.name,
                pastContentRight: layout.summary.pastContentRight,
                pastContentLeft: layout.summary.pastContentLeft,
                selfClipped: layout.summary.selfClipped,
                renderedHeight: layout.summary.lines,
                text: layout.summary.text
              });
              if (checkLayout) {
                if (layout.summary.pastContentRight > 1 || layout.summary.pastContentLeft > 1) {
                  issues.push(
                    `stats summary overflows the panel (right +${layout.summary.pastContentRight}px, left +${layout.summary.pastContentLeft}px)`
                  );
                }
                if (layout.summary.selfClipped) issues.push("stats summary text is clipped inside its pill");
              }
            }
          } catch (error) {
            issues.push(`navigation/render error: ${error.message}`);
          }

          if (diagnostics.errors.length) issues.push(`console errors: ${diagnostics.errors.join(" | ")}`);
          if (diagnostics.failedRequests.length)
            issues.push(`failed requests: ${diagnostics.failedRequests.join(" | ")}`);

          await context.close();

          if (issues.length) {
            failures.push({ label, issues });
            console.log(`FAIL  ${label}`);
            issues.forEach((issue) => console.log(`        - ${issue}`));
          } else {
            console.log(`ok    ${label}`);
          }
        }
      }
    }
  } finally {
    await browser.close();
  }

  if (summaryRows.length) {
    console.log("\nCharacter Build stats summary geometry:");
    summaryRows.forEach((row) => {
      console.log(
        `  ${row.language}/${row.viewport}: right +${row.pastContentRight}px, left +${row.pastContentLeft}px, ` +
          `clipped=${row.selfClipped}, height=${row.renderedHeight}px, "${row.text}"`
      );
    });
  }

  const total = selectedLanguages.length * selectedPages.length * selectedViewports.length;
  console.log(`\nSmoke matrix: ${total} combinations, ${failures.length} failed.`);

  assert.deepEqual(failures, [], `${failures.length} of ${total} page/language/viewport combinations failed`);
  console.log("Browser smoke guardrail passed.");
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
