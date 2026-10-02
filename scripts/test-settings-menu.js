/* Settings-menu regression tests.
 *
 * Covers the shared language picker mounted by shared/sao-i18n.js on every page:
 *  - the menu starts closed and only the trigger opens it;
 *  - choosing a language keeps the menu open and keeps keyboard focus on that option
 *    (the option row is re-translated, which used to detach the clicked button mid-dispatch
 *    and make the outside-click guard close the menu the reader had just used);
 *  - an outside click, Escape and the close button still close it;
 *  - the choice is persisted and survives a reload.
 *
 * The hub shows the blocking Welcome Mat warning on every load, and its Okay button is gated by
 * a read-lock countdown (15 s) so the notice cannot be clicked through blind. Each session waits
 * for that real countdown to elapse, exactly like a reader has to.
 */
const assert = require("node:assert/strict");
const { chromium } = require("playwright");
const { attachDiagnostics, ensureStaticServer } = require("./harness-helpers");

const rootUrl = process.env.SAO_BASE_URL || "http://127.0.0.1:8080";
const hubUrl = `${rootUrl}/index.html`;
const WARNING_LOCK_TIMEOUT_MS = 25000;

async function openHub(browser, options) {
  const config = options || {};
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  await context.addInitScript(
    (storage) => {
      Object.keys(storage).forEach((key) => window.localStorage.setItem(key, storage[key]));
    },
    {
      "sao.walkthrough.index.completed": "1",
      "sao.walkthrough.maps.completed": "1",
      "sao.walkthrough.mainui.completed": "1",
      "sao.walkthrough.characterBuild.completed": "1",
      ...(config.language ? { "sao.global.settings": JSON.stringify({ language: config.language }) } : {})
    }
  );
  const page = await context.newPage();
  const diagnostics = attachDiagnostics(page);
  await page.goto(hubUrl, { waitUntil: "load" });
  await page.waitForTimeout(400);
  const okay = page.locator(".sao-warning-okay");
  if (await okay.count()) {
    await page.waitForFunction(
      () => {
        const button = document.querySelector(".sao-warning-okay");
        return button ? !button.disabled : true;
      },
      null,
      { timeout: WARNING_LOCK_TIMEOUT_MS }
    );
    await okay.click();
    await page.waitForTimeout(250);
  }
  /* The shared settings menu is mounted once the page is interactive; the blocking Welcome Mat
     warning is dismissed first so the trigger is reachable. */
  await page.waitForFunction(() => Boolean(document.querySelector(".sao-settings-trigger")), null, { timeout: 8000 });
  return { context, page, ...diagnostics };
}

function readMenu(page) {
  return page.evaluate(() => {
    const menu = document.getElementById("sao-settings-menu");
    const active = document.activeElement;
    return {
      open: menu.classList.contains("open"),
      ariaHidden: menu.getAttribute("aria-hidden"),
      pointerEvents: getComputedStyle(menu).pointerEvents,
      focusedLanguage: active && active.dataset ? active.dataset.language || null : null,
      pressed: Array.from(document.querySelectorAll("#sao-settings-menu button[data-language]"))
        .filter((button) => button.getAttribute("aria-pressed") === "true")
        .map((button) => button.dataset.language)
    };
  });
}
/* The Settings menu's testing control must clear ONLY the warning encounter counter, so the next
   warning behaves like a first visit while walkthrough progress, settings and language survive. */
