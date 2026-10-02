(function (globalObject) {
  "use strict";

  const mapId = "aincrad";
  const label = "Aincrad";
  const defaultFloor = "floor1";
  const floors = Object.freeze({
    floor1: { id: "floor1", label: "Floor 1 - The Town of Beginnings" },
    floor2: { id: "floor2", label: "Floor 2 - Arid Desert" },
    floor3: { id: "floor3", label: "Floor 3 - The Forest of Wandering" }
  });

  const categories = Object.freeze({
    biomes: true,
    dungeons: true,
    bossSpawns: true,
    farmingSpots: true,
    mobAreas: true,
    sideQuests: true,
    mainQuests: true,
    alchemist: true,
    lumberjack: true,
    lootBuyers: true,
    weaponSellers: true,
    travelingMerchants: true,
    equipmentMerchants: true,
    toolMerchants: true,
    accessoriesMerchants: true,
    occultMerchants: true,
    consumablesMerchants: true,
    weaponsmith: true,
    armorBlacksmith: true,
    ingotBlacksmith: true,
    keyBlacksmith: true,
    accessoriesBlacksmith: true,
    runeCraftsmen: true,
    refaire: true
  });

  const mapImageSources = Object.freeze({
    floor1: {
      surface: "floor1.png",
      underground: "floor1underground.png",
      surfaceWebp: "floor1.webp",
      undergroundWebp: "floor1underground.webp"
    },
    floor2: {
      surface: "floor2.png",
      underground: "floor2underground.png",
      surfaceWebp: "floor2.webp",
      undergroundWebp: "floor2underground.webp"
    },
    floor3: {
      surface: "floor3.png",
      underground: "floor3underground.png",
      surfaceWebp: "floor3.webp",
      undergroundWebp: "floor3underground.webp"
    }
  });

  const markerDataset = typeof DATA !== "undefined" ? DATA : globalObject.DATA || {};
  const mobAreaDataset =
    typeof MOB_AREAS !== "undefined" ? MOB_AREAS : Array.isArray(globalObject.MOB_AREAS) ? globalObject.MOB_AREAS : [];
  const mobAreaMobLookup = typeof MOB_AREA_MOBS !== "undefined" ? MOB_AREA_MOBS : globalObject.MOB_AREA_MOBS || {};
  const getContextData = globalObject.SAOMapRuntime.createContextDataResolver({
    markerDataset,
    mobAreaDataset,
    mobAreaMobLookup
  });
  const coordinateDependencies = {
    mapWebsiteCoordinates:
      typeof globalObject.mapWebsiteCoordinates === "function" ? globalObject.mapWebsiteCoordinates : null,
    invertMapCoordinates:
      typeof globalObject.invertMapCoordinates === "function" ? globalObject.invertMapCoordinates : null
  };
  function supportsVisitedCategory(category) {
    return category === "biomes" || category === "dungeons" || category === "bossSpawns";
  }

  const adapter = Object.freeze({
    id: mapId,
    mapId,
    label,
    translationNamespace: "page.maps",
    defaultFloor,
    floors,
    categories,
    mapImageSources,
    assetAvailability: Object.freeze({
      floor1: true,
      floor2: true,
      floor3: true
    }),
    markerDataset,
    mobAreaDataset,
    mobAreaMobLookup: Object.freeze(mobAreaMobLookup),
    getContextData,
    navigationSections: Object.freeze({
      patchnotes: true,
      bestiary: true,
      equipment: true,
      quests: true,
      commands: true,
      miscinfo: true,
      menu: true
    }),
    /* Reuses the canonical Aincrad route table from shared/sao-page-utils.js rather than
       re-declaring the same paths; the map runtime only validates that this is an object map. */
    sectionPaths: (globalObject.SAOPageUtils && globalObject.SAOPageUtils.SECTION_PATHS) || {},
    walkthroughSteps: Object.freeze([
      { title: "Navigation" },
      { title: "Map Controls" },
      { title: "Filters" },
      { title: "Interactive Map" }
    ]),
    walkthroughStorageKey: "sao.walkthrough.maps.completed",
    supportsVisitedCategory,
    coordinateDependencies,
    mapLabels: Object.freeze({
      floor1: "Floor 1 - The Town of Beginnings",
      floor2: "Floor 2 - Arid Desert",
      floor3: "Floor 3 - The Forest of Wandering"
    })
  });

  if (globalObject) {
    globalObject.AincradMapAdapter = adapter;
  }

  return adapter;
})(typeof window !== "undefined" ? window : globalThis);
