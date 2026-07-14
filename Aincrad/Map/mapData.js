const CALIBRATION_MAP_SIZE = 900;

const MAP_CALIBRATION = {
  floor1: {
    centerPixel: { x: 450, y: 450 },
    centerGame: { x: 2545.6, z: 2550 },
    radiusPixel: 450,
    radiusGame: 2498.1
  },
  floor2: {
    centerPixel: { x: 450, y: 450 },
    centerGame: { x: -1.3, z: 0.8 },
    radiusPixel: 450,
    radiusGame: 1072.5
  },
  floor3: {
    centerPixel: { x: 450, y: 450 },
    centerGame: { x: 597, z: 771 },
    radiusPixel: 450,
    radiusGame: 850
  }
};

function getReferenceSize(dimensions) {
  if (!dimensions) return CALIBRATION_MAP_SIZE;
  const w = Number(dimensions.width);
  const h = Number(dimensions.height);
  if (!Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0) {
    return CALIBRATION_MAP_SIZE;
  }
  return Math.min(w, h);
}

function rawToCalibrationPixels(rawX, rawY, dimensions) {
  const referenceSize = getReferenceSize(dimensions);
  const ratio = CALIBRATION_MAP_SIZE / referenceSize;
  return {
    x: rawX * ratio,
    y: rawY * ratio
  };
}

function calibrationPixelsToRaw(px, py, dimensions) {
  const referenceSize = getReferenceSize(dimensions);
  const ratio = referenceSize / CALIBRATION_MAP_SIZE;
  return {
    rawX: px * ratio,
    rawY: py * ratio
  };
}

function mapWebsiteCoordinates(rawX, rawY, floor, dimensions) {
  const calibration = MAP_CALIBRATION[floor];
  if (!calibration) return null;

  const pixel = rawToCalibrationPixels(rawX, rawY, dimensions);
  const scale = calibration.radiusGame / calibration.radiusPixel;

  return {
    x: calibration.centerGame.x + (pixel.x - calibration.centerPixel.x) * scale,
    z: calibration.centerGame.z + (pixel.y - calibration.centerPixel.y) * scale
  };
}

function invertMapCoordinates(x, z, floor, dimensions) {
  const calibration = MAP_CALIBRATION[floor];
  if (!calibration) return null;

  const scale = calibration.radiusPixel / calibration.radiusGame;
  const pixelX = calibration.centerPixel.x + (x - calibration.centerGame.x) * scale;
  const pixelY = calibration.centerPixel.y + (z - calibration.centerGame.z) * scale;

  return calibrationPixelsToRaw(pixelX, pixelY, dimensions);
}

function normalizeFloorAndUnderground(layer) {
  const normalized = String(layer || "").trim().toLowerCase();
  if (normalized === "surface" || normalized === "underground") {
    return { floor: "floor2", underground: normalized === "underground" };
  }

  const floorMatch = normalized.match(/(?:floor|f)\s*([123])/);
  if (floorMatch) {
    return { floor: `floor${floorMatch[1]}`, underground: false };
  }

  const numeric = normalized.replace(/[^0-9]/g, "");
  if (numeric) {
    return { floor: `floor${numeric}`, underground: false };
  }

  return { floor: "floor2", underground: false };
}

function slugifyName(value) {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeWaypointType(type) {
  const normalized = String(type || "").trim().toLowerCase();
  if (/biome|r[eé]gion/.test(normalized)) return "Biome";
  if (/dungeon/.test(normalized)) return "Dungeon";
  if (/boss/.test(normalized)) return "Boss";
  if (/side[_ ]?quest|quest/.test(normalized)) return "Quest";
  return "NPC";
}

function inferCategory(type) {
  const normalized = String(type || "").trim().toLowerCase().replace(/_/g, " ");
  switch (normalized) {
    case "alchemist":
      return "alchemist";
    case "lumberjack":
      return "lumberjack";
    case "accessories blacksmith":
    case "craft accessories":
      return "accessoriesBlacksmith";
    case "accessory merchant":
      return "accessoriesMerchants";
    case "occult merchant":
      return "occultMerchants";
    case "equipment merchant":
      return "equipmentMerchants";
    case "tool merchant":
      return "toolMerchants";
    case "loot buyer":
    case "loot taker":
      return "lootBuyers";
    case "craft ingots":
      return "ingotBlacksmith";
    case "craft weapons":
      return "weaponsmith";
    case "craft armor":
      return "armorBlacksmith";
    case "reforger":
      return "keyBlacksmith";
    case "side quest":
      return "sideQuests";
    case "boss spawns":
    case "boss":
      return "bossSpawns";
    case "dungeon":
    case "dungeons":
      return "dungeons";
    case "biome":
    case "region":
    case "région":
      return "biomes";
    default:
      return "biomes";
  }
}
function createMap2WaypointEntries(lines) {
  const existingMarkers = new Set(
    Object.values(DATA || {}).map(marker => `${marker.type}:${marker.coords?.x}:${marker.coords?.z}`)
  );

  return lines.reduce((result, line) => {
    const parts = line.split(" - ");
    if (parts.length < 5) return result;

    const zRaw = parts.pop();
    const xRaw = parts.pop();
    const layer = parts.pop();
    const type = parts.pop();
    const name = parts.join(" - ").trim();
    const x = Number(xRaw.trim());
    const z = Number(zRaw.trim());

    if (!name || !type || !layer || Number.isNaN(x) || Number.isNaN(z)) return result;

    const waypointType = normalizeWaypointType(type);
    const sameSpotKey = `${waypointType}:${x}:${z}`;
    if (existingMarkers.has(sameSpotKey)) return result;

    const id = slugifyName(name);
    if (Object.prototype.hasOwnProperty.call(DATA || {}, id)) return result;

    const floorInfo = normalizeFloorAndUnderground(layer);
    result[id] = {
      title: name,
      type: waypointType,
      category: inferCategory(type),
      floor: floorInfo.floor,
      coords: { x, z },
      underground: floorInfo.underground === true,
      drops: ["N/A"],
      description: `${name} (${waypointType}) — Coordinates X: ${x} Z: ${z}`
    };
    return result;
  }, {});
}

const DATA = {};

const MOB_AREAS = [];

