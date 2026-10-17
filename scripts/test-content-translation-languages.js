/* Language-resolution regression checks for shared/sao-content-translations.js.

   The curated glossaries in that module are positional [spanish, french] pairs, and the module reads
   them through one adapter: pairValue() turns a pair into a language's value and
   translationsByLanguage() collects a producer's values for every language that has a slot. These
   checks pin that resolution and the behaviour that depends on it:
     - English keeps the English source text;
     - Spanish resolves to the Spanish entry and French to the French entry, by code and by slot;
     - a language with no slot yet (Italian before it is added) or a malformed code is answered with
       the source text, never with Spanish - in the lookups and in the pair reader;
     - the numeric slot form of translateEquivalentLabel() keeps working for existing callers;
     - both register() forms (positional and language-keyed) write the same dictionaries, and a
       language that has no dictionary is never created;
     - every producer registers the same Spanish and French values it registered before the pairs were
       read by language code (the expected values are that pre-refactor behaviour).
   The assertions use values the shipped glossaries already hold; no translation content is invented
   or checked here (that is the localization audit's job). */
const assert = require("node:assert/strict");
const { loadScript } = require("./harness-helpers");

function loadRegistry() {
  const context = { window: {}, console };
  context.window = context;
  loadScript("shared/sao-content-translations.js", context);
  return context.window.SAOContentTranslations;
}

function slugify(value) {
  return (
    String(value || "unknown")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "unknown"
  );
}

const registry = loadRegistry();

/* 1. The slot list is the only place the positional list order is written down. */
assert.deepEqual(
  [...registry.TRANSLATION_SLOT_LANGUAGES],
  ["es", "fr", "it"],
  "the positional list order is Spanish, then French, then Italian"
);
assert.equal(registry.translationSlot("es"), 0, "Spanish is slot 0");
assert.equal(registry.translationSlot("fr"), 1, "French is slot 1");
assert.equal(registry.translationSlot("it"), 2, "Italian is slot 2");
assert.equal(registry.translationSlot("ES"), 0, "a language code resolves case-insensitively");
assert.equal(registry.translationSlot(0), 0, "a numeric slot resolves to itself");
assert.equal(registry.translationSlot(1), 1, "a numeric slot resolves to itself");
assert.equal(registry.translationSlot(2), 2, "a numeric slot resolves to itself");
for (const language of ["en", "de", "es-ES", "", "   ", null, undefined, 3, -1, 1.5]) {
  assert.equal(registry.translationSlot(language), -1, `${JSON.stringify(language)} has no translation slot`);
}

/* 2. English is the source text: every lookup returns the value it was given. */
for (const value of ["Curved Bow", "Tower of Kobold", "Sylvan Bark", "Labyrinth", "Mana", "Monica"]) {
  for (const [name, translate] of [
    ["translateKnownTerms", registry.translateKnownTerms],
    ["translateEquivalentProse", registry.translateEquivalentProse],
    ["translateEquivalentLabel", registry.translateEquivalentLabel]
  ]) {
    assert.equal(translate(value, "en"), value, `${name} keeps "${value}" as the English source text`);
  }
}

/* 3. Spanish and French each resolve to their own slot, by code and by the numeric slot. */
for (const value of ["Curved Bow", "Labyrinth", "Monica", "Mana"]) {
  assert.equal(
    registry.translateEquivalentLabel(value, "es"),
    registry.translateEquivalentLabel(value, 0),
    `the Spanish code and slot 0 agree for "${value}"`
  );
  assert.equal(
    registry.translateEquivalentLabel(value, "fr"),
    registry.translateEquivalentLabel(value, 1),
    `the French code and slot 1 agree for "${value}"`
  );
}
assert.equal(registry.translateEquivalentLabel("Labyrinth", "es"), "Laberinto", "Spanish label entry");
assert.equal(registry.translateEquivalentLabel("Labyrinth", "fr"), "Labyrinthe", "French label entry");
assert.equal(registry.translateEquivalentLabel("Monica", "es"), "Mónica", "Spanish proper-name label");
assert.equal(registry.translateEquivalentLabel("Monica", "fr"), "Monica", "French proper-name label");
assert.equal(registry.translateKnownTerms("Curved Bow", "es"), "Arco curvo", "Spanish equipment term");
assert.equal(registry.translateKnownTerms("Curved Bow", "fr"), "Arc recourbé", "French equipment term");
assert.equal(
  registry.translateKnownTerms("Curved Bow", "FR"),
  "Arc recourbé",
  "an upper-case French code resolves to French, never to Spanish"
);

