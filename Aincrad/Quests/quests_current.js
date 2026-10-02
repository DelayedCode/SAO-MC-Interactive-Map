// MAIN QUESTLINE DATA (CURRENT DATA ONLY)
//
// These are the Aincrad / Fractured Underworld Main Quests. They live exclusively in the
// Current Data dataset, so Beta-Test Data stays completely main-quest-less.
// Beta side quests continue to come from quests_floor1.js / quests_floor2.js / quests_floor3.js.
//
// Source text (titles, objectives, coordinates) is preserved verbatim. The English values are
// the translation source; es/fr resolve through the shared content-translation registry.

const MAIN_QUESTLINE = [
  {
    number: 1,
    title: "A New World",
    npcName: "Mysterious Character",
    coords: { x: 0, z: 5 },
    objectives: ["Talk to the Mysterious Character (0, 200, 5)"]
  },
  {
    number: 2,
    title: "A Decisive Choice",
    npcName: "Master Swordsman",
    coords: { x: 1008, z: 8 },
    objectives: [
      "Talk to the Master Swordsman (1008, 200, 8)",
      "Try the Warrior Class",
      "Try the Archer Class",
      "Try the Shaman Class",
      "Try the Mage Class",
      "Try the Assassin Class",
      "Talk to the Master Swordsman (1008, 200, 8)"
    ]
  },
  {
    number: 3,
    title: "A New Horizon",
    npcName: "Swordmaster",
    coords: { x: 1089, z: 4289 },
    objectives: [
      "Talk to the Swordmaster (1089, 19, 4289)",
      "Buy a chestplate: the Beginner's Tunic",
      "Buy the Beginner's Leggings",
      "Buy a Training Sword/Training Magic Staff/Training Bow/Training Dagger (Item Depends on your class)",
      "Go back up to the Swordmaster (1089, 19, 4289)"
    ]
  },
  {
    number: 4,
    title: "Show Me",
    npcName: "N/A",
    coords: { x: 1816, z: 4136 },
    objectives: [
      "Take the teleporter Facing the Forge (1816, 17, 4136)",
      "Talk to the apprentice blacksmith (1789, 32, 3636)",
      "Slay 16 Boars ~(1798, 31, 3617)",
      "Bring 16 Hides to the Blacksmith (1789, 32, 3636)",
      "Bring the hides back to Abraham (1789, 32, 3636)"
    ]
  },
  {
    number: 5,
    title: "The Essentials",
    npcName: "Alchemist",
    coords: { x: 1772, z: 4096 },
    objectives: [
      "Find the Alchemist in his workshop (1772, 16, 4096)",
      "Gather 5 allium Flowers in the Fields north-east of the village. ~(2362, 22, 3651)",
      "Gather 5 Wheat in the Fields north-east of the village. ~(2362, 22, 3651)",
      "Get closer to the noise. (2372, 20, 3702)",
      "Go back to the Alchemist (1772, 16, 4096)"
    ]
  },
  {
    number: 6,
    title: "What No One Will Touch",
    npcName: "N/A",
    coords: { x: 1772, z: 4096 },
    objectives: [
      "Tell him about the shard (1772, 16, 4096)",
      "Go see the Sword Master (1089, 19, 4289)",
      "Reach the impact site, in the Petal Valley (1051, 38, 4367)"
    ]
  },
  {
    number: 7,
    title: "The New World",
    npcName: "Eugeo",
    world: "underworld",
    island: "playerIsland",
    coords: { x: 0, z: 7 },
    objectives: [
      "Talk to Eugeo (0, 65, 7)",
      "Consult the Mysterious Cube (-1, 65, 7)",
      "Talk to Eugeo again (0, 65, 7)"
    ]
  },
  {
    number: 8,
    title: "Towards the Gigas Cedar...",
    npcName: "Eugeo",
    world: "underworld",
    island: "gigasCedar",
    coords: { x: -70, z: 176 },
    objectives: ["Meet up with Eugeo at the Foot of the tree (-70, -24, 176)"]
  },
  {
    number: 9,
    title: "Cutting wood...",
    npcName: "N/A",
    world: "underworld",
    island: "gigasCedar",
    coords: { x: -70, z: 176 },
    objectives: ["Harvest 10 Oak Log", "Go back to Eugeo (-70, -24, 176)"]
  },
  {
    number: 10,
    title: "Analyze the Gigas Cedar",
    npcName: "N/A",
    world: "underworld",
    island: "gigasCedar",
    coords: null,
    objectives: ["Use System Call to view information about the Gigas Cedar."]
  },
  {
    number: 11,
    title: "Stabilizing the Cardinal Relay...",
    npcName: "Eugeo",
    world: "underworld",
    island: "gigasCedar",
    coords: { x: -70, z: 176 },
    objectives: ["Go back to Eugeo (-70, -24, 176)", "Use the resources you've collected to upgrade the Cardinal Relay"]
  },
  {
    number: 12,
    title: "The Forge before the sword...",
    npcName: "Eugeo",
    world: "underworld",
    island: "playerIsland",
    coords: { x: 0, z: 7 },
    objectives: [
      "Talk to Eugeo to find out more (0, 65, 7)",
      "Forge a Training Dagger",
      "Show the Forged weapon to Eugeo (0, 65, 7)"
    ]
  },
  {
    number: 13,
    title: "The village or Rulid...",
    npcName: "N/A",
    world: "underworld",
    island: "rulid",
    coords: { x: 189, z: 226 },
    objectives: ["Teleport to Rulid", "Find Eugeo in Rulid (189, 71, 226)"]
  },
  {
    number: 14,
    title: "Blessing of the Hero...",
    npcName: "Selka",
    world: "underworld",
    island: "rulid",
    coords: { x: 188, z: 231 },
    objectives: ["Talk to Selka (188, 71, 231)"]
  },
  {
    number: 15,
    title: "The First Harvests",
    npcName: "Eugeo",
    world: "underworld",
    island: "rulid",
    coords: { x: 189, z: 226 },
    objectives: [
      "Go back and see Eugeo (189, 71, 226)",
      "Harvest 3 wheat of Rulid",
      "Harvest 1 Wheat Blossom",
      "Go back to your Island",
      "Pickup a Field From the system creation and put it down",
      "Plant 1 Wheat Seed",
      "Return to Eugeo (0, 65, 7)"
    ]
  },
  {
    number: 16,
    title: "Calm Water",
    npcName: "Eugeo",
    world: "underworld",
    island: "fishingIsland",
    coords: { x: -75, z: 74 },
    objectives: [
      "Find Eugeo on the Fishing Island (-75, 66, 74)",
      "Fish 1 Trout",
      "Fish 1 Carp",
      "Go back and see Eugeo on your Island (0, 65, 7)"
    ]
  },
  {
    number: 17,
    title: "Azure Crystals",
    npcName: "Eugeo",
    world: "underworld",
    island: "iceCave",
    coords: { x: -117, z: 128 },
    objectives: [
      "Join Eugeo at the Ice Cave (-117, 87, 128)",
      "Harvest 3 Azure Crystals (3)",
      "Go back and see Eugeo at the back of the cave (-111, 88, 203)"
    ]
  },
  {
    number: 18,
    title: "Memory Labrinth: The Goblin Cave of Rulid",
    npcName: "N/A",
    world: "underworld",
    island: "playerIsland",
    coords: { x: 0, z: 7 },
    objectives: ["Emerge victorious From the Memory Labyrinth", "Talk to Eugeo (0, 65, 7)"]
  },
  {
    number: 19,
    title: "Back to Aincrad",
    npcName: "N/A",
    world: "menu",
    coords: null,
    objectives: ["Go back to Aincrad: open the game menu and click the Aincrad icon"]
  },
  {
    number: 20,
    title: "What No One Will Touch",
    npcName: "Swordmaster",
    coords: { x: 1089, z: 4289 },
    objectives: [
      "Go see the Swordmaster (1089, 19, 4289)",
      "Go back to the Master Swordsman (1089, 19, 4289)",
      "Travel to Hanaka ~(1576, 31, 3460)"
    ]
  },
  {
    number: 21,
    title: "The Assault",
    npcName: "N/A",
    coords: { x: 1358, z: 3539 },
    objectives: [
      "Repel the first wave (5)",
      "Repel the second wave (5)",
      "Repel the final wave (5)",
      "Free the villager (right-click)",
      "Talk to the Mayor (1526, 30, 3412)"
    ]
  },
  {
    number: 22,
    title: "The Forest of Small Webs",
    npcName: "N/A",
    coords: { x: 1358, z: 3539 },
    objectives: [
      "Travel to the Forest of Small Webs (1358, 26, 3539)",
      "Find the second body (1341, 28, 3521)",
      "Find the third body (1375, 30, 3512)",
      "Report back to the Mayor (1526, 30, 3412)"
    ]
  },
  {
    number: 23,
    title: "Bury Them",
    npcName: "N/A",
    coords: { x: 1341, z: 3521 },
    objectives: [
      "Carry the First body on your back (1341, 28, 3521)",
      "Carry the second body on your back (1375, 30, 3512)",
      "Carry the third body on your back (1526, 30, 3412)",
      "Bury a body in the First grave (1256, 42, 3770)",
      "Bury a body in the second grave (1254, 42, 3770)",
      "Bury a body in the third grave (1252, 42, 3770)",
      "Return to the Mayor of Hanaka (1526, 30, 3412)"
    ]
  },
  {
    number: 24,
    title: "The Trader",
    npcName: "Mayor's Trader",
    coords: { x: 1564, z: 3428 },
    objectives: [
      "Meet the Mayor's Trader (1564, 36, 3428)",
      "Kill 15 Spiders",
      "Collect 5 venom glands",
      "Bring the venom to the trader",
      "Talk to the Trader (1564, 36, 3428)"
    ]
  },
  {
    number: 25,
    title: "The Slime Marsh",
    npcName: "N/A",
    coords: { x: 499, z: 3043 },
    objectives: ["Take the western road to the Foot of the Island", "Talk to Ceyla (499, 24, 3043)"]
  },
  {
    number: 26,
    title: "The Foot of the Island",
    npcName: "Baldim",
    coords: { x: 507, z: 3044 },
    objectives: [
      "Talk to Baldim (507, 24, 3044)",
      "Go to the Garden of Giants ~(374, 159, 2479)",
      "Talk to Zebulgarath (374, 159, 2479)"
    ]
  },
  {
    number: 27,
    title: "By the Branches of the Ancients",
    npcName: "N/A",
    coords: { x: 286, z: 2448 },
    objectives: ["Collect 3 bark from the old oak ~(286, 161, 2448)", "Bring the bark back to Zebulgarath"]
  },
  {
    number: 28,
    title: "The Broken Knot",
    npcName: "Zebulgarath",
    coords: { x: 498, z: 3047 },
    objectives: [
      "Join Zebulgarath at the teleporter ~(498, 24, 3047)",
      "Talk to Zebulgarath ~(498, 24, 3047)",
      "Talk to Baldim (484, 86, 3058)"
    ]
  },
  {
    number: 29,
    title: "The Suspended City",
    npcName: "N/A",
    coords: { x: 466, z: 2999 },
    objectives: [
      "Find 3 clues in the village of Vallhat (466, 87, 2999), (398, 126, 3080), (450, 119, 3116)",
      "Talk to the villager who saw the creatures",
      "Show the book to Baldim (484, 86, 3058)",
      "Talk to Lisa (450, 119, 3116)",
      "Search for traces of Isaac in the southern marshes ~(317, 44, 3200)",
      "Kill Gorbel, king of slimes ~(317, 44, 3200)",
      "Talk to Isaac (325, 44, 3194)",
      "Follow Isaac (325, 44, 3194)",
      "Talk to Baldim (484, 86, 3058)"
    ]
  },
  {
    number: 30,
    title: "What Emanates From You",
    npcName: "Baldim",
    coords: { x: 484, z: 3058 },
    objectives: [
      "Talk to Baldim before leaving Vallhat (484, 86, 3058)",
      "Go to the marshes north of Hanaka (1421, 48, 3091)",
      "Interact with the mysterious green mass (1421, 48, 3091)",
      "Retrieve the First Fragment of the Seal of the Ancients (1441, 125, 3091)"
    ]
  },
  {
    number: 31,
    title: "He Came",
    npcName: "Master Swordsman",
    coords: { x: 1089, z: 4289 },
    objectives: [
      "Talk to the Master Swordsman (1089, 19, 4289)",
      "Go to Mizunari (3133, 27, 3656)",
      "Talk to Elma (3136, 27, 3668)"
    ]
  },
  {
    number: 32,
    title: "At Elma's",
    npcName: "Elma",
    coords: { x: 3136, z: 3668 },
    objectives: [
      "Talk with Elma 3 Times (3136, 27, 3668)",
      "Go up to the Fields, north of the forest ~(3334, 32, 3779)",
      "Kill the 3 Nephentes at the foot of the shed ~(3334, 32, 3779)",
      "Clear the area of 5 Nephentes ~(3334, 32, 3779)",
      "Go back to Harrold (3335, 32, 3782)",
      "Harvest 8 strange wheat ears (3401, 25, 3749)",
      "Return to Elma in Mizunari ~(3136, 27, 3668)",
      "Talk to Harrold (3134, 27, 3666)"
    ]
  },
  {
    number: 33,
    title: "What Harrold Saw",
    npcName: "Harrold",
    coords: { x: 4301, z: 3704 },
    objectives: ["Hear what Harrold saw 3 times", "Go to the well, on the eastern road ~(4301, 178, 3704)"]
  },
  {
    number: 34,
    title: "The Chamber Beneath the Fields",
    npcName: "N/A",
    coords: { x: 4281, z: 3710 },
    objectives: [
      "Explore the tunnels ~(4281, 44, 3710)",
      "Go back up and report to Harrold (3134, 27, 3666)",
      "Go to where the bandits live (4204, 133, 3899)",
      "Talk to Bob (4287, 159, 3890)"
    ]
  },
  {
    number: 35,
    title: "The Geldorack Mine",
    npcName: "Bob",
    coords: { x: 4287, z: 3890 },
    objectives: [
      "Talk to Bob (4287, 159, 3890)",
      "Obtain the Geldorack Dungeon Key (4288, 159, 3887)",
      "Enter the Mine (4288, 159, 3887)"
    ]
  }
];
/* Formats the supplied objective list into the quest table's existing text field. */
function buildMainQuestObjectives(quest) {
  return quest.objectives.join("\n");
}

/* Formats the supplied coordinates as "X / Z", matching the existing quest table style. */
function buildMainQuestCoordinates(quest) {
  if (!quest.coords) return "N/A";
  return `${quest.coords.x} / ${quest.coords.z}`;
}

/* Maps the questline onto the existing quest entry shape so the Quest page, its type
   filter, its completion state and its localization all keep working unchanged. */
window.SAO_MAIN_QUESTLINE = MAIN_QUESTLINE.map((quest) => ({
  id: `mq-${quest.number}`,
  questNumber: quest.number,
  questType: "main",
  world: quest.world || "aincrad",
  island: quest.island || null,
  markerCoords: quest.coords,
  questName: quest.title,
  npcName: quest.npcName,
  city: "N/A",
  coordinates: buildMainQuestCoordinates(quest),
  requirements: buildMainQuestObjectives(quest),
  xpReward: "N/A",
  colReward: "N/A",
  bonusItems: "N/A"
}));

// Current Data surfaces the Main Questline. Beta-Test Data keeps its existing side quests only.
window.SAO_CURRENT_QUEST_ENTRIES_BY_FLOOR = {
  floor1: window.SAO_MAIN_QUESTLINE,
  floor2: [],
  floor3: []
};
