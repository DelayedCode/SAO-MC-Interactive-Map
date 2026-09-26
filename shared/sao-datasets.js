(function (global) {
  "use strict";

  const DATASET_PARAM = "dataset";
  const VALID_DATASETS = new Set(["beta", "current"]);
  const AFFECTED_SECTIONS = new Set([
    "bestiary",
    "equipment",
    "quests",
    "commands",
    "miscinfo",
    "towerDefense",
    "compendium"
  ]);

  const fallbackStorage = {
    getItem() { return null; },
    setItem() {}
  };

  function getDataset(value) {
    const candidate = value instanceof URLSearchParams
      ? value.get(DATASET_PARAM)
      : value;
    return VALID_DATASETS.has(candidate) ? candidate : "beta";
  }

  function getDatasetFromLocation() {
    return getDataset(new URLSearchParams(global.location.search));
  }

  function addDatasetToUrl(url, dataset, preserveDataset = true) {
    const resolved = new URL(url, global.location.href);
    if (preserveDataset && VALID_DATASETS.has(dataset)) {
      resolved.searchParams.set(DATASET_PARAM, dataset);
    } else {
      resolved.searchParams.delete(DATASET_PARAM);
    }
    return resolved.href;
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
        const nextUrl = addDatasetToUrl(config.url, dataset, AFFECTED_SECTIONS.has(config.section));
        closeSelector();
        global.location.href = nextUrl;
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
    dialog.addEventListener("keydown", event => {
      if (event.key === "Escape") closeSelector();
    });
  }

  function navigate(options) {
    const config = options || {};
    const section = config.section;
    const dataset = getDatasetFromLocation();
    if (AFFECTED_SECTIONS.has(section)) {
      openSelector({ ...config, dataset });
      return;
    }
    global.location.href = addDatasetToUrl(config.url, dataset, false);
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
    affectedSections: AFFECTED_SECTIONS,
    getDataset,
    getDatasetFromLocation,
    addDatasetToUrl,
    navigate,
    openSelector,
    installStyles,
    storage: global.SAOStorage || fallbackStorage
  });
})(window);