/* 4. A language with no slot is never answered with Spanish, and Italian - which has a slot - answers
      with its own value where a glossary carries one and with the source text where it does not. */
for (const language of ["de", "pt-BR", "en-GB", "", null, undefined, 3, -1]) {
  assert.equal(
    registry.translateKnownTerms("Curved Bow", language),
    "Curved Bow",
    `translateKnownTerms uses the source text for ${JSON.stringify(language)}`
  );
  assert.equal(
    registry.translateEquivalentProse("Curved Bow", language),
    "Curved Bow",
    `translateEquivalentProse uses the source text for ${JSON.stringify(language)}`
  );
  assert.equal(
    registry.translateEquivalentLabel("Labyrinth", language),
    "Labyrinth",
    `translateEquivalentLabel uses the source text for ${JSON.stringify(language)}`
  );
}
/* Italian answers from its own glossary rather than falling through to Spanish. A cognate that happens
   to match Spanish (Curved Bow is "Arco curvo" in both languages) is not evidence of a fall-through,
   so the check uses a term whose Italian wording differs from both the source text and the Spanish
   translation. */
assert.notEqual(
  registry.translateKnownTerms("Dilapidated Dagger", "it"),
  registry.translateKnownTerms("Dilapidated Dagger", "es"),
  "Italian is not silently answered in Spanish"
);
assert.equal(
  registry.translateKnownTerms("Dilapidated Dagger", "it"),
  "Pugnale fatiscente",
  "Italian resolves its own equipment wording"
);
assert.equal(
  registry.translateEquivalentLabel("Labyrinth", "it"),
  "Labirinto",
  "Italian resolves to its own label where the glossary carries one"
);
assert.equal(
  registry.translateKnownTerms("Town of Beginnings", "it"),
  "Città degli Inizi",
  "Italian resolves to its own location name where the glossary carries one"
);
/* The Beta equipment the Compendium renders carries curated Italian wording, and the render check
   compares the page against exactly these glossary values: the item name, its set and its statistics
   all resolve through the glossary rather than falling back to English. */
assert.equal(
  registry.translateKnownTerms("Thief's Bracelet", "it"),
  "Bracciale del ladro",
  "Italian resolves the Thief's Bracelet name"
);
assert.equal(registry.translateKnownTerms("Thief Set", "it"), "Set del ladro", "Italian resolves the Thief Set name");
assert.equal(
  registry.translateKnownTerms("Amethyst Bracelet", "it"),
  "Bracciale di ametista",
  "Italian resolves the Amethyst Bracelet name"
);
assert.equal(
  registry.translateKnownTerms("Amethyst Set", "it"),
  "Set di ametista",
  "Italian resolves the Amethyst Set name"
);
assert.equal(
  registry.translateKnownTerms("Health Regeneration", "it"),
  "Rigenerazione della salute",
  "Italian resolves the equipment statistic wording"
);
assert.equal(
  registry.translateEquivalentProse("+1.5/s Health Regeneration", "it"),
  "+1.5/s di rigenerazione della salute",
  "Italian resolves the rendered set bonus value"
);
assert.equal(
  registry.translateKnownTerms("2 Piece Set Bonus", "it"),
  "Bonus set da 2 pezzi",
  "Italian resolves the Occult set-tier label"
);
assert.equal(
  registry.translateKnownTerms("No Such Curated Term 12345", "it"),
  "No Such Curated Term 12345",
  "Italian keeps the source text for a term no glossary carries yet"
);

