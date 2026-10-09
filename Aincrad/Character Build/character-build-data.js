(function (global) {
  "use strict";

  const classes = [
    { id: "archer", name: "Archer / Ranger" },
    { id: "assassin", name: "Assassin / DPS" },
    { id: "guerrier", name: "Guerrier / Tank" },
    { id: "mage", name: "Mage / Ranged Magic" },
    { id: "martial-artist", name: "Martial Artist / Melee" },
    { id: "shaman", name: "Shaman / Support" }
  ];

  const icon = (name) => global.CharacterBuildIcons.markup(name);
  const icons = {
    helmet: icon("helmet"),
    chestplate: icon("chestplate"),
    leggings: icon("leggings"),
    boots: icon("boots"),
    amulet: icon("amulet"),
    ring: icon("ring"),
    bracelet: icon("bracelet"),
    glove: icon("glove"),
    artifact: icon("artifact"),
    shield: icon("shield"),
    sword: icon("sword")
  };
  const slots = [
    { id: "helmet", name: "Helmet", icon: icons.helmet, group: "armor", type: "Helmet" },
    { id: "chestplate", name: "Chestplate", icon: icons.chestplate, group: "armor", type: "Chestplate" },
    { id: "leggings", name: "Leggings", icon: icons.leggings, group: "armor", type: "Leggings" },
    { id: "boots", name: "Boots", icon: icons.boots, group: "armor", type: "Boots" },
    { id: "amulet", name: "Amulet", icon: icons.amulet, group: "accessory", type: "Amulet" },
    { id: "ring-1", name: "Ring 1", icon: icons.ring, group: "accessory", type: "Ring" },
    { id: "ring-2", name: "Ring 2", icon: icons.ring, group: "accessory", type: "Ring" },
    { id: "bracelet", name: "Bracelet", icon: icons.bracelet, group: "accessory", type: "Bracelet" },
    { id: "glove", name: "Glove", icon: icons.glove, group: "accessory", type: "Glove" },
    { id: "artifact-1", name: "Artifact 1", icon: icons.artifact, group: "accessory", type: "Artifact" },
    { id: "artifact-2", name: "Artifact 2", icon: icons.artifact, group: "accessory", type: "Artifact" },
    { id: "artifact-3", name: "Artifact 3", icon: icons.artifact, group: "accessory", type: "Artifact" },
    { id: "offhand", name: "Offhand", icon: icons.shield, group: "accessory", type: "Offhand" },
    { id: "main-weapon", name: "Main Weapon", icon: icons.sword, group: "accessory", type: "Main Weapon" }
  ];

  /* Skill points come from the same level system the Character Build page already uses: the level
     control runs from level 1 to level 25, level 1 is the level a character starts at, and every
     level gained after it grants SKILL_POINTS_PER_LEVEL skill points. A build may never hold more
     unlocked skills than its level grants, so the whole tree can only be completed with the
     testing-only "Unlimited skill points" toggle. Change these two values to change the rate. */
  const MAX_CHARACTER_LEVEL = 25;
  const SKILL_POINTS_PER_LEVEL = 1;

  function skillPointsForLevel(level) {
    const clamped = Math.min(MAX_CHARACTER_LEVEL, Math.max(1, Math.floor(Number(level) || 1)));
    return (clamped - 1) * SKILL_POINTS_PER_LEVEL;
  }

  const FIXED_SKILL_IDS_BY_POINT = Object.freeze({
    n39: "skill1",
    n40: "skill2",
    n30: "skill3",
    n18: "skill4",
    n12: "skill5",
    n36: "skill6",
    n31: "skill7",
    n19: "skill8",
    n13: "skill9"
  });
  let nextSkillNumber = 10;
  /* Every class shares this layout. Each point gets a skill ID, and the four points flagged
     "special: true" (the four larger branch nodes, also flagged "isAnchor" for rendering) are the
     special skills: they need all four of their surrounding skills unlocked before they can be
     unlocked themselves. */
  const SKILL_TREE_LAYOUT = Object.freeze([
    { id: "n01", x: 460, y: 20 }, { id: "n02", x: 342, y: 138 }, { id: "n03", x: 460, y: 146 },
    { id: "n04", x: 587, y: 146 }, { id: "n05", x: 524, y: 210 }, { id: "n06", x: 587, y: 210 },
    { id: "n07", x: 334, y: 210 }, { id: "n08", x: 270, y: 210 }, { id: "n09", x: 460, y: 210 },
    { id: "n10", x: 396, y: 210 }, { id: "n11", x: 650, y: 210 }, { id: "n12", x: 334, y: 273 },
    { id: "n13", x: 587, y: 273 }, { id: "n14", x: 206, y: 273 }, { id: "n15", x: 713, y: 273 },
    { id: "n16", x: 524, y: 273 }, { id: "n17", x: 460, y: 273 },
    { id: "n18", x: 334, y: 336, isAnchor: true, special: true },
    { id: "n19", x: 587, y: 336, isAnchor: true, special: true }, { id: "n20", x: 396, y: 337 },
    { id: "n21", x: 650, y: 337 }, { id: "n22", x: 524, y: 337 }, { id: "n23", x: 270, y: 337 },
    { id: "n24", x: 713, y: 337 }, { id: "n25", x: 206, y: 337 }, { id: "n26", x: 143, y: 337 },
    { id: "n27", x: 778, y: 337 }, { id: "n28", x: 460, y: 399 }, { id: "n29", x: 270, y: 399 },
    { id: "n30", x: 334, y: 399 }, { id: "n31", x: 587, y: 399 },
    { id: "n32", x: 206, y: 400 }, { id: "n33", x: 713, y: 400 }, { id: "n34", x: 206, y: 463 },
    { id: "n35", x: 713, y: 463 }, { id: "n36", x: 524, y: 463 }, { id: "n37", x: 270, y: 464 },
    { id: "n38", x: 650, y: 464 }, { id: "n39", x: 460, y: 464 },
    { id: "n40", x: 396, y: 464 }, { id: "n41", x: 143, y: 464 }, { id: "n42", x: 904, y: 464 },
    { id: "n43", x: 16, y: 464 }, { id: "n44", x: 777, y: 464 }, { id: "n45", x: 334, y: 527 },
    { id: "n46", x: 206, y: 527 }, { id: "n47", x: 713, y: 527 }, { id: "n48", x: 650, y: 528 },
    { id: "n49", x: 460, y: 528 }, { id: "n50", x: 587, y: 528 },
    { id: "n51", x: 334, y: 589, isAnchor: true, special: true },
    { id: "n52", x: 587, y: 589, isAnchor: true, special: true }, { id: "n53", x: 713, y: 590 },
    { id: "n54", x: 206, y: 590 },
    { id: "n55", x: 270, y: 590 }, { id: "n56", x: 396, y: 590 }, { id: "n57", x: 650, y: 590 },
    { id: "n58", x: 524, y: 590 }, { id: "n59", x: 143, y: 590 }, { id: "n60", x: 778, y: 590 },
    { id: "n61", x: 587, y: 653 }, { id: "n62", x: 334, y: 653 }, { id: "n63", x: 206, y: 654 },
    { id: "n64", x: 713, y: 654 }, { id: "n65", x: 396, y: 654 }, { id: "n66", x: 460, y: 654 },
    { id: "n67", x: 334, y: 717 }, { id: "n68", x: 460, y: 717 }, { id: "n69", x: 587, y: 717 },
    { id: "n70", x: 396, y: 717 }, { id: "n71", x: 650, y: 717 }, { id: "n72", x: 524, y: 717 },
    { id: "n73", x: 270, y: 717 }, { id: "n74", x: 460, y: 781 }, { id: "n75", x: 587, y: 781 },
    { id: "n76", x: 334, y: 783 }, { id: "n77", x: 460, y: 908 }
  ].map((node) =>
    Object.freeze({ ...node, skillId: FIXED_SKILL_IDS_BY_POINT[node.id] || `skill${nextSkillNumber++}` })
  ));

  const SKILL_TREE_CONNECTIONS = Object.freeze([
    ["n01", "n02"], ["n01", "n04"], ["n02", "n08"], ["n03", "n05"], ["n03", "n10"],
    ["n04", "n06"], ["n07", "n08"], ["n07", "n10"], ["n08", "n14"], ["n09", "n17"],
    ["n11", "n13"], ["n11", "n15"], ["n12", "n18"], ["n12", "n20"], ["n12", "n23"],
    ["n13", "n16"], ["n13", "n19"], ["n13", "n21"], ["n14", "n23"], ["n15", "n24"],
    ["n15", "n27"], ["n16", "n22"], ["n17", "n20"], ["n17", "n22"], ["n18", "n20"],
    ["n18", "n23"], ["n18", "n30"], ["n19", "n21"], ["n19", "n22"], ["n19", "n31"],
    ["n20", "n28"], ["n20", "n30"], ["n21", "n31"], ["n22", "n28"], ["n22", "n31"],
    ["n23", "n29"], ["n24", "n33"], ["n25", "n26"], ["n26", "n43"], ["n27", "n42"],
    ["n28", "n39"], ["n29", "n30"], ["n30", "n37"], ["n30", "n40"], ["n31", "n36"],
    ["n31", "n38"], ["n32", "n41"], ["n33", "n44"], ["n34", "n37"], ["n35", "n38"],
    ["n36", "n39"], ["n36", "n50"], ["n37", "n45"], ["n38", "n50"], ["n39", "n40"],
    ["n39", "n49"], ["n40", "n45"], ["n41", "n46"], ["n42", "n60"], ["n43", "n59"],
    ["n44", "n47"], ["n45", "n51"], ["n45", "n55"], ["n45", "n56"], ["n46", "n54"],
    ["n48", "n50"], ["n48", "n57"], ["n49", "n56"], ["n49", "n58"], ["n50", "n52"],
    ["n50", "n58"], ["n51", "n55"], ["n51", "n56"], ["n51", "n62"], ["n52", "n57"],
    ["n52", "n58"], ["n52", "n61"], ["n53", "n60"], ["n54", "n63"], ["n55", "n62"],
    ["n56", "n65"], ["n56", "n66"], ["n57", "n61"], ["n57", "n64"], ["n58", "n61"],
    ["n58", "n66"], ["n59", "n63"], ["n62", "n65"], ["n62", "n73"], ["n63", "n73"],
    ["n64", "n71"], ["n66", "n68"], ["n67", "n76"], ["n69", "n71"], ["n69", "n72"],
    ["n70", "n74"], ["n71", "n75"], ["n72", "n74"], ["n75", "n77"], ["n76", "n77"]
  ].map((connection) => Object.freeze(connection)));

  /* A second kind of "needs all of them" node, for the one skill whose connections are wider than its
     requirement. The four points flagged "special: true" in SKILL_TREE_LAYOUT need every skill wired
     to them, which is what SKILL_TREE_CONNECTIONS already expresses. Skill 58 is different: the graph
     also draws its edge to the skill 52 box, and skill 52 needs skill 58 in turn, so treating every
     connection as a requirement would lock both nodes forever. Its real requirement is the four
     skills every class row documents for it, so those are listed here. Entries are skill IDs, and a
     skill listed here needs all of them; every other skill still unlocks through any one neighbour. */
  const SKILL_TREE_ALL_PREREQUISITES = Object.freeze({
    skill58: Object.freeze(["skill49", "skill50", "skill61", "skill66"])
  });

  // EDITING GUIDE: Change rows only in the class section you want to edit.
  // Each row lists name, description, stat, amount, statMode, prerequisites, and cost.
  // Use "flat" for points or "percent" for percentages. Keep Skill 1 cost at 0 and Skills 2-77 at 1.
  // Which skills a skill needs is decided by SKILL_TREE_CONNECTIONS above, not by this list: a skill
  // unlocks through any directly connected skill that is already unlocked, so a node with several
  // routes can be reached through any of them. The four nodes flagged "special: true" in
  // SKILL_TREE_LAYOUT need all four of their surrounding skills unlocked instead, and a skill listed
  // in SKILL_TREE_ALL_PREREQUISITES needs all of the skills listed there. A row's "prerequisites"
  // list only documents the routes that skill was designed with.
  // This helper only indexes the explicit rows; it does not supply skill defaults.
  function indexClassSkills(className, skills) {
    return Object.freeze(
      Object.fromEntries(
        Object.entries(skills).map(([skillId, skill]) => {
          const indexedSkill = { ...skill, id: skillId, className };
          if (skillId !== "skill1") indexedSkill.prerequisites = Object.freeze([...skill.prerequisites]);
          return [skillId, Object.freeze(indexedSkill)];
        })
      )
    );
  }

  // ============================================================
  // ARCHER SKILLS
  // Edit the values inside each skill entry. All 77 skills are listed here.
  // statMode must be "flat" or "percent"; prerequisites use skill IDs such as ["skill2"].
  // ============================================================
  const ARCHER_SKILLS = indexClassSkills("Archer", {
    skill1: { name: "Archer Path", description: "The center of the tree." },
    skill2: { name: "Marksmanship", stat: "Projectile Damage", amount: 1, statMode: "percent", prerequisites: ["skill1"], cost: 1 },
    skill3: { name: "Marksmanship", stat: "Projectile Damage", amount: 1, statMode: "percent", prerequisites: ["skill2"], cost: 1 },
    skill4: { name: "Decisive Strike", stat: "Critical Power", amount: 5, statMode: "percent", prerequisites: ["skill25", "skill3", "skill5", "skill28"], cost: 1 },
    skill5: { name: "Marksmanship", stat: "Projectile Damage", amount: 1, statMode: "percent", prerequisites: ["skill25"], cost: 1 },
    skill6: { name: "Marksmanship", stat: "Projectile Damage", amount: 1, statMode: "percent", prerequisites: ["skill1"], cost: 1 },
    skill7: { name: "Reinforced Guard", stat: "Defense", amount: 2, statMode: "flat", prerequisites: ["skill6"], cost: 1 },
    skill8: { name: "Bloodthirst", stat: "Lifesteal", amount: 0.1, statMode: "percent", prerequisites: ["skill27"], cost: 1 },
    skill9: { name: "Critical Instinct", stat: "Critical Chance", amount: 0.5, statMode: "percent", prerequisites: ["skill23"], cost: 1 },
    skill10: { name: "Deep Breath", stat: "Stamina", amount: 2, statMode: "flat", prerequisites: ["skill11"], cost: 1 },
    skill11: { name: "Reinforced Vitality", stat: "Max Health", amount: 3, statMode: "flat", prerequisites: ["skill17"], cost: 1 },
    skill12: { name: "Marksmanship", stat: "Projectile Damage", amount: 1, statMode: "percent", prerequisites: ["skill19"], cost: 1 },
    skill13: { name: "Reinforced Vitality", stat: "Max Health", amount: 3, statMode: "flat", prerequisites: ["skill10"], cost: 1 },
    skill14: { name: "Striking Force", stat: "Attack Damage", amount: 2, statMode: "flat", prerequisites: ["skill12"], cost: 1 },
    skill15: { name: "Decisive Strike", stat: "Critical Power", amount: 5, statMode: "percent", prerequisites: ["skill13"], cost: 1 },
    skill16: { name: "Critical Instinct", stat: "Critical Chance", amount: 0.5, statMode: "percent", prerequisites: ["skill17"], cost: 1 },
    skill17: { name: "Critical Instinct", stat: "Critical Chance", amount: 0.5, statMode: "percent", prerequisites: ["skill21"], cost: 1 },
    skill18: { name: "Decisive Strike", stat: "Critical Power", amount: 5, statMode: "percent", prerequisites: ["skill24"], cost: 1 },
    skill19: { name: "Marksmanship", stat: "Projectile Damage", amount: 1, statMode: "percent", prerequisites: ["skill16"], cost: 1 },
    skill20: { name: "Marksmanship", stat: "Projectile Damage", amount: 1, statMode: "percent", prerequisites: ["skill9"], cost: 1 },
    skill21: { name: "Critical Instinct", stat: "Critical Chance", amount: 0.5, statMode: "percent", prerequisites: ["skill28"], cost: 1 },
    skill22: { name: "Marksmanship", stat: "Projectile Damage", amount: 1, statMode: "percent", prerequisites: ["skill20"], cost: 1 },
    skill23: { name: "Reinforced Vitality", stat: "Max Health", amount: 3, statMode: "flat", prerequisites: ["skill27"], cost: 1 },
    skill24: { name: "Critical Instinct", stat: "Critical Chance", amount: 0.5, statMode: "percent", prerequisites: ["skill25"], cost: 1 },
    skill25: { name: "Reinforced Vitality", stat: "Max Health", amount: 3, statMode: "flat", prerequisites: ["skill33"], cost: 1 },
    skill26: { name: "Critical Instinct", stat: "Critical Chance", amount: 0.5, statMode: "percent", prerequisites: ["skill7"], cost: 1 },
    skill27: { name: "Critical Instinct", stat: "Critical Chance", amount: 0.5, statMode: "percent", prerequisites: ["skill33"], cost: 1 },
    skill28: { name: "Marksmanship", stat: "Projectile Damage", amount: 1, statMode: "percent", prerequisites: ["skill5"], cost: 1 },
    skill29: { name: "Marksmanship", stat: "Projectile Damage", amount: 1, statMode: "percent", prerequisites: ["skill22"], cost: 1 },
    skill30: { name: "Light Step", stat: "Movement Speed", amount: 3, statMode: "percent", prerequisites: ["skill31"], cost: 1 },
    skill31: { name: "Reinforced Vitality", stat: "Max Health", amount: 3, statMode: "flat", prerequisites: ["skill43"], cost: 1 },
    skill32: { name: "Reinforced Vitality", stat: "Max Health", amount: 3, statMode: "flat", prerequisites: ["skill22"], cost: 1 },
    skill33: { name: "Critical Instinct", stat: "Critical Chance", amount: 0.5, statMode: "percent", prerequisites: ["skill1"], cost: 1 },
    skill34: { name: "Deep Breath", stat: "Stamina", amount: 2, statMode: "flat", prerequisites: ["skill3"], cost: 1 },
    skill35: { name: "Swiftness", stat: "Attack Speed", amount: 0.05, statMode: "flat", prerequisites: ["skill41"], cost: 1 },
    skill36: { name: "Critical Instinct", stat: "Critical Chance", amount: 0.5, statMode: "percent", prerequisites: ["skill29"], cost: 1 },
    skill37: { name: "Marksmanship", stat: "Projectile Damage", amount: 1, statMode: "percent", prerequisites: ["skill39"], cost: 1 },
    skill38: { name: "Marksmanship", stat: "Projectile Damage", amount: 1, statMode: "percent", prerequisites: ["skill40"], cost: 1 },
    skill39: { name: "Marksmanship", stat: "Projectile Damage", amount: 1, statMode: "percent", prerequisites: ["skill3"], cost: 1 },
    skill40: { name: "Marksmanship", stat: "Projectile Damage", amount: 1, statMode: "percent", prerequisites: ["skill7"], cost: 1 },
    skill41: { name: "Critical Instinct", stat: "Critical Chance", amount: 0.5, statMode: "percent", prerequisites: ["skill46"], cost: 1 },
    skill42: { name: "Deep Breath", stat: "Stamina", amount: 2, statMode: "flat", prerequisites: ["skill32"], cost: 1 },
    skill43: { name: "Deep Breath", stat: "Stamina", amount: 2, statMode: "flat", prerequisites: ["skill59"], cost: 1 },
    skill44: { name: "Critical Instinct", stat: "Critical Chance", amount: 0.5, statMode: "percent", prerequisites: ["skill36"], cost: 1 },
    skill45: { name: "Reinforced Guard", stat: "Defense", amount: 2, statMode: "flat", prerequisites: ["skill2"], cost: 1 },
    skill46: { name: "Critical Instinct", stat: "Critical Chance", amount: 0.5, statMode: "percent", prerequisites: ["skill54"], cost: 1 },
    skill47: { name: "Swiftness", stat: "Attack Speed", amount: 0.05, statMode: "flat", prerequisites: ["skill44"], cost: 1 },
    skill48: { name: "Deep Breath", stat: "Stamina", amount: 2, statMode: "flat", prerequisites: ["skill50"], cost: 1 },
    skill49: { name: "Decisive Strike", stat: "Critical Power", amount: 5, statMode: "percent", prerequisites: ["skill1"], cost: 1 },
    skill50: { name: "Marksmanship", stat: "Projectile Damage", amount: 1, statMode: "percent", prerequisites: ["skill6"], cost: 1 },
    skill51: { name: "Bloodthirst", stat: "Lifesteal", amount: 0.1, statMode: "percent", prerequisites: ["skill45"], cost: 1 },
    skill52: { name: "Decisive Strike", stat: "Critical Power", amount: 5, statMode: "percent", prerequisites: ["skill50"], cost: 1 },
    skill53: { name: "Light Step", stat: "Movement Speed", amount: 3, statMode: "percent", prerequisites: ["skill60"], cost: 1 },
    skill54: { name: "Marksmanship", stat: "Projectile Damage", amount: 1, statMode: "percent", prerequisites: ["skill63"], cost: 1 },
    skill55: { name: "Critical Instinct", stat: "Critical Chance", amount: 0.5, statMode: "percent", prerequisites: ["skill45"], cost: 1 },
    skill56: { name: "Critical Instinct", stat: "Critical Chance", amount: 0.5, statMode: "percent", prerequisites: ["skill49"], cost: 1 },
    skill57: { name: "Marksmanship", stat: "Projectile Damage", amount: 1, statMode: "percent", prerequisites: ["skill48"], cost: 1 },
    skill58: { name: "Reinforced Vitality", stat: "Max Health", amount: 3, statMode: "flat", prerequisites: ["skill49", "skill50", "skill61", "skill66"], cost: 1 },
    skill59: { name: "Reinforced Vitality", stat: "Max Health", amount: 3, statMode: "flat", prerequisites: ["skill63"], cost: 1 },
    skill60: { name: "Reinforced Vitality", stat: "Max Health", amount: 3, statMode: "flat", prerequisites: ["skill42"], cost: 1 },
    skill61: { name: "Marksmanship", stat: "Projectile Damage", amount: 1, statMode: "percent", prerequisites: ["skill52"], cost: 1 },
    skill62: { name: "Critical Instinct", stat: "Critical Chance", amount: 0.5, statMode: "percent", prerequisites: ["skill51"], cost: 1 },
    skill63: { name: "Marksmanship", stat: "Projectile Damage", amount: 1, statMode: "percent", prerequisites: ["skill73"], cost: 1 },
    skill64: { name: "Critical Instinct", stat: "Critical Chance", amount: 0.5, statMode: "percent", prerequisites: ["skill57"], cost: 1 },
    skill65: { name: "Reinforced Vitality", stat: "Max Health", amount: 3, statMode: "flat", prerequisites: ["skill56"], cost: 1 },
    skill66: { name: "Critical Instinct", stat: "Critical Chance", amount: 0.5, statMode: "percent", prerequisites: ["skill56"], cost: 1 },
    skill67: { name: "Critical Instinct", stat: "Critical Chance", amount: 0.5, statMode: "percent", prerequisites: ["skill76"], cost: 1 },
    skill68: { name: "Critical Instinct", stat: "Critical Chance", amount: 0.5, statMode: "percent", prerequisites: ["skill66"], cost: 1 },
    skill69: { name: "Critical Instinct", stat: "Critical Chance", amount: 0.5, statMode: "percent", prerequisites: ["skill71"], cost: 1 },
    skill70: { name: "Striking Force", stat: "Attack Damage", amount: 2, statMode: "flat", prerequisites: ["skill74"], cost: 1 },
    skill71: { name: "Critical Instinct", stat: "Critical Chance", amount: 0.5, statMode: "percent", prerequisites: ["skill64"], cost: 1 },
    skill72: { name: "Marksmanship", stat: "Projectile Damage", amount: 1, statMode: "percent", prerequisites: ["skill69"], cost: 1 },
    skill73: { name: "Marksmanship", stat: "Projectile Damage", amount: 1, statMode: "percent", prerequisites: ["skill62"], cost: 1 },
    skill74: { name: "Marksmanship", stat: "Projectile Damage", amount: 1, statMode: "percent", prerequisites: ["skill72"], cost: 1 },
    skill75: { name: "Reinforced Vitality", stat: "Max Health", amount: 3, statMode: "flat", prerequisites: ["skill71"], cost: 1 },
    skill76: { name: "Reinforced Vitality", stat: "Max Health", amount: 3, statMode: "flat", prerequisites: ["skill77"], cost: 1 },
    skill77: { name: "Deep Breath", stat: "Stamina", amount: 2, statMode: "flat", prerequisites: ["skill75"], cost: 1 },
  });

  // ============================================================
  // ASSASSIN SKILLS
  // Edit the values inside each skill entry. All 77 skills are listed here.
  // statMode must be "flat" or "percent"; prerequisites use skill IDs such as ["skill2"].
  // ============================================================
  const ASSASSIN_SKILLS = indexClassSkills("Assassin", {
    skill1: { name: "Assassin Path", description: "The center of the tree." },
    skill2: { name: "Physical Might", stat: "Physical Damage", amount: 1, statMode: "percent", prerequisites: ["skill1"], cost: 1 },
    skill3: { name: "Physical Might", stat: "Physical Damage", amount: 1, statMode: "percent", prerequisites: ["skill2"], cost: 1 },
    skill4: { name: "Side Step", stat: "Dodge", amount: 2, statMode: "percent", prerequisites: ["skill25", "skill3", "skill5", "skill28"], cost: 1 },
    skill5: { name: "Physical Might", stat: "Physical Damage", amount: 1, statMode: "percent", prerequisites: ["skill25"], cost: 1 },
    skill6: { name: "Physical Might", stat: "Physical Damage", amount: 1, statMode: "percent", prerequisites: ["skill1"], cost: 1 },
    skill7: { name: "Reinforced Guard", stat: "Defense", amount: 2, statMode: "flat", prerequisites: ["skill6"], cost: 1 },
    skill8: { name: "Bloodthirst", stat: "Lifesteal", amount: 0.1, statMode: "percent", prerequisites: ["skill27"], cost: 1 },
    skill9: { name: "Critical Instinct", stat: "Critical Chance", amount: 0.5, statMode: "percent", prerequisites: ["skill23"], cost: 1 },
    skill10: { name: "Deep Breath", stat: "Stamina", amount: 2, statMode: "flat", prerequisites: ["skill11"], cost: 1 },
    skill11: { name: "Reinforced Vitality", stat: "Max Health", amount: 2, statMode: "flat", prerequisites: ["skill17"], cost: 1 },
    skill12: { name: "Physical Might", stat: "Physical Damage", amount: 1, statMode: "percent", prerequisites: ["skill19"], cost: 1 },
    skill13: { name: "Reinforced Vitality", stat: "Max Health", amount: 2, statMode: "flat", prerequisites: ["skill10"], cost: 1 },
    skill14: { name: "Striking Force", stat: "Attack Damage", amount: 2, statMode: "flat", prerequisites: ["skill12"], cost: 1 },
    skill15: { name: "Decisive Strike", stat: "Critical Power", amount: 5, statMode: "percent", prerequisites: ["skill13"], cost: 1 },
    skill16: { name: "Critical Instinct", stat: "Critical Chance", amount: 0.5, statMode: "percent", prerequisites: ["skill17"], cost: 1 },
    skill17: { name: "Critical Instinct", stat: "Critical Chance", amount: 0.5, statMode: "percent", prerequisites: ["skill21"], cost: 1 },
    skill18: { name: "Decisive Strike", stat: "Critical Power", amount: 5, statMode: "percent", prerequisites: ["skill24"], cost: 1 },
    skill19: { name: "Physical Might", stat: "Physical Damage", amount: 1, statMode: "percent", prerequisites: ["skill16"], cost: 1 },
    skill20: { name: "Physical Might", stat: "Physical Damage", amount: 1, statMode: "percent", prerequisites: ["skill9"], cost: 1 },
    skill21: { name: "Critical Instinct", stat: "Critical Chance", amount: 0.5, statMode: "percent", prerequisites: ["skill28"], cost: 1 },
    skill22: { name: "Physical Might", stat: "Physical Damage", amount: 1, statMode: "percent", prerequisites: ["skill20"], cost: 1 },
    skill23: { name: "Reinforced Vitality", stat: "Max Health", amount: 4, statMode: "flat", prerequisites: ["skill27"], cost: 1 },
    skill24: { name: "Critical Instinct", stat: "Critical Chance", amount: 0.5, statMode: "percent", prerequisites: ["skill25"], cost: 1 },
    skill25: { name: "Reinforced Vitality", stat: "Max Health", amount: 4, statMode: "flat", prerequisites: ["skill33"], cost: 1 },
    skill26: { name: "Critical Instinct", stat: "Critical Chance", amount: 0.5, statMode: "percent", prerequisites: ["skill7"], cost: 1 },
    skill27: { name: "Critical Instinct", stat: "Critical Chance", amount: 0.5, statMode: "percent", prerequisites: ["skill33"], cost: 1 },
    skill28: { name: "Physical Might", stat: "Physical Damage", amount: 1, statMode: "percent", prerequisites: ["skill5"], cost: 1 },
    skill29: { name: "Physical Might", stat: "Physical Damage", amount: 1, statMode: "percent", prerequisites: ["skill22"], cost: 1 },
    skill30: { name: "Light Step", stat: "Damage", amount: 5, statMode: "percent", prerequisites: ["skill31"], cost: 1 },
    skill31: { name: "Reinforced Vitality", stat: "Max Health", amount: 4, statMode: "flat", prerequisites: ["skill43"], cost: 1 },
    skill32: { name: "Reinforced Vitality", stat: "Max Health", amount: 4, statMode: "flat", prerequisites: ["skill22"], cost: 1 },
    skill33: { name: "Critical Instinct", stat: "Critical Chance", amount: 0.5, statMode: "percent", prerequisites: ["skill1"], cost: 1 },
    skill34: { name: "Deep Breath", stat: "Stamina", amount: 2, statMode: "flat", prerequisites: ["skill3"], cost: 1 },
    skill35: { name: "Swiftness", stat: "Attack Speed", amount: 0.025, statMode: "flat", prerequisites: ["skill41"], cost: 1 },
    skill36: { name: "Critical Instinct", stat: "Critical Chance", amount: 0.5, statMode: "percent", prerequisites: ["skill29"], cost: 1 },
    skill37: { name: "Physical Might", stat: "Physical Damage", amount: 1, statMode: "percent", prerequisites: ["skill39"], cost: 1 },
    skill38: { name: "Physical Might", stat: "Physical Damage", amount: 1, statMode: "percent", prerequisites: ["skill40"], cost: 1 },
    skill39: { name: "Physical Might", stat: "Physical Damage", amount: 1, statMode: "percent", prerequisites: ["skill3"], cost: 1 },
    skill40: { name: "Physical Might", stat: "Physical Damage", amount: 1, statMode: "percent", prerequisites: ["skill7"], cost: 1 },
    skill41: { name: "Critical Instinct", stat: "Critical Chance", amount: 0.5, statMode: "percent", prerequisites: ["skill46"], cost: 1 },
    skill42: { name: "Deep Breath", stat: "Stamina", amount: 2, statMode: "flat", prerequisites: ["skill32"], cost: 1 },
    skill43: { name: "Deep Breath", stat: "Stamina", amount: 2, statMode: "flat", prerequisites: ["skill59"], cost: 1 },
    skill44: { name: "Critical Instinct", stat: "Critical Chance", amount: 0.5, statMode: "percent", prerequisites: ["skill36"], cost: 1 },
    skill45: { name: "Reinforced Guard", stat: "Defense", amount: 2, statMode: "flat", prerequisites: ["skill2"], cost: 1 },
    skill46: { name: "Critical Instinct", stat: "Critical Chance", amount: 0.5, statMode: "percent", prerequisites: ["skill54"], cost: 1 },
    skill47: { name: "Swiftness", stat: "Attack Speed", amount: 0.025, statMode: "flat", prerequisites: ["skill44"], cost: 1 },
    skill48: { name: "Deep Breath", stat: "Stamina", amount: 2, statMode: "flat", prerequisites: ["skill50"], cost: 1 },
    skill49: { name: "Critical Instinct", stat: "Critical Chance", amount: 0.5, statMode: "percent", prerequisites: ["skill1"], cost: 1 },
    skill50: { name: "Physical Might", stat: "Physical Damage", amount: 1, statMode: "percent", prerequisites: ["skill6"], cost: 1 },
    skill51: { name: "Bloodthirst", stat: "Lifesteal", amount: 0.1, statMode: "percent", prerequisites: ["skill45"], cost: 1 },
    skill52: { name: "Sidestep", stat: "Dodge", amount: 2, statMode: "percent", prerequisites: ["skill50"], cost: 1 },
    skill53: { name: "Light Step", stat: "Damage", amount: 5, statMode: "percent", prerequisites: ["skill60"], cost: 1 },
    skill54: { name: "Physical Might", stat: "Physical Damage", amount: 1, statMode: "percent", prerequisites: ["skill63"], cost: 1 },
    skill55: { name: "Critical Instinct", stat: "Critical Chance", amount: 0.5, statMode: "percent", prerequisites: ["skill45"], cost: 1 },
    skill56: { name: "Critical Instinct", stat: "Critical Chance", amount: 0.5, statMode: "percent", prerequisites: ["skill49"], cost: 1 },
    skill57: { name: "Physical Might", stat: "Physical Damage", amount: 1, statMode: "percent", prerequisites: ["skill48"], cost: 1 },
    skill58: { name: "Reinforced Vitality", stat: "Max Health", amount: 4, statMode: "flat", prerequisites: ["skill49", "skill50", "skill61", "skill66"], cost: 1 },
    skill59: { name: "Critical Instinct", stat: "Critical Chance", amount: 0.5, statMode: "percent", prerequisites: ["skill63"], cost: 1 },
    skill60: { name: "Reinforced Vitality", stat: "Max Health", amount: 4, statMode: "flat", prerequisites: ["skill42"], cost: 1 },
    skill61: { name: "Physical Might", stat: "Physical Damage", amount: 1, statMode: "percent", prerequisites: ["skill52"], cost: 1 },
    skill62: { name: "Critical Instinct", stat: "Critical Chance", amount: 0.5, statMode: "percent", prerequisites: ["skill51"], cost: 1 },
    skill63: { name: "Physical Might", stat: "Physical Damage", amount: 1, statMode: "percent", prerequisites: ["skill73"], cost: 1 },
    skill64: { name: "Critical Instinct", stat: "Critical Chance", amount: 0.5, statMode: "percent", prerequisites: ["skill57"], cost: 1 },
    skill65: { name: "Reinforced Vitality", stat: "Max Health", amount: 4, statMode: "flat", prerequisites: ["skill56"], cost: 1 },
    skill66: { name: "Critical Instinct", stat: "Critical Chance", amount: 0.5, statMode: "percent", prerequisites: ["skill56"], cost: 1 },
    skill67: { name: "Critical Instinct", stat: "Critical Chance", amount: 0.5, statMode: "percent", prerequisites: ["skill76"], cost: 1 },
    skill68: { name: "Decisive Strike", stat: "Critical Power", amount: 5, statMode: "percent", prerequisites: ["skill66"], cost: 1 },
    skill69: { name: "Critical Instinct", stat: "Critical Chance", amount: 0.5, statMode: "percent", prerequisites: ["skill71"], cost: 1 },
    skill70: { name: "Striking Force", stat: "Attack Damage", amount: 2, statMode: "flat", prerequisites: ["skill74"], cost: 1 },
    skill71: { name: "Critical Instinct", stat: "Critical Chance", amount: 0.5, statMode: "percent", prerequisites: ["skill64"], cost: 1 },
    skill72: { name: "Physical Might", stat: "Physical Damage", amount: 1, statMode: "percent", prerequisites: ["skill69"], cost: 1 },
    skill73: { name: "Physical Might", stat: "Physical Damage", amount: 1, statMode: "percent", prerequisites: ["skill62"], cost: 1 },
    skill74: { name: "Physical Might", stat: "Physical Damage", amount: 1, statMode: "percent", prerequisites: ["skill72"], cost: 1 },
    skill75: { name: "Reinforced Vitality", stat: "Max Health", amount: 4, statMode: "flat", prerequisites: ["skill71"], cost: 1 },
    skill76: { name: "Reinforced Vitality", stat: "Max Health", amount: 4, statMode: "flat", prerequisites: ["skill77"], cost: 1 },
    skill77: { name: "Deep Breath", stat: "Stamina", amount: 2, statMode: "flat", prerequisites: ["skill75"], cost: 1 },
  });

  // ============================================================
  // WARRIOR SKILLS
  // Edit the values inside each skill entry. All 77 skills are listed here.
  // statMode must be "flat" or "percent"; prerequisites use skill IDs such as ["skill2"].
  // ============================================================
  const WARRIOR_SKILLS = indexClassSkills("Warrior", {
    skill1: { name: "Warrior Path", description: "The center of the tree." },
    skill2: { name: "Physical Might", stat: "Physical Damage", amount: 1, statMode: "percent", prerequisites: ["skill1"], cost: 1 },
    skill3: { name: "Physical Might", stat: "Physical Damage", amount: 1, statMode: "percent", prerequisites: ["skill2"], cost: 1 },
    skill4: { name: "Striking Force", stat: "Attack Damage", amount: 1, statMode: "flat", prerequisites: ["skill25", "skill3", "skill5", "skill28"], cost: 1 },
    skill5: { name: "Physical Might", stat: "Physical Damage", amount: 1, statMode: "percent", prerequisites: ["skill25"], cost: 1 },
    skill6: { name: "Physical Might", stat: "Physical Damage", amount: 1, statMode: "percent", prerequisites: ["skill1"], cost: 1 },
    skill7: { name: "Reinforced Guard", stat: "Defense", amount: 3, statMode: "flat", prerequisites: ["skill6"], cost: 1 },
    skill8: { name: "Reinforced Vitality", stat: "Max Health", amount: 5, statMode: "flat", prerequisites: ["skill27"], cost: 1 },
    skill9: { name: "Critical Instinct", stat: "Critical Chance", amount: 0.5, statMode: "percent", prerequisites: ["skill23"], cost: 1 },
    skill10: { name: "Deep Breath", stat: "Stamina", amount: 2, statMode: "flat", prerequisites: ["skill11"], cost: 1 },
    skill11: { name: "Reinforced Vitality", stat: "Max Health", amount: 5, statMode: "flat", prerequisites: ["skill17"], cost: 1 },
    skill12: { name: "Physical Might", stat: "Physical Damage", amount: 1, statMode: "percent", prerequisites: ["skill19"], cost: 1 },
    skill13: { name: "Reinforced Vitality", stat: "Max Health", amount: 5, statMode: "flat", prerequisites: ["skill10"], cost: 1 },
    skill14: { name: "Striking Force", stat: "Attack Damage", amount: 1, statMode: "flat", prerequisites: ["skill12"], cost: 1 },
    skill15: { name: "Hardening", stat: "Damage Reduction", amount: 2, statMode: "percent", prerequisites: ["skill13"], cost: 1 },
    skill16: { name: "Critical Instinct", stat: "Critical Chance", amount: 0.5, statMode: "percent", prerequisites: ["skill17"], cost: 1 },
    skill17: { name: "Critical Instinct", stat: "Critical Chance", amount: 0.5, statMode: "percent", prerequisites: ["skill21"], cost: 1 },
    skill18: { name: "Hardening", stat: "Damage Reduction", amount: 2, statMode: "percent", prerequisites: ["skill24"], cost: 1 },
    skill19: { name: "Physical Might", stat: "Physical Damage", amount: 1, statMode: "percent", prerequisites: ["skill16"], cost: 1 },
    skill20: { name: "Physical Might", stat: "Physical Damage", amount: 1, statMode: "percent", prerequisites: ["skill9"], cost: 1 },
    skill21: { name: "Critical Instinct", stat: "Critical Chance", amount: 0.5, statMode: "percent", prerequisites: ["skill28"], cost: 1 },
    skill22: { name: "Physical Might", stat: "Physical Damage", amount: 1, statMode: "percent", prerequisites: ["skill20"], cost: 1 },
    skill23: { name: "Reinforced Vitality", stat: "Max Health", amount: 5, statMode: "flat", prerequisites: ["skill27"], cost: 1 },
    skill24: { name: "Critical Instinct", stat: "Critical Chance", amount: 0.5, statMode: "percent", prerequisites: ["skill25"], cost: 1 },
    skill25: { name: "Reinforced Vitality", stat: "Max Health", amount: 5, statMode: "flat", prerequisites: ["skill33"], cost: 1 },
    skill26: { name: "Critical Instinct", stat: "Critical Chance", amount: 0.5, statMode: "percent", prerequisites: ["skill7"], cost: 1 },
    skill27: { name: "Critical Instinct", stat: "Critical Chance", amount: 0.5, statMode: "percent", prerequisites: ["skill33"], cost: 1 },
    skill28: { name: "Physical Might", stat: "Physical Damage", amount: 1, statMode: "percent", prerequisites: ["skill5"], cost: 1 },
    skill29: { name: "Physical Might", stat: "Physical Damage", amount: 1, statMode: "percent", prerequisites: ["skill22"], cost: 1 },
    skill30: { name: "Light Step", stat: "Movement Speed", amount: 3, statMode: "percent", prerequisites: ["skill31"], cost: 1 },
    skill31: { name: "Reinforced Vitality", stat: "Max Health", amount: 5, statMode: "flat", prerequisites: ["skill43"], cost: 1 },
    skill32: { name: "Reinforced Vitality", stat: "Max Health", amount: 5, statMode: "flat", prerequisites: ["skill22"], cost: 1 },
    skill33: { name: "Critical Instinct", stat: "Critical Chance", amount: 0.5, statMode: "percent", prerequisites: ["skill1"], cost: 1 },
    skill34: { name: "Deep Breath", stat: "Stamina", amount: 2, statMode: "flat", prerequisites: ["skill3"], cost: 1 },
    skill35: { name: "Swiftness", stat: "Attack Speed", amount: 0.05, statMode: "flat", prerequisites: ["skill41"], cost: 1 },
    skill36: { name: "Critical Instinct", stat: "Critical Chance", amount: 0.5, statMode: "percent", prerequisites: ["skill29"], cost: 1 },
    skill37: { name: "Physical Might", stat: "Physical Damage", amount: 1, statMode: "percent", prerequisites: ["skill39"], cost: 1 },
    skill38: { name: "Physical Might", stat: "Physical Damage", amount: 1, statMode: "percent", prerequisites: ["skill40"], cost: 1 },
    skill39: { name: "Physical Might", stat: "Physical Damage", amount: 1, statMode: "percent", prerequisites: ["skill3"], cost: 1 },
    skill40: { name: "Physical Might", stat: "Physical Damage", amount: 1, statMode: "percent", prerequisites: ["skill7"], cost: 1 },
    skill41: { name: "Critical Instinct", stat: "Critical Chance", amount: 0.5, statMode: "percent", prerequisites: ["skill46"], cost: 1 },
    skill42: { name: "Deep Breath", stat: "Stamina", amount: 2, statMode: "flat", prerequisites: ["skill32"], cost: 1 },
    skill43: { name: "Deep Breath", stat: "Stamina", amount: 2, statMode: "flat", prerequisites: ["skill59"], cost: 1 },
    skill44: { name: "Critical Instinct", stat: "Critical Chance", amount: 0.5, statMode: "percent", prerequisites: ["skill36"], cost: 1 },
    skill45: { name: "Reinforced Guard", stat: "Defense", amount: 3, statMode: "flat", prerequisites: ["skill2"], cost: 1 },
    skill46: { name: "Critical Instinct", stat: "Critical Chance", amount: 0.5, statMode: "percent", prerequisites: ["skill54"], cost: 1 },
    skill47: { name: "Swiftness", stat: "Attack Speed", amount: 0.05, statMode: "flat", prerequisites: ["skill44"], cost: 1 },
    skill48: { name: "Deep Breath", stat: "Stamina", amount: 2, statMode: "flat", prerequisites: ["skill50"], cost: 1 },
    skill49: { name: "Critical Instinct", stat: "Critical Chance", amount: 0.5, statMode: "percent", prerequisites: ["skill1"], cost: 1 },
    skill50: { name: "Physical Might", stat: "Physical Damage", amount: 1, statMode: "percent", prerequisites: ["skill6"], cost: 1 },
    skill51: { name: "Reinforced Vitality", stat: "Max Health", amount: 5, statMode: "flat", prerequisites: ["skill45"], cost: 1 },
    skill52: { name: "Striking Force", stat: "Attack Damage", amount: 1, statMode: "flat", prerequisites: ["skill50"], cost: 1 },
    skill53: { name: "Light Step", stat: "Movement Speed", amount: 3, statMode: "percent", prerequisites: ["skill60"], cost: 1 },
    skill54: { name: "Physical Might", stat: "Physical Damage", amount: 1, statMode: "percent", prerequisites: ["skill63"], cost: 1 },
    skill55: { name: "Critical Instinct", stat: "Critical Chance", amount: 0.5, statMode: "percent", prerequisites: ["skill45"], cost: 1 },
    skill56: { name: "Critical Instinct", stat: "Critical Chance", amount: 0.5, statMode: "percent", prerequisites: ["skill49"], cost: 1 },
    skill57: { name: "Physical Might", stat: "Physical Damage", amount: 1, statMode: "percent", prerequisites: ["skill48"], cost: 1 },
    skill58: { name: "Reinforced Vitality", stat: "Max Health", amount: 5, statMode: "flat", prerequisites: ["skill49", "skill50", "skill61", "skill66"], cost: 1 },
    skill59: { name: "Reinforced Vitality", stat: "Max Health", amount: 5, statMode: "flat", prerequisites: ["skill63"], cost: 1 },
    skill60: { name: "Reinforced Vitality", stat: "Max Health", amount: 5, statMode: "flat", prerequisites: ["skill42"], cost: 1 },
    skill61: { name: "Physical Might", stat: "Physical Damage", amount: 1, statMode: "percent", prerequisites: ["skill52"], cost: 1 },
    skill62: { name: "Critical Instinct", stat: "Critical Chance", amount: 0.5, statMode: "percent", prerequisites: ["skill51"], cost: 1 },
    skill63: { name: "Physical Might", stat: "Physical Damage", amount: 1, statMode: "percent", prerequisites: ["skill73"], cost: 1 },
    skill64: { name: "Critical Instinct", stat: "Critical Chance", amount: 0.5, statMode: "percent", prerequisites: ["skill57"], cost: 1 },
    skill65: { name: "Reinforced Vitality", stat: "Max Health", amount: 5, statMode: "flat", prerequisites: ["skill56"], cost: 1 },
    skill66: { name: "Critical Instinct", stat: "Critical Chance", amount: 0.5, statMode: "percent", prerequisites: ["skill56"], cost: 1 },
    skill67: { name: "Critical Instinct", stat: "Critical Chance", amount: 0.5, statMode: "percent", prerequisites: ["skill76"], cost: 1 },
    skill68: { name: "Hardening", stat: "Damage Reduction", amount: 2, statMode: "percent", prerequisites: ["skill66"], cost: 1 },
    skill69: { name: "Critical Instinct", stat: "Critical Chance", amount: 0.5, statMode: "percent", prerequisites: ["skill71"], cost: 1 },
    skill70: { name: "Striking Force", stat: "Attack Damage", amount: 1, statMode: "flat", prerequisites: ["skill74"], cost: 1 },
    skill71: { name: "Critical Instinct", stat: "Critical Chance", amount: 0.5, statMode: "percent", prerequisites: ["skill64"], cost: 1 },
    skill72: { name: "Physical Might", stat: "Physical Damage", amount: 1, statMode: "percent", prerequisites: ["skill69"], cost: 1 },
    skill73: { name: "Physical Might", stat: "Physical Damage", amount: 1, statMode: "percent", prerequisites: ["skill62"], cost: 1 },
    skill74: { name: "Physical Might", stat: "Physical Damage", amount: 1, statMode: "percent", prerequisites: ["skill72"], cost: 1 },
    skill75: { name: "Reinforced Vitality", stat: "Max Health", amount: 5, statMode: "flat", prerequisites: ["skill71"], cost: 1 },
    skill76: { name: "Reinforced Vitality", stat: "Max Health", amount: 5, statMode: "flat", prerequisites: ["skill77"], cost: 1 },
    skill77: { name: "Deep Breath", stat: "Stamina", amount: 2, statMode: "flat", prerequisites: ["skill75"], cost: 1 },
  });

  // ============================================================
  // MAGE SKILLS
  // Edit the values inside each skill entry. All 77 skills are listed here.
  // statMode must be "flat" or "percent"; prerequisites use skill IDs such as ["skill2"].
  // ============================================================
  const MAGE_SKILLS = indexClassSkills("Mage", {
    skill1: { name: "Mage Path", description: "Description for Skill 1." },
    skill2: { name: "Arcane Might", stat: "Magic Damage", amount: 1, statMode: "percent", prerequisites: ["skill1"], cost: 1 },
    skill3: { name: "Arcane Might", stat: "Magic Damage", amount: 1, statMode: "percent", prerequisites: ["skill2"], cost: 1 },
    skill4: { name: "Arcane Reserve", stat: "Max Mana", amount: 2, statMode: "flat", prerequisites: ["skill25", "skill3", "skill5", "skill28"], cost: 1 },
    skill5: { name: "Arcane Might", stat: "Magic Damage", amount: 1, statMode: "percent", prerequisites: ["skill25"], cost: 1 },
    skill6: { name: "Arcane Might", stat: "Magic Damage", amount: 1, statMode: "percent", prerequisites: ["skill1"], cost: 1 },
    skill7: { name: "Reinforced Guard", stat: "Defense", amount: 2, statMode: "flat", prerequisites: ["skill6"], cost: 1 },
    skill8: { name: "Arcane Absorption", stat: "Spell Vampirism", amount: 0.1, statMode: "percent", prerequisites: ["skill27"], cost: 1 },
    skill9: { name: "Mastery Spark", stat: "Skill Critical Chance", amount: 0.5, statMode: "percent", prerequisites: ["skill23"], cost: 1 },
    skill10: { name: "Arcane Reserve", stat: "Max Mana", amount: 2, statMode: "flat", prerequisites: ["skill11"], cost: 1 },
    skill11: { name: "Reinforced Vitality", stat: "Max Health", amount: 3, statMode: "flat", prerequisites: ["skill17"], cost: 1 },
    skill12: { name: "Arcane Might", stat: "Magic Damage", amount: 1, statMode: "percent", prerequisites: ["skill19"], cost: 1 },
    skill13: { name: "Reinforced Vitality", stat: "Max Health", amount: 3, statMode: "flat", prerequisites: ["skill10"], cost: 1 },
    skill14: { name: "Striking Force", stat: "Attack Damage", amount: 2, statMode: "flat", prerequisites: ["skill12"], cost: 1 },
    skill15: { name: "Mastery Apex", stat: "Skill Critical Power", amount: 5, statMode: "percent", prerequisites: ["skill13"], cost: 1 },
    skill16: { name: "Mastery Spark", stat: "Skill Critical Chance", amount: 0.5, statMode: "percent", prerequisites: ["skill17"], cost: 1 },
    skill17: { name: "Mastery Spark", stat: "Skill Critical Chance", amount: 0.5, statMode: "percent", prerequisites: ["skill21"], cost: 1 },
    skill18: { name: "Mastery Apex", stat: "Skill Critical Power", amount: 5, statMode: "percent", prerequisites: ["skill24"], cost: 1 },
    skill19: { name: "Arcane Might", stat: "Magic Damage", amount: 1, statMode: "percent", prerequisites: ["skill16"], cost: 1 },
    skill20: { name: "Arcane Might", stat: "Magic Damage", amount: 1, statMode: "percent", prerequisites: ["skill9"], cost: 1 },
    skill21: { name: "Mastery Spark", stat: "Skill Critical Chance", amount: 0.5, statMode: "percent", prerequisites: ["skill28"], cost: 1 },
    skill22: { name: "Arcane Might", stat: "Magic Damage", amount: 1, statMode: "percent", prerequisites: ["skill20"], cost: 1 },
    skill23: { name: "Reinforced Vitality", stat: "Max Health", amount: 3, statMode: "flat", prerequisites: ["skill27"], cost: 1 },
    skill24: { name: "Mastery Spark", stat: "Skill Critical Chance", amount: 0.5, statMode: "percent", prerequisites: ["skill25"], cost: 1 },
    skill25: { name: "Reinforced Vitality", stat: "Max Health", amount: 3, statMode: "flat", prerequisites: ["skill33"], cost: 1 },
    skill26: { name: "Mastery Spark", stat: "Skill Critical Chance", amount: 0.5, statMode: "percent", prerequisites: ["skill7"], cost: 1 },
    skill27: { name: "Mastery Spark", stat: "Skill Critical Chance", amount: 0.5, statMode: "percent", prerequisites: ["skill33"], cost: 1 },
    skill28: { name: "Arcane Might", stat: "Magic Damage", amount: 1, statMode: "percent", prerequisites: ["skill5"], cost: 1 },
    skill29: { name: "Arcane Might", stat: "Magic Damage", amount: 1, statMode: "percent", prerequisites: ["skill22"], cost: 1 },
    skill30: { name: "Light Step", stat: "Movement Speed", amount: 3, statMode: "percent", prerequisites: ["skill31"], cost: 1 },
    skill31: { name: "Reinforced Vitality", stat: "Max Health", amount: 3, statMode: "flat", prerequisites: ["skill43"], cost: 1 },
    skill32: { name: "Reinforced Vitality", stat: "Max Health", amount: 3, statMode: "flat", prerequisites: ["skill22"], cost: 1 },
    skill33: { name: "Mastery Spark", stat: "Skill Critical Chance", amount: 0.5, statMode: "percent", prerequisites: ["skill1"], cost: 1 },
    skill34: { name: "Arcane Reserve", stat: "Max Mana", amount: 2, statMode: "flat", prerequisites: ["skill3"], cost: 1 },
    skill35: { name: "Swiftness", stat: "Attack Speed", amount: 0.05, statMode: "percent", prerequisites: ["skill41"], cost: 1 },
    skill36: { name: "Mastery Spark", stat: "Skill Critical Chance", amount: 0.5, statMode: "percent", prerequisites: ["skill29"], cost: 1 },
    skill37: { name: "Arcane Might", stat: "Magic Damage", amount: 1, statMode: "percent", prerequisites: ["skill39"], cost: 1 },
    skill38: { name: "Arcane Might", stat: "Magic Damage", amount: 1, statMode: "percent", prerequisites: ["skill40"], cost: 1 },
    skill39: { name: "Arcane Might", stat: "Magic Damage", amount: 1, statMode: "percent", prerequisites: ["skill3"], cost: 1 },
    skill40: { name: "Arcane Might", stat: "Magic Damage", amount: 1, statMode: "percent", prerequisites: ["skill7"], cost: 1 },
    skill41: { name: "Mastery Spark", stat: "Skill Critical Chance", amount: 0.5, statMode: "percent", prerequisites: ["skill46"], cost: 1 },
    skill42: { name: "Arcane Reserve", stat: "Max Mana", amount: 2, statMode: "flat", prerequisites: ["skill32"], cost: 1 },
    skill43: { name: "Arcane Reserve", stat: "Max Mana", amount: 2, statMode: "flat", prerequisites: ["skill59"], cost: 1 },
    skill44: { name: "Mastery Spark", stat: "Skill Critical Chance", amount: 0.5, statMode: "percent", prerequisites: ["skill36"], cost: 1 },
    skill45: { name: "Reinforced Guard", stat: "Defense", amount: 2, statMode: "flat", prerequisites: ["skill2"], cost: 1 },
    skill46: { name: "Mastery Spark", stat: "Skill Critical Chance", amount: 0.5, statMode: "percent", prerequisites: ["skill54"], cost: 1 },
    skill47: { name: "Swiftness", stat: "Attack Speed", amount: 0.05, statMode: "percent", prerequisites: ["skill44"], cost: 1 },
    skill48: { name: "Arcane Reserve", stat: "Max Mana", amount: 2, statMode: "flat", prerequisites: ["skill50"], cost: 1 },
    skill49: { name: "Mastery Spark", stat: "Skill Critical Chance", amount: 0.5, statMode: "percent", prerequisites: ["skill1"], cost: 1 },
    skill50: { name: "Arcane Might", stat: "Magic Damage", amount: 1, statMode: "percent", prerequisites: ["skill6"], cost: 1 },
    skill51: { name: "Arcane Absorption", stat: "Spell Vampirism", amount: 0.1, statMode: "percent", prerequisites: ["skill45"], cost: 1 },
    skill52: { name: "Arcane Reserve", stat: "Max Mana", amount: 2, statMode: "flat", prerequisites: ["skill50"], cost: 1 },
    skill53: { name: "Light Step", stat: "Movement Speed", amount: 3, statMode: "percent", prerequisites: ["skill60"], cost: 1 },
    skill54: { name: "Arcane Might", stat: "Magic Damage", amount: 1, statMode: "percent", prerequisites: ["skill63"], cost: 1 },
    skill55: { name: "Mastery Spark", stat: "Skill Critical Chance", amount: 0.5, statMode: "percent", prerequisites: ["skill45"], cost: 1 },
    skill56: { name: "Mastery Spark", stat: "Skill Critical Chance", amount: 0.5, statMode: "percent", prerequisites: ["skill49"], cost: 1 },
    skill57: { name: "Arcane Might", stat: "Magic Damage", amount: 1, statMode: "percent", prerequisites: ["skill48"], cost: 1 },
    skill58: { name: "Reinforced Vitality", stat: "Max Health", amount: 3, statMode: "flat", prerequisites: ["skill49", "skill50", "skill61", "skill66"], cost: 1 },
    skill59: { name: "Reinforced Vitality", stat: "Max Health", amount: 3, statMode: "flat", prerequisites: ["skill63"], cost: 1 },
    skill60: { name: "Reinforced Vitality", stat: "Max Health", amount: 3, statMode: "flat", prerequisites: ["skill42"], cost: 1 },
    skill61: { name: "Arcane Might", stat: "Magic Damage", amount: 1, statMode: "percent", prerequisites: ["skill52"], cost: 1 },
    skill62: { name: "Mastery Spark", stat: "Skill Critical Chance", amount: 0.5, statMode: "percent", prerequisites: ["skill51"], cost: 1 },
    skill63: { name: "Arcane Might", stat: "Magic Damage", amount: 1, statMode: "percent", prerequisites: ["skill73"], cost: 1 },
    skill64: { name: "Mastery Spark", stat: "Skill Critical Chance", amount: 0.5, statMode: "percent", prerequisites: ["skill57"], cost: 1 },
    skill65: { name: "Reinforced Vitality", stat: "Max Health", amount: 3, statMode: "flat", prerequisites: ["skill56"], cost: 1 },
    skill66: { name: "Mastery Spark", stat: "Skill Critical Chance", amount: 0.5, statMode: "percent", prerequisites: ["skill56"], cost: 1 },
    skill67: { name: "Mastery Spark", stat: "Skill Critical Chance", amount: 0.5, statMode: "percent", prerequisites: ["skill76"], cost: 1 },
    skill68: { name: "Mastery Spark", stat: "Skill Critical Chance", amount: 0.5, statMode: "percent", prerequisites: ["skill66"], cost: 1 },
    skill69: { name: "Mastery Spark", stat: "Skill Critical Chance", amount: 0.5, statMode: "percent", prerequisites: ["skill71"], cost: 1 },
    skill70: { name: "Striking Force", stat: "Attack Damage", amount: 2, statMode: "flat", prerequisites: ["skill74"], cost: 1 },
    skill71: { name: "Mastery Spark", stat: "Skill Critical Chance", amount: 0.5, statMode: "percent", prerequisites: ["skill64"], cost: 1 },
    skill72: { name: "Arcane Might", stat: "Magic Damage", amount: 1, statMode: "percent", prerequisites: ["skill69"], cost: 1 },
    skill73: { name: "Arcane Might", stat: "Magic Damage", amount: 1, statMode: "percent", prerequisites: ["skill62"], cost: 1 },
    skill74: { name: "Arcane Might", stat: "Magic Damage", amount: 1, statMode: "percent", prerequisites: ["skill72"], cost: 1 },
    skill75: { name: "Reinforced Vitality", stat: "Max Health", amount: 3, statMode: "flat", prerequisites: ["skill71"], cost: 1 },
    skill76: { name: "Reinforced Vitality", stat: "Max Health", amount: 3, statMode: "flat", prerequisites: ["skill77"], cost: 1 },
    skill77: { name: "Arcane Reserve", stat: "Max Mana", amount: 2, statMode: "flat", prerequisites: ["skill75"], cost: 1 },
  });

  // ============================================================
  // SHAMAN SKILLS
  // Edit the values inside each skill entry. All 77 skills are listed here.
  // statMode must be "flat" or "percent"; prerequisites use skill IDs such as ["skill2"].
  // ============================================================
  const SHAMAN_SKILLS = indexClassSkills("Shaman", {
    skill1: { name: "Shaman Path", description: "The center of the tree." },
    skill2: { name: "Arcane Might", stat: "Magic Damage", amount: 1, statMode: "percent", prerequisites: ["skill1"], cost: 1 },
    skill3: { name: "Arcane Might", stat: "Magic Damage", amount: 1, statMode: "percent", prerequisites: ["skill2"], cost: 1 },
    skill4: { name: "Healing Art", stat: "Bonus Heal", amount: 1, statMode: "flat", prerequisites: ["skill25", "skill3", "skill5", "skill28"], cost: 1 },
    skill5: { name: "Arcane Might", stat: "Magic Damage", amount: 1, statMode: "percent", prerequisites: ["skill25"], cost: 1 },
    skill6: { name: "Arcane Might", stat: "Magic Damage", amount: 1, statMode: "percent", prerequisites: ["skill1"], cost: 1 },
    skill7: { name: "Reinforced Guard", stat: "Defense", amount: 2, statMode: "flat", prerequisites: ["skill6"], cost: 1 },
    skill8: { name: "Arcane Absorption", stat: "Spell Vampirism", amount: 0.1, statMode: "percent", prerequisites: ["skill27"], cost: 1 },
    skill9: { name: "Mastery Spark", stat: "Skill Critical Chance", amount: 0.5, statMode: "percent", prerequisites: ["skill23"], cost: 1 },
    skill10: { name: "Arcane Reserve", stat: "Max Mana", amount: 2, statMode: "flat", prerequisites: ["skill11"], cost: 1 },
    skill11: { name: "Reinforced Vitality", stat: "Max Health", amount: 3, statMode: "flat", prerequisites: ["skill17"], cost: 1 },
    skill12: { name: "Arcane Might", stat: "Magic Damage", amount: 1, statMode: "percent", prerequisites: ["skill19"], cost: 1 },
    skill13: { name: "Reinforced Vitality", stat: "Max Health", amount: 3, statMode: "flat", prerequisites: ["skill10"], cost: 1 },
    skill14: { name: "Striking Force", stat: "Attack Damage", amount: 2, statMode: "flat", prerequisites: ["skill12"], cost: 1 },
    skill15: { name: "Mastery Apex", stat: "Skill Critical Power", amount: 5, statMode: "percent", prerequisites: ["skill13"], cost: 1 },
    skill16: { name: "Mastery Spark", stat: "Skill Critical Chance", amount: 0.5, statMode: "percent", prerequisites: ["skill17"], cost: 1 },
    skill17: { name: "Mastery Spark", stat: "Skill Critical Chance", amount: 0.5, statMode: "percent", prerequisites: ["skill21"], cost: 1 },
    skill18: { name: "Healing Art", stat: "Bonus Heal", amount: 1, statMode: "flat", prerequisites: ["skill24"], cost: 1 },
    skill19: { name: "Arcane Might", stat: "Magic Damage", amount: 1, statMode: "percent", prerequisites: ["skill16"], cost: 1 },
    skill20: { name: "Arcane Might", stat: "Magic Damage", amount: 1, statMode: "percent", prerequisites: ["skill9"], cost: 1 },
    skill21: { name: "Mastery Spark", stat: "Skill Critical Chance", amount: 0.5, statMode: "percent", prerequisites: ["skill28"], cost: 1 },
    skill22: { name: "Arcane Might", stat: "Magic Damage", amount: 1, statMode: "percent", prerequisites: ["skill20"], cost: 1 },
    skill23: { name: "Reinforced Vitality", stat: "Max Health", amount: 3, statMode: "flat", prerequisites: ["skill27"], cost: 1 },
    skill24: { name: "Mastery Spark", stat: "Skill Critical Chance", amount: 0.5, statMode: "percent", prerequisites: ["skill25"], cost: 1 },
    skill25: { name: "Reinforced Vitality", stat: "Max Health", amount: 3, statMode: "flat", prerequisites: ["skill33"], cost: 1 },
    skill26: { name: "Mastery Spark", stat: "Skill Critical Chance", amount: 0.5, statMode: "percent", prerequisites: ["skill7"], cost: 1 },
    skill27: { name: "Mastery Spark", stat: "Skill Critical Chance", amount: 0.5, statMode: "percent", prerequisites: ["skill33"], cost: 1 },
    skill28: { name: "Arcane Might", stat: "Magic Damage", amount: 1, statMode: "percent", prerequisites: ["skill5"], cost: 1 },
    skill29: { name: "Arcane Might", stat: "Magic Damage", amount: 1, statMode: "percent", prerequisites: ["skill22"], cost: 1 },
    skill30: { name: "Light Step", stat: "Movement Speed", amount: 3, statMode: "percent", prerequisites: ["skill31"], cost: 1 },
    skill31: { name: "Reinforced Vitality", stat: "Max Health", amount: 3, statMode: "flat", prerequisites: ["skill43"], cost: 1 },
    skill32: { name: "Reinforced Vitality", stat: "Max Health", amount: 3, statMode: "flat", prerequisites: ["skill22"], cost: 1 },
    skill33: { name: "Mastery Spark", stat: "Skill Critical Chance", amount: 0.5, statMode: "percent", prerequisites: ["skill1"], cost: 1 },
    skill34: { name: "Mana Flow", stat: "Max Mana", amount: 2, statMode: "flat", prerequisites: ["skill3"], cost: 1 },
    skill35: { name: "Swiftness", stat: "Attack Speed", amount: 0.05, statMode: "percent", prerequisites: ["skill41"], cost: 1 },
    skill36: { name: "Mastery Spark", stat: "Skill Critical Chance", amount: 0.5, statMode: "percent", prerequisites: ["skill29"], cost: 1 },
    skill37: { name: "Healing Art", stat: "Bonus Heal", amount: 1, statMode: "flat", prerequisites: ["skill39"], cost: 1 },
    skill38: { name: "Healing Art", stat: "Bonus Heal", amount: 1, statMode: "flat", prerequisites: ["skill40"], cost: 1 },
    skill39: { name: "Arcane Might", stat: "Magic Damage", amount: 1, statMode: "percent", prerequisites: ["skill3"], cost: 1 },
    skill40: { name: "Arcane Might", stat: "Magic Damage", amount: 1, statMode: "percent", prerequisites: ["skill7"], cost: 1 },
    skill41: { name: "Mastery Spark", stat: "Skill Critical Chance", amount: 0.5, statMode: "percent", prerequisites: ["skill46"], cost: 1 },
    skill42: { name: "Arcane Reserve", stat: "Max Mana", amount: 2, statMode: "flat", prerequisites: ["skill32"], cost: 1 },
    skill43: { name: "Arcane Reserve", stat: "Max Mana", amount: 2, statMode: "flat", prerequisites: ["skill59"], cost: 1 },
    skill44: { name: "Mastery Spark", stat: "Skill Critical Chance", amount: 0.5, statMode: "percent", prerequisites: ["skill36"], cost: 1 },
    skill45: { name: "Reinforced Guard", stat: "Defense", amount: 2, statMode: "flat", prerequisites: ["skill2"], cost: 1 },
    skill46: { name: "Mastery Spark", stat: "Skill Critical Chance", amount: 0.5, statMode: "percent", prerequisites: ["skill54"], cost: 1 },
    skill47: { name: "Swiftness", stat: "Attack Speed", amount: 0.05, statMode: "percent", prerequisites: ["skill44"], cost: 1 },
    skill48: { name: "Mana Flow", stat: "Max Mana", amount: 2, statMode: "flat", prerequisites: ["skill50"], cost: 1 },
    skill49: { name: "Mastery Spark", stat: "Skill Critical Chance", amount: 0.5, statMode: "percent", prerequisites: ["skill1"], cost: 1 },
    skill50: { name: "Arcane Might", stat: "Magic Damage", amount: 1, statMode: "percent", prerequisites: ["skill6"], cost: 1 },
    skill51: { name: "Arcane Absorption", stat: "Spell Vampirism", amount: 0.1, statMode: "percent", prerequisites: ["skill45"], cost: 1 },
    skill52: { name: "Healing Art", stat: "Bonus Heal", amount: 1, statMode: "flat", prerequisites: ["skill50"], cost: 1 },
    skill53: { name: "Light Step", stat: "Movement Speed", amount: 3, statMode: "percent", prerequisites: ["skill60"], cost: 1 },
    skill54: { name: "Arcane Might", stat: "Magic Damage", amount: 1, statMode: "percent", prerequisites: ["skill63"], cost: 1 },
    skill55: { name: "Mastery Spark", stat: "Skill Critical Chance", amount: 0.5, statMode: "percent", prerequisites: ["skill45"], cost: 1 },
    skill56: { name: "Mastery Spark", stat: "Skill Critical Chance", amount: 0.5, statMode: "percent", prerequisites: ["skill49"], cost: 1 },
    skill57: { name: "Arcane Might", stat: "Magic Damage", amount: 1, statMode: "percent", prerequisites: ["skill48"], cost: 1 },
    skill58: { name: "Reinforced Vitality", stat: "Max Health", amount: 3, statMode: "flat", prerequisites: ["skill49", "skill50", "skill61", "skill66"], cost: 1 },
    skill59: { name: "Reinforced Vitality", stat: "Max Health", amount: 3, statMode: "flat", prerequisites: ["skill63"], cost: 1 },
    skill60: { name: "Reinforced Vitality", stat: "Max Health", amount: 3, statMode: "flat", prerequisites: ["skill42"], cost: 1 },
    skill61: { name: "Arcane Might", stat: "Magic Damage", amount: 1, statMode: "percent", prerequisites: ["skill52"], cost: 1 },
    skill62: { name: "Mastery Spark", stat: "Skill Critical Chance", amount: 0.5, statMode: "percent", prerequisites: ["skill51"], cost: 1 },
    skill63: { name: "Arcane Might", stat: "Magic Damage", amount: 1, statMode: "percent", prerequisites: ["skill73"], cost: 1 },
    skill64: { name: "Mastery Spark", stat: "Skill Critical Chance", amount: 0.5, statMode: "percent", prerequisites: ["skill57"], cost: 1 },
    skill65: { name: "Reinforced Vitality", stat: "Max Health", amount: 3, statMode: "flat", prerequisites: ["skill56"], cost: 1 },
    skill66: { name: "Mastery Spark", stat: "Skill Critical Chance", amount: 0.5, statMode: "percent", prerequisites: ["skill56"], cost: 1 },
    skill67: { name: "Healing Art", stat: "Bonus Heal", amount: 1, statMode: "flat", prerequisites: ["skill76"], cost: 1 },
    skill68: { name: "Healing Art", stat: "Bonus Heal", amount: 1, statMode: "flat", prerequisites: ["skill66"], cost: 1 },
    skill69: { name: "Mastery Spark", stat: "Skill Critical Chance", amount: 0.5, statMode: "percent", prerequisites: ["skill71"], cost: 1 },
    skill70: { name: "Striking Force", stat: "Attack Damage", amount: 2, statMode: "flat", prerequisites: ["skill74"], cost: 1 },
    skill71: { name: "Mastery Spark", stat: "Skill Critical Chance", amount: 0.5, statMode: "percent", prerequisites: ["skill64"], cost: 1 },
    skill72: { name: "Arcane Might", stat: "Magic Damage", amount: 1, statMode: "percent", prerequisites: ["skill69"], cost: 1 },
    skill73: { name: "Arcane Might", stat: "Magic Damage", amount: 1, statMode: "percent", prerequisites: ["skill62"], cost: 1 },
    skill74: { name: "Arcane Might", stat: "Magic Damage", amount: 1, statMode: "percent", prerequisites: ["skill72"], cost: 1 },
    skill75: { name: "Reinforced Vitality", stat: "Max Health", amount: 3, statMode: "flat", prerequisites: ["skill71"], cost: 1 },
    skill76: { name: "Reinforced Vitality", stat: "Max Health", amount: 3, statMode: "flat", prerequisites: ["skill77"], cost: 1 },
    skill77: { name: "Arcane Reserve", stat: "Max Mana", amount: 2, statMode: "flat", prerequisites: ["skill75"], cost: 1 },
  });
  const CLASS_SKILLS = Object.freeze({
    archer: ARCHER_SKILLS,
    assassin: ASSASSIN_SKILLS,
    guerrier: WARRIOR_SKILLS,
    mage: MAGE_SKILLS,
    shaman: SHAMAN_SKILLS,
    "martial-artist": WARRIOR_SKILLS
  });

  global.CharacterBuildData = Object.freeze({
    classes,
    slots,
    MAX_CHARACTER_LEVEL,
    SKILL_POINTS_PER_LEVEL,
    skillPointsForLevel,
    SKILL_TREE_LAYOUT,
    SKILL_TREE_CONNECTIONS,
    SKILL_TREE_ALL_PREREQUISITES,
    ARCHER_SKILLS,
    ASSASSIN_SKILLS,
    WARRIOR_SKILLS,
    MAGE_SKILLS,
    SHAMAN_SKILLS,
    CLASS_SKILLS
  });
})(window);
