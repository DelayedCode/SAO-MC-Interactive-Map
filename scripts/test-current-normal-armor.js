/* Current-Data normal armor regression checks.

   The 51 supplied normal armor pieces (levels 3, 7 and 9 for the Warrior, Assassin, Archer, Mage
   and Shaman) are the source of truth for Compendium > Armor and for the Character Build's Current
   Data Helmet, Chestplate, Leggings and Boots slots. Aincrad/eCompendium/ecompendium_current.js is
   their only home: the Compendium reads the armor bucket when the dataset is "current" and the
   Character Build adapter normalizes the same object, so no page keeps its own copy.

   These checks pin every supplied field (canonical name, class, minimum level, Defense, Health,
   the rune-slot count, the description and every set-bonus tier), the slot the adapter derives from
   each canonical name (a Breastplate or Chestplate is a Chestplate, a Tunic or Robe is a
   Chestplate, Sandals are Boots), the class/slot filtering the picker uses, the fact that the
   same-name pieces of two classes stay separate records, that one set spelled two ways still
   activates its tiers together, that every item is translated into Spanish and French, and the Beta
   counts, so the Current additions can never leak into Beta Data. */
"use strict";

const assert = require("node:assert/strict");
const { loadScript } = require("./harness-helpers");

const context = { window: {}, console };
context.window = context;
loadScript("shared/sao-content-translations.js", context);
loadScript("Aincrad/eCompendium/ecompendium_current.js", context);
for (const floor of [1, 2, 3]) loadScript(`Aincrad/eCompendium/ecompendium_floor${floor}.js`, context);
loadScript("Aincrad/Character Build/character-build-calculator.js", context);
loadScript("Aincrad/Character Build/character-build-adapter.js", context);

const calculator = context.CharacterBuildCalculator;
const adapter = context.CharacterBuildAdapter;
const registry = context.SAOContentTranslations;
const toHost = (value) => JSON.parse(JSON.stringify(value));

/* The supplied descriptions, one constant per distinct sentence. */
const DESC = {
  ikaIt: "Carved from the shell of the ancient Ika turtles, it absorbs the initial blows.",
  ikaThey: "Carved from the shell of the ancient Ika turtles, they absorb the initial blows.",
  tolbana: "Forged in Tolbana's forge, it makes the warrior an impenetrable wall.",
  guardian: "Replica of the Guardian's Armor. Fallen: Heavy and unshakeable, it defies death itself.",
  stealthApproach: "Dark leather and silent soles, designed to approach silently and strike from behind.",
  stealthForApproaching: "Dark leather and silent soles, designed for approaching silently and striking from behind.",
  ninja: "Light as a shadow, it embraces the assassin and steals him from death.",
  heraldAssassin: "Inherited from the Fallen Herald, it becomes shadow and dagger in the hands of the assassin.",
  tacticalQuick: "Soft leather and fitted straps, designed to strike quickly and disappear before the counterattack.",
  tacticalFast: "Soft leather and fitted straps, designed to strike fast and disappear before the counterattack.",
  hunter: "Designed for the hunt, it sharpens the archer's eye and guides their shots to the heart.",
  heraldArcher: "Inherited from the Fallen Herald, light and faithful, it follows the archer into every ambush.",
  spectralVeil: "Woven from a spectral veil, it channels the nascent magic of Aincrad's apprentices.",
  sorcererIt: "Embroidered with enchanted threads, it amplifies the mage's spells like a sorcerer of old.",
  sorcererThey: "Embroidered with enchanted threads, they amplify the mage's spells like those of a sorcerer of old.",
  reaperMage: "A replica of the Fallen Reaper, it amplifies spell power tenfold and reaps the enemy from afar.",
  animistIn: "Woven in the breath of spirits, it connects its wearer to the beasts and ancient woods of Aincrad.",
  animistFrom: "Woven from the breath of spirits, it connects its wearer to the beasts and ancient woods of Aincrad.",
  magician: "Imbued with ancient rituals, it nourishes the shaman's mana and prolongs their incantations.",
  reaperFloods: "A replica of the Fallen Reaper, it floods the shaman with mana for both healing and striking.",
  reaperGrants: "A replica of the Fallen Reaper, it grants the shaman mana for both healing and striking."
};

/* The supplied set-bonus tiers, one constant per set. The Sorcerer's 3-piece tier lists two effects,
   which is why its value carries both of them, comma-separated. */
