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
const t = (key, params) => (i18n ? i18n.t(key, params) : key);
const loadedCompendiumFloors = new Set();

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function getListTitle(category) {
    return t(LIST_TITLES[category] || "page.ecompendium.heading");
}

const compendiumUiStateStorageKey = "sao.compendium.uiState";
const storage = window.SAOStorage || {
    getItem() { return null; },
    setItem() {},
    getJSON(_key, fallbackValue) { return fallbackValue; },
    setJSON() {}
};

function loadCompendiumUiState() {
    const parsed = storage.getJSON(compendiumUiStateStorageKey, {});
    return parsed && typeof parsed === "object" ? parsed : {};
}

function saveCompendiumUiState(nextState) {
    storage.setJSON(compendiumUiStateStorageKey, nextState);
}

const DEFAULT_COMPENDIUM_FLOOR = "floor1";

function getRequestedFloor() {
    const requestedFloor = new URLSearchParams(window.location.search).get("floor");
    return requestedFloor && /^floor[123]$/.test(requestedFloor) ? requestedFloor : DEFAULT_COMPENDIUM_FLOOR;
}

function attachSectionNavButtons() {
    const pageUtils = window.SAOPageUtils;
    if (!pageUtils || typeof pageUtils.attachSectionNavButtons !== "function") {
        console.warn("Compendium navigation helper is unavailable.");
        return;
    }

    pageUtils.attachSectionNavButtons(".nav", getRequestedFloor);
}

function getActiveDataSet() {
    const floorIndex = getRequestedFloor().replace("floor", "");
    const dataSetKey = `FLOOR_${floorIndex}_DATA`;
    return window[dataSetKey] || {};
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
    const card = document.createElement("div");
    card.className = "ecompendium-card";

    let html = "";

    html += "<h2 class='ecompendium-name'>" +
        escapeHtml(entry.name || t("page.ecompendium.unknownItem")) +
        "</h2>";

    html += "<div class='ecompendium-meta'>";

    if (entry.rarity) {
        html += "<p><span>" + t("page.ecompendium.labels.rarity") + "</span><strong>" +
            escapeHtml(entry.rarity) +
            "</strong></p>";
    }

    if (entry.level) {
        html += "<p><span>" + t("page.ecompendium.labels.level") + "</span><strong>" +
            escapeHtml(entry.level) +
            "</strong></p>";
    }

    if (entry.set) {
        html += "<p><span>" + t("page.ecompendium.labels.set") + "</span><strong>" +
            escapeHtml(entry.set) +
            "</strong></p>";
    }

    if (entry.craftingLocation) {
        html += "<p><span>" + t("page.ecompendium.labels.craftedAt") + "</span><strong>" +
            escapeHtml(entry.craftingLocation) +
            "</strong></p>";
    }

    html += "</div>";

    if (entry.description) {
        html +=
            "<div class='equipment-section'>" +
            "<h4 class='equipment-section-title'>" + t("page.ecompendium.labels.description") + "</h4>" +
            "<p>" + escapeHtml(entry.description) + "</p>" +
            "</div>";
    }

    if (entry.stats) {
        html +=
            "<div class='equipment-section'>" +
            "<h4 class='equipment-section-title'>" + t("page.ecompendium.labels.statistics") + "</h4>" +
            "<ul class='stat-list'>";

        for (const stat in entry.stats) {
            html +=
                "<li>" +
                "<span>" + escapeHtml(stat) + "</span>" +
                "<strong>" + escapeHtml(entry.stats[stat]) + "</strong>" +
                "</li>";
        }

        html += "</ul></div>";
    }

    if ((entry.craftingResources && entry.craftingResources.length > 0) || entry.craftingNote) {

        html +=
            "<div class='equipment-section'>" +
            "<h4 class='equipment-section-title'>" + t("page.ecompendium.labels.resources") + "</h4>" +
            (entry.craftingNote
                ? "<p>" + escapeHtml(entry.craftingNote) + "</p>"
                : "") +
            ((entry.craftingResources && entry.craftingResources.length > 0)
                ? "<ul class='resource-list'>"
                : "");

        if (entry.craftingResources && entry.craftingResources.length > 0) {
            entry.craftingResources.forEach(function(resource) {
                html +=
                    "<li>" +
                    "<span>" + escapeHtml(resource.item) + "</span>" +
                    "<strong>x" + escapeHtml(resource.amount) + "</strong>" +
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

    const fragment = document.createDocumentFragment();
    filteredEntries.forEach(function(entry) {
        fragment.appendChild(createEntryCard(entry));
    });
    list.replaceChildren(fragment);
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

    attachSectionNavButtons();

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

        renderRafId = window.requestAnimationFrame(function() {
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

        tabButtons.forEach(function(button) {
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

    tabButtons.forEach(function(button) {
        button.addEventListener("click", function() {
            loadCategory(button.dataset.category);
        });

        button.addEventListener("keydown", function(event) {
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

    document.addEventListener("sao:languagechange", function() {
        loadCategory(activeCategory);
    });
}

document.addEventListener("DOMContentLoaded", function() {
    try {
        const floorKey = getRequestedFloor();
        const floorDataKey = `FLOOR_${floorKey.replace("floor", "")}_DATA`;

        if (window[floorDataKey]) {
            initCompendiumRuntime();
            return;
        }

        loadFloorDataScript(floorKey, initCompendiumRuntime, showCompendiumLoadError);
    } catch (error) {
        console.error("Failed to initialize equipment compendium runtime.", error);
        showCompendiumLoadError();
    }
});