const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const equipmentCategories = new Set(["weapon", "armor", "accessory", "tool"]);
const intentionalStatlessNames = new Set([
  "Boots of the Foam",
  "Red Christmas Mittens",
  "Magic Brush",
  "Torch",
  "Wooden Fishing Rod",
  "Occult Boots"
]);
const validToolEffects = new Set(["Effect: Harvest Power", "Effect: Sustainability"]);
const placeholderPattern = /\b(?:current data|example stat|placeholder|replace this|todo)\b/i;

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function load(relativePath, context) {
  vm.runInNewContext(read(relativePath), context, { filename: relativePath });
}

function inspectStats(entry, category, calculator) {
  const stats = entry.stats;
  if (!stats || typeof stats !== "object" || Array.isArray(stats) || Object.keys(stats).length === 0) {
    return { status: "missing", missingFields: ["stats"], populatedFields: [] };
  }

  const populatedFields = Object.entries(stats).map(([name, value]) => ({ name, value }));
  const emptyFields = [];
  const zeroFields = [];
  const placeholderFields = [];
  const unsupportedFields = [];
  const usableFields = [];

  for (const [name, value] of Object.entries(stats)) {
    const valueText = String(value ?? "").trim();
    if (!name.trim() || value == null || valueText === "") emptyFields.push(name || "<empty stat name>");
    if ((typeof value === "number" && value === 0) || (typeof value === "string" && /^[-+]?0+(?:\.0+)?$/.test(valueText))) {
      zeroFields.push(name);
    }
    if (placeholderPattern.test(valueText)) placeholderFields.push(name);

    const classification = calculator.classifyStatName(name);
    const isToolEffect = category === "tool" && validToolEffects.has(name);
    if (classification === "calculated" || classification === "conditional" || isToolEffect) usableFields.push(name);
    if (classification === "unsupported" && !isToolEffect) unsupportedFields.push(name);
  }

  const issues = [];
  if (emptyFields.length) issues.push("empty-stat-values");
  if (placeholderFields.length) issues.push("placeholder-stat-values");
  if (unsupportedFields.length) issues.push("unsupported-stat-fields");
  if (zeroFields.length) issues.push("unverified-zero-values");
  if (!usableFields.length) issues.push("no-usable-stat-effects");

  return {
    status: issues.length ? "incomplete" : "complete",
    issues,
    missingFields: [
      ...emptyFields.map(name => `${name} value`),
      ...placeholderFields.map(name => `${name} value`),
      ...unsupportedFields.map(name => `${name} field`),
      ...zeroFields.map(name => `${name} zero value`),
      ...(!usableFields.length ? ["calculator-supported or category-specific stat effect"] : [])
    ],
    populatedFields,
    usableFields,
    unsupportedFields,
    zeroFields
  };
}

function getDuplicateGroups(records) {
  const byName = new Map();
  records.forEach(record => {
    const key = record.name.trim().toLowerCase();
    byName.set(key, [...(byName.get(key) || []), record]);
  });

  const groups = [...byName.entries()]
    .filter(([, items]) => items.length > 1)
    .map(([name, items]) => {
      const sameTier = items.filter(item => item.rarity && item.level != null)
        .reduce((tiers, item) => {
          const key = `${item.floor}:${item.category}:${item.rarity}:${item.level}`;
          tiers.set(key, [...(tiers.get(key) || []), item]);
          return tiers;
        }, new Map());
      const conflictingSameTier = [...sameTier.values()].filter(tierItems => {
        if (tierItems.length < 2) return false;
        const signatures = new Set(tierItems.map(item => JSON.stringify(item.stats || {})));
        return signatures.size > 1;
      });
      return {
        name,
        references: items.map(({ floor, category, rarity, level, set, stats }) => ({ floor, category, rarity, level, set: set || null, stats: stats || null })),
        sameTierStatConflicts: conflictingSameTier.length > 0
      };
    });

  return {
    duplicateNameGroups: groups,
    sameTierStatConflicts: groups.filter(group => group.sameTierStatConflicts)
  };
}

