const assert = require("node:assert/strict");
const { chromium } = require("playwright");
const { attachDiagnostics, ensureStaticServer } = require("./harness-helpers");

const rootUrl = process.env.SAO_BASE_URL || "http://127.0.0.1:8080";
const WARNING_LOCK_SECONDS = 15;
const WALKTHROUGH_KEYS = {
  index: "sao.walkthrough.index.completed",
  maps: "sao.walkthrough.maps.completed",
  mainui: "sao.walkthrough.mainui.completed",
  characterBuild: "sao.walkthrough.characterBuild.completed"
};
/* The warning's own persistent encounter counter. Separate from the walkthrough completion keys
   above, which must keep their meaning. */
const WARNING_ENCOUNTER_KEY = "sao.warning.encounters";
const ALL_STORAGE_KEYS = [...Object.values(WALKTHROUGH_KEYS), WARNING_ENCOUNTER_KEY];

/* Feature pages start their first-visit tour on their own; only the Welcome Mat puts the
   mandatory Aincrad/beta warning in front of the tour. */
const pageTours = [
  { name: "aincrad-map", path: "/Aincrad/Map/maps.html", key: WALKTHROUGH_KEYS.maps, steps: 4 },
  {
    name: "underworld-map",
    path: "/Fractured%20Underworld/Main%20UI/mainui.html",
    key: WALKTHROUGH_KEYS.mainui,
    steps: 4
  }
];

const welcomeTour = { name: "welcome", path: "/index.html", key: WALKTHROUGH_KEYS.index, steps: 5 };

const languages = ["en", "es", "fr"];
const warningLanguageOrder = ["en", "fr", "es"];
const viewports = [
  { name: "desktop", width: 1440, height: 1000 },
  { name: "tablet", width: 1024, height: 768 },
  { name: "mobile", width: 390, height: 844 }
];
const smallViewport = { name: "small", width: 380, height: 620 };

function inViewport(rect, width, height) {
  return rect && rect.left >= 0 && rect.top >= 0 && rect.right <= width && rect.bottom <= height;
}

async function newPage(browser, viewport) {
  const context = await browser.newContext({
    viewport: viewport ? { width: viewport.width, height: viewport.height } : undefined
  });
  const page = await context.newPage();
  return { context, page, ...attachDiagnostics(page) };
}

async function openWelcomeMat(browser, viewport, seedWalkthroughKey) {
  const session = await newPage(browser, viewport);
  if (seedWalkthroughKey) {
    await session.context.addInitScript((key) => {
      window.localStorage.setItem(key, "1");
    }, seedWalkthroughKey);
  }
  await session.page.goto(`${rootUrl}${welcomeTour.path}`, { waitUntil: "load" });
  await session.page.waitForFunction(() => Boolean(document.querySelector(".sao-warning-overlay")), null, {
    timeout: 8000
  });
  session.warningAt = Date.now();
  return session;
}

/* Waits for Okay to become enabled and reports how long the lock actually held. */
async function waitForOkayEnabled(page, timeout = 30000) {
  const startedAt = Date.now();
  await page.waitForFunction(
    () => {
      const okay = document.querySelector(".sao-warning-okay");
      return Boolean(okay) && !okay.disabled;
    },
    null,
    { timeout }
  );
  return Date.now() - startedAt;
}

/* The tour scrolls its target into view with `behavior: "smooth"`, so the focus rect keeps
   moving for a few frames. Poll until it has been stable for a few consecutive samples
   instead of guessing a fixed delay. */
async function waitForTourSettled(page, timeout = 5000) {
  await page.waitForFunction(
    () => {
      const target = document.querySelector(".sao-tour-focus-target");
      if (!target) return false;
      const rect = target.getBoundingClientRect();
      const signature = [rect.left, rect.top, rect.right, rect.bottom].map((value) => Math.round(value)).join(",");
      const state =
        window.__tourSettleState || (window.__tourSettleState = { signature: null, hits: 0, startedAt: Date.now() });
      if (state.signature === signature) state.hits += 1;
      else {
        state.signature = signature;
        state.hits = 1;
      }
      return state.hits >= 3 && Date.now() - state.startedAt > 400;
    },
    null,
    { timeout, polling: 100 }
  );
}

