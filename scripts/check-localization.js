const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const registryContext = { window: {}, console };
vm.runInNewContext(fs.readFileSync(path.join(root, "shared", "sao-content-translations.js"), "utf8"), registryContext);
const registry = registryContext.window.SAOContentTranslations;
const manualResolutionPath = path.join(root, "scripts", "localization-unresolved.json");
const sameAsEnglishPath = path.join(root, "scripts", "localization-same-as-english.json");
const manualResolutionSource = fs.existsSync(manualResolutionPath)
  ? JSON.parse(fs.readFileSync(manualResolutionPath, "utf8"))
  : [];
const sameAsEnglishSource = fs.existsSync(sameAsEnglishPath)
  ? JSON.parse(fs.readFileSync(sameAsEnglishPath, "utf8"))
  : [];
function expandManualGroups(source) {
	const groups = Array.isArray(source) ? source : source.groups || [];
	return groups.flatMap(group => (group.values || []).map(english => ({
    ...group,
    english,
    values: undefined
  })));
}
const manualResolution = [
	...expandManualGroups(manualResolutionSource),
	...expandManualGroups(sameAsEnglishSource)
];
const required = new Set();
const intentionallyEnglish = new Set();

function slug(value) {
  return String(value || "unknown")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "unknown";
}

function add(key, english, options = {}) {
  required.add(key);
  if (options.intentionalEnglish) intentionallyEnglish.add(key);
  return english;
}

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function extractQuotedField(text, field) {
  const values = [];
  const pattern = new RegExp(`(?:["']${field}["']|\\b${field})\\s*:\\s*["']([^"']*)["']`, "g");
  let match;
  while ((match = pattern.exec(text))) values.push(match[1]);
  return values;
}

function loadScript(relativePath, context) {
  vm.runInNewContext(read(relativePath), context, { filename: relativePath });
}

function flattenTranslations(value, prefix = "", output = {}) {
  Object.entries(value || {}).forEach(([key, child]) => {
    const pathKey = prefix ? `${prefix}.${key}` : key;
    if (child && typeof child === "object" && !Array.isArray(child)) {
      flattenTranslations(child, pathKey, output);
    } else {
      output[pathKey] = child;
    }
  });
  return output;
}

function loadUiTranslations() {
  let source = read("shared/sao-i18n.js");
  source = source.replace("})(window);", "window.__SAOTranslations = translations;})(window);");
  const context = {
    window: {},
    console,
    document: { addEventListener() {} },
    localStorage: { getItem() { return null; }, setItem() {} }
  };
  vm.runInNewContext(source, context, { filename: "shared/sao-i18n.js" });
  return context.window.__SAOTranslations || {};
}

function placeholderTokens(value) {
  return [...String(value || "").matchAll(/\{[a-zA-Z0-9_]+\}/g)].map(match => match[0]).sort();
}