const BONUS = {
  ika: { "2 Piece Set Bonus": "+0.5 Stamina", "3 Piece Set Bonus": "+0.5 Health" },
  protector: {
    "2 Piece Set Bonus": "+1 Max Stamina",
    "3 Piece Set Bonus": "+0.1 Health/s",
    "4 Piece Set Bonus": "+1% Block Chance"
  },
  guardian: {
    "2 Piece Set Bonus": "+1.5 Max Stamina",
    "3 Piece Set Bonus": "+0.15 Health/s",
    "4 Piece Set Bonus": "+2% Block Chance"
  },
  stealth: { "2 Piece Set Bonus": "+2% Dodge Chance", "3 Piece Set Bonus": "+1% Critical Damage" },
  ninja: { "2 Piece Set Bonus": "+3% Dodge Chance", "3 Piece Set Bonus": "+2% Critical Damage" },
  herald: {
    "2 Piece Set Bonus": "+5% Dodge Chance",
    "3 Piece Set Bonus": "+3% Critical Damage",
    "4 Piece Set Bonus": "+5% Movement Speed"
  },
  tactical: { "2 Piece Set Bonus": "+0.05 Stamina/s", "3 Piece Set Bonus": "+0.25 Attack Damage" },
  hunter: { "2 Piece Set Bonus": "+0.1 Stamina/s", "3 Piece Set Bonus": "+0.5% Critical Chance" },
  hunterHerald: {
    "2 Piece Set Bonus": "+0.15 Stamina/s",
    "3 Piece Set Bonus": "+1% Critical Chance",
    "4 Piece Set Bonus": "+0.5 Attack Damage"
  },
  spectral: { "2 Piece Set Bonus": "+0.5 Max Mana", "3 Piece Set Bonus": "+0.5% Skill Critical Chance" },
  sorcerer: { "2 Piece Set Bonus": "+0.15 Mana/s", "3 Piece Set Bonus": "+1 Bonus Healing, +2% Ability Haste" },
  mysticReaper: {
    "2 Piece Set Bonus": "+1.5 Max Mana",
    "3 Piece Set Bonus": "+1.5% Skill Critical Chance",
    "4 Piece Set Bonus": "+1% Skill Critical Damage"
  },
  animist: { "2 Piece Set Bonus": "+0.05 Mana/s", "3 Piece Set Bonus": "+0.5 Bonus Healing" },
  magician: { "2 Piece Set Bonus": "+1 Max Mana", "3 Piece Set Bonus": "+1% Skill Critical Chance" },
  attentiveReaper: {
    "2 Piece Set Bonus": "+0.15 Mana/s",
    "3 Piece Set Bonus": "+1.5 Bonus Healing",
    "4 Piece Set Bonus": "+2% Ability Haste"
  }
};

/* One supplied piece. `runeSlots` is the count the source gives the item: only the level 9
   chestplates and leggings carry one, and every other piece carries none. */
const piece = (classLabel, classId, slot, name, level, description, set, defense, health, bonuses, runeSlots = 0) => ({
  classLabel,
  classId,
  slot,
  name,
  level,
  description,
  set,
  runeSlots,
  stats: Object.assign(
    { Class: classLabel, Defense: defense, Health: health },
    runeSlots ? { "Rune Slots": String(runeSlots) } : {},
    bonuses
  )
});

