const assert = require("node:assert/strict");
const { chromium } = require("playwright");
const { attachDiagnostics, ensureStaticServer } = require("./harness-helpers");

const rootUrl = process.env.SAO_BASE_URL || "http://127.0.0.1:8080";
const mapUrl = `${rootUrl}/Aincrad/Map/maps.html?floor=floor1`;

/* Verified floor-1 clusters: one that overflows the panel list, one that fits inside it. */
const scrollableCluster = "cluster:vallhat";
const fittingCluster = "cluster:swamp-putride";

/* Records every wheel listener the page registers, so a duplicate listener cannot hide. */
function recordWheelRegistrations(context) {
  return context.addInitScript(() => {
    window.__wheelRegistrations = [];
    const originalAddEventListener = EventTarget.prototype.addEventListener;
    EventTarget.prototype.addEventListener = function (type, listener, options) {
      if (type === "wheel") {
        const passive = options && typeof options === "object" ? options.passive : null;
        window.__wheelRegistrations.push({
          target: this === window ? "window" : this.id || String(this.className || "") || this.tagName || "unknown",
          passive
        });
      }
      return originalAddEventListener.call(this, type, listener, options);
    };
  });
}

async function openMap(browser) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  await recordWheelRegistrations(context);
  await context.addInitScript(() => {
    window.localStorage.setItem("sao.walkthrough.maps.completed", "1");
  });
  const page = await context.newPage();
  const diagnostics = attachDiagnostics(page);
  await page.goto(mapUrl, { waitUntil: "load" });
  await page.waitForTimeout(700);

  /* Every category on, at 1x, so the floor's clusters are all candidates. */
  await page.evaluate(() => {
    [...document.querySelectorAll(".sidebar-list-button[data-category]")].forEach((button) => {
      if (!button.classList.contains("active")) button.click();
    });
  });
  await page.waitForTimeout(800);

  /* Observe wheel handling from the bubble phase: the map's own handler runs first. */
  await page.evaluate(() => {
    window.__wheelRegistrationsAtLoad = window.__wheelRegistrations.length;
    window.__wheelEvents = [];
    window.addEventListener("wheel", (event) => {
      window.__wheelEvents.push({ prevented: event.defaultPrevented });
    });
  });
  return { context, page, ...diagnostics };
}

async function openCluster(page, clusterId) {
  const opened = await page.evaluate((id) => {
    const marker = document.querySelector(`#markers .marker[data-marker-id="${id}"]`);
    if (!marker) return false;
    marker.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    return true;
  }, clusterId);
  await page.waitForTimeout(250);
  return opened;
}

async function readWheelState(page) {
  return page.evaluate(() => {
    const list = document.querySelector("#content .cluster-list");
    return {
      zoomLabel: (document.getElementById("zoomLabel") || {}).textContent || null,
      listScrollTop: list ? list.scrollTop : null,
      listScrollHeight: list ? list.scrollHeight : null,
      listClientHeight: list ? list.clientHeight : null,
      events: window.__wheelEvents || []
    };
  });
}

async function wheelOverSelector(page, selector, deltaY) {
  const box = await page.locator(selector).boundingBox();
  assert.ok(box, `wheel target ${selector} is measurable`);
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.waitForTimeout(60);
  await page.mouse.wheel(0, deltaY);
  await page.waitForTimeout(220);
}

