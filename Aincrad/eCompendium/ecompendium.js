const LIST_TITLES = {
  weapon: "page.ecompendium.listTitles.weapon",
  armor: "page.ecompendium.listTitles.armor",
  accessory: "page.ecompendium.listTitles.accessory",
  rune: "page.ecompendium.listTitles.rune",
  tool: "page.ecompendium.listTitles.tool",
  food: "page.ecompendium.listTitles.food",
  consumable: "page.ecompendium.listTitles.consumable",
  material: "page.ecompendium.listTitles.material",
  quest_item: "page.ecompendium.listTitles.quest_item",
  resource: "page.ecompendium.listTitles.resource",
  dungeon: "page.ecompendium.listTitles.dungeon",
  currency: "page.ecompendium.listTitles.currency"
};

const i18n = window.SAOI18n || null;
const { t, content } = window.SAOPageHelpers.createTranslators(i18n);
const loadedCompendiumFloors = new Set();
const registeredEquipmentDataSets = new WeakSet();
const registeredEntryTranslations = new WeakSet();

const { slugifyContentId } = window.SAOPageHelpers;

function getEntryId(entry) {
  return entry.id || slugifyContentId(entry.name);
}

/* Maps existing rarity wording (including event/limited variants) to a
   readable colour class. Unknown wording simply keeps the default styling. */
const RARITY_CLASS_BY_KEYWORD = {
  common: "rarity-common",
  uncommon: "rarity-uncommon",
  rare: "rarity-rare",
  epic: "rarity-epic",
  legendary: "rarity-legendary",
  mythic: "rarity-mythic",
  godlike: "rarity-godlike",
  event: "rarity-event"
};

function getRarityClass(rarity) {
  const normalized = String(rarity || "")
    .trim()
    .toLowerCase();
  if (!normalized) return "";
  for (const keyword of Object.keys(RARITY_CLASS_BY_KEYWORD)) {
    if (normalized.startsWith(keyword)) return RARITY_CLASS_BY_KEYWORD[keyword];
  }
  return "";
}

function getEntryText(entry, field, fallback) {
  const value = entry[field];
  if (!value) return fallback;
  const translated = content(`equipment.${getEntryId(entry)}.${field}`, value);
  return translated === value ? localizeRuntimeText(value) : translated;
}

function registerEntryTranslations(entry) {
  if (!entry || registeredEntryTranslations.has(entry)) {
    return;
  }
  registeredEntryTranslations.add(entry);

  /* Descriptions are routed through the shared curated-aware registration so the existing
       curatedProseTranslations table is preferred. curatedOnly keeps this page's own glossary
       fallback (localizeRuntimeText) for descriptions that have no curated translation yet. */
  window.SAOContentTranslations?.registerEquipmentEntry?.(entry, slugifyContentId, {
    fields: ["description"],
    curatedOnly: true
  });

  for (const field of ["name", "craftingLocation", "craftingNote"]) {
    if (entry[field]) {
      window.SAOContentTranslations?.translateEquipmentTerm?.(`equipment.${getEntryId(entry)}.${field}`, entry[field]);
    }
  }
  for (const resource of entry.craftingResources || []) {
    const resourceId = slugifyContentId(resource.item);
    window.SAOContentTranslations?.translateEquipmentTerm?.(
      `equipment.${getEntryId(entry)}.resource.${resourceId}`,
      resource.item
    );
  }
  for (const stat of Object.keys(entry.stats || {})) {
    window.SAOContentTranslations?.translateEquipmentTerm?.(
      `equipment.${getEntryId(entry)}.stat.${slugifyContentId(stat)}`,
      stat
    );
  }
}

function getResourceText(entry, resource) {
  const resourceId = slugifyContentId(resource.item);
  const translated = content(`equipment.${getEntryId(entry)}.resource.${resourceId}`, resource.item);
  return translated === resource.item ? localizeRuntimeText(resource.item) : translated;
}

function normalizeSearchText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

const { escapeHtml } = window.SAOPageHelpers;

