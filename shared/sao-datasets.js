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

    const makeChoice = (dataset, labelKey, labelFallback, descriptionKey, descriptionFallback) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "sao-dataset-choice";

      const label = document.createElement("strong");
      label.textContent = localize(labelKey, labelFallback);
      const description = document.createElement("span");
      description.textContent = localize(descriptionKey, descriptionFallback);
      button.append(label, description);

      button.addEventListener("click", () => {
        setActiveDataset(config.world, dataset);
        closeSelector();
        global.location.href = addDatasetToUrl(config.url, dataset, false);
      });
      return button;
    };

    choices.append(
      makeChoice(
        "beta",
        "dataset.betaLabel",
        "Beta-Test Data",
        "dataset.betaDescription",
        "THIS INFO IS FROM BETA TESTS. INFORMATION MAY BE OFF."
      ),
      makeChoice(
        "current",
        "dataset.currentLabel",
        "Current Data",
        "dataset.currentDescription",
        "THIS INFO IS ACTIVELY BEING UPDATED. IF YOU CANNOT FIND SOMETHING, PLEASE CHECK 'BETA-TEST DATA' FOR IT UNTIL WE GET THE INFO FOR IT."
      )
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
      .sao-dataset-backdrop { position: absolute; inset: 0; border: 0; background: rgba(3, 8, 14, .76); cursor: pointer; }
      .sao-dataset-panel { position: relative; width: min(100%, 480px); padding: 22px; border: 1px solid rgba(130, 190, 255, .3); border-radius: 12px; background: rgba(18, 27, 39, .98); color: #eef4ff; box-shadow: 0 20px 70px rgba(0, 0, 0, .42); }
      .sao-dataset-panel h2 { margin: 0 0 16px; font-size: 1.2rem; }
      .sao-dataset-choices { display: grid; gap: 10px; }
      .sao-dataset-choice { display: grid; gap: 5px; width: 100%; padding: 13px 15px; border: 1px solid rgba(130, 190, 255, .24); border-radius: 9px; background: rgba(26, 38, 53, .95); color: inherit; text-align: left; cursor: pointer; }
      .sao-dataset-choice:hover, .sao-dataset-choice:focus-visible { border-color: #73b9ff; background: rgba(38, 56, 78, .98); }
      .sao-dataset-choice span { color: #b9cce3; font-size: .83rem; line-height: 1.45; }
      .sao-dataset-close { margin-top: 14px; border: 0; background: transparent; color: #b9cce3; cursor: pointer; }
      .sao-dataset-close:hover, .sao-dataset-close:focus-visible { color: #eef4ff; }
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
