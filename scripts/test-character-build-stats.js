const assert = require("assert");
const { loadScript } = require("./harness-helpers");

const context = { console, window: {}, globalThis: {} };
context.window = context;
context.globalThis = context;

[1, 2, 3].forEach((floor) => loadScript(`Aincrad/eCompendium/ecompendium_floor${floor}.js`, context));
loadScript("Aincrad/Character Build/character-build-icons.js", context);
loadScript("Aincrad/Character Build/character-build-data.js", context);
loadScript("Aincrad/Character Build/character-build-calculator.js", context);
loadScript("Aincrad/Character Build/character-build-adapter.js", context);

const adapter = context.CharacterBuildAdapter;
const calculator = context.CharacterBuildCalculator;
const classes = ["mage", "archer", "assassin", "shaman", "martial-artist", "guerrier"];
const equipmentCategories = new Set(["armor", "weapon", "accessory", "tool"]);
const slotIds = {
  Helmet: "helmet",
  Chestplate: "chestplate",
  Leggings: "leggings",
  Boots: "boots",
  "Main Weapon": "main-weapon",
  Offhand: "offhand",
  Amulet: "amulet",
  Ring: "ring-1",
  Bracelet: "bracelet",
  Glove: "glove",
  Artifact: "artifact-1"
};

function collectSourceEquipment() {
  const records = [];
  for (const floor of [1, 2, 3]) {
    const data = context[`FLOOR_${floor}_DATA`];
    for (const [category, entries] of Object.entries(data)) {
      if (!equipmentCategories.has(category)) continue;
      entries.forEach((entry, index) =>
        records.push({
          floor: `floor${floor}`,
          category,
          index,
          name: entry.name,
          stats: entry.stats || {}
        })
      );
    }
  }
  return records;
}

const sourceRecords = collectSourceEquipment();
const normalizedRecords = adapter.getItems("beta");
const audit = adapter.getAuditReport();
const runes = adapter.getRunes("beta");
const armorRecords = normalizedRecords.filter((item) => item.category === "armor");
const runeCapacity = (item) => adapter.getRuneSlots(item);

assert.strictEqual(sourceRecords.length, 542);
assert.strictEqual(normalizedRecords.length, 542);
assert.deepStrictEqual(Array.from(new Set(normalizedRecords.map((item) => item.category))).sort(), [
  "accessory",
  "armor",
  "tool",
  "weapon"
]);
assert.strictEqual(audit.totalBetaEquipmentRecords, 542);
assert.strictEqual(audit.totalSuccessfullyClassified, 542);
assert.strictEqual(audit.totalUnclassified, 0);
assert(audit.statisticsByClassification.unsupported.includes("Effect: Harvest Power"));
assert(audit.statisticsByClassification.unsupported.includes("Effect: Sustainability"));
assert.deepStrictEqual(Array.from(audit.statisticsByClassification.unverified), []);
assert.strictEqual(audit.missingStatsByCategory.armor.length, 0);
assert.strictEqual(audit.missingStatsByCategory.accessory.length, 0);
assert.strictEqual(audit.missingStatsByCategory.weapon.length, 0);
assert.strictEqual(audit.missingStatsByCategory.tool.length, 0);
assert.deepStrictEqual(
  Array.from(audit.missingStatsByCategory.tool, (item) => item.itemName),
  []
);
assert.strictEqual(runes.length, 32);
assert.strictEqual(adapter.getMaxRuneSlots("beta"), 2);
assert.strictEqual(armorRecords.filter((item) => runeCapacity(item) === 0).length, 95);
assert.strictEqual(armorRecords.filter((item) => runeCapacity(item) === 1).length, 20);
assert.strictEqual(armorRecords.filter((item) => runeCapacity(item) === 2).length, 8);

