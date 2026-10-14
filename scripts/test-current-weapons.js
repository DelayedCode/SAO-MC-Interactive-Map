/* Current-Data weapon regression checks.

   The 49 supplied weapons are the source of truth for Compendium > Weapons and for the Character
   Build's Current Data Main Hand selector. Aincrad/eCompendium/ecompendium_current.js is their only
   home: the Compendium reads it when the dataset is "current" and the Character Build adapter
   normalizes the same object, so no page keeps its own copy.

   These checks pin every supplied field (name, class, minimum level, weapon category, two-handed
   flag, attack damage, attack speed, secondary stats and description), the class filtering the
   Main Hand selector uses, and the two-handed rules the builder enforces. They also pin the Beta
   weapon counts so the Current additions can never leak into Beta Data. */
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

const currentFloorData = toHost(context.SAO_CURRENT_EQUIPMENT_DATA.floor1);
const currentWeapons = currentFloorData.weapon;
const byName = new Map(currentWeapons.map((item) => [item.name, item]));

/* The 49 supplied weapon/class entries, exactly as given. The Mage and Shaman staves are distinct
   class-specific entries and both are listed. `extras` holds the secondary stats the entry carries
   on top of attack damage and attack speed. */
const SUPPLIED_WEAPONS = [
  { name: "Basic Sword", class: "Warrior", level: 3, twoHanded: false, category: "Sword [P1]", damage: "3.5", speed: "1.1/s", extras: {}, description: "Basic, simple, but still effective for a beginner" },
  { name: "Basic Dual Axe", class: "Warrior", level: 3, twoHanded: true, category: "Dual Axe [P1]", damage: "5.5", speed: "0.9/s", extras: { "Skill Critical Chance": "+0.5%", "Stamina Regeneration": "+0.05/s" }, description: "Basic, heavy, but still effective for a beginner" },
  { name: "Copper Greatsword", class: "Warrior", level: 5, twoHanded: true, category: "Greatsword [P1]", damage: "6", speed: "1.2/s", extras: { "Critical Chance": "+1%", "Life Steal": "+5%" }, description: "Forged from copper, this greatsword is made to vanquish its enemies." },
  { name: "Copper Double Axe", class: "Warrior", level: 5, twoHanded: true, category: "Double Axe [P1]", damage: "8", speed: "0.9/s", extras: { "Skill Critical Chance": "+0.8%", "Stamina Regeneration": "+0.1/s" }, description: "Forged from copper, this double axe is made to tear its enemies apart." },
  { name: "Simple Longsword Weapon", class: "Warrior", level: 5, twoHanded: true, category: "Longsword [P1]", damage: "8", speed: "0.9/s", extras: { "Critical Damage": "+2%", "Life Steal": "+1%" }, description: "Quite simple, it fits in your hand and can brutally slice in two" },
  { name: "Simple Sword", class: "Warrior", level: 5, twoHanded: false, category: "Sword [P1]", damage: "5", speed: "1.1/s", extras: {}, description: "Quite simple, it fits in the hand and can slash" },
  { name: "Protector's Hammer", class: "Warrior", level: 7, twoHanded: true, category: "Warhammer [P1]", damage: "11.5", speed: "0.9/s", extras: { "Skill Critical Damage": "+1%", Defense: "+2" }, description: "Forged in magic, this hammer is imbued with the essence of powerful Tier 1 monsters." },
  { name: "Hunter's Longsword", class: "Warrior", level: 7, twoHanded: true, category: "Longsword [P1]", damage: "11.5", speed: "0.9/s", extras: { "Critical Damage": "+2.5%", "Life Steal": "+1%" }, description: "Forged for hunters of powerful Tier 1 monsters. It deals high damage" },
  { name: "Protector's Sword", class: "Warrior", level: 7, twoHanded: false, category: "Sword [P1]", damage: "7", speed: "1.1/s", extras: {}, description: "Forged in magic, this sword is imbued with the essence of powerful Tier 1 monsters." },
  { name: "Hunter's Greatsword", class: "Warrior", level: 7, twoHanded: true, category: "Greatsword [P1]", damage: "8.5", speed: "1.2/s", extras: { "Critical Chance": "+1.25%", "Life Steal": "+5%" }, description: "Forged for hunters of powerful Tier 1 monsters. It offers good accuracy" },
  { name: "Double Iron Axe", class: "Warrior", level: 9, twoHanded: true, category: "Double Axe [P1]", damage: "14", speed: "0.9/s", extras: { "Skill Critical Chance": "+1%", "Stamina Regeneration": "+0.15/s" }, description: "Forged for hunters of powerful Tier 1 monsters. It offers good accuracy" },
  { name: "Iron Greatsword", class: "Warrior", level: 9, twoHanded: true, category: "Greatsword [P1]", damage: "10.5", speed: "1.2/s", extras: { "Critical Chance": "+1.5%", "Life Steal": "+5%" }, description: "Forged for hunters of powerful Tier 1 monsters. It offers good accuracy." },
  { name: "Guardian's Greatsword", class: "Warrior", level: 9, twoHanded: true, category: "Greatsword [P1]", damage: "12", speed: "1.2/s", extras: { "Critical Chance": "+1.75%", "Life Steal": "+5%" }, description: "Forged for hunters of powerful Tier 1 monsters. It offers good accuracy." },
  { name: "Guardian's Sword", class: "Warrior", level: 9, twoHanded: false, category: "Sword [P1]", damage: "10", speed: "1.1/s", extras: {}, description: "Forged for hunters of powerful Tier 1 monsters. It offers good accuracy" },
  { name: "Guardian's Longsword", class: "Warrior", level: 9, twoHanded: true, category: "Longsword [P1]", damage: "16", speed: "0.9/s", extras: { "Critical Damage": "+3.5%", "Life Steal": "+1%" }, description: "Forged for hunters of powerful Tier 1 monsters. It offers good accuracy." },
  { name: "Basic Scythe", class: "Assassin", level: 3, twoHanded: true, category: "Scythe [P1]", damage: "6.5", speed: "0.9/s", extras: { "Skill Critical Chance": "+0.8%", "Stamina Regeneration": "+0.1/s" }, description: "Basic, simple, but still effective for a beginner" },
  { name: "Basic Dagger", class: "Assassin", level: 3, twoHanded: false, category: "Dagger [P1]", damage: "4.5", speed: "1.4/s", extras: {}, description: "Basic, simple, but still effective for a beginner" },
  { name: "Basic Katana", class: "Assassin", level: 3, twoHanded: true, category: "Katana [P1]", damage: "5", speed: "1.2/s", extras: { "Life Steal": "+5%", Dodge: "+5%", "Movement Speed": "+15%" }, description: "Basic, simple, but still effective for a beginner" },
  { name: "Copper Dagger", class: "Assassin", level: 5, twoHanded: false, category: "Dagger [P1]", damage: "6", speed: "1.4/s", extras: {}, description: "Made from copper, the blade is stronger and sharper than others" },
  { name: "Copper Scythe Weapon", class: "Assassin", level: 5, twoHanded: true, category: "Scythe [P1]", damage: "9.5", speed: "0.9/s", extras: { "Skill Critical Chance": "+1%", "Stamina Regeneration": "+0.15/s" }, description: "Made from copper, the blade is stronger and sharper than others" },
  { name: "Copper Katana", class: "Assassin", level: 5, twoHanded: true, category: "Katana [P1]", damage: "7", speed: "1.2/s", extras: { "Life Steal": "+5%", Dodge: "+5%", "Movement Speed": "+15%" }, description: "Forged from copper, its blade is stronger and sharper than others" },
  { name: "Hunter's Scythe", class: "Assassin", level: 7, twoHanded: true, category: "Scythe [P1]", damage: "13.5", speed: "0.9/s", extras: { "Skill Critical Chance": "+1.2%", "Stamina Regeneration": "+0.2/s" }, description: "Forged to become a hunter of lesser creatures" },
  { name: "Hunter's Dagger", class: "Assassin", level: 7, twoHanded: false, category: "Dagger [P1]", damage: "8.5", speed: "1.4/s", extras: {}, description: "Forged to become a hunter of lesser creatures" },
  { name: "Hunter's Katana", class: "Assassin", level: 7, twoHanded: true, category: "Katana [P1]", damage: "10", speed: "1.2/s", extras: { "Life Steal": "+5%", Dodge: "+5%", "Movement Speed": "+15%" }, description: "Forged to become a hunter of lesser creatures" },
  { name: "Iron Katana Weapon", class: "Assassin", level: 9, twoHanded: true, category: "Katana [P1]", damage: "12.5", speed: "1.2/s", extras: { "Life Steal": "+5%", Dodge: "+5%", "Movement Speed": "+15%" }, description: "Forged from iron, its blade is far sharper and more durable than others" },
  { name: "Iron Scythe", class: "Assassin", level: 9, twoHanded: true, category: "Scythe [P1]", damage: "16.5", speed: "0.9/s", extras: { "Skill Critical Chance": "+1.5%", "Stamina Regeneration": "+0.25/s" }, description: "Forged from iron, its blade is far sharper and more durable than others" },
  { name: "Iron Dagger", class: "Assassin", level: 9, twoHanded: false, category: "Dagger [P1]", damage: "10.5", speed: "1.4/s", extras: {}, description: "Forged from iron, its blade is far sharper and more durable than others" },
  { name: "Herald's Katana", class: "Assassin", level: 9, twoHanded: true, category: "Katana [P1]", damage: "14", speed: "1.2/s", extras: { "Life Steal": "+5%", Dodge: "+5%", "Movement Speed": "+15%" }, description: "This katana was forged for heralds, elite assassins capable of facing the Forgotten" },
  { name: "Herald's Dagger", class: "Assassin", level: 9, twoHanded: false, category: "Dagger [P1]", damage: "12", speed: "1.4/s", extras: {}, description: "This dagger was forged for heralds, elite assassins capable of facing the Forgotten" },
  { name: "Herald's Scythe", class: "Assassin", level: 9, twoHanded: true, category: "Scythe [P1]", damage: "19", speed: "0.9/s", extras: { "Skill Critical Chance": "+1.8%", "Stamina Regeneration": "+0.3/s" }, description: "This scythe was forged for heralds, elite assassins capable of facing the Forgotten" },
  { name: "Basic Bow", class: "Archer", level: 3, twoHanded: false, category: "Bow [P1]", damage: "4.5", speed: "1.2/s", extras: {}, description: "A rudimentary bow used by early archers" },
  { name: "Basic Crossbow", class: "Archer", level: 3, twoHanded: false, category: "Crossbow [P1]", damage: "2.5", speed: "1/s", extras: { "Skill Critical Chance": "+0.8%" }, description: "A simple crossbow, hastily assembled but reliable." },
  { name: "Copper Bow", class: "Archer", level: 5, twoHanded: false, category: "Bow [P1]", damage: "6", speed: "1.2/s", extras: {}, description: "A light, maneuverable, and reliable copper bow." },
  { name: "Copper Crossbow", class: "Archer", level: 5, twoHanded: false, category: "Crossbow [P1]", damage: "3.5", speed: "1/s", extras: { "Skill Critical Chance": "+1%" }, description: "A light copper crossbow, maneuverable and accurate." },
  { name: "Hunter's Crossbow", class: "Archer", level: 7, twoHanded: false, category: "Crossbow [P1]", damage: "5", speed: "1/s", extras: { "Skill Critical Chance": "+1.2%" }, description: "Crossbow for hunting powerful Tier 1 monsters." },
  { name: "Hunting Bow", class: "Archer", level: 7, twoHanded: false, category: "Bow [P1]", damage: "8.5", speed: "1.2/s", extras: {}, description: "Bow for hunting powerful Tier 1 monsters." },
  { name: "Herald's Bow", class: "Archer", level: 9, twoHanded: false, category: "Bow [P1]", damage: "12", speed: "1.2/s", extras: {}, description: "A powerful bow that belonged to one of the Fallen of the Labyrinth." },
  { name: "Iron Bow", class: "Archer", level: 9, twoHanded: false, category: "Bow [P1]", damage: "10.5", speed: "1.2/s", extras: {}, description: "A sturdy bow forged from iron, reliable and accurate." },
  { name: "Iron Crossbow", class: "Archer", level: 9, twoHanded: false, category: "Crossbow [P1]", damage: "6", speed: "1/s", extras: { "Skill Critical Chance": "+1.5%" }, description: "A sturdy crossbow forged from iron, solid and accurate." },
  { name: "Forest Magic Staff (Mage)", class: "Mage", level: 3, twoHanded: false, category: "Staff [P1]", damage: "5", speed: "1/s", extras: {}, description: "From heartwood and enchanted twigs, a staff was born." },
  { name: "Copper Magic Staff (Mage)", class: "Mage", level: 5, twoHanded: false, category: "Staff [P1]", damage: "7", speed: "1/s", extras: {}, description: "A light copper staff, imbued with nascent magic." },
  { name: "Magician's Staff (Mage)", class: "Mage", level: 7, twoHanded: false, category: "Staff [P1]", damage: "10", speed: "1/s", extras: {}, description: "Forged in the heart of a silent storm. This staff vibrates with a powerful, celestial energy." },
  { name: "Dark Magic Staff (Mage)", class: "Mage", level: 9, twoHanded: false, category: "Staff [P1]", damage: "14.5", speed: "1/s", extras: {}, description: "Staff made from enchantments and metals. Perfect for dealing incredible damage." },
  { name: "Iron Magic Staff (Mage)", class: "Mage", level: 9, twoHanded: false, category: "Staff [P1]", damage: "13", speed: "1/s", extras: {}, description: "A solid staff forged from iron, channeling reliable magic." },
  { name: "Magic Forest Staff (Shaman)", class: "Shaman", level: 3, twoHanded: false, category: "Staff [P1]", damage: "5", speed: "1/s", extras: {}, description: "From the Heart of Wood and Enchanted Twigs, a staff is born" },
  { name: "Copper Magic Staff (Shaman)", class: "Shaman", level: 5, twoHanded: false, category: "Staff [P1]", damage: "7", speed: "1/s", extras: {}, description: "A light copper staff, imbued with nascent magic." },
  { name: "Magician's Staff (Shaman)", class: "Shaman", level: 7, twoHanded: false, category: "Staff [P1]", damage: "10", speed: "1/s", extras: {}, description: "Forged in the heart of a silent storm. This staff vibrates with a powerful, celestial energy." },
  { name: "Dark Magic Staff (Shaman)", class: "Shaman", level: 9, twoHanded: false, category: "Staff [P1]", damage: "14.5", speed: "1/s", extras: {}, description: "Staff made from enchantments and metals. Perfect for dealing incredible damage." },
  { name: "Iron Magic Staff (Shaman)", class: "Shaman", level: 9, twoHanded: false, category: "Staff [P1]", damage: "13", speed: "1/s", extras: {}, description: "A solid staff forged from iron, channeling reliable magic." },
];

