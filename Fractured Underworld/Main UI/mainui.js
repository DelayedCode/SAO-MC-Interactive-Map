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
      listeners.forEach((listener) => listener(event));
    }
  };
}

const elements = {
  mapContainer: document.getElementById("mapContainer"),
  sidebar: document.getElementById("sidebar"),
  mapDataModeBanner: document.getElementById("mapDataModeBanner"),
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
  customWaypointDialog: document.getElementById("customWaypointDialog"),
  customWaypointForm: document.getElementById("customWaypointForm"),
  mapContextMenu: document.getElementById("mapContextMenu"),
  journeyMapImportFile: document.getElementById("journeyMapImportFile"),
  categoryToggleButtons: document.querySelectorAll(".sidebar-list-button[data-category]"),
  globalToast: document.getElementById("globalToast")
};

let categoryToggleButtons = [];

const {
  mapContainer,
  mapDataModeBanner,
  sidebar,
  sidebarResizeHandle,
  mapLayer,
  mapImage,
  undergroundMapImage,
  mobAreaLayer,
  markerLayer,
  title,
  content,
  overlayMappedCoords,
  floorSelect,
  undergroundToggle,
  searchInput,
  clearFiltersButton,
  zoomLabel,
  resetViewButton,
  customWaypointDialog,
  customWaypointForm,
  mapContextMenu,
  journeyMapImportFile,
  globalToast
} = elements;

/* HTML escaping comes from shared/sao-page-helpers.js. */
const { escapeHtml } = window.SAOPageHelpers;

/* Cache, colour, mob-area, pointer and marker-icon helpers come from shared/sao-map-helpers.js. */
const {
  getCachedValue,
  setCachedValue,
  normalizeHexColor,
  getOppositeHexColor,
  getMobAreaCenter,
  formatZoomLabel,
  getGridSquareSize,
  clearTextSelection,
  shouldIgnoreMapDrag,
  getImageLocalCoords,
  copyTextToClipboard,
  CLUSTER_RADIUS_PX,
  CLUSTER_ID_PREFIX,
  isClusteringEnabled,
  buildScreenClusters,
  MARKET_CATEGORIES,
  CRAFTSMAN_CATEGORIES,
  MOB_AREA_LABEL_VERTICAL_OFFSET,
  buildMarketMarkerIcon,
  buildCraftsmanMarkerIcon,
  buildMarkerIcon,
  buildCustomWaypointIcon,
  renderMapRuntimeError
} = window.SAOMapHelpers;

function showMainUiRuntimeError(message) {
  renderMapRuntimeError(title, content, t("page.mainui.runtimeTitle"), message || t("page.mainui.runtimeError"));
}

function hasRequiredMainUiElements() {
  return Boolean(
    mapContainer &&
    sidebar &&
    mapLayer &&
    mapImage &&
    undergroundMapImage &&
    mobAreaLayer &&
    markerLayer &&
    title &&
    content &&
    overlayMappedCoords &&
    floorSelect &&
    undergroundToggle &&
    searchInput &&
    zoomLabel &&
    resetViewButton &&
    customWaypointDialog &&
    customWaypointForm
  );
}

const mapAdapter = window.UnderworldMapAdapter || null;
let customWaypointStore = null;
let mapContextMenuState = { event: null };
let walkthroughContextMenuDemoState = null;
let pendingCustomWaypointFloor = "";
let customWaypointStatusKey = "";
/* Per-context dataset caching, the mob-area lookup and the marker search-cache
   invalidation are owned by the shared accessor factory (shared/sao-map-helpers.js)
   so the Aincrad and Underworld maps cannot drift apart on them. */
const mapContextAccessors = window.SAOMapHelpers.createMapContextAccessors({
  getAdapter: () => mapAdapter,
  getContextId: () => floorSelect?.value || mapAdapter?.defaultFloor || "",
  getAdditionalMarkers: (floor) => customWaypointStore?.getMarkerDataset(floor) || {},
  onContextChange: () => {
    markerSearchCache = null;
  }
});

function getContextData() {
  return mapContextAccessors.getContextData();
}
function getDataEntries() {
  return mapContextAccessors.getDataEntries();
}
function getMobAreas() {
  return mapContextAccessors.getMobAreas();
}
function getMobAreaMobLookup() {
  return mapContextAccessors.getMobAreaMobLookup();
}
function getMobAreaLookup() {
  return mapContextAccessors.getMobAreaLookup();
}

const mapUiStateStorageKey = "sao.map.uiState";
const mapWalkthroughStorageKey = "sao.walkthrough.mainui.completed";
const i18n = window.SAOI18n || null;
const { t, content: contentLookup } = window.SAOPageHelpers.createTranslators(i18n);
const storage = window.SAOPageHelpers.getStorage();

/* The banner inside the map box states which data mode this world is showing. It is written when
   the map initialises and again on language changes - never during pan, zoom or marker work. */
function syncDataModeBanner() {
  if (!mapDataModeBanner) return;
  const key =
    window.SAODatasets?.getDatasetFromLocation() === "current"
      ? "page.maps.dataModeBanner.current"
      : "page.maps.dataModeBanner.beta";
  mapDataModeBanner.setAttribute("data-i18n", key);
  mapDataModeBanner.textContent = t(key);
}

const initialCategoryState = Object.freeze({
  custom: false,
  npc: false,
  rulid: false,
  fishingSpot: false,
  oakWood: false,
  copper: false,
  iron: false,
  coal: false
});

