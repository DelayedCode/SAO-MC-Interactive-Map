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

const DATA_ENTRIES = Object.entries(DATA);

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
  initialZoom: 1,
  initialTranslateX: 0,
  initialTranslateY: 0,
  pendingPointerEvent: null,
  coordinateRafId: null,
  activeMarkerId: null,
  visitedMarkerIds: loadVisitedMarkers(),
  activeCategories: {
    biomes: false,
    dungeons: false,
    mobAreas: false,
    bossSpawns: false,
    sideQuests: false,
    alchemist: false,
    lumberjack: false
  }
};

const sidebarResizeConfig = {
  min: 260,
  max: 520,
  defaultWidth: 320,
  storageKey: "sao.sidebar.width"
};

const visitedMarkersStorageKey = "sao.visitedMarkers";
const getPersistentItem = window.SAOMCUtils?.getPersistentItem || (key => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
});
const setPersistentItem = window.SAOMCUtils?.setPersistentItem || ((key, value) => {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Keep map usable even if storage is blocked.
  }
});

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

const MOB_AREA_MOBS = {
  "swamp-putride-mobs": [
    { name: "Treant Warrior" },
    { name: "Mini Treant" },
    { name: "Elite Treant" },
    { name: "Mage Sylvester", search: "Sylvan Mage" }
  ],
  "vallhat-mobs": [
    { name: "Little Slime", search: "Small Slime" },
    { name: "Slime Magician", search: "Mage Slime" },
    { name: "Healer Slime" },
    { name: "Slime Warrior" }
  ],
  "wild-boar-zone": [
    { name: "Corrupted Boar" }
  ],
  "valley-of-wolves-mobs": [
    { name: "Black Sinister Wolf", search: "Sinister Black Wolf" },
    { name: "White Sinister Wolf", search: "Sinister White Wolf" }
  ],
  "cursed-ruins": [
    { name: "Skeleton Swordsman" },
    { name: "Skeleton Warrior" },
    { name: "Skeleton Halberdier" },
    { name: "Skeleton Archer" },
    { name: "Skeleton Sorcerer" }
  ],
  "ika-archipelago-mobs": [
    { name: "Ika" }
  ],
  "mizunari-fields": [
    { name: "Nephentes" }
  ],
  "geldorak-mine-mobs": [
    { name: "Robust Bandit", search: "Sturdy Bandit" },
    { name: "Bandit Assassin" },
    { name: "Bandit Archer" }
  ],
  "wild-boar-meadow": [
    { name: "Corrupted Boar" }
  ],
  "lake-virelune": [
    { name: "Shark Fish" }
  ],
  "arakh-nol-mobs": [
    { name: "Forest Spider" }
  ],
  "tolbana-mountains": [
    { name: "Mountain Deer", search: "Deer" }
  ],
  "snow-citadel-mobs": [
    { name: "Ice Spiritist" },
    { name: "Ice Golem" }
  ]
};

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function buildMobAreaMobListMarkup(areaId) {
  const mobs = MOB_AREA_MOBS[areaId] || [];
  if (mobs.length === 0) {
    return `<p>No mob entries available yet for this zone.</p>`;
  }

  return `
    <ul class="mob-area-entry-list">
      ${mobs.map(mob => {
        const search = encodeURIComponent(mob.search || mob.name);
        const href = `../Bestiary/bestiary.html?category=regular&search=${search}`;
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
    ${buildMobAreaMobListMarkup(area.id)}
  `;

  content.querySelectorAll(".mob-area-info-button").forEach(button => {
    button.addEventListener("click", () => {
      const href = button.dataset.waypointInfoHref;
      if (!href) return;
      window.location.href = href;
    });
  });

  const previousActive = markerLayer.querySelector(".active-marker");
  if (previousActive) previousActive.classList.remove("active-marker");
  const activeMarker = markerLayer.querySelector(`[data-marker-id="mob-area:${area.id}"]`);
  if (activeMarker) activeMarker.classList.add("active-marker");
}

const markerSearchCache = new Map(
  DATA_ENTRIES.map(([id, marker]) => [
    id,
    `${id} ${marker.title} ${marker.type}`.toLowerCase()
  ])
);

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

