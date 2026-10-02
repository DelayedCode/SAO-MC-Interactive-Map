(function (global) {
  "use strict";

  const groups = Object.freeze({
    Offensive: [
      "Damage",
      "Magic Damage",
      "Skill Damage",
      "Projectile Damage",
      "Attack Speed",
      "Critical Hit Chance",
      "Critical Hit Damage",
      "Skill Critical Hit Chance",
      "Skill Critical Hit Damage"
    ],
    Defensive: ["Defense", "Health", "Evasion", "Damage Reduction", "Tenacity"],
    "Mobility & Stamina": ["Movement Speed", "Mana", "Stamina"],
    "Health & Regeneration": ["Health Regeneration", "Mana Regeneration", "Stamina Regeneration"]
  });
  const supportedStats = new Set(Object.values(groups).flat());
  const statAliases = new Map([
    ["attack damage", "Damage"],
    ["bonus attack speed", "Attack Speed"],
    ["critical chance skill", "Skill Critical Hit Chance"],
    ["critical damage", "Critical Hit Damage"],
    ["critical damage skill", "Skill Critical Hit Damage"],
    ["skill critical damage", "Skill Critical Hit Damage"],
    ["damage critical hits", "Critical Hit Damage"],
    ["ability damage", "Skill Damage"],
    ["dodge", "Evasion"],
    ["bonus movement speed", "Movement Speed"]
  ]);
  const metadataPrefixes = ["requirement:"];
  const metadataStats = new Set(["Class", "Two-Handed", "Rune Slots", "Unique"]);
  const conditionalStats = new Set([
    "2 Piece Set Bonus",
    "3 Piece Set Bonus",
    "4 Piece Set Bonus",
    "5 Piece Set Bonus",
    "6 Piece Set Bonus",
    "7 Piece Set Bonus"
  ]);

  function normalizeStatName(value) {
    const normalized = String(value || "")
      .trim()
      .toLowerCase()
      .replace(/[_-]+/g, " ")
      .replace(/\s+/g, " ");
    const alias = statAliases.get(normalized);
    if (alias && supportedStats.has(alias)) return alias;
    return (
      Object.keys(groups)
        .flatMap((group) => groups[group])
        .find((stat) => stat.toLowerCase() === normalized) || null
    );
  }

  function classifyStatName(value) {
    const name = String(value || "").trim();
    const normalized = name.toLowerCase();
    if (metadataStats.has(name) || metadataPrefixes.some((prefix) => normalized.startsWith(prefix))) return "metadata";
    if (conditionalStats.has(name)) return "conditional";
    if (normalizeStatName(name)) return "calculated";
    return "unsupported";
  }

  function parseValue(value) {
    const text = String(value ?? "").trim();
    const numericMatch = text.match(/[-+]?\d+(?:\.\d+)?/);
    if (!numericMatch) return null;
    const number = Number(numericMatch[0]);
    if (!Number.isFinite(number)) return null;
    return { flat: text.includes("%") ? 0 : number, percent: text.includes("%") ? number : 0 };
  }

  /* Every character starts from these values; the class level progression and every equipment, rune
     and skill contribution are added on top of them. */
  function createBaseStats() {
    return Object.fromEntries([...supportedStats].map((stat) => [stat, { flat: 0, percent: 0 }]));
  }

  /* Per-level class gains. The level control runs from 1 to 25 and level 1 is the base (the stats
     panel labels those values "Level 1 Base"), so a build receives (level - 1) increments. */
  const classLevelBonuses = Object.freeze({
    assassin: Object.freeze([
      { stat: "Health", value: "1.25" },
      { stat: "Critical Hit Damage", value: "0.25%" },
      { stat: "Health Regeneration", value: "0.1" },
      { stat: "Mana Regeneration", value: "0.1" },
      { stat: "Stamina Regeneration", value: "0.1" }
    ]),
    archer: Object.freeze([
      { stat: "Health", value: "1.25" },
      { stat: "Critical Hit Chance", value: "0.25%" },
      { stat: "Health Regeneration", value: "0.1" },
      { stat: "Mana Regeneration", value: "0.1" },
      { stat: "Stamina Regeneration", value: "0.1" }
    ]),
    guerrier: Object.freeze([
      { stat: "Health", value: "1.5" },
      { stat: "Health Regeneration", value: "0.1" },
      { stat: "Mana Regeneration", value: "0.1" },
      { stat: "Stamina Regeneration", value: "0.1" }
    ]),
    mage: Object.freeze([
      { stat: "Health", value: "1.25" },
      { stat: "Skill Critical Hit Damage", value: "0.25%" },
      { stat: "Health Regeneration", value: "0.1" },
      { stat: "Mana Regeneration", value: "0.1" },
      { stat: "Stamina Regeneration", value: "0.1" }
    ]),
    shaman: Object.freeze([
      { stat: "Health", value: "1.25" },
      { stat: "Skill Critical Hit Chance", value: "0.25%" },
      { stat: "Health Regeneration", value: "0.1" },
      { stat: "Mana Regeneration", value: "0.1" },
      { stat: "Stamina Regeneration", value: "0.1" }
    ])
  });

  function applyClassLevelBonuses(result, classId, level) {
    const bonuses = classLevelBonuses[classId];
    if (!bonuses || !bonuses.length) return;
    const increments = Math.max(0, Math.floor(Number(level) || 1) - 1);
    for (let index = 0; index < increments; index += 1) {
      bonuses.forEach((bonus) => applyEffect(result, bonus.stat, bonus.value));
    }
  }

  function applyEffect(result, name, value) {
    const stat = normalizeStatName(name);
    const parsed = parseValue(value);
    if (!stat || !parsed) return;
    result[stat].flat += parsed.flat;
    result[stat].percent += parsed.percent;
  }

  function applyActiveSetBonuses(result, equippedItems) {
    const sets = new Map();
    equippedItems.forEach((item) => {
      if (!item?.set || !Array.isArray(item.setBonuses) || !item.setBonuses.length) return;
      const summary = sets.get(item.set) || { count: 0, thresholds: new Map() };
      summary.count += 1;
      item.setBonuses.forEach((bonus) => {
        const effects = summary.thresholds.get(bonus.threshold) || new Map();
        (bonus.effects || []).forEach((effect) => {
          if (!effect.stat || effect.value === null) return;
          const key = `${effect.stat}\u0000${effect.value}`;
          effects.set(key, effect);
        });
        summary.thresholds.set(bonus.threshold, effects);
      });
      sets.set(item.set, summary);
    });

    sets.forEach((summary) => {
      summary.thresholds.forEach((effects, threshold) => {
        if (summary.count < threshold) return;
        effects.forEach((effect) => applyEffect(result, effect.stat, effect.value));
      });
    });
  }

  function calculateBuildStats(buildState) {
    const result = createBaseStats();
    applyClassLevelBonuses(result, buildState?.classId, buildState?.level);
    const equipment = buildState?.equipment || {};
    const isAvailable = typeof buildState?.isAvailable === "function" ? buildState.isAvailable : () => true;
    const equippedItems = [];

    Object.entries(equipment).forEach(([slotId, item]) => {
      if (!item || !isAvailable(item, buildState.source, slotId)) return;
      equippedItems.push(item);
      Object.entries(item.stats || {}).forEach(([name, value]) => {
        applyEffect(result, name, value);
      });
    });

    applyActiveSetBonuses(result, equippedItems);

    (buildState?.selectedSkills || []).forEach((skill) => {
      (skill.effects || []).forEach((effect) => applyEffect(result, effect.stat, effect.value));
    });

    return result;
  }

  function formatNumber(value) {
    const rounded = Math.round((Number(value) + Number.EPSILON) * 10000) / 10000;
    return String(rounded)
      .replace(/\.0+$/, "")
      .replace(/(\.\d*?)0+$/, "$1");
  }

  function formatValue(value) {
    if (!value || value.percent === 0) return formatNumber(value?.flat ?? 1);
    const percent = `${value.percent > 0 ? "+" : ""}${formatNumber(value.percent)}%`;
    return `${formatNumber(value.flat)} (${percent})`;
  }

  global.CharacterBuildCalculator = Object.freeze({
    groups,
    supportedStats,
    classLevelBonuses,
    metadataStats,
    conditionalStats,
    calculateBuildStats,
    classifyStatName,
    createBaseStats,
    formatValue,
    normalizeStatName,
    parseValue
  });
})(window);