function localizeRuntimeText(value) {
  if (value === null || value === undefined || value === "") return value;
  const language = i18n && typeof i18n.getLanguage === "function" ? i18n.getLanguage() : "en";
  if (language === "en") return String(value);
  const text = String(value);
  if (window.SAOContentTranslations && typeof window.SAOContentTranslations.translateEquivalentProse === "function") {
    const prose = window.SAOContentTranslations.translateEquivalentProse(text, language);
    if (prose && prose !== text) return prose;
  }
  if (window.SAOContentTranslations && typeof window.SAOContentTranslations.translateKnownTerms === "function") {
    const known = window.SAOContentTranslations.translateKnownTerms(text, language);
    if (known && known !== text) return known;
  }
  if (window.SAOContentTranslations && typeof window.SAOContentTranslations.translateEquivalentLabel === "function") {
    const equivalent = window.SAOContentTranslations.translateEquivalentLabel(text, language === "fr" ? 1 : 0);
    if (equivalent && equivalent !== text) return equivalent;
  }
  return text;
}

function getListTitle(category) {
  return t(LIST_TITLES[category] || "page.ecompendium.heading");
}

const compendiumUiStateStorageKey = "sao.compendium.uiState";
const storage = window.SAOPageHelpers.getStorage();

function loadCompendiumUiState() {
  const parsed = storage.getJSON(compendiumUiStateStorageKey, {});
  return parsed && typeof parsed === "object" ? parsed : {};
}

function saveCompendiumUiState(nextState) {
  storage.setJSON(compendiumUiStateStorageKey, nextState);
}

const DEFAULT_COMPENDIUM_FLOOR = "floor1";

const getRequestedFloor = () => window.SAOPageHelpers.getRequestedFloor(DEFAULT_COMPENDIUM_FLOOR);

function getActiveDataSet() {
  const floorIndex = getRequestedFloor().replace("floor", "");
  const registerDataSet = (dataSet) => {
    if (!dataSet || typeof dataSet !== "object" || registeredEquipmentDataSets.has(dataSet)) {
      return dataSet;
    }

    registeredEquipmentDataSets.add(dataSet);
    return dataSet;
  };
  if (window.SAODatasets?.getDatasetFromLocation() === "current") {
    return registerDataSet(window.SAO_CURRENT_EQUIPMENT_DATA?.[getRequestedFloor()] || {});
  }
  const dataSetKey = `FLOOR_${floorIndex}_DATA`;
  return registerDataSet(window[dataSetKey] || {});
}

function loadFloorDataScript(floorKey, onReady, onError) {
  const runtimeUtils = window.SAORuntimeUtils;
  if (!runtimeUtils || typeof runtimeUtils.loadTaggedScriptOnce !== "function") {
    console.warn("Compendium runtime utilities are unavailable.");
    onReady();
    return;
  }

  runtimeUtils.loadTaggedScriptOnce({
    cache: loadedCompendiumFloors,
    cacheKey: floorKey,
    tagAttribute: "data-ecompendium-floor",
    src: `ecompendium_${floorKey}.js`,
    onReady,
    onError
  });
}

function showCompendiumLoadError() {
  const status = document.getElementById("status");
  const list = document.getElementById("entryList");
  if (status) {
    status.textContent = t("page.ecompendium.loadError");
  }
  if (list) {
    list.replaceChildren(document.createElement("p"));
    list.firstChild.className = "empty-state";
    list.firstChild.textContent = t("page.ecompendium.loadUnavailable");
  }
}