/* 5. Both register() forms write the same dictionaries, and no language dictionary is invented. */
const positionalKey = "probe.languages.positional";
registry.register(positionalKey, "English Value", "Valor Espanol", "Valeur Francaise");
assert.equal(registry.en[positionalKey], "English Value", "the positional form writes English");
assert.equal(registry.es[positionalKey], "Valor Espanol", "the positional form writes Spanish");
assert.equal(registry.fr[positionalKey], "Valeur Francaise", "the positional form writes French");
assert.equal(
  registry.explicitCounterparts.es.has(positionalKey),
  true,
  "the positional form records the Spanish counterpart"
);
assert.equal(
  registry.explicitCounterparts.fr.has(positionalKey),
  true,
  "the positional form records the French counterpart"
);

const keyedKey = "probe.languages.keyed";
registry.register(keyedKey, "English Value", { es: "Valor Espanol", fr: "Valeur Francaise" });
assert.equal(registry.en[keyedKey], "English Value", "the keyed form writes English");
assert.equal(registry.es[keyedKey], "Valor Espanol", "the keyed form writes Spanish");
assert.equal(registry.fr[keyedKey], "Valeur Francaise", "the keyed form writes French");
assert.equal(
  registry.explicitCounterparts.es.has(keyedKey),
  true,
  "the keyed form records the Spanish counterpart"
);
assert.equal(
  registry.explicitCounterparts.fr.has(keyedKey),
  true,
  "the keyed form records the French counterpart"
);

const partialKey = "probe.languages.partial";
registry.register(partialKey, "English Only");
assert.equal(registry.en[partialKey], "English Only", "an omitted language still registers English");
assert.equal(registry.es[partialKey], undefined, "an omitted language is not registered in Spanish");
assert.equal(registry.fr[partialKey], undefined, "an omitted language is not registered in French");
assert.equal(registry.explicitCounterparts.es.has(partialKey), false, "no Spanish counterpart is recorded");
assert.equal(registry.explicitCounterparts.fr.has(partialKey), false, "no French counterpart is recorded");

/* A keyed form that names a language with a dictionary writes it; a code the registry has no slot for
   is ignored rather than folded into another language, and no dictionary is invented for it. */
const keyedItalianKey = "probe.languages.italian";
registry.register(keyedItalianKey, "English Value", { es: "Valor Espanol", it: "Valore Italiano" });
assert.equal(registry.en[keyedItalianKey], "English Value", "the untranslated key still registers English");
assert.equal(registry.es[keyedItalianKey], "Valor Espanol", "the keyed form writes the languages it has");
assert.equal(registry.it[keyedItalianKey], "Valore Italiano", "the keyed form writes Italian");
assert.equal(
  registry.explicitCounterparts.it.has(keyedItalianKey),
  true,
  "the keyed form records the Italian counterpart"
);

const unknownLanguageKey = "probe.languages.unknown";
registry.register(unknownLanguageKey, "English Value", { es: "Valor Espanol", de: "Deutscher Wert" });
assert.equal(registry.de, undefined, "a language with no slot is never materialised as a dictionary");
assert.equal(registry.explicitCounterparts.de, undefined, "a language with no slot gets no counterpart set");

/* 6. The producers that still call register() positionally keep working. */
registry.registerEquipmentEntry(
  { id: "probe-equipment", name: "Curved Bow", craftingLocation: "Equipment Merchant" },
  slugify
);
assert.equal(registry.en["equipment.probe-equipment.name"], "Curved Bow", "equipment English name");
assert.equal(registry.es["equipment.probe-equipment.name"], "Arco curvo", "equipment Spanish name");
assert.equal(registry.fr["equipment.probe-equipment.name"], "Arc recourbé", "equipment French name");
assert.equal(
  registry.es["equipment.probe-equipment.craftingLocation"],
  "Mercader de equipo",
  "equipment Spanish crafting location"
);
assert.equal(
  registry.fr["equipment.probe-equipment.craftingLocation"],
  "Marchand d'équipement",
  "equipment French crafting location"
);

