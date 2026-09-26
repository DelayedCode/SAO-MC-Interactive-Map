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
    floor1: { surface: "floor1.png", underground: "floor1underground.png" },
    floor2: { surface: "floor2.png", underground: "floor2underground.png" },
    floor3: { surface: "floor3.png", underground: "floor3underground.png" }
  });

  const markerDataset = typeof DATA !== "undefined" ? DATA : (globalObject.DATA || {});
  const mobAreaDataset = typeof MOB_AREAS !== "undefined"
    ? MOB_AREAS
    : (Array.isArray(globalObject.MOB_AREAS) ? globalObject.MOB_AREAS : []);
  const mobAreaMobLookup = typeof MOB_AREA_MOBS !== "undefined"
    ? MOB_AREA_MOBS
    : (globalObject.MOB_AREA_MOBS || {});
  function getContextData(contextId) {
    const markerEntries = Object.entries(markerDataset)
      .filter(([, marker]) => marker && marker.floor === contextId);
    const mobAreas = mobAreaDataset.filter(area => area && area.floor === contextId);
    const areaIds = new Set(mobAreas.map(area => area.id));
    const mobAreasMobs = Object.fromEntries(
      Object.entries(mobAreaMobLookup).filter(([areaId]) => areaIds.has(areaId))
    );
    return Object.freeze({
      markerDataset: Object.freeze(Object.fromEntries(markerEntries)),
      mobAreaDataset: Object.freeze(mobAreas.slice()),
      mobAreaMobLookup: Object.freeze(mobAreasMobs)
    });
  }
  const coordinateDependencies = {
    mapWebsiteCoordinates: typeof globalObject.mapWebsiteCoordinates === "function"
      ? globalObject.mapWebsiteCoordinates
      : null,
    invertMapCoordinates: typeof globalObject.invertMapCoordinates === "function"
      ? globalObject.invertMapCoordinates
      : null
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
    sectionPaths: Object.freeze({
      menu: "../../index.html",
      maps: "../Map/maps.html",
      bestiary: "../Bestiary/bestiary.html",
      equipment: "../eCompendium/ecompendium.html",
      quests: "../Quests/quests.html",
      patchnotes: "../Patchnotes/patchnotes.html",
      commands: "../Commands/commands.html",
      miscinfo: "../Misc Info/miscinfo.html"
    }),
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
