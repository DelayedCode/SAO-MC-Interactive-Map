/* Current-Data Champion's PvP armor regression checks.

   The 20 supplied Champion's PvP armor pieces (four per class, PvP Set P1) are the source of truth
   for Compendium > Armor and for the Character Build's Current Data Helmet, Chestplate, Leggings
   and Boots slots. Aincrad/eCompendium/ecompendium_current.js is their only home: the Compendium
   reads the armor bucket when the dataset is "current" and the Character Build adapter normalizes
   the same object, so no page keeps its own copy.

   These checks pin the complete four-piece matrix for the Shaman, Mage, Archer, Warrior and
   Assassin classes, every supplied field (canonical name, class, minimum level, Defense, Health,
   rune slots, description and the three set-bonus tiers), the slot the adapter derives from each
   canonical name (a Mask, Hat, Hood or Helm is still a Helmet), the class/slot filtering the picker
   uses, and the fact that the same-name pieces of different classes stay separate records. They
   also pin the Beta counts so the Current additions can never leak into Beta Data. */
"use strict";

const assert = require("node:assert/strict");
const { loadScript } = require("./harness-helpers");

const context = { window: {}, console };
context.window = context;
loadScript("Aincrad/eCompendium/ecompendium_current.js", context);
for (const floor of [1, 2, 3]) loadScript(`Aincrad/eCompendium/ecompendium_floor${floor}.js`, context);
loadScript("Aincrad/Character Build/character-build-calculator.js", context);
loadScript("Aincrad/Character Build/character-build-adapter.js", context);

const calculator = context.CharacterBuildCalculator;
const adapter = context.CharacterBuildAdapter;
const toHost = (value) => JSON.parse(JSON.stringify(value));

const SET_NAME = "PvP Set P1";
const PURIFIED = "Forged from purified metal, this armor protects those who have triumphed over corrupted ruins.";
/* Only the boots of four classes use the "pure metal" wording; the Shaman boots keep "purified",
   exactly as supplied. */
const PURE = "Forged from pure metal, this armor protects those who have triumphed over corrupted ruins.";


/* The supplied matrix. `classLabel` is the source's spelling, `classId` the adapter's class id, and
   `slot` the equipment slot the canonical item name derives. */
const PIECES = [
  { classLabel: "Shaman", classId: "shaman", slot: "Helmet", name: "Champion's Mask", description: PURIFIED },
  { classLabel: "Shaman", classId: "shaman", slot: "Chestplate", name: "Champion's Breastplate", description: PURIFIED },
  { classLabel: "Shaman", classId: "shaman", slot: "Leggings", name: "Champion's Leggings", description: PURIFIED },
  { classLabel: "Shaman", classId: "shaman", slot: "Boots", name: "Champion's Boots", description: PURIFIED },
  { classLabel: "Mage", classId: "mage", slot: "Helmet", name: "Champion's Hat", description: PURIFIED },
  { classLabel: "Mage", classId: "mage", slot: "Chestplate", name: "Champion's Breastplate", description: PURIFIED },
  { classLabel: "Mage", classId: "mage", slot: "Leggings", name: "Champion's Leggings", description: PURIFIED },
  { classLabel: "Mage", classId: "mage", slot: "Boots", name: "Champion's Boots", description: PURE },
  { classLabel: "Archer", classId: "archer", slot: "Helmet", name: "Champion's Hood", description: PURIFIED },
  { classLabel: "Archer", classId: "archer", slot: "Chestplate", name: "Champion's Breastplate", description: PURIFIED },
  { classLabel: "Archer", classId: "archer", slot: "Leggings", name: "Champion's Leggings", description: PURIFIED },
  { classLabel: "Archer", classId: "archer", slot: "Boots", name: "Champion's Boots", description: PURE },
  { classLabel: "Warrior", classId: "guerrier", slot: "Helmet", name: "Champion's Helm", description: PURIFIED },
  { classLabel: "Warrior", classId: "guerrier", slot: "Chestplate", name: "Champion's Breastplate", description: PURIFIED },
  { classLabel: "Warrior", classId: "guerrier", slot: "Leggings", name: "Champion's Leggings", description: PURIFIED },
  { classLabel: "Warrior", classId: "guerrier", slot: "Boots", name: "Champion's Boots", description: PURE },
  { classLabel: "Assassin", classId: "assassin", slot: "Helmet", name: "Champion's Hood", description: PURIFIED },
  { classLabel: "Assassin", classId: "assassin", slot: "Chestplate", name: "Champion's Breastplate", description: PURIFIED },
  { classLabel: "Assassin", classId: "assassin", slot: "Leggings", name: "Champion's Leggings", description: PURIFIED },
  { classLabel: "Assassin", classId: "assassin", slot: "Boots", name: "Boots of the Champion", description: PURE }
];

