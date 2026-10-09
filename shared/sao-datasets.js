(function (global) {
  "use strict";

  const DATASET_PARAM = "dataset";
  const VALID_DATASETS = Object.freeze(["beta", "current"]);
  const VALID_DATASET_SET = new Set(VALID_DATASETS);
  const DEFAULT_DATASET = "beta";
  const VALID_WORLDS = Object.freeze(["aincrad", "underworld"]);
  const VALID_WORLD_SET = new Set(VALID_WORLDS);
  const DATASET_STORAGE_PREFIX = "sao.dataset.";

  const fallbackStorage = {
    getItem() {
      return null;
    },
    setItem() {}
  };

  function getStorage() {
    return global.SAOStorage || fallbackStorage;
  }

  /* Only the two shipped modes are ever accepted; every other value is ignored so an
     invalid ?dataset= link or a corrupted stored value can never reach the pages. */
  function normalizeDataset(value) {
    return VALID_DATASET_SET.has(value) ? value : null;
  }

  function normalizeWorld(value) {
    return VALID_WORLD_SET.has(value) ? value : null;
  }

  /* The page's world decides which stored mode applies, so an Aincrad choice can never drive
     the Fractured Underworld and vice versa. Every world page lives one directory below its
     world root, so the path alone is enough to tell the two apart. */
  function resolveWorld(pathname) {
    const rawPath = String(pathname === undefined ? (global.location && global.location.pathname) || "" : pathname);
    let path = rawPath;
    try {
      /* Browsers report the path with %20 for the spaces in "Fractured Underworld". */
      path = decodeURIComponent(rawPath);
    } catch {
      /* Malformed escapes keep the raw path. */
    }
    return /fractured\s*underworld/i.test(path) ? "underworld" : "aincrad";
  }

  function getStorageKey(world) {
    const safeWorld = normalizeWorld(world);
    return safeWorld ? `${DATASET_STORAGE_PREFIX}${safeWorld}` : "";
  }

  /* An explicit ?dataset= link (deep link, test harness) wins over the stored world mode. */
  function readDatasetParam(search) {
    const params = new URLSearchParams(search === undefined ? (global.location && global.location.search) || "" : search);
    return normalizeDataset(params.get(DATASET_PARAM));
  }

  function readStoredDataset(world) {
    const key = getStorageKey(world);
    if (!key) return null;
    try {
      return normalizeDataset(getStorage().getItem(key));
    } catch {
      return null;
    }
  }

  /* Persists the Welcome Mat choice for one world. Returns the accepted mode, or null when the
     world or the mode is not one of the shipped values. */
  function setActiveDataset(world, mode) {
    const safeWorld = normalizeWorld(world);
    const safeMode = normalizeDataset(mode);
    if (!safeWorld || !safeMode) return null;
    try {
      getStorage().setItem(getStorageKey(safeWorld), safeMode);
    } catch {
      /* Storage can be blocked (private mode); the mode still applies for this navigation. */
    }
    return safeMode;
  }

  function getActiveDataset(world) {
    const safeWorld = normalizeWorld(world) || resolveWorld();
    return readDatasetParam() || readStoredDataset(safeWorld) || DEFAULT_DATASET;
  }

  function getDatasetFromLocation() {
    return getActiveDataset(resolveWorld());
  }

  function getDataset(value) {
    const candidate = value instanceof URLSearchParams ? value.get(DATASET_PARAM) : value;
    return normalizeDataset(candidate) || DEFAULT_DATASET;
  }

  function addDatasetToUrl(url, dataset, preserveDataset = true) {
    const resolved = new URL(url, global.location.href);
    if (preserveDataset && VALID_DATASET_SET.has(dataset)) {
      resolved.searchParams.set(DATASET_PARAM, dataset);
    } else {
      resolved.searchParams.delete(DATASET_PARAM);
    }
    return resolved.href;
  }

  /* Current Data ships the Main Questline waypoints plus the Current accessory waypoints; Beta
     ships every other map marker. A marker is Current Data when its category is the Main Questline
     category or when it carries an explicit `dataset: "current"` field - the Current accessory
     waypoints reuse category names that Beta also uses (Accessories Blacksmith, Occult Merchant),
     so the category alone cannot tell the two apart. Both map adapters filter through this, so the
     two worlds cannot drift apart on the rule. */
  const MAIN_QUEST_CATEGORY = "mainQuests";
  const CURRENT_DATASET = "current";

  function isCurrentDataMarker(marker) {
    return marker?.dataset === CURRENT_DATASET || marker?.category === MAIN_QUEST_CATEGORY;
  }

  function filterMarkerDatasetForActiveMode(markerDataset) {
    const isCurrent = getDatasetFromLocation() === CURRENT_DATASET;
    const entries = Object.entries(markerDataset || {});
    const kept = entries.filter(([, marker]) => isCurrentDataMarker(marker) === isCurrent);
    if (kept.length === entries.length) return markerDataset || {};
    return Object.fromEntries(kept);
  }

  function localize(key, fallback) {
    const i18n = global.SAOI18n;
    if (i18n && typeof i18n.t === "function") {
      const translated = i18n.t(key);
      if (translated && translated !== key) return translated;
    }
    return fallback;
  }

  let activeDialog = null;

  function closeSelector() {
    if (!activeDialog) return;
    activeDialog.remove();
    activeDialog = null;
  }

  /* The data-mode chooser. It is opened once per world from the Welcome Mat: choosing a mode
     stores it for that world and then enters the world, so sections never ask again. */
  function openSelector(options) {
    const config = options || {};
    if (!config.url) return;

    closeSelector();

    const dialog = document.createElement("div");
    dialog.className = "sao-dataset-dialog";
    dialog.setAttribute("role", "presentation");

    const backdrop = document.createElement("button");
    backdrop.type = "button";
    backdrop.className = "sao-dataset-backdrop";
    backdrop.setAttribute("aria-label", localize("dataset.close", "Close dataset selection"));

    const panel = document.createElement("section");
    panel.className = "sao-dataset-panel";
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-modal", "true");
    panel.setAttribute("aria-labelledby", "saoDatasetTitle");

    const title = document.createElement("h2");
    title.id = "saoDatasetTitle";
    title.textContent = config.title || localize("dataset.chooseTitle", "Choose Data Version");

    const choices = document.createElement("div");
    choices.className = "sao-dataset-choices";

    const makeChoice = ({
      dataset,
      labelKey,
      labelFallback,
      descriptionKey,
      descriptionFallback,
      badgeKey,
      badgeFallback,
      badgeVariant
    }) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "sao-dataset-choice";

      /* The label and its badge share one row so both cards keep the same rhythm. */
      const heading = document.createElement("span");
      heading.className = "sao-dataset-choice-head";
      const label = document.createElement("strong");
      label.textContent = localize(labelKey, labelFallback);
      const badge = document.createElement("span");
      badge.className = badgeVariant ? `sao-dataset-badge ${badgeVariant}` : "sao-dataset-badge";
      badge.textContent = localize(badgeKey, badgeFallback);
      heading.append(label, badge);

      const description = document.createElement("span");
      description.className = "sao-dataset-description";
      description.textContent = localize(descriptionKey, descriptionFallback);
      button.append(heading, description);

      button.addEventListener("click", () => {
        setActiveDataset(config.world, dataset);
        closeSelector();
        global.location.href = addDatasetToUrl(config.url, dataset, false);
      });
      return button;
    };

    choices.append(
      makeChoice({
        dataset: "beta",
        labelKey: "dataset.betaLabel",
        labelFallback: "Beta-Test Data",
        descriptionKey: "dataset.betaDescription",
        descriptionFallback: "Experimental information from beta testing. Some details may be incomplete or inaccurate.",
        badgeKey: "dataset.betaBadge",
        badgeFallback: "Legacy",
        badgeVariant: "is-experimental"
      }),
      makeChoice({
        dataset: "current",
        labelKey: "dataset.currentLabel",
        labelFallback: "Current Data",
        descriptionKey: "dataset.currentDescription",
        descriptionFallback:
          "The actively maintained dataset. If something is missing, check Beta-Test Data until the information is available here.",
        badgeKey: "dataset.currentBadge",
        badgeFallback: "Recommended",
        badgeVariant: ""
      })
    );

    const closeButton = document.createElement("button");
    closeButton.type = "button";
    closeButton.className = "sao-dataset-close";
    closeButton.textContent = localize("dataset.cancel", "Cancel");
    closeButton.addEventListener("click", closeSelector);

    panel.append(title, choices, closeButton);
    dialog.append(backdrop, panel);
    document.body.appendChild(dialog);
    activeDialog = dialog;
    closeButton.focus();

    backdrop.addEventListener("click", closeSelector);
    dialog.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeSelector();
    });
  }

  function installStyles() {
    if (document.getElementById("saoDatasetStyles")) return;
    const style = document.createElement("style");
    style.id = "saoDatasetStyles";
    style.textContent = `
      .sao-dataset-dialog { position: fixed; inset: 0; z-index: 10000; display: grid; place-items: center; padding: 18px; }
      .sao-dataset-backdrop { position: absolute; inset: 0; border: 0; background: rgba(3, 8, 14, .78); cursor: pointer; }
      .sao-dataset-panel { position: relative; display: grid; gap: 13px; width: min(100%, 430px); max-height: min(100%, 620px); overflow-y: auto; padding: 19px; border: 1px solid rgba(130, 190, 255, .3); border-radius: 16px; background: linear-gradient(180deg, rgba(18, 28, 41, .98), rgba(9, 15, 24, .98)); color: #eef4ff; box-shadow: 0 22px 60px rgba(0, 0, 0, .48), inset 0 1px 0 rgba(255, 255, 255, .04); }
      .sao-dataset-panel h2 { margin: 0; font-size: 1.04rem; font-weight: 700; letter-spacing: .01em; line-height: 1.3; }
      .sao-dataset-panel h2::after { content: ""; display: block; width: 44px; height: 2px; margin-top: 9px; border-radius: 999px; background: linear-gradient(90deg, #73b9ff, rgba(115, 185, 255, 0)); }
      .sao-dataset-choices { display: grid; gap: 9px; }
      .sao-dataset-choice { display: grid; gap: 7px; width: 100%; padding: 13px 14px; border: 1px solid rgba(130, 190, 255, .22); border-radius: 12px; background: rgba(22, 33, 47, .92); color: inherit; font: inherit; text-align: left; cursor: pointer; transition: transform .16s ease, border-color .16s ease, background .16s ease, box-shadow .16s ease; }
      .sao-dataset-choice-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
      .sao-dataset-choice strong { font-size: .94rem; letter-spacing: .01em; }
      .sao-dataset-badge { flex: none; padding: 3px 8px; border: 1px solid rgba(115, 185, 255, .45); border-radius: 999px; background: rgba(115, 185, 255, .12); color: #a8d2ff; font-size: .6rem; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; }
      .sao-dataset-badge.is-experimental { border-color: rgba(231, 189, 112, .45); background: rgba(231, 189, 112, .12); color: #f0d59d; }
      .sao-dataset-description { color: #b9cce3; font-size: .82rem; line-height: 1.5; }
      .sao-dataset-choice:hover { transform: translateY(-1px); border-color: rgba(115, 185, 255, .6); background: rgba(28, 42, 60, .96); box-shadow: 0 10px 22px rgba(0, 0, 0, .26); }
      .sao-dataset-choice:focus-visible { outline: 2px solid #8bb7ff; outline-offset: 2px; border-color: rgba(115, 185, 255, .75); background: rgba(28, 42, 60, .96); }
      .sao-dataset-choice:active { transform: translateY(0) scale(.995); }
      .sao-dataset-close { width: 100%; padding: 10px 14px; border: 1px solid rgba(174, 198, 223, .24); border-radius: 10px; background: rgba(10, 17, 27, .85); color: #b9cce3; font: inherit; font-size: .84rem; cursor: pointer; transition: transform .16s ease, border-color .16s ease, background .16s ease, color .16s ease; }
      .sao-dataset-close:hover { border-color: rgba(115, 185, 255, .5); background: rgba(17, 29, 43, .96); color: #eef4ff; }
      .sao-dataset-close:focus-visible { outline: 2px solid #8bb7ff; outline-offset: 2px; color: #eef4ff; }
      .sao-dataset-close:active { transform: scale(.99); }
      @media (prefers-reduced-motion: reduce) { .sao-dataset-choice, .sao-dataset-close { transition: none; } .sao-dataset-choice:hover, .sao-dataset-choice:active, .sao-dataset-close:active { transform: none; } }
      @media (max-width: 420px) { .sao-dataset-panel { gap: 11px; padding: 15px; } .sao-dataset-choice { padding: 12px; } .sao-dataset-choice-head { flex-wrap: wrap; } }
    `;
    document.head.appendChild(style);
  }

  global.SAODatasets = Object.freeze({
    validDatasets: VALID_DATASETS,
    validWorlds: VALID_WORLDS,
    defaultDataset: DEFAULT_DATASET,
    datasetStoragePrefix: DATASET_STORAGE_PREFIX,
    normalizeDataset,
    resolveWorld,
    MAIN_QUEST_CATEGORY,
    CURRENT_DATASET,
    isCurrentDataMarker,
    filterMarkerDatasetForActiveMode,
    getDataset,
    getDatasetFromLocation,
    getActiveDataset,
    setActiveDataset,
    addDatasetToUrl,
    openSelector,
    installStyles,
    storage: global.SAOStorage || fallbackStorage
  });
})(window);