function auditEquipmentStats() {
  const context = { window: {}, console };
  context.window = context;

  for (const floor of [1, 2, 3]) load(`Aincrad/eCompendium/ecompendium_floor${floor}.js`, context);
  load("Aincrad/Character Build/character-build-calculator.js", context);

  const records = [];
  const categoryCounts = {};
  for (const floor of [1, 2, 3]) {
    const data = context[`FLOOR_${floor}_DATA`] || {};
    for (const [category, entries] of Object.entries(data)) {
      if (!equipmentCategories.has(category) || !Array.isArray(entries)) continue;
      categoryCounts[category] = (categoryCounts[category] || 0) + entries.length;
      entries.forEach(entry => {
        if (entry?.name) records.push({ ...entry, floor: `floor${floor}`, category });
      });
    }
  }

  const complete = [];
  const missing = [];
  const incomplete = [];
  const intentionalStatless = [];
  const calculator = context.CharacterBuildCalculator;

  for (const entry of records) {
    const reference = { name: entry.name, floor: entry.floor, category: entry.category };
    if (intentionalStatlessNames.has(entry.name)) {
      const stats = entry.stats && typeof entry.stats === "object" ? entry.stats : {};
      const effectFields = Object.keys(stats).filter(name => {
        const classification = calculator.classifyStatName(name);
        return classification === "calculated" || classification === "conditional" ||
          (entry.category === "tool" && validToolEffects.has(name));
      });
      intentionalStatless.push({
        ...reference,
        statsObjectPresent: Boolean(entry.stats),
        statsFields: Object.keys(stats),
        effectFields
      });
      continue;
    }

    const inspection = inspectStats(entry, entry.category, calculator);
    if (inspection.status === "missing") {
      missing.push({ ...reference, missingFields: inspection.missingFields });
    } else if (inspection.status === "incomplete") {
      incomplete.push({
        ...reference,
        issues: inspection.issues,
        missingFields: inspection.missingFields,
        populatedFields: inspection.populatedFields
      });
    } else {
      complete.push(reference);
    }
  }

  const duplicateReport = getDuplicateGroups(records);
  const braceletRecords = records
    .filter(entry => ["Thief's Bracelet", "Amethyst Bracelet"].includes(entry.name))
    .map(({ name, set, stats }) => ({ name, set: set || null, stats: { ...(stats || {}) } }));
  const occultSetBonuses = ["Shadow Neophyte F1", "Shadow Neophyte Set P2", "Seven Shadow Soldiers"].map(setName => {
    const pieces = records.filter(entry => entry.set === setName);
    const bonusPieces = pieces.filter(entry => entry.name !== "Occult Boots");
    const tiers = Object.fromEntries(Array.from({ length: 6 }, (_, index) => {
      const key = `${index + 2} Piece Set Bonus`;
      return [key, [...new Set(bonusPieces.map(entry => entry.stats?.[key] ?? null))]];
    }));
    const incompleteItems = bonusPieces
      .filter(entry => Array.from({ length: 6 }, (_, index) => `${index + 2} Piece Set Bonus`)
        .some(key => entry.stats?.[key] !== "+1.5/s Health Regeneration"))
      .map(entry => entry.name);
    return {
      set: setName,
      pieceCount: pieces.length,
      bonusPieceCount: bonusPieces.length,
      tiers,
      incompleteItems
    };
  });
  const currentDataContext = { window: {}, console };
  currentDataContext.window = currentDataContext;
  load("Aincrad/eCompendium/ecompendium_current.js", currentDataContext);
  const currentDatasetItems = Object.values(currentDataContext.SAO_CURRENT_EQUIPMENT_DATA || {})
    .flatMap(categories => Object.entries(categories || {})
      .filter(([category]) => equipmentCategories.has(category))
      .flatMap(([, entries]) => Array.isArray(entries) ? entries : []));

  return {
    totalEquipmentItems: records.length,
    complete: complete.length,
    missing: missing.length,
    incomplete: incomplete.length,
    intentionalStatless: intentionalStatless.length,
    countsByCategory: categoryCounts,
    missingItems: missing,
    incompleteItems: incomplete,
    intentionalStatlessItems: intentionalStatless,
    braceletRecords,
    occultSetBonuses,
    currentDatasetEquipmentItems: currentDatasetItems.length,
    duplicateNameGroups: duplicateReport.duplicateNameGroups,
    sameTierStatConflicts: duplicateReport.sameTierStatConflicts
  };
}

if (require.main === module) {
  console.log(JSON.stringify(auditEquipmentStats(), null, 2));
}

module.exports = auditEquipmentStats;