/* The supplied matrix, in the order the source lists it. */
const PIECES = [
  piece("Warrior", "guerrier", "Chestplate", "Ika Breastplate", 3, DESC.ikaIt, "Ika Set", "+2", "+12", BONUS.ika),
  piece("Warrior", "guerrier", "Leggings", "Ika Leggings", 3, DESC.ikaThey, "Ika Set", "+1", "+7", BONUS.ika),
  piece("Warrior", "guerrier", "Boots", "Ika Boots", 3, DESC.ikaThey, "Ika Set", "+1", "+5", BONUS.ika),
  piece(
    "Warrior",
    "guerrier",
    "Helmet",
    "Protector's Helmet (Warrior)",
    7,
    DESC.tolbana,
    "Protector's Set",
    "+1",
    "+6",
    BONUS.protector
  ),
  piece(
    "Warrior",
    "guerrier",
    "Chestplate",
    "Protector's Breastplate (Warrior)",
    7,
    DESC.tolbana,
    "Protector's Set",
    "+2",
    "+16",
    BONUS.protector
  ),
  piece(
    "Warrior",
    "guerrier",
    "Leggings",
    "Protector's Leggings (Warrior)",
    7,
    DESC.tolbana,
    "Protector's Set",
    "+2",
    "+12",
    BONUS.protector
  ),
  piece(
    "Warrior",
    "guerrier",
    "Boots",
    "Protector's Boots (Warrior)",
    7,
    DESC.tolbana,
    "Protector's Set",
    "+1",
    "+6",
    BONUS.protector
  ),
  piece(
    "Warrior",
    "guerrier",
    "Helmet",
    "Guardian's Helmet (Warrior)",
    9,
    DESC.guardian,
    "Guardian Set",
    "+1",
    "+7",
    BONUS.guardian
  ),
  piece(
    "Warrior",
    "guerrier",
    "Chestplate",
    "Guardian's Chestplate (Warrior)",
    9,
    DESC.guardian,
    "Guardian Set",
    "+4",
    "+20",
    BONUS.guardian,
    1
  ),
  piece(
    "Warrior",
    "guerrier",
    "Leggings",
    "Guardian's Leggings (Warrior)",
    9,
    DESC.guardian,
    "Guardian Set",
    "+3",
    "+14",
    BONUS.guardian,
    1
  ),
  piece(
    "Warrior",
    "guerrier",
    "Boots",
    "Guardian's Boots (Warrior)",
    9,
    DESC.guardian,
    "Guardian Set",
    "+1",
    "+7",
    BONUS.guardian
  ),
  piece(
    "Assassin",
    "assassin",
    "Chestplate",
    "Tactical Chestplate",
    3,
    DESC.stealthApproach,
    "Stealth Set",
    "+2",
    "+9",
    BONUS.stealth
  ),
  piece(
    "Assassin",
    "assassin",
    "Leggings",
    "Tactical Leggings",
    3,
    DESC.stealthForApproaching,
    "Stealth Set",
    "+1",
    "+5",
    BONUS.stealth
  ),
  piece(
    "Assassin",
    "assassin",
    "Boots",
    "Tactical Boots",
    3,
    DESC.stealthForApproaching,
    "Stealth Set",
    "+1",
    "+4",
    BONUS.stealth
  ),
  piece(
    "Assassin",
    "assassin",
    "Chestplate",
    "Ninja Tunic (Assassin)",
    7,
    DESC.ninja,
    "Ninja Set",
    "+3",
    "+15",
    BONUS.ninja
  ),
  piece(
    "Assassin",
    "assassin",
    "Leggings",
    "Ninja Leggings (Assassin)",
    7,
    DESC.ninja,
    "Ninja Set",
    "+2",
    "+9",
    BONUS.ninja
  ),
  piece("Assassin", "assassin", "Boots", "Ninja Boots (Assassin)", 7, DESC.ninja, "Ninja Set", "+1", "+6", BONUS.ninja),
  piece(
    "Assassin",
    "assassin",
    "Helmet",
    "Herald's Helmet (Assassin)",
    9,
    DESC.heraldAssassin,
    "Stealth Herald Set",
    "+1",
    "+5",
    BONUS.herald
  ),
  piece(
    "Assassin",
    "assassin",
    "Chestplate",
    "Herald's Tunic (Assassin)",
    9,
    DESC.heraldAssassin,
    "Stealthy Herald Set",
    "+4",
    "+15",
    BONUS.herald,
    1
  ),
  piece(
    "Assassin",
    "assassin",
    "Leggings",
    "Herald's Leggings (Assassin)",
    9,
    DESC.heraldAssassin,
    "Stealthy Herald Set",
    "+3",
    "+11",
    BONUS.herald,
    1
  ),
  piece(
    "Assassin",
    "assassin",
    "Boots",
    "Herald's Boots (Assassin)",
    9,
    DESC.heraldAssassin,
    "Stealthy Herald Set",
    "+1",
    "+5",
    BONUS.herald
  ),
  piece(
    "Archer",
    "archer",
    "Chestplate",
    "Tactical Chestplate",
    3,
    DESC.tacticalQuick,
    "Tactical Set",
    "+2",
    "+9",
    BONUS.tactical
  ),
  piece(
    "Archer",
    "archer",
    "Leggings",
    "Tactical Leggings",
    3,
    DESC.tacticalFast,
    "Tactical Set",
    "+1",
    "+5",
    BONUS.tactical
  ),
  piece(
    "Archer",
    "archer",
    "Boots",
    "Tactical Boots",
    3,
    DESC.tacticalFast,
    "Tactical Set",
    "+1",
    "+4",
    BONUS.tactical
  ),
  piece(
    "Archer",
    "archer",
    "Chestplate",
    "Hunter's Tunic (Archer)",
    7,
    DESC.hunter,
    "Hunter's Set",
    "+3",
    "+15",
    BONUS.hunter
  ),
  piece(
    "Archer",
    "archer",
    "Leggings",
    "Hunter's Leggings (Archer)",
    7,
    DESC.hunter,
    "Hunter's Set",
    "+2",
    "+9",
    BONUS.hunter
  ),
  piece(
    "Archer",
    "archer",
    "Boots",
    "Hunter's Boots (Archer)",
    7,
    DESC.hunter,
    "Hunter's Set",
    "+1",
    "+6",
    BONUS.hunter
  ),
  piece(
    "Archer",
    "archer",
    "Helmet",
    "Herald's Helmet (Archer)",
    9,
    DESC.heraldArcher,
    "Hunter Herald Set",
    "+1",
    "+5",
    BONUS.hunterHerald
  ),
  piece(
    "Archer",
    "archer",
    "Chestplate",
    "Herald's Tunic (Archer)",
    9,
    DESC.heraldArcher,
    "Hunter Herald Set",
    "+4",
    "+15",
    BONUS.hunterHerald,
    1
  ),
  piece(
    "Archer",
    "archer",
    "Leggings",
    "Herald's Leggings (Archer)",
    9,
    DESC.heraldArcher,
    "Hunter Herald Set",
    "+3",
    "+11",
    BONUS.hunterHerald,
    1
  ),
  piece(
    "Archer",
    "archer",
    "Boots",
    "Herald's Boots (Archer)",
    9,
    DESC.heraldArcher,
    "Hunter Herald Set",
    "+1",
    "+5",
    BONUS.hunterHerald
  ),
  piece(
    "Mage",
    "mage",
    "Chestplate",
    "Spectral Breastplate",
    3,
    DESC.spectralVeil,
    "Spectral Set",
    "+1",
    "+9",
    BONUS.spectral
  ),
  piece(
    "Mage",
    "mage",
    "Leggings",
    "Spectral Leggings",
    3,
    DESC.spectralVeil,
    "Spectral Set",
    "+1",
    "+5",
    BONUS.spectral
  ),
  piece("Mage", "mage", "Boots", "Spectral Boots", 3, DESC.spectralVeil, "Spectral Set", "+1", "+4", BONUS.spectral),
  piece(
    "Mage",
    "mage",
    "Chestplate",
    "Sorcerer's Robe (Mage)",
    7,
    DESC.sorcererIt,
    "Sorcerer's Set",
    "+3",
    "+15",
    BONUS.sorcerer
  ),
  piece(
    "Mage",
    "mage",
    "Leggings",
    "Sorcerer's Leggings (Mage)",
    7,
    DESC.sorcererIt,
    "Sorcerer's Set",
    "+2",
    "+9",
    BONUS.sorcerer
  ),
  piece(
    "Mage",
    "mage",
    "Boots",
    "Sorcerer's Sandals (Mage)",
    7,
    DESC.sorcererThey,
    "Sorcerer's Set",
    "+1",
    "+6",
    BONUS.sorcerer
  ),
  piece(
    "Mage",
    "mage",
    "Helmet",
    "Reaper's Helmet (Mage)",
    9,
    DESC.reaperMage,
    "Mystic Reaper Set",
    "+1",
    "+5",
    BONUS.mysticReaper
  ),
  piece(
    "Mage",
    "mage",
    "Chestplate",
    "Reaper's Chestplate (Mage)",
    9,
    DESC.reaperMage,
    "Mystic Reaper Set",
    "+4",
    "+15",
    BONUS.mysticReaper,
    1
  ),
  piece(
    "Mage",
    "mage",
    "Leggings",
    "Reaper's Leggings (Mage)",
    9,
    DESC.reaperMage,
    "Mystic Reaper Set",
    "+3",
    "+11",
    BONUS.mysticReaper,
    1
  ),
  piece(
    "Mage",
    "mage",
    "Boots",
    "Reaper's Boots (Mage)",
    9,
    DESC.reaperMage,
    "Mystic Reaper Set",
    "+1",
    "+5",
    BONUS.mysticReaper
  ),
  piece(
    "Shaman",
    "shaman",
    "Chestplate",
    "Spectral Breastplate",
    3,
    DESC.animistIn,
    "Animist Set",
    "+2",
    "+9",
    BONUS.animist
  ),
  piece(
    "Shaman",
    "shaman",
    "Leggings",
    "Spectral Leggings",
    3,
    DESC.animistFrom,
    "Animist Set",
    "+2",
    "+5",
    BONUS.animist
  ),
  piece("Shaman", "shaman", "Boots", "Spectral Boots", 3, DESC.animistIn, "Animist Set", "+1", "+4", BONUS.animist),
  piece(
    "Shaman",
    "shaman",
    "Chestplate",
    "Magician's Robe (Shaman)",
    7,
    DESC.magician,
    "Magician's Set",
    "+3",
    "+15",
    BONUS.magician
  ),
  piece(
    "Shaman",
    "shaman",
    "Leggings",
    "Magician's Leggings (Shaman)",
    7,
    DESC.magician,
    "Magician's Set",
    "+2",
    "+9",
    BONUS.magician
  ),
  piece(
    "Shaman",
    "shaman",
    "Boots",
    "Magician's Sandals (Shaman)",
    7,
    DESC.magician,
    "Magician's Set",
    "+1",
    "+6",
    BONUS.magician
  ),
  piece(
    "Shaman",
    "shaman",
    "Helmet",
    "Reaper's Helmet (Shaman)",
    9,
    DESC.reaperFloods,
    "Attentive Reaper Set",
    "+1",
    "+5",
    BONUS.attentiveReaper
  ),
  piece(
    "Shaman",
    "shaman",
    "Chestplate",
    "Reaper's Chestplate (Shaman)",
    9,
    DESC.reaperFloods,
    "Attentive Reaper Set",
    "+4",
    "+15",
    BONUS.attentiveReaper,
    1
  ),
  piece(
    "Shaman",
    "shaman",
    "Leggings",
    "Reaper's Leggings (Shaman)",
    9,
    DESC.reaperGrants,
    "Attentive Reaper Set",
    "+3",
    "+11",
    BONUS.attentiveReaper,
    1
  ),
  piece(
    "Shaman",
    "shaman",
    "Boots",
    "Reaper's Boots (Shaman)",
    9,
    DESC.reaperFloods,
    "Attentive Reaper Set",
    "+1",
    "+5",
    BONUS.attentiveReaper
  )
];