/* --- Every supplied entry exists exactly once ------------------------------- */
assert.equal(SUPPLIED_WEAPONS.length, 49, "all 49 supplied weapon/class entries are pinned");
const suppliedNames = SUPPLIED_WEAPONS.map((entry) => entry.name);
assert.equal(new Set(suppliedNames).size, suppliedNames.length, "the supplied weapon names are unique");
suppliedNames.forEach((name) => {
  assert.equal(
    currentWeapons.filter((item) => item.name === name).length,
    1,
    `${name} exists exactly once in the Current weapon list`
  );
});
/* The Mage and Shaman staves are distinct class-specific entries, not one shared item. */
["Forest Magic Staff (Mage)", "Magic Forest Staff (Shaman)"].forEach((name) =>
  assert.ok(byName.has(name), `${name} is shipped`)
);
assert.notEqual(
  byName.get("Copper Magic Staff (Mage)").stats.Class,
  byName.get("Copper Magic Staff (Shaman)").stats.Class,
  "the Mage and Shaman staff entries keep their own class"
);

/* --- Every supplied field is preserved -------------------------------------- */
const TWO_HANDED_NAMES = SUPPLIED_WEAPONS.filter((entry) => entry.twoHanded).map((entry) => entry.name);
assert.equal(TWO_HANDED_NAMES.length, 21, "exactly 21 supplied weapons are two-handed");

