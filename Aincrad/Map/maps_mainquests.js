// AINCRAD MAIN QUESTLINE MAP MARKERS
//
// Marker positions come from the first meaningful quest location supplied by the questline.
// Quests whose objectives contain no coordinates are intentionally omitted rather than guessed
// (Main Quest 10 lives in the Fractured Underworld and has no supplied location).
// Main Quest 19 is a menu action with no physical location, so it has no marker anywhere.
// Main Quest 21 shares its quest-start location with Main Quest 22 as specified.

Object.assign(DATA, {
  "mq-1": {
    title: "A New World",
    type: "Quest",
    category: "mainQuests",
    floor: "floor1",
    questNumber: 1,
    coords: { x: 0, z: 5 },
    drops: ["N/A"],
    description: "Talk to the Mysterious Character (0, 200, 5)"
  },
  "mq-2": {
    title: "A Decisive Choice",
    type: "Quest",
    category: "mainQuests",
    floor: "floor1",
    questNumber: 2,
    coords: { x: 1008, z: 8 },
    drops: ["N/A"],
    description: "Talk to the Master Swordsman (1008, 200, 8)"
  },
  "mq-3": {
    title: "A New Horizon",
    type: "Quest",
    category: "mainQuests",
    floor: "floor1",
    questNumber: 3,
    coords: { x: 1089, z: 4289 },
    drops: ["N/A"],
    description: "Talk to the Swordmaster (1089, 19, 4289)"
  },
  "mq-4": {
    title: "Show Me",
    type: "Quest",
    category: "mainQuests",
    floor: "floor1",
    questNumber: 4,
    coords: { x: 1816, z: 4136 },
    drops: ["N/A"],
    description: "Take the teleporter Facing the Forge (1816, 17, 4136)"
  },
  "mq-5": {
    title: "The Essentials",
    type: "Quest",
    category: "mainQuests",
    floor: "floor1",
    questNumber: 5,
    coords: { x: 1772, z: 4096 },
    drops: ["N/A"],
    description: "Find the Alchemist in his workshop (1772, 16, 4096)"
  },
  "mq-6": {
    title: "What No One Will Touch",
    type: "Quest",
    category: "mainQuests",
    floor: "floor1",
    questNumber: 6,
    coords: { x: 1772, z: 4096 },
    drops: ["N/A"],
    description: "Tell him about the shard (1772, 16, 4096)"
  },
  "mq-20": {
    title: "What No One Will Touch",
    type: "Quest",
    category: "mainQuests",
    floor: "floor1",
    questNumber: 20,
    coords: { x: 1089, z: 4289 },
    drops: ["N/A"],
    description: "Go see the Swordmaster (1089, 19, 4289)"
  },
  "mq-21": {
    title: "The Assault",
    type: "Quest",
    category: "mainQuests",
    floor: "floor1",
    questNumber: 21,
    coords: { x: 1358, z: 3539 },
    drops: ["N/A"],
    description: "Repel the first wave. Shared quest-start location with Main Quest 22 (1358, 26, 3539)."
  },
  "mq-22": {
    title: "The Forest of Small Webs",
    type: "Quest",
    category: "mainQuests",
    floor: "floor1",
    questNumber: 22,
    coords: { x: 1358, z: 3539 },
    drops: ["N/A"],
    description: "Travel to the Forest of Small Webs (1358, 26, 3539)"
  }
});

[
  {
    id: "mq-23",
    title: "Bury Them",
    number: 23,
    coords: { x: 1341, z: 3521 },
    description: "Carry the First body on your back (1341, 28, 3521)"
  },
  {
    id: "mq-24",
    title: "The Trader",
    number: 24,
    coords: { x: 1564, z: 3428 },
    description: "Meet the Mayor's Trader (1564, 36, 3428)"
  },
  {
    id: "mq-25",
    title: "The Slime Marsh",
    number: 25,
    coords: { x: 499, z: 3043 },
    description: "Talk to Ceyla (499, 24, 3043)"
  },
  {
    id: "mq-26",
    title: "The Foot of the Island",
    number: 26,
    coords: { x: 507, z: 3044 },
    description: "Talk to Baldim (507, 24, 3044)"
  },
  {
    id: "mq-27",
    title: "By the Branches of the Ancients",
    number: 27,
    coords: { x: 286, z: 2448 },
    description: "Collect 3 bark from the old oak ~(286, 161, 2448)"
  },
  {
    id: "mq-28",
    title: "The Broken Knot",
    number: 28,
    coords: { x: 498, z: 3047 },
    description: "Join Zebulgarath at the teleporter ~(498, 24, 3047)"
  },
  {
    id: "mq-29",
    title: "The Suspended City",
    number: 29,
    coords: { x: 466, z: 2999 },
    description: "Find 3 clues in the village of Vallhat (466, 87, 2999)"
  },
  {
    id: "mq-30",
    title: "What Emanates From You",
    number: 30,
    coords: { x: 484, z: 3058 },
    description: "Talk to Baldim before leaving Vallhat (484, 86, 3058)"
  },
  {
    id: "mq-31",
    title: "He Came",
    number: 31,
    coords: { x: 1089, z: 4289 },
    description: "Talk to the Master Swordsman (1089, 19, 4289)"
  },
  {
    id: "mq-32",
    title: "At Elma's",
    number: 32,
    coords: { x: 3136, z: 3668 },
    description: "Talk with Elma 3 Times (3136, 27, 3668)"
  },
  {
    id: "mq-33",
    title: "What Harrold Saw",
    number: 33,
    coords: { x: 4301, z: 3704 },
    description: "Go to the well, on the eastern road ~(4301, 178, 3704)"
  },
  {
    id: "mq-34",
    title: "The Chamber Beneath the Fields",
    number: 34,
    coords: { x: 4281, z: 3710 },
    description: "Explore the tunnels ~(4281, 44, 3710)"
  },
  {
    id: "mq-35",
    title: "The Geldorack Mine",
    number: 35,
    coords: { x: 4287, z: 3890 },
    description: "Talk to Bob (4287, 159, 3890)"
  }
].forEach((quest) => {
  DATA[quest.id] = {
    title: quest.title,
    type: "Quest",
    category: "mainQuests",
    floor: "floor1",
    questNumber: quest.number,
    coords: quest.coords,
    drops: ["N/A"],
    description: quest.description
  };
});
