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
  floorSelect: document.getElementById("floorSelect"),
  undergroundToggle: document.getElementById("undergroundToggle"),
  searchInput: document.getElementById("search"),
  zoomLabel: document.getElementById("zoomLabel"),
  resetViewButton: document.getElementById("resetView"),
  categoryToggleButtons: document.querySelectorAll(".sidebar-list-button[data-category]")
};

const { mapContainer, sidebar, sidebarResizeHandle, mapLayer, mapImage, undergroundMapImage, mobAreaLayer, markerLayer, title, content, overlayMappedCoords, floorSelect, undergroundToggle, searchInput, zoomLabel, resetViewButton, categoryToggleButtons } = elements;

function getDataEntries() { return Object.entries(DATA); }

const state = {
  zoom: 1,
  translateX: 0,
  translateY: 0,
  isDragging: false,
  isResizingSidebar: false,
  sidebarResizeStartX: 0,
  sidebarResizeStartWidth: 0,
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
  activeMarkerId: null,
  visitedMarkerIds: loadVisitedMarkers(),
  activeCategories: {
    biomes: false,
    dungeons: false,
    mobAreas: false,
    bossSpawns: false,
    sideQuests: false,
    alchemist: false,
    lumberjack: false,
    lootBuyers: false,
    weaponSellers: false,
    travelingMerchants: false,
    equipmentMerchants: false,
    toolMerchants: false,
    accessoriesMerchants: false,
    occultMerchants: false,
    consumablesMerchants: false,
    refaire: false,
    weaponsmith: false,
    armorBlacksmith: false,
    ingotBlacksmith: false,
    keyBlacksmith: false,
    accessoriesBlacksmith: false,
    runeCraftsmen: false
  }
};

const sidebarResizeConfig = {
  min: 260,
  max: 520,
  defaultWidth: 320,
  storageKey: "sao.sidebar.width"
};

const visitedMarkersStorageKey = "sao.visitedMarkers";
const mapUiStateStorageKey = "sao.map.uiState";

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
    // Keep map usable even if storage is blocked.
  }
}

function loadMapUiState() {
  try {
    const raw = getPersistentItem(mapUiStateStorageKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    return parsed;
  } catch {
    return null;
  }
}

function saveMapUiState(mapState) {
  setPersistentItem(mapUiStateStorageKey, JSON.stringify(mapState));
}

function loadVisitedMarkers() {
  try {
    const raw = getPersistentItem(visitedMarkersStorageKey);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter(id => typeof id === "string"));
  } catch {
    return new Set();
  }
}

function persistVisitedMarkers() {
  setPersistentItem(visitedMarkersStorageKey, JSON.stringify(Array.from(state.visitedMarkerIds)));
}

function setMarkerVisited(id, isVisited) {
  if (isVisited) {
    state.visitedMarkerIds.add(id);
  } else {
    state.visitedMarkerIds.delete(id);
  }
  persistVisitedMarkers();
}

function syncMarkerVisitedClass(id, isVisited) {
  const markerEl = markerLayer.querySelector(`[data-marker-id="${id}"]`);
  if (!markerEl) return;
  markerEl.classList.toggle("visited", isVisited);
}

function supportsVisitedCategory(category) {
  return category === "biomes" || category === "dungeons" || category === "bossSpawns";
}

