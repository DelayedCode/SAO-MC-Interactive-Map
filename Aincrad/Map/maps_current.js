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
  "current-consumables-merchant-purification-alchemist": {
    title: "F1 - PvP Purification Alchemist",
    type: "NPC",
    category: "consumablesMerchants",
    dataset: "current",
    floor: "floor1",
    coords: { x: 1813, z: 4180 },
    drops: ["N/A"],
    description: "Consumables Merchant"
  },
  "current-consumables-merchant-assistant": {
    title: "The Assistant",
    type: "NPC",
    category: "consumablesMerchants",
    dataset: "current",
    floor: "floor1",
    coords: { x: 1772, z: 4102 },
    drops: ["N/A"],
    description: "Consumables Merchant"
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
  },

  /* Current Data biome waypoints.
     Copied verbatim from the Beta floor datasets (maps_floor1.js / maps_floor2.js /
     maps_floor3.js), which are their single source. Floor 1's coordinates are already
     Minecraft - the coordinate redesign migrated them once - so they are copied exactly and
     never shifted again. Floor 2 and Floor 3 keep their own map-local grids, exactly as the
     Beta map stores them. No conversion, no +2/+12 alignment, no new transformation is
     applied to any of them. */
  "current-swamp-putride": {
    title: "Swamp Putride",
    type: "Biome",
    category: "biomes",
    dataset: "current",
    floor: "floor1",
    coords: { x: 1345, z: 3063 },
    drops: ["N/A"],
    description: "A dense and hostile marsh, where mist poisons the air and masks dangers. Few emerge unscathed..."
  },
  "current-vallhat": {
    title: "Vallhat",
    type: "Biome",
    category: "biomes",
    dataset: "current",
    floor: "floor1",
    coords: { x: 450, z: 3050 },
    drops: ["N/A"],
    description: "Perched at the top of a windy massif, Vallhat watches, silent and isolated. Its heights hide many secrets."
  },
  "current-cyclorim": {
    title: "Cyclorim",
    type: "Biome",
    category: "biomes",
    dataset: "current",
    floor: "floor1",
    coords: { x: 1167, z: 3552 },
    drops: ["N/A"],
    description: "An ancient arena carved from red rock. It is said that a single eye still watches over it, ready to judge intruders by brute force."
  },
  "current-hanaka": {
    title: "Hanaka",
    type: "Biome",
    category: "biomes",
    dataset: "current",
    floor: "floor1",
    coords: { x: 1486, z: 3437 },
    drops: ["N/A"],
    description: "A wooded hamlet nestled between the hills where wild boars prowl on the edge. Cradle of the first clashes."
  },
  "current-town-of-beginnings": {
    title: "Town of Beginnings",
    type: "Biome",
    category: "biomes",
    dataset: "current",
    floor: "floor1",
    coords: { x: 1802, z: 4294 },
    drops: ["N/A"],
    description: "The Town of Beginnings is a peaceful haven in a still unknown virtual world. This is where every adventure begins."
  },
  "current-petals-valley": {
    title: "Petals Valley",
    type: "Biome",
    category: "biomes",
    dataset: "current",
    floor: "floor1",
    coords: { x: 1009, z: 4171 },
    drops: ["N/A"],
    description: "An enchanted valley where the petals dance in the wind. The scent of flowers soothes the souls of travelers. But behind the beauty... lies an ancient secret."
  },
  "current-valley-of-wolfs": {
    title: "Valley of Wolfs",
    type: "Biome",
    category: "biomes",
    dataset: "current",
    floor: "floor1",
    coords: { x: 2555, z: 3860 },
    drops: ["N/A"],
    description: "A foggy valley where the howls still resonate. It is said that no wolf hunts there alone... Their shadows watch from the heights."
  },
  "current-abandoned-castle": {
    title: "Abandoned Castle",
    type: "Biome",
    category: "biomes",
    dataset: "current",
    floor: "floor1",
    coords: { x: 2841, z: 4694 },
    drops: ["N/A"],
    description: "The ruins of a forgotten castle, eaten away by time. Its collapsed walls still whisper the echoes of yesteryear. A place that even the light seems to flee."
  },
  "current-ika-archipelago": {
    title: "Ika Archipelago",
    type: "Biome",
    category: "biomes",
    dataset: "current",
    floor: "floor1",
    coords: { x: 3301, z: 4096 },
    drops: ["N/A"],
    description: "A tropical archipelago where giant tortoises gather. Each island hides ancient mysteries and unique wildlife. Calm is just a facade..."
  },
  "current-mizunari": {
    title: "Mizunari",
    type: "Biome",
    category: "biomes",
    dataset: "current",
    floor: "floor1",
    coords: { x: 3141, z: 3685 },
    drops: ["N/A"],
    description: "Small peaceful village nestled on the edge of a clear lake. The inhabitants live to the rhythm of the waves and the wind. A perfect place to breathe between two battles."
  },
  "current-geldorak-mine": {
    title: "Geldorak Mine",
    type: "Biome",
    category: "biomes",
    dataset: "current",
    floor: "floor1",
    coords: { x: 4173, z: 3891 },
    drops: ["N/A"],
    description: "Dug into the heart of the mountain, the Geldorak mine was once home to a colony of renowned miners. But one day a scream rang out in the galleries... Since then, the corridors have been sealed and no one dares to go down there anymore."
  },
  "current-og-district": {
    title: "OG District",
    type: "Biome",
    category: "biomes",
    dataset: "current",
    floor: "floor1",
    coords: { x: 2310, z: 3264 },
    drops: ["N/A"],
    description: "The stronghold of the renowned and feared OG Guild. A strategic location reserved for elite veterans. The walls exude glory and past victories."
  },
  "current-castlemist": {
    title: "Castlemist",
    type: "Biome",
    category: "biomes",
    dataset: "current",
    floor: "floor1",
    coords: { x: 2872, z: 2987 },
    drops: ["N/A"],
    description: "Perched at the top of a forgotten ridge, the hamlet of CastelBrume watches over the valley. Its mills howl in the icy mist, like a call to lost souls..."
  },
  "current-water-lily-lake": {
    title: "Water Lily Lake",
    type: "Biome",
    category: "biomes",
    dataset: "current",
    floor: "floor1",
    coords: { x: 2603, z: 2771 },
    drops: ["N/A"],
    description: "Calm and mystery surround its troubled waters... A place of meditation, but also of disappearance."
  },
  "current-garden-of-giants": {
    title: "Garden of Giants",
    type: "Biome",
    category: "biomes",
    dataset: "current",
    floor: "floor1",
    coords: { x: 369, z: 2434 },
    drops: ["N/A"],
    description: "A forgotten place where nature has reclaimed its rights. Some say they hear voices whispered in the wind, as if the giants were still watching. A peaceful oasis... in appearance only."
  },
  "current-arakh-nol": {
    title: "Arakh'Nol",
    type: "Biome",
    category: "biomes",
    dataset: "current",
    floor: "floor1",
    coords: { x: 1220, z: 1406 },
    drops: ["N/A"],
    description: "In the depths of Arakh'Nol, light struggles to break through. Each tree is knotted with thick, living webs. The whispers of the wind hide the whispers of ancient spirits, and those who stray from them rarely guess the stories being told. A forgotten entity weaves more than traps there."
  },
  "current-virelune": {
    title: "Virelune",
    type: "Biome",
    category: "biomes",
    dataset: "current",
    floor: "floor1",
    coords: { x: 1572, z: 1978 },
    drops: ["N/A"],
    description: "Nestled on the edge of an unfathomable sea chasm, the village of Virelune lives to the rhythm of lunar tides. Fishermen say they see two moons reflected in the waters... But one of them never follows the sky."
  },
  "current-crystal-peak-mine": {
    title: "Crystal Peak Mine",
    type: "Biome",
    category: "biomes",
    dataset: "current",
    floor: "floor1",
    coords: { x: 2446, z: 1729 },
    drops: ["N/A"],
    description: "This old mine contains crystals of exceptional purity. It is said that their brilliance is linked to human emotions... But some miners, fascinated, got lost there forever."
  },
  "current-tolbana-crystal": {
    title: "Tolbana Crystal",
    type: "Biome",
    category: "biomes",
    dataset: "current",
    floor: "floor1",
    coords: { x: 3046, z: 1193 },
    drops: ["N/A"],
    description: "Luminescent crystals with mysterious properties. Protected by Tolbana mages..."
  },
  "current-kobold-tower": {
    title: "Kobold Tower",
    type: "Biome",
    category: "biomes",
    dataset: "current",
    floor: "floor1",
    coords: { x: 3409, z: 972 },
    drops: ["N/A"],
    description: "An ancient ruined tower, lair of Ilfang Lord Kobold. Dark murmurs rise from its depths."
  },
  "current-tolbana": {
    title: "Tolbana",
    type: "Biome",
    category: "biomes",
    dataset: "current",
    floor: "floor1",
    coords: { x: 3312, z: 1620 },
    drops: ["N/A"],
    description: "Built on the mountainside, Tolbana is home to the largest magical libraries in the known world. Its streets vibrate with energy, and its towers resonate with the echo of age-old incantations."
  },
  "current-snow-citadel": {
    title: "Snow Citadel",
    type: "Biome",
    category: "biomes",
    dataset: "current",
    floor: "floor1",
    coords: { x: 3994, z: 2010 },
    drops: ["N/A"],
    description: "Once an impregnable bastion, the Snow Citadel was the scene of a forgotten siege, lost in the snowflakes of time. Its ramparts, frozen in ice, guard the scars. Today, only the most daring dare to pass through its doors..."
  },
  "current-merchant-guild": {
    title: "Merchant Guild",
    type: "Biome",
    category: "biomes",
    dataset: "current",
    floor: "floor1",
    coords: { x: 4772, z: 2422 },
    drops: ["N/A"],
    description: "The Merchants Guild Headquarters, a lively place where riches and secrets are exchanged. The streets are teeming with activity and negotiation."
  },
  "current-candelia": {
    title: "Candelia",
    type: "Biome",
    category: "biomes",
    dataset: "current",
    floor: "floor1",
    coords: { x: 2001, z: 765 },
    drops: ["N/A"],
    description: "Nestled between the steep peaks, Candelia seems frozen in time. Its lanterns flicker without wind, and the fields never wither. The ancients say that souls still whisper there at nightfall..."
  },
  "current-lair-of-aepep": {
    title: "Lair of Aepep",
    type: "Biome",
    category: "biomes",
    dataset: "current",
    floor: "floor1",
    coords: { x: 1389, z: 2041 },
    underground: true,
    drops: ["N/A"],
    description: "In the heart of a forgotten cave sleeps an ancient serpent: Aepep No one knows if he's awake... or still dreaming. Its gigantic body would have shaped the galleries."
  },
  "current-autel_des_deux_lunes": {
    title: "Altar of Two Moons",
    type: "Biome",
    category: "biomes",
    dataset: "current",
    floor: "floor2",
    coords: { x: 570, z: -470 },
    drops: ["N/A"],
    description: "A mysterious moonlit altar located at the heart of Map 2."
  },
  "current-baie_des_monstres_ondoyante": {
    title: "Wavy Monster Bay",
    type: "Biome",
    category: "biomes",
    dataset: "current",
    floor: "floor2",
    coords: { x: -780, z: 171 },
    drops: ["N/A"],
    description: "A shoreline biome where monsters gather along restless waves."
  },
  "current-baobab_millenaire": {
    title: "Millennial Baobab",
    type: "Biome",
    category: "biomes",
    dataset: "current",
    floor: "floor2",
    coords: { x: -88, z: -92 },
    drops: ["N/A"],
    description: "A giant ancient baobab tree standing watch over the area."
  },
  "current-desert_des_crocs_argentes": {
    title: "Silver Fang Desert",
    type: "Biome",
    category: "biomes",
    dataset: "current",
    floor: "floor2",
    coords: { x: -372, z: -556 },
    drops: ["N/A"],
    description: "A harsh desert known for its silver sands and dangerous predators."
  },
  "current-foret_des_ailes_d_emeraude": {
    title: "Emerald Wings Forest",
    type: "Biome",
    category: "biomes",
    dataset: "current",
    floor: "floor2",
    coords: { x: -550, z: 476 },
    drops: ["N/A"],
    description: "A vibrant forest filled with lush foliage and winged creatures."
  },
  "current-foret_sucree": {
    title: "Sweet Forest",
    type: "Biome",
    category: "biomes",
    dataset: "current",
    floor: "floor2",
    coords: { x: 484, z: -665 },
    drops: ["N/A"],
    description: "A fragrant woodland alive with sweet flora and hidden paths."
  },
  "current-grotte_de_taran": {
    title: "Taran Cave",
    type: "Biome",
    category: "biomes",
    dataset: "current",
    floor: "floor2",
    coords: { x: -316, z: -94 },
    underground: true,
    drops: ["N/A"],
    description: "A dark underground cave beneath Taran, home to hidden dangers."
  },
  "current-kaelor": {
    title: "Kaelor",
    type: "Biome",
    category: "biomes",
    dataset: "current",
    floor: "floor2",
    coords: { x: -583, z: -264 },
    drops: ["N/A"],
    description: "A remote biome named Kaelor, known for its unusual terrain."
  },
  "current-lac_des_taureaux": {
    title: "Lake of the Bulls",
    type: "Biome",
    category: "biomes",
    dataset: "current",
    floor: "floor2",
    coords: { x: 118, z: -68 },
    drops: ["N/A"],
    description: "A quiet lake surrounded by rugged scenery and wild beasts."
  },
  "current-les_veines_de_sablemor": {
    title: "Sablemor Veins",
    type: "Biome",
    category: "biomes",
    dataset: "current",
    floor: "floor2",
    coords: { x: 225, z: 295 },
    underground: true,
    drops: ["N/A"],
    description: "Underground mineral veins near Sablemor, rich with rare ore."
  },
  "current-maisons_des_ngangas": {
    title: "Nganga Houses",
    type: "Biome",
    category: "biomes",
    dataset: "current",
    floor: "floor2",
    coords: { x: -430, z: -428 },
    drops: ["N/A"],
    description: "A small settlement of Ngangas houses with mystic inhabitants."
  },
  "current-marome": {
    title: "Marome",
    type: "Biome",
    category: "biomes",
    dataset: "current",
    floor: "floor2",
    coords: { x: 721, z: -281 },
    drops: ["N/A"],
    description: "A coastal enclave with tropical life and hidden secrets."
  },
  "current-nid_de_brasier": {
    title: "Brazier Nest",
    type: "Biome",
    category: "biomes",
    dataset: "current",
    floor: "floor2",
    coords: { x: -581, z: 234 },
    underground: true,
    drops: ["N/A"],
    description: "A fiery underground nest where blazing creatures gather."
  },
  "current-oasis_secret": {
    title: "Secret Oasis",
    type: "Biome",
    category: "biomes",
    dataset: "current",
    floor: "floor2",
    coords: { x: 798, z: 253 },
    drops: ["N/A"],
    description: "A hidden oasis tucked away in Map 2's desert regions."
  },
  "current-ruche_de_melliona": {
    title: "Melliona's Hive",
    type: "Biome",
    category: "biomes",
    dataset: "current",
    floor: "floor2",
    coords: { x: 506, z: -724 },
    drops: ["N/A"],
    description: "The buzzing hive where Melliona's creatures gather."
  },
  "current-sanctuaire_de_khesun": {
    title: "Sanctuary of Khesun",
    type: "Biome",
    category: "biomes",
    dataset: "current",
    floor: "floor2",
    coords: { x: -6, z: 181 },
    drops: ["N/A"],
    description: "A sacred sanctuary dedicated to the guardian Khesun."
  },
  "current-taran": {
    title: "Taran",
    type: "Biome",
    category: "biomes",
    dataset: "current",
    floor: "floor2",
    coords: { x: -427, z: 272 },
    drops: ["N/A"],
    description: "A rugged region known for strong winds and sparse vegetation."
  },
  "current-tombeau_du_necromancien": {
    title: "Necromancer's Tomb",
    type: "Biome",
    category: "biomes",
    dataset: "current",
    floor: "floor2",
    coords: { x: 721, z: 244 },
    underground: true,
    drops: ["N/A"],
    description: "An ancient tomb filled with necromantic energies."
  },
  "current-tour_de_taurus": {
    title: "Taurus Tower",
    type: "Biome",
    category: "biomes",
    dataset: "current",
    floor: "floor2",
    coords: { x: -160, z: 795 },
    drops: ["N/A"],
    description: "A towering spire watched over by Taurus."
  },
  "current-urbus": {
    title: "Urbus",
    type: "Biome",
    category: "biomes",
    dataset: "current",
    floor: "floor2",
    coords: { x: 64, z: -348 },
    drops: ["N/A"],
    description: "The town of Urbus, a key waypoint in the Map 2 region."
  },
  "current-labyrinth": {
    title: "Labyrinth",
    type: "Biome",
    category: "biomes",
    dataset: "current",
    floor: "floor3",
    coords: { x: 588, z: 195 },
    drops: ["N/A"],
    description: "Labyrinth (Biome) — Coordinates X: 588 Z: 195"
  },
  "current-entrance-to-the-labyrinth": {
    title: "Entrance to the Labyrinth",
    type: "Biome",
    category: "biomes",
    dataset: "current",
    floor: "floor3",
    coords: { x: 382, z: 433 },
    drops: ["N/A"],
    description: "Entrance to the Labyrinth (Biome) — Coordinates X: 382 Z: 433"
  },
  "current-dungeon-the-mysterious-islands": {
    title: "Dungeon The Mysterious Islands",
    type: "Biome",
    category: "biomes",
    dataset: "current",
    floor: "floor3",
    coords: { x: 860, z: 288 },
    drops: ["N/A"],
    description: "Dungeon The Mysterious Islands (Biome) — Coordinates X: 860 Z: 288"
  },
  "current-elessarh-mine": {
    title: "Elessarh Mine",
    type: "Biome",
    category: "biomes",
    dataset: "current",
    floor: "floor3",
    coords: { x: 928, z: 505 },
    drops: ["N/A"],
    description: "Elessarh Mine (Biome) — Coordinates X: 928 Z: 505"
  },
  "current-lysaat": {
    title: "Lysaat",
    type: "Biome",
    category: "biomes",
    dataset: "current",
    floor: "floor3",
    coords: { x: 346, z: 592 },
    drops: ["N/A"],
    description: "Lysaat (Biome) — Coordinates X: 346 Z: 592"
  },
  "current-weisslum": {
    title: "Weisslum",
    type: "Biome",
    category: "biomes",
    dataset: "current",
    floor: "floor3",
    coords: { x: 650, z: 607 },
    drops: ["N/A"],
    description: "Weisslum (Biome) — Coordinates X: 650 Z: 607"
  },
  "current-zumfut": {
    title: "Zumfut",
    type: "Biome",
    category: "biomes",
    dataset: "current",
    floor: "floor3",
    coords: { x: 932, z: 609 },
    drops: ["N/A"],
    description: "Zumfut (Biome) — Coordinates X: 932 Z: 609"
  },
  "current-aldarya": {
    title: "Aldarya",
    type: "Biome",
    category: "biomes",
    dataset: "current",
    floor: "floor3",
    coords: { x: 1083, z: 592 },
    drops: ["N/A"],
    description: "Aldarya (Biome) — Coordinates X: 1083 Z: 592"
  },
  "current-sylinga": {
    title: "Sylinga",
    type: "Biome",
    category: "biomes",
    dataset: "current",
    floor: "floor3",
    coords: { x: 163, z: 721 },
    drops: ["N/A"],
    description: "Sylinga (Biome) — Coordinates X: 163 Z: 721"
  },
  "current-ruins-of-avrylne": {
    title: "Ruins of Avrylne",
    type: "Biome",
    category: "biomes",
    dataset: "current",
    floor: "floor3",
    coords: { x: 543, z: 760 },
    drops: ["N/A"],
    description: "Ruins of Avrylne (Biome) — Coordinates X: 543 Z: 760"
  },
  "current-earan-forest": {
    title: "Earan Forest",
    type: "Biome",
    category: "biomes",
    dataset: "current",
    floor: "floor3",
    coords: { x: 477, z: 875 },
    drops: ["N/A"],
    description: "Earan Forest (Biome) — Coordinates X: 477 Z: 875"
  },
  "current-caverns": {
    title: "Caverns",
    type: "Biome",
    category: "biomes",
    dataset: "current",
    floor: "floor3",
    coords: { x: 528, z: 858 },
    drops: ["N/A"],
    description: "Caverns (Biome) — Coordinates X: 528 Z: 858"
  },
  "current-mist-refuge": {
    title: "Mist Refuge",
    type: "Biome",
    category: "biomes",
    dataset: "current",
    floor: "floor3",
    coords: { x: 705, z: 847 },
    drops: ["N/A"],
    description: "Mist Refuge (Biome) — Coordinates X: 705 Z: 847"
  },
  "current-mist-canyon": {
    title: "Mist Canyon",
    type: "Biome",
    category: "biomes",
    dataset: "current",
    floor: "floor3",
    coords: { x: 807, z: 855 },
    drops: ["N/A"],
    description: "Mist Canyon (Biome) — Coordinates X: 807 Z: 855"
  },
  "current-wolf-forest": {
    title: "Wolf Forest",
    type: "Biome",
    category: "biomes",
    dataset: "current",
    floor: "floor3",
    coords: { x: 970, z: 828 },
    drops: ["N/A"],
    description: "Wolf Forest (Biome) — Coordinates X: 970 Z: 828"
  },
  "current-ilmarin": {
    title: "Ilmarin",
    type: "Biome",
    category: "biomes",
    dataset: "current",
    floor: "floor3",
    coords: { x: 1049, z: 862 },
    drops: ["N/A"],
    description: "Ilmarin (Biome) — Coordinates X: 1049 Z: 862"
  },
  "current-black-market": {
    title: "Black Market",
    type: "Biome",
    category: "biomes",
    dataset: "current",
    floor: "floor3",
    coords: { x: 1121, z: 811 },
    drops: ["N/A"],
    description: "Black Market (Biome) — Coordinates X: 1121 Z: 811"
  },
  "current-bandit-camps": {
    title: "Bandit Camps",
    type: "Biome",
    category: "biomes",
    dataset: "current",
    floor: "floor3",
    coords: { x: 1138, z: 844 },
    drops: ["N/A"],
    description: "Bandit Camps (Biome) — Coordinates X: 1138 Z: 844"
  },
  "current-earan-land": {
    title: "Earan Land",
    type: "Biome",
    category: "biomes",
    dataset: "current",
    floor: "floor3",
    coords: { x: 587, z: 984 },
    drops: ["N/A"],
    description: "Earan Land (Biome) — Coordinates X: 587 Z: 984"
  },
  "current-terrialys-well": {
    title: "Terrialys Well",
    type: "Biome",
    category: "biomes",
    dataset: "current",
    floor: "floor3",
    coords: { x: 961, z: 1103 },
    drops: ["N/A"],
    description: "Terrialys Well (Biome) — Coordinates X: 961 Z: 1103"
  },
  "current-rest-of-ankyla": {
    title: "Rest of Ankyla",
    type: "Biome",
    category: "biomes",
    dataset: "current",
    floor: "floor3",
    coords: { x: 1105, z: 1043 },
    drops: ["N/A"],
    description: "Rest of Ankyla (Biome) — Coordinates X: 1105 Z: 1043"
  },
  "current-guild-base": {
    title: "Guild Base",
    type: "Biome",
    category: "biomes",
    dataset: "current",
    floor: "floor3",
    coords: { x: 775, z: 1200 },
    drops: ["N/A"],
    description: "Guild Base (Biome) — Coordinates X: 775 Z: 1200"
  },
  "current-adorylls-cage": {
    title: "Adoryll's cage",
    type: "Biome",
    category: "biomes",
    dataset: "current",
    floor: "floor3",
    coords: { x: 274, z: 1244 },
    drops: ["N/A"],
    description: "Adoryll's cage (Biome) — Coordinates X: 274 Z: 1244"
  },
  "current-orc-camps": {
    title: "Orc Camps",
    type: "Biome",
    category: "biomes",
    dataset: "current",
    floor: "floor3",
    coords: { x: 285, z: 1191 },
    drops: ["N/A"],
    description: "Orc Camps (Biome) — Coordinates X: 285 Z: 1191"
  },
  "current-triyag": {
    title: "Triyag",
    type: "Biome",
    category: "biomes",
    dataset: "current",
    floor: "floor3",
    coords: { x: 582, z: 1381 },
    drops: ["N/A"],
    description: "Triyag (Biome) — Coordinates X: 582 Z: 1381"
  },
  "current-swamp": {
    title: "Swamp",
    type: "Biome",
    category: "biomes",
    dataset: "current",
    floor: "floor3",
    coords: { x: 633, z: 1258 },
    drops: ["N/A"],
    description: "Swamp (Biome) — Coordinates X: 633 Z: 1258"
  }
});

