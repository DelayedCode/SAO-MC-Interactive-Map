/* Checks for scripts/localization-languages.js - the shared language configuration the localization
   audit and the language-sensitive tests read.

   Three things are pinned here:
     1. the helper reports exactly what the shared modules declare, so the tooling cannot drift from
        the site's configuration;
     2. the two language concepts stay separate (UI languages vs content-translation slots) and the
        derived lists follow from them;
     3. the classification schema accepts both the shipped per-label status fields and the
        language-keyed `statuses` object, so adding a language is a data change rather than new audit
        logic.
   No language is added by this file: the assertions describe the configuration as it ships today. */
const assert = require("node:assert/strict");
const { readFile } = require("./harness-helpers");
const languages = require("./localization-languages");

const SOURCE = languages.sourceLanguage();
const UI = languages.uiLanguages();
const CONTENT = languages.contentLanguages();

/* 1. The lists are read from the shared modules. These two assertions are the deliberate
      "current languages" pin: adding a language updates them on purpose, not by accident. */
assert.equal(SOURCE, "en", "the source text language is English");
assert.deepEqual(UI, ["en", "es", "fr", "it"], "the site supports English, Spanish, French and Italian");
assert.deepEqual(
  CONTENT,
  ["es", "fr", "it"],
  "the content registry has Spanish, French and Italian translation slots"
);

/* 2. The derived lists follow from those two, and the two concepts stay separate. */
assert.deepEqual(
  languages.translatedUiLanguages(),
  ["es", "fr", "it"],
  "every UI language but the source one"
);
assert.deepEqual(
  languages.registryLanguages(),
  ["en", "es", "fr", "it"],
  "the source language plus every slot"
);
assert.equal(UI.includes(SOURCE), true, "the source language is one of the supported languages");
for (const language of CONTENT) {
  assert.equal(UI.includes(language), true, `${language} is both a content slot and a supported language`);
}
/* Italian is a UI language the content registry now also holds a slot for: the glossary entries carry
   its values as the last element of each positional list. */
assert.equal(UI.includes("it"), true, "Italian is a supported UI language");
assert.equal(CONTENT.includes("it"), true, "Italian has a content-translation slot");
for (const language of languages.translatedUiLanguages()) {
  assert.notEqual(language, SOURCE, "a translated UI language is never the source language");
}
const firstCall = languages.uiLanguages();
firstCall.push("xx");
assert.deepEqual(languages.uiLanguages(), UI, "each call hands out its own copy of the list");

/* 3. Report keys and the classification schema. */
assert.equal(languages.classificationReportKey("es"), "spanish", "Spanish keeps its report key");
assert.equal(languages.classificationReportKey("fr"), "french", "French keeps its report key");
assert.equal(
  languages.classificationReportKey("it"),
  "it",
  "a language with no report key reports under its own language code"
);
assert.equal(languages.classificationStatusField("es"), "spanishStatus", "the shipped Spanish status field");
assert.equal(languages.classificationStatusField("fr"), "frenchStatus", "the shipped French status field");
assert.equal(
  languages.classificationStatusField("it"),
  undefined,
  "a language with no status field declared yet"
);

const legacyEntry = { spanishStatus: "translated", frenchStatus: "SAME_AS_ENGLISH" };
assert.equal(languages.classificationStatus(legacyEntry, "es"), "translated", "the shipped field form");
assert.equal(languages.classificationStatus(legacyEntry, "fr"), "SAME_AS_ENGLISH", "the shipped field form");

const keyedEntry = { statuses: { es: "translated", fr: "SAME_AS_ENGLISH", it: "unresolved" } };
assert.equal(languages.classificationStatus(keyedEntry, "es"), "translated", "the language-keyed form");
assert.equal(languages.classificationStatus(keyedEntry, "fr"), "SAME_AS_ENGLISH", "the language-keyed form");
assert.equal(
  languages.classificationStatus(keyedEntry, "it"),
  "unresolved",
  "a language-keyed status needs no new audit logic"
);
assert.equal(
  languages.classificationStatus(legacyEntry, "it"),
  undefined,
  "an undeclared status stays undeclared so the audit can report it"
);
assert.equal(languages.classificationStatus(null, "es"), undefined, "a missing entry declares nothing");

/* 4. The shipped classification data still classifies Spanish and French for every group, and the
      audit reads it through the helper instead of through per-language fields. */
const sameAsEnglish = JSON.parse(readFile("scripts/localization-same-as-english.json"));
assert.ok(Array.isArray(sameAsEnglish.groups), "the classification data exposes its groups");
assert.ok(sameAsEnglish.groups.length > 0, "the classification data is not empty");
for (const group of sameAsEnglish.groups) {
  for (const language of CONTENT) {
    assert.ok(
      languages.classificationStatus(group, language),
      `${group.field || "group"} classifies ${language}`
    );
  }
  /* Italian's own classification is declared through the language-keyed `statuses` object: every group
     states whether its values are still the English source text (SAME_AS_ENGLISH) or translated. */
  assert.ok(
    ["SAME_AS_ENGLISH", "translated"].includes(languages.classificationStatus(group, "it")),
    `${group.field || "group"} classifies Italian`
  );
}

