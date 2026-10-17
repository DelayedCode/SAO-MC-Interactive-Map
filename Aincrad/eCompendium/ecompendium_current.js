/* Current Data equipment - the single source of truth for every Current-Data item.
   Aincrad/eCompendium/ecompendium.js reads this object when the active dataset is "current", and
   Aincrad/Character Build/character-build-adapter.js normalizes the same object for the builder's
   "current" source, so no page keeps its own copy of an item.

   The schema is the Beta floor schema (window.FLOOR_<n>_DATA) exactly:
     name, level, description, set, craftingResources[{ item, amount }], stats
   Set bonuses use the same "N Piece Set Bonus" stat keys as Beta; the effects of one tier are
   comma-separated inside that single value (matching Beta, e.g. "+5% Magic Damage, +15 Mana").

   Rarity is omitted because the supplied Current data does not provide it, and no value is invented
   here. The one craftingLocation the requested change supplies - the Secret Accessory Blacksmith
   that forges the Gloves of the Wolves - is carried exactly as given. Beta Data is untouched and
   still lives in ecompendium_floor*.js. */
window.SAO_CURRENT_EQUIPMENT_DATA = {
  floor1: {
    weapon: [
      {
        name: "Training Sword",
        level: 1,
        description: "Given to beginners, it allows the first training sessions",
        craftingResources: [{ item: "Col", amount: 1 }],
        stats: { Class: "Warrior", "Attack Damage": "2.5", "Attack Speed": "1.1/s" }
      },
      {
        name: "Training Bow",
        level: 1,
        description: "A rudimentary bow used by first-time shooters",
        craftingResources: [{ item: "Col", amount: 1 }],
        stats: { Class: "Archer", "Attack Damage": "3", "Attack Speed": "1.2/s" }
      },
      {
        name: "Training Crossbow",
        level: 1,
        description: "A rudimentary training crossbow, entrusted to apprentice shooters.",
        craftingResources: [{ item: "Col", amount: 1 }],
        stats: { Class: "Archer", "Attack Damage": "2", "Attack Speed": "1/s", "Skill Critical Chance": "+0.5%" }
      },
      {
        name: "Training Dagger",
        level: 1,
        description: "Given to beginners, it allows the first training sessions",
        craftingResources: [{ item: "Col", amount: 1 }],
        stats: { Class: "Assassin", "Attack Damage": "3", "Attack Speed": "1.4/s" }
      },
      {
        name: "Training Scythe",
        level: 1,
        description: "Given to beginners, it allows the first training sessions",
        craftingResources: [{ item: "Col", amount: 1 }],
        stats: {
          Class: "Assassin",
          "Two-Handed": "Yes",
          "Attack Damage": "4.5",
          "Attack Speed": "0.9/s",
          "Skill Critical Chance": "+0.5%",
          "Stamina Regeneration": "+0.05/s"
        }
      },
      {
        name: "Katana Training",
        level: 1,
        description: "Given to beginners, it allows the first training sessions",
        craftingResources: [{ item: "Col", amount: 1 }],
        stats: {
          Class: "Assassin",
          "Two-Handed": "Yes",
          "Attack Damage": "3.5",
          "Attack Speed": "1.2/s",
          "Life Steal": "+5%",
          Dodge: "+5%",
          "Movement Speed": "+15%"
        }
      },
      {
        name: "Training Magic Staff",
        level: 1,
        description: "A harmless magical learning staff, but a bearer of energy.",
        craftingResources: [{ item: "Col", amount: 1 }],
        stats: { Class: "Mage, Shaman", "Attack Damage": "3.5", "Attack Speed": "1/s" }
      },
      {
        name: "Unbound Grimoire",
        level: 1,
        description: "An incomplete book overflowing with arcane magic.",
        craftingResources: [{ item: "Col", amount: 1 }],
        stats: { Class: "Mage", "Max Mana": "+1" }
      },
      {
        name: "Training Lantern",
        level: 1,
        description: "A learning lantern emitting a faint glow.",
        craftingResources: [{ item: "Col", amount: 1 }],
        stats: { Class: "Mage, Shaman", "Magic Damage": "+1%" }
      },
      {
        name: "Wild Grimoire",
        level: 1,
        description: "An unstable book overflowing with wild magic.",
        craftingResources: [{ item: "Col", amount: 1 }],
        stats: { Class: "Shaman", "Bonus Healing": "+1" }
      },
      {
        name: "Training Dagger",
        level: 1,
        description: "Given to beginners, it allows for the first training sessions.",
        craftingResources: [{ item: "Col", amount: 1 }],
        stats: { Class: "Assassin", "Critical Chance": "+0.5%" }
      },
      {
        name: "Training Quiver",
        level: 1,
        description: "A training quiver for apprentice archers.",
        craftingResources: [{ item: "Col", amount: 1 }],
        stats: { Class: "Archer", "Critical Chance": "+0.5%" }
      },
      {
        name: "Training Buckler",
        level: 1,
        description: "An old shield. It still blocks despite its great weight.",
        craftingResources: [{ item: "Col", amount: 1 }],
        stats: { Class: "Warrior", Defense: "+1", "Guard Durability": "8", Health: "+8", "Movement Speed": "-5%" }
      },
      {
        name: "Training Buckler",
        level: 1,
        description: "An old shield. It still blocks",
        craftingResources: [{ item: "Col", amount: 1 }],
        stats: { Class: "Warrior", "Attack Damage": "0.25", "Guard Durability": "4", Health: "+4" }
      },
      {
        name: "Basic Sword",
        level: 3,
        description: "Basic, simple, but still effective for a beginner",
        stats: { Class: "Warrior", "Weapon Category": "Sword [P1]", "Attack Damage": "3.5", "Attack Speed": "1.1/s" }
      },
      {
        name: "Basic Dual Axe",
        level: 3,
        description: "Basic, heavy, but still effective for a beginner",
        stats: {
          Class: "Warrior",
          "Weapon Category": "Dual Axe [P1]",
          "Two-Handed": "Yes",
          "Attack Damage": "5.5",
          "Attack Speed": "0.9/s",
          "Skill Critical Chance": "+0.5%",
          "Stamina Regeneration": "+0.05/s"
        }
      },
      {
        name: "Copper Greatsword",
        level: 5,
        description: "Forged from copper, this greatsword is made to vanquish its enemies.",
        stats: {
          Class: "Warrior",
          "Weapon Category": "Greatsword [P1]",
          "Two-Handed": "Yes",
          "Attack Damage": "6",
          "Attack Speed": "1.2/s",
          "Critical Chance": "+1%",
          "Life Steal": "+5%"
        }
      },
      {
        name: "Copper Double Axe",
        level: 5,
        description: "Forged from copper, this double axe is made to tear its enemies apart.",
        stats: {
          Class: "Warrior",
          "Weapon Category": "Double Axe [P1]",
          "Two-Handed": "Yes",
          "Attack Damage": "8",
          "Attack Speed": "0.9/s",
          "Skill Critical Chance": "+0.8%",
          "Stamina Regeneration": "+0.1/s"
        }
      },
      {
        name: "Simple Longsword Weapon",
        level: 5,
        description: "Quite simple, it fits in your hand and can brutally slice in two",
        stats: {
          Class: "Warrior",
          "Weapon Category": "Longsword [P1]",
          "Two-Handed": "Yes",
          "Attack Damage": "8",
          "Attack Speed": "0.9/s",
          "Critical Damage": "+2%",
          "Life Steal": "+1%"
        }
      },
      {
        name: "Simple Sword",
        level: 5,
        description: "Quite simple, it fits in the hand and can slash",
        stats: { Class: "Warrior", "Weapon Category": "Sword [P1]", "Attack Damage": "5", "Attack Speed": "1.1/s" }
      },
      {
        name: "Protector's Hammer",
        level: 7,
        description: "Forged in magic, this hammer is imbued with the essence of powerful Tier 1 monsters.",
        stats: {
          Class: "Warrior",
          "Weapon Category": "Warhammer [P1]",
          "Two-Handed": "Yes",
          "Attack Damage": "11.5",
          "Attack Speed": "0.9/s",
          "Skill Critical Damage": "+1%",
          Defense: "+2"
        }
      },
      {
        name: "Hunter's Longsword",
        level: 7,
        description: "Forged for hunters of powerful Tier 1 monsters. It deals high damage",
        stats: {
          Class: "Warrior",
          "Weapon Category": "Longsword [P1]",
          "Two-Handed": "Yes",
          "Attack Damage": "11.5",
          "Attack Speed": "0.9/s",
          "Critical Damage": "+2.5%",
          "Life Steal": "+1%"
        }
      },
      {
        name: "Protector's Sword",
        level: 7,
        description: "Forged in magic, this sword is imbued with the essence of powerful Tier 1 monsters.",
        stats: { Class: "Warrior", "Weapon Category": "Sword [P1]", "Attack Damage": "7", "Attack Speed": "1.1/s" }
      },
      {
        name: "Hunter's Greatsword",
        level: 7,
        description: "Forged for hunters of powerful Tier 1 monsters. It offers good accuracy",
        stats: {
          Class: "Warrior",
          "Weapon Category": "Greatsword [P1]",
          "Two-Handed": "Yes",
          "Attack Damage": "8.5",
          "Attack Speed": "1.2/s",
          "Critical Chance": "+1.25%",
          "Life Steal": "+5%"
        }
      },
      {
        name: "Double Iron Axe",
        level: 9,
        description: "Forged for hunters of powerful Tier 1 monsters. It offers good accuracy",
        stats: {
          Class: "Warrior",
          "Weapon Category": "Double Axe [P1]",
          "Two-Handed": "Yes",
          "Attack Damage": "14",
          "Attack Speed": "0.9/s",
          "Skill Critical Chance": "+1%",
          "Stamina Regeneration": "+0.15/s"
        }
      },
      {
        name: "Iron Greatsword",
        level: 9,
        description: "Forged for hunters of powerful Tier 1 monsters. It offers good accuracy.",
        stats: {
          Class: "Warrior",
          "Weapon Category": "Greatsword [P1]",
          "Two-Handed": "Yes",
          "Attack Damage": "10.5",
          "Attack Speed": "1.2/s",
          "Critical Chance": "+1.5%",
          "Life Steal": "+5%"
        }
      },
      {
        name: "Guardian's Greatsword",
        level: 9,
        description: "Forged for hunters of powerful Tier 1 monsters. It offers good accuracy.",
        stats: {
          Class: "Warrior",
          "Weapon Category": "Greatsword [P1]",
          "Two-Handed": "Yes",
          "Attack Damage": "12",
          "Attack Speed": "1.2/s",
          "Critical Chance": "+1.75%",
          "Life Steal": "+5%"
        }
      },
      {
        name: "Guardian's Sword",
        level: 9,
        description: "Forged for hunters of powerful Tier 1 monsters. It offers good accuracy",
        stats: { Class: "Warrior", "Weapon Category": "Sword [P1]", "Attack Damage": "10", "Attack Speed": "1.1/s" }
      },
      {
        name: "Guardian's Longsword",
        level: 9,
        description: "Forged for hunters of powerful Tier 1 monsters. It offers good accuracy.",
        stats: {
          Class: "Warrior",
          "Weapon Category": "Longsword [P1]",
          "Two-Handed": "Yes",
          "Attack Damage": "16",
          "Attack Speed": "0.9/s",
          "Critical Damage": "+3.5%",
          "Life Steal": "+1%"
        }
      },
      {
        name: "Basic Scythe",
        level: 3,
        description: "Basic, simple, but still effective for a beginner",
        stats: {
          Class: "Assassin",
          "Weapon Category": "Scythe [P1]",
          "Two-Handed": "Yes",
          "Attack Damage": "6.5",
          "Attack Speed": "0.9/s",
          "Skill Critical Chance": "+0.8%",
          "Stamina Regeneration": "+0.1/s"
        }
      },
      {
        name: "Basic Dagger",
        level: 3,
        description: "Basic, simple, but still effective for a beginner",
        stats: { Class: "Assassin", "Weapon Category": "Dagger [P1]", "Attack Damage": "4.5", "Attack Speed": "1.4/s" }
      },
      {
        name: "Basic Katana",
        level: 3,
        description: "Basic, simple, but still effective for a beginner",
        stats: {
          Class: "Assassin",
          "Weapon Category": "Katana [P1]",
          "Two-Handed": "Yes",
          "Attack Damage": "5",
          "Attack Speed": "1.2/s",
          "Life Steal": "+5%",
          Dodge: "+5%",
          "Movement Speed": "+15%"
        }
      },
      {
        name: "Copper Dagger",
        level: 5,
        description: "Made from copper, the blade is stronger and sharper than others",
        stats: { Class: "Assassin", "Weapon Category": "Dagger [P1]", "Attack Damage": "6", "Attack Speed": "1.4/s" }
      },
      {
        name: "Copper Scythe Weapon",
        level: 5,
        description: "Made from copper, the blade is stronger and sharper than others",
        stats: {
          Class: "Assassin",
          "Weapon Category": "Scythe [P1]",
          "Two-Handed": "Yes",
          "Attack Damage": "9.5",
          "Attack Speed": "0.9/s",
          "Skill Critical Chance": "+1%",
          "Stamina Regeneration": "+0.15/s"
        }
      },
      {
        name: "Copper Katana",
        level: 5,
        description: "Forged from copper, its blade is stronger and sharper than others",
        stats: {
          Class: "Assassin",
          "Weapon Category": "Katana [P1]",
          "Two-Handed": "Yes",
          "Attack Damage": "7",
          "Attack Speed": "1.2/s",
          "Life Steal": "+5%",
          Dodge: "+5%",
          "Movement Speed": "+15%"
        }
      },
      {
        name: "Hunter's Scythe",
        level: 7,
        description: "Forged to become a hunter of lesser creatures",
        stats: {
          Class: "Assassin",
          "Weapon Category": "Scythe [P1]",
          "Two-Handed": "Yes",
          "Attack Damage": "13.5",
          "Attack Speed": "0.9/s",
          "Skill Critical Chance": "+1.2%",
          "Stamina Regeneration": "+0.2/s"
        }
      },
      {
        name: "Hunter's Dagger",
        level: 7,
        description: "Forged to become a hunter of lesser creatures",
        stats: { Class: "Assassin", "Weapon Category": "Dagger [P1]", "Attack Damage": "8.5", "Attack Speed": "1.4/s" }
      },
      {
        name: "Hunter's Katana",
        level: 7,
        description: "Forged to become a hunter of lesser creatures",
        stats: {
          Class: "Assassin",
          "Weapon Category": "Katana [P1]",
          "Two-Handed": "Yes",
          "Attack Damage": "10",
          "Attack Speed": "1.2/s",
          "Life Steal": "+5%",
          Dodge: "+5%",
          "Movement Speed": "+15%"
        }
      },
      {
        name: "Iron Katana Weapon",
        level: 9,
        description: "Forged from iron, its blade is far sharper and more durable than others",
        stats: {
          Class: "Assassin",
          "Weapon Category": "Katana [P1]",
          "Two-Handed": "Yes",
          "Attack Damage": "12.5",
          "Attack Speed": "1.2/s",
          "Life Steal": "+5%",
          Dodge: "+5%",
          "Movement Speed": "+15%"
        }
      },
      {
        name: "Iron Scythe",
        level: 9,
        description: "Forged from iron, its blade is far sharper and more durable than others",
        stats: {
          Class: "Assassin",
          "Weapon Category": "Scythe [P1]",
          "Two-Handed": "Yes",
          "Attack Damage": "16.5",
          "Attack Speed": "0.9/s",
          "Skill Critical Chance": "+1.5%",
          "Stamina Regeneration": "+0.25/s"
        }
      },
      {
        name: "Iron Dagger",
        level: 9,
        description: "Forged from iron, its blade is far sharper and more durable than others",
        stats: { Class: "Assassin", "Weapon Category": "Dagger [P1]", "Attack Damage": "10.5", "Attack Speed": "1.4/s" }
      },
      {
        name: "Herald's Katana",
        level: 9,
        description: "This katana was forged for heralds, elite assassins capable of facing the Forgotten",
        stats: {
          Class: "Assassin",
          "Weapon Category": "Katana [P1]",
          "Two-Handed": "Yes",
          "Attack Damage": "14",
          "Attack Speed": "1.2/s",
          "Life Steal": "+5%",
          Dodge: "+5%",
          "Movement Speed": "+15%"
        }
      },
      {
        name: "Herald's Dagger",
        level: 9,
        description: "This dagger was forged for heralds, elite assassins capable of facing the Forgotten",
        stats: { Class: "Assassin", "Weapon Category": "Dagger [P1]", "Attack Damage": "12", "Attack Speed": "1.4/s" }
      },
      {
        name: "Herald's Scythe",
        level: 9,
        description: "This scythe was forged for heralds, elite assassins capable of facing the Forgotten",
        stats: {
          Class: "Assassin",
          "Weapon Category": "Scythe [P1]",
          "Two-Handed": "Yes",
          "Attack Damage": "19",
          "Attack Speed": "0.9/s",
          "Skill Critical Chance": "+1.8%",
          "Stamina Regeneration": "+0.3/s"
        }
      },
      {
        name: "Basic Bow",
        level: 3,
        description: "A rudimentary bow used by early archers",
        stats: { Class: "Archer", "Weapon Category": "Bow [P1]", "Attack Damage": "4.5", "Attack Speed": "1.2/s" }
      },
      {
        name: "Basic Crossbow",
        level: 3,
        description: "A simple crossbow, hastily assembled but reliable.",
        stats: {
          Class: "Archer",
          "Weapon Category": "Crossbow [P1]",
          "Attack Damage": "2.5",
          "Attack Speed": "1/s",
          "Skill Critical Chance": "+0.8%"
        }
      },
      {
        name: "Copper Bow",
        level: 5,
        description: "A light, maneuverable, and reliable copper bow.",
        stats: { Class: "Archer", "Weapon Category": "Bow [P1]", "Attack Damage": "6", "Attack Speed": "1.2/s" }
      },
      {
        name: "Copper Crossbow",
        level: 5,
        description: "A light copper crossbow, maneuverable and accurate.",
        stats: {
          Class: "Archer",
          "Weapon Category": "Crossbow [P1]",
          "Attack Damage": "3.5",
          "Attack Speed": "1/s",
          "Skill Critical Chance": "+1%"
        }
      },
      {
        name: "Hunter's Crossbow",
        level: 7,
        description: "Crossbow for hunting powerful Tier 1 monsters.",
        stats: {
          Class: "Archer",
          "Weapon Category": "Crossbow [P1]",
          "Attack Damage": "5",
          "Attack Speed": "1/s",
          "Skill Critical Chance": "+1.2%"
        }
      },
      {
        name: "Hunting Bow",
        level: 7,
        description: "Bow for hunting powerful Tier 1 monsters.",
        stats: { Class: "Archer", "Weapon Category": "Bow [P1]", "Attack Damage": "8.5", "Attack Speed": "1.2/s" }
      },
      {
        name: "Herald's Bow",
        level: 9,
        description: "A powerful bow that belonged to one of the Fallen of the Labyrinth.",
        stats: { Class: "Archer", "Weapon Category": "Bow [P1]", "Attack Damage": "12", "Attack Speed": "1.2/s" }
      },
      {
        name: "Iron Bow",
        level: 9,
        description: "A sturdy bow forged from iron, reliable and accurate.",
        stats: { Class: "Archer", "Weapon Category": "Bow [P1]", "Attack Damage": "10.5", "Attack Speed": "1.2/s" }
      },
      {
        name: "Iron Crossbow",
        level: 9,
        description: "A sturdy crossbow forged from iron, solid and accurate.",
        stats: {
          Class: "Archer",
          "Weapon Category": "Crossbow [P1]",
          "Attack Damage": "6",
          "Attack Speed": "1/s",
          "Skill Critical Chance": "+1.5%"
        }
      },
      {
        name: "Forest Magic Staff (Mage)",
        level: 3,
        description: "From heartwood and enchanted twigs, a staff was born.",
        stats: { Class: "Mage", "Weapon Category": "Staff [P1]", "Attack Damage": "5", "Attack Speed": "1/s" }
      },
      {
        name: "Copper Magic Staff (Mage)",
        level: 5,
        description: "A light copper staff, imbued with nascent magic.",
        stats: { Class: "Mage", "Weapon Category": "Staff [P1]", "Attack Damage": "7", "Attack Speed": "1/s" }
      },
      {
        name: "Magician's Staff (Mage)",
        level: 7,
        description: "Forged in the heart of a silent storm. This staff vibrates with a powerful, celestial energy.",
        stats: { Class: "Mage", "Weapon Category": "Staff [P1]", "Attack Damage": "10", "Attack Speed": "1/s" }
      },
      {
        name: "Dark Magic Staff (Mage)",
        level: 9,
        description: "Staff made from enchantments and metals. Perfect for dealing incredible damage.",
        stats: { Class: "Mage", "Weapon Category": "Staff [P1]", "Attack Damage": "14.5", "Attack Speed": "1/s" }
      },
      {
        name: "Iron Magic Staff (Mage)",
        level: 9,
        description: "A solid staff forged from iron, channeling reliable magic.",
        stats: { Class: "Mage", "Weapon Category": "Staff [P1]", "Attack Damage": "13", "Attack Speed": "1/s" }
      },
      {
        name: "Magic Forest Staff (Shaman)",
        level: 3,
        description: "From the Heart of Wood and Enchanted Twigs, a staff is born",
        stats: { Class: "Shaman", "Weapon Category": "Staff [P1]", "Attack Damage": "5", "Attack Speed": "1/s" }
      },
      {
        name: "Copper Magic Staff (Shaman)",
        level: 5,
        description: "A light copper staff, imbued with nascent magic.",
        stats: { Class: "Shaman", "Weapon Category": "Staff [P1]", "Attack Damage": "7", "Attack Speed": "1/s" }
      },
      {
        name: "Magician's Staff (Shaman)",
        level: 7,
        description: "Forged in the heart of a silent storm. This staff vibrates with a powerful, celestial energy.",
        stats: { Class: "Shaman", "Weapon Category": "Staff [P1]", "Attack Damage": "10", "Attack Speed": "1/s" }
      },
      {
        name: "Dark Magic Staff (Shaman)",
        level: 9,
        description: "Staff made from enchantments and metals. Perfect for dealing incredible damage.",
        stats: { Class: "Shaman", "Weapon Category": "Staff [P1]", "Attack Damage": "14.5", "Attack Speed": "1/s" }
      },
      {
        name: "Iron Magic Staff (Shaman)",
        level: 9,
        description: "A solid staff forged from iron, channeling reliable magic.",
        stats: { Class: "Shaman", "Weapon Category": "Staff [P1]", "Attack Damage": "13", "Attack Speed": "1/s" }
      },
      {
        name: "Ika's Shield",
        level: 3,
        description: "Forged from the shells of Ika's turtles. Offers good protection.",
        stats: {
          Class: "Warrior",
          "Weapon Category": "Second Hand [P1]",
          Defense: "+2",
          "Guard Durability": "12",
          Health: "+12",
          "Movement Speed": "-5%"
        }
      },
      {
        name: "Spiked Wooden Shield",
        level: 3,
        description: "A torn piece of wood covered in sharp spikes",
        stats: {
          Class: "Warrior",
          "Weapon Category": "Second Hand [P1]",
          "Attack Damage": "0.5",
          "Guard Durability": "6",
          Health: "+6"
        }
      },
      {
        name: "Copper Shield (Defensive)",
        level: 5,
        description: "Forged from copper, its large size and weight provide effective protection",
        stats: {
          Class: "Warrior",
          "Weapon Category": "Second Hand [P1]",
          Defense: "+3",
          "Guard Durability": "16",
          Health: "+16",
          "Movement Speed": "-5%"
        }
      },
      {
        name: "Copper Shield (Offensive)",
        level: 5,
        description: "Forged from copper, this shoulder shield protects against counterattacks",
        stats: {
          Class: "Warrior",
          "Weapon Category": "Off-Hand [P1]",
          "Attack Damage": "0.75",
          "Guard Durability": "8",
          Health: "+8"
        }
      },
      {
        name: "Tolbana Shield (Defensive)",
        level: 7,
        description: "Forged in the image of an ancient and powerful Tolbana mage. Ensures your defenses.",
        stats: {
          Class: "Warrior",
          "Weapon Category": "Second Hand [P1]",
          Defense: "+4",
          "Guard Durability": "20",
          Health: "+20",
          "Movement Speed": "-5%"
        }
      },
      {
        name: "Tolbana Shield (Offensive)",
        level: 7,
        description: "Forged in the image of an ancient and powerful Tolbana mage. Ensures your offensives.",
        stats: {
          Class: "Warrior",
          "Weapon Category": "Off-Hand [P1]",
          "Attack Damage": "1",
          "Guard Durability": "10",
          Health: "+10"
        }
      },
      {
        name: "Iron Shield (Defensive)",
        level: 9,
        description:
          "Forged from iron, this shield is large and sturdy, ideal for protecting your life in the heat of battle.",
        stats: {
          Class: "Warrior",
          "Weapon Category": "Second Hand [P1]",
          Defense: "+4",
          "Guard Durability": "24",
          Health: "+24",
          "Movement Speed": "-5%"
        }
      },
      {
        name: "Iron Shield (Offensive)",
        level: 9,
        description: "Forged from iron, this shield is light and ideal for warriors",
        stats: {
          Class: "Warrior",
          "Weapon Category": "Second Hand [P1]",
          "Attack Damage": "1.25",
          "Guard Durability": "12",
          Health: "+12"
        }
      },
      {
        name: "Basic Dagger (Offhand)",
        level: 3,
        description: "Basic, allows for easier chaining of attacks.",
        stats: { Class: "Assassin", "Weapon Category": "Off-Hand [P1]", "Critical Chance": "+0.75%" }
      },
      {
        name: "Copper Dagger (Offhand)",
        level: 5,
        description: "Made from copper, this dagger is stronger.",
        stats: { Class: "Assassin", "Weapon Category": "Second Hand [P1]", "Critical Chance": "+1%" }
      },
      {
        name: "Albal's Dagger",
        level: 7,
        description: "A dagger of bestial nature, it is made from the sharp, pointed fangs of wolves",
        stats: { Class: "Assassin", "Weapon Category": "Second Hand [P1]", "Critical Chance": "+1.25%" }
      },
      {
        name: "Iron Dagger (Offhand)",
        level: 9,
        description: "Forged from iron, this dagger is sharp.",
        stats: { Class: "Assassin", "Weapon Category": "Second Hand [P1]", "Critical Chance": "+1.5%" }
      },
      {
        name: "Basic Quiver",
        level: 3,
        description: "A simple quiver, ideal for your first hunts.",
        stats: { Class: "Archer", "Weapon Category": "Second Hand [P1]", "Critical Chance": "+0.75%" }
      },
      {
        name: "Copper Quiver",
        level: 5,
        description: "Reinforced with copper, sturdy for adventure.",
        stats: { Class: "Archer", "Weapon Category": "Second Hand [P1]", "Critical Chance": "+1%" }
      },
      {
        name: "Hunter's Quiver",
        level: 7,
        description: "Designed for experienced big-game hunters.",
        stats: { Class: "Archer", "Weapon Category": "Second Hand [P1]", "Critical Chance": "+1.25%" }
      },
      {
        name: "Iron Quiver",
        level: 9,
        description: "Forged from durable iron, reliable in any situation.",
        stats: { Class: "Archer", "Weapon Category": "Second Hand [P1]", "Critical Chance": "+1.5%" }
      },
      {
        name: "Basic Lantern (Mage)",
        level: 3,
        description: "A simple, reliable, and functional lantern.",
        stats: { Class: "Mage", "Weapon Category": "Second Hand [P1]", "Magic Damage": "+1.25%" }
      },
      {
        name: "Grimoire Sylvestre",
        level: 3,
        description: "A book forged from materials from an ancient, putrid swamp. It contains elemental magic",
        stats: { Class: "Mage", "Weapon Category": "Second Hand [P1]", "Max Mana": "+1.5" }
      },
      {
        name: "Grimoire of the Revenants",
        level: 5,
        description: "A book from the cursed ruins. It reeks of blood.",
        stats: { Class: "Mage", "Weapon Category": "Second Hand [P1]", "Max Mana": "+2" }
      },
      {
        name: "Copper Lantern (Mage)",
        level: 5,
        description: "A copper lantern, emitting a warm, arcane glow.",
        stats: { Class: "Mage", "Weapon Category": "Second Hand [P1]", "Magic Damage": "+1.5%" }
      },
      {
        name: "Magician's Grimoire (Mage)",
        level: 7,
        description:
          "This book was forged using powerful Tier 1 materials. It embodies the power of a Magician.",
        stats: { Class: "Mage", "Weapon Category": "Second Hand [P1]", "Max Mana": "+2.5" }
      },
      {
        name: "Magician's Lantern (Mage)",
        level: 7,
        description: "A lantern crafted by an experienced magician.",
        stats: { Class: "Mage", "Weapon Category": "Second Hand [P1]", "Magic Damage": "+1.75%" }
      },
      {
        name: "Dark Grimoire (Mage)",
        level: 9,
        description:
          "A dark mixture of ancient materials, lost in a great labyrinth. It could be the grimoire of a reaper",
        stats: { Class: "Mage", "Weapon Category": "Second Hand [P1]", "Max Mana": "+3" }
      },
      {
        name: "Iron Lantern (Mage)",
        level: 9,
        description: "A sturdy iron lantern, radiating steady magic.",
        stats: { Class: "Mage", "Weapon Category": "Second Hand [P1]", "Magic Damage": "+2%" }
      },
      {
        name: "Beastly Grimoire",
        level: 3,
        description: "A book forged from materials from an ancient, putrid swamp. It contains beastly magic.",
        stats: { Class: "Shaman", "Weapon Category": "Second Hand [P1]", "Healing Bonus": "+1.2" }
      },
      {
        name: "Basic Lantern (Shaman)",
        level: 3,
        description: "A simple, reliable, and functional lantern.",
        stats: { Class: "Shaman", "Weapon Category": "Second Hand [P1]", "Magic Damage": "+1.25%" }
      },
      {
        name: "Copper Lantern (Shaman)",
        level: 5,
        description: "A copper lantern, emitting a warm, arcane glow.",
        stats: { Class: "Shaman", "Weapon Category": "Second Hand [P1]", "Magic Damage": "+1.5%" }
      },
      {
        name: "Skeletal Grimoire",
        level: 5,
        description: "A book from the cursed ruins. It reeks of death.",
        stats: { Class: "Shaman", "Weapon Category": "Second Hand [P1]", "Healing Bonus": "+1.5" }
      },
      {
        name: "Magician's Lantern (Shaman)",
        level: 7,
        description: "A lantern crafted by an experienced magician.",
        stats: { Class: "Shaman", "Weapon Category": "Second Hand [P1]", "Magic Damage": "+1.75%" }
      },
      {
        name: "Sorcerer's Grimoire (Shaman)",
        level: 7,
        description:
          "This book was forged using powerful Tier 1 materials. It embodies the power of a Sorcerer.",
        stats: { Class: "Shaman", "Weapon Category": "Second Hand [P1]", "Healing Bonus": "+1.8" }
      },
      {
        name: "Iron Lantern (Shaman)",
        level: 9,
        description: "A sturdy iron lantern, diffusing steady magic.",
        stats: { Class: "Shaman", "Weapon Category": "Second Hand [P1]", "Magic Damage": "+2%" }
      },
      {
        name: "Ghostly Grimoire",
        level: 9,
        description:
          "An obscure mixture of ancient materials, lost in a great labyrinth. It could be the grimoire of a powerful ghost.",
        stats: { Class: "Shaman", "Weapon Category": "Second Hand [P1]", "Healing Bonus": "+2" }
      },
    ],
    armor: [
      {
        name: "Beginner's Tunic",
        level: 1,
        description: "Barely protects against a blade, but it's always better than nothing.",
        craftingResources: [{ item: "Col", amount: 50 }],
        stats: { Class: "Any", Health: "+2" }
      },
      {
        name: "Beginner Leggings",
        level: 1,
        description: "Barely protects against a blade, but it's always better than nothing.",
        craftingResources: [{ item: "Col", amount: 50 }],
        stats: { Class: "Any", Health: "10" }
      },
      {
        name: "Beginner's Boots",
        level: 1,
        description: "Barely protects against a blade, but it's always better than nothing.",
        craftingResources: [{ item: "Col", amount: 50 }],
        stats: { Class: "Any", Health: "+1" }
      },
      {
        name: "Champion's Mask",
        level: 7,
        description: "Forged from purified metal, this armor protects those who have triumphed over corrupted ruins.",
        set: "PvP Set P1",
        stats: {
          Class: "Shaman",
          Defense: "+2",
          Health: "+9",
          "Rune Slots": "1",
          "2 Piece Set Bonus": "+5% PvP Reduction, +5% PvP Tenacity",
          "3 Piece Set Bonus": "+5% PvP Damage",
          "4 Piece Set Bonus": "+5% Critical Resistance"
        }
      },
      {
        name: "Champion's Breastplate",
        level: 7,
        description: "Forged from purified metal, this armor protects those who have triumphed over corrupted ruins.",
        set: "PvP Set P1",
        stats: {
          Class: "Shaman",
          Defense: "+5",
          Health: "+13",
          "Rune Slots": "2",
          "2 Piece Set Bonus": "+5% PvP Reduction, +5% PvP Tenacity",
          "3 Piece Set Bonus": "+5% PvP Damage",
          "4 Piece Set Bonus": "+5% Critical Resistance"
        }
      },
      {
        name: "Champion's Leggings",
        level: 7,
        description: "Forged from purified metal, this armor protects those who have triumphed over corrupted ruins.",
        set: "PvP Set P1",
        stats: {
          Class: "Shaman",
          Defense: "+3",
          Health: "+11",
          "2 Piece Set Bonus": "+5% PvP Reduction, +5% PvP Tenacity",
          "3 Piece Set Bonus": "+5% PvP Damage",
          "4 Piece Set Bonus": "+5% Critical Resistance"
        }
      },
      {
        name: "Champion's Boots",
        level: 7,
        description: "Forged from purified metal, this armor protects those who have triumphed over corrupted ruins.",
        set: "PvP Set P1",
        stats: {
          Class: "Shaman",
          Defense: "+1",
          Health: "+8",
          "2 Piece Set Bonus": "+5% PvP Reduction, +5% PvP Tenacity",
          "3 Piece Set Bonus": "+5% PvP Damage",
          "4 Piece Set Bonus": "+5% Critical Resistance"
        }
      },
      {
        name: "Champion's Hat",
        level: 7,
        description: "Forged from purified metal, this armor protects those who have triumphed over corrupted ruins.",
        set: "PvP Set P1",
        stats: {
          Class: "Mage",
          Defense: "+2",
          Health: "+9",
          "Rune Slots": "1",
          "2 Piece Set Bonus": "+5% PvP Reduction, +5% PvP Tenacity",
          "3 Piece Set Bonus": "+5% PvP Damage",
          "4 Piece Set Bonus": "+5% Critical Resistance"
        }
      },
      {
        name: "Champion's Breastplate",
        level: 7,
        description: "Forged from purified metal, this armor protects those who have triumphed over corrupted ruins.",
        set: "PvP Set P1",
        stats: {
          Class: "Mage",
          Defense: "+5",
          Health: "+13",
          "Rune Slots": "2",
          "2 Piece Set Bonus": "+5% PvP Reduction, +5% PvP Tenacity",
          "3 Piece Set Bonus": "+5% PvP Damage",
          "4 Piece Set Bonus": "+5% Critical Resistance"
        }
      },
      {
        name: "Champion's Leggings",
        level: 7,
        description: "Forged from purified metal, this armor protects those who have triumphed over corrupted ruins.",
        set: "PvP Set P1",
        stats: {
          Class: "Mage",
          Defense: "+3",
          Health: "+11",
          "2 Piece Set Bonus": "+5% PvP Reduction, +5% PvP Tenacity",
          "3 Piece Set Bonus": "+5% PvP Damage",
          "4 Piece Set Bonus": "+5% Critical Resistance"
        }
      },
      {
        name: "Champion's Boots",
        level: 7,
        description: "Forged from pure metal, this armor protects those who have triumphed over corrupted ruins.",
        set: "PvP Set P1",
        stats: {
          Class: "Mage",
          Defense: "+1",
          Health: "+8",
          "2 Piece Set Bonus": "+5% PvP Reduction, +5% PvP Tenacity",
          "3 Piece Set Bonus": "+5% PvP Damage",
          "4 Piece Set Bonus": "+5% Critical Resistance"
        }
      },
      {
        name: "Champion's Hood",
        level: 7,
        description: "Forged from purified metal, this armor protects those who have triumphed over corrupted ruins.",
        set: "PvP Set P1",
        stats: {
          Class: "Archer",
          Defense: "+2",
          Health: "+9",
          "Rune Slots": "1",
          "2 Piece Set Bonus": "+5% PvP Reduction, +5% PvP Tenacity",
          "3 Piece Set Bonus": "+5% PvP Damage",
          "4 Piece Set Bonus": "+5% Critical Resistance"
        }
      },
      {
        name: "Champion's Breastplate",
        level: 7,
        description: "Forged from purified metal, this armor protects those who have triumphed over corrupted ruins.",
        set: "PvP Set P1",
        stats: {
          Class: "Archer",
          Defense: "+5",
          Health: "+13",
          "Rune Slots": "2",
          "2 Piece Set Bonus": "+5% PvP Reduction, +5% PvP Tenacity",
          "3 Piece Set Bonus": "+5% PvP Damage",
          "4 Piece Set Bonus": "+5% Critical Resistance"
        }
      },
      {
        name: "Champion's Leggings",
        level: 7,
        description: "Forged from purified metal, this armor protects those who have triumphed over corrupted ruins.",
        set: "PvP Set P1",
        stats: {
          Class: "Archer",
          Defense: "+3",
          Health: "+11",
          "2 Piece Set Bonus": "+5% PvP Reduction, +5% PvP Tenacity",
          "3 Piece Set Bonus": "+5% PvP Damage",
          "4 Piece Set Bonus": "+5% Critical Resistance"
        }
      },
      {
        name: "Champion's Boots",
        level: 7,
        description: "Forged from pure metal, this armor protects those who have triumphed over corrupted ruins.",
        set: "PvP Set P1",
        stats: {
          Class: "Archer",
          Defense: "+1",
          Health: "+8",
          "2 Piece Set Bonus": "+5% PvP Reduction, +5% PvP Tenacity",
          "3 Piece Set Bonus": "+5% PvP Damage",
          "4 Piece Set Bonus": "+5% Critical Resistance"
        }
      },
      {
        name: "Champion's Helm",
        level: 7,
        description: "Forged from purified metal, this armor protects those who have triumphed over corrupted ruins.",
        set: "PvP Set P1",
        stats: {
          Class: "Warrior",
          Defense: "+2",
          Health: "+9",
          "Rune Slots": "1",
          "2 Piece Set Bonus": "+5% PvP Reduction, +5% PvP Tenacity",
          "3 Piece Set Bonus": "+5% PvP Damage",
          "4 Piece Set Bonus": "+5% Critical Resistance"
        }
      },
      {
        name: "Champion's Breastplate",
        level: 7,
        description: "Forged from purified metal, this armor protects those who have triumphed over corrupted ruins.",
        set: "PvP Set P1",
        stats: {
          Class: "Warrior",
          Defense: "+5",
          Health: "+13",
          "Rune Slots": "2",
          "2 Piece Set Bonus": "+5% PvP Reduction, +5% PvP Tenacity",
          "3 Piece Set Bonus": "+5% PvP Damage",
          "4 Piece Set Bonus": "+5% Critical Resistance"
        }
      },
      {
        name: "Champion's Leggings",
        level: 7,
        description: "Forged from purified metal, this armor protects those who have triumphed over corrupted ruins.",
        set: "PvP Set P1",
        stats: {
          Class: "Warrior",
          Defense: "+3",
          Health: "+11",
          "2 Piece Set Bonus": "+5% PvP Reduction, +5% PvP Tenacity",
          "3 Piece Set Bonus": "+5% PvP Damage",
          "4 Piece Set Bonus": "+5% Critical Resistance"
        }
      },
      {
        name: "Champion's Boots",
        level: 7,
        description: "Forged from pure metal, this armor protects those who have triumphed over corrupted ruins.",
        set: "PvP Set P1",
        stats: {
          Class: "Warrior",
          Defense: "+1",
          Health: "+8",
          "2 Piece Set Bonus": "+5% PvP Reduction, +5% PvP Tenacity",
          "3 Piece Set Bonus": "+5% PvP Damage",
          "4 Piece Set Bonus": "+5% Critical Resistance"
        }
      },
      {
        name: "Champion's Hood",
        level: 7,
        description: "Forged from purified metal, this armor protects those who have triumphed over corrupted ruins.",
        set: "PvP Set P1",
        stats: {
          Class: "Assassin",
          Defense: "+2",
          Health: "+9",
          "Rune Slots": "1",
          "2 Piece Set Bonus": "+5% PvP Reduction, +5% PvP Tenacity",
          "3 Piece Set Bonus": "+5% PvP Damage",
          "4 Piece Set Bonus": "+5% Critical Resistance"
        }
      },
      {
        name: "Champion's Breastplate",
        level: 7,
        description: "Forged from purified metal, this armor protects those who have triumphed over corrupted ruins.",
        set: "PvP Set P1",
        stats: {
          Class: "Assassin",
          Defense: "+5",
          Health: "+13",
          "Rune Slots": "2",
          "2 Piece Set Bonus": "+5% PvP Reduction, +5% PvP Tenacity",
          "3 Piece Set Bonus": "+5% PvP Damage",
          "4 Piece Set Bonus": "+5% Critical Resistance"
        }
      },
      {
        name: "Champion's Leggings",
        level: 7,
        description: "Forged from purified metal, this armor protects those who have triumphed over corrupted ruins.",
        set: "PvP Set P1",
        stats: {
          Class: "Assassin",
          Defense: "+3",
          Health: "+11",
          "2 Piece Set Bonus": "+5% PvP Reduction, +5% PvP Tenacity",
          "3 Piece Set Bonus": "+5% PvP Damage",
          "4 Piece Set Bonus": "+5% Critical Resistance"
        }
      },
      {
        name: "Boots of the Champion",
        level: 7,
        description: "Forged from pure metal, this armor protects those who have triumphed over corrupted ruins.",
        set: "PvP Set P1",
        stats: {
          Class: "Assassin",
          Defense: "+1",
          Health: "+8",
          "2 Piece Set Bonus": "+5% PvP Reduction, +5% PvP Tenacity",
          "3 Piece Set Bonus": "+5% PvP Damage",
          "4 Piece Set Bonus": "+5% Critical Resistance"
        }
      },
      /* --- Normal armor, exactly as supplied -------------------------------------------------
         Levels 3, 7 and 9 for the Warrior, Assassin, Archer, Mage and Shaman. The item name is kept
         verbatim, including the "(Warrior)"-style class qualifier the source uses for the sets that
         exist for more than one class, and the slot is derived from that name (a Breastplate or
         Chestplate is a Chestplate, a Tunic or Robe is a Chestplate, Sandals are Boots). "Rune
         Slots" is carried only when the source gives the item at least one, matching the Beta
         schema, where the key is absent for an item with no rune slot; the count the source
         supplies (1 for the level 9 chestplates and leggings, 0 for everything else) is what the
         adapter reports. Set tiers keep the source's own wording inside the existing "N Piece Set
         Bonus" keys, with the effects of one tier comma-separated when the source lists two of them
         at the same piece count (the Sorcerer's 3-piece tier). No rarity, cost, drop source or
         bonus is invented, and no missing piece is added. */
      {
        name: "Ika Breastplate",
        level: 3,
        description: "Carved from the shell of the ancient Ika turtles, it absorbs the initial blows.",
        set: "Ika Set",
        stats: {
          Class: "Warrior",
          Defense: "+2",
          Health: "+12",
          "2 Piece Set Bonus": "+0.5 Stamina",
          "3 Piece Set Bonus": "+0.5 Health"
        }
      },
      {
        name: "Ika Leggings",
        level: 3,
        description: "Carved from the shell of the ancient Ika turtles, they absorb the initial blows.",
        set: "Ika Set",
        stats: {
          Class: "Warrior",
          Defense: "+1",
          Health: "+7",
          "2 Piece Set Bonus": "+0.5 Stamina",
          "3 Piece Set Bonus": "+0.5 Health"
        }
      },
      {
        name: "Ika Boots",
        level: 3,
        description: "Carved from the shell of the ancient Ika turtles, they absorb the initial blows.",
        set: "Ika Set",
        stats: {
          Class: "Warrior",
          Defense: "+1",
          Health: "+5",
          "2 Piece Set Bonus": "+0.5 Stamina",
          "3 Piece Set Bonus": "+0.5 Health"
        }
      },
      {
        name: "Protector's Helmet (Warrior)",
        level: 7,
        description: "Forged in Tolbana's forge, it makes the warrior an impenetrable wall.",
        set: "Protector's Set",
        stats: {
          Class: "Warrior",
          Defense: "+1",
          Health: "+6",
          "2 Piece Set Bonus": "+1 Max Stamina",
          "3 Piece Set Bonus": "+0.1 Health/s",
          "4 Piece Set Bonus": "+1% Block Chance"
        }
      },
      {
        name: "Protector's Breastplate (Warrior)",
        level: 7,
        description: "Forged in Tolbana's forge, it makes the warrior an impenetrable wall.",
        set: "Protector's Set",
        stats: {
          Class: "Warrior",
          Defense: "+2",
          Health: "+16",
          "2 Piece Set Bonus": "+1 Max Stamina",
          "3 Piece Set Bonus": "+0.1 Health/s",
          "4 Piece Set Bonus": "+1% Block Chance"
        }
      },
      {
        name: "Protector's Leggings (Warrior)",
        level: 7,
        description: "Forged in Tolbana's forge, it makes the warrior an impenetrable wall.",
        set: "Protector's Set",
        stats: {
          Class: "Warrior",
          Defense: "+2",
          Health: "+12",
          "2 Piece Set Bonus": "+1 Max Stamina",
          "3 Piece Set Bonus": "+0.1 Health/s",
          "4 Piece Set Bonus": "+1% Block Chance"
        }
      },
      {
        name: "Protector's Boots (Warrior)",
        level: 7,
        description: "Forged in Tolbana's forge, it makes the warrior an impenetrable wall.",
        set: "Protector's Set",
        stats: {
          Class: "Warrior",
          Defense: "+1",
          Health: "+6",
          "2 Piece Set Bonus": "+1 Max Stamina",
          "3 Piece Set Bonus": "+0.1 Health/s",
          "4 Piece Set Bonus": "+1% Block Chance"
        }
      },
      {
        name: "Guardian's Helmet (Warrior)",
        level: 9,
        description: "Replica of the Guardian's Armor. Fallen: Heavy and unshakeable, it defies death itself.",
        set: "Guardian Set",
        stats: {
          Class: "Warrior",
          Defense: "+1",
          Health: "+7",
          "2 Piece Set Bonus": "+1.5 Max Stamina",
          "3 Piece Set Bonus": "+0.15 Health/s",
          "4 Piece Set Bonus": "+2% Block Chance"
        }
      },
      {
        name: "Guardian's Chestplate (Warrior)",
        level: 9,
        description: "Replica of the Guardian's Armor. Fallen: Heavy and unshakeable, it defies death itself.",
        set: "Guardian Set",
        stats: {
          Class: "Warrior",
          Defense: "+4",
          Health: "+20",
          "Rune Slots": "1",
          "2 Piece Set Bonus": "+1.5 Max Stamina",
          "3 Piece Set Bonus": "+0.15 Health/s",
          "4 Piece Set Bonus": "+2% Block Chance"
        }
      },
      {
        name: "Guardian's Leggings (Warrior)",
        level: 9,
        description: "Replica of the Guardian's Armor. Fallen: Heavy and unshakeable, it defies death itself.",
        set: "Guardian Set",
        stats: {
          Class: "Warrior",
          Defense: "+3",
          Health: "+14",
          "Rune Slots": "1",
          "2 Piece Set Bonus": "+1.5 Max Stamina",
          "3 Piece Set Bonus": "+0.15 Health/s",
          "4 Piece Set Bonus": "+2% Block Chance"
        }
      },
      {
        name: "Guardian's Boots (Warrior)",
        level: 9,
        description: "Replica of the Guardian's Armor. Fallen: Heavy and unshakeable, it defies death itself.",
        set: "Guardian Set",
        stats: {
          Class: "Warrior",
          Defense: "+1",
          Health: "+7",
          "2 Piece Set Bonus": "+1.5 Max Stamina",
          "3 Piece Set Bonus": "+0.15 Health/s",
          "4 Piece Set Bonus": "+2% Block Chance"
        }
      },
      {
        name: "Tactical Chestplate",
        level: 3,
        description: "Dark leather and silent soles, designed to approach silently and strike from behind.",
        set: "Stealth Set",
        stats: {
          Class: "Assassin",
          Defense: "+2",
          Health: "+9",
          "2 Piece Set Bonus": "+2% Dodge Chance",
          "3 Piece Set Bonus": "+1% Critical Damage"
        }
      },
      {
        name: "Tactical Leggings",
        level: 3,
        description: "Dark leather and silent soles, designed for approaching silently and striking from behind.",
        set: "Stealth Set",
        stats: {
          Class: "Assassin",
          Defense: "+1",
          Health: "+5",
          "2 Piece Set Bonus": "+2% Dodge Chance",
          "3 Piece Set Bonus": "+1% Critical Damage"
        }
      },
      {
        name: "Tactical Boots",
        level: 3,
        description: "Dark leather and silent soles, designed for approaching silently and striking from behind.",
        set: "Stealth Set",
        stats: {
          Class: "Assassin",
          Defense: "+1",
          Health: "+4",
          "2 Piece Set Bonus": "+2% Dodge Chance",
          "3 Piece Set Bonus": "+1% Critical Damage"
        }
      },
      {
        name: "Ninja Tunic (Assassin)",
        level: 7,
        description: "Light as a shadow, it embraces the assassin and steals him from death.",
        set: "Ninja Set",
        stats: {
          Class: "Assassin",
          Defense: "+3",
          Health: "+15",
          "2 Piece Set Bonus": "+3% Dodge Chance",
          "3 Piece Set Bonus": "+2% Critical Damage"
        }
      },
      {
        name: "Ninja Leggings (Assassin)",
        level: 7,
        description: "Light as a shadow, it embraces the assassin and steals him from death.",
        set: "Ninja Set",
        stats: {
          Class: "Assassin",
          Defense: "+2",
          Health: "+9",
          "2 Piece Set Bonus": "+3% Dodge Chance",
          "3 Piece Set Bonus": "+2% Critical Damage"
        }
      },
      {
        name: "Ninja Boots (Assassin)",
        level: 7,
        description: "Light as a shadow, it embraces the assassin and steals him from death.",
        set: "Ninja Set",
        stats: {
          Class: "Assassin",
          Defense: "+1",
          Health: "+6",
          "2 Piece Set Bonus": "+3% Dodge Chance",
          "3 Piece Set Bonus": "+2% Critical Damage"
        }
      },
      /* The source spells the Assassin Herald set two ways: "Stealth Herald Set" on the helmet and
         "Stealthy Herald Set" on the other three pieces. Both labels are carried exactly as given
         (the compendium shows the item's own wording) and the adapter maps them onto one canonical
         set identifier, so the four pieces still count as one set for the set-bonus engine. */
      {
        name: "Herald's Helmet (Assassin)",
        level: 9,
        description: "Inherited from the Fallen Herald, it becomes shadow and dagger in the hands of the assassin.",
        set: "Stealth Herald Set",
        stats: {
          Class: "Assassin",
          Defense: "+1",
          Health: "+5",
          "2 Piece Set Bonus": "+5% Dodge Chance",
          "3 Piece Set Bonus": "+3% Critical Damage",
          "4 Piece Set Bonus": "+5% Movement Speed"
        }
      },
      {
        name: "Herald's Tunic (Assassin)",
        level: 9,
        description: "Inherited from the Fallen Herald, it becomes shadow and dagger in the hands of the assassin.",
        set: "Stealthy Herald Set",
        stats: {
          Class: "Assassin",
          Defense: "+4",
          Health: "+15",
          "Rune Slots": "1",
          "2 Piece Set Bonus": "+5% Dodge Chance",
          "3 Piece Set Bonus": "+3% Critical Damage",
          "4 Piece Set Bonus": "+5% Movement Speed"
        }
      },
      {
        name: "Herald's Leggings (Assassin)",
        level: 9,
        description: "Inherited from the Fallen Herald, it becomes shadow and dagger in the hands of the assassin.",
        set: "Stealthy Herald Set",
        stats: {
          Class: "Assassin",
          Defense: "+3",
          Health: "+11",
          "Rune Slots": "1",
          "2 Piece Set Bonus": "+5% Dodge Chance",
          "3 Piece Set Bonus": "+3% Critical Damage",
          "4 Piece Set Bonus": "+5% Movement Speed"
        }
      },
      {
        name: "Herald's Boots (Assassin)",
        level: 9,
        description: "Inherited from the Fallen Herald, it becomes shadow and dagger in the hands of the assassin.",
        set: "Stealthy Herald Set",
        stats: {
          Class: "Assassin",
          Defense: "+1",
          Health: "+5",
          "2 Piece Set Bonus": "+5% Dodge Chance",
          "3 Piece Set Bonus": "+3% Critical Damage",
          "4 Piece Set Bonus": "+5% Movement Speed"
        }
      },
      {
        name: "Tactical Chestplate",
        level: 3,
        description: "Soft leather and fitted straps, designed to strike quickly and disappear before the counterattack.",
        set: "Tactical Set",
        stats: {
          Class: "Archer",
          Defense: "+2",
          Health: "+9",
          "2 Piece Set Bonus": "+0.05 Stamina/s",
          "3 Piece Set Bonus": "+0.25 Attack Damage"
        }
      },
      {
        name: "Tactical Leggings",
        level: 3,
        description: "Soft leather and fitted straps, designed to strike fast and disappear before the counterattack.",
        set: "Tactical Set",
        stats: {
          Class: "Archer",
          Defense: "+1",
          Health: "+5",
          "2 Piece Set Bonus": "+0.05 Stamina/s",
          "3 Piece Set Bonus": "+0.25 Attack Damage"
        }
      },
      {
        name: "Tactical Boots",
        level: 3,
        description: "Soft leather and fitted straps, designed to strike fast and disappear before the counterattack.",
        set: "Tactical Set",
        stats: {
          Class: "Archer",
          Defense: "+1",
          Health: "+4",
          "2 Piece Set Bonus": "+0.05 Stamina/s",
          "3 Piece Set Bonus": "+0.25 Attack Damage"
        }
      },
      {
        name: "Hunter's Tunic (Archer)",
        level: 7,
        description: "Designed for the hunt, it sharpens the archer's eye and guides their shots to the heart.",
        set: "Hunter's Set",
        stats: {
          Class: "Archer",
          Defense: "+3",
          Health: "+15",
          "2 Piece Set Bonus": "+0.1 Stamina/s",
          "3 Piece Set Bonus": "+0.5% Critical Chance"
        }
      },
      {
        name: "Hunter's Leggings (Archer)",
        level: 7,
        description: "Designed for the hunt, it sharpens the archer's eye and guides their shots to the heart.",
        set: "Hunter's Set",
        stats: {
          Class: "Archer",
          Defense: "+2",
          Health: "+9",
          "2 Piece Set Bonus": "+0.1 Stamina/s",
          "3 Piece Set Bonus": "+0.5% Critical Chance"
        }
      },
      {
        name: "Hunter's Boots (Archer)",
        level: 7,
        description: "Designed for the hunt, it sharpens the archer's eye and guides their shots to the heart.",
        set: "Hunter's Set",
        stats: {
          Class: "Archer",
          Defense: "+1",
          Health: "+6",
          "2 Piece Set Bonus": "+0.1 Stamina/s",
          "3 Piece Set Bonus": "+0.5% Critical Chance"
        }
      },
      {
        name: "Herald's Helmet (Archer)",
        level: 9,
        description: "Inherited from the Fallen Herald, light and faithful, it follows the archer into every ambush.",
        set: "Hunter Herald Set",
        stats: {
          Class: "Archer",
          Defense: "+1",
          Health: "+5",
          "2 Piece Set Bonus": "+0.15 Stamina/s",
          "3 Piece Set Bonus": "+1% Critical Chance",
          "4 Piece Set Bonus": "+0.5 Attack Damage"
        }
      },
      {
        name: "Herald's Tunic (Archer)",
        level: 9,
        description: "Inherited from the Fallen Herald, light and faithful, it follows the archer into every ambush.",
        set: "Hunter Herald Set",
        stats: {
          Class: "Archer",
          Defense: "+4",
          Health: "+15",
          "Rune Slots": "1",
          "2 Piece Set Bonus": "+0.15 Stamina/s",
          "3 Piece Set Bonus": "+1% Critical Chance",
          "4 Piece Set Bonus": "+0.5 Attack Damage"
        }
      },
      {
        name: "Herald's Leggings (Archer)",
        level: 9,
        description: "Inherited from the Fallen Herald, light and faithful, it follows the archer into every ambush.",
        set: "Hunter Herald Set",
        stats: {
          Class: "Archer",
          Defense: "+3",
          Health: "+11",
          "Rune Slots": "1",
          "2 Piece Set Bonus": "+0.15 Stamina/s",
          "3 Piece Set Bonus": "+1% Critical Chance",
          "4 Piece Set Bonus": "+0.5 Attack Damage"
        }
      },
      {
        name: "Herald's Boots (Archer)",
        level: 9,
        description: "Inherited from the Fallen Herald, light and faithful, it follows the archer into every ambush.",
        set: "Hunter Herald Set",
        stats: {
          Class: "Archer",
          Defense: "+1",
          Health: "+5",
          "2 Piece Set Bonus": "+0.15 Stamina/s",
          "3 Piece Set Bonus": "+1% Critical Chance",
          "4 Piece Set Bonus": "+0.5 Attack Damage"
        }
      },
      {
        name: "Spectral Breastplate",
        level: 3,
        description: "Woven from a spectral veil, it channels the nascent magic of Aincrad's apprentices.",
        set: "Spectral Set",
        stats: {
          Class: "Mage",
          Defense: "+1",
          Health: "+9",
          "2 Piece Set Bonus": "+0.5 Max Mana",
          "3 Piece Set Bonus": "+0.5% Skill Critical Chance"
        }
      },
      {
        name: "Spectral Leggings",
        level: 3,
        description: "Woven from a spectral veil, it channels the nascent magic of Aincrad's apprentices.",
        set: "Spectral Set",
        stats: {
          Class: "Mage",
          Defense: "+1",
          Health: "+5",
          "2 Piece Set Bonus": "+0.5 Max Mana",
          "3 Piece Set Bonus": "+0.5% Skill Critical Chance"
        }
      },
      {
        name: "Spectral Boots",
        level: 3,
        description: "Woven from a spectral veil, it channels the nascent magic of Aincrad's apprentices.",
        set: "Spectral Set",
        stats: {
          Class: "Mage",
          Defense: "+1",
          Health: "+4",
          "2 Piece Set Bonus": "+0.5 Max Mana",
          "3 Piece Set Bonus": "+0.5% Skill Critical Chance"
        }
      },
      /* The source lists two effects for the Sorcerer's 3-piece tier, so both live in the one
         "3 Piece Set Bonus" value, comma-separated like the Beta data does. */
      {
        name: "Sorcerer's Robe (Mage)",
        level: 7,
        description: "Embroidered with enchanted threads, it amplifies the mage's spells like a sorcerer of old.",
        set: "Sorcerer's Set",
        stats: {
          Class: "Mage",
          Defense: "+3",
          Health: "+15",
          "2 Piece Set Bonus": "+0.15 Mana/s",
          "3 Piece Set Bonus": "+1 Bonus Healing, +2% Ability Haste"
        }
      },
      {
        name: "Sorcerer's Leggings (Mage)",
        level: 7,
        description: "Embroidered with enchanted threads, it amplifies the mage's spells like a sorcerer of old.",
        set: "Sorcerer's Set",
        stats: {
          Class: "Mage",
          Defense: "+2",
          Health: "+9",
          "2 Piece Set Bonus": "+0.15 Mana/s",
          "3 Piece Set Bonus": "+1 Bonus Healing, +2% Ability Haste"
        }
      },
      {
        name: "Sorcerer's Sandals (Mage)",
        level: 7,
        description: "Embroidered with enchanted threads, they amplify the mage's spells like those of a sorcerer of old.",
        set: "Sorcerer's Set",
        stats: {
          Class: "Mage",
          Defense: "+1",
          Health: "+6",
          "2 Piece Set Bonus": "+0.15 Mana/s",
          "3 Piece Set Bonus": "+1 Bonus Healing, +2% Ability Haste"
        }
      },
      {
        name: "Reaper's Helmet (Mage)",
        level: 9,
        description: "A replica of the Fallen Reaper, it amplifies spell power tenfold and reaps the enemy from afar.",
        set: "Mystic Reaper Set",
        stats: {
          Class: "Mage",
          Defense: "+1",
          Health: "+5",
          "2 Piece Set Bonus": "+1.5 Max Mana",
          "3 Piece Set Bonus": "+1.5% Skill Critical Chance",
          "4 Piece Set Bonus": "+1% Skill Critical Damage"
        }
      },
      {
        name: "Reaper's Chestplate (Mage)",
        level: 9,
        description: "A replica of the Fallen Reaper, it amplifies spell power tenfold and reaps the enemy from afar.",
        set: "Mystic Reaper Set",
        stats: {
          Class: "Mage",
          Defense: "+4",
          Health: "+15",
          "Rune Slots": "1",
          "2 Piece Set Bonus": "+1.5 Max Mana",
          "3 Piece Set Bonus": "+1.5% Skill Critical Chance",
          "4 Piece Set Bonus": "+1% Skill Critical Damage"
        }
      },
      {
        name: "Reaper's Leggings (Mage)",
        level: 9,
        description: "A replica of the Fallen Reaper, it amplifies spell power tenfold and reaps the enemy from afar.",
        set: "Mystic Reaper Set",
        stats: {
          Class: "Mage",
          Defense: "+3",
          Health: "+11",
          "Rune Slots": "1",
          "2 Piece Set Bonus": "+1.5 Max Mana",
          "3 Piece Set Bonus": "+1.5% Skill Critical Chance",
          "4 Piece Set Bonus": "+1% Skill Critical Damage"
        }
      },
      {
        name: "Reaper's Boots (Mage)",
        level: 9,
        description: "A replica of the Fallen Reaper, it amplifies spell power tenfold and reaps the enemy from afar.",
        set: "Mystic Reaper Set",
        stats: {
          Class: "Mage",
          Defense: "+1",
          Health: "+5",
          "2 Piece Set Bonus": "+1.5 Max Mana",
          "3 Piece Set Bonus": "+1.5% Skill Critical Chance",
          "4 Piece Set Bonus": "+1% Skill Critical Damage"
        }
      },
      {
        name: "Spectral Breastplate",
        level: 3,
        description: "Woven in the breath of spirits, it connects its wearer to the beasts and ancient woods of Aincrad.",
        set: "Animist Set",
        stats: {
          Class: "Shaman",
          Defense: "+2",
          Health: "+9",
          "2 Piece Set Bonus": "+0.05 Mana/s",
          "3 Piece Set Bonus": "+0.5 Bonus Healing"
        }
      },
      {
        name: "Spectral Leggings",
        level: 3,
        description: "Woven from the breath of spirits, it connects its wearer to the beasts and ancient woods of Aincrad.",
        set: "Animist Set",
        stats: {
          Class: "Shaman",
          Defense: "+2",
          Health: "+5",
          "2 Piece Set Bonus": "+0.05 Mana/s",
          "3 Piece Set Bonus": "+0.5 Bonus Healing"
        }
      },
      {
        name: "Spectral Boots",
        level: 3,
        description: "Woven in the breath of spirits, it connects its wearer to the beasts and ancient woods of Aincrad.",
        set: "Animist Set",
        stats: {
          Class: "Shaman",
          Defense: "+1",
          Health: "+4",
          "2 Piece Set Bonus": "+0.05 Mana/s",
          "3 Piece Set Bonus": "+0.5 Bonus Healing"
        }
      },
      {
        name: "Magician's Robe (Shaman)",
        level: 7,
        description: "Imbued with ancient rituals, it nourishes the shaman's mana and prolongs their incantations.",
        set: "Magician's Set",
        stats: {
          Class: "Shaman",
          Defense: "+3",
          Health: "+15",
          "2 Piece Set Bonus": "+1 Max Mana",
          "3 Piece Set Bonus": "+1% Skill Critical Chance"
        }
      },
      {
        name: "Magician's Leggings (Shaman)",
        level: 7,
        description: "Imbued with ancient rituals, it nourishes the shaman's mana and prolongs their incantations.",
        set: "Magician's Set",
        stats: {
          Class: "Shaman",
          Defense: "+2",
          Health: "+9",
          "2 Piece Set Bonus": "+1 Max Mana",
          "3 Piece Set Bonus": "+1% Skill Critical Chance"
        }
      },
      {
        name: "Magician's Sandals (Shaman)",
        level: 7,
        description: "Imbued with ancient rituals, it nourishes the shaman's mana and prolongs their incantations.",
        set: "Magician's Set",
        stats: {
          Class: "Shaman",
          Defense: "+1",
          Health: "+6",
          "2 Piece Set Bonus": "+1 Max Mana",
          "3 Piece Set Bonus": "+1% Skill Critical Chance"
        }
      },
      {
        name: "Reaper's Helmet (Shaman)",
        level: 9,
        description: "A replica of the Fallen Reaper, it floods the shaman with mana for both healing and striking.",
        set: "Attentive Reaper Set",
        stats: {
          Class: "Shaman",
          Defense: "+1",
          Health: "+5",
          "2 Piece Set Bonus": "+0.15 Mana/s",
          "3 Piece Set Bonus": "+1.5 Bonus Healing",
          "4 Piece Set Bonus": "+2% Ability Haste"
        }
      },
      {
        name: "Reaper's Chestplate (Shaman)",
        level: 9,
        description: "A replica of the Fallen Reaper, it floods the shaman with mana for both healing and striking.",
        set: "Attentive Reaper Set",
        stats: {
          Class: "Shaman",
          Defense: "+4",
          Health: "+15",
          "Rune Slots": "1",
          "2 Piece Set Bonus": "+0.15 Mana/s",
          "3 Piece Set Bonus": "+1.5 Bonus Healing",
          "4 Piece Set Bonus": "+2% Ability Haste"
        }
      },
      /* The source words the Shaman Reaper's Leggings differently from the other three pieces
         ("it grants the shaman mana" instead of "it floods the shaman with mana"); the supplied
         wording is kept as given. */
      {
        name: "Reaper's Leggings (Shaman)",
        level: 9,
        description: "A replica of the Fallen Reaper, it grants the shaman mana for both healing and striking.",
        set: "Attentive Reaper Set",
        stats: {
          Class: "Shaman",
          Defense: "+3",
          Health: "+11",
          "Rune Slots": "1",
          "2 Piece Set Bonus": "+0.15 Mana/s",
          "3 Piece Set Bonus": "+1.5 Bonus Healing",
          "4 Piece Set Bonus": "+2% Ability Haste"
        }
      },
      {
        name: "Reaper's Boots (Shaman)",
        level: 9,
        description: "A replica of the Fallen Reaper, it floods the shaman with mana for both healing and striking.",
        set: "Attentive Reaper Set",
        stats: {
          Class: "Shaman",
          Defense: "+1",
          Health: "+5",
          "2 Piece Set Bonus": "+0.15 Mana/s",
          "3 Piece Set Bonus": "+1.5 Bonus Healing",
          "4 Piece Set Bonus": "+2% Ability Haste"
        }
      }
    ],
    accessory: [
      {
        name: "Glacial Ring",
        level: 7,
        description: "A ring of frozen spirit, it sharpens magic and circulates mana",
        set: "Ice Spirits Set",
        craftingResources: [
          { item: "Glacial Magic Shard", amount: 12 },
          { item: "Frost Dust", amount: 8 },
          { item: "Col", amount: 33 }
        ],
        stats: {
          "Skill Critical Damage": "+3%",
          Defense: "+1",
          "Mana Regeneration": "+0.1/s",
          "2 Piece Set Bonus": "+1.5% Skill Critical Hit Chance",
          "3 Piece Set Bonus": "+1 Max Mana",
          "4 Piece Set Bonus": "+3% Magic Damage"
        }
      },
      {
        name: "Glacial Antenna",
        level: 7,
        description: "An antenna of crystalline frost, catching the whispers of the ice spirits",
        set: "Ice Spirits Set",
        craftingResources: [
          { item: "Glacial Magic Shard", amount: 16 },
          { item: "Col", amount: 33 }
        ],
        stats: {
          "Skill Damage": "+2%",
          "2 Piece Set Bonus": "+1.5% Skill Critical Hit Chance",
          "3 Piece Set Bonus": "+1 Max Mana",
          "4 Piece Set Bonus": "+3% Magic Damage"
        }
      },
      {
        name: "Glacial Essence",
        level: 7,
        description: "The pure essence of an ice spirit, condensed into a shard that radiates magic",
        set: "Ice Spirits Set",
        craftingResources: [
          { item: "Frost Dust", amount: 32 },
          { item: "Col", amount: 40 }
        ],
        stats: {
          "Magic Damage": "+3%",
          Health: "+3",
          "Max Mana": "+1",
          "2 Piece Set Bonus": "+1.5% Skill Critical Hit Chance",
          "3 Piece Set Bonus": "+1 Max Mana",
          "4 Piece Set Bonus": "+3% Magic Damage"
        }
      },
      {
        name: "Glacial Amulet",
        level: 7,
        description: "An amulet inhabited by a spirit of ice; it swells the mana reserve",
        set: "Ice Spirits Set",
        craftingResources: [
          { item: "Glacial Magic Shard", amount: 12 },
          { item: "Birch String", amount: 1 },
          { item: "Col", amount: 33 }
        ],
        stats: {
          "Max Mana": "+1.5",
          "2 Piece Set Bonus": "+1.5% Skill Critical Hit Chance",
          "3 Piece Set Bonus": "+1 Max Mana",
          "4 Piece Set Bonus": "+3% Magic Damage"
        }
      },
      {
        name: "Frozen Ring",
        level: 7,
        description: "A ring set with a frozen gleam, hard as pack ice, it wards off the heaviest blows",
        set: "Ice Golem Set",
        craftingResources: [
          { item: "Hard Glacial Hide", amount: 12 },
          { item: "Frost Dust", amount: 8 },
          { item: "Col", amount: 33 }
        ],
        stats: {
          Health: "+5",
          "2 Piece Set Bonus": "+5 Health",
          "3 Piece Set Bonus": "+3% Ability Haste, +0.1/s Health Regeneration",
          "4 Piece Set Bonus": "+1 Defense, +2 Health, +2% Skill Damage"
        }
      },
      {
        name: "Frozen Bracelet",
        level: 7,
        description: "A bracelet of dense ice, carved from the golem, it hardens the guard",
        set: "Ice Golem Set",
        craftingResources: [
          { item: "Hard Glacial Hide", amount: 16 },
          { item: "Col", amount: 33 }
        ],
        stats: {
          Defense: "+2",
          Health: "+1",
          "Max Stamina": "+1",
          "2 Piece Set Bonus": "+5 Health",
          "3 Piece Set Bonus": "+3% Ability Haste, +0.1/s Health Regeneration",
          "4 Piece Set Bonus": "+1 Defense, +2 Health, +2% Skill Damage"
        }
      },
      {
        name: "Frozen Gloves",
        level: 7,
        description: "Gloves of compact frost, torn from the ice golem, they freeze the slightest wound",
        set: "Ice Golem Set",
        craftingResources: [
          { item: "Hard Glacial Hide", amount: 12 },
          { item: "Col", amount: 30 }
        ],
        stats: {
          Defense: "+2",
          Health: "+3",
          "2 Piece Set Bonus": "+5 Health",
          "3 Piece Set Bonus": "+3% Ability Haste, +0.1/s Health Regeneration",
          "4 Piece Set Bonus": "+1 Defense, +2 Health, +2% Skill Damage"
        }
      },
      {
        name: "Frozen Amulet",
        level: 7,
        description: "An amulet of eternal ice, it exudes a cold that slowly mends flesh",
        set: "Ice Golem Set",
        craftingResources: [
          { item: "Hard Glacial Hide", amount: 8 },
          { item: "Birch String", amount: 1 },
          { item: "Col", amount: 30 }
        ],
        stats: {
          "Max Stamina": "+1",
          "Health Regeneration": "+0.1/s",
          "2 Piece Set Bonus": "+5 Health",
          "3 Piece Set Bonus": "+3% Ability Haste, +0.1/s Health Regeneration",
          "4 Piece Set Bonus": "+1 Defense, +2 Health, +2% Skill Damage"
        }
      },
      {
        name: "Bracelet of the Stags",
        level: 7,
        description: "A bracelet made from stag hides",
        set: "Peaceful Deer Set",
        craftingResources: [
          { item: "Mountain Stag Hide", amount: 12 },
          { item: "Col", amount: 33 }
        ],
        stats: {
          "Bonus Healing": "+1.5",
          "2 Piece Set Bonus": "+1 Bonus Healing",
          "3 Piece Set Bonus": "+2 Max Mana"
        }
      },
      {
        name: "Gloves of the Stags",
        level: 7,
        description: "Gloves made from stag hides",
        set: "Peaceful Deer Set",
        craftingResources: [
          { item: "Mountain Stag Hide", amount: 12 },
          { item: "Col", amount: 33 }
        ],
        stats: {
          "Mana Regeneration": "+0.2/s",
          "Bonus Healing": "+0.5",
          "2 Piece Set Bonus": "+1 Bonus Healing",
          "3 Piece Set Bonus": "+2 Max Mana"
        }
      },
      {
        name: "Ring of the Shark",
        level: 7,
        description: "A ring adorned with a shark's tooth, sharp and voracious, it inflicts physical blows",
        set: "Shark Set",
        craftingResources: [
          { item: "Shark Carapace", amount: 8 },
          { item: "Col", amount: 30 }
        ],
        stats: {
          "Physical Damage": "+2%",
          "2 Piece Set Bonus": "+5% Ability Haste",
          "3 Piece Set Bonus": "+3 Health",
          "4 Piece Set Bonus": "+3% Physical Damage"
        }
      },
      {
        name: "Shark Amulet",
        level: 7,
        description: "An amulet of shark teeth, a raw trophy of a hunter from the deep abyss",
        set: "Shark Set",
        craftingResources: [
          { item: "Shark Carapace", amount: 8 },
          { item: "Birch String", amount: 1 },
          { item: "Col", amount: 30 }
        ],
        stats: {
          "Attack Damage": "+0.75",
          "2 Piece Set Bonus": "+5% Ability Haste",
          "3 Piece Set Bonus": "+3 Health",
          "4 Piece Set Bonus": "+3% Physical Damage"
        }
      },
      {
        name: "Shark Fang",
        level: 7,
        description: "A still-sharp shark fang, a trophy of a predator of the abyss, it bites as hard as its master",
        set: "Shark Set",
        craftingResources: [
          { item: "Shark Carapace", amount: 12 },
          { item: "Wolf Fangs", amount: 8 },
          { item: "Col", amount: 33 }
        ],
        stats: {
          "Attack Damage": "+1",
          "2 Piece Set Bonus": "+5% Ability Haste",
          "3 Piece Set Bonus": "+3 Health",
          "4 Piece Set Bonus": "+3% Physical Damage"
        }
      },
      {
        name: "Bracelet of the Shark",
        level: 7,
        description: "A bracelet of shark skin, sturdy and greedy, it returns life stolen from enemies",
        set: "Shark Set",
        craftingResources: [
          { item: "Shark Carapace", amount: 12 },
          { item: "Iron Ingot", amount: 1 },
          { item: "Col", amount: 33 }
        ],
        stats: {
          "Life Steal": "+3%",
          Health: "+3",
          "2 Piece Set Bonus": "+5% Ability Haste",
          "3 Piece Set Bonus": "+3 Health",
          "4 Piece Set Bonus": "+3% Physical Damage"
        }
      },
      {
        name: "Slimy Ring",
        level: 4,
        description: "A ring of alloy and jelly, slimy yet solid between the fingers",
        set: "Little Slime Set",
        craftingResources: [
          { item: "Slime Jelly", amount: 8 },
          { item: "Col", amount: 25 }
        ],
        stats: {
          Health: "+1",
          "Max Mana": "+0.5",
          "Max Stamina": "+0.5",
          "2 Piece Set Bonus": "+2 Health",
          "3 Piece Set Bonus": "+0.05/s Health Regeneration, +0.05/s Mana Regeneration, +0.05/s Stamina Regeneration",
          "4 Piece Set Bonus": "+5% Cooldown Reduction"
        }
      },
      {
        name: "Gelatinous Bracelet",
        level: 4,
        description: "A band of iron gelled by a slime essence, supple and regenerating",
        set: "Little Slime Set",
        craftingResources: [
          { item: "Slime Jelly", amount: 12 },
          { item: "Slime Core", amount: 4 },
          { item: "Col", amount: 28 }
        ],
        stats: {
          Health: "+1",
          "Health Regeneration": "+0.05/s",
          "Mana Regeneration": "+0.05/s",
          "Stamina Regeneration": "+0.05/s",
          "2 Piece Set Bonus": "+2 Health",
          "3 Piece Set Bonus": "+0.05/s Health Regeneration, +0.05/s Mana Regeneration, +0.05/s Stamina Regeneration",
          "4 Piece Set Bonus": "+5% Cooldown Reduction"
        }
      },
      {
        name: "Gelatinous Amulet",
        level: 4,
        description: "An iron amulet melted with a slime essence, slimy to the touch",
        set: "Little Slime Set",
        craftingResources: [
          { item: "Oak String", amount: 1 },
          { item: "Slime Jelly", amount: 8 },
          { item: "Col", amount: 25 }
        ],
        stats: {
          "Bonus Healing": "+0.5",
          "2 Piece Set Bonus": "+2 Health",
          "3 Piece Set Bonus": "+0.05/s Health Regeneration, +0.05/s Mana Regeneration, +0.05/s Stamina Regeneration",
          "4 Piece Set Bonus": "+5% Cooldown Reduction"
        }
      },
      /* The Gelatinous Cloak, forged at the secret equipment location this update adds. The supplied
         category (Artifacts [F1]) maps onto the existing schema as the floor 1 accessory bucket and
         the Artifact slot the name derives. The item keeps the Little Slime Set identity and repeats
         that set's own tiered bonuses, so its bonuses are the same ones the set's other pieces carry.
         Only the supplied values are carried: the item stats, the set bonuses and the three supplied
         ingredients, exactly as named. No Col cost, rarity or extra stat is invented for it. */
      {
        name: "Gelatinous Cloak",
        level: 7,
        description: "A gelatinous cloak fished out of the castle sewers; strangely alive",
        set: "Little Slime Set",
        craftingLocation: "Secret Gelatinous Cloak",
        craftingResources: [
          { item: "Stolen Cloak", amount: 1 },
          { item: "Essence Slime", amount: 1 },
          { item: "Tear Slime", amount: 1 }
        ],
        stats: {
          "Ability Haste": "+5%",
          Health: "+3",
          "Bonus Healing": "+1",
          "2 Piece Set Bonus": "+2 Health",
          "3 Piece Set Bonus": "+0.05/s Health Regeneration, +0.05/s Mana Regeneration, +0.05/s Stamina Regeneration",
          "4 Piece Set Bonus": "+5% Cooldown Reduction"
        }
      },
      {
        name: "Spider Ring",
        level: 6,
        description: "A ring of hardened silk, light as a thread, it makes movements more elusive",
        set: "Spider Set",
        craftingResources: [
          { item: "Spider Cloth", amount: 8 },
          { item: "Coal Ore", amount: 8 },
          { item: "Col", amount: 30 }
        ],
        stats: {
          "Critical Damage": "+2%",
          Dodge: "+1%",
          "2 Piece Set Bonus": "+2.5% Movement Speed",
          "3 Piece Set Bonus": "+0.025 Attack Speed",
          "4 Piece Set Bonus": "+2.5% Dodge Chance",
          "5 Piece Set Bonus": "+0.25 Attack Damage, +1% Critical Hit Chance"
        }
      },
      {
        name: "Spider Bracelet",
        level: 6,
        description: "Woven from spider silk and steeped in corrupted spores",
        set: "Spider Set",
        craftingResources: [
          { item: "Spider Cloth", amount: 8 },
          { item: "Corrupted Spore", amount: 8 },
          { item: "Col", amount: 30 }
        ],
        stats: {
          Dodge: "+1%",
          Health: "+2",
          "2 Piece Set Bonus": "+2.5% Movement Speed",
          "3 Piece Set Bonus": "+0.025 Attack Speed",
          "4 Piece Set Bonus": "+2.5% Dodge Chance",
          "5 Piece Set Bonus": "+0.25 Attack Damage, +1% Critical Hit Chance"
        }
      },
      {
        name: "Spider Gloves",
        level: 6,
        description: "Clad gloves of chitin, they strike with the fury of a starving spider",
        set: "Spider Set",
        craftingResources: [
          { item: "Spider Cloth", amount: 8 },
          { item: "Spider Thread", amount: 8 },
          { item: "Col", amount: 30 }
        ],
        stats: {
          "Critical Damage": "+2%",
          Dodge: "+0.5%",
          "2 Piece Set Bonus": "+2.5% Movement Speed",
          "3 Piece Set Bonus": "+0.025 Attack Speed",
          "4 Piece Set Bonus": "+2.5% Dodge Chance",
          "5 Piece Set Bonus": "+0.25 Attack Damage, +1% Critical Hit Chance"
        }
      },
      {
        name: "Spider Cloak",
        level: 6,
        description: "A cloak woven from spider silk, resistant and supple, it protects without hindering",
        set: "Spider Set",
        craftingResources: [
          { item: "Spider Cloth", amount: 12 },
          { item: "Spider Thread", amount: 8 },
          { item: "Col", amount: 33 }
        ],
        stats: {
          "Attack Damage": "+0.5",
          Dodge: "+1%",
          "2 Piece Set Bonus": "+2.5% Movement Speed",
          "3 Piece Set Bonus": "+0.025 Attack Speed",
          "4 Piece Set Bonus": "+2.5% Dodge Chance",
          "5 Piece Set Bonus": "+0.25 Attack Damage, +1% Critical Hit Chance"
        }
      },
      {
        name: "Iron Ring",
        level: 5,
        description: "Cut from raw iron, this ring is valued for its sturdiness more than its appearance",
        set: "Iron Set",
        craftingResources: [
          { item: "Iron Ingot", amount: 1 },
          { item: "Col", amount: 30 }
        ],
        stats: {
          "Critical Hit Chance": "+1%",
          "Skill Critical Hit Chance": "+1%",
          Health: "+1",
          "2 Piece Set Bonus": "+3% Movement Speed",
          "3 Piece Set Bonus": "+0.1/s Health Regeneration, +0.1/s Mana Regeneration, +0.1/s Stamina Regeneration",
          "4 Piece Set Bonus": "+2% Magic Damage, +2% Physical Damage, +2% Projectile Damage",
          "5 Piece Set Bonus": "+2 Health, +2 Defense"
        }
      },
      {
        name: "Iron Bracelet",
        level: 5,
        description: "A simple band of iron, forged to protect the wrist or complete a rudimentary set",
        set: "Iron Set",
        craftingResources: [
          { item: "Iron Ingot", amount: 1 },
          { item: "Col", amount: 30 }
        ],
        stats: {
          "Critical Damage": "+1%",
          "Skill Critical Damage": "+1%",
          Health: "+1",
          "2 Piece Set Bonus": "+3% Movement Speed",
          "3 Piece Set Bonus": "+0.1/s Health Regeneration, +0.1/s Mana Regeneration, +0.1/s Stamina Regeneration",
          "4 Piece Set Bonus": "+2% Magic Damage, +2% Physical Damage, +2% Projectile Damage",
          "5 Piece Set Bonus": "+2 Health, +2 Defense"
        }
      },
      {
        name: "Iron Gloves",
        level: 5,
        description: "A pair of gloves in polished iron, with cold reflections and a solidly forged look",
        set: "Iron Set",
        craftingResources: [
          { item: "Iron Ingot", amount: 1 },
          { item: "Col", amount: 30 }
        ],
        stats: {
          Defense: "+1.5",
          Health: "+1",
          "2 Piece Set Bonus": "+3% Movement Speed",
          "3 Piece Set Bonus": "+0.1/s Health Regeneration, +0.1/s Mana Regeneration, +0.1/s Stamina Regeneration",
          "4 Piece Set Bonus": "+2% Magic Damage, +2% Physical Damage, +2% Projectile Damage",
          "5 Piece Set Bonus": "+2 Health, +2 Defense"
        }
      },
      {
        name: "Iron Coin",
        level: 5,
        description: "A simple piece of ancient iron, forged on floor 1.",
        set: "Iron Set",
        craftingResources: [
          { item: "Iron Ingot", amount: 1 },
          { item: "Col", amount: 30 }
        ],
        stats: {
          "Attack Damage": "+0.5",
          Health: "+1",
          "Bonus Healing": "+1",
          "2 Piece Set Bonus": "+3% Movement Speed",
          "3 Piece Set Bonus": "+0.1/s Health Regeneration, +0.1/s Mana Regeneration, +0.1/s Stamina Regeneration",
          "4 Piece Set Bonus": "+2% Magic Damage, +2% Physical Damage, +2% Projectile Damage",
          "5 Piece Set Bonus": "+2 Health, +2 Defense"
        }
      },
      {
        name: "Iron Amulet",
        level: 5,
        description: "A rudimentary amulet, forged from raw iron. Nothing magical, just sheer sturdiness",
        set: "Iron Set",
        craftingResources: [
          { item: "Iron Ingot", amount: 1 },
          { item: "Iron String", amount: 1 },
          { item: "Col", amount: 30 }
        ],
        stats: {
          Health: "+1",
          "Max Mana": "+1",
          "Max Stamina": "+1",
          "2 Piece Set Bonus": "+3% Movement Speed",
          "3 Piece Set Bonus": "+0.1/s Health Regeneration, +0.1/s Mana Regeneration, +0.1/s Stamina Regeneration",
          "4 Piece Set Bonus": "+2% Magic Damage, +2% Physical Damage, +2% Projectile Damage",
          "5 Piece Set Bonus": "+2 Health, +2 Defense"
        }
      },
      {
        name: "Copper Ring",
        level: 3,
        description: "A ring of polished copper, light and conductive, the foundation of any adventurer",
        set: "Copper Set",
        craftingResources: [
          { item: "Copper Ingot", amount: 1 },
          { item: "Col", amount: 25 }
        ],
        stats: {
          "Critical Hit Chance": "+0.5%",
          "Skill Critical Hit Chance": "+0.5%",
          Health: "+0.5",
          "2 Piece Set Bonus": "+2.5% Movement Speed",
          "3 Piece Set Bonus": "+0.05/s Health Regeneration, +0.05/s Mana Regeneration, +0.05/s Stamina Regeneration",
          "4 Piece Set Bonus": "+1% Magic Damage, +1% Physical Damage, +1% Projectile Damage",
          "5 Piece Set Bonus": "+1 Health, +1 Defense"
        }
      },
      {
        name: "Copper Bracelet",
        level: 3,
        description: "A simple copper bracelet, forged on the first floor, modest but reliable",
        set: "Copper Set",
        craftingResources: [
          { item: "Copper Ingot", amount: 1 },
          { item: "Col", amount: 25 }
        ],
        stats: {
          "Critical Damage": "+0.5%",
          "Skill Critical Damage": "+0.5%",
          Health: "+0.5",
          "2 Piece Set Bonus": "+2.5% Movement Speed",
          "3 Piece Set Bonus": "+0.05/s Health Regeneration, +0.05/s Mana Regeneration, +0.05/s Stamina Regeneration",
          "4 Piece Set Bonus": "+1% Magic Damage, +1% Physical Damage, +1% Projectile Damage",
          "5 Piece Set Bonus": "+1 Health, +1 Defense"
        }
      },
      {
        name: "Copper Gloves",
        level: 3,
        description: "Gloves of hammered copper, with warm reflections, solid without being heavy",
        set: "Copper Set",
        craftingResources: [
          { item: "Copper Ingot", amount: 1 },
          { item: "Col", amount: 25 }
        ],
        stats: {
          Defense: "+1",
          Health: "+0.5",
          "2 Piece Set Bonus": "+2.5% Movement Speed",
          "3 Piece Set Bonus": "+0.05/s Health Regeneration, +0.05/s Mana Regeneration, +0.05/s Stamina Regeneration",
          "4 Piece Set Bonus": "+1% Magic Damage, +1% Physical Damage, +1% Projectile Damage",
          "5 Piece Set Bonus": "+1 Health, +1 Defense"
        }
      },
      {
        name: "Copper Coin",
        level: 3,
        description: "A struck copper disc, crafted on the first floor, humble but well forged",
        set: "Copper Set",
        craftingResources: [
          { item: "Copper Ingot", amount: 1 },
          { item: "Col", amount: 25 }
        ],
        stats: {
          "Attack Damage": "+0.25",
          Health: "+0.5",
          "Bonus Healing": "+0.5",
          "2 Piece Set Bonus": "+2.5% Movement Speed",
          "3 Piece Set Bonus": "+0.05/s Health Regeneration, +0.05/s Mana Regeneration, +0.05/s Stamina Regeneration",
          "4 Piece Set Bonus": "+1% Magic Damage, +1% Physical Damage, +1% Projectile Damage",
          "5 Piece Set Bonus": "+1 Health, +1 Defense"
        }
      },
      {
        name: "Copper Amulet",
        level: 3,
        description: "A copper amulet, simple and easy to wear, ideal for beginners",
        set: "Copper Set",
        craftingResources: [
          { item: "Copper Ingot", amount: 1 },
          { item: "Copper String", amount: 1 },
          { item: "Col", amount: 25 }
        ],
        stats: {
          Health: "+0.5",
          "Max Mana": "+0.5",
          "Max Stamina": "+0.5",
          "2 Piece Set Bonus": "+2.5% Movement Speed",
          "3 Piece Set Bonus": "+0.05/s Health Regeneration, +0.05/s Mana Regeneration, +0.05/s Stamina Regeneration",
          "4 Piece Set Bonus": "+1% Magic Damage, +1% Physical Damage, +1% Projectile Damage",
          "5 Piece Set Bonus": "+1 Health, +1 Defense"
        }
      },
      {
        name: "Ring of the Nepenthes",
        level: 5,
        description: "A ring girded with carnivorous petals, nourished by the mana of a voracious flower.",
        set: "Nepenthes Set",
        craftingResources: [
          { item: "Leaf Fragment", amount: 8 },
          { item: "Corrupted Spore", amount: 8 },
          { item: "Col", amount: 25 }
        ],
        stats: {
          "Max Mana": "+1",
          "2 Piece Set Bonus": "+1% Skill Critical Hit Chance",
          "3 Piece Set Bonus": "+0.5 Max Mana",
          "4 Piece Set Bonus": "+2.5% Magic Damage"
        }
      },
      {
        name: "Bracelet of the Nepenthes",
        level: 5,
        description: "Woven from carnivorous vines, it strengthens the spells and the guard of its wearer",
        set: "Nepenthes Set",
        craftingResources: [
          { item: "Leaf Fragment", amount: 12 },
          { item: "Col", amount: 28 }
        ],
        stats: {
          "Skill Damage": "+1%",
          Defense: "+2",
          "2 Piece Set Bonus": "+1% Skill Critical Hit Chance",
          "3 Piece Set Bonus": "+0.5 Max Mana",
          "4 Piece Set Bonus": "+2.5% Magic Damage"
        }
      },
      {
        name: "Amulet of the Nepenthes",
        level: 5,
        description: "An amulet brimming with sap, it sharpens magic and regenerates mana",
        set: "Nepenthes Set",
        craftingResources: [
          { item: "Leaf Fragment", amount: 4 },
          { item: "Corrupted Spore", amount: 4 },
          { item: "Oak String", amount: 1 },
          { item: "Col", amount: 25 }
        ],
        stats: {
          "Skill Critical Damage": "+2%",
          "Mana Regeneration": "+0.1/s",
          "2 Piece Set Bonus": "+1% Skill Critical Hit Chance",
          "3 Piece Set Bonus": "+0.5 Max Mana",
          "4 Piece Set Bonus": "+2.5% Magic Damage"
        }
      },
      {
        name: "Elite Gloves",
        level: 3,
        description: "Gloves sheathed in bark, cut from an elite Treant, they strike sharper",
        set: "Elite Treant Set",
        craftingResources: [
          { item: "Wolf Fur", amount: 8 },
          { item: "Col", amount: 25 }
        ],
        stats: {
          "Attack Damage": "+0.25",
          "Critical Damage": "+1%",
          "2 Piece Set Bonus": "+0.5% Critical Hit Chance",
          "3 Piece Set Bonus": "+2% Movement Speed",
          "4 Piece Set Bonus": "+5% Projectile Damage"
        }
      },
      {
        name: "Elite Amulet",
        level: 3,
        description: "An amulet of gnarled wood, taken from an elite Treant, it sustains your effort",
        set: "Elite Treant Set",
        craftingResources: [
          { item: "Oak String", amount: 1 },
          { item: "Sylvan Bark", amount: 8 },
          { item: "Col", amount: 25 }
        ],
        stats: {
          "Max Stamina": "+0.5",
          "2 Piece Set Bonus": "+0.5% Critical Hit Chance",
          "3 Piece Set Bonus": "+2% Movement Speed",
          "4 Piece Set Bonus": "+5% Projectile Damage"
        }
      },
      {
        name: "Elite Bracelet",
        level: 3,
        description: "A bracelet of lively brambles, from an elite Treant; it sharpens precision",
        set: "Elite Treant Set",
        craftingResources: [
          { item: "Oak Log", amount: 4 },
          { item: "Titan Bark", amount: 4 },
          { item: "Sylvan Bark", amount: 8 },
          { item: "Col", amount: 28 }
        ],
        stats: {
          "Critical Hit Chance": "+1%",
          "2 Piece Set Bonus": "+0.5% Critical Hit Chance",
          "3 Piece Set Bonus": "+2% Movement Speed",
          "4 Piece Set Bonus": "+5% Projectile Damage"
        }
      },
      {
        name: "Elite Carapace",
        level: 3,
        description: "A shard of bark from an elite Treant, hard as a carapace, it toughens its bearer",
        set: "Elite Treant Set",
        craftingResources: [
          { item: "Titan Bark", amount: 8 },
          { item: "Sylvan Bark", amount: 8 },
          { item: "Sylve Shoot", amount: 8 },
          { item: "Col", amount: 28 }
        ],
        stats: {
          "Attack Damage": "+0.5",
          Health: "+2",
          "2 Piece Set Bonus": "+0.5% Critical Hit Chance",
          "3 Piece Set Bonus": "+2% Movement Speed",
          "4 Piece Set Bonus": "+5% Projectile Damage"
        }
      },
      /* The Sylve Accessories set this update adds, forged at the Sylve Accessories blacksmith.
         All three pieces carry the same set label and repeat the same tiered bonuses verbatim, so the
         Character Build set-bonus engine groups them by one set identity and applies each tier once
         however many of them are equipped. The supplied category ([F1] Bracelet / Amulet / Ring)
         maps onto the floor 1 accessory bucket and the slot each name derives. Only the supplied
         stats, descriptions and ingredients are carried - the ingredient names are kept exactly as
         supplied, plural or singular as given, and no Col cost is invented. */
      {
        name: "Bracelet of the Sylvan",
        level: 3,
        description: "Woven from vines and leaves, it distills the serenity of the ancient undergrowth",
        set: "Sylvan Set",
        craftingLocation: "Sylve Accessories",
        craftingResources: [
          { item: "Oak Log", amount: 8 },
          { item: "Magic Wood Shard", amount: 8 }
        ],
        stats: {
          "Health Regeneration": "+0.05/s",
          "Mana Regeneration": "+0.05/s",
          "Stamina Regeneration": "+0.05/s",
          "2 Piece Set Bonus": "+1 Health",
          "3 Piece Set Bonus": "+0.5 Bonus Healing",
          "4 Piece Set Bonus": "+0.1/s Health Regeneration, +0.1/s Mana Regeneration, +0.1/s Stamina Regeneration"
        }
      },
      {
        name: "Amulet of the Sylvan",
        level: 3,
        description: "An amulet of carved oak, brimming with the healing sap of the forest",
        set: "Sylvan Set",
        craftingLocation: "Sylve Accessories",
        craftingResources: [
          { item: "Magic Wood Shard", amount: 8 },
          { item: "Oak String", amount: 1 }
        ],
        stats: {
          "Bonus Healing": "+0.5",
          "2 Piece Set Bonus": "+1 Health",
          "3 Piece Set Bonus": "+0.5 Bonus Healing",
          "4 Piece Set Bonus": "+0.1/s Health Regeneration, +0.1/s Mana Regeneration, +0.1/s Stamina Regeneration"
        }
      },
      {
        name: "Ring of the Sylve",
        level: 3,
        description: "A ring of oak wood, humming with the peaceful energy that flows through the sylve",
        set: "Sylvan Set",
        craftingLocation: "Sylve Accessories",
        craftingResources: [
          { item: "Magic Wood Shard", amount: 8 },
          { item: "Allium Flower", amount: 8 },
          { item: "Oak Log", amount: 4 },
          { item: "Wood Heart", amount: 1 }
        ],
        stats: {
          Health: "+2",
          "Max Mana": "+0.5",
          "Max Stamina": "+0.5",
          "2 Piece Set Bonus": "+1 Health",
          "3 Piece Set Bonus": "+0.5 Bonus Healing",
          "4 Piece Set Bonus": "+0.1/s Health Regeneration, +0.1/s Mana Regeneration, +0.1/s Stamina Regeneration"
        }
      },
      {
        name: "Bracelet of Ice",
        level: 8,
        description: "Carved from a frozen crystal, it retains the eternal cold of the ice golem",
        set: "Ice Golem Set",
        craftingResources: [
          { item: "Fragment of the Bear's Soul", amount: 3 },
          { item: "Hard Glacial Hide", amount: 24 },
          { item: "Col", amount: 45 }
        ],
        stats: {
          "Skill Damage": "+2%",
          "Ability Haste": "+2%",
          "Damage Reduction": "+2%",
          Health: "+2",
          "2 Piece Set Bonus": "+5 Health",
          "3 Piece Set Bonus": "+3% Ability Haste, +0.1/s Health Regeneration",
          "4 Piece Set Bonus": "+1 Defense, +2 Health, +2% Skill Damage"
        }
      },
      {
        name: "Necklace of Aragorn",
        level: 8,
        description:
          "A supple and solid talisman, steeped in the power of the giant spider that wards off fatal falls",
        set: "Spider Set",
        craftingResources: [
          { item: "Spider Venom", amount: 3 },
          { item: "Oak String", amount: 1 },
          { item: "Spider Thread", amount: 20 },
          { item: "Col", amount: 50 }
        ],
        stats: {
          "Attack Damage": "+0.5",
          "Fall Damage Reduction": "+15%",
          Dodge: "+5%",
          "2 Piece Set Bonus": "+2.5% Movement Speed",
          "3 Piece Set Bonus": "+0.025 Attack Speed",
          "4 Piece Set Bonus": "+2.5% Dodge Chance",
          "5 Piece Set Bonus": "+0.25 Attack Damage, +1% Critical Hit Chance"
        }
      },
      {
        name: "Sticky Ring",
        level: 5,
        description: "A ring coated in a slimy layer; Hardly elegant, but surprising",
        set: "Little Slime Set",
        craftingLocation: "Secret Sticky Ring Merchant",
        craftingResources: [
          { item: "Slime Jelly", amount: 12 },
          { item: "Essence of Gorbel", amount: 3 },
          { item: "Slime Core", amount: 8 },
          { item: "Col", amount: 35 }
        ],
        stats: {
          Defense: "+1",
          Health: "+2",
          "Bonus Healing": "+1",
          "2 Piece Set Bonus": "+2 Health",
          "3 Piece Set Bonus": "+0.05/s Health Regeneration, +0.05/s Mana Regeneration, +0.05/s Stamina Regeneration",
          "4 Piece Set Bonus": "+5% Cooldown Reduction"
        }
      },
      {
        name: "Skeleton Skull",
        level: 8,
        description:
          "This frozen skull preserves the silent echo of a dead one, the source of an occult power",
        set: "Standard Skeleton Set",
        craftingResources: [
          { item: "Reinforced Skeleton Bone", amount: 20 },
          { item: "Col", amount: 35 }
        ],
        stats: {
          "Skill Damage": "+1%",
          Health: "+5",
          "Max Mana": "+1",
          "Max Stamina": "+1",
          "Health Regeneration": "+0.05/s",
          "2 Piece Set Bonus": "+5% Ability Haste",
          "3 Piece Set Bonus": "+0.05/s Health Regeneration",
          "4 Piece Set Bonus": "-2% Damage Reduction"
        }
      },
      {
        name: "Belt of the Stags",
        level: 7,
        description: "A belt made from stag hides",
        set: "Peaceful Deer Set",
        craftingLocation: "Secret Deer Belt Merchant",
        craftingResources: [
          { item: "Mountain Stag Hide", amount: 20 },
          { item: "Col", amount: 40 }
        ],
        stats: {
          "Ability Haste": "+5%",
          Health: "+2",
          "Bonus Healing": "+0.5",
          "2 Piece Set Bonus": "+1 Bonus Healing",
          "3 Piece Set Bonus": "+2 Max Mana"
        }
      },
      {
        name: "Ring of the Leviathan",
        level: 7,
        description:
          "A ring forged in the abyss, marked with the seal of the Leviathan; it inspires power and dread",
        set: "Shark Set",
        craftingResources: [
          { item: "Shark Carapace", amount: 24 },
          { item: "Heart of Nymbrea", amount: 3 },
          { item: "Iron Ingot", amount: 1 },
          { item: "Col", amount: 55 }
        ],
        stats: {
          "Attack Damage": "+1",
          Defense: "+3",
          Health: "+5",
          "2 Piece Set Bonus": "+5% Ability Haste",
          "3 Piece Set Bonus": "+3 Health",
          "4 Piece Set Bonus": "+3% Physical Damage"
        }
      },
      /* The Gloves of the Wolves, forged by the Secret Accessory Blacksmith. The supplied category
         (Gloves [Evolving] [F1]) maps onto the existing schema as the floor 1 accessory bucket and
         the Glove slot the name derives - the schema carries no separate "evolving" flag, so none
         is invented. Only the supplied values are carried: the item stats, the set bonuses of every
         tier and the blacksmith the item names as its crafting location. No resource cost, drop
         source or extra bonus is invented for it. */
      {
        name: "Gloves of the Wolves",
        level: 5,
        description: "A pair of gloves in wolf hide, with a baleful aura that inspires bloodlust",
        set: "Weakling Wolf Set",
        craftingLocation: "Secret Accessory Blacksmith",
        stats: {
          "Critical Chance": "+1%",
          "Life Steal": "+2.5%",
          "Movement Speed": "+5%",
          "2 Piece Set Bonus": "+0.5% Critical Power",
          "3 Piece Set Bonus": "+5% Movement Speed",
          "4 Piece Set Bonus": "+0.25 Attack Damage"
        }
      },
      {
        name: "Occult Gloves",
        level: 10,
        description: "Cut from black silk blessed by the Circle, they allow runes to be traced without burns.",
        set: "Shadow Neophyte Set",
        craftingLocation: "Occult Merchant - Gloves",
        craftingResources: [{ item: "Col", amount: 5000 }],
        stats: {
          "Life Steal": "+2%",
          "Spell Vampirism": "+2%",
          Health: "+3",
          "Mana Regeneration": "+0.1/s",
          "Stamina Regeneration": "+0.1/s",
          "2 Piece Set Bonus": "-0.6/s Health Regeneration, -50% Healing Received",
          "3 Piece Set Bonus": "-0.6/s Health Regeneration",
          "4 Piece Set Bonus": "-0.6/s Health Regeneration",
          "5 Piece Set Bonus": "-0.6/s Health Regeneration",
          "6 Piece Set Bonus": "-0.6/s Health Regeneration",
          "7 Piece Set Bonus": "-0.6/s Health Regeneration"
        }
      },
      {
        name: "Occult Bracelet",
        level: 10,
        description: "Woven during a nocturnal ceremony of the Circle, it marks one's belonging to the Eclipse.",
        set: "Shadow Neophyte Set",
        craftingLocation: "Occult Merchant - Bracelet",
        craftingResources: [{ item: "Col", amount: 5000 }],
        stats: {
          Defense: "+2",
          Health: "+10",
          "2 Piece Set Bonus": "-0.6/s Health Regeneration, -50% Healing Received",
          "3 Piece Set Bonus": "-0.6/s Health Regeneration",
          "4 Piece Set Bonus": "-0.6/s Health Regeneration",
          "5 Piece Set Bonus": "-0.6/s Health Regeneration",
          "6 Piece Set Bonus": "-0.6/s Health Regeneration",
          "7 Piece Set Bonus": "-0.6/s Health Regeneration"
        }
      },
      {
        name: "Occult Ring",
        level: 10,
        description:
          "Worn by the initiates of the Circle of the Eclipse, it silently engraves the oath of the first rite.",
        set: "Shadow Neophyte Set",
        craftingLocation: "Occult Merchant - Ring",
        craftingResources: [{ item: "Col", amount: 5000 }],
        stats: {
          "Physical Damage": "+5%",
          "Magic Damage": "+5%",
          "Projectile Damage": "+5%",
          Health: "+3",
          "2 Piece Set Bonus": "-0.6/s Health Regeneration, -50% Healing Received",
          "3 Piece Set Bonus": "-0.6/s Health Regeneration",
          "4 Piece Set Bonus": "-0.6/s Health Regeneration",
          "5 Piece Set Bonus": "-0.6/s Health Regeneration",
          "6 Piece Set Bonus": "-0.6/s Health Regeneration",
          "7 Piece Set Bonus": "-0.6/s Health Regeneration"
        }
      },
      {
        name: "Occult Amulet",
        level: 10,
        description:
          "Engraved with the seal of the Circle, it awakens the senses to the hidden energies of Aincrad",
        set: "Shadow Neophyte Set",
        craftingLocation: "Occult Merchant - Amulet",
        craftingResources: [{ item: "Col", amount: 5000 }],
        stats: {
          "Critical Hit Chance": "+2%",
          "Skill Critical Hit Chance": "+2%",
          Health: "+5",
          "2 Piece Set Bonus": "-0.6/s Health Regeneration, -50% Healing Received",
          "3 Piece Set Bonus": "-0.6/s Health Regeneration",
          "4 Piece Set Bonus": "-0.6/s Health Regeneration",
          "5 Piece Set Bonus": "-0.6/s Health Regeneration",
          "6 Piece Set Bonus": "-0.6/s Health Regeneration",
          "7 Piece Set Bonus": "-0.6/s Health Regeneration"
        }
      },
      {
        name: "Occult Skull",
        level: 10,
        description: "Torn away during the last rite of the Circle, it murmurs the oaths of the vanished members.",
        set: "Shadow Neophyte Set",
        craftingLocation: "Occult Merchant - Artifacts",
        craftingResources: [{ item: "Col", amount: 5000 }],
        stats: {
          "Skill Critical Damage": "+5%",
          "Magic Damage": "+2%",
          "Max Mana": "+1",
          "2 Piece Set Bonus": "-0.6/s Health Regeneration, -50% Healing Received",
          "3 Piece Set Bonus": "-0.6/s Health Regeneration",
          "4 Piece Set Bonus": "-0.6/s Health Regeneration",
          "5 Piece Set Bonus": "-0.6/s Health Regeneration",
          "6 Piece Set Bonus": "-0.6/s Health Regeneration",
          "7 Piece Set Bonus": "-0.6/s Health Regeneration"
        }
      },
      {
        name: "Occult Robe",
        level: 10,
        description: "Woven from a cloth blessed by the Master, it hides its wearer from the eyes of the profane.",
        set: "Shadow Neophyte Set",
        craftingLocation: "Occult Merchant - Artifacts",
        craftingResources: [{ item: "Col", amount: 5000 }],
        stats: {
          "Attack Speed": "0.05/s",
          Dodge: "+2.5%",
          "Max Stamina": "+1",
          "Movement Speed": "+2.5%",
          "2 Piece Set Bonus": "-0.6/s Health Regeneration, -50% Healing Received",
          "3 Piece Set Bonus": "-0.6/s Health Regeneration",
          "4 Piece Set Bonus": "-0.6/s Health Regeneration",
          "5 Piece Set Bonus": "-0.6/s Health Regeneration",
          "6 Piece Set Bonus": "-0.6/s Health Regeneration",
          "7 Piece Set Bonus": "-0.6/s Health Regeneration"
        }
      },
      /* The Occult Hood's merchant is supplied as the Occult Merchant - Artifacts and its price as
         5000 Cols, the same merchant and price the other Shadow Neophyte pieces carry. Current Data
         still supplies no stats or description for the Hood, so none is invented. */
      {
        name: "Occult Hood",
        level: 10,
        set: "Shadow Neophyte Set",
        craftingLocation: "Occult Merchant - Artifacts",
        craftingResources: [{ item: "Col", amount: 5000 }],
        stats: {
          "2 Piece Set Bonus": "-0.6/s Health Regeneration, -50% Healing Received",
          "3 Piece Set Bonus": "-0.6/s Health Regeneration",
          "4 Piece Set Bonus": "-0.6/s Health Regeneration",
          "5 Piece Set Bonus": "-0.6/s Health Regeneration",
          "6 Piece Set Bonus": "-0.6/s Health Regeneration",
          "7 Piece Set Bonus": "-0.6/s Health Regeneration"
        }
      },
      /* The two Weakling Wolf Set accessories and the five Bandit Set accessories this update adds.
         Every supplied value is carried exactly as given: minimum level, item statistics, the
         description, the set, the set-bonus tiers, the crafting materials and the Col cost. The Col
         cost is a crafting resource named "Col", the shape every other Current accessory uses, and
         the crafting location each item names is the blacksmith that forges it. */
      {
        name: "Ring of the Wolf",
        level: 3,
        description: "A ring set with a wolf's fang, a relic of a feeble yet ferocious pack",
        set: "Weakling Wolf Set",
        craftingLocation: "Wolf Accessories",
        craftingResources: [
          { item: "Wolf Fur", amount: 16 },
          { item: "Oak Log", amount: 8 },
          { item: "Col", amount: 33 }
        ],
        stats: {
          "Attack Damage": "+0.25",
          "Max Stamina": "+0.5",
          "2 Piece Set Bonus": "+0.5% Critical Power",
          "3 Piece Set Bonus": "+5% Movement Speed",
          "4 Piece Set Bonus": "+0.25 Attack Damage"
        }
      },
      {
        name: "Albal's Necklace",
        level: 3,
        description: "Adorned with massive fangs, torn from the alpha wolf Albal, dominant predator of the wolves' valley",
        set: "Weakling Wolf Set",
        craftingLocation: "Wolf Accessories",
        craftingResources: [
          { item: "Birch String", amount: 1 },
          { item: "Fangs of Albal", amount: 4 },
          { item: "Col", amount: 33 }
        ],
        stats: {
          "Critical Damage": "+1%",
          Health: "+1",
          "Movement Speed": "+5%",
          "2 Piece Set Bonus": "+0.5% Critical Power",
          "3 Piece Set Bonus": "+5% Movement Speed",
          "4 Piece Set Bonus": "+0.25 Attack Damage"
        }
      },
      {
        name: "Bandit's Gloves",
        level: 5,
        description: "Gloves worn to a thread, marked by a thousand petty thefts and treacherous blows",
        set: "Bandit Set",
        craftingLocation: "Bandit Accessories",
        craftingResources: [{ item: "Small Purse", amount: 16 }],
        stats: {
          "Attack Speed": "+0.05/s",
          "2 Piece Set Bonus": "+1 Health, +2% Critical Power",
          "3 Piece Set Bonus": "+0.5 Attack Damage",
          "4 Piece Set Bonus": "+1% Critical Chance"
        }
      },
      {
        name: "Bandit Hood",
        level: 5,
        description: "A threadbare hood that conceals the face in the shadows of the alleys",
        set: "Bandit Set",
        craftingLocation: "Bandit Accessories",
        craftingResources: [{ item: "Small Purse", amount: 16 }],
        stats: {
          "Attack Damage": "+0.25",
          Health: "+2",
          "2 Piece Set Bonus": "+1 Health, +2% Critical Power",
          "3 Piece Set Bonus": "+0.5 Attack Damage",
          "4 Piece Set Bonus": "+1% Critical Chance"
        }
      },
      {
        name: "Stolen Amulet",
        level: 5,
        description: "An amulet plucked from a poorly guarded chest, the loot of a daring bandit",
        set: "Bandit Set",
        craftingLocation: "Bandit Accessories",
        craftingResources: [{ item: "Small Purse", amount: 24 }],
        stats: {
          "Critical Chance": "+1%",
          "Max Stamina": "+0.5",
          "2 Piece Set Bonus": "+1 Health, +2% Critical Power",
          "3 Piece Set Bonus": "+0.5 Attack Damage",
          "4 Piece Set Bonus": "+1% Critical Chance"
        }
      },
      {
        name: "Stolen Cloak",
        level: 5,
        description: "A cloak stolen from the back of a traveler; it still smells of the getaway",
        set: "Bandit Set",
        craftingLocation: "Bandit Accessories",
        craftingResources: [{ item: "Small Purse", amount: 24 }],
        stats: {
          "Attack Damage": "+1",
          "2 Piece Set Bonus": "+1 Health, +2% Critical Power",
          "3 Piece Set Bonus": "+0.5 Attack Damage",
          "4 Piece Set Bonus": "+1% Critical Chance"
        }
      },
      {
        name: "Bandit Coin",
        level: 5,
        description: "A coin snatched from a purse, the lucky charm of a thief with nimble hands",
        set: "Bandit Set",
        craftingLocation: "Bandit Accessories",
        craftingResources: [{ item: "Small Purse", amount: 24 }],
        stats: {
          "Critical Chance": "+1%",
          "2 Piece Set Bonus": "+1 Health, +2% Critical Power",
          "3 Piece Set Bonus": "+0.5 Attack Damage",
          "4 Piece Set Bonus": "+1% Critical Chance"
        }
      }
    ],
    rune: [],
    tool: [
      {
        name: "Chipped Axe",
        rarity: "Common",
        level: 1,
        description: "A rudimentary axe, fragile but sufficient to start.",
        craftingLocation: "F1 - Starting Town - Tools",
        craftingResources: [{ item: "Col", amount: 50 }],
        stats: {
          "Effect: Harvest Power": "1",
          "Effect: Sustainability": "448"
        }
      },
      {
        name: "Cracked Pickaxe",
        rarity: "Common",
        level: 1,
        description: "A rudimentary pickaxe, fragile but sufficient to start.",
        craftingLocation: "F1 - Starting Town - Tools",
        craftingResources: [{ item: "Col", amount: 50 }],
        stats: {
          "Effect: Harvest Power": "1",
          "Effect: Sustainability": "448"
        }
      },
      {
        name: "Twisted Hoe",
        rarity: "Common",
        level: 1,
        description: "A rudimentary tool for herbs and plants.",
        craftingLocation: "F1 - Starting Town - Tools",
        craftingResources: [{ item: "Col", amount: 50 }],
        stats: {
          "Effect: Sustainability": "448"
        }
      },
      {
        name: "Wooden Fishing Rod",
        rarity: "Common",
        level: 1,
        description: "A wobbly and dilapidated fishing rod, but fit for fishing.",
        craftingLocation: "F1 - Starting Town - Tools",
        craftingResources: [{ item: "Col", amount: 50 }],
        stats: {
          "Effect: Sustainability": "448"
        }
      }
    ],
    food: [
      {
        name: "Boar Meat",
        level: 1,
        description: "This fine boar meat, nice and juicy, might make you want to eat even more!",
        craftingLocation: "Starting Merchant",
        craftingResources: [{ item: "Col", amount: 1 }],
        stats: {
          "Effect: Level Required To Use Food": "1",
          "Effect: Nourriture": "5 Nourriture",
          "Effect: Recharge Nourriture": "1s"
        }
      }
    ],
    consumable: [
      {
        name: "Teleportation Crystal",
        description: "Right-click to open the floor map and travel to a discovered location.",
        craftingLocation: "Starting Merchant"
      },
      {
        name: "Health Potion I",
        level: 1,
        description: "Restores your HP immediately and applies a 15s cooldown to all healing potions.",
        craftingLocation: "Starting Merchant / Alchemist",
        craftingResources: [
          { item: "Sylve Shoot", amount: 8 },
          { item: "Allium Flower", amount: 8 },
          { item: "Col", amount: 5 }
        ],
        stats: {
          "Health Restored": "10",
          Cooldown: "15s",
          "Purchase Price": "5.02 Cols per 1",
          "Effect: Healing": "HEALING"
        }
      },
      {
        name: "Mana Potion I",
        level: 1,
        description: "Restores your mana immediately and applies a 15s cooldown to all mana potions.",
        craftingLocation: "Starting Merchant / Alchemist",
        craftingResources: [
          { item: "Soul of the Ruins", amount: 8 },
          { item: "Allium Flower", amount: 8 },
          { item: "Col", amount: 5 }
        ],
        stats: {
          "Mana Restored": "5",
          Cooldown: "15s",
          "Purchase Price": "5.02 Cols per 1",
          "Effect: Mana": "MANA"
        }
      },
      {
        name: "Stamina Potion I",
        level: 1,
        description: "Restores your stamina immediately and applies a 15s cooldown to all stamina potions.",
        craftingLocation: "Starting Merchant / Alchemist",
        craftingResources: [
          { item: "Wheat", amount: 8 },
          { item: "Allium Flower", amount: 8 },
          { item: "Col", amount: 5 }
        ],
        stats: {
          "Stamina Restored": "5",
          Cooldown: "15s",
          Unique: "Yes",
          "Purchase Price": "5.02 Cols per 1",
          "Effect: Stamina": "STAMINA"
        }
      },
      {
        name: "Quality Vitality Fortifier I",
        level: 8,
        description:
          "Boosts max health by 5 and stamina regeneration by 0.1/s for 15 minutes, then applies a 1-hour cooldown to all Fortifiers.",
        craftingResources: [
          { item: "Magic Wood Shard", amount: 16 },
          { item: "Wood Heart", amount: 2 },
          { item: "Slime Core", amount: 2 },
          { item: "Col", amount: 10 }
        ],
        stats: {
          "Increased Health": "Boosts max health by 5 for 15 minutes",
          "Increased Regeneration": "Boosts stamina regeneration by 0.1/s for 15 minutes",
          Cooldown: "3600s",
          Uses: "1"
        }
      },
      {
        name: "Quality Ferocity Fortifier I",
        level: 8,
        description:
          "Boosts attack damage by 5% and critical damage by 5% for 15 minutes, then applies a 1-hour cooldown to all Fortifiers.",
        craftingResources: [
          { item: "Wolf Fangs", amount: 16 },
          { item: "Wheat Flower", amount: 2 },
          { item: "Albal's Fangs", amount: 1 },
          { item: "Col", amount: 10 }
        ],
        stats: {
          "Increased Strength": "Boosts attack damage by 5% for 15 minutes",
          "Increased Crit": "Boosts critical damage by 5% for 15 minutes",
          Cooldown: "3600s",
          Uses: "1"
        }
      },
      {
        name: "Quality Knowledge Fortifier I",
        level: 8,
        description:
          "Boosts magic damage by 5% and critical skill by 5% for 15 minutes, then applies a 1-hour cooldown to all Fortifiers.",
        craftingResources: [
          { item: "Allium Flower", amount: 16 },
          { item: "Lavender", amount: 2 },
          { item: "Refined Allium", amount: 1 },
          { item: "Col", amount: 10 }
        ],
        stats: {
          "Increased Magic": "Boosts magic damage by 5% for 15 minutes",
          "Increased Crit": "Boosts critical skill by 5% for 15 minutes",
          Cooldown: "3600s",
          Uses: "1"
        }
      },
      {
        name: "Quality Endurance Fortifier I",
        level: 8,
        description:
          "Boosts speed by 2.5%, max mana by 2 and max endurance by 2 for 15 minutes, then applies a 1-hour cooldown to all Fortifiers.",
        craftingResources: [
          { item: "Wheat", amount: 16 },
          { item: "Wheat Leaves", amount: 2 },
          { item: "Refined Wheat", amount: 1 },
          { item: "Col", amount: 10 }
        ],
        stats: {
          "Increased Speed": "Boosts speed by 2.5% for 15 minutes",
          "Increased Mana": "Boosts max mana by 2 for 15 minutes",
          "Increased Endurance": "Boosts max endurance by 2 for 15 minutes",
          Cooldown: "3600s",
          Uses: "1"
        }
      },
      {
        name: "Quality Resistance Fortifier I",
        level: 8,
        description:
          "Boosts knockback resistance by 5%, block chance by 2% and block power by 2% for 15 minutes, then applies a 1-hour cooldown to all Fortifiers.",
        craftingResources: [
          { item: "Hard Glacial Hide", amount: 16 },
          { item: "Wisteria", amount: 2 },
          { item: "Ancestral Root", amount: 2 },
          { item: "Col", amount: 10 }
        ],
        stats: {
          "Increased Mastery": "Boosts knockback resistance by 5% for 15 minutes",
          "Increased Block": "Boosts block chance by 2% for 15 minutes",
          "Increased Tenacity": "Boosts block power by 2% for 15 minutes",
          Cooldown: "3600s",
          Uses: "1"
        }
      },
      {
        name: "Quality Patience Fortifier I",
        level: 8,
        description:
          "Boosts dodge chance by 3% and mana and stamina regeneration by 0.1/s for 15 minutes, then applies a 1-hour cooldown to all Fortifiers.",
        craftingResources: [
          { item: "Soul of the Ruins", amount: 16 },
          { item: "Glacial Magic Shard", amount: 8 },
          { item: "Fragment of the Bear's Soul", amount: 1 },
          { item: "Col", amount: 10 }
        ],
        stats: {
          "Increased Agility": "Boosts dodge chance by 3% for 15 minutes",
          "Increased Energy": "Boosts mana regeneration by 0.1/s for 15 minutes",
          "Increased Rest": "Boosts stamina regeneration by 0.1/s for 15 minutes",
          Cooldown: "3600s",
          Uses: "1"
        }
      },
      {
        name: "Healing Crystal",
        level: 10,
        description: "Restores 150 HP immediately and applies a 30-minute cooldown to all healing crystals.",
        craftingResources: [
          { item: "Ancestral Root", amount: 16 },
          { item: "Frost Dust", amount: 32 },
          { item: "Magic Mycelium", amount: 4 },
          { item: "Essence of Gorbel", amount: 1 },
          { item: "Col", amount: 50 }
        ],
        stats: {
          "Health Restored": "150",
          Cooldown: "1800s",
          Uses: "1"
        }
      },
      {
        name: "Mana Crystal",
        level: 10,
        description: "Restores 50 Mana immediately and applies a 30-minute cooldown to all restorative crystals.",
        craftingResources: [
          { item: "Ancestral Root", amount: 16 },
          { item: "Glacial Magic Shard", amount: 32 },
          { item: "Magic Mycelium", amount: 4 },
          { item: "Essence of Gorbel", amount: 1 },
          { item: "Col", amount: 50 }
        ],
        stats: {
          "Mana Restored": "50",
          Cooldown: "1800s",
          Uses: "1"
        }
      },
      {
        name: "Stamina Crystal",
        level: 10,
        description: "Restores 50 Stamina immediately and applies a 30-minute cooldown to all restorative crystals.",
        craftingResources: [
          { item: "Ancestral Root", amount: 16 },
          { item: "Hard Glacial Hide", amount: 32 },
          { item: "Magic Mycelium", amount: 4 },
          { item: "Essence of Gorbel", amount: 1 },
          { item: "Col", amount: 50 }
        ],
        stats: {
          "Stamina Restored": "50",
          Cooldown: "1800s",
          Uses: "1"
        }
      },
      {
        name: "Quality Health Potion I",
        level: 1,
        description: "Restores 12 HP immediately and applies a 15s cooldown to all healing potions.",
        craftingResources: [
          { item: "Sylve Shoot", amount: 8 },
          { item: "Allium Flower", amount: 8 },
          { item: "Col", amount: 5 }
        ],
        stats: {
          "Health Restored": "12",
          Cooldown: "15s",
          Quantity: "3x",
          "Purchase Price": "5 Cols per 1",
          "Effect: Healing": "HEALING"
        }
      },
      {
        name: "Quality Health Potion II",
        level: 5,
        description: "Restores 25 HP immediately and applies a 15s cooldown to all healing potions.",
        craftingResources: [
          { item: "Sylve Shoot", amount: 8 },
          { item: "Bone Dust", amount: 8 },
          { item: "Allium Flower", amount: 12 },
          { item: "Col", amount: 7 }
        ],
        stats: {
          "Health Restored": "25",
          Cooldown: "15s",
          Quantity: "3x",
          "Purchase Price": "10 Cols per 1",
          "Effect: Healing": "HEALING"
        }
      },
      {
        name: "Quality Health Potion III",
        level: 8,
        description: "Restores 32 HP immediately and applies a 15s cooldown to all healing potions.",
        craftingResources: [
          { item: "Sylve Shoot", amount: 8 },
          { item: "Bone Dust", amount: 8 },
          { item: "Ancestral Root", amount: 1 },
          { item: "Allium Flower", amount: 16 },
          { item: "Col", amount: 10 }
        ],
        stats: {
          "Health Restored": "32",
          Cooldown: "15s",
          Quantity: "3x",
          "Purchase Price": "15 Cols per 1",
          "Effect: Healing": "HEALING"
        }
      },
      {
        name: "Quality Mana Potion I",
        level: 1,
        description: "Restores 6 Mana immediately and applies a 15s cooldown to all mana potions.",
        craftingResources: [
          { item: "Soul of the Ruins", amount: 8 },
          { item: "Allium Flower", amount: 8 },
          { item: "Col", amount: 5 }
        ],
        stats: {
          "Mana Restored": "6",
          Cooldown: "15s",
          Quantity: "3x",
          "Purchase Price": "5 Cols per 1",
          "Effect: Mana": "MANA"
        }
      },
      {
        name: "Quality Mana Potion II",
        level: 5,
        description: "Restores 8 Mana immediately and applies a 15s cooldown to all mana potions.",
        craftingResources: [
          { item: "Soul of the Ruins", amount: 8 },
          { item: "Bone Dust", amount: 8 },
          { item: "Allium Flower", amount: 12 },
          { item: "Col", amount: 7 }
        ],
        stats: {
          "Mana Restored": "8",
          Cooldown: "15s",
          Quantity: "3x",
          "Purchase Price": "10 Cols per 1",
          "Effect: Mana": "MANA"
        }
      },
      {
        name: "Quality Mana Potion III",
        level: 8,
        description: "Restores 10 Mana immediately and applies a 15s cooldown to all mana potions.",
        craftingResources: [
          { item: "Soul of the Ruins", amount: 8 },
          { item: "Bone Dust", amount: 8 },
          { item: "Ancestral Root", amount: 1 },
          { item: "Allium Flower", amount: 16 },
          { item: "Col", amount: 10 }
        ],
        stats: {
          "Mana Restored": "10",
          Cooldown: "15s",
          Quantity: "3x",
          "Purchase Price": "15 Cols per 1",
          "Effect: Mana": "MANA"
        }
      },
      {
        name: "Quality Stamina Potion I",
        level: 1,
        description: "Restores 6 Stamina immediately and applies a 15s cooldown to all stamina potions.",
        craftingResources: [
          { item: "Wheat", amount: 8 },
          { item: "Allium Flower", amount: 8 },
          { item: "Col", amount: 5 }
        ],
        stats: {
          "Stamina Restored": "6",
          Cooldown: "15s",
          Quantity: "3x",
          "Purchase Price": "5 Cols per 1",
          "Effect: Stamina": "STAMINA"
        }
      },
      {
        name: "Quality Stamina Potion II",
        level: 5,
        description: "Restores 8 Stamina immediately and applies a 15s cooldown to all stamina potions.",
        craftingResources: [
          { item: "Wheat", amount: 8 },
          { item: "Bone Dust", amount: 8 },
          { item: "Allium Flower", amount: 12 },
          { item: "Col", amount: 7 }
        ],
        stats: {
          "Stamina Restored": "8",
          Cooldown: "15s",
          Quantity: "3x",
          "Purchase Price": "10 Cols per 1",
          "Effect: Stamina": "STAMINA"
        }
      },
      {
        name: "Quality Stamina Potion III",
        level: 8,
        description: "Restores 10 Stamina immediately and applies a 15s cooldown to all stamina potions.",
        craftingResources: [
          { item: "Wheat", amount: 8 },
          { item: "Bone Dust", amount: 8 },
          { item: "Ancestral Root", amount: 1 },
          { item: "Allium Flower", amount: 16 },
          { item: "Col", amount: 10 }
        ],
        stats: {
          "Stamina Restored": "10",
          Cooldown: "15s",
          Quantity: "3x",
          "Purchase Price": "15 Cols per 1",
          "Effect: Stamina": "STAMINA"
        }
      }
    ],
    material: [
      /* The supplied location for the Purification Elixir is the coordinate pair (1813, 4180), which
         is exactly the Current Data marker "F1 - PvP Purification Alchemist", so the elixir names
         that marker as its location. No merchant name, price or extra detail is invented. */
      {
        name: "Purification Elixir",
        description: "A cold, milky liquid, its scent evokes the sap of ancient forests.",
        craftingLocation: "F1 - PvP Purification Alchemist",
        craftingResources: [
          { item: "Ancestral Root", amount: 1 },
          { item: "Frost Dust", amount: 1 },
          { item: "Bone Dust", amount: 1 },
          { item: "Slime Core", amount: 1 }
        ]
      },
      /* The two materials the Sewer Reshaper produces, supplied as Material [F1]. The supplied
         names, descriptions and quantities are carried exactly; no Col cost, level or extra
         ingredient is invented, and the location the material is associated with is the Sewer
         Reshaper marker Aincrad/Map/maps_current.js ships. */
      {
        name: "Slime Essence",
        description: "A viscous essence made from a gelatinous mix of fluids",
        craftingLocation: "Sewer Reshaper",
        craftingResources: [
          { item: "Slime Jelly", amount: 16 },
          { item: "Essence of Gorbel", amount: 1 }
        ]
      },
      {
        name: "Slime Tear",
        description: "A gelatinous tear and particularly precious",
        craftingLocation: "Sewer Reshaper",
        craftingResources: [{ item: "Slime Core", amount: 16 }]
      }
    ],
    quest_item: [],
    resource: [],
    dungeon: [
      {
        name: "Forest Key",
        description: "Can be used to access the dungeon - Mine of Geldorak",
        craftingLocation: "F1 - Geldorack Dungeon Guard - Starting Town",
        craftingResources: [
          { item: "Sylvan Bark", amount: 8 },
          { item: "Wood Heart", amount: 4 },
          { item: "Magic Mycelium", amount: 1 },
          { item: "Col", amount: 10 }
        ]
      },
      {
        name: "Key of the Fallen",
        description: "Can be used to access the dungeon - Labyrinth of the Fallen",
        craftingLocation: "F1 - Fallen Labyrinth Dungeon Guard - Tolbana",
        craftingResources: [
          { item: "Cursed Cloth", amount: 8 },
          { item: "Leaf Fragment", amount: 8 },
          { item: "Col", amount: 20 }
        ]
      },
      {
        name: "Key of Xal'Zirith",
        description: "Can be used to access the dungeon - The Sanctuary of Xal'Zirith",
        craftingLocation: "F1 - Xal'Zirith Dungeon Guard - Candelia",
        craftingResources: [
          { item: "Spider Cloth", amount: 16 },
          { item: "Spider Thread", amount: 16 },
          { item: "Col", amount: 15 }
        ]
      },
      {
        name: "Kobold Key",
        description: "Can be used to access the Kobold Tower and the passage to Floor 2.",
        craftingLocation: "Key Blacksmith"
      }
    ],
    currency: []
  },
  floor2: {},
  floor3: {}
};
