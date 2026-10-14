(function (global) {
  "use strict";

  const paths = {
    build:
      '<circle cx="9" cy="7" r="3"/><path d="M3.5 20v-1.5A4.5 4.5 0 0 1 8 14h2a4.5 4.5 0 0 1 4.5 4.5V20"/><path d="M15 5h6M18 2v6"/>',
    character:
      '<circle cx="12" cy="7" r="3.2"/><path d="M5 20v-1.2A5.8 5.8 0 0 1 10.8 13h2.4A5.8 5.8 0 0 1 19 18.8V20"/>',
    equipment: '<path d="m7 4 5 2 5-2 4 4-2 4-2-1v9H7v-9l-2 1-2-4Z"/><path d="M8 5v6l4 2 4-2V5M12 13v7"/>',
    weapons: '<path d="M4 4 20 20M13 4 4 13M16 8l3-3M6 18l-2 2"/><path d="M10 14 6 18M14 10l4-4"/>',
    armor: '<path d="M12 3 19 6v5c0 4.5-2.8 8-7 10-4.2-2-7-5.5-7-10V6Z"/><path d="M12 6v12M8 9h8"/>',
    stats:
      '<path d="M5 18.5V9.5M9 18.5V6.5M13 18.5V11.5M17 18.5V8.5"/><path d="M4.5 18.5h15"/><path d="M6.5 7.5 9.5 10.2 12.6 8.4 17.5 5.5"/>',
    skills:
      '<circle cx="12" cy="5" r="2"/><circle cx="6" cy="18" r="2"/><circle cx="18" cy="18" r="2"/><path d="M12 7v5M12 12 6 16M12 12l6 4"/>',
    calculations:
      '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h8M8 11h2m4 0h2M8 15h2m4 0h2M8 18h8"/>',
    saved: '<path d="M6 4h12a2 2 0 0 1 2 2v14l-8-4-8 4V6a2 2 0 0 1 2-2Z"/><path d="m9 11 2 2 4-4"/>',
    reset: '<path d="M5 8a8 8 0 1 1-1 7"/><path d="M5 4v4h4"/>',
    current: '<path d="M12 3 20 7.5v9L12 21l-8-4.5v-9Z"/><path d="m8 12 2.5 2.5L16 9"/>',
    beta: '<path d="M12 3 20 7.5v9L12 21l-8-4.5v-9Z"/><path d="M8 12h8M12 8v8"/>',
    rune: '<path d="m12 3 7 9-7 9-7-9Z"/><path d="M12 7v10M9 12h6"/>',
    close: '<path d="m5 5 14 14M19 5 5 19"/>'
  };
  const imagePaths = Object.freeze({
    helmet: "Helmet.png",
    chestplate: "Chestplate.png",
    leggings: "Leggings.png",
    boots: "Boots.png",
    amulet: "Amulet.png",
    ring: "Ring.png",
    bracelet: "Bracelet.png",
    glove: "Glove.png",
    artifact: "Artifact.png",
    shield: "Offhand.png",
    sword: "Main%20Weapon.png"
  });
  const imageClasses = Object.freeze({
    helmet: "cb-icon--helmet",
    chestplate: "cb-icon--chestplate",
    leggings: "cb-icon--leggings",
    boots: "cb-icon--boots",
    amulet: "cb-icon--amulet",
    ring: "cb-icon--ring",
    bracelet: "cb-icon--bracelet",
    glove: "cb-icon--glove",
    artifact: "cb-icon--artifact",
    shield: "cb-icon--shield",
    sword: "cb-icon--sword"
  });

  const skillPaths = {
    root: '<circle cx="12" cy="12" r="5"/><path d="M12 3v4m0 10v4M3 12h4m10 0h4"/>',
    branchA: '<path d="m12 3 3 6 6 .8-4.4 4.3 1 6.1-5.6-2.9-5.6 2.9 1-6.1L3 9.8 9 9Z"/>',
    branchB: '<path d="M12 3v18M5 8h14M7 16h10"/><path d="m5 8 2-3 2 3m8 0 2-3 2 3"/>'
  };

  /* Equipment stat presentation. Each stat type maps to one category, and every category owns a
     single icon so the same stat looks the same in the equipment selector, the item details and the
     set-bonus blocks. The matching colours live in character-build.css (.stat-entry--<category>),
     keyed by these same category names. */
  const statIcons = Object.freeze({
    health: '<path d="M12 20.3S4 15.3 4 9.9a4.2 4.2 0 0 1 8-1.9 4.2 4.2 0 0 1 8 1.9c0 5.4-8 10.4-8 10.4Z"/>',
    healthRegeneration:
      '<path d="M12 20.3S4 15.3 4 9.9a4.2 4.2 0 0 1 8-1.9 4.2 4.2 0 0 1 8 1.9c0 5.4-8 10.4-8 10.4Z"/><path d="M12 10.4v3.6M10.2 12.2h3.6"/>',
    stamina: '<path d="M4.6 16.4a7.4 7.4 0 1 1 14.8 0"/><path d="m12 16.4 3.9-4.6"/><path d="M12 16.4h.01"/>',
    staminaRegeneration: '<path d="M4.6 16.4a7.4 7.4 0 1 1 14.8 0"/><path d="M12 12.6v4.6M9.7 14.9h4.6"/>',
    mana: '<path d="M12 3.6S6.4 9.7 6.4 13.7a5.6 5.6 0 0 0 11.2 0C17.6 9.7 12 3.6 12 3.6Z"/>',
    manaRegeneration:
      '<path d="M12 3.6S6.4 9.7 6.4 13.7a5.6 5.6 0 0 0 11.2 0C17.6 9.7 12 3.6 12 3.6Z"/><path d="M12 11.4v3.6M10.2 13.2h3.6"/>',
    attackDamage: paths.weapons,
    projectileDamage: '<path d="M4 12h14"/><path d="m13 7 5 5-5 5"/>',
    attackSpeed: '<path d="M13 2 5.5 13H11l-1 9 8-11.5h-5.5Z"/>',
    criticalChance:
      '<circle cx="12" cy="12" r="7.2"/><path d="M12 2.5v3.4M12 18.1v3.4M2.5 12h3.4M18.1 12h3.4"/><circle cx="12" cy="12" r="1.4"/>',
    criticalDamage:
      '<path d="M12 2.5v4M12 17.5v4M2.5 12h4M17.5 12h4M5.3 5.3l2.8 2.8M15.9 15.9l2.8 2.8M18.7 5.3l-2.8 2.8M8.1 15.9l-2.8 2.8"/><circle cx="12" cy="12" r="2.4"/>',
    skillDamage: '<path d="m12 3 2.3 6.7L21 12l-6.7 2.3L12 21l-2.3-6.7L3 12l6.7-2.3Z"/>',
    cooldownReduction: '<circle cx="12" cy="12" r="8"/><path d="M12 7.4V12l3.2 2"/>',
    lifeSteal:
      '<path d="M12 3.6S6.4 9.7 6.4 13.7a5.6 5.6 0 0 0 11.2 0C17.6 9.7 12 3.6 12 3.6Z"/><path d="M12 9.6v4.6M9.8 12l2.2 2.2 2.2-2.2"/>',
    defense: '<path d="M12 3 19.5 6.1v5.2c0 4.7-3 8.4-7.5 10.4-4.5-2-7.5-5.7-7.5-10.4V6.1Z"/>',
    damageReduction:
      '<path d="M12 3 19.5 6.1v5.2c0 4.7-3 8.4-7.5 10.4-4.5-2-7.5-5.7-7.5-10.4V6.1Z"/><path d="M9 11.6h6"/>',
    dodge: '<path d="M4 9h9.5a2.5 2.5 0 1 0-2.5-2.5"/><path d="M4 15h13.5a2.5 2.5 0 1 1-2.5 2.5"/><path d="M4 12h7"/>',
    tenacity:
      '<circle cx="12" cy="5" r="2.2"/><path d="M12 7.2V20"/><path d="M5.2 13.4a6.8 6.8 0 0 0 13.6 0"/><path d="M3.4 13.4h3.6M17 13.4h3.6"/>',
    movementSpeed: '<path d="m5 6 6 6-6 6"/><path d="m12 6 6 6-6 6"/>',
    bonusHealing: '<circle cx="12" cy="12" r="8"/><path d="M12 8.2v7.6M8.2 12h7.6"/>',
    toolEffect:
      '<path d="M15.4 4.2a4.6 4.6 0 0 0-5.9 5.9L4 15.6V20h4.4l5.5-5.5a4.6 4.6 0 0 0 5.9-5.9l-2.9 2.9-2.6-2.6Z"/>',
    requirement:
      '<rect x="5" y="4.5" width="14" height="16" rx="2.2"/><path d="M9 4.5V3.2h6v1.3"/><path d="M9 10h6M9 14h4"/>',
    metadata: '<circle cx="12" cy="12" r="8"/><path d="M12 11.2v5"/><path d="M12 8.1h.01"/>',
    unknown: '<path d="m12 4.5 7 7.5-7 7.5-7-7.5Z"/>'
  });

  const statCategoryNames = Object.freeze({
    health: ["health", "max health", "hp"],
    healthRegeneration: ["health regeneration", "health regen"],
    stamina: ["stamina", "max stamina"],
    staminaRegeneration: ["stamina regeneration", "stamina regen"],
    mana: ["mana", "max mana"],
    manaRegeneration: ["mana regeneration", "mana regen"],
    attackDamage: ["damage", "attack damage", "weapon damage", "physical damage", "melee damage"],
    projectileDamage: ["projectile damage"],
    attackSpeed: ["attack speed"],
    criticalChance: [
      "critical hit chance",
      "critical chance",
      "critical chance skill",
      "skill critical hit chance",
      "skill critical chance",
      "critical skill hit chance",
      "crit chance"
    ],
    criticalDamage: [
      "critical hit damage",
      "critical damage",
      "damage critical hits",
      "critical damage skill",
      "skill critical hit damage",
      "skill critical damage",
      "critical skill hit damage",
      "crit damage"
    ],
    skillDamage: ["skill damage", "ability damage", "magic damage", "spell damage"],
    cooldownReduction: ["cooldown reduction", "ability haste", "haste"],
    lifeSteal: ["life steal", "lifesteal", "omnivamp", "omnivampirism", "spell vampirism", "flight of life"],
    defense: [
      "defense",
      "defence",
      "blocking power",
      "block power",
      "blocking mastery",
      "block mastery",
      "block proficiency",
      "guard durability"
    ],
    damageReduction: ["damage reduction", "fall damage reduction", "falls reduction"],
    dodge: ["dodge", "evasion"],
    tenacity: ["tenacity", "knockback resistance", "parry chance"],
    movementSpeed: ["movement speed", "crouch speed", "crouching speed"],
    bonusHealing: ["bonus healing", "healing bonus", "healing power", "heal power"],
    toolEffect: ["effect: harvest power", "effect: sustainability", "harvest power", "sustainability"],
    metadata: ["class", "rune slots", "two-handed", "unique", "weapon category"]
  });

  /* Resolves any stat name the equipment data uses onto a single presentation category, so one stat
     always renders with one icon and one colour. Unknown names fall back to a neutral category
     instead of being hidden. */
  function statCategory(name) {
    const normalized = String(name || "")
      .trim()
      .toLowerCase();
    if (!normalized) return "unknown";
    if (normalized.startsWith("requirement:")) return "requirement";
    if (normalized.startsWith("effect:")) return "toolEffect";
    const match = (value) =>
      Object.keys(statCategoryNames).find((category) => statCategoryNames[category].includes(value));
    const direct = match(normalized);
    if (direct) return direct;
    const stripped = normalized.replace(/^(?:bonus|max|total|increased|extra)\s+/, "");
    if (stripped !== normalized) {
      const indirect = match(stripped);
      if (indirect) return indirect;
    }
    return "unknown";
  }

  function stat(category) {
    const content = statIcons[category] || statIcons.unknown;
    return `<svg class="cb-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${content}</svg>`;
  }

  function markup(name, options = {}) {
    if (imagePaths[name]) {
      return `<img class="cb-icon cb-icon-image ${imageClasses[name]}" src="${imagePaths[name]}" alt="" aria-hidden="true">`;
    }
    const content = paths[name] || paths.build;
    const className = ` class="cb-icon${options.className ? ` ${options.className}` : ""}"`;
    const label = options.label
      ? ` role="img" aria-label="${String(options.label).replace(/"/g, "&quot;")}"`
      : ' aria-hidden="true"';
    return `<svg${className} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"${label}>${content}</svg>`;
  }

  function skill(name) {
    return `<svg class="cb-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${skillPaths[name] || skillPaths.root}</svg>`;
  }

  global.CharacterBuildIcons = Object.freeze({
    markup,
    skill,
    stat,
    statCategory,
    statCategories: Object.freeze(Object.keys(statIcons)),
    names: Object.freeze(Object.keys(paths))
  });
})(window);