/* 5. The audit and the language-sensitive tests read the shared configuration instead of keeping
      their own language lists. */
const auditSource = readFile("scripts/check-localization.js");
assert.match(
  auditSource,
  /require\("\.\/localization-languages"\)/,
  "the audit reads the shared language configuration"
);
assert.doesNotMatch(auditSource, /\[\s*"en"\s*,\s*"es"\s*,\s*"fr"\s*\]/, "the audit keeps no UI language list");
assert.doesNotMatch(auditSource, /\[\s*"es"\s*,\s*"fr"\s*\]/, "the audit keeps no content language list");
assert.doesNotMatch(
  auditSource,
  /spanishStatus|frenchStatus/,
  "the audit reads classification statuses through the helper"
);
assert.match(auditSource, /for \(const language of CONTENT_LANGUAGES\)/, "the audit loops the content languages");
assert.match(auditSource, /for \(const language of UI_LANGUAGES\)/, "the audit loops the UI languages");
assert.match(
  auditSource,
  /const CONTENT_LANGUAGES = contentLanguages\(\);/,
  "the audit derives its content languages from the shared configuration"
);
assert.match(
  auditSource,
  /const UI_LANGUAGES = uiLanguages\(\);/,
  "the audit derives its UI languages from the shared configuration"
);

for (const relativePath of [
  "scripts/test-browser-smoke.js",
  "scripts/verify-ui-polish.js",
  "scripts/visual-quality-inspection.js",
  "scripts/test-walkthrough-pages.js",
  "scripts/test-character-build-stats-ui.js",
  "scripts/equipment-render-check.js",
  "scripts/test-settings-menu.js",
  "scripts/test-localization-underworld-map.js"
]) {
  const source = readFile(relativePath);
  assert.match(
    source,
    /require\("\.\/localization-languages"\)/,
    `${relativePath} reads the shared language configuration`
  );
  assert.doesNotMatch(source, /\[\s*"en"\s*,\s*"es"\s*,\s*"fr"\s*\]/, `${relativePath} keeps no UI language list`);
}

for (const relativePath of ["scripts/test-current-side-quests.js", "scripts/test-current-normal-armor.js"]) {
  const source = readFile(relativePath);
  assert.match(
    source,
    /translatedContentLanguages\(\)/,
    `${relativePath} ties its loop to the content languages whose translations are complete`
  );
  assert.match(
    source,
    /require\("\.\/localization-languages"\)/,
    `${relativePath} reads the shared language configuration`
  );
  assert.doesNotMatch(source, /\[\s*"es"\s*,\s*"fr"\s*\]/, `${relativePath} keeps no content language list`);
}

/* Argo's parser languages are Argo's own list, so those tests stay explicit on purpose until Argo
   supports another language. */
assert.match(
  readFile("scripts/test-argo-engine.js"),
  /for \(const language of \["es", "fr"\]\)/,
  "the Argo cue tests keep their explicit parser-language list"
);

/* 6. The audit's failure gates are all still wired. */
for (const gate of [
  "uiLocaleProblems",
  "datasetLocaleProblems",
  "invalidReferencedUiKeys",
  "hardcodedPlayerFacing",
  "unclassifiedEquivalentValues",
  "unresolved",
  "duplicateKeys",
  "invalidManualEntries",
  "englishResidue",
  "missingUnderworldCategoryKeys",
  "missingPatchnoteKeys",
  "unresolvedPageContentKeys"
]) {
  assert.match(auditSource, new RegExp(`\\b${gate}\\b`), `the audit still reports ${gate}`);
}
assert.match(auditSource, /process\.exitCode = 1/, "the audit still fails the run on a localization issue");
assert.match(
  auditSource,
  /const VALID_CLASSIFICATION_STATUSES = new Set\(\["translated", "SAME_AS_ENGLISH", "unresolved"\]\);/,
  "the audit still validates classification statuses"
);

console.log(
  JSON.stringify(
    {
      sourceLanguage: SOURCE,
      uiLanguages: UI,
      contentLanguages: CONTENT,
      checks: [
        "shared-configuration",
        "derived-language-lists",
        "report-keys",
        "classification-schema",
        "classification-data",
        "audit-uses-shared-configuration",
        "tests-use-shared-configuration",
        "audit-gates-intact"
      ],
      status: "passed"
    },
    null,
    2
  )
);
console.log("Localization language configuration checks passed.");

