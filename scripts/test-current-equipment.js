/* Current-Data accessory regression checks.

   Current Data ships six accessory sets (Ice Spirits, Ice Golem, Peaceful Deer, Shark, Little
   Slime, Spider). Aincrad/eCompendium/ecompendium_current.js is their single source of truth: the
   Equipment Compendium reads it when the dataset is "current" and the Character Build adapter
   normalizes the same object for its "current" source, so neither page holds its own copy.

   These checks pin the shipped data (every supplied stat, resource and Col cost), the
   one-set-one-bonus rule, that Beta Data is untouched, and the Character Build wiring: an item is
   equippable in the slot its name derives, and its modelled stats plus its set bonuses reach the
   build totals through the existing calculator. */
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

/* VM objects come from another realm, so comparisons run against a plain host copy. */
const toHost = (value) => JSON.parse(JSON.stringify(value));

const currentAccessories = toHost(context.SAO_CURRENT_EQUIPMENT_DATA.floor1.accessory);
const byName = new Map(currentAccessories.map((item) => [item.name, item]));
const currentFloorData = toHost(context.SAO_CURRENT_EQUIPMENT_DATA.floor1);

/* The Current Data items that are not accessories, exactly as supplied: the Starting Town tools,
   the dungeon keys, Boar Meat, the Teleportation Crystal and the two potions. `cols` is null when
   the source gave no Col cost (the cost is then not invented). */
const EXPECTED_OTHER_ITEMS = [
  { bucket: "tool", name: "Chipped Axe", rarity: "Common", level: 1, location: "F1 - Starting Town - Tools", cols: 50, resources: [], stats: { "Effect: Harvest Power": "1", "Effect: Sustainability": "448" } },
  { bucket: "tool", name: "Cracked Pickaxe", rarity: "Common", level: 1, location: "F1 - Starting Town - Tools", cols: 50, resources: [], stats: { "Effect: Harvest Power": "1", "Effect: Sustainability": "448" } },
  { bucket: "tool", name: "Twisted Hoe", rarity: "Common", level: 1, location: "F1 - Starting Town - Tools", cols: 50, resources: [], stats: { "Effect: Sustainability": "448" } },
  { bucket: "tool", name: "Wooden Fishing Rod", rarity: "Common", level: 1, location: "F1 - Starting Town - Tools", cols: 50, resources: [], stats: { "Effect: Sustainability": "448" } },
  { bucket: "dungeon", name: "Forest Key", location: "F1 - Geldorack Dungeon Guard - Starting Town", cols: 10, resources: [["Sylvan Bark", 8], ["Wood Heart", 4], ["Magic Mycelium", 1]], stats: {} },
  { bucket: "dungeon", name: "Key of the Fallen", location: "F1 - Fallen Labyrinth Dungeon Guard - Tolbana", cols: 20, resources: [["Cursed Fabric", 8], ["Leaf Fragment", 8]], stats: {} },
  { bucket: "dungeon", name: "Key of Xal'Zirith", location: "F1 - Xal'Zirith Dungeon Guard - Candelia", cols: 15, resources: [["Spider Cloth", 16], ["Spider Thread", 16]], stats: {} },
  { bucket: "dungeon", name: "Kobold Key", location: "Kobold Dungeon - Loot Info", cols: null, resources: [], stats: {} },
  { bucket: "food", name: "Boar Meat", level: 1, cols: 1, resources: [], stats: { "Effect: Level Required To Use Food": "1", "Effect: Nourriture": "5 Nourriture", "Effect: Recharge Nourriture": "1s" } },
  { bucket: "consumable", name: "Teleportation Crystal", location: "Starting Merchant", cols: null, resources: [], stats: {} },
  { bucket: "consumable", name: "Health Potion I", level: 1, cols: 5, resources: [], stats: { "Health Restored": "10", Cooldown: "15s", "Effect: Healing": "HEALING" } },
  { bucket: "consumable", name: "Mana Potion I", level: 1, cols: 5, resources: [], stats: { "Mana Restored": "5", Cooldown: "15s", "Effect: Mana": "MANA" } }
];

/* Every supplied accessory, with the item stats and material costs exactly as given. The Col cost
   is carried as a crafting resource (item "Col"), the currency name the Beta Data already uses. */
