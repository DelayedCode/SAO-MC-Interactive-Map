(function (globalObject) {
  "use strict";

  const floors = Object.freeze({
    playerIsland: { id: "playerIsland", label: "Player Island" },
    gigasCedar: { id: "gigasCedar", label: "Gigas Cedar" },
    iceCave: { id: "iceCave", label: "Ice Cave" },
    rulid: { id: "rulid", label: "Rulid" },
    fishingIsland: { id: "fishingIsland", label: "Fishing Island" }
  });

  const categories = Object.freeze({
    npc: true,
    mainQuests: true,
    rulid: true,
    fishingSpot: true,
    oakWood: true,
    copper: true,
    iron: true,
    coal: true
  });

  const categoryFloorRules = Object.freeze({
    npc: null,
    mainQuests: null,
    rulid: Object.freeze(["rulid"]),
    fishingSpot: Object.freeze(["fishingIsland"]),
    oakWood: Object.freeze(["gigasCedar"]),
    copper: Object.freeze(["iceCave"]),
    iron: Object.freeze(["iceCave"]),
    coal: Object.freeze(["iceCave"])
  });

  const mapImageSources = Object.freeze({
    playerIsland: { surface: null, underground: null, placeholder: true },
    gigasCedar: { surface: null, underground: null, placeholder: true },
    iceCave: { surface: null, underground: null, placeholder: true },
    rulid: { surface: null, underground: null, placeholder: true },
    fishingIsland: { surface: null, underground: null, placeholder: true }
  });
  const fullMarkerDataset = globalObject.DATA && typeof globalObject.DATA === "object" ? globalObject.DATA : {};
  const mobAreaDataset = Array.isArray(globalObject.MOB_AREAS) ? globalObject.MOB_AREAS : [];
  const mobAreaMobLookup =
    globalObject.MOB_AREA_MOBS && typeof globalObject.MOB_AREA_MOBS === "object" ? globalObject.MOB_AREA_MOBS : {};

  /* The Fractured Underworld markers are its Main Questline, so the shared Current-only rule
     (shared/sao-datasets.js) applies here exactly as it does on Aincrad: Beta drops them and
     Current keeps only them. */
  const markerDataset =
    globalObject.SAODatasets?.filterMarkerDatasetForActiveMode?.(fullMarkerDataset) || fullMarkerDataset;
  const getContextData = globalObject.SAOMapRuntime.createContextDataResolver({
    markerDataset,
    mobAreaDataset,
    mobAreaMobLookup
  });
  function supportsVisitedCategory() {
    return false;
  }

  const adapter = Object.freeze({
    id: "underworld",
    mapId: "underworld",
    label: "Fractured Underworld",
    translationNamespace: "page.mainui",
    defaultFloor: "playerIsland",
    floors,
    categories,
    categoryFloorRules,
    mapImageSources,
    mapDimensions: Object.freeze({ width: 1600, height: 1200, source: "placeholder" }),
    assetAvailability: Object.freeze({
      playerIsland: false,
      gigasCedar: false,
      iceCave: false,
      rulid: false,
      fishingIsland: false
    }),
    markerDataset,
    mobAreaDataset,
    mobAreaMobLookup,
    getContextData,
    navigationSections: Object.freeze({ towerDefense: true, compendium: true, menu: true }),
    /* Reuses the canonical Fractured Underworld route table from shared/sao-page-utils.js. */
    sectionPaths: (globalObject.SAOPageUtils && globalObject.SAOPageUtils.UNDERWORLD_SECTION_PATHS) || {},
    walkthroughSteps: Object.freeze([
      { title: "Navigation" },
      { title: "Map Controls" },
      { title: "Filters" },
      { title: "Map Area" }
    ]),
    walkthroughStorageKey: "sao.walkthrough.mainui.completed",
    supportsVisitedCategory,
    coordinateDependencies: Object.freeze({
      mapWebsiteCoordinates: null,
      invertMapCoordinates: null
    }),
    mapLabels: Object.freeze({
      playerIsland: "Player Island",
      gigasCedar: "Gigas Cedar",
      iceCave: "Ice Cave",
      rulid: "Rulid",
      fishingIsland: "Fishing Island"
    })
  });

  if (globalObject) {
    globalObject.UnderworldMapAdapter = adapter;
  }
})(typeof window !== "undefined" ? window : globalThis);