/* Reads the warning's live state without reimplementing any of its logic. */
async function readWarning(page, storageKeys) {
  return page.evaluate((keys) => {
    const overlay = document.querySelector(".sao-warning-overlay");
    const okay = document.querySelector(".sao-warning-okay");
    const options = [...document.querySelectorAll(".sao-warning-language-options button[data-language]")];
    const body = document.querySelector(".sao-warning-body");
    const panel = document.querySelector(".sao-warning-panel");
    const bodyStyles = body ? getComputedStyle(body) : null;
    const labelMatch = ((okay && okay.textContent) || "").match(/(\d+)/);
    return {
      overlayPresent: Boolean(overlay),
      locked: document.documentElement.classList.contains("sao-warning-locked"),
      documentOverflow: getComputedStyle(document.documentElement).overflow,
      okayPresent: Boolean(okay),
      okayDisabled: okay ? okay.disabled : null,
      okayLabel: okay ? okay.textContent.trim() : null,
      okayCountdownSeconds: labelMatch ? Number(labelMatch[1]) : null,
      okayRect: okay ? okay.getBoundingClientRect().toJSON() : null,
      languages: options.map((button) => button.dataset.language),
      pressedLanguages: options
        .filter((button) => button.getAttribute("aria-pressed") === "true")
        .map((button) => button.dataset.language),
      title: (document.querySelector(".sao-warning-title") || {}).textContent || null,
      bodyText: (document.querySelector(".sao-warning-body") || {}).textContent || null,
      bodyScrollable: body ? body.scrollHeight > body.clientHeight : null,
      bodyOverflowY: bodyStyles ? bodyStyles.overflowY : null,
      languageRects: options.map((button) => {
        const rect = button.getBoundingClientRect();
        return {
          language: button.dataset.language,
          left: rect.left,
          top: rect.top,
          right: rect.right,
          bottom: rect.bottom
        };
      }),
      panelRect: panel ? panel.getBoundingClientRect().toJSON() : null,
      activeElementLanguage:
        document.activeElement && document.activeElement.dataset
          ? document.activeElement.dataset.language || null
          : null,
      tourOpen: Boolean(document.querySelector(".sao-tour-overlay.open")),
      encounterCount: window.localStorage.getItem("sao.warning.encounters"),
      okayMode: okay ? okay.dataset.mode || null : null,
      hint: (() => {
        const hintEl = document.querySelector(".sao-warning-hint");
        if (!hintEl) return null;
        const hintText = hintEl.querySelector(".sao-warning-hint-text");
        const arrowEl = hintEl.querySelector(".sao-warning-hint-arrow");
        const rectOf = (element) => {
          if (!element) return null;
          const rect = element.getBoundingClientRect();
          return { left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom };
        };
        return {
          hidden: hintEl.hidden === true || getComputedStyle(hintEl).display === "none",
          side: hintEl.dataset.side || null,
          text: hintText ? hintText.textContent.trim() : null,
          rect: rectOf(hintEl),
          arrowRect: rectOf(arrowEl),
          // The hint must never be a descendant of the panel (it sits outside it).
          insidePanel: Boolean(document.querySelector(".sao-warning-panel .sao-warning-hint"))
        };
      })(),
      languageTextAligns: options.map((button) => getComputedStyle(button).textAlign),
      languageOverflows: options.map((button) => button.scrollWidth > button.clientWidth + 1),
      storage: Object.fromEntries(keys.map((key) => [key, window.localStorage.getItem(key)]))
    };
  }, storageKeys);
}

/* ------------------------------------------------------------------ *
 * 1. Fresh visitor: the warning gates the first-visit walkthrough.
 * ------------------------------------------------------------------ */
