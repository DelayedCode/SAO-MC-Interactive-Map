const DEFAULT_FLOOR = "floor1";
const DEFAULT_CATEGORY = "communication";
const commandsUiStateStorageKey = "sao.commands.uiState";

const categories = [
  { key: "communication", label: "Communication" },
  { key: "cosmetics", label: "Cosmetics and Appearance" },
  { key: "dungeons", label: "Dungeons" },
  { key: "economy", label: "Economy" },
  { key: "gameplay", label: "Gameplay and Progression" },
  { key: "information", label: "Information" },
  { key: "media", label: "Media and Audio" },
  { key: "navigation", label: "Navigation" },
  { key: "useless", label: "Useless Commands" }
];
const categoryLabelMap = new Map(categories.map(category => [category.key, category.label]));
const commandsByCategory = new Map();
const commandSearchIndex = commandEntries.map(entry => ({
  entry,
  haystack: `${entry.command} ${entry.usage} ${entry.example}`.toLowerCase()
}));

for (const entry of commandEntries) {
  const bucket = commandsByCategory.get(entry.category) || [];
  bucket.push(entry);
  commandsByCategory.set(entry.category, bucket);
}

const commandEntries = [
  {
    category: "communication",
    command: "/friend add/remove/accept/deny/list [Name]",
    usage: "Friend system (Broken Right Now)",
    example: "/friend add Username (Sends Username a friend request)\n/friend remove Username (Removes Username as a friend)\n/friend accept Username (Accepts Username's friend request)\n/friend deny Username (Denies Username's friend request)\n/friend list (Shows your whole friend list and extra info)"
  },
  {
    category: "communication",
    command: "/mail",
    usage: "Opens your in game mail",
    example: "/mail"
  },
  {
    category: "communication",
    command: "/p [Message]",
    usage: "Party chat shortcut",
    example: "/p Message (Like \"/party chat\", it sends a message in your party chat only to see but it does not toggle it.)"
  },
  {
    category: "communication",
    command: "/party chat/help/info/leave/list/invite [Name]",
    usage: "Party management",
    example: "/party chat (Toggles your chat into party chat. Run the command again to turn it off.)\n/party help (Shows party commands)\n/party info (Shows info of the party you are currently in)\n/party leave (Leaves the party you are currently in)\n/party list (Shows current online parties)\n/party invite Username (Invites Username to your party)"
  },
  {
    category: "communication",
    command: "/pay [Name] [Amount]",
    usage: "Send money to another player",
    example: "/pay Username 10 (Pays Username 10 Col)"
  },
  {
    category: "communication",
    command: "/r [Message]",
    usage: "Reply to the last private message",
    example: "/r Message (Replies to the private message you may have just gotten or to someone who just replied to your private message)"
  },
  {
    category: "communication",
    command: "/staffmail",
    usage: "Opens mail sent by staff or automated systems",
    example: "/staffmail"
  },
  {
    category: "communication",
    command: "/trade [Name]",
    usage: "Trade with another player (Broken Right Now)",
    example: "/trade Username (Sends Username a trade request)"
  },
  {
    category: "communication",
    command: "/w [Name] [Message]",
    usage: "Send a private message",
    example: "/w Username Message (Party or not, it sends a private message to Username)"
  },
  {
    category: "cosmetics",
    command: "/cosmetic",
    usage: "Opens the cosmetic menu",
    example: "/cosmetic (Lets you see all cosmetics in game and/or lets you enable/disable them)"
  },
  {
    category: "cosmetics",
    command: "/emote",
    usage: "Emote command, no emotes available rn (Unsure if players should be able to use this)",
    example: "/emote"
  },
  {
    category: "cosmetics",
    command: "/fwaConfig",
    usage: "Animation configuration settings",
    example: "/fwaConfig"
  },
  {
    category: "cosmetics",
    command: "/titlemenu",
    usage: "Change your title if you own one",
    example: "/titlemenu"
  },
  {
    category: "cosmetics",
    command: "/zoomify",
    usage: "Configure Zoomify settings",
    example: "/zoomify"
  },
  {
    category: "dungeons",
    command: "/nd",
    usage: "Opens dungeon help and dungeon commands",
    example: "/nd"
  },
  {
    category: "dungeons",
    command: "/nextdungeon:dungeon",
    usage: "Opens dungeon help and dungeon commands (Less compacted compared to \"/nd\")",
    example: "/nextdungeon:dungeon"
  },
  {
    category: "dungeons",
    command: "/queue restore/status/leave/batch",
    usage: "Queue management for dungeons or lobbies",
    example: "/queue restore (I dont want to explain what this cmd does)\n/queue status (Shows your current spot in your queue)\n/queue leave (Leaves your current lobby queue)\n/queue batch (Shows random info)"
  },
  {
    category: "economy",
    command: "/ah auction/history/sell/profile/search/stash/top",
    usage: "Auction House commands",
    example: "/ah (Just opens the basic Auction House)\n/ah auction 5 (Price) 1 (Amount)\n/ah history (Lets you see your Auction House history)\n/ah history Username (Lets you see Username's Auction House history)\n/ah sell 5 (Price) 1 (Amount)\n/ah profile (Lets you see your Auction House profile)\n/ah profile Username (Lets you see Username's Auction House profile)\n/ah search seller Username (Lets you see all Username's current auctions/sells)\n/ah search Pumba (Shows matching listings where Pumba is the first word)\n/ah stash (If no-one buys your item in the time frame and it goes off sale, they go here)\n/ah top (Shows you the top people of the Auction House leaderboard)"
  },
  {
    category: "economy",
    command: "/bal [Name]",
    usage: "Check balances, leave name blank to see your own balance",
    example: "/bal (This checks your col)\n/bal Username (This checks Username's col)"
  },
  {
    category: "economy",
    command: "/poste",
    usage: "Opens the post office",
    example: "/poste"
  },
  {
    category: "economy",
    command: "/trash",
    usage: "Opens a trash inventory",
    example: "/trash (This opens your trash bin, close the menu to confirm deletion.)"
  },
  {
    category: "gameplay",
    command: "/bp",
    usage: "Opens your backpack",
    example: "/bp"
  },
  {
    category: "gameplay",
    command: "/col",
    usage: "Opens your collection/codex",
    example: "/col"
  },
  {
    category: "gameplay",
    command: "/companion",
    usage: "Opens the companion menu",
    example: "/companion"
  },
  {
    category: "gameplay",
    command: "/interlink",
    usage: "Move items between Underworld and Aincrad",
    example: "/interlink (This cmd is a Work In Progress right now)"
  },
  {
    category: "gameplay",
    command: "/jobstats",
    usage: "Shows class or job statistics",
    example: "/jobstats"
  },
  {
    category: "gameplay",
    command: "/mount",
    usage: "Opens the mount menu",
    example: "/mount"
  },
  {
    category: "gameplay",
    command: "/pets",
    usage: "Opens the pet menu (Broken Right Now)",
    example: "/pets"
  },
  {
    category: "gameplay",
    command: "/s",
    usage: "Shows your skills",
    example: "/s"
  },
  {
    category: "gameplay",
    command: "/saojob class",
    usage: "Opens your skill tree",
    example: "/saojob class"
  },
  {
    category: "gameplay",
    command: "/stats",
    usage: "Shows your stats",
    example: "/stats"
  },
  {
    category: "gameplay",
    command: "/tw questcodex",
    usage: "Opens the quest codex",
    example: "/tw questcodex"
  },
  {
    category: "information",
    command: "/bug",
    usage: "Bug reporting command",
    example: "/bug"
  },
  {
    category: "information",
    command: "/bukkit",
    usage: "Displays server information",
    example: "/bukkit"
  },
  {
    category: "information",
    command: "/lp",
    usage: "Displays LuckyPerms information",
    example: "/lp"
  },
  {
    category: "information",
    command: "/news",
    usage: "Opens game news",
    example: "/news"
  },
  {
    category: "information",
    command: "/ver",
    usage: "Displays server version information",
    example: "/ver"
  },
  {
    category: "information",
    command: "/dm",
    usage: "DeluxeMenu version information",
    example: "/dm"
  },
  {
    category: "information",
    command: "/papi",
    usage: "Displays PlaceholderAPI version information",
    example: "/papi"
  },
  {
    category: "media",
    command: "/music play/stop/volume [URL]",
    usage: "Music player command, currently appears broken or disabled. This may be better kept staff-only (Broken Right Now?)",
    example: "/music play [URL] (Plays music)\n/music stop (Stops music)\n/music volume [0-100] (Changes music volume)"
  },
  {
    category: "media",
    command: "/voice enable/disable/mute/unmute",
    usage: "Voice chat controls",
    example: "/voice enable (Lets you hear players)\n/voice disable (Doesnt let you hear players)\n/voice mute (Mutes your mic)\n/voice unmute (Unmutes your mic)"
  },
  {
    category: "navigation",
    command: "/l",
    usage: "Returns you to the hub",
    example: "/l"
  },
  {
    category: "navigation",
    command: "/fu go island_player",
    usage: "Takes you to your player island, only usable in Fractured Underworld",
    example: "/fu go island_player"
  },
  {
    category: "useless",
    command: "/animations",
    usage: "Does nothing currently but a menu pops up",
    example: "/animations"
  },
  {
    category: "useless",
    command: "/blessing characters",
    usage: "Does nothing currently but a menu pops up",
    example: "/blessing characters"
  },
  {
    category: "useless",
    command: "/callback",
    usage: "You can run it but nothing pops up, W.I.P.?",
    example: "/callback"
  },
  {
    category: "useless",
    command: "/contrats",
    usage: "You can run it but nothing pops up, W.I.P.?",
    example: "/contrats"
  },
  {
    category: "useless",
    command: "/custominv [Name]",
    usage: "You can run it but nothing pops up, W.I.P.?",
    example: "/custominv Username"
  },
  {
    category: "useless",
    command: "/dblock",
    usage: "You can run it but nothing pops up, W.I.P.?",
    example: "/dblock"
  },
  {
    category: "useless",
    command: "/mesinfractions",
    usage: "Appears to be a staff moderation command but can be run by players; remove from this list after Underworld release if still inactive",
    example: "/mesinfractions"
  },
  {
    category: "useless",
    command: "/sanctions",
    usage: "Appears to be a staff moderation command but can be run by players; remove from this list after Underworld release if still inactive",
    example: "/sanctions"
  }
];

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
    // Keep commands usable if storage is blocked.
  }
}