SUPPLIED_WEAPONS.forEach((expected) => {
  const item = byName.get(expected.name);
  assert.ok(item, `${expected.name} is present in the Current dataset`);
  assert.equal(item.stats.Class, expected.class, `${expected.name}: class restriction`);
  assert.equal(item.level, expected.level, `${expected.name}: minimum level`);
  assert.equal(item.stats["Weapon Category"], expected.category, `${expected.name}: weapon category`);
  assert.equal(item.stats["Attack Damage"], expected.damage, `${expected.name}: attack damage`);
  assert.equal(item.stats["Attack Speed"], expected.speed, `${expected.name}: attack speed`);
  assert.equal(item.description, expected.description, `${expected.name}: description`);
  assert.equal(
    String(item.stats["Two-Handed"] || "").toLowerCase() === "yes",
    expected.twoHanded,
    `${expected.name}: two-handed flag`
  );
  /* Only the supplied secondary stats are present: attack damage, attack speed, class, the weapon
     category and the two-handed flag, and nothing invented (no rarity, no crafting cost). */
  const statKeys = Object.keys(item.stats).filter(
    (key) => !["Class", "Weapon Category", "Two-Handed", "Attack Damage", "Attack Speed"].includes(key)
  );
  assert.deepEqual(statKeys, Object.keys(expected.extras), `${expected.name}: secondary stats`);
  Object.entries(expected.extras).forEach(([key, value]) =>
    assert.equal(item.stats[key], value, `${expected.name}: ${key}`)
  );
  assert.equal(item.rarity, undefined, `${expected.name}: no rarity is invented from the [P1] category`);
  assert.equal(item.craftingResources, undefined, `${expected.name}: no crafting cost is invented`);
});

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