registry.registerMapMarker("probe-marker-language", { title: "Labyrinth", type: "Biome" }, "probe");
assert.equal(registry.en["probe.probe-marker-language.title"], "Labyrinth", "marker English title");
assert.equal(registry.es["probe.probe-marker-language.title"], "Laberinto", "marker Spanish title");
assert.equal(registry.fr["probe.probe-marker-language.title"], "Labyrinthe", "marker French title");
assert.equal(registry.es["probe.probe-marker-language.type"], "Bioma", "marker Spanish type");
assert.equal(registry.fr["probe.probe-marker-language.type"], "Biome", "marker French type");

/* 7. Canonical names, ids and seeded registry data are untouched by the refactor. */
assert.equal(registry.en["equipment.curved-bow.name"], "Curved Bow", "seeded canonical English name");
assert.equal(registry.es["equipment.curved-bow.name"], "Arco curvo", "seeded canonical Spanish name");
assert.equal(registry.fr["equipment.curved-bow.name"], "Arc recourbé", "seeded canonical French name");
assert.equal(registry.en["bestiary.mob.corrupted-boar"], "Corrupted Boar", "seeded canonical mob name");
assert.equal(registry.es["bestiary.mob.corrupted-boar"], "Jabalí corrupto", "seeded mob Spanish name");
assert.equal(registry.fr["bestiary.mob.corrupted-boar"], "Sanglier corrompu", "seeded mob French name");
assert.equal(registry.en["equipment.curved-bow.resource.col"], "Col", "canonical currency name is unchanged");

/* Registering a canonical entry never rewrites its canonical English name or invents an id key. */
registry.registerEquipmentEntry({ id: "curved-bow", name: "Curved Bow" }, slugify);
assert.equal(
  registry.en["equipment.curved-bow.name"],
  "Curved Bow",
  "the canonical English name survives registration"
);
assert.equal(registry.en["equipment.curved-bow"], undefined, "registration does not invent a bare id key");

/* 8. The slot list records this file's positional array layout; it must never become a second list
      of the languages the site supports. shared/sao-i18n.js stays the only source for that. */
const uiContext = {
  window: {},
  console,
  document: { addEventListener() {} },
  localStorage: { getItem: () => null, setItem() {} }
};
uiContext.window = uiContext;
loadScript("shared/sao-i18n.js", uiContext);
const supportedLanguages = uiContext.window.SAOI18n.SUPPORTED_LANGUAGES;
for (const language of registry.TRANSLATION_SLOT_LANGUAGES) {
  assert.equal(
    supportedLanguages.includes(language),
    true,
    `${language} has a translation slot and is also a supported site language`
  );
}
assert.equal(
  supportedLanguages.includes("en"),
  true,
  "English stays a supported language: it is the language the source text is written in"
);

/* 9. The positional-pair reader: the one place that turns [spanish, french] into a language's value.
      Everything else - every producer and every registrar - goes through it, so no code has to know
      that slot 0 is Spanish, and a language with no slot reads no value instead of another language's
      text. */
const samplePair = ["Valor Espanol", "Valeur Francaise"];
assert.equal(registry.pairValue(samplePair, "es"), "Valor Espanol", "slot 0 is read as Spanish by code");
assert.equal(registry.pairValue(samplePair, "fr"), "Valeur Francaise", "slot 1 is read as French by code");
for (const language of ["en", "it", "de", "xx", ""]) {
  assert.equal(
    registry.pairValue(samplePair, language),
    undefined,
    `${JSON.stringify(language)} reads no value out of a positional pair`
  );
}
assert.equal(registry.pairValue(undefined, "es"), undefined, "a missing pair reads no value");

/* 10. The adapter producers register through: it asks exactly the languages that have a slot, keeps
       their values, and never invents a language or hands one language another's text. */
