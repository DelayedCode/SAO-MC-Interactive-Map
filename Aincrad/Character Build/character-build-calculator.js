(function (global) {
  "use strict";

  const groups = Object.freeze({
    "Offensive": ["Damage", "Physical Damage", "Weapon Damage", "Magic Damage", "Skill Damage", "Projectile Damage", "Attack Speed", "Critical Hit Chance", "Critical Hit Damage", "Skill Critical Hit Chance", "Skill Critical Hit Damage"],
    "Defensive": ["Defense", "Block Proficiency", "Block Power", "Health", "Evasion", "Damage Reduction", "Fall Damage Reduction", "Tenacity", "Knockback Resistance", "Parry Chance"],
    "Mobility & Stamina": ["Haste", "Movement Speed", "Crouching Speed", "Mana", "Stamina"],
    "Health & Regeneration": ["Life Steal", "Omnivamp", "Bonus Healing", "Healing Power", "Health Regeneration", "Mana Regeneration", "Stamina Regeneration"],
    "Special Effects": ["Flight Of Life"]
  });
  const supportedStats = new Set(Object.values(groups).flat());
  const statAliases = new Map([
    ["omnivampirism", "Omnivamp"],
    ["critical chance skill", "Skill Critical Hit Chance"],
    ["critical damage skill", "Skill Critical Hit Damage"],
    ["skill critical damage", "Skill Critical Hit Damage"],
    ["damage critical hits", "Critical Hit Damage"],
    ["blocking mastery", "Block Proficiency"],
    ["blocking power", "Block Power"],
    ["falls reduction", "Fall Damage Reduction"],
    ["crouch speed", "Crouching Speed"]
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
    if (statAliases.has(normalized)) return statAliases.get(normalized);
    return Object.keys(groups).flatMap(group => groups[group]).find(stat => stat.toLowerCase() === normalized) || null;
  }

  function classifyStatName(value) {
    const name = String(value || "").trim();
    const normalized = name.toLowerCase();
    if (metadataStats.has(name) || metadataPrefixes.some(prefix => normalized.startsWith(prefix))) return "metadata";
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

  function createBaseStats() {
    return Object.fromEntries([...supportedStats].map(stat => [stat, { flat: 1, percent: 0 }]));
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
    equippedItems.forEach(item => {
      if (!item?.set || !Array.isArray(item.setBonuses) || !item.setBonuses.length) return;
      const summary = sets.get(item.set) || { count: 0, thresholds: new Map() };
      summary.count += 1;
      item.setBonuses.forEach(bonus => {
        const effects = summary.thresholds.get(bonus.threshold) || new Map();
        (bonus.effects || []).forEach(effect => {
          if (!effect.stat || effect.value === null) return;
          const key = `${effect.stat}\u0000${effect.value}`;
          effects.set(key, effect);
        });
        summary.thresholds.set(bonus.threshold, effects);
      });
      sets.set(item.set, summary);
    });

    sets.forEach(summary => {
      summary.thresholds.forEach((effects, threshold) => {
        if (summary.count < threshold) return;
        effects.forEach(effect => applyEffect(result, effect.stat, effect.value));
      });
    });
  }

  function calculateBuildStats(buildState) {
    const result = createBaseStats();
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

    (buildState?.selectedSkills || []).forEach(skill => {
      (skill.effects || []).forEach(effect => applyEffect(result, effect.stat, effect.value));
    });

    return result;
  }

  function formatNumber(value) {
    const rounded = Math.round((Number(value) + Number.EPSILON) * 10000) / 10000;
    return String(rounded).replace(/\.0+$/, "").replace(/(\.\d*?)0+$/, "$1");
  }

  function formatValue(value) {
    if (!value || value.percent === 0) return formatNumber(value?.flat ?? 1);
    const percent = `${value.percent > 0 ? "+" : ""}${formatNumber(value.percent)}%`;
    return `${formatNumber(value.flat)} (${percent})`;
  }

  global.CharacterBuildCalculator = Object.freeze({
    groups,
    supportedStats,
    metadataStats,
    conditionalStats,
    calculateBuildStats,
    classifyStatName,
    formatValue,
    normalizeStatName,
    parseValue
  });
})(window);