function loadCommandsUiState() {
  try {
    const raw = getPersistentItem(commandsUiStateStorageKey);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return {};
    return parsed;
  } catch {
    return {};
  }
}

function saveCommandsUiState(nextState) {
  setPersistentItem(commandsUiStateStorageKey, JSON.stringify(nextState));
}

function getRequestedFloor() {
  const requestedFloor = new URLSearchParams(window.location.search).get("floor");
  return requestedFloor && /^floor[123]$/.test(requestedFloor) ? requestedFloor : DEFAULT_FLOOR;
}

function attachSectionNavButtons() {
  window.SAOPageUtils.attachSectionNavButtons(".nav", getRequestedFloor);
}

function createCategoryFilters(activeCategory) {
  const wrap = document.getElementById("categoryFilters");
  if (!wrap) return;

  wrap.replaceChildren();

  categories.forEach(category => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `list-tab${category.key === activeCategory ? " is-active" : ""}`;
    button.dataset.category = category.key;
    button.textContent = category.label;
    wrap.appendChild(button);
  });
}

function renderCommandTable(entries) {
  const root = document.getElementById("commandTableRoot");
  if (!root) return;

  if (!entries.length) {
    const emptyState = document.createElement("p");
    emptyState.className = "empty-state";
    emptyState.textContent = "No commands match your current filters.";
    root.replaceChildren(emptyState);
    return;
  }

  const table = document.createElement("table");
  table.className = "command-table";

  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");
  ["Command", "Usage", "Example"].forEach(label => {
    const th = document.createElement("th");
    th.textContent = label;
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);

  const tbody = document.createElement("tbody");

  entries.forEach(entry => {
    const row = document.createElement("tr");

    const commandCell = document.createElement("td");
    commandCell.textContent = entry.command;

    const usageCell = document.createElement("td");
    usageCell.textContent = entry.usage;

    const exampleCell = document.createElement("td");
    exampleCell.className = "example-cell";
    exampleCell.textContent = entry.example;

    row.append(commandCell, usageCell, exampleCell);
    tbody.appendChild(row);
  });

  table.append(thead, tbody);
  root.replaceChildren(table);
}

function initCommandsRuntime() {
  const status = document.getElementById("status");
  const searchInput = document.getElementById("commandSearch");
  const params = new URLSearchParams(window.location.search);
  const uiState = loadCommandsUiState();

  let activeCategory = params.get("category") || uiState.category || DEFAULT_CATEGORY;
  if (!categories.some(category => category.key === activeCategory)) {
    activeCategory = DEFAULT_CATEGORY;
  }

  let searchValue = params.get("search") || uiState.search || "";
  let renderRafId = null;

  attachSectionNavButtons();
  createCategoryFilters(activeCategory);

  if (searchInput) {
    searchInput.value = searchValue;
  }

  function scheduleRenderCommandTable() {
    if (renderRafId !== null) return;
    renderRafId = window.requestAnimationFrame(() => {
      renderRafId = null;
      applyFilters();
    });
  }

  function applyFilters() {
    const query = searchValue.trim().toLowerCase();
    const visibleEntries = query
      ? commandSearchIndex
          .filter(({ entry, haystack }) => entry.category === activeCategory && haystack.includes(query))
          .map(({ entry }) => entry)
      : commandsByCategory.get(activeCategory) || [];

    const categoryLabel = categoryLabelMap.get(activeCategory) || "Commands";

    if (status) {
      status.textContent = `${visibleEntries.length} command${visibleEntries.length === 1 ? "" : "s"} shown in ${categoryLabel}.`;
    }

    renderCommandTable(visibleEntries);
  }

  const categoryFilters = document.getElementById("categoryFilters");
  if (categoryFilters) {
    categoryFilters.addEventListener("click", event => {
      const button = event.target.closest("button[data-category]");
      if (!button) return;

      const nextCategory = button.dataset.category;
      if (!nextCategory || nextCategory === activeCategory) return;

      activeCategory = nextCategory;
      createCategoryFilters(activeCategory);
      saveCommandsUiState({ category: activeCategory, search: searchValue });
      applyFilters();
    });
  }

  if (searchInput) {
    searchInput.addEventListener("input", () => {
      searchValue = searchInput.value;
      saveCommandsUiState({ category: activeCategory, search: searchValue });
      scheduleRenderCommandTable();
    });
  }

  applyFilters();
}

document.addEventListener("DOMContentLoaded", initCommandsRuntime);