assert.deepEqual(
  Object.keys(registry.translationsByLanguage((language) => `value:${language}`)),
  [...registry.TRANSLATION_SLOT_LANGUAGES],
  "the adapter asks every slot language, in slot order"
);
const partialValues = registry.translationsByLanguage((language) =>
  language === "es" ? "only Spanish" : undefined
);
assert.deepEqual(
  Object.keys(partialValues),
  ["es"],
  "a language the caller has no value for is left out instead of being given another language's text"
);
assert.equal(partialValues.es, "only Spanish", "the value the caller gave is kept");
assert.equal(
  Object.prototype.hasOwnProperty.call(partialValues, "fr"),
  false,
  "no key is written for a language the caller gave no value for"
);
assert.equal(
  Object.keys(registry.translationsByLanguage((language) => `value:${language}`)).includes("de"),
  false,
  "the adapter never asks for a language without a slot"
);
assert.equal(
  Object.keys(registry.translationsByLanguage((language) => `value:${language}`)).includes("it"),
  true,
  "the adapter asks for Italian now that it has a slot"
);
assert.equal(typeof registry.pairValue, "function", "the pair reader is part of the module's surface");
assert.equal(
  typeof registry.translationsByLanguage,
  "function",
  "the per-language value builder is part of the module's surface"
);

/* 11. Every producer still writes the Spanish and French values it wrote before the pairs were read
       by language code. The expected values are the pre-refactor behaviour for these inputs, so a
       producer that changes what it registers fails here. */
function assertProducerValues(label, key, expected) {
  assert.equal(registry.en[key], expected.en, `${label}: English source text`);
  assert.equal(registry.es[key], expected.es, `${label}: Spanish value`);
  assert.equal(registry.fr[key], expected.fr, `${label}: French value`);
}

registry.translateEquipmentTerm("probe.pairs.term", "Curved Bow");
assertProducerValues("translateEquipmentTerm", "probe.pairs.term", {
  en: "Curved Bow",
  es: "Arco curvo",
  fr: "Arc recourbé"
});

registry.registerCommandEntry(
  { usage: "Send money to another player", example: "/pay <player> <amount>" },
  "probe-pairs-command"
);
assertProducerValues("registerCommandEntry usage", "command.probe-pairs-command.usage", {
  en: "Send money to another player",
  es: "Envía dinero a otro jugador",
  fr: "Envoyez de l'argent à un autre joueur"
});
assertProducerValues("registerCommandEntry example", "command.probe-pairs-command.example", {
  en: "/pay <player> <amount>",
  es: "/pay <player> <amount>",
  fr: "/pay <player> <amount>"
});

registry.registerCharacterBuildNode({
  id: "probe-pairs-node",
  name: "Ranger's Marked Shot",
  description: "Living Grove Sanctuary"
});
assertProducerValues("registerCharacterBuildNode name", "characterBuild.skill.probe-pairs-node.name", {
  en: "Ranger's Marked Shot",
  es: "Del explorador Marcado Disparo",
  fr: "De l'éclaireur Marqué Tir"
});
assertProducerValues(
  "registerCharacterBuildNode description",
  "characterBuild.skill.probe-pairs-node.description",
  {
    en: "Living Grove Sanctuary",
    es: "Viviente Arboleda Santuario",
    fr: "Vivant Bosquet Sanctuaire"
  }
);

registry.registerEquipmentEntry(
  {
    id: "probe-pairs-equipment",
    name: "Curved Bow",
    craftingLocation: "Equipment Merchant",
    stats: { "Critical Hit Chance": "5%" }
  },
  slugify
);
assertProducerValues("registerEquipmentEntry name", "equipment.probe-pairs-equipment.name", {
  en: "Curved Bow",
  es: "Arco curvo",
  fr: "Arc recourbé"
});
assertProducerValues(
  "registerEquipmentEntry craftingLocation",
  "equipment.probe-pairs-equipment.craftingLocation",
  {
    en: "Equipment Merchant",
    es: "Mercader de equipo",
    fr: "Marchand d'équipement"
  }
);
assertProducerValues(
  "registerEquipmentEntry stat",
  "equipment.probe-pairs-equipment.stat.critical-hit-chance",
  {
    en: "Critical Hit Chance",
    es: "Probabilidad de golpe crítico",
    fr: "Chances de coup critique"
  }
);

