/* The language lists the localization tooling works from.

   Every list here is read from the shipped shared modules instead of being restated in each script,
   so a language is registered in one place and the audit and the tests follow automatically. There
   is no fallback literal: if a shared module stops exposing its configuration the tooling throws
   instead of silently auditing the wrong set of languages.

   Four different questions, four functions - they are deliberately not interchangeable:

     sourceLanguage()          the language the source text is written in (sao-i18n.js
                               DEFAULT_LANGUAGE). Every other language is compared against it.
     uiLanguages()             every language the site offers (sao-i18n.js SUPPORTED_LANGUAGES).
                               Tests that drive the UI or read the UI dictionary cover all of these.
     translatedUiLanguages()   the UI languages that are not the source language: the ones expected to
                               hold their own UI dictionary wording.
     contentLanguages()        the languages shared/sao-content-translations.js holds positional
                               [spanish, french, italian] translation slots for
                               (TRANSLATION_SLOT_LANGUAGES). Content-registry checks use this list,
                               never the UI list: the two are different concepts and must not be
                               assumed equal.
     translationBacklogLanguages()  the subset of contentLanguages() whose glossary translations are
                               still being written (Italian). A record with no value for one of these
                               falls back to the English source text, so the audit reports that backlog
                               instead of failing.
     translatedContentLanguages()  contentLanguages() minus the backlog: the languages whose content
                               must be complete for every record the content tests check.
     registryLanguages()       every language the content registry has a dictionary for: the source
                               language plus every translation slot.

   Classification data (scripts/localization-same-as-english.json) declares one status per content
   language. The original schema wrote those as `spanishStatus` / `frenchStatus` fields; a
   language-keyed `statuses` object is accepted as well, so adding a language means adding one key
   rather than another pair of fields. classificationStatus() reads both forms.
   classificationReportKey() is the key a language keeps in the audit's JSON report, so the existing
   Spanish/French report stays exactly as it was and a new language reports under its own code. */
const { readFile } = require("./harness-helpers");
const vm = require("vm");

/* The report key each language has always used in the audit's JSON output. A language without an
   entry reports under its own language code, so a new language is visible everywhere in the report
   without editing every gate. */
const REPORT_KEYS = Object.freeze({ es: "spanish", fr: "french" });

/* The field names the shipped classification data uses for those languages. A language without an
   entry declares its statuses through the language-keyed `statuses` object instead. */
const STATUS_FIELDS = Object.freeze({ es: "spanishStatus", fr: "frenchStatus" });

function loadUiApi() {
  const context = {
    window: {},
    console,
    document: { addEventListener() {} },
    localStorage: { getItem: () => null, setItem() {} }
  };
  vm.runInNewContext(readFile("shared/sao-i18n.js"), context, { filename: "shared/sao-i18n.js" });
  const api = context.window.SAOI18n;
  if (!api) throw new Error("shared/sao-i18n.js did not expose SAOI18n");
  return api;
}

function loadContentRegistry() {
  const context = { window: {}, console };
  vm.runInNewContext(readFile("shared/sao-content-translations.js"), context, {
    filename: "shared/sao-content-translations.js"
  });
  const registry = context.window.SAOContentTranslations;
  if (!registry) throw new Error("shared/sao-content-translations.js did not expose SAOContentTranslations");
  return registry;
}

let cachedUiApi = null;
function uiApi() {
  if (!cachedUiApi) cachedUiApi = loadUiApi();
  return cachedUiApi;
}

let cachedContentRegistry = null;
function contentRegistry() {
  if (!cachedContentRegistry) cachedContentRegistry = loadContentRegistry();
  return cachedContentRegistry;
}

function sourceLanguage() {
  const value = uiApi().DEFAULT_LANGUAGE;
  if (typeof value !== "string" || !value.trim()) {
    throw new Error("shared/sao-i18n.js did not expose DEFAULT_LANGUAGE");
  }
  return value;
}

function uiLanguages() {
  const list = uiApi().SUPPORTED_LANGUAGES;
  if (!Array.isArray(list) || !list.length) {
    throw new Error("shared/sao-i18n.js did not expose SUPPORTED_LANGUAGES");
  }
  /* Array.from, not slice(): the list comes out of a VM context, and the copy has to belong to this
     realm so callers can compare it with deepStrictEqual. */
  return Array.from(list);
}

function translatedUiLanguages() {
  const source = sourceLanguage();
  return uiLanguages().filter((language) => language !== source);
}

function contentLanguages() {
  const list = contentRegistry().TRANSLATION_SLOT_LANGUAGES;
  if (!Array.isArray(list) || !list.length) {
    throw new Error("shared/sao-content-translations.js did not expose TRANSLATION_SLOT_LANGUAGES");
  }
  /* Array.from, not slice(): see uiLanguages() for why the copy must belong to this realm. */
  return Array.from(list);
}

function registryLanguages() {
  return [sourceLanguage(), ...contentLanguages()];
}

/* The content languages whose glossary translations are still being written. Italian is the one being
   translated now: an entry it has no value for yet falls back to the English source text, so the audit
   reports that backlog instead of failing, and the content tests that pin "every content language has
   a translation for this record" iterate translatedContentLanguages() rather than every slot.
   Spanish and French are complete and are never in this list. */
const TRANSLATION_BACKLOG_LANGUAGES = Object.freeze(["it"]);

function translationBacklogLanguages() {
  return contentLanguages().filter((language) => TRANSLATION_BACKLOG_LANGUAGES.includes(language));
}

/* The content languages that are not still being translated: the ones whose content has to be complete
   for every record the content tests check. */
function translatedContentLanguages() {
  return contentLanguages().filter((language) => !TRANSLATION_BACKLOG_LANGUAGES.includes(language));
}

function classificationReportKey(language) {
  return REPORT_KEYS[language] || language;
}

function classificationStatusField(language) {
  return STATUS_FIELDS[language];
}

/* The status one classification group declares for one language, or undefined when it declares none
   (the audit reports a group that declares no status for a content language as an invalid entry). */
function classificationStatus(entry, language) {
  if (!entry || typeof entry !== "object") return undefined;
  if (entry.statuses && typeof entry.statuses === "object" && entry.statuses[language] !== undefined) {
    return entry.statuses[language];
  }
  const field = classificationStatusField(language);
  return field ? entry[field] : undefined;
}

module.exports = {
  REPORT_KEYS,
  STATUS_FIELDS,
  TRANSLATION_BACKLOG_LANGUAGES,
  classificationReportKey,
  classificationStatus,
  classificationStatusField,
  contentLanguages,
  registryLanguages,
  sourceLanguage,
  translatedContentLanguages,
  translatedUiLanguages,
  translationBacklogLanguages,
  uiLanguages
};