const CLASS_LABELS = ["Shaman", "Mage", "Archer", "Warrior", "Assassin"];
const SLOTS = ["Helmet", "Chestplate", "Leggings", "Boots"];
/* The supplied stats per slot. The legs and boots carry no rune slots, and none was invented. */
const SLOT_STATS = {
  Helmet: { Defense: "+2", Health: "+9", runeSlots: 1 },
  Chestplate: { Defense: "+5", Health: "+13", runeSlots: 2 },
  Leggings: { Defense: "+3", Health: "+11", runeSlots: 0 },
  Boots: { Defense: "+1", Health: "+8", runeSlots: 0 }
};
const SET_BONUSES = {
  "2 Piece Set Bonus": "+5% PvP Reduction, +5% PvP Tenacity",
  "3 Piece Set Bonus": "+5% PvP Damage",
  "4 Piece Set Bonus": "+5% Critical Resistance"
};
const expectedStats = (classLabel, slot) => {
  const stats = {
    Class: classLabel,
    Defense: SLOT_STATS[slot].Defense,
    Health: SLOT_STATS[slot].Health
  };
  if (SLOT_STATS[slot].runeSlots) stats["Rune Slots"] = String(SLOT_STATS[slot].runeSlots);
  return Object.assign(stats, SET_BONUSES);
};
const findPiece = (pieces, expected) =>
  pieces.find((piece) => piece.name === expected.name && piece.stats.Class === expected.classLabel);
const slotIdFor = (slot) => slot.toLowerCase();

/* --- The 20 supplied pieces exist exactly once ------------------------------ */
const currentArmor = toHost(context.SAO_CURRENT_EQUIPMENT_DATA.floor1.armor);
const championArmor = currentArmor.filter((entry) => entry.set === SET_NAME);
assert.equal(PIECES.length, 20, "the supplied matrix describes 20 pieces");
assert.equal(championArmor.length, 20, "the Current armor bucket ships exactly 20 PvP Set P1 pieces");
assert.equal(
  currentArmor.length,
  74,
  "the armor bucket holds the three beginner entries, the 20 PvP Set P1 pieces and the 51 normal armor pieces"
);
["Beginner's Tunic", "Beginner Leggings", "Beginner's Boots"].forEach((name) =>
  assert.ok(
    currentArmor.some((entry) => entry.name === name),
    `${name} is preserved`
  )
);

/* Exactly four pieces per class, one per slot, and nothing duplicated or missing. */
CLASS_LABELS.forEach((classLabel) => {
  const owned = PIECES.filter((piece) => piece.classLabel === classLabel);
  const stored = championArmor.filter((entry) => entry.stats.Class === classLabel);
  assert.equal(owned.length, 4, `${classLabel} is supplied four pieces`);
  assert.equal(stored.length, 4, `${classLabel} ships exactly four PvP Set P1 pieces`);
  assert.deepEqual(
    owned.map((piece) => piece.slot).sort(),
    [...SLOTS].sort(),
    `${classLabel} owns a helmet, a chestplate, a pair of leggings and a pair of boots`
  );
  SLOTS.forEach((slot) => {
    const expected = owned.find((piece) => piece.slot === slot);
    const matches = stored.filter((entry) => entry.name === expected.name);
    assert.equal(matches.length, 1, `${classLabel}'s ${slot} (${expected.name}) is stored exactly once`);
  });
});
/* The matrix names the eight distinct canonical names the set uses. */
const distinctNames = [...new Set(PIECES.map((piece) => piece.name))].sort();
assert.deepEqual(
  distinctNames,
  [
    "Boots of the Champion",
    "Champion's Boots",
    "Champion's Breastplate",
    "Champion's Hat",
    "Champion's Helm",
    "Champion's Hood",
    "Champion's Leggings",
    "Champion's Mask"
  ],
  "the canonical names are preserved verbatim (Mask, Hat, Hood and Helm stay as supplied)"
);
assert.equal(
  championArmor.some((entry) => /Helmet/.test(entry.name)),
  false,
  "no canonical name was renamed to \"Helmet\""
);