registry.registerQuestEntry(
  {
    id: "probe-pairs-quest",
    npcName: "Emilie",
    city: "Town of Beginnings",
    questName: "My First Weapon",
    requirements: "Boar Hide"
  },
  slugify
);
assertProducerValues("registerQuestEntry npcName", "quest.probe-pairs-quest.npcName", {
  en: "Emilie",
  es: "Emilie",
  fr: "Émilie"
});
assertProducerValues("registerQuestEntry city", "quest.probe-pairs-quest.city", {
  en: "Town of Beginnings",
  es: "Ciudad de los Comienzos",
  fr: "Ville des Commencements"
});
assertProducerValues("registerQuestEntry questName", "quest.probe-pairs-quest.questName", {
  en: "My First Weapon",
  es: "My First Weapon",
  fr: "My First Weapon"
});
assertProducerValues("registerQuestEntry requirements", "quest.probe-pairs-quest.requirements", {
  en: "Boar Hide",
  es: "Piel de jabalí",
  fr: "Peau de sanglier"
});

registry.registerMapMarker("probe-pairs-marker", { title: "Labyrinth", type: "Biome" }, "probe");
assertProducerValues("registerMapMarker title", "probe.probe-pairs-marker.title", {
  en: "Labyrinth",
  es: "Laberinto",
  fr: "Labyrinthe"
});
assertProducerValues("registerMapMarker type", "probe.probe-pairs-marker.type", {
  en: "Biome",
  es: "Bioma",
  fr: "Biome"
});

registry.registerMapMobArea({ id: "probe-pairs-area", title: "Millennial Baobab" }, "probe");
assertProducerValues("registerMapMobArea title", "probe.mob-area.probe-pairs-area.title", {
  en: "Millennial Baobab",
  es: "Baobab milenario",
  fr: "Baobab millénaire"
});

/* 12. A key that already holds a value for a language keeps it: the pages register the same key more
       than once (a map marker per floor, an equipment entry per dataset) and must never overwrite an
       existing translation. */
const existingMarkerKey = "probe.probe-pairs-existing.title";
registry.es[existingMarkerKey] = "Zona existente";
registry.fr[existingMarkerKey] = "Zone existante";
registry.registerMapMarker("probe-pairs-existing", { title: "Millennial Baobab" }, "probe");
assert.equal(registry.es[existingMarkerKey], "Zona existente", "an existing Spanish marker value is kept");
assert.equal(registry.fr[existingMarkerKey], "Zone existante", "an existing French marker value is kept");

const existingEquipmentKey = "equipment.probe-pairs-existing.name";
registry.es[existingEquipmentKey] = "Arco existente";
registry.fr[existingEquipmentKey] = "Arc existant";
registry.registerEquipmentEntry({ id: "probe-pairs-existing", name: "Curved Bow" }, slugify);
assert.equal(
  registry.es[existingEquipmentKey],
  "Arco existente",
  "an existing Spanish equipment value is kept"
);
assert.equal(registry.fr[existingEquipmentKey], "Arc existant", "an existing French equipment value is kept");

/* 13. The producers only ever write the languages the slot list declares, and the counterpart sets
       cover exactly those. */
assert.deepEqual(
  Object.keys(registry.explicitCounterparts).sort(),
  [...registry.TRANSLATION_SLOT_LANGUAGES].sort(),
  "the counterpart sets cover exactly the slot languages"
);
assert.deepEqual(
  [...registry.TRANSLATION_SLOT_LANGUAGES],
  ["es", "fr", "it"],
  "the slot list is Spanish, French and Italian"
);

console.log(
  JSON.stringify(
    {
      slotLanguages: [...registry.TRANSLATION_SLOT_LANGUAGES],
      checks: [
        "slot-resolution",
        "english-source-text",
        "spanish-and-french-slots",
        "numeric-label-compatibility",
        "unknown-language-fallback",
        "register-positional-form",
        "register-language-keyed-form",
        "producer-registrations",
        "canonical-data-unchanged",
        "pair-reader-by-language-code",
        "per-language-value-adapter",
        "producer-values-match-baseline",
        "existing-translations-kept",
        "no-other-language-dictionary"
      ],
      status: "passed"
    },
    null,
    2
  )
);
console.log("Content translation language resolution checks passed.");





