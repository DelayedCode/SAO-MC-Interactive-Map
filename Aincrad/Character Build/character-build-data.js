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

  const icon = name => global.CharacterBuildIcons.markup(name);
  const skillIcon = name => global.CharacterBuildIcons.skill(name);
  const icons = {
    helmet: icon("helmet"), chestplate: icon("chestplate"), leggings: icon("leggings"), boots: icon("boots"),
    amulet: icon("amulet"), ring: icon("ring"), bracelet: icon("bracelet"), glove: icon("glove"),
    artifact: icon("artifact"), shield: icon("shield"), sword: icon("sword")
  };
  const skillIcons = {
    root: skillIcon("root"), branchA: skillIcon("branchA"), branchB: skillIcon("branchB")
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

  function createPrototypeTree(classId, nodes) {
    const positions = [[50, 8], [28, 28], [18, 48], [28, 68], [18, 88], [72, 28], [82, 48], [72, 68], [82, 88]];
    const prerequisites = [[], ["root"], ["branch-a-1"], ["branch-a-2"], ["branch-a-3"], ["root"], ["branch-b-1"], ["branch-b-2"], ["branch-b-3"]];
    const branches = ["core", "branch-a", "branch-a", "branch-a", "branch-a", "branch-b", "branch-b", "branch-b", "branch-b"];
    return nodes.map((node, index) => ({
      id: `${classId}-${index === 0 ? "root" : `${branches[index]}-${index > 4 ? index - 4 : index}`}`,
      name: node.name,
      description: `Prototype ${branches[index]} node for ${classId}.`,
      icon: node.icon || (index === 0 ? skillIcons.root : index > 4 ? skillIcons.branchB : skillIcons.branchA),
      branch: branches[index],
      x: positions[index][0],
      y: positions[index][1],
      prerequisites: prerequisites[index].map(id => `${classId}-${id}`),
      effects: [{ stat: node.stat, value: node.value }],
      tier: index === 0 ? 0 : index === 4 || index === 8 ? 3 : index,
      prototype: true
    }));
  }

  const prototypeSkillTrees = {
    archer: createPrototypeTree("archer", [
      { name: "Ranger's Foundation", stat: "Health", value: 1 }, { name: "Eagle Eye", stat: "Projectile Damage", value: 1 }, { name: "Measured Draw", stat: "Critical Hit Chance", value: "0.5%" }, { name: "Swift Step", stat: "Movement Speed", value: 1 }, { name: "Hawkeye Finish", stat: "Damage", value: 2 }, { name: "Trail Rations", stat: "Stamina", value: 1 }, { name: "Quick Release", stat: "Attack Speed", value: 1 }, { name: "Marked Shot", stat: "Critical Hit Damage", value: "0.5%" }, { name: "Storm Volley", stat: "Skill Damage", value: 1 }
    ]),
    assassin: createPrototypeTree("assassin", [
      { name: "Duelist's Foundation", stat: "Health", value: 1 }, { name: "Light Footwork", stat: "Evasion", value: 1 }, { name: "Silent Edge", stat: "Critical Hit Chance", value: "0.5%" }, { name: "Vanish Step", stat: "Movement Speed", value: 1 }, { name: "Execution Point", stat: "Damage", value: 2 }, { name: "Fencer's Rhythm", stat: "Attack Speed", value: 1 }, { name: "Weak Point", stat: "Critical Hit Damage", value: "0.5%" }, { name: "Sudden Strike", stat: "Physical Damage", value: 1 }, { name: "Perfect Opening", stat: "Skill Damage", value: 1 }
    ]),
    guerrier: createPrototypeTree("guerrier", [
      { name: "Guardian's Foundation", stat: "Health", value: 1 }, { name: "Iron Wall", stat: "Defense", value: 1 }, { name: "Brace", stat: "Block Proficiency", value: 1 }, { name: "Hold Fast", stat: "Tenacity", value: 1 }, { name: "Bulwark Finish", stat: "Block Power", value: 2 }, { name: "Heavy Step", stat: "Knockback Resistance", value: 1 }, { name: "Fortified Core", stat: "Damage Reduction", value: "0.5%" }, { name: "Shield Bash", stat: "Physical Damage", value: 1 }, { name: "Last Stand", stat: "Health", value: 1 }
    ]),
    mage: createPrototypeTree("mage", [
      { name: "Arcanist's Foundation", stat: "Mana", value: 1 }, { name: "Arcane Thread", stat: "Magic Damage", value: 1 }, { name: "Mana Well", stat: "Mana Regeneration", value: 1 }, { name: "Spell Sunder", stat: "Skill Damage", value: 1 }, { name: "Astral Focus", stat: "Damage", value: 2 }, { name: "Flowing Aether", stat: "Haste", value: 1 }, { name: "Arcane Guard", stat: "Defense", value: 1 }, { name: "Starfall", stat: "Critical Hit Damage", value: "0.5%" }, { name: "Grand Formula", stat: "Magic Damage", value: 1 }
    ]),
    "martial-artist": createPrototypeTree("martial-artist", [
      { name: "Monk's Foundation", stat: "Health", value: 1 }, { name: "Iron Fist", stat: "Damage", value: 1 }, { name: "Flowing Guard", stat: "Parry Chance", value: "0.5%" }, { name: "Fleet Form", stat: "Movement Speed", value: 1 }, { name: "Perfect Form", stat: "Physical Damage", value: 2 }, { name: "Rapid Hands", stat: "Attack Speed", value: 1 }, { name: "Centered Breath", stat: "Stamina Regeneration", value: 1 }, { name: "Counter Rhythm", stat: "Critical Hit Chance", value: "0.5%" }, { name: "Limit Break", stat: "Skill Damage", value: 1 }
    ]),
    shaman: createPrototypeTree("shaman", [
      { name: "Spirit's Foundation", stat: "Health", value: 1 }, { name: "Mending Rite", stat: "Healing Power", value: 1 }, { name: "Spirit Link", stat: "Mana", value: 1 }, { name: "Rooted Step", stat: "Knockback Resistance", value: 1 }, { name: "Renewal Finish", stat: "Bonus Healing", value: 2 }, { name: "Calm Waters", stat: "Mana Regeneration", value: 1 }, { name: "Living Grove", stat: "Health Regeneration", value: 1 }, { name: "Kindred Spirits", stat: "Healing Power", value: "0.5%" }, { name: "Sanctuary", stat: "Defense", value: 1 }
    ])
  };

  global.CharacterBuildData = Object.freeze({ classes, slots, prototypeSkillTrees });
})(window);
