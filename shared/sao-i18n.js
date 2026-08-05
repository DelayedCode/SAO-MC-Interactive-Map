(function (global) {
  "use strict";

  const storage = global.SAOStorage || {
    getItem(key) {
      try {
        return global.localStorage.getItem(String(key || ""));
      } catch {
        return null;
      }
    },
    setItem(key, value) {
      try {
        global.localStorage.setItem(String(key || ""), String(value));
      } catch {
        // Ignore persistence failures.
      }
    },
    getJSON(key, fallbackValue) {
      const raw = this.getItem(key);
      if (raw === null) return fallbackValue;
      try {
        return JSON.parse(raw);
      } catch {
        return fallbackValue;
      }
    },
    setJSON(key, value) {
      this.setItem(key, JSON.stringify(value));
    }
  };

  const SETTINGS_STORAGE_KEY = "sao.global.settings";
  const DEFAULT_LANGUAGE = "en";
  const SUPPORTED_LANGUAGES = ["en", "es", "de", "fr"];
  const WALKTHROUGH_PROGRESS_KEYS = Object.freeze([
    "sao.walkthrough.index.completed",
    "sao.walkthrough.maps.completed",
    "sao.walkthrough.mainui.completed"
  ]);

  const translations = {
    en: {
      languageName: "English",
      ui: {
        settings: {
          buttonLabel: "Open settings",
          title: "Settings",
          subtitle: "Customize your global website preferences.",
          languageLabel: "Language",
          languageHint: "Applied to all pages.",
          closeLabel: "Close settings",
          walkthroughLabel: "Walkthrough",
          walkthroughHint: "Replay the guided tour for the current page.",
          restartWalkthrough: "Restart walkthrough"
        },
        nav: {
          maps: "Maps",
          bestiary: "Bestiary",
          equipment: "Equipment",
          quests: "Quests",
          patchnotes: "Patchnotes",
          commands: "Commands",
          miscinfo: "Misc. Info",
          menu: "Go back to Menu"
        },
        common: {
          loading: "Loading...",
          search: "Search"
        },
        walkthrough: {
          title: "Quick walkthrough",
          skip: "Skip",
          back: "Back",
          next: "Next",
          finish: "Finish",
          step: "Step {current} of {total}"
        }
      },
      page: {
        index: {
          title: "SAO MC - Module Hub",
          eyebrow: "Module Hub",
          discordButton: "Discord",
          discordButtonAria: "Open Discord shortcuts",
          heading: "Select SAO MC Gamemode",
          subtitle: "Choose which gamemode info you want to view.",
          disclaimerLabel: "Please Note:",
          disclaimerBody: "This is a personal project.\nThis website is primarily intended for personal and guild use. Information will continue to be added, updated, and improved for as long as there is new content to document.\nPlease keep in mind that this project was not originally designed to be a fully public resource, so some information may be incomplete, missing, or tailored toward my own use and my guild's needs.",
          selectorAria: "Gamemode selector",
          aincradTitle: "Aincrad",
          underworldTitle: "Fractured Underworld",
          ggoTitle: "GunGaleOnline",
          launchTag: "Launch",
          notReleasedTag: "Not released",
          aincradDesc: "Open the map hub to browse the dungeon guide, quests, bestiary, and more.",
          underworldDesc: "Open the Fractured Underworld map hub to start building and testing this module.",
          ggoDesc: "The GGO menu is not published yet, so no module is available to open.",
          interactiveMode: "Interactive mode",
          guildLabel: "Guild:",
          guildName: "Vanguard of War",
          guildAria: "Guild tribute",
          discordModalTitle: "Discord shortcuts",
          discordModalCloseAria: "Close Discord menu",
          discordModalBody: "Choose where you'd like to go next.",
          creatorDiscord: "Website Creator Discord",
          saoDiscord: "SAO MC Discord",
          supportDiscord: "SAO MC Support Discord",
          ggoToast: "GGO is not out yet! No info to display."
        },
        maps: {
          title: "SAO Interactive Map",
          floorLabel: "Floor:",
          undergroundLabel: "Underground:",
          searchPlaceholder: "Search markers...",
          clearFilters: "Clear Filters",
          mapAlt: "Map floor",
          undergroundAlt: "Underground overlay",
          resetView: "Reset View",
          defaultInfoTitle: "Select a marker",
          defaultInfoBody: "Choose a marker on the map to see details here.",
          chooseCategoryTitle: "Choose a category",
          chooseCategoryBody: "Turn on one or more categories in the sidebar to display markers for this floor.",
          noSearchTitle: "No search matches",
          noSearchBody: "No markers match your current search on this floor.",
          noMarkersTitle: "No markers available",
          noMarkersBody: "No markers are available for the currently selected categories on this floor.",
          noMobEntries: "No mob entries available yet for this zone.",
          mobType: "Type",
          mobAreaType: "Mob Area",
          availableMobs: "Available Mobs",
          floorText: "Floor",
          coordinates: "Coordinates",
          mobs: "Mobs",
          viewWaypointInfo: "View waypoint info",
          markVisited: "Mark as visited",
          visitedDefeated: "Defeated",
          visitedCompleted: "Completed",
          visitedVisited: "Visited",
          walkthrough: {
            step1Title: "Navigation",
            step1Body: "Use this top row to jump between Maps, Bestiary, Equipment, Quests, Commands, and the Menu.",
            step2Title: "Map Controls",
            step2Body: "Choose the floor, toggle underground mode, use search, and quickly reset filters from here.",
            step3Title: "Filters",
            step3Body: "Turn categories on to show markers. Active filters stay highlighted so you can see what is currently enabled.",
            step4Title: "Interactive Map",
            step4Body: "Drag to pan and scroll to zoom. Select a marker to open details and shortcuts in the info panel."
          },
          runtimeError: "The map could not be loaded right now. Refresh the page and try again.",
          runtimeTitle: "Map unavailable",
          coordinatesPlaceholder: "X: -- Z: --"
        },
        mainui: {
          towerDefenseNav: "Tower Defense",
          compendiumNav: "Compendium",
          compendiumToast: "Not enough information released yet to make a page!",
          title: "SAO Interactive Map",
          translationNotice: "Sorry, most of this page does not have translations yet. The developer of this page is a solo developer. They do not have enough time to collect data and translate everything. Translations may be added in the future, but it is unlikely.",
          islandLabel: "Island:",
          undergroundLabel: "Underground:",
          searchPlaceholder: "Search markers...",
          clearFilters: "Clear Filters",
          resetView: "Reset View",
          defaultInfoTitle: "Select a marker",
          defaultInfoBody: "Choose a marker on the map to see details here.",
          chooseCategoryTitle: "Choose a category",
          chooseCategoryBody: "Turn on one or more categories in the sidebar to display markers for this floor.",
          noSearchTitle: "No search matches",
          noSearchBody: "No markers match your current search on this floor.",
          noMarkersTitle: "No markers available",
          noMarkersBody: "No markers are available for the currently selected categories on this floor.",
          noImageYet: "No image yet",
          noMobEntries: "No mob entries available yet for this zone.",
          mapSuffix: "map",
          undergroundSuffix: "underground overlay",
          runtimeError: "The map could not be loaded right now. Refresh the page and try again.",
          runtimeTitle: "Map unavailable",
          coordinatesPlaceholder: "X: -- Z: --"
        },
        bestiary: {
          title: "SAO Bestiary",
          heading: "Bestiary",
          tablistAria: "Bestiary categories",
          searchLabel: "Search mobs",
          searchPlaceholder: "Search by name...",
          listTitleRegular: "Regular Mobs List",
          listTitleBoss: "Boss List",
          listTitleDungeonBoss: "Dungeon Boss List",
          listTitleDungeonMobs: "Dungeon Mobs List",
          statusShown: "{visible} of {total} mobs shown.",
          emptyCategory: "No entries yet for {category}.",
          drops: "Drops",
          aggressiveness: "Aggressiveness",
          aggressive: "Aggressive",
          neutral: "Neutral",
          passive: "Passive",
          xp: "XP",
          na: "N/A",
          translationNotice: "Sorry, most of this page does not have translations yet. The developer of this page is a solo developer. They do not have enough time to collect data and translate everything. Translations may be added in the future, but it is unlikely."
        },
        commands: {
          title: "SAO Commands",
          heading: "Commands",
          tablistAria: "Command categories",
          searchLabel: "Search commands",
          searchPlaceholder: "Search by command, usage, or example...",
          emptyState: "No commands match your current filters.",
          colCommand: "Command",
          colUsage: "Usage",
          colExample: "Example",
          statusShown: "{count} command{suffix} shown in {category}.",
          categories: {
            communication: "Communication",
            cosmetics: "Cosmetics and Appearance",
            dungeons: "Dungeons",
            economy: "Economy",
            gameplay: "Gameplay and Progression",
            information: "Information",
            media: "Media and Audio",
            navigation: "Navigation",
            useless: "Useless Commands"
          },
          translationNotice: "Sorry, most of this page does not have translations yet. The developer of this page is a solo developer. They do not have enough time to collect data and translate everything. Translations may be added in the future, but it is unlikely."
        },
        ecompendium: {
          title: "SAO Equipment Compendium",
          heading: "Equipment Compendium",
          searchLabel: "Search",
          searchPlaceholder: "Search equipment...",
          noEntriesFound: "No entries found.",
          statusShown: "Showing {visible} of {total} entries.",
          listTitles: {
            weapon: "Weapons",
            armor: "Armor",
            accessory: "Accessories",
            rune: "Runes",
            tool: "Tools",
            food: "Food",
            consumable: "Consumables",
            material: "Materials",
            quest_item: "Quest Items",
            resource: "Resources",
            dungeon: "Dungeons",
            currency: "Currency"
          },
          labels: {
            rarity: "Rarity",
            level: "Level",
            set: "Set",
            craftedAt: "Crafted At",
            description: "Description",
            statistics: "Statistics",
            source: "Source",
            resources: "Resources"
          },
          unknownItem: "Unknown Item",
          unknown: "Unknown",
          translationNotice: "Sorry, most of this page does not have translations yet. The developer of this page is a solo developer. They do not have enough time to collect data and translate everything. Translations may be added in the future, but it is unlikely."
        },
        quests: {
          title: "SAO Quests",
          heading: "Quests",
          logoAria: "Quests logo",
          searchLabel: "Search quests",
          searchPlaceholder: "Search by any column...",
          tableCols: {
            npcName: "NPC Name",
            city: "City",
            coordinates: "Cords",
            requirements: "Requirements / Resources",
            questName: "Quest Name",
            xpReward: "XP",
            colReward: "Col",
            bonusItems: "Bonus Items",
            completed: "Completed"
          },
          markCompleted: "Mark Completed",
          completed: "Completed",
          titleWithFloor: "Quests - {floor}",
          noQuestData: "No quest data has been added for {floor} yet.",
          noQuestMatchFloor: "No quest entries match your search on {floor}. {completed} completed.",
          shownStatus: "{visible} of {total} quest entries shown for {floor} || {completed} completed.",
          noQuestMatch: "No quest entries match your current search.",
          loadedStatus: "{count} quest entries loaded for {floor}.",
          translationNotice: "Sorry, most of this page does not have translations yet. The developer of this page is a solo developer. They do not have enough time to collect data and translate everything. Translations may be added in the future, but it is unlikely."
        },
        patchnotes: {
          title: "SAO Patchnotes",
          heading: "Patchnotes",
          searchLabel: "Search notes",
          searchPlaceholder: "Filter by version, item, or update",
          noMatches: "No patch notes match that filter.",
          noEntries: "No matching changelog entries found.",
          statusShowing: "Showing {count} patch note{suffix}.",
          translationNotice: "Sorry, most of this page does not have translations yet. The developer of this page is a solo developer. They do not have enough time to collect data and translate everything. Translations may be added in the future, but it is unlikely."
        },
        miscinfo: {
          title: "Misc. Info",
          heading: "Misc. Info",
          back: "Go back to Menu",
          playerLevels: "Player Levels",
          playerLevelsDetails: "Level 1 -> 2: 150 XP\nLevel 2 -> 3: 300 XP\nLevel 3 -> 4: 600 XP\nLevel 4 -> 5: 1,350 XP\nLevel 5 -> 6: 2,700 XP\nLevel 6 -> 7: 5,100 XP\nLevel 7 -> 8: 9,000 XP\nLevel 8 -> 9: 15,000 XP\nLevel 9 -> 10: 24,000 XP",
          translationNotice: "Sorry, most of this page does not have translations yet. The developer of this page is a solo developer. They do not have enough time to collect data and translate everything. Translations may be added in the future, but it is unlikely."
        },
        towerdefense: {
          title: "Fractured Underworld - Tower Defense",
          heading: "Fractured Underworld Tower Defense",
          back: "Go back",
          sectionsAria: "Tower Defense sections",
          chapterOverviewAria: "Tower Defense chapter overview",
          chapterListAria: "Tower Defense chapter list",
          chapterSelect: "Chapter Select",
          chapter: "Chapter {number}",
          shopSectionAria: "Tower Defense shop section",
          shopListAria: "Tower Defense shop list",
          shopTitle: "Tower Defense Shop",
          infoSheetTitle: "Tower Defense Info Sheet",
          closeInfoSheet: "Close info sheet",
          insufficientInfo: "Not enough information released yet to make a page!",
          rewardsHead: "Rewards",
          wavesHead: "Waves",
          arcHead: "Arc",
          levelProgression: "Level Progression",
          unlockWith: "Unlock with {item}",
          upgradeCost: "Upgrade Cost",
          translationNotice: "Sorry, most of this page does not have translations yet. The developer of this page is a solo developer. They do not have enough time to collect data and translate everything. Translations may be added in the future, but it is unlikely."
        }
      }
    },
    es: {
      languageName: "Espanol",
      ui: {
        settings: {
          buttonLabel: "Abrir configuracion",
          title: "Configuracion",
          subtitle: "Personaliza tus preferencias globales del sitio.",
          languageLabel: "Idioma",
          languageHint: "Se aplica a todas las paginas.",
          closeLabel: "Cerrar configuracion",
          walkthroughLabel: "Guía",
          walkthroughHint: "Vuelve a reproducir la guía del recorrido para la página actual.",
          restartWalkthrough: "Reiniciar guía"
        },
        nav: {
          maps: "Mapas",
          bestiary: "Bestiario",
          equipment: "Equipo",
          quests: "Misiones",
          patchnotes: "Notas",
          commands: "Comandos",
          miscinfo: "Info. Varia",
          menu: "Volver al Menu"
        },
        common: {
          loading: "Cargando...",
          search: "Buscar"
        }
      },
      page: {
        index: {
          title: "SAO MC - Centro de Modulos",
          eyebrow: "Centro de Modulos",
          discordButton: "Discord",
          discordButtonAria: "Abrir accesos de Discord",
          heading: "Selecciona modo de juego SAO MC",
          subtitle: "Elige que informacion del modo quieres ver.",
          disclaimerLabel: "Aviso:",
          disclaimerBody: "Este es un proyecto personal.\nEste sitio esta pensado principalmente para uso personal y del gremio. La informacion se seguira actualizando y mejorando mientras haya contenido nuevo por documentar.\nTen en cuenta que este proyecto no fue pensado originalmente como recurso publico completo, por lo que parte de la informacion puede estar incompleta o adaptada a mis necesidades y las de mi gremio.",
          selectorAria: "Selector de modos",
          aincradTitle: "Aincrad",
          underworldTitle: "Fractured Underworld",
          ggoTitle: "GunGaleOnline",
          launchTag: "Abrir",
          notReleasedTag: "No disponible",
          aincradDesc: "Abre el mapa para explorar guia de mazmorras, misiones, bestiario y mas.",
          underworldDesc: "Abre el mapa de Fractured Underworld para empezar a construir y probar este modulo.",
          ggoDesc: "El menu de GGO aun no se publica, por eso no hay modulo disponible.",
          interactiveMode: "Modo interactivo",
          guildLabel: "Gremio:",
          guildName: "Vanguard of War",
          guildAria: "Tributo al gremio",
          discordModalTitle: "Accesos directos de Discord",
          discordModalCloseAria: "Cerrar menu de Discord",
          discordModalBody: "Elige a donde quieres ir.",
          creatorDiscord: "Discord del creador",
          saoDiscord: "Discord de SAO MC",
          supportDiscord: "Discord de soporte SAO MC",
          ggoToast: "GGO aun no esta disponible. No hay informacion para mostrar."
        },
        patchnotes: {
          title: "Notas de parche y registro de cambios de SAO MC",
          heading: "Notas de parche",
          searchLabel: "Buscar notas",
          searchPlaceholder: "Filtrar por versión, elemento o actualización",
          noMatches: "No hay notas de parche que coincidan con ese filtro.",
          noEntries: "No se encontraron entradas del registro de cambios.",
          statusShowing: "Mostrando {count} nota de parche{suffix}.",
          translationNotice: "La mayor parte del contenido de esta página todavía no está traducida porque el sitio lo mantiene una sola persona con poco tiempo."
        },
        miscinfo: {
          title: "Info. Varia",
          heading: "Info. Varia",
          back: "Volver al Menu",
          playerLevels: "Niveles del jugador",
          playerLevelsDetails: "Nivel 1 -> 2: 150 XP\nNivel 2 -> 3: 300 XP\nNivel 3 -> 4: 600 XP\nNivel 4 -> 5: 1,350 XP\nNivel 5 -> 6: 2,700 XP\nNivel 6 -> 7: 5,100 XP\nNivel 7 -> 8: 9,000 XP\nNivel 8 -> 9: 15,000 XP\nNivel 9 -> 10: 24,000 XP",
          translationNotice: "La mayor parte del contenido de esta página todavía no está traducida porque el sitio lo mantiene una sola persona con poco tiempo."
        }
      }
    },
    de: {
      languageName: "Deutsch",
      ui: {
        settings: {
          buttonLabel: "Einstellungen offnen",
          title: "Einstellungen",
          subtitle: "Globale Website-Einstellungen anpassen.",
          languageLabel: "Sprache",
          languageHint: "Gilt fur alle Seiten.",
          closeLabel: "Einstellungen schlie?en",
          walkthroughLabel: "Schritt-für-Schritt-Anleitung",
          walkthroughHint: "Die geführte Tour für die aktuelle Seite erneut starten.",
          restartWalkthrough: "Anleitung neu starten"
        },
        nav: {
          maps: "Karten",
          bestiary: "Bestiarium",
          equipment: "Ausrustung",
          quests: "Quests",
          patchnotes: "Patchnotes",
          commands: "Befehle",
          miscinfo: "Sonstige Infos",
          menu: "Zuruck zum Menu"
        },
        common: {
          loading: "Ladt...",
          search: "Suchen"
        }
      },
      page: {
        index: {
          title: "SAO MC - Modul Hub",
          eyebrow: "Modul Hub",
          discordButton: "Discord",
          discordButtonAria: "Discord-Verknupfungen offnen",
          heading: "SAO MC Spielmodus auswahlen",
          subtitle: "Wahle, welche Modus-Informationen du ansehen mochtest.",
          disclaimerLabel: "Hinweis:",
          disclaimerBody: "Dies ist ein personliches Projekt.\nDiese Website ist in erster Linie fur den personlichen und Gilden-Gebrauch gedacht. Informationen werden fortlaufend erganzt und verbessert, solange neue Inhalte verfugbar sind.\nBitte beachte, dass dieses Projekt ursprunglich nicht als vollstandige offentliche Ressource gedacht war; daher konnen Informationen unvollstandig sein oder auf meine bzw. unsere Gildenbedurfnisse zugeschnitten sein.",
          selectorAria: "Spielmodus-Auswahl",
          aincradTitle: "Aincrad",
          underworldTitle: "Fractured Underworld",
          ggoTitle: "GunGaleOnline",
          launchTag: "Start",
          notReleasedTag: "Nicht veroffentlicht",
          aincradDesc: "Offne den Karten-Hub fur Dungeon-Guide, Quests, Bestiarium und mehr.",
          underworldDesc: "Offne den Fractured-Underworld-Karten-Hub zum Bauen und Testen dieses Moduls.",
          ggoDesc: "Das GGO-Menu ist noch nicht veroffentlicht, daher ist kein Modul verfugbar.",
          interactiveMode: "Interaktiver Modus",
          guildLabel: "Gilde:",
          guildName: "Vanguard of War",
          guildAria: "Gilden-Hommage",
          discordModalTitle: "Discord-Verknupfungen",
          discordModalCloseAria: "Discord-Menu schlie?en",
          discordModalBody: "Wahle, wohin du als Nächstes gehen mochtest.",
          creatorDiscord: "Creator Discord",
          saoDiscord: "SAO MC Discord",
          supportDiscord: "SAO MC Support Discord",
          ggoToast: "GGO ist noch nicht verfugbar. Keine Informationen anzeigbar."
        },
        patchnotes: {
          title: "SAO-Patchnotes und Changelog",
          heading: "Patchnotes",
          searchLabel: "Notizen suchen",
          searchPlaceholder: "Nach Version, Gegenstand oder Update filtern",
          noMatches: "Keine Patchnotes passen zu diesem Filter.",
          noEntries: "Keine passenden Changelog-Einträge gefunden.",
          statusShowing: "{count} Patchnote{suffix} wird angezeigt.",
          translationNotice: "Der Großteil des Inhalts dieser Seite ist noch nicht übersetzt, weil die Website von nur einer Person mit begrenzter Zeit gepflegt wird."
        },
        miscinfo: {
          title: "Sonstige Infos",
          heading: "Sonstige Infos",
          back: "Zurück zum Menü",
          playerLevels: "Spielerlevel",
          playerLevelsDetails: "Level 1 -> 2: 150 XP\nLevel 2 -> 3: 300 XP\nLevel 3 -> 4: 600 XP\nLevel 4 -> 5: 1.350 XP\nLevel 5 -> 6: 2.700 XP\nLevel 6 -> 7: 5.100 XP\nLevel 7 -> 8: 9.000 XP\nLevel 8 -> 9: 15.000 XP\nLevel 9 -> 10: 24.000 XP",
          translationNotice: "Der Großteil des Inhalts dieser Seite ist noch nicht übersetzt, weil die Website von nur einer Person mit begrenzter Zeit gepflegt wird."
        }
      }
    },
    fr: {
      languageName: "Francais",
      ui: {
        settings: {
          buttonLabel: "Ouvrir les parametres",
          title: "Parametres",
          subtitle: "Personnalisez vos preferences globales du site.",
          languageLabel: "Langue",
          languageHint: "Applique a toutes les pages.",
          closeLabel: "Fermer les parametres",
          walkthroughLabel: "Visite guidée",
          walkthroughHint: "Relancer la visite guidée pour la page actuelle.",
          restartWalkthrough: "Redémarrer la visite guidée"
        },
        nav: {
          maps: "Cartes",
          bestiary: "Bestiaire",
          equipment: "Equipement",
          quests: "Quetes",
          patchnotes: "Notes",
          commands: "Commandes",
          miscinfo: "Infos diverses",
          menu: "Retour au menu"
        },
        common: {
          loading: "Chargement...",
          search: "Rechercher"
        }
      },
      page: {
        index: {
          title: "SAO MC - Hub des Modules",
          eyebrow: "Hub des Modules",
          discordButton: "Discord",
          discordButtonAria: "Ouvrir les raccourcis Discord",
          heading: "Selectionnez le mode de jeu SAO MC",
          subtitle: "Choisissez les informations de mode que vous voulez consulter.",
          disclaimerLabel: "Note :",
          disclaimerBody: "Ceci est un projet personnel.\nCe site est principalement destine a un usage personnel et de guilde. Les informations continueront d'etre ajoutees, mises a jour et ameliorees tant qu'il y aura du nouveau contenu a documenter.\nGardez a l'esprit que ce projet n'etait pas initialement concu comme une ressource publique complete ; certaines informations peuvent donc etre incompletes ou adaptees a mes besoins et a ceux de ma guilde.",
          selectorAria: "Selection du mode",
          aincradTitle: "Aincrad",
          underworldTitle: "Fractured Underworld",
          ggoTitle: "GunGaleOnline",
          launchTag: "Lancer",
          notReleasedTag: "Non publie",
          aincradDesc: "Ouvrez le hub de carte pour parcourir le guide des donjons, les quetes, le bestiaire et plus.",
          underworldDesc: "Ouvrez le hub de carte Fractured Underworld pour commencer a construire et tester ce module.",
          ggoDesc: "Le menu GGO n'est pas encore publie, donc aucun module n'est disponible.",
          interactiveMode: "Mode interactif",
          guildLabel: "Guilde :",
          guildName: "Vanguard of War",
          guildAria: "Hommage a la guilde",
          discordModalTitle: "Raccourcis Discord",
          discordModalCloseAria: "Fermer le menu Discord",
          discordModalBody: "Choisissez votre prochaine destination.",
          creatorDiscord: "Discord du createur",
          saoDiscord: "Discord SAO MC",
          supportDiscord: "Discord support SAO MC",
          ggoToast: "GGO n'est pas encore sorti. Aucune information a afficher."
        },
        patchnotes: {
          title: "Notes de patch et journal des modifications SAO MC",
          heading: "Notes de patch",
          searchLabel: "Rechercher des notes",
          searchPlaceholder: "Filtrer par version, élément ou mise à jour",
          noMatches: "Aucune note de patch ne correspond à ce filtre.",
          noEntries: "Aucune entrée de journal correspondant n'a été trouvée.",
          statusShowing: "Affichage de {count} note de patch{suffix}.",
          translationNotice: "La majeure partie du contenu de cette page n'est pas encore traduite, car le site est géré par une seule personne avec peu de temps."
        },
        miscinfo: {
          title: "Infos diverses",
          heading: "Infos diverses",
          back: "Retour au menu",
          playerLevels: "Niveaux du joueur",
          playerLevelsDetails: "Niveau 1 -> 2 : 150 XP\nNiveau 2 -> 3 : 300 XP\nNiveau 3 -> 4 : 600 XP\nNiveau 4 -> 5 : 1 350 XP\nNiveau 5 -> 6 : 2 700 XP\nNiveau 6 -> 7 : 5 100 XP\nNiveau 7 -> 8 : 9 000 XP\nNiveau 8 -> 9 : 15 000 XP\nNiveau 9 -> 10 : 24 000 XP",
          translationNotice: "La majeure partie du contenu de cette page n'est pas encore traduite, car le site est géré par une seule personne avec peu de temps."
        }
      }
    }
  };

  function deepMerge(target, source) {
    if (!source || typeof source !== "object" || Array.isArray(source)) {
      return target;
    }

    const output = target && typeof target === "object" && !Array.isArray(target)
      ? { ...target }
      : {};

    Object.entries(source).forEach(([key, value]) => {
      const existingValue = output[key];
      if (value && typeof value === "object" && !Array.isArray(value) && existingValue && typeof existingValue === "object" && !Array.isArray(existingValue)) {
        output[key] = deepMerge(existingValue, value);
      } else {
        output[key] = value;
      }
    });

    return output;
  }

  const translationAdditions = {
    en: {
      ui: {
        nav: {
          sectionAria: "Section navigation",
          primaryAria: "Primary navigation",
          mapNavAria: "Map navigation"
        },
        pageNotice: "A large portion of this website has not been translated yet. This project is maintained by a solo developer, so translating every page takes a significant amount of time.",
        walkthrough: {
          title: "Quick walkthrough",
          skip: "Skip",
          back: "Back",
          next: "Next",
          finish: "Finish",
          step: "Step {current} of {total}",
          welcomeTitle: "Welcome",
          welcomeBody: "This is the doormat. Use this page to choose which SAO MC module you want to open.",
          modeCardsTitle: "Mode cards",
          modeCardsBody: "Pick Aincrad or Fractured Underworld to launch a module. The GGO card is currently locked until release.",
          discordTitle: "Discord shortcuts",
          discordBody: "Open quick links to the creator profile, SAO MC Discord, and support server.",
          settingsTitle: "Settings",
          settingsBody: "Use the gear to switch language and replay this walkthrough whenever you want."
        }
      },
      page: {
        maps: {
          walkthrough: {
            step1Title: "Navigation",
            step1Body: "Use this top row to jump between Maps, Bestiary, Equipment, Quests, Commands, and the Menu.",
            step2Title: "Map Controls",
            step2Body: "Choose the floor, toggle underground mode, use search, and quickly reset filters from here.",
            step3Title: "Filters",
            step3Body: "Turn categories on to show markers. Active filters stay highlighted so you can see what is currently enabled.",
            step4Title: "Interactive Map",
            step4Body: "Drag to pan and scroll to zoom. Select a marker to open details and shortcuts in the info panel."
          }
        },
        bestiary: {
          loadError: "Bestiary data could not be loaded. Refresh the page and try again.",
          loadUnavailable: "Bestiary data is currently unavailable."
        },
        miscinfo: {
          notice: "Most of this page's content is still untranslated because the site is maintained by one person with limited time."
        },
        towerdefense: {
          notice: "Most of this page's content is still untranslated because the site is maintained by one person with limited time."
        },
        commands: {
          loadError: "Commands could not be loaded right now. Refresh the page and try again.",
          loadUnavailable: "Commands are currently unavailable."
        },
        ecompendium: {
          loadError: "Equipment data could not be loaded. Refresh the page and try again.",
          loadUnavailable: "Equipment data is currently unavailable."
        },
        quests: {
          loadError: "Quest data could not be loaded. Refresh the page and try again.",
          loadUnavailable: "Quest data is currently unavailable."
        },
        patchnotes: {
          loadError: "Patch notes could not be loaded. Refresh the page and try again.",
          loadUnavailable: "Patch notes are currently unavailable."
        },
        maps: {
          categories: {
            biomes: "Biomes",
            bossSpawns: "Boss Spawns",
            dungeons: "Dungeons",
            farmingSpots: "Farming Spots",
            mobAreas: "Mob Areas",
            sideQuests: "Side Quests",
            alchemist: "Alchemist",
            lumberjack: "Lumberjack",
            accessoriesMerchants: "Accessories Merchant",
            consumablesMerchants: "Consumables Merchant",
            equipmentMerchants: "Equipment Merchant",
            lootBuyers: "Loot Buyers",
            occultMerchants: "Occult Merchant",
            toolMerchants: "Tool Merchant",
            travelingMerchants: "Traveling Merchants",
            weaponSellers: "Weapon Sellers",
            accessoriesBlacksmith: "Accessories Blacksmith",
            armorBlacksmith: "Armor Blacksmith",
            ingotBlacksmith: "Ingot Blacksmith",
            keyBlacksmith: "Key Blacksmith",
            refaire: "Refaire",
            runeCraftsmen: "Rune Craftsmen",
            weaponsmith: "Weaponsmith"
          },
          floorOptions: {
            floor1: "Floor 1 - The Town of Beginnings",
            floor2: "Floor 2 - Arid Desert",
            floor3: "Floor 3 - The Forest of Wandering"
          },
          categoryMainTitle: "Category: Main",
          categoryQuestsTitle: "Category: Quests",
          categoryJourneymenTitle: "Category: Journeymen",
          categoryMarketTitle: "Category: Market",
          categoryCraftsmenTitle: "Category: Craftsmen",
          walkthrough: {
            step1Title: "Navigation",
            step1Body: "Use this top row to jump between Maps, Bestiary, Equipment, Quests, Commands, and the Menu.",
            step2Title: "Map Controls",
            step2Body: "Choose the floor, toggle underground mode, use search, and quickly reset filters from here.",
            step3Title: "Filters",
            step3Body: "Turn categories on to show markers. Active filters stay highlighted so you can see what is currently enabled.",
            step4Title: "Interactive Map",
            step4Body: "Drag to pan and scroll to zoom. Select a marker to open details and shortcuts in the info panel."
          },
          runtimeError: "The map could not be loaded right now. Refresh the page and try again.",
          runtimeTitle: "Map unavailable",
          coordinatesPlaceholder: "X: -- Z: --"
        },
        mainui: {
          categories: {
            npc: "NPC",
            rulid: "Wheat Spawn",
            fishingSpot: "Fishing Spot",
            oakWood: "Oak Wood",
            copper: "Copper",
            iron: "Iron",
            coal: "Coal"
          },
          categoryMainTitle: "Category: Main",
          islandOptions: {
            playerIsland: "Player Island",
            gigasCedar: "Gigas Cedar",
            iceCave: "Ice Cave",
            rulid: "Rulid",
            fishingIsland: "Fishing Island"
          },
          walkthrough: {
            step1Title: "Navigation",
            step1Body: "Use the top row to open Tower Defense or go back to the main Menu.",
            step2Title: "Island Controls",
            step2Body: "Change islands, toggle underground mode, search markers, and reset filters quickly.",
            step3Title: "Filters",
            step3Body: "Enable categories to show matching markers. Disabled filters automatically hide when not valid for the selected island.",
            step4Title: "Interactive Map",
            step4Body: "Drag to pan, scroll to zoom, and select a marker to open details in the side panel."
          },
          runtimeError: "The map could not be loaded right now. Refresh the page and try again.",
          runtimeTitle: "Map unavailable",
          coordinatesPlaceholder: "X: -- Z: --"
        },
        patchnotes: {
          entries: {
            v120: {
              title: "Very Small Bug Fix",
              summary: "• Fixed the Commands Menu loading indefinitely.\n• Fixed patchnote order from lowest to highest date."
            },
            v111: {
              title: "Final Touches",
              summary: "• Added a Commands tab.\n• Added a Misc. Info section for information that doesn't fit anywhere else.\n• Added Back to Menu buttons throughout the website.\n• Added the Fractured Underworld section, although it is still in the early stages of development.\n• Began work on Tower Defense support and information within Fractured Underworld.\n• Added a small disclaimer to the Welcome Mat.\n• Fixed a wapoint bug.\n• Fixed a UI bug"
            },
            v100: {
              title: "Full Release",
              summary: "• Added Floor 3 and its available waypoints.\n• Main Quest information for Floors 1 to 3 is currently missing, so those have not been added yet.\n• Some waypoints on Floor 3 intentionally do not work due to a lack of information at this time.\n• Optimized code across the website.\n• Started and completed the Equipment Compendium.\n• Most buttons are now alphabetically sorted.\n• Updated and improved the website UI.\n• Redesigned the website landing page.\n• Added buttons linking to the SAO MC Discord, the support Discord, and my personal Discord profile.\n• Contact me through discord for Suggestions or Bug Reports"
            },
            v010: {
              title: "Website Release",
              summary: "Initial website release. Added Floor 1, Side Quest locations, Biome locations, Dungeon locations, the Quest Menu, and the Bestiary Menu."
            },
            v020: {
              title: "New Maps",
              summary: "Added Floor 2, major POI waypoints for Floor 1 and Floor 2, waypoint interactions that can open the Bestiary or Quest Menu, and the website main menu screen."
            }
          },
          tags: {
            bugFixes: "Bug Fixes",
            commands: "Commands",
            maps: "Maps",
            release: "Release",
            miscInfo: "Misc Info",
            fracturedUnderworld: "Fractured Underworld",
            towerDefense: "Tower Defense",
            welcomeMat: "Welcome Mat",
            floor3: "Floor 3",
            equipment: "Equipment",
            ui: "UI",
            discord: "Discord",
            contact: "Contact",
            floor1: "Floor 1",
            quests: "Quests",
            biomes: "Biomes",
            dungeons: "Dungeons",
            bestiary: "Bestiary",
            floor2: "Floor 2",
            poi: "POI",
            waypoints: "Waypoints",
            mainMenu: "Main Menu"
          }
        },
        towerdefense: {
          arc1Title: "Arc 1 - Tutorial (Boar Planes)",
          arc1Rewards: "Pouch of 100 Col (100%), Utility Crystal (25%), Minor PvE Rune (8%), Dungeon Key (4%), Fern (Habitat Item) (30%), Frosted Lantern (Habitat Item) (20%), Campfire (Habitat Item) (20%)",
          arc1Waves: "5 Waves, On the Fifth wave a reskinned pumba spawns as the boss.",
          arc2Title: "Arc 2 - Medium (Boar Zones)",
          arc2Rewards: "500 Col Purse (100%), Utility Crystal (40%), Minor PvE Rune (18%), Dungeon Key (12%), Fern (Habitat) (30%), Hay Bale (Habitat) (20%)",
          arc2Waves: "6 Waves, On the Sixth wave a reskinned pumba spawns as the boss.",
          shopItems: {
            mageSkeleton: {
              name: "Mage Skeleton",
              unlockRequirement: "5 Mage Scrolls",
              invocationCost: "200 Invocation Cost",
              levelOne: "Lvl 1: 1.1 Attack Speed, 7 Range, 5 Damage",
              progression: {
                one: "Lvl 1 -> 2: +.1 Attack Speed, +2 Range, +2 Damage (1.2 Attack Speed, 9 Range, 7 Damage)",
                two: "Lvl 2 -> 3: +.2 Attack Speed, +2 Range, +2 Damage (1.4 Attack Speed, 11 Range, 9 Damage)",
                three: "Lvl 3 -> 4: +.3 Attack Speed, +2 Range, +3 Damage (1.7 Attack Speed, 13 Range, 12 Damage)",
                four: "Lvl 4 -> 5 (Max): +.3 Attack Speed, +2 Range, +3 Damage (2 Attack Speed, 15 Range, 15 Damage)"
              },
              upgradeCosts: "Upgrade Cost: Lv2 80, Lv3 150, Lv4 250, Lv5 400"
            },
            archerSkeleton: {
              name: "Archer Skeleton",
              unlockRequirement: "5 Archer Scrolls",
              invocationCost: "150 Invocation Cost",
              levelOne: "Level 1: .4 Attack Speed, 10 Range, 6 Damage",
              progression: {
                one: "Lvl 1 -> 2: +.1 Attack Speed, +3 Range, +3 Damage (0.5 Attack Speed, 13 Range, 9 Damage)",
                two: "Lvl 2 -> 3: +3 Range, +4 Damage (.5 Attack Speed, 16 Range, 13 Damage)",
                three: "Lvl 3 -> 4: N/A (N/A)",
                four: "Lvl 4 -> 5: N/A (N/A)"
              },
              upgradeCosts: "Upgrade Cost: Lv2 80, Lv3 150, Lv4 250, Lv5 400"
            },
            swordsmanSkeleton: {
              name: "Swordsman Skeleton",
              unlockRequirement: "5 Swordsman Scrolls",
              invocationCost: "100 Invocation Cost",
              levelOne: "Level 1: .7 Attack Speed, 4 Range, 8 Damage",
              progression: {
                one: "Lvl 1 -> 2: +4 Damage (.7 Attack Speed, 4 Range, 12 Damage)",
                two: "Lvl 2 -> 3: +.1 Attack Speed, +1 Range, +5 Damage (.8 Attack Speed, 5 Range, 17 Damage)",
                three: "Lvl 3 -> 4: +7 Damage (.8 Attack Speed, 5 Range, 24 Damage)",
                four: "Lvl 4 -> 5 (Max): +.1 Attack Speed, +1 Range, +8 Damage"
              },
              upgradeCosts: "Upgrade Cost: Lv2 80, Lv3 150, Lv4 250, Lv5 400"
            }
          }
        }
      }
    },
    es: {
      ui: {
        nav: {
          sectionAria: "Navegacion de seccion",
          primaryAria: "Navegacion principal",
          mapNavAria: "Navegacion del mapa"
        },
        pageNotice: "Una gran parte de este sitio web todavía no ha sido traducida. Este proyecto es mantenido por un desarrollador solitario, así que traducir cada página requiere una cantidad significativa de tiempo.",
        walkthrough: {
          title: "Guía rápida",
          skip: "Omitir",
          back: "Atrás",
          next: "Siguiente",
          finish: "Finalizar",
          step: "Paso {current} de {total}",
          welcomeTitle: "Bienvenido",
          welcomeBody: "Esta es la bienvenida. Usa esta pagina para elegir que modulo de SAO MC quieres abrir.",
          modeCardsTitle: "Tarjetas de modo",
          modeCardsBody: "Elige Aincrad o Fractured Underworld para abrir un modulo. La tarjeta de GGO sigue bloqueada hasta su lanzamiento.",
          discordTitle: "Accesos directos de Discord",
          discordBody: "Abre enlaces rapidos al perfil del creador, al Discord de SAO MC y al servidor de soporte.",
          settingsTitle: "Configuracion",
          settingsBody: "Usa el engranaje para cambiar el idioma y repetir esta guia cuando quieras."
        }
      },
      page: {
        maps: {
          walkthrough: {
            step1Title: "Navegación",
            step1Body: "Usa esta fila superior para saltar entre Mapas, Bestiario, Equipo, Misiones, Comandos y el Menú.",
            step2Title: "Controles del mapa",
            step2Body: "Elige el piso, activa el modo subterráneo, usa la búsqueda y restablece los filtros rápidamente desde aquí.",
            step3Title: "Filtros",
            step3Body: "Activa categorías para mostrar marcadores. Los filtros activos se mantienen resaltados para que veas lo que está habilitado en este momento.",
            step4Title: "Mapa interactivo",
            step4Body: "Arrastra para mover la vista y usa la rueda para acercar. Selecciona un marcador para abrir detalles y accesos rápidos en el panel de información."
          }
        },
        bestiary: {
          title: "Bestiario de Aincrad",
          heading: "Bestiario",
          tablistAria: "Categorías del bestiario",
          searchLabel: "Buscar mobs",
          searchPlaceholder: "Buscar por nombre...",
          listTitleRegular: "Lista de mobs regulares",
          listTitleBoss: "Lista de jefes",
          listTitleDungeonBoss: "Lista de jefes de mazmorras",
          listTitleDungeonMobs: "Lista de mobs de mazmorras",
          statusShown: "{visible} de {total} mobs mostrados.",
          emptyCategory: "Todavía no hay entradas para {category}.",
          drops: "Drops",
          aggressiveness: "Agresividad",
          aggressive: "Agresivo",
          neutral: "Neutral",
          passive: "Pasivo",
          xp: "XP",
          na: "N/A",
          loadError: "No se pudieron cargar los datos del bestiario. Actualiza la página e inténtalo de nuevo.",
          loadUnavailable: "Los datos del bestiario no están disponibles en este momento.",
          notice: "La mayor parte del contenido de esta página todavía no está traducida porque el sitio lo mantiene una sola persona con poco tiempo."
        },
        commands: {
          title: "Guía de comandos de Aincrad",
          heading: "Comandos",
          tablistAria: "Categorías de comandos",
          searchLabel: "Buscar comandos",
          searchPlaceholder: "Buscar por comando, uso o ejemplo...",
          emptyState: "No hay comandos que coincidan con tus filtros actuales.",
          colCommand: "Comando",
          colUsage: "Uso",
          colExample: "Ejemplo",
          statusShown: "{count} comando{suffix} mostrado{suffix} en {category}.",
          categories: {
            communication: "Comunicación",
            cosmetics: "Cosméticos y apariencia",
            dungeons: "Mazmorras",
            economy: "Economía",
            gameplay: "Juego y progresión",
            information: "Información",
            media: "Media y audio",
            navigation: "Navegación",
            useless: "Comandos inútiles"
          },
          loadError: "No se pudieron cargar los comandos en este momento. Actualiza la página e inténtalo de nuevo.",
          loadUnavailable: "Los comandos no están disponibles en este momento.",
          notice: "La mayor parte del contenido de esta página todavía no está traducida porque el sitio lo mantiene una sola persona con poco tiempo."
        },
        ecompendium: {
          title: "Compendio de equipo de Aincrad",
          heading: "Compendio de equipo",
          searchLabel: "Buscar",
          searchPlaceholder: "Buscar equipo...",
          noEntriesFound: "No se encontraron entradas.",
          statusShown: "Mostrando {visible} de {total} entradas.",
          listTitles: {
            weapon: "Armas",
            armor: "Armadura",
            accessory: "Accesorios",
            rune: "Runas",
            tool: "Herramientas",
            food: "Comida",
            consumable: "Consumibles",
            material: "Materiales",
            quest_item: "Objetos de misión",
            resource: "Recursos",
            dungeon: "Mazmorras",
            currency: "Moneda"
          },
          labels: {
            rarity: "Rareza",
            level: "Nivel",
            set: "Conjunto",
            craftedAt: "Fabricado en",
            description: "Descripción",
            statistics: "Estadísticas",
            source: "Fuente",
            resources: "Recursos"
          },
          unknownItem: "Objeto desconocido",
          unknown: "Desconocido",
          loadError: "No se pudieron cargar los datos de equipamiento. Actualiza la página e inténtalo de nuevo.",
          loadUnavailable: "Los datos de equipamiento no están disponibles en este momento.",
          notice: "La mayor parte del contenido de esta página todavía no está traducida porque el sitio lo mantiene una sola persona con poco tiempo."
        },
        quests: {
          title: "Guía de misiones de Aincrad",
          heading: "Misiones",
          logoAria: "Logo de misiones",
          searchLabel: "Buscar misiones",
          searchPlaceholder: "Buscar por cualquier columna...",
          tableCols: {
            npcName: "Nombre del PNJ",
            city: "Ciudad",
            coordinates: "Coordenadas",
            requirements: "Requisitos / Recursos",
            questName: "Nombre de la misión",
            xpReward: "XP",
            colReward: "Col",
            bonusItems: "Objetos extra",
            completed: "Completada"
          },
          markCompleted: "Marcar completada",
          completed: "Completada",
          titleWithFloor: "Misiones - {floor}",
          noQuestData: "Todavía no hay datos de misiones para {floor}.",
          noQuestMatchFloor: "No hay entradas de misiones que coincidan con tu búsqueda en {floor}. {completed} completadas.",
          shownStatus: "{visible} de {total} entradas de misiones mostradas para {floor} || {completed} completadas.",
          noQuestMatch: "No hay entradas de misiones que coincidan con tu búsqueda actual.",
          loadedStatus: "{count} entradas de misiones cargadas para {floor}.",
          loadError: "No se pudieron cargar los datos de las misiones. Actualiza la página e inténtalo de nuevo.",
          loadUnavailable: "Los datos de las misiones no están disponibles en este momento.",
          notice: "La mayor parte del contenido de esta página todavía no está traducida porque el sitio lo mantiene una sola persona con poco tiempo."
        },
        patchnotes: {
          title: "Notas de parche y registro de cambios de SAO MC",
          heading: "Notas de parche",
          searchLabel: "Buscar notas",
          searchPlaceholder: "Filtrar por versión, elemento o actualización",
          noMatches: "No hay notas de parche que coincidan con ese filtro.",
          noEntries: "No se encontraron entradas del registro de cambios.",
          statusShowing: "Mostrando {count} nota de parche{suffix}.",
          loadError: "No se pudieron cargar las notas de parche. Actualiza la página e inténtalo de nuevo.",
          loadUnavailable: "Las notas de parche no están disponibles en este momento.",
          translationNotice: "La mayor parte del contenido de esta página todavía no está traducida porque el sitio lo mantiene una sola persona con poco tiempo.",
          notice: "La mayor parte del contenido de esta página todavía no está traducida porque el sitio lo mantiene una sola persona con poco tiempo."
        },
        maps: {
          categories: {
            biomes: "Biomas",
            bossSpawns: "Apariciones de jefes",
            dungeons: "Mazmorras",
            farmingSpots: "Puntos de cosecha",
            mobAreas: "Areas de mobs",
            sideQuests: "Misiones secundarias",
            alchemist: "Alquimista",
            lumberjack: "Leñador",
            accessoriesMerchants: "Mercader de accesorios",
            consumablesMerchants: "Mercader de consumibles",
            equipmentMerchants: "Mercader de equipo",
            lootBuyers: "Compradores de botín",
            occultMerchants: "Mercader oculto",
            toolMerchants: "Mercader de herramientas",
            travelingMerchants: "Mercaderes ambulantes",
            weaponSellers: "Vendedores de armas",
            accessoriesBlacksmith: "Herrero de accesorios",
            armorBlacksmith: "Herrero de armaduras",
            ingotBlacksmith: "Herrero de lingotes",
            keyBlacksmith: "Herrero de llaves",
            refaire: "Refaire",
            runeCraftsmen: "Artesanos de runas",
            weaponsmith: "Herrero de armas"
          },
          floorOptions: {
            floor1: "Piso 1 - El pueblo de los comienzos",
            floor2: "Piso 2 - Desierto árido",
            floor3: "Piso 3 - El bosque errante"
          },
          categoryMainTitle: "Categoria: Principal",
          categoryQuestsTitle: "Categoria: Misiones",
          categoryJourneymenTitle: "Categoria: Artesanos",
          categoryMarketTitle: "Categoria: Mercado",
          categoryCraftsmenTitle: "Categoria: Artesanos",
          walkthrough: {
            step1Title: "Navegación",
            step1Body: "Usa esta fila superior para saltar entre Mapas, Bestiario, Equipo, Misiones, Comandos y el Menú.",
            step2Title: "Controles del mapa",
            step2Body: "Elige el piso, activa el modo subterráneo, usa la búsqueda y restablece los filtros rápidamente desde aquí.",
            step3Title: "Filtros",
            step3Body: "Activa categorías para mostrar marcadores. Los filtros activos se mantienen resaltados para que veas lo que está habilitado en este momento.",
            step4Title: "Mapa interactivo",
            step4Body: "Arrastra para mover la vista y usa la rueda para acercar. Selecciona un marcador para abrir detalles y accesos rápidos en el panel de información."
          },
          runtimeError: "El mapa no se pudo cargar en este momento. Actualiza la página e inténtalo de nuevo.",
          runtimeTitle: "Mapa no disponible",
          coordinatesPlaceholder: "X: -- Z: --"
        },
        mainui: {
          categories: {
            npc: "PNJ",
            rulid: "Aparición de trigo",
            fishingSpot: "Punto de pesca",
            oakWood: "Madera de roble",
            copper: "Cobre",
            iron: "Hierro",
            coal: "Carbón"
          },
          categoryMainTitle: "Categoría: Principal",
          clearFilters: "Borrar filtros",
          islandOptions: {
            playerIsland: "Isla del jugador",
            gigasCedar: "Gigas Cedar",
            iceCave: "Cueva de hielo",
            rulid: "Rulid",
            fishingIsland: "Isla de pesca"
          },
          walkthrough: {
            step1Title: "Navegación",
            step1Body: "Usa esta fila superior para abrir Tower Defense o volver al menú principal.",
            step2Title: "Controles de isla",
            step2Body: "Cambia de isla, activa el modo subterráneo, busca marcadores y restablece filtros rápidamente.",
            step3Title: "Filtros",
            step3Body: "Activa categorías para mostrar marcadores coincidentes. Los filtros deshabilitados se ocultan automáticamente cuando no son válidos para la isla seleccionada.",
            step4Title: "Mapa interactivo",
            step4Body: "Arrastra para desplazarte, desplázate para hacer zoom y selecciona un marcador para abrir detalles en el panel lateral."
          },
          runtimeError: "El mapa no se pudo cargar en este momento. Actualiza la página e inténtalo de nuevo.",
          runtimeTitle: "Mapa no disponible",
          coordinatesPlaceholder: "X: -- Z: --",
          notice: "La mayor parte del contenido de esta página todavía no está traducida porque el sitio lo mantiene una sola persona con poco tiempo."
        },
        miscinfo: {
          title: "Info. Varia",
          heading: "Info. Varia",
          back: "Volver al Menu",
          playerLevels: "Niveles del jugador",
          playerLevelsDetails: "Nivel 1 -> 2: 150 XP\nNivel 2 -> 3: 300 XP\nNivel 3 -> 4: 600 XP\nNivel 4 -> 5: 1,350 XP\nNivel 5 -> 6: 2,700 XP\nNivel 6 -> 7: 5,100 XP\nNivel 7 -> 8: 9,000 XP\nNivel 8 -> 9: 15,000 XP\nNivel 9 -> 10: 24,000 XP",
          translationNotice: "La mayor parte del contenido de esta página todavía no está traducida porque el sitio lo mantiene una sola persona con poco tiempo."
        },
        patchnotes: {
          entries: {
            v120: {
              title: "Correción muy pequeña",
              summary: "• Se corrigió que el menú de comandos se cargara indefinidamente.\n• Se corrigió el orden de notas desde la fecha más antigua a la más reciente."
            },
            v111: {
              title: "Toques finales",
              summary: "• Se añadió una pestaña de comandos.\n• Se añadió una sección de información variada.\n• Se añadieron botones de regreso al menú por toda la web.\n• Se añadió la sección de Fractured Underworld, aunque sigue en etapas tempranas.\n• Se empezó a trabajar en la defensa de torres para Fractured Underworld.\n• Se añadió un aviso breve al Welcome Mat.\n• Se corrigió un error de waypoints.\n• Se corrigió un error visual."
            },
            v100: {
              title: "Versión completa",
              summary: "• Se añadió el piso 3 y sus waypoints disponibles.\n• La información de misiones principales de los pisos 1 a 3 sigue faltando.\n• Algunos waypoints del piso 3 no funcionan por falta de información.\n• Se optimizó el código del sitio.\n• Se completó el compendio de equipo.\n• La mayoría de botones ya están ordenados alfabéticamente.\n• Se actualizó y mejoró la interfaz.\n• Se rediseñó la portada.\n• Se añadieron enlaces a Discord de SAO MC, soporte y perfil personal.\n• Contáctame por Discord para sugerencias o reportes de errores."
            },
            v010: {
              title: "Lanzamiento del sitio",
              summary: "Lanzamiento inicial del sitio. Se añadieron el piso 1, ubicaciones de misiones secundarias, biomas, mazmorras, el menú de misiones y el bestiario."
            },
            v020: {
              title: "Nuevos mapas",
              summary: "Se añadió el piso 2, los principales waypoints del piso 1 y 2, interacciones que abren el bestiario o el menú de misiones, y la pantalla principal del sitio."
            }
          },
          tags: {
            bugFixes: "Correciones",
            commands: "Comandos",
            maps: "Mapas",
            release: "Lanzamiento",
            miscInfo: "Info variada",
            fracturedUnderworld: "Fractured Underworld",
            towerDefense: "Defensa de torres",
            welcomeMat: "Welcome Mat",
            floor3: "Piso 3",
            equipment: "Equipo",
            ui: "Interfaz",
            discord: "Discord",
            contact: "Contacto",
            floor1: "Piso 1",
            quests: "Misiones",
            biomes: "Biomas",
            dungeons: "Mazmorras",
            bestiary: "Bestiario",
            floor2: "Piso 2",
            poi: "POI",
            waypoints: "Waypoints",
            mainMenu: "Menú principal"
          }
        },
        towerdefense: {
          notice: "La mayor parte del contenido de esta página todavía no está traducida porque el sitio lo mantiene una sola persona con poco tiempo.",
          arc1Title: "Arco 1 - Tutorial (Boar Planes)",
          arc1Rewards: "Bolsa de 100 Col (100%), Cristal de utilidad (25%), Runa menor de PvE (8%), Llave de mazmorra (4%), Helecho (objeto de hábitat) (30%), Linterna escarchada (objeto de hábitat) (20%), Fogata (objeto de hábitat) (20%)",
          arc1Waves: "5 oleadas, en la quinta aparece un pumba reskin como jefe.",
          arc2Title: "Arco 2 - Medio (Boar Zones)",
          arc2Rewards: "Bolsa de 500 Col (100%), Cristal de utilidad (40%), Runa menor de PvE (18%), Llave de mazmorra (12%), Helecho (hábitat) (30%), Paca de heno (hábitat) (20%)",
          arc2Waves: "6 oleadas, en la sexta aparece un pumba reskin como jefe.",
          shopItems: {
            mageSkeleton: {
              name: "Esqueleto mago",
              unlockRequirement: "5 pergaminos de mago",
              invocationCost: "Coste de invocación: 200",
              levelOne: "Nivel 1: 1,1 velocidad de ataque, 7 alcance, 5 daño",
              progression: {
                one: "Nivel 1 -> 2: +.1 velocidad de ataque, +2 alcance, +2 daño (1,2 velocidad de ataque, 9 alcance, 7 daño)",
                two: "Nivel 2 -> 3: +.2 velocidad de ataque, +2 alcance, +2 daño (1,4 velocidad de ataque, 11 alcance, 9 daño)",
                three: "Nivel 3 -> 4: +.3 velocidad de ataque, +2 alcance, +3 daño (1,7 velocidad de ataque, 13 alcance, 12 daño)",
                four: "Nivel 4 -> 5 (máx): +.3 velocidad de ataque, +2 alcance, +3 daño (2 velocidad de ataque, 15 alcance, 15 daño)"
              },
              upgradeCosts: "Coste de mejora: Nv2 80, Nv3 150, Nv4 250, Nv5 400"
            },
            archerSkeleton: {
              name: "Esqueleto arquero",
              unlockRequirement: "5 pergaminos de arquero",
              invocationCost: "Coste de invocación: 150",
              levelOne: "Nivel 1: .4 velocidad de ataque, 10 alcance, 6 daño",
              progression: {
                one: "Nivel 1 -> 2: +.1 velocidad de ataque, +3 alcance, +3 daño (0,5 velocidad de ataque, 13 alcance, 9 daño)",
                two: "Nivel 2 -> 3: +3 alcance, +4 daño (0,5 velocidad de ataque, 16 alcance, 13 daño)",
                three: "Nivel 3 -> 4: N/A (N/A)",
                four: "Nivel 4 -> 5: N/A (N/A)"
              },
              upgradeCosts: "Coste de mejora: Nv2 80, Nv3 150, Nv4 250, Nv5 400"
            },
            swordsmanSkeleton: {
              name: "Esqueleto espadachín",
              unlockRequirement: "5 pergaminos de espadachín",
              invocationCost: "Coste de invocación: 100",
              levelOne: "Nivel 1: .7 velocidad de ataque, 4 alcance, 8 daño",
              progression: {
                one: "Nivel 1 -> 2: +4 daño (.7 velocidad de ataque, 4 alcance, 12 daño)",
                two: "Nivel 2 -> 3: +.1 velocidad de ataque, +1 alcance, +5 daño (.8 velocidad de ataque, 5 alcance, 17 daño)",
                three: "Nivel 3 -> 4: +7 daño (.8 velocidad de ataque, 5 alcance, 24 daño)",
                four: "Nivel 4 -> 5 (máx): +.1 velocidad de ataque, +1 alcance, +8 daño"
              },
              upgradeCosts: "Coste de mejora: Nv2 80, Nv3 150, Nv4 250, Nv5 400"
            }
          }
        }
      }
    },
    de: {
      ui: {
        nav: {
          sectionAria: "Abschnittsnavigation",
          primaryAria: "Hauptnavigation",
          mapNavAria: "Karten-Navigation"
        },
        pageNotice: "Ein großer Teil dieser Website wurde noch nicht übersetzt. Dieses Projekt wird von einem Solo-Entwickler betreut, daher dauert das Übersetzen jeder Seite sehr lange.",
        walkthrough: {
          title: "Schnelle Führung",
          skip: "Überspringen",
          back: "Zurück",
          next: "Weiter",
          finish: "Fertig",
          step: "Schritt {current} von {total}",
          welcomeTitle: "Willkommen",
          welcomeBody: "Das ist die Willkommensseite. Nutze diese Seite, um zu wählen, welches SAO-MC-Modul du öffnen möchtest.",
          modeCardsTitle: "Modus-Karten",
          modeCardsBody: "Wähle Aincrad oder Fractured Underworld, um ein Modul zu starten. Die GGO-Karte ist bis zur Veröffentlichung gesperrt.",
          discordTitle: "Discord-Verknüpfungen",
          discordBody: "Öffne schnelle Links zum Profil des Erstellers, zum SAO-MC-Discord und zum Support-Server.",
          settingsTitle: "Einstellungen",
          settingsBody: "Nutze das Zahnrad, um die Sprache zu wechseln und diese Führung jederzeit erneut zu starten."
        }
      },
      page: {
        maps: {
          walkthrough: {
            step1Title: "Navigation",
            step1Body: "Nutze diese obere Zeile, um zwischen Karten, Bestiarium, Ausrüstung, Quests, Befehlen und dem Menü zu wechseln.",
            step2Title: "Kartensteuerung",
            step2Body: "Wähle den Stock, schalte den Untergrundmodus um, verwende die Suche und setze Filter hier schnell zurück.",
            step3Title: "Filter",
            step3Body: "Aktiviere Kategorien, um Markierungen anzuzeigen. Aktive Filter bleiben hervorgehoben, damit du leicht siehst, was gerade eingeschaltet ist.",
            step4Title: "Interaktive Karte",
            step4Body: "Ziehe zum Verschieben und scroll zum Zoomen. Wähle einen Marker, um Details und Verknüpfungen im Infopanel zu öffnen."
          }
        },
        bestiary: {
          title: "SAO-Bestiarium",
          heading: "Bestiarium",
          tablistAria: "Bestiarium-Kategorien",
          searchLabel: "Mobs suchen",
          searchPlaceholder: "Nach Namen suchen...",
          listTitleRegular: "Liste regulärer Mobs",
          listTitleBoss: "Boss-Liste",
          listTitleDungeonBoss: "Liste der Dungeon-Bosse",
          listTitleDungeonMobs: "Liste der Dungeon-Mobs",
          statusShown: "{visible} von {total} Mobs angezeigt.",
          emptyCategory: "Noch keine Einträge für {category}.",
          drops: "Drops",
          aggressiveness: "Aggressivität",
          aggressive: "Aggressiv",
          neutral: "Neutral",
          passive: "Passiv",
          xp: "XP",
          na: "N/V",
          loadError: "Die Bestiary-Daten konnten nicht geladen werden. Aktualisiere die Seite und versuche es erneut.",
          loadUnavailable: "Die Bestiary-Daten sind gerade nicht verfügbar.",
          notice: "Der Großteil des Inhalts dieser Seite ist noch nicht übersetzt, weil die Website von nur einer Person mit begrenzter Zeit gepflegt wird."
        },
        commands: {
          title: "SAO-Befehlsübersicht",
          heading: "Befehle",
          tablistAria: "Befehlskategorien",
          searchLabel: "Befehle suchen",
          searchPlaceholder: "Nach Befehl, Nutzung oder Beispiel suchen...",
          emptyState: "Keine Befehle passen zu deinen aktuellen Filtern.",
          colCommand: "Befehl",
          colUsage: "Nutzung",
          colExample: "Beispiel",
          statusShown: "{count} Befehl{suffix} in {category} angezeigt.",
          categories: {
            communication: "Kommunikation",
            cosmetics: "Kosmetik und Erscheinung",
            dungeons: "Dungeons",
            economy: "Wirtschaft",
            gameplay: "Spielablauf und Fortschritt",
            information: "Information",
            media: "Medien und Audio",
            navigation: "Navigation",
            useless: "Nutzlose Befehle"
          },
          loadError: "Die Befehle konnten gerade nicht geladen werden. Aktualisiere die Seite und versuche es erneut.",
          loadUnavailable: "Die Befehle sind gerade nicht verfügbar.",
          notice: "Der Großteil des Inhalts dieser Seite ist noch nicht übersetzt, weil die Website von nur einer Person mit begrenzter Zeit gepflegt wird."
        },
        ecompendium: {
          title: "SAO-Ausrüstungscompendium",
          heading: "Ausrüstungscompendium",
          searchLabel: "Suchen",
          searchPlaceholder: "Ausrüstung suchen...",
          noEntriesFound: "Keine Einträge gefunden.",
          statusShown: "{visible} von {total} Einträgen werden angezeigt.",
          listTitles: {
            weapon: "Waffen",
            armor: "Rüstung",
            accessory: "Zubehör",
            rune: "Runen",
            tool: "Werkzeuge",
            food: "Essen",
            consumable: "Verbrauchsgegenstände",
            material: "Materialien",
            quest_item: "Quest-Gegenstände",
            resource: "Ressourcen",
            dungeon: "Dungeons",
            currency: "Währung"
          },
          labels: {
            rarity: "Seltenheit",
            level: "Level",
            set: "Set",
            craftedAt: "Hergestellt in",
            description: "Beschreibung",
            statistics: "Statistiken",
            source: "Quelle",
            resources: "Ressourcen"
          },
          unknownItem: "Unbekannter Gegenstand",
          unknown: "Unbekannt",
          loadError: "Die Ausrüstungsdaten konnten nicht geladen werden. Aktualisiere die Seite und versuche es erneut.",
          loadUnavailable: "Die Ausrüstungsdaten sind gerade nicht verfügbar.",
          notice: "Der Großteil des Inhalts dieser Seite ist noch nicht übersetzt, weil die Website von nur einer Person mit begrenzter Zeit gepflegt wird."
        },
        quests: {
          title: "SAO-Quest-Übersicht",
          heading: "Quests",
          logoAria: "Quests-Logo",
          searchLabel: "Quests suchen",
          searchPlaceholder: "In jeder Spalte suchen...",
          tableCols: {
            npcName: "NPC-Name",
            city: "Stadt",
            coordinates: "Koordinaten",
            requirements: "Anforderungen / Ressourcen",
            questName: "Quest-Name",
            xpReward: "XP",
            colReward: "Col",
            bonusItems: "Bonusgegenstände",
            completed: "Abgeschlossen"
          },
          markCompleted: "Als abgeschlossen markieren",
          completed: "Abgeschlossen",
          titleWithFloor: "Quests - {floor}",
          noQuestData: "Für {floor} sind noch keine Quest-Daten hinzugefügt worden.",
          noQuestMatchFloor: "Keine Quest-Einträge entsprechen deiner Suche auf {floor}. {completed} abgeschlossen.",
          shownStatus: "{visible} von {total} Quest-Einträgen für {floor} angezeigt || {completed} abgeschlossen.",
          noQuestMatch: "Keine Quest-Einträge entsprechen deiner aktuellen Suche.",
          loadedStatus: "{count} Quest-Einträge für {floor} geladen.",
          loadError: "Die Quest-Daten konnten nicht geladen werden. Aktualisiere die Seite und versuche es erneut.",
          loadUnavailable: "Die Quest-Daten sind gerade nicht verfügbar.",
          notice: "Der Großteil des Inhalts dieser Seite ist noch nicht übersetzt, weil die Website von nur einer Person mit begrenzter Zeit gepflegt wird."
        },
        patchnotes: {
          title: "SAO-Patchnotes und Changelog",
          heading: "Patchnotes",
          searchLabel: "Notizen suchen",
          searchPlaceholder: "Nach Version, Gegenstand oder Update filtern",
          noMatches: "Keine Patchnotes passen zu diesem Filter.",
          noEntries: "Keine passenden Changelog-Einträge gefunden.",
          statusShowing: "{count} Patchnote{suffix} wird angezeigt.",
          loadError: "Die Patchnotes konnten nicht geladen werden. Aktualisiere die Seite und versuche es erneut.",
          loadUnavailable: "Die Patchnotes sind gerade nicht verfügbar.",
          translationNotice: "Der Großteil des Inhalts dieser Seite ist noch nicht übersetzt, weil die Website von nur einer Person mit begrenzter Zeit gepflegt wird.",
          notice: "Der Großteil des Inhalts dieser Seite ist noch nicht übersetzt, weil die Website von nur einer Person mit begrenzter Zeit gepflegt wird."
        },
        maps: {
          categories: {
            biomes: "Biome",
            bossSpawns: "Boss-Spawnpunkte",
            dungeons: "Dungeons",
            farmingSpots: "Farmstellen",
            mobAreas: "Mob-Bereiche",
            sideQuests: "Nebenquests",
            alchemist: "Alchemist",
            lumberjack: "Holzfäller",
            accessoriesMerchants: "Zubehör-Händler",
            consumablesMerchants: "Verbrauchsartikel-Händler",
            equipmentMerchants: "Ausrüstungs-Händler",
            lootBuyers: "Beutenkäufer",
            occultMerchants: "Okkult-Händler",
            toolMerchants: "Werkzeug-Händler",
            travelingMerchants: "Reisende Händler",
            weaponSellers: "Waffenhändler",
            accessoriesBlacksmith: "Zubehör-Schmied",
            armorBlacksmith: "Rüstungs-Schmied",
            ingotBlacksmith: "Barren-Schmied",
            keyBlacksmith: "Schlüssel-Schmied",
            refaire: "Refaire",
            runeCraftsmen: "Runen-Handwerker",
            weaponsmith: "Waffenschmied"
          },
          floorOptions: {
            floor1: "Stock 1 - Die Stadt des Anfangs",
            floor2: "Stock 2 - Aride Wüste",
            floor3: "Stock 3 - Der wandernde Wald"
          },
          categoryMainTitle: "Kategorie: Haupt",
          categoryQuestsTitle: "Kategorie: Quests",
          categoryJourneymenTitle: "Kategorie: Handwerker",
          categoryMarketTitle: "Kategorie: Markt",
          categoryCraftsmenTitle: "Kategorie: Handwerker",
          walkthrough: {
            step1Title: "Navigation",
            step1Body: "Nutze diese obere Zeile, um zwischen Karten, Bestiarium, Ausrüstung, Quests, Befehlen und dem Menü zu wechseln.",
            step2Title: "Kartensteuerung",
            step2Body: "Wähle den Stock, schalte den Untergrundmodus um, verwende die Suche und setze Filter hier schnell zurück.",
            step3Title: "Filter",
            step3Body: "Aktiviere Kategorien, um Markierungen anzuzeigen. Aktive Filter bleiben hervorgehoben, damit du leicht siehst, was gerade eingeschaltet ist.",
            step4Title: "Interaktive Karte",
            step4Body: "Ziehe zum Verschieben und scroll zum Zoomen. Wähle einen Marker, um Details und Verknüpfungen im Infopanel zu öffnen."
          },
          runtimeError: "Die Karte konnte gerade nicht geladen werden. Aktualisiere die Seite und versuche es erneut.",
          runtimeTitle: "Karte nicht verfügbar",
          coordinatesPlaceholder: "X: -- Z: --"
        },
        mainui: {
          categories: {
            npc: "NPC",
            rulid: "Weizen-Spawn",
            fishingSpot: "Angelplatz",
            oakWood: "Eichenholz",
            copper: "Kupfer",
            iron: "Eisen",
            coal: "Kohle"
          },
          categoryMainTitle: "Kategorie: Haupt",
          clearFilters: "Filter löschen",
          islandOptions: {
            playerIsland: "Spielerinsel",
            gigasCedar: "Gigas Cedar",
            iceCave: "Eishöhle",
            rulid: "Rulid",
            fishingIsland: "Fischinsel"
          },
          walkthrough: {
            step1Title: "Navigation",
            step1Body: "Nutze diese obere Zeile, um Tower Defense zu öffnen oder zum Hauptmenü zurückzukehren.",
            step2Title: "Inselsteuerung",
            step2Body: "Wechsle die Insel, aktiviere den Untergrundmodus, suche Marker und setze Filter schnell zurück.",
            step3Title: "Filter",
            step3Body: "Aktiviere Kategorien, um passende Marker anzuzeigen. Deaktivierte Filter werden automatisch ausgeblendet, wenn sie für die gewählte Insel nicht gültig sind.",
            step4Title: "Interaktive Karte",
            step4Body: "Ziehe zum Verschieben, scrolle zum Zoomen und wähle einen Marker, um Details im Seitenpanel zu öffnen."
          },
          runtimeError: "Die Karte konnte gerade nicht geladen werden. Aktualisiere die Seite und versuche es erneut.",
          runtimeTitle: "Karte nicht verfügbar",
          coordinatesPlaceholder: "X: -- Z: --", 
          notice: "Der Großteil des Inhalts dieser Seite ist noch nicht übersetzt, weil die Website von nur einer Person mit begrenzter Zeit gepflegt wird."
        },
        miscinfo: {
          title: "Sonstige Infos",
          heading: "Sonstige Infos",
          back: "Zurück zum Menü",
          playerLevels: "Spielerlevel",
          playerLevelsDetails: "Level 1 -> 2: 150 XP\nLevel 2 -> 3: 300 XP\nLevel 3 -> 4: 600 XP\nLevel 4 -> 5: 1.350 XP\nLevel 5 -> 6: 2.700 XP\nLevel 6 -> 7: 5.100 XP\nLevel 7 -> 8: 9.000 XP\nLevel 8 -> 9: 15.000 XP\nLevel 9 -> 10: 24.000 XP",
          translationNotice: "Der Großteil des Inhalts dieser Seite ist noch nicht übersetzt, weil die Website von nur einer Person mit begrenzter Zeit gepflegt wird."
        },
        patchnotes: {
          entries: {
            v120: {
              title: "Sehr kleiner Fehlerbehebungs-Release",
              summary: "• Das Laden des Befehlsmenüs wurde korrigiert.\n• Die Reihenfolge der Patchnotes wurde von älter nach neuer korrigiert."
            },
            v111: {
              title: "Feinschliff",
              summary: "• Ein Reiter für Befehle wurde ergänzt.\n• Ein Bereich für sonstige Infos wurde ergänzt.\n• Zurück-zum-Menü-Buttons wurden im gesamten Webauftritt ergänzt.\n• Der Bereich Fractured Underworld wurde ergänzt, obwohl er sich noch in frühen Entwicklungsstadien befindet.\n• Die Arbeit an Tower Defense wurde begonnen.\n• Ein kurzer Hinweis auf der Willkommensseite wurde ergänzt.\n• Ein Wegpunktfehler wurde korrigiert.\n• Ein UI-Fehler wurde korrigiert."
            },
            v100: {
              title: "Vollversion",
              summary: "• Stock 3 und verfügbare Waypoints wurden ergänzt.\n• Die Hauptquest-Infos für die Stöcke 1 bis 3 fehlen noch.\n• Einige Waypoints auf Stock 3 funktionieren bewusst nicht, weil noch zu wenig Informationen vorhanden sind.\n• Der Code der Website wurde optimiert.\n• Das Equipment-Compendium wurde fertiggestellt.\n• Die meisten Buttons sind nun alphabetisch sortiert.\n• Die Website-Oberfläche wurde aktualisiert und verbessert.\n• Die Startseite wurde neu gestaltet.\n• Buttons zu Discord von SAO MC, Support und meinem Profil wurden ergänzt.\n• Kontaktiere mich über Discord für Vorschläge oder Fehlerberichte."
            },
            v010: {
              title: "Webseiten-Release",
              summary: "Erstveröffentlichung der Webseite. Stock 1, Nebenquest-Orte, Biome, Dungeons, das Quest-Menü und das Bestiary-Menü wurden ergänzt."
            },
            v020: {
              title: "Neue Karten",
              summary: "Stock 2, wichtige POI-Waypoints für Stock 1 und 2, Waypoint-Interaktionen, die das Bestiary oder Quest-Menü öffnen, sowie der Hauptmenübildschirm wurden ergänzt."
            }
          },
          tags: {
            bugFixes: "Fehlerbehebungen",
            commands: "Befehle",
            maps: "Karten",
            release: "Release",
            miscInfo: "Sonstige Infos",
            fracturedUnderworld: "Fractured Underworld",
            towerDefense: "Tower Defense",
            welcomeMat: "Willkommensseite",
            floor3: "Stock 3",
            equipment: "Ausrüstung",
            ui: "UI",
            discord: "Discord",
            contact: "Kontakt",
            floor1: "Stock 1",
            quests: "Quests",
            biomes: "Biome",
            dungeons: "Dungeons",
            bestiary: "Bestiarium",
            floor2: "Stock 2",
            poi: "POI",
            waypoints: "Waypoints",
            mainMenu: "Hauptmenü"
          }
        },
        towerdefense: {
          arc1Title: "Arc 1 - Tutorial (Boar Planes)",
          arc1Rewards: "Beutel mit 100 Col (100 %), Utility-Kristall (25 %), Minor-PvE-Rune (8 %), Dungeon-Schlüssel (4 %), Farn (Habitat-Item) (30 %), Frostlampe (Habitat-Item) (20 %), Lagerfeuer (Habitat-Item) (20 %)",
          arc1Waves: "5 Wellen, in der fünften Welle erscheint ein reskinnter Pumba als Boss.",
          arc2Title: "Arc 2 - Mittel (Boar-Zonen)",
          arc2Rewards: "500-Col-Beutel (100 %), Utility-Kristall (40 %), Minor-PvE-Rune (18 %), Dungeon-Schlüssel (12 %), Farn (Habitat) (30 %), Heuballen (Habitat) (20 %)",
          arc2Waves: "6 Wellen, in der sechsten Welle erscheint ein reskinnter Pumba als Boss.",
          shopItems: {
            mageSkeleton: {
              name: "Magier-Skelett",
              unlockRequirement: "5 Magierrollen",
              invocationCost: "Invokationskosten: 200",
              levelOne: "Stufe 1: 1,1 Angriffsgeschwindigkeit, 7 Reichweite, 5 Schaden",
              progression: {
                one: "Stufe 1 -> 2: +.1 Angriffsgeschwindigkeit, +2 Reichweite, +2 Schaden (1,2 Angriffsgeschwindigkeit, 9 Reichweite, 7 Schaden)",
                two: "Stufe 2 -> 3: +.2 Angriffsgeschwindigkeit, +2 Reichweite, +2 Schaden (1,4 Angriffsgeschwindigkeit, 11 Reichweite, 9 Schaden)",
                three: "Stufe 3 -> 4: +.3 Angriffsgeschwindigkeit, +2 Reichweite, +3 Schaden (1,7 Angriffsgeschwindigkeit, 13 Reichweite, 12 Schaden)",
                four: "Stufe 4 -> 5 (Max): +.3 Angriffsgeschwindigkeit, +2 Reichweite, +3 Schaden (2 Angriffsgeschwindigkeit, 15 Reichweite, 15 Schaden)"
              },
              upgradeCosts: "Upgrade-Kosten: Stufe 2 80, Stufe 3 150, Stufe 4 250, Stufe 5 400"
            },
            archerSkeleton: {
              name: "Bogenschützen-Skelett",
              unlockRequirement: "5 Bogenschützenrollen",
              invocationCost: "Invokationskosten: 150",
              levelOne: "Stufe 1: .4 Angriffsgeschwindigkeit, 10 Reichweite, 6 Schaden",
              progression: {
                one: "Stufe 1 -> 2: +.1 Angriffsgeschwindigkeit, +3 Reichweite, +3 Schaden (0,5 Angriffsgeschwindigkeit, 13 Reichweite, 9 Schaden)",
                two: "Stufe 2 -> 3: +3 Reichweite, +4 Schaden (0,5 Angriffsgeschwindigkeit, 16 Reichweite, 13 Schaden)",
                three: "Stufe 3 -> 4: N/V (N/V)",
                four: "Stufe 4 -> 5: N/V (N/V)"
              },
              upgradeCosts: "Upgrade-Kosten: Stufe 2 80, Stufe 3 150, Stufe 4 250, Stufe 5 400"
            },
            swordsmanSkeleton: {
              name: "Schwertkämpfer-Skelett",
              unlockRequirement: "5 Schwertkämpferrollen",
              invocationCost: "Invokationskosten: 100",
              levelOne: "Stufe 1: .7 Angriffsgeschwindigkeit, 4 Reichweite, 8 Schaden",
              progression: {
                one: "Stufe 1 -> 2: +4 Schaden (.7 Angriffsgeschwindigkeit, 4 Reichweite, 12 Schaden)",
                two: "Stufe 2 -> 3: +.1 Angriffsgeschwindigkeit, +1 Reichweite, +5 Schaden (.8 Angriffsgeschwindigkeit, 5 Reichweite, 17 Schaden)",
                three: "Stufe 3 -> 4: +7 Schaden (.8 Angriffsgeschwindigkeit, 5 Reichweite, 24 Schaden)",
                four: "Stufe 4 -> 5 (Max): +.1 Angriffsgeschwindigkeit, +1 Reichweite, +8 Schaden"
              },
              upgradeCosts: "Upgrade-Kosten: Stufe 2 80, Stufe 3 150, Stufe 4 250, Stufe 5 400"
            }
          }
        }
      }
    },
    fr: {
      ui: {
        nav: {
          sectionAria: "Navigation de section",
          primaryAria: "Navigation principale",
          mapNavAria: "Navigation de la carte"
        },
        pageNotice: "Une grande partie de ce site web n'a pas encore été traduite. Ce projet est maintenu par un développeur solo, donc traduire chaque page prend beaucoup de temps.",
        walkthrough: {
          title: "Visite guidée rapide",
          skip: "Passer",
          back: "Retour",
          next: "Suivant",
          finish: "Terminer",
          step: "Étape {current} sur {total}",
          welcomeTitle: "Bienvenue",
          welcomeBody: "Ceci est la page d'accueil. Utilise cette page pour choisir quel module SAO MC ouvrir.",
          modeCardsTitle: "Cartes de modes",
          modeCardsBody: "Choisis Aincrad ou Fractured Underworld pour lancer un module. La carte GGO est actuellement verrouillée jusqu'à sa sortie.",
          discordTitle: "Raccourcis Discord",
          discordBody: "Ouvre des liens rapides vers le profil du créateur, le Discord SAO MC et le serveur d'assistance.",
          settingsTitle: "Paramètres",
          settingsBody: "Utilise la roue pour changer de langue et rejouer cette visite guidée quand tu veux."
        }
      },
      page: {
        maps: {
          walkthrough: {
            step1Title: "Navigation",
            step1Body: "Utilise cette ligne du haut pour passer entre Cartes, Bestiaire, Équipement, Quêtes, Commandes et le Menu.",
            step2Title: "Contrôles de carte",
            step2Body: "Choisis l'étage, active le mode souterrain, utilise la recherche et réinitialise rapidement les filtres depuis ici.",
            step3Title: "Filtres",
            step3Body: "Active les catégories pour afficher les marqueurs. Les filtres actifs restent mis en surbrillance pour que tu voies clairement ce qui est activé.",
            step4Title: "Carte interactive",
            step4Body: "Fais glisser pour déplacer et utilise la molette pour zoomer. Sélectionne un marqueur pour ouvrir les détails et les raccourcis dans le panneau d'informations."
          }
        },
        bestiary: {
          title: "Bestiaire de Aincrad",
          heading: "Bestiaire",
          tablistAria: "Catégories du bestiaire",
          searchLabel: "Rechercher des mobs",
          searchPlaceholder: "Rechercher par nom...",
          listTitleRegular: "Liste des mobs réguliers",
          listTitleBoss: "Liste des boss",
          listTitleDungeonBoss: "Liste des boss de donjon",
          listTitleDungeonMobs: "Liste des mobs de donjon",
          statusShown: "{visible} sur {total} mobs affichés.",
          emptyCategory: "Aucune entrée pour {category} pour le moment.",
          drops: "Butins",
          aggressiveness: "Agressivité",
          aggressive: "Agressif",
          neutral: "Neutre",
          passive: "Passif",
          xp: "XP",
          na: "N/A",
          loadError: "Les données du bestiaire n'ont pas pu être chargées. Actualise la page et réessaie.",
          loadUnavailable: "Les données du bestiaire ne sont actuellement pas disponibles.",
          notice: "La majeure partie du contenu de cette page n'est pas encore traduite, car le site est géré par une seule personne avec peu de temps."
        },
        commands: {
          title: "Guide des commandes d'Aincrad",
          heading: "Commandes",
          tablistAria: "Catégories de commandes",
          searchLabel: "Rechercher des commandes",
          searchPlaceholder: "Rechercher par commande, usage ou exemple...",
          emptyState: "Aucune commande ne correspond à vos filtres actuels.",
          colCommand: "Commande",
          colUsage: "Usage",
          colExample: "Exemple",
          statusShown: "{count} commande{suffix} affichée{suffix} dans {category}.",
          categories: {
            communication: "Communication",
            cosmetics: "Cosmétique et apparence",
            dungeons: "Donjons",
            economy: "Économie",
            gameplay: "Gameplay et progression",
            information: "Information",
            media: "Médias et audio",
            navigation: "Navigation",
            useless: "Commandes inutiles"
          },
          loadError: "Les commandes n'ont pas pu être chargées pour le moment. Actualise la page et réessaie.",
          loadUnavailable: "Les commandes ne sont actuellement pas disponibles.",
          notice: "La majeure partie du contenu de cette page n'est pas encore traduite, car le site est géré par une seule personne avec peu de temps."
        },
        ecompendium: {
          title: "Compendium d'équipement d'Aincrad",
          heading: "Compendium d'équipement",
          searchLabel: "Rechercher",
          searchPlaceholder: "Rechercher un équipement...",
          noEntriesFound: "Aucune entrée trouvée.",
          statusShown: "Affichage de {visible} sur {total} entrées.",
          listTitles: {
            weapon: "Armes",
            armor: "Armures",
            accessory: "Accessoires",
            rune: "Runes",
            tool: "Outils",
            food: "Nourriture",
            consumable: "Consommables",
            material: "Matériaux",
            quest_item: "Objets de quête",
            resource: "Ressources",
            dungeon: "Donjons",
            currency: "Monnaie"
          },
          labels: {
            rarity: "Rareté",
            level: "Niveau",
            set: "Set",
            craftedAt: "Fabriqué à",
            description: "Description",
            statistics: "Statistiques",
            source: "Source",
            resources: "Ressources"
          },
          unknownItem: "Objet inconnu",
          unknown: "Inconnu",
          loadError: "Les données d'équipement n'ont pas pu être chargées. Actualise la page et réessaie.",
          loadUnavailable: "Les données d'équipement ne sont actuellement pas disponibles.",
          notice: "La majeure partie du contenu de cette page n'est pas encore traduite, car le site est géré par une seule personne avec peu de temps."
        },
        quests: {
          title: "Guide des quêtes d'Aincrad",
          heading: "Quêtes",
          logoAria: "Logo des quêtes",
          searchLabel: "Rechercher des quêtes",
          searchPlaceholder: "Rechercher dans n'importe quelle colonne...",
          tableCols: {
            npcName: "Nom du PNJ",
            city: "Ville",
            coordinates: "Coordonnées",
            requirements: "Exigences / ressources",
            questName: "Nom de la quête",
            xpReward: "XP",
            colReward: "Col",
            bonusItems: "Objets bonus",
            completed: "Terminé"
          },
          markCompleted: "Marquer comme terminé",
          completed: "Terminé",
          titleWithFloor: "Quêtes - {floor}",
          noQuestData: "Aucune donnée de quête n'a encore été ajoutée pour {floor}.",
          noQuestMatchFloor: "Aucune entrée de quête ne correspond à ta recherche sur {floor}. {completed} terminé.",
          shownStatus: "{visible} sur {total} entrées de quête affichées pour {floor} || {completed} terminé.",
          noQuestMatch: "Aucune entrée de quête ne correspond à ta recherche actuelle.",
          loadedStatus: "{count} entrées de quête chargées pour {floor}.",
          loadError: "Les données des quêtes n'ont pas pu être chargées. Actualise la page et réessaie.",
          loadUnavailable: "Les données des quêtes ne sont actuellement pas disponibles.",
          notice: "La majeure partie du contenu de cette page n'est pas encore traduite, car le site est géré par une seule personne avec peu de temps."
        },
        patchnotes: {
          title: "Notes de patch et journal des modifications SAO MC",
          heading: "Notes de patch",
          searchLabel: "Rechercher des notes",
          searchPlaceholder: "Filtrer par version, élément ou mise à jour",
          noMatches: "Aucune note de patch ne correspond à ce filtre.",
          noEntries: "Aucune entrée de journal correspondant n'a été trouvée.",
          statusShowing: "Affichage de {count} note de patch{suffix}.",
          loadError: "Les notes de patch n'ont pas pu être chargées. Actualise la page et réessaie.",
          loadUnavailable: "Les notes de patch ne sont actuellement pas disponibles.",
          translationNotice: "La majeure partie du contenu de cette page n'est pas encore traduite, car le site est géré par une seule personne avec peu de temps.",
          notice: "La majeure partie du contenu de cette page n'est pas encore traduite, car le site est géré par une seule personne avec peu de temps."
        },
        maps: {
          categories: {
            biomes: "Biomes",
            bossSpawns: "Apparitions de boss",
            dungeons: "Donjons",
            farmingSpots: "Zones de récolte",
            mobAreas: "Zones de mobs",
            sideQuests: "Quêtes annexes",
            alchemist: "Alchimiste",
            lumberjack: "Bûcheron",
            accessoriesMerchants: "Marchand d'accessoires",
            consumablesMerchants: "Marchand de consommables",
            equipmentMerchants: "Marchand d'équipement",
            lootBuyers: "Acheteurs de butin",
            occultMerchants: "Marchand occulte",
            toolMerchants: "Marchand d'outils",
            travelingMerchants: "Marchands ambulants",
            weaponSellers: "Vendeurs d'armes",
            accessoriesBlacksmith: "Forgeron d'accessoires",
            armorBlacksmith: "Forgeron d'armures",
            ingotBlacksmith: "Forgeron de lingots",
            keyBlacksmith: "Forgeron de clés",
            refaire: "Refaire",
            runeCraftsmen: "Artisans de runes",
            weaponsmith: "Forgeron d'armes"
          },
          floorOptions: {
            floor1: "Étage 1 - La ville du début",
            floor2: "Étage 2 - Désert aride",
            floor3: "Étage 3 - La forêt errante"
          },
          categoryMainTitle: "Catégorie : Principal",
          categoryQuestsTitle: "Catégorie : Quêtes",
          categoryJourneymenTitle: "Catégorie : Artisans",
          categoryMarketTitle: "Catégorie : Marché",
          categoryCraftsmenTitle: "Catégorie : Artisans",
          walkthrough: {
            step1Title: "Navigation",
            step1Body: "Utilise cette ligne du haut pour passer entre Cartes, Bestiaire, Équipement, Quêtes, Commandes et le Menu.",
            step2Title: "Contrôles de carte",
            step2Body: "Choisis l'étage, active le mode souterrain, utilise la recherche et réinitialise rapidement les filtres depuis ici.",
            step3Title: "Filtres",
            step3Body: "Active les catégories pour afficher les marqueurs. Les filtres actifs restent mis en surbrillance pour que tu voies clairement ce qui est activé.",
            step4Title: "Carte interactive",
            step4Body: "Fais glisser pour déplacer et utilise la molette pour zoomer. Sélectionne un marqueur pour ouvrir les détails et les raccourcis dans le panneau d'informations."
          },
          runtimeError: "La carte n'a pas pu être chargée pour le moment. Actualise la page et réessaie.",
          runtimeTitle: "Carte indisponible",
          coordinatesPlaceholder: "X : -- Z : --"
        },
        mainui: {
          categories: {
            npc: "PNJ",
            rulid: "Apparition de blé",
            fishingSpot: "Zone de pêche",
            oakWood: "Bois de chêne",
            copper: "Cuivre",
            iron: "Fer",
            coal: "Charbon"
          },
          categoryMainTitle: "Catégorie : Principal",
          clearFilters: "Effacer les filtres",
          islandOptions: {
            playerIsland: "Île du joueur",
            gigasCedar: "Gigas Cedar",
            iceCave: "Grotte de glace",
            rulid: "Rulid",
            fishingIsland: "Île de pêche"
          },
          walkthrough: {
            step1Title: "Navigation",
            step1Body: "Utilise cette ligne du haut pour ouvrir Tower Defense ou revenir au menu principal.",
            step2Title: "Contrôles de l'île",
            step2Body: "Change d'île, active le mode souterrain, recherche des marqueurs et réinitialise rapidement les filtres.",
            step3Title: "Filtres",
            step3Body: "Active des catégories pour afficher les marqueurs correspondants. Les filtres désactivés se cachent automatiquement lorsqu'ils ne sont pas valides pour l'île sélectionnée.",
            step4Title: "Carte interactive",
            step4Body: "Fais glisser pour déplacer, utilise la molette pour zoomer et sélectionne un marqueur pour ouvrir les détails dans le panneau latéral."
          },
          runtimeError: "La carte n'a pas pu être chargée pour le moment. Actualise la page et réessaie.",
          runtimeTitle: "Carte indisponible",
          coordinatesPlaceholder: "X : -- Z : --",
          notice: "La majeure partie du contenu de cette page n'est pas encore traduite, car le site est géré par une seule personne avec peu de temps."
        },
        miscinfo: {
          title: "Infos diverses",
          heading: "Infos diverses",
          back: "Retour au menu",
          playerLevels: "Niveaux du joueur",
          playerLevelsDetails: "Niveau 1 -> 2 : 150 XP\nNiveau 2 -> 3 : 300 XP\nNiveau 3 -> 4 : 600 XP\nNiveau 4 -> 5 : 1 350 XP\nNiveau 5 -> 6 : 2 700 XP\nNiveau 6 -> 7 : 5 100 XP\nNiveau 7 -> 8 : 9 000 XP\nNiveau 8 -> 9 : 15 000 XP\nNiveau 9 -> 10 : 24 000 XP",
          translationNotice: "La majeure partie du contenu de cette page n'est pas encore traduite, car le site est géré par une seule personne avec peu de temps."
        },
        patchnotes: {
          entries: {
            v120: {
              title: "Correctif très mineur",
              summary: "• Le chargement du menu des commandes a été corrigé.\n• L'ordre des notes de patch a été corrigé du plus ancien au plus récent."
            },
            v111: {
              title: "Finitions",
              summary: "• Un onglet commandes a été ajouté.\n• Une section Infos diverses a été ajoutée.\n• Des boutons Retour au menu ont été ajoutés partout sur le site.\n• La section Fractured Underworld a été ajoutée, bien qu'elle soit encore au début de son développement.\n• Le travail sur Tower Defense a commencé.\n• Une courte notice a été ajoutée sur la page d'accueil.\n• Un bug de waypoint a été corrigé.\n• Un bug d'interface a été corrigé."
            },
            v100: {
              title: "Version complète",
              summary: "• L'étage 3 et ses waypoints disponibles ont été ajoutés.\n• Les informations de quête principale pour les étages 1 à 3 manquent encore.\n• Certains waypoints de l'étage 3 ne fonctionnent pas volontairement à cause d'un manque d'informations.\n• Le code du site a été optimisé.\n• Le compendium d'équipement a été terminé.\n• La plupart des boutons sont maintenant triés par ordre alphabétique.\n• L'interface du site a été mise à jour et améliorée.\n• La page d'accueil a été repensée.\n• Des boutons vers le Discord SAO MC, le support et mon profil personnel ont été ajoutés.\n• Contacte-moi sur Discord pour des suggestions ou des rapports de bugs."
            },
            v010: {
              title: "Version du site",
              summary: "Lancement initial du site. L'étage 1, les lieux de quêtes annexes, les biomes, les donjons, le menu des quêtes et le menu du bestiaire ont été ajoutés."
            },
            v020: {
              title: "Nouvelles cartes",
              summary: "L'étage 2, les principaux waypoints POI des étages 1 et 2, les interactions de waypoints qui ouvrent le bestiaire ou le menu des quêtes, ainsi que l'écran du menu principal ont été ajoutés."
            }
          },
          tags: {
            bugFixes: "Corrections",
            commands: "Commandes",
            maps: "Cartes",
            release: "Version",
            miscInfo: "Infos diverses",
            fracturedUnderworld: "Fractured Underworld",
            towerDefense: "Tower Defense",
            welcomeMat: "Page d'accueil",
            floor3: "Étage 3",
            equipment: "Équipement",
            ui: "Interface",
            discord: "Discord",
            contact: "Contact",
            floor1: "Étage 1",
            quests: "Quêtes",
            biomes: "Biomes",
            dungeons: "Donjons",
            bestiary: "Bestiaire",
            floor2: "Étage 2",
            poi: "POI",
            waypoints: "Waypoints",
            mainMenu: "Menu principal"
          }
        },
        towerdefense: {
          notice: "La majeure partie du contenu de cette page n'est pas encore traduite, car le site est géré par une seule personne avec peu de temps.",
          arc1Title: "Arc 1 - Tutoriel (Boar Planes)",
          arc1Rewards: "Pochon de 100 Col (100 %), Cristal d'utilité (25 %), Rune PvE mineure (8 %), Clé de donjon (4 %), Fougère (objet d'habitat) (30 %), Lanterne givrée (objet d'habitat) (20 %), Feu de camp (objet d'habitat) (20 %)",
          arc1Waves: "5 vagues, à la cinquième une version reskin du pumba apparaît comme boss.",
          arc2Title: "Arc 2 - Moyen (Boar Zones)",
          arc2Rewards: "Bourse de 500 Col (100 %), Cristal d'utilité (40 %), Rune PvE mineure (18 %), Clé de donjon (12 %), Fougère (habitat) (30 %), Botte de foin (habitat) (20 %)",
          arc2Waves: "6 vagues, à la sixième une version reskin du pumba apparaît comme boss.",
          shopItems: {
            mageSkeleton: {
              name: "Squelette mage",
              unlockRequirement: "5 parchemins de mage",
              invocationCost: "Coût d'invocation : 200",
              levelOne: "Niveau 1 : 1,1 vitesse d'attaque, 7 portée, 5 dégâts",
              progression: {
                one: "Niveau 1 -> 2 : +.1 vitesse d'attaque, +2 portée, +2 dégâts (1,2 vitesse d'attaque, 9 portée, 7 dégâts)",
                two: "Niveau 2 -> 3 : +.2 vitesse d'attaque, +2 portée, +2 dégâts (1,4 vitesse d'attaque, 11 portée, 9 dégâts)",
                three: "Niveau 3 -> 4 : +.3 vitesse d'attaque, +2 portée, +3 dégâts (1,7 vitesse d'attaque, 13 portée, 12 dégâts)",
                four: "Niveau 4 -> 5 (max) : +.3 vitesse d'attaque, +2 portée, +3 dégâts (2 vitesse d'attaque, 15 portée, 15 dégâts)"
              },
              upgradeCosts: "Coût d'amélioration : Nv2 80, Nv3 150, Nv4 250, Nv5 400"
            },
            archerSkeleton: {
              name: "Squelette archer",
              unlockRequirement: "5 parchemins d'archer",
              invocationCost: "Coût d'invocation : 150",
              levelOne: "Niveau 1 : .4 vitesse d'attaque, 10 portée, 6 dégâts",
              progression: {
                one: "Niveau 1 -> 2 : +.1 vitesse d'attaque, +3 portée, +3 dégâts (0,5 vitesse d'attaque, 13 portée, 9 dégâts)",
                two: "Niveau 2 -> 3 : +3 portée, +4 dégâts (0,5 vitesse d'attaque, 16 portée, 13 dégâts)",
                three: "Niveau 3 -> 4 : N/A (N/A)",
                four: "Niveau 4 -> 5 : N/A (N/A)"
              },
              upgradeCosts: "Coût d'amélioration : Nv2 80, Nv3 150, Nv4 250, Nv5 400"
            },
            swordsmanSkeleton: {
              name: "Squelette épéiste",
              unlockRequirement: "5 parchemins d'épéiste",
              invocationCost: "Coût d'invocation : 100",
              levelOne: "Niveau 1 : .7 vitesse d'attaque, 4 portée, 8 dégâts",
              progression: {
                one: "Niveau 1 -> 2 : +4 dégâts (.7 vitesse d'attaque, 4 portée, 12 dégâts)",
                two: "Niveau 2 -> 3 : +.1 vitesse d'attaque, +1 portée, +5 dégâts (.8 vitesse d'attaque, 5 portée, 17 dégâts)",
                three: "Niveau 3 -> 4 : +7 dégâts (.8 vitesse d'attaque, 5 portée, 24 dégâts)",
                four: "Niveau 4 -> 5 (max) : +.1 vitesse d'attaque, +1 portée, +8 dégâts"
              },
              upgradeCosts: "Coût d'amélioration : Nv2 80, Nv3 150, Nv4 250, Nv5 400"
            }
          }
        }
      }
    }
  };

  Object.entries(translationAdditions).forEach(([language, additions]) => {
    translations[language] = deepMerge(translations[language] || {}, additions);
  });

  function getSettings() {
    const stored = storage.getJSON(SETTINGS_STORAGE_KEY, null);
    const defaultSettings = {
      language: DEFAULT_LANGUAGE,
      theme: "system",
      animations: "default",
      accessibility: "default",
      fontSize: "default",
      notifications: "default"
    };

    const merged = Object.assign({}, defaultSettings, stored && typeof stored === "object" ? stored : {});
    if (!SUPPORTED_LANGUAGES.includes(merged.language)) {
      merged.language = DEFAULT_LANGUAGE;
    }
    return merged;
  }

  let settingsState = getSettings();
  const subscribers = new Set();
  const missingKeyWarned = new Set();

  function saveSettings(nextSettings) {
    settingsState = Object.assign({}, settingsState, nextSettings || {});
    if (!SUPPORTED_LANGUAGES.includes(settingsState.language)) {
      settingsState.language = DEFAULT_LANGUAGE;
    }
    storage.setJSON(SETTINGS_STORAGE_KEY, settingsState);
    subscribers.forEach(listener => {
      try {
        listener(settingsState);
      } catch {
        // Ignore listener failures.
      }
    });
  }

  function getLanguage() {
    return settingsState.language;
  }

  function getBundle(language) {
    return translations[language] || translations[DEFAULT_LANGUAGE];
  }

  function lookup(bundle, key) {
    const normalizedKey = String(key || "");
    const keyPath = normalizedKey.split(".");
    let value = keyPath.reduce((result, part) => (result && Object.prototype.hasOwnProperty.call(result, part) ? result[part] : undefined), bundle);

    if (value === undefined && normalizedKey.endsWith(".translationNotice")) {
      const noticeKey = normalizedKey.replace(/\.translationNotice$/, ".notice");
      value = noticeKey
        .split(".")
        .reduce((result, part) => (result && Object.prototype.hasOwnProperty.call(result, part) ? result[part] : undefined), bundle);
    }

    return value;
  }

  function formatTemplate(template, params) {
    return String(template || "").replace(/\{([a-zA-Z0-9_]+)\}/g, (_match, token) => {
      if (params && Object.prototype.hasOwnProperty.call(params, token)) {
        return String(params[token]);
      }
      return `{${token}}`;
    });
  }

  function t(key, params) {
    const activeLang = getLanguage();
    const activeBundle = getBundle(activeLang);
    const fallbackBundle = getBundle(DEFAULT_LANGUAGE);

    let value = lookup(activeBundle, key);
    if (value === undefined) {
      value = lookup(fallbackBundle, key);
      if (value === undefined) {
        if (!missingKeyWarned.has(key)) {
          missingKeyWarned.add(key);
          console.warn(`Missing translation key: ${key}`);
        }
        return key;
      }
    }

    if (typeof value === "string") {
      return formatTemplate(value, params || null);
    }

    return value;
  }

  function injectPageNotice() {
    const body = document.body;
    if (!body) return;

    injectSettingsStyles();

    const existingNotice = document.getElementById("sao-page-notice");
    const showNotice = isDoormatPage() && getLanguage() !== DEFAULT_LANGUAGE;

    if (!showNotice) {
      existingNotice?.remove();
      return;
    }

    if (!existingNotice) {
      const notice = document.createElement("aside");
      notice.id = "sao-page-notice";
      notice.className = "sao-page-notice";
      notice.setAttribute("role", "status");
      notice.setAttribute("aria-live", "polite");
      body.appendChild(notice);
    }

    document.getElementById("sao-page-notice").textContent = t("ui.pageNotice");
  }

  function applyTranslations(root) {
    const scope = root || document;

    scope.querySelectorAll("[data-i18n]").forEach(node => {
      const key = node.getAttribute("data-i18n");
      if (!key) return;
      node.textContent = t(key);
    });

    scope.querySelectorAll("[data-i18n-placeholder]").forEach(node => {
      const key = node.getAttribute("data-i18n-placeholder");
      if (!key) return;
      node.setAttribute("placeholder", t(key));
    });

    scope.querySelectorAll("[data-i18n-title]").forEach(node => {
      const key = node.getAttribute("data-i18n-title");
      if (!key) return;
      node.setAttribute("title", t(key));
    });

    scope.querySelectorAll("[data-i18n-aria-label]").forEach(node => {
      const key = node.getAttribute("data-i18n-aria-label");
      if (!key) return;
      node.setAttribute("aria-label", t(key));
    });

    const titleNode = document.querySelector("title[data-i18n]");
    if (titleNode) {
      const key = titleNode.getAttribute("data-i18n");
      if (key) {
        titleNode.textContent = t(key);
      }
    }

    injectPageNotice();
    document.documentElement.lang = getLanguage();
  }

  function onSettingsChange(listener) {
    if (typeof listener !== "function") return () => {};
    subscribers.add(listener);
    return () => subscribers.delete(listener);
  }

  function setLanguage(nextLanguage) {
    if (!SUPPORTED_LANGUAGES.includes(nextLanguage)) return;
    if (nextLanguage === settingsState.language) return;
    saveSettings({ language: nextLanguage });
    applyTranslations(document);
    document.dispatchEvent(new CustomEvent("sao:languagechange", {
      detail: { language: settingsState.language }
    }));
  }

  function injectSettingsStyles() {
    if (document.getElementById("sao-settings-style")) return;

    const style = document.createElement("style");
    style.id = "sao-settings-style";
    style.textContent = `
      .sao-settings-anchor {
        position: fixed;
        top: calc(14px + env(safe-area-inset-top));
        left: calc(14px + env(safe-area-inset-left));
        z-index: 90;
      }
      .sao-settings-trigger {
        width: 44px;
        height: 44px;
        border-radius: 999px;
        border: 1px solid rgba(115, 185, 255, 0.8);
        background: rgba(9, 16, 28, 0.9);
        color: #73b9ff;
        display: grid;
        place-items: center;
        cursor: pointer;
        box-shadow: 0 10px 24px rgba(0, 0, 0, 0.28), inset 0 0 0 1px rgba(115, 185, 255, 0.18);
        transition: transform 0.16s ease, background 0.16s ease, border-color 0.16s ease;
      }
      .sao-settings-trigger:hover {
        transform: translateY(-1px) rotate(4deg);
        background: rgba(13, 22, 36, 0.96);
      }
      .sao-settings-trigger:active {
        transform: scale(0.97);
      }
      .sao-settings-trigger:focus-visible {
        outline: 2px solid #8bb7ff;
        outline-offset: 2px;
      }
      .sao-settings-trigger svg {
        width: 22px;
        height: 22px;
        display: block;
      }
      .sao-page-notice {
        position: fixed;
        top: calc(8px + env(safe-area-inset-top));
        right: calc(8px + env(safe-area-inset-right));
        z-index: 85;
        max-width: min(320px, calc(100vw - 16px));
        padding: 6px 8px;
        border-radius: 14px;
        border: 1px solid rgba(115, 185, 255, 0.28);
        background: rgba(9, 16, 28, 0.96);
        color: #f4f7ff;
        font-size: 0.82rem;
        line-height: 1.45;
        box-shadow: 0 16px 40px rgba(0, 0, 0, 0.3);
        pointer-events: none;
      }
      .sao-settings-menu {
        position: absolute;
        top: calc(100% + 10px);
        left: 0;
        width: min(320px, calc(100vw - 28px));
        box-sizing: border-box;
        max-height: calc(100dvh - 36px - env(safe-area-inset-top) - env(safe-area-inset-bottom));
        overflow: auto;
        border-radius: 16px;
        border: 1px solid rgba(115, 185, 255, 0.3);
        background: linear-gradient(180deg, rgba(13, 21, 35, 0.98), rgba(8, 14, 24, 0.98));
        color: #eaf2ff;
        padding: 14px;
        box-shadow: 0 24px 60px rgba(0, 0, 0, 0.4);
        opacity: 0;
        transform: translateY(-6px) scale(0.98);
        pointer-events: none;
        transition: opacity 0.18s ease, transform 0.18s ease;
      }
      .sao-settings-menu.open {
        opacity: 1;
        transform: translateY(0) scale(1);
        pointer-events: auto;
      }
      .sao-settings-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 10px;
      }
      .sao-settings-title {
        margin: 0;
        font-size: 1rem;
      }
      .sao-settings-subtitle {
        margin: 6px 0 12px;
        color: #b8c9dc;
        font-size: 0.86rem;
        line-height: 1.4;
      }
      .sao-settings-close {
        border: 1px solid rgba(136, 183, 255, 0.3);
        border-radius: 10px;
        background: rgba(12, 18, 30, 0.9);
        color: #deebff;
        width: 36px;
        height: 36px;
        display: grid;
        place-items: center;
        cursor: pointer;
        transition: border-color 0.16s ease, background 0.16s ease, transform 0.16s ease;
      }
      .sao-settings-close:hover {
        border-color: #73b9ff;
        background: rgba(22, 34, 52, 0.96);
      }
      .sao-settings-close:active {
        transform: scale(0.97);
      }
      .sao-settings-close:focus-visible {
        outline: 2px solid #8bb7ff;
        outline-offset: 2px;
      }
      .sao-settings-section {
        border: 1px solid rgba(115, 185, 255, 0.2);
        border-radius: 12px;
        padding: 10px;
        background: rgba(8, 14, 24, 0.65);
      }
      .sao-settings-label {
        font-size: 0.82rem;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: #b8c9dc;
        margin-bottom: 8px;
      }
      .sao-settings-hint {
        margin: 8px 0 0;
        font-size: 0.78rem;
        color: #9db4cc;
      }
      .sao-settings-actions {
        margin-top: 10px;
      }
      .sao-settings-action-button {
        width: 100%;
        border: 1px solid rgba(129, 178, 255, 0.26);
        border-radius: 10px;
        background: rgba(15, 23, 36, 0.84);
        color: #eef4ff;
        font-size: 0.84rem;
        padding: 8px 10px;
        text-align: left;
        cursor: pointer;
        min-height: 36px;
        transition: border-color 0.16s ease, background 0.16s ease, transform 0.16s ease;
      }
      .sao-settings-action-button:hover {
        border-color: #73b9ff;
        background: rgba(26, 44, 70, 0.95);
      }
      .sao-settings-action-button:active {
        transform: scale(0.98);
      }
      .sao-settings-action-button:focus-visible {
        outline: 2px solid #8bb7ff;
        outline-offset: 2px;
      }
      .sao-language-options {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 8px;
      }
      .sao-language-option {
        border: 1px solid rgba(129, 178, 255, 0.26);
        border-radius: 10px;
        background: rgba(15, 23, 36, 0.84);
        color: #eef4ff;
        font-size: 0.84rem;
        padding: 8px 10px;
        text-align: left;
        cursor: pointer;
        min-height: 36px;
        transition: border-color 0.16s ease, background 0.16s ease, transform 0.16s ease;
      }
      .sao-language-option:hover {
        border-color: #73b9ff;
        background: rgba(26, 44, 70, 0.95);
      }
      .sao-language-option:active {
        transform: scale(0.98);
      }
      .sao-language-option[aria-pressed="true"] {
        border-color: #73b9ff;
        background: rgba(26, 44, 70, 0.95);
      }
      .sao-language-option:focus-visible {
        outline: 2px solid #8bb7ff;
        outline-offset: 2px;
      }
      @media (max-width: 520px) {
        .sao-settings-anchor {
          top: calc(10px + env(safe-area-inset-top));
          left: calc(10px + env(safe-area-inset-left));
        }
        .sao-page-notice {
          top: calc(6px + env(safe-area-inset-top));
          right: calc(6px + env(safe-area-inset-right));
          max-width: calc(100vw - 12px);
          padding: 5px 7px;
        }
        .sao-settings-menu {
          width: calc(100vw - 20px);
        }
      }

      @media (max-height: 560px) {
        .sao-settings-menu {
          max-height: calc(100dvh - 20px - env(safe-area-inset-top) - env(safe-area-inset-bottom));
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .sao-settings-trigger,
        .sao-settings-menu,
        .sao-settings-close,
        .sao-settings-action-button,
        .sao-language-option {
          transition: none;
        }

        .sao-settings-trigger:hover,
        .sao-settings-action-button:hover,
        .sao-language-option:hover {
          transform: none;
        }
      }
    `;

    document.head.appendChild(style);
  }

  function resetWalkthroughProgress() {
    WALKTHROUGH_PROGRESS_KEYS.forEach(key => {
      try {
        if (global.localStorage) {
          global.localStorage.removeItem(key);
        }
      } catch {
        // Ignore storage failures.
      }
    });
  }

  function createGearIcon() {
    return `
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path fill="currentColor" d="M11.05 2.93c.53-.4 1.37-.4 1.9 0l1.09.83c.25.19.58.26.88.18l1.35-.35c.66-.18 1.35.19 1.58.83l.47 1.31c.1.28.32.5.6.6l1.31.47c.64.23 1.01.92.83 1.58l-.35 1.35c-.08.3-.01.63.18.88l.83 1.09c.4.53.4 1.37 0 1.9l-.83 1.09c-.19.25-.26.58-.18.88l.35 1.35c.18.66-.19 1.35-.83 1.58l-1.31.47c-.28.1-.5.32-.6.6l-.47 1.31c-.23.64-.92 1.01-1.58.83l-1.35-.35a1.1 1.1 0 0 0-.88.18l-1.09.83c-.53.4-1.37.4-1.9 0l-1.09-.83a1.1 1.1 0 0 0-.88-.18l-1.35.35c-.66.18-1.35-.19-1.58-.83l-.47-1.31a1.1 1.1 0 0 0-.6-.6l-1.31-.47a1.29 1.29 0 0 1-.83-1.58l.35-1.35a1.1 1.1 0 0 0-.18-.88l-.83-1.09a1.57 1.57 0 0 1 0-1.9l.83-1.09c.19-.25.26-.58.18-.88l-.35-1.35c-.18-.66.19-1.35.83-1.58l1.31-.47c.28-.1.5-.32.6-.6l.47-1.31c.23-.64.92-1.01 1.58-.83l1.35.35c.3.08.63.01.88-.18zM12 8.1A3.9 3.9 0 1 0 12 15.9 3.9 3.9 0 0 0 12 8.1z"/>
      </svg>
    `;
  }

  function mountSettingsMenu(options) {
    if (document.getElementById("sao-settings-anchor")) return;

    const config = Object.assign({
      container: document.body,
      position: "fixed-top-left"
    }, options || {});

    if (!config.container) return;

    injectSettingsStyles();

    const anchor = document.createElement("div");
    anchor.id = "sao-settings-anchor";
    anchor.className = "sao-settings-anchor";

    const trigger = document.createElement("button");
    trigger.type = "button";
    trigger.className = "sao-settings-trigger";
    trigger.setAttribute("aria-haspopup", "dialog");
    trigger.setAttribute("aria-expanded", "false");
    trigger.setAttribute("aria-controls", "sao-settings-menu");
    trigger.setAttribute("aria-label", t("ui.settings.buttonLabel"));
    trigger.innerHTML = createGearIcon();

    const menu = document.createElement("div");
    menu.id = "sao-settings-menu";
    menu.className = "sao-settings-menu";
    menu.setAttribute("role", "dialog");
    menu.setAttribute("aria-modal", "false");
    menu.setAttribute("aria-hidden", "true");
    menu.setAttribute("aria-labelledby", "sao-settings-title");
    menu.setAttribute("aria-describedby", "sao-settings-subtitle");
    menu.tabIndex = -1;

    const header = document.createElement("div");
    header.className = "sao-settings-header";

    const title = document.createElement("h2");
    title.id = "sao-settings-title";
    title.className = "sao-settings-title";
    title.textContent = t("ui.settings.title");

    const closeButton = document.createElement("button");
    closeButton.type = "button";
    closeButton.className = "sao-settings-close";
    closeButton.setAttribute("aria-label", t("ui.settings.closeLabel"));
    closeButton.textContent = "x";

    header.append(title, closeButton);

    const subtitle = document.createElement("p");
    subtitle.id = "sao-settings-subtitle";
    subtitle.className = "sao-settings-subtitle";
    subtitle.textContent = t("ui.settings.subtitle");

    const section = document.createElement("section");
    section.className = "sao-settings-section";

    const label = document.createElement("div");
    label.className = "sao-settings-label";
    label.textContent = t("ui.settings.languageLabel");

    const optionGrid = document.createElement("div");
    optionGrid.className = "sao-language-options";

    const hint = document.createElement("p");
    hint.className = "sao-settings-hint";
    hint.textContent = t("ui.settings.languageHint");

    const actionsSection = document.createElement("section");
    actionsSection.className = "sao-settings-section sao-settings-actions";

    const walkthroughLabel = document.createElement("div");
    walkthroughLabel.className = "sao-settings-label";
    walkthroughLabel.textContent = t("ui.settings.walkthroughLabel");

    const restartWalkthroughButton = document.createElement("button");
    restartWalkthroughButton.type = "button";
    restartWalkthroughButton.className = "sao-settings-action-button";
    restartWalkthroughButton.textContent = t("ui.settings.restartWalkthrough");

    const walkthroughHint = document.createElement("p");
    walkthroughHint.className = "sao-settings-hint";
    walkthroughHint.textContent = t("ui.settings.walkthroughHint");

    section.append(label, optionGrid, hint);
    actionsSection.append(walkthroughLabel, restartWalkthroughButton, walkthroughHint);
    menu.append(header, subtitle, section, actionsSection);
    anchor.append(trigger, menu);
    config.container.appendChild(anchor);

    function renderLanguageOptions() {
      optionGrid.replaceChildren();
      SUPPORTED_LANGUAGES.forEach(languageCode => {
        const languageButton = document.createElement("button");
        languageButton.type = "button";
        languageButton.className = "sao-language-option";
        languageButton.dataset.language = languageCode;
        languageButton.setAttribute("aria-pressed", String(getLanguage() === languageCode));
        languageButton.textContent = t("languageName", null);
        languageButton.textContent = lookup(getBundle(languageCode), "languageName") || languageCode.toUpperCase();
        optionGrid.appendChild(languageButton);
      });
    }

    function syncMenuTranslations() {
      trigger.setAttribute("aria-label", t("ui.settings.buttonLabel"));
      title.textContent = t("ui.settings.title");
      closeButton.setAttribute("aria-label", t("ui.settings.closeLabel"));
      subtitle.textContent = t("ui.settings.subtitle");
      label.textContent = t("ui.settings.languageLabel");
      hint.textContent = t("ui.settings.languageHint");
      walkthroughLabel.textContent = t("ui.settings.walkthroughLabel");
      restartWalkthroughButton.textContent = t("ui.settings.restartWalkthrough");
      walkthroughHint.textContent = t("ui.settings.walkthroughHint");
      renderLanguageOptions();
    }

    function openMenu() {
      menu.classList.add("open");
      menu.setAttribute("aria-hidden", "false");
      trigger.setAttribute("aria-expanded", "true");
      const selected = optionGrid.querySelector(`[data-language="${getLanguage()}"]`) || optionGrid.querySelector("button");
      if (selected) selected.focus();
    }

    function closeMenu() {
      menu.classList.remove("open");
      menu.setAttribute("aria-hidden", "true");
      trigger.setAttribute("aria-expanded", "false");
    }

    trigger.addEventListener("click", () => {
      if (menu.classList.contains("open")) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    closeButton.addEventListener("click", () => {
      closeMenu();
      trigger.focus();
    });

    optionGrid.addEventListener("click", event => {
      const option = event.target.closest("button[data-language]");
      if (!option) return;
      const languageCode = option.dataset.language;
      if (!languageCode) return;
      setLanguage(languageCode);
      syncMenuTranslations();
    });

    restartWalkthroughButton.addEventListener("click", () => {
      resetWalkthroughProgress();
      document.dispatchEvent(new CustomEvent("sao:walkthroughrestart", {
        detail: { source: "settings" }
      }));
      closeMenu();
      trigger.focus();
    });

    document.addEventListener("click", event => {
      if (!menu.classList.contains("open")) return;
      if (!anchor.contains(event.target)) {
        closeMenu();
      }
    });

    document.addEventListener("keydown", event => {
      if (event.key === "Escape" && menu.classList.contains("open")) {
        closeMenu();
        trigger.focus();
      }
    });

    onSettingsChange(() => {
      syncMenuTranslations();
      applyTranslations(document);
    });

    syncMenuTranslations();
  }

  const api = {
    DEFAULT_LANGUAGE,
    SUPPORTED_LANGUAGES,
    getSettings: () => Object.assign({}, settingsState),
    updateSettings(patch) {
      saveSettings(patch);
      applyTranslations(document);
      document.dispatchEvent(new CustomEvent("sao:settingschange", {
        detail: { settings: Object.assign({}, settingsState) }
      }));
    },
    getLanguage,
    setLanguage,
    t,
    applyTranslations,
    onSettingsChange,
    mountSettingsMenu
  };

  global.SAOI18n = api;

  function isDoormatPage() {
    const path = String(global.location && global.location.pathname ? global.location.pathname : "");
    return /(?:^|\/)index\.html$/i.test(path) || /\/$/.test(path);
  }

  document.addEventListener("DOMContentLoaded", () => {
    applyTranslations(document);
    if (isDoormatPage()) {
      mountSettingsMenu();
    }
  });
})(window);