async function verifyFreshVisitor(browser) {
  const results = [];
  for (const viewport of viewports) {
    for (const language of languages) {
      const label = `${language}/${viewport.name}`;
      const session = await openWelcomeMat(browser, viewport);
      const { page, errors, failedRequests } = session;
      const storageKeys = ALL_STORAGE_KEYS;
      await page.evaluate((nextLanguage) => window.SAOI18n.setLanguage(nextLanguage), language);
      await page.waitForTimeout(150);

      const initial = await readWarning(page, storageKeys);
      assert.equal(initial.overlayPresent, true, `${label}: the mandatory warning is shown`);
      assert.equal(initial.okayPresent, true, `${label}: the Okay button exists`);
      assert.equal(initial.okayDisabled, true, `${label}: Okay starts disabled`);
      assert.equal(initial.okayMode, "okay", `${label}: the first encounter uses the Okay flow`);
      assert.equal(initial.encounterCount, "1", `${label}: the first presentation is counted once`);
      assert.equal(
        Boolean(initial.hint) && initial.hint.hidden === false,
        true,
        `${label}: the explainer is visible while the 15s wait still applies`
      );
      assert.equal(
        Boolean(initial.hint) && initial.hint.insidePanel === false,
        true,
        `${label}: the explainer sits outside the warning panel`
      );
      assert.equal(
        Boolean(initial.hint) && typeof initial.hint.text === "string" && initial.hint.text.length > 0,
        true,
        `${label}: the explainer has player-facing text`
      );
      assert.equal(initial.okayCountdownSeconds !== null, true, `${label}: the Okay button shows a countdown`);
      assert.equal(
        initial.okayCountdownSeconds >= WARNING_LOCK_SECONDS - 1,
        true,
        `${label}: the countdown starts at ${WARNING_LOCK_SECONDS} (saw ${initial.okayCountdownSeconds})`
      );
      assert.equal(
        initial.okayCountdownSeconds <= WARNING_LOCK_SECONDS,
        true,
        `${label}: the countdown never starts above ${WARNING_LOCK_SECONDS} (saw ${initial.okayCountdownSeconds})`
      );
      assert.equal(initial.locked, true, `${label}: the document is marked as scroll-locked`);
      assert.equal(initial.documentOverflow, "hidden", `${label}: page scrolling is actually locked`);
      assert.equal(initial.tourOpen, false, `${label}: the walkthrough is not open underneath the warning`);
      assert.equal(
        initial.storage[WALKTHROUGH_KEYS.index],
        null,
        `${label}: opening the warning writes no walkthrough storage`
      );
      assert.equal(
        initial.storage[WALKTHROUGH_KEYS.maps],
        null,
        `${label}: the warning leaves other walkthrough keys alone`
      );
      assert.equal(
        initial.storage[WALKTHROUGH_KEYS.mainui],
        null,
        `${label}: the warning leaves other walkthrough keys alone`
      );
      assert.equal(
        initial.storage[WALKTHROUGH_KEYS.characterBuild],
        null,
        `${label}: the warning leaves other walkthrough keys alone`
      );

      await page.keyboard.press("Escape");
      await page.waitForTimeout(200);
      assert.equal(
        await page.evaluate(() => Boolean(document.querySelector(".sao-warning-overlay"))),
        true,
        `${label}: Escape cannot dismiss the warning`
      );

      await page.evaluate(() => {
        const shade = document.querySelector(".sao-warning-shade");
        if (shade) shade.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      });
      await page.waitForTimeout(200);
      assert.equal(
        await page.evaluate(() => Boolean(document.querySelector(".sao-warning-overlay"))),
        true,
        `${label}: a backdrop click cannot dismiss the warning`
      );

      const backgroundBlocked = await page.evaluate(() => {
        const background = document.getElementById("ggoButton");
        if (!background) return null;
        const rect = background.getBoundingClientRect();
        const topMost = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
        return topMost !== background;
      });
      if (backgroundBlocked !== null) {
        assert.equal(backgroundBlocked, true, `${label}: background controls are blocked while the warning is open`);
      }

      /* The full countdown walk is measured once; the other combinations keep the gating
         invariants above, which keeps the suite fast without weakening the contract. */
      if (!(language === "en" && viewport.name === "desktop")) {
        assert.deepEqual(errors, [], `${label}: browser errors while the warning is open`);
        assert.deepEqual(failedRequests, [], `${label}: failed requests while the warning is open`);
        results.push({ scope: "welcome-warning-gating", language, viewport: viewport.name, status: "passed" });
        await session.context.close();
        continue;
      }

      const enabledAfterMs = await waitForOkayEnabled(page);
      assert.equal(
        enabledAfterMs < 24000,
        true,
        `${label}: the lock is released without hanging (${enabledAfterMs}ms)`
      );
      const releasedAfterMs = Date.now() - session.warningAt;
      assert.equal(
        releasedAfterMs >= (WARNING_LOCK_SECONDS - 1) * 1000,
        true,
        `${label}: Okay stayed disabled for about ${WARNING_LOCK_SECONDS}s (released ${releasedAfterMs}ms after the warning appeared)`
      );

      await page.click(".sao-warning-okay");
      await page.waitForFunction(() => !document.querySelector(".sao-warning-overlay"), null, { timeout: 5000 });
      const dismissed = await readWarning(page, storageKeys);
      assert.equal(dismissed.overlayPresent, false, `${label}: Okay closes the warning`);
      assert.equal(dismissed.locked, false, `${label}: the scroll-lock class is removed`);
      assert.notEqual(dismissed.documentOverflow, "hidden", `${label}: document scrolling is restored`);
      assert.equal(
        dismissed.storage[WALKTHROUGH_KEYS.index],
        null,
        `${label}: dismissing the warning does not mark the tour complete`
      );

      await page.waitForFunction(() => Boolean(document.querySelector(".sao-tour-overlay.open")), null, {
        timeout: 6000
      });
      assert.equal(
        (await readWarning(page, storageKeys)).tourOpen,
        true,
        `${label}: the first-visit walkthrough starts once the warning is dismissed`
      );

      assert.deepEqual(errors, [], `${label}: browser errors while handling the warning`);
      assert.deepEqual(failedRequests, [], `${label}: failed requests while handling the warning`);
      results.push({ scope: "welcome-warning", language, viewport: viewport.name, status: "passed" });
      await session.context.close();
    }
  }
  return results;
}