const zeroRuneArmor = armorRecords.find((item) => runeCapacity(item) === 0);
const oneRuneArmor = armorRecords.find((item) => runeCapacity(item) === 1);
const maxRuneArmor = armorRecords.find((item) => runeCapacity(item) === adapter.getMaxRuneSlots("beta"));
assert(zeroRuneArmor && oneRuneArmor && maxRuneArmor);
const firstRune = runes[0];
const secondRune = runes[1];
function equipmentWithRunes(armor, selectedRunes) {
  const equipment = { armor };
  selectedRunes.slice(0, runeCapacity(armor)).forEach((rune, index) => {
    equipment[`rune-${index}`] = rune;
  });
  return equipment;
}
function calculateEquipment(equipment) {
  return calculator.calculateBuildStats({ equipment, source: "beta", isAvailable: () => true });
}
const zeroRuneResult = calculateEquipment(equipmentWithRunes(zeroRuneArmor, [firstRune]));
const oneRuneResult = calculateEquipment(equipmentWithRunes(oneRuneArmor, [firstRune, secondRune]));
const maxRuneResult = calculateEquipment(equipmentWithRunes(maxRuneArmor, [firstRune, secondRune]));
assert.strictEqual(oneRuneResult.Stamina.flat - calculateEquipment({ armor: oneRuneArmor }).Stamina.flat, 2.5);
assert.strictEqual(maxRuneResult.Stamina.flat - calculateEquipment({ armor: maxRuneArmor }).Stamina.flat, 2.5);
assert.strictEqual(zeroRuneResult.Stamina.flat, calculateEquipment({ armor: zeroRuneArmor }).Stamina.flat);
assert.strictEqual(maxRuneResult.Damage.flat - calculateEquipment({ armor: maxRuneArmor }).Damage.flat, 5);
assert.deepStrictEqual(maxRuneResult, calculateEquipment(equipmentWithRunes(maxRuneArmor, [firstRune, secondRune])));
const helmetRunes = equipmentWithRunes(maxRuneArmor, [firstRune]);
const breastplateRunes = equipmentWithRunes(oneRuneArmor, [secondRune, firstRune]);
assert.notStrictEqual(helmetRunes["rune-0"].id, breastplateRunes["rune-0"].id);
assert.strictEqual(equipmentWithRunes(oneRuneArmor, [firstRune, secondRune])["rune-1"], undefined);

