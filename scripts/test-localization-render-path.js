const assert = require("node:assert/strict");
const { readFile } = require("./harness-helpers");

const mapScript = readFile("Aincrad/Map/maps.js");
const mainUiScript = readFile("Fractured Underworld/Main UI/mainui.js");
const questsScript = readFile("Aincrad/Quests/quests.js");
const bestiaryScript = readFile("Aincrad/Bestiary/bestiary.js");
const characterBuildScript = readFile("Aincrad/Character Build/character-build.js");
const characterBuildHtml = readFile("Aincrad/Character Build/character-build.html");
const ecompendiumScript = readFile("Aincrad/eCompendium/ecompendium.js");
const patchnotesScript = readFile("Aincrad/Patchnotes/patchnotes.js");
const i18nScript = readFile("shared/sao-i18n.js");
const contentTranslationsScript = readFile("shared/sao-content-translations.js");
const miscInfoScript = readFile("Aincrad/Misc Info/miscinfo.js");
const miscInfoHtml = readFile("Aincrad/Misc Info/miscinfo.html");
const hubHtml = readFile("index.html");
const welcomeWarningScript = readFile("shared/sao-welcome-warning.js");
const auditScript = readFile("scripts/check-localization.js");
const currentDataSources = [
  "Aincrad/Bestiary/bestiary_current.js",
  "Aincrad/Commands/commands_current.js",
  "Aincrad/eCompendium/ecompendium_current.js",
  "Aincrad/Misc Info/miscinfo_current.js",
  "Aincrad/Quests/quests_current.js",
  "Fractured Underworld/Compendium/compendium_current.js",
  "Fractured Underworld/Tower Defense/towerdefense_current.js"
]
  .map(readFile)
  .join("\n");