/* --- Every supplied field is preserved -------------------------------------- */
PIECES.forEach((expected) => {
  const entry = findPiece(championArmor, expected);
  assert.ok(entry, `${expected.name} (${expected.classLabel}) exists`);
  assert.equal(entry.level, 7, `${expected.name} (${expected.classLabel}) keeps its minimum level`);
  assert.equal(entry.set, SET_NAME, `${expected.name} (${expected.classLabel}) belongs to ${SET_NAME}`);
  assert.equal(entry.description, expected.description, `${expected.name} keeps its supplied description`);
  assert.deepEqual(
    entry.stats,
    expectedStats(expected.classLabel, expected.slot),
    `${expected.name} (${expected.classLabel}) keeps its supplied stats, in the supplied order`
  );
  /* Nothing was invented: no rarity, no crafting cost, no set flag on the entry itself. */
  assert.equal(entry.rarity ?? null, null, `${expected.name} carries no invented rarity`);
  assert.equal(entry.craftingResources ?? null, null, `${expected.name} carries no invented crafting cost`);
  assert.equal(entry.craftingNote ?? null, null, `${expected.name} carries no invented crafting note`);
  assert.equal(entry.craftingLocation ?? null, null, `${expected.name} carries no invented crafting location`);
});

/* --- The adapter derives the right slot, class and rune capacity ------------ */
const currentItems = toHost(adapter.getItems("current"));
const itemFor = (expected) => {
  const item = currentItems.find(
    (candidate) =>
      candidate.name === expected.name &&
      candidate.category === "armor" &&
      candidate.classLabel === expected.classLabel
  );
  assert.ok(item, `${expected.name} (${expected.classLabel}) is normalized as armor`);
  return item;
};
PIECES.forEach((expected) => {
  const item = itemFor(expected);
  const slotId = slotIdFor(expected.slot);
  assert.equal(item.type, expected.slot, `${expected.name} (${expected.classLabel}) derives the ${expected.slot} slot`);
  assert.equal(item.slot, expected.slot, `${expected.name} (${expected.classLabel}) is stored in the ${expected.slot} slot`);
  assert.equal(item.levelRequirement, 7, `${expected.name} keeps its minimum level through the adapter`);
  assert.equal(item.set, SET_NAME, `${expected.name} keeps its set through the adapter`);
  assert.deepEqual(item.classes, [expected.classId], `${expected.name} is restricted to ${expected.classLabel}`);
  assert.equal(
    adapter.getRuneSlots(item),
    SLOT_STATS[expected.slot].runeSlots,
    `${expected.name} exposes ${SLOT_STATS[expected.slot].runeSlots} rune slot(s)`
  );
  assert.equal(item.twoHanded, false, `${expected.name} is not two-handed gear`);
  assert.equal(item.weaponCategory, null, `${expected.name} carries no weapon category`);

  /* The piece is offered in its own slot, for its own class only. */
  assert.ok(
    adapter
      .getItemsForSlot("current", slotId, expected.classId)
      .some((candidate) => candidate.id === item.id),
    `${expected.name} is selectable in the ${slotId} slot for ${expected.classLabel}`
  );
  SLOTS.filter((slot) => slot !== expected.slot).forEach((otherSlot) => {
    assert.equal(
      adapter
        .getItemsForSlot("current", slotIdFor(otherSlot), expected.classId)
        .some((candidate) => candidate.id === item.id),
      false,
      `${expected.name} never appears in the ${otherSlot} slot`
    );
  });
  CLASS_LABELS.filter((label) => label !== expected.classLabel).forEach((otherLabel) => {
    const otherClassId = PIECES.find((piece) => piece.classLabel === otherLabel).classId;
    assert.equal(
      adapter
        .getItemsForSlot("current", slotId, otherClassId)
        .some((candidate) => candidate.id === item.id),
      false,
      `${expected.name} (${expected.classLabel}) is never offered to ${otherLabel}`
    );
  });
});