const verifiedEquipment = {
  "Assassin's Boots": { set: "Fierce Bee Set", stats: { Defense: "3.4", Health: "38.99" } },
  "Crystallized Honey Boots": { set: "Magical Bee Set", stats: { Defense: "3.2", Health: "27" } },
  "Hive Boots": { set: "Warrior Bee Set", stats: { Defense: "2.5", Health: "38.99" } },
  "Boots of the Foam": { set: null, stats: {} },
  "Unyielding Shield": { set: null, stats: { Defense: "2.9", Health: "24.99" } },
  "Fierce Amethyst Boots": { set: "Fierce Amethyst Set", stats: { Defense: "7", Health: "60" } }
};
const unrestrictedCombat = normalizedRecords.filter(
  (item) => item.category !== "accessory" && item.classes.length === 0
);
assert(unrestrictedCombat.length > 0);
const mainHandItems = adapter.getItemsForSlot("beta", "main-weapon", "mage");
const mainHandTools = mainHandItems.filter((item) => item.category === "tool");
assert(mainHandItems.some((item) => item.category === "weapon"));
assert(mainHandTools.length > 0);
assert.deepStrictEqual(
  Array.from(mainHandTools, (item) => item.name),
  [
    "Chipped Axe",
    "Cracked Pickaxe",
    "Metal Axe",
    "Metal Hoe",
    "Metal Pickaxe",
    "Twisted Sickle",
    "Necrotic Ax",
    "Necrotic Hoe",
    "Necrotic Pickaxe",
    "Savannah Ax",
    "Savannah Hoe",
    "Savannah Pickaxe",
    "Reinforced Ax",
    "Reinforced Hoe",
    "Reinforced Pickaxe"
  ]
);
for (const utilityTool of ["Magic Brush", "Torch", "Wooden Fishing Rod"]) {
  assert(!mainHandItems.some((item) => item.name === utilityTool));
}
for (const [name, expected] of Object.entries(verifiedEquipment)) {
  const item = normalizedRecords.find((entry) => entry.name === name);
  assert(item, `${name} should exist exactly by name`);
  if (expected.set) assert.strictEqual(item.set, expected.set, `${name} should use the verified set name`);
  for (const [statName, expectedValue] of Object.entries(expected.stats)) {
    assert.strictEqual(item.stats[statName], expectedValue, `${name} ${statName} should match the verified value`);
  }
  const gameplayKeys = Object.keys(item.stats).filter(
    (key) =>
      ![
        "Class",
        "Rune Slots",
        "Unique",
        "Two-Handed",
        "Requirement: Force",
        "Requirement: Vitality",
        "Requirement: Defense Car"
      ].includes(key) && !/^Requirement:/.test(key)
  );
  if (expected.stats && Object.keys(expected.stats).length === 0) {
    assert.strictEqual(gameplayKeys.length, 0, `${name} should remain statless`);
  }
}
assert(adapter.getItemsForSlot("beta", "main-weapon", "mage").some((item) => item.name === "Metal Axe"));
assert(
  adapter.getItemsForSlot("beta", "main-weapon", "mage").filter((item) => item.searchText.includes("harvest power"))
    .length > 0
);
assert(
  adapter
    .getItemsForSlot("beta", "main-weapon", "mage")
    .filter((item) => item.rarity === "Rare")
    .some((item) => item.category === "tool")
);
assert(adapter.getItemsForSlot("beta", "main-weapon", "mage").some((item) => item.name === "Chipped Axe"));
assert(adapter.getItemsForSlot("beta", "main-weapon", "mage").some((item) => item.name === "Metal Axe"));
for (const classId of classes) {
  for (const item of normalizedRecords.filter((record) => record.category !== "accessory")) {
    const slotId = slotIds[item.slot];
    if (!slotId) continue;
    const available = adapter.getItemsForSlot("beta", slotId, classId).some((candidate) => candidate.id === item.id);
    assert.strictEqual(
      available,
      item.classes.length === 0 || item.classes.includes(classId),
      `${item.name} availability for ${classId}`
    );
  }
  for (const [slot, type] of Object.entries({
    amulet: "Amulet",
    "ring-1": "Ring",
    bracelet: "Bracelet",
    glove: "Glove",
    "artifact-1": "Artifact"
  })) {
    const expected = normalizedRecords.filter((item) => item.category === "accessory" && item.type === type).length;
    assert.strictEqual(
      adapter.getItemsForSlot("beta", slot, classId).length,
      expected,
      `${type} filtering for ${classId}`
    );
  }
}

const calculated = calculator.calculateBuildStats({
  equipment: {
    first: {
      stats: { Health: "20", Damage: "5%", "Flight Of Life": "1.5%", "Requirement: Vitality": "3", Unique: "Yes" }
    },
    second: { stats: { Health: "-2.5", Damage: "3", "Blocking Mastery": "2.5%", "2 Piece Set Bonus": "+5 Damage" } },
    third: { stats: { Health: "0", "Crouch Speed": "250" } }
  },
  isAvailable: () => true
});
assert.strictEqual(calculated.Health.flat, 17.5);
assert.strictEqual(calculated.Damage.flat, 3);
assert.strictEqual(calculated.Damage.percent, 5);
assert(!Object.prototype.hasOwnProperty.call(calculated, "Flight Of Life"));
assert(!Object.prototype.hasOwnProperty.call(calculated, "Block Proficiency"));
assert(!Object.prototype.hasOwnProperty.call(calculated, "Crouching Speed"));
assert(!Object.prototype.hasOwnProperty.call(calculated, "Requirement: Vitality"));
assert(!Object.prototype.hasOwnProperty.call(calculated, "2 Piece Set Bonus"));

