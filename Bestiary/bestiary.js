const REGULAR_MOB_DATA = `
Sinister White Wolf	Wolf Fur (60%) (PB), Wolf Fangs (50%) (PB)	N/A
Sinister Black Wolf	Wolf Fur (60%) (PB), Wolf Fangs (30%) (PB)	N/A
Mini Treant	Sylvan Sprout (40%) (PB), Magic Wood Shard (30%) (PB)	N/A
Treant Warrior	Titan Bark (35%) (PB), Ancestral Root (10%) (PB), Sylvan Shield (3%) (PB)	N/A
Sylvan Mage	Enchanted Twig (30%) (PB), Spectral Cloth (30%) (PB), Wood Heart (20%) (PB), Sylvan Mage Staff (1%) (PB), Sylvan Shaman Staff (1%) (PB)	N/A
Elite Treant	Sylvan Bark (40%) (PB), Sylvan Bowstring (25%) (PB), Sylvan Bow (1%) (PB)	N/A
Small Slime	Slime Jelly (30%) (PB)	N/A
Slime Warrior	Slime Jelly (30%) (PB)	N/A
Healer Slime	Slime Jelly (30%) (PB), Slime Core (5%) (PB)	N/A
Mage Slime	Slime Jelly (30%) (PB), Slime Core (5%) (PB)	N/A
Skeleton Swordsman	Bone Dust (70%), Skeleton Bone (75%), Souls of the Ruins (80%), Skeletal Sword (1%), Swordsman's Scroll (50%)	3
Skeleton Warrior	Skeletal Sword (1%), Bone Dust (70%), Skeleton Bone (75%), Souls of the Ruins (80%)	3
Skeleton Halberdier	Reinforced Skeleton Bone (70%), Bone Dust (70%), Skeleton Bone (75%), Souls of the Ruins (80%)	3
Skeleton Archer	Bone Dust (70%), Skeleton Bone (75%), Souls of the Ruins (80%), Archer's Scroll (50%)	3
Shark Fish	Shark Shell (40%) (PB)	N/A
Forest Spider	Spider Silk (50%) (PB), Spider Cloth (40%) (PB)	N/A
Ice Spiritist	Glacial Magic Shard (35%) (PB), Frost Dust (35%) (PB)	N/A
Ice Golem	Frost Dust (40%) (PB), Glacial Hardhide (30%) (PB)	N/A
Deer	Mountain Deer Hide (45%) (PB)	N/A
Ika	Ika Shell (80%) (PB)	N/A
Nephentes	Corrupted Spore (50%) (PB), Leaf Fragment (40%) (PB)	N/A
Bandit Archer	Worn Leather (40%) (PB), Small Pouch (10%) (PB), Bandit Crossbow (3%) (PB)	N/A
Bandit Assassin	Worn Leather (30%) (PB), Small Pouch (15%) (PB), Bandit Dagger (3%) (PB)	N/A
Sturdy Bandit	Worn Leather (80%) (PB), Small Pouch (15%) (PB)	N/A
Corrupted Boar	Corrupted Crystal (75%), Boar Hide (90%), Boar Meat (50%)	1
Skeleton Tank	Reinforced Skeleton Bone (40%) (PB), Bone Dust (30%) (PB)	N/A
Skeleton Sorcerer	Bone Dust (70%), Skeleton Bone (75%), Souls of the Ruin (80%), Cursed Cloth (75%), Magic Staff of the Ruins (1%), Magic Staff of the Revenants (1%), Mage's Scroll (50%)	3
Small Kobold	N/A (PB)	N/A
The Mischievous Archer	N/A (PB)	N/A
Kobold Warrior	N/A (PB)	N/A
Kobold Lancer	N/A (PB)	N/A
Kobold Sorcerer	N/A (PB)	N/A
Kobold Sentinel (Minion)	Sentinel's Mace (0%) (PB)	N/A
`;

