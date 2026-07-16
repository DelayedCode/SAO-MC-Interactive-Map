function getMobDataSources() {
  return Object.freeze({
    regular: window.REGULAR_MOB_DATA || "",
    boss: window.BOSS_MOB_DATA || "",
    dungeonMobs: window.DUNGEON_MOB_DATA || "",
    dungeonBoss: window.DUNGEON_BOSS_MOB_DATA || ""
  });
}

const bestiaryUiStateStorageKey = "sao.bestiary.uiState";

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
    // Keep bestiary usable if storage is blocked.
  }
}

function loadBestiaryUiState() {
  try {
    const raw = getPersistentItem(bestiaryUiStateStorageKey);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return {};
    return parsed;
  } catch {
    return {};
  }
}

function saveBestiaryUiState(nextState) {
  setPersistentItem(bestiaryUiStateStorageKey, JSON.stringify(nextState));
}

function parseDropToken(token) {
  const cleaned = token.trim();
  const groups = [...cleaned.matchAll(/\(([^)]+)\)/g)].map(match => match[1].trim());
  const notes = [];
  let chance = null;

  const explicitChanceMatch = cleaned.match(/(\d+(?:\.\d+)?)%/);
  if (explicitChanceMatch) {
    chance = Number(explicitChanceMatch[1]);
  }

  groups.forEach(group => {
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
    chance,
    notesText: notes.length ? ` (${notes.join(", ")})` : ""
  };
}

function buildMobList(rawData) {
  return String(rawData || "")
    .trim()
    .split("\n")
    .map(line => line.split("\t"))
    .filter(parts => parts.length >= 3)
    .map(([name, dropsRaw, xpRaw]) => ({
      name: name.trim(),
      xp: (xpRaw || "").trim() || "N/A",
      drops: (dropsRaw || "").split(",").map(parseDropToken)
    }))
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
  boss: "Boss List",
  regular: "Regular Mobs List",
  dungeonBoss: "Dungeon Boss List",
  dungeonMobs: "Dungeon Mobs List"
};

const AGGRESSIVENESS_BY_NAME = {
  "Corrupted Pumba": "Neutral",
  "Albal": "Neutral",
  "Colossal Guardian": "Aggressive",
  "Gorbel": "Aggressive",
  "Ice Bear": "Aggressive",
  "Nymbréa": "Aggressive",
  "Illfang the Kobold Lord": "Aggressive",
  "Kazor": "Aggressive",
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
  "Nephentes": "Aggressive",
  "Shark Fish": "Aggressive",
  "Forest Spider": "Aggressive",
  "Ice Spiritist": "Aggressive",
  "Ice Golem": "Aggressive",
  "Deer": "Aggressive",
  "Ika": "Aggressive",
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
  "Vyrmos": "Aggressive",
  "Tornak": "Aggressive",
  "Narax the Cursed Skeleton": "Aggressive",
  "Nasgul": "Aggressive",
  "Fallen Guardian": "Aggressive",
  "Fallen Herald": "Aggressive",
  "Fallen Reaper": "Aggressive",
  "Ornstein, Fallen Devastator": "Aggressive",
  "Smough, Fallen Devastator": "Aggressive",
  "Pricilia": "Aggressive",
  "Yula": "Aggressive",
  "Jira": "Aggressive",
  "Kamilia": "Aggressive",
  "Monstrous Bull": "Aggressive",
  "Taurus": "Aggressive",
  "Forest Bear": "Neutral",
  "Winnie, Man's Best Friend": "Neutral",
  "Mountain Wolf": "Neutral",
  "Savanes Wolf": "Neutral",
  "Worker": "Aggressive",
  "Dardroyal": "Aggressive",
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
  "Guardian": "Aggressive"
};

function getAggressivenessClass(value) {
  if (value === "Neutral") return "neutral";
  if (value === "Passive") return "passive";
  return "aggressive";
}

function createDropList(drops) {
  const list = document.createElement("ul");
  list.className = "drop-list";

  const sortedDrops = [...drops].sort((a, b) => {
    const aChance = a.chance ?? -1;
    const bChance = b.chance ?? -1;
    return bChance - aChance;
  });

  sortedDrops.forEach(drop => {
    const row = document.createElement("li");
    row.innerHTML = `<span>${drop.item}${drop.notesText}</span><strong>${drop.chance !== null ? `${drop.chance}%` : "N/A"}</strong>`;
    list.appendChild(row);
  });

  return list;
}

