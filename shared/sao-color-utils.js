(function (global) {
  "use strict";

  const DEFAULT_CATEGORY_COLOR_KEY = "sao.journeymap.categoryColors";
  const HARDCODED_CATEGORY_COLORS = Object.freeze({
    biomes: "#FFFFFF",
    dungeons: "#FF0000",
    bossSpawns: "#00A6D2",
    farmingSpots: "#6D8A00",
    mobAreas: "#FF8C00",
    sideQuests: "#A52A2A",
    mainQuests: "#00A86B",
    alchemist: "#9B59B6",
    lumberjack: "#795548",
    lootBuyers: "#F1C40F",
    weaponSellers: "#C0392B",
    travelingMerchants: "#2980B9",
    equipmentMerchants: "#16A085",
    toolMerchants: "#7F8C8D",
    accessoriesMerchants: "#E84393",
    occultMerchants: "#5D3FD3",
    consumablesMerchants: "#2ECC71",
    refaire: "#D35400",
    weaponsmith: "#34495E",
    armorBlacksmith: "#B9770E",
    ingotBlacksmith: "#7D3C98",
    keyBlacksmith: "#1ABC9C",
    accessoriesBlacksmith: "#E74C3C",
    secretAccessoryBlacksmith: "#8E44AD",
    runeCraftsmen: "#3498DB",
    npc: "#F39C12",
    rulid: "#27AE60",
    fishingSpot: "#00B4D8",
    oakWood: "#8B5A2B",
    copper: "#B87333",
    iron: "#AEB6BF",
    coal: "#222222"
  });

  function getStorage(options = {}) {
    return options.storage || global.SAOStorage || null;
  }

  function normalizeCategoryKey(categoryName) {
    return String(categoryName ?? "").trim();
  }

  function getCategoryColorMap(storageKey, options = {}) {
    const storage = getStorage(options);
    if (!storage || typeof storage.getJSON !== "function") {
      return {};
    }
    const value = storage.getJSON(storageKey, {});
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
  }

  function setCategoryColorMap(storageKey, nextMap, options = {}) {
    const storage = getStorage(options);
    if (!storage || typeof storage.setJSON !== "function") {
      return null;
    }
    storage.setJSON(storageKey, nextMap);
    return nextMap;
  }

  function normalizeHexColor(value) {
    if (typeof value === "number" && Number.isFinite(value)) {
      const integer = Math.trunc(value) >>> 0;
      if (integer >= 0 && integer <= 0xffffff) {
        return `#${integer.toString(16).padStart(6, "0").toUpperCase()}`;
      }
      return null;
    }

    if (typeof value !== "string") return null;
    const trimmed = value.trim();
    if (!trimmed) return null;

    const normalized = trimmed.startsWith("#") ? trimmed.slice(1) : trimmed;
    if (!/^[0-9a-fA-F]{6}$/.test(normalized)) {
      return null;
    }

    return `#${normalized.toUpperCase()}`;
  }

  function rgbToJourneyMapInt(hex) {
    const normalized = normalizeHexColor(hex);
    if (!normalized) return null;
    const rgbInt = Number.parseInt(normalized.slice(1), 16);
    return 0xff000000 | rgbInt;
  }

  function randomHexColor(excludedColors = null) {
    const excluded = excludedColors instanceof Set ? excludedColors : new Set(Array.isArray(excludedColors) ? excludedColors : []);
    let attempts = 0;
    while (attempts < 32) {
      const red = Math.floor(Math.random() * 256);
      const green = Math.floor(Math.random() * 256);
      const blue = Math.floor(Math.random() * 256);
      const candidate = `#${[red, green, blue].map((channel) => channel.toString(16).padStart(2, "0")).join("").toUpperCase()}`;
      if (!excluded.has(candidate)) {
        return candidate;
      }
      attempts += 1;
    }
    return `#${Math.floor(Math.random() * 0xffffff)
      .toString(16)
      .padStart(6, "0")
      .toUpperCase()}`;
  }

  function getCategoryLookupKey(categoryName, world) {
    const normalizedName = normalizeCategoryKey(categoryName);
    if (!normalizedName) return "";
    const safeWorld = String(world ?? "").trim();
    return safeWorld ? `${safeWorld}:${normalizedName}` : normalizedName;
  }

  function getHardcodedCategoryColor(categoryName) {
    const normalizedName = normalizeCategoryKey(categoryName).toLowerCase();
    const entry = Object.entries(HARDCODED_CATEGORY_COLORS).find(([name]) => name.toLowerCase() === normalizedName);
    return entry ? entry[1] : null;
  }

  function persistCategoryJourneyMapColor(categoryName, colorValue, options = {}) {
    const world = String(options.world ?? "").trim();
    const normalizedName = normalizeCategoryKey(categoryName);
    const normalizedColor = normalizeHexColor(colorValue);
    if (!normalizedName || !normalizedColor) {
      return null;
    }

    const lookupKey = getCategoryLookupKey(normalizedName, world);
    const colorMap = getCategoryColorMap(DEFAULT_CATEGORY_COLOR_KEY, options);
    colorMap[lookupKey] = normalizedColor;

    if (!world) {
      colorMap[normalizedName.toLowerCase()] = normalizedColor;
    }

    setCategoryColorMap(DEFAULT_CATEGORY_COLOR_KEY, colorMap, options);
    return normalizedColor;
  }

  function getStoredCategoryJourneyMapColor(categoryName, options = {}) {
    const world = String(options.world ?? "").trim();
    const normalizedName = normalizeCategoryKey(categoryName);
    if (!normalizedName) {
      return null;
    }

    const lookupKey = getCategoryLookupKey(normalizedName, world);
    const fallbackKey = world ? getCategoryLookupKey(normalizedName, "") : normalizedName.toLowerCase();
    const colorMap = getCategoryColorMap(DEFAULT_CATEGORY_COLOR_KEY, options);
    const storedColor = normalizeHexColor(colorMap[lookupKey]) || normalizeHexColor(colorMap[fallbackKey]);
    return storedColor || null;
  }

  function ensureCategoryJourneyMapColor(categoryName, options = {}) {
    const world = String(options.world ?? "").trim();
    const normalizedName = normalizeCategoryKey(categoryName);
    if (!normalizedName) {
      return null;
    }

    const lowerName = normalizedName.toLowerCase();
    if (lowerName === "biomes") {
      return "#FFFFFF";
    }

    const hardcodedColor = getHardcodedCategoryColor(normalizedName);
    if (hardcodedColor) return hardcodedColor;

    const existingColor = getStoredCategoryJourneyMapColor(normalizedName, { ...options, world });
    if (existingColor) {
      return existingColor;
    }

    const excludedColors = options.excludedColors instanceof Set ? options.excludedColors : new Set(Array.isArray(options.excludedColors) ? options.excludedColors : []);
    const generatedColor = options.color || randomHexColor(excludedColors);
    return persistCategoryJourneyMapColor(normalizedName, generatedColor, { ...options, world }) || generatedColor;
  }

  function getJourneyMapColorValue(categoryName, options = {}) {
    if (String(categoryName ?? "").trim().toLowerCase() === "biomes") {
      return "#FFFFFF";
    }
    return ensureCategoryJourneyMapColor(categoryName, options);
  }

  const api = {
    DEFAULT_CATEGORY_COLOR_KEY,
    HARDCODED_CATEGORY_COLORS,
    getHardcodedCategoryColor,
    normalizeHexColor,
    rgbToJourneyMapInt,
    randomHexColor,
    getStoredCategoryJourneyMapColor,
    persistCategoryJourneyMapColor,
    ensureCategoryJourneyMapColor,
    getJourneyMapColorValue
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  global.SAOColorUtils = api;
  global.SAOJourneyMapColors = api;
})(typeof window !== "undefined" ? window : globalThis);