const EXPECTED_ACCESSORIES = [
  { name: "Glacial Ring", level: 7, set: "Ice Spirits Set", cols: 33, stats: { "Skill Critical Damage": "+3%", Defense: "+1", "Mana Regeneration": "+0.1/s" }, resources: [["Glacial Magic Shard", 12], ["Frost Dust", 8]] },
  { name: "Glacial Antenna", level: 7, set: "Ice Spirits Set", cols: 33, stats: { "Skill Damage": "+2%" }, resources: [["Glacial Magic Shard", 16]] },
  { name: "Glacial Essence", level: 7, set: "Ice Spirits Set", cols: 40, stats: { "Magic Damage": "+3%", Health: "+3", "Max Mana": "+1" }, resources: [["Frost Dust", 32]] },
  { name: "Glacial Amulet", level: 7, set: "Ice Spirits Set", cols: 33, stats: { "Max Mana": "+1.5" }, resources: [["Glacial Magic Shard", 12], ["Birch String", 1]] },
  { name: "Frozen Ring", level: 7, set: "Ice Golem Set", cols: 33, stats: { Health: "+5" }, resources: [["Hard Glacial Hide", 12], ["Frost Dust", 8]] },
  { name: "Frozen Bracelet", level: 7, set: "Ice Golem Set", cols: 33, stats: { Defense: "+2", Health: "+1", "Max Stamina": "+1" }, resources: [["Hard Glacial Hide", 16]] },
  { name: "Frozen Gloves", level: 7, set: "Ice Golem Set", cols: 30, stats: { Defense: "+2", Health: "+3" }, resources: [["Hard Glacial Hide", 12]] },
  { name: "Frozen Amulet", level: 7, set: "Ice Golem Set", cols: 30, stats: { "Max Stamina": "+1", "Health Regeneration": "+0.1/s" }, resources: [["Hard Glacial Hide", 8], ["Birch String", 1]] },
  { name: "Bracelet of the Stags", level: 7, set: "Peaceful Deer Set", cols: 33, stats: { "Bonus Healing": "+1.5" }, resources: [["Mountain Stag Hide", 12]] },
  { name: "Gloves of the Stags", level: 7, set: "Peaceful Deer Set", cols: 33, stats: { "Mana Regeneration": "+0.2/s", "Bonus Healing": "+0.5" }, resources: [["Mountain Stag Hide", 12]] },
  { name: "Ring of the Shark", level: 7, set: "Shark Set", cols: 30, stats: { "Physical Damage": "+2%" }, resources: [["Shark Carapace", 8]] },
  { name: "Shark Amulet", level: 7, set: "Shark Set", cols: 30, stats: { "Attack Damage": "+0.75" }, resources: [["Shark Carapace", 8], ["Birch String", 1]] },
  { name: "Shark Fang", level: 7, set: "Shark Set", cols: 33, stats: { "Attack Damage": "+1" }, resources: [["Shark Carapace", 12], ["Wolf Fangs", 8]] },
  { name: "Bracelet of the Shark", level: 7, set: "Shark Set", cols: 33, stats: { "Life Steal": "+3%", Health: "+3" }, resources: [["Shark Carapace", 12], ["Iron Ingot", 1]] },
  { name: "Slimy Ring", level: 4, set: "Little Slime Set", cols: 25, stats: { Health: "+1", "Max Mana": "+0.5", "Max Stamina": "+0.5" }, resources: [["Slime Jelly", 8]] },
  { name: "Gelatinous Bracelet", level: 4, set: "Little Slime Set", cols: 28, stats: { Health: "+1", "Health Regeneration": "+0.05/s", "Mana Regeneration": "+0.05/s", "Stamina Regeneration": "+0.05/s" }, resources: [["Slime Jelly", 12], ["Slime Core", 4]] },
  { name: "Gelatinous Amulet", level: 4, set: "Little Slime Set", cols: 25, stats: { "Bonus Healing": "+0.5" }, resources: [["Oak String", 1], ["Slime Jelly", 8]] },
  { name: "Spider Ring", level: 6, set: "Spider Set", cols: 30, stats: { "Critical Damage": "+2%", Dodge: "+1%" }, resources: [["Spider Cloth", 8], ["Coal Ore", 8]] },
  { name: "Spider Bracelet", level: 6, set: "Spider Set", cols: 30, stats: { Dodge: "+1%", Health: "+2" }, resources: [["Spider Cloth", 8], ["Corrupted Spore", 8]] },
  { name: "Spider Gloves", level: 6, set: "Spider Set", cols: 30, stats: { "Critical Damage": "+2%", Dodge: "+0.5%" }, resources: [["Spider Cloth", 8], ["Spider Thread", 8]] },
  { name: "Spider Cloak", level: 6, set: "Spider Set", cols: 33, stats: { "Attack Damage": "+0.5", Dodge: "+1%" }, resources: [["Spider Cloth", 12], ["Spider Thread", 8]] },
  { name: "Iron Ring", level: 5, set: "Iron Set", cols: 30, stats: { "Critical Hit Chance": "+1%", "Skill Critical Hit Chance": "+1%", Health: "+1" }, resources: [["Iron Ingot", 1]] },
  { name: "Iron Bracelet", level: 5, set: "Iron Set", cols: 30, stats: { "Critical Damage": "+1%", "Skill Critical Damage": "+1%", Health: "+1" }, resources: [["Iron Ingot", 1]] },
  { name: "Iron Gloves", level: 5, set: "Iron Set", cols: 30, stats: { Defense: "+1.5", Health: "+1" }, resources: [["Iron Ingot", 1]] },
  { name: "Iron Coin", level: 5, set: "Iron Set", cols: 30, stats: { "Attack Damage": "+0.5", Health: "+1", "Bonus Healing": "+1" }, resources: [["Iron Ingot", 1]] },
  { name: "Iron Amulet", level: 5, set: "Iron Set", cols: 30, stats: { Health: "+1", "Max Mana": "+1", "Max Stamina": "+1" }, resources: [["Iron Ingot", 1], ["Iron String", 1]] },
  { name: "Copper Ring", level: 3, set: "Copper Set", cols: 25, stats: { "Critical Hit Chance": "+0.5%", "Skill Critical Hit Chance": "+0.5%", Health: "+0.5" }, resources: [["Copper Ingot", 1]] },
  { name: "Copper Bracelet", level: 3, set: "Copper Set", cols: 25, stats: { "Critical Damage": "+0.5%", "Skill Critical Damage": "+0.5%", Health: "+0.5" }, resources: [["Copper Ingot", 1]] },
  { name: "Copper Gloves", level: 3, set: "Copper Set", cols: 25, stats: { Defense: "+1", Health: "+0.5" }, resources: [["Copper Ingot", 1]] },
  { name: "Copper Coin", level: 3, set: "Copper Set", cols: 25, stats: { "Attack Damage": "+0.25", Health: "+0.5", "Bonus Healing": "+0.5" }, resources: [["Copper Ingot", 1]] },
  { name: "Copper Amulet", level: 3, set: "Copper Set", cols: 25, stats: { Health: "+0.5", "Max Mana": "+0.5", "Max Stamina": "+0.5" }, resources: [["Copper Ingot", 1], ["Copper String", 1]] },
  { name: "Ring of the Nepenthes", level: 5, set: "Nepenthes Set", cols: 25, stats: { "Max Mana": "+1" }, resources: [["Leaf Fragments", 8], ["Corrupted Spore", 8]] },
  { name: "Bracelet of the Nepenthes", level: 5, set: "Nepenthes Set", cols: 28, stats: { "Skill Damage": "+1%", Defense: "+2" }, resources: [["Leaf Fragments", 12]] },
  { name: "Amulet of the Nepenthes", level: 5, set: "Nepenthes Set", cols: 25, stats: { "Skill Critical Damage": "+2%", "Mana Regeneration": "+0.1/s" }, resources: [["Leaf Fragments", 4], ["Corrupted Spore", 4], ["Oak String", 1]] },
  { name: "Elite Gloves", level: 3, set: "Elite Treant Set", cols: 25, stats: { "Attack Damage": "+0.25", "Critical Damage": "+1%" }, resources: [["Wolf Fur", 8]] },
  { name: "Elite Amulet", level: 3, set: "Elite Treant Set", cols: 25, stats: { "Max Stamina": "+0.5" }, resources: [["Oak String", 1], ["Sylvan Bark", 8]] },
  { name: "Elite Bracelet", level: 3, set: "Elite Treant Set", cols: 28, stats: { "Critical Hit Chance": "+1%" }, resources: [["Oak Log", 4], ["Titan Bark", 4], ["Sylvan Bark", 8]] },
  { name: "Elite Carapace", level: 3, set: "Elite Treant Set", cols: 28, stats: { "Attack Damage": "+0.5", Health: "+2" }, resources: [["Titan Bark", 8], ["Sylvan Bark", 8], ["Sylve Sprout", 8]] },
  { name: "Bracelet of Ice", level: 8, set: "Ice Golem Set", cols: 45, stats: { "Skill Damage": "+2%", "Ability Haste": "+2%", "Damage Reduction": "+2%", Health: "+2" }, resources: [["Fragment of the Bear's Soul", 3], ["Hard Glacial Hide", 24]] },
  { name: "Necklace of Aragorn", level: 8, set: "Spider Set", cols: 50, stats: { "Attack Damage": "+0.5", "Fall Damage Reduction": "+15%", Dodge: "+5%" }, resources: [["Spider Venom", 3], ["Oak String", 1], ["Spider Thread", 20]] },
  { name: "Sticky Ring", level: 5, set: "Little Slime Set", cols: null, note: "N/A", stats: { Defense: "+1", Health: "+2", "Bonus Healing": "+1" }, resources: [] },
  { name: "Skeleton Skull", level: 8, set: "Standard Skeleton Set", cols: 35, stats: { "Skill Damage": "+1%", Health: "+5", "Max Mana": "+1", "Max Stamina": "+1", "Health Regeneration": "+0.05/s" }, resources: [["Reinforced Skeleton Bone", 20]] },
  { name: "Belt of the Stags", level: 7, set: "Peaceful Deer Set", cols: null, note: "N/A", stats: { "Ability Haste": "+5%", Health: "+2", "Bonus Healing": "+0.5" }, resources: [] },
  { name: "Ring of the Leviathan", level: 7, set: "Shark Set", cols: 55, stats: { "Attack Damage": "+1", Defense: "+3", Health: "+5" }, resources: [["Shark Carapace", 24], ["Heart of Nymbrea", 3], ["Iron Ingot", 1]] },
  { name: "Occult Gloves", level: 10, set: "Shadow Neophyte Set", cols: 5000, stats: { "Life Steal": "+2%", "Spell Vampirism": "+2%", Health: "+3", "Mana Regeneration": "+0.1/s", "Stamina Regeneration": "+0.1/s" }, resources: [] },
  { name: "Occult Bracelet", level: 10, set: "Shadow Neophyte Set", cols: 5000, stats: { Defense: "+2", Health: "+10" }, resources: [] },
  { name: "Occult Ring", level: 10, set: "Shadow Neophyte Set", cols: 5000, stats: { "Physical Damage": "+5%", "Magic Damage": "+5%", "Projectile Damage": "+5%", Health: "+3" }, resources: [] },
  { name: "Occult Amulet", level: 10, set: "Shadow Neophyte Set", cols: 5000, stats: { "Critical Hit Chance": "+2%", "Skill Critical Hit Chance": "+2%", Health: "+5" }, resources: [] },
  { name: "Occult Skull", level: 10, set: "Shadow Neophyte Set", cols: 5000, stats: { "Skill Critical Damage": "+5%", "Magic Damage": "+2%", "Max Mana": "+1" }, resources: [] },
  { name: "Occult Robe", level: 10, set: "Shadow Neophyte Set", cols: 5000, stats: { "Attack Speed": "0.05/s", Dodge: "+2.5%", "Max Stamina": "+1", "Movement Speed": "+2.5%" }, resources: [] },
  /* Current Data supplies no stats, description, resources or cost for the Occult Hood. */
  { name: "Occult Hood", level: 10, set: "Shadow Neophyte Set", cols: null, stats: {}, resources: [] }
];

