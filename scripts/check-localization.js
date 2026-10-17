const fs = require("fs");
const path = require("path");
const vm = require("vm");
const { readFile, loadScript } = require("./harness-helpers");
const {
  classificationReportKey,
  classificationStatus,
  contentLanguages,
  sourceLanguage,
  translationBacklogLanguages,
  uiLanguages
} = require("./localization-languages");

const root = path.resolve(__dirname, "..");
const registryContext = { window: {}, console };
vm.runInNewContext(fs.readFileSync(path.join(root, "shared", "sao-content-translations.js"), "utf8"), registryContext);
const registry = registryContext.window.SAOContentTranslations;

/* ------------------------------------------------------------------------------------------------
   Languages.

   The audit works from two lists read out of the shared modules (see scripts/localization-languages.js):

     - SOURCE_LANGUAGE / UI_LANGUAGES: the language the source text is written in, and every language
       the site offers. The UI dictionary audit covers all of UI_LANGUAGES.
     - CONTENT_LANGUAGES: the languages the content-translation registry has positional [spanish,
       french] slots for. The dataset audit covers these; the source language is the text being
       compared against, not a slot.

   Neither list is restated below, so registering a language in the shared configuration is all the
   audit needs to pick it up. `reportKey` keeps the JSON report's established Spanish/French keys; a
   language without a report key reports under its own language code.
   ------------------------------------------------------------------------------------------------ */
const SOURCE_LANGUAGE = sourceLanguage();
const UI_LANGUAGES = uiLanguages();
const CONTENT_LANGUAGES = contentLanguages();
const reportKey = classificationReportKey;
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
  return groups.flatMap((group) =>
    (group.values || []).map((english) => ({
      ...group,
      english,
      values: undefined
    }))
  );
}
const manualResolution = [...expandManualGroups(manualResolutionSource), ...expandManualGroups(sameAsEnglishSource)];
const required = new Set();
const intentionallyEnglish = new Set();

function slug(value) {
  return (
    String(value || "unknown")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "unknown"
  );
}

function add(key, english, options = {}) {
  required.add(key);
  if (options.intentionalEnglish) intentionallyEnglish.add(key);
  return english;
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
  let source = readFile("shared/sao-i18n.js");
  source = source.replace("})(window);", "window.__SAOTranslations = translations;})(window);");
  const context = {
    window: {},
    console,
    document: { addEventListener() {} },
    localStorage: {
      getItem() {
        return null;
      },
      setItem() {}
    }
  };
  vm.runInNewContext(source, context, { filename: "shared/sao-i18n.js" });
  return context.window.__SAOTranslations || {};
}

function placeholderTokens(value) {
  return [...String(value || "").matchAll(/\{[a-zA-Z0-9_]+\}/g)].map((match) => match[0]).sort();
}

function isTechnicalLiteral(rawValue) {
  const value = String(rawValue || "").trim();
  if (!value) return true;
  if (
    /^(?:https?:\/\/|\/|#|[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}|[A-Za-z0-9._-]+\/[A-Za-z0-9._/-]+|[A-Za-z0-9._-]+(?:\.[A-Za-z0-9._-]+)+)$/.test(
      value
    )
  )
    return true;
  if (/^(?:[XxZz]:\s*--|[XxZz]:\s*[-\d.]+\s+[XxZz]:\s*[-\d.]+|X:\s*\$\{.*\}\s+Z:\s*\$\{.*\})$/.test(value)) return true;
  if (/^\d+(?:\.\d+)?(?:%|x)?$/.test(value)) return true;
  if (/^[A-Za-z0-9_./:-]+$/.test(value) && value.length <= 4 && !/[a-z]/.test(value)) return true;
  return false;
}

function isLikelyHardcodedUiText(value) {
  const cleaned = String(value || "").trim();
  if (!cleaned || isTechnicalLiteral(cleaned)) return false;
  return (
    /[A-Za-z]/.test(cleaned) &&
    !cleaned.includes("t(") &&
    !cleaned.includes("content(") &&
    !cleaned.includes("localize") &&
    !cleaned.includes("translate")
  );
}

function isPlaceholderCopy(value) {
  return /\b(?:current data example|replace this(?: placeholder)?|example stat|placeholder preview|visual placeholders)\b/i.test(
    String(value || "")
  );
}

