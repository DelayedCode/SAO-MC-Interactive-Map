/* Mandatory Welcome Mat warning (Aincrad / beta accuracy notice).

   A blocking modal that appears on every page load: it deliberately writes nothing to
   storage, so dismissing it can never "acknowledge it forever". It hands control back to
   the page once the reader presses Okay, which is how the Welcome Mat walkthrough is
   delayed so the tour can never start underneath it.

   Everything the reader sees comes from the shared localization layer: strings are
   ui.warning.* keys in shared/sao-i18n.js, the language buttons call the same
   SAOI18n.setLanguage() the settings menu uses, and the buttons reuse the existing
   .sao-language-option language-picker styling. */
(function (globalObject) {
  "use strict";

  /* Placeholder substitution is shared with the page helpers instead of being re-declared. */
  const DEFAULT_TRANSLATION =
    (globalObject.SAOPageHelpers && globalObject.SAOPageHelpers.formatMessage) || ((key) => key);

  const STYLE_ID = "sao-warning-style";
  const DEFAULT_LOCK_SECONDS = 15;
  const LOCK_TICK_MS = 500;

  const STYLE_TEXT = `
    html.sao-warning-locked {
      overflow: hidden;
      overscroll-behavior: none;
    }
    /* The overlay centres only the warning panel, so the panel's centre is the viewport centre
       regardless of the explainer's width. The explainer is positioned independently by
       positionHint() and never participates in this centring. */
    .sao-warning-overlay {
      position: fixed;
      inset: 0;
      z-index: 140;
      display: grid;
      place-items: center;
      box-sizing: border-box;
      padding: calc(18px + env(safe-area-inset-top)) 18px calc(18px + env(safe-area-inset-bottom));
    }
    /* Reserve a strip at the bottom when the explainer has to sit beneath the panel, so the
       centred panel can never overlap it. */
    .sao-warning-overlay.has-hint-below {
      padding-bottom: calc(150px + env(safe-area-inset-bottom));
    }
    .sao-warning-overlay.has-hint-below .sao-warning-panel {
      max-height: calc(100dvh - 186px - env(safe-area-inset-top) - env(safe-area-inset-bottom));
    }
    .sao-warning-shade {
      position: absolute;
      inset: 0;
      background: rgba(2, 5, 10, 0.9);
      -webkit-backdrop-filter: blur(8px);
      backdrop-filter: blur(8px);
    }
    .sao-warning-panel {
      position: relative;
      z-index: 1;
      display: flex;
      flex-direction: column;
      gap: 12px;
      width: min(720px, 100%);
      max-height: calc(100vh - 36px);
      max-height: calc(100dvh - 36px - env(safe-area-inset-top) - env(safe-area-inset-bottom));
      box-sizing: border-box;
      padding: 22px;
      border: 1px solid rgba(255, 164, 82, 0.58);
      border-top: 5px solid #ff9f43;
      border-radius: 16px;
      background: linear-gradient(180deg, rgba(38, 24, 16, 0.99), rgba(9, 13, 21, 0.99));
      box-shadow: 0 26px 80px rgba(0, 0, 0, 0.62);
      color: #f4ece2;
      outline: none;
      animation: sao-warning-in 0.2s ease;
    }
    @keyframes sao-warning-in {
      from { opacity: 0; transform: translateY(10px) scale(0.988); }
      to { opacity: 1; transform: none; }
    }
    .sao-warning-kicker {
      margin: 0;
      font-size: 0.74rem;
      font-weight: 700;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      color: #ffb765;
    }
    .sao-warning-title {
      margin: 0;
      font-size: 1.22rem;
      line-height: 1.35;
      color: #fff4e6;
    }
    .sao-warning-body {
      flex: 1 1 auto;
      min-height: 0;
      overflow-y: auto;
      overscroll-behavior: contain;
      margin: 0;
      padding-right: 6px;
      white-space: pre-line;
      font-size: 0.92rem;
      line-height: 1.6;
      color: #ded3c6;
    }
    .sao-warning-footer {
      display: flex;
      flex-wrap: wrap;
      align-items: flex-end;
      justify-content: space-between;
      gap: 12px;
      padding-top: 12px;
      border-top: 1px solid rgba(255, 164, 82, 0.22);
    }
    .sao-warning-languages {
      display: grid;
      gap: 6px;
      min-width: 0;
    }
    .sao-warning-languages-label {
      font-size: 0.72rem;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: #bda894;
    }
    .sao-warning-language-options {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 8px;
    }
    /* The warning reuses the shared .sao-language-option styling, whose labels are left-aligned
       for the settings list. Inside the warning's even grid each label must be centred instead;
       this is scoped to the warning so the settings menu keeps its own alignment. */
    .sao-warning-language-options .sao-language-option {
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
    }
    /* Explainer shown while the Okay flow still applies. It lives outside the panel (a sibling of
       it) and is positioned independently in viewport coordinates, so it never affects where the
       panel is centred. */
    .sao-warning-hint {
      position: fixed;
      top: 0;
      left: 0;
      z-index: 3;
      display: flex;
      align-items: center;
      gap: 10px;
      max-width: min(260px, calc(100vw - 36px));
      color: #f4e7d6;
      pointer-events: none;
    }
    .sao-warning-hint[hidden] {
      display: none;
    }
    .sao-warning-hint[data-side="below"] {
      flex-direction: column;
    }
    .sao-warning-hint-arrow {
      flex: 0 0 20px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
    .sao-warning-hint-arrow svg {
      width: 20px;
      height: 20px;
      color: #ffb765;
      filter: drop-shadow(0 0 4px rgba(255, 183, 101, 0.35));
    }
    /* The arrow is drawn pointing left (toward the panel); rotate it upward when the hint wraps
       beneath the panel. */
    .sao-warning-hint[data-side="below"] .sao-warning-hint-arrow svg {
      transform: rotate(90deg);
    }
    .sao-warning-hint-text {
      padding: 8px 11px;
      border: 1px solid rgba(255, 164, 82, 0.38);
      border-radius: 10px;
      background: rgba(9, 16, 25, 0.86);
      -webkit-backdrop-filter: blur(6px);
      backdrop-filter: blur(6px);
      font-size: 0.72rem;
      line-height: 1.45;
      text-align: left;
    }
    .sao-warning-hint[data-side="below"] .sao-warning-hint-text {
      text-align: center;
    }
    .sao-warning-okay {
      margin-left: auto;
      min-width: 132px;
      min-height: 40px;
      padding: 8px 18px;
      border: 1px solid rgba(115, 185, 255, 0.5);
      border-radius: 10px;
      background: rgba(20, 40, 62, 0.96);
      color: #eef4ff;
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      transition: border-color 0.16s ease, background 0.16s ease, transform 0.16s ease;
    }
    .sao-warning-okay:hover:not(:disabled) {
      border-color: #73b9ff;
      background: rgba(26, 44, 70, 0.98);
    }
    .sao-warning-okay:active:not(:disabled) {
      transform: scale(0.98);
    }
    .sao-warning-okay:focus-visible {
      outline: 2px solid #8bb7ff;
      outline-offset: 2px;
    }
    .sao-warning-okay:disabled {
      opacity: 0.55;
      cursor: not-allowed;
    }
    @media (max-width: 560px) {
      .sao-warning-panel {
        padding: 16px;
        border-radius: 14px;
      }
      .sao-warning-footer {
        align-items: stretch;
      }
      .sao-warning-okay {
        width: 100%;
        margin-left: 0;
      }
    }
    @media (max-width: 420px) {
      .sao-warning-language-options {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }
    @media (prefers-reduced-motion: reduce) {
      .sao-warning-panel {
        animation: none;
      }
    }
  `;

  function createWelcomeWarning(options) {
    const config = options || {};
    const documentObject = config.document || globalObject?.document;
    const windowObject = config.window || globalObject;
    const translate = typeof config.translate === "function" ? config.translate : DEFAULT_TRANSLATION;
    const configuredLockSeconds = Number(config.lockSeconds);
    const lockSeconds =
      Number.isFinite(configuredLockSeconds) && configuredLockSeconds > 0
        ? Math.max(1, Math.round(configuredLockSeconds))
        : DEFAULT_LOCK_SECONDS;
    const getLanguage = typeof config.getLanguage === "function" ? config.getLanguage : () => "en";
    const setLanguage = typeof config.setLanguage === "function" ? config.setLanguage : () => {};
    const getLanguages = typeof config.getLanguages === "function" ? config.getLanguages : () => ["en", "es", "fr"];
    const getLanguageLabel =
      typeof config.getLanguageLabel === "function"
        ? config.getLanguageLabel
        : (language) => String(language || "").toUpperCase();
    const ensureSharedStyles = typeof config.ensureSharedStyles === "function" ? config.ensureSharedStyles : null;
    const onDismiss = typeof config.onDismiss === "function" ? config.onDismiss : null;
    /* Storage used only for the warning-encounter counter below. Falls back to localStorage when
       no shared storage layer is passed in. The key is deliberately separate from the walkthrough
       completion keys: it never affects whether the warning or the tour is shown. */
    const storage = config.storage || null;
    const encounterKey = String(config.encounterKey || "sao.warning.encounters");
    const configuredSkipAfter = Number(config.skipAfterEncounters);
    const skipAfterEncounters =
      Number.isFinite(configuredSkipAfter) && configuredSkipAfter >= 0 ? Math.floor(configuredSkipAfter) : 3;
    /* Falls back to the same data-i18n contract the shared i18n layer uses. */
    const applyTranslations =
      typeof config.applyTranslations === "function"
        ? config.applyTranslations
        : (root) => {
            root?.querySelectorAll?.("[data-i18n]").forEach((node) => {
              const key = node.getAttribute("data-i18n");
              if (key) node.textContent = translate(key);
            });
          };

    let overlay = null;
    let panel = null;
    let languageOptions = null;
    let okayButton = null;
    let hint = null;
    let hintText = null;
    let listeners = [];
    let lockTimerId = null;
    let lockDeadline = 0;
    let lockActive = false;
    let open = false;
    let destroyed = false;
    let lastFocusedElement = null;
    /* Encounter number of the current presentation (1 = first visit) and whether the warning has
       been shown enough times that Okay is replaced by an immediate Skip. */
    let encounterNumber = 0;
    let skipMode = false;
    /* Language the panel currently renders; used so a language change restarts the lock once. */
    let renderedLanguage = "";

    function addListener(target, type, listener, listenerOptions) {
      if (!target?.addEventListener) return;
      target.addEventListener(type, listener, listenerOptions);
      listeners.push(() => target.removeEventListener?.(type, listener, listenerOptions));
    }

    function isElement(value) {
      return (
        Boolean(value) && typeof globalObject?.HTMLElement === "function" && value instanceof globalObject.HTMLElement
      );
    }

    function ensureStyles() {
      if (!documentObject?.getElementById || documentObject.getElementById(STYLE_ID)) return;
      const style = documentObject.createElement("style");
      style.id = STYLE_ID;
      style.textContent = STYLE_TEXT;
      documentObject.head?.appendChild(style);
    }

    function remainingSeconds() {
      return Math.max(0, Math.ceil((lockDeadline - Date.now()) / 1000));
    }

    function renderOkayButton() {
      if (!okayButton) return;
      if (skipMode) {
        /* Past the encounter threshold the wait is dropped: a single, immediately usable Skip. */
        okayButton.disabled = false;
        okayButton.dataset.mode = "skip";
        okayButton.textContent = translate("ui.warning.skip");
        return;
      }
      okayButton.dataset.mode = "okay";
      if (lockActive) {
        okayButton.disabled = true;
        okayButton.textContent = translate("ui.warning.okayCountdown", { seconds: remainingSeconds() });
        return;
      }
      okayButton.disabled = false;
      okayButton.textContent = translate("ui.warning.okay");
    }

    /* One presentation = one increment. start() calls this exactly once per opening, after its
       early-returns, so a language change, a re-render or a stray start() can never double-count. */
    function readEncounterCount() {
      try {
        const raw =
          storage && typeof storage.getItem === "function"
            ? storage.getItem(encounterKey)
            : globalObject?.localStorage?.getItem?.(encounterKey);
        const value = Number.parseInt(raw, 10);
        return Number.isFinite(value) && value > 0 ? value : 0;
      } catch {
        return 0;
      }
    }

    function writeEncounterCount(value) {
      const text = String(value);
      try {
        if (storage && typeof storage.setItem === "function") storage.setItem(encounterKey, text);
        else globalObject?.localStorage?.setItem?.(encounterKey, text);
      } catch {
        /* Storage can be unavailable (private mode); the warning still works, it just cannot
           remember the count. */
      }
    }

    function updateHint() {
      if (!hint || !overlay) return;
      const show = !skipMode;
      hint.hidden = !show;
      if (show) {
        hintText.textContent = translate("ui.warning.explainer");
        positionHint();
        return;
      }
      /* Hidden explainers must leave no reserved layout space behind. */
      overlay.classList.remove("has-hint-below");
    }

    /* Places the explainer independently of the panel, which the overlay centres on its own.
       The hint is fixed-positioned in viewport coordinates: beside the panel on wide screens
       (arrow pointing left, vertically lined up with the Okay/Skip button), or beneath it when
       there is not enough horizontal room, in which case has-hint-below reserves a bottom strip
       so the centred panel stays clear of it. */
    function positionHint() {
      if (!hint || hint.hidden || !panel || !overlay) return;
      const viewportWidth = Number(windowObject.innerWidth) || 0;
      const viewportHeight = Number(windowObject.innerHeight) || 0;
      const margin = 12;
      const gap = 14;
      const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

      /* Measure the hint at a neutral position; its size does not depend on where it sits. */
      hint.style.left = "0px";
      hint.style.top = "0px";
      const hintRect = hint.getBoundingClientRect?.();
      if (!hintRect?.width) return;

      const panelRect = panel.getBoundingClientRect?.();
      if (!panelRect) return;
      const fitsBeside = viewportWidth - panelRect.right - margin >= hintRect.width + gap;
      hint.dataset.side = fitsBeside ? "right" : "below";
      overlay.classList.toggle("has-hint-below", !fitsBeside);

      /* Re-measure: toggling the reserved strip moves the vertically centred panel. */
      const settledPanelRect = panel.getBoundingClientRect?.() || panelRect;
      const okayRect = okayButton?.getBoundingClientRect?.();

      if (fitsBeside) {
        hint.style.left = `${Math.round(
          Math.min(settledPanelRect.right + gap, viewportWidth - margin - hintRect.width)
        )}px`;
        const centred = okayRect
          ? okayRect.top + okayRect.height / 2 - hintRect.height / 2
          : settledPanelRect.top + (settledPanelRect.height - hintRect.height) / 2;
        hint.style.top = `${Math.round(
          clamp(centred, margin, Math.max(margin, viewportHeight - margin - hintRect.height))
        )}px`;
        return;
      }

      const anchor = okayRect ? okayRect.left + okayRect.width / 2 : settledPanelRect.left + settledPanelRect.width / 2;
      hint.style.left = `${Math.round(
        clamp(anchor - hintRect.width / 2, margin, Math.max(margin, viewportWidth - margin - hintRect.width))
      )}px`;
      hint.style.top = `${Math.round(
        clamp(settledPanelRect.bottom + gap, margin, Math.max(margin, viewportHeight - margin - hintRect.height))
      )}px`;
    }

    /* A single interval is owned by the controller: every reset clears the previous one
       first, so two countdowns can never run at the same time. In Skip mode there is no lock. */
    function resetLockCountdown() {
      if (skipMode) {
        stopLockCountdown();
        renderOkayButton();
        return;
      }
      if (lockTimerId !== null) {
        windowObject.clearInterval?.(lockTimerId);
        lockTimerId = null;
      }
      lockDeadline = Date.now() + lockSeconds * 1000;
      lockActive = true;
      renderOkayButton();
      lockTimerId = windowObject.setInterval?.(tickLock, LOCK_TICK_MS) ?? null;
    }

    function tickLock() {
      if (!open) return;
      if (remainingSeconds() > 0) {
        renderOkayButton();
        return;
      }
      windowObject.clearInterval?.(lockTimerId);
      lockTimerId = null;
      lockActive = false;
      renderOkayButton();
    }

    function stopLockCountdown() {
      if (lockTimerId !== null) {
        windowObject.clearInterval?.(lockTimerId);
        lockTimerId = null;
      }
      lockActive = false;
    }

    /* Labels are the same endonyms (English / Español / Français) the settings menu shows,
       and the buttons reuse its .sao-language-option styling. The row is re-rendered on every
       language change, so focus is put back on the same language button to keep keyboard
       users where they were instead of dropping them on <body>. */
    function renderLanguageButtons() {
      if (!languageOptions) return;
      const activeLanguage = String(getLanguage() || "");
      const focusedButton = languageOptions.contains?.(documentObject.activeElement)
        ? documentObject.activeElement
        : null;
      const focusedLanguage = focusedButton?.dataset?.language || "";
      languageOptions.replaceChildren();
      (getLanguages() || []).forEach((language) => {
        const button = documentObject.createElement("button");
        button.type = "button";
        button.className = "sao-language-option";
        button.dataset.language = language;
        button.setAttribute("lang", language);
        button.setAttribute("aria-pressed", String(activeLanguage === language));
        button.textContent = getLanguageLabel(language);
        languageOptions.appendChild(button);
      });
      renderedLanguage = activeLanguage;
      if (focusedLanguage) {
        languageOptions.querySelector(`button[data-language="${focusedLanguage}"]`)?.focus?.();
      }
    }

    function syncTranslations() {
      if (!panel) return;
      applyTranslations(panel);
      renderLanguageButtons();
      renderOkayButton();
      updateHint();
    }

    function buildOverlay() {
      overlay = documentObject.createElement("div");
      overlay.className = "sao-warning-overlay";
      overlay.setAttribute("role", "presentation");

      const shade = documentObject.createElement("div");
      shade.className = "sao-warning-shade";
      shade.setAttribute("aria-hidden", "true");

      panel = documentObject.createElement("section");
      panel.className = "sao-warning-panel";
      panel.id = "sao-warning-panel";
      panel.tabIndex = -1;
      panel.setAttribute("role", "dialog");
      panel.setAttribute("aria-modal", "true");
      panel.setAttribute("aria-labelledby", "sao-warning-title");
      panel.setAttribute("aria-describedby", "sao-warning-body");

      const kicker = documentObject.createElement("p");
      kicker.className = "sao-warning-kicker";
      kicker.dataset.i18n = "ui.warning.kicker";

      const title = documentObject.createElement("h2");
      title.className = "sao-warning-title";
      title.id = "sao-warning-title";
      title.dataset.i18n = "ui.warning.title";

      const body = documentObject.createElement("p");
      body.className = "sao-warning-body";
      body.id = "sao-warning-body";
      body.dataset.i18n = "ui.warning.body";

      const footer = documentObject.createElement("footer");
      footer.className = "sao-warning-footer";

      const languages = documentObject.createElement("div");
      languages.className = "sao-warning-languages";
      languages.setAttribute("role", "group");
      languages.setAttribute("aria-labelledby", "sao-warning-languages-label");

      const languagesLabel = documentObject.createElement("span");
      languagesLabel.className = "sao-warning-languages-label";
      languagesLabel.id = "sao-warning-languages-label";
      languagesLabel.dataset.i18n = "ui.warning.languageLabel";

      languageOptions = documentObject.createElement("div");
      languageOptions.className = "sao-warning-language-options";

      okayButton = documentObject.createElement("button");
      okayButton.type = "button";
      okayButton.className = "sao-warning-okay";
      okayButton.disabled = true;

      languages.append(languagesLabel, languageOptions);
      footer.append(languages, okayButton);
      panel.append(kicker, title, body, footer);

      /* The explainer lives beside the panel (a sibling of it), never inside it, so it can never
         be caught by the panel's own clipping/overflow. It reuses the same inline arrow treatment
         the Welcome Mat's language hint uses for the Settings button. */
      hint = documentObject.createElement("aside");
      hint.className = "sao-warning-hint";
      hint.setAttribute("aria-hidden", "true");
      hint.hidden = true;

      const hintArrow = documentObject.createElement("span");
      hintArrow.className = "sao-warning-hint-arrow";
      const hintSvg = documentObject.createElementNS?.("http://www.w3.org/2000/svg", "svg");
      if (hintSvg?.setAttribute) {
        hintSvg.setAttribute("viewBox", "0 0 14 14");
        hintSvg.setAttribute("fill", "none");
        hintSvg.setAttribute("stroke", "currentColor");
        hintSvg.setAttribute("stroke-width", "1.4");
        hintSvg.setAttribute("stroke-linecap", "round");
        hintSvg.setAttribute("stroke-linejoin", "round");
        const hintPath = documentObject.createElementNS?.("http://www.w3.org/2000/svg", "path");
        hintPath?.setAttribute?.("d", "M12 7H2M2 7l4-4M2 7l4 4");
        hintSvg.appendChild(hintPath);
        hintArrow.appendChild(hintSvg);
      }

      hintText = documentObject.createElement("span");
      hintText.className = "sao-warning-hint-text";

      hint.append(hintArrow, hintText);
      overlay.append(shade, panel, hint);
      documentObject.body?.appendChild(overlay);

      /* Only the Okay button dismisses the warning: the shade carries no click handler, so
         a backdrop click can never bypass it. */
      addListener(languageOptions, "click", (event) => {
        const option = event.target?.closest?.("button[data-language]");
        if (!option) return;
        changeLanguage(option.dataset.language);
      });
      addListener(okayButton, "click", () => {
        if (lockActive) return;
        dismiss();
      });
    }

    /* The change is claimed before setLanguage() runs, so the shared sao:languagechange
       listener treats it as handled and no second countdown is started. */
    function changeLanguage(languageCode) {
      const nextLanguage = String(languageCode || "");
      if (!nextLanguage || nextLanguage === String(getLanguage() || "")) return;
      renderedLanguage = nextLanguage;
      setLanguage(nextLanguage);
      syncTranslations();
      resetLockCountdown();
    }

    function handleLanguageChange(event) {
      if (!open) return;
      const nextLanguage = String(event?.detail?.language || getLanguage() || "");
      if (!nextLanguage || nextLanguage === renderedLanguage) return;
      syncTranslations();
      resetLockCountdown();
    }

    function getFocusableElements() {
      return panel ? Array.from(panel.querySelectorAll("button:not([disabled])")) : [];
    }

    function trapFocus(event) {
      const focusable = getFocusableElements();
      const active = documentObject.activeElement;
      if (!focusable.length) {
        event.preventDefault?.();
        panel?.focus?.();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!panel?.contains?.(active)) {
        event.preventDefault?.();
        first.focus?.();
        return;
      }
      if (event.shiftKey && active === first) {
        event.preventDefault?.();
        last.focus?.();
        return;
      }
      if (!event.shiftKey && active === last) {
        event.preventDefault?.();
        first.focus?.();
      }
    }

    function handleKeydown(event) {
      if (!open) return;
      /* Escape is intentionally ignored: the warning only closes through Okay. */
      if (event.key === "Escape") {
        event.preventDefault?.();
        event.stopPropagation?.();
        return;
      }
      if (event.key === "Tab") trapFocus(event);
    }

    function handleFocusIn(event) {
      if (!open || !panel) return;
      if (panel.contains(event.target)) return;
      panel.focus?.();
    }

    function start() {
      if (destroyed || open || !documentObject) return false;
      ensureStyles();
      /* Reuses the existing language-picker styling so the buttons match the settings menu. */
      ensureSharedStyles?.();
      buildOverlay();
      if (!overlay || !panel) return false;
      /* This presentation is counted exactly once, here, after the early-returns: reloads create a
         new controller, language changes re-render instead of restarting, so the count can only
         move forward once per genuine display. */
      encounterNumber = readEncounterCount() + 1;
      writeEncounterCount(encounterNumber);
      skipMode = encounterNumber > skipAfterEncounters;
      lastFocusedElement = isElement(documentObject.activeElement) ? documentObject.activeElement : null;
      open = true;
      documentObject.documentElement?.classList.add("sao-warning-locked");
      addListener(documentObject, "keydown", handleKeydown, true);
      addListener(documentObject, "focusin", handleFocusIn, true);
      addListener(documentObject, "sao:languagechange", handleLanguageChange);
      addListener(windowObject, "resize", positionHint);
      syncTranslations();
      resetLockCountdown();
      panel.focus?.();
      return true;
    }

    function close(notifyDismissed) {
      if (!open) return;
      open = false;
      stopLockCountdown();
      listeners.forEach((cleanup) => cleanup());
      listeners = [];
      documentObject.documentElement?.classList.remove("sao-warning-locked");
      overlay?.remove?.();
      overlay = null;
      panel = null;
      languageOptions = null;
      okayButton = null;
      hint = null;
      hintText = null;
      skipMode = false;
      renderedLanguage = "";
      if (isElement(lastFocusedElement) && lastFocusedElement.isConnected) {
        lastFocusedElement.focus?.();
      }
      lastFocusedElement = null;
      if (notifyDismissed) onDismiss?.();
    }

    function dismiss() {
      close(true);
    }

    function destroy() {
      if (destroyed) return;
      close(false);
      destroyed = true;
    }

    return Object.freeze({
      start,
      dismiss,
      destroy,
      isOpen: () => open
    });
  }

  if (globalObject) globalObject.createWelcomeWarning = createWelcomeWarning;
  if (typeof module !== "undefined" && module.exports) module.exports = { createWelcomeWarning };
})(typeof window !== "undefined" ? window : globalThis);