assert.match(
  auditScript,
  /process\.exitCode\s*=\s*1|process\.exit\s*\(\s*1\s*\)/,
  "The localization audit must fail when a persistent player-facing bypass is detected."
);
assert.doesNotMatch(
  mapScript,
  /textContent\s*=\s*["'`]X:\s*--\s*Z:\s*--["'`]/,
  "Map coordinates placeholder should use the localized key."
);
assert.doesNotMatch(
  mapScript,
  /\$\{area\.title\}\s*Mobs/,
  "Mob-area titles should use the localized mob label instead of a raw English suffix."
);
assert.doesNotMatch(
  mainUiScript,
  /textContent\s*=\s*["']Map data unavailable["']/,
  "Main UI map empty state must use the localized key."
);
assert.doesNotMatch(
  mainUiScript,
  /\$\{area\.title\}\s*Mobs/,
  "Underworld mob-area titles must use the localized mob label instead of a raw English suffix."
);
assert.doesNotMatch(
  mainUiScript,
  /textContent\s*=\s*["']X:\s*--\s*Z:\s*--["']/,
  "Main UI coordinates placeholder should use the localized key."
);
assert.doesNotMatch(
  questsScript,
  /textContent\s*=\s*["'`]Quests\s*-\s*\$\{getFloorLabel\(activeFloor\)\}/,
  "Quest title should use the localized title-with-floor key."
);
assert.doesNotMatch(
  characterBuildScript,
  /page\.characterBuild\.slots\./,
  "Character Build slot labels must use a dedicated key namespace and not collide with the count template."
);
assert.doesNotMatch(
  characterBuildHtml,
  /<option value="1">Build 1<\/option>/i,
  "Build selector options must be rendered through the localizer instead of hardcoded English text."
);
assert.doesNotMatch(
  i18nScript,
  /slots:\s*\{\s*helmet:\s*"Helmet"/,
  "The slot count template and slot-name object must not share the same key."
);
assert.doesNotMatch(
  miscInfoScript,
  /page\.characterBuild\.slots\./,
  "Misc Info slot labels must use the localized slot-name namespace."
);
assert.doesNotMatch(
  characterBuildScript,
  /Health:\s*1|Physical Damage|Critical Hit Damage/,
  "Character Build skill effect text must be localized at render time, not left in English."
);
assert.doesNotMatch(
  characterBuildScript,
  /escapeHtml\(\s*entry\.rarity\s*\)/,
  "Equipment rarity labels must be localized before rendering."
);
assert.match(auditScript, /invalidReferencedUiKeys/, "The localization audit must check direct UI key references.");
assert.match(i18nScript, /data-i18n-alt/, "Image alt text must update through the shared localizer.");
assert.match(
  i18nScript,
  /translations\.en\.page\.patchnotes,\s*\{\s*loadError:/,
  "Patchnotes load errors must have English locale entries."
);
assert.match(
  i18nScript,
  /translations\.en\.page\.uwcompendium,\s*\{\s*categoriesAria:/,
  "Underworld Compendium labels must have English locale entries."
);
assert.match(
  miscInfoHtml,
  /data-i18n="page\.miscinfo\.skillsUnavailable"/,
  "Misc Info must render the localized skills empty state."
);
assert.doesNotMatch(
  miscInfoHtml,
  /This section will later contain|Do NOT add individual skills|Other skill-related data we add later/i,
  "Misc Info must not expose internal skills placeholder notes."
);
assert.doesNotMatch(
  characterBuildHtml,
  /PLACEHOLDER PREVIEW|visual placeholders|effects and saving arrive in later phases/i,
  "Character Build must not show stale or placeholder copy."
);
assert.doesNotMatch(
  currentDataSources,
  /CURRENT DATA EXAMPLE|Replace this|Replace requirements|Example Drop|Example Boss Drop|Example Stat/i,
  "Selectable Current Data sources must not expose fake sample records."
);
assert.doesNotMatch(
  ecompendiumScript,
  /<span>\s*\+\s*escapeHtml\(content\(`equipment\.\$\{getEntryId\(entry\)\}\.stat\.\$\{statId\}`\s*,\s*stat\)\s*\)/,
  "Equipment stat labels must be localized before rendering."
);
assert.match(
  i18nScript,
  /\["categories"\s*\+\s*"Aria"\]\s*:\s*"Compendium categories"/,
  "eCompendium must provide the categoriesAria label in the locale bundle."
);
assert.match(i18nScript, /v130\s*:\s*\{/, "The v1.3 patch note must be present in the locale mapping.");
assert.match(patchnotesScript, /"v1\.3"\s*:\s*"v130"/, "Patch notes must map the v1.3 version to the v130 locale key.");

/* The language list and its user-facing order live in the shared language system only. The hub's
   first-visit hint rows and the Welcome Warning's language buttons both read them from there, so no
   page can drift from the supported set (and adding a language stays a dictionary-only change). */
assert.match(
  i18nScript,
  /const SUPPORTED_LANGUAGE_CHOICES = Object\.freeze\(/,
  "The shared language system must derive the user-facing language order from SUPPORTED_LANGUAGES."
);
assert.match(
  i18nScript,
  /function getSupportedLanguages\(\)/,
  "The shared language system must expose the supported languages for pickers to read."
);
assert.match(
  i18nScript,
  /function getLanguageText\(language, key\)/,
  "The shared language system must expose per-language labels so no caller hardcodes them."
);
assert.doesNotMatch(
  hubHtml,
  /Change Language Here!|Changez de langue ici|Cambia el idioma aqu/,
  "The hub's language hint sentences must come from the dictionaries, not from hardcoded markup."
);
assert.doesNotMatch(
  hubHtml,
  /\["en", "fr", "es"\]/,
  "The hub must read the language order from the shared configuration instead of its own list."
);
assert.match(
  hubHtml,
  /getLanguageText\?\.\(language, "languageHint"\)/,
  "The hub's language hint rows must be rendered from the shared per-language labels."
);
assert.match(
  hubHtml,
  /getLanguages: \(\) => i18n\?\.getSupportedLanguages\?\.\(\)/,
  "The Welcome Warning must take its languages from the shared language system."
);
assert.doesNotMatch(
  welcomeWarningScript,
  /: \(\) => \["en", "es", "fr"\];/,
  "The Welcome Warning must read the supported languages from the shared language system."
);
assert.match(
  welcomeWarningScript,
  /i18n\.getSupportedLanguages\(\)/,
  "The Welcome Warning must fall back through the shared language system."
);
/* The six page notices and the legacy .translationNotice -> .notice lookup they were read through
   are gone: nothing rendered them, and English never had them. */
assert.doesNotMatch(
  i18nScript,
  /endsWith\("\.translationNotice"\)/,
  "The unused legacy .translationNotice -> .notice lookup fallback must stay removed."
);
assert.doesNotMatch(
  i18nScript,
  /\n\s+notice:\n\s+"La mayor parte del contenido/,
  "The dead Spanish page notices must stay removed."
);
assert.doesNotMatch(
  i18nScript,
  /\n\s+notice:\n\s+"La majeure partie du contenu/,
  "The dead French page notices must stay removed."
);

/* The content-translation glossaries are positional [spanish, french] pairs. Every lookup resolves
   its slot through the shared resolver instead of treating every non-French language as Spanish, and
   the public APIs accept a language code or the historical numeric slot. */
assert.match(
  contentTranslationsScript,
  /const TRANSLATION_SLOT_LANGUAGES = Object\.freeze\(\["es", "fr", "it"\]\)/,
  "The content translations must declare the positional slot order in one place."
);
assert.match(
  contentTranslationsScript,
  /window\.SAOContentTranslations\.translationSlot = translationSlot;/,
  "The content translations must expose the language-to-slot resolver."
);
assert.match(
  contentTranslationsScript,
  /const languageKeyed = spanish !== null && typeof spanish === "object"/,
  "register() must accept the language-keyed form alongside the positional one."
);
assert.doesNotMatch(
  contentTranslationsScript,
  /language === "fr" \? 1 : 0/,
  "No content-translation helper may treat every non-French language as Spanish."
);
assert.doesNotMatch(
  contentTranslationsScript,
  /languageIndex/,
  "Content translations must not reach a slot through a bare language index."
);
assert.doesNotMatch(
  ecompendiumScript,
  /language === "fr" \? 1 : 0/,
  "The Equipment Compendium must pass its language code, not a positional index."
);
assert.match(
  ecompendiumScript,
  /translateEquivalentLabel\(text, language\)/,
  "The Equipment Compendium must resolve its equivalent label by language code."
);

/* The pair layout is data, not a code assumption: one adapter reads a positional pair by language code
   and one collects a producer's values for every language that has a slot. No producer destructures
   exactly two translations, indexes a pair by slot or passes a slot index where a code belongs. */
assert.match(
  contentTranslationsScript,
  /function pairValue\(pair, language\)/,
  "The content translations must read a positional pair through one language-code reader."
);
assert.match(
  contentTranslationsScript,
  /function translationsByLanguage\(valueFor\)/,
  "The content translations must build a producer's per-language values through one adapter."
);
assert.match(
  contentTranslationsScript,
  /window\.SAOContentTranslations\.translationsByLanguage = translationsByLanguage;/,
  "The adapter must be part of the module's surface for the pages that register content."
);
assert.doesNotMatch(
  contentTranslationsScript,
  /\[english, \[spanish, french\]\]/,
  "No content registrar may destructure exactly two translations."
);
assert.doesNotMatch(
  contentTranslationsScript,
  /curated\?\.\[0\]|curated\[0\]|typeTranslation\?\.\[0\]|location\?\.\[0\]/,
  "No content producer may index a glossary pair by slot."
);
assert.doesNotMatch(
  contentTranslationsScript,
  /translateEquipmentTermValue\([^)]*,\s*[01]\)|translateEquivalentLabel\([^)]*,\s*[01]\)/,
  "No content producer may pass a numeric slot where a language code belongs."
);
assert.doesNotMatch(
  contentTranslationsScript,
  /SAOContentTranslations\.(?:es|fr)\[/,
  "No content producer may reach a language dictionary through a hardcoded language code."
);
assert.match(
  bestiaryScript,
  /contentRegistry\.translationsByLanguage\(/,
  "The Bestiary page must register every slot language through the shared adapter."
);
assert.doesNotMatch(
  bestiaryScript,
  /contentRegistry\.(?:es|fr)\[/,
  "The Bestiary page must not name a content language when it registers its records."
);

console.log("Localization render-path regression checks passed.");
