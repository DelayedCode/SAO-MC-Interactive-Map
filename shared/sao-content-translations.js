window.SAOContentTranslations = {
  en: {
    "bestiary.mob.corrupted-boar": "Corrupted Boar",
    "bestiary.mob.corrupted-pumba": "Corrupted Pumba",
    "bestiary.mob.sinister-white-wolf": "Sinister White Wolf",
    "bestiary.mob.sinister-black-wolf": "Sinister Black Wolf",
    "bestiary.mob.skeleton-swordsman": "Skeleton Swordsman",
    "bestiary.item.corrupted-crystal": "Corrupted Crystal",
    "bestiary.item.boar-hide": "Boar Hide",
    "bestiary.item.boar-meat": "Boar Meat",
    "bestiary.item.wolf-fur": "Wolf Fur",
    "bestiary.item.wolf-fangs": "Wolf Fangs",
    "bestiary.item.n-a": "N/A",
    "equipment.curved-bow.name": "Curved Bow",
    "equipment.curved-bow.description": "A rudimentary bow used by early shooters.",
    "equipment.curved-bow.craftingLocation": "Equipment Merchant",
    "equipment.curved-bow.resource.col": "Col"
  },
  es: {
    "bestiary.mob.corrupted-boar": "Jabalí corrupto",
    "bestiary.mob.corrupted-pumba": "Pumba corrupto",
    "bestiary.mob.sinister-white-wolf": "Lobo blanco siniestro",
    "bestiary.mob.sinister-black-wolf": "Lobo negro siniestro",
    "bestiary.mob.skeleton-swordsman": "Espadachín esqueleto",
    "bestiary.item.corrupted-crystal": "Cristal corrupto",
    "bestiary.item.boar-hide": "Piel de jabalí",
    "bestiary.item.boar-meat": "Carne de jabalí",
    "bestiary.item.wolf-fur": "Piel de lobo",
    "bestiary.item.wolf-fangs": "Colmillos de lobo",
    "bestiary.item.n-a": "N/D",
    "equipment.curved-bow.name": "Arco curvo",
    "equipment.curved-bow.description": "Un arco rudimentario utilizado por los primeros tiradores.",
    "equipment.curved-bow.craftingLocation": "Mercader de equipo",
    "equipment.curved-bow.resource.col": "Col"
  },
  fr: {
    "bestiary.mob.corrupted-boar": "Sanglier corrompu",
    "bestiary.mob.corrupted-pumba": "Pumba corrompu",
    "bestiary.mob.sinister-white-wolf": "Loup blanc sinistre",
    "bestiary.mob.sinister-black-wolf": "Loup noir sinistre",
    "bestiary.mob.skeleton-swordsman": "Épéiste squelette",
    "bestiary.item.corrupted-crystal": "Cristal corrompu",
    "bestiary.item.boar-hide": "Peau de sanglier",
    "bestiary.item.boar-meat": "Viande de sanglier",
    "bestiary.item.wolf-fur": "Fourrure de loup",
    "bestiary.item.wolf-fangs": "Crocs de loup",
    "bestiary.item.n-a": "N/D",
    "equipment.curved-bow.name": "Arc recourbé",
    "equipment.curved-bow.description": "Un arc rudimentaire utilisé par les premiers tireurs.",
    "equipment.curved-bow.craftingLocation": "Marchand d'équipement",
    "equipment.curved-bow.resource.col": "Col"
  },
  /* Italian starts empty: every Italian string in this file is either a third element appended to a
     positional glossary entry below or a value a producer registers, so the dictionary exists for
     register() to write into rather than holding seeded data of its own. */
  it: {}
};

/* ------------------------------------------------------------------------------------------------
   Language <-> translation-slot resolution.

   The curated glossaries in this file are positional lists written as [spanish, french, italian]:
   slot 0 is Spanish, slot 1 is French and slot 2 is Italian. TRANSLATION_SLOT_LANGUAGES below is the
   single place that ordering is written down. Every lookup asserts the slot it wants through
   translationSlot() instead of testing `language === "fr"`, so a language this file has no
   translations for can never be silently answered with Spanish. A glossary entry written with fewer
   values than there are slots simply has nothing to say for the missing languages.

   The pair layout is a property of the data, not of the code that reads it: pairValue() is the only
   reader that turns a pair into a language's value, and the producers below register their per-
   language values through translationsByLanguage(), which asks every language in
   TRANSLATION_SLOT_LANGUAGES in turn. Adding a language therefore means adding its slot here and its
   values to the glossaries - no producer has to be edited, and no code has to be told that slot 0 is
   Spanish. The glossaries themselves stay positional because every string in them has to remain
   byte-for-byte as it ships; see the notes on each glossary for the shapes that are intentionally
   retained.

   The site's list of supported languages lives in shared/sao-i18n.js (SUPPORTED_LANGUAGES) and stays
   the only source for the UI. This file also loads on its own in the Node tooling, so it resolves its
   own array layout rather than reading a global the pages happen to have loaded.
   ------------------------------------------------------------------------------------------------ */
const TRANSLATION_SLOT_LANGUAGES = Object.freeze(["es", "fr", "it"]);

/* What translationSlot() returns for English (which is the source text) and for any language this
   file has no translations for. It is a real answer, never a synonym for the Spanish slot. */
const NO_TRANSLATION_SLOT = -1;

/* The slot a language's curated translations live in, or NO_TRANSLATION_SLOT.
   A numeric argument is accepted too, so the historical slot-index callers keep working unchanged. */
function translationSlot(language) {
  if (typeof language === "number") {
    return Number.isInteger(language) && language >= 0 && language < TRANSLATION_SLOT_LANGUAGES.length
      ? language
      : NO_TRANSLATION_SLOT;
  }
  return TRANSLATION_SLOT_LANGUAGES.indexOf(String(language || "").trim().toLowerCase());
}

/* The resolver is part of the module's surface: pages, tests and future translators read it instead
   of writing their own index arithmetic. */
window.SAOContentTranslations.TRANSLATION_SLOT_LANGUAGES = TRANSLATION_SLOT_LANGUAGES;
window.SAOContentTranslations.translationSlot = translationSlot;

/* One positional glossary entry read by language code. This is the only place that turns
   [spanish, french] into a language's value, and it resolves the slot through translationSlot(): a
   language with no slot - English, Italian until its content lands, a malformed code - gets undefined
   rather than another language's text, so a lookup can never fall through to Spanish. */
function pairValue(pair, language) {
  if (!pair) return undefined;
  const slot = translationSlot(language);
  return slot === NO_TRANSLATION_SLOT ? undefined : pair[slot];
}

/* The per-language values for one key, as the language-keyed object register() accepts: `valueFor`
   is asked once for every language that has a translation slot, so a producer registers all
   translated languages without naming any of them, and a language without a slot is never asked and
   never handed another language's value. */
function translationsByLanguage(valueFor) {
  const translations = {};
  TRANSLATION_SLOT_LANGUAGES.forEach((language) => {
    const value = valueFor(language);
    if (value !== undefined) translations[language] = value;
  });
  return translations;
}

/* A positional glossary entry as the language-keyed form, for the registrars at the bottom of the file.
   `source` is the entry's English text: a language whose slot the entry does not carry yet is
   registered with the source text, so every slot language has the key (and the missing translation is
   reported as an English-identical value by the audit instead of vanishing from the registry). */
function pairTranslations(pair, source) {
  return translationsByLanguage((language) => pairValue(pair, language) ?? source);
}

/* Pages that register their own content read these two rather than indexing a pair themselves: the
   Bestiary page registers every language's name for a mob through translationsByLanguage(). */
window.SAOContentTranslations.pairValue = pairValue;
window.SAOContentTranslations.translationsByLanguage = translationsByLanguage;

/* One explicit-counterpart set per language that has a dictionary here, derived from the slot list
   rather than keyed by hand, so a language added to TRANSLATION_SLOT_LANGUAGES (and given a
   dictionary above) is tracked without touching this block. */
window.SAOContentTranslations.explicitCounterparts = {};
TRANSLATION_SLOT_LANGUAGES.forEach((language) => {
  window.SAOContentTranslations.explicitCounterparts[language] = new Set(
    Object.keys(window.SAOContentTranslations[language] || {})
  );
});

window.SAOContentTranslations.register = function registerContentTranslation(key, english, spanish, french) {
  /* Two accepted forms, so the original positional signature keeps working while new code can name
     the language it registers:
       register(key, english, spanish, french)           - positional (argument 3 Spanish, 4 French)
       register(key, english, { es: "...", fr: "..." })  - translations keyed by language code
     A language the caller omits is simply not registered for that language, exactly as an undefined
     positional argument always behaved. A key for a language with no dictionary here (nothing
     translated yet) is ignored rather than written, and never folded into another language. */
  const registry = window.SAOContentTranslations;
  const languageKeyed = spanish !== null && typeof spanish === "object" && !Array.isArray(spanish);
  const translations = languageKeyed ? spanish : { es: spanish, fr: french };
  registry.en[key] = english;
  Object.keys(translations).forEach((language) => {
    const value = translations[language];
    if (value === undefined) return;
    const dictionary = registry[language];
    const counterparts = registry.explicitCounterparts[language];
    if (!dictionary || !counterparts) return;
    dictionary[key] = value;
    counterparts.add(key);
  });
};

/* ------------------------------------------------------------------------------------------------
   Curated glossaries.

   Every glossary below holds one positional list per entry, exactly as it ships: [spanish, french,
   italian], with the Italian value appended last. Those strings must not be reformatted, so the
   lists stay arrays and pairValue() is what reads them by language code. An entry that has no Italian
   value yet simply stops after the French one - the readers treat the missing slot as "nothing to
   say", never as another language's text. mapGlossary (further down) is the one glossary written
   English-first as [english, spanish, french, italian]; its registrar splits the source text off and
   reads the remainder as the same positional list.
   ------------------------------------------------------------------------------------------------ */
const equipmentTerminology = {
  "Curved Bow": ["Arco curvo", "Arc recourbé", "Arco curvo"],
  "Dilapidated Dagger": ["Daga ruinosa", "Dague délabrée", "Pugnale fatiscente"],
  "Wild Grimoire": ["Grimorio salvaje", "Grimoire sauvage", "Grimorio selvaggio"],
  "Junk Shield": ["Escudo de chatarra", "Bouclier de ferraille", "Scudo di scarti"],
  "Mediocre Mage Staff": ["Bastón de mago mediocre", "Bâton de mage médiocre", "Bastone del mago mediocre"],
  "Mediocre Shaman Staff": ["Bastón de chamán mediocre", "Bâton de chaman médiocre", "Bastone dello sciamano mediocre"],
  "Training Dagger": ["Daga de entrenamiento", "Dague d'entraînement", "Pugnale da addestramento"],
  "Training Sword": ["Espada de entrenamiento", "Épée d'entraînement", "Spada da addestramento"],
  "Unbound Grimoire": ["Grimorio desatado", "Grimoire délié", "Grimorio liberato"],
  "Training Bow": ["Arco de entrenamiento", "Arc d'entraînement", "Arco da addestramento"],
  "Training Crossbow": ["Ballesta de entrenamiento", "Arbalète d'entraînement", "Balestra da addestramento"],
  "Training Scythe": ["Guadaña de entrenamiento", "Faux d'entraînement", "Falce da addestramento"],
  "Katana Training": ["Katana de entrenamiento", "Katana d'entraînement", "Katana da addestramento"],
  "Training Magic Staff": ["Bastón mágico de entrenamiento", "Bâton magique d'entraînement", "Bastone magico da addestramento"],
  "Training Lantern": ["Linterna de entrenamiento", "Lanterne d'entraînement", "Lanterna da addestramento"],
  "Training Quiver": ["Carcaj de entrenamiento", "Carquois d'entraînement", "Faretra da addestramento"],
  "Training Buckler": ["Rodela de entrenamiento", "Bouclier d'entraînement", "Brocchiere da addestramento"],
  "Skill Critical Chance": ["Probabilidad de crítico de habilidad", "Chance de critique de compétence", "Probabilità di critico delle abilità"],
  "Critical Chance": ["Probabilidad de crítico", "Chance de critique", "Probabilità di critico"],
  "Guard Durability": ["Durabilidad de guardia", "Durabilité de garde", "Durabilità della guardia"],
  "Double Iron Axe": ["Hacha doble de hierro", "Hache double en fer", "Ascia doppia di ferro"],
  "Pointed Wooden Shield": ["Escudo de madera puntiagudo", "Bouclier en bois pointu", "Scudo di legno appuntito"],
  "Mage Skeleton Staff": ["Bastón de esqueleto mago", "Bâton de squelette mage", "Bastone dello scheletro mago"],
  "Shaman Skeleton Staff": ["Bastón de esqueleto chamán", "Bâton de squelette chaman", "Bastone dello scheletro sciamano"],
  "Magic Sword": ["Espada mágica", "Épée magique", "Spada magica"],
  "Magic Hammer": ["Martillo mágico", "Marteau magique", "Martello magico"],
  "Hunting Bow": ["Arco de caza", "Arc de chasse", "Arco da caccia"],
  "Hunting Crossbow": ["Ballesta de caza", "Arbalète de chasse", "Balestra da caccia"],
  "Powerful Sorcerer Staff": ["Bastón de hechicero poderoso", "Bâton de sorcier puissant", "Bastone dello stregone potente"],
  "Guardian Sword": ["Espada del guardián", "Épée du gardien", "Spada del guardiano"],
  "Heroic Dagger": ["Daga heroica", "Dague héroïque", "Pugnale eroico"],
  "Winter Bow": ["Arco de invierno", "Arc d'hiver", "Arco d'inverno"],
  "Winter Shield": ["Escudo de invierno", "Bouclier d'hiver", "Scudo d'inverno"],
  "Putrid Shield": ["Escudo pútrido", "Bouclier putride", "Scudo putrido"],
  "Royal Halberd": ["Alabarda real", "Hallebarde royale", "Alabarda reale"],
  Curved: ["Curvo", "Recourbé", "Curvo"],
  Dilapidated: ["Ruinoso", "Délabré", "Fatiscente"],
  Wild: ["Salvaje", "Sauvage", "Selvaggio"],
  Junk: ["Chatarra", "Ferraille", "Scarti"],
  Mediocre: ["Mediocre", "Médiocre", "Mediocre"],
  Training: ["Entrenamiento", "Entraînement", "Addestramento"],
  Unbound: ["Desatado", "Délié", "Liberato"],
  Double: ["Doble", "Double", "Doppio"],
  Bestial: ["Bestial", "Bestial", "Bestiale"],
  Intermediate: ["Intermedio", "Intermédiaire", "Intermedio"],
  Iron: ["Hierro", "Fer", "Ferro"],
  Pointed: ["Puntiagudo", "Pointu", "Appuntito"],
  Wooden: ["de madera", "en bois", "di legno"],
  Shield: ["Escudo", "Bouclier", "Scudo"],
  Bow: ["Arco", "Arc", "Arco"],
  Dagger: ["Daga", "Dague", "Pugnale"],
  Sword: ["Espada", "Épée", "Spada"],
  Staff: ["Bastón", "Bâton", "Bastone"],
  Grimoire: ["Grimorio", "Grimoire", "Grimorio"],
  Mage: ["Mago", "Mage", "Mago"],
  Shaman: ["Chamán", "Chaman", "Sciamano"],
  Magic: ["Mágico", "Magique", "Magico"],
  Dark: ["Oscuro", "Sombre", "Oscuro"],
  Hunting: ["Caza", "Chasse", "Caccia"],
  Long: ["Largo", "Long", "Lungo"],
  Powerful: ["Poderoso", "Puissant", "Potente"],
  Sorcerer: ["Hechicero", "Sorcier", "Stregone"],
  Fallen: ["Caído", "Déchu", "Caduto"],
  Forgotten: ["Olvidado", "Oublié", "Dimenticato"],
  Spectral: ["Espectral", "Spectral", "Spettrale"],
  Guardian: ["Guardián", "Gardien", "Guardiano"],
  Heroic: ["Heroico", "Héroïque", "Eroico"],
  Winter: ["Invierno", "Hiver", "Inverno"],
  Putrid: ["Pútrido", "Putride", "Putrido"],
  Royal: ["Real", "Royal", "Reale"],
  Howling: ["Aullante", "Hurlant", "Ululante"],
  Love: ["Amor", "Amour", "Amore"],
  Crossbow: ["Ballesta", "Arbalète", "Balestra"],
  Axe: ["Hacha", "Hache", "Ascia"],
  Hammer: ["Martillo", "Marteau", "Martello"],
  Halberd: ["Alabarda", "Hallebarde", "Alabarda"],
  Scythe: ["Guadaña", "Faux", "Falce"],
  Club: ["Garrote", "Massue", "Clava"],
  Ring: ["Anillo", "Anneau", "Anello"],
  Bracelet: ["Brazalete", "Bracelet", "Bracciale"],
  Glove: ["Guante", "Gant", "Guanto"],
  Amulet: ["Amuleto", "Amulette", "Amuleto"],
  Catalyst: ["Catalizador", "Catalyseur", "Catalizzatore"],
  "Equipment Merchant": ["Mercader de equipo", "Marchand d'équipement", "Mercante di equipaggiamento"],
  "Equipment Blacksmith": ["Herrero de equipo", "Forgeron d'équipement", "Fabbro di equipaggiamento"],
  Weapon: ["Arma", "Arme", "Arma"],
  Weapons: ["Armas", "Armes", "Armi"],
  Damage: ["Daño", "Dégâts", "Danno"],
  "Attack Speed": ["Velocidad de ataque", "Vitesse d'attaque", "Velocità d'attacco"],
  Health: ["Salud", "Santé", "Salute"],
  Mana: ["Maná", "Mana", "Mana"],
  "Mana Regeneration": ["Regeneración de maná", "Régénération de mana", "Rigenerazione del mana"],
  Class: ["Clase", "Classe", "Classe"],
  Range: ["Alcance", "Portée", "Portata"],
  Defense: ["Defensa", "Défense", "Difesa"],
  Rarity: ["Rareza", "Rareté", "Rarità"],
  Common: ["Común", "Commun", "Comune"],
  Uncommon: ["Poco común", "Peu commun", "Non comune"],
  Rare: ["Raro", "Rare", "Raro"],
  Epic: ["Épico", "Épique", "Epico"],
  Legendary: ["Legendario", "Légendaire", "Leggendario"],
  Godlike: ["Divino", "Divin", "Divino"],
  Mythic: ["Mítico", "Mythique", "Mitico"],
  Event: ["Evento", "Événement", "Evento"],
  Limited: ["Limitado", "Limité", "Limitato"],
  Archer: ["Arquero", "Archer", "Arciere"],
  Warrior: ["Guerrero", "Guerrier", "Guerriero"],
  Assassin: ["Asesino", "Assassin", "Assassino"],
  Helmet: ["Casco", "Casque", "Elmo"],
  Helm: ["Casco", "Heaume", "Elmo"],
  Boots: ["Botas", "Bottes", "Stivali"],
  Breastplate: ["Coraza", "Plastron", "Corazza"],
  Leggings: ["Calzas", "Jambières", "Gambali"],
  Gloves: ["Guantes", "Gants", "Guanti"],
  Necklace: ["Collar", "Collier", "Collana"],
  Ore: ["Mineral", "Minerai", "Minerale"],
  Ingot: ["Lingote", "Lingot", "Lingotto"],
  Board: ["Tablón", "Planche", "Tavola"],
  Wood: ["Madera", "Bois", "Legno"],
  Powder: ["Polvo", "Poudre", "Polvere"],
  Thread: ["Hilo", "Fil", "Filo"],
  Fangs: ["Colmillos", "Crocs", "Zanne"],
  Feather: ["Pluma", "Plume", "Piuma"],
  Shell: ["Caparazón", "Carapace", "Guscio"],
  Core: ["Núcleo", "Noyau", "Nucleo"],
  Fragment: ["Fragmento", "Fragment", "Frammento"],
  Shard: ["Fragmento", "Éclat", "Scheggia"],
  Twig: ["Ramita", "Brindille", "Ramoscello"],
  Root: ["Raíz", "Racine", "Radice"],
  Bark: ["Corteza", "Écorce", "Corteccia"],
  Skin: ["Piel", "Peau", "Pelle"],
  Fur: ["Piel", "Fourrure", "Pelliccia"],
  Fabric: ["Tela", "Tissu", "Tessuto"],
  Jelly: ["Gelatina", "Gelée", "Gelatina"],
  Requirements: ["Requisitos", "Conditions", "Requisiti"],
  Resources: ["Recursos", "Ressources", "Risorse"],
  "Bonus Items": ["Objetos adicionales", "Objets bonus", "Oggetti bonus"],
  Kill: ["Mata", "Tuer", "Uccidi"],
  Defeat: ["Derrota", "Vaincre", "Sconfiggi"],
  Find: ["Encuentra", "Trouver", "Trova"],
  Explore: ["Explora", "Explorer", "Esplora"],
  Read: ["Lee", "Lire", "Leggi"],
  "Go to": ["Ve a", "Aller à", "Vai a"],
  Follow: ["Sigue", "Suivre", "Segui"],
  Give: ["Entrega", "Donner", "Consegna"],
  Wait: ["Espera", "Attendre", "Attendi"],
  Recover: ["Recupera", "Récupérer", "Recupera"],
  Forge: ["Forja", "Forger", "Forgia"],
  Coordinates: ["Coordenadas", "Coordonnées", "Coordinate"],
  Gather: ["Reúne", "Récupérez", "Raccogli"],
  Biome: ["Bioma", "Biome", "Bioma"],
  Dungeon: ["Mazmorra", "Donjon", "Dungeon"],
  Boss: ["Jefe", "Boss", "Boss"],
  Quest: ["Misión", "Quête", "Missione"],
  "Side Quest": ["Misión secundaria", "Quête secondaire", "Missione secondaria"],
  Merchant: ["Mercader", "Marchand", "Mercante"],
  Blacksmith: ["Herrero", "Forgeron", "Fabbro"],
  Weaponsmith: ["Herrero de armas", "Forgeron d'armes", "Fabbro di armi"],
  Armorsmith: ["Herrero de armaduras", "Armurier", "Fabbro di armature"],
  Alchemist: ["Alquimista", "Alchimiste", "Alchimista"],
  Lumberjack: ["Leñador", "Bûcheron", "Taglialegna"],
  Farmer: ["Granjero", "Fermier", "Contadino"],
  "Loot Buyer": ["Comprador de botín", "Acheteur de butin", "Acquirente di bottino"],
  "Tool Merchant": ["Mercader de herramientas", "Marchand d'outils", "Mercante di strumenti"],
  Loot: ["Botín", "Butin", "Bottino"],
  Makes: ["Fabrica", "Fabrique", "Produce"],
  "Transforms Resources": ["Transforma recursos", "Transforme les ressources", "Trasforma le risorse"],
  "Buys Loot": ["Compra botín", "Achète du butin", "Compra bottino"],
  Col: ["Col", "Col", "Col"],
  Acacia: ["Acacia", "Acacia", "Acacia"],
  Log: ["Tronco", "Bûche", "Tronco"],
  Twine: ["Cuerda", "Ficelle", "Cordicella"],
  Belt: ["Cinturón", "Ceinture", "Cintura"],
  Fang: ["Colmillo", "Croc", "Zanna"],
  Flower: ["Flor", "Fleur", "Fiore"],
  Seed: ["Semilla", "Graine", "Seme"],
  Sepal: ["Sépalo", "Sépale", "Sepalo"],
  Amethyst: ["Amatista", "Améthyste", "Ametista"],
  Ancient: ["Antiguo", "Ancien", "Antico"],
  Ticket: ["Entrada", "Billet", "Biglietto"],
  Amber: ["Ámbar", "Ambre", "Ambra"],
  Andalousite: ["Andalucita", "Andalousite", "Andalusite"],
  Anthracite: ["Antracita", "Anthracite", "Antracite"],
  Aquatic: ["Acuático", "Aquatique", "Acquatico"],
  Debris: ["Escombros", "Débris", "Detriti"],
  Artifact: ["Artefacto", "Artefact", "Manufatto"],
  "Bandit's": ["de bandido", "de bandit", "del bandito"],
  Gold: ["Oro", "Or", "Oro"],
  Coin: ["Moneda", "Pièce", "Moneta"],
  Basalte: ["Basalto", "Basalte", "Basalto"],
  Repair: ["Reparación", "Réparation", "Riparazione"],
  Kit: ["Kit", "Kit", "Kit"],
  Bauxite: ["Bauxita", "Bauxite", "Bauxite"],
  Minerals: ["Minerales", "Minéraux", "Minerali"],
  Bear: ["Oso", "Ours", "Orso"],
  Fat: ["Grasa", "Graisse", "Grasso"],
  "Beginner's": ["de principiante", "de débutant", "da principiante"],
  Birch: ["Abedul", "Bouleau", "Betulla"],
  Black: ["Negro", "Noir", "Nero"],
  Bone: ["Hueso", "Os", "Osso"],
  Stone: ["Piedra", "Pierre", "Pietra"],
  Carcass: ["Cadáver", "Carcasse", "Carcassa"],
  Lantern: ["Linterna", "Lanterne", "Lanterna"],
  Mandible: ["Mandíbula", "Mandibule", "Mandibola"],
  Venom: ["Veneno", "Venin", "Veleno"],
  Spinel: ["Espinela", "Spinelle", "Spinello"],
  Blank: ["En blanco", "Vierge", "Vuoto"],
  Scroll: ["Pergamino", "Parchemin", "Pergamena"],
  Blue: ["Azul", "Bleu", "Blu"],
  Christmas: ["Navideño", "de Noël", "natalizio"],
  Mittens: ["Manoplas", "Moufles", "Muffole"],
  Dust: ["Polvo", "Poussière", "Polvere"],
  Brown: ["Marrón", "Brun", "Marrone"],
  Eyes: ["Ojos", "Yeux", "Occhi"],
  Bull: ["Toro", "Taureau", "Toro"],
  Horn: ["Cuerno", "Corne", "Corno"],
  Cage: ["Jaula", "Cage", "Gabbia"],
  Key: ["Llave", "Clé", "Chiave"],
  Canvas: ["Lona", "Toile", "Tela"],
  Carapace: ["Caparazón", "Carapace", "Carapace"],
  Cat: ["Gato", "Chat", "Gatto"],
  Lost: ["perdido", "perdu", "perduto"],
  Chocolate: ["Chocolate", "Chocolat", "Cioccolato"],
  Box: ["Caja", "Boîte", "Scatola"],
  Corrupted: ["Corrupto", "Corrompu", "Corrotto"],
  Crystal: ["Cristal", "Cristal", "Cristallo"],
  Mask: ["Máscara", "Masque", "Maschera"],
  Essence: ["Esencia", "Essence", "Essenza"],
  Heart: ["Corazón", "Cœur", "Cuore"],
  Armor: ["Armadura", "Armure", "Armatura"],
  Blood: ["Sangre", "Sang", "Sangue"],
  Eye: ["Ojo", "Œil", "Occhio"],
  Rune: ["Runa", "Rune", "Runa"],
  Potion: ["Poción", "Potion", "Pozione"],
  Happiness: ["Felicidad", "Bonheur", "Felicità"],
  Healing: ["Curación", "Soin", "Cura"],
  Movement: ["Movimiento", "Mouvement", "Movimento"],
  Speed: ["Velocidad", "Vitesse", "Velocità"],
  Chance: ["Probabilidad", "Chance", "Probabilità"],
  Critical: ["Crítico", "Critique", "Critico"],
  Hit: ["Golpe", "Coup", "Colpo"],
  Stamina: ["Resistencia", "Endurance", "Stamina"],
  Regeneration: ["Regeneración", "Régénération", "Rigenerazione"],
  Requirement: ["Requisito", "Prérequis", "Requisito"],
  Spirit: ["Espíritu", "Esprit", "Spirito"],
  Vitality: ["Vitalidad", "Vitalité", "Vitalità"],
  Dexterity: ["Destreza", "Dextérité", "Destrezza"],
  Force: ["Fuerza", "Force", "Forza"],
  Intelligence: ["Inteligencia", "Intelligence", "Intelligenza"],
  Azurite: ["Azurita", "Azurite", "Azurite"],
  Barley: ["Cebada", "Orge", "Orzo"],
  Sugar: ["Azúcar", "Sucre", "Zucchero"],
  Carnelian: ["Cornalina", "Cornaline", "Corniola"],
  Cobalt: ["Cobalto", "Cobalt", "Cobalto"],
  Cooking: ["Cocina", "Cuisine", "Cucina"],
  Recipe: ["Receta", "Recette", "Ricetta"],
  Copper: ["Cobre", "Cuivre", "Rame"],
  Corindon: ["Corindón", "Corindon", "Corindone"],
  Cracked: ["Agrietado", "Fissuré", "Incrinato"],
  Pickaxe: ["Pico", "Pioche", "Piccone"],
  Crown: ["Corona", "Couronne", "Corona"],
  Crumpled: ["Arrugado", "Froissé", "Stropicciato"],
  Notebook: ["Cuaderno", "Carnet", "Quaderno"],
  Cursed: ["Maldito", "Maudit", "Maledetto"],
  Cloth: ["Tela", "Tissu", "Tessuto"],
  Dragon: ["Dragón", "Dragon", "Drago"],
  Egg: ["Huevo", "Œuf", "Uovo"],
  Cocoon: ["Capullo", "Cocon", "Bozzolo"],
  Buff: ["Mejora", "Bonus", "Potenziamento"],
  Fortifier: ["Potenciador", "Renforcement", "Rinforzante"],
  Fierce: ["Feroz", "Féroce", "Feroce"],
  Talisman: ["Talismán", "Talisman", "Talismano"],
  Fir: ["Abeto", "Sapin", "Abete"],
  Fluorite: ["Fluorita", "Fluorite", "Fluorite"],
  Wing: ["Ala", "Aile", "Ala"],
  Fragrant: ["Aromática", "Parfumée", "Profumata"],
  Herb: ["Hierba", "Herbe", "Erba"],
  Garnet: ["Granate", "Grenat", "Granato"],
  Hematite: ["Hematita", "Hématite", "Ematite"],
  Blade: ["Hoja", "Lame", "Lama"],
  Residue: ["Residuo", "Résidu", "Residuo"],
  Honey: ["Miel", "Miel", "Miele"],
  Tunic: ["Túnica", "Tunique", "Tunica"],
  Impure: ["Impuro", "Impur", "Impuro"],
  Onyx: ["Ónice", "Onyx", "Onice"],
  String: ["Cuerda", "Ficelle", "Corda"],
  Jet: ["Azabache", "Jais", "Giaietto"],
  Knowledge: ["Conocimiento", "Connaissance", "Conoscenza"],
  Krampus: ["Krampus", "Krampus", "Krampus"],
  Lavender: ["Lavanda", "Lavande", "Lavanda"],
  Lepidolite: ["Lepidolita", "Lépidolite", "Lepidolite"],
  Lightning: ["Relámpago", "Foudre", "Fulmine"],
  Scale: ["Escama", "Écaille", "Scaglia"],
  Maganese: ["Manganeso", "Manganèse", "Manganese"],
  Robe: ["Túnica", "Robe", "Veste"],
  Sandals: ["Sandalias", "Sandales", "Sandali"],
  Trousers: ["Pantalones", "Pantalon", "Pantaloni"],
  Malachite: ["Malaquita", "Malachite", "Malachite"],
  Medium: ["Mediana", "Moyenne", "Media"],
  Pouch: ["Bolsa", "Bourse", "Borsa"],
  Hoe: ["Azada", "Houe", "Zappa"],
  Midnight: ["Medianoche", "Minuit", "Mezzanotte"],
  Cloak: ["Capa", "Cape", "Mantello"],
  Mist: ["Niebla", "Brume", "Nebbia"],
  Claw: ["Garra", "Griffe", "Artiglio"],
  Tail: ["Cola", "Queue", "Coda"],
  Necromancer: ["Nigromante", "Nécromancien", "Negromante"],
  Necrotic: ["Necrótico", "Nécrotique", "Necrotico"],
  Arch: ["Arco", "Arc", "Arco"],
  Sandwich: ["Sándwich", "Sandwich", "Panino"],
  Ninja: ["Ninja", "Ninja", "Ninja"],
  Occult: ["Oculto", "Occulte", "Occulto"],
  Earrings: ["Pendientes", "Boucles d'oreilles", "Orecchini"],
  Hood: ["Capucha", "Capuche", "Cappuccio"],
  Hourglass: ["Reloj de arena", "Sablier", "Clessidra"],
  Skull: ["Cráneo", "Crâne", "Teschio"],
  Token: ["Ficha", "Jeton", "Gettone"],
  Old: ["Viejo", "Vieux", "Vecchio"],
  Oak: ["Roble", "Chêne", "Quercia"],
  Stick: ["Palo", "Bâton", "Bastone"],
  Parchment: ["Pergamino", "Parchemin", "Pergamena"],
  Mastery: ["Maestría", "Maîtrise", "Maestria"],
  Patience: ["Paciencia", "Patience", "Pazienza"],
  Strengthener: ["Fortalecedor", "Renforcement", "Rinforzo"],
  Piece: ["Pieza", "Morceau", "Pezzo"],
  Pollen: ["Polen", "Pollen", "Polline"],
  Concentrate: ["Concentrado", "Concentré", "Concentrato"],
  Pure: ["Puro", "Pur", "Puro"],
  Purse: ["Bolsa", "Bourse", "Borsa"],
  Quality: ["Calidad", "Qualité", "Qualità"],
  Ravaging: ["Devastadora", "Dévastatrice", "Devastante"],
  Branch: ["Rama", "Branche", "Ramo"],
  Reinforced: ["Reforzado", "Renforcé", "Rinforzato"],
  Ripped: ["Rasgado", "Déchiré", "Strappato"],
  Skeleton: ["Esqueleto", "Squelette", "Scheletro"],
  Solstice: ["Solsticio", "Solstice", "Solstizio"],
  Stolen: ["Robado", "Volé", "Rubato"],
  Coat: ["Abrigo", "Manteau", "Cappotto"],
  Locket: ["Medallón", "Médaillon", "Medaglione"],
  Sweet: ["Dulce", "Doux", "Dolce"],
  Jewel: ["Joya", "Joyau", "Gioiello"],
  Leaves: ["Hojas", "Feuilles", "Foglie"],
  Bowstring: ["Cuerda de arco", "Corde d'arc", "Corda d'arco"],
  Tactical: ["Táctica", "Tactique", "Tattico"],
  Woods: ["Bosques", "Bois", "Boschi"],
  Seal: ["Sello", "Sceau", "Sigillo"],
  Hat: ["Sombrero", "Chapeau", "Cappello"],
  Temporal: ["Temporal", "Temporel", "Temporale"],
  "Thief's": ["de ladrón", "de voleur", "del ladro"],
  Torch: ["Antorcha", "Torche", "Torcia"],
  Tribe: ["Tribu", "Tribu", "Tribù"],
  Turquoise: ["Turquesa", "Turquoise", "Turchese"],
  Twilight: ["Crepúsculo", "Crépuscule", "Crepuscolo"],
  Claymore: ["Claymore", "Claymore", "Claymore"],
  Twisted: ["Retorcida", "Tordue", "Contorto"],
  Water: ["Agua", "Eau", "Acqua"],
  Wheat: ["Trigo", "Blé", "Grano"],
  Wisteria: ["Glicina", "Glycine", "Glicine"],
  Young: ["Joven", "Jeune", "Giovane"],
  Unique: ["Único", "Unique", "Unico"],
  Haste: ["Celeridad", "Hâte", "Celerità"],
  Evasion: ["Evasión", "Évasion", "Evasione"],
  Falls: ["Caídas", "Chutes", "Cadute"],
  Reduction: ["Reducción", "Réduction", "Riduzione"],
  "Two-Handed": ["A dos manos", "À deux mains", "A due mani"],
  Tenacity: ["Tenacidad", "Ténacité", "Tenacia"],
  Uses: ["Usos", "Utilisations", "Usi"],
  Cooldown: ["Tiempo de recarga", "Temps de recharge", "Tempo di ricarica"],
  "Used Leather": ["Cuero usado", "Cuir usé", "Cuoio usato"],
  "Worn Leather": ["Cuero gastado", "Cuir usé", "Cuoio consumato"],
  "Coal Ores": ["Minerales de carbón", "Minerais de charbon", "Minerali di carbone"],
  Bullhorn: ["Cuerno de toro", "Corne de taureau", "Corno di toro"],
  Allium: ["Allium", "Allium", "Allium"],
  Glycine: ["Glicina", "Glycine", "Glicine"],
  Souls: ["Almas", "Âmes", "Anime"],
  Omnivampirism: ["Omnivampirismo", "Omnivampirisme", "Omnivampirismo"],
  "Blocking Power": ["Potencia de bloqueo", "Puissance de blocage", "Potenza di blocco"],
  "Flight Of Life": ["Vuelo de vida", "Vol de vie", "Volo della vita"],
  "Boost the chance of Dodging": ["Aumenta la probabilidad de esquivar", "Augmente les chances d'esquive", "Aumenta la probabilità di schivare"],
  "Blocking Control": ["Control de bloqueo", "Contrôle du blocage", "Controllo del blocco"],
  "Recoil Resistance": ["Resistencia al retroceso", "Résistance au recul", "Resistenza al rinculo"],
  "Boost blocking control": ["Aumenta el control de bloqueo", "Augmente le contrôle du blocage", "Aumenta il controllo del blocco"],
  "Boost blocking power": ["Aumenta la potencia de bloqueo", "Augmente la puissance de blocage", "Aumenta la potenza di blocco"],
  "Boost recoil resistance": ["Aumenta la resistencia al retroceso", "Augmente la résistance au recul", "Aumenta la resistenza al rinculo"],
  "Acacia board": ["Tablón de acacia", "Planche d'acacia", "Tavola di acacia"],
  "Acacia log": ["Tronco de acacia", "Bûche d'acacia", "Tronco di acacia"],
  "Caulette's lost pants": ["Pantalones perdidos de Caulette", "Pantalon perdu de Caulette", "Pantaloni perduti di Caulette"],
  "Krampus bracelet": ["Brazalete de Krampus", "Bracelet de Krampus", "Bracciale di Krampus"],
  Nodachi: ["Nodachi", "Nodachi", "Nodachi"],
  "Soul of the Herald": ["Alma del heraldo", "Âme du héraut", "Anima dell'araldo"],
  "Soul of the Reaper": ["Alma del segador", "Âme du faucheur", "Anima del mietitore"],
  "Soul of the Warden": ["Alma del guardián", "Âme du gardien", "Anima del guardiano"],
  "Spear of the Piercing Dart": ["Lanza del dardo perforante", "Lance du dard perforant", "Lancia del dardo perforante"],
  "Sylvester bracelet": ["Brazalete de Sylvester", "Bracelet de Sylvester", "Bracciale di Sylvester"],
  "Talons of Adoryll": ["Garras de Adoryll", "Serres d'Adoryll", "Artigli di Adoryll"],
  "Temporal Runes": ["Runas temporales", "Runes temporelles", "Rune temporali"],
  "Wolnir bracelet": ["Brazalete de Wolnir", "Bracelet de Wolnir", "Bracciale di Wolnir"],
  "Woodclaw Knife": ["Cuchillo de garra de madera", "Couteau de griffe de bois", "Coltello di artiglio di legno"],
  Woodclaw: ["Garra de madera", "Griffe de bois", "Artiglio di legno"],
  "Accessory Smith": ["Herrero de accesorios", "Forgeron d'accessoires", "Fabbro di accessori"],
  "Accessory Smithy": ["Herrería de accesorios", "Forge d'accessoires", "Fucina di accessori"],
  "Adventurer's Shoemaker": ["Zapatero de aventureros", "Cordonnier des aventuriers", "Calzolaio degli avventurieri"],
  Braceletsmith: ["Herrero de brazaletes", "Forgeron de bracelets", "Fabbro di bracciali"],
  Glovesmith: ["Herrero de guantes", "Forgeron de gants", "Fabbro di guanti"],
  Ringsmith: ["Herrero de anillos", "Forgeron de bagues", "Fabbro di anelli"],
  "Tool Merchants": ["Mercaderes de herramientas", "Marchands d'outils", "Mercanti di strumenti"],
  Toolsmith: ["Herrero de herramientas", "Forgeron d'outils", "Fabbro di strumenti"],
  "Traveling Merchants": ["Mercaderes ambulantes", "Marchands itinérants", "Mercanti itineranti"],
  "Equipment Merchants": ["Mercaderes de equipo", "Marchands d'équipement", "Mercanti di equipaggiamento"],
  "Consumables Merchants": ["Mercaderes de consumibles", "Marchands de consommables", "Mercanti di consumabili"],
  Alchemists: ["Alquimistas", "Alchimistes", "Alchimisti"],
  Keymaker: ["Fabricante de llaves", "Fabricant de clés", "Fabbricante di chiavi"],
  Reshaper: ["Remodelador", "Remodeleur", "Rimodellatore"],
  Dealer: ["Vendedor", "Vendeur", "Venditore"],
  Reseller: ["Revendedor", "Revendeur", "Rivenditore"],
  Manufacturer: ["Fabricante", "Fabricant", "Fabbricante"],
  "Small Stock Exchange": ["Pequeña bolsa de valores", "Petite bourse", "Piccola borsa valori"],
  Cabinetmaker: ["Ebanista", "Ébéniste", "Ebanista"],
  Leatherworker: ["Curtidor", "Tanneur", "Conciatore"],
  Miner: ["Minero", "Mineur", "Minatore"],
  Corner: ["Esquina", "Coin", "Angolo"],
  Ringman: ["Vendedor de anillos", "Vendeur de bagues", "Venditore di anelli"],
  "Weapon Seller": ["Vendedor de armas", "Vendeur d'armes", "Venditore di armi"],
  Dard: ["Dardo", "Dard", "Dardo"],
  "Ficelle de bauxite": ["Cuerda de bauxita", "Ficelle de bauxite", "Cordicella di bauxite"],
  "Lien de la Sylve": ["Vínculo de la Sylve", "Lien de la Sylve", "Legame della Sylve"],
  "Oracile Thorn Stem": ["Tallo de espina de Oracile", "Tige d'épine d'Oracile", "Gambo di spina di Oracile"],
  "Oracile Thorn": ["Espina de Oracile", "Épine d'Oracile", "Spina di Oracile"],
  "Pyrite d'Or": ["Pirita de oro", "Pyrite d'or", "Pirite d'oro"],
  Pyrite: ["Pirita", "Pyrite", "Pirite"],
  "Runes from Toile": ["Runas de Toile", "Runes de Toile", "Rune di Toile"],
  "Saphir Bleu": ["Zafiro azul", "Saphir bleu", "Zaffiro blu"],
  "Saphir Jaune": ["Zafiro amarillo", "Saphir jaune", "Zaffiro giallo"],
  "Savannah Ax": ["Hacha de sabana", "Hache de savane", "Ascia della savana"],
  Sceau: ["Sello", "Sceau", "Sigillo"],
  "Sylve shoot": ["Brote de Sylve", "Pousse de Sylve", "Germoglio di Sylve"],
  Flearvae: ["Flearvae", "Flearvae", "Flearvae"],
  "Ancestral Shoot": ["Brote ancestral", "Pousse ancestrale", "Germoglio ancestrale"],
  Lavander: ["Lavanda", "Lavande", "Lavanda"],
  "the Accessories Smith in Sylnovar": [
    "el herrero de accesorios de Sylnovar",
    "le forgeron d'accessoires de Sylnovar", "il fabbro di accessori di Sylnovar"
  ],
  "Coppersmith in the Town of Beginnings": [
    "Herrero de cobre en la Ciudad de los Comienzos",
    "Forgeron de cuivre dans la Ville des commencements", "Fabbro del rame nella Città degli Inizi"
  ],
  "the Scrap Accessories Smithy, northeast of Swaying Monster Bay": [
    "la herrería de accesorios de chatarra, al noreste de la Bahía de Monstruos Ondulantes",
    "la forge d'accessoires de ferraille, au nord-est de la Baie des monstres ondoyants", "la fucina di accessori di scarti, a nord-est della Baia dei Mostri Ondulanti"
  ],
  "Rune Slots": ["Ranuras de runa", "Emplacements de runes", "Slot runa"],
  "Effect: Force Accrue": ["Efecto: acumulación de fuerza", "Effet : cumul de force", "Effetto: forza accumulata"],
  "Effect: Mana": ["Efecto: maná", "Effet : mana", "Effetto: mana"],
  "Parry Chance": ["Probabilidad de parada", "Chance de parade", "Probabilità di parata"],
  "Mana Restored": ["Maná restaurado", "Mana restauré", "Mana ripristinato"],
  "Max Mana": ["Maná máximo", "Mana maximal", "Mana massimo"],
  "Boost the Mana Max": ["Aumenta el maná máximo", "Augmente le mana maximal", "Aumenta il mana massimo"],
  "Dodge Chance": ["Probabilidad de esquivar", "Chance d'esquive", "Probabilità di schivata"],
  "Effect: Augmentation Intelligence": ["Efecto: aumento de inteligencia", "Effet : augmentation de l'intelligence", "Effetto: aumento intelligenza"],
  "Effect: Augmentation Force": ["Efecto: aumento de fuerza", "Effet : augmentation de la force", "Effetto: aumento forza"],
  "Affordable Bracelet": ["Brazalete asequible", "Bracelet abordable", "Bracciale accessibile"],
  "Andesite Bracelet": ["Brazalete de andesita", "Bracelet d'andésite", "Bracciale di andesite"],
  "Assassin's Billhook": ["Podadera de asesino", "Serpe d'assassin", "Roncola dell'assassino"],
  "Asterios Bracelet": ["Brazalete de Asterios", "Bracelet d'Asterios", "Bracciale di Asterios"],
  "Bauxite amulets": ["Amuletos de bauxita", "Amulettes de bauxite", "Amuleti di bauxite"],
  "Bauxite bracelet": ["Brazalete de bauxita", "Bracelet de bauxite", "Bracciale di bauxite"],
  "Bauxite ingot": ["Lingote de bauxita", "Lingot de bauxite", "Lingotto di bauxite"],
  "Bestial Grimoire": ["Grimorio bestial", "Grimoire bestial", "Grimorio bestiale"],
  "Cage key": ["Llave de jaula", "Clé de cage", "Chiave della gabbia"],
  "Deer Bracelet": ["Brazalete de ciervo", "Bracelet de cerf", "Bracciale del cervo"],
  "Dragon Runes": ["Runas de dragón", "Runes de dragon", "Rune del drago"],
  "Essence of Gorbel": ["Esencia de Gorbel", "Essence de Gorbel", "Essenza di Gorbel"],
  "Essence of Sylnovar": ["Esencia de Sylnovar", "Essence de Sylnovar", "Essenza di Sylnovar"],
  "Essence of Sylvaer": ["Esencia de Sylvaer", "Essence de Sylvaer", "Essenza di Sylvaer"],
  "Frost Potion": ["Poción de escarcha", "Potion de givre", "Pozione del gelo"],
  "Goblin Essence": ["Esencia de goblin", "Essence de gobelin", "Essenza di goblin"],
  "Goblin Rune": ["Runa de goblin", "Rune de gobelin", "Runa di goblin"],
  "Granite Bracelet": ["Brazalete de granito", "Bracelet de granit", "Bracciale di granito"],
  "Grimoire Taurus": ["Grimorio de Taurus", "Grimoire de Taurus", "Grimorio di Taurus"],
  "Gust Bracelet": ["Brazalete de ráfaga", "Bracelet de bourrasque", "Bracciale della raffica"],
  "Honeyed Bracelet": ["Brazalete de miel", "Bracelet miellé", "Bracciale al miele"],
  "Ice Bracelet": ["Brazalete de hielo", "Bracelet de glace", "Bracciale di ghiaccio"],
  "Leaf Fragment": ["Fragmento de hoja", "Fragment de feuille", "Frammento di foglia"],
  "Low Corruption Grimoire": ["Grimorio de corrupción baja", "Grimoire de faible corruption", "Grimorio di bassa corruzione"],
  "Luminescent Bracelet": ["Brazalete luminiscente", "Bracelet luminescent", "Bracciale luminescente"],
  "Luminescent Rune": ["Runa luminiscente", "Rune luminescente", "Runa luminescente"],
  "Magician's Grimoire": ["Grimorio del mago", "Grimoire du mage", "Grimorio del mago"],
  "Magician's Robe": ["Túnica del mago", "Robe du mage", "Veste del mago"],
  "Majestic Essence": ["Esencia majestuosa", "Essence majestueuse", "Essenza maestosa"],
  "Mana Potion IV": ["Poción de maná IV", "Potion de mana IV", "Pozione di mana IV"],
  "Martyr's Potion": ["Poción del mártir", "Potion du martyr", "Pozione del martire"],
  "Misty Bracelet": ["Brazalete brumoso", "Bracelet brumeux", "Bracciale nebbioso"],
  "Misty Rune": ["Runa brumosa", "Rune brumeuse", "Runa nebbiosa"],
  "Nephentes Sandwich": ["Sándwich de nephentes", "Sandwich de néphentes", "Panino al nephentes"],
  "Orb of Mage Greed": ["Orbe de la codicia del mago", "Orbe de l'avidité du mage", "Sfera dell'avidità del mago"],
  "Orc Bracelet": ["Brazalete de orco", "Bracelet d'orque", "Bracciale dell'orco"],
  "Orc Essence": ["Esencia de orco", "Essence d'orque", "Essenza di orco"],
  "Orichalcum Fragment": ["Fragmento de oricalco", "Fragment d'orichalque", "Frammento di oricalco"],
  "Potion of Life I": ["Poción de vida I", "Potion de vie I", "Pozione di vita I"],
  "Potion of Life II": ["Poción de vida II", "Potion de vie II", "Pozione di vita II"],
  "Potion of Life III": ["Poción de vida III", "Potion de vie III", "Pozione di vita III"],
  "Potion of Life IV": ["Poción de vida IV", "Potion de vie IV", "Pozione di vita IV"],
  "Potion of Life V": ["Poción de vida V", "Potion de vie V", "Pozione di vita V"],
  "Potion of Life VI": ["Poción de vida VI", "Potion de vie VI", "Pozione di vita VI"],
  "Potion of Mana I": ["Poción de maná I", "Potion de mana I", "Pozione di mana I"],
  "Potion of Mana II": ["Poción de maná II", "Potion de mana II", "Pozione di mana II"],
  "Potion of Mana III": ["Poción de maná III", "Potion de mana III", "Pozione di mana III"],
  "Potion of Mana VI": ["Poción de maná VI", "Potion de mana VI", "Pozione di mana VI"],
  "Precision Rune I": ["Runa de precisión I", "Rune de précision I", "Runa di precisione I"],
  "Purple Broken Fragment": ["Fragmento morado roto", "Fragment violet brisé", "Frammento viola rotto"],
  "Red Broken Fragment": ["Fragmento rojo roto", "Fragment rouge brisé", "Frammento rosso rotto"],
  "Rune of Agility I": ["Runa de agilidad I", "Rune d'agilité I", "Runa di agilità I"],
  "Rune of Low Corruption": ["Runa de corrupción baja", "Rune de faible corruption", "Runa di bassa corruzione"],
  "Rune of Sorcery I": ["Runa de hechicería I", "Rune de sorcellerie I", "Runa di stregoneria I"],
  "Rune of the Colossus": ["Runa del coloso", "Rune du colosse", "Runa del colosso"],
  "Rune of the Elders": ["Runa de los ancianos", "Rune des anciens", "Runa degli anziani"],
  "Rune of the Thief": ["Runa del ladrón", "Rune du voleur", "Runa del ladro"],
  "Rune Remover I": ["Removedor de runas I", "Dissolvant de runes I", "Rimuovi runa I"],
  "Rune Remover II": ["Removedor de runas II", "Dissolvant de runes II", "Rimuovi runa II"],
  "Scrap Bracelet": ["Brazalete de chatarra", "Bracelet de ferraille", "Bracciale di scarti"],
  "Spectral Bracelet": ["Brazalete espectral", "Bracelet spectral", "Bracciale spettrale"],
  "Spectral Channel": ["Canal espectral", "Canal spectral", "Canale spettrale"],
  "Spectral Essence": ["Esencia espectral", "Essence spectrale", "Essenza spettrale"],
  "Spectral Grimoire": ["Grimorio espectral", "Grimoire spectral", "Grimorio spettrale"],
  "Spider Bracelet": ["Brazalete de araña", "Bracelet d'araignée", "Bracciale del ragno"],
  "Strange Rune": ["Runa extraña", "Rune étrange", "Runa strana"],
  "Talisman Taurus": ["Talismán de Taurus", "Talisman de Taurus", "Talismano di Taurus"],
  "Weak Corruption Bracelet": ["Brazalete de corrupción débil", "Bracelet de faible corruption", "Bracciale di corruzione debole"],
  "Web Bracelet": ["Brazalete de telaraña", "Bracelet de toile", "Bracciale di ragnatela"],
  "Wolf Bracelet": ["Brazalete de lobo", "Bracelet de loup", "Bracciale del lupo"],
  "Fragment of the Ancients": ["Fragmento de los antiguos", "Fragment des anciens", "Frammento degli antichi"],
  "Kazor Rune": ["Runa de Kazor", "Rune de Kazor", "Runa di Kazor"],
  "Labyrinth Rune": ["Runa del laberinto", "Rune du labyrinthe", "Runa del labirinto"],
  "Mafioso Rune": ["Runa mafiosa", "Rune mafieuse", "Runa mafiosa"],
  "Minerais d'Onyx Pur": ["Minerales de ónice puro", "Minerais d'onyx pur", "Minerali di onice puro"],
  "Potion de Mana V": ["Poción de maná V", "Potion de mana V", "Pozione di mana V"],
  "Rune d'Halloween": ["Runa de Halloween", "Rune d'Halloween", "Runa di Halloween"],
  "Rune Lunaire": ["Runa lunar", "Rune lunaire", "Runa lunare"],
  "Rune Saint-Valentin": ["Runa de San Valentín", "Rune de la Saint-Valentin", "Runa di San Valentino"],
  "Rune Solo Player": ["Runa de jugador solitario", "Rune du joueur solo", "Runa del giocatore solitario"],
  "Rune Spectrale": ["Runa espectral", "Rune spectrale", "Runa spettrale"],
  "Rune Sylnovarienne": ["Runa de Sylnovar", "Rune sylnovarienne", "Runa di Sylnovar"],
  "Rune Sylvaerienne": ["Runa de Sylvaer", "Rune sylvaerienne", "Runa di Sylvaer"],
  "Spectral Will-o'-the-Wisp": ["Fuego fatuo espectral", "Feu follet spectral", "Fuoco fatuo spettrale"],
  "Sylvester Grimoire": ["Grimorio de Sylvester", "Grimoire de Sylvester", "Grimorio di Sylvester"],
  "Witch's Potion (Intelligence)": ["Poción de bruja (inteligencia)", "Potion de sorcière (intelligence)", "Pozione della strega (intelligenza)"],
  "Witch's Potion (Strength)": ["Poción de bruja (fuerza)", "Potion de sorcière (force)", "Pozione della strega (forza)"],
  "Yuleck Bracelet": ["Brazalete de Yuleck", "Bracelet de Yuleck", "Bracciale di Yuleck"],
  "Basic Rune Craftsman": ["Artesano de runas básico", "Artisan runique de base", "Artigiano di rune base"],
  "Complex Rune Craftsman": ["Artesano de runas complejo", "Artisan runique avancé", "Artigiano di rune avanzato"],
  "Oracile's Thorn Stem": ["Tallo de espina de Oracile", "Tige d'épine d'Oracile", "Gambo di spina di Oracile"],
  "Sylve Shoot": ["Brote de Sylve", "Pousse de Sylve", "Germoglio di Sylve"],
  Orcheart: ["Corazón de orco", "Cœur d'orque", "Cuore d'orco"],
  "Oracile's Thorn": ["Espina de Oracile", "Épine d'Oracile", "Spina di Oracile"],
  Grenat: ["Granate", "Grenat", "Granato"],
  Jais: ["Azabache", "Jais", "Giaietto"],
  "Grimoire Bestial": ["Grimorio bestial", "Grimoire bestial", "Grimorio bestiale"],
  "Tissu Spectral": ["Tela espectral", "Tissu spectral", "Tessuto spettrale"],
  "Oceiros Bracelet": ["Brazalete de Oceiros", "Bracelet d'Oceiros", "Bracciale di Oceiros"],
  "Thief's Bracelet": ["Brazalete del ladrón", "Bracelet du voleur", "Bracciale del ladro"],
  "Thief Set": ["Conjunto del ladrón", "Ensemble du voleur", "Set del ladro"],
  "Weakling Wolf Set": ["Conjunto del lobo débil", "Ensemble du loup chétif", "Set del lupo debole"],
  "Bandit Set": ["Conjunto del bandido", "Ensemble du bandit", "Set del bandito"],
  "Amethyst Set": ["Conjunto de amatista", "Ensemble d'améthyste", "Set di ametista"],
  "Amethyst Bracelet": ["Brazalete de amatista", "Bracelet d'améthyste", "Bracciale di ametista"],
  "2 Piece Set Bonus": ["Bonus de conjunto de 2 piezas", "Bonus d'ensemble de 2 pièces", "Bonus set da 2 pezzi"],
  "3 Piece Set Bonus": ["Bonus de conjunto de 3 piezas", "Bonus d'ensemble de 3 pièces", "Bonus set da 3 pezzi"],
  "4 Piece Set Bonus": ["Bonus de conjunto de 4 piezas", "Bonus d'ensemble de 4 pièces", "Bonus set da 4 pezzi"],
  "5 Piece Set Bonus": ["Bonus de conjunto de 5 piezas", "Bonus d'ensemble de 5 pièces", "Bonus set da 5 pezzi"],
  "6 Piece Set Bonus": ["Bonus de conjunto de 6 piezas", "Bonus d'ensemble de 6 pièces", "Bonus set da 6 pezzi"],
  "7 Piece Set Bonus": ["Bonus de conjunto de 7 piezas", "Bonus d'ensemble de 7 pièces", "Bonus set da 7 pezzi"],
  "+1.5/s Health Regeneration": ["+1.5/s de regeneración de salud", "+1.5/s de régénération de santé", "+1.5/s di rigenerazione della salute"],
  "Yellow Broken Fragment": ["Fragmento amarillo roto", "Fragment jaune brisé", "Frammento giallo rotto"],
  "Ficelle d'Onyx Pur": ["Cuerda de ónice puro", "Ficelle d'onyx pur", "Cordicella di onice puro"],
  "Carapace d'Ika": ["Caparazón de Ika", "Carapace d'Ika", "Carapace di Ika"],
  "Rune Orcienne": ["Runa orca", "Rune orque", "Runa dell'orco"],
  "Grimoire Sylvester": ["Grimorio de Sylvester", "Grimoire de Sylvester", "Grimorio di Sylvester"],
  "Effect: Utilisations": ["Efecto: usos", "Effet : utilisations", "Effetto: usi"],
  "Effect: Harvest Power": ["Efecto: poder de recolección", "Effet : puissance de récolte", "Effetto: potenza di raccolta"],
  "Effect: Sustainability": ["Efecto: sostenibilidad", "Effet : durabilité", "Effetto: sostenibilità"],
  "Effect: Nourriture": ["Efecto: alimento", "Effet : nourriture", "Effetto: alimento"],
  "Effect: Saturation": ["Efecto: saturación", "Effet : saturation", "Effetto: saturazione"],
  "Effect: Bloodthirst": ["Efecto: sed de sangre", "Effet : soif de sang", "Effetto: sete di sangue"],
  "Effect: Endurance Accrue": ["Efecto: acumulación de resistencia", "Effet : cumul d'endurance", "Effetto: resistenza accumulata"],
  "Effect: Niveau Requis": ["Efecto: nivel requerido", "Effet : niveau requis", "Effetto: livello richiesto"],
  "Effect: Utilisations Totales": ["Efecto: usos totales", "Effet : utilisations totales", "Effetto: usi totali"],
  "Effect: Puissance Arcanique": ["Efecto: poder arcano", "Effet : puissance arcanique", "Effetto: potere arcano"],
  "Effect: Recharge Cristaux": ["Efecto: recarga de cristales", "Effet : recharge des cristaux", "Effetto: ricarica dei cristalli"],
  "Effect: Recharge Potions D'Amour": ["Efecto: recarga de pociones de amor", "Effet : recharge des potions d'amour", "Effetto: ricarica delle pozioni d'amore"],
  "Effect: Level Required To Use Food": [
    "Efecto: nivel requerido para usar comida",
    "Effet : niveau requis pour utiliser la nourriture", "Effetto: livello richiesto per usare il cibo"
  ],
  "Effect: Recharge Nourriture": ["Efecto: recarga de comida", "Effet : recharge de la nourriture", "Effetto: ricarica del cibo"],
  "Effect: Ressurection": ["Efecto: resurrección", "Effet : résurrection", "Effetto: resurrezione"]
};

/* ---------------------------------------------------------------------------------------------
   Curated terminology.

   The word list above is applied token by token, which is right for single words but keeps
   English word order for compounds ("Bauxite Ore" -> "Bauxita Mineral", "Iron Sword" ->
   "Hierro Espada") and cannot insert the linking preposition Spanish and French need. Every
   compound whose natural form differs from the token-by-token result is listed here verbatim.
   The glossary replaces the longest match first, so these entries always win over their own
   individual words. Grouped by family and alphabetical inside a group; proper nouns are kept
   as-is. `Object.assign` runs before the pattern list is built, so nothing else has to change.
   --------------------------------------------------------------------------------------------- */
const curatedTerminology = {
  /* --- crafting resources, materials and misc. items: A - B --- */
  "Acacia Bark": ["Corteza de acacia", "Écorce d'acacia", "Corteccia di acacia"],
  "Acacia Honey Necklace": ["Collar de miel de acacia", "Collier de miel d'acacia", "Collana di miele di acacia"],
  "Acacia Powder": ["Polvo de acacia", "Poudre d'acacia", "Polvere di acacia"],
  "Acacia Ring": ["Anillo de acacia", "Anneau d'acacia", "Anello di acacia"],
  "Acacia Twine": ["Cuerda de acacia", "Ficelle d'acacia", "Cordicella di acacia"],
  "Albal Fangs": ["Colmillos de Albal", "Crocs d'Albal", "Zanne di Albal"],
  "Albal Necklace": ["Collar de Albal", "Collier d'Albal", "Collana di Albal"],
  "Allium Flower": ["Flor de allium", "Fleur d'allium", "Fiore di allium"],
  "Amber Seed": ["Semilla de ámbar", "Graine d'ambre", "Seme d'ambra"],
  "Amber Sepal": ["Sépalo de ámbar", "Sépale d'ambre", "Sepalo d'ambra"],
  "Amethyst Shard": ["Fragmento de amatista", "Éclat d'améthyste", "Scheggia di ametista"],
  "Amulet of the Dark Woods": ["Amuleto del Bosque Oscuro", "Amulette de la Forêt Sombre", "Amuleto del Bosco Oscuro"],
  "Amulet of the Web": ["Amuleto de la telaraña", "Amulette de la toile", "Amuleto della ragnatela"],
  "Ancestral Root": ["Raíz ancestral", "Racine ancestrale", "Radice ancestrale"],
  "Ancient Wood Essence": ["Esencia de madera antigua", "Essence de bois ancien", "Essenza di legno antico"],
  "Aquatic Debris": ["Restos acuáticos", "Débris aquatiques", "Detriti acquatici"],
  "Aragorn's Necklace": ["Collar de Aragorn", "Collier d'Aragorn", "Collana di Aragorn"],
  "Assassin Scythe": ["Guadaña de asesino", "Faux d'assassin", "Falce dell'assassino"],
  "Assassin's Boots": ["Botas de asesino", "Bottes d'assassin", "Stivali dell'assassino"],
  "Assassin's Breastplate": ["Coraza de asesino", "Plastron d'assassin", "Corazza dell'assassino"],
  "Assassin's Helmet": ["Casco de asesino", "Casque d'assassin", "Elmo dell'assassino"],
  "Assassin's Leggings": ["Calzas de asesino", "Jambières d'assassin", "Gambali dell'assassino"],
  "Bandit's Boots": ["Botas de bandido", "Bottes de bandit", "Stivali del bandito"],
  "Bandit's Gold Coin": ["Moneda de oro de bandido", "Pièce d'or de bandit", "Moneta d'oro del bandito"],
  "Bauxite Minerals": ["Minerales de bauxita", "Minéraux de bauxite", "Minerali di bauxite"],
  "Bear Claw": ["Garra de oso", "Griffe d'ours", "Artiglio d'orso"],
  "Bear Fat": ["Grasa de oso", "Graisse d'ours", "Grasso d'orso"],
  "Bear Skin": ["Piel de oso", "Peau d'ours", "Pelle d'orso"],
  "Bear Soul Fragment": ["Fragmento de alma de oso", "Fragment d'âme d'ours", "Frammento d'anima d'orso"],
  "Beast Fur": ["Piel de bestia", "Fourrure de bête", "Pelliccia di bestia"],
  "Bee Mage Catalyst": ["Catalizador de mago abeja", "Catalyseur de mage abeille", "Catalizzatore del mago ape"],
  "Bee Shaman Catalyst": ["Catalizador de chamán abeja", "Catalyseur de chaman abeille", "Catalizzatore dello sciamano ape"],
  "Bee Shell": ["Caparazón de abeja", "Carapace d'abeille", "Guscio d'ape"],
  "Birch Bark": ["Corteza de abedul", "Écorce de bouleau", "Corteccia di betulla"],
  "Birch Board": ["Tablón de abedul", "Planche de bouleau", "Tavola di betulla"],
  "Birch Log": ["Tronco de abedul", "Bûche de bouleau", "Tronco di betulla"],
  "Birch Powder": ["Polvo de abedul", "Poudre de bouleau", "Polvere di betulla"],
  "Birch Ring": ["Anillo de abedul", "Anneau de bouleau", "Anello di betulla"],
  "Birch Twine": ["Cuerda de abedul", "Ficelle de bouleau", "Cordicella di betulla"],
  "Black Bone Stone": ["Piedra de hueso negro", "Pierre d'os noir", "Pietra d'osso nero"],
  "Black Boots": ["Botas negras", "Bottes noires", "Stivali neri"],
  "Black Carcass": ["Cadáver negro", "Carcasse noire", "Carcassa nera"],
  "Black Hematite": ["Hematita negra", "Hématite noire", "Ematite nera"],
  "Black Lantern": ["Linterna negra", "Lanterne noire", "Lanterna nera"],
  "Black Mandible": ["Mandíbula negra", "Mandibule noire", "Mandibola nera"],
  "Black Powder": ["Pólvora negra", "Poudre noire", "Polvere nera"],
  "Black Shield": ["Escudo negro", "Bouclier noir", "Scudo nero"],
  "Black Spider Venom": ["Veneno de araña negra", "Venin d'araignée noire", "Veleno di ragno nero"],
  "Black Spinel": ["Espinela negra", "Spinelle noire", "Spinello nero"],
  "Black Thread": ["Hilo negro", "Fil noir", "Filo nero"],
  "Blank Scroll": ["Pergamino en blanco", "Parchemin vierge", "Pergamena vuota"],
  "Blazing Feather": ["Pluma ardiente", "Plume ardente", "Piuma ardente"],
  "Blue Christmas Mittens": ["Manoplas navideñas azules", "Moufles de Noël bleues", "Muffole natalizie blu"],
  "Boar Skin": ["Piel de jabalí", "Peau de sanglier", "Pelle di cinghiale"],
  "Bone Dust": ["Polvo de hueso", "Poussière d'os", "Polvere d'ossa"],
  "Bone Gloves": ["Guantes de hueso", "Gants d'os", "Guanti d'osso"],
  "Bone Sword": ["Espada de hueso", "Épée d'os", "Spada d'osso"],
  "Boots Brumeuses": ["Botas brumosas", "Bottes brumeuses", "Stivali nebbiosi"],
  "Boots Luminescentes": ["Botas luminiscentes", "Bottes luminescentes", "Stivali luminescenti"],
  "Boots of the Foam": ["Botas de la espuma", "Bottes de l'écume", "Stivali della schiuma"],
  "Boots of the Necromancer Assassin": ["Botas del asesino nigromante", "Bottes de l'assassin nécromancien", "Stivali dell'assassino negromante"],
  "Boots of the Necromancer Shaman": ["Botas del chamán nigromante", "Bottes du chaman nécromancien", "Stivali dello sciamano negromante"],
  "Boots of the Woods": ["Botas del bosque", "Bottes des bois", "Stivali del bosco"],
  "Boots Spectrales": ["Botas espectrales", "Bottes spectrales", "Stivali spettrali"],
  "Boots Sylvestres": ["Botas silvestres", "Bottes sylvestres", "Stivali silvestri"],
  "Bow Nodachi": ["Arco nodachi", "Arc nodachi", "Arco nodachi"],
  "Bow of Love": ["Arco de amor", "Arc d'amour", "Arco d'amore"],
  "Bow Sylvester": ["Arco de Sylvester", "Arc de Sylvester", "Arco di Sylvester"],
  "Bracelet Gluant": ["Brazalete pegajoso", "Bracelet gluant", "Bracciale appiccicoso"],
  "Bracelet of the Dark Woods": ["Brazalete del Bosque Oscuro", "Bracelet de la Forêt Sombre", "Bracciale del Bosco Oscuro"],
  "Bracelet of the Woods": ["Brazalete del bosque", "Bracelet des bois", "Bracciale del bosco"],
  "Breastplate of the Ancient Woods Hunter": [
    "Coraza del cazador de los Bosques Antiguos",
    "Plastron du chasseur des Bois Anciens", "Corazza del cacciatore dei Boschi Antichi"
  ],
  "Breastplate of the Ancient Woods Reaper": [
    "Coraza del segador de los Bosques Antiguos",
    "Plastron du faucheur des Bois Anciens", "Corazza del mietitore dei Boschi Antichi"
  ],
  "Brown Spider Carcass": ["Cadáver de araña marrón", "Carcasse d'araignée brune", "Carcassa di ragno marrone"],
  "Brown Spider Eyes": ["Ojos de araña marrón", "Yeux d'araignée brune", "Occhi di ragno marrone"],
  "Brown Spider Mandible": ["Mandíbula de araña marrón", "Mandibule d'araignée brune", "Mandibola di ragno marrone"],
  "Brown Spider Thread": ["Hilo de araña marrón", "Fil d'araignée brune", "Filo di ragno marrone"],
  "Brown Spider Venom": ["Veneno de araña marrón", "Venin d'araignée brune", "Veleno di ragno marrone"],
  "Bull Horn": ["Cuerno de toro", "Corne de taureau", "Corno di toro"],
  "Bull Necklace": ["Collar de toro", "Collier de taureau", "Collana di toro"],
  "Bulls Gloves": ["Guantes de toro", "Gants de taureau", "Guanti di toro"],
  "Cage key": ["Llave de jaula", "Clé de cage", "Chiave della gabbia"],
  "Canvas Bag": ["Bolsa de lona", "Sac de toile", "Borsa di tela"],
  "Canvas Boots": ["Botas de lona", "Bottes de toile", "Stivali di tela"],
  "Canvas Gloves": ["Guantes de lona", "Gants de toile", "Guanti di tela"],
  "Cat of the Lunar Year": ["Gato del año lunar", "Chat de l'année lunaire", "Gatto dell'anno lunare"],
  "Caulette's lost pants": ["Pantalones perdidos de Caulette", "Pantalon perdu de Caulette", "Pantaloni perduti di Caulette"],
  "Chipped Axe": ["Hacha desportillada", "Hache ébréchée", "Ascia scheggiata"],
  "Chocolate Box": ["Caja de chocolate", "Boîte de chocolat", "Scatola di cioccolato"],
  "Christmas Rune": ["Runa navideña", "Rune de Noël", "Runa natalizia"],
  "Coal Ores": ["Minerales de carbón", "Minerais de charbon", "Minerali di carbone"],
  "Cold Winds Necklace": ["Collar de vientos fríos", "Collier de vents froids", "Collana dei venti freddi"],
  "Complete Repair Kit": ["Kit de reparación completo", "Kit de réparation complet", "Kit di riparazione completo"],
  "Complete Seal Scroll": ["Pergamino de sello completo", "Parchemin de sceau complet", "Pergamena del sigillo completo"],
  "Cooking recipe": ["Receta de cocina", "Recette de cuisine", "Ricetta di cucina"],
  "Copper Amulet": ["Amuleto de cobre", "Amulette de cuivre", "Amuleto di rame"],
  "Copper Bracelet": ["Brazalete de cobre", "Bracelet de cuivre", "Bracciale di rame"],
  "Copper Coin": ["Moneda de cobre", "Pièce de cuivre", "Moneta di rame"],
  "Copper Gloves": ["Guantes de cobre", "Gants de cuivre", "Guanti di rame"],
  "Copper Ingot": ["Lingote de cobre", "Lingot de cuivre", "Lingotto di rame"],
  "Copper Ores": ["Minerales de cobre", "Minerais de cuivre", "Minerali di rame"],
  "Copper Ring": ["Anillo de cobre", "Anneau de cuivre", "Anello di rame"],
  "Copper Twine": ["Cuerda de cobre", "Ficelle de cuivre", "Cordicella di rame"],
  "Corrupted Bark": ["Corteza corrupta", "Écorce corrompue", "Corteccia corrotta"],
  "Corrupted Crystal": ["Cristal corrupto", "Cristal corrompu", "Cristallo corrotto"],
  "Corrupted Draconic Amulet": ["Amuleto dracónico corrupto", "Amulette draconique corrompue", "Amuleto draconico corrotto"],
  "Corrupted Draconic Ring": ["Anillo dracónico corrupto", "Anneau draconique corrompu", "Anello draconico corrotto"],
  "Corrupted Feather": ["Pluma corrupta", "Plume corrompue", "Piuma corrotta"],
  "Corrupted Fragment": ["Fragmento corrupto", "Fragment corrompu", "Frammento corrotto"],
  "Corrupted Mask": ["Máscara corrupta", "Masque corrompu", "Maschera corrotta"],
  "Corrupted Spore": ["Espora corrupta", "Spore corrompue", "Spora corrotta"],
  "Crystallized Honey Boots": ["Botas de miel cristalizada", "Bottes de miel cristallisée", "Stivali di miele cristallizzato"],
  "Crystallized Honey Breastplate": ["Coraza de miel cristalizada", "Plastron de miel cristallisée", "Corazza di miele cristallizzato"],
  "Crystallized Honey Helmet": ["Casco de miel cristalizada", "Casque de miel cristallisée", "Elmo di miele cristallizzato"],
  "Crystallized Honey Leggings": ["Calzas de miel cristalizada", "Jambières de miel cristallisée", "Gambali di miele cristallizzato"],
  "Cursed Cloth": ["Tela maldita", "Tissu maudit", "Tessuto maledetto"],
  /* --- crafting resources, materials and misc. items: D - I --- */
  "Dark Bone": ["Hueso oscuro", "Os sombre", "Osso oscuro"],
  "Dark Branch": ["Rama oscura", "Branche sombre", "Ramo oscuro"],
  "Darkwood Boots": ["Botas de madera oscura", "Bottes de bois sombre", "Stivali di legno oscuro"],
  "Earthy Feather": ["Pluma terrenal", "Plume terrestre", "Piuma terrestre"],
  "Egg Cocoon": ["Capullo de huevo", "Cocon d'œuf", "Bozzolo d'uovo"],
  "Enchanted Metal Coin": ["Moneda de metal encantado", "Pièce de métal enchanté", "Moneta di metallo incantato"],
  "Enchanted Metal Ingot": ["Lingote de metal encantado", "Lingot de métal enchanté", "Lingotto di metallo incantato"],
  "Enchanted Twig": ["Ramita encantada", "Brindille enchantée", "Ramoscello incantato"],
  "Essence Stone": ["Piedra de esencia", "Pierre d'essence", "Pietra d'essenza"],
  "Flaming Feather": ["Pluma llameante", "Plume flamboyante", "Piuma fiammeggiante"],
  "Flying Spider Wing": ["Ala de araña voladora", "Aile d'araignée volante", "Ala di ragno volante"],
  "Forest Key": ["Llave del bosque", "Clé de la forêt", "Chiave della foresta"],
  "Frost Dust": ["Polvo de escarcha", "Poussière de givre", "Polvere di gelo"],
  "Glacial Hard Skin": ["Piel dura glacial", "Peau dure glaciale", "Pelle dura glaciale"],
  "Glacial Magic Shard": ["Fragmento mágico glacial", "Éclat magique glacial", "Scheggia di magia glaciale"],
  "Gloves of the Dark Woods": ["Guantes del Bosque Oscuro", "Gants de la Forêt Sombre", "Guanti del Bosco Oscuro"],
  "Gloves Osseux": ["Guantes óseos", "Gants osseux", "Guanti ossei"],
  "Gray Christmas Mittens": ["Manoplas navideñas grises", "Moufles de Noël grises", "Muffole natalizie grigie"],
  "Green Christmas Mittens": ["Manoplas navideñas verdes", "Moufles de Noël vertes", "Muffole natalizie verdi"],
  "Hammer of the Crushing Dart": ["Martillo del dardo aplastante", "Marteau de la flèche écrasante", "Martello del dardo schiacciante"],
  "Heart of Nymbrea": ["Corazón de Nymbrea", "Cœur de Nymbrea", "Cuore di Nymbrea"],
  "Heart of Wood": ["Corazón de madera", "Cœur de bois", "Cuore di legno"],
  "Hive Boots": ["Botas de la colmena", "Bottes de la ruche", "Stivali dell'alveare"],
  "Hive Breastplate": ["Coraza de la colmena", "Plastron de la ruche", "Corazza dell'alveare"],
  "Hive Helmet": ["Casco de la colmena", "Casque de la ruche", "Elmo dell'alveare"],
  "Hive Leggings": ["Calzas de la colmena", "Jambières de la ruche", "Gambali dell'alveare"],
  "Honey Residue": ["Residuo de miel", "Résidu de miel", "Residuo di miele"],
  "Honeyed Amber": ["Ámbar meloso", "Ambre miellé", "Ambra mielata"],
  "Hunter Amethyst Boots": ["Botas de amatista de cazador", "Bottes d'améthyste de chasseur", "Stivali di ametista del cacciatore"],
  "Hunter Amethyst Breastplate": ["Coraza de amatista de cazador", "Plastron d'améthyste de chasseur", "Corazza di ametista del cacciatore"],
  "Hunter Amethyst Helmet": ["Casco de amatista de cazador", "Casque d'améthyste de chasseur", "Elmo di ametista del cacciatore"],
  "Hunter Amethyst Leggings": ["Calzas de amatista de cazador", "Jambières d'améthyste de chasseur", "Gambali di ametista del cacciatore"],
  "Hunter's Breastplate": ["Coraza del cazador", "Plastron du chasseur", "Corazza del cacciatore"],
  "Hunter's Helmet": ["Casco del cazador", "Casque du chasseur", "Elmo del cacciatore"],
  "Hunter's Leggings": ["Calzas del cazador", "Jambières du chasseur", "Gambali del cacciatore"],
  "Huntress' Boots": ["Botas de la cazadora", "Bottes de la chasseresse", "Stivali della cacciatrice"],
  "Icy Hard Skin": ["Piel dura helada", "Peau dure gelée", "Pelle dura ghiacciata"],
  "Icy Magic Radiance": ["Radiación mágica helada", "Rayonnement magique glacé", "Raggio magico ghiacciato"],
  "Ika Shell": ["Caparazón de Ika", "Carapace d'Ika", "Guscio di Ika"],
  "Impure Onyx Amulet": ["Amuleto de ónice impuro", "Amulette d'onyx impur", "Amuleto di onice impuro"],
  "Impure Onyx Bracelet": ["Brazalete de ónice impuro", "Bracelet d'onyx impur", "Bracciale di onice impuro"],
  "Impure Onyx Coin": ["Moneda de ónice impuro", "Pièce d'onyx impur", "Moneta di onice impuro"],
  "Impure Onyx Gloves": ["Guantes de ónice impuro", "Gants d'onyx impur", "Guanti di onice impuro"],
  "Impure Onyx Ingot": ["Lingote de ónice impuro", "Lingot d'onyx impur", "Lingotto di onice impuro"],
  "Impure Onyx Ores": ["Minerales de ónice impuro", "Minerais d'onyx impur", "Minerali di onice impuro"],
  "Impure Onyx Ring": ["Anillo de ónice impuro", "Anneau d'onyx impur", "Anello di onice impuro"],
  "Impure Onyx String": ["Cuerda de ónice impuro", "Ficelle d'onyx impur", "Corda di onice impuro"],
  "Iron Bee Crossbow": ["Ballesta de abeja de hierro", "Arbalète d'abeille en fer", "Balestra dell'ape di ferro"],
  "Iron Ingot": ["Lingote de hierro", "Lingot de fer", "Lingotto di ferro"],
  "Iron Minerals": ["Minerales de hierro", "Minéraux de fer", "Minerali di ferro"],
  /* --- crafting resources, materials and misc. items: J - O --- */
  "Juvenile Bark": ["Corteza juvenil", "Écorce juvénile", "Corteccia giovane"],
  "Juvenile Seed": ["Semilla juvenil", "Graine juvénile", "Seme giovane"],
  "Kasaka Assassin's Fang Dagger": ["Daga de colmillo de asesino de Kasaka", "Dague à croc d'assassin de Kasaka", "Pugnale a zanna dell'assassino di Kasaka"],
  "Kasaka Warrior Fang Dagger": ["Daga de colmillo de guerrero de Kasaka", "Dague à croc de guerrier de Kasaka", "Pugnale a zanna del guerriero di Kasaka"],
  "Kazor's Coin": ["Moneda de Kazor", "Pièce de Kazor", "Moneta di Kazor"],
  "Key of Xal'Zirith": ["Llave de Xal'Zirith", "Clé de Xal'Zirith", "Chiave di Xal'Zirith"],
  "Leaf Fragment": ["Fragmento de hoja", "Fragment de feuille", "Frammento di foglia"],
  "Lien de la Sylve": ["Vínculo de la Sylve", "Lien de la Sylve", "Legame della Sylve"],
  "Love Candy": ["Caramelo de amor", "Bonbon d'amour", "Caramella d'amore"],
  "Love Necklace": ["Collar de amor", "Collier d'amour", "Collana d'amore"],
  "Love Potion": ["Poción de amor", "Potion d'amour", "Pozione d'amore"],
  "Love Stick": ["Vara de amor", "Bâton d'amour", "Bastone d'amore"],
  "Low Corruption Gloves": ["Guantes de corrupción baja", "Gants de faible corruption", "Guanti di bassa corruzione"],
  "Low Corruption Grimoire": ["Grimorio de corrupción baja", "Grimoire de faible corruption", "Grimorio di bassa corruzione"],
  "Luminescent Belt": ["Cinturón luminiscente", "Ceinture luminescente", "Cintura luminescente"],
  "Luminescent Gloves": ["Guantes luminiscentes", "Gants luminescents", "Guanti luminescenti"],
  "Luminescent Spider Venom": ["Veneno de araña luminiscente", "Venin d'araignée luminescente", "Veleno di ragno luminescente"],
  "Lunar Coin": ["Moneda lunar", "Pièce lunaire", "Moneta lunare"],
  "Lunar Dust": ["Polvo lunar", "Poussière lunaire", "Polvere lunare"],
  "Macabre Scythe": ["Guadaña macabra", "Faux macabre", "Falce macabra"],
  "Mage Love Catalyst": ["Catalizador de amor de mago", "Catalyseur d'amour de mage", "Catalizzatore d'amore del mago"],
  "Mage Necromancer Boots": ["Botas de mago nigromante", "Bottes de mage nécromancien", "Stivali del mago negromante"],
  "Mage Necromancer Breastplate": ["Coraza de mago nigromante", "Plastron de mage nécromancien", "Corazza del mago negromante"],
  "Mage Necromancer Helmet": ["Casco de mago nigromante", "Casque de mage nécromancien", "Elmo del mago negromante"],
  "Mage Necromancer Leggings": ["Calzas de mago nigromante", "Jambières de mage nécromancien", "Gambali del mago negromante"],
  "Mage Necromancer Staff": ["Bastón de mago nigromante", "Bâton de mage nécromancien", "Bastone del mago negromante"],
  "Mage Necrotic Scepter": ["Cetro necrótico de mago", "Sceptre nécrotique de mage", "Scettro necrotico del mago"],
  "Mage Winter Catalyst": ["Catalizador de invierno de mago", "Catalyseur d'hiver de mage", "Catalizzatore d'inverno del mago"],
  "Magic Mycelium": ["Micelio mágico", "Mycélium magique", "Micelio magico"],
  "Magic Wood Shard": ["Fragmento de madera mágica", "Éclat de bois magique", "Scheggia di legno magico"],
  "Magical Amethyst Boots": ["Botas de amatista mágica", "Bottes d'améthyste magique", "Stivali di ametista magica"],
  "Magical Amethyst Breastplate": ["Coraza de amatista mágica", "Plastron d'améthyste magique", "Corazza di ametista magica"],
  "Magical Amethyst Helmet": ["Casco de amatista mágica", "Casque d'améthyste magique", "Elmo di ametista magica"],
  "Magical Amethyst Leggings": ["Calzas de amatista mágica", "Jambières d'améthyste magique", "Gambali di ametista magica"],
  "Medium Pouch": ["Bolsa mediana", "Bourse moyenne", "Borsa media"],
  "Merged Shard": ["Fragmento fusionado", "Éclat fusionné", "Scheggia fusa"],
  "Metal Soul Coin": ["Moneda de alma metálica", "Pièce d'âme métallique", "Moneta d'anima metallica"],
  "Metal Soul Ingot": ["Lingote de alma metálica", "Lingot d'âme métallique", "Lingotto d'anima metallica"],
  "Misty Claw": ["Garra brumosa", "Griffe brumeuse", "Artiglio nebbioso"],
  "Misty Fang Boots": ["Botas de colmillo brumoso", "Bottes de croc brumeux", "Stivali di zanna nebbiosa"],
  "Misty Fur": ["Piel brumosa", "Fourrure brumeuse", "Pelliccia nebbiosa"],
  "Misty Tail": ["Cola brumosa", "Queue brumeuse", "Coda nebbiosa"],
  "Mountain Deer Skin": ["Piel de ciervo de montaña", "Peau de cerf de montagne", "Pelle di cervo montano"],
  "Mysticized Honey Boots": ["Botas de miel mística", "Bottes de miel mystifiée", "Stivali di miele misticizzato"],
  "Mysticized Honey Breastplate": ["Coraza de miel mística", "Plastron de miel mystifiée", "Corazza di miele misticizzato"],
  "Mysticized Honey Helmet": ["Casco de miel mística", "Casque de miel mystifiée", "Elmo di miele misticizzato"],
  "Mysticized Honey Leggings": ["Calzas de miel mística", "Jambières de miel mystifiée", "Gambali di miele misticizzato"],
  "Necromancer Powder": ["Polvo de nigromante", "Poudre de nécromancien", "Polvere di negromante"],
  "Oak Board": ["Tablón de roble", "Planche de chêne", "Tavola di quercia"],
  "Oak Log": ["Tronco de roble", "Bûche de chêne", "Tronco di quercia"],
  "Oak Twine": ["Cuerda de roble", "Ficelle de chêne", "Cordicella di quercia"],
  "Occult Token": ["Ficha oculta", "Jeton occulte", "Gettone occulto"],
  "Orange Christmas mittens": ["Manoplas navideñas naranjas", "Moufles de Noël orange", "Muffole natalizie arancioni"],
  "Orange Hematite": ["Hematita naranja", "Hématite orange", "Ematite arancione"],
  "Orc Armor Plating": ["Placas de armadura orca", "Plaques d'armure orque", "Piastre d'armatura orco"],
  "Orc Blood": ["Sangre de orco", "Sang d'orque", "Sangue d'orco"],
  "Orc Heart": ["Corazón de orco", "Cœur d'orque", "Cuore d'orco"],
  "Orc's Eye": ["Ojo de orco", "Œil d'orque", "Occhio d'orco"],
  "Orichalcum Fragment": ["Fragmento de oricalco", "Fragment d'orichalque", "Frammento di oricalco"],
  /* --- crafting resources, materials and misc. items: P - S --- */
  "Piece of Scrap": ["Pieza de chatarra", "Morceau de ferraille", "Pezzo di scarto"],
  "Piece of Scrap Metal": ["Pieza de chatarra metálica", "Morceau de ferraille métallique", "Pezzo di metallo di scarto"],
  "Pink Christmas Mittens": ["Manoplas navideñas rosas", "Moufles de Noël roses", "Muffole natalizie rosa"],
  "Pooh's Ring": ["Anillo de Pooh", "Anneau de Pooh", "Anello di Pooh"],
  "Pure Onyx Amulet": ["Amuleto de ónice puro", "Amulette d'onyx pur", "Amuleto di onice puro"],
  "Pure Onyx Bracelet": ["Brazalete de ónice puro", "Bracelet d'onyx pur", "Bracciale di onice puro"],
  "Pure Onyx Gloves": ["Guantes de ónice puro", "Gants d'onyx pur", "Guanti di onice puro"],
  "Pure Onyx Ingot": ["Lingote de ónice puro", "Lingot d'onyx pur", "Lingotto di onice puro"],
  "Pure Onyx Piece": ["Pieza de ónice puro", "Morceau d'onyx pur", "Pezzo di onice puro"],
  "Pure Onyx Ring": ["Anillo de ónice puro", "Anneau d'onyx pur", "Anello di onice puro"],
  "Purple Spider Carcass": ["Cadáver de araña morada", "Carcasse d'araignée violette", "Carcassa di ragno viola"],
  "Purple Spider Eyes": ["Ojos de araña morada", "Yeux d'araignée violette", "Occhi di ragno viola"],
  "Ravaging Bark": ["Corteza devastadora", "Écorce dévastatrice", "Corteccia devastante"],
  "Ravaging Branch": ["Rama devastadora", "Branche dévastatrice", "Ramo devastante"],
  "Ravaging Heart": ["Corazón devastador", "Cœur dévastateur", "Cuore devastante"],
  "Reaper Amethyst Boots": ["Botas de amatista del segador", "Bottes d'améthyste du faucheur", "Stivali di ametista del mietitore"],
  "Reaper Amethyst Breastplate": ["Coraza de amatista del segador", "Plastron d'améthyste du faucheur", "Corazza di ametista del mietitore"],
  "Reaper Amethyst Leggings": ["Calzas de amatista del segador", "Jambières d'améthyste du faucheur", "Gambali di ametista del mietitore"],
  "Reinforced Skeleton Bone": ["Hueso de esqueleto reforzado", "Os de squelette renforcé", "Osso di scheletro rinforzato"],
  "Reinforced Spider Wire": ["Hilo de araña reforzado", "Fil d'araignée renforcé", "Filo di ragno rinforzato"],
  "Ring of the Dark Woods": ["Anillo del Bosque Oscuro", "Anneau de la Forêt Sombre", "Anello del Bosco Oscuro"],
  "Rippling Feather": ["Pluma ondulante", "Plume ondulante", "Piuma ondulata"],
  "Rotten Heart": ["Corazón podrido", "Cœur pourri", "Cuore marcio"],
  "Rune Orcienne": ["Runa orciana", "Rune orcienne", "Runa dell'orco"],
  "Runic Stone": ["Piedra rúnica", "Pierre runique", "Pietra runica"],
  "S Rank Bow": ["Arco de rango S", "Arc de rang S", "Arco di rango S"],
  "Scrap Twine": ["Cuerda de chatarra", "Ficelle de ferraille", "Cordicella di scarti"],
  "Shaman Orb of Greed": ["Orbe de codicia del chamán", "Orbe d'avidité du chaman", "Sfera dell'avidità dello sciamano"],
  "Shard of the Cursed Hoof": ["Fragmento del casco maldito", "Éclat du sabot maudit", "Scheggia dello zoccolo maledetto"],
  "Shark Shell": ["Caparazón de tiburón", "Carapace de requin", "Guscio di squalo"],
  "Skeleton Skull": ["Cráneo de esqueleto", "Crâne de squelette", "Teschio di scheletro"],
  /* --- crafting resources, materials and misc. items: S - Z --- */
  "Slime Core": ["Núcleo de slime", "Noyau de slime", "Nucleo di melma"],
  "Slime Jelly": ["Gelatina de slime", "Gelée de slime", "Gelatina di melma"],
  "Small Pouch": ["Bolsa pequeña", "Petite bourse", "Borsa piccola"],
  "Souls of Ruin": ["Almas de la ruina", "Âmes de la ruine", "Anime della rovina"],
  "Souls of Ruins": ["Almas de las ruinas", "Âmes des ruines", "Anime delle rovine"],
  "Souls of the Ruins": ["Almas de las ruinas", "Âmes des ruines", "Anime delle rovine"],
  "Soul of the Ruins": ["Almas de las ruinas", "Âmes des ruines", "Anima delle rovine"],
  "Spectral Fabric": ["Tela espectral", "Tissu spectral", "Tessuto spettrale"],
  "Spectral Mane Piece": ["Trozo de melena espectral", "Morceau de crinière spectrale", "Pezzo di criniera spettrale"],
  "Spider Cloth": ["Tela de araña", "Tissu d'araignée", "Tessuto di ragno"],
  "Spider Fabric": ["Tela de araña", "Tissu d'araignée", "Tessuto di ragno"],
  "Spider Violet Eyes": ["Ojos violetas de araña", "Yeux violets d'araignée", "Occhi viola di ragno"],
  "Spider Web Boots": ["Botas de telaraña", "Bottes de toile d'araignée", "Stivali di ragnatela"],
  "Staff of the Mystic Mage Queen": ["Bastón de la reina maga mística", "Bâton de la reine mage mystique", "Bastone della regina maga mistica"],
  "Staff of the Mystic Queen Powerful Mage": [
    "Bastón de la reina mística, mago poderoso",
    "Bâton de la reine mystique, mage puissant", "Bastone della regina mistica, mago potente"
  ],
  "Staff of the Mystic Queen Powerful Shaman": [
    "Bastón de la reina mística, chamán poderoso",
    "Bâton de la reine mystique, chaman puissant", "Bastone della regina mistica, sciamano potente"
  ],
  "Staff of the Mystic Queen Shaman": ["Bastón de la reina mística chamán", "Bâton de la reine mystique chaman", "Bastone della regina mistica sciamano"],
  "Stalking Bee Bow": ["Arco de abeja acechadora", "Arc d'abeille traqueuse", "Arco dell'ape in agguato"],
  "Sword of the Sharp Dart": ["Espada del dardo afilado", "Épée de la flèche acérée", "Spada del dardo affilato"],
  "Sylnovarian Jewel": ["Joya de Sylnovar", "Joyau de Sylnovar", "Gioiello di Sylnovar"],
  "Sylnovarian Leaves": ["Hojas de Sylnovar", "Feuilles de Sylnovar", "Foglie di Sylnovar"],
  "Sylvaerian Jewel": ["Joya de Sylvaer", "Joyau de Sylvaer", "Gioiello di Sylvaer"],
  "Sylvester Bowstring": ["Cuerda de arco de Sylvester", "Corde d'arc de Sylvester", "Corda d'arco di Sylvester"],
  "Tail of the Woods": ["Cola del bosque", "Queue de la forêt", "Coda del bosco"],
  "Thick Skin": ["Piel gruesa", "Peau épaisse", "Pelle spessa"],
  "Titan Bark": ["Corteza de titán", "Écorce de titan", "Corteccia di titano"],
  "Water Harpy Egg": ["Huevo de arpía de agua", "Œuf de harpie aquatique", "Uovo di arpia d'acqua"],
  "Water Warpy Egg": ["Huevo de warpy de agua", "Œuf de warpy aquatique", "Uovo di warpy d'acqua"],
  "Wavy Feather": ["Pluma ondulada", "Plume ondulée", "Piuma ondulata"],
  "Wheat Flower": ["Flor de trigo", "Fleur de blé", "Fiore di grano"],
  "Wheat Leaves": ["Hojas de trigo", "Feuilles de blé", "Foglie di grano"],
  "White Spider Powder": ["Polvo de araña blanca", "Poudre d'araignée blanche", "Polvere di ragno bianco"],
  "White Spider Thread": ["Hilo de araña blanca", "Fil d'araignée blanche", "Filo di ragno bianco"],
  "Wild Amethyst Boots": ["Botas de amatista salvaje", "Bottes d'améthyste sauvage", "Stivali di ametista selvaggia"],
  "Wild Amethyst Breastplate": ["Coraza de amatista salvaje", "Plastron d'améthyste sauvage", "Corazza di ametista selvaggia"],
  "Wild Amethyst Helmet": ["Casco de amatista salvaje", "Casque d'améthyste sauvage", "Elmo di ametista selvaggia"],
  "Wild Amethyst Leggings": ["Calzas de amatista salvaje", "Jambières d'améthyste sauvage", "Gambali di ametista selvaggia"],
  "Wolf Fangs": ["Colmillos de lobo", "Crocs de loup", "Zanne di lupo"],
  "Wolf Fur": ["Piel de lobo", "Fourrure de loup", "Pelliccia di lupo"],
  "Wolves Gloves": ["Guantes de lobo", "Gants de loup", "Guanti di lupo"],
  "Woodfang Boots": ["Botas de Colmillo de Madera", "Bottes de Croc-de-Bois", "Stivali Zanna-di-Legno"],
  "Woodland Fur": ["Piel del bosque", "Fourrure des bois", "Pelliccia del bosco"],
  "Yellow Christmas Mittens": ["Manoplas navideñas amarillas", "Moufles de Noël jaunes", "Muffole natalizie gialle"],
  "Yellow Spider Carcass": ["Cadáver de araña amarilla", "Carcasse d'araignée jaune", "Carcassa di ragno giallo"],
  "Yellow Spider Thread": ["Hilo de araña amarilla", "Fil d'araignée jaune", "Filo di ragno giallo"],
  "Fir board": ["Tablón de abeto", "Planche de sapin", "Tavola di abete"],
  "Fir log": ["Tronco de abeto", "Bûche de sapin", "Tronco di abete"],
  "Fir Twine": ["Cuerda de abeto", "Ficelle de sapin", "Cordicella di abete"],
  /* --- equipment stat and effect labels --- */
  "Attack Damage": ["Daño de ataque", "Dégâts d'attaque", "Danno d'attacco"],
  "Blocking Mastery": ["Maestría de bloqueo", "Maîtrise de blocage", "Maestria di blocco"],
  "Boost Attack Damage": ["Aumenta el daño de ataque", "Augmente les dégâts d'attaque", "Aumenta il danno d'attacco"],
  "Boost Critical Damage": ["Aumenta el daño crítico", "Augmente les dégâts critiques", "Aumenta il danno critico"],
  "Boost Critical Damage Damage": ["Aumenta el daño crítico", "Augmente les dégâts critiques", "Aumenta il danno critico"],
  "Boost Magic Damage": ["Aumenta el daño mágico", "Augmente les dégâts magiques", "Aumenta il danno magico"],
  "Boost Mana Max Regeneration": [
    "Aumenta la regeneración máxima de maná",
    "Augmente la régénération maximale de mana", "Aumenta la rigenerazione massima del mana"
  ],
  "Boost Max Health Regeneration": [
    "Aumenta la regeneración máxima de salud",
    "Augmente la régénération maximale de santé", "Aumenta la rigenerazione massima della salute"
  ],
  "Boost Movement Speed": ["Aumenta la velocidad de movimiento", "Augmente la vitesse de déplacement", "Aumenta la velocità di movimento"],
  "Boost Skill Critical Damage": [
    "Aumenta el daño crítico de habilidad",
    "Augmente les dégâts critiques de compétence", "Aumenta il danno critico delle abilità"
  ],
  "Boost Stamina Max Regeneration": [
    "Aumenta la regeneración máxima de resistencia",
    "Augmente la régénération maximale d'endurance", "Aumenta la rigenerazione massima della stamina"
  ],
  "Boost the Stamina Max": ["Aumenta la resistencia máxima", "Augmente l'endurance maximale", "Aumenta la stamina massima"],
  "Critical Chance Skill": ["Probabilidad de crítico de habilidad", "Chances de critique de compétence", "Probabilità di critico delle abilità"],
  "Critical Damage": ["Daño crítico", "Dégâts critiques", "Danno critico"],
  "Critical Damage Skill": ["Daño crítico de habilidad", "Dégâts critiques de compétence", "Danno critico delle abilità"],
  "Critical Hit Chance": ["Probabilidad de golpe crítico", "Chances de coup critique", "Probabilità di colpo critico"],
  "Crouch Speed": ["Velocidad agachado", "Vitesse accroupi", "Velocità accovacciato"],
  "Damage Critical Hits": ["Daño de golpes críticos", "Dégâts des coups critiques", "Danno dei colpi critici"],
  "Damage Reduction": ["Reducción de daño", "Réduction des dégâts", "Riduzione del danno"],
  "Effect: Cooldown": ["Efecto: tiempo de recarga", "Effet : temps de recharge", "Effetto: tempo di ricarica"],
  "Effect: Critical Damage": ["Efecto: daño crítico", "Effet : dégâts critiques", "Effetto: danno critico"],
  "Effect: Critical Hit": ["Efecto: golpe crítico", "Effet : coup critique", "Effetto: colpo critico"],
  "Effect: Defense Augmentation": ["Efecto: aumento de defensa", "Effet : augmentation de la défense", "Effetto: aumento di difesa"],
  "Effect: Happiness Candy Refill": [
    "Efecto: recarga de caramelos de felicidad",
    "Effet : recharge des bonbons de bonheur", "Effetto: ricarica delle caramelle della felicità"
  ],
  "Effect: Healing": ["Efecto: curación", "Effet : soin", "Effetto: cura"],
  "Effect: Hit Points": ["Efecto: puntos de golpe", "Effet : points de vie", "Effetto: punti vita"],
  "Effect: Increase Vitality": ["Efecto: aumento de vitalidad", "Effet : augmentation de la vitalité", "Effetto: aumento di vitalità"],
  "Effect: Increased Dexterity": ["Efecto: destreza aumentada", "Effet : dextérité augmentée", "Effetto: destrezza aumentata"],
  "Effect: Level Required To Use Food": [
    "Efecto: nivel requerido para usar comida",
    "Effet : niveau requis pour utiliser la nourriture", "Effetto: livello richiesto per usare il cibo"
  ],
  "Effect: Level Required To Use The Crystal": [
    "Efecto: nivel requerido para usar el cristal",
    "Effet : niveau requis pour utiliser le cristal", "Effetto: livello richiesto per usare il cristallo"
  ],
  "Effect: Level Required To Use The Recipe": [
    "Efecto: nivel requerido para usar la receta",
    "Effet : niveau requis pour utiliser la recette", "Effetto: livello richiesto per usare la ricetta"
  ],
  "Effect: Love Candies Refill": ["Efecto: recarga de caramelos de amor", "Effet : recharge des bonbons d'amour", "Effetto: ricarica delle caramelle d'amore"],
  "Effect: Refill Potions Of Happiness": [
    "Efecto: recarga de pociones de felicidad",
    "Effet : recharge des potions de bonheur", "Effetto: ricarica delle pozioni della felicità"
  ],
  "Effect: Regeneration": ["Efecto: regeneración", "Effet : régénération", "Effetto: rigenerazione"],
  "Effect: Repair": ["Efecto: reparación", "Effet : réparation", "Effetto: riparazione"],
  "Effect: Spirit Increase": ["Efecto: aumento de espíritu", "Effet : augmentation de l'esprit", "Effetto: aumento di spirito"],
  "Effect: Stamina": ["Efecto: resistencia", "Effet : endurance", "Effetto: stamina"],
  "Dodge": ["Esquiva", "Esquive", "Schivata"],
  "Falls Reduction": ["Reducción de caídas", "Réduction des chutes", "Riduzione delle cadute"],
  "Health Regeneration": ["Regeneración de salud", "Régénération de santé", "Rigenerazione della salute"],
  "Health Restored": ["Salud restaurada", "Santé restaurée", "Salute ripristinata"],
  "Life Steal": ["Robo de vida", "Vol de vie", "Furto di vita"],
  "Max Health": ["Salud máxima", "Santé maximale", "Salute massima"],
  "Max Health Boost": ["Aumento de salud máxima", "Augmentation de santé maximale", "Aumento della salute massima"],
  "Max Stamina": ["Resistencia máxima", "Endurance maximale", "Stamina massima"],
  "Movement Speed": ["Velocidad de movimiento", "Vitesse de déplacement", "Velocità di movimento"],
  "Physical Damage": ["Daño físico", "Dégâts physiques", "Danno fisico"],
  "Projectile Damage": ["Daño de proyectil", "Dégâts de projectile", "Danno dei proiettili"],
  "Skill Critical Damage": ["Daño crítico de habilidad", "Dégâts critiques de compétence", "Danno critico delle abilità"],
  "Skill Damage": ["Daño de habilidad", "Dégâts de compétence", "Danno delle abilità"],
  "Spell Vampirism": ["Vampirismo de hechizos", "Vampirisme de sorts", "Vampirismo delle magie"],
  "Stamina Regeneration": ["Regeneración de resistencia", "Régénération d'endurance", "Rigenerazione della stamina"],
  "Stamina Restored": ["Resistencia restaurada", "Endurance restaurée", "Stamina ripristinata"],
  "Weapon Damage": ["Daño de arma", "Dégâts d'arme", "Danno dell'arma"],
  /* --- crafting locations (equipment cards: "Crafted in") --- */
  "Accessory Smithy in the Town of Beginnings": [
    "Herrería de accesorios en la Ciudad de los Comienzos",
    "Forge d'accessoires dans la Ville des Commencements", "Fucina di accessori nella Città degli Inizi"
  ],
  Alchemists: ["Alquimistas", "Alchimistes", "Alchimisti"],
  "Arakh'Nol Secret Accessory Smithy": [
    "Herrería secreta de accesorios de Arakh'Nol",
    "Forge secrète d'accessoires d'Arakh'Nol", "Fucina segreta di accessori di Arakh'Nol"
  ],
  "Armorsmith in The Town of Beginnings": [
    "Herrero de armaduras en la Ciudad de los Comienzos",
    "Armurier dans la Ville des Commencements", "Fabbro di armature nella Città degli Inizi"
  ],
  "Armorsmith inside the Labyrinth of the Fallen": [
    "Herrero de armaduras dentro del Laberinto de los Caídos",
    "Armurier à l'intérieur du Labyrinthe des Déchus", "Fabbro di armature nel Labirinto dei Caduti"
  ],
  "Bandit Accessory Reseller": ["Revendedor de accesorios de bandido", "Revendeur d'accessoires de bandit", "Rivenditore di accessori dei banditi"],
  "Basic Accessories Manufacturer in the Town of Beginnings": [
    "Fabricante de accesorios básicos en la Ciudad de los Comienzos",
    "Fabricant d'accessoires basiques dans la Ville des Commencements", "Fabbricante di accessori base nella Città degli Inizi"
  ],
  "Boot Bandit Dealer": ["Vendedor de botas de bandido", "Vendeur de bottes de bandit", "Venditore di stivali dei banditi"],
  "Copper Accessories Blacksmith": ["Herrero de accesorios de cobre", "Forgeron d'accessoires en cuivre", "Fabbro di accessori di rame"],
  "Coppersmith in the Town of Beginnings": [
    "Herrero de cobre en la Ciudad de los Comienzos",
    "Forgeron de cuivre dans la Ville des Commencements", "Fabbro del rame nella Città degli Inizi"
  ],
  "Corrupted Rift Event Dungeon": [
    "Mazmorra del evento de la Grieta Corrupta",
    "Donjon de l'événement de la Faille Corrompue", "Dungeon dell'evento della Faglia Corrotta"
  ],
  "Equipment Merchants / Consumables Merchants": [
    "Mercaderes de equipo / Mercaderes de consumibles",
    "Marchands d'équipement / Marchands de consommables", "Mercanti di equipaggiamento / Mercanti di consumabili"
  ],
  "F1 Tool Merchants": ["Mercaderes de herramientas del piso 1", "Marchands d'outils de l'étage 1", "Mercanti di strumenti del piano 1"],
  "Geldorak Mine Dungeon": ["Mazmorra de la Mina de Geldorak", "Donjon de la Mine de Geldorak", "Dungeon della Miniera di Geldorak"],
  "Hanaka Traveling Merchant": ["Mercader ambulante de Hanaka", "Marchand itinérant de Hanaka", "Mercante ambulante di Hanaka"],
  "Home Town Reshaper": ["Remodelador del pueblo natal", "Remodeleur du village natal", "Rimodellatore del villaggio natale"],
  "Ingot Blacksmith south of the OG District": [
    "Herrero de lingotes al sur del Distrito OG",
    "Forgeron de lingots au sud du Quartier OG", "Fabbro di lingotti a sud del Distretto OG"
  ],
  "Iron Accessories Blacksmith": ["Herrero de accesorios de hierro", "Forgeron d'accessoires en fer", "Fabbro di accessori di ferro"],
  "Iron Accessories Blacksmith in the Town of Beginnings": [
    "Herrero de accesorios de hierro en la Ciudad de los Comienzos",
    "Forgeron d'accessoires en fer dans la Ville des Commencements", "Fabbro di accessori di ferro nella Città degli Inizi"
  ],
  /* The generic Key Blacksmith label the map's key blacksmith markers and the equipment crafting
     locations use. The same wording the map description dictionary already curates, so a marker
     titled "Key Blacksmith" and an item crafted at one read the same in every language. */
  "Key Blacksmith": ["Herrero de llaves", "Forgeron de clés", "Fabbro di chiavi"],
  "Keymaker in front of the Labyrinth of the Fallen": [
    "Fabricante de llaves frente al Laberinto de los Caídos",
    "Fabricant de clés devant le Labyrinthe des Déchus", "Fabbricante di chiavi davanti al Labirinto dei Caduti"
  ],
  "Kobold Tower Dungeon": ["Mazmorra de la Torre de los Kobolds", "Donjon de la Tour des Kobolds", "Dungeon della Torre dei Kobold"],
  "Labyrinth Armorsmith": ["Herrero de armaduras del laberinto", "Armurier du labyrinthe", "Fabbro di armature del labirinto"],
  "Labyrinth of the Fallen": ["Laberinto de los Caídos", "Labyrinthe des Déchus", "Labirinto dei Caduti"],
  "Labyrinth Weaponsmith": ["Herrero de armas del laberinto", "Forgeron d'armes du labyrinthe", "Fabbro di armi del labirinto"],
  "Melliona Hive Dungeon": ["Mazmorra de la Colmena de Melliona", "Donjon de la Ruche de Melliona", "Dungeon dell'Alveare di Melliona"],
  "Melliona Keymaker in Urbus": ["Fabricante de llaves de Melliona en Urbus", "Fabricant de clés de Melliona à Urbus", "Fabbricante di chiavi di Melliona a Urbus"],
  "Merchant in front of the World Boss Kazor Arena": [
    "Mercader frente a la arena del jefe mundial Kazor",
    "Marchand devant l'arène du boss mondial Kazor", "Mercante davanti all'arena del boss mondiale Kazor"
  ],
  "Mizunari Traveling Merchant": ["Mercader ambulante de Mizunari", "Marchand itinérant de Mizunari", "Mercante ambulante di Mizunari"],
  "Occult Artifact Merchant": ["Mercader de artefactos ocultos", "Marchand d'artefacts occultes", "Mercante di manufatti occulti"],
  "Sanctuary Dungeon of Xal'Zirith": ["Mazmorra del Santuario de Xal'Zirith", "Donjon du Sanctuaire de Xal'Zirith", "Dungeon del Santuario di Xal'Zirith"],
  "Secret Accessory Blacksmith at Deer Mountains": [
    "Herrero secreto de accesorios en las Montañas de los Ciervos",
    "Forgeron secret d'accessoires aux Montagnes des Cerfs", "Fabbro segreto di accessori alle Montagne dei Cervi"
  ],
  "Secret Accessory Blacksmith in the Snow Citadel": [
    "Herrero secreto de accesorios en la Ciudadela de Nieve",
    "Forgeron secret d'accessoires à la Citadelle des Neiges", "Fabbro segreto di accessori nella Cittadella delle Nevi"
  ],
  "Secret Accessory Blacksmith in Vallhat": [
    "Herrero secreto de accesorios en Vallhat",
    "Forgeron secret d'accessoires à Vallhat", "Fabbro segreto di accessori a Vallhat"
  ],
  "Secret Accessory Smithy in Aepep's Lair": [
    "Herrería secreta de accesorios en la Guarida de Aepep",
    "Forge secrète d'accessoires dans le Repaire d'Aepep", "Fucina segreta di accessori nella Tana di Aepep"
  ],
  "Secret Accessory Smithy in the Cyclorim Crypt": [
    "Herrería secreta de accesorios en la Cripta de Cyclorim",
    "Forge secrète d'accessoires dans la Crypte de Cyclorim", "Fucina segreta di accessori nella Cripta di Cyclorim"
  ],
  "Secret Accessory Smithy in Wolf Valley": [
    "Herrería secreta de accesorios en el Valle de los Lobos",
    "Forge secrète d'accessoires dans la Vallée des Loups", "Fucina segreta di accessori nella Valle dei Lupi"
  ],
  "the Accessories Merchant": ["el mercader de accesorios", "le marchand d'accessoires", "il mercante di accessori"],
  "the Accessory Blacksmith": ["el herrero de accesorios", "le forgeron d'accessoires", "il fabbro di accessori"],
  "the Accessory Blacksmith in Urbus": ["el herrero de accesorios en Urbus", "le forgeron d'accessoires à Urbus", "il fabbro di accessori a Urbus"],
  "the Adventurer's Shoemaker": ["el zapatero de aventureros", "le cordonnier des aventuriers", "il calzolaio degli avventurieri"],
  "the Amethyst Armorsmith": ["el herrero de armaduras de amatista", "l'armurier d'améthyste", "il fabbro di armature di ametista"],
  "the Amulet Merchant": ["el mercader de amuletos", "le marchand d'amulettes", "il mercante di amuleti"],
  "the Amulet Smith": ["el forjador de amuletos", "le forgeron d'amulettes", "il fabbro di amuleti"],
  "the Ancient Blacksmith": ["el herrero antiguo", "le forgeron ancien", "il fabbro antico"],
  "the Ancient Wood Armorsmith": ["el herrero de armaduras de madera antigua", "l'armurier en bois ancien", "il fabbro di armature di legno antico"],
  "the Armorsmith in the Sweet Forest": ["el herrero de armaduras del Bosque Dulce", "l'armurier de la Forêt Sucrée", "il fabbro di armature della Foresta Dolce"],
  "the Armorsmith outside the Necromancer's Tomb Dungeon": [
    "el herrero de armaduras fuera de la mazmorra de la Tumba del Nigromante",
    "l'armurier à l'extérieur du donjon de la Tombe du Nécromancien", "il fabbro di armature fuori dal Dungeon della Tomba del Negromante"
  ],
  "the Artifact Merchant": ["el mercader de artefactos", "le marchand d'artefacts", "il mercante di manufatti"],
  "the Bauxite Accessories Blacksmith, south of the Millennium Baobab": [
    "el herrero de accesorios de bauxita, al sur del Baobab Milenario",
    "le forgeron d'accessoires en bauxite, au sud du Baobab Millénaire", "il fabbro di accessori di bauxite, a sud del Baobab Millenario"
  ],
  "the Bracelet Merchant": ["el mercader de brazaletes", "le marchand de bracelets", "il mercante di bracciali"],
  "the Braceletsmith": ["el herrero de brazaletes", "le forgeron de bracelets", "il fabbro di bracciali"],
  "the Glove Merchant": ["el mercader de guantes", "le marchand de gants", "il mercante di guanti"],
  "the Glovesmith": ["el herrero de guantes", "le forgeron de gants", "il fabbro di guanti"],
  "the Impure Onyx Accessory Smithy, South of Taran": [
    "la herrería de accesorios de ónice impuro, al sur de Taran",
    "la forge d'accessoires d'onyx impur, au sud de Taran", "la fucina di accessori di onice impuro, a sud di Taran"
  ],
  "the Ingot Blacksmith in Urbus": ["el herrero de lingotes en Urbus", "le forgeron de lingots à Urbus", "il fabbro di lingotti a Urbus"],
  "the Ingot Smithy East of Marome": [
    "la herrería de lingotes al este de Marome",
    "la forge de lingots à l'est de Marome", "la fucina di lingotti a est di Marome"
  ],
  "the Kaelor Accessories Merchant": ["el mercader de accesorios de Kaelor", "le marchand d'accessoires de Kaelor", "il mercante di accessori di Kaelor"],
  "the Kaelor Accessory Smithy": ["la herrería de accesorios de Kaelor", "la forge d'accessoires de Kaelor", "la fucina di accessori di Kaelor"],
  "the Necromancer's Forgotten Tomb Dungeon": [
    "la mazmorra de la Tumba Olvidada del Nigromante",
    "le donjon de la Tombe Oubliée du Nécromancien", "il Dungeon della Tomba Dimenticata del Negromante"
  ],
  "the Occult Amulet Merchant": ["el mercader de amuletos ocultos", "le marchand d'amulettes occultes", "il mercante di amuleti occulti"],
  "the Occult Artifact Merchant": ["el mercader de artefactos ocultos", "le marchand d'artefacts occultes", "il mercante di manufatti occulti"],
  "the Occult Bracelet Merchant": ["el mercader de brazaletes ocultos", "le marchand de bracelets occultes", "il mercante di bracciali occulti"],
  "the Occult Gloves Merchant": ["el mercader de guantes ocultos", "le marchand de gants occultes", "il mercante di guanti occulti"],
  "the Occult Ring Merchant": ["el mercader de anillos ocultos", "le marchand d'anneaux occultes", "il mercante di anelli occulti"],
  "the Pure Onyx Accessory Blacksmith": [
    "el herrero de accesorios de ónice puro",
    "le forgeron d'accessoires d'onyx pur", "il fabbro di accessori di onice puro"
  ],
  "the Pure Onyx Accessory Smithy, located in the Rift Caves southeast of Tier 2": [
    "la herrería de accesorios de ónice puro, situada en las Cuevas de la Grieta al sureste del Nivel 2",
    "la forge d'accessoires d'onyx pur, située dans les Grottes de la Faille au sud-est du Niveau 2", "la fucina di accessori di onice puro, situata nelle Caverne della Faglia a sud-est del Livello 2"
  ],
  "the Reinforced Tool Merchant": ["el mercader de herramientas reforzadas", "le marchand d'outils renforcés", "il mercante di strumenti rinforzati"],
  "the Ring Merchant": ["el mercader de anillos", "le marchand d'anneaux", "il mercante di anelli"],
  "the Ringsmith": ["el herrero de anillos", "le forgeron de bagues", "il fabbro di anelli"],
  "the Secret Accessory Smith in Emerald Wings Forest": [
    "el herrero secreto de accesorios del Bosque de Alas Esmeralda",
    "le forgeron secret d'accessoires de la Forêt des Ailes d'Émeraude", "il fabbro segreto di accessori della Foresta delle Ali di Smeraldo"
  ],
  "the Secret Accessory Smith in the Blaze Nest": [
    "el herrero secreto de accesorios del Nido de Brasas",
    "le forgeron secret d'accessoires du Nid des Braises", "il fabbro segreto di accessori del Nido delle Braci"
  ],
  "the Secret Accessory Smith in the Sanctuary of Khesûn": [
    "el herrero secreto de accesorios del Santuario de Khesûn",
    "le forgeron secret d'accessoires du Sanctuaire de Khesûn", "il fabbro segreto di accessori del Santuario di Khesûn"
  ],
  "the Secret Accessory Smithy in Bull Lake": [
    "la herrería secreta de accesorios del Lago de los Toros",
    "la forge secrète d'accessoires du Lac des Taureaux", "la fucina segreta di accessori del Lago dei Tori"
  ],
  "the Secret Accessory Smithy in Swaying Monster Bay": [
    "la herrería secreta de accesorios de la Bahía de Monstruos Ondulantes",
    "la forge secrète d'accessoires de la Baie des monstres ondoyants", "la fucina segreta di accessori della Baia dei Mostri Ondulanti"
  ],
  "the Secret Accessory Smithy in the Sweet Forest, in Boss Winnie's Lair": [
    "la herrería secreta de accesorios del Bosque Dulce, en la Guarida del jefe Winnie",
    "la forge secrète d'accessoires de la Forêt Sucrée, dans le Repaire du boss Winnie", "la fucina segreta di accessori della Foresta Dolce, nella Tana del boss Winnie"
  ],
  "the Secret Corruption Accessory Smithy at Tier 2": [
    "la herrería secreta de accesorios de corrupción en el Nivel 2",
    "la forge secrète d'accessoires de corruption au Niveau 2", "la fucina segreta di accessori di corruzione al Livello 2"
  ],
  "the Sweet Forest Weaponsmith": ["el herrero de armas del Bosque Dulce", "le forgeron d'armes de la Forêt Sucrée", "il fabbro di armi della Foresta Dolce"],
  "the Tomb Key Maker in Urbus": [
    "el fabricante de llaves de la tumba en Urbus",
    "le fabricant de clés de la tombe à Urbus", "il fabbricante di chiavi della tomba a Urbus"
  ],
  "the Weaponsmith outside the Necromancer's Tomb Dungeon": [
    "el herrero de armas fuera de la mazmorra de la Tumba del Nigromante",
    "le forgeron d'armes à l'extérieur du donjon de la Tombe du Nécromancien", "il fabbro di armi fuori dal Dungeon della Tomba del Negromante"
  ],
  "Tier 2 Tool Merchants": ["Mercaderes de herramientas del Nivel 2", "Marchands d'outils du Niveau 2", "Mercanti di strumenti del Livello 2"],
  "Tolbana Accessories Merchant": ["Mercader de accesorios de Tolbana", "Marchand d'accessoires de Tolbana", "Mercante di accessori di Tolbana"],
  "Tolbana Armorsmith": ["Herrero de armaduras de Tolbana", "Armurier de Tolbana", "Fabbro di armature di Tolbana"],
  "Tolbana Traveling Merchant": ["Mercader ambulante de Tolbana", "Marchand itinérant de Tolbana", "Mercante ambulante di Tolbana"],
  "Tolbana Weaponsmith": ["Herrero de armas de Tolbana", "Forgeron d'armes de Tolbana", "Fabbro di armi di Tolbana"],
  "Tower of Kobold": ["Torre de los Kobolds", "Tour des Kobolds", "Torre dei Kobold"],
  "Traveling Merchant": ["Mercader ambulante", "Marchand itinérant", "Mercante ambulante"],
  "Traveling Merchant / Alchemists": ["Mercader ambulante / Alquimistas", "Marchand itinérant / Alchimistes", "Mercante ambulante / Alchimisti"],
  "Traveling Merchant Boar Zone": [
    "Mercader ambulante de la Zona de Jabalíes",
    "Marchand itinérant de la Zone des Sangliers", "Mercante ambulante della Zona dei Cinghiali"
  ],
  "Traveling Merchant Hanaka & Vallhat": [
    "Mercader ambulante de Hanaka y Vallhat",
    "Marchand itinérant de Hanaka et Vallhat", "Mercante ambulante di Hanaka e Vallhat"
  ],
  "Traveling Merchant in the Boar Zone": [
    "Mercader ambulante en la Zona de Jabalíes",
    "Marchand itinérant dans la Zone des Sangliers", "Mercante ambulante nella Zona dei Cinghiali"
  ],
  "Traveling Merchant Vallhat": ["Mercader ambulante de Vallhat", "Marchand itinérant de Vallhat", "Mercante ambulante di Vallhat"],
  "Traveling Merchant Virelune, Arakh'Nol & Tolbana": [
    "Mercader ambulante de Virelune, Arakh'Nol y Tolbana",
    "Marchand itinérant de Virelune, Arakh'Nol et Tolbana", "Mercante ambulante di Virelune, Arakh'Nol e Tolbana"
  ],
  "Vallhat Accessories Merchant": ["Mercader de accesorios de Vallhat", "Marchand d'accessoires de Vallhat", "Mercante di accessori di Vallhat"],
  "Weaponsmith in The Town of Beginnings": [
    "Herrero de armas en la Ciudad de los Comienzos",
    "Forgeron d'armes dans la Ville des Commencements", "Fabbro di armi nella Città degli Inizi"
  ],
  "Weaponsmith outside the Labyrinth of the Fallen": [
    "Herrero de armas fuera del Laberinto de los Caídos",
    "Forgeron d'armes à l'extérieur du Labyrinthe des Déchus", "Fabbro di armi fuori dal Labirinto dei Caduti"
  ],
  /* --- shop and NPC map descriptions (marker labels) --- */
  "Accessories Blacksmith": ["Herrero de accesorios", "Forgeron d'accessoires", "Fabbro di accessori"],
  "Accessories Merchant": ["Mercader de accesorios", "Marchand d'accessoires", "Mercante di accessori"],
  "Accessories Bandit Blacksmith": ["Herrero de accesorios de bandidos", "Forgeron d'accessoires de bandits", "Fabbro di accessori dei banditi"],
  "Simple Accessories Merchant": ["Mercader de accesorios sencillos", "Marchand d'accessoires simples", "Mercante di accessori semplici"],
  /* --- Current-Data names the Sewer Reshaper, the Sylve Accessories and the Gelatinous Cloak
     update adds. The English data stays the source of truth; these terms let the Spanish and
     French pages resolve the same wording instead of leaving English words inside a translated
     sentence. The ingredient names are carried exactly as the data spells them, plural or
     singular. --- */
  "Materials Blacksmith": ["Herrero de materiales", "Forgeron de matériaux", "Fabbro di materiali"],
  "World Event": ["Evento mundial", "Événement mondial", "Evento mondiale"],
  "Sewer Reshaper": ["Remodelador de cloacas", "Remodeleur d'égouts", "Rimodellatore delle fogne"],
  "Sylve Accessories": ["Accesorios de Sylve", "Accessoires de Sylve", "Accessori di Sylve"],
  "Secret Gelatinous Cloak": ["Capa gelatinosa secreta", "Cape gélatineuse secrète", "Mantello gelatinoso segreto"],
  "Gelatinous Cloak": ["Capa gelatinosa", "Cape gélatineuse", "Mantello gelatinoso"],
  "Bracelet of the Sylvan": ["Brazalete del silvano", "Bracelet du sylvestre", "Bracciale del silvano"],
  "Amulet of the Sylvan": ["Amuleto del silvano", "Amulette du sylvestre", "Amuleto del silvano"],
  "Ring of the Sylve": ["Anillo de Sylve", "Anneau de Sylve", "Anello di Sylve"],
  "Sylvan Set": ["Conjunto silvano", "Ensemble sylvestre", "Set silvano"],
  "Slime Essence": ["Esencia de slime", "Essence de slime", "Essenza di melma"],
  "Slime Tear": ["Lágrima de slime", "Larme de slime", "Lacrima di melma"],
  "Essence Slime": ["Slime de esencia", "Slime d'essence", "Melma d'essenza"],
  "Tear Slime": ["Slime de lágrima", "Slime de larme", "Melma di lacrima"],
  "Stolen Cloak": ["Capa robada", "Cape volée", "Mantello rubato"],
  "Oak Logs": ["Troncos de roble", "Bûches de chêne", "Tronchi di quercia"],
  "Magic Wood Shards": ["Fragmentos de madera mágica", "Éclats de bois magique", "Schegge di legno magico"],
  "Impure Onyx Accessories Blacksmith.": [
    "Herrero de accesorios de ónice impuro.",
    "Forgeron d'accessoires d'onyx impur.", "Fabbro di accessori di onice impuro."
  ],
  "Pure Onyx Accessories Blacksmith.": ["Herrero de accesorios de ónice puro.", "Forgeron d'accessoires d'onyx pur.", "Fabbro di accessori di onice puro."],
  /* --- ore and material plural forms --- */
  Ores: ["Minerales", "Minerais", "Minerali"],
  "Iron Ores": ["Minerales de hierro", "Minerais de fer", "Minerali di ferro"],
  /* --- word-level terms the name families below are built from --- */
  Accessories: ["Accesorios", "Accessoires", "Accessori"],
  Boar: ["Jabalí", "Sanglier", "Cinghiale"],
  Glutinous: ["Glutinoso", "Glutineux", "Glutinoso"],
  Hunter: ["Cazador", "Chasseur", "Cacciatore"],
  Magical: ["Mágico", "Magique", "Magico"],
  Plating: ["Placas", "Plaques", "Piastre"],
  Reaper: ["Segador", "Faucheur", "Mietitore"],
  Sickle: ["Hoz", "Faucille", "Falce"],
  Woodland: ["Bosque", "Forêt", "Foresta"],
  billhook: ["Podadera", "Serpe", "roncola"],
  /* --- map titles that mix the words above (full phrases so the word order stays natural) --- */
  "Corrupted Boar Accessories": ["Accesorios de jabalí corrupto", "Accessoires de sanglier corrompu", "Accessori del cinghiale corrotto"],
  "Glutinous Loot Buyer": ["Comprador de botín glutinoso", "Acheteur de butin glutineux", "Acquirente di bottino glutinoso"],
  "Iron/Copper Accessories": ["Accesorios de hierro y cobre", "Accessoires de fer et de cuivre", "Accessori di ferro e rame"],
  /* --- "Ancient Woodland" / "Ancient Wood" armor sets (the set suffix names a variant) --- */
  "Ancient Wood Leggings Reaper": ["Calzas de madera antigua del segador", "Jambières de bois ancien du faucheur", "Gambali di legno antico del mietitore"],
  "Ancient Woodland Boots Hunter": ["Botas del cazador del Bosque Antiguo", "Bottes du chasseur de la Forêt Ancienne", "Stivali del cacciatore della Foresta Antica"],
  "Ancient Woodland Boots Reaper": ["Botas del segador del Bosque Antiguo", "Bottes du faucheur de la Forêt Ancienne", "Stivali del mietitore della Foresta Antica"],
  "Ancient Woodland Leggings Hunter": [
    "Calzas del cazador del Bosque Antiguo",
    "Jambières du chasseur de la Forêt Ancienne", "Gambali del cacciatore della Foresta Antica"
  ],
  "Fierce Ancient Woodland Boots": ["Botas feroces del Bosque Antiguo", "Bottes féroces de la Forêt Ancienne", "Stivali feroci della Foresta Antica"],
  "Magical Ancient Woodland Boots": ["Botas mágicas del Bosque Antiguo", "Bottes magiques de la Forêt Ancienne", "Stivali magici della Foresta Antica"],
  "Magical Ancient Woodland Helmet": ["Casco mágico del Bosque Antiguo", "Casque magique de la Forêt Ancienne", "Elmo magico della Foresta Antica"],
  "Wild Ancient Woodland Boots": ["Botas salvajes del Bosque Antiguo", "Bottes sauvages de la Forêt Ancienne", "Stivali selvaggi della Foresta Antica"],
  "Helm of the Ancient Woods Reaper": [
    "Yelmo del segador de los Bosques Antiguos",
    "Heaume du faucheur des Bois Anciens", "Elmo del mietitore dei Boschi Antichi"
  ],
  "Helmet of the Ancient Woods Hunter": [
    "Casco del cazador de los Bosques Antiguos",
    "Casque du chasseur des Bois Anciens", "Elmo del cacciatore dei Boschi Antichi"
  ],
  /* --- "Reaper" / "Hunter" sets, the Fallen variants and the hooked-blade weapons --- */
  "Amethyst Reaper Helm": ["Yelmo de amatista del segador", "Heaume d'améthyste du faucheur", "Elmo di ametista del mietitore"],
  "Fallen Gloves of the Hunter": ["Guantes caídos del cazador", "Gants déchus du chasseur", "Guanti caduti del cacciatore"],
  "Fallen Hunter Amulet": ["Amuleto caído del cazador", "Amulette déchue du chasseur", "Amuleto caduto del cacciatore"],
  "Glutinous Amulet": ["Amuleto glutinoso", "Amulette glutineuse", "Amuleto glutinoso"],
  "Glutinous Ring": ["Anillo glutinoso", "Anneau glutineux", "Anello glutinoso"],
  "Goblin Armor Plating": ["Placas de armadura de goblin", "Plaques d'armure de gobelin", "Piastre d'armatura di goblin"],
  "Hunter's Boots": ["Botas del cazador", "Bottes du chasseur", "Stivali del cacciatore"],
  "Reaper Boots": ["Botas del segador", "Bottes du faucheur", "Stivali del mietitore"],
  "Reaper Breastplate": ["Coraza del segador", "Plastron du faucheur", "Corazza del mietitore"],
  "Reaper Helmet": ["Casco del segador", "Casque du faucheur", "Elmo del mietitore"],
  "Reaper Leggings": ["Calzas del segador", "Jambières du faucheur", "Gambali del mietitore"],
  "Reaper Ring": ["Anillo del segador", "Anneau du faucheur", "Anello del mietitore"],
  "Necromancer billhook": ["Podadera de nigromante", "Serpe de nécromancien", "Roncola del negromante"],
  "Scythe billhook": ["Podadera de guadaña", "Serpe de faux", "Roncola a falce"],
  "Twisted Sickle": ["Hoz torcida", "Faucille tordue", "Falce contorta"],
  /* --- stat and effect labels ("<Stat> Fortifier II", "Fortifying <Stat> I", "[Quality] ...") --- */
  "Endurance Buff II": ["Mejora de aguante II", "Bonus d'endurance II", "Potenziamento di stamina II"],
  "Endurance Buff III": ["Mejora de aguante III", "Bonus d'endurance III", "Potenziamento di stamina III"],
  "Endurance Fortifier I": ["Potenciador de aguante I", "Renforcement d'endurance I", "Rinforzante di stamina I"],
  "Ferocity Buff II": ["Mejora de ferocidad II", "Bonus de férocité II", "Potenziamento di ferocia II"],
  "Ferocity Buff III": ["Mejora de ferocidad III", "Bonus de férocité III", "Potenziamento di ferocia III"],
  "Fortifier of Ferocity I": ["Potenciador de ferocidad I", "Renforcement de férocité I", "Rinforzante di ferocia I"],
  "Knowledge Buff II": ["Mejora de conocimiento II", "Bonus de connaissance II", "Potenziamento di conoscenza II"],
  "Knowledge Buff III": ["Mejora de conocimiento III", "Bonus de connaissance III", "Potenziamento di conoscenza III"],
  "Knowledge Fortifier I": ["Potenciador de conocimiento I", "Renforcement de connaissance I", "Rinforzante di conoscenza I"],
  "Patience Fortifier I": ["Potenciador de paciencia I", "Renforcement de patience I", "Rinforzante di pazienza I"],
  "Patience Fortifier II": ["Potenciador de paciencia II", "Renforcement de patience II", "Rinforzante di pazienza II"],
  "Patience Strengthener III": ["Fortalecedor de paciencia III", "Renforçateur de patience III", "Rinforzo di pazienza III"],
  "Resistance Buff III": ["Mejora de resistencia III", "Bonus de résistance III", "Potenziamento di resistenza III"],
  "Resistance Fortifier I": ["Potenciador de resistencia I", "Renforcement de résistance I", "Rinforzante di resistenza I"],
  "Resistance Fortifier II": ["Potenciador de resistencia II", "Renforcement de résistance II", "Rinforzante di resistenza II"],
  "Vitality Fortifier I": ["Potenciador de vitalidad I", "Renforcement de vitalité I", "Rinforzante di vitalità I"],
  "Vitality Fortifier II": ["Potenciador de vitalidad II", "Renforcement de vitalité II", "Rinforzante di vitalità II"],
  "Vitality Fortifier III": ["Potenciador de vitalidad III", "Renforcement de vitalité III", "Rinforzante di vitalità III"],
  /* --- the same labels as they appear on quality-tiered items --- */
  "[Quality] Endurance Fortifier I": ["[Calidad] Potenciador de aguante I", "[Qualité] Renforcement d'endurance I", "[Qualità] Rinforzante di stamina I"],
  "[Quality] Endurance Fortifier II": ["[Calidad] Potenciador de aguante II", "[Qualité] Renforcement d'endurance II", "[Qualità] Rinforzante di stamina II"],
  "[Quality] Endurance Fortifier III": [
    "[Calidad] Potenciador de aguante III",
    "[Qualité] Renforcement d'endurance III", "[Qualità] Rinforzante di stamina III"
  ],
  "[Quality] Fortifying Ferocity I": ["[Calidad] Ferocidad fortalecedora I", "[Qualité] Férocité fortifiante I", "[Qualità] Ferocia fortificante I"],
  "[Quality] Fortifying Ferocity II": ["[Calidad] Ferocidad fortalecedora II", "[Qualité] Férocité fortifiante II", "[Qualità] Ferocia fortificante II"],
  "[Quality] Fortifying Ferocity III": ["[Calidad] Ferocidad fortalecedora III", "[Qualité] Férocité fortifiante III", "[Qualità] Ferocia fortificante III"],
  "[Quality] Fortifying Patience II": ["[Calidad] Paciencia fortalecedora II", "[Qualité] Patience fortifiante II", "[Qualità] Pazienza fortificante II"],
  "[Quality] Fortifying Patience III": ["[Calidad] Paciencia fortalecedora III", "[Qualité] Patience fortifiante III", "[Qualità] Pazienza fortificante III"],
  "[Quality] Fortifying Vitality II": ["[Calidad] Vitalidad fortalecedora II", "[Qualité] Vitalité fortifiante II", "[Qualità] Vitalità fortificante II"],
  "[Quality] Resistance Fortifier I": [
    "[Calidad] Potenciador de resistencia I",
    "[Qualité] Renforcement de résistance I", "[Qualità] Rinforzante di resistenza I"
  ],
  "[Quality] Resistance Fortifier II": [
    "[Calidad] Potenciador de resistencia II",
    "[Qualité] Renforcement de résistance II", "[Qualità] Rinforzante di resistenza II"
  ],
  "[Quality] Resistance Fortifier III": [
    "[Calidad] Potenciador de resistencia III",
    "[Qualité] Renforcement de résistance III", "[Qualità] Rinforzante di resistenza III"
  ],
  "[Quality] Strengthening Knowledge I": [
    "[Calidad] Conocimiento fortalecedor I",
    "[Qualité] Connaissance fortifiante I", "[Qualità] Conoscenza fortificante I"
  ],
  "[Quality] Strengthening Knowledge II": [
    "[Calidad] Conocimiento fortalecedor II",
    "[Qualité] Connaissance fortifiante II", "[Qualità] Conoscenza fortificante II"
  ],
  "[Quality] Strengthening Knowledge III": [
    "[Calidad] Conocimiento fortalecedor III",
    "[Qualité] Connaissance fortifiante III", "[Qualità] Conoscenza fortificante III"
  ],
  "[Quality] Strengthening Patience I": ["[Calidad] Paciencia fortalecedora I", "[Qualité] Patience fortifiante I", "[Qualità] Pazienza fortificante I"],
  "[Quality] Vitality Fortifier I": ["[Calidad] Potenciador de vitalidad I", "[Qualité] Renforcement de vitalité I", "[Qualità] Rinforzante di vitalità I"],
  "[Quality] Vitality Fortifier III": [
    "[Calidad] Potenciador de vitalidad III",
    "[Qualité] Renforcement de vitalité III", "[Qualità] Rinforzante di vitalità III"
  ],
  /* --- remaining equipment names from the token-glossary gap --- */
  "Halloween Crystal": ["Cristal de Halloween", "Cristal d'Halloween", "Cristallo di Halloween"],
  "Key to the Forgotten Tomb": ["Llave de la tumba olvidada", "Clé de la tombe oubliée", "Chiave della tomba dimenticata"],
  "Skeletal Amulet": ["Amuleto esquelético", "Amulette squelettique", "Amuleto scheletrico"],
  "Wild Boar Meat": ["Carne de jabalí salvaje", "Viande de sanglier sauvage", "Carne di cinghiale selvatico"],
  /* --- words shared by several of the families above --- */
  Buff: ["Mejora", "Bonus", "Potenziamento"],
  Endurance: ["Aguante", "Endurance", "Stamina"],
  Ferocity: ["Ferocidad", "Férocité", "Ferocia"],
  Knowledge: ["Conocimiento", "Connaissance", "Conoscenza"],
  Patience: ["Paciencia", "Patience", "Pazienza"],
  Resistance: ["Resistencia", "Résistance", "Resistenza"],
  Spider: ["Araña", "Araignée", "Ragno"],
  Tomb: ["Tumba", "Tombe", "Tomba"],
  Vitality: ["Vitalidad", "Vitalité", "Vitalità"],
  "Misty Wolf": ["Lobo brumoso", "Loup brumeux", "Lupo nebbioso"],
  /* --- equipment and accessory names curated by the EN/ES/FR quality pass: [Quality] tags and A - C --- */
  "[Quality] Mana V Potion": ["[Calidad] Poción de maná V", "[Qualité] Potion de mana V", "[Qualità] Pozione di mana V"],
  "[Quality] Stamina I Potion": ["[Calidad] Poción de resistencia I", "[Qualité] Potion d'endurance I", "[Qualità] Pozione di stamina I"],
  "[Quality] Stamina II Potion": ["[Calidad] Poción de resistencia II", "[Qualité] Potion d'endurance II", "[Qualità] Pozione di stamina II"],
  "[Quality] Stamina III Potion": ["[Calidad] Poción de resistencia III", "[Qualité] Potion d'endurance III", "[Qualità] Pozione di stamina III"],
  "[Quality] Stamina IV Potion": ["[Calidad] Poción de resistencia IV", "[Qualité] Potion d'endurance IV", "[Qualità] Pozione di stamina IV"],
  "[Quality] Stamina V Potion": ["[Calidad] Poción de resistencia V", "[Qualité] Potion d'endurance V", "[Qualità] Pozione di stamina V"],
  "[Quality] Stamina VI Potion": ["[Calidad] Poción de resistencia VI", "[Qualité] Potion d'endurance VI", "[Qualità] Pozione di stamina VI"],
  "Adventurer's Boots": ["Botas de aventurero", "Bottes d'aventurier", "Stivali dell'avventuriero"],
  "Adventurer's Ring": ["Anillo de aventurero", "Anneau d'aventurier", "Anello dell'avventuriero"],
  "Affordable Belt": ["Cinturón asequible", "Ceinture abordable", "Cintura accessibile"],
  "Affordable Gloves": ["Guantes asequibles", "Gants abordables", "Guanti accessibili"],
  "Affordable Necklace": ["Collar asequible", "Collier abordable", "Collana accessibile"],
  "Affordable Ring": ["Anillo asequible", "Anneau abordable", "Anello accessibile"],
  "Amethyst Amulet": ["Amuleto de amatista", "Amulette d'améthyste", "Amuleto di ametista"],
  "Amethyst Boots": ["Botas de amatista", "Bottes d'améthyste", "Stivali di ametista"],
  "Amethyst Gloves": ["Guantes de amatista", "Gants d'améthyste", "Guanti di ametista"],
  "Amethyst Ring": ["Anillo de amatista", "Anneau d'améthyste", "Anello di ametista"],
  "Amulet of the Corrupted Rift": ["Amuleto de la Grieta Corrupta", "Amulette de la Faille Corrompue", "Amuleto della Faglia Corrotta"],
  "Ancient Bark": ["Corteza antigua", "Écorce ancienne", "Corteccia antica"],
  "Ancient Woods Ticket": ["Entrada de los Bosques Antiguos", "Billet des Bois Anciens", "Biglietto dei Boschi Antichi"],
  "Andesite Gloves": ["Guantes de andesita", "Gants d'andésite", "Guanti di andesite"],
  "Andesite Necklace": ["Collar de andesita", "Collier d'andésite", "Collana di andesite"],
  "Andesite Ring": ["Anillo de andesita", "Anneau d'andésite", "Anello di andesite"],
  "Archer Necromancer Breastplate": ["Coraza de nigromante arquero", "Plastron de nécromancien archer", "Corazza del negromante arciere"],
  "Artifact of the Fallen": ["Artefacto de los Caídos", "Artefact des Déchus", "Manufatto dei Caduti"],
  "Ash Crossbow": ["Ballesta de fresno", "Arbalète de frêne", "Balestra di frassino"],
  "Assassin Necromancer Breastplate": ["Coraza de nigromante asesino", "Plastron de nécromancien assassin", "Corazza del negromante assassino"],
  "Assassin Necromancer Leggings": ["Calzas de nigromante asesino", "Jambières de nécromancien assassin", "Gambali del negromante assassino"],
  "Azure Feather": ["Pluma azur", "Plume azur", "Piuma azzurra"],
  "Bandit Crossbow": ["Ballesta de bandido", "Arbalète de bandit", "Balestra del bandito"],
  "Bandit Dagger": ["Daga de bandido", "Dague de bandit", "Pugnale del bandito"],
  "Bandit Gloves": ["Guantes de bandido", "Gants de bandit", "Guanti del bandito"],
  "Bandits Ticket": ["Entrada de bandidos", "Billet de bandits", "Biglietto dei banditi"],
  "Barley Sugar": ["Azúcar de cebada", "Sucre d'orge", "Zucchero d'orzo"],
  "Bauxite Gloves": ["Guantes de bauxita", "Gants de bauxite", "Guanti di bauxite"],
  "Bauxite Ring": ["Anillo de bauxita", "Anneau de bauxite", "Anello di bauxite"],
  "Bear Belt": ["Cinturón de oso", "Ceinture d'ours", "Cintura d'orso"],
  "Bear Gloves": ["Guantes de oso", "Gants d'ours", "Guanti d'orso"],
  "Bear Ring": ["Anillo de oso", "Anneau d'ours", "Anello d'orso"],
  "Beginner Leggings": ["Calzas de principiante", "Jambières de débutant", "Gambali da principiante"],
  "Beginner's Boots": ["Botas de principiante", "Bottes de débutant", "Stivali da principiante"],
  "Beginner's Tunic": ["Túnica de principiante", "Tunique de débutant", "Tunica da principiante"],
  "Corrupted Rift Belt": ["Cinturón de la Grieta Corrupta", "Ceinture de la Faille Corrompue", "Cintura della Faglia Corrotta"],
  "Corrupted Rift Gloves": ["Guantes de la Grieta Corrupta", "Gants de la Faille Corrompue", "Guanti della Faglia Corrotta"],
  "Corrupted Rift Necklace": ["Collar de la Grieta Corrupta", "Collier de la Faille Corrompue", "Collana della Faglia Corrotta"],
  "Cracked Pickaxe": ["Pico agrietado", "Pioche fissurée", "Piccone incrinato"],
  "Dagger Nodachi": ["Daga nodachi", "Dague nodachi", "Pugnale nodachi"],
  "Dark Dagger": ["Daga oscura", "Dague sombre", "Pugnale oscuro"],
  "Dark Mage Staff": ["Bastón de mago oscuro", "Bâton de mage sombre", "Bastone del mago oscuro"],
  "Dark Shaman Staff": ["Bastón de chamán oscuro", "Bâton de chaman sombre", "Bastone dello sciamano oscuro"],
  "Dark Shard": ["Fragmento oscuro", "Éclat sombre", "Scheggia oscura"],
  "Deer Belt": ["Cinturón de ciervo", "Ceinture de cerf", "Cintura di cervo"],
  "Deer Gloves": ["Guantes de ciervo", "Gants de cerf", "Guanti di cervo"],
  "Druid's Fallen Amulet": ["Amuleto caído del druida", "Amulette déchue du druide", "Amuleto caduto del druido"],
  "Earth Bark": ["Corteza de tierra", "Écorce de terre", "Corteccia di terra"],
  "Explorer's Boots": ["Botas de explorador", "Bottes d'explorateur", "Stivali dell'esploratore"],
  "Fake Love": ["Amor falso", "Faux amour", "Amore falso"],
  "Fallen Boots of the Thief": ["Botas caídas del ladrón", "Bottes déchues du voleur", "Stivali caduti del ladro"],
  "Fallen Bow": ["Arco caído", "Arc déchu", "Arco caduto"],
  "Fallen Crossbow": ["Ballesta caída", "Arbalète déchue", "Balestra caduta"],
  "Fallen Dagger": ["Daga caída", "Dague déchue", "Pugnale caduto"],
  "Fallen Double Axe": ["Hacha doble caída", "Hache double déchue", "Ascia doppia caduta"],
  "Fallen Ring of the Druid": ["Anillo caído del druida", "Anneau déchu du druide", "Anello caduto del druido"],
  "Fallen Soldier Necklace": ["Collar del soldado caído", "Collier du soldat déchu", "Collana del soldato caduto"],
  "Fallen Soldier's Helm": ["Yelmo del soldado caído", "Heaume du soldat déchu", "Elmo del soldato caduto"],
  "Fallen Sword": ["Espada caída", "Épée déchue", "Spada caduta"],
  "False Fallen": ["Falso caído", "Faux déchu", "Falso caduto"],
  "False Necromancer": ["Falso nigromante", "Faux nécromancien", "Falso negromante"],
  "False Winter": ["Falso invierno", "Faux hiver", "Falso inverno"],
  "Ferocious Ancient Wood Breastplate": ["Coraza feroz del Bosque Antiguo", "Plastron féroce du Bois Ancien", "Corazza feroce del Legno Antico"],
  "Fierce Amethyst Boots": ["Botas feroces de amatista", "Bottes féroces d'améthyste", "Stivali feroci di ametista"],
  "Fierce Amethyst Breastplate": ["Coraza feroz de amatista", "Plastron féroce d'améthyste", "Corazza feroce di ametista"],
  "Fierce Amethyst Helm": ["Yelmo feroz de amatista", "Heaume féroce d'améthyste", "Elmo feroce di ametista"],
  "Fierce Amethyst Leggings": ["Calzas feroces de amatista", "Jambières féroces d'améthyste", "Gambali feroci di ametista"],
  "Fierce Ancient Wood Leggings": ["Calzas feroces del Bosque Antiguo", "Jambières féroces du Bois Ancien", "Gambali feroci del Legno Antico"],
  "Fierce Rune": ["Runa feroz", "Rune féroce", "Runa feroce"],
  "Fir Powder": ["Polvo de abeto", "Poudre de sapin", "Polvere di abete"],
  "Forgotten Shield": ["Escudo olvidado", "Bouclier oublié", "Scudo dimenticato"],
  "Frostmar Necklace": ["Collar de Frostmar", "Collier de Frostmar", "Collana di Frostmar"],
  "Goblin Blood": ["Sangre de goblin", "Sang de gobelin", "Sangue di goblin"],
  "Goblin Boots": ["Botas de goblin", "Bottes de gobelin", "Stivali di goblin"],
  "Goblin Eye": ["Ojo de goblin", "Œil de gobelin", "Occhio di goblin"],
  "Grainy Copper Belt": ["Cinturón de cobre granulado", "Ceinture de cuivre grenu", "Cintura di rame granuloso"],
  "Granite Gloves": ["Guantes de granito", "Gants de granit", "Guanti di granito"],
  "Granite Necklace": ["Collar de granito", "Collier de granit", "Collana di granito"],
  "Granite Ring": ["Anillo de granito", "Anneau de granit", "Anello di granito"],
  "Grimoire of the Dark Woods": ["Grimorio del Bosque Oscuro", "Grimoire de la Forêt Sombre", "Grimorio del Bosco Oscuro"],
  "Guardian Boots": ["Botas del guardián", "Bottes du gardien", "Stivali del guardiano"],
  "Guardian Breastplate": ["Coraza del guardián", "Plastron du gardien", "Corazza del guardiano"],
  "Guardian Helmet": ["Casco del guardián", "Casque du gardien", "Elmo del guardiano"],
  "Guardian Leggings": ["Calzas del guardián", "Jambières du gardien", "Gambali del guardiano"],
  "Guardian Rune": ["Runa del guardián", "Rune du gardien", "Runa del guardiano"],
  "Guardian's Necklace": ["Collar del guardián", "Collier du gardien", "Collana del guardiano"],
  "Hammer of the Colossus": ["Martillo del coloso", "Marteau du colosse", "Martello del colosso"],
  "Healing Crystal": ["Cristal de curación", "Cristal de soin", "Cristallo di cura"],
  "Heart of the Talisman": ["Corazón del talismán", "Cœur du talisman", "Cuore del talismano"],
  "Helm of the Fierce Ancient Woods": ["Yelmo feroz de los Bosques Antiguos", "Heaume féroce des Bois Anciens", "Elmo feroce dei Boschi Antichi"],
  "Helmet of the Necromancer Assassin": ["Casco del asesino nigromante", "Casque de l'assassin nécromancien", "Elmo dell'assassino negromante"],
  "Helmet of the Wild Ancient Woods": ["Casco salvaje de los Bosques Antiguos", "Casque sauvage des Bois Anciens", "Elmo selvaggio dei Boschi Antichi"],
  "Herald Breastplate": ["Coraza del heraldo", "Plastron du héraut", "Corazza dell'araldo"],
  "Herald Helmet": ["Casco del heraldo", "Casque du héraut", "Elmo dell'araldo"],
  "Herald Leggings": ["Calzas del heraldo", "Jambières du héraut", "Gambali dell'araldo"],
  "Herald's Boots": ["Botas del heraldo", "Bottes du héraut", "Stivali dell'araldo"],
  "Heroic Katana": ["Katana heroica", "Katana héroïque", "Katana eroica"],
  "Honeyed Ring": ["Anillo de miel", "Anneau miellé", "Anello mielato"],
  "Howling Crossbow": ["Ballesta aullante", "Arbalète hurlante", "Balestra ululante"],
  "Ika Boots": ["Botas de Ika", "Bottes d'Ika", "Stivali di Ika"],
  "Ika Leggings": ["Calzas de Ika", "Jambières d'Ika", "Gambali di Ika"],
  "Ika's Tunic": ["Túnica de Ika", "Tunique d'Ika", "Tunica di Ika"],
  "Illfang Axe": ["Hacha de Illfang", "Hache d'Illfang", "Ascia di Illfang"],
  "Illfang Crystal": ["Cristal de Illfang", "Cristal d'Illfang", "Cristallo di Illfang"],
  "Intermediate Dagger": ["Daga intermedia", "Dague intermédiaire", "Pugnale intermedio"],
  "Iron Amulet": ["Amuleto de hierro", "Amulette de fer", "Amuleto di ferro"],
  "Iron Bracelet": ["Brazalete de hierro", "Bracelet de fer", "Bracciale di ferro"],
  "Iron Gloves": ["Guantes de hierro", "Gants de fer", "Guanti di ferro"],
  "Iron Ring": ["Anillo de hierro", "Anneau de fer", "Anello di ferro"],
  "Iron Sword": ["Espada de hierro", "Épée de fer", "Spada di ferro"],
  "Key of the Fallen": ["Llave de los Caídos", "Clé des Déchus", "Chiave dei Caduti"],
  "Long Dark Dagger": ["Daga larga oscura", "Dague longue sombre", "Pugnale lungo oscuro"],
  "Magical Ancient Wood Leggings": ["Calzas mágicas del Bosque Antiguo", "Jambières magiques du Bois Ancien", "Gambali magici del Legno Antico"],
  "Magical Ancient Woods Breastplate": ["Coraza mágica de los Bosques Antiguos", "Plastron magique des Bois Anciens", "Corazza magica dei Boschi Antichi"],
  "Magically Fallen Staff": ["Bastón de caída mágica", "Bâton de chute magique", "Bastone della caduta magica"],
  "Magician's Sandals": ["Sandalias de mago", "Sandales de mage", "Sandali del mago"],
  "Magician's Staff": ["Bastón de mago", "Bâton de mage", "Bastone del mago"],
  "Magician's Trousers": ["Pantalones de mago", "Pantalon de mage", "Pantaloni del mago"],
  "Mana Crystal": ["Cristal de maná", "Cristal de mana", "Cristallo di mana"],
  "Mantle of the Misty Fangs": ["Manto de los Colmillos Brumosos", "Manteau des Crocs Brumeux", "Manto delle Zanne Nebbiose"],
  "Marrow Powder": ["Polvo de médula", "Poudre de moelle", "Polvere di midollo"],
  "Mask of the Corrupted Rift": ["Máscara de la Grieta Corrupta", "Masque de la Faille Corrompue", "Maschera della Faglia Corrotta"],
  "Mask of the Necromancer": ["Máscara del nigromante", "Masque du nécromancien", "Maschera del negromante"],
  "Mask of the Tree of Remembrance": ["Máscara del Árbol del Recuerdo", "Masque de l'Arbre du Souvenir", "Maschera dell'Albero del Ricordo"],
  "Mask of the Web": ["Máscara de la telaraña", "Masque de la toile", "Maschera della ragnatela"],
  "Metal Axe": ["Hacha de metal", "Hache de métal", "Ascia di metallo"],
  "Metal Hoe": ["Azada de metal", "Houe de métal", "Zappa di metallo"],
  "Metal Pickaxe": ["Pico de metal", "Pioche de métal", "Piccone di metallo"],
  "Midnight Cloak": ["Capa de medianoche", "Cape de minuit", "Mantello di mezzanotte"],
  "Misty Gloves": ["Guantes brumosos", "Gants brumeux", "Guanti nebbiosi"],
  "Misty Ring": ["Anillo brumoso", "Anneau brumeux", "Anello nebbioso"],
  "Moldy Bark": ["Corteza mohosa", "Écorce moisie", "Corteccia ammuffita"],
  "Nameless Ring": ["Anillo sin nombre", "Anneau sans nom", "Anello senza nome"],
  "Narax's Ring": ["Anillo de Narax", "Anneau de Narax", "Anello di Narax"],
  "Necromancer Archer Boots": ["Botas de arquero nigromante", "Bottes d'archer nécromancien", "Stivali dell'arciere negromante"],
  "Necromancer Archer Helmet": ["Casco de arquero nigromante", "Casque d'archer nécromancien", "Elmo dell'arciere negromante"],
  "Necromancer Archer Leggings": ["Calzas de arquero nigromante", "Jambières d'archer nécromancien", "Gambali dell'arciere negromante"],
  "Necromancer Shaman Helmet": ["Casco de chamán nigromante", "Casque de chaman nécromancien", "Elmo dello sciamano negromante"],
  "Necromancer Warrior Boots": ["Botas de guerrero nigromante", "Bottes de guerrier nécromancien", "Stivali del guerriero negromante"],
  "Necromancer Warrior Breastplate": ["Coraza de guerrero nigromante", "Plastron de guerrier nécromancien", "Corazza del guerriero negromante"],
  "Necromancer Warrior Leggings": ["Calzas de guerrero nigromante", "Jambières de guerrier nécromancien", "Gambali del guerriero negromante"],
  "Necromancer's Hammer": ["Martillo del nigromante", "Marteau du nécromancien", "Martello del negromante"],
  "Necropolis Crossbow": ["Ballesta de la necrópolis", "Arbalète de la nécropole", "Balestra della necropoli"],
  "Necrotic Hoe": ["Azada necrótica", "Houe nécrotique", "Zappa necrotica"],
  "Necrotic Pickaxe": ["Pico necrótico", "Pioche nécrotique", "Piccone necrotico"],
  "Ninja Boots": ["Botas ninja", "Bottes ninja", "Stivali ninja"],
  "Ninja Leggings": ["Calzas ninja", "Jambières ninja", "Gambali ninja"],
  "Ninja Tunic": ["Túnica ninja", "Tunique ninja", "Tunica ninja"],
  "Nodachi Mage Staff": ["Bastón de mago nodachi", "Bâton de mage nodachi", "Bastone del mago nodachi"],
  "Nodachi Shaman Staff": ["Bastón de chamán nodachi", "Bâton de chaman nodachi", "Bastone dello sciamano nodachi"],
  "Novice Belt": ["Cinturón de novato", "Ceinture de novice", "Cintura da novizio"],
  "Novice Gloves": ["Guantes de novato", "Gants de novice", "Guanti da novizio"],
  "Novice Necklace": ["Collar de novato", "Collier de novice", "Collana da novizio"],
  "Oak Bark": ["Corteza de roble", "Écorce de chêne", "Corteccia di quercia"],
  "Oak Powder": ["Polvo de roble", "Poudre de chêne", "Polvere di quercia"],
  "Occult Amulet": ["Amuleto oculto", "Amulette occulte", "Amuleto occulto"],
  "Occult Axe": ["Hacha oculta", "Hache occulte", "Ascia occulta"],
  "Occult Band": ["Banda oculta", "Bande occulte", "Benda occulta"],
  "Occult Boots": ["Botas ocultas", "Bottes occultes", "Stivali occulti"],
  "Occult Bracelet": ["Brazalete oculto", "Bracelet occulte", "Bracciale occulto"],
  "Occult Dagger": ["Daga oculta", "Dague occulte", "Pugnale occulto"],
  "Occult Gloves": ["Guantes ocultos", "Gants occultes", "Guanti occulti"],
  "Occult Helmet": ["Casco oculto", "Casque occulte", "Elmo occulto"],
  "Occult Hood": ["Capucha oculta", "Capuche occulte", "Cappuccio occulto"],
  "Occult Ring": ["Anillo oculto", "Anneau occulte", "Anello occulto"],
  "Occult Robe": ["Túnica oculta", "Robe occulte", "Veste occulta"],
  "Occult Rune": ["Runa oculta", "Rune occulte", "Runa occulta"],
  "Orc Boots": ["Botas de orco", "Bottes d'orc", "Stivali d'orco"],
  "Orc Gloves": ["Guantes de orco", "Gants d'orc", "Guanti d'orco"],
  "Orc Mask": ["Máscara de orco", "Masque d'orc", "Maschera d'orco"],
  "Pact Ring": ["Anillo del pacto", "Anneau du pacte", "Anello del patto"],
  "Piece of bauxite": ["Pieza de bauxita", "Morceau de bauxite", "Pezzo di bauxite"],
  "Power Crystal": ["Cristal de poder", "Cristal de puissance", "Cristallo di potere"],
  "Powerful Dark Mage Staff": ["Bastón poderoso de mago oscuro", "Bâton puissant de mage sombre", "Bastone potente del mago oscuro"],
  "Powerful Dark Shaman Staff": ["Bastón poderoso de chamán oscuro", "Bâton puissant de chaman sombre", "Bastone potente dello sciamano oscuro"],
  "Powerful Magically Fallen Staff": ["Bastón poderoso de caída mágica", "Bâton puissant de chute magique", "Bastone potente della caduta magica"],
  "Powerful Shaman Necromancer Staff": [
    "Bastón poderoso de nigromante chamán",
    "Bâton puissant de nécromancien chaman", "Bastone potente del negromante sciamano"
  ],
  "Powerful Wildly Fallen Staff": ["Bastón poderoso de caída salvaje", "Bâton puissant de chute sauvage", "Bastone potente della caduta selvaggia"],
  "Pumba Ring": ["Anillo de Pumba", "Anneau de Pumba", "Anello di Pumba"],
  "Purple Spider Thread": ["Hilo de araña púrpura", "Fil d'araignée violet", "Filo di ragno viola"],
  "Purse of 1000 Col": ["Bolsa de 1000 Col", "Bourse de 1000 Col", "Borsa di 1000 Col"],
  "Purse of 2000 Col": ["Bolsa de 2000 Col", "Bourse de 2000 Col", "Borsa di 2000 Col"],
  "Purse of 5000 Col": ["Bolsa de 5000 Col", "Bourse de 5000 Col", "Borsa di 5000 Col"],
  "Purse of 75 Col": ["Bolsa de 75 Col", "Bourse de 75 Col", "Borsa di 75 Col"],
  "Red Christmas Mittens": ["Manoplas rojas de Navidad", "Moufles rouges de Noël", "Muffole rosse di Natale"],
  "Red Eye Rune": ["Runa del ojo rojo", "Rune de l'œil rouge", "Runa dell'occhio rosso"],
  "Red Lantern": ["Linterna roja", "Lanterne rouge", "Lanterna rossa"],
  "Reinforced Hoe": ["Azada reforzada", "Houe renforcée", "Zappa rinforzata"],
  "Reinforced Pickaxe": ["Pico reforzado", "Pioche renforcée", "Piccone rinforzato"],
  "Resurrection Crystal": ["Cristal de resurrección", "Cristal de résurrection", "Cristallo di resurrezione"],
  "Revenant Boots": ["Botas del aparecido", "Bottes du revenant", "Stivali del revenant"],
  "Ring of Golden Nectar": ["Anillo del néctar dorado", "Anneau du nectar doré", "Anello del nettare dorato"],
  "Ring of the Crushed Harpy": ["Anillo de la arpía aplastada", "Anneau de la harpie écrasée", "Anello dell'arpia schiacciata"],
  "Ring of the Drowned Harpy": ["Anillo de la arpía ahogada", "Anneau de la harpie noyée", "Anello dell'arpia annegata"],
  "Ring of the Flaming Harpy": ["Anillo de la arpía llameante", "Anneau de la harpie flamboyante", "Anello dell'arpia fiammeggiante"],
  "Ring of the Protective Sting": ["Anillo del aguijón protector", "Anneau du dard protecteur", "Anello del pungiglione protettivo"],
  "Ring of the Thief": ["Anillo del ladrón", "Anneau du voleur", "Anello del ladro"],
  "Ring of the Web": ["Anillo de la telaraña", "Anneau de la toile", "Anello della ragnatela"],
  "Ring of the Woods": ["Anillo de los Bosques", "Anneau des Bois", "Anello dei Boschi"],
  "Rugiboeuf's Horn": ["Cuerno de Rugiboeuf", "Corne de Rugiboeuf", "Corno di Rugiboeuf"],
  "Runic Honey Bracelet": ["Brazalete de miel rúnico", "Bracelet miellé runique", "Bracciale di miele runico"],
  "Runic Necklace": ["Collar rúnico", "Collier runique", "Collana runica"],
  "Savannah Hoe": ["Azada de sabana", "Houe de savane", "Zappa della savana"],
  "Savannah Pickaxe": ["Pico de sabana", "Pioche de savane", "Piccone della savana"],
  "Scarlet Feather": ["Pluma escarlata", "Plume écarlate", "Piuma scarlatta"],
  "Scepter of Love": ["Cetro del amor", "Sceptre de l'amour", "Scettro dell'amore"],
  "Scrap Gloves": ["Guantes de chatarra", "Gants de ferraille", "Guanti di scarti"],
  "Scrap Metal Amulet": ["Amuleto de chatarra metálica", "Amulette de ferraille métallique", "Amuleto di metallo di scarto"],
  "Scrap Piece": ["Pieza de chatarra", "Morceau de ferraille", "Pezzo di scarto"],
  "Scrap Ring": ["Anillo de chatarra", "Anneau de ferraille", "Anello di scarti"],
  "Sentinel Club": ["Garrote del centinela", "Massue de la sentinelle", "Clava della sentinella"],
  "Shaman Love Catalyst": ["Catalizador de amor del chamán", "Catalyseur d'amour du chaman", "Catalizzatore d'amore dello sciamano"],
  "Shaman Necromancer Breastplate": ["Coraza de nigromante chamán", "Plastron de nécromancien chaman", "Corazza del negromante sciamano"],
  "Shaman Necromancer Leggings": ["Calzas de nigromante chamán", "Jambières de nécromancien chaman", "Gambali del negromante sciamano"],
  "Shaman Necromancer Staff": ["Bastón de nigromante chamán", "Bâton de nécromancien chaman", "Bastone del negromante sciamano"],
  "Shaman Necrotic Scepter": ["Cetro necrótico de chamán", "Sceptre nécrotique de chaman", "Scettro necrotico dello sciamano"],
  "Shaman Winter Catalyst": ["Catalizador de invierno del chamán", "Catalyseur d'hiver du chaman", "Catalizzatore d'inverno dello sciamano"],
  "Simple Belt": ["Cinturón simple", "Ceinture simple", "Cintura semplice"],
  "Simple Boots": ["Botas simples", "Bottes simples", "Stivali semplici"],
  "Simple Gloves": ["Guantes simples", "Gants simples", "Guanti semplici"],
  "Skeleton Ring": ["Anillo de esqueleto", "Anneau de squelette", "Anello di scheletro"],
  "Skyblue Feather": ["Pluma azul cielo", "Plume bleu ciel", "Piuma azzurro cielo"],
  "Sorcerer's Pants": ["Pantalones de hechicero", "Pantalon de sorcier", "Pantaloni dello stregone"],
  "Sorcerer's Robe": ["Túnica de hechicero", "Robe de sorcier", "Veste dello stregone"],
  "Sorcerer's Sandals": ["Sandalias de hechicero", "Sandales de sorcier", "Sandali dello stregone"],
  "Sorcerer's Staff": ["Bastón de hechicero", "Bâton de sorcier", "Bastone dello stregone"],
  "Spectral Boots": ["Botas espectrales", "Bottes spectrales", "Stivali spettrali"],
  "Spectral Feather": ["Pluma espectral", "Plume spectrale", "Piuma spettrale"],
  "Spectral Gloves": ["Guantes espectrales", "Gants spectraux", "Guanti spettrali"],
  "Spectral Leggings": ["Calzas espectrales", "Jambières spectrales", "Gambali spettrali"],
  "Spectral Tunic": ["Túnica espectral", "Tunique spectrale", "Tunica spettrale"],
  "Spider Red Eyes": ["Ojos rojos de araña", "Yeux rouges d'araignée", "Occhi rossi di ragno"],
  "Spider Thread": ["Hilo de araña", "Fil d'araignée", "Filo di ragno"],
  "Staff of the Powerful Magician": ["Bastón del mago poderoso", "Bâton du mage puissant", "Bastone del mago potente"],
  "Stamina Crystal": ["Cristal de resistencia", "Cristal d'endurance", "Cristallo di stamina"],
  "Stamina I Potion": ["Poción de resistencia I", "Potion d'endurance I", "Pozione di stamina I"],
  "Stamina II Potion": ["Poción de resistencia II", "Potion d'endurance II", "Pozione di stamina II"],
  "Stamina III Potion": ["Poción de resistencia III", "Potion d'endurance III", "Pozione di stamina III"],
  "Stamina IV Potion": ["Poción de resistencia IV", "Potion d'endurance IV", "Pozione di stamina IV"],
  "Stamina V Potion": ["Poción de resistencia V", "Potion d'endurance V", "Pozione di stamina V"],
  "Stamina VI Potion": ["Poción de resistencia VI", "Potion d'endurance VI", "Pozione di stamina VI"],
  "Stolen Coat": ["Abrigo robado", "Manteau volé", "Cappotto rubato"],
  "Stone Bracelet": ["Brazalete de piedra", "Bracelet de pierre", "Bracciale di pietra"],
  "Stone Gloves": ["Guantes de piedra", "Gants de pierre", "Guanti di pietra"],
  "Stone Necklace": ["Collar de piedra", "Collier de pierre", "Collana di pietra"],
  "Stone Ring": ["Anillo de piedra", "Anneau de pierre", "Anello di pietra"],
  "Strange Belt": ["Cinturón extraño", "Ceinture étrange", "Cintura strana"],
  "Sword of the Necromancer": ["Espada del nigromante", "Épée du nécromancien", "Spada del negromante"],
  "Sylnovarian Fabric": ["Tela de Sylnovar", "Tissu de Sylnovar", "Tessuto di Sylnovar"],
  "Sylvaerian Fabric": ["Tela de Sylvaer", "Tissu de Sylvaer", "Tessuto di Sylvaer"],
  "Sylvester Bark": ["Corteza de Sylvester", "Écorce de Sylvester", "Corteccia di Sylvester"],
  "Sylvester Mage Staff": ["Bastón de mago Sylvester", "Bâton de mage Sylvester", "Bastone del mago Sylvester"],
  "Sylvester Shaman Staff": ["Bastón de chamán Sylvester", "Bâton de chaman Sylvester", "Bastone dello sciamano Sylvester"],
  "Tactical Boots": ["Botas tácticas", "Bottes tactiques", "Stivali tattici"],
  "Tactical Leggings": ["Calzas tácticas", "Jambières tactiques", "Gambali tattici"],
  "Tactical Tunic": ["Túnica táctica", "Tunique tactique", "Tunica tattica"],
  "Talisman Seal": ["Sello del talismán", "Sceau du talisman", "Sigillo del talismano"],
  "Taurus Belt": ["Cinturón de Taurus", "Ceinture de Taurus", "Cintura di Taurus"],
  "Taurus Ring": ["Anillo de Taurus", "Anneau de Taurus", "Anello di Taurus"],
  "Tear of the Corrupted Rift": ["Lágrima de la Grieta Corrupta", "Larme de la Faille Corrompue", "Lacrima della Faglia Corrotta"],
  "Teddy Bear Rune": ["Runa del osito de peluche", "Rune de l'ours en peluche", "Runa dell'orsetto di peluche"],
  "Thief Boots": ["Botas del ladrón", "Bottes du voleur", "Stivali del ladro"],
  "Thief's Amulet": ["Amuleto del ladrón", "Amulette du voleur", "Amuleto del ladro"],
  "Thief's Gloves": ["Guantes del ladrón", "Gants du voleur", "Guanti del ladro"],
  "Thief's Hood": ["Capucha del ladrón", "Capuche du voleur", "Cappuccio del ladro"],
  "Titan Boots": ["Botas de titán", "Bottes de titan", "Stivali di titano"],
  "Titan Breastplate": ["Coraza de titán", "Plastron de titan", "Corazza di titano"],
  "Titan Helmet": ["Casco de titán", "Casque de titan", "Elmo di titano"],
  "Titan Leggings": ["Calzas de titán", "Jambières de titan", "Gambali di titano"],
  "Tolbana Resistant Shield": ["Escudo resistente de Tolbana", "Bouclier résistant de Tolbana", "Scudo resistente di Tolbana"],
  "Tribe Belt": ["Cinturón de la tribu", "Ceinture de la tribu", "Cintura della tribù"],
  "Tricolor Necklace": ["Collar tricolor", "Collier tricolore", "Collana tricolore"],
  "Unyielding Shield": ["Escudo inquebrantable", "Bouclier inflexible", "Scudo inflessibile"],
  "Warrior Necromancer Helmet": ["Casco de nigromante guerrero", "Casque de nécromancien guerrier", "Elmo del negromante guerriero"],
  "Wild Ancient Woods Breastplate": ["Coraza salvaje de los Bosques Antiguos", "Plastron sauvage des Bois Anciens", "Corazza selvaggia dei Boschi Antichi"],
  "Wild Ancient Woods Leggings": ["Calzas salvajes de los Bosques Antiguos", "Jambières sauvages des Bois Anciens", "Gambali selvaggi dei Boschi Antichi"],
  "Wild Boar Broth": ["Caldo de jabalí salvaje", "Bouillon de sanglier sauvage", "Brodo di cinghiale selvatico"],
  "Wild Gloves": ["Guantes salvajes", "Gants sauvages", "Guanti selvaggi"],
  "Wildly Fallen Staff": ["Bastón de caída salvaje", "Bâton de chute sauvage", "Bastone della caduta selvaggia"],
  "Winter Hammer": ["Martillo del invierno", "Marteau de l'hiver", "Martello dell'inverno"],
  "Winter Mage Spectre": ["Espectro de mago del invierno", "Spectre de mage de l'hiver", "Spettro del mago dell'inverno"],
  "Winter Scepter Shaman": ["Chamán del cetro del invierno", "Chaman du sceptre de l'hiver", "Sciamano dello scettro dell'inverno"],
  "Winter Scythe": ["Guadaña del invierno", "Faux de l'hiver", "Falce dell'inverno"],
  "Wolf Gloves": ["Guantes de lobo", "Gants de loup", "Guanti di lupo"],
  "Wood Amulet": ["Amuleto de madera", "Amulette de bois", "Amuleto di legno"],
  "Wood Gloves": ["Guantes de madera", "Gants de bois", "Guanti di legno"],
  "Wood Rune": ["Runa de madera", "Rune de bois", "Runa di legno"],
  "Wooden Fishing Rod": ["Caña de pescar de madera", "Canne à pêche en bois", "Canna da pesca di legno"],
  "Woodfang Cloak": ["Capa de Colmillo de Madera", "Cape de Croc-de-Bois", "Mantello Zanna-di-Legno"],
  /* --- materials, mobs and loot names that the word-by-word pass left half translated
	   ("Jabalí Hide") or in English order ("Colossus Martillo"); curated as whole phrases so the
	   equipment-term pass, the quest requirements and the bestiary drops all agree --- */
  "Boar Hide": ["Piel de jabalí", "Peau de sanglier", "Pelle di cinghiale"],
  "Broken Violet Fragment": ["Fragmento de violeta roto", "Fragment de violette brisé", "Frammento violetto rotto"],
  "Bauxite Ore": ["Mineral de bauxita", "Minerai de bauxite", "Minerale di bauxite"],
  "Coal Ore": ["Mineral de carbón", "Minerai de charbon", "Minerale di carbone"],
  "Colossus Hammer": ["Martillo del coloso", "Marteau du colosse", "Martello del colosso"],
  "Copper Ore": ["Mineral de cobre", "Minerai de cuivre", "Minerale di rame"],
  "Crumpled Notebook": ["Cuaderno arrugado", "Carnet froissé", "Quaderno stropicciato"],
  "Cursed Hoof Shard": ["Fragmento de pezuña maldita", "Éclat de sabot maudit", "Scheggia di zoccolo maledetto"],
  "Gorbel Essence": ["Esencia de Gorbel", "Essence de Gorbel", "Essenza di Gorbel"],
  "Iron Ore": ["Mineral de hierro", "Minerai de fer", "Minerale di ferro"],
  "Juvenial Bark": ["Corteza juvenil", "Écorce juvénile", "Corteccia giovane"],
  "Magic Wook Shard": ["Fragmento de madera mágica", "Éclat de bois magique", "Scheggia di legno magico"],
  "Nymbréa's Heart": ["Corazón de Nymbréa", "Cœur de Nymbréa", "Cuore di Nymbréa"],
  "Orichalcum Ingot": ["Lingote de oricalco", "Lingot d'orichalque", "Lingotto di oricalco"],
  "Ring Without Name": ["Anillo sin nombre", "Anneau sans nom", "Anello senza nome"],
  "Scots Bark": ["Corteza de pino silvestre", "Écorce de pin sylvestre", "Corteccia di pino silvestre"],
  Sharkfish: ["Pez tiburón", "Poisson-requin", "Pesce squalo"],
  /* --- Current-Data accessory materials (the Ice Spirits, Ice Golem, Peaceful Deer and Shark
     sets). "Hard Glacial Hide" and "Shark Carapace" name the same materials the glossary already
     curates as "Glacial Hardhide" and "Shark Shell", so they reuse those translations --- */
  "Birch String": ["Cuerda de abedul", "Corde de bouleau", "Corda di betulla"],
  "Hard Glacial Hide": ["Cuero duro glacial", "Cuir glacé", "Cuoio duro glaciale"],
  "Mountain Stag Hide": ["Piel de ciervo montañés", "Peau de cerf des montagnes", "Pelle di cervo montano"],
  "Oak String": ["Cuerda de roble", "Corde de chêne", "Corda di quercia"],
  "Shark Carapace": ["Caparazón de tiburón", "Carapace de requin", "Carapace di squalo"],
  /* --- Current-Data accessory materials added with the Iron, Copper, Nepenthes, Elite Treant,
     secret and Shadow Neophyte sets. "Sylve Sprout" is the same material the glossary already
     curates as "Sylve shoot" --- */
  "Copper String": ["Cuerda de cobre", "Corde de cuivre", "Corda di rame"],
  "Fragment of the Bear's Soul": ["Fragmento del alma del oso", "Fragment de l'âme de l'ours", "Frammento dell'anima dell'orso"],
  "Iron String": ["Cuerda de hierro", "Corde de fer", "Corda di ferro"],
  "Leaf Fragments": ["Fragmentos de hojas", "Fragments de feuilles", "Frammenti di foglie"],
  "Spider Venom": ["Veneno de araña", "Venin d'araignée", "Veleno di ragno"],
  "Sylve Sprout": ["Brote de Sylve", "Pousse de Sylve", "Germoglio di Sylve"],
  /* --- Current-Data normal armor (levels 3, 7 and 9 for the Warrior, Assassin, Archer, Mage and
     Shaman). The names keep the class qualifier the source supplies, translated like the existing
     parenthesised names ("Witch's Potion (Intelligence)"), and reuse the glossary's own armor
     vocabulary: Breastplate/Chestplate -> Coraza/Plastron, Leggings -> Calzas/Jambières, Boots ->
     Botas/Bottes, Tunic -> Túnica/Tunique, Robe -> Túnica/Robe, Sandals -> Sandalias/Sandales,
     Helmet -> Casco/Casque. "Ika Leggings", "Ika Boots", "Tactical Leggings", "Tactical Boots",
     "Spectral Leggings" and "Spectral Boots" already carry a curated translation above, so they are
     not repeated here --- */
  "Guardian's Boots (Warrior)": ["Botas del guardián (Guerrero)", "Bottes du gardien (Guerrier)", "Stivali del guardiano (Guerriero)"],
  "Guardian's Chestplate (Warrior)": ["Coraza del guardián (Guerrero)", "Plastron du gardien (Guerrier)", "Corazza del guardiano (Guerriero)"],
  "Guardian's Helmet (Warrior)": ["Casco del guardián (Guerrero)", "Casque du gardien (Guerrier)", "Elmo del guardiano (Guerriero)"],
  "Guardian's Leggings (Warrior)": ["Calzas del guardián (Guerrero)", "Jambières du gardien (Guerrier)", "Gambali del guardiano (Guerriero)"],
  "Herald's Boots (Archer)": ["Botas del heraldo (Arquero)", "Bottes du héraut (Archer)", "Stivali dell'araldo (Arciere)"],
  "Herald's Boots (Assassin)": ["Botas del heraldo (Asesino)", "Bottes du héraut (Assassin)", "Stivali dell'araldo (Assassino)"],
  "Herald's Helmet (Archer)": ["Casco del heraldo (Arquero)", "Casque du héraut (Archer)", "Elmo dell'araldo (Arciere)"],
  "Herald's Helmet (Assassin)": ["Casco del heraldo (Asesino)", "Casque du héraut (Assassin)", "Elmo dell'araldo (Assassino)"],
  "Herald's Leggings (Archer)": ["Calzas del heraldo (Arquero)", "Jambières du héraut (Archer)", "Gambali dell'araldo (Arciere)"],
  "Herald's Leggings (Assassin)": ["Calzas del heraldo (Asesino)", "Jambières du héraut (Assassin)", "Gambali dell'araldo (Assassino)"],
  "Herald's Tunic (Archer)": ["Túnica del heraldo (Arquero)", "Tunique du héraut (Archer)", "Tunica dell'araldo (Arciere)"],
  "Herald's Tunic (Assassin)": ["Túnica del heraldo (Asesino)", "Tunique du héraut (Assassin)", "Tunica dell'araldo (Assassino)"],
  "Hunter's Boots (Archer)": ["Botas del cazador (Arquero)", "Bottes du chasseur (Archer)", "Stivali del cacciatore (Arciere)"],
  "Hunter's Leggings (Archer)": ["Calzas del cazador (Arquero)", "Jambières du chasseur (Archer)", "Gambali del cacciatore (Arciere)"],
  "Hunter's Tunic (Archer)": ["Túnica del cazador (Arquero)", "Tunique du chasseur (Archer)", "Tunica del cacciatore (Arciere)"],
  "Ika Breastplate": ["Coraza de Ika", "Plastron d'Ika", "Corazza di Ika"],
  "Magician's Leggings (Shaman)": ["Calzas de mago (Chamán)", "Jambières de mage (Chaman)", "Gambali del mago (Sciamano)"],
  "Magician's Robe (Shaman)": ["Túnica del mago (Chamán)", "Robe du mage (Chaman)", "Veste del mago (Sciamano)"],
  "Magician's Sandals (Shaman)": ["Sandalias de mago (Chamán)", "Sandales de mage (Chaman)", "Sandali del mago (Sciamano)"],
  "Ninja Boots (Assassin)": ["Botas ninja (Asesino)", "Bottes ninja (Assassin)", "Stivali ninja (Assassino)"],
  "Ninja Leggings (Assassin)": ["Calzas ninja (Asesino)", "Jambières ninja (Assassin)", "Gambali ninja (Assassino)"],
  "Ninja Tunic (Assassin)": ["Túnica ninja (Asesino)", "Tunique ninja (Assassin)", "Tunica ninja (Assassino)"],
  "Protector's Boots (Warrior)": ["Botas del protector (Guerrero)", "Bottes du protecteur (Guerrier)", "Stivali del protettore (Guerriero)"],
  "Protector's Breastplate (Warrior)": ["Coraza del protector (Guerrero)", "Plastron du protecteur (Guerrier)", "Corazza del protettore (Guerriero)"],
  "Protector's Helmet (Warrior)": ["Casco del protector (Guerrero)", "Casque du protecteur (Guerrier)", "Elmo del protettore (Guerriero)"],
  "Protector's Leggings (Warrior)": ["Calzas del protector (Guerrero)", "Jambières du protecteur (Guerrier)", "Gambali del protettore (Guerriero)"],
  "Reaper's Boots (Mage)": ["Botas del segador (Mago)", "Bottes du faucheur (Mage)", "Stivali del mietitore (Mago)"],
  "Reaper's Boots (Shaman)": ["Botas del segador (Chamán)", "Bottes du faucheur (Chaman)", "Stivali del mietitore (Sciamano)"],
  "Reaper's Chestplate (Mage)": ["Coraza del segador (Mago)", "Plastron du faucheur (Mage)", "Corazza del mietitore (Mago)"],
  "Reaper's Chestplate (Shaman)": ["Coraza del segador (Chamán)", "Plastron du faucheur (Chaman)", "Corazza del mietitore (Sciamano)"],
  "Reaper's Helmet (Mage)": ["Casco del segador (Mago)", "Casque du faucheur (Mage)", "Elmo del mietitore (Mago)"],
  "Reaper's Helmet (Shaman)": ["Casco del segador (Chamán)", "Casque du faucheur (Chaman)", "Elmo del mietitore (Sciamano)"],
  "Reaper's Leggings (Mage)": ["Calzas del segador (Mago)", "Jambières du faucheur (Mage)", "Gambali del mietitore (Mago)"],
  "Reaper's Leggings (Shaman)": ["Calzas del segador (Chamán)", "Jambières du faucheur (Chaman)", "Gambali del mietitore (Sciamano)"],
  "Sorcerer's Leggings (Mage)": ["Calzas de hechicero (Mago)", "Jambières de sorcier (Mage)", "Gambali dello stregone (Mago)"],
  "Sorcerer's Robe (Mage)": ["Túnica de hechicero (Mago)", "Robe de sorcier (Mage)", "Veste dello stregone (Mago)"],
  "Sorcerer's Sandals (Mage)": ["Sandalias de hechicero (Mago)", "Sandales de sorcier (Mage)", "Sandali dello stregone (Mago)"],
  "Spectral Breastplate": ["Coraza espectral", "Plastron spectral", "Corazza spettrale"],
  "Tactical Chestplate": ["Coraza táctica", "Plastron tactique", "Corazza tattica"],
  /* --- The Weakling Wolf and Bandit accessory update. The two accessory blacksmiths, the Equipment
     Blacksmith that forges the Nodachi, the six accessory names the glossary does not already carry
     ("Stolen Cloak" is curated above as the ingredient of the Gelatinous Cloak), the two materials
     and the "Critical Power" stat term the two sets' bonuses use. --- */
  "Wolf Accessories": ["Accesorios de lobo", "Accessoires de loup", "Accessori del lupo"],
  "Bandit Accessories": ["Accesorios de bandidos", "Accessoires de bandits", "Accessori dei banditi"],
  "Nodachi Blacksmith": ["Herrero de Nodachi", "Forgeron de Nodachi", "Fabbro di Nodachi"],
  "Ring of the Wolf": ["Anillo del lobo", "Anneau du loup", "Anello del lupo"],
  "Albal's Necklace": ["Collar de Albal", "Collier d'Albal", "Collana di Albal"],
  "Bandit's Gloves": ["Guantes del bandido", "Gants du bandit", "Guanti del bandito"],
  "Bandit Hood": ["Capucha de bandido", "Capuche de bandit", "Cappuccio del bandito"],
  "Stolen Amulet": ["Amuleto robado", "Amulette volée", "Amuleto rubato"],
  "Bandit Coin": ["Moneda del bandido", "Pièce du bandit", "Moneta del bandito"],
  "Fangs of Albal": ["Colmillos de Albal", "Crocs d'Albal", "Zanne di Albal"],
  "Small Purse": ["Bolsa pequeña", "Petite bourse", "Borsa piccola"],
  "Critical Power": ["Poder crítico", "Puissance critique", "Potenza critica"]
  /* end curated terminology */
};
Object.assign(equipmentTerminology, curatedTerminology);

const curatedProseTranslations = {
  "A rudimentary bow used by early shooters.": [
    "Un arco rudimentario utilizado por los primeros tiradores.",
    "Un arc rudimentaire utilisé par les premiers tireurs.", "Un arco rudimentale usato dai primi tiratori."
  ],
  "Very dilapidated dagger, even one blow on wood and the sword can be destroyed.": [
    "Una daga muy ruinosa; incluso un golpe contra la madera podría destruirla.",
    "Une dague très délabrée ; même un coup contre du bois pourrait la détruire.", "Un pugnale molto fatiscente: basta un solo colpo sul legno perché la lama si distrugga."
  ],
  "An incomplete book brimming with magic.": [
    "Un libro incompleto rebosante de magia.",
    "Un livre incomplet débordant de magie.", "Un libro incompleto traboccante di magia."
  ],
  "An old shield. It's still pretty much stuck.": [
    "Un escudo viejo. Sigue estando bastante atascado.",
    "Un vieux bouclier. Il reste assez difficile à manier.", "Un vecchio scudo. È ancora piuttosto bloccato."
  ],
  "A harmless, but energy-carrying magical learning staff.": [
    "Un bastón de aprendizaje mágico inofensivo, pero cargado de energía.",
    "Un bâton d'apprentissage magique inoffensif, mais chargé d'énergie.", "Un bastone magico da apprendista, innocuo ma carico di energia."
  ],
  "Forged for those who have yet to prove anything.": [
    "Forjada para quienes aún no han demostrado nada.",
    "Forgée pour ceux qui n'ont encore rien à prouver.", "Forgiata per chi non ha ancora nulla da dimostrare."
  ],
  "Small, slightly rusty sword perfect for training or to start your adventure.": [
    "Una espada pequeña y algo oxidada, perfecta para entrenar o comenzar la aventura.",
    "Une petite épée légèrement rouillée, parfaite pour s'entraîner ou commencer l'aventure.", "Spada piccola e leggermente arrugginita, perfetta per allenarsi o iniziare l'avventura."
  ],
  "Bow built with the help of Tier 1 Treants of Aincrad.": [
    "Arco fabricado con la ayuda de los treants de nivel 1 de Aincrad.",
    "Arc fabriqué avec l'aide des tréants de niveau 1 d'Aincrad.", "Arco costruito con l'aiuto dei treant di livello 1 di Aincrad."
  ],
  "Double iron axe created thanks to the wolves of the valley and with another ingredient.": [
    "Hacha doble de hierro creada gracias a los lobos del valle y a otro ingrediente.",
    "Hache double en fer créée grâce aux loups de la vallée et à un autre ingrédient.", "Ascia doppia di ferro creata grazie ai lupi della valle e a un altro ingrediente."
  ],
  "A book forged from materials from a putrid and ancient swamp. It contains bestial magic.": [
    "Un libro forjado con materiales de un pantano antiguo y pútrido. Contiene magia bestial.",
    "Un livre forgé avec des matériaux provenant d'un marais ancien et putride. Il contient une magie bestiale.", "Un libro forgiato con materiali di una palude antica e putrida. Contiene magia bestiale."
  ],
  "A book forged from materials from a putrid and ancient swamp. It contains elemental magic.": [
    "Un libro forjado con materiales de un pantano antiguo y pútrido. Contiene magia elemental.",
    "Un livre forgé avec des matériaux provenant d'un marais ancien et putride. Il contient une magie élémentaire.", "Un libro forgiato con materiali di una palude antica e putrida. Contiene magia elementale."
  ],
  "Standard for new recruits. Easy to handle, light and very reliable.": [
    "Equipo estándar para nuevas reclutas. Fácil de manejar, ligero y muy fiable.",
    "Équipement standard des nouvelles recrues. Facile à manier, léger et très fiable.", "Equipaggiamento standard per le nuove reclute. Facile da maneggiare, leggero e molto affidabile."
  ],
  "Iron sword created thanks to the wolves of the valley and with another ingredient.": [
    "Espada de hierro creada gracias a los lobos del valle y a otro ingrediente.",
    "Épée en fer créée grâce aux loups de la vallée et à un autre ingrédient.", "Spada di ferro creata grazie ai lupi della valle e a un altro ingrediente."
  ],
  "This shield made of wood has a point in its center. He can take a few hits too.": [
    "Este escudo de madera tiene una punta en el centro. También puede soportar algunos golpes.",
    "Ce bouclier en bois possède une pointe en son centre. Il peut aussi encaisser quelques coups.", "Questo scudo di legno ha una punta al centro. Può anche incassare qualche colpo."
  ],
  "Thanks to Wooden Hearts and Enchanted Twigs, a staff is born.": [
    "Gracias a los corazones de madera y las ramitas encantadas, nace un bastón.",
    "Grâce aux cœurs de bois et aux brindilles enchantées, un bâton voit le jour.", "Grazie ai cuori di legno e ai ramoscelli incantati nasce un bastone."
  ],
  "A bandit's crossbow that becomes almost unusable after all this fighting.": [
    "Una ballesta de bandido que queda casi inutilizable después de tantos combates.",
    "Une arbalète de bandit qui devient presque inutilisable après tous ces combats.", "Una balestra da bandito che dopo tanti combattimenti diventa quasi inutilizzabile."
  ],
  "Blunt dagger of a bandit after all these bloody fights.": [
    "La daga roma de un bandido después de todos estos combates sanglientos.",
    "Dague émoussée d'un bandit après tous ces combats sanglants.", "Il pugnale smussato di un bandito dopo tanti combattimenti sanguinosi."
  ],
  "Carved from the bones of a disgraced ancient warrior.": [
    "Tallada con los huesos de un antiguo guerrero deshonrado.",
    "Taillée dans les os d'un ancien guerrier déshonoré.", "Intagliata dalle ossa di un antico guerriero caduto in disgrazia."
  ],
  "Small Dark dagger, forged with magical shards and other loot. She becomes formidable.": [
    "Pequeña daga oscura, forjada con fragmentos mágicos y otros botines. Se vuelve formidable.",
    "Petite dague sombre, forgée avec des éclats magiques et d'autres butins. Elle devient redoutable.", "Piccolo pugnale oscuro, forgiato con frammenti magici e altro bottino. Diventa formidabile."
  ],
  "Bow to hunt powerful Tier 1 monsters.": [
    "Arco para cazar monstruos poderosos de nivel 1.",
    "Arc pour chasser de puissants monstres de niveau 1.", "Arco per cacciare potenti mostri di livello 1."
  ],
  "West Mines — Coordinates X: 984 Z: 3479. Gather Coal, Copper, and Iron.": [
    "Minas del Oeste — Coordenadas X: 984 Z: 3479. Reúne carbón, cobre y hierro.",
    "Mines de l'Ouest — Coordonnées X : 984 Z : 3479. Récupérez du charbon, du cuivre et du fer.", "Miniere Ovest — Coordinate X: 984 Z: 3479. Raccogli carbone, rame e ferro."
  ],
  "East Mines — Coordinates X: 2397 Z: 3498. Gather Coal, Copper, and Iron.": [
    "Minas del Este — Coordenadas X: 2397 Z: 3498. Reúne carbón, cobre y hierro.",
    "Mines de l'Est — Coordonnées X : 2397 Z : 3498. Récupérez du charbon, du cuivre et du fer.", "Miniere Est — Coordinate X: 2397 Z: 3498. Raccogli carbone, rame e ferro."
  ],
  "Oak Forest — Coordinates X: 2457 Z: 4308. Gather Oak Wood.": [
    "Bosque de Robles — Coordenadas X: 2457 Z: 4308. Reúne madera de roble.",
    "Forêt de chênes — Coordonnées X : 2457 Z : 4308. Récupérez du bois de chêne.", "Foresta di Querce — Coordinate X: 2457 Z: 4308. Raccogli legno di quercia."
  ],
  /* The Current-Data farming spots name their resources with the confirmed item names, so these
     three descriptions carry their own curated translations. */
  "West Mines — Coordinates X: 986 Z: 3491. Gather Coal Ore, Copper Ingot, and Iron Ingot.": [
    "Minas del Oeste — Coordenadas X: 986 Z: 3491. Reúne mineral de carbón, lingote de cobre y lingote de hierro.",
    "Mines de l'Ouest — Coordonnées X : 986 Z : 3491. Récupérez du minerai de charbon, du lingot de cuivre et du lingot de fer.", "Miniere Ovest — Coordinate X: 986 Z: 3491. Raccogli minerale di carbone, lingotto di rame e lingotto di ferro."
  ],
  "East Mines — Coordinates X: 2399 Z: 3510. Gather Coal Ore, Copper Ingot, and Iron Ingot.": [
    "Minas del Este — Coordenadas X: 2399 Z: 3510. Reúne mineral de carbón, lingote de cobre y lingote de hierro.",
    "Mines de l'Est — Coordonnées X : 2399 Z : 3510. Récupérez du minerai de charbon, du lingot de cuivre et du lingot de fer.", "Miniere Est — Coordinate X: 2399 Z: 3510. Raccogli minerale di carbone, lingotto di rame e lingotto di ferro."
  ],
  "Oak/Birch Forest — Coordinates X: 2459 Z: 4320. Gather Oak Log.": [
    "Bosque de Robles/Abedules — Coordenadas X: 2459 Z: 4320. Reúne tronco de roble.",
    "Forêt de chênes/bouleaux — Coordonnées X : 2459 Z : 4320. Récupérez de la bûche de chêne.", "Foresta di querce/betulle — Coordinate X: 2459 Z: 4320. Raccogli tronco di quercia."
  ],
  "A giant ancient baobab tree standing watch over the area.": [
    "Un enorme baobab antiguo que vigila la zona.",
    "Un immense baobab ancien qui veille sur la région.", "Un gigantesco baobab antico che veglia sulla zona."
  ],
  "A harsh desert known for its silver sands and dangerous predators.": [
    "Un desierto inhóspito conocido por sus arenas plateadas y depredadores peligrosos.",
    "Un désert hostile connu pour ses sables argentés et ses prédateurs dangereux.", "Un deserto ostile, noto per le sue sabbie argentate e i predatori pericolosi."
  ],
  "A vibrant forest filled with lush foliage and winged creatures.": [
    "Un bosque vibrante lleno de vegetación frondosa y criaturas aladas.",
    "Une forêt luxuriante remplie de végétation et de créatures ailées.", "Una foresta vibrante, piena di vegetazione rigogliosa e creature alate."
  ],
  "A fragrant woodland alive with sweet flora and hidden paths.": [
    "Un bosque perfumado lleno de flora dulce y caminos ocultos.",
    "Un bois parfumé rempli d'une flore douce et de chemins cachés.", "Un bosco profumato, animato da flora dolce e sentieri nascosti."
  ],
  "A quiet lake surrounded by rugged scenery and wild beasts.": [
    "Un lago tranquilo rodeado de paisajes escarpados y bestias salvajes.",
    "Un lac paisible entouré de paysages accidentés et de bêtes sauvages.", "Un lago tranquillo circondato da paesaggi aspri e bestie selvatiche."
  ],
  "An ancient tomb filled with necromantic energies.": [
    "Una tumba antigua llena de energías nigrománticas.",
    "Une tombe ancienne remplie d'énergies nécromantiques.", "Un'antica tomba piena di energie negromantiche."
  ],
  "A sacred sanctuary dedicated to the guardian Khesun.": [
    "Un santuario sagrado dedicado al guardián Khesun.",
    "Un sanctuaire sacré dédié au gardien Khesun.", "Un santuario sacro dedicato al guardiano Khesun."
  ],
  "Acacia bark, torn by time.": [
    "Corteza de acacia desgarrada por el paso del tiempo.",
    "Écorce d'acacia déchirée par le temps.", "Corteccia di acacia, lacerata dal tempo."
  ],
  "An orange necklace, with a pure core of honey.": [
    "Un collar naranja con un núcleo puro de miel.",
    "Un collier orange doté d'un cœur de miel pur.", "Una collana arancione con un nucleo puro di miele."
  ],
  "Strong, reliable, perfect for basic manufacturing.": [
    "Fuerte y fiable, perfecto para la fabricación básica.",
    "Solide et fiable, parfait pour la fabrication de base.", "Robusto e affidabile, perfetto per la fabbricazione di base."
  ],
  "Small wood powder made using acacia wood.": [
    "Pequeño polvo de madera hecho con madera de acacia.",
    "Petite poudre de bois fabriquée avec du bois d'acacia.", "Polvere di legno finissima ricavata dal legno di acacia."
  ],
  "A ring carved from warm acacia wood, decorated with a copper stone with glowing reflections.": [
    "Un anillo tallado en cálida madera de acacia y decorado con una piedra de cobre de reflejos brillantes.",
    "Une bague taillée dans du bois d'acacia chaleureux et décorée d'une pierre de cuivre aux reflets lumineux.", "Un anello intagliato nel caldo legno di acacia, decorato con una pietra di rame dai riflessi luminosi."
  ],
  "A sturdy string woven from acacia fibers, and mixed with spider threads.": [
    "Una cuerda resistente tejida con fibras de acacia y mezclada con hilos de araña.",
    "Une ficelle robuste tressée avec des fibres d'acacia et mélangée à des fils d'araignée.", "Una corda robusta intrecciata con fibre di acacia e mescolata a fili di ragno."
  ],
  "Forged long ago, this ring bears the mark of the kingdom's greatest adventurers.": [
    "Forjado hace mucho tiempo, este anillo lleva la marca de los mayores aventureros del reino.",
    "Forgée il y a longtemps, cette bague porte la marque des plus grands aventuriers du royaume.", "Forgiato molto tempo fa, questo anello porta il segno dei più grandi avventurieri del regno."
  ],
  "An affordable belt with a practical design.": [
    "Un cinturón asequible con un diseño práctico.",
    "Une ceinture abordable au design pratique.", "Una cintura accessibile dal design pratico."
  ],
  "An affordable bracelet with a practical design.": [
    "Un brazalete asequible con un diseño práctico.",
    "Un bracelet abordable au design pratique.", "Un bracciale accessibile dal design pratico."
  ],
  "An affordable pair of gloves, quite useful nonetheless.": [
    "Unos guantes asequibles, pero bastante útiles.",
    "Une paire de gants abordable, néanmoins très utile.", "Un paio di guanti accessibili, ma comunque piuttosto utili."
  ],
  "An affordable necklace with a modest, elegant look.": [
    "Un collar asequible con un aspecto modesto y elegante.",
    "Un collier abordable à l'allure modeste et élégante.", "Una collana accessibile dall'aspetto modesto ed elegante."
  ],
  "An affordable ring with a practical design.": [
    "Un anillo asequible con un diseño práctico.",
    "Une bague abordable au design pratique.", "Un anello accessibile dal design pratico."
  ],
  "A massive fang imbued with his savage rage. Its essence is used to brew potions of formidable strength.": [
    "Un colmillo enorme imbuido de su furia salvaje. Su esencia se utiliza para preparar pociones de fuerza formidable.",
    "Un croc massif imprégné de sa rage sauvage. Son essence sert à préparer des potions d'une force redoutable.", "Una zanna enorme impregnata della sua furia selvaggia. La sua essenza serve a preparare pozioni di forza formidabile."
  ],
  "Adorned with massive fangs, snatched from the alpha wolf Albal, dominant predator of the Valley of Wolves.": [
    "Adornado con enormes colmillos arrancados al lobo alfa Albal, depredador dominante del Valle de los Lobos.",
    "Orné de crocs massifs arrachés au loup alpha Albal, prédateur dominant de la Vallée des loups.", "Adornata con zanne enormi, strappate al lupo alfa Albal, predatore dominante della Valle dei Lupi."
  ],
  "Beautiful purple flower widely used by many alchemists for vitality potions.": [
    "Una hermosa flor morada muy utilizada por muchos alquimistas para preparar pociones de vitalidad.",
    "Une magnifique fleur violette largement utilisée par de nombreux alchimistes pour les potions de vitalité.", "Splendido fiore viola, molto usato dagli alchimisti per le pozioni di vitalità."
  ],
  "Used to grow amber plates or for various recipes.": [
    "Se utiliza para cultivar placas de ámbar o para diversas recetas.",
    "Utilisée pour faire pousser des plaques d'ambre ou pour diverses recettes.", "Usata per coltivare placche d'ambra o per varie ricette."
  ],
  "Amber sepal, rich in natural essence, used to strengthen elixirs and even certain potions.": [
    "Sépalo de ámbar, rico en esencia natural, utilizado para reforzar elixires e incluso ciertas pociones.",
    "Sépale d'ambre riche en essence naturelle, utilisé pour renforcer les élixirs et même certaines potions.", "Sepalo d'ambra, ricco di essenza naturale, usato per rinforzare elisir e persino alcune pozioni."
  ],
  "A tenacious and robust amulet to effectively protect your back.": [
    "Un amuleto tenaz y robusto para proteger eficazmente tu espalda.",
    "Une amulette tenace et robuste pour protéger efficacement votre dos.", "Un amuleto tenace e robusto per proteggere efficacemente le spalle."
  ],
  "A pair of gloves sculpted to provide resistance and help stand firm in combat.": [
    "Unos guantes diseñados para ofrecer resistencia y ayudar a mantenerse firme en combate.",
    "Une paire de gants conçue pour offrir de la résistance et aider à tenir bon au combat.", "Un paio di guanti modellati per dare resistenza e aiutare a restare saldi in combattimento."
  ],
  "Forged from pure amethyst crystals, this armor radiates mystical power.": [
    "Forjada con cristales de amatista pura, esta armadura irradia poder místico.",
    "Forgée à partir de cristaux d'améthyste pure, cette armure rayonne d'un pouvoir mystique.", "Forgiata con cristalli di ametista pura, questa armatura irradia potere mistico."
  ],
  "A ring carved to make it as tenacious as an amethyst.": [
    "Un anillo tallado para ser tan tenaz como una amatista.",
    "Une bague taillée pour être aussi tenace qu'une améthyste.", "Un anello intagliato per renderlo tenace come un'ametista."
  ],
  "A shard of sharp amethyst.": ["Un fragmento de amatista afilado.", "Un éclat d'améthyste tranchant.", "Una scheggia di ametista affilata."],
  "A mineral with a captivating and magical purple hue.": [
    "Un mineral de tono morado cautivador y mágico.",
    "Un minéral aux teintes violettes captivantes et magiques.", "Un minerale dalla tonalità viola accattivante e magica."
  ],
  "A tenacious and robust amulet to face the mist and its dangers.": [
    "Un amuleto tenaz y robusto para enfrentarse a la niebla y sus peligros.",
    "Une amulette tenace et robuste pour affronter la brume et ses dangers.", "Un amuleto tenace e robusto per affrontare la nebbia e i suoi pericoli."
  ],
  "A tenacious and robust amulet for quickly tracking down enemies.": [
    "Un amuleto tenaz y robusto para localizar rápidamente a los enemigos.",
    "Une amulette tenace et robuste pour traquer rapidement les ennemis.", "Un amuleto tenace e robusto per rintracciare rapidamente i nemici."
  ],
  "Born in the heart of a corrupted rift, this amulet pulses with unstable and voracious magic.": [
    "Nacido en el corazón de una grieta corrupta, este amuleto palpita con una magia inestable y voraz.",
    "Née au cœur d'une faille corrompue, cette amulette palpite d'une magie instable et vorace.", "Nato nel cuore di una faglia corrotta, questo amuleto pulsa di magia instabile e vorace."
  ],
  "A tenacious and sturdy amulet to harass dark enemies.": [
    "Un amuleto tenaz y resistente para acosar a los enemigos oscuros.",
    "Une amulette tenace et solide pour harceler les ennemis des ténèbres.", "Un amuleto tenace e resistente per molestare i nemici oscuri."
  ],
  "A tenacious and robust amulet to embrace and immobilize enemies.": [
    "Un amuleto tenaz y robusto para atrapar e inmovilizar a los enemigos.",
    "Une amulette tenace et robuste pour enlacer et immobiliser les ennemis.", "Un amuleto tenace e robusto per avvolgere e immobilizzare i nemici."
  ],
  "A tenacious and sturdy amulet to crush enemies to the ground.": [
    "Un amuleto tenaz y resistente para aplastar a los enemigos contra el suelo.",
    "Une amulette tenace et solide pour écraser les ennemis au sol.", "Un amuleto tenace e resistente per schiacciare i nemici al suolo."
  ],
  "A tenacious and robust amulet to escape your enemies.": [
    "Un amuleto tenaz y robusto para escapar de tus enemigos.",
    "Une amulette tenace et robuste pour échapper à vos ennemis.", "Un amuleto tenace e robusto per sfuggire ai nemici."
  ],
  "One of the three barks used as an offering to one of the gods present at Level 2!": [
    "¡Una de las tres cortezas utilizadas como ofrenda a uno de los dioses presentes en el nivel 2!",
    "L'une des trois écorces utilisées comme offrande à l'un des dieux présents au niveau 2 !", "Una delle tre cortecce usate come offerta a uno degli dei presenti al Livello 2!"
  ],
  "A surprisingly brilliant cog when imagining its provenance.": [
    "Un engranaje sorprendentemente brillante considerando su procedencia.",
    "Un engrenage étonnamment brillant quand on imagine sa provenance.", "Un ingranaggio sorprendentemente brillante, considerata la sua provenienza."
  ],
  "A legendary essence of the Ancient Woods.": [
    "Una esencia legendaria de los Bosques Antiguos.",
    "Une essence légendaire des Bois anciens.", "Un'essenza leggendaria dei Boschi Antichi."
  ],
  "Crafted from ancient wood and enchanted moss, this armor vibrates to the rhythm of the forest.": [
    "Fabricada con madera antigua y musgo encantado, esta armadura vibra al ritmo del bosque.",
    "Fabriquée avec du bois ancien et de la mousse enchantée, cette armure vibre au rythme de la forêt.", "Fabbricata con legno antico e muschio incantato, questa armatura vibra al ritmo della foresta."
  ],
  "Allows you to have a Key to the Elder Woods.": [
    "Permite obtener una llave de los Bosques Antiguos.",
    "Permet d'obtenir une clé des Bois anciens.", "Permette di ottenere una chiave dei Boschi Antichi."
  ],
  "Brown stone with changing pinkish shades.": [
    "Piedra marrón con tonos rosados cambiantes.",
    "Pierre brune aux nuances rosées changeantes.", "Pietra bruna dalle sfumature rosate cangianti."
  ],
  "A clear bracelet made of andesite.": ["Un brazalete claro hecho de andesita.", "Un bracelet clair fait d'andésite.", "Un bracciale chiaro fatto di andesite."],
  "A practical pair of andesite gloves.": [
    "Unos guantes prácticos de andesita.",
    "Une paire de gants pratiques en andésite.", "Un paio di guanti pratici di andesite."
  ],
  "A simple andesite necklace.": ["Un collar sencillo de andesita.", "Un collier simple en andésite.", "Una collana semplice di andesite."],
  "A clear ring made of andesite.": ["Un anillo claro hecho de andesita.", "Une bague claire faite d'andésite.", "Un anello chiaro fatto di andesite."],
  "Dense black stone with brilliant luster.": [
    "Piedra negra y densa de brillo intenso.",
    "Pierre noire et dense au lustre éclatant.", "Pietra nera e densa dalla lucentezza brillante."
  ],
  "Could debris from the bottom of an ancient lake be useful?": [
    "¿Podrían ser útiles estos escombros del fondo de un lago antiguo?",
    "Ces débris du fond d'un ancien lac pourraient-ils être utiles ?", "Potrebbero essere utili i detriti del fondo di un lago antico?"
  ],
  "A flexible and strong jewel imbued with the power of the giant spider, which protects its wearer from sudden falls.":
    [
      "Una joya flexible y resistente imbuida del poder de la araña gigante, que protege a quien la lleva de las caídas repentinas.",
      "Un bijou souple et solide imprégné du pouvoir de l'araignée géante, qui protège son porteur des chutes soudaines.", "Un gioiello flessibile e resistente, impregnato del potere del ragno gigante, che protegge chi lo indossa dalle cadute improvvise."
    ],
  "The ruins of a forgotten castle, eaten away by time. Its collapsed walls still whisper the echoes of yesteryear. A place that even the light seems to flee.":
    [
      "Las ruinas de un castillo olvidado, devorado por el tiempo. Sus muros derrumbados aún susurran los ecos del pasado. Un lugar del que hasta la luz parece huir.",
      "Les ruines d'un château oublié, rongé par le temps. Ses murs effondrés murmurent encore les échos d'autrefois. Un lieu que même la lumière semble fuir.", "Le rovine di un castello dimenticato, divorato dal tempo. Le sue mura crollate sussurrano ancora gli echi di un tempo passato. Un luogo da cui persino la luce sembra fuggire."
    ],
  "A lone wolf with icy silver eyes. Its passage leaves a mist and silence.": [
    "Un lobo solitario de ojos plateados y helados. Su paso deja niebla y silencio.",
    "Un loup solitaire aux yeux argentés et glacés. Son passage laisse derrière lui brume et silence.", "Un lupo solitario dagli occhi argentei e gelidi. Il suo passaggio lascia nebbia e silenzio."
  ],
  "In the depths of Arakh'Nol, light struggles to break through. Each tree is knotted with thick, living webs. The whispers of the wind hide the whispers of ancient spirits, and those who stray from them rarely guess the stories being told. A forgotten entity weaves more than traps there.":
    [
      "En las profundidades de Arakh'Nol, la luz apenas logra abrirse paso. Cada árbol está cubierto de gruesas telarañas vivas. Los susurros del viento ocultan los de antiguos espíritus, y quienes se alejan rara vez imaginan las historias que se cuentan. Allí, una entidad olvidada teje algo más que trampas.",
      "Dans les profondeurs d'Arakh'Nol, la lumière peine à percer. Chaque arbre est noué de toiles épaisses et vivantes. Les murmures du vent cachent ceux d'anciens esprits, et ceux qui s'en écartent devinent rarement les histoires racontées. Une entité oubliée y tisse plus que des pièges.", "Nelle profondità di Arakh'Nol la luce fatica a farsi strada. Ogni albero è annodato da tele spesse e vive. I sussurri del vento nascondono quelli di antichi spiriti, e chi se ne allontana raramente immagina le storie che vengono narrate. Un'entità dimenticata vi tesse qualcosa di più delle trappole."
    ],
  "A mysterious moonlit altar located at the heart of Map 2.": [
    "Un altar misterioso iluminado por la luna, situado en el corazón del mapa 2.",
    "Un autel mystérieux baigné par la lune, situé au cœur de la carte 2.", "Un misterioso altare illuminato dalla luna, situato nel cuore della Mappa 2."
  ],
  "A shoreline biome where monsters gather along restless waves.": [
    "Un bioma costero donde los monstruos se reúnen junto a olas inquietas.",
    "Un biome côtier où les monstres se rassemblent le long de vagues agitées.", "Un bioma costiero dove i mostri si radunano lungo onde inquiete."
  ],
  "Take back items from Bulls and Bears.": [
    "Recupera objetos de los toros y los osos.",
    "Récupérez des objets auprès des taureaux et des ours.", "Recupera oggetti dai tori e dagli orsi."
  ],
  "Nestled between the steep peaks, Candelia seems frozen in time. Its lanterns flicker without wind, and the fields never wither. The ancients say that souls still whisper there at nightfall...":
    [
      "Enclavada entre picos escarpados, Candelia parece congelada en el tiempo. Sus faroles titilan sin viento y sus campos nunca se marchitan. Los antiguos dicen que las almas aún susurran allí al anochecer...",
      "Nichée entre de hauts sommets, Candelia semble figée dans le temps. Ses lanternes vacillent sans vent et ses champs ne dépérissent jamais. Les anciens disent que les âmes y murmurent encore à la tombée de la nuit...", "Incastonata tra cime impervie, Candelia sembra sospesa nel tempo. Le sue lanterne tremolano senza vento e i campi non appassiscono mai. Gli antichi dicono che le anime sussurrino ancora lì al calare della notte..."
    ],
  "Perched at the top of a forgotten ridge, the hamlet of CastelBrume watches over the valley. Its mills howl in the icy mist, like a call to lost souls...":
    [
      "En lo alto de una cresta olvidada, la aldea de CastelBrume vigila el valle. Sus molinos aúllan en la niebla helada, como una llamada a las almas perdidas...",
      "Perché au sommet d'une crête oubliée, le hameau de CastelBrume veille sur la vallée. Ses moulins hurlent dans la brume glacée, comme un appel aux âmes perdues...", "Arroccato in cima a una cresta dimenticata, il borgo di CastelBrume veglia sulla valle. I suoi mulini ululano nella nebbia gelida, come un richiamo alle anime perdute..."
    ],
  "Forged in stone and awakened by ancient magic, it guards forgotten lands against any intrusion. His steps alone make the forest shake...":
    [
      "Forjado en piedra y despertado por magia antigua, protege las tierras olvidadas de cualquier intrusión. Sus pasos bastan para hacer temblar el bosque...",
      "Forgé dans la pierre et réveillé par une magie ancienne, il protège les terres oubliées de toute intrusion. Ses seuls pas font trembler la forêt...", "Forgiato nella pietra e risvegliato da magia antica, protegge le terre dimenticate da ogni intrusione. Solo i suoi passi fanno tremare la foresta..."
    ],
  "This old mine contains crystals of exceptional purity. It is said that their brilliance is linked to human emotions... But some miners, fascinated, got lost there forever.":
    [
      "Esta antigua mina contiene cristales de pureza excepcional. Se dice que su brillo está ligado a las emociones humanas... Pero algunos mineros, fascinados, se perdieron allí para siempre.",
      "Cette ancienne mine contient des cristaux d'une pureté exceptionnelle. On dit que leur éclat est lié aux émotions humaines... Mais certains mineurs, fascinés, s'y sont perdus à jamais.", "Questa vecchia miniera contiene cristalli di purezza eccezionale. Si dice che il loro splendore sia legato alle emozioni umane... Ma alcuni minatori, affascinati, vi si persero per sempre."
    ],
  "An ancient arena carved from red rock. It is said that a single eye still watches over it, ready to judge intruders by brute force.":
    [
      "Una antigua arena tallada en roca roja. Se dice que un ojo solitario aún la vigila, dispuesto a juzgar a los intrusos por la fuerza bruta.",
      "Une ancienne arène taillée dans la roche rouge. On dit qu'un œil solitaire la surveille encore, prêt à juger les intrus par la force brute.", "Un'antica arena scavata nella roccia rossa. Si dice che un occhio solitario la sorvegli ancora, pronto a giudicare gli intrusi con la forza bruta."
    ],
  "Forged from bone and dark magic, this armor grants strength and protection.": [
    "Forjada con hueso y magia oscura, esta armadura otorga fuerza y protección.",
    "Forgée avec des os et de la magie sombre, cette armure confère force et protection.", "Forgiata con ossa e magia oscura, questa armatura concede forza e protezione."
  ],
  "Forged in the ruins of an ancient war fort, it still trembles from these ancient battles.": [
    "Forjado en las ruinas de un antiguo fuerte de guerra, aún tiembla por aquellas batallas pasadas.",
    "Forgé dans les ruines d'un ancien fort de guerre, il tremble encore du souvenir de ces batailles.", "Forgiato nelle rovine di un antico forte di guerra, trema ancora per quelle battaglie passate."
  ],
  "A fine billhook in golden and black hues, whose tapered blade evokes the deadly stinger of a bee.": [
    "Una elegante podadera de tonos dorados y negros, cuya hoja afilada recuerda al aguijón mortal de una abeja.",
    "Une élégante serpe aux teintes dorées et noires, dont la lame effilée évoque le dard mortel d'une abeille.", "Una raffinata roncola dai toni dorati e neri, la cui lama affusolata evoca il pungiglione mortale di un'ape."
  ],
  "Light and flexible, this bee-inspired armor allows speed and precision, ideal for assassins.": [
    "Ligera y flexible, esta armadura inspirada en las abejas permite velocidad y precisión, ideal para asesinos.",
    "Légère et flexible, cette armure inspirée des abeilles favorise la vitesse et la précision, idéale pour les assassins.", "Leggera e flessibile, questa armatura ispirata alle api favorisce velocità e precisione, ideale per gli assassini."
  ],
  "A fine scythe with sharp lines, decorated with honeycomb patterns, evoking the precision and threat of a predatory insect.":
    [
      "Una elegante guadaña de líneas afiladas, decorada con motivos de panal que evocan la precisión y la amenaza de un insecto depredador.",
      "Une élégante faux aux lignes acérées, décorée de motifs en nid d'abeilles évoquant la précision et la menace d'un insecte prédateur.", "Una raffinata falce dalle linee affilate, decorata con motivi a nido d'ape che evocano la precisione e la minaccia di un insetto predatore."
    ],
  "A bracelet forged in Asterios's image, imbued with his ferocity and rage.": [
    "Un brazalete forjado a imagen de Asterios, imbuido de su ferocidad y su rabia.",
    "Un bracelet forgé à l'image d'Asterios, imprégné de sa férocité et de sa rage.", "Un bracciale forgiato a immagine di Asterios, impregnato della sua ferocia e della sua rabbia."
  ],
  "A blue feather with deep shimmers, seeming to capture the hue of the sky.": [
    "Una pluma azul de reflejos profundos que parece capturar el tono del cielo.",
    "Une plume bleue aux reflets profonds, semblant capturer la teinte du ciel.", "Una piuma azzurra dai riflessi profondi, che sembra catturare la tonalità del cielo."
  ],
  "Deep blue stone with dark reflections.": [
    "Piedra azul intensa con reflejos oscuros.",
    "Pierre d'un bleu profond aux reflets sombres.", "Pietra blu intenso dai riflessi scuri."
  ],
  "These worn gloves bear the marks of countless thefts and impromptu confrontations.": [
    "Estos guantes gastados llevan las marcas de innumerables robos y enfrentamientos improvisados.",
    "Ces gants usés portent les marques d'innombrables larcins et affrontements improvisés.", "Questi guanti consumati portano i segni di innumerevoli furti e scontri improvvisati."
  ],
  "A gold coin stolen by bandits used for various clandestine transactions.": [
    "Una moneda de oro robada por bandidos y utilizada en diversas transacciones clandestinas.",
    "Une pièce d'or volée par des bandits et utilisée pour diverses transactions clandestines.", "Una moneta d'oro rubata dai banditi e usata per varie transazioni clandestine."
  ],
  "Barley sugar with sugar. Gives an incredible Boost.": [
    "Azúcar de cebada con azúcar. Proporciona una mejora increíble.",
    "Sucre d'orge au sucre. Accorde un bonus incroyable.", "Zucchero d'orzo con zucchero. Concede un potenziamento incredibile."
  ],
  "Dense, fine-grained black rock.": ["Roca negra, densa y de grano fino.", "Roche noire, dense et à grain fin.", "Roccia nera, densa e a grana fine."],
  "Slip this kit onto a damaged tool to restore 25% of its maximum durability.": [
    "Coloca este kit en una herramienta dañada para restaurar el 25 % de su durabilidad máxima.",
    "Placez ce kit sur un outil endommagé pour restaurer 25 % de sa durabilité maximale.", "Applica questo kit su uno strumento danneggiato per ripristinare il 25% della sua durabilità massima."
  ],
  "An effective amulet, forged with bauxite. A strange energy emanates from it.": [
    "Un amuleto eficaz, forjado con bauxita. De él emana una energía extraña.",
    "Une amulette efficace, forgée avec de la bauxite. Une énergie étrange s'en dégage.", "Un amuleto efficace, forgiato con la bauxite. Ne emana un'energia strana."
  ],
  "Forged with the bauxite that is forged on level 2.": [
    "Forjado con la bauxita que se obtiene en el nivel 2.",
    "Forgé avec la bauxite extraite au niveau 2.", "Forgiato con la bauxite che si estrae al Livello 2."
  ],
  "A pair of gloves made from bauxite, shiny and strong like a ruby": [
    "Unos guantes hechos de bauxita, brillantes y resistentes como un rubí.",
    "Une paire de gants en bauxite, brillants et solides comme un rubis.", "Un paio di guanti di bauxite, lucenti e resistenti come un rubino."
  ],
  "Pure, strong and lightweight bauxite ingot. Ideal for forging handy weapons or durable tools.": [
    "Lingote de bauxita puro, resistente y ligero. Ideal para forjar armas manejables o herramientas duraderas.",
    "Lingot de bauxite pur, solide et léger. Idéal pour forger des armes maniables ou des outils durables.", "Lingotto di bauxite puro, robusto e leggero. Ideale per forgiare armi maneggevoli o strumenti durevoli."
  ],
  "Forged in brilliant bauxite, this ring is distinguished by its power, its light color and its solidity.": [
    "Forjado con bauxita brillante, este anillo destaca por su poder, su color claro y su solidez.",
    "Forgée avec de la bauxite brillante, cette bague se distingue par sa puissance, sa couleur claire et sa solidité.", "Forgiato in bauxite brillante, questo anello si distingue per la sua potenza, il colore chiaro e la solidità."
  ],
  "A belt made from bear resources.": [
    "Un cinturón fabricado con recursos de oso.",
    "Une ceinture fabriquée avec des ressources d'ours.", "Una cintura fabbricata con risorse d'orso."
  ],
  "Sharp and curved, it testifies to the ferocity and strength of a formidable predator.": [
    "Afilado y curvado, da fe de la ferocidad y la fuerza de un depredador formidable.",
    "Tranchant et courbé, il témoigne de la férocité et de la force d'un prédateur redoutable.", "Affilato e ricurvo, testimonia la ferocia e la forza di un predatore formidabile."
  ],
  "Used for leather care or as fuel, this grease gives off a strong wild odor.": [
    "Utilizada para cuidar el cuero o como combustible, esta grasa desprende un fuerte olor salvaje.",
    "Utilisée pour entretenir le cuir ou comme combustible, cette graisse dégage une forte odeur sauvage.", "Usato per curare il cuoio o come combustibile, questo grasso emana un forte odore selvatico."
  ],
  "A pair of gloves made from bear skin, located on level 2": [
    "Unos guantes hechos de piel de oso, disponibles en el nivel 2.",
    "Une paire de gants en peau d'ours, disponible au niveau 2.", "Un paio di guanti di pelle d'orso, disponibili al Livello 2."
  ],
  "Forged from a heavy, raw metal, it bears the mark of the wild bear. Brute strength and unfailing resistance.": [
    "Forjado con un metal pesado y sin refinar, lleva la marca del oso salvaje. Fuerza bruta y resistencia inquebrantable.",
    "Forgé dans un métal lourd et brut, il porte la marque de l'ours sauvage. Une force brute et une résistance infaillible.", "Forgiato con un metallo pesante e grezzo, porta il marchio dell'orso selvaggio. Forza bruta e resistenza incrollabile."
  ],
  "A thick tanned fur, capable of resisting attacks and offering unrivaled warmth.": [
    "Una piel gruesa y curtida, capaz de resistir ataques y ofrecer un calor incomparable.",
    "Une fourrure épaisse et tannée, capable de résister aux attaques et d'offrir une chaleur inégalée.", "Una pelliccia spessa e conciata, capace di resistere agli attacchi e di offrire un calore impareggiabile."
  ],
  "A thick beast fur used by orcs.": [
    "Una piel gruesa de bestia utilizada por los orcos.",
    "Une épaisse fourrure de bête utilisée par les orques.", "Una spessa pelliccia di bestia usata dagli orchi."
  ],
  "This catalyst is more powerful than it looks.": [
    "Este catalizador es más poderoso de lo que parece.",
    "Ce catalyseur est plus puissant qu'il n'en a l'air.", "Questo catalizzatore è più potente di quanto sembri."
  ],
  "Thick and segmented, this shell effectively protects against attacks. Perfect for shaping equipment.": [
    "Grueso y segmentado, este caparazón protege eficazmente contra los ataques. Perfecto para fabricar equipo.",
    "Épaisse et segmentée, cette carapace protège efficacement contre les attaques. Parfaite pour façonner de l'équipement.", "Spesso e segmentato, questo guscio protegge efficacemente dagli attacchi. Perfetto per modellare equipaggiamento."
  ],
  "Barely protects against a blade, but it's still better than nothing.": [
    "Apenas protege contra una hoja, pero sigue siendo mejor que nada.",
    "Elle protège à peine contre une lame, mais c'est toujours mieux que rien.", "Protegge a malapena da una lama, ma è comunque meglio di niente."
  ],
  "Small wood powder made using birch wood.": [
    "Pequeño polvo de madera hecho con madera de abedul.",
    "Petite poudre de bois fabriquée avec du bois de bouleau.", "Polvere di legno finissima ricavata dal legno di betulla."
  ],
  "A ring crafted from light birch wood, set with a raw ironstone with a dark, metallic heart.": [
    "Un anillo fabricado con madera clara de abedul y engastado con una piedra de hierro en bruto de corazón oscuro y metálico.",
    "Une bague fabriquée en bois clair de bouleau, sertie d'une pierre de fer brut au cœur sombre et métallique.", "Un anello realizzato in chiaro legno di betulla, incastonato con una pietra di ferro grezza dal cuore scuro e metallico."
  ],
  "A sturdy string woven from birch fibers and mixed with spider threads.": [
    "Una cuerda resistente tejida con fibras de abedul y mezclada con hilos de araña.",
    "Une ficelle robuste tressée avec des fibres de bouleau et mélangée à des fils d'araignée.", "Una corda robusta intrecciata con fibre di betulla e mescolata a fili di ragno."
  ],
  "A hard, dark fragment of bone, marked by time and death.": [
    "Un fragmento de hueso duro y oscuro, marcado por el tiempo y la muerte.",
    "Un fragment d'os dur et sombre, marqué par le temps et la mort.", "Un frammento d'osso duro e scuro, segnato dal tempo e dalla morte."
  ],
  "Incredibly light black boots infused with magic.": [
    "Botas negras increíblemente ligeras e imbuidas de magia.",
    "Des bottes noires incroyablement légères, imprégnées de magie.", "Stivali neri incredibilmente leggeri, impregnati di magia."
  ],
  "A black spider carcass.": ["El cadáver de una araña negra.", "Une carcasse d'araignée noire.", "Il cadavere di un ragno nero."],
  "A small luminous lantern with a mysterious and captivating aura.": [
    "Una pequeña linterna luminosa con un aura misteriosa y cautivadora.",
    "Une petite lanterne lumineuse à l'aura mystérieuse et captivante.", "Una piccola lanterna luminosa dall'aura misteriosa e accattivante."
  ],
  "A black spider mandible.": ["Una mandíbula de araña negra.", "Une mandibule d'araignée noire.", "Una mandibola di ragno nero."],
  "A fine dark powder, made from ancient crushed bones, imbued with a sinister aura.": [
    "Un fino polvo oscuro hecho de huesos antiguos triturados, imbuido de un aura siniestra.",
    "Une fine poudre sombre, faite d'os anciens broyés et imprégnée d'une aura sinistre.", "Una polvere scura finissima, ricavata da antiche ossa triturate e impregnata di un'aura sinistra."
  ],
  "Forged in darkness by the legendary Magnus, this shield absorbs blows with supernatural strength. Its immense weight slows down its wearer but offers unparalleled protection.":
    [
      "Forjado en la oscuridad por el legendario Magnus, este escudo absorbe los golpes con fuerza sobrenatural. Su peso inmenso ralentiza a quien lo lleva, pero ofrece una protección incomparable.",
      "Forgé dans les ténèbres par le légendaire Magnus, ce bouclier absorbe les coups avec une force surnaturelle. Son poids immense ralentit son porteur, mais offre une protection inégalée.", "Forgiato nell'oscurità dal leggendario Magnus, questo scudo assorbe i colpi con forza soprannaturale. Il suo peso immenso rallenta chi lo porta, ma offre una protezione impareggiabile."
    ],
  "Deep, pure black crystal.": ["Cristal negro intenso y puro.", "Cristal noir profond et pur.", "Cristallo nero profondo e puro."],
  "A black spider thread.": ["Un hilo de araña negra.", "Un fil d'araignée noire.", "Un filo di ragno nero."],
  "A blank parchment where the enchanted inscriptions have disappeared over time.": [
    "Un pergamino en blanco cuyas inscripciones encantadas han desaparecido con el tiempo.",
    "Un parchemin vierge dont les inscriptions enchantées ont disparu avec le temps.", "Una pergamena vuota, le cui iscrizioni incantate sono scomparse con il tempo."
  ],
  "An intense red feather with fiery nuances, evoking the heat of a living flame.": [
    "Una pluma roja intensa con matices de fuego, que evoca el calor de una llama viva.",
    "Une plume rouge intense aux nuances ardentes, évoquant la chaleur d'une flamme vivante.", "Una piuma rossa intensa dalle sfumature infuocate, che evoca il calore di una fiamma viva."
  ],
  "A pair of mittens decorated with a winter pattern and designed to keep hands warm even in cold areas.": [
    "Unas manoplas decoradas con un motivo invernal y diseñadas para mantener las manos calientes incluso en zonas frías.",
    "Une paire de moufles décorées d'un motif hivernal, conçues pour garder les mains au chaud même dans les régions froides.", "Un paio di muffole decorate con un motivo invernale, progettate per tenere le mani calde anche nelle zone fredde."
  ],
  "Usable for basic tannery.": ["Utilizable para el curtido básico.", "Utilisable pour le tannage de base.", "Utilizzabile per la concia di base."],
  "Their crude structure roughly protects the hands while recalling the macabre origin of their materials.": [
    "Su estructura rudimentaria protege las manos de forma limitada y recuerda el origen macabro de sus materiales.",
    "Leur structure rudimentaire protège sommairement les mains tout en rappelant l'origine macabre de leurs matériaux.", "La loro struttura grezza protegge sommariamente le mani e ricorda l'origine macabra dei materiali."
  ],
  "A thin bow with harmonious curves, decorated with ribbons and heart motifs.": [
    "Un arco delgado de curvas armoniosas, decorado con cintas y motivos de corazones.",
    "Un arc fin aux courbes harmonieuses, décoré de rubans et de motifs en forme de cœur.", "Un arco sottile dalle curve armoniose, decorato con nastri e motivi a cuore."
  ],
  "Emblem of a war machine, transmits the orders of a forgotten king.": [
    "Emblema de una máquina de guerra que transmite las órdenes de un rey olvidado.",
    "Emblème d'une machine de guerre, il transmet les ordres d'un roi oublié.", "Emblema di una macchina da guerra, trasmette gli ordini di un re dimenticato."
  ],
  "A simple strip of iron, forged and gelled with slime.": [
    "Una simple tira de hierro, forjada y gelificada con slime.",
    "Une simple bande de fer, forgée et gélifiée avec du slime.", "Una semplice striscia di ferro, forgiata e gelatinizzata con la melma."
  ],
  "A sturdy bracelet designed for hunting dark foes.": [
    "Un brazalete resistente diseñado para cazar enemigos oscuros.",
    "Un bracelet robuste conçu pour chasser les ennemis des ténèbres.", "Un bracciale robusto progettato per cacciare i nemici oscuri."
  ],
  "A sturdy bracelet built to withstand the dangers of the wild.": [
    "Un brazalete resistente creado para soportar los peligros de la naturaleza.",
    "Un bracelet robuste conçu pour résister aux dangers de la nature sauvage.", "Un bracciale robusto costruito per resistere ai pericoli della natura selvaggia."
  ],
  "A brown spider carcass.": ["El cadáver de una araña marrón.", "Une carcasse d'araignée brune.", "Il cadavere di un ragno marrone."],
  "A brown spider mandible.": ["Una mandíbula de araña marrón.", "Une mandibule d'araignée brune.", "Una mandibola di ragno marrone."],
  "A brown spider thread.": ["Un hilo de araña marrón.", "Un fil d'araignée brune.", "Un filo di ragno marrone."],
  "Weight of a soulless war, terrifying and cutting through all forms of life.": [
    "El peso de una guerra sin alma, aterrador y capaz de atravesar toda forma de vida.",
    "Le poids d'une guerre sans âme, terrifiant et capable de trancher toute forme de vie.", "Il peso di una guerra senz'anima, terrificante e capace di trapassare ogni forma di vita."
  ],
  "A pair of gloves fluctuating from the souls of its victims, dead and forgotten.": [
    "Unos guantes que fluctúan con las almas de sus víctimas, muertas y olvidadas.",
    "Une paire de gants qui fluctuent avec les âmes de leurs victimes, mortes et oubliées.", "Un paio di guanti che fluttuano con le anime delle loro vittime, morte e dimenticate."
  ],
  "A soul that is always looking for a target. Found, lost and snatched.": [
    "Un alma que siempre busca un objetivo. Encontrada, perdida y arrebatada.",
    "Une âme toujours à la recherche d'une cible. Trouvée, perdue et arrachée.", "Un'anima che cerca sempre un bersaglio. Trovata, perduta e strappata."
  ],
  "An ancient and mysterious ring used to measure the souls of the beings around it.": [
    "Un anillo antiguo y misterioso utilizado para medir las almas de los seres que lo rodean.",
    "Une bague ancienne et mystérieuse utilisée pour mesurer les âmes des êtres qui l'entourent.", "Un anello antico e misterioso, usato per misurare le anime degli esseri che lo circondano."
  ],
  "Balls of different metals welded together over the centuries, refusing to give in to the erosion of time.": [
    "Bolas de distintos metales soldadas durante siglos, decididas a resistir la erosión del tiempo.",
    "Des boules de différents métaux soudées au fil des siècles, refusant de céder à l'érosion du temps.", "Sfere di metalli diversi saldate insieme nei secoli, decise a non cedere all'erosione del tempo."
  ],
  "Wearing this helmet is like feeling something spinning, behind your temples, without ever stopping.": [
    "Llevar este casco es como sentir algo girando detrás de las sienes sin detenerse jamás.",
    "Porter ce casque revient à sentir quelque chose tourner derrière les tempes, sans jamais s'arrêter.", "Indossare questo elmo è come sentire qualcosa girare dietro le tempie, senza mai fermarsi."
  ],
  "Soulless blade, sharp and capable of absorbing the life of the deceased.": [
    "Hoja sin alma, afilada y capaz de absorber la vida de los muertos.",
    "Lame sans âme, acérée et capable d'absorber la vie des défunts.", "Lama senz'anima, affilata e capace di assorbire la vita dei defunti."
  ],
  "Rotates silently, without friction. Those who wear it disappear before even moving, drained of their soul.": [
    "Gira en silencio y sin fricción. Quienes lo llevan desaparecen antes de moverse, drenados de su alma.",
    "Il tourne en silence, sans friction. Ceux qui le portent disparaissent avant même de bouger, vidés de leur âme.", "Ruota in silenzio, senza attrito. Chi lo indossa svanisce prima ancora di muoversi, svuotato della sua anima."
  ],
  "An austere scythe with sepulchral runes whose black blade evokes ancient rites and forces beyond the grave.": [
    "Una guadaña austera con runas sepulcrales cuya hoja negra evoca antiguos ritos y fuerzas más allá de la tumba.",
    "Une faux austère aux runes sépulcrales, dont la lame noire évoque d'anciens rites et des forces venues d'au-delà de la tombe.", "Una falce austera con rune sepolcrali, la cui lama nera evoca antichi riti e forze provenienti da oltre la tomba."
  ],
  "Its massive size symbolizes the weight of judgment brought to bear on the living.": [
    "Su tamaño descomunal simboliza el peso del juicio impuesto a los vivos.",
    "Sa taille imposante symbolise le poids du jugement qui s'abat sur les vivants.", "La sua mole imponente simboleggia il peso del giudizio che si abbatte sui vivi."
  ],
  "A sturdy string braided from a pure onyx alloy, and mixed with spider threads.": [
    "Una cuerda resistente trenzada con una aleación de ónice puro y mezclada con hilos de araña.",
    "Une ficelle robuste tressée avec un alliage d'onyx pur et mélangée à des fils d'araignée.", "Una corda robusta intrecciata con una lega di onice puro e mescolata a fili di ragno."
  ],
  "A strong string woven from a bauxite alloy, and mixed with spider threads.": [
    "Una cuerda resistente tejida con una aleación de bauxita y mezclada con hilos de araña.",
    "Une ficelle solide tressée avec un alliage de bauxite et mélangée à des fils d'araignée.", "Una corda robusta intrecciata con una lega di bauxite e mescolata a fili di ragno."
  ],
  "This rudimentary necklace is decorated with a bull's claw securely attached by a thick leather link.": [
    "Este collar rudimentario está decorado con una garra de toro fijada con un grueso eslabón de cuero.",
    "Ce collier rudimentaire est décoré d'une griffe de taureau solidement fixée par un gros maillon de cuir.", "Questa collana rudimentale è decorata con un artiglio di toro fissato saldamente da un grosso anello di cuoio."
  ],
  "Small wood powder made using fir wood.": [
    "Pequeño polvo de madera hecho con madera de abeto.",
    "Petite poudre de bois fabriquée avec du bois de sapin.", "Polvere di legno finissima ricavata dal legno di abete."
  ],
  "A sturdy twine braided from fir fibers, and mixed with spider threads.": [
    "Una cuerda resistente trenzada con fibras de abeto y mezclada con hilos de araña.",
    "Une ficelle robuste tressée avec des fibres de sapin et mélangée à des fils d'araignée.", "Una cordicella robusta intrecciata con fibre di abete e mescolata a fili di ragno."
  ],
  "A glowing feather, vibrating with magical energy. Used by craftsmen.": [
    "Una pluma brillante que vibra con energía mágica. Utilizada por los artesanos.",
    "Une plume lumineuse vibrant d'énergie magique. Utilisée par les artisans.", "Una piuma luminosa, vibrante di energia magica. Usata dagli artigiani."
  ],
  "Translucent purple crystal with cubic facets.": [
    "Cristal morado translúcido con facetas cúbicas.",
    "Cristal violet translucide aux facettes cubiques.", "Cristallo viola traslucido con facce cubiche."
  ],
  "A flying spider wing.": ["Un ala de araña voladora.", "Une aile d'araignée volante.", "Un'ala di ragno volante."],
  "Can be used to access the dungeon: Geldorak Mine.": [
    "Puede utilizarse para acceder a la mazmorra: Mina de Geldorak.",
    "Peut être utilisée pour accéder au donjon : Mine de Geldorak.", "Può essere usata per accedere al dungeon: Miniera di Geldorak."
  ],
  "Eroded by time and dust, this shield was lost throughout time in dimensions.": [
    "Erosionado por el tiempo y el polvo, este escudo se perdió durante eras entre dimensiones.",
    "Érodé par le temps et la poussière, ce bouclier s'est perdu à travers les dimensions au fil des âges.", "Eroso dal tempo e dalla polvere, questo scudo si perse tra le dimensioni nel corso delle ere."
  ],
  "The power of the ancients is felt through this fragment.": [
    "El poder de los antiguos se percibe a través de este fragmento.",
    "Le pouvoir des anciens se ressent à travers ce fragment.", "Il potere degli antichi si percepisce attraverso questo frammento."
  ],
  "A fine icy powder harvested from ice creatures.": [
    "Un fino polvo helado obtenido de criaturas de hielo.",
    "Une fine poudre glacée récoltée sur des créatures de glace.", "Una polvere ghiacciata finissima, raccolta da creature di ghiaccio."
  ],
  "A liquid sparkling like a diamond. It's not healing, it's accepting happiness.": [
    "Un líquido que brilla como un diamante. No cura: acepta la felicidad.",
    "Un liquide étincelant comme un diamant. Il ne soigne pas, il accueille le bonheur.", "Un liquido scintillante come un diamante. Non guarisce: accoglie la felicità."
  ],
  "A carved stone, solid as ice, embedded in a necklace referencing Grivelmar, a stronghold that was long forgotten.": [
    "Una piedra tallada, sólida como el hielo, engastada en un collar relacionado con Grivelmar, una fortaleza olvidada hace mucho tiempo.",
    "Une pierre taillée, solide comme la glace, sertie dans un collier faisant référence à Grivelmar, une forteresse oubliée depuis longtemps.", "Una pietra intagliata, solida come il ghiaccio, incastonata in una collana che rimanda a Grivelmar, una fortezza dimenticata da tempo."
  ],
  "Deep red crystal with dark facets.": [
    "Cristal rojo intenso con facetas oscuras.",
    "Cristal rouge profond aux facettes sombres.", "Cristallo rosso intenso con facce scure."
  ],
  "A carefully wrapped present, decorated with ribbons and heart motifs, charged with a tender intention.": [
    "Un regalo cuidadosamente envuelto, decorado con cintas y motivos de corazones, cargado de una tierna intención.",
    "Un cadeau soigneusement emballé, décoré de rubans et de motifs de cœurs, chargé d'une tendre intention.", "Un regalo avvolto con cura, decorato con nastri e motivi a cuore, carico di una tenera intenzione."
  ],
  "A pair of gloves carved to reinforce the dark energy of the woods.": [
    "Unos guantes tallados para reforzar la energía oscura de los bosques.",
    "Une paire de gants taillée pour renforcer l'énergie sombre des bois.", "Un paio di guanti intagliati per rafforzare l'energia oscura dei boschi."
  ],
  "An amulet carved from simple iron, fused with an essence of slime.": [
    "Un amuleto tallado en hierro sencillo y fusionado con una esencia de slime.",
    "Une amulette taillée dans du fer simple, fusionnée avec une essence de slime.", "Un amuleto intagliato in ferro semplice, fuso con un'essenza di melma."
  ],
  "A frame used by goblins.": ["Una estructura utilizada por los goblins.", "Une structure utilisée par les gobelins.", "Una struttura usata dai goblin."],
  "Goblin blood, used for various reasons.": [
    "Sangre de goblin utilizada por diversos motivos.",
    "Sang de gobelin utilisé pour diverses raisons.", "Sangue di goblin, usato per vari motivi."
  ],
  "An absorbed goblin essence.": ["Una esencia de goblin absorbida.", "Une essence de gobelin absorbée.", "Un'essenza di goblin assorbita."],
  "A goblin eye torn out during a fight.": [
    "Un ojo de goblin arrancado durante un combate.",
    "Un œil de gobelin arraché lors d'un combat.", "Un occhio di goblin strappato durante un combattimento."
  ],
  "A valuable luminous piece, bringing luck and prosperity.": [
    "Una valiosa pieza luminosa que trae suerte y prosperidad.",
    "Une précieuse pièce lumineuse apportant chance et prospérité.", "Un prezioso pezzo luminoso, che porta fortuna e prosperità."
  ],
  "A rough copper belt with a surprisingly elegant look.": [
    "Un cinturón de cobre tosco con un aspecto sorprendentemente elegante.",
    "Une ceinture de cuivre brute à l'allure étonnamment élégante.", "Una cintura di rame grezza dall'aspetto sorprendentemente elegante."
  ],
  "A grainy bracelet made of copper.": [
    "Un brazalete de cobre de textura granulada.",
    "Un bracelet de cuivre granuleux.", "Un bracciale di rame dalla grana grossolana."
  ],
  "A grainy ring made of copper.": ["Un anillo de cobre de textura granulada.", "Une bague de cuivre granuleuse.", "Un anello di rame dalla grana grossolana."],
  "A robust bracelet made of granite.": ["Un brazalete robusto hecho de granito.", "Un bracelet robuste en granit.", "Un bracciale robusto fatto di granito."],
  "A sturdy pair of granite gloves.": [
    "Unos guantes resistentes de granito.",
    "Une paire de gants robustes en granit.", "Un paio di guanti resistenti di granito."
  ],
  "A simple granite necklace.": ["Un collar sencillo de granito.", "Un collier simple en granit.", "Una collana semplice di granito."],
  "A sturdy ring made of granite.": ["Un anillo resistente hecho de granito.", "Une bague robuste en granit.", "Un anello resistente fatto di granito."],
  "A grimoire with a dark and ancient history.": [
    "Un grimorio con una historia oscura y antigua.",
    "Un grimoire à l'histoire sombre et ancienne.", "Un grimorio dalla storia oscura e antica."
  ],
  "A skeletal necklace, worn by the guardian of the shrine.": [
    "Un collar de esqueleto llevado por el guardián del santuario.",
    "Un collier squelettique porté par le gardien du sanctuaire.", "Una collana scheletrica, indossata dal guardiano del santuario."
  ],
  "Fresh from the forge, this blade embodies the ideal of the protector.": [
    "Recién salida de la forja, esta hoja encarna el ideal del protector.",
    "Fraîchement sortie de la forge, cette lame incarne l'idéal du protecteur.", "Appena uscita dalla forgia, questa lama incarna l'ideale del protettore."
  ],
  "An old bracelet whose inscriptions undulate slightly, as if stirred by an invisible wind.": [
    "Un brazalete antiguo cuyas inscripciones ondulan ligeramente, como agitadas por un viento invisible.",
    "Un vieux bracelet dont les inscriptions ondulent légèrement, comme agitées par un vent invisible.", "Un vecchio bracciale le cui iscrizioni ondeggiano leggermente, come agitate da un vento invisibile."
  ],
  "A massive hammer embellished with amorous symbols, contrasting power and delicacy.": [
    "Un martillo enorme adornado con símbolos amorosos que contrastan poder y delicadeza.",
    "Un marteau massif orné de symboles amoureux, contrastant puissance et délicatesse.", "Un martello massiccio ornato di simboli amorosi, che contrappongono potenza e delicatezza."
  ],
  "Crushing, striking, stunning weight like the stinger of an angry bee.": [
    "Un peso aplastante, contundente y aturdidor, como el aguijón de una abeja enfurecida.",
    "Un poids écrasant, percutant et étourdissant, comme le dard d'une abeille en colère.", "Un peso schiacciante, percuotente e stordente come il pungiglione di un'ape infuriata."
  ],
  "Restores your HP immediately and applies a 30-minute recharge to all crystals.": [
    "Restaura tus HP inmediatamente y aplica una recarga de 30 minutos a todos los cristales.",
    "Restaure immédiatement vos PV et applique un temps de recharge de 30 minutes à tous les cristaux.", "Ripristina immediatamente i tuoi PS e applica una ricarica di 30 minuti a tutti i cristalli."
  ],
  "Still burning and charged with aquatic magic, this heart sparkles with ancient energy.": [
    "Aún ardiente y cargado de magia acuática, este corazón resplandece con energía ancestral.",
    "Encore brûlant et chargé de magie aquatique, ce cœur scintille d'une énergie ancestrale.", "Ancora ardente e carico di magia acquatica, questo cuore scintilla di energia ancestrale."
  ],
  "Grayish stone with metallic reflections.": [
    "Piedra grisácea con reflejos metálicos.",
    "Pierre grisâtre aux reflets métalliques.", "Pietra grigiastra dai riflessi metallici."
  ],
  "Very powerful dagger made from enchanted metal and soul, light and easy to handle.": [
    "Daga muy poderosa hecha de metal encantado y alma, ligera y fácil de manejar.",
    "Dague très puissante faite de métal enchanté et d'âme, légère et facile à manier.", "Pugnale molto potente, fatto di metallo incantato e anima, leggero e facile da maneggiare."
  ],
  "Very powerful katana made from enchanted metal and soul, sharp and easy to wield.": [
    "Katana muy poderosa hecha de metal encantado y alma, afilada y fácil de manejar.",
    "Katana très puissant fait de métal enchanté et d'âme, tranchant et facile à manier.", "Katana molto potente, fatta di metallo incantato e anima, affilata e facile da brandire."
  ],
  "A hidden blade, used by bandits to stealthily attack their enemies.": [
    "Una hoja oculta utilizada por bandidos para atacar sigilosamente a sus enemigos.",
    "Une lame dissimulée utilisée par les bandits pour attaquer leurs ennemis furtivement.", "Una lama nascosta, usata dai banditi per attaccare furtivamente i nemici."
  ],
  "Forged from shells, this armor provides strength and protection.": [
    "Forjada con caparazones, esta armadura proporciona fuerza y protección.",
    "Forgée à partir de carapaces, cette armure offre force et protection.", "Forgiata con i gusci, questa armatura offre forza e protezione."
  ],
  "Sticky, sweet remains, often infused with pollen and floral scents.": [
    "Restos pegajosos y dulces, a menudo impregnados de polen y aromas florales.",
    "Des résidus collants et sucrés, souvent imprégnés de pollen et de senteurs florales.", "Residui appiccicosi e dolci, spesso impregnati di polline e profumi floreali."
  ],
  "This applied rune allows equipment with free rune slots to obtain stats.": [
    "Esta runa aplicada permite que el equipo con ranuras de runa libres obtenga estadísticas.",
    "Cette rune appliquée permet à l'équipement disposant d'emplacements de runes libres d'obtenir des statistiques.", "Questa runa applicata permette all'equipaggiamento con slot runa liberi di ottenere statistiche."
  ],
  "Dense, gritty grayish rock.": ["Roca grisácea, densa y granulosa.", "Roche grisâtre, dense et granuleuse.", "Roccia grigiastra, densa e granulosa."],
  "A catalyst delicately adorned with hearts and pink gems, diffusing a soft, romantic glow.": [
    "Un catalizador delicadamente adornado con corazones y gemas rosas que difunde un brillo suave y romántico.",
    "Un catalyseur délicatement orné de cœurs et de gemmes roses, diffusant une lueur douce et romantique.", "Un catalizzatore delicatamente adornato di cuori e gemme rosa, che diffonde un bagliore soffice e romantico."
  ],
  "A dark staff set with a dark orb, engraved with funerary symbols related to the forbidden arts.": [
    "Un bastón oscuro engastado con una esfera oscura y grabado con símbolos funerarios relacionados con las artes prohibidas.",
    "Un bâton sombre serti d'un orbe sombre et gravé de symboles funéraires liés aux arts interdits.", "Un bastone scuro incastonato con una sfera oscura e inciso con simboli funerari legati alle arti proibite."
  ],
  "A scepter was forged through unconventional ritual, embodying the power of the necromancer to whom it belonged.": [
    "Un cetro forjado mediante un ritual poco convencional, que encarna el poder del nigromante al que perteneció.",
    "Un sceptre forgé au cours d'un rituel inhabituel, incarnant le pouvoir du nécromancien auquel il appartenait.", "Uno scettro forgiato attraverso un rituale poco convenzionale, che incarna il potere del negromante a cui apparteneva."
  ],
  "She carries the weight of all the children's happiness, and the smell of the cupcakes.": [
    "Lleva el peso de la felicidad de todos los niños y el aroma de los cupcakes.",
    "Elle porte le poids du bonheur de tous les enfants et l'odeur des cupcakes.", "Porta il peso della felicità di tutti i bambini e il profumo dei cupcake."
  ],
  "A magical item allowing the opening of chests fallen in Aincrad.": [
    "Un objeto mágico que permite abrir los cofres caídos en Aincrad.",
    "Un objet magique permettant d'ouvrir les coffres tombés en Aincrad.", "Un oggetto magico che permette di aprire i forzieri caduti ad Aincrad."
  ],
  "Quite a rare ingredient for high alchemy or something else?": [
    "¿Un ingrediente bastante raro para la alquimia avanzada o para algo más?",
    "Un ingrédient assez rare pour la haute alchimie ou autre chose ?", "Un ingrediente piuttosto raro per l'alchimia avanzata o per qualcos'altro?"
  ],
  "A flame, burning every soul in a fiery and violent way, at the end of an old stick.": [
    "Una llama que quema cada alma de forma ardiente y violenta en el extremo de un palo viejo.",
    "Une flamme brûlant chaque âme de manière ardente et violente au bout d'un vieux bâton.", "Una fiamma che brucia ogni anima in modo ardente e violento, in cima a un vecchio bastone."
  ],
  "This book was forged using powerful Tier 1 materials. It embodies the power of a magician.": [
    "Este libro fue forjado con materiales poderosos de nivel 1. Encarna el poder de un mago.",
    "Ce livre a été forgé avec de puissants matériaux de niveau 1. Il incarne le pouvoir d'un mage.", "Questo libro è stato forgiato con potenti materiali di livello 1. Incarna il potere di un mago."
  ],
  "Clothing from another age, embroidered with magical threads. It was once worn by a legendary magician.": [
    "Ropa de otra época, bordada con hilos mágicos. Perteneció a un mago legendario.",
    "Des vêtements d'une autre époque, brodés de fils magiques. Ils furent autrefois portés par un mage légendaire.", "Vestiti di un'altra epoca, ricamati con fili magici. Furono indossati da un mago leggendario."
  ],
  "Forged in the heart of a silent storm. This staff vibrates with a celestial and powerful energy.": [
    "Forjado en el corazón de una tormenta silenciosa. Este bastón vibra con una energía celestial y poderosa.",
    "Forgé au cœur d'une tempête silencieuse. Ce bâton vibre d'une énergie céleste et puissante.", "Forgiato nel cuore di una tempesta silenziosa. Questo bastone vibra di un'energia celestiale e potente."
  ],
  "A majestic essence, a powerful and legendary energy resides there.": [
    "Una esencia majestuosa que alberga una energía poderosa y legendaria.",
    "Une essence majestueuse qui renferme une énergie puissante et légendaire.", "Un'essenza maestosa, in cui risiede un'energia potente e leggendaria."
  ],
  "Green stone with dark and light bands.": [
    "Piedra verde con bandas claras y oscuras.",
    "Pierre verte aux bandes claires et sombres.", "Pietra verde con bande chiare e scure."
  ],
  "A beautiful whitish powder with a mineral odor, possibly used in certain rituals.": [
    "Un hermoso polvo blanquecino con olor mineral, posiblemente utilizado en ciertos rituales.",
    "Une belle poudre blanchâtre à l'odeur minérale, peut-être utilisée dans certains rituels.", "Una bella polvere biancastra dall'odore minerale, forse usata in certi rituali."
  ],
  "This scarlet liquid is purified blood. This is not healing, it is acceptance of sacrifice.": [
    "Este líquido escarlata es sangre purificada. No cura: representa la aceptación del sacrificio.",
    "Ce liquide écarlate est du sang purifié. Il ne soigne pas, il représente l'acceptation du sacrifice.", "Questo liquido scarlatto è sangue purificato. Non guarisce: rappresenta l'accettazione del sacrificio."
  ],
  "Forged near a corrupted rift, this mask radiates an aggressive mystical force.": [
    "Forjada cerca de una grieta corrupta, esta máscara irradia una fuerza mística agresiva.",
    "Forgé près d'une faille corrompue, ce masque rayonne d'une force mystique agressive.", "Forgiata vicino a una faglia corrotta, questa maschera irradia una forza mistica aggressiva."
  ],
  "An ancient wooden mask. When worn, whispers ring in the ear.": [
    "Una máscara de madera antigua. Al llevarla, susurros resuenan en el oído.",
    "Un masque en bois ancien. Lorsqu'on le porte, des murmures résonnent à l'oreille.", "Un'antica maschera di legno. Quando la si indossa, sussurri risuonano nell'orecchio."
  ],
  "A mask from the web faction, as unpredictable as the spiders that inspired it.": [
    "Una máscara de la facción de las telarañas, tan impredecible como las arañas que la inspiraron.",
    "Un masque de la faction des toiles, aussi imprévisible que les araignées qui l'ont inspiré.", "Una maschera della fazione delle tele, imprevedibile come i ragni che l'hanno ispirata."
  ],
  "A medium purse containing gold stolen by bandits.": [
    "Una bolsa mediana que contiene oro robado por bandidos.",
    "Une bourse moyenne contenant de l'or volé par des bandits.", "Una borsa media contenente oro rubato dai banditi."
  ],
  "Delicate fusion between the Violet Broken Fragments. Useful for Reaper armor.": [
    "Fusión delicada entre los fragmentos violetas rotos. Útil para la armadura del segador.",
    "Fusion délicate entre les fragments violets brisés. Utile pour l'armure du faucheur.", "Delicata fusione tra i Frammenti viola rotti. Utile per l'armatura del mietitore."
  ],
  "A very strong axe, perfect for breaking more resistant logs.": [
    "Un hacha muy resistente, perfecta para romper troncos más duros.",
    "Une hache très solide, parfaite pour briser les bûches les plus résistantes.", "Un'ascia molto resistente, perfetta per spezzare tronchi più duri."
  ],
  "This new hoe is perfect for helping you harvest rarer flowers.": [
    "Esta nueva azada es perfecta para ayudarte a recolectar flores más raras.",
    "Cette nouvelle houe est parfaite pour vous aider à récolter des fleurs plus rares.", "Questa nuova zappa è perfetta per aiutarti a raccogliere fiori più rari."
  ],
  "A very solid pickaxe, perfect for mining more solid ores.": [
    "Un pico muy resistente, perfecto para extraer minerales más duros.",
    "Une pioche très solide, parfaite pour extraire des minerais plus résistants.", "Un piccone molto solido, perfetto per estrarre minerali più duri."
  ],
  "Small metal scrap, with other ingredients it is possible to make Metal Soul Ingots.": [
    "Pequeño fragmento de metal; con otros ingredientes es posible fabricar lingotes de alma metálica.",
    "Petit morceau de métal ; avec d'autres ingrédients, il est possible de fabriquer des lingots d'âme métallique.", "Piccolo frammento di metallo; con altri ingredienti è possibile fabbricare lingotti d'anima metallica."
  ],
  "Mysterious and dark cloak, obtained after conquering the tower of the fearsome kobold Illfang. It is said to help hide the presence of its wearer.":
    [
      "Capa misteriosa y oscura, obtenida tras conquistar la torre del temible kobold Illfang. Se dice que ayuda a ocultar la presencia de quien la lleva.",
      "Cape mystérieuse et sombre, obtenue après la conquête de la tour du redoutable kobold Illfang. On dit qu'elle aide à dissimuler la présence de son porteur.", "Mantello misterioso e oscuro, ottenuto dopo aver conquistato la torre del temibile kobold Illfang. Si dice che aiuti a nascondere la presenza di chi lo indossa."
    ],
  "A real pure onyx ore. Transformed into an ingot, it allows you to create large weapons such as no one has seen before!":
    [
      "Un verdadero mineral de ónice puro. Transformado en lingote, permite crear grandes armas como nunca se han visto.",
      "Un véritable minerai d'onyx pur. Transformé en lingot, il permet de créer de grandes armes encore jamais vues !", "Un vero minerale di onice puro. Trasformato in lingotto, permette di creare grandi armi come nessuno ne ha mai viste!"
    ],
  "A fairly fine and precise misty knife.": [
    "Un cuchillo brumoso bastante fino y preciso.",
    "Un couteau brumeux assez fin et précis.", "Un coltello nebbioso piuttosto fine e preciso."
  ],
  "A misty wolf claw.": ["Una garra de lobo brumoso.", "Une griffe de loup brumeux.", "Un artiglio di lupo nebbioso."],
  "Misty wolf fur.": ["Piel de lobo brumoso.", "Fourrure de loup brumeux.", "Pelliccia di lupo nebbioso."],
  "A pair of gloves carved to serve the young mist.": [
    "Unos guantes tallados para servir a la joven niebla.",
    "Une paire de gants sculptée pour servir la jeune brume.", "Un paio di guanti intagliati per servire la giovane nebbia."
  ],
  "A ring carved to serve the fangs of the mysterious mist.": [
    "Un anillo tallado para servir a los colmillos de la misteriosa niebla.",
    "Une bague sculptée pour servir les crocs de la mystérieuse brume.", "Un anello intagliato per servire le zanne della nebbia misteriosa."
  ],
  "A misty wolf tail.": ["Una cola de lobo brumoso.", "Une queue de loup brumeux.", "Una coda di lupo nebbioso."],
  "A piece of thick, rigid hide, useful for sturdy armor.": [
    "Un trozo de piel gruesa y rígida, útil para fabricar armaduras resistentes.",
    "Un morceau de peau épaisse et rigide, utile pour fabriquer des armures robustes.", "Un pezzo di cuoio spesso e rigido, utile per armature robuste."
  ],
  "Infused with the magical essence of bees, this armor protects the mage while channeling their mystical energy.": [
    "Imbuida de la esencia mágica de las abejas, esta armadura protege al mago mientras canaliza su energía mística.",
    "Imprégnée de l'essence magique des abeilles, cette armure protège le mage tout en canalisant son énergie mystique.", "Impregnata dell'essenza magica delle api, questa armatura protegge il mago mentre canalizza la sua energia mistica."
  ],
  "This cold ring seems to retain the silent echo of the bone reaper.": [
    "Este anillo frío parece conservar el eco silencioso del segador de huesos.",
    "Cette bague froide semble retenir l'écho silencieux du faucheur d'os.", "Questo anello freddo sembra conservare l'eco silenzioso del mietitore d'ossa."
  ],
  "A dark billhook with funerary engravings, whose curved blade seems linked to forbidden arts.": [
    "Una podadera oscura con grabados funerarios cuya hoja curvada parece ligada a las artes prohibidas.",
    "Une serpe sombre aux gravures funéraires, dont la lame courbe semble liée aux arts interdits.", "Una roncola oscura con incisioni funerarie, la cui lama ricurva sembra legata alle arti proibite."
  ],
  "A dark and mysterious powder, charged with forbidden energy.": [
    "Un polvo oscuro y misterioso cargado de energía prohibida.",
    "Une poudre sombre et mystérieuse chargée d'énergie interdite.", "Una polvere oscura e misteriosa, carica di energia proibita."
  ],
  "Crushing weight, striking, stunning like the spell of an angry necromancer.": [
    "Un peso aplastante, contundente y aturdidor, como el hechizo de un nigromante enfurecido.",
    "Un poids écrasant, percutant et étourdissant, comme le sort d'un nécromancien en colère.", "Un peso schiacciante, percuotente e stordente come l'incantesimo di un negromante infuriato."
  ],
  "A dark arch with funerary engravings, whose branches seem shaped by magic from beyond the grave.": [
    "Un arco oscuro con grabados funerarios cuyas ramas parecen moldeadas por magia de más allá de la tumba.",
    "Un arc sombre aux gravures funéraires, dont les branches semblent façonnées par une magie venue d'au-delà de la tombe.", "Un arco oscuro con incisioni funerarie, i cui rami sembrano modellati da magia proveniente da oltre la tomba."
  ],
  "An austere crossbow with sepulchral ornaments, imbued with a silent presence from beyond the grave.": [
    "Una ballesta austera con ornamentos sepulcrales, imbuida de una presencia silenciosa de más allá de la tumba.",
    "Une arbalète austère aux ornements sépulcraux, imprégnée d'une présence silencieuse venue d'au-delà de la tombe.", "Una balestra austera con ornamenti sepolcrali, impregnata di una presenza silenziosa proveniente da oltre la tomba."
  ],
  "An ax from the depths of a dangerous necropolis.": [
    "Un hacha de las profundidades de una necrópolis peligrosa.",
    "Une hache venue des profondeurs d'une nécropole dangereuse.", "Un'ascia proveniente dalle profondità di una necropoli pericolosa."
  ],
  "A hoe from the depths of a dangerous necropolis.": [
    "Una azada de las profundidades de una necrópolis peligrosa.",
    "Une houe venue des profondeurs d'une nécropole dangereuse.", "Una zappa proveniente dalle profondità di una necropoli pericolosa."
  ],
  "A pickaxe from the depths of a dangerous necropolis.": [
    "Un pico de las profundidades de una necrópolis peligrosa.",
    "Une pioche venue des profondeurs d'une nécropole dangereuse.", "Un piccone proveniente dalle profondità di una necropoli pericolosa."
  ],
  "This sandwich, straight from the modern world and made with crushed nephents, will revive your memories!": [
    "¡Este sándwich, llegado directamente del mundo moderno y hecho con nephentes triturados, reavivará tus recuerdos!",
    "Ce sandwich, venu directement du monde moderne et préparé avec des néphentes broyés, ravivera vos souvenirs !", "Questo panino, arrivato direttamente dal mondo moderno e preparato con nephentes triturati, risveglierà i tuoi ricordi!"
  ],
  "Perfect outfit for moving in the shadows and without noise. She would have fragments of the moon in her.": [
    "Un atuendo perfecto para moverse entre las sombras y sin hacer ruido. Llevaría fragmentos de la luna en su interior.",
    "Tenue parfaite pour se déplacer dans l'ombre et sans bruit. Elle contiendrait des fragments de lune.", "Un completo perfetto per muoversi nell'ombra e senza rumore. Porterebbe in sé frammenti di luna."
  ],
  "A sturdy orc frame used by orc warriors.": [
    "Una estructura de orco resistente utilizada por los guerreros orcos.",
    "Une structure d'orque robuste utilisée par les guerriers orques.", "Una struttura d'orco robusta, usata dai guerrieri orchi."
  ],
  "Sadistic, sturdy and very brutal boots, inspiring fear.": [
    "Botas sádicas, resistentes y muy brutales que inspiran miedo.",
    "Des bottes sadiques, robustes et très brutales, inspirant la peur.", "Stivali sadici, resistenti e molto brutali, che incutono paura."
  ],
  "A tenacious and sturdy bracelet to crush enemies to the ground.": [
    "Un brazalete tenaz y resistente para aplastar a los enemigos contra el suelo.",
    "Un bracelet tenace et solide pour écraser les ennemis au sol.", "Un bracciale tenace e resistente per schiacciare i nemici al suolo."
  ],
  "A powerful orc essence used for a variety of reasons.": [
    "Una poderosa esencia de orco utilizada por diversos motivos.",
    "Une puissante essence d'orque utilisée pour diverses raisons.", "Una potente essenza d'orco, usata per vari motivi."
  ],
  "A pair of gloves carved to serve the fierce orc tribe.": [
    "Unos guantes tallados para servir a la feroz tribu de los orcos.",
    "Une paire de gants sculptée pour servir la féroce tribu des orques.", "Un paio di guanti intagliati per servire la feroce tribù degli orchi."
  ],
  "An orc's heart torn from a chest.": [
    "El corazón de un orco arrancado de un pecho.",
    "Le cœur d'un orque arraché à une poitrine.", "Il cuore di un orco strappato da un petto."
  ],
  "An orc mask used in rituals.": [
    "Una máscara de orco utilizada en rituales.",
    "Un masque d'orque utilisé lors de rituels.", "Una maschera d'orco usata nei rituali."
  ],
  "An orc's eye gouged out during a fight.": [
    "Un ojo de orco arrancado durante un combate.",
    "Un œil d'orque arraché lors d'un combat.", "Un occhio d'orco cavato durante un combattimento."
  ],
  "A fragment of orichalcum, a legendary and rare ore with unique metallic reflections.": [
    "Un fragmento de oricalco, un mineral legendario y raro con reflejos metálicos únicos.",
    "Un fragment d'orichalque, un minerai légendaire et rare aux reflets métalliques uniques.", "Un frammento di oricalco, un minerale leggendario e raro dai riflessi metallici unici."
  ],
  "The signature is written in blood. It grants demonic power.": [
    "La firma está escrita con sangre. Otorga poder demoníaco.",
    "La signature est écrite dans le sang. Elle confère un pouvoir démoniaque.", "La firma è scritta nel sangue. Concede un potere demoniaco."
  ],
  "This scroll allows the player using it to receive a point to reset their skill points.": [
    "Este pergamino permite al jugador que lo usa recibir un punto para reiniciar sus puntos de habilidad.",
    "Ce parchemin permet au joueur qui l'utilise d'obtenir un point pour réinitialiser ses points de compétence.", "Questa pergamena permette al giocatore che la usa di ricevere un punto per azzerare i suoi punti abilità."
  ],
  "A piece as red as bauxite, forged at Tier 2.": [
    "Una pieza tan roja como la bauxita, forjada en el nivel 2.",
    "Une pièce aussi rouge que la bauxite, forgée au niveau 2.", "Un pezzo rosso come la bauxite, forgiato al Livello 2."
  ],
  "Soft pink crystal with soft tones.": [
    "Cristal rosa suave de tonos delicados.",
    "Cristal rose tendre aux nuances douces.", "Cristallo rosa tenue dalle sfumature delicate."
  ],
  "This thick, golden pollen vibrates between your fingers. He is the key to opening doors.": [
    "Este polen dorado y espeso vibra entre tus dedos. Es la llave para abrir puertas.",
    "Ce pollen épais et doré vibre entre vos doigts. C'est la clé pour ouvrir les portes.", "Questo polline denso e dorato vibra tra le dita. È la chiave per aprire le porte."
  ],
  "A fine ring with bronze highlights, adorned with a small luminous yellow crystal recalling the warmth and kindness of its former owner.":
    [
      "Un elegante anillo con reflejos de bronce, adornado con un pequeño cristal amarillo luminoso que recuerda la calidez y bondad de su antiguo dueño.",
      "Une fine bague aux reflets bronze, ornée d'un petit cristal jaune lumineux rappelant la chaleur et la bonté de son ancien propriétaire.", "Un anello raffinato dai riflessi bronzei, adornato con un piccolo cristallo giallo luminoso che ricorda il calore e la bontà del suo antico proprietario."
    ],
  "A vial filled with a shimmering yellow liquid, giving off a soft, warm, happy glow.": [
    "Un frasco lleno de un líquido amarillo brillante que emite un resplandor suave, cálido y alegre.",
    "Une fiole remplie d'un liquide jaune scintillant, dégageant une lueur douce, chaleureuse et joyeuse.", "Una fiala piena di un liquido giallo scintillante, che emana un bagliore soffice, caldo e gioioso."
  ],
  "The balanced version among all Tolbana shields.": [
    "La versión equilibrada entre todos los escudos de Tolbana.",
    "La version équilibrée parmi tous les boucliers de Tolbana.", "La versione equilibrata tra tutti gli scudi di Tolbana."
  ],
  "This staff is a powerful and concentrated version of energy, unlike the other, safer and less powerful one.": [
    "Este bastón es una versión poderosa y concentrada de energía, a diferencia del otro, más seguro y menos potente.",
    "Ce bâton est une version puissante et concentrée de l'énergie, contrairement à l'autre, plus sûr et moins puissant.", "Questo bastone è una versione potente e concentrata di energia, a differenza dell'altro, più sicuro e meno potente."
  ],
  "A living orb, healing every soul in an intense and profound way, at the end of an old staff.": [
    "Un orbe viviente que cura cada alma de forma intensa y profunda, situado en el extremo de un bastón viejo.",
    "Un orbe vivant soignant chaque âme de manière intense et profonde, au bout d'un vieux bâton.", "Un orbe vivente che cura ogni anima in modo intenso e profondo, in cima a un vecchio bastone."
  ],
  "Cut from thick metal and marked with a red stripe, this ring is inspired by the famous massive wild boar.": [
    "Cortado de metal grueso y marcado con una franja roja, este anillo está inspirado en el famoso jabalí salvaje de gran tamaño.",
    "Découpée dans un métal épais et marquée d'une bande rouge, cette bague s'inspire du célèbre sanglier sauvage massif.", "Tagliato da un metallo spesso e segnato da una striscia rossa, questo anello si ispira al famoso cinghiale selvaggio di grandi dimensioni."
  ],
  "A radiant amulet, forged from pure onyx.": [
    "Un amuleto radiante forjado con ónice puro.",
    "Une amulette rayonnante forgée en onyx pur.", "Un amuleto radioso, forgiato con onice puro."
  ],
  "Forged with pure onyx, a brilliant fragment of Tier 2.": [
    "Forjado con ónice puro, un fragmento brillante del nivel 2.",
    "Forgé avec de l'onyx pur, un fragment brillant du niveau 2.", "Forgiato con onice puro, un frammento brillante del Livello 2."
  ],
  "A pair of gloves made from pure, radiant, angelic-looking onyx": [
    "Unos guantes hechos de ónice puro y radiante, con aspecto angelical.",
    "Une paire de gants en onyx pur et rayonnant, à l'apparence angélique.", "Un paio di guanti fatti di onice puro e radioso, dall'aspetto angelico."
  ],
  "Exceptional ingot, pure and solid. Essential for forges and rare elixirs.": [
    "Lingote excepcional, puro y sólido. Esencial para forjas y elixires raros.",
    "Lingot exceptionnel, pur et solide. Essentiel pour les forges et les élixirs rares.", "Lingotto eccezionale, puro e solido. Essenziale per le forge e gli elisir rari."
  ],
  "A luminous piece like that of pure, radiant onyx, forged at Tier 2.": [
    "Una pieza luminosa de ónice puro y radiante, forjada en el nivel 2.",
    "Une pièce lumineuse en onyx pur et rayonnant, forgée au niveau 2.", "Un pezzo luminoso come l'onice puro e radioso, forgiato al Livello 2."
  ],
  "Forged from pure onyx this ring is complete and very powerful.": [
    "Forjado con ónice puro, este anillo está completo y es muy poderoso.",
    "Forgée en onyx pur, cette bague est complète et très puissante.", "Forgiato con onice puro, questo anello è completo e molto potente."
  ],
  "A purple spider carcass.": ["El cadáver de una araña morada.", "Une carcasse d'araignée violette.", "Il cadavere di un ragno viola."],
  "Purple spider eyes.": ["Ojos de araña morada.", "Yeux d'araignée violette.", "Occhi di ragno viola."],
  "A purple spider thread.": ["Un hilo de araña morada.", "Un fil d'araignée violette.", "Un filo di ragno viola."],
  "A small fabric bag, housing 100 Col.": [
    "Una pequeña bolsa de tela que contiene 100 Col.",
    "Une petite bourse en tissu contenant 100 Col.", "Una piccola borsa di tessuto che contiene 100 Col."
  ],
  "A small fabric bag, housing 1000 Col.": [
    "Una pequeña bolsa de tela que contiene 1000 Col.",
    "Une petite bourse en tissu contenant 1000 Col.", "Una piccola borsa di tessuto che contiene 1000 Col."
  ],
  "A small fabric bag, housing 200 Col.": [
    "Una pequeña bolsa de tela que contiene 200 Col.",
    "Une petite bourse en tissu contenant 200 Col.", "Una piccola borsa di tessuto che contiene 200 Col."
  ],
  "A small fabric bag, housing 2000 Col.": [
    "Una pequeña bolsa de tela que contiene 2000 Col.",
    "Une petite bourse en tissu contenant 2000 Col.", "Una piccola borsa di tessuto che contiene 2000 Col."
  ],
  "A small fabric bag, housing 25 Col.": [
    "Una pequeña bolsa de tela que contiene 25 Col.",
    "Une petite bourse en tissu contenant 25 Col.", "Una piccola borsa di tessuto che contiene 25 Col."
  ],
  "A small fabric bag, housing 250 Col.": [
    "Una pequeña bolsa de tela que contiene 250 Col.",
    "Une petite bourse en tissu contenant 250 Col.", "Una piccola borsa di tessuto che contiene 250 Col."
  ],
  "A small fabric bag, housing 500 Col.": [
    "Una pequeña bolsa de tela que contiene 500 Col.",
    "Une petite bourse en tissu contenant 500 Col.", "Una piccola borsa di tessuto che contiene 500 Col."
  ],
  "A small fabric bag, housing 5000 Col.": [
    "Una pequeña bolsa de tela que contiene 5000 Col.",
    "Une petite bourse en tissu contenant 5000 Col.", "Una piccola borsa di tessuto che contiene 5000 Col."
  ],
  "A small fabric bag, housing 75 Col.": [
    "Una pequeña bolsa de tela que contiene 75 Col.",
    "Une petite bourse en tissu contenant 75 Col.", "Una piccola borsa di tessuto che contiene 75 Col."
  ],
  "A collection of flesh and rusty metal found in a desecrated tomb. Each impact releases a sickening stench that disturbs the attackers.":
    [
      "Una mezcla de carne y metal oxidado encontrada en una tumba profanada. Cada impacto libera un hedor repugnante que perturba a los atacantes.",
      "Un amas de chair et de métal rouillé trouvé dans une tombe profanée. Chaque impact libère une odeur écœurante qui perturbe les attaquants.", "Un insieme di carne e metallo arrugginito trovato in una tomba profanata. Ogni impatto libera un lezzo ripugnante che disturba gli attaccanti."
    ],
  "Metallic yellow stone with brilliant golden reflections.": [
    "Piedra amarilla metálica con brillantes reflejos dorados.",
    "Pierre jaune métallique aux brillants reflets dorés.", "Pietra gialla metallica dai brillanti riflessi dorati."
  ],
  "Brilliant yellow cubic crystal.": ["Cristal cúbico amarillo brillante.", "Cristal cubique jaune éclatant.", "Cristallo cubico giallo brillante."],
  "Boosts mobility and resource capacity for 15 minutes.": [
    "Aumenta la movilidad y la capacidad de recursos durante 15 minutos.",
    "Augmente la mobilité et la capacité de ressources pendant 15 minutes.", "Aumenta la mobilità e la capacità di risorse per 15 minuti."
  ],
  "Boosts physical offense for 15 minutes.": [
    "Aumenta el ataque físico durante 15 minutos.",
    "Augmente l'attaque physique pendant 15 minutes.", "Aumenta l'attacco fisico per 15 minuti."
  ],
  "Returns you HP immediately and applies 15 recharge to all healing potions.": [
    "Restaura tus HP inmediatamente y aplica una recarga de 15 a todas las pociones de curación.",
    "Restaure immédiatement vos PV et applique un temps de recharge de 15 à toutes les potions de soin.", "Ripristina immediatamente i tuoi PS e applica una ricarica di 15 a tutte le pozioni di cura."
  ],
  "Boosts defensive control for 15 minutes.": [
    "Aumenta el control defensivo durante 15 minutos.",
    "Augmente le contrôle défensif pendant 15 minutes.", "Aumenta il controllo difensivo per 15 minuti."
  ],
  "Boosts magical offense for 15 minutes.": [
    "Aumenta el ataque mágico durante 15 minutos.",
    "Augmente l'attaque magique pendant 15 minutes.", "Aumenta l'attacco magico per 15 minuti."
  ],
  "Boosts avoidance and resource regeneration for 15 minutes.": [
    "Aumenta la evasión y la regeneración de recursos durante 15 minutos.",
    "Augmente l'évitement et la régénération des ressources pendant 15 minutes.", "Aumenta l'evasione e la rigenerazione delle risorse per 15 minuti."
  ],
  "Boosts survivability for 15 minutes.": [
    "Aumenta la supervivencia durante 15 minutos.",
    "Augmente la capacité de survie pendant 15 minutes.", "Aumenta la capacità di sopravvivenza per 15 minuti."
  ],
  "A ravaging treant bark.": ["Una corteza de treant devastador.", "Une écorce de tréant ravageur.", "Una corteccia di treant devastatore."],
  "A devastating branch of the woods.": ["Una rama devastadora de los bosques.", "Une branche dévastatrice des bois.", "Un ramo devastante dei boschi."],
  "The heart of a devastating treant.": ["El corazón de un treant devastador.", "Le cœur d'un tréant dévastateur.", "Il cuore di un treant devastatore."],
  "A small luminous lantern, with a warm and soothing aura.": [
    "Una pequeña linterna luminosa con un aura cálida y tranquilizadora.",
    "Une petite lanterne lumineuse à l'aura chaleureuse et apaisante.", "Una piccola lanterna luminosa dall'aura calda e rassicurante."
  ],
  "A reinforced ax, perfect for cutting down trees faster.": [
    "Un hacha reforzada, perfecta para talar árboles más rápido.",
    "Une hache renforcée, parfaite pour abattre les arbres plus rapidement.", "Un'ascia rinforzata, perfetta per abbattere gli alberi più rapidamente."
  ],
  "A reinforced hoe, perfect for harvesting plants faster.": [
    "Una azada reforzada, perfecta para cosechar plantas más rápido.",
    "Une houe renforcée, parfaite pour récolter les plantes plus rapidement.", "Una zappa rinforzata, perfetta per raccogliere le piante più rapidamente."
  ],
  "A reinforced pickaxe, perfect for mining ores faster.": [
    "Un pico reforzado, perfecto para extraer minerales más rápido.",
    "Une pioche renforcée, parfaite pour extraire les minerais plus rapidement.", "Un piccone rinforzato, perfetto per estrarre i minerali più rapidamente."
  ],
  "Unlike the small bone, these bones are more resistant and surely also useful in certain confections.": [
    "A diferencia del hueso pequeño, estos huesos son más resistentes y seguramente también útiles para ciertas preparaciones.",
    "Contrairement au petit os, ces os sont plus résistants et sûrement utiles pour certaines préparations.", "A differenza dell'osso piccolo, queste ossa sono più resistenti e sicuramente utili anche in certe preparazioni."
  ],
  "Better quality wire that can be used for better tools.": [
    "Alambre de mejor calidad que puede utilizarse para fabricar mejores herramientas.",
    "Fil de meilleure qualité pouvant servir à fabriquer de meilleurs outils.", "Filo di qualità migliore, utilizzabile per fabbricare strumenti migliori."
  ],
  "Allows you to revive a comrade in combat within 10 seconds after death in permitted areas.": [
    "Permite revivir a un compañero en combate durante los 10 segundos posteriores a su muerte en las zonas permitidas.",
    "Permet de ranimer un allié au combat dans les 10 secondes suivant sa mort dans les zones autorisées.", "Permette di far rivivere un compagno in combattimento entro 10 secondi dalla morte nelle zone consentite."
  ],
  "Imbued with the speed of a cursed horse, they grant their wearer great speed.": [
    "Imbuidas de la velocidad de un caballo maldito, otorgan gran rapidez a quien las lleva.",
    "Imprégnées de la vitesse d'un cheval maudit, elles confèrent une grande rapidité à leur porteur.", "Imbevute della velocità di un cavallo maledetto, concedono a chi le indossa grande rapidità."
  ],
  "A ring sculpted to hunt its prey relentlessly and light.": [
    "Un anillo tallado para cazar a su presa sin descanso y con ligereza.",
    "Une bague sculptée pour chasser sa proie sans relâche et avec légèreté.", "Un anello scolpito per cacciare la preda senza sosta e con leggerezza."
  ],
  "A precious ring that protects and revitalizes, like a beehive watching over its larvae.": [
    "Un anillo precioso que protege y revitaliza, como una colmena que vela por sus larvas.",
    "Une précieuse bague qui protège et revitalise, telle une ruche veillant sur ses larves.", "Un anello prezioso che protegge e rivitalizza, come un alveare che veglia sulle sue larve."
  ],
  "A delicately engraved ring with warm reflections, symbol of a precious bond.": [
    "Un anillo delicadamente grabado con reflejos cálidos, símbolo de un vínculo precioso.",
    "Une bague délicatement gravée aux reflets chaleureux, symbole d'un lien précieux.", "Un anello finemente inciso dai riflessi caldi, simbolo di un legame prezioso."
  ],
  "A light ring carved from a Forest Eagle's claw. Its green color seems to blend perfectly into the foliage.": [
    "Un anillo ligero tallado en una garra de águila del bosque. Su color verde parece fundirse perfectamente con el follaje.",
    "Une bague légère taillée dans une griffe d'aigle forestier. Sa couleur verte semble se fondre parfaitement dans le feuillage.", "Un anello leggero intagliato in un artiglio di aquila della foresta. Il suo colore verde sembra fondersi perfettamente con il fogliame."
  ],
  "A harpy claw running through high voltage electrical currents. It does not harm the wearer, but channels its magical flow towards their extremities.":
    [
      "Una garra de arpía recorrida por corrientes eléctricas de alto voltaje. No daña a quien la lleva, pero canaliza su flujo mágico hacia las extremidades.",
      "Une griffe de harpie parcourue de courants électriques à haute tension. Elle ne blesse pas son porteur, mais canalise son flux magique vers ses extrémités.", "Un artiglio di arpia attraversato da correnti elettriche ad alta tensione. Non danneggia chi lo indossa, ma canalizza il suo flusso magico verso le estremità."
    ],
  "A dungeon formed inside Melliona's Hive.": [
    "Una mazmorra formada dentro de la colmena de Melliona.",
    "Un donjon formé à l'intérieur de la ruche de Melliona.", "Un dungeon formatosi all'interno dell'Alveare di Melliona."
  ],
  "Sell Weapons and Consumables for newcomers.": [
    "Vende armas y consumibles a los recién llegados.",
    "Vend des armes et des consommables aux nouveaux arrivants.", "Vende armi e consumabili ai nuovi arrivati."
  ],
  "A maze that rewrites its routes after each elite pull, like the system is learning your pathing. Scouts call it the place where map memory goes to die.":
    [
      "Un laberinto que reescribe sus rutas después de cada combate contra un élite, como si el sistema aprendiera tu recorrido. Los exploradores lo llaman el lugar donde muere la memoria del mapa.",
      "Un labyrinthe qui réécrit ses itinéraires après chaque combat contre un élite, comme si le système apprenait votre parcours. Les éclaireurs l'appellent l'endroit où la mémoire de la carte meurt.", "Un labirinto che riscrive i suoi percorsi dopo ogni scontro con un'élite, come se il sistema stesse imparando il tuo cammino. Gli esploratori lo chiamano il luogo dove la memoria della mappa va a morire."
    ],
  "A side quest about uncovering a hidden facet of reality.": [
    "Una misión secundaria sobre el descubrimiento de un aspecto oculto de la realidad.",
    "Une quête secondaire consacrée à la découverte d'un aspect caché de la réalité.", "Una missione secondaria dedicata alla scoperta di un aspetto nascosto della realtà."
  ],
  "A side quest to locate the Ngangas people.": [
    "Una misión secundaria para localizar al pueblo de los Ngangas.",
    "Une quête secondaire visant à localiser le peuple Ngangas.", "Una missione secondaria per localizzare il popolo Ngangas."
  ],
  "A quest to assist with cooking and preparation tasks.": [
    "Una misión para ayudar con tareas de cocina y preparación.",
    "Une quête pour aider aux tâches de cuisine et de préparation.", "Una missione per aiutare con compiti di cucina e preparazione."
  ],
  "A quest to help Yuko with an important task.": [
    "Una misión para ayudar a Yuko con una tarea importante.",
    "Une quête pour aider Yuko dans une tâche importante.", "Una missione per aiutare Yuko in un compito importante."
  ],
  "A quest that tests resilience through painful trials.": [
    "Una misión que pone a prueba la resistencia mediante pruebas dolorosas.",
    "Une quête qui met la résistance à l'épreuve au travers de difficiles épreuves.", "Una missione che mette alla prova la resistenza attraverso prove dolorose."
  ],
  "A quest guiding the player toward Urbus.": [
    "Una misión que guía al jugador hacia Urbus.",
    "Une quête guidant le joueur vers Urbus.", "Una missione che guida il giocatore verso Urbus."
  ],
  "A quest focused on communicating with Yaa.": [
    "Una misión centrada en comunicarse con Yaa.",
    "Une quête centrée sur la communication avec Yaa.", "Una missione incentrata sul comunicare con Yaa."
  ],
  "A quest involving the forgotten tomb dungeon.": [
    "Una misión relacionada con la mazmorra de la tumba olvidada.",
    "Une quête liée au donjon de la tombe oubliée.", "Una missione legata al dungeon della tomba dimenticata."
  ],
  "A quest about creating a key with a master smith.": [
    "Una misión sobre la creación de una llave con un maestro herrero.",
    "Une quête consacrée à la création d'une clé avec un maître forgeron.", "Una missione sulla creazione di una chiave con un maestro fabbro."
  ],
  "A quest centered around a rivalry with the color green.": [
    "Una misión centrada en una rivalidad con el color verde.",
    "Une quête centrée sur une rivalité avec la couleur verte.", "Una missione incentrata su una rivalità con il colore verde."
  ],
  "A quest exploring how to work with animal hides.": [
    "Una misión que explora cómo trabajar con pieles de animales.",
    "Une quête explorant le travail des peaux animales.", "Una missione che esplora come lavorare le pelli degli animali."
  ],
  "A quest focused on collecting or crafting with feathers.": [
    "Una misión centrada en recolectar o fabricar objetos con plumas.",
    "Une quête consacrée à la collecte ou à la fabrication avec des plumes.", "Una missione incentrata sul raccogliere o fabbricare con le piume."
  ],
  "A quest tied to the legacy left by the seas.": [
    "Una misión ligada al legado dejado por los mares.",
    "Une quête liée à l'héritage laissé par les mers.", "Una missione legata all'eredità lasciata dai mari."
  ],
  "A hunting trial to prove your skills.": [
    "Una prueba de caza para demostrar tus habilidades.",
    "Une épreuve de chasse pour prouver vos compétences.", "Una prova di caccia per dimostrare le tue abilità."
  ],
  "A quest about recovering an onyx of knowledge.": [
    "Una misión sobre la recuperación de un ónice del conocimiento.",
    "Une quête consacrée à la récupération d'un onyx de la connaissance.", "Una missione sul recupero di un onice della conoscenza."
  ],
  "A philosophical quest inspired by Bushi teachings.": [
    "Una misión filosófica inspirada en las enseñanzas de Bushi.",
    "Une quête philosophique inspirée par les enseignements de Bushi.", "Una missione filosofica ispirata agli insegnamenti di Bushi."
  ],
  "A relaxed quest involving a calm cat companion.": [
    "Una misión tranquila protagonizada por un apacible compañero felino.",
    "Une quête paisible mettant en scène un compagnon félin calme.", "Una missione tranquilla con un pacifico compagno felino."
  ],
  "A quest centered around a haunted bell tower.": [
    "Una misión centrada en un campanario encantado.",
    "Une quête centrée sur un clocher hanté.", "Una missione incentrata su un campanile infestato."
  ],
  "A second step in an ongoing side quest series.": [
    "Un segundo paso en una serie de misiones secundarias en curso.",
    "Une deuxième étape d'une série de quêtes secondaires en cours.", "Un secondo passo in una serie di missioni secondarie in corso."
  ],
  "A quest to complete a cleansing ritual.": [
    "Una misión para completar un ritual de purificación.",
    "Une quête visant à accomplir un rituel de purification.", "Una missione per completare un rituale di purificazione."
  ],
  "A quest involving the roof of a cabin shelter.": [
    "Una misión relacionada con el tejado de un refugio de cabaña.",
    "Une quête liée au toit d'un abri de cabane.", "Una missione legata al tetto di un rifugio di capanna."
  ],
  "A quest about offering tribute before judgment.": [
    "Una misión sobre ofrecer un tributo antes del juicio.",
    "Une quête consacrée à l'offrande d'un tribut avant le jugement.", "Una missione sull'offrire un tributo prima del giudizio."
  ],
  "A quest focused on building a cabin foundation.": [
    "Una misión centrada en construir los cimientos de una cabaña.",
    "Une quête centrée sur la construction des fondations d'une cabane.", "Una missione incentrata sulla costruzione delle fondamenta di una capanna."
  ],
  "A quest about putting up the walls of a cabin.": [
    "Una misión sobre levantar las paredes de una cabaña.",
    "Une quête consacrée à l'édification des murs d'une cabane.", "Una missione sull'innalzare le pareti di una capanna."
  ],
  "A quest where you obtain your first weapon.": [
    "Una misión en la que obtienes tu primera arma.",
    "Une quête au cours de laquelle vous obtenez votre première arme.", "Una missione in cui ottieni la tua prima arma."
  ],
  "A quest to clear the skies above Taran.": [
    "Una misión para despejar los cielos sobre Taran.",
    "Une quête visant à purifier les cieux au-dessus de Taran.", "Una missione per liberare i cieli sopra Taran."
  ],
  "A quest about defending your choice of style.": [
    "Una misión sobre defender tu elección de estilo.",
    "Une quête consacrée à la défense de votre choix de style.", "Una missione sul difendere la tua scelta di stile."
  ],
  "A quest to speak with an enigmatic woman.": [
    "Una misión para hablar con una mujer enigmática.",
    "Une quête visant à parler à une femme énigmatique.", "Una missione per parlare con una donna enigmatica."
  ],
  "A quest to return back to the town of Urbus.": [
    "Una misión para regresar a la ciudad de Urbus.",
    "Une quête visant à retourner dans la ville d'Urbus.", "Una missione per tornare alla città di Urbus."
  ],
  "A side quest centered around preparing a meal.": [
    "Una misión secundaria centrada en preparar una comida.",
    "Une quête secondaire centrée sur la préparation d'un repas.", "Una missione secondaria incentrata sulla preparazione di un pasto."
  ],
  "A quest in which the player must prove their worth.": [
    "Una misión en la que el jugador debe demostrar su valía.",
    "Une quête dans laquelle le joueur doit prouver sa valeur.", "Una missione in cui il giocatore deve dimostrare il proprio valore."
  ],
  "A side quest that covers a bit of everything.": [
    "Una misión secundaria que abarca un poco de todo.",
    "Une quête secondaire qui couvre un peu de tout.", "Una missione secondaria che copre un po' di tutto."
  ],
  "A forgotten place where nature has reclaimed its rights. Some say they hear voices whispered in the wind, as if the giants were still watching. A peaceful oasis... in appearance only.":
    [
      "Un lugar olvidado donde la naturaleza ha recuperado sus dominios. Algunos dicen oír voces susurradas por el viento, como si los gigantes aún vigilaran. Un oasis apacible... solo en apariencia.",
      "Un lieu oublié où la nature a repris ses droits. Certains disent entendre des voix murmurées par le vent, comme si les géants veillaient encore. Une oasis paisible... en apparence seulement.", "Un luogo dimenticato dove la natura ha ripreso i suoi diritti. Alcuni dicono di udire voci sussurrate dal vento, come se i giganti stessero ancora vegliando. Un'oasi tranquilla... solo in apparenza."
    ],
  "A powerful boss guarding the sacred sanctuary.": [
    "Un jefe poderoso que protege el santuario sagrado.",
    "Un boss puissant gardant le sanctuaire sacré.", "Un boss potente che protegge il santuario sacro."
  ],
  "Collapsed ore tunnels now host armored mobs that patrol like a disciplined guild squad. Miners left warning runes at each fork, but most parties still pick the wrong descent.":
    [
      "Los túneles mineros derrumbados ahora albergan mobs acorazados que patrullan como un escuadrón disciplinado. Los mineros dejaron runas de advertencia en cada bifurcación, pero la mayoría de los grupos sigue eligiendo el descenso equivocado.",
      "Les tunnels de minerai effondrés abritent désormais des mobs en armure qui patrouillent comme une escouade disciplinée. Les mineurs ont laissé des runes d'avertissement à chaque embranchement, mais la plupart des groupes choisissent encore la mauvaise descente.", "I tunnel minerari crollati ora ospitano mob corazzati che pattugliano come una squadra disciplinata. I minatori hanno lasciato rune di avvertimento a ogni bivio, ma la maggior parte dei gruppi sceglie ancora la discesa sbagliata."
    ],
  "Dug into the heart of the mountain, the Geldorak mine was once home to a colony of renowned miners. But one day a scream rang out in the galleries... Since then, the corridors have been sealed and no one dares to go down there anymore.":
    [
      "Excavada en el corazón de la montaña, la mina de Geldorak albergó una colonia de mineros famosos. Pero un día un grito resonó en las galerías... Desde entonces, los corredores están sellados y nadie se atreve a bajar allí.",
      "Creusée au cœur de la montagne, la mine de Geldorak abritait autrefois une colonie de mineurs renommés. Mais un jour, un cri retentit dans les galeries... Depuis, les couloirs sont scellés et plus personne n'ose y descendre.", "Scavata nel cuore della montagna, la miniera di Geldorak ospitava un tempo una colonia di minatori rinomati. Ma un giorno un urlo risuonò nelle gallerie... Da allora i corridoi sono sigillati e nessuno osa più scendervi."
    ],
  "A gelatinous colossus, master of swarms of slimes. He crushes everything in his path, slowly but surely.": [
    "Un coloso gelatinoso, amo de enjambres de slimes. Aplasta todo a su paso, lenta pero inexorablemente.",
    "Un colosse gélatineux, maître d'essaims de slimes. Il écrase tout sur son passage, lentement mais sûrement.", "Un colosso gelatinoso, signore di sciami di melme. Schiaccia tutto sul suo cammino, lentamente ma inesorabilmente."
  ],
  "A dark underground cave beneath Taran, home to hidden dangers.": [
    "Una cueva subterránea oscura bajo Taran, hogar de peligros ocultos.",
    "Une grotte souterraine sombre sous Taran, abritant des dangers cachés.", "Una caverna sotterranea oscura sotto Taran, dimora di pericoli nascosti."
  ],
  "A wooded hamlet nestled between the hills where wild boars prowl on the edge. Cradle of the first clashes.": [
    "Una aldea boscosa entre las colinas, donde los jabalíes salvajes merodean en los límites. Cuna de los primeros enfrentamientos.",
    "Un hameau boisé niché entre les collines, où les sangliers sauvages rôdent aux abords. Berceau des premiers affrontements.", "Un borgo boscoso incastonato tra le colline, dove i cinghiali selvatici si aggirano ai margini. Culla dei primi scontri."
  ],
  "A tropical archipelago where giant tortoises gather. Each island hides ancient mysteries and unique wildlife. Calm is just a facade...":
    [
      "Un archipiélago tropical donde se reúnen tortugas gigantes. Cada isla oculta misterios antiguos y una fauna única. La calma es solo una fachada...",
      "Un archipel tropical où se rassemblent des tortues géantes. Chaque île cache d'anciens mystères et une faune unique. Le calme n'est qu'une façade...", "Un arcipelago tropicale dove si radunano tartarughe giganti. Ogni isola nasconde antichi misteri e una fauna unica. La calma è solo una facciata..."
    ],
  "The iconic first-floor raid tyrant, infamous for sudden weapon swaps and punishing final-phase aggression.": [
    "El icónico tirano de la incursión del primer piso, famoso por cambiar de arma de repente y por su agresividad devastadora en la fase final.",
    "L'emblématique tyran du raid du premier étage, réputé pour ses changements d'arme soudains et son agressivité impitoyable en phase finale.", "L'iconico tiranno del raid del primo piano, famigerato per i cambi d'arma improvvisi e l'aggressività punitiva nella fase finale."
  ],
  "A silent creature lurking between the canvases, Jira watches every corner of the dungeon. Faster than lightning, she strikes without warning, leaving behind only silence... and bloody webs.":
    [
      "Una criatura silenciosa que acecha entre los lienzos; Jira vigila cada rincón de la mazmorra. Más rápida que un relámpago, ataca sin avisar y solo deja silencio... y telarañas ensangrentadas.",
      "Une créature silencieuse tapie entre les toiles, Jira observe chaque recoin du donjon. Plus rapide que l'éclair, elle frappe sans prévenir, ne laissant derrière elle que le silence... et des toiles ensanglantées.", "Una creatura silenziosa in agguato tra le tele: Jira osserva ogni angolo del dungeon. Più rapida del fulmine, colpisce senza avvisare, lasciando dietro di sé solo silenzio... e tele insanguinate."
    ],
  "A remote biome named Kaelor, known for its unusual terrain.": [
    "Un bioma remoto llamado Kaelor, conocido por su terreno inusual.",
    "Un biome isolé nommé Kaelor, connu pour son terrain inhabituel.", "Un bioma remoto chiamato Kaelor, noto per il suo terreno inusuale."
  ],
  "Silent in the heart of the dungeon, Kamilia weaves invisible traps in the shadows. Its bite injects paralyzing venom, leaving its prey conscious, but unable to flee.":
    [
      "En silencio en el corazón de la mazmorra, Kamilia teje trampas invisibles entre las sombras. Su mordedura inyecta un veneno paralizante que deja a la presa consciente, pero incapaz de escapar.",
      "Silencieuse au cœur du donjon, Kamilia tisse des pièges invisibles dans l'ombre. Sa morsure injecte un venin paralysant, laissant sa proie consciente mais incapable de fuir.", "Silenziosa nel cuore del dungeon, Kamilia tesse trappole invisibili nell'ombra. Il suo morso inietta un veleno paralizzante che lascia la preda cosciente, ma incapace di fuggire."
    ],
  "Kazor uses erratic leaps and high burst phases, demanding coordinated interrupts from the party.": [
    "Kazor realiza saltos erráticos y fases de gran explosión de daño, lo que exige interrupciones coordinadas del grupo.",
    "Kazor enchaîne des bonds erratiques et des phases de forte puissance, exigeant des interruptions coordonnées du groupe.", "Kazor alterna balzi erratici e fasi di grande esplosione di danno, richiedendo interruzioni coordinate da parte del gruppo."
  ],
  "The old boss tower from early Aincrad records, layered with trap stairs and ambush rooms. Every floor feels like a raid rehearsal built to punish hesitation.":
    [
      "La antigua torre de jefe de los primeros registros de Aincrad, llena de escaleras con trampas y salas de emboscada. Cada piso parece un ensayo de incursión diseñado para castigar la duda.",
      "L'ancienne tour de boss des premiers enregistrements d'Aincrad, remplie d'escaliers piégés et de salles d'embuscade. Chaque étage ressemble à une répétition de raid conçue pour punir l'hésitation.", "L'antica torre del boss dei primi registri di Aincrad, piena di scale a trappole e sale d'imboscata. Ogni piano sembra una prova di raid costruita per punire l'esitazione."
    ],
  "In the heart of a forgotten cave sleeps an ancient serpent: Aepep No one knows if he's awake... or still dreaming. Its gigantic body would have shaped the galleries.":
    [
      "En el corazón de una cueva olvidada duerme una serpiente ancestral: Aepep. Nadie sabe si está despierta... o si aún sueña. Su cuerpo gigantesco habría dado forma a las galerías.",
      "Au cœur d'une caverne oubliée dort un serpent ancien : Aepep. Nul ne sait s'il est éveillé... ou s'il rêve encore. Son corps gigantesque aurait façonné les galeries.", "Nel cuore di una caverna dimenticata dorme un serpente ancestrale: Aepep. Nessuno sa se sia sveglio... o se stia ancora sognando. Il suo corpo gigantesco avrebbe plasmato le gallerie."
    ],
  "Underground mineral veins near Sablemor, rich with rare ore.": [
    "Vetas minerales subterráneas cerca de Sablemor, ricas en minerales raros.",
    "Veines minérales souterraines près de Sablemor, riches en minerais rares.", "Vene minerali sotterranee vicino a Sablemor, ricche di minerale raro."
  ],
  "A fearsome boss encountered underground in Map 2.": [
    "Un jefe temible encontrado bajo tierra en el mapa 2.",
    "Un boss redoutable rencontré sous terre dans la carte 2.", "Un boss temibile incontrato sottoterra nella Mappa 2."
  ],
  "A small settlement of Ngangas houses with mystic inhabitants.": [
    "Un pequeño asentamiento de casas Ngangas con habitantes místicos.",
    "Un petit village de maisons Ngangas aux habitants mystiques.", "Un piccolo insediamento di case Ngangas con abitanti mistici."
  ],
  "A coastal enclave with tropical life and hidden secrets.": [
    "Un enclave costero de vida tropical y secretos ocultos.",
    "Une enclave côtière à la vie tropicale et aux secrets cachés.", "Un'enclave costiera dalla vita tropicale e dai segreti nascosti."
  ],
  "A dangerous boss lurking in the depths of Map 2.": [
    "Un jefe peligroso que acecha en las profundidades del mapa 2.",
    "Un boss dangereux tapi dans les profondeurs de la carte 2.", "Un boss pericoloso in agguato nelle profondità della Mappa 2."
  ],
  "The Merchants Guild Headquarters, a lively place where riches and secrets are exchanged. The streets are teeming with activity and negotiation.":
    [
      "La sede del Gremio de Mercaderes, un lugar animado donde se intercambian riquezas y secretos. Sus calles rebosan actividad y negociaciones.",
      "Le siège de la Guilde des marchands, un lieu animé où s'échangent richesses et secrets. Ses rues débordent d'activité et de négociations.", "La sede della Gilda dei Mercanti, un luogo vivace dove si scambiano ricchezze e segreti. Le strade brulicano di attività e trattative."
    ],
  "Small peaceful village nestled on the edge of a clear lake. The inhabitants live to the rhythm of the waves and the wind. A perfect place to breathe between two battles.":
    [
      "Pequeña aldea tranquila a orillas de un lago transparente. Sus habitantes viven al ritmo de las olas y el viento. Un lugar perfecto para respirar entre dos batallas.",
      "Petit village paisible niché au bord d'un lac limpide. Ses habitants vivent au rythme des vagues et du vent. Un endroit parfait pour reprendre son souffle entre deux batailles.", "Un piccolo villaggio tranquillo adagiato sulle rive di un lago limpido. Gli abitanti vivono al ritmo delle onde e del vento. Un luogo perfetto per respirare tra due battaglie."
    ],
  "A subterranean boss found deep below Map 2.": [
    "Un jefe subterráneo encontrado en las profundidades del mapa 2.",
    "Un boss souterrain découvert dans les profondeurs de la carte 2.", "Un boss sotterraneo scoperto nelle profondità della Mappa 2."
  ],
  "A cursed entity emerging from ancient darkness, it prowls, invisible, ready to tear the souls of the living.": [
    "Una entidad maldita surgida de una oscuridad ancestral. Acecha invisible, lista para desgarrar las almas de los vivos.",
    "Une entité maudite surgie d'une ancienne obscurité. Elle rôde, invisible, prête à déchirer les âmes des vivants.", "Un'entità maledetta emersa da un'antica oscurità: si aggira invisibile, pronta a strappare le anime dei vivi."
  ],
  "A cursed entity emerging from ancient darkness, it prowls, invisible, ready to tear apart the souls of the living.":
    [
      "Una entidad maldita surgida de una oscuridad ancestral. Acecha invisible, lista para desgarrar las almas de los vivos.",
      "Une entité maudite surgie d'une ancienne obscurité. Elle rôde, invisible, prête à déchirer les âmes des vivants.", "Un'entità maledetta emersa da un'antica oscurità: si aggira invisibile, pronta a dilaniare le anime dei vivi."
    ],
  "Sell Tier 2 Tools; Savanna tools.": [
    "Vende herramientas de nivel 2 y herramientas de sabana.",
    "Vend des outils de niveau 2 et des outils de savane.", "Vende strumenti del Livello 2; strumenti della savana."
  ],
  "Nestled on the edge of an unfathomable sea chasm, the village of Virelune lives to the rhythm of lunar tides. Fishermen say they see two moons reflected in the waters... But one of them never follows the sky.":
    [
      "Enclavada al borde de una sima marina insondable, la aldea de Virelune vive al ritmo de las mareas lunares. Los pescadores dicen ver dos lunas reflejadas en las aguas... Pero una de ellas nunca sigue al cielo.",
      "Niché au bord d'un gouffre marin insondable, le village de Virelune vit au rythme des marées lunaires. Les pêcheurs disent voir deux lunes se refléter dans les eaux... Mais l'une d'elles ne suit jamais le ciel.", "Adagiato sull'orlo di un abisso marino insondabile, il villaggio di Virelune vive al ritmo delle maree lunari. I pescatori dicono di vedere due lune riflesse nelle acque... Ma una di esse non segue mai il cielo."
    ],
  "A creeping entity born from the mines of Geldorak, Vyrmos soaks up spores and damp earth. His skin is covered in living foam, and his breath corrupts everything he touches.":
    [
      "Una entidad reptante nacida en las minas de Geldorak, Vyrmos absorbe esporas y tierra húmeda. Su piel está cubierta de espuma viva y su aliento corrompe todo lo que toca.",
      "Une entité rampante née dans les mines de Geldorak, Vyrmos absorbe les spores et la terre humide. Sa peau est couverte d'une mousse vivante et son souffle corrompt tout ce qu'il touche.", "Un'entità strisciante nata dalle miniere di Geldorak, Vyrmos assorbe spore e terra umida. La sua pelle è coperta di schiuma viva e il suo alito corrompe tutto ciò che tocca."
    ],
  "An elegant scythe mixing pink and silver hues, decorated with patterns evoking love.": [
    "Una elegante guadaña que mezcla tonos rosas y plateados, decorada con motivos que evocan el amor.",
    "Une élégante faux mêlant des teintes roses et argentées, décorée de motifs évoquant l'amour.", "Una falce elegante che mescola tonalità rosa e argentate, decorata con motivi che evocano l'amore."
  ],
  "Grippy, but fast, as if the rust itself had learned to run with its soul.": [
    "Con buen agarre, pero rápida, como si el óxido hubiera aprendido a correr con su alma.",
    "Adhérente mais rapide, comme si la rouille elle-même avait appris à courir avec son âme.", "Aderente ma rapida, come se la ruggine stessa avesse imparato a correre con la sua anima."
  ],
  "Soul fragments at each tip of arrows, removing all life.": [
    "Fragmentos de alma en cada punta de flecha, que arrebatan toda vida.",
    "Des fragments d'âme à chaque pointe de flèche, arrachant toute vie.", "Frammenti d'anima su ogni punta delle frecce, che tolgono ogni vita."
  ],
  "A golden gem formed by the solidification of honey. Channels gentle but persistent energy.": [
    "Una gema dorada formada por la solidificación de la miel. Canaliza una energía suave pero persistente.",
    "Une gemme dorée formée par la solidification du miel. Elle canalise une énergie douce mais persistante.", "Una gemma dorata formata dalla solidificazione del miele. Canalizza un'energia dolce ma persistente."
  ],
  "Forged with many materials obtained from bees.": [
    "Forjado con numerosos materiales obtenidos de las abejas.",
    "Forgé avec de nombreux matériaux obtenus auprès des abeilles.", "Forgiato con numerosi materiali ottenuti dalle api."
  ],
  "A golden ring with amber highlights, whose smooth surface recalls the shine of freshly poured honey.": [
    "Un anillo dorado con reflejos de ámbar cuya superficie lisa recuerda el brillo de la miel recién vertida.",
    "Une bague dorée aux reflets ambrés, dont la surface lisse rappelle l'éclat du miel fraîchement versé.", "Un anello dorato dai riflessi ambrati, la cui superficie liscia ricorda il lucido del miele appena versato."
  ],
  "Each bolt releases a chilling blast that chills the hearts of targets.": [
    "Cada virote libera una ráfaga helada que enfría el corazón de los objetivos.",
    "Chaque carreau libère une bourrasque glaciale qui refroidit le cœur des cibles.", "Ogni dardo libera una raffica gelida che raggela il cuore dei bersagli."
  ],
  "Perfect outfit for tracking down targets and inflicting critical damage on them.": [
    "Un atuendo perfecto para rastrear objetivos e infligirles daño crítico.",
    "Une tenue parfaite pour traquer les cibles et leur infliger des dégâts critiques.", "Un completo perfetto per rintracciare i bersagli e infliggere loro danni critici."
  ],
  "Light and flexible, this bee-inspired armor allows speed and precision, ideal for hunters.": [
    "Ligera y flexible, esta armadura inspirada en las abejas permite velocidad y precisión, ideal para cazadores.",
    "Légère et flexible, cette armure inspirée des abeilles favorise la vitesse et la précision, idéale pour les chasseurs.", "Leggera e flessibile, questa armatura ispirata alle api favorisce velocità e precisione, ideale per i cacciatori."
  ],
  "A solidified patch of frost, as hard as stone.": [
    "Una placa de escarcha solidificada, tan dura como la piedra.",
    "Une plaque de givre solidifiée, aussi dure que la pierre.", "Una placca di gelo solidificato, dura come la pietra."
  ],
  "A crystalline fragment bathed in ancient magic. It is prized for forging mystical armor.": [
    "Un fragmento cristalino bañado en magia antigua. Es apreciado para forjar armaduras místicas.",
    "Un fragment cristallin baigné de magie ancienne. Il est prisé pour forger des armures mystiques.", "Un frammento cristallino immerso in magia antica. È apprezzato per forgiare armature mistiche."
  ],
  "Forged from Ika plates, these ancestral turtles provide strength and stability.": [
    "Forjado con placas de Ika, este material ancestral aporta fuerza y estabilidad.",
    "Forgé à partir de plaques d'Ika, ce matériau ancestral apporte force et stabilité.", "Forgiato con le placche di Ika, questo materiale ancestrale offre forza e stabilità."
  ],
  "A red crystal covered with purplish veins, giving off a disturbing aura reminiscent of the ferocity of the fearsome Kobold lord.":
    [
      "Un cristal rojo cubierto de vetas moradas que desprende un aura inquietante, reminiscencia de la ferocidad del temible señor kobold.",
      "Un cristal rouge parcouru de veines violacées, dégageant une aura inquiétante rappelant la férocité du redoutable seigneur kobold.", "Un cristallo rosso coperto di venature violacee, che emana un'aura inquietante che ricorda la ferocia del temibile signore kobold."
    ],
  "A powerful amulet, forged from impure onyx.": [
    "Un amuleto poderoso forjado con ónice impuro.",
    "Une amulette puissante forgée en onyx impur.", "Un amuleto potente, forgiato con onice impuro."
  ],
  "A dark coin forged from impure onyx at Tier 2.": [
    "Una moneda oscura forjada con ónice impuro en el nivel 2.",
    "Une pièce sombre forgée avec de l'onyx impur au niveau 2.", "Una moneta oscura forgiata con onice impuro al Livello 2."
  ],
  "A pair of gloves made from impure onyx, incomplete and with a powerful appearance like a blade": [
    "Unos guantes hechos de ónice impuro, incompletos y con un aspecto poderoso como una hoja.",
    "Une paire de gants en onyx impur, incomplète et à l'apparence puissante comme une lame.", "Un paio di guanti fatti di onice impuro, incompleti e dall'aspetto potente come una lama."
  ],
  "An ore from a rare rock. This ore can be used to forge good weapons, but they will quickly become useless!": [
    "Un mineral de una roca rara. Puede utilizarse para forjar buenas armas, ¡pero se volverán inútiles rápidamente!",
    "Un minerai issu d'une roche rare. Il peut servir à forger de bonnes armes, mais elles deviendront vite inutilisables !", "Un minerale da una roccia rara. Può essere usato per forgiare buone armi, ma diventeranno rapidamente inutilizzabili!"
  ],
  "Forged from impure onyx, this ring is incomplete but seems very powerful despite everything.": [
    "Forjado con ónice impuro, este anillo está incompleto, pero aun así parece muy poderoso.",
    "Forgée en onyx impur, cette bague est incomplète mais semble malgré tout très puissante.", "Forgiato con onice impuro, questo anello è incompleto ma sembra comunque molto potente."
  ],
  "A strong string woven from an impure onyx alloy, and mixed with spider threads.": [
    "Una cuerda resistente tejida con una aleación de ónice impuro y mezclada con hilos de araña.",
    "Une ficelle solide tressée avec un alliage d'onyx impur et mélangée à des fils d'araignée.", "Una corda robusta intrecciata con una lega di onice impuro e mescolata a fili di ragno."
  ],
  "An orichalcum ingot, forged from fragments of a rare ore.": [
    "Un lingote de oricalco forjado con fragmentos de un mineral raro.",
    "Un lingot d'orichalque forgé à partir de fragments d'un minerai rare.", "Un lingotto di oricalco, forgiato con frammenti di un minerale raro."
  ],
  "A rudimentary amulet, forged from raw iron. Nothing magical, just robustness.": [
    "Un amuleto rudimentario forjado con hierro en bruto. Nada mágico, solo robustez.",
    "Une amulette rudimentaire forgée dans du fer brut. Rien de magique, seulement de la robustesse.", "Un amuleto rudimentale, forgiato con ferro grezzo. Niente di magico, solo robustezza."
  ],
  "A reliable weapon to hit even the toughest enemies.": [
    "Un arma fiable para golpear incluso a los enemigos más resistentes.",
    "Une arme fiable pour frapper même les ennemis les plus coriaces.", "Un'arma affidabile per colpire anche i nemici più resistenti."
  ],
  "A simple iron band, forged to protect the wrist or supplement rudimentary equipment.": [
    "Una sencilla banda de hierro, forjada para proteger la muñeca o complementar un equipo rudimentario.",
    "Un simple anneau de fer, forgé pour protéger le poignet ou compléter un équipement rudimentaire.", "Una semplice fascia di ferro, forgiata per proteggere il polso o integrare un equipaggiamento rudimentale."
  ],
  "A pair of polished iron gloves, with a cold sheen and a solidly forged appearance.": [
    "Unos guantes de hierro pulido, con un brillo frío y un aspecto sólidamente forjado.",
    "Une paire de gants en fer poli, au reflet froid et à l'apparence solidement forgée.", "Un paio di guanti di ferro lucidato, dalla lucentezza fredda e dall'aspetto solidamente forgiato."
  ],
  "A rock marked by veins of raw metal.": [
    "Una roca marcada por vetas de metal en bruto.",
    "Une roche marquée de veines de métal brut.", "Una roccia segnata da venature di metallo grezzo."
  ],
  "Carved from raw iron, this ring is appreciated for its solidity more than its appearance.": [
    "Tallado en hierro en bruto, este anillo se aprecia más por su solidez que por su aspecto.",
    "Taillée dans du fer brut, cette bague est appréciée davantage pour sa solidité que pour son apparence.", "Intagliato nel ferro grezzo, questo anello è apprezzato più per la sua solidità che per il suo aspetto."
  ],
  "Light and soft matte black stone.": ["Piedra negra mate, ligera y suave.", "Pierre noire mate, légère et douce.", "Pietra nera opaca, leggera e morbida."],
  "A juvenile treant bark.": ["Una corteza de treant joven.", "Une écorce de jeune tréant.", "Una corteccia di treant giovane."],
  "A juvenile treant seed.": ["Una semilla de treant joven.", "Une graine de jeune tréant.", "Un seme di treant giovane."],
  "It symbolizes the moment when the hero takes flight as an independent hunter...": [
    "Simboliza el momento en que el héroe alza el vuelo como cazador independiente...",
    "Elle symbolise l'instant où le héros prend son envol comme chasseur indépendant...", "Simbolizza il momento in cui l'eroe spicca il volo come cacciatore indipendente..."
  ],
  "Currency from Kazor.": ["Moneda de Kazor.", "Monnaie de Kazor.", "Valuta di Kazor."],
  "Can be used to access the dungeon: Melliona Hive.": [
    "Puede utilizarse para acceder a la mazmorra: Colmena de Melliona.",
    "Peut être utilisée pour accéder au donjon : Ruche de Melliona.", "Può essere usata per accedere al dungeon: Alveare di Melliona."
  ],
  "Can be used to access the dungeon: The Sanctuary of Xal'Zirith.": [
    "Puede utilizarse para acceder a la mazmorra: Santuario de Xal'Zirith.",
    "Peut être utilisée pour accéder au donjon : Sanctuaire de Xal'Zirith.", "Può essere usata per accedere al dungeon: Santuario di Xal'Zirith."
  ],
  "Advance, used for various recipes and potions.": [
    "Ingrediente utilizado para diversas recetas y pociones.",
    "Ingrédient utilisé pour diverses recettes et potions.", "Ingrediente usato per varie ricette e pozioni."
  ],
  "Plant remains carrying a strange natural energy.": [
    "Restos vegetales que contienen una extraña energía natural.",
    "Des restes végétaux porteurs d'une étrange énergie naturelle.", "Resti vegetali portatori di una strana energia naturale."
  ],
  "Pale lilac stone with fine leaves.": [
    "Piedra lila pálida con hojas delicadas.",
    "Pierre lilas pâle aux fines feuilles.", "Pietra lilla pallida con foglie sottili."
  ],
  "This necklace is woven from living lianas. It is said to respond to the heartbeat of the forest.": [
    "Este collar está tejido con lianas vivas. Se dice que responde al latido del bosque.",
    "Ce collier est tressé avec des lianes vivantes. On dit qu'il répond au battement de cœur de la forêt.", "Questa collana è intrecciata con liane vive. Si dice che risponda al battito del bosco."
  ],
  "A fine necklace adorned with a pendant, shining with a soft and romantic shine.": [
    "Un elegante collar adornado con un colgante que brilla con una luz suave y romántica.",
    "Un élégant collier orné d'un pendentif, brillant d'une lueur douce et romantique.", "Una collana raffinata adornata con un pendente, che brilla di una luce soffice e romantica."
  ],
  "A vial filled with a shimmering pinkish liquid, giving off a soft, warm and captivating glow.": [
    "Un frasco lleno de un líquido rosado brillante que emite un resplandor suave, cálido y cautivador.",
    "Une fiole remplie d'un liquide rosé scintillant, dégageant une lueur douce, chaleureuse et captivante.", "Una fiala piena di un liquido rosato scintillante, che emana un bagliore soffice, caldo e accattivante."
  ],
  "A sparkling stick topped with a heart-shaped crystal, casting a warm glow.": [
    "Un bastón brillante coronado por un cristal con forma de corazón que proyecta una luz cálida.",
    "Un bâton scintillant surmonté d'un cristal en forme de cœur, diffusant une lueur chaleureuse.", "Un bastone scintillante sormontato da un cristallo a forma di cuore, che diffonde una luce calda."
  ],
  "A very light, bright and well-woven belt.": [
    "Un cinturón muy ligero, brillante y bien tejido.",
    "Une ceinture très légère, brillante et bien tressée.", "Una cintura molto leggera, luminosa e ben intrecciata."
  ],
  "A tenacious and robust bracelet to quickly track down enemies.": [
    "Un brazalete tenaz y robusto para localizar rápidamente a los enemigos.",
    "Un bracelet tenace et robuste pour traquer rapidement les ennemis.", "Un bracciale tenace e robusto per rintracciare rapidamente i nemici."
  ],
  "A pair of gloves sculpted to hunt prey relentlessly and light.": [
    "Unos guantes tallados para cazar presas sin descanso y con ligereza.",
    "Une paire de gants sculptée pour chasser les proies sans relâche et avec légèreté.", "Un paio di guanti scolpiti per cacciare le prede senza sosta e con leggerezza."
  ],
  "Luminescent spider venom.": ["Veneno luminiscente de araña.", "Venin d'araignée luminescent.", "Veleno di ragno luminescente."],
  "A legendary and lunar piece, it shines with a mystical and rare glow the color of gold.": [
    "Una pieza legendaria y lunar que brilla con un resplandor místico y poco común de color dorado.",
    "Une pièce légendaire et lunaire, brillant d'une lueur mystique et rare couleur or.", "Un pezzo leggendario e lunare, che risplende di un bagliore mistico e raro color oro."
  ],
  "Yellow dust, surprisingly, is a currency for the end of year celebrations, but it is the color of gold!": [
    "El polvo amarillo es, sorprendentemente, una moneda para las celebraciones de fin de año, ¡pero tiene el color del oro!",
    "La poussière jaune est étonnamment une monnaie pour les fêtes de fin d'année, mais elle a la couleur de l'or !", "La polvere gialla è, sorprendentemente, una valuta per le celebrazioni di fine anno, ma ha il colore dell'oro!"
  ],
  "A tenacious and robust bracelet to face the mist and its dangers.": [
    "Un brazalete tenaz y robusto para enfrentarse a la niebla y sus peligros.",
    "Un bracelet tenace et robuste pour affronter la brume et ses dangers.", "Un bracciale tenace e robusto per affrontare la nebbia e i suoi pericoli."
  ],
  "Very powerful staff, forged using the power of Illfang and rare ores. However, it is now just a relic.": [
    "Un bastón muy poderoso, forjado con el poder de Illfang y minerales raros. Sin embargo, ahora no es más que una reliquia.",
    "Un bâton très puissant, forgé grâce au pouvoir d'Illfang et à des minerais rares. Cependant, ce n'est plus qu'une relique.", "Bastone molto potente, forgiato con il potere di Illfang e minerali rari. Tuttavia, ora non è più che una reliquia."
  ],
  "A novice belt built for dependable use.": [
    "Un cinturón de principiante diseñado para un uso fiable.",
    "Une ceinture de novice conçue pour une utilisation fiable.", "Una cintura da novizio, costruita per un uso affidabile."
  ],
  "A pair of novice gloves with a comfortable fit.": [
    "Unos guantes de principiante de ajuste cómodo.",
    "Une paire de gants de novice au port confortable.", "Un paio di guanti da novizio dalla vestibilità comoda."
  ],
  "A novice necklace with a simple, polished look.": [
    "Un collar de principiante de aspecto sencillo y pulido.",
    "Un collier de novice à l'apparence simple et polie.", "Una collana da novizio dall'aspetto semplice e levigato."
  ],
  "Small wood powder made using oak wood.": [
    "Pequeño polvo de madera hecho con madera de roble.",
    "Petite poudre de bois fabriquée avec du bois de chêne.", "Polvere di legno finissima ricavata dal legno di quercia."
  ],
  "A sturdy string woven from oak fibers, and mixed with spider threads.": [
    "Una cuerda resistente tejida con fibras de roble y mezclada con hilos de araña.",
    "Une ficelle robuste tressée avec des fibres de chêne et mélangée à des fils d'araignée.", "Una corda robusta intrecciata con fibre di quercia e mescolata a fili di ragno."
  ],
  "Dipped in the blood spilled during initiation rites, its edge obeys only the will of the Circle.": [
    "Bañado en la sangre derramada durante los ritos de iniciación, su filo solo obedece a la voluntad del Círculo.",
    "Trempée dans le sang versé lors des rites d'initiation, sa lame n'obéit qu'à la volonté du Cercle.", "Immersa nel sangue versato durante i riti di iniziazione, la sua lama obbedisce solo alla volontà del Circolo."
  ],
  "Frightfully demonic grimoire that controls occult magic.": [
    "Un grimorio aterradoramente demoníaco que controla la magia oculta.",
    "Un grimoire terriblement démoniaque qui contrôle la magie occulte.", "Grimorio terribilmente demoniaco che controlla la magia occulta."
  ],
  "Worn during the secret ceremonies of the Circle, it plunges its wearer into sacred darkness.": [
    "Llevado durante las ceremonias secretas del Círculo, sume a quien lo lleva en una oscuridad sagrada.",
    "Porté lors des cérémonies secrètes du Cercle, il plonge son porteur dans une obscurité sacrée.", "Indossato durante le cerimonie segrete del Circolo, immerge chi lo porta in una sacra oscurità."
  ],
  "The sand within it froze during the last rite, time no longer has any hold on its wearer.": [
    "La arena que contiene se congeló durante el último rito; el tiempo ya no tiene poder sobre quien lo lleva.",
    "Le sable qu'il contient a gelé lors du dernier rite ; le temps n'a plus de prise sur son porteur.", "La sabbia al suo interno si è congelata durante l'ultimo rito: il tempo non ha più presa su chi lo indossa."
  ],
  "Woven in a canvas blessed by the Master, it hides its wearer from the gaze of the profane.": [
    "Tejido en una lona bendecida por el Maestro, oculta a quien lo lleva de la mirada de los profanos.",
    "Tissé dans une toile bénie par le Maître, il dissimule son porteur au regard des profanes.", "Tessuto in una tela benedetta dal Maestro, nasconde chi lo indossa allo sguardo dei profani."
  ],
  "Snatched during the last rite of the Circle, he whispers the oaths of the missing members.": [
    "Arrebatado durante el último rito del Círculo, susurra los juramentos de los miembros desaparecidos.",
    "Arraché lors du dernier rite du Cercle, il murmure les serments des membres disparus.", "Strappato durante l'ultimo rito del Circolo, sussurra i giuramenti dei membri scomparsi."
  ],
  "A mysterious and occult token. It looks like it allows you to obtain a very dark reward...": [
    "Una ficha misteriosa y oculta. Parece permitir obtener una recompensa muy oscura...",
    "Un jeton mystérieux et occulte. Il semble permettre d'obtenir une récompense très sombre...", "Un gettone misterioso e occulto. Sembra permettere di ottenere una ricompensa molto oscura..."
  ],
  "Forged in the depths, this braclet still bears the mark of a fallen knight consumed by the darkness he served!": [
    "Forjado en las profundidades, este brazalete aún lleva la marca de un caballero caído consumido por la oscuridad a la que servía.",
    "Forgé dans les profondeurs, ce bracelet porte encore la marque d'un chevalier déchu consumé par les ténèbres qu'il servait !", "Forgiato nelle profondità, questo bracciale porta ancora il marchio di un cavaliere caduto, consumato dalle tenebre che serviva!"
  ],
  "Prickly and unattractive, but useful.": [
    "Espinoso y poco atractivo, pero útil.",
    "Épineux et peu attrayant, mais utile.", "Spinoso e poco attraente, ma utile."
  ],
  "Oracil thorn, collected from old shrubs. Valuable ingredient for potions and remedies.": [
    "Espina de Oracil recogida de arbustos antiguos. Ingrediente valioso para pociones y remedios.",
    "Épine d'Oracil récoltée sur de vieux arbustes. Ingrédient précieux pour les potions et les remèdes.", "Spina di Oracil raccolta da vecchi arbusti. Ingrediente prezioso per pozioni e rimedi."
  ],
  "Orange stone with dark and light bands.": [
    "Piedra naranja con bandas claras y oscuras.",
    "Pierre orange aux bandes claires et sombres.", "Pietra arancione con bande chiare e scure."
  ],
  "A red crystal ball made from the petrified blood of the high-ranking demon Vulcan.": [
    "Una bola de cristal roja hecha con la sangre petrificada del demonio de alto rango Vulcan.",
    "Une boule de cristal rouge faite du sang pétrifié du démon de haut rang Vulcan.", "Una sfera di cristallo rossa, fatta con il sangue pietrificato del demone di alto rango Vulcan."
  ],
  "A carved ring to strengthen the dark energy of the woods.": [
    "Un anillo tallado para reforzar la energía oscura de los bosques.",
    "Une bague sculptée pour renforcer l'énergie sombre des bois.", "Un anello intagliato per rafforzare l'energia oscura dei boschi."
  ],
  "Legend has it that this ring is still imbued with the bloodlust of the Harpy from which it came.": [
    "Cuenta la leyenda que este anillo aún está imbuido de la sed de sangre de la arpía de la que procede.",
    "La légende raconte que cette bague est encore imprégnée de la soif de sang de la harpie dont elle provient.", "La leggenda narra che questo anello sia ancora impregnato della sete di sangue dell'arpia da cui proviene."
  ],
  "Small but powerful, it reacts to dangers quickly, like a dart ready to sting.": [
    "Pequeño pero poderoso, reacciona rápidamente a los peligros, como un dardo listo para picar.",
    "Petit mais puissant, il réagit rapidement aux dangers, comme une fléchette prête à piquer.", "Piccolo ma potente, reagisce rapidamente ai pericoli, come un dardo pronto a pungere."
  ],
  "A sculpted ring to provide agility and assist with certain maneuvers.": [
    "Un anillo tallado para proporcionar agilidad y ayudar con ciertas maniobras.",
    "Une bague sculptée pour apporter de l'agilité et faciliter certaines manœuvres.", "Un anello scolpito per donare agilità e aiutare in certe manovre."
  ],
  "A sculpted ring to catch targets in our webs.": [
    "Un anillo tallado para atrapar objetivos en nuestras telarañas.",
    "Une bague sculptée pour capturer les cibles dans nos toiles.", "Un anello scolpito per catturare i bersagli nelle nostre tele."
  ],
  "A ring carved to serve the fangs of the wild woods.": [
    "Un anillo tallado para servir a los colmillos de los bosques salvajes.",
    "Une bague sculptée pour servir les crocs des bois sauvages.", "Un anello intagliato per servire le zanne dei boschi selvaggi."
  ],
  "A ring carved to serve the fierce tribe of orcs.": [
    "Un anillo tallado para servir a la feroz tribu de los orcos.",
    "Une bague sculptée pour servir la féroce tribu des orques.", "Un anello intagliato per servire la feroce tribù degli orchi."
  ],
  "A ring sculpted to also surgically strike its targets in the back.": [
    "Un anillo tallado para golpear quirúrgicamente a sus objetivos por la espalda.",
    "Une bague sculptée pour frapper chirurgicalement ses cibles dans le dos.", "Un anello scolpito per colpire chirurgicamente i bersagli anche alle spalle."
  ],
  "Carved from oak wood, reinforced with magical wood and enchanted with allium.": [
    "Tallado en madera de roble, reforzado con madera mágica y encantado con allium.",
    "Taillé dans du bois de chêne, renforcé avec du bois magique et enchanté à l'allium.", "Intagliato nel legno di quercia, rinforzato con legno magico e incantato con l'allium."
  ],
  "A torn garment belonging to a former human, now a skeleton protecting his domain.": [
    "Una prenda desgarrada que perteneció a un antiguo humano, ahora un esqueleto que protege su territorio.",
    "Un vêtement déchiré ayant appartenu à un ancien humain, désormais un squelette protégeant son domaine.", "Un indumento strappato appartenuto a un antico umano, ora uno scheletro che protegge il suo dominio."
  ],
  "A supple and sparkling feather, full of aquatic essence.": [
    "Una pluma flexible y brillante, llena de esencia acuática.",
    "Une plume souple et scintillante, pleine d'essence aquatique.", "Una piuma morbida e scintillante, piena di essenza acquatica."
  ],
  "A deep red rose with impeccable petals, a delicate symbol of sincere attachment.": [
    "Una rosa roja intensa de pétalos impecables, delicado símbolo de un vínculo sincero.",
    "Une rose rouge profonde aux pétales impeccables, symbole délicat d'un attachement sincère.", "Una rosa rosso intenso dai petali impeccabili, delicato simbolo di un legame sincero."
  ],
  "Putrefaction is gradually eating away at this heart.": [
    "La putrefacción está consumiendo poco a poco este corazón.",
    "La putréfaction ronge progressivement ce cœur.", "La putrefazione sta consumando poco a poco questo cuore."
  ],
  "A solid and resistant horn, coming from a robust and powerful Rugiboeuf!": [
    "¡Un cuerno sólido y resistente procedente de un Rugiboeuf robusto y poderoso!",
    "Une corne solide et résistante provenant d'un Rugiboeuf robuste et puissant !", "Un corno solido e resistente, proveniente da un Rugiboeuf robusto e potente!"
  ],
  "Allows you to remove a rune at random by right-clicking on the item of your choice.": [
    "Permite eliminar una runa al azar haciendo clic derecho sobre el objeto elegido.",
    "Permet de retirer une rune aléatoire en faisant un clic droit sur l'objet choisi.", "Permette di rimuovere una runa a caso facendo clic con il tasto destro sull'oggetto che scegli."
  ],
  "Allows you to remove two runes at random by right-clicking on the item of your choice.": [
    "Permite eliminar dos runas al azar haciendo clic derecho sobre el objeto elegido.",
    "Permet de retirer deux runes aléatoires en faisant un clic droit sur l'objet choisi.", "Permette di rimuovere due rune a caso facendo clic con il tasto destro sull'oggetto che scegli."
  ],
  "Forged with runestones and materials obtained from bees.": [
    "Forjado con piedras rúnicas y materiales obtenidos de las abejas.",
    "Forgé avec des pierres runiques et des matériaux obtenus auprès des abeilles.", "Forgiato con pietre runiche e materiali ottenuti dalle api."
  ],
  "Engraved with ancient inscriptions, it is only activated in the presence of a second component.": [
    "Grabado con inscripciones antiguas, solo se activa en presencia de un segundo componente.",
    "Gravé d'inscriptions anciennes, il ne s'active qu'en présence d'un second composant.", "Incisa con antiche iscrizioni, si attiva solo in presenza di un secondo componente."
  ],
  "Forged from the branches of the World Tree Yggdrasil, felled during the Great Giant War.": [
    "Forjado con ramas del Árbol del Mundo Yggdrasil, talado durante la Gran Guerra de los Gigantes.",
    "Forgé avec des branches de l'Arbre-Monde Yggdrasil, abattu durant la Grande Guerre des géants.", "Forgiato con i rami dell'Albero del Mondo Yggdrasil, abbattuto durante la Grande Guerra dei Giganti."
  ],
  "Deep, luminous blue crystal.": ["Cristal azul intenso y luminoso.", "Cristal bleu profond et lumineux.", "Cristallo blu intenso e luminoso."],
  "Golden crystal in sunny lights.": ["Cristal dorado de brillo soleado.", "Cristal doré aux reflets solaires.", "Cristallo dorato dai riflessi solari."],
  "A very strong ax, perfect for breaking more resistant logs.": [
    "Un hacha muy resistente, perfecta para romper troncos más duros.",
    "Une hache très solide, parfaite pour briser les bûches les plus résistantes.", "Un'ascia molto resistente, perfetta per spezzare tronchi più duri."
  ],
  "A very strong pickaxe, perfect for mining stronger ores.": [
    "Un pico muy resistente, perfecto para extraer minerales más duros.",
    "Une pioche très solide, parfaite pour extraire des minerais plus résistants.", "Un piccone molto resistente, perfetto per estrarre minerali più duri."
  ],
  "A deep green feather with bright reflections, light and delicately ribbed.": [
    "Una pluma verde intensa de reflejos brillantes, ligera y delicadamente estriada.",
    "Une plume vert profond aux reflets éclatants, légère et délicatement nervurée.", "Una piuma verde intenso dai riflessi brillanti, leggera e delicatamente nervata."
  ],
  "An ornate scepter with delicate ornaments, symbol of soft and luminous magic.": [
    "Un cetro ornamentado con delicados adornos, símbolo de una magia suave y luminosa.",
    "Un sceptre orné de délicats motifs, symbole d'une magie douce et lumineuse.", "Uno scettro ornato con delicati decori, simbolo di una magia soffice e luminosa."
  ],
  "Forged with scrap metal collected on level 2.": [
    "Forjado con chatarra recogida en el nivel 2.",
    "Forgé avec de la ferraille récupérée au niveau 2.", "Forgiato con rottami raccolti al Livello 2."
  ],
  "A pair of gloves made from scrap metal, rustic and sturdy looking": [
    "Unos guantes hechos de chatarra, de aspecto rústico y resistente.",
    "Une paire de gants en ferraille, à l'aspect rustique et robuste.", "Un paio di guanti fatti di rottami, dall'aspetto rustico e robusto."
  ],
  "A crude amulet, forged from a mixture of scrap metal. Nothing magical, just robustness.": [
    "Un amuleto tosco forjado con una mezcla de chatarra. Nada mágico, solo robustez.",
    "Une amulette grossière forgée dans un mélange de ferraille. Rien de magique, seulement de la robustesse.", "Un amuleto grezzo, forgiato con una miscela di rottami. Niente di magico, solo robustezza."
  ],
  "A simple piece of ancient scrap, forged at Tier 2.": [
    "Una simple pieza de chatarra antigua, forjada en el nivel 2.",
    "Une simple pièce de ferraille ancienne, forgée au niveau 2.", "Un semplice pezzo di rottame antico, forgiato al Livello 2."
  ],
  "Forged from rustic scrap metal, this ring is distinguished by its light color and solidity.": [
    "Forjado con chatarra rústica, este anillo destaca por su color claro y su solidez.",
    "Forgée dans de la ferraille rustique, cette bague se distingue par sa couleur claire et sa solidité.", "Forgiato con rottami rustici, questo anello si distingue per il colore chiaro e la solidità."
  ],
  "A sturdy string woven from a scrap metal alloy, and mixed with spider threads.": [
    "Una cuerda resistente tejida con una aleación de chatarra y mezclada con hilos de araña.",
    "Une ficelle robuste tressée avec un alliage de ferraille et mélangée à des fils d'araignée.", "Una corda robusta intrecciata con una lega di rottami e mescolata a fili di ragno."
  ],
  "This scroll allows the player who uses it to receive a point to reset their class.": [
    "Este pergamino permite al jugador que lo usa recibir un punto para reiniciar su clase.",
    "Ce parchemin permet au joueur qui l'utilise d'obtenir un point pour réinitialiser sa classe.", "Questa pergamena permette al giocatore che la usa di ricevere un punto per azzerare la sua classe."
  ],
  "This scroll allows the player who uses it to receive a point to reset their attribute points.": [
    "Este pergamino permite al jugador que lo usa recibir un punto para reiniciar sus puntos de atributos.",
    "Ce parchemin permet au joueur qui l'utilise d'obtenir un point pour réinitialiser ses points d'attributs.", "Questa pergamena permette al giocatore che la usa di ricevere un punto per azzerare i suoi punti attributo."
  ],
  "A billhook with graceful lines, enhanced with romantic engravings along the blade.": [
    "Una podadera de líneas elegantes, realzada con grabados románticos a lo largo de la hoja.",
    "Une serpe aux lignes gracieuses, rehaussée de gravures romantiques le long de la lame.", "Una roncola dalle linee eleganti, impreziosita da incisioni romantiche lungo la lama."
  ],
  "A very hard plate of shell, torn from a shark fish. Strong and durable perfect for some heavy armor.": [
    "Una placa de caparazón muy dura, arrancada a un pez tiburón. Resistente y duradera, perfecta para ciertas armaduras pesadas.",
    "Une plaque de carapace très dure, arrachée à un poisson-requin. Solide et durable, parfaite pour certaines armures lourdes.", "Una placca di guscio molto dura, strappata a un pesce squalo. Robusta e durevole, perfetta per alcune armature pesanti."
  ],
  "Strong and resistant, it protects the curse that weighs on its wearer, thus absorbing attacks.": [
    "Fuerte y resistente, protege la maldición que pesa sobre quien lo lleva y absorbe los ataques.",
    "Solide et résistante, elle protège la malédiction qui pèse sur son porteur et absorbe ainsi les attaques.", "Robusto e resistente, protegge la maledizione che grava su chi lo indossa, assorbendo così gli attacchi."
  ],
  "Forged from the shell of Ika's turtles. Ideal for cashing in without flinching.": [
    "Forjado con el caparazón de las tortugas de Ika. Ideal para encajar golpes sin inmutarse.",
    "Forgé avec la carapace des tortues d'Ika. Idéal pour encaisser les coups sans broncher.", "Forgiato con il guscio delle tartarughe di Ika. Ideale per incassare colpi senza battere ciglio."
  ],
  "Eroded by time and dust, this shield was lost across time and dimensions.": [
    "Erosionado por el tiempo y el polvo, este escudo se perdió a través de las eras y las dimensiones.",
    "Érodé par le temps et la poussière, ce bouclier s'est perdu à travers les époques et les dimensions.", "Eroso dal tempo e dalla polvere, questo scudo si perse tra le epoche e le dimensioni."
  ],
  "A shield decorated with heart-shaped patterns, in pink and gold hues evoking gentle protection.": [
    "Un escudo decorado con motivos de corazones, en tonos rosas y dorados que evocan una protección delicada.",
    "Un bouclier décoré de motifs en forme de cœur, aux teintes roses et dorées évoquant une protection douce.", "Uno scudo decorato con motivi a cuore, in tonalità rosa e dorate che evocano una protezione delicata."
  ],
  "Simple boots with a clean, practical design.": [
    "Botas sencillas de diseño limpio y práctico.",
    "Des bottes simples au design épuré et pratique.", "Stivali semplici dal design pulito e pratico."
  ],
  "A simple pair of gloves, offering basic comfort.": [
    "Unos guantes sencillos que ofrecen una comodidad básica.",
    "Une paire de gants simple offrant un confort élémentaire.", "Un paio di guanti semplici, che offrono un comfort di base."
  ],
  "An amulet carved from bones, imbued with dark energy.": [
    "Un amuleto tallado en huesos e imbuido de energía oscura.",
    "Une amulette taillée dans des os et imprégnée d'énergie sombre.", "Un amuleto intagliato nelle ossa e impregnato di energia oscura."
  ],
  "Small bone found on low-ranking skeletons. Certainly useful for certain confections.": [
    "Hueso pequeño encontrado en esqueletos de bajo rango. Sin duda útil para ciertas preparaciones.",
    "Petit os trouvé sur des squelettes de bas rang. Certainement utile pour certaines préparations.", "Osso piccolo trovato su scheletri di basso rango. Sicuramente utile per certe preparazioni."
  ],
  "This cold skull seems to retain the silent echo of a dead person.": [
    "Este cráneo frío parece conservar el eco silencioso de una persona muerta.",
    "Ce crâne froid semble retenir l'écho silencieux d'une personne morte.", "Questo teschio freddo sembra conservare l'eco silenzioso di una persona morta."
  ],
  "A magnificent feather with the beauty and color of the sky.": [
    "Una magnífica pluma con la belleza y el color del cielo.",
    "Une magnifique plume de la beauté et de la couleur du ciel.", "Una piuma magnifica, della bellezza e del colore del cielo."
  ],
  "A small, beautiful gooey jelly that sticks to your hands for a long time.": [
    "Una pequeña y hermosa gelatina pegajosa que se adhiere a las manos durante mucho tiempo.",
    "Une petite et belle gelée gluante qui colle longtemps aux mains.", "Una piccola e bella gelatina appiccicosa che resta a lungo attaccata alle mani."
  ],
  "A small fabric bag, perfect for slipping coins into.": [
    "Una pequeña bolsa de tela, perfecta para guardar monedas.",
    "Une petite bourse en tissu, parfaite pour y glisser des pièces.", "Una piccola borsa di tessuto, perfetta per farci scivolare dentro le monete."
  ],
  "A finely crafted crown, mixing solar and winter motifs, symbol of the balance between the seasons.": [
    "Una corona finamente elaborada que mezcla motivos solares e invernales, símbolo del equilibrio entre las estaciones.",
    "Une couronne finement ouvragée mêlant motifs solaires et hivernaux, symbole de l'équilibre entre les saisons.", "Una corona finemente lavorata che mescola motivi solari e invernali, simbolo dell'equilibrio tra le stagioni."
  ],
  "An old, forgotten book of spells, its former owner poured his soul through its pages.": [
    "Un antiguo libro de hechizos olvidado; su antiguo dueño vertió su alma en sus páginas.",
    "Un vieux livre de sorts oublié, dont l'ancien propriétaire a versé son âme dans les pages.", "Un vecchio libro di incantesimi dimenticato: il suo antico proprietario vi versò la sua anima."
  ],
  "A fragment of the hearts of the fallen, still warm, letting in a light that no spell can explain.": [
    "Un fragmento de los corazones de los caídos, aún cálido, que deja entrar una luz inexplicable para cualquier hechizo.",
    "Un fragment des cœurs des défunts, encore chaud, laissant entrer une lumière qu'aucun sort ne peut expliquer.", "Un frammento dei cuori dei caduti, ancora caldo, che lascia passare una luce che nessun incantesimo può spiegare."
  ],
  "This book was forged using powerful Tier 1 materials. It embodies the power of a sorcerer.": [
    "Este libro fue forjado con materiales poderosos de nivel 1. Encarna el poder de un hechicero.",
    "Ce livre a été forgé avec de puissants matériaux de niveau 1. Il incarne le pouvoir d'un sorcier.", "Questo libro è stato forgiato con potenti materiali di livello 1. Incarna il potere di uno stregone."
  ],
  "Clothing from another age, embroidered with magical threads. It was once worn by a legendary wizard.": [
    "Ropa de otra época, bordada con hilos mágicos. Perteneció a un mago legendario.",
    "Des vêtements d'une autre époque, brodés de fils magiques. Ils furent autrefois portés par un sorcier légendaire.", "Vestiti di un'altra epoca, ricamati con fili magici. Furono indossati da uno stregone leggendario."
  ],
  "A soul is contained in this object. It can be obtained by killing its owner or by crafting it at the blacksmith.": [
    "Este objeto contiene un alma. Puede obtenerse matando a su dueño o fabricándolo en la herrería.",
    "Cet objet contient une âme. Elle peut être obtenue en tuant son propriétaire ou en la fabriquant chez le forgeron.", "Un'anima è contenuta in questo oggetto. Si può ottenere uccidendo il suo proprietario o fabbricandolo dal fabbro."
  ],
  "Sharp tip, piercing and powerful like the stinger of an angry bee.": [
    "Una punta afilada, perforante y poderosa como el aguijón de una abeja enfurecida.",
    "Une pointe acérée, perforante et puissante comme le dard d'une abeille en colère.", "Punta affilata, perforante e potente come il pungiglione di un'ape infuriata."
  ],
  "Shaped in a spectral fabric linked to the forces of the forest. It pulses gently upon contact with magic.": [
    "Confeccionado con una tela espectral vinculada a las fuerzas del bosque. Pulsa suavemente al contacto con la magia.",
    "Façonné dans un tissu spectral lié aux forces de la forêt. Il pulse doucement au contact de la magie.", "Modellato in un tessuto spettrale legato alle forze della foresta. Pulsa dolcemente al contatto con la magia."
  ],
  "A tenacious and robust bracelet to escape your enemies.": [
    "Un brazalete tenaz y robusto para escapar de tus enemigos.",
    "Un bracelet tenace et robuste pour échapper à vos ennemis.", "Un bracciale tenace e robusto per sfuggire ai nemici."
  ],
  "A mysterious spectral essence.": ["Una esencia espectral misteriosa.", "Une essence spectrale mystérieuse.", "Un'essenza spettrale misteriosa."],
  "A fabric imbued with dark magic and curses.": [
    "Una tela imbuida de magia oscura y maldiciones.",
    "Un tissu imprégné de magie sombre et de malédictions.", "Un tessuto impregnato di magia oscura e maledizioni."
  ],
  "A very light, spectral and strange feather.": [
    "Una pluma muy ligera, espectral y extraña.",
    "Une plume très légère, spectrale et étrange.", "Una piuma molto leggera, spettrale e strana."
  ],
  "A pair of gloves crafted for precise strikes against unsuspecting targets.": [
    "Unos guantes fabricados para asestar golpes precisos a objetivos desprevenidos.",
    "Une paire de gants conçue pour porter des coups précis à des cibles inattentives.", "Un paio di guanti realizzati per colpire con precisione bersagli ignari."
  ],
  "A dark mixture of ancient materials lost in a great labyrinth. It could be a ghost's grimoire.": [
    "Una mezcla oscura de materiales antiguos perdida en un gran laberinto. Podría ser el grimorio de un fantasma.",
    "Un mélange sombre de matériaux anciens perdu dans un grand labyrinthe. Il pourrait s'agir du grimoire d'un fantôme.", "Una miscela oscura di materiali antichi persa in un grande labirinto. Potrebbe essere il grimorio di un fantasma."
  ],
  "A lock of ethereal mane, torn from a spectral frame. She still pulses with rapid energy.": [
    "Un mechón de crin etérea arrancado de una montura espectral. Aún palpita con una energía veloz.",
    "Une mèche de crinière éthérée arrachée à une monture spectrale. Elle pulse encore d'une énergie rapide.", "Un ciuffo di criniera eterea, strappato da una cavalcatura spettrale. Pulsa ancora di un'energia rapida."
  ],
  "A strange and mysterious will-o'-the-wisp floating in the air, illuminating the surrounding darkness.": [
    "Un fuego fatuo extraño y misterioso que flota en el aire e ilumina la oscuridad circundante.",
    "Un feu follet étrange et mystérieux flottant dans les airs, illuminant les ténèbres environnantes.", "Uno strano e misterioso fuoco fatuo che fluttua nell'aria, illuminando l'oscurità circostante."
  ],
  "Woven from spider web and enchanted with corrupted spores.": [
    "Tejido con telaraña y encantado con esporas corruptas.",
    "Tissé avec de la toile d'araignée et enchanté par des spores corrompues.", "Tessuto con tela di ragno e incantato con spore corrotte."
  ],
  "A thin, but incredibly durable fabric. Ideal for light or enchanted equipment.": [
    "Una tela fina pero increíblemente resistente. Ideal para equipo ligero o encantado.",
    "Un tissu fin mais incroyablement résistant. Idéal pour de l'équipement léger ou enchanté.", "Un tessuto sottile ma incredibilmente resistente. Ideale per equipaggiamento leggero o incantato."
  ],
  "Red spider eyes.": ["Ojos de araña roja.", "Yeux d'araignée rouge.", "Occhi di ragno rosso."],
  "Small, very fragile wire, it can break at any time.": [
    "Un alambre pequeño y muy frágil que puede romperse en cualquier momento.",
    "Un petit fil très fragile, qui peut se casser à tout moment.", "Un filo piccolo e molto fragile, che può spezzarsi in qualsiasi momento."
  ],
  "A dark, viscous liquid extracted from the queen spider.": [
    "Un líquido oscuro y viscoso extraído de la araña reina.",
    "Un liquide sombre et visqueux extrait de l'araignée reine.", "Un liquido scuro e viscoso estratto dal ragno regina."
  ],
  "Agile bow, designed for patient and deadly hunters.": [
    "Un arco ágil diseñado para cazadores pacientes y letales.",
    "Un arc agile conçu pour les chasseurs patients et mortels.", "Arco agile, progettato per cacciatori pazienti e letali."
  ],
  "A coat stolen by a daring thief.": [
    "Un abrigo robado por un ladrón audaz.",
    "Un manteau volé par un voleur audacieux.", "Un cappotto rubato da un ladro audace."
  ],
  "Medallion found in Felyanole Cave. It should be returned to its owner!": [
    "¡Medallón encontrado en la cueva de Felyanole! Debe devolverse a su dueño.",
    "Médaille trouvée dans la grotte de Felyanole. Elle doit être rendue à son propriétaire !", "Medaglione trovato nella caverna di Felyanole. Dovrebbe essere restituito al suo proprietario!"
  ],
  "A durable bracelet made of stone.": ["Un brazalete resistente hecho de piedra.", "Un bracelet durable en pierre.", "Un bracciale durevole fatto di pietra."],
  "A heavy pair of stone gloves.": ["Unos guantes pesados de piedra.", "Une paire de gants lourds en pierre.", "Un paio di guanti pesanti di pietra."],
  "A stone necklace, quite classy despite everything.": [
    "Un collar de piedra bastante elegante a pesar de todo.",
    "Un collier en pierre assez élégant malgré tout.", "Una collana di pietra, piuttosto elegante nonostante tutto."
  ],
  "A durable ring made of stone.": ["Un anillo resistente hecho de piedra.", "Une bague durable en pierre.", "Un anello durevole fatto di pietra."],
  "A strange belt, quite effective despite everything.": [
    "Un cinturón extraño, bastante eficaz a pesar de todo.",
    "Une ceinture étrange, assez efficace malgré tout.", "Una cintura strana, piuttosto efficace nonostante tutto."
  ],
  "This rune seems ancient.": ["Esta runa parece antigua.", "Cette rune semble ancienne.", "Questa runa sembra antica."],
  "An elegant sword with pink highlights, decorated with romantic engravings along the blade.": [
    "Una espada elegante con reflejos rosas, decorada con grabados románticos a lo largo de la hoja.",
    "Une épée élégante aux reflets roses, décorée de gravures romantiques le long de la lame.", "Una spada elegante dai riflessi rosa, decorata con incisioni romantiche lungo la lama."
  ],
  "A fabric from the Sylnovars.": ["Una tela de los Sylnovars.", "Un tissu des Sylnovars.", "Un tessuto dei Sylnovar."],
  "A gem from the Sylnovars.": ["Una gema de los Sylnovars.", "Une gemme des Sylnovars.", "Una gemma dei Sylnovar."],
  "A tissue from the woods.": ["Un tejido de los bosques.", "Un tissu des bois.", "Un tessuto dei boschi."],
  "A gem from the Sylvaers.": ["Una gema de los Sylvaers.", "Une gemme des Sylvaers.", "Una gemma dei Sylvaer."],
  "Small sprout in a bowl, very useful in making life potions.": [
    "Un pequeño brote en un cuenco, muy útil para preparar pociones de vida.",
    "Une petite pousse dans un bol, très utile pour préparer des potions de vie.", "Un piccolo germoglio in una ciotola, molto utile per preparare pozioni di vita."
  ],
  "Natural material, used mainly for light and fast armor.": [
    "Material natural utilizado principalmente para armaduras ligeras y rápidas.",
    "Matériau naturel utilisé principalement pour les armures légères et rapides.", "Materiale naturale, usato principalmente per armature leggere e veloci."
  ],
  "Woven from vines and leaves infused with the calming energy of the swamp.": [
    "Tejido con lianas y hojas imbuidas de la energía calmante del pantano.",
    "Tissé avec des lianes et des feuilles imprégnées de l'énergie apaisante du marais.", "Tessuto con liane e foglie imbevute dell'energia calmante della palude."
  ],
  "Flexible and adjusted for optimal mobility in hostile terrain. Used by experienced trackers.": [
    "Flexible y ajustado para una movilidad óptima en terrenos hostiles. Utilizado por rastreadores experimentados.",
    "Flexible et ajusté pour une mobilité optimale en terrain hostile. Utilisé par des traqueurs expérimentés.", "Flessibile e adattato per una mobilità ottimale in terreni ostili. Usato dai tracciatori esperti."
  ],
  "A timber wolf tail": ["Una cola de lobo de madera.", "Une queue de loup des bois.", "Una coda di lupo dei boschi."],
  "From the claws of Adoryll a legendary majestic bird.": [
    "Procedente de las garras de Adoryll, un ave majestuosa y legendaria.",
    "Provenant des serres d'Adoryll, un oiseau majestueux et légendaire.", "Proveniente dagli artigli di Adoryll, un uccello maestoso e leggendario."
  ],
  "A belt made from the resources of bulls.": [
    "Un cinturón fabricado con recursos de toro.",
    "Une ceinture fabriquée avec des ressources de taureau.", "Una cintura fabbricata con risorse di toro."
  ],
  "Forged from a heavy, raw metal, it bears the mark of the wild bull. Brute strength and unfailing resistance.": [
    "Forjado con un metal pesado y sin refinar, lleva la marca del toro salvaje. Fuerza bruta y resistencia inquebrantable.",
    "Forgé dans un métal lourd et brut, il porte la marque du taureau sauvage. Une force brute et une résistance infaillible.", "Forgiato con un metallo pesante e grezzo, porta il marchio del toro selvaggio. Forza bruta e resistenza incrollabile."
  ],
  "Forged near a corrupted fault, this tear radiates a desolate and sad force.": [
    "Forjada cerca de una falla corrupta, esta lágrima irradia una fuerza desolada y triste.",
    "Forgée près d'une faille corrompue, cette larme rayonne d'une force désolée et triste.", "Forgiata vicino a una faglia corrotta, questa lacrima irradia una forza desolata e triste."
  ],
  "Robust and resistant skin, capable of absorbing heavy impacts.": [
    "Piel robusta y resistente, capaz de absorber impactos fuertes.",
    "Peau robuste et résistante, capable d'absorber les chocs violents.", "Pelle robusta e resistente, capace di assorbire impatti violenti."
  ],
  "Hidden beneath broken stone circles, this sub-dungeon is tuned for tight duels and poison attrition. The deeper vaults feel like a side route meant for front-liners only.":
    [
      "Oculta bajo círculos de piedra rotos, esta submazmorra está pensada para duelos cerrados y desgaste por veneno. Las cámaras más profundas parecen una ruta secundaria reservada a los combatientes de primera línea.",
      "Caché sous des cercles de pierre brisés, ce sous-donjon est conçu pour les duels rapprochés et l'usure au poison. Les salles les plus profondes ressemblent à un itinéraire secondaire réservé aux combattants de première ligne.", "Nascosto sotto cerchi di pietra spezzati, questo sotto-dungeon è pensato per duelli ravvicinati e logoramento da veleno. Le camere più profonde sembrano una via secondaria riservata ai combattenti di prima linea."
    ],
  "A fiery underground nest where blazing creatures gather.": [
    "Un nido subterráneo ardiente donde se reúnen criaturas llameantes.",
    "Un nid souterrain enflammé où se rassemblent des créatures ardentes.", "Un nido sotterraneo infuocato dove si radunano creature fiammeggianti."
  ],
  "A mythical snake sliding between deep currents, Nymbrea embodies the grace and treachery of calm waters. Its scales sparkle like cursed pearls, and its hypnotic gaze draws the unwary towards the abyss.":
    [
      "Una serpiente mítica que se desliza entre corrientes profundas. Nymbrea encarna la gracia y la traición de las aguas tranquilas. Sus escamas brillan como perlas malditas y su mirada hipnótica atrae a los incautos hacia el abismo.",
      "Un serpent mythique glissant entre les courants profonds, Nymbrea incarne la grâce et la traîtrise des eaux calmes. Ses écailles brillent comme des perles maudites et son regard hypnotique attire les imprudents vers l'abîme.", "Un serpente mitico che scivola tra le correnti profonde: Nymbrea incarna la grazia e la perfidia delle acque calme. Le sue squame brillano come perle maledette e il suo sguardo ipnotico attira gli incauti verso l'abisso."
    ],
  "A hidden oasis tucked away in Map 2's desert regions.": [
    "Un oasis oculto en las regiones desérticas del mapa 2.",
    "Une oasis cachée dans les régions désertiques de la carte 2.", "Un'oasi nascosta nelle regioni desertiche della Mappa 2."
  ],
  "The stronghold of the renowned and feared OG Guild. A strategic location reserved for elite veterans. The walls exude glory and past victories.":
    [
      "La fortaleza del famoso y temido Gremio OG. Una ubicación estratégica reservada a veteranos de élite. Sus muros desprenden gloria y victorias pasadas.",
      "Le bastion de la célèbre et redoutée Guilde OG. Un emplacement stratégique réservé aux vétérans d'élite. Ses murs exhalent la gloire et les victoires passées.", "La roccaforte della rinomata e temuta Gilda OG. Una posizione strategica riservata ai veterani d'élite. Le mura emanano gloria e vittorie passate."
    ],
  "An enchanted valley where the petals dance in the wind. The scent of flowers soothes the souls of travelers. But behind the beauty... lies an ancient secret.":
    [
      "Un valle encantado donde los pétalos danzan con el viento. El aroma de las flores calma el alma de los viajeros. Pero tras la belleza... se esconde un antiguo secreto.",
      "Une vallée enchantée où les pétales dansent dans le vent. Le parfum des fleurs apaise l'âme des voyageurs. Mais derrière la beauté... se cache un ancien secret.", "Una valle incantata dove i petali danzano nel vento. Il profumo dei fiori calma l'anima dei viaggiatori. Ma dietro la bellezza... si nasconde un antico segreto."
    ],
  "An ancient and cunning creature, Pricilia weaves her webs in the forgotten corners of the darkest forests. Its prey never sees death... only his glowing eyes.":
    [
      "Una criatura antigua y astuta, Pricilia teje sus redes en los rincones olvidados de los bosques más oscuros. Sus presas nunca ven la muerte... solo sus ojos brillantes.",
      "Créature ancienne et rusée, Pricilia tisse ses toiles dans les recoins oubliés des forêts les plus sombres. Ses proies ne voient jamais la mort... seulement ses yeux lumineux.", "Creatura antica e astuta, Pricilia tesse le sue tele negli angoli dimenticati delle foreste più oscure. Le sue prede non vedono mai la morte... solo i suoi occhi luminosi."
    ],
  "A wild beast from the forests of the first level. He charges relentlessly, driven by primitive rage.": [
    "Una bestia salvaje de los bosques del primer nivel. Embiste sin descanso, impulsada por una furia primitiva.",
    "Une bête sauvage des forêts du premier niveau. Elle charge sans relâche, animée par une rage primitive.", "Una bestia selvaggia delle foreste del primo livello. Carica senza sosta, spinta da una furia primitiva."
  ],
  "The buzzing hive where Melliona's creatures gather.": [
    "La colmena zumbante donde se reúnen las criaturas de Melliona.",
    "La ruche bourdonnante où se rassemblent les créatures de Melliona.", "L'alveare ronzante dove si radunano le creature di Melliona."
  ],
  "A colossal boss roaming the northern reaches of Map 2.": [
    "Un jefe colosal que recorre las regiones septentrionales del mapa 2.",
    "Un boss colossal parcourant les régions septentrionales de la carte 2.", "Un boss colossale che percorre le regioni settentrionali della Mappa 2."
  ],
  "Once an impregnable bastion, the Snow Citadel was the scene of a forgotten siege, lost in the snowflakes of time. Its ramparts, frozen in ice, guard the scars. Today, only the most daring dare to pass through its doors...":
    [
      "Antaño un bastión inexpugnable, la Ciudadela de Nieve fue escenario de un asedio olvidado, perdido entre los copos del tiempo. Sus murallas, congeladas en hielo, guardan las cicatrices. Hoy solo los más osados se atreven a cruzar sus puertas...",
      "Autrefois bastion imprenable, la Citadelle des neiges fut le théâtre d'un siège oublié, perdu dans les flocons du temps. Ses remparts gelés gardent les cicatrices. Aujourd'hui, seuls les plus audacieux osent franchir ses portes...", "Un tempo bastione inespugnabile, la Cittadella delle Nevi fu teatro di un assedio dimenticato, perso tra i fiocchi del tempo. I suoi bastioni, gelati nel ghiaccio, custodiscono le cicatrici. Oggi solo i più audaci osano varcare le sue porte..."
    ],
  "A rugged region known for strong winds and sparse vegetation.": [
    "Una región escarpada conocida por sus fuertes vientos y su escasa vegetación.",
    "Une région accidentée connue pour ses vents violents et sa végétation clairsemée.", "Una regione aspra, nota per i venti forti e la vegetazione rada."
  ],
  "Luminescent crystals with mysterious properties. Protected by Tolbana mages...": [
    "Cristales luminiscentes con propiedades misteriosas. Protegidos por los magos de Tolbana...",
    "Des cristaux luminescents aux propriétés mystérieuses. Protégés par les mages de Tolbana...", "Cristalli luminescenti dalle proprietà misteriose. Protetti dai maghi di Tolbana..."
  ],
  "Built on the mountainside, Tolbana is home to the largest magical libraries in the known world. Its streets vibrate with energy, and its towers resonate with the echo of age-old incantations.":
    [
      "Construida en la ladera de la montaña, Tolbana alberga las mayores bibliotecas mágicas del mundo conocido. Sus calles vibran de energía y sus torres resuenan con el eco de encantamientos ancestrales.",
      "Construite à flanc de montagne, Tolbana abrite les plus grandes bibliothèques magiques du monde connu. Ses rues vibrent d'énergie et ses tours résonnent de l'écho d'incantations séculaires.", "Costruita sul fianco della montagna, Tolbana ospita le più grandi biblioteche magiche del mondo conosciuto. Le sue strade vibrano di energia e le sue torri risuonano dell'eco di incantesimi secolari."
    ],
  "Massive and wild, this creature watches over the forest. She repels intruders with devastating punches. No words, only the brute force of nature.":
    [
      "Enorme y salvaje, esta criatura vigila el bosque. Repele a los intrusos con golpes devastadores. Sin palabras, solo la fuerza bruta de la naturaleza.",
      "Massive et sauvage, cette créature veille sur la forêt. Elle repousse les intrus à coups dévastateurs. Aucun mot, seulement la force brute de la nature.", "Enorme e selvaggia, questa creatura veglia sulla foresta. Respinge gli intrusi con colpi devastanti. Nessuna parola, solo la forza bruta della natura."
    ],
  "A towering spire watched over by Taurus.": [
    "Una torre imponente vigilada por Taurus.",
    "Une flèche imposante surveillée par Taurus.", "Una guglia imponente vegliata da Taurus."
  ],
  "The Town of Beginnings is a peaceful haven in a still unknown virtual world. This is where every adventure begins.":
    [
      "La Ciudad de los Comienzos es un refugio pacífico en un mundo virtual aún desconocido. Aquí comienza toda aventura.",
      "La Ville des commencements est un havre paisible dans un monde virtuel encore inconnu. C'est ici que commence chaque aventure.", "La Città degli Inizi è un rifugio tranquillo in un mondo virtuale ancora sconosciuto. Qui inizia ogni avventura."
    ],
  "The town of Urbus, a key waypoint in the Map 2 region.": [
    "La ciudad de Urbus, un punto de referencia clave en la región del mapa 2.",
    "La ville d'Urbus, un point de passage essentiel de la région de la carte 2.", "La città di Urbus, un punto di passaggio chiave nella regione della Mappa 2."
  ],
  "A foggy valley where the howls still resonate. It is said that no wolf hunts there alone... Their shadows watch from the heights.":
    [
      "Un valle neblinoso donde aún resuenan los aullidos. Se dice que ningún lobo caza allí solo... Sus sombras vigilan desde las alturas.",
      "Une vallée brumeuse où résonnent encore les hurlements. On dit qu'aucun loup n'y chasse seul... Leurs ombres observent depuis les hauteurs.", "Una valle nebbiosa dove gli ululati risuonano ancora. Si dice che nessun lupo cacci lì da solo... Le loro ombre osservano dall'alto."
    ],
  "Perched at the top of a windy massif, Vallhat watches, silent and isolated. Its heights hide many secrets.": [
    "En lo alto de un macizo azotado por el viento, Vallhat observa en silencio y aislamiento. Sus alturas esconden muchos secretos.",
    "Perchée au sommet d'un massif balayé par le vent, Vallhat observe, silencieuse et isolée. Ses hauteurs cachent de nombreux secrets.", "Arroccata in cima a un massiccio battuto dal vento, Vallhat osserva, silenziosa e isolata. Le sue alture nascondono molti segreti."
  ],
  "A shadowy boss hidden beneath the surface.": [
    "Un jefe sombrío oculto bajo la superficie.",
    "Un boss ténébreux caché sous la surface.", "Un boss oscuro nascosto sotto la superficie."
  ],
  "Calm and mystery surround its troubled waters... A place of meditation, but also of disappearance.": [
    "La calma y el misterio rodean sus aguas turbias... Un lugar de meditación, pero también de desapariciones.",
    "Le calme et le mystère entourent ses eaux troublées... Un lieu de méditation, mais aussi de disparitions.", "La calma e il mistero avvolgono le sue acque torbide... Un luogo di meditazione, ma anche di sparizioni."
  ],
  "A rare boss found in the western areas of Map 2.": [
    "Un jefe raro encontrado en las zonas occidentales del mapa 2.",
    "Un boss rare trouvé dans les régions occidentales de la carte 2.", "Un boss raro trovato nelle zone occidentali della Mappa 2."
  ],
  "A fractured ruin wrapped in red mist where sword skills desync in narrow halls. Parties that clear its upper chambers often hear one extra set of footsteps behind them.":
    [
      "Una ruina fracturada envuelta en niebla roja, donde las habilidades de espada se desincronizan en pasillos estrechos. Los grupos que despejan sus cámaras superiores suelen oír un juego de pasos adicional detrás de ellos.",
      "Une ruine fracturée enveloppée de brume rouge, où les compétences d'épée se désynchronisent dans d'étroits couloirs. Les groupes qui nettoient ses salles supérieures entendent souvent une paire de pas supplémentaire derrière eux.", "Una rovina fratturata avvolta in una nebbia rossa, dove le abilità di spada si desincronizzano nei corridoi stretti. I gruppi che ripuliscono le camere superiori sentono spesso un paio di passi in più dietro di loro."
    ],
  "Lurking in the damp darkness of the dungeon, Yula is a spider feared by adventurers. Its sharp legs and glowing eyes inspire terror in anyone who crosses its path.":
    [
      "Agazapada en la oscuridad húmeda de la mazmorra, Yula es una araña temida por los aventureros. Sus patas afiladas y sus ojos brillantes aterrorizan a cualquiera que se cruce en su camino.",
      "Tapie dans l'obscurité humide du donjon, Yula est une araignée redoutée des aventuriers. Ses pattes acérées et ses yeux lumineux inspirent la terreur à quiconque croise son chemin.", "In agguato nell'oscurità umida del dungeon, Yula è un ragno temuto dagli avventurieri. Le sue zampe affilate e gli occhi luminosi incutono terrore a chiunque incroci il suo cammino."
    ],
  "Solid and sharp, this horn testifies to the brutal strength of the animal.": [
    "Sólido y afilado, este cuerno da fe de la fuerza brutal del animal.",
    "Solide et acérée, cette corne témoigne de la force brutale de l'animal.", "Solido e affilato, questo corno testimonia la forza brutale dell'animale."
  ],
  "A pair of sculpted gloves to catch targets in our webs.": [
    "Unos guantes tallados para atrapar objetivos en nuestras telarañas.",
    "Une paire de gants sculptée pour capturer les cibles dans nos toiles.", "Un paio di guanti scolpiti per catturare i bersagli nelle nostre tele."
  ],
  "A thick piece of shell from a slaughtered Ika tortoise.": [
    "Un trozo grueso de caparazón de una tortuga Ika sacrificada.",
    "Un épais morceau de carapace provenant d'une tortue Ika abattue.", "Un grosso pezzo di guscio di una tartaruga Ika uccisa."
  ],
  "Translucent orange stone with warm tones.": [
    "Piedra naranja translúcida de tonos cálidos.",
    "Pierre orange translucide aux teintes chaleureuses.", "Pietra arancione traslucida dalle tonalità calde."
  ],
  "A bright cat like that of the Lunar Year, bringing luck and prosperity.": [
    "Un gato brillante como el del Año Lunar, que trae suerte y prosperidad.",
    "Un chat lumineux comme celui de l'Année lunaire, apportant chance et prospérité.", "Un gatto luminoso come quello dell'Anno Lunare, che porta fortuna e prosperità."
  ],
  "A pair of pants belonging to Caulette, a rather strong smell emanates from them...": [
    "Unos pantalones pertenecientes a Caulette; desprenden un olor bastante fuerte...",
    "Un pantalon appartenant à Caulette, dont émane une odeur assez forte...", "Un paio di pantaloni appartenuti a Caulette, da cui emana un odore piuttosto forte..."
  ],
  "A very dark mushroom, but not toxic... or so they say!": [
    "Un champiñón muy oscuro, pero no tóxico... ¡o eso dicen!",
    "Un champignon très sombre, mais pas toxique... enfin, c'est ce qu'on dit !", "Un fungo molto scuro, ma non tossico... o almeno così dicono!"
  ],
  "Split blade, wobbly handle, but still good for cutting wood.": [
    "Hoja partida y mango inestable, pero todavía sirve para cortar madera.",
    "Lame fendue et manche branlant, mais toujours utile pour couper du bois.", "Lama spaccata, manico traballante, ma ancora buono per tagliare la legna."
  ],
  "A box of chocolate, in the shape of a heart, for a great love.": [
    "Una caja de chocolate con forma de corazón para un gran amor.",
    "Une boîte de chocolats en forme de cœur pour un grand amour.", "Una scatola di cioccolatini a forma di cuore, per un grande amore."
  ],
  "This applied rune allows equipment to increase its stats.": [
    "Esta runa aplicada permite al equipo aumentar sus estadísticas.",
    "Cette rune appliquée permet à l'équipement d'augmenter ses statistiques.", "Questa runa applicata permette all'equipaggiamento di aumentare le sue statistiche."
  ],
  "A dark rock containing traces of raw coal.": [
    "Una roca oscura que contiene restos de carbón en bruto.",
    "Une roche sombre contenant des traces de charbon brut.", "Una roccia scura contenente tracce di carbone grezzo."
  ],
  "Sculpted by such white fur, woven by resistant threads, sublimated with claws and enchanted by a powerful winter essence.":
    [
      "Tallada con una piel tan blanca, tejida con hilos resistentes, realzada con garras y encantada por una poderosa esencia invernal.",
      "Sculptée dans une fourrure aussi blanche, tissée de fils résistants, sublimée par des griffes et enchantée par une puissante essence hivernale.", "Scolpito in una pelliccia così bianca, tessuto con fili resistenti, impreziosito da artigli e incantato da una potente essenza invernale."
    ],
  "Slip this kit over a damaged tool to restore 100% of its maximum durability.": [
    "Coloca este kit sobre una herramienta dañada para restaurar el 100 % de su durabilidad máxima.",
    "Placez ce kit sur un outil endommagé pour restaurer 100 % de sa durabilité maximale.", "Applica questo kit su uno strumento danneggiato per ripristinare il 100% della sua durabilità massima."
  ],
  "An amulet carved from simple iron, heavy and marked by the wear and tear of time.": [
    "Un amuleto tallado en hierro sencillo, pesado y marcado por el desgaste del tiempo.",
    "Une amulette taillée dans du fer simple, lourde et marquée par l'usure du temps.", "Un amuleto intagliato in ferro semplice, pesante e segnato dall'usura del tempo."
  ],
  "Forged with the copper found on tier 1. The base among the accessories.": [
    "Forjado con el cobre encontrado en el nivel 1. La base entre los accesorios.",
    "Forgé avec le cuivre trouvé au niveau 1. La base parmi les accessoires.", "Forgiato con il rame trovato al Livello 1. La base tra gli accessori."
  ],
  "A simple piece of ancient iron, forged at Tier 1.": [
    "Una simple pieza de hierro antiguo, forjada en el nivel 1.",
    "Une simple pièce de fer ancien, forgée au niveau 1.", "Un semplice pezzo di ferro antico, forgiato al Livello 1."
  ],
  "A pair of polished copper gloves, with a warm sheen and a solidly forged appearance.": [
    "Unos guantes de cobre pulido, con un brillo cálido y un aspecto sólidamente forjado.",
    "Une paire de gants en cuivre poli, au reflet chaleureux et à l'apparence solidement forgée.", "Un paio di guanti di rame lucidato, dalla lucentezza calda e dall'aspetto solidamente forgiato."
  ],
  "Low quality ores, useful for beginning adventures and beginners.": [
    "Minerales de baja calidad, útiles para comenzar la aventura y para principiantes.",
    "Des minerais de basse qualité, utiles pour débuter l'aventure et pour les débutants.", "Minerali di bassa qualità, utili per iniziare l'avventura e per i principianti."
  ],
  "Forged in lightly polished copper, this ring is distinguished by its conductivity and lightness.": [
    "Forjado con cobre ligeramente pulido, este anillo destaca por su conductividad y ligereza.",
    "Forgée dans du cuivre légèrement poli, cette bague se distingue par sa conductivité et sa légèreté.", "Forgiato in rame leggermente lucidato, questo anello si distingue per la conduttività e la leggerezza."
  ],
  "A sturdy string made from a copper alloy, and mixed with spider threads.": [
    "Una cuerda resistente hecha de una aleación de cobre y mezclada con hilos de araña.",
    "Une ficelle robuste fabriquée avec un alliage de cuivre et mélangée à des fils d'araignée.", "Una corda robusta fatta con una lega di rame e mescolata a fili di ragno."
  ],
  "Raw crystal with clean, hard edges.": [
    "Cristal en bruto con bordes limpios y duros.",
    "Cristal brut aux arêtes nettes et dures.", "Cristallo grezzo dai bordi netti e duri."
  ],
  "This bark can be used to break or repel corruption in Tier 2!": [
    "¡Esta corteza puede utilizarse para romper o repeler la corrupción en el nivel 2!",
    "Cette écorce peut servir à briser ou repousser la corruption au niveau 2 !", "Questa corteccia può essere usata per spezzare o respingere la corruzione al Livello 2!"
  ],
  "Traces of corruption emanate from this object.": [
    "Este objeto emana rastros de corrupción.",
    "Des traces de corruption émanent de cet objet.", "Tracce di corruzione emanano da questo oggetto."
  ],
  "A corrupted feather from a corrupted harpy!": [
    "¡Una pluma corrupta de una arpía corrupta!",
    "Une plume corrompue provenant d'une harpie corrompue !", "Una piuma corrotta di un'arpia corrotta!"
  ],
  "A corrupted fragment of unknown origin, but which radiates a mysterious and disturbing energy.": [
    "Un fragmento corrupto de origen desconocido que irradia una energía misteriosa e inquietante.",
    "Un fragment corrompu d'origine inconnue, qui rayonne d'une énergie mystérieuse et inquiétante.", "Un frammento corrotto di origine sconosciuta, che irradia però un'energia misteriosa e inquietante."
  ],
  "This mask corrupted, by a mysterious force, offers powerful power for an important sacrifice.": [
    "Esta máscara, corrompida por una fuerza misteriosa, ofrece un gran poder para un sacrificio importante.",
    "Ce masque, corrompu par une force mystérieuse, offre un grand pouvoir pour un sacrifice important.", "Questa maschera, corrotta da una forza misteriosa, offre un potere potente in cambio di un sacrificio importante."
  ],
  "Forged near a corrupted rift, this belt radiates an insatiable dark force.": [
    "Forjado cerca de una grieta corrupta, este cinturón irradia una fuerza oscura insaciable.",
    "Forgée près d'une faille corrompue, cette ceinture rayonne d'une force sombre insatiable.", "Forgiata vicino a una faglia corrotta, questa cintura irradia una forza oscura insaziabile."
  ],
  "Forged on the edge of a rift where light is torn apart, these gloves absorb hatred and return it with merciless blows.":
    [
      "Forjados al borde de una grieta donde la luz se desgarra, estos guantes absorben el odio y lo devuelven con golpes implacables.",
      "Forgés au bord d'une faille où la lumière se déchire, ces gants absorbent la haine et la renvoient par des coups impitoyables.", "Forgiati sull'orlo di una faglia dove la luce si lacera, questi guanti assorbono l'odio e lo restituiscono con colpi implacabili."
    ],
  "Forged in the heart of a corrupted rift, this necklace pulses with unstable and voracious magic.": [
    "Forjado en el corazón de una grieta corrupta, este collar palpita con una magia inestable y voraz.",
    "Forgé au cœur d'une faille corrompue, ce collier palpite d'une magie instable et vorace.", "Forgiata nel cuore di una faglia corrotta, questa collana pulsa di magia instabile e vorace."
  ],
  "A strange spore imbued with corruption...": [
    "Una espora extraña imbuida de corrupción...",
    "Une spore étrange imprégnée de corruption...", "Una spora strana, impregnata di corruzione..."
  ],
  "A rudimentary pickaxe, fragile but sufficient to get started.": [
    "Un pico rudimentario, frágil pero suficiente para empezar.",
    "Une pioche rudimentaire, fragile mais suffisante pour commencer.", "Un piccone rudimentale, fragile ma sufficiente per iniziare."
  ],
  "A refined crossbow with crimson accents, designed with a festive and romantic aesthetic.": [
    "Una ballesta refinada con detalles carmesí, diseñada con una estética festiva y romántica.",
    "Une arbalète raffinée aux accents cramoisis, conçue dans une esthétique festive et romantique.", "Una balestra raffinata con accenti cremisi, progettata con un'estetica festosa e romantica."
  ],
  "This crumpled book holds secrets that no one in Aincrad has ever heard of!": [
    "¡Este libro arrugado guarda secretos que nadie en Aincrad ha oído jamás!",
    "Ce livre froissé renferme des secrets dont personne à Aincrad n'a jamais entendu parler !", "Questo libro stropicciato custodisce segreti di cui nessuno ad Aincrad ha mai sentito parlare!"
  ],
  "Imbued with the crystallized essence of bees, this armor protects the mage while channeling his magical energy.": [
    "Imbuida de la esencia cristalizada de las abejas, esta armadura protege al mago mientras canaliza su energía mágica.",
    "Imprégnée de l'essence cristallisée des abeilles, cette armure protège le mage tout en canalisant son énergie magique.", "Impregnata dell'essenza cristallizzata delle api, questa armatura protegge il mago mentre canalizza la sua energia magica."
  ],
  "A beautiful dagger forged using fragments of real Nodachi. However, it is now just a relic.": [
    "Una hermosa daga forjada con fragmentos de un Nodachi real. Sin embargo, ahora no es más que una reliquia.",
    "Une belle dague forgée avec des fragments d'un véritable Nodachi. Cependant, ce n'est plus qu'une relique.", "Un bellissimo pugnale forgiato con frammenti di un vero Nodachi. Tuttavia, ora non è più che una reliquia."
  ],
  "Sharp and formidable, this giant bee stinger is a material of choice for making armor-piercing equipment.": [
    "Afilado y formidable, este aguijón de abeja gigante es un material ideal para fabricar equipo perforante.",
    "Tranchant et redoutable, ce dard d'abeille géante est un matériau de choix pour fabriquer de l'équipement perforant.", "Affilato e formidabile, questo pungiglione di ape gigante è un materiale d'elezione per fabbricare equipaggiamento perforante."
  ],
  "A tough, blackened bone, the remnant of an ancient and corrupted skeleton.": [
    "Un hueso duro y ennegrecido, resto de un esqueleto antiguo y corrupto.",
    "Un os durci et noirci, vestige d'un squelette ancien et corrompu.", "Un osso duro e annerito, resto di uno scheletro antico e corrotto."
  ],
  "A dark branch of the woods.": ["Una rama oscura de los bosques.", "Une branche sombre des bois.", "Un ramo oscuro dei boschi."],
  "A dark mixture of ancient materials lost in a great labyrinth. It could be a grim reaper's grimoire.": [
    "Una mezcla oscura de materiales antiguos perdida en un gran laberinto. Podría ser el grimorio de un segador.",
    "Un mélange sombre de matériaux anciens perdu dans un grand labyrinthe. Il pourrait s'agir du grimoire d'un faucheur.", "Una miscela oscura di materiali antichi persa in un grande labirinto. Potrebbe essere il grimorio di un mietitore."
  ],
  "A dark and quite mysterious glow.": [
    "Un resplandor oscuro y bastante misterioso.",
    "Une lueur sombre et assez mystérieuse.", "Un bagliore oscuro e piuttosto misterioso."
  ],
  "A belt made from deer skins.": [
    "Un cinturón hecho de pieles de ciervo.",
    "Une ceinture fabriquée avec des peaux de cerf.", "Una cintura fatta con pelli di cervo."
  ],
  "A bracelet made from wolf fangs and deer skins.": [
    "Un brazalete hecho de colmillos de lobo y pieles de ciervo.",
    "Un bracelet fabriqué avec des crocs de loup et des peaux de cerf.", "Un bracciale fatto di zanne di lupo e pelli di cervo."
  ],
  "It vibrates to the pulse of the allies, as if it was still looking for a machine to keep alive.": [
    "Vibra al ritmo de los aliados, como si aún buscara una máquina que mantener con vida.",
    "Il vibre au rythme des alliés, comme s'il cherchait encore une machine à maintenir en vie.", "Vibra al ritmo degli alleati, come se stesse ancora cercando una macchina da mantenere in vita."
  ],
  "A dense and resistant feather, imbued with perfect telluric force.": [
    "Una pluma densa y resistente, imbuida de una fuerza telúrica perfecta.",
    "Une plume dense et résistante, imprégnée d'une force tellurique parfaite.", "Una piuma densa e resistente, impregnata di una forza tellurica perfetta."
  ],
  "A spider egg cocoon.": ["Un capullo de huevos de araña.", "Un cocon d'œufs d'araignée.", "Un bozzolo di uova di ragno."],
  "Small scrap metal, with other ingredients it is possible to make Enchanted Metal Ingots.": [
    "Pequeño fragmento de chatarra; con otros ingredientes es posible fabricar lingotes de metal encantado.",
    "Petit morceau de ferraille ; avec d'autres ingrédients, il est possible de fabriquer des lingots de métal enchanté.", "Piccoli rottami di metallo; con altri ingredienti è possibile fabbricare lingotti di metallo incantato."
  ],
  "An essence from the Sylnovars.": ["Una esencia de los Sylnovars.", "Une essence des Sylnovars.", "Un'essenza dei Sylnovar."],
  "An essence from the Sylvaers.": ["Una esencia de los Sylvaers.", "Une essence des Sylvaers.", "Un'essenza dei Sylvaer."],
  "Event exchange currency [Earth Leveling].": [
    "Moneda de intercambio del evento [Earth Leveling].",
    "Monnaie d'échange de l'événement [Earth Leveling].", "Valuta di scambio dell'evento [Earth Leveling]."
  ],
  "A Legendary Artifact enchanted by the magic of Taurus, this artifact evolved to correspond to King Taurus. Slot: artefact":
    [
      "Un artefacto legendario encantado por la magia de Taurus; este artefacto evolucionó hasta corresponder al rey Taurus. Ranura: artefacto",
      "Un artefacte légendaire enchanté par la magie de Taurus ; cet artefacte a évolué pour correspondre au roi Taurus. Emplacement : artefact", "Un Artefatto leggendario incantato dalla magia di Taurus; questo artefatto si è evoluto fino a corrispondere al re Taurus. Slot: artefatto"
    ],
  "A Support Crystal for Mana regeneration and Mages.": [
    "Un cristal de apoyo para la regeneración de maná y los magos.",
    "Un cristal de soutien pour la régénération de mana et les mages.", "Un Cristallo di supporto per la rigenerazione del mana e i maghi."
  ],
  "A Support Crystal for Stamina Regeneration and Melee Classes.": [
    "Un cristal de apoyo para la regeneración de resistencia y las clases cuerpo a cuerpo.",
    "Un cristal de soutien pour la régénération d'endurance et les classes de corps à corps.", "Un Cristallo di supporto per la rigenerazione della stamina e le classi da mischia."
  ],
  "A bracelet forged in the darkness of Wolnir's tomb imbued with bone dust and the cursed power of the Marauder.": [
    "Un brazalete forjado en la oscuridad de la tumba de Wolnir, imbuido de polvo de hueso y del poder maldito del Merodeador.",
    "Un bracelet forgé dans l'obscurité du tombeau de Wolnir, imprégné de poussière d'os et du pouvoir maudit du Maraudeur.", "Un bracciale forgiato nell'oscurità della tomba di Wolnir, impregnato di polvere d'ossa e del potere maledetto del Predone."
  ],
  "A cloudy drink with green and silver reflections.": [
    "Una bebida turbia con reflejos verdes y plateados.",
    "Une boisson trouble aux reflets verts et argentés.", "Una bevanda torbida dai riflessi verdi e argentei."
  ],
  "A damaged piece of leather once worn by Bandits. It remains usable.": [
    "Un trozo de cuero dañado que antaño llevaban los bandidos. Sigue siendo utilizable.",
    "Un morceau de cuir endommagé autrefois porté par les bandits. Il reste utilisable.", "Un pezzo di cuoio danneggiato, un tempo indossato dai banditi. Resta utilizzabile."
  ],
  "A fairly rare loot from the Treant Warrior. Useful if you need to make potions.": [
    "Un botín bastante raro del guerrero treant. Útil si necesitas fabricar pociones.",
    "Un butin assez rare du guerrier tréant. Utile si vous devez fabriquer des potions.", "Un bottino piuttosto raro del guerriero treant. Utile se devi preparare pozioni."
  ],
  "A glowing potion that pulses with physical energy.": [
    "Una poción luminosa que palpita con energía física.",
    "Une potion lumineuse qui palpite d'énergie physique.", "Una pozione luminosa che pulsa di energia fisica."
  ],
  "A heavy sword covered in icy patterns whose blade always seems cold.": [
    "Una espada pesada cubierta de patrones helados cuya hoja siempre parece fría.",
    "Une épée lourde couverte de motifs glacés dont la lame semble toujours froide.", "Una spada pesante coperta di motivi ghiacciati, la cui lama sembra sempre fredda."
  ],
  "A long Dark dagger, forged with magical shards and other loot. She becomes formidable.": [
    "Una daga larga y oscura, forjada con fragmentos mágicos y otros botines. Se vuelve formidable.",
    "Une dague longue et sombre, forgée avec des éclats magiques et d'autres butins. Elle devient redoutable.", "Un pugnale lungo e oscuro, forgiato con frammenti magici e altro bottino. Diventa formidabile."
  ],
  "A long, sharp tooth, prized by some craftsmen.": [
    "Un diente largo y afilado, apreciado por algunos artesanos.",
    "Une dent longue et pointue, prisée par certains artisans.", "Un dente lungo e affilato, apprezzato da alcuni artigiani."
  ],
  "A massive shield decorated with winter symbols, covered in gifts.": [
    "Un escudo enorme decorado con símbolos invernales y cubierto de regalos.",
    "Un bouclier massif décoré de symboles hivernaux et couvert de cadeaux.", "Uno scudo massiccio decorato con simboli invernali e coperto di regali."
  ],
  "A mystical potion with blue vapors and ancient runes.": [
    "Una poción mística con vapores azules y runas antiguas.",
    "Une potion mystique aux vapeurs bleues et aux runes anciennes.", "Una pozione mistica con vapori blu e rune antiche."
  ],
  "A mythical legacy of a vanquished dragon, whose corruption strengthens him Slot: Amulet": [
    "Un legado mítico de un dragón vencido, cuya corrupción lo fortalece. Ranura: amuleto",
    "Un héritage mythique d'un dragon vaincu, dont la corruption le renforce. Emplacement : amulette", "Un'eredità mitica di un drago sconfitto, la cui corruzione lo rafforza. Slot: amuleto"
  ],
  "A nourishing green potion that strengthens the body": [
    "Una poción verde nutritiva que fortalece el cuerpo.",
    "Une potion verte nourrissante qui renforce le corps.", "Una pozione verde nutriente che rafforza il corpo."
  ],
  "A pair of carved gloves to serve young antlers.": [
    "Un par de guantes tallados para manipular cornamentas jóvenes.",
    "Une paire de gants sculptés pour manipuler de jeunes bois.", "Un paio di guanti intagliati per servire i giovani palchi."
  ],
  "A pair of gloves made from the skin of bulls, located on level 2": [
    "Un par de guantes hechos con piel de toro; se encuentran en el nivel 2.",
    "Une paire de gants fabriqués avec de la peau de taureau ; ils se trouvent au niveau 2.", "Un paio di guanti fatti con la pelle dei tori, disponibili al Livello 2."
  ],
  "A pair of gloves made from wolf gear; their aura inspires even greater violence.": [
    "Un par de guantes hechos con equipo de lobo; su aura inspira una violencia aún mayor.",
    "Une paire de gants fabriqués à partir d'équipement de loup ; leur aura inspire une violence encore plus grande.", "Un paio di guanti fatti con l'equipaggiamento del lupo; la loro aura ispira una violenza ancora maggiore."
  ],
  "A pair of gloves sculpted to provide agility and assist with certain maneuvers.": [
    "Un par de guantes diseñados para aportar agilidad y ayudar en ciertas maniobras.",
    "Une paire de gants conçus pour apporter de l'agilité et faciliter certaines manœuvres.", "Un paio di guanti scolpiti per donare agilità e aiutare in certe manovre."
  ],
  "A pair of wolf skin gloves, with a nefarious aura that inspires bloodlust.": [
    "Un par de guantes de piel de lobo, con un aura nefasta que inspira sed de sangre.",
    "Une paire de gants en peau de loup, à l'aura néfaste qui inspire la soif de sang.", "Un paio di guanti di pelle di lupo, dall'aura nefasta che ispira sete di sangue."
  ],
  "A potion with silver shards that sharpens reflexes.": [
    "Una poción con fragmentos plateados que agudiza los reflejos.",
    "Une potion aux éclats argentés qui aiguise les réflexes.", "Una pozione con schegge argentate che affina i riflessi."
  ],
  "A rudimentary tool for herbs and plants.": [
    "Una herramienta rudimentaria para hierbas y plantas.",
    "Un outil rudimentaire pour les herbes et les plantes.", "Uno strumento rudimentale per erbe e piante."
  ],
  "A rudimentary torch, but sufficient to illuminate.": [
    "Una antorcha rudimentaria, pero suficiente para iluminar.",
    "Une torche rudimentaire, mais suffisante pour éclairer.", "Una torcia rudimentale, ma sufficiente per illuminare."
  ],
  "A simple belt built for dependable use.": [
    "Un cinturón sencillo diseñado para un uso fiable.",
    "Une ceinture simple conçue pour une utilisation fiable.", "Una cintura semplice, costruita per un uso affidabile."
  ],
  "A simple belt, quite clean despite everything.": [
    "Un cinturón sencillo, bastante limpio a pesar de todo.",
    "Une ceinture simple, assez propre malgré tout.", "Una cintura semplice, piuttosto pulita nonostante tutto."
  ],
  "A simple grain growing in abandoned fields.": [
    "Un grano sencillo que crece en campos abandonados.",
    "Un simple grain qui pousse dans les champs abandonnés.", "Un semplice chicco di grano che cresce nei campi abbandonati."
  ],
  "A soft and light fur, used to make armor.": [
    "Una piel suave y ligera, utilizada para fabricar armaduras.",
    "Une fourrure douce et légère, utilisée pour fabriquer des armures.", "Una pelliccia morbida e leggera, usata per fabbricare armature."
  ],
  "A strange and mysterious will-o'-the-wisp floating in the air, illuminating the surrounding darkness. Slot: artefact":
    [
      "Un fuego fatuo extraño y misterioso que flota en el aire e ilumina la oscuridad circundante. Ranura: artefacto",
      "Un feu follet étrange et mystérieux flottant dans les airs, illuminant les ténèbres environnantes. Emplacement : artefact", "Uno strano e misterioso fuoco fatuo che fluttua nell'aria, illuminando l'oscurità circostante. Slot: artefatto"
    ],
  "A strange ring, covered with a thin slimy layer. Not very elegant, but it pulses with unusual energy.": [
    "Un anillo extraño, cubierto por una fina capa viscosa. No es muy elegante, pero palpita con una energía inusual.",
    "Un anneau étrange, recouvert d'une fine couche visqueuse. Peu élégant, mais il palpite d'une énergie inhabituelle.", "Un anello strano, coperto da un sottile strato viscido. Poco elegante, ma pulsa di un'energia inusuale."
  ],
  "A sturdy amethyst bracelet built to withstand enemy blows.": [
    "Un brazalete de amatista resistente, construido para soportar los golpes enemigos.",
    "Un bracelet en améthyste robuste, conçu pour encaisser les coups ennemis.", "Un bracciale di ametista robusto, costruito per reggere i colpi dei nemici."
  ],
  "A tenacious and robust amulet to face the unforeseen events of nature.": [
    "Un amuleto tenaz y robusto para afrontar los imprevistos de la naturaleza.",
    "Une amulette tenace et robuste pour affronter les imprévus de la nature.", "Un amuleto tenace e robusto per affrontare gli imprevisti della natura."
  ],
  "A tenacious and robust bracelet to embrace and immobilize enemies.": [
    "Un brazalete tenaz y robusto para atrapar e inmovilizar a los enemigos.",
    "Un bracelet tenace et robuste pour enlacer et immobiliser les ennemis.", "Un bracciale tenace e robusto per avvolgere e immobilizzare i nemici."
  ],
  "A tenacious and sturdy amulet to easily steal from enemies.": [
    "Un amuleto tenaz y resistente para robar fácilmente a los enemigos.",
    "Une amulette tenace et solide pour voler facilement les ennemis.", "Un amuleto tenace e resistente per derubare facilmente i nemici."
  ],
  "A tenacious and sturdy bracelet to easily steal from your enemies. Slot: bracelet": [
    "Un brazalete tenaz y resistente para robar fácilmente a tus enemigos. Ranura: brazalete",
    "Un bracelet tenace et solide pour voler facilement vos ennemis. Emplacement : bracelet", "Un bracciale tenace e resistente per derubare facilmente i tuoi nemici. Slot: bracciale"
  ],
  "A thick potion with solid minerals for the skin": [
    "Una poción espesa con minerales sólidos para la piel.",
    "Une potion épaisse aux minéraux solides pour la peau.", "Una pozione densa con minerali solidi per la pelle."
  ],
  "A timber wolf claw.": ["Una garra de lobo de madera.", "Une griffe de loup de bois.", "Un artiglio di lupo dei boschi."],
  "A tricolor necklace, inspiring the terror of harpies.": [
    "Un collar tricolor que inspira el terror de las arpías.",
    "Un collier tricolore qui inspire la terreur des harpies.", "Una collana tricolore, che ispira il terrore delle arpie."
  ],
  "A twig of the Sylvester Mage, this staff can be used as a base for a magic weapon.": [
    "Una ramita del mago Sylvester; este bastón puede usarse como base para un arma mágica.",
    "Une brindille du mage Sylvester ; ce bâton peut servir de base à une arme magique.", "Un ramoscello del mago Sylvester; questo bastone può essere usato come base per un'arma magica."
  ],
  "A very hard, almost unbreakable resource, Warriors will be able to protect themselves with it.": [
    "Un recurso muy duro, casi irrompible; los guerreros podrán protegerse con él.",
    "Une ressource très dure, presque incassable ; les guerriers pourront s'en protéger.", "Una risorsa molto dura, quasi indistruttibile: i guerrieri potranno proteggersi con essa."
  ],
  "A very light, discreet and dirty hood.": [
    "Una capucha muy ligera, discreta y sucia.",
    "Une capuche très légère, discrète et sale.", "Un cappuccio molto leggero, discreto e sporco."
  ],
  "A white spider powder.": ["Un polvo de araña blanca.", "Une poudre d'araignée blanche.", "Una polvere di ragno bianco."],
  "A white spider thread.": ["Un hilo de araña blanca.", "Un fil d'araignée blanche.", "Un filo di ragno bianco."],
  "A wild knife from the woods and quite sharp.": [
    "Un cuchillo salvaje de los bosques y bastante afilado.",
    "Un couteau sauvage venu des bois et plutôt tranchant.", "Un coltello selvaggio dei boschi, piuttosto affilato."
  ],
  "A wobbly and dilapidated fishing rod, but fit for fishing.": [
    "Una caña de pescar tambaleante y ruinosa, pero apta para pescar.",
    "Une canne à pêche branlante et délabrée, mais bonne pour pêcher.", "Una canna da pesca traballante e fatiscente, ma buona per pescare."
  ],
  "A yellow spider carcass.": ["Un cadáver de araña amarilla.", "Une carcasse d'araignée jaune.", "Il cadavere di un ragno giallo."],
  "A yellow spider thread.": ["Un hilo de araña amarilla.", "Un fil d'araignée jaune.", "Un filo di ragno giallo."],
  "Allows you to have a Bandit Key.": [
    "Te permite obtener una llave de bandido.",
    "Vous permet d'obtenir une clé de bandit.", "Permette di ottenere una chiave del bandito."
  ],
  "Allows you to learn the recipe: [Fragrant Stew].": [
    "Te permite aprender la receta: [Estofado aromático].",
    "Vous permet d'apprendre la recette : [Ragoût parfumé].", "Permette di imparare la ricetta: [Stufato profumato]."
  ],
  "An arch carved from winter wood and linked to the joys of children during the winter holidays.": [
    "Un arco tallado en madera invernal y vinculado a la alegría de los niños durante las fiestas de invierno.",
    "Un arc sculpté dans du bois hivernal et lié à la joie des enfants pendant les fêtes d'hiver.", "Un arco intagliato nel legno invernale e legato alla gioia dei bambini durante le festività invernali."
  ],
  "An ax belonging to a violent tribe.": [
    "Un hacha que pertenece a una tribu violenta.",
    "Une hache appartenant à une tribu violente.", "Un'ascia appartenente a una tribù violenta."
  ],
  "An egg from a harpy... Is it perhaps hiding a newborn?": [
    "Un huevo de arpía... ¿Esconde quizá a un recién nacido?",
    "Un œuf de harpie... Cache-t-il peut-être un nouveau-né ?", "Un uovo di arpia... Nasconde forse un neonato?"
  ],
  "An imposing hammer with a winter head seemingly carved from children's gifts.": [
    "Un martillo imponente con una cabeza invernal aparentemente tallada en los regalos de los niños.",
    "Un marteau imposant à la tête hivernale apparemment sculptée dans les cadeaux des enfants.", "Un martello imponente con una testa invernale apparentemente scolpita nei regali dei bambini."
  ],
  "Ancient staff from the cursed ruins, still alive with the flame of the dead.": [
    "Un bastón antiguo de las ruinas malditas, aún vivo con la llama de los muertos.",
    "Un bâton ancien des ruines maudites, encore vivant de la flamme des morts.", "Bastone antico delle rovine maledette, ancora vivo della fiamma dei morti."
  ],
  "Artifact of Protector Bia, used during rituals opening access to the Tier boss: Asterius!": [
    "Artefacto del protector Bia, usado en los rituales que abren el acceso al jefe de nivel: ¡Asterius!",
    "Artefacte du protecteur Bia, utilisé lors des rituels ouvrant l'accès au boss de palier : Asterius !", "Artefatto del protettore Bia, usato nei rituali che aprono l'accesso al boss di livello: Asterius!"
  ],
  "Artifact of Protector Tano, used during rituals opening access to the Tier boss: Asterius!": [
    "Artefacto del protector Tano, usado en los rituales que abren el acceso al jefe de nivel: ¡Asterius!",
    "Artefacte du protecteur Tano, utilisé lors des rituels ouvrant l'accès au boss de palier : Asterius !", "Artefatto del protettore Tano, usato nei rituali che aprono l'accesso al boss di livello: Asterius!"
  ],
  "Artifact of Protector Yaa, used during rituals opening access to the Tier boss: Asterius!": [
    "Artefacto del protector Yaa, usado en los rituales que abren el acceso al jefe de nivel: ¡Asterius!",
    "Artefacte du protecteur Yaa, utilisé lors des rituels ouvrant l'accès au boss de palier : Asterius !", "Artefatto del protettore Yaa, usato nei rituali che aprono l'accesso al boss di livello: Asterius!"
  ],
  "Ax having taken the lives of many lives. Slot: artefact": [
    "Un hacha que ha segado muchas vidas. Ranura: artefacto",
    "Une hache ayant ôté bien des vies. Emplacement : artefact", "Un'ascia che ha tolto molte vite. Slot: artefatto"
  ],
  "Barely protects against a blade, but it's still better than nothing": [
    "Apenas protege contra una hoja, pero sigue siendo mejor que nada.",
    "Protège à peine contre une lame, mais c'est toujours mieux que rien.", "Protegge a malapena da una lama, ma è comunque meglio di niente."
  ],
  "Base Endurance Fortifier entry. No acquisition data was provided.": [
    "Registro base del fortalecedor de resistencia. No se proporcionaron datos de obtención.",
    "Entrée de base du fortifiant d'endurance. Aucune donnée d'obtention n'a été fournie.", "Voce base del Rinforzante di stamina. Non sono stati forniti dati di ottenimento."
  ],
  "Bauxite ore, rich in aluminum. Perfect for forging lightweight and durable tools.": [
    "Mineral de bauxita, rico en aluminio. Perfecto para forjar herramientas ligeras y resistentes.",
    "Minerai de bauxite, riche en aluminium. Parfait pour forger des outils légers et durables.", "Minerale di bauxite, ricco di alluminio. Perfetto per forgiare strumenti leggeri e durevoli."
  ],
  "Birch bark, torn by time.": [
    "Corteza de abedul, desgarrada por el tiempo.",
    "Écorce de bouleau, déchirée par le temps.", "Corteccia di betulla, lacerata dal tempo."
  ],
  "Black spider venom.": ["Veneno de araña negra.", "Venin d'araignée noire.", "Veleno di ragno nero."],
  "Black, smooth stone with a deep polish.": [
    "Piedra negra y lisa de pulido profundo.",
    "Pierre noire et lisse au poli profond.", "Pietra nera e liscia, dalla lucidatura profonda."
  ],
  "Blade sharp, piercing, and powerful like the spell of an angry necromancer.": [
    "Una hoja afilada, penetrante y poderosa como el hechizo de un nigromante enfurecido.",
    "Une lame affûtée, perçante et puissante comme le sort d'un nécromancien en colère.", "Lama affilata, perforante e potente come l'incantesimo di un negromante infuriato."
  ],
  "Blade sharp, piercing, and powerful like the stinger of an angry bee.": [
    "Una hoja afilada, penetrante y poderosa como el aguijón de una abeja enfurecida.",
    "Une lame affûtée, perçante et puissante comme le dard d'une abeille en colère.", "Lama affilata, perforante e potente come il pungiglione di un'ape infuriata."
  ],
  "Board worked in a sawmill, perfect for certain productions.": [
    "Tabla trabajada en un aserradero, perfecta para ciertas producciones.",
    "Planche travaillée en scierie, parfaite pour certaines productions.", "Tavola lavorata in segheria, perfetta per certe produzioni."
  ],
  "Bone residue reduced to powder. Serves as a catalyst for life potions.": [
    "Residuo de hueso reducido a polvo. Sirve como catalizador para las pociones de vida.",
    "Résidu d'os réduit en poudre. Sert de catalyseur pour les potions de vie.", "Residuo d'osso ridotto in polvere. Serve da catalizzatore per le pozioni di vita."
  ],
  "Boost Weapon Damage by 10% and apply a 30min cooldown to all crystals.": [
    "Aumenta el daño del arma un 10 % y aplica 30 min de enfriamiento a todos los cristales.",
    "Augmente les dégâts d'arme de 10 % et applique 30 min de temps de recharge à tous les cristaux.", "Aumenta il danno dell'arma del 10% e applica 30 minuti di ricarica a tutti i cristalli."
  ],
  "Boots as durable as large amethyst shards. Slot: artefact": [
    "Botas tan resistentes como grandes fragmentos de amatista. Ranura: artefacto",
    "Des bottes aussi résistantes que de grands éclats d'améthyste. Emplacement : artefact", "Stivali durevoli come grandi schegge di ametista. Slot: artefatto"
  ],
  "Boots as intangible as what they represent.": [
    "Botas tan intangibles como aquello que representan.",
    "Des bottes aussi intangibles que ce qu'elles représentent.", "Stivali intangibili come ciò che rappresentano."
  ],
  "Boots as intangible as what they represent. Slot: artefact": [
    "Botas tan intangibles como aquello que representan. Ranura: artefacto",
    "Des bottes aussi intangibles que ce qu'elles représentent. Emplacement : artefact", "Stivali intangibili come ciò che rappresentano. Slot: artefatto"
  ],
  "Boots as mysterious and enigmatic as the mist.": [
    "Botas tan misteriosas y enigmáticas como la bruma.",
    "Des bottes aussi mystérieuses et énigmatiques que la brume.", "Stivali misteriosi ed enigmatici come la nebbia."
  ],
  "Boots as wild as the woods that surround them.": [
    "Botas tan salvajes como los bosques que las rodean.",
    "Des bottes aussi sauvages que les bois qui les entourent.", "Stivali selvaggi come i boschi che li circondano."
  ],
  "Boots for adventurers, very useful for walking.": [
    "Botas para aventureros, muy útiles para caminar.",
    "Des bottes pour aventuriers, très utiles pour marcher.", "Stivali per avventurieri, molto utili per camminare."
  ],
  "Boots for explorers, incredible for walking. Slot: artefact": [
    "Botas para exploradores, increíbles para caminar. Ranura: artefacto",
    "Des bottes pour explorateurs, incroyables pour marcher. Emplacement : artefact", "Stivali per esploratori, incredibili per camminare. Slot: artefatto"
  ],
  "Boots from the web faction, dangerous like a spider.": [
    "Botas de la facción de la telaraña, peligrosas como una araña.",
    "Des bottes de la faction de la toile, dangereuses comme une araignée.", "Stivali della fazione della ragnatela, pericolosi come un ragno."
  ],
  "Boots linked by the woods and nature. Slot: artefact": [
    "Botas vinculadas a los bosques y a la naturaleza. Ranura: artefacto",
    "Des bottes liées aux bois et à la nature. Emplacement : artefact", "Stivali legati ai boschi e alla natura. Slot: artefatto"
  ],
  "Boots loosely bound by the dark power of the woods.": [
    "Botas apenas ligadas por el poder oscuro de los bosques.",
    "Des bottes faiblement liées par le pouvoir sombre des bois.", "Stivali appena legati dal potere oscuro dei boschi."
  ],
  "Boots made from large spider webs.": [
    "Botas hechas con grandes telarañas.",
    "Des bottes fabriquées à partir de grandes toiles d'araignée.", "Stivali fatti con grandi ragnatele."
  ],
  "Boots that are quite mischievous and warlike in nature.": [
    "Botas de naturaleza bastante traviesa y belicosa.",
    "Des bottes à la nature assez espiègle et guerrière.", "Stivali dalla natura piuttosto dispettosa e guerriera."
  ],
  "Boots that breathe... Slot: artefact": [
    "Botas que respiran... Ranura: artefacto",
    "Des bottes qui respirent... Emplacement : artefact", "Stivali che respirano... Slot: artefatto"
  ],
  "Boots woven by intangible materials.": [
    "Botas tejidas con materiales intangibles.",
    "Des bottes tissées de matériaux intangibles.", "Stivali tessuti con materiali intangibili."
  ],
  "Boots woven by intangible materials. Slot: artefact": [
    "Botas tejidas con materiales intangibles. Ranura: artefacto",
    "Des bottes tissées de matériaux intangibles. Emplacement : artefact", "Stivali tessuti con materiali intangibili. Slot: artefatto"
  ],
  "Bow created using Nodachite fragments and ores. Powerful, but it's still just a relic for now.": [
    "Arco creado con fragmentos y minerales de nodachita. Poderoso, pero por ahora solo es una reliquia.",
    "Arc créé à partir de fragments et de minerais de nodachite. Puissant, mais ce n'est encore qu'une relique pour l'instant.", "Arco creato con frammenti e minerali di nodachite. Potente, ma per ora non è che una reliquia."
  ],
  "Bracelet cut from a frozen crystal, it retains the eternal cold of the ice mini-boss.": [
    "Un brazalete tallado en un cristal congelado que conserva el frío eterno del mini-jefe de hielo.",
    "Un bracelet taillé dans un cristal gelé qui conserve le froid éternel du mini-boss de glace.", "Un bracciale tagliato da un cristallo gelato, che conserva il freddo eterno del mini-boss di ghiaccio."
  ],
  "Bracelet of the Cursed Guardian of the Blue Mist Forest. It shines like a tree.": [
    "Brazalete del guardián maldito del Bosque de Niebla Azul. Brilla como un árbol.",
    "Bracelet du gardien maudit de la Forêt de Brume Bleue. Il brille comme un arbre.", "Bracciale del guardiano maledetto della Foresta della Nebbia Blu. Brilla come un albero."
  ],
  "Bracelet of the demon Krampus, terror and sworn enemy of Santa Claus.": [
    "Brazalete del demonio Krampus, terror y enemigo jurado de Papá Noel.",
    "Bracelet du démon Krampus, terreur et ennemi juré du Père Noël.", "Bracciale del demone Krampus, terrore e nemico giurato di Babbo Natale."
  ],
  "Braided during a nocturnal ceremony of the Circle, it marks membership in the Eclipse.": [
    "Trenzado durante una ceremonia nocturna del Círculo, marca la pertenencia al Eclipse.",
    "Tressé lors d'une cérémonie nocturne du Cercle, il marque l'appartenance à l'Éclipse.", "Intrecciato durante una cerimonia notturna del Circolo, segna l'appartenenza all'Eclissi."
  ],
  "Brown spider eyes.": ["Ojos de araña marrón.", "Yeux d'araignée brune.", "Occhi di ragno marrone."],
  "Brown spider venom.": ["Veneno de araña marrón.", "Venin d'araignée brune.", "Veleno di ragno marrone."],
  "Can be used to access the dungeon: Forgotten Tomb.": [
    "Se puede usar para acceder a la mazmorra: Tumba Olvidada.",
    "Peut être utilisé pour accéder au donjon : Tombeau Oublié.", "Può essere usato per accedere al dungeon: Tomba Dimenticata."
  ],
  "Can be used to access the dungeon: Labyrinth of the Fallen.": [
    "Se puede usar para acceder a la mazmorra: Laberinto de los Caídos.",
    "Peut être utilisé pour accéder au donjon : Labyrinthe des Déchus.", "Può essere usato per accedere al dungeon: Labirinto dei Caduti."
  ],
  "Carved from an alloy of metal and jelly, this ring is squishy and solid to the touch.": [
    "Tallado en una aleación de metal y gelatina, este anillo es blando y sólido al tacto.",
    "Taillé dans un alliage de métal et de gelée, cet anneau est mou et solide au toucher.", "Intagliato in una lega di metallo e gelatina, questo anello è morbido e solido al tatto."
  ],
  "Carved from ancient wood and reinforced by magical stones, it seems in harmony with the swamp.": [
    "Tallado en madera antigua y reforzado con piedras mágicas, parece estar en armonía con el pantano.",
    "Taillé dans du bois ancien et renforcé par des pierres magiques, il semble en harmonie avec le marais.", "Intagliato nel legno antico e rinforzato da pietre magiche, sembra in armonia con la palude."
  ],
  "Clear spider venom.": ["Veneno de araña transparente.", "Venin d'araignée translucide.", "Veleno di ragno trasparente."],
  "Club of the little slaves of Illfang. It can inflict heavy damage!": [
    "Garrote de los pequeños esclavos de Illfang. ¡Puede infligir un daño considerable!",
    "Massue des petits esclaves d'Illfang. Elle peut infliger de lourds dégâts !", "Clava dei piccoli schiavi di Illfang. Può infliggere danni pesanti!"
  ],
  "Colossal Guardian's weapon of destruction. This hammer is powerful but heavy.": [
    "El arma de destrucción del guardián colosal. Este martillo es poderoso pero pesado.",
    "L'arme de destruction du gardien colossal. Ce marteau est puissant mais lourd.", "L'arma di distruzione del guardiano colossale. Questo martello è potente ma pesante."
  ],
  "Core imbued with slime magic. Used in making magic accessories.": [
    "Núcleo imbuido de magia de limo. Se usa para fabricar accesorios mágicos.",
    "Noyau imprégné de magie de slime. Sert à fabriquer des accessoires magiques.", "Nucleo impregnato di magia di melma. Usato per fabbricare accessori magici."
  ],
  "Covered in scratches and blood, created to protect the followers. Slot: bracelet": [
    "Cubierto de arañazos y sangre, creado para proteger a los seguidores. Ranura: brazalete",
    "Couvert de griffures et de sang, créé pour protéger les fidèles. Emplacement : bracelet", "Coperto di graffi e sangue, creato per proteggere i seguaci. Slot: bracciale"
  ],
  "Crossbow to hunt powerful Tier 1 monsters.": [
    "Ballesta para cazar monstruos poderosos de nivel 1.",
    "Arbalète pour chasser de puissants monstres de palier 1.", "Balestra per cacciare potenti mostri di livello 1."
  ],
  "Cut from black silk blessed by the Circle, they allow runes to be traced without burning.": [
    "Cortados de seda negra bendecida por el Círculo, permiten trazar runas sin quemarse.",
    "Taillés dans de la soie noire bénie par le Cercle, ils permettent de tracer des runes sans brûler.", "Tagliati da seta nera benedetta dal Circolo, permettono di tracciare rune senza bruciarsi."
  ],
  "Dark blue ore with metallic shards.": [
    "Mineral azul oscuro con fragmentos metálicos.",
    "Minerai bleu sombre aux éclats métalliques.", "Minerale blu scuro con schegge metalliche."
  ],
  "Dark forces devour this fabric.": [
    "Las fuerzas oscuras devoran este tejido.",
    "Les forces obscures dévorent ce tissu.", "Le forze oscure divorano questo tessuto."
  ],
  "Dark stone with cold metallic shards.": [
    "Piedra oscura con fragmentos metálicos fríos.",
    "Pierre sombre aux éclats métalliques froids.", "Pietra scura con fredde schegge metalliche."
  ],
  "Earrings bright red like the blood of demons. Slot: artefact": [
    "Pendientes de un rojo vivo como la sangre de los demonios. Ranura: artefacto",
    "Des boucles d'oreilles d'un rouge vif comme le sang des démons. Emplacement : artefact", "Orecchini rosso vivo come il sangue dei demoni. Slot: artefatto"
  ],
  "Enchanted Metal Ingot made from small scrap metal.": [
    "Lingote de metal encantado fabricado con chatarra pequeña.",
    "Lingot de métal enchanté fabriqué à partir de petits morceaux de ferraille.", "Lingotto di metallo incantato fabbricato con piccoli rottami di metallo."
  ],
  "Enchanted, this scroll can unlock the King's barrier???": [
    "Encantado, este pergamino puede desbloquear la barrera del Rey???",
    "Enchanté, ce parchemin peut lever la barrière du Roi???", "Incantato, questo rotolo può sbloccare la barriera del Re???"
  ],
  "Enchanted, this scroll can unlock the barrier of King Taurus Asterius.": [
    "Encantado, este pergamino puede desbloquear la barrera del rey Taurus Asterius.",
    "Enchanté, ce parchemin peut lever la barrière du roi Taurus Asterius.", "Incantato, questo rotolo può sbloccare la barriera del re Taurus Asterius."
  ],
  "Enchanted, this scroll can unlock the barrier of Kobold King Illfang.": [
    "Encantado, este pergamino puede desbloquear la barrera del rey kobold Illfang.",
    "Enchanté, ce parchemin peut lever la barrière du roi kobold Illfang.", "Incantato, questo rotolo può sbloccare la barriera del re kobold Illfang."
  ],
  "Engraved with the seal of the Circle, it awakens the senses to the hidden energies of Aincrad.": [
    "Grabado con el sello del Círculo, despierta los sentidos a las energías ocultas de Aincrad.",
    "Gravé du sceau du Cercle, il éveille les sens aux énergies cachées d'Aincrad.", "Incisa con il sigillo del Circolo, risveglia i sensi alle energie nascoste di Aincrad."
  ],
  "Essence of a slime that has reached its highest potential.": [
    "Esencia de un limo que ha alcanzado su máximo potencial.",
    "Essence d'un slime ayant atteint son plein potentiel.", "Essenza di una melma che ha raggiunto il suo massimo potenziale."
  ],
  "Forged from the skins of multiple wolves, it reeks of their scent.": [
    "Forjado con las pieles de varios lobos; despide su olor.",
    "Forgé à partir des peaux de plusieurs loups, il en dégage l'odeur.", "Forgiato con le pelli di più lupi, ne emana l'odore."
  ],
  "Forged in the ashes of the ascension ritual, only adepts deserve its cold touch.": [
    "Forjado en las cenizas del ritual de ascensión; solo los adeptos merecen su tacto frío.",
    "Forgé dans les cendres du rituel d'ascension ; seuls les adeptes méritent son contact froid.", "Forgiato nelle ceneri del rituale di ascensione: solo gli adepti meritano il suo tocco freddo."
  ],
  "Forged in the royal forge of Tolbana. This armor can be very useful for Aincrad tier bosses.": [
    "Forjada en la forja real de Tolbana. Esta armadura puede ser muy útil contra los jefes de nivel de Aincrad.",
    "Forgée dans la forge royale de Tolbana. Cette armure peut être très utile contre les boss de palier d'Aincrad.", "Forgiata nella fucina reale di Tolbana. Questa armatura può essere molto utile contro i boss di livello di Aincrad."
  ],
  "Forged with Impure Onyx, an incomplete fragment of Tier 2.": [
    "Forjado con ónice impuro, un fragmento incompleto del nivel 2.",
    "Forgé avec de l'onyx impur, un fragment incomplet du palier 2.", "Forgiato con onice impuro, un frammento incompleto del Livello 2."
  ],
  "Fragment found in the chests of the Twin Knights labyrinth.": [
    "Fragmento hallado en los cofres del laberinto de los Caballeros Gemelos.",
    "Fragment trouvé dans les coffres du labyrinthe des Chevaliers Jumeaux.", "Frammento trovato nei forzieri del labirinto dei Cavalieri Gemelli."
  ],
  "Fragment of an ancient Treant. Even detached from it it still retains magic inside.": [
    "Fragmento de un treant antiguo. Incluso separado de él, aún conserva magia en su interior.",
    "Fragment d'un tréant ancien. Même détaché de lui, il conserve encore de la magie à l'intérieur.", "Frammento di un treant antico. Anche staccato da esso, conserva ancora magia al suo interno."
  ],
  "Fragment taken from one of the 3 Fallens in the Dungeon, very useful for accessing the Twin Knights boss room.": [
    "Fragmento tomado de uno de los 3 Caídos de la mazmorra; muy útil para acceder a la sala del jefe de los Caballeros Gemelos.",
    "Fragment prélevé sur l'un des 3 Déchus du donjon ; très utile pour accéder à la salle du boss des Chevaliers Jumeaux.", "Frammento preso da uno dei 3 Caduti del dungeon; molto utile per accedere alla sala del boss dei Cavalieri Gemelli."
  ],
  "Fragment torn from the hoof of a cursed creature. It contains dark energy that grants its wearer supernatural speed.":
    [
      "Fragmento arrancado del casco de una criatura maldita. Contiene energía oscura que otorga a quien lo lleva una velocidad sobrenatural.",
      "Fragment arraché au sabot d'une créature maudite. Il contient une énergie sombre qui confère à son porteur une vitesse surnaturelle.", "Frammento strappato dallo zoccolo di una creatura maledetta. Contiene energia oscura che dona a chi lo indossa una velocità soprannaturale."
    ],
  "Frightfully demonic grimoire that controls occult magic. Slot: artefact": [
    "Un grimorio terriblemente demoníaco que controla la magia oculta. Ranura: artefacto",
    "Un grimoire terriblemente démoniaque qui contrôle la magie occulte. Emplacement : artefact", "Grimorio terribilmente demoniaco che controlla la magia occulta. Slot: artefatto"
  ],
  "Gives you Mana immediately and applies 15 recharge to all mana potions.": [
    "Te da maná de inmediato y aplica una recarga de 15 a todas las pociones de maná.",
    "Vous rend du mana immédiatement et applique une recharge de 15 à toutes les potions de mana.", "Ti dà mana immediatamente e applica una ricarica di 15 a tutte le pozioni di mana."
  ],
  "Gives you Mana immediately and applies 30 minutes of recharge to all crystals.": [
    "Te da maná de inmediato y aplica 30 minutos de recarga a todos los cristales.",
    "Vous rend du mana immédiatement et applique 30 minutes de recharge à tous les cristaux.", "Ti dà mana immediatamente e applica 30 minuti di ricarica a tutti i cristalli."
  ],
  "Gives you Stamina immediately and applies 15 recharge to all stamina potions.": [
    "Te da resistencia de inmediato y aplica una recarga de 15 a todas las pociones de resistencia.",
    "Vous rend de l'endurance immédiatement et applique une recharge de 15 à toutes les potions d'endurance.", "Ti dà stamina immediatamente e applica una ricarica di 15 a tutte le pozioni di stamina."
  ],
  "Gloves made from deer skins.": [
    "Guantes hechos con pieles de ciervo.",
    "Gants fabriqués à partir de peaux de cerf.", "Guanti fatti con pelli di cervo."
  ],
  "Halberd of a fallen lord once a great warrior in Aincrad and throughout The Seed.": [
    "Alabarda de un señor caído, antaño un gran guerrero en Aincrad y por todo The Seed.",
    "Hallebarde d'un seigneur déchu, autrefois grand guerrier d'Aincrad et de tout The Seed.", "Alabarda di un signore caduto, un tempo grande guerriero ad Aincrad e in tutto The Seed."
  ],
  "Haloween Crystal, is perfect for mages, assassins and warriors alike.": [
    "Cristal de Haloween; es perfecto tanto para magos como para asesinos y guerreros.",
    "Cristal d'Haloween ; il est parfait pour les mages, les assassins et les guerriers.", "Cristallo di Haloween; è perfetto tanto per i maghi quanto per gli assassini e i guerrieri."
  ],
  "Hammer whose magic has been imbued with the monsters of the Snow Citadel.": [
    "Martillo cuya magia se ha imbuido de los monstruos de la Ciudadela de nieve.",
    "Marteau dont la magie a été imprégnée des monstres de la Citadelle des neiges.", "Martello la cui magia è stata impregnata dai mostri della Cittadella delle Nevi."
  ],
  "Heart imbued with magic, if you use it carefully a very formidable weapon can be created.": [
    "Corazón imbuido de magia; si lo usas con cuidado, se puede crear un arma muy formidable.",
    "Cœur imprégné de magie ; si vous l'utilisez avec soin, une arme très redoutable peut être créée.", "Cuore impregnato di magia: se lo usi con cura si può creare un'arma formidabile."
  ],
  "Heart of colossal power, used to forge a talisman capable of communicating with the Protectors of the Landing.": [
    "Corazón de poder colosal, usado para forjar un talismán capaz de comunicarse con los Protectores del Desembarco.",
    "Cœur d'une puissance colossale, utilisé pour forger un talisman capable de communiquer avec les Protecteurs de l'Atterrissage.", "Cuore dalla potenza colossale, usato per forgiare un talismano capace di comunicare con i Protettori dell'Atterraggio."
  ],
  "Helmet having protected many souls through occult rituals. Slot: artefact": [
    "Casco que ha protegido muchas almas en rituales ocultos. Ranura: artefacto",
    "Casque ayant protégé bien des âmes lors de rituels occultes. Emplacement : artefact", "Elmo che ha protetto molte anime attraverso riti occulti. Slot: artefatto"
  ],
  "Imbued with the blood of an awakening ritual, it binds its wearer to the shadow of Aincrad.": [
    "Imbuido con la sangre de un ritual de despertar, une a quien lo lleva a la sombra de Aincrad.",
    "Imprégné du sang d'un rituel d'éveil, il lie son porteur à l'ombre d'Aincrad.", "Impregnato del sangue di un rituale di risveglio, lega chi lo indossa all'ombra di Aincrad."
  ],
  "Impure ingot, containing impurities. Less durable, but can be used for makeshift or experimental weapons!": [
    "Lingote impuro, con impurezas. Menos duradero, pero sirve para armas improvisadas o experimentales.",
    "Lingot impur, contenant des impuretés. Moins durable, mais utilisable pour des armes de fortune ou expérimentales.", "Lingotto impuro, contenente impurità. Meno durevole, ma utilizzabile per armi improvvisate o sperimentali!"
  ],
  "Ingot forged at high temperature. An essential and versatile material. Used by craftsmen.": [
    "Lingote forjado a alta temperatura. Un material esencial y versátil. Lo usan los artesanos.",
    "Lingot forgé à haute température. Un matériau essentiel et polyvalent. Utilisé par les artisans.", "Lingotto forgiato ad alta temperatura. Un materiale essenziale e versatile. Usato dagli artigiani."
  ],
  "Ingot refined from copper ore. Used in blacksmithing, for certain confections.": [
    "Lingote refinado a partir de mineral de cobre. Se usa en herrería para ciertas fabricaciones.",
    "Lingot raffiné à partir de minerai de cuivre. Utilisé en forge pour certaines confections.", "Lingotto raffinato dal minerale di rame. Usato nella fucina, per certe lavorazioni."
  ],
  "Key that allows you to open the giant portal behind the colliseum.": [
    "Llave que permite abrir el portal gigante tras el coliseo.",
    "Clé permettant d'ouvrir le portail géant derrière le colisée.", "Chiave che permette di aprire il portale gigante dietro il colosseo."
  ],
  "Key to the cage allowing you to save Elendir.": [
    "Llave de la jaula que permite salvar a Elendir.",
    "Clé de la cage permettant de sauver Elendir.", "Chiave della gabbia che permette di salvare Elendir."
  ],
  "Large wooden shield that can only be obtained by a Treant Warrior.": [
    "Un gran escudo de madera que solo puede obtenerse de un guerrero treant.",
    "Un grand bouclier en bois qui ne peut être obtenu qu'auprès d'un guerrier tréant.", "Un grande scudo di legno che si può ottenere solo da un guerriero treant."
  ],
  "Leaves from Sylnovars.": ["Hojas de los Sylnovars.", "Feuilles des Sylnovars.", "Foglie dei Sylnovar."],
  "Leaves from the Sylvaers.": ["Hojas de los Sylvaers.", "Feuilles des Sylvaers.", "Foglie dei Sylvaer."],
  "Long and heavy axe of the powerful tier boss: Illfang the Kobold Lord!": [
    "Hacha larga y pesada del poderoso jefe de nivel: ¡Illfang, el señor kobold!",
    "Hache longue et lourde du puissant boss de palier : Illfang le seigneur kobold !", "Ascia lunga e pesante del potente boss di livello: Illfang il signore kobold!"
  ],
  "Long and taut, this sturdy string is ideal for making a new bow.": [
    "Larga y tensa, esta cuerda resistente es ideal para fabricar un arco nuevo.",
    "Longue et tendue, cette corde solide est idéale pour fabriquer un nouvel arc.", "Lunga e tesa, questa corda robusta è ideale per fabbricare un arco nuovo."
  ],
  "Long sword that belonged to Illfang the Kobold Lord. However, it is only a mythical relic.": [
    "Espada larga que perteneció a Illfang, el señor kobold. Sin embargo, solo es una reliquia mítica.",
    "Épée longue ayant appartenu à Illfang le seigneur kobold. Ce n'est toutefois qu'une relique mythique.", "Spada lunga appartenuta a Illfang, il signore kobold. Tuttavia, non è che una reliquia mitica."
  ],
  "Lunar New Year Crystal.": ["Cristal del Año Nuevo Lunar.", "Cristal du Nouvel An lunaire.", "Cristallo del Nuovo Anno Lunare."],
  "Magic flower used by elves to make potions.": [
    "Flor mágica que los elfos usan para fabricar pociones.",
    "Fleur magique utilisée par les elfes pour fabriquer des potions.", "Fiore magico usato dagli elfi per fabbricare pozioni."
  ],
  "Mask to conceal one's identity and inspire terror. Slot: Gloves": [
    "Máscara para ocultar la identidad e inspirar terror. Ranura: guantes",
    "Masque pour dissimuler son identité et inspirer la terreur. Emplacement : gants", "Maschera per nascondere la propria identità e incutere terrore. Slot: guanti"
  ],
  "Mask to conceal one's identity and inspire terror. Slot: artefact": [
    "Máscara para ocultar la identidad e inspirar terror. Ranura: artefacto",
    "Masque pour dissimuler son identité et inspirer la terreur. Emplacement : artefact", "Maschera per nascondere la propria identità e incutere terrore. Slot: artefatto"
  ],
  "Necklace made from oak strings and bull horns.": [
    "Collar hecho con cordones de roble y cuernos de toro.",
    "Collier fait de cordons de chêne et de cornes de taureau.", "Collana fatta con corde di quercia e corni di toro."
  ],
  "Necklace made from old dusty materials, but extremely durable.": [
    "Collar hecho con materiales viejos y polvorientos, pero extremadamente duradero.",
    "Collier fait de vieux matériaux poussiéreux, mais extrêmement durable.", "Collana fatta con vecchi materiali impolverati, ma estremamente durevole."
  ],
  "Oak bark, torn by time.": ["Corteza de roble, desgarrada por el tiempo.", "Écorce de chêne, déchirée par le temps.", "Corteccia di quercia, lacerata dal tempo."],
  "Old birch stick, lost in its solitude but still useful despite everything.": [
    "Vara de abedul vieja, perdida en su soledad pero aún útil a pesar de todo.",
    "Vieux bâton de bouleau, perdu dans sa solitude mais encore utile malgré tout.", "Vecchio bastone di betulla, perso nella sua solitudine ma ancora utile nonostante tutto."
  ],
  "Old oak stick, lost in its solitude but still useful despite everything.": [
    "Vara de roble vieja, perdida en su soledad pero aún útil a pesar de todo.",
    "Vieux bâton de chêne, perdu dans sa solitude mais encore utile malgré tout.", "Vecchio bastone di quercia, perso nella sua solitudine ma ancora utile nonostante tutto."
  ],
  "Opaque blue-green stone with fine veins.": [
    "Piedra azul verdosa opaca con finas vetas.",
    "Pierre bleu-vert opaque aux fines veines.", "Pietra blu-verde opaca con venature sottili."
  ],
  "Overflowing with winter energy that freezes the surrounding air. Anyone who wears it is condemned to bring happiness to children.":
    [
      "Rebosante de energía invernal que congela el aire circundante. Quien lo lleve está condenado a repartir felicidad entre los niños.",
      "Débordant d'une énergie hivernale qui gèle l'air environnant. Quiconque le porte est condamné à apporter le bonheur aux enfants.", "Traboccante di energia invernale che gela l'aria circostante. Chi lo indossa è condannato a portare felicità ai bambini."
    ],
  "Piece of scrap, solid despite its condition. Ideal for experimenting with blacksmithing or testing alchemical recipes.":
    [
      "Trozo de chatarra, sólido a pesar de su estado. Ideal para experimentar con la herrería o probar recetas alquímicas.",
      "Morceau de ferraille, solide malgré son état. Idéal pour expérimenter la forge ou tester des recettes alchimiques.", "Pezzo di rottame, solido nonostante le condizioni. Ideale per sperimentare con la fucina o provare ricette alchemiche."
    ],
  "Powerful bow that belonged to one of the Fallen of the Labyrinth.": [
    "Un arco poderoso que perteneció a uno de los Caídos del Laberinto.",
    "Un arc puissant ayant appartenu à l'un des Déchus du Labyrinthe.", "Arco potente appartenuto a uno dei Caduti del Labirinto."
  ],
  "Powerful mask imbued with black magic. It provides exceptional protection and increased power for the most seasoned necromancers.":
    [
      "Máscara poderosa imbuida de magia negra. Proporciona una protección excepcional y mayor poder a los nigromantes más experimentados.",
      "Masque puissant imprégné de magie noire. Il offre une protection exceptionnelle et une puissance accrue aux nécromanciens les plus aguerris.", "Maschera potente impregnata di magia nera. Offre una protezione eccezionale e un potere accresciuto ai negromanti più esperti."
    ],
  "Powerful orc blood used in a variety of ways.": [
    "Sangre de orco poderosa, utilizada de diversas maneras.",
    "Sang d'orque puissant, utilisé de diverses manières.", "Sangue d'orco potente, usato in vari modi."
  ],
  "Recoverable by completing the Secondary Quest “The Footprint of the Seas”": [
    "Se obtiene al completar la misión secundaria «La huella de los mares»",
    "Obtensible en terminant la quête secondaire « L'empreinte des mers »", "Ottenibile completando la missione secondaria «L'impronta dei mari»"
  ],
  "Replica of the Fallen Guardian armor. Heavy and durable, impossible to die with this one.": [
    "Réplica de la armadura del guardián caído. Pesada y duradera; con esta es imposible morir.",
    "Réplique de l'armure du gardien déchu. Lourde et durable ; impossible de mourir avec celle-ci.", "Replica dell'armatura del guardiano caduto. Pesante e durevole: con questa è impossibile morire."
  ],
  "Replica of the Fallen Herald's armor. Light and reliable, agile people will love it.": [
    "Réplica de la armadura del heraldo caído. Ligera y fiable; encantará a las personas ágiles.",
    "Réplique de l'armure du héraut déchu. Légère et fiable, elle ravira les personnes agiles.", "Replica dell'armatura dell'araldo caduto. Leggera e affidabile, piacerà alle persone agili."
  ],
  "Replica of the Fallen Reaper armor. It is perfect for the rest of your adventure as a magician.": [
    "Réplica de la armadura del segador caído. Es perfecta para el resto de tu aventura como mago.",
    "Réplique de l'armure du faucheur déchu. Elle est parfaite pour la suite de votre aventure de magicien.", "Replica dell'armatura del mietitore caduto. È perfetta per il resto della tua avventura come mago."
  ],
  "Restores 10 Health and triggers a 15 second cooldown for life potions.": [
    "Restaura 10 HP y activa 15 segundos de enfriamiento para las pociones de curación.",
    "Restaure 10 PV et déclenche un temps de recharge de 15 secondes pour les potions de soin.", "Ripristina 10 punti salute e attiva 15 secondi di ricarica per le pozioni di vita."
  ],
  "Restores 10 Mana and triggers a 15 second cooldown for mana potions.": [
    "Restaura 10 de maná y activa 15 segundos de enfriamiento para las pociones de maná.",
    "Restaure 10 points de mana et déclenche un temps de recharge de 15 secondes pour les potions de mana.", "Ripristina 10 punti mana e attiva 15 secondi di ricarica per le pozioni di mana."
  ],
  "Restores 10 Stamina and triggers a 15 second cooldown for stamina potions.": [
    "Restaura 10 de resistencia y activa 15 segundos de enfriamiento para las pociones de resistencia.",
    "Restaure 10 points d'endurance et déclenche un temps de recharge de 15 secondes pour les potions d'endurance.", "Ripristina 10 punti stamina e attiva 15 secondi di ricarica per le pozioni di stamina."
  ],
  "Restores 12.5 Stamina and triggers a 15 second cooldown for stamina potions.": [
    "Restaura 12,5 de resistencia y activa 15 segundos de enfriamiento para las pociones de resistencia.",
    "Restaure 12,5 points d'endurance et déclenche un temps de recharge de 15 secondes pour les potions d'endurance.", "Ripristina 12,5 punti stamina e attiva 15 secondi di ricarica per le pozioni di stamina."
  ],
  "Restores 15 Mana and triggers a 15 second cooldown for mana potions.": [
    "Restaura 15 de maná y activa 15 segundos de enfriamiento para las pociones de maná.",
    "Restaure 15 points de mana et déclenche un temps de recharge de 15 secondes pour les potions de mana.", "Ripristina 15 punti mana e attiva 15 secondi di ricarica per le pozioni di mana."
  ],
  "Restores 15 Stamina and triggers a 15 second cooldown for stamina potions.": [
    "Restaura 15 de resistencia y activa 15 segundos de enfriamiento para las pociones de resistencia.",
    "Restaure 15 points d'endurance et déclenche un temps de recharge de 15 secondes pour les potions d'endurance.", "Ripristina 15 punti stamina e attiva 15 secondi di ricarica per le pozioni di stamina."
  ],
  "Restores 20 Health and triggers a 15 second cooldown for life potions.": [
    "Restaura 20 HP y activa 15 segundos de enfriamiento para las pociones de curación.",
    "Restaure 20 PV et déclenche un temps de recharge de 15 secondes pour les potions de soin.", "Ripristina 20 punti salute e attiva 15 secondi di ricarica per le pozioni di vita."
  ],
  "Restores 20 Mana and triggers a 15 second cooldown for mana potions.": [
    "Restaura 20 de maná y activa 15 segundos de enfriamiento para las pociones de maná.",
    "Restaure 20 points de mana et déclenche un temps de recharge de 15 secondes pour les potions de mana.", "Ripristina 20 punti mana e attiva 15 secondi di ricarica per le pozioni di mana."
  ],
  "Restores 20 Stamina and triggers a 15 second cooldown for stamina potions.": [
    "Restaura 20 de resistencia y activa 15 segundos de enfriamiento para las pociones de resistencia.",
    "Restaure 20 points d'endurance et déclenche un temps de recharge de 15 secondes pour les potions d'endurance.", "Ripristina 20 punti stamina e attiva 15 secondi di ricarica per le pozioni di stamina."
  ],
  "Restores 25 Health and triggers a 15 second cooldown for life potions.": [
    "Restaura 25 HP y activa 15 segundos de enfriamiento para las pociones de curación.",
    "Restaure 25 PV et déclenche un temps de recharge de 15 secondes pour les potions de soin.", "Ripristina 25 punti salute e attiva 15 secondi di ricarica per le pozioni di vita."
  ],
  "Restores 25 Mana and triggers a 15 second cooldown for mana potions.": [
    "Restaura 25 de maná y activa 15 segundos de enfriamiento para las pociones de maná.",
    "Restaure 25 points de mana et déclenche un temps de recharge de 15 secondes pour les potions de mana.", "Ripristina 25 punti mana e attiva 15 secondi di ricarica per le pozioni di mana."
  ],
  "Restores 30 Mana and triggers a 15 second cooldown for mana potions.": [
    "Restaura 30 de maná y activa 15 segundos de enfriamiento para las pociones de maná.",
    "Restaure 30 points de mana et déclenche un temps de recharge de 15 secondes pour les potions de mana.", "Ripristina 30 punti mana e attiva 15 secondi di ricarica per le pozioni di mana."
  ],
  "Restores 35 Health and triggers a 15 second cooldown for life potions.": [
    "Restaura 35 HP y activa 15 segundos de enfriamiento para las pociones de curación.",
    "Restaure 35 PV et déclenche un temps de recharge de 15 secondes pour les potions de soin.", "Ripristina 35 punti salute e attiva 15 secondi di ricarica per le pozioni di vita."
  ],
  "Restores 45 Health and triggers a 15 second cooldown for life potions.": [
    "Restaura 45 HP y activa 15 segundos de enfriamiento para las pociones de curación.",
    "Restaure 45 PV et déclenche un temps de recharge de 15 secondes pour les potions de soin.", "Ripristina 45 punti salute e attiva 15 secondi di ricarica per le pozioni di vita."
  ],
  "Restores 45 Mana and triggers a 15 second cooldown for mana potions.": [
    "Restaura 45 de maná y activa 15 segundos de enfriamiento para las pociones de maná.",
    "Restaure 45 points de mana et déclenche un temps de recharge de 15 secondes pour les potions de mana.", "Ripristina 45 punti mana e attiva 15 secondi di ricarica per le pozioni di mana."
  ],
  "Restores 5 Stamina and triggers a 15 second cooldown for stamina potions.": [
    "Restaura 5 de resistencia y activa 15 segundos de enfriamiento para las pociones de resistencia.",
    "Restaure 5 points d'endurance et déclenche un temps de recharge de 15 secondes pour les potions d'endurance.", "Ripristina 5 punti stamina e attiva 15 secondi di ricarica per le pozioni di stamina."
  ],
  "Restores 55 Health and triggers a 15 second cooldown for life potions.": [
    "Restaura 55 HP y activa 15 segundos de enfriamiento para las pociones de curación.",
    "Restaure 55 PV et déclenche un temps de recharge de 15 secondes pour les potions de soin.", "Ripristina 55 punti salute e attiva 15 secondi di ricarica per le pozioni di vita."
  ],
  "Restores 7.5 Stamina and triggers a 15 second cooldown for stamina potions.": [
    "Restaura 7,5 de resistencia y activa 15 segundos de enfriamiento para las pociones de resistencia.",
    "Restaure 7,5 points d'endurance et déclenche un temps de recharge de 15 secondes pour les potions d'endurance.", "Ripristina 7,5 punti stamina e attiva 15 secondi di ricarica per le pozioni di stamina."
  ],
  "Ring featuring a demonic miniature skull inspiring madness.": [
    "Anillo con una calavera demoníaca en miniatura que inspira locura.",
    "Anneau orné d'un crâne démoniaque miniature qui inspire la folie.", "Anello con un teschio demoniaco in miniatura che ispira follia."
  ],
  "Ring forged from the bones of wandering skeletons from the cursed ruins.": [
    "Anillo forjado con los huesos de esqueletos errantes de las ruinas malditas.",
    "Anneau forgé à partir des os de squelettes errants des ruines maudites.", "Anello forgiato con le ossa di scheletri erranti delle rovine maledette."
  ],
  "Ring forged in the abyss, bearing the mark of Leviathan. He inspires power and fear.": [
    "Anillo forjado en el abismo, con la marca de Leviatán. Inspira poder y miedo.",
    "Anneau forgé dans l'abîme, portant la marque de Léviathan. Il inspire puissance et peur.", "Anello forgiato nell'abisso, che porta il marchio di Leviatano. Ispira potere e paura."
  ],
  "Ring of great strength, as tenacious as a demon's skin. Slot: Ring": [
    "Anillo de gran fuerza, tan tenaz como la piel de un demonio. Ranura: anillo",
    "Anneau d'une grande force, aussi tenace que la peau d'un démon. Emplacement : anneau", "Anello di grande forza, tenace come la pelle di un demone. Slot: anello"
  ],
  "Ring that belonged to the reaper. When he left he fell to the ground, still imbued with his great magic. (Kill the fallen reaper to obtain it)":
    [
      "Anillo que perteneció al segador. Cuando se marchó, cayó al suelo, aún imbuido de su gran magia. (Mata al segador caído para obtenerlo)",
      "Anneau ayant appartenu au faucheur. Lorsqu'il partit, il tomba au sol, encore imprégné de sa grande magie. (Tuez le faucheur déchu pour l'obtenir)", "Anello appartenuto al mietitore. Quando se ne andò cadde al suolo, ancora impregnato della sua grande magia. (Uccidi il mietitore caduto per ottenerlo)"
    ],
  "Set with obsidian cursed by followers, it pulses to the rhythm of the darkest rituals.": [
    "Engarzado con obsidiana maldita por los seguidores, palpita al ritmo de los rituales más oscuros.",
    "Serti d'obsidienne maudite par les fidèles, il palpite au rythme des rituels les plus sombres.", "Incastonato con ossidiana maledetta dai seguaci, pulsa al ritmo dei rituali più oscuri."
  ],
  "Silver seal intended to accommodate a Heart, allowing the creation of a talisman of exceptional power.": [
    "Sello de plata destinado a alojar un corazón, lo que permite crear un talismán de poder excepcional.",
    "Sceau d'argent destiné à accueillir un cœur, permettant la création d'un talisman d'une puissance exceptionnelle.", "Sigillo d'argento destinato ad accogliere un Cuore, che permette la creazione di un talismano dal potere eccezionale."
  ],
  "Skull imbued with the blood and darkness of a demonic ritual. Slot: Amulet": [
    "Cráneo imbuido con la sangre y la oscuridad de un ritual demoníaco. Ranura: amuleto",
    "Crâne imprégné du sang et des ténèbres d'un rituel démoniaque. Emplacement : amulette", "Teschio impregnato del sangue e dell'oscurità di un rituale demoniaco. Slot: amuleto"
  ],
  "Small pairs of boots made from magic from the beyond and fairly rare components. (Obtained by just following the main Quest Line)":
    [
      "Un pequeño par de botas hechas con magia del más allá y componentes bastante raros. (Se obtiene simplemente siguiendo la línea de misiones principal)",
      "Une petite paire de bottes fabriquées avec de la magie de l'au-delà et des composants assez rares. (Obtenue en suivant simplement la quête principale)", "Un piccolo paio di stivali fatti con magia dell'aldilà e componenti piuttosto rari. (Ottenuti semplicemente seguendo la linea di missioni principale)"
    ],
  "Soul Metal Ingot made from small scrap metal.": [
    "Lingote de metal de almas fabricado con chatarra pequeña.",
    "Lingot de métal des âmes fabriqué à partir de petits morceaux de ferraille.", "Lingotto di metallo delle anime fabbricato con piccoli rottami di metallo."
  ],
  "Soul of a skeleton steeped in corruption. Obtainable by killing: - Skeleton Swordsman x40 - Skeleton Warrior x40 - Skeleton Halberdier x40 - Skeleton Archer x40":
    [
      "Alma de un esqueleto impregnada de corrupción. Se obtiene matando: - Espadachín esqueleto x40 - Guerrero esqueleto x40 - Alabardero esqueleto x40 - Arquero esqueleto x40",
      "Âme d'un squelette imprégnée de corruption. Obtenable en tuant : - Épéiste squelette x40 - Guerrier squelette x40 - Hallebardier squelette x40 - Archer squelette x40", "Anima di uno scheletro impregnata di corruzione. Ottenibile uccidendo: - Spadaccino scheletro x40 - Guerriero scheletro x40 - Alabardiere scheletro x40 - Arciere scheletro x40"
    ],
  "Staff imbued with magical nectar, amplifying the wielder's power.": [
    "Bastón imbuido de néctar mágico que amplifica el poder de quien lo empuña.",
    "Bâton imprégné de nectar magique, amplifiant la puissance de son porteur.", "Bastone impregnato di nettare magico, che amplifica il potere di chi lo impugna."
  ],
  "Staff made from enchantments and metals. Perfect for dealing incredible damage.": [
    "Bastón hecho de encantamientos y metales. Perfecto para infligir un daño increíble.",
    "Bâton fait d'enchantements et de métaux. Parfait pour infliger des dégâts incroyables.", "Bastone fatto di incantesimi e metalli. Perfetto per infliggere danni incredibili."
  ],
  "Staff still imbued with its magic after the death of its owner.": [
    "Bastón aún imbuido de su magia tras la muerte de su dueño.",
    "Bâton encore imprégné de sa magie après la mort de son propriétaire.", "Bastone ancora impregnato della sua magia dopo la morte del proprietario."
  ],
  "Strong and resistant, it protects like a hive that defends its larvae, thus absorbing the most powerful attacks.": [
    "Fuerte y resistente, protege como una colmena que defiende a sus larvas, absorbiendo así los ataques más poderosos.",
    "Solide et résistant, il protège comme une ruche qui défend ses larves, absorbant ainsi les attaques les plus puissantes.", "Robusto e resistente, protegge come un alveare che difende le sue larve, assorbendo così gli attacchi più potenti."
  ],
  "Support Crystal allowing the regeneration of life.": [
    "Cristal de apoyo que permite la regeneración de vida.",
    "Cristal de soutien permettant la régénération de vie.", "Cristallo di supporto che permette la rigenerazione della vita."
  ],
  "Sweet but surprisingly viscous, this concentrated honey is used to coat certain armor.": [
    "Dulce pero sorprendentemente viscosa, esta miel concentrada se usa para recubrir ciertas armaduras.",
    "Doux mais étonnamment visqueux, ce miel concentré sert à enduire certaines armures.", "Dolce ma sorprendentemente viscoso, questo miele concentrato si usa per rivestire certe armature."
  ],
  "Sweet lemon candy. Gives a boost of happiness.": [
    "Caramelo dulce de limón. Otorga un impulso de felicidad.",
    "Bonbon sucré au citron. Donne un regain de bonheur.", "Caramella dolce al limone. Concede un impulso di felicità."
  ],
  "Sweet strawberry candy. Gives a Romantic Boost.": [
    "Caramelo dulce de fresa. Otorga un impulso romántico.",
    "Bonbon sucré à la fraise. Donne un regain romantique.", "Caramella dolce alla fragola. Concede un impulso romantico."
  ],
  "Sweet sugar candy. Gives an incredible Boost.": [
    "Caramelo dulce de azúcar. Otorga un impulso increíble.",
    "Bonbon sucré. Donne un regain incroyable.", "Caramella dolce allo zucchero. Concede un impulso incredibile."
  ],
  "Sword whose magic has been imbued with the monsters of the Snow Citadel.": [
    "Espada cuya magia se ha imbuido de los monstruos de la Ciudadela de nieve.",
    "Épée dont la magie a été imprégnée des monstres de la Citadelle des neiges.", "Spada la cui magia è stata impregnata dai mostri della Cittadella delle Nevi."
  ],
  "The Bear's soul rests in this fragment. Use it wisely, for its power is colossal.": [
    "El alma del oso reposa en este fragmento. Úsalo con sabiduría, pues su poder es colosal.",
    "L'âme de l'ours repose dans ce fragment. Utilisez-le avec sagesse, car sa puissance est colossale.", "L'anima dell'orso riposa in questo frammento. Usalo con saggezza, perché il suo potere è colossale."
  ],
  "The Seal of the Elders in its original form.": [
    "El Sello de los Ancianos en su forma original.",
    "Le Sceau des Anciens dans sa forme originale.", "Il Sigillo degli Anziani nella sua forma originale."
  ],
  "The strongest shield Tolbana has to offer.": [
    "El escudo más fuerte que Tolbana puede ofrecer.",
    "Le bouclier le plus solide que Tolbana puisse offrir.", "Lo scudo più forte che Tolbana possa offrire."
  ],
  "This beautiful, juicy wild boar meat can make you want to eat even more!": [
    "¡Esta carne de jabalí, hermosa y jugosa, puede hacer que quieras comer aún más!",
    "Cette belle viande de sanglier bien juteuse peut vous donner envie d'en manger encore plus !", "Questa carne di cinghiale, bella e succosa, può farti venire voglia di mangiarne ancora!"
  ],
  "This broth, made from meat and other ingredients, is perfect for eating when you're hungry!": [
    "¡Este caldo, hecho con carne y otros ingredientes, es perfecto para comer cuando tienes hambre!",
    "Ce bouillon, fait de viande et d'autres ingrédients, est parfait à manger lorsque vous avez faim !", "Questo brodo, fatto con carne e altri ingredienti, è perfetto da mangiare quando hai fame!"
  ],
  "This mask erases the face of the person who wears it, leaving only the faithful shadow of the Master.": [
    "Esta máscara borra el rostro de quien la lleva, dejando solo la fiel sombra del Maestro.",
    "Ce masque efface le visage de celui qui le porte, ne laissant que l'ombre fidèle du Maître.", "Questa maschera cancella il volto di chi la indossa, lasciando solo l'ombra fedele del Maestro."
  ],
  "This necklace is woven from living lianas. It is said to respond to the heartbeat of the forest. ": [
    "Este collar está tejido con lianas vivas. Se dice que responde al latido del bosque. ",
    "Ce collier est tissé de lianes vivantes. On dit qu'il répond aux battements du cœur de la forêt. ", "Questa collana è intrecciata con liane vive. Si dice che risponda al battito del bosco."
  ],
  "Timber wolf fur": ["Piel de lobo de madera", "Fourrure de loup de bois", "Pelliccia di lupo dei boschi"],
  "Twisted blade forged in the nightmares of a terrible night. She reaps wandering spirits and harvests lost souls.": [
    "Hoja retorcida forjada en las pesadillas de una noche terrible. Siega espíritus errantes y cosecha almas perdidas.",
    "Lame torsadée forgée dans les cauchemars d'une nuit terrible. Elle fauche les esprits errants et récolte les âmes perdues.", "Lama contorta forgiata negli incubi di una notte terribile. Miete spiriti erranti e raccoglie anime perdute."
  ],
  "Very pretty and smells pretty good too.": [
    "Muy bonita y además huele bastante bien.",
    "Très jolie et elle sent plutôt bon aussi.", "Molto bella e profuma anche piuttosto bene."
  ],
  "Warm and supple, this coat effectively protects against the cold. Perfect for creating light armor.": [
    "Cálido y flexible, este abrigo protege eficazmente contra el frío. Perfecto para crear armaduras ligeras.",
    "Chaud et souple, ce manteau protège efficacement du froid. Parfait pour créer des armures légères.", "Caldo e morbido, questo cappotto protegge efficacemente dal freddo. Perfetto per creare armature leggere."
  ],
  "Wheat flower, doesn't smell much.": [
    "Flor de trigo; no huele mucho.",
    "Fleur de blé, elle ne sent pas grand-chose.", "Fiore di grano, non profuma molto."
  ],
  "Wheat leaves, used for various recipes.": [
    "Hojas de trigo, usadas en diversas recetas.",
    "Feuilles de blé, utilisées dans diverses recettes.", "Foglie di grano, usate in varie ricette."
  ],
  "Worn by the initiates of the Circle of the Eclipse, it silently engraves the oath of the first rite.": [
    "Llevado por los iniciados del Círculo del Eclipse, graba en silencio el juramento del primer rito.",
    "Porté par les initiés du Cercle de l'Éclipse, il grave en silence le serment du premier rite.", "Indossato dagli iniziati del Circolo dell'Eclissi, incide in silenzio il giuramento del primo rito."
  ],
  "Woven in the darkness of the ascension rite, they amplify the occult force of their wearer.": [
    "Tejidos en la oscuridad del rito de ascensión, amplifican la fuerza oculta de quien los lleva.",
    "Tissés dans l'obscurité du rite d'ascension, ils amplifient la force occulte de leur porteur.", "Tessuti nell'oscurità del rito di ascensione, amplificano la forza occulta di chi li indossa."
  ],
  "Young acacia stick, still full of potential.": [
    "Vara joven de acacia, aún llena de potencial.",
    "Jeune bâton d'acacia, encore plein de potentiel.", "Giovane bastone di acacia, ancora pieno di potenziale."
  ],
  "Young birch stick, still full of potential.": [
    "Vara joven de abedul, aún llena de potencial.",
    "Jeune bâton de bouleau, encore plein de potentiel.", "Giovane bastone di betulla, ancora pieno di potenziale."
  ],
  "Young oak stick, still full of potential.": [
    "Vara joven de roble, aún llena de potencial.",
    "Jeune bâton de chêne, encore plein de potentiel.", "Giovane bastone di quercia, ancora pieno di potenziale."
  ],
  "Slot: Gloves": ["Ranura: guantes", "Emplacement : gants", "Slot: guanti"],
  "Slot: Ring": ["Ranura: anillo", "Emplacement : anneau", "Slot: anello"],
  "Slot: Amulet": ["Ranura: amuleto", "Emplacement : amulette", "Slot: amuleto"],
  "An ancient ruined tower, lair of Ilfang Lord Kobold. Dark murmurs rise from its depths.": [
    "Una antigua torre en ruinas, guarida de Ilfang, señor kobold. Oscuros murmullos surgen de sus profundidades.",
    "Une ancienne tour en ruines, repaire d'Ilfang le seigneur kobold. De sombres murmures s'élèvent de ses profondeurs.", "Un'antica torre in rovina, tana di Ilfang il signore kobold. Oscuri mormorii salgono dalle sue profondità."
  ],
  "Born in the coldest caves of the mountains, the Ice Bear embodies the brute force of the North. Its roar makes the air shiver, and its icy breath freezes everything in its path.":
    [
      "Nacido en las cuevas más frías de las montañas, el oso de hielo encarna la fuerza bruta del Norte. Su rugido hace temblar el aire y su aliento helado congela todo a su paso.",
      "Né dans les grottes les plus froides des montagnes, l'ours des glaces incarne la force brute du Nord. Son rugissement fait frémir l'air et son souffle glacé gèle tout sur son passage.", "Nato nelle caverne più fredde delle montagne, l'orso di ghiaccio incarna la forza bruta del Nord. Il suo ruggito fa tremare l'aria e il suo alito gelido congela tutto sul suo cammino."
    ],
  "Transforms Resources and Spider Threads to make useful strings in making Accessories.": [
    "Transforma recursos e hilos de araña para hacer cuerdas útiles en la fabricación de accesorios.",
    "Transforme les ressources et les fils d'araignée en cordes utiles à la fabrication d'accessoires.", "Trasforma risorse e fili di ragno in corde utili per fabbricare accessori."
  ],
  "A dungeon built within the Necromancer's Tomb.": [
    "Una mazmorra construida dentro de la Tumba del Nigromante.",
    "Un donjon construit à l'intérieur du Tombeau du Nécromancien.", "Un dungeon costruito dentro la Tomba del Negromante."
  ],
  "The Man Who Lost His Pants (Side Quest) — Coordinates X: 498 Z: 600": [
    "El hombre que perdió sus pantalones (misión secundaria) — Coordenadas X: 498 Z: 600",
    "L'homme qui a perdu son pantalon (quête secondaire) — Coordonnées X : 498 Z : 600", "L'uomo che perse i pantaloni (missione secondaria) — Coordinate X: 498 Z: 600"
  ],
  "Good accounts make good friends (Side Quest) — Coordinates X: 526 Z: 1409": [
    "Las buenas cuentas hacen buenos amigos (misión secundaria) — Coordenadas X: 526 Z: 1409",
    "Les bons comptes font les bons amis (quête secondaire) — Coordonnées X : 526 Z : 1409", "I buoni conti fanno i buoni amici (missione secondaria) — Coordinate X: 526 Z: 1409"
  ],
  /* --- Current-Data normal armor descriptions (levels 3, 7 and 9). One entry per distinct
     sentence the source supplies: a piece whose source text differs by a single word (the Ika
     Breastplate's "it" against the Ika Leggings' "they", the Stealth pieces' "to approach" against
     "for approaching", the Sorcerer's "it amplifies" against the Sandals' "they amplify", the
     Shaman Reaper's "floods ... with mana" against the Leggings' "grants ... mana") keeps its own
     wording and therefore its own translation --- */
  "Carved from the shell of the ancient Ika turtles, it absorbs the initial blows.": [
    "Tallada en el caparazón de las antiguas tortugas Ika, absorbe los primeros golpes.",
    "Taillée dans la carapace des anciennes tortues Ika, elle absorbe les premiers coups.", "Intagliata nel guscio delle antiche tartarughe Ika, assorbe i primi colpi."
  ],
  "Carved from the shell of the ancient Ika turtles, they absorb the initial blows.": [
    "Talladas en el caparazón de las antiguas tortugas Ika, absorben los primeros golpes.",
    "Taillées dans la carapace des anciennes tortues Ika, elles absorbent les premiers coups.", "Intagliate nel guscio delle antiche tartarughe Ika, assorbono i primi colpi."
  ],
  "Forged in Tolbana's forge, it makes the warrior an impenetrable wall.": [
    "Forjada en la fragua de Tolbana, convierte al guerrero en un muro impenetrable.",
    "Forgée dans la forge de Tolbana, elle fait du guerrier un mur impénétrable.", "Forgiata nella fucina di Tolbana, rende il guerriero un muro impenetrabile."
  ],
  "Replica of the Guardian's Armor. Fallen: Heavy and unshakeable, it defies death itself.": [
    "Réplica de la Armadura del Guardián. Caído: Pesada e inquebrantable, desafía a la muerte misma.",
    "Réplique de l'Armure du Gardien. Déchu : Lourde et inébranlable, elle défie la mort elle-même.", "Replica dell'Armatura del Guardiano. Caduto: pesante e incrollabile, sfida la morte stessa."
  ],
  "Dark leather and silent soles, designed to approach silently and strike from behind.": [
    "Cuero oscuro y suelas silenciosas, diseñados para acercarse en silencio y golpear por la espalda.",
    "Cuir sombre et semelles silencieuses, conçus pour approcher en silence et frapper dans le dos.", "Cuoio scuro e suole silenziose, progettati per avvicinarsi in silenzio e colpire alle spalle."
  ],
  "Dark leather and silent soles, designed for approaching silently and striking from behind.": [
    "Cuero oscuro y suelas silenciosas, diseñados para aproximarse en silencio y atacar por la espalda.",
    "Cuir sombre et semelles silencieuses, conçus pour s'approcher en silence et frapper dans le dos.", "Cuoio scuro e suole silenziose, progettati per avvicinarsi in silenzio e attaccare alle spalle."
  ],
  "Light as a shadow, it embraces the assassin and steals him from death.": [
    "Ligera como una sombra, abraza al asesino y lo arrebata de la muerte.",
    "Léger comme une ombre, il enveloppe l'assassin et le soustrait à la mort.", "Leggero come un'ombra, abbraccia l'assassino e lo sottrae alla morte."
  ],
  "Inherited from the Fallen Herald, it becomes shadow and dagger in the hands of the assassin.": [
    "Heredada del Heraldo Caído, se convierte en sombra y daga en manos del asesino.",
    "Héritée du Héraut déchu, elle devient ombre et dague entre les mains de l'assassin.", "Ereditata dall'araldo caduto, diventa ombra e pugnale nelle mani dell'assassino."
  ],
  "Soft leather and fitted straps, designed to strike quickly and disappear before the counterattack.": [
    "Cuero suave y correas ajustadas, diseñados para golpear rápido y desaparecer antes del contraataque.",
    "Cuir souple et sangles ajustées, conçus pour frapper rapidement et disparaître avant la riposte.", "Cuoio morbido e cinghie aderenti, progettati per colpire rapido e sparire prima del contrattacco."
  ],
  "Soft leather and fitted straps, designed to strike fast and disappear before the counterattack.": [
    "Cuero suave y correas ajustadas, diseñados para atacar velozmente y desaparecer antes del contraataque.",
    "Cuir souple et sangles ajustées, conçus pour frapper vite et disparaître avant la riposte.", "Cuoio morbido e cinghie aderenti, progettati per colpire veloce e sparire prima del contrattacco."
  ],
  "Designed for the hunt, it sharpens the archer's eye and guides their shots to the heart.": [
    "Diseñada para la caza, agudiza el ojo del arquero y guía sus disparos al corazón.",
    "Conçue pour la chasse, elle aiguise l'œil de l'archer et guide ses tirs vers le cœur.", "Progettata per la caccia, affina l'occhio dell'arciere e guida i suoi tiri al cuore."
  ],
  "Inherited from the Fallen Herald, light and faithful, it follows the archer into every ambush.": [
    "Heredada del Heraldo Caído, ligera y fiel, sigue al arquero en cada emboscada.",
    "Héritée du Héraut déchu, légère et fidèle, elle suit l'archer dans chaque embuscade.", "Ereditata dall'araldo caduto, leggera e fedele, segue l'arciere in ogni imboscata."
  ],
  "Woven from a spectral veil, it channels the nascent magic of Aincrad's apprentices.": [
    "Tejida con un velo espectral, canaliza la magia naciente de los aprendices de Aincrad.",
    "Tissée d'un voile spectral, elle canalise la magie naissante des apprentis d'Aincrad.", "Tessuta con un velo spettrale, canalizza la magia nascente degli apprendisti di Aincrad."
  ],
  "Embroidered with enchanted threads, it amplifies the mage's spells like a sorcerer of old.": [
    "Bordada con hilos encantados, amplifica los hechizos del mago como un hechicero de antaño.",
    "Brodée de fils enchantés, elle amplifie les sorts du mage comme un sorcier d'autrefois.", "Ricamata con fili incantati, amplifica gli incantesimi del mago come uno stregone di un tempo."
  ],
  "Embroidered with enchanted threads, they amplify the mage's spells like those of a sorcerer of old.": [
    "Bordadas con hilos encantados, amplifican los hechizos del mago como los de un hechicero de antaño.",
    "Brodées de fils enchantés, elles amplifient les sorts du mage comme ceux d'un sorcier d'autrefois.", "Ricamati con fili incantati, amplificano gli incantesimi del mago come quelli di uno stregone di un tempo."
  ],
  "A replica of the Fallen Reaper, it amplifies spell power tenfold and reaps the enemy from afar.": [
    "Una réplica del Segador Caído, multiplica por diez el poder mágico y siega al enemigo desde lejos.",
    "Une réplique du Faucheur déchu, elle décuple la puissance magique et fauche l'ennemi de loin.", "Una replica del mietitore caduto: decuplica la potenza magica e miete il nemico da lontano."
  ],
  "Woven in the breath of spirits, it connects its wearer to the beasts and ancient woods of Aincrad.": [
    "Tejida con el aliento de los espíritus, conecta a quien la lleva con las bestias y los bosques ancestrales de Aincrad.",
    "Tissée du souffle des esprits, elle relie celui qui la porte aux bêtes et aux forêts anciennes d'Aincrad.", "Tessuta nel respiro degli spiriti, collega chi la indossa alle bestie e ai boschi antichi di Aincrad."
  ],
  "Woven from the breath of spirits, it connects its wearer to the beasts and ancient woods of Aincrad.": [
    "Tejida del aliento de los espíritus, conecta a quien la lleva con las bestias y los bosques ancestrales de Aincrad.",
    "Tissée à partir du souffle des esprits, elle relie celui qui la porte aux bêtes et aux forêts anciennes d'Aincrad.", "Tessuta dal respiro degli spiriti, collega chi la indossa alle bestie e ai boschi antichi di Aincrad."
  ],
  "Imbued with ancient rituals, it nourishes the shaman's mana and prolongs their incantations.": [
    "Imbuida de rituales ancestrales, nutre el maná del chamán y prolonga sus conjuros.",
    "Imprégnée de rituels anciens, elle nourrit le mana du chaman et prolonge ses incantations.", "Impregnata di rituali antichi, nutre il mana dello sciamano e prolunga i suoi incantesimi."
  ],
  "A replica of the Fallen Reaper, it floods the shaman with mana for both healing and striking.": [
    "Una réplica del Segador Caído, inunda al chamán de maná tanto para curar como para golpear.",
    "Une réplique du Faucheur déchu, elle inonde le chaman de mana pour soigner comme pour frapper.", "Una replica del mietitore caduto: inonda lo sciamano di mana, sia per curare sia per colpire."
  ],
  "A replica of the Fallen Reaper, it grants the shaman mana for both healing and striking.": [
    "Una réplica del Segador Caído, otorga al chamán maná tanto para curar como para golpear.",
    "Une réplique du Faucheur déchu, elle accorde au chaman du mana pour soigner comme pour frapper.", "Una replica del mietitore caduto: concede allo sciamano mana, sia per curare sia per colpire."
  ],
  /* --- The Weakling Wolf and Bandit accessory descriptions, one entry per supplied sentence. The
     necklace's sentence is the supplied variant, not the "snatched from the alpha wolf" sentence the
     Wolf-set gloves above already carry, so the two are kept apart. --- */
  "A ring set with a wolf's fang, a relic of a feeble yet ferocious pack": [
    "Un anillo engastado con un colmillo de lobo, reliquia de una manada débil pero feroz",
    "Une bague sertie d'un croc de loup, relique d'une meute chétive mais féroce", "Un anello incastonato con una zanna di lupo, reliquia di un branco debole ma feroce"
  ],
  "Adorned with massive fangs, torn from the alpha wolf Albal, dominant predator of the wolves' valley": [
    "Adornado con enormes colmillos arrancados al lobo alfa Albal, depredador dominante del valle de los lobos",
    "Orné de crocs massifs arrachés au loup alpha Albal, prédateur dominant de la vallée des loups", "Adornata con zanne enormi, strappate al lupo alfa Albal, predatore dominante della valle dei lupi"
  ],
  "Gloves worn to a thread, marked by a thousand petty thefts and treacherous blows": [
    "Guantes gastados hasta el hilo, marcados por mil pequeños hurtos y golpes traicioneros",
    "Des gants usés jusqu'à la corde, marqués par mille menus larcins et coups perfides", "Guanti logorati fino al filo, segnati da mille piccoli furti e colpi traditori"
  ],
  "A threadbare hood that conceals the face in the shadows of the alleys": [
    "Una capucha raída que oculta el rostro en las sombras de los callejones",
    "Une capuche élimée qui dissimule le visage dans l'ombre des ruelles", "Un cappuccio logoro che nasconde il volto nelle ombre dei vicoli"
  ],
  "An amulet plucked from a poorly guarded chest, the loot of a daring bandit": [
    "Un amuleto sacado de un cofre mal vigilado, el botín de un bandido audaz",
    "Une amulette tirée d'un coffre mal gardé, le butin d'un bandit audacieux", "Un amuleto preso da uno scrigno mal custodito, il bottino di un bandito audace"
  ],
  "A cloak stolen from the back of a traveler; it still smells of the getaway": [
    "Una capa robada de la espalda de un viajero; aún huele a la huida",
    "Une cape volée sur le dos d'un voyageur ; elle sent encore la fuite", "Un mantello rubato dalla schiena di un viaggiatore; sa ancora di fuga"
  ],
  "A coin snatched from a purse, the lucky charm of a thief with nimble hands": [
    "Una moneda arrebatada de una bolsa, el amuleto de la suerte de un ladrón de manos ágiles",
    "Une pièce arrachée à une bourse, le porte-bonheur d'un voleur aux mains agiles", "Una moneta strappata da una borsa, il portafortuna di un ladro dalle mani agili"
  ]
};

const curatedQuestTranslations = {
  // Aincrad / Fractured Underworld Main Questline (Current Data)
  "A New World": ["Un nuevo mundo", "Un nouveau monde", "Un nuovo mondo"],
  "A Decisive Choice": ["Una decisión decisiva", "Un choix décisif", "Una scelta decisiva"],
  "A New Horizon": ["Un nuevo horizonte", "Un nouvel horizon", "Un nuovo orizzonte"],
  "Show Me": ["Demuéstramelo", "Montre-moi", "Mostrami"],
  "The Essentials": ["Lo esencial", "L'essentiel", "L'essenziale"],
  "What No One Will Touch": ["Lo que nadie querrá tocar", "Ce que personne ne voudra toucher", "Ciò che nessuno vorrà toccare"],
  "The New World": ["El nuevo mundo", "Le nouveau monde", "Il nuovo mondo"],
  "Towards the Gigas Cedar...": ["Hacia el Cedro Gigas...", "Vers le Cèdre Gigas...", "Verso il Cedro Gigas..."],
  "Cutting wood...": ["Cortando madera...", "Couper du bois...", "Tagliare la legna..."],
  "Analyze the Gigas Cedar": ["Analiza el Cedro Gigas", "Analysez le Cèdre Gigas", "Analizza il Cedro Gigas"],
  "Stabilizing the Cardinal Relay...": ["Estabilizando el Relé Cardinal...", "Stabiliser le Relais Cardinal...", "Stabilizzare il Relè Cardinale..."],
  "The Forge before the sword...": ["La forja antes de la espada...", "La forge avant l'épée...", "La forgia prima della spada..."],
  "The village or Rulid...": ["El pueblo de Rulid...", "Le village de Rulid...", "Il villaggio di Rulid..."],
  "Blessing of the Hero...": ["La bendición del héroe...", "La bénédiction du héros...", "La benedizione dell'eroe..."],
  "The First Harvests": ["Las primeras cosechas", "Les premières récoltes", "Le prime colture"],
  "Calm Water": ["Aguas tranquilas", "Eau calme", "Acqua calma"],
  "Azure Crystals": ["Cristales azur", "Cristaux azur", "Cristalli azzurri"],
  "Memory Labrinth: The Goblin Cave of Rulid": [
    "Laberinto de la memoria: la cueva de los goblins de Rulid",
    "Labyrinthe de la mémoire : la grotte des gobelins de Rulid", "Labirinto della Memoria: la Caverna dei Goblin di Rulid"
  ],
  "Back to Aincrad": ["De vuelta a Aincrad", "Retour à Aincrad", "Ritorno ad Aincrad"],
  "The Assault": ["El asalto", "L'assaut", "L'assalto"],
  "The Forest of Small Webs": ["El bosque de las telarañas pequeñas", "La forêt des petites toiles", "La foresta delle piccole tele"],
  "Bury Them": ["Entiérralos", "Enterrez-les", "Seppelliscili"],
  "The Trader": ["El comerciante", "Le marchand", "Il mercante"],
  "The Slime Marsh": ["El pantano de slime", "Le marais de slime", "La palude di melma"],
  "The Foot of the Island": ["El pie de la isla", "Le pied de l'île", "Il piede dell'isola"],
  "The Broken Knot": ["El nudo roto", "Le nœud brisé", "Il nodo spezzato"],
  "The Suspended City": ["La ciudad suspendida", "La cité suspendue", "La città sospesa"],
  "What Emanates From You": ["Lo que emana de ti", "Ce qui émane de vous", "Ciò che emana da te"],
  "He Came": ["Él vino", "Il est venu", "È arrivato"],
  "At Elma's": ["En casa de Elma", "Chez Elma", "Da Elma"],
  "What Harrold Saw": ["Lo que Harrold vio", "Ce que Harrold a vu", "Ciò che Harrold vide"],
  "The Chamber Beneath the Fields": ["La cámara bajo los campos", "La chambre sous les champs", "La camera sotto i campi"],
  "The Geldorack Mine": ["La mina de Geldorack", "La mine de Geldorack", "La miniera di Geldorack"],
  "Velka, and the Ruins of the Dream": ["Velka, y las ruinas del sueño", "Velka, et les ruines du rêve", "Velka e le rovine del sogno"],
  "The Archivist Specter": ["El espectro archivista", "Le spectre archiviste", "Lo spettro archivista"],
  "Behind the Great Door": ["Tras la gran puerta", "Derrière la grande porte", "Dietro la grande porta"],
  "The Truth About the Seal": ["La verdad sobre el sello", "La vérité sur le sceau", "La verità sul sigillo"],
  "The Calamity": ["La calamidad", "La calamité", "La calamità"],
  "Mephisto": ["Mephisto", "Mephisto", "Mephisto"],
  "Request an Audience with King Harald": [
    "Solicitar una audiencia con el rey Harald",
    "Demander une audience au roi Harald", "Chiedi udienza al re Harald"
  ],
  "The Trials of the Heralds": ["Las pruebas de los heraldos", "Les épreuves des hérauts", "Le prove degli araldi"],
  "Find a Way to Remake the Scroll": [
    "Encuentra la forma de rehacer el pergamino",
    "Trouvez un moyen de refaire le parchemin", "Trova il modo di rifare il rotolo"
  ],
  "The Crystal of Tolbana": ["El cristal de Tolbana", "Le cristal de Tolbana", "Il cristallo di Tolbana"],
  "Floor 2": ["Piso 2", "Étage 2", "Piano 2"],
  /* Aincrad Current Data side quests (Aincrad/Quests/quests_current.js). */
  "Too Many Boars": ["Demasiados jabalíes", "Trop de sangliers", "Troppi cinghiali"],
  "Webs to Burn": ["Telarañas que quemar", "Des toiles à brûler", "Tele da bruciare"],
  "The Citadel's Cold": ["El frío de la ciudadela", "Le froid de la citadelle", "Il freddo della cittadella"],
  "Frost Swarm": ["Enjambre de escarcha", "Essaim de givre", "Sciame di gelo"],
  "Wolves of the Valley": ["Lobos del valle", "Loups de la vallée", "Lupi della valle"],
  "Clearing the Marsh": ["Despejar el pantano", "Nettoyer le marais", "Liberare la palude"],
  "Bone and Dust": ["Hueso y polvo", "Os et poussière", "Ossa e polvere"],
  "The Road Is No Longer Safe": ["El camino ya no es seguro", "La route n'est plus sûre", "La strada non è più sicura"],

  "Bad Idea": ["Mala idea", "Mauvaise idée", "Brutta idea"],
  "Request from Corentin of the Grand Regiment": [
    "Solicitud de Corentin del Gran Regimiento",
    "Demande de Corentin du Grand Régiment", "Richiesta di Corentin del Grande Reggimento"
  ],
  "Operation: Impress the Girlfriend": [
    "Operación: impresionar a la novia",
    "Opération : impressionner la petite amie", "Operazione: impressionare la fidanzata"
  ],
  "Request from Jean of the Grand Regiment": [
    "Solicitud de Jean del Gran Regimiento",
    "Demande de Jean du Grand Régiment", "Richiesta di Jean del Grande Reggimento"
  ],
  "the creation of the magic brush": ["La creación del pincel mágico", "La création du pinceau magique", "La creazione del pennello magico"],
  "Prove that you are not useless": ["Demuestra que no eres inútil", "Prouve que tu n'es pas inutile", "Dimostra di non essere inutile"],
  "This should work... right?": ["Esto debería funcionar... ¿verdad?", "Cela devrait fonctionner... n'est-ce pas ?", "Questo dovrebbe funzionare... no?"],
  "A forage without embers": ["Una recolección sin brasas", "Une récolte sans braises", "Una raccolta senza braci"],
  "Lighthouses request": ["La petición de los faros", "La demande des phares", "La richiesta dei fari"],
  "A magic potion... or almost": ["Una poción mágica... o casi", "Une potion magique... ou presque", "Una pozione magica... o quasi"],
  "A Bit of Slime and Metal": ["Un poco de slime y metal", "Un peu de slime et de métal", "Un po' di melma e metallo"],
  "Gift from a Wife": ["Regalo de una esposa", "Cadeau d'une épouse", "Regalo di una moglie"],
  "A talented craftsman": ["Un artesano talentoso", "Un artisan talentueux", "Un artigiano di talento"],
  "By the Branches of the Ancients": ["Por las ramas de los antiguos", "Par les branches des anciens", "Per i rami degli antichi"],
  "It stings, but it feels good": ["Pica, pero sienta bien", "Ça pique, mais ça fait du bien", "Punge, ma fa bene"],
  "The Basics of a Cabin": ["Los fundamentos de una cabaña", "Les bases d'une cabane", "Le basi di una capanna"],
  "The Walls of a Cabin": ["Las paredes de una cabaña", "Les murs d'une cabane", "Le pareti di una capanna"],
  "The Roof of a Cabin": ["El tejado de una cabaña", "Le toit d'une cabane", "Il tetto di una capanna"],
  "My first Weapon": ["Mi primera arma", "Ma première arme", "La mia prima arma"],
  "A little of each": ["Un poco de cada cosa", "Un peu de chaque chose", "Un po' di tutto"],
  "A good little meal": ["Una buena comida", "Un bon petit repas", "Un buon pasto"],
  "The Art of Feathers": ["El arte de las plumas", "L'art des plumes", "L'arte delle piume"],
  "The Art of Skins": ["El arte de las pieles", "L'art des peaux", "L'arte delle pelli"],
  "Help with Cooking": ["Ayuda con la cocina", "Aide en cuisine", "Aiuto in cucina"],
  "No, it's Sape!": ["¡No, es Sape!", "Non, c'est Sape !", "No, è Sape!"],
  "Hater du Vert": ["Hater du Vert", "Hater du Vert", "Hater du Vert"],
  "Bushi's Philosophy": ["La filosofía de Bushi", "La philosophie de Bushi", "La filosofia di Bushi"],
  "The Onyx of Knowledge": ["El ónice del conocimiento", "L'onyx de la connaissance", "L'onice della conoscenza"],
  "Cleanse the skies of Taran": ["Purifica los cielos de Taran", "Purifie les cieux de Taran", "Purifica i cieli di Taran"],
  "The Hunter's Trial": ["La prueba del cazador", "L'épreuve du chasseur", "La prova del cacciatore"],
  "Help Yuko": ["Ayuda a Yuko", "Aide Yuko", "Aiuta Yuko"],
  "Materials for ShiShi": ["Materiales para ShiShi", "Matériaux pour ShiShi", "Materiali per ShiShi"],
  "The Man Who Lost His Pants": ["El hombre que perdió sus pantalones", "L'homme qui a perdu son pantalon", "L'uomo che perse i pantaloni"],
  "The Shadow under the Red Iris": ["La sombra bajo el iris rojo", "L'ombre sous l'iris rouge", "L'ombra sotto l'iris rosso"],
  "The new undermines": ["Las nuevas minas subterráneas", "Les nouvelles mines souterraines", "Le nuove miniere sotterranee"],
  "Good accounts make good friends": ["Las buenas cuentas hacen buenos amigos", "Les bons comptes font les bons amis", "I buoni conti fanno i buoni amici"],
  "The Ashes of the Past": ["Las cenizas del pasado", "Les cendres du passé", "Le ceneri del passato"],
  "The Prankster Goblins": ["Los goblins bromistas", "Les gobelins farceurs", "I goblin burloni"],
  "Shadows of the Lost Forest": ["Sombras del bosque perdido", "Ombres de la forêt perdue", "Ombre della Foresta Perduta"],
  "The wild threat": ["La amenaza salvaje", "La menace sauvage", "La minaccia selvaggia"],
  "The Great Feast": ["El gran festín", "Le grand festin", "Il grande banchetto"],
  "The mask of the Memory Tree": ["La máscara del árbol de la memoria", "Le masque de l'arbre de la mémoire", "La maschera dell'Albero della Memoria"],
  "Orc & Roll": ["Orc & Roll", "Orc & Roll", "Orco & Roll"],
  "Regulation quota": ["Cuota reglamentaria", "Quota réglementaire", "Quota regolamentare"],
  "A very strange lumberjack": ["Un leñador muy extraño", "Un bûcheron très étrange", "Un taglialegna molto strano"],
  "2 Paths, 1 Choice": ["2 caminos, 1 elección", "2 chemins, 1 choix", "2 cammini, 1 scelta"],
  "The Dance of the Sleeping Treants": ["La danza de los treants dormidos", "La danse des tréants endormis", "La danza dei treant addormentati"],
  "The Forge of a God": ["La forja de un dios", "La forge d'un dieu", "La forgia di un dio"],
  "The legend of Zilda": ["La leyenda de Zilda", "La légende de Zilda", "La leggenda di Zilda"],
  "The Ascalon Oath": ["El juramento de Ascalon", "Le serment d'Ascalon", "Il giuramento di Ascalon"],
  "Article proposal": ["Propuesta de artículo", "Proposition d'article", "Proposta di articolo"],
  "The Seas Footprint": ["La huella de los mares", "L'empreinte des mers", "L'impronta dei mari"],
  "Blided Orcs or Pulmed Orcs!": ["¡Orcos cegados u orcos desplumados!", "Orques aveuglés ou orques plumés !", "Orchi accecati o orchi spennati!"],
  "The Relax Cat": ["El gato relajado", "Le chat relaxé", "Il gatto rilassato"],
  "The Bell Tower of the Dark Messenger": ["El campanario del mensajero oscuro", "Le clocher du messager des ténèbres", "Il campanile del messaggero oscuro"]
};

const curatedQuestFieldTranslations = {
  // Aincrad / Fractured Underworld Main Questline (Current Data)
  "Talk to the Mysterious Character (0, 200, 5)": [
    "Habla con el Personaje Misterioso (0, 200, 5)",
    "Parlez au Personnage Mystérieux (0, 200, 5)", "Parla con il Personaggio Misterioso (0, 200, 5)"
  ],
  "Talk to the Master Swordsman (1008, 200, 8)\nTry the Warrior Class\nTry the Archer Class\nTry the Shaman Class\nTry the Mage Class\nTry the Assassin Class\nTalk to the Master Swordsman (1008, 200, 8)":
    [
      "Habla con el Maestro Espadachín (1008, 200, 8)\nPrueba la clase Guerrero\nPrueba la clase Arquero\nPrueba la clase Chamán\nPrueba la clase Mago\nPrueba la clase Asesino\nHabla con el Maestro Espadachín (1008, 200, 8)",
      "Parlez au Maître Spadassin (1008, 200, 8)\nEssayez la classe Guerrier\nEssayez la classe Archer\nEssayez la classe Chaman\nEssayez la classe Mage\nEssayez la classe Assassin\nParlez au Maître Spadassin (1008, 200, 8)", "Parla con il Maestro Spadaccino (1008, 200, 8)\nProva la classe Guerriero\nProva la classe Arciere\nProva la classe Sciamano\nProva la classe Mago\nProva la classe Assassino\nParla con il Maestro Spadaccino (1008, 200, 8)"
    ],
  "Talk to the Swordmaster (1089, 19, 4289)\nBuy a chestplate: the Beginner's Tunic\nBuy the Beginner's Leggings\nBuy a Training Sword/Training Magic Staff/Training Bow/Training Dagger (Item Depends on your class)\nGo back up to the Swordmaster (1089, 19, 4289)":
    [
      "Habla con el Maestro de Espadas (1089, 19, 4289)\nCompra una pechera: la Túnica de Principiante\nCompra las Polainas de Principiante\nCompra una Espada de Entrenamiento/Bastón Mágico de Entrenamiento/Arco de Entrenamiento/Daga de Entrenamiento (el objeto depende de tu clase)\nVuelve a subir hasta el Maestro de Espadas (1089, 19, 4289)",
      "Parlez au Maître d'Épée (1089, 19, 4289)\nAchetez un plastron : la Tunique de Débutant\nAchetez les Jambières de Débutant\nAchetez une Épée d'Entraînement/Bâton Magique d'Entraînement/Arc d'Entraînement/Dague d'Entraînement (l'objet dépend de votre classe)\nRemontez voir le Maître d'Épée (1089, 19, 4289)", "Parla con il Maestro di Spada (1089, 19, 4289)\nCompra una corazza: la Tunica da principiante\nCompra i Gambali da principiante\nCompra una Spada da addestramento/Bastone magico da addestramento/Arco da addestramento/Pugnale da addestramento (l'oggetto dipende dalla tua classe)\nRisali dal Maestro di Spada (1089, 19, 4289)"
    ],
  "Take the teleporter Facing the Forge (1816, 17, 4136)\nTalk to the apprentice blacksmith (1789, 32, 3636)\nSlay 16 Boars ~(1798, 31, 3617)\nBring 16 Hides to the Blacksmith (1789, 32, 3636)\nBring the hides back to Abraham (1789, 32, 3636)":
    [
      "Toma el teletransportador frente a la Forja (1816, 17, 4136)\nHabla con el herrero aprendiz (1789, 32, 3636)\nMata 16 jabalíes ~(1798, 31, 3617)\nLleva 16 pieles al Herrero (1789, 32, 3636)\nLleva las pieles de vuelta a Abraham (1789, 32, 3636)",
      "Prenez le téléporteur face à la Forge (1816, 17, 4136)\nParlez au forgeron apprenti (1789, 32, 3636)\nTuez 16 sangliers ~(1798, 31, 3617)\nApportez 16 peaux au Forgeron (1789, 32, 3636)\nRapportez les peaux à Abraham (1789, 32, 3636)", "Prendi il teletrasporto davanti alla Forgia (1816, 17, 4136)\nParla con il fabbro apprendista (1789, 32, 3636)\nUccidi 16 cinghiali ~(1798, 31, 3617)\nPorta 16 pelli al Fabbro (1789, 32, 3636)\nRiporta le pelli ad Abraham (1789, 32, 3636)"
    ],
  "Find the Alchemist in his workshop (1772, 16, 4096)\nGather 5 allium Flowers in the Fields north-east of the village. ~(2362, 22, 3651)\nGather 5 Wheat in the Fields north-east of the village. ~(2362, 22, 3651)\nGet closer to the noise. (2372, 20, 3702)\nGo back to the Alchemist (1772, 16, 4096)":
    [
      "Encuentra al Alquimista en su taller (1772, 16, 4096)\nReúne 5 flores de allium en los campos al noreste del pueblo. ~(2362, 22, 3651)\nReúne 5 de trigo en los campos al noreste del pueblo. ~(2362, 22, 3651)\nAcércate al ruido. (2372, 20, 3702)\nVuelve con el Alquimista (1772, 16, 4096)",
      "Trouvez l'Alchimiste dans son atelier (1772, 16, 4096)\nRécoltez 5 fleurs d'allium dans les champs au nord-est du village. ~(2362, 22, 3651)\nRécoltez 5 de blé dans les champs au nord-est du village. ~(2362, 22, 3651)\nApprochez-vous du bruit. (2372, 20, 3702)\nRetournez voir l'Alchimiste (1772, 16, 4096)", "Trova l'Alchimista nella sua bottega (1772, 16, 4096)\nRaccogli 5 fiori di allium nei campi a nord-est del villaggio. ~(2362, 22, 3651)\nRaccogli 5 di grano nei campi a nord-est del villaggio. ~(2362, 22, 3651)\nAvvicinati al rumore. (2372, 20, 3702)\nTorna dall'Alchimista (1772, 16, 4096)"
    ],
  "Tell him about the shard (1772, 16, 4096)\nGo see the Sword Master (1089, 19, 4289)\nReach the impact site, in the Petal Valley (1051, 38, 4367)":
    [
      "Cuéntale lo del fragmento (1772, 16, 4096)\nVe a ver al Maestro de Espadas (1089, 19, 4289)\nLlega al punto de impacto, en el Valle de los Pétalos (1051, 38, 4367)",
      "Parlez-lui de l'éclat (1772, 16, 4096)\nAllez voir le Maître d'Épée (1089, 19, 4289)\nAtteignez le point d'impact, dans la Vallée des Pétales (1051, 38, 4367)", "Raccontagli del frammento (1772, 16, 4096)\nVai a vedere il Maestro di Spada (1089, 19, 4289)\nRaggiungi il punto d'impatto, nella Valle dei Petali (1051, 38, 4367)"
    ],
  "Talk to Eugeo (0, 65, 7)\nConsult the Mysterious Cube (-1, 65, 7)\nTalk to Eugeo again (0, 65, 7)": [
    "Habla con Eugeo (0, 65, 7)\nConsulta el Cubo Misterioso (-1, 65, 7)\nHabla con Eugeo otra vez (0, 65, 7)",
    "Parlez à Eugeo (0, 65, 7)\nConsultez le Cube Mystérieux (-1, 65, 7)\nParlez de nouveau à Eugeo (0, 65, 7)", "Parla con Eugeo (0, 65, 7)\nConsulta il Cubo Misterioso (-1, 65, 7)\nParla di nuovo con Eugeo (0, 65, 7)"
  ],
  "Meet up with Eugeo at the Foot of the tree (-70, -24, 176)": [
    "Queda con Eugeo al pie del árbol (-70, -24, 176)",
    "Retrouvez Eugeo au pied de l'arbre (-70, -24, 176)", "Incontra Eugeo ai piedi dell'albero (-70, -24, 176)"
  ],
  "Harvest 10 Oak Log\nGo back to Eugeo (-70, -24, 176)": [
    "Recolecta 10 troncos de roble\nVuelve con Eugeo (-70, -24, 176)",
    "Récoltez 10 bûches de chêne\nRetournez voir Eugeo (-70, -24, 176)", "Raccogli 10 Tronchi di quercia\nTorna da Eugeo (-70, -24, 176)"
  ],
  "Use System Call to view information about the Gigas Cedar.": [
    "Usa System Call para ver información sobre el Cedro Gigas.",
    "Utilisez System Call pour consulter les informations sur le Cèdre Gigas.", "Usa System Call per vedere le informazioni sul Cedro Gigas."
  ],
  "Go back to Eugeo (-70, -24, 176)\nUse the resources you've collected to upgrade the Cardinal Relay": [
    "Vuelve con Eugeo (-70, -24, 176)\nUsa los recursos que has reunido para mejorar el Relé Cardinal",
    "Retournez voir Eugeo (-70, -24, 176)\nUtilisez les ressources récoltées pour améliorer le Relais Cardinal", "Torna da Eugeo (-70, -24, 176)\nUsa le risorse che hai raccolto per migliorare il Relè Cardinale"
  ],
  "Talk to Eugeo to find out more (0, 65, 7)\nForge a Training Dagger\nShow the Forged weapon to Eugeo (0, 65, 7)": [
    "Habla con Eugeo para saber más (0, 65, 7)\nForja una Daga de Entrenamiento\nMuéstrale el arma forjada a Eugeo (0, 65, 7)",
    "Parlez à Eugeo pour en savoir plus (0, 65, 7)\nForgez une Dague d'Entraînement\nMontrez l'arme forgée à Eugeo (0, 65, 7)", "Parla con Eugeo per saperne di più (0, 65, 7)\nForgia un Pugnale da addestramento\nMostra l'arma forgiata a Eugeo (0, 65, 7)"
  ],
  "Teleport to Rulid\nFind Eugeo in Rulid (189, 71, 226)": [
    "Teletranspórtate a Rulid\nEncuentra a Eugeo en Rulid (189, 71, 226)",
    "Téléportez-vous à Rulid\nTrouvez Eugeo à Rulid (189, 71, 226)", "Teletrasportati a Rulid\nTrova Eugeo a Rulid (189, 71, 226)"
  ],
  "Talk to Selka (188, 71, 231)": ["Habla con Selka (188, 71, 231)", "Parlez à Selka (188, 71, 231)", "Parla con Selka (188, 71, 231)"],
  "Go back and see Eugeo (189, 71, 226)\nHarvest 3 wheat of Rulid\nHarvest 1 Wheat Blossom\nGo back to your Island\nPickup a Field From the system creation and put it down\nPlant 1 Wheat Seed\nReturn to Eugeo (0, 65, 7)":
    [
      "Vuelve a ver a Eugeo (189, 71, 226)\nCosecha 3 de trigo de Rulid\nCosecha 1 Flor de Trigo\nVuelve a tu isla\nRecoge un campo de la creación del sistema y colócalo\nPlanta 1 Semilla de Trigo\nVuelve con Eugeo (0, 65, 7)",
      "Retournez voir Eugeo (189, 71, 226)\nRécoltez 3 de blé de Rulid\nRécoltez 1 Fleur de Blé\nRetournez sur votre île\nRécupérez un champ dans la création du système et posez-le\nPlantez 1 Graine de Blé\nRetournez voir Eugeo (0, 65, 7)", "Torna a vedere Eugeo (189, 71, 226)\nRaccogli 3 di grano di Rulid\nRaccogli 1 Fiore di grano\nTorna sulla tua Isola\nPreleva un Campo dalla creazione del sistema e posizionalo\nPianta 1 Seme di grano\nTorna da Eugeo (0, 65, 7)"
    ],
  "Find Eugeo on the Fishing Island (-75, 66, 74)\nFish 1 Trout\nFish 1 Carp\nGo back and see Eugeo on your Island (0, 65, 7)":
    [
      "Encuentra a Eugeo en la Isla de Pesca (-75, 66, 74)\nPesca 1 trucha\nPesca 1 carpa\nVuelve a ver a Eugeo en tu isla (0, 65, 7)",
      "Trouvez Eugeo sur l'Île de Pêche (-75, 66, 74)\nPêchez 1 truite\nPêchez 1 carpe\nRetournez voir Eugeo sur votre île (0, 65, 7)", "Trova Eugeo sull'Isola di Pesca (-75, 66, 74)\nPesca 1 trota\nPesca 1 carpa\nTorna a vedere Eugeo sulla tua Isola (0, 65, 7)"
    ],
  "Join Eugeo at the Ice Cave (-117, 87, 128)\nHarvest 3 Azure Crystals (3)\nGo back and see Eugeo at the back of the cave (-111, 88, 203)":
    [
      "Únete a Eugeo en la Cueva de Hielo (-117, 87, 128)\nRecolecta 3 Cristales azur (3)\nVuelve a ver a Eugeo al fondo de la cueva (-111, 88, 203)",
      "Rejoignez Eugeo à la Grotte de Glace (-117, 87, 128)\nRécoltez 3 Cristaux azur (3)\nRetournez voir Eugeo au fond de la grotte (-111, 88, 203)", "Unisciti a Eugeo alla Caverna di Ghiaccio (-117, 87, 128)\nRaccogli 3 Cristalli azzurri (3)\nTorna a vedere Eugeo in fondo alla caverna (-111, 88, 203)"
    ],
  "Emerge victorious From the Memory Labyrinth\nTalk to Eugeo (0, 65, 7)": [
    "Sal victorioso del Laberinto de la Memoria\nHabla con Eugeo (0, 65, 7)",
    "Sortez victorieux du Labyrinthe de la Mémoire\nParlez à Eugeo (0, 65, 7)", "Esci vittorioso dal Labirinto della Memoria\nParla con Eugeo (0, 65, 7)"
  ],
  "Go back to Aincrad: open the game menu and click the Aincrad icon": [
    "Vuelve a Aincrad: abre el menú del juego y haz clic en el icono de Aincrad",
    "Retournez à Aincrad : ouvrez le menu du jeu et cliquez sur l'icône Aincrad", "Torna ad Aincrad: apri il menu di gioco e clicca sull'icona Aincrad"
  ],
  "Go see the Swordmaster (1089, 19, 4289)\nGo back to the Master Swordsman (1089, 19, 4289)\nTravel to Hanaka ~(1576, 31, 3460)":
    [
      "Ve a ver al Maestro de Espadas (1089, 19, 4289)\nVuelve con el Maestro Espadachín (1089, 19, 4289)\nViaja a Hanaka ~(1576, 31, 3460)",
      "Allez voir le Maître d'Épée (1089, 19, 4289)\nRetournez voir le Maître Spadassin (1089, 19, 4289)\nRendez-vous à Hanaka ~(1576, 31, 3460)", "Vai a vedere il Maestro di Spada (1089, 19, 4289)\nTorna dal Maestro Spadaccino (1089, 19, 4289)\nViaggia verso Hanaka ~(1576, 31, 3460)"
    ],
  "Repel the first wave (5)\nRepel the second wave (5)\nRepel the final wave (5)\nFree the villager (right-click)\nTalk to the Mayor (1526, 30, 3412)":
    [
      "Repele la primera oleada (5)\nRepele la segunda oleada (5)\nRepele la oleada final (5)\nLibera al aldeano (clic derecho)\nHabla con el Alcalde (1526, 30, 3412)",
      "Repoussez la première vague (5)\nRepoussez la deuxième vague (5)\nRepoussez la vague finale (5)\nLibérez le villageois (clic droit)\nParlez au Maire (1526, 30, 3412)", "Respingi la prima ondata (5)\nRespingi la seconda ondata (5)\nRespingi l'ondata finale (5)\nLibera il villico (clic destro)\nParla con il Sindaco (1526, 30, 3412)"
    ],
  "Travel to the Forest of Small Webs (1358, 26, 3539)\nFind the second body (1341, 28, 3521)\nFind the third body (1375, 30, 3512)\nReport back to the Mayor (1526, 30, 3412)":
    [
      "Viaja al Bosque de las Telarañas Pequeñas (1358, 26, 3539)\nEncuentra el segundo cuerpo (1341, 28, 3521)\nEncuentra el tercer cuerpo (1375, 30, 3512)\nVuelve a informar al Alcalde (1526, 30, 3412)",
      "Rendez-vous dans la Forêt des Petites Toiles (1358, 26, 3539)\nTrouvez le deuxième corps (1341, 28, 3521)\nTrouvez le troisième corps (1375, 30, 3512)\nRetournez faire votre rapport au Maire (1526, 30, 3412)", "Viaggia verso la Foresta delle Piccole Tele (1358, 26, 3539)\nTrova il secondo corpo (1341, 28, 3521)\nTrova il terzo corpo (1375, 30, 3512)\nRiferisci al Sindaco (1526, 30, 3412)"
    ],
  "Carry the First body on your back (1341, 28, 3521)\nCarry the second body on your back (1375, 30, 3512)\nCarry the third body on your back (1526, 30, 3412)\nBury a body in the First grave (1256, 42, 3770)\nBury a body in the second grave (1254, 42, 3770)\nBury a body in the third grave (1252, 42, 3770)\nReturn to the Mayor of Hanaka (1526, 30, 3412)":
    [
      "Carga el primer cuerpo a la espalda (1341, 28, 3521)\nCarga el segundo cuerpo a la espalda (1375, 30, 3512)\nCarga el tercer cuerpo a la espalda (1526, 30, 3412)\nEntierra un cuerpo en la primera tumba (1256, 42, 3770)\nEntierra un cuerpo en la segunda tumba (1254, 42, 3770)\nEntierra un cuerpo en la tercera tumba (1252, 42, 3770)\nVuelve con el Alcalde de Hanaka (1526, 30, 3412)",
      "Portez le premier corps sur votre dos (1341, 28, 3521)\nPortez le deuxième corps sur votre dos (1375, 30, 3512)\nPortez le troisième corps sur votre dos (1526, 30, 3412)\nEnterrez un corps dans la première tombe (1256, 42, 3770)\nEnterrez un corps dans la deuxième tombe (1254, 42, 3770)\nEnterrez un corps dans la troisième tombe (1252, 42, 3770)\nRetournez voir le Maire de Hanaka (1526, 30, 3412)", "Porta il primo corpo sulle spalle (1341, 28, 3521)\nPorta il secondo corpo sulle spalle (1375, 30, 3512)\nPorta il terzo corpo sulle spalle (1526, 30, 3412)\nSeppellisci un corpo nella prima tomba (1256, 42, 3770)\nSeppellisci un corpo nella seconda tomba (1254, 42, 3770)\nSeppellisci un corpo nella terza tomba (1252, 42, 3770)\nTorna dal Sindaco di Hanaka (1526, 30, 3412)"
    ],
  "Meet the Mayor's Trader (1564, 36, 3428)\nKill 15 Spiders\nCollect 5 venom glands\nBring the venom to the trader\nTalk to the Trader (1564, 36, 3428)":
    [
      "Conoce al Comerciante del Alcalde (1564, 36, 3428)\nMata 15 arañas\nReúne 5 glándulas de veneno\nLleva el veneno al comerciante\nHabla con el Comerciante (1564, 36, 3428)",
      "Rencontrez le Marchand du Maire (1564, 36, 3428)\nTuez 15 araignées\nRécoltez 5 glandes de venin\nApportez le venin au marchand\nParlez au Marchand (1564, 36, 3428)", "Incontra il Commerciante del Sindaco (1564, 36, 3428)\nUccidi 15 ragni\nRaccogli 5 ghiandole di veleno\nPorta il veleno al commerciante\nParla con il Commerciante (1564, 36, 3428)"
    ],
  "Take the western road to the Foot of the Island\nTalk to Ceyla (499, 24, 3043)": [
    "Toma el camino del oeste hasta el Pie de la Isla\nHabla con Ceyla (499, 24, 3043)",
    "Prenez la route de l'ouest jusqu'au Pied de l'Île\nParlez à Ceyla (499, 24, 3043)", "Prendi la strada a ovest fino al Piede dell'Isola\nParla con Ceyla (499, 24, 3043)"
  ],
  "Talk to Baldim (507, 24, 3044)\nGo to the Garden of Giants ~(374, 159, 2479)\nTalk to Zebulgarath (374, 159, 2479)":
    [
      "Habla con Baldim (507, 24, 3044)\nVe al Jardín de los Gigantes ~(374, 159, 2479)\nHabla con Zebulgarath (374, 159, 2479)",
      "Parlez à Baldim (507, 24, 3044)\nAllez au Jardin des Géants ~(374, 159, 2479)\nParlez à Zebulgarath (374, 159, 2479)", "Parla con Baldim (507, 24, 3044)\nVai al Giardino dei Giganti ~(374, 159, 2479)\nParla con Zebulgarath (374, 159, 2479)"
    ],
  "Collect 3 bark from the old oak ~(286, 161, 2448)\nBring the bark back to Zebulgarath": [
    "Recoge 3 cortezas del roble antiguo ~(286, 161, 2448)\nLleva la corteza de vuelta a Zebulgarath",
    "Récoltez 3 écorces du vieux chêne ~(286, 161, 2448)\nRapportez l'écorce à Zebulgarath", "Raccogli 3 cortecce dalla vecchia quercia ~(286, 161, 2448)\nRiporta le cortecce a Zebulgarath"
  ],
  "Join Zebulgarath at the teleporter ~(498, 24, 3047)\nTalk to Zebulgarath ~(498, 24, 3047)\nTalk to Baldim (484, 86, 3058)":
    [
      "Únete a Zebulgarath en el teletransportador ~(498, 24, 3047)\nHabla con Zebulgarath ~(498, 24, 3047)\nHabla con Baldim (484, 86, 3058)",
      "Rejoignez Zebulgarath au téléporteur ~(498, 24, 3047)\nParlez à Zebulgarath ~(498, 24, 3047)\nParlez à Baldim (484, 86, 3058)", "Unisciti a Zebulgarath al teletrasporto ~(498, 24, 3047)\nParla con Zebulgarath ~(498, 24, 3047)\nParla con Baldim (484, 86, 3058)"
    ],
  "Find 3 clues in the village of Vallhat (466, 87, 2999), (398, 126, 3080), (450, 119, 3116)\nTalk to the villager who saw the creatures\nShow the book to Baldim (484, 86, 3058)\nTalk to Lisa (450, 119, 3116)\nSearch for traces of Isaac in the southern marshes ~(317, 44, 3200)\nKill Gorbel, king of slimes ~(317, 44, 3200)\nTalk to Isaac (325, 44, 3194)\nFollow Isaac (325, 44, 3194)\nTalk to Baldim (484, 86, 3058)":
    [
      "Encuentra 3 pistas en el pueblo de Vallhat (466, 87, 2999), (398, 126, 3080), (450, 119, 3116)\nHabla con el aldeano que vio a las criaturas\nMuéstrale el libro a Baldim (484, 86, 3058)\nHabla con Lisa (450, 119, 3116)\nBusca rastros de Isaac en los pantanos del sur ~(317, 44, 3200)\nMata a Gorbel, rey de los slimes ~(317, 44, 3200)\nHabla con Isaac (325, 44, 3194)\nSigue a Isaac (325, 44, 3194)\nHabla con Baldim (484, 86, 3058)",
      "Trouvez 3 indices dans le village de Vallhat (466, 87, 2999), (398, 126, 3080), (450, 119, 3116)\nParlez au villageois qui a vu les créatures\nMontrez le livre à Baldim (484, 86, 3058)\nParlez à Lisa (450, 119, 3116)\nCherchez des traces d'Isaac dans les marais du sud ~(317, 44, 3200)\nTuez Gorbel, roi des slimes ~(317, 44, 3200)\nParlez à Isaac (325, 44, 3194)\nSuivez Isaac (325, 44, 3194)\nParlez à Baldim (484, 86, 3058)", "Trova 3 indizi nel villaggio di Vallhat (466, 87, 2999), (398, 126, 3080), (450, 119, 3116)\nParla con il villico che ha visto le creature\nMostra il libro a Baldim (484, 86, 3058)\nParla con Lisa (450, 119, 3116)\nCerca le tracce di Isaac nelle paludi meridionali ~(317, 44, 3200)\nUccidi Gorbel, re delle melme ~(317, 44, 3200)\nParla con Isaac (325, 44, 3194)\nSegui Isaac (325, 44, 3194)\nParla con Baldim (484, 86, 3058)"
    ],
  "Talk to Baldim before leaving Vallhat (484, 86, 3058)\nGo to the marshes north of Hanaka (1421, 48, 3091)\nInteract with the mysterious green mass (1421, 48, 3091)\nRetrieve the First Fragment of the Seal of the Ancients (1441, 125, 3091)":
    [
      "Habla con Baldim antes de dejar Vallhat (484, 86, 3058)\nVe a los pantanos al norte de Hanaka (1421, 48, 3091)\nInteractúa con la misteriosa masa verde (1421, 48, 3091)\nRecupera el Primer Fragmento del Sello de los Antiguos (1441, 125, 3091)",
      "Parlez à Baldim avant de quitter Vallhat (484, 86, 3058)\nAllez dans les marais au nord de Hanaka (1421, 48, 3091)\nInteragissez avec la mystérieuse masse verte (1421, 48, 3091)\nRécupérez le Premier Fragment du Sceau des Anciens (1441, 125, 3091)", "Parla con Baldim prima di lasciare Vallhat (484, 86, 3058)\nVai nelle paludi a nord di Hanaka (1421, 48, 3091)\nInteragisci con la misteriosa massa verde (1421, 48, 3091)\nRecupera il Primo Frammento del Sigillo degli Antichi (1441, 125, 3091)"
    ],
  "Talk to the Master Swordsman (1089, 19, 4289)\nGo to Mizunari (3133, 27, 3656)\nTalk to Elma (3136, 27, 3668)": [
    "Habla con el Maestro Espadachín (1089, 19, 4289)\nVe a Mizunari (3133, 27, 3656)\nHabla con Elma (3136, 27, 3668)",
    "Parlez au Maître Spadassin (1089, 19, 4289)\nAllez à Mizunari (3133, 27, 3656)\nParlez à Elma (3136, 27, 3668)", "Parla con il Maestro Spadaccino (1089, 19, 4289)\nVai a Mizunari (3133, 27, 3656)\nParla con Elma (3136, 27, 3668)"
  ],
  "Talk with Elma 3 Times (3136, 27, 3668)\nGo up to the Fields, north of the forest ~(3334, 32, 3779)\nKill the 3 Nephentes at the foot of the shed ~(3334, 32, 3779)\nClear the area of 5 Nephentes ~(3334, 32, 3779)\nGo back to Harrold (3335, 32, 3782)\nHarvest 8 strange wheat ears (3401, 25, 3749)\nReturn to Elma in Mizunari ~(3136, 27, 3668)\nTalk to Harrold (3134, 27, 3666)":
    [
      "Habla con Elma 3 veces (3136, 27, 3668)\nSube a los campos, al norte del bosque ~(3334, 32, 3779)\nMata a los 3 Nephentes al pie del cobertizo ~(3334, 32, 3779)\nDespeja la zona de 5 Nephentes ~(3334, 32, 3779)\nVuelve con Harrold (3335, 32, 3782)\nCosecha 8 espigas de trigo extrañas (3401, 25, 3749)\nVuelve con Elma en Mizunari ~(3136, 27, 3668)\nHabla con Harrold (3134, 27, 3666)",
      "Parlez à Elma 3 fois (3136, 27, 3668)\nMontez dans les champs, au nord de la forêt ~(3334, 32, 3779)\nTuez les 3 Nephentes au pied du hangar ~(3334, 32, 3779)\nNettoyez la zone de 5 Nephentes ~(3334, 32, 3779)\nRetournez voir Harrold (3335, 32, 3782)\nRécoltez 8 étranges épis de blé (3401, 25, 3749)\nRetournez voir Elma à Mizunari ~(3136, 27, 3668)\nParlez à Harrold (3134, 27, 3666)", "Parla con Elma 3 volte (3136, 27, 3668)\nSali ai campi, a nord della foresta ~(3334, 32, 3779)\nUccidi i 3 Nephentes ai piedi del capanno ~(3334, 32, 3779)\nLibera la zona da 5 Nephentes ~(3334, 32, 3779)\nTorna da Harrold (3335, 32, 3782)\nRaccogli 8 strane spighe di grano (3401, 25, 3749)\nTorna da Elma a Mizunari ~(3136, 27, 3668)\nParla con Harrold (3134, 27, 3666)"
    ],
  "Hear what Harrold saw 3 times\nGo to the well, on the eastern road ~(4301, 178, 3704)": [
    "Escucha lo que vio Harrold 3 veces\nVe al pozo, en el camino del este ~(4301, 178, 3704)",
    "Écoutez ce que Harrold a vu 3 fois\nAllez au puits, sur la route de l'est ~(4301, 178, 3704)", "Ascolta ciò che Harrold ha visto 3 volte\nVai al pozzo, sulla strada orientale ~(4301, 178, 3704)"
  ],
  "Explore the tunnels ~(4281, 44, 3710)\nGo back up and report to Harrold (3134, 27, 3666)\nGo to where the bandits live (4204, 133, 3899)\nTalk to Bob (4287, 159, 3890)":
    [
      "Explora los túneles ~(4281, 44, 3710)\nSube y vuelve a informar a Harrold (3134, 27, 3666)\nVe a donde viven los bandidos (4204, 133, 3899)\nHabla con Bob (4287, 159, 3890)",
      "Explorez les tunnels ~(4281, 44, 3710)\nRemontez et faites votre rapport à Harrold (3134, 27, 3666)\nAllez là où vivent les bandits (4204, 133, 3899)\nParlez à Bob (4287, 159, 3890)", "Esplora i tunnel ~(4281, 44, 3710)\nRisali e riferisci a Harrold (3134, 27, 3666)\nVai dove vivono i banditi (4204, 133, 3899)\nParla con Bob (4287, 159, 3890)"
    ],
  "Talk to Bob (4287, 159, 3890)\nObtain the Geldorack Dungeon Key (4288, 159, 3887)\nEnter the Mine (4288, 159, 3887)\nComplete the dungeon (4288, 159, 3887)\nLeave the Mine Entrance ~(4260, 152, 3892)\nFind Velka in Castlebrume (2922, 162, 3006)\n(Bonus) Hand the rare material to the Hanaka merchant":
    [
      "Habla con Bob (4287, 159, 3890)\nConsigue la Llave de Mazmorra de Geldorack (4288, 159, 3887)\nEntra en la Mina (4288, 159, 3887)\nCompleta la mazmorra (4288, 159, 3887)\nSal de la Entrada de la Mina ~(4260, 152, 3892)\nEncuentra a Velka en Castlebrume (2922, 162, 3006)\n(Bonus) Entrega el material raro al mercader de Hanaka",
      "Parlez à Bob (4287, 159, 3890)\nObtenez la Clé de Donjon de Geldorack (4288, 159, 3887)\nEntrez dans la Mine (4288, 159, 3887)\nTerminez le donjon (4288, 159, 3887)\nSortez de l'Entrée de la Mine ~(4260, 152, 3892)\nTrouvez Velka à Castlebrume (2922, 162, 3006)\n(Bonus) Remettez la matière rare au marchand de Hanaka", "Parla con Bob (4287, 159, 3890)\nOttieni la Chiave del Dungeon di Geldorack (4288, 159, 3887)\nEntra nella Miniera (4288, 159, 3887)\nCompleta il dungeon (4288, 159, 3887)\nEsci dall'Ingresso della Miniera ~(4260, 152, 3892)\nTrova Velka a Castlebrume (2922, 162, 3006)\n(Bonus) Consegna il materiale raro al mercante di Hanaka"
    ],
  "Talk to Velka (2922, 162, 3006)\nShow the corrupted wheat (Strange wheat ear) to Velka (2922, 162, 3006)\nFind the ruins to the south (2842, 16, 4400)":
    [
      "Habla con Velka (2922, 162, 3006)\nMuéstrale el trigo corrompido (Espiga de trigo extraña) a Velka (2922, 162, 3006)\nEncuentra las ruinas al sur (2842, 16, 4400)",
      "Parlez à Velka (2922, 162, 3006)\nMontrez le blé corrompu (Épi de blé étrange) à Velka (2922, 162, 3006)\nTrouvez les ruines au sud (2842, 16, 4400)", "Parla con Velka (2922, 162, 3006)\nMostra il grano corrotto (Spiga di grano strana) a Velka (2922, 162, 3006)\nTrova le rovine a sud (2842, 16, 4400)"
    ],
  "Speak with the Archivist Specter to continue the main story (2849, -28, 4342)\nCollect 10 cursed cloth\nDefeat Narax, the cursed spirit of the ruins (2757, -32, 4285)\nBring the payment to the Specter (2849, -28, 4342)":
    [
      "Habla con el Espectro Archivista para continuar la historia principal (2849, -28, 4342)\nRecoge 10 tela maldita\nDerrota a Narax, el espíritu maldito de las ruinas (2757, -32, 4285)\nLleva el pago al Espectro (2849, -28, 4342)",
      "Parlez au Spectre Archiviste pour continuer l'histoire principale (2849, -28, 4342)\nRécoltez 10 tissu maudit\nVainquez Narax, l'esprit maudit des ruines (2757, -32, 4285)\nApportez le paiement au Spectre (2849, -28, 4342)", "Parla con lo Spettro Archivista per continuare la storia principale (2849, -28, 4342)\nRaccogli 10 tessuti maledetti\nSconfiggi Narax, lo spirito maledetto delle rovine (2757, -32, 4285)\nPorta il pagamento allo Spettro (2849, -28, 4342)"
    ],
  "Cross the unsealed door ~(2848, -34, 4254)\nDefeat Nasgul, Cursed Protector\nRetrieve the third Fragment of the Seal of the Ancients\nSpeak with the Echo of A: the Seal reforms\nTake the passage\nGo to the Labyrinth of the Fallen (2382, 29, 2415)":
    [
      "Cruza la puerta desellada ~(2848, -34, 4254)\nDerrota a Nasgul, Protector Maldito\nRecupera el tercer Fragmento del Sello de los Antiguos\nHabla con el Eco de A: el Sello se reforma\nToma el pasaje\nVe al Laberinto de los Caídos (2382, 29, 2415)",
      "Franchissez la porte descellée ~(2848, -34, 4254)\nVainquez Nasgul, Protecteur Maudit\nRécupérez le troisième Fragment du Sceau des Anciens\nParlez à l'Écho d'A : le Sceau se reforme\nPrenez le passage\nAllez au Labyrinthe des Déchus (2382, 29, 2415)", "Attraversa la porta dissigillata ~(2848, -34, 4254)\nSconfiggi Nasgul, Protettore Maledetto\nRecupera il terzo Frammento del Sigillo degli Antichi\nParla con l'Eco di A: il Sigillo si riforma\nPrendi il passaggio\nVai al Labirinto dei Caduti (2382, 29, 2415)"
    ],
  "Speak with Catherine to continue the main story": [
    "Habla con Catherine para continuar la historia principal",
    "Parlez à Catherine pour continuer l'histoire principale", "Parla con Catherine per continuare la storia principale"
  ],
  "Speak with the Master Swordsman to continue the main story (1809, 4289)\nTell him what happened in the Labyrinth (1809, 4289)\nChoice: continue, or give up\nAsk the 3 mages about the crystal\nQuestion a mage of Tolbana (3321, 1619)\nQuestion a mage of Tolbana (3200, 1447)\nQuestion a mage of Tolbana (3198, 1469)\nGo and see Mephisto (3260, 1403)":
    [
      "Habla con el Maestro Espadachín para continuar la historia principal (1809, 4289)\nCuéntale lo que ocurrió en el Laberinto (1809, 4289)\nElección: continuar o rendirse\nPregunta a los 3 magos sobre el cristal\nInterroga a un mago de Tolbana (3321, 1619)\nInterroga a un mago de Tolbana (3200, 1447)\nInterroga a un mago de Tolbana (3198, 1469)\nVe a ver a Mephisto (3260, 1403)",
      "Parlez au Maître Spadassin pour continuer l'histoire principale (1809, 4289)\nRacontez-lui ce qui s'est passé dans le Labyrinthe (1809, 4289)\nChoix : continuer ou abandonner\nInterrogez les 3 mages à propos du cristal\nInterrogez un mage de Tolbana (3321, 1619)\nInterrogez un mage de Tolbana (3200, 1447)\nInterrogez un mage de Tolbana (3198, 1469)\nAllez voir Mephisto (3260, 1403)", "Parla con il Maestro Spadaccino per continuare la storia principale (1809, 4289)\nRaccontagli cosa è successo nel Labirinto (1809, 4289)\nScelta: continuare o arrendersi\nChiedi ai 3 maghi del cristallo\nInterroga un mago di Tolbana (3321, 1619)\nInterroga un mago di Tolbana (3200, 1447)\nInterroga un mago di Tolbana (3198, 1469)\nVai a vedere Mephisto (3260, 1403)"
    ],
  "Speak with Mephisto to continue the main story (3260, 1403)\nAnswer Mephisto's question (3260, 1403) (An Instrument)\nLearn the mechanism: scroll + crystal (3260, 1403)":
    [
      "Habla con Mephisto para continuar la historia principal (3260, 1403)\nResponde a la pregunta de Mephisto (3260, 1403) (Un instrumento)\nAprende el mecanismo: pergamino + cristal (3260, 1403)",
      "Parlez à Mephisto pour continuer l'histoire principale (3260, 1403)\nRépondez à la question de Mephisto (3260, 1403) (Un instrument)\nApprenez le mécanisme : parchemin + cristal (3260, 1403)", "Parla con Mephisto per continuare la storia principale (3260, 1403)\nRispondi alla domanda di Mephisto (3260, 1403) (Uno strumento)\nImpara il meccanismo: rotolo + cristallo (3260, 1403)"
    ],
  "Go to the Harald palace (3199, 1510)\nSpeak with King Harald (3198, 1524)\nLearn that a description of him exists in the archives (3198, 1524)":
    [
      "Ve al palacio de Harald (3199, 1510)\nHabla con el rey Harald (3198, 1524)\nDescubre que existe una descripción de él en los archivos (3198, 1524)",
      "Allez au palais de Harald (3199, 1510)\nParlez au roi Harald (3198, 1524)\nApprenez qu'une description de lui existe dans les archives (3198, 1524)", "Vai al palazzo di Harald (3199, 1510)\nParla con il re Harald (3198, 1524)\nScopri che negli archivi esiste una sua descrizione (3198, 1524)"
    ],
  "Find the tomb of the ancestors (3681, 1648)\nTrial of Harald 1 (3781, 1673)\nTrial of Harald 2 (3741, 1714)\nTrial of Harald 3 (3701, 1667)\nReceive the three dates (−700, −620, −660)\nReturn to King Harald (3198, 1524)":
    [
      "Encuentra la tumba de los antepasados (3681, 1648)\nPrueba de Harald 1 (3781, 1673)\nPrueba de Harald 2 (3741, 1714)\nPrueba de Harald 3 (3701, 1667)\nRecibe las tres fechas (−700, −620, −660)\nVuelve con el rey Harald (3198, 1524)",
      "Trouvez la tombe des ancêtres (3681, 1648)\nÉpreuve de Harald 1 (3781, 1673)\nÉpreuve de Harald 2 (3741, 1714)\nÉpreuve de Harald 3 (3701, 1667)\nRecevez les trois dates (−700, −620, −660)\nRetournez voir le roi Harald (3198, 1524)", "Trova la tomba degli antenati (3681, 1648)\nProva di Harald 1 (3781, 1673)\nProva di Harald 2 (3741, 1714)\nProva di Harald 3 (3701, 1667)\nRicevi le tre date (−700, −620, −660)\nTorna dal re Harald (3198, 1524)"
    ],
  "Find Emy in the Tolbana Forge (3227, 1495)\nLearn what it takes to remake the scroll (3227, 1495)\nEnter the old mill (2771, 4777)\nFind the challenge area ~(868, 1675)\nAccept the challenge\nFind the object in the time allowed\nGo to Virelune (1617, 1958)\nSpeak with Dorven (1618, 1959)\nInspect the rocks, see if there's any way in (1419, 1986)\nBring everything back to Emy (3227, 1495)":
    [
      "Encuentra a Emy en la Forja de Tolbana (3227, 1495)\nAverigua qué hace falta para rehacer el pergamino (3227, 1495)\nEntra en el viejo molino (2771, 4777)\nEncuentra la zona del desafío ~(868, 1675)\nAcepta el desafío\nEncuentra el objeto en el tiempo permitido\nVe a Virelune (1617, 1958)\nHabla con Dorven (1618, 1959)\nInspecciona las rocas, mira si hay alguna forma de entrar (1419, 1986)\nLleva todo de vuelta a Emy (3227, 1495)",
      "Trouvez Emy dans la Forge de Tolbana (3227, 1495)\nDécouvrez ce qu'il faut pour refaire le parchemin (3227, 1495)\nEntrez dans le vieux moulin (2771, 4777)\nTrouvez la zone du défi ~(868, 1675)\nAcceptez le défi\nTrouvez l'objet dans le temps imparti\nAllez à Virelune (1617, 1958)\nParlez à Dorven (1618, 1959)\nInspectez les rochers, voyez s'il y a un moyen d'entrer (1419, 1986)\nRapportez tout à Emy (3227, 1495)", "Trova Emy nella Fucina di Tolbana (3227, 1495)\nScopri cosa serve per rifare il rotolo (3227, 1495)\nEntra nel vecchio mulino (2771, 4777)\nTrova la zona della sfida ~(868, 1675)\nAccetta la sfida\nTrova l'oggetto nel tempo consentito\nVai a Virelune (1617, 1958)\nParla con Dorven (1618, 1959)\nIspeziona le rocce, vedi se c'è un modo per entrare (1419, 1986)\nRiporta tutto a Emy (3227, 1495)"
    ],
  "Return to Mephisto (3260, 1403)\nMeet him at the door, near the forge (3239, 1461)\nFollow him to the door (3216, 1445)\nGo down beneath the crystal (3047, 1208)\nMeet Mephisto at the Kobold Tower (3400, 1080)":
    [
      "Vuelve con Mephisto (3260, 1403)\nReúnete con él en la puerta, cerca de la forja (3239, 1461)\nSíguelo hasta la puerta (3216, 1445)\nBaja por debajo del cristal (3047, 1208)\nReúnete con Mephisto en la Torre de los Kobolds (3400, 1080)",
      "Retournez voir Mephisto (3260, 1403)\nRetrouvez-le à la porte, près de la forge (3239, 1461)\nSuivez-le jusqu'à la porte (3216, 1445)\nDescendez sous le cristal (3047, 1208)\nRetrouvez Mephisto à la Tour des Kobolds (3400, 1080)", "Torna da Mephisto (3260, 1403)\nIncontralo alla porta, vicino alla forgia (3239, 1461)\nSeguilo fino alla porta (3216, 1445)\nScendi sotto il cristallo (3047, 1208)\nIncontra Mephisto alla Torre dei Kobold (3400, 1080)"
    ],
  "Reach Floor 2": ["Llega al Piso 2", "Atteignez l'Étage 2", "Raggiungi il Piano 2"],
  /* Aincrad Current Data side quest objectives: the kill count, then the return step that names
     the NPC and their coordinates. */
  "Kill enraged boars (0/10)\nReturn to Guard Tomas (1811, 3748)": [
    "Mata jabalíes enfurecidos (0/10)\nVuelve con el guardia Tomas (1811, 3748)",
    "Tuez des sangliers enragés (0/10)\nRetournez voir le garde Tomas (1811, 3748)", "Uccidi cinghiali infuriati (0/10)\nTorna dalla guardia Tomas (1811, 3748)"
  ],
  "Kill young spiders (0/15)\nReturn to Scout Raphael (1440, 3449)": [
    "Mata arañas jóvenes (0/15)\nVuelve con el explorador Raphael (1440, 3449)",
    "Tuez de jeunes araignées (0/15)\nRetournez voir l'éclaireur Raphael (1440, 3449)", "Uccidi ragni giovani (0/15)\nTorna dall'esploratore Raphael (1440, 3449)"
  ],
  "Take down winter golems (0/10)\nReturn to Sentinel Kael (4075, 1990)": [
    "Derriba gólems invernales (0/10)\nVuelve con el centinela Kael (4075, 1990)",
    "Abattez des golems hivernaux (0/10)\nRetournez voir la sentinelle Kael (4075, 1990)", "Abbatti golem invernali (0/10)\nTorna dalla sentinella Kael (4075, 1990)"
  ],
  "Shoot down frost butterflies (0/12)\nReturn to Shepherd Ivo (4074, 1994)": [
    "Derriba mariposas de escarcha (0/12)\nVuelve con el pastor Ivo (4074, 1994)",
    "Abattez des papillons de givre (0/12)\nRetournez voir le berger Ivo (4074, 1994)", "Abbatti farfalle di gelo (0/12)\nTorna dal pastore Ivo (4074, 1994)"
  ],
  "Killing White Wolves (0/12)\nReturn to Shepherd Ivo (2405, 4069)": [
    "Matando lobos blancos (0/12)\nVuelve con el pastor Ivo (2405, 4069)",
    "Tuer des loups blancs (0/12)\nRetournez voir le berger Ivo (2405, 4069)", "Uccidere lupi bianchi (0/12)\nTorna dal pastore Ivo (2405, 4069)"
  ],
  "Kill spawn slimes (0/20)\nReturn to Herbalist Nessa (1542, 3460)": [
    "Mata slimes engendrados (0/20)\nVuelve con la herborista Nessa (1542, 3460)",
    "Tuez des slimes engendrés (0/20)\nRetournez voir l'herboriste Nessa (1542, 3460)", "Uccidi melme generate (0/20)\nTorna dall'erborista Nessa (1542, 3460)"
  ],
  "Slay skeleton warriors (0/20)\nReturn to Archivist Orin (2765, 4396)": [
    "Mata guerreros esqueleto (0/20)\nVuelve con el archivista Orin (2765, 4396)",
    "Tuez des guerriers squelettes (0/20)\nRetournez voir l'archiviste Orin (2765, 4396)", "Uccidi guerrieri scheletro (0/20)\nTorna dall'archivista Orin (2765, 4396)"
  ],
  "Kill highway bandits (0/15)\nReturn to Carter Milo (3619, 3443)": [
    "Mata bandidos de la carretera (0/15)\nVuelve con Carter Milo (3619, 3443)",
    "Tuez des bandits de grand chemin (0/15)\nRetournez voir Carter Milo (3619, 3443)", "Uccidi banditi della strada (0/15)\nTorna da Carter Milo (3619, 3443)"
  ],
  "Kill 5 Fire Harpy, Kill 5 Lightning Harpy, Kill 5 Earth Harpy": [
    "Mata 5 arpías de fuego, mata 5 arpías de relámpago y mata 5 arpías terrenales",
    "Tuez 5 harpies de feu, tuez 5 harpies de foudre et tuez 5 harpies terrestres", "Uccidi 5 Arpie del Fuoco, uccidi 5 Arpie del Fulmine, uccidi 5 Arpie Terrestri"
  ],
  "Find the cat on the roof of the business where the Kaelor Merchants are located\nFind the cat once again on the tower west of Kaelor\nFinish the race chasing the cat in front of the tower from the previous stage":
    [
      "Encuentra al gato en el tejado del negocio donde están los mercaderes de Kaelor\nEncuentra de nuevo al gato en la torre al oeste de Kaelor\nTermina la carrera persiguiendo al gato frente a la torre de la etapa anterior",
      "Trouvez le chat sur le toit du commerce où se trouvent les marchands de Kaelor\nTrouvez à nouveau le chat sur la tour à l'ouest de Kaelor\nTerminez la course en poursuivant le chat devant la tour de l'étape précédente", "Trova il gatto sul tetto del negozio dove si trovano i mercanti di Kaelor\nTrova di nuovo il gatto sulla torre a ovest di Kaelor\nCompleta la corsa inseguendo il gatto davanti alla torre della tappa precedente"
    ],
  "Explore the Zumfut Caves for clues -> Read the Book of Shadows": [
    "Explora las cuevas de Zumfut en busca de pistas -> Lee el Libro de las Sombras",
    "Explorez les grottes de Zumfut pour trouver des indices -> Lisez le Livre des Ombres", "Esplora le caverne di Zumfut in cerca di indizi -> Leggi il Libro delle Ombre"
  ],
  "Go to the Forest to look for clues (776 / 1003) -> Follow the Track heading North": [
    "Ve al bosque para buscar pistas (776 / 1003) -> Sigue el rastro hacia el norte",
    "Allez dans la forêt chercher des indices (776 / 1003) -> Suivez la piste vers le nord", "Vai nella foresta a cercare indizi (776 / 1003) -> Segui la traccia verso nord"
  ],
  "Find the Mask in the Fountain of the Ruins of Avrylne (542 / 576)": [
    "Encuentra la máscara en la fuente de las ruinas de Avrylne (542 / 576)",
    "Trouvez le masque dans la fontaine des ruines d'Avrylne (542 / 576)", "Trova la Maschera nella fontana delle rovine di Avrylne (542 / 576)"
  ],
  "Locate and kill the Taurus ()": ["Localiza y mata al Taurus ()", "Repérez et tuez le Taurus ()", "Individua e uccidi il Taurus ()"],
  "Kill 50 Earth Harpy": ["Mata 50 arpías terrenales", "Tuez 50 harpies terrestres", "Uccidi 50 Arpie Terrestri"],
  "Kill 30 Sanctuary Skeleton - Archer/Sanctuary Skeleton - Warrior/Sanctuary Skeleton - Shaman": [
    "Mata 30 esqueletos del santuario: arquero, guerrero o chamán",
    "Tuez 30 squelettes du sanctuaire : archer, guerrier ou chaman", "Uccidi 30 Scheletri del Santuario - Arciere/Guerriero/Sciamano"
  ],
  "Defeat 30 Cave Goblin, Defeat 30 Goblin Soldier, Defeat 30 Goblin Archer": [
    "Derrota 30 goblins de cueva, 30 soldados goblin y 30 arqueros goblin",
    "Vainquez 30 gobelins des cavernes, 30 soldats gobelins et 30 archers gobelins", "Sconfiggi 30 Goblin delle Caverne, sconfiggi 30 Soldati Goblin, sconfiggi 30 Arcieri Goblin"
  ],
  "30 Average Stock Market": ["30 bolsas de valores medias", "30 bourses moyennes", "30 Borsa valori media"],
  "20 Wheat": ["20 Trigo", "20 Blé", "20 Grano"],
  "15 Allium + 5 Spider Wire": ["15 alliums + 5 hilos de araña", "15 alliums + 5 fils d'araignée", "15 Allium + 5 Filo di ragno"],
  "32 Orc Frame": ["32 estructuras de orco", "32 structures d'orque", "32 Struttura d'orco"],
  "1 Mushroom (-116 70 -104) + 2 Scented Grass (453 73 -712)": [
    "1 champiñón (-116 70 -104) + 2 hierbas aromáticas (453 73 -712)",
    "1 champignon (-116 70 -104) + 2 herbes parfumées (453 73 -712)", "1 Fungo (-116 70 -104) + 2 Erba profumata (453 73 -712)"
  ],
  "3 Cracked Pickaxe": ["3 picos agrietados", "3 pioches fissées", "3 Piccone incrinato"],
  "16 Wheat": ["16 Trigo", "16 Blé", "16 Grano"],
  "15 Woodfur": ["15 pieles de madera", "15 fourrures de bois", "15 Pelliccia di legno"],
  "Save Zoe in the Swamps of Triyag (751,67,1423) You won't be able to Save Rayan! -> Save Rayan in the Caverns of Misty Lousp (864,53,833) You won't be able to Save Zoe!":
    [
      "Salva a Zoe en los pantanos de Triyag (751,67,1423). ¡No podrás salvar a Rayan! -> Salva a Rayan en las cavernas de Misty Lousp (864,53,833). ¡No podrás salvar a Zoe!",
      "Sauvez Zoe dans les marais de Triyag (751,67,1423). Vous ne pourrez pas sauver Rayan ! -> Sauvez Rayan dans les cavernes de Misty Lousp (864,53,833). Vous ne pourrez pas sauver Zoe !", "Salva Zoe nelle paludi di Triyag (751,67,1423) Non potrai salvare Rayan! -> Salva Rayan nelle caverne di Misty Lousp (864,53,833) Non potrai salvare Zoe!"
    ],
  "5 Orichalcum fragment (963,15,474), (936,-54,426), (969,24,1078), (602,66,1051), (376,70,1371)": [
    "5 fragmentos de oricalco (963,15,474), (936,-54,426), (969,24,1078), (602,66,1051), (376,70,1371)",
    "5 fragments d'orichalque (963,15,474), (936,-54,426), (969,24,1078), (602,66,1051), (376,70,1371)", "5 Frammento di oricalco (963,15,474), (936,-54,426), (969,24,1078), (602,66,1051), (376,70,1371)"
  ],
  "20 Impure Onyx Ores": ["20 minerales de ónice impuro", "20 minerais d'onyx impur", "20 Minerali di onice impuro"],
  "Access Ilmarin by accessing the Zumfut portal at night (1172,109,685) -> 10 Woodclaw, 5 Misty Tail -> Return to Zilda in the evening with the offerings (1068,192,919)":
    [
      "Accede a Ilmarin a través del portal de Zumfut por la noche (1172,109,685) -> 10 garras de madera, 5 colas brumosas -> Regresa junto a Zilda por la tarde con las ofrendas (1068,192,919)",
      "Accédez à Ilmarin par le portail de Zumfut la nuit (1172,109,685) -> 10 griffes de bois, 5 queues brumeuses -> Retournez voir Zilda dans la soirée avec les offrandes (1068,192,919)", "Accedi a Ilmarin usando il portale di Zumfut di notte (1172,109,685) -> 10 Artiglio di legno, 5 Coda nebbiosa -> Torna da Zilda la sera con le offerte (1068,192,919)"
    ],
  "7 Small Stock Exchange": ["7 pequeñas bolsas de valores", "7 petites bourses", "7 Piccola borsa valori"],
  "1 Cooking Recipe": ["1 receta de cocina", "1 recette de cuisine", "1 Ricetta di cucina"],
  "1 Small Stock Exchange": ["1 pequeña bolsa de valores", "1 petite bourse", "1 Piccola borsa valori"],
  "5 Small Stock Exchange": ["5 pequeñas bolsas de valores", "5 petites bourses", "5 Piccola borsa valori"],
  "Go meet Zelbugarath north of the teleporter, at the Garden of the Giants\n3 Ancestral Root": [
    "Ve a encontrarte con Zelbugarath al norte del teletransportador, en el Jardín de los Gigantes\n3 raíces ancestrales",
    "Allez rencontrer Zelbugarath au nord du téléporteur, au Jardin des Géants\n3 racines ancestrales", "Vai a incontrare Zelbugarath a nord del teletrasporto, al Giardino dei Giganti\n3 Radice ancestrale"
  ],
  'Kill 1 Guardian of the Sanctuary, Kill 1 "Rugiboeuf, The Guardian",\nKill 1 Velindra Weaver, Kill 1 "Magnus, Colossus of the Veins"':
    [
      "Mata 1 guardián del santuario, mata 1 «Rugiboeuf, el Guardián»,\nMata 1 tejedora Velindra, mata 1 «Magnus, coloso de las vetas»",
      "Tuez 1 gardien du sanctuaire, tuez 1 « Rugiboeuf, le Gardien »,\nTuez 1 tisseuse Velindra, tuez 1 « Magnus, colosse des veines »", "Uccidi 1 Guardiano del Santuario, uccidi 1 \"Rugiboeuf, il Guardiano\",\nUccidi 1 Tessitrice Velindra, uccidi 1 \"Magnus, colosso delle vene\""
    ],
  "1 Lost pants from Caulette": ["1 pantalón perdido de Caulette", "1 pantalon perdu de Caulette", "1 Pantalone perduto di Caulette"],
  "Kill 5 Misty Wolf in the ruins": ["Mata 5 lobos brumosos en las ruinas", "Tuez 5 loups brumeux dans les ruines", "Uccidi 5 Lupi nebbiosi nelle rovine"],
  "Find Shingetsou's mysterious wife in the Lands of Earan (531 / 1062) -> Go back to Shingestsou (628 / 1440) and Give 1 Savanna axe":
    [
      "Encuentra a la misteriosa esposa de Shingetsou en las Tierras de Earan (531 / 1062) -> Regresa junto a Shingestsou (628 / 1440) y entrega 1 hacha de la sabana",
      "Trouvez la mystérieuse épouse de Shingetsou dans les Terres d'Earan (531 / 1062) -> Retournez voir Shingestsou (628 / 1440) et donnez 1 hache de la savane", "Trova la misteriosa moglie di Shingetsou nelle Terre di Earan (531 / 1062) -> Torna da Shingestsou (628 / 1440) e consegna 1 Ascia della savana"
    ],
  "Head towards the Wave Monster Bay Bell Tower (910 / 101)\nThree Corrupted Feathers can be obtained by clicking on them within the Bell Tower\nThe first Corrupted Feather is at the bottom inside the Bell Tower, behind the stairs (-917 / 99)\nThe second Feather will be on a beam when you take the stairs, about halfway up (-914 / 103)\nThe last Feather will be visible while jumping from the Bell Tower in front of the staircase (-916 / 98)":
    [
      "Dirígete al campanario de la Bahía de Monstruos Ondulantes (910 / 101)\nSe pueden obtener tres plumas corruptas haciendo clic sobre ellas dentro del campanario\nLa primera pluma corrupta está en la parte inferior, dentro del campanario, detrás de las escaleras (-917 / 99)\nLa segunda pluma estará sobre una viga al subir las escaleras, a mitad de camino (-914 / 103)\nLa última pluma se verá al saltar desde el campanario, frente a la escalera (-916 / 98)",
      "Dirigez-vous vers le clocher de la Baie des Monstres Ondoyants (910 / 101)\nTrois plumes corrompues peuvent être obtenues en cliquant dessus à l'intérieur du clocher\nLa première plume corrompue se trouve en bas, à l'intérieur du clocher, derrière les escaliers (-917 / 99)\nLa deuxième plume sera sur une poutre en montant les escaliers, à mi-hauteur (-914 / 103)\nLa dernière plume sera visible en sautant du clocher, devant l'escalier (-916 / 98)", "Dirigiti verso il campanile della Baia dei Mostri Ondulanti (910 / 101)\nTre Piume corrotte si possono ottenere cliccandoci sopra dentro il campanile\nLa prima Piuma corrotta è in basso all'interno del campanile, dietro le scale (-917 / 99)\nLa seconda Piuma sarà su una trave salendo le scale, circa a metà (-914 / 103)\nL'ultima Piuma sarà visibile saltando dal campanile davanti alla scalinata (-916 / 98)"
    ],
  /* Requirement and reward strings that mix materials with instructions; the terms are curated
	   as whole sentences so the word order stays natural in both languages. */
  "Crumpled Notebook (-510 106 289), Ring Without Name (521 82 -452), Canvas Bag (846 67 211)": [
    "Cuaderno arrugado (-510 106 289), Anillo sin nombre (521 82 -452), Bolsa de lona (846 67 211)",
    "Carnet froissé (-510 106 289), Anneau sans nom (521 82 -452), Sac de toile (846 67 211)", "Quaderno stropicciato (-510 106 289), Anello senza nome (521 82 -452), Borsa di tela (846 67 211)"
  ],
  "Defeat 40 Orc Warrior/Orc Samurai/Orc Shaman": [
    "Derrota a 40 guerreros orco/samuráis orco/chamanes orco",
    "Vaincre 40 guerriers orques/samouraïs orques/chamans orques", "Sconfiggi 40 Guerrieri Orchi/Samurai Orchi/Sciamani Orchi"
  ],
  "Kill 10 Sharkfish": ["Mata 10 peces tiburón", "Tuez 10 poissons-requins", "Uccidi 10 Pesce squalo"],
  "Kill 20 Forest Spiders": ["Mata 20 arañas del bosque", "Tuez 20 araignées forestières", "Uccidi 20 Ragni della foresta"],
  "10 Icy Magic Radiance + 5 Broken Violet Fragment": [
    "10 Radiaciones mágicas heladas + 5 Fragmentos de violeta roto",
    "10 Rayonnements magiques glacés + 5 Fragments de violette brisé", "10 Raggio magico ghiacciato + 5 Frammento violetto rotto"
  ],
  "10 Juvenial Bark, Ravaging Bark 5 -> Forge at Gromdar (358 / 591) 1 Orichalcum ingot -> Wait 20 Minutes -> Recover 1 Orichalcum ingot":
    [
      "10 Cortezas juveniles, 5 Cortezas devastadoras -> Forja en Gromdar (358 / 591) 1 Lingote de oricalco -> Espera 20 minutos -> Recupera 1 Lingote de oricalco",
      "10 Écorces juvéniles, 5 Écorces dévastatrices -> Forgez à Gromdar (358 / 591) 1 Lingot d'orichalque -> Attendez 20 minutes -> Récupérez 1 Lingot d'orichalque", "10 Corteccia giovane, 5 Corteccia devastante -> Forgia a Gromdar (358 / 591) 1 Lingotto di oricalco -> Attendi 20 minuti -> Recupera 1 Lingotto di oricalco"
    ],
  "10 Scots Bark + 10 Enchanted Twig + 3 Ancestral Root": [
    "10 Cortezas de pino silvestre + 10 Ramitas encantadas + 3 Raíces ancestrales",
    "10 Écorces de pin sylvestre + 10 Brindilles enchantées + 3 Racines ancestrales", "10 Corteccia di pino silvestre + 10 Ramoscello incantato + 3 Radice ancestrale"
  ],
  "5 Ancestral Root + 20 Scots Bark": [
    "5 Raíces ancestrales + 20 Cortezas de pino silvestre",
    "5 Racines ancestrales + 20 Écorces de pin sylvestre", "5 Radice ancestrale + 20 Corteccia di pino silvestre"
  ],
  "5 Magic Wook Shard + 3 Slime Core + 5 Bone Dust": [
    "5 Fragmentos de madera mágica + 3 Núcleos de slime + 5 Polvo de hueso",
    "5 Éclats de bois magique + 3 Noyaux de slime + 5 Poussière d'os", "5 Scheggia di legno magico + 3 Nucleo di slime + 5 Polvere d'ossa"
  ],
  "25 Wolf Fangs + 25 Boar Hide": [
    "25 Colmillos de lobo + 25 Pieles de jabalí",
    "25 Crocs de loup + 25 Peaux de sanglier", "25 Zanne di lupo + 25 Pelle di cinghiale"
  ]
};

const escapeEquipmentTerm = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const equipmentTermPatternSource = (value) => {
  const startBoundary = /^[A-Za-z0-9]/.test(value) ? "\\b" : "";
  const endBoundary = /[A-Za-z0-9]$/.test(value) ? "\\b" : "(?![A-Za-z0-9_])";
  return `${startBoundary}${escapeEquipmentTerm(value)}${endBoundary}`;
};

const equipmentTermPatterns = Object.entries(equipmentTerminology)
  .sort(([left], [right]) => right.length - left.length)
  .map(([english, translations]) => ({
    english,
    pattern: new RegExp(equipmentTermPatternSource(english), "gi"),
    translations
  }));
const equipmentTermLookup = new Map(
  equipmentTermPatterns.map(({ english, translations }) => [english.toLowerCase(), translations])
);
const equipmentTermCombinedPattern = new RegExp(
  equipmentTermPatterns.map(({ english }) => equipmentTermPatternSource(english)).join("|"),
  "gi"
);
/* One cache per slot, so the cache array can never disagree with TRANSLATION_SLOT_LANGUAGES. */
const equipmentTermValueCaches = TRANSLATION_SLOT_LANGUAGES.map(() => new Map());

/* `language` is a language code (or a slot index, for the historical callers). A language with no
   slot - English, or one this file has no glossary for - keeps the source text. */
function translateEquipmentTermValue(value, language) {
  const slot = translationSlot(language);
  if (slot === NO_TRANSLATION_SLOT) return String(value || "");
  let translated = String(value || "");
  const cached = equipmentTermValueCaches[slot].get(translated);
  if (cached !== undefined) return cached;
  translated = translated.replace(
    equipmentTermCombinedPattern,
    (match) => equipmentTermLookup.get(match.toLowerCase())?.[slot] || match
  );
  equipmentTermValueCaches[slot].set(String(value || ""), translated);
  return translated;
}

const equivalentLabelTranslations = {
  "N/A": ["N/D", "N/D", "N/D"],
  "N/A.": ["N/D.", "N/D.", "N/D."],
  "Tower of Kobold": ["Torre de los kobolds", "Tour des kobolds", "Torre dei kobold"],
  Mana: ["Maná", "Mana", "Mana"],
  Unique: ["Único", "Unique", "Unico"],
  Biome: ["Bioma", "Biome", "Bioma"],
  Boss: ["Jefe", "Boss", "Boss"],
  "Witch's Potion (Intelligence)": ["Poción de bruja (Inteligencia)", "Potion de sorcière (Intelligence)", "Pozione della strega (Intelligenza)"],
  "Witch's Potion (Strength)": ["Poción de bruja (Fuerza)", "Potion de sorcière (Force)", "Pozione della strega (Forza)"],
  "Oceiros Bracelet": ["Brazalete de Oceiros", "Bracelet d'Oceiros", "Bracciale di Oceiros"],
  "Hater du Vert": ["Odio al verde", "Hater du Vert", "Hater du Vert"],
  "OG District": ["Distrito OG", "Quartier OG", "Quartiere OG"],
  "Sister Thera": ["Hermana Thera", "Sœur Thera", "Suor Thera"],
  "Adoryll, the Bird in a Cage": ["Adoryll, el ave en una jaula", "Adoryll, l'oiseau en cage", "Adoryll, l'uccello in gabbia"],
  "Adoryll's cage": ["La jaula de Adoryll", "La cage d'Adoryll", "La gabbia di Adoryll"],
  "Illfang, Lord Kobold": ["Illfang, señor de los kobolds", "Illfang, seigneur kobold", "Illfang, signore dei kobold"],
  "Kobold Tower": ["Torre de los kobolds", "Tour des kobolds", "Torre dei kobold"],
  Labyrinth: ["Laberinto", "Labyrinthe", "Labirinto"],
  "Melliona's Hive": ["Colmena de Melliona", "Ruche de Melliona", "Alveare di Melliona"],
  "Misty Wolf Alpha": ["Alfa del lobo brumoso", "Alpha du loup brumeux", "Alfa del lupo nebbioso"],
  Nymbrea: ["Nymbréa", "Nymbréa", "Nymbréa"],
  "Ruins of Avrylne": ["Ruinas de Avrylne", "Ruines d'Avrylne", "Rovine di Avrylne"],
  "Samurai Orc Boss": ["Jefe orco samurái", "Boss orc samouraï", "Boss orco samurai"],
  Emilie: ["Emilie", "Émilie", "Emilie"],
  Headlights: ["Faros", "Phares", "Fari"],
  Horace: ["Horacio", "Horace", "Orazio"],
  Juliet: ["Julieta", "Juliette", "Giulietta"],
  Monica: ["Mónica", "Monica", "Monica"],
  "Orc & Roll": ["Orco y Roll", "Orc et Roll", "Orco & Roll"],
  Romeo: ["Romeo", "Roméo", "Romeo"],
  Castlebrume: ["Niebla del Castillo", "Brume du château", "Nebbia del Castello"],
  Meticulous: ["Meticuloso", "Méticuleux", "Meticoloso"],
  Timer: ["Temporizador", "Minuteur", "Timer"]
};

window.SAOContentTranslations.translateEquipmentTerm = function translateEquipmentTerm(key, english) {
  window.SAOContentTranslations.register(
    key,
    english,
    translationsByLanguage((language) => translateEquipmentTermValue(english, language))
  );
  return english;
};

const locationTranslations = {
  "Altar of the Two Moons": ["Altar de las Dos Lunas", "Autel des Deux Lunes", "Altare delle Due Lune"],
  "Altar of Two Moons": ["Altar de las Dos Lunas", "Autel des Deux Lunes", "Altare delle Due Lune"],
  "Cursed Ruins": ["Ruinas malditas", "Ruines maudites", "Rovine maledette"],
  "Desert of Silver Fangs": ["Desierto de los Colmillos de Plata", "Désert des crocs d'argent", "Deserto delle Zanne d'Argento"],
  "Dungeon Forgotten Tomb of the Necromancer": [
    "Mazmorra de la tumba olvidada del nigromante",
    "Donjon du tombeau oublié du nécromancien", "Dungeon della tomba dimenticata del negromante"
  ],
  "Dungeon Sanctuary of Xal'Zirith": ["Mazmorra del santuario de Xal'Zirith", "Donjon du sanctuaire de Xal'Zirith", "Dungeon del santuario di Xal'Zirith"],
  "Earan Forest": ["Bosque de Earan", "Forêt d'Earan", "Foresta di Earan"],
  "Elessarh Mine": ["Mina de Elessarh", "Mine d'Elessarh", "Miniera di Elessarh"],
  "Emerald Wings Forest": ["Bosque de alas esmeralda", "Forêt des ailes d'émeraude", "Foresta delle Ali di Smeraldo"],
  "Geldorak Mine": ["Mina de Geldorak", "Mine de Geldorak", "Miniera di Geldorak"],
  "Geldorak Mine Dungeon": ["Mazmorra de la mina de Geldorak", "Donjon de la mine de Geldorak", "Dungeon della miniera di Geldorak"],
  "Ika Archipelago": ["Archipiélago de Ika", "Archipel d'Ika", "Arcipelago di Ika"],
  "Inferno Nest": ["Nido del infierno", "Nid de l'enfer", "Nido dell'inferno"],
  "Interior of the Sanctuary of Khesun": ["Interior del santuario de Khesun", "Intérieur du sanctuaire de Khesun", "Interno del santuario di Khesun"],
  "Lake of the Bulls": ["Lago de los toros", "Lac des taureaux", "Lago dei tori"],
  "Lake Virelune": ["Lago Virelune", "Lac Virelune", "Lago Virelune"],
  "Land of Earan": ["Tierra de Earan", "Terre d'Earan", "Terra di Earan"],
  "Melliona Hive Dungeon": ["Mazmorra de la colmena de Melliona", "Donjon de la ruche de Melliona", "Dungeon dell'alveare di Melliona"],
  "Mist Shelter": ["Refugio de la niebla", "Refuge de la brume", "Rifugio nella nebbia"],
  "Mizunari Fields": ["Campos de Mizunari", "Champs de Mizunari", "Campi di Mizunari"],
  "Orc Camps": ["Campamentos de orcos", "Camps d'orques", "Accampamenti degli orchi"],
  "Sanctuary of Khesun": ["Santuario de Khesun", "Sanctuaire de Khesun", "Santuario di Khesun"],
  "Sanctuary of Khesûn": ["Santuario de Khesûn", "Sanctuaire de Khesûn", "Santuario di Khesûn"],
  "Baobab Millénaire": ["Baobab milenario", "Baobab millénaire", "Baobab millenario"],
  "Silver Fang Desert": ["Desierto de los colmillos de plata", "Désert des crocs d'argent", "Deserto delle Zanne d'Argento"],
  "Skeleton Dungeon": ["Mazmorra de esqueletos", "Donjon des squelettes", "Dungeon degli scheletri"],
  "Snow Citadel": ["Ciudadela de nieve", "Citadelle des neiges", "Cittadella di neve"],
  "Swamp Putride": ["Pantano pútrido", "Marais putride", "Palude Putride"],
  "Sweet Forest": ["Bosque dulce", "Forêt sucrée", "Foresta dolce"],
  "The Veins of Sablemor": ["Las vetas de Sablemor", "Les veines de Sablemor", "Le vene di Sablemor"],
  "Tolbana Mountains": ["Montañas de Tolbana", "Montagnes de Tolbana", "Montagne di Tolbana"],
  "Town of Beginnings": ["Ciudad de los Comienzos", "Ville des Commencements", "Città degli Inizi"],
  "Valley of Wolves": ["Valle de los lobos", "Vallée des loups", "Valle dei lupi"],
  "Wavy Monster Bay": ["Bahía de monstruos ondulantes", "Baie des monstres ondoyants", "Baia dei mostri ondulati"],
  "Wild Boar Meadow": ["Pradera de jabalíes", "Prairie des sangliers", "Prateria dei cinghiali"],
  "Wild Boar Zone": ["Zona de jabalíes", "Zone des sangliers", "Zona dei cinghiali"]
};

const locationPatterns = Object.entries(locationTranslations)
  .sort(([left], [right]) => right.length - left.length)
  .map(([english, translations]) => ({
    english,
    pattern: new RegExp(english.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi"),
    translations
  }));
const locationLookup = new Map(
  locationPatterns.map(({ english, translations }) => [english.toLowerCase(), translations])
);
const locationCombinedPattern = new RegExp(locationPatterns.map(({ pattern }) => pattern.source).join("|"), "gi");

const npcTranslations = {
  // Main Questline role labels (proper names stay untranslated by design)
  "Mysterious Character": ["Personaje Misterioso", "Personnage Mystérieux", "Personaggio misterioso"],
  "Master Swordsman": ["Maestro Espadachín", "Maître Spadassin", "Maestro spadaccino"],
  Swordmaster: ["Maestro de Espadas", "Maître d'Épée", "Maestro di spada"],
  "Mayor's Trader": ["Comerciante del Alcalde", "Marchand du Maire", "Mercante del sindaco"],
  "Mistress Herbalist Alicia": ["Maestra herbolaria Alicia", "Maîtresse herboriste Alicia", "Maestra erborista Alicia"],
  "Sister Thera": ["Hermana Thera", "Sœur Thera", "Suor Thera"],
  Emilie: ["Emilie", "Émilie", "Emilie"],
  Headlights: ["Faros", "Phares", "Fari"],
  Horace: ["Horacio", "Horace", "Orazio"],
  Juliet: ["Julieta", "Juliette", "Giulietta"],
  Monica: ["Mónica", "Monica", "Monica"],
  Romeo: ["Romeo", "Roméo", "Romeo"],
  Meticulous: ["Meticuloso", "Méticuleux", "Meticoloso"],
  Timer: ["Temporizador", "Minuteur", "Timer"]
};

window.SAOContentTranslations.translateKnownTerms = function translateKnownTerms(value, language) {
  const slot = translationSlot(language);
  /* English is the source text, and a language this file has no glossary for has nothing to
     substitute: both return the value unchanged instead of borrowing another language's glossary. */
  if (slot === NO_TRANSLATION_SLOT) return String(value || "");
  const target = window.SAOContentTranslations[TRANSLATION_SLOT_LANGUAGES[slot]];
  const source = window.SAOContentTranslations.en;
  let translated = String(value || "");
  /* One combined pass per dictionary, longest alternative first. Applying the patterns one after
	   another lets a shorter entry rewrite the glossary output of a longer one ("Grimoire Bestial"
	   -> "Grimoire bestial" -> "Grimoire Bestial"), and letting the bestiary pass run first lets a
	   single bestiary word consume part of a longer curated phrase ("Copper Accessories Blacksmith"
	   -> "Cobre Accessories Blacksmith"). The curated dictionaries therefore run before the bestiary
	   drop list, which is the shortest and least specific of the three. */
  translated = translated.replace(
    equipmentTermCombinedPattern,
    (match) => equipmentTermLookup.get(match.toLowerCase())?.[slot] || match
  );
  translated = translated.replace(
    locationCombinedPattern,
    (match) => locationLookup.get(match.toLowerCase())?.[slot] || match
  );
  Object.keys(source)
    .filter((key) => key.startsWith("bestiary.item.") || key.startsWith("bestiary.mob."))
    .sort((left, right) => String(source[right]).length - String(source[left]).length)
    .forEach((key) => {
      const english = source[key];
      const localized = target[key];
      if (!english || !localized || english === localized) return;
      translated = translated.replace(
        new RegExp(String(english).replace(/[.*+?^${}()|[\\]\\\\]/g, "\\\\$&"), "gi"),
        localized
      );
    });
  return translated;
};

/* Map descriptions are a second, longer copy of the marker title: "<Title> (<Type>) — Coordinates
   X: n Z: m", sometimes followed by a short instruction ("Gather Birch Wood.") and sometimes just
   the bare title. The generic prose pass translates them word by word, which left the title in
   English ("Guild Base (Bioma) — ..."), so the exact strings are curated here. The recipes use the
   same em dash and spacing as the map data, and the checker fails the build if that data changes,
   so a renamed marker can never silently fall back to a half-translated string. */
const curatedMapDescriptionTranslations = {
  "2 Paths, 1 Choice (Side Quest) — Coordinates X: 427 Z: 774": [
    "2 caminos, 1 elección (misión secundaria) — Coordenadas X: 427 Z: 774",
    "2 chemins, 1 choix (quête secondaire) — Coordonnées X : 427 Z : 774", "2 cammini, 1 scelta (missione secondaria) — Coordinate X: 427 Z: 774"
  ],
  "Bee Armor Blacksmith": ["Herrero de armaduras de abeja", "Forgeron d'armures d'abeille", "Fabbro di armature delle api"],
  "Bees Weapon Blacksmith": ["Herrero de armas de abejas", "Forgeron d'armes d'abeilles", "Fabbro di armi delle api"],
  "Birch Forest — Coordinates X: 1788 Z: 1196. Gather Birch Wood.": [
    "Bosque de abedules — Coordenadas X: 1788 Z: 1196. Reúne madera de abedul.",
    "Forêt de bouleaux — Coordonnées X : 1788 Z : 1196. Récoltez du bois de bouleau.", "Foresta di Betulle — Coordinate X: 1788 Z: 1196. Raccogli legno di betulla."
  ],
  "Birch Forest — Coordinates X: 1788 Z: 1196. Gather Birch Log.": [
    "Bosque de abedules — Coordenadas X: 1788 Z: 1196. Reúne tronco de abedul.",
    "Forêt de bouleaux — Coordonnées X : 1788 Z : 1196. Récoltez de la bûche de bouleau.", "Foresta di Betulle — Coordinate X: 1788 Z: 1196. Raccogli tronco di betulla."
  ],
  "Black Market (Biome) — Coordinates X: 1121 Z: 811": [
    "Mercado negro (bioma) — Coordenadas X: 1121 Z: 811",
    "Marché noir (biome) — Coordonnées X : 1121 Z : 811", "Mercato nero (bioma) — Coordinate X: 1121 Z: 811"
  ],
  "Consumables Merchant": ["Mercader de consumibles", "Marchand de consommables", "Mercante di consumabili"],
  "Corrupt Mask Blacksmith.": ["Herrero de máscaras corruptas.", "Forgeron de masques corrompus.", "Fabbro di maschere corrotte."],
  "Entrance to the Labyrinth (Biome) — Coordinates X: 382 Z: 433": [
    "Entrada al Laberinto (bioma) — Coordenadas X: 382 Z: 433",
    "Entrée du Labyrinthe (biome) — Coordonnées X : 382 Z : 433", "Ingresso del Labirinto (bioma) — Coordinate X: 382 Z: 433"
  ],
  "Furacas, Guardian of the Labyrinth (Boss) — Coordinates X: 393 Z: 340": [
    "Furacas, guardián del Laberinto (jefe) — Coordenadas X: 393 Z: 340",
    "Furacas, gardien du Labyrinthe (boss) — Coordonnées X : 393 Z : 340", "Furacas, guardiano del Labirinto (boss) — Coordinate X: 393 Z: 340"
  ],
  "Guild Base (Biome) — Coordinates X: 775 Z: 1200": [
    "Base del gremio (bioma) — Coordenadas X: 775 Z: 1200",
    "Base de la guilde (biome) — Coordonnées X : 775 Z : 1200", "Base della gilda (bioma) — Coordinate X: 775 Z: 1200"
  ],
  "Labyrinth (Biome) — Coordinates X: 588 Z: 195": [
    "Laberinto (bioma) — Coordenadas X: 588 Z: 195",
    "Labyrinthe (biome) — Coordonnées X : 588 Z : 195", "Labirinto (bioma) — Coordinate X: 588 Z: 195"
  ],
  "Muffet, Mother of Black Spiders (Boss) — Coordinates X: 344 Z: 1273": [
    "Muffet, madre de las arañas negras (jefe) — Coordenadas X: 344 Z: 1273",
    "Muffet, mère des araignées noires (boss) — Coordonnées X : 344 Z : 1273", "Muffet, madre dei ragni neri (boss) — Coordinate X: 344 Z: 1273"
  ],
  "Necrotic Tool Blacksmith": ["Herrero de herramientas necróticas", "Forgeron d'outils nécrotiques", "Fabbro di strumenti necrotici"],
  "Reinforced Tools Merchant": ["Mercader de herramientas reforzadas", "Marchand d'outils renforcés", "Mercante di strumenti rinforzati"],
  "Shadows of the Lost Forest (Side Quest) — Coordinates X: 510 Z: 1080": [
    "Sombras del Bosque Perdido (misión secundaria) — Coordenadas X: 510 Z: 1080",
    "Ombres de la Forêt Perdue (quête secondaire) — Coordonnées X : 510 Z : 1080", "Ombre della Foresta Perduta (missione secondaria) — Coordinate X: 510 Z: 1080"
  ],
  "Wolf Forest (Biome) — Coordinates X: 970 Z: 828": [
    "Bosque de lobos (bioma) — Coordenadas X: 970 Z: 828",
    "Forêt des loups (biome) — Coordonnées X : 970 Z : 828", "Foresta dei lupi (bioma) — Coordinate X: 970 Z: 828"
  ],
  /* Second batch, composed from the curated marker title plus the marker type, so a renamed
	   marker can never fall back to a half-translated string. Coordinates keep the em dash and
	   spacing of the map data; the type label is lower case like the entries above. */
  "Adoryll's cage (Biome) — Coordinates X: 274 Z: 1244": [
    "La jaula de Adoryll (bioma) — Coordenadas X: 274 Z: 1244",
    "La cage d'Adoryll (biome) — Coordonnées X : 274 Z : 1244", "La gabbia di Adoryll (bioma) — Coordinate X: 274 Z: 1244"
  ],
  "Adoryll, the Bird in a Cage (Boss) — Coordinates X: 275 Z: 1245": [
    "Adoryll, el ave en una jaula (jefe) — Coordenadas X: 275 Z: 1245",
    "Adoryll, l'oiseau en cage (boss) — Coordonnées X : 275 Z : 1245", "Adoryll, l'uccello in gabbia (boss) — Coordinate X: 275 Z: 1245"
  ],
  "Aldarya (Biome) — Coordinates X: 1083 Z: 592": [
    "Aldarya (bioma) — Coordenadas X: 1083 Z: 592",
    "Aldarya (biome) — Coordonnées X : 1083 Z : 592", "Aldarya (bioma) — Coordinate X: 1083 Z: 592"
  ],
  "Alpha of the Woods (Boss) — Coordinates X: 1060 Z: 892": [
    "Alfa de los bosques (jefe) — Coordenadas X: 1060 Z: 892",
    "Alpha des bois (boss) — Coordonnées X : 1060 Z : 892", "Alfa dei boschi (boss) — Coordinate X: 1060 Z: 892"
  ],
  "A very strange lumberjack (Side Quest) — Coordinates X: 628 Z: 1440": [
    "Un leñador muy extraño (misión secundaria) — Coordenadas X: 628 Z: 1440",
    "Un bûcheron très étrange (quête secondaire) — Coordonnées X : 628 Z : 1440", "Un taglialegna molto strano (missione secondaria) — Coordinate X: 628 Z: 1440"
  ],
  "Bandit Camps (Biome) — Coordinates X: 1138 Z: 844": [
    "Campamentos de bandidos (bioma) — Coordenadas X: 1138 Z: 844",
    "Camps de bandits (biome) — Coordonnées X : 1138 Z : 844", "Accampamenti dei banditi (bioma) — Coordinate X: 1138 Z: 844"
  ],
  "Blided Orcs or Pulmed Orcs! (Side Quest) — Coordinates X: 358 Z: 591": [
    "¡Orcos cegados u orcos desplumados! (misión secundaria) — Coordenadas X: 358 Z: 591",
    "Orques aveuglés ou orques plumés ! (quête secondaire) — Coordonnées X : 358 Z : 591", "Orchi accecati o orchi spennati! (missione secondaria) — Coordinate X: 358 Z: 591"
  ],
  "Caverns (Biome) — Coordinates X: 528 Z: 858": [
    "Cavernas (bioma) — Coordenadas X: 528 Z: 858",
    "Cavernes (biome) — Coordonnées X : 528 Z : 858", "Caverne (bioma) — Coordinate X: 528 Z: 858"
  ],
  "Dungeon The Mysterious Islands (Biome) — Coordinates X: 860 Z: 288": [
    "Mazmorra de las Islas Misteriosas (bioma) — Coordenadas X: 860 Z: 288",
    "Donjon des Îles Mystérieuses (biome) — Coordonnées X : 860 Z : 288", "Dungeon delle Isole Misteriose (bioma) — Coordinate X: 860 Z: 288"
  ],
  "Earan Forest (Biome) — Coordinates X: 477 Z: 875": [
    "Bosque de Earan (bioma) — Coordenadas X: 477 Z: 875",
    "Forêt d'Earan (biome) — Coordonnées X : 477 Z : 875", "Foresta di Earan (bioma) — Coordinate X: 477 Z: 875"
  ],
  "Earan Land (Biome) — Coordinates X: 587 Z: 984": [
    "Tierra de Earan (bioma) — Coordenadas X: 587 Z: 984",
    "Terre d'Earan (biome) — Coordonnées X : 587 Z : 984", "Terra di Earan (bioma) — Coordinate X: 587 Z: 984"
  ],
  "Elessarh Mine (Biome) — Coordinates X: 928 Z: 505": [
    "Mina de Elessarh (bioma) — Coordenadas X: 928 Z: 505",
    "Mine d'Elessarh (biome) — Coordonnées X : 928 Z : 505", "Miniera di Elessarh (bioma) — Coordinate X: 928 Z: 505"
  ],
  "Ilmarin (Biome) — Coordinates X: 1049 Z: 862": [
    "Ilmarin (bioma) — Coordenadas X: 1049 Z: 862",
    "Ilmarin (biome) — Coordonnées X : 1049 Z : 862", "Ilmarin (bioma) — Coordinate X: 1049 Z: 862"
  ],
  "King of the Cave (Boss) — Coordinates X: 886 Z: 1098": [
    "Rey de la cueva (jefe) — Coordenadas X: 886 Z: 1098",
    "Roi de la caverne (boss) — Coordonnées X : 886 Z : 1098", "Re della caverna (boss) — Coordinate X: 886 Z: 1098"
  ],
  "Leader of the Bandits (Boss) — Coordinates X: 1175 Z: 837": [
    "Líder de los bandidos (jefe) — Coordenadas X: 1175 Z: 837",
    "Chef des bandits (boss) — Coordonnées X : 1175 Z : 837", "Capo dei banditi (boss) — Coordinate X: 1175 Z: 837"
  ],
  "Lysaat (Biome) — Coordinates X: 346 Z: 592": [
    "Lysaat (bioma) — Coordenadas X: 346 Z: 592",
    "Lysaat (biome) — Coordonnées X : 346 Z : 592", "Lysaat (bioma) — Coordinate X: 346 Z: 592"
  ],
  "Materials for ShiShi (Side Quest) — Coordinates X: 589 Z: 1362": [
    "Materiales para ShiShi (misión secundaria) — Coordenadas X: 589 Z: 1362",
    "Matériaux pour ShiShi (quête secondaire) — Coordonnées X : 589 Z : 1362", "Materiali per ShiShi (missione secondaria) — Coordinate X: 589 Z: 1362"
  ],
  "Mist Canyon (Biome) — Coordinates X: 807 Z: 855": [
    "Cañón de niebla (bioma) — Coordenadas X: 807 Z: 855",
    "Canyon de brume (biome) — Coordonnées X : 807 Z : 855", "Canyon della nebbia (bioma) — Coordinate X: 807 Z: 855"
  ],
  "Mist Refuge (Biome) — Coordinates X: 705 Z: 847": [
    "Refugio de niebla (bioma) — Coordenadas X: 705 Z: 847",
    "Refuge de brume (biome) — Coordonnées X : 705 Z : 847", "Rifugio della nebbia (bioma) — Coordinate X: 705 Z: 847"
  ],
  "Misty Wolf Alpha (Boss) — Coordinates X: 757 Z: 790": [
    "Alfa del lobo brumoso (jefe) — Coordenadas X: 757 Z: 790",
    "Alpha du loup brumeux (boss) — Coordonnées X : 757 Z : 790", "Alfa del lupo nebbioso (boss) — Coordinate X: 757 Z: 790"
  ],
  "Orc & Roll (Side Quest) — Coordinates X: 140 Z: 736": [
    "Orco y Roll (misión secundaria) — Coordenadas X: 140 Z: 736",
    "Orc et Roll (quête secondaire) — Coordonnées X : 140 Z : 736", "Orco & Roll (missione secondaria) — Coordinate X: 140 Z: 736"
  ],
  "Orc Camps (Biome) — Coordinates X: 285 Z: 1191": [
    "Campamentos de orcos (bioma) — Coordenadas X: 285 Z: 1191",
    "Camps d'orques (biome) — Coordonnées X : 285 Z : 1191", "Accampamenti degli orchi (bioma) — Coordinate X: 285 Z: 1191"
  ],
  "Regulation quota (Side Quest) — Coordinates X: 162 Z: 771": [
    "Cuota reglamentaria (misión secundaria) — Coordenadas X: 162 Z: 771",
    "Quota réglementaire (quête secondaire) — Coordonnées X : 162 Z : 771", "Quota regolamentare (missione secondaria) — Coordinate X: 162 Z: 771"
  ],
  "Rest of Ankyla (Biome) — Coordinates X: 1105 Z: 1043": [
    "Descanso de Ankyla (bioma) — Coordenadas X: 1105 Z: 1043",
    "Repos d'Ankyla (biome) — Coordonnées X : 1105 Z : 1043", "Riposo di Ankyla (bioma) — Coordinate X: 1105 Z: 1043"
  ],
  "Ruins of Avrylne (Biome) — Coordinates X: 543 Z: 760": [
    "Ruinas de Avrylne (bioma) — Coordenadas X: 543 Z: 760",
    "Ruines d'Avrylne (biome) — Coordonnées X : 543 Z : 760", "Rovine di Avrylne (bioma) — Coordinate X: 543 Z: 760"
  ],
  "Samurai Orc Boss (Boss) — Coordinates X: 256 Z: 1219": [
    "Jefe orco samurái (jefe) — Coordenadas X: 256 Z: 1219",
    "Boss orc samouraï (boss) — Coordonnées X : 256 Z : 1219", "Boss orco samurai (boss) — Coordinate X: 256 Z: 1219"
  ],
  "Swamp (Biome) — Coordinates X: 633 Z: 1258": [
    "Pantano (bioma) — Coordenadas X: 633 Z: 1258",
    "Marais (biome) — Coordonnées X : 633 Z : 1258", "Palude (bioma) — Coordinate X: 633 Z: 1258"
  ],
  "Sylinga (Biome) — Coordinates X: 163 Z: 721": [
    "Sylinga (bioma) — Coordenadas X: 163 Z: 721",
    "Sylinga (biome) — Coordonnées X : 163 Z : 721", "Sylinga (bioma) — Coordinate X: 163 Z: 721"
  ],
  "Terrialys Well (Biome) — Coordinates X: 961 Z: 1103": [
    "Pozo de Terrialys (bioma) — Coordenadas X: 961 Z: 1103",
    "Puits de Terrialys (biome) — Coordonnées X : 961 Z : 1103", "Pozzo di Terrialys (bioma) — Coordinate X: 961 Z: 1103"
  ],
  "The Ascalon Oath (Side Quest) — Coordinates X: 133 Z: 995": [
    "El juramento de Ascalon (misión secundaria) — Coordenadas X: 133 Z: 995",
    "Le serment d'Ascalon (quête secondaire) — Coordonnées X : 133 Z : 995", "Il giuramento di Ascalon (missione secondaria) — Coordinate X: 133 Z: 995"
  ],
  "The Ashes of the Past (Side Quest) — Coordinates X: 515 Z: 859": [
    "Las cenizas del pasado (misión secundaria) — Coordenadas X: 515 Z: 859",
    "Les cendres du passé (quête secondaire) — Coordonnées X : 515 Z : 859", "Le ceneri del passato (missione secondaria) — Coordinate X: 515 Z: 859"
  ],
  "The Dance of the Sleeping Treants (Side Quest) — Coordinates X: 583 Z: 1428": [
    "La danza de los treants dormidos (misión secundaria) — Coordenadas X: 583 Z: 1428",
    "La danse des tréants endormis (quête secondaire) — Coordonnées X : 583 Z : 1428", "La danza dei treant addormentati (missione secondaria) — Coordinate X: 583 Z: 1428"
  ],
  "The Forge of a God (Side Quest) — Coordinates X: 608 Z: 1046": [
    "La forja de un dios (misión secundaria) — Coordenadas X: 608 Z: 1046",
    "La forge d'un dieu (quête secondaire) — Coordonnées X : 608 Z : 1046", "La forgia di un dio (missione secondaria) — Coordinate X: 608 Z: 1046"
  ],
  "The Great Feast (Side Quest) — Coordinates X: 874 Z: 716": [
    "El gran festín (misión secundaria) — Coordenadas X: 874 Z: 716",
    "Le grand festin (quête secondaire) — Coordonnées X : 874 Z : 716", "Il grande banchetto (missione secondaria) — Coordinate X: 874 Z: 716"
  ],
  "The legend of Zilda (Side Quest) — Coordinates X: 1068 Z: 919": [
    "La leyenda de Zilda (misión secundaria) — Coordenadas X: 1068 Z: 919",
    "La légende de Zilda (quête secondaire) — Coordonnées X : 1068 Z : 919", "La leggenda di Zilda (missione secondaria) — Coordinate X: 1068 Z: 919"
  ],
  "The mask of the Memory Tree (Side Quest) — Coordinates X: 201 Z: 714": [
    "La máscara del árbol de la memoria (misión secundaria) — Coordenadas X: 201 Z: 714",
    "Le masque de l'arbre de la mémoire (quête secondaire) — Coordonnées X : 201 Z : 714", "La maschera dell'Albero della Memoria (missione secondaria) — Coordinate X: 201 Z: 714"
  ],
  "The new undermines (Side Quest) — Coordinates X: 913 Z: 673": [
    "Las nuevas minas subterráneas (misión secundaria) — Coordenadas X: 913 Z: 673",
    "Les nouvelles mines souterraines (quête secondaire) — Coordonnées X : 913 Z : 673", "Le nuove miniere sotterranee (missione secondaria) — Coordinate X: 913 Z: 673"
  ],
  "The Prankster Goblins (Side Quest) — Coordinates X: 870 Z: 446": [
    "Los goblins bromistas (misión secundaria) — Coordenadas X: 870 Z: 446",
    "Les gobelins farceurs (quête secondaire) — Coordonnées X : 870 Z : 446", "I goblin burloni (missione secondaria) — Coordinate X: 870 Z: 446"
  ],
  "The Shadow under the Red Iris (Side Quest) — Coordinates X: 981 Z: 544": [
    "La sombra bajo el iris rojo (misión secundaria) — Coordenadas X: 981 Z: 544",
    "L'ombre sous l'iris rouge (quête secondaire) — Coordonnées X : 981 Z : 544", "L'ombra sotto l'iris rosso (missione secondaria) — Coordinate X: 981 Z: 544"
  ],
  "The wild threat (Side Quest) — Coordinates X: 707 Z: 854": [
    "La amenaza salvaje (misión secundaria) — Coordenadas X: 707 Z: 854",
    "La menace sauvage (quête secondaire) — Coordonnées X : 707 Z : 854", "La minaccia selvaggia (missione secondaria) — Coordinate X: 707 Z: 854"
  ],
  "Triyag (Biome) — Coordinates X: 582 Z: 1381": [
    "Triyag (bioma) — Coordenadas X: 582 Z: 1381",
    "Triyag (biome) — Coordonnées X : 582 Z : 1381", "Triyag (bioma) — Coordinate X: 582 Z: 1381"
  ],
  "Weisslum (Biome) — Coordinates X: 650 Z: 607": [
    "Weisslum (bioma) — Coordenadas X: 650 Z: 607",
    "Weisslum (biome) — Coordonnées X : 650 Z : 607", "Weisslum (bioma) — Coordinate X: 650 Z: 607"
  ],
  "Zumfut (Biome) — Coordinates X: 932 Z: 609": [
    "Zumfut (bioma) — Coordenadas X: 932 Z: 609",
    "Zumfut (biome) — Coordonnées X : 932 Z : 609", "Zumfut (bioma) — Coordinate X: 932 Z: 609"
  ],
  /* Site markers whose description repeats the title verbatim. */
  "Amethyst Armor Blacksmith": ["Herrero de armaduras de amatista", "Forgeron d'armures d'améthyste", "Fabbro di armature di ametista"],
  "Amulet Blacksmith": ["Herrero de amuletos", "Forgeron d'amulettes", "Fabbro di amuleti"],
  "Amulet Merchant": ["Mercader de amuletos", "Marchand d'amulettes", "Mercante di amuleti"],
  "Ancient Wood Armor Blacksmith": ["Herrero de armaduras de madera ancestral", "Forgeron d'armures de bois ancien", "Fabbro di armature di legno antico"],
  "Armor Blacksmith": ["Herrero de armaduras", "Forgeron d'armures", "Fabbro di armature"],
  "Artifact Merchant": ["Mercader de artefactos", "Marchand d'artefacts", "Mercante di manufatti"],
  "Assistant to the Alchemist": ["Ayudante del alquimista", "Assistant de l'alchimiste", "Assistente dell'alchimista"],
  "Bandit Loot Reseller": ["Revendedor de botín bandido", "Revendeur de butin bandit", "Rivenditore di bottino dei banditi"],
  "Bauxite Accessories Blacksmith.": ["Herrero de accesorios de bauxita.", "Forgeron d'accessoires de bauxite.", "Fabbro di accessori di bauxite."],
  "Bracelet Blacksmith": ["Herrero de brazaletes", "Forgeron de bracelets", "Fabbro di bracciali"],
  "Bracelet Merchant": ["Mercader de brazaletes", "Marchand de bracelets", "Mercante di bracciali"],
  "Bull & Bear Accessories Blacksmith": [
    "Herrero de accesorios de toro y oso",
    "Forgeron d'accessoires de taureau et d'ours", "Fabbro di accessori di toro e orso"
  ],
  "Former Blacksmith": ["Antiguo herrero", "Ancien forgeron", "Ex fabbro"],
  "Glove Blacksmith": ["Herrero de guantes", "Forgeron de gants", "Fabbro di guanti"],
  "Glove Merchant": ["Mercader de guantes", "Marchand de gants", "Mercante di guanti"],
  "Harpies Loot Buyer": ["Comprador de botín de arpías", "Acheteur de butin de harpies", "Acquirente di bottino delle arpie"],
  "Honeyed Loot Buyer": ["Comprador de botín meloso", "Acheteur de butin miellé", "Acquirente di bottino mielato"],
  "Ingot Blacksmith": ["Herrero de lingotes", "Forgeron de lingots", "Fabbro di lingotti"],
  "Key Blacksmith": ["Herrero de llaves", "Forgeron de clés", "Fabbro di chiavi"],
  "Low Corruption Bracelet Blacksmith": [
    "Herrero de brazaletes de baja corrupción",
    "Forgeron de bracelets de faible corruption", "Fabbro di bracciali di bassa corruzione"
  ],
  "Miner of the Corner": ["Minero de la esquina", "Mineur du coin", "Minatore dell'Angolo"],
  "Necrotic Weaponsmith": ["Herrero de armas necrótico", "Forgeron d'armes nécrotiques", "Fabbro di armi necrotiche"],
  "Occult Amulet Merchant": ["Mercader de amuletos ocultos", "Marchand d'amulettes occultes", "Mercante di amuleti occulti"],
  "Occult Bracelet Merchant": ["Mercader de brazaletes ocultos", "Marchand de bracelets occultes", "Mercante di bracciali occulti"],
  "Occult Gloves Merchant": ["Mercader de guantes ocultos", "Marchand de gants occultes", "Mercante di guanti occulti"],
  "Occult Merchant": ["Mercader oculto", "Marchand occulte", "Mercante occulto"],
  "Occult Ringman": ["Vendedor de anillos ocultos", "Vendeur de bagues occultes", "Venditore di anelli occulti"],
  "Occult Runes Merchant": ["Mercader de runas ocultas", "Marchand de runes occultes", "Mercante di rune occulte"],
  "Pure Onyx Ingot Blacksmith": ["Herrero de lingotes de ónice puro", "Forgeron de lingots d'onyx pur", "Fabbro di lingotti di onice puro"],
  "Purification Alchemist": ["Alquimista de purificación", "Alchimiste de purification", "Alchimista di purificazione"],
  "Ring Blacksmith": ["Herrero de anillos", "Forgeron d'anneaux", "Fabbro di anelli"],
  "Scrap Accessories Blacksmith.": ["Herrero de accesorios de chatarra.", "Forgeron d'accessoires de ferraille.", "Fabbro di accessori di scarti."],
  "Sylnovar Accessories Blacksmith": ["Herrero de accesorios de Sylnovar", "Forgeron d'accessoires de Sylnovar", "Fabbro di accessori di Sylnovar"],
  "Tribe Belt Blacksmith": ["Herrero de cinturones de la tribu", "Forgeron de ceintures de la tribu", "Fabbro di cinture della tribù"],
  /* One-line descriptions that are not a repeated title. */
  "Alchemist, Crystallograph, Assistant to the Alchemist": [
    "Alquimista, cristalógrafo, ayudante del alquimista",
    "Alchimiste, cristallographe, assistant de l'alchimiste", "Alchimista, cristallografo, assistente dell'alchimista"
  ],
  "Bandit Loot Repreneur - Buys Loot.": [
    "Comprador de botín bandido - Compra botín.",
    "Repreneur de butin bandit - Achète du butin.", "Rivenditore di bottino dei banditi - Compra bottino."
  ],
  "Bauxite Ingots & Impure Onyx Blacksmith": [
    "Herrero de lingotes de bauxita y ónice impuro",
    "Forgeron de lingots de bauxite et d'onyx impur", "Fabbro di lingotti di bauxite e onice impuro"
  ],
  "Crushed Harpy Ring Blacksmith.": ["Herrero de anillos de arpía aplastada.", "Forgeron d'anneaux de harpie écrasée.", "Fabbro di anelli dell'arpia schiacciata."],
  "Drowned Harpy Ring Blacksmith.": ["Herrero de anillos de arpía ahogada.", "Forgeron d'anneaux de harpie noyée.", "Fabbro di anelli dell'arpia annegata."],
  "Farm — Coordinates X: 2351 Z: 3662. Gather Allium and Wheat.": [
    "Granja — Coordenadas X: 2351 Z: 3662. Reúne allium y trigo.",
    "Ferme — Coordonnées X : 2351 Z : 3662. Récoltez de l'allium et du blé.", "Fattoria — Coordinate X: 2351 Z: 3662. Raccogli allium e grano."
  ],
  "Farm — Coordinates X: 2351 Z: 3662. Gather Allium Flower and Wheat.": [
    "Granja — Coordenadas X: 2351 Z: 3662. Reúne flor de allium y trigo.",
    "Ferme — Coordonnées X : 2351 Z : 3662. Récoltez de la fleur d'allium et du blé.", "Fattoria — Coordinate X: 2351 Z: 3662. Raccogli fiore di allium e grano."
  ],
  "Fierce Talisman Blacksmith.": ["Herrero de talismanes feroces.", "Forgeron de talismans féroces.", "Fabbro di talismani feroci."],
  "Flaming Harpy Ring Blacksmith.": [
    "Herrero de anillos de arpía flameante.",
    "Forgeron d'anneaux de harpie flamboyante.", "Fabbro di anelli dell'arpia fiammeggiante."
  ],
  "Goblin Loot Repreneur - Buys Loot.": [
    "Comprador de botín goblin - Compra botín.",
    "Repreneur de butin gobelin - Achète du butin.", "Rivenditore di bottino dei goblin - Compra bottino."
  ],
  "Local Farmer - Buys Loot.": ["Granjero local - Compra botín.", "Fermier local - Achète du butin.", "Contadino locale - Compra bottino."],
  "Local lumberjack - Buys Loot.": ["Leñador local - Compra botín.", "Bûcheron local - Achète du butin.", "Taglialegna locale - Compra bottino."],
  "Loot Buyer Sylnovar - Buys Loot.": [
    "Comprador de botín de Sylnovar - Compra botín.",
    "Acheteur de butin de Sylnovar - Achète du butin.", "Acquirente di bottino di Sylnovar - Compra bottino."
  ],
  "Loot Buyer Sylvaer - Buys Loot.": [
    "Comprador de botín de Sylvaer - Compra botín.",
    "Acheteur de butin de Sylvaer - Achète du butin.", "Acquirente di bottino di Sylvaer - Compra bottino."
  ],
  "Loot Buyer Treant - Buys Loot.": [
    "Comprador de botín de treant - Compra botín.",
    "Acheteur de butin de tréant - Achète du butin.", "Acquirente di bottino di treant - Compra bottino."
  ],
  "Makes Wooden Boards and Acacia Wood Powder.": [
    "Fabrica tablones de madera y polvo de madera de acacia.",
    "Fabrique des planches de bois et de la poudre de bois d'acacia.", "Produce tavole di legno e polvere di legno di acacia."
  ],
  "Miner of the Corner - Buys Loot.": ["Minero de la esquina - Compra botín.", "Mineur du coin - Achète du butin.", "Minatore dell'Angolo - Compra bottino."],
  "Necromancer Armor Blacksmith": ["Herrero de armaduras de nigromante", "Forgeron d'armures de nécromancien", "Fabbro di armature del negromante"],
  "Orc Loot Repreneur - Buys Loot.": [
    "Comprador de botín orco - Compra botín.",
    "Repreneur de butin orc - Achète du butin.", "Rivenditore di bottino degli orchi - Compra bottino."
  ],
  "Runic Necklace Blacksmith.": ["Herrero de collares rúnicos.", "Forgeron de colliers runiques.", "Fabbro di collane runiche."],
  "Sells Necrotic Loot.": ["Vende botín necrótico.", "Vend du butin nécrotique.", "Vende bottino necrotico."],
  "Sells objects from the Sanctuary of Khesûn.": [
    "Vende objetos del Santuario de Khesûn.",
    "Vend des objets du Sanctuaire de Khesûn.", "Vende oggetti del Santuario di Khesûn."
  ],
  "Side Quest NPC in Candelia.": ["PNJ de misión secundaria en Candelia.", "PNJ de quête secondaire à Candelia.", "PNG di missione secondaria a Candelia."],
  "Side Quest NPC in Castlebrume.": [
    "PNJ de misión secundaria en Castlebrume.",
    "PNJ de quête secondaire à Castlebrume.", "PNG di missione secondaria a Castlebrume."
  ],
  "Side Quest NPC in Hanaka.": ["PNJ de misión secundaria en Hanaka.", "PNJ de quête secondaire à Hanaka.", "PNG di missione secondaria a Hanaka."],
  "Side Quest NPC in Mizunari.": ["PNJ de misión secundaria en Mizunari.", "PNJ de quête secondaire à Mizunari.", "PNG di missione secondaria a Mizunari."],
  "Side Quest NPC in Tolbana.": ["PNJ de misión secundaria en Tolbana.", "PNJ de quête secondaire à Tolbana.", "PNG di missione secondaria a Tolbana."],
  "Side Quest NPC in Town of Beginnings.": [
    "PNJ de misión secundaria en la Ciudad de los Comienzos.",
    "PNJ de quête secondaire à la Ville des Commencements.", "PNG di missione secondaria nella Città degli Inizi."
  ],
  "Side Quest NPC in Vallhat.": ["PNJ de misión secundaria en Vallhat.", "PNJ de quête secondaire à Vallhat.", "PNG di missione secondaria a Vallhat."],
  "Side Quest NPC in Virelune.": ["PNJ de misión secundaria en Virelune.", "PNJ de quête secondaire à Virelune.", "PNG di missione secondaria a Virelune."],
  "Spider Loot Repreneur - Buys Loot.": [
    "Comprador de botín de araña - Compra botín.",
    "Repreneur de butin d'araignée - Achète du butin.", "Rivenditore di bottino dei ragni - Compra bottino."
  ],
  "Wild Gloves Blacksmith.": ["Herrero de guantes salvajes.", "Forgeron de gants sauvages.", "Fabbro di guanti selvaggi."],
  "Article proposal (Side Quest) — Coordinates X: 876 Z: 555": [
    "Propuesta de artículo (misión secundaria) — Coordenadas X: 876 Z: 555",
    "Proposition d'article (quête secondaire) — Coordonnées X : 876 Z : 555", "Proposta di articolo (missione secondaria) — Coordinate X: 876 Z: 555"
  ],
  /* The Current Data side quest markers (Aincrad/Map/maps_current.js) describe the NPC they
     stand on, so each one is curated here as a whole sentence. */
  "Return to Guard Tomas (1811, 3748)": [
    "Vuelve con el guardia Tomas (1811, 3748)",
    "Retournez voir le garde Tomas (1811, 3748)", "Torna dalla guardia Tomas (1811, 3748)"
  ],
  "Return to Scout Raphael (1440, 3449)": [
    "Vuelve con el explorador Raphael (1440, 3449)",
    "Retournez voir l'éclaireur Raphael (1440, 3449)", "Torna dall'esploratore Raphael (1440, 3449)"
  ],
  "Return to Sentinel Kael (4075, 1990)": [
    "Vuelve con el centinela Kael (4075, 1990)",
    "Retournez voir la sentinelle Kael (4075, 1990)", "Torna dalla sentinella Kael (4075, 1990)"
  ],
  "Return to Shepherd Ivo (4074, 1994)": [
    "Vuelve con el pastor Ivo (4074, 1994)",
    "Retournez voir le berger Ivo (4074, 1994)", "Torna dal pastore Ivo (4074, 1994)"
  ],
  "Return to Shepherd Ivo (2405, 4069)": [
    "Vuelve con el pastor Ivo (2405, 4069)",
    "Retournez voir le berger Ivo (2405, 4069)", "Torna dal pastore Ivo (2405, 4069)"
  ],
  "Return to Herbalist Nessa (1542, 3460)": [
    "Vuelve con la herborista Nessa (1542, 3460)",
    "Retournez voir l'herboriste Nessa (1542, 3460)", "Torna dall'erborista Nessa (1542, 3460)"
  ],
  "Return to Archivist Orin (2765, 4396)": [
    "Vuelve con el archivista Orin (2765, 4396)",
    "Retournez voir l'archiviste Orin (2765, 4396)", "Torna dall'archivista Orin (2765, 4396)"
  ],
  "Return to Carter Milo (3619, 3443)": [
    "Vuelve con Carter Milo (3619, 3443)",
    "Retournez voir Carter Milo (3619, 3443)", "Torna da Carter Milo (3619, 3443)"
  ]
};

const commonProseTranslations = [
  ["A ", ["Un ", "Un ", "Un "]],
  ["An ", ["Un ", "Un ", "Un "]],
  ["The ", ["El ", "Le ", "Il "]],
  ["this ", ["este ", "cet ", "questo "]],
  ["This ", ["Esta ", "Cette ", "Questo "]],
  ["that ", ["que ", "qui ", "che "]],
  ["and ", ["y ", "et ", "e "]],
  ["of ", ["de ", "de ", "di "]],
  ["from ", ["de ", "de ", "da "]],
  ["with ", ["con ", "avec ", "con "]],
  ["in ", ["en ", "dans ", "in "]],
  ["on ", ["en ", "sur ", "su "]],
  ["to ", ["para ", "pour ", "a "]],
  ["for ", ["para ", "pour ", "per "]],
  ["into ", ["en ", "dans ", "in "]],
  ["it ", ["lo ", "il ", "lo "]],
  ["is ", ["es ", "est ", "è "]],
  ["are ", ["son ", "sont ", "sono "]],
  ["has ", ["tiene ", "a ", "ha "]],
  ["can ", ["puede ", "peut ", "può "]],
  ["made ", ["hecho ", "fabriqué ", "fatto "]],
  ["from ", ["de ", "de ", "da "]],
  ["very ", ["muy ", "très ", "molto "]],
  ["long ", ["largo ", "longue ", "lungo "]],
  ["heavy ", ["pesado ", "lourd ", "pesante "]],
  ["strong ", ["fuerte ", "solide ", "forte "]],
  ["sturdy ", ["resistente ", "robuste ", "robusto "]],
  ["strong", ["fuerte", "solide", "forte"]],
  ["powerful ", ["poderoso ", "puissant ", "potente "]],
  ["powerful", ["poderoso", "puissant", "potente"]],
  ["beautiful ", ["hermoso ", "beau ", "bello "]],
  ["heavy ", ["pesado ", "lourd ", "pesante "]],
  ["heavy", ["pesado", "lourd", "pesante"]],
  ["green ", ["verde ", "verte ", "verde "]],
  ["white ", ["blanco ", "blanc ", "bianco "]],
  ["yellow ", ["amarillo ", "jaune ", "giallo "]],
  ["blue ", ["azul ", "bleu ", "blu "]],
  ["silver ", ["plateado ", "argenté ", "argento "]],
  ["winter ", ["invierno ", "hiver ", "inverno "]],
  ["wild ", ["salvaje ", "sauvage ", "selvaggio "]],
  ["wolf ", ["lobo ", "loup ", "lupo "]],
  ["wolves ", ["lobos ", "loups ", "lupi "]],
  ["spider ", ["araña ", "araignée ", "ragno "]],
  ["potion ", ["poción ", "potion ", "pozione "]],
  ["sword ", ["espada ", "épée ", "spada "]],
  ["shield ", ["escudo ", "bouclier ", "scudo "]],
  ["gloves ", ["guantes ", "gants ", "guanti "]],
  ["bracelet ", ["brazalete ", "bracelet ", "bracciale "]],
  ["necklace ", ["collar ", "collier ", "collana "]],
  ["claw ", ["garra ", "griffe ", "artiglio "]],
  ["thread ", ["hilo ", "fil ", "filo "]],
  ["powder ", ["polvo ", "poudre ", "polvere "]],
  ["meat ", ["carne ", "viande ", "carne "]],
  ["drink ", ["bebida ", "boisson ", "bevanda "]],
  ["energy ", ["energía ", "énergie ", "energia "]],
  ["air ", ["aire ", "air ", "aria "]],
  ["body ", ["cuerpo ", "corps ", "corpo "]],
  ["skin ", ["piel ", "peau ", "pelle "]],
  ["bone ", ["hueso ", "os ", "osso "]],
  ["dust ", ["polvo ", "poussière ", "polvere "]],
  ["gift", ["regalo", "cadeau", "regalo"]],
  ["children", ["niños", "enfants", "bambini"]],
  ["enemy", ["enemigo", "ennemi", "nemico"]],
  ["enemies", ["enemigos", "ennemis", "nemici"]],
  ["protects", ["protege", "protège", "protegge"]],
  ["restores", ["restaura", "régénère", "ripristina"]],
  ["triggers", ["activa", "déclenche", "attiva"]],
  ["seconds", ["segundos", "secondes", "secondi"]],
  ["minutes", ["minutos", "minutes", "minuti"]],
  ["weapon", ["arma", "arme", "arma"]],
  ["weapons", ["armas", "armes", "armi"]],
  ["damage", ["daño", "dégâts", "danno"]],
  ["boss", ["jefe", "boss", "boss"]],
  ["tier", ["nivel", "niveau", "livello"]],
  ["perfect", ["perfecto", "parfait", "perfetto"]],
  ["incredible", ["increíble", "incroyable", "incredibile"]],
  ["dealing", ["infligiendo", "infligeant", "infliggendo"]],
  ["enchantments", ["encantamientos", "enchantements", "incantesimi"]],
  ["metals", ["metales", "métaux", "metalli"]],
  ["destruction", ["destrucción", "destruction", "distruzione"]],
  ["little", ["pequeños", "petits", "piccoli"]],
  ["slaves", ["esclavos", "esclaves", "schiavi"]],
  ["outside", ["fuera de", "à l'extérieur de", "fuori da"]],
  ["monster", ["monstruo", "monstre", "mostro"]],
  ["monsters", ["monstruos", "monstres", "mostri"]],
  ["hunt", ["caza", "chasse", "caccia"]],
  ["belongs", ["pertenece", "appartient", "appartiene"]],
  ["belonged", ["perteneció", "appartenait", "apparteneva"]],
  ["heavy", ["pesado", "lourd", "pesante"]],
  ["cooldown", ["enfriamiento", "temps de recharge", "tempo di ricarica"]],
  ["Slot: artefact", ["Ranura: artefacto", "Emplacement : artefact", "Slot: artefatto"]],
  ["Slot: bracelet", ["Ranura: brazalete", "Emplacement : bracelet", "Slot: bracciale"]]
];

/* The word-start test has to be accent-aware. JavaScript's \b is ASCII-only, so it treats the final
   "a" of an accented word such as "arpía" as the start of a new word and rewrites text that is
   already translated ("Huevo de arpía de agua" -> "Huevo de arpíUn de agua"). The captured
   alternative below keeps the same "start of a word" meaning while also counting accented Latin
   letters as word characters, and it is captured so the replacement can restore the leading
   character. No lookbehind is used, so it works in every browser the site supports. */
const WORD_START_BOUNDARY = "(^|[^0-9A-Za-z\\u00C0-\\u024F])";

/* A prose entry that ends in a word character also needs a word-end test. Without it, a short entry
   rewrites the inside of a longer word: "hunt" turned "Hunter" into "cazaer" and "boss" would turn
   "bosses" into "jefees". Entries written with a trailing space or punctuation already carry their
   own separator, so no lookahead is appended for them and the trailing space keeps matching as
   before. The lookahead is non-capturing, so the replacement keeps receiving the boundary capture. */
const WORD_END_BOUNDARY = "(?![0-9A-Za-z\\u00C0-\\u024F])";
const escapeProseEntry = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const commonProsePatterns = commonProseTranslations.map(([english, translations]) => {
  const endBoundary = /[0-9A-Za-z\u00C0-\u024F]$/.test(english) ? WORD_END_BOUNDARY : "";
  return {
    pattern: new RegExp(`${WORD_START_BOUNDARY}(${escapeProseEntry(english)})${endBoundary}`, "gi"),
    translations
  };
});

window.SAOContentTranslations.translateEquivalentLabel = function translateEquivalentLabel(value, language) {
  /* `language` is a language code, or a slot index for the historical callers. A language with no
     slot (English, or one this file has no label glossary for) keeps the label as written. */
  const slot = translationSlot(language);
  if (slot === NO_TRANSLATION_SLOT) return value;
  return equivalentLabelTranslations[String(value)]?.[slot] || value;
};

window.SAOContentTranslations.translateEquivalentProse = function translateEquivalentProse(value, language) {
  let translated = window.SAOContentTranslations.translateKnownTerms(value, language);
  const slot = translationSlot(language);
  /* No curated slot: the prose stands exactly as translateKnownTerms returned it (English source
     text) instead of being rewritten through another language's glossary. */
  if (slot === NO_TRANSLATION_SLOT) return translated;
  commonProsePatterns.forEach(({ pattern, translations }) => {
    /* A language whose slot this entry does not carry yet keeps the source wording: the match is left
       exactly as it was instead of being replaced with "undefined". */
    translated = translated.replace(pattern, (match, boundary) =>
      translations[slot] === undefined ? match : boundary + translations[slot]
    );
  });
  return translated;
};

function translateCommandProse(value, language) {
  const slot = translationSlot(language);
  /* No curated slot (English, or a language this file has no phrasebook for): the prose is shown as
     written rather than through another language's glossary. */
  if (slot === NO_TRANSLATION_SLOT) return String(value || "");
  const commandPhrases = {
    "Send money to another player": ["Envía dinero a otro jugador", "Envoyez de l'argent à un autre joueur", "Invia denaro a un altro giocatore"],
    "Send a private message": ["Envía un mensaje privado", "Envoyez un message privé", "Invia un messaggio privato"],
    "Reply to the last private message": ["Responde al último mensaje privado", "Répondez au dernier message privé", "Rispondi all'ultimo messaggio privato"],
    "Friend system": ["Sistema de amigos", "Système d'amis", "Sistema di amici"],
    "Party management": ["Gestión del grupo", "Gestion du groupe", "Gestione del gruppo"],
    "Trade with another player": ["Intercambia con otro jugador", "Échangez avec un autre joueur", "Scambia con un altro giocatore"],
    "Opens your in game mail": ["Abre tu correo del juego", "Ouvre votre courrier en jeu", "Apre la tua posta in gioco"],
    "Opens mail sent by staff or automated systems": [
      "Abre el correo enviado por el personal o sistemas automáticos",
      "Ouvre les messages envoyés par le personnel ou les systèmes automatisés", "Apre la posta inviata dallo staff o da sistemi automatici"
    ],
    "Opens the cosmetic menu": ["Abre el menú cosmético", "Ouvre le menu cosmétique", "Apre il menu cosmetico"],
    "Animation configuration settings": [
      "Ajustes de configuración de animaciones",
      "Paramètres de configuration des animations", "Impostazioni di configurazione delle animazioni"
    ],
    "Change your title if you own one": [
      "Cambia tu título si tienes uno",
      "Changez votre titre si vous en possédez un", "Cambia il tuo titolo se ne possiedi uno"
    ],
    "Configure Zoomify settings": ["Configura los ajustes de Zoomify", "Configurez les paramètres de Zoomify", "Configura le impostazioni di Zoomify"],
    "Opens dungeon help and dungeon commands": [
      "Abre la ayuda y los comandos de mazmorra",
      "Ouvre l'aide et les commandes des donjons", "Apre la guida e i comandi del dungeon"
    ],
    "Queue management for dungeons or lobbies": [
      "Gestión de colas para mazmorras o salas",
      "Gestion des files d'attente des donjons ou des salons", "Gestione delle code per dungeon o lobby"
    ],
    "Auction House commands": ["Comandos de la casa de subastas", "Commandes de l'hôtel des ventes", "Comandi della Casa d'Aste"],
    "Check balances, leave name blank to see your own balance": [
      "Consulta los saldos; deja el nombre vacío para ver el tuyo",
      "Consultez les soldes ; laissez le nom vide pour voir le vôtre", "Controlla i saldi; lascia il nome vuoto per vedere il tuo saldo"
    ],
    "Opens the post office": ["Abre la oficina de correos", "Ouvre le bureau de poste", "Apre l'ufficio postale"],
    "Opens a trash inventory": ["Abre un inventario de basura", "Ouvre un inventaire de déchets", "Apre un inventario dei rifiuti"],
    "Opens your backpack": ["Abre tu mochila", "Ouvre votre sac à dos", "Apre il tuo zaino"],
    "Opens your collection/codex": ["Abre tu colección o códice", "Ouvre votre collection ou codex", "Apre la tua collezione/codice"],
    "Opens the companion menu": ["Abre el menú de compañeros", "Ouvre le menu des compagnons", "Apre il menu dei compagni"],
    "Move items between Underworld and Aincrad": [
      "Mueve objetos entre Underworld y Aincrad",
      "Déplacez des objets entre Underworld et Aincrad", "Sposta oggetti tra Underworld e Aincrad"
    ],
    "Shows class or job statistics": [
      "Muestra las estadísticas de clase o trabajo",
      "Affiche les statistiques de classe ou de métier", "Mostra le statistiche di classe o professione"
    ],
    "Opens the mount menu": ["Abre el menú de monturas", "Ouvre le menu des montures", "Apre il menu delle cavalcature"],
    "Shows your skills": ["Muestra tus habilidades", "Affiche vos compétences", "Mostra le tue abilità"],
    "Opens your skill tree": ["Abre tu árbol de habilidades", "Ouvre votre arbre de compétences", "Apre il tuo albero delle abilità"],
    "Shows your stats": ["Muestra tus estadísticas", "Affiche vos statistiques", "Mostra le tue statistiche"],
    "Opens the quest codex": ["Abre el códice de misiones", "Ouvre le codex des quêtes", "Apre il codice delle missioni"],
    "Bug reporting command": ["Comando para informar de errores", "Commande de signalement de bugs", "Comando per segnalare bug"],
    "Displays server information": ["Muestra información del servidor", "Affiche les informations du serveur", "Mostra le informazioni del server"],
    "Opens game news": ["Abre las noticias del juego", "Ouvre les actualités du jeu", "Apre le notizie del gioco"],
    "Displays server version information": [
      "Muestra la versión del servidor",
      "Affiche les informations de version du serveur", "Mostra le informazioni sulla versione del server"
    ],
    "Voice chat controls": ["Controles del chat de voz", "Contrôles du chat vocal", "Controlli della chat vocale"],
    "Returns you to the hub": ["Te devuelve al centro", "Vous ramène au hub", "Ti riporta all'hub"],
    "Does nothing currently but a menu pops up": [
      "No hace nada actualmente, pero aparece un menú",
      "Ne fait rien pour le moment, mais un menu apparaît", "Attualmente non fa nulla, ma appare un menu"
    ],
    "You can run it but nothing pops up": [
      "Puedes ejecutarlo, pero no aparece nada",
      "Vous pouvez l'exécuter, mais rien n'apparaît", "Puoi eseguirlo, ma non appare nulla"
    ],
    "currently appears broken or disabled": [
      "parece estar roto o desactivado actualmente",
      "semble actuellement cassé ou désactivé", "attualmente sembra rotto o disattivato"
    ],
    "Broken Right Now": ["Roto ahora mismo", "Cassé pour le moment", "Rotto in questo momento"],
    "Sends Username a friend request": [
      "Envía a Username una solicitud de amistad",
      "Envoie une demande d'ami à Username", "Invia a Username una richiesta di amicizia"
    ],
    "Removes Username as a friend": ["Elimina a Username como amigo", "Retire Username de vos amis", "Rimuove Username dagli amici"],
    "Accepts Username's friend request": [
      "Acepta la solicitud de amistad de Username",
      "Accepte la demande d'ami de Username", "Accetta la richiesta di amicizia di Username"
    ],
    "Denies Username's friend request": [
      "Rechaza la solicitud de amistad de Username",
      "Refuse la demande d'ami de Username", "Rifiuta la richiesta di amicizia di Username"
    ],
    "Shows your whole friend list and extra info": [
      "Muestra toda tu lista de amigos y datos adicionales",
      "Affiche toute votre liste d'amis et des informations supplémentaires", "Mostra tutta la tua lista di amici e informazioni extra"
    ],
    "Toggles your chat into party chat. Run the command again to turn it off.": [
      "Activa el chat de grupo. Ejecuta el comando de nuevo para desactivarlo.",
      "Active le chat de groupe. Exécutez à nouveau la commande pour le désactiver.", "Attiva la chat di gruppo. Esegui di nuovo il comando per disattivarla."
    ],
    "Shows party commands": ["Muestra los comandos de grupo", "Affiche les commandes de groupe", "Mostra i comandi di gruppo"],
    "Party chat shortcut": ["Acceso directo al chat de grupo", "Raccourci du chat de groupe", "Scorciatoia per la chat di gruppo"],
    "Shows info of the party you are currently in": [
      "Muestra información del grupo en el que estás",
      "Affiche les informations de votre groupe actuel", "Mostra le informazioni del gruppo in cui ti trovi"
    ],
    "Leaves the party you are currently in": ["Abandona el grupo actual", "Quitte votre groupe actuel", "Abbandona il gruppo in cui ti trovi"],
    "Shows current online parties": [
      "Muestra los grupos conectados actualmente",
      "Affiche les groupes actuellement en ligne", "Mostra i gruppi attualmente online"
    ],
    "Invites Username to your party": ["Invita a Username a tu grupo", "Invite Username dans votre groupe", "Invita Username nel tuo gruppo"],
    "Pays Username 10 Col": ["Paga 10 Col a Username", "Paie 10 Col à Username", "Paga 10 Col a Username"],
    "Sends Username a trade request": [
      "Envía a Username una solicitud de intercambio",
      "Envoie une demande d'échange à Username", "Invia a Username una richiesta di scambio"
    ],
    "Lets you hear players": ["Te permite oír a los jugadores", "Vous permet d'entendre les joueurs", "Ti permette di sentire i giocatori"],
    "Doesnt let you hear players": ["No te permite oír a los jugadores", "Ne vous permet pas d'entendre les joueurs", "Non ti permette di sentire i giocatori"],
    "Mutes your mic": ["Silencia tu micrófono", "Coupe votre micro", "Disattiva il tuo microfono"],
    "Unmutes your mic": ["Activa tu micrófono", "Réactive votre micro", "Riattiva il tuo microfono"],
    "Plays music": ["Reproduce música", "Lit la musique", "Riproduce la musica"],
    "Stops music": ["Detiene la música", "Arrête la musique", "Ferma la musica"],
    "Changes music volume": ["Cambia el volumen de la música", "Modifie le volume de la musique", "Cambia il volume della musica"],
    "This cmd is a Work In Progress right now": [
      "Este comando está en desarrollo",
      "Cette commande est en cours de développement", "Questo comando è attualmente in fase di sviluppo"
    ],
    "Shows random info": ["Muestra información aleatoria", "Affiche des informations aléatoires", "Mostra informazioni casuali"],
    "Shows your current spot in your queue": [
      "Muestra tu posición actual en la cola",
      "Affiche votre position actuelle dans la file", "Mostra la tua posizione attuale nella coda"
    ],
    "Leaves your current lobby queue": ["Abandona la cola de la sala actual", "Quitte la file de votre salon actuel", "Abbandona la coda della lobby attuale"],
    "Just opens the basic Auction House": [
      "Solo abre la casa de subastas básica",
      "Ouvre simplement l'hôtel des ventes de base", "Apre semplicemente la Casa d'Aste base"
    ],
    "Lets you see your Auction House history": [
      "Te permite ver el historial de tu casa de subastas",
      "Permet de consulter l'historique de votre hôtel des ventes", "Ti permette di vedere la cronologia della tua Casa d'Aste"
    ],
    "Lets you see Username's Auction House history": [
      "Te permite ver el historial de subastas de Username",
      "Permet de consulter l'historique des ventes de Username", "Ti permette di vedere la cronologia della Casa d'Aste di Username"
    ],
    "Shows matching listings where Pumba is the first word": [
      "Muestra anuncios coincidentes donde Pumba es la primera palabra",
      "Affiche les annonces correspondantes où Pumba est le premier mot", "Mostra gli annunci corrispondenti in cui Pumba è la prima parola"
    ],
    "This checks your col": ["Consulta tus Col", "Consulte vos Col", "Questo controlla i tuoi Col"],
    "This opens your trash bin, close the menu to confirm deletion.": [
      "Abre tu papelera; cierra el menú para confirmar la eliminación.",
      "Ouvre votre corbeille ; fermez le menu pour confirmer la suppression.", "Apre il tuo cestino; chiudi il menu per confermare l'eliminazione."
    ],
    "Music player command, currently appears broken or disabled. This may be better kept staff-only (Broken Right Now?)":
      [
        "Comando del reproductor de música; actualmente parece roto o desactivado. Quizá sea mejor mantenerlo solo para el personal (¿roto ahora mismo?)",
        "Commande du lecteur de musique ; elle semble actuellement cassée ou désactivée. Il vaudrait peut-être mieux la réserver au personnel (Cassé pour le moment ?)", "Comando del lettore musicale; attualmente sembra rotto o disattivato. Forse è meglio riservarlo allo staff (Rotto in questo momento?)"
      ],
    "Takes you to your player island, only usable in Fractured Underworld": [
      "Te lleva hacia tu propia isla de jugador; solo se puede usar en Fractured Underworld",
      "Vous emmène sur votre île de joueur ; utilisable uniquement dans Fractured Underworld", "Ti porta sulla tua isola del giocatore; utilizzabile solo in Fractured Underworld"
    ],
    "Appears to be a staff moderation command but can be run by players; remove from this list after Underworld release if still inactive":
      [
        "Parece ser un comando de moderación del personal, pero los jugadores pueden ejecutarlo; elimínalo de esta lista tras el lanzamiento de Underworld si sigue inactivo",
        "Semble être une commande de modération du personnel, mais les joueurs peuvent l'exécuter ; retirez-la de cette liste après la sortie d'Underworld si elle reste inactive", "Sembra un comando di moderazione dello staff, ma i giocatori possono eseguirlo; rimuovilo da questo elenco dopo il rilascio di Underworld se resta inattivo"
      ],
    "Music player command": ["Comando del reproductor de música", "Commande du lecteur de musique", "Comando del lettore musicale"],
    "This may be better kept staff-only": [
      "Quizá sea mejor mantenerlo solo para el personal",
      "Il vaudrait peut-être mieux la garder pour le personnel", "Forse è meglio riservarlo allo staff"
    ],
    "Takes you to your player island": [
      "Te lleva hacia tu propia isla de jugador",
      "Vous emmène sur votre île de joueur", "Ti porta sulla tua isola del giocatore"
    ],
    /* Whole-string help/usage entries: curated so command syntax, placeholders and slash commands
	   stay exactly as written while the surrounding explanation reads naturally. */
    "/friend add Username (Sends Username a friend request)\n/friend remove Username (Removes Username as a friend)\n/friend accept Username (Accepts Username's friend request)\n/friend deny Username (Denies Username's friend request)\n/friend list (Shows your whole friend list and extra info)":
      [
        "/friend add Username (Envía a Username una solicitud de amistad)\n/friend remove Username (Elimina a Username de tus amigos)\n/friend accept Username (Acepta la solicitud de amistad de Username)\n/friend deny Username (Rechaza la solicitud de amistad de Username)\n/friend list (Muestra toda tu lista de amigos y datos adicionales)",
        "/friend add Username (Envoie une demande d'ami à Username)\n/friend remove Username (Retire Username de vos amis)\n/friend accept Username (Accepte la demande d'ami de Username)\n/friend deny Username (Refuse la demande d'ami de Username)\n/friend list (Affiche toute votre liste d'amis et des informations supplémentaires)", "/friend add Username (Invia a Username una richiesta di amicizia)\n/friend remove Username (Rimuove Username dagli amici)\n/friend accept Username (Accetta la richiesta di amicizia di Username)\n/friend deny Username (Rifiuta la richiesta di amicizia di Username)\n/friend list (Mostra tutta la tua lista di amici e informazioni extra)"
      ],
    '/p Message (Like "/party chat", it sends a message in your party chat only to see but it does not toggle it.)': [
      '/p Message (Como "/party chat", envía un mensaje a tu chat de grupo solo para verlo, pero no lo activa.)',
      '/p Message (Comme "/party chat", envoie un message dans votre chat de groupe uniquement pour le voir, mais ne l\'active pas.)', "/p Message (Come \"/party chat\", invia un messaggio nella tua chat di gruppo solo per vederlo, ma non la attiva.)"
    ],
    "/party chat (Toggles your chat into party chat. Run the command again to turn it off.)\n/party help (Shows party commands)\n/party info (Shows info of the party you are currently in)\n/party leave (Leaves the party you are currently in)\n/party list (Shows current online parties)\n/party invite Username (Invites Username to your party)":
      [
        "/party chat (Activa el chat de grupo. Ejecuta el comando de nuevo para desactivarlo.)\n/party help (Muestra los comandos de grupo)\n/party info (Muestra información del grupo en el que estás)\n/party leave (Abandona el grupo actual)\n/party list (Muestra los grupos conectados actualmente)\n/party invite Username (Invita a Username a tu grupo)",
        "/party chat (Active le chat de groupe. Exécutez à nouveau la commande pour le désactiver.)\n/party help (Affiche les commandes de groupe)\n/party info (Affiche les informations de votre groupe actuel)\n/party leave (Quitte votre groupe actuel)\n/party list (Affiche les groupes actuellement en ligne)\n/party invite Username (Invite Username dans votre groupe)", "/party chat (Attiva la chat di gruppo. Esegui di nuovo il comando per disattivarla.)\n/party help (Mostra i comandi di gruppo)\n/party info (Mostra le informazioni del gruppo in cui ti trovi)\n/party leave (Abbandona il gruppo in cui ti trovi)\n/party list (Mostra i gruppi attualmente online)\n/party invite Username (Invita Username nel tuo gruppo)"
      ],
    "/pay Username 10 (Pays Username 10 Col)": [
      "/pay Username 10 (Paga 10 Col a Username)",
      "/pay Username 10 (Paie 10 Col à Username)", "/pay Username 10 (Paga 10 Col a Username)"
    ],
    "/r Message (Replies to the private message you may have just gotten or to someone who just replied to your private message)":
      [
        "/r Message (Responde al mensaje privado que acabas de recibir o a quien acaba de responder a tu mensaje privado)",
        "/r Message (Répond au message privé que vous venez de recevoir ou à la personne qui vient de répondre à votre message privé)", "/r Message (Risponde al messaggio privato che hai appena ricevuto o a chi ha appena risposto al tuo messaggio privato)"
      ],
    "/trade Username (Sends Username a trade request)": [
      "/trade Username (Envía a Username una solicitud de intercambio)",
      "/trade Username (Envoie une demande d'échange à Username)", "/trade Username (Invia a Username una richiesta di scambio)"
    ],
    "/w Username Message (Party or not, it sends a private message to Username)": [
      "/w Username Message (Tanto si estás en grupo como si no, envía un mensaje privado a Username)",
      "/w Username Message (Que vous soyez en groupe ou non, envoie un message privé à Username)", "/w Username Message (In gruppo o no, invia un messaggio privato a Username)"
    ],
    "/cosmetic (Lets you see all cosmetics in game and/or lets you enable/disable them)": [
      "/cosmetic (Te permite ver todos los cosméticos del juego y activarlos o desactivarlos)",
      "/cosmetic (Vous permet de voir tous les cosmétiques du jeu et de les activer ou de les désactiver)", "/cosmetic (Ti permette di vedere tutti i cosmetici del gioco e/o di attivarli o disattivarli)"
    ],
    "/queue restore (I dont want to explain what this cmd does)\n/queue status (Shows your current spot in your queue)\n/queue leave (Leaves your current lobby queue)\n/queue batch (Shows random info)":
      [
        "/queue restore (No quiero explicar qué hace este comando)\n/queue status (Muestra tu posición actual en la cola)\n/queue leave (Abandona la cola de la sala actual)\n/queue batch (Muestra información aleatoria)",
        "/queue restore (Je ne veux pas expliquer ce que fait cette commande)\n/queue status (Affiche votre position actuelle dans la file d'attente)\n/queue leave (Quitte la file d'attente de votre salon actuel)\n/queue batch (Affiche des informations aléatoires)", "/queue restore (Non voglio spiegare cosa fa questo comando)\n/queue status (Mostra la tua posizione attuale nella coda)\n/queue leave (Abbandona la coda della lobby attuale)\n/queue batch (Mostra informazioni casuali)"
      ],
    "/ah (Just opens the basic Auction House)\n/ah auction 5 (Price) 1 (Amount)\n/ah history (Lets you see your Auction House history)\n/ah history Username (Lets you see Username's Auction House history)\n/ah sell 5 (Price) 1 (Amount)\n/ah profile (Lets you see your Auction House profile)\n/ah profile Username (Lets you see Username's Auction House profile)\n/ah search seller Username (Lets you see all Username's current auctions/sells)\n/ah search Pumba (Shows matching listings where Pumba is the first word)\n/ah stash (If no-one buys your item in the time frame and it goes off sale, they go here)\n/ah top (Shows you the top people of the Auction House leaderboard)":
      [
        "/ah (Abre la casa de subastas básica)\n/ah auction 5 (Price) 1 (Amount)\n/ah history (Te permite ver tu historial de la casa de subastas)\n/ah history Username (Te permite ver el historial de la casa de subastas de Username)\n/ah sell 5 (Price) 1 (Amount)\n/ah profile (Te permite ver tu perfil de la casa de subastas)\n/ah profile Username (Te permite ver el perfil de la casa de subastas de Username)\n/ah search seller Username (Te permite ver todas las subastas y ventas actuales de Username)\n/ah search Pumba (Muestra los anuncios coincidentes en los que Pumba es la primera palabra)\n/ah stash (Si nadie compra tu objeto en el plazo previsto y deja de estar en venta, va aquí)\n/ah top (Muestra a las personas mejor situadas en la clasificación de la casa de subastas)",
        "/ah (Ouvre l'hôtel des ventes de base)\n/ah auction 5 (Price) 1 (Amount)\n/ah history (Vous permet de voir votre historique de l'hôtel des ventes)\n/ah history Username (Vous permet de voir l'historique de l'hôtel des ventes de Username)\n/ah sell 5 (Price) 1 (Amount)\n/ah profile (Vous permet de voir votre profil de l'hôtel des ventes)\n/ah profile Username (Vous permet de voir le profil de l'hôtel des ventes de Username)\n/ah search seller Username (Vous permet de voir toutes les ventes en cours de Username)\n/ah search Pumba (Affiche les annonces correspondantes où Pumba est le premier mot)\n/ah stash (Si personne n'achète votre objet dans le délai prévu et qu'il n'est plus en vente, il arrive ici)\n/ah top (Affiche les personnes les mieux classées de l'hôtel des ventes)", "/ah (Apre semplicemente la Casa d'Aste base)\n/ah auction 5 (Price) 1 (Amount)\n/ah history (Ti permette di vedere la cronologia della tua Casa d'Aste)\n/ah history Username (Ti permette di vedere la cronologia della Casa d'Aste di Username)\n/ah sell 5 (Price) 1 (Amount)\n/ah profile (Ti permette di vedere il tuo profilo della Casa d'Aste)\n/ah profile Username (Ti permette di vedere il profilo della Casa d'Aste di Username)\n/ah search seller Username (Ti permette di vedere tutte le aste e le vendite attuali di Username)\n/ah search Pumba (Mostra gli annunci corrispondenti in cui Pumba è la prima parola)\n/ah stash (Se nessuno compra il tuo oggetto entro il tempo previsto e va fuori vendita, finisce qui)\n/ah top (Mostra le persone in cima alla classifica della Casa d'Aste)"
      ],
    "/bal (This checks your col)\n/bal Username (This checks Username's col)": [
      "/bal (Consulta tus Col)\n/bal Username (Consulta los Col de Username)",
      "/bal (Consulte vos Col)\n/bal Username (Consulte les Col de Username)", "/bal (Questo controlla i tuoi Col)\n/bal Username (Questo controlla i Col di Username)"
    ]
  };
  let source = String(value || "");
  /* A curated whole-string entry is authoritative: return it as written so the word-level pass
	   below cannot re-gloss or re-order already-translated prose. */
  if (Object.prototype.hasOwnProperty.call(commandPhrases, source)) {
    return commandPhrases[source][slot] ?? source;
  }
  Object.entries(commandPhrases)
    .sort(([left], [right]) => right.length - left.length)
    .forEach(([english, localized]) => {
      source = source.replace(
        new RegExp(english.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\\\$&"), "g"),
        localized[slot] ?? english
      );
    });
  const commandWords = {
    Displays: ["Muestra", "Affiche", "Mostra"],
    information: ["información", "informations", "informazioni"],
    version: ["versión", "version", "versione"],
    Opens: ["Abre", "Ouvre", "Apre"],
    Shows: ["Muestra", "Affiche", "Mostra"],
    commands: ["comandos", "commandes", "comandi"],
    command: ["comando", "commande", "comando"],
    menu: ["menú", "menu", "menu"],
    settings: ["ajustes", "paramètres", "impostazioni"],
    your: ["tu", "votre", "tuo"],
    the: ["el", "le", "il"],
    currently: ["actualmente", "actuellement", "attualmente"],
    appears: ["parece", "semble", "appare"],
    staff: ["personal", "personnel", "personale"],
    moderation: ["moderación", "modération", "moderazione"],
    players: ["jugadores", "joueurs", "giocatori"],
    player: ["jugador", "joueur", "giocatore"],
    systems: ["sistemas", "systèmes", "sistemi"],
    available: ["disponible", "disponible", "disponibile"],
    disabled: ["desactivado", "désactivé", "disattivato"],
    configuration: ["configuración", "configuration", "configurazione"],
    statistics: ["estadísticas", "statistiques", "statistiche"],
    server: ["servidor", "serveur", "server"],
    game: ["juego", "jeu", "gioco"],
    news: ["noticias", "actualités", "notizie"],
    controls: ["controles", "contrôles", "controlli"],
    returns: ["devuelve", "ramène", "riporta"],
    hub: ["centro", "hub", "hub"],
    nothing: ["nada", "rien", "niente"],
    pops: ["aparece", "apparaît", "compare"],
    work: ["trabajo", "travail", "lavoro"],
    progress: ["progreso", "progression", "progresso"]
  };
  return source
    .split(/(\([^()]*\))/g)
    .map((part, index) => {
      if (index % 2 === 0 && /^\s*\//.test(part)) return part;
      let translatedPart = part.startsWith("(") && part.endsWith(")") ? part.slice(1, -1) : part;
      Object.entries(commandWords).forEach(([english, localized]) => {
        translatedPart = translatedPart.replace(new RegExp(`\\b${english}\\b`, "g"), localized[slot] ?? english);
      });
      translatedPart = window.SAOContentTranslations.translateEquivalentProse(translatedPart, language);
      return part.startsWith("(") && part.endsWith(")") ? `(${translatedPart})` : translatedPart;
    })
    .join("");
}

window.SAOContentTranslations.registerCommandEntry = function registerCommandEntry(entry, id) {
  ["usage", "example"].forEach((field) => {
    if (!entry[field]) return;
    window.SAOContentTranslations.register(
      `command.${id}.${field}`,
      entry[field],
      translationsByLanguage((language) => translateCommandProse(entry[field], language))
    );
  });
};

const characterBuildTermTranslations = {
  Foundation: ["Fundamento", "Fondation", "Fondamenta"],
  Ranger: ["Explorador", "Éclaireur", "Esploratore"],
  Duelist: ["Duelista", "Duelliste", "Duellante"],
  Guardian: ["Guardián", "Gardien", "Guardiano"],
  Arcanist: ["Arcanista", "Arcaniste", "Arcanista"],
  "Martial Artist": ["Artista marcial", "Artiste martial", "Artista Marziale"],
  Shaman: ["Chamán", "Chaman", "Sciamano"],
  Spirit: ["Espíritu", "Esprit", "Spirito"],
  "Ranger's": ["Del explorador", "De l'éclaireur", "Dell'esploratore"],
  "Duelist's": ["Del duelista", "Du duelliste", "Del duellante"],
  "Guardian's": ["Del guardián", "Du gardien", "Del guardiano"],
  "Arcanist's": ["Del arcanista", "De l'arcaniste", "Dell'arcanista"],
  "Monk's": ["Del monje", "Du moine", "Del monaco"],
  "Spirit's": ["Del espíritu", "De l'esprit", "Dello spirito"],
  Eagle: ["Águila", "Aigle", "Aquila"],
  Hawkeye: ["Ojo de halcón", "Œil de faucon", "Occhio di Falco"],
  Eye: ["Ojo", "Œil", "Occhio"],
  Measured: ["Medido", "Mesuré", "Misurato"],
  Draw: ["Disparo", "Tir", "Tiro"],
  Swift: ["Rápido", "Rapide", "Rapido"],
  Step: ["Paso", "Pas", "Passo"],
  Finish: ["Final", "Finale", "Finale"],
  Trail: ["Rastro", "Piste", "Pista"],
  Rations: ["Raciones", "Rations", "Razioni"],
  Quick: ["Rápido", "Rapide", "Rapido"],
  Release: ["Liberación", "Libération", "Rilascio"],
  Marked: ["Marcado", "Marqué", "Marcato"],
  Shot: ["Disparo", "Tir", "Colpo"],
  Storm: ["Tormenta", "Tempête", "Tempesta"],
  Volley: ["Descarga", "Volée", "Salva"],
  Light: ["Ligero", "Léger", "Leggero"],
  Footwork: ["Juego de pies", "Jeu de jambes", "Gioco di Gambe"],
  Silent: ["Silencioso", "Silencieux", "Silenzioso"],
  Edge: ["Filo", "Lame", "Lama"],
  Vanish: ["Desaparición", "Disparition", "Sparizione"],
  Execution: ["Ejecución", "Exécution", "Esecuzione"],
  Point: ["Punto", "Point", "Punto"],
  "Fencer's": ["Del espadachín", "De l'escrimeur", "Dello Spadaccino"],
  Rhythm: ["Ritmo", "Rythme", "Ritmo"],
  Weak: ["Débil", "Faible", "Debole"],
  Sudden: ["Repentino", "Soudain", "Improvviso"],
  Strike: ["Golpe", "Frappe", "Colpo"],
  Perfect: ["Perfecta", "Parfaite", "Perfetta"],
  Opening: ["Apertura", "Ouverture", "Apertura"],
  Iron: ["Hierro", "Fer", "Ferro"],
  Wall: ["Muro", "Mur", "Muro"],
  Brace: ["Apoyo", "Appui", "Sostegno"],
  Hold: ["Mantener", "Maintien", "Mantenimento"],
  Fast: ["Firme", "Ferme", "Saldo"],
  Bulwark: ["Baluarte", "Rempart", "Baluardo"],
  Heavy: ["Pesado", "Lourd", "Pesante"],
  Fortified: ["Fortificado", "Fortifié", "Fortificato"],
  Core: ["Núcleo", "Noyau", "Nucleo"],
  Bash: ["Golpe", "Coup", "Colpo"],
  Last: ["Última", "Dernière", "Ultima"],
  Stand: ["Resistencia", "Résistance", "Resistenza"],
  Arcane: ["Arcano", "Arcanique", "Arcano"],
  Thread: ["Hilo", "Fil", "Filo"],
  Mana: ["Maná", "Mana", "Mana"],
  Well: ["Pozo", "Puits", "Pozzo"],
  Spell: ["Hechizo", "Sort", "Incantesimo"],
  Sunder: ["Ruptura", "Brisure", "Frantumazione"],
  Astral: ["Astral", "Astral", "Astrale"],
  Focus: ["Enfoque", "Concentration", "Concentrazione"],
  Flowing: ["Fluido", "Fluide", "Fluido"],
  Aether: ["Éter", "Éther", "Etere"],
  Guard: ["Guardia", "Garde", "Guardia"],
  Starfall: ["Lluvia estelar", "Pluie d'étoiles", "Pioggia di Stelle"],
  Grand: ["Gran", "Grand", "Grande"],
  Formula: ["Fórmula", "Formule", "Formula"],
  Monk: ["Monje", "Moine", "Monaco"],
  Fist: ["Puño", "Poing", "Pugno"],
  Form: ["Forma", "Forme", "Forma"],
  Rapid: ["Rápido", "Rapide", "Rapido"],
  Hands: ["Manos", "Mains", "Mani"],
  Centered: ["Centrado", "Centré", "Centrato"],
  Breath: ["Aliento", "Souffle", "Respiro"],
  Counter: ["Contraataque", "Contre", "Contrattacco"],
  Limit: ["Límite", "Limite", "Limite"],
  Break: ["Ruptura", "Brèche", "Rottura"],
  Mending: ["Sanación", "Soin", "Risanamento"],
  Rite: ["Ritual", "Rite", "Rito"],
  Link: ["Vínculo", "Lien", "Legame"],
  Rooted: ["Arraigado", "Enraciné", "Radicato"],
  Renewal: ["Renovación", "Renouvellement", "Rinnovamento"],
  Calm: ["Calmas", "Calmes", "Calme"],
  Waters: ["Aguas", "Eaux", "Acque"],
  Living: ["Viviente", "Vivant", "Vivente"],
  Grove: ["Arboleda", "Bosquet", "Boschetto"],
  Kindred: ["Afines", "Proches", "Affini"],
  Sanctuary: ["Santuario", "Sanctuaire", "Santuario"]
};

function translateCharacterBuildText(value, language) {
  const slot = translationSlot(language);
  if (slot === NO_TRANSLATION_SLOT) return String(value || "");
  let translated = String(value || "");
  Object.entries(characterBuildTermTranslations)
    .sort(([left], [right]) => right.length - left.length)
    .forEach(([english, localized]) => {
      translated = translated.replace(
        new RegExp(`\\b${english.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\\\$&")}\\b`, "g"),
        localized[slot] ?? english
      );
    });
  return translated;
}

window.SAOContentTranslations.registerCharacterBuildNode = function registerCharacterBuildNode(node) {
  const baseKey = `characterBuild.skill.${node.id}`;
  window.SAOContentTranslations.register(
    baseKey + ".name",
    node.name,
    translationsByLanguage((language) => translateCharacterBuildText(node.name, language))
  );
  window.SAOContentTranslations.register(
    baseKey + ".description",
    node.description,
    translationsByLanguage((language) => translateCharacterBuildText(node.description, language))
  );
};

window.SAOContentTranslations.registerEquipmentEntry = function registerEquipmentEntry(entry, slugify, options) {
  const id = entry.id || slugify(entry.name);
  const fields = options?.fields ? new Set(options.fields) : null;
  const includes = (field) => !fields || fields.has(field);
  const register = (field, value) => {
    if (!value) return;
    const key = `equipment.${id}.${field}`;
    const curated = curatedProseTranslations[value];
    /* curatedOnly: the caller keeps its own fallback for values without a curated translation,
		   so a page that already glosses prose itself does not receive a second, different gloss. */
    if (options?.curatedOnly && !curated) return;
    /* translateEquivalentProse already applies the equipment/location glossary once. The value
		   must not be pushed through the glossary again: re-translating already-Spanish output
		   re-substitutes the words it just produced ("Tablón de acacia" -> "Tablón de Acacia").
		   The per-language value is built from the curated pair (read by language code) or from the
		   prose glossary, and a key already registered for that language always wins. */
    window.SAOContentTranslations.register(
      key,
      value,
      translationsByLanguage(
        (language) =>
          window.SAOContentTranslations[language][key] ||
          pairValue(curated, language) ||
          window.SAOContentTranslations.translateEquivalentProse(value, language)
      )
    );
  };

  if (includes("name")) register("name", entry.name);
  if (includes("description")) register("description", entry.description);
  if (includes("craftingLocation")) register("craftingLocation", entry.craftingLocation);
  if (includes("craftingNote")) register("craftingNote", entry.craftingNote);
  if (includes("stats")) Object.keys(entry.stats || {}).forEach((stat) => register(`stat.${slugify(stat)}`, stat));
  if (includes("craftingResources"))
    (entry.craftingResources || []).forEach((resource) =>
      register(`resource.${slugify(resource.item)}`, resource.item)
    );
};

window.SAOContentTranslations.registerQuestEntry = function registerQuestEntry(entry, slugify) {
  const id = entry.id || slugify([entry.npcName, entry.city, entry.coordinates, entry.questName].join("-"));
  ["npcName", "city", "questName"].forEach((field) => {
    if (!entry[field]) return;
    const curated = field === "questName" ? curatedQuestTranslations[entry[field]] : null;
    const location = locationTranslations[entry[field]];
    const npc = npcTranslations[entry[field]];
    /* The curated pair, the location glossary and the NPC glossary are all read by language code;
       a curated entry that is already the source text falls back to the label glossary, exactly as
       the Spanish and French branches did before this became language-keyed. */
    window.SAOContentTranslations.register(
      `quest.${id}.${field}`,
      entry[field],
      translationsByLanguage((language) => {
        const label = window.SAOContentTranslations.translateEquivalentLabel(entry[field], language);
        const curatedValue = pairValue(curated, language);
        if (curatedValue === entry[field]) return label;
        return curatedValue || pairValue(location, language) || pairValue(npc, language) || label;
      })
    );
  });
  ["requirements", "bonusItems"].forEach((field) => {
    if (!entry[field]) return;
    const curated = curatedQuestFieldTranslations[entry[field]];
    window.SAOContentTranslations.register(
      `quest.${id}.${field}`,
      entry[field],
      translationsByLanguage(
        (language) =>
          window.SAOContentTranslations[language][`quest.${id}.${field}`] ||
          pairValue(curated, language) ||
          window.SAOContentTranslations.translateKnownTerms(entry[field], language)
      )
    );
  });
};

const mapTypeTranslations = {
  NPC: ["PNJ", "PNJ", "PNG"],
  Biome: ["Bioma", "Biome", "Bioma"],
  Quest: ["Misión", "Quête", "Missione"],
  Boss: ["Jefe", "Boss", "Boss"],
  Dungeon: ["Mazmorra", "Donjon", "Dungeon"]
};
const mapTitleTranslations = {
  "Abandoned Castle": ["Castillo abandonado", "Château abandonné", "Castello abbandonato"],
  "Wavy Monster Bay": ["Bahía de monstruos ondulantes", "Baie des monstres ondoyants", "Baia dei Mostri Ondulanti"],
  "Bandit Camps": ["Campamentos de bandidos", "Camps de bandits", "Accampamenti dei banditi"],
  "Millennial Baobab": ["Baobab milenario", "Baobab millénaire", "Baobab Millenario"],
  Caverns: ["Cavernas", "Cavernes", "Caverne"],
  "Earan Forest": ["Bosque de Earan", "Forêt d'Earan", "Foresta di Earan"],
  "Earan Land": ["Tierra de Earan", "Terre d'Earan", "Terra di Earan"],
  "Elessarh Mine": ["Mina de Elessarh", "Mine d'Elessarh", "Miniera di Elessarh"],
  "Entrance to the Labyrinth": ["Entrada al laberinto", "Entrée du labyrinthe", "Ingresso del labirinto"],
  Farm: ["Granja", "Ferme", "Fattoria"],
  "Emerald Wings Forest": ["Bosque de alas esmeralda", "Forêt des ailes d'émeraude", "Foresta delle Ali di Smeraldo"],
  "The Facet of Reality": ["La faceta de la realidad", "La facette de la réalité", "La sfaccettatura della realtà"],
  "In Search of the Ngangas": ["En busca de los Ngangas", "À la recherche des Ngangas", "Alla ricerca dei Ngangas"],
  "Kitchen Help": ["Ayuda en cocina", "Aide en cuisine", "Aiuto in cucina"],
  "It Stings but Feels Good": ["Pica, pero sienta bien", "Ça pique, mais ça fait du bien", "Punge, ma fa bene"],
  "Road to Urbus": ["Camino a Urbus", "Route d'Urbus", "Strada per Urbus"],
  "Talking With Yaa": ["Hablar con Yaa", "Parler avec Yaa", "Parlare con Yaa"],
  "Hating the Green": ["Odio al verde", "Détester le vert", "Odio per il verde"],
  "The Art of Hides": ["El arte de las pieles", "L'art des peaux", "L'arte delle pelli"],
  "The Imprint of the Seas": ["La huella de los mares", "L'empreinte des mers", "L'impronta dei mari"],
  "Step 2": ["Etapa 2", "Étape 2", "Passo 2"],
  "The Purification Ritual": ["El ritual de purificación", "Le rituel de purification", "Il rituale di purificazione"],
  "The Tribute Before the Verdict": ["El tributo antes del veredicto", "Le tribut avant le verdict", "Il tributo prima del verdetto"],
  "The Cabin Base": ["La base de la cabaña", "La base de la cabane", "Le fondamenta della capanna"],
  "The Cabin Walls": ["Las paredes de la cabaña", "Les murs de la cabane", "Le pareti della capanna"],
  "My First Weapon": ["Mi primera arma", "Ma première arme", "La mia prima arma"],
  "Cleaning Taran's Skies": ["Limpiar los cielos de Taran", "Nettoyer les cieux de Taran", "Ripulire i cieli di Taran"],
  "No, It's Fashion": ["No, es moda", "Non, c'est la mode", "No, è la moda"],
  "Talk to the Strange Woman": ["Habla con la mujer extraña", "Parler à la femme étrange", "Parla con la donna strana"],
  "Return to Urbus": ["Regreso a Urbus", "Retour à Urbus", "Ritorno a Urbus"],
  "A Good Little Meal": ["Una buena comida", "Un bon petit repas", "Un buon pasto"],
  "A Player Must Prove Himself": ["Un jugador debe demostrar su valía", "Un joueur doit prouver sa valeur", "Un giocatore deve dimostrare il suo valore"],
  "A Bit of Everything": ["Un poco de todo", "Un peu de tout", "Un po' di tutto"],
  "Garden of Giants": ["Jardín de gigantes", "Jardin des géants", "Giardino dei giganti"],
  "Taran Cave": ["Cueva de Taran", "Grotte de Taran", "Caverna di Taran"],
  "Guild Base": ["Base del gremio", "Base de la guilde", "Base della gilda"],
  "Ika Archipelago": ["Archipiélago de Ika", "Archipel d'Ika", "Arcipelago di Ika"],
  "King of the Cave": ["Rey de la cueva", "Roi de la caverne", "Re della caverna"],
  "Lake of the Bulls": ["Lago de los toros", "Lac des taureaux", "Lago dei tori"],
  "Lair of Aepep": ["Guarida de Aepep", "Repaire d'Aepep", "Tana di Aepep"],
  "Leader of the Bandits": ["Líder de los bandidos", "Chef des bandits", "Capo dei banditi"],
  "Sablemor Veins": ["Vetas de Sablemor", "Veines de Sablemor", "Vene di Sablemor"],
  "Local lumberjack": ["Leñador local", "Bûcheron local", "Taglialegna locale"],
  "Local Miner": ["Minero local", "Mineur local", "Minatore locale"],
  "Oak/Birch Forest": ["Bosque de Robles/Abedules", "Forêt de chênes/bouleaux", "Foresta di querce/betulle"],
  "Nganga Houses": ["Casas Nganga", "Maisons Nganga", "Case Nganga"],
  "Brazier Nest": ["Nido de braseros", "Nid des brasiers", "Nido dei bracieri"],
  "Secret Oasis": ["Oasis secreto", "Oasis secret", "Oasi segreta"],
  "Orc Camps": ["Campamentos de orcos", "Camps d'orques", "Accampamenti degli orchi"],
  "Petals Valley": ["Valle de los pétalos", "Vallée des pétales", "Valle dei petali"],
  "Rest of Ankyla": ["Descanso de Ankyla", "Repos d'Ankyla", "Riposo di Ankyla"],
  "Snow Citadel": ["Ciudadela de nieve", "Citadelle des neiges", "Cittadella delle Nevi"],
  Swamp: ["Pantano", "Marais", "Palude"],
  "The Dance of the Sleeping Treants": ["La danza de los treants dormidos", "La danse des tréants endormis", "La danza dei treant addormentati"],
  "Terrialys Well": ["Pozo de Terrialys", "Puits de Terrialys", "Pozzo di Terrialys"],
  "Taurus Tower": ["Torre de Taurus", "Tour de Taurus", "Torre di Taurus"],
  "Valley of Wolfs": ["Valle de los lobos", "Vallée des loups", "Valle dei lupi"],
  "Wolf Forest": ["Bosque de lobos", "Forêt des loups", "Foresta dei lupi"],
  "Level 1 Weapon Buyer": ["Comprador de armas de nivel 1", "Acheteur d'armes de niveau 1", "Acquirente di armi di livello 1"],
  "Level 5 Weapon Buyer": ["Comprador de armas de nivel 5", "Acheteur d'armes de niveau 5", "Acquirente di armi di livello 5"],
  "Miner of the Corner": ["Minero de la Esquina", "Mineur du Coin", "Minatore dell'Angolo"],
  "Manufacturer of the Key of Xal'Zirith": [
    "Fabricante de la llave de Xal'Zirith",
    "Fabricant de la clé de Xal'Zirith", "Fabbricante della chiave di Xal'Zirith"
  ],
  "Manufacturer of the Key to the Fallen": ["Fabricante de la llave de los Caídos", "Fabricant de la clé des Déchus", "Fabbricante della chiave dei Caduti"],
  "Manufacturer of the Key to the Forest": ["Fabricante de la llave del Bosque", "Fabricant de la clé de la Forêt", "Fabbricante della chiave della Foresta"],
  "Manufacturer of the Aragorn Necklace": ["Fabricante del collar de Aragorn", "Fabricant du collier d'Aragorn", "Fabbricante della collana di Aragorn"],
  "Manufacturer of the Glutinous Ring": ["Fabricante del anillo glutinoso", "Fabricant de l'anneau glutineux", "Fabbricante dell'anello glutinoso"],
  "Manufacturer of the Ring of Leviathan": ["Fabricante del anillo de Leviatán", "Fabricant de l'anneau de Léviathan", "Fabbricante dell'anello di Leviatano"],
  "Assistant to the Alchemist": ["Ayudante del alquimista", "Assistant de l'alchimiste", "Assistente dell'alchimista"],
  "Manufacturer of the Crushed Harpy Ring": [
    "Fabricante del anillo de la arpía aplastada",
    "Fabricant de l'anneau de la harpie écrasée", "Fabbricante dell'anello dell'arpia schiacciata"
  ],
  "Manufacturer of the Ring of the Flaming Harpy": [
    "Fabricante del anillo de la arpía llameante",
    "Fabricant de l'anneau de la harpie flamboyante", "Fabbricante dell'anello dell'arpia fiammeggiante"
  ],
  "Manufacturer of the Ring of the Drowned Harpy": [
    "Fabricante del anillo de la arpía ahogada",
    "Fabricant de l'anneau de la harpie noyée", "Fabbricante dell'anello dell'arpia annegata"
  ],
  "Manufacturer of the Runic Necklace": ["Fabricante del collar rúnico", "Fabricant du collier runique", "Fabbricante della collana runica"],
  "Manufacturer of the Fierce Talisman": ["Fabricante del talismán feroz", "Fabricant du talisman féroce", "Fabbricante del talismano feroce"],
  "Dungeon: The Forgotten Tomb": ["Mazmorra: La Tumba Olvidada", "Donjon : Le Tombeau Oublié", "Dungeon: La Tomba Dimenticata"],
  "The Relaxed Cat": ["El gato relajado", "Le chat détendu", "Il gatto rilassato"],
  "The Dark Messenger's Bell Tower": ["El campanario del mensajero oscuro", "Le clocher du messager sombre", "Il campanile del messaggero oscuro"],
  "Furacas, Guardian of the Labyrinth": ["Furacas, guardián del Laberinto", "Furacas, gardien du Labyrinthe", "Furacas, guardiano del Labirinto"],
  "Alpha of the Woods": ["Alfa de los bosques", "Alpha des bois", "Alfa dei boschi"],
  "Dungeon Forgotten Tomb of the Necromancer": [
    "Mazmorra de la tumba olvidada del nigromante",
    "Donjon du tombeau oublié du nécromancien", "Dungeon della Tomba Dimenticata del Negromante"
  ],
  /* --- merchant, smith and site markers whose titles are built from a base noun plus a modifier;
	   the curated full phrase keeps the Spanish/French word order natural --- */
  "Bee Armor Blacksmith": ["Herrero de armaduras de abeja", "Forgeron d'armures d'abeille", "Fabbro di armature delle api"],
  "Bees Weapon Blacksmith": ["Herrero de armas de abejas", "Forgeron d'armes d'abeilles", "Fabbro di armi delle api"],
  "Consumables Merchant": ["Mercader de consumibles", "Marchand de consommables", "Mercante di consumabili"],
  "Country Loot Buyer": ["Comprador de botín rural", "Acheteur de butin rural", "Acquirente di bottino rurale"],
  "Crystal Peak Mine": ["Mina del Pico de Cristal", "Mine du Pic de Cristal", "Miniera del Picco di Cristallo"],
  "Deer Belt Manufacturer": ["Fabricante de cinturones de ciervo", "Fabricant de ceintures de cerf", "Fabbricante di cinture di cervo"],
  "Fallen Labyrinth Dungeon": ["Mazmorra del Laberinto Caído", "Donjon du Labyrinthe Déchu", "Dungeon del Labirinto dei Caduti"],
  "Forest Loot Buyer": ["Comprador de botín del bosque", "Acheteur de butin de la forêt", "Acquirente di bottino della foresta"],
  "Honeyed Loot Buyer": ["Comprador de botín meloso", "Acheteur de butin miellé", "Acquirente di bottino mielato"],
  "Labyrinth Armor Blacksmith": ["Herrero de armaduras del laberinto", "Forgeron d'armures du labyrinthe", "Fabbro di armature del labirinto"],
  "Level 1 Tools Merchant": ["Mercader de herramientas de nivel 1", "Marchand d'outils de niveau 1", "Mercante di strumenti di livello 1"],
  "Magical & Icy Loot Buyer": ["Comprador de botín mágico y gélido", "Acheteur de butin magique et glacial", "Acquirente di bottino magico e ghiacciato"],
  "Manufacturer of Corrupt Mask": ["Fabricante de máscaras corruptas", "Fabricant de masques corrompus", "Fabbricante di maschere corrotte"],
  "Manufacturer of Wolf Gloves": ["Fabricante de guantes de lobo", "Fabricant de gants de loup", "Fabbricante di guanti di lupo"],
  "Muffet, Mother of Black Spiders": ["Muffet, madre de las arañas negras", "Muffet, mère des araignées noires", "Muffet, madre dei ragni neri"],
  "Nasgul Sub-Dungeon": ["Submazmorra de Nasgul", "Sous-donjon de Nasgul", "Sotto-dungeon di Nasgul"],
  "Necromancer's Tomb": ["Tumba del nigromante", "Tombe du nécromancien", "Tomba del negromante"],
  "Necromancer's Tomb Dungeon": ["Mazmorra de la tumba del nigromante", "Donjon de la tombe du nécromancien", "Dungeon della Tomba del Negromante"],
  "Necrotic Tool Blacksmith": ["Herrero de herramientas necróticas", "Forgeron d'outils nécrotiques", "Fabbro di strumenti necrotici"],
  "Occult Rings Merchant": ["Mercader de anillos ocultos", "Marchand d'anneaux occultes", "Mercante di anelli occulti"],
  "Reinforced Tools Merchant": ["Mercader de herramientas reforzadas", "Marchand d'outils renforcés", "Mercante di strumenti rinforzati"],
  "Savanna Tool Merchant": ["Mercader de herramientas de la sabana", "Marchand d'outils de la savane", "Mercante di strumenti della savana"],
  "Skeletal Loot Buyer": ["Comprador de botín esquelético", "Acheteur de butin squelettique", "Acquirente di bottino scheletrico"],
  "Spider Loot Repreneur": ["Comprador de botín de araña", "Repreneur de butin d'araignée", "Rivenditore di bottino dei ragni"],
  /* --- loot resellers, repreneurs and site markers whose canonical name is combined with an
	   English verb or connector ("Blacksmith of Copper & Iron Ingots"); the token pass otherwise
	   keeps "of"/"Ingots" and leaves the modifier in front of the head noun --- */
  "Bandit Loot Repreneur": ["Comprador de botín bandido", "Repreneur de butin bandit", "Rivenditore di bottino dei banditi"],
  "Bandit Loot Reseller": ["Revendedor de botín bandido", "Revendeur de butin bandit", "Rivenditore di bottino dei banditi"],
  "Blacksmith of Bauxite Ingots & Impure Onyx": [
    "Herrero de lingotes de bauxita y ónice impuro",
    "Forgeron de lingots de bauxite et d'onyx impur", "Fabbro di lingotti di bauxite e onice impuro"
  ],
  "Blacksmith of Copper & Iron Ingots": [
    "Herrero de lingotes de cobre y hierro",
    "Forgeron de lingots de cuivre et de fer", "Fabbro di lingotti di rame e ferro"
  ],
  "Blacksmith of Necromancer Armor": ["Herrero de armaduras de nigromante", "Forgeron d'armures de nécromancien", "Fabbro di armature del negromante"],
  "Black Market": ["Mercado negro", "Marché noir", "Mercato nero"],
  "Bracelet Blacksmith": ["Herrero de brazaletes", "Forgeron de bracelets", "Fabbro di bracciali"],
  "Bracelet Merchant": ["Mercader de brazaletes", "Marchand de bracelets", "Mercante di bracciali"],
  "Colossal Guardian": ["Guardián colosal", "Gardien colossal", "Guardiano colossale"],
  "Dungeon The Mysterious Islands": ["Mazmorra de las Islas Misteriosas", "Donjon des Îles Mystérieuses", "Dungeon delle Isole Misteriose"],
  "Former Blacksmith": ["Antiguo herrero", "Ancien forgeron", "Ex fabbro"],
  "Goblin Loot Repreneur": ["Comprador de botín goblin", "Repreneur de butin gobelin", "Rivenditore di bottino dei goblin"],
  "Ice Bear": ["Oso de hielo", "Ours des glaces", "Orso di ghiaccio"],
  "Key Smith I": ["Forjador de llaves I", "Forgeron de clés I", "Fabbro di chiavi I"],
  "Local Farmer": ["Granjero local", "Fermier local", "Contadino locale"],
  "Local Lumberjack": ["Leñador local", "Bûcheron local", "Taglialegna locale"],
  "Loot Buyer Sylnovar": ["Comprador de botín de Sylnovar", "Acheteur de butin de Sylnovar", "Acquirente di bottino di Sylnovar"],
  "Loot Buyer Sylvaer": ["Comprador de botín de Sylvaer", "Acheteur de butin de Sylvaer", "Acquirente di bottino di Sylvaer"],
  "Loot Buyer Treant": ["Comprador de botín de treant", "Acheteur de butin de tréant", "Acquirente di bottino di treant"],
  "Low Corruption Bracelet Blacksmith": [
    "Herrero de brazaletes de baja corrupción",
    "Forgeron de bracelets de faible corruption", "Fabbro di bracciali di bassa corruzione"
  ],
  "Manufacturer of Wild Gloves": ["Fabricante de guantes salvajes", "Fabricant de gants sauvages", "Fabbricante di guanti selvaggi"],
  "Merchant of Occult Amulet": ["Mercader de amuletos ocultos", "Marchand d'amulettes occultes", "Mercante di amuleti occulti"],
  "Mist Canyon": ["Cañón de niebla", "Canyon de brume", "Canyon della nebbia"],
  "Mist Refuge": ["Refugio de niebla", "Refuge de brume", "Rifugio della nebbia"],
  "Necrotic Loot Repreneur": ["Comprador de botín necrótico", "Repreneur de butin nécrotique", "Rivenditore di bottino necrotico"],
  "Occult Runes Merchant": ["Mercader de runas ocultas", "Marchand de runes occultes", "Mercante di rune occulte"],
  "Orc Loot Repreneur": ["Comprador de botín orco", "Repreneur de butin orque", "Rivenditore di bottino degli orchi"],
  "Sanctuary Guardian": ["Guardián del santuario", "Gardien du sanctuaire", "Guardiano del santuario"],
  "Sanctuary Loot Repreneur": ["Comprador de botín del santuario", "Repreneur de butin du sanctuaire", "Rivenditore di bottino del santuario"],
  "Scrap Accessories Blacksmith": ["Herrero de accesorios de chatarra", "Forgeron d'accessoires de ferraille", "Fabbro di accessori di scarti"],
  "Sylnovar Accessories Blacksmith": ["Herrero de accesorios de Sylnovar", "Forgeron d'accessoires de Sylnovar", "Fabbro di accessori di Sylnovar"],
  "Tolbana Crystal": ["Cristal de Tolbana", "Cristal de Tolbana", "Cristallo di Tolbana"],
  /* --- remaining smith, merchant and ring-seller markers whose title keeps the English
	   modifier in front of the role noun ("Glove Merchant" -> "Guante Mercader") --- */
  "Amethyst Armor Blacksmith": ["Herrero de armaduras de amatista", "Forgeron d'armures d'améthyste", "Fabbro di armature di ametista"],
  "Amulet Blacksmith": ["Herrero de amuletos", "Forgeron d'amulettes", "Fabbro di amuleti"],
  "Amulet Merchant": ["Mercader de amuletos", "Marchand d'amulettes", "Mercante di amuleti"],
  "Ancient Wood Armor Blacksmith": ["Herrero de armaduras de madera ancestral", "Forgeron d'armures de bois ancien", "Fabbro di armature di legno antico"],
  "Artifact Merchant": ["Mercader de artefactos", "Marchand d'artefacts", "Mercante di manufatti"],
  "Bauxite Accessories Blacksmith": ["Herrero de accesorios de bauxita", "Forgeron d'accessoires de bauxite", "Fabbro di accessori di bauxite"],
  "Bull & Bear Accessories Blacksmith": [
    "Herrero de accesorios de toro y oso",
    "Forgeron d'accessoires de taureau et d'ours", "Fabbro di accessori di toro e orso"
  ],
  "Bull & Bear Loot Buyer": ["Comprador de botín de toro y oso", "Acheteur de butin de taureau et d'ours", "Acquirente di bottino di toro e orso"],
  "Glove Blacksmith": ["Herrero de guantes", "Forgeron de gants", "Fabbro di guanti"],
  "Glove Merchant": ["Mercader de guantes", "Marchand de gants", "Mercante di guanti"],
  "Harpies Loot Buyer": ["Comprador de botín de arpías", "Acheteur de butin de harpies", "Acquirente di bottino delle arpie"],
  "Ice Bracelet Manufacturer": ["Fabricante de brazaletes de hielo", "Fabricant de bracelets de glace", "Fabbricante di bracciali di ghiaccio"],
  "Impure Onyx Accessories Blacksmith": [
    "Herrero de accesorios de ónice impuro",
    "Forgeron d'accessoires d'onyx impur", "Fabbro di accessori di onice impuro"
  ],
  "Marine Loot Buyer": ["Comprador de botín marino", "Acheteur de butin marin", "Acquirente di bottino marino"],
  "Merchant Guild": ["Gremio de mercaderes", "Guilde des marchands", "Gilda dei mercanti"],
  "Necrotic Weaponsmith": ["Herrero de armas necrótico", "Forgeron d'armes nécrotiques", "Fabbro di armi necrotiche"],
  "Occult Amulet Merchant": ["Mercader de amuletos ocultos", "Marchand d'amulettes occultes", "Mercante di amuleti occulti"],
  "Occult Bracelet Merchant": ["Mercader de brazaletes ocultos", "Marchand de bracelets occultes", "Mercante di bracciali occulti"],
  "Occult Gloves Merchant": ["Mercader de guantes ocultos", "Marchand de gants occultes", "Mercante di guanti occulti"],
  "Occult Merchant": ["Mercader oculto", "Marchand occulte", "Mercante occulto"],
  "Occult Ringman": ["Vendedor de anillos ocultos", "Vendeur de bagues occultes", "Venditore di anelli occulti"],
  "Pure Onyx Accessories Blacksmith": ["Herrero de accesorios de ónice puro", "Forgeron d'accessoires d'onyx pur", "Fabbro di accessori di onice puro"],
  "Pure Onyx Ingot Blacksmith": ["Herrero de lingotes de ónice puro", "Forgeron de lingots d'onyx pur", "Fabbro di lingotti di onice puro"],
  "Purification Alchemist": ["Alquimista de purificación", "Alchimiste de purification", "Alchimista di purificazione"],
  "Ring Blacksmith": ["Herrero de anillos", "Forgeron d'anneaux", "Fabbro di anelli"],
  "Skeleton Skull Manufacturer": ["Fabricante de cráneos de esqueleto", "Fabricant de crânes de squelette", "Fabbricante di teschi di scheletro"],
  "Tolbana Armor Blacksmith": ["Herrero de armaduras de Tolbana", "Forgeron d'armures de Tolbana", "Fabbro di armature di Tolbana"],
  "Tribe Belt Blacksmith": ["Herrero de cinturones de la tribu", "Forgeron de ceintures de la tribu", "Fabbro di cinture della tribù"],
  /* Dungeon titles whose English source keeps the owner's name in front of the head noun. The
     curated entry supplies the Italian head noun the rest of the map glossary uses
     ("Dungeon dell'Alveare di Melliona", "Dungeon di Xal'zirith"); the Spanish and French values are
     the counterparts the token pass already produced, kept exactly as they ship. */
  "Melliona's Hive Dungeon": ["Melliona's Hive Mazmorra", "Melliona's Hive Donjon", "Dungeon dell'Alveare di Melliona"],
  "Xal'zirith Dungeon": ["Xal'zirith Mazmorra", "Xal'zirith Donjon", "Dungeon di Xal'zirith"]
};

/* Map content is registered in one shared registry under an explicit namespace prefix, so a
   world's markers and mob areas can never collide with another world's keys. Aincrad keeps the
   historical `map` prefix; the Fractured Underworld registers under `underworld-map`. */
function mapContentNamespace(namespace) {
  return typeof namespace === "string" && namespace.trim() ? namespace.trim() : "map";
}

window.SAOContentTranslations.registerMapMarker = function registerMapMarker(id, marker, namespace) {
  const prefix = mapContentNamespace(namespace);
  ["title", "type", "description"].forEach((field) => {
    if (!marker[field]) return;
    const key = `${prefix}.${id}.${field}`;
    const curated =
      field === "description"
        ? curatedMapDescriptionTranslations[marker[field]] || curatedProseTranslations[marker[field]]
        : null;
    const typeTranslation = field === "type" ? mapTypeTranslations[marker[field]] : null;
    const titleTranslation =
      field === "title"
        ? curatedQuestTranslations[marker[field]] ||
          mapTitleTranslations[marker[field]] ||
          locationTranslations[marker[field]]
        : null;
    /* One per-language value: the manual title glossary wins, then the key's existing value, then the
       curated pair for the field, then the prose/label glossary. Every step resolves the language
       through the shared readers, so no branch indexes a slot. */
    window.SAOContentTranslations.register(
      key,
      marker[field],
      translationsByLanguage((language) => {
        const manualTitle =
          field === "title"
            ? window.SAOContentTranslations.translateEquivalentLabel(marker[field], language)
            : marker[field];
        if (manualTitle !== marker[field]) return manualTitle;
        return (
          window.SAOContentTranslations[language][key] ||
          pairValue(curated, language) ||
          pairValue(typeTranslation, language) ||
          pairValue(titleTranslation, language) ||
          (field === "description"
            ? window.SAOContentTranslations.translateEquivalentProse(marker[field], language)
            : field === "title"
              ? window.SAOContentTranslations.translateEquivalentLabel(
                  translateEquipmentTermValue(marker[field], language),
                  language
                )
              : window.SAOContentTranslations.translateEquivalentLabel(marker[field], language))
        );
      })
    );
  });
};

/* Mob-area titles live in the same map namespace, as `<namespace>.mob-area.<id>.title`.
   Like map markers, the registered value uses the curated dictionaries first and falls back to
   the area's own English title only when no curated entry exists. */
window.SAOContentTranslations.registerMapMobArea = function registerMapMobArea(area, namespace) {
  if (!area || !area.id) return;
  const prefix = mapContentNamespace(namespace);
  const key = `${prefix}.mob-area.${area.id}.title`;
  const title = area.title || "";
  const curated = mapTitleTranslations[title] || locationTranslations[title] || curatedProseTranslations[title];
  window.SAOContentTranslations.register(
    key,
    title,
    translationsByLanguage(
      (language) => window.SAOContentTranslations[language][key] || pairValue(curated, language) || title
    )
  );
};

const bestiaryGlossary = {
  "Sinister White Wolf": ["Lobo blanco siniestro", "Loup blanc sinistre", "Lupo bianco sinistro"],
  "Sinister Black Wolf": ["Lobo negro siniestro", "Loup noir sinistre", "Lupo nero sinistro"],
  "Mini Treant": ["Treant minúsculo", "Tréant miniature", "Treant minuscolo"],
  "Treant Warrior": ["Guerrero treant", "Guerrier tréant", "Guerriero treant"],
  "Sylvan Mage": ["Mago silvano", "Mage sylvestre", "Mago silvano"],
  "Elite Treant": ["Treant de élite", "Tréant d'élite", "Treant d'élite"],
  "Small Slime": ["Slime pequeño", "Petit slime", "Slime piccolo"],
  "Slime Warrior": ["Guerrero slime", "Guerrier slime", "Guerriero slime"],
  "Healer Slime": ["Slime sanador", "Slime guérisseur", "Slime guaritore"],
  "Mage Slime": ["Slime mago", "Slime mage", "Slime mago"],
  "Skeleton Swordsman": ["Espadachín esqueleto", "Épéiste squelette", "Spadaccino scheletro"],
  "Skeleton Warrior": ["Guerrero esqueleto", "Guerrier squelette", "Guerriero scheletro"],
  "Skeleton Halberdier": ["Alabardero esqueleto", "Hallebardier squelette", "Alabardiere scheletro"],
  "Skeleton Archer": ["Arquero esqueleto", "Archer squelette", "Arciere scheletro"],
  "Shark Fish": ["Pez tiburón", "Poisson-requin", "Pesce squalo"],
  "Forest Spider": ["Araña del bosque", "Araignée forestière", "Ragno della foresta"],
  "Ice Spiritist": ["Espiritista de hielo", "Spiritualiste de glace", "Spiritista del ghiaccio"],
  "Ice Spirit": ["Espíritu de hielo", "Esprit de glace", "Spirito del ghiaccio"],
  "Ice Golem": ["Gólem de hielo", "Golem de glace", "Golem di ghiaccio"],
  Deer: ["Ciervo", "Cerf", "Cervo"],
  "Mountain Deer": ["Ciervo montañés", "Cerf des montagnes", "Cervo montano"],
  Nephentes: ["Néphentes", "Néphentès", "Nephentes"],
  "Bandit Archer": ["Arquero bandido", "Archer bandit", "Arciere bandito"],
  "Bandit Assassin": ["Asesino bandido", "Assassin bandit", "Assassino bandito"],
  "Sturdy Bandit": ["Bandido robusto", "Bandit robuste", "Bandito robusto"],
  "Corrupted Boar": ["Jabalí corrupto", "Sanglier corrompu", "Cinghiale corrotto"],
  "Corrupted Pumba": ["Pumba corrupto", "Pumba corrompu", "Pumba corrotto"],
  "Small Kobold": ["Kobold pequeño", "Petit kobold", "Kobold piccolo"],
  "The Mischievous Archer": ["El arquero travieso", "L'archer malicieux", "L'arciere dispettoso"],
  "Kobold Warrior": ["Guerrero kobold", "Guerrier kobold", "Guerriero kobold"],
  "Kobold Lancer": ["Lancero kobold", "Lancier kobold", "Lanciere kobold"],
  "Kobold Sorcerer": ["Hechicero kobold", "Sorcier kobold", "Stregone kobold"],
  "Kobold Sentinel (Minion)": ["Centinela kobold (esbirro)", "Sentinelle kobold (sbire)", "Sentinella kobold (servitore)"],
  "Treant of the Forest": ["Treant del bosque", "Tréant de la forêt", "Treant della foresta"],
  "Forest-Bane Treant": ["Treant azote del bosque", "Tréant fléau de la forêt", "Treant flagello della foresta"],
  "Devouring Plant": ["Planta devoradora", "Plante dévorante", "Pianta divoratrice"],
  "Forest Brute": ["Bruto del bosque", "Brute forestier", "Bruto della foresta"],
  "Fallen Soldier": ["Soldado caído", "Soldat déchu", "Soldato caduto"],
  "Fallen Warrior": ["Guerrero caído", "Guerrier déchu", "Guerriero caduto"],
  "Hunting Spider": ["Araña cazadora", "Araignée chasseuse", "Ragno cacciatore"],
  "Venomous Spider": ["Araña venenosa", "Araignée venimeuse", "Ragno velenoso"],
  "Strangler Spider": ["Araña estranguladora", "Araignée étrangleuse", "Ragno strangolatore"],
  "Fallen Guardian": ["Guardián caído", "Gardien déchu", "Guardiano caduto"],
  "Fallen Herald": ["Heraldo caído", "Héraut déchu", "Araldo caduto"],
  "Fallen Reaper": ["Segador caído", "Faucheur déchu", "Mietitore caduto"],
  "Fire Archer Skeleton": ["Arquero esqueleto de fuego", "Archer squelette de feu", "Arciere scheletro di fuoco"],
  "Fire Wizard Skeleton": ["Mago esqueleto de fuego", "Squelette mage de feu", "Mago scheletro di fuoco"],
  "Fire Tank Skeleton": ["Tanque esqueleto de fuego", "Squelette tank de feu", "Scheletro tank di fuoco"],
  "Fire Lancer Skeleton": ["Lancero esqueleto de fuego", "Lancier squelette de feu", "Lanciere scheletro di fuoco"],
  "Fire Skeleton": ["Esqueleto de fuego", "Squelette de feu", "Scheletro di fuoco"],
  "Fire Swordsman Skeleton": ["Espadachín esqueleto de fuego", "Épéiste squelette de feu", "Spadaccino scheletro di fuoco"],
  "Skeleton Soul": ["Alma de esqueleto", "Âme squelette", "Anima di scheletro"],
  "Undead Brute": ["Bruto no muerto", "Brute mort-vivant", "Bruto non morto"],
  "Undead Gargoyle": ["Gárgola no muerta", "Gargouille morte-vivante", "Gargoyle non morto"],
  "Warrior Sand Skeleton": ["Esqueleto guerrero de arena", "Squelette guerrier des sables", "Scheletro guerriero delle sabbie"],
  "Skeleton of the Archer Sands": ["Esqueleto de las arenas del arquero", "Squelette des sables de l'archer", "Scheletro delle sabbie dell'arciere"],
  "Forest Bear": ["Oso del bosque", "Ours forestier", "Orso della foresta"],
  "Mountain Wolf": ["Lobo montañés", "Loup des montagnes", "Lupo montano"],
  "Savanes Wolf": ["Lobo de las sabanas", "Loup des savanes", "Lupo delle savane"],
  Worker: ["Trabajador", "Ouvrier", "Operaio"],
  "Fire Harpy": ["Arpía de fuego", "Harpie de feu", "Arpia di fuoco"],
  "Earthy Harpy": ["Arpía terrenal", "Harpie terrestre", "Arpia terrestre"],
  "Lightning Harpy": ["Arpía de relámpago", "Harpie de foudre", "Arpia del fulmine"],
  "Dazzling Fish": ["Pez deslumbrante", "Poisson éblouissant", "Pesce sfavillante"],
  "Sanctuary Skeleton Archer": ["Arquero esqueleto del santuario", "Archer squelette du sanctuaire", "Arciere scheletro del santuario"],
  "Sanctuary Skeleton Shaman": ["Chamán esqueleto del santuario", "Chaman squelette du sanctuaire", "Sciamano scheletro del santuario"],
  "Sanctuary Skeleton Warrior": ["Guerrero esqueleto del santuario", "Guerrier squelette du sanctuaire", "Guerriero scheletro del santuario"],
  "Guardian of the Sanctuary": ["Guardián del santuario", "Gardien du sanctuaire", "Guardiano del santuario"],
  "Guardian Minion": ["Esbirro del guardián", "Sbire du gardien", "Servitore del guardiano"],
  "Golem of Peter": ["Gólem de Peter", "Golem de Peter", "Golem di Peter"],
  Guardian: ["Guardián", "Gardien", "Guardiano"],
  Nymbréa: ["Nymbréa", "Nymbréa", "Nymbréa"],
  Albal: ["Albal", "Albal", "Albal"],
  Dardroyal: ["Dardroyal", "Dardroyal", "Dardroyal"],
  Gorbel: ["Gorbel", "Gorbel", "Gorbel"],
  Kazor: ["Kazor", "Kazor", "Kazor"],
  Vyrmos: ["Vyrmos", "Vyrmos", "Vyrmos"],
  Tornak: ["Tornak", "Tornak", "Tornak"],
  Nasgul: ["Nasgul", "Nasgul", "Nasgul"],
  Pricilia: ["Pricilia", "Pricilia", "Pricilia"],
  Yula: ["Yula", "Yula", "Yula"],
  Jira: ["Jira", "Jira", "Jira"],
  Kamilia: ["Kamilia", "Kamilia", "Kamilia"],
  Ika: ["Ika", "Ika", "Ika"],
  Taurus: ["Taurus", "Taurus", "Taurus"],
  "Monstrous Bull": ["Toro monstruoso", "Taureau monstrueux", "Toro mostruoso"]
};

const bestiaryItemGlossary = {
  "Wolf Fur": ["Piel de lobo", "Fourrure de loup", "Pelliccia di lupo"],
  "Wolf Fangs": ["Colmillos de lobo", "Crocs de loup", "Zanne di lupo"],
  "Boar Hide": ["Piel de jabalí", "Peau de sanglier", "Pelle di cinghiale"],
  "Boar Meat": ["Carne de jabalí", "Viande de sanglier", "Carne di cinghiale"],
  "Corrupted Crystal": ["Cristal corrupto", "Cristal corrompu", "Cristallo corrotto"],
  "Bone Dust": ["Polvo de hueso", "Poussière d'os", "Polvere d'ossa"],
  "Skeleton Bone": ["Hueso de esqueleto", "Os de squelette", "Osso di scheletro"],
  "Souls of the Ruins": ["Almas de las ruinas", "Âmes des ruines", "Anime delle rovine"],
  "Souls of the Ruin": ["Almas de la ruina", "Âmes de la ruine", "Anime della rovina"],
  "Soul of the Ruins": ["Almas de las ruinas", "Âmes des ruines", "Anime delle rovine"],
  "Skeletal Sword": ["Espada esquelética", "Épée squelettique", "Spada scheletrica"],
  "Archer's Scroll": ["Pergamino de arquero", "Parchemin d'archer", "Pergamena dell'arciere"],
  "Swordsman's Scroll": ["Pergamino de espadachín", "Parchemin d'épéiste", "Pergamena dello spadaccino"],
  "Mage's Scroll": ["Pergamino de mago", "Parchemin de mage", "Pergamena del mago"],
  "Slime Jelly": ["Gelatina de slime", "Gelée de slime", "Gelatina di slime"],
  "Slime Core": ["Núcleo de slime", "Noyau de slime", "Nucleo di slime"],
  "Spider Silk": ["Seda de araña", "Soie d'araignée", "Seta di ragno"],
  "Spider Cloth": ["Tela de araña", "Tissu d'araignée", "Tessuto di ragno"],
  "Frost Dust": ["Polvo de escarcha", "Poussière de givre", "Polvere di gelo"],
  "Glacial Hardhide": ["Cuero duro glacial", "Cuir glacé", "Cuoio duro glaciale"],
  "Glacial Magic Shard": ["Fragmento de magia glacial", "Éclat de magie glaciale", "Scheggia di magia glaciale"],
  "Mountain Deer Hide": ["Piel de ciervo montañés", "Peau de cerf des montagnes", "Pelle di cervo montano"],
  "Corrupted Spore": ["Espora corrupta", "Spore corrompue", "Spora corrotta"],
  "Leaf Fragment": ["Fragmento de hoja", "Fragment de feuille", "Frammento di foglia"],
  "Worn Leather": ["Cuero gastado", "Cuir usé", "Cuoio usurato"],
  "Small Pouch": ["Bolsa pequeña", "Petite bourse", "Borsa piccola"],
  "Bandit Crossbow": ["Ballesta de bandido", "Arbalète de bandit", "Balestra del bandito"],
  "Bandit Dagger": ["Daga de bandido", "Dague de bandit", "Pugnale del bandito"],
  "Reinforced Skeleton Bone": ["Hueso de esqueleto reforzado", "Os de squelette renforcé", "Osso di scheletro rinforzato"],
  "Cursed Cloth": ["Tela maldita", "Tissu maudit", "Tessuto maledetto"],
  "Magic Staff of the Ruins": ["Bastón mágico de las ruinas", "Bâton magique des ruines", "Bastone magico delle rovine"],
  "Magic Staff of the Revenants": ["Bastón mágico de los aparecidos", "Bâton magique des revenants", "Bastone magico degli spettri"],
  "Enchanted Metal Piece": ["Pieza de metal encantado", "Morceau de métal enchanté", "Pezzo di metallo incantato"],
  "Metal Soul Piece": ["Pieza de alma metálica", "Morceau d'âme métallique", "Pezzo d'anima metallica"],
  "Putrefied Heart": ["Corazón putrefacto", "Cœur putréfié", "Cuore putrefatto"],
  "Cursed Skeleton Mage Staff": ["Bastón de mago esqueleto maldito", "Bâton de mage squelette maudit", "Bastone del mago scheletro maledetto"],
  "Cursed Skeleton Shaman Staff": ["Bastón de chamán esqueleto maldito", "Bâton de chaman squelette maudit", "Bastone dello sciamano scheletro maledetto"],
  "Fallen Artifact": ["Artefacto caído", "Artefact déchu", "Manufatto caduto"],
  "Warden's Soul": ["Alma del guardián", "Âme du gardien", "Anima del guardiano"],
  "Herald's Soul": ["Alma del heraldo", "Âme du héraut", "Anima dell'araldo"],
  "Reaper's Soul": ["Alma del segador", "Âme du faucheur", "Anima del mietitore"],
  "Reaper's Ring": ["Anillo del segador", "Anneau du faucheur", "Anello del mietitore"],
  "Forgotten Shield": ["Escudo olvidado", "Bouclier oublié", "Scudo dimenticato"],
  "Royal Halberd": ["Alabarda real", "Hallebarde royale", "Alabarda reale"],
  "Sentinel's Mace": ["Maza del centinela", "Masse de la sentinelle", "Mazza della sentinella"],
  "Shark Shell": ["Caparazón de tiburón", "Carapace de requin", "Conchiglia di squalo"],
  "N/A": ["N/D", "N/D", "N/D"],
  "No Drops": ["Sin botín", "Aucun butin", "Nessun bottino"]
};

function contentSlug(value) {
  return (
    String(value || "n-a")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "n-a"
  );
}

bestiaryGlossary["Nymbréa"] = ["Nymbréa", "Nymbréa"];
bestiaryGlossary["Winnie, Man's Best Friend"] = [
  "Winnie, el mejor amigo del hombre",
  "Winnie, le meilleur ami de l'homme",
  "Winnie, il miglior amico dell'uomo"
];
/* The glossaries stay written as positional pairs (see the note at the top of this file);
   pairTranslations() turns one into the language-keyed form register() takes, so no registrar has to
   destructure exactly two names or know which slot is which. */
Object.entries(bestiaryGlossary).forEach(([english, pair]) => {
  const key = `bestiary.mob.${contentSlug(english)}`;
  window.SAOContentTranslations.register(key, english, pairTranslations(pair, english));
});

bestiaryItemGlossary["Gorbel Essence"] = ["Esencia de Gorbel", "Essence de Gorbel", "Essenza di Gorbel"];

Object.entries(bestiaryItemGlossary).forEach(([english, pair]) => {
  const key = `bestiary.item.${contentSlug(english)}`;
  window.SAOContentTranslations.register(key, english, pairTranslations(pair, english));
});

const mapGlossary = {
  "swamp-putride": {
    title: ["Swamp Putride", "Pantano Putride", "Marais Putride", "Palude Putride"],
    description: [
      "A dense and hostile marsh, where mist poisons the air and masks dangers. Few emerge unscathed...",
      "Un pantano denso y hostil, donde la niebla envenena el aire y oculta los peligros. Pocos salen ilesos...",
      "Un marais dense et hostile, où la brume empoisonne l'air et masque les dangers. Peu en sortent indemnes...", "Una palude densa e ostile, dove la nebbia avvelena l'aria e nasconde i pericoli. Pochi ne escono illesi..."
    ]
  },
  "town-of-beginnings": {
    title: ["Town of Beginnings", "Ciudad de los Comienzos", "Ville des Commencements", "Città degli Inizi"]
  },
  "east-mines": {
    title: ["East Mines", "Minas del Este", "Mines de l'Est", "Miniere dell'Est"],
    description: [
      "East Mines — Coordinates X: 2397 Z: 3498. Gather Coal, Copper, and Iron.",
      "Minas del Este — Coordenadas X: 2397 Z: 3498. Reúne carbón, cobre y hierro.",
      "Mines de l'Est — Coordonnées X : 2397 Z : 3498. Récupérez du charbon, du cuivre et du fer.", "Miniere dell'Est — Coordinate X: 2397 Z: 3498. Raccogli carbone, rame e ferro."
    ]
  },
  "west-mines": {
    title: ["West Mines", "Minas del Oeste", "Mines de l'Ouest", "Miniere dell'Ovest"],
    description: [
      "West Mines — Coordinates X: 984 Z: 3479. Gather Coal, Copper, and Iron.",
      "Minas del Oeste — Coordenadas X: 984 Z: 3479. Reúne carbón, cobre y hierro.",
      "Mines de l'Ouest — Coordonnées X : 984 Z : 3479. Récupérez du charbon, du cuivre et du fer.", "Miniere dell'Ovest — Coordinate X: 984 Z: 3479. Raccogli carbone, rame e ferro."
    ]
  },
  "oak-forest": {
    title: ["Oak Forest", "Bosque de Robles", "Forêt de chênes", "Foresta di querce"],
    description: [
      "Oak Forest — Coordinates X: 2457 Z: 4308. Gather Oak Wood.",
      "Bosque de Robles — Coordenadas X: 2457 Z: 4308. Reúne madera de roble.",
      "Forêt de chênes — Coordonnées X : 2457 Z : 4308. Récupérez du bois de chêne.", "Foresta di querce — Coordinate X: 2457 Z: 4308. Raccogli legno di quercia."
    ]
  },
  "birch-forest": {
    title: ["Birch Forest", "Bosque de Abedules", "Forêt de bouleaux", "Foresta di betulle"]
  }
};

/* This is the one glossary written English-first ([english, spanish, french]): English stays the key's
   source text and the rest is the same positional pair every other glossary uses. */
Object.entries(mapGlossary).forEach(([id, fields]) => {
  Object.entries(fields).forEach(([field, entry]) => {
    const [english, ...pair] = entry;
    const key = `map.${id}.${field}`;
    window.SAOContentTranslations.register(key, english, pairTranslations(pair, english));
  });
});

const additionalBestiaryGlossary = {
  "Colossal Guardian": ["Guardián colosal", "Gardien colossal", "Guardiano colossale"],
  "Ice Bear": ["Oso de hielo", "Ours des glaces", "Orso di ghiaccio"],
  "Illfang the Kobold Lord": ["Illfang, señor de los kobolds", "Illfang, seigneur des kobolds", "Illfang, signore dei kobold"],
  "Skeleton Sorcerer": ["Hechicero esqueleto", "Sorcier squelette", "Scheletro stregone"],
  "Skeleton Tank": ["Tanque esqueleto", "Tank squelette", "Scheletro tank"],
  Bearclaw: ["Garra de oso", "Griffe d'ours", "Artiglio d'orso"],
  Dart: ["Dardo", "Fléchette", "Dardo"],
  "Torn Clothing": ["Ropa rasgada", "Vêtements déchirés", "Vestiti strappati"],
  "Magic Mycelium": ["Micelio mágico", "Mycélium magique", "Micelio magico"],
  "Sylve shoot": ["Brote de Sylve", "Pousse de Sylve", "Germoglio di Sylve"],
  "Wolf Fangs": ["Colmillos de lobo", "Crocs de loup", "Zanne di lupo"],
  "Magic Wook Shard": ["Fragmento de madera mágica", "Éclat de bois magique", "Scheggia di legno magico"],
  "Oak Log": ["Tronco de roble", "Bûche de chêne", "Tronco di quercia"],
  "Boar Skin": ["Piel de jabalí", "Peau de sanglier", "Pelle di cinghiale"],
  "Titan Bark": ["Corteza de titán", "Écorce de titan", "Corteccia di titano"],
  "Slime Core": ["Núcleo de slime", "Noyau de slime", "Nucleo di slime"],
  "Bone Dust": ["Polvo de hueso", "Poussière d'os", "Polvere d'ossa"],
  Iron: ["Hierro", "Fer", "Ferro"],
  Copper: ["Cobre", "Cuivre", "Rame"],
  Coal: ["Carbón", "Charbon", "Carbone"],
  "Sylvan Sprout": ["Brote silvano", "Pousse sylvestre", "Germoglio silvano"],
  "Magic Wood Shard": ["Fragmento de madera mágica", "Éclat de bois magique", "Scheggia di legno magico"],
  "Small Pouch": ["Bolsa pequeña", "Petite bourse", "Borsa piccola"],
  "Worn Leather": ["Cuero gastado", "Cuir usé", "Cuoio usurato"],
  "Dazzling Fish": ["Pez deslumbrante", "Poisson éblouissant", "Pesce sfavillante"],
  "Guardian of the Sanctuary": ["Guardián del santuario", "Gardien du sanctuaire", "Guardiano del santuario"],
  "Magnus, Colossus of the Veins": ["Magnus, coloso de las venas", "Magnus, colosse des veines", "Magnus, colosso delle vene"],
  "Melisara, Ruler of the Hive": ["Melisara, soberana de la colmena", "Melisara, souveraine de la ruche", "Melisara, sovrana dell'alveare"],
  "Morverth the Soul Flayer": ["Morverth, el desgarrador de almas", "Morverth, le dévoreur d'âmes", "Morverth, il Divoratore di Anime"],
  "Narax the Cursed Skeleton": ["Narax, el esqueleto maldito", "Narax, le squelette maudit", "Narax, lo scheletro maledetto"],
  "Ornstein, Fallen Devastator": ["Ornstein, devastador caído", "Ornstein, dévastateur déchu", "Ornstein, devastatore caduto"],
  "Smough, Fallen Devastator": ["Smough, devastador caído", "Smough, dévastateur déchu", "Smough, devastatore caduto"],
  "Rugiboeuf, The Guardian": ["Rugiboeuf, el guardián", "Rugiboeuf, le gardien", "Rugiboeuf, il guardiano"],
  "Velindra Weaver": ["Tejedora Velindra", "Tisseuse Velindra", "Tessitrice Velindra"],
  Tornak: ["Tornak", "Tornak", "Tornak"],
  Vyrmos: ["Vyrmos", "Vyrmos", "Vyrmos"],
  Dardroyal: ["Dardroyal", "Dardroyal", "Dardroyal"],
  Worker: ["Trabajador", "Ouvrier", "Operaio"],
  "Earthy Harpy": ["Arpía terrenal", "Harpie terrestre", "Arpia terrestre"],
  "Lightning Harpy": ["Arpía de relámpago", "Harpie de foudre", "Arpia del fulmine"],
  "Golem of Peter": ["Gólem de Peter", "Golem de Peter", "Golem di Peter"],
  "Guardian Minion": ["Esbirro del guardián", "Sbire du gardien", "Servitore del guardiano"],
  "Skeleton Soul": ["Alma de esqueleto", "Âme squelette", "Anima di scheletro"],
  "Undead Gargoyle": ["Gárgola no muerta", "Gargouille morte-vivante", "Gargoyle non morto"],
  "Thick Skin": ["Piel gruesa", "Peau épaisse", "Pelle spessa"],
  "Bear Skin": ["Piel de oso", "Peau d'ours", "Pelle d'orso"],
  "Bear Fat": ["Grasa de oso", "Graisse d'ours", "Grasso d'orso"],
  "Bear Soul Fragment": ["Fragmento de alma de oso", "Fragment d'âme d'ours", "Frammento d'anima d'orso"],
  "Honey Residue": ["Residuo de miel", "Résidu de miel", "Residuo di miele"],
  Honey: ["Miel", "Miel", "Miele"],
  "Bee Shell": ["Caparazón de abeja", "Carapace d'abeille", "Guscio d'ape"],
  "Water Harpy Egg": ["Huevo de arpía de agua", "Œuf de harpie aquatique", "Uovo di arpia d'acqua"],
  "Azure Feather": ["Pluma azur", "Plume azur", "Piuma azzurra"],
  "Scarlet Feather": ["Pluma escarlata", "Plume écarlate", "Piuma scarlatta"],
  "Flaming Feather": ["Pluma llameante", "Plume flamboyante", "Piuma fiammeggiante"],
  "Rare Flaming Feather": ["Pluma llameante rara", "Plume flamboyante rare", "Piuma fiammeggiante rara"],
  "Earthy Feather": ["Pluma terrenal", "Plume terrestre", "Piuma terrestre"],
  "Wavy Feather": ["Pluma ondulada", "Plume ondulée", "Piuma ondulata"],
  "Dazzling Scale": ["Escama deslumbrante", "Écaille éblouissante", "Scaglia sfavillante"],
  "Ika Shell": ["Caparazón de Ika", "Carapace d'Ika", "Guscio di Ika"],
  "Ancestral Root": ["Raíz ancestral", "Racine ancestrale", "Radice ancestrale"],
  "Wood Heart": ["Corazón de madera", "Cœur de bois", "Cuore di legno"],
  "Sylvan Mage Staff": ["Bastón de mago silvano", "Bâton de mage sylvestre", "Bastone del mago silvano"],
  "Sylvan Shaman Staff": ["Bastón de chamán silvano", "Bâton de chaman sylvestre", "Bastone dello sciamano silvano"],
  "Sylvan Shield": ["Escudo silvano", "Bouclier sylvestre", "Scudo silvano"],
  "Sylvan Bark": ["Corteza silvana", "Écorce sylvestre", "Corteccia silvana"],
  "Sylvan Bow": ["Arco silvano", "Arc sylvestre", "Arco silvano"],
  "Sylvan Bowstring": ["Cuerda de arco silvana", "Corde d'arc sylvestre", "Corda d'arco silvana"],
  "Enchanted Twig": ["Ramita encantada", "Brindille enchantée", "Ramoscello incantato"],
  "Spectral Cloth": ["Tela espectral", "Tissu spectral", "Tessuto spettrale"],
  "Spectral Fabric": ["Tela espectral", "Tissu spectral", "Tessuto spettrale"],
  "Spectral Chain": ["Cadena espectral", "Chaîne spectrale", "Catena spettrale"],
  "Glacial Hardhide": ["Cuero duro glacial", "Cuir glacé", "Cuoio duro glaciale"],
  "Glacial Magic Shard": ["Fragmento de magia glacial", "Éclat de magie glaciale", "Scheggia di magia glaciale"],
  "Corrupted Spore": ["Espora corrupta", "Spore corrompue", "Spora corrotta"],
  "Leaf Fragment": ["Fragmento de hoja", "Fragment de feuille", "Frammento di foglia"],
  "Piece of Scrap Metal": ["Pieza de chatarra", "Morceau de ferraille", "Pezzo di metallo di scarto"],
  "Marrow Powder": ["Polvo de médula", "Poudre de moelle", "Polvere di midollo"],
  "Dark Bone": ["Hueso oscuro", "Os sombre", "Osso oscuro"],
  "Black Bone Stone": ["Piedra de hueso negro", "Pierre d'os noir", "Pietra d'osso nero"],
  "Black Powder": ["Pólvora negra", "Poudre noire", "Polvere nera"],
  "Black Shield": ["Escudo negro", "Bouclier noir", "Scudo nero"],
  "Guardian Necklace": ["Collar del guardián", "Collier du gardien", "Collana del guardiano"],
  "Guardian Rune": ["Runa del guardián", "Rune du gardien", "Runa del guardiano"],
  "Rune of the Colossus": ["Runa del coloso", "Rune du colosse", "Runa del colosso"],
  "Runic Stone": ["Piedra rúnica", "Pierre runique", "Pietra runica"],
  "Asterios Bracelet": ["Brazalete de Asterios", "Bracelet d'Asterios", "Bracciale di Asterios"],
  "Albal's Fangs": ["Colmillos de Albal", "Crocs d'Albal", "Zanne di Albal"],
  "Albal Fangs": ["Colmillos de Albal", "Crocs d'Albal", "Zanne di Albal"],
  "Pumba's Ring": ["Anillo de Pumba", "Anneau de Pumba", "Anello di Pumba"],
  "Narax's Ring": ["Anillo de Narax", "Anneau de Narax", "Anello di Narax"],
  "Rugiboeuf Horn": ["Cuerno de Rugiboeuf", "Corne de Rugiboeuf", "Corno di Rugiboeuf"],
  "Warden's Soul": ["Alma del guardián", "Âme du gardien", "Anima del guardiano"],
  "Herald's Soul": ["Alma del heraldo", "Âme du héraut", "Anima dell'araldo"],
  "Reaper's Soul": ["Alma del segador", "Âme du faucheur", "Anima del mietitore"],
  "Reaper's Ring": ["Anillo del segador", "Anneau du faucheur", "Anello del mietitore"],
  "Royal Halberd": ["Alabarda real", "Hallebarde royale", "Alabarda reale"],
  "Forgotten Shield": ["Escudo olvidado", "Bouclier oublié", "Scudo dimenticato"],
  "Frost Dust": ["Polvo de escarcha", "Poussière de givre", "Polvere di gelo"],
  "Potion of the Witch": ["Poción de la bruja", "Potion de la sorcière", "Pozione della strega"],
  "Necromancer Powder": ["Polvo de nigromante", "Poudre de nécromancien", "Polvere di negromante"],
  "2x Necromancer Powder": ["2x polvo de nigromante", "2x poudre de nécromancien", "2x Polvere di negromante"]
};

const additionalBestiaryMobNames = new Set([
  "Colossal Guardian",
  "Ice Bear",
  "Illfang the Kobold Lord",
  "Skeleton Sorcerer",
  "Skeleton Tank",
  "Dazzling Fish",
  "Guardian of the Sanctuary",
  "Magnus, Colossus of the Veins",
  "Melisara, Ruler of the Hive",
  "Morverth the Soul Flayer",
  "Narax the Cursed Skeleton",
  "Ornstein, Fallen Devastator",
  "Smough, Fallen Devastator",
  "Rugiboeuf, The Guardian",
  "Velindra Weaver",
  "Tornak",
  "Vyrmos",
  "Dardroyal",
  "Worker",
  "Earthy Harpy",
  "Lightning Harpy",
  "Golem of Peter",
  "Guardian Minion",
  "Skeleton Soul",
  "Undead Gargoyle"
]);

Object.entries(additionalBestiaryGlossary).forEach(([english, pair]) => {
  const namespace = additionalBestiaryMobNames.has(english) ? "mob" : "item";
  const key = `bestiary.${namespace}.${contentSlug(english)}`;
  window.SAOContentTranslations.register(key, english, pairTranslations(pair, english));
});