async function verifyWarningReset(browser) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();
  const diagnostics = attachDiagnostics(page);
  const openWarning = () =>
    page.waitForFunction(() => Boolean(document.querySelector(".sao-warning-overlay")), null, { timeout: 8000 });
  const dismissWarning = async () => {
    await page.click(".sao-warning-okay");
    await page.waitForFunction(() => !document.querySelector(".sao-warning-overlay"), null, { timeout: 5000 });
  };
  const readResetState = () =>
    page.evaluate(() => {
      const button = document.querySelector(".sao-settings-testing-action");
      const toast = document.getElementById("status-toast");
      const okay = document.querySelector(".sao-warning-okay");
      const hint = document.querySelector(".sao-warning-hint");
      const actionButtons = [...document.querySelectorAll(".sao-settings-actions .sao-settings-action-button")];
      return {
        encounters: window.SAOStorage.getItem("sao.warning.encounters"),
        walkthroughIndex: window.SAOStorage.getItem("sao.walkthrough.index.completed"),
        walkthroughMaps: window.SAOStorage.getItem("sao.walkthrough.maps.completed"),
        settings: window.SAOStorage.getItem("sao.global.settings"),
        language: document.documentElement.lang,
        buttonLabel: button ? button.textContent.trim() : null,
        buttonHint: button && button.nextElementSibling ? button.nextElementSibling.textContent.trim() : null,
        buttonIndex: button ? actionButtons.indexOf(button) : -1,
        actionButtonCount: actionButtons.length,
        toast: toast ? toast.textContent.trim() : null,
        warning: okay
          ? { mode: okay.dataset.mode || null, label: okay.textContent.trim(), disabled: okay.disabled }
          : null,
        hintHidden: hint ? hint.hidden : null
      };
    });

  try {
    /* Reach the Skip threshold, then reset. The seeds are written once and the page is reloaded so
       the counter is only ever advanced by the page itself. */
    await page.goto(hubUrl, { waitUntil: "load" });
    await openWarning();
    await page.evaluate(() => {
      window.SAOStorage.setItem("sao.walkthrough.index.completed", "1");
      window.SAOStorage.setItem("sao.walkthrough.maps.completed", "1");
      window.SAOStorage.setItem("sao.warning.encounters", "5");
      window.SAOStorage.setItem("sao.global.settings", JSON.stringify({ language: "fr" }));
    });
    await page.reload({ waitUntil: "load" });
    await openWarning();
    const skipState = await readResetState();
    assert.equal(skipState.warning.mode, "skip", "a seeded counter past the threshold shows Skip");
    assert.equal(skipState.warning.disabled, false, "Skip is immediately usable");
    assert.equal(skipState.hintHidden, true, "Skip mode hides the explainer");
    await dismissWarning();
    await page.locator(".sao-settings-trigger").click();
    await page.waitForTimeout(250);
    const beforeReset = await readResetState();
    assert.equal(beforeReset.actionButtonCount, 2, "the testing control sits beside the walkthrough reset button");
    assert.equal(beforeReset.buttonIndex, 1, "the warning reset is the second action button");
    assert.ok(beforeReset.buttonLabel && beforeReset.buttonLabel.length > 0, "the control is labelled");
    assert.equal(beforeReset.buttonLabel.includes("ui.settings."), false, "the label is not a raw key");
    assert.ok(beforeReset.buttonHint && beforeReset.buttonHint.length > 0, "the control has a hint");
    assert.equal(beforeReset.buttonHint.includes("ui.settings."), false, "the hint is not a raw key");
    assert.equal(beforeReset.encounters, "6", "the warning counter was advanced by the page");

    await page.locator(".sao-settings-testing-action").click();
    await page.waitForTimeout(250);
    const afterReset = await readResetState();
    assert.equal(afterReset.encounters, null, "the warning reset clears only the encounter counter");
    assert.equal(afterReset.walkthroughIndex, "1", "walkthrough progress survives the warning reset");
    assert.equal(afterReset.walkthroughMaps, "1", "other walkthrough keys survive the warning reset");
    assert.equal(JSON.parse(afterReset.settings).language, "fr", "settings and language survive the warning reset");
    assert.ok(afterReset.toast && afterReset.toast.length > 0, "the reset confirms through the existing toast");
    assert.equal(afterReset.toast.includes("ui.settings."), false, "the toast is localized, not a raw key");

    await page.reload({ waitUntil: "load" });
    await openWarning();
    const nextWarning = await readResetState();
    assert.equal(nextWarning.encounters, "1", "the next warning counts as the first encounter");
    assert.equal(nextWarning.warning.mode, "okay", "the next warning uses the Okay flow, not Skip");
    assert.equal(nextWarning.warning.disabled, true, "Okay starts disabled again");
    assert.match(nextWarning.warning.label, /\d/, "the 15s countdown is shown again");
    assert.equal(nextWarning.hintHidden, false, "the explainer is shown again");

    /* Localization: the control re-labels for every supported language. Re-enter Skip mode first
       so the blocking warning can be dismissed immediately instead of waiting out the countdown. */
    await page.evaluate(() => window.SAOStorage.setItem("sao.warning.encounters", "5"));
    await page.reload({ waitUntil: "load" });
    await openWarning();
    await dismissWarning();
    await page.locator(".sao-settings-trigger").click();
    await page.waitForTimeout(250);
    const frenchLabel = (await readResetState()).buttonLabel;
    await page.locator('#sao-settings-menu button[data-language="es"]').click();
    await page.waitForTimeout(250);
    const spanish = await readResetState();
    assert.equal(spanish.language, "es", "the menu switched to Spanish");
    assert.notEqual(spanish.buttonLabel, frenchLabel, "the control is localized per language");
    assert.equal(spanish.buttonLabel.includes("ui.settings."), false, "the Spanish label is not a raw key");
    await page.locator('#sao-settings-menu button[data-language="en"]').click();
    await page.waitForTimeout(250);
    const english = await readResetState();
    assert.equal(english.language, "en", "the menu switched to English");
    assert.equal(english.buttonLabel, "Warning Reset", "the English control label is exact");
    assert.notEqual(english.buttonHint, spanish.buttonHint, "the hint is localized per language");

    assert.deepEqual(diagnostics.errors, [], "no console errors while using the warning reset");
    assert.deepEqual(diagnostics.failedRequests, [], "no failed requests while using the warning reset");
    return [{ scope: "settings-warning-reset", status: "passed" }];
  } finally {
    await context.close();
  }
}
(async () => {
  await ensureStaticServer();
  const browser = await chromium.launch({ headless: true });
  const results = [];
  try {
    /* --- closed by default, opened by the trigger --- */
    const session = await openHub(browser);
    const { page } = session;

    const closed = await readMenu(page);
    assert.equal(closed.open, false, "settings menu starts closed");
    assert.equal(closed.ariaHidden, "true", "closed menu is hidden from assistive tech");
    assert.equal(closed.pointerEvents, "none", "closed menu does not intercept pointer events");

    await page.locator(".sao-settings-trigger").click();
    await page.waitForTimeout(250);
    const opened = await readMenu(page);
    assert.equal(opened.open, true, "trigger opens the settings menu");
    assert.equal(opened.ariaHidden, "false", "open menu is exposed to assistive tech");
    assert.notEqual(opened.pointerEvents, "none", "open menu accepts pointer events");
    results.push({ scope: "settings-menu-open", status: "passed" });

    /* --- language switch keeps the menu open and keeps focus on the option --- */
    const languageButtons = await page.locator("#sao-settings-menu button[data-language]").count();
    assert.equal(languageButtons, 3, "the menu offers the three supported languages");

    await page.locator('#sao-settings-menu button[data-language="fr"]').click();
    await page.waitForTimeout(500);
    const afterSwitch = await readMenu(page);
    assert.equal(await page.evaluate(() => document.documentElement.lang), "fr", "language switch applies to the page");
    assert.deepEqual(afterSwitch.pressed, ["fr"], "the chosen language is marked pressed");
    assert.equal(afterSwitch.open, true, "menu stays open after choosing a language");
    assert.notEqual(afterSwitch.pointerEvents, "none", "menu keeps accepting pointer events after a switch");
    assert.equal(afterSwitch.focusedLanguage, "fr", "keyboard focus stays on the chosen language");
    results.push({ scope: "settings-language-switch", status: "passed" });

    /* --- close button and outside click both close it --- */
    await page.locator(".sao-settings-close").click();
    await page.waitForTimeout(250);
    assert.equal((await readMenu(page)).open, false, "close button closes the menu");

    await page.locator(".sao-settings-trigger").click();
    await page.waitForTimeout(250);
    assert.equal((await readMenu(page)).open, true, "trigger reopens the menu");
    await page.mouse.click(1200, 700);
    await page.waitForTimeout(250);
    assert.equal((await readMenu(page)).open, false, "outside click closes the menu");

    /* --- Escape closes it and returns focus to the trigger --- */
    await page.locator(".sao-settings-trigger").click();
    await page.waitForTimeout(250);
    await page.keyboard.press("Escape");
    await page.waitForTimeout(250);
    const afterEscape = await page.evaluate(() => ({
      open: document.getElementById("sao-settings-menu").classList.contains("open"),
      focus: document.activeElement ? document.activeElement.className : null
    }));
    assert.equal(afterEscape.open, false, "Escape closes the menu");
    assert.match(String(afterEscape.focus), /sao-settings-trigger/, "Escape returns focus to the trigger");
    results.push({ scope: "settings-menu-close", status: "passed" });

    assert.deepEqual(session.errors, [], "no console errors while using the settings menu");
    assert.deepEqual(session.failedRequests, [], "no failed requests while using the settings menu");
    await session.context.close();

    /* --- persistence across a reload (fresh context, no seeded language) --- */
    const reloadSession = await openHub(browser);
    try {
      const reloadPage = reloadSession.page;
      assert.equal(
        await reloadPage.evaluate(() => document.documentElement.lang),
        "en",
        "a fresh visitor starts in English"
      );
      await reloadPage.locator(".sao-settings-trigger").click();
      await reloadPage.waitForTimeout(250);
      await reloadPage.locator('#sao-settings-menu button[data-language="es"]').click();
      await reloadPage.waitForTimeout(500);
      assert.equal(
        await reloadPage.evaluate(() => document.documentElement.lang),
        "es",
        "language switch applies before reload"
      );
      await reloadPage.reload({ waitUntil: "load" });
      await reloadPage.waitForFunction(() => document.documentElement.lang === "es", null, { timeout: 8000 });
      assert.equal(await reloadPage.evaluate(() => document.documentElement.lang), "es", "language survives a reload");
      assert.equal(
        await reloadPage.evaluate(() => JSON.parse(window.localStorage.getItem("sao.global.settings")).language),
        "es",
        "the chosen language is persisted in storage"
      );
      assert.deepEqual(reloadSession.errors, [], "no console errors across the reload");
      assert.deepEqual(reloadSession.failedRequests, [], "no failed requests across the reload");
      results.push({ scope: "settings-language-persistence", status: "passed" });
    } finally {
      await reloadSession.context.close();
    }
    results.push(...(await verifyWarningReset(browser)));
  } finally {
    await browser.close();
  }

  console.log(JSON.stringify({ results, status: "passed" }, null, 2));
  console.log("Settings menu regression tests passed.");
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