function isTechnicalLiteral(rawValue) {
  const value = String(rawValue || "").trim();
  if (!value) return true;
  if (/^(?:https?:\/\/|\/|#|[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}|[A-Za-z0-9._-]+\/[A-Za-z0-9._/-]+|[A-Za-z0-9._-]+(?:\.[A-Za-z0-9._-]+)+)$/.test(value)) return true;
  if (/^(?:[XxZz]:\s*--|[XxZz]:\s*[-\d.]+\s+[XxZz]:\s*[-\d.]+|X:\s*\$\{.*\}\s+Z:\s*\$\{.*\})$/.test(value)) return true;
  if (/^\d+(?:\.\d+)?(?:%|x)?$/.test(value)) return true;
  if (/^[A-Za-z0-9_./:-]+$/.test(value) && value.length <= 4 && !/[a-z]/.test(value)) return true;
  return false;
}

function isLikelyHardcodedUiText(value) {
  const cleaned = String(value || "").trim();
  if (!cleaned || isTechnicalLiteral(cleaned)) return false;
  return /[A-Za-z]/.test(cleaned) && !cleaned.includes("t(") && !cleaned.includes("content(") && !cleaned.includes("localize") && !cleaned.includes("translate");
}

function isPlaceholderCopy(value) {
  return /\b(?:current data example|replace this(?: placeholder)?|example stat|placeholder preview|visual placeholders)\b/i.test(String(value || ""));
}

function isIntentionalRenderException(entry) {
  const value = String(entry.value || "").trim();
  if (!value) return true;
  if (["x", "×", "&times;"].includes(value)) return true;
  if (/^\/\s*\$\{[^}]+\}$/.test(value)) return true;
  if (/<\/?[a-z][\s\S]*>/i.test(value)) return true;
  if (/(?:viewBox|stroke-width|fill=|path d=|cx=|cy=|r=|aria-hidden|focusable|class=|position:\s*fixed|display:\s*grid|background:\s*rgba?\()/i.test(value)) return true;
  if (/(?:Open links|Close links menu|Primary|Section navigation|Gamemode selector|Language settings hint|Choose Data Version|Close dataset selection)/i.test(value)) return true;
  return false;
}

function scanJavaScriptRenderPaths(relativePath, source) {
  const findings = [];
  const patterns = [
    /(?:textContent|innerText|innerHTML|title)\s*(?:=|\+=)\s*(["'`])((?:\\.|(?!\1).)*)\1/g,
    /(?:textContent|innerText|innerHTML|title)\s*(?:=|\+=)\s*`([^`]+)`/g,
    /setAttribute\(\s*["'](?:aria-label|alt|data-label|data-title|data-tooltip|title|placeholder)["']\s*,\s*(["'`])((?:\\.|(?!\1).)*)\1/g,
    /insertAdjacentHTML\(\s*["'][^"']+["']\s*,\s*(["'`])((?:\\.|(?!\1).)*)\1/g,
    /\b(?:alert|confirm|prompt)\(\s*(["'`])((?:\\.|(?!\1).)*)\1/g
  ];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(source))) {
      const value = match[2] || match[1] || "";
      const normalized = String(value || "").trim();
      if (!normalized || normalized.includes("t(") || normalized.includes("content(") || normalized.includes("localize") || normalized.includes("translate") || normalized.includes("window.SAOI18n") || normalized.includes("getAreaText")) continue;
      if (normalized.startsWith("${") || normalized.startsWith("${")) continue;
      if (!isLikelyHardcodedUiText(normalized)) continue;
      const line = source.slice(0, match.index).split(/\r?\n/).length;
      findings.push({ file: relativePath, line, value: normalized, kind: "javascript-render-literal" });
    }
  }

  return findings;
}

function auditRuntimeUi() {
  const translations = loadUiTranslations();
  const english = flattenTranslations(translations.en);
  const localeAudit = {};
  for (const language of ["en", "es", "fr"]) {
    const localized = flattenTranslations(translations[language]);
    const missingKeys = language === "en" ? [] : Object.keys(english).filter(key => localized[key] === undefined);
    const englishFallbackKeys = missingKeys.map(key => ({ key, english: english[key] }));
    const placeholderMismatches = language === "en" ? [] : Object.keys(english)
      .filter(key => localized[key] !== undefined && JSON.stringify(placeholderTokens(english[key])) !== JSON.stringify(placeholderTokens(localized[key])))
      .map(key => ({ key, english: english[key], localized: localized[key] }));
    localeAudit[language] = {
      missingKeys,
      englishFallbackKeys,
      emptyKeys: Object.keys(english).filter(key => typeof localized[key] !== "string" || localized[key].trim() === ""),
      placeholderKeys: Object.keys(english).filter(key => isPlaceholderCopy(localized[key])).map(key => ({ key, value: localized[key] })),
      unchangedKeys: Object.keys(english).filter(key => localized[key] !== undefined && localized[key] === english[key]),
      placeholderMismatches
    };
  }

  const hardcodedPlayerFacing = [];
  const intentionalExceptions = [];
  const htmlFiles = [];
  const scriptFiles = [];
  const referencedUiKeys = new Set();
  const uiKeyPattern = /["'`]((?:ui|page|dataset)\.[A-Za-z0-9_.-]+)["'`]/g;
  const recordUiKeyReferences = source => {
    for (const match of source.matchAll(uiKeyPattern)) referencedUiKeys.add(match[1]);
  };
  function collectHtmlFiles(directory) {
    fs.readdirSync(directory, { withFileTypes: true }).forEach(entry => {
      if ([".git", ".venv", "node_modules"].includes(entry.name)) return;
      const fullPath = path.join(directory, entry.name);
      if (entry.isDirectory()) return collectHtmlFiles(fullPath);
      if (entry.isFile() && entry.name.endsWith(".html")) htmlFiles.push(fullPath);
    });
  }
  function collectScriptFiles(directory) {
    fs.readdirSync(directory, { withFileTypes: true }).forEach(entry => {
      if ([".git", ".venv", "node_modules"].includes(entry.name)) return;
      const fullPath = path.join(directory, entry.name);
      if (entry.isDirectory()) return collectScriptFiles(fullPath);
      if (entry.isFile() && entry.name.endsWith(".js")) scriptFiles.push(fullPath);
    });
  }
  collectHtmlFiles(root);
  collectScriptFiles(root);
  scriptFiles.forEach(filePath => {
    const relativePath = path.relative(root, filePath).replace(/\\/g, "/");
    if (relativePath.startsWith("node_modules/")) return;
    const source = fs.readFileSync(filePath, "utf8");
    if (!relativePath.startsWith("scripts/") && !relativePath.startsWith("tmp_")) recordUiKeyReferences(source);
    const findings = scanJavaScriptRenderPaths(relativePath, source);
    findings.forEach(finding => {
      if (isIntentionalRenderException(finding)) {
        intentionalExceptions.push({ ...finding, reason: "Known non-player-facing markup or utility value" });
        return;
      }
      hardcodedPlayerFacing.push(finding);
    });
  });
  htmlFiles.forEach(filePath => {
    const relativePath = path.relative(root, filePath).replace(/\\/g, "/");
    const html = fs.readFileSync(filePath, "utf8");
    recordUiKeyReferences(html);
    for (const tagMatch of html.matchAll(/<[^>]+>/g)) {
      const tag = tagMatch[0];
      const line = html.slice(0, tagMatch.index).split(/\r?\n/).length;
      ["aria-label", "alt", "data-label", "data-title", "data-tooltip", "placeholder", "title", "value"].forEach(attribute => {
        const valueMatch = tag.match(new RegExp(`\\b${attribute}="([^"]+)"`));
        const translationAttribute = attribute.startsWith("data-") ? `data-i18n-${attribute.slice(5)}` : `data-i18n-${attribute}`;
        if (!valueMatch || tag.includes(translationAttribute) || (attribute === "title" && tag.includes("data-i18n"))) return;
        if (attribute === "value" && !/<button\b/i.test(tag) && !/<input\b[^>]*\btype=["'](?:button|submit|reset)["']/i.test(tag)) return;
        const finding = { file: relativePath, line, value: valueMatch[1], kind: attribute };
        if (isIntentionalRenderException(finding)) {
          intentionalExceptions.push({ ...finding, reason: "Known non-player-facing fallback attribute" });
          return;
        }
        hardcodedPlayerFacing.push(finding);
      });
    }
    for (const textMatch of html.matchAll(/>([^<\r\n]{3,})</g)) {
      const value = textMatch[1].trim();
      if (!value || ["Change Language Here!", "Changez de langue ici !", "¡Cambia el idioma aquí!", "&times;"].includes(value)) continue;
      if (/^[\d\s.XZ:>+%,-]+$/.test(value)) continue;
      const before = html.slice(0, textMatch.index);
      const openingTag = before.slice(before.lastIndexOf("<"));
      if (openingTag.includes("data-i18n") || /<(?:script|style)\b/i.test(openingTag)) continue;
      const line = before.split(/\r?\n/).length;
      const finding = { file: relativePath, line, value, kind: "text-node" };
      if (isIntentionalRenderException(finding)) {
        intentionalExceptions.push({ ...finding, reason: "Known non-player-facing text node" });
        continue;
      }
      hardcodedPlayerFacing.push(finding);
    }
  });
  const mapHtml = read("Aincrad/Map/maps.html");
  const sidebarPattern = /<(?:div|button)[^>]*(?:sidebar-section-title|sidebar-list-button)[^>]*>([^<]+)</g;
  let match;
  while ((match = sidebarPattern.exec(mapHtml))) {
    const lineStart = mapHtml.lastIndexOf("\n", match.index) + 1;
    const line = mapHtml.slice(lineStart, mapHtml.indexOf("\n", match.index));
    if (!line.includes("data-i18n")) hardcodedPlayerFacing.push({ file: "Aincrad/Map/maps.html", value: match[1].trim(), kind: "sidebar-label" });
  }
  for (const tagMatch of mapHtml.matchAll(/<[^>]+>/g)) {
    if (!/\baria-label="[^"]+"/.test(tagMatch[0]) || /\bdata-i18n-aria-label="[^"]+"/.test(tagMatch[0])) continue;
    const ariaLabel = tagMatch[0].match(/\baria-label="([^"]+)"/);
    if (ariaLabel) hardcodedPlayerFacing.push({ file: "Aincrad/Map/maps.html", value: ariaLabel[1], kind: "accessibility-label" });
  }
  if (read("Aincrad/Quests/quests.js").includes("No quest entries to display.")) {
    const finding = { file: "Aincrad/Quests/quests.js", value: "No quest entries to display.", kind: "javascript-string" };
    if (isIntentionalRenderException(finding)) {
      intentionalExceptions.push({ ...finding, reason: "Known non-player-facing literal in legacy page metadata" });
    } else {
      hardcodedPlayerFacing.push(finding);
    }
  }

  const metadataFiles = ["index.html", "site.webmanifest"]
    .concat(["Aincrad/Bestiary/bestiary.html", "Aincrad/Commands/commands.html", "Aincrad/eCompendium/ecompendium.html", "Aincrad/Map/maps.html", "Aincrad/Misc Info/miscinfo.html", "Aincrad/Patchnotes/patchnotes.html", "Aincrad/Quests/quests.html", "Fractured Underworld/Main UI/mainui.html", "Fractured Underworld/Tower Defense/towerdefense.html"])
    .filter(relativePath => fs.existsSync(path.join(root, relativePath)));

  const localeBundles = { en: english, es: flattenTranslations(translations.es), fr: flattenTranslations(translations.fr) };
  const invalidReferencedUiKeys = [...referencedUiKeys].sort().flatMap(key => {
    if (key.startsWith("page.") && key.split(".").length < 3) return [];
    const missingLanguages = Object.entries(localeBundles)
      .filter(([, bundle]) => typeof bundle[key] !== "string" || bundle[key].trim() === "")
      .map(([language]) => language);
    return missingLanguages.length ? [{ key, missingLanguages }] : [];
  });

  return {
    englishKeys: Object.keys(english).length,
    referencedUiKeys: referencedUiKeys.size,
    invalidReferencedUiKeys,
    localeAudit,
    hardcodedPlayerFacing,
    intentionalExceptions,
    genuineHardcodedPlayerFacing: hardcodedPlayerFacing.filter(entry => !isIntentionalRenderException(entry)),
    metadataFiles,
    metadataPolicy: "Static SEO and manifest metadata are intentionally excluded from runtime locale completeness checks."
  };
}

const dataContext = { window: {}, console };
dataContext.window = dataContext;

for (const floor of [1, 2, 3]) {
  loadScript(`Aincrad/eCompendium/ecompendium_floor${floor}.js`, dataContext);
  const dataset = dataContext[`FLOOR_${floor}_DATA`] || {};
  for (const entries of Object.values(dataset)) {
    for (const entry of Array.isArray(entries) ? entries : []) {
      const id = entry.id || slug(entry.name);
      add(`equipment.${id}.name`, entry.name);
      registry.registerEquipmentEntry?.(entry, slug);
      for (const field of ["description", "craftingLocation", "craftingNote"]) {
        if (entry[field]) add(`equipment.${id}.${field}`, entry[field]);
      }
      for (const resource of entry.craftingResources || []) {
        add(`equipment.${id}.resource.${slug(resource.item)}`, resource.item);
      }
      for (const stat of Object.keys(entry.stats || {})) {
        add(`equipment.${id}.stat.${slug(stat)}`, stat);
      }
    }
  }
}

for (const floor of [1, 2, 3]) {
  loadScript(`Aincrad/Quests/quests_floor${floor}.js`, dataContext);
  const entries = dataContext.QUEST_ENTRIES_BY_FLOOR?.[`floor${floor}`] || [];
  for (const entry of entries) {
    const id = entry.id || slug([entry.npcName, entry.city, entry.coordinates, entry.questName].join("-"));
    for (const field of ["npcName", "city", "requirements", "questName", "bonusItems"]) {
      if (entry[field]) add(`quest.${id}.${field}`, entry[field]);
    }
    registry.registerQuestEntry?.(entry, slug);
  }
}

for (const floor of [1, 2, 3]) {
  if (floor === 1) loadScript("Aincrad/Map/mapData.js", dataContext);
  loadScript(`Aincrad/Map/maps_floor${floor}.js`, dataContext);
}
const mapEntries = vm.runInNewContext("Object.entries(DATA)", dataContext);
for (const [id, marker] of mapEntries) {
  add(`map.${id}.title`, marker.title);
  if (marker.type) add(`map.${id}.type`, marker.type);
  if (marker.description) add(`map.${id}.description`, marker.description);
  registry.registerMapMarker?.(id, marker);
}
const mobAreas = vm.runInNewContext("MOB_AREAS", dataContext);
for (const area of mobAreas || []) {
  add(`map.mob-area.${area.id}.title`, area.title);
  const key = `map.mob-area.${area.id}.title`;
  registry.register(key, area.title, registry.es[key] || registry.translateKnownTerms(area.title, "es"), registry.fr[key] || registry.translateKnownTerms(area.title, "fr"));
}

const bestiaryNames = new Set();
const bestiaryDrops = new Set();
for (const floor of [1, 2, 3]) {
  const text = read(`Aincrad/Bestiary/bestiary_floor${floor}.js`);
  for (const line of text.split(/\r?\n/)) {
    const match = line.match(/^([^\t]+)\t([^\t]+)\t/);
    if (!match) continue;
    bestiaryNames.add(match[1].trim());
    for (const rawDrop of match[2].split(",")) {
      const drop = rawDrop.replace(/\([^)]*\)/g, "").replace(/\d+(?:\.\d+)?%/g, "").trim();
      if (drop) bestiaryDrops.add(drop);
    }
  }
}
for (const name of bestiaryNames) add(`bestiary.mob.${slug(name)}`, name);
for (const drop of bestiaryDrops) add(`bestiary.item.${slug(drop)}`, drop);
for (const name of bestiaryNames) {
  const key = `bestiary.mob.${slug(name)}`;
  registry.register(key, name, registry.es[key] || name, registry.fr[key] || name);
}
for (const drop of bestiaryDrops) {
  const key = `bestiary.item.${slug(drop)}`;
  registry.register(key, drop, registry.es[key] || registry.translateKnownTerms(drop, "es"), registry.fr[key] || registry.translateKnownTerms(drop, "fr"));
}

const verifiedSourceCorrections = {
  "Nymbr├⌐a": ["Nymbréa", "Nymbréa"],
  "Baobab Mill├⌐naire": ["Baobab milenario", "Baobab millénaire"],
  "Sanctuary of Khes├╗n": ["Santuario de Khesûn", "Sanctuaire de Khesûn"]
};
for (const [english, [spanish, french]] of Object.entries(verifiedSourceCorrections)) {
  for (const key of Object.keys(registry.en)) {
    const source = String(registry.en[key]);
    const matchesCorruptedSource = english.startsWith("Nymbr") ? source.startsWith("Nymbr") : english.startsWith("Baobab") ? source.startsWith("Baobab Mill") : source.startsWith("Sanctuary of Khes");
    if (registry.en[key] === english || matchesCorruptedSource) registry.register(key, english, spanish, french);
  }
}

const englishKeys = new Set(Object.keys(registry.en));
const duplicateKeys = [];
const allLanguages = ["en", "es", "fr"];
for (const language of allLanguages) {
  const keys = Object.keys(registry[language]);
  const seen = new Set();
  for (const key of keys) {
    if (seen.has(key)) duplicateKeys.push(`${language}:${key}`);
    seen.add(key);
  }
}

function reportLanguage(language) {
  const keys = new Set(Object.keys(registry[language]));
  const explicitKeys = registry.explicitCounterparts?.[language] || new Set();
  const translatedValues = [...englishKeys].filter(key => keys.has(key) && registry[language][key] !== registry.en[key]).length;
  const unchangedValues = [...englishKeys].filter(key => keys.has(key) && registry[language][key] === registry.en[key]).length;
  return {
    count: keys.size,
    missingRegistryKeys: [...englishKeys].filter(key => !keys.has(key)),
    missingExplicitCounterparts: [...englishKeys].filter(key => !explicitKeys.has(key)),
    missingDatasetKeys: [...required].filter(key => !keys.has(key) && !intentionallyEnglish.has(key)),
    emptyRegistryKeys: [...englishKeys].filter(key => keys.has(key) && String(registry[language][key] ?? "").trim() === ""),
    emptyDatasetKeys: [...required].filter(key => keys.has(key) && String(registry[language][key] ?? "").trim() === ""),
    placeholderRegistryKeys: [...englishKeys].filter(key => keys.has(key) && isPlaceholderCopy(registry[language][key])),
    placeholderDatasetKeys: [...required].filter(key => keys.has(key) && isPlaceholderCopy(registry[language][key])),
    intentionalEnglish: [...intentionallyEnglish].filter(key => !keys.has(key)),
    translatedValues,
    unchangedValues,
    explicitCounterparts: [...englishKeys].filter(key => explicitKeys.has(key)).length,
    coveragePercentage: Number(((translatedValues / englishKeys.size) * 100).toFixed(2))
  };
}

const report = {
  englishRegistryKeys: englishKeys.size,
  spanishRegistryKeys: Object.keys(registry.es).length,
  frenchRegistryKeys: Object.keys(registry.fr).length,
  requiredDatasetKeys: required.size,
  duplicateKeys,
  spanish: reportLanguage("es"),
  french: reportLanguage("fr")
};
const uiAudit = auditRuntimeUi();
const genuineUiBypasses = (uiAudit.genuineHardcodedPlayerFacing || uiAudit.hardcodedPlayerFacing || []).filter(Boolean);
if (genuineUiBypasses.length > 0) {
  console.error(JSON.stringify({ untranslatedPlayerFacing: genuineUiBypasses }, null, 2));
  process.exitCode = 1;
}

const familyReport = {};
function getFieldType(key) {
  const parts = key.split(".");
  if (key.startsWith("equipment.")) return parts[2] === "resource" ? "resource" : parts[2] === "stat" ? "stat" : parts[2] || "unknown";
  if (key.startsWith("quest.")) return parts[2] || "unknown";
  if (key.startsWith("map.")) return parts[1] === "mob-area" ? "mobAreaTitle" : parts[2] || "unknown";
  if (key.startsWith("bestiary.")) return parts[1] === "mob" ? "mobName" : "dropName";
  return parts[1] || "unknown";
}

for (const prefix of ["equipment.", "quest.", "map.", "bestiary."]) {
  const keys = [...required].filter(key => key.startsWith(prefix));
  familyReport[prefix.slice(0, -1)] = {
    required: keys.length,
    spanishMissing: keys.filter(key => !(key in registry.es)).length,
    frenchMissing: keys.filter(key => !(key in registry.fr)).length,
    spanishTranslated: keys.filter(key => registry.es[key] !== undefined && registry.es[key] !== registry.en[key]).length,
    frenchTranslated: keys.filter(key => registry.fr[key] !== undefined && registry.fr[key] !== registry.en[key]).length,
    spanishEnglishEquivalent: keys.filter(key => registry.es[key] === registry.en[key]).length,
    frenchEnglishEquivalent: keys.filter(key => registry.fr[key] === registry.en[key]).length,
    fields: Object.fromEntries([...new Set(keys.map(getFieldType))].sort().map(field => {
      const fieldKeys = keys.filter(key => getFieldType(key) === field);
      return [field, {
        total: fieldKeys.length,
        spanishTranslated: fieldKeys.filter(key => registry.es[key] !== registry.en[key]).length,
        frenchTranslated: fieldKeys.filter(key => registry.fr[key] !== registry.en[key]).length,
        spanishEnglishEquivalent: fieldKeys.filter(key => registry.es[key] === registry.en[key]).length,
        frenchEnglishEquivalent: fieldKeys.filter(key => registry.fr[key] === registry.en[key]).length
      }];
    }))
  };
}

const manualByKey = new Map(manualResolution.map(entry => [entry.key, entry]));
const manualByFieldAndEnglish = new Map(manualResolution.map(entry => [`${entry.field}\t${entry.english}`, entry]));
function getManualClassification(key) {
  const field = `${key.split(".")[0]}.${getFieldType(key)}`;
  return manualByKey.get(key) || manualByFieldAndEnglish.get(`${field}\t${String(registry.en[key])}`) ||
    manualResolution.find(entry => entry.field === field && String(entry.english) === String(registry.en[key])) ||
    manualResolution.find(entry => entry.field === field && String(entry.english).replace(/[^a-z0-9]/gi, "") === String(registry.en[key]).replace(/[^a-z0-9]/gi, ""));
}
const invalidManualEntries = manualResolution.filter(entry => {
  const validStatuses = new Set(["translated", "SAME_AS_ENGLISH", "unresolved"]);
  return (!entry.key && !entry.field) || typeof entry.english !== "string" ||
    !validStatuses.has(entry.spanishStatus) || !validStatuses.has(entry.frenchStatus) ||
    typeof entry.reason !== "string";
});
const equivalentValues = [...required]
  .filter(key => registry.es[key] === registry.en[key] || registry.fr[key] === registry.en[key])
  .sort()
  .map(key => ({
    key,
    field: `${key.split(".")[0]}.${getFieldType(key)}`,
    english: registry.en[key],
    spanish: registry.es[key],
    french: registry.fr[key],
    spanishEquivalent: registry.es[key] === registry.en[key],
    frenchEquivalent: registry.fr[key] === registry.en[key],
    manual: Boolean(getManualClassification(key)),
    spanishStatus: getManualClassification(key)?.spanishStatus || null,
    frenchStatus: getManualClassification(key)?.frenchStatus || null
  }));

const unclassifiedEquivalentValues = equivalentValues.filter(entry =>
  (entry.spanishEquivalent && !["SAME_AS_ENGLISH", "unresolved"].includes(entry.spanishStatus)) ||
  (entry.frenchEquivalent && !["SAME_AS_ENGLISH", "unresolved"].includes(entry.frenchStatus))
);
const remainingByField = {};
for (const language of ["es", "fr"]) {
  remainingByField[language] = {};
  for (const key of required) {
    if (registry.explicitCounterparts?.[language]?.has(key)) continue;
    const field = `${key.split(".")[0]}.${getFieldType(key)}`;
    remainingByField[language][field] = remainingByField[language][field] || { count: 0, samples: [] };
    remainingByField[language][field].count += 1;
    if (remainingByField[language][field].samples.length < 5) {
      remainingByField[language][field].samples.push({ key, english: registry.en[key] });
    }
  }
}

const remainingValues = {};
for (const language of ["es", "fr"]) {
  remainingValues[language] = [...required]
    .filter(key => {
      const field = `${key.split(".")[0]}.${getFieldType(key)}`;
      const classification = getManualClassification(key);
      return registry[language][key] === registry.en[key] && !classification?.[language === "es" ? "spanishStatus" : "frenchStatus"];
    })
    .sort()
    .map(key => ({ key, field: `${key.split(".")[0]}.${getFieldType(key)}`, english: registry.en[key], manual: Boolean(getManualClassification(key)) }));
}

function expandManualEntry(entry) {
  return {
  ...entry,
  spanish: registry.es[entry.key] || entry.spanish || equivalentValues.find(value => value.field === entry.field && value.english === entry.english)?.spanish || null,
  french: registry.fr[entry.key] || entry.french || equivalentValues.find(value => value.field === entry.field && value.english === entry.english)?.french || null,
  needs: ["es", "fr"].filter(language => entry[language === "es" ? "spanishStatus" : "frenchStatus"] === "unresolved")
};
}

const unresolved = manualResolution.filter(entry => entry.spanishStatus === "unresolved" || entry.frenchStatus === "unresolved").map(expandManualEntry);
const sameAsEnglish = manualResolution.filter(entry => entry.spanishStatus === "SAME_AS_ENGLISH" || entry.frenchStatus === "SAME_AS_ENGLISH").map(expandManualEntry);

const uiLocaleProblems = Object.entries(uiAudit.localeAudit).flatMap(([language, locale]) => [
  ...locale.missingKeys.map(key => ({ language, key, issue: "missing-ui-key" })),
  ...locale.emptyKeys.map(key => ({ language, key, issue: "empty-ui-value" })),
  ...locale.placeholderKeys.map(entry => ({ language, ...entry, issue: "placeholder-ui-copy" })),
  ...locale.placeholderMismatches.map(entry => ({ language, ...entry, issue: "placeholder-token-mismatch" }))
]);
const datasetLocaleProblems = ["es", "fr"].flatMap(language => {
  const languageName = language === "es" ? "spanish" : "french";
  const languageReport = report[languageName];
  return [
    ...languageReport.missingRegistryKeys.map(key => ({ language, key, issue: "missing-registry-key" })),
    ...languageReport.missingExplicitCounterparts.map(key => ({ language, key, issue: "missing-explicit-counterpart" })),
    ...languageReport.missingDatasetKeys.map(key => ({ language, key, issue: "missing-dataset-key" })),
    ...languageReport.emptyRegistryKeys.map(key => ({ language, key, issue: "empty-registry-value" })),
    ...languageReport.emptyDatasetKeys.map(key => ({ language, key, issue: "empty-dataset-value" })),
    ...languageReport.placeholderRegistryKeys.map(key => ({ language, key, issue: "placeholder-registry-value" })),
    ...languageReport.placeholderDatasetKeys.map(key => ({ language, key, issue: "placeholder-dataset-value" }))
  ];
});
const localeQualityIssues = {
  ui: uiLocaleProblems,
  dataset: datasetLocaleProblems,
  invalidReferencedUiKeys: uiAudit.invalidReferencedUiKeys,
  hardcodedPlayerFacing: genuineUiBypasses,
  unclassifiedEquivalentValues,
  unresolved,
  duplicateKeys,
  invalidManualEntries
};
if (uiLocaleProblems.length || datasetLocaleProblems.length || uiAudit.invalidReferencedUiKeys.length ||
    genuineUiBypasses.length || unclassifiedEquivalentValues.length || unresolved.length ||
    duplicateKeys.length || invalidManualEntries.length) {
  console.error(JSON.stringify({ localeQualityIssues }, null, 2));
  process.exitCode = 1;
}

const reportWithManual = {
  ...report,
  manualResolutionEntries: unresolved.length,
  sameAsEnglishEntries: sameAsEnglish.length,
  invalidManualEntries
};

if (process.argv.includes("--remaining")) {
  console.log(JSON.stringify({ remainingValues, equivalentValues, unclassifiedEquivalentValues, unresolved, sameAsEnglish, invalidManualEntries, familyReport, uiAudit }, null, 2));
} else if (process.argv.includes("--verbose")) {
  console.log(JSON.stringify({ ...reportWithManual, uiAudit }, null, 2));
} else {
  for (const language of ["spanish", "french"]) {
    const result = report[language];
    console.log(`${language} registry keys: ${result.count}`);
    console.log(`${language} missing registry keys: ${result.missingRegistryKeys.length}`);
    console.log(`${language} missing dataset keys: ${result.missingDatasetKeys.length}`);
    console.log(`${language} translated values: ${result.translatedValues}`);
    console.log(`${language} unchanged English values: ${result.unchangedValues}`);
    console.log(`${language} coverage: ${result.coveragePercentage}%`);
    console.log(`${language} missing dataset sample: ${result.missingDatasetKeys.slice(0, 10).join(", ") || "none"}`);
  }
  console.log(`English registry keys: ${report.englishRegistryKeys}`);
  console.log(`Required dataset keys: ${report.requiredDatasetKeys}`);
  console.log(`Duplicate keys: ${report.duplicateKeys.length}`);
  console.log(`Families: ${JSON.stringify(familyReport)}`);
  console.log(`Remaining by field: ${JSON.stringify(remainingByField)}`);
}
