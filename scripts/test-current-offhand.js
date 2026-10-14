/* Current-Data off-hand regression checks.

   The 32 supplied off-hand entries (shields, daggers, quivers, lanterns and grimoires) are the
   source of truth for Compendium > Weapons and for the Character Build's Current Data Offhand
   slot. Aincrad/eCompendium/ecompendium_current.js is their only home: the Compendium reads the
   weapon bucket when the dataset is "current" and the Character Build adapter normalizes the same
   object, so no page keeps its own copy.

   These checks pin every supplied field (name, class, minimum level, source category, stats and
   description), the source category the adapter derives the Offhand slot from, the class filtering
   the Offhand picker uses, and the fact that none of these entries is a two-handed Main Hand
   weapon. They also pin the Beta counts so the Current additions can never leak into Beta Data. */
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

const currentWeapons = toHost(context.SAO_CURRENT_EQUIPMENT_DATA.floor1.weapon);
const byName = new Map(currentWeapons.map((item) => [item.name, item]));

/* The 32 supplied off-hand entries, exactly as given. The shield variants and the class-specific
   lanterns carry the disambiguating suffix the UI needs; `stats` holds the supplied stats in the
   supplied order, without the Class and source-category fields that are pinned separately. */
const OFFHAND_ENTRIES = [
  { name: "Ika's Shield", class: "Warrior", level: 3, category: "Second Hand [P1]", stats: { Defense: "+2", "Guard Durability": "12", Health: "+12", "Movement Speed": "-5%" }, description: "Forged from the shells of Ika's turtles. Offers good protection." },
  { name: "Spiked Wooden Shield", class: "Warrior", level: 3, category: "Second Hand [P1]", stats: { "Attack Damage": "0.5", "Guard Durability": "6", Health: "+6" }, description: "A torn piece of wood covered in sharp spikes" },
  { name: "Copper Shield (Defensive)", class: "Warrior", level: 5, category: "Second Hand [P1]", stats: { Defense: "+3", "Guard Durability": "16", Health: "+16", "Movement Speed": "-5%" }, description: "Forged from copper, its large size and weight provide effective protection" },
  { name: "Copper Shield (Offensive)", class: "Warrior", level: 5, category: "Off-Hand [P1]", stats: { "Attack Damage": "0.75", "Guard Durability": "8", Health: "+8" }, description: "Forged from copper, this shoulder shield protects against counterattacks" },
  { name: "Tolbana Shield (Defensive)", class: "Warrior", level: 7, category: "Second Hand [P1]", stats: { Defense: "+4", "Guard Durability": "20", Health: "+20", "Movement Speed": "-5%" }, description: "Forged in the image of an ancient and powerful Tolbana mage. Ensures your defenses." },
  { name: "Tolbana Shield (Offensive)", class: "Warrior", level: 7, category: "Off-Hand [P1]", stats: { "Attack Damage": "1", "Guard Durability": "10", Health: "+10" }, description: "Forged in the image of an ancient and powerful Tolbana mage. Ensures your offensives." },
  { name: "Iron Shield (Defensive)", class: "Warrior", level: 9, category: "Second Hand [P1]", stats: { Defense: "+4", "Guard Durability": "24", Health: "+24", "Movement Speed": "-5%" }, description: "Forged from iron, this shield is large and sturdy, ideal for protecting your life in the heat of battle." },
  { name: "Iron Shield (Offensive)", class: "Warrior", level: 9, category: "Second Hand [P1]", stats: { "Attack Damage": "1.25", "Guard Durability": "12", Health: "+12" }, description: "Forged from iron, this shield is light and ideal for warriors" },
  { name: "Basic Dagger (Offhand)", class: "Assassin", level: 3, category: "Off-Hand [P1]", stats: { "Critical Chance": "+0.75%" }, description: "Basic, allows for easier chaining of attacks." },
  { name: "Copper Dagger (Offhand)", class: "Assassin", level: 5, category: "Second Hand [P1]", stats: { "Critical Chance": "+1%" }, description: "Made from copper, this dagger is stronger." },
  { name: "Albal's Dagger", class: "Assassin", level: 7, category: "Second Hand [P1]", stats: { "Critical Chance": "+1.25%" }, description: "A dagger of bestial nature, it is made from the sharp, pointed fangs of wolves" },
  { name: "Iron Dagger (Offhand)", class: "Assassin", level: 9, category: "Second Hand [P1]", stats: { "Critical Chance": "+1.5%" }, description: "Forged from iron, this dagger is sharp." },
  { name: "Basic Quiver", class: "Archer", level: 3, category: "Second Hand [P1]", stats: { "Critical Chance": "+0.75%" }, description: "A simple quiver, ideal for your first hunts." },
  { name: "Copper Quiver", class: "Archer", level: 5, category: "Second Hand [P1]", stats: { "Critical Chance": "+1%" }, description: "Reinforced with copper, sturdy for adventure." },
  { name: "Hunter's Quiver", class: "Archer", level: 7, category: "Second Hand [P1]", stats: { "Critical Chance": "+1.25%" }, description: "Designed for experienced big-game hunters." },
  { name: "Iron Quiver", class: "Archer", level: 9, category: "Second Hand [P1]", stats: { "Critical Chance": "+1.5%" }, description: "Forged from durable iron, reliable in any situation." },
  { name: "Basic Lantern (Mage)", class: "Mage", level: 3, category: "Second Hand [P1]", stats: { "Magic Damage": "+1.25%" }, description: "A simple, reliable, and functional lantern." },
  { name: "Grimoire Sylvestre", class: "Mage", level: 3, category: "Second Hand [P1]", stats: { "Max Mana": "+1.5" }, description: "A book forged from materials from an ancient, putrid swamp. It contains elemental magic" },
  { name: "Grimoire of the Revenants", class: "Mage", level: 5, category: "Second Hand [P1]", stats: { "Max Mana": "+2" }, description: "A book from the cursed ruins. It reeks of blood." },
  { name: "Copper Lantern (Mage)", class: "Mage", level: 5, category: "Second Hand [P1]", stats: { "Magic Damage": "+1.5%" }, description: "A copper lantern, emitting a warm, arcane glow." },
  { name: "Magician's Grimoire (Mage)", class: "Mage", level: 7, category: "Second Hand [P1]", stats: { "Max Mana": "+2.5" }, description: "This book was forged using powerful Tier 1 materials. It embodies the power of a Magician." },
  { name: "Magician's Lantern (Mage)", class: "Mage", level: 7, category: "Second Hand [P1]", stats: { "Magic Damage": "+1.75%" }, description: "A lantern crafted by an experienced magician." },
  { name: "Dark Grimoire (Mage)", class: "Mage", level: 9, category: "Second Hand [P1]", stats: { "Max Mana": "+3" }, description: "A dark mixture of ancient materials, lost in a great labyrinth. It could be the grimoire of a reaper" },
  { name: "Iron Lantern (Mage)", class: "Mage", level: 9, category: "Second Hand [P1]", stats: { "Magic Damage": "+2%" }, description: "A sturdy iron lantern, radiating steady magic." },
  { name: "Beastly Grimoire", class: "Shaman", level: 3, category: "Second Hand [P1]", stats: { "Healing Bonus": "+1.2" }, description: "A book forged from materials from an ancient, putrid swamp. It contains beastly magic." },
  { name: "Basic Lantern (Shaman)", class: "Shaman", level: 3, category: "Second Hand [P1]", stats: { "Magic Damage": "+1.25%" }, description: "A simple, reliable, and functional lantern." },
  { name: "Copper Lantern (Shaman)", class: "Shaman", level: 5, category: "Second Hand [P1]", stats: { "Magic Damage": "+1.5%" }, description: "A copper lantern, emitting a warm, arcane glow." },
  { name: "Skeletal Grimoire", class: "Shaman", level: 5, category: "Second Hand [P1]", stats: { "Healing Bonus": "+1.5" }, description: "A book from the cursed ruins. It reeks of death." },
  { name: "Magician's Lantern (Shaman)", class: "Shaman", level: 7, category: "Second Hand [P1]", stats: { "Magic Damage": "+1.75%" }, description: "A lantern crafted by an experienced magician." },
  { name: "Sorcerer's Grimoire (Shaman)", class: "Shaman", level: 7, category: "Second Hand [P1]", stats: { "Healing Bonus": "+1.8" }, description: "This book was forged using powerful Tier 1 materials. It embodies the power of a Sorcerer." },
  { name: "Iron Lantern (Shaman)", class: "Shaman", level: 9, category: "Second Hand [P1]", stats: { "Magic Damage": "+2%" }, description: "A sturdy iron lantern, diffusing steady magic." },
  { name: "Ghostly Grimoire", class: "Shaman", level: 9, category: "Second Hand [P1]", stats: { "Healing Bonus": "+2" }, description: "An obscure mixture of ancient materials, lost in a great labyrinth. It could be the grimoire of a powerful ghost." },
];