/* One set, one bonus: every piece of a set repeats the same tiered bonuses. */
const EXPECTED_SET_BONUSES = {
  "Ice Spirits Set": { 2: "+1.5% Skill Critical Hit Chance", 3: "+1 Max Mana", 4: "+3% Magic Damage" },
  "Ice Golem Set": { 2: "+5 Health", 3: "+3% Ability Haste, +0.1/s Health Regeneration", 4: "+1 Defense, +2 Health, +2% Skill Damage" },
  "Peaceful Deer Set": { 2: "+1 Bonus Healing", 3: "+2 Max Mana" },
  "Shark Set": { 2: "+5% Ability Haste", 3: "+3 Health", 4: "+3% Physical Damage" },
  "Little Slime Set": { 2: "+2 Health", 3: "+0.05/s Health Regeneration, +0.05/s Mana Regeneration, +0.05/s Stamina Regeneration", 4: "+5% Cooldown Reduction" },
  "Spider Set": { 2: "+2.5% Movement Speed", 3: "+0.025 Attack Speed", 4: "+2.5% Dodge Chance", 5: "+0.25 Attack Damage, +1% Critical Hit Chance" },
  "Iron Set": { 2: "+3% Movement Speed", 3: "+0.1/s Health Regeneration, +0.1/s Mana Regeneration, +0.1/s Stamina Regeneration", 4: "+2% Magic Damage, +2% Physical Damage, +2% Projectile Damage", 5: "+2 Health, +2 Defense" },
  "Copper Set": { 2: "+2.5% Movement Speed", 3: "+0.05/s Health Regeneration, +0.05/s Mana Regeneration, +0.05/s Stamina Regeneration", 4: "+1% Magic Damage, +1% Physical Damage, +1% Projectile Damage", 5: "+1 Health, +1 Defense" },
  "Nepenthes Set": { 2: "+1% Skill Critical Hit Chance", 3: "+0.5 Max Mana", 4: "+2.5% Magic Damage" },
  "Elite Treant Set": { 2: "+0.5% Critical Hit Chance", 3: "+2% Movement Speed", 4: "+5% Projectile Damage" },
  "Standard Skeleton Set": { 2: "+5% Ability Haste", 3: "+0.05/s Health Regeneration", 4: "-2% Damage Reduction" },
  "Shadow Neophyte Set": {
    2: "-0.6/s Health Regeneration, -50% Healing Received",
    3: "-0.6/s Health Regeneration",
    4: "-0.6/s Health Regeneration",
    5: "-0.6/s Health Regeneration",
    6: "-0.6/s Health Regeneration",
    7: "-0.6/s Health Regeneration"
  }
};

