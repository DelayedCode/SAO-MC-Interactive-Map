"use strict";

/* Browser-level checks for Argo the Info Broker (Stage 1: launcher and chat window).
 *
 * Proves in a real browser what the VM checks cannot: that the launcher appears on every page, that
 * it never overlaps the controls already living in the corners it could occupy (the hub's Character
 * Build button and settings gear, the map zoom bar, the coordinate readout and the sidebar), that the
 * window opens/closes/drags with the documented accessibility state, that the closing sphere really
 * runs and is cleaned up, that reduced motion skips it, that the hub walkthrough gained its Argo
 * step, and that map dragging, zooming and marker selection still work with Argo loaded.
 *
 * Needs the shared static server, which ensureStaticServer() starts (or reuses). */

const assert = require("node:assert/strict");
const { chromium } = require("playwright");
const { attachDiagnostics, ensureStaticServer } = require("./harness-helpers");

const rootUrl = process.env.SAO_BASE_URL || "http://127.0.0.1:8080";
const HUB_URL = "/index.html";
const AINCRAD_URL = "/Aincrad/Map/maps.html?floor=floor1";
const UNDERWORLD_URL = "/Fractured%20Underworld/Main%20UI/mainui.html";

const ASSET_SUFFIX = "assets/images/MoonlitBlackCats.webp";

/* True when two client rects intersect (with a 1px tolerance for sub-pixel edges). */
function overlaps(a, b) {
  if (!a || !b) return false;
  return a.left < b.right - 1 && b.left < a.right - 1 && a.top < b.bottom - 1 && b.top < a.bottom - 1;
}

/* The launcher must be visible, on screen, and clear of every control that shares its corners. */
function assertLauncherClearOfPageChrome(state, label) {
  assert.equal(state.launcherCount, 1, `${label}: exactly one launcher exists`);
  assert.equal(state.windowCount, 1, `${label}: exactly one window exists`);
  assert.equal(state.launcherTag, "BUTTON", `${label}: the launcher is a real button`);
  assert.ok(state.launcherRect && state.launcherRect.width >= 44, `${label}: the launcher keeps a touch-sized target`);
  assert.ok(state.launcherRect.width <= 48 && state.launcherRect.height <= 48, `${label}: the launcher stays small`);
  assert.ok(state.launcherLabel && state.launcherLabel.length > 0, `${label}: the launcher is labelled`);
  assert.equal(state.launcherControls, "argo-window", `${label}: the launcher points at the window`);
  assert.equal(state.launcherExpanded, "false", `${label}: the launcher starts collapsed`);
  assert.equal(state.windowHidden, true, `${label}: the window starts hidden`);
  assert.equal(state.windowRole, "dialog", `${label}: the window is a dialog`);
  assert.ok(
    state.title.length > 0 && !state.title.includes("argo."),
    `${label}: the title is localized, not a raw key`
  );
  assert.ok(state.imageSrc.endsWith(ASSET_SUFFIX), `${label}: the guild image resolves (${state.imageSrc})`);
  assert.ok(state.imageNaturalWidth > 0, `${label}: the guild image actually loads`);

  const inViewport =
    state.launcherRect.left >= 0 &&
    state.launcherRect.top >= 0 &&
    state.launcherRect.right <= state.viewport.width &&
    state.launcherRect.bottom <= state.viewport.height;
  assert.equal(inViewport, true, `${label}: the launcher is inside the viewport`);

  assert.equal(
    overlaps(state.launcherRect, state.characterBuildRect),
    false,
    `${label}: the launcher clears Character Build`
  );
  assert.equal(
    overlaps(state.launcherRect, state.settingTriggerRect),
    false,
    `${label}: the launcher clears the settings gear`
  );
  assert.equal(
    overlaps(state.launcherRect, state.zoomControlsRect),
    false,
    `${label}: the launcher clears the map zoom bar`
  );
  assert.equal(
    overlaps(state.launcherRect, state.coordinateRect),
    false,
    `${label}: the launcher clears the coordinate readout`
  );
  assert.equal(overlaps(state.launcherRect, state.sidebarRect), false, `${label}: the launcher clears the map sidebar`);
}