const CLASS_LABELS = ["Warrior", "Assassin", "Archer", "Mage", "Shaman"];
const CLASS_ID_BY_LABEL = {
  Warrior: "guerrier",
  Assassin: "assassin",
  Archer: "archer",
  Mage: "mage",
  Shaman: "shaman"
};
const SLOTS = ["Helmet", "Chestplate", "Leggings", "Boots"];
const PIECES_PER_CLASS = { Warrior: 11, Assassin: 10, Archer: 10, Mage: 10, Shaman: 10 };
const RUNE_SLOT_ITEMS = [
  "Guardian's Chestplate (Warrior)",
  "Guardian's Leggings (Warrior)",
  "Herald's Tunic (Assassin)",
  "Herald's Leggings (Assassin)",
  "Herald's Tunic (Archer)",
  "Herald's Leggings (Archer)",
  "Reaper's Chestplate (Mage)",
  "Reaper's Leggings (Mage)",
  "Reaper's Chestplate (Shaman)",
  "Reaper's Leggings (Shaman)"
];
const NORMAL_SETS = [...new Set(PIECES.map((expected) => expected.set))];
const currentArmor = toHost(context.SAO_CURRENT_EQUIPMENT_DATA.floor1.armor);
const normalArmor = currentArmor.filter((entry) => NORMAL_SETS.includes(entry.set));
const findEntry = (expected) =>
  normalArmor.find((entry) => entry.name === expected.name && entry.stats.Class === expected.classLabel);
