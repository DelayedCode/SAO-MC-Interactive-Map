const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

const mapScript = read("Aincrad/Map/maps.js");
const mainUiScript = read("Fractured Underworld/Main UI/mainui.js");
const questsScript = read("Aincrad/Quests/quests.js");
const characterBuildScript = read("Aincrad/Character Build/character-build.js");
const characterBuildHtml = read("Aincrad/Character Build/character-build.html");
const ecompendiumScript = read("Aincrad/eCompendium/ecompendium.js");
const patchnotesScript = read("Aincrad/Patchnotes/patchnotes.js");
const i18nScript = read("shared/sao-i18n.js");
const miscInfoScript = read("Aincrad/Misc Info/miscinfo.js");
const miscInfoHtml = read("Aincrad/Misc Info/miscinfo.html");
const auditScript = read("scripts/check-localization.js");
const currentDataSources = [
  "Aincrad/Bestiary/bestiary_current.js",
  "Aincrad/Commands/commands_current.js",
  "Aincrad/eCompendium/ecompendium_current.js",
  "Aincrad/Misc Info/miscinfo_current.js",
  "Aincrad/Quests/quests_current.js",
  "Fractured Underworld/Compendium/compendium_current.js",
  "Fractured Underworld/Tower Defense/towerdefense_current.js"
].map(read).join("\n");

assert.match(auditScript, /process\.exitCode\s*=\s*1|process\.exit\s*\(\s*1\s*\)/, "The localization audit must fail when a persistent player-facing bypass is detected.");
assert.doesNotMatch(mapScript, /textContent\s*=\s*["'`]X:\s*--\s*Z:\s*--["'`]/, "Map coordinates placeholder should use the localized key.");
assert.doesNotMatch(mapScript, /\$\{area\.title\}\s*Mobs/, "Mob-area titles should use the localized mob label instead of a raw English suffix.");
assert.doesNotMatch(mainUiScript, /textContent\s*=\s*["']Map data unavailable["']/, "Main UI map empty state must use the localized key.");
assert.doesNotMatch(mainUiScript, /\$\{area\.title\}\s*Mobs/, "Underworld mob-area titles must use the localized mob label instead of a raw English suffix.");
assert.doesNotMatch(mainUiScript, /textContent\s*=\s*["']X:\s*--\s*Z:\s*--["']/, "Main UI coordinates placeholder should use the localized key.");
assert.doesNotMatch(questsScript, /textContent\s*=\s*["'`]Quests\s*-\s*\$\{getFloorLabel\(activeFloor\)\}/, "Quest title should use the localized title-with-floor key.");
assert.doesNotMatch(characterBuildScript, /page\.characterBuild\.slots\./, "Character Build slot labels must use a dedicated key namespace and not collide with the count template.");
assert.doesNotMatch(characterBuildHtml, /<option value="1">Build 1<\/option>/i, "Build selector options must be rendered through the localizer instead of hardcoded English text.");
assert.doesNotMatch(i18nScript, /slots:\s*\{\s*helmet:\s*"Helmet"/, "The slot count template and slot-name object must not share the same key.");
assert.doesNotMatch(miscInfoScript, /page\.characterBuild\.slots\./, "Misc Info slot labels must use the localized slot-name namespace.");
assert.doesNotMatch(characterBuildScript, /Health:\s*1|Physical Damage|Critical Hit Damage/, "Character Build skill effect text must be localized at render time, not left in English.");
assert.doesNotMatch(characterBuildScript, /escapeHtml\(\s*entry\.rarity\s*\)/, "Equipment rarity labels must be localized before rendering.");
assert.match(auditScript, /invalidReferencedUiKeys/, "The localization audit must check direct UI key references.");
assert.match(i18nScript, /data-i18n-alt/, "Image alt text must update through the shared localizer.");
assert.match(i18nScript, /translations\.en\.page\.patchnotes, \{ loadError:/, "Patchnotes load errors must have English locale entries.");
assert.match(i18nScript, /translations\.en\.page\.uwcompendium, \{ categoriesAria:/, "Underworld Compendium labels must have English locale entries.");
assert.match(miscInfoHtml, /data-i18n="page\.miscinfo\.skillsUnavailable"/, "Misc Info must render the localized skills empty state.");
assert.doesNotMatch(miscInfoHtml, /This section will later contain|Do NOT add individual skills|Other skill-related data we add later/i, "Misc Info must not expose internal skills placeholder notes.");
assert.doesNotMatch(characterBuildHtml, /PLACEHOLDER PREVIEW|visual placeholders|effects and saving arrive in later phases/i, "Character Build must not show stale or placeholder copy.");
assert.doesNotMatch(currentDataSources, /CURRENT DATA EXAMPLE|Replace this|Replace requirements|Example Drop|Example Boss Drop|Example Stat/i, "Selectable Current Data sources must not expose fake sample records.");
assert.doesNotMatch(ecompendiumScript, /<span>\s*\+\s*escapeHtml\(content\(`equipment\.\$\{getEntryId\(entry\)\}\.stat\.\$\{statId\}`\s*,\s*stat\)\s*\)/, "Equipment stat labels must be localized before rendering.");
assert.match(i18nScript, /\["categories"\s*\+\s*"Aria"\]\s*:\s*"Compendium categories"/, "eCompendium must provide the categoriesAria label in the locale bundle.");
assert.match(i18nScript, /v130\s*:\s*\{/, "The v1.3 patch note must be present in the locale mapping.");
assert.match(patchnotesScript, /"v1\.3"\s*:\s*"v130"/, "Patch notes must map the v1.3 version to the v130 locale key.");

console.log("Localization render-path regression checks passed.");