/* Open, exercise the window, and close it again. Returns the state captured while it was open. */
async function exerciseWindow(page, label, options = {}) {
  await page.click("#argo-launcher");
  await page.waitForFunction(
    () => {
      const windowEl = document.getElementById("argo-window");
      return Boolean(windowEl) && !windowEl.hidden && windowEl.classList.contains("is-open");
    },
    null,
    { timeout: 5000 }
  );

  /* The window is positioned on the next animation frame, so its box is waited for before it is measured.
     The stylesheet caps the content width at 360px and adds a 1px border on each side. */
  await page
    .waitForFunction(
      () => {
        const windowEl = document.getElementById("argo-window");
        if (!windowEl || windowEl.hidden) return false;
        const rect = windowEl.getBoundingClientRect();
        return rect.width >= 200 && rect.width <= 364 && rect.top >= 0 && rect.left >= 0;
      },
      null,
      { timeout: 10000 }
    )
    .catch(() => {});

  const opened = await readArgoState(page);
  assert.equal(opened.launcherExpanded, "true", `${label}: the launcher reports expanded`);
  assert.equal(opened.launcherHidden, true, `${label}: the launcher hides while the window is open`);
  assert.equal(opened.messages.length, 1, `${label}: opening shows one greeting`);
  assert.ok(opened.messages[0].length > 20, `${label}: the greeting has real text`);
  assert.equal(opened.messages[0].includes("argo."), false, `${label}: the greeting is localized, not a raw key`);
  assert.equal(
    (await readIntroLines(page)).includes(opened.messages[0]),
    true,
    `${label}: the greeting invites a question`
  );
  assert.match(opened.activeClassName, /argo-input/, `${label}: the input takes focus`);
  /* 360px of content plus the 1px border on each side, and never a full-viewport panel. */
  assert.ok(
    opened.windowRect.width <= 364 && opened.windowRect.width >= 200,
    `${label}: the window stays compact (width ${opened.windowRect.width})`
  );
  assert.ok(
    opened.windowRect.left >= 0 &&
      opened.windowRect.top >= 0 &&
      opened.windowRect.right <= opened.viewport.width &&
      opened.windowRect.bottom <= opened.viewport.height,
    `${label}: the open window sits inside the viewport`
  );

  /* Sending a question reaches the real engine and answers with real records. The window answers
     asynchronously while the cross-page records are still being prepared, so the reply is waited for
     rather than read straight after the click. */
  await page.fill("#argo-window .argo-input", "Where can I find Spider Silk?");
  await page.click("#argo-window .argo-send");
  await page
    .waitForFunction(() => document.querySelectorAll("#argo-window .argo-message-body").length >= 3, null, {
      timeout: 20000
    })
    .catch(() => {});
  const afterSend = await readArgoState(page);
  assert.equal(afterSend.messages.length, 3, `${label}: a question adds the visitor's message and a reply`);
  assert.match(afterSend.messages[1], /Spider Silk/, `${label}: the visitor's text is shown`);
  assert.equal(afterSend.inputValue, "", `${label}: sending clears the input`);
  const reply = afterSend.messages[2];
  assert.equal(reply.includes("argo."), false, `${label}: the reply is localized, not a raw key`);
  assert.equal(
    reply.includes("aren't loaded on this page yet"),
    false,
    `${label}: the reply comes from the engine, not the missing-engine notice`
  );
  assert.ok(reply.length > 20, `${label}: the reply has real text`);

  /* On a page with map data loaded, a known location answers with its documented coordinates. */
  if (options.gameData) {
    /* The page itself has no equipment records: this answer can only come from the data provider. */
    const pageHasEquipment = await page.evaluate(() => typeof window.FLOOR_1_DATA);
    assert.equal(pageHasEquipment, "undefined", `${label}: the page itself never loaded the equipment records`);

    await page.fill("#argo-window .argo-input", "what are the stats on training bow");
    await page.click("#argo-window .argo-send");
    await page
      .waitForFunction(
        () => {
          const bodies = [...document.querySelectorAll("#argo-window .argo-message-body")];
          const last = bodies[bodies.length - 1];
          return Boolean(last) && last.textContent.includes("Training Bow");
        },
        null,
        { timeout: 60000 }
      )
      .catch(() => {});
    const equipmentReply = (await readArgoState(page)).messages.slice(-1)[0];
    assert.match(equipmentReply, /Training Bow/, `${label}: a cross-page equipment record is found`);
    assert.match(equipmentReply, /Attack Damage 3/, `${label}: and its real statistics come back`);
    assert.equal(
      equipmentReply.includes("aren't loaded on this page yet"),
      false,
      `${label}: the answer came through the provider`
    );

    await page.fill("#argo-window .argo-input", "where is arakh-nol");
    await page.click("#argo-window .argo-send");
    const locationState = await readArgoState(page);
    const locationReply = locationState.messages.slice(-1)[0];
    assert.match(locationReply, /Arakh'Nol/, `${label}: the asked location is named`);
    assert.match(locationReply, /Coordinates: X: /, `${label}: the documented marker coordinates are shown`);
    assert.equal(
      locationReply.includes("aren't loaded on this page yet"),
      false,
      `${label}: the location answer comes from the real engine`
    );

    /* The answers carry a real link into the site's own pages: the item to its own record on its own
       equipment tab, the location to the map with the marker's own category switched on. */
    assert.equal(
      locationState.links.some((href) =>
        /\/Aincrad\/eCompendium\/ecompendium\.html\?floor=floor1&search=.+&category=/.test(href)
      ),
      true,
      `${label}: the equipment answer links to the record itself (${JSON.stringify(locationState.links)})`
    );
    assert.equal(
      locationState.links.some(
        (href) => /\/Aincrad\/Map\/maps\.html\?floor=floor1&search=Arakh/.test(href) && /categories=/.test(href)
      ),
      true,
      `${label}: the location answer links to the map, filtered to the marker and with its category on (${JSON.stringify(locationState.links)})`
    );
  }

  /* The Fractured Underworld branch of the frame: its Current-only questline comes from the provider. */
  if (options.underworld) {
    const pageHasQuests = await page.evaluate(() => typeof window.SAO_CURRENT_QUEST_ENTRIES_BY_FLOOR);
    assert.equal(pageHasQuests, "undefined", `${label}: the page itself never loaded the quest records`);

    const provider = await page.evaluate(() => window.SAOArgoData?.getState?.() || null);
    assert.equal(Boolean(provider) && provider.ready, true, `${label}: the provider prepared the Underworld records`);
    assert.equal(provider.world, "underworld", `${label}: the provider loaded the Underworld world`);
    assert.equal(provider.keys.includes("currentQuests"), true, `${label}: the questline came through the frame`);
    assert.equal(provider.keys.includes("underworldCompendium"), true, `${label}: the Underworld list came too`);
    assert.equal(
      provider.keys.includes("betaEquipmentByFloor") || provider.keys.includes("markerData"),
      false,
      `${label}: no Aincrad source was loaded for the Underworld`
    );

    await page.fill("#argo-window .argo-input", "where is the new world");
    await page.click("#argo-window .argo-send");
    await page
      .waitForFunction(
        () => {
          const bodies = [...document.querySelectorAll("#argo-window .argo-message-body")];
          const last = bodies[bodies.length - 1];
          return Boolean(last) && /New World/i.test(last.textContent);
        },
        null,
        { timeout: 60000 }
      )
      .catch(() => {});
    const questReply = (await readArgoState(page)).messages.slice(-1)[0];
    assert.match(questReply, /New World/, `${label}: the Underworld questline is reachable through the provider`);
    assert.match(questReply, /NPC: /, `${label}: the documented quest NPC is shown`);
    assert.equal(
      questReply.includes("aren't loaded on this page yet"),
      false,
      `${label}: the quest answer came through the provider`
    );
    assert.equal(/Curved Bow|Sinister White Wolf/.test(questReply), false, `${label}: no Aincrad record leaks in`);
  }

  /* Dragging: only from the title bar, and clamped to the viewport. */
  const titleBox = await page.locator("#argo-window .argo-titlebar").boundingBox();
  const beforeDrag = (await readArgoState(page)).windowRect;
  await page.mouse.move(titleBox.x + titleBox.width / 2, titleBox.y + titleBox.height / 2);
  await page.mouse.down();
  await page.mouse.move(titleBox.x + titleBox.width / 2 + 60, titleBox.y + titleBox.height / 2 - 40, { steps: 5 });
  await page.mouse.up();
  const afterDrag = (await readArgoState(page)).windowRect;
  assert.ok(Math.abs(afterDrag.left - beforeDrag.left) > 20, `${label}: the title bar drags the window`);

  /* A press on the close button must not move the window. */
  const closeBox = await page.locator("#argo-window .argo-close").boundingBox();
  await page.mouse.move(closeBox.x + closeBox.width / 2, closeBox.y + closeBox.height / 2);
  await page.mouse.down();
  await page.mouse.move(closeBox.x + 120, closeBox.y + 80, { steps: 4 });
  const afterClosePress = (await readArgoState(page)).windowRect;
  await page.mouse.up();
  assert.equal(Math.round(afterClosePress.left), Math.round(afterDrag.left), `${label}: the close button never drags`);

  /* Extreme drag stays inside the viewport. */
  const titleBox2 = await page.locator("#argo-window .argo-titlebar").boundingBox();
  await page.mouse.move(titleBox2.x + 10, titleBox2.y + 10);
  await page.mouse.down();
  await page.mouse.move(titleBox2.x - 4000, titleBox2.y - 4000, { steps: 6 });
  await page.mouse.up();
  const clamped = await readArgoState(page);
  assert.ok(clamped.windowRect.left >= 0 && clamped.windowRect.top >= 0, `${label}: a hard drag stays on screen`);

  return afterSend;
}

/* Reads the module's real DOM state instead of reimplementing any of it. */
function readArgoState(page) {
  return page.evaluate(() => {
    const launcher = document.getElementById("argo-launcher");
    const windowEl = document.getElementById("argo-window");
    const rect = (element) => {
      if (!element) return null;
      const box = element.getBoundingClientRect();
      return {
        left: box.left,
        top: box.top,
        right: box.right,
        bottom: box.bottom,
        width: box.width,
        height: box.height
      };
    };
    const image = launcher ? launcher.querySelector("img") : null;
    const input = windowEl ? windowEl.querySelector(".argo-input") : null;
    return {
      launcherCount: document.querySelectorAll("#argo-launcher").length,
      windowCount: document.querySelectorAll("#argo-window").length,
      launcherTag: launcher ? launcher.tagName : null,
      launcherRect: rect(launcher),
      windowRect: rect(windowEl),
      launcherLabel: launcher ? launcher.getAttribute("aria-label") : null,
      launcherControls: launcher ? launcher.getAttribute("aria-controls") : null,
      launcherExpanded: launcher ? launcher.getAttribute("aria-expanded") : null,
      launcherHidden: launcher ? launcher.classList.contains("is-hidden") : null,
      windowHidden: windowEl ? windowEl.hidden : null,
      windowOpen: windowEl ? windowEl.classList.contains("is-open") : null,
      windowRole: windowEl ? windowEl.getAttribute("role") : null,
      title: windowEl ? (windowEl.querySelector(".argo-title") || {}).textContent || "" : "",
      imageSrc: image ? image.currentSrc || image.src : "",
      imageNaturalWidth: image ? image.naturalWidth : 0,
      messages: windowEl
        ? [...windowEl.querySelectorAll(".argo-message")].map(
            (message) => (message.querySelector(".argo-message-body") || {}).textContent || ""
          )
        : [],
      links: windowEl ? [...windowEl.querySelectorAll(".argo-link")].map((anchor) => anchor.getAttribute("href")) : [],
      activeClassName: document.activeElement ? document.activeElement.className || "" : "",
      activeId: document.activeElement ? document.activeElement.id || "" : "",
      inputValue: input ? input.value : null,
      spheres: document.querySelectorAll(".argo-sphere").length,
      settingTriggerRect: rect(document.querySelector(".sao-settings-trigger")),
      characterBuildRect: rect(document.getElementById("characterBuildButton")),
      zoomControlsRect: rect(document.getElementById("zoomControls")),
      coordinateRect: rect(document.getElementById("coordinateDisplay")),
      sidebarRect: rect(document.getElementById("sidebar")),
      viewport: { width: window.innerWidth, height: window.innerHeight }
    };
  });
}

/* The real welcome pool, read out of the page's own dictionary - the greeting is drawn from it at
   random, so a check compares against the whole pool rather than one fixed line. */
async function readIntroLines(page) {
  return page.evaluate(() =>
    Array.from({ length: 10 }, (_value, index) => window.SAOI18n.t(`argo.intro.${index + 1}`))
  );
}

/* Closes the window through the real close button and verifies the sphere actually ran. */
async function closeAndVerify(page, label) {
  const greetingBeforeClose = (await readArgoState(page)).messages[0];
  /* Watch for the sphere before it can appear: the travel is short. */
  await page.evaluate(() => {
    window.__argoSphereSeen = false;
    window.__argoSphereRemoved = false;
    const observer = new MutationObserver(() => {
      if (document.querySelector(".argo-sphere")) window.__argoSphereSeen = true;
      else if (window.__argoSphereSeen) window.__argoSphereRemoved = true;
    });
    observer.observe(document.body, { childList: true, subtree: true });
  });

  await page.click("#argo-window .argo-close");
  await page.waitForFunction(() => document.getElementById("argo-window").hidden, null, { timeout: 5000 });
  await page.waitForFunction(() => window.__argoSphereRemoved === true, null, { timeout: 5000 }).catch(() => {});

  const closed = await readArgoState(page);
  assert.equal(closed.windowHidden, true, `${label}: the window is hidden after closing`);
  assert.equal(closed.windowOpen, false, `${label}: the open class is removed`);
  assert.equal(closed.launcherExpanded, "false", `${label}: the launcher reports collapsed again`);
  assert.equal(closed.launcherHidden, false, `${label}: the launcher is available again`);
  assert.equal(closed.spheres, 0, `${label}: no sphere is left behind`);
  assert.equal(closed.messages.length, 0, `${label}: closing clears the conversation`);
  assert.equal(closed.inputValue, "", `${label}: closing clears the input`);
  assert.equal(closed.activeId, "argo-launcher", `${label}: focus returns to the launcher`);
  assert.equal(await page.evaluate(() => window.__argoSphereSeen), true, `${label}: the closing sphere travels`);

  /* Reopening starts a completely fresh conversation. */
  await page.click("#argo-launcher");
  await page.waitForFunction(() => !document.getElementById("argo-window").hidden, null, { timeout: 5000 });
  const reopened = await readArgoState(page);
  assert.equal(reopened.messages.length, 1, `${label}: reopening starts a fresh conversation`);
  assert.equal(
    (await readIntroLines(page)).includes(reopened.messages[0]),
    true,
    `${label}: the fresh conversation shows a welcome line`
  );
  assert.notEqual(reopened.messages[0], greetingBeforeClose, `${label}: and never the welcome line that was just read`);
  await page.click("#argo-window .argo-close");
  await page.waitForFunction(() => document.getElementById("argo-window").hidden, null, { timeout: 5000 });
}

/* The page's own controls must keep working with Argo loaded. */
async function assertMapStillInteractive(page, label, options = {}) {
  const before = await page.evaluate(() => document.getElementById("mapLayer").style.transform);
  const mapBox = await page.locator("#mapContainer").boundingBox();
  await page.mouse.move(mapBox.x + mapBox.width / 2, mapBox.y + mapBox.height / 2);
  await page.mouse.down();
  await page.mouse.move(mapBox.x + mapBox.width / 2 + 90, mapBox.y + mapBox.height / 2 + 50, { steps: 8 });
  await page.mouse.up();
  const afterDrag = await page.evaluate(() => document.getElementById("mapLayer").style.transform);
  assert.notEqual(afterDrag, before, `${label}: the map still pans`);

  const zoomBefore = await page.locator("#zoomLabel").textContent();
  await page.mouse.move(mapBox.x + mapBox.width / 2, mapBox.y + mapBox.height / 2);
  await page.mouse.wheel(0, -300);
  await page.waitForTimeout(200);
  const zoomAfter = await page.locator("#zoomLabel").textContent();
  assert.notEqual(zoomAfter, zoomBefore, `${label}: the map still zooms with the wheel`);

  /* Markers only render for enabled categories, exactly as the site behaves for a visitor. The
     Fractured Underworld's islands are still placeholder artwork with Current-Data-only markers,
     so only the Aincrad map is asked to prove marker interaction here. */
  if (options.markers === false) {
    return;
  }
  await page.evaluate(() => {
    document.querySelectorAll(".sidebar-list-button[data-category]").forEach((button) => {
      if (button.getAttribute("aria-pressed") !== "true") button.click();
    });
  });
  await page.waitForTimeout(300);

  const markerCount = await page.locator("#markers .marker").count();
  assert.ok(markerCount > 0, `${label}: the map renders markers`);
  /* Whichever dataset mode the page is on, at least one rendered marker must still open its details.
     Markers that render outside the viewport are skipped, so this proves interaction and not layout. */
  const markerHandles = await page.locator("#markers .marker").elementHandles();
  let openedTitle = "";
  for (const handle of markerHandles.slice(0, 12)) {
    const box = await handle.boundingBox();
    if (!box || box.width < 4 || box.height < 4) continue;
    await handle.click({ force: true });
    await page.waitForTimeout(150);
    const title = (await page.locator("#infoOverlay #title").textContent()).trim();
    if (title.length > 0 && title !== "Select a marker") {
      openedTitle = title;
      break;
    }
  }
  assert.ok(openedTitle.length > 0, `${label}: clicking a marker still opens its details`);
}

/* --- Page setups ------------------------------------------------------------ */

/* The hub gates first visits behind the warning, so it is dismissed in Skip mode (the encounter
   counter is seeded past the threshold) and the tour is pre-completed unless a check wants it. */
async function openHubPage(server, browser, contextOptions = {}) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, ...contextOptions });
  await context.addInitScript(() => {
    /* Seeding runs in every frame, including Argo's sandboxed data frame, which has no storage by
       design - so the write is best-effort here and only matters for the page itself. */
    try {
      window.localStorage.setItem("sao.warning.encounters", "9");
      window.localStorage.setItem("sao.walkthrough.index.completed", "1");
    } catch (_error) {
      /* A sandboxed helper frame: nothing to seed. */
    }
  });
  const page = await context.newPage();
  const diagnostics = attachDiagnostics(page);
  await page.goto(`${server.url}${HUB_URL}`, { waitUntil: "load", timeout: 60000 });
  await page.waitForSelector(".sao-warning-okay", { timeout: 15000 });
  await page.click(".sao-warning-okay");
  await page.waitForFunction(() => !document.querySelector(".sao-warning-overlay"), null, { timeout: 8000 });
  return { context, page, diagnostics };
}

