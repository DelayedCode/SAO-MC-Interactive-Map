(function (global) {
  "use strict";

  const normalizedCache = new Map();
  const runeCache = new Map();
  const characterBuildCategories = new Set(["armor", "weapon", "accessory", "tool"]);
  const betaCacheKey = "sao.characterBuild.beta.normalized";
  const betaCacheVersion = "character-build-beta-v1";
  const classIds = new Map([
    ["archer", "archer"],
    ["ranger", "archer"],
    ["assassin", "assassin"],
    ["dps", "assassin"],
    ["warrior", "guerrier"],
    ["guerrier", "guerrier"],
    ["tank", "guerrier"],
    ["mage", "mage"],
    ["shaman", "shaman"],
    ["martial artist", "martial-artist"],
    ["martial-artist", "martial-artist"],
    ["melee", "martial-artist"]
  ]);
  const toolSlotMap = Object.freeze({
    "Chipped Axe": "Main Weapon",
    "Cracked Pickaxe": "Main Weapon",
    "Metal Axe": "Main Weapon",
    "Metal Hoe": "Main Weapon",
    "Metal Pickaxe": "Main Weapon",
    "Magic Brush": null,
    "Twisted Sickle": "Main Weapon",
    "Torch": null,
    "Wooden Fishing Rod": null,
    "Necrotic Ax": "Main Weapon",
    "Necrotic Hoe": "Main Weapon",
    "Necrotic Pickaxe": "Main Weapon",
    "Savannah Ax": "Main Weapon",
    "Savannah Hoe": "Main Weapon",
    "Savannah Pickaxe": "Main Weapon",
    "Reinforced Ax": "Main Weapon",
    "Reinforced Hoe": "Main Weapon",
    "Reinforced Pickaxe": "Main Weapon"
  });

  const intentionalNoStatItems = Object.freeze(new Set([
    "Boots of the Foam",
    "Red Christmas Mittens",
    "Occult Boots",
    "Magic Brush",
    "Torch",
    "Wooden Fishing Rod"
  ]));


  function slugify(value) {
    return String(value || "unknown")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "unknown";
  }

  function getSourceRecords(source) {
    if (source === "current") {
      return global.SAO_CURRENT_EQUIPMENT_DATA || {};
    }

    return {
      floor1: global.FLOOR_1_DATA || {},
      floor2: global.FLOOR_2_DATA || {},
      floor3: global.FLOOR_3_DATA || {}
    };
  }

  function classifyArmor(name) {
    const normalizedName = String(name || "").toLowerCase();
    if (/\b(?:helm(?:et)?s?|mask)\b/.test(normalizedName)) return "Helmet";
    if (/\b(tunics?|robes?|breastplates?)\b/.test(normalizedName)) return "Chestplate";
    if (/\b(leggings?|trousers?|pants?)\b/.test(normalizedName)) return "Leggings";
    if (/\b(boots?|sandals?)\b/.test(normalizedName)) return "Boots";
    return null;
  }

  function classifyAccessory(name) {
    const normalizedName = String(name || "").toLowerCase();
    if (/\bbracelets?\b/.test(normalizedName)) return "Bracelet";
    if (/\bgloves?\b/.test(normalizedName)) return "Glove";
    if (/\brings?\b/.test(normalizedName)) return "Ring";
    if (/\b(amulets?|necklaces?)\b/.test(normalizedName)) return "Amulet";
    return "Artifact";
  }

  function classifyWeapon(name) {
    return /\b(shield|buckler)\b/i.test(String(name || "")) ? "Offhand" : "Main Weapon";
  }

  function getSlotType(category, name) {
    if (category === "armor") return classifyArmor(name);
    if (category === "accessory") return classifyAccessory(name);
    if (category === "weapon") return classifyWeapon(name);
    if (category === "tool") return toolSlotMap[name] || null;
    return null;
  }

  function hasExplicitAccessoryKeyword(name) {
    return /\b(bracelets?|gloves?|rings?|amulets?|necklaces?)\b/i.test(String(name || ""));
  }

  function parseSetBonuses(stats) {
    return Object.entries(stats || {})
      .map(([key, value]) => {
        const match = key.match(/^(\d+) Piece Set Bonus$/i);
        if (!match) return null;
        const effects = String(value || "")
          .split(/,\s*/)
          .map(effect => effect.trim())
          .filter(Boolean)
          .map(effect => {
            const effectMatch = effect.match(/^([+-]?\d+(?:\.\d+)?%?)(?:\/s)?\s+(.+)$/);
            return effectMatch ? { value: effectMatch[1], stat: effectMatch[2].trim(), raw: effect } : { value: null, stat: null, raw: effect };
          });
        return { threshold: Number(match[1]), sourceKey: key, sourceValue: String(value), effects };
      })
      .filter(Boolean);
  }

  function hasUsableStats(stats, category) {
    const keys = Object.keys(stats || {});
    if (!keys.length) return false;
    if (category === "tool") return true;
    return keys.some(key => {
      const classification = global.CharacterBuildCalculator?.classifyStatName?.(key);
      return classification === "calculated" || classification === "conditional";
    });
  }

  function normalizeClasses(stats) {
    const rawClass = stats?.Class;
    if (!rawClass || /^any$/i.test(String(rawClass).trim())) return [];
    const classNames = new Set();
    String(rawClass)
      .split(/[,/]|\s*\band\b\s*/i)
      .map(value => value.trim())
      .filter(Boolean)
      .forEach(value => {
        const normalized = value.toLowerCase();
        const mapped = classIds.get(normalized);
        if (mapped) classNames.add(mapped);
      });
    return [...classNames];
  }

  function getSourceEntries(source) {
    const records = [];
    const sourceData = getSourceRecords(source);

    Object.entries(sourceData).forEach(([floor, categories]) => {
      Object.entries(categories || {}).forEach(([category, entries]) => {
        if (!characterBuildCategories.has(category)) return;
        if (!Array.isArray(entries)) return;
        entries.forEach((entry, index) => {
          if (!entry || !entry.name) return;
          records.push(normalizeEntry(entry, source, floor, category, index));
        });
      });
    });

    return records;
  }

  function normalizeRune(entry, source, floor, index) {
    const stats = entry.stats && typeof entry.stats === "object" ? { ...entry.stats } : {};
    const effects = Object.entries(stats)
      .filter(([key]) => key.toLowerCase() !== "class")
      .map(([key, value]) => `${key}: ${value}`);
    const id = entry.id || `${source}-${floor}-rune-${index}-${slugify(entry.name)}`;
    global.SAOContentTranslations?.registerEquipmentEntry?.(entry, slugify, { fields: ["name", "description"] });
    return Object.freeze({
      id,
      name: entry.name,
      translationId: entry.id || slugify(entry.name),
      category: "rune",
      rarity: entry.rarity || null,
      levelRequirement: Number.isFinite(Number(entry.level)) ? Number(entry.level) : null,
      stats: Object.freeze(stats),
      effects: Object.freeze(effects),
      searchText: [entry.name, entry.description, ...effects].filter(Boolean).join(" ").toLowerCase(),
      description: entry.description || null,
      source,
      floor,
      runeKey: slugify(entry.name)
    });
  }

  function getRunes(source) {
    const normalizedSource = source === "current" ? "current" : "beta";
    if (runeCache.has(normalizedSource)) return runeCache.get(normalizedSource);
    const sourceData = getSourceRecords(source);
    const runes = [];
    Object.entries(sourceData).forEach(([floor, categories]) => {
      (categories?.rune || []).forEach((entry, index) => {
        if (entry?.name) runes.push(normalizeRune(entry, source, floor, index));
      });
    });
    const normalizedRunes = Object.freeze(runes);
    runeCache.set(normalizedSource, normalizedRunes);
    return normalizedRunes;
  }

  function getRuneSlots(item) {
    if (!item || item.category !== "armor") return 0;
    const value = Number(item.stats?.["Rune Slots"]);
    return Number.isFinite(value) && value > 0 ? Math.floor(value) : 0;
  }

  function getMaxRuneSlots(source) {
    return getItems(source).reduce((maximum, item) => Math.max(maximum, getRuneSlots(item)), 0);
  }

  function normalizeEntry(entry, source, floor, category, index) {
    const stats = entry.stats && typeof entry.stats === "object" ? { ...entry.stats } : {};
    const slotType = getSlotType(category, entry.name);
    const setBonuses = parseSetBonuses(stats);
    const id = entry.id || `${source}-${floor}-${category}-${index}-${slugify(entry.name)}`;
    const uniqueEffects = new Map();
    Object.entries(stats)
      .filter(([key]) => key.toLowerCase() !== "class")
      .forEach(([key, value]) => {
        const effectText = `${key}: ${value}`;
        if (!uniqueEffects.has(effectText)) uniqueEffects.set(effectText, effectText);
      });
    const effects = [...uniqueEffects.keys()];

    global.SAOContentTranslations?.registerEquipmentEntry?.(entry, slugify, { fields: ["name", "description"] });

    const searchText = [entry.name, category, entry.description, ...effects]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return Object.freeze({
      id,
      name: entry.name,
      translationId: entry.id || slugify(entry.name),
      type: slotType,
      category,
      originalCategory: category,
      slot: slotType,
      set: entry.set || null,
      setBonuses: Object.freeze(setBonuses.map(bonus => Object.freeze({
        threshold: bonus.threshold,
        sourceKey: bonus.sourceKey,
        sourceValue: bonus.sourceValue,
        effects: Object.freeze(bonus.effects.map(effect => Object.freeze(effect)))
      }))),
      rarity: entry.rarity || null,
      levelRequirement: Number.isFinite(Number(entry.level)) ? Number(entry.level) : null,
      classes: normalizeClasses(stats),
      classLabel: stats.Class || null,
      stats: Object.freeze(stats),
      effects: Object.freeze(effects),
      searchText,
      description: entry.description || null,
      source,
      floor,
      equipmentKey: slugify(entry.name)
    });
  }

  function betaDataSignature() {
    const sourceData = getSourceRecords("beta");
    const serialized = JSON.stringify(sourceData);
    let hash = 2166136261;
    for (let index = 0; index < serialized.length; index += 1) {
      hash ^= serialized.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return `${hash >>> 0}-${serialized.length}`;
  }

  function getBetaCache() {
    const storage = global.SAOStorage;
    if (!storage || typeof storage.getJSON !== "function") return null;
    const cached = storage.getJSON(betaCacheKey, null);
    if (!cached || cached.version !== betaCacheVersion || cached.dataSignature !== betaDataSignature() || !Array.isArray(cached.items)) return null;
    return cached;
  }

  function captureEquipmentTranslations() {
    const translations = global.SAOContentTranslations;
    if (!translations?.en || !translations.es || !translations.fr) return null;
    return Object.fromEntries(Object.keys(translations.en)
      .filter(key => key.startsWith("equipment."))
      .map(key => [key, { en: translations.en[key], es: translations.es[key], fr: translations.fr[key] }]));
  }

  function restoreEquipmentTranslations(snapshot) {
    const translations = global.SAOContentTranslations;
    if (!translations || !snapshot) return;
    Object.entries(snapshot).forEach(([key, values]) => {
      translations.en[key] = values.en;
      translations.es[key] = values.es;
      translations.fr[key] = values.fr;
    });
  }

  function saveBetaCache(items) {
    const storage = global.SAOStorage;
    if (!storage || typeof storage.setJSON !== "function") return;
    storage.setJSON(betaCacheKey, {
      version: betaCacheVersion,
      dataSignature: betaDataSignature(),
      items,
      translations: captureEquipmentTranslations()
    });
  }

  function getItems(source) {
    const normalizedSource = source === "current" ? "current" : "beta";
    if (!normalizedCache.has(normalizedSource)) {
      if (normalizedSource === "beta") {
        const cached = getBetaCache();
        if (cached) {
          restoreEquipmentTranslations(cached.translations);
          const cachedItems = Object.freeze(cached.items.map(item => Object.freeze(item)));
          normalizedCache.set(normalizedSource, cachedItems);
          return cachedItems;
        }
      }
      const items = Object.freeze(getSourceEntries(normalizedSource));
      normalizedCache.set(normalizedSource, items);
      if (normalizedSource === "beta") saveBetaCache(items);
    }
    return normalizedCache.get(normalizedSource);
  }

  function buildAuditReport() {
    const sourceData = getSourceRecords("beta");
    const floorCounts = {};
    const slotCounts = {};
    const classCounts = {};
    const unclassifiedItems = [];
    const artifactFallbackItems = [];
    const missingStatsByCategory = { armor: [], accessory: [], weapon: [], tool: [] };
    const categoryCounts = Object.fromEntries(["armor", "accessory", "weapon", "tool"].map(category => [category, { total: 0, withStats: 0, withoutStats: 0 }]));
    const setAudit = new Map();
    const statisticInventory = new Map();
    const uninterpretedStatistics = [];
    let totalRecords = 0;
    let classifiedCount = 0;

    Object.entries(sourceData).forEach(([floor, categories]) => {
      if (!categories || typeof categories !== "object") return;
      floorCounts[floor] = 0;
      Object.entries(categories).forEach(([category, entries]) => {
        if (!Array.isArray(entries)) return;
        if (!["armor", "weapon", "accessory", "tool"].includes(category)) return;

        entries.forEach((entry) => {
          if (!entry || !entry.name) return;
          totalRecords += 1;
          floorCounts[floor] += 1;
          categoryCounts[category].total += 1;

          const stats = entry.stats && typeof entry.stats === "object" ? { ...entry.stats } : {};
          const normalizedClass = normalizeClasses(stats);
          const slotType = getSlotType(category, entry.name);
          const setBonuses = parseSetBonuses(stats);
          let hasStats = hasUsableStats(stats, category);
          if (intentionalNoStatItems.has(entry.name)) {
            hasStats = false;
          }
          if (hasStats) categoryCounts[category].withStats += 1;
          else {
            if (!intentionalNoStatItems.has(entry.name)) {
              categoryCounts[category].withoutStats += 1;
              missingStatsByCategory[category].push({
                itemName: entry.name,
                floor,
                originalCategory: category,
                set: entry.set || null,
                statsField: Object.prototype.hasOwnProperty.call(entry, "stats")
                  ? Object.keys(stats).length ? "metadata-only" : "empty"
                  : "missing",
                statistics: stats,
                normalizedType: slotType
              });
            }
          }
          const isArtifactFallback = category === "accessory" && slotType === "Artifact" && !hasExplicitAccessoryKeyword(entry.name);

          const knownTool = category === "tool" && Object.prototype.hasOwnProperty.call(toolSlotMap, entry.name);
          if (slotType || knownTool) {
            classifiedCount += 1;
            const auditSlot = slotType || "Utility Tool";
            slotCounts[auditSlot] = (slotCounts[auditSlot] || 0) + 1;
            if (isArtifactFallback) {
              artifactFallbackItems.push({
                itemName: entry.name,
                floor,
                currentClassification: slotType,
                rawCategory: category,
                classRestriction: normalizedClass,
                statistics: stats,
                reason: "Accessory name did not contain Bracelet, Glove, Ring, Amulet, or Necklace, so the Artifact fallback was used."
              });
            }
          } else {
            const reason = category === "armor"
              ? "Armor name did not match Helmet, Chestplate, Leggings, or Boots keywords."
              : category === "accessory"
                ? "Accessory name did not match Bracelet, Glove, Ring, Amulet, or Necklace keywords."
                : category === "tool"
                  ? "Tool is not present in the centralized Tool slot map."
                : "Weapon name did not match a recognized shield or main-weapon classification rule.";
            unclassifiedItems.push({
              itemName: entry.name,
              floor,
              originalCategory: category,
              normalizedType: null,
              classRestriction: normalizedClass,
              statistics: stats,
              reason
            });
          }

          if (normalizedClass.length) {
            normalizedClass.forEach(classId => {
              classCounts[classId] = (classCounts[classId] || 0) + 1;
            });
          } else {
            classCounts.all = (classCounts.all || 0) + 1;
          }

          Object.entries(stats).forEach(([key, value]) => {
            const existing = statisticInventory.get(key) || { count: 0, values: new Set(), classification: null };
            existing.count += 1;
            existing.values.add(String(value));
            existing.classification = global.CharacterBuildCalculator?.classifyStatName?.(key) || "unverified";
            existing.normalizedName = global.CharacterBuildCalculator?.normalizeStatName?.(key) || null;
            statisticInventory.set(key, existing);
            if (existing.classification === "unsupported") {
              uninterpretedStatistics.push({ itemName: entry.name, floor, category, key, value });
            }
          });

          if (entry.set) {
            const summary = setAudit.get(entry.set) || { pieceCount: 0, items: new Set(), thresholds: new Map() };
            summary.pieceCount += 1;
            summary.items.add(entry.name);
            setBonuses.forEach(bonus => {
              const threshold = summary.thresholds.get(bonus.threshold) || { sourceValues: new Set(), effects: new Map() };
              threshold.sourceValues.add(bonus.sourceValue);
              bonus.effects.forEach(effect => {
                if (!effect.stat) return;
                const effectValues = threshold.effects.get(effect.stat) || new Set();
                effectValues.add(effect.value);
                threshold.effects.set(effect.stat, effectValues);
              });
              summary.thresholds.set(bonus.threshold, threshold);
            });
            setAudit.set(entry.set, summary);
          }
        });
      });
    });

    const statisticsByClassification = Object.freeze(Object.fromEntries(["calculated", "metadata", "conditional", "unsupported", "unverified"].map(classification => [
      classification,
      Object.freeze([...statisticInventory].filter(([, value]) => value.classification === classification).map(([key]) => key))
    ])));
    const setBonusAuditEntries = {};
    setAudit.forEach((summary, setName) => {
      const thresholds = {};
      [...summary.thresholds].sort(([left], [right]) => left - right).forEach(([threshold, value]) => {
        thresholds[threshold] = Object.freeze({
          sourceValues: Object.freeze([...value.sourceValues]),
          effects: Object.freeze(Object.fromEntries([...value.effects].map(([stat, values]) => [stat, Object.freeze([...values])])))
        });
      });
      setBonusAuditEntries[setName] = Object.freeze({
        pieceCount: summary.pieceCount,
        items: Object.freeze([...summary.items]),
        thresholds: Object.freeze(thresholds)
      });
    });
    const setBonusAudit = Object.freeze(setBonusAuditEntries);

    return Object.freeze({
      totalBetaEquipmentRecords: totalRecords,
      totalSuccessfullyClassified: classifiedCount,
      totalUnclassified: unclassifiedItems.length,
      countsBySlot: Object.freeze(slotCounts),
      countsByFloor: Object.freeze(floorCounts),
      countsByClassRestriction: Object.freeze(classCounts),
      countsByCategory: Object.freeze(Object.fromEntries(Object.entries(categoryCounts).map(([category, counts]) => [category, Object.freeze({ ...counts })]))),
      missingStatsByCategory: Object.freeze(Object.fromEntries(Object.entries(missingStatsByCategory).map(([category, items]) => [category, Object.freeze(items.map(item => Object.freeze(item)))]))),
      toolSlotMap,
      unclassifiedItems: Object.freeze(unclassifiedItems),
      artifactFallbackItems: Object.freeze(artifactFallbackItems),
      statisticInventory: Object.freeze(Object.fromEntries([...statisticInventory].map(([key, value]) => [key, Object.freeze({ count: value.count, values: Object.freeze([...value.values]), classification: value.classification, normalizedName: value.normalizedName })]))),
      statisticsByClassification,
      calculatedStatistics: Object.freeze([...new Set([...statisticInventory].filter(([, value]) => value.classification === "calculated").map(([, value]) => value.normalizedName).filter(Boolean))]),
      displayedStatistics: Object.freeze([...new Set([...statisticInventory].filter(([, value]) => value.classification === "calculated").map(([, value]) => value.normalizedName).filter(Boolean))]),
      calculatedSetBonusStatistics: statisticsByClassification.conditional,
      preservedButUnsupportedStatistics: Object.freeze([...statisticsByClassification.metadata, ...statisticsByClassification.unsupported]),
      setBonusAudit,
      uninterpretedStatistics: Object.freeze(uninterpretedStatistics)
    });
  }

  function isItemCompatibleWithClass(item, classId) {
    if (!classId || !item) return true;
    if (item.category === "accessory") return true;
    if (!Array.isArray(item.classes) || item.classes.length === 0) return true;
    return item.classes.includes(classId);
  }

  function getItemsForSlot(source, slotId, classId = null) {
    const slotTypes = {
      helmet: "Helmet",
      chestplate: "Chestplate",
      leggings: "Leggings",
      boots: "Boots",
      amulet: "Amulet",
      "ring-1": "Ring",
      "ring-2": "Ring",
      bracelet: "Bracelet",
      glove: "Glove",
      "artifact-1": "Artifact",
      "artifact-2": "Artifact",
      "artifact-3": "Artifact",
      offhand: "Offhand",
      "main-weapon": "Main Weapon"
    };
    const type = slotTypes[slotId];
    return getItems(source)
      .filter(item => item.slot === type)
      .filter(item => classId == null || isItemCompatibleWithClass(item, classId));
  }

  function isAvailable(item, source, slotId, classId = null) {
    return getItemsForSlot(source, slotId, classId).some(candidate => candidate.equipmentKey === item?.equipmentKey);
  }

  function getText(item, field) {
    const value = item?.[field];
    if (!value) return value;
    const contentKey = `equipment.${item.translationId}.${field}`;
    return global.SAOI18n?.content?.(contentKey, value) || value;
  }

  global.CharacterBuildAdapter = Object.freeze({
    getItems,
    getRunes,
    getRuneSlots,
    getMaxRuneSlots,
    getItemsForSlot,
    isItemCompatibleWithClass,
    isAvailable,
    getText,
    toolSlotMap,
    getAuditReport: buildAuditReport,
    get cacheSize() { return normalizedCache.size; }
  });
})(window);
