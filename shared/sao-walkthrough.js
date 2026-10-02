(function (globalObject) {
  "use strict";

  /* Placeholder substitution is shared with the page helpers instead of being re-declared. */
  const DEFAULT_TRANSLATION =
    (globalObject.SAOPageHelpers && globalObject.SAOPageHelpers.formatMessage) || ((key) => key);

  const STYLE_TEXT = `
    .sao-tour-overlay {
      position: fixed;
      inset: 0;
      z-index: 120;
      display: flex;
      background: transparent;
      padding: 16px;
      align-items: flex-end;
      justify-content: center;
      opacity: 0;
      visibility: hidden;
      pointer-events: none;
      transition: opacity 0.2s ease, visibility 0.2s step-end;
    }
    .sao-tour-shade {
      position: absolute;
      inset: 0;
      z-index: 0;
      background: rgba(4, 8, 14, 0.48);
      -webkit-backdrop-filter: blur(7px);
      backdrop-filter: blur(7px);
      pointer-events: none;
      transition: left 0.24s ease, top 0.24s ease, width 0.24s ease, height 0.24s ease;
    }
    .sao-tour-focus-ring {
      position: fixed;
      z-index: 2;
      left: 0;
      top: 0;
      width: 0;
      height: 0;
      border: 3px solid rgba(115, 185, 255, 0.95);
      border-radius: 10px;
      box-shadow: 0 0 0 2px rgba(4, 8, 14, 0.8);
      pointer-events: none;
      opacity: 0;
      transition: left 0.24s ease, top 0.24s ease, width 0.24s ease, height 0.24s ease, border-radius 0.24s ease, opacity 0.18s ease;
    }
    .sao-tour-overlay.open {
      opacity: 1;
      visibility: visible;
      pointer-events: auto;
      transition: opacity 0.2s ease;
    }
    .sao-tour-card {
      position: fixed;
      z-index: 2;
      width: min(560px, 100%);
      border-radius: 16px;
      border: 1px solid rgba(130, 190, 255, 0.5);
      background: linear-gradient(180deg, rgba(15, 22, 36, 0.98), rgba(8, 14, 24, 0.98));
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
      padding: 14px;
      color: #eaf2ff;
      opacity: 0;
      transform: translateY(10px) scale(0.985);
      transition: opacity 0.2s ease, transform 0.2s ease;
    }
    .sao-tour-overlay.open .sao-tour-card {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
    .sao-tour-step {
      margin: 0 0 6px;
      font-size: 0.78rem;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #9fb9d7;
    }
    .sao-tour-title {
      margin: 0;
      font-size: 1rem;
    }
    .sao-tour-body {
      margin: 8px 0 12px;
      color: #c8d8ea;
      line-height: 1.55;
    }
    .sao-tour-actions {
      display: flex;
      gap: 8px;
      justify-content: flex-end;
      flex-wrap: wrap;
    }
    .sao-tour-actions button {
      border: 1px solid rgba(130, 190, 255, 0.34);
      border-radius: 10px;
      background: rgba(12, 19, 31, 0.92);
      color: #eaf2ff;
      min-height: 36px;
      padding: 8px 12px;
      cursor: pointer;
    }
    .sao-tour-actions button:hover {
      background: rgba(24, 38, 58, 0.96);
      border-color: #73b9ff;
    }
    .sao-tour-actions button:active {
      transform: scale(0.98);
    }
    .sao-tour-actions button:focus-visible {
      outline: 2px solid #8bb7ff;
      outline-offset: 2px;
    }
    .sao-tour-focus-target {
      border-radius: 10px;
    }
    @media (prefers-reduced-motion: reduce) {
      .sao-tour-overlay,
      .sao-tour-card,
      .sao-tour-actions button,
      .sao-tour-shade,
      .sao-tour-focus-ring {
        transition: none;
      }
      .sao-tour-actions button:hover {
        transform: none;
      }
    }
  `;

  function createWalkthroughController(options) {
    const config = options || {};
    const documentObject = config.document || globalObject?.document;
    const windowObject = config.window || globalObject;
    const storage = config.storage;
    const storageKey = String(config.storageKey || "");
    const getSteps = typeof config.getSteps === "function" ? config.getSteps : () => [];
    const translate = typeof config.translate === "function" ? config.translate : DEFAULT_TRANSLATION;
    const getTarget =
      typeof config.getTarget === "function"
        ? config.getTarget
        : (selector) => documentObject?.querySelector?.(selector) || null;
    let overlay = null;
    let highlightedElements = [];
    let listeners = [];
    let destroyed = false;
    const spotlightPadding = 8;
    let activeStep = null;
    let lastFocusedElement = null;
    let windowListenersAttached = false;

    function getTargetRadius(targets) {
      if (!targets?.length) return 10;
      const radii = targets
        .map((target) => Number.parseFloat(windowObject?.getComputedStyle?.(target)?.borderRadius) || 0)
        .filter((value) => Number.isFinite(value));
      return radii.length ? Math.max(...radii, 10) : 10;
    }

    function addListener(target, type, listener, listenerOptions) {
      if (!target?.addEventListener) return;
      target.addEventListener(type, listener, listenerOptions);
      listeners.push(() => target.removeEventListener?.(type, listener, listenerOptions));
    }

    function clearHighlight() {
      highlightedElements.forEach((element) => element.classList.remove("sao-tour-focus-target"));
      highlightedElements = [];
      const focusRing = overlay?.querySelector?.(".sao-tour-focus-ring");
      if (overlay) {
        overlay.querySelectorAll?.(".sao-tour-shade").forEach((shade) => {
          shade.style.left = "0";
          shade.style.top = "0";
          shade.style.width = "0";
          shade.style.height = "0";
        });
      }
      if (focusRing) {
        focusRing.style.opacity = "0";
        focusRing.style.width = "0";
        focusRing.style.height = "0";
      }
    }

    function resolveTargets(step) {
      const selectors = Array.isArray(step?.selectors) ? step.selectors : step?.selector ? [step.selector] : [];
      if (typeof config.getTargets === "function") {
        return (config.getTargets(step) || []).filter(Boolean);
      }
      return selectors
        .map((selector) => getTarget(selector, step))
        .flatMap((target) => (Array.isArray(target) ? target : target ? [target] : []))
        .filter(Boolean);
    }

    function getCombinedRect(targets) {
      const rects = targets
        .map((target) => target.getBoundingClientRect())
        .filter((rect) => rect.width > 0 && rect.height > 0);
      if (!rects.length) return null;
      const left = Math.min(...rects.map((rect) => rect.left));
      const top = Math.min(...rects.map((rect) => rect.top));
      const right = Math.max(...rects.map((rect) => rect.right));
      const bottom = Math.max(...rects.map((rect) => rect.bottom));
      return { left, top, width: right - left, height: bottom - top };
    }

    function updateSpotlight(rect, radius = 10) {
      const focusRing = overlay?.querySelector?.(".sao-tour-focus-ring");
      const shades = overlay?.querySelectorAll?.(".sao-tour-shade") || [];
      if (!rect) {
        clearHighlight();
        return;
      }

      const left = Math.max(0, rect.left - spotlightPadding);
      const top = Math.max(0, rect.top - spotlightPadding);
      const right = Math.min(windowObject.innerWidth, rect.left + rect.width + spotlightPadding);
      const bottom = Math.min(windowObject.innerHeight, rect.top + rect.height + spotlightPadding);
      const width = Math.max(0, right - left);
      const height = Math.max(0, bottom - top);
      const positions = [
        { left: 0, top: 0, width: "100%", height: `${top}px` },
        { left: 0, top: `${bottom}px`, width: "100%", height: `${Math.max(0, windowObject.innerHeight - bottom)}px` },
        { left: 0, top: `${top}px`, width: `${left}px`, height: `${height}px` },
        {
          left: `${right}px`,
          top: `${top}px`,
          width: `${Math.max(0, windowObject.innerWidth - right)}px`,
          height: `${height}px`
        }
      ];
      shades.forEach((shade, index) => {
        const position = positions[index];
        if (!position) return;
        shade.style.left = typeof position.left === "number" ? `${position.left}px` : position.left;
        shade.style.top = typeof position.top === "number" ? `${position.top}px` : position.top;
        shade.style.width = position.width;
        shade.style.height = position.height;
      });

      if (focusRing) {
        focusRing.style.left = `${left}px`;
        focusRing.style.top = `${top}px`;
        focusRing.style.width = `${width}px`;
        focusRing.style.height = `${height}px`;
        focusRing.style.borderRadius = `${Math.max(8, Math.min(radius, 24))}px`;
        focusRing.style.opacity = "1";
      }
    }

    function positionCard(rect) {
      const card = overlay?.querySelector?.(".sao-tour-card");
      if (!card) return;
      const margin = 16;
      const maxWidth = Math.max(0, windowObject.innerWidth - margin * 2);
      const width = Math.min(560, maxWidth);
      card.style.boxSizing = "border-box";
      card.style.width = `${width}px`;
      const cardRect = card.getBoundingClientRect();
      let left = (windowObject.innerWidth - width) / 2;
      let top = windowObject.innerHeight - cardRect.height - margin;
      if (rect) {
        const below = rect.top + rect.height + margin;
        const above = rect.top - cardRect.height - margin;
        top = below + cardRect.height <= windowObject.innerHeight - margin || above < margin ? below : above;
        left = Math.min(
          Math.max(margin, rect.left + (rect.width - width) / 2),
          windowObject.innerWidth - width - margin
        );
      }
      card.style.left = `${Math.max(margin, left)}px`;
      card.style.top = `${Math.min(Math.max(margin, top), Math.max(margin, windowObject.innerHeight - cardRect.height - margin))}px`;
    }

    function syncOverlayParent(targets) {
      const dialog = targets.find((target) => target.closest?.("dialog"))?.closest?.("dialog");
      const parent = dialog || documentObject.body;
      if (overlay?.parentNode !== parent) parent?.appendChild?.(overlay);
    }

    function markComplete() {
      if (storage && storageKey && typeof storage.setItem === "function") {
        storage.setItem(storageKey, "1");
      }
    }

    function closeTour(markAsComplete) {
      activeStep?.onExit?.();
      config.onClose?.();
      activeStep = null;
      clearHighlight();
      if (markAsComplete) markComplete();
      if (overlay) {
        overlay.classList.remove("open");
        overlay.setAttribute("aria-hidden", "true");
      }
      lastFocusedElement?.focus?.();
      lastFocusedElement = null;
    }

    function ensureStyles() {
      if (!documentObject?.getElementById || documentObject.getElementById("sao-walkthrough-style")) return;
      const style = documentObject.createElement("style");
      style.id = "sao-walkthrough-style";
      style.textContent = STYLE_TEXT;
      documentObject.head?.appendChild(style);
    }

    function createOverlay() {
      if (overlay) return;
      overlay = documentObject.createElement("div");
      overlay.id = "sao-tour-overlay";
      overlay.className = "sao-tour-overlay";
      overlay.setAttribute("aria-hidden", "true");

      for (let index = 0; index < 4; index += 1) {
        const shade = documentObject.createElement("div");
        shade.className = "sao-tour-shade";
        overlay.appendChild(shade);
      }

      const focusRing = documentObject.createElement("div");
      focusRing.className = "sao-tour-focus-ring";
      overlay.appendChild(focusRing);

      const card = documentObject.createElement("section");
      card.className = "sao-tour-card";
      card.setAttribute("role", "dialog");
      card.setAttribute("aria-modal", "true");
      card.setAttribute("aria-labelledby", "sao-tour-title");
      card.setAttribute("aria-describedby", "sao-tour-body");

      const stepLabel = documentObject.createElement("p");
      stepLabel.className = "sao-tour-step";
      stepLabel.id = "sao-tour-step-label";
      const title = documentObject.createElement("h2");
      title.className = "sao-tour-title";
      title.id = "sao-tour-title";
      const body = documentObject.createElement("p");
      body.className = "sao-tour-body";
      body.id = "sao-tour-body";
      const actions = documentObject.createElement("div");
      actions.className = "sao-tour-actions";
      const skip = documentObject.createElement("button");
      const previous = documentObject.createElement("button");
      const next = documentObject.createElement("button");
      skip.type = previous.type = next.type = "button";
      actions.append(skip, previous, next);
      card.append(stepLabel, title, body, actions);
      overlay.appendChild(card);
      documentObject.body?.appendChild(overlay);

      addListener(skip, "click", () => closeTour(true));
      addListener(previous, "click", () => {
        if (overlay.currentStepIndex <= 0) return;
        activeStep?.onExit?.();
        overlay.currentStepIndex -= 1;
        renderStep(overlay.steps);
      });
      addListener(next, "click", () => {
        if (overlay.currentStepIndex >= overlay.steps.length - 1) {
          closeTour(true);
          return;
        }
        activeStep?.onExit?.();
        overlay.currentStepIndex += 1;
        renderStep(overlay.steps);
      });
      addListener(overlay, "click", (event) => {
        if (event.target === overlay) closeTour(true);
      });
      addListener(documentObject, "keydown", (event) => {
        if (!overlay?.classList.contains("open")) return;
        if (event.key === "Escape") closeTour(true);
        if (event.key === "ArrowLeft" && overlay.currentStepIndex > 0) {
          activeStep?.onExit?.();
          overlay.currentStepIndex -= 1;
          renderStep(overlay.steps);
        }
        if (event.key === "ArrowRight") {
          if (overlay.currentStepIndex >= overlay.steps.length - 1) closeTour(true);
          else {
            activeStep?.onExit?.();
            overlay.currentStepIndex += 1;
            renderStep(overlay.steps);
          }
        }
      });
      addListener(documentObject, "sao:languagechange", () => {
        if (!overlay?.classList.contains("open")) return;
        overlay.steps = getSteps() || [];
        renderStep(overlay.steps);
      });
    }

    function renderStep(steps) {
      const step = steps[overlay.currentStepIndex];
      if (!step) return;
      activeStep = step;
      step.onEnter?.();
      clearHighlight();
      const targets = resolveTargets(step);
      syncOverlayParent(targets);
      const focusRing = overlay.querySelector(".sao-tour-focus-ring");
      if (targets.length) {
        highlightedElements = targets;
        highlightedElements.forEach((target) => target.classList.add("sao-tour-focus-target"));
        const reducedMotion = windowObject.matchMedia("(prefers-reduced-motion: reduce)").matches;
        targets[0].scrollIntoView?.({
          block: "center",
          inline: "nearest",
          behavior: reducedMotion ? "auto" : "smooth"
        });
        updateSpotlight(getCombinedRect(targets), getTargetRadius(targets));
        windowObject.setTimeout?.(refreshSpotlight, reducedMotion ? 0 : 250);
      } else if (focusRing) {
        focusRing.style.opacity = "0";
      }

      const stepLabel = overlay.querySelector(".sao-tour-step");
      const title = overlay.querySelector(".sao-tour-title");
      const body = overlay.querySelector(".sao-tour-body");
      const actionButtons = overlay.querySelectorAll(".sao-tour-actions button");
      stepLabel.textContent = translate("ui.walkthrough.step", {
        current: overlay.currentStepIndex + 1,
        total: steps.length
      });
      title.textContent = step.title;
      body.textContent = step.body;
      actionButtons[0].textContent = translate("ui.walkthrough.skip");
      actionButtons[1].textContent = translate("ui.walkthrough.back");
      actionButtons[1].disabled = overlay.currentStepIndex === 0;
      actionButtons[2].textContent =
        overlay.currentStepIndex === steps.length - 1
          ? translate("ui.walkthrough.finish")
          : translate("ui.walkthrough.next");
      positionCard(getCombinedRect(targets));
      actionButtons[2].focus?.();
    }

    function refreshSpotlight() {
      if (!overlay?.classList.contains("open")) return;
      const step = overlay.steps?.[overlay.currentStepIndex];
      if (!step) return;
      const targets = resolveTargets(step);
      updateSpotlight(getCombinedRect(targets), getTargetRadius(targets));
      positionCard(getCombinedRect(targets));
    }

    function start(startOptions) {
      if (destroyed || !documentObject || !storageKey) return false;
      const force = Boolean(startOptions?.force);
      if (!force && storage?.getItem?.(storageKey) === "1") return false;
      const steps = getSteps() || [];
      if (!steps.length) return false;
      ensureStyles();
      createOverlay();
      if (!windowListenersAttached) {
        addListener(windowObject, "resize", refreshSpotlight);
        addListener(windowObject, "scroll", refreshSpotlight, { passive: true });
        windowListenersAttached = true;
      }
      lastFocusedElement = documentObject.activeElement;
      overlay.steps = steps;
      overlay.currentStepIndex = 0;
      overlay.classList.add("open");
      overlay.setAttribute("aria-hidden", "false");
      renderStep(steps);
      return true;
    }

    function destroy() {
      if (destroyed) return;
      destroyed = true;
      activeStep?.onExit?.();
      config.onClose?.();
      activeStep = null;
      clearHighlight();
      listeners.forEach((cleanup) => cleanup());
      listeners = [];
      overlay?.remove?.();
      overlay = null;
    }

    return Object.freeze({ start, destroy });
  }

  if (globalObject) globalObject.createWalkthroughController = createWalkthroughController;
  if (typeof module !== "undefined" && module.exports) module.exports = { createWalkthroughController };
})(typeof window !== "undefined" ? window : globalThis);