/* --- Every supplied entry exists exactly once ------------------------------- */
assert.equal(OFFHAND_ENTRIES.length, 32, "all 32 supplied off-hand entries are pinned");
const suppliedNames = OFFHAND_ENTRIES.map((entry) => entry.name);
assert.equal(new Set(suppliedNames).size, suppliedNames.length, "the supplied off-hand names are unique");
suppliedNames.forEach((name) => {
  assert.equal(
    currentWeapons.filter((item) => item.name === name).length,
    1,
    `${name} exists exactly once in the Current weapon bucket`
  );
});
/* The two source categories are preserved exactly and both are used. */
assert.deepEqual(
  [...new Set(OFFHAND_ENTRIES.map((entry) => entry.category))].sort(),
  ["Off-Hand [P1]", "Second Hand [P1]"],
  "both supplied source categories are used"
);

/* --- Every supplied field is preserved -------------------------------------- */
OFFHAND_ENTRIES.forEach((expected) => {
  const item = byName.get(expected.name);
  assert.ok(item, `${expected.name} is present in the Current dataset`);
  assert.equal(item.level, expected.level, `${expected.name}: minimum level`);
  assert.equal(item.description, expected.description, `${expected.name}: description`);
  assert.equal(item.stats.Class, expected.class, `${expected.name}: class restriction`);
  assert.equal(item.stats["Weapon Category"], expected.category, `${expected.name}: source category`);
  assert.deepEqual(
    Object.keys(item.stats).sort(),
    ["Class", "Weapon Category", ...Object.keys(expected.stats)].sort(),
    `${expected.name}: exact stat key set`
  );
  Object.entries(expected.stats).forEach(([key, value]) =>
    assert.equal(item.stats[key], value, `${expected.name}: ${key}`)
  );
  /* Nothing is invented: no rarity, no crafting cost, no two-handed flag, no crafting recipe. */
  assert.equal(item.rarity, undefined, `${expected.name}: no rarity is invented`);
  assert.equal(item.craftingResources, undefined, `${expected.name}: no crafting cost is invented`);
  assert.equal(item.stats["Two-Handed"], undefined, `${expected.name}: off-hand gear is never two-handed`);
  assert.equal(item.set, undefined, `${expected.name}: no set is invented`);
});