/* --- Same-name pieces of different classes stay separate records ------------ */
const SHARED_NAMES = ["Champion's Breastplate", "Champion's Leggings", "Champion's Boots"];
SHARED_NAMES.forEach((name) => {
  const copies = PIECES.filter((piece) => piece.name === name);
  const items = currentItems.filter((item) => item.name === name);
  assert.equal(items.length, copies.length, `${name} is stored once per owning class`);
  assert.equal(new Set(items.map((item) => item.id)).size, items.length, `${name} records have distinct ids`);
  assert.deepEqual(
    items.map((item) => item.classes[0]).sort(),
    copies.map((piece) => piece.classId).sort(),
    `${name} keeps one record per class`
  );
  copies.forEach((piece) => {
    const item = items.find((candidate) => candidate.classes[0] === piece.classId);
    assert.equal(item.type, piece.slot, `${name} (${piece.classLabel}) keeps its own slot`);
  });
});
/* The two hoods are the same canonical name for two different classes. */
const hoods = currentItems.filter((item) => item.name === "Champion's Hood");
assert.deepEqual(
  hoods.map((item) => item.classes[0]).sort(),
  ["archer", "assassin"],
  "the Archer and Assassin hoods are separate records"
);
assert.equal(new Set(hoods.map((item) => item.id)).size, 2, "the two hoods have distinct ids");

/* Internal ids are stable, index-derived and unique across the whole Current dataset. */
const currentIds = currentItems.map((item) => item.id);
assert.equal(new Set(currentIds).size, currentIds.length, "every Current item id is unique");
championArmor.forEach((entry, index) => {
  const item = currentItems.find((candidate) => candidate.name === entry.name && candidate.classLabel === entry.stats.Class);
  assert.match(
    item.id,
    /^current-floor1-armor-\d+-[a-z0-9-]+$/,
    `${entry.name} (${entry.stats.Class}) keeps the existing id convention`
  );
  assert.equal(
    item.id,
    `current-floor1-armor-${index + 3}-${entry.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`,
    `${entry.name} (${entry.stats.Class}) id is derived from its index and slug`
  );
});

/* --- Set bonuses: three tiers, on all 20 pieces ----------------------------- */
championArmor.forEach((entry) => {
  const item = currentItems.find(
    (candidate) => candidate.name === entry.name && candidate.classLabel === entry.stats.Class
  );
  assert.deepEqual(
    item.setBonuses.map((bonus) => bonus.threshold),
    [2, 3, 4],
    `${entry.name} (${entry.stats.Class}) carries the 2, 3 and 4 piece tiers`
  );
  assert.deepEqual(
    item.setBonuses.map((bonus) => bonus.effects.map((effect) => effect.raw)),
    [
      ["+5% PvP Reduction", "+5% PvP Tenacity"],
      ["+5% PvP Damage"],
      ["+5% Critical Resistance"]
    ],
    `${entry.name} (${entry.stats.Class}) keeps the supplied tier effects`
  );
});
/* PvP Reduction is not merged with Defense or Damage Reduction, and PvP Tenacity is not merged
   with the calculator's ordinary Tenacity: all four supplied stat names stay their own stat, and
   the calculator reports them as statistics its model does not carry (the same treatment every
   other unmodelled stat in the dataset gets). */
["PvP Reduction", "PvP Tenacity", "PvP Damage", "Critical Resistance"].forEach((name) =>
  assert.equal(calculator.classifyStatName(name), "unsupported", `${name} stays a distinct, unmodelled stat`)
);
assert.equal(calculator.classifyStatName("Tenacity"), "calculated", "ordinary Tenacity is a different stat");
assert.equal(calculator.classifyStatName("Damage Reduction"), "calculated", "Damage Reduction is a different stat");
["2 Piece Set Bonus", "3 Piece Set Bonus", "4 Piece Set Bonus"].forEach((key) =>
  assert.equal(calculator.classifyStatName(key), "conditional", `${key} is a recognised set-bonus tier`)
);
assert.equal(calculator.metadataStats.has("Rune Slots"), true, "Rune Slots stays the existing metadata stat");



/* --- The tier thresholds activate on equipped piece count ------------------- */
/* The Character Build activates a tier once that many equipped items share the same `set`, which is
   how the 20 pieces (all carrying the same set name and the 2, 3 and 4 piece tiers) reach their
   bonuses. The supplied PvP stats are display-only in the calculator's model, so a probe item
   carrying the same set name with a modelled stat makes the activation point observable. */
