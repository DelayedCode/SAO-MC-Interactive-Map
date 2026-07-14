const REGULAR_MOB_DATA_SOURCE = typeof REGULAR_MOB_DATA !== "undefined" ? REGULAR_MOB_DATA : "";
const BOSS_MOB_DATA_SOURCE = typeof BOSS_MOB_DATA !== "undefined" ? BOSS_MOB_DATA : "";
const DUNGEON_MOB_DATA_SOURCE = typeof DUNGEON_MOB_DATA !== "undefined" ? DUNGEON_MOB_DATA : "";
const DUNGEON_BOSS_MOB_DATA_SOURCE = typeof DUNGEON_BOSS_MOB_DATA !== "undefined" ? DUNGEON_BOSS_MOB_DATA : "";

// Floor-specific mob data is loaded from the floor data scripts.
// Each floor file defines REGULAR_MOB_DATA, BOSS_MOB_DATA, DUNGEON_MOB_DATA, and DUNGEON_BOSS_MOB_DATA.

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
  return rawData
    .trim()
    .split("\n")
    .map(line => line.split("\t"))
    .filter(parts => parts.length >= 3)
    .map(parts => {
      const [name, dropsRaw, xpRaw] = parts;
      return {
        name: name.trim(),
        aggressiveness: "N/A",
        xp: xpRaw.trim() || "N/A",
        drops: dropsRaw.split(",").map(parseDropToken)
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

const MOB_GROUPS = {
  boss: buildMobList(BOSS_MOB_DATA_SOURCE),
  regular: buildMobList(REGULAR_MOB_DATA_SOURCE),
  dungeonBoss: buildMobList(DUNGEON_BOSS_MOB_DATA_SOURCE),
  dungeonMobs: buildMobList(DUNGEON_MOB_DATA_SOURCE)
};

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

document.addEventListener("DOMContentLoaded", () => {
  const status = document.getElementById("status");
  const mobList = document.getElementById("mobList");
  const mobSearch = document.getElementById("mobSearch");
  const listTitle = document.getElementById("listTitle");
  const tabButtons = document.querySelectorAll(".list-tab[data-category]");
  const params = new URLSearchParams(window.location.search);
  const requestedCategory = params.get("category");
  const requestedSearch = params.get("search") || params.get("q") || "";

  if (!status || !mobList || !mobSearch || !listTitle || !tabButtons.length) return;

  let activeCategory = "regular";
  if (requestedCategory && MOB_GROUPS[requestedCategory]) {
    activeCategory = requestedCategory;
  }
  // Allow explicit override via URL hash (e.g. #dungeonMobs). This helps
  // ensure links from the map can force the dungeon tab even if other
  // parameters or previous state would select a different tab.
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

  mobSearch.addEventListener("input", scheduleRenderMobs);
  tabButtons.forEach(button => {
    button.addEventListener("click", () => setActiveTab(button.dataset.category));
  });

  if (requestedSearch) {
    mobSearch.value = requestedSearch;
  }

  setActiveTab(activeCategory);
});