const BOSS_MOB_DATA = `
Corrupted Pumba	Corrupted Crystal (100%), Boar Hide (100%), Boar Meat (100%), Pumba's Ring (3%)	N/A
Albal	Wolf Fur (100%) (PB), Wolf Fangs (70%) (PB), Albal's Fangs (20%) (PB)	N/A
Colossal Guardian	Magic Mycelium (20%) (PB), Colossus Hammer (2%) (PB)	N/A
Gorbel	Slime Jelly (100%) (PB), Gorbel Essence (5%) (PB)	N/A
Ice Bear	Frost Dust (80%) (PB), Bear Soul Fragment (5%) (PB)	N/A
Nymbréa	Nymbréa's Heart (PB)	N/A
Illfang the Kobold Lord	N/A (PB)	N/A
Kazor	N/A (PB)	N/A
`;

const DUNGEON_MOB_DATA = `
Treant of the Forest	N/A (PB)	N/A
Forest-Bane Treant	N/A (PB)	N/A
Devouring Plant	N/A (PB)	N/A
Forest Brute	N/A (PB)	N/A
Skeleton Archer	Bone Dust (70%), Skeleton Bone (75%), Souls of the Ruins (80%), Archer's Scroll (50%)	N/A
Skeleton Tank	Reinforced Skeleton Bone (40%) (PB), Bone Dust (30%) (PB)	N/A
Skeleton Sorcerer	Bone Dust (70%), Skeleton Bone (75%), Souls of the Ruin (80%), Cursed Cloth (75%), Magic Staff of the Ruins (1%), Magic Staff of the Revenants (1%), Mage's Scroll (50%)	N/A
Fallen Soldier	Enchanted Metal Piece (20%) (PB)	N/A
Fallen Warrior	Metal Soul Piece (25%) (PB), Enchanted Metal Piece (20%) (PB)	N/A
Hunting Spider	N/A (PB)	N/A
Venomous Spider	N/A (PB)	N/A
Strangler Spider	N/A (PB)	N/A
`;

const DUNGEON_BOSS_MOB_DATA = `
Vyrmos	N/A (PB)	N/A
Tornak	N/A (PB)	N/A
Narax the Cursed Skeleton	Putrefied Heart (70%) (PB), Cursed Skeleton Mage Staff (3%) (PB), Cursed Skeleton Shaman Staff (3%) (PB), Narax's Ring (1%) (PB)	N/A
Nasgul	Spectral Mane Piece (2.5%) (PB), Cursed Hoof Shard (1%) (PB)	N/A
Fallen Guardian	Fallen Artifact (100%) (PB), Warden's Soul (30%) (PB)	N/A
Fallen Herald	Fallen Artifact (100%) (PB), Herald's Soul (30%) (PB)	N/A
Fallen Reaper	Fallen Artifact (100%) (PB), Reaper's Soul (30%) (PB), Reaper's Ring (3%) (PB)	N/A
Ornstein, Fallen Devastator	Forgotten Shield (1%) (PB)	N/A
Smough, Fallen Devastator	Royal Halberd (1%) (PB)	N/A
Pricilia	N/A (PB)	N/A
Yula	N/A (PB)	N/A
Jira	N/A (PB)	N/A
Kamilia	N/A (PB)	N/A
`;

function parseDropToken(token) {
  const cleaned = token.trim();
  const groups = [...cleaned.matchAll(/\(([^)]+)\)/g)].map(match => match[1].trim());
  const notes = [];
  let chance = null;

  groups.forEach(group => {
    const chanceMatch = group.match(/^(\d+(?:\.\d+)?)%$/);
    if (chanceMatch) {
      chance = Number(chanceMatch[1]);
      return;
    }
    notes.push(group);
  });

  let item = cleaned.replace(/\([^)]*\)/g, "").trim();
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
        drops: dropsRaw
          .split(",")
          .map(parseDropToken)
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

const MOB_GROUPS = {
  boss: buildMobList(BOSS_MOB_DATA),
  regular: buildMobList(REGULAR_MOB_DATA),
  dungeonBoss: buildMobList(DUNGEON_BOSS_MOB_DATA),
  dungeonMobs: buildMobList(DUNGEON_MOB_DATA)
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
  "Kamilia": "Aggressive"
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

  mobSearch.addEventListener("input", renderMobs);
  tabButtons.forEach(button => {
    button.addEventListener("click", () => setActiveTab(button.dataset.category));
  });

  if (requestedSearch) {
    mobSearch.value = requestedSearch;
  }

  setActiveTab(activeCategory);
});
