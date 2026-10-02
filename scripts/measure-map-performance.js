/* Measures the Aincrad map pages so asset-loading changes can be compared.
 *
 * Reports, per page: navigation timings, resource count, total transferred bytes, a
 * per-initiator byte breakdown and the map image transfer sizes, plus "time until the
 * markers render". Numbers come from the browser's own resource/navigation timings, so the
 * before/after comparison reflects what a real page load actually transfers.
 *
 * Usage:
 *   node scripts/measure-map-performance.js
 *   SAO_BASE_URL=http://127.0.0.1:8081 node scripts/measure-map-performance.js
 */
"use strict";

const { chromium } = require("playwright");
const { ensureStaticServer } = require("./harness-helpers");

const pageUrls = [
  { name: "floor1", url: "/Aincrad/Map/maps.html?floor=floor1" },
  { name: "floor2", url: "/Aincrad/Map/maps.html?floor=floor2" },
  { name: "floor3", url: "/Aincrad/Map/maps.html?floor=floor3" }
];

async function measure(browser, rootUrl, pageInfo) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  await context.addInitScript(() => {
    window.localStorage.setItem("sao.walkthrough.maps.completed", "1");
  });
  const page = await context.newPage();
  const startedAt = Date.now();
  await page.goto(`${rootUrl}${pageInfo.url}`, { waitUntil: "load", timeout: 120000 });
  const loadMs = Date.now() - startedAt;
  const mapImageReadyMs = await page
    .waitForFunction(
      () => {
        const img = document.getElementById("mapImage");
        return Boolean(img) && img.complete && img.naturalWidth > 0;
      },
      null,
      { timeout: 30000 }
    )
    .then(() => Date.now() - startedAt)
    .catch(() => null);

  const metrics = await page.evaluate(() => {
    const nav = performance.getEntriesByType("navigation")[0];
    const resources = performance.getEntriesByType("resource");
    const size = (entry) => entry.transferSize || entry.encodedBodySize || 0;
    const byInitiator = {};
    resources.forEach((entry) => {
      const key = entry.initiatorType || "other";
      byInitiator[key] = (byInitiator[key] || 0) + size(entry);
    });
    const images = resources
      .filter((entry) => entry.initiatorType === "img")
      .map((entry) => ({ name: entry.name.split("/").pop(), bytes: size(entry) }))
      .sort((a, b) => b.bytes - a.bytes);
    return {
      domContentLoadedMs: nav ? Math.round(nav.domContentLoadedEventEnd) : null,
      loadEventMs: nav ? Math.round(nav.loadEventEnd) : null,
      resourceCount: resources.length,
      transferredBytes: resources.reduce((sum, entry) => sum + size(entry), 0),
      scripts: resources.filter((entry) => entry.initiatorType === "script").length,
      scriptBytes: resources
        .filter((entry) => entry.initiatorType === "script")
        .reduce((sum, entry) => sum + size(entry), 0),
      images
    };
  });

  await context.close();
  return { page: pageInfo.name, wallClockLoadMs: loadMs, mapImageReadyMs, ...metrics };
}

async function main() {
  const rootUrl = (await ensureStaticServer(process.env.SAO_BASE_URL)).url;
  console.log(`baseUrl=${rootUrl}`);
  const browser = await chromium.launch({ headless: true });
  try {
    for (const pageInfo of pageUrls) {
      const result = await measure(browser, rootUrl, pageInfo);
      console.log(JSON.stringify(result));
    }
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