/* Guard Durability stays its own stat instead of being merged into Defense, and the shields keep
   their negative Movement Speed. */
["Ika's Shield", "Copper Shield (Defensive)", "Tolbana Shield (Defensive)", "Iron Shield (Defensive)"].forEach((name) => {
  const stats = byName.get(name).stats;
  assert.ok(stats.Defense && stats["Guard Durability"], `${name} keeps Defense and Guard Durability apart`);
  assert.notEqual(stats.Defense, stats["Guard Durability"], `${name} does not merge the two stats`);
  assert.equal(stats["Movement Speed"], "-5%", `${name} keeps its negative Movement Speed`);
});

/* "Maximum Mana" is normalized onto the dataset's canonical "Max Mana" key; the value is unchanged
   and no entry carries the old spelling. */
assert.equal(
  currentWeapons.some((item) => Object.prototype.hasOwnProperty.call(item.stats, "Maximum Mana")),
  false,
  "no entry carries the Maximum Mana spelling"
);
assert.deepEqual(
  ["Grimoire of the Revenants", "Dark Grimoire (Mage)"].map((name) => byName.get(name).stats["Max Mana"]),
  ["+2", "+3"],
  "the Maximum Mana values are preserved under the canonical key"
);
/* Healing Bonus keeps the supplied values with no percentage sign. */
assert.deepEqual(
  ["Beastly Grimoire", "Skeletal Grimoire", "Sorcerer's Grimoire (Shaman)", "Ghostly Grimoire"].map(
    (name) => byName.get(name).stats["Healing Bonus"]
  ),
  ["+1.2", "+1.5", "+1.8", "+2"],
  "the Healing Bonus values are preserved without an added percentage sign"
);

/* --- The Character Build adapter sees the same entries ---------------------- */
const CLASS_ID_BY_LABEL = {
  Warrior: "guerrier",
  Assassin: "assassin",
  Archer: "archer",
  Mage: "mage",
  Shaman: "shaman"
};
const CLASS_IDS = ["archer", "assassin", "guerrier", "mage", "martial-artist", "shaman"];
const currentItems = toHost(adapter.getItems("current"));
const currentItemByName = new Map(currentItems.map((item) => [item.name, item]));