function createMobCard(mob) {
  const card = document.createElement("article");
  card.className = "mob-card";
  const aggressiveness = AGGRESSIVENESS_BY_NAME[mob.name] || "Aggressive";

  const title = document.createElement("h2");
  title.className = "mob-name";
  title.textContent = mob.name;

  const meta = document.createElement("div");
  meta.className = "mob-meta";
  const aggressivenessRow = document.createElement("p");
  const aggressivenessLabel = document.createElement("span");
  aggressivenessLabel.textContent = "Aggressiveness";
  const aggressivenessValue = document.createElement("strong");
  aggressivenessValue.className = getAggressivenessClass(aggressiveness);
  aggressivenessValue.textContent = aggressiveness;
  aggressivenessRow.append(aggressivenessLabel, aggressivenessValue);

  const xpRow = document.createElement("p");
  const xpLabel = document.createElement("span");
  xpLabel.textContent = "XP";
  const xpValue = document.createElement("strong");
  xpValue.textContent = mob.xp;
  xpRow.append(xpLabel, xpValue);

  meta.append(aggressivenessRow, xpRow);

  const dropsTitle = document.createElement("h3");
  dropsTitle.className = "drops-title";
  dropsTitle.textContent = "Drops";

  card.append(title, meta, dropsTitle, createDropList(mob.drops));
  return card;
}

const DEFAULT_BESTIARY_FLOOR = "floor1";
const SECTION_PATHS = {
  maps: "../Map/maps.html",
  bestiary: "../Bestiary/bestiary.html",
  equipment: "../eCompendium/ecompendium.html",
  quests: "../Quests/quests.html",
  patchnotes: "../Patchnotes/patchnotes.html"
};

const FLOOR_AWARE_SECTIONS = new Set(["maps", "bestiary", "equipment", "quests"]);

function getRequestedFloor() {
  const requestedFloor = new URLSearchParams(window.location.search).get("floor");
  return requestedFloor && /^floor[123]$/.test(requestedFloor) ? requestedFloor : DEFAULT_BESTIARY_FLOOR;
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
    window.location.href = buildSectionUrl(button.dataset.navTarget, getRequestedFloor());
  });
}

function loadFloorMobData(floorKey, onReady) {
  const floorScript = document.createElement("script");
  floorScript.src = `bestiary_${floorKey}.js`;
  floorScript.async = false;
  floorScript.addEventListener("load", onReady, { once: true });
  floorScript.addEventListener("error", onReady, { once: true });
  document.head.appendChild(floorScript);
}

function initBestiaryRuntime() {
  refreshMobGroups();
  attachSectionNavButtons();

  const status = document.getElementById("status");
  const mobList = document.getElementById("mobList");
  const mobSearch = document.getElementById("mobSearch");
  const listTitle = document.getElementById("listTitle");
  const tabButtons = document.querySelectorAll(".list-tab[data-category]");
  const params = new URLSearchParams(window.location.search);
  const requestedCategory = params.get("category");
  const requestedSearch = params.get("search") || params.get("q") || "";
  const floor = getRequestedFloor();
  const savedState = loadBestiaryUiState();
  const floorState = savedState[floor] || {};

  if (!status || !mobList || !mobSearch || !listTitle || !tabButtons.length) return;

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
    const currentState = loadBestiaryUiState();
    const nextState = {
      ...currentState,
      [floor]: {
        ...(currentState[floor] || {}),
        category
      }
    };
    saveBestiaryUiState(nextState);
    tabButtons.forEach(button => {
      button.classList.toggle("is-active", button.dataset.category === category);
    });
    listTitle.textContent = LIST_TITLES[category] || "Bestiary";
    renderMobs();
  }

  function renderMobs() {
    const activeMobs = MOB_GROUPS[activeCategory] || [];
    const query = mobSearch.value.trim().toLowerCase();
    const visibleMobs = query
      ? activeMobs.filter(mob => mob.name.toLowerCase().includes(query))
      : activeMobs;

    status.textContent = `${visibleMobs.length} of ${activeMobs.length} mobs shown.`;

    if (activeMobs.length === 0) {
      mobList.innerHTML = `<p class="empty-state">No entries yet for ${LIST_TITLES[activeCategory] || "this category"}.</p>`;
      return;
    }

    const fragment = document.createDocumentFragment();
    visibleMobs.forEach(mob => {
      fragment.appendChild(createMobCard(mob));
    });

    mobList.replaceChildren(fragment);
  }

  mobSearch.addEventListener("input", () => {
    const currentState = loadBestiaryUiState();
    saveBestiaryUiState({
      ...currentState,
      [floor]: {
        ...(currentState[floor] || {}),
        search: mobSearch.value
      }
    });
    scheduleRenderMobs();
  });
  tabButtons.forEach(button => {
    button.addEventListener("click", () => setActiveTab(button.dataset.category));
  });

  mobSearch.value = requestedSearch || floorState.search || "";

  setActiveTab(activeCategory);
}

document.addEventListener("DOMContentLoaded", () => {
  if (window.REGULAR_MOB_DATA && window.BOSS_MOB_DATA && window.DUNGEON_MOB_DATA && window.DUNGEON_BOSS_MOB_DATA) {
    initBestiaryRuntime();
    return;
  }

  loadFloorMobData(getRequestedFloor(), initBestiaryRuntime);
});
