// CURRENT DATA ACCESSORY WAYPOINTS
//
// These waypoints are Current Data only. Every marker carries `dataset: "current"`, which
// shared/sao-datasets.js uses to keep them out of Beta mode; the Main Questline keeps using its own
// `mainQuests` category for the same purpose. The regular accessory blacksmiths reuse the map's
// existing Accessories Blacksmith category, the Occult Merchant locations reuse the existing Occult
// Merchant category, and the secret accessory locations have their own Secret Accessory Blacksmith
// category so they are never mixed into the regular Accessories Blacksmith button.
//
// Coordinates are exactly the ones supplied for Current Data; nothing here is guessed.

Object.assign(DATA, {
  "current-accessories-blacksmith-iron": {
    title: "Iron Accessories",
    type: "NPC",
    category: "accessoriesBlacksmith",
    dataset: "current",
    floor: "floor1",
    coords: { x: 1764, z: 4144 },
    drops: ["N/A"],
    description: "Accessories Blacksmith"
  },
  "current-accessories-blacksmith-copper": {
    title: "Copper Accessories",
    type: "NPC",
    category: "accessoriesBlacksmith",
    dataset: "current",
    floor: "floor1",
    coords: { x: 1773, z: 345 },
    drops: ["N/A"],
    description: "Accessories Blacksmith"
  },
  "current-accessories-blacksmith-nepenthes": {
    title: "Nepenthes Accessories",
    type: "NPC",
    category: "accessoriesBlacksmith",
    dataset: "current",
    floor: "floor1",
    coords: { x: 3151, z: 3701 },
    drops: ["N/A"],
    description: "Accessories Blacksmith"
  },
  "current-accessories-blacksmith-elite-treant": {
    title: "Elite Treant Accessories",
    type: "NPC",
    category: "accessoriesBlacksmith",
    dataset: "current",
    floor: "floor1",
    coords: { x: 1491, z: 3419 },
    drops: ["N/A"],
    description: "Accessories Blacksmith"
  },
  "current-secret-accessory-blacksmith-ice-bracelet": {
    title: "Bracelet of Ice",
    type: "NPC",
    category: "secretAccessoryBlacksmith",
    dataset: "current",
    floor: "floor1",
    coords: { x: 2416, z: 1800 },
    drops: ["N/A"],
    description: "Secret Accessory Blacksmith"
  },
  "current-secret-accessory-blacksmith-aragorn-necklace": {
    title: "Necklace of Aragorn",
    type: "NPC",
    category: "secretAccessoryBlacksmith",
    dataset: "current",
    floor: "floor1",
    coords: { x: 1114, z: 1172 },
    drops: ["N/A"],
    description: "Secret Accessory Blacksmith"
  },
  "current-secret-accessory-blacksmith-sticky-ring": {
    title: "Sticky Ring",
    type: "NPC",
    category: "secretAccessoryBlacksmith",
    dataset: "current",
    floor: "floor1",
    coords: { x: 390, z: 3064 },
    drops: ["N/A"],
    description: "Secret Accessory Blacksmith"
  },
  "current-secret-accessory-blacksmith-skeleton-skull": {
    title: "Skeleton Skull",
    type: "NPC",
    category: "secretAccessoryBlacksmith",
    dataset: "current",
    floor: "floor1",
    coords: { x: 1163, z: 3546 },
    drops: ["N/A"],
    description: "Secret Accessory Blacksmith"
  },
  "current-secret-accessory-blacksmith-deer-belt": {
    title: "Belt of the Stags",
    type: "NPC",
    category: "secretAccessoryBlacksmith",
    dataset: "current",
    floor: "floor1",
    coords: { x: 3650, z: 1331 },
    drops: ["N/A"],
    description: "Secret Accessory Blacksmith"
  },
  "current-secret-accessory-blacksmith-leviathan-ring": {
    title: "Ring of the Leviathan",
    type: "NPC",
    category: "secretAccessoryBlacksmith",
    dataset: "current",
    floor: "floor1",
    coords: { x: 1316, z: 2096 },
    drops: ["N/A"],
    description: "Secret Accessory Blacksmith"
  },
  "current-occult-merchant-gloves": {
    title: "Occult Merchant - Gloves",
    type: "NPC",
    category: "occultMerchants",
    dataset: "current",
    floor: "floor1",
    coords: { x: 3371, z: 1698 },
    drops: ["N/A"],
    description: "Occult Merchant"
  },
  "current-occult-merchant-bracelet": {
    title: "Occult Merchant - Bracelet",
    type: "NPC",
    category: "occultMerchants",
    dataset: "current",
    floor: "floor1",
    coords: { x: 3348, z: 1634 },
    drops: ["N/A"],
    description: "Occult Merchant"
  },
  "current-occult-merchant-ring": {
    title: "Occult Merchant - Ring",
    type: "NPC",
    category: "occultMerchants",
    dataset: "current",
    floor: "floor1",
    coords: { x: 3319, z: 1722 },
    drops: ["N/A"],
    description: "Occult Merchant"
  },
  "current-occult-merchant-amulet": {
    title: "Occult Merchant - Amulet",
    type: "NPC",
    category: "occultMerchants",
    dataset: "current",
    floor: "floor1",
    coords: { x: 3320, z: 1665 },
    drops: ["N/A"],
    description: "Occult Merchant"
  },
  "current-occult-merchant-artifacts": {
    title: "Occult Merchant - Artifacts",
    type: "NPC",
    category: "occultMerchants",
    dataset: "current",
    floor: "floor1",
    coords: { x: 867, z: 4033 },
    drops: ["N/A"],
    description: "Occult Merchant"
  },
  "current-loot-buyer-magical-icy": {
    title: "Magical & Icy Loot Buyer",
    type: "NPC",
    category: "lootBuyers",
    dataset: "current",
    floor: "floor1",
    coords: { x: 3317, z: 1642 },
    drops: ["N/A"],
    description: "Loot Buyer"
  },
  "current-loot-buyer-virelune": {
    title: "Virelune - Loot Buyer",
    type: "NPC",
    category: "lootBuyers",
    dataset: "current",
    floor: "floor1",
    coords: { x: 1604, z: 1970 },
    drops: ["N/A"],
    description: "Loot Buyer"
  },
  "current-loot-buyer-vallhat": {
    title: "Vallhat - Loot Buyer",
    type: "NPC",
    category: "lootBuyers",
    dataset: "current",
    floor: "floor1",
    coords: { x: 412, z: 3089 },
    drops: ["N/A"],
    description: "Loot Buyer"
  },
  "current-loot-buyer-ika-citadel": {
    title: "Ika Citadel - Loot Buyer",
    type: "NPC",
    category: "lootBuyers",
    dataset: "current",
    floor: "floor1",
    coords: { x: 3277, z: 4170 },
    drops: ["N/A"],
    description: "Loot Buyer"
  },
  "current-loot-buyer-boar-and-wolf": {
    title: "Boar and Wolf loot buyer",
    type: "NPC",
    category: "lootBuyers",
    dataset: "current",
    floor: "floor1",
    coords: { x: 1787, z: 4179 },
    drops: ["N/A"],
    description: "Loot Buyer"
  },
  "current-loot-buyer-mizunari": {
    title: "Mizunari Loot Buyer",
    type: "NPC",
    category: "lootBuyers",
    dataset: "current",
    floor: "floor1",
    coords: { x: 3132, z: 3704 },
    drops: ["N/A"],
    description: "Loot Buyer"
  },
  "current-loot-buyer-geldorack-mine": {
    title: "Geldorack Mine Dungeon - Loot Buyer",
    type: "NPC",
    category: "lootBuyers",
    dataset: "current",
    floor: "floor1",
    coords: { x: 4280, z: 3887 },
    drops: ["N/A"],
    description: "Loot Buyer"
  },
  "current-loot-buyer-cursed-ruins": {
    title: "Cursed Ruins - Loot Buyer",
    type: "NPC",
    category: "lootBuyers",
    dataset: "current",
    floor: "floor1",
    coords: { x: 2857, z: 4487 },
    drops: ["N/A"],
    description: "Loot Buyer"
  },
  "current-loot-buyer-cursed-ruins-2": {
    title: "Cursed Ruins - Loot Buyer (2)",
    type: "NPC",
    category: "lootBuyers",
    dataset: "current",
    floor: "floor1",
    coords: { x: 2832, z: 4709 },
    drops: ["N/A"],
    description: "Loot Buyer"
  },
  "current-loot-buyer-hanaka": {
    title: "Hanaka - Loot Buyer",
    type: "NPC",
    category: "lootBuyers",
    dataset: "current",
    floor: "floor1",
    coords: { x: 1504, z: 3396 },
    drops: ["N/A"],
    description: "Loot Buyer"
  },
  "current-loot-buyer-fallen-labyrinth": {
    title: "Labyrinth of the Fallen - Loot Buyer",
    type: "NPC",
    category: "lootBuyers",
    dataset: "current",
    floor: "floor1",
    coords: { x: 2403, z: 2385 },
    drops: ["N/A"],
    description: "Loot Buyer"
  },
  "current-loot-buyer-fallen-labyrinth-2": {
    title: "Labyrinth of the Fallen (2) - Loot Buyer",
    type: "NPC",
    category: "lootBuyers",
    dataset: "current",
    floor: "floor1",
    coords: { x: 2389, z: 2408 },
    drops: ["N/A"],
    description: "Loot Buyer"
  },
  "current-loot-buyer-aragorn": {
    title: "Aragorn's Lair - Loot Buyer",
    type: "NPC",
    category: "lootBuyers",
    dataset: "current",
    floor: "floor1",
    coords: { x: 1020, z: 1176 },
    drops: ["N/A"],
    description: "Loot Buyer"
  },
  "current-starting-merchant": {
    title: "Starting Merchant",
    type: "NPC",
    category: "toolMerchants",
    dataset: "current",
    floor: "floor1",
    coords: { x: 1787, z: 4179 },
    drops: ["N/A"],
    description: "Tool Merchant"
  },
  "current-starting-town-tools": {
    title: "F1 - Starting Town - Tools",
    type: "NPC",
    category: "toolMerchants",
    dataset: "current",
    floor: "floor1",
    coords: { x: 1787, z: 4161 },
    drops: ["N/A"],
    description: "Tool Merchant"
  },
  "current-dungeon-guard-geldorack": {
    title: "F1 - Geldorack Dungeon Guard - Starting Town",
    type: "NPC",
    category: "keyBlacksmith",
    dataset: "current",
    floor: "floor1",
    coords: { x: 4281, z: 3893 },
    drops: ["N/A"],
    description: "Key Blacksmith"
  },
  "current-dungeon-guard-fallen-labyrinth": {
    title: "F1 - Fallen Labyrinth Dungeon Guard - Tolbana",
    type: "NPC",
    category: "keyBlacksmith",
    dataset: "current",
    floor: "floor1",
    coords: { x: 2378, z: 2410 },
    drops: ["N/A"],
    description: "Key Blacksmith"
  },
  "current-dungeon-guard-xal-zirith": {
    title: "F1 - Xal'Zirith Dungeon Guard - Candelia",
    type: "NPC",
    category: "keyBlacksmith",
    dataset: "current",
    floor: "floor1",
    coords: { x: 1013, z: 1189 },
    drops: ["N/A"],
    description: "Key Blacksmith"
  },
  "current-kobold-dungeon-loot-info": {
    title: "Kobold Dungeon - Loot Info",
    type: "Dungeon",
    category: "dungeons",
    dataset: "current",
    floor: "floor1",
    coords: { x: 3396, z: 1081 },
    drops: ["N/A"],
    description: "Dungeon"
  }
});
