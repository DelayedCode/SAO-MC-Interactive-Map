const LIST_TITLES = {
    weapon: "Weapons",
    armor: "Armor",
    accessory: "Accessories",
    rune: "Runes",
    tool: "Tools",
    food: "Food",
    consumable: "Consumables",
    material: "Materials",
    quest_item: "Quest Items",
    resource: "Resources",
    dungeon: "Dungeons",
    currency: "Currency"
};

const compendiumUiStateStorageKey = "sao.compendium.uiState";

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
        // Keep compendium usable if storage is blocked.
    }
}

function loadCompendiumUiState() {
    try {
        const raw = getPersistentItem(compendiumUiStateStorageKey);
        if (!raw) return {};
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== "object") return {};
        return parsed;
    } catch {
        return {};
    }
}

function saveCompendiumUiState(nextState) {
    setPersistentItem(compendiumUiStateStorageKey, JSON.stringify(nextState));
}

const DEFAULT_COMPENDIUM_FLOOR = "floor1";
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
    return requestedFloor && /^floor[123]$/.test(requestedFloor) ? requestedFloor : DEFAULT_COMPENDIUM_FLOOR;
}

function buildSectionUrl(section, floor) {
    const path = SECTION_PATHS[section] || "#";
    if (path === "#") {
        return path;
    }
    if (!floor || !FLOOR_AWARE_SECTIONS.has(section)) {
        return path;
    }
    return `${path}?${new URLSearchParams({ floor }).toString()}`;
}

function attachSectionNavButtons() {
    const nav = document.querySelector(".nav");
    if (!nav) {
        return;
    }

    nav.addEventListener("click", function(event) {
        const button = event.target.closest("button[data-nav-target]");
        if (!button) {
            return;
        }
        window.location.href = buildSectionUrl(button.dataset.navTarget, getRequestedFloor());
    });
}

function getActiveDataSet() {
    const floorIndex = getRequestedFloor().replace("floor", "");
    const dataSetKey = `FLOOR_${floorIndex}_DATA`;
    return window[dataSetKey] || {};
}

function loadFloorDataScript(floorKey, onReady) {
    const floorScript = document.createElement("script");
    floorScript.src = `ecompendium_${floorKey}.js`;
    floorScript.async = false;
    floorScript.addEventListener("load", onReady, { once: true });
    floorScript.addEventListener("error", onReady, { once: true });
    document.head.appendChild(floorScript);
}

function createEntryCard(entry) {
    const card = document.createElement("div");
    card.className = "ecompendium-card";

    let html = "";

    html += "<h2 class='ecompendium-name'>" +
        (entry.name || "Unknown Item") +
        "</h2>";

    html += "<div class='ecompendium-meta'>";

    if (entry.rarity) {
        html += "<p><span>Rarity</span><strong>" +
            entry.rarity +
            "</strong></p>";
    }

    if (entry.level) {
        html += "<p><span>Level</span><strong>" +
            entry.level +
            "</strong></p>";
    }

    if (entry.set) {
        html += "<p><span>Set</span><strong>" +
            entry.set +
            "</strong></p>";
    }

    if (entry.craftingLocation) {
        html += "<p><span>Crafted At</span><strong>" +
            entry.craftingLocation +
            "</strong></p>";
    }

    html += "</div>";

    if (entry.description) {
        html +=
            "<div class='equipment-section'>" +
            "<h4 class='equipment-section-title'>Description</h4>" +
            "<p>" + entry.description + "</p>" +
            "</div>";
    }

    if (entry.stats) {
        html +=
            "<div class='equipment-section'>" +
            "<h4 class='equipment-section-title'>Statistics</h4>" +
            "<ul class='stat-list'>";

        for (const stat in entry.stats) {
            html +=
                "<li>" +
                "<span>" + stat + "</span>" +
                "<strong>" + entry.stats[stat] + "</strong>" +
                "</li>";
        }

        html += "</ul></div>";
    }

    if ((entry.craftingResources && entry.craftingResources.length > 0) || entry.craftingNote) {

        html +=
            "<div class='equipment-section'>" +
            "<h4 class='equipment-section-title'>Crafting Resources</h4>" +
            (entry.craftingNote
                ? "<p>" + entry.craftingNote + "</p>"
                : "") +
            ((entry.craftingResources && entry.craftingResources.length > 0)
                ? "<ul class='resource-list'>"
                : "");

        if (entry.craftingResources && entry.craftingResources.length > 0) {
            entry.craftingResources.forEach(function(resource) {
                html +=
                    "<li>" +
                    "<span>" + resource.item + "</span>" +
                    "<strong>x" + resource.amount + "</strong>" +
                    "</li>";
            });

            html += "</ul>";
        }

        html += "</div>";
    }

    card.innerHTML = html;

    return card;
}