/* ------------------------------------------------------------------ *
 * 2. Returning visitor: warning again, no automatic walkthrough.
 * ------------------------------------------------------------------ */
async function verifyReturningVisitor(browser) {
  const results = [];
  for (const viewport of viewports) {
    const label = `returning/${viewport.name}`;
    /* A returning visitor is somebody whose completed tour is already stored. */
    const session = await openWelcomeMat(browser, viewport, WALKTHROUGH_KEYS.index);
    const { page, errors, failedRequests } = session;
    const storageKeys = ALL_STORAGE_KEYS;

    const state = await readWarning(page, storageKeys);
    assert.equal(state.overlayPresent, true, `${label}: the warning is shown again on a later visit`);
    assert.equal(state.storage[WALKTHROUGH_KEYS.index], "1", `${label}: the completed walkthrough key is still stored`);
    assert.equal(state.okayDisabled, true, `${label}: Okay still starts disabled for returning visitors`);
    assert.equal(
      state.okayCountdownSeconds >= WARNING_LOCK_SECONDS - 1,
      true,
      `${label}: the ${WARNING_LOCK_SECONDS}s countdown restarts for returning visitors (saw ${state.okayCountdownSeconds})`
    );
    assert.equal(state.tourOpen, false, `${label}: the completed walkthrough does not reopen automatically`);

    await page.waitForTimeout(1200);
    assert.equal(
      await page.evaluate(() => Boolean(document.querySelector(".sao-tour-overlay.open"))),
      false,
      `${label}: the completed walkthrough stays closed while the warning is up`
    );

    const returnedLockMs = await waitForOkayEnabled(page);
    assert.equal(returnedLockMs < 24000, true, `${label}: the lock is released without hanging (${returnedLockMs}ms)`);
    const returnedAfterMs = Date.now() - session.warningAt;
    assert.equal(
      returnedAfterMs >= (WARNING_LOCK_SECONDS - 1) * 1000,
      true,
      `${label}: returning visitors also wait for the countdown (released ${returnedAfterMs}ms after the warning appeared)`
    );

    await page.click(".sao-warning-okay");
    await page.waitForFunction(() => !document.querySelector(".sao-warning-overlay"), null, { timeout: 5000 });
    await page.waitForTimeout(900);
    assert.equal(
      await page.evaluate(() => Boolean(document.querySelector(".sao-tour-overlay.open"))),
      false,
      `${label}: the completed walkthrough stays closed after Okay`
    );
    assert.equal(
      await page.evaluate((key) => window.localStorage.getItem(key), WALKTHROUGH_KEYS.index),
      "1",
      `${label}: Okay does not disturb the completed walkthrough key`
    );
    assert.deepEqual(errors, [], `${label}: browser errors`);
    assert.deepEqual(failedRequests, [], `${label}: failed requests`);

    results.push({ scope: "returning-visitor", viewport: viewport.name, status: "passed" });
    await session.context.close();
  }
  return results;
}

/* ------------------------------------------------------------------ *
 * 3. Language switching while the warning is open.
 * ------------------------------------------------------------------ */
