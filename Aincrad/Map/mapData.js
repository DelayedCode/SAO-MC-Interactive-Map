const CALIBRATION_MAP_SIZE = 900;

/* ---------------------------------------------------------------------------------------------
   Authoritative map coordinate system.

   Every coordinate-dependent feature (marker placement, the cursor coordinate readout,
   distance measurement, custom waypoint creation, JourneyMap import/export) goes through the
   two projection functions below, and through them alone. There are no global coordinate
   offsets and no per-feature corrections anywhere else in the repository.

   MAP_CALIBRATION holds one independent calibration record per map floor. Each record
   describes that floor's own map image geometry:

     centerPixel    calibration-space pixel that sits on centerGame
     centerGame     world coordinate of that pixel
     radiusPixel    calibration-space distance from the center to the playable edge
     radiusGame     world-space distance of the same edge

   The calibration space is a CALIBRATION_MAP_SIZE x CALIBRATION_MAP_SIZE square that maps
   linearly onto the raw image pixels (see rawToCalibrationPixels/calibrationPixelsToRaw), so
   one record serves any image dimensions - the WebP siblings and the underground layer
   included.

   coordinateSystem:
     "minecraft"    the record is calibrated against real Minecraft block coordinates. The
                    projection functions return true Minecraft X/Z, and every stored marker
                    coordinate for that floor is a Minecraft coordinate.
     "map-local"    the record still describes the floor's own coordinate grid and is not yet
                    verified against Minecraft. The projection functions keep returning that
                    grid, preserving the map's existing behaviour until the floor's own
                    calibration is measured. A floor NEVER inherits another floor's
                    calibration.

   Floor 1 is fully calibrated (derivation documented in its record). Floor 2, Floor 3 and
   any future map keep their original grids until their own calibration is measured. The
   Fractured Underworld page does not use this module: it has no map images yet and its
   stored coordinates are already Minecraft coordinates.

   Future maps: add a calibration record here (and, if an existing grid is being replaced,
   a legacyGrid entry so stored user data can migrate exactly once). The coordinate engine
   itself needs no changes.
   --------------------------------------------------------------------------------------------- */

const MAP_CALIBRATION = {
  /* Floor 1 - The Town of Beginnings. Calibrated against real Minecraft coordinates.

     Derivation: two verified in-game (JourneyMap) reference points were measured on this
     map: website readout (1798, 4178) is Minecraft (1800, 4190), and website readout
     (1797, 3974) is Minecraft (1799, 3986). Both points fit the previous grid's uniform
     scale (radiusGame / radiusPixel) with an exact translation of (+2, +12) in X/Z, so the
     reference center is the previous center plus that translation:
     (2542.6 + 2, 2551 + 12) = (2544.6, 2563). The scale is unchanged - it was measured from
     the world border and remains valid.

     Artwork cross-check: floor1.png is 5000x5000 px; its playable circle measures center
     pixel (2514.5, 2496.4), radius 2476.0 px, which this calibration projects to Minecraft
     centre (2559.1, 2559.4), radius 2474.1 blocks (~1.0 image pixel per block at source
     resolution).

     Independent cross-check: the user-supplied "Current Data" markers (already Minecraft
     coordinates) land within a few blocks of the calibrated floor markers that describe
     the same NPCs, e.g. Level 5 Weapon Buyer (1493, 3418) sits 2 blocks from the Current
     Data Elite Treant Accessories marker (1491, 3419).

     legacyGrid preserves the grid this floor used before calibration so that user data
     stored under it (custom waypoints) can migrate exactly once. */
  floor1: {
    coordinateSystem: "minecraft",
    centerPixel: { x: 450, y: 450 },
    centerGame: { x: 2544.6, z: 2563 },
    radiusPixel: 450,
    radiusGame: 2498.1,
    legacyGrid: {
      centerGame: { x: 2542.6, z: 2551 },
      note: "Floor 1's coordinate grid before it was calibrated against Minecraft."
    }
  },
  floor2: {
    coordinateSystem: "map-local",
    centerPixel: { x: 450, y: 450 },
    centerGame: { x: -1.3, z: 0.8 },
    radiusPixel: 450,
    radiusGame: 1072.5
  },
  floor3: {
    coordinateSystem: "map-local",
    centerPixel: { x: 450, y: 450 },
    centerGame: { x: 597, z: 771 },
    radiusPixel: 450,
    radiusGame: 850
  }
};