function isIntentionalRenderException(entry) {
  const value = String(entry.value || "").trim();
  if (!value) return true;
  if (["x", "×", "&times;"].includes(value)) return true;
  if (/^\/\s*\$\{[^}]+\}$/.test(value)) return true;
  if (/<\/?[a-z][\s\S]*>/i.test(value)) return true;
  if (
    /(?:viewBox|stroke-width|fill=|path d=|cx=|cy=|r=|aria-hidden|focusable|class=|position:\s*fixed|display:\s*grid|background:\s*rgba?\()/i.test(
      value
    )
  )
    return true;
  if (
    /(?:Open links|Close links menu|Primary|Section navigation|Gamemode selector|Language settings hint|Choose Data Version|Close dataset selection)/i.test(
      value
    )
  )
    return true;
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
      if (
        !normalized ||
        normalized.includes("t(") ||
        normalized.includes("content(") ||
        normalized.includes("localize") ||
        normalized.includes("translate") ||
        normalized.includes("window.SAOI18n") ||
        normalized.includes("getAreaText")
      )
        continue;
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
  for (const language of UI_LANGUAGES) {
    const localized = flattenTranslations(translations[language]);
    const missingKeys =
      language === SOURCE_LANGUAGE ? [] : Object.keys(english).filter((key) => localized[key] === undefined);
    const englishFallbackKeys = missingKeys.map((key) => ({ key, english: english[key] }));
    const placeholderMismatches =
      language === SOURCE_LANGUAGE
        ? []
        : Object.keys(english)
            .filter(
              (key) =>
                localized[key] !== undefined &&
                JSON.stringify(placeholderTokens(english[key])) !== JSON.stringify(placeholderTokens(localized[key]))
            )
            .map((key) => ({ key, english: english[key], localized: localized[key] }));
    localeAudit[language] = {
      missingKeys,
      englishFallbackKeys,
      emptyKeys: Object.keys(english).filter(
        (key) => typeof localized[key] !== "string" || localized[key].trim() === ""
      ),
      placeholderKeys: Object.keys(english)
        .filter((key) => isPlaceholderCopy(localized[key]))
        .map((key) => ({ key, value: localized[key] })),
      unchangedKeys: Object.keys(english).filter(
        (key) => localized[key] !== undefined && localized[key] === english[key]
      ),
      placeholderMismatches
    };
  }

  const hardcodedPlayerFacing = [];
  const intentionalExceptions = [];
  const htmlFiles = [];
  const scriptFiles = [];
  const referencedUiKeys = new Set();
  const uiKeyPattern = /["'`]((?:ui|page|dataset)\.[A-Za-z0-9_.-]+)["'`]/g;
  const recordUiKeyReferences = (source) => {
    for (const match of source.matchAll(uiKeyPattern)) referencedUiKeys.add(match[1]);
  };
  function collectHtmlFiles(directory) {
    fs.readdirSync(directory, { withFileTypes: true }).forEach((entry) => {
      if ([".git", ".venv", "node_modules"].includes(entry.name)) return;
      const fullPath = path.join(directory, entry.name);
      if (entry.isDirectory()) return collectHtmlFiles(fullPath);
      if (entry.isFile() && entry.name.endsWith(".html")) htmlFiles.push(fullPath);
    });
  }
  function collectScriptFiles(directory) {
    fs.readdirSync(directory, { withFileTypes: true }).forEach((entry) => {
      if ([".git", ".venv", "node_modules"].includes(entry.name)) return;
      const fullPath = path.join(directory, entry.name);
      if (entry.isDirectory()) return collectScriptFiles(fullPath);
      if (entry.isFile() && entry.name.endsWith(".js")) scriptFiles.push(fullPath);
    });
  }
  collectHtmlFiles(root);
  collectScriptFiles(root);
  scriptFiles.forEach((filePath) => {
    const relativePath = path.relative(root, filePath).replace(/\\/g, "/");
    if (relativePath.startsWith("node_modules/")) return;
    const source = fs.readFileSync(filePath, "utf8");
    if (!relativePath.startsWith("scripts/") && !relativePath.startsWith("tmp_")) recordUiKeyReferences(source);
    const findings = scanJavaScriptRenderPaths(relativePath, source);
    findings.forEach((finding) => {
      if (isIntentionalRenderException(finding)) {
        intentionalExceptions.push({ ...finding, reason: "Known non-player-facing markup or utility value" });
        return;
      }
      hardcodedPlayerFacing.push(finding);
    });
  });
  htmlFiles.forEach((filePath) => {
    const relativePath = path.relative(root, filePath).replace(/\\/g, "/");
    const html = fs.readFileSync(filePath, "utf8");
    recordUiKeyReferences(html);
    for (const tagMatch of html.matchAll(/<[^>]+>/g)) {
      const tag = tagMatch[0];
      const line = html.slice(0, tagMatch.index).split(/\r?\n/).length;
      ["aria-label", "alt", "data-label", "data-title", "data-tooltip", "placeholder", "title", "value"].forEach(
        (attribute) => {
          const valueMatch = tag.match(new RegExp(`\\b${attribute}="([^"]+)"`));
          const translationAttribute = attribute.startsWith("data-")
            ? `data-i18n-${attribute.slice(5)}`
            : `data-i18n-${attribute}`;
          if (!valueMatch || tag.includes(translationAttribute) || (attribute === "title" && tag.includes("data-i18n")))
            return;
          if (
            attribute === "value" &&
            !/<button\b/i.test(tag) &&
            !/<input\b[^>]*\btype=["'](?:button|submit|reset)["']/i.test(tag)
          )
            return;
          const finding = { file: relativePath, line, value: valueMatch[1], kind: attribute };
          if (isIntentionalRenderException(finding)) {
            intentionalExceptions.push({ ...finding, reason: "Known non-player-facing fallback attribute" });
            return;
          }
          hardcodedPlayerFacing.push(finding);
        }
      );
    }
    for (const textMatch of html.matchAll(/>([^<\r\n]{3,})</g)) {
      const value = textMatch[1].trim();
      /* The first-visit language hint sentences now live in the dictionaries and are rendered by the
         hub from the shared language configuration, so the only text-node exception left here is the
         shared close glyph the pickers render. */
      if (!value || value === "&times;") continue;
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
  const mapHtml = readFile("Aincrad/Map/maps.html");
  const sidebarPattern = /<(?:div|button)[^>]*(?:sidebar-section-title|sidebar-list-button)[^>]*>([^<]+)</g;
  let match;
  while ((match = sidebarPattern.exec(mapHtml))) {
    /* The opening tag can span several lines once the HTML is formatted, so test the matched
       element itself for its i18n binding instead of only the match's first source line. */
    if (!match[0].includes("data-i18n"))
      hardcodedPlayerFacing.push({ file: "Aincrad/Map/maps.html", value: match[1].trim(), kind: "sidebar-label" });
  }
  for (const tagMatch of mapHtml.matchAll(/<[^>]+>/g)) {
    if (!/\baria-label="[^"]+"/.test(tagMatch[0]) || /\bdata-i18n-aria-label="[^"]+"/.test(tagMatch[0])) continue;
    const ariaLabel = tagMatch[0].match(/\baria-label="([^"]+)"/);
    if (ariaLabel)
      hardcodedPlayerFacing.push({ file: "Aincrad/Map/maps.html", value: ariaLabel[1], kind: "accessibility-label" });
  }
  if (readFile("Aincrad/Quests/quests.js").includes("No quest entries to display.")) {
    const finding = {
      file: "Aincrad/Quests/quests.js",
      value: "No quest entries to display.",
      kind: "javascript-string"
    };
    if (isIntentionalRenderException(finding)) {
      intentionalExceptions.push({ ...finding, reason: "Known non-player-facing literal in legacy page metadata" });
    } else {
      hardcodedPlayerFacing.push(finding);
    }
  }

  const metadataFiles = ["index.html", "site.webmanifest"]
    .concat([
      "Aincrad/Bestiary/bestiary.html",
      "Aincrad/Commands/commands.html",
      "Aincrad/eCompendium/ecompendium.html",
      "Aincrad/Map/maps.html",
      "Aincrad/Misc Info/miscinfo.html",
      "Aincrad/Patchnotes/patchnotes.html",
      "Aincrad/Quests/quests.html",
      "Fractured Underworld/Main UI/mainui.html",
      "Fractured Underworld/Tower Defense/towerdefense.html"
    ])
    .filter((relativePath) => fs.existsSync(path.join(root, relativePath)));

  const localeBundles = {
    en: english,
    es: flattenTranslations(translations.es),
    fr: flattenTranslations(translations.fr)
  };
  const invalidReferencedUiKeys = [...referencedUiKeys].sort().flatMap((key) => {
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
    genuineHardcodedPlayerFacing: hardcodedPlayerFacing.filter((entry) => !isIntentionalRenderException(entry)),
    metadataFiles,
    metadataPolicy:
      "Static SEO and manifest metadata are intentionally excluded from runtime locale completeness checks."
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
/* Mob-area titles live in the same map namespace, as `<namespace>.mob-area.<id>.title`.
   Registered through the shared helper so the checker measures the same value the map page
   actually renders (the helper consults the curated dictionaries first). */
const mobAreas = vm.runInNewContext("MOB_AREAS", dataContext);
for (const area of mobAreas || []) {
  add(`map.mob-area.${area.id}.title`, area.title);
  registry.registerMapMobArea?.(area);
}

const bestiaryNames = new Set();
const bestiaryDrops = new Set();
for (const floor of [1, 2, 3]) {
  const text = readFile(`Aincrad/Bestiary/bestiary_floor${floor}.js`);
  for (const line of text.split(/\r?\n/)) {
    const match = line.match(/^([^\t]+)\t([^\t]+)\t/);
    if (!match) continue;
    bestiaryNames.add(match[1].trim());
    for (const rawDrop of match[2].split(",")) {
      const drop = rawDrop
        .replace(/\([^)]*\)/g, "")
        .replace(/\d+(?:\.\d+)?%/g, "")
        .trim();
      if (drop) bestiaryDrops.add(drop);
    }
  }
}
for (const name of bestiaryNames) add(`bestiary.mob.${slug(name)}`, name);
for (const drop of bestiaryDrops) add(`bestiary.item.${slug(drop)}`, drop);
for (const name of bestiaryNames) {
  const key = `bestiary.mob.${slug(name)}`;
  /* The Bestiary page registers every language the registry has a slot for through the shared
     adapter, so the audit mirrors that rather than naming Spanish and French. */
  registry.register(
    key,
    name,
    registry.translationsByLanguage((language) => registry[language][key] || name)
  );
}
for (const drop of bestiaryDrops) {
  const key = `bestiary.item.${slug(drop)}`;
  registry.register(
    key,
    drop,
    registry.translationsByLanguage(
      (language) => registry[language][key] || registry.translateKnownTerms(drop, language)
    )
  );
}

/* ---------------------------------------------------------------------------------------------
   Player-facing families the checker did not load before. Every block mirrors the runtime: the
   same fields the page passes to content()/t(), under the same key shape, with the same
   effective value (legacy UI keys are used as the value when the page uses them as a fallback).
   Keys whose value is pure syntax or machine data are registered as language-neutral so they are
   never reported as missing translations.
   --------------------------------------------------------------------------------------------- */
const languageNeutralKeys = new Set();

function addNeutral(key, english, options = {}) {
  languageNeutralKeys.add(key);
  return add(key, english, options);
}

/* Extracts a `const name = [...]` / `const name = {...}` literal from page source without
   executing the rest of the browser script. */
function literalSlice(source, opener) {
  const marker = source.indexOf(opener);
  if (marker < 0) return null;
  const start = marker + opener.length - 1; /* slice from the opening bracket itself */
  let depth = 0;
  let inString = null;
  for (let index = start; index < source.length; index++) {
    const character = source[index];
    if (inString) {
      if (character === "\\") {
        index += 1;
        continue;
      }
      if (character === inString) inString = null;
      continue;
    }
    if (character === '"' || character === "'" || character === "`") {
      inString = character;
      continue;
    }
    if (character === "[" || character === "{") depth += 1;
    else if (character === "]" || character === "}") {
      depth -= 1;
      if (depth === 0) return source.slice(start, index + 1);
    }
  }
  return null;
}

function loadLiteral(source, opener, label) {
  const text = literalSlice(source, opener);
  if (!text) {
    console.warn(`localization check: could not locate ${label}`);
    return null;
  }
  return vm.runInNewContext(`(${text})`, { console, Object, Array, JSON, String, Number, RegExp, Math, Date });
}

function loadDataScript(relativePath, globalName, prerequisites = []) {
  const context = {
    window: {},
    console,
    Object,
    Array,
    Map,
    Set,
    JSON,
    Math,
    String,
    Number,
    Boolean,
    RegExp,
    Date,
    Error
  };
  context.window = context;
  context.globalThis = context;
  for (const prerequisite of prerequisites)
    vm.runInNewContext(readFile(prerequisite), context, { filename: prerequisite });
  vm.runInNewContext(readFile(relativePath), context, { filename: relativePath });
  return context.window[globalName] !== undefined ? context.window[globalName] : context[globalName];
}

/* commands: /token syntax stays untranslated, the usage/example prose must be localized. */
/* A command example is language-neutral only while it is bare syntax (`/mail`,
   `/ah auction 5 (Price) 1 (Amount)`). As soon as it carries an explanatory sentence in
   parentheses it is player-facing prose and must be localized like any other copy. */
function commandExampleCarriesProse(value) {
  const text = String(value || "");
  return [...text.matchAll(/\(([^()]*)\)/g)]
    .map((match) => match[1].trim())
    .some((explanation) => explanation.split(/\s+/).filter(Boolean).length >= 2);
}

const commandEntries =
  loadLiteral(readFile("Aincrad/Commands/commands.js"), "const commandEntries = [", "command entries") || [];
for (const entry of commandEntries) {
  const id = entry.id || slug(entry.command);
  if (entry.command) addNeutral(`command.${id}.command`, entry.command);
  if (entry.usage) add(`command.${id}.usage`, entry.usage);
  if (entry.example) {
    if (commandExampleCarriesProse(entry.example)) add(`command.${id}.example`, entry.example);
    else addNeutral(`command.${id}.example`, entry.example);
  }
  registry.registerCommandEntry?.(entry, id);
}

/* tower defense: shop-item values resolve through the legacy page.towerdefense UI keys, so the
   checker uses those translations as the effective localized value. */
const towerDefenseSource = readFile("Fractured Underworld/Tower Defense/towerdefense.js");
const towerDefenseItems = loadLiteral(towerDefenseSource, "const shopItems = [", "tower defense shop items") || [];
const towerDefenseLegacyIds = loadLiteral(towerDefenseSource, "const legacyIds = {", "tower defense legacy ids") || {};
const uiBundleCache = {};
function uiBundle(language) {
  if (!uiBundleCache[language]) uiBundleCache[language] = flattenTranslations(loadUiTranslations()[language] || {});
  return uiBundleCache[language];
}
for (const item of towerDefenseItems) {
  const id = item.id || towerDefenseLegacyIds[item.name] || slug(item.name);
  const registerField = (field, english, legacyField = field) => {
    if (!english) return;
    const key = `towerDefense.${id}.${field}`;
    add(key, english);
    /* The legacy UI key exists per language, so the effective localized value is resolved per
       language and registered through the language-keyed form instead of naming Spanish and French. */
    const translations = {};
    for (const language of CONTENT_LANGUAGES) {
      const legacy = uiBundle(language)[`page.towerdefense.shopItems.${id}.${legacyField}`];
      translations[language] = registry[language][key] || legacy || english;
    }
    registry.register(key, english, translations);
  };
  for (const field of ["name", "unlockRequirement", "invocationCost", "levelOne"]) registerField(field, item[field]);
  registerField("universalUpgradeCosts", item.universalUpgradeCosts, "upgradeCosts");
  (item.progression || []).forEach((step, index) => {
    /* the page resolves progression steps through word-keyed legacy UI entries */
    const legacyField = `progression.${["one", "two", "three", "four"][index] || index}`;
    registerField(`progression.${index}`, step, legacyField);
  });
}

/* underworld compendium: currently an empty dataset, so the block registers whatever the shipped
   data contains and reports UW category UI keys that have no localized counterpart. */
const underworldCompendium =
  loadDataScript("Fractured Underworld/Compendium/compendium_current.js", "SAO_CURRENT_FU_COMPENDIUM_DATA") || [];
const missingUnderworldCategoryKeys = [];
for (const entry of underworldCompendium) {
  if (!entry) continue;
  const id = entry.id || slug(entry.name);
  for (const field of ["name", "category", "description", "details"]) {
    if (entry[field]) add(`uwcompendium.${id}.${field}`, entry[field]);
  }
  if (entry.category) {
    const camel = slug(entry.category).replace(/-([a-z])/g, (_match, character) => character.toUpperCase());
    const categoryKey = `page.uwcompendium.categories.${camel}`;
    for (const language of UI_LANGUAGES) {
      if (typeof uiBundle(language)[categoryKey] !== "string")
        missingUnderworldCategoryKeys.push({ language, key: categoryKey, category: entry.category });
    }
  }
}

/* character build prototype nodes. */
const characterBuildTrees =
  loadDataScript("Aincrad/Character Build/character-build-data.js", "prototypeSkillTrees", [
    "Aincrad/Character Build/character-build-icons.js"
  ]) || {};
for (const [classId, nodes] of Object.entries(characterBuildTrees)) {
  for (const node of Array.isArray(nodes) ? nodes : []) {
    if (!node || !node.id) continue;
    if (node.name) add(`characterBuild.skill.${node.id}.name`, node.name);
    add(`characterBuild.skill.${node.id}.description`, `Prototype ${node.branch} node for ${classId}.`);
    registry.registerCharacterBuildNode?.(node, classId, node.branch);
  }
}

/* patch notes: every shipped entry needs a localized version/title/summary in the UI bundle. */
const patchNotes =
  loadLiteral(readFile("Aincrad/Patchnotes/patchnotes.js"), "const PATCH_NOTES = [", "patch notes") || [];
const patchnoteIds = new Set();
for (const language of UI_LANGUAGES) {
  for (const key of Object.keys(uiBundle(language))) {
    const match = key.match(/^page\.patchnotes\.entries\.([^.]+)\./);
    if (match) patchnoteIds.add(match[1]);
  }
}
const missingPatchnoteKeys = [];
for (const note of patchNotes) {
  const token = String(note.version || "").match(/v\d+(?:\.\d+)?(?:\.\d+)?/i);
  if (!token) continue;
  const id = [...patchnoteIds].find((candidate) =>
    String(uiBundle("en")[`page.patchnotes.entries.${candidate}.version`] || "")
      .toLowerCase()
      .includes(token[0].toLowerCase())
  );
  if (!id) {
    missingPatchnoteKeys.push({
      version: note.version,
      field: "version",
      reason: "no page.patchnotes.entries.<id>.version key matches this entry"
    });
    continue;
  }
  for (const field of ["version", "title", "summary"]) {
    for (const language of CONTENT_LANGUAGES) {
      if (typeof uiBundle(language)[`page.patchnotes.entries.${id}.${field}`] !== "string") {
        missingPatchnoteKeys.push({ id, language, field, version: note.version });
      }
    }
  }
}

/* page.* keys passed to content() must exist in the UI bundle or the content registry, otherwise
   the localized value is unreachable and the raw English literal is rendered instead. */
const unresolvedPageContentKeys = [];
{
  const pageContentKeyPattern = /content\(\s*["'`](page\.[A-Za-z0-9_.]+)["'`]/g;
  const seen = new Map();
  for (const relativePath of [
    "Aincrad/Misc Info/miscinfo.js",
    "Aincrad/Bestiary/bestiary.js",
    "Aincrad/eCompendium/ecompendium.js"
  ]) {
    const source = readFile(relativePath);
    for (const match of source.matchAll(pageContentKeyPattern)) seen.set(match[1], relativePath);
  }
  for (const [key, relativePath] of seen) {
    /* The content registry only holds the source language and the content languages, so a UI language
       without a content slot is resolved from its own dictionary alone - its game content falls back
       to the English source text by design (shared/sao-content-translations.js). */
    const missing = UI_LANGUAGES.filter(
      (language) =>
        typeof uiBundle(language)[key] !== "string" &&
        typeof (registry[language] || {})[key] !== "string"
    );
    if (missing.length) unresolvedPageContentKeys.push({ file: relativePath, key, missingLanguages: missing });
  }
}

/* A source string can reach the registry carrying CP437-decoded UTF-8 bytes - two box-drawing
   characters standing where the accented letter of "Nymbréa" belongs - when a dataset is written
   through the wrong code page. The table below holds the verified correct source text and its
   translations, and it is applied only to a value that still shows those bytes: a clean value is never
   rewritten, so the audit measures the shipped text as it stands instead of replacing it with the
   corrupted form. The pair is the same positional [spanish, french, italian] list every glossary uses,
   so a repaired entry is translated in every content language rather than falling back to the English
   source. */
const MOJIBAKE_CHARACTERS = /[\u2500-\u257f\u2310]/;
const printableAsciiPrefix = (value) => value.split(/[^\x20-\x7E]/)[0];
const verifiedSourceCorrections = {
  Nymbréa: ["Nymbréa", "Nymbréa", "Nymbréa"],
  "Baobab Millénaire": ["Baobab milenario", "Baobab millénaire", "Baobab millenario"],
  "Sanctuary of Khesûn": ["Santuario de Khesûn", "Sanctuaire de Khesûn", "Santuario di Khesûn"]
};
for (const [english, pair] of Object.entries(verifiedSourceCorrections)) {
  /* The corrupted spelling differs from the verified one only after the first accented character, so
     the printable prefix identifies which correction applies. */
  const prefix = printableAsciiPrefix(english);
  for (const key of Object.keys(registry.en)) {
    const source = String(registry.en[key]);
    if (source === english || !MOJIBAKE_CHARACTERS.test(source)) continue;
    if (prefix && !source.startsWith(prefix)) continue;
    registry.register(
      key,
      english,
      registry.translationsByLanguage((language) => registry.pairValue(pair, language) ?? english)
    );
  }
}

const englishKeys = new Set(Object.keys(registry.en));
const duplicateKeys = [];
for (const language of UI_LANGUAGES) {
  /* Only the languages the registry holds a dictionary for: a UI language without a content slot has
     no registry keys to check, so it contributes nothing here. */
  const keys = Object.keys(registry[language] || {});
  const seen = new Set();
  for (const key of keys) {
    if (seen.has(key)) duplicateKeys.push(`${language}:${key}`);
    seen.add(key);
  }
}

function reportLanguage(language) {
  const keys = new Set(Object.keys(registry[language]));
  const explicitKeys = registry.explicitCounterparts?.[language] || new Set();
  const translatedValues = [...englishKeys].filter(
    (key) => keys.has(key) && registry[language][key] !== registry.en[key]
  ).length;
  const unchangedValues = [...englishKeys].filter(
    (key) => keys.has(key) && registry[language][key] === registry.en[key]
  ).length;
  return {
    count: keys.size,
    missingRegistryKeys: [...englishKeys].filter((key) => !keys.has(key)),
    missingExplicitCounterparts: [...englishKeys].filter((key) => !explicitKeys.has(key)),
    missingDatasetKeys: [...required].filter(
      (key) => !keys.has(key) && !intentionallyEnglish.has(key) && !isLanguageNeutralKey(key)
    ),
    emptyRegistryKeys: [...englishKeys].filter(
      (key) => keys.has(key) && String(registry[language][key] ?? "").trim() === ""
    ),
    emptyDatasetKeys: [...required].filter(
      (key) => keys.has(key) && String(registry[language][key] ?? "").trim() === ""
    ),
    placeholderRegistryKeys: [...englishKeys].filter(
      (key) => keys.has(key) && isPlaceholderCopy(registry[language][key])
    ),
    placeholderDatasetKeys: [...required].filter((key) => keys.has(key) && isPlaceholderCopy(registry[language][key])),
    intentionalEnglish: [...intentionallyEnglish].filter((key) => !keys.has(key)),
    translatedValues,
    unchangedValues,
    explicitCounterparts: [...englishKeys].filter((key) => explicitKeys.has(key)).length,
    coveragePercentage: Number(((translatedValues / englishKeys.size) * 100).toFixed(2))
  };
}

/* The report keeps its established per-language keys (report.spanish, report.french, ...) for the
   languages that have one and uses each language's own code for any language added later, so the
   JSON other tooling reads keeps its shape while the grouping logic stays language-agnostic. */
const report = {
  englishRegistryKeys: englishKeys.size
};
for (const language of CONTENT_LANGUAGES) {
  report[`${reportKey(language)}RegistryKeys`] = Object.keys(registry[language]).length;
}
report.requiredDatasetKeys = required.size;
report.duplicateKeys = duplicateKeys;
for (const language of CONTENT_LANGUAGES) {
  report[reportKey(language)] = reportLanguage(language);
}
const uiAudit = auditRuntimeUi();
const genuineUiBypasses = (uiAudit.genuineHardcodedPlayerFacing || uiAudit.hardcodedPlayerFacing || []).filter(Boolean);
if (genuineUiBypasses.length > 0) {
  console.error(JSON.stringify({ untranslatedPlayerFacing: genuineUiBypasses }, null, 2));
  process.exitCode = 1;
}

const familyReport = {};
function getFieldType(key) {
  const parts = key.split(".");
  if (key.startsWith("equipment."))
    return parts[2] === "resource" ? "resource" : parts[2] === "stat" ? "stat" : parts[2] || "unknown";
  if (key.startsWith("quest.")) return parts[2] || "unknown";
  if (key.startsWith("map.")) return parts[1] === "mob-area" ? "mobAreaTitle" : parts[2] || "unknown";
  if (key.startsWith("bestiary.")) return parts[1] === "mob" ? "mobName" : "dropName";
  if (key.startsWith("command.")) return parts[2] || "unknown";
  if (key.startsWith("towerDefense.")) return parts[2] === "progression" ? "progression" : parts[2] || "unknown";
  if (key.startsWith("uwcompendium.")) return parts[2] || "unknown";
  if (key.startsWith("characterBuild.")) return parts.slice(1).join(".") || "unknown";
  return parts[1] || "unknown";
}

/* Language-neutral keys carry syntax or machine data (command tokens, identifiers, coordinates,
   numeric rewards). They are never expected to differ per language, so they are excluded from the
   English-equivalent and English-residue quality gates instead of being allowlisted by value.
   Command examples are registered per value: bare syntax is neutral, prose-bearing help text is
   localized copy and therefore checked. */
function isLanguageNeutralKey(key) {
  if (languageNeutralKeys.has(key)) return true;
  return /\.(?:id|slug|coordinates|coords|xpReward|colReward|command)$/.test(key);
}

/* One family entry, built by looping the content languages rather than naming Spanish and French.
   The key groups are emitted in their established order (missing, translated, English-equivalent) so
   the report's JSON keeps the same shape for the languages that already have a report key. */
const familyEntry = (keys) => {
  const entry = { required: keys.length };
  for (const language of CONTENT_LANGUAGES) {
    entry[`${reportKey(language)}Missing`] = keys.filter((key) => !(key in registry[language])).length;
  }
  for (const language of CONTENT_LANGUAGES) {
    entry[`${reportKey(language)}Translated`] = keys.filter(
      (key) => registry[language][key] !== undefined && registry[language][key] !== registry.en[key]
    ).length;
  }
  for (const language of CONTENT_LANGUAGES) {
    entry[`${reportKey(language)}EnglishEquivalent`] = keys.filter(
      (key) => registry[language][key] === registry.en[key]
    ).length;
  }
  return entry;
};

const fieldEntry = (fieldKeys) => {
  const entry = { total: fieldKeys.length };
  for (const language of CONTENT_LANGUAGES) {
    entry[`${reportKey(language)}Translated`] = fieldKeys.filter(
      (key) => registry[language][key] !== registry.en[key]
    ).length;
  }
  for (const language of CONTENT_LANGUAGES) {
    entry[`${reportKey(language)}EnglishEquivalent`] = fieldKeys.filter(
      (key) => registry[language][key] === registry.en[key]
    ).length;
  }
  return entry;
};

for (const prefix of ["equipment.", "quest.", "map.", "bestiary."]) {
  const keys = [...required].filter((key) => key.startsWith(prefix));
  const family = familyEntry(keys);
  family.fields = Object.fromEntries(
    [...new Set(keys.map(getFieldType))].sort().map((field) => [
      field,
      fieldEntry(keys.filter((key) => getFieldType(key) === field))
    ])
  );
  familyReport[prefix.slice(0, -1)] = family;
}

const manualByKey = new Map(manualResolution.map((entry) => [entry.key, entry]));
const manualByFieldAndEnglish = new Map(manualResolution.map((entry) => [`${entry.field}\t${entry.english}`, entry]));
function getManualClassification(key) {
  const field = `${key.split(".")[0]}.${getFieldType(key)}`;
  return (
    manualByKey.get(key) ||
    manualByFieldAndEnglish.get(`${field}\t${String(registry.en[key])}`) ||
    manualResolution.find((entry) => entry.field === field && String(entry.english) === String(registry.en[key])) ||
    manualResolution.find(
      (entry) =>
        entry.field === field &&
        String(entry.english).replace(/[^a-z0-9]/gi, "") === String(registry.en[key]).replace(/[^a-z0-9]/gi, "")
    )
  );
}
/* Every content language must declare a valid status for a group. A language added to the shared
   configuration without classification data is therefore reported here instead of being skipped. */
const VALID_CLASSIFICATION_STATUSES = new Set(["translated", "SAME_AS_ENGLISH", "unresolved"]);
const invalidManualEntries = manualResolution.filter((entry) => {
  return (
    (!entry.key && !entry.field) ||
    typeof entry.english !== "string" ||
    !CONTENT_LANGUAGES.every((language) =>
      VALID_CLASSIFICATION_STATUSES.has(classificationStatus(entry, language))
    ) ||
    typeof entry.reason !== "string"
  );
});
const equivalentValues = [...required]
  .filter((key) => !isLanguageNeutralKey(key))
  .filter((key) => CONTENT_LANGUAGES.some((language) => registry[language][key] === registry.en[key]))
  .sort()
  .map((key) => {
    const classification = getManualClassification(key);
    const entry = {
      key,
      field: `${key.split(".")[0]}.${getFieldType(key)}`,
      english: registry.en[key]
    };
    for (const language of CONTENT_LANGUAGES) entry[reportKey(language)] = registry[language][key];
    for (const language of CONTENT_LANGUAGES) {
      entry[`${reportKey(language)}Equivalent`] = registry[language][key] === registry.en[key];
    }
    entry.manual = Boolean(classification);
    for (const language of CONTENT_LANGUAGES) {
      entry[`${reportKey(language)}Status`] = classificationStatus(classification, language) || null;
    }
    return entry;
  });

const unclassifiedEquivalentValues = equivalentValues.filter((entry) =>
  CONTENT_LANGUAGES.some(
    (language) =>
      entry[`${reportKey(language)}Equivalent`] &&
      !["SAME_AS_ENGLISH", "unresolved"].includes(entry[`${reportKey(language)}Status`])
  )
);
const remainingByField = {};
for (const language of CONTENT_LANGUAGES) {
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
for (const language of CONTENT_LANGUAGES) {
  remainingValues[language] = [...required]
    .filter((key) => {
      const classification = getManualClassification(key);
      return registry[language][key] === registry.en[key] && !classificationStatus(classification, language);
    })
    .sort()
    .map((key) => ({
      key,
      field: `${key.split(".")[0]}.${getFieldType(key)}`,
      english: registry.en[key],
      manual: Boolean(getManualClassification(key))
    }));
}

function expandManualEntry(entry) {
  const expanded = { ...entry };
  for (const language of CONTENT_LANGUAGES) {
    const key = reportKey(language);
    expanded[key] =
      registry[language][entry.key] ||
      entry[key] ||
      equivalentValues.find((value) => value.field === entry.field && value.english === entry.english)?.[key] ||
      null;
  }
  expanded.needs = CONTENT_LANGUAGES.filter((language) => classificationStatus(entry, language) === "unresolved");
  return expanded;
}

const unresolved = manualResolution
  .filter((entry) => CONTENT_LANGUAGES.some((language) => classificationStatus(entry, language) === "unresolved"))
  .map(expandManualEntry);
const sameAsEnglish = manualResolution
  .filter((entry) =>
    CONTENT_LANGUAGES.some((language) => classificationStatus(entry, language) === "SAME_AS_ENGLISH")
  )
  .map(expandManualEntry);

const uiLocaleProblems = Object.entries(uiAudit.localeAudit).flatMap(([language, locale]) => [
  ...locale.missingKeys.map((key) => ({ language, key, issue: "missing-ui-key" })),
  ...locale.emptyKeys.map((key) => ({ language, key, issue: "empty-ui-value" })),
  ...locale.placeholderKeys.map((entry) => ({ language, ...entry, issue: "placeholder-ui-copy" })),
  ...locale.placeholderMismatches.map((entry) => ({ language, ...entry, issue: "placeholder-token-mismatch" }))
]);
const datasetLocaleProblems = CONTENT_LANGUAGES.flatMap((language) => {
  const languageReport = report[reportKey(language)];
  return [
    ...languageReport.missingRegistryKeys.map((key) => ({ language, key, issue: "missing-registry-key" })),
    ...languageReport.missingExplicitCounterparts.map((key) => ({
      language,
      key,
      issue: "missing-explicit-counterpart"
    })),
    ...languageReport.missingDatasetKeys.map((key) => ({ language, key, issue: "missing-dataset-key" })),
    ...languageReport.emptyRegistryKeys.map((key) => ({ language, key, issue: "empty-registry-value" })),
    ...languageReport.emptyDatasetKeys.map((key) => ({ language, key, issue: "empty-dataset-value" })),
    ...languageReport.placeholderRegistryKeys.map((key) => ({ language, key, issue: "placeholder-registry-value" })),
    ...languageReport.placeholderDatasetKeys.map((key) => ({ language, key, issue: "placeholder-dataset-value" }))
  ];
});
/* ---------------------------------------------------------------------------------------------
   English-residue quality gate. A localized value that merely differs from English can still be
   full of untranslated English words (the glossary substitution pads sentences word by word).
   Deliberately conservative:
     - only prose-length values (>= 16 characters) are inspected
     - bracketed [Christmas 2025] and parenthesised (2 Piece Set Bonus) run-ons are ignored
     - only a fixed list of unambiguous English function words / adjectives counts as residue
     - any token the project's own curated UI copy uses for that language is legitimate vocabulary
       (this is what keeps loanwords and proper nouns such as "waypoints" safe)
     - language-neutral keys, identical-to-English values and manual allowlist classifications are
       handled by the other gates and skipped here
   --------------------------------------------------------------------------------------------- */
const ENGLISH_RESIDUE_WORDS = new Set([
  "the",
  "and",
  "you",
  "your",
  "yours",
  "with",
  "after",
  "before",
  "while",
  "into",
  "from",
  "that",
  "this",
  "these",
  "those",
  "they",
  "them",
  "their",
  "there",
  "then",
  "than",
  "when",
  "where",
  "which",
  "who",
  "would",
  "could",
  "should",
  "will",
  "shall",
  "might",
  "must",
  "cannot",
  "are",
  "was",
  "were",
  "been",
  "has",
  "have",
  "had",
  "does",
  "did",
  "doing",
  "because",
  "during",
  "between",
  "through",
  "against",
  "someone",
  "something",
  "everything",
  "everyone",
  "nothing",
  "anything",
  "its",
  "being",
  "becomes",
  "gets",
  "gives",
  "takes",
  "starts",
  "keeps",
  "looks",
  "almost",
  "only",
  "very",
  "much",
  "many",
  "some",
  "any",
  "all",
  "used",
  "using",
  "made",
  "make",
  "found",
  "find",
  "other",
  "such",
  "same",
  "too",
  "just",
  "also",
  "how",
  "what",
  "why",
  "here",
  "thanks",
  "help",
  "built",
  "created",
  "unusable",
  "harmless",
  "still",
  "rusty",
  "blunt",
  "bloody",
  "destroyed",
  "slightly",
  "small",
  /* prepositions that only ever survive when a value was never really translated ("Arc of Amour") */
  "of",
  "in"
]);

/* English content words. Unlike the function words above these are nouns and adjectives, which the
   glossary keeps because it substitutes token by token ("Copper Ores", "Enchanted Twig",
   "Reinforced Spider Wire"). Every entry here is a word that is not Spanish or French vocabulary,
   so finding one inside a localized value proves the value was not translated. The curated-UI
   vocabulary check below still runs first, which is what keeps real loanwords and proper nouns
   (mana, biome, boss, rune, katana, ...) safe. */
const ENGLISH_RESIDUE_TERMS = new Set([
  "ore",
  "ores",
  "ingot",
  "board",
  "log",
  "twine",
  "wire",
  "powder",
  "beast",
  "plating",
  "cog",
  "pouch",
  "lantern",
  "mandible",
  "venom",
  "sepal",
  "carcass",
  "skull",
  "mittens",
  "leggings",
  "breastplate",
  "billhook",
  "sickle",
  "pickaxe",
  "hoe",
  "scythe",
  "halberd",
  "crossbow",
  "accessory",
  "accessories",
  "traveling",
  "blacksmith",
  "smithy",
  "reseller",
  "dealer",
  "manufacturer",
  "reshaper",
  "shoemaker",
  "armorsmith",
  "weaponsmith",
  "keymaker",
  "blocking",
  "mastery",
  "restored",
  "refill",
  "recoil",
  "woodland",
  "rippling",
  "stalking",
  "blazing",
  "chipped",
  "rotten",
  "wavy",
  "glutinous",
  "juvenile",
  "mysticized",
  "crystallized",
  "enchanted",
  "huntress",
  /* nouns and adjectives that survive a token-by-token pass; none of them is Spanish or French vocabulary */
  "meat",
  "crystal",
  "spider",
  "spiders",
  "bark",
  "shard",
  "horn",
  "tomb",
  "tool",
  "tools",
  "ring",
  "rings",
  "market",
  "bee",
  "bees",
  "ice",
  "country",
  "forest",
  "former",
  "guild",
  "mist",
  "peak",
  "deer",
  "icy",
  "honeyed",
  "skeletal",
  "savanna",
  "consumables",
  "labyrinth",
  "corrupt",
  "wolf",
  "wood",
  "purified",
  /* "Halloween" is a holiday name every locale keeps verbatim, "Car" is the opaque game stat suffix
     in "Requirement: Defense Car" (the rest of that label is translated), and "patience" is the same
     word in French. */
  "frozen",
  "heavy",
  "light",
  "swift",
  "sturdy",
  "vitality",
  "endurance",
  "resistance",
  "fortifier",
  "fortifying",
  "strengthening",
  "ferocity",
  "knowledge",
  "sub",
  "mother",
  "paths",
  "choice",
  "rescue",
  "trader",
  "collector",
  "gatherer",
  "smelter",
  "tanner",
  "weaver",
  "fisher"
]);

/* Families still produced by the token glossary: the curated pass has not reached them yet, so their
   English residue is reported as a tracked backlog instead of failing the build. Everything outside
   this list is a hard failure, so new residue anywhere else can never slip through. */
const BACKLOG_FAMILIES = [/^equipment\.[^.]+\.name$/, /^map\.[^.]+\.(?:title|type)$/, /^map\.mob-area\.[^.]+\.title$/];
function isBacklogKey(key) {
  return BACKLOG_FAMILIES.some((pattern) => pattern.test(key));
}

/* Command syntax is language-neutral by project rule: the `/command arguments` part of an example
   stays verbatim in every language, while the explanation around it is player-facing prose. */
function stripCommandSyntax(value) {
  return String(value || "")
    .split(/\r?\n/)
    .map((line) => line.replace(/^\s*\/[^\s()]*(?:\s+(?!\()[^()\s]+)*/g, " "))
    .join("\n");
}

function residueTokens(value, options = {}) {
  /* Command help text carries its explanation inside parentheses, so for command examples the
     neutral part to strip is the slash-command syntax rather than the parenthesised prose. */
  const source = options.commandExample ? stripCommandSyntax(value) : String(value);
  let text = source.replace(/\[[^\]]*\]/g, " ");
  if (!options.commandExample) text = text.replace(/\([^)]*\)/g, " ");
  return [
    ...new Set(
      text
        /* a capitalised "The <Name>" is a retained proper noun (e.g. "The Seed"), not English residue */
        .replace(/\bThe\s+[A-Z][\w'-]*/g, " ")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .split(/[^a-z0-9']+/)
        .filter(Boolean)
    )
  ];
}

const residueVocabulary = {};
for (const language of CONTENT_LANGUAGES) {
  const words = new Set();
  for (const value of Object.values(uiBundle(language))) {
    if (typeof value === "string") residueTokens(value).forEach((token) => words.add(token));
  }
  residueVocabulary[language] = words;
}

const englishResidue = [];
const backlogResidue = [];
for (const language of CONTENT_LANGUAGES) {
  for (const key of englishKeys) {
    const value = registry[language][key];
    if (typeof value !== "string" || value.length < 16) continue;
    if (isLanguageNeutralKey(key)) continue;
    if (value === registry.en[key]) continue;
    const status = getManualClassification(key);
    if (["SAME_AS_ENGLISH", "unresolved"].includes(classificationStatus(status, language))) continue;
    const residue = residueTokens(value, { commandExample: /^command\..+\.example$/.test(key) }).filter(
      (token) =>
        (ENGLISH_RESIDUE_WORDS.has(token) || ENGLISH_RESIDUE_TERMS.has(token)) &&
        !residueVocabulary[language].has(token)
    );
    if (!residue.length) continue;
    const entry = {
      language,
      key,
      field: `${key.split(".")[0]}.${getFieldType(key)}`,
      english: registry.en[key],
      localized: value,
      residue
    };
    if (isBacklogKey(key)) backlogResidue.push(entry);
    else englishResidue.push(entry);
  }
}

/* ------------------------------------------------------------------------------------------------
   Italian coverage.

   Italian is still being translated. A glossary entry with no Italian value yet falls back to the
   English source text (see shared/sao-content-translations.js), which the checks above report as an
   English-identical value or as English residue. That backlog is counted here and does not fail the
   build, so the audit states how far Italian has come instead of blocking on work in progress.

   Only the two "not translated yet" categories are treated this way, and only for the languages
   scripts/localization-languages.js lists as still being translated: a missing key, an empty value, a
   missing counterpart, a duplicate key, an invalid classification entry or any Spanish/French issue
   still fails exactly as before. */
const TRANSLATION_BACKLOG_LANGUAGES = translationBacklogLanguages();

const equivalentValuesBlocking = unclassifiedEquivalentValues.filter((entry) =>
  CONTENT_LANGUAGES.some(
    (language) =>
      !TRANSLATION_BACKLOG_LANGUAGES.includes(language) &&
      entry[`${reportKey(language)}Equivalent`] &&
      !["SAME_AS_ENGLISH", "unresolved"].includes(entry[`${reportKey(language)}Status`])
  )
);
const residueBlocking = englishResidue.filter(
  (entry) => !TRANSLATION_BACKLOG_LANGUAGES.includes(entry.language)
);
const unresolvedBlocking = unresolved.filter(
  (entry) => !(entry.needs || []).every((language) => TRANSLATION_BACKLOG_LANGUAGES.includes(language))
);

/* The coverage of a language that is still being translated, as four disjoint buckets over the
   registry's key set - so the numbers always add up:
     translatedValues            the value differs from the English source text
     intentionallyUnchangedValues the value is the English source text and the classification data
                                 records why (a canonical name, a token, punctuation)
     pendingTranslationValues    the value is the English source text and no classification covers it
     missingKeys                 the registry has no key for the language at all
   `translatedWithEnglishLeft` is not a fifth bucket: it counts the subset of the translated values
   that still contain an English word, i.e. entries that are translated but worth another pass. */
const italianCoverage = TRANSLATION_BACKLOG_LANGUAGES.map((language) => {
  const key = reportKey(language);
  const languageReport = report[key] || { count: 0, translatedValues: 0, unchangedValues: 0, missingRegistryKeys: [] };
  const residueKeys = new Set(
    englishResidue.filter((entry) => entry.language === language).map((entry) => entry.key)
  );
  const pendingEquivalent = unclassifiedEquivalentValues.filter(
    (entry) => entry[`${key}Equivalent`] && !equivalentValuesBlocking.includes(entry)
  );
  const translatedValues = languageReport.translatedValues;
  const intentionallyUnchangedValues = languageReport.unchangedValues - pendingEquivalent.length;
  const missingKeys = languageReport.missingRegistryKeys.length;
  const translatedWithEnglishLeft = [...residueKeys].filter((residueKey) => {
    const entry = equivalentValues.find((value) => value.key === residueKey);
    return !entry || !entry[`${key}Equivalent`];
  }).length;
  return {
    language,
    registryKeys: languageReport.count,
    englishRegistryKeys: englishKeys.size,
    missingKeys,
    translatedValues,
    translatedWithEnglishLeft,
    intentionallyUnchangedValues,
    pendingTranslationValues: pendingEquivalent.length,
    coveragePercent: Number(((translatedValues / englishKeys.size) * 100).toFixed(2)),
    pendingPercent: Number(((pendingEquivalent.length / englishKeys.size) * 100).toFixed(2)),
    accountingBalanced:
      translatedValues + intentionallyUnchangedValues + pendingEquivalent.length + missingKeys ===
      languageReport.count,
    pendingSamples: pendingEquivalent.slice(0, 8).map((entry) => ({ key: entry.key, english: entry.english }))
  };
});

const localeQualityIssues = {
  ui: uiLocaleProblems,
  dataset: datasetLocaleProblems,
  invalidReferencedUiKeys: uiAudit.invalidReferencedUiKeys,
  hardcodedPlayerFacing: genuineUiBypasses,
  unclassifiedEquivalentValues: equivalentValuesBlocking,
  unresolved: unresolvedBlocking,
  duplicateKeys,
  invalidManualEntries,
  englishResidue: residueBlocking,
  missingUnderworldCategoryKeys,
  missingPatchnoteKeys,
  unresolvedPageContentKeys
};
if (
  uiLocaleProblems.length ||
  datasetLocaleProblems.length ||
  uiAudit.invalidReferencedUiKeys.length ||
  genuineUiBypasses.length ||
  equivalentValuesBlocking.length ||
  unresolvedBlocking.length ||
  duplicateKeys.length ||
  invalidManualEntries.length ||
  residueBlocking.length ||
  missingUnderworldCategoryKeys.length ||
  missingPatchnoteKeys.length ||
  unresolvedPageContentKeys.length
) {
  console.error(JSON.stringify({ localeQualityIssues }, null, 2));
  process.exitCode = 1;
}

const reportWithManual = {
  ...report,
  manualResolutionEntries: unresolved.length,
  sameAsEnglishEntries: sameAsEnglish.length,
  invalidManualEntries,
  italianCoverage
};

if (process.argv.includes("--remaining")) {
  console.log(
    JSON.stringify(
      {
        remainingValues,
        equivalentValues,
        unclassifiedEquivalentValues,
        unresolved,
        sameAsEnglish,
        invalidManualEntries,
        familyReport,
        uiAudit
      },
      null,
      2
    )
  );
} else if (process.argv.includes("--residue")) {
  console.log(
    JSON.stringify(
      {
        englishResidue,
        backlogResidue,
        missingUnderworldCategoryKeys,
        missingPatchnoteKeys,
        unresolvedPageContentKeys
      },
      null,
      2
    )
  );
} else if (process.argv.includes("--verbose")) {
  console.log(JSON.stringify({ ...reportWithManual, uiAudit }, null, 2));
} else {
  for (const language of CONTENT_LANGUAGES) {
    const label = reportKey(language);
    const result = report[label];
    console.log(`${label} registry keys: ${result.count}`);
    console.log(`${label} missing registry keys: ${result.missingRegistryKeys.length}`);
    console.log(`${label} missing dataset keys: ${result.missingDatasetKeys.length}`);
    console.log(`${label} translated values: ${result.translatedValues}`);
    console.log(`${label} unchanged English values: ${result.unchangedValues}`);
    console.log(`${label} coverage: ${result.coveragePercentage}%`);
    console.log(`${label} missing dataset sample: ${result.missingDatasetKeys.slice(0, 10).join(", ") || "none"}`);
    console.log(
      `${label} english residue values: ${englishResidue.filter((entry) => entry.language === language).length}`
    );
  }
  console.log(`English registry keys: ${report.englishRegistryKeys}`);
  for (const coverage of italianCoverage) {
    console.log(
      `${coverage.language} translation progress: ${coverage.coveragePercent}% (${coverage.translatedValues}/${coverage.englishRegistryKeys} values translated)`
    );
    console.log(
      `${coverage.language} value accounting: ${coverage.translatedValues} translated + ${coverage.intentionallyUnchangedValues} intentionally unchanged + ${coverage.pendingTranslationValues} pending translation + ${coverage.missingKeys} missing = ${coverage.registryKeys} registry keys (balanced: ${coverage.accountingBalanced})`
    );
    console.log(
      `${coverage.language} partly translated: ${coverage.translatedWithEnglishLeft} of the ${coverage.translatedValues} translated values still contain an English word (tracked, not failing; run with --residue for the full list)`
    );
    console.log(
      `${coverage.language} pending translation backlog: ${coverage.pendingTranslationValues} English-identical values (${coverage.pendingPercent}% of the registry; tracked, not failing; run with --remaining for the full list)`
    );
  }
  console.log(`Required dataset keys: ${report.requiredDatasetKeys}`);
  console.log(`Duplicate keys: ${report.duplicateKeys.length}`);
  console.log(`Language-neutral keys: ${[...required].filter(isLanguageNeutralKey).length}`);
  console.log(`Unclassified English-equivalent values: ${unclassifiedEquivalentValues.length}`);
  console.log(
    `English residue values: ${englishResidue.length}${englishResidue.length ? " (run with --residue for the full list)" : ""}`
  );
  console.log(
    `Untranslated backlog in token-glossary families: ${backlogResidue.length}${backlogResidue.length ? " (tracked, not failing; run with --residue for the full list)" : ""}`
  );
  if (backlogResidue.length) {
    const backlogSample = [...new Set(backlogResidue.map((entry) => entry.english))].slice(0, 8);
    console.log(`Untranslated backlog sample: ${backlogSample.join(" | ")}`);
  }
  console.log(`Missing underworld category keys: ${missingUnderworldCategoryKeys.length}`);
  console.log(`Missing patch-note keys: ${missingPatchnoteKeys.length}`);
  console.log(`Unresolved page content keys: ${unresolvedPageContentKeys.length}`);
  console.log(`Families: ${JSON.stringify(familyReport)}`);
  console.log(`Remaining by field: ${JSON.stringify(remainingByField)}`);
}