function createEntryCard(entry) {
  registerEntryTranslations(entry);

  const card = document.createElement("div");
  card.className = "ecompendium-card";

  let html = "";

  html +=
    "<h2 class='ecompendium-name'>" +
    escapeHtml(getEntryText(entry, "name", t("page.ecompendium.unknownItem"))) +
    "</h2>";

  html += "<div class='ecompendium-meta'>";

  if (entry.rarity) {
    const rarityClass = getRarityClass(entry.rarity);
    html +=
      "<p><span>" +
      t("page.ecompendium.labels.rarity") +
      "</span><strong" +
      (rarityClass ? " class='" + rarityClass + "'" : "") +
      ">" +
      escapeHtml(localizeRuntimeText(entry.rarity)) +
      "</strong></p>";
  }

  if (entry.level) {
    html +=
      "<p><span>" + t("page.ecompendium.labels.level") + "</span><strong>" + escapeHtml(entry.level) + "</strong></p>";
  }

  if (entry.set) {
    html +=
      "<p><span>" +
      t("page.ecompendium.labels.set") +
      "</span><strong>" +
      escapeHtml(localizeRuntimeText(entry.set)) +
      "</strong></p>";
  }

  if (entry.craftingLocation) {
    html +=
      "<p><span>" +
      t("page.ecompendium.labels.craftedAt") +
      "</span><strong>" +
      escapeHtml(getEntryText(entry, "craftingLocation", entry.craftingLocation)) +
      "</strong></p>";
  }

  html += "</div>";

  if (entry.description) {
    html +=
      "<div class='equipment-section'>" +
      "<h4 class='equipment-section-title'>" +
      t("page.ecompendium.labels.description") +
      "</h4>" +
      "<p>" +
      escapeHtml(getEntryText(entry, "description", entry.description)) +
      "</p>" +
      "</div>";
  }

  if (entry.stats) {
    html +=
      "<div class='equipment-section'>" +
      "<h4 class='equipment-section-title'>" +
      t("page.ecompendium.labels.statistics") +
      "</h4>" +
      "<ul class='stat-list'>";

    for (const stat in entry.stats) {
      const statId = slugifyContentId(stat);
      const statLabel = content(`equipment.${getEntryId(entry)}.stat.${statId}`, stat);
      const localizedStatLabel = statLabel === stat ? localizeRuntimeText(stat) : statLabel;
      const statValue = localizeRuntimeText(entry.stats[stat]);
      html +=
        "<li>" +
        "<span>" +
        escapeHtml(localizedStatLabel) +
        "</span>" +
        "<strong>" +
        escapeHtml(statValue) +
        "</strong>" +
        "</li>";
    }

    html += "</ul></div>";
  }

  if ((entry.craftingResources && entry.craftingResources.length > 0) || entry.craftingNote) {
    html +=
      "<div class='equipment-section'>" +
      "<h4 class='equipment-section-title'>" +
      t("page.ecompendium.labels.resources") +
      "</h4>" +
      (entry.craftingNote ? "<p>" + escapeHtml(getEntryText(entry, "craftingNote", entry.craftingNote)) + "</p>" : "") +
      (entry.craftingResources && entry.craftingResources.length > 0 ? "<ul class='resource-list'>" : "");

    if (entry.craftingResources && entry.craftingResources.length > 0) {
      entry.craftingResources.forEach(function (resource) {
        html +=
          "<li>" +
          "<span>" +
          escapeHtml(getResourceText(entry, resource)) +
          "</span>" +
          "<strong>x" +
          escapeHtml(resource.amount) +
          "</strong>" +
          "</li>";
      });

      html += "</ul>";
    }

    html += "</div>";
  }

  card.innerHTML = html;

  return card;
}

let compendiumRenderToken = 0;

function renderEntries(entries, query) {
  const list = document.getElementById("entryList");
  const status = document.getElementById("status");

  if (!list || !status) {
    return;
  }

  const normalizedQuery = normalizeSearchText(query).trim();
  const safeEntries = Array.isArray(entries) ? entries : [];

  const filteredEntries = safeEntries.filter(function (entry) {
    const canonicalName = normalizeSearchText(entry.name);
    const localizedName = normalizeSearchText(getEntryText(entry, "name", entry.name || ""));
    return canonicalName.includes(normalizedQuery) || localizedName.includes(normalizedQuery);
  });

  status.textContent = t("page.ecompendium.statusShown", {
    visible: filteredEntries.length,
    total: safeEntries.length
  });

  if (filteredEntries.length === 0) {
    list.replaceChildren(document.createElement("p"));
    list.firstChild.className = "empty-state";
    list.firstChild.textContent = t("page.ecompendium.noEntriesFound");
    return;
  }

  const renderToken = ++compendiumRenderToken;
  list.replaceChildren();

  const batchSize = 24;
  let nextIndex = 0;

  function flushBatch() {
    if (renderToken !== compendiumRenderToken) {
      return;
    }

    const fragment = document.createDocumentFragment();
    const endIndex = Math.min(nextIndex + batchSize, filteredEntries.length);

    for (let index = nextIndex; index < endIndex; index += 1) {
      fragment.appendChild(createEntryCard(filteredEntries[index]));
    }

    list.appendChild(fragment);
    nextIndex = endIndex;

    if (nextIndex < filteredEntries.length) {
      requestAnimationFrame(flushBatch);
    }
  }

  requestAnimationFrame(flushBatch);
}