async function verifyWarningLanguageSwitch(browser) {
  const results = [];
  const session = await openWelcomeMat(browser, viewports[0]);
  const { page, errors, failedRequests } = session;
  const storageKeys = ALL_STORAGE_KEYS;

  const initial = await readWarning(page, storageKeys);
  assert.deepEqual(
    initial.languages,
    warningLanguageOrder,
    "warning language buttons keep the English, French, Spanish order"
  );
  assert.ok(initial.title && initial.title.length > 0, "the warning title is rendered");
  assert.ok(initial.bodyText && initial.bodyText.length > 0, "the warning body is rendered");
  /* The language labels must be centred inside their buttons (the shared picker left-aligns its
     labels for the settings list, which left the warning buttons looking off-centre). */
  initial.languageTextAligns.forEach((textAlign, index) => {
    assert.equal(textAlign, "center", `${initial.languages[index]}: the language label is centred`);
  });
  assert.deepEqual(
    initial.languageOverflows,
    initial.languageOverflows.map(() => false)
  );
  const englishTitle = initial.title;
  const englishHint = initial.hint ? initial.hint.text : null;
  assert.ok(englishHint && englishHint.length > 0, "the explainer is rendered in English");

  const titleByLanguage = {};
  const hintByLanguage = {};
  let lastSwitchAt = 0;
  for (const language of ["fr", "es", "en"]) {
    lastSwitchAt = Date.now();
    await page.click(`.sao-warning-language-options button[data-language="${language}"]`);
    await page.waitForTimeout(250);
    const state = await readWarning(page, storageKeys);
    titleByLanguage[language] = state.title;
    hintByLanguage[language] = state.hint ? state.hint.text : null;

    assert.equal(state.overlayPresent, true, `${language}: the warning stays open while switching language`);
    assert.deepEqual(state.pressedLanguages, [language], `${language}: the picked language is marked as pressed`);
    assert.equal(
      state.activeElementLanguage,
      language,
      `${language}: keyboard focus stays on the picked language button`
    );
    assert.equal(state.okayDisabled, true, `${language}: switching language restarts the countdown`);
    assert.equal(
      state.okayCountdownSeconds >= WARNING_LOCK_SECONDS - 1,
      true,
      `${language}: the countdown restarts at ${WARNING_LOCK_SECONDS} (saw ${state.okayCountdownSeconds})`
    );
    assert.equal(state.tourOpen, false, `${language}: the walkthrough stays closed while the warning is open`);
    assert.equal(
      state.storage[WALKTHROUGH_KEYS.index],
      null,
      `${language}: switching language writes no walkthrough storage`
    );
    assert.equal(
      Boolean(hintByLanguage[language]) && hintByLanguage[language].length > 0,
      true,
      `${language}: the explainer is localized`
    );
    assert.equal(
      hintByLanguage[language].includes("ui.warning."),
      false,
      `${language}: the explainer shows no raw localization key`
    );
    state.languageTextAligns.forEach((textAlign, index) => {
      assert.equal(textAlign, "center", `${language}: ${state.languages[index]} label stays centred after switching`);
    });
  }

  assert.notEqual(titleByLanguage.fr, englishTitle, "French changes the visible warning text");
  assert.notEqual(titleByLanguage.es, englishTitle, "Spanish changes the visible warning text");
  assert.notEqual(titleByLanguage.fr, titleByLanguage.es, "French and Spanish warning text differ");
  assert.equal(titleByLanguage.en, englishTitle, "switching back to English restores the original text");
  assert.notEqual(hintByLanguage.fr, englishHint, "French localizes the explainer");
  assert.notEqual(hintByLanguage.es, englishHint, "Spanish localizes the explainer");
  assert.notEqual(hintByLanguage.fr, hintByLanguage.es, "French and Spanish explainers differ");

  /* Each switch restarts the timer, so the final switch is the one that must be waited out. */
  await waitForOkayEnabled(page);
  const restartAfterMs = Date.now() - lastSwitchAt;
  assert.equal(
    restartAfterMs >= (WARNING_LOCK_SECONDS - 1) * 1000,
    true,
    `switching language restarts the full ${WARNING_LOCK_SECONDS}s lock (released ${restartAfterMs}ms after the last switch)`
  );
  assert.equal(restartAfterMs < 24000, true, `the restarted lock is released without hanging (${restartAfterMs}ms)`);
  await page.click(".sao-warning-okay");
  await page.waitForFunction(() => !document.querySelector(".sao-warning-overlay"), null, { timeout: 5000 });

  assert.deepEqual(errors, [], "browser errors while switching the warning language");
  assert.deepEqual(failedRequests, [], "failed requests while switching the warning language");
  results.push({ scope: "warning-language-switch", status: "passed" });
  await session.context.close();
  return results;
}

/* ------------------------------------------------------------------ *
 * 4. Small viewport usability.
 * ------------------------------------------------------------------ */