OFFHAND_ENTRIES.forEach((expected) => {
  const item = currentItemByName.get(expected.name);
  assert.ok(item, `${expected.name} is normalized for the builder`);
  /* Every one of the 32 is Offhand-slot equipment, whatever the source category says. */
  assert.equal(item.type, "Offhand", `${expected.name} is Offhand equipment`);
  assert.equal(item.slot, "Offhand", `${expected.name} fills the Offhand slot`);
  assert.equal(item.category, "weapon", `${expected.name} stays in the weapon bucket`);
  assert.equal(item.levelRequirement, expected.level, `${expected.name} keeps its minimum level`);
  assert.equal(item.weaponCategory, expected.category, `${expected.name} exposes its source category`);
  assert.equal(item.twoHanded, false, `${expected.name} is not two-handed`);
  assert.equal(adapter.isTwoHanded(item), false, `${expected.name}: adapter two-handed check`);
  assert.deepEqual(item.classes, [CLASS_ID_BY_LABEL[expected.class]], `${expected.name} keeps its class`);
  /* Every stat the card shows must reach the builder UI through item.effects. */
  Object.keys(item.stats)
    .filter((key) => key.toLowerCase() !== "class")
    .forEach((key) =>
      assert.ok(
        item.effects.some((effect) => effect.startsWith(`${key}:`)),
        `${expected.name} exposes ${key} to the builder UI`
      )
    );

  /* The Offhand picker lists it for its own class and for no other, and never as a Main Hand. */
  const ownClassId = CLASS_ID_BY_LABEL[expected.class];
  CLASS_IDS.forEach((classId) => {
    const inOffhand = adapter
      .getItemsForSlot("current", "offhand", classId)
      .some((candidate) => candidate.name === expected.name);
    assert.equal(inOffhand, classId === ownClassId, `${expected.name} off-hand eligibility for ${classId}`);
    assert.equal(
      adapter
        .getItemsForSlot("current", "main-weapon", classId)
        .some((candidate) => candidate.name === expected.name),
      false,
      `${expected.name} is never offered as a Main Hand weapon for ${classId}`
    );
  });
  /* The picker's level filter can reach it at its own minimum level. */
  assert.ok(item.levelRequirement <= 9, `${expected.name} is reachable at level 9`);
});

/* --- Duplicate-name variants stay separate ---------------------------------- */
const SHIELD_VARIANTS = [
  ["Copper Shield (Defensive)", "Copper Shield (Offensive)"],
  ["Tolbana Shield (Defensive)", "Tolbana Shield (Offensive)"],
  ["Iron Shield (Defensive)", "Iron Shield (Offensive)"]
];
SHIELD_VARIANTS.forEach(([defensive, offensive]) => {
  const first = currentItemByName.get(defensive);
  const second = currentItemByName.get(offensive);
  assert.ok(first && second, `${defensive} and ${offensive} both exist`);
  assert.notEqual(first.id, second.id, `${defensive} and ${offensive} have distinct ids`);
  assert.notEqual(first.equipmentKey, second.equipmentKey, `${defensive} and ${offensive} have distinct keys`);
  assert.notDeepEqual(first.stats, second.stats, `${defensive} and ${offensive} keep their own stats`);
});
/* The off-hand daggers are separate items from the same-named Main Hand daggers. */
[
  ["Basic Dagger", "Basic Dagger (Offhand)"],
  ["Copper Dagger", "Copper Dagger (Offhand)"],
  ["Iron Dagger", "Iron Dagger (Offhand)"]
].forEach(([mainHand, offHand]) => {
  const main = currentItemByName.get(mainHand);
  const off = currentItemByName.get(offHand);
  assert.ok(main && off, `${mainHand} and ${offHand} both exist`);
  assert.equal(main.type, "Main Weapon", `${mainHand} is the Main Hand dagger`);
  assert.equal(off.type, "Offhand", `${offHand} is the Offhand dagger`);
  assert.notEqual(main.id, off.id, `${mainHand} and ${offHand} have distinct ids`);
});
/* Internal ids are stable and unique across the whole Current dataset. */
const currentIds = currentItems.map((item) => item.id);
assert.equal(new Set(currentIds).size, currentIds.length, "every Current item id is unique");
assert.equal(new Set(suppliedNames.map((name) => currentItemByName.get(name).id)).size, 32, "32 distinct ids");

/* --- Current and Beta stay separate ----------------------------------------- */
const betaItems = toHost(adapter.getItems("beta"));
assert.equal(betaItems.length, 542, "the Beta equipment count is unchanged");
assert.equal(betaItems.filter((item) => item.type === "Offhand").length, 13, "the Beta off-hand count is unchanged");
assert.equal(
  betaItems.some((item) => item.weaponCategory),
  false,
  "no source category leaks into Beta Data"
);
assert.equal(
  currentItems.length,
  225,
  "Current Data ships the 122 earlier equipment items, the 32 off-hand entries, the 20 Champion's PvP armor pieces and the 51 normal armor pieces"
);

console.log(
  JSON.stringify(
    {
      offhandEntries: OFFHAND_ENTRIES.length,
      sourceCategories: [...new Set(OFFHAND_ENTRIES.map((entry) => entry.category))].sort(),
      classes: Object.keys(CLASS_ID_BY_LABEL),
      levels: [...new Set(OFFHAND_ENTRIES.map((entry) => entry.level))].sort((a, b) => a - b),
      currentItems: currentItems.length,
      betaItems: betaItems.length,
      status: "passed"
    },
    null,
    2
  )
);
console.log("Current-Data off-hand regression checks passed.");
