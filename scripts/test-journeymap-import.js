const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { buildJourneyMapExport, serializeJourneyMapNbt } = require("../shared/sao-journeymap-export.js");
const {
  prepareJourneyMapImport,
  parseJourneyMapDat,
  getNbtTagType,
  getNbtListItemType
} = require("../shared/sao-journeymap-import.js");

const targets = [
  {
    id: "aincrad",
    journeymapDimensionId: "minecraft:overworld",
    defaultFloor: "floor1",
    floors: { floor1: {}, floor2: {}, floor3: {} },
    logoIds: ["pin", "star", "flag"]
  },
  {
    id: "underworld",
    journeymapDimensionId: "minecraft:overworld",
    defaultFloor: "playerIsland",
    floors: { playerIsland: {}, gigasCedar: {}, iceCave: {}, rulid: {}, fishingIsland: {} },
    logoIds: ["pin", "star", "flag"]
  }
];

function bytesFor(categories, world = "aincrad", dimensionId = world) {
  return buildJourneyMapExport({ world, categories, dimensionId }).toUint8Array();
}

function rawWaypointBytes(waypoints, groupName = "Biomes") {
  return serializeJourneyMapNbt({
    groups: {
      journeymap_all: {
        settings: {},
        groups: { [groupName]: { settings: {}, waypoints: Array.isArray(waypoints) ? waypoints : [waypoints] } }
      }
    }
  });
}

function assertCode(callback, code, message) {
  assert.throws(callback, (error) => error.code === code, message);
}

const oneFile = bytesFor({
  Biomes: [{ name: "Forest Entrance", x: 120, y: -30, z: 240, dim: "aincrad", uuid: "waypoint-1", icon: "star" }]
});
const one = prepareJourneyMapImport(oneFile, [targets[0]]);
assert.equal(one.records.length, 1, "one valid waypoint converts");
assert.equal(one.groupCount, 1, "one group becomes one category");
assert.deepEqual(
  { name: one.records[0].record.name, x: one.records[0].record.x, z: one.records[0].record.z },
  { name: "Forest Entrance", x: 120, z: 240 },
  "name and X/Z coordinates are retained"
);
assert.equal(one.records[0].record.world, undefined, "world is carried beside the store record");
assert.equal(one.records[0].world, "aincrad", "Aincrad dimension is identified");
assert.equal(one.records[0].record.floor, "floor1", "missing app floor uses the Aincrad adapter default");
assert.equal(one.records[0].record.button, "Biomes", "group name is preserved as the category");
assert.equal(one.records[0].record.logo, "pin", "unverified JourneyMap icon names use the safe default logo");
assert.equal(one.records[0].record.description, "", "imported waypoint descriptions are empty");
assert.equal(
  one.records[0].record.id,
  prepareJourneyMapImport(oneFile, [targets[0]]).records[0].record.id,
  "identity is deterministic"
);

const stableWaypoint = { name: "Stable", x: 1, y: 0, z: 2, dim: "aincrad", uuid: "stable-guid" };
const stableIdentity = prepareJourneyMapImport(rawWaypointBytes(stableWaypoint), targets).records[0].record.id;
assert.equal(
  prepareJourneyMapImport(rawWaypointBytes({ ...stableWaypoint, name: "Renamed", x: 90, z: -44 }), targets).records[0]
    .record.id,
  stableIdentity,
  "a stable JourneyMap GUID takes precedence over edited name and coordinates"
);
assert.equal(
  prepareJourneyMapImport(rawWaypointBytes({ ...stableWaypoint, id: "secondary-id" }), targets).records[0].record.id,
  stableIdentity,
  "UUID takes precedence when both stable identity fields are present"
);
const idOnlyWaypoint = { name: "ID only", x: 5, y: 0, z: 6, dim: "aincrad", id: "journeymap-id-only" };
const idOnlyIdentity = prepareJourneyMapImport(rawWaypointBytes(idOnlyWaypoint), targets).records[0].record.id;
assert.equal(
  prepareJourneyMapImport(rawWaypointBytes(idOnlyWaypoint), targets).records[0].record.id,
  idOnlyIdentity,
  "a JourneyMap id without UUID still gives deterministic identity"
);
assert.notEqual(
  prepareJourneyMapImport(rawWaypointBytes(stableWaypoint, "Other Group"), targets).records[0].record.id,
  stableIdentity,
  "group context distinguishes stable IDs"
);
assert.notEqual(
  prepareJourneyMapImport(rawWaypointBytes({ ...stableWaypoint, dim: "underworld" }), targets).records[0].record.id,
  stableIdentity,
  "world context distinguishes stable IDs"
);