async function verifyWarningSmallViewport(browser) {
  const label = `${smallViewport.width}x${smallViewport.height}`;
  const session = await openWelcomeMat(browser, smallViewport);
  const { page, errors, failedRequests } = session;
  const state = await readWarning(page, ALL_STORAGE_KEYS);

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth
  );
  assert.equal(overflow, false, `${label}: the warning introduces no horizontal page overflow`);

  assert.equal(state.overlayPresent, true, `${label}: the warning is shown`);
  assert.equal(
    inViewport(state.panelRect, smallViewport.width, smallViewport.height),
    true,
    `${label}: the warning panel fits inside the viewport`
  );
  /* The explainer must stay on-screen without covering the panel or overflowing sideways. */
  assert.equal(Boolean(state.hint) && state.hint.hidden === false, true, `${label}: the explainer is visible`);
  assert.equal(
    inViewport(state.hint.rect, smallViewport.width, smallViewport.height),
    true,
    `${label}: the explainer stays inside the viewport`
  );
  assert.equal(
    inViewport(state.hint.arrowRect, smallViewport.width, smallViewport.height),
    true,
    `${label}: the explainer arrow stays inside the viewport`
  );
  assert.equal(
    state.hint.rect.left >= state.panelRect.right - 2 || state.hint.rect.top >= state.panelRect.bottom - 2,
    true,
    `${label}: the explainer sits beside or below the panel, never on top of it`
  );
  assert.equal(state.hint.insidePanel, false, `${label}: the explainer is outside the panel`);
  assert.equal(
    ["right", "below"].includes(state.hint.side),
    true,
    `${label}: the explainer arrow has a resolved direction (${state.hint.side})`
  );
  assert.equal(
    inViewport(state.okayRect, smallViewport.width, smallViewport.height),
    true,
    `${label}: the Okay button stays inside the viewport`
  );
  assert.equal(state.languageRects.length, warningLanguageOrder.length, `${label}: every language button is present`);
  state.languageRects.forEach((rect) => {
    assert.equal(
      inViewport(rect, smallViewport.width, smallViewport.height),
      true,
      `${label}: the ${rect.language} language button stays inside the viewport`
    );
  });

  if (state.bodyScrollable) {
    assert.equal(
      ["auto", "scroll"].includes(state.bodyOverflowY),
      true,
      `${label}: an overflowing warning body can scroll internally (overflow-y: ${state.bodyOverflowY})`
    );
  }

  const enabledAfterMs = await waitForOkayEnabled(page);
  const releasedAfterMs = Date.now() - session.warningAt;
  assert.equal(
    enabledAfterMs < 24000,
    true,
    `${label}: the lock still releases on a small viewport (${enabledAfterMs}ms)`
  );
  assert.equal(
    releasedAfterMs >= (WARNING_LOCK_SECONDS - 1) * 1000,
    true,
    `${label}: the full countdown applies on a small viewport (released ${releasedAfterMs}ms after the warning appeared)`
  );
  await page.click(".sao-warning-okay");
  await page.waitForFunction(() => Boolean(document.querySelector(".sao-tour-overlay.open")), null, { timeout: 6000 });

  const tourCard = await page.evaluate(() => {
    const card = document.querySelector(".sao-tour-card");
    const rect = card ? card.getBoundingClientRect() : null;
    return {
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      rect: rect ? { left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom } : null
    };
  });
  assert.equal(
    inViewport(tourCard.rect, smallViewport.width, smallViewport.height),
    true,
    `${label}: the walkthrough card stays inside the viewport`
  );
  assert.equal(tourCard.overflow, false, `${label}: the walkthrough introduces no horizontal overflow`);
  assert.deepEqual(errors, [], `${label}: browser errors`);
  assert.deepEqual(failedRequests, [], `${label}: failed requests`);

  await session.context.close();
  return [{ scope: "warning-small-viewport", viewport: smallViewport.name, status: "passed" }];
}

/* ------------------------------------------------------------------ *
 * 4b. Encounter counter: Okay + 15s for the first three displays, Skip afterwards.
 * ------------------------------------------------------------------ */
