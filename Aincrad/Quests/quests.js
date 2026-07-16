const DEFAULT_FLOOR = "floor1";
const params = new URLSearchParams(window.location.search);
const requestedFloor = params.get("floor");
const activeFloor = requestedFloor && /^floor[123]$/.test(requestedFloor)
  ? requestedFloor
  : DEFAULT_FLOOR;

const columns = [
  { key: "npcName", label: "NPC Name" },
  { key: "city", label: "City" },
  { key: "coordinates", label: "Cords" },
  { key: "requirements", label: "Requirements / Resources" },
  { key: "questName", label: "Quest Name" },
  { key: "xpReward", label: "XP" },
  { key: "colReward", label: "Col" },
  { key: "bonusItems", label: "Bonus Items" },
  { key: "completed", label: "Completed" }
];

const completedStorageKey = "sao.completedQuests";
const questsUiStateStorageKey = "sao.quests.uiState";
const SECTION_PATHS = {
  maps: "../Map/maps.html",
  bestiary: "../Bestiary/bestiary.html",
  equipment: "../eCompendium/ecompendium.html",
  quests: "../Quests/quests.html",
  patchnotes: "../Patchnotes/patchnotes.html"
};

const FLOOR_AWARE_SECTIONS = new Set(["maps", "bestiary", "equipment", "quests"]);

function getFloorLabel(floor) {
  return String(floor || DEFAULT_FLOOR).replace("floor", "Floor ");
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
  return [entry.npcName, entry.city, entry.coordinates, entry.questName].join("|");
}

function loadCompletedQuests() {
  try {
    const raw = getPersistentItem(completedStorageKey);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter(value => typeof value === "string"));
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

function buildSectionUrl(section, floor) {
  const path = SECTION_PATHS[section] || "#";
  if (path === "#") return path;
  if (!floor || !FLOOR_AWARE_SECTIONS.has(section)) return path;
  return `${path}?${new URLSearchParams({ floor }).toString()}`;
}

function attachSectionNavButtons() {
  const nav = document.querySelector(".nav");
  if (!nav) return;

  nav.addEventListener("click", event => {
    const button = event.target.closest("button[data-nav-target]");
    if (!button) return;
    window.location.href = buildSectionUrl(button.dataset.navTarget, activeFloor);
  });
}

function getQuestEntries() {
  const allEntries = window.QUEST_ENTRIES_BY_FLOOR || {};
  return Array.isArray(allEntries[activeFloor]) ? allEntries[activeFloor] : [];
}

function getCompletedCountForEntries(entries) {
  return entries.reduce((count, entry) => {
    return completedQuests.has(getQuestKey(entry)) ? count + 1 : count;
  }, 0);
}

function loadFloorDataScript(floorKey, onReady) {
  const floorScript = document.createElement("script");
  floorScript.src = `quests_${floorKey}.js`;
  floorScript.async = false;
  floorScript.addEventListener("load", onReady, { once: true });
  floorScript.addEventListener("error", onReady, { once: true });
  document.head.appendChild(floorScript);
}

function renderQuestTable(entries) {
  const root = document.getElementById("questTableRoot");
  if (!root) {
    return;
  }

  if (!entries.length) {
    const emptyState = document.createElement("p");
    emptyState.className = "empty-state";
    emptyState.textContent = "No quest entries to display.";
    root.replaceChildren(emptyState);
    return;
  }

  const table = document.createElement("table");
  table.className = "quest-table";

  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");
  columns.forEach(({ label }) => {
    const th = document.createElement("th");
    th.textContent = label;
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);

  const tbody = document.createElement("tbody");
  entries.forEach((entry) => {
    const row = document.createElement("tr");
    const questKey = getQuestKey(entry);
    const isCompleted = completedQuests.has(questKey);
    row.classList.toggle("is-completed", isCompleted);

    columns.forEach(({ key }) => {
      const cell = document.createElement("td");
      if (key === "completed") {
        const button = document.createElement("button");
        button.type = "button";
        button.className = `completion-button${isCompleted ? " is-completed" : ""}`;
        button.dataset.questKey = questKey;
        button.textContent = isCompleted ? "Completed" : "Mark Completed";
        cell.appendChild(button);
        row.appendChild(cell);
        return;
      }
      cell.textContent = entry[key];
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
  const titleSpan = document.querySelector(".quests-title span");
  const questUiState = loadQuestUiState();
  const savedSearchByFloor = questUiState.searchByFloor || {};
  const initialSearch = params.get("search") || params.get("npc") || params.get("q") || savedSearchByFloor[activeFloor] || "";
  const questEntries = getQuestEntries();
  let renderRafId = null;

  attachSectionNavButtons();

  if (titleSpan) {
    titleSpan.textContent = `Quests - ${getFloorLabel(activeFloor)}`;
  }

  function scheduleRenderFilteredQuests() {
    if (renderRafId !== null) return;
    renderRafId = window.requestAnimationFrame(() => {
      renderRafId = null;
      renderFilteredQuests();
    });
  }

  function renderFilteredQuests() {
    const query = questSearch ? questSearch.value.trim().toLowerCase() : "";
    const visibleEntries = query
      ? questEntries.filter(entry =>
          columns.some(({ key }) => key !== "completed" && String(entry[key]).toLowerCase().includes(query))
        )
      : questEntries;
    const completedCount = getCompletedCountForEntries(questEntries);

    if (status) {
      if (questEntries.length === 0) {
        status.textContent = `No quest data has been added for ${getFloorLabel(activeFloor)} yet.`;
      } else if (visibleEntries.length === 0 && query) {
        status.textContent = `No quest entries match your search on ${getFloorLabel(activeFloor)}. ${completedCount} completed.`;
      } else {
        status.textContent = `${visibleEntries.length} of ${questEntries.length} quest entries shown for ${getFloorLabel(activeFloor)}. ${completedCount} completed.`;
      }
    }

    if (questEntries.length === 0) {
      const root = document.getElementById("questTableRoot");
      if (root) {
        const emptyState = document.createElement("p");
        emptyState.className = "empty-state";
        emptyState.textContent = `No quest data has been added for ${getFloorLabel(activeFloor)} yet.`;
        root.replaceChildren(emptyState);
      }
      return;
    }

    if (visibleEntries.length === 0) {
      const root = document.getElementById("questTableRoot");
      if (root) {
        const emptyState = document.createElement("p");
        emptyState.className = "empty-state";
        emptyState.textContent = "No quest entries match your current search.";
        root.replaceChildren(emptyState);
      }
      return;
    }

    renderQuestTable(visibleEntries);
  }

  if (status) {
    status.textContent = `${questEntries.length} quest entries loaded for ${activeFloor}.`;
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

  if (questTableRoot) {
    questTableRoot.addEventListener("click", event => {
      const button = event.target.closest("button[data-quest-key]");
      if (!button) return;

      const questKey = button.dataset.questKey;
      if (!questKey) return;

      const nextState = !completedQuests.has(questKey);
      setQuestCompleted(completedQuests, questKey, nextState);
      renderFilteredQuests();
    });
  }

  renderFilteredQuests();
}

document.addEventListener("DOMContentLoaded", () => {
  if (Array.isArray((window.QUEST_ENTRIES_BY_FLOOR || {})[activeFloor])) {
    initQuestsRuntime();
    return;
  }

  loadFloorDataScript(activeFloor, initQuestsRuntime);
});
