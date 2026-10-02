const DEFAULT_FLOOR = "floor1";
const i18n = window.SAOI18n || null;
const { t, content } = window.SAOPageHelpers.createTranslators(i18n);
const params = new URLSearchParams(window.location.search);
const requestedFloor = params.get("floor");
const activeFloor = requestedFloor && /^floor[123]$/.test(requestedFloor) ? requestedFloor : DEFAULT_FLOOR;

const columns = [
  { key: "npcName", labelKey: "page.quests.tableCols.npcName", label: "NPC Name" },
  { key: "city", labelKey: "page.quests.tableCols.city", label: "City" },
  { key: "coordinates", labelKey: "page.quests.tableCols.coordinates", label: "Cords" },
  { key: "requirements", labelKey: "page.quests.tableCols.requirements", label: "Requirements / Resources" },
  { key: "questName", labelKey: "page.quests.tableCols.questName", label: "Quest Name" },
  { key: "xpReward", labelKey: "page.quests.tableCols.xpReward", label: "XP" },
  { key: "colReward", labelKey: "page.quests.tableCols.colReward", label: "Col" },
  { key: "bonusItems", labelKey: "page.quests.tableCols.bonusItems", label: "Bonus Items" },
  { key: "completed", labelKey: "page.quests.tableCols.completed", label: "Completed" }
];

const QUEST_TYPES = Object.freeze({
  main: "main",
  side: "side"
});

const completedStorageKey = "sao.completedQuests";
const questsUiStateStorageKey = "sao.quests.uiState";

function getFloorLabel(floor) {
  /* Mirrors the map page: the word for "floor" comes from the localization layer so the label
     reads "Floor 1" / "Piso 1" / "Étage 1" instead of a hard-coded English word. */
  const floorWord = t("page.quests.floorText") || "Floor";
  return String(floor || DEFAULT_FLOOR).replace("floor", `${floorWord} `);
}

const { slugifyContentId } = window.SAOPageHelpers;

const { escapeHtml } = window.SAOPageHelpers;

function getQuestId(entry) {
  if (entry.id) return String(entry.id);
  return slugifyContentId([entry.npcName, entry.city, entry.coordinates, entry.questName].join("-"));
}

function getQuestText(entry, field) {
  const value = entry[field];
  const translated = content(`quest.${getQuestId(entry)}.${field}`, value);
  if (["requirements", "bonusItems"].includes(field)) {
    return window.SAOContentTranslations?.translateKnownTerms?.(translated, i18n?.getLanguage?.()) || translated;
  }
  return translated;
}

function getQuestType(entry) {
  const rawType = entry.questType ?? entry.type ?? entry.category;
  const normalizedType = String(rawType || "")
    .trim()
    .toLowerCase();
  if (normalizedType.includes("main")) return QUEST_TYPES.main;
  if (normalizedType.includes("side")) return QUEST_TYPES.side;
  return QUEST_TYPES.side;
}

function getPersistentItem(key) {
  if (window.SAOStorage && typeof window.SAOStorage.getItem === "function") {
    return window.SAOStorage.getItem(key);
  }
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function setPersistentItem(key, value) {
  if (window.SAOStorage && typeof window.SAOStorage.setItem === "function") {
    window.SAOStorage.setItem(key, value);
    return;
  }
  try {
    localStorage.setItem(key, value);
  } catch {
    // Keep quests usable even if storage is blocked.
  }
}

function loadQuestUiState() {
  try {
    const raw = getPersistentItem(questsUiStateStorageKey);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return {};
    return parsed;
  } catch {
    return {};
  }
}

function saveQuestUiState(nextState) {
  setPersistentItem(questsUiStateStorageKey, JSON.stringify(nextState));
}

const completedQuests = loadCompletedQuests();

function getQuestKey(entry) {
  const dataset = window.SAODatasets?.getDatasetFromLocation() || "beta";
  return [dataset, getQuestId(entry)].join("|");
}

function getLegacyQuestKey(entry) {
  return [entry.npcName, entry.city, entry.coordinates, entry.questName].join("|");
}

function isQuestCompleted(entry) {
  return completedQuests.has(getQuestKey(entry)) || completedQuests.has(getLegacyQuestKey(entry));
}

function loadCompletedQuests() {
  try {
    const raw = getPersistentItem(completedStorageKey);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((value) => typeof value === "string"));
  } catch {
    return new Set();
  }
}