function renderEntries(entries, query) {
    const list = document.getElementById("entryList");
    const status = document.getElementById("status");

    if (!list || !status) {
        return;
    }

    const normalizedQuery = (query || "").trim().toLowerCase();
    const safeEntries = Array.isArray(entries) ? entries : [];

    const filteredEntries = safeEntries.filter(function(entry) {
        return (entry.name || "")
            .toLowerCase()
            .includes(normalizedQuery);
    });

    status.textContent =
        filteredEntries.length +
        " of " +
        safeEntries.length +
        " entries shown";

    if (filteredEntries.length === 0) {
        list.innerHTML =
            "<p class='empty-state'>No entries found.</p>";
        return;
    }

    list.innerHTML = "";

    filteredEntries.forEach(function(entry) {
        list.appendChild(createEntryCard(entry));
    });
}

function initCompendiumRuntime() {
    const searchInput = document.getElementById("ecompendiumSearch");
    const listTitle = document.getElementById("listTitle");
    const tabButtons = Array.from(document.querySelectorAll(".list-tab"));
    const list = document.getElementById("entryList");

    if (!searchInput || !listTitle || !list) {
        return;
    }

    attachSectionNavButtons();

    let currentEntries = [];
    const floor = getRequestedFloor();
    const savedState = loadCompendiumUiState();
    const floorState = savedState[floor] || {};
    let activeCategory = floorState.category || "weapon";

    function loadCategory(category) {
        activeCategory = category;
        const currentState = loadCompendiumUiState();
        saveCompendiumUiState({
            ...currentState,
            [floor]: {
                ...(currentState[floor] || {}),
                category
            }
        });

        tabButtons.forEach(function(button) {
            button.classList.toggle(
                "is-active",
                button.dataset.category === category
            );
        });

        listTitle.textContent =
            LIST_TITLES[category] || "Equipment";

        const dataSet = getActiveDataSet();
        currentEntries = Array.isArray(dataSet[category])
            ? dataSet[category]
            : [];

        currentEntries = currentEntries.slice().sort(function(a, b) {
            const levelA = typeof a.level === "number" ? a.level : 0;
            const levelB = typeof b.level === "number" ? b.level : 0;

            if (levelA !== levelB) {
                return levelA - levelB;
            }

            return (a.name || "").localeCompare(b.name || "");
        });

        renderEntries(currentEntries, searchInput.value);
    }

    searchInput.addEventListener("input", function() {
        const currentState = loadCompendiumUiState();
        saveCompendiumUiState({
            ...currentState,
            [floor]: {
                ...(currentState[floor] || {}),
                search: searchInput.value
            }
        });
        renderEntries(currentEntries, searchInput.value);
    });

    tabButtons.forEach(function(button) {
        button.addEventListener("click", function() {
            loadCategory(button.dataset.category);
        });
    });

    if (typeof floorState.search === "string") {
        searchInput.value = floorState.search;
    }

    if (!LIST_TITLES[activeCategory]) {
        activeCategory = "weapon";
    }

    loadCategory(activeCategory);
}

document.addEventListener("DOMContentLoaded", function() {
    const floorKey = getRequestedFloor();
    const floorDataKey = `FLOOR_${floorKey.replace("floor", "")}_DATA`;

    if (window[floorDataKey]) {
        initCompendiumRuntime();
        return;
    }

    loadFloorDataScript(floorKey, initCompendiumRuntime);
});