const fallbackWaypoint = { name: "Fallback", x: 3, y: -30, z: 7, dim: "aincrad" };
const fallbackIdentity = prepareJourneyMapImport(rawWaypointBytes(fallbackWaypoint), targets).records[0].record.id;
assert.equal(
  prepareJourneyMapImport(rawWaypointBytes(fallbackWaypoint), targets).records[0].record.id,
  fallbackIdentity,
  "fallback identity is deterministic"
);
assert.notEqual(
  prepareJourneyMapImport(rawWaypointBytes({ ...fallbackWaypoint, name: "Other Name" }), targets).records[0].record.id,
  fallbackIdentity,
  "fallback identity distinguishes waypoint names"
);
assert.notEqual(
  prepareJourneyMapImport(rawWaypointBytes({ ...fallbackWaypoint, x: 4 }), targets).records[0].record.id,
  fallbackIdentity,
  "fallback identity distinguishes X coordinates"
);
assert.notEqual(
  prepareJourneyMapImport(rawWaypointBytes({ ...fallbackWaypoint, z: 8 }), targets).records[0].record.id,
  fallbackIdentity,
  "fallback identity distinguishes Z coordinates"
);
assert.notEqual(
  prepareJourneyMapImport(rawWaypointBytes(fallbackWaypoint, "Other Group"), targets).records[0].record.id,
  fallbackIdentity,
  "fallback identity distinguishes groups"
);

const iconResult = prepareJourneyMapImport(
  rawWaypointBytes(
    [
      { name: "Flag", x: 1, y: -30, z: 2, dim: "aincrad", icon: "flag", color: 0xff0000 },
      { name: "Unsupported icon", x: 3, y: -30, z: 4, dim: "aincrad", icon: "custom-mod-icon", color: 0x00ff00 }
    ],
    "Icons"
  ),
  [targets[0]]
);
assert.deepEqual(
  iconResult.records.map((entry) => entry.record.logo),
  ["flag", "pin"],
  "supported logos are retained and unsupported icon IDs safely fall back"
);
assert.equal(
  iconResult.records[0].record.waypointColor,
  "#FF0000",
  "signed or unsigned JourneyMap waypoint colors are converted to RGB hex"
);

const groups = prepareJourneyMapImport(
  bytesFor({
    Biomes: [{ name: "Pine", x: 1, y: -30, z: 2, dim: "aincrad" }],
    Dungeons: [{ name: "Gate", x: -3, y: -30, z: 4, dim: "aincrad" }]
  }),
  [targets[0]]
);
assert.equal(groups.records.length, 2, "multiple categories convert");
assert.equal(groups.groupCount, 2, "multiple group names remain distinct");
assert.deepEqual(
  groups.records.map((entry) => entry.record.button),
  ["Biomes", "Dungeons"],
  "actual JourneyMap group names are not hardcoded"
);

