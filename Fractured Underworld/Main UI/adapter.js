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
    rulid: true,
    fishingSpot: true,
    oakWood: true,
    copper: true,
    iron: true,
    coal: true
  });

  const categoryFloorRules = Object.freeze({
    npc: null,
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
  const markerDataset = globalObject.DATA && typeof globalObject.DATA === "object" ? globalObject.DATA : {};
  const mobAreaDataset = Array.isArray(globalObject.MOB_AREAS) ? globalObject.MOB_AREAS : [];
  const mobAreaMobLookup = globalObject.MOB_AREA_MOBS && typeof globalObject.MOB_AREA_MOBS === "object"
    ? globalObject.MOB_AREA_MOBS
    : {};
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
    sectionPaths: Object.freeze({
      towerDefense: "../Tower Defense/towerdefense.html",
      compendium: "../Compendium/compendium.html",
      menu: "../../index.html"
    }),
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
