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
    coords: { x: 2, z: 17 },
    drops: ["N/A"],
    description: "Talk to the Mysterious Character (2, 200, 17)"
  },
  "mq-2": {
    title: "A Decisive Choice",
    type: "Quest",
    category: "mainQuests",
    floor: "floor1",
    questNumber: 2,
    coords: { x: 1010, z: 20 },
    drops: ["N/A"],
    description: "Talk to the Master Swordsman (1010, 200, 20)"
  },
  "mq-3": {
    title: "A New Horizon",
    type: "Quest",
    category: "mainQuests",
    floor: "floor1",
    questNumber: 3,
    coords: { x: 1091, z: 4301 },
    drops: ["N/A"],
    description: "Talk to the Swordmaster (1091, 19, 4301)"
  },
  "mq-4": {
    title: "Show Me",
    type: "Quest",
    category: "mainQuests",
    floor: "floor1",
    questNumber: 4,
    coords: { x: 1818, z: 4148 },
    drops: ["N/A"],
    description: "Take the teleporter Facing the Forge (1818, 17, 4148)"
  },
  "mq-5": {
    title: "The Essentials",
    type: "Quest",
    category: "mainQuests",
    floor: "floor1",
    questNumber: 5,
    coords: { x: 1774, z: 4108 },
    drops: ["N/A"],
    description: "Find the Alchemist in his workshop (1774, 16, 4108)"
  },
  "mq-6": {
    title: "What No One Will Touch",
    type: "Quest",
    category: "mainQuests",
    floor: "floor1",
    questNumber: 6,
    coords: { x: 1774, z: 4108 },
    drops: ["N/A"],
    description: "Tell him about the shard (1774, 16, 4108)"
  },
  "mq-20": {
    title: "What No One Will Touch",
    type: "Quest",
    category: "mainQuests",
    floor: "floor1",
    questNumber: 20,
    coords: { x: 1091, z: 4301 },
    drops: ["N/A"],
    description: "Go see the Swordmaster (1091, 19, 4301)"
  },
  "mq-21": {
    title: "The Assault",
    type: "Quest",
    category: "mainQuests",
    floor: "floor1",
    questNumber: 21,
    coords: { x: 1360, z: 3551 },
    drops: ["N/A"],
    description: "Repel the first wave. Shared quest-start location with Main Quest 22 (1360, 26, 3551)."
  },
  "mq-22": {
    title: "The Forest of Small Webs",
    type: "Quest",
    category: "mainQuests",
    floor: "floor1",
    questNumber: 22,
    coords: { x: 1360, z: 3551 },
    drops: ["N/A"],
    description: "Travel to the Forest of Small Webs (1360, 26, 3551)"
  }
});

[
  {
    id: "mq-23",
    title: "Bury Them",
    number: 23,
    coords: { x: 1343, z: 3533 },
    description: "Carry the First body on your back (1343, 28, 3533)"
  },
  {
    id: "mq-24",
    title: "The Trader",
    number: 24,
    coords: { x: 1566, z: 3440 },
    description: "Meet the Mayor's Trader (1566, 36, 3440)"
  },
  {
    id: "mq-25",
    title: "The Slime Marsh",
    number: 25,
    coords: { x: 501, z: 3055 },
    description: "Talk to Ceyla (501, 24, 3055)"
  },
  {
    id: "mq-26",
    title: "The Foot of the Island",
    number: 26,
    coords: { x: 509, z: 3056 },
    description: "Talk to Baldim (509, 24, 3056)"
  },
  {
    id: "mq-27",
    title: "By the Branches of the Ancients",
    number: 27,
    coords: { x: 288, z: 2460 },
    description: "Collect 3 bark from the old oak ~(288, 161, 2460)"
  },
  {
    id: "mq-28",
    title: "The Broken Knot",
    number: 28,
    coords: { x: 500, z: 3059 },
    description: "Join Zebulgarath at the teleporter ~(500, 24, 3059)"
  },
  {
    id: "mq-29",
    title: "The Suspended City",
    number: 29,
    coords: { x: 468, z: 3011 },
    description: "Find 3 clues in the village of Vallhat (468, 87, 3011)"
  },
  {
    id: "mq-30",
    title: "What Emanates From You",
    number: 30,
    coords: { x: 486, z: 3070 },
    description: "Talk to Baldim before leaving Vallhat (486, 86, 3070)"
  },
  {
    id: "mq-31",
    title: "He Came",
    number: 31,
    coords: { x: 1091, z: 4301 },
    description: "Talk to the Master Swordsman (1091, 19, 4301)"
  },
  {
    id: "mq-32",
    title: "At Elma's",
    number: 32,
    coords: { x: 3138, z: 3680 },
    description: "Talk with Elma 3 Times (3138, 27, 3680)"
  },
  {
    id: "mq-33",
    title: "What Harrold Saw",
    number: 33,
    coords: { x: 4303, z: 3716 },
    description: "Go to the well, on the eastern road ~(4303, 178, 3716)"
  },
  {
    id: "mq-34",
    title: "The Chamber Beneath the Fields",
    number: 34,
    coords: { x: 4283, z: 3722 },
    description: "Explore the tunnels ~(4283, 44, 3722)"
  },
  {
    id: "mq-35",
    title: "The Geldorack Mine",
    number: 35,
    coords: { x: 4289, z: 3902 },
    description: "Talk to Bob (4289, 159, 3902)"
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
