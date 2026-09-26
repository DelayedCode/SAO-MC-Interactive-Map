function createVirtualControl(initialValue, propertyName) {
  const listeners = new Set();
  return {
    [propertyName]: initialValue,
    addEventListener(type, listener) {
      if (type === "change") listeners.add(listener);
    },
    removeEventListener(type, listener) {
      if (type === "change") listeners.delete(listener);
    },
    dispatchEvent(event) {
      listeners.forEach(listener => listener(event));
    }
  };
}

const elements = {
  mapContainer: document.getElementById("mapContainer"),
  sidebar: document.getElementById("sidebar"),
  sidebarResizeHandle: document.getElementById("sidebarResizeHandle"),
  mapLayer: document.getElementById("mapLayer"),
  mapImage: document.getElementById("mapImage"),
  undergroundMapImage: document.getElementById("undergroundMapImage"),
  mobAreaLayer: document.getElementById("mobAreaLayer"),
  markerLayer: document.getElementById("markers"),
  title: document.getElementById("title"),
  content: document.getElementById("content"),
  overlayMappedCoords: document.getElementById("overlayMappedCoords"),
  floorSelect: document.getElementById("floorSelect") || createVirtualControl("playerIsland", "value"),
  undergroundToggle: document.getElementById("undergroundToggle") || createVirtualControl(false, "checked"),
  searchInput: document.getElementById("search"),
  clearFiltersButton: document.getElementById("clearFilters"),
  zoomLabel: document.getElementById("zoomLabel"),
  resetViewButton: document.getElementById("resetView"),
  categoryToggleButtons: document.querySelectorAll(".sidebar-list-button[data-category]"),
  globalToast: document.getElementById("globalToast")
};

let categoryToggleButtons = [];

const { mapContainer, sidebar, sidebarResizeHandle, mapLayer, mapImage, undergroundMapImage, mobAreaLayer, markerLayer, title, content, overlayMappedCoords, floorSelect, undergroundToggle, searchInput, clearFiltersButton, zoomLabel, resetViewButton, globalToast } = elements;

function showMainUiRuntimeError(message) {
  const fallbackMessage = message || t("page.mainui.runtimeError");
  if (title) {
    title.textContent = t("page.mainui.runtimeTitle");
  }
  if (content) {
    const paragraph = document.createElement("p");
    paragraph.textContent = fallbackMessage;
    content.replaceChildren(paragraph);
  }
}

function hasRequiredMainUiElements() {
  return Boolean(
    mapContainer && sidebar && mapLayer && mapImage && undergroundMapImage &&
    mobAreaLayer && markerLayer && title && content && overlayMappedCoords &&
    floorSelect && undergroundToggle && searchInput && zoomLabel && resetViewButton
  );
}

const MARKET_CATEGORIES = new Set([
  "lootBuyers",
  "weaponSellers",
  "travelingMerchants",
  "equipmentMerchants",
  "toolMerchants",
  "accessoriesMerchants",
  "occultMerchants",
  "consumablesMerchants"
]);
const CRAFTSMAN_CATEGORIES = new Set([
  "weaponsmith",
  "armorBlacksmith",
  "ingotBlacksmith",
  "keyBlacksmith",
  "accessoriesBlacksmith",
  "runeCraftsmen",
  "refaire"
]);
const mapAdapter = window.UnderworldMapAdapter || null;
let contextData = null;
let contextDataId = null;
let contextMobAreaLookup = new Map();
function getContextData() {
  const contextId = floorSelect?.value || mapAdapter?.defaultFloor || "";
  if (contextData && contextDataId === contextId) return contextData;
  contextDataId = contextId;
  contextData = mapAdapter?.getContextData?.(contextId) || {
    markerDataset: {},
    mobAreaDataset: [],
    mobAreaMobLookup: {}
  };
  contextMobAreaLookup = new Map(contextData.mobAreaDataset.map(area => [area.id, area]));
  markerSearchCache = null;
  return contextData;
}
function getDataEntries() { return Object.entries(getContextData().markerDataset); }
function getMobAreas() { return getContextData().mobAreaDataset; }
function getMobAreaMobLookup() { return getContextData().mobAreaMobLookup; }
function getMobAreaLookup() { getContextData(); return contextMobAreaLookup; }

const mapUiStateStorageKey = "sao.map.uiState";
const mapWalkthroughStorageKey = "sao.walkthrough.mainui.completed";
const i18n = window.SAOI18n || null;
const t = (key, params) => (i18n ? i18n.t(key, params) : key);
const contentLookup = (key, fallback) => (i18n && typeof i18n.content === "function"
  ? i18n.content(key, fallback)
  : fallback);
const storage = window.SAOStorage || {
  getItem() { return null; },
  setItem() {},
  getJSON(_key, fallbackValue) { return fallbackValue; },
  setJSON() {}
};

const initialCategoryState = Object.freeze({
  npc: false,
  rulid: false,
  fishingSpot: false,
  oakWood: false,
  copper: false,
  iron: false,
  coal: false
});

function createSharedMapRuntime() {
  return (typeof window.createMapRuntime === "function" && window.UnderworldMapAdapter)
    ? window.createMapRuntime(window.UnderworldMapAdapter, {
      dom: elements,
      storage,
      coordinateDependencies: window.UnderworldMapAdapter.coordinateDependencies,
      requiredElements: [
        "mapContainer",
        "sidebar",
        "mapLayer",
        "mapImage",
        "undergroundMapImage",
        "mobAreaLayer",
        "markerLayer",
        "title",
        "content",
        "overlayMappedCoords",
        "searchInput",
        "clearFiltersButton",
        "zoomLabel",
        "resetViewButton"
      ]
      })
    : null;
}

let sharedMapRuntime = createSharedMapRuntime();

window.__underworldMapRuntime = sharedMapRuntime;

let pageDisposer = null;
let pageInitialized = false;
let walkthroughController = null;

function getPageDisposer() {
  if (!pageDisposer || pageDisposer.disposed) {
    pageDisposer = window.createDisposer();
  }
  return pageDisposer;
}

function addPageEventListener(target, type, listener, options) {
  target.addEventListener(type, listener, options);
  getPageDisposer().add(() => target.removeEventListener(type, listener, options));
}

function schedulePageAnimationFrame(stateKey, callback) {
  const disposer = getPageDisposer();
  if (disposer.disposed) return null;
  const handle = window.requestAnimationFrame(() => {
    if (state[stateKey] === handle) state[stateKey] = null;
    if (disposer.disposed) return;
    callback();
  });
  state[stateKey] = handle;
  disposer.add(() => {
    if (state[stateKey] === handle) state[stateKey] = null;
    window.cancelAnimationFrame(handle);
  });
  return handle;
}

function schedulePageTimeout(callback, delay) {
  const disposer = getPageDisposer();
  if (disposer.disposed) return null;
  const handle = window.setTimeout(() => {
    if (disposer.disposed) return;
    callback();
  }, delay);
  disposer.add(() => window.clearTimeout(handle));
  return handle;
}

function getMarkerText(marker, field, markerId) {
  const value = marker && marker[field];
  const translated = contentLookup(`underworld-map.${markerId || marker?.id || "unknown"}.${field}`, value || "");
  if (field === "description") {
    return window.SAOContentTranslations?.translateKnownTerms?.(translated, i18n?.getLanguage?.()) || translated;
  }
  return translated;
}

function getAreaText(area) {
  return contentLookup(`underworld-map.mob-area.${area?.id || "unknown"}.title`, area?.title || "");
}

const state = {
  zoom: 1,
  translateX: 0,
  translateY: 0,
  isDragging: false,
  dragStartX: 0,
  dragStartY: 0,
  pendingDragClientX: 0,
  pendingDragClientY: 0,
  dragRafId: null,
  initialZoom: 1,
  initialTranslateX: 0,
  initialTranslateY: 0,
  pendingPointerEvent: null,
  coordinateRafId: null,
  renderMarkersRafId: null,
  markerRenderSignature: "",
  markerCache: new Map(),
};

function isMainCategoryAvailableForFloor(category, floor) {
  const allowedFloors = mapAdapter?.categoryFloorRules?.[category];
  if (!allowedFloors) return true;
  return allowedFloors.includes(floor);
}

function syncMainCategoryButtonVisibility() {
  const selectedFloor = floorSelect ? floorSelect.value : "";
  const visibleCategories = new Set(getIslandCategoriesForFloor(selectedFloor));

  categoryToggleButtons.forEach(button => {
    const category = button.dataset.category;
    const isVisible = visibleCategories.has(category);
    const listItem = button.closest("li");
    if (listItem) {
      listItem.hidden = !isVisible;
    }
    button.hidden = !isVisible;
    button.disabled = !isVisible;
    if (!isVisible) {
      sharedMapRuntime.setCategoryState(category, false);
      button.classList.remove("active");
    }
  });

  const categoryStates = sharedMapRuntime?.getCategoryStates?.() || {};
  Object.keys(categoryStates).forEach(category => {
    if (!visibleCategories.has(category)) {
      sharedMapRuntime.setCategoryState(category, false);
    }
  });
}

function getMapLabel(mapKey) {
  const key = `page.mainui.islandOptions.${mapKey}`;
  const localized = t(key);
  return localized === key ? t("page.mainui.islandOptions.playerIsland") : localized;
}

function getIslandCategoriesForFloor(floorKey) {
  const entries = Object.entries(mapAdapter?.categoryFloorRules || {});
  const selectedFloor = floorKey || mapAdapter?.defaultFloor || "";
  return entries
    .filter(([, allowedFloors]) => !allowedFloors || allowedFloors.includes(selectedFloor))
    .map(([category]) => category);
}