/* --- The supplied accessory data is shipped in full ------------------------- */
assert.equal(currentAccessories.length, EXPECTED_ACCESSORIES.length, "every supplied accessory is present");
assert.equal(byName.size, EXPECTED_ACCESSORIES.length, "accessory names are unique inside Current Data");

EXPECTED_ACCESSORIES.forEach((expected) => {
  const item = byName.get(expected.name);
  assert.ok(item, `${expected.name} is present in Current Data`);
  assert.equal(item.level, expected.level, `${expected.name} minimum level`);
  assert.equal(item.set, expected.set, `${expected.name} set`);
  assert.deepEqual(
    Object.fromEntries(Object.entries(item.stats).filter(([key]) => !/Piece Set Bonus/i.test(key))),
    expected.stats,
    `${expected.name} item stats`
  );
  assert.deepEqual(
    (item.craftingResources || []).map((resource) => [resource.item, resource.amount]),
    expected.cols === null ? expected.resources : [...expected.resources, ["Col", expected.cols]],
    `${expected.name} crafting resources and Col cost`
  );
  assert.equal(item.craftingNote ?? null, expected.note ?? null, `${expected.name} crafting note`);
});

/* --- The other supplied Current items --------------------------------------- */
EXPECTED_OTHER_ITEMS.forEach((expected) => {
  const item = currentFloorData[expected.bucket].find((entry) => entry.name === expected.name);
  assert.ok(item, `${expected.name} is present in Current Data`);
  assert.equal(item.level ?? null, expected.level ?? null, `${expected.name} minimum level`);
  assert.equal(item.rarity ?? null, expected.rarity ?? null, `${expected.name} rarity`);
  assert.equal(item.craftingLocation ?? null, expected.location ?? null, `${expected.name} crafting location`);
  assert.deepEqual(item.stats || {}, expected.stats, `${expected.name} statistics`);
  assert.deepEqual(
    (item.craftingResources || []).map((resource) => [resource.item, resource.amount]),
    expected.cols === null ? expected.resources : [...expected.resources, ["Col", expected.cols]],
    `${expected.name} crafting resources and Col cost`
  );
});
/* The Teleportation Crystal and the Kobold Key carry no resource cost or Col value, and none was
   invented for them. */
