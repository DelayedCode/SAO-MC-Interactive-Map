function getMobDataSources() {
  if (window.SAODatasets?.getDatasetFromLocation() === "current") {
    return (
      window.SAO_CURRENT_BESTIARY_DATA?.[getRequestedFloor()] || {
        regular: "",
        boss: "",
        dungeonMobs: "",
        dungeonBoss: ""
      }
    );
  }

  return Object.freeze({
    regular: window.REGULAR_MOB_DATA || "",
    boss: window.BOSS_MOB_DATA || "",
    dungeonMobs: window.DUNGEON_MOB_DATA || "",
    dungeonBoss: window.DUNGEON_BOSS_MOB_DATA || ""
  });
}

const i18n = window.SAOI18n || null;
const { t, content } = window.SAOPageHelpers.createTranslators(i18n);
const loadedBestiaryFloors = new Set();

const bestiaryUiStateStorageKey = "sao.bestiary.uiState";
const storage = window.SAOPageHelpers.getStorage();

function loadBestiaryUiState() {
  const parsed = storage.getJSON(bestiaryUiStateStorageKey, {});
  return parsed && typeof parsed === "object" ? parsed : {};
}

function saveBestiaryUiState(nextState) {
  storage.setJSON(bestiaryUiStateStorageKey, nextState);
}

function parseDropToken(token) {
  const cleaned = token.trim();
  const groups = [...cleaned.matchAll(/\(([^)]+)\)/g)].map((match) => match[1].trim());
  const notes = [];
  let chance = null;

  const explicitChanceMatch = cleaned.match(/(\d+(?:\.\d+)?)%/);
  if (explicitChanceMatch) {
    chance = Number(explicitChanceMatch[1]);
  }

  groups.forEach((group) => {
    const chanceMatch = group.match(/^(\d+(?:\.\d+)?)%$/);
    if (chanceMatch) {
      chance = Number(chanceMatch[1]);
      return;
    }
    notes.push(group);
  });

  let item = cleaned
    .replace(/\([^)]*\)/g, "")
    .replace(/\d+(?:\.\d+)?%/g, "")
    .trim();
  if (!item) item = "N/A";

  return {
    item,
    id: slugifyContentId(item),
    chance,
    notesText: notes.length ? ` (${notes.join(", ")})` : ""
  };
}

/* Bestiary ids fall back to "n-a" instead of the project-wide "unknown" token. */
const slugifyContentId = (value) => window.SAOPageHelpers.slugifyContentId(value, "n-a");

