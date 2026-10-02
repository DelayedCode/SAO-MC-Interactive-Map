const assert = require("node:assert/strict");
const { chromium } = require("playwright");
const { attachDiagnostics, describeUrl, ensureStaticServer } = require("./harness-helpers");

const rootUrl = process.env.SAO_BASE_URL || "http://127.0.0.1:8080";
const miscInfoUrl = `${rootUrl}/Aincrad/Misc%20Info/miscinfo.html`;

/* Floor-aware sections carry ?floor=; Misc Info itself is not floor-aware, so every
   expectation below is the destination's own contract. */
const expectations = {
  maps: { pathname: "/Aincrad/Map/maps.html", floor: true, dataset: false },
  bestiary: { pathname: "/Aincrad/Bestiary/bestiary.html", floor: true, dataset: true },
  equipment: { pathname: "/Aincrad/eCompendium/ecompendium.html", floor: true, dataset: true },
  quests: { pathname: "/Aincrad/Quests/quests.html", floor: true, dataset: true },
  patchnotes: { pathname: "/Aincrad/Patchnotes/patchnotes.html", floor: false, dataset: false },
  menu: { pathname: "/index.html", floor: false, dataset: false }
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
  await page.waitForTimeout(300);

  const dialogOpen = await page.evaluate(() => Boolean(document.querySelector(".sao-dataset-dialog")));
  assert.equal(
    dialogOpen,
    expectation.dataset,
    `${floor}/${target}: dataset dialog ${expectation.dataset ? "is offered" : "is not offered"}`
  );

  if (dialogOpen) {
    const betaChoice = page.locator(".sao-dataset-choice").first();
    assert.equal(await betaChoice.count(), 1, `${floor}/${target}: the dataset dialog offers a choice`);
    await Promise.all([
      page.waitForURL((url) => !decodeURIComponent(url.pathname).endsWith("/miscinfo.html"), { timeout: 8000 }),
      betaChoice.click()
    ]);
  } else {
    await page.waitForURL((url) => !decodeURIComponent(url.pathname).endsWith("/miscinfo.html"), { timeout: 8000 });
  }
  await page.waitForTimeout(200);

  const actual = describeUrl(page.url());
  assert.equal(actual.pathname, expectation.pathname, `${floor}/${target}: lands on ${expectation.pathname}`);
  assert.equal(
    actual.floor,
    expectation.floor ? floor : null,
    `${floor}/${target}: floor ${expectation.floor ? "is preserved" : "is not added"} (${actual.search || "no query"})`
  );
  assert.equal(
    actual.dataset,
    expectation.dataset ? "beta" : null,
    `${floor}/${target}: dataset ${expectation.dataset ? "is preserved as beta" : "is not added"}`
  );

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