/* Map pages auto-start their own tour, which is pre-completed here so it cannot cover the controls. */
async function openMapPage(server, browser, url, walkthroughKey, options = {}) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  await context.addInitScript(
    (seeds) => {
      try {
        Object.entries(seeds).forEach(([key, value]) => window.localStorage.setItem(key, value));
      } catch (_error) {
        /* A sandboxed helper frame: nothing to seed. */
      }
    },
    Object.assign({ [walkthroughKey]: "1" }, options.storage || {})
  );
  const page = await context.newPage();
  const diagnostics = attachDiagnostics(page);
  await page.goto(`${server.url}${url}`, { waitUntil: "load", timeout: 60000 });
  await page.waitForSelector("#argo-launcher", { timeout: 15000 });
  await page.waitForTimeout(400);
  return { context, page, diagnostics };
}

/* --- Checks ----------------------------------------------------------------- */

async function checkHub(server, browser) {
  const { context, page, diagnostics } = await openHubPage(server, browser);

  /* The Welcome Mat is deliberately Argo-free: no launcher, no window, no module, no stylesheet. */
  const argoOnHub = await page.evaluate(() => ({
    launcher: Boolean(document.getElementById("argo-launcher")),
    window: Boolean(document.getElementById("argo-window")),
    api: typeof window.SAOArgo,
    engine: typeof window.SAOArgoEngine,
    provider: typeof window.SAOArgoData,
    stylesheet: [...document.querySelectorAll("link[rel=stylesheet]")].some((link) =>
      String(link.href).includes("sao-argo")
    )
  }));
  assert.equal(argoOnHub.launcher, false, "hub: the Welcome Mat has no Argo launcher");
  assert.equal(argoOnHub.window, false, "hub: the Welcome Mat has no Argo window");
  assert.equal(argoOnHub.api, "undefined", "hub: the Welcome Mat never loads the Argo module");
  assert.equal(argoOnHub.engine, "undefined", "hub: the Welcome Mat never loads the Argo engine");
  assert.equal(argoOnHub.provider, "undefined", "hub: the Welcome Mat never loads the data provider");
  assert.equal(argoOnHub.stylesheet, false, "hub: the Welcome Mat loads no Argo stylesheet");

  /* And the rest of the Welcome Mat still works. */
  assert.ok(await page.locator(".mode-button.aincrad").first().isVisible(), "hub: the mode cards still render");
  assert.deepEqual(diagnostics.errors, [], "the hub raises no console errors");
  assert.deepEqual(diagnostics.failedRequests, [], "the hub loads every resource");
  await context.close();
}