function normalizeSearchValue(value) {
  return String(value || "").trim().toLowerCase();
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
  if (mobAreaCenterCache.has(area.id)) {
    return mobAreaCenterCache.get(area.id);
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
  mobAreaCenterCache.set(area.id, center);
  return center;
}

const mobAreaCenterCache = new Map();
const MOB_AREA_LABEL_VERTICAL_OFFSET = 16;

// MOB_AREA_MOBS is defined per-floor in the floor data files (e.g. maps_floor1.js)
// so that each floor can ship its own mob lists. Access via typeof checks
// in the code to avoid undefined errors when a floor doesn't provide data.

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
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

const SECTION_PATHS = {
  maps: "../Map/maps.html",
  bestiary: "../Bestiary/bestiary.html",
  equipment: "../eCompendium/ecompendium.html",
  quests: "../Quests/quests.html",
  patchnotes: "../Patchnotes/patchnotes.html"
};

const FLOOR_AWARE_SECTIONS = new Set(["maps", "bestiary", "equipment", "quests"]);

function buildSectionUrl(section, floor) {
  const path = SECTION_PATHS[section] || "#";
  if (path === "#") return path;
  if (!floor || !FLOOR_AWARE_SECTIONS.has(section)) return path;
  return `${path}?${new URLSearchParams({ floor }).toString()}`;
}

function parseUrlState() {
  const params = new URLSearchParams(window.location.search);
  const search = params.get("search") || params.get("q") || "";
  const activeCategories = params.has("categories")
    ? params.get("categories").split(",").reduce((result, category) => {
        if (category) result[category] = true;
        return result;
      }, {})
    : {};

  return {
    floor: params.get("floor"),
    underground: params.get("underground") === "1",
    search,
    activeCategories,
    hasParams: params.has("floor") || params.has("underground") || params.has("categories") || params.has("search") || params.has("q")
  };
}

function buildUrlFromState(mapState) {
  const params = new URLSearchParams();
  if (mapState.floor) params.set("floor", mapState.floor);
  if (mapState.underground) params.set("underground", "1");
  if (mapState.search) params.set("search", mapState.search);
  const active = Object.entries(mapState.activeCategories || {})
    .filter(([, value]) => value)
    .map(([key]) => key);
  if (active.length) params.set("categories", active.join(","));
  return `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ""}`;
}

function attachSectionNavButtons() {
  const nav = document.querySelector(".top-nav");
  if (!nav) return;

  nav.addEventListener("click", event => {
    const button = event.target.closest("button[data-nav-target]");
    if (!button) return;
    window.location.href = buildSectionUrl(button.dataset.navTarget, floorSelect.value);
  });
}

function buildMobAreaMobListMarkup(areaId, areaFloor) {
  const mobLookup = (typeof MOB_AREA_MOBS !== "undefined" ? MOB_AREA_MOBS : {});
  const mobs = mobLookup[areaId] || [];
  if (mobs.length === 0) {
    return `<p>No mob entries available yet for this zone.</p>`;
  }

  return `
    <ul class="mob-area-entry-list">
      ${mobs.map(mob => {
        const search = mob.search ? mob.search : mob.name;
        const areaObj = (typeof MOB_AREAS !== 'undefined' && Array.isArray(MOB_AREAS)) ? MOB_AREAS.find(a => a.id === areaId) : null;
        const category = areaObj && areaObj.underground === true ? "dungeonMobs" : "regular";
        let href = getFloorSpecificBestiaryUrl(areaFloor, category, search);
        if (category === "dungeonMobs") href += "#dungeonMobs";
        return `
          <li class="mob-area-entry-item">
            <span class="mob-area-entry-name">${escapeHtml(mob.name)}</span>
            <button type="button" class="mob-area-info-button" data-waypoint-info-href="${href}">Go to Waypoint Information</button>
          </li>
        `;
      }).join("")}
    </ul>
  `;
}

function openMobAreaInfo(area) {
  const center = getMobAreaCenter(area);
  const titleText = `${area.title} Mobs`;
  state.activeMarkerId = `mob-area:${area.id}`;
  title.textContent = titleText;
  content.innerHTML = `
    <p><strong>Type:</strong> Mob Area</p>
    <p>${area.title} Available Mobs</p>
    <p><strong>Floor:</strong> ${area.floor.replace("floor", "Floor ")}</p>
    <p><strong>Coordinates:</strong> X: ${center ? center.x : "--"} Z: ${center ? center.z : "--"}</p>
    <p><strong>Mobs:</strong></p>
    ${buildMobAreaMobListMarkup(area.id, area.floor)}
  `;

  content.querySelectorAll(".mob-area-info-button").forEach(button => {
    button.addEventListener("click", () => {
      const href = button.dataset.waypointInfoHref;
      if (!href) return;
      try { persistStateToHistory(); } catch (e) {}
      window.location.href = href;
    });
  });

  const previousActive = markerLayer.querySelector(".active-marker");
  if (previousActive) previousActive.classList.remove("active-marker");
  const activeMarker = markerLayer.querySelector(`[data-marker-id="mob-area:${area.id}"]`);
  if (activeMarker) activeMarker.classList.add("active-marker");
}

let markerSearchCache = null;
function ensureMarkerSearchCache() {
  if (markerSearchCache) return;
  markerSearchCache = new Map(
    getDataEntries().map(([id, marker]) => [
      id,
      `${id} ${marker.title} ${marker.type}`.toLowerCase()
    ])
  );
}

const inverseCoordCache = new Map();
const mobAreaCornersCache = new Map();

function getInverseCoords(x, z, floor, dimensions) {
  const dimKey = dimensions ? `${dimensions.width}x${dimensions.height}` : "na";
  const key = `${floor}:${dimKey}:${x}:${z}`;
  if (inverseCoordCache.has(key)) {
    return inverseCoordCache.get(key);
  }

  const inv = invertMapCoordinates(x, z, floor, dimensions);
  inverseCoordCache.set(key, inv || null);
  return inv || null;
}

function getInvertedMobAreaCorners(area, floor, dimensions) {
  const dimKey = dimensions ? `${dimensions.width}x${dimensions.height}` : "na";
  const key = `${area.id}:${floor}:${dimKey}`;
  if (mobAreaCornersCache.has(key)) {
    return mobAreaCornersCache.get(key);
  }

  const corners = area.corners
    .map(point => getInverseCoords(point.x, point.z, floor, dimensions))
    .filter(Boolean);
  mobAreaCornersCache.set(key, corners);
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
  return mapWebsiteCoordinates(rawX, rawY, floorSelect.value, dimensions);
}

function updateCoordinatePanelFromEvent(event) {
  const info = getImageLocalCoords(event);
  if (info.localX < 0 || info.localY < 0 || info.localX > info.contentWidth || info.localY > info.contentHeight) {
    overlayMappedCoords.textContent = "X: -- Z: --";
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
    overlayMappedCoords.textContent = "X: -- Z: --";
  }
}

function requestCoordinatePanelUpdate(event) {
  state.pendingPointerEvent = event;
  if (state.coordinateRafId !== null) return;

  state.coordinateRafId = window.requestAnimationFrame(() => {
    state.coordinateRafId = null;
    if (!state.pendingPointerEvent) return;
    updateCoordinatePanelFromEvent(state.pendingPointerEvent);
    state.pendingPointerEvent = null;
  });
}

function updateTransform() {
  const mapTransform = `translate(${state.translateX}px, ${state.translateY}px) scale(${state.zoom})`;
  mapLayer.style.transform = mapTransform;
  markerLayer.querySelectorAll(".marker").forEach(markerEl => {
    const markerScale = 1 / state.zoom;
    const markerAnchorY = getComputedStyle(markerEl).getPropertyValue("--marker-anchor-y") || "-50%";
    markerEl.style.transform = `translate(-50%, ${markerAnchorY}) scale(${markerScale.toFixed(6)})`;
  });
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
  title.textContent = "Select a marker";
  content.innerHTML = `<p>Choose a marker on the map to see details.</p>`;
}

function hasActiveMarkerCategories() {
  return Object.values(state.activeCategories).some(Boolean);
}

function setMarkerEmptyState(filterText) {
  const hasActiveCategories = hasActiveMarkerCategories();

  if (!hasActiveCategories && !filterText) {
    title.textContent = "Choose a category";
    content.innerHTML = `<p>Turn on one or more categories in the sidebar to display markers for this floor.</p>`;
    return;
  }

  if (filterText) {
    title.textContent = "No search matches";
    content.innerHTML = `<p>No markers match your current search on this floor.</p>`;
    return;
  }

  title.textContent = "No markers available";
  content.innerHTML = `<p>No markers are available for the currently selected categories on this floor.</p>`;
}

function renderMobAreas(selectedFloor, imgScale, offsetX, offsetY) {
  if (!mobAreaLayer) return;

  const isEnabled = state.activeCategories.mobAreas === true;
  if (!isEnabled || !imgScale) {
    mobAreaLayer.replaceChildren();
    return;
  }

  const svgNS = "http://www.w3.org/2000/svg";
  const fragment = document.createDocumentFragment();

  MOB_AREAS.forEach(area => {
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
    titleEl.textContent = area.title;
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
    const sizeByWidth = zoneWidth / Math.max(area.title.length * 0.62, 1);
    const sizeByHeight = zoneHeight * 0.34;
    const labelSize = Math.max(12, Math.min(34, Math.min(sizeByWidth, sizeByHeight)));

    const label = document.createElementNS(svgNS, "text");
    label.setAttribute("class", "mob-area-label");
    label.setAttribute("x", centerX.toFixed(2));
    label.setAttribute("y", (centerY - MOB_AREA_LABEL_VERTICAL_OFFSET).toFixed(2));
    label.style.setProperty("--mob-area-label-color", area.stroke);
    label.style.setProperty("--mob-area-label-size", `${labelSize.toFixed(1)}px`);
    label.textContent = area.title;
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
  if (state.renderMarkersRafId !== null) return;
  state.renderMarkersRafId = window.requestAnimationFrame(() => {
    state.renderMarkersRafId = null;
    renderMarkers();
  });
}

function renderMarkers() {
  const selectedFloor = floorSelect.value;
  const filterText = normalizeSearchValue(searchInput.value);
  const fragment = document.createDocumentFragment();
  let renderedCount = 0;
  let activeMarkerRendered = false;

  // Precompute letterbox metrics for accurate marker placement
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
  getDataEntries().forEach(([id, marker]) => {
    const matchesFloor = marker.floor === selectedFloor;
    const matchesSearch = (markerSearchCache.get(id) || "").includes(filterText);

    const categoryEnabled = state.activeCategories[marker.category] || false;
    if (!matchesFloor || !categoryEnabled || (filterText && !matchesSearch)) return;

    // Derive pixel position from game coordinates
    if (!imgScale || !marker.coords) return;
    const inv = getInverseMarkerCoords(marker, selectedFloor, {
      width: naturalWidth,
      height: naturalHeight
    });
    if (!inv) return;
    const leftPx = offsetX + inv.rawX * imgScale;
    const topPx  = offsetY + inv.rawY * imgScale;

    const markerEl = document.createElement("div");
    const markerType = marker.type.toLowerCase();
    const isSideQuest = marker.category === "sideQuests";
    const isAlchemist = marker.category === "alchemist";
    const isLumberjack = marker.category === "lumberjack";
    const isCraftsmenCategory = [
      "weaponsmith",
      "armorBlacksmith",
      "ingotBlacksmith",
      "keyBlacksmith",
      "accessoriesBlacksmith",
      "runeCraftsmen",
      "refaire"
    ].includes(marker.category);
    const isMarketCategory = [
      "lootBuyers",
      "weaponSellers",
      "travelingMerchants",
      "equipmentMerchants",
      "toolMerchants",
      "accessoriesMerchants",
      "occultMerchants",
      "consumablesMerchants"
    ].includes(marker.category);
    markerEl.className = `marker ${markerType}`;
    markerEl.dataset.markerId = id;
    markerEl.style.left = `${leftPx}px`;
    markerEl.style.top  = `${topPx}px`;
    const markerAnchorY = getComputedStyle(markerEl).getPropertyValue("--marker-anchor-y") || "-50%";
    markerEl.style.transform = `translate(-50%, ${markerAnchorY}) scale(${(1 / state.zoom).toFixed(6)})`;
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
    markerEl.title = marker.title;
    const canBeVisited = supportsVisitedCategory(marker.category);
    markerEl.classList.toggle("visited", canBeVisited && state.visitedMarkerIds.has(id));
    const isUnderground = marker.underground === true;
    const opacity = isUnderground
      ? (undergroundToggle.checked ? 1 : 0.10)
      : (undergroundToggle.checked ? 0.10 : 1);
    markerEl.style.opacity = opacity;
    markerEl.addEventListener("click", () => openInfo(id));
    if (state.activeMarkerId === id) {
      markerEl.classList.add("active-marker");
      activeMarkerRendered = true;
    }
    fragment.appendChild(markerEl);
    renderedCount += 1;
  });

  const mobAreasEnabled = state.activeCategories.mobAreas === true;
  if (mobAreasEnabled && imgScale) {
    MOB_AREAS.forEach(area => {
      if (area.floor !== selectedFloor) return;
      const isAreaUnderground = area.underground === true;
      if (isAreaUnderground !== undergroundToggle.checked) return;

      const waypointTitle = `${area.title} Mobs`;
      const searchHaystack = normalizeSearchValue(`${area.id} ${waypointTitle} mob area`);
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

      const markerEl = document.createElement("div");
      markerEl.className = "marker mob-area-marker";
      markerEl.dataset.markerId = `mob-area:${area.id}`;
      markerEl.style.left = `${leftPx}px`;
      markerEl.style.top = `${topPx}px`;
      markerEl.title = waypointTitle;
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
      markerEl.addEventListener("click", () => openMobAreaInfo(area));

      if (state.activeMarkerId === `mob-area:${area.id}`) {
        markerEl.classList.add("active-marker");
        activeMarkerRendered = true;
      }

      fragment.appendChild(markerEl);
      renderedCount += 1;
    });
  }

  markerLayer.replaceChildren(fragment);

  if (renderedCount === 0) {
    state.activeMarkerId = null;
    setMarkerEmptyState(filterText);
    return;
  }

  if (!activeMarkerRendered) {
    state.activeMarkerId = null;
    setDefaultSidebarMessage();
  }
}

function openInfo(id) {
  const marker = DATA[id];
  const canBeVisited = supportsVisitedCategory(marker.category);
  const isVisited = state.visitedMarkerIds.has(id);
  const waypointQuery = marker.title;
  const visitedLabel = marker.category === "bossSpawns" ? "Defeated" : "Visited";
  const showInfoButton = marker.category === "bossSpawns" || marker.category === "sideQuests";
  const bossCategory = marker.underground === true ? "dungeonBoss" : "boss";
  const bestiaryHref = getFloorSpecificBestiaryUrl(marker.floor, bossCategory, waypointQuery);
  const questsHref = getFloorSpecificQuestsUrl(marker.floor, waypointQuery);
  const waypointInfoHref = marker.category === "bossSpawns" ? bestiaryHref : questsHref;
  state.activeMarkerId = id;
  title.textContent = marker.title;
  content.innerHTML = `
    <p><strong>Type:</strong> ${marker.type}</p>
    <p>${marker.description}</p>
    <p><strong>Floor:</strong> ${marker.floor.replace("floor", "Floor ")}</p>
    <p><strong>Coordinates:</strong> X: ${marker.coords.x} Z: ${marker.coords.z}</p>
    ${showInfoButton ? `<div class="waypoint-info-row"><button type="button" id="waypointInfoButton" class="waypoint-info-button" data-waypoint-info-href="${waypointInfoHref}">Go to Waypoint Information</button></div>` : ""}
    ${canBeVisited ? `<div class="visited-toggle-row"><label class="visited-toggle-label">${visitedLabel}: <input type="checkbox" id="visitedToggle" ${isVisited ? "checked" : ""}></label></div>` : ""}
  `;

  const previousActive = markerLayer.querySelector(".active-marker");
  if (previousActive) previousActive.classList.remove("active-marker");
  const activeMarker = markerLayer.querySelector(`[data-marker-id="${id}"]`);
  if (activeMarker) activeMarker.classList.add("active-marker");

  const visitedToggle = document.getElementById("visitedToggle");
  if (canBeVisited && visitedToggle) {
    visitedToggle.addEventListener("change", event => {
      const nextVisited = event.target.checked;
      setMarkerVisited(id, nextVisited);
      syncMarkerVisitedClass(id, nextVisited);
    });
  }

  const waypointInfoButton = document.getElementById("waypointInfoButton");
  if (waypointInfoButton) {
    waypointInfoButton.addEventListener("click", () => {
      const href = waypointInfoButton.dataset.waypointInfoHref;
      if (!href) return;
      try { persistStateToHistory(); } catch (e) {}
      window.location.href = href;
    });
  }
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
  if (event.button !== 0) return;
  if (shouldIgnoreMapDrag(event.target)) return;
  clearTextSelection();
  event.preventDefault();
  state.isDragging = true;
  mapContainer.classList.add("grabbing");
  state.dragStartX = event.clientX - state.translateX;
  state.dragStartY = event.clientY - state.translateY;
}

function drag(event) {
  if (!state.isDragging) return;
  state.pendingDragClientX = event.clientX;
  state.pendingDragClientY = event.clientY;
  if (state.dragRafId !== null) return;

  state.dragRafId = window.requestAnimationFrame(() => {
    state.dragRafId = null;
    if (!state.isDragging) return;
    state.translateX = state.pendingDragClientX - state.dragStartX;
    state.translateY = state.pendingDragClientY - state.dragStartY;
    updateTransform();
  });
}

function stopDrag() {
  if (!state.isDragging) return;
  state.isDragging = false;
  mapContainer.classList.remove("grabbing");
}

function clampSidebarWidth(width) {
  return Math.min(sidebarResizeConfig.max, Math.max(sidebarResizeConfig.min, width));
}

function applySidebarWidth(width) {
  const clampedWidth = clampSidebarWidth(width);
  document.documentElement.style.setProperty("--sidebar-width", `${clampedWidth}px`);
  return clampedWidth;
}

function startSidebarResize(event) {
  if (event.button !== 0) return;
  event.preventDefault();
  state.isResizingSidebar = true;
  state.sidebarResizeStartX = event.clientX;
  state.sidebarResizeStartWidth = sidebar.getBoundingClientRect().width;
  document.body.classList.add("resizing-sidebar");
}

function resizeSidebar(event) {
  if (!state.isResizingSidebar) return;
  const deltaX = event.clientX - state.sidebarResizeStartX;
  const nextWidth = state.sidebarResizeStartWidth - deltaX;
  applySidebarWidth(nextWidth);
  scheduleRenderMarkers();
}

function stopSidebarResize() {
  if (!state.isResizingSidebar) return;
  state.isResizingSidebar = false;
  document.body.classList.remove("resizing-sidebar");
  const width = clampSidebarWidth(sidebar.getBoundingClientRect().width);
  setPersistentItem(sidebarResizeConfig.storageKey, String(Math.round(width)));
}

function init() {
  const urlState = parseUrlState();
  const savedState = loadMapUiState();
  const initialState = urlState.hasParams ? urlState : (savedState || {});
  const requestedFloor = initialState.floor || floorSelect.value;
  if (requestedFloor && ["floor1", "floor2", "floor3"].includes(requestedFloor)) {
    floorSelect.value = requestedFloor;
  }
  if (undergroundToggle) {
    undergroundToggle.checked = Boolean(initialState.underground);
  }
  if (initialState.activeCategories) {
    Object.keys(state.activeCategories).forEach(key => {
      state.activeCategories[key] = !!initialState.activeCategories[key];
    });
  }
  if (searchInput && typeof initialState.search === "string") {
    searchInput.value = initialState.search;
  }

  mapImage.src = `${floorSelect.value}.png`;
  undergroundMapImage.src = `${floorSelect.value}underground.png`;

  const persistedWidth = Number(getPersistentItem(sidebarResizeConfig.storageKey));
  if (Number.isFinite(persistedWidth) && persistedWidth > 0) {
    applySidebarWidth(persistedWidth);
  } else {
    applySidebarWidth(sidebarResizeConfig.defaultWidth);
  }

  mapContainer.addEventListener("mousemove", requestCoordinatePanelUpdate);
  mapContainer.addEventListener("mouseleave", () => {
    state.pendingPointerEvent = null;
    overlayMappedCoords.textContent = "X: -- Z: --";
  });
  mapContainer.addEventListener("wheel", handleWheel, { passive: false });
  mapContainer.addEventListener("mousedown", startDrag);
  if (sidebarResizeHandle) {
    sidebarResizeHandle.addEventListener("mousedown", startSidebarResize);
    sidebarResizeHandle.addEventListener("dblclick", () => {
      const width = applySidebarWidth(sidebarResizeConfig.defaultWidth);
      setPersistentItem(sidebarResizeConfig.storageKey, String(Math.round(width)));
      scheduleRenderMarkers();
    });
  }

  window.addEventListener("mousemove", event => {
    resizeSidebar(event);
    if (!state.isResizingSidebar) {
      drag(event);
    }
  });

  document.addEventListener("mouseup", () => {
    stopDrag();
    stopSidebarResize();
  });
  document.addEventListener("mouseleave", () => {
    stopDrag();
    stopSidebarResize();
  });
  window.addEventListener("blur", stopDrag);
  window.addEventListener("blur", stopSidebarResize);

  resetViewButton.addEventListener("click", resetView);
  floorSelect.addEventListener("change", () => {
    mapImage.src = `${floorSelect.value}.png`;
    undergroundMapImage.src = `${floorSelect.value}underground.png`;
    setUndergroundMode(undergroundToggle.checked);
    scheduleRenderMarkers();
    persistStateToHistory();
  });

  undergroundToggle.addEventListener("change", () => {
    setUndergroundMode(undergroundToggle.checked);
    scheduleRenderMarkers();
    persistStateToHistory();
  });

  searchInput.addEventListener("input", () => {
    scheduleRenderMarkers();
    persistStateToHistory();
  });

  attachSectionNavButtons();

  categoryToggleButtons.forEach(button => {
    button.addEventListener("click", () => {
      const category = button.dataset.category;
      const currentlyActive = state.activeCategories[category];
      state.activeCategories[category] = !currentlyActive;
      button.classList.toggle("active", !currentlyActive);
      scheduleRenderMarkers();
      persistStateToHistory();
    });
    const category = button.dataset.category;
    button.classList.toggle("active", !!state.activeCategories[category]);
  });

  // Re-render when map image finishes loading (naturalWidth becomes available)
  mapImage.addEventListener("load", scheduleRenderMarkers);
  // Re-render on resize so px positions stay accurate
  window.addEventListener("resize", scheduleRenderMarkers);

  setUndergroundMode(undergroundToggle.checked);
  scheduleRenderMarkers();
  setDefaultSidebarMessage();
  updateTransform();
  state.initialZoom = state.zoom;
  state.initialTranslateX = state.translateX;
  state.initialTranslateY = state.translateY;
  // Seed history state so popstate/pageshow can restore it later
  persistStateToHistory();
}

window.addEventListener("DOMContentLoaded", init);

function syncStateFromDom() {
  if (!floorSelect) return;
  // If history contains explicit mapState, restore from it (stronger guarantee).
  // Otherwise parse URL query params or fall back to DOM state.
  const hist = history.state?.mapState || null;
  const urlState = parseUrlState();
  const shouldUseUrlState = !hist && urlState.hasParams;
  const mapState = hist || (shouldUseUrlState ? urlState : null);

  if (mapState) {
    if (floorSelect && mapState.floor) floorSelect.value = mapState.floor;
    mapImage.src = `${floorSelect.value}.png`;
    undergroundMapImage.src = `${floorSelect.value}underground.png`;
    if (searchInput && typeof mapState.search === "string") {
      searchInput.value = mapState.search;
    }

    // Restore underground checkbox and visual mode
    if (undergroundToggle) undergroundToggle.checked = Boolean(mapState.underground);
    setUndergroundMode(undergroundToggle.checked);

    // Restore category active flags and update DOM classes
    if (mapState.activeCategories) {
      Object.keys(state.activeCategories).forEach(key => {
        state.activeCategories[key] = !!mapState.activeCategories[key];
      });
      categoryToggleButtons.forEach(button => {
        const cat = button.dataset.category;
        const active = !!state.activeCategories[cat];
        button.classList.toggle('active', active);
      });
    }

    if (!hist && shouldUseUrlState) {
      persistStateToHistory();
    }
  } else {
    // Ensure map images match the selected floor
    mapImage.src = `${floorSelect.value}.png`;
    undergroundMapImage.src = `${floorSelect.value}underground.png`;

    // Apply underground visual mode based on the checkbox (bfcache may restore the control state)
    setUndergroundMode(undergroundToggle.checked);

    // Sync category buttons into runtime state so render uses the restored UI classes
    categoryToggleButtons.forEach(button => {
      const cat = button.dataset.category;
      state.activeCategories[cat] = button.classList.contains("active");
    });
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
      activeCategories: { ...state.activeCategories }
    };
    saveMapUiState(mapState);
    const payload = Object.assign({}, history.state || {}, { mapState });
    history.replaceState(payload, document.title, buildUrlFromState(mapState));
  } catch (e) {
    // Silently ignore storage errors; not critical
  }
}

// When navigating via history (back/forward) or from bfcache restore, the browser
// may restore form control states but the runtime state can be stale. Listen for
// these events and reconcile DOM -> runtime state.
window.addEventListener("pageshow", () => {
  syncStateFromDom();
});
window.addEventListener("popstate", () => {
  syncStateFromDom();
});




