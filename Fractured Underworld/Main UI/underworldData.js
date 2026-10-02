// FRACTURED UNDERWORLD MAIN QUESTLINE MAP MARKERS
//
// Main Quests 7 to 18 belong to the Fractured Underworld. Each marker uses the island the
// questline names (Player Island, Gigas Cedar, Rulid, Fishing Island, Ice Cave), matching the
// existing Fractured Underworld floor ids used by the map adapter.
//
// Main Quest 10 ("Analyze the Gigas Cedar") supplies no coordinates in the questline, so it is
// intentionally omitted rather than guessed. Main Quest 19 is a menu action handled by Aincrad.

window.MOB_AREAS = window.MOB_AREAS || [];

[
  {
    id: "mq-7",
    title: "The New World",
    number: 7,
    floor: "playerIsland",
    coords: { x: 0, z: 7 },
    description: "Talk to Eugeo (0, 65, 7)"
  },
  {
    id: "mq-8",
    title: "Towards the Gigas Cedar...",
    number: 8,
    floor: "gigasCedar",
    coords: { x: -70, z: 176 },
    description: "Meet up with Eugeo at the Foot of the tree (-70, -24, 176)"
  },
  {
    id: "mq-9",
    title: "Cutting wood...",
    number: 9,
    floor: "gigasCedar",
    coords: { x: -70, z: 176 },
    description: "Go back to Eugeo (-70, -24, 176)"
  },
  {
    id: "mq-11",
    title: "Stabilizing the Cardinal Relay...",
    number: 11,
    floor: "gigasCedar",
    coords: { x: -70, z: 176 },
    description: "Go back to Eugeo (-70, -24, 176)"
  },
  {
    id: "mq-12",
    title: "The Forge before the sword...",
    number: 12,
    floor: "playerIsland",
    coords: { x: 0, z: 7 },
    description: "Talk to Eugeo to find out more (0, 65, 7)"
  },
  {
    id: "mq-13",
    title: "The village or Rulid...",
    number: 13,
    floor: "rulid",
    coords: { x: 189, z: 226 },
    description: "Find Eugeo in Rulid (189, 71, 226)"
  },
  {
    id: "mq-14",
    title: "Blessing of the Hero...",
    number: 14,
    floor: "rulid",
    coords: { x: 188, z: 231 },
    description: "Talk to Selka (188, 71, 231)"
  },
  {
    id: "mq-15",
    title: "The First Harvests",
    number: 15,
    floor: "rulid",
    coords: { x: 189, z: 226 },
    description: "Go back and see Eugeo (189, 71, 226)"
  },
  {
    id: "mq-16",
    title: "Calm Water",
    number: 16,
    floor: "fishingIsland",
    coords: { x: -75, z: 74 },
    description: "Find Eugeo on the Fishing Island (-75, 66, 74)"
  },
  {
    id: "mq-17",
    title: "Azure Crystals",
    number: 17,
    floor: "iceCave",
    coords: { x: -117, z: 128 },
    description: "Join Eugeo at the Ice Cave (-117, 87, 128)"
  },
  {
    id: "mq-18",
    title: "Memory Labrinth: The Goblin Cave of Rulid",
    number: 18,
    floor: "playerIsland",
    coords: { x: 0, z: 7 },
    description: "Talk to Eugeo (0, 65, 7)"
  }
].forEach((quest) => {
  window.DATA = window.DATA || {};
  window.DATA[quest.id] = {
    title: quest.title,
    type: "Quest",
    category: "mainQuests",
    floor: quest.floor,
    questNumber: quest.number,
    coords: quest.coords,
    drops: ["N/A"],
    description: quest.description
  };
});