async function checkMap(server, browser, url, label, walkthroughKey, options = {}) {
  const { context, page, diagnostics } = await openMapPage(server, browser, url, walkthroughKey, {
    storage: options.storage
  });
  assertLauncherClearOfPageChrome(await readArgoState(page), label);
  await exerciseWindow(page, label, { gameData: options.markers === true, underworld: options.underworld === true });
  await closeAndVerify(page, label);
  await assertMapStillInteractive(page, label, { markers: options.markers });
  assert.deepEqual(diagnostics.errors, [], `${label}: no console errors`);
  assert.deepEqual(diagnostics.failedRequests, [], `${label}: every resource loads`);
  await context.close();
}

async function checkReducedMotion(server, browser) {
  /* The Welcome Mat no longer carries Argo, so the reduced-motion check runs on the Aincrad map. */
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: "reduce"
  });
  await context.addInitScript(() => {
    try {
      window.localStorage.setItem("sao.walkthrough.maps.completed", "1");
      window.localStorage.setItem("sao.warning.encounters", "9");
    } catch (_error) {
      /* A sandboxed helper frame: nothing to seed. */
    }
  });
  const page = await context.newPage();
  const diagnostics = attachDiagnostics(page);
  await page.goto(`${server.url}${AINCRAD_URL}`, { waitUntil: "load", timeout: 60000 });
  await page.waitForSelector("#argo-launcher", { timeout: 15000 });

  await page.click("#argo-launcher");
  await page.waitForFunction(() => !document.getElementById("argo-window").hidden, null, { timeout: 5000 });
  await page.evaluate(() => {
    window.__argoSphereSeen = false;
    const observer = new MutationObserver(() => {
      if (document.querySelector(".argo-sphere")) window.__argoSphereSeen = true;
    });
    observer.observe(document.body, { childList: true, subtree: true });
  });
  await page.click("#argo-window .argo-close");
  await page.waitForFunction(() => document.getElementById("argo-window").hidden, null, { timeout: 5000 });
  assert.equal(await page.evaluate(() => window.__argoSphereSeen), false, "reduced motion skips the sphere");
  const state = await readArgoState(page);
  assert.equal(state.messages.length, 0, "reduced motion still clears the conversation");
  assert.equal(state.launcherHidden, false, "reduced motion restores the launcher");
  assert.equal(state.launcherExpanded, "false", "reduced motion restores the collapsed state");
  assert.deepEqual(diagnostics.errors, [], "reduced motion raises no console errors");
  await context.close();
}

