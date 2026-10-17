/* Regenerates the English fallback table inside shared/sao-argo.js from the `argo.*` values of the
 * shared English dictionary. Argo's pages render the dictionaries in shared/sao-i18n.js; the table in
 * the module is only the fallback for a page where SAOI18n is unavailable, and keeping it generated
 * means it can never drift from the English copy the pages actually show.
 *
 * Run it after editing the English Argo strings in shared/sao-i18n.js:
 *
 *   node scripts/generate-argo-fallbacks.js
 */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const i18nPath = path.join(root, "shared", "sao-i18n.js");
const argoPath = path.join(root, "shared", "sao-argo.js");

const BEGIN_MARKER = "/* BEGIN ARGO ENGLISH FALLBACKS */";
const END_MARKER = "/* END ARGO ENGLISH FALLBACKS */";
const BLOCK_START = "  /* English defaults for every string this module shows.";

function loadTranslations() {
  const source = fs
    .readFileSync(i18nPath, "utf8")
    .replace("})(window);", "window.__SAOTranslations = translations;})(window);");
  const context = vm.createContext({
    console,
    window: {},
    document: { addEventListener() {} },
    localStorage: { getItem: () => null, setItem() {} }
  });
  vm.runInNewContext(source, context, { filename: "shared/sao-i18n.js" });
  return context.window.__SAOTranslations || {};
}

function flatten(value, prefix = "", output = {}) {
  for (const [key, child] of Object.entries(value || {})) {
    const nextKey = prefix ? `${prefix}.${key}` : key;
    if (child && typeof child === "object" && !Array.isArray(child)) flatten(child, nextKey, output);
    else output[nextKey] = child;
  }
  return output;
}

/* Groups the keys so the generated table reads like the dialogue it mirrors (chrome, greetings,
   lead-ins per category, notes, outcomes, kinds). */
function groupOf(key) {
  const parts = key.split(".");
  if (parts.length === 2) return "argo.chrome";
  return parts.length > 3 ? parts.slice(0, 3).join(".") : parts.slice(0, 2).join(".");
}

function buildBlock(english) {
  const keys = Object.keys(english).filter((key) => key.startsWith("argo."));
  if (!keys.length) throw new Error("no argo.* keys found in the English dictionary");
  const groups = new Map();
  for (const key of keys) {
    const group = groupOf(key);
    if (!groups.has(group)) groups.set(group, []);
    groups.get(group).push(key);
  }
  const lines = [`    ${BEGIN_MARKER}`];
  let count = 0;
  for (const [group, groupKeys] of groups) {
    lines.push(`    /* ${group} */`);
    for (const key of groupKeys) {
      count += 1;
      lines.push(`    ${JSON.stringify(key)}: ${JSON.stringify(english[key])},`);
    }
  }
  lines.push(`    ${END_MARKER}`);
  return { block: lines.join("\n"), count };
}

function main() {
  const english = flatten(loadTranslations().en);
  const { block, count } = buildBlock(english);
  const source = fs.readFileSync(argoPath, "utf8");
  const start = source.indexOf(BLOCK_START);
  if (start < 0) throw new Error("the FALLBACK_TEXT comment was not found in shared/sao-argo.js");
  /* Line endings are whatever the checkout uses, so the closing line is matched loosely. */
  const closing = /\r?\n {2}\}\);\r?\n/.exec(source.slice(start));
  if (!closing) throw new Error("the end of FALLBACK_TEXT was not found in shared/sao-argo.js");
  const end = start + closing.index + closing[0].length;
  const replacement = [
    "  /* English defaults for every string this module shows. The entries between the markers are",
    "     generated from the `argo.*` values of the shared English dictionary (shared/sao-i18n.js), which",
    "     is what the pages actually render; this table is the fallback for a page where SAOI18n is",
    "     unavailable, and the reference list of the keys this module can render. Regenerate it with",
    "     `node scripts/generate-argo-fallbacks.js` after editing the English dictionary. */",
    "  const FALLBACK_TEXT = Object.freeze({",
    block,
    "  });",
    ""
  ].join("\n");
  const updated = `${source.slice(0, start)}${replacement}${source.slice(end)}`;
  return { source: updated, count };
}

/* The repository's own Prettier settings are applied to the generated file, so running this script
   twice in a row produces byte-identical output and never fights the formatting check. The settings
   are read directly, because that is what the command-line check uses. */
function prettierOptions() {
  try {
    return JSON.parse(fs.readFileSync(path.join(root, ".prettierrc.json"), "utf8"));
  } catch (_error) {
    return {};
  }
}

async function formatLikePrettier(source) {
  try {
    const prettier = require("prettier");
    return await prettier.format(source, { ...prettierOptions(), filepath: argoPath });
  } catch (error) {
    console.warn(`Prettier could not be loaded (${error.message}); the file was written unformatted.`);
    return source;
  }
}

async function run() {
  const { source, count } = main();
  fs.writeFileSync(argoPath, await formatLikePrettier(source));
  console.log(`Generated ${count} English fallback strings into shared/sao-argo.js`);
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
