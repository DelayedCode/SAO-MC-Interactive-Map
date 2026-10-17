// MAIN QUESTLINE AND SIDE QUEST DATA (CURRENT DATA ONLY)
//
// These are the Aincrad / Fractured Underworld Main Quests plus the Current Data side quests.
// They live exclusively in the Current Data dataset, so Beta-Test Data stays completely
// main-quest-less and keeps its own side quests.
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
      "Enter the Mine (4288, 159, 3887)",
      "Complete the dungeon (4288, 159, 3887)",
      "Leave the Mine Entrance ~(4260, 152, 3892)",
      "Find Velka in Castlebrume (2922, 162, 3006)",
      "(Bonus) Hand the rare material to the Hanaka merchant"
    ]
  },
  /* The source notes label both "The Slime Marsh" and its continuation "The Foot of the Island"
     as Quest 25, so the continuation keeps its own number (26) and every later quest runs one
     number above the notes' label. */
  {
    number: 36,
    title: "Velka, and the Ruins of the Dream",
    npcName: "Velka",
    coords: { x: 2922, z: 3006 },
    objectives: [
      "Talk to Velka (2922, 162, 3006)",
      "Show the corrupted wheat (Strange wheat ear) to Velka (2922, 162, 3006)",
      "Find the ruins to the south (2842, 16, 4400)"
    ]
  },
  {
    number: 37,
    title: "The Archivist Specter",
    npcName: "Archivist Specter",
    coords: { x: 2849, z: 4342 },
    objectives: [
      "Speak with the Archivist Specter to continue the main story (2849, -28, 4342)",
      "Collect 10 cursed cloth",
      "Defeat Narax, the cursed spirit of the ruins (2757, -32, 4285)",
      "Bring the payment to the Specter (2849, -28, 4342)"
    ]
  },
  {
    number: 38,
    title: "Behind the Great Door",
    npcName: "N/A",
    coords: { x: 2848, z: 4254 },
    objectives: [
      "Cross the unsealed door ~(2848, -34, 4254)",
      "Defeat Nasgul, Cursed Protector",
      "Retrieve the third Fragment of the Seal of the Ancients",
      "Speak with the Echo of A: the Seal reforms",
      "Take the passage",
      "Go to the Labyrinth of the Fallen (2382, 29, 2415)"
    ]
  },
  {
    number: 39,
    title: "The Truth About the Seal",
    npcName: "Catherine",
    coords: null,
    objectives: ["Speak with Catherine to continue the main story"]
  },
  {
    number: 40,
    title: "The Calamity",
    npcName: "Master Swordsman",
    coords: { x: 1809, z: 4289 },
    objectives: [
      "Speak with the Master Swordsman to continue the main story (1809, 4289)",
      "Tell him what happened in the Labyrinth (1809, 4289)",
      "Choice: continue, or give up",
      "Ask the 3 mages about the crystal",
      "Question a mage of Tolbana (3321, 1619)",
      "Question a mage of Tolbana (3200, 1447)",
      "Question a mage of Tolbana (3198, 1469)",
      "Go and see Mephisto (3260, 1403)"
    ]
  },
  {
    number: 41,
    title: "Mephisto",
    npcName: "Mephisto",
    coords: { x: 3260, z: 1403 },
    objectives: [
      "Speak with Mephisto to continue the main story (3260, 1403)",
      "Answer Mephisto's question (3260, 1403) (An Instrument)",
      "Learn the mechanism: scroll + crystal (3260, 1403)"
    ]
  },
  {
    number: 42,
    title: "Request an Audience with King Harald",
    npcName: "King Harald",
    coords: { x: 3199, z: 1510 },
    objectives: [
      "Go to the Harald palace (3199, 1510)",
      "Speak with King Harald (3198, 1524)",
      "Learn that a description of him exists in the archives (3198, 1524)"
    ]
  },
  {
    number: 43,
    title: "The Trials of the Heralds",
    npcName: "N/A",
    coords: { x: 3681, z: 1648 },
    objectives: [
      "Find the tomb of the ancestors (3681, 1648)",
      "Trial of Harald 1 (3781, 1673)",
      "Trial of Harald 2 (3741, 1714)",
      "Trial of Harald 3 (3701, 1667)",
      "Receive the three dates (−700, −620, −660)",
      "Return to King Harald (3198, 1524)"
    ]
  },
  {
    number: 44,
    title: "Find a Way to Remake the Scroll",
    npcName: "Emy",
    coords: { x: 3227, z: 1495 },
    objectives: [
      "Find Emy in the Tolbana Forge (3227, 1495)",
      "Learn what it takes to remake the scroll (3227, 1495)",
      "Enter the old mill (2771, 4777)",
      "Find the challenge area ~(868, 1675)",
      "Accept the challenge",
      "Find the object in the time allowed",
      "Go to Virelune (1617, 1958)",
      "Speak with Dorven (1618, 1959)",
      "Inspect the rocks, see if there's any way in (1419, 1986)",
      "Bring everything back to Emy (3227, 1495)"
    ]
  },
  {
    number: 45,
    title: "The Crystal of Tolbana",
    npcName: "Mephisto",
    coords: { x: 3260, z: 1403 },
    objectives: [
      "Return to Mephisto (3260, 1403)",
      "Meet him at the door, near the forge (3239, 1461)",
      "Follow him to the door (3216, 1445)",
      "Go down beneath the crystal (3047, 1208)",
      "Meet Mephisto at the Kobold Tower (3400, 1080)"
    ]
  },
  /* The Floor 2 transition closes the floor 1 main questline. The source notes label it "Quest 35"
     as well, so it simply continues the questline's own numbering and carries no location. */
  {
    number: 46,
    title: "Floor 2",
    npcName: "N/A",
    coords: null,
    objectives: ["Reach Floor 2"]
  }
];
/* CURRENT DATA SIDE QUESTS
   The source notes label these entries "Quest" and "Side Quest" interchangeably; all eight are
   side quests, so neither prefix is part of the displayed title. Coordinates are the NPC
   coordinates the notes supply, in the same "X / Z" Minecraft space the Main Questline uses.
   Numbers run 1-8 in their own `sq-` namespace, exactly like the map's `sq-`/`mq-` markers, so
   they can never collide with the Main Questline's numbers. */