const categoryFixtureColors = { Default: "#445566", "Cat 1": "#224466", "Cat 2": "#663322" };
const categoryFixture = Object.fromEntries(
  Object.entries(categoryFixtureColors).map(([category, categoryColor], categoryIndex) => [
    category,
    Array.from({ length: 3 }, (_unused, waypointIndex) => ({
      name: `${category === "Default" ? "Def" : category}-${waypointIndex + 1}`,
      x: 100 + categoryIndex * 10 + waypointIndex,
      y: -30,
      z: 200 + categoryIndex * 10 + waypointIndex,
      dim: "aincrad",
      categoryColor,
      waypointColor: `#${(categoryIndex * 3 + waypointIndex + 1).toString(16).padStart(6, "0")}`
    }))
  ])
);
const categoryFixtureImport = prepareJourneyMapImport(bytesFor(categoryFixture), [targets[0]]);
assert.equal(categoryFixtureImport.records.length, 9, "three groups import all nine contained waypoints");
assert.equal(categoryFixtureImport.groupCount, 3, "each non-empty JourneyMap group maps to one website button");
for (const [category, categoryColor] of Object.entries(categoryFixtureColors)) {
  const entries = categoryFixtureImport.records.filter((entry) => entry.record.button === category);
  assert.equal(entries.length, 3, `${category} maps to one button with three markers`);
  entries.forEach(({ record }, index) => {
    const expectedSource = categoryFixture[category][index];
    assert.equal(record.name, expectedSource.name);
    assert.equal(record.description, "");
    assert.equal(record.x, expectedSource.x);
    assert.equal(record.z, expectedSource.z);
    assert.equal(record.buttonColor, categoryColor, `${category} prefers its group color`);
    assert.equal(record.waypointColor, expectedSource.waypointColor, `${category} keeps its individual waypoint color`);
  });
}

const fallbackGroupId = "00000000-0000-4000-8000-000000000001";
const fallbackIcon = {
  textureWidth: 16,
  rotation: 0,
  opacity: 0.75,
  resourceLocation: "journeymap:textures/waypoint/icon/waypoint-icon.png",
  textureHeight: 16
};
const fallbackGroup = {
  settings: { showDeviation: false, enable: true, display: {}, locked: false, colorOverride: false },
  icon: fallbackIcon,
  name: "No group color",
  guid: fallbackGroupId,
  modId: "journeymap"
};
const fallbackColorWaypoint = (guid, name, x, z, color) => ({
  settings: { showDeviation: false, enable: true, persistent: true },
  color,
  pos: { x, y: -30, z, dimension: "minecraft:overworld" },
  origin: "journeymap",
  groupId: fallbackGroupId,
  icon: fallbackIcon,
  name,
  guid,
  modId: "journeymap",
  dimensions: ["minecraft:overworld"]
});
const fallbackColorBytes = serializeJourneyMapNbt({
  groups: {
    journeymap_all: {
      settings: { showDeviation: false, enable: true, display: {}, locked: true, colorOverride: false },
      icon: fallbackIcon,
      name: "All",
      guid: "journeymap_all",
      modId: "journeymap"
    },
    [fallbackGroupId]: fallbackGroup
  },
  waypoints: {
    "00000000-0000-4000-8000-000000000011": fallbackColorWaypoint(
      "00000000-0000-4000-8000-000000000011",
      "First color",
      1,
      2,
      0xff123456 | 0
    ),
    "00000000-0000-4000-8000-000000000012": fallbackColorWaypoint(
      "00000000-0000-4000-8000-000000000012",
      "Second color",
      3,
      4,
      0xffabcdef | 0
    )
  }
});
const fallbackColorImport = prepareJourneyMapImport(fallbackColorBytes, [targets[0]]);
assert.deepEqual(
  fallbackColorImport.records.map((entry) => entry.record.buttonColor),
  ["#123456", "#123456"],
  "a category without its own color uses its first valid waypoint color"
);
assert.deepEqual(
  fallbackColorImport.records.map((entry) => entry.record.waypointColor),
  ["#123456", "#ABCDEF"],
  "individual waypoint colors remain distinct when the group color is absent"
);

const manyImportedCategories = Object.fromEntries(
  Array.from({ length: 12 }, (_unused, index) => [
    `Imported ${index + 1}`,
    [{ name: `Imported waypoint ${index + 1}`, x: index, y: -30, z: -index, dim: "aincrad", color: 0xff00ff }]
  ])
);
const moreThanOldLimit = prepareJourneyMapImport(bytesFor(manyImportedCategories), [targets[0]]);
assert.equal(moreThanOldLimit.groupCount, 12, "imports all custom groups beyond the former eight-button limit");
assert.equal(moreThanOldLimit.records.length, 12);

