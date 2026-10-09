const assert = require("node:assert/strict");
const path = require("node:path");
const fs = require("node:fs");

const exportModulePath = path.join(__dirname, "../shared/sao-journeymap-export.js");
assert.ok(fs.existsSync(exportModulePath), "journeymap export module should exist before implementation");

const { buildJourneyMapExport, parseJourneyMapDat } = require(exportModulePath);
const colorUtils = require("../shared/sao-color-utils.js");
const {
  parseJourneyMapDat: parseTypedJourneyMapDat,
  getNbtTagType,
  getNbtListItemType
} = require("../shared/sao-journeymap-import.js");

const expectedHardcodedCategories = [
  "biomes", "dungeons", "bossSpawns", "farmingSpots", "mobAreas", "sideQuests", "mainQuests",
  "alchemist", "lumberjack", "lootBuyers", "weaponSellers", "travelingMerchants", "equipmentMerchants",
  "toolMerchants", "accessoriesMerchants", "occultMerchants", "consumablesMerchants", "refaire",
  "weaponsmith", "armorBlacksmith", "ingotBlacksmith", "keyBlacksmith", "accessoriesBlacksmith",
  "secretAccessoryBlacksmith",
  "runeCraftsmen", "npc", "rulid", "fishingSpot", "oakWood", "copper", "iron", "coal"
].sort();
const hardcodedColors = colorUtils.HARDCODED_CATEGORY_COLORS;
assert.deepEqual(Object.keys(hardcodedColors).sort(), expectedHardcodedCategories);
Object.values(hardcodedColors).forEach((color) => {
  assert.match(color, /^#[0-9A-F]{6}$/i, "hard-coded categories use valid HEX colors");
});
assert.equal(new Set(Object.values(hardcodedColors)).size, Object.keys(hardcodedColors).length, "hard-coded category colors are unique");
assert.equal(colorUtils.getHardcodedCategoryColor("biomes"), "#FFFFFF", "Biomes is pure white");

const defaultCategoryExport = buildJourneyMapExport({
  world: "aincrad",
  categories: { Default: [{ name: "Default marker", categoryColor: "#123456", waypointColor: "#ABCDEF" }] },
  dimensionId: "aincrad"
});
const serializedDefaultCategory = parseJourneyMapDat(defaultCategoryExport.toUint8Array());
assert.equal(
  Object.values(serializedDefaultCategory.groups).filter((group) => group.name === "Default").length,
  1,
  "the existing JourneyMap Default group is reused"
);
assert.equal(serializedDefaultCategory.groups.journeymap_default.color, 0x00123456);
const defaultWaypoint = Object.values(serializedDefaultCategory.waypoints)[0];
assert.equal(defaultWaypoint.groupId, "journeymap_default");
assert.equal(defaultWaypoint.color, 0xffabcdef | 0);

const hardcodedExport = buildJourneyMapExport({
  world: "aincrad",
  categories: Object.fromEntries(
    Object.entries(hardcodedColors).map(([category, color]) => [category, [{ name: `${category} marker`, categoryColor: color, color }]])
  ),
  dimensionId: "aincrad"
});
const serializedHardcodedRoot = parseJourneyMapDat(hardcodedExport.toUint8Array());
for (const [category, hex] of Object.entries(hardcodedColors)) {
  const group = Object.values(serializedHardcodedRoot.groups).find((entry) => entry.name === category);
  assert.ok(group, `${category} has a serialized JourneyMap group`);
  const rgb = Number.parseInt(hex.slice(1), 16);
  assert.equal(group.color, rgb, `${category} group keeps its explicit RGB value after NBT serialization`);
  const waypoint = Object.values(serializedHardcodedRoot.waypoints).find((entry) => entry.groupId === group.guid);
  assert.equal(waypoint.color, 0xff000000 | rgb, `${category} waypoint keeps its opaque ARGB after NBT serialization`);
}

const waypointGroups = {
  biomes: [
    {
      name: "Forest Entrance",
      x: 120,
      y: -30,
      z: 240,
      dim: "aincrad",
      color: 0x00ff00,
      icon: "pin",
      group: "biomes",
      uuid: "uuid-biomes-1"
    },
    {
      name: "River Bend",
      x: 220,
      y: -30,
      z: 310,
      dim: "aincrad",
      color: 0xffa500,
      icon: "star",
      group: "biomes",
      uuid: "uuid-biomes-2"
    }
  ],
  dungeons: [
    {
      name: "Dungeon Gate",
      x: 15,
      y: -30,
      z: 600,
      dim: "aincrad",
      color: 0xff0000,
      icon: "flag",
      group: "dungeons",
      uuid: "uuid-dungeons-1"
    }
  ]
};

const exportData = buildJourneyMapExport({
  world: "aincrad",
  categories: waypointGroups,
  dimensionId: "aincrad",
  settings: { enable: true, hideEmpty: false, sortType: "asc" }
});

assert.ok(exportData && typeof exportData === "object", "export payload is produced");
assert.ok(exportData.groups.journeymap_all, "JourneyMap's root all-group is present");
assert.ok(exportData.groups.journeymap_death, "JourneyMap's death group metadata is present");
assert.ok(exportData.groups.journeymap_temp, "JourneyMap's temp group metadata is present");
assert.ok(exportData.groups.journeymap_default, "JourneyMap's default group metadata is present");
assert.equal(exportData.groups.journeymap_all.groups, undefined, "custom groups are siblings, not nested under all");
const customGroups = Object.entries(exportData.groups).filter(([key]) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(key)
);
const biomesGroup = customGroups.find(([, group]) => group.name === "biomes");
const dungeonsGroup = customGroups.find(([, group]) => group.name === "dungeons");
assert.ok(biomesGroup, "biomes category is exported as a custom JourneyMap group");
assert.ok(dungeonsGroup, "dungeons category is exported as a custom JourneyMap group");
assert.equal(biomesGroup[1].guid, biomesGroup[0], "custom group key equals its GUID");
assert.equal(dungeonsGroup[1].guid, dungeonsGroup[0], "custom group key equals its GUID");
assert.equal(exportData.waypoints && Object.keys(exportData.waypoints).length, 3, "waypoints are top-level records");

const fileBytes = exportData.toUint8Array();
assert.ok(fileBytes instanceof Uint8Array, "binary NBT output is generated");
assert.ok(fileBytes.length > 0, "generated file data is non-empty");

const parsed = parseJourneyMapDat(fileBytes);
assert.deepEqual(Object.keys(parsed).sort(), ["groups", "waypoints"], "export uses JourneyMap's top-level compounds");
assert.equal(Object.keys(parsed.waypoints).length, 3, "all waypoints are written to the root waypoint compound");
const binaryTags = parseTypedJourneyMapDat(fileBytes);
assert.equal(getNbtTagType(binaryTags, "groups"), 10, "root groups are a compound");
assert.equal(getNbtTagType(binaryTags, "waypoints"), 10, "root waypoints are a compound");
assert.equal(getNbtTagType(binaryTags.groups.journeymap_all.settings, "showDeviation"), 1);
assert.equal(getNbtTagType(binaryTags.groups.journeymap_all.settings, "enable"), 1);
assert.equal(getNbtTagType(binaryTags.groups.journeymap_all.settings, "locked"), 1);
assert.equal(getNbtTagType(binaryTags.groups.journeymap_all.settings, "colorOverride"), 1);
assert.equal(binaryTags.groups.journeymap_all.name, "All");
assert.equal(binaryTags.groups.journeymap_all.guid, "journeymap_all");
assert.equal(binaryTags.groups.journeymap_default.name, "Default");
assert.equal(getNbtTagType(binaryTags.groups.journeymap_death, "color"), 3);
assert.equal(getNbtTagType(binaryTags.groups.journeymap_default.icon, "opacity"), 5);
assert.equal(
  binaryTags.groups.journeymap_default.icon.resourceLocation,
  "journeymap:textures/waypoint/icon/waypoint-icon.png"
);
assert.equal(getNbtTagType(binaryTags.groups[biomesGroup[0]].settings, "showDeviation"), 1);
assert.equal(getNbtTagType(binaryTags.groups[biomesGroup[0]].settings, "display"), 10);
assert.equal(getNbtTagType(binaryTags.groups[biomesGroup[0]].icon, "opacity"), 5);
const exportedWaypoints = Object.values(parsed.waypoints);
const forestWaypoint = exportedWaypoints.find((waypoint) => waypoint.name === "Forest Entrance");
assert.equal(forestWaypoint.name, "Forest Entrance", "waypoint name is preserved");
assert.equal(forestWaypoint.pos.x, 120, "X coordinate is exported unchanged");
assert.equal(forestWaypoint.pos.y, -30, "Y coordinate is exported as -30");
assert.equal(forestWaypoint.pos.z, 240, "Z coordinate is exported unchanged");
assert.equal(forestWaypoint.pos.dimension, "minecraft:overworld", "dimension uses the working reference value");
assert.equal(forestWaypoint.dim, undefined, "legacy dim field is omitted");
assert.equal(forestWaypoint.group, undefined, "legacy group field is omitted");
assert.equal(forestWaypoint.uuid, undefined, "legacy uuid field is omitted");
assert.equal(forestWaypoint.id, undefined, "legacy id field is omitted");
assert.match(forestWaypoint.guid, /^[0-9a-f-]{36}$/i, "waypoint guid is a UUID");
assert.equal(parsed.waypoints[forestWaypoint.guid].guid, forestWaypoint.guid, "waypoint key matches guid");
assert.equal(forestWaypoint.groupId, biomesGroup[0], "waypoint groupId references its exported group");
assert.equal(forestWaypoint.origin, "journeymap");
assert.equal(forestWaypoint.modId, "journeymap");
assert.equal(forestWaypoint.color, 0xffffffff | 0, "biomes always export as opaque white JourneyMap ARGB");
assert.equal(getNbtTagType(binaryTags.waypoints[forestWaypoint.guid].settings, "persistent"), 1);
assert.equal(getNbtTagType(binaryTags.waypoints[forestWaypoint.guid], "color"), 3);
assert.equal(getNbtTagType(binaryTags.waypoints[forestWaypoint.guid], "origin"), 8);
assert.equal(getNbtTagType(binaryTags.waypoints[forestWaypoint.guid], "groupId"), 8);
assert.equal(getNbtTagType(binaryTags.waypoints[forestWaypoint.guid], "name"), 8);
assert.equal(getNbtTagType(binaryTags.waypoints[forestWaypoint.guid], "guid"), 8);
assert.equal(getNbtTagType(binaryTags.waypoints[forestWaypoint.guid], "modId"), 8);
assert.equal(getNbtTagType(binaryTags.waypoints[forestWaypoint.guid].pos, "x"), 3);
assert.equal(getNbtTagType(binaryTags.waypoints[forestWaypoint.guid].pos, "y"), 3);
assert.equal(getNbtTagType(binaryTags.waypoints[forestWaypoint.guid].pos, "dimension"), 8);
assert.equal(getNbtTagType(binaryTags.waypoints[forestWaypoint.guid].icon, "opacity"), 5);
assert.equal(getNbtListItemType(binaryTags.waypoints[forestWaypoint.guid].dimensions), 8);
assert.deepEqual(forestWaypoint.dimensions, [forestWaypoint.pos.dimension]);
const riverWaypoint = exportedWaypoints.find((waypoint) => waypoint.name === "River Bend");
assert.equal(riverWaypoint.name, "River Bend", "different waypoint names remain distinct");
assert.equal(riverWaypoint.pos.x, 220);
assert.equal(riverWaypoint.pos.z, 310);
assert.equal(riverWaypoint.groupId, biomesGroup[0]);
const dungeonWaypoint = exportedWaypoints.find((waypoint) => waypoint.name === "Dungeon Gate");
assert.equal(dungeonWaypoint.groupId, dungeonsGroup[0], "second category group reference is preserved");
assert.equal(new Set(exportedWaypoints.map((waypoint) => waypoint.guid)).size, 3, "waypoint GUIDs are unique");

const colorizedExport = buildJourneyMapExport({
  world: "aincrad",
  categories: {
    Biomes: [{ name: "White biome", x: 1, y: -30, z: 2, color: "#FFFFFF" }],
    Dungeons: [{ name: "Dungeon route", x: 3, y: -30, z: 4, color: "#FF0000" }],
    "SAO Events": [{ name: "Festival", x: 5, y: -30, z: 6, color: "#00FF00" }],
    "Test Category": [{ name: "Test waypoint", x: 7, y: -30, z: 8, color: "#0000FF" }],
    "Another Category": [{ name: "Purple waypoint", x: 9, y: -30, z: 10, color: "#8A2BE2" }]
  },
  dimensionId: "aincrad"
});
const colorizedBytes = colorizedExport.toUint8Array();
const serializedColorizedRoot = parseJourneyMapDat(colorizedBytes);
const typedColorizedRoot = parseTypedJourneyMapDat(colorizedBytes);
const colorizedGroups = Object.entries(serializedColorizedRoot.groups).filter(([key]) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(key)
);
const expectedColors = {
  Biomes: "#FFFFFF",
  Dungeons: "#FF0000",
  "SAO Events": "#00FF00",
  "Test Category": "#0000FF",
  "Another Category": "#8A2BE2"
};
for (const [categoryName, hex] of Object.entries(expectedColors)) {
  const group = colorizedGroups.find(([, value]) => value.name === categoryName)?.[1];
  assert.ok(group, `${categoryName} is exported as a JourneyMap group`);
  const rgb = Number.parseInt(hex.slice(1), 16);
  assert.equal(group.color, rgb, `${categoryName} group uses JourneyMap RGB int after NBT serialization`);
  const groupId = group.guid;
  const waypoint = Object.values(serializedColorizedRoot.waypoints).find(
    (value) => value.groupId === groupId
  );
  assert.ok(waypoint, `${categoryName} contains an exported waypoint`);
  assert.equal(waypoint.color, (0xff000000 | rgb), `${categoryName} waypoint uses opaque ARGB after NBT serialization`);
  assert.equal(getNbtTagType(typedColorizedRoot.groups[groupId], "color"), 3, `${categoryName} group color remains TAG_INT`);
  assert.equal(getNbtTagType(typedColorizedRoot.waypoints[waypoint.guid], "color"), 3, `${categoryName} waypoint color remains TAG_INT`);
}
assert.equal(Object.values(serializedColorizedRoot.waypoints).length, 5, "all fixed-color categories serialize as waypoints");

const generatedExport = buildJourneyMapExport({
  world: "underworld",
  categories: { "FU routes": [{ name: "Island route", x: 12, y: 64, z: -8, icon: "home", color: 0x123456 }] },
  dimensionId: "underworld"
});
const generatedBytes = generatedExport.toUint8Array();
const generatedRoot = parseJourneyMapDat(generatedBytes);
const generatedWaypoint = Object.values(generatedRoot.waypoints)[0];
assert.match(generatedWaypoint.guid, /^[0-9a-f-]{36}$/i, "waypoints without a supplied identity receive a UUID");
assert.equal(generatedWaypoint.name, "Island route");
assert.equal(generatedWaypoint.pos.dimension, "minecraft:overworld");
assert.equal(generatedWaypoint.icon.resourceLocation, "journeymap:textures/waypoint/icon/waypoint-icon.png");
assert.equal(generatedWaypoint.color, 0xff123456 | 0);
assert.deepEqual(
  { name: waypointGroups.biomes[0].name, x: waypointGroups.biomes[0].x, z: waypointGroups.biomes[0].z },
  { name: "Forest Entrance", x: 120, z: 240 },
  "exports do not mutate source waypoint data"
);

const structuredIcon = {
  textureWidth: 32,
  textureHeight: 32,
  rotation: 45,
  opacity: 0.75,
  resourceLocation: "journeymap:textures/waypoint/icon/verified-custom.png"
};
const styledExport = buildJourneyMapExport({
  world: "aincrad",
  categories: { Styled: [{ name: "Styled point", x: 4, y: -30, z: 9, color: "#12abef", icon: structuredIcon }] }
});
const styledBytes = styledExport.toUint8Array();
const styledWaypoint = Object.values(parseJourneyMapDat(styledBytes).waypoints)[0];
const typedStyledWaypoint = Object.values(parseTypedJourneyMapDat(styledBytes).waypoints)[0];
assert.equal(styledWaypoint.color, 0xff12abef | 0, "CSS hex colors are converted to opaque JourneyMap color ints");
assert.deepEqual(styledWaypoint.icon, structuredIcon, "verified structured JourneyMap icons are retained");
assert.equal(getNbtTagType(typedStyledWaypoint.icon, "opacity"), 5, "icon opacity remains TAG_FLOAT");

const workingBytes = fs.readFileSync(path.join(__dirname, "../WaypointDataWorking.dat"));
const workingRoot = parseJourneyMapDat(workingBytes);
const typedWorkingRoot = parseTypedJourneyMapDat(workingBytes);
assert.deepEqual(
  Object.keys(workingRoot).sort(),
  ["groups", "waypoints"],
  "working reference has top-level groups and waypoints"
);
assert.ok(workingRoot.groups.journeymap_all);
assert.ok(workingRoot.groups.journeymap_default);
assert.ok(workingRoot.groups.journeymap_death);
assert.ok(workingRoot.groups.journeymap_temp);
assert.equal(workingRoot.groups.journeymap_death.color, 0x00ff0000, "known-good group color stores plain RGB");
assert.equal(getNbtTagType(typedWorkingRoot.groups.journeymap_death, "color"), 3);
assert.ok(Object.values(workingRoot.waypoints).length > 0, "working reference contains root waypoint records");
const knownGoodWaypoint = Object.values(workingRoot.waypoints)[0];
assert.equal(knownGoodWaypoint.color >>> 24, 0xff, "known-good waypoint color stores opaque ARGB");
assert.equal(getNbtTagType(typedWorkingRoot.waypoints[knownGoodWaypoint.guid], "color"), 3);
Object.entries(workingRoot.waypoints).forEach(([key, waypoint]) => {
  assert.match(key, /^[0-9a-f-]{36}$/i, "working waypoint key is a UUID");
  assert.equal(waypoint.guid, key, "working waypoint guid matches its key");
  assert.ok(workingRoot.groups[waypoint.groupId], "working waypoint groupId references a root group");
  assert.equal(waypoint.pos.dimension, "minecraft:overworld");
});
const brokenBytes = fs.readFileSync(path.join(__dirname, "../OurNotWorkingWaypointData.dat"));
const brokenRoot = parseJourneyMapDat(brokenBytes);
assert.equal(brokenRoot.waypoints, undefined, "the supplied broken file lacks the root waypoints compound");
assert.ok(brokenRoot.groups.journeymap_all.groups, "the supplied broken file nests categories under journeymap_all");

/* --- Mob areas ---------------------------------------------------------- */

/* Mob areas are the one category whose members are not markers: each one is a polygon held in the
   adapter's mob-area dataset. The export reads them through the same shared centre helper the map
   pins them with, so these checks run against the real Beta-Test and Current Data datasets. */
const vm = require("node:vm");
const { collectJourneyMapExportCategories } = require(exportModulePath);
const { prepareJourneyMapImport } = require("../shared/sao-journeymap-import.js");

const helperContext = vm.createContext({ document: {}, window: {}, String, Number, Boolean, Math, JSON, Error });
helperContext.window = helperContext;
vm.runInContext(fs.readFileSync(path.join(__dirname, "../shared/sao-map-helpers.js"), "utf8"), helperContext, {
  filename: "shared/sao-map-helpers.js"
});
const { getMobAreaCenter } = helperContext.window.SAOMapHelpers;
assert.equal(typeof getMobAreaCenter, "function", "the shared mob-area centre helper is available to the export");

const aincradDataContext = vm.createContext({ window: {} });
const loadAincradData = (file) =>
  vm.runInContext(fs.readFileSync(path.join(__dirname, "../Aincrad/Map", file), "utf8"), aincradDataContext, {
    filename: `Aincrad/Map/${file}`
  });
loadAincradData("mapData.js");
["maps_floor1.js", "maps_floor2.js", "maps_floor3.js", "maps_current.js"].forEach(loadAincradData);
const betaMobAreas = vm.runInContext("MOB_AREAS", aincradDataContext);
const currentMobAreas = vm.runInContext("CURRENT_MOB_AREAS", aincradDataContext);
assert.equal(betaMobAreas.length, 27, "Beta-Test Data ships its 27 mob areas");
assert.equal(currentMobAreas.length, 26, "Current Data ships its 26 copied mob areas");

function collectMobAreas(areas, floor) {
  return collectJourneyMapExportCategories({
    categories: { mobAreas: true, biomes: true },
    markers: { "biome-1": { title: "Biome marker", category: "biomes", floor, coords: { x: 10, z: 20 } } },
    mobAreas: areas,
    floor,
    world: "aincrad",
    dimensionId: "aincrad",
    resolveMobAreaCenter: getMobAreaCenter
  });
}

const betaFloor1Collection = collectMobAreas(betaMobAreas, "floor1");
const currentFloor1Collection = collectMobAreas(currentMobAreas, "floor1");
assert.equal(betaFloor1Collection.mobAreas.length, 16, "Beta floor 1 exports its sixteen mob areas");
assert.ok(
  betaFloor1Collection.mobAreas.some((entry) => entry.name === "Wild Boar Meadow"),
  "a Beta-Test export contains Wild Boar Meadow"
);
assert.equal(currentFloor1Collection.mobAreas.length, 15, "Current floor 1 exports its fifteen mob areas");
assert.ok(
  !currentFloor1Collection.mobAreas.some((entry) => entry.name === "Wild Boar Meadow"),
  "a Current Data export contains no Wild Boar Meadow"
);
assert.ok(
  currentFloor1Collection.mobAreas.some((entry) => entry.name === "Wild Boar Zone"),
  "Current Data still exports the other Wild Boar area"
);
assert.equal(collectMobAreas(currentMobAreas, "floor2").mobAreas.length, 11, "Current floor 2 exports its eleven mob areas");
assert.equal(collectMobAreas(betaMobAreas, "floor3").mobAreas, undefined, "a floor without mob areas exports none");
assert.equal(currentFloor1Collection.biomes.length, 1, "the mob-area branch leaves the other categories alone");

/* Names and coordinates come from the area itself: the polygon centre the map pins the marker to. */
const floor1CurrentAreas = currentMobAreas.filter((area) => area.floor === "floor1");
floor1CurrentAreas.forEach((area) => {
  const entry = currentFloor1Collection.mobAreas.find((candidate) => candidate.uuid === area.id);
  assert.ok(entry, `${area.id} is exported`);
  const cornerAverage = {
    x: Math.round(area.corners.reduce((total, corner) => total + corner.x, 0) / area.corners.length),
    z: Math.round(area.corners.reduce((total, corner) => total + corner.z, 0) / area.corners.length)
  };
  assert.equal(entry.name, area.title, `${area.id} keeps its area name`);
  assert.equal(entry.x, cornerAverage.x, `${area.id} exports the X centre of its own corners`);
  assert.equal(entry.z, cornerAverage.z, `${area.id} exports the Z centre of its own corners`);
  assert.equal(entry.x, getMobAreaCenter(area).x, `${area.id} agrees with the shared centre helper`);
  assert.equal(entry.z, getMobAreaCenter(area).z, `${area.id} agrees with the shared centre helper`);
  assert.equal(entry.group, "mobAreas", `${area.id} keeps the Mob Areas grouping`);
  assert.equal(entry.uuid, area.id, `${area.id} keeps its dataset identity`);
});

/* The collected entries must serialize into a real JourneyMap file, not JSON in disguise. */
const mobAreaExport = buildJourneyMapExport({
  world: "aincrad",
  dimensionId: "aincrad",
  categories: currentFloor1Collection
});
const mobAreaBytes = mobAreaExport.toUint8Array();
assert.ok(mobAreaBytes instanceof Uint8Array && mobAreaBytes.length > 0, "the mob-area export produces binary NBT");
const serializedMobAreas = parseJourneyMapDat(mobAreaBytes);
const typedMobAreas = parseTypedJourneyMapDat(mobAreaBytes);
const mobAreaGroups = Object.values(serializedMobAreas.groups).filter((group) => group.name === "mobAreas");
assert.equal(mobAreaGroups.length, 1, "the mob areas share exactly one JourneyMap group");
const mobAreaGroup = mobAreaGroups[0];
assert.equal(mobAreaGroup.color, 0xff8c00, "the Mob Areas group keeps the hardcoded category RGB");
assert.equal(getNbtTagType(typedMobAreas.groups[mobAreaGroup.guid], "color"), 3, "the group colour is TAG_INT");
assert.equal(getNbtTagType(typedMobAreas.groups[mobAreaGroup.guid].settings, "display"), 10);
const mobAreaWaypoints = Object.values(serializedMobAreas.waypoints).filter(
  (waypoint) => waypoint.groupId === mobAreaGroup.guid
);
assert.equal(mobAreaWaypoints.length, 15, "every Current mob area becomes a waypoint in the file");
assert.equal(
  new Set(mobAreaWaypoints.map((waypoint) => waypoint.guid)).size,
  mobAreaWaypoints.length,
  "mob-area waypoints have unique identities"
);
assert.equal(Object.values(serializedMobAreas.waypoints).length, 16, "the biome waypoint is serialized alongside them");
mobAreaWaypoints.forEach((waypoint) => {
  const typedWaypoint = typedMobAreas.waypoints[waypoint.guid];
  assert.equal(waypoint.pos.dimension, "minecraft:overworld", "mob-area waypoints use the Aincrad dimension");
  assert.deepEqual(waypoint.dimensions, ["minecraft:overworld"]);
  assert.equal(waypoint.pos.y, -30, "mob-area waypoints use the same Y as every other waypoint");
  assert.equal(waypoint.color, 0xffff8c00 | 0, "mob-area waypoints keep the opaque category ARGB");
  assert.equal(getNbtTagType(typedWaypoint, "color"), 3, "the waypoint colour is TAG_INT");
  assert.equal(getNbtTagType(typedWaypoint, "name"), 8, "the waypoint name is TAG_STRING");
  assert.equal(getNbtTagType(typedWaypoint, "guid"), 8);
  assert.equal(getNbtTagType(typedWaypoint, "groupId"), 8);
  assert.equal(getNbtTagType(typedWaypoint.pos, "x"), 3, "the X coordinate is TAG_INT");
  assert.equal(getNbtTagType(typedWaypoint.pos, "y"), 3);
  assert.equal(getNbtTagType(typedWaypoint.pos, "z"), 3, "the Z coordinate is TAG_INT");
  assert.equal(getNbtTagType(typedWaypoint.icon, "opacity"), 5, "the icon opacity stays TAG_FLOAT");
  assert.equal(typedWaypoint.origin, "journeymap");
  assert.equal(typedWaypoint.modId, "journeymap");
});
const serializedMobNames = mobAreaWaypoints.map((waypoint) => waypoint.name);
floor1CurrentAreas.forEach((area) => {
  const waypoint = mobAreaWaypoints.find((candidate) => candidate.name === area.title);
  assert.ok(waypoint, `${area.title} survives serialization by name`);
  assert.equal(waypoint.pos.x, getMobAreaCenter(area).x, `${area.title} keeps its X in the file`);
  assert.equal(waypoint.pos.z, getMobAreaCenter(area).z, `${area.title} keeps its Z in the file`);
});
assert.ok(serializedMobNames.includes("Wild Boar Zone"), "the Current Data file keeps Wild Boar Zone");
assert.ok(!serializedMobNames.includes("Wild Boar Meadow"), "the Current Data file never contains Wild Boar Meadow");
const betaMobAreaBytes = buildJourneyMapExport({
  world: "aincrad",
  dimensionId: "aincrad",
  categories: collectMobAreas(betaMobAreas, "floor1")
}).toUint8Array();
const serializedBetaMobNames = Object.values(parseJourneyMapDat(betaMobAreaBytes).waypoints).map(
  (waypoint) => waypoint.name
);
assert.ok(serializedBetaMobNames.includes("Wild Boar Meadow"), "a Beta-Test file keeps Wild Boar Meadow");
assert.ok(serializedBetaMobNames.includes("Skeleton Dungeon"), "Beta underground mob areas export too");

/* The exported file must stay loadable by the project's own JourneyMap import workflow. */
const aincradImportTarget = {
  id: "aincrad",
  journeymapDimensionId: "minecraft:overworld",
  defaultFloor: "floor1",
  floors: { floor1: {}, floor2: {}, floor3: {} },
  logoIds: ["pin", "star", "flag"]
};
const mobAreaImportPlan = prepareJourneyMapImport(mobAreaBytes, [aincradImportTarget], "aincrad");
assert.equal(mobAreaImportPlan.records.length, 16, "the exported file imports as sixteen records");
const importedMobAreas = mobAreaImportPlan.records.filter((entry) => entry.record.button === "mobAreas");
assert.equal(importedMobAreas.length, 15, "every mob-area waypoint survives the import workflow");
assert.equal(
  new Set(importedMobAreas.map((entry) => entry.record.name)).size,
  importedMobAreas.length,
  "imported mob-area names stay distinct"
);
assert.equal(new Set(importedMobAreas.map((entry) => entry.record.id)).size, importedMobAreas.length, "imported ids are unique");
importedMobAreas.forEach((entry) => {
  assert.equal(entry.world, "aincrad");
  assert.equal(entry.record.floor, "floor1", "mob-area waypoints import onto the floor they came from");
  assert.equal(entry.record.button, "mobAreas", "the import keeps the Mob Areas grouping");
  assert.equal(entry.record.buttonColor, "#FF8C00", "the import keeps the mob-area category colour");
  assert.equal(entry.record.waypointColor, "#FF8C00");
  assert.equal(entry.record.logo, "pin");
});
const importedVallhat = importedMobAreas.find((entry) => entry.record.name === "Vallhat");
const vallhatArea = currentMobAreas.find((area) => area.id === "vallhat-mobs");
assert.equal(importedVallhat.record.x, getMobAreaCenter(vallhatArea).x, "the round trip preserves the mob-area X");
assert.equal(importedVallhat.record.z, getMobAreaCenter(vallhatArea).z, "the round trip preserves the mob-area Z");

/* Repeating an area, and mixing categories, must not multiply or recolour anything. */
const doubledMobAreas = collectMobAreas([...floor1CurrentAreas, ...floor1CurrentAreas], "floor1");
assert.equal(doubledMobAreas.mobAreas.length, 15, "a repeated mob area is never exported twice");
const currentAreasSnapshot = JSON.stringify(currentMobAreas);
collectMobAreas(currentMobAreas, "floor1");
assert.equal(JSON.stringify(currentMobAreas), currentAreasSnapshot, "exporting mob areas does not mutate the dataset");

const mixedCollection = collectJourneyMapExportCategories({
  categories: { mobAreas: true, custom: true },
  markers: {
    "custom-1": {
      title: "Festival marker",
      category: "custom",
      customWaypointButton: "SAO Events",
      floor: "floor1",
      coords: { x: 5, z: 6 },
      color: "#00FF00"
    }
  },
  mobAreas: currentMobAreas,
  floor: "floor1",
  world: "aincrad",
  dimensionId: "aincrad",
  resolveMobAreaCenter: getMobAreaCenter,
  resolveCustomCategoryColor: () => "#00FF00"
});
assert.equal(mixedCollection["SAO Events"].length, 1, "custom waypoint categories still export beside mob areas");
assert.equal(mixedCollection["SAO Events"][0].color, "#00FF00", "custom waypoint colours are untouched");
assert.equal(mixedCollection.mobAreas.length, 15, "mob areas export beside custom categories");
const mixedRoot = parseJourneyMapDat(
  buildJourneyMapExport({ world: "aincrad", dimensionId: "aincrad", categories: mixedCollection }).toUint8Array()
);
const mixedEventGroup = Object.values(mixedRoot.groups).find((group) => group.name === "SAO Events");
const mixedMobAreaGroup = Object.values(mixedRoot.groups).find((group) => group.name === "mobAreas");
assert.equal(mixedEventGroup.color, 0x00ff00, "the custom category keeps its own group colour");
assert.equal(mixedMobAreaGroup.color, 0xff8c00, "the mob areas keep their own group colour");
assert.notEqual(mixedEventGroup.guid, mixedMobAreaGroup.guid, "mob areas and custom categories use separate groups");

/* Mob Areas alone — the only enabled category — must still produce a valid, importable file. */
const mobAreaOnlyCollection = collectJourneyMapExportCategories({
  categories: { mobAreas: true },
  markers: {},
  mobAreas: currentMobAreas,
  floor: "floor1",
  world: "aincrad",
  dimensionId: "aincrad",
  resolveMobAreaCenter: getMobAreaCenter
});
const mobAreaOnlyBytes = buildJourneyMapExport({
  world: "aincrad",
  dimensionId: "aincrad",
  categories: mobAreaOnlyCollection
}).toUint8Array();
const mobAreaOnlyRoot = parseJourneyMapDat(mobAreaOnlyBytes);
assert.equal(Object.keys(mobAreaOnlyRoot.waypoints).length, 15, "a mob-areas-only export holds every area");
assert.equal(
  Object.values(mobAreaOnlyRoot.waypoints).every((waypoint) => waypoint.pos.dimension === "minecraft:overworld"),
  true,
  "a mob-areas-only export keeps the Aincrad dimension"
);
assert.equal(
  Object.values(mobAreaOnlyRoot.groups).filter((group) => group.name === "mobAreas").length,
  1,
  "a mob-areas-only export has one Mob Areas group"
);
const mobAreaOnlyPlan = prepareJourneyMapImport(mobAreaOnlyBytes, [aincradImportTarget], "aincrad");
assert.equal(mobAreaOnlyPlan.records.length, 15, "a mob-areas-only file is still importable");
assert.equal(
  mobAreaOnlyPlan.records.every((entry) => entry.record.button === "mobAreas"),
  true,
  "a mob-areas-only file imports every record into the Mob Areas category"
);

/* A page that ships no mob areas (or does not enable the category) is unaffected. */
const withoutMobAreas = collectJourneyMapExportCategories({
  categories: { mobAreas: true, biomes: true },
  markers: { "biome-1": { title: "Biome marker", category: "biomes", floor: "floor1", coords: { x: 10, z: 20 } } },
  floor: "floor1",
  world: "underworld",
  dimensionId: "underworld"
});
assert.equal(withoutMobAreas.mobAreas, undefined, "an empty mob-area dataset exports no mob-area category");
assert.equal(withoutMobAreas.biomes.length, 1, "the other categories still export");
const disabledMobAreas = collectJourneyMapExportCategories({
  categories: { mobAreas: false, biomes: true },
  markers: { "biome-1": { title: "Biome marker", category: "biomes", floor: "floor1", coords: { x: 10, z: 20 } } },
  mobAreas: currentMobAreas,
  floor: "floor1",
  world: "aincrad",
  dimensionId: "aincrad",
  resolveMobAreaCenter: getMobAreaCenter
});
assert.equal(disabledMobAreas.mobAreas, undefined, "a disabled Mob Areas button exports nothing");

console.log("JourneyMap export regression tests passed.");