function initCompendiumRuntime() {
  const searchInput = document.getElementById("ecompendiumSearch");
  const listTitle = document.getElementById("listTitle");
  const tabButtons = Array.from(document.querySelectorAll(".list-tab"));
  const list = document.getElementById("entryList");

  if (!searchInput || !listTitle || !list) {
    return;
  }

  function focusTabByOffset(currentButton, offset) {
    const currentIndex = tabButtons.indexOf(currentButton);
    if (currentIndex < 0) {
      return;
    }

    const nextIndex = (currentIndex + offset + tabButtons.length) % tabButtons.length;
    tabButtons[nextIndex].focus();
  }

  window.SAOPageUtils?.attachSectionNavButtons?.(".nav", getRequestedFloor);

  let currentEntries = [];
  const floor = getRequestedFloor();
  let compendiumUiState = loadCompendiumUiState();
  const floorState = compendiumUiState[floor] || {};
  let activeCategory = floorState.category || "weapon";
  let renderRafId = null;

  function scheduleRenderEntries() {
    if (renderRafId !== null) {
      return;
    }

    renderRafId = window.requestAnimationFrame(function () {
      renderRafId = null;
      renderEntries(currentEntries, searchInput.value);
    });
  }

  function loadCategory(category) {
    activeCategory = category;
    compendiumUiState = {
      ...compendiumUiState,
      [floor]: {
        ...(compendiumUiState[floor] || {}),
        category
      }
    };
    saveCompendiumUiState(compendiumUiState);

    tabButtons.forEach(function (button) {
      const isActive = button.dataset.category === category;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("role", "tab");
      button.setAttribute("aria-controls", "entryList");
      button.setAttribute("aria-selected", isActive ? "true" : "false");
      button.setAttribute("tabindex", isActive ? "0" : "-1");
      button.textContent = getListTitle(button.dataset.category);
    });

    listTitle.textContent = getListTitle(category);

    const dataSet = getActiveDataSet();
    currentEntries = Array.isArray(dataSet[category]) ? dataSet[category] : [];

    currentEntries = currentEntries.slice().sort(function (a, b) {
      const levelA = typeof a.level === "number" ? a.level : 0;
      const levelB = typeof b.level === "number" ? b.level : 0;

      if (levelA !== levelB) {
        return levelA - levelB;
      }

      return (a.name || "").localeCompare(b.name || "");
    });

    renderEntries(currentEntries, searchInput.value);
  }

  searchInput.addEventListener("input", function () {
    compendiumUiState = {
      ...compendiumUiState,
      [floor]: {
        ...(compendiumUiState[floor] || {}),
        search: searchInput.value
      }
    };
    saveCompendiumUiState(compendiumUiState);
    scheduleRenderEntries();
  });

  tabButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      loadCategory(button.dataset.category);
    });

    button.addEventListener("keydown", function (event) {
      if (event.key === "ArrowRight") {
        event.preventDefault();
        focusTabByOffset(button, 1);
        return;
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        focusTabByOffset(button, -1);
        return;
      }

      if (event.key === "Home") {
        event.preventDefault();
        tabButtons[0].focus();
        return;
      }

      if (event.key === "End") {
        event.preventDefault();
        tabButtons[tabButtons.length - 1].focus();
        return;
      }

      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        loadCategory(button.dataset.category);
      }
    });
  });

  if (typeof floorState.search === "string") {
    searchInput.value = floorState.search;
  }

  if (!LIST_TITLES[activeCategory]) {
    activeCategory = "weapon";
  }

  loadCategory(activeCategory);

  document.addEventListener("sao:languagechange", function () {
    loadCategory(activeCategory);
  });
}

document.addEventListener("DOMContentLoaded", function () {
  try {
    const floorKey = getRequestedFloor();
    const floorDataKey = `FLOOR_${floorKey.replace("floor", "")}_DATA`;

    if (window.SAODatasets?.getDatasetFromLocation() === "current" || window[floorDataKey]) {
      initCompendiumRuntime();
      return;
    }

    loadFloorDataScript(floorKey, initCompendiumRuntime, showCompendiumLoadError);
  } catch (error) {
    console.error("Failed to initialize equipment compendium runtime.", error);
    showCompendiumLoadError();
  }
});