function saveCompletedQuests(completedQuests) {
  setPersistentItem(completedStorageKey, JSON.stringify(Array.from(completedQuests)));
}

function setQuestCompleted(completedQuests, questKey, isCompleted) {
  if (isCompleted) {
    completedQuests.add(questKey);
  } else {
    completedQuests.delete(questKey);
  }
  saveCompletedQuests(completedQuests);
}

function attachSectionNavButtons() {
  window.SAOPageUtils.attachSectionNavButtons(".nav", () => activeFloor);
}

function getQuestEntries() {
  const registerEntries = (entries) => {
    entries.forEach((entry) => window.SAOContentTranslations?.registerQuestEntry?.(entry, slugifyContentId));
    return entries;
  };
  if (window.SAODatasets?.getDatasetFromLocation() === "current") {
    const currentEntries = window.SAO_CURRENT_QUEST_ENTRIES_BY_FLOOR || {};
    return registerEntries(Array.isArray(currentEntries[activeFloor]) ? currentEntries[activeFloor] : []);
  }

  const allEntries = window.QUEST_ENTRIES_BY_FLOOR || {};
  return registerEntries(Array.isArray(allEntries[activeFloor]) ? allEntries[activeFloor] : []);
}

function getCompletedCountForEntries(entries) {
  return entries.reduce((count, entry) => {
    return isQuestCompleted(entry) ? count + 1 : count;
  }, 0);
}

/* Floor data scripts load through the shared tagged-script loader (the same path
   the Bestiary and Compendium use) so a repeated call cannot double-inject the
   same floor and the injected tag stays inspectable. The loader falls back to
   onReady when the runtime helper is missing or the script fails, matching the
   previous "always proceed" behaviour. */
const loadedQuestFloors = new Set();

function loadFloorDataScript(floorKey, onReady) {
  const runtimeUtils = window.SAORuntimeUtils;
  if (!runtimeUtils || typeof runtimeUtils.loadTaggedScriptOnce !== "function") {
    onReady();
    return;
  }

  runtimeUtils.loadTaggedScriptOnce({
    cache: loadedQuestFloors,
    cacheKey: floorKey,
    tagAttribute: "data-quests-floor",
    src: `quests_${floorKey}.js`,
    onReady
  });
}

