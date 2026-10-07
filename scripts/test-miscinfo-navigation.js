const assert = require("node:assert/strict");
const { chromium } = require("playwright");
const { attachDiagnostics, describeUrl, ensureStaticServer } = require("./harness-helpers");

const rootUrl = process.env.SAO_BASE_URL || "http://127.0.0.1:8080";
const miscInfoUrl = `${rootUrl}/Aincrad/Misc%20Info/miscinfo.html`;

/* Floor-aware sections carry ?floor=; Misc Info itself is not floor-aware, so every
   expectation below is the destination's own contract. The data mode is chosen once per world
   from the Welcome Mat, so no section adds a ?dataset= parameter or opens a mode dialog. */
const expectations = {
  maps: { pathname: "/Aincrad/Map/maps.html", floor: true },
  bestiary: { pathname: "/Aincrad/Bestiary/bestiary.html", floor: true },
  equipment: { pathname: "/Aincrad/eCompendium/ecompendium.html", floor: true },
  quests: { pathname: "/Aincrad/Quests/quests.html", floor: true },
  patchnotes: { pathname: "/Aincrad/Patchnotes/patchnotes.html", floor: false },
  menu: { pathname: "/index.html", floor: false }
};

const floors = ["floor1", "floor2", "floor3"];

async function openMiscInfo(browser, floor) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();
  const diagnostics = attachDiagnostics(page);

  await page.goto(`${miscInfoUrl}?floor=${floor}`, { waitUntil: "load" });
  await page.waitForFunction(() => Boolean(document.querySelector('button[data-nav-target="maps"]')), null, {
    timeout: 8000
  });
  return { context, page, ...diagnostics };
}

async function navigateFromMiscInfo(browser, floor, target, expectation) {
  const session = await openMiscInfo(browser, floor);
  const { page } = session;
  const button = page.locator(`button[data-nav-target="${target}"]`);
  assert.equal(await button.count(), 1, `${floor}/${target}: the Misc Info nav button exists`);

  await button.click();
  await page.waitForURL((url) => !decodeURIComponent(url.pathname).endsWith("/miscinfo.html"), { timeout: 8000 });
  await page.waitForTimeout(200);

  assert.equal(
    await page.evaluate(() => Boolean(document.querySelector(".sao-dataset-dialog"))),
    false,
    `${floor}/${target}: the section does not re-ask for the data mode`
  );

  const actual = describeUrl(page.url());
  assert.equal(actual.pathname, expectation.pathname, `${floor}/${target}: lands on ${expectation.pathname}`);
  assert.equal(
    actual.floor,
    expectation.floor ? floor : null,
    `${floor}/${target}: floor ${expectation.floor ? "is preserved" : "is not added"} (${actual.search || "no query"})`
  );
  assert.equal(actual.dataset, null, `${floor}/${target}: no dataset query parameter is added`);

  assert.deepEqual(session.errors, [], `${floor}/${target}: no console errors`);
  assert.deepEqual(session.failedRequests, [], `${floor}/${target}: no failed requests`);
  await session.context.close();
  return { floor, target, url: `${actual.pathname}${actual.search}` };
}

(async () => {
  await ensureStaticServer();
  const browser = await chromium.launch({ headless: true });
  const results = [];
  try {
    for (const floor of floors) {
      for (const target of Object.keys(expectations)) {
        results.push(await navigateFromMiscInfo(browser, floor, target, expectations[target]));
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