function buildMobList(rawData) {
  return String(rawData || "")
    .trim()
    .split("\n")
    .map((line) => line.split("\t"))
    .filter((parts) => parts.length >= 3)
    .map(([name, dropsRaw, xpRaw]) => {
      const mob = {
        name: name.trim(),
        id: slugifyContentId(name),
        xp: (xpRaw || "").trim() || "N/A",
        drops: (dropsRaw || "").split(",").map(parseDropToken)
      };
      const contentRegistry = window.SAOContentTranslations;
      if (contentRegistry?.register) {
        const mobKey = `bestiary.mob.${mob.id}`;
        contentRegistry.register(
          mobKey,
          mob.name,
          contentRegistry.es[mobKey] || mob.name,
          contentRegistry.fr[mobKey] || mob.name
        );
        mob.drops.forEach((drop) => {
          const dropKey = `bestiary.item.${drop.id}`;
          contentRegistry.register(
            dropKey,
            drop.item,
            contentRegistry.es[dropKey] || contentRegistry.translateKnownTerms?.(drop.item, "es") || drop.item,
            contentRegistry.fr[dropKey] || contentRegistry.translateKnownTerms?.(drop.item, "fr") || drop.item
          );
        });
      }
      return mob;
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

let MOB_GROUPS = Object.freeze({
  boss: [],
  regular: [],
  dungeonBoss: [],
  dungeonMobs: []
});

function refreshMobGroups() {
  const sources = getMobDataSources();
  MOB_GROUPS = Object.freeze({
    boss: buildMobList(sources.boss),
    regular: buildMobList(sources.regular),
    dungeonBoss: buildMobList(sources.dungeonBoss),
    dungeonMobs: buildMobList(sources.dungeonMobs)
  });
}

const LIST_TITLES = {
  boss: "page.bestiary.listTitleBoss",
  regular: "page.bestiary.listTitleRegular",
  dungeonBoss: "page.bestiary.listTitleDungeonBoss",
  dungeonMobs: "page.bestiary.listTitleDungeonMobs"
};

const STATUS_KEYS = {
  boss: "page.bestiary.statusShownBoss",
  regular: "page.bestiary.statusShownRegular",
  dungeonBoss: "page.bestiary.statusShownDungeonBoss",
  dungeonMobs: "page.bestiary.statusShownDungeonMobs"
};

function getListTitle(category) {
  return t(LIST_TITLES[category] || "page.bestiary.heading");
}

function getStatusKey(category) {
  return STATUS_KEYS[category] || "page.bestiary.statusShown";
}

const AGGRESSIVENESS_BY_NAME = {
  "Corrupted Boar": "Aggressive",
  "Corrupted Pumba": "Neutral",
  Albal: "Neutral",
  "Colossal Guardian": "Aggressive",
  Gorbel: "Aggressive",
  "Ice Bear": "Aggressive",
  Nymbréa: "Aggressive",
  "Illfang the Kobold Lord": "Aggressive",
  Kazor: "Aggressive",
  "Sinister White Wolf": "Neutral",
  "Sinister Black Wolf": "Neutral",
  "Mini Treant": "Aggressive",
  "Treant Warrior": "Aggressive",
  "Sylvan Mage": "Aggressive",
  "Elite Treant": "Aggressive",
  "Small Slime": "Aggressive",
  "Slime Warrior": "Aggressive",
  "Healer Slime": "Passive",
  "Mage Slime": "Aggressive",
  "Skeleton Swordsman": "Aggressive",
  "Skeleton Warrior": "Aggressive",
  "Skeleton Halberdier": "Aggressive",
  "Skeleton Archer": "Aggressive",
  "Skeleton Tank": "Aggressive",
  "Skeleton Sorcerer": "Aggressive",
  "Bandit Archer": "Aggressive",
  "Bandit Assassin": "Aggressive",
  "Sturdy Bandit": "Aggressive",
  Nephentes: "Aggressive",
  "Shark Fish": "Aggressive",
  "Forest Spider": "Aggressive",
  "Ice Spirit": "Aggressive",
  "Ice Golem": "Aggressive",
  "Mountain Deer": "Aggressive",
  Ika: "Aggressive",
  "Small Kobold": "Aggressive",
  "The Mischievous Archer": "Aggressive",
  "Kobold Warrior": "Aggressive",
  "Kobold Lancer": "Aggressive",
  "Kobold Sorcerer": "Aggressive",
  "Kobold Sentinel (Minion)": "Aggressive",
  "Treant of the Forest": "Aggressive",
  "Forest-Bane Treant": "Aggressive",
  "Devouring Plant": "Aggressive",
  "Forest Brute": "Aggressive",
  "Fallen Soldier": "Aggressive",
  "Fallen Warrior": "Aggressive",
  "Hunting Spider": "Aggressive",
  "Venomous Spider": "Aggressive",
  "Strangler Spider": "Aggressive",
  Vyrmos: "Aggressive",
  Tornak: "Aggressive",
  "Narax the Cursed Skeleton": "Aggressive",
  Nasgul: "Aggressive",
  "Fallen Guardian": "Aggressive",
  "Fallen Herald": "Aggressive",
  "Fallen Reaper": "Aggressive",
  "Ornstein, Fallen Devastator": "Aggressive",
  "Smough, Fallen Devastator": "Aggressive",
  Pricilia: "Aggressive",
  Yula: "Aggressive",
  Jira: "Aggressive",
  Kamilia: "Aggressive",
  "Monstrous Bull": "Aggressive",
  Taurus: "Aggressive",
  "Forest Bear": "Neutral",
  "Winnie, Man's Best Friend": "Neutral",
  "Mountain Wolf": "Neutral",
  "Savanes Wolf": "Neutral",
  Worker: "Aggressive",
  Dardroyal: "Aggressive",
  "Melisara, Ruler of the Hive": "Aggressive",
  "Fire Harpy": "Aggressive",
  "Earthy Harpy": "Aggressive",
  "Lightning Harpy": "Aggressive",
  "Dazzling Fish": "Aggressive",
  "Sanctuary Skeleton Archer": "Aggressive",
  "Sanctuary Skeleton Shaman": "Aggressive",
  "Sanctuary Skeleton Warrior": "Aggressive",
  "Guardian of the Sanctuary": "Aggressive",
  "Guardian Minion": "Aggressive",
  "Golem of Peter": "Aggressive",
  "Magnus, Colossus of the Veins": "Aggressive",
  "Velindra Weaver": "Aggressive",
  "Fire Archer Skeleton": "Aggressive",
  "Fire Wizard Skeleton": "Aggressive",
  "Fire Tank Skeleton": "Aggressive",
  "Fire Lancer Skeleton": "Aggressive",
  "Fire Skeleton": "Aggressive",
  "Fire Swordsman Skeleton": "Aggressive",
  "Skeleton Soul": "Aggressive",
  "Undead Brute": "Aggressive",
  "Undead Gargoyle": "Aggressive",
  "Morverth the Soul Flayer": "Aggressive",
  "Rugiboeuf, The Guardian": "Aggressive",
  "Warrior Sand Skeleton": "Aggressive",
  "Skeleton of the Archer Sands": "Aggressive",
  Guardian: "Aggressive"
};

function getAggressivenessClass(value) {
  if (value === "Neutral") return "neutral";
  if (value === "Passive") return "passive";
  return "aggressive";
}

function getAggressivenessLabel(value) {
  if (value === "Neutral") return t("page.bestiary.neutral");
  if (value === "Passive") return t("page.bestiary.passive");
  return t("page.bestiary.aggressive");
}

function createDropList(drops) {
  const list = document.createElement("ul");
  list.className = "drop-list";

  const sortedDrops = [...drops].sort((a, b) => {
    const aChance = a.chance ?? -1;
    const bChance = b.chance ?? -1;
    return bChance - aChance;
  });

  sortedDrops.forEach((drop) => {
    const row = document.createElement("li");
    const itemText = document.createElement("span");
    const itemLabel = content(`bestiary.item.${drop.id}`, drop.item);
    itemText.textContent = `${itemLabel}${drop.notesText}`;

    const chanceText = document.createElement("strong");
    chanceText.textContent = drop.chance !== null ? `${drop.chance}%` : t("page.bestiary.na");

    row.append(itemText, chanceText);
    list.appendChild(row);
  });

  return list;
}

function createMobCard(mob) {
  const card = document.createElement("article");
  card.className = "mob-card";
  const aggressiveness = AGGRESSIVENESS_BY_NAME[mob.name] || "Aggressive";
  const normalizedAggression = String(aggressiveness).toLowerCase();

  const title = document.createElement("h2");
  title.className = "mob-name";
  title.textContent = content(`bestiary.mob.${mob.id}`, mob.name);

  const meta = document.createElement("div");
  meta.className = "mob-meta";
  const aggressivenessRow = document.createElement("p");
  const aggressivenessLabel = document.createElement("span");
  aggressivenessLabel.textContent = t("page.bestiary.aggressiveness");
  const aggressivenessValue = document.createElement("strong");
  aggressivenessValue.className = `${getAggressivenessClass(aggressiveness)} mob-aggressive-${normalizedAggression}`;
  aggressivenessValue.textContent = getAggressivenessLabel(aggressiveness);
  aggressivenessRow.append(aggressivenessLabel, aggressivenessValue);

  const xpRow = document.createElement("p");
  const xpLabel = document.createElement("span");
  xpLabel.textContent = t("page.bestiary.xp");
  const xpValue = document.createElement("strong");
  xpValue.textContent = mob.xp;
  xpRow.append(xpLabel, xpValue);

  meta.append(aggressivenessRow, xpRow);

  const dropsTitle = document.createElement("h3");
  dropsTitle.className = "drops-title";
  dropsTitle.textContent = t("page.bestiary.drops");

  card.append(title, meta, dropsTitle, createDropList(mob.drops));
  return card;
}

const DEFAULT_BESTIARY_FLOOR = "floor1";

const getRequestedFloor = () => window.SAOPageHelpers.getRequestedFloor(DEFAULT_BESTIARY_FLOOR);

function loadFloorMobData(floorKey, onReady, onError) {
  const runtimeUtils = window.SAORuntimeUtils;
  if (!runtimeUtils || typeof runtimeUtils.loadTaggedScriptOnce !== "function") {
    console.warn("Bestiary runtime utilities are unavailable.");
    onReady();
    return;
  }

  runtimeUtils.loadTaggedScriptOnce({
    cache: loadedBestiaryFloors,
    cacheKey: floorKey,
    tagAttribute: "data-bestiary-floor",
    src: `bestiary_${floorKey}.js`,
    onReady,
    onError
  });
}

function showBestiaryLoadError() {
  const status = document.getElementById("status");
  const mobList = document.getElementById("mobList");
  if (status) {
    status.textContent = t("page.bestiary.loadError");
  }
  if (mobList) {
    mobList.innerHTML = `<p class='empty-state'>${t("page.bestiary.loadUnavailable")}</p>`;
  }
}

function initBestiaryRuntime() {
  refreshMobGroups();
  window.SAOPageUtils?.attachSectionNavButtons?.(".nav", getRequestedFloor);

  const status = document.getElementById("status");
  const mobList = document.getElementById("mobList");
  const mobSearch = document.getElementById("mobSearch");
  const listTitle = document.getElementById("listTitle");
  const tabButtons = document.querySelectorAll(".list-tab[data-category]");
  const params = new URLSearchParams(window.location.search);
  const requestedCategory = params.get("category");
  const requestedSearch = params.get("search") || params.get("q") || "";
  const floor = getRequestedFloor();
  let bestiaryUiState = loadBestiaryUiState();
  const floorState = bestiaryUiState[floor] || {};

  if (!status || !mobList || !mobSearch || !listTitle || !tabButtons.length) return;

  function focusTabByOffset(currentButton, offset) {
    const tabs = Array.from(tabButtons);
    const currentIndex = tabs.indexOf(currentButton);
    if (currentIndex < 0) return;
    const nextIndex = (currentIndex + offset + tabs.length) % tabs.length;
    tabs[nextIndex].focus();
  }

  function applyLocalizedTabLabels() {
    tabButtons.forEach((button) => {
      button.textContent = getListTitle(button.dataset.category);
      button.setAttribute("role", "tab");
      button.setAttribute("aria-controls", "mobList");
      button.setAttribute("tabindex", button.classList.contains("is-active") ? "0" : "-1");
      button.setAttribute("aria-selected", button.classList.contains("is-active") ? "true" : "false");
    });
  }

  applyLocalizedTabLabels();

  let activeCategory = "regular";
  if (floorState.category && MOB_GROUPS[floorState.category]) {
    activeCategory = floorState.category;
  }
  if (requestedCategory && MOB_GROUPS[requestedCategory]) {
    activeCategory = requestedCategory;
  }
  const hashCategory = (window.location.hash || "").replace(/^#/, "");
  if (hashCategory && MOB_GROUPS[hashCategory]) {
    activeCategory = hashCategory;
  }
  let renderRafId = null;

  function scheduleRenderMobs() {
    if (renderRafId !== null) return;
    renderRafId = window.requestAnimationFrame(() => {
      renderRafId = null;
      renderMobs();
    });
  }

  function setActiveTab(category) {
    activeCategory = category;
    bestiaryUiState = {
      ...bestiaryUiState,
      [floor]: {
        ...(bestiaryUiState[floor] || {}),
        category
      }
    };
    saveBestiaryUiState(bestiaryUiState);
    tabButtons.forEach((button) => {
      button.classList.toggle("is-active", button.dataset.category === category);
      const isActive = button.dataset.category === category;
      button.setAttribute("aria-selected", isActive ? "true" : "false");
      button.setAttribute("tabindex", isActive ? "0" : "-1");
    });
    listTitle.textContent = getListTitle(category);
    renderMobs();
  }

  function renderMobs() {
    const activeMobs = MOB_GROUPS[activeCategory] || [];
    const query = mobSearch.value.trim().toLowerCase();
    const visibleMobs = query
      ? activeMobs.filter((mob) => {
          const localizedName = content(`bestiary.mob.${mob.id}`, mob.name).toLowerCase();
          const dropHaystack = (mob.drops || [])
            .map((drop) => `${drop.item} ${drop.notesText}`.toLowerCase())
            .join(" ");
          return (
            mob.name.toLowerCase().includes(query) || localizedName.includes(query) || dropHaystack.includes(query)
          );
        })
      : activeMobs;

    status.textContent = t(getStatusKey(activeCategory), {
      visible: visibleMobs.length,
      total: activeMobs.length
    });

    if (activeMobs.length === 0) {
      mobList.innerHTML = `<p class="empty-state">${t("page.bestiary.emptyCategory", { category: getListTitle(activeCategory) })}</p>`;
      return;
    }

    if (visibleMobs.length === 0) {
      mobList.innerHTML = `<p class="empty-state">${t("page.bestiary.emptyCategory", { category: getListTitle(activeCategory) })}</p>`;
      return;
    }

    const fragment = document.createDocumentFragment();
    visibleMobs.forEach((mob) => {
      fragment.appendChild(createMobCard(mob));
    });

    mobList.replaceChildren(fragment);
  }

  mobSearch.addEventListener("input", () => {
    bestiaryUiState = {
      ...bestiaryUiState,
      [floor]: {
        ...(bestiaryUiState[floor] || {}),
        search: mobSearch.value
      }
    };
    saveBestiaryUiState(bestiaryUiState);
    scheduleRenderMobs();
  });
  tabButtons.forEach((button) => {
    button.addEventListener("click", () => setActiveTab(button.dataset.category));
    button.addEventListener("keydown", (event) => {
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
        setActiveTab(button.dataset.category);
      }
    });
  });

  mobSearch.value = requestedSearch || floorState.search || "";

  setActiveTab(activeCategory);

  document.addEventListener("sao:languagechange", () => {
    applyLocalizedTabLabels();
    setActiveTab(activeCategory);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  try {
    const isCurrentDataset = window.SAODatasets?.getDatasetFromLocation() === "current";
    if (isCurrentDataset) {
      initBestiaryRuntime();
      return;
    }

    if (window.REGULAR_MOB_DATA && window.BOSS_MOB_DATA && window.DUNGEON_MOB_DATA && window.DUNGEON_BOSS_MOB_DATA) {
      initBestiaryRuntime();
      return;
    }

    loadFloorMobData(getRequestedFloor(), initBestiaryRuntime, showBestiaryLoadError);
  } catch (error) {
    console.error("Failed to initialize bestiary runtime.", error);
    showBestiaryLoadError();
  }
});
