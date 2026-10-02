const assert = require("node:assert/strict");
const auditEquipmentStats = require("./audit-equipment-stats");

const report = auditEquipmentStats();
const missingNames = report.missingItems.map((item) => item.name).sort();
const incompleteNames = report.incompleteItems.map((item) => item.name).sort();
const intentionalStatlessNames = report.intentionalStatlessItems.map((item) => item.name).sort();
const thiefBracelet = report.braceletRecords.find((item) => item.name === "Thief's Bracelet");
const amethystBracelet = report.braceletRecords.find((item) => item.name === "Amethyst Bracelet");

assert.equal(report.totalEquipmentItems, 542);
assert.equal(report.complete, 536);
assert.equal(report.missing, 0);
assert.equal(report.incomplete, 0);
assert.equal(report.intentionalStatless, 6);
assert.deepEqual(missingNames, []);
assert.deepEqual(incompleteNames, []);
assert.deepEqual(intentionalStatlessNames, [
  "Boots of the Foam",
  "Magic Brush",
  "Occult Boots",
  "Red Christmas Mittens",
  "Torch",
  "Wooden Fishing Rod"
]);
assert.equal(
  report.intentionalStatlessItems
    .filter((item) => item.name !== "Occult Boots")
    .every((item) => !item.statsObjectPresent),
  true
);
assert.equal(report.intentionalStatlessItems.find((item) => item.name === "Occult Boots").statsObjectPresent, true);
assert.deepEqual(report.intentionalStatlessItems.find((item) => item.name === "Occult Boots").effectFields, []);
assert.equal(
  report.intentionalStatlessItems
    .find((item) => item.name === "Occult Boots")
    .statsFields.some((field) => /Piece Set Bonus/.test(field)),
  false
);
assert.equal(report.currentDatasetEquipmentItems, 0);
assert.deepEqual(report.sameTierStatConflicts, []);
assert.deepEqual(thiefBracelet, {
  name: "Thief's Bracelet",
  set: "Thief Set",
  stats: {
    "Critical Hit Chance": "5%",
    Defense: "2",
    "Stamina Regeneration": "0.3/s"
  }
});
assert.deepEqual(amethystBracelet, {
  name: "Amethyst Bracelet",
  set: "Amethyst Set",
  stats: {
    Health: "10",
    "Stamina Regeneration": "0.1/s",
    Defense: "3",
    "Requirement: Defense Car": "2",
    "Requirement: Vitality": "2"
  }
});
assert.deepEqual(
  report.occultSetBonuses.map(({ set, pieceCount, bonusPieceCount, incompleteItems }) => ({
    set,
    pieceCount,
    bonusPieceCount,
    incompleteItems
  })),
  [
    { set: "Shadow Neophyte F1", pieceCount: 7, bonusPieceCount: 7, incompleteItems: [] },
    { set: "Shadow Neophyte Set P2", pieceCount: 9, bonusPieceCount: 9, incompleteItems: [] },
    { set: "Seven Shadow Soldiers", pieceCount: 11, bonusPieceCount: 10, incompleteItems: [] }
  ]
);
assert(
  report.occultSetBonuses.every((set) =>
    Object.values(set.tiers).every((values) => values.length === 1 && values[0] === "+1.5/s Health Regeneration")
  )
);
assert.equal(
  report.occultSetBonuses[2].tiers["2 Piece Set Bonus"].includes(null),
  false,
  "Occult Boots does not carry copied set-bonus stats"
);

console.log(
  JSON.stringify(
    {
      totalEquipmentItems: report.totalEquipmentItems,
      complete: report.complete,
      missing: report.missing,
      incomplete: report.incomplete,
      intentionalStatless: report.intentionalStatless,
      intentionalStatlessItems: report.intentionalStatlessItems,
      braceletRecords: report.braceletRecords,
      occultSetBonuses: report.occultSetBonuses,
      sameTierStatConflicts: report.sameTierStatConflicts,
      status: "passed"
    },
    null,
    2
  )
);