const zoomConfig = { factor: 1.14, min: 0.5, max: 15.0 };

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
  mapLayer.style.transform = `translate(${state.translateX}px, ${state.translateY}px) scale(${state.zoom})`;
  zoomLabel.textContent = formatZoomLabel(state.zoom);
  markerLayer.style.setProperty("--marker-scale", 1 / state.zoom);
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

  DATA_ENTRIES.forEach(([id, marker]) => {
    const matchesFloor = marker.floor === selectedFloor;
    const matchesSearch = markerSearchCache.get(id).includes(filterText);

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
    markerEl.className = `marker ${markerType}`;
    markerEl.dataset.markerId = id;
    markerEl.style.left = `${leftPx}px`;
    markerEl.style.top  = `${topPx}px`;
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
    title.textContent = "No markers available";
    content.innerHTML = `<p>No markers found for this floor or search term.</p>`;
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
  const waypointQuery = encodeURIComponent(marker.title);
  const visitedLabel = marker.category === "bossSpawns" ? "Defeated" : "Visited";
  const showInfoButton = marker.category === "bossSpawns" || marker.category === "sideQuests";
  const bossCategory = marker.underground === true ? "dungeonBoss" : "boss";
  const bestiaryHref = `../Bestiary/bestiary.html?category=${bossCategory}&search=${waypointQuery}`;
  const questsHref = `../Quests/quests.html?search=${waypointQuery}`;
  const waypointInfoHref = marker.category === "bossSpawns" ? bestiaryHref : questsHref;
  state.activeMarkerId = id;
  title.textContent = marker.title;
  content.innerHTML = `
    <p><strong>Type:</strong> ${marker.type}</p>
    <p>${marker.description}</p>
    <p><strong>Floor:</strong> ${marker.floor.replace("floor", "Floor ")}</p>
    <p><strong>Coordinates:</strong> X: ${marker.coords.x} Z: ${marker.coords.z}</p>
    ${showInfoButton ? `<button type="button" id="waypointInfoButton" class="waypoint-info-button" data-waypoint-info-href="${waypointInfoHref}">Go to Waypoint Information</button>` : ""}
    ${canBeVisited ? `<label><input type="checkbox" id="visitedToggle" ${isVisited ? "checked" : ""}> ${visitedLabel}</label>` : ""}
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
      window.location.href = href;
    });
  }
}

function handleWheel(event) {
  event.preventDefault();
  const rect = mapContainer.getBoundingClientRect();
  const offsetX = event.clientX - rect.left;
  const offsetY = event.clientY - rect.top;
  const direction = event.deltaY < 0 ? 1 : -1;
  const nextZoom = state.zoom * (direction > 0 ? zoomConfig.factor : 1 / zoomConfig.factor);
  setZoom(nextZoom, offsetX, offsetY);
}

function startDrag(event) {
  if (event.button !== 0) return;
  if (event.target.closest(".marker") || event.target.closest("#zoomControls")) return;
  event.preventDefault();
  state.isDragging = true;
  mapContainer.classList.add("grabbing");
  state.dragStartX = event.clientX - state.translateX;
  state.dragStartY = event.clientY - state.translateY;
}

function drag(event) {
  if (!state.isDragging) return;
  state.translateX = event.clientX - state.dragStartX;
  state.translateY = event.clientY - state.dragStartY;
  updateTransform();
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
  const clampedWidth = applySidebarWidth(nextWidth);
  localStorage.setItem(sidebarResizeConfig.storageKey, String(Math.round(clampedWidth)));
  renderMarkers();
}

function stopSidebarResize() {
  if (!state.isResizingSidebar) return;
  state.isResizingSidebar = false;
  document.body.classList.remove("resizing-sidebar");
}

function init() {
  const persistedWidth = Number(localStorage.getItem(sidebarResizeConfig.storageKey));
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
      localStorage.setItem(sidebarResizeConfig.storageKey, String(Math.round(width)));
      renderMarkers();
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
    renderMarkers();
  });

  undergroundToggle.addEventListener("change", () => {
    setUndergroundMode(undergroundToggle.checked);
    renderMarkers();
  });

  categoryToggleButtons.forEach(button => {
    button.addEventListener("click", () => {
      const category = button.dataset.category;
      const currentlyActive = state.activeCategories[category];
      state.activeCategories[category] = !currentlyActive;
      button.classList.toggle("active", !currentlyActive);
      renderMarkers();
    });
  });

  // Re-render when map image finishes loading (naturalWidth becomes available)
  mapImage.addEventListener("load", renderMarkers);
  // Re-render on resize so px positions stay accurate
  window.addEventListener("resize", renderMarkers);

  setUndergroundMode(undergroundToggle.checked);
  renderMarkers();
  setDefaultSidebarMessage();
  updateTransform();
  state.initialZoom = state.zoom;
  state.initialTranslateX = state.translateX;
  state.initialTranslateY = state.translateY;
}

window.addEventListener("DOMContentLoaded", init);