function syncIslandNavigation() {
  const islandButtons = document.querySelectorAll(".island-nav-button");
  const selectedFloor = floorSelect?.value || mapAdapter?.defaultFloor || "";
  islandButtons.forEach(button => {
    const isActive = button.dataset.island === selectedFloor;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
}

function renderCategorySidebar() {
  const categoryList = document.getElementById("categoryList");
  const sectionHeader = document.getElementById("categorySectionHeader");
  const selectedFloor = floorSelect?.value || mapAdapter?.defaultFloor || "";
  const categories = getIslandCategoriesForFloor(selectedFloor);

  if (sectionHeader) {
    const labelText = mapAdapter?.floors?.[selectedFloor]?.label || getMapLabel(selectedFloor);
    sectionHeader.textContent = labelText.toUpperCase();
  }

  if (!categoryList) return;

  categoryList.innerHTML = categories.map(category => {
    const label = t(`page.mainui.categories.${category}`) || category;
    const active = !!(sharedMapRuntime && sharedMapRuntime.getCategoryState(category));
    return `
      <li>
        <button class="sidebar-list-button${active ? " active" : ""}" type="button" data-category="${category}" aria-pressed="${active ? "true" : "false"}">${label}</button>
      </li>
    `;
  }).join("");

  categoryToggleButtons = categoryList.querySelectorAll(".sidebar-list-button[data-category]");
  categoryToggleButtons.forEach(button => {
    const category = button.dataset.category;
    const isActive = !!(sharedMapRuntime && sharedMapRuntime.getCategoryState(category));
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  const categoryStates = sharedMapRuntime?.getCategoryStates?.() || {};
  Object.keys(categoryStates).forEach(category => {
    if (!categories.includes(category)) {
      sharedMapRuntime.setCategoryState(category, false);
    }
  });
}

function updateMapEmptyState() {
  const mapEmptyState = document.getElementById("mapEmptyState");
  const labelEl = document.getElementById("mapEmptyStateLabel");
  if (!mapEmptyState || !labelEl) return;

  const floorKey = floorSelect?.value || mapAdapter?.defaultFloor || "";
  const shouldShow = mapAdapter?.assetAvailability?.[floorKey] !== true;

  mapEmptyState.classList.toggle("is-hidden", !shouldShow);
  labelEl.textContent = t("page.mainui.mapDataUnavailable");
}

function applyMapSources(mapKey) {
  const mapSources = mapAdapter?.mapImageSources?.[mapKey] || {};
  const hasImageAssets = mapAdapter?.assetAvailability?.[mapKey] === true;

  mapImage.alt = `${getMapLabel(mapKey)} ${t("page.mainui.mapSuffix")}`;
  undergroundMapImage.alt = `${getMapLabel(mapKey)} ${t("page.mainui.undergroundSuffix")}`;
  mapImage.onerror = null;
  undergroundMapImage.onerror = null;

  if (!hasImageAssets || !mapSources.surface || !mapSources.underground) {
    mapImage.removeAttribute("src");
    undergroundMapImage.removeAttribute("src");
    mapImage.style.display = "none";
    undergroundMapImage.style.display = "none";
    updateMapEmptyState();
    return;
  }

  mapImage.style.display = "block";
  undergroundMapImage.style.display = "none";
  mapImage.src = mapSources.surface;
  undergroundMapImage.src = mapSources.underground;
  updateMapEmptyState();
}

function loadMapUiState() {
  const parsed = storage.getJSON(mapUiStateStorageKey, null);
  return parsed && typeof parsed === "object" ? parsed : null;
}

function saveMapUiState(mapState) {
  storage.setJSON(mapUiStateStorageKey, mapState);
}

function syncMarkerVisitedClass(id, isVisited) {
  const markerEl = markerLayer.querySelector(`[data-marker-id="${id}"]`);
  if (!markerEl) return;
  markerEl.classList.toggle("visited", isVisited);
}

function supportsVisitedCategory(category) {
  return mapAdapter?.supportsVisitedCategory?.(category) === true;
}

function normalizeHexColor(value) {
  const color = String(value || "").trim();
  const hex = color.startsWith("#") ? color.slice(1) : color;
  if (!/^[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$/.test(hex)) return null;
  if (hex.length === 3) {
    return `#${hex.split("").map(char => char + char).join("").toLowerCase()}`;
  }
  return `#${hex.toLowerCase()}`;
}

function getOppositeHexColor(value) {
  const normalized = normalizeHexColor(value);
  if (!normalized) return "#ffffff";
  const r = 255 - parseInt(normalized.slice(1, 3), 16);
  const g = 255 - parseInt(normalized.slice(3, 5), 16);
  const b = 255 - parseInt(normalized.slice(5, 7), 16);
  const toHex = channel => channel.toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function getMobAreaCenter(area) {
  const cachedCenter = getCachedValue(mobAreaCenterCache, area.id);
  if (cachedCenter !== undefined) {
    return cachedCenter;
  }

  if (!Array.isArray(area.corners) || area.corners.length === 0) return null;
  const totals = area.corners.reduce((acc, point) => {
    acc.x += point.x;
    acc.z += point.z;
    return acc;
  }, { x: 0, z: 0 });
  const center = {
    x: Math.round(totals.x / area.corners.length),
    z: Math.round(totals.z / area.corners.length)
  };
  setCachedValue(mobAreaCenterCache, area.id, center);
  return center;
}

const CACHE_LIMIT = 1024;
const mobAreaCenterCache = new Map();
const mobAreaSearchCache = new Map();
const MOB_AREA_LABEL_VERTICAL_OFFSET = 16;

// MOB_AREA_MOBS is defined per-floor in the floor data files (e.g. maps_floor1.js)
// so that each floor can ship its own mob lists. Access via typeof checks
// in the code to avoid undefined errors when a floor doesn't provide data.

function escapeHtml(value) {
  const escapeMap = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  };
  return String(value).replace(/[&<>"']/g, char => escapeMap[char]);
}

function getCachedValue(cache, key) {
  if (!cache.has(key)) {
    return undefined;
  }

  const value = cache.get(key);
  cache.delete(key);
  cache.set(key, value);
  return value;
}

function setCachedValue(cache, key, value) {
  if (cache.has(key)) {
    cache.delete(key);
  } else if (cache.size >= CACHE_LIMIT) {
    const oldestKey = cache.keys().next().value;
    cache.delete(oldestKey);
  }

  cache.set(key, value);
}

function getMobAreaSearchHaystack(area) {
  const cachedValue = getCachedValue(mobAreaSearchCache, area.id);
  if (cachedValue !== undefined) {
    return cachedValue;
  }

  const haystack = sharedMapRuntime.normalizeSearchQuery(`${area.id} ${area.title} ${getAreaText(area)} mob area`);
  setCachedValue(mobAreaSearchCache, area.id, haystack);
  return haystack;
}

function getFloorSpecificBestiaryUrl(floor, category, search) {
  const params = new URLSearchParams();
  if (floor) params.set("floor", floor);
  if (category) params.set("category", category);
  if (search) params.set("search", search);
  return `../Bestiary/bestiary.html${params.toString() ? `?${params.toString()}` : ""}`;
}

function getFloorSpecificQuestsUrl(floor, search) {
  const params = new URLSearchParams();
  if (floor) params.set("floor", floor);
  if (search) params.set("search", search);
  return `../Quests/quests.html${params.toString() ? `?${params.toString()}` : ""}`;
}

let toastTimeoutId = null;

function showToast(message) {
  if (!pageDisposer || pageDisposer.disposed) return;
  if (!globalToast || !message) return;

  globalToast.textContent = message;
  globalToast.classList.add("show");
  globalToast.setAttribute("aria-hidden", "false");

  window.clearTimeout(toastTimeoutId);
  toastTimeoutId = schedulePageTimeout(() => {
    globalToast.classList.remove("show");
    globalToast.setAttribute("aria-hidden", "true");
  }, 2600);
}

const SECTION_PATHS = {
  maps: "../Map/maps.html",
  bestiary: "../Bestiary/bestiary.html",
  equipment: "../eCompendium/ecompendium.html",
  quests: "../Quests/quests.html",
  patchnotes: "../Patchnotes/patchnotes.html",
  towerDefense: "../Tower Defense/towerdefense.html",
  compendium: "../Compendium/compendium.html"
};

const FLOOR_AWARE_SECTIONS = new Set(["maps", "bestiary", "equipment", "quests"]);

function buildSectionUrl(section, floor) {
  const path = SECTION_PATHS[section] || "#";
  if (path === "#") return path;
  if (!floor) return path;
  if (FLOOR_AWARE_SECTIONS.has(section)) {
    return `${path}?${new URLSearchParams({ floor }).toString()}`;
  }
  if (section === "towerDefense" || section === "compendium") {
    return `${path}?${new URLSearchParams({ floor }).toString()}`;
  }
  return path;
}

function attachSectionNavButtons() {
  const nav = document.querySelector(".top-nav");
  if (!nav) return;

  addPageEventListener(nav, "click", event => {
    const messageButton = event.target.closest("button[data-message]");
    if (messageButton) {
      showToast(messageButton.dataset.message);
      return;
    }

    const button = event.target.closest("button[data-nav-target]");
    if (!button) return;

    const nextHref = window.SAOPageUtils.resolveSafeInternalHref(buildSectionUrl(button.dataset.navTarget, floorSelect.value));
    if (!nextHref) return;

    const datasets = window.SAODatasets;
    if (datasets && datasets.affectedSections.has(button.dataset.navTarget)) {
      event.preventDefault();
      datasets.installStyles();
      datasets.navigate({
        section: button.dataset.navTarget,
        url: nextHref,
        title: button.textContent.trim()
      });
      return;
    }

    window.location.href = nextHref;
  });
}

function buildMobAreaMobListMarkup(areaId, areaFloor) {
  const mobLookup = getMobAreaMobLookup();
  const mobs = mobLookup[areaId] || [];
  if (mobs.length === 0) {
    return `<p>${t("page.mainui.noMobEntries")}</p>`;
  }

  return `
    <ul class="mob-area-entry-list">
      ${mobs.map(mob => {
        const search = mob.search ? mob.search : mob.name;
        const mobId = String(mob.id || mob.name || "unknown")
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "") || "unknown";
        const mobName = contentLookup(`bestiary.mob.${mobId}`, mob.name);
        const areaObj = getMobAreaLookup().get(areaId);
        const category = areaObj && areaObj.underground === true ? "dungeonMobs" : "regular";
        let href = getFloorSpecificBestiaryUrl(areaFloor, category, search);
        if (category === "dungeonMobs") href += "#dungeonMobs";
        return `
          <li class="mob-area-entry-item">
            <span class="mob-area-entry-name">${escapeHtml(mobName)}</span>
            <button type="button" class="mob-area-info-button" data-waypoint-info-href="${escapeHtml(href)}">${t("page.maps.viewWaypointInfo")}</button>
          </li>
        `;
      }).join("")}
    </ul>
  `;
}

function openMobAreaInfo(area) {
  const center = getMobAreaCenter(area);
  const localizedAreaTitle = getAreaText(area);
  const areaTitle = escapeHtml(localizedAreaTitle);
  const titleText = `${localizedAreaTitle} ${t("page.maps.mobs")}`;
  const floorText = escapeHtml(String(area.floor || "").replace("floor", `${t("page.maps.floorText")} `));
  const centerX = center ? escapeHtml(center.x) : "--";
  const centerZ = center ? escapeHtml(center.z) : "--";
  sharedMapRuntime.setSelectedMarker(`mob-area:${area.id}`);
  title.textContent = titleText;
  content.innerHTML = `
    <p><strong>${t("page.maps.mobType")}:</strong> ${t("page.maps.mobAreaType")}</p>
    <p>${areaTitle} ${t("page.maps.availableMobs")}</p>
    <p><strong>${t("page.maps.floorText")}:</strong> ${floorText}</p>
    <p><strong>${t("page.maps.coordinates")}:</strong> X: ${centerX} Z: ${centerZ}</p>
    <p><strong>${t("page.maps.mobs")}:</strong></p>
    ${buildMobAreaMobListMarkup(area.id, area.floor)}
  `;

  const previousActive = markerLayer.querySelector(".active-marker");
  if (previousActive) previousActive.classList.remove("active-marker");
  const activeMarker = markerLayer.querySelector(`[data-marker-id="mob-area:${area.id}"]`);
  if (activeMarker) activeMarker.classList.add("active-marker");
}

function handleInfoOverlayClick(event) {
  const actionButton = event.target.closest("[data-waypoint-info-href]");
  if (!actionButton || !content.contains(actionButton)) return;

  const href = window.SAOPageUtils.resolveSafeInternalHref(actionButton.dataset.waypointInfoHref);
  if (!href) return;

  try { persistStateToHistory(); } catch (e) {}
  window.location.href = href;
}

function handleInfoOverlayChange(event) {
  const visitedToggle = event.target.closest("#visitedToggle");
  if (!visitedToggle || !content.contains(visitedToggle)) return;

  const targetId = visitedToggle.dataset.markerId || "";
  if (!targetId) return;

  const targetFloor = visitedToggle.dataset.markerFloor || "";
  const nextVisited = visitedToggle.checked;
  sharedMapRuntime.setMarkerVisited(targetFloor, targetId, nextVisited);
  syncMarkerVisitedClass(targetId, nextVisited);
}

function handleMarkerLayerClick(event) {
  const markerEl = event.target.closest(".marker[data-marker-id]");
  if (!markerEl || !markerLayer.contains(markerEl)) return;

  activateMarkerByElement(markerEl);
}

function handleMarkerLayerKeydown(event) {
  if (event.key !== "Enter" && event.key !== " ") return;
  const markerEl = event.target.closest(".marker[data-marker-id]");
  if (!markerEl || !markerLayer.contains(markerEl)) return;

  event.preventDefault();
  activateMarkerByElement(markerEl);
}

function activateMarkerByElement(markerEl) {
  const markerId = markerEl.dataset.markerId || "";
  if (!markerId) return;

  sharedMapRuntime.setSelectedMarker(markerId);

  if (markerId.startsWith("mob-area:")) {
    const areaId = markerId.slice("mob-area:".length);
    const area = getMobAreaLookup().get(areaId);
    if (area) {
      openMobAreaInfo(area);
    }
    return;
  }

  openInfo(markerId);
}

function clearMapFilters() {
  if (searchInput) {
    searchInput.value = "";
  }

  sharedMapRuntime.clearCategoryState();
  sharedMapRuntime.clearSearchQuery();

  categoryToggleButtons.forEach(button => {
    button.classList.remove("active");
  });

  sharedMapRuntime.clearSelectedMarker();
  setDefaultSidebarMessage();
  scheduleRenderMarkers();
  persistStateToHistory();
}

function buildWalkthroughSteps() {
  return [
    {
      selector: ".top-nav",
      title: t("page.mainui.walkthrough.step1Title"),
      body: t("page.mainui.walkthrough.step1Body")
    },
    {
      selectors: ["#islandNav", ".controls"],
      title: t("page.mainui.walkthrough.step2Title"),
      body: t("page.mainui.walkthrough.step2Body")
    },
    {
      selector: "#categoryList",
      title: t("page.mainui.walkthrough.step3Title"),
      body: t("page.mainui.walkthrough.step3Body")
    },
    {
      selector: "#mapLayer",
      title: t("page.mainui.walkthrough.step4Title"),
      body: t("page.mainui.walkthrough.step4Body")
    }
  ];
}

function startGuidedWalkthrough(options) {
  return walkthroughController?.start(options) || false;
}

let markerSearchCache = null;
function ensureMarkerSearchCache() {
  if (markerSearchCache) return;
  markerSearchCache = new Map(
    getDataEntries().map(([id, marker]) => [
      id,
      `${id} ${marker.title} ${getMarkerText(marker, "title", id)} ${marker.type} ${getMarkerText(marker, "type", id)}`.toLowerCase()
    ])
  );
}

const inverseCoordCache = new Map();
const mobAreaCornersCache = new Map();

function getInverseCoords(x, z, floor, dimensions) {
  const dimKey = dimensions ? `${dimensions.width}x${dimensions.height}` : "na";
  const key = `${floor}:${dimKey}:${x}:${z}`;
  const cached = getCachedValue(inverseCoordCache, key);
  if (cached !== undefined) {
    return cached;
  }

  if (typeof invertMapCoordinates !== "function") {
    setCachedValue(inverseCoordCache, key, null);
    return null;
  }

  const inv = invertMapCoordinates(x, z, floor, dimensions);
  setCachedValue(inverseCoordCache, key, inv || null);
  return inv || null;
}

function getInvertedMobAreaCorners(area, floor, dimensions) {
  const dimKey = dimensions ? `${dimensions.width}x${dimensions.height}` : "na";
  const key = `${area.id}:${floor}:${dimKey}`;
  const cached = getCachedValue(mobAreaCornersCache, key);
  if (cached !== undefined) {
    return cached;
  }

  const corners = area.corners
    .map(point => getInverseCoords(point.x, point.z, floor, dimensions))
    .filter(Boolean);
  setCachedValue(mobAreaCornersCache, key, corners);
  return corners;
}

function getInverseMarkerCoords(marker, floor, dimensions) {
  if (!marker.coords) return null;
  return getInverseCoords(marker.coords.x, marker.coords.z, floor, dimensions);
}

const zoomConfig = { factor: 1.14, min: 0.5, max: 30.0 };

const formatZoomLabel = zoom => `${zoom.toFixed(1).replace(/\.0$/, "")}x`;

function getImageLocalCoords(event) {
  const imgRect = mapImage.getBoundingClientRect();
  const naturalWidth = mapImage.naturalWidth || imgRect.width;
  const naturalHeight = mapImage.naturalHeight || imgRect.height;
  const scale = Math.min(imgRect.width / naturalWidth, imgRect.height / naturalHeight);
  const contentWidth = naturalWidth * scale;
  const contentHeight = naturalHeight * scale;
  const offsetX = (imgRect.width - contentWidth) / 2;
  const offsetY = (imgRect.height - contentHeight) / 2;
  const localX = event.clientX - imgRect.left - offsetX;
  const localY = event.clientY - imgRect.top - offsetY;

  return {
    localX,
    localY,
    naturalWidth,
    naturalHeight,
    contentWidth,
    contentHeight,
    offsetX,
    offsetY,
    scale
  };
}

function mapCoordinates(rawX, rawY, dimensions) {
  if (typeof mapWebsiteCoordinates !== "function") return null;
  return mapWebsiteCoordinates(rawX, rawY, floorSelect.value, dimensions);
}

function updateCoordinatePanelFromEvent(event) {
  const info = getImageLocalCoords(event);
  if (info.localX < 0 || info.localY < 0 || info.localX > info.contentWidth || info.localY > info.contentHeight) {
    overlayMappedCoords.textContent = t("page.mainui.coordinatesPlaceholder");
    return;
  }

  const rawX = info.localX * (info.naturalWidth / info.contentWidth);
  const rawY = info.localY * (info.naturalHeight / info.contentHeight);
  const mapped = mapCoordinates(rawX, rawY, {
    width: info.naturalWidth,
    height: info.naturalHeight
  });

  if (mapped) {
    overlayMappedCoords.textContent = `X: ${mapped.x.toFixed(0)} Z: ${mapped.z.toFixed(0)}`;
  } else {
    overlayMappedCoords.textContent = t("page.mainui.coordinatesPlaceholder");
  }
}

function requestCoordinatePanelUpdate(event) {
  if (!pageDisposer || pageDisposer.disposed) return;
  state.pendingPointerEvent = event;
  if (state.coordinateRafId !== null) return;

  schedulePageAnimationFrame("coordinateRafId", () => {
    if (!state.pendingPointerEvent) return;
    updateCoordinatePanelFromEvent(state.pendingPointerEvent);
    state.pendingPointerEvent = null;
  });
}

function updateTransform() {
  const mapTransform = `translate(${state.translateX}px, ${state.translateY}px) scale(${state.zoom})`;
  mapLayer.style.transform = mapTransform;
  markerLayer.style.transform = `scale(${(1 / state.zoom).toFixed(6)})`;
  markerLayer.style.transformOrigin = "top left";
  zoomLabel.textContent = formatZoomLabel(state.zoom);
}

function setZoom(nextZoom, anchorX, anchorY) {
  nextZoom = Math.min(zoomConfig.max, Math.max(zoomConfig.min, nextZoom));
  if (nextZoom === state.zoom) return;

  const zoomRatio = nextZoom / state.zoom;
  state.translateX = anchorX - (anchorX - state.translateX) * zoomRatio;
  state.translateY = anchorY - (anchorY - state.translateY) * zoomRatio;
  state.zoom = nextZoom;
  updateTransform();
  scheduleRenderMarkers();
}

function resetView() {
  state.zoom = state.initialZoom;
  state.translateX = state.initialTranslateX;
  state.translateY = state.initialTranslateY;
  updateTransform();
}

function setUndergroundMode(enabled) {
  mapImage.style.opacity = enabled ? 0.10 : 1;
  undergroundMapImage.style.display = enabled ? "block" : "none";
}

function setDefaultSidebarMessage() {
  title.textContent = t("page.mainui.defaultInfoTitle");
  content.innerHTML = `<p>${t("page.mainui.defaultInfoBody")}</p>`;
}

function hasActiveMarkerCategories() {
  return Object.values(sharedMapRuntime.getCategoryStates()).some(Boolean);
}

function setMarkerEmptyState(filterText) {
  const hasActiveCategories = hasActiveMarkerCategories();

  if (!hasActiveCategories && !filterText) {
    title.textContent = t("page.mainui.chooseCategoryTitle");
    content.innerHTML = `<p>${t("page.mainui.chooseCategoryBody")}</p>`;
    return;
  }

  if (filterText) {
    title.textContent = t("page.mainui.noSearchTitle");
    content.innerHTML = `<p>${t("page.mainui.noSearchBody")}</p>`;
    return;
  }

  title.textContent = t("page.mainui.noMarkersTitle");
  content.innerHTML = `<p>${t("page.mainui.noMarkersBody")}</p>`;
}

function renderMobAreas(selectedFloor, imgScale, offsetX, offsetY) {
  if (!mobAreaLayer) return;

  const mobAreas = getMobAreas();

  const isEnabled = sharedMapRuntime.getCategoryState("mobAreas");
  if (!isEnabled || !imgScale) {
    mobAreaLayer.replaceChildren();
    return;
  }

  const svgNS = "http://www.w3.org/2000/svg";
  const fragment = document.createDocumentFragment();

  mobAreas.forEach(area => {
    if (area.floor !== selectedFloor) return;
    const isAreaUnderground = area.underground === true;
    if (isAreaUnderground !== undergroundToggle.checked) return;

    const projectedPoints = getInvertedMobAreaCorners(area, selectedFloor, {
      width: mapImage.naturalWidth,
      height: mapImage.naturalHeight
    })
      .map(inv => ({
        x: offsetX + inv.rawX * imgScale,
        y: offsetY + inv.rawY * imgScale
      }));

    if (projectedPoints.length < 3) return;

    const points = projectedPoints.map(point => `${point.x},${point.y}`);

    const polygon = document.createElementNS(svgNS, "polygon");
    polygon.setAttribute("class", "mob-area-polygon");
    polygon.setAttribute("points", points.join(" "));
    polygon.setAttribute("fill", area.fill);
    polygon.setAttribute("stroke", area.stroke);

    const titleEl = document.createElementNS(svgNS, "title");
    const areaTitle = getAreaText(area);
    titleEl.textContent = areaTitle;
    polygon.appendChild(titleEl);
    fragment.appendChild(polygon);

    const centerX = projectedPoints.reduce((sum, point) => sum + point.x, 0) / projectedPoints.length;
    const centerY = projectedPoints.reduce((sum, point) => sum + point.y, 0) / projectedPoints.length;
    const minX = Math.min(...projectedPoints.map(point => point.x));
    const maxX = Math.max(...projectedPoints.map(point => point.x));
    const minY = Math.min(...projectedPoints.map(point => point.y));
    const maxY = Math.max(...projectedPoints.map(point => point.y));
    const zoneWidth = Math.max(1, maxX - minX);
    const zoneHeight = Math.max(1, maxY - minY);
    const sizeByWidth = zoneWidth / Math.max(areaTitle.length * 0.62, 1);
    const sizeByHeight = zoneHeight * 0.34;
    const labelSize = Math.max(12, Math.min(34, Math.min(sizeByWidth, sizeByHeight)));

    const label = document.createElementNS(svgNS, "text");
    label.setAttribute("class", "mob-area-label");
    label.setAttribute("x", centerX.toFixed(2));
    label.setAttribute("y", (centerY - MOB_AREA_LABEL_VERTICAL_OFFSET).toFixed(2));
    label.style.setProperty("--mob-area-label-color", area.stroke);
    label.style.setProperty("--mob-area-label-size", `${labelSize.toFixed(1)}px`);
    label.textContent = areaTitle;
    fragment.appendChild(label);
  });

  mobAreaLayer.replaceChildren(fragment);
}

const MARKET_ICON_LIBRARY = Object.freeze({
  lootBuyers: `
    <svg class="market-icon loot-buyer-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M4.5 7.5h15l-1.3 9.2a2 2 0 0 1-2 1.7H7.8a2 2 0 0 1-2-1.7Z" fill="#f6e7ac" stroke="#7c6422" stroke-width="1.1"/>
      <path d="M8 7.5a4 4 0 0 1 8 0" fill="none" stroke="#fff7d0" stroke-width="1.4" stroke-linecap="round"/>
      <path d="M8.5 11.2h7" stroke="#7c6422" stroke-width="1.2" stroke-linecap="round"/>
      <circle cx="12" cy="14.6" r="1.7" fill="#7c6422"/>
    </svg>
  `,
  weaponSellers: `
    <svg class="market-icon weapon-seller-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M6.2 17.8 15.8 8.2l2 2-9.6 9.6-3 1Z" fill="#d7e3f3" stroke="#52657d" stroke-width="1"/>
      <path d="M14.6 5.9 18 2.5l3.5 3.5-3.4 3.4Z" fill="#f5c65b" stroke="#8a6120" stroke-width="1"/>
      <path d="M5 18.8l1.3-3.3 2 2Z" fill="#8a5a34"/>
    </svg>
  `,
  travelingMerchants: `
    <svg class="market-icon traveling-merchant-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M5 10h12.6a2 2 0 0 1 1.8 1.1l1.6 3.2v2.8H19a2.5 2.5 0 0 1-5 0H10a2.5 2.5 0 0 1-5 0H3.5v-5.4Z" fill="#efe6d0" stroke="#7b6543" stroke-width="1.1"/>
      <path d="M15.6 10V7.4h2.5l1.7 2.6Z" fill="#9ed0ff" stroke="#4d7092" stroke-width="1"/>
      <circle cx="7.5" cy="17.1" r="1.6" fill="#7b6543"/>
      <circle cx="16.5" cy="17.1" r="1.6" fill="#7b6543"/>
    </svg>
  `,
  equipmentMerchants: `
    <svg class="market-icon equipment-merchant-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M12 3.2 18.5 6v5.2c0 4.4-2.7 7.2-6.5 9.6-3.8-2.4-6.5-5.2-6.5-9.6V6Z" fill="#dfe8f6" stroke="#51637d" stroke-width="1.1"/>
      <path d="M12 6.6 9 8v3.2c0 2.6 1.4 4.5 3 5.8 1.6-1.3 3-3.2 3-5.8V8Z" fill="#7fa4d9"/>
    </svg>
  `,
  toolMerchants: `
    <svg class="market-icon tool-merchant-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M14.5 4.2a4.3 4.3 0 0 0-2.8 6.9L5.1 17.7a1.5 1.5 0 1 0 2.1 2.1l6.6-6.6a4.3 4.3 0 0 0 6.9-2.8l-2.9 1.1-2.3-2.3Z" fill="#cfe9ee" stroke="#456972" stroke-width="1.1"/>
      <circle cx="6.2" cy="18.7" r="0.9" fill="#456972"/>
    </svg>
  `,
  accessoriesMerchants: `
    <svg class="market-icon accessories-merchant-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12.4" r="5.8" fill="#ffe2b8" stroke="#91612a" stroke-width="1.1"/>
      <circle cx="12" cy="12.4" r="2.4" fill="#1f2d46"/>
      <path d="M12 4.8v2M12 18v1.6M4.4 12.4H6.4M17.6 12.4H19.6" stroke="#fff5df" stroke-width="1.2" stroke-linecap="round"/>
    </svg>
  `,
  occultMerchants: `
    <svg class="market-icon occult-merchant-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M12 3.8 13.9 9.5H20l-4.9 3.6 1.9 5.7L12 15.2 7 18.8l1.9-5.7L4 9.5h6.1Z" fill="#e0d0ff" stroke="#5c3e88" stroke-width="1.1"/>
      <circle cx="12" cy="12" r="1.6" fill="#5c3e88"/>
    </svg>
  `,
  consumablesMerchants: `
    <svg class="market-icon consumables-merchant-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M9 3.5h6v2l-1.6 2.4v8.4a3.4 3.4 0 1 1-6.8 0V7.9L9 5.5Z" fill="#ffd8c0" stroke="#93553c" stroke-width="1.1"/>
      <path d="M8.4 11.4h7.2" stroke="#93553c" stroke-width="1"/>
      <path d="M9.2 14.2c1-.7 1.9-.3 2.8.1.9.4 1.8.8 2.6.2" stroke="#fff2eb" stroke-width="1.1" fill="none"/>
    </svg>
  `
});

function buildMarketMarkerIcon(category) {
  return MARKET_ICON_LIBRARY[category] || "";
}

const CRAFTSMAN_ICON_LIBRARY = Object.freeze({
  weaponsmith: `
    <svg class="craftsman-icon weaponsmith-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M6.2 17.9 15.7 8.4l2 2-9.5 9.5-3 1Z" fill="#dce7f5" stroke="#53657d" stroke-width="1"/>
      <path d="M14.5 6l3.3-3.3 3.2 3.2-3.3 3.3Z" fill="#f5c45c" stroke="#8d6120" stroke-width="1"/>
      <path d="M4.9 19l1.3-3.2 1.9 1.9Z" fill="#8d5e35"/>
    </svg>
  `,
  armorBlacksmith: `
    <svg class="craftsman-icon armor-blacksmith-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M12 3.4 18.5 6v5.4c0 4.2-2.4 6.9-6.5 9.1-4.1-2.2-6.5-4.9-6.5-9.1V6Z" fill="#d9e6f8" stroke="#4e637f" stroke-width="1.1"/>
      <path d="M12 6.6 9.1 7.8v3.5c0 2.1 1.1 3.8 2.9 5 1.8-1.2 2.9-2.9 2.9-5V7.8Z" fill="#7ea1d8"/>
    </svg>
  `,
  ingotBlacksmith: `
    <svg class="craftsman-icon ingot-blacksmith-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <rect x="4.4" y="11.3" width="15.2" height="5.2" rx="1.1" fill="#f0d2a2" stroke="#8b6335" stroke-width="1.1"/>
      <path d="M7.2 11.3 10 7.2h4l2.8 4.1" fill="#f7e1bd" stroke="#8b6335" stroke-width="1"/>
      <path d="M8.1 14h7.8" stroke="#8b6335" stroke-width="1.1" stroke-linecap="round"/>
    </svg>
  `,
  keyBlacksmith: `
    <svg class="craftsman-icon key-blacksmith-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle cx="8.2" cy="10.5" r="3" fill="#ffeb9d" stroke="#8b6925" stroke-width="1.1"/>
      <path d="M11 10.5h8v1.8h-1.8v1.8h-2v-1.8h-1.8v1.8h-2V12.3H11Z" fill="#ffeb9d" stroke="#8b6925" stroke-width="1.1" stroke-linejoin="round"/>
    </svg>
  `,
  accessoriesBlacksmith: `
    <svg class="craftsman-icon accessories-blacksmith-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12.2" r="5.7" fill="#ffe1b9" stroke="#8f622a" stroke-width="1.1"/>
      <circle cx="12" cy="12.2" r="2.5" fill="#26324e"/>
      <path d="M12 4.8v1.8M12 17.8v1.4M4.6 12.2h1.8M17.6 12.2h1.8" stroke="#fff6de" stroke-width="1.2" stroke-linecap="round"/>
    </svg>
  `,
  runeCraftsmen: `
    <svg class="craftsman-icon rune-craftsmen-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M6.7 18.1 13.4 11.4l2.2 2.2-6.7 6.7-2.9.8Z" fill="#dce8f7" stroke="#4d6078" stroke-width="1"/>
      <path d="M16.1 4.8 18.4 2.5l3.1 3.1-2.3 2.3Z" fill="#f1ca7e" stroke="#8d6424" stroke-width="1"/>
      <path d="M5.7 19.3 7 16.3l1.7 1.7Z" fill="#7f5a34"/>
    </svg>
  `,
  refaire: `
    <svg class="craftsman-icon refaire-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M5.5 16.6c.7 1.2 2.3 1.8 3.7 1.3l7.1-2.7c1.4-.5 2.1-2 1.6-3.4l-1.2-3.4a2.9 2.9 0 0 0-3.6-1.8l-7.1 2.7a2.9 2.9 0 0 0-1.8 3.6l1.3 3.4Z" fill="#f7e2c1" stroke="#7a4b28" stroke-width="1.1"/>
      <path d="M9.1 9.7 14.2 8.5" stroke="#7a4b28" stroke-width="1.4" stroke-linecap="round"/>
      <path d="M9.7 11.4 15 10.1" stroke="#8a5b33" stroke-width="1.4" stroke-linecap="round"/>
      <path d="M10.4 13.1 15.7 11.9" stroke="#6b3f20" stroke-width="1.4" stroke-linecap="round"/>
      <path d="M8.7 15.1c1.4.2 2.7-.9 3-2.3.3-1.4-.6-2.8-2-3l-2.4-.3c-.9-.1-1.8.5-2.1 1.4l-.7 2.5c-.3.9.1 1.8.9 2.3.6.3 1.3.4 2 .4Z" fill="#edd1a3" stroke="#7a4b28" stroke-width="1"/>
    </svg>
  `
});

function buildCraftsmanMarkerIcon(category) {
  return CRAFTSMAN_ICON_LIBRARY[category] || "";
}

function scheduleRenderMarkers() {
  if (!pageDisposer || pageDisposer.disposed) return;
  if (state.renderMarkersRafId !== null) return;
  schedulePageAnimationFrame("renderMarkersRafId", () => {
    renderMarkers();
  });
}

function getMarkerRenderSignature(selectedFloor, filterText) {
  const enabledCategories = Object.entries(sharedMapRuntime.getCategoryStates())
    .filter(([, enabled]) => enabled)
    .map(([category]) => category)
    .sort();
  const viewportKey = `${Math.round(markerLayer.clientWidth)}x${Math.round(markerLayer.clientHeight)}`;
  const viewKey = `${Math.round(state.zoom * 1000)}:${Math.round(state.translateX)}:${Math.round(state.translateY)}`;
  return [selectedFloor, filterText, undergroundToggle.checked ? "underground" : "surface", enabledCategories.join(","), viewportKey, viewKey].join("|");
}

function getMarkerViewportBounds() {
  const bounds = {
    left: -80,
    top: -80,
    right: markerLayer.clientWidth + 80,
    bottom: markerLayer.clientHeight + 80
  };

  if (!state.zoom || !Number.isFinite(state.zoom)) {
    return bounds;
  }

  const mapLeft = -state.translateX;
  const mapTop = -state.translateY;
  const mapRight = mapLeft + markerLayer.clientWidth;
  const mapBottom = mapTop + markerLayer.clientHeight;

  bounds.left = mapLeft - 80;
  bounds.top = mapTop - 80;
  bounds.right = mapRight + 80;
  bounds.bottom = mapBottom + 80;
  return bounds;
}

function renderMarkers() {
  const selectedFloor = floorSelect.value;
  const filterText = sharedMapRuntime.getSearchQuery();
  const signature = getMarkerRenderSignature(selectedFloor, filterText);
  if (state.markerRenderSignature === signature && markerLayer.childElementCount > 0) {
    return;
  }
  state.markerRenderSignature = signature;

  const desiredIds = new Set();
  const naturalWidth = mapImage.naturalWidth;
  const naturalHeight = mapImage.naturalHeight;
  const containerW = markerLayer.clientWidth;
  const containerH = markerLayer.clientHeight;
  let imgScale, offsetX, offsetY;
  if (naturalWidth && naturalHeight && containerW && containerH) {
    imgScale = Math.min(containerW / naturalWidth, containerH / naturalHeight);
    offsetX = (containerW - naturalWidth * imgScale) / 2;
    offsetY = (containerH - naturalHeight * imgScale) / 2;
  }

  renderMobAreas(selectedFloor, imgScale, offsetX, offsetY);

  ensureMarkerSearchCache();
  const viewportBounds = getMarkerViewportBounds();
  let renderedCount = 0;
  let activeMarkerRendered = false;

  getDataEntries().forEach(([id, marker]) => {
    const matchesFloor = marker.floor === selectedFloor;
    const matchesSearch = (markerSearchCache.get(id) || "").includes(filterText);
    const categoryEnabled = sharedMapRuntime.getCategoryState(marker.category);
    if (!matchesFloor || !categoryEnabled || (filterText && !matchesSearch)) return;
    if (!imgScale || !marker.coords) return;

    const inv = getInverseMarkerCoords(marker, selectedFloor, {
      width: naturalWidth,
      height: naturalHeight
    });
    if (!inv) return;

    const leftPx = offsetX + inv.rawX * imgScale;
    const topPx = offsetY + inv.rawY * imgScale;
    const screenX = leftPx * state.zoom + state.translateX;
    const screenY = topPx * state.zoom + state.translateY;
    const isVisibleWithinViewport = screenX >= viewportBounds.left && screenX <= viewportBounds.right && screenY >= viewportBounds.top && screenY <= viewportBounds.bottom;
    if (!isVisibleWithinViewport) return;

    desiredIds.add(id);
    let markerEl = state.markerCache.get(id);
    if (!markerEl) {
      markerEl = document.createElement("div");
      markerEl.dataset.markerId = id;
      state.markerCache.set(id, markerEl);
      markerLayer.appendChild(markerEl);
    }

    const markerType = marker.type.toLowerCase();
    markerEl.className = `marker ${markerType}`;
    markerEl.style.left = `${leftPx}px`;
    markerEl.style.top = `${topPx}px`;
    markerEl.style.opacity = (() => {
      const isUnderground = marker.underground === true;
      return isUnderground
        ? (undergroundToggle.checked ? 1 : 0.10)
        : (undergroundToggle.checked ? 0.10 : 1);
    })();
    markerEl.style.setProperty("--marker-anchor-y", markerType === "biome" ? "-100%" : "-50%");
    const markerTitle = getMarkerText(marker, "title", id);
    markerEl.title = markerTitle;
    markerEl.tabIndex = 0;
    markerEl.setAttribute("role", "button");
    markerEl.setAttribute("aria-label", markerTitle);
    markerEl.dataset.markerFloor = marker.floor || "";

    const isSideQuest = marker.category === "sideQuests";
    const isAlchemist = marker.category === "alchemist";
    const isLumberjack = marker.category === "lumberjack";
    const isCraftsmenCategory = CRAFTSMAN_CATEGORIES.has(marker.category);
    const isMarketCategory = MARKET_CATEGORIES.has(marker.category);

    if (markerType === "biome") {
      markerEl.innerHTML = `
        <svg class="biome-pin-icon" viewBox="0 0 24 34" aria-hidden="true" focusable="false">
          <path d="M12 33 C12 33, 3 19.5, 3 12 C3 7.03, 7.03 3, 12 3 C16.97 3, 21 7.03, 21 12 C21 19.5, 12 33, 12 33 Z" fill="#d72638" stroke="#ffffff" stroke-width="2"/>
          <circle cx="12" cy="12" r="4" fill="#ffffff"/>
        </svg>
      `;
    } else if (markerType === "dungeon") {
      markerEl.innerHTML = `
        <svg class="dungeon-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M7.5 2.5 10 5l-1.2 1.2 3.2 3.2-1.8 1.8-3.2-3.2L5.8 9 3.3 6.5 7.5 2.5Z" fill="#ffffff"/>
          <path d="M16.5 2.5 20.7 6.5 18.2 9l-1.2-1.2-3.2 3.2-1.8-1.8 3.2-3.2L14 5l2.5-2.5Z" fill="#ffffff"/>
          <path d="M11.1 11.1 12.9 11.1 12.9 21.5 11.1 21.5Z" fill="#ffffff"/>
          <path d="M9.6 19.2 14.4 19.2 14.4 20.9 9.6 20.9Z" fill="#ffffff"/>
        </svg>
      `;
    } else if (markerType === "boss") {
      markerEl.innerHTML = `
        <svg class="boss-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M4 8 2.5 4.5 6.2 6 8 5l2 2.3H14L16 5l1.8 1 3.7-1.5L20 8l-2 1.4V13c0 3.1-2.7 5.6-6 5.6S6 16.1 6 13V9.4L4 8Z" fill="#ffffff"/>
          <circle cx="9.3" cy="12.2" r="1.2" fill="#d72638"/>
          <circle cx="14.7" cy="12.2" r="1.2" fill="#d72638"/>
          <path d="M9.4 15.6c1.7 1.2 3.5 1.2 5.2 0" stroke="#d72638" stroke-width="1.4" stroke-linecap="round" fill="none"/>
        </svg>
      `;
    } else if (isSideQuest) {
      markerEl.classList.add("side-quest-marker");
      markerEl.innerHTML = `
        <svg class="quest-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <rect x="4" y="3.5" width="13" height="17" rx="2" fill="#f4ecd1" stroke="#9d8d62" stroke-width="1.2"/>
          <path d="M7 8.1h7M7 11h7M7 13.9h5" stroke="#8b7c53" stroke-width="1.35" stroke-linecap="round"/>
          <circle cx="17.2" cy="16.6" r="4.3" fill="#2e8f5c" stroke="#d9ffe9" stroke-width="1.2"/>
          <path d="M15.1 16.6l1.4 1.5 2.5-2.8" fill="none" stroke="#ffffff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      `;
    } else if (isAlchemist) {
      markerEl.classList.add("alchemist-marker");
      markerEl.innerHTML = `
        <svg class="alchemist-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M9 3h6v2l-1.6 2.7v2.2l4.8 7.2c.9 1.4-.1 3.2-1.8 3.2H7.6c-1.7 0-2.7-1.8-1.8-3.2l4.8-7.2V7.7L9 5V3Z" fill="#e9f9ff" stroke="#2f6c84" stroke-width="1.1"/>
          <path d="M7.2 16.1h9.6" stroke="#2f6c84" stroke-width="1"/>
          <path d="M8.4 13.9c1.2-.8 2.2-.2 3.1.3.9.5 1.8 1.1 3 .4" stroke="#4fb2cf" stroke-width="1.1" fill="none"/>
          <circle cx="9.4" cy="12.3" r="0.9" fill="#4fb2cf"/>
          <circle cx="14.6" cy="11.4" r="0.8" fill="#4fb2cf"/>
        </svg>
      `;
    } else if (isLumberjack) {
      markerEl.classList.add("lumberjack-marker");
      markerEl.innerHTML = `
        <svg class="lumberjack-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <rect x="4" y="12" width="11" height="5" rx="1.5" fill="#eed5a8" stroke="#8d6130" stroke-width="1.1"/>
          <path d="M15 12.5c2.2 0 3.7 1.4 3.7 2.9s-1.5 2.9-3.7 2.9" fill="#c98f4f" stroke="#8d6130" stroke-width="1.1"/>
          <path d="M6.5 10.5 16.8 4.5l1.2 2.1L7.7 12.6Z" fill="#d8e4eb" stroke="#5b6d78" stroke-width="1"/>
          <path d="M16.3 4.8 19.8 6.9 21.1 5 17.4 2.9Z" fill="#6a3f24"/>
        </svg>
      `;
    } else if (isCraftsmenCategory) {
      markerEl.classList.add("craftsman-marker", `${marker.category}-marker`);
      markerEl.innerHTML = buildCraftsmanMarkerIcon(marker.category);
    } else if (isMarketCategory) {
      markerEl.classList.add("market-marker", `${marker.category}-marker`);
      markerEl.innerHTML = buildMarketMarkerIcon(marker.category);
    } else {
      markerEl.textContent = markerType.charAt(0);
    }

    markerEl.classList.toggle("visited", supportsVisitedCategory(marker.category) && sharedMapRuntime.isMarkerVisited(marker.floor, id));
    if (sharedMapRuntime.getSelectedMarker() === id) {
      markerEl.classList.add("active-marker");
      activeMarkerRendered = true;
    } else {
      markerEl.classList.remove("active-marker");
    }

    renderedCount += 1;
  });

  if (sharedMapRuntime.getCategoryState("mobAreas") && imgScale) {
    const mobAreasList = getMobAreas();
    mobAreasList.forEach(area => {
      if (area.floor !== selectedFloor) return;
      const isAreaUnderground = area.underground === true;
      if (isAreaUnderground !== undergroundToggle.checked) return;

      const waypointTitle = `${getAreaText(area)} ${t("page.maps.mobs")}`;
      const searchHaystack = getMobAreaSearchHaystack(area);
      if (filterText && !searchHaystack.includes(filterText)) return;

      const center = getMobAreaCenter(area);
      if (!center) return;

      const inv = getInverseCoords(center.x, center.z, selectedFloor, {
        width: naturalWidth,
        height: naturalHeight
      });
      if (!inv) return;

      const leftPx = offsetX + inv.rawX * imgScale;
      const topPx = offsetY + inv.rawY * imgScale;
      const screenX = leftPx * state.zoom + state.translateX;
      const screenY = topPx * state.zoom + state.translateY;
      const isVisibleWithinViewport = screenX >= viewportBounds.left && screenX <= viewportBounds.right && screenY >= viewportBounds.top && screenY <= viewportBounds.bottom;
      if (!isVisibleWithinViewport) return;

      const mobAreaId = `mob-area:${area.id}`;
      desiredIds.add(mobAreaId);
      let markerEl = state.markerCache.get(mobAreaId);
      if (!markerEl) {
        markerEl = document.createElement("div");
        markerEl.dataset.markerId = mobAreaId;
        state.markerCache.set(mobAreaId, markerEl);
        markerLayer.appendChild(markerEl);
      }

      markerEl.className = "marker mob-area-marker";
      markerEl.style.left = `${leftPx}px`;
      markerEl.style.top = `${topPx}px`;
      markerEl.title = waypointTitle;
      markerEl.tabIndex = 0;
      markerEl.setAttribute("role", "button");
      markerEl.setAttribute("aria-label", waypointTitle);
      const zoneColor = normalizeHexColor(area.stroke) || "#5a4ed1";
      const contrastColor = getOppositeHexColor(zoneColor);
      markerEl.style.setProperty("--mob-marker-bg", zoneColor);
      markerEl.style.setProperty("--mob-marker-contrast", contrastColor);
      markerEl.innerHTML = `
        <svg class="mob-area-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path class="mob-area-icon-hex" d="M12 2.2 19.3 6.3 19.3 14.7 12 18.8 4.7 14.7 4.7 6.3Z"/>
          <path class="mob-area-icon-ring" d="M12 7.2a4.8 4.8 0 1 1 0 9.6 4.8 4.8 0 0 1 0-9.6Z"/>
          <path class="mob-area-icon-dot" d="M12 10.2a1.8 1.8 0 1 1 0 3.6 1.8 1.8 0 0 1 0-3.6Z"/>
        </svg>
      `;
      if (sharedMapRuntime.getSelectedMarker() === mobAreaId) {
        markerEl.classList.add("active-marker");
        activeMarkerRendered = true;
      } else {
        markerEl.classList.remove("active-marker");
      }

      renderedCount += 1;
    });
  }

  for (const existingMarker of Array.from(markerLayer.children)) {
    const markerId = existingMarker.dataset.markerId;
    if (!markerId) continue;
    if (!desiredIds.has(markerId)) {
      existingMarker.remove();
      state.markerCache.delete(markerId);
    }
  }

  if (renderedCount === 0) {
    sharedMapRuntime.clearSelectedMarker();
    setMarkerEmptyState(filterText);
    return;
  }

  if (!activeMarkerRendered) {
    sharedMapRuntime.clearSelectedMarker();
    setDefaultSidebarMessage();
  }
}

function openInfo(id) {
  const marker = getContextData().markerDataset[id];
  if (!marker) return;
  const canBeVisited = supportsVisitedCategory(marker.category);
  const markerFloor = marker.floor || "";
  const isVisited = sharedMapRuntime.isMarkerVisited(markerFloor, id);
  const waypointQuery = marker.title;
  const visitedLabel = marker.category === "bossSpawns"
    ? t("page.maps.visitedDefeated")
    : marker.category === "dungeons"
      ? t("page.maps.visitedCompleted")
      : t("page.maps.visitedVisited");
  const showInfoButton = marker.category === "bossSpawns" || marker.category === "sideQuests";
  const bossCategory = marker.underground === true ? "dungeonBoss" : "boss";
  const bestiaryHref = getFloorSpecificBestiaryUrl(marker.floor, bossCategory, waypointQuery);
  const questsHref = getFloorSpecificQuestsUrl(marker.floor, waypointQuery);
  const waypointInfoHref = marker.category === "bossSpawns" ? bestiaryHref : questsHref;
  sharedMapRuntime.setSelectedMarker(id);
  title.textContent = getMarkerText(marker, "title", id);
  const markerType = escapeHtml(getMarkerText(marker, "type", id));
  const markerDescription = escapeHtml(getMarkerText(marker, "description", id));
  const floorText = escapeHtml(String(marker.floor || "").replace("floor", `${t("page.maps.floorText")} `));
  const coordsX = marker.coords && marker.coords.x !== undefined ? escapeHtml(marker.coords.x) : "--";
  const coordsZ = marker.coords && marker.coords.z !== undefined ? escapeHtml(marker.coords.z) : "--";
  content.innerHTML = `
    <p><strong>${t("page.maps.mobType")}:</strong> ${markerType}</p>
    <p>${markerDescription}</p>
    <p><strong>${t("page.maps.floorText")}:</strong> ${floorText}</p>
    <p><strong>${t("page.maps.coordinates")}:</strong> X: ${coordsX} Z: ${coordsZ}</p>
    ${showInfoButton ? `<div class="waypoint-info-row"><button type="button" id="waypointInfoButton" class="waypoint-info-button" data-waypoint-info-href="${escapeHtml(waypointInfoHref)}">${t("page.maps.viewWaypointInfo")}</button></div>` : ""}
    ${canBeVisited ? `<div class="visited-toggle-row"><label class="visited-toggle-label">${visitedLabel}: <input type="checkbox" id="visitedToggle" data-marker-id="${escapeHtml(id)}" data-marker-floor="${escapeHtml(markerFloor)}" ${isVisited ? "checked" : ""}></label></div>` : ""}
  `;

  const previousActive = markerLayer.querySelector(".active-marker");
  if (previousActive) previousActive.classList.remove("active-marker");
  const activeMarker = markerLayer.querySelector(`[data-marker-id="${id}"]`);
  if (activeMarker) activeMarker.classList.add("active-marker");

}

function clearTextSelection() {
  if (window.getSelection) {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      selection.removeAllRanges();
    }
  }
}

function handleWheel(event) {
  event.preventDefault();
  clearTextSelection();
  const rect = mapContainer.getBoundingClientRect();
  const offsetX = event.clientX - rect.left;
  const offsetY = event.clientY - rect.top;
  const direction = event.deltaY < 0 ? 1 : -1;
  const nextZoom = state.zoom * (direction > 0 ? zoomConfig.factor : 1 / zoomConfig.factor);
  setZoom(nextZoom, offsetX, offsetY);
}

function shouldIgnoreMapDrag(target) {
  return Boolean(
    target.closest(".marker") ||
    target.closest("#zoomControls") ||
    target.closest("#sidebar") ||
    target.closest("#infoOverlay") ||
    target.closest("#title") ||
    target.closest("#content") ||
    target.closest("button") ||
    target.closest("input") ||
    target.closest("label")
  );
}

function startDrag(event) {
  if (event.type === "mousedown" && event.button !== 0) return;
  if (event.type === "pointerdown" && event.pointerType === "mouse" && event.button !== 0) return;
  if (shouldIgnoreMapDrag(event.target)) return;
  clearTextSelection();
  event.preventDefault();
  state.isDragging = true;
  mapContainer.classList.add("grabbing");
  state.dragStartX = event.clientX - state.translateX;
  state.dragStartY = event.clientY - state.translateY;
}

function drag(event) {
  if (!pageDisposer || pageDisposer.disposed) return;
  if (!state.isDragging) return;
  state.pendingDragClientX = event.clientX;
  state.pendingDragClientY = event.clientY;
  if (state.dragRafId !== null) return;

  schedulePageAnimationFrame("dragRafId", () => {
    if (!state.isDragging) return;
    state.translateX = state.pendingDragClientX - state.dragStartX;
    state.translateY = state.pendingDragClientY - state.dragStartY;
    updateTransform();
    scheduleRenderMarkers();
  });
}

function stopDrag() {
  if (!state.isDragging) return;
  state.isDragging = false;
  mapContainer.classList.remove("grabbing");
}

function init() {
  if (pageInitialized) return;
  if (!hasRequiredMainUiElements()) {
    showMainUiRuntimeError("The map UI is missing required page elements.");
    return;
  }

  getPageDisposer();
  walkthroughController = window.createWalkthroughController({
    document,
    window,
    storage,
    storageKey: mapWalkthroughStorageKey,
    getSteps: buildWalkthroughSteps,
    translate: t
  });
  getPageDisposer().add(() => {
    walkthroughController?.destroy();
    walkthroughController = null;
  });
  if (!sharedMapRuntime || sharedMapRuntime.isDestroyed()) {
    sharedMapRuntime = createSharedMapRuntime();
    window.__underworldMapRuntime = sharedMapRuntime;
  }
  if (sharedMapRuntime) {
    sharedMapRuntime.init();
  }

  renderCategorySidebar();
  syncIslandNavigation();

  const urlState = sharedMapRuntime.parseUrlState(window.location.search);
  const savedState = loadMapUiState();
  const initialState = urlState.hasParams ? urlState : (savedState || {});
  sharedMapRuntime.replaceCategoryState(initialCategoryState);
  const requestedFloor = initialState.floor || floorSelect.value;
  if (requestedFloor && ["gigasCedar", "iceCave", "rulid", "fishingIsland", "playerIsland"].includes(requestedFloor)) {
    floorSelect.value = requestedFloor;
  }
  if (undergroundToggle) {
    undergroundToggle.checked = Boolean(initialState.underground);
  }
  if (initialState.activeCategories) {
    Object.keys(initialCategoryState).forEach(key => {
      sharedMapRuntime.setCategoryState(key, !!initialState.activeCategories[key]);
    });
  }
  if (searchInput && typeof initialState.search === "string") {
    searchInput.value = initialState.search;
  }
  if (searchInput) {
    searchInput.setAttribute("aria-label", t("page.mainui.searchPlaceholder"));
  }

  if (sharedMapRuntime) {
    sharedMapRuntime.setActiveMapContext(floorSelect.value);
    sharedMapRuntime.setSearchQuery(searchInput ? searchInput.value : "");
    sharedMapRuntime.initializeSidebarResize({
      sidebar,
      handle: sidebarResizeHandle,
      document,
      window,
      onWidthChange: () => scheduleRenderMarkers(),
      onResizeStart: () => document.body.classList.add("resizing-sidebar"),
      onResizeEnd: width => {
        document.body.classList.remove("resizing-sidebar");
        storage.setItem("sao.sidebar.width", String(Math.round(width)));
      }
    });
  }

  applyMapSources(floorSelect.value);

  const persistedWidth = Number(storage.getItem("sao.sidebar.width"));
  if (Number.isFinite(persistedWidth) && persistedWidth > 0) {
    sharedMapRuntime?.setSidebarWidth(persistedWidth);
  } else {
    sharedMapRuntime?.setSidebarWidth(320);
  }

  addPageEventListener(mapContainer, "mousemove", requestCoordinatePanelUpdate);
  addPageEventListener(mapContainer, "pointermove", requestCoordinatePanelUpdate);
  addPageEventListener(mapContainer, "mouseleave", () => {
    state.pendingPointerEvent = null;
    overlayMappedCoords.textContent = t("page.mainui.coordinatesPlaceholder");
  });
  addPageEventListener(mapContainer, "pointerleave", () => {
    state.pendingPointerEvent = null;
    overlayMappedCoords.textContent = t("page.mainui.coordinatesPlaceholder");
  });
  addPageEventListener(mapContainer, "wheel", handleWheel, { passive: false });
  addPageEventListener(mapContainer, "mousedown", startDrag);
  addPageEventListener(mapContainer, "pointerdown", startDrag);
  addPageEventListener(content, "click", handleInfoOverlayClick);
  addPageEventListener(content, "change", handleInfoOverlayChange);
  addPageEventListener(markerLayer, "click", handleMarkerLayerClick);
  addPageEventListener(markerLayer, "keydown", handleMarkerLayerKeydown);
  addPageEventListener(window, "mousemove", event => {
    drag(event);
  });

  addPageEventListener(window, "pointermove", event => {
    drag(event);
  }, { passive: false });

  addPageEventListener(document, "mouseup", () => {
    stopDrag();
  });
  addPageEventListener(document, "pointerup", () => {
    stopDrag();
  });
  addPageEventListener(document, "mouseleave", () => {
    stopDrag();
  });
  addPageEventListener(window, "blur", stopDrag);

  addPageEventListener(resetViewButton, "click", resetView);
  document.querySelectorAll(".island-nav-button").forEach(button => {
    addPageEventListener(button, "click", () => {
      if (!floorSelect) return;
      floorSelect.value = button.dataset.island || floorSelect.value;
      floorSelect.dispatchEvent(new Event("change", { bubbles: true }));
    });
  });
  addPageEventListener(floorSelect, "change", () => {
    sharedMapRuntime?.setActiveMapContext(floorSelect.value);
    renderCategorySidebar();
    syncIslandNavigation();
    applyMapSources(floorSelect.value);
    syncMainCategoryButtonVisibility();
    setUndergroundMode(undergroundToggle.checked);
    scheduleRenderMarkers();
    persistStateToHistory();
  });

  addPageEventListener(undergroundToggle, "change", () => {
    setUndergroundMode(undergroundToggle.checked);
    scheduleRenderMarkers();
    persistStateToHistory();
  });

  addPageEventListener(searchInput, "input", () => {
    sharedMapRuntime?.setSearchQuery(searchInput.value);
    scheduleRenderMarkers();
    persistStateToHistory();
  });

  if (clearFiltersButton) {
    clearFiltersButton.textContent = t("page.mainui.clearFilters");
    addPageEventListener(clearFiltersButton, "click", clearMapFilters);
  }

  attachSectionNavButtons();
  renderCategorySidebar();
  syncIslandNavigation();
  syncMainCategoryButtonVisibility();

  const categoryList = document.getElementById("categoryList");
  if (categoryList) {
    addPageEventListener(categoryList, "click", event => {
      const button = event.target.closest(".sidebar-list-button[data-category]");
      if (!button || button.disabled) return;
      const category = button.dataset.category;
      const nextValue = sharedMapRuntime.toggleCategory(category);
      button.classList.toggle("active", nextValue);
      button.setAttribute("aria-pressed", String(nextValue));
      scheduleRenderMarkers();
      persistStateToHistory();
    });
  }

  categoryToggleButtons.forEach(button => {
    const category = button.dataset.category;
    button.classList.toggle("active", sharedMapRuntime.getCategoryState(category));
    button.setAttribute("aria-pressed", String(sharedMapRuntime.getCategoryState(category)));
  });

  // Re-render when map image finishes loading (naturalWidth becomes available)
  addPageEventListener(mapImage, "load", scheduleRenderMarkers);
  // Re-render on resize so px positions stay accurate
  addPageEventListener(window, "resize", scheduleRenderMarkers);

  setUndergroundMode(undergroundToggle.checked);
  scheduleRenderMarkers();
  setDefaultSidebarMessage();
  updateTransform();
  state.initialZoom = state.zoom;
  state.initialTranslateX = state.translateX;
  state.initialTranslateY = state.translateY;
  // Seed history state so popstate/pageshow can restore it later
  persistStateToHistory();

  schedulePageTimeout(() => {
    startGuidedWalkthrough({ force: false });
  }, 250);

  addPageEventListener(document, "sao:walkthroughrestart", () => {
    startGuidedWalkthrough({ force: true });
  });

  addPageEventListener(document, "sao:languagechange", () => {
    markerSearchCache = null;
    state.markerRenderSignature = "";
    scheduleRenderMarkers();
    if (clearFiltersButton) {
      clearFiltersButton.textContent = t("page.mainui.clearFilters");
    }
    if (searchInput) {
      searchInput.setAttribute("aria-label", t("page.mainui.searchPlaceholder"));
    }
    applyMapSources(floorSelect.value);

    const compendiumButton = document.querySelector('button[data-message]');
    if (compendiumButton) {
      compendiumButton.dataset.message = t("page.mainui.compendiumToast");
    }

    const selectedMarkerId = sharedMapRuntime.getSelectedMarker();
    if (selectedMarkerId && selectedMarkerId.startsWith("mob-area:")) {
      const areaId = selectedMarkerId.slice("mob-area:".length);
      const area = getMobAreaLookup().get(areaId);
      if (area) {
        openMobAreaInfo(area);
        return;
      }
    }
    if (selectedMarkerId && getContextData().markerDataset[selectedMarkerId]) {
      openInfo(selectedMarkerId);
      return;
    }
    setDefaultSidebarMessage();
  });
  addPageEventListener(window, "pageshow", () => {
    syncStateFromDom();
  });
  addPageEventListener(window, "popstate", () => {
    syncStateFromDom();
  });
  pageInitialized = true;
}

function destroyUnderworldMapRuntime() {
  if (pageDisposer) pageDisposer.dispose();
  pageInitialized = false;
  state.isDragging = false;
  state.pendingPointerEvent = null;
  state.markerCache.clear();
  state.coordinateRafId = null;
  state.renderMarkersRafId = null;
  state.dragRafId = null;
  toastTimeoutId = null;
  markerLayer?.replaceChildren?.();
  if (sharedMapRuntime && !sharedMapRuntime.isDestroyed()) {
    sharedMapRuntime.destroy();
  }
}

window.__destroyUnderworldMapRuntime = destroyUnderworldMapRuntime;
window.__initUnderworldMapRuntime = init;

addPageEventListener(window, "DOMContentLoaded", () => {
  try {
    ensureMarkerSearchCache();
    init();
  } catch (error) {
    console.error("Failed to initialize Fractured Underworld map runtime.", error);
    showMainUiRuntimeError();
  }
});

function syncStateFromDom() {
  if (!floorSelect) return;
  // If history contains explicit mapState, restore from it (stronger guarantee).
  // Otherwise parse URL query params or fall back to DOM state.
  const hist = history.state?.mapState || null;
  const urlState = sharedMapRuntime.parseUrlState(window.location.search);
  const mapState = urlState.hasParams ? urlState : hist;

  if (mapState) {
    if (floorSelect && mapState.floor) floorSelect.value = mapState.floor;
    applyMapSources(floorSelect.value);
    if (searchInput && typeof mapState.search === "string") {
      searchInput.value = mapState.search;
    }
    sharedMapRuntime.setSearchQuery(searchInput ? searchInput.value : "");

    // Restore underground checkbox and visual mode
    if (undergroundToggle) undergroundToggle.checked = Boolean(mapState.underground);
    setUndergroundMode(undergroundToggle.checked);

    // Restore category active flags and update DOM classes
    if (mapState.activeCategories) {
      Object.keys(initialCategoryState).forEach(key => {
        sharedMapRuntime.setCategoryState(key, !!mapState.activeCategories[key]);
      });
      categoryToggleButtons.forEach(button => {
        const cat = button.dataset.category;
        const active = sharedMapRuntime.getCategoryState(cat);
        button.classList.toggle('active', active);
      });
    }

    syncMainCategoryButtonVisibility();

    if (urlState.hasParams) {
      persistStateToHistory();
    }
  } else {
    // Ensure map images match the selected floor
    renderCategorySidebar();
    syncIslandNavigation();
    applyMapSources(floorSelect.value);

    // Apply underground visual mode based on the checkbox (bfcache may restore the control state)
    setUndergroundMode(undergroundToggle.checked);

    // Sync category buttons into runtime state so render uses the restored UI classes
    categoryToggleButtons.forEach(button => {
      const cat = button.dataset.category;
      sharedMapRuntime.setCategoryState(cat, button.classList.contains("active"));
    });
    syncMainCategoryButtonVisibility();
  }

  // Recalculate transform and re-render markers
  updateTransform();
  scheduleRenderMarkers();
}

function persistStateToHistory() {
  try {
    const mapState = {
      floor: floorSelect ? floorSelect.value : null,
      underground: undergroundToggle ? Boolean(undergroundToggle.checked) : false,
      search: searchInput ? searchInput.value.trim() : "",
      activeCategories: sharedMapRuntime.getCategoryStates()
    };
    saveMapUiState(mapState);
    const payload = Object.assign({}, history.state || {}, { mapState });
    const query = sharedMapRuntime.serializeUrlState(mapState);
    history.replaceState(payload, document.title, `${window.location.pathname}${query ? `?${query}` : ""}`);
  } catch (e) {
    // Silently ignore storage errors; not critical
  }
}

// When navigating via history (back/forward) or from bfcache restore, the browser
// may restore form control states but the runtime state can be stale. Listen for
// these events and reconcile DOM -> runtime state.
//