const slugify = (value) =>
  String(value || "unknown")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "unknown";

/* --- The 51 supplied pieces exist exactly once ------------------------------ */
assert.equal(PIECES.length, 51, "the supplied matrix describes 51 pieces");
assert.equal(normalArmor.length, 51, "the Current armor bucket ships exactly 51 normal armor pieces");
assert.equal(
  new Set(PIECES.map((expected) => `${expected.classLabel}|${expected.name}`)).size,
  51,
  "no two supplied pieces share a class and a name"
);
assert.equal(
  currentArmor.length,
  74,
  "the three beginner entries and the 20 PvP Set P1 pieces are still in the bucket"
);
["Beginner's Tunic", "Beginner Leggings", "Beginner's Boots"].forEach((name) =>
  assert.ok(
    currentArmor.some((entry) => entry.name === name),
    `${name} is preserved`
  )
);
assert.equal(
  currentArmor.filter((entry) => entry.set === "PvP Set P1").length,
  20,
  "the 20 Champion's PvP armor pieces are untouched"
);
assert.deepEqual(
  [...new Set(normalArmor.map((entry) => entry.level))].sort((left, right) => left - right),
  [3, 7, 9],
  "the supplied pieces carry the three supplied minimum levels"
);

CLASS_LABELS.forEach((classLabel) => {
  const owned = PIECES.filter((expected) => expected.classLabel === classLabel);
  assert.equal(
    owned.length,
    PIECES_PER_CLASS[classLabel],
    `${classLabel} is supplied ${PIECES_PER_CLASS[classLabel]} pieces`
  );
  assert.equal(
    normalArmor.filter((entry) => entry.stats.Class === classLabel).length,
    PIECES_PER_CLASS[classLabel],
    `${classLabel} ships exactly ${PIECES_PER_CLASS[classLabel]} normal armor pieces`
  );
});

/* Every set the source supplies owns one piece per slot and no slot twice. */
NORMAL_SETS.forEach((set) => {
  const slots = PIECES.filter((expected) => expected.set === set).map((expected) => expected.slot);
  assert.equal(new Set(slots).size, slots.length, `${set} holds one piece per slot`);
});

/* --- Every supplied field is preserved -------------------------------------- */
PIECES.forEach((expected) => {
  const entry = findEntry(expected);
  assert.ok(entry, `${expected.name} (${expected.classLabel}) exists`);
  assert.equal(entry.level, expected.level, `${expected.name} keeps its minimum level`);
  assert.equal(entry.set, expected.set, `${expected.name} belongs to ${expected.set}`);
  assert.equal(entry.description, expected.description, `${expected.name} keeps its supplied description`);
  assert.deepEqual(entry.stats, expected.stats, `${expected.name} keeps its supplied stats`);
  assert.deepEqual(
    Object.keys(entry.stats),
    Object.keys(expected.stats),
    `${expected.name} keeps the supplied stat order`
  );
  assert.equal(entry.rarity ?? null, null, `${expected.name} carries no invented rarity`);
  assert.equal(entry.craftingResources ?? null, null, `${expected.name} carries no invented crafting cost`);
  assert.equal(entry.craftingNote ?? null, null, `${expected.name} carries no invented crafting note`);
  assert.equal(entry.craftingLocation ?? null, null, `${expected.name} carries no invented crafting location`);
});

/* The rune-slot count the source gives: ten items carry one, the rest carry none (the Beta schema
   stores the key only for an item that has a slot, so an absent key means zero). */
assert.deepEqual(
  normalArmor
    .filter((entry) => "Rune Slots" in entry.stats)
    .map((entry) => entry.name)
    .sort(),
  [...RUNE_SLOT_ITEMS].sort(),
  "exactly the ten supplied items carry a rune slot"
);
assert.equal(
  normalArmor.filter((entry) => String(entry.stats["Rune Slots"] ?? "") === "0").length,
  0,
  "no item stores a zero rune-slot count"
);
PIECES.forEach((expected) => {
  const entry = findEntry(expected);
  assert.equal(
    Number(entry.stats["Rune Slots"] || 0),
    expected.runeSlots,
    `${expected.name} (${expected.classLabel}) keeps its ${expected.runeSlots} supplied rune slot(s)`
  );
});