function createSharedMapRuntime() {
  return typeof window.createMapRuntime === "function" && window.UnderworldMapAdapter
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

/* Disposer plus tracked listener / animation-frame / timeout registration live in
   shared/sao-map-helpers.js (createPageLifecycle) so the Aincrad and Underworld
   maps cannot drift apart. These wrappers keep the page-local call sites and the
   `pageDisposer` guard readable; `state` carries the pending-handle keys. */
const pageLifecycle = window.SAOMapHelpers.createPageLifecycle();

function getPageDisposer() {
  pageDisposer = pageLifecycle.getDisposer();
  return pageDisposer;
}

function addPageEventListener(target, type, listener, options) {
  pageLifecycle.addListener(target, type, listener, options);
}

function schedulePageAnimationFrame(stateKey, callback) {
  return pageLifecycle.scheduleAnimationFrame(state, stateKey, callback);
}

function schedulePageTimeout(callback, delay) {
  return pageLifecycle.scheduleTimeout(callback, delay);
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

/* Namespace this world's map content is registered under in the shared content registry
   (shared/sao-content-translations.js). Aincrad owns `map.*`; the Underworld owns
   `underworld-map.*`, so the two datasets can never share or overwrite each other's keys
   while both resolve through the same SAOI18n.content() lookup path. */
const UNDERWORLD_MAP_CONTENT_NAMESPACE = "underworld-map";

/* Registers every Underworld marker and mob area with the shared content registry so
   getMarkerText()/getAreaText() resolve through it instead of falling back to raw English.
   The Aincrad controller registers per active floor because its dataset is huge; the
   Underworld adapter exposes its whole dataset up front (a handful of waypoints across five
   islands), so one pass covers every island the user can switch to. */
function registerUnderworldMapTranslations() {
  const registry = window.SAOContentTranslations;
  if (!registry) return;

  const markers = mapAdapter?.markerDataset || {};
  Object.entries(markers).forEach(([id, marker]) => {
    registry.registerMapMarker?.(id, marker, UNDERWORLD_MAP_CONTENT_NAMESPACE);
  });

  const mobAreas = Array.isArray(mapAdapter?.mobAreaDataset) ? mapAdapter.mobAreaDataset : [];
  mobAreas.forEach((area) => registry.registerMapMobArea?.(area, UNDERWORLD_MAP_CONTENT_NAMESPACE));
}

const state = window.SAOMapHelpers.createInitialMapState();

function syncMainCategoryButtonVisibility() {
  const selectedFloor = floorSelect ? floorSelect.value : "";
  const visibleCategories = new Set(getIslandCategoriesForFloor(selectedFloor));

  categoryToggleButtons.forEach((button) => {
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
  Object.keys(categoryStates).forEach((category) => {
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
  const categories = entries
    .filter(([, allowedFloors]) => !allowedFloors || allowedFloors.includes(selectedFloor))
    .map(([category]) => category);
  if (customWaypointStore?.hasAny()) categories.unshift("custom");
  return categories;
}

function syncIslandNavigation() {
  const islandButtons = document.querySelectorAll(".island-nav-button");
  const selectedFloor = floorSelect?.value || mapAdapter?.defaultFloor || "";
  islandButtons.forEach((button) => {
    const isActive = button.dataset.island === selectedFloor;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
}

function renderCategorySidebar() {
  const categoryList = document.getElementById("categoryList");
  const sectionHeader = document.getElementById("categorySectionHeader");
  const customSidebarSection = document.getElementById("customCategoryItem");
  const customSidebarList = document.getElementById("customWaypointSidebarList");
  const selectedFloor = floorSelect?.value || mapAdapter?.defaultFloor || "";
  const categories = getIslandCategoriesForFloor(selectedFloor);
  customWaypointStore?.initializeButtonEnabledState(sharedMapRuntime.getCategoryState("custom"));
  sharedMapRuntime.setCategoryState("custom", Boolean(customWaypointStore?.hasEnabledButtons(selectedFloor)));

  if (sectionHeader) {
    const labelText = mapAdapter?.floors?.[selectedFloor]?.label || getMapLabel(selectedFloor);
    sectionHeader.textContent = labelText.toUpperCase();
  }

  if (customSidebarSection) customSidebarSection.hidden = !customWaypointStore?.hasAny();
  if (customSidebarList && customWaypointStore) {
    const buttonCounts = customWaypointStore.getButtonCountsForFloor(selectedFloor);
    const buttons = customWaypointStore.getCustomButtonsForFloor(selectedFloor);
    const buttonMarkup = buttons
      .map((buttonName) => {
        const count = buttonCounts[buttonName] || 0;
        const isActive = customWaypointStore.getButtonEnabled(buttonName, selectedFloor);
        return `
          <li class="custom-waypoint-sidebar-row">
            <button class="sidebar-list-button${isActive ? " active" : ""}" type="button" data-custom-button="${escapeHtml(buttonName)}" aria-pressed="${isActive ? "true" : "false"}">
              <span>${escapeHtml(formatCustomButtonName(buttonName))}</span>
              ${count > 0 ? `<span class="marker-count">${count}</span>` : ""}
            </button>
            <button type="button" class="sidebar-list-button custom-button-delete" data-custom-button-delete="${escapeHtml(buttonName)}">${t("page.maps.customWaypoint.deleteButton")}</button>
          </li>
        `;
      })
      .join("");
    customSidebarList.innerHTML = buttonMarkup;
  }

  if (!categoryList) return;

  categoryList.innerHTML = categories
    .filter((category) => category !== "custom")
    .map((category) => {
      const label = t(`page.mainui.categories.${category}`) || category;
      const active = !!(sharedMapRuntime && sharedMapRuntime.getCategoryState(category));
      return `
      <li>
        <button class="sidebar-list-button${active ? " active" : ""}" type="button" data-category="${category}" aria-pressed="${active ? "true" : "false"}">${label}</button>
      </li>
    `;
    })
    .join("");

  categoryToggleButtons = categoryList.querySelectorAll(".sidebar-list-button[data-category]");
  categoryToggleButtons.forEach((button) => {
    const category = button.dataset.category;
    const isActive = !!(sharedMapRuntime && sharedMapRuntime.getCategoryState(category));
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  const categoryStates = sharedMapRuntime?.getCategoryStates?.() || {};
  Object.keys(categoryStates).forEach((category) => {
    if (!categories.includes(category) && category !== "custom") {
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

const mobAreaSearchCache = new Map();

// MOB_AREA_MOBS is defined per-floor in the floor data files (e.g. maps_floor1.js)
// so that each floor can ship its own mob lists. Access via typeof checks
// in the code to avoid undefined errors when a floor doesn't provide data.

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
  return window.SAOPageUtils.buildQueryUrl("../../Aincrad/Bestiary/bestiary.html", { floor, category, search });
}

function getFloorSpecificQuestsUrl(floor, search) {
  return window.SAOPageUtils.buildQueryUrl("../../Aincrad/Quests/quests.html", { floor, search });
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

function attachSectionNavButtons() {
  const nav = document.querySelector(".top-nav");
  if (!nav) return;

  addPageEventListener(nav, "click", (event) => {
    const messageButton = event.target.closest("button[data-message]");
    if (messageButton) {
      showToast(messageButton.dataset.message);
      return;
    }

    const button = event.target.closest("button[data-nav-target]");
    if (!button) return;

    window.SAOPageUtils.navigateToSection(button, {
      sectionPaths: window.SAOPageUtils.UNDERWORLD_SECTION_PATHS,
      floorAwareSections: window.SAOPageUtils.UNDERWORLD_FLOOR_AWARE_SECTIONS,
      floorProvider: () => floorSelect.value
    });
  });
}

/* The entry markup (and the mob id slug) live in shared/sao-map-helpers.js; this wrapper supplies
   the page's own data lookup, localisation and bestiary link. */
function buildMobAreaMobListMarkup(areaId, areaFloor) {
  const mobs = getMobAreaMobLookup()[areaId] || [];
  const areaObj = getMobAreaLookup().get(areaId);
  const category = areaObj && areaObj.underground === true ? "dungeonMobs" : "regular";
  return window.SAOMapHelpers.buildMobAreaMobListMarkup({
    mobs,
    content: contentLookup,
    escapeHtml,
    emptyText: t("page.mainui.noMobEntries"),
    selectLabel: t("page.maps.viewWaypointInfo"),
    getHref: (mob) => {
      const search = mob.search ? mob.search : mob.name;
      const href = getFloorSpecificBestiaryUrl(areaFloor, category, search);
      return category === "dungeonMobs" ? `${href}#dungeonMobs` : href;
    }
  });
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
  const deleteButton = event.target.closest("[data-custom-waypoint-delete]");
  if (deleteButton && content.contains(deleteButton)) {
    deleteCustomWaypoint(deleteButton.dataset.customWaypointDelete || "");
    return;
  }
  const customWaypointButton = event.target.closest("[data-custom-waypoint-open]");
  if (customWaypointButton && content.contains(customWaypointButton)) {
    openInfo(`custom:${customWaypointButton.dataset.customWaypointOpen || ""}`);
    return;
  }
  const actionButton = event.target.closest("[data-waypoint-info-href]");
  if (!actionButton || !content.contains(actionButton)) return;

  const href = window.SAOPageUtils.resolveSafeInternalHref(actionButton.dataset.waypointInfoHref);
  if (!href) return;

  try {
    persistStateToHistory();
  } catch (e) {}
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

  categoryToggleButtons.forEach((button) => {
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
      selector: "#mapContainer",
      title: t("page.mainui.walkthrough.step4Title"),
      body: t("page.mainui.walkthrough.step4Body")
    },
    {
      selector: "#mapContextMenu",
      title: t("page.mainui.walkthrough.step5Title"),
      body: t("page.mainui.walkthrough.step5Body"),
      onEnter: enterWalkthroughContextMenuDemo,
      onExit: exitWalkthroughContextMenuDemo
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

  const corners = area.corners.map((point) => getInverseCoords(point.x, point.z, floor, dimensions)).filter(Boolean);
  setCachedValue(mobAreaCornersCache, key, corners);
  return corners;
}

function getInverseMarkerCoords(marker, floor, dimensions) {
  if (!marker.coords) return null;
  return getInverseCoords(marker.coords.x, marker.coords.z, floor, dimensions);
}

/* ---------------------------------------------------------------------------
   Progressive waypoint clustering

   Waypoints that land close together on screen collapse into one compact cluster
   marker; zooming in progressively releases them back to their real positions, and
   clustering switches off entirely at the shared 7x cutoff. The grouping maths are
   shared with the Aincrad map via shared/sao-map-helpers.js (buildScreenClusters) -
   this page only decides which waypoints are cluster candidates. Stored coordinates
   are never touched, so a released waypoint returns to its own coordinate.
   --------------------------------------------------------------------------- */

/* Clusters rebuilt on every render; the info panel reads them when a cluster is clicked. */
let activeClusters = new Map();

/* Groups the waypoints that are actually renderable right now by on-screen distance.
   Floor, enabled categories, the active search, the underground toggle and the
   viewport are all honoured, so a cluster always represents exactly the waypoints the
   user can currently see, across any mix of categories. */
function buildMarkerClusters(options) {
  const { selectedFloor, filterText, imgScale, offsetX, offsetY, naturalWidth, naturalHeight, viewportBounds } =
    options;
  const empty = { clusters: [], byMember: new Map(), byId: new Map() };
  if (!imgScale || !isClusteringEnabled(state.zoom)) return empty;

  const points = [];
  const addPoint = (id, coords) => {
    if (!coords) return;
    const inv = getInverseCoords(coords.x, coords.z, selectedFloor, { width: naturalWidth, height: naturalHeight });
    if (!inv) return;
    const leftPx = offsetX + inv.rawX * imgScale;
    const topPx = offsetY + inv.rawY * imgScale;
    const screenX = leftPx * state.zoom + state.translateX;
    const screenY = topPx * state.zoom + state.translateY;
    if (
      screenX < viewportBounds.left ||
      screenX > viewportBounds.right ||
      screenY < viewportBounds.top ||
      screenY > viewportBounds.bottom
    )
      return;
    points.push({ id, x: leftPx, y: topPx });
  };

  getDataEntries().forEach(([id, marker]) => {
    if (!marker) return;
    if (marker.floor !== selectedFloor) return;
    if (!sharedMapRuntime.getCategoryState(marker.category)) return;
    if (filterText && !(markerSearchCache.get(id) || "").includes(filterText)) return;
    addPoint(id, marker.coords);
  });

  if (sharedMapRuntime.getCategoryState("mobAreas")) {
    getMobAreas().forEach((area) => {
      if (!area || area.floor !== selectedFloor) return;
      if ((area.underground === true) !== undergroundToggle.checked) return;
      if (filterText && !getMobAreaSearchHaystack(area).includes(filterText)) return;
      addPoint(`mob-area:${area.id}`, getMobAreaCenter(area));
    });
  }

  return buildScreenClusters(points, { radiusPx: CLUSTER_RADIUS_PX, zoom: state.zoom });
}

/* Waypoint Info routing: the same categories and routes the single-marker panel uses.
   Categories without a destination simply get no button, so no destination is invented. */
function supportsWaypointInfo(marker) {
  return Boolean(marker) && (marker.category === "bossSpawns" || marker.category === "sideQuests");
}

function getWaypointInfoHref(marker, markerId) {
  if (!marker) return "";
  const query = marker.title;
  if (marker.category === "bossSpawns") {
    const bossCategory = marker.underground === true ? "dungeonBoss" : "boss";
    return getFloorSpecificBestiaryUrl(marker.floor, bossCategory, query);
  }
  return getFloorSpecificQuestsUrl(marker.floor, query);
}

/* Normalises a waypoint (marker entry or mob area) into one shape for the cluster panel. */
function resolveWaypointEntry(id) {
  if (id.startsWith("mob-area:")) {
    const area = getMobAreaLookup().get(id.slice("mob-area:".length));
    if (!area) return null;
    return {
      id,
      marker: null,
      title: `${getAreaText(area)} ${t("page.maps.mobs")}`,
      description: "",
      floor: area.floor || "",
      coords: getMobAreaCenter(area),
      category: "mobAreas"
    };
  }
  const marker = getContextData().markerDataset[id];
  if (!marker) return null;
  return {
    id,
    marker,
    title: getMarkerText(marker, "title", id),
    description: getMarkerText(marker, "description", id),
    floor: marker.floor || "",
    coords: marker.coords || null,
    category: marker.category
  };
}

/* Combined panel for a cluster: every contained waypoint stays individually reachable,
   with its own details and the same Waypoint Info routing the single-marker panel uses. */
function openClusterInfo(clusterId) {
  const cluster = activeClusters.get(clusterId);
  if (!cluster) return;
  const entries = cluster.memberIds
    .map((memberId) => resolveWaypointEntry(memberId))
    .filter(Boolean)
    .sort((a, b) => a.title.localeCompare(b.title));
  if (!entries.length) return;

  sharedMapRuntime.setSelectedMarker(clusterId);
  title.textContent = t("page.maps.clusterTitle", { count: entries.length });

  const listItems = entries
    .map((entry) => {
      const floorText = escapeHtml(String(entry.floor).replace("floor", `${t("page.maps.floorText")} `));
      const coordsX = entry.coords && entry.coords.x !== undefined ? escapeHtml(entry.coords.x) : "--";
      const coordsZ = entry.coords && entry.coords.z !== undefined ? escapeHtml(entry.coords.z) : "--";
      const href = supportsWaypointInfo(entry.marker) ? getWaypointInfoHref(entry.marker, entry.id) : "";
      return `
      <li class="cluster-entry">
        <details>
          <summary>${escapeHtml(entry.title)}</summary>
          <div class="cluster-entry-body">
            ${entry.description ? `<p>${escapeHtml(entry.description)}</p>` : ""}
            <p><strong>${t("page.maps.floorText")}:</strong> ${floorText}</p>
            <p><strong>${t("page.maps.coordinates")}:</strong> X: ${coordsX} Z: ${coordsZ}</p>
            ${href ? `<div class="waypoint-info-row"><button type="button" class="waypoint-info-button" data-waypoint-info-href="${escapeHtml(href)}">${t("page.maps.viewWaypointInfo")}</button></div>` : ""}
            ${entry.marker?.customWaypointId ? `<button type="button" class="waypoint-info-button" data-custom-waypoint-delete="${escapeHtml(entry.marker.customWaypointId)}">${t("page.maps.customWaypoint.delete")}</button>` : ""}
          </div>
        </details>
      </li>
    `;
    })
    .join("");

  content.innerHTML = `
    <p>${t("page.maps.clusterBody", { count: entries.length })}</p>
    <ul class="cluster-list">${listItems}</ul>
  `;

  const previousActive = markerLayer.querySelector(".active-marker");
  if (previousActive) previousActive.classList.remove("active-marker");
  const activeMarker = markerLayer.querySelector(`[data-marker-id="${clusterId}"]`);
  if (activeMarker) activeMarker.classList.add("active-marker");
}

/* Wheel/keyboard zoom step and the clamp range used by setZoom(). Defined once in
   shared/sao-map-helpers.js so both interactive maps cannot drift apart on the zoom domain. */
const zoomConfig = window.SAOMapHelpers.MAP_ZOOM_CONFIG;

function mapCoordinates(rawX, rawY, dimensions) {
  if (typeof mapWebsiteCoordinates !== "function") return null;
  return mapWebsiteCoordinates(rawX, rawY, floorSelect.value, dimensions);
}

function getMapCoordinatesFromEvent(event) {
  const info = getImageLocalCoords(mapImage, event);
  if (!info.naturalWidth || !info.naturalHeight || !info.contentWidth || !info.contentHeight) return null;
  const rawX = info.localX * (info.naturalWidth / info.contentWidth);
  const rawY = info.localY * (info.naturalHeight / info.contentHeight);
  return mapCoordinates(rawX, rawY, { width: info.naturalWidth, height: info.naturalHeight });
}

function closeMapContextMenu() {
  const menu = document.getElementById("mapContextMenu");
  if (!menu) return;
  menu.hidden = true;
  menu.setAttribute("aria-hidden", "true");
  mapContextMenuState = { event: null };
}

function updateMapContextMenuPosition(clientX, clientY) {
  const menu = document.getElementById("mapContextMenu");
  if (!menu || menu.hidden) return;

  const menuWidth = menu.offsetWidth || 220;
  const menuHeight = menu.offsetHeight || 200;
  const left = Math.min(Math.max(12, clientX + 12), window.innerWidth - menuWidth - 12);
  const top = Math.min(Math.max(12, clientY + 12), window.innerHeight - menuHeight - 12);
  menu.style.left = `${left}px`;
  menu.style.top = `${top}px`;
}

function openMapContextMenu(event) {
  const isUnavailableMapSurface = Boolean(
    mapAdapter?.assetAvailability?.[floorSelect?.value] !== true &&
      event.target &&
      typeof event.target.closest === "function" &&
      mapContainer.contains(event.target) &&
      !shouldIgnoreMapDrag(event.target) &&
      !event.target.closest("dialog, a, [role='button'], [role='dialog']")
  );
  if (!isMapSurfaceTarget(event.target) && !isUnavailableMapSurface) {
    closeMapContextMenu();
    return;
  }
  const mapped = getMapCoordinatesFromEvent(event);
  if (!mapped && !isUnavailableMapSurface) {
    closeMapContextMenu();
    return;
  }

  event.preventDefault();
  const menu = document.getElementById("mapContextMenu");
  if (!menu) return;

  mapContextMenuState = { event };
  menu.hidden = false;
  menu.setAttribute("aria-hidden", "false");
  updateMapContextMenuPosition(event.clientX, event.clientY);
}

function enterWalkthroughContextMenuDemo() {
  const menu = document.getElementById("mapContextMenu");
  if (!menu) return;

  if (!walkthroughContextMenuDemoState) {
    walkthroughContextMenuDemoState = {
      left: menu.style.left,
      top: menu.style.top,
      zIndex: menu.style.zIndex
    };
  }

  if (menu.hidden) {
    const mapRect = mapImage?.getBoundingClientRect?.();
    if (!mapRect) return;
    mapImage.dispatchEvent(
      new MouseEvent("contextmenu", {
        bubbles: true,
        cancelable: true,
        clientX: mapRect.left + mapRect.width / 2,
        clientY: mapRect.top + mapRect.height / 2
      })
    );
  }
  if (menu.hidden) return;

  const rect = menu.getBoundingClientRect();
  menu.style.left = `${Math.max(0, (window.innerWidth - rect.width) / 2)}px`;
  menu.style.top = `${Math.max(0, (window.innerHeight - rect.height) / 2)}px`;
  menu.style.zIndex = "119";
}

function exitWalkthroughContextMenuDemo() {
  if (!walkthroughContextMenuDemoState) return;
  const menu = document.getElementById("mapContextMenu");
  closeMapContextMenu();
  if (menu) {
    menu.style.left = walkthroughContextMenuDemoState.left;
    menu.style.top = walkthroughContextMenuDemoState.top;
    menu.style.zIndex = walkthroughContextMenuDemoState.zIndex;
  }
  walkthroughContextMenuDemoState = null;
}

/* Collects the enabled Fractured Underworld waypoint categories for export. The shared exporter
   builds the category structure; this only supplies the Underworld's own category state, marker
   dataset, ids and custom-category colour resolver. */
function getJourneyMapExportCategories() {
  const runtime = sharedMapRuntime || window.__underworldMapRuntime || null;
  const activeCategories = runtime && typeof runtime.getCategoryStates === "function" ? runtime.getCategoryStates() : {};
  const contextData = getContextData ? getContextData() : { markerDataset: {} };
  const world = mapAdapter?.mapId || mapAdapter?.id || "underworld";
  return window.SAOJourneyMapExport.collectJourneyMapExportCategories({
    categories: activeCategories,
    markers: contextData.markerDataset || {},
    floor: floorSelect ? floorSelect.value : mapAdapter?.defaultFloor || "",
    world,
    dimensionId: String(mapAdapter?.id || "overworld"),
    resolveCustomCategoryColor: (buttonName, floor) =>
      customWaypointStore?.getButtonColor(buttonName, floor) ||
      ensurePersistedCustomWaypointCategoryColor(buttonName, floor)
  });
}

function exportCurrentJourneyMapWaypoints() {
  const exporter = window.SAOJourneyMapExport;
  const runtime = sharedMapRuntime || window.__underworldMapRuntime || null;

  if (!exporter || typeof exporter.buildJourneyMapExport !== "function") {
    showToast(getJourneyMapImportMessage("exportFailure"));
    return;
  }

  let objectUrl = "";
  let anchor = null;
  try {
    const categories = getJourneyMapExportCategories();
    const enabledCategoryCount = Object.values(runtime?.getCategoryStates?.() || {}).filter(Boolean).length;
    const waypointCount = Object.values(categories).reduce((count, entries) => count + entries.length, 0);
    if (!runtime || enabledCategoryCount === 0) {
      showToast(getJourneyMapImportMessage("exportNoWaypoints"));
      return;
    }
    if (waypointCount === 0) {
      showToast(getJourneyMapImportMessage("exportEmptyCategories"));
      return;
    }

    const worldName = mapAdapter?.mapId || mapAdapter?.id || "underworld";
    const config = {
      world: worldName,
      dimensionId: exporter.normalizeDimensionId(worldName, mapAdapter?.id || worldName),
      categories,
      settings: { enable: true, hideEmpty: false, sortType: "asc" }
    };

    const exportPayload = exporter.buildJourneyMapExport(config);
    const blob = exportPayload.toBlob();
    objectUrl = URL.createObjectURL(blob);
    anchor = document.createElement("a");
    anchor.href = objectUrl;
    anchor.download = "WaypointData.dat";
    document.body.appendChild(anchor);
    anchor.click();

    const countLabel = getJourneyMapImportMessage(
      waypointCount === 1 ? "exportWaypointOne" : "exportWaypointMany",
      { count: waypointCount }
    );
    showToast(getJourneyMapImportMessage("exportSuccess", { countLabel }));
  } catch {
    showToast(getJourneyMapImportMessage("exportFailure"));
  } finally {
    anchor?.remove();
    if (objectUrl) schedulePageTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
  }
}

function getJourneyMapImportTargets() {
  const logoIds = window.SAOCustomWaypoints?.LOGO_IDS || [];
  return [window.AincradMapAdapter, window.UnderworldMapAdapter]
    .filter(Boolean)
    .map((adapter) => ({
      id: adapter.id,
      defaultFloor: adapter.defaultFloor,
      floors: adapter.floors,
      journeymapDimensionId: window.SAOJourneyMapExport?.normalizeDimensionId(adapter.mapId || adapter.id, adapter.id),
      logoIds
    }));
}

function getJourneyMapImportMessage(key, params) {
  return t(`${mapAdapter?.translationNamespace || "page.mainui"}.mapContextMenu.${key}`, params);
}

async function importJourneyMapFile(file) {
  try {
    const importer = window.SAOJourneyMapImport;
    if (!importer || !file || typeof file.arrayBuffer !== "function") throw new Error("unavailable");
    const plan = importer.prepareJourneyMapImport(await file.arrayBuffer(), getJourneyMapImportTargets(), mapAdapter?.id);
    if (plan.records.length === 0) {
      showToast(getJourneyMapImportMessage("importNoWaypoints"));
      return;
    }

    const batches = new Map();
    plan.records.forEach((entry) => {
      if (!batches.has(entry.world)) batches.set(entry.world, []);
      batches.get(entry.world).push(entry.record);
    });
    const targets = new Map(getJourneyMapImportTargets().map((target) => [target.id, target]));
    const stores = new Map();
    for (const [world, records] of batches) {
      const store = world === customWaypointStore?.world
        ? customWaypointStore
        : window.SAOCustomWaypoints.createCustomWaypointStore({
            storage,
            world,
            floorIds: Object.keys(targets.get(world)?.floors || {})
          });
      if (!store || !store.canAddMany(records)) throw new Error("store-validation");
      stores.set(world, store);
    }

    let importedCount = 0;
    let duplicateCount = 0;
    const importedCategories = new Set();
    let currentWorldChanged = false;
    for (const [world, records] of batches) {
      const result = stores.get(world).addMany(records);
      if (!result) throw new Error("store-write");
      importedCount += result.records.length;
      duplicateCount += result.duplicateCount;
      result.records.forEach((record) => importedCategories.add(`${world}\u0000${record.button}`));
      records.forEach((record) => stores.get(world).setButtonEnabled(record.button, record.floor, true));
      if (world === customWaypointStore?.world && records.length > 0) currentWorldChanged = true;
    }

    if (currentWorldChanged) {
      sharedMapRuntime.setCategoryState("custom", customWaypointStore.hasEnabledButtons(floorSelect.value));
      refreshCustomWaypointData(true);
    }
    if (importedCount === 0) {
      const key = duplicateCount === 1 ? "importDuplicatesOne" : "importDuplicatesMany";
      showToast(getJourneyMapImportMessage(key, { count: duplicateCount }));
      return;
    }
    if (duplicateCount > 0) {
      const newLabel = getJourneyMapImportMessage(importedCount === 1 ? "importNewOne" : "importNewMany", {
        count: importedCount
      });
      const duplicateLabel = getJourneyMapImportMessage(
        duplicateCount === 1 ? "importDuplicateOne" : "importDuplicateMany",
        { count: duplicateCount }
      );
      showToast(getJourneyMapImportMessage("importPartial", { newLabel, duplicateLabel }));
      return;
    }
    showToast(
      getJourneyMapImportMessage("importSuccess", {
        waypoints: importedCount,
        categories: importedCategories.size,
        waypointLabel: getJourneyMapImportMessage(
          importedCount === 1 ? "importWaypointOne" : "importWaypointMany"
        ),
        categoryLabel: getJourneyMapImportMessage(
          importedCategories.size === 1 ? "importCategoryOne" : "importCategoryMany"
        )
      })
    );
  } catch (error) {
    const outcome =
      error?.code === "unsupported" ? "importUnsupported" : error?.code === "invalid" ? "importInvalid" : "importFailure";
    showToast(getJourneyMapImportMessage(outcome));
  } finally {
    if (journeyMapImportFile) journeyMapImportFile.value = "";
  }
}

function handleMapContextMenuAction(event) {
  const actionButton = event.target.closest("[data-map-action]");
  if (!actionButton) return;
  event.preventDefault();
  event.stopPropagation();

  const action = actionButton.dataset.mapAction;
  const sourceEvent = mapContextMenuState.event;

  if (action === "create-custom-marker" && sourceEvent) {
    openCustomWaypointDialog(sourceEvent);
  } else if (action === "journey-export") {
    exportCurrentJourneyMapWaypoints();
  } else if (action === "journey-import") {
    journeyMapImportFile?.click();
  }

  closeMapContextMenu();
}

function isMapSurfaceTarget(target) {
  return Boolean(
    target &&
    typeof target.closest === "function" &&
    mapLayer.contains(target) &&
    !target.closest("#mapEmptyState") &&
    !shouldIgnoreMapDrag(target) &&
    !target.closest("dialog, a, [role='button'], [role='dialog']")
  );
}

let customWaypointDeleteTargetId = "";
let customButtonDeleteState = null;

function getCustomButtonDefaultLabel() {
  return t("page.maps.customWaypoint.buttonDefault") || "Default";
}

function formatCustomButtonName(buttonName) {
  const trimmed = String(buttonName || "").trim();
  if (!trimmed) return getCustomButtonDefaultLabel();
  return trimmed === "Default" ? getCustomButtonDefaultLabel() : trimmed;
}

function setCustomWaypointStatus(key) {
  customWaypointStatusKey = key || "";
  const statusMessage = document.getElementById("customWaypointStatusMessage");
  if (statusMessage) {
    statusMessage.textContent = key ? t(`page.maps.customWaypoint.${key}`) : "";
    return;
  }
  document.getElementById("customWaypointStatus").textContent = key ? t(`page.maps.customWaypoint.${key}`) : "";
}

function openCustomWaypointDeleteDialog(recordId) {
  const dialog = document.getElementById("customWaypointDeleteDialog");
  const message = document.getElementById("customWaypointDeleteMessage");
  if (!dialog || !message || !recordId) return;
  customWaypointDeleteTargetId = recordId;
  message.textContent = t("page.maps.customWaypoint.deleteConfirm");
  dialog.showModal();
}

function closeCustomWaypointDeleteDialog() {
  const dialog = document.getElementById("customWaypointDeleteDialog");
  if (dialog && dialog.open) dialog.close();
  customWaypointDeleteTargetId = "";
}

function confirmCustomWaypointDelete() {
  const recordId = customWaypointDeleteTargetId;
  const record = recordId ? customWaypointStore.getRecord(recordId) : null;
  if (!record) {
    closeCustomWaypointDeleteDialog();
    return;
  }
  const markerId = `custom:${recordId}`;
  const shouldRender = sharedMapRuntime.getCategoryState("custom");
  customWaypointStore.remove(recordId);
  const markerElement = state.markerCache.get(markerId);
  markerElement?.remove();
  state.markerCache.delete(markerId);
  if (sharedMapRuntime.getSelectedMarker() === markerId) {
    sharedMapRuntime.clearSelectedMarker();
    setDefaultSidebarMessage();
  }
  closeCustomWaypointDeleteDialog();
  refreshCustomWaypointData(shouldRender);
}

function updateCustomButtonDeleteCountdown() {
  const state = customButtonDeleteState;
  const confirmButton = document.getElementById("customButtonDeleteConfirm");
  if (!state || !confirmButton) return;

  const elapsedSeconds = Math.max(0, Math.floor((Date.now() - state.startedAt) / 1000));
  const remainingSeconds = Math.max(0, 5 - elapsedSeconds);

  if (state.phase === "countdown") {
    if (remainingSeconds <= 0) {
      state.phase = "delete";
      if (state.timerId) {
        window.clearInterval(state.timerId);
        state.timerId = null;
      }
      confirmButton.textContent = t("page.maps.customWaypoint.confirmDelete");
      confirmButton.disabled = false;
      return;
    }
    confirmButton.textContent = `${t("page.maps.customWaypoint.areYouSure")} (${remainingSeconds})`;
    confirmButton.disabled = true;
    return;
  }

  if (state.phase === "delete") {
    confirmButton.textContent = t("page.maps.customWaypoint.confirmDelete");
    confirmButton.disabled = false;
    return;
  }

  confirmButton.textContent = t("page.maps.customWaypoint.confirmAction");
  confirmButton.disabled = false;
}

function closeCustomButtonDeleteDialog() {
  const dialog = document.getElementById("customButtonDeleteDialog");
  const confirmButton = document.getElementById("customButtonDeleteConfirm");
  if (customButtonDeleteState?.timerId) {
    window.clearInterval(customButtonDeleteState.timerId);
  }
  customButtonDeleteState = null;
  if (confirmButton) {
    confirmButton.textContent = t("page.maps.customWaypoint.deleteAction");
    confirmButton.disabled = false;
  }
  if (dialog && dialog.open) dialog.close();
}

function openCustomButtonDeleteDialog(buttonName, floor) {
  const dialog = document.getElementById("customButtonDeleteDialog");
  const confirmButton = document.getElementById("customButtonDeleteConfirm");
  const description = document.getElementById("customButtonDeleteDescription");
  if (!dialog || !buttonName || !description) return;

  closeCustomButtonDeleteDialog();
  customButtonDeleteState = {
    buttonName,
    floor,
    startedAt: 0,
    timerId: null,
    phase: "ready"
  };
  if (confirmButton) {
    confirmButton.textContent = t("page.maps.customWaypoint.deleteAction");
    confirmButton.disabled = false;
  }
  description.textContent = t("page.maps.customWaypoint.deleteButtonWarning");
  dialog.showModal();
}

function confirmCustomButtonDelete() {
  const state = customButtonDeleteState;
  const confirmButton = document.getElementById("customButtonDeleteConfirm");
  if (!state || !customWaypointStore || !confirmButton) return;

  if (state.phase === "countdown") {
    return;
  }

  if (state.phase === "confirm") {
    state.phase = "countdown";
    state.startedAt = Date.now();
    confirmButton.disabled = true;
    confirmButton.textContent = `${t("page.maps.customWaypoint.areYouSure")} (5)`;
    state.timerId = window.setInterval(() => {
      updateCustomButtonDeleteCountdown();
    }, 1000);
    return;
  }

  if (state.phase === "delete") {
    const removed = customWaypointStore.removeButton(state.buttonName, state.floor);
    closeCustomButtonDeleteDialog();
    if (removed > 0) {
      refreshCustomWaypointData(true);
    }
    return;
  }

  state.phase = "confirm";
  confirmButton.textContent = t("page.maps.customWaypoint.confirmAction");
  confirmButton.disabled = false;
}

function handleCustomSidebarClick(event) {
  const deleteButton = event.target.closest("[data-custom-button-delete]");
  if (deleteButton) {
    const buttonName = deleteButton.dataset.customButtonDelete || "";
    if (buttonName) openCustomButtonDeleteDialog(buttonName, floorSelect.value);
    return;
  }

  const selectorButton = event.target.closest("[data-custom-button]");
  if (selectorButton && customWaypointStore) {
    const buttonName = selectorButton.dataset.customButton || "";
    if (!buttonName) return;
    customWaypointStore.setButtonEnabled(
      buttonName,
      floorSelect.value,
      !customWaypointStore.getButtonEnabled(buttonName, floorSelect.value)
    );
    sharedMapRuntime.setCategoryState("custom", customWaypointStore.hasEnabledButtons(floorSelect.value));
    refreshCustomWaypointData(true);
  }
}

function getCustomWaypointButtonOptions() {
  const buttons = customWaypointStore
    ? customWaypointStore.getCustomButtonsForFloor(pendingCustomWaypointFloor || floorSelect.value)
    : [];
  const normalized = [];
  const seen = new Set();
  buttons.forEach((buttonName) => {
    const normalizedName = String(buttonName || "").trim() || "Default";
    const key = normalizedName.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    normalized.push(normalizedName);
  });
  return ["__create__", ...normalized];
}

function normalizeCustomWaypointCategoryColor(value) {
  const colorUtils = window.SAOColorUtils || window.SAOJourneyMapColors;
  if (colorUtils && typeof colorUtils.normalizeHexColor === "function") {
    return colorUtils.normalizeHexColor(value);
  }
  if (typeof value !== "string" && typeof value !== "number") return null;
  const raw = String(value).trim();
  const normalized = raw.startsWith("#") ? raw.slice(1) : raw;
  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) return null;
  return `#${normalized.toUpperCase()}`;
}

function generateRandomCustomWaypointCategoryColor() {
  const colorUtils = window.SAOColorUtils || window.SAOJourneyMapColors;
  if (colorUtils && typeof colorUtils.randomHexColor === "function") {
    for (let attempt = 0; attempt < 10; attempt += 1) {
      const candidate = normalizeCustomWaypointCategoryColor(colorUtils.randomHexColor());
      if (candidate && candidate.toUpperCase() !== "#FFFFFF") {
        return candidate;
      }
    }
  }
  let candidate = "#";
  do {
    candidate = "#";
    for (let index = 0; index < 3; index += 1) {
      candidate += Math.floor(Math.random() * 256)
        .toString(16)
        .padStart(2, "0");
    }
  } while (candidate.toUpperCase() === "#FFFFFF");
  return candidate.toUpperCase();
}

function applyCustomWaypointCategoryColor(value) {
  const colorInput = document.getElementById("customWaypointCategoryColor");
  const hexInput = document.getElementById("customWaypointCategoryHex");
  const swatch = document.getElementById("customWaypointCategorySwatch");
  const normalized = normalizeCustomWaypointCategoryColor(value) || generateRandomCustomWaypointCategoryColor();
  if (colorInput) colorInput.value = normalized;
  if (hexInput) hexInput.value = normalized;
  if (swatch) {
    swatch.style.background = normalized;
    swatch.style.borderColor = normalized;
  }
  return normalized;
}

function updateCustomWaypointCategoryColorState() {
  const select = document.getElementById("customWaypointButtonSelect");
  const row = document.getElementById("customWaypointCategoryColorRow");
  const isCreating = select && select.value === "__create__";
  if (row) row.hidden = !isCreating;
  if (!isCreating) return;
  const colorInput = document.getElementById("customWaypointCategoryColor");
  const hexInput = document.getElementById("customWaypointCategoryHex");
  const buttonName = document.getElementById("customWaypointButtonName")?.value.trim().toLowerCase();
  const isBiomes = buttonName === "biomes";
  const picker = colorInput?.closest(".custom-waypoint-color-picker");
  const hint = document.getElementById("customWaypointCategoryColorHint");
  if (picker) picker.dataset.locked = String(isBiomes);
  if (colorInput) colorInput.disabled = isBiomes;
  if (hexInput) hexInput.readOnly = isBiomes;
  if (hint) {
    hint.textContent = t(
      isBiomes ? "page.maps.customWaypoint.colorHintBiomes" : "page.maps.customWaypoint.colorHint"
    );
  }
  const enteredHex = hexInput?.value || "";
  const pickerValue = colorInput?.value || "";
  const currentValue = normalizeCustomWaypointCategoryColor(enteredHex)
    ? enteredHex
    : normalizeCustomWaypointCategoryColor(pickerValue) && pickerValue.toUpperCase() !== "#000000"
      ? pickerValue
      : "";
  applyCustomWaypointCategoryColor(isBiomes ? "#FFFFFF" : currentValue || generateRandomCustomWaypointCategoryColor());
}

function getCustomWaypointCategoryColorValue() {
  const hexInput = document.getElementById("customWaypointCategoryHex");
  const colorInput = document.getElementById("customWaypointCategoryColor");
  const value = normalizeCustomWaypointCategoryColor((hexInput && hexInput.value) || (colorInput && colorInput.value) || "");
  if (hexInput && !value) {
    hexInput.setCustomValidity(t("page.maps.customWaypoint.invalidHex"));
    hexInput.reportValidity();
    return null;
  }
  if (hexInput) hexInput.setCustomValidity("");
  return value;
}

function ensurePersistedCustomWaypointCategoryColor(buttonName, floor) {
  if (!customWaypointStore) return null;
  const savedColor = customWaypointStore.getButtonColor(buttonName, floor);
  if (savedColor) return savedColor;
  const generatedColor = generateRandomCustomWaypointCategoryColor();
  customWaypointStore.setButtonColor(buttonName, floor, generatedColor);
  return generatedColor;
}

function syncCustomWaypointButtonOptions() {
  const select = document.getElementById("customWaypointButtonSelect");
  const row = document.getElementById("customWaypointButtonNameRow");
  const input = document.getElementById("customWaypointButtonName");
  if (!select) return;
  const previousValue = select.value;
  const options = getCustomWaypointButtonOptions();
  select.innerHTML = "";
  options.forEach((buttonName) => {
    const option = document.createElement("option");
    option.value = buttonName;
    option.textContent =
      buttonName === "__create__" ? t("page.maps.customWaypoint.createButton") : formatCustomButtonName(buttonName);
    select.appendChild(option);
  });
  const nextValue = options.includes(previousValue) ? previousValue : options[0] || "";
  select.value = nextValue;
  const isCreating = select.value === "__create__";
  if (row) row.hidden = !isCreating;
  if (input) input.value = "";
  updateCustomWaypointCategoryColorState();
}

function getSelectedCustomWaypointButtonName() {
  const select = document.getElementById("customWaypointButtonSelect");
  const input = document.getElementById("customWaypointButtonName");
  if (!select) return "Default";
  if (select.value === "__create__") {
    const entered = (input?.value || "").trim();
    return entered || "Default";
  }
  return String(select.value || "Default").trim() || "Default";
}

function resetCustomWaypointForm() {
  customWaypointForm.reset();
  ["customWaypointName", "customWaypointX", "customWaypointZ", "customWaypointButtonName"].forEach((id) => {
    const field = document.getElementById(id);
    if (field) field.setCustomValidity("");
  });
  const buttonNameRow = document.getElementById("customWaypointButtonNameRow");
  if (buttonNameRow) buttonNameRow.hidden = true;
  syncCustomWaypointButtonOptions();
  setCustomWaypointStatus("");
}

function maybeOpenCustomWaypointDialogFromMapClick(event) {
  if (!event || event.defaultPrevented || event.button !== 0 || event.detail < 3) return;
  if (event.target.closest(".marker, button, input, select, textarea, label, dialog, #infoOverlay, #zoomControls, #mapEmptyState")) {
    return;
  }
  if (customWaypointDialog.open || !customWaypointStore) return;
  openCustomWaypointDialog(event);
}

function openCustomWaypointDialog(event) {
  if (!customWaypointStore || customWaypointDialog.open) return;
  pendingCustomWaypointFloor = floorSelect.value;
  resetCustomWaypointForm();
  const mapped = getMapCoordinatesFromEvent(event);
  if (mapped) {
    document.getElementById("customWaypointX").value = String(Math.round(mapped.x));
    document.getElementById("customWaypointZ").value = String(Math.round(mapped.z));
  }
  customWaypointDialog.showModal();
  if (!mapped) {
    setCustomWaypointStatus("manualCoordinates");
  }
  document.getElementById("customWaypointName").focus();
}

function closeCustomWaypointDialog() {
  if (customWaypointDialog.open) customWaypointDialog.close();
}

async function copyCustomWaypointCoordinates() {
  const x = document.getElementById("customWaypointX").value;
  const z = document.getElementById("customWaypointZ").value;
  const text = `X: ${x} Z: ${z}`;
  const copied = await copyTextToClipboard(text);
  setCustomWaypointStatus(copied ? "copySuccess" : "copyError");
}

function refreshCustomWaypointData(renderVisibleMarkers) {
  mapContextAccessors.invalidate();
  markerSearchCache = null;
  state.markerRenderSignature = "";
  if (!customWaypointStore.hasAny()) sharedMapRuntime.setCategoryState("custom", false);
  state.customWaypointListSignature = "";
  renderCategorySidebar();
  syncMainCategoryButtonVisibility();
  const canProjectCustomWaypoints = typeof mapAdapter?.coordinateDependencies?.invertMapCoordinates === "function";
  if (renderVisibleMarkers && canProjectCustomWaypoints) scheduleRenderMarkers();
  else if (!canProjectCustomWaypoints && sharedMapRuntime.getCategoryState("custom")) {
    setMarkerEmptyState(sharedMapRuntime.getSearchQuery());
  }
}

function createCustomWaypoint(event) {
  event.preventDefault();
  const nameInput = document.getElementById("customWaypointName");
  const xInput = document.getElementById("customWaypointX");
  const zInput = document.getElementById("customWaypointZ");
  const name = nameInput.value.trim();
  const xText = xInput.value.trim();
  const zText = zInput.value.trim();
  const validCoordinates = xText && zText && Number.isFinite(Number(xText)) && Number.isFinite(Number(zText));
  if (!name) {
    nameInput.setCustomValidity(t("page.maps.customWaypoint.nameRequired"));
    nameInput.reportValidity();
    setCustomWaypointStatus("nameRequired");
    return;
  }
  nameInput.setCustomValidity("");
  if (!validCoordinates) {
    const message = t("page.maps.customWaypoint.coordinatesRequired");
    xInput.setCustomValidity(message);
    zInput.setCustomValidity(message);
    (xText ? zInput : xInput).reportValidity();
    setCustomWaypointStatus("coordinatesRequired");
    return;
  }
  xInput.setCustomValidity("");
  zInput.setCustomValidity("");

  const buttonName = getSelectedCustomWaypointButtonName();
  const categoryColor =
    document.getElementById("customWaypointButtonSelect")?.value === "__create__"
      ? getCustomWaypointCategoryColorValue()
      : undefined;
  if (
    document.getElementById("customWaypointButtonSelect")?.value === "__create__" &&
    !categoryColor
  ) {
    document.getElementById("customWaypointCategoryHex")?.setCustomValidity(t("page.maps.customWaypoint.invalidHex"));
    document.getElementById("customWaypointCategoryHex")?.reportValidity();
    return;
  }

  const record = customWaypointStore.add({
    name,
    description: document.getElementById("customWaypointDescription").value,
    x: xText,
    z: zText,
    floor: pendingCustomWaypointFloor,
    button: buttonName,
    color: categoryColor,
    logo: document.getElementById("customWaypointLogo").value
  });
  if (!record) return;
  customWaypointStore.setButtonEnabled(buttonName, pendingCustomWaypointFloor, true);
  sharedMapRuntime.setCategoryState("custom", customWaypointStore.hasEnabledButtons(pendingCustomWaypointFloor));
  refreshCustomWaypointData(sharedMapRuntime.getCategoryState("custom"));
  closeCustomWaypointDialog();
  openInfo(`custom:${record.id}`);
}

function deleteCustomWaypoint(recordId) {
  if (!customWaypointStore.getRecord(recordId)) return;
  openCustomWaypointDeleteDialog(recordId);
}

function updateCoordinatePanelFromEvent(event) {
  const info = getImageLocalCoords(mapImage, event);
  /* The whole viewport is valid coordinate space (same treatment as the Aincrad map): the cursor is
     projected through the existing linear map math, so the readout is not limited to the artwork
     rectangle. mapCoordinates() still returns null when this map has no calibration configured, and
     the viewport edge - the container's pointerleave - is the only boundary. */
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
  /* The viewport checker/grid squares scale with zoom but stay anchored to the viewport, so panning
     never moves them. Only written when the value changes, to avoid repainting the grid while
     dragging. */
  const gridSize = `${getGridSquareSize(state.zoom)}px`;
  if (mapContainer.style.getPropertyValue("--map-grid-size") !== gridSize) {
    mapContainer.style.setProperty("--map-grid-size", gridSize);
  }
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
  mapImage.style.opacity = enabled ? 0.1 : 1;
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
  const canProjectCustomWaypoints = typeof mapAdapter?.coordinateDependencies?.invertMapCoordinates === "function";
  if (!canProjectCustomWaypoints && sharedMapRuntime.getCategoryState("custom")) {
    const normalizedFilter = sharedMapRuntime.normalizeSearchQuery(filterText || "");
    const listSignature = [
      floorSelect.value,
      normalizedFilter,
      customWaypointStore.getRevision(),
      i18n?.getLanguage?.() || "en"
    ].join("|");
    if (state.customWaypointListSignature === listSignature) return;
    const customRecords = customWaypointStore
      .getRecordsForFloor(floorSelect.value)
      .filter(
        (record) => !normalizedFilter || `${record.name} ${record.description}`.toLowerCase().includes(normalizedFilter)
      );
    if (customRecords.length > 0) {
      title.textContent = t("page.maps.customWaypoint.category");
      const entries = customRecords
        .map(
          (record) => `
            <li class="custom-waypoint-list-item">
              <button type="button" class="custom-waypoint-open" data-custom-waypoint-open="${escapeHtml(record.id)}" aria-label="${escapeHtml(t("page.maps.viewWaypointInfo"))}: ${escapeHtml(record.name)}">${escapeHtml(record.name)}</button>
              ${record.description ? `<p>${escapeHtml(record.description)}</p>` : ""}
              <p><strong>${t("page.maps.customWaypoint.coordinatesLabel")}:</strong> X: ${escapeHtml(record.x)} Z: ${escapeHtml(record.z)}</p>
              <button type="button" class="waypoint-info-button" data-custom-waypoint-delete="${escapeHtml(record.id)}">${t("page.maps.customWaypoint.delete")}</button>
            </li>
          `
        )
        .join("");
      content.innerHTML = `<p>${t("page.maps.customWaypoint.manualCoordinates")}</p><ul id="customWaypointFallbackList" class="custom-waypoint-list">${entries}</ul>`;
      state.customWaypointListSignature = listSignature;
      return;
    }
    state.customWaypointListSignature = listSignature;
  } else {
    state.customWaypointListSignature = "";
  }
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

  mobAreas.forEach((area) => {
    if (area.floor !== selectedFloor) return;
    const isAreaUnderground = area.underground === true;
    if (isAreaUnderground !== undergroundToggle.checked) return;

    const projectedPoints = getInvertedMobAreaCorners(area, selectedFloor, {
      width: mapImage.naturalWidth,
      height: mapImage.naturalHeight
    }).map((inv) => ({
      x: offsetX + inv.rawX * imgScale,
      y: offsetY + inv.rawY * imgScale
    }));

    if (projectedPoints.length < 3) return;

    const points = projectedPoints.map((point) => `${point.x},${point.y}`);

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
    const minX = Math.min(...projectedPoints.map((point) => point.x));
    const maxX = Math.max(...projectedPoints.map((point) => point.x));
    const minY = Math.min(...projectedPoints.map((point) => point.y));
    const maxY = Math.max(...projectedPoints.map((point) => point.y));
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
  return [
    selectedFloor,
    filterText,
    undergroundToggle.checked ? "underground" : "surface",
    enabledCategories.join(","),
    viewportKey,
    viewKey
  ].join("|");
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
  const clustering = buildMarkerClusters({
    selectedFloor,
    filterText,
    imgScale,
    offsetX,
    offsetY,
    naturalWidth,
    naturalHeight,
    viewportBounds
  });
  activeClusters = clustering.byId;
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
    const isVisibleWithinViewport =
      screenX >= viewportBounds.left &&
      screenX <= viewportBounds.right &&
      screenY >= viewportBounds.top &&
      screenY <= viewportBounds.bottom;
    if (!isVisibleWithinViewport) return;
    /* Clustered waypoints are represented by their cluster marker instead. */
    if (clustering.byMember.has(id)) return;

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
      return isUnderground ? (undergroundToggle.checked ? 1 : 0.1) : undergroundToggle.checked ? 0.1 : 1;
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

    markerEl.style.removeProperty("--custom-waypoint-color");
    if (marker.customWaypointId) {
      markerEl.classList.add("custom-marker");
      const customWaypointColor = marker.color || marker.customWaypointButtonColor;
      if (customWaypointColor) markerEl.style.setProperty("--custom-waypoint-color", customWaypointColor);
      else markerEl.style.removeProperty("--custom-waypoint-color");
      markerEl.innerHTML = buildCustomWaypointIcon(marker.customLogo);
    } else if (markerType === "biome" || markerType === "dungeon" || markerType === "boss") {
      markerEl.innerHTML = buildMarkerIcon(markerType);
    } else if (isSideQuest) {
      markerEl.classList.add("side-quest-marker");
      markerEl.innerHTML = buildMarkerIcon("sideQuest");
    } else if (isAlchemist) {
      markerEl.classList.add("alchemist-marker");
      markerEl.innerHTML = buildMarkerIcon("alchemist");
    } else if (isLumberjack) {
      markerEl.classList.add("lumberjack-marker");
      markerEl.innerHTML = buildMarkerIcon("lumberjack");
    } else if (isCraftsmenCategory) {
      markerEl.classList.add("craftsman-marker", `${marker.category}-marker`);
      markerEl.innerHTML = buildCraftsmanMarkerIcon(marker.category);
    } else if (isMarketCategory) {
      markerEl.classList.add("market-marker", `${marker.category}-marker`);
      markerEl.innerHTML = buildMarketMarkerIcon(marker.category);
    } else {
      markerEl.textContent = markerType.charAt(0);
    }

    markerEl.classList.toggle(
      "visited",
      supportsVisitedCategory(marker.category) && sharedMapRuntime.isMarkerVisited(marker.floor, id)
    );
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
    mobAreasList.forEach((area) => {
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
      const isVisibleWithinViewport =
        screenX >= viewportBounds.left &&
        screenX <= viewportBounds.right &&
        screenY >= viewportBounds.top &&
        screenY <= viewportBounds.bottom;
      if (!isVisibleWithinViewport) return;

      const mobAreaId = `mob-area:${area.id}`;
      /* Clustered mob areas are represented by their cluster marker instead. */
      if (clustering.byMember.has(mobAreaId)) return;
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
      markerEl.innerHTML = buildMarkerIcon("mobArea");
      if (sharedMapRuntime.getSelectedMarker() === mobAreaId) {
        markerEl.classList.add("active-marker");
        activeMarkerRendered = true;
      } else {
        markerEl.classList.remove("active-marker");
      }

      renderedCount += 1;
    });
  }

  /* Compact cluster markers for the waypoints that are grouped at this zoom level. */
  clustering.clusters.forEach((cluster) => {
    desiredIds.add(cluster.id);
    let markerEl = state.markerCache.get(cluster.id);
    if (!markerEl) {
      markerEl = document.createElement("div");
      markerEl.dataset.markerId = cluster.id;
      state.markerCache.set(cluster.id, markerEl);
      markerLayer.appendChild(markerEl);
    }
    const size = cluster.memberIds.length;
    const label = t("page.maps.clusterTitle", { count: size });
    markerEl.className = "marker cluster-marker";
    markerEl.style.left = `${cluster.x}px`;
    markerEl.style.top = `${cluster.y}px`;
    markerEl.style.opacity = 1;
    markerEl.innerHTML = `<span class="cluster-count">${size}</span>`;
    markerEl.title = label;
    markerEl.tabIndex = 0;
    markerEl.setAttribute("role", "button");
    markerEl.setAttribute("aria-label", label);
    const selectedId = sharedMapRuntime.getSelectedMarker();
    const isActive = selectedId === cluster.id || cluster.memberIds.includes(selectedId);
    markerEl.classList.toggle("active-marker", isActive);
    if (isActive) activeMarkerRendered = true;
    renderedCount += 1;
  });

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
  if (id.startsWith(CLUSTER_ID_PREFIX)) {
    openClusterInfo(id);
    return;
  }
  const marker = getContextData().markerDataset[id];
  if (!marker) return;
  const canBeVisited = supportsVisitedCategory(marker.category);
  const markerFloor = marker.floor || "";
  const isVisited = sharedMapRuntime.isMarkerVisited(markerFloor, id);
  const visitedLabel =
    marker.category === "bossSpawns"
      ? t("page.maps.visitedDefeated")
      : marker.category === "dungeons"
        ? t("page.maps.visitedCompleted")
        : t("page.maps.visitedVisited");
  const showInfoButton = supportsWaypointInfo(marker);
  const waypointInfoHref = getWaypointInfoHref(marker, id);
  sharedMapRuntime.setSelectedMarker(id);
  title.textContent = getMarkerText(marker, "title", id);
  const markerType = escapeHtml(
    marker.customWaypointId ? t("page.maps.customWaypoint.category") : getMarkerText(marker, "type", id)
  );
  const markerDescription = escapeHtml(getMarkerText(marker, "description", id));
  const customRecord = marker.customWaypointId ? customWaypointStore.getRecord(marker.customWaypointId) : null;
  const floorText = escapeHtml(String(marker.floor || "").replace("floor", `${t("page.maps.floorText")} `));
  const coordsX = marker.coords && marker.coords.x !== undefined ? escapeHtml(marker.coords.x) : "--";
  const coordsZ = marker.coords && marker.coords.z !== undefined ? escapeHtml(marker.coords.z) : "--";
  content.innerHTML = `
    <p><strong>${t("page.maps.mobType")}:</strong> ${markerType}</p>
    <p>${markerDescription}</p>
    <p><strong>${t("page.maps.floorText")}:</strong> ${floorText}</p>
    <p><strong>${t("page.maps.coordinates")}:</strong> X: ${coordsX} Z: ${coordsZ}</p>
    ${showInfoButton ? `<div class="waypoint-info-row"><button type="button" id="waypointInfoButton" class="waypoint-info-button" data-waypoint-info-href="${escapeHtml(waypointInfoHref)}">${t("page.maps.viewWaypointInfo")}</button></div>` : ""}
    ${customRecord ? `<div class="waypoint-info-row"><button type="button" class="waypoint-info-button" data-custom-waypoint-delete="${escapeHtml(customRecord.id)}">${t("page.maps.customWaypoint.delete")}</button></div>` : ""}
    ${canBeVisited ? `<div class="visited-toggle-row"><label class="visited-toggle-label">${visitedLabel}: <input type="checkbox" id="visitedToggle" data-marker-id="${escapeHtml(id)}" data-marker-floor="${escapeHtml(markerFloor)}" ${isVisited ? "checked" : ""}></label></div>` : ""}
  `;

  const previousActive = markerLayer.querySelector(".active-marker");
  if (previousActive) previousActive.classList.remove("active-marker");
  const activeMarker = markerLayer.querySelector(`[data-marker-id="${id}"]`);
  if (activeMarker) activeMarker.classList.add("active-marker");
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
  if (!customWaypointStore) {
    customWaypointStore = window.SAOCustomWaypoints.createCustomWaypointStore({
      storage,
      world: "underworld",
      floorIds: Object.keys(mapAdapter.floors)
    });
    mapContextAccessors.invalidate();
  }
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

  syncIslandNavigation();

  const urlState = sharedMapRuntime.parseUrlState(window.location.search);
  const savedState = loadMapUiState();
  const initialState = urlState.hasParams ? urlState : savedState || {};
  sharedMapRuntime.replaceCategoryState(initialCategoryState);
  const requestedFloor = initialState.floor || floorSelect.value;
  if (requestedFloor && ["gigasCedar", "iceCave", "rulid", "fishingIsland", "playerIsland"].includes(requestedFloor)) {
    floorSelect.value = requestedFloor;
  }
  registerUnderworldMapTranslations();
  syncDataModeBanner();
  if (undergroundToggle) {
    undergroundToggle.checked = Boolean(initialState.underground);
  }
  if (initialState.activeCategories) {
    Object.keys(initialCategoryState).forEach((key) => {
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
      onResizeEnd: (width) => {
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
  addPageEventListener(mapContainer, "contextmenu", openMapContextMenu);
  addPageEventListener(mapContainer, "click", maybeOpenCustomWaypointDialogFromMapClick);
  addPageEventListener(document, "click", (event) => {
    if (!mapContextMenu || mapContextMenu.hidden) return;
    if (walkthroughContextMenuDemoState) return;
    if (!mapContextMenu.contains(event.target)) closeMapContextMenu();
  });
  addPageEventListener(document, "keydown", (event) => {
    if (event.key === "Escape") closeMapContextMenu();
  });
  addPageEventListener(mapContextMenu, "click", handleMapContextMenuAction);
  addPageEventListener(journeyMapImportFile, "change", (event) => {
    const file = event.target.files && event.target.files[0];
    if (file) importJourneyMapFile(file);
  });
  addPageEventListener(document.getElementById("customWaypointForm"), "submit", createCustomWaypoint);
  addPageEventListener(document.getElementById("customWaypointCancel"), "click", closeCustomWaypointDialog);
  addPageEventListener(document.getElementById("customWaypointCopy"), "click", copyCustomWaypointCoordinates);
  addPageEventListener(document.getElementById("customWaypointDeleteConfirm"), "click", confirmCustomWaypointDelete);
  addPageEventListener(document.getElementById("customWaypointDeleteCancel"), "click", closeCustomWaypointDeleteDialog);
  addPageEventListener(document.getElementById("customButtonDeleteConfirm"), "click", confirmCustomButtonDelete);
  addPageEventListener(document.getElementById("customButtonDeleteCancel"), "click", closeCustomButtonDeleteDialog);
  addPageEventListener(document.getElementById("customWaypointSidebarList"), "click", handleCustomSidebarClick);
  addPageEventListener(customWaypointDialog, "close", () => {
    resetCustomWaypointForm();
    pendingCustomWaypointFloor = "";
  });
  addPageEventListener(document.getElementById("customWaypointDeleteDialog"), "close", closeCustomWaypointDeleteDialog);
  addPageEventListener(document.getElementById("customButtonDeleteDialog"), "close", closeCustomButtonDeleteDialog);
  ["customWaypointName", "customWaypointX", "customWaypointZ"].forEach((id) => {
    addPageEventListener(document.getElementById(id), "input", (event) => event.target.setCustomValidity(""));
  });
  const customWaypointColorHexInput = document.getElementById("customWaypointCategoryHex");
  const customWaypointColorInput = document.getElementById("customWaypointCategoryColor");
  addPageEventListener(document.getElementById("customWaypointButtonName"), "input", updateCustomWaypointCategoryColorState);
  if (customWaypointColorHexInput) {
    addPageEventListener(customWaypointColorHexInput, "input", () => {
      const normalized = normalizeCustomWaypointCategoryColor(customWaypointColorHexInput.value);
      if (normalized) {
        customWaypointColorHexInput.setCustomValidity("");
        applyCustomWaypointCategoryColor(normalized);
      } else {
        customWaypointColorHexInput.setCustomValidity(t("page.maps.customWaypoint.invalidHex"));
      }
    });
  }
  if (customWaypointColorInput) {
    addPageEventListener(customWaypointColorInput, "input", () => {
      const normalized = normalizeCustomWaypointCategoryColor(customWaypointColorInput.value);
      if (normalized) {
        applyCustomWaypointCategoryColor(normalized);
      }
    });
  }
  addPageEventListener(document.getElementById("customWaypointButtonSelect"), "change", updateCustomWaypointCategoryColorState);
  addPageEventListener(content, "click", handleInfoOverlayClick);
  addPageEventListener(content, "change", handleInfoOverlayChange);
  addPageEventListener(markerLayer, "click", handleMarkerLayerClick);
  addPageEventListener(markerLayer, "keydown", handleMarkerLayerKeydown);
  addPageEventListener(window, "mousemove", (event) => {
    drag(event);
  });

  addPageEventListener(
    window,
    "pointermove",
    (event) => {
      drag(event);
    },
    { passive: false }
  );

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
  addPageEventListener(document.getElementById("zoomIn"), "click", (event) => {
    event.stopPropagation();
    const rect = mapContainer.getBoundingClientRect();
    setZoom(state.zoom * zoomConfig.factor, rect.width / 2, rect.height / 2);
  });
  addPageEventListener(document.getElementById("zoomOut"), "click", (event) => {
    event.stopPropagation();
    const rect = mapContainer.getBoundingClientRect();
    setZoom(state.zoom / zoomConfig.factor, rect.width / 2, rect.height / 2);
  });
  document.querySelectorAll(".island-nav-button").forEach((button) => {
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
    addPageEventListener(categoryList, "click", (event) => {
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

  categoryToggleButtons.forEach((button) => {
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
    syncDataModeBanner();
    renderCategorySidebar();
    syncMainCategoryButtonVisibility();
    markerSearchCache = null;
    state.markerRenderSignature = "";
    scheduleRenderMarkers();
    if (clearFiltersButton) {
      clearFiltersButton.textContent = t("page.mainui.clearFilters");
    }
    if (searchInput) {
      searchInput.setAttribute("aria-label", t("page.mainui.searchPlaceholder"));
    }
    if (customWaypointDialog.open && customWaypointStatusKey) {
      setCustomWaypointStatus(customWaypointStatusKey);
    }
    applyMapSources(floorSelect.value);

    const compendiumButton = document.querySelector("button[data-message]");
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
    const canProjectCustomWaypoints = typeof mapAdapter?.coordinateDependencies?.invertMapCoordinates === "function";
    if (!canProjectCustomWaypoints && sharedMapRuntime.getCategoryState("custom")) {
      state.customWaypointListSignature = "";
      setMarkerEmptyState(sharedMapRuntime.getSearchQuery());
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
      Object.keys(initialCategoryState).forEach((key) => {
        sharedMapRuntime.setCategoryState(key, !!mapState.activeCategories[key]);
      });
      categoryToggleButtons.forEach((button) => {
        const cat = button.dataset.category;
        const active = sharedMapRuntime.getCategoryState(cat);
        button.classList.toggle("active", active);
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
    categoryToggleButtons.forEach((button) => {
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