/* The Character Build stat system holds exactly the supported stats and every default value is zero. */
const expectedSupportedStats = [
  "Damage",
  "Magic Damage",
  "Skill Damage",
  "Projectile Damage",
  "Attack Speed",
  "Critical Hit Chance",
  "Critical Hit Damage",
  "Skill Critical Hit Chance",
  "Skill Critical Hit Damage",
  "Defense",
  "Health",
  "Evasion",
  "Damage Reduction",
  "Tenacity",
  "Movement Speed",
  "Mana",
  "Stamina",
  "Health Regeneration",
  "Mana Regeneration",
  "Stamina Regeneration"
];
assert.deepStrictEqual(Array.from(calculator.supportedStats).sort(), [...expectedSupportedStats].sort());
assert.strictEqual(calculator.supportedStats.has("Block"), false, "Block is not a supported Character Build stat");
assert.strictEqual(calculator.normalizeStatName("Block"), null);
assert.strictEqual(
  calculator.normalizeStatName("Dodge"),
  "Evasion",
  "the data's Dodge maps onto the canonical Evasion stat"
);
assert.strictEqual(calculator.normalizeStatName("Attack Damage"), "Damage");
assert.strictEqual(calculator.normalizeStatName("Bonus Attack Speed"), "Attack Speed");
assert.strictEqual(calculator.normalizeStatName("Critical Damage"), "Critical Hit Damage");
assert.strictEqual(calculator.normalizeStatName("ability damage"), "Skill Damage");
assert.strictEqual(calculator.normalizeStatName("Bonus Movement Speed"), "Movement Speed");
/* Level 1 class base stats: the values a character actually starts with. They are starting values,
   not a bonus applied after the calculation, so they are present at every level and the per-level
   gains stack on top of them. */
const expectedBaseStats = {
  guerrier: {
    flat: { Health: 28, Damage: 1, Mana: 20, Evasion: 5 },
    percent: { "Attack Speed": 12.5, "Critical Hit Chance": 1, "Critical Hit Damage": 200, "Movement Speed": 10 }
  },
  mage: {
    flat: { Health: 20, Damage: 1, Mana: 20, Evasion: 5 },
    percent: { "Attack Speed": 12.5, "Critical Hit Chance": 1, "Critical Hit Damage": 200, "Movement Speed": 10 }
  },
  shaman: {
    flat: { Health: 20, Damage: 1, Mana: 20, Evasion: 5 },
    percent: { "Attack Speed": 12.5, "Critical Hit Chance": 1, "Critical Hit Damage": 200, "Movement Speed": 10 }
  },
  archer: {
    flat: { Health: 20, Damage: 1, Mana: 20, Evasion: 5 },
    percent: { "Attack Speed": 12.5, "Critical Hit Chance": 1, "Critical Hit Damage": 200, "Movement Speed": 16 }
  },
  assassin: {
    flat: { Health: 24, Damage: 1, Mana: 20, Evasion: 5 },
    percent: { "Attack Speed": 12.5, "Critical Hit Chance": 1, "Critical Hit Damage": 200, "Movement Speed": -68 }
  }
};
const baseStats = calculator.createBaseStats("archer");
assert.deepStrictEqual(Object.keys(baseStats).sort(), [...expectedSupportedStats].sort());
assert.deepStrictEqual(Object.keys(calculator.classBaseStats).sort(), Object.keys(expectedBaseStats).sort());
Object.entries(expectedBaseStats).forEach(([classId, expected]) => {
  const base = calculator.createBaseStats(classId);
  calculator.supportedStats.forEach((stat) => {
    assert.ok(
      Math.abs(base[stat].flat - (Number(expected.flat[stat]) || 0)) < 1e-9,
      `${classId} level 1 base: ${stat} flat`
    );
    assert.ok(
      Math.abs(base[stat].percent - (Number(expected.percent[stat]) || 0)) < 1e-9,
      `${classId} level 1 base: ${stat} percent`
    );
  });
  assert.deepStrictEqual(
    calculator.calculateBuildStats({ level: 1, classId, equipment: {}, isAvailable: () => true }),
    base,
    `${classId} level 1 build equals its base stats`
  );
});
/* A class with no supplied Level 1 base stats keeps the zero base. */
const martialArtistBase = calculator.createBaseStats("martial-artist");
calculator.supportedStats.forEach((stat) => {
  assert.strictEqual(martialArtistBase[stat].flat, 0, `martial-artist level 1 base: ${stat} flat`);
  assert.strictEqual(martialArtistBase[stat].percent, 0, `martial-artist level 1 base: ${stat} percent`);
});