const underworld = prepareJourneyMapImport(
  rawWaypointBytes({ name: "Cedar", x: 8, y: 64, z: -9, dim: "underworld" }, "Routes"),
  targets
);
assert.equal(underworld.records[0].world, "underworld", "FU dimension is identified");
assert.equal(underworld.records[0].record.floor, "playerIsland", "FU uses its own adapter default area");

const workingReference = fs.readFileSync(path.join(__dirname, "../WaypointDataWorking.dat"));
const parsedWorkingReference = parseJourneyMapDat(workingReference);
assert.equal(getNbtTagType(parsedWorkingReference, "groups"), 10, "working file root groups field is a compound");
assert.equal(getNbtTagType(parsedWorkingReference, "waypoints"), 10, "working file root waypoints field is a compound");
assert.equal(Object.keys(parsedWorkingReference.waypoints).length, 9, "all working-reference waypoints are parsed");
const referenceWaypoint = Object.values(parsedWorkingReference.waypoints)[0];
assert.equal(getNbtTagType(referenceWaypoint.settings, "showDeviation"), 1);
assert.equal(getNbtTagType(referenceWaypoint.settings, "enable"), 1);
assert.equal(getNbtTagType(referenceWaypoint.pos, "x"), 3);
assert.equal(getNbtTagType(referenceWaypoint.pos, "dimension"), 8);
assert.equal(getNbtListItemType(referenceWaypoint.dimensions), 8);
const importedWorkingReference = prepareJourneyMapImport(workingReference, [targets[0]]);
assert.equal(importedWorkingReference.records.length, 9, "the canonical working structure converts");
assert.ok(importedWorkingReference.records.some((entry) => entry.record.button === "Cat 1"));
assert.ok(importedWorkingReference.records.some((entry) => entry.record.button === "Cat 2"));
assert.throws(
  () => prepareJourneyMapImport(workingReference, targets),
  (error) => error.code === "unsupported",
  "minecraft:overworld is rejected when it cannot identify Aincrad versus FU"
);

const manyEntries = Array.from({ length: 100 }, (_, index) => ({
  name: `Waypoint ${index}`,
  x: index + 0.25,
  y: -30,
  z: -index,
  dim: "aincrad",
  uuid: `many-${index}`
}));
const many = prepareJourneyMapImport(bytesFor({ Biomes: manyEntries, Dungeons: manyEntries.slice(0, 4) }), [
  targets[0]
]);
assert.equal(many.records.length, 104, "large groups are parsed and converted once");
assert.equal(many.groupCount, 2, "many waypoints still produce a unique category per group");
const largeEntries = Array.from({ length: 5000 }, (_, index) => ({
  name: `Large File ${index}`,
  x: index,
  y: -30,
  z: -index,
  dim: "aincrad",
  uuid: `large-${index}`
}));
const largeFile = bytesFor({ Large: largeEntries });
assert.equal(
  prepareJourneyMapImport(largeFile, [targets[0]]).records.length,
  5000,
  "a large binary file converts completely"
);

const emptyGroups = prepareJourneyMapImport(bytesFor({ Empty: [] }), targets);
assert.equal(emptyGroups.records.length, 0, "empty groups do not create waypoint records");
assert.equal(emptyGroups.groupCount, 0, "empty groups do not create Custom category buttons");

