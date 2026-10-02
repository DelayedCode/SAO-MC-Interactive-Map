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
  }
};

window.SAOContentTranslations.explicitCounterparts = {
  es: new Set(Object.keys(window.SAOContentTranslations.es)),
  fr: new Set(Object.keys(window.SAOContentTranslations.fr))
};

window.SAOContentTranslations.register = function registerContentTranslation(key, english, spanish, french) {
  window.SAOContentTranslations.en[key] = english;
  if (spanish !== undefined) {
    window.SAOContentTranslations.es[key] = spanish;
    window.SAOContentTranslations.explicitCounterparts.es.add(key);
  }
  if (french !== undefined) {
    window.SAOContentTranslations.fr[key] = french;
    window.SAOContentTranslations.explicitCounterparts.fr.add(key);
  }
};

const equipmentTerminology = {
  "Curved Bow": ["Arco curvo", "Arc recourbé"],
  "Dilapidated Dagger": ["Daga ruinosa", "Dague délabrée"],
  "Wild Grimoire": ["Grimorio salvaje", "Grimoire sauvage"],
  "Junk Shield": ["Escudo de chatarra", "Bouclier de ferraille"],
  "Mediocre Mage Staff": ["Bastón de mago mediocre", "Bâton de mage médiocre"],
  "Mediocre Shaman Staff": ["Bastón de chamán mediocre", "Bâton de chaman médiocre"],
  "Training Dagger": ["Daga de entrenamiento", "Dague d'entraînement"],
  "Training Sword": ["Espada de entrenamiento", "Épée d'entraînement"],
  "Unbound Grimoire": ["Grimorio desatado", "Grimoire délié"],
  "Double Iron Axe": ["Hacha doble de hierro", "Hache double en fer"],
  "Pointed Wooden Shield": ["Escudo de madera puntiagudo", "Bouclier en bois pointu"],
  "Mage Skeleton Staff": ["Bastón de esqueleto mago", "Bâton de squelette mage"],
  "Shaman Skeleton Staff": ["Bastón de esqueleto chamán", "Bâton de squelette chaman"],
  "Magic Sword": ["Espada mágica", "Épée magique"],
  "Magic Hammer": ["Martillo mágico", "Marteau magique"],
  "Hunting Bow": ["Arco de caza", "Arc de chasse"],
  "Hunting Crossbow": ["Ballesta de caza", "Arbalète de chasse"],
  "Powerful Sorcerer Staff": ["Bastón de hechicero poderoso", "Bâton de sorcier puissant"],
  "Guardian Sword": ["Espada del guardián", "Épée du gardien"],
  "Heroic Dagger": ["Daga heroica", "Dague héroïque"],
  "Winter Bow": ["Arco de invierno", "Arc d'hiver"],
  "Winter Shield": ["Escudo de invierno", "Bouclier d'hiver"],
  "Putrid Shield": ["Escudo pútrido", "Bouclier putride"],
  "Royal Halberd": ["Alabarda real", "Hallebarde royale"],
  Curved: ["Curvo", "Recourbé"],
  Dilapidated: ["Ruinoso", "Délabré"],
  Wild: ["Salvaje", "Sauvage"],
  Junk: ["Chatarra", "Ferraille"],
  Mediocre: ["Mediocre", "Médiocre"],
  Training: ["Entrenamiento", "Entraînement"],
  Unbound: ["Desatado", "Délié"],
  Double: ["Doble", "Double"],
  Bestial: ["Bestial", "Bestial"],
  Intermediate: ["Intermedio", "Intermédiaire"],
  Iron: ["Hierro", "Fer"],
  Pointed: ["Puntiagudo", "Pointu"],
  Wooden: ["de madera", "en bois"],
  Shield: ["Escudo", "Bouclier"],
  Bow: ["Arco", "Arc"],
  Dagger: ["Daga", "Dague"],
  Sword: ["Espada", "Épée"],
  Staff: ["Bastón", "Bâton"],
  Grimoire: ["Grimorio", "Grimoire"],
  Mage: ["Mago", "Mage"],
  Shaman: ["Chamán", "Chaman"],
  Magic: ["Mágico", "Magique"],
  Dark: ["Oscuro", "Sombre"],
  Hunting: ["Caza", "Chasse"],
  Long: ["Largo", "Long"],
  Powerful: ["Poderoso", "Puissant"],
  Sorcerer: ["Hechicero", "Sorcier"],
  Fallen: ["Caído", "Déchu"],
  Forgotten: ["Olvidado", "Oublié"],
  Spectral: ["Espectral", "Spectral"],
  Guardian: ["Guardián", "Gardien"],
  Heroic: ["Heroico", "Héroïque"],
  Winter: ["Invierno", "Hiver"],
  Putrid: ["Pútrido", "Putride"],
  Royal: ["Real", "Royal"],
  Howling: ["Aullante", "Hurlant"],
  Love: ["Amor", "Amour"],
  Crossbow: ["Ballesta", "Arbalète"],
  Axe: ["Hacha", "Hache"],
  Hammer: ["Martillo", "Marteau"],
  Halberd: ["Alabarda", "Hallebarde"],
  Scythe: ["Guadaña", "Faux"],
  Club: ["Garrote", "Massue"],
  Ring: ["Anillo", "Anneau"],
  Bracelet: ["Brazalete", "Bracelet"],
  Glove: ["Guante", "Gant"],
  Amulet: ["Amuleto", "Amulette"],
  Catalyst: ["Catalizador", "Catalyseur"],
  "Equipment Merchant": ["Mercader de equipo", "Marchand d'équipement"],
  "Equipment Blacksmith": ["Herrero de equipo", "Forgeron d'équipement"],
  Weapon: ["Arma", "Arme"],
  Weapons: ["Armas", "Armes"],
  Damage: ["Daño", "Dégâts"],
  "Attack Speed": ["Velocidad de ataque", "Vitesse d'attaque"],
  Health: ["Salud", "Santé"],
  Mana: ["Maná", "Mana"],
  "Mana Regeneration": ["Regeneración de maná", "Régénération de mana"],
  Class: ["Clase", "Classe"],
  Range: ["Alcance", "Portée"],
  Defense: ["Defensa", "Défense"],
  Rarity: ["Rareza", "Rareté"],
  Common: ["Común", "Commun"],
  Uncommon: ["Poco común", "Peu commun"],
  Rare: ["Raro", "Rare"],
  Epic: ["Épico", "Épique"],
  Legendary: ["Legendario", "Légendaire"],
  Godlike: ["Divino", "Divin"],
  Mythic: ["Mítico", "Mythique"],
  Event: ["Evento", "Événement"],
  Limited: ["Limitado", "Limité"],
  Archer: ["Arquero", "Archer"],
  Warrior: ["Guerrero", "Guerrier"],
  Assassin: ["Asesino", "Assassin"],
  Helmet: ["Casco", "Casque"],
  Helm: ["Casco", "Heaume"],
  Boots: ["Botas", "Bottes"],
  Breastplate: ["Coraza", "Plastron"],
  Leggings: ["Calzas", "Jambières"],
  Gloves: ["Guantes", "Gants"],
  Necklace: ["Collar", "Collier"],
  Ore: ["Mineral", "Minerai"],
  Ingot: ["Lingote", "Lingot"],
  Board: ["Tablón", "Planche"],
  Wood: ["Madera", "Bois"],
  Powder: ["Polvo", "Poudre"],
  Thread: ["Hilo", "Fil"],
  Fangs: ["Colmillos", "Crocs"],
  Feather: ["Pluma", "Plume"],
  Shell: ["Caparazón", "Carapace"],
  Core: ["Núcleo", "Noyau"],
  Fragment: ["Fragmento", "Fragment"],
  Shard: ["Fragmento", "Éclat"],
  Twig: ["Ramita", "Brindille"],
  Root: ["Raíz", "Racine"],
  Bark: ["Corteza", "Écorce"],
  Skin: ["Piel", "Peau"],
  Fur: ["Piel", "Fourrure"],
  Fabric: ["Tela", "Tissu"],
  Jelly: ["Gelatina", "Gelée"],
  Requirements: ["Requisitos", "Conditions"],
  Resources: ["Recursos", "Ressources"],
  "Bonus Items": ["Objetos adicionales", "Objets bonus"],
  Kill: ["Mata", "Tuer"],
  Defeat: ["Derrota", "Vaincre"],
  Find: ["Encuentra", "Trouver"],
  Explore: ["Explora", "Explorer"],
  Read: ["Lee", "Lire"],
  "Go to": ["Ve a", "Aller à"],
  Follow: ["Sigue", "Suivre"],
  Give: ["Entrega", "Donner"],
  Wait: ["Espera", "Attendre"],
  Recover: ["Recupera", "Récupérer"],
  Forge: ["Forja", "Forger"],
  Coordinates: ["Coordenadas", "Coordonnées"],
  Gather: ["Reúne", "Récupérez"],
  Biome: ["Bioma", "Biome"],
  Dungeon: ["Mazmorra", "Donjon"],
  Boss: ["Jefe", "Boss"],
  Quest: ["Misión", "Quête"],
  "Side Quest": ["Misión secundaria", "Quête secondaire"],
  Merchant: ["Mercader", "Marchand"],
  Blacksmith: ["Herrero", "Forgeron"],
  Weaponsmith: ["Herrero de armas", "Forgeron d'armes"],
  Armorsmith: ["Herrero de armaduras", "Armurier"],
  Alchemist: ["Alquimista", "Alchimiste"],
  Lumberjack: ["Leñador", "Bûcheron"],
  Farmer: ["Granjero", "Fermier"],
  "Loot Buyer": ["Comprador de botín", "Acheteur de butin"],
  "Tool Merchant": ["Mercader de herramientas", "Marchand d'outils"],
  Loot: ["Botín", "Butin"],
  Makes: ["Fabrica", "Fabrique"],
  "Transforms Resources": ["Transforma recursos", "Transforme les ressources"],
  "Buys Loot": ["Compra botín", "Achète du butin"],
  Col: ["Col", "Col"],
  Acacia: ["Acacia", "Acacia"],
  Log: ["Tronco", "Bûche"],
  Twine: ["Cuerda", "Ficelle"],
  Belt: ["Cinturón", "Ceinture"],
  Fang: ["Colmillo", "Croc"],
  Flower: ["Flor", "Fleur"],
  Seed: ["Semilla", "Graine"],
  Sepal: ["Sépalo", "Sépale"],
  Amethyst: ["Amatista", "Améthyste"],
  Ancient: ["Antiguo", "Ancien"],
  Ticket: ["Entrada", "Billet"],
  Amber: ["Ámbar", "Ambre"],
  Andalousite: ["Andalucita", "Andalousite"],
  Anthracite: ["Antracita", "Anthracite"],
  Aquatic: ["Acuático", "Aquatique"],
  Debris: ["Escombros", "Débris"],
  Artifact: ["Artefacto", "Artefact"],
  "Bandit's": ["de bandido", "de bandit"],
  Gold: ["Oro", "Or"],
  Coin: ["Moneda", "Pièce"],
  Basalte: ["Basalto", "Basalte"],
  Repair: ["Reparación", "Réparation"],
  Kit: ["Kit", "Kit"],
  Bauxite: ["Bauxita", "Bauxite"],
  Minerals: ["Minerales", "Minéraux"],
  Bear: ["Oso", "Ours"],
  Fat: ["Grasa", "Graisse"],
  "Beginner's": ["de principiante", "de débutant"],
  Birch: ["Abedul", "Bouleau"],
  Black: ["Negro", "Noir"],
  Bone: ["Hueso", "Os"],
  Stone: ["Piedra", "Pierre"],
  Carcass: ["Cadáver", "Carcasse"],
  Lantern: ["Linterna", "Lanterne"],
  Mandible: ["Mandíbula", "Mandibule"],
  Venom: ["Veneno", "Venin"],
  Spinel: ["Espinela", "Spinelle"],
  Blank: ["En blanco", "Vierge"],
  Scroll: ["Pergamino", "Parchemin"],
  Blue: ["Azul", "Bleu"],
  Christmas: ["Navideño", "de Noël"],
  Mittens: ["Manoplas", "Moufles"],
  Dust: ["Polvo", "Poussière"],
  Brown: ["Marrón", "Brun"],
  Eyes: ["Ojos", "Yeux"],
  Bull: ["Toro", "Taureau"],
  Horn: ["Cuerno", "Corne"],
  Cage: ["Jaula", "Cage"],
  Key: ["Llave", "Clé"],
  Canvas: ["Lona", "Toile"],
  Carapace: ["Caparazón", "Carapace"],
  Cat: ["Gato", "Chat"],
  Lost: ["perdido", "perdu"],
  Chocolate: ["Chocolate", "Chocolat"],
  Box: ["Caja", "Boîte"],
  Corrupted: ["Corrupto", "Corrompu"],
  Crystal: ["Cristal", "Cristal"],
  Mask: ["Máscara", "Masque"],
  Essence: ["Esencia", "Essence"],
  Heart: ["Corazón", "Cœur"],
  Armor: ["Armadura", "Armure"],
  Blood: ["Sangre", "Sang"],
  Eye: ["Ojo", "Œil"],
  Rune: ["Runa", "Rune"],
  Potion: ["Poción", "Potion"],
  Happiness: ["Felicidad", "Bonheur"],
  Healing: ["Curación", "Soin"],
  Movement: ["Movimiento", "Mouvement"],
  Speed: ["Velocidad", "Vitesse"],
  Chance: ["Probabilidad", "Chance"],
  Critical: ["Crítico", "Critique"],
  Hit: ["Golpe", "Coup"],
  Stamina: ["Resistencia", "Endurance"],
  Regeneration: ["Regeneración", "Régénération"],
  Requirement: ["Requisito", "Prérequis"],
  Spirit: ["Espíritu", "Esprit"],
  Vitality: ["Vitalidad", "Vitalité"],
  Dexterity: ["Destreza", "Dextérité"],
  Force: ["Fuerza", "Force"],
  Intelligence: ["Inteligencia", "Intelligence"],
  Azurite: ["Azurita", "Azurite"],
  Barley: ["Cebada", "Orge"],
  Sugar: ["Azúcar", "Sucre"],
  Carnelian: ["Cornalina", "Cornaline"],
  Cobalt: ["Cobalto", "Cobalt"],
  Cooking: ["Cocina", "Cuisine"],
  Recipe: ["Receta", "Recette"],
  Copper: ["Cobre", "Cuivre"],
  Corindon: ["Corindón", "Corindon"],
  Cracked: ["Agrietado", "Fissuré"],
  Pickaxe: ["Pico", "Pioche"],
  Crown: ["Corona", "Couronne"],
  Crumpled: ["Arrugado", "Froissé"],
  Notebook: ["Cuaderno", "Carnet"],
  Cursed: ["Maldito", "Maudit"],
  Cloth: ["Tela", "Tissu"],
  Dragon: ["Dragón", "Dragon"],
  Egg: ["Huevo", "Œuf"],
  Cocoon: ["Capullo", "Cocon"],
  Buff: ["Mejora", "Bonus"],
  Fortifier: ["Potenciador", "Renforcement"],
  Fierce: ["Feroz", "Féroce"],
  Talisman: ["Talismán", "Talisman"],
  Fir: ["Abeto", "Sapin"],
  Fluorite: ["Fluorita", "Fluorite"],
  Wing: ["Ala", "Aile"],
  Fragrant: ["Aromática", "Parfumée"],
  Herb: ["Hierba", "Herbe"],
  Garnet: ["Granate", "Grenat"],
  Hematite: ["Hematita", "Hématite"],
  Blade: ["Hoja", "Lame"],
  Residue: ["Residuo", "Résidu"],
  Honey: ["Miel", "Miel"],
  Tunic: ["Túnica", "Tunique"],
  Impure: ["Impuro", "Impur"],
  Onyx: ["Ónice", "Onyx"],
  String: ["Cuerda", "Ficelle"],
  Jet: ["Azabache", "Jais"],
  Knowledge: ["Conocimiento", "Connaissance"],
  Krampus: ["Krampus", "Krampus"],
  Lavender: ["Lavanda", "Lavande"],
  Lepidolite: ["Lepidolita", "Lépidolite"],
  Lightning: ["Relámpago", "Foudre"],
  Scale: ["Escama", "Écaille"],
  Maganese: ["Manganeso", "Manganèse"],
  Robe: ["Túnica", "Robe"],
  Sandals: ["Sandalias", "Sandales"],
  Trousers: ["Pantalones", "Pantalon"],
  Malachite: ["Malaquita", "Malachite"],
  Medium: ["Mediana", "Moyenne"],
  Pouch: ["Bolsa", "Bourse"],
  Hoe: ["Azada", "Houe"],
  Midnight: ["Medianoche", "Minuit"],
  Cloak: ["Capa", "Cape"],
  Mist: ["Niebla", "Brume"],
  Claw: ["Garra", "Griffe"],
  Tail: ["Cola", "Queue"],
  Necromancer: ["Nigromante", "Nécromancien"],
  Necrotic: ["Necrótico", "Nécrotique"],
  Arch: ["Arco", "Arc"],
  Sandwich: ["Sándwich", "Sandwich"],
  Ninja: ["Ninja", "Ninja"],
  Occult: ["Oculto", "Occulte"],
  Earrings: ["Pendientes", "Boucles d'oreilles"],
  Hood: ["Capucha", "Capuche"],
  Hourglass: ["Reloj de arena", "Sablier"],
  Skull: ["Cráneo", "Crâne"],
  Token: ["Ficha", "Jeton"],
  Old: ["Viejo", "Vieux"],
  Oak: ["Roble", "Chêne"],
  Stick: ["Palo", "Bâton"],
  Parchment: ["Pergamino", "Parchemin"],
  Mastery: ["Maestría", "Maîtrise"],
  Patience: ["Paciencia", "Patience"],
  Strengthener: ["Fortalecedor", "Renforcement"],
  Piece: ["Pieza", "Morceau"],
  Pollen: ["Polen", "Pollen"],
  Concentrate: ["Concentrado", "Concentré"],
  Pure: ["Puro", "Pur"],
  Purse: ["Bolsa", "Bourse"],
  Quality: ["Calidad", "Qualité"],
  Ravaging: ["Devastadora", "Dévastatrice"],
  Branch: ["Rama", "Branche"],
  Reinforced: ["Reforzado", "Renforcé"],
  Ripped: ["Rasgado", "Déchiré"],
  Skeleton: ["Esqueleto", "Squelette"],
  Solstice: ["Solsticio", "Solstice"],
  Stolen: ["Robado", "Volé"],
  Coat: ["Abrigo", "Manteau"],
  Locket: ["Medallón", "Médaillon"],
  Sweet: ["Dulce", "Doux"],
  Jewel: ["Joya", "Joyau"],
  Leaves: ["Hojas", "Feuilles"],
  Bowstring: ["Cuerda de arco", "Corde d'arc"],
  Tactical: ["Táctica", "Tactique"],
  Woods: ["Bosques", "Bois"],
  Seal: ["Sello", "Sceau"],
  Hat: ["Sombrero", "Chapeau"],
  Temporal: ["Temporal", "Temporel"],
  "Thief's": ["de ladrón", "de voleur"],
  Torch: ["Antorcha", "Torche"],
  Tribe: ["Tribu", "Tribu"],
  Turquoise: ["Turquesa", "Turquoise"],
  Twilight: ["Crepúsculo", "Crépuscule"],
  Claymore: ["Claymore", "Claymore"],
  Twisted: ["Retorcida", "Tordue"],
  Water: ["Agua", "Eau"],
  Wheat: ["Trigo", "Blé"],
  Wisteria: ["Glicina", "Glycine"],
  Young: ["Joven", "Jeune"],
  Unique: ["Único", "Unique"],
  Haste: ["Celeridad", "Hâte"],
  Evasion: ["Evasión", "Évasion"],
  Falls: ["Caídas", "Chutes"],
  Reduction: ["Reducción", "Réduction"],
  "Two-Handed": ["A dos manos", "À deux mains"],
  Tenacity: ["Tenacidad", "Ténacité"],
  Uses: ["Usos", "Utilisations"],
  Cooldown: ["Tiempo de recarga", "Temps de recharge"],
  "Used Leather": ["Cuero usado", "Cuir usé"],
  "Worn Leather": ["Cuero gastado", "Cuir usé"],
  "Coal Ores": ["Minerales de carbón", "Minerais de charbon"],
  Bullhorn: ["Cuerno de toro", "Corne de taureau"],
  Allium: ["Allium", "Allium"],
  Glycine: ["Glicina", "Glycine"],
  Souls: ["Almas", "Âmes"],
  Omnivampirism: ["Omnivampirismo", "Omnivampirisme"],
  "Blocking Power": ["Potencia de bloqueo", "Puissance de blocage"],
  "Flight Of Life": ["Vuelo de vida", "Vol de vie"],
  "Boost the chance of Dodging": ["Aumenta la probabilidad de esquivar", "Augmente les chances d'esquive"],
  "Blocking Control": ["Control de bloqueo", "Contrôle du blocage"],
  "Recoil Resistance": ["Resistencia al retroceso", "Résistance au recul"],
  "Boost blocking control": ["Aumenta el control de bloqueo", "Augmente le contrôle du blocage"],
  "Boost blocking power": ["Aumenta la potencia de bloqueo", "Augmente la puissance de blocage"],
  "Boost recoil resistance": ["Aumenta la resistencia al retroceso", "Augmente la résistance au recul"],
  "Acacia board": ["Tablón de acacia", "Planche d'acacia"],
  "Acacia log": ["Tronco de acacia", "Bûche d'acacia"],
  "Caulette's lost pants": ["Pantalones perdidos de Caulette", "Pantalon perdu de Caulette"],
  "Krampus bracelet": ["Brazalete de Krampus", "Bracelet de Krampus"],
  Nodachi: ["Nodachi", "Nodachi"],
  "Soul of the Herald": ["Alma del heraldo", "Âme du héraut"],
  "Soul of the Reaper": ["Alma del segador", "Âme du faucheur"],
  "Soul of the Warden": ["Alma del guardián", "Âme du gardien"],
  "Spear of the Piercing Dart": ["Lanza del dardo perforante", "Lance du dard perforant"],
  "Sylvester bracelet": ["Brazalete de Sylvester", "Bracelet de Sylvester"],
  "Talons of Adoryll": ["Garras de Adoryll", "Serres d'Adoryll"],
  "Temporal Runes": ["Runas temporales", "Runes temporelles"],
  "Wolnir bracelet": ["Brazalete de Wolnir", "Bracelet de Wolnir"],
  "Woodclaw Knife": ["Cuchillo de garra de madera", "Couteau de griffe de bois"],
  Woodclaw: ["Garra de madera", "Griffe de bois"],
  "Accessory Smith": ["Herrero de accesorios", "Forgeron d'accessoires"],
  "Accessory Smithy": ["Herrería de accesorios", "Forge d'accessoires"],
  "Adventurer's Shoemaker": ["Zapatero de aventureros", "Cordonnier des aventuriers"],
  Braceletsmith: ["Herrero de brazaletes", "Forgeron de bracelets"],
  Glovesmith: ["Herrero de guantes", "Forgeron de gants"],
  Ringsmith: ["Herrero de anillos", "Forgeron de bagues"],
  "Tool Merchants": ["Mercaderes de herramientas", "Marchands d'outils"],
  Toolsmith: ["Herrero de herramientas", "Forgeron d'outils"],
  "Traveling Merchants": ["Mercaderes ambulantes", "Marchands itinérants"],
  "Equipment Merchants": ["Mercaderes de equipo", "Marchands d'équipement"],
  "Consumables Merchants": ["Mercaderes de consumibles", "Marchands de consommables"],
  Alchemists: ["Alquimistas", "Alchimistes"],
  Keymaker: ["Fabricante de llaves", "Fabricant de clés"],
  Reshaper: ["Remodelador", "Remodeleur"],
  Dealer: ["Vendedor", "Vendeur"],
  Reseller: ["Revendedor", "Revendeur"],
  Manufacturer: ["Fabricante", "Fabricant"],
  "Small Stock Exchange": ["Pequeña bolsa de valores", "Petite bourse"],
  Cabinetmaker: ["Ebanista", "Ébéniste"],
  Leatherworker: ["Curtidor", "Tanneur"],
  Miner: ["Minero", "Mineur"],
  Corner: ["Esquina", "Coin"],
  Ringman: ["Vendedor de anillos", "Vendeur de bagues"],
  "Weapon Seller": ["Vendedor de armas", "Vendeur d'armes"],
  Dard: ["Dardo", "Dard"],
  "Ficelle de bauxite": ["Cuerda de bauxita", "Ficelle de bauxite"],
  "Lien de la Sylve": ["Vínculo de la Sylve", "Lien de la Sylve"],
  "Oracile Thorn Stem": ["Tallo de espina de Oracile", "Tige d'épine d'Oracile"],
  "Oracile Thorn": ["Espina de Oracile", "Épine d'Oracile"],
  "Pyrite d'Or": ["Pirita de oro", "Pyrite d'or"],
  Pyrite: ["Pirita", "Pyrite"],
  "Runes from Toile": ["Runas de Toile", "Runes de Toile"],
  "Saphir Bleu": ["Zafiro azul", "Saphir bleu"],
  "Saphir Jaune": ["Zafiro amarillo", "Saphir jaune"],
  "Savannah Ax": ["Hacha de sabana", "Hache de savane"],
  Sceau: ["Sello", "Sceau"],
  "Sylve shoot": ["Brote de Sylve", "Pousse de Sylve"],
  Flearvae: ["Flearvae", "Flearvae"],
  "Ancestral Shoot": ["Brote ancestral", "Pousse ancestrale"],
  Lavander: ["Lavanda", "Lavande"],
  "the Accessories Smith in Sylnovar": [
    "el herrero de accesorios de Sylnovar",
    "le forgeron d'accessoires de Sylnovar"
  ],
  "Coppersmith in the Town of Beginnings": [
    "Herrero de cobre en la Ciudad de los Comienzos",
    "Forgeron de cuivre dans la Ville des commencements"
  ],
  "the Scrap Accessories Smithy, northeast of Swaying Monster Bay": [
    "la herrería de accesorios de chatarra, al noreste de la Bahía de Monstruos Ondulantes",
    "la forge d'accessoires de ferraille, au nord-est de la Baie des monstres ondoyants"
  ],
  "Rune Slots": ["Ranuras de runa", "Emplacements de runes"],
  "Effect: Force Accrue": ["Efecto: acumulación de fuerza", "Effet : cumul de force"],
  "Effect: Mana": ["Efecto: maná", "Effet : mana"],
  "Parry Chance": ["Probabilidad de parada", "Chance de parade"],
  "Mana Restored": ["Maná restaurado", "Mana restauré"],
  "Max Mana": ["Maná máximo", "Mana maximal"],
  "Boost the Mana Max": ["Aumenta el maná máximo", "Augmente le mana maximal"],
  "Dodge Chance": ["Probabilidad de esquivar", "Chance d'esquive"],
  "Effect: Augmentation Intelligence": ["Efecto: aumento de inteligencia", "Effet : augmentation de l'intelligence"],
  "Effect: Augmentation Force": ["Efecto: aumento de fuerza", "Effet : augmentation de la force"],
  "Affordable Bracelet": ["Brazalete asequible", "Bracelet abordable"],
  "Andesite Bracelet": ["Brazalete de andesita", "Bracelet d'andésite"],
  "Assassin's Billhook": ["Podadera de asesino", "Serpe d'assassin"],
  "Asterios Bracelet": ["Brazalete de Asterios", "Bracelet d'Asterios"],
  "Bauxite amulets": ["Amuletos de bauxita", "Amulettes de bauxite"],
  "Bauxite bracelet": ["Brazalete de bauxita", "Bracelet de bauxite"],
  "Bauxite ingot": ["Lingote de bauxita", "Lingot de bauxite"],
  "Bestial Grimoire": ["Grimorio bestial", "Grimoire bestial"],
  "Cage key": ["Llave de jaula", "Clé de cage"],
  "Deer Bracelet": ["Brazalete de ciervo", "Bracelet de cerf"],
  "Dragon Runes": ["Runas de dragón", "Runes de dragon"],
  "Essence of Gorbel": ["Esencia de Gorbel", "Essence de Gorbel"],
  "Essence of Sylnovar": ["Esencia de Sylnovar", "Essence de Sylnovar"],
  "Essence of Sylvaer": ["Esencia de Sylvaer", "Essence de Sylvaer"],
  "Frost Potion": ["Poción de escarcha", "Potion de givre"],
  "Goblin Essence": ["Esencia de goblin", "Essence de gobelin"],
  "Goblin Rune": ["Runa de goblin", "Rune de gobelin"],
  "Granite Bracelet": ["Brazalete de granito", "Bracelet de granit"],
  "Grimoire Taurus": ["Grimorio de Taurus", "Grimoire de Taurus"],
  "Gust Bracelet": ["Brazalete de ráfaga", "Bracelet de bourrasque"],
  "Honeyed Bracelet": ["Brazalete de miel", "Bracelet miellé"],
  "Ice Bracelet": ["Brazalete de hielo", "Bracelet de glace"],
  "Leaf Fragment": ["Fragmento de hoja", "Fragment de feuille"],
  "Low Corruption Grimoire": ["Grimorio de corrupción baja", "Grimoire de faible corruption"],
  "Luminescent Bracelet": ["Brazalete luminiscente", "Bracelet luminescent"],
  "Luminescent Rune": ["Runa luminiscente", "Rune luminescente"],
  "Magician's Grimoire": ["Grimorio del mago", "Grimoire du mage"],
  "Magician's Robe": ["Túnica del mago", "Robe du mage"],
  "Majestic Essence": ["Esencia majestuosa", "Essence majestueuse"],
  "Mana Potion IV": ["Poción de maná IV", "Potion de mana IV"],
  "Martyr's Potion": ["Poción del mártir", "Potion du martyr"],
  "Misty Bracelet": ["Brazalete brumoso", "Bracelet brumeux"],
  "Misty Rune": ["Runa brumosa", "Rune brumeuse"],
  "Nephentes Sandwich": ["Sándwich de nephentes", "Sandwich de néphentes"],
  "Orb of Mage Greed": ["Orbe de la codicia del mago", "Orbe de l'avidité du mage"],
  "Orc Bracelet": ["Brazalete de orco", "Bracelet d'orque"],
  "Orc Essence": ["Esencia de orco", "Essence d'orque"],
  "Orichalcum Fragment": ["Fragmento de oricalco", "Fragment d'orichalque"],
  "Potion of Life I": ["Poción de vida I", "Potion de vie I"],
  "Potion of Life II": ["Poción de vida II", "Potion de vie II"],
  "Potion of Life III": ["Poción de vida III", "Potion de vie III"],
  "Potion of Life IV": ["Poción de vida IV", "Potion de vie IV"],
  "Potion of Life V": ["Poción de vida V", "Potion de vie V"],
  "Potion of Life VI": ["Poción de vida VI", "Potion de vie VI"],
  "Potion of Mana I": ["Poción de maná I", "Potion de mana I"],
  "Potion of Mana II": ["Poción de maná II", "Potion de mana II"],
  "Potion of Mana III": ["Poción de maná III", "Potion de mana III"],
  "Potion of Mana VI": ["Poción de maná VI", "Potion de mana VI"],
  "Precision Rune I": ["Runa de precisión I", "Rune de précision I"],
  "Purple Broken Fragment": ["Fragmento morado roto", "Fragment violet brisé"],
  "Red Broken Fragment": ["Fragmento rojo roto", "Fragment rouge brisé"],
  "Rune of Agility I": ["Runa de agilidad I", "Rune d'agilité I"],
  "Rune of Low Corruption": ["Runa de corrupción baja", "Rune de faible corruption"],
  "Rune of Sorcery I": ["Runa de hechicería I", "Rune de sorcellerie I"],
  "Rune of the Colossus": ["Runa del coloso", "Rune du colosse"],
  "Rune of the Elders": ["Runa de los ancianos", "Rune des anciens"],
  "Rune of the Thief": ["Runa del ladrón", "Rune du voleur"],
  "Rune Remover I": ["Removedor de runas I", "Dissolvant de runes I"],
  "Rune Remover II": ["Removedor de runas II", "Dissolvant de runes II"],
  "Scrap Bracelet": ["Brazalete de chatarra", "Bracelet de ferraille"],
  "Spectral Bracelet": ["Brazalete espectral", "Bracelet spectral"],
  "Spectral Channel": ["Canal espectral", "Canal spectral"],
  "Spectral Essence": ["Esencia espectral", "Essence spectrale"],
  "Spectral Grimoire": ["Grimorio espectral", "Grimoire spectral"],
  "Spider Bracelet": ["Brazalete de araña", "Bracelet d'araignée"],
  "Strange Rune": ["Runa extraña", "Rune étrange"],
  "Talisman Taurus": ["Talismán de Taurus", "Talisman de Taurus"],
  "Weak Corruption Bracelet": ["Brazalete de corrupción débil", "Bracelet de faible corruption"],
  "Web Bracelet": ["Brazalete de telaraña", "Bracelet de toile"],
  "Wolf Bracelet": ["Brazalete de lobo", "Bracelet de loup"],
  "Fragment of the Ancients": ["Fragmento de los antiguos", "Fragment des anciens"],
  "Kazor Rune": ["Runa de Kazor", "Rune de Kazor"],
  "Labyrinth Rune": ["Runa del laberinto", "Rune du labyrinthe"],
  "Mafioso Rune": ["Runa mafiosa", "Rune mafieuse"],
  "Minerais d'Onyx Pur": ["Minerales de ónice puro", "Minerais d'onyx pur"],
  "Potion de Mana V": ["Poción de maná V", "Potion de mana V"],
  "Rune d'Halloween": ["Runa de Halloween", "Rune d'Halloween"],
  "Rune Lunaire": ["Runa lunar", "Rune lunaire"],
  "Rune Saint-Valentin": ["Runa de San Valentín", "Rune de la Saint-Valentin"],
  "Rune Solo Player": ["Runa de jugador solitario", "Rune du joueur solo"],
  "Rune Spectrale": ["Runa espectral", "Rune spectrale"],
  "Rune Sylnovarienne": ["Runa de Sylnovar", "Rune sylnovarienne"],
  "Rune Sylvaerienne": ["Runa de Sylvaer", "Rune sylvaerienne"],
  "Spectral Will-o'-the-Wisp": ["Fuego fatuo espectral", "Feu follet spectral"],
  "Sylvester Grimoire": ["Grimorio de Sylvester", "Grimoire de Sylvester"],
  "Witch's Potion (Intelligence)": ["Poción de bruja (inteligencia)", "Potion de sorcière (intelligence)"],
  "Witch's Potion (Strength)": ["Poción de bruja (fuerza)", "Potion de sorcière (force)"],
  "Yuleck Bracelet": ["Brazalete de Yuleck", "Bracelet de Yuleck"],
  "Basic Rune Craftsman": ["Artesano de runas básico", "Artisan runique de base"],
  "Complex Rune Craftsman": ["Artesano de runas complejo", "Artisan runique avancé"],
  "Oracile's Thorn Stem": ["Tallo de espina de Oracile", "Tige d'épine d'Oracile"],
  "Sylve Shoot": ["Brote de Sylve", "Pousse de Sylve"],
  Orcheart: ["Corazón de orco", "Cœur d'orque"],
  "Oracile's Thorn": ["Espina de Oracile", "Épine d'Oracile"],
  Grenat: ["Granate", "Grenat"],
  Jais: ["Azabache", "Jais"],
  "Grimoire Bestial": ["Grimorio bestial", "Grimoire bestial"],
  "Tissu Spectral": ["Tela espectral", "Tissu spectral"],
  "Oceiros Bracelet": ["Brazalete de Oceiros", "Bracelet d'Oceiros"],
  "Thief's Bracelet": ["Brazalete del ladrón", "Bracelet du voleur"],
  "Thief Set": ["Conjunto del ladrón", "Ensemble du voleur"],
  "Amethyst Set": ["Conjunto de amatista", "Ensemble d'améthyste"],
  "Amethyst Bracelet": ["Brazalete de amatista", "Bracelet d'améthyste"],
  "2 Piece Set Bonus": ["Bonus de conjunto de 2 piezas", "Bonus d'ensemble de 2 pièces"],
  "3 Piece Set Bonus": ["Bonus de conjunto de 3 piezas", "Bonus d'ensemble de 3 pièces"],
  "4 Piece Set Bonus": ["Bonus de conjunto de 4 piezas", "Bonus d'ensemble de 4 pièces"],
  "5 Piece Set Bonus": ["Bonus de conjunto de 5 piezas", "Bonus d'ensemble de 5 pièces"],
  "6 Piece Set Bonus": ["Bonus de conjunto de 6 piezas", "Bonus d'ensemble de 6 pièces"],
  "7 Piece Set Bonus": ["Bonus de conjunto de 7 piezas", "Bonus d'ensemble de 7 pièces"],
  "+1.5/s Health Regeneration": ["+1.5/s de regeneración de salud", "+1.5/s de régénération de santé"],
  "Yellow Broken Fragment": ["Fragmento amarillo roto", "Fragment jaune brisé"],
  "Ficelle d'Onyx Pur": ["Cuerda de ónice puro", "Ficelle d'onyx pur"],
  "Carapace d'Ika": ["Caparazón de Ika", "Carapace d'Ika"],
  "Rune Orcienne": ["Runa orca", "Rune orque"],
  "Grimoire Sylvester": ["Grimorio de Sylvester", "Grimoire de Sylvester"],
  "Effect: Utilisations": ["Efecto: usos", "Effet : utilisations"],
  "Effect: Harvest Power": ["Efecto: poder de recolección", "Effet : puissance de récolte"],
  "Effect: Sustainability": ["Efecto: sostenibilidad", "Effet : durabilité"],
  "Effect: Nourriture": ["Efecto: alimento", "Effet : nourriture"],
  "Effect: Saturation": ["Efecto: saturación", "Effet : saturation"],
  "Effect: Bloodthirst": ["Efecto: sed de sangre", "Effet : soif de sang"],
  "Effect: Endurance Accrue": ["Efecto: acumulación de resistencia", "Effet : cumul d'endurance"],
  "Effect: Niveau Requis": ["Efecto: nivel requerido", "Effet : niveau requis"],
  "Effect: Utilisations Totales": ["Efecto: usos totales", "Effet : utilisations totales"],
  "Effect: Puissance Arcanique": ["Efecto: poder arcano", "Effet : puissance arcanique"],
  "Effect: Recharge Cristaux": ["Efecto: recarga de cristales", "Effet : recharge des cristaux"],
  "Effect: Recharge Potions D'Amour": ["Efecto: recarga de pociones de amor", "Effet : recharge des potions d'amour"],
  "Effect: Level Required To Use Food": [
    "Efecto: nivel requerido para usar comida",
    "Effet : niveau requis pour utiliser la nourriture"
  ],
  "Effect: Recharge Nourriture": ["Efecto: recarga de comida", "Effet : recharge de la nourriture"],
  "Effect: Ressurection": ["Efecto: resurrección", "Effet : résurrection"]
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
  "Acacia Bark": ["Corteza de acacia", "Écorce d'acacia"],
  "Acacia Honey Necklace": ["Collar de miel de acacia", "Collier de miel d'acacia"],
  "Acacia Powder": ["Polvo de acacia", "Poudre d'acacia"],
  "Acacia Ring": ["Anillo de acacia", "Anneau d'acacia"],
  "Acacia Twine": ["Cuerda de acacia", "Ficelle d'acacia"],
  "Albal Fangs": ["Colmillos de Albal", "Crocs d'Albal"],
  "Albal Necklace": ["Collar de Albal", "Collier d'Albal"],
  "Allium Flower": ["Flor de allium", "Fleur d'allium"],
  "Amber Seed": ["Semilla de ámbar", "Graine d'ambre"],
  "Amber Sepal": ["Sépalo de ámbar", "Sépale d'ambre"],
  "Amethyst Shard": ["Fragmento de amatista", "Éclat d'améthyste"],
  "Amulet of the Dark Woods": ["Amuleto del Bosque Oscuro", "Amulette de la Forêt Sombre"],
  "Amulet of the Web": ["Amuleto de la telaraña", "Amulette de la toile"],
  "Ancestral Root": ["Raíz ancestral", "Racine ancestrale"],
  "Ancient Wood Essence": ["Esencia de madera antigua", "Essence de bois ancien"],
  "Aquatic Debris": ["Restos acuáticos", "Débris aquatiques"],
  "Aragorn's Necklace": ["Collar de Aragorn", "Collier d'Aragorn"],
  "Assassin Scythe": ["Guadaña de asesino", "Faux d'assassin"],
  "Assassin's Boots": ["Botas de asesino", "Bottes d'assassin"],
  "Assassin's Breastplate": ["Coraza de asesino", "Plastron d'assassin"],
  "Assassin's Helmet": ["Casco de asesino", "Casque d'assassin"],
  "Assassin's Leggings": ["Calzas de asesino", "Jambières d'assassin"],
  "Bandit's Boots": ["Botas de bandido", "Bottes de bandit"],
  "Bandit's Gold Coin": ["Moneda de oro de bandido", "Pièce d'or de bandit"],
  "Bauxite Minerals": ["Minerales de bauxita", "Minéraux de bauxite"],
  "Bear Claw": ["Garra de oso", "Griffe d'ours"],
  "Bear Fat": ["Grasa de oso", "Graisse d'ours"],
  "Bear Skin": ["Piel de oso", "Peau d'ours"],
  "Bear Soul Fragment": ["Fragmento de alma de oso", "Fragment d'âme d'ours"],
  "Beast Fur": ["Piel de bestia", "Fourrure de bête"],
  "Bee Mage Catalyst": ["Catalizador de mago abeja", "Catalyseur de mage abeille"],
  "Bee Shaman Catalyst": ["Catalizador de chamán abeja", "Catalyseur de chaman abeille"],
  "Bee Shell": ["Caparazón de abeja", "Carapace d'abeille"],
  "Birch Bark": ["Corteza de abedul", "Écorce de bouleau"],
  "Birch Board": ["Tablón de abedul", "Planche de bouleau"],
  "Birch Log": ["Tronco de abedul", "Bûche de bouleau"],
  "Birch Powder": ["Polvo de abedul", "Poudre de bouleau"],
  "Birch Ring": ["Anillo de abedul", "Anneau de bouleau"],
  "Birch Twine": ["Cuerda de abedul", "Ficelle de bouleau"],
  "Black Bone Stone": ["Piedra de hueso negro", "Pierre d'os noir"],
  "Black Boots": ["Botas negras", "Bottes noires"],
  "Black Carcass": ["Cadáver negro", "Carcasse noire"],
  "Black Hematite": ["Hematita negra", "Hématite noire"],
  "Black Lantern": ["Linterna negra", "Lanterne noire"],
  "Black Mandible": ["Mandíbula negra", "Mandibule noire"],
  "Black Powder": ["Pólvora negra", "Poudre noire"],
  "Black Shield": ["Escudo negro", "Bouclier noir"],
  "Black Spider Venom": ["Veneno de araña negra", "Venin d'araignée noire"],
  "Black Spinel": ["Espinela negra", "Spinelle noire"],
  "Black Thread": ["Hilo negro", "Fil noir"],
  "Blank Scroll": ["Pergamino en blanco", "Parchemin vierge"],
  "Blazing Feather": ["Pluma ardiente", "Plume ardente"],
  "Blue Christmas Mittens": ["Manoplas navideñas azules", "Moufles de Noël bleues"],
  "Boar Skin": ["Piel de jabalí", "Peau de sanglier"],
  "Bone Dust": ["Polvo de hueso", "Poussière d'os"],
  "Bone Gloves": ["Guantes de hueso", "Gants d'os"],
  "Bone Sword": ["Espada de hueso", "Épée d'os"],
  "Boots Brumeuses": ["Botas brumosas", "Bottes brumeuses"],
  "Boots Luminescentes": ["Botas luminiscentes", "Bottes luminescentes"],
  "Boots of the Foam": ["Botas de la espuma", "Bottes de l'écume"],
  "Boots of the Necromancer Assassin": ["Botas del asesino nigromante", "Bottes de l'assassin nécromancien"],
  "Boots of the Necromancer Shaman": ["Botas del chamán nigromante", "Bottes du chaman nécromancien"],
  "Boots of the Woods": ["Botas del bosque", "Bottes des bois"],
  "Boots Spectrales": ["Botas espectrales", "Bottes spectrales"],
  "Boots Sylvestres": ["Botas silvestres", "Bottes sylvestres"],
  "Bow Nodachi": ["Arco nodachi", "Arc nodachi"],
  "Bow of Love": ["Arco de amor", "Arc d'amour"],
  "Bow Sylvester": ["Arco de Sylvester", "Arc de Sylvester"],
  "Bracelet Gluant": ["Brazalete pegajoso", "Bracelet gluant"],
  "Bracelet of the Dark Woods": ["Brazalete del Bosque Oscuro", "Bracelet de la Forêt Sombre"],
  "Bracelet of the Woods": ["Brazalete del bosque", "Bracelet des bois"],
  "Breastplate of the Ancient Woods Hunter": [
    "Coraza del cazador de los Bosques Antiguos",
    "Plastron du chasseur des Bois Anciens"
  ],
  "Breastplate of the Ancient Woods Reaper": [
    "Coraza del segador de los Bosques Antiguos",
    "Plastron du faucheur des Bois Anciens"
  ],
  "Brown Spider Carcass": ["Cadáver de araña marrón", "Carcasse d'araignée brune"],
  "Brown Spider Eyes": ["Ojos de araña marrón", "Yeux d'araignée brune"],
  "Brown Spider Mandible": ["Mandíbula de araña marrón", "Mandibule d'araignée brune"],
  "Brown Spider Thread": ["Hilo de araña marrón", "Fil d'araignée brune"],
  "Brown Spider Venom": ["Veneno de araña marrón", "Venin d'araignée brune"],
  "Bull Horn": ["Cuerno de toro", "Corne de taureau"],
  "Bull Necklace": ["Collar de toro", "Collier de taureau"],
  "Bulls Gloves": ["Guantes de toro", "Gants de taureau"],
  "Cage key": ["Llave de jaula", "Clé de cage"],
  "Canvas Bag": ["Bolsa de lona", "Sac de toile"],
  "Canvas Boots": ["Botas de lona", "Bottes de toile"],
  "Canvas Gloves": ["Guantes de lona", "Gants de toile"],
  "Cat of the Lunar Year": ["Gato del año lunar", "Chat de l'année lunaire"],
  "Caulette's lost pants": ["Pantalones perdidos de Caulette", "Pantalon perdu de Caulette"],
  "Chipped Axe": ["Hacha desportillada", "Hache ébréchée"],
  "Chocolate Box": ["Caja de chocolate", "Boîte de chocolat"],
  "Christmas Rune": ["Runa navideña", "Rune de Noël"],
  "Coal Ores": ["Minerales de carbón", "Minerais de charbon"],
  "Cold Winds Necklace": ["Collar de vientos fríos", "Collier de vents froids"],
  "Complete Repair Kit": ["Kit de reparación completo", "Kit de réparation complet"],
  "Complete Seal Scroll": ["Pergamino de sello completo", "Parchemin de sceau complet"],
  "Cooking recipe": ["Receta de cocina", "Recette de cuisine"],
  "Copper Amulet": ["Amuleto de cobre", "Amulette de cuivre"],
  "Copper Bracelet": ["Brazalete de cobre", "Bracelet de cuivre"],
  "Copper Coin": ["Moneda de cobre", "Pièce de cuivre"],
  "Copper Gloves": ["Guantes de cobre", "Gants de cuivre"],
  "Copper Ingot": ["Lingote de cobre", "Lingot de cuivre"],
  "Copper Ores": ["Minerales de cobre", "Minerais de cuivre"],
  "Copper Ring": ["Anillo de cobre", "Anneau de cuivre"],
  "Copper Twine": ["Cuerda de cobre", "Ficelle de cuivre"],
  "Corrupted Bark": ["Corteza corrupta", "Écorce corrompue"],
  "Corrupted Crystal": ["Cristal corrupto", "Cristal corrompu"],
  "Corrupted Draconic Amulet": ["Amuleto dracónico corrupto", "Amulette draconique corrompue"],
  "Corrupted Draconic Ring": ["Anillo dracónico corrupto", "Anneau draconique corrompu"],
  "Corrupted Feather": ["Pluma corrupta", "Plume corrompue"],
  "Corrupted Fragment": ["Fragmento corrupto", "Fragment corrompu"],
  "Corrupted Mask": ["Máscara corrupta", "Masque corrompu"],
  "Corrupted Spore": ["Espora corrupta", "Spore corrompue"],
  "Crystallized Honey Boots": ["Botas de miel cristalizada", "Bottes de miel cristallisée"],
  "Crystallized Honey Breastplate": ["Coraza de miel cristalizada", "Plastron de miel cristallisée"],
  "Crystallized Honey Helmet": ["Casco de miel cristalizada", "Casque de miel cristallisée"],
  "Crystallized Honey Leggings": ["Calzas de miel cristalizada", "Jambières de miel cristallisée"],
  "Cursed Cloth": ["Tela maldita", "Tissu maudit"],
  /* --- crafting resources, materials and misc. items: D - I --- */
  "Dark Bone": ["Hueso oscuro", "Os sombre"],
  "Dark Branch": ["Rama oscura", "Branche sombre"],
  "Darkwood Boots": ["Botas de madera oscura", "Bottes de bois sombre"],
  "Earthy Feather": ["Pluma terrenal", "Plume terrestre"],
  "Egg Cocoon": ["Capullo de huevo", "Cocon d'œuf"],
  "Enchanted Metal Coin": ["Moneda de metal encantado", "Pièce de métal enchanté"],
  "Enchanted Metal Ingot": ["Lingote de metal encantado", "Lingot de métal enchanté"],
  "Enchanted Twig": ["Ramita encantada", "Brindille enchantée"],
  "Essence Stone": ["Piedra de esencia", "Pierre d'essence"],
  "Flaming Feather": ["Pluma llameante", "Plume flamboyante"],
  "Flying Spider Wing": ["Ala de araña voladora", "Aile d'araignée volante"],
  "Forest Key": ["Llave del bosque", "Clé de la forêt"],
  "Frost Dust": ["Polvo de escarcha", "Poussière de givre"],
  "Glacial Hard Skin": ["Piel dura glacial", "Peau dure glaciale"],
  "Glacial Magic Shard": ["Fragmento mágico glacial", "Éclat magique glacial"],
  "Gloves of the Dark Woods": ["Guantes del Bosque Oscuro", "Gants de la Forêt Sombre"],
  "Gloves Osseux": ["Guantes óseos", "Gants osseux"],
  "Gray Christmas Mittens": ["Manoplas navideñas grises", "Moufles de Noël grises"],
  "Green Christmas Mittens": ["Manoplas navideñas verdes", "Moufles de Noël vertes"],
  "Hammer of the Crushing Dart": ["Martillo del dardo aplastante", "Marteau de la flèche écrasante"],
  "Heart of Nymbrea": ["Corazón de Nymbrea", "Cœur de Nymbrea"],
  "Heart of Wood": ["Corazón de madera", "Cœur de bois"],
  "Hive Boots": ["Botas de la colmena", "Bottes de la ruche"],
  "Hive Breastplate": ["Coraza de la colmena", "Plastron de la ruche"],
  "Hive Helmet": ["Casco de la colmena", "Casque de la ruche"],
  "Hive Leggings": ["Calzas de la colmena", "Jambières de la ruche"],
  "Honey Residue": ["Residuo de miel", "Résidu de miel"],
  "Honeyed Amber": ["Ámbar meloso", "Ambre miellé"],
  "Hunter Amethyst Boots": ["Botas de amatista de cazador", "Bottes d'améthyste de chasseur"],
  "Hunter Amethyst Breastplate": ["Coraza de amatista de cazador", "Plastron d'améthyste de chasseur"],
  "Hunter Amethyst Helmet": ["Casco de amatista de cazador", "Casque d'améthyste de chasseur"],
  "Hunter Amethyst Leggings": ["Calzas de amatista de cazador", "Jambières d'améthyste de chasseur"],
  "Hunter's Breastplate": ["Coraza del cazador", "Plastron du chasseur"],
  "Hunter's Helmet": ["Casco del cazador", "Casque du chasseur"],
  "Hunter's Leggings": ["Calzas del cazador", "Jambières du chasseur"],
  "Huntress' Boots": ["Botas de la cazadora", "Bottes de la chasseresse"],
  "Icy Hard Skin": ["Piel dura helada", "Peau dure gelée"],
  "Icy Magic Radiance": ["Radiación mágica helada", "Rayonnement magique glacé"],
  "Ika Shell": ["Caparazón de Ika", "Carapace d'Ika"],
  "Impure Onyx Amulet": ["Amuleto de ónice impuro", "Amulette d'onyx impur"],
  "Impure Onyx Bracelet": ["Brazalete de ónice impuro", "Bracelet d'onyx impur"],
  "Impure Onyx Coin": ["Moneda de ónice impuro", "Pièce d'onyx impur"],
  "Impure Onyx Gloves": ["Guantes de ónice impuro", "Gants d'onyx impur"],
  "Impure Onyx Ingot": ["Lingote de ónice impuro", "Lingot d'onyx impur"],
  "Impure Onyx Ores": ["Minerales de ónice impuro", "Minerais d'onyx impur"],
  "Impure Onyx Ring": ["Anillo de ónice impuro", "Anneau d'onyx impur"],
  "Impure Onyx String": ["Cuerda de ónice impuro", "Ficelle d'onyx impur"],
  "Iron Bee Crossbow": ["Ballesta de abeja de hierro", "Arbalète d'abeille en fer"],
  "Iron Ingot": ["Lingote de hierro", "Lingot de fer"],
  "Iron Minerals": ["Minerales de hierro", "Minéraux de fer"],
  /* --- crafting resources, materials and misc. items: J - O --- */
  "Juvenile Bark": ["Corteza juvenil", "Écorce juvénile"],
  "Juvenile Seed": ["Semilla juvenil", "Graine juvénile"],
  "Kasaka Assassin's Fang Dagger": ["Daga de colmillo de asesino de Kasaka", "Dague à croc d'assassin de Kasaka"],
  "Kasaka Warrior Fang Dagger": ["Daga de colmillo de guerrero de Kasaka", "Dague à croc de guerrier de Kasaka"],
  "Kazor's Coin": ["Moneda de Kazor", "Pièce de Kazor"],
  "Key of Xal'Zirith": ["Llave de Xal'Zirith", "Clé de Xal'Zirith"],
  "Leaf Fragment": ["Fragmento de hoja", "Fragment de feuille"],
  "Lien de la Sylve": ["Vínculo de la Sylve", "Lien de la Sylve"],
  "Love Candy": ["Caramelo de amor", "Bonbon d'amour"],
  "Love Necklace": ["Collar de amor", "Collier d'amour"],
  "Love Potion": ["Poción de amor", "Potion d'amour"],
  "Love Stick": ["Vara de amor", "Bâton d'amour"],
  "Low Corruption Gloves": ["Guantes de corrupción baja", "Gants de faible corruption"],
  "Low Corruption Grimoire": ["Grimorio de corrupción baja", "Grimoire de faible corruption"],
  "Luminescent Belt": ["Cinturón luminiscente", "Ceinture luminescente"],
  "Luminescent Gloves": ["Guantes luminiscentes", "Gants luminescents"],
  "Luminescent Spider Venom": ["Veneno de araña luminiscente", "Venin d'araignée luminescente"],
  "Lunar Coin": ["Moneda lunar", "Pièce lunaire"],
  "Lunar Dust": ["Polvo lunar", "Poussière lunaire"],
  "Macabre Scythe": ["Guadaña macabra", "Faux macabre"],
  "Mage Love Catalyst": ["Catalizador de amor de mago", "Catalyseur d'amour de mage"],
  "Mage Necromancer Boots": ["Botas de mago nigromante", "Bottes de mage nécromancien"],
  "Mage Necromancer Breastplate": ["Coraza de mago nigromante", "Plastron de mage nécromancien"],
  "Mage Necromancer Helmet": ["Casco de mago nigromante", "Casque de mage nécromancien"],
  "Mage Necromancer Leggings": ["Calzas de mago nigromante", "Jambières de mage nécromancien"],
  "Mage Necromancer Staff": ["Bastón de mago nigromante", "Bâton de mage nécromancien"],
  "Mage Necrotic Scepter": ["Cetro necrótico de mago", "Sceptre nécrotique de mage"],
  "Mage Winter Catalyst": ["Catalizador de invierno de mago", "Catalyseur d'hiver de mage"],
  "Magic Mycelium": ["Micelio mágico", "Mycélium magique"],
  "Magic Wood Shard": ["Fragmento de madera mágica", "Éclat de bois magique"],
  "Magical Amethyst Boots": ["Botas de amatista mágica", "Bottes d'améthyste magique"],
  "Magical Amethyst Breastplate": ["Coraza de amatista mágica", "Plastron d'améthyste magique"],
  "Magical Amethyst Helmet": ["Casco de amatista mágica", "Casque d'améthyste magique"],
  "Magical Amethyst Leggings": ["Calzas de amatista mágica", "Jambières d'améthyste magique"],
  "Medium Pouch": ["Bolsa mediana", "Bourse moyenne"],
  "Merged Shard": ["Fragmento fusionado", "Éclat fusionné"],
  "Metal Soul Coin": ["Moneda de alma metálica", "Pièce d'âme métallique"],
  "Metal Soul Ingot": ["Lingote de alma metálica", "Lingot d'âme métallique"],
  "Misty Claw": ["Garra brumosa", "Griffe brumeuse"],
  "Misty Fang Boots": ["Botas de colmillo brumoso", "Bottes de croc brumeux"],
  "Misty Fur": ["Piel brumosa", "Fourrure brumeuse"],
  "Misty Tail": ["Cola brumosa", "Queue brumeuse"],
  "Mountain Deer Skin": ["Piel de ciervo de montaña", "Peau de cerf de montagne"],
  "Mysticized Honey Boots": ["Botas de miel mística", "Bottes de miel mystifiée"],
  "Mysticized Honey Breastplate": ["Coraza de miel mística", "Plastron de miel mystifiée"],
  "Mysticized Honey Helmet": ["Casco de miel mística", "Casque de miel mystifiée"],
  "Mysticized Honey Leggings": ["Calzas de miel mística", "Jambières de miel mystifiée"],
  "Necromancer Powder": ["Polvo de nigromante", "Poudre de nécromancien"],
  "Oak Board": ["Tablón de roble", "Planche de chêne"],
  "Oak Log": ["Tronco de roble", "Bûche de chêne"],
  "Oak Twine": ["Cuerda de roble", "Ficelle de chêne"],
  "Occult Token": ["Ficha oculta", "Jeton occulte"],
  "Orange Christmas mittens": ["Manoplas navideñas naranjas", "Moufles de Noël orange"],
  "Orange Hematite": ["Hematita naranja", "Hématite orange"],
  "Orc Armor Plating": ["Placas de armadura orca", "Plaques d'armure orque"],
  "Orc Blood": ["Sangre de orco", "Sang d'orque"],
  "Orc Heart": ["Corazón de orco", "Cœur d'orque"],
  "Orc's Eye": ["Ojo de orco", "Œil d'orque"],
  "Orichalcum Fragment": ["Fragmento de oricalco", "Fragment d'orichalque"],
  /* --- crafting resources, materials and misc. items: P - S --- */
  "Piece of Scrap": ["Pieza de chatarra", "Morceau de ferraille"],
  "Piece of Scrap Metal": ["Pieza de chatarra metálica", "Morceau de ferraille métallique"],
  "Pink Christmas Mittens": ["Manoplas navideñas rosas", "Moufles de Noël roses"],
  "Pooh's Ring": ["Anillo de Pooh", "Anneau de Pooh"],
  "Pure Onyx Amulet": ["Amuleto de ónice puro", "Amulette d'onyx pur"],
  "Pure Onyx Bracelet": ["Brazalete de ónice puro", "Bracelet d'onyx pur"],
  "Pure Onyx Gloves": ["Guantes de ónice puro", "Gants d'onyx pur"],
  "Pure Onyx Ingot": ["Lingote de ónice puro", "Lingot d'onyx pur"],
  "Pure Onyx Piece": ["Pieza de ónice puro", "Morceau d'onyx pur"],
  "Pure Onyx Ring": ["Anillo de ónice puro", "Anneau d'onyx pur"],
  "Purple Spider Carcass": ["Cadáver de araña morada", "Carcasse d'araignée violette"],
  "Purple Spider Eyes": ["Ojos de araña morada", "Yeux d'araignée violette"],
  "Ravaging Bark": ["Corteza devastadora", "Écorce dévastatrice"],
  "Ravaging Branch": ["Rama devastadora", "Branche dévastatrice"],
  "Ravaging Heart": ["Corazón devastador", "Cœur dévastateur"],
  "Reaper Amethyst Boots": ["Botas de amatista del segador", "Bottes d'améthyste du faucheur"],
  "Reaper Amethyst Breastplate": ["Coraza de amatista del segador", "Plastron d'améthyste du faucheur"],
  "Reaper Amethyst Leggings": ["Calzas de amatista del segador", "Jambières d'améthyste du faucheur"],
  "Reinforced Skeleton Bone": ["Hueso de esqueleto reforzado", "Os de squelette renforcé"],
  "Reinforced Spider Wire": ["Hilo de araña reforzado", "Fil d'araignée renforcé"],
  "Ring of the Dark Woods": ["Anillo del Bosque Oscuro", "Anneau de la Forêt Sombre"],
  "Rippling Feather": ["Pluma ondulante", "Plume ondulante"],
  "Rotten Heart": ["Corazón podrido", "Cœur pourri"],
  "Rune Orcienne": ["Runa orciana", "Rune orcienne"],
  "Runic Stone": ["Piedra rúnica", "Pierre runique"],
  "S Rank Bow": ["Arco de rango S", "Arc de rang S"],
  "Scrap Twine": ["Cuerda de chatarra", "Ficelle de ferraille"],
  "Shaman Orb of Greed": ["Orbe de codicia del chamán", "Orbe d'avidité du chaman"],
  "Shard of the Cursed Hoof": ["Fragmento del casco maldito", "Éclat du sabot maudit"],
  "Shark Shell": ["Caparazón de tiburón", "Carapace de requin"],
  "Skeleton Skull": ["Cráneo de esqueleto", "Crâne de squelette"],
  /* --- crafting resources, materials and misc. items: S - Z --- */
  "Slime Core": ["Núcleo de slime", "Noyau de slime"],
  "Slime Jelly": ["Gelatina de slime", "Gelée de slime"],
  "Small Pouch": ["Bolsa pequeña", "Petite bourse"],
  "Souls of Ruin": ["Almas de la ruina", "Âmes de la ruine"],
  "Souls of Ruins": ["Almas de las ruinas", "Âmes des ruines"],
  "Souls of the Ruins": ["Almas de las ruinas", "Âmes des ruines"],
  "Spectral Fabric": ["Tela espectral", "Tissu spectral"],
  "Spectral Mane Piece": ["Trozo de melena espectral", "Morceau de crinière spectrale"],
  "Spider Cloth": ["Tela de araña", "Tissu d'araignée"],
  "Spider Fabric": ["Tela de araña", "Tissu d'araignée"],
  "Spider Violet Eyes": ["Ojos violetas de araña", "Yeux violets d'araignée"],
  "Spider Web Boots": ["Botas de telaraña", "Bottes de toile d'araignée"],
  "Staff of the Mystic Mage Queen": ["Bastón de la reina maga mística", "Bâton de la reine mage mystique"],
  "Staff of the Mystic Queen Powerful Mage": [
    "Bastón de la reina mística, mago poderoso",
    "Bâton de la reine mystique, mage puissant"
  ],
  "Staff of the Mystic Queen Powerful Shaman": [
    "Bastón de la reina mística, chamán poderoso",
    "Bâton de la reine mystique, chaman puissant"
  ],
  "Staff of the Mystic Queen Shaman": ["Bastón de la reina mística chamán", "Bâton de la reine mystique chaman"],
  "Stalking Bee Bow": ["Arco de abeja acechadora", "Arc d'abeille traqueuse"],
  "Sword of the Sharp Dart": ["Espada del dardo afilado", "Épée de la flèche acérée"],
  "Sylnovarian Jewel": ["Joya de Sylnovar", "Joyau de Sylnovar"],
  "Sylnovarian Leaves": ["Hojas de Sylnovar", "Feuilles de Sylnovar"],
  "Sylvaerian Jewel": ["Joya de Sylvaer", "Joyau de Sylvaer"],
  "Sylvester Bowstring": ["Cuerda de arco de Sylvester", "Corde d'arc de Sylvester"],
  "Tail of the Woods": ["Cola del bosque", "Queue de la forêt"],
  "Thick Skin": ["Piel gruesa", "Peau épaisse"],
  "Titan Bark": ["Corteza de titán", "Écorce de titan"],
  "Water Harpy Egg": ["Huevo de arpía de agua", "Œuf de harpie aquatique"],
  "Water Warpy Egg": ["Huevo de warpy de agua", "Œuf de warpy aquatique"],
  "Wavy Feather": ["Pluma ondulada", "Plume ondulée"],
  "Wheat Flower": ["Flor de trigo", "Fleur de blé"],
  "Wheat Leaves": ["Hojas de trigo", "Feuilles de blé"],
  "White Spider Powder": ["Polvo de araña blanca", "Poudre d'araignée blanche"],
  "White Spider Thread": ["Hilo de araña blanca", "Fil d'araignée blanche"],
  "Wild Amethyst Boots": ["Botas de amatista salvaje", "Bottes d'améthyste sauvage"],
  "Wild Amethyst Breastplate": ["Coraza de amatista salvaje", "Plastron d'améthyste sauvage"],
  "Wild Amethyst Helmet": ["Casco de amatista salvaje", "Casque d'améthyste sauvage"],
  "Wild Amethyst Leggings": ["Calzas de amatista salvaje", "Jambières d'améthyste sauvage"],
  "Wolf Fangs": ["Colmillos de lobo", "Crocs de loup"],
  "Wolf Fur": ["Piel de lobo", "Fourrure de loup"],
  "Wolves Gloves": ["Guantes de lobo", "Gants de loup"],
  "Woodfang Boots": ["Botas de Colmillo de Madera", "Bottes de Croc-de-Bois"],
  "Woodland Fur": ["Piel del bosque", "Fourrure des bois"],
  "Yellow Christmas Mittens": ["Manoplas navideñas amarillas", "Moufles de Noël jaunes"],
  "Yellow Spider Carcass": ["Cadáver de araña amarilla", "Carcasse d'araignée jaune"],
  "Yellow Spider Thread": ["Hilo de araña amarilla", "Fil d'araignée jaune"],
  "Fir board": ["Tablón de abeto", "Planche de sapin"],
  "Fir log": ["Tronco de abeto", "Bûche de sapin"],
  "Fir Twine": ["Cuerda de abeto", "Ficelle de sapin"],
  /* --- equipment stat and effect labels --- */
  "Attack Damage": ["Daño de ataque", "Dégâts d'attaque"],
  "Blocking Mastery": ["Maestría de bloqueo", "Maîtrise de blocage"],
  "Boost Attack Damage": ["Aumenta el daño de ataque", "Augmente les dégâts d'attaque"],
  "Boost Critical Damage": ["Aumenta el daño crítico", "Augmente les dégâts critiques"],
  "Boost Critical Damage Damage": ["Aumenta el daño crítico", "Augmente les dégâts critiques"],
  "Boost Magic Damage": ["Aumenta el daño mágico", "Augmente les dégâts magiques"],
  "Boost Mana Max Regeneration": [
    "Aumenta la regeneración máxima de maná",
    "Augmente la régénération maximale de mana"
  ],
  "Boost Max Health Regeneration": [
    "Aumenta la regeneración máxima de salud",
    "Augmente la régénération maximale de santé"
  ],
  "Boost Movement Speed": ["Aumenta la velocidad de movimiento", "Augmente la vitesse de déplacement"],
  "Boost Skill Critical Damage": [
    "Aumenta el daño crítico de habilidad",
    "Augmente les dégâts critiques de compétence"
  ],
  "Boost Stamina Max Regeneration": [
    "Aumenta la regeneración máxima de resistencia",
    "Augmente la régénération maximale d'endurance"
  ],
  "Boost the Stamina Max": ["Aumenta la resistencia máxima", "Augmente l'endurance maximale"],
  "Critical Chance Skill": ["Probabilidad de crítico de habilidad", "Chances de critique de compétence"],
  "Critical Damage": ["Daño crítico", "Dégâts critiques"],
  "Critical Damage Skill": ["Daño crítico de habilidad", "Dégâts critiques de compétence"],
  "Critical Hit Chance": ["Probabilidad de golpe crítico", "Chances de coup critique"],
  "Crouch Speed": ["Velocidad agachado", "Vitesse accroupi"],
  "Damage Critical Hits": ["Daño de golpes críticos", "Dégâts des coups critiques"],
  "Damage Reduction": ["Reducción de daño", "Réduction des dégâts"],
  "Effect: Cooldown": ["Efecto: tiempo de recarga", "Effet : temps de recharge"],
  "Effect: Critical Damage": ["Efecto: daño crítico", "Effet : dégâts critiques"],
  "Effect: Critical Hit": ["Efecto: golpe crítico", "Effet : coup critique"],
  "Effect: Defense Augmentation": ["Efecto: aumento de defensa", "Effet : augmentation de la défense"],
  "Effect: Happiness Candy Refill": [
    "Efecto: recarga de caramelos de felicidad",
    "Effet : recharge des bonbons de bonheur"
  ],
  "Effect: Healing": ["Efecto: curación", "Effet : soin"],
  "Effect: Hit Points": ["Efecto: puntos de golpe", "Effet : points de vie"],
  "Effect: Increase Vitality": ["Efecto: aumento de vitalidad", "Effet : augmentation de la vitalité"],
  "Effect: Increased Dexterity": ["Efecto: destreza aumentada", "Effet : dextérité augmentée"],
  "Effect: Level Required To Use Food": [
    "Efecto: nivel requerido para usar comida",
    "Effet : niveau requis pour utiliser la nourriture"
  ],
  "Effect: Level Required To Use The Crystal": [
    "Efecto: nivel requerido para usar el cristal",
    "Effet : niveau requis pour utiliser le cristal"
  ],
  "Effect: Level Required To Use The Recipe": [
    "Efecto: nivel requerido para usar la receta",
    "Effet : niveau requis pour utiliser la recette"
  ],
  "Effect: Love Candies Refill": ["Efecto: recarga de caramelos de amor", "Effet : recharge des bonbons d'amour"],
  "Effect: Refill Potions Of Happiness": [
    "Efecto: recarga de pociones de felicidad",
    "Effet : recharge des potions de bonheur"
  ],
  "Effect: Regeneration": ["Efecto: regeneración", "Effet : régénération"],
  "Effect: Repair": ["Efecto: reparación", "Effet : réparation"],
  "Effect: Spirit Increase": ["Efecto: aumento de espíritu", "Effet : augmentation de l'esprit"],
  "Effect: Stamina": ["Efecto: resistencia", "Effet : endurance"],
  "Falls Reduction": ["Reducción de caídas", "Réduction des chutes"],
  "Health Regeneration": ["Regeneración de salud", "Régénération de santé"],
  "Health Restored": ["Salud restaurada", "Santé restaurée"],
  "Max Health": ["Salud máxima", "Santé maximale"],
  "Max Health Boost": ["Aumento de salud máxima", "Augmentation de santé maximale"],
  "Max Stamina": ["Resistencia máxima", "Endurance maximale"],
  "Movement Speed": ["Velocidad de movimiento", "Vitesse de déplacement"],
  "Physical Damage": ["Daño físico", "Dégâts physiques"],
  "Projectile Damage": ["Daño de proyectil", "Dégâts de projectile"],
  "Skill Critical Damage": ["Daño crítico de habilidad", "Dégâts critiques de compétence"],
  "Skill Damage": ["Daño de habilidad", "Dégâts de compétence"],
  "Stamina Regeneration": ["Regeneración de resistencia", "Régénération d'endurance"],
  "Stamina Restored": ["Resistencia restaurada", "Endurance restaurée"],
  "Weapon Damage": ["Daño de arma", "Dégâts d'arme"],
  /* --- crafting locations (equipment cards: "Crafted in") --- */
  "Accessory Smithy in the Town of Beginnings": [
    "Herrería de accesorios en la Ciudad de los Comienzos",
    "Forge d'accessoires dans la Ville des Commencements"
  ],
  Alchemists: ["Alquimistas", "Alchimistes"],
  "Arakh'Nol Secret Accessory Smithy": [
    "Herrería secreta de accesorios de Arakh'Nol",
    "Forge secrète d'accessoires d'Arakh'Nol"
  ],
  "Armorsmith in The Town of Beginnings": [
    "Herrero de armaduras en la Ciudad de los Comienzos",
    "Armurier dans la Ville des Commencements"
  ],
  "Armorsmith inside the Labyrinth of the Fallen": [
    "Herrero de armaduras dentro del Laberinto de los Caídos",
    "Armurier à l'intérieur du Labyrinthe des Déchus"
  ],
  "Bandit Accessory Reseller": ["Revendedor de accesorios de bandido", "Revendeur d'accessoires de bandit"],
  "Basic Accessories Manufacturer in the Town of Beginnings": [
    "Fabricante de accesorios básicos en la Ciudad de los Comienzos",
    "Fabricant d'accessoires basiques dans la Ville des Commencements"
  ],
  "Boot Bandit Dealer": ["Vendedor de botas de bandido", "Vendeur de bottes de bandit"],
  "Copper Accessories Blacksmith": ["Herrero de accesorios de cobre", "Forgeron d'accessoires en cuivre"],
  "Coppersmith in the Town of Beginnings": [
    "Herrero de cobre en la Ciudad de los Comienzos",
    "Forgeron de cuivre dans la Ville des Commencements"
  ],
  "Corrupted Rift Event Dungeon": [
    "Mazmorra del evento de la Grieta Corrupta",
    "Donjon de l'événement de la Faille Corrompue"
  ],
  "Equipment Merchants / Consumables Merchants": [
    "Mercaderes de equipo / Mercaderes de consumibles",
    "Marchands d'équipement / Marchands de consommables"
  ],
  "F1 Tool Merchants": ["Mercaderes de herramientas del piso 1", "Marchands d'outils de l'étage 1"],
  "Geldorak Mine Dungeon": ["Mazmorra de la Mina de Geldorak", "Donjon de la Mine de Geldorak"],
  "Hanaka Traveling Merchant": ["Mercader ambulante de Hanaka", "Marchand itinérant de Hanaka"],
  "Home Town Reshaper": ["Remodelador del pueblo natal", "Remodeleur du village natal"],
  "Ingot Blacksmith south of the OG District": [
    "Herrero de lingotes al sur del Distrito OG",
    "Forgeron de lingots au sud du Quartier OG"
  ],
  "Iron Accessories Blacksmith": ["Herrero de accesorios de hierro", "Forgeron d'accessoires en fer"],
  "Iron Accessories Blacksmith in the Town of Beginnings": [
    "Herrero de accesorios de hierro en la Ciudad de los Comienzos",
    "Forgeron d'accessoires en fer dans la Ville des Commencements"
  ],
  "Keymaker in front of the Labyrinth of the Fallen": [
    "Fabricante de llaves frente al Laberinto de los Caídos",
    "Fabricant de clés devant le Labyrinthe des Déchus"
  ],
  "Kobold Tower Dungeon": ["Mazmorra de la Torre de los Kobolds", "Donjon de la Tour des Kobolds"],
  "Labyrinth Armorsmith": ["Herrero de armaduras del laberinto", "Armurier du labyrinthe"],
  "Labyrinth of the Fallen": ["Laberinto de los Caídos", "Labyrinthe des Déchus"],
  "Labyrinth Weaponsmith": ["Herrero de armas del laberinto", "Forgeron d'armes du labyrinthe"],
  "Melliona Hive Dungeon": ["Mazmorra de la Colmena de Melliona", "Donjon de la Ruche de Melliona"],
  "Melliona Keymaker in Urbus": ["Fabricante de llaves de Melliona en Urbus", "Fabricant de clés de Melliona à Urbus"],
  "Merchant in front of the World Boss Kazor Arena": [
    "Mercader frente a la arena del jefe mundial Kazor",
    "Marchand devant l'arène du boss mondial Kazor"
  ],
  "Mizunari Traveling Merchant": ["Mercader ambulante de Mizunari", "Marchand itinérant de Mizunari"],
  "Occult Artifact Merchant": ["Mercader de artefactos ocultos", "Marchand d'artefacts occultes"],
  "Sanctuary Dungeon of Xal'Zirith": ["Mazmorra del Santuario de Xal'Zirith", "Donjon du Sanctuaire de Xal'Zirith"],
  "Secret Accessory Blacksmith at Deer Mountains": [
    "Herrero secreto de accesorios en las Montañas de los Ciervos",
    "Forgeron secret d'accessoires aux Montagnes des Cerfs"
  ],
  "Secret Accessory Blacksmith in the Snow Citadel": [
    "Herrero secreto de accesorios en la Ciudadela de Nieve",
    "Forgeron secret d'accessoires à la Citadelle des Neiges"
  ],
  "Secret Accessory Blacksmith in Vallhat": [
    "Herrero secreto de accesorios en Vallhat",
    "Forgeron secret d'accessoires à Vallhat"
  ],
  "Secret Accessory Smithy in Aepep's Lair": [
    "Herrería secreta de accesorios en la Guarida de Aepep",
    "Forge secrète d'accessoires dans le Repaire d'Aepep"
  ],
  "Secret Accessory Smithy in the Cyclorim Crypt": [
    "Herrería secreta de accesorios en la Cripta de Cyclorim",
    "Forge secrète d'accessoires dans la Crypte de Cyclorim"
  ],
  "Secret Accessory Smithy in Wolf Valley": [
    "Herrería secreta de accesorios en el Valle de los Lobos",
    "Forge secrète d'accessoires dans la Vallée des Loups"
  ],
  "the Accessories Merchant": ["el mercader de accesorios", "le marchand d'accessoires"],
  "the Accessory Blacksmith": ["el herrero de accesorios", "le forgeron d'accessoires"],
  "the Accessory Blacksmith in Urbus": ["el herrero de accesorios en Urbus", "le forgeron d'accessoires à Urbus"],
  "the Adventurer's Shoemaker": ["el zapatero de aventureros", "le cordonnier des aventuriers"],
  "the Amethyst Armorsmith": ["el herrero de armaduras de amatista", "l'armurier d'améthyste"],
  "the Amulet Merchant": ["el mercader de amuletos", "le marchand d'amulettes"],
  "the Amulet Smith": ["el forjador de amuletos", "le forgeron d'amulettes"],
  "the Ancient Blacksmith": ["el herrero antiguo", "le forgeron ancien"],
  "the Ancient Wood Armorsmith": ["el herrero de armaduras de madera antigua", "l'armurier en bois ancien"],
  "the Armorsmith in the Sweet Forest": ["el herrero de armaduras del Bosque Dulce", "l'armurier de la Forêt Sucrée"],
  "the Armorsmith outside the Necromancer's Tomb Dungeon": [
    "el herrero de armaduras fuera de la mazmorra de la Tumba del Nigromante",
    "l'armurier à l'extérieur du donjon de la Tombe du Nécromancien"
  ],
  "the Artifact Merchant": ["el mercader de artefactos", "le marchand d'artefacts"],
  "the Bauxite Accessories Blacksmith, south of the Millennium Baobab": [
    "el herrero de accesorios de bauxita, al sur del Baobab Milenario",
    "le forgeron d'accessoires en bauxite, au sud du Baobab Millénaire"
  ],
  "the Bracelet Merchant": ["el mercader de brazaletes", "le marchand de bracelets"],
  "the Braceletsmith": ["el herrero de brazaletes", "le forgeron de bracelets"],
  "the Glove Merchant": ["el mercader de guantes", "le marchand de gants"],
  "the Glovesmith": ["el herrero de guantes", "le forgeron de gants"],
  "the Impure Onyx Accessory Smithy, South of Taran": [
    "la herrería de accesorios de ónice impuro, al sur de Taran",
    "la forge d'accessoires d'onyx impur, au sud de Taran"
  ],
  "the Ingot Blacksmith in Urbus": ["el herrero de lingotes en Urbus", "le forgeron de lingots à Urbus"],
  "the Ingot Smithy East of Marome": [
    "la herrería de lingotes al este de Marome",
    "la forge de lingots à l'est de Marome"
  ],
  "the Kaelor Accessories Merchant": ["el mercader de accesorios de Kaelor", "le marchand d'accessoires de Kaelor"],
  "the Kaelor Accessory Smithy": ["la herrería de accesorios de Kaelor", "la forge d'accessoires de Kaelor"],
  "the Necromancer's Forgotten Tomb Dungeon": [
    "la mazmorra de la Tumba Olvidada del Nigromante",
    "le donjon de la Tombe Oubliée du Nécromancien"
  ],
  "the Occult Amulet Merchant": ["el mercader de amuletos ocultos", "le marchand d'amulettes occultes"],
  "the Occult Artifact Merchant": ["el mercader de artefactos ocultos", "le marchand d'artefacts occultes"],
  "the Occult Bracelet Merchant": ["el mercader de brazaletes ocultos", "le marchand de bracelets occultes"],
  "the Occult Gloves Merchant": ["el mercader de guantes ocultos", "le marchand de gants occultes"],
  "the Occult Ring Merchant": ["el mercader de anillos ocultos", "le marchand d'anneaux occultes"],
  "the Pure Onyx Accessory Blacksmith": [
    "el herrero de accesorios de ónice puro",
    "le forgeron d'accessoires d'onyx pur"
  ],
  "the Pure Onyx Accessory Smithy, located in the Rift Caves southeast of Tier 2": [
    "la herrería de accesorios de ónice puro, situada en las Cuevas de la Grieta al sureste del Nivel 2",
    "la forge d'accessoires d'onyx pur, située dans les Grottes de la Faille au sud-est du Niveau 2"
  ],
  "the Reinforced Tool Merchant": ["el mercader de herramientas reforzadas", "le marchand d'outils renforcés"],
  "the Ring Merchant": ["el mercader de anillos", "le marchand d'anneaux"],
  "the Ringsmith": ["el herrero de anillos", "le forgeron de bagues"],
  "the Secret Accessory Smith in Emerald Wings Forest": [
    "el herrero secreto de accesorios del Bosque de Alas Esmeralda",
    "le forgeron secret d'accessoires de la Forêt des Ailes d'Émeraude"
  ],
  "the Secret Accessory Smith in the Blaze Nest": [
    "el herrero secreto de accesorios del Nido de Brasas",
    "le forgeron secret d'accessoires du Nid des Braises"
  ],
  "the Secret Accessory Smith in the Sanctuary of Khesûn": [
    "el herrero secreto de accesorios del Santuario de Khesûn",
    "le forgeron secret d'accessoires du Sanctuaire de Khesûn"
  ],
  "the Secret Accessory Smithy in Bull Lake": [
    "la herrería secreta de accesorios del Lago de los Toros",
    "la forge secrète d'accessoires du Lac des Taureaux"
  ],
  "the Secret Accessory Smithy in Swaying Monster Bay": [
    "la herrería secreta de accesorios de la Bahía de Monstruos Ondulantes",
    "la forge secrète d'accessoires de la Baie des monstres ondoyants"
  ],
  "the Secret Accessory Smithy in the Sweet Forest, in Boss Winnie's Lair": [
    "la herrería secreta de accesorios del Bosque Dulce, en la Guarida del jefe Winnie",
    "la forge secrète d'accessoires de la Forêt Sucrée, dans le Repaire du boss Winnie"
  ],
  "the Secret Corruption Accessory Smithy at Tier 2": [
    "la herrería secreta de accesorios de corrupción en el Nivel 2",
    "la forge secrète d'accessoires de corruption au Niveau 2"
  ],
  "the Sweet Forest Weaponsmith": ["el herrero de armas del Bosque Dulce", "le forgeron d'armes de la Forêt Sucrée"],
  "the Tomb Key Maker in Urbus": [
    "el fabricante de llaves de la tumba en Urbus",
    "le fabricant de clés de la tombe à Urbus"
  ],
  "the Weaponsmith outside the Necromancer's Tomb Dungeon": [
    "el herrero de armas fuera de la mazmorra de la Tumba del Nigromante",
    "le forgeron d'armes à l'extérieur du donjon de la Tombe du Nécromancien"
  ],
  "Tier 2 Tool Merchants": ["Mercaderes de herramientas del Nivel 2", "Marchands d'outils du Niveau 2"],
  "Tolbana Accessories Merchant": ["Mercader de accesorios de Tolbana", "Marchand d'accessoires de Tolbana"],
  "Tolbana Armorsmith": ["Herrero de armaduras de Tolbana", "Armurier de Tolbana"],
  "Tolbana Traveling Merchant": ["Mercader ambulante de Tolbana", "Marchand itinérant de Tolbana"],
  "Tolbana Weaponsmith": ["Herrero de armas de Tolbana", "Forgeron d'armes de Tolbana"],
  "Tower of Kobold": ["Torre de los Kobolds", "Tour des Kobolds"],
  "Traveling Merchant": ["Mercader ambulante", "Marchand itinérant"],
  "Traveling Merchant / Alchemists": ["Mercader ambulante / Alquimistas", "Marchand itinérant / Alchimistes"],
  "Traveling Merchant Boar Zone": [
    "Mercader ambulante de la Zona de Jabalíes",
    "Marchand itinérant de la Zone des Sangliers"
  ],
  "Traveling Merchant Hanaka & Vallhat": [
    "Mercader ambulante de Hanaka y Vallhat",
    "Marchand itinérant de Hanaka et Vallhat"
  ],
  "Traveling Merchant in the Boar Zone": [
    "Mercader ambulante en la Zona de Jabalíes",
    "Marchand itinérant dans la Zone des Sangliers"
  ],
  "Traveling Merchant Vallhat": ["Mercader ambulante de Vallhat", "Marchand itinérant de Vallhat"],
  "Traveling Merchant Virelune, Arakh'Nol & Tolbana": [
    "Mercader ambulante de Virelune, Arakh'Nol y Tolbana",
    "Marchand itinérant de Virelune, Arakh'Nol et Tolbana"
  ],
  "Vallhat Accessories Merchant": ["Mercader de accesorios de Vallhat", "Marchand d'accessoires de Vallhat"],
  "Weaponsmith in The Town of Beginnings": [
    "Herrero de armas en la Ciudad de los Comienzos",
    "Forgeron d'armes dans la Ville des Commencements"
  ],
  "Weaponsmith outside the Labyrinth of the Fallen": [
    "Herrero de armas fuera del Laberinto de los Caídos",
    "Forgeron d'armes à l'extérieur du Labyrinthe des Déchus"
  ],
  /* --- shop and NPC map descriptions (marker labels) --- */
  "Accessories Blacksmith": ["Herrero de accesorios", "Forgeron d'accessoires"],
  "Accessories Merchant": ["Mercader de accesorios", "Marchand d'accessoires"],
  "Accessories Bandit Blacksmith": ["Herrero de accesorios de bandidos", "Forgeron d'accessoires de bandits"],
  "Simple Accessories Merchant": ["Mercader de accesorios sencillos", "Marchand d'accessoires simples"],
  "Impure Onyx Accessories Blacksmith.": [
    "Herrero de accesorios de ónice impuro.",
    "Forgeron d'accessoires d'onyx impur."
  ],
  "Pure Onyx Accessories Blacksmith.": ["Herrero de accesorios de ónice puro.", "Forgeron d'accessoires d'onyx pur."],
  /* --- ore and material plural forms --- */
  Ores: ["Minerales", "Minerais"],
  "Iron Ores": ["Minerales de hierro", "Minerais de fer"],
  /* --- word-level terms the name families below are built from --- */
  Accessories: ["Accesorios", "Accessoires"],
  Boar: ["Jabalí", "Sanglier"],
  Glutinous: ["Glutinoso", "Glutineux"],
  Hunter: ["Cazador", "Chasseur"],
  Magical: ["Mágico", "Magique"],
  Plating: ["Placas", "Plaques"],
  Reaper: ["Segador", "Faucheur"],
  Sickle: ["Hoz", "Faucille"],
  Woodland: ["Bosque", "Forêt"],
  billhook: ["Podadera", "Serpe"],
  /* --- map titles that mix the words above (full phrases so the word order stays natural) --- */
  "Corrupted Boar Accessories": ["Accesorios de jabalí corrupto", "Accessoires de sanglier corrompu"],
  "Glutinous Loot Buyer": ["Comprador de botín glutinoso", "Acheteur de butin glutineux"],
  "Iron/Copper Accessories": ["Accesorios de hierro y cobre", "Accessoires de fer et de cuivre"],
  /* --- "Ancient Woodland" / "Ancient Wood" armor sets (the set suffix names a variant) --- */
  "Ancient Wood Leggings Reaper": ["Calzas de madera antigua del segador", "Jambières de bois ancien du faucheur"],
  "Ancient Woodland Boots Hunter": ["Botas del cazador del Bosque Antiguo", "Bottes du chasseur de la Forêt Ancienne"],
  "Ancient Woodland Boots Reaper": ["Botas del segador del Bosque Antiguo", "Bottes du faucheur de la Forêt Ancienne"],
  "Ancient Woodland Leggings Hunter": [
    "Calzas del cazador del Bosque Antiguo",
    "Jambières du chasseur de la Forêt Ancienne"
  ],
  "Fierce Ancient Woodland Boots": ["Botas feroces del Bosque Antiguo", "Bottes féroces de la Forêt Ancienne"],
  "Magical Ancient Woodland Boots": ["Botas mágicas del Bosque Antiguo", "Bottes magiques de la Forêt Ancienne"],
  "Magical Ancient Woodland Helmet": ["Casco mágico del Bosque Antiguo", "Casque magique de la Forêt Ancienne"],
  "Wild Ancient Woodland Boots": ["Botas salvajes del Bosque Antiguo", "Bottes sauvages de la Forêt Ancienne"],
  "Helm of the Ancient Woods Reaper": [
    "Yelmo del segador de los Bosques Antiguos",
    "Heaume du faucheur des Bois Anciens"
  ],
  "Helmet of the Ancient Woods Hunter": [
    "Casco del cazador de los Bosques Antiguos",
    "Casque du chasseur des Bois Anciens"
  ],
  /* --- "Reaper" / "Hunter" sets, the Fallen variants and the hooked-blade weapons --- */
  "Amethyst Reaper Helm": ["Yelmo de amatista del segador", "Heaume d'améthyste du faucheur"],
  "Fallen Gloves of the Hunter": ["Guantes caídos del cazador", "Gants déchus du chasseur"],
  "Fallen Hunter Amulet": ["Amuleto caído del cazador", "Amulette déchue du chasseur"],
  "Glutinous Amulet": ["Amuleto glutinoso", "Amulette glutineuse"],
  "Glutinous Ring": ["Anillo glutinoso", "Anneau glutineux"],
  "Goblin Armor Plating": ["Placas de armadura de goblin", "Plaques d'armure de gobelin"],
  "Hunter's Boots": ["Botas del cazador", "Bottes du chasseur"],
  "Reaper Boots": ["Botas del segador", "Bottes du faucheur"],
  "Reaper Breastplate": ["Coraza del segador", "Plastron du faucheur"],
  "Reaper Helmet": ["Casco del segador", "Casque du faucheur"],
  "Reaper Leggings": ["Calzas del segador", "Jambières du faucheur"],
  "Reaper Ring": ["Anillo del segador", "Anneau du faucheur"],
  "Necromancer billhook": ["Podadera de nigromante", "Serpe de nécromancien"],
  "Scythe billhook": ["Podadera de guadaña", "Serpe de faux"],
  "Twisted Sickle": ["Hoz torcida", "Faucille tordue"],
  /* --- stat and effect labels ("<Stat> Fortifier II", "Fortifying <Stat> I", "[Quality] ...") --- */
  "Endurance Buff II": ["Mejora de aguante II", "Bonus d'endurance II"],
  "Endurance Buff III": ["Mejora de aguante III", "Bonus d'endurance III"],
  "Endurance Fortifier I": ["Potenciador de aguante I", "Renforcement d'endurance I"],
  "Ferocity Buff II": ["Mejora de ferocidad II", "Bonus de férocité II"],
  "Ferocity Buff III": ["Mejora de ferocidad III", "Bonus de férocité III"],
  "Fortifier of Ferocity I": ["Potenciador de ferocidad I", "Renforcement de férocité I"],
  "Knowledge Buff II": ["Mejora de conocimiento II", "Bonus de connaissance II"],
  "Knowledge Buff III": ["Mejora de conocimiento III", "Bonus de connaissance III"],
  "Knowledge Fortifier I": ["Potenciador de conocimiento I", "Renforcement de connaissance I"],
  "Patience Fortifier I": ["Potenciador de paciencia I", "Renforcement de patience I"],
  "Patience Fortifier II": ["Potenciador de paciencia II", "Renforcement de patience II"],
  "Patience Strengthener III": ["Fortalecedor de paciencia III", "Renforçateur de patience III"],
  "Resistance Buff III": ["Mejora de resistencia III", "Bonus de résistance III"],
  "Resistance Fortifier I": ["Potenciador de resistencia I", "Renforcement de résistance I"],
  "Resistance Fortifier II": ["Potenciador de resistencia II", "Renforcement de résistance II"],
  "Vitality Fortifier I": ["Potenciador de vitalidad I", "Renforcement de vitalité I"],
  "Vitality Fortifier II": ["Potenciador de vitalidad II", "Renforcement de vitalité II"],
  "Vitality Fortifier III": ["Potenciador de vitalidad III", "Renforcement de vitalité III"],
  /* --- the same labels as they appear on quality-tiered items --- */
  "[Quality] Endurance Fortifier I": ["[Calidad] Potenciador de aguante I", "[Qualité] Renforcement d'endurance I"],
  "[Quality] Endurance Fortifier II": ["[Calidad] Potenciador de aguante II", "[Qualité] Renforcement d'endurance II"],
  "[Quality] Endurance Fortifier III": [
    "[Calidad] Potenciador de aguante III",
    "[Qualité] Renforcement d'endurance III"
  ],
  "[Quality] Fortifying Ferocity I": ["[Calidad] Ferocidad fortalecedora I", "[Qualité] Férocité fortifiante I"],
  "[Quality] Fortifying Ferocity II": ["[Calidad] Ferocidad fortalecedora II", "[Qualité] Férocité fortifiante II"],
  "[Quality] Fortifying Ferocity III": ["[Calidad] Ferocidad fortalecedora III", "[Qualité] Férocité fortifiante III"],
  "[Quality] Fortifying Patience II": ["[Calidad] Paciencia fortalecedora II", "[Qualité] Patience fortifiante II"],
  "[Quality] Fortifying Patience III": ["[Calidad] Paciencia fortalecedora III", "[Qualité] Patience fortifiante III"],
  "[Quality] Fortifying Vitality II": ["[Calidad] Vitalidad fortalecedora II", "[Qualité] Vitalité fortifiante II"],
  "[Quality] Resistance Fortifier I": [
    "[Calidad] Potenciador de resistencia I",
    "[Qualité] Renforcement de résistance I"
  ],
  "[Quality] Resistance Fortifier II": [
    "[Calidad] Potenciador de resistencia II",
    "[Qualité] Renforcement de résistance II"
  ],
  "[Quality] Resistance Fortifier III": [
    "[Calidad] Potenciador de resistencia III",
    "[Qualité] Renforcement de résistance III"
  ],
  "[Quality] Strengthening Knowledge I": [
    "[Calidad] Conocimiento fortalecedor I",
    "[Qualité] Connaissance fortifiante I"
  ],
  "[Quality] Strengthening Knowledge II": [
    "[Calidad] Conocimiento fortalecedor II",
    "[Qualité] Connaissance fortifiante II"
  ],
  "[Quality] Strengthening Knowledge III": [
    "[Calidad] Conocimiento fortalecedor III",
    "[Qualité] Connaissance fortifiante III"
  ],
  "[Quality] Strengthening Patience I": ["[Calidad] Paciencia fortalecedora I", "[Qualité] Patience fortifiante I"],
  "[Quality] Vitality Fortifier I": ["[Calidad] Potenciador de vitalidad I", "[Qualité] Renforcement de vitalité I"],
  "[Quality] Vitality Fortifier III": [
    "[Calidad] Potenciador de vitalidad III",
    "[Qualité] Renforcement de vitalité III"
  ],
  /* --- remaining equipment names from the token-glossary gap --- */
  "Halloween Crystal": ["Cristal de Halloween", "Cristal d'Halloween"],
  "Key to the Forgotten Tomb": ["Llave de la tumba olvidada", "Clé de la tombe oubliée"],
  "Skeletal Amulet": ["Amuleto esquelético", "Amulette squelettique"],
  "Wild Boar Meat": ["Carne de jabalí salvaje", "Viande de sanglier sauvage"],
  /* --- words shared by several of the families above --- */
  Buff: ["Mejora", "Bonus"],
  Endurance: ["Aguante", "Endurance"],
  Ferocity: ["Ferocidad", "Férocité"],
  Knowledge: ["Conocimiento", "Connaissance"],
  Patience: ["Paciencia", "Patience"],
  Resistance: ["Resistencia", "Résistance"],
  Spider: ["Araña", "Araignée"],
  Tomb: ["Tumba", "Tombe"],
  Vitality: ["Vitalidad", "Vitalité"],
  "Misty Wolf": ["Lobo brumoso", "Loup brumeux"],
  /* --- equipment and accessory names curated by the EN/ES/FR quality pass: [Quality] tags and A - C --- */
  "[Quality] Mana V Potion": ["[Calidad] Poción de maná V", "[Qualité] Potion de mana V"],
  "[Quality] Stamina I Potion": ["[Calidad] Poción de resistencia I", "[Qualité] Potion d'endurance I"],
  "[Quality] Stamina II Potion": ["[Calidad] Poción de resistencia II", "[Qualité] Potion d'endurance II"],
  "[Quality] Stamina III Potion": ["[Calidad] Poción de resistencia III", "[Qualité] Potion d'endurance III"],
  "[Quality] Stamina IV Potion": ["[Calidad] Poción de resistencia IV", "[Qualité] Potion d'endurance IV"],
  "[Quality] Stamina V Potion": ["[Calidad] Poción de resistencia V", "[Qualité] Potion d'endurance V"],
  "[Quality] Stamina VI Potion": ["[Calidad] Poción de resistencia VI", "[Qualité] Potion d'endurance VI"],
  "Adventurer's Boots": ["Botas de aventurero", "Bottes d'aventurier"],
  "Adventurer's Ring": ["Anillo de aventurero", "Anneau d'aventurier"],
  "Affordable Belt": ["Cinturón asequible", "Ceinture abordable"],
  "Affordable Gloves": ["Guantes asequibles", "Gants abordables"],
  "Affordable Necklace": ["Collar asequible", "Collier abordable"],
  "Affordable Ring": ["Anillo asequible", "Anneau abordable"],
  "Amethyst Amulet": ["Amuleto de amatista", "Amulette d'améthyste"],
  "Amethyst Boots": ["Botas de amatista", "Bottes d'améthyste"],
  "Amethyst Gloves": ["Guantes de amatista", "Gants d'améthyste"],
  "Amethyst Ring": ["Anillo de amatista", "Anneau d'améthyste"],
  "Amulet of the Corrupted Rift": ["Amuleto de la Grieta Corrupta", "Amulette de la Faille Corrompue"],
  "Ancient Bark": ["Corteza antigua", "Écorce ancienne"],
  "Ancient Woods Ticket": ["Entrada de los Bosques Antiguos", "Billet des Bois Anciens"],
  "Andesite Gloves": ["Guantes de andesita", "Gants d'andésite"],
  "Andesite Necklace": ["Collar de andesita", "Collier d'andésite"],
  "Andesite Ring": ["Anillo de andesita", "Anneau d'andésite"],
  "Archer Necromancer Breastplate": ["Coraza de nigromante arquero", "Plastron de nécromancien archer"],
  "Artifact of the Fallen": ["Artefacto de los Caídos", "Artefact des Déchus"],
  "Ash Crossbow": ["Ballesta de fresno", "Arbalète de frêne"],
  "Assassin Necromancer Breastplate": ["Coraza de nigromante asesino", "Plastron de nécromancien assassin"],
  "Assassin Necromancer Leggings": ["Calzas de nigromante asesino", "Jambières de nécromancien assassin"],
  "Azure Feather": ["Pluma azur", "Plume azur"],
  "Bandit Crossbow": ["Ballesta de bandido", "Arbalète de bandit"],
  "Bandit Dagger": ["Daga de bandido", "Dague de bandit"],
  "Bandit Gloves": ["Guantes de bandido", "Gants de bandit"],
  "Bandits Ticket": ["Entrada de bandidos", "Billet de bandits"],
  "Barley Sugar": ["Azúcar de cebada", "Sucre d'orge"],
  "Bauxite Gloves": ["Guantes de bauxita", "Gants de bauxite"],
  "Bauxite Ring": ["Anillo de bauxita", "Anneau de bauxite"],
  "Bear Belt": ["Cinturón de oso", "Ceinture d'ours"],
  "Bear Gloves": ["Guantes de oso", "Gants d'ours"],
  "Bear Ring": ["Anillo de oso", "Anneau d'ours"],
  "Beginner Leggings": ["Calzas de principiante", "Jambières de débutant"],
  "Beginner's Boots": ["Botas de principiante", "Bottes de débutant"],
  "Beginner's Tunic": ["Túnica de principiante", "Tunique de débutant"],
  "Corrupted Rift Belt": ["Cinturón de la Grieta Corrupta", "Ceinture de la Faille Corrompue"],
  "Corrupted Rift Gloves": ["Guantes de la Grieta Corrupta", "Gants de la Faille Corrompue"],
  "Corrupted Rift Necklace": ["Collar de la Grieta Corrupta", "Collier de la Faille Corrompue"],
  "Cracked Pickaxe": ["Pico agrietado", "Pioche fissurée"],
  "Dagger Nodachi": ["Daga nodachi", "Dague nodachi"],
  "Dark Dagger": ["Daga oscura", "Dague sombre"],
  "Dark Mage Staff": ["Bastón de mago oscuro", "Bâton de mage sombre"],
  "Dark Shaman Staff": ["Bastón de chamán oscuro", "Bâton de chaman sombre"],
  "Dark Shard": ["Fragmento oscuro", "Éclat sombre"],
  "Deer Belt": ["Cinturón de ciervo", "Ceinture de cerf"],
  "Deer Gloves": ["Guantes de ciervo", "Gants de cerf"],
  "Druid's Fallen Amulet": ["Amuleto caído del druida", "Amulette déchue du druide"],
  "Earth Bark": ["Corteza de tierra", "Écorce de terre"],
  "Explorer's Boots": ["Botas de explorador", "Bottes d'explorateur"],
  "Fake Love": ["Amor falso", "Faux amour"],
  "Fallen Boots of the Thief": ["Botas caídas del ladrón", "Bottes déchues du voleur"],
  "Fallen Bow": ["Arco caído", "Arc déchu"],
  "Fallen Crossbow": ["Ballesta caída", "Arbalète déchue"],
  "Fallen Dagger": ["Daga caída", "Dague déchue"],
  "Fallen Double Axe": ["Hacha doble caída", "Hache double déchue"],
  "Fallen Ring of the Druid": ["Anillo caído del druida", "Anneau déchu du druide"],
  "Fallen Soldier Necklace": ["Collar del soldado caído", "Collier du soldat déchu"],
  "Fallen Soldier's Helm": ["Yelmo del soldado caído", "Heaume du soldat déchu"],
  "Fallen Sword": ["Espada caída", "Épée déchue"],
  "False Fallen": ["Falso caído", "Faux déchu"],
  "False Necromancer": ["Falso nigromante", "Faux nécromancien"],
  "False Winter": ["Falso invierno", "Faux hiver"],
  "Ferocious Ancient Wood Breastplate": ["Coraza feroz del Bosque Antiguo", "Plastron féroce du Bois Ancien"],
  "Fierce Amethyst Boots": ["Botas feroces de amatista", "Bottes féroces d'améthyste"],
  "Fierce Amethyst Breastplate": ["Coraza feroz de amatista", "Plastron féroce d'améthyste"],
  "Fierce Amethyst Helm": ["Yelmo feroz de amatista", "Heaume féroce d'améthyste"],
  "Fierce Amethyst Leggings": ["Calzas feroces de amatista", "Jambières féroces d'améthyste"],
  "Fierce Ancient Wood Leggings": ["Calzas feroces del Bosque Antiguo", "Jambières féroces du Bois Ancien"],
  "Fierce Rune": ["Runa feroz", "Rune féroce"],
  "Fir Powder": ["Polvo de abeto", "Poudre de sapin"],
  "Forgotten Shield": ["Escudo olvidado", "Bouclier oublié"],
  "Frostmar Necklace": ["Collar de Frostmar", "Collier de Frostmar"],
  "Goblin Blood": ["Sangre de goblin", "Sang de gobelin"],
  "Goblin Boots": ["Botas de goblin", "Bottes de gobelin"],
  "Goblin Eye": ["Ojo de goblin", "Œil de gobelin"],
  "Grainy Copper Belt": ["Cinturón de cobre granulado", "Ceinture de cuivre grenu"],
  "Granite Gloves": ["Guantes de granito", "Gants de granit"],
  "Granite Necklace": ["Collar de granito", "Collier de granit"],
  "Granite Ring": ["Anillo de granito", "Anneau de granit"],
  "Grimoire of the Dark Woods": ["Grimorio del Bosque Oscuro", "Grimoire de la Forêt Sombre"],
  "Guardian Boots": ["Botas del guardián", "Bottes du gardien"],
  "Guardian Breastplate": ["Coraza del guardián", "Plastron du gardien"],
  "Guardian Helmet": ["Casco del guardián", "Casque du gardien"],
  "Guardian Leggings": ["Calzas del guardián", "Jambières du gardien"],
  "Guardian Rune": ["Runa del guardián", "Rune du gardien"],
  "Guardian's Necklace": ["Collar del guardián", "Collier du gardien"],
  "Hammer of the Colossus": ["Martillo del coloso", "Marteau du colosse"],
  "Healing Crystal": ["Cristal de curación", "Cristal de soin"],
  "Heart of the Talisman": ["Corazón del talismán", "Cœur du talisman"],
  "Helm of the Fierce Ancient Woods": ["Yelmo feroz de los Bosques Antiguos", "Heaume féroce des Bois Anciens"],
  "Helmet of the Necromancer Assassin": ["Casco del asesino nigromante", "Casque de l'assassin nécromancien"],
  "Helmet of the Wild Ancient Woods": ["Casco salvaje de los Bosques Antiguos", "Casque sauvage des Bois Anciens"],
  "Herald Breastplate": ["Coraza del heraldo", "Plastron du héraut"],
  "Herald Helmet": ["Casco del heraldo", "Casque du héraut"],
  "Herald Leggings": ["Calzas del heraldo", "Jambières du héraut"],
  "Herald's Boots": ["Botas del heraldo", "Bottes du héraut"],
  "Heroic Katana": ["Katana heroica", "Katana héroïque"],
  "Honeyed Ring": ["Anillo de miel", "Anneau miellé"],
  "Howling Crossbow": ["Ballesta aullante", "Arbalète hurlante"],
  "Ika Boots": ["Botas de Ika", "Bottes d'Ika"],
  "Ika Leggings": ["Calzas de Ika", "Jambières d'Ika"],
  "Ika's Tunic": ["Túnica de Ika", "Tunique d'Ika"],
  "Illfang Axe": ["Hacha de Illfang", "Hache d'Illfang"],
  "Illfang Crystal": ["Cristal de Illfang", "Cristal d'Illfang"],
  "Intermediate Dagger": ["Daga intermedia", "Dague intermédiaire"],
  "Iron Amulet": ["Amuleto de hierro", "Amulette de fer"],
  "Iron Bracelet": ["Brazalete de hierro", "Bracelet de fer"],
  "Iron Gloves": ["Guantes de hierro", "Gants de fer"],
  "Iron Ring": ["Anillo de hierro", "Anneau de fer"],
  "Iron Sword": ["Espada de hierro", "Épée de fer"],
  "Key of the Fallen": ["Llave de los Caídos", "Clé des Déchus"],
  "Long Dark Dagger": ["Daga larga oscura", "Dague longue sombre"],
  "Magical Ancient Wood Leggings": ["Calzas mágicas del Bosque Antiguo", "Jambières magiques du Bois Ancien"],
  "Magical Ancient Woods Breastplate": ["Coraza mágica de los Bosques Antiguos", "Plastron magique des Bois Anciens"],
  "Magically Fallen Staff": ["Bastón de caída mágica", "Bâton de chute magique"],
  "Magician's Sandals": ["Sandalias de mago", "Sandales de mage"],
  "Magician's Staff": ["Bastón de mago", "Bâton de mage"],
  "Magician's Trousers": ["Pantalones de mago", "Pantalon de mage"],
  "Mana Crystal": ["Cristal de maná", "Cristal de mana"],
  "Mantle of the Misty Fangs": ["Manto de los Colmillos Brumosos", "Manteau des Crocs Brumeux"],
  "Marrow Powder": ["Polvo de médula", "Poudre de moelle"],
  "Mask of the Corrupted Rift": ["Máscara de la Grieta Corrupta", "Masque de la Faille Corrompue"],
  "Mask of the Necromancer": ["Máscara del nigromante", "Masque du nécromancien"],
  "Mask of the Tree of Remembrance": ["Máscara del Árbol del Recuerdo", "Masque de l'Arbre du Souvenir"],
  "Mask of the Web": ["Máscara de la telaraña", "Masque de la toile"],
  "Metal Axe": ["Hacha de metal", "Hache de métal"],
  "Metal Hoe": ["Azada de metal", "Houe de métal"],
  "Metal Pickaxe": ["Pico de metal", "Pioche de métal"],
  "Midnight Cloak": ["Capa de medianoche", "Cape de minuit"],
  "Misty Gloves": ["Guantes brumosos", "Gants brumeux"],
  "Misty Ring": ["Anillo brumoso", "Anneau brumeux"],
  "Moldy Bark": ["Corteza mohosa", "Écorce moisie"],
  "Nameless Ring": ["Anillo sin nombre", "Anneau sans nom"],
  "Narax's Ring": ["Anillo de Narax", "Anneau de Narax"],
  "Necromancer Archer Boots": ["Botas de arquero nigromante", "Bottes d'archer nécromancien"],
  "Necromancer Archer Helmet": ["Casco de arquero nigromante", "Casque d'archer nécromancien"],
  "Necromancer Archer Leggings": ["Calzas de arquero nigromante", "Jambières d'archer nécromancien"],
  "Necromancer Shaman Helmet": ["Casco de chamán nigromante", "Casque de chaman nécromancien"],
  "Necromancer Warrior Boots": ["Botas de guerrero nigromante", "Bottes de guerrier nécromancien"],
  "Necromancer Warrior Breastplate": ["Coraza de guerrero nigromante", "Plastron de guerrier nécromancien"],
  "Necromancer Warrior Leggings": ["Calzas de guerrero nigromante", "Jambières de guerrier nécromancien"],
  "Necromancer's Hammer": ["Martillo del nigromante", "Marteau du nécromancien"],
  "Necropolis Crossbow": ["Ballesta de la necrópolis", "Arbalète de la nécropole"],
  "Necrotic Hoe": ["Azada necrótica", "Houe nécrotique"],
  "Necrotic Pickaxe": ["Pico necrótico", "Pioche nécrotique"],
  "Ninja Boots": ["Botas ninja", "Bottes ninja"],
  "Ninja Leggings": ["Calzas ninja", "Jambières ninja"],
  "Ninja Tunic": ["Túnica ninja", "Tunique ninja"],
  "Nodachi Mage Staff": ["Bastón de mago nodachi", "Bâton de mage nodachi"],
  "Nodachi Shaman Staff": ["Bastón de chamán nodachi", "Bâton de chaman nodachi"],
  "Novice Belt": ["Cinturón de novato", "Ceinture de novice"],
  "Novice Gloves": ["Guantes de novato", "Gants de novice"],
  "Novice Necklace": ["Collar de novato", "Collier de novice"],
  "Oak Bark": ["Corteza de roble", "Écorce de chêne"],
  "Oak Powder": ["Polvo de roble", "Poudre de chêne"],
  "Occult Amulet": ["Amuleto oculto", "Amulette occulte"],
  "Occult Axe": ["Hacha oculta", "Hache occulte"],
  "Occult Band": ["Banda oculta", "Bande occulte"],
  "Occult Boots": ["Botas ocultas", "Bottes occultes"],
  "Occult Bracelet": ["Brazalete oculto", "Bracelet occulte"],
  "Occult Dagger": ["Daga oculta", "Dague occulte"],
  "Occult Gloves": ["Guantes ocultos", "Gants occultes"],
  "Occult Helmet": ["Casco oculto", "Casque occulte"],
  "Occult Hood": ["Capucha oculta", "Capuche occulte"],
  "Occult Ring": ["Anillo oculto", "Anneau occulte"],
  "Occult Robe": ["Túnica oculta", "Robe occulte"],
  "Occult Rune": ["Runa oculta", "Rune occulte"],
  "Orc Boots": ["Botas de orco", "Bottes d'orc"],
  "Orc Gloves": ["Guantes de orco", "Gants d'orc"],
  "Orc Mask": ["Máscara de orco", "Masque d'orc"],
  "Pact Ring": ["Anillo del pacto", "Anneau du pacte"],
  "Piece of bauxite": ["Pieza de bauxita", "Morceau de bauxite"],
  "Power Crystal": ["Cristal de poder", "Cristal de puissance"],
  "Powerful Dark Mage Staff": ["Bastón poderoso de mago oscuro", "Bâton puissant de mage sombre"],
  "Powerful Dark Shaman Staff": ["Bastón poderoso de chamán oscuro", "Bâton puissant de chaman sombre"],
  "Powerful Magically Fallen Staff": ["Bastón poderoso de caída mágica", "Bâton puissant de chute magique"],
  "Powerful Shaman Necromancer Staff": [
    "Bastón poderoso de nigromante chamán",
    "Bâton puissant de nécromancien chaman"
  ],
  "Powerful Wildly Fallen Staff": ["Bastón poderoso de caída salvaje", "Bâton puissant de chute sauvage"],
  "Pumba Ring": ["Anillo de Pumba", "Anneau de Pumba"],
  "Purple Spider Thread": ["Hilo de araña púrpura", "Fil d'araignée violet"],
  "Purse of 1000 Col": ["Bolsa de 1000 Col", "Bourse de 1000 Col"],
  "Purse of 2000 Col": ["Bolsa de 2000 Col", "Bourse de 2000 Col"],
  "Purse of 5000 Col": ["Bolsa de 5000 Col", "Bourse de 5000 Col"],
  "Purse of 75 Col": ["Bolsa de 75 Col", "Bourse de 75 Col"],
  "Red Christmas Mittens": ["Manoplas rojas de Navidad", "Moufles rouges de Noël"],
  "Red Eye Rune": ["Runa del ojo rojo", "Rune de l'œil rouge"],
  "Red Lantern": ["Linterna roja", "Lanterne rouge"],
  "Reinforced Hoe": ["Azada reforzada", "Houe renforcée"],
  "Reinforced Pickaxe": ["Pico reforzado", "Pioche renforcée"],
  "Resurrection Crystal": ["Cristal de resurrección", "Cristal de résurrection"],
  "Revenant Boots": ["Botas del aparecido", "Bottes du revenant"],
  "Ring of Golden Nectar": ["Anillo del néctar dorado", "Anneau du nectar doré"],
  "Ring of the Crushed Harpy": ["Anillo de la arpía aplastada", "Anneau de la harpie écrasée"],
  "Ring of the Drowned Harpy": ["Anillo de la arpía ahogada", "Anneau de la harpie noyée"],
  "Ring of the Flaming Harpy": ["Anillo de la arpía llameante", "Anneau de la harpie flamboyante"],
  "Ring of the Protective Sting": ["Anillo del aguijón protector", "Anneau du dard protecteur"],
  "Ring of the Thief": ["Anillo del ladrón", "Anneau du voleur"],
  "Ring of the Web": ["Anillo de la telaraña", "Anneau de la toile"],
  "Ring of the Woods": ["Anillo de los Bosques", "Anneau des Bois"],
  "Rugiboeuf's Horn": ["Cuerno de Rugiboeuf", "Corne de Rugiboeuf"],
  "Runic Honey Bracelet": ["Brazalete de miel rúnico", "Bracelet miellé runique"],
  "Runic Necklace": ["Collar rúnico", "Collier runique"],
  "Savannah Hoe": ["Azada de sabana", "Houe de savane"],
  "Savannah Pickaxe": ["Pico de sabana", "Pioche de savane"],
  "Scarlet Feather": ["Pluma escarlata", "Plume écarlate"],
  "Scepter of Love": ["Cetro del amor", "Sceptre de l'amour"],
  "Scrap Gloves": ["Guantes de chatarra", "Gants de ferraille"],
  "Scrap Metal Amulet": ["Amuleto de chatarra metálica", "Amulette de ferraille métallique"],
  "Scrap Piece": ["Pieza de chatarra", "Morceau de ferraille"],
  "Scrap Ring": ["Anillo de chatarra", "Anneau de ferraille"],
  "Sentinel Club": ["Garrote del centinela", "Massue de la sentinelle"],
  "Shaman Love Catalyst": ["Catalizador de amor del chamán", "Catalyseur d'amour du chaman"],
  "Shaman Necromancer Breastplate": ["Coraza de nigromante chamán", "Plastron de nécromancien chaman"],
  "Shaman Necromancer Leggings": ["Calzas de nigromante chamán", "Jambières de nécromancien chaman"],
  "Shaman Necromancer Staff": ["Bastón de nigromante chamán", "Bâton de nécromancien chaman"],
  "Shaman Necrotic Scepter": ["Cetro necrótico de chamán", "Sceptre nécrotique de chaman"],
  "Shaman Winter Catalyst": ["Catalizador de invierno del chamán", "Catalyseur d'hiver du chaman"],
  "Simple Belt": ["Cinturón simple", "Ceinture simple"],
  "Simple Boots": ["Botas simples", "Bottes simples"],
  "Simple Gloves": ["Guantes simples", "Gants simples"],
  "Skeleton Ring": ["Anillo de esqueleto", "Anneau de squelette"],
  "Skyblue Feather": ["Pluma azul cielo", "Plume bleu ciel"],
  "Sorcerer's Pants": ["Pantalones de hechicero", "Pantalon de sorcier"],
  "Sorcerer's Robe": ["Túnica de hechicero", "Robe de sorcier"],
  "Sorcerer's Sandals": ["Sandalias de hechicero", "Sandales de sorcier"],
  "Sorcerer's Staff": ["Bastón de hechicero", "Bâton de sorcier"],
  "Spectral Boots": ["Botas espectrales", "Bottes spectrales"],
  "Spectral Feather": ["Pluma espectral", "Plume spectrale"],
  "Spectral Gloves": ["Guantes espectrales", "Gants spectraux"],
  "Spectral Leggings": ["Calzas espectrales", "Jambières spectrales"],
  "Spectral Tunic": ["Túnica espectral", "Tunique spectrale"],
  "Spider Red Eyes": ["Ojos rojos de araña", "Yeux rouges d'araignée"],
  "Spider Thread": ["Hilo de araña", "Fil d'araignée"],
  "Staff of the Powerful Magician": ["Bastón del mago poderoso", "Bâton du mage puissant"],
  "Stamina Crystal": ["Cristal de resistencia", "Cristal d'endurance"],
  "Stamina I Potion": ["Poción de resistencia I", "Potion d'endurance I"],
  "Stamina II Potion": ["Poción de resistencia II", "Potion d'endurance II"],
  "Stamina III Potion": ["Poción de resistencia III", "Potion d'endurance III"],
  "Stamina IV Potion": ["Poción de resistencia IV", "Potion d'endurance IV"],
  "Stamina V Potion": ["Poción de resistencia V", "Potion d'endurance V"],
  "Stamina VI Potion": ["Poción de resistencia VI", "Potion d'endurance VI"],
  "Stolen Coat": ["Abrigo robado", "Manteau volé"],
  "Stone Bracelet": ["Brazalete de piedra", "Bracelet de pierre"],
  "Stone Gloves": ["Guantes de piedra", "Gants de pierre"],
  "Stone Necklace": ["Collar de piedra", "Collier de pierre"],
  "Stone Ring": ["Anillo de piedra", "Anneau de pierre"],
  "Strange Belt": ["Cinturón extraño", "Ceinture étrange"],
  "Sword of the Necromancer": ["Espada del nigromante", "Épée du nécromancien"],
  "Sylnovarian Fabric": ["Tela de Sylnovar", "Tissu de Sylnovar"],
  "Sylvaerian Fabric": ["Tela de Sylvaer", "Tissu de Sylvaer"],
  "Sylvester Bark": ["Corteza de Sylvester", "Écorce de Sylvester"],
  "Sylvester Mage Staff": ["Bastón de mago Sylvester", "Bâton de mage Sylvester"],
  "Sylvester Shaman Staff": ["Bastón de chamán Sylvester", "Bâton de chaman Sylvester"],
  "Tactical Boots": ["Botas tácticas", "Bottes tactiques"],
  "Tactical Leggings": ["Calzas tácticas", "Jambières tactiques"],
  "Tactical Tunic": ["Túnica táctica", "Tunique tactique"],
  "Talisman Seal": ["Sello del talismán", "Sceau du talisman"],
  "Taurus Belt": ["Cinturón de Taurus", "Ceinture de Taurus"],
  "Taurus Ring": ["Anillo de Taurus", "Anneau de Taurus"],
  "Tear of the Corrupted Rift": ["Lágrima de la Grieta Corrupta", "Larme de la Faille Corrompue"],
  "Teddy Bear Rune": ["Runa del osito de peluche", "Rune de l'ours en peluche"],
  "Thief Boots": ["Botas del ladrón", "Bottes du voleur"],
  "Thief's Amulet": ["Amuleto del ladrón", "Amulette du voleur"],
  "Thief's Gloves": ["Guantes del ladrón", "Gants du voleur"],
  "Thief's Hood": ["Capucha del ladrón", "Capuche du voleur"],
  "Titan Boots": ["Botas de titán", "Bottes de titan"],
  "Titan Breastplate": ["Coraza de titán", "Plastron de titan"],
  "Titan Helmet": ["Casco de titán", "Casque de titan"],
  "Titan Leggings": ["Calzas de titán", "Jambières de titan"],
  "Tolbana Resistant Shield": ["Escudo resistente de Tolbana", "Bouclier résistant de Tolbana"],
  "Tribe Belt": ["Cinturón de la tribu", "Ceinture de la tribu"],
  "Tricolor Necklace": ["Collar tricolor", "Collier tricolore"],
  "Unyielding Shield": ["Escudo inquebrantable", "Bouclier inflexible"],
  "Warrior Necromancer Helmet": ["Casco de nigromante guerrero", "Casque de nécromancien guerrier"],
  "Wild Ancient Woods Breastplate": ["Coraza salvaje de los Bosques Antiguos", "Plastron sauvage des Bois Anciens"],
  "Wild Ancient Woods Leggings": ["Calzas salvajes de los Bosques Antiguos", "Jambières sauvages des Bois Anciens"],
  "Wild Boar Broth": ["Caldo de jabalí salvaje", "Bouillon de sanglier sauvage"],
  "Wild Gloves": ["Guantes salvajes", "Gants sauvages"],
  "Wildly Fallen Staff": ["Bastón de caída salvaje", "Bâton de chute sauvage"],
  "Winter Hammer": ["Martillo del invierno", "Marteau de l'hiver"],
  "Winter Mage Spectre": ["Espectro de mago del invierno", "Spectre de mage de l'hiver"],
  "Winter Scepter Shaman": ["Chamán del cetro del invierno", "Chaman du sceptre de l'hiver"],
  "Winter Scythe": ["Guadaña del invierno", "Faux de l'hiver"],
  "Wolf Gloves": ["Guantes de lobo", "Gants de loup"],
  "Wood Amulet": ["Amuleto de madera", "Amulette de bois"],
  "Wood Gloves": ["Guantes de madera", "Gants de bois"],
  "Wood Rune": ["Runa de madera", "Rune de bois"],
  "Wooden Fishing Rod": ["Caña de pescar de madera", "Canne à pêche en bois"],
  "Woodfang Cloak": ["Capa de Colmillo de Madera", "Cape de Croc-de-Bois"],
  /* --- materials, mobs and loot names that the word-by-word pass left half translated
	   ("Jabalí Hide") or in English order ("Colossus Martillo"); curated as whole phrases so the
	   equipment-term pass, the quest requirements and the bestiary drops all agree --- */
  "Boar Hide": ["Piel de jabalí", "Peau de sanglier"],
  "Broken Violet Fragment": ["Fragmento de violeta roto", "Fragment de violette brisé"],
  "Bauxite Ore": ["Mineral de bauxita", "Minerai de bauxite"],
  "Coal Ore": ["Mineral de carbón", "Minerai de charbon"],
  "Colossus Hammer": ["Martillo del coloso", "Marteau du colosse"],
  "Copper Ore": ["Mineral de cobre", "Minerai de cuivre"],
  "Crumpled Notebook": ["Cuaderno arrugado", "Carnet froissé"],
  "Cursed Hoof Shard": ["Fragmento de pezuña maldita", "Éclat de sabot maudit"],
  "Gorbel Essence": ["Esencia de Gorbel", "Essence de Gorbel"],
  "Iron Ore": ["Mineral de hierro", "Minerai de fer"],
  "Juvenial Bark": ["Corteza juvenil", "Écorce juvénile"],
  "Magic Wook Shard": ["Fragmento de madera mágica", "Éclat de bois magique"],
  "Nymbréa's Heart": ["Corazón de Nymbréa", "Cœur de Nymbréa"],
  "Orichalcum Ingot": ["Lingote de oricalco", "Lingot d'orichalque"],
  "Ring Without Name": ["Anillo sin nombre", "Anneau sans nom"],
  "Scots Bark": ["Corteza de pino silvestre", "Écorce de pin sylvestre"],
  Sharkfish: ["Pez tiburón", "Poisson-requin"]
  /* end curated terminology */
};
Object.assign(equipmentTerminology, curatedTerminology);

const curatedProseTranslations = {
  "A rudimentary bow used by early shooters.": [
    "Un arco rudimentario utilizado por los primeros tiradores.",
    "Un arc rudimentaire utilisé par les premiers tireurs."
  ],
  "Very dilapidated dagger, even one blow on wood and the sword can be destroyed.": [
    "Una daga muy ruinosa; incluso un golpe contra la madera podría destruirla.",
    "Une dague très délabrée ; même un coup contre du bois pourrait la détruire."
  ],
  "An incomplete book brimming with magic.": [
    "Un libro incompleto rebosante de magia.",
    "Un livre incomplet débordant de magie."
  ],
  "An old shield. It's still pretty much stuck.": [
    "Un escudo viejo. Sigue estando bastante atascado.",
    "Un vieux bouclier. Il reste assez difficile à manier."
  ],
  "A harmless, but energy-carrying magical learning staff.": [
    "Un bastón de aprendizaje mágico inofensivo, pero cargado de energía.",
    "Un bâton d'apprentissage magique inoffensif, mais chargé d'énergie."
  ],
  "Forged for those who have yet to prove anything.": [
    "Forjada para quienes aún no han demostrado nada.",
    "Forgée pour ceux qui n'ont encore rien à prouver."
  ],
  "Small, slightly rusty sword perfect for training or to start your adventure.": [
    "Una espada pequeña y algo oxidada, perfecta para entrenar o comenzar la aventura.",
    "Une petite épée légèrement rouillée, parfaite pour s'entraîner ou commencer l'aventure."
  ],
  "Bow built with the help of Tier 1 Treants of Aincrad.": [
    "Arco fabricado con la ayuda de los treants de nivel 1 de Aincrad.",
    "Arc fabriqué avec l'aide des tréants de niveau 1 d'Aincrad."
  ],
  "Double iron axe created thanks to the wolves of the valley and with another ingredient.": [
    "Hacha doble de hierro creada gracias a los lobos del valle y a otro ingrediente.",
    "Hache double en fer créée grâce aux loups de la vallée et à un autre ingrédient."
  ],
  "A book forged from materials from a putrid and ancient swamp. It contains bestial magic.": [
    "Un libro forjado con materiales de un pantano antiguo y pútrido. Contiene magia bestial.",
    "Un livre forgé avec des matériaux provenant d'un marais ancien et putride. Il contient une magie bestiale."
  ],
  "A book forged from materials from a putrid and ancient swamp. It contains elemental magic.": [
    "Un libro forjado con materiales de un pantano antiguo y pútrido. Contiene magia elemental.",
    "Un livre forgé avec des matériaux provenant d'un marais ancien et putride. Il contient une magie élémentaire."
  ],
  "Standard for new recruits. Easy to handle, light and very reliable.": [
    "Equipo estándar para nuevas reclutas. Fácil de manejar, ligero y muy fiable.",
    "Équipement standard des nouvelles recrues. Facile à manier, léger et très fiable."
  ],
  "Iron sword created thanks to the wolves of the valley and with another ingredient.": [
    "Espada de hierro creada gracias a los lobos del valle y a otro ingrediente.",
    "Épée en fer créée grâce aux loups de la vallée et à un autre ingrédient."
  ],
  "This shield made of wood has a point in its center. He can take a few hits too.": [
    "Este escudo de madera tiene una punta en el centro. También puede soportar algunos golpes.",
    "Ce bouclier en bois possède une pointe en son centre. Il peut aussi encaisser quelques coups."
  ],
  "Thanks to Wooden Hearts and Enchanted Twigs, a staff is born.": [
    "Gracias a los corazones de madera y las ramitas encantadas, nace un bastón.",
    "Grâce aux cœurs de bois et aux brindilles enchantées, un bâton voit le jour."
  ],
  "A bandit's crossbow that becomes almost unusable after all this fighting.": [
    "Una ballesta de bandido que queda casi inutilizable después de tantos combates.",
    "Une arbalète de bandit qui devient presque inutilisable après tous ces combats."
  ],
  "Blunt dagger of a bandit after all these bloody fights.": [
    "La daga roma de un bandido después de todos estos combates sanglientos.",
    "Dague émoussée d'un bandit après tous ces combats sanglants."
  ],
  "Carved from the bones of a disgraced ancient warrior.": [
    "Tallada con los huesos de un antiguo guerrero deshonrado.",
    "Taillée dans les os d'un ancien guerrier déshonoré."
  ],
  "Small Dark dagger, forged with magical shards and other loot. She becomes formidable.": [
    "Pequeña daga oscura, forjada con fragmentos mágicos y otros botines. Se vuelve formidable.",
    "Petite dague sombre, forgée avec des éclats magiques et d'autres butins. Elle devient redoutable."
  ],
  "Bow to hunt powerful Tier 1 monsters.": [
    "Arco para cazar monstruos poderosos de nivel 1.",
    "Arc pour chasser de puissants monstres de niveau 1."
  ],
  "West Mines — Coordinates X: 984 Z: 3479. Gather Coal, Copper, and Iron.": [
    "Minas del Oeste — Coordenadas X: 984 Z: 3479. Reúne carbón, cobre y hierro.",
    "Mines de l'Ouest — Coordonnées X : 984 Z : 3479. Récupérez du charbon, du cuivre et du fer."
  ],
  "East Mines — Coordinates X: 2397 Z: 3498. Gather Coal, Copper, and Iron.": [
    "Minas del Este — Coordenadas X: 2397 Z: 3498. Reúne carbón, cobre y hierro.",
    "Mines de l'Est — Coordonnées X : 2397 Z : 3498. Récupérez du charbon, du cuivre et du fer."
  ],
  "Oak Forest — Coordinates X: 2457 Z: 4308. Gather Oak Wood.": [
    "Bosque de Robles — Coordenadas X: 2457 Z: 4308. Reúne madera de roble.",
    "Forêt de chênes — Coordonnées X : 2457 Z : 4308. Récupérez du bois de chêne."
  ],
  "A giant ancient baobab tree standing watch over the area.": [
    "Un enorme baobab antiguo que vigila la zona.",
    "Un immense baobab ancien qui veille sur la région."
  ],
  "A harsh desert known for its silver sands and dangerous predators.": [
    "Un desierto inhóspito conocido por sus arenas plateadas y depredadores peligrosos.",
    "Un désert hostile connu pour ses sables argentés et ses prédateurs dangereux."
  ],
  "A vibrant forest filled with lush foliage and winged creatures.": [
    "Un bosque vibrante lleno de vegetación frondosa y criaturas aladas.",
    "Une forêt luxuriante remplie de végétation et de créatures ailées."
  ],
  "A fragrant woodland alive with sweet flora and hidden paths.": [
    "Un bosque perfumado lleno de flora dulce y caminos ocultos.",
    "Un bois parfumé rempli d'une flore douce et de chemins cachés."
  ],
  "A quiet lake surrounded by rugged scenery and wild beasts.": [
    "Un lago tranquilo rodeado de paisajes escarpados y bestias salvajes.",
    "Un lac paisible entouré de paysages accidentés et de bêtes sauvages."
  ],
  "An ancient tomb filled with necromantic energies.": [
    "Una tumba antigua llena de energías nigrománticas.",
    "Une tombe ancienne remplie d'énergies nécromantiques."
  ],
  "A sacred sanctuary dedicated to the guardian Khesun.": [
    "Un santuario sagrado dedicado al guardián Khesun.",
    "Un sanctuaire sacré dédié au gardien Khesun."
  ],
  "Acacia bark, torn by time.": [
    "Corteza de acacia desgarrada por el paso del tiempo.",
    "Écorce d'acacia déchirée par le temps."
  ],
  "An orange necklace, with a pure core of honey.": [
    "Un collar naranja con un núcleo puro de miel.",
    "Un collier orange doté d'un cœur de miel pur."
  ],
  "Strong, reliable, perfect for basic manufacturing.": [
    "Fuerte y fiable, perfecto para la fabricación básica.",
    "Solide et fiable, parfait pour la fabrication de base."
  ],
  "Small wood powder made using acacia wood.": [
    "Pequeño polvo de madera hecho con madera de acacia.",
    "Petite poudre de bois fabriquée avec du bois d'acacia."
  ],
  "A ring carved from warm acacia wood, decorated with a copper stone with glowing reflections.": [
    "Un anillo tallado en cálida madera de acacia y decorado con una piedra de cobre de reflejos brillantes.",
    "Une bague taillée dans du bois d'acacia chaleureux et décorée d'une pierre de cuivre aux reflets lumineux."
  ],
  "A sturdy string woven from acacia fibers, and mixed with spider threads.": [
    "Una cuerda resistente tejida con fibras de acacia y mezclada con hilos de araña.",
    "Une ficelle robuste tressée avec des fibres d'acacia et mélangée à des fils d'araignée."
  ],
  "Forged long ago, this ring bears the mark of the kingdom's greatest adventurers.": [
    "Forjado hace mucho tiempo, este anillo lleva la marca de los mayores aventureros del reino.",
    "Forgée il y a longtemps, cette bague porte la marque des plus grands aventuriers du royaume."
  ],
  "An affordable belt with a practical design.": [
    "Un cinturón asequible con un diseño práctico.",
    "Une ceinture abordable au design pratique."
  ],
  "An affordable bracelet with a practical design.": [
    "Un brazalete asequible con un diseño práctico.",
    "Un bracelet abordable au design pratique."
  ],
  "An affordable pair of gloves, quite useful nonetheless.": [
    "Unos guantes asequibles, pero bastante útiles.",
    "Une paire de gants abordable, néanmoins très utile."
  ],
  "An affordable necklace with a modest, elegant look.": [
    "Un collar asequible con un aspecto modesto y elegante.",
    "Un collier abordable à l'allure modeste et élégante."
  ],
  "An affordable ring with a practical design.": [
    "Un anillo asequible con un diseño práctico.",
    "Une bague abordable au design pratique."
  ],
  "A massive fang imbued with his savage rage. Its essence is used to brew potions of formidable strength.": [
    "Un colmillo enorme imbuido de su furia salvaje. Su esencia se utiliza para preparar pociones de fuerza formidable.",
    "Un croc massif imprégné de sa rage sauvage. Son essence sert à préparer des potions d'une force redoutable."
  ],
  "Adorned with massive fangs, snatched from the alpha wolf Albal, dominant predator of the Valley of Wolves.": [
    "Adornado con enormes colmillos arrancados al lobo alfa Albal, depredador dominante del Valle de los Lobos.",
    "Orné de crocs massifs arrachés au loup alpha Albal, prédateur dominant de la Vallée des loups."
  ],
  "Beautiful purple flower widely used by many alchemists for vitality potions.": [
    "Una hermosa flor morada muy utilizada por muchos alquimistas para preparar pociones de vitalidad.",
    "Une magnifique fleur violette largement utilisée par de nombreux alchimistes pour les potions de vitalité."
  ],
  "Used to grow amber plates or for various recipes.": [
    "Se utiliza para cultivar placas de ámbar o para diversas recetas.",
    "Utilisée pour faire pousser des plaques d'ambre ou pour diverses recettes."
  ],
  "Amber sepal, rich in natural essence, used to strengthen elixirs and even certain potions.": [
    "Sépalo de ámbar, rico en esencia natural, utilizado para reforzar elixires e incluso ciertas pociones.",
    "Sépale d'ambre riche en essence naturelle, utilisé pour renforcer les élixirs et même certaines potions."
  ],
  "A tenacious and robust amulet to effectively protect your back.": [
    "Un amuleto tenaz y robusto para proteger eficazmente tu espalda.",
    "Une amulette tenace et robuste pour protéger efficacement votre dos."
  ],
  "A pair of gloves sculpted to provide resistance and help stand firm in combat.": [
    "Unos guantes diseñados para ofrecer resistencia y ayudar a mantenerse firme en combate.",
    "Une paire de gants conçue pour offrir de la résistance et aider à tenir bon au combat."
  ],
  "Forged from pure amethyst crystals, this armor radiates mystical power.": [
    "Forjada con cristales de amatista pura, esta armadura irradia poder místico.",
    "Forgée à partir de cristaux d'améthyste pure, cette armure rayonne d'un pouvoir mystique."
  ],
  "A ring carved to make it as tenacious as an amethyst.": [
    "Un anillo tallado para ser tan tenaz como una amatista.",
    "Une bague taillée pour être aussi tenace qu'une améthyste."
  ],
  "A shard of sharp amethyst.": ["Un fragmento de amatista afilado.", "Un éclat d'améthyste tranchant."],
  "A mineral with a captivating and magical purple hue.": [
    "Un mineral de tono morado cautivador y mágico.",
    "Un minéral aux teintes violettes captivantes et magiques."
  ],
  "A tenacious and robust amulet to face the mist and its dangers.": [
    "Un amuleto tenaz y robusto para enfrentarse a la niebla y sus peligros.",
    "Une amulette tenace et robuste pour affronter la brume et ses dangers."
  ],
  "A tenacious and robust amulet for quickly tracking down enemies.": [
    "Un amuleto tenaz y robusto para localizar rápidamente a los enemigos.",
    "Une amulette tenace et robuste pour traquer rapidement les ennemis."
  ],
  "Born in the heart of a corrupted rift, this amulet pulses with unstable and voracious magic.": [
    "Nacido en el corazón de una grieta corrupta, este amuleto palpita con una magia inestable y voraz.",
    "Née au cœur d'une faille corrompue, cette amulette palpite d'une magie instable et vorace."
  ],
  "A tenacious and sturdy amulet to harass dark enemies.": [
    "Un amuleto tenaz y resistente para acosar a los enemigos oscuros.",
    "Une amulette tenace et solide pour harceler les ennemis des ténèbres."
  ],
  "A tenacious and robust amulet to embrace and immobilize enemies.": [
    "Un amuleto tenaz y robusto para atrapar e inmovilizar a los enemigos.",
    "Une amulette tenace et robuste pour enlacer et immobiliser les ennemis."
  ],
  "A tenacious and sturdy amulet to crush enemies to the ground.": [
    "Un amuleto tenaz y resistente para aplastar a los enemigos contra el suelo.",
    "Une amulette tenace et solide pour écraser les ennemis au sol."
  ],
  "A tenacious and robust amulet to escape your enemies.": [
    "Un amuleto tenaz y robusto para escapar de tus enemigos.",
    "Une amulette tenace et robuste pour échapper à vos ennemis."
  ],
  "One of the three barks used as an offering to one of the gods present at Level 2!": [
    "¡Una de las tres cortezas utilizadas como ofrenda a uno de los dioses presentes en el nivel 2!",
    "L'une des trois écorces utilisées comme offrande à l'un des dieux présents au niveau 2 !"
  ],
  "A surprisingly brilliant cog when imagining its provenance.": [
    "Un engranaje sorprendentemente brillante considerando su procedencia.",
    "Un engrenage étonnamment brillant quand on imagine sa provenance."
  ],
  "A legendary essence of the Ancient Woods.": [
    "Una esencia legendaria de los Bosques Antiguos.",
    "Une essence légendaire des Bois anciens."
  ],
  "Crafted from ancient wood and enchanted moss, this armor vibrates to the rhythm of the forest.": [
    "Fabricada con madera antigua y musgo encantado, esta armadura vibra al ritmo del bosque.",
    "Fabriquée avec du bois ancien et de la mousse enchantée, cette armure vibre au rythme de la forêt."
  ],
  "Allows you to have a Key to the Elder Woods.": [
    "Permite obtener una llave de los Bosques Antiguos.",
    "Permet d'obtenir une clé des Bois anciens."
  ],
  "Brown stone with changing pinkish shades.": [
    "Piedra marrón con tonos rosados cambiantes.",
    "Pierre brune aux nuances rosées changeantes."
  ],
  "A clear bracelet made of andesite.": ["Un brazalete claro hecho de andesita.", "Un bracelet clair fait d'andésite."],
  "A practical pair of andesite gloves.": [
    "Unos guantes prácticos de andesita.",
    "Une paire de gants pratiques en andésite."
  ],
  "A simple andesite necklace.": ["Un collar sencillo de andesita.", "Un collier simple en andésite."],
  "A clear ring made of andesite.": ["Un anillo claro hecho de andesita.", "Une bague claire faite d'andésite."],
  "Dense black stone with brilliant luster.": [
    "Piedra negra y densa de brillo intenso.",
    "Pierre noire et dense au lustre éclatant."
  ],
  "Could debris from the bottom of an ancient lake be useful?": [
    "¿Podrían ser útiles estos escombros del fondo de un lago antiguo?",
    "Ces débris du fond d'un ancien lac pourraient-ils être utiles ?"
  ],
  "A flexible and strong jewel imbued with the power of the giant spider, which protects its wearer from sudden falls.":
    [
      "Una joya flexible y resistente imbuida del poder de la araña gigante, que protege a quien la lleva de las caídas repentinas.",
      "Un bijou souple et solide imprégné du pouvoir de l'araignée géante, qui protège son porteur des chutes soudaines."
    ],
  "The ruins of a forgotten castle, eaten away by time. Its collapsed walls still whisper the echoes of yesteryear. A place that even the light seems to flee.":
    [
      "Las ruinas de un castillo olvidado, devorado por el tiempo. Sus muros derrumbados aún susurran los ecos del pasado. Un lugar del que hasta la luz parece huir.",
      "Les ruines d'un château oublié, rongé par le temps. Ses murs effondrés murmurent encore les échos d'autrefois. Un lieu que même la lumière semble fuir."
    ],
  "A lone wolf with icy silver eyes. Its passage leaves a mist and silence.": [
    "Un lobo solitario de ojos plateados y helados. Su paso deja niebla y silencio.",
    "Un loup solitaire aux yeux argentés et glacés. Son passage laisse derrière lui brume et silence."
  ],
  "In the depths of Arakh'Nol, light struggles to break through. Each tree is knotted with thick, living webs. The whispers of the wind hide the whispers of ancient spirits, and those who stray from them rarely guess the stories being told. A forgotten entity weaves more than traps there.":
    [
      "En las profundidades de Arakh'Nol, la luz apenas logra abrirse paso. Cada árbol está cubierto de gruesas telarañas vivas. Los susurros del viento ocultan los de antiguos espíritus, y quienes se alejan rara vez imaginan las historias que se cuentan. Allí, una entidad olvidada teje algo más que trampas.",
      "Dans les profondeurs d'Arakh'Nol, la lumière peine à percer. Chaque arbre est noué de toiles épaisses et vivantes. Les murmures du vent cachent ceux d'anciens esprits, et ceux qui s'en écartent devinent rarement les histoires racontées. Une entité oubliée y tisse plus que des pièges."
    ],
  "A mysterious moonlit altar located at the heart of Map 2.": [
    "Un altar misterioso iluminado por la luna, situado en el corazón del mapa 2.",
    "Un autel mystérieux baigné par la lune, situé au cœur de la carte 2."
  ],
  "A shoreline biome where monsters gather along restless waves.": [
    "Un bioma costero donde los monstruos se reúnen junto a olas inquietas.",
    "Un biome côtier où les monstres se rassemblent le long de vagues agitées."
  ],
  "Take back items from Bulls and Bears.": [
    "Recupera objetos de los toros y los osos.",
    "Récupérez des objets auprès des taureaux et des ours."
  ],
  "Nestled between the steep peaks, Candelia seems frozen in time. Its lanterns flicker without wind, and the fields never wither. The ancients say that souls still whisper there at nightfall...":
    [
      "Enclavada entre picos escarpados, Candelia parece congelada en el tiempo. Sus faroles titilan sin viento y sus campos nunca se marchitan. Los antiguos dicen que las almas aún susurran allí al anochecer...",
      "Nichée entre de hauts sommets, Candelia semble figée dans le temps. Ses lanternes vacillent sans vent et ses champs ne dépérissent jamais. Les anciens disent que les âmes y murmurent encore à la tombée de la nuit..."
    ],
  "Perched at the top of a forgotten ridge, the hamlet of CastelBrume watches over the valley. Its mills howl in the icy mist, like a call to lost souls...":
    [
      "En lo alto de una cresta olvidada, la aldea de CastelBrume vigila el valle. Sus molinos aúllan en la niebla helada, como una llamada a las almas perdidas...",
      "Perché au sommet d'une crête oubliée, le hameau de CastelBrume veille sur la vallée. Ses moulins hurlent dans la brume glacée, comme un appel aux âmes perdues..."
    ],
  "Forged in stone and awakened by ancient magic, it guards forgotten lands against any intrusion. His steps alone make the forest shake...":
    [
      "Forjado en piedra y despertado por magia antigua, protege las tierras olvidadas de cualquier intrusión. Sus pasos bastan para hacer temblar el bosque...",
      "Forgé dans la pierre et réveillé par une magie ancienne, il protège les terres oubliées de toute intrusion. Ses seuls pas font trembler la forêt..."
    ],
  "This old mine contains crystals of exceptional purity. It is said that their brilliance is linked to human emotions... But some miners, fascinated, got lost there forever.":
    [
      "Esta antigua mina contiene cristales de pureza excepcional. Se dice que su brillo está ligado a las emociones humanas... Pero algunos mineros, fascinados, se perdieron allí para siempre.",
      "Cette ancienne mine contient des cristaux d'une pureté exceptionnelle. On dit que leur éclat est lié aux émotions humaines... Mais certains mineurs, fascinés, s'y sont perdus à jamais."
    ],
  "An ancient arena carved from red rock. It is said that a single eye still watches over it, ready to judge intruders by brute force.":
    [
      "Una antigua arena tallada en roca roja. Se dice que un ojo solitario aún la vigila, dispuesto a juzgar a los intrusos por la fuerza bruta.",
      "Une ancienne arène taillée dans la roche rouge. On dit qu'un œil solitaire la surveille encore, prêt à juger les intrus par la force brute."
    ],
  "Forged from bone and dark magic, this armor grants strength and protection.": [
    "Forjada con hueso y magia oscura, esta armadura otorga fuerza y protección.",
    "Forgée avec des os et de la magie sombre, cette armure confère force et protection."
  ],
  "Forged in the ruins of an ancient war fort, it still trembles from these ancient battles.": [
    "Forjado en las ruinas de un antiguo fuerte de guerra, aún tiembla por aquellas batallas pasadas.",
    "Forgé dans les ruines d'un ancien fort de guerre, il tremble encore du souvenir de ces batailles."
  ],
  "A fine billhook in golden and black hues, whose tapered blade evokes the deadly stinger of a bee.": [
    "Una elegante podadera de tonos dorados y negros, cuya hoja afilada recuerda al aguijón mortal de una abeja.",
    "Une élégante serpe aux teintes dorées et noires, dont la lame effilée évoque le dard mortel d'une abeille."
  ],
  "Light and flexible, this bee-inspired armor allows speed and precision, ideal for assassins.": [
    "Ligera y flexible, esta armadura inspirada en las abejas permite velocidad y precisión, ideal para asesinos.",
    "Légère et flexible, cette armure inspirée des abeilles favorise la vitesse et la précision, idéale pour les assassins."
  ],
  "A fine scythe with sharp lines, decorated with honeycomb patterns, evoking the precision and threat of a predatory insect.":
    [
      "Una elegante guadaña de líneas afiladas, decorada con motivos de panal que evocan la precisión y la amenaza de un insecto depredador.",
      "Une élégante faux aux lignes acérées, décorée de motifs en nid d'abeilles évoquant la précision et la menace d'un insecte prédateur."
    ],
  "A bracelet forged in Asterios's image, imbued with his ferocity and rage.": [
    "Un brazalete forjado a imagen de Asterios, imbuido de su ferocidad y su rabia.",
    "Un bracelet forgé à l'image d'Asterios, imprégné de sa férocité et de sa rage."
  ],
  "A blue feather with deep shimmers, seeming to capture the hue of the sky.": [
    "Una pluma azul de reflejos profundos que parece capturar el tono del cielo.",
    "Une plume bleue aux reflets profonds, semblant capturer la teinte du ciel."
  ],
  "Deep blue stone with dark reflections.": [
    "Piedra azul intensa con reflejos oscuros.",
    "Pierre d'un bleu profond aux reflets sombres."
  ],
  "These worn gloves bear the marks of countless thefts and impromptu confrontations.": [
    "Estos guantes gastados llevan las marcas de innumerables robos y enfrentamientos improvisados.",
    "Ces gants usés portent les marques d'innombrables larcins et affrontements improvisés."
  ],
  "A gold coin stolen by bandits used for various clandestine transactions.": [
    "Una moneda de oro robada por bandidos y utilizada en diversas transacciones clandestinas.",
    "Une pièce d'or volée par des bandits et utilisée pour diverses transactions clandestines."
  ],
  "Barley sugar with sugar. Gives an incredible Boost.": [
    "Azúcar de cebada con azúcar. Proporciona una mejora increíble.",
    "Sucre d'orge au sucre. Accorde un bonus incroyable."
  ],
  "Dense, fine-grained black rock.": ["Roca negra, densa y de grano fino.", "Roche noire, dense et à grain fin."],
  "Slip this kit onto a damaged tool to restore 25% of its maximum durability.": [
    "Coloca este kit en una herramienta dañada para restaurar el 25 % de su durabilidad máxima.",
    "Placez ce kit sur un outil endommagé pour restaurer 25 % de sa durabilité maximale."
  ],
  "An effective amulet, forged with bauxite. A strange energy emanates from it.": [
    "Un amuleto eficaz, forjado con bauxita. De él emana una energía extraña.",
    "Une amulette efficace, forgée avec de la bauxite. Une énergie étrange s'en dégage."
  ],
  "Forged with the bauxite that is forged on level 2.": [
    "Forjado con la bauxita que se obtiene en el nivel 2.",
    "Forgé avec la bauxite extraite au niveau 2."
  ],
  "A pair of gloves made from bauxite, shiny and strong like a ruby": [
    "Unos guantes hechos de bauxita, brillantes y resistentes como un rubí.",
    "Une paire de gants en bauxite, brillants et solides comme un rubis."
  ],
  "Pure, strong and lightweight bauxite ingot. Ideal for forging handy weapons or durable tools.": [
    "Lingote de bauxita puro, resistente y ligero. Ideal para forjar armas manejables o herramientas duraderas.",
    "Lingot de bauxite pur, solide et léger. Idéal pour forger des armes maniables ou des outils durables."
  ],
  "Forged in brilliant bauxite, this ring is distinguished by its power, its light color and its solidity.": [
    "Forjado con bauxita brillante, este anillo destaca por su poder, su color claro y su solidez.",
    "Forgée avec de la bauxite brillante, cette bague se distingue par sa puissance, sa couleur claire et sa solidité."
  ],
  "A belt made from bear resources.": [
    "Un cinturón fabricado con recursos de oso.",
    "Une ceinture fabriquée avec des ressources d'ours."
  ],
  "Sharp and curved, it testifies to the ferocity and strength of a formidable predator.": [
    "Afilado y curvado, da fe de la ferocidad y la fuerza de un depredador formidable.",
    "Tranchant et courbé, il témoigne de la férocité et de la force d'un prédateur redoutable."
  ],
  "Used for leather care or as fuel, this grease gives off a strong wild odor.": [
    "Utilizada para cuidar el cuero o como combustible, esta grasa desprende un fuerte olor salvaje.",
    "Utilisée pour entretenir le cuir ou comme combustible, cette graisse dégage une forte odeur sauvage."
  ],
  "A pair of gloves made from bear skin, located on level 2": [
    "Unos guantes hechos de piel de oso, disponibles en el nivel 2.",
    "Une paire de gants en peau d'ours, disponible au niveau 2."
  ],
  "Forged from a heavy, raw metal, it bears the mark of the wild bear. Brute strength and unfailing resistance.": [
    "Forjado con un metal pesado y sin refinar, lleva la marca del oso salvaje. Fuerza bruta y resistencia inquebrantable.",
    "Forgé dans un métal lourd et brut, il porte la marque de l'ours sauvage. Une force brute et une résistance infaillible."
  ],
  "A thick tanned fur, capable of resisting attacks and offering unrivaled warmth.": [
    "Una piel gruesa y curtida, capaz de resistir ataques y ofrecer un calor incomparable.",
    "Une fourrure épaisse et tannée, capable de résister aux attaques et d'offrir une chaleur inégalée."
  ],
  "A thick beast fur used by orcs.": [
    "Una piel gruesa de bestia utilizada por los orcos.",
    "Une épaisse fourrure de bête utilisée par les orques."
  ],
  "This catalyst is more powerful than it looks.": [
    "Este catalizador es más poderoso de lo que parece.",
    "Ce catalyseur est plus puissant qu'il n'en a l'air."
  ],
  "Thick and segmented, this shell effectively protects against attacks. Perfect for shaping equipment.": [
    "Grueso y segmentado, este caparazón protege eficazmente contra los ataques. Perfecto para fabricar equipo.",
    "Épaisse et segmentée, cette carapace protège efficacement contre les attaques. Parfaite pour façonner de l'équipement."
  ],
  "Barely protects against a blade, but it's still better than nothing.": [
    "Apenas protege contra una hoja, pero sigue siendo mejor que nada.",
    "Elle protège à peine contre une lame, mais c'est toujours mieux que rien."
  ],
  "Small wood powder made using birch wood.": [
    "Pequeño polvo de madera hecho con madera de abedul.",
    "Petite poudre de bois fabriquée avec du bois de bouleau."
  ],
  "A ring crafted from light birch wood, set with a raw ironstone with a dark, metallic heart.": [
    "Un anillo fabricado con madera clara de abedul y engastado con una piedra de hierro en bruto de corazón oscuro y metálico.",
    "Une bague fabriquée en bois clair de bouleau, sertie d'une pierre de fer brut au cœur sombre et métallique."
  ],
  "A sturdy string woven from birch fibers and mixed with spider threads.": [
    "Una cuerda resistente tejida con fibras de abedul y mezclada con hilos de araña.",
    "Une ficelle robuste tressée avec des fibres de bouleau et mélangée à des fils d'araignée."
  ],
  "A hard, dark fragment of bone, marked by time and death.": [
    "Un fragmento de hueso duro y oscuro, marcado por el tiempo y la muerte.",
    "Un fragment d'os dur et sombre, marqué par le temps et la mort."
  ],
  "Incredibly light black boots infused with magic.": [
    "Botas negras increíblemente ligeras e imbuidas de magia.",
    "Des bottes noires incroyablement légères, imprégnées de magie."
  ],
  "A black spider carcass.": ["El cadáver de una araña negra.", "Une carcasse d'araignée noire."],
  "A small luminous lantern with a mysterious and captivating aura.": [
    "Una pequeña linterna luminosa con un aura misteriosa y cautivadora.",
    "Une petite lanterne lumineuse à l'aura mystérieuse et captivante."
  ],
  "A black spider mandible.": ["Una mandíbula de araña negra.", "Une mandibule d'araignée noire."],
  "A fine dark powder, made from ancient crushed bones, imbued with a sinister aura.": [
    "Un fino polvo oscuro hecho de huesos antiguos triturados, imbuido de un aura siniestra.",
    "Une fine poudre sombre, faite d'os anciens broyés et imprégnée d'une aura sinistre."
  ],
  "Forged in darkness by the legendary Magnus, this shield absorbs blows with supernatural strength. Its immense weight slows down its wearer but offers unparalleled protection.":
    [
      "Forjado en la oscuridad por el legendario Magnus, este escudo absorbe los golpes con fuerza sobrenatural. Su peso inmenso ralentiza a quien lo lleva, pero ofrece una protección incomparable.",
      "Forgé dans les ténèbres par le légendaire Magnus, ce bouclier absorbe les coups avec une force surnaturelle. Son poids immense ralentit son porteur, mais offre une protection inégalée."
    ],
  "Deep, pure black crystal.": ["Cristal negro intenso y puro.", "Cristal noir profond et pur."],
  "A black spider thread.": ["Un hilo de araña negra.", "Un fil d'araignée noire."],
  "A blank parchment where the enchanted inscriptions have disappeared over time.": [
    "Un pergamino en blanco cuyas inscripciones encantadas han desaparecido con el tiempo.",
    "Un parchemin vierge dont les inscriptions enchantées ont disparu avec le temps."
  ],
  "An intense red feather with fiery nuances, evoking the heat of a living flame.": [
    "Una pluma roja intensa con matices de fuego, que evoca el calor de una llama viva.",
    "Une plume rouge intense aux nuances ardentes, évoquant la chaleur d'une flamme vivante."
  ],
  "A pair of mittens decorated with a winter pattern and designed to keep hands warm even in cold areas.": [
    "Unas manoplas decoradas con un motivo invernal y diseñadas para mantener las manos calientes incluso en zonas frías.",
    "Une paire de moufles décorées d'un motif hivernal, conçues pour garder les mains au chaud même dans les régions froides."
  ],
  "Usable for basic tannery.": ["Utilizable para el curtido básico.", "Utilisable pour le tannage de base."],
  "Their crude structure roughly protects the hands while recalling the macabre origin of their materials.": [
    "Su estructura rudimentaria protege las manos de forma limitada y recuerda el origen macabro de sus materiales.",
    "Leur structure rudimentaire protège sommairement les mains tout en rappelant l'origine macabre de leurs matériaux."
  ],
  "A thin bow with harmonious curves, decorated with ribbons and heart motifs.": [
    "Un arco delgado de curvas armoniosas, decorado con cintas y motivos de corazones.",
    "Un arc fin aux courbes harmonieuses, décoré de rubans et de motifs en forme de cœur."
  ],
  "Emblem of a war machine, transmits the orders of a forgotten king.": [
    "Emblema de una máquina de guerra que transmite las órdenes de un rey olvidado.",
    "Emblème d'une machine de guerre, il transmet les ordres d'un roi oublié."
  ],
  "A simple strip of iron, forged and gelled with slime.": [
    "Una simple tira de hierro, forjada y gelificada con slime.",
    "Une simple bande de fer, forgée et gélifiée avec du slime."
  ],
  "A sturdy bracelet designed for hunting dark foes.": [
    "Un brazalete resistente diseñado para cazar enemigos oscuros.",
    "Un bracelet robuste conçu pour chasser les ennemis des ténèbres."
  ],
  "A sturdy bracelet built to withstand the dangers of the wild.": [
    "Un brazalete resistente creado para soportar los peligros de la naturaleza.",
    "Un bracelet robuste conçu pour résister aux dangers de la nature sauvage."
  ],
  "A brown spider carcass.": ["El cadáver de una araña marrón.", "Une carcasse d'araignée brune."],
  "A brown spider mandible.": ["Una mandíbula de araña marrón.", "Une mandibule d'araignée brune."],
  "A brown spider thread.": ["Un hilo de araña marrón.", "Un fil d'araignée brune."],
  "Weight of a soulless war, terrifying and cutting through all forms of life.": [
    "El peso de una guerra sin alma, aterrador y capaz de atravesar toda forma de vida.",
    "Le poids d'une guerre sans âme, terrifiant et capable de trancher toute forme de vie."
  ],
  "A pair of gloves fluctuating from the souls of its victims, dead and forgotten.": [
    "Unos guantes que fluctúan con las almas de sus víctimas, muertas y olvidadas.",
    "Une paire de gants qui fluctuent avec les âmes de leurs victimes, mortes et oubliées."
  ],
  "A soul that is always looking for a target. Found, lost and snatched.": [
    "Un alma que siempre busca un objetivo. Encontrada, perdida y arrebatada.",
    "Une âme toujours à la recherche d'une cible. Trouvée, perdue et arrachée."
  ],
  "An ancient and mysterious ring used to measure the souls of the beings around it.": [
    "Un anillo antiguo y misterioso utilizado para medir las almas de los seres que lo rodean.",
    "Une bague ancienne et mystérieuse utilisée pour mesurer les âmes des êtres qui l'entourent."
  ],
  "Balls of different metals welded together over the centuries, refusing to give in to the erosion of time.": [
    "Bolas de distintos metales soldadas durante siglos, decididas a resistir la erosión del tiempo.",
    "Des boules de différents métaux soudées au fil des siècles, refusant de céder à l'érosion du temps."
  ],
  "Wearing this helmet is like feeling something spinning, behind your temples, without ever stopping.": [
    "Llevar este casco es como sentir algo girando detrás de las sienes sin detenerse jamás.",
    "Porter ce casque revient à sentir quelque chose tourner derrière les tempes, sans jamais s'arrêter."
  ],
  "Soulless blade, sharp and capable of absorbing the life of the deceased.": [
    "Hoja sin alma, afilada y capaz de absorber la vida de los muertos.",
    "Lame sans âme, acérée et capable d'absorber la vie des défunts."
  ],
  "Rotates silently, without friction. Those who wear it disappear before even moving, drained of their soul.": [
    "Gira en silencio y sin fricción. Quienes lo llevan desaparecen antes de moverse, drenados de su alma.",
    "Il tourne en silence, sans friction. Ceux qui le portent disparaissent avant même de bouger, vidés de leur âme."
  ],
  "An austere scythe with sepulchral runes whose black blade evokes ancient rites and forces beyond the grave.": [
    "Una guadaña austera con runas sepulcrales cuya hoja negra evoca antiguos ritos y fuerzas más allá de la tumba.",
    "Une faux austère aux runes sépulcrales, dont la lame noire évoque d'anciens rites et des forces venues d'au-delà de la tombe."
  ],
  "Its massive size symbolizes the weight of judgment brought to bear on the living.": [
    "Su tamaño descomunal simboliza el peso del juicio impuesto a los vivos.",
    "Sa taille imposante symbolise le poids du jugement qui s'abat sur les vivants."
  ],
  "A sturdy string braided from a pure onyx alloy, and mixed with spider threads.": [
    "Una cuerda resistente trenzada con una aleación de ónice puro y mezclada con hilos de araña.",
    "Une ficelle robuste tressée avec un alliage d'onyx pur et mélangée à des fils d'araignée."
  ],
  "A strong string woven from a bauxite alloy, and mixed with spider threads.": [
    "Una cuerda resistente tejida con una aleación de bauxita y mezclada con hilos de araña.",
    "Une ficelle solide tressée avec un alliage de bauxite et mélangée à des fils d'araignée."
  ],
  "This rudimentary necklace is decorated with a bull's claw securely attached by a thick leather link.": [
    "Este collar rudimentario está decorado con una garra de toro fijada con un grueso eslabón de cuero.",
    "Ce collier rudimentaire est décoré d'une griffe de taureau solidement fixée par un gros maillon de cuir."
  ],
  "Small wood powder made using fir wood.": [
    "Pequeño polvo de madera hecho con madera de abeto.",
    "Petite poudre de bois fabriquée avec du bois de sapin."
  ],
  "A sturdy twine braided from fir fibers, and mixed with spider threads.": [
    "Una cuerda resistente trenzada con fibras de abeto y mezclada con hilos de araña.",
    "Une ficelle robuste tressée avec des fibres de sapin et mélangée à des fils d'araignée."
  ],
  "A glowing feather, vibrating with magical energy. Used by craftsmen.": [
    "Una pluma brillante que vibra con energía mágica. Utilizada por los artesanos.",
    "Une plume lumineuse vibrant d'énergie magique. Utilisée par les artisans."
  ],
  "Translucent purple crystal with cubic facets.": [
    "Cristal morado translúcido con facetas cúbicas.",
    "Cristal violet translucide aux facettes cubiques."
  ],
  "A flying spider wing.": ["Un ala de araña voladora.", "Une aile d'araignée volante."],
  "Can be used to access the dungeon: Geldorak Mine.": [
    "Puede utilizarse para acceder a la mazmorra: Mina de Geldorak.",
    "Peut être utilisée pour accéder au donjon : Mine de Geldorak."
  ],
  "Eroded by time and dust, this shield was lost throughout time in dimensions.": [
    "Erosionado por el tiempo y el polvo, este escudo se perdió durante eras entre dimensiones.",
    "Érodé par le temps et la poussière, ce bouclier s'est perdu à travers les dimensions au fil des âges."
  ],
  "The power of the ancients is felt through this fragment.": [
    "El poder de los antiguos se percibe a través de este fragmento.",
    "Le pouvoir des anciens se ressent à travers ce fragment."
  ],
  "A fine icy powder harvested from ice creatures.": [
    "Un fino polvo helado obtenido de criaturas de hielo.",
    "Une fine poudre glacée récoltée sur des créatures de glace."
  ],
  "A liquid sparkling like a diamond. It's not healing, it's accepting happiness.": [
    "Un líquido que brilla como un diamante. No cura: acepta la felicidad.",
    "Un liquide étincelant comme un diamant. Il ne soigne pas, il accueille le bonheur."
  ],
  "A carved stone, solid as ice, embedded in a necklace referencing Grivelmar, a stronghold that was long forgotten.": [
    "Una piedra tallada, sólida como el hielo, engastada en un collar relacionado con Grivelmar, una fortaleza olvidada hace mucho tiempo.",
    "Une pierre taillée, solide comme la glace, sertie dans un collier faisant référence à Grivelmar, une forteresse oubliée depuis longtemps."
  ],
  "Deep red crystal with dark facets.": [
    "Cristal rojo intenso con facetas oscuras.",
    "Cristal rouge profond aux facettes sombres."
  ],
  "A carefully wrapped present, decorated with ribbons and heart motifs, charged with a tender intention.": [
    "Un regalo cuidadosamente envuelto, decorado con cintas y motivos de corazones, cargado de una tierna intención.",
    "Un cadeau soigneusement emballé, décoré de rubans et de motifs de cœurs, chargé d'une tendre intention."
  ],
  "A pair of gloves carved to reinforce the dark energy of the woods.": [
    "Unos guantes tallados para reforzar la energía oscura de los bosques.",
    "Une paire de gants taillée pour renforcer l'énergie sombre des bois."
  ],
  "An amulet carved from simple iron, fused with an essence of slime.": [
    "Un amuleto tallado en hierro sencillo y fusionado con una esencia de slime.",
    "Une amulette taillée dans du fer simple, fusionnée avec une essence de slime."
  ],
  "A frame used by goblins.": ["Una estructura utilizada por los goblins.", "Une structure utilisée par les gobelins."],
  "Goblin blood, used for various reasons.": [
    "Sangre de goblin utilizada por diversos motivos.",
    "Sang de gobelin utilisé pour diverses raisons."
  ],
  "An absorbed goblin essence.": ["Una esencia de goblin absorbida.", "Une essence de gobelin absorbée."],
  "A goblin eye torn out during a fight.": [
    "Un ojo de goblin arrancado durante un combate.",
    "Un œil de gobelin arraché lors d'un combat."
  ],
  "A valuable luminous piece, bringing luck and prosperity.": [
    "Una valiosa pieza luminosa que trae suerte y prosperidad.",
    "Une précieuse pièce lumineuse apportant chance et prospérité."
  ],
  "A rough copper belt with a surprisingly elegant look.": [
    "Un cinturón de cobre tosco con un aspecto sorprendentemente elegante.",
    "Une ceinture de cuivre brute à l'allure étonnamment élégante."
  ],
  "A grainy bracelet made of copper.": [
    "Un brazalete de cobre de textura granulada.",
    "Un bracelet de cuivre granuleux."
  ],
  "A grainy ring made of copper.": ["Un anillo de cobre de textura granulada.", "Une bague de cuivre granuleuse."],
  "A robust bracelet made of granite.": ["Un brazalete robusto hecho de granito.", "Un bracelet robuste en granit."],
  "A sturdy pair of granite gloves.": [
    "Unos guantes resistentes de granito.",
    "Une paire de gants robustes en granit."
  ],
  "A simple granite necklace.": ["Un collar sencillo de granito.", "Un collier simple en granit."],
  "A sturdy ring made of granite.": ["Un anillo resistente hecho de granito.", "Une bague robuste en granit."],
  "A grimoire with a dark and ancient history.": [
    "Un grimorio con una historia oscura y antigua.",
    "Un grimoire à l'histoire sombre et ancienne."
  ],
  "A skeletal necklace, worn by the guardian of the shrine.": [
    "Un collar de esqueleto llevado por el guardián del santuario.",
    "Un collier squelettique porté par le gardien du sanctuaire."
  ],
  "Fresh from the forge, this blade embodies the ideal of the protector.": [
    "Recién salida de la forja, esta hoja encarna el ideal del protector.",
    "Fraîchement sortie de la forge, cette lame incarne l'idéal du protecteur."
  ],
  "An old bracelet whose inscriptions undulate slightly, as if stirred by an invisible wind.": [
    "Un brazalete antiguo cuyas inscripciones ondulan ligeramente, como agitadas por un viento invisible.",
    "Un vieux bracelet dont les inscriptions ondulent légèrement, comme agitées par un vent invisible."
  ],
  "A massive hammer embellished with amorous symbols, contrasting power and delicacy.": [
    "Un martillo enorme adornado con símbolos amorosos que contrastan poder y delicadeza.",
    "Un marteau massif orné de symboles amoureux, contrastant puissance et délicatesse."
  ],
  "Crushing, striking, stunning weight like the stinger of an angry bee.": [
    "Un peso aplastante, contundente y aturdidor, como el aguijón de una abeja enfurecida.",
    "Un poids écrasant, percutant et étourdissant, comme le dard d'une abeille en colère."
  ],
  "Restores your HP immediately and applies a 30-minute recharge to all crystals.": [
    "Restaura tus HP inmediatamente y aplica una recarga de 30 minutos a todos los cristales.",
    "Restaure immédiatement vos PV et applique un temps de recharge de 30 minutes à tous les cristaux."
  ],
  "Still burning and charged with aquatic magic, this heart sparkles with ancient energy.": [
    "Aún ardiente y cargado de magia acuática, este corazón resplandece con energía ancestral.",
    "Encore brûlant et chargé de magie aquatique, ce cœur scintille d'une énergie ancestrale."
  ],
  "Grayish stone with metallic reflections.": [
    "Piedra grisácea con reflejos metálicos.",
    "Pierre grisâtre aux reflets métalliques."
  ],
  "Very powerful dagger made from enchanted metal and soul, light and easy to handle.": [
    "Daga muy poderosa hecha de metal encantado y alma, ligera y fácil de manejar.",
    "Dague très puissante faite de métal enchanté et d'âme, légère et facile à manier."
  ],
  "Very powerful katana made from enchanted metal and soul, sharp and easy to wield.": [
    "Katana muy poderosa hecha de metal encantado y alma, afilada y fácil de manejar.",
    "Katana très puissant fait de métal enchanté et d'âme, tranchant et facile à manier."
  ],
  "A hidden blade, used by bandits to stealthily attack their enemies.": [
    "Una hoja oculta utilizada por bandidos para atacar sigilosamente a sus enemigos.",
    "Une lame dissimulée utilisée par les bandits pour attaquer leurs ennemis furtivement."
  ],
  "Forged from shells, this armor provides strength and protection.": [
    "Forjada con caparazones, esta armadura proporciona fuerza y protección.",
    "Forgée à partir de carapaces, cette armure offre force et protection."
  ],
  "Sticky, sweet remains, often infused with pollen and floral scents.": [
    "Restos pegajosos y dulces, a menudo impregnados de polen y aromas florales.",
    "Des résidus collants et sucrés, souvent imprégnés de pollen et de senteurs florales."
  ],
  "This applied rune allows equipment with free rune slots to obtain stats.": [
    "Esta runa aplicada permite que el equipo con ranuras de runa libres obtenga estadísticas.",
    "Cette rune appliquée permet à l'équipement disposant d'emplacements de runes libres d'obtenir des statistiques."
  ],
  "Dense, gritty grayish rock.": ["Roca grisácea, densa y granulosa.", "Roche grisâtre, dense et granuleuse."],
  "A catalyst delicately adorned with hearts and pink gems, diffusing a soft, romantic glow.": [
    "Un catalizador delicadamente adornado con corazones y gemas rosas que difunde un brillo suave y romántico.",
    "Un catalyseur délicatement orné de cœurs et de gemmes roses, diffusant une lueur douce et romantique."
  ],
  "A dark staff set with a dark orb, engraved with funerary symbols related to the forbidden arts.": [
    "Un bastón oscuro engastado con una esfera oscura y grabado con símbolos funerarios relacionados con las artes prohibidas.",
    "Un bâton sombre serti d'un orbe sombre et gravé de symboles funéraires liés aux arts interdits."
  ],
  "A scepter was forged through unconventional ritual, embodying the power of the necromancer to whom it belonged.": [
    "Un cetro forjado mediante un ritual poco convencional, que encarna el poder del nigromante al que perteneció.",
    "Un sceptre forgé au cours d'un rituel inhabituel, incarnant le pouvoir du nécromancien auquel il appartenait."
  ],
  "She carries the weight of all the children's happiness, and the smell of the cupcakes.": [
    "Lleva el peso de la felicidad de todos los niños y el aroma de los cupcakes.",
    "Elle porte le poids du bonheur de tous les enfants et l'odeur des cupcakes."
  ],
  "A magical item allowing the opening of chests fallen in Aincrad.": [
    "Un objeto mágico que permite abrir los cofres caídos en Aincrad.",
    "Un objet magique permettant d'ouvrir les coffres tombés en Aincrad."
  ],
  "Quite a rare ingredient for high alchemy or something else?": [
    "¿Un ingrediente bastante raro para la alquimia avanzada o para algo más?",
    "Un ingrédient assez rare pour la haute alchimie ou autre chose ?"
  ],
  "A flame, burning every soul in a fiery and violent way, at the end of an old stick.": [
    "Una llama que quema cada alma de forma ardiente y violenta en el extremo de un palo viejo.",
    "Une flamme brûlant chaque âme de manière ardente et violente au bout d'un vieux bâton."
  ],
  "This book was forged using powerful Tier 1 materials. It embodies the power of a magician.": [
    "Este libro fue forjado con materiales poderosos de nivel 1. Encarna el poder de un mago.",
    "Ce livre a été forgé avec de puissants matériaux de niveau 1. Il incarne le pouvoir d'un mage."
  ],
  "Clothing from another age, embroidered with magical threads. It was once worn by a legendary magician.": [
    "Ropa de otra época, bordada con hilos mágicos. Perteneció a un mago legendario.",
    "Des vêtements d'une autre époque, brodés de fils magiques. Ils furent autrefois portés par un mage légendaire."
  ],
  "Forged in the heart of a silent storm. This staff vibrates with a celestial and powerful energy.": [
    "Forjado en el corazón de una tormenta silenciosa. Este bastón vibra con una energía celestial y poderosa.",
    "Forgé au cœur d'une tempête silencieuse. Ce bâton vibre d'une énergie céleste et puissante."
  ],
  "A majestic essence, a powerful and legendary energy resides there.": [
    "Una esencia majestuosa que alberga una energía poderosa y legendaria.",
    "Une essence majestueuse qui renferme une énergie puissante et légendaire."
  ],
  "Green stone with dark and light bands.": [
    "Piedra verde con bandas claras y oscuras.",
    "Pierre verte aux bandes claires et sombres."
  ],
  "A beautiful whitish powder with a mineral odor, possibly used in certain rituals.": [
    "Un hermoso polvo blanquecino con olor mineral, posiblemente utilizado en ciertos rituales.",
    "Une belle poudre blanchâtre à l'odeur minérale, peut-être utilisée dans certains rituels."
  ],
  "This scarlet liquid is purified blood. This is not healing, it is acceptance of sacrifice.": [
    "Este líquido escarlata es sangre purificada. No cura: representa la aceptación del sacrificio.",
    "Ce liquide écarlate est du sang purifié. Il ne soigne pas, il représente l'acceptation du sacrifice."
  ],
  "Forged near a corrupted rift, this mask radiates an aggressive mystical force.": [
    "Forjada cerca de una grieta corrupta, esta máscara irradia una fuerza mística agresiva.",
    "Forgé près d'une faille corrompue, ce masque rayonne d'une force mystique agressive."
  ],
  "An ancient wooden mask. When worn, whispers ring in the ear.": [
    "Una máscara de madera antigua. Al llevarla, susurros resuenan en el oído.",
    "Un masque en bois ancien. Lorsqu'on le porte, des murmures résonnent à l'oreille."
  ],
  "A mask from the web faction, as unpredictable as the spiders that inspired it.": [
    "Una máscara de la facción de las telarañas, tan impredecible como las arañas que la inspiraron.",
    "Un masque de la faction des toiles, aussi imprévisible que les araignées qui l'ont inspiré."
  ],
  "A medium purse containing gold stolen by bandits.": [
    "Una bolsa mediana que contiene oro robado por bandidos.",
    "Une bourse moyenne contenant de l'or volé par des bandits."
  ],
  "Delicate fusion between the Violet Broken Fragments. Useful for Reaper armor.": [
    "Fusión delicada entre los fragmentos violetas rotos. Útil para la armadura del segador.",
    "Fusion délicate entre les fragments violets brisés. Utile pour l'armure du faucheur."
  ],
  "A very strong axe, perfect for breaking more resistant logs.": [
    "Un hacha muy resistente, perfecta para romper troncos más duros.",
    "Une hache très solide, parfaite pour briser les bûches les plus résistantes."
  ],
  "This new hoe is perfect for helping you harvest rarer flowers.": [
    "Esta nueva azada es perfecta para ayudarte a recolectar flores más raras.",
    "Cette nouvelle houe est parfaite pour vous aider à récolter des fleurs plus rares."
  ],
  "A very solid pickaxe, perfect for mining more solid ores.": [
    "Un pico muy resistente, perfecto para extraer minerales más duros.",
    "Une pioche très solide, parfaite pour extraire des minerais plus résistants."
  ],
  "Small metal scrap, with other ingredients it is possible to make Metal Soul Ingots.": [
    "Pequeño fragmento de metal; con otros ingredientes es posible fabricar lingotes de alma metálica.",
    "Petit morceau de métal ; avec d'autres ingrédients, il est possible de fabriquer des lingots d'âme métallique."
  ],
  "Mysterious and dark cloak, obtained after conquering the tower of the fearsome kobold Illfang. It is said to help hide the presence of its wearer.":
    [
      "Capa misteriosa y oscura, obtenida tras conquistar la torre del temible kobold Illfang. Se dice que ayuda a ocultar la presencia de quien la lleva.",
      "Cape mystérieuse et sombre, obtenue après la conquête de la tour du redoutable kobold Illfang. On dit qu'elle aide à dissimuler la présence de son porteur."
    ],
  "A real pure onyx ore. Transformed into an ingot, it allows you to create large weapons such as no one has seen before!":
    [
      "Un verdadero mineral de ónice puro. Transformado en lingote, permite crear grandes armas como nunca se han visto.",
      "Un véritable minerai d'onyx pur. Transformé en lingot, il permet de créer de grandes armes encore jamais vues !"
    ],
  "A fairly fine and precise misty knife.": [
    "Un cuchillo brumoso bastante fino y preciso.",
    "Un couteau brumeux assez fin et précis."
  ],
  "A misty wolf claw.": ["Una garra de lobo brumoso.", "Une griffe de loup brumeux."],
  "Misty wolf fur.": ["Piel de lobo brumoso.", "Fourrure de loup brumeux."],
  "A pair of gloves carved to serve the young mist.": [
    "Unos guantes tallados para servir a la joven niebla.",
    "Une paire de gants sculptée pour servir la jeune brume."
  ],
  "A ring carved to serve the fangs of the mysterious mist.": [
    "Un anillo tallado para servir a los colmillos de la misteriosa niebla.",
    "Une bague sculptée pour servir les crocs de la mystérieuse brume."
  ],
  "A misty wolf tail.": ["Una cola de lobo brumoso.", "Une queue de loup brumeux."],
  "A piece of thick, rigid hide, useful for sturdy armor.": [
    "Un trozo de piel gruesa y rígida, útil para fabricar armaduras resistentes.",
    "Un morceau de peau épaisse et rigide, utile pour fabriquer des armures robustes."
  ],
  "Infused with the magical essence of bees, this armor protects the mage while channeling their mystical energy.": [
    "Imbuida de la esencia mágica de las abejas, esta armadura protege al mago mientras canaliza su energía mística.",
    "Imprégnée de l'essence magique des abeilles, cette armure protège le mage tout en canalisant son énergie mystique."
  ],
  "This cold ring seems to retain the silent echo of the bone reaper.": [
    "Este anillo frío parece conservar el eco silencioso del segador de huesos.",
    "Cette bague froide semble retenir l'écho silencieux du faucheur d'os."
  ],
  "A dark billhook with funerary engravings, whose curved blade seems linked to forbidden arts.": [
    "Una podadera oscura con grabados funerarios cuya hoja curvada parece ligada a las artes prohibidas.",
    "Une serpe sombre aux gravures funéraires, dont la lame courbe semble liée aux arts interdits."
  ],
  "A dark and mysterious powder, charged with forbidden energy.": [
    "Un polvo oscuro y misterioso cargado de energía prohibida.",
    "Une poudre sombre et mystérieuse chargée d'énergie interdite."
  ],
  "Crushing weight, striking, stunning like the spell of an angry necromancer.": [
    "Un peso aplastante, contundente y aturdidor, como el hechizo de un nigromante enfurecido.",
    "Un poids écrasant, percutant et étourdissant, comme le sort d'un nécromancien en colère."
  ],
  "A dark arch with funerary engravings, whose branches seem shaped by magic from beyond the grave.": [
    "Un arco oscuro con grabados funerarios cuyas ramas parecen moldeadas por magia de más allá de la tumba.",
    "Un arc sombre aux gravures funéraires, dont les branches semblent façonnées par une magie venue d'au-delà de la tombe."
  ],
  "An austere crossbow with sepulchral ornaments, imbued with a silent presence from beyond the grave.": [
    "Una ballesta austera con ornamentos sepulcrales, imbuida de una presencia silenciosa de más allá de la tumba.",
    "Une arbalète austère aux ornements sépulcraux, imprégnée d'une présence silencieuse venue d'au-delà de la tombe."
  ],
  "An ax from the depths of a dangerous necropolis.": [
    "Un hacha de las profundidades de una necrópolis peligrosa.",
    "Une hache venue des profondeurs d'une nécropole dangereuse."
  ],
  "A hoe from the depths of a dangerous necropolis.": [
    "Una azada de las profundidades de una necrópolis peligrosa.",
    "Une houe venue des profondeurs d'une nécropole dangereuse."
  ],
  "A pickaxe from the depths of a dangerous necropolis.": [
    "Un pico de las profundidades de una necrópolis peligrosa.",
    "Une pioche venue des profondeurs d'une nécropole dangereuse."
  ],
  "This sandwich, straight from the modern world and made with crushed nephents, will revive your memories!": [
    "¡Este sándwich, llegado directamente del mundo moderno y hecho con nephentes triturados, reavivará tus recuerdos!",
    "Ce sandwich, venu directement du monde moderne et préparé avec des néphentes broyés, ravivera vos souvenirs !"
  ],
  "Perfect outfit for moving in the shadows and without noise. She would have fragments of the moon in her.": [
    "Un atuendo perfecto para moverse entre las sombras y sin hacer ruido. Llevaría fragmentos de la luna en su interior.",
    "Tenue parfaite pour se déplacer dans l'ombre et sans bruit. Elle contiendrait des fragments de lune."
  ],
  "A sturdy orc frame used by orc warriors.": [
    "Una estructura de orco resistente utilizada por los guerreros orcos.",
    "Une structure d'orque robuste utilisée par les guerriers orques."
  ],
  "Sadistic, sturdy and very brutal boots, inspiring fear.": [
    "Botas sádicas, resistentes y muy brutales que inspiran miedo.",
    "Des bottes sadiques, robustes et très brutales, inspirant la peur."
  ],
  "A tenacious and sturdy bracelet to crush enemies to the ground.": [
    "Un brazalete tenaz y resistente para aplastar a los enemigos contra el suelo.",
    "Un bracelet tenace et solide pour écraser les ennemis au sol."
  ],
  "A powerful orc essence used for a variety of reasons.": [
    "Una poderosa esencia de orco utilizada por diversos motivos.",
    "Une puissante essence d'orque utilisée pour diverses raisons."
  ],
  "A pair of gloves carved to serve the fierce orc tribe.": [
    "Unos guantes tallados para servir a la feroz tribu de los orcos.",
    "Une paire de gants sculptée pour servir la féroce tribu des orques."
  ],
  "An orc's heart torn from a chest.": [
    "El corazón de un orco arrancado de un pecho.",
    "Le cœur d'un orque arraché à une poitrine."
  ],
  "An orc mask used in rituals.": [
    "Una máscara de orco utilizada en rituales.",
    "Un masque d'orque utilisé lors de rituels."
  ],
  "An orc's eye gouged out during a fight.": [
    "Un ojo de orco arrancado durante un combate.",
    "Un œil d'orque arraché lors d'un combat."
  ],
  "A fragment of orichalcum, a legendary and rare ore with unique metallic reflections.": [
    "Un fragmento de oricalco, un mineral legendario y raro con reflejos metálicos únicos.",
    "Un fragment d'orichalque, un minerai légendaire et rare aux reflets métalliques uniques."
  ],
  "The signature is written in blood. It grants demonic power.": [
    "La firma está escrita con sangre. Otorga poder demoníaco.",
    "La signature est écrite dans le sang. Elle confère un pouvoir démoniaque."
  ],
  "This scroll allows the player using it to receive a point to reset their skill points.": [
    "Este pergamino permite al jugador que lo usa recibir un punto para reiniciar sus puntos de habilidad.",
    "Ce parchemin permet au joueur qui l'utilise d'obtenir un point pour réinitialiser ses points de compétence."
  ],
  "A piece as red as bauxite, forged at Tier 2.": [
    "Una pieza tan roja como la bauxita, forjada en el nivel 2.",
    "Une pièce aussi rouge que la bauxite, forgée au niveau 2."
  ],
  "Soft pink crystal with soft tones.": [
    "Cristal rosa suave de tonos delicados.",
    "Cristal rose tendre aux nuances douces."
  ],
  "This thick, golden pollen vibrates between your fingers. He is the key to opening doors.": [
    "Este polen dorado y espeso vibra entre tus dedos. Es la llave para abrir puertas.",
    "Ce pollen épais et doré vibre entre vos doigts. C'est la clé pour ouvrir les portes."
  ],
  "A fine ring with bronze highlights, adorned with a small luminous yellow crystal recalling the warmth and kindness of its former owner.":
    [
      "Un elegante anillo con reflejos de bronce, adornado con un pequeño cristal amarillo luminoso que recuerda la calidez y bondad de su antiguo dueño.",
      "Une fine bague aux reflets bronze, ornée d'un petit cristal jaune lumineux rappelant la chaleur et la bonté de son ancien propriétaire."
    ],
  "A vial filled with a shimmering yellow liquid, giving off a soft, warm, happy glow.": [
    "Un frasco lleno de un líquido amarillo brillante que emite un resplandor suave, cálido y alegre.",
    "Une fiole remplie d'un liquide jaune scintillant, dégageant une lueur douce, chaleureuse et joyeuse."
  ],
  "The balanced version among all Tolbana shields.": [
    "La versión equilibrada entre todos los escudos de Tolbana.",
    "La version équilibrée parmi tous les boucliers de Tolbana."
  ],
  "This staff is a powerful and concentrated version of energy, unlike the other, safer and less powerful one.": [
    "Este bastón es una versión poderosa y concentrada de energía, a diferencia del otro, más seguro y menos potente.",
    "Ce bâton est une version puissante et concentrée de l'énergie, contrairement à l'autre, plus sûr et moins puissant."
  ],
  "A living orb, healing every soul in an intense and profound way, at the end of an old staff.": [
    "Un orbe viviente que cura cada alma de forma intensa y profunda, situado en el extremo de un bastón viejo.",
    "Un orbe vivant soignant chaque âme de manière intense et profonde, au bout d'un vieux bâton."
  ],
  "Cut from thick metal and marked with a red stripe, this ring is inspired by the famous massive wild boar.": [
    "Cortado de metal grueso y marcado con una franja roja, este anillo está inspirado en el famoso jabalí salvaje de gran tamaño.",
    "Découpée dans un métal épais et marquée d'une bande rouge, cette bague s'inspire du célèbre sanglier sauvage massif."
  ],
  "A radiant amulet, forged from pure onyx.": [
    "Un amuleto radiante forjado con ónice puro.",
    "Une amulette rayonnante forgée en onyx pur."
  ],
  "Forged with pure onyx, a brilliant fragment of Tier 2.": [
    "Forjado con ónice puro, un fragmento brillante del nivel 2.",
    "Forgé avec de l'onyx pur, un fragment brillant du niveau 2."
  ],
  "A pair of gloves made from pure, radiant, angelic-looking onyx": [
    "Unos guantes hechos de ónice puro y radiante, con aspecto angelical.",
    "Une paire de gants en onyx pur et rayonnant, à l'apparence angélique."
  ],
  "Exceptional ingot, pure and solid. Essential for forges and rare elixirs.": [
    "Lingote excepcional, puro y sólido. Esencial para forjas y elixires raros.",
    "Lingot exceptionnel, pur et solide. Essentiel pour les forges et les élixirs rares."
  ],
  "A luminous piece like that of pure, radiant onyx, forged at Tier 2.": [
    "Una pieza luminosa de ónice puro y radiante, forjada en el nivel 2.",
    "Une pièce lumineuse en onyx pur et rayonnant, forgée au niveau 2."
  ],
  "Forged from pure onyx this ring is complete and very powerful.": [
    "Forjado con ónice puro, este anillo está completo y es muy poderoso.",
    "Forgée en onyx pur, cette bague est complète et très puissante."
  ],
  "A purple spider carcass.": ["El cadáver de una araña morada.", "Une carcasse d'araignée violette."],
  "Purple spider eyes.": ["Ojos de araña morada.", "Yeux d'araignée violette."],
  "A purple spider thread.": ["Un hilo de araña morada.", "Un fil d'araignée violette."],
  "A small fabric bag, housing 100 Col.": [
    "Una pequeña bolsa de tela que contiene 100 Col.",
    "Une petite bourse en tissu contenant 100 Col."
  ],
  "A small fabric bag, housing 1000 Col.": [
    "Una pequeña bolsa de tela que contiene 1000 Col.",
    "Une petite bourse en tissu contenant 1000 Col."
  ],
  "A small fabric bag, housing 200 Col.": [
    "Una pequeña bolsa de tela que contiene 200 Col.",
    "Une petite bourse en tissu contenant 200 Col."
  ],
  "A small fabric bag, housing 2000 Col.": [
    "Una pequeña bolsa de tela que contiene 2000 Col.",
    "Une petite bourse en tissu contenant 2000 Col."
  ],
  "A small fabric bag, housing 25 Col.": [
    "Una pequeña bolsa de tela que contiene 25 Col.",
    "Une petite bourse en tissu contenant 25 Col."
  ],
  "A small fabric bag, housing 250 Col.": [
    "Una pequeña bolsa de tela que contiene 250 Col.",
    "Une petite bourse en tissu contenant 250 Col."
  ],
  "A small fabric bag, housing 500 Col.": [
    "Una pequeña bolsa de tela que contiene 500 Col.",
    "Une petite bourse en tissu contenant 500 Col."
  ],
  "A small fabric bag, housing 5000 Col.": [
    "Una pequeña bolsa de tela que contiene 5000 Col.",
    "Une petite bourse en tissu contenant 5000 Col."
  ],
  "A small fabric bag, housing 75 Col.": [
    "Una pequeña bolsa de tela que contiene 75 Col.",
    "Une petite bourse en tissu contenant 75 Col."
  ],
  "A collection of flesh and rusty metal found in a desecrated tomb. Each impact releases a sickening stench that disturbs the attackers.":
    [
      "Una mezcla de carne y metal oxidado encontrada en una tumba profanada. Cada impacto libera un hedor repugnante que perturba a los atacantes.",
      "Un amas de chair et de métal rouillé trouvé dans une tombe profanée. Chaque impact libère une odeur écœurante qui perturbe les attaquants."
    ],
  "Metallic yellow stone with brilliant golden reflections.": [
    "Piedra amarilla metálica con brillantes reflejos dorados.",
    "Pierre jaune métallique aux brillants reflets dorés."
  ],
  "Brilliant yellow cubic crystal.": ["Cristal cúbico amarillo brillante.", "Cristal cubique jaune éclatant."],
  "Boosts mobility and resource capacity for 15 minutes.": [
    "Aumenta la movilidad y la capacidad de recursos durante 15 minutos.",
    "Augmente la mobilité et la capacité de ressources pendant 15 minutes."
  ],
  "Boosts physical offense for 15 minutes.": [
    "Aumenta el ataque físico durante 15 minutos.",
    "Augmente l'attaque physique pendant 15 minutes."
  ],
  "Returns you HP immediately and applies 15 recharge to all healing potions.": [
    "Restaura tus HP inmediatamente y aplica una recarga de 15 a todas las pociones de curación.",
    "Restaure immédiatement vos PV et applique un temps de recharge de 15 à toutes les potions de soin."
  ],
  "Boosts defensive control for 15 minutes.": [
    "Aumenta el control defensivo durante 15 minutos.",
    "Augmente le contrôle défensif pendant 15 minutes."
  ],
  "Boosts magical offense for 15 minutes.": [
    "Aumenta el ataque mágico durante 15 minutos.",
    "Augmente l'attaque magique pendant 15 minutes."
  ],
  "Boosts avoidance and resource regeneration for 15 minutes.": [
    "Aumenta la evasión y la regeneración de recursos durante 15 minutos.",
    "Augmente l'évitement et la régénération des ressources pendant 15 minutes."
  ],
  "Boosts survivability for 15 minutes.": [
    "Aumenta la supervivencia durante 15 minutos.",
    "Augmente la capacité de survie pendant 15 minutes."
  ],
  "A ravaging treant bark.": ["Una corteza de treant devastador.", "Une écorce de tréant ravageur."],
  "A devastating branch of the woods.": ["Una rama devastadora de los bosques.", "Une branche dévastatrice des bois."],
  "The heart of a devastating treant.": ["El corazón de un treant devastador.", "Le cœur d'un tréant dévastateur."],
  "A small luminous lantern, with a warm and soothing aura.": [
    "Una pequeña linterna luminosa con un aura cálida y tranquilizadora.",
    "Une petite lanterne lumineuse à l'aura chaleureuse et apaisante."
  ],
  "A reinforced ax, perfect for cutting down trees faster.": [
    "Un hacha reforzada, perfecta para talar árboles más rápido.",
    "Une hache renforcée, parfaite pour abattre les arbres plus rapidement."
  ],
  "A reinforced hoe, perfect for harvesting plants faster.": [
    "Una azada reforzada, perfecta para cosechar plantas más rápido.",
    "Une houe renforcée, parfaite pour récolter les plantes plus rapidement."
  ],
  "A reinforced pickaxe, perfect for mining ores faster.": [
    "Un pico reforzado, perfecto para extraer minerales más rápido.",
    "Une pioche renforcée, parfaite pour extraire les minerais plus rapidement."
  ],
  "Unlike the small bone, these bones are more resistant and surely also useful in certain confections.": [
    "A diferencia del hueso pequeño, estos huesos son más resistentes y seguramente también útiles para ciertas preparaciones.",
    "Contrairement au petit os, ces os sont plus résistants et sûrement utiles pour certaines préparations."
  ],
  "Better quality wire that can be used for better tools.": [
    "Alambre de mejor calidad que puede utilizarse para fabricar mejores herramientas.",
    "Fil de meilleure qualité pouvant servir à fabriquer de meilleurs outils."
  ],
  "Allows you to revive a comrade in combat within 10 seconds after death in permitted areas.": [
    "Permite revivir a un compañero en combate durante los 10 segundos posteriores a su muerte en las zonas permitidas.",
    "Permet de ranimer un allié au combat dans les 10 secondes suivant sa mort dans les zones autorisées."
  ],
  "Imbued with the speed of a cursed horse, they grant their wearer great speed.": [
    "Imbuidas de la velocidad de un caballo maldito, otorgan gran rapidez a quien las lleva.",
    "Imprégnées de la vitesse d'un cheval maudit, elles confèrent une grande rapidité à leur porteur."
  ],
  "A ring sculpted to hunt its prey relentlessly and light.": [
    "Un anillo tallado para cazar a su presa sin descanso y con ligereza.",
    "Une bague sculptée pour chasser sa proie sans relâche et avec légèreté."
  ],
  "A precious ring that protects and revitalizes, like a beehive watching over its larvae.": [
    "Un anillo precioso que protege y revitaliza, como una colmena que vela por sus larvas.",
    "Une précieuse bague qui protège et revitalise, telle une ruche veillant sur ses larves."
  ],
  "A delicately engraved ring with warm reflections, symbol of a precious bond.": [
    "Un anillo delicadamente grabado con reflejos cálidos, símbolo de un vínculo precioso.",
    "Une bague délicatement gravée aux reflets chaleureux, symbole d'un lien précieux."
  ],
  "A light ring carved from a Forest Eagle's claw. Its green color seems to blend perfectly into the foliage.": [
    "Un anillo ligero tallado en una garra de águila del bosque. Su color verde parece fundirse perfectamente con el follaje.",
    "Une bague légère taillée dans une griffe d'aigle forestier. Sa couleur verte semble se fondre parfaitement dans le feuillage."
  ],
  "A harpy claw running through high voltage electrical currents. It does not harm the wearer, but channels its magical flow towards their extremities.":
    [
      "Una garra de arpía recorrida por corrientes eléctricas de alto voltaje. No daña a quien la lleva, pero canaliza su flujo mágico hacia las extremidades.",
      "Une griffe de harpie parcourue de courants électriques à haute tension. Elle ne blesse pas son porteur, mais canalise son flux magique vers ses extrémités."
    ],
  "A dungeon formed inside Melliona's Hive.": [
    "Una mazmorra formada dentro de la colmena de Melliona.",
    "Un donjon formé à l'intérieur de la ruche de Melliona."
  ],
  "Sell Weapons and Consumables for newcomers.": [
    "Vende armas y consumibles a los recién llegados.",
    "Vend des armes et des consommables aux nouveaux arrivants."
  ],
  "A maze that rewrites its routes after each elite pull, like the system is learning your pathing. Scouts call it the place where map memory goes to die.":
    [
      "Un laberinto que reescribe sus rutas después de cada combate contra un élite, como si el sistema aprendiera tu recorrido. Los exploradores lo llaman el lugar donde muere la memoria del mapa.",
      "Un labyrinthe qui réécrit ses itinéraires après chaque combat contre un élite, comme si le système apprenait votre parcours. Les éclaireurs l'appellent l'endroit où la mémoire de la carte meurt."
    ],
  "A side quest about uncovering a hidden facet of reality.": [
    "Una misión secundaria sobre el descubrimiento de un aspecto oculto de la realidad.",
    "Une quête secondaire consacrée à la découverte d'un aspect caché de la réalité."
  ],
  "A side quest to locate the Ngangas people.": [
    "Una misión secundaria para localizar al pueblo de los Ngangas.",
    "Une quête secondaire visant à localiser le peuple Ngangas."
  ],
  "A quest to assist with cooking and preparation tasks.": [
    "Una misión para ayudar con tareas de cocina y preparación.",
    "Une quête pour aider aux tâches de cuisine et de préparation."
  ],
  "A quest to help Yuko with an important task.": [
    "Una misión para ayudar a Yuko con una tarea importante.",
    "Une quête pour aider Yuko dans une tâche importante."
  ],
  "A quest that tests resilience through painful trials.": [
    "Una misión que pone a prueba la resistencia mediante pruebas dolorosas.",
    "Une quête qui met la résistance à l'épreuve au travers de difficiles épreuves."
  ],
  "A quest guiding the player toward Urbus.": [
    "Una misión que guía al jugador hacia Urbus.",
    "Une quête guidant le joueur vers Urbus."
  ],
  "A quest focused on communicating with Yaa.": [
    "Una misión centrada en comunicarse con Yaa.",
    "Une quête centrée sur la communication avec Yaa."
  ],
  "A quest involving the forgotten tomb dungeon.": [
    "Una misión relacionada con la mazmorra de la tumba olvidada.",
    "Une quête liée au donjon de la tombe oubliée."
  ],
  "A quest about creating a key with a master smith.": [
    "Una misión sobre la creación de una llave con un maestro herrero.",
    "Une quête consacrée à la création d'une clé avec un maître forgeron."
  ],
  "A quest centered around a rivalry with the color green.": [
    "Una misión centrada en una rivalidad con el color verde.",
    "Une quête centrée sur une rivalité avec la couleur verte."
  ],
  "A quest exploring how to work with animal hides.": [
    "Una misión que explora cómo trabajar con pieles de animales.",
    "Une quête explorant le travail des peaux animales."
  ],
  "A quest focused on collecting or crafting with feathers.": [
    "Una misión centrada en recolectar o fabricar objetos con plumas.",
    "Une quête consacrée à la collecte ou à la fabrication avec des plumes."
  ],
  "A quest tied to the legacy left by the seas.": [
    "Una misión ligada al legado dejado por los mares.",
    "Une quête liée à l'héritage laissé par les mers."
  ],
  "A hunting trial to prove your skills.": [
    "Una prueba de caza para demostrar tus habilidades.",
    "Une épreuve de chasse pour prouver vos compétences."
  ],
  "A quest about recovering an onyx of knowledge.": [
    "Una misión sobre la recuperación de un ónice del conocimiento.",
    "Une quête consacrée à la récupération d'un onyx de la connaissance."
  ],
  "A philosophical quest inspired by Bushi teachings.": [
    "Una misión filosófica inspirada en las enseñanzas de Bushi.",
    "Une quête philosophique inspirée par les enseignements de Bushi."
  ],
  "A relaxed quest involving a calm cat companion.": [
    "Una misión tranquila protagonizada por un apacible compañero felino.",
    "Une quête paisible mettant en scène un compagnon félin calme."
  ],
  "A quest centered around a haunted bell tower.": [
    "Una misión centrada en un campanario encantado.",
    "Une quête centrée sur un clocher hanté."
  ],
  "A second step in an ongoing side quest series.": [
    "Un segundo paso en una serie de misiones secundarias en curso.",
    "Une deuxième étape d'une série de quêtes secondaires en cours."
  ],
  "A quest to complete a cleansing ritual.": [
    "Una misión para completar un ritual de purificación.",
    "Une quête visant à accomplir un rituel de purification."
  ],
  "A quest involving the roof of a cabin shelter.": [
    "Una misión relacionada con el tejado de un refugio de cabaña.",
    "Une quête liée au toit d'un abri de cabane."
  ],
  "A quest about offering tribute before judgment.": [
    "Una misión sobre ofrecer un tributo antes del juicio.",
    "Une quête consacrée à l'offrande d'un tribut avant le jugement."
  ],
  "A quest focused on building a cabin foundation.": [
    "Una misión centrada en construir los cimientos de una cabaña.",
    "Une quête centrée sur la construction des fondations d'une cabane."
  ],
  "A quest about putting up the walls of a cabin.": [
    "Una misión sobre levantar las paredes de una cabaña.",
    "Une quête consacrée à l'édification des murs d'une cabane."
  ],
  "A quest where you obtain your first weapon.": [
    "Una misión en la que obtienes tu primera arma.",
    "Une quête au cours de laquelle vous obtenez votre première arme."
  ],
  "A quest to clear the skies above Taran.": [
    "Una misión para despejar los cielos sobre Taran.",
    "Une quête visant à purifier les cieux au-dessus de Taran."
  ],
  "A quest about defending your choice of style.": [
    "Una misión sobre defender tu elección de estilo.",
    "Une quête consacrée à la défense de votre choix de style."
  ],
  "A quest to speak with an enigmatic woman.": [
    "Una misión para hablar con una mujer enigmática.",
    "Une quête visant à parler à une femme énigmatique."
  ],
  "A quest to return back to the town of Urbus.": [
    "Una misión para regresar a la ciudad de Urbus.",
    "Une quête visant à retourner dans la ville d'Urbus."
  ],
  "A side quest centered around preparing a meal.": [
    "Una misión secundaria centrada en preparar una comida.",
    "Une quête secondaire centrée sur la préparation d'un repas."
  ],
  "A quest in which the player must prove their worth.": [
    "Una misión en la que el jugador debe demostrar su valía.",
    "Une quête dans laquelle le joueur doit prouver sa valeur."
  ],
  "A side quest that covers a bit of everything.": [
    "Una misión secundaria que abarca un poco de todo.",
    "Une quête secondaire qui couvre un peu de tout."
  ],
  "A forgotten place where nature has reclaimed its rights. Some say they hear voices whispered in the wind, as if the giants were still watching. A peaceful oasis... in appearance only.":
    [
      "Un lugar olvidado donde la naturaleza ha recuperado sus dominios. Algunos dicen oír voces susurradas por el viento, como si los gigantes aún vigilaran. Un oasis apacible... solo en apariencia.",
      "Un lieu oublié où la nature a repris ses droits. Certains disent entendre des voix murmurées par le vent, comme si les géants veillaient encore. Une oasis paisible... en apparence seulement."
    ],
  "A powerful boss guarding the sacred sanctuary.": [
    "Un jefe poderoso que protege el santuario sagrado.",
    "Un boss puissant gardant le sanctuaire sacré."
  ],
  "Collapsed ore tunnels now host armored mobs that patrol like a disciplined guild squad. Miners left warning runes at each fork, but most parties still pick the wrong descent.":
    [
      "Los túneles mineros derrumbados ahora albergan mobs acorazados que patrullan como un escuadrón disciplinado. Los mineros dejaron runas de advertencia en cada bifurcación, pero la mayoría de los grupos sigue eligiendo el descenso equivocado.",
      "Les tunnels de minerai effondrés abritent désormais des mobs en armure qui patrouillent comme une escouade disciplinée. Les mineurs ont laissé des runes d'avertissement à chaque embranchement, mais la plupart des groupes choisissent encore la mauvaise descente."
    ],
  "Dug into the heart of the mountain, the Geldorak mine was once home to a colony of renowned miners. But one day a scream rang out in the galleries... Since then, the corridors have been sealed and no one dares to go down there anymore.":
    [
      "Excavada en el corazón de la montaña, la mina de Geldorak albergó una colonia de mineros famosos. Pero un día un grito resonó en las galerías... Desde entonces, los corredores están sellados y nadie se atreve a bajar allí.",
      "Creusée au cœur de la montagne, la mine de Geldorak abritait autrefois une colonie de mineurs renommés. Mais un jour, un cri retentit dans les galeries... Depuis, les couloirs sont scellés et plus personne n'ose y descendre."
    ],
  "A gelatinous colossus, master of swarms of slimes. He crushes everything in his path, slowly but surely.": [
    "Un coloso gelatinoso, amo de enjambres de slimes. Aplasta todo a su paso, lenta pero inexorablemente.",
    "Un colosse gélatineux, maître d'essaims de slimes. Il écrase tout sur son passage, lentement mais sûrement."
  ],
  "A dark underground cave beneath Taran, home to hidden dangers.": [
    "Una cueva subterránea oscura bajo Taran, hogar de peligros ocultos.",
    "Une grotte souterraine sombre sous Taran, abritant des dangers cachés."
  ],
  "A wooded hamlet nestled between the hills where wild boars prowl on the edge. Cradle of the first clashes.": [
    "Una aldea boscosa entre las colinas, donde los jabalíes salvajes merodean en los límites. Cuna de los primeros enfrentamientos.",
    "Un hameau boisé niché entre les collines, où les sangliers sauvages rôdent aux abords. Berceau des premiers affrontements."
  ],
  "A tropical archipelago where giant tortoises gather. Each island hides ancient mysteries and unique wildlife. Calm is just a facade...":
    [
      "Un archipiélago tropical donde se reúnen tortugas gigantes. Cada isla oculta misterios antiguos y una fauna única. La calma es solo una fachada...",
      "Un archipel tropical où se rassemblent des tortues géantes. Chaque île cache d'anciens mystères et une faune unique. Le calme n'est qu'une façade..."
    ],
  "The iconic first-floor raid tyrant, infamous for sudden weapon swaps and punishing final-phase aggression.": [
    "El icónico tirano de la incursión del primer piso, famoso por cambiar de arma de repente y por su agresividad devastadora en la fase final.",
    "L'emblématique tyran du raid du premier étage, réputé pour ses changements d'arme soudains et son agressivité impitoyable en phase finale."
  ],
  "A silent creature lurking between the canvases, Jira watches every corner of the dungeon. Faster than lightning, she strikes without warning, leaving behind only silence... and bloody webs.":
    [
      "Una criatura silenciosa que acecha entre los lienzos; Jira vigila cada rincón de la mazmorra. Más rápida que un relámpago, ataca sin avisar y solo deja silencio... y telarañas ensangrentadas.",
      "Une créature silencieuse tapie entre les toiles, Jira observe chaque recoin du donjon. Plus rapide que l'éclair, elle frappe sans prévenir, ne laissant derrière elle que le silence... et des toiles ensanglantées."
    ],
  "A remote biome named Kaelor, known for its unusual terrain.": [
    "Un bioma remoto llamado Kaelor, conocido por su terreno inusual.",
    "Un biome isolé nommé Kaelor, connu pour son terrain inhabituel."
  ],
  "Silent in the heart of the dungeon, Kamilia weaves invisible traps in the shadows. Its bite injects paralyzing venom, leaving its prey conscious, but unable to flee.":
    [
      "En silencio en el corazón de la mazmorra, Kamilia teje trampas invisibles entre las sombras. Su mordedura inyecta un veneno paralizante que deja a la presa consciente, pero incapaz de escapar.",
      "Silencieuse au cœur du donjon, Kamilia tisse des pièges invisibles dans l'ombre. Sa morsure injecte un venin paralysant, laissant sa proie consciente mais incapable de fuir."
    ],
  "Kazor uses erratic leaps and high burst phases, demanding coordinated interrupts from the party.": [
    "Kazor realiza saltos erráticos y fases de gran explosión de daño, lo que exige interrupciones coordinadas del grupo.",
    "Kazor enchaîne des bonds erratiques et des phases de forte puissance, exigeant des interruptions coordonnées du groupe."
  ],
  "The old boss tower from early Aincrad records, layered with trap stairs and ambush rooms. Every floor feels like a raid rehearsal built to punish hesitation.":
    [
      "La antigua torre de jefe de los primeros registros de Aincrad, llena de escaleras con trampas y salas de emboscada. Cada piso parece un ensayo de incursión diseñado para castigar la duda.",
      "L'ancienne tour de boss des premiers enregistrements d'Aincrad, remplie d'escaliers piégés et de salles d'embuscade. Chaque étage ressemble à une répétition de raid conçue pour punir l'hésitation."
    ],
  "In the heart of a forgotten cave sleeps an ancient serpent: Aepep No one knows if he's awake... or still dreaming. Its gigantic body would have shaped the galleries.":
    [
      "En el corazón de una cueva olvidada duerme una serpiente ancestral: Aepep. Nadie sabe si está despierta... o si aún sueña. Su cuerpo gigantesco habría dado forma a las galerías.",
      "Au cœur d'une caverne oubliée dort un serpent ancien : Aepep. Nul ne sait s'il est éveillé... ou s'il rêve encore. Son corps gigantesque aurait façonné les galeries."
    ],
  "Underground mineral veins near Sablemor, rich with rare ore.": [
    "Vetas minerales subterráneas cerca de Sablemor, ricas en minerales raros.",
    "Veines minérales souterraines près de Sablemor, riches en minerais rares."
  ],
  "A fearsome boss encountered underground in Map 2.": [
    "Un jefe temible encontrado bajo tierra en el mapa 2.",
    "Un boss redoutable rencontré sous terre dans la carte 2."
  ],
  "A small settlement of Ngangas houses with mystic inhabitants.": [
    "Un pequeño asentamiento de casas Ngangas con habitantes místicos.",
    "Un petit village de maisons Ngangas aux habitants mystiques."
  ],
  "A coastal enclave with tropical life and hidden secrets.": [
    "Un enclave costero de vida tropical y secretos ocultos.",
    "Une enclave côtière à la vie tropicale et aux secrets cachés."
  ],
  "A dangerous boss lurking in the depths of Map 2.": [
    "Un jefe peligroso que acecha en las profundidades del mapa 2.",
    "Un boss dangereux tapi dans les profondeurs de la carte 2."
  ],
  "The Merchants Guild Headquarters, a lively place where riches and secrets are exchanged. The streets are teeming with activity and negotiation.":
    [
      "La sede del Gremio de Mercaderes, un lugar animado donde se intercambian riquezas y secretos. Sus calles rebosan actividad y negociaciones.",
      "Le siège de la Guilde des marchands, un lieu animé où s'échangent richesses et secrets. Ses rues débordent d'activité et de négociations."
    ],
  "Small peaceful village nestled on the edge of a clear lake. The inhabitants live to the rhythm of the waves and the wind. A perfect place to breathe between two battles.":
    [
      "Pequeña aldea tranquila a orillas de un lago transparente. Sus habitantes viven al ritmo de las olas y el viento. Un lugar perfecto para respirar entre dos batallas.",
      "Petit village paisible niché au bord d'un lac limpide. Ses habitants vivent au rythme des vagues et du vent. Un endroit parfait pour reprendre son souffle entre deux batailles."
    ],
  "A subterranean boss found deep below Map 2.": [
    "Un jefe subterráneo encontrado en las profundidades del mapa 2.",
    "Un boss souterrain découvert dans les profondeurs de la carte 2."
  ],
  "A cursed entity emerging from ancient darkness, it prowls, invisible, ready to tear the souls of the living.": [
    "Una entidad maldita surgida de una oscuridad ancestral. Acecha invisible, lista para desgarrar las almas de los vivos.",
    "Une entité maudite surgie d'une ancienne obscurité. Elle rôde, invisible, prête à déchirer les âmes des vivants."
  ],
  "A cursed entity emerging from ancient darkness, it prowls, invisible, ready to tear apart the souls of the living.":
    [
      "Una entidad maldita surgida de una oscuridad ancestral. Acecha invisible, lista para desgarrar las almas de los vivos.",
      "Une entité maudite surgie d'une ancienne obscurité. Elle rôde, invisible, prête à déchirer les âmes des vivants."
    ],
  "Sell Tier 2 Tools; Savanna tools.": [
    "Vende herramientas de nivel 2 y herramientas de sabana.",
    "Vend des outils de niveau 2 et des outils de savane."
  ],
  "Nestled on the edge of an unfathomable sea chasm, the village of Virelune lives to the rhythm of lunar tides. Fishermen say they see two moons reflected in the waters... But one of them never follows the sky.":
    [
      "Enclavada al borde de una sima marina insondable, la aldea de Virelune vive al ritmo de las mareas lunares. Los pescadores dicen ver dos lunas reflejadas en las aguas... Pero una de ellas nunca sigue al cielo.",
      "Niché au bord d'un gouffre marin insondable, le village de Virelune vit au rythme des marées lunaires. Les pêcheurs disent voir deux lunes se refléter dans les eaux... Mais l'une d'elles ne suit jamais le ciel."
    ],
  "A creeping entity born from the mines of Geldorak, Vyrmos soaks up spores and damp earth. His skin is covered in living foam, and his breath corrupts everything he touches.":
    [
      "Una entidad reptante nacida en las minas de Geldorak, Vyrmos absorbe esporas y tierra húmeda. Su piel está cubierta de espuma viva y su aliento corrompe todo lo que toca.",
      "Une entité rampante née dans les mines de Geldorak, Vyrmos absorbe les spores et la terre humide. Sa peau est couverte d'une mousse vivante et son souffle corrompt tout ce qu'il touche."
    ],
  "An elegant scythe mixing pink and silver hues, decorated with patterns evoking love.": [
    "Una elegante guadaña que mezcla tonos rosas y plateados, decorada con motivos que evocan el amor.",
    "Une élégante faux mêlant des teintes roses et argentées, décorée de motifs évoquant l'amour."
  ],
  "Grippy, but fast, as if the rust itself had learned to run with its soul.": [
    "Con buen agarre, pero rápida, como si el óxido hubiera aprendido a correr con su alma.",
    "Adhérente mais rapide, comme si la rouille elle-même avait appris à courir avec son âme."
  ],
  "Soul fragments at each tip of arrows, removing all life.": [
    "Fragmentos de alma en cada punta de flecha, que arrebatan toda vida.",
    "Des fragments d'âme à chaque pointe de flèche, arrachant toute vie."
  ],
  "A golden gem formed by the solidification of honey. Channels gentle but persistent energy.": [
    "Una gema dorada formada por la solidificación de la miel. Canaliza una energía suave pero persistente.",
    "Une gemme dorée formée par la solidification du miel. Elle canalise une énergie douce mais persistante."
  ],
  "Forged with many materials obtained from bees.": [
    "Forjado con numerosos materiales obtenidos de las abejas.",
    "Forgé avec de nombreux matériaux obtenus auprès des abeilles."
  ],
  "A golden ring with amber highlights, whose smooth surface recalls the shine of freshly poured honey.": [
    "Un anillo dorado con reflejos de ámbar cuya superficie lisa recuerda el brillo de la miel recién vertida.",
    "Une bague dorée aux reflets ambrés, dont la surface lisse rappelle l'éclat du miel fraîchement versé."
  ],
  "Each bolt releases a chilling blast that chills the hearts of targets.": [
    "Cada virote libera una ráfaga helada que enfría el corazón de los objetivos.",
    "Chaque carreau libère une bourrasque glaciale qui refroidit le cœur des cibles."
  ],
  "Perfect outfit for tracking down targets and inflicting critical damage on them.": [
    "Un atuendo perfecto para rastrear objetivos e infligirles daño crítico.",
    "Une tenue parfaite pour traquer les cibles et leur infliger des dégâts critiques."
  ],
  "Light and flexible, this bee-inspired armor allows speed and precision, ideal for hunters.": [
    "Ligera y flexible, esta armadura inspirada en las abejas permite velocidad y precisión, ideal para cazadores.",
    "Légère et flexible, cette armure inspirée des abeilles favorise la vitesse et la précision, idéale pour les chasseurs."
  ],
  "A solidified patch of frost, as hard as stone.": [
    "Una placa de escarcha solidificada, tan dura como la piedra.",
    "Une plaque de givre solidifiée, aussi dure que la pierre."
  ],
  "A crystalline fragment bathed in ancient magic. It is prized for forging mystical armor.": [
    "Un fragmento cristalino bañado en magia antigua. Es apreciado para forjar armaduras místicas.",
    "Un fragment cristallin baigné de magie ancienne. Il est prisé pour forger des armures mystiques."
  ],
  "Forged from Ika plates, these ancestral turtles provide strength and stability.": [
    "Forjado con placas de Ika, este material ancestral aporta fuerza y estabilidad.",
    "Forgé à partir de plaques d'Ika, ce matériau ancestral apporte force et stabilité."
  ],
  "A red crystal covered with purplish veins, giving off a disturbing aura reminiscent of the ferocity of the fearsome Kobold lord.":
    [
      "Un cristal rojo cubierto de vetas moradas que desprende un aura inquietante, reminiscencia de la ferocidad del temible señor kobold.",
      "Un cristal rouge parcouru de veines violacées, dégageant une aura inquiétante rappelant la férocité du redoutable seigneur kobold."
    ],
  "A powerful amulet, forged from impure onyx.": [
    "Un amuleto poderoso forjado con ónice impuro.",
    "Une amulette puissante forgée en onyx impur."
  ],
  "A dark coin forged from impure onyx at Tier 2.": [
    "Una moneda oscura forjada con ónice impuro en el nivel 2.",
    "Une pièce sombre forgée avec de l'onyx impur au niveau 2."
  ],
  "A pair of gloves made from impure onyx, incomplete and with a powerful appearance like a blade": [
    "Unos guantes hechos de ónice impuro, incompletos y con un aspecto poderoso como una hoja.",
    "Une paire de gants en onyx impur, incomplète et à l'apparence puissante comme une lame."
  ],
  "An ore from a rare rock. This ore can be used to forge good weapons, but they will quickly become useless!": [
    "Un mineral de una roca rara. Puede utilizarse para forjar buenas armas, ¡pero se volverán inútiles rápidamente!",
    "Un minerai issu d'une roche rare. Il peut servir à forger de bonnes armes, mais elles deviendront vite inutilisables !"
  ],
  "Forged from impure onyx, this ring is incomplete but seems very powerful despite everything.": [
    "Forjado con ónice impuro, este anillo está incompleto, pero aun así parece muy poderoso.",
    "Forgée en onyx impur, cette bague est incomplète mais semble malgré tout très puissante."
  ],
  "A strong string woven from an impure onyx alloy, and mixed with spider threads.": [
    "Una cuerda resistente tejida con una aleación de ónice impuro y mezclada con hilos de araña.",
    "Une ficelle solide tressée avec un alliage d'onyx impur et mélangée à des fils d'araignée."
  ],
  "An orichalcum ingot, forged from fragments of a rare ore.": [
    "Un lingote de oricalco forjado con fragmentos de un mineral raro.",
    "Un lingot d'orichalque forgé à partir de fragments d'un minerai rare."
  ],
  "A rudimentary amulet, forged from raw iron. Nothing magical, just robustness.": [
    "Un amuleto rudimentario forjado con hierro en bruto. Nada mágico, solo robustez.",
    "Une amulette rudimentaire forgée dans du fer brut. Rien de magique, seulement de la robustesse."
  ],
  "A reliable weapon to hit even the toughest enemies.": [
    "Un arma fiable para golpear incluso a los enemigos más resistentes.",
    "Une arme fiable pour frapper même les ennemis les plus coriaces."
  ],
  "A simple iron band, forged to protect the wrist or supplement rudimentary equipment.": [
    "Una sencilla banda de hierro, forjada para proteger la muñeca o complementar un equipo rudimentario.",
    "Un simple anneau de fer, forgé pour protéger le poignet ou compléter un équipement rudimentaire."
  ],
  "A pair of polished iron gloves, with a cold sheen and a solidly forged appearance.": [
    "Unos guantes de hierro pulido, con un brillo frío y un aspecto sólidamente forjado.",
    "Une paire de gants en fer poli, au reflet froid et à l'apparence solidement forgée."
  ],
  "A rock marked by veins of raw metal.": [
    "Una roca marcada por vetas de metal en bruto.",
    "Une roche marquée de veines de métal brut."
  ],
  "Carved from raw iron, this ring is appreciated for its solidity more than its appearance.": [
    "Tallado en hierro en bruto, este anillo se aprecia más por su solidez que por su aspecto.",
    "Taillée dans du fer brut, cette bague est appréciée davantage pour sa solidité que pour son apparence."
  ],
  "Light and soft matte black stone.": ["Piedra negra mate, ligera y suave.", "Pierre noire mate, légère et douce."],
  "A juvenile treant bark.": ["Una corteza de treant joven.", "Une écorce de jeune tréant."],
  "A juvenile treant seed.": ["Una semilla de treant joven.", "Une graine de jeune tréant."],
  "It symbolizes the moment when the hero takes flight as an independent hunter...": [
    "Simboliza el momento en que el héroe alza el vuelo como cazador independiente...",
    "Elle symbolise l'instant où le héros prend son envol comme chasseur indépendant..."
  ],
  "Currency from Kazor.": ["Moneda de Kazor.", "Monnaie de Kazor."],
  "Can be used to access the dungeon: Melliona Hive.": [
    "Puede utilizarse para acceder a la mazmorra: Colmena de Melliona.",
    "Peut être utilisée pour accéder au donjon : Ruche de Melliona."
  ],
  "Can be used to access the dungeon: The Sanctuary of Xal'Zirith.": [
    "Puede utilizarse para acceder a la mazmorra: Santuario de Xal'Zirith.",
    "Peut être utilisée pour accéder au donjon : Sanctuaire de Xal'Zirith."
  ],
  "Advance, used for various recipes and potions.": [
    "Ingrediente utilizado para diversas recetas y pociones.",
    "Ingrédient utilisé pour diverses recettes et potions."
  ],
  "Plant remains carrying a strange natural energy.": [
    "Restos vegetales que contienen una extraña energía natural.",
    "Des restes végétaux porteurs d'une étrange énergie naturelle."
  ],
  "Pale lilac stone with fine leaves.": [
    "Piedra lila pálida con hojas delicadas.",
    "Pierre lilas pâle aux fines feuilles."
  ],
  "This necklace is woven from living lianas. It is said to respond to the heartbeat of the forest.": [
    "Este collar está tejido con lianas vivas. Se dice que responde al latido del bosque.",
    "Ce collier est tressé avec des lianes vivantes. On dit qu'il répond au battement de cœur de la forêt."
  ],
  "A fine necklace adorned with a pendant, shining with a soft and romantic shine.": [
    "Un elegante collar adornado con un colgante que brilla con una luz suave y romántica.",
    "Un élégant collier orné d'un pendentif, brillant d'une lueur douce et romantique."
  ],
  "A vial filled with a shimmering pinkish liquid, giving off a soft, warm and captivating glow.": [
    "Un frasco lleno de un líquido rosado brillante que emite un resplandor suave, cálido y cautivador.",
    "Une fiole remplie d'un liquide rosé scintillant, dégageant une lueur douce, chaleureuse et captivante."
  ],
  "A sparkling stick topped with a heart-shaped crystal, casting a warm glow.": [
    "Un bastón brillante coronado por un cristal con forma de corazón que proyecta una luz cálida.",
    "Un bâton scintillant surmonté d'un cristal en forme de cœur, diffusant une lueur chaleureuse."
  ],
  "A very light, bright and well-woven belt.": [
    "Un cinturón muy ligero, brillante y bien tejido.",
    "Une ceinture très légère, brillante et bien tressée."
  ],
  "A tenacious and robust bracelet to quickly track down enemies.": [
    "Un brazalete tenaz y robusto para localizar rápidamente a los enemigos.",
    "Un bracelet tenace et robuste pour traquer rapidement les ennemis."
  ],
  "A pair of gloves sculpted to hunt prey relentlessly and light.": [
    "Unos guantes tallados para cazar presas sin descanso y con ligereza.",
    "Une paire de gants sculptée pour chasser les proies sans relâche et avec légèreté."
  ],
  "Luminescent spider venom.": ["Veneno luminiscente de araña.", "Venin d'araignée luminescent."],
  "A legendary and lunar piece, it shines with a mystical and rare glow the color of gold.": [
    "Una pieza legendaria y lunar que brilla con un resplandor místico y poco común de color dorado.",
    "Une pièce légendaire et lunaire, brillant d'une lueur mystique et rare couleur or."
  ],
  "Yellow dust, surprisingly, is a currency for the end of year celebrations, but it is the color of gold!": [
    "El polvo amarillo es, sorprendentemente, una moneda para las celebraciones de fin de año, ¡pero tiene el color del oro!",
    "La poussière jaune est étonnamment une monnaie pour les fêtes de fin d'année, mais elle a la couleur de l'or !"
  ],
  "A tenacious and robust bracelet to face the mist and its dangers.": [
    "Un brazalete tenaz y robusto para enfrentarse a la niebla y sus peligros.",
    "Un bracelet tenace et robuste pour affronter la brume et ses dangers."
  ],
  "Very powerful staff, forged using the power of Illfang and rare ores. However, it is now just a relic.": [
    "Un bastón muy poderoso, forjado con el poder de Illfang y minerales raros. Sin embargo, ahora no es más que una reliquia.",
    "Un bâton très puissant, forgé grâce au pouvoir d'Illfang et à des minerais rares. Cependant, ce n'est plus qu'une relique."
  ],
  "A novice belt built for dependable use.": [
    "Un cinturón de principiante diseñado para un uso fiable.",
    "Une ceinture de novice conçue pour une utilisation fiable."
  ],
  "A pair of novice gloves with a comfortable fit.": [
    "Unos guantes de principiante de ajuste cómodo.",
    "Une paire de gants de novice au port confortable."
  ],
  "A novice necklace with a simple, polished look.": [
    "Un collar de principiante de aspecto sencillo y pulido.",
    "Un collier de novice à l'apparence simple et polie."
  ],
  "Small wood powder made using oak wood.": [
    "Pequeño polvo de madera hecho con madera de roble.",
    "Petite poudre de bois fabriquée avec du bois de chêne."
  ],
  "A sturdy string woven from oak fibers, and mixed with spider threads.": [
    "Una cuerda resistente tejida con fibras de roble y mezclada con hilos de araña.",
    "Une ficelle robuste tressée avec des fibres de chêne et mélangée à des fils d'araignée."
  ],
  "Dipped in the blood spilled during initiation rites, its edge obeys only the will of the Circle.": [
    "Bañado en la sangre derramada durante los ritos de iniciación, su filo solo obedece a la voluntad del Círculo.",
    "Trempée dans le sang versé lors des rites d'initiation, sa lame n'obéit qu'à la volonté du Cercle."
  ],
  "Frightfully demonic grimoire that controls occult magic.": [
    "Un grimorio aterradoramente demoníaco que controla la magia oculta.",
    "Un grimoire terriblement démoniaque qui contrôle la magie occulte."
  ],
  "Worn during the secret ceremonies of the Circle, it plunges its wearer into sacred darkness.": [
    "Llevado durante las ceremonias secretas del Círculo, sume a quien lo lleva en una oscuridad sagrada.",
    "Porté lors des cérémonies secrètes du Cercle, il plonge son porteur dans une obscurité sacrée."
  ],
  "The sand within it froze during the last rite, time no longer has any hold on its wearer.": [
    "La arena que contiene se congeló durante el último rito; el tiempo ya no tiene poder sobre quien lo lleva.",
    "Le sable qu'il contient a gelé lors du dernier rite ; le temps n'a plus de prise sur son porteur."
  ],
  "Woven in a canvas blessed by the Master, it hides its wearer from the gaze of the profane.": [
    "Tejido en una lona bendecida por el Maestro, oculta a quien lo lleva de la mirada de los profanos.",
    "Tissé dans une toile bénie par le Maître, il dissimule son porteur au regard des profanes."
  ],
  "Snatched during the last rite of the Circle, he whispers the oaths of the missing members.": [
    "Arrebatado durante el último rito del Círculo, susurra los juramentos de los miembros desaparecidos.",
    "Arraché lors du dernier rite du Cercle, il murmure les serments des membres disparus."
  ],
  "A mysterious and occult token. It looks like it allows you to obtain a very dark reward...": [
    "Una ficha misteriosa y oculta. Parece permitir obtener una recompensa muy oscura...",
    "Un jeton mystérieux et occulte. Il semble permettre d'obtenir une récompense très sombre..."
  ],
  "Forged in the depths, this braclet still bears the mark of a fallen knight consumed by the darkness he served!": [
    "Forjado en las profundidades, este brazalete aún lleva la marca de un caballero caído consumido por la oscuridad a la que servía.",
    "Forgé dans les profondeurs, ce bracelet porte encore la marque d'un chevalier déchu consumé par les ténèbres qu'il servait !"
  ],
  "Prickly and unattractive, but useful.": [
    "Espinoso y poco atractivo, pero útil.",
    "Épineux et peu attrayant, mais utile."
  ],
  "Oracil thorn, collected from old shrubs. Valuable ingredient for potions and remedies.": [
    "Espina de Oracil recogida de arbustos antiguos. Ingrediente valioso para pociones y remedios.",
    "Épine d'Oracil récoltée sur de vieux arbustes. Ingrédient précieux pour les potions et les remèdes."
  ],
  "Orange stone with dark and light bands.": [
    "Piedra naranja con bandas claras y oscuras.",
    "Pierre orange aux bandes claires et sombres."
  ],
  "A red crystal ball made from the petrified blood of the high-ranking demon Vulcan.": [
    "Una bola de cristal roja hecha con la sangre petrificada del demonio de alto rango Vulcan.",
    "Une boule de cristal rouge faite du sang pétrifié du démon de haut rang Vulcan."
  ],
  "A carved ring to strengthen the dark energy of the woods.": [
    "Un anillo tallado para reforzar la energía oscura de los bosques.",
    "Une bague sculptée pour renforcer l'énergie sombre des bois."
  ],
  "Legend has it that this ring is still imbued with the bloodlust of the Harpy from which it came.": [
    "Cuenta la leyenda que este anillo aún está imbuido de la sed de sangre de la arpía de la que procede.",
    "La légende raconte que cette bague est encore imprégnée de la soif de sang de la harpie dont elle provient."
  ],
  "Small but powerful, it reacts to dangers quickly, like a dart ready to sting.": [
    "Pequeño pero poderoso, reacciona rápidamente a los peligros, como un dardo listo para picar.",
    "Petit mais puissant, il réagit rapidement aux dangers, comme une fléchette prête à piquer."
  ],
  "A sculpted ring to provide agility and assist with certain maneuvers.": [
    "Un anillo tallado para proporcionar agilidad y ayudar con ciertas maniobras.",
    "Une bague sculptée pour apporter de l'agilité et faciliter certaines manœuvres."
  ],
  "A sculpted ring to catch targets in our webs.": [
    "Un anillo tallado para atrapar objetivos en nuestras telarañas.",
    "Une bague sculptée pour capturer les cibles dans nos toiles."
  ],
  "A ring carved to serve the fangs of the wild woods.": [
    "Un anillo tallado para servir a los colmillos de los bosques salvajes.",
    "Une bague sculptée pour servir les crocs des bois sauvages."
  ],
  "A ring carved to serve the fierce tribe of orcs.": [
    "Un anillo tallado para servir a la feroz tribu de los orcos.",
    "Une bague sculptée pour servir la féroce tribu des orques."
  ],
  "A ring sculpted to also surgically strike its targets in the back.": [
    "Un anillo tallado para golpear quirúrgicamente a sus objetivos por la espalda.",
    "Une bague sculptée pour frapper chirurgicalement ses cibles dans le dos."
  ],
  "Carved from oak wood, reinforced with magical wood and enchanted with allium.": [
    "Tallado en madera de roble, reforzado con madera mágica y encantado con allium.",
    "Taillé dans du bois de chêne, renforcé avec du bois magique et enchanté à l'allium."
  ],
  "A torn garment belonging to a former human, now a skeleton protecting his domain.": [
    "Una prenda desgarrada que perteneció a un antiguo humano, ahora un esqueleto que protege su territorio.",
    "Un vêtement déchiré ayant appartenu à un ancien humain, désormais un squelette protégeant son domaine."
  ],
  "A supple and sparkling feather, full of aquatic essence.": [
    "Una pluma flexible y brillante, llena de esencia acuática.",
    "Une plume souple et scintillante, pleine d'essence aquatique."
  ],
  "A deep red rose with impeccable petals, a delicate symbol of sincere attachment.": [
    "Una rosa roja intensa de pétalos impecables, delicado símbolo de un vínculo sincero.",
    "Une rose rouge profonde aux pétales impeccables, symbole délicat d'un attachement sincère."
  ],
  "Putrefaction is gradually eating away at this heart.": [
    "La putrefacción está consumiendo poco a poco este corazón.",
    "La putréfaction ronge progressivement ce cœur."
  ],
  "A solid and resistant horn, coming from a robust and powerful Rugiboeuf!": [
    "¡Un cuerno sólido y resistente procedente de un Rugiboeuf robusto y poderoso!",
    "Une corne solide et résistante provenant d'un Rugiboeuf robuste et puissant !"
  ],
  "Allows you to remove a rune at random by right-clicking on the item of your choice.": [
    "Permite eliminar una runa al azar haciendo clic derecho sobre el objeto elegido.",
    "Permet de retirer une rune aléatoire en faisant un clic droit sur l'objet choisi."
  ],
  "Allows you to remove two runes at random by right-clicking on the item of your choice.": [
    "Permite eliminar dos runas al azar haciendo clic derecho sobre el objeto elegido.",
    "Permet de retirer deux runes aléatoires en faisant un clic droit sur l'objet choisi."
  ],
  "Forged with runestones and materials obtained from bees.": [
    "Forjado con piedras rúnicas y materiales obtenidos de las abejas.",
    "Forgé avec des pierres runiques et des matériaux obtenus auprès des abeilles."
  ],
  "Engraved with ancient inscriptions, it is only activated in the presence of a second component.": [
    "Grabado con inscripciones antiguas, solo se activa en presencia de un segundo componente.",
    "Gravé d'inscriptions anciennes, il ne s'active qu'en présence d'un second composant."
  ],
  "Forged from the branches of the World Tree Yggdrasil, felled during the Great Giant War.": [
    "Forjado con ramas del Árbol del Mundo Yggdrasil, talado durante la Gran Guerra de los Gigantes.",
    "Forgé avec des branches de l'Arbre-Monde Yggdrasil, abattu durant la Grande Guerre des géants."
  ],
  "Deep, luminous blue crystal.": ["Cristal azul intenso y luminoso.", "Cristal bleu profond et lumineux."],
  "Golden crystal in sunny lights.": ["Cristal dorado de brillo soleado.", "Cristal doré aux reflets solaires."],
  "A very strong ax, perfect for breaking more resistant logs.": [
    "Un hacha muy resistente, perfecta para romper troncos más duros.",
    "Une hache très solide, parfaite pour briser les bûches les plus résistantes."
  ],
  "A very strong pickaxe, perfect for mining stronger ores.": [
    "Un pico muy resistente, perfecto para extraer minerales más duros.",
    "Une pioche très solide, parfaite pour extraire des minerais plus résistants."
  ],
  "A deep green feather with bright reflections, light and delicately ribbed.": [
    "Una pluma verde intensa de reflejos brillantes, ligera y delicadamente estriada.",
    "Une plume vert profond aux reflets éclatants, légère et délicatement nervurée."
  ],
  "An ornate scepter with delicate ornaments, symbol of soft and luminous magic.": [
    "Un cetro ornamentado con delicados adornos, símbolo de una magia suave y luminosa.",
    "Un sceptre orné de délicats motifs, symbole d'une magie douce et lumineuse."
  ],
  "Forged with scrap metal collected on level 2.": [
    "Forjado con chatarra recogida en el nivel 2.",
    "Forgé avec de la ferraille récupérée au niveau 2."
  ],
  "A pair of gloves made from scrap metal, rustic and sturdy looking": [
    "Unos guantes hechos de chatarra, de aspecto rústico y resistente.",
    "Une paire de gants en ferraille, à l'aspect rustique et robuste."
  ],
  "A crude amulet, forged from a mixture of scrap metal. Nothing magical, just robustness.": [
    "Un amuleto tosco forjado con una mezcla de chatarra. Nada mágico, solo robustez.",
    "Une amulette grossière forgée dans un mélange de ferraille. Rien de magique, seulement de la robustesse."
  ],
  "A simple piece of ancient scrap, forged at Tier 2.": [
    "Una simple pieza de chatarra antigua, forjada en el nivel 2.",
    "Une simple pièce de ferraille ancienne, forgée au niveau 2."
  ],
  "Forged from rustic scrap metal, this ring is distinguished by its light color and solidity.": [
    "Forjado con chatarra rústica, este anillo destaca por su color claro y su solidez.",
    "Forgée dans de la ferraille rustique, cette bague se distingue par sa couleur claire et sa solidité."
  ],
  "A sturdy string woven from a scrap metal alloy, and mixed with spider threads.": [
    "Una cuerda resistente tejida con una aleación de chatarra y mezclada con hilos de araña.",
    "Une ficelle robuste tressée avec un alliage de ferraille et mélangée à des fils d'araignée."
  ],
  "This scroll allows the player who uses it to receive a point to reset their class.": [
    "Este pergamino permite al jugador que lo usa recibir un punto para reiniciar su clase.",
    "Ce parchemin permet au joueur qui l'utilise d'obtenir un point pour réinitialiser sa classe."
  ],
  "This scroll allows the player who uses it to receive a point to reset their attribute points.": [
    "Este pergamino permite al jugador que lo usa recibir un punto para reiniciar sus puntos de atributos.",
    "Ce parchemin permet au joueur qui l'utilise d'obtenir un point pour réinitialiser ses points d'attributs."
  ],
  "A billhook with graceful lines, enhanced with romantic engravings along the blade.": [
    "Una podadera de líneas elegantes, realzada con grabados románticos a lo largo de la hoja.",
    "Une serpe aux lignes gracieuses, rehaussée de gravures romantiques le long de la lame."
  ],
  "A very hard plate of shell, torn from a shark fish. Strong and durable perfect for some heavy armor.": [
    "Una placa de caparazón muy dura, arrancada a un pez tiburón. Resistente y duradera, perfecta para ciertas armaduras pesadas.",
    "Une plaque de carapace très dure, arrachée à un poisson-requin. Solide et durable, parfaite pour certaines armures lourdes."
  ],
  "Strong and resistant, it protects the curse that weighs on its wearer, thus absorbing attacks.": [
    "Fuerte y resistente, protege la maldición que pesa sobre quien lo lleva y absorbe los ataques.",
    "Solide et résistante, elle protège la malédiction qui pèse sur son porteur et absorbe ainsi les attaques."
  ],
  "Forged from the shell of Ika's turtles. Ideal for cashing in without flinching.": [
    "Forjado con el caparazón de las tortugas de Ika. Ideal para encajar golpes sin inmutarse.",
    "Forgé avec la carapace des tortues d'Ika. Idéal pour encaisser les coups sans broncher."
  ],
  "Eroded by time and dust, this shield was lost across time and dimensions.": [
    "Erosionado por el tiempo y el polvo, este escudo se perdió a través de las eras y las dimensiones.",
    "Érodé par le temps et la poussière, ce bouclier s'est perdu à travers les époques et les dimensions."
  ],
  "A shield decorated with heart-shaped patterns, in pink and gold hues evoking gentle protection.": [
    "Un escudo decorado con motivos de corazones, en tonos rosas y dorados que evocan una protección delicada.",
    "Un bouclier décoré de motifs en forme de cœur, aux teintes roses et dorées évoquant une protection douce."
  ],
  "Simple boots with a clean, practical design.": [
    "Botas sencillas de diseño limpio y práctico.",
    "Des bottes simples au design épuré et pratique."
  ],
  "A simple pair of gloves, offering basic comfort.": [
    "Unos guantes sencillos que ofrecen una comodidad básica.",
    "Une paire de gants simple offrant un confort élémentaire."
  ],
  "An amulet carved from bones, imbued with dark energy.": [
    "Un amuleto tallado en huesos e imbuido de energía oscura.",
    "Une amulette taillée dans des os et imprégnée d'énergie sombre."
  ],
  "Small bone found on low-ranking skeletons. Certainly useful for certain confections.": [
    "Hueso pequeño encontrado en esqueletos de bajo rango. Sin duda útil para ciertas preparaciones.",
    "Petit os trouvé sur des squelettes de bas rang. Certainement utile pour certaines préparations."
  ],
  "This cold skull seems to retain the silent echo of a dead person.": [
    "Este cráneo frío parece conservar el eco silencioso de una persona muerta.",
    "Ce crâne froid semble retenir l'écho silencieux d'une personne morte."
  ],
  "A magnificent feather with the beauty and color of the sky.": [
    "Una magnífica pluma con la belleza y el color del cielo.",
    "Une magnifique plume de la beauté et de la couleur du ciel."
  ],
  "A small, beautiful gooey jelly that sticks to your hands for a long time.": [
    "Una pequeña y hermosa gelatina pegajosa que se adhiere a las manos durante mucho tiempo.",
    "Une petite et belle gelée gluante qui colle longtemps aux mains."
  ],
  "A small fabric bag, perfect for slipping coins into.": [
    "Una pequeña bolsa de tela, perfecta para guardar monedas.",
    "Une petite bourse en tissu, parfaite pour y glisser des pièces."
  ],
  "A finely crafted crown, mixing solar and winter motifs, symbol of the balance between the seasons.": [
    "Una corona finamente elaborada que mezcla motivos solares e invernales, símbolo del equilibrio entre las estaciones.",
    "Une couronne finement ouvragée mêlant motifs solaires et hivernaux, symbole de l'équilibre entre les saisons."
  ],
  "An old, forgotten book of spells, its former owner poured his soul through its pages.": [
    "Un antiguo libro de hechizos olvidado; su antiguo dueño vertió su alma en sus páginas.",
    "Un vieux livre de sorts oublié, dont l'ancien propriétaire a versé son âme dans les pages."
  ],
  "A fragment of the hearts of the fallen, still warm, letting in a light that no spell can explain.": [
    "Un fragmento de los corazones de los caídos, aún cálido, que deja entrar una luz inexplicable para cualquier hechizo.",
    "Un fragment des cœurs des défunts, encore chaud, laissant entrer une lumière qu'aucun sort ne peut expliquer."
  ],
  "This book was forged using powerful Tier 1 materials. It embodies the power of a sorcerer.": [
    "Este libro fue forjado con materiales poderosos de nivel 1. Encarna el poder de un hechicero.",
    "Ce livre a été forgé avec de puissants matériaux de niveau 1. Il incarne le pouvoir d'un sorcier."
  ],
  "Clothing from another age, embroidered with magical threads. It was once worn by a legendary wizard.": [
    "Ropa de otra época, bordada con hilos mágicos. Perteneció a un mago legendario.",
    "Des vêtements d'une autre époque, brodés de fils magiques. Ils furent autrefois portés par un sorcier légendaire."
  ],
  "A soul is contained in this object. It can be obtained by killing its owner or by crafting it at the blacksmith.": [
    "Este objeto contiene un alma. Puede obtenerse matando a su dueño o fabricándolo en la herrería.",
    "Cet objet contient une âme. Elle peut être obtenue en tuant son propriétaire ou en la fabriquant chez le forgeron."
  ],
  "Sharp tip, piercing and powerful like the stinger of an angry bee.": [
    "Una punta afilada, perforante y poderosa como el aguijón de una abeja enfurecida.",
    "Une pointe acérée, perforante et puissante comme le dard d'une abeille en colère."
  ],
  "Shaped in a spectral fabric linked to the forces of the forest. It pulses gently upon contact with magic.": [
    "Confeccionado con una tela espectral vinculada a las fuerzas del bosque. Pulsa suavemente al contacto con la magia.",
    "Façonné dans un tissu spectral lié aux forces de la forêt. Il pulse doucement au contact de la magie."
  ],
  "A tenacious and robust bracelet to escape your enemies.": [
    "Un brazalete tenaz y robusto para escapar de tus enemigos.",
    "Un bracelet tenace et robuste pour échapper à vos ennemis."
  ],
  "A mysterious spectral essence.": ["Una esencia espectral misteriosa.", "Une essence spectrale mystérieuse."],
  "A fabric imbued with dark magic and curses.": [
    "Una tela imbuida de magia oscura y maldiciones.",
    "Un tissu imprégné de magie sombre et de malédictions."
  ],
  "A very light, spectral and strange feather.": [
    "Una pluma muy ligera, espectral y extraña.",
    "Une plume très légère, spectrale et étrange."
  ],
  "A pair of gloves crafted for precise strikes against unsuspecting targets.": [
    "Unos guantes fabricados para asestar golpes precisos a objetivos desprevenidos.",
    "Une paire de gants conçue pour porter des coups précis à des cibles inattentives."
  ],
  "A dark mixture of ancient materials lost in a great labyrinth. It could be a ghost's grimoire.": [
    "Una mezcla oscura de materiales antiguos perdida en un gran laberinto. Podría ser el grimorio de un fantasma.",
    "Un mélange sombre de matériaux anciens perdu dans un grand labyrinthe. Il pourrait s'agir du grimoire d'un fantôme."
  ],
  "A lock of ethereal mane, torn from a spectral frame. She still pulses with rapid energy.": [
    "Un mechón de crin etérea arrancado de una montura espectral. Aún palpita con una energía veloz.",
    "Une mèche de crinière éthérée arrachée à une monture spectrale. Elle pulse encore d'une énergie rapide."
  ],
  "A strange and mysterious will-o'-the-wisp floating in the air, illuminating the surrounding darkness.": [
    "Un fuego fatuo extraño y misterioso que flota en el aire e ilumina la oscuridad circundante.",
    "Un feu follet étrange et mystérieux flottant dans les airs, illuminant les ténèbres environnantes."
  ],
  "Woven from spider web and enchanted with corrupted spores.": [
    "Tejido con telaraña y encantado con esporas corruptas.",
    "Tissé avec de la toile d'araignée et enchanté par des spores corrompues."
  ],
  "A thin, but incredibly durable fabric. Ideal for light or enchanted equipment.": [
    "Una tela fina pero increíblemente resistente. Ideal para equipo ligero o encantado.",
    "Un tissu fin mais incroyablement résistant. Idéal pour de l'équipement léger ou enchanté."
  ],
  "Red spider eyes.": ["Ojos de araña roja.", "Yeux d'araignée rouge."],
  "Small, very fragile wire, it can break at any time.": [
    "Un alambre pequeño y muy frágil que puede romperse en cualquier momento.",
    "Un petit fil très fragile, qui peut se casser à tout moment."
  ],
  "A dark, viscous liquid extracted from the queen spider.": [
    "Un líquido oscuro y viscoso extraído de la araña reina.",
    "Un liquide sombre et visqueux extrait de l'araignée reine."
  ],
  "Agile bow, designed for patient and deadly hunters.": [
    "Un arco ágil diseñado para cazadores pacientes y letales.",
    "Un arc agile conçu pour les chasseurs patients et mortels."
  ],
  "A coat stolen by a daring thief.": [
    "Un abrigo robado por un ladrón audaz.",
    "Un manteau volé par un voleur audacieux."
  ],
  "Medallion found in Felyanole Cave. It should be returned to its owner!": [
    "¡Medallón encontrado en la cueva de Felyanole! Debe devolverse a su dueño.",
    "Médaille trouvée dans la grotte de Felyanole. Elle doit être rendue à son propriétaire !"
  ],
  "A durable bracelet made of stone.": ["Un brazalete resistente hecho de piedra.", "Un bracelet durable en pierre."],
  "A heavy pair of stone gloves.": ["Unos guantes pesados de piedra.", "Une paire de gants lourds en pierre."],
  "A stone necklace, quite classy despite everything.": [
    "Un collar de piedra bastante elegante a pesar de todo.",
    "Un collier en pierre assez élégant malgré tout."
  ],
  "A durable ring made of stone.": ["Un anillo resistente hecho de piedra.", "Une bague durable en pierre."],
  "A strange belt, quite effective despite everything.": [
    "Un cinturón extraño, bastante eficaz a pesar de todo.",
    "Une ceinture étrange, assez efficace malgré tout."
  ],
  "This rune seems ancient.": ["Esta runa parece antigua.", "Cette rune semble ancienne."],
  "An elegant sword with pink highlights, decorated with romantic engravings along the blade.": [
    "Una espada elegante con reflejos rosas, decorada con grabados románticos a lo largo de la hoja.",
    "Une épée élégante aux reflets roses, décorée de gravures romantiques le long de la lame."
  ],
  "A fabric from the Sylnovars.": ["Una tela de los Sylnovars.", "Un tissu des Sylnovars."],
  "A gem from the Sylnovars.": ["Una gema de los Sylnovars.", "Une gemme des Sylnovars."],
  "A tissue from the woods.": ["Un tejido de los bosques.", "Un tissu des bois."],
  "A gem from the Sylvaers.": ["Una gema de los Sylvaers.", "Une gemme des Sylvaers."],
  "Small sprout in a bowl, very useful in making life potions.": [
    "Un pequeño brote en un cuenco, muy útil para preparar pociones de vida.",
    "Une petite pousse dans un bol, très utile pour préparer des potions de vie."
  ],
  "Natural material, used mainly for light and fast armor.": [
    "Material natural utilizado principalmente para armaduras ligeras y rápidas.",
    "Matériau naturel utilisé principalement pour les armures légères et rapides."
  ],
  "Woven from vines and leaves infused with the calming energy of the swamp.": [
    "Tejido con lianas y hojas imbuidas de la energía calmante del pantano.",
    "Tissé avec des lianes et des feuilles imprégnées de l'énergie apaisante du marais."
  ],
  "Flexible and adjusted for optimal mobility in hostile terrain. Used by experienced trackers.": [
    "Flexible y ajustado para una movilidad óptima en terrenos hostiles. Utilizado por rastreadores experimentados.",
    "Flexible et ajusté pour une mobilité optimale en terrain hostile. Utilisé par des traqueurs expérimentés."
  ],
  "A timber wolf tail": ["Una cola de lobo de madera.", "Une queue de loup des bois."],
  "From the claws of Adoryll a legendary majestic bird.": [
    "Procedente de las garras de Adoryll, un ave majestuosa y legendaria.",
    "Provenant des serres d'Adoryll, un oiseau majestueux et légendaire."
  ],
  "A belt made from the resources of bulls.": [
    "Un cinturón fabricado con recursos de toro.",
    "Une ceinture fabriquée avec des ressources de taureau."
  ],
  "Forged from a heavy, raw metal, it bears the mark of the wild bull. Brute strength and unfailing resistance.": [
    "Forjado con un metal pesado y sin refinar, lleva la marca del toro salvaje. Fuerza bruta y resistencia inquebrantable.",
    "Forgé dans un métal lourd et brut, il porte la marque du taureau sauvage. Une force brute et une résistance infaillible."
  ],
  "Forged near a corrupted fault, this tear radiates a desolate and sad force.": [
    "Forjada cerca de una falla corrupta, esta lágrima irradia una fuerza desolada y triste.",
    "Forgée près d'une faille corrompue, cette larme rayonne d'une force désolée et triste."
  ],
  "Robust and resistant skin, capable of absorbing heavy impacts.": [
    "Piel robusta y resistente, capaz de absorber impactos fuertes.",
    "Peau robuste et résistante, capable d'absorber les chocs violents."
  ],
  "Hidden beneath broken stone circles, this sub-dungeon is tuned for tight duels and poison attrition. The deeper vaults feel like a side route meant for front-liners only.":
    [
      "Oculta bajo círculos de piedra rotos, esta submazmorra está pensada para duelos cerrados y desgaste por veneno. Las cámaras más profundas parecen una ruta secundaria reservada a los combatientes de primera línea.",
      "Caché sous des cercles de pierre brisés, ce sous-donjon est conçu pour les duels rapprochés et l'usure au poison. Les salles les plus profondes ressemblent à un itinéraire secondaire réservé aux combattants de première ligne."
    ],
  "A fiery underground nest where blazing creatures gather.": [
    "Un nido subterráneo ardiente donde se reúnen criaturas llameantes.",
    "Un nid souterrain enflammé où se rassemblent des créatures ardentes."
  ],
  "A mythical snake sliding between deep currents, Nymbrea embodies the grace and treachery of calm waters. Its scales sparkle like cursed pearls, and its hypnotic gaze draws the unwary towards the abyss.":
    [
      "Una serpiente mítica que se desliza entre corrientes profundas. Nymbrea encarna la gracia y la traición de las aguas tranquilas. Sus escamas brillan como perlas malditas y su mirada hipnótica atrae a los incautos hacia el abismo.",
      "Un serpent mythique glissant entre les courants profonds, Nymbrea incarne la grâce et la traîtrise des eaux calmes. Ses écailles brillent comme des perles maudites et son regard hypnotique attire les imprudents vers l'abîme."
    ],
  "A hidden oasis tucked away in Map 2's desert regions.": [
    "Un oasis oculto en las regiones desérticas del mapa 2.",
    "Une oasis cachée dans les régions désertiques de la carte 2."
  ],
  "The stronghold of the renowned and feared OG Guild. A strategic location reserved for elite veterans. The walls exude glory and past victories.":
    [
      "La fortaleza del famoso y temido Gremio OG. Una ubicación estratégica reservada a veteranos de élite. Sus muros desprenden gloria y victorias pasadas.",
      "Le bastion de la célèbre et redoutée Guilde OG. Un emplacement stratégique réservé aux vétérans d'élite. Ses murs exhalent la gloire et les victoires passées."
    ],
  "An enchanted valley where the petals dance in the wind. The scent of flowers soothes the souls of travelers. But behind the beauty... lies an ancient secret.":
    [
      "Un valle encantado donde los pétalos danzan con el viento. El aroma de las flores calma el alma de los viajeros. Pero tras la belleza... se esconde un antiguo secreto.",
      "Une vallée enchantée où les pétales dansent dans le vent. Le parfum des fleurs apaise l'âme des voyageurs. Mais derrière la beauté... se cache un ancien secret."
    ],
  "An ancient and cunning creature, Pricilia weaves her webs in the forgotten corners of the darkest forests. Its prey never sees death... only his glowing eyes.":
    [
      "Una criatura antigua y astuta, Pricilia teje sus redes en los rincones olvidados de los bosques más oscuros. Sus presas nunca ven la muerte... solo sus ojos brillantes.",
      "Créature ancienne et rusée, Pricilia tisse ses toiles dans les recoins oubliés des forêts les plus sombres. Ses proies ne voient jamais la mort... seulement ses yeux lumineux."
    ],
  "A wild beast from the forests of the first level. He charges relentlessly, driven by primitive rage.": [
    "Una bestia salvaje de los bosques del primer nivel. Embiste sin descanso, impulsada por una furia primitiva.",
    "Une bête sauvage des forêts du premier niveau. Elle charge sans relâche, animée par une rage primitive."
  ],
  "The buzzing hive where Melliona's creatures gather.": [
    "La colmena zumbante donde se reúnen las criaturas de Melliona.",
    "La ruche bourdonnante où se rassemblent les créatures de Melliona."
  ],
  "A colossal boss roaming the northern reaches of Map 2.": [
    "Un jefe colosal que recorre las regiones septentrionales del mapa 2.",
    "Un boss colossal parcourant les régions septentrionales de la carte 2."
  ],
  "Once an impregnable bastion, the Snow Citadel was the scene of a forgotten siege, lost in the snowflakes of time. Its ramparts, frozen in ice, guard the scars. Today, only the most daring dare to pass through its doors...":
    [
      "Antaño un bastión inexpugnable, la Ciudadela de Nieve fue escenario de un asedio olvidado, perdido entre los copos del tiempo. Sus murallas, congeladas en hielo, guardan las cicatrices. Hoy solo los más osados se atreven a cruzar sus puertas...",
      "Autrefois bastion imprenable, la Citadelle des neiges fut le théâtre d'un siège oublié, perdu dans les flocons du temps. Ses remparts gelés gardent les cicatrices. Aujourd'hui, seuls les plus audacieux osent franchir ses portes..."
    ],
  "A rugged region known for strong winds and sparse vegetation.": [
    "Una región escarpada conocida por sus fuertes vientos y su escasa vegetación.",
    "Une région accidentée connue pour ses vents violents et sa végétation clairsemée."
  ],
  "Luminescent crystals with mysterious properties. Protected by Tolbana mages...": [
    "Cristales luminiscentes con propiedades misteriosas. Protegidos por los magos de Tolbana...",
    "Des cristaux luminescents aux propriétés mystérieuses. Protégés par les mages de Tolbana..."
  ],
  "Built on the mountainside, Tolbana is home to the largest magical libraries in the known world. Its streets vibrate with energy, and its towers resonate with the echo of age-old incantations.":
    [
      "Construida en la ladera de la montaña, Tolbana alberga las mayores bibliotecas mágicas del mundo conocido. Sus calles vibran de energía y sus torres resuenan con el eco de encantamientos ancestrales.",
      "Construite à flanc de montagne, Tolbana abrite les plus grandes bibliothèques magiques du monde connu. Ses rues vibrent d'énergie et ses tours résonnent de l'écho d'incantations séculaires."
    ],
  "Massive and wild, this creature watches over the forest. She repels intruders with devastating punches. No words, only the brute force of nature.":
    [
      "Enorme y salvaje, esta criatura vigila el bosque. Repele a los intrusos con golpes devastadores. Sin palabras, solo la fuerza bruta de la naturaleza.",
      "Massive et sauvage, cette créature veille sur la forêt. Elle repousse les intrus à coups dévastateurs. Aucun mot, seulement la force brute de la nature."
    ],
  "A towering spire watched over by Taurus.": [
    "Una torre imponente vigilada por Taurus.",
    "Une flèche imposante surveillée par Taurus."
  ],
  "The Town of Beginnings is a peaceful haven in a still unknown virtual world. This is where every adventure begins.":
    [
      "La Ciudad de los Comienzos es un refugio pacífico en un mundo virtual aún desconocido. Aquí comienza toda aventura.",
      "La Ville des commencements est un havre paisible dans un monde virtuel encore inconnu. C'est ici que commence chaque aventure."
    ],
  "The town of Urbus, a key waypoint in the Map 2 region.": [
    "La ciudad de Urbus, un punto de referencia clave en la región del mapa 2.",
    "La ville d'Urbus, un point de passage essentiel de la région de la carte 2."
  ],
  "A foggy valley where the howls still resonate. It is said that no wolf hunts there alone... Their shadows watch from the heights.":
    [
      "Un valle neblinoso donde aún resuenan los aullidos. Se dice que ningún lobo caza allí solo... Sus sombras vigilan desde las alturas.",
      "Une vallée brumeuse où résonnent encore les hurlements. On dit qu'aucun loup n'y chasse seul... Leurs ombres observent depuis les hauteurs."
    ],
  "Perched at the top of a windy massif, Vallhat watches, silent and isolated. Its heights hide many secrets.": [
    "En lo alto de un macizo azotado por el viento, Vallhat observa en silencio y aislamiento. Sus alturas esconden muchos secretos.",
    "Perchée au sommet d'un massif balayé par le vent, Vallhat observe, silencieuse et isolée. Ses hauteurs cachent de nombreux secrets."
  ],
  "A shadowy boss hidden beneath the surface.": [
    "Un jefe sombrío oculto bajo la superficie.",
    "Un boss ténébreux caché sous la surface."
  ],
  "Calm and mystery surround its troubled waters... A place of meditation, but also of disappearance.": [
    "La calma y el misterio rodean sus aguas turbias... Un lugar de meditación, pero también de desapariciones.",
    "Le calme et le mystère entourent ses eaux troublées... Un lieu de méditation, mais aussi de disparitions."
  ],
  "A rare boss found in the western areas of Map 2.": [
    "Un jefe raro encontrado en las zonas occidentales del mapa 2.",
    "Un boss rare trouvé dans les régions occidentales de la carte 2."
  ],
  "A fractured ruin wrapped in red mist where sword skills desync in narrow halls. Parties that clear its upper chambers often hear one extra set of footsteps behind them.":
    [
      "Una ruina fracturada envuelta en niebla roja, donde las habilidades de espada se desincronizan en pasillos estrechos. Los grupos que despejan sus cámaras superiores suelen oír un juego de pasos adicional detrás de ellos.",
      "Une ruine fracturée enveloppée de brume rouge, où les compétences d'épée se désynchronisent dans d'étroits couloirs. Les groupes qui nettoient ses salles supérieures entendent souvent une paire de pas supplémentaire derrière eux."
    ],
  "Lurking in the damp darkness of the dungeon, Yula is a spider feared by adventurers. Its sharp legs and glowing eyes inspire terror in anyone who crosses its path.":
    [
      "Agazapada en la oscuridad húmeda de la mazmorra, Yula es una araña temida por los aventureros. Sus patas afiladas y sus ojos brillantes aterrorizan a cualquiera que se cruce en su camino.",
      "Tapie dans l'obscurité humide du donjon, Yula est une araignée redoutée des aventuriers. Ses pattes acérées et ses yeux lumineux inspirent la terreur à quiconque croise son chemin."
    ],
  "Solid and sharp, this horn testifies to the brutal strength of the animal.": [
    "Sólido y afilado, este cuerno da fe de la fuerza brutal del animal.",
    "Solide et acérée, cette corne témoigne de la force brutale de l'animal."
  ],
  "A pair of sculpted gloves to catch targets in our webs.": [
    "Unos guantes tallados para atrapar objetivos en nuestras telarañas.",
    "Une paire de gants sculptée pour capturer les cibles dans nos toiles."
  ],
  "A thick piece of shell from a slaughtered Ika tortoise.": [
    "Un trozo grueso de caparazón de una tortuga Ika sacrificada.",
    "Un épais morceau de carapace provenant d'une tortue Ika abattue."
  ],
  "Translucent orange stone with warm tones.": [
    "Piedra naranja translúcida de tonos cálidos.",
    "Pierre orange translucide aux teintes chaleureuses."
  ],
  "A bright cat like that of the Lunar Year, bringing luck and prosperity.": [
    "Un gato brillante como el del Año Lunar, que trae suerte y prosperidad.",
    "Un chat lumineux comme celui de l'Année lunaire, apportant chance et prospérité."
  ],
  "A pair of pants belonging to Caulette, a rather strong smell emanates from them...": [
    "Unos pantalones pertenecientes a Caulette; desprenden un olor bastante fuerte...",
    "Un pantalon appartenant à Caulette, dont émane une odeur assez forte..."
  ],
  "A very dark mushroom, but not toxic... or so they say!": [
    "Un champiñón muy oscuro, pero no tóxico... ¡o eso dicen!",
    "Un champignon très sombre, mais pas toxique... enfin, c'est ce qu'on dit !"
  ],
  "Split blade, wobbly handle, but still good for cutting wood.": [
    "Hoja partida y mango inestable, pero todavía sirve para cortar madera.",
    "Lame fendue et manche branlant, mais toujours utile pour couper du bois."
  ],
  "A box of chocolate, in the shape of a heart, for a great love.": [
    "Una caja de chocolate con forma de corazón para un gran amor.",
    "Une boîte de chocolats en forme de cœur pour un grand amour."
  ],
  "This applied rune allows equipment to increase its stats.": [
    "Esta runa aplicada permite al equipo aumentar sus estadísticas.",
    "Cette rune appliquée permet à l'équipement d'augmenter ses statistiques."
  ],
  "A dark rock containing traces of raw coal.": [
    "Una roca oscura que contiene restos de carbón en bruto.",
    "Une roche sombre contenant des traces de charbon brut."
  ],
  "Sculpted by such white fur, woven by resistant threads, sublimated with claws and enchanted by a powerful winter essence.":
    [
      "Tallada con una piel tan blanca, tejida con hilos resistentes, realzada con garras y encantada por una poderosa esencia invernal.",
      "Sculptée dans une fourrure aussi blanche, tissée de fils résistants, sublimée par des griffes et enchantée par une puissante essence hivernale."
    ],
  "Slip this kit over a damaged tool to restore 100% of its maximum durability.": [
    "Coloca este kit sobre una herramienta dañada para restaurar el 100 % de su durabilidad máxima.",
    "Placez ce kit sur un outil endommagé pour restaurer 100 % de sa durabilité maximale."
  ],
  "An amulet carved from simple iron, heavy and marked by the wear and tear of time.": [
    "Un amuleto tallado en hierro sencillo, pesado y marcado por el desgaste del tiempo.",
    "Une amulette taillée dans du fer simple, lourde et marquée par l'usure du temps."
  ],
  "Forged with the copper found on tier 1. The base among the accessories.": [
    "Forjado con el cobre encontrado en el nivel 1. La base entre los accesorios.",
    "Forgé avec le cuivre trouvé au niveau 1. La base parmi les accessoires."
  ],
  "A simple piece of ancient iron, forged at Tier 1.": [
    "Una simple pieza de hierro antiguo, forjada en el nivel 1.",
    "Une simple pièce de fer ancien, forgée au niveau 1."
  ],
  "A pair of polished copper gloves, with a warm sheen and a solidly forged appearance.": [
    "Unos guantes de cobre pulido, con un brillo cálido y un aspecto sólidamente forjado.",
    "Une paire de gants en cuivre poli, au reflet chaleureux et à l'apparence solidement forgée."
  ],
  "Low quality ores, useful for beginning adventures and beginners.": [
    "Minerales de baja calidad, útiles para comenzar la aventura y para principiantes.",
    "Des minerais de basse qualité, utiles pour débuter l'aventure et pour les débutants."
  ],
  "Forged in lightly polished copper, this ring is distinguished by its conductivity and lightness.": [
    "Forjado con cobre ligeramente pulido, este anillo destaca por su conductividad y ligereza.",
    "Forgée dans du cuivre légèrement poli, cette bague se distingue par sa conductivité et sa légèreté."
  ],
  "A sturdy string made from a copper alloy, and mixed with spider threads.": [
    "Una cuerda resistente hecha de una aleación de cobre y mezclada con hilos de araña.",
    "Une ficelle robuste fabriquée avec un alliage de cuivre et mélangée à des fils d'araignée."
  ],
  "Raw crystal with clean, hard edges.": [
    "Cristal en bruto con bordes limpios y duros.",
    "Cristal brut aux arêtes nettes et dures."
  ],
  "This bark can be used to break or repel corruption in Tier 2!": [
    "¡Esta corteza puede utilizarse para romper o repeler la corrupción en el nivel 2!",
    "Cette écorce peut servir à briser ou repousser la corruption au niveau 2 !"
  ],
  "Traces of corruption emanate from this object.": [
    "Este objeto emana rastros de corrupción.",
    "Des traces de corruption émanent de cet objet."
  ],
  "A corrupted feather from a corrupted harpy!": [
    "¡Una pluma corrupta de una arpía corrupta!",
    "Une plume corrompue provenant d'une harpie corrompue !"
  ],
  "A corrupted fragment of unknown origin, but which radiates a mysterious and disturbing energy.": [
    "Un fragmento corrupto de origen desconocido que irradia una energía misteriosa e inquietante.",
    "Un fragment corrompu d'origine inconnue, qui rayonne d'une énergie mystérieuse et inquiétante."
  ],
  "This mask corrupted, by a mysterious force, offers powerful power for an important sacrifice.": [
    "Esta máscara, corrompida por una fuerza misteriosa, ofrece un gran poder para un sacrificio importante.",
    "Ce masque, corrompu par une force mystérieuse, offre un grand pouvoir pour un sacrifice important."
  ],
  "Forged near a corrupted rift, this belt radiates an insatiable dark force.": [
    "Forjado cerca de una grieta corrupta, este cinturón irradia una fuerza oscura insaciable.",
    "Forgée près d'une faille corrompue, cette ceinture rayonne d'une force sombre insatiable."
  ],
  "Forged on the edge of a rift where light is torn apart, these gloves absorb hatred and return it with merciless blows.":
    [
      "Forjados al borde de una grieta donde la luz se desgarra, estos guantes absorben el odio y lo devuelven con golpes implacables.",
      "Forgés au bord d'une faille où la lumière se déchire, ces gants absorbent la haine et la renvoient par des coups impitoyables."
    ],
  "Forged in the heart of a corrupted rift, this necklace pulses with unstable and voracious magic.": [
    "Forjado en el corazón de una grieta corrupta, este collar palpita con una magia inestable y voraz.",
    "Forgé au cœur d'une faille corrompue, ce collier palpite d'une magie instable et vorace."
  ],
  "A strange spore imbued with corruption...": [
    "Una espora extraña imbuida de corrupción...",
    "Une spore étrange imprégnée de corruption..."
  ],
  "A rudimentary pickaxe, fragile but sufficient to get started.": [
    "Un pico rudimentario, frágil pero suficiente para empezar.",
    "Une pioche rudimentaire, fragile mais suffisante pour commencer."
  ],
  "A refined crossbow with crimson accents, designed with a festive and romantic aesthetic.": [
    "Una ballesta refinada con detalles carmesí, diseñada con una estética festiva y romántica.",
    "Une arbalète raffinée aux accents cramoisis, conçue dans une esthétique festive et romantique."
  ],
  "This crumpled book holds secrets that no one in Aincrad has ever heard of!": [
    "¡Este libro arrugado guarda secretos que nadie en Aincrad ha oído jamás!",
    "Ce livre froissé renferme des secrets dont personne à Aincrad n'a jamais entendu parler !"
  ],
  "Imbued with the crystallized essence of bees, this armor protects the mage while channeling his magical energy.": [
    "Imbuida de la esencia cristalizada de las abejas, esta armadura protege al mago mientras canaliza su energía mágica.",
    "Imprégnée de l'essence cristallisée des abeilles, cette armure protège le mage tout en canalisant son énergie magique."
  ],
  "A beautiful dagger forged using fragments of real Nodachi. However, it is now just a relic.": [
    "Una hermosa daga forjada con fragmentos de un Nodachi real. Sin embargo, ahora no es más que una reliquia.",
    "Une belle dague forgée avec des fragments d'un véritable Nodachi. Cependant, ce n'est plus qu'une relique."
  ],
  "Sharp and formidable, this giant bee stinger is a material of choice for making armor-piercing equipment.": [
    "Afilado y formidable, este aguijón de abeja gigante es un material ideal para fabricar equipo perforante.",
    "Tranchant et redoutable, ce dard d'abeille géante est un matériau de choix pour fabriquer de l'équipement perforant."
  ],
  "A tough, blackened bone, the remnant of an ancient and corrupted skeleton.": [
    "Un hueso duro y ennegrecido, resto de un esqueleto antiguo y corrupto.",
    "Un os durci et noirci, vestige d'un squelette ancien et corrompu."
  ],
  "A dark branch of the woods.": ["Una rama oscura de los bosques.", "Une branche sombre des bois."],
  "A dark mixture of ancient materials lost in a great labyrinth. It could be a grim reaper's grimoire.": [
    "Una mezcla oscura de materiales antiguos perdida en un gran laberinto. Podría ser el grimorio de un segador.",
    "Un mélange sombre de matériaux anciens perdu dans un grand labyrinthe. Il pourrait s'agir du grimoire d'un faucheur."
  ],
  "A dark and quite mysterious glow.": [
    "Un resplandor oscuro y bastante misterioso.",
    "Une lueur sombre et assez mystérieuse."
  ],
  "A belt made from deer skins.": [
    "Un cinturón hecho de pieles de ciervo.",
    "Une ceinture fabriquée avec des peaux de cerf."
  ],
  "A bracelet made from wolf fangs and deer skins.": [
    "Un brazalete hecho de colmillos de lobo y pieles de ciervo.",
    "Un bracelet fabriqué avec des crocs de loup et des peaux de cerf."
  ],
  "It vibrates to the pulse of the allies, as if it was still looking for a machine to keep alive.": [
    "Vibra al ritmo de los aliados, como si aún buscara una máquina que mantener con vida.",
    "Il vibre au rythme des alliés, comme s'il cherchait encore une machine à maintenir en vie."
  ],
  "A dense and resistant feather, imbued with perfect telluric force.": [
    "Una pluma densa y resistente, imbuida de una fuerza telúrica perfecta.",
    "Une plume dense et résistante, imprégnée d'une force tellurique parfaite."
  ],
  "A spider egg cocoon.": ["Un capullo de huevos de araña.", "Un cocon d'œufs d'araignée."],
  "Small scrap metal, with other ingredients it is possible to make Enchanted Metal Ingots.": [
    "Pequeño fragmento de chatarra; con otros ingredientes es posible fabricar lingotes de metal encantado.",
    "Petit morceau de ferraille ; avec d'autres ingrédients, il est possible de fabriquer des lingots de métal enchanté."
  ],
  "An essence from the Sylnovars.": ["Una esencia de los Sylnovars.", "Une essence des Sylnovars."],
  "An essence from the Sylvaers.": ["Una esencia de los Sylvaers.", "Une essence des Sylvaers."],
  "Event exchange currency [Earth Leveling].": [
    "Moneda de intercambio del evento [Earth Leveling].",
    "Monnaie d'échange de l'événement [Earth Leveling]."
  ],
  "A Legendary Artifact enchanted by the magic of Taurus, this artifact evolved to correspond to King Taurus. Slot: artefact":
    [
      "Un artefacto legendario encantado por la magia de Taurus; este artefacto evolucionó hasta corresponder al rey Taurus. Ranura: artefacto",
      "Un artefacte légendaire enchanté par la magie de Taurus ; cet artefacte a évolué pour correspondre au roi Taurus. Emplacement : artefact"
    ],
  "A Support Crystal for Mana regeneration and Mages.": [
    "Un cristal de apoyo para la regeneración de maná y los magos.",
    "Un cristal de soutien pour la régénération de mana et les mages."
  ],
  "A Support Crystal for Stamina Regeneration and Melee Classes.": [
    "Un cristal de apoyo para la regeneración de resistencia y las clases cuerpo a cuerpo.",
    "Un cristal de soutien pour la régénération d'endurance et les classes de corps à corps."
  ],
  "A bracelet forged in the darkness of Wolnir's tomb imbued with bone dust and the cursed power of the Marauder.": [
    "Un brazalete forjado en la oscuridad de la tumba de Wolnir, imbuido de polvo de hueso y del poder maldito del Merodeador.",
    "Un bracelet forgé dans l'obscurité du tombeau de Wolnir, imprégné de poussière d'os et du pouvoir maudit du Maraudeur."
  ],
  "A cloudy drink with green and silver reflections.": [
    "Una bebida turbia con reflejos verdes y plateados.",
    "Une boisson trouble aux reflets verts et argentés."
  ],
  "A damaged piece of leather once worn by Bandits. It remains usable.": [
    "Un trozo de cuero dañado que antaño llevaban los bandidos. Sigue siendo utilizable.",
    "Un morceau de cuir endommagé autrefois porté par les bandits. Il reste utilisable."
  ],
  "A fairly rare loot from the Treant Warrior. Useful if you need to make potions.": [
    "Un botín bastante raro del guerrero treant. Útil si necesitas fabricar pociones.",
    "Un butin assez rare du guerrier tréant. Utile si vous devez fabriquer des potions."
  ],
  "A glowing potion that pulses with physical energy.": [
    "Una poción luminosa que palpita con energía física.",
    "Une potion lumineuse qui palpite d'énergie physique."
  ],
  "A heavy sword covered in icy patterns whose blade always seems cold.": [
    "Una espada pesada cubierta de patrones helados cuya hoja siempre parece fría.",
    "Une épée lourde couverte de motifs glacés dont la lame semble toujours froide."
  ],
  "A long Dark dagger, forged with magical shards and other loot. She becomes formidable.": [
    "Una daga larga y oscura, forjada con fragmentos mágicos y otros botines. Se vuelve formidable.",
    "Une dague longue et sombre, forgée avec des éclats magiques et d'autres butins. Elle devient redoutable."
  ],
  "A long, sharp tooth, prized by some craftsmen.": [
    "Un diente largo y afilado, apreciado por algunos artesanos.",
    "Une dent longue et pointue, prisée par certains artisans."
  ],
  "A massive shield decorated with winter symbols, covered in gifts.": [
    "Un escudo enorme decorado con símbolos invernales y cubierto de regalos.",
    "Un bouclier massif décoré de symboles hivernaux et couvert de cadeaux."
  ],
  "A mystical potion with blue vapors and ancient runes.": [
    "Una poción mística con vapores azules y runas antiguas.",
    "Une potion mystique aux vapeurs bleues et aux runes anciennes."
  ],
  "A mythical legacy of a vanquished dragon, whose corruption strengthens him Slot: Amulet": [
    "Un legado mítico de un dragón vencido, cuya corrupción lo fortalece. Ranura: amuleto",
    "Un héritage mythique d'un dragon vaincu, dont la corruption le renforce. Emplacement : amulette"
  ],
  "A nourishing green potion that strengthens the body": [
    "Una poción verde nutritiva que fortalece el cuerpo.",
    "Une potion verte nourrissante qui renforce le corps."
  ],
  "A pair of carved gloves to serve young antlers.": [
    "Un par de guantes tallados para manipular cornamentas jóvenes.",
    "Une paire de gants sculptés pour manipuler de jeunes bois."
  ],
  "A pair of gloves made from the skin of bulls, located on level 2": [
    "Un par de guantes hechos con piel de toro; se encuentran en el nivel 2.",
    "Une paire de gants fabriqués avec de la peau de taureau ; ils se trouvent au niveau 2."
  ],
  "A pair of gloves made from wolf gear; their aura inspires even greater violence.": [
    "Un par de guantes hechos con equipo de lobo; su aura inspira una violencia aún mayor.",
    "Une paire de gants fabriqués à partir d'équipement de loup ; leur aura inspire une violence encore plus grande."
  ],
  "A pair of gloves sculpted to provide agility and assist with certain maneuvers.": [
    "Un par de guantes diseñados para aportar agilidad y ayudar en ciertas maniobras.",
    "Une paire de gants conçus pour apporter de l'agilité et faciliter certaines manœuvres."
  ],
  "A pair of wolf skin gloves, with a nefarious aura that inspires bloodlust.": [
    "Un par de guantes de piel de lobo, con un aura nefasta que inspira sed de sangre.",
    "Une paire de gants en peau de loup, à l'aura néfaste qui inspire la soif de sang."
  ],
  "A potion with silver shards that sharpens reflexes.": [
    "Una poción con fragmentos plateados que agudiza los reflejos.",
    "Une potion aux éclats argentés qui aiguise les réflexes."
  ],
  "A rudimentary tool for herbs and plants.": [
    "Una herramienta rudimentaria para hierbas y plantas.",
    "Un outil rudimentaire pour les herbes et les plantes."
  ],
  "A rudimentary torch, but sufficient to illuminate.": [
    "Una antorcha rudimentaria, pero suficiente para iluminar.",
    "Une torche rudimentaire, mais suffisante pour éclairer."
  ],
  "A simple belt built for dependable use.": [
    "Un cinturón sencillo diseñado para un uso fiable.",
    "Une ceinture simple conçue pour une utilisation fiable."
  ],
  "A simple belt, quite clean despite everything.": [
    "Un cinturón sencillo, bastante limpio a pesar de todo.",
    "Une ceinture simple, assez propre malgré tout."
  ],
  "A simple grain growing in abandoned fields.": [
    "Un grano sencillo que crece en campos abandonados.",
    "Un simple grain qui pousse dans les champs abandonnés."
  ],
  "A soft and light fur, used to make armor.": [
    "Una piel suave y ligera, utilizada para fabricar armaduras.",
    "Une fourrure douce et légère, utilisée pour fabriquer des armures."
  ],
  "A strange and mysterious will-o'-the-wisp floating in the air, illuminating the surrounding darkness. Slot: artefact":
    [
      "Un fuego fatuo extraño y misterioso que flota en el aire e ilumina la oscuridad circundante. Ranura: artefacto",
      "Un feu follet étrange et mystérieux flottant dans les airs, illuminant les ténèbres environnantes. Emplacement : artefact"
    ],
  "A strange ring, covered with a thin slimy layer. Not very elegant, but it pulses with unusual energy.": [
    "Un anillo extraño, cubierto por una fina capa viscosa. No es muy elegante, pero palpita con una energía inusual.",
    "Un anneau étrange, recouvert d'une fine couche visqueuse. Peu élégant, mais il palpite d'une énergie inhabituelle."
  ],
  "A sturdy amethyst bracelet built to withstand enemy blows.": [
    "Un brazalete de amatista resistente, construido para soportar los golpes enemigos.",
    "Un bracelet en améthyste robuste, conçu pour encaisser les coups ennemis."
  ],
  "A tenacious and robust amulet to face the unforeseen events of nature.": [
    "Un amuleto tenaz y robusto para afrontar los imprevistos de la naturaleza.",
    "Une amulette tenace et robuste pour affronter les imprévus de la nature."
  ],
  "A tenacious and robust bracelet to embrace and immobilize enemies.": [
    "Un brazalete tenaz y robusto para atrapar e inmovilizar a los enemigos.",
    "Un bracelet tenace et robuste pour enlacer et immobiliser les ennemis."
  ],
  "A tenacious and sturdy amulet to easily steal from enemies.": [
    "Un amuleto tenaz y resistente para robar fácilmente a los enemigos.",
    "Une amulette tenace et solide pour voler facilement les ennemis."
  ],
  "A tenacious and sturdy bracelet to easily steal from your enemies. Slot: bracelet": [
    "Un brazalete tenaz y resistente para robar fácilmente a tus enemigos. Ranura: brazalete",
    "Un bracelet tenace et solide pour voler facilement vos ennemis. Emplacement : bracelet"
  ],
  "A thick potion with solid minerals for the skin": [
    "Una poción espesa con minerales sólidos para la piel.",
    "Une potion épaisse aux minéraux solides pour la peau."
  ],
  "A timber wolf claw.": ["Una garra de lobo de madera.", "Une griffe de loup de bois."],
  "A tricolor necklace, inspiring the terror of harpies.": [
    "Un collar tricolor que inspira el terror de las arpías.",
    "Un collier tricolore qui inspire la terreur des harpies."
  ],
  "A twig of the Sylvester Mage, this staff can be used as a base for a magic weapon.": [
    "Una ramita del mago Sylvester; este bastón puede usarse como base para un arma mágica.",
    "Une brindille du mage Sylvester ; ce bâton peut servir de base à une arme magique."
  ],
  "A very hard, almost unbreakable resource, Warriors will be able to protect themselves with it.": [
    "Un recurso muy duro, casi irrompible; los guerreros podrán protegerse con él.",
    "Une ressource très dure, presque incassable ; les guerriers pourront s'en protéger."
  ],
  "A very light, discreet and dirty hood.": [
    "Una capucha muy ligera, discreta y sucia.",
    "Une capuche très légère, discrète et sale."
  ],
  "A white spider powder.": ["Un polvo de araña blanca.", "Une poudre d'araignée blanche."],
  "A white spider thread.": ["Un hilo de araña blanca.", "Un fil d'araignée blanche."],
  "A wild knife from the woods and quite sharp.": [
    "Un cuchillo salvaje de los bosques y bastante afilado.",
    "Un couteau sauvage venu des bois et plutôt tranchant."
  ],
  "A wobbly and dilapidated fishing rod, but fit for fishing.": [
    "Una caña de pescar tambaleante y ruinosa, pero apta para pescar.",
    "Une canne à pêche branlante et délabrée, mais bonne pour pêcher."
  ],
  "A yellow spider carcass.": ["Un cadáver de araña amarilla.", "Une carcasse d'araignée jaune."],
  "A yellow spider thread.": ["Un hilo de araña amarilla.", "Un fil d'araignée jaune."],
  "Allows you to have a Bandit Key.": [
    "Te permite obtener una llave de bandido.",
    "Vous permet d'obtenir une clé de bandit."
  ],
  "Allows you to learn the recipe: [Fragrant Stew].": [
    "Te permite aprender la receta: [Estofado aromático].",
    "Vous permet d'apprendre la recette : [Ragoût parfumé]."
  ],
  "An arch carved from winter wood and linked to the joys of children during the winter holidays.": [
    "Un arco tallado en madera invernal y vinculado a la alegría de los niños durante las fiestas de invierno.",
    "Un arc sculpté dans du bois hivernal et lié à la joie des enfants pendant les fêtes d'hiver."
  ],
  "An ax belonging to a violent tribe.": [
    "Un hacha que pertenece a una tribu violenta.",
    "Une hache appartenant à une tribu violente."
  ],
  "An egg from a harpy... Is it perhaps hiding a newborn?": [
    "Un huevo de arpía... ¿Esconde quizá a un recién nacido?",
    "Un œuf de harpie... Cache-t-il peut-être un nouveau-né ?"
  ],
  "An imposing hammer with a winter head seemingly carved from children's gifts.": [
    "Un martillo imponente con una cabeza invernal aparentemente tallada en los regalos de los niños.",
    "Un marteau imposant à la tête hivernale apparemment sculptée dans les cadeaux des enfants."
  ],
  "Ancient staff from the cursed ruins, still alive with the flame of the dead.": [
    "Un bastón antiguo de las ruinas malditas, aún vivo con la llama de los muertos.",
    "Un bâton ancien des ruines maudites, encore vivant de la flamme des morts."
  ],
  "Artifact of Protector Bia, used during rituals opening access to the Tier boss: Asterius!": [
    "Artefacto del protector Bia, usado en los rituales que abren el acceso al jefe de nivel: ¡Asterius!",
    "Artefacte du protecteur Bia, utilisé lors des rituels ouvrant l'accès au boss de palier : Asterius !"
  ],
  "Artifact of Protector Tano, used during rituals opening access to the Tier boss: Asterius!": [
    "Artefacto del protector Tano, usado en los rituales que abren el acceso al jefe de nivel: ¡Asterius!",
    "Artefacte du protecteur Tano, utilisé lors des rituels ouvrant l'accès au boss de palier : Asterius !"
  ],
  "Artifact of Protector Yaa, used during rituals opening access to the Tier boss: Asterius!": [
    "Artefacto del protector Yaa, usado en los rituales que abren el acceso al jefe de nivel: ¡Asterius!",
    "Artefacte du protecteur Yaa, utilisé lors des rituels ouvrant l'accès au boss de palier : Asterius !"
  ],
  "Ax having taken the lives of many lives. Slot: artefact": [
    "Un hacha que ha segado muchas vidas. Ranura: artefacto",
    "Une hache ayant ôté bien des vies. Emplacement : artefact"
  ],
  "Barely protects against a blade, but it's still better than nothing": [
    "Apenas protege contra una hoja, pero sigue siendo mejor que nada.",
    "Protège à peine contre une lame, mais c'est toujours mieux que rien."
  ],
  "Base Endurance Fortifier entry. No acquisition data was provided.": [
    "Registro base del fortalecedor de resistencia. No se proporcionaron datos de obtención.",
    "Entrée de base du fortifiant d'endurance. Aucune donnée d'obtention n'a été fournie."
  ],
  "Bauxite ore, rich in aluminum. Perfect for forging lightweight and durable tools.": [
    "Mineral de bauxita, rico en aluminio. Perfecto para forjar herramientas ligeras y resistentes.",
    "Minerai de bauxite, riche en aluminium. Parfait pour forger des outils légers et durables."
  ],
  "Birch bark, torn by time.": [
    "Corteza de abedul, desgarrada por el tiempo.",
    "Écorce de bouleau, déchirée par le temps."
  ],
  "Black spider venom.": ["Veneno de araña negra.", "Venin d'araignée noire."],
  "Black, smooth stone with a deep polish.": [
    "Piedra negra y lisa de pulido profundo.",
    "Pierre noire et lisse au poli profond."
  ],
  "Blade sharp, piercing, and powerful like the spell of an angry necromancer.": [
    "Una hoja afilada, penetrante y poderosa como el hechizo de un nigromante enfurecido.",
    "Une lame affûtée, perçante et puissante comme le sort d'un nécromancien en colère."
  ],
  "Blade sharp, piercing, and powerful like the stinger of an angry bee.": [
    "Una hoja afilada, penetrante y poderosa como el aguijón de una abeja enfurecida.",
    "Une lame affûtée, perçante et puissante comme le dard d'une abeille en colère."
  ],
  "Board worked in a sawmill, perfect for certain productions.": [
    "Tabla trabajada en un aserradero, perfecta para ciertas producciones.",
    "Planche travaillée en scierie, parfaite pour certaines productions."
  ],
  "Bone residue reduced to powder. Serves as a catalyst for life potions.": [
    "Residuo de hueso reducido a polvo. Sirve como catalizador para las pociones de vida.",
    "Résidu d'os réduit en poudre. Sert de catalyseur pour les potions de vie."
  ],
  "Boost Weapon Damage by 10% and apply a 30min cooldown to all crystals.": [
    "Aumenta el daño del arma un 10 % y aplica 30 min de enfriamiento a todos los cristales.",
    "Augmente les dégâts d'arme de 10 % et applique 30 min de temps de recharge à tous les cristaux."
  ],
  "Boots as durable as large amethyst shards. Slot: artefact": [
    "Botas tan resistentes como grandes fragmentos de amatista. Ranura: artefacto",
    "Des bottes aussi résistantes que de grands éclats d'améthyste. Emplacement : artefact"
  ],
  "Boots as intangible as what they represent.": [
    "Botas tan intangibles como aquello que representan.",
    "Des bottes aussi intangibles que ce qu'elles représentent."
  ],
  "Boots as intangible as what they represent. Slot: artefact": [
    "Botas tan intangibles como aquello que representan. Ranura: artefacto",
    "Des bottes aussi intangibles que ce qu'elles représentent. Emplacement : artefact"
  ],
  "Boots as mysterious and enigmatic as the mist.": [
    "Botas tan misteriosas y enigmáticas como la bruma.",
    "Des bottes aussi mystérieuses et énigmatiques que la brume."
  ],
  "Boots as wild as the woods that surround them.": [
    "Botas tan salvajes como los bosques que las rodean.",
    "Des bottes aussi sauvages que les bois qui les entourent."
  ],
  "Boots for adventurers, very useful for walking.": [
    "Botas para aventureros, muy útiles para caminar.",
    "Des bottes pour aventuriers, très utiles pour marcher."
  ],
  "Boots for explorers, incredible for walking. Slot: artefact": [
    "Botas para exploradores, increíbles para caminar. Ranura: artefacto",
    "Des bottes pour explorateurs, incroyables pour marcher. Emplacement : artefact"
  ],
  "Boots from the web faction, dangerous like a spider.": [
    "Botas de la facción de la telaraña, peligrosas como una araña.",
    "Des bottes de la faction de la toile, dangereuses comme une araignée."
  ],
  "Boots linked by the woods and nature. Slot: artefact": [
    "Botas vinculadas a los bosques y a la naturaleza. Ranura: artefacto",
    "Des bottes liées aux bois et à la nature. Emplacement : artefact"
  ],
  "Boots loosely bound by the dark power of the woods.": [
    "Botas apenas ligadas por el poder oscuro de los bosques.",
    "Des bottes faiblement liées par le pouvoir sombre des bois."
  ],
  "Boots made from large spider webs.": [
    "Botas hechas con grandes telarañas.",
    "Des bottes fabriquées à partir de grandes toiles d'araignée."
  ],
  "Boots that are quite mischievous and warlike in nature.": [
    "Botas de naturaleza bastante traviesa y belicosa.",
    "Des bottes à la nature assez espiègle et guerrière."
  ],
  "Boots that breathe... Slot: artefact": [
    "Botas que respiran... Ranura: artefacto",
    "Des bottes qui respirent... Emplacement : artefact"
  ],
  "Boots woven by intangible materials.": [
    "Botas tejidas con materiales intangibles.",
    "Des bottes tissées de matériaux intangibles."
  ],
  "Boots woven by intangible materials. Slot: artefact": [
    "Botas tejidas con materiales intangibles. Ranura: artefacto",
    "Des bottes tissées de matériaux intangibles. Emplacement : artefact"
  ],
  "Bow created using Nodachite fragments and ores. Powerful, but it's still just a relic for now.": [
    "Arco creado con fragmentos y minerales de nodachita. Poderoso, pero por ahora solo es una reliquia.",
    "Arc créé à partir de fragments et de minerais de nodachite. Puissant, mais ce n'est encore qu'une relique pour l'instant."
  ],
  "Bracelet cut from a frozen crystal, it retains the eternal cold of the ice mini-boss.": [
    "Un brazalete tallado en un cristal congelado que conserva el frío eterno del mini-jefe de hielo.",
    "Un bracelet taillé dans un cristal gelé qui conserve le froid éternel du mini-boss de glace."
  ],
  "Bracelet of the Cursed Guardian of the Blue Mist Forest. It shines like a tree.": [
    "Brazalete del guardián maldito del Bosque de Niebla Azul. Brilla como un árbol.",
    "Bracelet du gardien maudit de la Forêt de Brume Bleue. Il brille comme un arbre."
  ],
  "Bracelet of the demon Krampus, terror and sworn enemy of Santa Claus.": [
    "Brazalete del demonio Krampus, terror y enemigo jurado de Papá Noel.",
    "Bracelet du démon Krampus, terreur et ennemi juré du Père Noël."
  ],
  "Braided during a nocturnal ceremony of the Circle, it marks membership in the Eclipse.": [
    "Trenzado durante una ceremonia nocturna del Círculo, marca la pertenencia al Eclipse.",
    "Tressé lors d'une cérémonie nocturne du Cercle, il marque l'appartenance à l'Éclipse."
  ],
  "Brown spider eyes.": ["Ojos de araña marrón.", "Yeux d'araignée brune."],
  "Brown spider venom.": ["Veneno de araña marrón.", "Venin d'araignée brune."],
  "Can be used to access the dungeon: Forgotten Tomb.": [
    "Se puede usar para acceder a la mazmorra: Tumba Olvidada.",
    "Peut être utilisé pour accéder au donjon : Tombeau Oublié."
  ],
  "Can be used to access the dungeon: Labyrinth of the Fallen.": [
    "Se puede usar para acceder a la mazmorra: Laberinto de los Caídos.",
    "Peut être utilisé pour accéder au donjon : Labyrinthe des Déchus."
  ],
  "Carved from an alloy of metal and jelly, this ring is squishy and solid to the touch.": [
    "Tallado en una aleación de metal y gelatina, este anillo es blando y sólido al tacto.",
    "Taillé dans un alliage de métal et de gelée, cet anneau est mou et solide au toucher."
  ],
  "Carved from ancient wood and reinforced by magical stones, it seems in harmony with the swamp.": [
    "Tallado en madera antigua y reforzado con piedras mágicas, parece estar en armonía con el pantano.",
    "Taillé dans du bois ancien et renforcé par des pierres magiques, il semble en harmonie avec le marais."
  ],
  "Clear spider venom.": ["Veneno de araña transparente.", "Venin d'araignée translucide."],
  "Club of the little slaves of Illfang. It can inflict heavy damage!": [
    "Garrote de los pequeños esclavos de Illfang. ¡Puede infligir un daño considerable!",
    "Massue des petits esclaves d'Illfang. Elle peut infliger de lourds dégâts !"
  ],
  "Colossal Guardian's weapon of destruction. This hammer is powerful but heavy.": [
    "El arma de destrucción del guardián colosal. Este martillo es poderoso pero pesado.",
    "L'arme de destruction du gardien colossal. Ce marteau est puissant mais lourd."
  ],
  "Core imbued with slime magic. Used in making magic accessories.": [
    "Núcleo imbuido de magia de limo. Se usa para fabricar accesorios mágicos.",
    "Noyau imprégné de magie de slime. Sert à fabriquer des accessoires magiques."
  ],
  "Covered in scratches and blood, created to protect the followers. Slot: bracelet": [
    "Cubierto de arañazos y sangre, creado para proteger a los seguidores. Ranura: brazalete",
    "Couvert de griffures et de sang, créé pour protéger les fidèles. Emplacement : bracelet"
  ],
  "Crossbow to hunt powerful Tier 1 monsters.": [
    "Ballesta para cazar monstruos poderosos de nivel 1.",
    "Arbalète pour chasser de puissants monstres de palier 1."
  ],
  "Cut from black silk blessed by the Circle, they allow runes to be traced without burning.": [
    "Cortados de seda negra bendecida por el Círculo, permiten trazar runas sin quemarse.",
    "Taillés dans de la soie noire bénie par le Cercle, ils permettent de tracer des runes sans brûler."
  ],
  "Dark blue ore with metallic shards.": [
    "Mineral azul oscuro con fragmentos metálicos.",
    "Minerai bleu sombre aux éclats métalliques."
  ],
  "Dark forces devour this fabric.": [
    "Las fuerzas oscuras devoran este tejido.",
    "Les forces obscures dévorent ce tissu."
  ],
  "Dark stone with cold metallic shards.": [
    "Piedra oscura con fragmentos metálicos fríos.",
    "Pierre sombre aux éclats métalliques froids."
  ],
  "Earrings bright red like the blood of demons. Slot: artefact": [
    "Pendientes de un rojo vivo como la sangre de los demonios. Ranura: artefacto",
    "Des boucles d'oreilles d'un rouge vif comme le sang des démons. Emplacement : artefact"
  ],
  "Enchanted Metal Ingot made from small scrap metal.": [
    "Lingote de metal encantado fabricado con chatarra pequeña.",
    "Lingot de métal enchanté fabriqué à partir de petits morceaux de ferraille."
  ],
  "Enchanted, this scroll can unlock the King's barrier???": [
    "Encantado, este pergamino puede desbloquear la barrera del Rey???",
    "Enchanté, ce parchemin peut lever la barrière du Roi???"
  ],
  "Enchanted, this scroll can unlock the barrier of King Taurus Asterius.": [
    "Encantado, este pergamino puede desbloquear la barrera del rey Taurus Asterius.",
    "Enchanté, ce parchemin peut lever la barrière du roi Taurus Asterius."
  ],
  "Enchanted, this scroll can unlock the barrier of Kobold King Illfang.": [
    "Encantado, este pergamino puede desbloquear la barrera del rey kobold Illfang.",
    "Enchanté, ce parchemin peut lever la barrière du roi kobold Illfang."
  ],
  "Engraved with the seal of the Circle, it awakens the senses to the hidden energies of Aincrad.": [
    "Grabado con el sello del Círculo, despierta los sentidos a las energías ocultas de Aincrad.",
    "Gravé du sceau du Cercle, il éveille les sens aux énergies cachées d'Aincrad."
  ],
  "Essence of a slime that has reached its highest potential.": [
    "Esencia de un limo que ha alcanzado su máximo potencial.",
    "Essence d'un slime ayant atteint son plein potentiel."
  ],
  "Forged from the skins of multiple wolves, it reeks of their scent.": [
    "Forjado con las pieles de varios lobos; despide su olor.",
    "Forgé à partir des peaux de plusieurs loups, il en dégage l'odeur."
  ],
  "Forged in the ashes of the ascension ritual, only adepts deserve its cold touch.": [
    "Forjado en las cenizas del ritual de ascensión; solo los adeptos merecen su tacto frío.",
    "Forgé dans les cendres du rituel d'ascension ; seuls les adeptes méritent son contact froid."
  ],
  "Forged in the royal forge of Tolbana. This armor can be very useful for Aincrad tier bosses.": [
    "Forjada en la forja real de Tolbana. Esta armadura puede ser muy útil contra los jefes de nivel de Aincrad.",
    "Forgée dans la forge royale de Tolbana. Cette armure peut être très utile contre les boss de palier d'Aincrad."
  ],
  "Forged with Impure Onyx, an incomplete fragment of Tier 2.": [
    "Forjado con ónice impuro, un fragmento incompleto del nivel 2.",
    "Forgé avec de l'onyx impur, un fragment incomplet du palier 2."
  ],
  "Fragment found in the chests of the Twin Knights labyrinth.": [
    "Fragmento hallado en los cofres del laberinto de los Caballeros Gemelos.",
    "Fragment trouvé dans les coffres du labyrinthe des Chevaliers Jumeaux."
  ],
  "Fragment of an ancient Treant. Even detached from it it still retains magic inside.": [
    "Fragmento de un treant antiguo. Incluso separado de él, aún conserva magia en su interior.",
    "Fragment d'un tréant ancien. Même détaché de lui, il conserve encore de la magie à l'intérieur."
  ],
  "Fragment taken from one of the 3 Fallens in the Dungeon, very useful for accessing the Twin Knights boss room.": [
    "Fragmento tomado de uno de los 3 Caídos de la mazmorra; muy útil para acceder a la sala del jefe de los Caballeros Gemelos.",
    "Fragment prélevé sur l'un des 3 Déchus du donjon ; très utile pour accéder à la salle du boss des Chevaliers Jumeaux."
  ],
  "Fragment torn from the hoof of a cursed creature. It contains dark energy that grants its wearer supernatural speed.":
    [
      "Fragmento arrancado del casco de una criatura maldita. Contiene energía oscura que otorga a quien lo lleva una velocidad sobrenatural.",
      "Fragment arraché au sabot d'une créature maudite. Il contient une énergie sombre qui confère à son porteur une vitesse surnaturelle."
    ],
  "Frightfully demonic grimoire that controls occult magic. Slot: artefact": [
    "Un grimorio terriblemente demoníaco que controla la magia oculta. Ranura: artefacto",
    "Un grimoire terriblemente démoniaque qui contrôle la magie occulte. Emplacement : artefact"
  ],
  "Gives you Mana immediately and applies 15 recharge to all mana potions.": [
    "Te da maná de inmediato y aplica una recarga de 15 a todas las pociones de maná.",
    "Vous rend du mana immédiatement et applique une recharge de 15 à toutes les potions de mana."
  ],
  "Gives you Mana immediately and applies 30 minutes of recharge to all crystals.": [
    "Te da maná de inmediato y aplica 30 minutos de recarga a todos los cristales.",
    "Vous rend du mana immédiatement et applique 30 minutes de recharge à tous les cristaux."
  ],
  "Gives you Stamina immediately and applies 15 recharge to all stamina potions.": [
    "Te da resistencia de inmediato y aplica una recarga de 15 a todas las pociones de resistencia.",
    "Vous rend de l'endurance immédiatement et applique une recharge de 15 à toutes les potions d'endurance."
  ],
  "Gloves made from deer skins.": [
    "Guantes hechos con pieles de ciervo.",
    "Gants fabriqués à partir de peaux de cerf."
  ],
  "Halberd of a fallen lord once a great warrior in Aincrad and throughout The Seed.": [
    "Alabarda de un señor caído, antaño un gran guerrero en Aincrad y por todo The Seed.",
    "Hallebarde d'un seigneur déchu, autrefois grand guerrier d'Aincrad et de tout The Seed."
  ],
  "Haloween Crystal, is perfect for mages, assassins and warriors alike.": [
    "Cristal de Haloween; es perfecto tanto para magos como para asesinos y guerreros.",
    "Cristal d'Haloween ; il est parfait pour les mages, les assassins et les guerriers."
  ],
  "Hammer whose magic has been imbued with the monsters of the Snow Citadel.": [
    "Martillo cuya magia se ha imbuido de los monstruos de la Ciudadela de nieve.",
    "Marteau dont la magie a été imprégnée des monstres de la Citadelle des neiges."
  ],
  "Heart imbued with magic, if you use it carefully a very formidable weapon can be created.": [
    "Corazón imbuido de magia; si lo usas con cuidado, se puede crear un arma muy formidable.",
    "Cœur imprégné de magie ; si vous l'utilisez avec soin, une arme très redoutable peut être créée."
  ],
  "Heart of colossal power, used to forge a talisman capable of communicating with the Protectors of the Landing.": [
    "Corazón de poder colosal, usado para forjar un talismán capaz de comunicarse con los Protectores del Desembarco.",
    "Cœur d'une puissance colossale, utilisé pour forger un talisman capable de communiquer avec les Protecteurs de l'Atterrissage."
  ],
  "Helmet having protected many souls through occult rituals. Slot: artefact": [
    "Casco que ha protegido muchas almas en rituales ocultos. Ranura: artefacto",
    "Casque ayant protégé bien des âmes lors de rituels occultes. Emplacement : artefact"
  ],
  "Imbued with the blood of an awakening ritual, it binds its wearer to the shadow of Aincrad.": [
    "Imbuido con la sangre de un ritual de despertar, une a quien lo lleva a la sombra de Aincrad.",
    "Imprégné du sang d'un rituel d'éveil, il lie son porteur à l'ombre d'Aincrad."
  ],
  "Impure ingot, containing impurities. Less durable, but can be used for makeshift or experimental weapons!": [
    "Lingote impuro, con impurezas. Menos duradero, pero sirve para armas improvisadas o experimentales.",
    "Lingot impur, contenant des impuretés. Moins durable, mais utilisable pour des armes de fortune ou expérimentales."
  ],
  "Ingot forged at high temperature. An essential and versatile material. Used by craftsmen.": [
    "Lingote forjado a alta temperatura. Un material esencial y versátil. Lo usan los artesanos.",
    "Lingot forgé à haute température. Un matériau essentiel et polyvalent. Utilisé par les artisans."
  ],
  "Ingot refined from copper ore. Used in blacksmithing, for certain confections.": [
    "Lingote refinado a partir de mineral de cobre. Se usa en herrería para ciertas fabricaciones.",
    "Lingot raffiné à partir de minerai de cuivre. Utilisé en forge pour certaines confections."
  ],
  "Key that allows you to open the giant portal behind the colliseum.": [
    "Llave que permite abrir el portal gigante tras el coliseo.",
    "Clé permettant d'ouvrir le portail géant derrière le colisée."
  ],
  "Key to the cage allowing you to save Elendir.": [
    "Llave de la jaula que permite salvar a Elendir.",
    "Clé de la cage permettant de sauver Elendir."
  ],
  "Large wooden shield that can only be obtained by a Treant Warrior.": [
    "Un gran escudo de madera que solo puede obtenerse de un guerrero treant.",
    "Un grand bouclier en bois qui ne peut être obtenu qu'auprès d'un guerrier tréant."
  ],
  "Leaves from Sylnovars.": ["Hojas de los Sylnovars.", "Feuilles des Sylnovars."],
  "Leaves from the Sylvaers.": ["Hojas de los Sylvaers.", "Feuilles des Sylvaers."],
  "Long and heavy axe of the powerful tier boss: Illfang the Kobold Lord!": [
    "Hacha larga y pesada del poderoso jefe de nivel: ¡Illfang, el señor kobold!",
    "Hache longue et lourde du puissant boss de palier : Illfang le seigneur kobold !"
  ],
  "Long and taut, this sturdy string is ideal for making a new bow.": [
    "Larga y tensa, esta cuerda resistente es ideal para fabricar un arco nuevo.",
    "Longue et tendue, cette corde solide est idéale pour fabriquer un nouvel arc."
  ],
  "Long sword that belonged to Illfang the Kobold Lord. However, it is only a mythical relic.": [
    "Espada larga que perteneció a Illfang, el señor kobold. Sin embargo, solo es una reliquia mítica.",
    "Épée longue ayant appartenu à Illfang le seigneur kobold. Ce n'est toutefois qu'une relique mythique."
  ],
  "Lunar New Year Crystal.": ["Cristal del Año Nuevo Lunar.", "Cristal du Nouvel An lunaire."],
  "Magic flower used by elves to make potions.": [
    "Flor mágica que los elfos usan para fabricar pociones.",
    "Fleur magique utilisée par les elfes pour fabriquer des potions."
  ],
  "Mask to conceal one's identity and inspire terror. Slot: Gloves": [
    "Máscara para ocultar la identidad e inspirar terror. Ranura: guantes",
    "Masque pour dissimuler son identité et inspirer la terreur. Emplacement : gants"
  ],
  "Mask to conceal one's identity and inspire terror. Slot: artefact": [
    "Máscara para ocultar la identidad e inspirar terror. Ranura: artefacto",
    "Masque pour dissimuler son identité et inspirer la terreur. Emplacement : artefact"
  ],
  "Necklace made from oak strings and bull horns.": [
    "Collar hecho con cordones de roble y cuernos de toro.",
    "Collier fait de cordons de chêne et de cornes de taureau."
  ],
  "Necklace made from old dusty materials, but extremely durable.": [
    "Collar hecho con materiales viejos y polvorientos, pero extremadamente duradero.",
    "Collier fait de vieux matériaux poussiéreux, mais extrêmement durable."
  ],
  "Oak bark, torn by time.": ["Corteza de roble, desgarrada por el tiempo.", "Écorce de chêne, déchirée par le temps."],
  "Old birch stick, lost in its solitude but still useful despite everything.": [
    "Vara de abedul vieja, perdida en su soledad pero aún útil a pesar de todo.",
    "Vieux bâton de bouleau, perdu dans sa solitude mais encore utile malgré tout."
  ],
  "Old oak stick, lost in its solitude but still useful despite everything.": [
    "Vara de roble vieja, perdida en su soledad pero aún útil a pesar de todo.",
    "Vieux bâton de chêne, perdu dans sa solitude mais encore utile malgré tout."
  ],
  "Opaque blue-green stone with fine veins.": [
    "Piedra azul verdosa opaca con finas vetas.",
    "Pierre bleu-vert opaque aux fines veines."
  ],
  "Overflowing with winter energy that freezes the surrounding air. Anyone who wears it is condemned to bring happiness to children.":
    [
      "Rebosante de energía invernal que congela el aire circundante. Quien lo lleve está condenado a repartir felicidad entre los niños.",
      "Débordant d'une énergie hivernale qui gèle l'air environnant. Quiconque le porte est condamné à apporter le bonheur aux enfants."
    ],
  "Piece of scrap, solid despite its condition. Ideal for experimenting with blacksmithing or testing alchemical recipes.":
    [
      "Trozo de chatarra, sólido a pesar de su estado. Ideal para experimentar con la herrería o probar recetas alquímicas.",
      "Morceau de ferraille, solide malgré son état. Idéal pour expérimenter la forge ou tester des recettes alchimiques."
    ],
  "Powerful bow that belonged to one of the Fallen of the Labyrinth.": [
    "Un arco poderoso que perteneció a uno de los Caídos del Laberinto.",
    "Un arc puissant ayant appartenu à l'un des Déchus du Labyrinthe."
  ],
  "Powerful mask imbued with black magic. It provides exceptional protection and increased power for the most seasoned necromancers.":
    [
      "Máscara poderosa imbuida de magia negra. Proporciona una protección excepcional y mayor poder a los nigromantes más experimentados.",
      "Masque puissant imprégné de magie noire. Il offre une protection exceptionnelle et une puissance accrue aux nécromanciens les plus aguerris."
    ],
  "Powerful orc blood used in a variety of ways.": [
    "Sangre de orco poderosa, utilizada de diversas maneras.",
    "Sang d'orque puissant, utilisé de diverses manières."
  ],
  "Recoverable by completing the Secondary Quest “The Footprint of the Seas”": [
    "Se obtiene al completar la misión secundaria «La huella de los mares»",
    "Obtensible en terminant la quête secondaire « L'empreinte des mers »"
  ],
  "Replica of the Fallen Guardian armor. Heavy and durable, impossible to die with this one.": [
    "Réplica de la armadura del guardián caído. Pesada y duradera; con esta es imposible morir.",
    "Réplique de l'armure du gardien déchu. Lourde et durable ; impossible de mourir avec celle-ci."
  ],
  "Replica of the Fallen Herald's armor. Light and reliable, agile people will love it.": [
    "Réplica de la armadura del heraldo caído. Ligera y fiable; encantará a las personas ágiles.",
    "Réplique de l'armure du héraut déchu. Légère et fiable, elle ravira les personnes agiles."
  ],
  "Replica of the Fallen Reaper armor. It is perfect for the rest of your adventure as a magician.": [
    "Réplica de la armadura del segador caído. Es perfecta para el resto de tu aventura como mago.",
    "Réplique de l'armure du faucheur déchu. Elle est parfaite pour la suite de votre aventure de magicien."
  ],
  "Restores 10 Health and triggers a 15 second cooldown for life potions.": [
    "Restaura 10 HP y activa 15 segundos de enfriamiento para las pociones de curación.",
    "Restaure 10 PV et déclenche un temps de recharge de 15 secondes pour les potions de soin."
  ],
  "Restores 10 Mana and triggers a 15 second cooldown for mana potions.": [
    "Restaura 10 de maná y activa 15 segundos de enfriamiento para las pociones de maná.",
    "Restaure 10 points de mana et déclenche un temps de recharge de 15 secondes pour les potions de mana."
  ],
  "Restores 10 Stamina and triggers a 15 second cooldown for stamina potions.": [
    "Restaura 10 de resistencia y activa 15 segundos de enfriamiento para las pociones de resistencia.",
    "Restaure 10 points d'endurance et déclenche un temps de recharge de 15 secondes pour les potions d'endurance."
  ],
  "Restores 12.5 Stamina and triggers a 15 second cooldown for stamina potions.": [
    "Restaura 12,5 de resistencia y activa 15 segundos de enfriamiento para las pociones de resistencia.",
    "Restaure 12,5 points d'endurance et déclenche un temps de recharge de 15 secondes pour les potions d'endurance."
  ],
  "Restores 15 Mana and triggers a 15 second cooldown for mana potions.": [
    "Restaura 15 de maná y activa 15 segundos de enfriamiento para las pociones de maná.",
    "Restaure 15 points de mana et déclenche un temps de recharge de 15 secondes pour les potions de mana."
  ],
  "Restores 15 Stamina and triggers a 15 second cooldown for stamina potions.": [
    "Restaura 15 de resistencia y activa 15 segundos de enfriamiento para las pociones de resistencia.",
    "Restaure 15 points d'endurance et déclenche un temps de recharge de 15 secondes pour les potions d'endurance."
  ],
  "Restores 20 Health and triggers a 15 second cooldown for life potions.": [
    "Restaura 20 HP y activa 15 segundos de enfriamiento para las pociones de curación.",
    "Restaure 20 PV et déclenche un temps de recharge de 15 secondes pour les potions de soin."
  ],
  "Restores 20 Mana and triggers a 15 second cooldown for mana potions.": [
    "Restaura 20 de maná y activa 15 segundos de enfriamiento para las pociones de maná.",
    "Restaure 20 points de mana et déclenche un temps de recharge de 15 secondes pour les potions de mana."
  ],
  "Restores 20 Stamina and triggers a 15 second cooldown for stamina potions.": [
    "Restaura 20 de resistencia y activa 15 segundos de enfriamiento para las pociones de resistencia.",
    "Restaure 20 points d'endurance et déclenche un temps de recharge de 15 secondes pour les potions d'endurance."
  ],
  "Restores 25 Health and triggers a 15 second cooldown for life potions.": [
    "Restaura 25 HP y activa 15 segundos de enfriamiento para las pociones de curación.",
    "Restaure 25 PV et déclenche un temps de recharge de 15 secondes pour les potions de soin."
  ],
  "Restores 25 Mana and triggers a 15 second cooldown for mana potions.": [
    "Restaura 25 de maná y activa 15 segundos de enfriamiento para las pociones de maná.",
    "Restaure 25 points de mana et déclenche un temps de recharge de 15 secondes pour les potions de mana."
  ],
  "Restores 30 Mana and triggers a 15 second cooldown for mana potions.": [
    "Restaura 30 de maná y activa 15 segundos de enfriamiento para las pociones de maná.",
    "Restaure 30 points de mana et déclenche un temps de recharge de 15 secondes pour les potions de mana."
  ],
  "Restores 35 Health and triggers a 15 second cooldown for life potions.": [
    "Restaura 35 HP y activa 15 segundos de enfriamiento para las pociones de curación.",
    "Restaure 35 PV et déclenche un temps de recharge de 15 secondes pour les potions de soin."
  ],
  "Restores 45 Health and triggers a 15 second cooldown for life potions.": [
    "Restaura 45 HP y activa 15 segundos de enfriamiento para las pociones de curación.",
    "Restaure 45 PV et déclenche un temps de recharge de 15 secondes pour les potions de soin."
  ],
  "Restores 45 Mana and triggers a 15 second cooldown for mana potions.": [
    "Restaura 45 de maná y activa 15 segundos de enfriamiento para las pociones de maná.",
    "Restaure 45 points de mana et déclenche un temps de recharge de 15 secondes pour les potions de mana."
  ],
  "Restores 5 Stamina and triggers a 15 second cooldown for stamina potions.": [
    "Restaura 5 de resistencia y activa 15 segundos de enfriamiento para las pociones de resistencia.",
    "Restaure 5 points d'endurance et déclenche un temps de recharge de 15 secondes pour les potions d'endurance."
  ],
  "Restores 55 Health and triggers a 15 second cooldown for life potions.": [
    "Restaura 55 HP y activa 15 segundos de enfriamiento para las pociones de curación.",
    "Restaure 55 PV et déclenche un temps de recharge de 15 secondes pour les potions de soin."
  ],
  "Restores 7.5 Stamina and triggers a 15 second cooldown for stamina potions.": [
    "Restaura 7,5 de resistencia y activa 15 segundos de enfriamiento para las pociones de resistencia.",
    "Restaure 7,5 points d'endurance et déclenche un temps de recharge de 15 secondes pour les potions d'endurance."
  ],
  "Ring featuring a demonic miniature skull inspiring madness.": [
    "Anillo con una calavera demoníaca en miniatura que inspira locura.",
    "Anneau orné d'un crâne démoniaque miniature qui inspire la folie."
  ],
  "Ring forged from the bones of wandering skeletons from the cursed ruins.": [
    "Anillo forjado con los huesos de esqueletos errantes de las ruinas malditas.",
    "Anneau forgé à partir des os de squelettes errants des ruines maudites."
  ],
  "Ring forged in the abyss, bearing the mark of Leviathan. He inspires power and fear.": [
    "Anillo forjado en el abismo, con la marca de Leviatán. Inspira poder y miedo.",
    "Anneau forgé dans l'abîme, portant la marque de Léviathan. Il inspire puissance et peur."
  ],
  "Ring of great strength, as tenacious as a demon's skin. Slot: Ring": [
    "Anillo de gran fuerza, tan tenaz como la piel de un demonio. Ranura: anillo",
    "Anneau d'une grande force, aussi tenace que la peau d'un démon. Emplacement : anneau"
  ],
  "Ring that belonged to the reaper. When he left he fell to the ground, still imbued with his great magic. (Kill the fallen reaper to obtain it)":
    [
      "Anillo que perteneció al segador. Cuando se marchó, cayó al suelo, aún imbuido de su gran magia. (Mata al segador caído para obtenerlo)",
      "Anneau ayant appartenu au faucheur. Lorsqu'il partit, il tomba au sol, encore imprégné de sa grande magie. (Tuez le faucheur déchu pour l'obtenir)"
    ],
  "Set with obsidian cursed by followers, it pulses to the rhythm of the darkest rituals.": [
    "Engarzado con obsidiana maldita por los seguidores, palpita al ritmo de los rituales más oscuros.",
    "Serti d'obsidienne maudite par les fidèles, il palpite au rythme des rituels les plus sombres."
  ],
  "Silver seal intended to accommodate a Heart, allowing the creation of a talisman of exceptional power.": [
    "Sello de plata destinado a alojar un corazón, lo que permite crear un talismán de poder excepcional.",
    "Sceau d'argent destiné à accueillir un cœur, permettant la création d'un talisman d'une puissance exceptionnelle."
  ],
  "Skull imbued with the blood and darkness of a demonic ritual. Slot: Amulet": [
    "Cráneo imbuido con la sangre y la oscuridad de un ritual demoníaco. Ranura: amuleto",
    "Crâne imprégné du sang et des ténèbres d'un rituel démoniaque. Emplacement : amulette"
  ],
  "Small pairs of boots made from magic from the beyond and fairly rare components. (Obtained by just following the main Quest Line)":
    [
      "Un pequeño par de botas hechas con magia del más allá y componentes bastante raros. (Se obtiene simplemente siguiendo la línea de misiones principal)",
      "Une petite paire de bottes fabriquées avec de la magie de l'au-delà et des composants assez rares. (Obtenue en suivant simplement la quête principale)"
    ],
  "Soul Metal Ingot made from small scrap metal.": [
    "Lingote de metal de almas fabricado con chatarra pequeña.",
    "Lingot de métal des âmes fabriqué à partir de petits morceaux de ferraille."
  ],
  "Soul of a skeleton steeped in corruption. Obtainable by killing: - Skeleton Swordsman x40 - Skeleton Warrior x40 - Skeleton Halberdier x40 - Skeleton Archer x40":
    [
      "Alma de un esqueleto impregnada de corrupción. Se obtiene matando: - Espadachín esqueleto x40 - Guerrero esqueleto x40 - Alabardero esqueleto x40 - Arquero esqueleto x40",
      "Âme d'un squelette imprégnée de corruption. Obtenable en tuant : - Épéiste squelette x40 - Guerrier squelette x40 - Hallebardier squelette x40 - Archer squelette x40"
    ],
  "Staff imbued with magical nectar, amplifying the wielder's power.": [
    "Bastón imbuido de néctar mágico que amplifica el poder de quien lo empuña.",
    "Bâton imprégné de nectar magique, amplifiant la puissance de son porteur."
  ],
  "Staff made from enchantments and metals. Perfect for dealing incredible damage.": [
    "Bastón hecho de encantamientos y metales. Perfecto para infligir un daño increíble.",
    "Bâton fait d'enchantements et de métaux. Parfait pour infliger des dégâts incroyables."
  ],
  "Staff still imbued with its magic after the death of its owner.": [
    "Bastón aún imbuido de su magia tras la muerte de su dueño.",
    "Bâton encore imprégné de sa magie après la mort de son propriétaire."
  ],
  "Strong and resistant, it protects like a hive that defends its larvae, thus absorbing the most powerful attacks.": [
    "Fuerte y resistente, protege como una colmena que defiende a sus larvas, absorbiendo así los ataques más poderosos.",
    "Solide et résistant, il protège comme une ruche qui défend ses larves, absorbant ainsi les attaques les plus puissantes."
  ],
  "Support Crystal allowing the regeneration of life.": [
    "Cristal de apoyo que permite la regeneración de vida.",
    "Cristal de soutien permettant la régénération de vie."
  ],
  "Sweet but surprisingly viscous, this concentrated honey is used to coat certain armor.": [
    "Dulce pero sorprendentemente viscosa, esta miel concentrada se usa para recubrir ciertas armaduras.",
    "Doux mais étonnamment visqueux, ce miel concentré sert à enduire certaines armures."
  ],
  "Sweet lemon candy. Gives a boost of happiness.": [
    "Caramelo dulce de limón. Otorga un impulso de felicidad.",
    "Bonbon sucré au citron. Donne un regain de bonheur."
  ],
  "Sweet strawberry candy. Gives a Romantic Boost.": [
    "Caramelo dulce de fresa. Otorga un impulso romántico.",
    "Bonbon sucré à la fraise. Donne un regain romantique."
  ],
  "Sweet sugar candy. Gives an incredible Boost.": [
    "Caramelo dulce de azúcar. Otorga un impulso increíble.",
    "Bonbon sucré. Donne un regain incroyable."
  ],
  "Sword whose magic has been imbued with the monsters of the Snow Citadel.": [
    "Espada cuya magia se ha imbuido de los monstruos de la Ciudadela de nieve.",
    "Épée dont la magie a été imprégnée des monstres de la Citadelle des neiges."
  ],
  "The Bear's soul rests in this fragment. Use it wisely, for its power is colossal.": [
    "El alma del oso reposa en este fragmento. Úsalo con sabiduría, pues su poder es colosal.",
    "L'âme de l'ours repose dans ce fragment. Utilisez-le avec sagesse, car sa puissance est colossale."
  ],
  "The Seal of the Elders in its original form.": [
    "El Sello de los Ancianos en su forma original.",
    "Le Sceau des Anciens dans sa forme originale."
  ],
  "The strongest shield Tolbana has to offer.": [
    "El escudo más fuerte que Tolbana puede ofrecer.",
    "Le bouclier le plus solide que Tolbana puisse offrir."
  ],
  "This beautiful, juicy wild boar meat can make you want to eat even more!": [
    "¡Esta carne de jabalí, hermosa y jugosa, puede hacer que quieras comer aún más!",
    "Cette belle viande de sanglier bien juteuse peut vous donner envie d'en manger encore plus !"
  ],
  "This broth, made from meat and other ingredients, is perfect for eating when you're hungry!": [
    "¡Este caldo, hecho con carne y otros ingredientes, es perfecto para comer cuando tienes hambre!",
    "Ce bouillon, fait de viande et d'autres ingrédients, est parfait à manger lorsque vous avez faim !"
  ],
  "This mask erases the face of the person who wears it, leaving only the faithful shadow of the Master.": [
    "Esta máscara borra el rostro de quien la lleva, dejando solo la fiel sombra del Maestro.",
    "Ce masque efface le visage de celui qui le porte, ne laissant que l'ombre fidèle du Maître."
  ],
  "This necklace is woven from living lianas. It is said to respond to the heartbeat of the forest. ": [
    "Este collar está tejido con lianas vivas. Se dice que responde al latido del bosque. ",
    "Ce collier est tissé de lianes vivantes. On dit qu'il répond aux battements du cœur de la forêt. "
  ],
  "Timber wolf fur": ["Piel de lobo de madera", "Fourrure de loup de bois"],
  "Twisted blade forged in the nightmares of a terrible night. She reaps wandering spirits and harvests lost souls.": [
    "Hoja retorcida forjada en las pesadillas de una noche terrible. Siega espíritus errantes y cosecha almas perdidas.",
    "Lame torsadée forgée dans les cauchemars d'une nuit terrible. Elle fauche les esprits errants et récolte les âmes perdues."
  ],
  "Very pretty and smells pretty good too.": [
    "Muy bonita y además huele bastante bien.",
    "Très jolie et elle sent plutôt bon aussi."
  ],
  "Warm and supple, this coat effectively protects against the cold. Perfect for creating light armor.": [
    "Cálido y flexible, este abrigo protege eficazmente contra el frío. Perfecto para crear armaduras ligeras.",
    "Chaud et souple, ce manteau protège efficacement du froid. Parfait pour créer des armures légères."
  ],
  "Wheat flower, doesn't smell much.": [
    "Flor de trigo; no huele mucho.",
    "Fleur de blé, elle ne sent pas grand-chose."
  ],
  "Wheat leaves, used for various recipes.": [
    "Hojas de trigo, usadas en diversas recetas.",
    "Feuilles de blé, utilisées dans diverses recettes."
  ],
  "Worn by the initiates of the Circle of the Eclipse, it silently engraves the oath of the first rite.": [
    "Llevado por los iniciados del Círculo del Eclipse, graba en silencio el juramento del primer rito.",
    "Porté par les initiés du Cercle de l'Éclipse, il grave en silence le serment du premier rite."
  ],
  "Woven in the darkness of the ascension rite, they amplify the occult force of their wearer.": [
    "Tejidos en la oscuridad del rito de ascensión, amplifican la fuerza oculta de quien los lleva.",
    "Tissés dans l'obscurité du rite d'ascension, ils amplifient la force occulte de leur porteur."
  ],
  "Young acacia stick, still full of potential.": [
    "Vara joven de acacia, aún llena de potencial.",
    "Jeune bâton d'acacia, encore plein de potentiel."
  ],
  "Young birch stick, still full of potential.": [
    "Vara joven de abedul, aún llena de potencial.",
    "Jeune bâton de bouleau, encore plein de potentiel."
  ],
  "Young oak stick, still full of potential.": [
    "Vara joven de roble, aún llena de potencial.",
    "Jeune bâton de chêne, encore plein de potentiel."
  ],
  "Slot: Gloves": ["Ranura: guantes", "Emplacement : gants"],
  "Slot: Ring": ["Ranura: anillo", "Emplacement : anneau"],
  "Slot: Amulet": ["Ranura: amuleto", "Emplacement : amulette"],
  "An ancient ruined tower, lair of Ilfang Lord Kobold. Dark murmurs rise from its depths.": [
    "Una antigua torre en ruinas, guarida de Ilfang, señor kobold. Oscuros murmullos surgen de sus profundidades.",
    "Une ancienne tour en ruines, repaire d'Ilfang le seigneur kobold. De sombres murmures s'élèvent de ses profondeurs."
  ],
  "Born in the coldest caves of the mountains, the Ice Bear embodies the brute force of the North. Its roar makes the air shiver, and its icy breath freezes everything in its path.":
    [
      "Nacido en las cuevas más frías de las montañas, el oso de hielo encarna la fuerza bruta del Norte. Su rugido hace temblar el aire y su aliento helado congela todo a su paso.",
      "Né dans les grottes les plus froides des montagnes, l'ours des glaces incarne la force brute du Nord. Son rugissement fait frémir l'air et son souffle glacé gèle tout sur son passage."
    ],
  "Transforms Resources and Spider Threads to make useful strings in making Accessories.": [
    "Transforma recursos e hilos de araña para hacer cuerdas útiles en la fabricación de accesorios.",
    "Transforme les ressources et les fils d'araignée en cordes utiles à la fabrication d'accessoires."
  ],
  "A dungeon built within the Necromancer's Tomb.": [
    "Una mazmorra construida dentro de la Tumba del Nigromante.",
    "Un donjon construit à l'intérieur du Tombeau du Nécromancien."
  ],
  "The Man Who Lost His Pants (Side Quest) — Coordinates X: 498 Z: 600": [
    "El hombre que perdió sus pantalones (misión secundaria) — Coordenadas X: 498 Z: 600",
    "L'homme qui a perdu son pantalon (quête secondaire) — Coordonnées X : 498 Z : 600"
  ],
  "Good accounts make good friends (Side Quest) — Coordinates X: 526 Z: 1409": [
    "Las buenas cuentas hacen buenos amigos (misión secundaria) — Coordenadas X: 526 Z: 1409",
    "Les bons comptes font les bons amis (quête secondaire) — Coordonnées X : 526 Z : 1409"
  ]
};

const curatedQuestTranslations = {
  // Aincrad / Fractured Underworld Main Questline (Current Data)
  "A New World": ["Un nuevo mundo", "Un nouveau monde"],
  "A Decisive Choice": ["Una decisión decisiva", "Un choix décisif"],
  "A New Horizon": ["Un nuevo horizonte", "Un nouvel horizon"],
  "Show Me": ["Demuéstramelo", "Montre-moi"],
  "The Essentials": ["Lo esencial", "L'essentiel"],
  "What No One Will Touch": ["Lo que nadie querrá tocar", "Ce que personne ne voudra toucher"],
  "The New World": ["El nuevo mundo", "Le nouveau monde"],
  "Towards the Gigas Cedar...": ["Hacia el Cedro Gigas...", "Vers le Cèdre Gigas..."],
  "Cutting wood...": ["Cortando madera...", "Couper du bois..."],
  "Analyze the Gigas Cedar": ["Analiza el Cedro Gigas", "Analysez le Cèdre Gigas"],
  "Stabilizing the Cardinal Relay...": ["Estabilizando el Relé Cardinal...", "Stabiliser le Relais Cardinal..."],
  "The Forge before the sword...": ["La forja antes de la espada...", "La forge avant l'épée..."],
  "The village or Rulid...": ["El pueblo de Rulid...", "Le village de Rulid..."],
  "Blessing of the Hero...": ["La bendición del héroe...", "La bénédiction du héros..."],
  "The First Harvests": ["Las primeras cosechas", "Les premières récoltes"],
  "Calm Water": ["Aguas tranquilas", "Eau calme"],
  "Azure Crystals": ["Cristales azur", "Cristaux azur"],
  "Memory Labrinth: The Goblin Cave of Rulid": [
    "Laberinto de la memoria: la cueva de los goblins de Rulid",
    "Labyrinthe de la mémoire : la grotte des gobelins de Rulid"
  ],
  "Back to Aincrad": ["De vuelta a Aincrad", "Retour à Aincrad"],
  "The Assault": ["El asalto", "L'assaut"],
  "The Forest of Small Webs": ["El bosque de las telarañas pequeñas", "La forêt des petites toiles"],
  "Bury Them": ["Entiérralos", "Enterrez-les"],
  "The Trader": ["El comerciante", "Le marchand"],
  "The Slime Marsh": ["El pantano de slime", "Le marais de slime"],
  "The Foot of the Island": ["El pie de la isla", "Le pied de l'île"],
  "The Broken Knot": ["El nudo roto", "Le nœud brisé"],
  "The Suspended City": ["La ciudad suspendida", "La cité suspendue"],
  "What Emanates From You": ["Lo que emana de ti", "Ce qui émane de vous"],
  "He Came": ["Él vino", "Il est venu"],
  "At Elma's": ["En casa de Elma", "Chez Elma"],
  "What Harrold Saw": ["Lo que Harrold vio", "Ce que Harrold a vu"],
  "The Chamber Beneath the Fields": ["La cámara bajo los campos", "La chambre sous les champs"],
  "The Geldorack Mine": ["La mina de Geldorack", "La mine de Geldorack"],

  "Bad Idea": ["Mala idea", "Mauvaise idée"],
  "Request from Corentin of the Grand Regiment": [
    "Solicitud de Corentin del Gran Regimiento",
    "Demande de Corentin du Grand Régiment"
  ],
  "Operation: Impress the Girlfriend": [
    "Operación: impresionar a la novia",
    "Opération : impressionner la petite amie"
  ],
  "Request from Jean of the Grand Regiment": [
    "Solicitud de Jean del Gran Regimiento",
    "Demande de Jean du Grand Régiment"
  ],
  "the creation of the magic brush": ["La creación del pincel mágico", "La création du pinceau magique"],
  "Prove that you are not useless": ["Demuestra que no eres inútil", "Prouve que tu n'es pas inutile"],
  "This should work... right?": ["Esto debería funcionar... ¿verdad?", "Cela devrait fonctionner... n'est-ce pas ?"],
  "A forage without embers": ["Una recolección sin brasas", "Une récolte sans braises"],
  "Lighthouses request": ["La petición de los faros", "La demande des phares"],
  "A magic potion... or almost": ["Una poción mágica... o casi", "Une potion magique... ou presque"],
  "A Bit of Slime and Metal": ["Un poco de slime y metal", "Un peu de slime et de métal"],
  "Gift from a Wife": ["Regalo de una esposa", "Cadeau d'une épouse"],
  "A talented craftsman": ["Un artesano talentoso", "Un artisan talentueux"],
  "By the Branches of the Ancients": ["Por las ramas de los antiguos", "Par les branches des anciens"],
  "It stings, but it feels good": ["Pica, pero sienta bien", "Ça pique, mais ça fait du bien"],
  "The Basics of a Cabin": ["Los fundamentos de una cabaña", "Les bases d'une cabane"],
  "The Walls of a Cabin": ["Las paredes de una cabaña", "Les murs d'une cabane"],
  "The Roof of a Cabin": ["El tejado de una cabaña", "Le toit d'une cabane"],
  "My first Weapon": ["Mi primera arma", "Ma première arme"],
  "A little of each": ["Un poco de cada cosa", "Un peu de chaque chose"],
  "A good little meal": ["Una buena comida", "Un bon petit repas"],
  "The Art of Feathers": ["El arte de las plumas", "L'art des plumes"],
  "The Art of Skins": ["El arte de las pieles", "L'art des peaux"],
  "Help with Cooking": ["Ayuda con la cocina", "Aide en cuisine"],
  "No, it's Sape!": ["¡No, es Sape!", "Non, c'est Sape !"],
  "Hater du Vert": ["Hater du Vert", "Hater du Vert"],
  "Bushi's Philosophy": ["La filosofía de Bushi", "La philosophie de Bushi"],
  "The Onyx of Knowledge": ["El ónice del conocimiento", "L'onyx de la connaissance"],
  "Cleanse the skies of Taran": ["Purifica los cielos de Taran", "Purifie les cieux de Taran"],
  "The Hunter's Trial": ["La prueba del cazador", "L'épreuve du chasseur"],
  "Help Yuko": ["Ayuda a Yuko", "Aide Yuko"],
  "Materials for ShiShi": ["Materiales para ShiShi", "Matériaux pour ShiShi"],
  "The Man Who Lost His Pants": ["El hombre que perdió sus pantalones", "L'homme qui a perdu son pantalon"],
  "The Shadow under the Red Iris": ["La sombra bajo el iris rojo", "L'ombre sous l'iris rouge"],
  "The new undermines": ["Las nuevas minas subterráneas", "Les nouvelles mines souterraines"],
  "Good accounts make good friends": ["Las buenas cuentas hacen buenos amigos", "Les bons comptes font les bons amis"],
  "The Ashes of the Past": ["Las cenizas del pasado", "Les cendres du passé"],
  "The Prankster Goblins": ["Los goblins bromistas", "Les gobelins farceurs"],
  "Shadows of the Lost Forest": ["Sombras del bosque perdido", "Ombres de la forêt perdue"],
  "The wild threat": ["La amenaza salvaje", "La menace sauvage"],
  "The Great Feast": ["El gran festín", "Le grand festin"],
  "The mask of the Memory Tree": ["La máscara del árbol de la memoria", "Le masque de l'arbre de la mémoire"],
  "Orc & Roll": ["Orc & Roll", "Orc & Roll"],
  "Regulation quota": ["Cuota reglamentaria", "Quota réglementaire"],
  "A very strange lumberjack": ["Un leñador muy extraño", "Un bûcheron très étrange"],
  "2 Paths, 1 Choice": ["2 caminos, 1 elección", "2 chemins, 1 choix"],
  "The Dance of the Sleeping Treants": ["La danza de los treants dormidos", "La danse des tréants endormis"],
  "The Forge of a God": ["La forja de un dios", "La forge d'un dieu"],
  "The legend of Zilda": ["La leyenda de Zilda", "La légende de Zilda"],
  "The Ascalon Oath": ["El juramento de Ascalon", "Le serment d'Ascalon"],
  "Article proposal": ["Propuesta de artículo", "Proposition d'article"],
  "The Seas Footprint": ["La huella de los mares", "L'empreinte des mers"],
  "Blided Orcs or Pulmed Orcs!": ["¡Orcos cegados u orcos desplumados!", "Orques aveuglés ou orques plumés !"],
  "The Relax Cat": ["El gato relajado", "Le chat relaxé"],
  "The Bell Tower of the Dark Messenger": ["El campanario del mensajero oscuro", "Le clocher du messager des ténèbres"]
};

const curatedQuestFieldTranslations = {
  // Aincrad / Fractured Underworld Main Questline (Current Data)
  "Talk to the Mysterious Character (0, 200, 5)": [
    "Habla con el Personaje Misterioso (0, 200, 5)",
    "Parlez au Personnage Mystérieux (0, 200, 5)"
  ],
  "Talk to the Master Swordsman (1008, 200, 8)\nTry the Warrior Class\nTry the Archer Class\nTry the Shaman Class\nTry the Mage Class\nTry the Assassin Class\nTalk to the Master Swordsman (1008, 200, 8)":
    [
      "Habla con el Maestro Espadachín (1008, 200, 8)\nPrueba la clase Guerrero\nPrueba la clase Arquero\nPrueba la clase Chamán\nPrueba la clase Mago\nPrueba la clase Asesino\nHabla con el Maestro Espadachín (1008, 200, 8)",
      "Parlez au Maître Spadassin (1008, 200, 8)\nEssayez la classe Guerrier\nEssayez la classe Archer\nEssayez la classe Chaman\nEssayez la classe Mage\nEssayez la classe Assassin\nParlez au Maître Spadassin (1008, 200, 8)"
    ],
  "Talk to the Swordmaster (1089, 19, 4289)\nBuy a chestplate: the Beginner's Tunic\nBuy the Beginner's Leggings\nBuy a Training Sword/Training Magic Staff/Training Bow/Training Dagger (Item Depends on your class)\nGo back up to the Swordmaster (1089, 19, 4289)":
    [
      "Habla con el Maestro de Espadas (1089, 19, 4289)\nCompra una pechera: la Túnica de Principiante\nCompra las Polainas de Principiante\nCompra una Espada de Entrenamiento/Bastón Mágico de Entrenamiento/Arco de Entrenamiento/Daga de Entrenamiento (el objeto depende de tu clase)\nVuelve a subir hasta el Maestro de Espadas (1089, 19, 4289)",
      "Parlez au Maître d'Épée (1089, 19, 4289)\nAchetez un plastron : la Tunique de Débutant\nAchetez les Jambières de Débutant\nAchetez une Épée d'Entraînement/Bâton Magique d'Entraînement/Arc d'Entraînement/Dague d'Entraînement (l'objet dépend de votre classe)\nRemontez voir le Maître d'Épée (1089, 19, 4289)"
    ],
  "Take the teleporter Facing the Forge (1816, 17, 4136)\nTalk to the apprentice blacksmith (1789, 32, 3636)\nSlay 16 Boars ~(1798, 31, 3617)\nBring 16 Hides to the Blacksmith (1789, 32, 3636)\nBring the hides back to Abraham (1789, 32, 3636)":
    [
      "Toma el teletransportador frente a la Forja (1816, 17, 4136)\nHabla con el herrero aprendiz (1789, 32, 3636)\nMata 16 jabalíes ~(1798, 31, 3617)\nLleva 16 pieles al Herrero (1789, 32, 3636)\nLleva las pieles de vuelta a Abraham (1789, 32, 3636)",
      "Prenez le téléporteur face à la Forge (1816, 17, 4136)\nParlez au forgeron apprenti (1789, 32, 3636)\nTuez 16 sangliers ~(1798, 31, 3617)\nApportez 16 peaux au Forgeron (1789, 32, 3636)\nRapportez les peaux à Abraham (1789, 32, 3636)"
    ],
  "Find the Alchemist in his workshop (1772, 16, 4096)\nGather 5 allium Flowers in the Fields north-east of the village. ~(2362, 22, 3651)\nGather 5 Wheat in the Fields north-east of the village. ~(2362, 22, 3651)\nGet closer to the noise. (2372, 20, 3702)\nGo back to the Alchemist (1772, 16, 4096)":
    [
      "Encuentra al Alquimista en su taller (1772, 16, 4096)\nReúne 5 flores de allium en los campos al noreste del pueblo. ~(2362, 22, 3651)\nReúne 5 de trigo en los campos al noreste del pueblo. ~(2362, 22, 3651)\nAcércate al ruido. (2372, 20, 3702)\nVuelve con el Alquimista (1772, 16, 4096)",
      "Trouvez l'Alchimiste dans son atelier (1772, 16, 4096)\nRécoltez 5 fleurs d'allium dans les champs au nord-est du village. ~(2362, 22, 3651)\nRécoltez 5 de blé dans les champs au nord-est du village. ~(2362, 22, 3651)\nApprochez-vous du bruit. (2372, 20, 3702)\nRetournez voir l'Alchimiste (1772, 16, 4096)"
    ],
  "Tell him about the shard (1772, 16, 4096)\nGo see the Sword Master (1089, 19, 4289)\nReach the impact site, in the Petal Valley (1051, 38, 4367)":
    [
      "Cuéntale lo del fragmento (1772, 16, 4096)\nVe a ver al Maestro de Espadas (1089, 19, 4289)\nLlega al punto de impacto, en el Valle de los Pétalos (1051, 38, 4367)",
      "Parlez-lui de l'éclat (1772, 16, 4096)\nAllez voir le Maître d'Épée (1089, 19, 4289)\nAtteignez le point d'impact, dans la Vallée des Pétales (1051, 38, 4367)"
    ],
  "Talk to Eugeo (0, 65, 7)\nConsult the Mysterious Cube (-1, 65, 7)\nTalk to Eugeo again (0, 65, 7)": [
    "Habla con Eugeo (0, 65, 7)\nConsulta el Cubo Misterioso (-1, 65, 7)\nHabla con Eugeo otra vez (0, 65, 7)",
    "Parlez à Eugeo (0, 65, 7)\nConsultez le Cube Mystérieux (-1, 65, 7)\nParlez de nouveau à Eugeo (0, 65, 7)"
  ],
  "Meet up with Eugeo at the Foot of the tree (-70, -24, 176)": [
    "Queda con Eugeo al pie del árbol (-70, -24, 176)",
    "Retrouvez Eugeo au pied de l'arbre (-70, -24, 176)"
  ],
  "Harvest 10 Oak Log\nGo back to Eugeo (-70, -24, 176)": [
    "Recolecta 10 troncos de roble\nVuelve con Eugeo (-70, -24, 176)",
    "Récoltez 10 bûches de chêne\nRetournez voir Eugeo (-70, -24, 176)"
  ],
  "Use System Call to view information about the Gigas Cedar.": [
    "Usa System Call para ver información sobre el Cedro Gigas.",
    "Utilisez System Call pour consulter les informations sur le Cèdre Gigas."
  ],
  "Go back to Eugeo (-70, -24, 176)\nUse the resources you've collected to upgrade the Cardinal Relay": [
    "Vuelve con Eugeo (-70, -24, 176)\nUsa los recursos que has reunido para mejorar el Relé Cardinal",
    "Retournez voir Eugeo (-70, -24, 176)\nUtilisez les ressources récoltées pour améliorer le Relais Cardinal"
  ],
  "Talk to Eugeo to find out more (0, 65, 7)\nForge a Training Dagger\nShow the Forged weapon to Eugeo (0, 65, 7)": [
    "Habla con Eugeo para saber más (0, 65, 7)\nForja una Daga de Entrenamiento\nMuéstrale el arma forjada a Eugeo (0, 65, 7)",
    "Parlez à Eugeo pour en savoir plus (0, 65, 7)\nForgez une Dague d'Entraînement\nMontrez l'arme forgée à Eugeo (0, 65, 7)"
  ],
  "Teleport to Rulid\nFind Eugeo in Rulid (189, 71, 226)": [
    "Teletranspórtate a Rulid\nEncuentra a Eugeo en Rulid (189, 71, 226)",
    "Téléportez-vous à Rulid\nTrouvez Eugeo à Rulid (189, 71, 226)"
  ],
  "Talk to Selka (188, 71, 231)": ["Habla con Selka (188, 71, 231)", "Parlez à Selka (188, 71, 231)"],
  "Go back and see Eugeo (189, 71, 226)\nHarvest 3 wheat of Rulid\nHarvest 1 Wheat Blossom\nGo back to your Island\nPickup a Field From the system creation and put it down\nPlant 1 Wheat Seed\nReturn to Eugeo (0, 65, 7)":
    [
      "Vuelve a ver a Eugeo (189, 71, 226)\nCosecha 3 de trigo de Rulid\nCosecha 1 Flor de Trigo\nVuelve a tu isla\nRecoge un campo de la creación del sistema y colócalo\nPlanta 1 Semilla de Trigo\nVuelve con Eugeo (0, 65, 7)",
      "Retournez voir Eugeo (189, 71, 226)\nRécoltez 3 de blé de Rulid\nRécoltez 1 Fleur de Blé\nRetournez sur votre île\nRécupérez un champ dans la création du système et posez-le\nPlantez 1 Graine de Blé\nRetournez voir Eugeo (0, 65, 7)"
    ],
  "Find Eugeo on the Fishing Island (-75, 66, 74)\nFish 1 Trout\nFish 1 Carp\nGo back and see Eugeo on your Island (0, 65, 7)":
    [
      "Encuentra a Eugeo en la Isla de Pesca (-75, 66, 74)\nPesca 1 trucha\nPesca 1 carpa\nVuelve a ver a Eugeo en tu isla (0, 65, 7)",
      "Trouvez Eugeo sur l'Île de Pêche (-75, 66, 74)\nPêchez 1 truite\nPêchez 1 carpe\nRetournez voir Eugeo sur votre île (0, 65, 7)"
    ],
  "Join Eugeo at the Ice Cave (-117, 87, 128)\nHarvest 3 Azure Crystals (3)\nGo back and see Eugeo at the back of the cave (-111, 88, 203)":
    [
      "Únete a Eugeo en la Cueva de Hielo (-117, 87, 128)\nRecolecta 3 Cristales azur (3)\nVuelve a ver a Eugeo al fondo de la cueva (-111, 88, 203)",
      "Rejoignez Eugeo à la Grotte de Glace (-117, 87, 128)\nRécoltez 3 Cristaux azur (3)\nRetournez voir Eugeo au fond de la grotte (-111, 88, 203)"
    ],
  "Emerge victorious From the Memory Labyrinth\nTalk to Eugeo (0, 65, 7)": [
    "Sal victorioso del Laberinto de la Memoria\nHabla con Eugeo (0, 65, 7)",
    "Sortez victorieux du Labyrinthe de la Mémoire\nParlez à Eugeo (0, 65, 7)"
  ],
  "Go back to Aincrad: open the game menu and click the Aincrad icon": [
    "Vuelve a Aincrad: abre el menú del juego y haz clic en el icono de Aincrad",
    "Retournez à Aincrad : ouvrez le menu du jeu et cliquez sur l'icône Aincrad"
  ],
  "Go see the Swordmaster (1089, 19, 4289)\nGo back to the Master Swordsman (1089, 19, 4289)\nTravel to Hanaka ~(1576, 31, 3460)":
    [
      "Ve a ver al Maestro de Espadas (1089, 19, 4289)\nVuelve con el Maestro Espadachín (1089, 19, 4289)\nViaja a Hanaka ~(1576, 31, 3460)",
      "Allez voir le Maître d'Épée (1089, 19, 4289)\nRetournez voir le Maître Spadassin (1089, 19, 4289)\nRendez-vous à Hanaka ~(1576, 31, 3460)"
    ],
  "Repel the first wave (5)\nRepel the second wave (5)\nRepel the final wave (5)\nFree the villager (right-click)\nTalk to the Mayor (1526, 30, 3412)":
    [
      "Repele la primera oleada (5)\nRepele la segunda oleada (5)\nRepele la oleada final (5)\nLibera al aldeano (clic derecho)\nHabla con el Alcalde (1526, 30, 3412)",
      "Repoussez la première vague (5)\nRepoussez la deuxième vague (5)\nRepoussez la vague finale (5)\nLibérez le villageois (clic droit)\nParlez au Maire (1526, 30, 3412)"
    ],
  "Travel to the Forest of Small Webs (1358, 26, 3539)\nFind the second body (1341, 28, 3521)\nFind the third body (1375, 30, 3512)\nReport back to the Mayor (1526, 30, 3412)":
    [
      "Viaja al Bosque de las Telarañas Pequeñas (1358, 26, 3539)\nEncuentra el segundo cuerpo (1341, 28, 3521)\nEncuentra el tercer cuerpo (1375, 30, 3512)\nVuelve a informar al Alcalde (1526, 30, 3412)",
      "Rendez-vous dans la Forêt des Petites Toiles (1358, 26, 3539)\nTrouvez le deuxième corps (1341, 28, 3521)\nTrouvez le troisième corps (1375, 30, 3512)\nRetournez faire votre rapport au Maire (1526, 30, 3412)"
    ],
  "Carry the First body on your back (1341, 28, 3521)\nCarry the second body on your back (1375, 30, 3512)\nCarry the third body on your back (1526, 30, 3412)\nBury a body in the First grave (1256, 42, 3770)\nBury a body in the second grave (1254, 42, 3770)\nBury a body in the third grave (1252, 42, 3770)\nReturn to the Mayor of Hanaka (1526, 30, 3412)":
    [
      "Carga el primer cuerpo a la espalda (1341, 28, 3521)\nCarga el segundo cuerpo a la espalda (1375, 30, 3512)\nCarga el tercer cuerpo a la espalda (1526, 30, 3412)\nEntierra un cuerpo en la primera tumba (1256, 42, 3770)\nEntierra un cuerpo en la segunda tumba (1254, 42, 3770)\nEntierra un cuerpo en la tercera tumba (1252, 42, 3770)\nVuelve con el Alcalde de Hanaka (1526, 30, 3412)",
      "Portez le premier corps sur votre dos (1341, 28, 3521)\nPortez le deuxième corps sur votre dos (1375, 30, 3512)\nPortez le troisième corps sur votre dos (1526, 30, 3412)\nEnterrez un corps dans la première tombe (1256, 42, 3770)\nEnterrez un corps dans la deuxième tombe (1254, 42, 3770)\nEnterrez un corps dans la troisième tombe (1252, 42, 3770)\nRetournez voir le Maire de Hanaka (1526, 30, 3412)"
    ],
  "Meet the Mayor's Trader (1564, 36, 3428)\nKill 15 Spiders\nCollect 5 venom glands\nBring the venom to the trader\nTalk to the Trader (1564, 36, 3428)":
    [
      "Conoce al Comerciante del Alcalde (1564, 36, 3428)\nMata 15 arañas\nReúne 5 glándulas de veneno\nLleva el veneno al comerciante\nHabla con el Comerciante (1564, 36, 3428)",
      "Rencontrez le Marchand du Maire (1564, 36, 3428)\nTuez 15 araignées\nRécoltez 5 glandes de venin\nApportez le venin au marchand\nParlez au Marchand (1564, 36, 3428)"
    ],
  "Take the western road to the Foot of the Island\nTalk to Ceyla (499, 24, 3043)": [
    "Toma el camino del oeste hasta el Pie de la Isla\nHabla con Ceyla (499, 24, 3043)",
    "Prenez la route de l'ouest jusqu'au Pied de l'Île\nParlez à Ceyla (499, 24, 3043)"
  ],
  "Talk to Baldim (507, 24, 3044)\nGo to the Garden of Giants ~(374, 159, 2479)\nTalk to Zebulgarath (374, 159, 2479)":
    [
      "Habla con Baldim (507, 24, 3044)\nVe al Jardín de los Gigantes ~(374, 159, 2479)\nHabla con Zebulgarath (374, 159, 2479)",
      "Parlez à Baldim (507, 24, 3044)\nAllez au Jardin des Géants ~(374, 159, 2479)\nParlez à Zebulgarath (374, 159, 2479)"
    ],
  "Collect 3 bark from the old oak ~(286, 161, 2448)\nBring the bark back to Zebulgarath": [
    "Recoge 3 cortezas del roble antiguo ~(286, 161, 2448)\nLleva la corteza de vuelta a Zebulgarath",
    "Récoltez 3 écorces du vieux chêne ~(286, 161, 2448)\nRapportez l'écorce à Zebulgarath"
  ],
  "Join Zebulgarath at the teleporter ~(498, 24, 3047)\nTalk to Zebulgarath ~(498, 24, 3047)\nTalk to Baldim (484, 86, 3058)":
    [
      "Únete a Zebulgarath en el teletransportador ~(498, 24, 3047)\nHabla con Zebulgarath ~(498, 24, 3047)\nHabla con Baldim (484, 86, 3058)",
      "Rejoignez Zebulgarath au téléporteur ~(498, 24, 3047)\nParlez à Zebulgarath ~(498, 24, 3047)\nParlez à Baldim (484, 86, 3058)"
    ],
  "Find 3 clues in the village of Vallhat (466, 87, 2999), (398, 126, 3080), (450, 119, 3116)\nTalk to the villager who saw the creatures\nShow the book to Baldim (484, 86, 3058)\nTalk to Lisa (450, 119, 3116)\nSearch for traces of Isaac in the southern marshes ~(317, 44, 3200)\nKill Gorbel, king of slimes ~(317, 44, 3200)\nTalk to Isaac (325, 44, 3194)\nFollow Isaac (325, 44, 3194)\nTalk to Baldim (484, 86, 3058)":
    [
      "Encuentra 3 pistas en el pueblo de Vallhat (466, 87, 2999), (398, 126, 3080), (450, 119, 3116)\nHabla con el aldeano que vio a las criaturas\nMuéstrale el libro a Baldim (484, 86, 3058)\nHabla con Lisa (450, 119, 3116)\nBusca rastros de Isaac en los pantanos del sur ~(317, 44, 3200)\nMata a Gorbel, rey de los slimes ~(317, 44, 3200)\nHabla con Isaac (325, 44, 3194)\nSigue a Isaac (325, 44, 3194)\nHabla con Baldim (484, 86, 3058)",
      "Trouvez 3 indices dans le village de Vallhat (466, 87, 2999), (398, 126, 3080), (450, 119, 3116)\nParlez au villageois qui a vu les créatures\nMontrez le livre à Baldim (484, 86, 3058)\nParlez à Lisa (450, 119, 3116)\nCherchez des traces d'Isaac dans les marais du sud ~(317, 44, 3200)\nTuez Gorbel, roi des slimes ~(317, 44, 3200)\nParlez à Isaac (325, 44, 3194)\nSuivez Isaac (325, 44, 3194)\nParlez à Baldim (484, 86, 3058)"
    ],
  "Talk to Baldim before leaving Vallhat (484, 86, 3058)\nGo to the marshes north of Hanaka (1421, 48, 3091)\nInteract with the mysterious green mass (1421, 48, 3091)\nRetrieve the First Fragment of the Seal of the Ancients (1441, 125, 3091)":
    [
      "Habla con Baldim antes de dejar Vallhat (484, 86, 3058)\nVe a los pantanos al norte de Hanaka (1421, 48, 3091)\nInteractúa con la misteriosa masa verde (1421, 48, 3091)\nRecupera el Primer Fragmento del Sello de los Antiguos (1441, 125, 3091)",
      "Parlez à Baldim avant de quitter Vallhat (484, 86, 3058)\nAllez dans les marais au nord de Hanaka (1421, 48, 3091)\nInteragissez avec la mystérieuse masse verte (1421, 48, 3091)\nRécupérez le Premier Fragment du Sceau des Anciens (1441, 125, 3091)"
    ],
  "Talk to the Master Swordsman (1089, 19, 4289)\nGo to Mizunari (3133, 27, 3656)\nTalk to Elma (3136, 27, 3668)": [
    "Habla con el Maestro Espadachín (1089, 19, 4289)\nVe a Mizunari (3133, 27, 3656)\nHabla con Elma (3136, 27, 3668)",
    "Parlez au Maître Spadassin (1089, 19, 4289)\nAllez à Mizunari (3133, 27, 3656)\nParlez à Elma (3136, 27, 3668)"
  ],
  "Talk with Elma 3 Times (3136, 27, 3668)\nGo up to the Fields, north of the forest ~(3334, 32, 3779)\nKill the 3 Nephentes at the foot of the shed ~(3334, 32, 3779)\nClear the area of 5 Nephentes ~(3334, 32, 3779)\nGo back to Harrold (3335, 32, 3782)\nHarvest 8 strange wheat ears (3401, 25, 3749)\nReturn to Elma in Mizunari ~(3136, 27, 3668)\nTalk to Harrold (3134, 27, 3666)":
    [
      "Habla con Elma 3 veces (3136, 27, 3668)\nSube a los campos, al norte del bosque ~(3334, 32, 3779)\nMata a los 3 Nephentes al pie del cobertizo ~(3334, 32, 3779)\nDespeja la zona de 5 Nephentes ~(3334, 32, 3779)\nVuelve con Harrold (3335, 32, 3782)\nCosecha 8 espigas de trigo extrañas (3401, 25, 3749)\nVuelve con Elma en Mizunari ~(3136, 27, 3668)\nHabla con Harrold (3134, 27, 3666)",
      "Parlez à Elma 3 fois (3136, 27, 3668)\nMontez dans les champs, au nord de la forêt ~(3334, 32, 3779)\nTuez les 3 Nephentes au pied du hangar ~(3334, 32, 3779)\nNettoyez la zone de 5 Nephentes ~(3334, 32, 3779)\nRetournez voir Harrold (3335, 32, 3782)\nRécoltez 8 étranges épis de blé (3401, 25, 3749)\nRetournez voir Elma à Mizunari ~(3136, 27, 3668)\nParlez à Harrold (3134, 27, 3666)"
    ],
  "Hear what Harrold saw 3 times\nGo to the well, on the eastern road ~(4301, 178, 3704)": [
    "Escucha lo que vio Harrold 3 veces\nVe al pozo, en el camino del este ~(4301, 178, 3704)",
    "Écoutez ce que Harrold a vu 3 fois\nAllez au puits, sur la route de l'est ~(4301, 178, 3704)"
  ],
  "Explore the tunnels ~(4281, 44, 3710)\nGo back up and report to Harrold (3134, 27, 3666)\nGo to where the bandits live (4204, 133, 3899)\nTalk to Bob (4287, 159, 3890)":
    [
      "Explora los túneles ~(4281, 44, 3710)\nSube y vuelve a informar a Harrold (3134, 27, 3666)\nVe a donde viven los bandidos (4204, 133, 3899)\nHabla con Bob (4287, 159, 3890)",
      "Explorez les tunnels ~(4281, 44, 3710)\nRemontez et faites votre rapport à Harrold (3134, 27, 3666)\nAllez là où vivent les bandits (4204, 133, 3899)\nParlez à Bob (4287, 159, 3890)"
    ],
  "Talk to Bob (4287, 159, 3890)\nObtain the Geldorack Dungeon Key (4288, 159, 3887)\nEnter the Mine (4288, 159, 3887)":
    [
      "Habla con Bob (4287, 159, 3890)\nConsigue la Llave de Mazmorra de Geldorack (4288, 159, 3887)\nEntra en la Mina (4288, 159, 3887)",
      "Parlez à Bob (4287, 159, 3890)\nObtenez la Clé de Donjon de Geldorack (4288, 159, 3887)\nEntrez dans la Mine (4288, 159, 3887)"
    ],
  "Kill 5 Fire Harpy, Kill 5 Lightning Harpy, Kill 5 Earth Harpy": [
    "Mata 5 arpías de fuego, mata 5 arpías de relámpago y mata 5 arpías terrenales",
    "Tuez 5 harpies de feu, tuez 5 harpies de foudre et tuez 5 harpies terrestres"
  ],
  "Find the cat on the roof of the business where the Kaelor Merchants are located\nFind the cat once again on the tower west of Kaelor\nFinish the race chasing the cat in front of the tower from the previous stage":
    [
      "Encuentra al gato en el tejado del negocio donde están los mercaderes de Kaelor\nEncuentra de nuevo al gato en la torre al oeste de Kaelor\nTermina la carrera persiguiendo al gato frente a la torre de la etapa anterior",
      "Trouvez le chat sur le toit du commerce où se trouvent les marchands de Kaelor\nTrouvez à nouveau le chat sur la tour à l'ouest de Kaelor\nTerminez la course en poursuivant le chat devant la tour de l'étape précédente"
    ],
  "Explore the Zumfut Caves for clues -> Read the Book of Shadows": [
    "Explora las cuevas de Zumfut en busca de pistas -> Lee el Libro de las Sombras",
    "Explorez les grottes de Zumfut pour trouver des indices -> Lisez le Livre des Ombres"
  ],
  "Go to the Forest to look for clues (776 / 1003) -> Follow the Track heading North": [
    "Ve al bosque para buscar pistas (776 / 1003) -> Sigue el rastro hacia el norte",
    "Allez dans la forêt chercher des indices (776 / 1003) -> Suivez la piste vers le nord"
  ],
  "Find the Mask in the Fountain of the Ruins of Avrylne (542 / 576)": [
    "Encuentra la máscara en la fuente de las ruinas de Avrylne (542 / 576)",
    "Trouvez le masque dans la fontaine des ruines d'Avrylne (542 / 576)"
  ],
  "Locate and kill the Taurus ()": ["Localiza y mata al Taurus ()", "Repérez et tuez le Taurus ()"],
  "Kill 50 Earth Harpy": ["Mata 50 arpías terrenales", "Tuez 50 harpies terrestres"],
  "Kill 30 Sanctuary Skeleton - Archer/Sanctuary Skeleton - Warrior/Sanctuary Skeleton - Shaman": [
    "Mata 30 esqueletos del santuario: arquero, guerrero o chamán",
    "Tuez 30 squelettes du sanctuaire : archer, guerrier ou chaman"
  ],
  "Defeat 30 Cave Goblin, Defeat 30 Goblin Soldier, Defeat 30 Goblin Archer": [
    "Derrota 30 goblins de cueva, 30 soldados goblin y 30 arqueros goblin",
    "Vainquez 30 gobelins des cavernes, 30 soldats gobelins et 30 archers gobelins"
  ],
  "30 Average Stock Market": ["30 bolsas de valores medias", "30 bourses moyennes"],
  "20 Wheat": ["20 Trigo", "20 Blé"],
  "15 Allium + 5 Spider Wire": ["15 alliums + 5 hilos de araña", "15 alliums + 5 fils d'araignée"],
  "32 Orc Frame": ["32 estructuras de orco", "32 structures d'orque"],
  "1 Mushroom (-116 70 -104) + 2 Scented Grass (453 73 -712)": [
    "1 champiñón (-116 70 -104) + 2 hierbas aromáticas (453 73 -712)",
    "1 champignon (-116 70 -104) + 2 herbes parfumées (453 73 -712)"
  ],
  "3 Cracked Pickaxe": ["3 picos agrietados", "3 pioches fissées"],
  "16 Wheat": ["16 Trigo", "16 Blé"],
  "15 Woodfur": ["15 pieles de madera", "15 fourrures de bois"],
  "Save Zoe in the Swamps of Triyag (751,67,1423) You won't be able to Save Rayan! -> Save Rayan in the Caverns of Misty Lousp (864,53,833) You won't be able to Save Zoe!":
    [
      "Salva a Zoe en los pantanos de Triyag (751,67,1423). ¡No podrás salvar a Rayan! -> Salva a Rayan en las cavernas de Misty Lousp (864,53,833). ¡No podrás salvar a Zoe!",
      "Sauvez Zoe dans les marais de Triyag (751,67,1423). Vous ne pourrez pas sauver Rayan ! -> Sauvez Rayan dans les cavernes de Misty Lousp (864,53,833). Vous ne pourrez pas sauver Zoe !"
    ],
  "5 Orichalcum fragment (963,15,474), (936,-54,426), (969,24,1078), (602,66,1051), (376,70,1371)": [
    "5 fragmentos de oricalco (963,15,474), (936,-54,426), (969,24,1078), (602,66,1051), (376,70,1371)",
    "5 fragments d'orichalque (963,15,474), (936,-54,426), (969,24,1078), (602,66,1051), (376,70,1371)"
  ],
  "20 Impure Onyx Ores": ["20 minerales de ónice impuro", "20 minerais d'onyx impur"],
  "Access Ilmarin by accessing the Zumfut portal at night (1172,109,685) -> 10 Woodclaw, 5 Misty Tail -> Return to Zilda in the evening with the offerings (1068,192,919)":
    [
      "Accede a Ilmarin a través del portal de Zumfut por la noche (1172,109,685) -> 10 garras de madera, 5 colas brumosas -> Regresa junto a Zilda por la tarde con las ofrendas (1068,192,919)",
      "Accédez à Ilmarin par le portail de Zumfut la nuit (1172,109,685) -> 10 griffes de bois, 5 queues brumeuses -> Retournez voir Zilda dans la soirée avec les offrandes (1068,192,919)"
    ],
  "7 Small Stock Exchange": ["7 pequeñas bolsas de valores", "7 petites bourses"],
  "1 Cooking Recipe": ["1 receta de cocina", "1 recette de cuisine"],
  "1 Small Stock Exchange": ["1 pequeña bolsa de valores", "1 petite bourse"],
  "5 Small Stock Exchange": ["5 pequeñas bolsas de valores", "5 petites bourses"],
  "Go meet Zelbugarath north of the teleporter, at the Garden of the Giants\n3 Ancestral Root": [
    "Ve a encontrarte con Zelbugarath al norte del teletransportador, en el Jardín de los Gigantes\n3 raíces ancestrales",
    "Allez rencontrer Zelbugarath au nord du téléporteur, au Jardin des Géants\n3 racines ancestrales"
  ],
  'Kill 1 Guardian of the Sanctuary, Kill 1 "Rugiboeuf, The Guardian",\nKill 1 Velindra Weaver, Kill 1 "Magnus, Colossus of the Veins"':
    [
      "Mata 1 guardián del santuario, mata 1 «Rugiboeuf, el Guardián»,\nMata 1 tejedora Velindra, mata 1 «Magnus, coloso de las vetas»",
      "Tuez 1 gardien du sanctuaire, tuez 1 « Rugiboeuf, le Gardien »,\nTuez 1 tisseuse Velindra, tuez 1 « Magnus, colosse des veines »"
    ],
  "1 Lost pants from Caulette": ["1 pantalón perdido de Caulette", "1 pantalon perdu de Caulette"],
  "Kill 5 Misty Wolf in the ruins": ["Mata 5 lobos brumosos en las ruinas", "Tuez 5 loups brumeux dans les ruines"],
  "Find Shingetsou's mysterious wife in the Lands of Earan (531 / 1062) -> Go back to Shingestsou (628 / 1440) and Give 1 Savanna axe":
    [
      "Encuentra a la misteriosa esposa de Shingetsou en las Tierras de Earan (531 / 1062) -> Regresa junto a Shingestsou (628 / 1440) y entrega 1 hacha de la sabana",
      "Trouvez la mystérieuse épouse de Shingetsou dans les Terres d'Earan (531 / 1062) -> Retournez voir Shingestsou (628 / 1440) et donnez 1 hache de la savane"
    ],
  "Head towards the Wave Monster Bay Bell Tower (910 / 101)\nThree Corrupted Feathers can be obtained by clicking on them within the Bell Tower\nThe first Corrupted Feather is at the bottom inside the Bell Tower, behind the stairs (-917 / 99)\nThe second Feather will be on a beam when you take the stairs, about halfway up (-914 / 103)\nThe last Feather will be visible while jumping from the Bell Tower in front of the staircase (-916 / 98)":
    [
      "Dirígete al campanario de la Bahía de Monstruos Ondulantes (910 / 101)\nSe pueden obtener tres plumas corruptas haciendo clic sobre ellas dentro del campanario\nLa primera pluma corrupta está en la parte inferior, dentro del campanario, detrás de las escaleras (-917 / 99)\nLa segunda pluma estará sobre una viga al subir las escaleras, a mitad de camino (-914 / 103)\nLa última pluma se verá al saltar desde el campanario, frente a la escalera (-916 / 98)",
      "Dirigez-vous vers le clocher de la Baie des Monstres Ondoyants (910 / 101)\nTrois plumes corrompues peuvent être obtenues en cliquant dessus à l'intérieur du clocher\nLa première plume corrompue se trouve en bas, à l'intérieur du clocher, derrière les escaliers (-917 / 99)\nLa deuxième plume sera sur une poutre en montant les escaliers, à mi-hauteur (-914 / 103)\nLa dernière plume sera visible en sautant du clocher, devant l'escalier (-916 / 98)"
    ],
  /* Requirement and reward strings that mix materials with instructions; the terms are curated
	   as whole sentences so the word order stays natural in both languages. */
  "Crumpled Notebook (-510 106 289), Ring Without Name (521 82 -452), Canvas Bag (846 67 211)": [
    "Cuaderno arrugado (-510 106 289), Anillo sin nombre (521 82 -452), Bolsa de lona (846 67 211)",
    "Carnet froissé (-510 106 289), Anneau sans nom (521 82 -452), Sac de toile (846 67 211)"
  ],
  "Defeat 40 Orc Warrior/Orc Samurai/Orc Shaman": [
    "Derrota a 40 guerreros orco/samuráis orco/chamanes orco",
    "Vaincre 40 guerriers orques/samouraïs orques/chamans orques"
  ],
  "Kill 10 Sharkfish": ["Mata 10 peces tiburón", "Tuez 10 poissons-requins"],
  "Kill 20 Forest Spiders": ["Mata 20 arañas del bosque", "Tuez 20 araignées forestières"],
  "10 Icy Magic Radiance + 5 Broken Violet Fragment": [
    "10 Radiaciones mágicas heladas + 5 Fragmentos de violeta roto",
    "10 Rayonnements magiques glacés + 5 Fragments de violette brisé"
  ],
  "10 Juvenial Bark, Ravaging Bark 5 -> Forge at Gromdar (358 / 591) 1 Orichalcum ingot -> Wait 20 Minutes -> Recover 1 Orichalcum ingot":
    [
      "10 Cortezas juveniles, 5 Cortezas devastadoras -> Forja en Gromdar (358 / 591) 1 Lingote de oricalco -> Espera 20 minutos -> Recupera 1 Lingote de oricalco",
      "10 Écorces juvéniles, 5 Écorces dévastatrices -> Forgez à Gromdar (358 / 591) 1 Lingot d'orichalque -> Attendez 20 minutes -> Récupérez 1 Lingot d'orichalque"
    ],
  "10 Scots Bark + 10 Enchanted Twig + 3 Ancestral Root": [
    "10 Cortezas de pino silvestre + 10 Ramitas encantadas + 3 Raíces ancestrales",
    "10 Écorces de pin sylvestre + 10 Brindilles enchantées + 3 Racines ancestrales"
  ],
  "5 Ancestral Root + 20 Scots Bark": [
    "5 Raíces ancestrales + 20 Cortezas de pino silvestre",
    "5 Racines ancestrales + 20 Écorces de pin sylvestre"
  ],
  "5 Magic Wook Shard + 3 Slime Core + 5 Bone Dust": [
    "5 Fragmentos de madera mágica + 3 Núcleos de slime + 5 Polvo de hueso",
    "5 Éclats de bois magique + 3 Noyaux de slime + 5 Poussière d'os"
  ],
  "25 Wolf Fangs + 25 Boar Hide": [
    "25 Colmillos de lobo + 25 Pieles de jabalí",
    "25 Crocs de loup + 25 Peaux de sanglier"
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
const equipmentTermValueCaches = [new Map(), new Map()];

function translateEquipmentTermValue(value, languageIndex) {
  let translated = String(value || "");
  const cached = equipmentTermValueCaches[languageIndex].get(translated);
  if (cached !== undefined) return cached;
  translated = translated.replace(
    equipmentTermCombinedPattern,
    (match) => equipmentTermLookup.get(match.toLowerCase())?.[languageIndex] || match
  );
  equipmentTermValueCaches[languageIndex].set(String(value || ""), translated);
  return translated;
}

const equivalentLabelTranslations = {
  "N/A": ["N/D", "N/D"],
  "N/A.": ["N/D.", "N/D."],
  "Tower of Kobold": ["Torre de los kobolds", "Tour des kobolds"],
  Mana: ["Maná", "Mana"],
  Unique: ["Único", "Unique"],
  Biome: ["Bioma", "Biome"],
  Boss: ["Jefe", "Boss"],
  "Witch's Potion (Intelligence)": ["Poción de bruja (Inteligencia)", "Potion de sorcière (Intelligence)"],
  "Witch's Potion (Strength)": ["Poción de bruja (Fuerza)", "Potion de sorcière (Force)"],
  "Oceiros Bracelet": ["Brazalete de Oceiros", "Bracelet d'Oceiros"],
  "Hater du Vert": ["Odio al verde", "Hater du Vert"],
  "OG District": ["Distrito OG", "Quartier OG"],
  "Sister Thera": ["Hermana Thera", "Sœur Thera"],
  "Adoryll, the Bird in a Cage": ["Adoryll, el ave en una jaula", "Adoryll, l'oiseau en cage"],
  "Adoryll's cage": ["La jaula de Adoryll", "La cage d'Adoryll"],
  "Illfang, Lord Kobold": ["Illfang, señor de los kobolds", "Illfang, seigneur kobold"],
  "Kobold Tower": ["Torre de los kobolds", "Tour des kobolds"],
  Labyrinth: ["Laberinto", "Labyrinthe"],
  "Melliona's Hive": ["Colmena de Melliona", "Ruche de Melliona"],
  "Misty Wolf Alpha": ["Alfa del lobo brumoso", "Alpha du loup brumeux"],
  Nymbrea: ["Nymbréa", "Nymbréa"],
  "Ruins of Avrylne": ["Ruinas de Avrylne", "Ruines d'Avrylne"],
  "Samurai Orc Boss": ["Jefe orco samurái", "Boss orc samouraï"],
  Emilie: ["Emilie", "Émilie"],
  Headlights: ["Faros", "Phares"],
  Horace: ["Horacio", "Horace"],
  Juliet: ["Julieta", "Juliette"],
  Monica: ["Mónica", "Monica"],
  "Orc & Roll": ["Orco y Roll", "Orc et Roll"],
  Romeo: ["Romeo", "Roméo"],
  CastleMist: ["Niebla del Castillo", "Brume du château"],
  Meticulous: ["Meticuloso", "Méticuleux"],
  Timer: ["Temporizador", "Minuteur"]
};

window.SAOContentTranslations.translateEquipmentTerm = function translateEquipmentTerm(key, english) {
  const spanish = translateEquipmentTermValue(english, 0);
  const french = translateEquipmentTermValue(english, 1);
  window.SAOContentTranslations.register(key, english, spanish, french);
  return english;
};

const locationTranslations = {
  "Altar of the Two Moons": ["Altar de las Dos Lunas", "Autel des Deux Lunes"],
  "Altar of Two Moons": ["Altar de las Dos Lunas", "Autel des Deux Lunes"],
  "Cursed Ruins": ["Ruinas malditas", "Ruines maudites"],
  "Desert of Silver Fangs": ["Desierto de los Colmillos de Plata", "Désert des crocs d'argent"],
  "Dungeon Forgotten Tomb of the Necromancer": [
    "Mazmorra de la tumba olvidada del nigromante",
    "Donjon du tombeau oublié du nécromancien"
  ],
  "Dungeon Sanctuary of Xal'Zirith": ["Mazmorra del santuario de Xal'Zirith", "Donjon du sanctuaire de Xal'Zirith"],
  "Earan Forest": ["Bosque de Earan", "Forêt d'Earan"],
  "Elessarh Mine": ["Mina de Elessarh", "Mine d'Elessarh"],
  "Emerald Wings Forest": ["Bosque de alas esmeralda", "Forêt des ailes d'émeraude"],
  "Geldorak Mine": ["Mina de Geldorak", "Mine de Geldorak"],
  "Geldorak Mine Dungeon": ["Mazmorra de la mina de Geldorak", "Donjon de la mine de Geldorak"],
  "Ika Archipelago": ["Archipiélago de Ika", "Archipel d'Ika"],
  "Inferno Nest": ["Nido del infierno", "Nid de l'enfer"],
  "Interior of the Sanctuary of Khesun": ["Interior del santuario de Khesun", "Intérieur du sanctuaire de Khesun"],
  "Lake of the Bulls": ["Lago de los toros", "Lac des taureaux"],
  "Lake Virelune": ["Lago Virelune", "Lac Virelune"],
  "Land of Earan": ["Tierra de Earan", "Terre d'Earan"],
  "Melliona Hive Dungeon": ["Mazmorra de la colmena de Melliona", "Donjon de la ruche de Melliona"],
  "Mist Shelter": ["Refugio de la niebla", "Refuge de la brume"],
  "Mizunari Fields": ["Campos de Mizunari", "Champs de Mizunari"],
  "Orc Camps": ["Campamentos de orcos", "Camps d'orques"],
  "Sanctuary of Khesun": ["Santuario de Khesun", "Sanctuaire de Khesun"],
  "Sanctuary of Khes├╗n": ["Santuario de Khesûn", "Sanctuaire de Khesûn"],
  "Baobab Mill├⌐naire": ["Baobab milenario", "Baobab millénaire"],
  "Silver Fang Desert": ["Desierto de los colmillos de plata", "Désert des crocs d'argent"],
  "Skeleton Dungeon": ["Mazmorra de esqueletos", "Donjon des squelettes"],
  "Snow Citadel": ["Ciudadela de nieve", "Citadelle des neiges"],
  "Swamp Putride": ["Pantano pútrido", "Marais putride"],
  "Sweet Forest": ["Bosque dulce", "Forêt sucrée"],
  "The Veins of Sablemor": ["Las vetas de Sablemor", "Les veines de Sablemor"],
  "Tolbana Mountains": ["Montañas de Tolbana", "Montagnes de Tolbana"],
  "Town of Beginnings": ["Ciudad de los Comienzos", "Ville des Commencements"],
  "Valley of Wolves": ["Valle de los lobos", "Vallée des loups"],
  "Wavy Monster Bay": ["Bahía de monstruos ondulantes", "Baie des monstres ondoyants"],
  "Wild Boar Meadow": ["Pradera de jabalíes", "Prairie des sangliers"],
  "Wild Boar Zone": ["Zona de jabalíes", "Zone des sangliers"]
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
  "Mysterious Character": ["Personaje Misterioso", "Personnage Mystérieux"],
  "Master Swordsman": ["Maestro Espadachín", "Maître Spadassin"],
  Swordmaster: ["Maestro de Espadas", "Maître d'Épée"],
  "Mayor's Trader": ["Comerciante del Alcalde", "Marchand du Maire"],
  "Mistress Herbalist Alicia": ["Maestra herbolaria Alicia", "Maîtresse herboriste Alicia"],
  "Sister Thera": ["Hermana Thera", "Sœur Thera"],
  Emilie: ["Emilie", "Émilie"],
  Headlights: ["Faros", "Phares"],
  Horace: ["Horacio", "Horace"],
  Juliet: ["Julieta", "Juliette"],
  Monica: ["Mónica", "Monica"],
  Romeo: ["Romeo", "Roméo"],
  Meticulous: ["Meticuloso", "Méticuleux"],
  Timer: ["Temporizador", "Minuteur"]
};

window.SAOContentTranslations.translateKnownTerms = function translateKnownTerms(value, language) {
  if (language === "en") return String(value || "");
  const target = language === "fr" ? window.SAOContentTranslations.fr : window.SAOContentTranslations.es;
  const source = window.SAOContentTranslations.en;
  let translated = String(value || "");
  const languageIndex = language === "fr" ? 1 : 0;
  /* One combined pass per dictionary, longest alternative first. Applying the patterns one after
	   another lets a shorter entry rewrite the glossary output of a longer one ("Grimoire Bestial"
	   -> "Grimoire bestial" -> "Grimoire Bestial"), and letting the bestiary pass run first lets a
	   single bestiary word consume part of a longer curated phrase ("Copper Accessories Blacksmith"
	   -> "Cobre Accessories Blacksmith"). The curated dictionaries therefore run before the bestiary
	   drop list, which is the shortest and least specific of the three. */
  translated = translated.replace(
    equipmentTermCombinedPattern,
    (match) => equipmentTermLookup.get(match.toLowerCase())?.[languageIndex] || match
  );
  translated = translated.replace(
    locationCombinedPattern,
    (match) => locationLookup.get(match.toLowerCase())?.[languageIndex] || match
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
    "2 chemins, 1 choix (quête secondaire) — Coordonnées X : 427 Z : 774"
  ],
  "Bee Armor Blacksmith": ["Herrero de armaduras de abeja", "Forgeron d'armures d'abeille"],
  "Bees Weapon Blacksmith": ["Herrero de armas de abejas", "Forgeron d'armes d'abeilles"],
  "Birch Forest — Coordinates X: 1786 Z: 1184. Gather Birch Wood.": [
    "Bosque de abedules — Coordenadas X: 1786 Z: 1184. Reúne madera de abedul.",
    "Forêt de bouleaux — Coordonnées X : 1786 Z : 1184. Récoltez du bois de bouleau."
  ],
  "Black Market (Biome) — Coordinates X: 1121 Z: 811": [
    "Mercado negro (bioma) — Coordenadas X: 1121 Z: 811",
    "Marché noir (biome) — Coordonnées X : 1121 Z : 811"
  ],
  "Consumables Merchant": ["Mercader de consumibles", "Marchand de consommables"],
  "Corrupt Mask Blacksmith.": ["Herrero de máscaras corruptas.", "Forgeron de masques corrompus."],
  "Entrance to the Labyrinth (Biome) — Coordinates X: 382 Z: 433": [
    "Entrada al Laberinto (bioma) — Coordenadas X: 382 Z: 433",
    "Entrée du Labyrinthe (biome) — Coordonnées X : 382 Z : 433"
  ],
  "Furacas, Guardian of the Labyrinth (Boss) — Coordinates X: 393 Z: 340": [
    "Furacas, guardián del Laberinto (jefe) — Coordenadas X: 393 Z: 340",
    "Furacas, gardien du Labyrinthe (boss) — Coordonnées X : 393 Z : 340"
  ],
  "Guild Base (Biome) — Coordinates X: 775 Z: 1200": [
    "Base del gremio (bioma) — Coordenadas X: 775 Z: 1200",
    "Base de la guilde (biome) — Coordonnées X : 775 Z : 1200"
  ],
  "Labyrinth (Biome) — Coordinates X: 588 Z: 195": [
    "Laberinto (bioma) — Coordenadas X: 588 Z: 195",
    "Labyrinthe (biome) — Coordonnées X : 588 Z : 195"
  ],
  "Muffet, Mother of Black Spiders (Boss) — Coordinates X: 344 Z: 1273": [
    "Muffet, madre de las arañas negras (jefe) — Coordenadas X: 344 Z: 1273",
    "Muffet, mère des araignées noires (boss) — Coordonnées X : 344 Z : 1273"
  ],
  "Necrotic Tool Blacksmith": ["Herrero de herramientas necróticas", "Forgeron d'outils nécrotiques"],
  "Reinforced Tools Merchant": ["Mercader de herramientas reforzadas", "Marchand d'outils renforcés"],
  "Shadows of the Lost Forest (Side Quest) — Coordinates X: 510 Z: 1080": [
    "Sombras del Bosque Perdido (misión secundaria) — Coordenadas X: 510 Z: 1080",
    "Ombres de la Forêt Perdue (quête secondaire) — Coordonnées X : 510 Z : 1080"
  ],
  "Wolf Forest (Biome) — Coordinates X: 970 Z: 828": [
    "Bosque de lobos (bioma) — Coordenadas X: 970 Z: 828",
    "Forêt des loups (biome) — Coordonnées X : 970 Z : 828"
  ],
  /* Second batch, composed from the curated marker title plus the marker type, so a renamed
	   marker can never fall back to a half-translated string. Coordinates keep the em dash and
	   spacing of the map data; the type label is lower case like the entries above. */
  "Adoryll's cage (Biome) — Coordinates X: 274 Z: 1244": [
    "La jaula de Adoryll (bioma) — Coordenadas X: 274 Z: 1244",
    "La cage d'Adoryll (biome) — Coordonnées X : 274 Z : 1244"
  ],
  "Adoryll, the Bird in a Cage (Boss) — Coordinates X: 275 Z: 1245": [
    "Adoryll, el ave en una jaula (jefe) — Coordenadas X: 275 Z: 1245",
    "Adoryll, l'oiseau en cage (boss) — Coordonnées X : 275 Z : 1245"
  ],
  "Aldarya (Biome) — Coordinates X: 1083 Z: 592": [
    "Aldarya (bioma) — Coordenadas X: 1083 Z: 592",
    "Aldarya (biome) — Coordonnées X : 1083 Z : 592"
  ],
  "Alpha of the Woods (Boss) — Coordinates X: 1060 Z: 892": [
    "Alfa de los bosques (jefe) — Coordenadas X: 1060 Z: 892",
    "Alpha des bois (boss) — Coordonnées X : 1060 Z : 892"
  ],
  "A very strange lumberjack (Side Quest) — Coordinates X: 628 Z: 1440": [
    "Un leñador muy extraño (misión secundaria) — Coordenadas X: 628 Z: 1440",
    "Un bûcheron très étrange (quête secondaire) — Coordonnées X : 628 Z : 1440"
  ],
  "Bandit Camps (Biome) — Coordinates X: 1138 Z: 844": [
    "Campamentos de bandidos (bioma) — Coordenadas X: 1138 Z: 844",
    "Camps de bandits (biome) — Coordonnées X : 1138 Z : 844"
  ],
  "Blided Orcs or Pulmed Orcs! (Side Quest) — Coordinates X: 358 Z: 591": [
    "¡Orcos cegados u orcos desplumados! (misión secundaria) — Coordenadas X: 358 Z: 591",
    "Orques aveuglés ou orques plumés ! (quête secondaire) — Coordonnées X : 358 Z : 591"
  ],
  "Caverns (Biome) — Coordinates X: 528 Z: 858": [
    "Cavernas (bioma) — Coordenadas X: 528 Z: 858",
    "Cavernes (biome) — Coordonnées X : 528 Z : 858"
  ],
  "Dungeon The Mysterious Islands (Biome) — Coordinates X: 860 Z: 288": [
    "Mazmorra de las Islas Misteriosas (bioma) — Coordenadas X: 860 Z: 288",
    "Donjon des Îles Mystérieuses (biome) — Coordonnées X : 860 Z : 288"
  ],
  "Earan Forest (Biome) — Coordinates X: 477 Z: 875": [
    "Bosque de Earan (bioma) — Coordenadas X: 477 Z: 875",
    "Forêt d'Earan (biome) — Coordonnées X : 477 Z : 875"
  ],
  "Earan Land (Biome) — Coordinates X: 587 Z: 984": [
    "Tierra de Earan (bioma) — Coordenadas X: 587 Z: 984",
    "Terre d'Earan (biome) — Coordonnées X : 587 Z : 984"
  ],
  "Elessarh Mine (Biome) — Coordinates X: 928 Z: 505": [
    "Mina de Elessarh (bioma) — Coordenadas X: 928 Z: 505",
    "Mine d'Elessarh (biome) — Coordonnées X : 928 Z : 505"
  ],
  "Ilmarin (Biome) — Coordinates X: 1049 Z: 862": [
    "Ilmarin (bioma) — Coordenadas X: 1049 Z: 862",
    "Ilmarin (biome) — Coordonnées X : 1049 Z : 862"
  ],
  "King of the Cave (Boss) — Coordinates X: 886 Z: 1098": [
    "Rey de la cueva (jefe) — Coordenadas X: 886 Z: 1098",
    "Roi de la caverne (boss) — Coordonnées X : 886 Z : 1098"
  ],
  "Leader of the Bandits (Boss) — Coordinates X: 1175 Z: 837": [
    "Líder de los bandidos (jefe) — Coordenadas X: 1175 Z: 837",
    "Chef des bandits (boss) — Coordonnées X : 1175 Z : 837"
  ],
  "Lysaat (Biome) — Coordinates X: 346 Z: 592": [
    "Lysaat (bioma) — Coordenadas X: 346 Z: 592",
    "Lysaat (biome) — Coordonnées X : 346 Z : 592"
  ],
  "Materials for ShiShi (Side Quest) — Coordinates X: 589 Z: 1362": [
    "Materiales para ShiShi (misión secundaria) — Coordenadas X: 589 Z: 1362",
    "Matériaux pour ShiShi (quête secondaire) — Coordonnées X : 589 Z : 1362"
  ],
  "Mist Canyon (Biome) — Coordinates X: 807 Z: 855": [
    "Cañón de niebla (bioma) — Coordenadas X: 807 Z: 855",
    "Canyon de brume (biome) — Coordonnées X : 807 Z : 855"
  ],
  "Mist Refuge (Biome) — Coordinates X: 705 Z: 847": [
    "Refugio de niebla (bioma) — Coordenadas X: 705 Z: 847",
    "Refuge de brume (biome) — Coordonnées X : 705 Z : 847"
  ],
  "Misty Wolf Alpha (Boss) — Coordinates X: 757 Z: 790": [
    "Alfa del lobo brumoso (jefe) — Coordenadas X: 757 Z: 790",
    "Alpha du loup brumeux (boss) — Coordonnées X : 757 Z : 790"
  ],
  "Orc & Roll (Side Quest) — Coordinates X: 140 Z: 736": [
    "Orco y Roll (misión secundaria) — Coordenadas X: 140 Z: 736",
    "Orc et Roll (quête secondaire) — Coordonnées X : 140 Z : 736"
  ],
  "Orc Camps (Biome) — Coordinates X: 285 Z: 1191": [
    "Campamentos de orcos (bioma) — Coordenadas X: 285 Z: 1191",
    "Camps d'orques (biome) — Coordonnées X : 285 Z : 1191"
  ],
  "Regulation quota (Side Quest) — Coordinates X: 162 Z: 771": [
    "Cuota reglamentaria (misión secundaria) — Coordenadas X: 162 Z: 771",
    "Quota réglementaire (quête secondaire) — Coordonnées X : 162 Z : 771"
  ],
  "Rest of Ankyla (Biome) — Coordinates X: 1105 Z: 1043": [
    "Descanso de Ankyla (bioma) — Coordenadas X: 1105 Z: 1043",
    "Repos d'Ankyla (biome) — Coordonnées X : 1105 Z : 1043"
  ],
  "Ruins of Avrylne (Biome) — Coordinates X: 543 Z: 760": [
    "Ruinas de Avrylne (bioma) — Coordenadas X: 543 Z: 760",
    "Ruines d'Avrylne (biome) — Coordonnées X : 543 Z : 760"
  ],
  "Samurai Orc Boss (Boss) — Coordinates X: 256 Z: 1219": [
    "Jefe orco samurái (jefe) — Coordenadas X: 256 Z: 1219",
    "Boss orc samouraï (boss) — Coordonnées X : 256 Z : 1219"
  ],
  "Swamp (Biome) — Coordinates X: 633 Z: 1258": [
    "Pantano (bioma) — Coordenadas X: 633 Z: 1258",
    "Marais (biome) — Coordonnées X : 633 Z : 1258"
  ],
  "Sylinga (Biome) — Coordinates X: 163 Z: 721": [
    "Sylinga (bioma) — Coordenadas X: 163 Z: 721",
    "Sylinga (biome) — Coordonnées X : 163 Z : 721"
  ],
  "Terrialys Well (Biome) — Coordinates X: 961 Z: 1103": [
    "Pozo de Terrialys (bioma) — Coordenadas X: 961 Z: 1103",
    "Puits de Terrialys (biome) — Coordonnées X : 961 Z : 1103"
  ],
  "The Ascalon Oath (Side Quest) — Coordinates X: 133 Z: 995": [
    "El juramento de Ascalon (misión secundaria) — Coordenadas X: 133 Z: 995",
    "Le serment d'Ascalon (quête secondaire) — Coordonnées X : 133 Z : 995"
  ],
  "The Ashes of the Past (Side Quest) — Coordinates X: 515 Z: 859": [
    "Las cenizas del pasado (misión secundaria) — Coordenadas X: 515 Z: 859",
    "Les cendres du passé (quête secondaire) — Coordonnées X : 515 Z : 859"
  ],
  "The Dance of the Sleeping Treants (Side Quest) — Coordinates X: 583 Z: 1428": [
    "La danza de los treants dormidos (misión secundaria) — Coordenadas X: 583 Z: 1428",
    "La danse des tréants endormis (quête secondaire) — Coordonnées X : 583 Z : 1428"
  ],
  "The Forge of a God (Side Quest) — Coordinates X: 608 Z: 1046": [
    "La forja de un dios (misión secundaria) — Coordenadas X: 608 Z: 1046",
    "La forge d'un dieu (quête secondaire) — Coordonnées X : 608 Z : 1046"
  ],
  "The Great Feast (Side Quest) — Coordinates X: 874 Z: 716": [
    "El gran festín (misión secundaria) — Coordenadas X: 874 Z: 716",
    "Le grand festin (quête secondaire) — Coordonnées X : 874 Z : 716"
  ],
  "The legend of Zilda (Side Quest) — Coordinates X: 1068 Z: 919": [
    "La leyenda de Zilda (misión secundaria) — Coordenadas X: 1068 Z: 919",
    "La légende de Zilda (quête secondaire) — Coordonnées X : 1068 Z : 919"
  ],
  "The mask of the Memory Tree (Side Quest) — Coordinates X: 201 Z: 714": [
    "La máscara del árbol de la memoria (misión secundaria) — Coordenadas X: 201 Z: 714",
    "Le masque de l'arbre de la mémoire (quête secondaire) — Coordonnées X : 201 Z : 714"
  ],
  "The new undermines (Side Quest) — Coordinates X: 913 Z: 673": [
    "Las nuevas minas subterráneas (misión secundaria) — Coordenadas X: 913 Z: 673",
    "Les nouvelles mines souterraines (quête secondaire) — Coordonnées X : 913 Z : 673"
  ],
  "The Prankster Goblins (Side Quest) — Coordinates X: 870 Z: 446": [
    "Los goblins bromistas (misión secundaria) — Coordenadas X: 870 Z: 446",
    "Les gobelins farceurs (quête secondaire) — Coordonnées X : 870 Z : 446"
  ],
  "The Shadow under the Red Iris (Side Quest) — Coordinates X: 981 Z: 544": [
    "La sombra bajo el iris rojo (misión secundaria) — Coordenadas X: 981 Z: 544",
    "L'ombre sous l'iris rouge (quête secondaire) — Coordonnées X : 981 Z : 544"
  ],
  "The wild threat (Side Quest) — Coordinates X: 707 Z: 854": [
    "La amenaza salvaje (misión secundaria) — Coordenadas X: 707 Z: 854",
    "La menace sauvage (quête secondaire) — Coordonnées X : 707 Z : 854"
  ],
  "Triyag (Biome) — Coordinates X: 582 Z: 1381": [
    "Triyag (bioma) — Coordenadas X: 582 Z: 1381",
    "Triyag (biome) — Coordonnées X : 582 Z : 1381"
  ],
  "Weisslum (Biome) — Coordinates X: 650 Z: 607": [
    "Weisslum (bioma) — Coordenadas X: 650 Z: 607",
    "Weisslum (biome) — Coordonnées X : 650 Z : 607"
  ],
  "Zumfut (Biome) — Coordinates X: 932 Z: 609": [
    "Zumfut (bioma) — Coordenadas X: 932 Z: 609",
    "Zumfut (biome) — Coordonnées X : 932 Z : 609"
  ],
  /* Site markers whose description repeats the title verbatim. */
  "Amethyst Armor Blacksmith": ["Herrero de armaduras de amatista", "Forgeron d'armures d'améthyste"],
  "Amulet Blacksmith": ["Herrero de amuletos", "Forgeron d'amulettes"],
  "Amulet Merchant": ["Mercader de amuletos", "Marchand d'amulettes"],
  "Ancient Wood Armor Blacksmith": ["Herrero de armaduras de madera ancestral", "Forgeron d'armures de bois ancien"],
  "Armor Blacksmith": ["Herrero de armaduras", "Forgeron d'armures"],
  "Artifact Merchant": ["Mercader de artefactos", "Marchand d'artefacts"],
  "Assistant to the Alchemist": ["Ayudante del alquimista", "Assistant de l'alchimiste"],
  "Bandit Loot Reseller": ["Revendedor de botín bandido", "Revendeur de butin bandit"],
  "Bauxite Accessories Blacksmith.": ["Herrero de accesorios de bauxita.", "Forgeron d'accessoires de bauxite."],
  "Bracelet Blacksmith": ["Herrero de brazaletes", "Forgeron de bracelets"],
  "Bracelet Merchant": ["Mercader de brazaletes", "Marchand de bracelets"],
  "Bull & Bear Accessories Blacksmith": [
    "Herrero de accesorios de toro y oso",
    "Forgeron d'accessoires de taureau et d'ours"
  ],
  "Former Blacksmith": ["Antiguo herrero", "Ancien forgeron"],
  "Glove Blacksmith": ["Herrero de guantes", "Forgeron de gants"],
  "Glove Merchant": ["Mercader de guantes", "Marchand de gants"],
  "Harpies Loot Buyer": ["Comprador de botín de arpías", "Acheteur de butin de harpies"],
  "Honeyed Loot Buyer": ["Comprador de botín meloso", "Acheteur de butin miellé"],
  "Ingot Blacksmith": ["Herrero de lingotes", "Forgeron de lingots"],
  "Key Blacksmith": ["Herrero de llaves", "Forgeron de clés"],
  "Low Corruption Bracelet Blacksmith": [
    "Herrero de brazaletes de baja corrupción",
    "Forgeron de bracelets de faible corruption"
  ],
  "Miner of the Corner": ["Minero de la esquina", "Mineur du coin"],
  "Necrotic Weaponsmith": ["Herrero de armas necrótico", "Forgeron d'armes nécrotiques"],
  "Occult Amulet Merchant": ["Mercader de amuletos ocultos", "Marchand d'amulettes occultes"],
  "Occult Bracelet Merchant": ["Mercader de brazaletes ocultos", "Marchand de bracelets occultes"],
  "Occult Gloves Merchant": ["Mercader de guantes ocultos", "Marchand de gants occultes"],
  "Occult Merchant": ["Mercader oculto", "Marchand occulte"],
  "Occult Ringman": ["Vendedor de anillos ocultos", "Vendeur de bagues occultes"],
  "Occult Runes Merchant": ["Mercader de runas ocultas", "Marchand de runes occultes"],
  "Pure Onyx Ingot Blacksmith": ["Herrero de lingotes de ónice puro", "Forgeron de lingots d'onyx pur"],
  "Purification Alchemist": ["Alquimista de purificación", "Alchimiste de purification"],
  "Ring Blacksmith": ["Herrero de anillos", "Forgeron d'anneaux"],
  "Scrap Accessories Blacksmith.": ["Herrero de accesorios de chatarra.", "Forgeron d'accessoires de ferraille."],
  "Sylnovar Accessories Blacksmith": ["Herrero de accesorios de Sylnovar", "Forgeron d'accessoires de Sylnovar"],
  "Tribe Belt Blacksmith": ["Herrero de cinturones de la tribu", "Forgeron de ceintures de la tribu"],
  /* One-line descriptions that are not a repeated title. */
  "Alchemist, Crystallograph, Assistant to the Alchemist": [
    "Alquimista, cristalógrafo, ayudante del alquimista",
    "Alchimiste, cristallographe, assistant de l'alchimiste"
  ],
  "Bandit Loot Repreneur - Buys Loot.": [
    "Comprador de botín bandido - Compra botín.",
    "Repreneur de butin bandit - Achète du butin."
  ],
  "Bauxite Ingots & Impure Onyx Blacksmith": [
    "Herrero de lingotes de bauxita y ónice impuro",
    "Forgeron de lingots de bauxite et d'onyx impur"
  ],
  "Crushed Harpy Ring Blacksmith.": ["Herrero de anillos de arpía aplastada.", "Forgeron d'anneaux de harpie écrasée."],
  "Drowned Harpy Ring Blacksmith.": ["Herrero de anillos de arpía ahogada.", "Forgeron d'anneaux de harpie noyée."],
  "Farm — Coordinates X: 2349 Z: 3650. Gather Allium and Wheat.": [
    "Granja — Coordenadas X: 2349 Z: 3650. Reúne allium y trigo.",
    "Ferme — Coordonnées X : 2349 Z : 3650. Récoltez de l'allium et du blé."
  ],
  "Fierce Talisman Blacksmith.": ["Herrero de talismanes feroces.", "Forgeron de talismans féroces."],
  "Flaming Harpy Ring Blacksmith.": [
    "Herrero de anillos de arpía flameante.",
    "Forgeron d'anneaux de harpie flamboyante."
  ],
  "Goblin Loot Repreneur - Buys Loot.": [
    "Comprador de botín goblin - Compra botín.",
    "Repreneur de butin gobelin - Achète du butin."
  ],
  "Local Farmer - Buys Loot.": ["Granjero local - Compra botín.", "Fermier local - Achète du butin."],
  "Local lumberjack - Buys Loot.": ["Leñador local - Compra botín.", "Bûcheron local - Achète du butin."],
  "Loot Buyer Sylnovar - Buys Loot.": [
    "Comprador de botín de Sylnovar - Compra botín.",
    "Acheteur de butin de Sylnovar - Achète du butin."
  ],
  "Loot Buyer Sylvaer - Buys Loot.": [
    "Comprador de botín de Sylvaer - Compra botín.",
    "Acheteur de butin de Sylvaer - Achète du butin."
  ],
  "Loot Buyer Treant - Buys Loot.": [
    "Comprador de botín de treant - Compra botín.",
    "Acheteur de butin de tréant - Achète du butin."
  ],
  "Makes Wooden Boards and Acacia Wood Powder.": [
    "Fabrica tablones de madera y polvo de madera de acacia.",
    "Fabrique des planches de bois et de la poudre de bois d'acacia."
  ],
  "Miner of the Corner - Buys Loot.": ["Minero de la esquina - Compra botín.", "Mineur du coin - Achète du butin."],
  "Necromancer Armor Blacksmith": ["Herrero de armaduras de nigromante", "Forgeron d'armures de nécromancien"],
  "Orc Loot Repreneur - Buys Loot.": [
    "Comprador de botín orco - Compra botín.",
    "Repreneur de butin orc - Achète du butin."
  ],
  "Runic Necklace Blacksmith.": ["Herrero de collares rúnicos.", "Forgeron de colliers runiques."],
  "Sells Necrotic Loot.": ["Vende botín necrótico.", "Vend du butin nécrotique."],
  "Sells objects from the Sanctuary of Khesûn.": [
    "Vende objetos del Santuario de Khesûn.",
    "Vend des objets du Sanctuaire de Khesûn."
  ],
  "Side Quest NPC in Candelia.": ["PNJ de misión secundaria en Candelia.", "PNJ de quête secondaire à Candelia."],
  "Side Quest NPC in Castlemist.": ["PNJ de misión secundaria en Castlemist.", "PNJ de quête secondaire à Castlemist."],
  "Side Quest NPC in Hanaka.": ["PNJ de misión secundaria en Hanaka.", "PNJ de quête secondaire à Hanaka."],
  "Side Quest NPC in Mizunari.": ["PNJ de misión secundaria en Mizunari.", "PNJ de quête secondaire à Mizunari."],
  "Side Quest NPC in Tolbana.": ["PNJ de misión secundaria en Tolbana.", "PNJ de quête secondaire à Tolbana."],
  "Side Quest NPC in Town of Beginnings.": [
    "PNJ de misión secundaria en la Ciudad de los Comienzos.",
    "PNJ de quête secondaire à la Ville des Commencements."
  ],
  "Side Quest NPC in Vallhat.": ["PNJ de misión secundaria en Vallhat.", "PNJ de quête secondaire à Vallhat."],
  "Side Quest NPC in Virelune.": ["PNJ de misión secundaria en Virelune.", "PNJ de quête secondaire à Virelune."],
  "Spider Loot Repreneur - Buys Loot.": [
    "Comprador de botín de araña - Compra botín.",
    "Repreneur de butin d'araignée - Achète du butin."
  ],
  "Wild Gloves Blacksmith.": ["Herrero de guantes salvajes.", "Forgeron de gants sauvages."],
  "Article proposal (Side Quest) — Coordinates X: 876 Z: 555": [
    "Propuesta de artículo (misión secundaria) — Coordenadas X: 876 Z: 555",
    "Proposition d'article (quête secondaire) — Coordonnées X : 876 Z : 555"
  ]
};

const commonProseTranslations = [
  ["A ", ["Un ", "Un "]],
  ["An ", ["Un ", "Un "]],
  ["The ", ["El ", "Le "]],
  ["this ", ["este ", "cet "]],
  ["This ", ["Esta ", "Cette "]],
  ["that ", ["que ", "qui "]],
  ["and ", ["y ", "et "]],
  ["of ", ["de ", "de "]],
  ["from ", ["de ", "de "]],
  ["with ", ["con ", "avec "]],
  ["in ", ["en ", "dans "]],
  ["on ", ["en ", "sur "]],
  ["to ", ["para ", "pour "]],
  ["for ", ["para ", "pour "]],
  ["into ", ["en ", "dans "]],
  ["it ", ["lo ", "il "]],
  ["is ", ["es ", "est "]],
  ["are ", ["son ", "sont "]],
  ["has ", ["tiene ", "a "]],
  ["can ", ["puede ", "peut "]],
  ["made ", ["hecho ", "fabriqué "]],
  ["from ", ["de ", "de "]],
  ["very ", ["muy ", "très "]],
  ["long ", ["largo ", "longue "]],
  ["heavy ", ["pesado ", "lourd "]],
  ["strong ", ["fuerte ", "solide "]],
  ["sturdy ", ["resistente ", "robuste "]],
  ["strong", ["fuerte", "solide"]],
  ["powerful ", ["poderoso ", "puissant "]],
  ["powerful", ["poderoso", "puissant"]],
  ["beautiful ", ["hermoso ", "beau "]],
  ["heavy ", ["pesado ", "lourd "]],
  ["heavy", ["pesado", "lourd"]],
  ["green ", ["verde ", "verte "]],
  ["white ", ["blanco ", "blanc "]],
  ["yellow ", ["amarillo ", "jaune "]],
  ["blue ", ["azul ", "bleu "]],
  ["silver ", ["plateado ", "argenté "]],
  ["winter ", ["invierno ", "hiver "]],
  ["wild ", ["salvaje ", "sauvage "]],
  ["wolf ", ["lobo ", "loup "]],
  ["wolves ", ["lobos ", "loups "]],
  ["spider ", ["araña ", "araignée "]],
  ["potion ", ["poción ", "potion "]],
  ["sword ", ["espada ", "épée "]],
  ["shield ", ["escudo ", "bouclier "]],
  ["gloves ", ["guantes ", "gants "]],
  ["bracelet ", ["brazalete ", "bracelet "]],
  ["necklace ", ["collar ", "collier "]],
  ["claw ", ["garra ", "griffe "]],
  ["thread ", ["hilo ", "fil "]],
  ["powder ", ["polvo ", "poudre "]],
  ["meat ", ["carne ", "viande "]],
  ["drink ", ["bebida ", "boisson "]],
  ["energy ", ["energía ", "énergie "]],
  ["air ", ["aire ", "air "]],
  ["body ", ["cuerpo ", "corps "]],
  ["skin ", ["piel ", "peau "]],
  ["bone ", ["hueso ", "os "]],
  ["dust ", ["polvo ", "poussière "]],
  ["gift", ["regalo", "cadeau"]],
  ["children", ["niños", "enfants"]],
  ["enemy", ["enemigo", "ennemi"]],
  ["enemies", ["enemigos", "ennemis"]],
  ["protects", ["protege", "protège"]],
  ["restores", ["restaura", "régénère"]],
  ["triggers", ["activa", "déclenche"]],
  ["seconds", ["segundos", "secondes"]],
  ["minutes", ["minutos", "minutes"]],
  ["weapon", ["arma", "arme"]],
  ["weapons", ["armas", "armes"]],
  ["damage", ["daño", "dégâts"]],
  ["boss", ["jefe", "boss"]],
  ["tier", ["nivel", "niveau"]],
  ["perfect", ["perfecto", "parfait"]],
  ["incredible", ["increíble", "incroyable"]],
  ["dealing", ["infligiendo", "infligeant"]],
  ["enchantments", ["encantamientos", "enchantements"]],
  ["metals", ["metales", "métaux"]],
  ["destruction", ["destrucción", "destruction"]],
  ["little", ["pequeños", "petits"]],
  ["slaves", ["esclavos", "esclaves"]],
  ["outside", ["fuera de", "à l'extérieur de"]],
  ["monster", ["monstruo", "monstre"]],
  ["monsters", ["monstruos", "monstres"]],
  ["hunt", ["caza", "chasse"]],
  ["belongs", ["pertenece", "appartient"]],
  ["belonged", ["perteneció", "appartenait"]],
  ["heavy", ["pesado", "lourd"]],
  ["cooldown", ["enfriamiento", "temps de recharge"]],
  ["Slot: artefact", ["Ranura: artefacto", "Emplacement : artefact"]],
  ["Slot: bracelet", ["Ranura: brazalete", "Emplacement : bracelet"]]
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

window.SAOContentTranslations.translateEquivalentLabel = function translateEquivalentLabel(value, languageIndex) {
  return equivalentLabelTranslations[String(value)]?.[languageIndex] || value;
};

window.SAOContentTranslations.translateEquivalentProse = function translateEquivalentProse(value, language) {
  let translated = window.SAOContentTranslations.translateKnownTerms(value, language);
  const languageIndex = language === "fr" ? 1 : 0;
  commonProsePatterns.forEach(({ pattern, translations }) => {
    translated = translated.replace(pattern, (_match, boundary) => boundary + translations[languageIndex]);
  });
  return translated;
};

function translateCommandProse(value, language) {
  const commandPhrases = {
    "Send money to another player": ["Envía dinero a otro jugador", "Envoyez de l'argent à un autre joueur"],
    "Send a private message": ["Envía un mensaje privado", "Envoyez un message privé"],
    "Reply to the last private message": ["Responde al último mensaje privado", "Répondez au dernier message privé"],
    "Friend system": ["Sistema de amigos", "Système d'amis"],
    "Party management": ["Gestión del grupo", "Gestion du groupe"],
    "Trade with another player": ["Intercambia con otro jugador", "Échangez avec un autre joueur"],
    "Opens your in game mail": ["Abre tu correo del juego", "Ouvre votre courrier en jeu"],
    "Opens mail sent by staff or automated systems": [
      "Abre el correo enviado por el personal o sistemas automáticos",
      "Ouvre les messages envoyés par le personnel ou les systèmes automatisés"
    ],
    "Opens the cosmetic menu": ["Abre el menú cosmético", "Ouvre le menu cosmétique"],
    "Animation configuration settings": [
      "Ajustes de configuración de animaciones",
      "Paramètres de configuration des animations"
    ],
    "Change your title if you own one": [
      "Cambia tu título si tienes uno",
      "Changez votre titre si vous en possédez un"
    ],
    "Configure Zoomify settings": ["Configura los ajustes de Zoomify", "Configurez les paramètres de Zoomify"],
    "Opens dungeon help and dungeon commands": [
      "Abre la ayuda y los comandos de mazmorra",
      "Ouvre l'aide et les commandes des donjons"
    ],
    "Queue management for dungeons or lobbies": [
      "Gestión de colas para mazmorras o salas",
      "Gestion des files d'attente des donjons ou des salons"
    ],
    "Auction House commands": ["Comandos de la casa de subastas", "Commandes de l'hôtel des ventes"],
    "Check balances, leave name blank to see your own balance": [
      "Consulta los saldos; deja el nombre vacío para ver el tuyo",
      "Consultez les soldes ; laissez le nom vide pour voir le vôtre"
    ],
    "Opens the post office": ["Abre la oficina de correos", "Ouvre le bureau de poste"],
    "Opens a trash inventory": ["Abre un inventario de basura", "Ouvre un inventaire de déchets"],
    "Opens your backpack": ["Abre tu mochila", "Ouvre votre sac à dos"],
    "Opens your collection/codex": ["Abre tu colección o códice", "Ouvre votre collection ou codex"],
    "Opens the companion menu": ["Abre el menú de compañeros", "Ouvre le menu des compagnons"],
    "Move items between Underworld and Aincrad": [
      "Mueve objetos entre Underworld y Aincrad",
      "Déplacez des objets entre Underworld et Aincrad"
    ],
    "Shows class or job statistics": [
      "Muestra las estadísticas de clase o trabajo",
      "Affiche les statistiques de classe ou de métier"
    ],
    "Opens the mount menu": ["Abre el menú de monturas", "Ouvre le menu des montures"],
    "Shows your skills": ["Muestra tus habilidades", "Affiche vos compétences"],
    "Opens your skill tree": ["Abre tu árbol de habilidades", "Ouvre votre arbre de compétences"],
    "Shows your stats": ["Muestra tus estadísticas", "Affiche vos statistiques"],
    "Opens the quest codex": ["Abre el códice de misiones", "Ouvre le codex des quêtes"],
    "Bug reporting command": ["Comando para informar de errores", "Commande de signalement de bugs"],
    "Displays server information": ["Muestra información del servidor", "Affiche les informations du serveur"],
    "Opens game news": ["Abre las noticias del juego", "Ouvre les actualités du jeu"],
    "Displays server version information": [
      "Muestra la versión del servidor",
      "Affiche les informations de version du serveur"
    ],
    "Voice chat controls": ["Controles del chat de voz", "Contrôles du chat vocal"],
    "Returns you to the hub": ["Te devuelve al centro", "Vous ramène au hub"],
    "Does nothing currently but a menu pops up": [
      "No hace nada actualmente, pero aparece un menú",
      "Ne fait rien pour le moment, mais un menu apparaît"
    ],
    "You can run it but nothing pops up": [
      "Puedes ejecutarlo, pero no aparece nada",
      "Vous pouvez l'exécuter, mais rien n'apparaît"
    ],
    "currently appears broken or disabled": [
      "parece estar roto o desactivado actualmente",
      "semble actuellement cassé ou désactivé"
    ],
    "Broken Right Now": ["Roto ahora mismo", "Cassé pour le moment"],
    "Sends Username a friend request": [
      "Envía a Username una solicitud de amistad",
      "Envoie une demande d'ami à Username"
    ],
    "Removes Username as a friend": ["Elimina a Username como amigo", "Retire Username de vos amis"],
    "Accepts Username's friend request": [
      "Acepta la solicitud de amistad de Username",
      "Accepte la demande d'ami de Username"
    ],
    "Denies Username's friend request": [
      "Rechaza la solicitud de amistad de Username",
      "Refuse la demande d'ami de Username"
    ],
    "Shows your whole friend list and extra info": [
      "Muestra toda tu lista de amigos y datos adicionales",
      "Affiche toute votre liste d'amis et des informations supplémentaires"
    ],
    "Toggles your chat into party chat. Run the command again to turn it off.": [
      "Activa el chat de grupo. Ejecuta el comando de nuevo para desactivarlo.",
      "Active le chat de groupe. Exécutez à nouveau la commande pour le désactiver."
    ],
    "Shows party commands": ["Muestra los comandos de grupo", "Affiche les commandes de groupe"],
    "Party chat shortcut": ["Acceso directo al chat de grupo", "Raccourci du chat de groupe"],
    "Shows info of the party you are currently in": [
      "Muestra información del grupo en el que estás",
      "Affiche les informations de votre groupe actuel"
    ],
    "Leaves the party you are currently in": ["Abandona el grupo actual", "Quitte votre groupe actuel"],
    "Shows current online parties": [
      "Muestra los grupos conectados actualmente",
      "Affiche les groupes actuellement en ligne"
    ],
    "Invites Username to your party": ["Invita a Username a tu grupo", "Invite Username dans votre groupe"],
    "Pays Username 10 Col": ["Paga 10 Col a Username", "Paie 10 Col à Username"],
    "Sends Username a trade request": [
      "Envía a Username una solicitud de intercambio",
      "Envoie une demande d'échange à Username"
    ],
    "Lets you hear players": ["Te permite oír a los jugadores", "Vous permet d'entendre les joueurs"],
    "Doesnt let you hear players": ["No te permite oír a los jugadores", "Ne vous permet pas d'entendre les joueurs"],
    "Mutes your mic": ["Silencia tu micrófono", "Coupe votre micro"],
    "Unmutes your mic": ["Activa tu micrófono", "Réactive votre micro"],
    "Plays music": ["Reproduce música", "Lit la musique"],
    "Stops music": ["Detiene la música", "Arrête la musique"],
    "Changes music volume": ["Cambia el volumen de la música", "Modifie le volume de la musique"],
    "This cmd is a Work In Progress right now": [
      "Este comando está en desarrollo",
      "Cette commande est en cours de développement"
    ],
    "Shows random info": ["Muestra información aleatoria", "Affiche des informations aléatoires"],
    "Shows your current spot in your queue": [
      "Muestra tu posición actual en la cola",
      "Affiche votre position actuelle dans la file"
    ],
    "Leaves your current lobby queue": ["Abandona la cola de la sala actual", "Quitte la file de votre salon actuel"],
    "Just opens the basic Auction House": [
      "Solo abre la casa de subastas básica",
      "Ouvre simplement l'hôtel des ventes de base"
    ],
    "Lets you see your Auction House history": [
      "Te permite ver el historial de tu casa de subastas",
      "Permet de consulter l'historique de votre hôtel des ventes"
    ],
    "Lets you see Username's Auction House history": [
      "Te permite ver el historial de subastas de Username",
      "Permet de consulter l'historique des ventes de Username"
    ],
    "Shows matching listings where Pumba is the first word": [
      "Muestra anuncios coincidentes donde Pumba es la primera palabra",
      "Affiche les annonces correspondantes où Pumba est le premier mot"
    ],
    "This checks your col": ["Consulta tus Col", "Consulte vos Col"],
    "This opens your trash bin, close the menu to confirm deletion.": [
      "Abre tu papelera; cierra el menú para confirmar la eliminación.",
      "Ouvre votre corbeille ; fermez le menu pour confirmer la suppression."
    ],
    "Music player command, currently appears broken or disabled. This may be better kept staff-only (Broken Right Now?)":
      [
        "Comando del reproductor de música; actualmente parece roto o desactivado. Quizá sea mejor mantenerlo solo para el personal (¿roto ahora mismo?)",
        "Commande du lecteur de musique ; elle semble actuellement cassée ou désactivée. Il vaudrait peut-être mieux la réserver au personnel (Cassé pour le moment ?)"
      ],
    "Takes you to your player island, only usable in Fractured Underworld": [
      "Te lleva hacia tu propia isla de jugador; solo se puede usar en Fractured Underworld",
      "Vous emmène sur votre île de joueur ; utilisable uniquement dans Fractured Underworld"
    ],
    "Appears to be a staff moderation command but can be run by players; remove from this list after Underworld release if still inactive":
      [
        "Parece ser un comando de moderación del personal, pero los jugadores pueden ejecutarlo; elimínalo de esta lista tras el lanzamiento de Underworld si sigue inactivo",
        "Semble être une commande de modération du personnel, mais les joueurs peuvent l'exécuter ; retirez-la de cette liste après la sortie d'Underworld si elle reste inactive"
      ],
    "Music player command": ["Comando del reproductor de música", "Commande du lecteur de musique"],
    "This may be better kept staff-only": [
      "Quizá sea mejor mantenerlo solo para el personal",
      "Il vaudrait peut-être mieux la garder pour le personnel"
    ],
    "Takes you to your player island": [
      "Te lleva hacia tu propia isla de jugador",
      "Vous emmène sur votre île de joueur"
    ],
    /* Whole-string help/usage entries: curated so command syntax, placeholders and slash commands
	   stay exactly as written while the surrounding explanation reads naturally. */
    "/friend add Username (Sends Username a friend request)\n/friend remove Username (Removes Username as a friend)\n/friend accept Username (Accepts Username's friend request)\n/friend deny Username (Denies Username's friend request)\n/friend list (Shows your whole friend list and extra info)":
      [
        "/friend add Username (Envía a Username una solicitud de amistad)\n/friend remove Username (Elimina a Username de tus amigos)\n/friend accept Username (Acepta la solicitud de amistad de Username)\n/friend deny Username (Rechaza la solicitud de amistad de Username)\n/friend list (Muestra toda tu lista de amigos y datos adicionales)",
        "/friend add Username (Envoie une demande d'ami à Username)\n/friend remove Username (Retire Username de vos amis)\n/friend accept Username (Accepte la demande d'ami de Username)\n/friend deny Username (Refuse la demande d'ami de Username)\n/friend list (Affiche toute votre liste d'amis et des informations supplémentaires)"
      ],
    '/p Message (Like "/party chat", it sends a message in your party chat only to see but it does not toggle it.)': [
      '/p Message (Como "/party chat", envía un mensaje a tu chat de grupo solo para verlo, pero no lo activa.)',
      '/p Message (Comme "/party chat", envoie un message dans votre chat de groupe uniquement pour le voir, mais ne l\'active pas.)'
    ],
    "/party chat (Toggles your chat into party chat. Run the command again to turn it off.)\n/party help (Shows party commands)\n/party info (Shows info of the party you are currently in)\n/party leave (Leaves the party you are currently in)\n/party list (Shows current online parties)\n/party invite Username (Invites Username to your party)":
      [
        "/party chat (Activa el chat de grupo. Ejecuta el comando de nuevo para desactivarlo.)\n/party help (Muestra los comandos de grupo)\n/party info (Muestra información del grupo en el que estás)\n/party leave (Abandona el grupo actual)\n/party list (Muestra los grupos conectados actualmente)\n/party invite Username (Invita a Username a tu grupo)",
        "/party chat (Active le chat de groupe. Exécutez à nouveau la commande pour le désactiver.)\n/party help (Affiche les commandes de groupe)\n/party info (Affiche les informations de votre groupe actuel)\n/party leave (Quitte votre groupe actuel)\n/party list (Affiche les groupes actuellement en ligne)\n/party invite Username (Invite Username dans votre groupe)"
      ],
    "/pay Username 10 (Pays Username 10 Col)": [
      "/pay Username 10 (Paga 10 Col a Username)",
      "/pay Username 10 (Paie 10 Col à Username)"
    ],
    "/r Message (Replies to the private message you may have just gotten or to someone who just replied to your private message)":
      [
        "/r Message (Responde al mensaje privado que acabas de recibir o a quien acaba de responder a tu mensaje privado)",
        "/r Message (Répond au message privé que vous venez de recevoir ou à la personne qui vient de répondre à votre message privé)"
      ],
    "/trade Username (Sends Username a trade request)": [
      "/trade Username (Envía a Username una solicitud de intercambio)",
      "/trade Username (Envoie une demande d'échange à Username)"
    ],
    "/w Username Message (Party or not, it sends a private message to Username)": [
      "/w Username Message (Tanto si estás en grupo como si no, envía un mensaje privado a Username)",
      "/w Username Message (Que vous soyez en groupe ou non, envoie un message privé à Username)"
    ],
    "/cosmetic (Lets you see all cosmetics in game and/or lets you enable/disable them)": [
      "/cosmetic (Te permite ver todos los cosméticos del juego y activarlos o desactivarlos)",
      "/cosmetic (Vous permet de voir tous les cosmétiques du jeu et de les activer ou de les désactiver)"
    ],
    "/queue restore (I dont want to explain what this cmd does)\n/queue status (Shows your current spot in your queue)\n/queue leave (Leaves your current lobby queue)\n/queue batch (Shows random info)":
      [
        "/queue restore (No quiero explicar qué hace este comando)\n/queue status (Muestra tu posición actual en la cola)\n/queue leave (Abandona la cola de la sala actual)\n/queue batch (Muestra información aleatoria)",
        "/queue restore (Je ne veux pas expliquer ce que fait cette commande)\n/queue status (Affiche votre position actuelle dans la file d'attente)\n/queue leave (Quitte la file d'attente de votre salon actuel)\n/queue batch (Affiche des informations aléatoires)"
      ],
    "/ah (Just opens the basic Auction House)\n/ah auction 5 (Price) 1 (Amount)\n/ah history (Lets you see your Auction House history)\n/ah history Username (Lets you see Username's Auction House history)\n/ah sell 5 (Price) 1 (Amount)\n/ah profile (Lets you see your Auction House profile)\n/ah profile Username (Lets you see Username's Auction House profile)\n/ah search seller Username (Lets you see all Username's current auctions/sells)\n/ah search Pumba (Shows matching listings where Pumba is the first word)\n/ah stash (If no-one buys your item in the time frame and it goes off sale, they go here)\n/ah top (Shows you the top people of the Auction House leaderboard)":
      [
        "/ah (Abre la casa de subastas básica)\n/ah auction 5 (Price) 1 (Amount)\n/ah history (Te permite ver tu historial de la casa de subastas)\n/ah history Username (Te permite ver el historial de la casa de subastas de Username)\n/ah sell 5 (Price) 1 (Amount)\n/ah profile (Te permite ver tu perfil de la casa de subastas)\n/ah profile Username (Te permite ver el perfil de la casa de subastas de Username)\n/ah search seller Username (Te permite ver todas las subastas y ventas actuales de Username)\n/ah search Pumba (Muestra los anuncios coincidentes en los que Pumba es la primera palabra)\n/ah stash (Si nadie compra tu objeto en el plazo previsto y deja de estar en venta, va aquí)\n/ah top (Muestra a las personas mejor situadas en la clasificación de la casa de subastas)",
        "/ah (Ouvre l'hôtel des ventes de base)\n/ah auction 5 (Price) 1 (Amount)\n/ah history (Vous permet de voir votre historique de l'hôtel des ventes)\n/ah history Username (Vous permet de voir l'historique de l'hôtel des ventes de Username)\n/ah sell 5 (Price) 1 (Amount)\n/ah profile (Vous permet de voir votre profil de l'hôtel des ventes)\n/ah profile Username (Vous permet de voir le profil de l'hôtel des ventes de Username)\n/ah search seller Username (Vous permet de voir toutes les ventes en cours de Username)\n/ah search Pumba (Affiche les annonces correspondantes où Pumba est le premier mot)\n/ah stash (Si personne n'achète votre objet dans le délai prévu et qu'il n'est plus en vente, il arrive ici)\n/ah top (Affiche les personnes les mieux classées de l'hôtel des ventes)"
      ],
    "/bal (This checks your col)\n/bal Username (This checks Username's col)": [
      "/bal (Consulta tus Col)\n/bal Username (Consulta los Col de Username)",
      "/bal (Consulte vos Col)\n/bal Username (Consulte les Col de Username)"
    ]
  };
  const languageIndex = language === "fr" ? 1 : 0;
  let source = String(value || "");
  /* A curated whole-string entry is authoritative: return it as written so the word-level pass
	   below cannot re-gloss or re-order already-translated prose. */
  if (Object.prototype.hasOwnProperty.call(commandPhrases, source)) {
    return commandPhrases[source][languageIndex];
  }
  Object.entries(commandPhrases)
    .sort(([left], [right]) => right.length - left.length)
    .forEach(([english, localized]) => {
      source = source.replace(
        new RegExp(english.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\\\$&"), "g"),
        localized[languageIndex]
      );
    });
  const commandWords = {
    Displays: ["Muestra", "Affiche"],
    information: ["información", "informations"],
    version: ["versión", "version"],
    Opens: ["Abre", "Ouvre"],
    Shows: ["Muestra", "Affiche"],
    commands: ["comandos", "commandes"],
    command: ["comando", "commande"],
    menu: ["menú", "menu"],
    settings: ["ajustes", "paramètres"],
    your: ["tu", "votre"],
    the: ["el", "le"],
    currently: ["actualmente", "actuellement"],
    appears: ["parece", "semble"],
    staff: ["personal", "personnel"],
    moderation: ["moderación", "modération"],
    players: ["jugadores", "joueurs"],
    player: ["jugador", "joueur"],
    systems: ["sistemas", "systèmes"],
    available: ["disponible", "disponible"],
    disabled: ["desactivado", "désactivé"],
    configuration: ["configuración", "configuration"],
    statistics: ["estadísticas", "statistiques"],
    server: ["servidor", "serveur"],
    game: ["juego", "jeu"],
    news: ["noticias", "actualités"],
    controls: ["controles", "contrôles"],
    returns: ["devuelve", "ramène"],
    hub: ["centro", "hub"],
    nothing: ["nada", "rien"],
    pops: ["aparece", "apparaît"],
    work: ["trabajo", "travail"],
    progress: ["progreso", "progression"]
  };
  return source
    .split(/(\([^()]*\))/g)
    .map((part, index) => {
      if (index % 2 === 0 && /^\s*\//.test(part)) return part;
      let translatedPart = part.startsWith("(") && part.endsWith(")") ? part.slice(1, -1) : part;
      Object.entries(commandWords).forEach(([english, localized]) => {
        translatedPart = translatedPart.replace(new RegExp(`\\b${english}\\b`, "g"), localized[languageIndex]);
      });
      translatedPart = window.SAOContentTranslations.translateEquivalentProse(translatedPart, language);
      return part.startsWith("(") && part.endsWith(")") ? `(${translatedPart})` : translatedPart;
    })
    .join("");
}

window.SAOContentTranslations.registerCommandEntry = function registerCommandEntry(entry, id) {
  ["usage", "example"].forEach((field) => {
    if (!entry[field]) return;
    const key = `command.${id}.${field}`;
    window.SAOContentTranslations.register(
      key,
      entry[field],
      translateCommandProse(entry[field], "es"),
      translateCommandProse(entry[field], "fr")
    );
  });
};

const characterBuildTermTranslations = {
  Foundation: ["Fundamento", "Fondation"],
  Ranger: ["Explorador", "Éclaireur"],
  Duelist: ["Duelista", "Duelliste"],
  Guardian: ["Guardián", "Gardien"],
  Arcanist: ["Arcanista", "Arcaniste"],
  "Martial Artist": ["Artista marcial", "Artiste martial"],
  Shaman: ["Chamán", "Chaman"],
  Spirit: ["Espíritu", "Esprit"],
  "Ranger's": ["Del explorador", "De l'éclaireur"],
  "Duelist's": ["Del duelista", "Du duelliste"],
  "Guardian's": ["Del guardián", "Du gardien"],
  "Arcanist's": ["Del arcanista", "De l'arcaniste"],
  "Monk's": ["Del monje", "Du moine"],
  "Spirit's": ["Del espíritu", "De l'esprit"],
  Eagle: ["Águila", "Aigle"],
  Hawkeye: ["Ojo de halcón", "Œil de faucon"],
  Eye: ["Ojo", "Œil"],
  Measured: ["Medido", "Mesuré"],
  Draw: ["Disparo", "Tir"],
  Swift: ["Rápido", "Rapide"],
  Step: ["Paso", "Pas"],
  Finish: ["Final", "Finale"],
  Trail: ["Rastro", "Piste"],
  Rations: ["Raciones", "Rations"],
  Quick: ["Rápido", "Rapide"],
  Release: ["Liberación", "Libération"],
  Marked: ["Marcado", "Marqué"],
  Shot: ["Disparo", "Tir"],
  Storm: ["Tormenta", "Tempête"],
  Volley: ["Descarga", "Volée"],
  Light: ["Ligero", "Léger"],
  Footwork: ["Juego de pies", "Jeu de jambes"],
  Silent: ["Silencioso", "Silencieux"],
  Edge: ["Filo", "Lame"],
  Vanish: ["Desaparición", "Disparition"],
  Execution: ["Ejecución", "Exécution"],
  Point: ["Punto", "Point"],
  "Fencer's": ["Del espadachín", "De l'escrimeur"],
  Rhythm: ["Ritmo", "Rythme"],
  Weak: ["Débil", "Faible"],
  Sudden: ["Repentino", "Soudain"],
  Strike: ["Golpe", "Frappe"],
  Perfect: ["Perfecta", "Parfaite"],
  Opening: ["Apertura", "Ouverture"],
  Iron: ["Hierro", "Fer"],
  Wall: ["Muro", "Mur"],
  Brace: ["Apoyo", "Appui"],
  Hold: ["Mantener", "Maintien"],
  Fast: ["Firme", "Ferme"],
  Bulwark: ["Baluarte", "Rempart"],
  Heavy: ["Pesado", "Lourd"],
  Fortified: ["Fortificado", "Fortifié"],
  Core: ["Núcleo", "Noyau"],
  Bash: ["Golpe", "Coup"],
  Last: ["Última", "Dernière"],
  Stand: ["Resistencia", "Résistance"],
  Arcane: ["Arcano", "Arcanique"],
  Thread: ["Hilo", "Fil"],
  Mana: ["Maná", "Mana"],
  Well: ["Pozo", "Puits"],
  Spell: ["Hechizo", "Sort"],
  Sunder: ["Ruptura", "Brisure"],
  Astral: ["Astral", "Astral"],
  Focus: ["Enfoque", "Concentration"],
  Flowing: ["Fluido", "Fluide"],
  Aether: ["Éter", "Éther"],
  Guard: ["Guardia", "Garde"],
  Starfall: ["Lluvia estelar", "Pluie d'étoiles"],
  Grand: ["Gran", "Grand"],
  Formula: ["Fórmula", "Formule"],
  Monk: ["Monje", "Moine"],
  Fist: ["Puño", "Poing"],
  Form: ["Forma", "Forme"],
  Rapid: ["Rápido", "Rapide"],
  Hands: ["Manos", "Mains"],
  Centered: ["Centrado", "Centré"],
  Breath: ["Aliento", "Souffle"],
  Counter: ["Contraataque", "Contre"],
  Limit: ["Límite", "Limite"],
  Break: ["Ruptura", "Brèche"],
  Mending: ["Sanación", "Soin"],
  Rite: ["Ritual", "Rite"],
  Link: ["Vínculo", "Lien"],
  Rooted: ["Arraigado", "Enraciné"],
  Renewal: ["Renovación", "Renouvellement"],
  Calm: ["Calmas", "Calmes"],
  Waters: ["Aguas", "Eaux"],
  Living: ["Viviente", "Vivant"],
  Grove: ["Arboleda", "Bosquet"],
  Kindred: ["Afines", "Proches"],
  Sanctuary: ["Santuario", "Sanctuaire"]
};

function translateCharacterBuildText(value, language) {
  let translated = String(value || "");
  const languageIndex = language === "fr" ? 1 : 0;
  Object.entries(characterBuildTermTranslations)
    .sort(([left], [right]) => right.length - left.length)
    .forEach(([english, localized]) => {
      translated = translated.replace(
        new RegExp(`\\b${english.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\\\$&")}\\b`, "g"),
        localized[languageIndex]
      );
    });
  return translated;
}

window.SAOContentTranslations.registerCharacterBuildNode = function registerCharacterBuildNode(node, classId, branch) {
  const baseKey = `characterBuild.skill.${node.id}`;
  window.SAOContentTranslations.register(
    baseKey + ".name",
    node.name,
    translateCharacterBuildText(node.name, "es"),
    translateCharacterBuildText(node.name, "fr")
  );
  window.SAOContentTranslations.register(
    baseKey + ".description",
    `Prototype {branch} node for {classId}.`,
    `Nodo de prototipo {branch} para {classId}.`,
    `Nœud prototype {branch} pour {classId}.`
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
		   re-substitutes the words it just produced ("Tablón de acacia" -> "Tablón de Acacia"). */
    const spanish = curated ? curated[0] : window.SAOContentTranslations.translateEquivalentProse(value, "es");
    const french = curated ? curated[1] : window.SAOContentTranslations.translateEquivalentProse(value, "fr");
    window.SAOContentTranslations.register(
      key,
      value,
      window.SAOContentTranslations.es[key] || spanish,
      window.SAOContentTranslations.fr[key] || french
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
    const label = window.SAOContentTranslations.translateEquivalentLabel(entry[field], 0);
    const frenchLabel = window.SAOContentTranslations.translateEquivalentLabel(entry[field], 1);
    window.SAOContentTranslations.register(
      `quest.${id}.${field}`,
      entry[field],
      curated?.[0] === entry[field] ? label : curated?.[0] || location?.[0] || npc?.[0] || label,
      curated?.[1] === entry[field] ? frenchLabel : curated?.[1] || location?.[1] || npc?.[1] || frenchLabel
    );
  });
  ["requirements", "bonusItems"].forEach((field) => {
    if (!entry[field]) return;
    const curated = curatedQuestFieldTranslations[entry[field]];
    window.SAOContentTranslations.register(
      `quest.${id}.${field}`,
      entry[field],
      window.SAOContentTranslations.es[`quest.${id}.${field}`] ||
        curated?.[0] ||
        window.SAOContentTranslations.translateKnownTerms(entry[field], "es"),
      window.SAOContentTranslations.fr[`quest.${id}.${field}`] ||
        curated?.[1] ||
        window.SAOContentTranslations.translateKnownTerms(entry[field], "fr")
    );
  });
};

const mapTypeTranslations = {
  NPC: ["PNJ", "PNJ"],
  Biome: ["Bioma", "Biome"],
  Quest: ["Misión", "Quête"],
  Boss: ["Jefe", "Boss"],
  Dungeon: ["Mazmorra", "Donjon"]
};
const mapTitleTranslations = {
  "Abandoned Castle": ["Castillo abandonado", "Château abandonné"],
  "Wavy Monster Bay": ["Bahía de monstruos ondulantes", "Baie des monstres ondoyants"],
  "Bandit Camps": ["Campamentos de bandidos", "Camps de bandits"],
  "Millennial Baobab": ["Baobab milenario", "Baobab millénaire"],
  Caverns: ["Cavernas", "Cavernes"],
  "Earan Forest": ["Bosque de Earan", "Forêt d'Earan"],
  "Earan Land": ["Tierra de Earan", "Terre d'Earan"],
  "Elessarh Mine": ["Mina de Elessarh", "Mine d'Elessarh"],
  "Entrance to the Labyrinth": ["Entrada al laberinto", "Entrée du labyrinthe"],
  Farm: ["Granja", "Ferme"],
  "Emerald Wings Forest": ["Bosque de alas esmeralda", "Forêt des ailes d'émeraude"],
  "The Facet of Reality": ["La faceta de la realidad", "La facette de la réalité"],
  "In Search of the Ngangas": ["En busca de los Ngangas", "À la recherche des Ngangas"],
  "Kitchen Help": ["Ayuda en cocina", "Aide en cuisine"],
  "It Stings but Feels Good": ["Pica, pero sienta bien", "Ça pique, mais ça fait du bien"],
  "Road to Urbus": ["Camino a Urbus", "Route d'Urbus"],
  "Talking With Yaa": ["Hablar con Yaa", "Parler avec Yaa"],
  "Hating the Green": ["Odio al verde", "Détester le vert"],
  "The Art of Hides": ["El arte de las pieles", "L'art des peaux"],
  "The Imprint of the Seas": ["La huella de los mares", "L'empreinte des mers"],
  "Step 2": ["Etapa 2", "Étape 2"],
  "The Purification Ritual": ["El ritual de purificación", "Le rituel de purification"],
  "The Tribute Before the Verdict": ["El tributo antes del veredicto", "Le tribut avant le verdict"],
  "The Cabin Base": ["La base de la cabaña", "La base de la cabane"],
  "The Cabin Walls": ["Las paredes de la cabaña", "Les murs de la cabane"],
  "My First Weapon": ["Mi primera arma", "Ma première arme"],
  "Cleaning Taran's Skies": ["Limpiar los cielos de Taran", "Nettoyer les cieux de Taran"],
  "No, It's Fashion": ["No, es moda", "Non, c'est la mode"],
  "Talk to the Strange Woman": ["Habla con la mujer extraña", "Parler à la femme étrange"],
  "Return to Urbus": ["Regreso a Urbus", "Retour à Urbus"],
  "A Good Little Meal": ["Una buena comida", "Un bon petit repas"],
  "A Player Must Prove Himself": ["Un jugador debe demostrar su valía", "Un joueur doit prouver sa valeur"],
  "A Bit of Everything": ["Un poco de todo", "Un peu de tout"],
  "Garden of Giants": ["Jardín de gigantes", "Jardin des géants"],
  "Taran Cave": ["Cueva de Taran", "Grotte de Taran"],
  "Guild Base": ["Base del gremio", "Base de la guilde"],
  "Ika Archipelago": ["Archipiélago de Ika", "Archipel d'Ika"],
  "King of the Cave": ["Rey de la cueva", "Roi de la caverne"],
  "Lake of the Bulls": ["Lago de los toros", "Lac des taureaux"],
  "Lair of Aepep": ["Guarida de Aepep", "Repaire d'Aepep"],
  "Leader of the Bandits": ["Líder de los bandidos", "Chef des bandits"],
  "Sablemor Veins": ["Vetas de Sablemor", "Veines de Sablemor"],
  "Local lumberjack": ["Leñador local", "Bûcheron local"],
  "Nganga Houses": ["Casas Nganga", "Maisons Nganga"],
  "Brazier Nest": ["Nido de braseros", "Nid des brasiers"],
  "Secret Oasis": ["Oasis secreto", "Oasis secret"],
  "Orc Camps": ["Campamentos de orcos", "Camps d'orques"],
  "Petals Valley": ["Valle de los pétalos", "Vallée des pétales"],
  "Rest of Ankyla": ["Descanso de Ankyla", "Repos d'Ankyla"],
  "Snow Citadel": ["Ciudadela de nieve", "Citadelle des neiges"],
  Swamp: ["Pantano", "Marais"],
  "The Dance of the Sleeping Treants": ["La danza de los treants dormidos", "La danse des tréants endormis"],
  "Terrialys Well": ["Pozo de Terrialys", "Puits de Terrialys"],
  "Taurus Tower": ["Torre de Taurus", "Tour de Taurus"],
  "Valley of Wolfs": ["Valle de los lobos", "Vallée des loups"],
  "Wolf Forest": ["Bosque de lobos", "Forêt des loups"],
  "Level 1 Weapon Buyer": ["Comprador de armas de nivel 1", "Acheteur d'armes de niveau 1"],
  "Level 5 Weapon Buyer": ["Comprador de armas de nivel 5", "Acheteur d'armes de niveau 5"],
  "Miner of the Corner": ["Minero de la Esquina", "Mineur du Coin"],
  "Manufacturer of the Key of Xal'Zirith": [
    "Fabricante de la llave de Xal'Zirith",
    "Fabricant de la clé de Xal'Zirith"
  ],
  "Manufacturer of the Key to the Fallen": ["Fabricante de la llave de los Caídos", "Fabricant de la clé des Déchus"],
  "Manufacturer of the Key to the Forest": ["Fabricante de la llave del Bosque", "Fabricant de la clé de la Forêt"],
  "Manufacturer of the Aragorn Necklace": ["Fabricante del collar de Aragorn", "Fabricant du collier d'Aragorn"],
  "Manufacturer of the Glutinous Ring": ["Fabricante del anillo glutinoso", "Fabricant de l'anneau glutineux"],
  "Manufacturer of the Ring of Leviathan": ["Fabricante del anillo de Leviatán", "Fabricant de l'anneau de Léviathan"],
  "Assistant to the Alchemist": ["Ayudante del alquimista", "Assistant de l'alchimiste"],
  "Manufacturer of the Crushed Harpy Ring": [
    "Fabricante del anillo de la arpía aplastada",
    "Fabricant de l'anneau de la harpie écrasée"
  ],
  "Manufacturer of the Ring of the Flaming Harpy": [
    "Fabricante del anillo de la arpía llameante",
    "Fabricant de l'anneau de la harpie flamboyante"
  ],
  "Manufacturer of the Ring of the Drowned Harpy": [
    "Fabricante del anillo de la arpía ahogada",
    "Fabricant de l'anneau de la harpie noyée"
  ],
  "Manufacturer of the Runic Necklace": ["Fabricante del collar rúnico", "Fabricant du collier runique"],
  "Manufacturer of the Fierce Talisman": ["Fabricante del talismán feroz", "Fabricant du talisman féroce"],
  "Dungeon: The Forgotten Tomb": ["Mazmorra: La Tumba Olvidada", "Donjon : Le Tombeau Oublié"],
  "The Relaxed Cat": ["El gato relajado", "Le chat détendu"],
  "The Dark Messenger's Bell Tower": ["El campanario del mensajero oscuro", "Le clocher du messager sombre"],
  "Furacas, Guardian of the Labyrinth": ["Furacas, guardián del Laberinto", "Furacas, gardien du Labyrinthe"],
  "Alpha of the Woods": ["Alfa de los bosques", "Alpha des bois"],
  "Dungeon Forgotten Tomb of the Necromancer": [
    "Mazmorra de la tumba olvidada del nigromante",
    "Donjon du tombeau oublié du nécromancien"
  ],
  /* --- merchant, smith and site markers whose titles are built from a base noun plus a modifier;
	   the curated full phrase keeps the Spanish/French word order natural --- */
  "Bee Armor Blacksmith": ["Herrero de armaduras de abeja", "Forgeron d'armures d'abeille"],
  "Bees Weapon Blacksmith": ["Herrero de armas de abejas", "Forgeron d'armes d'abeilles"],
  "Consumables Merchant": ["Mercader de consumibles", "Marchand de consommables"],
  "Country Loot Buyer": ["Comprador de botín rural", "Acheteur de butin rural"],
  "Crystal Peak Mine": ["Mina del Pico de Cristal", "Mine du Pic de Cristal"],
  "Deer Belt Manufacturer": ["Fabricante de cinturones de ciervo", "Fabricant de ceintures de cerf"],
  "Fallen Labyrinth Dungeon": ["Mazmorra del Laberinto Caído", "Donjon du Labyrinthe Déchu"],
  "Forest Loot Buyer": ["Comprador de botín del bosque", "Acheteur de butin de la forêt"],
  "Honeyed Loot Buyer": ["Comprador de botín meloso", "Acheteur de butin miellé"],
  "Labyrinth Armor Blacksmith": ["Herrero de armaduras del laberinto", "Forgeron d'armures du labyrinthe"],
  "Level 1 Tools Merchant": ["Mercader de herramientas de nivel 1", "Marchand d'outils de niveau 1"],
  "Magical & Icy Loot Buyer": ["Comprador de botín mágico y gélido", "Acheteur de butin magique et glacial"],
  "Manufacturer of Corrupt Mask": ["Fabricante de máscaras corruptas", "Fabricant de masques corrompus"],
  "Manufacturer of Wolf Gloves": ["Fabricante de guantes de lobo", "Fabricant de gants de loup"],
  "Muffet, Mother of Black Spiders": ["Muffet, madre de las arañas negras", "Muffet, mère des araignées noires"],
  "Nasgul Sub-Dungeon": ["Submazmorra de Nasgul", "Sous-donjon de Nasgul"],
  "Necromancer's Tomb": ["Tumba del nigromante", "Tombe du nécromancien"],
  "Necromancer's Tomb Dungeon": ["Mazmorra de la tumba del nigromante", "Donjon de la tombe du nécromancien"],
  "Necrotic Tool Blacksmith": ["Herrero de herramientas necróticas", "Forgeron d'outils nécrotiques"],
  "Occult Rings Merchant": ["Mercader de anillos ocultos", "Marchand d'anneaux occultes"],
  "Reinforced Tools Merchant": ["Mercader de herramientas reforzadas", "Marchand d'outils renforcés"],
  "Savanna Tool Merchant": ["Mercader de herramientas de la sabana", "Marchand d'outils de la savane"],
  "Skeletal Loot Buyer": ["Comprador de botín esquelético", "Acheteur de butin squelettique"],
  "Spider Loot Repreneur": ["Comprador de botín de araña", "Repreneur de butin d'araignée"],
  /* --- loot resellers, repreneurs and site markers whose canonical name is combined with an
	   English verb or connector ("Blacksmith of Copper & Iron Ingots"); the token pass otherwise
	   keeps "of"/"Ingots" and leaves the modifier in front of the head noun --- */
  "Bandit Loot Repreneur": ["Comprador de botín bandido", "Repreneur de butin bandit"],
  "Bandit Loot Reseller": ["Revendedor de botín bandido", "Revendeur de butin bandit"],
  "Blacksmith of Bauxite Ingots & Impure Onyx": [
    "Herrero de lingotes de bauxita y ónice impuro",
    "Forgeron de lingots de bauxite et d'onyx impur"
  ],
  "Blacksmith of Copper & Iron Ingots": [
    "Herrero de lingotes de cobre y hierro",
    "Forgeron de lingots de cuivre et de fer"
  ],
  "Blacksmith of Necromancer Armor": ["Herrero de armaduras de nigromante", "Forgeron d'armures de nécromancien"],
  "Black Market": ["Mercado negro", "Marché noir"],
  "Bracelet Blacksmith": ["Herrero de brazaletes", "Forgeron de bracelets"],
  "Bracelet Merchant": ["Mercader de brazaletes", "Marchand de bracelets"],
  "Colossal Guardian": ["Guardián colosal", "Gardien colossal"],
  "Dungeon The Mysterious Islands": ["Mazmorra de las Islas Misteriosas", "Donjon des Îles Mystérieuses"],
  "Former Blacksmith": ["Antiguo herrero", "Ancien forgeron"],
  "Goblin Loot Repreneur": ["Comprador de botín goblin", "Repreneur de butin gobelin"],
  "Ice Bear": ["Oso de hielo", "Ours des glaces"],
  "Key Smith I": ["Forjador de llaves I", "Forgeron de clés I"],
  "Local Farmer": ["Granjero local", "Fermier local"],
  "Local Lumberjack": ["Leñador local", "Bûcheron local"],
  "Loot Buyer Sylnovar": ["Comprador de botín de Sylnovar", "Acheteur de butin de Sylnovar"],
  "Loot Buyer Sylvaer": ["Comprador de botín de Sylvaer", "Acheteur de butin de Sylvaer"],
  "Loot Buyer Treant": ["Comprador de botín de treant", "Acheteur de butin de tréant"],
  "Low Corruption Bracelet Blacksmith": [
    "Herrero de brazaletes de baja corrupción",
    "Forgeron de bracelets de faible corruption"
  ],
  "Manufacturer of Wild Gloves": ["Fabricante de guantes salvajes", "Fabricant de gants sauvages"],
  "Merchant of Occult Amulet": ["Mercader de amuletos ocultos", "Marchand d'amulettes occultes"],
  "Mist Canyon": ["Cañón de niebla", "Canyon de brume"],
  "Mist Refuge": ["Refugio de niebla", "Refuge de brume"],
  "Necrotic Loot Repreneur": ["Comprador de botín necrótico", "Repreneur de butin nécrotique"],
  "Occult Runes Merchant": ["Mercader de runas ocultas", "Marchand de runes occultes"],
  "Orc Loot Repreneur": ["Comprador de botín orco", "Repreneur de butin orque"],
  "Sanctuary Guardian": ["Guardián del santuario", "Gardien du sanctuaire"],
  "Sanctuary Loot Repreneur": ["Comprador de botín del santuario", "Repreneur de butin du sanctuaire"],
  "Scrap Accessories Blacksmith": ["Herrero de accesorios de chatarra", "Forgeron d'accessoires de ferraille"],
  "Sylnovar Accessories Blacksmith": ["Herrero de accesorios de Sylnovar", "Forgeron d'accessoires de Sylnovar"],
  "Tolbana Crystal": ["Cristal de Tolbana", "Cristal de Tolbana"],
  /* --- remaining smith, merchant and ring-seller markers whose title keeps the English
	   modifier in front of the role noun ("Glove Merchant" -> "Guante Mercader") --- */
  "Amethyst Armor Blacksmith": ["Herrero de armaduras de amatista", "Forgeron d'armures d'améthyste"],
  "Amulet Blacksmith": ["Herrero de amuletos", "Forgeron d'amulettes"],
  "Amulet Merchant": ["Mercader de amuletos", "Marchand d'amulettes"],
  "Ancient Wood Armor Blacksmith": ["Herrero de armaduras de madera ancestral", "Forgeron d'armures de bois ancien"],
  "Artifact Merchant": ["Mercader de artefactos", "Marchand d'artefacts"],
  "Bauxite Accessories Blacksmith": ["Herrero de accesorios de bauxita", "Forgeron d'accessoires de bauxite"],
  "Bull & Bear Accessories Blacksmith": [
    "Herrero de accesorios de toro y oso",
    "Forgeron d'accessoires de taureau et d'ours"
  ],
  "Bull & Bear Loot Buyer": ["Comprador de botín de toro y oso", "Acheteur de butin de taureau et d'ours"],
  "Glove Blacksmith": ["Herrero de guantes", "Forgeron de gants"],
  "Glove Merchant": ["Mercader de guantes", "Marchand de gants"],
  "Harpies Loot Buyer": ["Comprador de botín de arpías", "Acheteur de butin de harpies"],
  "Ice Bracelet Manufacturer": ["Fabricante de brazaletes de hielo", "Fabricant de bracelets de glace"],
  "Impure Onyx Accessories Blacksmith": [
    "Herrero de accesorios de ónice impuro",
    "Forgeron d'accessoires d'onyx impur"
  ],
  "Marine Loot Buyer": ["Comprador de botín marino", "Acheteur de butin marin"],
  "Merchant Guild": ["Gremio de mercaderes", "Guilde des marchands"],
  "Necrotic Weaponsmith": ["Herrero de armas necrótico", "Forgeron d'armes nécrotiques"],
  "Occult Amulet Merchant": ["Mercader de amuletos ocultos", "Marchand d'amulettes occultes"],
  "Occult Bracelet Merchant": ["Mercader de brazaletes ocultos", "Marchand de bracelets occultes"],
  "Occult Gloves Merchant": ["Mercader de guantes ocultos", "Marchand de gants occultes"],
  "Occult Merchant": ["Mercader oculto", "Marchand occulte"],
  "Occult Ringman": ["Vendedor de anillos ocultos", "Vendeur de bagues occultes"],
  "Pure Onyx Accessories Blacksmith": ["Herrero de accesorios de ónice puro", "Forgeron d'accessoires d'onyx pur"],
  "Pure Onyx Ingot Blacksmith": ["Herrero de lingotes de ónice puro", "Forgeron de lingots d'onyx pur"],
  "Purification Alchemist": ["Alquimista de purificación", "Alchimiste de purification"],
  "Ring Blacksmith": ["Herrero de anillos", "Forgeron d'anneaux"],
  "Skeleton Skull Manufacturer": ["Fabricante de cráneos de esqueleto", "Fabricant de crânes de squelette"],
  "Tolbana Armor Blacksmith": ["Herrero de armaduras de Tolbana", "Forgeron d'armures de Tolbana"],
  "Tribe Belt Blacksmith": ["Herrero de cinturones de la tribu", "Forgeron de ceintures de la tribu"]
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
    const manualTitleSpanish =
      field === "title" ? window.SAOContentTranslations.translateEquivalentLabel(marker[field], 0) : marker[field];
    const manualTitleFrench =
      field === "title" ? window.SAOContentTranslations.translateEquivalentLabel(marker[field], 1) : marker[field];
    const spanish =
      manualTitleSpanish !== marker[field]
        ? manualTitleSpanish
        : window.SAOContentTranslations.es[key] ||
          curated?.[0] ||
          typeTranslation?.[0] ||
          titleTranslation?.[0] ||
          (field === "description"
            ? window.SAOContentTranslations.translateEquivalentProse(marker[field], "es")
            : field === "title"
              ? window.SAOContentTranslations.translateEquivalentLabel(translateEquipmentTermValue(marker[field], 0), 0)
              : window.SAOContentTranslations.translateEquivalentLabel(marker[field], 0));
    const french =
      manualTitleFrench !== marker[field]
        ? manualTitleFrench
        : window.SAOContentTranslations.fr[key] ||
          curated?.[1] ||
          typeTranslation?.[1] ||
          titleTranslation?.[1] ||
          (field === "description"
            ? window.SAOContentTranslations.translateEquivalentProse(marker[field], "fr")
            : field === "title"
              ? window.SAOContentTranslations.translateEquivalentLabel(translateEquipmentTermValue(marker[field], 1), 1)
              : window.SAOContentTranslations.translateEquivalentLabel(marker[field], 1));
    window.SAOContentTranslations.register(key, marker[field], spanish, french);
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
    window.SAOContentTranslations.es[key] || (curated && curated[0]) || title,
    window.SAOContentTranslations.fr[key] || (curated && curated[1]) || title
  );
};

const bestiaryGlossary = {
  "Sinister White Wolf": ["Lobo blanco siniestro", "Loup blanc sinistre"],
  "Sinister Black Wolf": ["Lobo negro siniestro", "Loup noir sinistre"],
  "Mini Treant": ["Treant minúsculo", "Tréant miniature"],
  "Treant Warrior": ["Guerrero treant", "Guerrier tréant"],
  "Sylvan Mage": ["Mago silvano", "Mage sylvestre"],
  "Elite Treant": ["Treant de élite", "Tréant d'élite"],
  "Small Slime": ["Slime pequeño", "Petit slime"],
  "Slime Warrior": ["Guerrero slime", "Guerrier slime"],
  "Healer Slime": ["Slime sanador", "Slime guérisseur"],
  "Mage Slime": ["Slime mago", "Slime mage"],
  "Skeleton Swordsman": ["Espadachín esqueleto", "Épéiste squelette"],
  "Skeleton Warrior": ["Guerrero esqueleto", "Guerrier squelette"],
  "Skeleton Halberdier": ["Alabardero esqueleto", "Hallebardier squelette"],
  "Skeleton Archer": ["Arquero esqueleto", "Archer squelette"],
  "Shark Fish": ["Pez tiburón", "Poisson-requin"],
  "Forest Spider": ["Araña del bosque", "Araignée forestière"],
  "Ice Spiritist": ["Espiritista de hielo", "Spiritualiste de glace"],
  "Ice Golem": ["Gólem de hielo", "Golem de glace"],
  Deer: ["Ciervo", "Cerf"],
  Nephentes: ["Néphentes", "Néphentès"],
  "Bandit Archer": ["Arquero bandido", "Archer bandit"],
  "Bandit Assassin": ["Asesino bandido", "Assassin bandit"],
  "Sturdy Bandit": ["Bandido robusto", "Bandit robuste"],
  "Corrupted Boar": ["Jabalí corrupto", "Sanglier corrompu"],
  "Corrupted Pumba": ["Pumba corrupto", "Pumba corrompu"],
  "Small Kobold": ["Kobold pequeño", "Petit kobold"],
  "The Mischievous Archer": ["El arquero travieso", "L'archer malicieux"],
  "Kobold Warrior": ["Guerrero kobold", "Guerrier kobold"],
  "Kobold Lancer": ["Lancero kobold", "Lancier kobold"],
  "Kobold Sorcerer": ["Hechicero kobold", "Sorcier kobold"],
  "Kobold Sentinel (Minion)": ["Centinela kobold (esbirro)", "Sentinelle kobold (sbire)"],
  "Treant of the Forest": ["Treant del bosque", "Tréant de la forêt"],
  "Forest-Bane Treant": ["Treant azote del bosque", "Tréant fléau de la forêt"],
  "Devouring Plant": ["Planta devoradora", "Plante dévorante"],
  "Forest Brute": ["Bruto del bosque", "Brute forestier"],
  "Fallen Soldier": ["Soldado caído", "Soldat déchu"],
  "Fallen Warrior": ["Guerrero caído", "Guerrier déchu"],
  "Hunting Spider": ["Araña cazadora", "Araignée chasseuse"],
  "Venomous Spider": ["Araña venenosa", "Araignée venimeuse"],
  "Strangler Spider": ["Araña estranguladora", "Araignée étrangleuse"],
  "Fallen Guardian": ["Guardián caído", "Gardien déchu"],
  "Fallen Herald": ["Heraldo caído", "Héraut déchu"],
  "Fallen Reaper": ["Segador caído", "Faucheur déchu"],
  "Fire Archer Skeleton": ["Arquero esqueleto de fuego", "Archer squelette de feu"],
  "Fire Wizard Skeleton": ["Mago esqueleto de fuego", "Squelette mage de feu"],
  "Fire Tank Skeleton": ["Tanque esqueleto de fuego", "Squelette tank de feu"],
  "Fire Lancer Skeleton": ["Lancero esqueleto de fuego", "Lancier squelette de feu"],
  "Fire Skeleton": ["Esqueleto de fuego", "Squelette de feu"],
  "Fire Swordsman Skeleton": ["Espadachín esqueleto de fuego", "Épéiste squelette de feu"],
  "Skeleton Soul": ["Alma de esqueleto", "Âme squelette"],
  "Undead Brute": ["Bruto no muerto", "Brute mort-vivant"],
  "Undead Gargoyle": ["Gárgola no muerta", "Gargouille morte-vivante"],
  "Warrior Sand Skeleton": ["Esqueleto guerrero de arena", "Squelette guerrier des sables"],
  "Skeleton of the Archer Sands": ["Esqueleto de las arenas del arquero", "Squelette des sables de l'archer"],
  "Forest Bear": ["Oso del bosque", "Ours forestier"],
  "Mountain Wolf": ["Lobo montañés", "Loup des montagnes"],
  "Savanes Wolf": ["Lobo de las sabanas", "Loup des savanes"],
  Worker: ["Trabajador", "Ouvrier"],
  "Fire Harpy": ["Arpía de fuego", "Harpie de feu"],
  "Earthy Harpy": ["Arpía terrenal", "Harpie terrestre"],
  "Lightning Harpy": ["Arpía de relámpago", "Harpie de foudre"],
  "Dazzling Fish": ["Pez deslumbrante", "Poisson éblouissant"],
  "Sanctuary Skeleton Archer": ["Arquero esqueleto del santuario", "Archer squelette du sanctuaire"],
  "Sanctuary Skeleton Shaman": ["Chamán esqueleto del santuario", "Chaman squelette du sanctuaire"],
  "Sanctuary Skeleton Warrior": ["Guerrero esqueleto del santuario", "Guerrier squelette du sanctuaire"],
  "Guardian of the Sanctuary": ["Guardián del santuario", "Gardien du sanctuaire"],
  "Guardian Minion": ["Esbirro del guardián", "Sbire du gardien"],
  "Golem of Peter": ["Gólem de Peter", "Golem de Peter"],
  Guardian: ["Guardián", "Gardien"],
  Nymbréa: ["Nymbréa", "Nymbréa"],
  Albal: ["Albal", "Albal"],
  Dardroyal: ["Dardroyal", "Dardroyal"],
  Gorbel: ["Gorbel", "Gorbel"],
  Kazor: ["Kazor", "Kazor"],
  Vyrmos: ["Vyrmos", "Vyrmos"],
  Tornak: ["Tornak", "Tornak"],
  Nasgul: ["Nasgul", "Nasgul"],
  Pricilia: ["Pricilia", "Pricilia"],
  Yula: ["Yula", "Yula"],
  Jira: ["Jira", "Jira"],
  Kamilia: ["Kamilia", "Kamilia"],
  Ika: ["Ika", "Ika"],
  Taurus: ["Taurus", "Taurus"],
  "Monstrous Bull": ["Toro monstruoso", "Taureau monstrueux"]
};

const bestiaryItemGlossary = {
  "Wolf Fur": ["Piel de lobo", "Fourrure de loup"],
  "Wolf Fangs": ["Colmillos de lobo", "Crocs de loup"],
  "Boar Hide": ["Piel de jabalí", "Peau de sanglier"],
  "Boar Meat": ["Carne de jabalí", "Viande de sanglier"],
  "Corrupted Crystal": ["Cristal corrupto", "Cristal corrompu"],
  "Bone Dust": ["Polvo de hueso", "Poussière d'os"],
  "Skeleton Bone": ["Hueso de esqueleto", "Os de squelette"],
  "Souls of the Ruins": ["Almas de las ruinas", "Âmes des ruines"],
  "Souls of the Ruin": ["Almas de la ruina", "Âmes de la ruine"],
  "Skeletal Sword": ["Espada esquelética", "Épée squelettique"],
  "Archer's Scroll": ["Pergamino de arquero", "Parchemin d'archer"],
  "Swordsman's Scroll": ["Pergamino de espadachín", "Parchemin d'épéiste"],
  "Mage's Scroll": ["Pergamino de mago", "Parchemin de mage"],
  "Slime Jelly": ["Gelatina de slime", "Gelée de slime"],
  "Slime Core": ["Núcleo de slime", "Noyau de slime"],
  "Spider Silk": ["Seda de araña", "Soie d'araignée"],
  "Spider Cloth": ["Tela de araña", "Tissu d'araignée"],
  "Frost Dust": ["Polvo de escarcha", "Poussière de givre"],
  "Glacial Hardhide": ["Cuero duro glacial", "Cuir glacé"],
  "Glacial Magic Shard": ["Fragmento de magia glacial", "Éclat de magie glaciale"],
  "Mountain Deer Hide": ["Piel de ciervo montañés", "Peau de cerf des montagnes"],
  "Corrupted Spore": ["Espora corrupta", "Spore corrompue"],
  "Leaf Fragment": ["Fragmento de hoja", "Fragment de feuille"],
  "Worn Leather": ["Cuero gastado", "Cuir usé"],
  "Small Pouch": ["Bolsa pequeña", "Petite bourse"],
  "Bandit Crossbow": ["Ballesta de bandido", "Arbalète de bandit"],
  "Bandit Dagger": ["Daga de bandido", "Dague de bandit"],
  "Reinforced Skeleton Bone": ["Hueso de esqueleto reforzado", "Os de squelette renforcé"],
  "Cursed Cloth": ["Tela maldita", "Tissu maudit"],
  "Magic Staff of the Ruins": ["Bastón mágico de las ruinas", "Bâton magique des ruines"],
  "Magic Staff of the Revenants": ["Bastón mágico de los aparecidos", "Bâton magique des revenants"],
  "Enchanted Metal Piece": ["Pieza de metal encantado", "Morceau de métal enchanté"],
  "Metal Soul Piece": ["Pieza de alma metálica", "Morceau d'âme métallique"],
  "Putrefied Heart": ["Corazón putrefacto", "Cœur putréfié"],
  "Cursed Skeleton Mage Staff": ["Bastón de mago esqueleto maldito", "Bâton de mage squelette maudit"],
  "Cursed Skeleton Shaman Staff": ["Bastón de chamán esqueleto maldito", "Bâton de chaman squelette maudit"],
  "Fallen Artifact": ["Artefacto caído", "Artefact déchu"],
  "Warden's Soul": ["Alma del guardián", "Âme du gardien"],
  "Herald's Soul": ["Alma del heraldo", "Âme du héraut"],
  "Reaper's Soul": ["Alma del segador", "Âme du faucheur"],
  "Reaper's Ring": ["Anillo del segador", "Anneau du faucheur"],
  "Forgotten Shield": ["Escudo olvidado", "Bouclier oublié"],
  "Royal Halberd": ["Alabarda real", "Hallebarde royale"],
  "Sentinel's Mace": ["Maza del centinela", "Masse de la sentinelle"],
  "Shark Shell": ["Caparazón de tiburón", "Carapace de requin"],
  "N/A": ["N/D", "N/D"],
  "No Drops": ["Sin botín", "Aucun butin"]
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

bestiaryGlossary["Nymbr├⌐a"] = ["Nymbréa", "Nymbréa"];
bestiaryGlossary["Winnie, Man's Best Friend"] = [
  "Winnie, el mejor amigo del hombre",
  "Winnie, le meilleur ami de l'homme"
];
Object.entries(bestiaryGlossary).forEach(([english, [spanish, french]]) => {
  const key = `bestiary.mob.${contentSlug(english)}`;
  window.SAOContentTranslations.register(key, english, spanish, french);
});

bestiaryItemGlossary["Gorbel Essence"] = ["Esencia de Gorbel", "Essence de Gorbel"];

Object.entries(bestiaryItemGlossary).forEach(([english, [spanish, french]]) => {
  const key = `bestiary.item.${contentSlug(english)}`;
  window.SAOContentTranslations.register(key, english, spanish, french);
});

const mapGlossary = {
  "swamp-putride": {
    title: ["Swamp Putride", "Pantano Putride", "Marais Putride"],
    description: [
      "A dense and hostile marsh, where mist poisons the air and masks dangers. Few emerge unscathed...",
      "Un pantano denso y hostil, donde la niebla envenena el aire y oculta los peligros. Pocos salen ilesos...",
      "Un marais dense et hostile, où la brume empoisonne l'air et masque les dangers. Peu en sortent indemnes..."
    ]
  },
  "town-of-beginnings": {
    title: ["Town of Beginnings", "Ciudad de los Comienzos", "Ville des Commencements"]
  },
  "east-mines": {
    title: ["East Mines", "Minas del Este", "Mines de l'Est"],
    description: [
      "East Mines — Coordinates X: 2397 Z: 3498. Gather Coal, Copper, and Iron.",
      "Minas del Este — Coordenadas X: 2397 Z: 3498. Reúne carbón, cobre y hierro.",
      "Mines de l'Est — Coordonnées X : 2397 Z : 3498. Récupérez du charbon, du cuivre et du fer."
    ]
  },
  "west-mines": {
    title: ["West Mines", "Minas del Oeste", "Mines de l'Ouest"],
    description: [
      "West Mines — Coordinates X: 984 Z: 3479. Gather Coal, Copper, and Iron.",
      "Minas del Oeste — Coordenadas X: 984 Z: 3479. Reúne carbón, cobre y hierro.",
      "Mines de l'Ouest — Coordonnées X : 984 Z : 3479. Récupérez du charbon, du cuivre et du fer."
    ]
  },
  "oak-forest": {
    title: ["Oak Forest", "Bosque de Robles", "Forêt de chênes"],
    description: [
      "Oak Forest — Coordinates X: 2457 Z: 4308. Gather Oak Wood.",
      "Bosque de Robles — Coordenadas X: 2457 Z: 4308. Reúne madera de roble.",
      "Forêt de chênes — Coordonnées X : 2457 Z : 4308. Récupérez du bois de chêne."
    ]
  },
  "birch-forest": {
    title: ["Birch Forest", "Bosque de Abedules", "Forêt de bouleaux"]
  }
};

Object.entries(mapGlossary).forEach(([id, fields]) => {
  Object.entries(fields).forEach(([field, [english, spanish, french]]) => {
    const key = `map.${id}.${field}`;
    window.SAOContentTranslations.register(key, english, spanish, french);
  });
});

const additionalBestiaryGlossary = {
  "Colossal Guardian": ["Guardián colosal", "Gardien colossal"],
  "Ice Bear": ["Oso de hielo", "Ours des glaces"],
  "Illfang the Kobold Lord": ["Illfang, señor de los kobolds", "Illfang, seigneur des kobolds"],
  "Skeleton Sorcerer": ["Hechicero esqueleto", "Sorcier squelette"],
  "Skeleton Tank": ["Tanque esqueleto", "Tank squelette"],
  Bearclaw: ["Garra de oso", "Griffe d'ours"],
  Dart: ["Dardo", "Fléchette"],
  "Torn Clothing": ["Ropa rasgada", "Vêtements déchirés"],
  "Magic Mycelium": ["Micelio mágico", "Mycélium magique"],
  "Sylve shoot": ["Brote de Sylve", "Pousse de Sylve"],
  "Wolf Fangs": ["Colmillos de lobo", "Crocs de loup"],
  "Magic Wook Shard": ["Fragmento de madera mágica", "Éclat de bois magique"],
  "Oak Log": ["Tronco de roble", "Bûche de chêne"],
  "Boar Skin": ["Piel de jabalí", "Peau de sanglier"],
  "Titan Bark": ["Corteza de titán", "Écorce de titan"],
  "Slime Core": ["Núcleo de slime", "Noyau de slime"],
  "Bone Dust": ["Polvo de hueso", "Poussière d'os"],
  Iron: ["Hierro", "Fer"],
  Copper: ["Cobre", "Cuivre"],
  Coal: ["Carbón", "Charbon"],
  "Sylvan Sprout": ["Brote silvano", "Pousse sylvestre"],
  "Magic Wood Shard": ["Fragmento de madera mágica", "Éclat de bois magique"],
  "Small Pouch": ["Bolsa pequeña", "Petite bourse"],
  "Worn Leather": ["Cuero gastado", "Cuir usé"],
  "Dazzling Fish": ["Pez deslumbrante", "Poisson éblouissant"],
  "Guardian of the Sanctuary": ["Guardián del santuario", "Gardien du sanctuaire"],
  "Magnus, Colossus of the Veins": ["Magnus, coloso de las venas", "Magnus, colosse des veines"],
  "Melisara, Ruler of the Hive": ["Melisara, soberana de la colmena", "Melisara, souveraine de la ruche"],
  "Morverth the Soul Flayer": ["Morverth, el desgarrador de almas", "Morverth, le dévoreur d'âmes"],
  "Narax the Cursed Skeleton": ["Narax, el esqueleto maldito", "Narax, le squelette maudit"],
  "Ornstein, Fallen Devastator": ["Ornstein, devastador caído", "Ornstein, dévastateur déchu"],
  "Smough, Fallen Devastator": ["Smough, devastador caído", "Smough, dévastateur déchu"],
  "Rugiboeuf, The Guardian": ["Rugiboeuf, el guardián", "Rugiboeuf, le gardien"],
  "Velindra Weaver": ["Tejedora Velindra", "Tisseuse Velindra"],
  Tornak: ["Tornak", "Tornak"],
  Vyrmos: ["Vyrmos", "Vyrmos"],
  Dardroyal: ["Dardroyal", "Dardroyal"],
  Worker: ["Trabajador", "Ouvrier"],
  "Earthy Harpy": ["Arpía terrenal", "Harpie terrestre"],
  "Lightning Harpy": ["Arpía de relámpago", "Harpie de foudre"],
  "Golem of Peter": ["Gólem de Peter", "Golem de Peter"],
  "Guardian Minion": ["Esbirro del guardián", "Sbire du gardien"],
  "Skeleton Soul": ["Alma de esqueleto", "Âme squelette"],
  "Undead Gargoyle": ["Gárgola no muerta", "Gargouille morte-vivante"],
  "Thick Skin": ["Piel gruesa", "Peau épaisse"],
  "Bear Skin": ["Piel de oso", "Peau d'ours"],
  "Bear Fat": ["Grasa de oso", "Graisse d'ours"],
  "Bear Soul Fragment": ["Fragmento de alma de oso", "Fragment d'âme d'ours"],
  "Honey Residue": ["Residuo de miel", "Résidu de miel"],
  Honey: ["Miel", "Miel"],
  "Bee Shell": ["Caparazón de abeja", "Carapace d'abeille"],
  "Water Harpy Egg": ["Huevo de arpía de agua", "Œuf de harpie aquatique"],
  "Azure Feather": ["Pluma azur", "Plume azur"],
  "Scarlet Feather": ["Pluma escarlata", "Plume écarlate"],
  "Flaming Feather": ["Pluma llameante", "Plume flamboyante"],
  "Rare Flaming Feather": ["Pluma llameante rara", "Plume flamboyante rare"],
  "Earthy Feather": ["Pluma terrenal", "Plume terrestre"],
  "Wavy Feather": ["Pluma ondulada", "Plume ondulée"],
  "Dazzling Scale": ["Escama deslumbrante", "Écaille éblouissante"],
  "Ika Shell": ["Caparazón de Ika", "Carapace d'Ika"],
  "Ancestral Root": ["Raíz ancestral", "Racine ancestrale"],
  "Wood Heart": ["Corazón de madera", "Cœur de bois"],
  "Sylvan Mage Staff": ["Bastón de mago silvano", "Bâton de mage sylvestre"],
  "Sylvan Shaman Staff": ["Bastón de chamán silvano", "Bâton de chaman sylvestre"],
  "Sylvan Shield": ["Escudo silvano", "Bouclier sylvestre"],
  "Sylvan Bark": ["Corteza silvana", "Écorce sylvestre"],
  "Sylvan Bow": ["Arco silvano", "Arc sylvestre"],
  "Sylvan Bowstring": ["Cuerda de arco silvana", "Corde d'arc sylvestre"],
  "Enchanted Twig": ["Ramita encantada", "Brindille enchantée"],
  "Spectral Cloth": ["Tela espectral", "Tissu spectral"],
  "Spectral Fabric": ["Tela espectral", "Tissu spectral"],
  "Spectral Chain": ["Cadena espectral", "Chaîne spectrale"],
  "Glacial Hardhide": ["Cuero duro glacial", "Cuir glacé"],
  "Glacial Magic Shard": ["Fragmento de magia glacial", "Éclat de magie glaciale"],
  "Corrupted Spore": ["Espora corrupta", "Spore corrompue"],
  "Leaf Fragment": ["Fragmento de hoja", "Fragment de feuille"],
  "Piece of Scrap Metal": ["Pieza de chatarra", "Morceau de ferraille"],
  "Marrow Powder": ["Polvo de médula", "Poudre de moelle"],
  "Dark Bone": ["Hueso oscuro", "Os sombre"],
  "Black Bone Stone": ["Piedra de hueso negro", "Pierre d'os noir"],
  "Black Powder": ["Pólvora negra", "Poudre noire"],
  "Black Shield": ["Escudo negro", "Bouclier noir"],
  "Guardian Necklace": ["Collar del guardián", "Collier du gardien"],
  "Guardian Rune": ["Runa del guardián", "Rune du gardien"],
  "Rune of the Colossus": ["Runa del coloso", "Rune du colosse"],
  "Runic Stone": ["Piedra rúnica", "Pierre runique"],
  "Asterios Bracelet": ["Brazalete de Asterios", "Bracelet d'Asterios"],
  "Albal's Fangs": ["Colmillos de Albal", "Crocs d'Albal"],
  "Albal Fangs": ["Colmillos de Albal", "Crocs d'Albal"],
  "Pumba's Ring": ["Anillo de Pumba", "Anneau de Pumba"],
  "Narax's Ring": ["Anillo de Narax", "Anneau de Narax"],
  "Rugiboeuf Horn": ["Cuerno de Rugiboeuf", "Corne de Rugiboeuf"],
  "Warden's Soul": ["Alma del guardián", "Âme du gardien"],
  "Herald's Soul": ["Alma del heraldo", "Âme du héraut"],
  "Reaper's Soul": ["Alma del segador", "Âme du faucheur"],
  "Reaper's Ring": ["Anillo del segador", "Anneau du faucheur"],
  "Royal Halberd": ["Alabarda real", "Hallebarde royale"],
  "Forgotten Shield": ["Escudo olvidado", "Bouclier oublié"],
  "Frost Dust": ["Polvo de escarcha", "Poussière de givre"],
  "Potion of the Witch": ["Poción de la bruja", "Potion de la sorcière"],
  "Necromancer Powder": ["Polvo de nigromante", "Poudre de nécromancien"],
  "2x Necromancer Powder": ["2x polvo de nigromante", "2x poudre de nécromancien"]
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

Object.entries(additionalBestiaryGlossary).forEach(([english, [spanish, french]]) => {
  const namespace = additionalBestiaryMobNames.has(english) ? "mob" : "item";
  const key = `bestiary.${namespace}.${contentSlug(english)}`;
  window.SAOContentTranslations.register(key, english, spanish, french);
});