SUPPLIED_WEAPONS.forEach((expected) => {
  const item = currentItemByName.get(expected.name);
  assert.ok(item, `${expected.name} is normalized for the builder`);
  assert.equal(item.type, "Main Weapon", `${expected.name} occupies the Main Hand slot`);
  assert.equal(item.category, "weapon", `${expected.name} stays in the weapon category`);
  assert.equal(item.levelRequirement, expected.level, `${expected.name} keeps its minimum level`);
  assert.equal(item.weaponCategory, expected.category, `${expected.name} exposes its weapon category`);
  assert.equal(item.twoHanded, expected.twoHanded, `${expected.name} exposes its two-handed flag`);
  assert.equal(adapter.isTwoHanded(item), expected.twoHanded, `${expected.name}: adapter two-handed check`);
  /* Every stat the card shows must reach the builder UI through item.effects. */
  Object.keys(item.stats)
    .filter((key) => key.toLowerCase() !== "class")
    .forEach((key) =>
      assert.ok(
        item.effects.some((effect) => effect.startsWith(`${key}:`)),
        `${expected.name} exposes ${key} to the builder UI`
      )
    );

  const ownClassId = CLASS_ID_BY_LABEL[expected.class];
  CLASS_IDS.forEach((classId) => {
    const selectable = adapter
      .getItemsForSlot("current", "main-weapon", classId)
      .some((candidate) => candidate.name === expected.name);
    assert.equal(
      selectable,
      classId === ownClassId,
      `${expected.name} is ${classId === ownClassId ? "" : "not "}selectable for ${classId}`
    );
  });
});

