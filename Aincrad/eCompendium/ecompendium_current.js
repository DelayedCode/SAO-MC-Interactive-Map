/* Current Data equipment - the single source of truth for every Current-Data item.
   Aincrad/eCompendium/ecompendium.js reads this object when the active dataset is "current", and
   Aincrad/Character Build/character-build-adapter.js normalizes the same object for the builder's
   "current" source, so no page keeps its own copy of an item.

   The schema is the Beta floor schema (window.FLOOR_<n>_DATA) exactly:
     name, level, description, set, craftingResources[{ item, amount }], stats
   Set bonuses use the same "N Piece Set Bonus" stat keys as Beta; the effects of one tier are
   comma-separated inside that single value (matching Beta, e.g. "+5% Magic Damage, +15 Mana").

   Rarity and craftingLocation are omitted because the supplied Current data does not provide them;
   no value is invented here. Beta Data is untouched and still lives in ecompendium_floor*.js. */
window.SAO_CURRENT_EQUIPMENT_DATA = {
  floor1: {
    weapon: [],
    armor: [],
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
          { item: "Leaf Fragments", amount: 8 },
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
          { item: "Leaf Fragments", amount: 12 },
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
          { item: "Leaf Fragments", amount: 4 },
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
          { item: "Sylve Sprout", amount: 8 },
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
        description: "A ring coated in a slimy layer; hardly elegant, but surprising",
        set: "Little Slime Set",
        craftingNote: "N/A",
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
        craftingNote: "N/A",
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
      {
        name: "Occult Gloves",
        level: 10,
        description: "Cut from black silk blessed by the Circle, they allow runes to be traced without burns.",
        set: "Shadow Neophyte Set",
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
      /* Current Data supplies no stats, description, resources or cost for the Occult Hood, so the
         entry carries only what is known: its level, its set and the set bonuses every Shadow
         Neophyte piece shares. Nothing was invented to fill the gap. */
      {
        name: "Occult Hood",
        level: 10,
        set: "Shadow Neophyte Set",
        stats: {
          "2 Piece Set Bonus": "-0.6/s Health Regeneration, -50% Healing Received",
          "3 Piece Set Bonus": "-0.6/s Health Regeneration",
          "4 Piece Set Bonus": "-0.6/s Health Regeneration",
          "5 Piece Set Bonus": "-0.6/s Health Regeneration",
          "6 Piece Set Bonus": "-0.6/s Health Regeneration",
          "7 Piece Set Bonus": "-0.6/s Health Regeneration"
        }
      },
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
        craftingResources: [{ item: "Col", amount: 5 }],
        stats: {
          "Health Restored": "10",
          Cooldown: "15s",
          "Effect: Healing": "HEALING"
        }
      },
      {
        name: "Mana Potion I",
        level: 1,
        description: "Restores your mana immediately and applies a 15s cooldown to all mana potions.",
        craftingResources: [{ item: "Col", amount: 5 }],
        stats: {
          "Mana Restored": "5",
          Cooldown: "15s",
          "Effect: Mana": "MANA"
        }
      }
    ],
    material: [],
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
          { item: "Cursed Fabric", amount: 8 },
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
        craftingLocation: "Kobold Dungeon - Loot Info"
      }
    ],
    currency: []
  },
  floor2: {},
  floor3: {}
};