/* Per-level class gains: level 1 is the base, so a build receives (level - 1) increments. */
const expectedClassBonuses = {
  assassin: {
    flat: { Health: 1.25, "Health Regeneration": 0.1, "Mana Regeneration": 0.1, "Stamina Regeneration": 0.1 },
    percent: { "Critical Hit Damage": 0.25 }
  },
  archer: {
    flat: { Health: 1.25, "Health Regeneration": 0.1, "Mana Regeneration": 0.1, "Stamina Regeneration": 0.1 },
    percent: { "Critical Hit Chance": 0.25 }
  },
  guerrier: {
    flat: { Health: 1.5, "Health Regeneration": 0.1, "Mana Regeneration": 0.1, "Stamina Regeneration": 0.1 },
    percent: {}
  },
  mage: {
    flat: { Health: 1.25, "Health Regeneration": 0.1, "Mana Regeneration": 0.1, "Stamina Regeneration": 0.1 },
    percent: { "Skill Critical Hit Damage": 0.25 }
  },
  shaman: {
    flat: { Health: 1.25, "Health Regeneration": 0.1, "Mana Regeneration": 0.1, "Stamina Regeneration": 0.1 },
    percent: { "Skill Critical Hit Chance": 0.25 }
  },
  "martial-artist": { flat: {}, percent: {} }
};
assert.deepStrictEqual(
  Object.keys(calculator.classLevelBonuses).sort(),
  Object.keys(expectedClassBonuses)
    .filter((classId) => classId !== "martial-artist")
    .sort()
);
function assertLevelScaling(classId, level, increments) {
  const result = calculator.calculateBuildStats({ level, classId, equipment: {}, isAvailable: () => true });
  const expected = expectedClassBonuses[classId];
  const base = expectedBaseStats[classId] || { flat: {}, percent: {} };
  calculator.supportedStats.forEach((stat) => {
    assert.ok(
      Math.abs(result[stat].flat - ((Number(base.flat[stat]) || 0) + (Number(expected.flat[stat]) || 0) * increments)) <
        1e-9,
      `${classId} level ${level}: ${stat} flat`
    );
    assert.ok(
      Math.abs(
        result[stat].percent - ((Number(base.percent[stat]) || 0) + (Number(expected.percent[stat]) || 0) * increments)
      ) < 1e-9,
      `${classId} level ${level}: ${stat} percent`
    );
  });
}
Object.keys(expectedClassBonuses).forEach((classId) => {
  assertLevelScaling(classId, 1, 0);
  assertLevelScaling(classId, 2, 1);
  assertLevelScaling(classId, 15, 14);
  assertLevelScaling(classId, 25, 24);
});
assert.strictEqual(
  calculator.calculateBuildStats({ level: 25, classId: "archer", equipment: {}, isAvailable: () => true }).Health.flat,
  50
);
assert.strictEqual(
  calculator.calculateBuildStats({ level: 25, classId: "guerrier", equipment: {}, isAvailable: () => true }).Health
    .flat,
  64
);

/* The data's Dodge set bonus flows through the normal calculation path. */
const ninjaPieces = normalizedRecords.filter((item) => item.set === "Ninja").slice(0, 2);
assert.strictEqual(ninjaPieces.length, 2);
const ninjaWithBonuses = calculator.calculateBuildStats({
  equipment: Object.fromEntries(ninjaPieces.map((item, index) => [`ninja-${index}`, item])),
  isAvailable: () => true
});
const ninjaWithoutBonuses = calculator.calculateBuildStats({
  equipment: Object.fromEntries(ninjaPieces.map((item, index) => [`ninja-${index}`, { ...item, setBonuses: [] }])),
  isAvailable: () => true
});
assert.strictEqual(ninjaWithBonuses.Evasion.percent - ninjaWithoutBonuses.Evasion.percent, 1.5);

const unsupportedTool = normalizedRecords.find((item) => item.name === "Metal Axe");
const unsupportedToolResult = calculator.calculateBuildStats({
  equipment: { "main-weapon": unsupportedTool },
  isAvailable: () => true
});
assert.deepStrictEqual(
  unsupportedToolResult,
  calculator.calculateBuildStats({ equipment: {}, isAvailable: () => true })
);
const supportedTool = { category: "tool", stats: { Health: "7", "Effect: Harvest Power": "99" } };
const supportedToolResult = calculator.calculateBuildStats({
  equipment: { "main-weapon": supportedTool },
  isAvailable: () => true
});
assert.strictEqual(supportedToolResult.Health.flat, 7);
assert(!Object.prototype.hasOwnProperty.call(supportedToolResult, "Effect: Harvest Power"));
assert.deepStrictEqual(
  supportedToolResult,
  calculator.calculateBuildStats({ equipment: { "main-weapon": supportedTool }, isAvailable: () => true })
);