async function verifyWarningEncounterThreshold(browser) {
  const results = [];
  const viewport = viewports[0];
  const label = `encounters/${viewport.name}`;
  const session = await newPage(browser, viewport);
  const { page, errors, failedRequests } = session;
  const storageKeys = ALL_STORAGE_KEYS;

  const setCount = (value) =>
    page.evaluate(({ key, next }) => window.SAOStorage.setItem(key, String(next)), {
      key: WARNING_ENCOUNTER_KEY,
      next: value
    });
  const reloadWarning = async () => {
    await page.reload({ waitUntil: "load" });
    await page.waitForFunction(() => Boolean(document.querySelector(".sao-warning-overlay")), null, { timeout: 8000 });
    return Date.now();
  };
  const dismissWithOkay = async () => {
    await page.click(".sao-warning-okay");
    await page.waitForFunction(() => !document.querySelector(".sao-warning-overlay"), null, { timeout: 5000 });
  };

  await page.goto(`${rootUrl}${welcomeTour.path}`, { waitUntil: "load" });
  await page.waitForFunction(() => Boolean(document.querySelector(".sao-warning-overlay")), null, { timeout: 8000 });
  /* Deterministic baseline: reset the counter, then reload so the next display is #1. */
  await setCount(0);

  /* ---- Display #1: full 15-second Okay flow plus the explainer ---- */
  let appearedAt = await reloadWarning();
  let state = await readWarning(page, storageKeys);
  assert.equal(state.encounterCount, "1", `${label}: the first display is counted`);
  assert.equal(state.okayMode, "okay", `${label}: #1 uses the Okay flow`);
  assert.equal(state.okayDisabled, true, `${label}: #1 starts with Okay disabled`);
  assert.equal(
    state.okayCountdownSeconds >= WARNING_LOCK_SECONDS - 1,
    true,
    `${label}: #1 shows the ${WARNING_LOCK_SECONDS}s countdown`
  );
  assert.equal(Boolean(state.hint) && state.hint.hidden === false, true, `${label}: #1 shows the explainer`);
  const firstLockMs = await waitForOkayEnabled(page);
  assert.equal(firstLockMs < 24000, true, `${label}: #1 lock releases without hanging (${firstLockMs}ms)`);
  assert.equal(
    Date.now() - appearedAt >= (WARNING_LOCK_SECONDS - 1) * 1000,
    true,
    `${label}: #1 enforced the full wait`
  );
  await dismissWithOkay();

  /* ---- Displays #2 and #3 keep the identical Okay flow ---- */
  for (const expected of [2, 3]) {
    appearedAt = await reloadWarning();
    state = await readWarning(page, storageKeys);
    assert.equal(state.encounterCount, String(expected), `${label}: display #${expected} is counted`);
    assert.equal(state.okayMode, "okay", `${label}: #${expected} still uses Okay`);
    assert.equal(state.okayDisabled, true, `${label}: #${expected} starts with Okay disabled`);
    assert.equal(
      state.okayCountdownSeconds >= WARNING_LOCK_SECONDS - 1,
      true,
      `${label}: #${expected} keeps the ${WARNING_LOCK_SECONDS}s countdown`
    );
    assert.equal(
      Boolean(state.hint) && state.hint.hidden === false,
      true,
      `${label}: #${expected} shows the explainer`
    );
    await waitForOkayEnabled(page);
    assert.equal(
      Date.now() - appearedAt >= (WARNING_LOCK_SECONDS - 1) * 1000,
      true,
      `${label}: #${expected} enforced the full wait`
    );
    await dismissWithOkay();
  }

  /* ---- Display #4: Skip replaces Okay and is immediately usable ---- */
  await reloadWarning();
  const fourth = await readWarning(page, storageKeys);
  assert.equal(fourth.encounterCount, "4", `${label}: the fourth display is counted`);
  assert.equal(fourth.okayMode, "skip", `${label}: #4 switches to Skip`);
  assert.equal(fourth.okayLabel, "Skip", `${label}: #4 shows the Skip label`);
  assert.equal(fourth.okayDisabled, false, `${label}: #4 Skip is enabled immediately`);
  assert.equal(fourth.okayCountdownSeconds, null, `${label}: #4 carries no countdown`);
  assert.equal(Boolean(fourth.hint) && fourth.hint.hidden === true, true, `${label}: #4 hides the explainer`);
  await page.waitForTimeout(600);
  const stillSkip = await readWarning(page, storageKeys);
  assert.equal(stillSkip.okayMode, "skip", `${label}: #4 stays in Skip mode`);
  assert.equal(stillSkip.okayDisabled, false, `${label}: #4 Skip never becomes disabled`);
  assert.equal(stillSkip.encounterCount, "4", `${label}: the counter persists without a reload`);
  /* ---- Skip reuses the Okay dismissal path: close, restore scrolling, then the tour ---- */
  await page.click(".sao-warning-okay");
  await page.waitForFunction(() => !document.querySelector(".sao-warning-overlay"), null, { timeout: 5000 });
  const dismissed = await readWarning(page, storageKeys);
  assert.equal(dismissed.overlayPresent, false, `${label}: Skip closes the warning`);
  assert.equal(dismissed.locked, false, `${label}: Skip removes the scroll lock`);
  assert.notEqual(dismissed.documentOverflow, "hidden", `${label}: scrolling is restored after Skip`);
  assert.equal(dismissed.encounterCount, "4", `${label}: dismissing does not change the count`);
  await page.waitForFunction(() => Boolean(document.querySelector(".sao-tour-overlay.open")), null, { timeout: 6000 });
  assert.equal((await readWarning(page, storageKeys)).tourOpen, true, `${label}: the tour still follows the warning`);

  /* ---- Display #5 is Skip too (every display after the third) ---- */
  await reloadWarning();
  const fifth = await readWarning(page, storageKeys);
  assert.equal(fifth.encounterCount, "5", `${label}: the fifth display is counted`);
  assert.equal(fifth.okayMode, "skip", `${label}: the fifth display is Skip`);
  assert.equal(fifth.okayDisabled, false, `${label}: the fifth Skip is enabled immediately`);
  assert.equal(Boolean(fifth.hint) && fifth.hint.hidden === true, true, `${label}: #5 keeps the explainer hidden`);

  assert.deepEqual(errors, [], `${label}: browser errors`);
  assert.deepEqual(failedRequests, [], `${label}: failed requests`);
  results.push({ scope: "warning-encounter-threshold", viewport: viewport.name, status: "passed" });
  await session.context.close();
  return results;
}
/* ------------------------------------------------------------------ *
 * 5. Feature pages keep their own first-visit tours (no mandatory warning).
 * ------------------------------------------------------------------ */