function renderQuestTable(entries) {
  const root = document.getElementById("questTableRoot");
  if (!root) {
    return;
  }

  if (!entries.length) {
    const emptyState = document.createElement("p");
    emptyState.className = "empty-state";
    emptyState.textContent = t("page.quests.emptyState");
    root.replaceChildren(emptyState);
    return;
  }

  const table = document.createElement("table");
  table.className = "quest-table";

  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");
  columns.forEach(({ label, labelKey }) => {
    const th = document.createElement("th");
    th.textContent = t(labelKey, null) || label;
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);

  const tbody = document.createElement("tbody");
  entries.forEach((entry) => {
    const row = document.createElement("tr");
    const questKey = getQuestKey(entry);
    const isCompleted = isQuestCompleted(entry);
    row.classList.toggle("is-completed", isCompleted);

    columns.forEach(({ key, label, labelKey }) => {
      const cell = document.createElement("td");
      cell.classList.add(key);
      /* The mobile layout renders the table as labelled cards, so each cell carries its own
         localized column name instead of relying on the (hidden) table header. */
      cell.dataset.label = t(labelKey, null) || label;
      if (key === "completed") {
        const button = document.createElement("button");
        button.type = "button";
        button.className = `completion-button${isCompleted ? " is-completed" : ""}`;
        button.dataset.questKey = questKey;
        button.textContent = isCompleted ? t("page.quests.completed") : t("page.quests.markCompleted");
        cell.appendChild(button);
        row.appendChild(cell);
        return;
      }
      if (key === "questName" && entry.questNumber) {
        const numberBadge = document.createElement("span");
        numberBadge.className = "quest-number";
        numberBadge.textContent = String(entry.questNumber);
        numberBadge.setAttribute("aria-label", t("page.quests.questNumber", { number: entry.questNumber }));
        cell.append(numberBadge, document.createTextNode(getQuestText(entry, key)));
        row.appendChild(cell);
        return;
      }
      cell.textContent = getQuestText(entry, key);
      row.appendChild(cell);
    });
    tbody.appendChild(row);
  });

  table.append(thead, tbody);
  root.replaceChildren(table);
}

function initQuestsRuntime() {
  const status = document.getElementById("status");
  const questSearch = document.getElementById("questSearch");
  const questTableRoot = document.getElementById("questTableRoot");
  const cityFilter = document.getElementById("questCityFilter");
  const completionFilter = document.getElementById("questCompletionFilter");
  const titleSpan = document.querySelector(".quests-title span");
  const questUiState = loadQuestUiState();
  const savedSearchByFloor = questUiState.searchByFloor || {};
  const savedQuestTypeByFloor = questUiState.questTypeByFloor || {};
  const savedCityByFloor = questUiState.cityByFloor || {};
  const savedCompletionByFloor = questUiState.completionByFloor || {};
  const initialSearch =
    params.get("search") || params.get("npc") || params.get("q") || savedSearchByFloor[activeFloor] || "";
  const questEntries = getQuestEntries();
  let activeQuestType = savedQuestTypeByFloor[activeFloor] === QUEST_TYPES.main ? QUEST_TYPES.main : QUEST_TYPES.side;
  let activeCity = savedCityByFloor[activeFloor] || "";
  let activeCompletion = savedCompletionByFloor[activeFloor] || "";
  let renderRafId = null;

  /* Current Data carries the Main Questline, Beta-Test Data carries side quests only.
     If the remembered quest type has no entries but the other type does, follow the data
     so the table never opens on an empty tab. */
  const hasMainEntries = questEntries.some((entry) => getQuestType(entry) === QUEST_TYPES.main);
  const hasSideEntries = questEntries.some((entry) => getQuestType(entry) === QUEST_TYPES.side);
  if (activeQuestType === QUEST_TYPES.main && !hasMainEntries && hasSideEntries) {
    activeQuestType = QUEST_TYPES.side;
  } else if (activeQuestType === QUEST_TYPES.side && !hasSideEntries && hasMainEntries) {
    activeQuestType = QUEST_TYPES.main;
  }

  attachSectionNavButtons();

  if (titleSpan) {
    titleSpan.textContent = t("page.quests.titleWithFloor", { floor: getFloorLabel(activeFloor) });
  }

  function scheduleRenderFilteredQuests() {
    if (renderRafId !== null) return;
    renderRafId = window.requestAnimationFrame(() => {
      renderRafId = null;
      renderFilteredQuests();
    });
  }

  function updateQuestTypeButtons() {
    document.querySelectorAll(".quest-type-button[data-quest-type]").forEach((button) => {
      const isActive = button.dataset.questType === activeQuestType;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });
  }

  function renderFilteredQuests() {
    const query = questSearch ? questSearch.value.trim().toLowerCase() : "";
    const typeEntries = questEntries.filter((entry) => getQuestType(entry) === activeQuestType);
    const cityEntries = activeCity
      ? typeEntries.filter((entry) => String(getQuestText(entry, "city")) === activeCity)
      : typeEntries;
    const completionEntries = activeCompletion
      ? cityEntries.filter((entry) =>
          activeCompletion === "completed" ? isQuestCompleted(entry) : !isQuestCompleted(entry)
        )
      : cityEntries;
    const visibleEntries = query
      ? completionEntries.filter((entry) =>
          columns.some(
            ({ key }) =>
              key !== "completed" &&
              (String(entry[key]).toLowerCase().includes(query) ||
                String(getQuestText(entry, key)).toLowerCase().includes(query))
          )
        )
      : completionEntries;
    const completedCount = getCompletedCountForEntries(typeEntries);

    if (status) {
      if (questEntries.length === 0) {
        status.textContent = t("page.quests.noQuestData", { floor: getFloorLabel(activeFloor) });
      } else if (visibleEntries.length === 0 && (query || activeCity || activeCompletion)) {
        status.textContent = t("page.quests.noQuestMatchFloor", {
          floor: getFloorLabel(activeFloor),
          completed: completedCount
        });
      } else {
        status.textContent = t("page.quests.shownStatus", {
          visible: visibleEntries.length,
          total: typeEntries.length,
          floor: getFloorLabel(activeFloor),
          completed: completedCount
        });
      }
    }

    if (questEntries.length === 0) {
      const root = document.getElementById("questTableRoot");
      if (root) {
        const emptyState = document.createElement("p");
        emptyState.className = "empty-state";
        emptyState.textContent = t("page.quests.noQuestData", { floor: getFloorLabel(activeFloor) });
        root.replaceChildren(emptyState);
      }
      return;
    }

    if (visibleEntries.length === 0) {
      const root = document.getElementById("questTableRoot");
      if (root) {
        const emptyState = document.createElement("p");
        emptyState.className = "empty-state";
        emptyState.textContent = t("page.quests.noFilterMatch");
        root.replaceChildren(emptyState);
      }
      return;
    }

    renderQuestTable(visibleEntries);
  }

  /* City options come straight from the loaded quest data. Placeholder values such as "N/A"
     are kept out so they never appear as a selectable city. */
  function populateCityFilter() {
    if (!cityFilter) return;
    const cities = [
      ...new Set(
        questEntries
          .map((entry) => String(getQuestText(entry, "city")).trim())
          .filter((city) => city && !/^n\/?a$/i.test(city))
      )
    ].sort((a, b) => a.localeCompare(b));
    const previousValue = activeCity;
    const options = [`<option value="">${escapeHtml(t("page.quests.allCities"))}</option>`].concat(
      cities.map((city) => `<option value="${escapeHtml(city)}">${escapeHtml(city)}</option>`)
    );
    cityFilter.innerHTML = options.join("");
    activeCity = cities.includes(previousValue) ? previousValue : "";
    cityFilter.value = activeCity;
  }

  function saveFilterState() {
    const nextUiState = loadQuestUiState();
    saveQuestUiState({
      ...nextUiState,
      cityByFloor: { ...(nextUiState.cityByFloor || {}), [activeFloor]: activeCity },
      completionByFloor: { ...(nextUiState.completionByFloor || {}), [activeFloor]: activeCompletion }
    });
  }

  if (status) {
    status.textContent = t("page.quests.loadedStatus", {
      count: questEntries.length,
      floor: getFloorLabel(activeFloor)
    });
  }

  if (questSearch) {
    if (initialSearch) {
      questSearch.value = initialSearch;
    }
    questSearch.addEventListener("input", () => {
      const nextUiState = loadQuestUiState();
      const nextSearchByFloor = {
        ...(nextUiState.searchByFloor || {}),
        [activeFloor]: questSearch.value
      };
      saveQuestUiState({ ...nextUiState, searchByFloor: nextSearchByFloor });
      scheduleRenderFilteredQuests();
    });
  }

  document.querySelectorAll(".quest-type-button[data-quest-type]").forEach((button) => {
    button.addEventListener("click", () => {
      const nextType = button.dataset.questType;
      if (!Object.values(QUEST_TYPES).includes(nextType)) return;
      activeQuestType = nextType;
      const nextUiState = loadQuestUiState();
      const nextQuestTypeByFloor = {
        ...(nextUiState.questTypeByFloor || {}),
        [activeFloor]: activeQuestType
      };
      saveQuestUiState({ ...nextUiState, questTypeByFloor: nextQuestTypeByFloor });
      updateQuestTypeButtons();
      renderFilteredQuests();
    });
  });

  updateQuestTypeButtons();

  populateCityFilter();
  if (completionFilter) {
    completionFilter.value = activeCompletion;
    completionFilter.addEventListener("change", () => {
      activeCompletion = completionFilter.value;
      saveFilterState();
      renderFilteredQuests();
    });
  }
  if (cityFilter) {
    cityFilter.addEventListener("change", () => {
      activeCity = cityFilter.value;
      saveFilterState();
      renderFilteredQuests();
    });
  }

  if (questTableRoot) {
    questTableRoot.addEventListener("click", (event) => {
      const button = event.target.closest("button[data-quest-key]");
      if (!button) return;

      const questKey = button.dataset.questKey;
      if (!questKey) return;

      const entry = questEntries.find((candidate) => getQuestKey(candidate) === questKey);
      const nextState = entry ? !isQuestCompleted(entry) : !completedQuests.has(questKey);
      setQuestCompleted(completedQuests, questKey, nextState);
      if (!nextState) {
        if (entry) completedQuests.delete(getLegacyQuestKey(entry));
        saveCompletedQuests(completedQuests);
      }
      renderFilteredQuests();
    });
  }

  renderFilteredQuests();

  document.addEventListener("sao:languagechange", () => {
    populateCityFilter();
    renderFilteredQuests();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  if (window.SAODatasets?.getDatasetFromLocation() === "current") {
    initQuestsRuntime();
    return;
  }

  if (Array.isArray((window.QUEST_ENTRIES_BY_FLOOR || {})[activeFloor])) {
    initQuestsRuntime();
    return;
  }

  loadFloorDataScript(activeFloor, initQuestsRuntime);
});