const singleItem = { stats: { Defense: "5" } };
const singleBuild = { equipment: { helmet: singleItem }, isAvailable: () => true };
const singleResult = calculator.calculateBuildStats(singleBuild);
const repeatedResult = calculator.calculateBuildStats(singleBuild);
const removedResult = calculator.calculateBuildStats({ equipment: {}, isAvailable: () => true });
assert.strictEqual(singleResult.Defense.flat - removedResult.Defense.flat, 5);
assert.deepStrictEqual(singleResult, repeatedResult);

function setBuild(setName, count, includeBonuses = true, slotOffset = 0) {
  const pieces = normalizedRecords.filter((item) => item.set === setName).slice(0, count);
  return {
    equipment: Object.fromEntries(
      pieces.map((item, index) => [
        `set-${setName}-${slotOffset + index}`,
        includeBonuses ? item : { ...item, setBonuses: [] }
      ])
    ),
    isAvailable: () => true
  };
}

const titanThree = calculator.calculateBuildStats(setBuild("Titan", 3));
const titanThreeBase = calculator.calculateBuildStats(setBuild("Titan", 3, false));
const titanFour = calculator.calculateBuildStats(setBuild("Titan", 4));
const titanFourBase = calculator.calculateBuildStats(setBuild("Titan", 4, false));
assert.strictEqual(titanThree.Defense.flat - titanThreeBase.Defense.flat, 2.5);
assert.strictEqual(titanThree["Damage Reduction"].percent - titanThreeBase["Damage Reduction"].percent, 0);
assert.strictEqual(titanFour.Defense.flat - titanFourBase.Defense.flat, 2.5);
assert.strictEqual(titanFour["Damage Reduction"].percent - titanFourBase["Damage Reduction"].percent, 2);
assert.deepStrictEqual(titanFour, calculator.calculateBuildStats(setBuild("Titan", 4)));

const titanTwo = calculator.calculateBuildStats(setBuild("Titan", 2));
assert.strictEqual(titanTwo.Defense.flat - calculator.calculateBuildStats(setBuild("Titan", 2, false)).Defense.flat, 0);
assert.strictEqual(titanTwo["Damage Reduction"].percent, 0);

const guardianTwo = calculator.calculateBuildStats(setBuild("Guardian", 2, true, 10));
const combinedSets = calculator.calculateBuildStats({
  equipment: { ...setBuild("Titan", 3).equipment, ...setBuild("Guardian", 2, true, 10).equipment },
  isAvailable: () => true
});
assert.strictEqual(combinedSets.Defense.flat - titanThree.Defense.flat - guardianTwo.Defense.flat, 0);
assert.strictEqual(combinedSets["Critical Hit Damage"].percent - guardianTwo["Critical Hit Damage"].percent, 0);
assert.strictEqual(combinedSets["Critical Hit Damage"].percent, 25);