function getMapCalibration(floor) {
  return MAP_CALIBRATION[String(floor || "").trim()] || null;
}

/* One-time migration delta for stored user data that still lives in a floor's legacy grid.
   Returns { x, z } when the floor's calibration moved away from a legacy grid, otherwise
   null. Consumed exclusively by the custom waypoint store's versioned, idempotent
   migration - the live coordinate pipeline never applies it. */
function getStoredCoordinateMigration(floor) {
  const calibration = getMapCalibration(floor);
  if (!calibration || !calibration.legacyGrid) return null;
  return {
    x: calibration.centerGame.x - calibration.legacyGrid.centerGame.x,
    z: calibration.centerGame.z - calibration.legacyGrid.centerGame.z
  };
}

/* Per-world map of floors whose stored user data needs the one-time migration. Derived from
   the calibration records, so a future floor calibration only adds a legacyGrid entry. */
function getStoredCoordinateMigrations(world) {
  const normalizedWorld = String(world || "").trim().toLowerCase();
  if (normalizedWorld !== "aincrad") return null;
  const migrations = {};
  Object.keys(MAP_CALIBRATION).forEach((floor) => {
    const migration = getStoredCoordinateMigration(floor);
    if (migration) migrations[floor] = migration;
  });
  return Object.keys(migrations).length > 0 ? migrations : null;
}

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

/* Raw image pixel -> the floor's world coordinate at that pixel. For a "minecraft"
   calibrated floor this is the true Minecraft X/Z; for a "map-local" floor it is that
   floor's own (still unverified) coordinate grid. */
function mapWebsiteCoordinates(rawX, rawY, floor, dimensions) {
  const calibration = getMapCalibration(floor);
  if (!calibration) return null;

  const pixel = rawToCalibrationPixels(rawX, rawY, dimensions);
  const scale = calibration.radiusGame / calibration.radiusPixel;

  return {
    x: calibration.centerGame.x + (pixel.x - calibration.centerPixel.x) * scale,
    z: calibration.centerGame.z + (pixel.y - calibration.centerPixel.y) * scale
  };
}

/* World coordinate (true Minecraft X/Z for calibrated floors) -> raw image pixel. */
function invertMapCoordinates(x, z, floor, dimensions) {
  const calibration = getMapCalibration(floor);
  if (!calibration) return null;

  const scale = calibration.radiusPixel / calibration.radiusGame;
  const pixelX = calibration.centerPixel.x + (x - calibration.centerGame.x) * scale;
  const pixelY = calibration.centerPixel.y + (z - calibration.centerGame.z) * scale;

  return calibrationPixelsToRaw(pixelX, pixelY, dimensions);
}

function normalizeFloorAndUnderground(layer) {
  const normalized = String(layer || "")
    .trim()
    .toLowerCase();
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
  const normalized = String(type || "")
    .trim()
    .toLowerCase();
  if (/biome|r[eé]gion/.test(normalized)) return "Biome";
  if (/dungeon/.test(normalized)) return "Dungeon";
  if (/boss/.test(normalized)) return "Boss";
  if (/side[_ ]?quest|quest/.test(normalized)) return "Quest";
  return "NPC";
}

function inferCategory(type) {
  const normalized = String(type || "")
    .trim()
    .toLowerCase()
    .replace(/_/g, " ");
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
    Object.values(DATA || {}).map((marker) => `${marker.type}:${marker.coords?.x}:${marker.coords?.z}`)
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