async function verifyPageTours(browser) {
  const results = [];
  for (const viewport of viewports) {
    for (const language of languages) {
      for (const tour of pageTours) {
        const label = `${tour.name}/${language}/${viewport.name}`;
        const session = await newPage(browser, viewport);
        const { page, errors, failedRequests } = session;
        await page.goto(`${rootUrl}${tour.path}`, { waitUntil: "load" });
        await page.evaluate(
          ({ nextLanguage, storageKey }) => {
            window.SAOI18n.setLanguage(nextLanguage);
            window.SAOStorage.removeItem(storageKey);
          },
          { nextLanguage: language, storageKey: tour.key }
        );
        await page.reload({ waitUntil: "load" });
        await page.waitForFunction(() => Boolean(document.querySelector(".sao-tour-overlay.open")), null, {
          timeout: 8000
        });
        await page.evaluate(() => {
          window.__tourSettleState = null;
        });

        for (let stepIndex = 0; stepIndex < tour.steps; stepIndex += 1) {
          await waitForTourSettled(page);
          const state = await page.evaluate(() => {
            const target = document.querySelector(".sao-tour-focus-target");
            const card = document.querySelector(".sao-tour-card");
            const cardRect = card && card.getBoundingClientRect();
            const targetRect = target && target.getBoundingClientRect();
            const text = [
              ...document.querySelectorAll(".sao-tour-step, .sao-tour-title, .sao-tour-body, .sao-tour-actions button")
            ]
              .map((element) => element.textContent || "")
              .join(" ");
            return {
              open: document.querySelector(".sao-tour-overlay.open") !== null,
              target: Boolean(target),
              targetRect: targetRect && {
                left: targetRect.left,
                top: targetRect.top,
                right: targetRect.right,
                bottom: targetRect.bottom
              },
              cardRect: cardRect && {
                left: cardRect.left,
                top: cardRect.top,
                right: cardRect.right,
                bottom: cardRect.bottom
              },
              text,
              overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth
            };
          });
          assert.equal(state.open, true, `${label}: tour is open at step ${stepIndex + 1}`);
          assert.equal(state.target, true, `${label}: target missing at step ${stepIndex + 1}`);
          assert.equal(
            inViewport(state.targetRect, viewport.width, viewport.height),
            true,
            `${label}: target outside viewport at step ${stepIndex + 1}`
          );
          assert.equal(
            inViewport(state.cardRect, viewport.width, viewport.height),
            true,
            `${label}: card outside viewport at step ${stepIndex + 1}`
          );
          assert.equal(state.overflow, false, `${label}: horizontal overflow at step ${stepIndex + 1}`);
          assert.equal(state.text.includes("page."), false, `${label}: raw localization key at step ${stepIndex + 1}`);
          if (stepIndex < tour.steps - 1) {
            await page.locator(".sao-tour-actions button").nth(2).click({ force: true });
            await page.evaluate(() => {
              window.__tourSettleState = null;
            });
          }
        }

        await page.locator(".sao-tour-actions button").nth(2).click({ force: true });
        await page.waitForTimeout(250);
        assert.equal(
          await page.evaluate((key) => window.SAOStorage.getItem(key), tour.key),
          "1",
          `${label}: finishing the tour persists`
        );
        assert.deepEqual(errors, [], `${label}: browser errors`);
        assert.deepEqual(failedRequests, [], `${label}: failed requests`);
        results.push({ scope: "page-tour", tour: tour.name, language, viewport: viewport.name, status: "passed" });
        await session.context.close();
      }
    }
  }
  return results;
}

module.exports = {
  rootUrl,
  WARNING_LOCK_SECONDS,
  WALKTHROUGH_KEYS,
  pageTours,
  welcomeTour,
  languages,
  warningLanguageOrder,
  viewports,
  smallViewport,
  inViewport,
  attachDiagnostics,
  newPage,
  openWelcomeMat,
  waitForOkayEnabled,
  readWarning,
  verifyFreshVisitor,
  verifyReturningVisitor,
  verifyWarningLanguageSwitch,
  verifyWarningSmallViewport,
  verifyWarningEncounterThreshold,
  verifyPageTours
};

(async () => {
  await ensureStaticServer();
  const browser = await chromium.launch({ headless: true });
  const results = [];
  try {
    results.push(...(await verifyFreshVisitor(browser)));
    results.push(...(await verifyReturningVisitor(browser)));
    results.push(...(await verifyWarningLanguageSwitch(browser)));
    results.push(...(await verifyWarningSmallViewport(browser)));
    results.push(...(await verifyWarningEncounterThreshold(browser)));
    results.push(...(await verifyPageTours(browser)));
  } finally {
    await browser.close();
  }
  console.log(JSON.stringify({ results, status: "passed" }, null, 2));
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