const occultSetNames = ["Shadow Neophyte F1", "Shadow Neophyte Set P2", "Seven Shadow Soldiers"];
const expectedOccultBonuses = Array.from({ length: 6 }, (_, index) => ({
  threshold: index + 2,
  sourceKey: `${index + 2} Piece Set Bonus`,
  sourceValue: "+1.5/s Health Regeneration",
  effects: [{ value: "+1.5", stat: "Health Regeneration", raw: "+1.5/s Health Regeneration" }]
}));
for (const [setName, expectedCount] of [
  [occultSetNames[0], 7],
  [occultSetNames[1], 9],
  [occultSetNames[2], 11]
]) {
  const pieces = normalizedRecords.filter((item) => item.set === setName);
  assert.equal(pieces.length, expectedCount, `${setName}: expected set piece count`);
  for (const item of pieces) {
    if (item.name === "Occult Boots") {
      assert.deepStrictEqual(Object.keys(item.stats).sort(), ["Requirement: Defense Car", "Unique"]);
      assert.equal(item.setBonuses.length, 0, "Occult Boots remains without individual or copied set stats");
      continue;
    }
    assert.deepStrictEqual(
      JSON.parse(JSON.stringify(item.setBonuses)),
      expectedOccultBonuses,
      `${item.name}: all Occult thresholds parse`
    );
  }
  const equipped = pieces.slice(0, 2);
  const equipment = Object.fromEntries(equipped.map((item, index) => [`occult-${index}`, item]));
  const withoutBonuses = Object.fromEntries(
    equipped.map((item, index) => [`occult-${index}`, { ...item, setBonuses: [] }])
  );
  const withBonuses = calculator.calculateBuildStats({ equipment, isAvailable: () => true });
  const without = calculator.calculateBuildStats({ equipment: withoutBonuses, isAvailable: () => true });
  assert.equal(
    withBonuses["Health Regeneration"].flat - without["Health Regeneration"].flat,
    1.5,
    `${setName}: two pieces activate +1.5/s regeneration`
  );
}

const characterBuildData = context.CharacterBuildData;
const skillClassIds = ["archer", "assassin", "guerrier", "mage", "shaman"];
const expectedSkillIds = Array.from({ length: 77 }, (_, index) => `skill${index + 1}`);
assert.strictEqual(characterBuildData.SKILL_TREE_LAYOUT.length, 77);
assert.strictEqual(new Set(characterBuildData.SKILL_TREE_LAYOUT.map((node) => node.skillId)).size, 77);
assert.deepStrictEqual(
  { id: characterBuildData.SKILL_TREE_LAYOUT.find((node) => node.skillId === "skill1").id, x: characterBuildData.SKILL_TREE_LAYOUT.find((node) => node.skillId === "skill1").x, y: characterBuildData.SKILL_TREE_LAYOUT.find((node) => node.skillId === "skill1").y },
  { id: "n39", x: 460, y: 464 },
  "the free starting skill remains at the existing visual center"
);
for (const classId of skillClassIds) {
  const skills = characterBuildData.CLASS_SKILLS[classId];
  const pointBySkillId = new Map(characterBuildData.SKILL_TREE_LAYOUT.map((point) => [point.skillId, point.id]));
  const visualConnections = new Set(
    characterBuildData.SKILL_TREE_CONNECTIONS.map(([from, to]) => [from, to].sort().join(":"))
  );
  assert.deepStrictEqual(Object.keys(skills).sort(), [...expectedSkillIds].sort(), `${classId}: complete skill set`);
  assert(skills.skill1.name && skills.skill1.description, `${classId}: center skill name and description`);
  assert.strictEqual(skills.skill1.className, classId === "guerrier" ? "Warrior" : classId[0].toUpperCase() + classId.slice(1));
  assert.deepStrictEqual(Object.keys(skills.skill1).sort(), ["className", "description", "id", "name"]);
  assert.strictEqual(skills.skill2.cost, 1);
  assert.strictEqual(skills.skill77.cost, 1);
  for (const skillId of expectedSkillIds) {
    const skill = skills[skillId];
    assert.strictEqual(skill.id, skillId, `${classId} ${skillId}: stable skill ID`);
    assert.strictEqual(Object.hasOwn(skill, "description"), skillId === "skill1", `${classId} ${skillId}: center-only description`);
    if (skillId === "skill1") continue;
    assert(skill.name && skill.className && skill.stat, `${classId} ${skillId}: editable fields`);
    assert(Number.isFinite(skill.amount), `${classId} ${skillId}: numeric amount`);
    assert.strictEqual(skill.cost, skillId === "skill1" ? 0 : 1, `${classId} ${skillId}: skill point cost`);
    assert(["flat", "percent"].includes(skill.statMode), `${classId} ${skillId}: stat mode`);
    assert(Array.isArray(skill.prerequisites), `${classId} ${skillId}: prerequisites`);
    Array.from(skill.prerequisites).forEach((prerequisite) => {
      assert(skills[prerequisite], `${classId} ${skillId}: prerequisite ${prerequisite} exists`)
      const connection = [pointBySkillId.get(skillId), pointBySkillId.get(prerequisite)].sort().join(":");
      assert(visualConnections.has(connection), `${classId} ${skillId}: prerequisite connection exists`);
    });
  }
}