/* The names are canonical: a Chestplate keeps its name, and nothing was renamed to fit a slot. */
assert.deepEqual(
  normalArmor
    .filter((entry) => /Chestplate/.test(entry.name))
    .map((entry) => entry.name)
    .sort(),
  [
    "Guardian's Chestplate (Warrior)",
    "Reaper's Chestplate (Mage)",
    "Reaper's Chestplate (Shaman)",
    "Tactical Chestplate",
    "Tactical Chestplate"
  ].sort(),
  "the source's Chestplate names are kept verbatim"
);
assert.equal(
  normalArmor.some((entry) => /^(?:Helmet|Chestplate|Leggings|Boots)$/.test(entry.name)),
  false,
  "no item was renamed to its slot name"
);
assert.equal(
  normalArmor.filter((entry) => entry.name === "Spectral Breastplate").length,
  2,
  "the two classes that share a name keep one record each"
);

/* --- The adapter derives the right slot, class, rune capacity and set ------- */
const currentItems = toHost(adapter.getItems("current"));
const itemFor = (expected) => {
  const item = currentItems.find(
    (candidate) =>
      candidate.name === expected.name && candidate.category === "armor" && candidate.classLabel === expected.classLabel
  );
  assert.ok(item, `${expected.name} (${expected.classLabel}) is normalized as armor`);
  return item;
};
const slotIdFor = (slot) => slot.toLowerCase();

PIECES.forEach((expected) => {
  const item = itemFor(expected);
  const slotId = slotIdFor(expected.slot);
  assert.equal(item.type, expected.slot, `${expected.name} (${expected.classLabel}) derives the ${expected.slot} slot`);
  assert.equal(
    item.slot,
    expected.slot,
    `${expected.name} (${expected.classLabel}) is stored in the ${expected.slot} slot`
  );
  assert.equal(item.levelRequirement, expected.level, `${expected.name} keeps its minimum level through the adapter`);
  assert.equal(item.set, expected.set, `${expected.name} keeps its supplied set label through the adapter`);
  assert.equal(item.setKey, adapter.getSetKey(expected.set), `${expected.name} carries the canonical set identifier`);
  assert.deepEqual(item.classes, [expected.classId], `${expected.name} is restricted to ${expected.classLabel}`);
  assert.equal(
    adapter.getRuneSlots(item),
    expected.runeSlots,
    `${expected.name} exposes ${expected.runeSlots} rune slot(s)`
  );
  assert.equal(item.twoHanded, false, `${expected.name} is not two-handed gear`);
  assert.equal(item.weaponCategory, null, `${expected.name} carries no weapon category`);

  /* The piece is offered in its own slot, for its own class only. */
  assert.ok(
    adapter.getItemsForSlot("current", slotId, expected.classId).some((candidate) => candidate.id === item.id),
    `${expected.name} is selectable in the ${slotId} slot for ${expected.classLabel}`
  );
  SLOTS.filter((slot) => slot !== expected.slot).forEach((otherSlot) => {
    assert.equal(
      adapter
        .getItemsForSlot("current", slotIdFor(otherSlot), expected.classId)
        .some((candidate) => candidate.id === item.id),
      false,
      `${expected.name} is not offered in the ${slotIdFor(otherSlot)} slot`
    );
  });
  CLASS_LABELS.filter((classLabel) => classLabel !== expected.classLabel).forEach((otherClass) => {
    assert.equal(
      adapter
        .getItemsForSlot("current", slotId, CLASS_ID_BY_LABEL[otherClass])
        .some((candidate) => candidate.id === item.id),
      false,
      `${expected.name} is not offered to the ${otherClass}`
    );
  });

  /* Every supplied tier keeps its threshold. */
  const thresholds = item.setBonuses.map((bonus) => bonus.threshold).sort((left, right) => left - right);
  assert.deepEqual(
    thresholds,
    Object.keys(expected.stats)
      .filter((key) => /Piece Set Bonus/.test(key))
      .map((key) => Number(key.split(" ")[0])),
    `${expected.name} keeps its supplied set-bonus thresholds`
  );
});

/* The Sorcerer's 3-piece tier lists two effects, so both are parsed out of the one supplied value. */
const sorcererRobe = itemFor(PIECES.find((expected) => expected.name === "Sorcerer's Robe (Mage)"));
assert.deepEqual(
  sorcererRobe.setBonuses.find((bonus) => bonus.threshold === 3).effects.map((effect) => [effect.stat, effect.value]),
  [
    ["Bonus Healing", "+1"],
    ["Ability Haste", "+2%"]
  ],
  "the Sorcerer's 3-piece tier keeps both supplied effects"
);
assert.equal(
  sorcererRobe.setBonuses.some((bonus) => bonus.threshold === 4),
  false,
  "the Sorcerer's set ships no 4-piece tier, so none is invented"
);