(async () => {
  await ensureStaticServer();
  const browser = await chromium.launch({ headless: true });
  const results = [];
  try {
    /* ---------------------------------------------------------------- *
     * 1. A cluster whose list overflows: the wheel belongs to the list.
     * ---------------------------------------------------------------- */
    const scrollableSession = await openMap(browser);
    const scrollablePage = scrollableSession.page;
    assert.equal(
      await openCluster(scrollablePage, scrollableCluster),
      true,
      `${scrollableCluster} is rendered on floor 1`
    );

    const before = await readWheelState(scrollablePage);
    assert.ok(
      before.listScrollHeight > before.listClientHeight,
      `${scrollableCluster} overflows its list (scrollHeight ${before.listScrollHeight} > clientHeight ${before.listClientHeight})`
    );
    assert.equal(before.listScrollTop, 0, `${scrollableCluster} starts at the top of the list`);

    await wheelOverSelector(scrollablePage, "#content .cluster-list", 160);
    const afterScroll = await readWheelState(scrollablePage);
    assert.ok(
      afterScroll.listScrollTop > before.listScrollTop,
      `${scrollableCluster}: the wheel scrolls the list (scrollTop ${before.listScrollTop} -> ${afterScroll.listScrollTop})`
    );
    assert.equal(
      afterScroll.zoomLabel,
      before.zoomLabel,
      `${scrollableCluster}: the map zoom does not change while the list scrolls (${before.zoomLabel} -> ${afterScroll.zoomLabel})`
    );
    assert.equal(afterScroll.events.length, 1, `${scrollableCluster}: exactly one wheel event was handled`);
    assert.equal(
      afterScroll.events[0].prevented,
      false,
      `${scrollableCluster}: the map does not take over the wheel from the scrollable list`
    );
    assert.deepEqual(scrollableSession.errors, [], `${scrollableCluster}: browser errors`);
    assert.deepEqual(scrollableSession.failedRequests, [], `${scrollableCluster}: failed requests`);
    results.push({ scope: "scrollable-cluster-wheel", cluster: scrollableCluster, status: "passed" });
    await scrollableSession.context.close();

    /* ---------------------------------------------------------------- *
     * 2. A cluster whose list fits: the wheel still zooms the map.
     * ---------------------------------------------------------------- */
    const fittingSession = await openMap(browser);
    const fittingPage = fittingSession.page;
    assert.equal(await openCluster(fittingPage, fittingCluster), true, `${fittingCluster} is rendered on floor 1`);

    const fittingBefore = await readWheelState(fittingPage);
    assert.ok(
      fittingBefore.listScrollHeight <= fittingBefore.listClientHeight,
      `${fittingCluster} fits inside its list (scrollHeight ${fittingBefore.listScrollHeight} <= clientHeight ${fittingBefore.listClientHeight})`
    );

    await wheelOverSelector(fittingPage, "#content .cluster-list", -160);
    const fittingAfter = await readWheelState(fittingPage);
    assert.equal(
      fittingAfter.listScrollTop,
      fittingBefore.listScrollTop,
      `${fittingCluster}: the list does not scroll`
    );
    assert.notEqual(
      fittingAfter.zoomLabel,
      fittingBefore.zoomLabel,
      `${fittingCluster}: the map still zooms (${fittingBefore.zoomLabel} -> ${fittingAfter.zoomLabel})`
    );
    assert.equal(fittingAfter.events.length, 1, `${fittingCluster}: exactly one wheel event was handled`);
    assert.equal(fittingAfter.events[0].prevented, true, `${fittingCluster}: the map keeps ownership of the wheel`);
    assert.deepEqual(fittingSession.errors, [], `${fittingCluster}: browser errors`);
    assert.deepEqual(fittingSession.failedRequests, [], `${fittingCluster}: failed requests`);
    results.push({ scope: "fitting-cluster-wheel", cluster: fittingCluster, status: "passed" });
    await fittingSession.context.close();

    /* ---------------------------------------------------------------- *
     * 3. Wheel over the plain map: one step per event, single listener.
     * ---------------------------------------------------------------- */
    const plainSession = await openMap(browser);
    const plainPage = plainSession.page;
    await plainPage.evaluate(() => {
      const reset = document.getElementById("resetView");
      if (reset) reset.click();
    });
    await plainPage.waitForTimeout(300);

    const plainBefore = await readWheelState(plainPage);
    assert.equal(plainBefore.zoomLabel, "1x", "the map starts at 1x after Reset View");

    await plainPage.mouse.move(300, 700);
    await plainPage.waitForTimeout(60);
    await plainPage.mouse.wheel(0, -120);
    await plainPage.waitForTimeout(250);
    const plainAfter = await readWheelState(plainPage);
    assert.equal(
      plainAfter.zoomLabel,
      "1.1x",
      `one wheel event equals one zoom step (saw ${plainAfter.zoomLabel}; a duplicate handler would give 1.3x)`
    );
    assert.equal(plainAfter.events.length, 1, "exactly one wheel event was handled over the map");
    assert.equal(plainAfter.events[0].prevented, true, "the map takes over the wheel over the map area");

    /* Two consecutive events must produce two steps, not four. */
    await plainPage.mouse.wheel(0, -120);
    await plainPage.waitForTimeout(250);
    const plainThird = await readWheelState(plainPage);
    assert.equal(plainThird.zoomLabel, "1.3x", `a second wheel event adds one more step (saw ${plainThird.zoomLabel})`);
    assert.equal(plainThird.events.length, 2, "two wheel events were handled");
    assert.deepEqual(plainSession.errors, [], "plain map: browser errors");
    assert.deepEqual(plainSession.failedRequests, [], "plain map: failed requests");
    results.push({ scope: "map-wheel-single-listener", status: "passed" });
    await plainSession.context.close();

    /* ---------------------------------------------------------------- *
     * 4. Exactly one wheel listener is registered, and it can preventDefault.
     * ---------------------------------------------------------------- */
    const auditSession = await openMap(browser);
    const audit = await auditSession.page.evaluate(() => ({
      atLoad: window.__wheelRegistrationsAtLoad,
      all: window.__wheelRegistrations
    }));
    const pageRegistrations = audit.all.slice(0, audit.atLoad);
    assert.deepEqual(
      pageRegistrations,
      [{ target: "mapContainer", passive: false }],
      "the map registers exactly one wheel listener on the map container, and it can preventDefault"
    );
    assert.equal(
      audit.all.filter((entry) => entry.target !== "window").length,
      1,
      "no second wheel listener was added anywhere else on the page"
    );
    const overflow = await auditSession.page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth
    );
    assert.equal(overflow, false, "the map page has no horizontal overflow");
    results.push({ scope: "wheel-listener-audit", status: "passed" });
    await auditSession.context.close();
  } finally {
    await browser.close();
  }
  console.log(JSON.stringify({ results, status: "passed" }, null, 2));
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