/* Beta-Test Data must be refused in the real window, without touching either dataset. */
async function checkBetaMode(server, browser) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  await context.addInitScript(() => {
    try {
      window.localStorage.setItem("sao.walkthrough.maps.completed", "1");
      window.localStorage.setItem("sao.warning.encounters", "9");
      window.localStorage.setItem("sao.dataset.aincrad", "beta");
    } catch (_error) {
      /* A sandboxed helper frame: nothing to seed. */
    }
  });
  const page = await context.newPage();
  const diagnostics = attachDiagnostics(page);
  await page.goto(`${server.url}${AINCRAD_URL}`, { waitUntil: "load", timeout: 60000 });
  await page.waitForSelector("#argo-launcher", { timeout: 15000 });

  assert.equal(
    await page.evaluate(() => window.SAODatasets.getDatasetFromLocation()),
    "beta",
    "beta: the page really is on Beta-Test Data"
  );

  await page.click("#argo-launcher");
  await page.waitForFunction(() => !document.getElementById("argo-window").hidden, null, { timeout: 5000 });
  const refusals = await page.evaluate(() =>
    [1, 2, 3, 4].map((variant) => window.SAOI18n.t(`argo.status.datasetUnsupported.${variant}`))
  );
  assert.equal(
    refusals.every((line) => typeof line === "string" && line.length > 20),
    true,
    "beta: the notices exist"
  );
  await page.fill("#argo-window .argo-input", "where can i buy the sticky ring");
  await page.click("#argo-window .argo-send");
  await page
    .waitForFunction(
      (lines) => {
        const bodies = [...document.querySelectorAll("#argo-window .argo-message-body")];
        const last = bodies[bodies.length - 1];
        return Boolean(last) && lines.includes(last.textContent.trim());
      },
      refusals,
      { timeout: 20000 }
    )
    .catch(() => {});
  const reply = (await readArgoState(page)).messages.slice(-1)[0];
  assert.equal(refusals.includes(reply.trim()), true, "beta: the window refuses Beta-Test Data in character");
  assert.match(reply, /dataset/i, "beta: and tells the visitor what to change");
  assert.equal(/\n/.test(reply.trim()), false, "beta: the refusal is a single line");
  assert.equal(/Sticky Ring|Secret Sticky Ring Merchant/.test(reply), false, "beta: no Current record is leaked");
  assert.equal(/Ask me about items and gear/.test(reply), false, "beta: no help text is bolted on");

  /* The window still behaves: it closes and reopens cleanly after a refusal. */
  await closeAndVerify(page, "beta");
  assert.deepEqual(diagnostics.errors, [], "beta: no console errors");
  assert.deepEqual(diagnostics.failedRequests, [], "beta: every resource loads");
  await context.close();
}