const probe = {
  id: "probe-defense",
  name: "Probe",
  type: "Amulet",
  slot: "Amulet",
  category: "accessory",
  set: SET_NAME,
  setBonuses: [2, 3, 4].map((threshold) => ({
    threshold,
    sourceKey: `${threshold} Piece Set Bonus`,
    effects: [{ value: "+100", stat: "Defense", raw: "+100 Defense" }]
  })),
  stats: {},
  classes: []
};
const shamanPieces = PIECES.filter((piece) => piece.classId === "shaman").map((piece) => itemFor(piece));
const ARMOR_SLOTS = ["helmet", "chestplate", "leggings", "boots"];
const equipmentWith = (pieces, includeProbe = true) => {
  const equipment = includeProbe ? { amulet: probe } : {};
  ARMOR_SLOTS.forEach((slotId, index) => {
    if (pieces[index]) equipment[slotId] = pieces[index];
  });
  return equipment;
};
const defenseOf = (equipment, level) =>
  calculator.calculateBuildStats({ equipment, level, classId: "shaman" }).Defense.flat;
const baseDefense = calculator.createBaseStats("shaman").Defense.flat;
const baseHealth = calculator.createBaseStats("shaman").Health.flat;
const pieceDefense = (item) => Number(String(item.stats.Defense).replace("+", ""));
/* 1 -> 2 -> 3 -> 4 equipped set members activate 0 -> 1 -> 2 -> 3 tiers, and a fifth member adds
   nothing because the set ships no 5 piece tier. */
[[1, 0], [2, 1], [3, 2], [4, 3], [5, 3]].forEach(([count, tiers]) => {
  const pieces = shamanPieces.slice(0, count - 1);
  const expected = baseDefense + pieces.reduce((total, item) => total + pieceDefense(item), 0) + 100 * tiers;
  assert.equal(
    defenseOf(equipmentWith(pieces), 7),
    expected,
    `${count} equipped ${SET_NAME} member(s) activate ${tiers} tier(s)`
  );
});
/* The four Shaman pieces alone reach the totals, so they really are counted as equipped. */
const fullShamanBuild = calculator.calculateBuildStats({
  equipment: equipmentWith(shamanPieces, false),
  level: 1,
  classId: "shaman"
});
assert.equal(fullShamanBuild.Defense.flat, baseDefense + 11, "the four Shaman pieces' Defense reaches the totals");
assert.equal(fullShamanBuild.Health.flat, baseHealth + 41, "the four Shaman pieces' Health reaches the totals");

/* --- Current and Beta stay separate ----------------------------------------- */
const betaItems = toHost(adapter.getItems("beta"));
assert.equal(betaItems.length, 542, "the Beta equipment count is unchanged");
assert.equal(betaItems.filter((item) => item.category === "armor").length, 123, "the Beta armor count is unchanged");
assert.equal(betaItems.filter((item) => item.twoHanded).length, 20, "the Beta two-handed count is unchanged");
assert.equal(betaItems.filter((item) => item.type === "Offhand").length, 13, "the Beta off-hand count is unchanged");
assert.equal(
  betaItems.some((item) => item.set === SET_NAME),
  false,
  "no PvP Set P1 piece leaks into Beta Data"
);
assert.equal(
  betaItems.some((item) => item.category === "armor" && PIECES.some((piece) => piece.name === item.name)),
  false,
  "no Champion's PvP armor name leaks into the Beta armor bucket"
);
assert.equal(currentItems.length, 236, "Current Data ships the 158 earlier equipment items, the 20 armor pieces, the 51 normal armor pieces and the 7 accessory-update items");
assert.equal(
  toHost(context.SAO_CURRENT_EQUIPMENT_DATA.floor1.weapon).length,
  95,
  "the Current weapon bucket is untouched"
);

console.log(
  JSON.stringify(
    {
      pieces: PIECES.length,
      perClass: Object.fromEntries(
        CLASS_LABELS.map((label) => [label, PIECES.filter((piece) => piece.classLabel === label).length])
      ),
      setBonuses: SET_BONUSES,
      currentArmor: currentArmor.length,
      currentItems: currentItems.length,
      betaItems: betaItems.length,
      status: "passed"
    },
    null,
    2
  )
);
console.log("Current-Data Champion's PvP armor regression checks passed.");