const CURRENT_SIDE_QUESTS = [
  {
    number: 1,
    title: "Too Many Boars",
    npcName: "Guard Tomas",
    coords: { x: 1811, z: 3748 },
    xpReward: 300,
    colReward: 80,
    objectives: ["Kill enraged boars (0/10)", "Return to Guard Tomas (1811, 3748)"]
  },
  {
    number: 2,
    title: "Webs to Burn",
    npcName: "Scout Raphael",
    coords: { x: 1440, z: 3449 },
    xpReward: 550,
    colReward: 150,
    objectives: ["Kill young spiders (0/15)", "Return to Scout Raphael (1440, 3449)"]
  },
  {
    number: 3,
    title: "The Citadel's Cold",
    npcName: "Sentinel Kael",
    coords: { x: 4075, z: 1990 },
    xpReward: 700,
    colReward: 200,
    objectives: ["Take down winter golems (0/10)", "Return to Sentinel Kael (4075, 1990)"]
  },
  {
    number: 4,
    title: "Frost Swarm",
    npcName: "Hunter Lysa",
    coords: { x: 4074, z: 1994 },
    xpReward: 350,
    colReward: 100,
    objectives: ["Shoot down frost butterflies (0/12)", "Return to Shepherd Ivo (4074, 1994)"]
  },
  {
    number: 5,
    title: "Wolves of the Valley",
    npcName: "Shepherd Ivo",
    coords: { x: 2405, z: 4069 },
    xpReward: 400,
    colReward: 100,
    objectives: ["Killing White Wolves (0/12)", "Return to Shepherd Ivo (2405, 4069)"]
  },
  {
    number: 6,
    title: "Clearing the Marsh",
    npcName: "Herbalist Nessa",
    coords: { x: 1542, z: 3460 },
    xpReward: 450,
    colReward: 120,
    objectives: ["Kill spawn slimes (0/20)", "Return to Herbalist Nessa (1542, 3460)"]
  },
  {
    number: 7,
    title: "Bone and Dust",
    npcName: "Archivist Orin",
    coords: { x: 2765, z: 4396 },
    xpReward: 600,
    colReward: 160,
    objectives: ["Slay skeleton warriors (0/20)", "Return to Archivist Orin (2765, 4396)"]
  },
  {
    number: 8,
    title: "The Road Is No Longer Safe",
    npcName: "Carter Milo",
    coords: { x: 3619, z: 3443 },
    xpReward: 550,
    colReward: 150,
    objectives: ["Kill highway bandits (0/15)", "Return to Carter Milo (3619, 3443)"]
  }
];
/* Formats the supplied objective list into the quest table's existing text field. */
function buildQuestObjectives(quest) {
  return quest.objectives.join("\n");
}

/* Formats the supplied coordinates as "X / Z", matching the existing quest table style. */
function buildQuestCoordinates(quest) {
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
  coordinates: buildQuestCoordinates(quest),
  requirements: buildQuestObjectives(quest),
  xpReward: "N/A",
  colReward: "N/A",
  bonusItems: "N/A"
}));

/* The side quests use the very same entry shape, so the Quest page's Side filter, its completion
   state and its localization resolve them without any page change. Unlike the questline they do
   carry the EXP and Col rewards the notes supply. */
window.SAO_CURRENT_SIDE_QUESTS = CURRENT_SIDE_QUESTS.map((quest) => ({
  id: `sq-${quest.number}`,
  questNumber: quest.number,
  questType: "side",
  world: "aincrad",
  island: null,
  markerCoords: quest.coords,
  questName: quest.title,
  npcName: quest.npcName,
  city: "N/A",
  coordinates: buildQuestCoordinates(quest),
  requirements: buildQuestObjectives(quest),
  xpReward: quest.xpReward,
  colReward: quest.colReward,
  bonusItems: "N/A"
}));

// Current Data surfaces the Main Questline and its own side quests. Beta-Test Data keeps its
// existing floor side quests only.
window.SAO_CURRENT_QUEST_ENTRIES_BY_FLOOR = {
  floor1: [...window.SAO_MAIN_QUESTLINE, ...window.SAO_CURRENT_SIDE_QUESTS],
  floor2: [],
  floor3: []
};