["Teleportation Crystal", "Kobold Key"].forEach((name) => {
  const item = currentFloorData.consumable.concat(currentFloorData.dungeon).find((entry) => entry.name === name);
  assert.equal(item.craftingResources ?? null, null, `${name} carries no invented resource cost`);
});

/* The source's accidental text must never become item data. */
assert.equal(
  JSON.stringify(currentAccessories).includes("Incomplete Juice"),
  false,
  "the stray source text is not part of any accessory"
);

/* Every tier of a set carries identical bonuses on all of its pieces. */
Object.entries(EXPECTED_SET_BONUSES).forEach(([setName, tiers]) => {
  const pieces = currentAccessories.filter((item) => item.set === setName);
  assert.ok(pieces.length >= 1, `${setName} ships at least one piece`);
  const expectedStats = Object.fromEntries(
    Object.entries(tiers).map(([threshold, value]) => [`${threshold} Piece Set Bonus`, value])
  );
  pieces.forEach((piece) => {
    assert.deepEqual(
      Object.fromEntries(Object.entries(piece.stats).filter(([key]) => /Piece Set Bonus/i.test(key))),
      expectedStats,
      `${setName} bonuses on ${piece.name}`
    );
  });
});

/* --- Beta Data is untouched ------------------------------------------------- */
const betaAudit = require("./audit-equipment-stats")();
assert.equal(betaAudit.totalEquipmentItems, 542, "the Beta equipment count is unchanged");
assert.equal(betaAudit.incomplete, 0, "Beta equipment is still complete");
assert.equal(betaAudit.missing, 0, "Beta equipment still has no missing stats");
assert.equal(
  betaAudit.currentDatasetEquipmentItems,
  EXPECTED_ACCESSORIES.length +
    EXPECTED_OTHER_ITEMS.filter((item) => item.bucket === "tool").length +
    currentFloorData.weapon.length +
    currentFloorData.armor.length,
  "the audit counts the Current equipment items (accessories, tools, weapons and armor)"
);
assert.deepEqual(
  Object.keys(context.SAO_CURRENT_EQUIPMENT_DATA.floor1).filter(
    (category) => context.SAO_CURRENT_EQUIPMENT_DATA.floor1[category].length > 0
  ),
  ["weapon", "armor", "accessory", "tool", "food", "consumable", "material", "dungeon"],
  "the Current items fill the weapon, armor, accessory, tool, food, consumable, material and dungeon buckets"
);