/* Two-handed status is never inferred from the name: swords, daggers and every staff stay
   one-handed even though the dataset also ships Greatswords, Katans and Staves. */
["Guardian's Sword", "Simple Sword", "Basic Dagger", "Copper Dagger", "Hunter's Dagger", "Iron Dagger", "Herald's Dagger"].forEach(
  (name) => assert.equal(adapter.isTwoHanded(currentItemByName.get(name)), false, `${name} is one-handed`)
);
SUPPLIED_WEAPONS.filter((entry) => entry.category === "Staff [P1]").forEach((entry) =>
  assert.equal(adapter.isTwoHanded(currentItemByName.get(entry.name)), false, `${entry.name} is a one-handed staff`)
);
TWO_HANDED_NAMES.forEach((name) =>
  assert.equal(currentItemByName.get(name).type, "Main Weapon", `${name} is a Main Hand weapon`)
);
/* Off-hand equipment keeps its own type, so the two-handed rule never touches shields/bucklers. */
assert.equal(
  adapter.getItemsForSlot("current", "offhand").every((item) => item.type === "Offhand"),
  true,
  "the Offhand slot only ever lists Offhand items"
);
assert.equal(
  adapter.getItemsForSlot("current", "offhand").some((item) => adapter.isTwoHanded(item)),
  false,
  "no two-handed weapon is ever offered in the Offhand slot"
);

/* --- Current and Beta stay separate ----------------------------------------- */
const betaWeapons = ["FLOOR_1_DATA", "FLOOR_2_DATA", "FLOOR_3_DATA"].flatMap((key) => context[key].weapon || []);
assert.equal(betaWeapons.length, 141, "the Beta weapon count is unchanged");
assert.equal(
  betaWeapons.filter((item) => String((item.stats || {})["Two-Handed"] || "").toLowerCase() === "yes").length,
  20,
  "the Beta two-handed count is unchanged"
);
assert.equal(
  betaWeapons.some((item) => item.stats && item.stats["Weapon Category"]),
  false,
  "no weapon category leaks into Beta Data"
);
assert.equal(
  context.SAO_CURRENT_EQUIPMENT_DATA.floor1.weapon.length,
  95,
  "Current Data ships the 14 beginner weapons, the 49 supplied weapons and the 32 supplied off-hand entries"
);

console.log(
  JSON.stringify(
    {
      suppliedWeapons: SUPPLIED_WEAPONS.length,
      twoHanded: TWO_HANDED_NAMES.length,
      classes: Object.keys(CLASS_ID_BY_LABEL),
      categories: [...new Set(SUPPLIED_WEAPONS.map((entry) => entry.category))],
      levels: [...new Set(SUPPLIED_WEAPONS.map((entry) => entry.level))].sort((a, b) => a - b),
      betaWeapons: betaWeapons.length,
      status: "passed"
    },
    null,
    2
  )
);
console.log("Current-Data weapon regression checks passed.");