const sampleSkill = characterBuildData.ARCHER_SKILLS.skill2;
const sampleSkillValue = sampleSkill.statMode === "percent" ? `${sampleSkill.amount}%` : sampleSkill.amount;
const statsWithSkill = calculator.calculateBuildStats({
  level: 1,
  classId: "archer",
  equipment: {},
  selectedSkills: [{ effects: [{ stat: sampleSkill.stat, value: sampleSkillValue }] }]
});
const statsWithoutSkill = calculator.calculateBuildStats({ level: 1, classId: "archer", equipment: {} });
const sampleSkillStat = calculator.normalizeStatName(sampleSkill.stat);
const sampleSkillEffect = calculator.parseValue(sampleSkillValue);
assert(sampleSkillStat && sampleSkillEffect, "the configured skill effect is supported by the calculator");
assert.strictEqual(
  statsWithSkill[sampleSkillStat].flat - statsWithoutSkill[sampleSkillStat].flat,
  sampleSkillEffect.flat,
  "a skill applies its configured flat stat through the existing calculator"
);
assert.strictEqual(
  statsWithSkill[sampleSkillStat].percent - statsWithoutSkill[sampleSkillStat].percent,
  sampleSkillEffect.percent,
  "a skill applies its configured percentage stat through the existing calculator"
);
const expectedStackedStats = calculator.calculateBuildStats({ level: 1, classId: "archer", equipment: {} });
const stackedSkills = [characterBuildData.ARCHER_SKILLS.skill2, characterBuildData.ARCHER_SKILLS.skill6];
stackedSkills.forEach((skill) => {
  const stat = calculator.normalizeStatName(skill.stat);
  const effect = calculator.parseValue(skill.statMode === "percent" ? `${skill.amount}%` : skill.amount);
  assert(stat && effect, `${skill.id}: stacked skill effect is supported`);
  expectedStackedStats[stat].flat += effect.flat;
  expectedStackedStats[stat].percent += effect.percent;
});
const statsWithStackedSkills = calculator.calculateBuildStats({
  level: 1,
  classId: "archer",
  equipment: {},
  selectedSkills: [characterBuildData.ARCHER_SKILLS.skill2, characterBuildData.ARCHER_SKILLS.skill6].map((skill) => ({
    effects: [{ stat: skill.stat, value: skill.statMode === "percent" ? `${skill.amount}%` : skill.amount }]
  }))
});
for (const stat of calculator.supportedStats) {
  assert.deepStrictEqual(statsWithStackedSkills[stat], expectedStackedStats[stat], `${stat}: configured skill effects stack`);
}
const percentageBuff = calculator.calculateBuildStats({
  level: 1,
  classId: "archer",
  equipment: {},
  selectedSkills: [{ effects: [{ stat: "Critical Hit Chance", value: "5%" }] }]
});
assert.strictEqual(
  percentageBuff["Critical Hit Chance"].percent - statsWithoutSkill["Critical Hit Chance"].percent,
  5,
  "percentage skill effects remain percentages"
);
assert.strictEqual(
  calculator.calculateBuildStats({ level: 1, classId: "archer", equipment: {}, selectedSkills: [] }).Damage.flat,
  statsWithoutSkill.Damage.flat,
  "removing selected skills removes their stat effect"
);

console.log(
  JSON.stringify(
    {
      sourceRecords: sourceRecords.length,
      normalizedRecords: normalizedRecords.length,
      classified: audit.totalSuccessfullyClassified,
      distinctStatistics: Object.keys(audit.statisticInventory).length,
      calculatedStatistics: audit.calculatedStatistics,
      preservedButUnsupportedStatistics: audit.preservedButUnsupportedStatistics,
      unrestrictedCombatRecords: unrestrictedCombat.length,
      skillTree: "passed",
      skillEffects: "passed",
      setTests: {
        titanThree: "passed",
        titanFourCumulative: "passed",
        multiSet: "passed",
        repeatedCalculation: "passed",
        occultThresholds: "passed"
      },
      status: "passed"
    },
    null,
    2
  )
);