/* --- The supplied set bonuses reach the build totals ------------------------- */
const baseStats = calculator.createBaseStats("guerrier");
const ikaPieces = ["Ika Breastplate", "Ika Leggings", "Ika Boots"].map((name) =>
  currentItems.find((item) => item.name === name && item.category === "armor")
);
const ikaBuild = (count) => {
  const equipment = {};
  ["chestplate", "leggings", "boots"].forEach((slotId, index) => {
    if (index < count) equipment[slotId] = ikaPieces[index];
  });
  return calculator.calculateBuildStats({ equipment, level: 1, classId: "guerrier" });
};
/* 1 -> 2 -> 3 equipped set members activate 0 -> 1 -> 2 tiers: the Ika set ships a 2-piece Stamina
   tier and a 3-piece Health tier, and the pieces' own Health is counted alongside. */
assert.equal(ikaBuild(0).Stamina.flat, baseStats.Stamina.flat, "no Ika piece, no Ika bonus");
assert.equal(ikaBuild(1).Stamina.flat, baseStats.Stamina.flat, "one Ika piece stays below the 2-piece tier");
assert.equal(ikaBuild(2).Stamina.flat, baseStats.Stamina.flat + 0.5, "two Ika pieces activate the 2-piece tier");
assert.equal(ikaBuild(2).Health.flat, baseStats.Health.flat + 19, "the 3-piece tier is not active at two pieces");
assert.equal(
  ikaBuild(3).Health.flat,
  baseStats.Health.flat + 24 + 0.5,
  "three Ika pieces activate the 3-piece tier on top of the pieces' own Health"
);
/* A build saved before the canonical set label existed carries items without it. They keep grouping
   with the pieces equipped now, because a set without a variant keeps its own label as the key. */
const legacyIka = ikaPieces.slice(0, 2).map((item) => {
  const copy = { ...item };
  delete copy.setKey;
  return copy;
});
assert.equal(
  legacyIka.every((item) => item.setKey === undefined),
  true,
  "the saved copy carries no canonical label"
);
assert.equal(
  calculator.calculateBuildStats({
    equipment: { chestplate: legacyIka[0], leggings: legacyIka[1] },
    level: 1,
    classId: "guerrier"
  }).Stamina.flat,
  baseStats.Stamina.flat + 0.5,
  "a saved Ika piece without the canonical label still counts together with the other"
);

/* --- One set spelled two ways still counts as one set ----------------------- */
const heraldAssassin = PIECES.filter((expected) => expected.classId === "assassin" && /herald/i.test(expected.set));
assert.equal(heraldAssassin.length, 4, "the Assassin Herald set is supplied four pieces");
assert.deepEqual(
  [...new Set(heraldAssassin.map((expected) => expected.set))].sort(),
  ["Stealth Herald Set", "Stealthy Herald Set"],
  "both supplied spellings are kept on the entries themselves"
);
const rawLabels = heraldAssassin.reduce((counts, expected) => {
  counts.set(expected.set, (counts.get(expected.set) || 0) + 1);
  return counts;
}, new Map());
assert.equal(
  Math.max(...rawLabels.values()),
  3,
  "the supplied labels alone only ever group three pieces, which is why the canonical identifier exists"
);
const heraldItems = SLOTS.map((slot) => itemFor(heraldAssassin.find((expected) => expected.slot === slot)));
assert.equal(
  new Set(heraldItems.map((item) => item.setKey)).size,
  1,
  "the two spellings map onto one canonical set identifier"
);
assert.equal(
  adapter.getSetKey("Stealth Herald Set"),
  adapter.getSetKey("Stealthy Herald Set"),
  "both Assassin spellings share the canonical identifier"
);
assert.equal(
  adapter.getSetKey("Hunter Herald Set"),
  adapter.getSetKey("Hunter's Herald Set"),
  "both Archer spellings share the canonical identifier"
);
assert.equal(adapter.getSetKey("Ika Set"), "Ika Set", "a set without a variant keeps its own name as identifier");
assert.equal(adapter.getSetKey(null), null, "an item without a set has no identifier");
const heraldBuild = (count) => {
  const equipment = {};
  SLOTS.forEach((slot, index) => {
    if (index < count) equipment[slotIdFor(slot)] = heraldItems[index];
  });
  return calculator.calculateBuildStats({ equipment, level: 1, classId: "assassin" });
};
const baseMovementSpeed = calculator.createBaseStats("assassin")["Movement Speed"].percent;
[1, 2, 3].forEach((count) =>
  assert.equal(
    heraldBuild(count)["Movement Speed"].percent,
    baseMovementSpeed,
    `${count} Herald pieces stay below the supplied 4-piece tier`
  )
);
assert.equal(
  heraldBuild(4)["Movement Speed"].percent,
  baseMovementSpeed + 5,
  "the four Herald pieces activate the supplied 4-piece Movement Speed tier"
);

