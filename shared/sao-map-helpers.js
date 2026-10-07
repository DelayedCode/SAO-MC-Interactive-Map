/* Helpers that both interactive map controllers need in exactly the same form:
     bounded LRU caches, hex-colour utilities, mob-area centres, marker icon markup,
     the shared zoom domain, letterbox pointer geometry and a few small DOM/pointer
     helpers.

     Loaded before Aincrad/Map/maps.js and "Fractured Underworld/Main UI/mainui.js".
     Anything that depends on per-page state (the live zoom/pan values, DOM element
     lookups, adapters, storage keys, navigation paths) deliberately stays in the page
     controller; shared helpers take those inputs as parameters instead of closing
     over them. That is why the zoom *domain* constant is shared here while the zoom
     *state* stays page-local. */
(function (global) {
  "use strict";

  const CACHE_LIMIT = 1024;

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

  function normalizeHexColor(value) {
    const color = String(value || "").trim();
    const hex = color.startsWith("#") ? color.slice(1) : color;
    if (!/^[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$/.test(hex)) return null;
    if (hex.length === 3) {
      return `#${hex
        .split("")
        .map((char) => char + char)
        .join("")
        .toLowerCase()}`;
    }
    return `#${hex.toLowerCase()}`;
  }

  function getOppositeHexColor(value) {
    const normalized = normalizeHexColor(value);
    if (!normalized) return "#ffffff";
    const r = 255 - parseInt(normalized.slice(1, 3), 16);
    const g = 255 - parseInt(normalized.slice(3, 5), 16);
    const b = 255 - parseInt(normalized.slice(5, 7), 16);
    const toHex = (channel) => channel.toString(16).padStart(2, "0");
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

  /* Centre of a polygon mob area, computed once per area id. */
  const mobAreaCenterCache = new Map();

  function getMobAreaCenter(area) {
    const cachedCenter = getCachedValue(mobAreaCenterCache, area.id);
    if (cachedCenter !== undefined) {
      return cachedCenter;
    }

    if (!Array.isArray(area.corners) || area.corners.length === 0) return null;
    const totals = area.corners.reduce(
      (acc, point) => {
        acc.x += point.x;
        acc.z += point.z;
        return acc;
      },
      { x: 0, z: 0 }
    );
    const center = {
      x: Math.round(totals.x / area.corners.length),
      z: Math.round(totals.z / area.corners.length)
    };
    setCachedValue(mobAreaCenterCache, area.id, center);
    return center;
  }

  const formatZoomLabel = (zoom) => `${zoom.toFixed(1).replace(/\.0$/, "")}x`;

  /* Zoom domain shared by both interactive maps: the wheel/keyboard step (factor) and the
     clamp range applied by setZoom(). Aincrad and the Fractured Underworld both declared
     this object verbatim, so a zoom-limit change had to be made twice; the maps now share
     one definition and cannot drift apart on it. Frozen: every read site only reads. */
  const MAP_ZOOM_CONFIG = Object.freeze({ factor: 1.14, min: 0.5, max: 30.0 });

  /* Base checker/grid square size (px) at 1x. The viewport grid scales with the map zoom so the
     squares stay proportional to the map content, while the grid itself never moves with the map
     (it stays anchored to the viewport). */
  const GRID_SQUARE_BASE_PX = 48;

  /* Grid square size for a zoom level, derived from the existing zoom value so both maps stay in
     step. Continuous - no preset zoom steps, no clamping. */
  function getGridSquareSize(zoom) {
    const value = Number(zoom);
    return GRID_SQUARE_BASE_PX * (Number.isFinite(value) && value > 0 ? value : 1);
  }

  function clearTextSelection() {
    if (window.getSelection) {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        selection.removeAllRanges();
      }
    }
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

  /* Pointer position for a map <img>, in "content pixels".

     The map artwork keeps its aspect ratio inside the element box, so only part of the box is
     real map content; the rest is letterboxing. This converts a pointer event into content-space
     coordinates plus the natural size/scale a caller needs to project it through the map
     calibration. Both controllers need the identical maths, so the image element is passed in
     rather than closed over - no page-local state is involved. */
  function getImageLocalCoords(imageElement, event) {
    const imgRect = imageElement.getBoundingClientRect();
    const naturalWidth = imageElement.naturalWidth || imgRect.width;
    const naturalHeight = imageElement.naturalHeight || imgRect.height;
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

  async function copyTextToClipboard(value) {
    const text = String(value);
    if (global.navigator?.clipboard && typeof global.navigator.clipboard.writeText === "function") {
      try {
        await global.navigator.clipboard.writeText(text);
        return true;
      } catch (_error) {}
    }

    const temporaryInput = document.createElement("textarea");
    temporaryInput.value = text;
    temporaryInput.style.position = "fixed";
    temporaryInput.style.left = "-9999px";
    document.body.appendChild(temporaryInput);
    temporaryInput.select();
    let copied = false;
    try {
      copied = typeof document.execCommand === "function" && document.execCommand("copy");
    } finally {
      temporaryInput.remove();
    }
    return Boolean(copied);
  }

  /* -------------------------------------------------------------------------
     Progressive waypoint clustering (shared by both map controllers).

     Waypoints that land close together on screen collapse into one compact
     cluster marker. Grouping uses rendered screen distance, so the same world
     coordinates behave differently per zoom level: zooming out merges more
     waypoints, zooming in progressively releases them back to their real
     positions. Stored coordinates are never touched - clustering is a
     render-time representation only, and a released waypoint always returns to
     its own coordinate.

     Each page builds its own point list (its data, categories, search and
     visibility rules differ); this module owns only the grouping maths so the
     two maps cannot drift apart.
     ------------------------------------------------------------------------- */
  /* Screen-space radius (px) within which waypoints share one cluster. */
  const CLUSTER_RADIUS_PX = 46;
  /* At and above this zoom, clustering is switched off entirely. */
  const CLUSTER_DISABLE_ZOOM = 7;
  /* Cluster marker ids are derived from their anchor waypoint id. */
  const CLUSTER_ID_PREFIX = "cluster:";

  function isClusteringEnabled(zoom) {
    return (zoom || 1) < CLUSTER_DISABLE_ZOOM;
  }

  /* Greedy on-screen grouping: each unclaimed point claims every later point
     within the radius, and only groups of 2+ become a cluster. `points` are
     already-filtered `{ id, x, y }` entries in map-layer pixel space. */
  function buildScreenClusters(points, options) {
    const config = options || {};
    const empty = { clusters: [], byMember: new Map(), byId: new Map() };
    if (config.disabled) return empty;
    if (!Array.isArray(points) || points.length < 2) return empty;

    const radius = (config.radiusPx === undefined ? CLUSTER_RADIUS_PX : config.radiusPx) / (config.zoom || 1);
    const claimed = new Set();
    const clusters = [];
    const byMember = new Map();
    const byId = new Map();

    points.forEach((anchor) => {
      if (claimed.has(anchor.id)) return;
      const members = [anchor];
      claimed.add(anchor.id);
      points.forEach((other) => {
        if (claimed.has(other.id)) return;
        if (Math.hypot(other.x - anchor.x, other.y - anchor.y) <= radius) {
          members.push(other);
          claimed.add(other.id);
        }
      });
      if (members.length < 2) return;

      const id = `${CLUSTER_ID_PREFIX}${anchor.id}`;
      const cluster = {
        id,
        x: members.reduce((sum, member) => sum + member.x, 0) / members.length,
        y: members.reduce((sum, member) => sum + member.y, 0) / members.length,
        memberIds: members.map((member) => member.id)
      };
      clusters.push(cluster);
      byId.set(id, cluster);
      cluster.memberIds.forEach((memberId) => byMember.set(memberId, id));
    });

    return { clusters, byMember, byId };
  }

  /* Category groups that render richer merchant / craftsman marker glyphs. */
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
    "secretAccessoryBlacksmith",
    "runeCraftsmen",
    "refaire"
  ]);

  /* Vertical nudge so mob-area labels sit above the zone centre. */
  const MOB_AREA_LABEL_VERTICAL_OFFSET = 16;

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
    secretAccessoryBlacksmith: `
    <svg class="craftsman-icon secret-accessory-blacksmith-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle cx="12" cy="13.6" r="5.3" fill="#e6d6ff" stroke="#5b3f86" stroke-width="1.1"/>
      <circle cx="12" cy="13.6" r="2.3" fill="#2b2140"/>
      <path d="M12 5.1v2.3M5.5 7.2l1.7 1.7M18.5 7.2l-1.7 1.7" stroke="#f2e8ff" stroke-width="1.1" stroke-linecap="round"/>
      <circle cx="12" cy="4.4" r="1.4" fill="#ffe9a3" stroke="#8d6a24" stroke-width="0.9"/>
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

  /* Marker artwork shared by both interactive maps: the Aincrad map and the Fractured
     Underworld map rendered byte-identical copies of every one of these icons, so an icon
     change had to be made twice and the two maps could drift apart on it. Frozen: every read
     site only reads. */
  const MARKER_ICON_LIBRARY = Object.freeze({
    biome: `
        <svg class="biome-pin-icon" viewBox="0 0 24 34" aria-hidden="true" focusable="false">
          <path d="M12 33 C12 33, 3 19.5, 3 12 C3 7.03, 7.03 3, 12 3 C16.97 3, 21 7.03, 21 12 C21 19.5, 12 33, 12 33 Z" fill="#d72638" stroke="#ffffff" stroke-width="2"/>
          <circle cx="12" cy="12" r="4" fill="#ffffff"/>
        </svg>
      `,
    dungeon: `
        <svg class="dungeon-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M7.5 2.5 10 5l-1.2 1.2 3.2 3.2-1.8 1.8-3.2-3.2L5.8 9 3.3 6.5 7.5 2.5Z" fill="#ffffff"/>
          <path d="M16.5 2.5 20.7 6.5 18.2 9l-1.2-1.2-3.2 3.2-1.8-1.8 3.2-3.2L14 5l2.5-2.5Z" fill="#ffffff"/>
          <path d="M11.1 11.1 12.9 11.1 12.9 21.5 11.1 21.5Z" fill="#ffffff"/>
          <path d="M9.6 19.2 14.4 19.2 14.4 20.9 9.6 20.9Z" fill="#ffffff"/>
        </svg>
      `,
    boss: `
        <svg class="boss-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M4 8 2.5 4.5 6.2 6 8 5l2 2.3H14L16 5l1.8 1 3.7-1.5L20 8l-2 1.4V13c0 3.1-2.7 5.6-6 5.6S6 16.1 6 13V9.4L4 8Z" fill="#ffffff"/>
          <circle cx="9.3" cy="12.2" r="1.2" fill="#d72638"/>
          <circle cx="14.7" cy="12.2" r="1.2" fill="#d72638"/>
          <path d="M9.4 15.6c1.7 1.2 3.5 1.2 5.2 0" stroke="#d72638" stroke-width="1.4" stroke-linecap="round" fill="none"/>
        </svg>
      `,
    sideQuest: `
        <svg class="quest-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <rect x="4" y="3.5" width="13" height="17" rx="2" fill="#f4ecd1" stroke="#9d8d62" stroke-width="1.2"/>
          <path d="M7 8.1h7M7 11h7M7 13.9h5" stroke="#8b7c53" stroke-width="1.35" stroke-linecap="round"/>
          <circle cx="17.2" cy="16.6" r="4.3" fill="#2e8f5c" stroke="#d9ffe9" stroke-width="1.2"/>
          <path d="M15.1 16.6l1.4 1.5 2.5-2.8" fill="none" stroke="#ffffff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      `,
    alchemist: `
        <svg class="alchemist-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M9 3h6v2l-1.6 2.7v2.2l4.8 7.2c.9 1.4-.1 3.2-1.8 3.2H7.6c-1.7 0-2.7-1.8-1.8-3.2l4.8-7.2V7.7L9 5V3Z" fill="#e9f9ff" stroke="#2f6c84" stroke-width="1.1"/>
          <path d="M7.2 16.1h9.6" stroke="#2f6c84" stroke-width="1"/>
          <path d="M8.4 13.9c1.2-.8 2.2-.2 3.1.3.9.5 1.8 1.1 3 .4" stroke="#4fb2cf" stroke-width="1.1" fill="none"/>
          <circle cx="9.4" cy="12.3" r="0.9" fill="#4fb2cf"/>
          <circle cx="14.6" cy="11.4" r="0.8" fill="#4fb2cf"/>
        </svg>
      `,
    lumberjack: `
        <svg class="lumberjack-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <rect x="4" y="12" width="11" height="5" rx="1.5" fill="#eed5a8" stroke="#8d6130" stroke-width="1.1"/>
          <path d="M15 12.5c2.2 0 3.7 1.4 3.7 2.9s-1.5 2.9-3.7 2.9" fill="#c98f4f" stroke="#8d6130" stroke-width="1.1"/>
          <path d="M6.5 10.5 16.8 4.5l1.2 2.1L7.7 12.6Z" fill="#d8e4eb" stroke="#5b6d78" stroke-width="1"/>
          <path d="M16.3 4.8 19.8 6.9 21.1 5 17.4 2.9Z" fill="#6a3f24"/>
        </svg>
      `,
    mobArea: `
        <svg class="mob-area-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path class="mob-area-icon-hex" d="M12 2.2 19.3 6.3 19.3 14.7 12 18.8 4.7 14.7 4.7 6.3Z"/>
          <path class="mob-area-icon-ring" d="M12 7.2a4.8 4.8 0 1 1 0 9.6 4.8 4.8 0 0 1 0-9.6Z"/>
          <path class="mob-area-icon-dot" d="M12 10.2a1.8 1.8 0 1 1 0 3.6 1.8 1.8 0 0 1 0-3.6Z"/>
        </svg>
      `
  });

  /* Icon markup for a marker kind, or null when the kind has no artwork (the caller then falls
     back to its own letter badge). */
  function buildMarkerIcon(kind) {
    return MARKER_ICON_LIBRARY[kind] || null;
  }

  const CUSTOM_WAYPOINT_ICON_LIBRARY = Object.freeze({
    pin: `<svg class="custom-waypoint-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 22s7-7.1 7-13a7 7 0 1 0-14 0c0 5.9 7 13 7 13Z" fill="currentColor"/><circle cx="12" cy="9" r="2.5" fill="#fff"/></svg>`,
    star: `<svg class="custom-waypoint-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m12 2 2.9 6 6.6.9-4.8 4.6 1.2 6.5-5.9-3.1-5.9 3.1 1.2-6.5-4.8-4.6L9.1 8 12 2Z" fill="currentColor"/></svg>`,
    flag: `<svg class="custom-waypoint-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M5 21V4m1 1h12l-2.5 4L18 13H6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    home: `<svg class="custom-waypoint-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 11.5 12 4l8 7.5V19a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1v-7.5Z" fill="currentColor"/></svg>`,
    shield: `<svg class="custom-waypoint-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 2.7 18.5 5v6.4c0 4.3-2.8 7.8-6.5 10.1C8.3 19.2 5.5 15.7 5.5 11.4V5L12 2.7Zm-1.8 6.3h3.6v3.1h3.1v3.2h-3.1v3.1h-3.6v-3.1H7.2v-3.2h3Z" fill="currentColor"/></svg>`,
    target: `<svg class="custom-waypoint-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="8.2" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="1.4" fill="currentColor"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`
  });

  const CUSTOM_WAYPOINT_IMAGE_LIBRARY = Object.freeze({
    chest: "../../assets/icons/custom-waypoints/chest.png",
    sword: "../../assets/icons/custom-waypoints/sword.png",
    skull: "../../assets/icons/custom-waypoints/skull.png",
    diamond: "../../assets/icons/custom-waypoints/diamond.png"
  });

  function buildCustomWaypointIcon(logo) {
    if (CUSTOM_WAYPOINT_IMAGE_LIBRARY[logo]) {
      return `<img class="custom-waypoint-icon" src="${CUSTOM_WAYPOINT_IMAGE_LIBRARY[logo]}" alt="" aria-hidden="true" draggable="false" />`;
    }
    return CUSTOM_WAYPOINT_ICON_LIBRARY[logo] || CUSTOM_WAYPOINT_ICON_LIBRARY.pin;
  }

  /* Mob list markup for one mob area.

     Both map controllers declared this identically apart from their empty-state string, so the
     caller resolves that string and the waypoint link. Everything else (the entry markup and the
     mob id slug) is owned here so the two maps cannot drift apart on it. */
  function buildMobAreaMobListMarkup(options) {
    const config = options || {};
    const mobs = Array.isArray(config.mobs) ? config.mobs : [];
    if (mobs.length === 0) {
      return `<p>${config.emptyText || ""}</p>`;
    }

    return `
    <ul class="mob-area-entry-list">
      ${mobs
        .map((mob) => {
          const mobId =
            String(mob.id || mob.name || "unknown")
              .trim()
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/^-+|-+$/g, "") || "unknown";
          const mobName = config.content(`bestiary.mob.${mobId}`, mob.name);
          return `
          <li class="mob-area-entry-item">
            <span class="mob-area-entry-name">${config.escapeHtml(mobName)}</span>
            <button type="button" class="mob-area-info-button" data-waypoint-info-href="${config.escapeHtml(config.getHref(mob))}">${config.selectLabel}</button>
          </li>
        `;
        })
        .join("")}
    </ul>
  `;
  }

  /* Page lifecycle ownership for the interactive map controllers.

     Both controllers previously declared their own disposer plus tracked
     listener / animation-frame / timeout helpers; a fix in one could silently
     miss the other. The factory owns that behaviour once. Controllers keep thin
     local wrappers that delegate here so their call sites stay readable and the
     page-lifecycle ownership contract stays testable.

     `state` is passed to scheduleAnimationFrame because the pending-handle key
     (e.g. renderMarkersRafId) lives on the page's own state object. */
  function createPageLifecycle() {
    let pageDisposer = null;

    function getDisposer() {
      if (!pageDisposer || pageDisposer.disposed) {
        pageDisposer = global.createDisposer();
      }
      return pageDisposer;
    }

    function addListener(target, type, listener, options) {
      target.addEventListener(type, listener, options);
      getDisposer().add(() => target.removeEventListener(type, listener, options));
    }

    function scheduleAnimationFrame(state, stateKey, callback) {
      const disposer = getDisposer();
      if (disposer.disposed) return null;
      const handle = global.requestAnimationFrame(() => {
        if (state[stateKey] === handle) state[stateKey] = null;
        if (disposer.disposed) return;
        callback();
      });
      state[stateKey] = handle;
      disposer.add(() => {
        if (state[stateKey] === handle) state[stateKey] = null;
        global.cancelAnimationFrame(handle);
      });
      return handle;
    }

    function scheduleTimeout(callback, delay) {
      const disposer = getDisposer();
      if (disposer.disposed) return null;
      const handle = global.setTimeout(() => {
        if (disposer.disposed) return;
        callback();
      }, delay);
      disposer.add(() => global.clearTimeout(handle));
      return handle;
    }

    return Object.freeze({ getDisposer, addListener, scheduleAnimationFrame, scheduleTimeout });
  }

  function createMarkerDatasetView(baseDataset, additionalDataset) {
    const base = baseDataset || {};
    const additional = additionalDataset || {};
    const keys = [
      ...Reflect.ownKeys(base),
      ...Reflect.ownKeys(additional).filter((key) => !Object.prototype.hasOwnProperty.call(base, key))
    ];
    return new Proxy(Object.create(null), {
      get(_target, key) {
        if (Object.prototype.hasOwnProperty.call(additional, key)) return additional[key];
        return base[key];
      },
      has(_target, key) {
        return Object.prototype.hasOwnProperty.call(additional, key) || Object.prototype.hasOwnProperty.call(base, key);
      },
      ownKeys() {
        return keys;
      },
      getOwnPropertyDescriptor(_target, key) {
        if (
          !Object.prototype.hasOwnProperty.call(additional, key) &&
          !Object.prototype.hasOwnProperty.call(base, key)
        ) {
          return undefined;
        }
        return { configurable: true, enumerable: true, writable: false, value: this.get(_target, key) };
      },
      set() {
        return false;
      },
      defineProperty() {
        return false;
      },
      deleteProperty() {
        return false;
      }
    });
  }

  /* Canonical per-context data accessors shared by both map controllers.

     The adapter still owns the datasets; this owns the page-level caching of the
     active context, the mob-area id lookup derived from it, and the single
     invalidation hook the pages run when the context changes (they drop their
     marker search cache). Keeping the invalidation here means the two maps cannot
     drift apart on it. */
  function createMapContextAccessors(options) {
    const config = options || {};
    const getAdapter = typeof config.getAdapter === "function" ? config.getAdapter : () => null;
    const getContextId = typeof config.getContextId === "function" ? config.getContextId : () => "";
    const getAdditionalMarkers =
      typeof config.getAdditionalMarkers === "function" ? config.getAdditionalMarkers : () => ({});

    let contextData = null;
    let contextDataId = null;
    let contextMobAreaLookup = new Map();

    function getContextData() {
      const contextId = getContextId();
      if (contextData && contextDataId === contextId) return contextData;
      contextDataId = contextId;
      const baseData = getAdapter()?.getContextData?.(contextId) || {
        markerDataset: {},
        mobAreaDataset: [],
        mobAreaMobLookup: {}
      };
      const additionalMarkers = getAdditionalMarkers(contextId) || {};
      const additionalIds = Object.keys(additionalMarkers);
      contextData =
        additionalIds.length > 0
          ? Object.freeze({
              ...baseData,
              markerDataset: createMarkerDatasetView(baseData.markerDataset, additionalMarkers)
            })
          : baseData;
      contextMobAreaLookup = new Map(contextData.mobAreaDataset.map((area) => [area.id, area]));
      if (typeof config.onContextChange === "function") config.onContextChange();
      return contextData;
    }

    return Object.freeze({
      getContextData,
      getDataEntries: () => Object.entries(getContextData().markerDataset),
      getMobAreas: () => getContextData().mobAreaDataset,
      getMobAreaMobLookup: () => getContextData().mobAreaMobLookup,
      getMobAreaLookup: () => {
        getContextData();
        return contextMobAreaLookup;
      },
      invalidate: () => {
        contextData = null;
        contextDataId = null;
      }
    });
  }

  /* Fresh per-page view state. Each page owns its own instance. */
  function createInitialMapState() {
    return {
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
      markerCache: new Map()
    };
  }

  /* Sets an <img> source, preferring the modern format and falling back to the original
     when the browser cannot decode it. The map WebP siblings are losslessly identical to
     the PNGs (same dimensions, same pixels, verified over a composited background), so
     switching format cannot move any marker; the PNG remains as the fallback. */
  function applyImageSourceWithFallback(img, primarySrc, fallbackSrc) {
    if (!img) return;
    img.onerror = null;
    if (!primarySrc) {
      img.removeAttribute("src");
      return;
    }
    if (fallbackSrc && fallbackSrc !== primarySrc) {
      img.onerror = () => {
        img.onerror = null;
        img.src = fallbackSrc;
      };
    }
    img.src = primarySrc;
  }

  /* Renders the shared "map unavailable" runtime-error state into a controller's title and
     content elements. Both map controllers declared this identically; only the localisation
     keys differed, so the caller resolves those and passes the text in. */
  function renderMapRuntimeError(titleEl, contentEl, titleText, messageText) {
    if (titleEl) titleEl.textContent = titleText;
    if (contentEl) {
      const paragraph = document.createElement("p");
      paragraph.textContent = messageText;
      contentEl.replaceChildren(paragraph);
    }
  }

  global.SAOMapHelpers = Object.freeze({
    getCachedValue,
    setCachedValue,
    normalizeHexColor,
    getOppositeHexColor,
    getMobAreaCenter,
    formatZoomLabel,
    MAP_ZOOM_CONFIG,
    GRID_SQUARE_BASE_PX,
    getGridSquareSize,
    clearTextSelection,
    shouldIgnoreMapDrag,
    getImageLocalCoords,
    copyTextToClipboard,
    CLUSTER_RADIUS_PX,
    CLUSTER_DISABLE_ZOOM,
    CLUSTER_ID_PREFIX,
    isClusteringEnabled,
    buildScreenClusters,
    MARKET_CATEGORIES,
    CRAFTSMAN_CATEGORIES,
    CUSTOM_WAYPOINT_ICON_LIBRARY,
    MOB_AREA_LABEL_VERTICAL_OFFSET,
    buildMarketMarkerIcon,
    buildCraftsmanMarkerIcon,
    MARKER_ICON_LIBRARY,
    buildMarkerIcon,
    buildCustomWaypointIcon,
    buildMobAreaMobListMarkup,
    createPageLifecycle,
    createMapContextAccessors,
    createInitialMapState,
    applyImageSourceWithFallback,
    renderMapRuntimeError
  });
})(typeof window !== "undefined" ? window : globalThis);