async function checkWalkthrough(server, browser) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  await context.addInitScript(() => {
    try {
      window.localStorage.setItem("sao.warning.encounters", "9");
    } catch (_error) {
      /* A sandboxed helper frame: nothing to seed. */
    }
  });
  const page = await context.newPage();
  const diagnostics = attachDiagnostics(page);
  await page.goto(`${server.url}${HUB_URL}`, { waitUntil: "load", timeout: 60000 });
  await page.waitForSelector(".sao-warning-okay", { timeout: 15000 });
  await page.click(".sao-warning-okay");
  await page.waitForFunction(() => Boolean(document.querySelector(".sao-tour-overlay.open")), null, { timeout: 15000 });

  const tour = await page.evaluate(() => {
    const overlay = document.getElementById("sao-tour-overlay");
    return {
      totalSteps: overlay.steps.length,
      selectors: overlay.steps.map((entry) => String(entry.selector || ""))
    };
  });
  assert.equal(tour.totalSteps, 5, "the hub walkthrough is back to five steps");
  assert.equal(
    tour.selectors.some((selector) => selector.includes("argo")),
    false,
    "the hub walkthrough no longer points at an Argo launcher"
  );

  for (let index = 0; index < 4; index += 1) {
    await page.locator(".sao-tour-actions button").nth(2).click();
    await page.waitForTimeout(350);
  }
  const step = await page.evaluate(() => {
    const target = document.querySelector(".sao-tour-focus-target");
    return {
      stepNumber: document.getElementById("sao-tour-overlay").currentStepIndex + 1,
      targetId: target ? target.id : null,
      title: (document.querySelector(".sao-tour-title") || {}).textContent || "",
      body: (document.querySelector(".sao-tour-body") || {}).textContent || "",
      tourOpen: Boolean(document.querySelector(".sao-tour-overlay.open"))
    };
  });
  assert.equal(step.tourOpen, true, "the tour is still open on the last step");
  assert.equal(step.stepNumber, 5, "the tour ends on the fifth step");
  assert.notEqual(step.targetId, "argo-launcher", "no step highlights an Argo launcher");
  assert.ok(step.title.length > 0 && !step.title.includes("ui.walkthrough."), "the last step title is localized");
  assert.ok(step.body.length > 0 && !step.body.includes("ui.walkthrough."), "the last step body is localized");

  /* Finishing the tour still works normally. */
  await page.locator(".sao-tour-actions button").nth(2).click();
  await page.waitForFunction(() => !document.querySelector(".sao-tour-overlay.open"), null, { timeout: 8000 });
  assert.deepEqual(diagnostics.errors, [], "the walkthrough raises no console errors");
  assert.deepEqual(diagnostics.failedRequests, [], "the walkthrough loads every resource");
  await context.close();
}

async function run() {
  const server = await ensureStaticServer(rootUrl);
  const browser = await chromium.launch();
  try {
    await checkHub(server, browser);
    await checkMap(server, browser, AINCRAD_URL, "aincrad-map", "sao.walkthrough.maps.completed", {
      markers: true,
      storage: { "sao.dataset.aincrad": "current" }
    });
    await checkMap(server, browser, UNDERWORLD_URL, "underworld-map", "sao.walkthrough.mainui.completed", {
      markers: false,
      underworld: true,
      storage: { "sao.dataset.underworld": "current" }
    });
    await checkReducedMotion(server, browser);
    await checkBetaMode(server, browser);
    await checkWalkthrough(server, browser);
    console.log("Argo launcher/window browser checks passed.");
  } finally {
    await browser.close();
    await server.stop();
  }
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