const betaNames = new Set(adapter.getItems("beta").map((item) => item.name));
/* Beta already ships items with these names; every one of them is a separate Current-Data item, so
   the Current dataset keeps its own copy rather than touching Beta. Nothing is duplicated inside
   Current Data - the name-uniqueness assertion above covers that. */
assert.deepEqual(
  EXPECTED_ACCESSORIES.map((item) => item.name)
    .filter((name) => betaNames.has(name))
    .sort(),
  [
    "Copper Amulet", "Copper Bracelet", "Copper Coin", "Copper Gloves", "Copper Ring",
    "Iron Amulet", "Iron Bracelet", "Iron Gloves", "Iron Ring",
    "Occult Amulet", "Occult Bracelet", "Occult Gloves", "Occult Hood", "Occult Ring", "Occult Robe",
    "Occult Skull", "Skeleton Skull", "Spider Bracelet"
  ],
  "no Current accessory leaks into Beta (these names already exist in Beta as separate items)"
);

/* --- Character Build equips the same objects -------------------------------- */
const SLOT_BY_TYPE = { Amulet: "amulet", Ring: "ring-1", Bracelet: "bracelet", Glove: "glove", Artifact: "artifact-1" };
const EXPECTED_TYPES = {
  "Glacial Ring": "Ring", "Glacial Antenna": "Artifact", "Glacial Essence": "Artifact", "Glacial Amulet": "Amulet",
  "Frozen Ring": "Ring", "Frozen Bracelet": "Bracelet", "Frozen Gloves": "Glove", "Frozen Amulet": "Amulet",
  "Bracelet of the Stags": "Bracelet", "Gloves of the Stags": "Glove",
  "Ring of the Shark": "Ring", "Shark Amulet": "Amulet", "Shark Fang": "Artifact", "Bracelet of the Shark": "Bracelet",
  "Slimy Ring": "Ring", "Gelatinous Bracelet": "Bracelet", "Gelatinous Amulet": "Amulet",
  "Spider Ring": "Ring", "Spider Bracelet": "Bracelet", "Spider Gloves": "Glove", "Spider Cloak": "Artifact",
  "Iron Ring": "Ring", "Iron Bracelet": "Bracelet", "Iron Gloves": "Glove", "Iron Coin": "Artifact", "Iron Amulet": "Amulet",
  "Copper Ring": "Ring", "Copper Bracelet": "Bracelet", "Copper Gloves": "Glove", "Copper Coin": "Artifact", "Copper Amulet": "Amulet",
  "Ring of the Nepenthes": "Ring", "Bracelet of the Nepenthes": "Bracelet", "Amulet of the Nepenthes": "Amulet",
  "Elite Gloves": "Glove", "Elite Amulet": "Amulet", "Elite Bracelet": "Bracelet", "Elite Carapace": "Artifact",
  "Bracelet of Ice": "Bracelet", "Necklace of Aragorn": "Amulet", "Sticky Ring": "Ring", "Skeleton Skull": "Artifact",
  "Belt of the Stags": "Artifact", "Ring of the Leviathan": "Ring",
  "Occult Gloves": "Glove", "Occult Bracelet": "Bracelet", "Occult Ring": "Ring", "Occult Amulet": "Amulet",
  "Occult Skull": "Artifact", "Occult Robe": "Artifact", "Occult Hood": "Artifact"
};