/* --- The same-name pieces of two classes stay separate records --------------- */
[
  "Tactical Chestplate",
  "Tactical Leggings",
  "Tactical Boots",
  "Spectral Breastplate",
  "Spectral Leggings",
  "Spectral Boots"
].forEach((name) => {
  const records = normalArmor.filter((entry) => entry.name === name);
  assert.equal(records.length, 2, `${name} is stored once per class`);
  assert.deepEqual(
    records.map((entry) => entry.stats.Class).sort(),
    name.startsWith("Tactical") ? ["Archer", "Assassin"] : ["Mage", "Shaman"],
    `${name} keeps both of its classes`
  );
  const items = currentItems.filter((item) => item.name === name && item.category === "armor");
  assert.equal(new Set(items.map((item) => item.id)).size, 2, `${name} keeps two distinct record ids`);
});

/* --- Current and Beta stay separate ----------------------------------------- */
const betaItems = toHost(adapter.getItems("beta"));
assert.equal(betaItems.length, 542, "the Beta equipment count is unchanged");
assert.equal(betaItems.filter((item) => item.category === "armor").length, 123, "the Beta armor count is unchanged");
assert.equal(betaItems.filter((item) => item.twoHanded).length, 20, "the Beta two-handed count is unchanged");
assert.equal(betaItems.filter((item) => item.type === "Offhand").length, 13, "the Beta off-hand count is unchanged");
/* Three of the supplied set labels are labels Beta already uses for its own sets; they are shared
   names, not leaked records, which is why the check below is on the items themselves. */
const betaSets = new Set(betaItems.map((item) => item.set).filter(Boolean));
assert.deepEqual(
  NORMAL_SETS.filter((set) => betaSets.has(set)).sort(),
  ["Hunter's Set", "Magician's Set", "Sorcerer's Set"],
  "the three set labels Beta shares are only labels, and Beta still ships them"
);
assert.equal(
  betaItems.some((item) => item.category === "armor" && item.set && NORMAL_SETS.includes(item.set)),
  true,
  "the shared labels belong to Beta's own armor sets, so the Beta records are the ones under test"
);
/* Beta already ships six of the supplied names as its own armor items; each keeps its own record. */
["Ika Leggings", "Ika Boots", "Tactical Leggings", "Tactical Boots", "Spectral Leggings", "Spectral Boots"].forEach(
  (name) => {
    const betaRecord = betaItems.find((item) => item.name === name);
    const currentRecord = currentItems.find((item) => item.name === name && item.category === "armor");
    assert.ok(betaRecord && currentRecord, `${name} exists in both datasets`);
    assert.notEqual(betaRecord.id, currentRecord.id, `${name} keeps one record per dataset`);
    assert.notDeepEqual(betaRecord.stats, currentRecord.stats, `${name}'s Beta stats are not the Current ones`);
  }
);
assert.equal(
  betaItems.some((item) => item.category === "armor" && item.name.includes("(Warrior)")),
  false,
  "no Current-Data class-qualified name leaks into the Beta armor bucket"
);
assert.equal(currentItems.length, 225, "Current Data ships the 174 earlier equipment items plus the 51 armor pieces");
assert.equal(
  toHost(context.SAO_CURRENT_EQUIPMENT_DATA.floor1.weapon).length,
  95,
  "the Current weapon bucket is untouched"
);
assert.equal(
  toHost(context.SAO_CURRENT_EQUIPMENT_DATA.floor1.accessory).length,
  52,
  "the Current accessory bucket is untouched"
);

/* --- Every supplied item is translated into Spanish and French --------------- */
PIECES.forEach((expected) => {
  const entry = findEntry(expected);
  registry.registerEquipmentEntry(entry, slugify, { fields: ["name", "description"] });
  const id = slugify(expected.name);
  ["es", "fr"].forEach((language) => {
    const localizedName = registry[language][`equipment.${id}.name`];
    const localizedDescription = registry[language][`equipment.${id}.description`];
    assert.ok(localizedName, `${expected.name} has a ${language} name`);
    assert.notEqual(localizedName, expected.name, `${expected.name} is translated into ${language}`);
    assert.ok(localizedDescription, `${expected.name} has a ${language} description`);
    assert.notEqual(
      localizedDescription,
      expected.description,
      `${expected.name}'s description is translated into ${language}`
    );
  });
});
assert.equal(
  PIECES.every((expected) => registry.es[`equipment.${slugify(expected.name)}.name`]),
  true,
  "every supplied name has an explicit Spanish counterpart"
);

console.log(
  JSON.stringify(
    {
      pieces: PIECES.length,
      perClass: Object.fromEntries(
        CLASS_LABELS.map((classLabel) => [
          classLabel,
          PIECES.filter((expected) => expected.classLabel === classLabel).length
        ])
      ),
      perSlot: Object.fromEntries(
        SLOTS.map((slot) => [slot, PIECES.filter((expected) => expected.slot === slot).length])
      ),
      sets: NORMAL_SETS,
      runeSlotItems: RUNE_SLOT_ITEMS.length,
      currentArmor: currentArmor.length,
      currentItems: currentItems.length,
      betaItems: betaItems.length,
      status: "passed"
    },
    null,
    2
  )
);
console.log("Current-Data normal armor regression checks passed.");