assertCode(() => parseJourneyMapDat(new Uint8Array([10, 0])), "invalid", "truncated NBT is invalid");
assertCode(() => parseJourneyMapDat(new Uint8Array()), "invalid", "empty files are invalid");
assertCode(
  () => parseJourneyMapDat(new Uint8Array([...bytesFor({ Empty: [] }), 0])),
  "invalid",
  "trailing bytes after a complete NBT root are invalid"
);
assertCode(
  () => prepareJourneyMapImport(new Uint8Array([9, 0, 0, 0, 0, 0, 0]), targets),
  "unsupported",
  "non-compound roots are unsupported"
);
assertCode(
  () =>
    prepareJourneyMapImport(
      serializeJourneyMapNbt({
        groups: {
          journeymap_all: {
            settings: {},
            groups: { Parent: { settings: {}, groups: {}, waypoints: [] } }
          }
        }
      }),
      targets
    ),
  "unsupported",
  "nested unverified group structures are unsupported"
);
assertCode(
  () => prepareJourneyMapImport(new Uint8Array([0x1f, 0x8b, 0, 0]), targets),
  "unsupported",
  "gzip compression is unsupported"
);
assertCode(
  () => prepareJourneyMapImport(new Uint8Array([0x78, 0x9c, 0, 0]), targets),
  "unsupported",
  "zlib compression is unsupported"
);
assertCode(
  () => prepareJourneyMapImport(rawWaypointBytes({ name: "Broken", x: "bad", y: -30, z: 2, dim: "aincrad" }), targets),
  "invalid",
  "malformed waypoint coordinates reject the complete file"
);
assertCode(
  () =>
    prepareJourneyMapImport(
      rawWaypointBytes([
        { name: "Valid first", x: 1, y: -30, z: 2, dim: "aincrad" },
        { name: "Invalid second", x: "bad", y: -30, z: 4, dim: "aincrad" }
      ]),
      targets
    ),
  "invalid",
  "a later malformed waypoint rejects the complete dataset"
);
assertCode(
  () =>
    prepareJourneyMapImport(rawWaypointBytes({ name: "Unknown world", x: 1, y: -30, z: 2, dim: "overworld" }), targets),
  "unsupported",
  "unknown dimensions are not guessed"
);
assertCode(
  () => prepareJourneyMapImport(rawWaypointBytes({ name: "Missing dimension", x: 1, y: -30, z: 2 }), targets),
  "invalid",
  "missing required dimension rejects the file"
);
assertCode(
  () => prepareJourneyMapImport(rawWaypointBytes({ name: 12, x: 1, y: -30, z: 2, dim: "aincrad" }), targets),
  "invalid",
  "unsupported waypoint name types are rejected"
);
assertCode(
  () => prepareJourneyMapImport(rawWaypointBytes({ name: "Bad Z", x: 1, y: -30, z: "2", dim: "aincrad" }), targets),
  "invalid",
  "unsupported coordinate field types are rejected"
);
assertCode(
  () => prepareJourneyMapImport(rawWaypointBytes({ name: "Bad dimension", x: 1, y: -30, z: 2, dim: 1 }), targets),
  "invalid",
  "unsupported dimension field types are rejected"
);
assertCode(
  () => prepareJourneyMapImport(serializeJourneyMapNbt({ groups: {} }), targets),
  "unsupported",
  "missing required root structures are unsupported"
);
assertCode(
  () =>
    prepareJourneyMapImport(
      serializeJourneyMapNbt({
        groups: { journeymap_all: { settings: {}, groups: { Empty: { settings: {} } } } }
      }),
      targets
    ),
  "unsupported",
  "missing waypoint arrays are unsupported"
);
assertCode(
  () => prepareJourneyMapImport(rawWaypointBytes({ x: 1, y: -30, z: 2, dim: "aincrad" }), targets),
  "invalid",
  "missing waypoint names are invalid"
);
assertCode(
  () =>
    prepareJourneyMapImport(rawWaypointBytes({ name: "Infinite", x: Infinity, y: -30, z: 2, dim: "aincrad" }), targets),
  "invalid",
  "non-finite coordinates are invalid"
);
assertCode(
  () =>
    prepareJourneyMapImport(
      rawWaypointBytes({ name: "Bad icon type", x: 1, y: -30, z: 2, dim: "aincrad", icon: { value: "pin" } }),
      targets
    ),
  "invalid",
  "unsupported icon field types are invalid"
);
assertCode(
  () =>
    prepareJourneyMapImport(
      rawWaypointBytes({ name: "Bad GUID type", x: 1, y: -30, z: 2, dim: "aincrad", uuid: 123 }),
      targets
    ),
  "invalid",
  "unsupported stable identity field types are invalid"
);

console.log("JourneyMap import regression tests passed.");