const currentItems = toHost(adapter.getItems("current"));
const currentAccessoryItems = currentItems.filter((item) => item.category === "accessory");
assert.equal(
  currentItems.length,
  EXPECTED_ACCESSORIES.length +
    EXPECTED_OTHER_ITEMS.filter((item) => item.bucket === "tool").length +
    currentFloorData.weapon.length +
    currentFloorData.armor.length,
  "the builder normalizes every Current equipment item"
);
assert.equal(currentAccessoryItems.length, EXPECTED_ACCESSORIES.length, "the builder normalizes every Current accessory");

currentAccessoryItems.forEach((item) => {
  const expected = byName.get(item.name);
  assert.equal(item.type, EXPECTED_TYPES[item.name], `${item.name} derives the supplied equipment type`);
  assert.equal(item.category, "accessory", `${item.name} stays in the accessory category`);
  assert.equal(item.set, expected.set, `${item.name} keeps its set`);
  assert.equal(item.levelRequirement, expected.level, `${item.name} keeps its minimum level`);
  assert.ok(
    adapter.getItemsForSlot("current", SLOT_BY_TYPE[item.type]).some((candidate) => candidate.name === item.name),
    `${item.name} is selectable in the ${SLOT_BY_TYPE[item.type]} slot`
  );
});

/* --- Their stats and set bonuses reach the build totals ---------------------- */
const itemByName = (name) => adapter.getItems("current").find((item) => item.name === name);
const buildStats = (equipment) => calculator.calculateBuildStats({ equipment, level: 1, classId: "archer" });
/* Every build carries the class' Level 1 base stats, so an equipment contribution is read as the
   difference from a bare level 1 archer build. */
const archerBase = calculator.createBaseStats("archer");
const flatGain = (result, stat) => result[stat].flat - archerBase[stat].flat;
const percentGain = (result, stat) => result[stat].percent - archerBase[stat].percent;

const spider = buildStats({
  "ring-1": itemByName("Spider Ring"),
  bracelet: itemByName("Spider Bracelet"),
  glove: itemByName("Spider Gloves")
});
assert.equal(flatGain(spider, "Health"), 2, "Spider pieces contribute their Health");
assert.equal(percentGain(spider, "Evasion"), 2.5, "Dodge maps onto the Evasion stat");
assert.equal(percentGain(spider, "Critical Hit Damage"), 4, "Critical Damage maps onto Critical Hit Damage");
assert.equal(percentGain(spider, "Movement Speed"), 2.5, "the Spider 2-piece bonus applies at two pieces");
assert.equal(flatGain(spider, "Attack Speed"), 0.025, "the Spider 3-piece bonus applies at three pieces");

const singleSpider = buildStats({ "ring-1": itemByName("Spider Ring") });
assert.equal(percentGain(singleSpider, "Movement Speed"), 0, "set bonuses stay inactive below their threshold");
assert.equal(flatGain(singleSpider, "Attack Speed"), 0, "set bonuses stay inactive below their threshold");