// CURRENT DATA MOB AREAS
//
// The Current Data copy of the mob areas. Every entry below is the Beta-Test Data entry
// unchanged - same id, title, floor, colours and corner geometry - so the curated mob lists in
// MOB_AREA_MOBS and the translated titles keep working as they are. The array is handed to
// Aincrad/Map/adapter.js so Current Data reads its own copy while Beta-Test Data keeps the
// untouched original dataset.
//
// "Wild Boar Meadow" is deliberately not part of Current Data.

const CURRENT_MOB_AREAS = [
  {
    id: "vallhat-mobs",
    title: "Vallhat",
    floor: "floor1",
    fill: "rgba(74, 191, 102, 0.26)",
    stroke: "#65d07e",
    corners: [
      { x: 130, z: 2785 },
      { x: 294, z: 2691 },
      { x: 503, z: 2712 },
      { x: 631, z: 2836 },
      { x: 586, z: 3156 },
      { x: 470, z: 3327 },
      { x: 263, z: 3390 }
    ]
  },
  {
    id: "swamp-putride-mobs",
    title: "Swamp Putride",
    floor: "floor1",
    fill: "rgba(146, 86, 56, 0.30)",
    stroke: "#da8d64",
    corners: [
      { x: 1015, z: 2887 },
      { x: 1605, z: 2812 },
      { x: 1708, z: 3192 },
      { x: 1038, z: 3288 }
    ]
  },
  {
    id: "wild-boar-zone",
    title: "Wild Boar Zone",
    floor: "floor1",
    fill: "rgba(98, 98, 196, 0.28)",
    stroke: "#8da0ff",
    corners: [
      { x: 1637, z: 3639 },
      { x: 1806, z: 3477 },
      { x: 1926, z: 3460 },
      { x: 2024, z: 3601 },
      { x: 1994, z: 3641 },
      { x: 1884, z: 3602 }
    ]
  },
  {
    id: "valley-of-wolves-mobs",
    title: "Valley of Wolves",
    floor: "floor1",
    fill: "rgba(243, 223, 120, 0.25)",
    stroke: "#fff2b5",
    corners: [
      { x: 2480, z: 3661 },
      { x: 2373, z: 3902 },
      { x: 2471, z: 4007 },
      { x: 2715, z: 3870 },
      { x: 2639, z: 3669 }
    ]
  },
  {
    id: "cursed-ruins",
    title: "Cursed Ruins",
    floor: "floor1",
    fill: "rgba(240, 167, 60, 0.28)",
    stroke: "#ffd074",
    corners: [
      { x: 2769, z: 4369 },
      { x: 2772, z: 4502 },
      { x: 2915, z: 4512 },
      { x: 2912, z: 4384 }
    ]
  },
  {
    id: "ika-archipelago-mobs",
    title: "Ika Archipelago",
    floor: "floor1",
    fill: "rgba(84, 156, 236, 0.25)",
    stroke: "#80beff",
    corners: [
      { x: 3236, z: 4006 },
      { x: 3188, z: 4101 },
      { x: 3219, z: 4203 },
      { x: 3372, z: 4207 },
      { x: 3433, z: 4155 },
      { x: 3413, z: 4033 }
    ]
  },
  {
    id: "mizunari-fields",
    title: "Mizunari Fields",
    floor: "floor1",
    fill: "rgba(176, 206, 88, 0.28)",
    stroke: "#d5f079",
    corners: [
      { x: 3377, z: 3692 },
      { x: 3295, z: 3729 },
      { x: 3365, z: 3834 },
      { x: 3446, z: 3776 }
    ]
  },
  {
    id: "geldorak-mine-mobs",
    title: "Geldorak Mine",
    floor: "floor1",
    fill: "rgba(162, 207, 255, 0.24)",
    stroke: "#e2f3ff",
    corners: [
      { x: 3956, z: 3832 },
      { x: 4055, z: 4112 },
      { x: 4386, z: 3882 }
    ]
  },
  {
    id: "snow-citadel-mobs",
    title: "Snow Citadel",
    floor: "floor1",
    fill: "rgba(162, 207, 255, 0.24)",
    stroke: "#e2f3ff",
    corners: [
      { x: 3913, z: 1955 },
      { x: 3914, z: 2017 },
      { x: 4023, z: 2011 },
      { x: 4025, z: 1941 }
    ]
  },
  {
    id: "lake-virelune",
    title: "Lake Virelune",
    floor: "floor1",
    fill: "rgba(162, 207, 255, 0.24)",
    stroke: "#e2f3ff",
    corners: [
      { x: 1391, z: 1957 },
      { x: 1300, z: 2041 },
      { x: 1427, z: 2133 },
      { x: 1484, z: 2022 }
    ]
  },
  {
    id: "tolbana-mountains",
    title: "Tolbana Mountains",
    floor: "floor1",
    fill: "rgba(191, 153, 84, 0.28)",
    stroke: "#e0bc7c",
    corners: [
      { x: 4176, z: 1204 },
      { x: 4059, z: 1136 },
      { x: 4151, z: 972 },
      { x: 4269, z: 1053 }
    ]
  },
  {
    id: "arakh-nol-mobs",
    title: "Arakh'Nol",
    floor: "floor1",
    fill: "rgba(162, 207, 255, 0.24)",
    stroke: "#e2f3ff",
    corners: [
      { x: 1131, z: 1132 },
      { x: 1077, z: 1200 },
      { x: 1215, z: 1303 },
      { x: 1149, z: 1373 },
      { x: 1054, z: 1704 },
      { x: 1229, z: 1689 },
      { x: 1562, z: 1426 },
      { x: 1494, z: 1162 }
    ]
  },
  {
    id: "xal-zirith-underground-mobs",
    title: "Dungeon Sanctuary of Xal'Zirith",
    floor: "floor1",
    underground: true,
    fill: "rgba(146, 103, 255, 0.26)",
    stroke: "#b48cff",
    corners: [
      { x: 989, z: 1080 },
      { x: 981, z: 1130 },
      { x: 1031, z: 1140 },
      { x: 1039, z: 1128 },
      { x: 1080, z: 1149 },
      { x: 1008, z: 1158 },
      { x: 1002, z: 1207 },
      { x: 1062, z: 1216 },
      { x: 1066, z: 1264 },
      { x: 1046, z: 1299 },
      { x: 1000, z: 1298 },
      { x: 1031, z: 1271 },
      { x: 1026, z: 1230 },
      { x: 955, z: 1232 },
      { x: 953, z: 1274 },
      { x: 981, z: 1329 },
      { x: 1045, z: 1319 },
      { x: 1071, z: 1342 },
      { x: 1072, z: 1379 },
      { x: 1154, z: 1449 },
      { x: 1227, z: 1452 },
      { x: 1126, z: 1381 },
      { x: 1096, z: 1368 },
      { x: 1117, z: 1293 },
      { x: 1128, z: 1212 },
      { x: 1239, z: 1270 },
      { x: 1397, z: 1271 },
      { x: 1395, z: 1096 }
    ]
  },
  {
    id: "skeleton-dungeon-underground-mobs",
    title: "Skeleton Dungeon",
    floor: "floor1",
    underground: true,
    fill: "rgba(255, 120, 188, 0.26)",
    stroke: "#ff9ad1",
    corners: [
      { x: 2777, z: 4215 },
      { x: 2777, z: 4330 },
      { x: 2694, z: 4302 },
      { x: 2690, z: 4373 },
      { x: 2777, z: 4352 },
      { x: 2777, z: 4397 },
      { x: 2804, z: 4412 },
      { x: 2827, z: 4412 },
      { x: 2855, z: 4397 },
      { x: 2855, z: 4352 },
      { x: 2871, z: 4350 },
      { x: 2871, z: 4378 },
      { x: 2943, z: 4378 },
      { x: 2943, z: 4304 },
      { x: 2871, z: 4304 },
      { x: 2873, z: 4330 },
      { x: 2855, z: 4330 },
      { x: 2850, z: 4211 },
      { x: 2780, z: 4209 }
    ]
  },
  {
    id: "geldorak-mine-dungeon-underground-mobs",
    title: "Geldorak Mine Dungeon",
    floor: "floor1",
    underground: true,
    fill: "rgba(108, 212, 128, 0.26)",
    stroke: "#7be694",
    corners: [
      { x: 4277, z: 4191 },
      { x: 4335, z: 4191 },
      { x: 4362, z: 3848 },
      { x: 4217, z: 3841 }
    ]
  },
  {
    id: "silver-fang-desert-mobs",
    title: "Silver Fang Desert",
    floor: "floor2",
    fill: "rgba(210, 180, 140, 0.26)",
    stroke: "#d2b48c",
    corners: [
      { x: -236, z: -638 },
      { x: -500, z: -588 },
      { x: -497, z: -473 },
      { x: -276, z: -540 }
    ]
  },
  {
    id: "sweet-forest-mobs",
    title: "Sweet Forest",
    floor: "floor2",
    fill: "rgba(162, 230, 120, 0.28)",
    stroke: "#8bcf46",
    corners: [
      { x: 363, z: -753 },
      { x: 327, z: -619 },
      { x: 596, z: -597 },
      { x: 572, z: -772 }
    ]
  },
  {
    id: "wavy-monster-bay-mobs",
    title: "Wavy Monster Bay",
    floor: "floor2",
    fill: "rgba(134, 126, 212, 0.28)",
    stroke: "#7f60dc",
    corners: [
      { x: -564, z: -52 },
      { x: -887, z: 133 },
      { x: -872, z: 232 },
      { x: -510, z: 135 }
    ]
  },
  {
    id: "emerald-wings-forest-mobs",
    title: "Emerald Wings Forest",
    floor: "floor2",
    fill: "rgba(144, 220, 126, 0.28)",
    stroke: "#68b941",
    corners: [
      { x: -629, z: 416 },
      { x: -615, z: 406 },
      { x: -585, z: 434 },
      { x: -531, z: 424 },
      { x: -534, z: 469 },
      { x: -555, z: 488 },
      { x: -588, z: 479 },
      { x: -586, z: 452 }
    ]
  },
  {
    id: "sanctuary-of-khesun-mobs",
    title: "Sanctuary of Khesun",
    floor: "floor2",
    fill: "rgba(250, 235, 123, 0.26)",
    stroke: "#e3d365",
    corners: [
      { x: -24, z: 130 },
      { x: 16, z: 127 },
      { x: 45, z: 213 },
      { x: -54, z: 244 },
      { x: -64, z: 202 }
    ]
  },
  {
    id: "lake-of-bulls-mobs",
    title: "Lake of the Bulls",
    floor: "floor2",
    fill: "rgba(170, 152, 204, 0.24)",
    stroke: "#9c8fb8",
    corners: [
      { x: 165, z: -150 },
      { x: 46, z: -126 },
      { x: 21, z: -64 },
      { x: 108, z: -16 },
      { x: 194, z: -51 }
    ]
  },
  {
    id: "melliona-hive-dungeon-mobs",
    title: "Melliona Hive Dungeon",
    floor: "floor2",
    underground: true,
    fill: "rgba(255, 184, 0, 0.24)",
    stroke: "#f4b400",
    corners: [
      { x: 557, z: -708 },
      { x: 652, z: -684 },
      { x: 652, z: -485 },
      { x: 515, z: -397 },
      { x: 230, z: -387 },
      { x: 230, z: -547 },
      { x: 343, z: -737 }
    ]
  },
  {
    id: "inferno-nest-mobs",
    title: "Inferno Nest",
    floor: "floor2",
    underground: true,
    fill: "rgba(255, 92, 0, 0.24)",
    stroke: "#ff5c00",
    corners: [
      { x: -768, z: 252 },
      { x: -543, z: 367 },
      { x: -448, z: 209 },
      { x: -570, z: 157 }
    ]
  },
  {
    id: "sanctuary-of-khesun-interior-mobs",
    title: "Interior of the Sanctuary of Khesun",
    floor: "floor2",
    underground: true,
    fill: "rgba(255, 248, 220, 0.28)",
    stroke: "#f2e8c6",
    corners: [
      { x: -42, z: 212 },
      { x: -42, z: 67 },
      { x: -21, z: 41 },
      { x: 6, z: 41 },
      { x: 28, z: 67 },
      { x: 28, z: 212 }
    ]
  },
  {
    id: "veins-of-sablemor-mobs",
    title: "The Veins of Sablemor",
    floor: "floor2",
    underground: true,
    fill: "rgba(245, 240, 90, 0.24)",
    stroke: "#d8d94b",
    corners: [
      { x: 152, z: 262 },
      { x: 152, z: 376 },
      { x: 289, z: 376 },
      { x: 287, z: 262 }
    ]
  },
  {
    id: "forgotten-tomb-of-the-necromancer-mobs",
    title: "Dungeon Forgotten Tomb of the Necromancer",
    floor: "floor2",
    underground: true,
    fill: "rgba(182, 74, 167, 0.24)",
    stroke: "#b24aa7",
    corners: [
      { x: 524, z: 289 },
      { x: 974, z: 289 },
      { x: 974, z: 39 },
      { x: 733, z: -150 },
      { x: 524, z: 144 }
    ]
  }
];

if (typeof window !== "undefined") window.SAO_CURRENT_MOB_AREAS = CURRENT_MOB_AREAS;
