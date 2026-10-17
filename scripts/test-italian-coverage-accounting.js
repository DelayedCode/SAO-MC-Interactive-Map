/* Italian coverage accounting checks.

   The localization audit reports a language that is still being translated as four disjoint buckets
   over the registry's key set, so the numbers always add up and a partly-translated value is never
   counted twice:

     translatedValues              the value differs from the English source text
     intentionallyUnchangedValues  the value is the English source text and the classification data
                                   records why (a canonical name, a token, punctuation)
     pendingTranslationValues      the value is the English source text with no classification
     missingKeys                   the registry has no key for the language at all

   `translatedWithEnglishLeft` is a flag on a subset of translatedValues (entries worth another pass),
   not a fifth bucket. These checks pin that arithmetic, the coverage percentage, determinism, and the
   fact that Spanish and French keep their own numbers. */
const assert = require("node:assert/strict");
const { spawnSync } = require("node:child_process");
const { loadScript } = require("./harness-helpers");
const languages = require("./localization-languages");

function loadRegistry() {
  const context = { window: {}, console };
  context.window = context;
  loadScript("shared/sao-content-translations.js", context);
  return context.window.SAOContentTranslations;
}

function auditReport(args) {
  const result = spawnSync(process.execPath, ["scripts/check-localization.js", ...args], {
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024
  });
  const text = `${result.stdout || ""}\n${result.stderr || ""}`;
  const marker = text.indexOf('"localeQualityIssues"');
  const reportMarker = text.indexOf('"englishRegistryKeys"');
  const start = marker >= 0 ? text.lastIndexOf("{", marker) : text.lastIndexOf("{", reportMarker);
  assert.ok(start >= 0, "the audit must print its JSON report");
  return JSON.parse(text.slice(start));
}

const report = auditReport(["--verbose"]);
assert.ok(Array.isArray(report.italianCoverage), "the audit reports per-language coverage");
const coverage = report.italianCoverage.find((entry) => entry.language === "it");
assert.ok(coverage, "the audit reports Italian coverage");
assert.equal(coverage.accountingBalanced, true, "the coverage buckets must add up");
assert.equal(
  coverage.translatedValues +
    coverage.intentionallyUnchangedValues +
    coverage.pendingTranslationValues +
    coverage.missingKeys,
  coverage.registryKeys,
  "translated + intentionally unchanged + pending + missing equals the registry key count"
);
assert.equal(
  coverage.registryKeys,
  coverage.englishRegistryKeys,
  "every English registry key has an Italian entry"
);
assert.equal(coverage.missingKeys, 0, "no Italian registry key is missing");
for (const field of ["translatedValues", "intentionallyUnchangedValues", "pendingTranslationValues", "missingKeys"]) {
  assert.ok(Number.isInteger(coverage[field]) && coverage[field] >= 0, `${field} is a count`);
}
assert.equal(
  coverage.translatedWithEnglishLeft <= coverage.translatedValues,
  true,
  "the partly-translated flag is a subset of the translated values, never a separate bucket"
);
assert.equal(
  coverage.coveragePercent,
  Number(((coverage.translatedValues / coverage.englishRegistryKeys) * 100).toFixed(2)),
  "the coverage percentage follows from the translated bucket"
);
assert.equal(
  coverage.pendingPercent,
  Number(((coverage.pendingTranslationValues / coverage.englishRegistryKeys) * 100).toFixed(2)),
  "the pending percentage follows from the pending bucket"
);

/* The backlog categories the audit treats as work in progress are Italian's own: Spanish and French
   keep failing on them. */
for (const entry of report.unclassifiedEquivalentValues || []) {
  assert.equal(
    entry.spanishEquivalent && !["SAME_AS_ENGLISH", "unresolved"].includes(entry.spanishStatus),
    false,
    "an unclassified Spanish value would still fail the audit"
  );
  assert.equal(
    entry.frenchEquivalent && !["SAME_AS_ENGLISH", "unresolved"].includes(entry.frenchStatus),
    false,
    "an unclassified French value would still fail the audit"
  );
}

/* Spanish and French keep their established numbers: the Italian work must not move them. These are
   the metrics the audit reported before Italian content work started, corrected once by the
   source-correction fix in scripts/check-localization.js: the canonical mob name Nymbréa used to be
   compared against a corrupted English string (CP437-decoded bytes), which counted its identical
   Spanish and French values as translated. With the corrupted source repaired the same value is
   counted for what it is - a canonical name that stays English - so each language moves by exactly
   that one value (7977 -> 7976, 7665 -> 7664) and no translated text was lost. */
const ESTABLISHED_METRICS = {
  spanish: { translatedValues: 7976, coveragePercentage: 95.22 },
  french: { translatedValues: 7664, coveragePercentage: 91.5 }
};
for (const [reportName, expected] of Object.entries(ESTABLISHED_METRICS)) {
  const reported = report[reportName];
  assert.ok(reported, `the audit reports ${reportName}`);
  assert.equal(reported.translatedValues, expected.translatedValues, `${reportName}: translated values unchanged`);
  assert.equal(
    reported.coveragePercentage,
    expected.coveragePercentage,
    `${reportName}: coverage unchanged`
  );
  assert.equal(reported.missingRegistryKeys.length, 0, `${reportName}: no missing registry key`);
  assert.equal(reported.missingDatasetKeys.length, 0, `${reportName}: no missing dataset key`);
}

/* The Italian buckets are measured over the same key set the Spanish and French numbers use. */
const registry = loadRegistry();
for (const language of languages.translatedContentLanguages()) {
  assert.equal(
    report[languages.classificationReportKey(language)].count,
    coverage.registryKeys,
    `${language} and Italian are audited over the same registry`
  );
  assert.equal(
    Object.keys(registry[language]).length <= coverage.registryKeys,
    true,
    `${language}: the shipped dictionary is part of the audited registry`
  );
}

/* The report is deterministic: the same inputs produce the same coverage block. */
const second = auditReport(["--verbose"]).italianCoverage;
assert.deepEqual(second, report.italianCoverage, "the coverage block is deterministic");

console.log(
  JSON.stringify(
    {
      language: coverage.language,
      registryKeys: coverage.registryKeys,
      translated: coverage.translatedValues,
      intentionallyUnchanged: coverage.intentionallyUnchangedValues,
      pendingTranslation: coverage.pendingTranslationValues,
      missing: coverage.missingKeys,
      partlyTranslated: coverage.translatedWithEnglishLeft,
      coveragePercent: coverage.coveragePercent,
      checks: [
        "coverage-buckets-add-up",
        "coverage-percentages-follow-buckets",
        "partly-translated-is-a-subset",
        "backlog-is-italian-only",
        "spanish-and-french-recomputed",
        "deterministic-report"
      ],
      status: "passed"
    },
    null,
    2
  )
);
console.log("Italian coverage accounting checks passed.");