const golem = buildStats({
  "ring-1": itemByName("Frozen Ring"),
  bracelet: itemByName("Frozen Bracelet"),
  glove: itemByName("Frozen Gloves"),
  amulet: itemByName("Frozen Amulet")
});
assert.equal(flatGain(golem, "Health"), 16, "Ice Golem items plus their 2- and 4-piece Health bonuses apply");
assert.equal(flatGain(golem, "Defense"), 5, "Ice Golem Defense includes the 4-piece bonus");
assert.equal(percentGain(golem, "Skill Damage"), 2, "the Ice Golem 4-piece Skill Damage bonus applies");
assert.equal(
  flatGain(golem, "Health Regeneration"),
  0.2,
  "Frozen Amulet's Health Regeneration and the Ice Golem 3-piece regeneration bonus both apply"
);

/* --- The sets added this round reach the totals too ------------------------- */
const ironThree = buildStats({
  "ring-1": itemByName("Iron Ring"),
  bracelet: itemByName("Iron Bracelet"),
  glove: itemByName("Iron Gloves")
});
assert.equal(percentGain(ironThree, "Critical Hit Chance"), 1, "Iron pieces contribute their critical chance");
assert.equal(flatGain(ironThree, "Health"), 3, "Iron pieces contribute their Health");
assert.equal(percentGain(ironThree, "Movement Speed"), 3, "the Iron 2-piece bonus applies at two pieces");
assert.equal(flatGain(ironThree, "Health Regeneration"), 0.1, "the Iron 3-piece regeneration bonus applies");
assert.equal(flatGain(ironThree, "Mana Regeneration"), 0.1, "the Iron 3-piece regeneration bonus applies");
assert.equal(flatGain(ironThree, "Stamina Regeneration"), 0.1, "the Iron 3-piece regeneration bonus applies");

const occultThree = buildStats({
  "ring-1": itemByName("Occult Ring"),
  bracelet: itemByName("Occult Bracelet"),
  glove: itemByName("Occult Gloves")
});
assert.equal(percentGain(occultThree, "Magic Damage"), 5, "Occult pieces contribute their Magic Damage");
assert.equal(flatGain(occultThree, "Health"), 16, "Occult pieces contribute their Health");
assert.equal(
  flatGain(occultThree, "Health Regeneration"),
  -1.2,
  "the Shadow Neophyte 2- and 3-piece Health Regeneration penalties both apply"
);

const nepenthesTwo = buildStats({
  "ring-1": itemByName("Ring of the Nepenthes"),
  bracelet: itemByName("Bracelet of the Nepenthes")
});
assert.equal(percentGain(nepenthesTwo, "Skill Critical Hit Chance"), 1, "the Nepenthes 2-piece bonus applies");

/* Stats the current stat model does not compute are preserved and reported, never dropped: the
   Compendium and the builder's picker both render them from item.stats / item.effects. */
const UNMODELLED_ITEM_STATS = [
  "Ability Haste",
  "Bonus Healing",
  "Fall Damage Reduction",
  "Life Steal",
  "Max Stamina",
  "Physical Damage",
  "Spell Vampirism"
];
const unsupported = new Set();
currentAccessoryItems.forEach((item) => {
  Object.keys(item.stats).forEach((key) => {
    if (calculator.classifyStatName(key) === "unsupported") unsupported.add(key);
  });
});
assert.deepEqual([...unsupported].sort(), [...UNMODELLED_ITEM_STATS].sort(), "the unmodelled item stats are known");
currentItems.forEach((item) => {
  Object.keys(item.stats)
    .filter((key) => key.toLowerCase() !== "class")
    .forEach((key) => {
      assert.ok(
        item.effects.some((effect) => effect.startsWith(`${key}:`)),
        `${item.name} still exposes ${key} to the builder UI`
      );
    });
});

/* The map-side Current checks (the waypoint categories, the Current-only markers and the mode
   filter) live in scripts/test-current-waypoints.js. */

console.log(
  JSON.stringify(
    {
      accessoryCount: currentAccessories.length,
      sets: Object.keys(EXPECTED_SET_BONUSES),
      equippableSlots: SLOT_BY_TYPE,
      unmodelledItemStats: UNMODELLED_ITEM_STATS,
      status: "passed"
    },
    null,
    2
  )
);




