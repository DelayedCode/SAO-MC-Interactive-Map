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
  const SUPPORTED_LANGUAGES = ["en", "es", "fr", "it"];
  /* The order the site's own language pickers list: English, Français, Español, Italiano. This is a
     display order only, never a second source of truth for which languages exist: a supported
     language the order omits is appended below, so a new language only has to be added to
     SUPPORTED_LANGUAGES and to its dictionary. */
  const LANGUAGE_DISPLAY_ORDER = ["en", "fr", "es", "it"];
  const SUPPORTED_LANGUAGE_CHOICES = Object.freeze(
    LANGUAGE_DISPLAY_ORDER.filter((language) => SUPPORTED_LANGUAGES.includes(language)).concat(
      SUPPORTED_LANGUAGES.filter((language) => !LANGUAGE_DISPLAY_ORDER.includes(language))
    )
  );
  const WALKTHROUGH_PROGRESS_KEYS = Object.freeze([
    "sao.walkthrough.index.completed",
    "sao.walkthrough.maps.completed",
    "sao.walkthrough.mainui.completed",
    "sao.walkthrough.characterBuild.completed"
  ]);
  /* The Welcome Mat warning's encounter counter, written by shared/sao-welcome-warning.js. It is
     deliberately separate from the walkthrough keys above: only the testing control in the
     Settings menu clears it. */
  const WARNING_ENCOUNTER_KEY = "sao.warning.encounters";

  const translations = {
    en: {
      languageName: "English",
      /* The first-visit hint sentence in this language, shown to a visitor who may not read the
         active language yet. Every bundle carries its own wording, so no caller has to hardcode it. */
      languageHint: "Change Language Here!",
      ui: {
        settings: {
          buttonLabel: "Open settings",
          title: "Settings",
          subtitle: "Customize your global website preferences.",
          languageLabel: "Language",
          languageHint: "Applied to all pages.",
          languageHintAria: "Language settings hint",
          closeLabel: "Close settings",
          walkthroughLabel: "Walkthrough",
          walkthroughHint: "Replay the guided tour for the current page.",
          restartWalkthrough: "Restart walkthrough",
          warningReset: "Warning Reset",
          warningResetHint:
            "Testing only. Resets the Warning screen so you can test the first-time experience again. Really only needed to press if you're a Website Dev.",
          warningResetToast: "Warning system reset."
        },
        nav: {
          maps: "Map",
          bestiary: "Bestiary",
          equipment: "Equipment",
          quests: "Quests",
          patchnotes: "Patchnotes",
          miscinfo: "Misc. Info",
          menu: "Go back to Menu"
        },
        common: {
          loading: "Loading...",
          /* The suffix the count messages append to their noun. Italian forms its plurals by changing
             the word ending, so its bundle declares an empty suffix and its wording carries the
             plural instead; every other language appends this. */
          pluralSuffix: "s"
        },
        walkthrough: {
          skip: "Skip",
          back: "Back",
          next: "Next",
          finish: "Finish",
          step: "Step {current} of {total}"
        }
      },
      dataset: {
        betaLabel: "Beta-Test Data",
        currentLabel: "Current Data",
        betaDescription: "Experimental information from beta testing. Some details may be incomplete or inaccurate.",
        currentDescription:
          "The actively maintained dataset. If something is missing, check Beta-Test Data until the information is available here.",
        betaBadge: "Legacy",
        currentBadge: "Recommended",
        chooseTitle: "Choose Data Version",
        cancel: "Cancel",
        close: "Close dataset selection"
      },
      page: {
        index: {
          title: "SAO MC - Module Hub",
          eyebrow: "SAO MC / WORLD HUB",
          discordButton: "Links",
          discordButtonAria: "Open links",
          heading: "Select Your World",
          subtitle: "Select a world to begin.",
          disclaimerBody:
            "This is a personal project.\nThis website is primarily intended for personal and guild use. Information will continue to be added, updated, and improved for as long as there is new content to document.\nPlease keep in mind that this project was not originally designed to be a fully public resource, so some information may be incomplete, missing, or tailored toward my own use and my guild's needs.",
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
          guildLabel: "Guild: Moonlit Black Cats",
          guildAria: "Guild tribute",
          discordModalTitle: "Links",
          discordModalCloseAria: "Close links menu",
          discordModalBody: "Choose where you'd like to go next.",
          creatorDiscord: "Website Creator Discord",
          saoDiscord: "SAO MC Discord",
          supportWebsite: "SAO MC Support Website",
          moonlitDiscord: "🌙 Join Moonlit Black Cats",
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
          chooseCategoryBody: "Turn on one or more categories in the sidebar to display markers for this island.",
          noSearchTitle: "No search matches",
          noSearchBody: "No markers match your current search on this island.",
          noMarkersTitle: "No markers available",
          noMarkersBody: "No markers are available for the currently selected categories on this island.",
          noMobEntries: "No mob entries available yet for this zone.",
          mobType: "Type",
          mobAreaType: "Mob Area",
          availableMobs: "Available Mobs",
          floorText: "Floor",
          tutorial: "Tutorial",
          coordinates: "Coordinates",
          mobs: "Mobs",
          sharedQuests: "Quests at this location",
          viewWaypointInfo: "View waypoint info",
          clusterTitle: "{count} Waypoints",
          clusterBody: "These {count} waypoints sit close together at this zoom level. Open one to see its details.",
          visitedDefeated: "Defeated",
          visitedCompleted: "Completed",
          visitedVisited: "Visited",
          walkthrough: {
            step1Title: "Navigation",
            step1Body: "Use this top row to jump between Maps, Bestiary, Equipment, Quests, Commands, and the Menu.",
            step2Title: "Map Controls",
            step2Body: "Choose the floor, toggle underground mode, use search, and quickly reset filters from here.",
            step3Title: "Filters",
            step3Body:
              "Turn categories on to show markers. Active filters stay highlighted so you can see what is currently enabled.",
            step4Title: "Interactive Map",
            step4Body:
              "Drag to pan and scroll to zoom. Select a marker to open details and shortcuts in the info panel.",
            step5Title: "Right-Click Map Menu",
            step5Body:
              "Right-click the map to open the map action menu. This menu contains the available map actions and tools.",
            step6Title: "Argo the Info Broker",
            step6Body:
              "You'll find the Argo the Info Broker button in the bottom-left corner of the map. Click it to open Argo and ask questions about the game.\n\nImportant Note: Argo isn't an AI system.\n\nShe uses a rule-based system that scans your messages, matches keywords and patterns, and searches the game's actual data to find relevant information. Her responses come from programmed logic and written dialogue rather than an AI model generating answers.\n\nBecause of this, she can be a little picky about how you phrase things. Unclear wording, unusual phrasing, or overly complex questions may produce inaccurate or unexpected results. Try using specific keywords, such as mob names, item names, NPCs, or locations, if she doesn't understand what you're looking for.\n\nNow you're all set! Enjoy exploring!"
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
          mapDataUnavailableTitle: "FRACTURED UNDERWORLD MAP",
          mapDataUnavailableBody: "Map data is currently being developed.",
          mapDataUnavailableFooter: "NPC and map data will be added as this module progresses.",
          translationNotice:
            "Sorry, most of this page does not have translations yet. The developer of this page is a solo developer. They do not have enough time to collect data and translate everything. Translations may be added in the future, but it is unlikely.",
          searchPlaceholder: "Search markers...",
          clearFilters: "Clear Filters",
          resetView: "Reset View",
          defaultInfoTitle: "Select a marker",
          defaultInfoBody: "Choose a marker on the map to see details here.",
          chooseCategoryTitle: "Choose a category",
          chooseCategoryBody: "Turn on one or more categories in the sidebar to display markers for this island.",
          noSearchTitle: "No search matches",
          noSearchBody: "No markers match your current search on this island.",
          noMarkersTitle: "No markers available",
          noMarkersBody: "No markers are available for the currently selected categories on this island.",
          noMobEntries: "No mob entries available yet for this zone.",
          mapSuffix: "map",
          undergroundSuffix: "underground overlay",
          runtimeError: "The map could not be loaded right now. Refresh the page and try again.",
          runtimeTitle: "Map unavailable",
          coordinatesPlaceholder: "X: -- Z: --"
        },
        bestiary: {
          eyebrow: "AINCRAD / BESTIARY",
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
          statusShownBoss: "{visible} of {total} bosses shown.",
          statusShownDungeonBoss: "{visible} of {total} dungeon bosses shown.",
          statusShownDungeonMobs: "{visible} of {total} dungeon mobs shown.",
          statusShownRegular: "{visible} of {total} regular mobs shown.",
          emptyCategory: "No entries yet for {category}.",
          drops: "Drops",
          aggressiveness: "Aggressiveness",
          aggressive: "Aggressive",
          neutral: "Neutral",
          passive: "Passive",
          xp: "XP",
          na: "N/A",
          translationNotice:
            "Sorry, most of this page does not have translations yet. The developer of this page is a solo developer. They do not have enough time to collect data and translate everything. Translations may be added in the future, but it is unlikely."
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
          translationNotice:
            "Sorry, most of this page does not have translations yet. The developer of this page is a solo developer. They do not have enough time to collect data and translate everything. Translations may be added in the future, but it is unlikely."
        },
        ecompendium: {
          eyebrow: "AINCRAD / EQUIPMENT COMPENDIUM",
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
            resources: "Resources"
          },
          unknownItem: "Unknown Item",
          translationNotice:
            "Sorry, most of this page does not have translations yet. The developer of this page is a solo developer. They do not have enough time to collect data and translate everything. Translations may be added in the future, but it is unlikely."
        },
        quests: {
          eyebrow: "AINCRAD / QUESTS",
          title: "SAO Quests",
          heading: "Quests",
          logoAria: "Quests logo",
          searchLabel: "Search quests",
          searchPlaceholder: "Search by any column...",
          questTypeFilterAria: "Quest type filter",
          questTypes: {
            main: "Main Quests",
            side: "Side Quests"
          },
          questFiltersAria: "Quest filters",
          cityFilterLabel: "City",
          allCities: "All cities",
          completionFilterLabel: "Completion",
          allQuests: "All quests",
          completedOnly: "Completed only",
          incompleteOnly: "Not completed",
          noFilterMatch: "No quest entries match the current filters.",
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
          questNumber: "Quest {number}",
          floorText: "Floor",
          titleWithFloor: "Quests - {floor}",
          noQuestData: "No quest data has been added for {floor} yet.",
          noQuestMatchFloor: "No quest entries match your search on {floor}. {completed} completed.",
          shownStatus: "{visible} of {total} quest entries shown for {floor} || {completed} completed.",
          loadedStatus: "{count} quest entries loaded for {floor}.",
          translationNotice:
            "Sorry, most of this page does not have translations yet. The developer of this page is a solo developer. They do not have enough time to collect data and translate everything. Translations may be added in the future, but it is unlikely."
        },
        patchnotes: {
          eyebrow: "AINCRAD / PATCHNOTES",
          title: "SAO Patchnotes",
          heading: "Patchnotes",
          searchLabel: "Search notes",
          searchPlaceholder: "Filter by version, item, or update",
          noMatches: "No patch notes match that filter.",
          noEntries: "No matching changelog entries found.",
          statusShowing: "Showing {count} patch note{suffix}.",
          translationNotice:
            "Sorry, most of this page does not have translations yet. The developer of this page is a solo developer. They do not have enough time to collect data and translate everything. Translations may be added in the future, but it is unlikely."
        },
        miscinfo: {
          eyebrow: "AINCRAD / MISC. INFO",
          title: "Misc. Info",
          heading: "Misc. Info",
          back: "Go back to Menu",
          playerLevels: "Player Levels",
          playerLevelsDetails:
            "Level 1 -> 2: 150 XP\nLevel 2 -> 3: 300 XP\nLevel 3 -> 4: 600 XP\nLevel 4 -> 5: 1,350 XP\nLevel 5 -> 6: 2,700 XP\nLevel 6 -> 7: 5,100 XP\nLevel 7 -> 8: 9,000 XP\nLevel 8 -> 9: 15,000 XP\nLevel 9 -> 10: 24,000 XP",
          translationNotice:
            "Sorry, most of this page does not have translations yet. The developer of this page is a solo developer. They do not have enough time to collect data and translate everything. Translations may be added in the future, but it is unlikely."
        },
        towerdefense: {
          eyebrow: "FRACTURED UNDERWORLD / TOWER DEFENSE",
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
          currentStats: "Current",
          translationNotice:
            "Sorry, most of this page does not have translations yet. The developer of this page is a solo developer. They do not have enough time to collect data and translate everything. Translations may be added in the future, but it is unlikely."
        }
      }
    },
    es: {
      languageName: "Espanol",
      languageHint: "¡Cambia el idioma aquí!",
      ui: {
        settings: {
          buttonLabel: "Abrir configuracion",
          title: "Configuracion",
          subtitle: "Personaliza tus preferencias globales del sitio.",
          languageLabel: "Idioma",
          languageHint: "Se aplica a todas las paginas.",
          languageHintAria: "Aviso de configuración de idioma",
          closeLabel: "Cerrar configuracion",
          walkthroughLabel: "Guía",
          walkthroughHint: "Vuelve a reproducir la guía del recorrido para la página actual.",
          restartWalkthrough: "Reiniciar guía",
          warningReset: "Restablecer aviso",
          warningResetHint:
            "Solo para pruebas. Restablece el aviso para que puedas volver a probar la experiencia de primera vez. En realidad, solo hace falta pulsarlo si desarrollas el sitio web.",
          warningResetToast: "Sistema de avisos restablecido."
        },
        nav: {
          maps: "Mapa",
          bestiary: "Bestiario",
          equipment: "Equipo",
          quests: "Misiones",
          patchnotes: "Notas",
          miscinfo: "Info. Varia",
          menu: "Volver al Menu"
        },
        common: {
          loading: "Cargando...",
          pluralSuffix: "s"
        }
      },
      page: {
        index: {
          title: "SAO MC - Centro de Modulos",
          eyebrow: "SAO MC / HUB del mundo",
          discordButton: "Enlaces",
          discordButtonAria: "Abrir enlaces",
          heading: "Selecciona tu mundo",
          subtitle: "Selecciona un mundo para comenzar.",
          disclaimerBody:
            "Este es un proyecto personal.\nEste sitio esta pensado principalmente para uso personal y del gremio. La informacion se seguira actualizando y mejorando mientras haya contenido nuevo por documentar.\nTen en cuenta que este proyecto no fue pensado originalmente como recurso publico completo, por lo que parte de la informacion puede estar incompleta o adaptada a mis necesidades y las de mi gremio.",
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
          guildLabel: "Gremio: Moonlit Black Cats",
          guildAria: "Tributo al gremio",
          discordModalTitle: "Enlaces",
          discordModalCloseAria: "Cerrar menú de enlaces",
          discordModalBody: "Elige a donde quieres ir.",
          creatorDiscord: "Discord del creador",
          saoDiscord: "Discord de SAO MC",
          supportWebsite: "Sitio web de soporte de SAO MC",
          moonlitDiscord: "🌙 Únete a Moonlit Black Cats",
          ggoToast: "GGO aun no esta disponible. No hay informacion para mostrar."
        },
        patchnotes: {
          eyebrow: "AINCRAD / NOTAS DE PARCHE",
          title: "Notas de parche y registro de cambios de SAO MC",
          heading: "Notas de parche",
          searchLabel: "Buscar notas",
          searchPlaceholder: "Filtrar por versión, elemento o actualización",
          noMatches: "No hay notas de parche que coincidan con ese filtro.",
          noEntries: "No se encontraron entradas del registro de cambios.",
          statusShowing: "Mostrando {count} nota de parche{suffix}.",
          translationNotice:
            "La mayor parte del contenido de esta página todavía no está traducida porque el sitio lo mantiene una sola persona con poco tiempo."
        },
        miscinfo: {
          eyebrow: "AINCRAD / INFO. VARIA",
          title: "Info. Varia",
          heading: "Info. Varia",
          back: "Volver al Menu",
          playerLevels: "Niveles del jugador",
          playerLevelsDetails:
            "Nivel 1 -> 2: 150 XP\nNivel 2 -> 3: 300 XP\nNivel 3 -> 4: 600 XP\nNivel 4 -> 5: 1,350 XP\nNivel 5 -> 6: 2,700 XP\nNivel 6 -> 7: 5,100 XP\nNivel 7 -> 8: 9,000 XP\nNivel 8 -> 9: 15,000 XP\nNivel 9 -> 10: 24,000 XP",
          translationNotice:
            "La mayor parte del contenido de esta página todavía no está traducida porque el sitio lo mantiene una sola persona con poco tiempo."
        }
      }
    },
    fr: {
      languageName: "Francais",
      languageHint: "Changez de langue ici !",
      ui: {
        settings: {
          buttonLabel: "Ouvrir les parametres",
          title: "Parametres",
          subtitle: "Personnalisez vos preferences globales du site.",
          languageLabel: "Langue",
          languageHint: "Applique a toutes les pages.",
          languageHintAria: "Indication des paramètres de langue",
          closeLabel: "Fermer les parametres",
          walkthroughLabel: "Visite guidée",
          walkthroughHint: "Relancer la visite guidée pour la page actuelle.",
          restartWalkthrough: "Redémarrer la visite guidée",
          warningReset: "Réinitialiser l'avertissement",
          warningResetHint:
            "Réservé aux tests. Réinitialise l'avertissement pour vous permettre de tester à nouveau l'expérience de première visite. Cette option ne vous sera vraiment utile que si vous développez le site web.",
          warningResetToast: "Système d'avertissement réinitialisé."
        },
        nav: {
          maps: "Carte",
          bestiary: "Bestiaire",
          equipment: "Equipement",
          quests: "Quetes",
          patchnotes: "Notes",
          miscinfo: "Infos diverses",
          menu: "Retour au menu"
        },
        common: {
          loading: "Chargement...",
          pluralSuffix: "s"
        }
      },
      page: {
        index: {
          title: "SAO MC - Hub des Modules",
          eyebrow: "SAO MC / HUB du monde",
          discordButton: "Liens",
          discordButtonAria: "Ouvrir les liens",
          heading: "Sélectionnez votre monde",
          subtitle: "Sélectionnez un monde pour commencer.",
          disclaimerBody:
            "Ceci est un projet personnel.\nCe site est principalement destine a un usage personnel et de guilde. Les informations continueront d'etre ajoutees, mises a jour et ameliorees tant qu'il y aura du nouveau contenu a documenter.\nGardez a l'esprit que ce projet n'etait pas initialement concu comme une ressource publique complete ; certaines informations peuvent donc etre incompletes ou adaptees a mes besoins et a ceux de ma guilde.",
          selectorAria: "Selection du mode",
          aincradTitle: "Aincrad",
          underworldTitle: "Fractured Underworld",
          ggoTitle: "GunGaleOnline",
          launchTag: "Lancer",
          notReleasedTag: "Non publie",
          aincradDesc: "Ouvrez le hub de carte pour parcourir le guide des donjons, les quetes, le bestiaire et plus.",
          underworldDesc:
            "Ouvrez le hub de carte Fractured Underworld pour commencer a construire et tester ce module.",
          ggoDesc: "Le menu GGO n'est pas encore publie, donc aucun module n'est disponible.",
          interactiveMode: "Mode interactif",
          guildLabel: "Guilde : Moonlit Black Cats",
          guildAria: "Hommage a la guilde",
          discordModalTitle: "Liens",
          discordModalCloseAria: "Fermer le menu des liens",
          discordModalBody: "Choisissez votre prochaine destination.",
          creatorDiscord: "Discord du createur",
          saoDiscord: "Discord SAO MC",
          supportWebsite: "Site web d'assistance SAO MC",
          moonlitDiscord: "🌙 Rejoindre Moonlit Black Cats",
          ggoToast: "GGO n'est pas encore sorti. Aucune information a afficher."
        },
        patchnotes: {
          eyebrow: "AINCRAD / NOTES DE PATCH",
          title: "Notes de patch et journal des modifications SAO MC",
          heading: "Notes de patch",
          searchLabel: "Rechercher des notes",
          searchPlaceholder: "Filtrer par version, élément ou mise à jour",
          noMatches: "Aucune note de patch ne correspond à ce filtre.",
          noEntries: "Aucune entrée de journal correspondant n'a été trouvée.",
          statusShowing: "Affichage de {count} note de patch{suffix}.",
          translationNotice:
            "La majeure partie du contenu de cette page n'est pas encore traduite, car le site est géré par une seule personne avec peu de temps."
        },
        miscinfo: {
          eyebrow: "AINCRAD / INFOS DIVERSES",
          title: "Infos diverses",
          heading: "Infos diverses",
          back: "Retour au menu",
          playerLevels: "Niveaux du joueur",
          playerLevelsDetails:
            "Niveau 1 -> 2 : 150 XP\nNiveau 2 -> 3 : 300 XP\nNiveau 3 -> 4 : 600 XP\nNiveau 4 -> 5 : 1 350 XP\nNiveau 5 -> 6 : 2 700 XP\nNiveau 6 -> 7 : 5 100 XP\nNiveau 7 -> 8 : 9 000 XP\nNiveau 8 -> 9 : 15 000 XP\nNiveau 9 -> 10 : 24 000 XP",
          translationNotice:
            "La majeure partie du contenu de cette page n'est pas encore traduite, car le site est géré par une seule personne avec peu de temps."
        }
      }
    }
  };

  function deepMerge(target, source) {
    if (!source || typeof source !== "object" || Array.isArray(source)) {
      return target;
    }

    const output = target && typeof target === "object" && !Array.isArray(target) ? { ...target } : {};

    Object.entries(source).forEach(([key, value]) => {
      const existingValue = output[key];
      if (
        value &&
        typeof value === "object" &&
        !Array.isArray(value) &&
        existingValue &&
        typeof existingValue === "object" &&
        !Array.isArray(existingValue)
      ) {
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
          islandAria: "Island navigation"
        },
        pageNotice:
          "Some translations may be incomplete, incorrect, or have grammar mistakes. A large portion of this website has not been translated yet. This project is maintained by a solo developer, so translating every page takes a significant amount of time.",
        walkthrough: {
          skip: "Skip",
          back: "Back",
          next: "Next",
          finish: "Finish",
          step: "Step {current} of {total}",
          welcomeTitle: "Welcome",
          welcomeBody: "This is the doormat. Use this page to choose which SAO MC module you want to open.",
          modeCardsTitle: "Mode cards",
          modeCardsBody:
            "Pick Aincrad or Fractured Underworld to launch a module. The GGO card is currently locked until release.",
          discordTitle: "Links",
          discordBody: "Open quick links to the SAO MC Support Website, SAO MC Discord, and my Discord Profile.",
          settingsTitle: "Settings",
          settingsBody: "Use the gear to switch language and replay this walkthrough whenever you want."
        }
      },
      page: {
        uwcompendium: {
          eyebrow: "FRACTURED UNDERWORLD / COMPENDIUM",
          title: "Fractured Underworld Compendium",
          map: "Go back to Map",
          searchLabel: "Search",
          searchPlaceholder: "Search compendium...",
          statusShown: "Showing {visible} of {total} entries.",
          noEntries: "No compendium entries found.",
          unavailable: "Beta-Test Compendium data is not available yet.",
          insufficientInfo: "Not enough information released yet to make a page!"
        },
        bestiary: {
          loadError: "Bestiary data could not be loaded. Refresh the page and try again.",
          loadUnavailable: "Bestiary data is currently unavailable."
        },
        miscinfo: {
          notice:
            "Most of this page's content is still untranslated because the site is maintained by one person with limited time."
        },
        commands: {
          loadError: "Commands could not be loaded right now. Refresh the page and try again.",
          loadUnavailable: "Commands are currently unavailable."
        },
        ecompendium: {
          loadError: "Equipment data could not be loaded. Refresh the page and try again.",
          loadUnavailable: "Equipment data is currently unavailable."
        },
        quests: {},
        maps: {
          categories: {
            custom: "Custom Markers",
            main: "Main Quests",
            biomes: "Biomes",
            bossSpawns: "Boss Spawns",
            dungeons: "Dungeons",
            farmingSpots: "Farming Spots",
            mobAreas: "Mob Areas",
            worldEvents: "World Event",
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
            equipmentBlacksmith: "Equipment Blacksmith",
            secretAccessoryBlacksmith: "Secret Accessory Blacksmith",
            armorBlacksmith: "Armor Blacksmith",
            ingotBlacksmith: "Ingot Blacksmith",
            keyBlacksmith: "Key Blacksmith",
            materialsBlacksmith: "Materials Blacksmith",
            refaire: "Refaire",
            runeCraftsmen: "Rune Craftsmen",
            weaponsmith: "Weaponsmith"
          },
          floorOptions: {
            floor1: "Floor 1 - The Town of Beginnings",
            floor2: "Floor 2 - Arid Desert",
            floor3: "Floor 3 - The Forest of Wandering"
          },
          categoryMainTitle: "Main",
          categoryQuestsTitle: "Quests",
          categoryJourneymenTitle: "Journeymen",
          categoryMarketTitle: "Market",
          categoryCraftsmenTitle: "Craftsmen",
          walkthrough: {
            step1Title: "Navigation",
            step1Body: "Use this top row to jump between Maps, Bestiary, Equipment, Quests, Commands, and the Menu.",
            step2Title: "Map Controls",
            step2Body: "Choose the floor, toggle underground mode, use search, and quickly reset filters from here.",
            step3Title: "Filters",
            step3Body:
              "Turn categories on to show markers. Active filters stay highlighted so you can see what is currently enabled.",
            step4Title: "Interactive Map",
            step4Body:
              "Drag to pan and scroll to zoom. Select a marker to open details and shortcuts in the info panel."
          },
          runtimeError: "The map could not be loaded right now. Refresh the page and try again.",
          runtimeTitle: "Map unavailable",
          mapContextMenu: {
            title: "MAP ACTIONS",
            createCustomMarker: "Create Custom Marker",
            distancePoint1: "Distance Calculator Point 1",
            distancePoint2: "Distance Calculator Point 2",
            resetDistance: "Reset Distance Calculator",
            exportJourneyMap: "Export JourneyMap Waypoints",
            importJourneyMap: "Import JourneyMap Waypoints",
            waypointTutorial: "How to Import/Export Waypoints Tutorial",
            exportSuccess: "Exported {countLabel}.",
            exportWaypointOne: "1 waypoint",
            exportWaypointMany: "{count} waypoints",
            exportNoWaypoints: "Enable at least one waypoint category to export.",
            exportEmptyCategories: "The enabled categories contain no waypoints to export.",
            exportFailure: "JourneyMap export failed.",
            importSuccess: "Imported {waypoints} {waypointLabel} from {categories} {categoryLabel}.",
            importWaypointOne: "waypoint",
            importWaypointMany: "waypoints",
            importCategoryOne: "category",
            importCategoryMany: "categories",
            importNoWaypoints: "No valid waypoints were found in this file.",
            importInvalid: "This JourneyMap file is invalid.",
            importUnsupported: "This JourneyMap file uses an unsupported format or dimension.",
            importFailure: "JourneyMap import failed. No waypoints were added.",
            importPartial: "Imported {newLabel}; skipped {duplicateLabel}.",
            importNewOne: "1 new waypoint",
            importNewMany: "{count} new waypoints",
            importDuplicateOne: "1 duplicate waypoint",
            importDuplicateMany: "{count} duplicate waypoints",
            importDuplicatesOne: "This JourneyMap waypoint was already imported.",
            importDuplicatesMany: "{count} JourneyMap waypoints were already imported."
          },
          distanceCalculator: { distance: "Distance: {value}" },
          coordinatesPlaceholder: "X: -- Z: --",
          dataModeBanner: {
            beta: "This is Beta-Test Data! A lot of the information is inaccurate, so please don’t come to me if something here is wrong. I only recommend viewing this Data Type if you can’t find what you’re looking for in Current Data.",
            current:
              "This is Current Data, If any information here is wrong, DM me about it and I’ll fix it ASAP. If you can’t find something, check the Beta-Test Data for what you’re looking for. Just keep in mind a lot of that information is wrong there so don't take it as 100% fact."
          },
          customWaypoint: {
            category: "Custom Markers",
            createTitle: "Create Custom Waypoint",
            nameLabel: "Waypoint Name",
            descriptionLabel: "Waypoint Description",
            coordinatesLabel: "Coordinates",
            xLabel: "X",
            zLabel: "Z",
            buttonLabel: "Button",
            buttonDefault: "Default",
            createButton: "Create a Button",
            buttonNameLabel: "Button Name",
            logoLabel: "Custom Logo",
            logoPin: "Pin",
            logoStar: "Star",
            logoFlag: "Flag",
            logoHome: "Home",
            logoChest: "Chest",
            logoSword: "Sword",
            logoShield: "Shield",
            logoSkull: "Skull",
            logoDiamond: "Diamond",
            logoTarget: "Target",
            colorSelectorLabel: 'Color Selector for "JourneyMap" Export',
            colorHint: "Click to choose a color",
            colorHintBiomes: "Biomes color is locked to white",
            colorPickerAria: "Choose JourneyMap category color",
            colorHexAria: "JourneyMap category HEX color",
            colorHexPlaceholder: "#RRGGBB",
            invalidHex: "Invalid HEX color",
            confirm: "Confirm Creation",
            cancel: "Cancel Creation",
            confirmAction: "Confirm",
            cancelAction: "Cancel",
            copy: "Copy Coordinates",
            copySuccess: "Coordinates copied.",
            copyError: "Unable to copy coordinates.",
            nameRequired: "Enter a waypoint name.",
            coordinatesRequired: "Enter valid X and Z coordinates.",
            manualCoordinates: "Enter X and Z manually; this map has no coordinate calibration yet.",
            performanceWarning:
              "More custom waypoints may reduce map performance. Large numbers of waypoints can make the map slower, especially while zooming or moving around.",
            delete: "Delete Custom Waypoint",
            deleteButton: "Delete Button",
            deleteAction: "Delete",
            deleteButtonWarning: "All waypoints in this button will be removed along with the button",
            areYouSure: "Are you sure?",
            confirmDelete: "Confirm Delete",
            deleteConfirm: "Delete this custom waypoint?"
          }
        },
        mainui: {
          mapContextMenu: {
            title: "MAP ACTIONS",
            createCustomMarker: "Create Custom Marker",
            distancePoint1: "Distance Calculator Point 1",
            distancePoint2: "Distance Calculator Point 2",
            resetDistance: "Reset Distance Calculator",
            exportJourneyMap: "Export JourneyMap Waypoints",
            importJourneyMap: "Import JourneyMap Waypoints",
            waypointTutorial: "How to Import/Export Waypoints Tutorial",
            exportSuccess: "Exported {countLabel}.",
            exportWaypointOne: "1 waypoint",
            exportWaypointMany: "{count} waypoints",
            exportNoWaypoints: "Enable at least one waypoint category to export.",
            exportEmptyCategories: "The enabled categories contain no waypoints to export.",
            exportFailure: "JourneyMap export failed.",
            importSuccess: "Imported {waypoints} {waypointLabel} from {categories} {categoryLabel}.",
            importWaypointOne: "waypoint",
            importWaypointMany: "waypoints",
            importCategoryOne: "category",
            importCategoryMany: "categories",
            importNoWaypoints: "No valid waypoints were found in this file.",
            importInvalid: "This JourneyMap file is invalid.",
            importUnsupported: "This JourneyMap file uses an unsupported format or dimension.",
            importFailure: "JourneyMap import failed. No waypoints were added.",
            importPartial: "Imported {newLabel}; skipped {duplicateLabel}.",
            importNewOne: "1 new waypoint",
            importNewMany: "{count} new waypoints",
            importDuplicateOne: "1 duplicate waypoint",
            importDuplicateMany: "{count} duplicate waypoints",
            importDuplicatesOne: "This JourneyMap waypoint was already imported.",
            importDuplicatesMany: "{count} JourneyMap waypoints were already imported."
          },
          categories: {
            custom: "Custom Markers",
            npc: "NPC",
            mainQuests: "Main Quests",
            rulid: "Wheat Spawn",
            fishingSpot: "Fishing Spot",
            oakWood: "Oak Wood",
            copper: "Copper",
            iron: "Iron",
            coal: "Coal"
          },
          islandOptions: {
            playerIsland: "Player Island",
            gigasCedar: "Gigas Cedar",
            iceCave: "Ice Cave",
            rulid: "Rulid",
            fishingIsland: "Fishing Island"
          },
          walkthrough: {
            step1Title: "Navigation",
            step1Body: "Use the top row to go to Tower Defense information, see the Compendium and Return to the Menu.",
            step2Title: "Island Controls",
            step2Body: "Change islands, toggle underground mode, search markers, and reset filters quickly.",
            step3Title: "Filters",
            step3Body:
              "Enable categories to show matching markers. Disabled filters automatically hide when not valid for the selected island.",
            step4Title: "Interactive Map",
            step4Body: "Drag to pan, scroll to zoom, and select a marker to open details in the side panel.",
            step5Title: "Right-Click Map Menu",
            step5Body:
              "Right-click the map to open the map action menu. This menu contains the available map actions and tools.",
            step6Title: "Argo the Info Broker",
            step6Body:
              "You'll find the Argo the Info Broker button in the bottom-left corner of the map. Click it to open Argo and ask questions about the game.\n\nImportant Note: Argo isn't an AI system.\n\nShe uses a rule-based system that scans your messages, matches keywords and patterns, and searches the game's actual data to find relevant information. Her responses come from programmed logic and written dialogue rather than an AI model generating answers.\n\nBecause of this, she can be a little picky about how you phrase things. Unclear wording, unusual phrasing, or overly complex questions may produce inaccurate or unexpected results. Try using specific keywords, such as mob names, item names, NPCs, or locations, if she doesn't understand what you're looking for.\n\nNow you're all set! Enjoy exploring!"
          },
          runtimeError: "The map could not be loaded right now. Refresh the page and try again.",
          runtimeTitle: "Map unavailable",
          coordinatesPlaceholder: "X: -- Z: --"
        },
        patchnotes: {
          entries: {
            v140: {
              title: "Character Build & Major UI Update",
              summary:
                "• Added the complete Character Build system with Current Data and Beta-Test Data support.\n• Added major improvements and a full overhaul of the website's UI and responsiveness.\n• Redesigned the Equipment, Quests, Patchnotes, Misc. Info, Tower Defense, and Compendium sections.\n• Added and expanded translations across the website.\n• Improved website reactivity, performance, loading, and browser compatibility.\n• Fixed missing or incorrect equipment stats and various UI issues.\n• Updated and improved the website walkthrough.\n• Added Beta-Test data and related loading information.\n• Made numerous smaller fixes, improvements, and quality-of-life changes across the website."
            },
            v130: {
              title: "Language and Compatibility Update",
              summary:
                "• Added Français and Español language support. Translation coverage was still incomplete at the time of this release.\n• Added a website walkthrough/guide.\n• Improved compatibility across more web browsers.\n• Optimized and reorganized code to make future updates and maintenance easier.\n\n• This should be the final website update until the server comes back online."
            },
            v120: {
              title: "Very Small Bug Fix",
              summary:
                "• Fixed the Commands Menu loading indefinitely.\n• Fixed patchnote order from lowest to highest date."
            },
            v111: {
              title: "Final Touches",
              summary:
                "• Added a Commands tab.\n• Added a Misc. Info section for information that doesn't fit anywhere else.\n• Added Back to Menu buttons throughout the website.\n• Added the Fractured Underworld section, although it is still in the early stages of development.\n• Began work on Tower Defense support and information within Fractured Underworld.\n• Added a small disclaimer to the Welcome Mat.\n• Fixed a wapoint bug.\n• Fixed a UI bug"
            },
            v100: {
              title: "Full Release",
              summary:
                "• Added Floor 3 and its available waypoints.\n• Main Quest information for Floors 1 to 3 is currently missing, so those have not been added yet.\n• Some waypoints on Floor 3 intentionally do not work due to a lack of information at this time.\n• Optimized code across the website.\n• Started and completed the Equipment Compendium.\n• Most buttons are now alphabetically sorted.\n• Updated and improved the website UI.\n• Redesigned the website landing page.\n• Added buttons linking to the SAO MC Discord, the support Discord, and my personal Discord profile.\n• Contact me through discord for Suggestions or Bug Reports"
            },
            v010: {
              title: "Website Release",
              summary:
                "Initial website release. Added Floor 1, Side Quest locations, Biome locations, Dungeon locations, the Quest Menu, and the Bestiary Menu."
            },
            v020: {
              title: "New Maps",
              summary:
                "Added Floor 2, major POI waypoints for Floor 1 and Floor 2, waypoint interactions that can open the Bestiary or Quest Menu, and the website main menu screen."
            }
          },
          tags: {
            bugFixes: "Bug Fixes",
            betaTestData: "Beta-Test Data",
            characterBuild: "Character Build",
            uiOverhaul: "UI Overhaul",
            commands: "Commands",
            maps: "Maps",
            release: "Release",
            localization: "Localization",
            performance: "Performance",
            compatibility: "Compatibility",
            maintenance: "Maintenance",
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
            npcs: "NPCs",
            floor2: "Floor 2",
            poi: "POI",
            waypoints: "Waypoints",
            mainMenu: "Main Menu",
            compendium: "Compendium"
          }
        },
        towerdefense: {
          arc1Title: "Arc 1 - Tutorial (Boar Planes)",
          arc1Rewards:
            "Pouch of 100 Col (100%), Utility Crystal (25%), Minor PvE Rune (8%), Dungeon Key (4%), Fern (Habitat Item) (30%), Frosted Lantern (Habitat Item) (20%), Campfire (Habitat Item) (20%)",
          arc1Waves: "5 Waves, On the Fifth wave a reskinned pumba spawns as the boss.",
          arc2Title: "Arc 2 - Medium (Boar Zones)",
          arc2Rewards:
            "500 Col Purse (100%), Utility Crystal (40%), Minor PvE Rune (18%), Dungeon Key (12%), Fern (Habitat) (30%), Hay Bale (Habitat) (20%)",
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
          islandAria: "Navegacion de isla"
        },
        pageNotice:
          "Algunas traducciones pueden estar incompletas, ser incorrectas o tener errores gramaticales. ¡Lo sentimos! Este sitio web es mantenido por un solo desarrollador que solo habla inglés, por lo que mantener otros idiomas actualizados puede ser difícil. Si encuentras algo que necesite traducción, no dudes en contactar al desarrollador por Discord.",
        walkthrough: {
          skip: "Omitir",
          back: "Atrás",
          next: "Siguiente",
          finish: "Finalizar",
          step: "Paso {current} de {total}",
          welcomeTitle: "Bienvenido",
          welcomeBody: "Esta es la bienvenida. Usa esta pagina para elegir que modulo de SAO MC quieres abrir.",
          modeCardsTitle: "Tarjetas de modo",
          modeCardsBody:
            "Elige Aincrad o Fractured Underworld para abrir un modulo. La tarjeta de GGO sigue bloqueada hasta su lanzamiento.",
          discordTitle: "Enlaces",
          discordBody: "Abre enlaces rapidos al perfil del creador y al Discord de SAO MC.",
          settingsTitle: "Configuracion",
          settingsBody: "Usa el engranaje para cambiar el idioma y repetir esta guia cuando quieras."
        }
      },
      page: {
        uwcompendium: {
          eyebrow: "FRACTURED UNDERWORLD / COMPENDIO",
          title: "Compendio de Fractured Underworld",
          map: "Volver al mapa",
          searchLabel: "Buscar",
          searchPlaceholder: "Buscar en el compendio...",
          statusShown: "Mostrando {visible} de {total} entradas.",
          noEntries: "No se encontraron entradas en el compendio.",
          unavailable: "Los datos del compendio de la beta todavía no están disponibles.",
          insufficientInfo: "Todavía no hay suficiente información publicada para crear una página."
        },
        bestiary: {
          eyebrow: "AINCRAD / BESTIARIO",
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
          statusShownBoss: "{visible} de {total} jefes mostrados.",
          statusShownDungeonBoss: "{visible} de {total} jefes de mazmorras mostrados.",
          statusShownDungeonMobs: "{visible} de {total} mobs de mazmorras mostrados.",
          statusShownRegular: "{visible} de {total} mobs regulares mostrados.",
          emptyCategory: "Todavía no hay entradas para {category}.",
          drops: "Drops",
          aggressiveness: "Agresividad",
          aggressive: "Agresivo",
          neutral: "Neutral",
          passive: "Pasivo",
          xp: "XP",
          na: "N/A",
          loadError: "No se pudieron cargar los datos del bestiario. Actualiza la página e inténtalo de nuevo.",
          loadUnavailable: "Los datos del bestiario no están disponibles en este momento."
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
          loadUnavailable: "Los comandos no están disponibles en este momento."
        },
        ecompendium: {
          eyebrow: "AINCRAD / COMPENDIO DE EQUIPO",
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
            resources: "Recursos"
          },
          unknownItem: "Objeto desconocido",
          loadError: "No se pudieron cargar los datos de equipamiento. Actualiza la página e inténtalo de nuevo.",
          loadUnavailable: "Los datos de equipamiento no están disponibles en este momento."
        },
        quests: {
          eyebrow: "AINCRAD / MISIONES",
          title: "Guía de misiones de Aincrad",
          heading: "Misiones",
          logoAria: "Logo de misiones",
          searchLabel: "Buscar misiones",
          searchPlaceholder: "Buscar por cualquier columna...",
          questTypeFilterAria: "Filtro de tipo de misión",
          questTypes: {
            main: "Misiones principales",
            side: "Misiones secundarias"
          },
          questFiltersAria: "Filtros de misiones",
          cityFilterLabel: "Ciudad",
          allCities: "Todas las ciudades",
          completionFilterLabel: "Estado",
          allQuests: "Todas las misiones",
          completedOnly: "Solo completadas",
          incompleteOnly: "Sin completar",
          noFilterMatch: "Ninguna misión coincide con los filtros actuales.",
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
          questNumber: "Misión {number}",
          floorText: "Piso",
          titleWithFloor: "Misiones - {floor}",
          noQuestData: "Todavía no hay datos de misiones para {floor}.",
          noQuestMatchFloor:
            "No hay entradas de misiones que coincidan con tu búsqueda en {floor}. {completed} completadas.",
          shownStatus: "{visible} de {total} entradas de misiones mostradas para {floor} || {completed} completadas.",
          loadedStatus: "{count} entradas de misiones cargadas para {floor}."
        },
        maps: {
          categories: {
            custom: "Marcadores personalizados",
            main: "Misiones principales",
            biomes: "Biomas",
            bossSpawns: "Apariciones de jefes",
            dungeons: "Mazmorras",
            farmingSpots: "Puntos de cosecha",
            mobAreas: "Areas de mobs",
            worldEvents: "Evento mundial",
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
            equipmentBlacksmith: "Herrero de equipo",
            secretAccessoryBlacksmith: "Herrero secreto de accesorios",
            armorBlacksmith: "Herrero de armaduras",
            ingotBlacksmith: "Herrero de lingotes",
            keyBlacksmith: "Herrero de llaves",
            materialsBlacksmith: "Herrero de materiales",
            refaire: "Refaire",
            runeCraftsmen: "Artesanos de runas",
            weaponsmith: "Herrero de armas"
          },
          floorOptions: {
            floor1: "Piso 1 - El pueblo de los comienzos",
            floor2: "Piso 2 - Desierto árido",
            floor3: "Piso 3 - El bosque errante"
          },
          categoryMainTitle: "Principal",
          categoryQuestsTitle: "Misiones",
          categoryJourneymenTitle: "Artesanos",
          categoryMarketTitle: "Mercado",
          categoryCraftsmenTitle: "Artesanos",
          walkthrough: {
            step1Title: "Navegación",
            step1Body:
              "Usa esta fila superior para saltar entre Mapas, Bestiario, Equipo, Misiones, Comandos y el Menú.",
            step2Title: "Controles del mapa",
            step2Body:
              "Elige el piso, activa el modo subterráneo, usa la búsqueda y restablece los filtros rápidamente desde aquí.",
            step3Title: "Filtros",
            step3Body:
              "Activa categorías para mostrar marcadores. Los filtros activos se mantienen resaltados para que veas lo que está habilitado en este momento.",
            step4Title: "Mapa interactivo",
            step4Body:
              "Arrastra para mover la vista y usa la rueda para acercar. Selecciona un marcador para abrir detalles y accesos rápidos en el panel de información.",
            step5Title: "Menú del mapa con clic derecho",
            step5Body:
              "Haz clic derecho en el mapa para abrir el menú de acciones. Este menú contiene las acciones y herramientas disponibles para el mapa.",
            step6Title: "Argo, la corredora de información",
            step6Body:
              "Encontrarás el botón de Argo, la corredora de información, en la esquina inferior izquierda del mapa. Haz clic en él para abrir a Argo y preguntar sobre el juego.\n\nNota importante: Argo no es un sistema de IA.\n\nUsa un sistema basado en reglas que analiza tus mensajes, busca palabras clave y patrones, y consulta los datos reales del juego para encontrar información relevante. Sus respuestas provienen de lógica programada y diálogos escritos, no de un modelo de IA que genere respuestas.\n\nPor eso puede ser un poco exigente con la forma en que te expresas. Un texto poco claro, una frase inusual o una pregunta demasiado compleja pueden dar resultados inexactos o inesperados. Si no entiende lo que buscas, prueba con palabras clave concretas, como nombres de mobs, objetos, PNJ o ubicaciones.\n\n¡Ya está todo listo! ¡Disfruta explorando!"
          },
          runtimeError: "El mapa no se pudo cargar en este momento. Actualiza la página e inténtalo de nuevo.",
          runtimeTitle: "Mapa no disponible",
          mapContextMenu: {
            title: "ACCIONES DEL MAPA",
            createCustomMarker: "Crear marcador personalizado",
            distancePoint1: "Punto 1 de la calculadora de distancia",
            distancePoint2: "Punto 2 de la calculadora de distancia",
            resetDistance: "Restablecer calculadora de distancia",
            exportJourneyMap: "Exportar puntos de JourneyMap",
            importJourneyMap: "Importar puntos de JourneyMap",
            waypointTutorial: "Tutorial: cómo importar/exportar puntos de ruta",
            exportSuccess: "Exportación completada: {countLabel}.",
            exportWaypointOne: "1 punto de ruta",
            exportWaypointMany: "{count} puntos de ruta",
            exportNoWaypoints: "Activa al menos una categoría de puntos de ruta para exportar.",
            exportEmptyCategories: "Las categorías activadas no contienen puntos de ruta para exportar.",
            exportFailure: "La exportación de JourneyMap falló.",
            importSuccess: "Se importaron {waypoints} {waypointLabel} de {categories} {categoryLabel}.",
            importWaypointOne: "punto de ruta",
            importWaypointMany: "puntos de ruta",
            importCategoryOne: "categoría",
            importCategoryMany: "categorías",
            importNoWaypoints: "No se encontraron puntos de ruta válidos en este archivo.",
            importInvalid: "Este archivo de JourneyMap no es válido.",
            importUnsupported: "Este archivo de JourneyMap usa un formato o una dimensión no compatible.",
            importFailure: "La importación de JourneyMap falló. No se añadieron puntos de ruta.",
            importPartial: "Importados: {newLabel}; omitidos: {duplicateLabel}.",
            importNewOne: "1 punto de ruta nuevo",
            importNewMany: "{count} puntos de ruta nuevos",
            importDuplicateOne: "1 punto de ruta duplicado",
            importDuplicateMany: "{count} puntos de ruta duplicados",
            importDuplicatesOne: "Este punto de ruta de JourneyMap ya se había importado.",
            importDuplicatesMany: "{count} puntos de ruta de JourneyMap ya se habían importado."
          },
          distanceCalculator: { distance: "Distancia: {value}" },
          coordinatesPlaceholder: "X: -- Z: --",
          dataModeBanner: {
            beta: "¡Estos son datos de prueba beta! Gran parte de la información es inexacta, así que no me escribas si algo de aquí está mal. Solo recomiendo ver este tipo de datos si no encuentras lo que buscas en los datos actuales.",
            current:
              "Estos son datos actuales. Si algo de aquí está mal, envíame un mensaje y lo corregiré lo antes posible. Si no encuentras algo, revisa los datos de prueba beta. Ten en cuenta que gran parte de esa información es incorrecta, así que no la tomes como un hecho al 100%."
          },
          customWaypoint: {
            category: "Marcadores personalizados",
            createTitle: "Crear punto de ruta personalizado",
            nameLabel: "Nombre del punto de ruta",
            descriptionLabel: "Descripción del punto de ruta",
            coordinatesLabel: "Coordenadas",
            xLabel: "X",
            zLabel: "Z",
            buttonLabel: "Botón",
            buttonDefault: "Predeterminado",
            createButton: "Crear un botón",
            buttonNameLabel: "Nombre del botón",
            logoLabel: "Icono personalizado",
            logoPin: "Pin",
            logoStar: "Estrella",
            logoFlag: "Bandera",
            logoHome: "Casa",
            logoChest: "Cofre",
            logoSword: "Espada",
            logoShield: "Escudo",
            logoSkull: "Calavera",
            logoDiamond: "Diamante",
            logoTarget: "Objetivo",
            colorSelectorLabel: 'Selector de color para exportar a "JourneyMap"',
            colorHint: "Haz clic para elegir un color",
            colorHintBiomes: "El color de los biomas está fijado en blanco",
            colorPickerAria: "Elegir el color de la categoría de JourneyMap",
            colorHexAria: "Color HEX de la categoría de JourneyMap",
            colorHexPlaceholder: "#RRGGBB",
            invalidHex: "Color HEX no válido",
            confirm: "Confirmar creación",
            cancel: "Cancelar creación",
            confirmAction: "Confirmar",
            cancelAction: "Cancelar",
            copy: "Copiar coordenadas",
            copySuccess: "Coordenadas copiadas.",
            copyError: "No se pudieron copiar las coordenadas.",
            nameRequired: "Introduce un nombre para el punto de ruta.",
            coordinatesRequired: "Introduce coordenadas X y Z válidas.",
            manualCoordinates: "Introduce X y Z manualmente; este mapa aún no tiene calibración de coordenadas.",
            performanceWarning:
              "Añadir más puntos de ruta personalizados puede reducir el rendimiento del mapa. Una gran cantidad de puntos puede ralentizarlo, especialmente al acercar, alejar o moverte por el mapa.",
            delete: "Eliminar punto de ruta personalizado",
            deleteButton: "Eliminar botón",
            deleteAction: "Eliminar",
            deleteButtonWarning: "Todos los puntos de ruta de este botón se eliminarán junto con el botón",
            areYouSure: "¿Estás seguro?",
            confirmDelete: "Confirmar eliminación",
            deleteConfirm: "¿Eliminar este punto de ruta personalizado?"
          }
        },
        mainui: {
          mapContextMenu: {
            title: "ACCIONES DEL MAPA",
            createCustomMarker: "Crear marcador personalizado",
            distancePoint1: "Punto 1 de la calculadora de distancia",
            distancePoint2: "Punto 2 de la calculadora de distancia",
            resetDistance: "Restablecer calculadora de distancia",
            exportJourneyMap: "Exportar puntos de JourneyMap",
            importJourneyMap: "Importar puntos de JourneyMap",
            waypointTutorial: "Tutorial: cómo importar/exportar puntos de ruta",
            exportSuccess: "Exportación completada: {countLabel}.",
            exportWaypointOne: "1 punto de ruta",
            exportWaypointMany: "{count} puntos de ruta",
            exportNoWaypoints: "Activa al menos una categoría de puntos de ruta para exportar.",
            exportEmptyCategories: "Las categorías activadas no contienen puntos de ruta para exportar.",
            exportFailure: "La exportación de JourneyMap falló.",
            importSuccess: "Se importaron {waypoints} {waypointLabel} de {categories} {categoryLabel}.",
            importWaypointOne: "punto de ruta",
            importWaypointMany: "puntos de ruta",
            importCategoryOne: "categoría",
            importCategoryMany: "categorías",
            importNoWaypoints: "No se encontraron puntos de ruta válidos en este archivo.",
            importInvalid: "Este archivo de JourneyMap no es válido.",
            importUnsupported: "Este archivo de JourneyMap usa un formato o una dimensión no compatible.",
            importFailure: "La importación de JourneyMap falló. No se añadieron puntos de ruta.",
            importPartial: "Importados: {newLabel}; omitidos: {duplicateLabel}.",
            importNewOne: "1 punto de ruta nuevo",
            importNewMany: "{count} puntos de ruta nuevos",
            importDuplicateOne: "1 punto de ruta duplicado",
            importDuplicateMany: "{count} puntos de ruta duplicados",
            importDuplicatesOne: "Este punto de ruta de JourneyMap ya se había importado.",
            importDuplicatesMany: "{count} puntos de ruta de JourneyMap ya se habían importado."
          },
          categories: {
            custom: "Marcadores personalizados",
            npc: "PNJ",
            mainQuests: "Misiones principales",
            rulid: "Aparición de trigo",
            fishingSpot: "Punto de pesca",
            oakWood: "Madera de roble",
            copper: "Cobre",
            iron: "Hierro",
            coal: "Carbón"
          },
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
            step3Body:
              "Activa categorías para mostrar marcadores coincidentes. Los filtros deshabilitados se ocultan automáticamente cuando no son válidos para la isla seleccionada.",
            step4Title: "Mapa interactivo",
            step4Body:
              "Arrastra para desplazarte, desplázate para hacer zoom y selecciona un marcador para abrir detalles en el panel lateral.",
            step5Title: "Menú del mapa con clic derecho",
            step5Body:
              "Haz clic derecho en el mapa para abrir el menú de acciones. Este menú contiene las acciones y herramientas disponibles para el mapa.",
            step6Title: "Argo, la corredora de información",
            step6Body:
              "Encontrarás el botón de Argo, la corredora de información, en la esquina inferior izquierda del mapa. Haz clic en él para abrir a Argo y preguntar sobre el juego.\n\nNota importante: Argo no es un sistema de IA.\n\nUsa un sistema basado en reglas que analiza tus mensajes, busca palabras clave y patrones, y consulta los datos reales del juego para encontrar información relevante. Sus respuestas provienen de lógica programada y diálogos escritos, no de un modelo de IA que genere respuestas.\n\nPor eso puede ser un poco exigente con la forma en que te expresas. Un texto poco claro, una frase inusual o una pregunta demasiado compleja pueden dar resultados inexactos o inesperados. Si no entiende lo que buscas, prueba con palabras clave concretas, como nombres de mobs, objetos, PNJ o ubicaciones.\n\n¡Ya está todo listo! ¡Disfruta explorando!"
          },
          runtimeError: "El mapa no se pudo cargar en este momento. Actualiza la página e inténtalo de nuevo.",
          runtimeTitle: "Mapa no disponible",
          coordinatesPlaceholder: "X: -- Z: --"
        },
        miscinfo: {
          title: "Info. Varia",
          heading: "Info. Varia",
          back: "Volver al Menu",
          playerLevels: "Niveles del jugador",
          playerLevelsDetails:
            "Nivel 1 -> 2: 150 XP\nNivel 2 -> 3: 300 XP\nNivel 3 -> 4: 600 XP\nNivel 4 -> 5: 1,350 XP\nNivel 5 -> 6: 2,700 XP\nNivel 6 -> 7: 5,100 XP\nNivel 7 -> 8: 9,000 XP\nNivel 8 -> 9: 15,000 XP\nNivel 9 -> 10: 24,000 XP",
          translationNotice:
            "La mayor parte del contenido de esta página todavía no está traducida porque el sitio lo mantiene una sola persona con poco tiempo."
        },
        patchnotes: {
          entries: {
            v140: {
              title: "Actualización de Character Build y de la interfaz principal",
              summary:
                "• Se añadió el sistema completo de Character Build con compatibilidad para datos actuales y datos de prueba beta.\n• Se añadieron grandes mejoras y una renovación completa de la interfaz y la capacidad de respuesta del sitio web.\n• Se rediseñaron las secciones de Equipo, Misiones, Notas de parche, Info. Varia, Defensa de torres y Compendio.\n• Se añadieron y ampliaron las traducciones en todo el sitio web.\n• Se mejoraron la reactividad, el rendimiento, la carga y la compatibilidad del sitio web con los navegadores.\n• Se corrigieron estadísticas de equipo ausentes o incorrectas y varios problemas de interfaz.\n• Se actualizó y mejoró el recorrido guiado del sitio web.\n• Se añadieron datos beta e información relacionada con su carga.\n• Se realizaron numerosos arreglos pequeños, mejoras y cambios de calidad de vida en todo el sitio web."
            },
            v130: {
              title: "Actualización de idioma y compatibilidad",
              summary:
                "• Se añadió soporte de idiomas en francés y español. La cobertura de traducciones todavía estaba incompleta en el momento de este lanzamiento.\n• Se añadió una guía de recorrido por la web.\n• Se mejoró la compatibilidad con más navegadores web.\n• Se optimizó y reorganizó el código para facilitar futuras actualizaciones y mantenimiento.\n\n• Esta debería ser la última actualización del sitio hasta que el servidor vuelva a estar en línea."
            },
            v120: {
              title: "Correción muy pequeña",
              summary:
                "• Se corrigió que el menú de comandos se cargara indefinidamente.\n• Se corrigió el orden de notas desde la fecha más antigua a la más reciente."
            },
            v111: {
              title: "Toques finales",
              summary:
                "• Se añadió una pestaña de comandos.\n• Se añadió una sección de información variada.\n• Se añadieron botones de regreso al menú por toda la web.\n• Se añadió la sección de Fractured Underworld, aunque sigue en etapas tempranas.\n• Se empezó a trabajar en la defensa de torres para Fractured Underworld.\n• Se añadió un aviso breve al Welcome Mat.\n• Se corrigió un error de waypoints.\n• Se corrigió un error visual."
            },
            v100: {
              title: "Versión completa",
              summary:
                "• Se añadió el piso 3 y sus waypoints disponibles.\n• La información de misiones principales de los pisos 1 a 3 sigue faltando.\n• Algunos waypoints del piso 3 no funcionan por falta de información.\n• Se optimizó el código del sitio.\n• Se completó el compendio de equipo.\n• La mayoría de botones ya están ordenados alfabéticamente.\n• Se actualizó y mejoró la interfaz.\n• Se rediseñó la portada.\n• Se añadieron enlaces a Discord de SAO MC, soporte y perfil personal.\n• Contáctame por Discord para sugerencias o reportes de errores."
            },
            v010: {
              title: "Lanzamiento del sitio",
              summary:
                "Lanzamiento inicial del sitio. Se añadieron el piso 1, ubicaciones de misiones secundarias, biomas, mazmorras, el menú de misiones y el bestiario."
            },
            v020: {
              title: "Nuevos mapas",
              summary:
                "Se añadió el piso 2, los principales waypoints del piso 1 y 2, interacciones que abren el bestiario o el menú de misiones, y la pantalla principal del sitio."
            }
          },
          tags: {
            bugFixes: "Correciones",
            betaTestData: "Datos de prueba beta",
            characterBuild: "Character Build",
            uiOverhaul: "Renovación de interfaz",
            commands: "Comandos",
            maps: "Mapas",
            release: "Lanzamiento",
            localization: "Localización",
            performance: "Rendimiento",
            compatibility: "Compatibilidad",
            maintenance: "Mantenimiento",
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
            npcs: "PNJ",
            floor2: "Piso 2",
            poi: "POI",
            waypoints: "Waypoints",
            mainMenu: "Menú principal",
            compendium: "Compendio"
          }
        },
        towerdefense: {
          arc1Title: "Arco 1 - Tutorial (Boar Planes)",
          arc1Rewards:
            "Bolsa de 100 Col (100%), Cristal de utilidad (25%), Runa menor de PvE (8%), Llave de mazmorra (4%), Helecho (objeto de hábitat) (30%), Linterna escarchada (objeto de hábitat) (20%), Fogata (objeto de hábitat) (20%)",
          arc1Waves: "5 oleadas, en la quinta aparece un pumba reskin como jefe.",
          arc2Title: "Arco 2 - Medio (Boar Zones)",
          arc2Rewards:
            "Bolsa de 500 Col (100%), Cristal de utilidad (40%), Runa menor de PvE (18%), Llave de mazmorra (12%), Helecho (hábitat) (30%), Paca de heno (hábitat) (20%)",
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
                three:
                  "Nivel 3 -> 4: +.3 velocidad de ataque, +2 alcance, +3 daño (1,7 velocidad de ataque, 13 alcance, 12 daño)",
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
    fr: {
      ui: {
        nav: {
          sectionAria: "Navigation de section",
          primaryAria: "Navigation principale",
          islandAria: "Navigation de l'île"
        },
        pageNotice:
          "Certaines traductions peuvent être incomplètes, incorrectes ou contenir des erreurs de grammaire. Désolé ! Ce site est maintenu par un seul développeur qui ne parle qu’anglais, ce qui peut rendre difficile la mise à jour des autres langues. Si vous trouvez quelque chose qui nécessite une traduction, n’hésitez pas à contacter le développeur sur Discord.",
        walkthrough: {
          skip: "Passer",
          back: "Retour",
          next: "Suivant",
          finish: "Terminer",
          step: "Étape {current} sur {total}",
          welcomeTitle: "Bienvenue",
          welcomeBody: "Ceci est la page d'accueil. Utilise cette page pour choisir quel module SAO MC ouvrir.",
          modeCardsTitle: "Cartes de modes",
          modeCardsBody:
            "Choisis Aincrad ou Fractured Underworld pour lancer un module. La carte GGO est actuellement verrouillée jusqu'à sa sortie.",
          discordTitle: "Liens",
          discordBody: "Ouvre des liens rapides vers le profil du créateur et le Discord SAO MC.",
          settingsTitle: "Paramètres",
          settingsBody: "Utilise la roue pour changer de langue et rejouer cette visite guidée quand tu veux."
        }
      },
      page: {
        uwcompendium: {
          eyebrow: "FRACTURED UNDERWORLD / COMPENDIUM",
          title: "Compendium de Fractured Underworld",
          map: "Retour à la carte",
          searchLabel: "Rechercher",
          searchPlaceholder: "Rechercher dans le compendium...",
          statusShown: "Affichage de {visible} sur {total} entrées.",
          noEntries: "Aucune entrée de compendium trouvée.",
          unavailable: "Les données du compendium bêta ne sont pas encore disponibles.",
          insufficientInfo: "Il n'y a pas encore assez d'informations publiées pour créer une page."
        },
        bestiary: {
          eyebrow: "AINCRAD / BESTIAIRE",
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
          statusShownBoss: "{visible} sur {total} boss affichés.",
          statusShownDungeonBoss: "{visible} sur {total} boss de donjon affichés.",
          statusShownDungeonMobs: "{visible} sur {total} mobs de donjon affichés.",
          statusShownRegular: "{visible} sur {total} mobs réguliers affichés.",
          emptyCategory: "Aucune entrée pour {category} pour le moment.",
          drops: "Butins",
          aggressiveness: "Agressivité",
          aggressive: "Agressif",
          neutral: "Neutre",
          passive: "Passif",
          xp: "XP",
          na: "N/A",
          loadError: "Les données du bestiaire n'ont pas pu être chargées. Actualise la page et réessaie.",
          loadUnavailable: "Les données du bestiaire ne sont actuellement pas disponibles."
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
          loadUnavailable: "Les commandes ne sont actuellement pas disponibles."
        },
        ecompendium: {
          eyebrow: "AINCRAD / COMPENDIUM D'ÉQUIPEMENT",
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
            resources: "Ressources"
          },
          unknownItem: "Objet inconnu",
          loadError: "Les données d'équipement n'ont pas pu être chargées. Actualise la page et réessaie.",
          loadUnavailable: "Les données d'équipement ne sont actuellement pas disponibles."
        },
        quests: {
          eyebrow: "AINCRAD / QUÊTES",
          title: "Guide des quêtes d'Aincrad",
          heading: "Quêtes",
          logoAria: "Logo des quêtes",
          searchLabel: "Rechercher des quêtes",
          searchPlaceholder: "Rechercher dans n'importe quelle colonne...",
          questTypeFilterAria: "Filtre de type de quête",
          questTypes: {
            main: "Quêtes principales",
            side: "Quêtes secondaires"
          },
          questFiltersAria: "Filtres de quêtes",
          cityFilterLabel: "Ville",
          allCities: "Toutes les villes",
          completionFilterLabel: "État",
          allQuests: "Toutes les quêtes",
          completedOnly: "Terminées uniquement",
          incompleteOnly: "Non terminées",
          noFilterMatch: "Aucune quête ne correspond aux filtres actuels.",
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
          questNumber: "Quête {number}",
          floorText: "Étage",
          titleWithFloor: "Quêtes - {floor}",
          noQuestData: "Aucune donnée de quête n'a encore été ajoutée pour {floor}.",
          noQuestMatchFloor: "Aucune entrée de quête ne correspond à ta recherche sur {floor}. {completed} terminé.",
          shownStatus: "{visible} sur {total} entrées de quête affichées pour {floor} || {completed} terminé.",
          loadedStatus: "{count} entrées de quête chargées pour {floor}."
        },
        maps: {
          categories: {
            custom: "Marqueurs personnalisés",
            biomes: "Biomes",
            bossSpawns: "Apparitions de boss",
            dungeons: "Donjons",
            farmingSpots: "Zones de récolte",
            main: "Quêtes principales",
            mobAreas: "Zones de mobs",
            worldEvents: "Événement mondial",
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
            equipmentBlacksmith: "Forgeron d'équipement",
            secretAccessoryBlacksmith: "Forgeron secret d'accessoires",
            armorBlacksmith: "Forgeron d'armures",
            ingotBlacksmith: "Forgeron de lingots",
            keyBlacksmith: "Forgeron de clés",
            materialsBlacksmith: "Forgeron de matériaux",
            refaire: "Refaire",
            runeCraftsmen: "Artisans de runes",
            weaponsmith: "Forgeron d'armes"
          },
          floorOptions: {
            floor1: "Étage 1 - La ville du début",
            floor2: "Étage 2 - Désert aride",
            floor3: "Étage 3 - La forêt errante"
          },
          categoryMainTitle: "Principal",
          categoryQuestsTitle: "Quêtes",
          categoryJourneymenTitle: "Artisans",
          categoryMarketTitle: "Marché",
          categoryCraftsmenTitle: "Artisans",
          walkthrough: {
            step1Title: "Navigation",
            step1Body:
              "Utilise cette ligne du haut pour passer entre Cartes, Bestiaire, Équipement, Quêtes, Commandes et le Menu.",
            step2Title: "Contrôles de carte",
            step2Body:
              "Choisis l'étage, active le mode souterrain, utilise la recherche et réinitialise rapidement les filtres depuis ici.",
            step3Title: "Filtres",
            step3Body:
              "Active les catégories pour afficher les marqueurs. Les filtres actifs restent mis en surbrillance pour que tu voies clairement ce qui est activé.",
            step4Title: "Carte interactive",
            step4Body:
              "Fais glisser pour déplacer et utilise la molette pour zoomer. Sélectionne un marqueur pour ouvrir les détails et les raccourcis dans le panneau d'informations.",
            step5Title: "Menu contextuel du clic droit",
            step5Body:
              "Fais un clic droit sur la carte pour ouvrir le menu d'actions. Ce menu contient les actions et outils disponibles pour la carte.",
            step6Title: "Argo, l'informatrice",
            step6Body:
              "Tu trouveras le bouton d'Argo, l'informatrice, dans le coin inférieur gauche de la carte. Clique dessus pour ouvrir Argo et poser des questions sur le jeu.\n\nRemarque importante : Argo n'est pas un système d'IA.\n\nElle utilise un système à base de règles qui analyse tes messages, recherche des mots-clés et des motifs, puis consulte les données réelles du jeu pour trouver les informations pertinentes. Ses réponses viennent d'une logique programmée et de dialogues écrits, et non d'un modèle d'IA qui génère des réponses.\n\nC'est pourquoi elle peut être un peu pointilleuse sur la formulation. Un texte peu clair, une tournure inhabituelle ou une question trop complexe peuvent donner des résultats inexacts ou inattendus. Si elle ne comprend pas ce que tu cherches, essaie des mots-clés précis, comme des noms de monstres, d'objets, de PNJ ou de lieux.\n\nTout est prêt ! Bonne exploration !"
          },
          runtimeError: "La carte n'a pas pu être chargée pour le moment. Actualise la page et réessaie.",
          runtimeTitle: "Carte indisponible",
          mapContextMenu: {
            title: "ACTIONS DE LA CARTE",
            createCustomMarker: "Créer un marqueur personnalisé",
            distancePoint1: "Point 1 de la calculatrice de distance",
            distancePoint2: "Point 2 de la calculatrice de distance",
            resetDistance: "Réinitialiser la calculatrice de distance",
            exportJourneyMap: "Exporter les points JourneyMap",
            importJourneyMap: "Importer les points JourneyMap",
            waypointTutorial: "Tutoriel : importer/exporter des points de passage",
            exportSuccess: "Export terminé : {countLabel}.",
            exportWaypointOne: "1 point de passage",
            exportWaypointMany: "{count} points de passage",
            exportNoWaypoints: "Active au moins une catégorie de points de passage à exporter.",
            exportEmptyCategories: "Les catégories activées ne contiennent aucun point de passage à exporter.",
            exportFailure: "L'exportation JourneyMap a échoué.",
            importSuccess: "Import terminé : {waypoints} {waypointLabel} dans {categories} {categoryLabel}.",
            importWaypointOne: "point de passage",
            importWaypointMany: "points de passage",
            importCategoryOne: "catégorie",
            importCategoryMany: "catégories",
            importNoWaypoints: "Aucun point de passage valide n'a été trouvé dans ce fichier.",
            importInvalid: "Ce fichier JourneyMap n'est pas valide.",
            importUnsupported: "Ce fichier JourneyMap utilise un format ou une dimension non pris en charge.",
            importFailure: "L'importation JourneyMap a échoué. Aucun point de passage n'a été ajouté.",
            importPartial: "Import : {newLabel} ; doublons ignorés : {duplicateLabel}.",
            importNewOne: "1 nouveau point de passage",
            importNewMany: "{count} nouveaux points de passage",
            importDuplicateOne: "1 point de passage en doublon",
            importDuplicateMany: "{count} points de passage en doublon",
            importDuplicatesOne: "Ce point de passage JourneyMap avait déjà été importé.",
            importDuplicatesMany: "{count} points de passage JourneyMap avaient déjà été importés."
          },
          distanceCalculator: { distance: "Distance : {value}" },
          coordinatesPlaceholder: "X : -- Z : --",
          dataModeBanner: {
            beta: "Ce sont des données de test bêta ! Une grande partie des informations est inexacte, alors ne m'écris pas si quelque chose ici est faux. Je recommande de consulter ce type de données uniquement si tu ne trouves pas ce que tu cherches dans les données actuelles.",
            current:
              "Ce sont des données actuelles. Si une information ici est fausse, envoie-moi un message et je la corrigerai dès que possible. Si tu ne trouves pas quelque chose, consulte les données de test bêta. Garde simplement en tête qu'une grande partie de ces informations est incorrecte, alors ne les prends pas pour 100 % exactes."
          },
          customWaypoint: {
            category: "Marqueurs personnalisés",
            createTitle: "Créer un point de passage personnalisé",
            nameLabel: "Nom du point de passage",
            descriptionLabel: "Description du point de passage",
            coordinatesLabel: "Coordonnées",
            xLabel: "X",
            zLabel: "Z",
            buttonLabel: "Bouton",
            buttonDefault: "Par défaut",
            createButton: "Créer un bouton",
            buttonNameLabel: "Nom du bouton",
            logoLabel: "Icône personnalisée",
            logoPin: "Repère",
            logoStar: "Étoile",
            logoFlag: "Drapeau",
            logoHome: "Maison",
            logoChest: "Coffre",
            logoSword: "Épée",
            logoShield: "Bouclier",
            logoSkull: "Crâne",
            logoDiamond: "Diamant",
            logoTarget: "Cible",
            colorSelectorLabel: 'Sélecteur de couleur pour l\'export "JourneyMap"',
            colorHint: "Cliquez pour choisir une couleur",
            colorHintBiomes: "La couleur des biomes est fixée au blanc",
            colorPickerAria: "Choisir la couleur de la catégorie JourneyMap",
            colorHexAria: "Couleur HEX de la catégorie JourneyMap",
            colorHexPlaceholder: "#RRGGBB",
            invalidHex: "Couleur HEX non valide",
            confirm: "Confirmer la création",
            cancel: "Annuler la création",
            confirmAction: "Confirmer",
            cancelAction: "Annuler",
            copy: "Copier les coordonnées",
            copySuccess: "Coordonnées copiées.",
            copyError: "Impossible de copier les coordonnées.",
            nameRequired: "Saisis un nom pour le point de passage.",
            coordinatesRequired: "Saisis des coordonnées X et Z valides.",
            manualCoordinates: "Saisis X et Z manuellement ; cette carte n'est pas encore calibrée.",
            performanceWarning:
              "Ajouter de nombreux points de passage personnalisés peut réduire les performances de la carte. Un grand nombre de points peut la ralentir, surtout lors du zoom ou des déplacements.",
            delete: "Supprimer le point de passage personnalisé",
            deleteButton: "Supprimer le bouton",
            deleteAction: "Supprimer",
            deleteButtonWarning: "Tous les points de passage de ce bouton seront supprimés avec le bouton",
            areYouSure: "Es-tu sûr ?",
            confirmDelete: "Confirmer la suppression",
            deleteConfirm: "Supprimer ce point de passage personnalisé ?"
          }
        },
        mainui: {
          mapContextMenu: {
            title: "ACTIONS DE LA CARTE",
            createCustomMarker: "Créer un marqueur personnalisé",
            distancePoint1: "Point 1 de la calculatrice de distance",
            distancePoint2: "Point 2 de la calculatrice de distance",
            resetDistance: "Réinitialiser la calculatrice de distance",
            exportJourneyMap: "Exporter les points JourneyMap",
            importJourneyMap: "Importer les points JourneyMap",
            waypointTutorial: "Tutoriel : importer/exporter des points de passage",
            exportSuccess: "Export terminé : {countLabel}.",
            exportWaypointOne: "1 point de passage",
            exportWaypointMany: "{count} points de passage",
            exportNoWaypoints: "Active au moins une catégorie de points de passage à exporter.",
            exportEmptyCategories: "Les catégories activées ne contiennent aucun point de passage à exporter.",
            exportFailure: "L'exportation JourneyMap a échoué.",
            importSuccess: "Import terminé : {waypoints} {waypointLabel} dans {categories} {categoryLabel}.",
            importWaypointOne: "point de passage",
            importWaypointMany: "points de passage",
            importCategoryOne: "catégorie",
            importCategoryMany: "catégories",
            importNoWaypoints: "Aucun point de passage valide n'a été trouvé dans ce fichier.",
            importInvalid: "Ce fichier JourneyMap n'est pas valide.",
            importUnsupported: "Ce fichier JourneyMap utilise un format ou une dimension non pris en charge.",
            importFailure: "L'importation JourneyMap a échoué. Aucun point de passage n'a été ajouté.",
            importPartial: "Import : {newLabel} ; doublons ignorés : {duplicateLabel}.",
            importNewOne: "1 nouveau point de passage",
            importNewMany: "{count} nouveaux points de passage",
            importDuplicateOne: "1 point de passage en doublon",
            importDuplicateMany: "{count} points de passage en doublon",
            importDuplicatesOne: "Ce point de passage JourneyMap avait déjà été importé.",
            importDuplicatesMany: "{count} points de passage JourneyMap avaient déjà été importés."
          },
          categories: {
            custom: "Marqueurs personnalisés",
            npc: "PNJ",
            mainQuests: "Quêtes principales",
            rulid: "Apparition de blé",
            fishingSpot: "Zone de pêche",
            oakWood: "Bois de chêne",
            copper: "Cuivre",
            iron: "Fer",
            coal: "Charbon"
          },
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
            step2Body:
              "Change d'île, active le mode souterrain, recherche des marqueurs et réinitialise rapidement les filtres.",
            step3Title: "Filtres",
            step3Body:
              "Active des catégories pour afficher les marqueurs correspondants. Les filtres désactivés se cachent automatiquement lorsqu'ils ne sont pas valides pour l'île sélectionnée.",
            step4Title: "Carte interactive",
            step4Body:
              "Fais glisser pour déplacer, utilise la molette pour zoomer et sélectionne un marqueur pour ouvrir les détails dans le panneau latéral.",
            step5Title: "Menu contextuel du clic droit",
            step5Body:
              "Fais un clic droit sur la carte pour ouvrir le menu d'actions. Ce menu contient les actions et outils disponibles pour la carte.",
            step6Title: "Argo, l'informatrice",
            step6Body:
              "Tu trouveras le bouton d'Argo, l'informatrice, dans le coin inférieur gauche de la carte. Clique dessus pour ouvrir Argo et poser des questions sur le jeu.\n\nRemarque importante : Argo n'est pas un système d'IA.\n\nElle utilise un système à base de règles qui analyse tes messages, recherche des mots-clés et des motifs, puis consulte les données réelles du jeu pour trouver les informations pertinentes. Ses réponses viennent d'une logique programmée et de dialogues écrits, et non d'un modèle d'IA qui génère des réponses.\n\nC'est pourquoi elle peut être un peu pointilleuse sur la formulation. Un texte peu clair, une tournure inhabituelle ou une question trop complexe peuvent donner des résultats inexacts ou inattendus. Si elle ne comprend pas ce que tu cherches, essaie des mots-clés précis, comme des noms de monstres, d'objets, de PNJ ou de lieux.\n\nTout est prêt ! Bonne exploration !"
          },
          runtimeError: "La carte n'a pas pu être chargée pour le moment. Actualise la page et réessaie.",
          runtimeTitle: "Carte indisponible",
          coordinatesPlaceholder: "X : -- Z : --"
        },
        miscinfo: {
          title: "Infos diverses",
          heading: "Infos diverses",
          back: "Retour au menu",
          playerLevels: "Niveaux du joueur",
          playerLevelsDetails:
            "Niveau 1 -> 2 : 150 XP\nNiveau 2 -> 3 : 300 XP\nNiveau 3 -> 4 : 600 XP\nNiveau 4 -> 5 : 1 350 XP\nNiveau 5 -> 6 : 2 700 XP\nNiveau 6 -> 7 : 5 100 XP\nNiveau 7 -> 8 : 9 000 XP\nNiveau 8 -> 9 : 15 000 XP\nNiveau 9 -> 10 : 24 000 XP",
          translationNotice:
            "La majeure partie du contenu de cette page n'est pas encore traduite, car le site est géré par une seule personne avec peu de temps."
        },
        patchnotes: {
          entries: {
            v140: {
              title: "Mise à jour de Character Build et de l'interface majeure",
              summary:
                "• Le système complet Character Build avec prise en charge des données actuelles et des données de test bêta a été ajouté.\n• De grandes améliorations et une refonte complète de l'interface et de l'adaptation du site ont été ajoutées.\n• Les sections Équipement, Quêtes, Notes de patch, Infos diverses, Défense de tours et Compendium ont été repensées.\n• Les traductions ont été ajoutées et étendues dans tout le site.\n• La réactivité, les performances, le chargement et la compatibilité du site avec les navigateurs ont été améliorés.\n• Les statistiques d'équipement manquantes ou incorrectes et divers problèmes d'interface ont été corrigés.\n• La visite guidée du site a été mise à jour et améliorée.\n• Les données bêta et les informations liées à leur chargement ont été ajoutées.\n• De nombreux petits correctifs, améliorations et changements de qualité de vie ont été apportés dans tout le site."
            },
            v130: {
              title: "Mise à jour de langue et compatibilité",
              summary:
                "• Le support des langues français et espagnol a été ajouté. La couverture des traductions était encore incomplète au moment de cette version.\n• Un guide de visite du site a été ajouté.\n• La compatibilité avec davantage de navigateurs web a été améliorée.\n• Le code a été optimisé et réorganisé pour faciliter les futures mises à jour et maintenance.\n\n• Ce devrait être la dernière mise à jour du site avant le retour du serveur en ligne."
            },
            v120: {
              title: "Correctif très mineur",
              summary:
                "• Le chargement du menu des commandes a été corrigé.\n• L'ordre des notes de patch a été corrigé du plus ancien au plus récent."
            },
            v111: {
              title: "Finitions",
              summary:
                "• Un onglet commandes a été ajouté.\n• Une section Infos diverses a été ajoutée.\n• Des boutons Retour au menu ont été ajoutés partout sur le site.\n• La section Fractured Underworld a été ajoutée, bien qu'elle soit encore au début de son développement.\n• Le travail sur Tower Defense a commencé.\n• Une courte notice a été ajoutée sur la page d'accueil.\n• Un bug de waypoint a été corrigé.\n• Un bug d'interface a été corrigé."
            },
            v100: {
              title: "Version complète",
              summary:
                "• L'étage 3 et ses waypoints disponibles ont été ajoutés.\n• Les informations de quête principale pour les étages 1 à 3 manquent encore.\n• Certains waypoints de l'étage 3 ne fonctionnent pas volontairement à cause d'un manque d'informations.\n• Le code du site a été optimisé.\n• Le compendium d'équipement a été terminé.\n• La plupart des boutons sont maintenant triés par ordre alphabétique.\n• L'interface du site a été mise à jour et améliorée.\n• La page d'accueil a été repensée.\n• Des boutons vers le Discord SAO MC, le support et mon profil personnel ont été ajoutés.\n• Contacte-moi sur Discord pour des suggestions ou des rapports de bugs."
            },
            v010: {
              title: "Version du site",
              summary:
                "Lancement initial du site. L'étage 1, les lieux de quêtes annexes, les biomes, les donjons, le menu des quêtes et le menu du bestiaire ont été ajoutés."
            },
            v020: {
              title: "Nouvelles cartes",
              summary:
                "L'étage 2, les principaux waypoints POI des étages 1 et 2, les interactions de waypoints qui ouvrent le bestiaire ou le menu des quêtes, ainsi que l'écran du menu principal ont été ajoutés."
            }
          },
          tags: {
            bugFixes: "Corrections",
            betaTestData: "Données de test bêta",
            characterBuild: "Character Build",
            uiOverhaul: "Refonte de l'interface",
            commands: "Commandes",
            maps: "Cartes",
            release: "Version",
            localization: "Localisation",
            performance: "Performance",
            compatibility: "Compatibilité",
            maintenance: "Maintenance",
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
            npcs: "PNJ",
            floor2: "Étage 2",
            poi: "POI",
            waypoints: "Waypoints",
            mainMenu: "Menu principal",
            compendium: "Compendium"
          }
        },
        towerdefense: {
          arc1Title: "Arc 1 - Tutoriel (Boar Planes)",
          arc1Rewards:
            "Pochon de 100 Col (100 %), Cristal d'utilité (25 %), Rune PvE mineure (8 %), Clé de donjon (4 %), Fougère (objet d'habitat) (30 %), Lanterne givrée (objet d'habitat) (20 %), Feu de camp (objet d'habitat) (20 %)",
          arc1Waves: "5 vagues, à la cinquième une version reskin du pumba apparaît comme boss.",
          arc2Title: "Arc 2 - Moyen (Boar Zones)",
          arc2Rewards:
            "Bourse de 500 Col (100 %), Cristal d'utilité (40 %), Rune PvE mineure (18 %), Clé de donjon (12 %), Fougère (habitat) (30 %), Botte de foin (habitat) (20 %)",
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
                three:
                  "Niveau 3 -> 4 : +.3 vitesse d'attaque, +2 portée, +3 dégâts (1,7 vitesse d'attaque, 13 portée, 12 dégâts)",
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

  translations.en = deepMerge(translations.en, {
    page: {
      quests: { emptyState: "No quest entries to display." },
      maps: {
        categories: { main: "Main Quests" },
        sidebarResizeAria: "Resize sidebar",
        zoomIn: "Zoom in",
        zoomOut: "Zoom out"
      }
    }
  });
  translations.es = deepMerge(translations.es, {
    languageName: "Español",
    dataset: {
      betaLabel: "Datos de prueba beta",
      currentLabel: "Datos actuales",
      betaDescription:
        "Información experimental de las pruebas beta. Algunos detalles pueden estar incompletos o ser inexactos.",
      currentDescription:
        "El conjunto de datos que se mantiene al día. Si falta algo, consulta los datos de prueba beta hasta que la información esté disponible aquí.",
      betaBadge: "Legado",
      currentBadge: "Recomendado",
      chooseTitle: "Elegir versión de datos",
      cancel: "Cancelar",
      close: "Cerrar selección de datos"
    },
    page: {
      index: {},
      maps: {
        title: "Mapa interactivo de SAO",
        floorLabel: "Piso:",
        undergroundLabel: "Subterráneo:",
        searchPlaceholder: "Buscar marcadores...",
        clearFilters: "Borrar filtros",
        mapAlt: "Mapa del piso",
        undergroundAlt: "Capa subterránea",
        resetView: "Restablecer vista",
        defaultInfoTitle: "Selecciona un marcador",
        defaultInfoBody: "Elige un marcador del mapa para ver los detalles aquí.",
        chooseCategoryTitle: "Elige una categoría",
        chooseCategoryBody: "Activa una o más categorías en la barra lateral para mostrar marcadores de este piso.",
        noSearchTitle: "Sin coincidencias de búsqueda",
        noSearchBody: "Ningún marcador coincide con tu búsqueda actual en este piso.",
        noMarkersTitle: "No hay marcadores disponibles",
        noMarkersBody: "No hay marcadores disponibles para las categorías seleccionadas en este piso.",
        noMobEntries: "Todavía no hay entradas de mobs disponibles para esta zona.",
        mobType: "Tipo",
        mobAreaType: "Zona de mobs",
        availableMobs: "Mobs disponibles",
        floorText: "Piso",
        tutorial: "Tutorial",
        coordinates: "Coordenadas",
        mobs: "Mobs",
        viewWaypointInfo: "Ver información del waypoint",
        clusterTitle: "{count} puntos de referencia",
        clusterBody:
          "Estos {count} puntos de referencia están muy juntos en este nivel de zoom. Abre uno para ver sus detalles.",
        visitedDefeated: "Derrotado",
        visitedCompleted: "Completado",
        visitedVisited: "Visitado",
        categories: { main: "Principal" },
        sidebarResizeAria: "Cambiar tamaño de la barra lateral",
        sharedQuests: "Misiones en esta ubicación",
        zoomIn: "Acercar",
        zoomOut: "Alejar"
      },
      mainui: {
        towerDefenseNav: "Defensa de torres",
        compendiumNav: "Compendio",
        compendiumToast: "Todavía no hay suficiente información publicada para crear una página.",
        title: "Mapa interactivo de SAO",
        mapDataUnavailableTitle: "MAPA DEL UNDERWORLD FRACTURADO",
        mapDataUnavailableBody: "Los datos del mapa se están desarrollando actualmente.",
        mapDataUnavailableFooter: "Los datos de NPC y del mapa se añadirán a medida que progrese este módulo.",
        translationNotice: "La mayor parte del contenido de esta página todavía no está traducida.",
        searchPlaceholder: "Buscar marcadores...",
        resetView: "Restablecer vista",
        defaultInfoTitle: "Selecciona un marcador",
        defaultInfoBody: "Elige un marcador del mapa para ver los detalles aquí.",
        chooseCategoryTitle: "Elige una categoría",
        chooseCategoryBody: "Activa una o más categorías para mostrar marcadores de esta isla.",
        noSearchTitle: "Sin coincidencias de búsqueda",
        noSearchBody: "Ningún marcador coincide con tu búsqueda actual en esta isla.",
        noMarkersTitle: "No hay marcadores disponibles",
        noMarkersBody: "No hay marcadores disponibles para las categorías seleccionadas en esta isla.",
        noMobEntries: "Todavía no hay entradas de mobs disponibles para esta zona.",
        mapSuffix: "mapa",
        undergroundSuffix: "capa subterránea"
      },
      bestiary: { translationNotice: "La mayor parte del contenido de esta página todavía no está traducida." },
      commands: { translationNotice: "La mayor parte del contenido de esta página todavía no está traducida." },
      ecompendium: { translationNotice: "La mayor parte del contenido de esta página todavía no está traducida." },
      quests: {
        translationNotice: "La mayor parte del contenido de esta página todavía no está traducida.",
        emptyState: "No hay entradas de misiones para mostrar."
      },
      miscinfo: { notice: "La mayor parte del contenido de esta página todavía no está traducida." },
      towerdefense: {
        eyebrow: "FRACTURED UNDERWORLD / DEFENSA DE TORRES",
        title: "Fractured Underworld - Defensa de torres",
        translationNotice: "La mayor parte del contenido de esta página todavía no está traducida.",
        sectionsAria: "Secciones de defensa de torres",
        chapterOverviewAria: "Resumen de capítulos de defensa de torres",
        chapterListAria: "Lista de capítulos de defensa de torres",
        shopSectionAria: "Sección de tienda de defensa de torres",
        shopListAria: "Lista de tienda de defensa de torres",
        infoSheetTitle: "Ficha de información de defensa de torres",
        closeInfoSheet: "Cerrar ficha de información",
        insufficientInfo: "Todavía no hay suficiente información publicada para crear una página.",
        rewardsHead: "Recompensas",
        wavesHead: "Oleadas",
        arcHead: "Arco"
      }
    }
  });
  translations.fr = deepMerge(translations.fr, {
    languageName: "Français",
    dataset: {
      betaLabel: "Données de test bêta",
      currentLabel: "Données actuelles",
      betaDescription:
        "Informations expérimentales issues des tests bêta. Certains détails peuvent être incomplets ou inexacts.",
      currentDescription:
        "Le jeu de données activement maintenu. Si une information manque, consultez les données de test bêta jusqu'à ce qu'elle soit disponible ici.",
      betaBadge: "Héritage",
      currentBadge: "Recommandé",
      chooseTitle: "Choisir la version des données",
      cancel: "Annuler",
      close: "Fermer la sélection des données"
    },
    page: {
      index: {},
      maps: {
        title: "Carte interactive de SAO",
        floorLabel: "Étage :",
        undergroundLabel: "Souterrain :",
        searchPlaceholder: "Rechercher des marqueurs...",
        clearFilters: "Effacer les filtres",
        mapAlt: "Carte de l'étage",
        undergroundAlt: "Overlay souterrain",
        resetView: "Réinitialiser la vue",
        defaultInfoTitle: "Sélectionnez un marqueur",
        defaultInfoBody: "Choisissez un marqueur sur la carte pour voir les détails ici.",
        chooseCategoryTitle: "Choisissez une catégorie",
        chooseCategoryBody:
          "Activez une ou plusieurs catégories dans la barre latérale pour afficher les marqueurs de cet étage.",
        noSearchTitle: "Aucun résultat de recherche",
        noSearchBody: "Aucun marqueur ne correspond à votre recherche actuelle sur cet étage.",
        noMarkersTitle: "Aucun marqueur disponible",
        noMarkersBody: "Aucun marqueur n'est disponible pour les catégories sélectionnées sur cet étage.",
        noMobEntries: "Aucune entrée de mob n'est encore disponible pour cette zone.",
        mobType: "Type",
        mobAreaType: "Zone de mobs",
        availableMobs: "Mobs disponibles",
        floorText: "Étage",
        tutorial: "Tutoriel",
        coordinates: "Coordonnées",
        mobs: "Mobs",
        viewWaypointInfo: "Voir les informations du waypoint",
        clusterTitle: "{count} points d'intérêt",
        clusterBody:
          "Ces {count} points d'intérêt sont proches les uns des autres à ce niveau de zoom. Ouvrez-en un pour voir ses détails.",
        visitedDefeated: "Vaincu",
        visitedCompleted: "Terminé",
        visitedVisited: "Visité",
        categories: { main: "Principal" },
        sidebarResizeAria: "Redimensionner la barre latérale",
        sharedQuests: "Quêtes à cet emplacement",
        zoomIn: "Zoom avant",
        zoomOut: "Zoom arrière"
      },
      mainui: {
        towerDefenseNav: "Défense de tours",
        compendiumNav: "Compendium",
        compendiumToast: "Il n'y a pas encore assez d'informations publiées pour créer une page.",
        title: "Carte interactive de SAO",
        mapDataUnavailableTitle: "CARTE DU UNDERWORLD FRACTURÉ",
        mapDataUnavailableBody: "Les données de la carte sont actuellement en cours de développement.",
        mapDataUnavailableFooter:
          "Les données des PNJ et de la carte seront ajoutées au fur et à mesure que ce module progresse.",
        translationNotice: "La majeure partie du contenu de cette page n'est pas encore traduite.",
        searchPlaceholder: "Rechercher des marqueurs...",
        resetView: "Réinitialiser la vue",
        defaultInfoTitle: "Sélectionnez un marqueur",
        defaultInfoBody: "Choisissez un marqueur sur la carte pour voir les détails ici.",
        chooseCategoryTitle: "Choisissez une catégorie",
        chooseCategoryBody: "Activez une ou plusieurs catégories pour afficher les marqueurs de cette île.",
        noSearchTitle: "Aucun résultat de recherche",
        noSearchBody: "Aucun marqueur ne correspond à votre recherche actuelle sur cette île.",
        noMarkersTitle: "Aucun marqueur disponible",
        noMarkersBody: "Aucun marqueur n'est disponible pour les catégories sélectionnées sur cette île.",
        noMobEntries: "Aucune entrée de mob n'est encore disponible pour cette zone.",
        mapSuffix: "carte",
        undergroundSuffix: "overlay souterrain"
      },
      bestiary: { translationNotice: "La majeure partie du contenu de cette page n'est pas encore traduite." },
      commands: { translationNotice: "La majeure partie du contenu de cette page n'est pas encore traduite." },
      ecompendium: { translationNotice: "La majeure partie du contenu de cette page n'est pas encore traduite." },
      quests: {
        translationNotice: "La majeure partie du contenu de cette page n'est pas encore traduit.",
        emptyState: "Aucune entrée de quête à afficher."
      },
      miscinfo: { notice: "La majeure partie du contenu de cette page n'est pas encore traduite." },
      towerdefense: {
        eyebrow: "FRACTURED UNDERWORLD / DÉFENSE DE TOURS",
        title: "Fractured Underworld - Défense de tours",
        translationNotice: "La majeure partie du contenu de cette page n'est pas encore traduite.",
        sectionsAria: "Sections de défense de tours",
        chapterOverviewAria: "Aperçu des chapitres de défense de tours",
        chapterListAria: "Liste des chapitres de défense de tours",
        shopSectionAria: "Section de boutique de défense de tours",
        shopListAria: "Liste de boutique de défense de tours",
        infoSheetTitle: "Fiche d'information de défense de tours",
        closeInfoSheet: "Fermer la fiche d'information",
        insufficientInfo: "Il n'y a pas encore assez d'informations publiées pour créer une page.",
        rewardsHead: "Récompenses",
        wavesHead: "Vagues",
        arcHead: "Arc"
      }
    }
  });
  translations.en = deepMerge(translations.en, {
    ui: {
      walkthrough: {
        welcomeTitle: "Welcome",
        welcomeBody: "Use this page to choose which SAO MC world or module you want to open.",
        modeCardsTitle: "Mode Cards",
        modeCardsBody:
          "Pick Aincrad or Fractured Underworld to launch a module. The GGO card is currently locked until release.",
        discordTitle: "Links",
        discordBody: "Open quick links to the SAO MC Support Website, SAO MC Discord, and my Discord Profile.",
        characterBuildTitle: "Character Build",
        characterBuildBody:
          "Open Character Build to create and customize your character, equipment, runes, skills, and other build settings.",
        settingsTitle: "Settings",
        settingsBody: "Use the gear to switch language and replay this walkthrough whenever you want."
      }
    },
    page: {
      maps: {
        walkthrough: {
          step1Title: "Navigation",
          step1Body:
            "Use the top row to switch between Bestiary, Equipment, Quests, Patch Notes, Misc. Info, and the Menu.",
          step2Title: "Map Controls",
          step2Body:
            "Choose the floor, toggle underground mode, search for markers, and clear your current filters from here.",
          step3Title: "Filters",
          step3Body:
            "Use the category filters to control which markers appear on the map. Active filters stay highlighted so you can see what is enabled.",
          step4Title: "Interactive Map",
          step4Body:
            "Drag to pan and scroll to zoom. Select a marker to open its details and shortcuts in the information panel."
        }
      },
      mainui: {
        walkthrough: {
          step1Title: "Navigation",
          step1Body: "Use the top row to open Tower Defense, open the Compendium, or return to the Menu.",
          step2Title: "Island Controls",
          step2Body: "Choose an island, search for markers, and clear your current filters from here.",
          step3Title: "Filters",
          step3Body:
            "Use the category filters to control which markers appear on the selected island. Active filters stay highlighted so you can see what is enabled.",
          step4Title: "Map Area",
          step4Body:
            "This area shows the selected island and any map data currently available. Some Underworld islands still display an unavailable-data state."
        }
      }
    }
  });
  translations.es = deepMerge(translations.es, {
    ui: {
      walkthrough: {
        welcomeTitle: "Bienvenida",
        welcomeBody: "Usa esta página para elegir qué mundo o módulo de SAO MC quieres abrir.",
        modeCardsTitle: "Tarjetas de modo",
        modeCardsBody:
          "Elige Aincrad o Fractured Underworld para abrir un módulo. La tarjeta de GGO está bloqueada hasta su lanzamiento.",
        discordTitle: "Enlaces",
        discordBody: "Abre enlaces rápidos al sitio de asistencia, al Discord de SAO MC y a mi perfil de Discord.",
        characterBuildTitle: "Creación de personaje",
        characterBuildBody:
          "Abre Character Build para crear y personalizar tu personaje, equipo, runas, habilidades y otros ajustes de la build.",
        settingsTitle: "Configuración",
        settingsBody: "Usa el engranaje para cambiar el idioma y volver a reproducir este recorrido cuando quieras."
      }
    },
    page: {
      maps: {
        walkthrough: {
          step1Title: "Navegación",
          step1Body:
            "Usa la fila superior para cambiar entre Bestiario, Equipo, Misiones, Notas de parche, Info. Varia y el Menú.",
          step2Title: "Controles del mapa",
          step2Body:
            "Elige el piso, activa el modo subterráneo, busca marcadores y borra los filtros actuales desde aquí.",
          step3Title: "Filtros",
          step3Body:
            "Usa los filtros de categoría para controlar qué marcadores aparecen en el mapa. Los filtros activos permanecen resaltados para mostrar lo que está habilitado.",
          step4Title: "Mapa interactivo",
          step4Body:
            "Arrastra para desplazarte y usa la rueda para acercar. Selecciona un marcador para abrir sus detalles y accesos rápidos en el panel de información."
        }
      },
      mainui: {
        walkthrough: {
          step1Title: "Navegación",
          step1Body: "Usa la fila superior para abrir Defensa de torres, abrir el compendio o volver al menú.",
          step2Title: "Controles de isla",
          step2Body: "Elige una isla, busca marcadores y borra los filtros actuales desde aquí.",
          step3Title: "Filtros",
          step3Body:
            "Usa los filtros de categoría para controlar qué marcadores aparecen en la isla seleccionada. Los filtros activos permanecen resaltados para mostrar lo que está habilitado.",
          step4Title: "Área del mapa",
          step4Body:
            "Esta área muestra la isla seleccionada y los datos de mapa disponibles. Algunas islas de Underworld todavía muestran un estado de datos no disponibles."
        }
      }
    }
  });
  translations.fr = deepMerge(translations.fr, {
    ui: {
      walkthrough: {
        welcomeTitle: "Bienvenue",
        welcomeBody: "Utilise cette page pour choisir quel monde ou module SAO MC ouvrir.",
        modeCardsTitle: "Cartes de modes",
        modeCardsBody:
          "Choisis Aincrad ou Fractured Underworld pour lancer un module. La carte GGO est verrouillée jusqu'à sa sortie.",
        discordTitle: "Liens",
        discordBody: "Ouvre des liens rapides vers le site d'assistance, le Discord SAO MC et mon profil Discord.",
        characterBuildTitle: "Création de personnage",
        characterBuildBody:
          "Ouvre Character Build pour créer et personnaliser ton personnage, son équipement, ses runes, ses compétences et ses autres réglages.",
        settingsTitle: "Paramètres",
        settingsBody: "Utilise la roue pour changer de langue et rejouer cette visite guidée quand tu veux."
      }
    },
    page: {
      maps: {
        walkthrough: {
          step1Title: "Navigation",
          step1Body:
            "Utilise la ligne du haut pour passer entre Bestiaire, Équipement, Quêtes, Notes de patch, Infos diverses et le Menu.",
          step2Title: "Contrôles de la carte",
          step2Body:
            "Choisis l'étage, active le mode souterrain, recherche des marqueurs et efface les filtres actuels depuis ici.",
          step3Title: "Filtres",
          step3Body:
            "Utilise les filtres de catégories pour contrôler les marqueurs affichés sur la carte. Les filtres actifs restent en évidence.",
          step4Title: "Carte interactive",
          step4Body:
            "Fais glisser pour déplacer et utilise la molette pour zoomer. Sélectionne un marqueur pour ouvrir ses détails et ses raccourcis dans le panneau d'information."
        }
      },
      mainui: {
        walkthrough: {
          step1Title: "Navigation",
          step1Body: "Utilisez la ligne du haut pour ouvrir Tower Defense, ouvrir le compendium ou revenir au menu.",
          step2Title: "Contrôles de l'île",
          step2Body: "Choisis une île, recherche des marqueurs et efface les filtres actuels depuis ici.",
          step3Title: "Filtres",
          step3Body:
            "Utilise les filtres de catégories pour contrôler les marqueurs affichés sur l'île sélectionnée. Les filtres actifs restent en évidence.",
          step4Title: "Zone de carte",
          step4Body:
            "Cette zone affiche l'île sélectionnée et les données cartographiques actuellement disponibles. Certaines îles de l'Underworld indiquent encore que les données sont indisponibles."
        }
      }
    }
  });

  /* Argo the Info Broker - interface and answer strings. The 35-per-category dialogue expansion
     belongs to a later stage; this is the initial response set. */
  translations.en = deepMerge(translations.en, {
    argo: {
      launcherLabel: "Open Argo the Info Broker",
      title: "Argo the Info Broker",
      closeLabel: "Close Argo the Info Broker",
      logLabel: "Conversation with Argo",
      inputLabel: "Ask Argo about game information",
      inputPlaceholder: "Ask about mobs, drops, items, recipes, NPCs, quests or locations...",
      sendLabel: "Send",
      dragHint: "Drag the title bar to move this window",
      whoArgo: "Argo",
      whoYou: "You",
      intro: {
        1: "Heya! What info are ya after? Ask me about items, mobs, drops, crafting, quests, NPCs or map locations.",
        2: "Argo here. Give me a name - an item, a mob, a quest, a merchant - and I'll dig through the records.",
        3: "Back again? Good. Name somethin' and I'll tell ya what I know about it.",
        4: "Information's a trade, and I'm open for business. What are ya lookin' for?",
        5: "Well now, a customer. Items, mobs, drops, quests - I keep notes on all of it.",
        6: "Argo's the name and answers are the trade. Ask away.",
        7: "Got a name for me? A place, a monster, a piece of gear - anything with a record behind it.",
        8: "Hm? Oh, it's you. Come to buy somethin', or just to chat? Either way, ask.",
        9: "Everything worth knowin' in Aincrad passes through my hands sooner or later. What do ya need?",
        10: "You've got questions and I've got notes. Let's see if they match up."
      }
    }
  });

  translations.es = deepMerge(translations.es, {
    argo: {
      launcherLabel: "Abrir a Argo, la corredora de información",
      title: "Argo, la corredora de información",
      closeLabel: "Cerrar a Argo, la corredora de información",
      logLabel: "Conversación con Argo",
      inputLabel: "Pregúntale a Argo sobre información del juego",
      inputPlaceholder: "Pregunta por mobs, botines, objetos, recetas, PNJ, misiones o ubicaciones...",
      sendLabel: "Enviar",
      dragHint: "Arrastra la barra de título para mover esta ventana",
      whoArgo: "Argo",
      whoYou: "Tú",
      intro: {
        1: "¡Hola! ¿Qué información buscas? Pregúntame por objetos, mobs, botines, crafteo, misiones, PNJ o ubicaciones del mapa.",
        2: "Soy Argo. Dame un nombre —un objeto, un mob, una misión, un mercader— y rebuscaré en mis registros.",
        3: "¿Otra vez por aquí? Bien. Nombra algo y te diré lo que sé.",
        4: "La información es un negocio, y yo estoy abierta. ¿Qué buscas?",
        5: "Vaya, un cliente. Objetos, mobs, botines, misiones: de todo eso tengo notas.",
        6: "Argo me llamo y respuestas vendo. Pregunta sin miedo.",
        7: "¿Me das un nombre? Un lugar, un monstruo, una pieza de equipo, cualquier cosa con ficha detrás.",
        8: "¿Mmm? Ah, eres tú. ¿Vienes a comprar algo o solo a charlar? Da igual, pregunta.",
        9: "Todo lo que vale la pena saber en Aincrad pasa antes o después por mis manos. ¿Qué necesitas?",
        10: "Tú tienes preguntas y yo tengo notas. Veamos si encajan."
      }
    }
  });

  translations.fr = deepMerge(translations.fr, {
    argo: {
      launcherLabel: "Ouvrir Argo, l'informatrice",
      title: "Argo, l'informatrice",
      closeLabel: "Fermer Argo, l'informatrice",
      logLabel: "Conversation avec Argo",
      inputLabel: "Poser une question à Argo sur les informations de jeu",
      inputPlaceholder: "Pose une question sur les monstres, butins, objets, recettes, PNJ, quêtes ou lieux...",
      sendLabel: "Envoyer",
      dragHint: "Fais glisser la barre de titre pour déplacer cette fenêtre",
      whoArgo: "Argo",
      whoYou: "Toi",
      intro: {
        1: "Salut ! Quelle info te faut-il ? Demande-moi des objets, monstres, butins, artisanat, quêtes, PNJ ou lieux sur la carte.",
        2: "Argo à l'appareil. Donne-moi un nom — un objet, un monstre, une quête, un marchand — et je fouille mes dossiers.",
        3: "Encore toi ? Bien. Nomme quelque chose et je te dirai ce que j'en sais.",
        4: "L'information, c'est un métier, et je suis ouverte. Tu cherches quoi ?",
        5: "Tiens, un client. Objets, monstres, butins, quêtes : j'ai des notes sur tout ça.",
        6: "Argo, c'est mon nom, et les réponses sont ma marchandise. Vas-y, demande.",
        7: "Tu as un nom pour moi ? Un lieu, un monstre, une pièce d'équipement, n'importe quoi avec une fiche derrière.",
        8: "Hmm ? Ah, c'est toi. Tu viens acheter quelque chose ou juste discuter ? Peu importe, demande.",
        9: "Tout ce qui vaut la peine d'être su à Aincrad finit tôt ou tard entre mes mains. Il te faut quoi ?",
        10: "Tu as des questions et j'ai des notes. Voyons si elles concordent."
      }
    }
  });

  /* Argo's answer wording: lead-ins per category, field labels, honest notes and question outcomes.
     Every string here is also mirrored as an English fallback in shared/sao-argo.js. */
  translations.en = deepMerge(translations.en, {
    argo: {
      lead: {
        item: {
          1: "Oho, found a lead!",
          2: "Let's see what the records say about that one.",
          3: "Got the file right here.",
          4: "That one rings a bell. Give me a moment.",
          5: "Gear questions are my bread and butter.",
          6: "Hm, let me check my notes on that.",
          7: "You're in luck - I've got a page on it.",
          8: "An item, is it? I like it when folks ask about things I can actually name.",
          9: "Let's dig. Items leave a paper trail, and I keep the paper.",
          10: "I've sold worse information for good Col. This one's free.",
          11: "Right, that name's familiar.",
          12: "Let's see what I've got written down.",
          13: "Oho, askin' about the good stuff.",
          14: "I've been waitin' for someone to ask about that one.",
          15: "Sure, I know that one.",
          16: "Hm, that name's in my book somewhere.",
          17: "Let me flip to the right page.",
          18: "You want the details? I've got the details.",
          19: "Now that's a name worth lookin' up.",
          20: "Let's see how much I can tell ya."
        },
        recipe: {
          1: "Ah, a crafter's question. I like it.",
          2: "Let me dig up that recipe.",
          3: "Here's what the records list for that one.",
          4: "Makin' somethin', are ya? Let me check.",
          5: "Hm, recipes I keep tidy.",
          6: "Let's see what goes into that.",
          7: "Right, let's find the materials.",
          8: "A crafter with Col to spend. Good.",
          9: "Let me see what the records say it takes.",
          10: "That one's got a recipe, I'm fairly sure.",
          11: "Let me pull up the list.",
          12: "Hm, let me check what's needed for that."
        },
        mob: {
          1: "Oho, a huntin' question.",
          2: "Let's see what the Bestiary says.",
          3: "I've got a page on that one.",
          4: "A monster, hm? Those leave plenty of tracks.",
          5: "You're huntin', are ya? Let me check.",
          6: "That one's got a nasty reputation, if I recall right.",
          7: "Let's see what the records say about that beast.",
          8: "Plenty of folks ask about that one. Let me pull my notes.",
          9: "Hm, I know that name.",
          10: "Let me look up what I've got on it.",
          11: "A hunter's question. My favourite kind.",
          12: "Right, that one. Give me a second.",
          13: "Let's see where it lives and what it hits with.",
          14: "I keep notes on everything with teeth. Let me check.",
          15: "That's a name I've heard more than once.",
          16: "Let me see what I've got written down on that one.",
          17: "Careful with that one - or don't, it's your neck. Here's what I know.",
          18: "Hm, let me dig through the Bestiary pages.",
          19: "Monsters are easy business. They're always somewhere.",
          20: "Let's see if it's as nasty as they say."
        },
        mobDrops: {
          1: "Ah, a looter's question!",
          2: "Let's check what it drops.",
          3: "Here's the loot list I've got.",
          4: "After its pockets, are ya? Sensible.",
          5: "Let's see what falls out of that one.",
          6: "Hm, drop lists I do keep.",
          7: "You want what it's carryin'. Fair enough.",
          8: "Let me check the list. I don't guess these.",
          9: "That one's worth huntin' for a reason.",
          10: "Right, let's see what it leaves behind.",
          11: "Kill it, take its things. That's the business.",
          12: "Let me see what I've got recorded for it.",
          13: "Hm, let me check what's on the list.",
          14: "Let's see if it's worth your time."
        },
        drop: {
          1: "Oho, followin' a drop trail?",
          2: "Let's see who's holding that.",
          3: "I dug through the drop lists for that.",
          4: "Lookin' for where it comes from? Smart.",
          5: "Let me check who's carryin' that.",
          6: "Hm, that one's a drop, is it?",
          7: "Somebody's got it. Let's find out who.",
          8: "I keep the drop lists sorted. Give me a moment.",
          9: "Right, let's trace it back.",
          10: "Let me see which mobs are holdin' that.",
          11: "Chasin' a drop, are ya? I'd do the same.",
          12: "Hm, let me see what's recorded.",
          13: "That one doesn't grow on trees. Let me look.",
          14: "Let's see who's generous enough to hand it over."
        },
        npc: {
          1: "Ask around, and you find people. Let me check.",
          2: "Let's see where you can find them.",
          3: "I've got a line on that one.",
          4: "Lookin' for someone? Let me check my notes.",
          5: "Hm, people move around. Let me look.",
          6: "Right, let's see where they set up shop.",
          7: "I know most of the shopkeepers. Let me look.",
          8: "Let me see what I've got on them.",
          9: "Hm, let me check where they're standin'.",
          10: "Merchants and wanderers - I keep track of both.",
          11: "Let me see if I can point ya their way.",
          12: "Right, let's find them."
        },
        quest: {
          1: "Ah, a quest lead.",
          2: "Let's look at the quest sheet.",
          3: "Here's what I've got on that quest.",
          4: "Work, is it? Let me check the board.",
          5: "Hm, that one's been askin' around for help.",
          6: "Let me see what I've got written down.",
          7: "A quest, hm? Those I keep careful notes on.",
          8: "Right, let's see who's handin' it out.",
          9: "Somebody wants somethin' done. Let me check.",
          10: "I've got notes on most of these.",
          11: "Let's see the details before ya take the job.",
          12: "Hm, let me pull that sheet.",
          13: "Work pays. Let's see what it's worth.",
          14: "Let's see the reward before ya commit to it."
        },
        location: {
          1: "Oho, want the lay of the land?",
          2: "Let's see where that is.",
          3: "I've got that pinned on the map.",
          4: "Directions, is it? I can do directions.",
          5: "Let me check the map notes.",
          6: "Hm, that's a place, is it? Let me look.",
          7: "You'll be wantin' coordinates, I expect.",
          8: "Right, let's find it on the map.",
          9: "I know these floors better than most.",
          10: "Let me see what's marked down there.",
          11: "Places I can usually pin down. Let's try.",
          12: "Hm, let me check my map notes.",
          13: "Easy enough - if my notes are right.",
          14: "Let's see what's around there."
        }
      },
      /* Transitions into the facts: these sit between the lead-in and the list itself. */
      facts: {
        item: { 1: "Here's what's written down:", 2: "This is what I've got on it:", 3: "The records say this:" },
        recipe: { 1: "Here's the list:", 2: "What it takes:", 3: "This is what's recorded:" },
        mob: { 1: "Here's what I've got:", 2: "The page says this:", 3: "The entry reads like this:" },
        mobDrops: {
          1: "Here's the drop list:",
          2: "This is what's noted for it:",
          3: "What I've got says this:"
        },
        drop: { 1: "Here's who's holding it:", 2: "The lists say this:", 3: "This is what I found:" },
        npc: { 1: "Here's what I know:", 2: "This is what's noted:", 3: "The notes say this:" },
        quest: { 1: "Here's the sheet:", 2: "This is what's on it:", 3: "The sheet says this:" },
        location: { 1: "Here's what's marked:", 2: "This is what I have:", 3: "The map notes say this:" }
      },
      /* Sign-offs, used only on answers that needed no caveat at all. */
      close: {
        1: "That's straight from the records.",
        2: "That's all solid - I checked.",
        3: "No guessin' in any of that.",
        4: "You can take that to the bank.",
        5: "Every line of that is written down somewhere.",
        6: "That's the whole of what's recorded.",
        7: "Reliable, that. I don't pass on rumors.",
        8: "That's from the source, not from gossip.",
        9: "Good information, that. Worth the price.",
        10: "That's what the records say, and they don't lie to me.",
        11: "Clean information. Enjoy it.",
        12: "That's confirmed, not hearsay."
      },
      label: {
        floor: "Floor {floor}",
        level: "Lv {level}",
        stats: "Stats",
        craftingLocation: "Crafting location",
        craftingResources: "Crafting resources",
        droppedBy: "Dropped by",
        drops: "Drops",
        spawnArea: "Spawn area",
        mobs: "Mobs",
        rewards: "Rewards",
        requirements: "Requirements",
        npc: "NPC",
        sells: "Sells",
        quests: "Quests",
        unknown: "unknown",
        recordsFound: "{label}: {count}",
        moreRecords: "and {count} more (of {total})",
        rankedBy: "{label} by {field}, {direction}:",
        highestFirst: "highest first",
        lowestFirst: "lowest first",
        bestSource: "Best recorded source: {mob} ({chance}%)",
        levelField: "Level",
        typeField: "Type",
        categoryField: "Category",
        questType: "Quest type",
        bestiaryTab: "Bestiary list",
        target: {
          quest: "Quests",
          boss: "Bosses",
          mob: "Mobs",
          item: "Items",
          npc: "NPCs",
          location: "Locations",
          dungeon: "Dungeons",
          area: "Areas"
        }
      },
      note: {
        itemRecordMissing: {
          1: "There's more to this one than I've got in my notes. That's all I can give ya for now.",
          2: "That's everythin' I've got on it - my notes on this one are thin.",
          3: "I've given ya what I have. The rest of it isn't written down anywhere I can reach."
        },
        bestiaryRecordMissing: {
          1: "I've no page on that one in my notes - only what I've got here.",
          2: "My notes on it start and end with what ya see.",
          3: "That one's barely written up. What's above is the whole of it."
        },
        noDropRecord: {
          1: "Nobody's written down what it drops, so I won't guess.",
          2: "No drop list on that one - and I don't invent those.",
          3: "I've got no drop list for it. I'd rather say nothin' than make somethin' up."
        },
        noRecipe: {
          1: "No recipe's written down for it, so I can't hand ya one.",
          2: "I've got no recipe for that one.",
          3: "Nobody's recorded how that's made, and I don't invent recipes."
        },
        noCraftingLocation: {
          1: "My notes don't say where it's made or sold.",
          2: "No workshop or merchant is written next to that one.",
          3: "I can't tell ya where to make it - that part's blank in my notes."
        },
        noStats: {
          1: "There are no numbers written down for it.",
          2: "Nobody's recorded its stats.",
          3: "I've got no figures for that one."
        },
        noSpawnArea: {
          1: "No spawn area is written down for it.",
          2: "My notes don't say where it turns up.",
          3: "Where it lives isn't recorded."
        },
        markerNotFound: {
          1: "I couldn't pin that one on the map.",
          2: "That name isn't marked anywhere I can see.",
          3: "No map mark for that one, so I can't point ya there."
        },
        questMarkerOnly: {
          1: "All I've got is its mark on the map, not the quest details.",
          2: "Only its location is written down, not the rest of the job.",
          3: "The map knows it. My notes on the quest itself are empty."
        },
        absenceNotProof: {
          1: "That's no proof it isn't in the game - just that my notes don't have it.",
          2: "Don't take that as proof it doesn't exist. It only means I haven't got it written down.",
          3: "Me not knowin' it isn't the same as it not bein' there."
        },
        otherIsland: {
          1: "That one's on a different island than the one you're lookin' at.",
          2: "That belongs to another island - you're viewin' a different one.",
          3: "Different island entirely, that one."
        },
        englishOnly: {
          1: "Fair warning: I read the wording in English, with a few words of Spanish and French - keep names in English and we'll get on fine.",
          2: "I read the question itself in English, and I catch a handful of Spanish or French words, but names should be in English.",
          3: "Questions I read in English, and I pick up a little Spanish and French - though names are safest in English."
        },
        floorInferred: {
          1: "That record lives on Floor {floor}.",
          2: "I've got that written down under Floor {floor}.",
          3: "You'll find that on Floor {floor} in my notes."
        },
        otherFloorRecords: {
          1: "{count} more are recorded on {floors}.",
          2: "There are {count} more on {floors}, if you ever head that way.",
          3: "My notes hold {count} more on {floors}."
        },
        rankingUnknown: {
          1: "{count} of them have no recorded value, so I'm not ranking those.",
          2: "Another {count} have no figure written down, so I left them out rather than guess.",
          3: "{count} more have nothing recorded for it, so they are not in the list."
        },
        chanceNotRecorded: {
          1: "Some of those rates aren't written down anywhere.",
          2: "Not every source has a recorded rate - I only pass on what's written.",
          3: "Where the rate isn't recorded, I've left it out rather than guess."
        },
        noRecordedRate: {
          1: "Nobody's written down a drop rate for any of those sources.",
          2: "I've got the sources, but not a single rate, so I can't call any of them the best.",
          3: "The sources are recorded; the rates are not."
        },
        comparisonTruncated: {
          1: "That's not every field - there are {count} of them in total.",
          2: "There are {count} fields altogether; I've shown the first few.",
          3: "The full list runs to {count} fields."
        }
      },
      status: {
        ambiguous: {
          1: "Hm, that could be a few things. Which one did ya mean?",
          2: "Hold on - I've got more than one match for that:",
          3: "That name's doin' double duty. Which one?",
          4: "Hm, ya gave me a name that fits more than one thing:",
          5: "Careful now - that could be any of these:",
          6: "I've got a few entries under that name. Take your pick:",
          7: "That's not specific enough for my notes. Which of these?",
          8: "More than one thing answers to that name. Which?"
        },
        missing: {
          1: "Hm, I found the name but not the details.",
          2: "I've only got part of that one.",
          3: "I know the name, but my notes run dry after that.",
          4: "That one's only half-written in my book.",
          5: "I've got the name and not much else.",
          6: "Hm, that one's thin. Here's what I do have.",
          7: "I've got a piece of that, not the whole.",
          8: "My notes on that one are incomplete. Here's what's there."
        },
        unsupported: {
          1: "Hm, haven't got a reliable lead on that one yet.",
          2: "That's outside my records, sorry.",
          3: "That's not the kind of thing I keep notes on.",
          4: "Can't help ya with that one - it's not in my line.",
          5: "Hm, that's beyond what I deal in.",
          6: "I've got nothin' for that, and I won't invent it.",
          7: "That one's outside my trade, I'm afraid.",
          8: "No records on that one. Try me with somethin' from the game."
        },
        candidates: { 1: "Candidates:", 2: "Here's what turned up:", 3: "Possible matches:" },
        emptySet: {
          1: "Nothing on this floor matches that.",
          2: "That list came up empty, I'm afraid.",
          3: "I've been through the whole list - there's nothing matching that here."
        },
        sourcesAvailable: "On this page I can only see: {sources}.",
        noSources: "I can't see any game records on this page yet.",
        engineMissing: {
          1: "My records aren't loaded on this page yet, so I can't look anything up here.",
          2: "I've got no notes with me on this page. Try me where my records are loaded.",
          3: "My book isn't on this page, so there's nothin' for me to check.",
          4: "Nothin' to work with here - my records aren't loaded on this page yet."
        },
        datasetUnsupported: {
          1: "Heh, I only deal in Current Data these days. Switch your dataset to Current Data, and I'll see what I can find for ya.",
          2: "My notes only cover Current Data now. Flip your dataset over to Current Data and ask me again.",
          3: "Current Data only - that's my rule. Change your dataset and I'll dig through what I've got.",
          4: "Ya won't get Beta-Test answers out of me; I work from Current Data. Switch your dataset and I'll take another look."
        },
        error: {
          1: "Something jammed in my files just now. Try asking me again?",
          2: "Hm, my notes just scattered on me. Ask me again?",
          3: "That one got lost on the way to my desk. Try me again?",
          4: "Something's tangled up in my notes. Give it another go?"
        }
      },
      type: {
        item: "Item",
        mob: "Mob",
        boss: "Boss",
        npc: "NPC",
        merchant: "Merchant",
        location: "Location",
        dungeon: "Dungeon",
        quest: "Quest"
      },
      help: {
        body: {
          1: "Ask me about items and gear, mobs and bosses, what drops what, crafting recipes, quests, NPCs and merchants, or map locations. Give me a name and I'll dig through the records.",
          2: "I deal in names: items, gear, monsters, bosses, drops, recipes, quests, shopkeepers, places. Give me one and I'll tell ya what I know.",
          3: "Bring me a name - a mob, an item, a quest, a merchant, a spot on the map - and I'll check my notes on it.",
          4: "Mobs, drops, items, recipes, quests, NPCs, locations. Name any of those and I'll look it up for ya."
        }
      }
    }
  });

  translations.es = deepMerge(translations.es, {
    argo: {
      lead: {
        item: {
          1: "¡Oho, tengo una pista!",
          2: "Veamos qué dicen los registros.",
          3: "Tengo el expediente aquí mismo.",
          4: "Ese nombre me suena. Dame un momento.",
          5: "Las preguntas de equipo son mi pan de cada día.",
          6: "Mmm, déjame mirar mis notas.",
          7: "Estás de suerte: tengo una ficha de eso.",
          8: "¿Un objeto? Me gusta cuando preguntan por cosas que puedo nombrar.",
          9: "Vamos a indagar. Los objetos dejan rastro en el papel, y el papel lo guardo yo.",
          10: "He vendido información peor por buen Col. Esta va gratis.",
          11: "Bien, ese nombre me suena.",
          12: "Veamos qué tengo anotado.",
          13: "Oho, preguntando por lo bueno.",
          14: "Llevaba tiempo esperando que alguien preguntara por eso.",
          15: "Claro, ese lo conozco.",
          16: "Mmm, ese nombre está en mi libro por algún lado.",
          17: "Déjame pasar a la página correcta.",
          18: "¿Quieres detalles? Detalles tengo.",
          19: "Ahora sí, un nombre que vale la pena buscar.",
          20: "Veamos cuánto puedo contarte."
        },
        recipe: {
          1: "Ah, una pregunta de artesano. Me gusta.",
          2: "Déjame buscar esa receta.",
          3: "Esto es lo que listan los registros.",
          4: "¿Estás fabricando algo? Déjame comprobar.",
          5: "Mmm, las recetas las tengo ordenadas.",
          6: "Veamos qué lleva eso.",
          7: "Bien, vamos a por los materiales.",
          8: "Un artesano con Col que gastar. Bien.",
          9: "Veamos qué dicen los registros que hace falta.",
          10: "Esa tiene receta, estoy bastante segura.",
          11: "Déjame sacar la lista.",
          12: "Mmm, déjame ver qué se necesita para eso."
        },
        mob: {
          1: "Oho, una pregunta de caza.",
          2: "Veamos qué dice el bestiario.",
          3: "Tengo una ficha de ese.",
          4: "¿Un monstruo? Esos dejan muchas huellas.",
          5: "¿Vas de caza? Déjame comprobar.",
          6: "Ese tiene mala fama, si no me falla la memoria.",
          7: "Veamos qué dicen los registros de esa bestia.",
          8: "Mucha gente pregunta por ese. Déjame sacar mis notas.",
          9: "Mmm, ese nombre lo conozco.",
          10: "Déjame ver qué tengo sobre él.",
          11: "Una pregunta de cazador. Mi favorita.",
          12: "Bien, ese. Dame un segundo.",
          13: "Veamos dónde vive y con qué golpea.",
          14: "Tengo notas de todo lo que tiene dientes. Déjame mirar.",
          15: "Ese nombre lo he oído más de una vez.",
          16: "Déjame ver qué tengo anotado sobre ese.",
          17: "Cuidado con ese... o no, es tu cuello. Esto es lo que sé.",
          18: "Mmm, déjame rebuscar en las páginas del bestiario.",
          19: "Los monstruos son negocio fácil. Siempre están en algún sitio.",
          20: "Veamos si es tan peligroso como dicen."
        },
        mobDrops: {
          1: "¡Ah, una pregunta de saqueador!",
          2: "Veamos qué suelta.",
          3: "Esta es la lista de botín que tengo.",
          4: "¿Vas a por sus bolsillos? Sensato.",
          5: "Veamos qué cae de ese.",
          6: "Mmm, listas de botín sí guardo.",
          7: "Quieres lo que lleva encima. Justo.",
          8: "Déjame mirar la lista. Estas no me las invento.",
          9: "Ese vale la pena cazarlo por algo.",
          10: "Bien, veamos qué deja atrás.",
          11: "Mátalo y llévate sus cosas. Ese es el negocio.",
          12: "Déjame ver qué tengo registrado para él.",
          13: "Mmm, déjame comprobar qué hay en la lista.",
          14: "Veamos si merece tu tiempo."
        },
        drop: {
          1: "¿Oho, sigues el rastro de un botín?",
          2: "Veamos quién lo tiene.",
          3: "He rebuscado en las listas de botín.",
          4: "¿Buscas de dónde sale? Listo.",
          5: "Déjame ver quién lo lleva.",
          6: "Mmm, ¿eso es un botín?",
          7: "Alguien lo tiene. Vamos a averiguar quién.",
          8: "Tengo las listas de botín ordenadas. Dame un momento.",
          9: "Bien, vamos a rastrearlo.",
          10: "Déjame ver qué mobs lo llevan.",
          11: "¿Persigues un botín? Yo haría lo mismo.",
          12: "Mmm, déjame ver qué está registrado.",
          13: "Eso no crece en los árboles. Déjame mirar.",
          14: "Veamos quién es tan generoso como para soltarlo."
        },
        npc: {
          1: "Preguntando se encuentra gente. Déjame comprobar.",
          2: "Veamos dónde puedes encontrarlo.",
          3: "Tengo una pista de ese.",
          4: "¿Buscas a alguien? Déjame mirar mis notas.",
          5: "Mmm, la gente se mueve. Déjame ver.",
          6: "Bien, veamos dónde montan su puesto.",
          7: "Conozco a casi todos los tenderos. Déjame mirar.",
          8: "Déjame ver qué tengo sobre esa persona.",
          9: "Mmm, déjame comprobar dónde se encuentra.",
          10: "Mercaderes y errantes: de los dos llevo registro.",
          11: "Déjame ver si puedo orientarte hacia ellos.",
          12: "Bien, vamos a encontrarlos."
        },
        quest: {
          1: "Ah, una pista de misión.",
          2: "Veamos la ficha de la misión.",
          3: "Esto es lo que tengo de esa misión.",
          4: "¿Trabajo? Déjame mirar el tablón.",
          5: "Mmm, ese lleva tiempo buscando ayuda.",
          6: "Déjame ver qué tengo anotado.",
          7: "¿Una misión? De esas guardo notas cuidadosas.",
          8: "Bien, veamos quién la reparte.",
          9: "Alguien quiere que le hagan algo. Déjame comprobar.",
          10: "De casi todas estas tengo notas.",
          11: "Veamos los detalles antes de que aceptes el trabajo.",
          12: "Mmm, déjame sacar esa ficha.",
          13: "El trabajo paga. Veamos cuánto vale.",
          14: "Veamos la recompensa antes de que te comprometas."
        },
        location: {
          1: "¿Oho, quieres orientarte?",
          2: "Veamos dónde está eso.",
          3: "Lo tengo marcado en el mapa.",
          4: "¿Indicaciones? Eso sé darlas.",
          5: "Déjame mirar mis notas del mapa.",
          6: "Mmm, ¿eso es un lugar? Déjame ver.",
          7: "Supongo que querrás coordenadas.",
          8: "Bien, vamos a buscarlo en el mapa.",
          9: "Conozco estos pisos mejor que la mayoría.",
          10: "Veamos qué hay marcado por ahí abajo.",
          11: "Los lugares suelo localizarlos. Probemos.",
          12: "Mmm, déjame revisar mis notas del mapa.",
          13: "Fácil, si mis notas no me engañan.",
          14: "Veamos qué hay por esa zona."
        }
      },
      facts: {
        item: { 1: "Esto es lo que está anotado:", 2: "Esto es lo que tengo de él:", 3: "Los registros dicen esto:" },
        recipe: { 1: "Esta es la lista:", 2: "Lo que hace falta:", 3: "Esto es lo que está registrado:" },
        mob: { 1: "Esto es lo que tengo:", 2: "La ficha dice esto:", 3: "La entrada dice así:" },
        mobDrops: {
          1: "Esta es la lista de botín:",
          2: "Esto es lo anotado para él:",
          3: "Lo que tengo dice esto:"
        },
        drop: { 1: "Esto es quien lo tiene:", 2: "Las listas dicen esto:", 3: "Esto es lo que he encontrado:" },
        npc: { 1: "Esto es lo que sé:", 2: "Esto es lo anotado:", 3: "Las notas dicen esto:" },
        quest: { 1: "Esta es la ficha:", 2: "Esto es lo que pone:", 3: "La ficha dice esto:" },
        location: {
          1: "Esto es lo que está marcado:",
          2: "Esto es lo que hay:",
          3: "Las notas del mapa dicen esto:"
        }
      },
      close: {
        1: "Eso sale directo de los registros.",
        2: "Todo eso es firme, lo he comprobado.",
        3: "Ahí no hay nada inventado.",
        4: "Puedes fiarte de eso.",
        5: "Cada línea de eso está anotada en algún sitio.",
        6: "Eso es todo lo que está registrado.",
        7: "Fiable, esto. Yo no paso habladurías.",
        8: "Viene de la fuente, no de lo que se cuenta por ahí.",
        9: "Buena información. Vale su precio.",
        10: "Eso dicen los registros, y a mí no me mienten.",
        11: "Información limpia. Disfrútala.",
        12: "Eso está confirmado, no es nada oído por ahí."
      },
      label: {
        floor: "Piso {floor}",
        level: "Nv {level}",
        stats: "Estadísticas",
        craftingLocation: "Lugar de fabricación",
        craftingResources: "Recursos de fabricación",
        droppedBy: "Lo sueltan",
        drops: "Botín",
        spawnArea: "Zona de aparición",
        mobs: "Mobs",
        rewards: "Recompensas",
        requirements: "Requisitos",
        npc: "PNJ",
        sells: "Vende",
        quests: "Misiones",
        unknown: "desconocido",
        recordsFound: "{label}: {count}",
        moreRecords: "y {count} más (de {total})",
        rankedBy: "{label} por {field}, {direction}:",
        highestFirst: "de mayor a menor",
        lowestFirst: "de menor a mayor",
        bestSource: "Mejor fuente registrada: {mob} ({chance}%)",
        levelField: "Nivel",
        typeField: "Tipo",
        categoryField: "Categoría",
        questType: "Tipo de misión",
        bestiaryTab: "Lista del bestiario",
        target: {
          quest: "Misiones",
          boss: "Jefes",
          mob: "Mobs",
          item: "Objetos",
          npc: "PNJ",
          location: "Lugares",
          dungeon: "Mazmorras",
          area: "Zonas"
        }
      },
      note: {
        itemRecordMissing: {
          1: "Hay más de este de lo que tengo en mis notas. Eso es todo lo que puedo darte por ahora.",
          2: "Eso es todo lo que tengo: mis notas sobre este son escasas.",
          3: "Te he dado lo que hay. El resto no está anotado en ningún sitio al que yo llegue."
        },
        bestiaryRecordMissing: {
          1: "No tengo ficha de ese en mis notas, solo lo que ves aquí.",
          2: "Mis notas sobre eso empiezan y acaban en lo que ves.",
          3: "Ese está apenas documentado. Lo de arriba es todo lo que hay."
        },
        noDropRecord: {
          1: "Nadie ha anotado qué suelta, así que no me lo voy a inventar.",
          2: "No hay lista de botín de ese, y esas no me las invento.",
          3: "No tengo lista de botín suya. Prefiero no decir nada antes que inventármelo."
        },
        noRecipe: {
          1: "No hay receta anotada, así que no puedo darte una.",
          2: "De ese no tengo receta.",
          3: "Nadie ha registrado cómo se fabrica, y yo no invento recetas."
        },
        noCraftingLocation: {
          1: "Mis notas no dicen dónde se fabrica ni dónde se vende.",
          2: "No hay taller ni mercader anotado junto a ese.",
          3: "No puedo decirte dónde fabricarlo: esa parte está en blanco en mis notas."
        },
        noStats: {
          1: "No hay números anotados para eso.",
          2: "Nadie ha registrado sus estadísticas.",
          3: "De ese no tengo cifras."
        },
        noSpawnArea: {
          1: "No hay zona de aparición anotada.",
          2: "Mis notas no dicen dónde aparece.",
          3: "Dónde vive no está registrado."
        },
        markerNotFound: {
          1: "No he podido localizar ese en el mapa.",
          2: "Ese nombre no está marcado en ningún sitio que yo vea.",
          3: "No hay marca en el mapa, así que no puedo orientarte."
        },
        questMarkerOnly: {
          1: "Solo tengo su marca en el mapa, no los detalles de la misión.",
          2: "Solo está anotado su lugar, no el resto del encargo.",
          3: "El mapa lo conoce. Mis notas sobre la misión están vacías."
        },
        absenceNotProof: {
          1: "Eso no prueba que no esté en el juego: solo que mis notas no lo tienen.",
          2: "No lo tomes como prueba de que no existe. Solo significa que no lo tengo anotado.",
          3: "Que yo no lo sepa no es lo mismo que no esté ahí."
        },
        otherIsland: {
          1: "Ese está en una isla distinta de la que estás viendo.",
          2: "Eso pertenece a otra isla; estás viendo una diferente.",
          3: "Otra isla por completo, ese."
        },
        englishOnly: {
          1: "Aviso: leo la pregunta en inglés y pillo algunas palabras en español, pero los nombres mejor en inglés.",
          2: "Entiendo la pregunta en inglés y algo de español; los nombres, mejor en inglés.",
          3: "Las preguntas las leo en inglés, con algo de español; si nombras las cosas en inglés nos entenderemos."
        },
        floorInferred: {
          1: "Ese registro está en el Piso {floor}.",
          2: "Eso lo tengo anotado en el Piso {floor}.",
          3: "Eso lo encontrarás en el Piso {floor} según mis notas."
        },
        otherFloorRecords: {
          1: "Hay {count} más registrados en {floors}.",
          2: "Hay {count} más en {floors}, por si algún día vas por allí.",
          3: "Mis notas guardan {count} más en {floors}."
        },
        rankingUnknown: {
          1: "{count} de ellos no tienen valor registrado, así que no los ordeno.",
          2: "Otros {count} no tienen cifra anotada, así que los he dejado fuera antes que inventarla.",
          3: "{count} más no tienen nada registrado, así que no están en la lista."
        },
        chanceNotRecorded: {
          1: "Algunas de esas tasas no están anotadas en ningún sitio.",
          2: "No todas las fuentes tienen tasa registrada: solo te paso lo que está escrito.",
          3: "Donde no hay tasa registrada, la he omitido en vez de inventarla."
        },
        noRecordedRate: {
          1: "Nadie ha anotado una tasa de botín para ninguna de esas fuentes.",
          2: "Tengo las fuentes, pero ni una sola tasa, así que no puedo decir que ninguna sea la mejor.",
          3: "Las fuentes están registradas; las tasas no."
        },
        comparisonTruncated: {
          1: "No son todos los campos: hay {count} en total.",
          2: "Hay {count} campos en total; te he mostrado los primeros.",
          3: "La lista completa llega a {count} campos."
        }
      },
      status: {
        ambiguous: {
          1: "Mmm, eso puede ser varias cosas. ¿A cuál te refieres?",
          2: "Espera, tengo más de una coincidencia:",
          3: "Ese nombre hace doble trabajo. ¿Cuál de ellos?",
          4: "Mmm, me has dado un nombre que encaja con más de una cosa:",
          5: "Cuidado, eso puede ser cualquiera de estos:",
          6: "Tengo varias fichas con ese nombre. Elige:",
          7: "Eso no es lo bastante concreto para mis notas. ¿Cuál de estos?",
          8: "Más de una cosa responde a ese nombre. ¿Cuál?"
        },
        missing: {
          1: "Mmm, encontré el nombre pero no los detalles.",
          2: "Solo tengo una parte de eso.",
          3: "Conozco el nombre, pero mis notas se acaban ahí.",
          4: "Ese está a medio escribir en mi libro.",
          5: "Tengo el nombre y poco más.",
          6: "Mmm, ese está escaso. Esto es lo que tengo.",
          7: "Tengo un trozo de eso, no todo.",
          8: "Mis notas sobre ese están incompletas. Esto es lo que hay."
        },
        unsupported: {
          1: "Mmm, aún no tengo una pista fiable de eso.",
          2: "Eso queda fuera de mis registros, lo siento.",
          3: "No es el tipo de cosa de la que guardo notas.",
          4: "Con eso no puedo ayudarte: no es mi especialidad.",
          5: "Mmm, eso va más allá de lo que yo trato.",
          6: "De eso no tengo nada, y no me lo voy a inventar.",
          7: "Eso queda fuera de mi negocio, me temo.",
          8: "No hay registros de eso. Prueba con algo del juego."
        },
        candidates: { 1: "Candidatos:", 2: "Esto es lo que ha salido:", 3: "Posibles coincidencias:" },
        emptySet: {
          1: "Nada en este piso coincide con eso.",
          2: "Esa lista me ha salido vacía, lo siento.",
          3: "He repasado toda la lista: aquí no hay nada que coincida."
        },
        sourcesAvailable: "En esta página solo puedo ver: {sources}.",
        noSources: "Todavía no puedo ver ningún registro del juego en esta página.",
        engineMissing: {
          1: "Mis registros aún no están cargados en esta página, así que aquí no puedo buscar nada.",
          2: "En esta página no llevo mis notas encima. Pregúntame donde estén cargadas.",
          3: "Mi libro no está en esta página, así que no tengo nada que consultar.",
          4: "Aquí no hay con qué trabajar: mis registros aún no están cargados en esta página."
        },
        datasetUnsupported: {
          1: "Je, je. Últimamente solo trabajo con Datos actuales. Cambia tu conjunto de datos a Datos actuales y veré qué puedo encontrar para ti.",
          2: "Mis notas solo cubren los Datos actuales ahora. Cambia tu conjunto de datos a Datos actuales y pregúntame otra vez.",
          3: "Solo Datos actuales, esa es mi norma. Cambia tu conjunto de datos y rebuscaré en lo que tengo.",
          4: "De mí no vas a sacar respuestas de prueba beta; yo trabajo con los Datos actuales. Cambia tu conjunto de datos y vuelvo a mirar."
        },
        error: {
          1: "Algo se ha atascado en mis archivos. ¿Me lo preguntas otra vez?",
          2: "Mmm, mis notas se me han desparramado. ¿Me lo repites?",
          3: "Eso se ha perdido de camino a mi mesa. ¿Otra vez?",
          4: "Algo se ha enredado en mis notas. ¿Lo intentas de nuevo?"
        }
      },
      type: {
        item: "Objeto",
        mob: "Mob",
        boss: "Jefe",
        npc: "PNJ",
        merchant: "Mercader",
        location: "Ubicación",
        dungeon: "Mazmorra",
        quest: "Misión"
      },
      help: {
        body: {
          1: "Pregúntame por objetos y equipo, mobs y jefes, qué suelta qué, recetas de fabricación, misiones, PNJ y mercaderes, o ubicaciones del mapa. Dame un nombre y rebuscaré en los registros.",
          2: "Yo trato con nombres: objetos, equipo, monstruos, jefes, botines, recetas, misiones, tenderos, lugares. Dame uno y te diré lo que sé.",
          3: "Tráeme un nombre —un mob, un objeto, una misión, un mercader, un punto del mapa— y consultaré mis notas.",
          4: "Mobs, botines, objetos, recetas, misiones, PNJ, ubicaciones. Nombra cualquiera de esos y lo busco para ti."
        }
      }
    }
  });

  translations.fr = deepMerge(translations.fr, {
    argo: {
      lead: {
        item: {
          1: "Oho, une piste !",
          2: "Voyons ce que disent les dossiers.",
          3: "J'ai le dossier sous la main.",
          4: "Ce nom me dit quelque chose. Un instant.",
          5: "Les questions d'équipement, c'est mon pain quotidien.",
          6: "Hmm, laisse-moi vérifier mes notes.",
          7: "Tu as de la chance : j'ai une fiche là-dessus.",
          8: "Un objet, hein ? J'aime quand on me demande des choses que je peux nommer.",
          9: "Fouillons. Les objets laissent des traces sur le papier, et le papier, c'est moi qui le garde.",
          10: "J'ai vendu de pires informations pour de bons Cols. Celle-ci est offerte.",
          11: "Bien, ce nom me dit quelque chose.",
          12: "Voyons ce que j'ai noté.",
          13: "Oho, on demande du beau matériel.",
          14: "J'attendais que quelqu'un me demande ça.",
          15: "Bien sûr, je connais celui-là.",
          16: "Hmm, ce nom est quelque part dans mon carnet.",
          17: "Laisse-moi tourner à la bonne page.",
          18: "Tu veux les détails ? J'ai les détails.",
          19: "Voilà un nom qui vaut la peine d'être cherché.",
          20: "Voyons tout ce que je peux te dire."
        },
        recipe: {
          1: "Ah, une question d'artisan. J'aime ça.",
          2: "Laisse-moi dénicher cette recette.",
          3: "Voilà ce que listent les dossiers.",
          4: "Tu fabriques quelque chose ? Je vérifie.",
          5: "Hmm, les recettes, je les tiens en ordre.",
          6: "Voyons ce qu'il faut pour ça.",
          7: "Bien, cherchons les matériaux.",
          8: "Un artisan avec des Cols à dépenser. Bien.",
          9: "Voyons ce que les dossiers disent qu'il faut.",
          10: "Celle-là a une recette, j'en suis assez sûre.",
          11: "Laisse-moi sortir la liste.",
          12: "Hmm, laisse-moi voir les ingrédients."
        },
        mob: {
          1: "Oho, une question de chasse.",
          2: "Voyons ce que dit le bestiaire.",
          3: "J'ai une fiche là-dessus.",
          4: "Un monstre, hein ? Ça laisse beaucoup de traces.",
          5: "Tu chasses ? Laisse-moi vérifier.",
          6: "Celui-là a mauvaise réputation, si je me souviens bien.",
          7: "Voyons ce que les dossiers disent de cette bête.",
          8: "Beaucoup de gens me demandent celui-là. Je sors mes notes.",
          9: "Hmm, ce nom me dit quelque chose.",
          10: "Laisse-moi voir ce que j'ai sur lui.",
          11: "Une question de chasseur. Ma préférée.",
          12: "Bien, celui-là. Un instant.",
          13: "Voyons où il vit et avec quoi il frappe.",
          14: "Je note tout ce qui a des dents. Laisse-moi regarder.",
          15: "Ce nom, je l'ai entendu plus d'une fois.",
          16: "Laisse-moi voir ce que j'ai noté là-dessus.",
          17: "Fais attention à celui-là... ou pas, c'est ta nuque. Voilà ce que je sais.",
          18: "Hmm, laisse-moi fouiller les pages du bestiaire.",
          19: "Les monstres, c'est du commerce facile. Ils sont toujours quelque part.",
          20: "Voyons s'il est aussi méchant qu'on le dit."
        },
        mobDrops: {
          1: "Ah, une question de pilleur !",
          2: "Voyons ce qu'il lâche.",
          3: "Voilà la liste de butin que j'ai.",
          4: "Tu vises ses poches ? Judicieux.",
          5: "Voyons ce qui tombe de celui-là.",
          6: "Hmm, les listes de butin, j'en tiens.",
          7: "Tu veux ce qu'il transporte. Entendu.",
          8: "Laisse-moi regarder la liste. Je ne les devine pas.",
          9: "Celui-là vaut la peine d'être chassé pour une raison.",
          10: "Bien, voyons ce qu'il laisse derrière lui.",
          11: "Tuer, prendre ses affaires. C'est le métier.",
          12: "Laisse-moi voir ce que j'ai noté pour lui.",
          13: "Hmm, laisse-moi vérifier ce qu'il y a sur la liste.",
          14: "Voyons si ça vaut ton temps."
        },
        drop: {
          1: "Oho, tu suis une piste de butin ?",
          2: "Voyons qui le détient.",
          3: "J'ai fouillé les listes de butin.",
          4: "Tu cherches d'où ça vient ? Malin.",
          5: "Laisse-moi voir qui le porte.",
          6: "Hmm, c'est un butin, ça ?",
          7: "Quelqu'un l'a. Voyons qui.",
          8: "Je tiens mes listes de butin en ordre. Un instant.",
          9: "Bien, remontons la piste.",
          10: "Laisse-moi voir quels monstres le portent.",
          11: "Tu cours après un butin ? Je ferais pareil.",
          12: "Hmm, laisse-moi voir ce qui est enregistré.",
          13: "Ça ne pousse pas sur les arbres. Laisse-moi regarder.",
          14: "Voyons qui est assez généreux pour le lâcher."
        },
        npc: {
          1: "En demandant, on trouve des gens. Je vérifie.",
          2: "Voyons où le trouver.",
          3: "J'ai une piste là-dessus.",
          4: "Tu cherches quelqu'un ? Laisse-moi voir mes notes.",
          5: "Hmm, les gens bougent. Laisse-moi regarder.",
          6: "Bien, voyons où ils ont monté leur boutique.",
          7: "Je connais presque tous les marchands. Laisse-moi regarder.",
          8: "Laisse-moi voir ce que j'ai sur cette personne.",
          9: "Hmm, laisse-moi vérifier où elle se trouve.",
          10: "Marchands et vagabonds : je suis les deux.",
          11: "Laisse-moi voir si je peux t'orienter vers eux.",
          12: "Bien, allons les trouver."
        },
        quest: {
          1: "Ah, une piste de quête.",
          2: "Regardons la fiche de quête.",
          3: "Voilà ce que j'ai sur cette quête.",
          4: "Du travail ? Laisse-moi regarder le tableau.",
          5: "Hmm, celle-là cherche de l'aide depuis un moment.",
          6: "Laisse-moi voir ce que j'ai noté.",
          7: "Une quête, hein ? Celles-là, je les note avec soin.",
          8: "Bien, voyons qui la distribue.",
          9: "Quelqu'un veut qu'on lui rende un service. Je vérifie.",
          10: "J'ai des notes sur presque toutes.",
          11: "Voyons les détails avant que tu acceptes le travail.",
          12: "Hmm, laisse-moi sortir cette fiche.",
          13: "Le travail paie. Voyons combien ça vaut.",
          14: "Voyons la récompense avant que tu t'engages."
        },
        location: {
          1: "Oho, tu veux le plan des lieux ?",
          2: "Voyons où ça se trouve.",
          3: "Je l'ai épinglé sur la carte.",
          4: "Des indications ? Ça, je sais faire.",
          5: "Laisse-moi consulter mes notes de carte.",
          6: "Hmm, c'est un lieu, ça ? Laisse-moi regarder.",
          7: "Tu voudras des coordonnées, je suppose.",
          8: "Bien, trouvons-le sur la carte.",
          9: "Je connais ces étages mieux que la plupart.",
          10: "Voyons ce qui est marqué là-dessous.",
          11: "Les lieux, j'arrive en général à les situer. Essayons.",
          12: "Hmm, laisse-moi vérifier mes notes de carte.",
          13: "Facile, si mes notes ne me trompent pas.",
          14: "Voyons ce qu'il y a dans ce coin."
        }
      },
      facts: {
        item: { 1: "Voilà ce qui est noté :", 2: "Voilà ce que j'ai là-dessus :", 3: "Les dossiers disent ceci :" },
        recipe: { 1: "Voilà la liste :", 2: "Ce qu'il faut :", 3: "Voilà ce qui est enregistré :" },
        mob: { 1: "Voilà ce que j'ai :", 2: "La fiche dit ceci :", 3: "L'entrée dit ceci :" },
        mobDrops: {
          1: "Voilà la liste de butin :",
          2: "Voilà ce qui est noté pour lui :",
          3: "Ce que j'ai dit ceci :"
        },
        drop: { 1: "Voilà qui le détient :", 2: "Les listes disent ceci :", 3: "Voilà ce que j'ai trouvé :" },
        npc: { 1: "Voilà ce que je sais :", 2: "Voilà ce qui est noté :", 3: "Les notes disent ceci :" },
        quest: { 1: "Voilà la fiche :", 2: "Voilà ce qu'elle dit :", 3: "La fiche dit ceci :" },
        location: {
          1: "Voilà ce qui est marqué :",
          2: "Voilà ce que j'ai en main :",
          3: "Les notes de carte disent ceci :"
        }
      },
      close: {
        1: "Ça vient droit des dossiers.",
        2: "Tout ça est solide, j'ai vérifié.",
        3: "Rien d'inventé là-dedans.",
        4: "Tu peux te fier à ça.",
        5: "Chaque ligne de ça est notée quelque part.",
        6: "C'est tout ce qui est enregistré.",
        7: "Fiable, ça. Je ne colporte pas de racontars.",
        8: "Ça vient de la source, pas des on-dit.",
        9: "Bonne information. Elle vaut son prix.",
        10: "C'est ce que disent les dossiers, et ils ne me mentent pas.",
        11: "Information propre. Profites-en.",
        12: "C'est confirmé, pas du ouï-dire."
      },
      label: {
        floor: "Étage {floor}",
        level: "Niv. {level}",
        stats: "Statistiques",
        craftingLocation: "Lieu de fabrication",
        craftingResources: "Ressources de fabrication",
        droppedBy: "Lâché par",
        drops: "Butin",
        spawnArea: "Zone d'apparition",
        mobs: "Monstres",
        rewards: "Récompenses",
        requirements: "Prérequis",
        npc: "PNJ",
        sells: "Vend",
        quests: "Quêtes",
        unknown: "inconnu",
        recordsFound: "{label} : {count}",
        moreRecords: "et {count} de plus (sur {total})",
        rankedBy: "{label} par {field}, {direction} :",
        highestFirst: "du plus haut au plus bas",
        lowestFirst: "du plus bas au plus haut",
        bestSource: "Meilleure source enregistrée : {mob} ({chance}%)",
        levelField: "Niveau",
        typeField: "Type",
        categoryField: "Catégorie",
        questType: "Type de quête",
        bestiaryTab: "Liste du bestiaire",
        target: {
          quest: "Quêtes",
          boss: "Boss",
          mob: "Monstres",
          item: "Objets",
          npc: "PNJ",
          location: "Lieux",
          dungeon: "Donjons",
          area: "Zones"
        }
      },
      note: {
        itemRecordMissing: {
          1: "Il y a plus sur celui-là que ce que j'ai dans mes notes. C'est tout ce que je peux te donner pour l'instant.",
          2: "C'est tout ce que j'ai là-dessus : mes notes sur celui-ci sont maigres.",
          3: "Je t'ai donné ce que j'ai. Le reste n'est noté nulle part où je puisse aller."
        },
        bestiaryRecordMissing: {
          1: "Je n'ai pas de fiche sur celui-là, seulement ce que tu vois ici.",
          2: "Mes notes là-dessus commencent et finissent à ce que tu vois.",
          3: "Celui-là est à peine documenté. Ce qui est au-dessus, c'est tout."
        },
        noDropRecord: {
          1: "Personne n'a noté ce qu'il lâche, alors je ne vais pas le deviner.",
          2: "Pas de liste de butin pour celui-là, et je ne les invente pas.",
          3: "Je n'ai aucune liste de butin pour lui. Je préfère ne rien dire que d'inventer."
        },
        noRecipe: {
          1: "Aucune recette n'est notée, je ne peux pas t'en donner une.",
          2: "Je n'ai pas de recette pour celui-là.",
          3: "Personne n'a enregistré comment ça se fabrique, et je n'invente pas de recettes."
        },
        noCraftingLocation: {
          1: "Mes notes ne disent pas où c'est fabriqué ni vendu.",
          2: "Aucun atelier ni marchand n'est noté à côté de celui-là.",
          3: "Je ne peux pas te dire où le fabriquer : cette partie est vide dans mes notes."
        },
        noStats: {
          1: "Aucun chiffre n'est noté pour ça.",
          2: "Personne n'a enregistré ses statistiques.",
          3: "Je n'ai aucun chiffre pour celui-là."
        },
        noSpawnArea: {
          1: "Aucune zone d'apparition n'est notée.",
          2: "Mes notes ne disent pas où il apparaît.",
          3: "L'endroit où il vit n'est pas enregistré."
        },
        markerNotFound: {
          1: "Je n'ai pas pu le situer sur la carte.",
          2: "Ce nom n'est marqué nulle part où je puisse voir.",
          3: "Pas de marque sur la carte, je ne peux pas t'y orienter."
        },
        questMarkerOnly: {
          1: "Je n'ai que sa marque sur la carte, pas les détails de la quête.",
          2: "Seul son emplacement est noté, pas le reste du travail.",
          3: "La carte le connaît. Mes notes sur la quête elle-même sont vides."
        },
        absenceNotProof: {
          1: "Ce n'est pas une preuve que ça n'existe pas dans le jeu : juste que mes notes ne l'ont pas.",
          2: "Ne prends pas ça pour une preuve que ça n'existe pas. Ça veut seulement dire que je ne l'ai pas noté.",
          3: "Que je ne le connaisse pas ne veut pas dire que ça n'existe pas."
        },
        otherIsland: {
          1: "Celui-là est sur une autre île que celle que tu regardes.",
          2: "Ça appartient à une autre île : tu en regardes une différente.",
          3: "Une autre île, complètement, celui-là."
        },
        englishOnly: {
          1: "Petit avertissement : je lis la question en anglais et j'attrape quelques mots de français, mais les noms, de préférence en anglais.",
          2: "Je comprends la question en anglais, avec un peu de français ; pour les noms, reste en anglais.",
          3: "Les questions, je les lis en anglais, avec un peu de français ; si tu nommes les choses en anglais, on s'entendra."
        },
        floorInferred: {
          1: "Cette fiche se trouve à l'Étage {floor}.",
          2: "J'ai ça noté à l'Étage {floor}.",
          3: "Tu trouveras ça à l'Étage {floor} dans mes notes."
        },
        otherFloorRecords: {
          1: "{count} de plus sont enregistrés à {floors}.",
          2: "Il y en a {count} de plus à {floors}, si jamais tu y vas.",
          3: "Mes notes en gardent {count} de plus à {floors}."
        },
        rankingUnknown: {
          1: "{count} d'entre eux n'ont aucune valeur enregistrée, je ne les classe donc pas.",
          2: "{count} autres n'ont aucun chiffre noté : je les ai laissés de côté plutôt que de deviner.",
          3: "{count} de plus n'ont rien d'enregistré, ils ne sont donc pas dans la liste."
        },
        chanceNotRecorded: {
          1: "Certains de ces taux ne sont notés nulle part.",
          2: "Toutes les sources n'ont pas de taux enregistré : je ne transmets que ce qui est écrit.",
          3: "Là où le taux n'est pas enregistré, je l'ai omis plutôt que de deviner."
        },
        noRecordedRate: {
          1: "Personne n'a noté de taux de butin pour ces sources.",
          2: "J'ai les sources, mais pas un seul taux : je ne peux donc pas dire laquelle est la meilleure.",
          3: "Les sources sont enregistrées ; les taux, non."
        },
        comparisonTruncated: {
          1: "Ce ne sont pas tous les champs : il y en a {count} au total.",
          2: "Il y a {count} champs en tout ; je t'ai montré les premiers.",
          3: "La liste complète compte {count} champs."
        }
      },
      status: {
        ambiguous: {
          1: "Hmm, ça pourrait être plusieurs choses. Laquelle voulais-tu ?",
          2: "Attends, j'ai plus d'une correspondance :",
          3: "Ce nom fait double emploi. Lequel ?",
          4: "Hmm, tu m'as donné un nom qui colle à plusieurs choses :",
          5: "Attention, ça pourrait être n'importe lequel de ceux-là :",
          6: "J'ai plusieurs fiches sous ce nom. À toi de choisir :",
          7: "Ce n'est pas assez précis pour mes notes. Lequel de ceux-là ?",
          8: "Plus d'une chose répond à ce nom. Laquelle ?"
        },
        missing: {
          1: "Hmm, j'ai trouvé le nom mais pas les détails.",
          2: "Je n'ai qu'une partie de ça.",
          3: "Je connais le nom, mais mes notes s'arrêtent là.",
          4: "Celui-là n'est écrit qu'à moitié dans mon carnet.",
          5: "J'ai le nom et pas grand-chose de plus.",
          6: "Hmm, celui-là est maigre. Voilà ce que j'ai.",
          7: "J'ai un morceau de ça, pas le tout.",
          8: "Mes notes là-dessus sont incomplètes. Voilà ce qu'il y a."
        },
        unsupported: {
          1: "Hmm, je n'ai pas encore de piste fiable là-dessus.",
          2: "Ça sort de mes dossiers, désolée.",
          3: "Ce n'est pas le genre de chose sur laquelle je prends des notes.",
          4: "Pour ça, je ne peux pas t'aider : ce n'est pas mon domaine.",
          5: "Hmm, ça dépasse ce dont je traite.",
          6: "Là-dessus je n'ai rien, et je ne vais pas l'inventer.",
          7: "Ça sort de mon commerce, j'en ai peur.",
          8: "Aucun dossier là-dessus. Essaie avec quelque chose du jeu."
        },
        candidates: { 1: "Candidats :", 2: "Voilà ce qui est ressorti :", 3: "Correspondances possibles :" },
        emptySet: {
          1: "Rien sur cet étage ne correspond à ça.",
          2: "Cette liste est vide, j'en ai peur.",
          3: "J'ai passé toute la liste en revue : rien ne correspond ici."
        },
        sourcesAvailable: "Sur cette page, je ne vois que : {sources}.",
        noSources: "Je ne vois encore aucun registre de jeu sur cette page.",
        engineMissing: {
          1: "Mes dossiers ne sont pas encore chargés sur cette page, je ne peux rien y chercher.",
          2: "Je n'ai pas mes notes sur cette page. Demande-moi là où elles sont chargées.",
          3: "Mon carnet n'est pas sur cette page, je n'ai donc rien à consulter.",
          4: "Rien pour travailler ici : mes dossiers ne sont pas encore chargés sur cette page."
        },
        datasetUnsupported: {
          1: "Hé, je ne travaille plus qu'avec les Données actuelles. Passe ton jeu de données sur Données actuelles et je verrai ce que je peux trouver pour toi.",
          2: "Mes notes ne couvrent plus que les Données actuelles. Passe ton jeu de données sur Données actuelles et redemande-moi.",
          3: "Données actuelles uniquement, c'est ma règle. Change ton jeu de données et je fouillerai ce que j'ai.",
          4: "Tu n'auras pas de réponses de test bêta de ma part : je travaille avec les Données actuelles. Change ton jeu de données et je regarde à nouveau."
        },
        error: {
          1: "Quelque chose s'est coincé dans mes dossiers. Tu me la reposes ?",
          2: "Hmm, mes notes se sont éparpillées. Tu me le redemandes ?",
          3: "Ça s'est perdu en chemin vers mon bureau. Réessaie ?",
          4: "Quelque chose s'est emmêlé dans mes notes. Tu retentes ?"
        }
      },
      type: {
        item: "Objet",
        mob: "Monstre",
        boss: "Boss",
        npc: "PNJ",
        merchant: "Marchand",
        location: "Lieu",
        dungeon: "Donjon",
        quest: "Quête"
      },
      help: {
        body: {
          1: "Demande-moi des objets et de l'équipement, des monstres et des boss, ce qui lâche quoi, des recettes de fabrication, des quêtes, des PNJ et des marchands, ou des lieux sur la carte. Donne-moi un nom et je fouille les dossiers.",
          2: "Je travaille sur des noms : objets, équipement, monstres, boss, butins, recettes, quêtes, marchands, lieux. Donne-m'en un et je te dirai ce que je sais.",
          3: "Apporte-moi un nom — un monstre, un objet, une quête, un marchand, un point sur la carte — et je consulterai mes notes.",
          4: "Monstres, butins, objets, recettes, quêtes, PNJ, lieux. Nomme n'importe lequel et je le cherche pour toi."
        }
      }
    }
  });
  translations.en = deepMerge(translations.en, {
    argo: {
      lead: {
        collection: {
          1: "{label}? I've got {count} on record - here's the whole lot.",
          2: "A full sweep of {label}, is it? {count} names, and not one of them a guess.",
          3: "The {label} shelf, is it? {count} of them, every one checked.",
          4: "You're after the {label} list. {count} of them - let's read them out.",
          5: "Ah, browsing the whole shelf. {count} {label}, coming right up.",
          6: "Right, let me pull the {label} file. {count} of them - have a look."
        },
        ranking: {
          1: "Let's see who comes out on top.",
          2: "A ranking, is it? Now that's my kind of question.",
          3: "Numbers don't argue. Let's line them up.",
          4: "Let me sort these the way the records do.",
          5: "You want the top of the list. Let's have a look.",
          6: "Oho, weighing the field. I do like a good ladder."
        },
        comparison: {
          1: "Side by side, then. Let's see how they measure up.",
          2: "Putting those two next to each other - here's the picture.",
          3: "A comparison? Fair enough, let's line them up.",
          4: "Let's lay them out and see who blinks first.",
          5: "Two records, one table. Have a look.",
          6: "You want them weighed against each other. Here's what the records hold."
        },
        farming: {
          1: "Hunting for it, are you? Let's find your best odds.",
          2: "A farming question. That's the practical kind - I approve.",
          3: "So you want it in bulk. Here's where it comes from.",
          4: "Let's see who's been dropping that, and how often.",
          5: "Ah, a supply question. My favourite sort of business.",
          6: "You'll want the sources, then. Let me dig them out."
        }
      },
      close: {
        collection: {
          1: "That's the set, complete as the records have it.",
          2: "Every one of those is on the books - nothing padded.",
          3: "If it's not in that list, the records don't know it either.",
          4: "That's the lot. Happy hunting."
        },
        ranking: {
          1: "That's how the records stack them up.",
          2: "The order is the records' own, not my opinion.",
          3: "That's the ladder as the records put it.",
          4: "Those are the standings, straight off the page."
        },
        comparison: {
          1: "Both entries are the records' own - draw your own conclusion.",
          2: "That's the pair of them, field by field.",
          3: "Nothing hidden in that table.",
          4: "Judge for yourself - the numbers are all there."
        },
        farming: {
          1: "Those are the recorded sources, best odds first.",
          2: "The rates are the records' own; the rest is your luck.",
          3: "That's where it drops, as far as my notes go.",
          4: "Good luck out there - that's everything the notes hold."
        }
      }
    }
  });


  translations.es = deepMerge(translations.es, {
    argo: {
      lead: {
        collection: {
          1: "¿{label}? Tengo {count} en el registro: aquí va la lista completa.",
          2: "¿Un repaso completo de {label}? {count} nombres, y ninguno es una suposición.",
          3: "¿El estante de {label}? {count} en total, todos comprobados.",
          4: "Buscas la lista de {label}. Son {count}: vamos a leerlos.",
          5: "Vaya, quieres ver todo el estante. {count} {label}, ahora mismo.",
          6: "Vale, saco el expediente de {label}. {count} en total: échale un ojo."
        },
        ranking: {
          1: "Veamos quién queda arriba.",
          2: "¿Una clasificación? Esa sí es mi clase de pregunta.",
          3: "Los números no discuten. Vamos a alinearlos.",
          4: "Déjame ordenarlos como lo hacen los registros.",
          5: "Quieres la cabeza de la lista. Vamos a verla.",
          6: "Oho, pesando el terreno. Me gusta una buena escalera."
        },
        comparison: {
          1: "Lado a lado, entonces. Veamos cómo miden.",
          2: "Pongo esos dos juntos: esta es la foto.",
          3: "¿Una comparación? Vale, vamos a alinearlos.",
          4: "Vamos a ponerlos en fila y ver quién parpadea primero.",
          5: "Dos fichas, una tabla. Échale un ojo.",
          6: "Los quieres medidos el uno contra el otro. Esto es lo que guardan los registros."
        },
        farming: {
          1: "¿Lo andas buscando? Vamos a ver tus mejores probabilidades.",
          2: "Una pregunta de recolección. Esa es práctica, me gusta.",
          3: "Así que lo quieres en cantidad. De aquí sale.",
          4: "Veamos quién lo suelta, y con qué frecuencia.",
          5: "Ah, una pregunta de suministro. Mi negocio favorito.",
          6: "Querrás las fuentes, entonces. Déjame sacarlas."
        }
      },
      close: {
        collection: {
          1: "Ese es el conjunto, completo según los registros.",
          2: "Todos esos están en mis notas; nada rellenado.",
          3: "Si no está en esa lista, los registros tampoco lo saben.",
          4: "Eso es todo. Buena caza."
        },
        ranking: {
          1: "Así los apilan los registros.",
          2: "El orden es de los registros, no mi opinión.",
          3: "Esa es la escalera tal como la ponen los registros.",
          4: "Esas son las posiciones, tal cual la página."
        },
        comparison: {
          1: "Ambas fichas son de los registros: saca tus conclusiones.",
          2: "Ahí los tienes, campo por campo.",
          3: "No hay nada escondido en esa tabla.",
          4: "Júzgalo tú: los números están todos ahí."
        },
        farming: {
          1: "Esas son las fuentes registradas, mejores probabilidades primero.",
          2: "Los porcentajes son de los registros; el resto es tu suerte.",
          3: "Ahí es donde cae, hasta donde llegan mis notas.",
          4: "Suerte con la caza; ahí está todo lo anotado."
        }
      }
    }
  });


  /* Argo's list answers. A collection, a ranking, a comparison and a farming question each open with
     their own introduction and close with a remark about the list itself, rather than borrowing the
     single-record wording. A collection's opener carries {count} and {label}, so the plain count
     heading is not simply repeated after it. Mirrored as English fallbacks in shared/sao-argo.js. */
  translations.fr = deepMerge(translations.fr, {
    argo: {
      lead: {
        collection: {
          1: "{label} ? J'en ai {count} au registre — voilà la liste complète.",
          2: "Tout le rayon des {label}, hein ? {count} noms, et pas une supposition.",
          3: "Le rayon des {label} ? {count} au total, tous vérifiés.",
          4: "Tu veux la liste des {label}. {count} au total — je te les lis.",
          5: "Tiens, tu fais le tour du rayon. {count} {label}, tout de suite.",
          6: "Bon, je sors le dossier des {label}. {count} au total — regarde."
        },
        ranking: {
          1: "Voyons qui arrive en tête.",
          2: "Un classement ? Ça, c'est ma sorte de question.",
          3: "Les chiffres ne discutent pas. Alignons-les.",
          4: "Laisse-moi les trier comme le font les registres.",
          5: "Tu veux le haut de la liste. Regardons ça.",
          6: "Ho, on pèse le terrain. J'aime bien une bonne échelle."
        },
        comparison: {
          1: "Côte à côte, alors. Voyons ce que ça donne.",
          2: "Je mets ces deux-là ensemble — voilà le tableau.",
          3: "Une comparaison ? Entendu, alignons-les.",
          4: "Mettons-les en ligne et voyons qui cille le premier.",
          5: "Deux fiches, un tableau. Regarde.",
          6: "Tu veux les peser l'un contre l'autre. Voilà ce que disent les registres."
        },
        farming: {
          1: "Tu veux le récolter ? Voyons tes meilleures chances.",
          2: "Une question de récolte. C'est pratique, j'approuve.",
          3: "Tu le veux en quantité, alors. Voilà d'où ça sort.",
          4: "Voyons qui lâche ça, et à quelle fréquence.",
          5: "Ah, une question d'approvisionnement. Mon commerce préféré.",
          6: "Il te faut les sources, alors. Je vais les déterrer."
        }
      },
      close: {
        collection: {
          1: "Ça, c'est l'ensemble, complet comme les registres l'ont.",
          2: "Tous ceux-là sont au registre — rien de gonflé.",
          3: "Si ce n'est pas dans cette liste, les registres ne le savent pas non plus.",
          4: "Voilà le lot. Bonne chasse."
        },
        ranking: {
          1: "Voilà comment les registres les empilent.",
          2: "L'ordre vient des registres, pas de mon avis.",
          3: "C'est l'échelle telle que les registres la posent.",
          4: "Voilà le classement, tel quel."
        },
        comparison: {
          1: "Les deux fiches viennent des registres — à toi de conclure.",
          2: "Les voilà tous les deux, champ par champ.",
          3: "Rien de caché dans ce tableau.",
          4: "Juge par toi-même — les chiffres sont tous là."
        },
        farming: {
          1: "Voilà les sources enregistrées, meilleures chances d'abord.",
          2: "Les taux viennent des registres ; le reste, c'est ta chance.",
          3: "C'est là que ça tombe, d'après mes notes.",
          4: "Bonne chance ; voilà tout ce que mes notes contiennent."
        }
      }
    }
  });



  const characterBuildTranslations = {
    en: {
      page: {
        characterBuild: {
          navBack: "Go back to Menu",
          eyebrow: "AINCRAD / BUILD LAB",
          title: "Character Build Mode",
          browserTitle: "Character Build Mode | SAO MC Interactive Map",
          metaDescription: "Build and preview an Aincrad character with sample equipment and skills.",
          subtitle: "Assemble a loadout, review its combat stats, and explore prototype skill trees.",
          resetBuild: "Reset Build",
          configuration: "Build configuration",
          dataSource: "Data source",
          currentData: "Current Data",
          betaData: "Beta-Test Data",
          readingCurrent: "Reading the Current Equipment Compendium.",
          buildSlot: "Build slot",
          buildNumber: "Build {number}",
          level: "Level",
          class: "Class",
          loadout: "LOADOUT",
          equipment: "Equipment",
          slots: "{count} slots",
          armor: "Armor",
          accessories: "Accessories",
          weaponsOffhand: "Weapons / Offhand",
          characterSheet: "CHARACTER SHEET",
          stats: "Stats",
          statGroups: {
            itemStats: "Item Stats"
          },
          base: "Stat Base: {level}",
          placeholderPreview: "PROTOTYPE PREVIEW",
          skillTree: "Skill Tree",
          sampleSkills: "Prototype skills",
          sampleSkillTree: "Prototype skill tree",
          placeholderNote:
            "These prototype nodes demonstrate a possible class progression; they are not final skill data.",
          equipmentSelector: "EQUIPMENT SELECTOR",
          selectEquipment: "Select equipment",
          closeEquipmentSelector: "Close equipment selector",
          searchItems: "Search items",
          searchPlaceholder: "Search by name or effect...",
          rarity: "Rarity",
          allRarities: "All rarities",
          rune: "Rune",
          selected: "Selected",
          locked: "Locked",
          available: "Available",
          selectSlot: "Select {slot}",
          selectRune: "Select {slot} rune {number}",
          runeSlots: "{slot} rune slots",
          equipped: "Equipped",
          unavailable: "Unavailable in selected data",
          emptySlot: "Empty slot",
          prototypeTree: "Prototype tree",
          prototypeDataOnly: "Prototype data only",
          requires: "Requires: {value}",
          requiresAny: "Requires any one of: {value}",
          effect: "Effect: {value}",
          state: "State: {value}",
          none: "None",
          alreadyUnlocked: "Already unlocked",
          readyToUnlock: "Ready to unlock",
          requiresSkills: "Requires {value}",
          requiresMorePoints: "Requires {value}",
          skillPoints: "{class} · {remaining} / {total} skill points",
          skillPointsUnlimited: "{class} · {spent} spent · Unlimited skill points",
          unlimitedSkillPoints: "Unlimited skill points",
          unlimitedSkillPointsHint: "Testing only: unlock skills without spending the skill points your level grants.",
          deselectDependent: "Deselect dependent skills first.",
          noMatchingItems: "No {slot} items match these filters at level {level}.",
          weaponAlreadyEquipped: "This weapon is already equipped in the other weapon slot.",
          twoHanded: "Two-Handed",
          removeItem: "Remove",
          offhandLocked: "Two-handed weapon equipped",
          removeOffhandFirst: "Remove the equipped Offhand item first.",
          selectRuneFor: "Select Rune {number} for {slot}",
          itemLevel: "Level {level}",
          branchCore: "core",
          branchA: "branch A",
          branchB: "branch B",
          select: "Select",
          walkthrough: {
            step1Title: "Character Build",
            step1Body:
              "Configure a character, equipment, level, class, stats, skills, and related build information here.",
            step2Title: "Character level",
            step2Body:
              "Changing the level updates the displayed level and recalculates the build stats. It also affects which equipment is available at the selected level.",
            step3Title: "Equipment",
            step3Body:
              "Use this loadout section to choose equipment for the character across the available equipment groups.",
            step4Title: "Equipment slots",
            step4Body:
              "Each slot represents an equipment type, such as armor, accessories, a main weapon, or an offhand. Select a slot to browse matching items.",
            step5Title: "Equipment selector",
            step5Body:
              "The selector lists items that match the chosen slot. Use search or select an item to equip it; the walkthrough opened this dialog temporarily.",
            step6Title: "Rarity filter",
            step6Body: "Use Rarity to limit the items shown in the equipment selector to a particular rarity.",
            step7Title: "Stats",
            step7Body:
              "Stats shows the calculated values for the current build, grouped into sections such as Offensive and Defensive. Existing accordion state is left unchanged.",
            step8Title: "Skill Tree",
            step8Body:
              "This prototype skill tree shows the available class skills, their relationships, effects, and current unlock state. Skill nodes can be interacted with.",
            step9Title: "Build slots",
            step9Body:
              "Choose one of the build slots to work on a separate configuration. Character Build saves changes automatically in the browser.",
            step10Title: "Data source",
            step10Body:
              "Current Data uses the current equipment source. Beta-Test Data is a separate beta data source and is not active unless you select it.",
            step11Title: "Ready to build",
            step11Body:
              "You now know the main parts of Character Build. Start configuring your character whenever you are ready."
          }
        }
      }
    },
    es: {
      page: {
        characterBuild: {
          navBack: "Volver al menú",
          eyebrow: "AINCRAD / LABORATORIO DE BUILDS",
          title: "Modo de creación de personaje",
          browserTitle: "Modo de creación de personaje | Mapa interactivo de SAO MC",
          metaDescription: "Crea y previsualiza un personaje de Aincrad con equipo y habilidades de muestra.",
          subtitle:
            "Configura tu equipo, revisa sus estadísticas de combate y explora árboles de habilidades prototipo.",
          resetBuild: "Restablecer build",
          configuration: "Configuración de la build",
          dataSource: "Fuente de datos",
          currentData: "Datos actuales",
          betaData: "Datos de prueba beta",
          readingCurrent: "Leyendo el compendio de equipo actual.",
          buildSlot: "Espacio de build",
          buildNumber: "Construcción {number}",
          level: "Nivel",
          class: "Clase",
          loadout: "EQUIPAMIENTO",
          equipment: "Equipo",
          slots: "{count} espacios",
          armor: "Armadura",
          accessories: "Accesorios",
          weaponsOffhand: "Armas / Mano secundaria",
          characterSheet: "HOJA DEL PERSONAJE",
          stats: "Estadísticas",
          statGroups: {
            itemStats: "Estadísticas del objeto"
          },
          base: "Nivel {level} Base",
          placeholderPreview: "VISTA PREVIA DEL PROTOTIPO",
          skillTree: "Árbol de habilidades",
          sampleSkills: "Habilidades prototipo",
          sampleSkillTree: "Árbol de habilidades prototipo",
          placeholderNote:
            "Estos nodos prototipo muestran una posible progresión de clase; no son datos definitivos de habilidades.",
          equipmentSelector: "SELECTOR DE EQUIPO",
          selectEquipment: "Seleccionar equipo",
          closeEquipmentSelector: "Cerrar selector de equipo",
          searchItems: "Buscar objetos",
          searchPlaceholder: "Buscar por nombre o efecto...",
          rarity: "Rareza",
          allRarities: "Todas las rarezas",
          rune: "Runa",
          selected: "Seleccionada",
          locked: "Bloqueada",
          available: "Disponible",
          selectSlot: "Seleccionar {slot}",
          selectRune: "Seleccionar runa de {slot} {number}",
          runeSlots: "Espacios de runa de {slot}",
          equipped: "Equipado",
          unavailable: "No disponible en los datos seleccionados",
          emptySlot: "Espacio vacío",
          prototypeTree: "Árbol de prueba",
          prototypeDataOnly: "Solo datos de prueba",
          requires: "Requiere: {value}",
          requiresAny: "Requiere una de estas opciones: {value}",
          effect: "Efecto: {value}",
          state: "Estado: {value}",
          none: "Ninguno",
          alreadyUnlocked: "Ya desbloqueada",
          readyToUnlock: "Lista para desbloquear",
          requiresSkills: "Requiere {value}",
          requiresMorePoints: "Requiere {value}",
          skillPoints: "{class} · {remaining} / {total} puntos de habilidad",
          skillPointsUnlimited: "{class} · {spent} gastados · Puntos de habilidad ilimitados",
          unlimitedSkillPoints: "Puntos de habilidad ilimitados",
          unlimitedSkillPointsHint:
            "Solo para pruebas: desbloquea habilidades sin gastar los puntos de habilidad que otorga tu nivel.",
          deselectDependent: "Quita primero las habilidades dependientes.",
          noMatchingItems: "Ningún objeto de {slot} coincide con estos filtros en el nivel {level}.",
          weaponAlreadyEquipped: "Esta arma ya está equipada en el otro espacio de arma.",
          twoHanded: "A dos manos",
          removeItem: "Quitar",
          offhandLocked: "Arma a dos manos equipada",
          removeOffhandFirst: "Quita primero el objeto de mano secundaria equipado.",
          selectRuneFor: "Seleccionar runa {number} para {slot}",
          itemLevel: "Nivel {level}",
          branchCore: "núcleo",
          branchA: "rama A",
          branchB: "rama B",
          select: "Seleccionar",
          walkthrough: {
            step1Title: "Creación de personaje",
            step1Body:
              "Configura aquí el personaje, el equipo, el nivel, la clase, las estadísticas, las habilidades y otra información de la build.",
            step2Title: "Nivel del personaje",
            step2Body:
              "Cambiar el nivel actualiza el nivel mostrado y recalcula las estadísticas de la build. También afecta al equipo disponible para ese nivel.",
            step3Title: "Equipo",
            step3Body:
              "Usa esta sección de equipamiento para elegir el equipo del personaje entre los grupos disponibles.",
            step4Title: "Espacios de equipo",
            step4Body:
              "Cada espacio representa un tipo de equipo, como armadura, accesorios, arma principal o mano secundaria. Selecciona un espacio para buscar objetos compatibles.",
            step5Title: "Selector de equipo",
            step5Body:
              "El selector muestra los objetos que coinciden con el espacio elegido. Busca o selecciona un objeto para equiparlo; esta ventana se abrió temporalmente para la guía.",
            step6Title: "Filtro de rareza",
            step6Body: "Usa Rareza para limitar los objetos mostrados en el selector a una rareza concreta.",
            step7Title: "Estadísticas",
            step7Body:
              "Estadísticas muestra los valores calculados de la build actual, agrupados en secciones como Ofensiva y Defensiva. El estado actual de los acordeones no se modifica.",
            step8Title: "Árbol de habilidades",
            step8Body:
              "Este árbol de habilidades de prueba muestra las habilidades de la clase, sus relaciones, efectos y estado de desbloqueo. Puedes interactuar con sus nodos.",
            step9Title: "Espacios de build",
            step9Body:
              "Elige uno de los espacios para trabajar en una configuración separada. Character Build guarda los cambios automáticamente en el navegador.",
            step10Title: "Fuente de datos",
            step10Body:
              "Datos actuales usa la fuente de equipo actual. Datos de prueba beta es una fuente separada y no se activa a menos que la selecciones.",
            step11Title: "Listo para crear tu build",
            step11Body:
              "Ya conoces las partes principales de Character Build. Empieza a configurar tu personaje cuando quieras."
          }
        }
      }
    },
    fr: {
      page: {
        characterBuild: {
          navBack: "Retour au menu",
          eyebrow: "AINCRAD / LABORATOIRE DE BUILD",
          title: "Mode de création de personnage",
          browserTitle: "Mode de création de personnage | Carte interactive SAO MC",
          metaDescription:
            "Créez et prévisualisez un personnage d'Aincrad avec un équipement et des compétences d'exemple.",
          subtitle:
            "Composez un équipement, consultez ses statistiques de combat et explorez des arbres de compétences prototypes.",
          resetBuild: "Réinitialiser le build",
          configuration: "Configuration du build",
          dataSource: "Source des données",
          currentData: "Données actuelles",
          betaData: "Données de test bêta",
          readingCurrent: "Lecture du compendium d'équipement actuel.",
          buildSlot: "Emplacement de build",
          buildNumber: "Build {number}",
          level: "Niveau",
          class: "Classe",
          loadout: "ÉQUIPEMENT",
          equipment: "Équipement",
          slots: "{count} emplacements",
          armor: "Armure",
          accessories: "Accessoires",
          weaponsOffhand: "Armes / Main secondaire",
          characterSheet: "FICHE DU PERSONNAGE",
          stats: "Statistiques",
          statGroups: {
            itemStats: "Statistiques de l'objet"
          },
          base: "Niveau {level} Base",
          placeholderPreview: "APERÇU DU PROTOTYPE",
          skillTree: "Arbre de compétences",
          sampleSkills: "Compétences prototypes",
          sampleSkillTree: "Arbre de compétences prototype",
          placeholderNote:
            "Ces nœuds prototypes illustrent une progression de classe possible ; les données de compétences ne sont pas définitives.",
          equipmentSelector: "SÉLECTEUR D'ÉQUIPEMENT",
          selectEquipment: "Sélectionner l'équipement",
          closeEquipmentSelector: "Fermer le sélecteur d'équipement",
          searchItems: "Rechercher des objets",
          searchPlaceholder: "Rechercher par nom ou effet...",
          rarity: "Rareté",
          allRarities: "Toutes les raretés",
          rune: "Rune",
          selected: "Sélectionnée",
          locked: "Verrouillée",
          available: "Disponible",
          selectSlot: "Sélectionner {slot}",
          selectRune: "Sélectionner la rune {number} de {slot}",
          runeSlots: "Emplacements de runes de {slot}",
          equipped: "Équipé",
          unavailable: "Indisponible dans les données sélectionnées",
          emptySlot: "Emplacement vide",
          prototypeTree: "Arbre prototype",
          prototypeDataOnly: "Données de prototype uniquement",
          requires: "Nécessite : {value}",
          requiresAny: "Nécessite l'une de ces options : {value}",
          effect: "Effet : {value}",
          state: "État : {value}",
          none: "Aucun",
          alreadyUnlocked: "Déjà débloquée",
          readyToUnlock: "Prête à débloquer",
          requiresSkills: "Nécessite {value}",
          requiresMorePoints: "Nécessite {value}",
          skillPoints: "{class} · {remaining} / {total} points de compétence",
          skillPointsUnlimited: "{class} · {spent} dépensés · Points de compétence illimités",
          unlimitedSkillPoints: "Points de compétence illimités",
          unlimitedSkillPointsHint:
            "Uniquement pour les tests : débloquer des compétences sans dépenser les points accordés par ton niveau.",
          deselectDependent: "Désélectionnez d'abord les compétences dépendantes.",
          noMatchingItems: "Aucun objet de {slot} ne correspond à ces filtres au niveau {level}.",
          weaponAlreadyEquipped: "Cette arme est déjà équipée dans l'autre emplacement d'arme.",
          twoHanded: "À deux mains",
          removeItem: "Retirer",
          offhandLocked: "Arme à deux mains équipée",
          removeOffhandFirst: "Retirez d'abord l'objet de main secondaire équipé.",
          selectRuneFor: "Sélectionner la rune {number} pour {slot}",
          itemLevel: "Niveau {level}",
          branchCore: "noyau",
          branchA: "branche A",
          branchB: "branche B",
          select: "Sélectionner",
          walkthrough: {
            step1Title: "Création de personnage",
            step1Body:
              "Configurez ici votre personnage, son équipement, son niveau, sa classe, ses statistiques, ses compétences et les informations associées au build.",
            step2Title: "Niveau du personnage",
            step2Body:
              "Modifier le niveau met à jour le niveau affiché et recalcule les statistiques du build. Cela influence aussi l'équipement disponible à ce niveau.",
            step3Title: "Équipement",
            step3Body:
              "Utilisez cette section d'équipement pour choisir l'équipement du personnage parmi les groupes disponibles.",
            step4Title: "Emplacements d'équipement",
            step4Body:
              "Chaque emplacement représente un type d'équipement, comme l'armure, les accessoires, l'arme principale ou la main secondaire. Sélectionnez un emplacement pour parcourir les objets correspondants.",
            step5Title: "Sélecteur d'équipement",
            step5Body:
              "Le sélecteur liste les objets correspondant à l'emplacement choisi. Recherchez ou sélectionnez un objet pour l'équiper ; cette fenêtre a été ouverte temporairement pour la visite.",
            step6Title: "Filtre de rareté",
            step6Body: "Utilisez Rareté pour limiter les objets affichés dans le sélecteur à une rareté donnée.",
            step7Title: "Statistiques",
            step7Body:
              "Statistiques affiche les valeurs calculées du build actuel, regroupées dans des sections comme Offensif et Défensif. L'état actuel des accordéons reste inchangé.",
            step8Title: "Arbre de compétences",
            step8Body:
              "Cet arbre de compétences prototype présente les compétences de la classe, leurs relations, leurs effets et leur état de déblocage. Vous pouvez interagir avec ses nœuds.",
            step9Title: "Emplacements de build",
            step9Body:
              "Choisissez l'un des emplacements pour travailler sur une configuration distincte. Character Build enregistre automatiquement les changements dans le navigateur.",
            step10Title: "Source des données",
            step10Body:
              "Données actuelles utilise la source d'équipement actuelle. Données de test bêta est une source distincte et ne devient active que si vous la sélectionnez.",
            step11Title: "Prêt à créer votre build",
            step11Body:
              "Vous connaissez maintenant les principales parties de Character Build. Commencez à configurer votre personnage quand vous le souhaitez."
          }
        }
      }
    }
  };

  Object.entries(characterBuildTranslations).forEach(([language, additions]) => {
    translations[language] = deepMerge(translations[language] || {}, additions);
  });

  const characterBuildDataTranslations = {
    en: {
      page: {
        characterBuild: {
          classes: {
            archer: "Archer / Ranger",
            assassin: "Assassin / DPS",
            guerrier: "Warrior / Tank",
            mage: "Mage / Ranged Magic",
            "martial-artist": "Martial Artist / Melee",
            shaman: "Shaman / Support"
          },
          slotNames: {
            helmet: "Helmet",
            chestplate: "Chestplate",
            leggings: "Leggings",
            boots: "Boots",
            amulet: "Amulet",
            "ring-1": "Ring 1",
            "ring-2": "Ring 2",
            bracelet: "Bracelet",
            glove: "Glove",
            "artifact-1": "Artifact 1",
            "artifact-2": "Artifact 2",
            "artifact-3": "Artifact 3",
            offhand: "Offhand",
            "main-weapon": "Main Weapon"
          },
          groupNames: {
            offensive: "Offensive",
            defensive: "Defensive",
            mobilityStamina: "Mobility & Stamina",
            healthRegeneration: "Health & Regeneration",
            specialEffects: "Special Effects"
          },
          statNames: {
            damage: "Damage",
            physicalDamage: "Physical Damage",
            weaponDamage: "Weapon Damage",
            magicDamage: "Magic Damage",
            skillDamage: "Skill Damage",
            projectileDamage: "Projectile Damage",
            attackSpeed: "Attack Speed",
            criticalHitChance: "Critical Hit Chance",
            criticalHitDamage: "Critical Hit Damage",
            skillCriticalHitChance: "Skill Critical Hit Chance",
            skillCriticalHitDamage: "Skill Critical Hit Damage",
            defense: "Defense",
            blockProficiency: "Block Proficiency",
            blockPower: "Block Power",
            health: "Health",
            evasion: "Evasion",
            damageReduction: "Damage Reduction",
            fallDamageReduction: "Fall Damage Reduction",
            tenacity: "Tenacity",
            knockbackResistance: "Knockback Resistance",
            parryChance: "Parry Chance",
            haste: "Haste",
            movementSpeed: "Movement Speed",
            crouchingSpeed: "Crouching Speed",
            mana: "Mana",
            stamina: "Stamina",
            lifeSteal: "Life Steal",
            omnivamp: "Omnivamp",
            bonusHealing: "Bonus Healing",
            healingPower: "Healing Power",
            healthRegeneration: "Health Regeneration",
            manaRegeneration: "Mana Regeneration",
            staminaRegeneration: "Stamina Regeneration",
            flightOfLife: "Flight Of Life"
          }
        }
      }
    },
    es: {
      page: {
        characterBuild: {
          classes: {
            archer: "Arquero / Explorador",
            assassin: "Asesino / DPS",
            guerrier: "Guerrero / Tanque",
            mage: "Mago / Magia a distancia",
            "martial-artist": "Artista marcial / Cuerpo a cuerpo",
            shaman: "Chamán / Apoyo"
          },
          slotNames: {
            helmet: "Casco",
            chestplate: "Peto",
            leggings: "Calzas",
            boots: "Botas",
            amulet: "Amuleto",
            "ring-1": "Anillo 1",
            "ring-2": "Anillo 2",
            bracelet: "Brazalete",
            glove: "Guante",
            "artifact-1": "Artefacto 1",
            "artifact-2": "Artefacto 2",
            "artifact-3": "Artefacto 3",
            offhand: "Mano secundaria",
            "main-weapon": "Arma principal"
          },
          groupNames: {
            offensive: "Ofensiva",
            defensive: "Defensiva",
            mobilityStamina: "Movilidad y resistencia",
            healthRegeneration: "Salud y regeneración",
            specialEffects: "Efectos especiales"
          },
          statNames: {
            damage: "Daño",
            physicalDamage: "Daño físico",
            weaponDamage: "Daño de arma",
            magicDamage: "Daño mágico",
            skillDamage: "Daño de habilidad",
            projectileDamage: "Daño de proyectil",
            attackSpeed: "Velocidad de ataque",
            criticalHitChance: "Probabilidad de golpe crítico",
            criticalHitDamage: "Daño de golpe crítico",
            skillCriticalHitChance: "Probabilidad crítica de habilidad",
            skillCriticalHitDamage: "Daño crítico de habilidad",
            defense: "Defensa",
            blockProficiency: "Dominio de bloqueo",
            blockPower: "Potencia de bloqueo",
            health: "Salud",
            evasion: "Evasión",
            damageReduction: "Reducción de daño",
            fallDamageReduction: "Reducción de daño por caída",
            tenacity: "Tenacidad",
            knockbackResistance: "Resistencia al retroceso",
            parryChance: "Probabilidad de parada",
            haste: "Celeridad",
            movementSpeed: "Velocidad de movimiento",
            crouchingSpeed: "Velocidad agachado",
            mana: "Maná",
            stamina: "Resistencia",
            lifeSteal: "Robo de vida",
            omnivamp: "Omnivampirismo",
            bonusHealing: "Curación adicional",
            healingPower: "Potencia de curación",
            healthRegeneration: "Regeneración de salud",
            manaRegeneration: "Regeneración de maná",
            staminaRegeneration: "Regeneración de resistencia",
            flightOfLife: "Vuelo de vida"
          }
        }
      }
    },
    fr: {
      page: {
        characterBuild: {
          classes: {
            archer: "Archer / Éclaireur",
            assassin: "Assassin / DPS",
            guerrier: "Guerrier / Tank",
            mage: "Mage / Magie à distance",
            "martial-artist": "Artiste martial / Corps à corps",
            shaman: "Chaman / Soutien"
          },
          slotNames: {
            helmet: "Casque",
            chestplate: "Plastron",
            leggings: "Jambières",
            boots: "Bottes",
            amulet: "Amulette",
            "ring-1": "Anneau 1",
            "ring-2": "Anneau 2",
            bracelet: "Bracelet",
            glove: "Gant",
            "artifact-1": "Artefact 1",
            "artifact-2": "Artefact 2",
            "artifact-3": "Artefact 3",
            offhand: "Main secondaire",
            "main-weapon": "Arme principale"
          },
          groupNames: {
            offensive: "Offensif",
            defensive: "Défensif",
            mobilityStamina: "Mobilité et endurance",
            healthRegeneration: "Santé et régénération",
            specialEffects: "Effets spéciaux"
          },
          statNames: {
            damage: "Dégâts",
            physicalDamage: "Dégâts physiques",
            weaponDamage: "Dégâts d'arme",
            magicDamage: "Dégâts magiques",
            skillDamage: "Dégâts de compétence",
            projectileDamage: "Dégâts de projectile",
            attackSpeed: "Vitesse d'attaque",
            criticalHitChance: "Chance de coup critique",
            criticalHitDamage: "Dégâts critiques",
            skillCriticalHitChance: "Chance critique de compétence",
            skillCriticalHitDamage: "Dégâts critiques de compétence",
            defense: "Défense",
            blockProficiency: "Maîtrise du blocage",
            blockPower: "Puissance de blocage",
            health: "Santé",
            evasion: "Évasion",
            damageReduction: "Réduction des dégâts",
            fallDamageReduction: "Réduction des dégâts de chute",
            tenacity: "Ténacité",
            knockbackResistance: "Résistance au recul",
            parryChance: "Chance de parade",
            haste: "Hâte",
            movementSpeed: "Vitesse de déplacement",
            crouchingSpeed: "Vitesse accroupie",
            mana: "Mana",
            stamina: "Endurance",
            lifeSteal: "Vol de vie",
            omnivamp: "Omnivampirisme",
            bonusHealing: "Bonus de soin",
            healingPower: "Puissance de soin",
            healthRegeneration: "Régénération de santé",
            manaRegeneration: "Régénération de mana",
            staminaRegeneration: "Régénération d'endurance",
            flightOfLife: "Vol de vie"
          }
        }
      }
    }
  };
  Object.entries(characterBuildDataTranslations).forEach(([language, additions]) => {
    translations[language] = deepMerge(translations[language] || {}, additions);
  });

  Object.assign(translations.en.page.ecompendium, {
    ["categories" + "Aria"]: "Compendium categories"
  });
  Object.assign(translations.es.page.ecompendium, {
    ["categories" + "Aria"]: "Categorías del compendio"
  });
  Object.assign(translations.fr.page.ecompendium, {
    ["categories" + "Aria"]: "Catégories du compendium"
  });
  Object.assign(translations.en.page.miscinfo, {
    classesHeading: "Classes",
    classesDescription: "Available class references from Character Build.",
    equipmentSlotsHeading: "Equipment Slots",
    equipmentSlotsDescription: "Slots exposed by the build planner.",
    currentLevel: "Current Level",
    nextLevel: "Next Level",
    xpToNextLevel: "XP to Next Level",
    eyebrow: "AINCRAD / MISC. INFO",
    subtitle: "Useful reference information about Aincrad, progression, systems, and the website.",
    referenceHub: "Reference hub",
    noCurrentData: "No Current Data has been added for this section yet.",
    progression: "Progression",
    playerProgression: "Player Progression",
    xpThresholds: "XP thresholds",
    characterSystems: "Character systems",
    aincradSystems: "Aincrad systems",
    gameSystems: "Game Systems",
    worldReference: "World reference",
    worldAincradReference: "World / Aincrad Reference",
    mapLayers: "Map Layers",
    mapLayersText:
      "The map module provides Floor 1 - The Town of Beginnings, Floor 2 - Arid Desert, and Floor 3 - The Forest of Wandering, with surface and underground map images.",
    coordinatesHeading: "Coordinates",
    coordinatesText:
      "Map markers expose X and Z coordinates, and the map runtime provides coordinate conversion for each floor.",
    markerSystems: "Marker Systems",
    markerSystemsText:
      "Existing map categories include biomes, dungeons, bosses, quests, merchants, crafting stations, and mob areas.",
    projectReference: "Project reference",
    projectInformation: "Website / Project Information",
    projectHeading: "Project",
    projectText: "Static fan-made SAO MC reference website hosted on GitHub Pages.",
    languagesHeading: "Languages",
    languagesText: "English, Español, Français, and Italiano are available through the shared language system.",
    commandReference: "Command Reference",
    commandReferenceText: "Search the existing command catalog by category, command, usage, or example.",
    loadingCommands: "Loading commands...",
    questsCardText: "Search quests by NPC, location, requirements, rewards, and completion state.",
    equipmentCardText: "Browse equipment categories, levels, rarity, descriptions, statistics, and crafting resources.",
    bestiaryCardText: "Review bosses, dungeon mobs, regular mobs, aggressiveness, XP, and drops.",
    mapsCardText: "Explore floor maps with searchable markers, categories, coordinates, and underground layers."
  });
  Object.assign(translations.es.page.miscinfo, {
    classesHeading: "Clases",
    classesDescription: "Referencias de clase disponibles en Character Build.",
    equipmentSlotsHeading: "Espacios de equipo",
    equipmentSlotsDescription: "Espacios disponibles en el planificador de builds.",
    currentLevel: "Nivel actual",
    nextLevel: "Siguiente nivel",
    xpToNextLevel: "XP para el siguiente nivel",
    eyebrow: "AINCRAD / INFO. VARIA",
    subtitle: "Información útil sobre Aincrad, la progresión, los sistemas y el sitio web.",
    referenceHub: "Centro de referencia",
    noCurrentData: "Todavía no se han añadido datos actuales para esta sección.",
    progression: "Progresión",
    playerProgression: "Progresión del jugador",
    xpThresholds: "Umbrales de XP",
    characterSystems: "Sistemas del personaje",
    aincradSystems: "Sistemas de Aincrad",
    gameSystems: "Sistemas del juego",
    worldReference: "Referencia del mundo",
    worldAincradReference: "Referencia del mundo / Aincrad",
    mapLayers: "Capas del mapa",
    mapLayersText:
      "El módulo de mapas ofrece el piso 1 - El pueblo de los comienzos, el piso 2 - Desierto árido y el piso 3 - El bosque errante, con imágenes de superficie y subterráneas.",
    coordinatesHeading: "Coordenadas",
    coordinatesText:
      "Los marcadores muestran coordenadas X y Z, y el runtime del mapa ofrece conversión de coordenadas para cada piso.",
    markerSystems: "Sistemas de marcadores",
    markerSystemsText:
      "Las categorías existentes incluyen biomas, mazmorras, jefes, misiones, mercaderes, estaciones de fabricación y zonas de mobs.",
    projectReference: "Referencia del proyecto",
    projectInformation: "Información del sitio / proyecto",
    projectHeading: "Proyecto",
    projectText: "Sitio web de referencia de SAO MC, creado por fans y alojado en GitHub Pages.",
    languagesHeading: "Idiomas",
    languagesText: "English, Español, Français e Italiano están disponibles mediante el sistema de idiomas compartido.",
    commandReference: "Referencia de comandos",
    commandReferenceText: "Busca el catálogo de comandos por categoría, comando, uso o ejemplo.",
    loadingCommands: "Cargando comandos...",
    questsCardText: "Busca misiones por PNJ, ubicación, requisitos, recompensas y estado de finalización.",
    equipmentCardText:
      "Explora categorías de equipo, niveles, rareza, descripciones, estadísticas y recursos de fabricación.",
    bestiaryCardText: "Consulta jefes, mobs de mazmorra, mobs normales, agresividad, XP y botines.",
    mapsCardText: "Explora mapas de pisos con marcadores, categorías, coordenadas y capas subterráneas."
  });
  Object.assign(translations.fr.page.miscinfo, {
    classesHeading: "Classes",
    classesDescription: "Références de classes disponibles dans Character Build.",
    equipmentSlotsHeading: "Emplacements d'équipement",
    equipmentSlotsDescription: "Emplacements proposés par le planificateur de builds.",
    currentLevel: "Niveau actuel",
    nextLevel: "Niveau suivant",
    xpToNextLevel: "XP jusqu'au niveau suivant",
    eyebrow: "AINCRAD / INFOS DIVERSES",
    subtitle: "Informations utiles sur Aincrad, la progression, les systèmes et le site web.",
    referenceHub: "Centre de référence",
    noCurrentData: "Aucune donnée actuelle n'a encore été ajoutée pour cette section.",
    progression: "Progression",
    playerProgression: "Progression du joueur",
    xpThresholds: "Seuils d'XP",
    characterSystems: "Systèmes du personnage",
    aincradSystems: "Systèmes d'Aincrad",
    gameSystems: "Systèmes du jeu",
    worldReference: "Référence du monde",
    worldAincradReference: "Référence du monde / Aincrad",
    mapLayers: "Couches de la carte",
    mapLayersText:
      "Le module de carte propose l'étage 1 - La ville du début, l'étage 2 - Désert aride et l'étage 3 - La forêt errante, avec des images de surface et souterraines.",
    coordinatesHeading: "Coordonnées",
    coordinatesText:
      "Les marqueurs indiquent les coordonnées X et Z, et le runtime de la carte fournit une conversion pour chaque étage.",
    markerSystems: "Systèmes de marqueurs",
    markerSystemsText:
      "Les catégories existantes comprennent les biomes, donjons, boss, quêtes, marchands, ateliers de fabrication et zones de mobs.",
    projectReference: "Référence du projet",
    projectInformation: "Informations sur le site / projet",
    projectHeading: "Projet",
    projectText: "Site de référence SAO MC créé par des fans et hébergé sur GitHub Pages.",
    languagesHeading: "Langues",
    languagesText: "English, Español, Français et Italiano sont disponibles via le système de langues partagé.",
    commandReference: "Référence des commandes",
    commandReferenceText: "Recherchez dans le catalogue des commandes par catégorie, commande, usage ou exemple.",
    loadingCommands: "Chargement des commandes...",
    questsCardText: "Recherchez des quêtes par PNJ, lieu, conditions, récompenses et état d'achèvement.",
    equipmentCardText:
      "Parcourez les catégories d'équipement, niveaux, raretés, descriptions, statistiques et ressources de fabrication.",
    bestiaryCardText: "Consultez les boss, mobs de donjon, mobs ordinaires, agressivité, XP et butins.",
    mapsCardText: "Explorez les cartes des étages avec marqueurs, catégories, coordonnées et couches souterraines."
  });

  Object.assign(translations.en.page.miscinfo, {
    skillsHeading: "Skills",
    skillsUnavailable: "Skill information is not available yet."
  });
  Object.assign(translations.es.page.miscinfo, {
    skillsHeading: "Habilidades",
    skillsUnavailable: "La información sobre habilidades aún no está disponible."
  });
  Object.assign(translations.fr.page.miscinfo, {
    skillsHeading: "Compétences",
    skillsUnavailable: "Les informations sur les compétences ne sont pas encore disponibles."
  });

  Object.assign(translations.en.page.patchnotes, {
    loadError: "Patch notes could not be loaded. Refresh the page and try again.",
    loadUnavailable: "Patch notes are currently unavailable."
  });
  Object.assign(translations.es.page.patchnotes, {
    loadError: "No se pudieron cargar las notas de parche. Actualiza la página e inténtalo de nuevo.",
    loadUnavailable: "Las notas de parche no están disponibles en este momento."
  });
  Object.assign(translations.fr.page.patchnotes, {
    loadError: "Les notes de mise à jour n'ont pas pu être chargées. Actualise la page et réessaie.",
    loadUnavailable: "Les notes de mise à jour ne sont actuellement pas disponibles."
  });

  Object.assign(translations.en.page.uwcompendium, {
    categoriesAria: "Compendium categories",
    category: "Category",
    costRequirement: "Cost / requirement",
    description: "Description",
    details: "Details",
    entries: "Compendium entries",
    statistics: "Statistics",
    type: "Type",
    unknown: "Unknown item"
  });
  Object.assign(translations.es.page.uwcompendium, {
    categoriesAria: "Categorías del compendio",
    category: "Categoría",
    costRequirement: "Coste / requisito",
    description: "Descripción",
    details: "Detalles",
    entries: "Entradas del compendio",
    statistics: "Estadísticas",
    type: "Tipo",
    unknown: "Objeto desconocido"
  });
  Object.assign(translations.fr.page.uwcompendium, {
    categoriesAria: "Catégories du compendium",
    category: "Catégorie",
    costRequirement: "Coût / condition",
    description: "Description",
    details: "Détails",
    entries: "Entrées du compendium",
    statistics: "Statistiques",
    type: "Type",
    unknown: "Objet inconnu"
  });

  Object.assign(translations.en.page.mainui, {
    mapDataUnavailable: "Map data unavailable",
    categorySectionHeader: "PLAYER ISLAND"
  });
  Object.assign(translations.es.page.mainui, {
    mapDataUnavailable: "Datos del mapa no disponibles",
    categorySectionHeader: "ISLA DEL JUGADOR"
  });
  Object.assign(translations.fr.page.mainui, {
    mapDataUnavailable: "Données de carte indisponibles",
    categorySectionHeader: "ÎLE DU JOUEUR"
  });
  Object.assign(translations.en.page.towerdefense, {
    sectionEyebrow: "Tower Defense",
    progressionEyebrow: "Progression",
    chapterInformation: "Chapter information"
  });
  Object.assign(translations.es.page.towerdefense, {
    sectionEyebrow: "Defensa de torres",
    progressionEyebrow: "Progresión",
    chapterInformation: "Información del capítulo"
  });
  Object.assign(translations.fr.page.towerdefense, {
    sectionEyebrow: "Tower Defense",
    progressionEyebrow: "Progression",
    chapterInformation: "Informations du chapitre"
  });

  translations.en.page.commands.statusShown = "Showing {count} command{suffix} in {category}.";
  translations.es.page.bestiary.drops = "Botines";
  translations.es.page.commands.statusShown = "Mostrando {count} comando{suffix} en {category}.";
  translations.fr.page.commands.statusShown = "Affichage de {count} commande{suffix} dans {category}.";

  Object.assign(translations.es.page.towerdefense, {
    back: "Volver",
    heading: "Defensa de torres de Fractured Underworld",
    shopTitle: "Tienda de defensa de torres",
    chapterSelect: "Selección de capítulo",
    chapter: "Capítulo {number}",
    levelProgression: "Progresión de niveles",
    currentStats: "Actual"
  });
  Object.assign(translations.fr.page.towerdefense, {
    back: "Retour",
    heading: "Tower Defense de Fractured Underworld",
    shopTitle: "Boutique Tower Defense",
    chapterSelect: "Sélection du chapitre",
    chapter: "Chapitre {number}",
    levelProgression: "Progression des niveaux",
    currentStats: "Actuel"
  });

  /* Tower Defense shop-item labels built by Fractured Underworld/Tower Defense/towerdefense.js.
     Only the human-facing labels live here; unit names, costs, stats and progression values keep
     coming from the page data through the towerDefense.* content namespace. */
  Object.assign(translations.en.page.towerdefense, {
    shopItemUnit: "Unit",
    shopItemInvocation: "Invocation",
    shopItemUnlockRequirement: "Unlock requirement",
    shopItemBaseStats: "Base stats",
    shopItemUpgradeCosts: "Upgrade costs"
  });
  Object.assign(translations.es.page.towerdefense, {
    shopItemUnit: "Unidad",
    shopItemInvocation: "Invocación",
    shopItemUnlockRequirement: "Requisito de desbloqueo",
    shopItemBaseStats: "Estadísticas base",
    shopItemUpgradeCosts: "Coste de mejora"
  });
  Object.assign(translations.fr.page.towerdefense, {
    shopItemUnit: "Unité",
    shopItemInvocation: "Invocation",
    shopItemUnlockRequirement: "Condition de déblocage",
    shopItemBaseStats: "Statistiques de base",
    shopItemUpgradeCosts: "Coût d'amélioration"
  });

  /* Patch-note version labels built by Aincrad/Patchnotes/patchnotes.js. The version token
     (v1.4, v1.2, v0.2.0, ...) is preserved verbatim; only the human-readable part is translated,
     mirroring the already-localized title/subtitle wording of each entry. */
  Object.assign(translations.en.page.patchnotes.entries.v140, { version: "Character Build & Major UI Update - v1.4" });
  Object.assign(translations.en.page.patchnotes.entries.v130, { version: "Language and Compatibility Update - v1.3" });
  Object.assign(translations.en.page.patchnotes.entries.v120, { version: "Very Small Bug Fix - v1.2" });
  Object.assign(translations.en.page.patchnotes.entries.v111, { version: "Final Touches Till Full Release - v1.1" });
  Object.assign(translations.en.page.patchnotes.entries.v100, { version: "Full Release - v1.0" });
  Object.assign(translations.en.page.patchnotes.entries.v010, { version: "v0.1.0 Alpha" });
  Object.assign(translations.en.page.patchnotes.entries.v020, { version: "v0.2.0 Alpha" });
  Object.assign(translations.es.page.patchnotes.entries.v140, {
    version: "Actualización de Character Build y de la interfaz principal - v1.4"
  });
  Object.assign(translations.es.page.patchnotes.entries.v130, {
    version: "Actualización de idioma y compatibilidad - v1.3"
  });
  Object.assign(translations.es.page.patchnotes.entries.v120, { version: "Correción muy pequeña - v1.2" });
  Object.assign(translations.es.page.patchnotes.entries.v111, {
    version: "Toques finales hasta el lanzamiento completo - v1.1"
  });
  Object.assign(translations.es.page.patchnotes.entries.v100, { version: "Versión completa - v1.0" });
  Object.assign(translations.es.page.patchnotes.entries.v010, { version: "v0.1.0 Alfa" });
  Object.assign(translations.es.page.patchnotes.entries.v020, { version: "v0.2.0 Alfa" });
  Object.assign(translations.fr.page.patchnotes.entries.v140, {
    version: "Mise à jour de Character Build et de l'interface majeure - v1.4"
  });
  Object.assign(translations.fr.page.patchnotes.entries.v130, {
    version: "Mise à jour de langue et compatibilité - v1.3"
  });
  Object.assign(translations.fr.page.patchnotes.entries.v120, { version: "Correctif très mineur - v1.2" });
  Object.assign(translations.fr.page.patchnotes.entries.v111, {
    version: "Finitions avant la version complète - v1.1"
  });
  Object.assign(translations.fr.page.patchnotes.entries.v100, { version: "Version complète - v1.0" });
  Object.assign(translations.fr.page.patchnotes.entries.v010, { version: "v0.1.0 Alpha" });
  Object.assign(translations.fr.page.patchnotes.entries.v020, { version: "v0.2.0 Alpha" });

  Object.assign(translations.en.page.patchnotes.entries, {
    v190: {
      version: "Content, Localization & Bug Fix Update - v1.9",
      title: "Content, Localization & Bug Fix Update",
      summary:
        "NPCs & Equipment\n• Added \"Argo the Info Broker\".\n• Added new NPC locations, including Candelia, Nodachi Blacksmith, Local Miner, Wolf Accessories, and Bandit Accessories.\n• Added seven new accessories, including the Weakling Wolf Set and Bandit Set, with their set bonuses.\n• Updated the Oak/Birch Forest farming location.\n\nLocalization\n• Added Italian language support.\n• Expanded Italian translations for equipment, map locations, and other content.\n• Updated and corrected translations across the website.\n\nBug Fixes & Improvements\n• Fixed JourneyMap waypoint duplication when exporting and re-importing custom waypoints.\n• Improved waypoint identity handling to prevent duplicate imports without merging separate waypoints that share the same name and coordinates.\n• Fixed outdated Italian equipment-rendering test expectations.\n• Added regression tests for waypoint imports and equipment translations."
    },
    v180: {
      version: "Character Build Equipment Update - v1.8",
      title: "Character Build Equipment Update",
      summary:
        "Character Build\n• Added a large collection of new weapons and armor for all five classes.\n• Expanded the available equipment in Character Build and the Equipment Compendium.\n• Updated the formatting and icons used for item stats, buffs, and bonuses.\n• Improved the presentation of equipment effects and stat bonuses to make them easier to read."
    },
    v170: {
      version: "Character Build Skill Tree Update - v1.7",
      title: "Character Build Skill Tree Update",
      summary:
        "Character Build\n• Rebuilt the skill tree from 9 to 77 skills, with updated prerequisites and branching paths.\n• Added level-based skill points, an Unlimited Skill Points toggle, and improved skill unlocking.\n• Added skill-tree dragging, zooming, and mobile layout fixes.\n• Fixed character base stats and skill stat calculations.\n\nMaps & Waypoints\n• Increased map zoom from 30x to 45x and improved map clarity when zoomed in.\n• Improved coordinate accuracy.\n• Updated JourneyMap waypoint exports to include Mob Areas.\n\nData & UI\n• Expanded and updated Current Data across Equipment, Bestiary, and map waypoints.\n• Updated the data-version selection UI and changed the Beta-Test Data badge to LEGACY.\n• Added a Moonlit Black Cats Discord link to the hub menu.\n\nLocalization & Bug Fixes\n• Fixed Spanish and French map description translations.\n• Updated translations for new equipment and renamed mobs.\n• Fixed Character Build skill prerequisites and mobile clipping."
    },
    v160: {
      version: "Map Tools & Waypoint Update - v1.6",
      title: "Map Tools & Waypoint Update",
      summary:
        "• Added Custom Waypoints, letting users create custom categories and waypoints, choose category colors, and manage points directly from the map. More custom points may increase site lag.\n• Added JourneyMap waypoint import and export, organized into categories by waypoint type/category, plus a Map Actions tutorial button that opens the YouTube tutorial directly.\n• Added a Distance Calculator to the map right-click menu. Set Point 1 and Point 2 to calculate distance from converted Minecraft world X/Z coordinates; results stay correct through zooming, panning, and resizing.\n• Added external tutorial links to dungeon information popups, including a test Fallen Labyrinth Dungeon tutorial, without changing existing dungeon coordinates or floor data.\n• Added Step 5 to the Aincrad and Fractured Underworld walkthroughs, temporarily opening the actual Map Actions menu centered and highlighted; it closes and returns to normal behavior when leaving the step.\n• Added a divider before the Map Actions tutorial button and let the menu grow naturally so the button stays within its bounds.\n• Removed the stray tilde-like character from the World Hub welcome screen."
    },
    v150: {
      version: "Maps, Character Build & Site Improvements - v1.5",
      title: "Maps, Character Build & Site Improvements",
      summary:
        "• Corrected map coordinate placement and waypoint positioning.\n• Improved Character Build calculations, equipment and stat displays, build selection, and reset controls.\n• Expanded French and Spanish translations and corrected mixed-language text.\n• Updated guided walkthroughs, including Character Build's level controls, and improved the Welcome Mat warning with a Skip option after repeated visits and a responsive layout.\n• Refined page layouts and fixed other visual issues."
    }
  });
  Object.assign(translations.es.page.patchnotes.entries, {
    v190: {
      version: "Actualización de contenido, localización y correcciones - v1.9",
      title: "Actualización de contenido, localización y correcciones",
      summary:
        "PNJ y equipamiento\n• Se añadió \"Argo, la corredora de información\".\n• Se añadieron nuevas ubicaciones de PNJ, incluidas Candelia, Herrero de Nodachi, Local Minero, Accesorios de lobo y Accesorios de bandidos.\n• Se añadieron siete accesorios nuevos, incluidos el Conjunto del lobo débil y el Conjunto del bandido, con sus bonificaciones de conjunto.\n• Se actualizó la ubicación de recolección del Bosque de Robles/Abedules.\n\nLocalización\n• Se añadió compatibilidad con el idioma italiano.\n• Se ampliaron las traducciones al italiano para el equipamiento, las ubicaciones del mapa y otro contenido.\n• Se actualizaron y corrigieron traducciones en todo el sitio.\n\nCorrecciones y mejoras\n• Se corrigió la duplicación de puntos de ruta de JourneyMap al exportar y volver a importar puntos de ruta personalizados.\n• Se mejoró la gestión de la identidad de los puntos de ruta para evitar importaciones duplicadas sin fusionar puntos distintos que comparten el mismo nombre y las mismas coordenadas.\n• Se corrigieron expectativas obsoletas de las pruebas de renderizado del equipamiento en italiano.\n• Se añadieron pruebas de regresión para la importación de puntos de ruta y las traducciones del equipamiento."
    },
    v180: {
      version: "Actualización del equipamiento del personaje - v1.8",
      title: "Actualización del equipamiento del personaje",
      summary:
        "Configuración del personaje\n• Se añadieron numerosas armas y piezas de armadura nuevas para las cinco clases.\n• Se amplió el equipamiento disponible en la configuración del personaje y en el Compendio de equipo.\n• Se actualizaron el formato y los iconos de las estadísticas, mejoras y bonificaciones de los objetos.\n• Se mejoró la presentación de los efectos y las bonificaciones del equipamiento para facilitar su lectura."
    },
    v170: {
      version: "Actualización del árbol de habilidades de Character Build - v1.7",
      title: "Actualización del árbol de habilidades de Character Build",
      summary:
        "Character Build\n• Se reconstruyó el árbol de habilidades de 9 a 77 habilidades, con prerrequisitos y rutas ramificadas actualizados.\n• Se añadieron puntos de habilidad según el nivel, un interruptor de Puntos de habilidad ilimitados y un mejor desbloqueo de habilidades.\n• Se añadieron el arrastre y el zoom del árbol de habilidades, y correcciones de diseño para móvil.\n• Se corrigieron las estadísticas base de los personajes y el cálculo de estadísticas de las habilidades.\n\nMapas y puntos de ruta\n• El zoom del mapa subió de 30x a 45x y mejoró la claridad del mapa al acercarlo.\n• Se mejoró la precisión de las coordenadas.\n• Se actualizaron las exportaciones de puntos de JourneyMap para incluir las zonas de mobs.\n\nDatos e interfaz\n• Se ampliaron y actualizaron los datos actuales en equipo, bestiario y puntos de ruta del mapa.\n• Se actualizó la interfaz de selección de versión de datos y la etiqueta de Beta-Test Data ahora dice LEGACY.\n• Se añadió un enlace al Discord de Moonlit Black Cats en el menú del centro.\n\nLocalización y correcciones\n• Se corrigieron las traducciones de las descripciones de mapas en español y francés.\n• Se actualizaron las traducciones del equipo nuevo y de los mobs renombrados.\n• Se corrigieron los prerrequisitos de habilidades de Character Build y el recorte en móvil."
    },
    v160: {
      version: "Actualización de herramientas del mapa y puntos de ruta - v1.6",
      title: "Actualización de herramientas del mapa y puntos de ruta",
      summary:
        "• Se añadieron los puntos de ruta personalizados, que permiten crear categorías y puntos propios, elegir colores para las categorías y administrar los puntos directamente desde el mapa. Tener más puntos personalizados puede aumentar la lentitud del sitio.\n• Se añadió la importación y exportación de puntos de JourneyMap, organizados en categorías según el tipo o la categoría del punto, junto con un botón de tutorial en Acciones del mapa que abre directamente el tutorial de YouTube.\n• Se añadió una calculadora de distancia al menú del mapa con clic derecho. Define el Punto 1 y el Punto 2 para calcular la distancia usando las coordenadas X/Z convertidas del mundo de Minecraft; el resultado sigue siendo correcto al acercar, alejar, desplazar o cambiar el tamaño del mapa.\n• Se añadieron enlaces externos a tutoriales en las ventanas de información de las mazmorras, incluido un enlace de prueba para la mazmorras Fallen Labyrinth, sin modificar sus coordenadas ni los datos de pisos existentes.\n• Se añadió el Paso 5 a los recorridos guiados de Aincrad y Underworld Fragmentado. Abre temporalmente el menú real de Acciones del mapa, centrado y resaltado; al salir del paso, se cierra y vuelve al comportamiento normal.\n• Se añadió un separador antes del botón del tutorial de Acciones del mapa y el menú ahora crece para mantener el botón dentro de sus límites.\n• Se eliminó el carácter similar a una tilde que sobraba en la pantalla de bienvenida de World Hub."
    },
    v150: {
      version: "Mejoras en mapas, Character Build y el sitio - v1.5",
      title: "Mejoras en mapas, Character Build y el sitio",
      summary:
        "• Se corrigieron la ubicación de coordenadas y el posicionamiento de los puntos de ruta del mapa.\n• Se mejoraron los cálculos de Character Build, la visualización del equipo y las estadísticas, la selección de configuraciones y los controles de reinicio.\n• Se ampliaron las traducciones al francés y al español y se corrigieron textos que mezclaban idiomas.\n• Se actualizaron los recorridos guiados, incluida la sección de controles de nivel de Character Build, y se mejoró el aviso de bienvenida con la opción Omitir tras varias visitas y un diseño adaptable.\n• Se ajustaron los diseños de las páginas y se corrigieron otros problemas visuales."
    }
  });
  Object.assign(translations.fr.page.patchnotes.entries, {
    v190: {
      version: "Mise à jour du contenu, de la localisation et des corrections - v1.9",
      title: "Mise à jour du contenu, de la localisation et des corrections",
      summary:
        "PNJ et équipement\n• Ajout d'Argo, l'informatrice.\n• Ajout de nouveaux emplacements de PNJ, dont Candelia, Forgeron de Nodachi, Local Mineur, Accessoires de loup et Accessoires de bandits.\n• Ajout de sept nouveaux accessoires, dont l'Ensemble du loup chétif et l'Ensemble du bandit, avec leurs bonus d'ensemble.\n• Mise à jour de l'emplacement de récolte de la Forêt de chênes/bouleaux.\n\nLocalisation\n• Ajout de la prise en charge de la langue italienne.\n• Extension des traductions italiennes pour l'équipement, les lieux de la carte et d'autres contenus.\n• Mise à jour et correction de traductions dans tout le site.\n\nCorrections et améliorations\n• Correction de la duplication des points JourneyMap lors de l'exportation et de la réimportation de points de passage personnalisés.\n• Amélioration de la gestion de l'identité des points de passage pour éviter les imports en double sans fusionner des points distincts qui partagent le même nom et les mêmes coordonnées.\n• Correction d'attentes obsolètes des tests de rendu de l'équipement en italien.\n• Ajout de tests de régression pour l'importation des points de passage et les traductions de l'équipement."
    },
    v180: {
      version: "Mise à jour de l'équipement du personnage - v1.8",
      title: "Mise à jour de l'équipement du personnage",
      summary:
        "Configuration du personnage\n• Ajout de nombreuses nouvelles armes et pièces d'armure pour les cinq classes.\n• Extension de l'équipement disponible dans la configuration du personnage et le Compendium d'équipement.\n• Mise à jour du formatage et des icônes des statistiques, bonus et effets des objets.\n• Amélioration de la présentation des effets et des bonus d'équipement pour faciliter leur lecture."
    },
    v170: {
      version: "Mise à jour de l'arbre de compétences de Character Build - v1.7",
      title: "Mise à jour de l'arbre de compétences de Character Build",
      summary:
        "Character Build\n• Arbre de compétences reconstruit, passant de 9 à 77 compétences, avec des prérequis et des itinéraires ramifiés actualisés.\n• Ajout des points de compétence selon le niveau, d'un interrupteur Points de compétence illimités et d'un déblocage des compétences amélioré.\n• Ajout du déplacement et du zoom de l'arbre de compétences, et corrections de mise en page sur mobile.\n• Correction des statistiques de base des personnages et du calcul des statistiques des compétences.\n\nCartes et points de passage\n• Le zoom de la carte passe de 30x à 45x et la carte est plus nette en zoom rapproché.\n• Précision des coordonnées améliorée.\n• Les exportations de points JourneyMap incluent désormais les zones de mobs.\n\nDonnées et interface\n• Les données actuelles ont été élargies et mises à jour : équipement, bestiaire et points de passage de la carte.\n• L'interface de sélection de la version des données a été mise à jour et le badge de Beta-Test Data affiche maintenant LEGACY.\n• Ajout d'un lien vers le Discord de Moonlit Black Cats dans le menu du hub.\n\nLocalisation et corrections\n• Correction des traductions des descriptions de cartes en espagnol et en français.\n• Mise à jour des traductions pour le nouvel équipement et les mobs renommés.\n• Correction des prérequis de compétences de Character Build et du rognage sur mobile."
    },
    v160: {
      version: "Mise à jour des outils de carte et des points de passage - v1.6",
      title: "Mise à jour des outils de carte et des points de passage",
      summary:
        "• Ajout des points de passage personnalisés : création de catégories et de points, choix de couleurs pour les catégories et gestion des points directement depuis la carte. Un grand nombre de points personnalisés peut ralentir le site.\n• Ajout de l'importation et de l'exportation des points JourneyMap, classés par type ou catégorie, ainsi que d'un bouton de tutoriel dans Actions de la carte qui ouvre directement le tutoriel YouTube.\n• Ajout d'une calculatrice de distance au menu contextuel de la carte. Définis le Point 1 et le Point 2 pour calculer la distance à partir des coordonnées X/Z converties du monde Minecraft ; le résultat reste correct après zoom, déplacement ou redimensionnement de la carte.\n• Ajout de liens externes vers des tutoriels dans les fenêtres d'information des donjons, dont un lien de test pour le donjon Fallen Labyrinth, sans modifier les coordonnées ni les données d'étage existantes.\n• Ajout de l'étape 5 aux visites guidées d'Aincrad et de l'Underworld Fracturé. Elle ouvre temporairement le véritable menu Actions de la carte, centré et mis en évidence ; il se ferme et reprend son comportement normal en quittant l'étape.\n• Ajout d'un séparateur avant le bouton de tutoriel des Actions de la carte ; le menu s'agrandit naturellement pour garder le bouton dans ses limites.\n• Suppression du caractère ressemblant à un tilde qui apparaissait sur l'écran d'accueil de World Hub."
    },
    v150: {
      version: "Améliorations des cartes, de Character Build et du site - v1.5",
      title: "Améliorations des cartes, de Character Build et du site",
      summary:
        "• Correction du placement des coordonnées et des points de passage sur les cartes.\n• Amélioration des calculs de Character Build, de l'affichage de l'équipement et des statistiques, de la sélection des configurations et des commandes de réinitialisation.\n• Extension des traductions françaises et espagnoles et correction de textes mêlant plusieurs langues.\n• Mise à jour des visites guidées, notamment de la section sur les commandes de niveau de Character Build. Amélioration de l'avertissement de bienvenue avec l'option Ignorer après plusieurs affichages et une mise en page adaptée aux petits écrans.\n• Ajustement de la mise en page des pages et correction d'autres problèmes visuels."
    }
  });

  /* Mandatory Welcome Mat warning, rendered by shared/sao-welcome-warning.js. It is shown
     on every visit and is never stored, so only the strings live here. The countdown key
     keeps the same {seconds} token in every language. */
  translations.en = deepMerge(translations.en, {
    ui: {
      warning: {
        kicker: "Important notice",
        title: "This website is in an awkward phase right now.",
        body: "Since the Beta Test started, I've learned that a lot of information has changed and still needs to be updated. There's also no guarantee that everything will stay the same for full release.\n\nPlease don't take most of the information on this site as 100% accurate right now. The information I would trust the most is the Map, the Main Quest waypoints, and which mobs drop certain loot. The drop chances are wrong.\n\nI'm a one-man team, so I'm trying my best to progress through the game, enjoy the game, and also update the website at the same time. Please pardon any incorrect or outdated information while I work on getting everything updated!",
        languageLabel: "Language",
        okay: "Okay",
        okayCountdown: "Okay ({seconds})",
        skip: "Skip",
        explainer:
          "Once you see this screen 3 times, the “Okay” button will be replaced with a “Skip” button. Don’t worry, you won’t always have to wait 15 seconds."
      }
    }
  });

  translations.es = deepMerge(translations.es, {
    ui: {
      warning: {
        kicker: "Aviso importante",
        title: "Este sitio web está en una fase rara ahora mismo.",
        body: "Desde que empezó la Beta, me he dado cuenta de que mucha información ha cambiado y todavía necesita actualizarse. Tampoco hay garantía de que todo siga igual para el lanzamiento completo.\n\nPor favor, no tomes ahora mismo la mayor parte de la información de este sitio como 100% precisa. La información en la que más confiaría es el Mapa, los puntos de las misiones principales y qué mobs sueltan cierto botín. Las probabilidades de drop están mal.\n\nSoy un equipo de una sola persona, así que estoy intentando avanzar en el juego, disfrutarlo y actualizar la web al mismo tiempo. ¡Perdona cualquier información incorrecta o desactualizada mientras termino de ponerlo todo al día!",
        languageLabel: "Idioma",
        okay: "Entendido",
        okayCountdown: "Entendido ({seconds})",
        skip: "Omitir",
        explainer:
          "Cuando veas esta pantalla 3 veces, el botón «Entendido» se sustituirá por un botón «Omitir». No te preocupes, no siempre tendrás que esperar 15 segundos."
      }
    }
  });

  translations.fr = deepMerge(translations.fr, {
    ui: {
      warning: {
        kicker: "Avis important",
        title: "Ce site est dans une phase un peu bancale en ce moment.",
        body: "Depuis le début de la Beta, j'ai appris que beaucoup d'informations ont changé et doivent encore être mises à jour. Il n'y a pas non plus de garantie que tout restera pareil pour la sortie complète.\n\nMerci de ne pas prendre la plupart des informations de ce site comme exactes à 100% pour le moment. Les informations auxquelles je me fierais le plus sont la Carte, les points des quêtes principales et quels mobs font tomber quel butin. Les chances de drop sont fausses.\n\nJe suis une équipe d'une seule personne, donc j'essaie de progresser dans le jeu, d'en profiter et aussi de mettre le site à jour en même temps. Merci de pardonner les informations incorrectes ou obsolètes pendant que je mets tout à jour !",
        languageLabel: "Langue",
        okay: "D'accord",
        okayCountdown: "D'accord ({seconds})",
        skip: "Ignorer",
        explainer:
          "Une fois que vous aurez vu cet écran 3 fois, le bouton « D'accord » sera remplacé par un bouton « Ignorer ». Ne vous inquiétez pas, vous n'aurez pas toujours à attendre 15 secondes."
      }
    }
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
  const missingContentKeys = new Set();

  function saveSettings(nextSettings) {
    settingsState = Object.assign({}, settingsState, nextSettings || {});
    if (!SUPPORTED_LANGUAGES.includes(settingsState.language)) {
      settingsState.language = DEFAULT_LANGUAGE;
    }
    storage.setJSON(SETTINGS_STORAGE_KEY, settingsState);
    subscribers.forEach((listener) => {
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

  /* Endonym label for a language code (English / Español / Français), read from the very
     same top-level languageName key the settings menu renders. */
  function getLanguageLabel(language) {
    return getLanguageText(language, "languageName") || String(language || "").toUpperCase();
  }

  /* Reads one top-level language string (languageName, languageHint, ...) from a specific language's
     bundle instead of the active one, so a picker can label an option in the language it offers.
     The English bundle is the last resort, exactly like the active-language lookup in t(). */
  function getLanguageText(language, key) {
    const value = lookup(getBundle(language), key);
    if (typeof value === "string" && value.trim() !== "") return value;
    const englishValue = lookup(getBundle(DEFAULT_LANGUAGE), key);
    return typeof englishValue === "string" && englishValue.trim() !== "" ? englishValue : "";
  }

  /* The supported languages in the site's user-facing order. Callers that need the list for a picker
     read this instead of keeping their own copy. */
  function getSupportedLanguages() {
    return SUPPORTED_LANGUAGE_CHOICES.slice();
  }

  function getBundle(language) {
    return translations[language] || translations[DEFAULT_LANGUAGE];
  }

  function lookup(bundle, key) {
    const normalizedKey = String(key || "");
    const keyPath = normalizedKey.split(".");
    let value = keyPath.reduce(
      (result, part) => (result && Object.prototype.hasOwnProperty.call(result, part) ? result[part] : undefined),
      bundle
    );

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

    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
      return formatTemplate(String(value), params || null);
    }

    if (value && typeof value === "object") {
      console.warn(`Translation key resolved to an object instead of a string: ${key}`);
      return key;
    }

    return key;
  }

  function content(key, fallbackValue, params) {
    const dictionaries = global.SAOContentTranslations || {};
    const activeLanguage = getLanguage();
    const activeDictionary = dictionaries[activeLanguage] || {};
    const fallbackDictionary = dictionaries[DEFAULT_LANGUAGE] || {};
    const activeValue = Object.prototype.hasOwnProperty.call(activeDictionary, key) ? activeDictionary[key] : undefined;
    const dictionaryFallback = Object.prototype.hasOwnProperty.call(fallbackDictionary, key)
      ? fallbackDictionary[key]
      : undefined;
    let value = activeValue !== undefined ? activeValue : dictionaryFallback;

    if (value === undefined) {
      missingContentKeys.add(String(key));
      value = fallbackValue === undefined ? key : fallbackValue;
    }

    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
      return formatTemplate(String(value), params || null);
    }

    return fallbackValue === undefined ? key : fallbackValue;
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

    scope.querySelectorAll("[data-i18n]").forEach((node) => {
      const key = node.getAttribute("data-i18n");
      if (!key) return;
      node.textContent = t(key);
    });

    scope.querySelectorAll("[data-i18n-placeholder]").forEach((node) => {
      const key = node.getAttribute("data-i18n-placeholder");
      if (!key) return;
      node.setAttribute("placeholder", t(key));
    });

    scope.querySelectorAll("[data-i18n-title]").forEach((node) => {
      const key = node.getAttribute("data-i18n-title");
      if (!key) return;
      node.setAttribute("title", t(key));
    });

    scope.querySelectorAll("[data-i18n-alt]").forEach((node) => {
      const key = node.getAttribute("data-i18n-alt");
      if (!key) return;
      node.setAttribute("alt", t(key));
    });

    scope.querySelectorAll("[data-i18n-aria-label]").forEach((node) => {
      const key = node.getAttribute("data-i18n-aria-label");
      if (!key) return;
      node.setAttribute("aria-label", t(key));
    });

    scope.querySelectorAll("[data-i18n-content]").forEach((node) => {
      const key = node.getAttribute("data-i18n-content");
      if (!key) return;
      node.setAttribute("content", t(key));
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
    document.dispatchEvent(
      new CustomEvent("sao:languagechange", {
        detail: { language: settingsState.language }
      })
    );
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
        width: 52.5px;
        height: 52.5px;
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
        width: 26.25px;
        height: 26.25px;
        display: block;
      }
      .sao-page-notice {
        position: fixed;
        top: calc(8px + env(safe-area-inset-top));
        right: calc(8px + env(safe-area-inset-right));
        left: auto;
        z-index: 85;
        width: min(198px, calc(100vw - 150px));
        max-width: min(198px, calc(100vw - 150px));
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
      /* The warning-reset control is a testing convenience, so it reuses the same action button in a
         muted, dashed variant instead of introducing a new component style. */
      .sao-settings-action-button.sao-settings-testing-action {
        margin-top: 12px;
        border-style: dashed;
        border-color: rgba(255, 176, 122, 0.42);
        background: rgba(26, 19, 12, 0.72);
        color: #f6e3cf;
      }
      .sao-settings-action-button.sao-settings-testing-action:hover {
        border-color: rgba(255, 176, 122, 0.78);
        background: rgba(40, 28, 18, 0.86);
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
    WALKTHROUGH_PROGRESS_KEYS.forEach((key) => {
      try {
        if (global.SAOStorage && typeof global.SAOStorage.removeItem === "function") {
          global.SAOStorage.removeItem(key);
          return;
        }
        if (global.localStorage) {
          global.localStorage.removeItem(key);
        }
      } catch {
        // Ignore storage failures.
      }
    });
  }

  function resetWarningEncounter() {
    /* Testing helper mounted in the Settings menu: clears ONLY the warning encounter counter so the
       next warning behaves like a first visit. Walkthrough progress, settings, language and every
       other stored value are deliberately left untouched. */
    try {
      if (global.SAOStorage && typeof global.SAOStorage.removeItem === "function") {
        global.SAOStorage.removeItem(WARNING_ENCOUNTER_KEY);
        return true;
      }
      if (global.localStorage) {
        global.localStorage.removeItem(WARNING_ENCOUNTER_KEY);
        return true;
      }
    } catch {
      // Ignore storage failures.
    }
    return false;
  }

  function createGearIcon() {
    return `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.09a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2Z"/>
        <circle cx="12" cy="12" r="3"/>
      </svg>
    `;
  }

  function mountSettingsMenu(options) {
    if (document.getElementById("sao-settings-anchor")) return;

    const config = Object.assign(
      {
        container: document.body,
        position: "fixed-top-left"
      },
      options || {}
    );

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

    /* Directly beneath the walkthrough reset control: a testing-only reset for the Welcome Mat
       warning, so the first-visit experience can be reproduced repeatedly. */
    const warningResetButton = document.createElement("button");
    warningResetButton.type = "button";
    warningResetButton.className = "sao-settings-action-button sao-settings-testing-action";
    warningResetButton.textContent = t("ui.settings.warningReset");

    const warningResetHint = document.createElement("p");
    warningResetHint.className = "sao-settings-hint";
    warningResetHint.textContent = t("ui.settings.warningResetHint");

    section.append(label, optionGrid, hint);
    actionsSection.append(
      walkthroughLabel,
      restartWalkthroughButton,
      walkthroughHint,
      warningResetButton,
      warningResetHint
    );
    menu.append(header, subtitle, section, actionsSection);
    anchor.append(trigger, menu);
    config.container.appendChild(anchor);

    function renderLanguageOptions() {
      /* A language switch re-renders this row while the clicked option is still on the event
         path, so the focused option is remembered and re-focused below: otherwise the click
         that changed the language would drop keyboard focus onto <body>. */
      const focusedLanguage = optionGrid.contains(document.activeElement)
        ? document.activeElement.dataset.language || ""
        : "";
      optionGrid.replaceChildren();
      SUPPORTED_LANGUAGES.forEach((languageCode) => {
        const languageButton = document.createElement("button");
        languageButton.type = "button";
        languageButton.className = "sao-language-option";
        languageButton.dataset.language = languageCode;
        languageButton.setAttribute("aria-pressed", String(getLanguage() === languageCode));
        languageButton.textContent = t("languageName", null);
        languageButton.textContent = lookup(getBundle(languageCode), "languageName") || languageCode.toUpperCase();
        optionGrid.appendChild(languageButton);
      });
      if (focusedLanguage) {
        optionGrid.querySelector(`[data-language="${focusedLanguage}"]`)?.focus();
      }
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
      warningResetButton.textContent = t("ui.settings.warningReset");
      warningResetHint.textContent = t("ui.settings.warningResetHint");
      renderLanguageOptions();
    }

    function openMenu() {
      menu.classList.add("open");
      menu.setAttribute("aria-hidden", "false");
      trigger.setAttribute("aria-expanded", "true");
      const selected =
        optionGrid.querySelector(`[data-language="${getLanguage()}"]`) || optionGrid.querySelector("button");
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

    optionGrid.addEventListener("click", (event) => {
      const option = event.target.closest("button[data-language]");
      if (!option) return;
      const languageCode = option.dataset.language;
      if (!languageCode) return;
      setLanguage(languageCode);
      syncMenuTranslations();
    });

    restartWalkthroughButton.addEventListener("click", () => {
      resetWalkthroughProgress();
      document.dispatchEvent(
        new CustomEvent("sao:walkthroughrestart", {
          detail: { source: "settings" }
        })
      );
      closeMenu();
      trigger.focus();
    });

    warningResetButton.addEventListener("click", () => {
      /* Clears only the warning encounter counter, then tells the page so it can confirm with its
         own toast. Walkthrough progress and every other stored value are left untouched. */
      resetWarningEncounter();
      document.dispatchEvent(
        new CustomEvent("sao:warningreset", {
          detail: { key: WARNING_ENCOUNTER_KEY, source: "settings" }
        })
      );
      closeMenu();
      trigger.focus();
    });

    document.addEventListener("click", (event) => {
      if (!menu.classList.contains("open")) return;
      /* A language switch re-renders the option grid, which detaches the clicked button before
         this document-level listener runs, so anchor.contains(event.target) would report an
         outside click and close the menu the reader just used. composedPath() is captured when
         the event is dispatched, so it still reports the anchor for a genuine inside click. */
      const path = typeof event.composedPath === "function" ? event.composedPath() : null;
      const insideAnchor = path ? path.includes(anchor) : anchor.contains(event.target);
      if (!insideAnchor) {
        closeMenu();
      }
    });

    document.addEventListener("keydown", (event) => {
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

  /* ------------------------------------------------------------------------------------------------
     Italian UI dictionary.

     Written as one contiguous block rather than threaded through every per-language deepMerge above:
     Italian is a new language, so there is nothing to merge into, and a single section is easier to
     review and extend than twenty scattered ones. The key set is exactly the English key set - the
     audit compares the two and reports any key Italian is missing.

     Game-content names, identifiers and canonical terms stay as the data spells them: the content
     glossaries still hold Spanish and French slots only, so Italian game content falls back to the
     English source text by design (see shared/sao-content-translations.js).
     ------------------------------------------------------------------------------------------------ */
  translations.it = deepMerge({}, {
    languageName: "Italiano",
    languageHint: "Cambia la lingua qui!",
    ui: {
      settings: {
        buttonLabel: "Apri le impostazioni",
        title: "Impostazioni",
        subtitle: "Personalizza le preferenze globali del sito.",
        languageLabel: "Lingua",
        languageHint: "Si applica a tutte le pagine.",
        languageHintAria: "Suggerimento sulle impostazioni della lingua",
        closeLabel: "Chiudi le impostazioni",
        walkthroughLabel: "Tour guidato",
        walkthroughHint: "Rivedi il tour guidato della pagina corrente.",
        restartWalkthrough: "Riavvia il tour guidato",
        warningReset: "Reimposta l'avviso",
        warningResetHint:
          "Solo per test. Reimposta la schermata di avviso per provare di nuovo l'esperienza del primo accesso. Serve davvero solo agli sviluppatori del sito.",
        warningResetToast: "Sistema di avvisi reimpostato."
      },
      nav: {
        maps: "Mappa",
        bestiary: "Bestiario",
        equipment: "Equipaggiamento",
        quests: "Missioni",
        patchnotes: "Aggiornamenti",
        miscinfo: "Info. Varie",
        menu: "Torna al menu",
        sectionAria: "Navigazione della sezione",
        primaryAria: "Navigazione principale",
        islandAria: "Navigazione delle isole"
      },
      common: {
        loading: "Caricamento...",
        /* Italian marks the plural on the noun rather than with an -s, so the shared count messages
           that append this suffix place the count at the end of the phrase and append a zero-width
           space here: the message still reads correctly ("Comandi in Comunicazione: 5.") and the slot
           stays filled, because an empty value would read as an untranslated entry to the audit. */
        pluralSuffix: "\u200B"
      },
      walkthrough: {
        skip: "Salta",
        back: "Indietro",
        next: "Avanti",
        finish: "Fine",
        step: "Passo {current} di {total}",
        welcomeTitle: "Benvenuto",
        welcomeBody: "Usa questa pagina per scegliere quale mondo o modulo di SAO MC vuoi aprire.",
        modeCardsTitle: "Schede delle modalità",
        modeCardsBody:
          "Scegli Aincrad o Fractured Underworld per avviare un modulo. La scheda GGO è bloccata fino all'uscita.",
        discordTitle: "Link",
        discordBody:
          "Apri i link rapidi al sito di supporto di SAO MC, al Discord di SAO MC e al mio profilo Discord.",
        settingsTitle: "Impostazioni",
        settingsBody:
          "Usa l'ingranaggio per cambiare lingua e rivedere questo tour guidato quando vuoi.",
        characterBuildTitle: "Build del personaggio",
        characterBuildBody:
          "Apri Build del personaggio per creare e personalizzare il tuo personaggio, l'equipaggiamento, le rune, le abilità e le altre impostazioni della build."
      },
      pageNotice:
        "Alcune traduzioni possono essere incomplete, errate o contenere errori di grammatica. Gran parte di questo sito non è ancora tradotta. Il progetto è mantenuto da una sola persona, quindi tradurre ogni pagina richiede molto tempo.",
      warning: {
        kicker: "Avviso importante",
        title: "Questo sito è in una fase delicata al momento.",
        body: "Da quando è iniziata la Beta Test ho scoperto che molte informazioni sono cambiate e devono ancora essere aggiornate. Non c'è nemmeno la garanzia che tutto resti uguale per l'uscita completa.\n\nPer ora non prendere la maggior parte delle informazioni di questo sito come accurate al 100%. Le informazioni di cui mi fiderei di più sono la Mappa, i waypoint della missione principale e quali mostri lasciano determinati bottini. Le probabilità di drop sono sbagliate.\n\nSono un team di una sola persona, quindi faccio del mio meglio per progredire nel gioco, divertirmi e aggiornare il sito allo stesso tempo. Perdonami per eventuali informazioni errate o obsolete mentre lavoro per aggiornare tutto!",
        languageLabel: "Lingua",
        okay: "Ok",
        okayCountdown: "Ok ({seconds})",
        skip: "Salta",
        explainer:
          "Dopo aver visto questa schermata 3 volte, il pulsante “Ok” sarà sostituito da “Salta”. Non preoccuparti, non dovrai aspettare sempre 15 secondi."
      }
    },
    dataset: {
      betaLabel: "Dati di test beta",
      currentLabel: "Dati attuali",
      betaDescription:
        "Informazioni sperimentali dalle prove beta. Alcuni dettagli possono essere incompleti o imprecisi.",
      currentDescription:
        "Il set di dati mantenuto attivamente. Se manca qualcosa, controlla i Dati di test beta finché l'informazione non sarà disponibile qui.",
      betaBadge: "Legacy",
      currentBadge: "Consigliati",
      chooseTitle: "Scegli la versione dei dati",
      cancel: "Annulla",
      close: "Chiudi la selezione dei dati"
    },
    page: {
      index: {
        title: "SAO MC - Hub dei moduli",
        eyebrow: "SAO MC / HUB DEI MONDI",
        discordButton: "Link",
        discordButtonAria: "Apri i link",
        heading: "Scegli il tuo mondo",
        subtitle: "Scegli un mondo per iniziare.",
        disclaimerBody:
          "Questo è un progetto personale.\nQuesto sito è pensato principalmente per un uso personale e per la gilda. Le informazioni continueranno ad essere aggiunte, aggiornate e migliorate finché ci sarà nuovo contenuto da documentare.\nTieni presente che questo progetto non è stato pensato fin dall'inizio come risorsa completamente pubblica, quindi alcune informazioni possono essere incomplete, mancanti o adattate al mio uso e alle esigenze della mia gilda.",
        selectorAria: "Selettore della modalità di gioco",
        aincradTitle: "Aincrad",
        underworldTitle: "Fractured Underworld",
        ggoTitle: "GunGaleOnline",
        launchTag: "Avvia",
        notReleasedTag: "Non disponibile",
        aincradDesc:
          "Apri l'hub della mappa per consultare la guida ai dungeon, le missioni, il bestiario e altro.",
        underworldDesc:
          "Apri l'hub della mappa di Fractured Underworld per iniziare a costruire e testare questo modulo.",
        ggoDesc: "Il menu GGO non è ancora pubblicato, quindi non c'è nessun modulo da aprire.",
        interactiveMode: "Modalità interattiva",
        guildLabel: "Gilda: Moonlit Black Cats",
        guildAria: "Omaggio alla gilda",
        discordModalTitle: "Link",
        discordModalCloseAria: "Chiudi il menu dei link",
        discordModalBody: "Scegli dove vuoi andare adesso.",
        creatorDiscord: "Discord del creatore del sito",
        saoDiscord: "Discord di SAO MC",
        supportWebsite: "Sito di supporto di SAO MC",
        moonlitDiscord: "🌙 Unisciti ai Moonlit Black Cats",
        ggoToast: "GGO non è ancora uscito! Nessuna informazione da mostrare."
      },
      bestiary: {
        eyebrow: "AINCRAD / BESTIARIO",
        title: "Bestiario di SAO",
        heading: "Bestiario",
        tablistAria: "Categorie del bestiario",
        searchLabel: "Cerca mostri",
        searchPlaceholder: "Cerca per nome...",
        listTitleRegular: "Elenco mostri comuni",
        listTitleBoss: "Elenco boss",
        listTitleDungeonBoss: "Elenco boss dei dungeon",
        listTitleDungeonMobs: "Elenco mostri dei dungeon",
        statusShown: "{visible} di {total} mostri mostrati.",
        statusShownBoss: "{visible} di {total} boss mostrati.",
        statusShownDungeonBoss: "{visible} di {total} boss dei dungeon mostrati.",
        statusShownDungeonMobs: "{visible} di {total} mostri dei dungeon mostrati.",
        statusShownRegular: "{visible} di {total} mostri comuni mostrati.",
        emptyCategory: "Non ci sono ancora voci per {category}.",
        drops: "Bottino",
        aggressiveness: "Aggressività",
        aggressive: "Aggressivo",
        neutral: "Neutrale",
        passive: "Passivo",
        xp: "XP",
        na: "N/D",
        translationNotice:
          "Spiacente, la maggior parte di questa pagina non è ancora tradotta. Chi sviluppa questa pagina è una sola persona, senza abbastanza tempo per raccogliere i dati e tradurre tutto. Le traduzioni potrebbero arrivare in futuro, ma è improbabile.",
        loadError: "Impossibile caricare i dati del bestiario. Aggiorna la pagina e riprova.",
        loadUnavailable: "I dati del bestiario al momento non sono disponibili."
      },
      commands: {
        title: "Comandi di SAO",
        heading: "Comandi",
        tablistAria: "Categorie di comandi",
        searchLabel: "Cerca comandi",
        searchPlaceholder: "Cerca per comando, utilizzo o esempio...",
        emptyState: "Nessun comando corrisponde ai filtri attuali.",
        colCommand: "Comando",
        colUsage: "Utilizzo",
        colExample: "Esempio",
        statusShown: "Comandi in {category}: {count}{suffix}.",
        categories: {
          communication: "Comunicazione",
          cosmetics: "Cosmetici e aspetto",
          dungeons: "Dungeon",
          economy: "Economia",
          gameplay: "Gioco e progressione",
          information: "Informazioni",
          media: "Media e audio",
          navigation: "Navigazione",
          useless: "Comandi inutili"
        },
        translationNotice:
          "Spiacente, la maggior parte di questa pagina non è ancora tradotta. Chi sviluppa questa pagina è una sola persona, senza abbastanza tempo per raccogliere i dati e tradurre tutto. Le traduzioni potrebbero arrivare in futuro, ma è improbabile.",
        loadError: "Impossibile caricare i comandi in questo momento. Aggiorna la pagina e riprova.",
        loadUnavailable: "I comandi al momento non sono disponibili."
      },
      ecompendium: {
        eyebrow: "AINCRAD / COMPENDIO EQUIPAGGIAMENTO",
        title: "Compendio equipaggiamento di SAO",
        heading: "Compendio equipaggiamento",
        searchLabel: "Cerca",
        searchPlaceholder: "Cerca equipaggiamento...",
        noEntriesFound: "Nessuna voce trovata.",
        statusShown: "Mostrate {visible} voci su {total}.",
        listTitles: {
          weapon: "Armi",
          armor: "Armature",
          accessory: "Accessori",
          rune: "Rune",
          tool: "Strumenti",
          food: "Cibo",
          consumable: "Consumabili",
          material: "Materiali",
          quest_item: "Oggetti missione",
          resource: "Risorse",
          dungeon: "Dungeon",
          currency: "Valuta"
        },
        labels: {
          rarity: "Rarità",
          level: "Livello",
          set: "Set",
          craftedAt: "Creato a",
          description: "Descrizione",
          statistics: "Statistiche",
          resources: "Risorse"
        },
        unknownItem: "Oggetto sconosciuto",
        translationNotice:
          "Spiacente, la maggior parte di questa pagina non è ancora tradotta. Chi sviluppa questa pagina è una sola persona, senza abbastanza tempo per raccogliere i dati e tradurre tutto. Le traduzioni potrebbero arrivare in futuro, ma è improbabile.",
        loadError: "Impossibile caricare i dati dell'equipaggiamento. Aggiorna la pagina e riprova.",
        loadUnavailable: "I dati dell'equipaggiamento al momento non sono disponibili.",
        categoriesAria: "Categorie del compendio"
      },
      quests: {
        eyebrow: "AINCRAD / MISSIONI",
        title: "Missioni di SAO",
        heading: "Missioni",
        logoAria: "Logo delle missioni",
        searchLabel: "Cerca missioni",
        searchPlaceholder: "Cerca in qualsiasi colonna...",
        questTypeFilterAria: "Filtro tipo di missione",
        questTypes: {
          main: "Missioni principali",
          side: "Missioni secondarie"
        },
        questFiltersAria: "Filtri delle missioni",
        cityFilterLabel: "Città",
        allCities: "Tutte le città",
        completionFilterLabel: "Completamento",
        allQuests: "Tutte le missioni",
        completedOnly: "Solo completate",
        incompleteOnly: "Non completate",
        noFilterMatch: "Nessuna missione corrisponde ai filtri attuali.",
        tableCols: {
          npcName: "Nome PNG",
          city: "Città",
          coordinates: "Coordinate",
          requirements: "Requisiti / Risorse",
          questName: "Nome missione",
          xpReward: "XP",
          colReward: "Col",
          bonusItems: "Oggetti bonus",
          completed: "Completata"
        },
        markCompleted: "Segna come completata",
        completed: "Completata",
        questNumber: "Missione {number}",
        floorText: "Piano",
        titleWithFloor: "Missioni - {floor}",
        noQuestData: "Nessun dato sulle missioni è ancora stato aggiunto per {floor}.",
        noQuestMatchFloor: "Nessuna missione corrisponde alla tua ricerca su {floor}. {completed} completate.",
        shownStatus: "{visible} di {total} missioni mostrate per {floor} || {completed} completate.",
        loadedStatus: "{count} missioni caricate per {floor}.",
        translationNotice:
          "Spiacente, la maggior parte di questa pagina non è ancora tradotta. Chi sviluppa questa pagina è una sola persona, senza abbastanza tempo per raccogliere i dati e tradurre tutto. Le traduzioni potrebbero arrivare in futuro, ma è improbabile.",
        emptyState: "Nessuna missione da mostrare."
      },
      miscinfo: {
        eyebrow: "AINCRAD / INFO. VARIE",
        title: "Info. Varie",
        heading: "Info. Varie",
        back: "Torna al menu",
        playerLevels: "Livelli del giocatore",
        playerLevelsDetails:
          "Livello 1 -> 2: 150 XP\nLivello 2 -> 3: 300 XP\nLivello 3 -> 4: 600 XP\nLivello 4 -> 5: 1.350 XP\nLivello 5 -> 6: 2.700 XP\nLivello 6 -> 7: 5.100 XP\nLivello 7 -> 8: 9.000 XP\nLivello 8 -> 9: 15.000 XP\nLivello 9 -> 10: 24.000 XP",
        translationNotice:
          "Spiacente, la maggior parte di questa pagina non è ancora tradotta. Chi sviluppa questa pagina è una sola persona, senza abbastanza tempo per raccogliere i dati e tradurre tutto. Le traduzioni potrebbero arrivare in futuro, ma è improbabile.",
        notice:
          "La maggior parte del contenuto di questa pagina non è ancora tradotta, perché il sito è mantenuto da una sola persona con poco tempo.",
        classesHeading: "Classi",
        classesDescription: "Riferimenti alle classi disponibili da Build del personaggio.",
        equipmentSlotsHeading: "Slot dell'equipaggiamento",
        equipmentSlotsDescription: "Slot gestiti dal pianificatore della build.",
        currentLevel: "Livello attuale",
        nextLevel: "Livello successivo",
        xpToNextLevel: "XP al livello successivo",
        subtitle: "Informazioni di riferimento utili su Aincrad, la progressione, i sistemi e il sito.",
        referenceHub: "Hub di riferimento",
        noCurrentData: "Per questa sezione non sono ancora stati aggiunti Dati attuali.",
        progression: "Progressione",
        playerProgression: "Progressione del giocatore",
        xpThresholds: "Soglie di XP",
        characterSystems: "Sistemi del personaggio",
        aincradSystems: "Sistemi di Aincrad",
        gameSystems: "Sistemi di gioco",
        worldReference: "Riferimenti sul mondo",
        worldAincradReference: "Riferimenti sul mondo / Aincrad",
        mapLayers: "Livelli della mappa",
        mapLayersText:
          "Il modulo mappa offre il Piano 1 - The Town of Beginnings, il Piano 2 - Arid Desert e il Piano 3 - The Forest of Wandering, con immagini della mappa di superficie e sotterranea.",
        coordinatesHeading: "Coordinate",
        coordinatesText:
          "I marker della mappa espongono le coordinate X e Z, e il runtime della mappa offre la conversione delle coordinate per ogni piano.",
        markerSystems: "Sistemi dei marker",
        markerSystemsText:
          "Le categorie esistenti della mappa includono biomi, dungeon, boss, missioni, mercanti, stazioni di creazione e aree dei mostri.",
        projectReference: "Riferimenti sul progetto",
        projectInformation: "Informazioni sul sito / progetto",
        projectHeading: "Progetto",
        projectText: "Sito di riferimento statico su SAO MC, creato da fan e ospitato su GitHub Pages.",
        languagesHeading: "Lingue",
        languagesText: "English, Español, Français e Italiano sono disponibili tramite il sistema di lingue condiviso.",
        commandReference: "Riferimenti sui comandi",
        commandReferenceText:
          "Cerca nel catalogo dei comandi esistente per categoria, comando, utilizzo o esempio.",
        loadingCommands: "Caricamento comandi...",
        questsCardText:
          "Cerca le missioni per PNG, luogo, requisiti, ricompense e stato di completamento.",
        equipmentCardText:
          "Sfoglia le categorie di equipaggiamento, i livelli, la rarità, le descrizioni, le statistiche e le risorse di creazione.",
        bestiaryCardText:
          "Consulta boss, mostri dei dungeon, mostri comuni, aggressività, XP e bottino.",
        mapsCardText:
          "Esplora le mappe dei piani con marker ricercabili, categorie, coordinate e livelli sotterranei.",
        skillsHeading: "Abilità",
        skillsUnavailable: "Le informazioni sulle abilità non sono ancora disponibili."
      },
      uwcompendium: {
        eyebrow: "FRACTURED UNDERWORLD / COMPENDIO",
        title: "Compendio di Fractured Underworld",
        map: "Torna alla mappa",
        searchLabel: "Cerca",
        searchPlaceholder: "Cerca nel compendio...",
        statusShown: "Mostrate {visible} voci su {total}.",
        noEntries: "Nessuna voce del compendio trovata.",
        unavailable: "I dati del Compendio di test beta non sono ancora disponibili.",
        insufficientInfo: "Non ci sono ancora abbastanza informazioni pubblicate per creare una pagina!",
        categoriesAria: "Categorie del compendio",
        category: "Categoria",
        costRequirement: "Costo / requisito",
        description: "Descrizione",
        details: "Dettagli",
        entries: "Voci del compendio",
        statistics: "Statistiche",
        type: "Tipo",
        unknown: "Oggetto sconosciuto"
      },
      mainui: {
        towerDefenseNav: "Difesa delle torri",
        compendiumNav: "Compendio",
        compendiumToast: "Non ci sono ancora abbastanza informazioni pubblicate per creare una pagina!",
        title: "Mappa interattiva di SAO",
        mapDataUnavailableTitle: "MAPPA DI FRACTURED UNDERWORLD",
        mapDataUnavailableBody: "I dati della mappa sono attualmente in fase di sviluppo.",
        mapDataUnavailableFooter:
          "I dati dei PNG e della mappa saranno aggiunti man mano che questo modulo procede.",
        translationNotice:
          "Spiacente, la maggior parte di questa pagina non è ancora tradotta. Chi sviluppa questa pagina è una sola persona, senza abbastanza tempo per raccogliere i dati e tradurre tutto. Le traduzioni potrebbero arrivare in futuro, ma è improbabile.",
        searchPlaceholder: "Cerca marker...",
        clearFilters: "Cancella i filtri",
        resetView: "Reimposta la vista",
        defaultInfoTitle: "Seleziona un marker",
        defaultInfoBody: "Scegli un marker sulla mappa per vedere i dettagli qui.",
        chooseCategoryTitle: "Scegli una categoria",
        chooseCategoryBody:
          "Attiva una o più categorie nella barra laterale per mostrare i marker di questa isola.",
        noSearchTitle: "Nessun risultato",
        noSearchBody: "Nessun marker corrisponde alla ricerca attuale su questa isola.",
        noMarkersTitle: "Nessun marker disponibile",
        noMarkersBody:
          "Non ci sono marker disponibili per le categorie selezionate su questa isola.",
        noMobEntries: "Non ci sono ancora voci sui mostri per questa zona.",
        mapSuffix: "mappa",
        undergroundSuffix: "sovrapposizione sotterranea",
        runtimeError: "Impossibile caricare la mappa in questo momento. Aggiorna la pagina e riprova.",
        runtimeTitle: "Mappa non disponibile",
        coordinatesPlaceholder: "X: -- Z: --",
        mapContextMenu: {
          title: "AZIONI MAPPA",
          createCustomMarker: "Crea marker personalizzato",
          distancePoint1: "Punto 1 del calcolatore di distanza",
          distancePoint2: "Punto 2 del calcolatore di distanza",
          resetDistance: "Reimposta il calcolatore di distanza",
          exportJourneyMap: "Esporta waypoint di JourneyMap",
          importJourneyMap: "Importa waypoint di JourneyMap",
          waypointTutorial: "Tutorial: come importare/esportare i waypoint",
          exportSuccess: "Esportati {countLabel}.",
          exportWaypointOne: "1 waypoint",
          exportWaypointMany: "{count} waypoint",
          exportNoWaypoints: "Attiva almeno una categoria di waypoint da esportare.",
          exportEmptyCategories: "Le categorie attive non contengono waypoint da esportare.",
          exportFailure: "Esportazione di JourneyMap non riuscita.",
          importSuccess: "Importati {waypoints} {waypointLabel} da {categories} {categoryLabel}.",
          importWaypointOne: "waypoint",
          importWaypointMany: "waypoint",
          importCategoryOne: "categoria",
          importCategoryMany: "categorie",
          importNoWaypoints: "In questo file non sono stati trovati waypoint validi.",
          importInvalid: "Questo file di JourneyMap non è valido.",
          importUnsupported:
            "Questo file di JourneyMap usa un formato o una dimensione non supportati.",
          importFailure: "Importazione di JourneyMap non riuscita. Nessun waypoint è stato aggiunto.",
          importPartial: "Importati {newLabel}; ignorati {duplicateLabel}.",
          importNewOne: "1 nuovo waypoint",
          importNewMany: "{count} nuovi waypoint",
          importDuplicateOne: "1 waypoint duplicato",
          importDuplicateMany: "{count} waypoint duplicati",
          importDuplicatesOne: "Questo waypoint di JourneyMap era già stato importato.",
          importDuplicatesMany: "{count} waypoint di JourneyMap erano già stati importati."
        },
        categories: {
          custom: "Marker personalizzati",
          npc: "PNG",
          mainQuests: "Missioni principali",
          rulid: "Zona del grano",
          fishingSpot: "Punto di pesca",
          oakWood: "Legno di quercia",
          copper: "Rame",
          iron: "Ferro",
          coal: "Carbone"
        },
        islandOptions: {
          playerIsland: "Isola del giocatore",
          gigasCedar: "Gigas Cedar",
          iceCave: "Grotta di ghiaccio",
          rulid: "Rulid",
          fishingIsland: "Isola della pesca"
        },
        walkthrough: {
          step1Title: "Navigazione",
          step1Body:
            "Usa la riga in alto per aprire Difesa delle torri, aprire il Compendio o tornare al Menu.",
          step2Title: "Controlli dell'isola",
          step2Body: "Scegli un'isola, cerca i marker e cancella i filtri attuali da qui.",
          step3Title: "Filtri",
          step3Body:
            "Usa i filtri delle categorie per decidere quali marker appaiono sull'isola selezionata. I filtri attivi restano evidenziati, così vedi cosa è abilitato.",
          step4Title: "Area della mappa",
          step4Body:
            "Questa area mostra l'isola selezionata e i dati della mappa attualmente disponibili. Alcune isole dell'Underworld mostrano ancora lo stato di dati non disponibili.",
          step5Title: "Menu della mappa con clic destro",
          step5Body:
            "Fai clic destro sulla mappa per aprire il menu delle azioni. Questo menu contiene le azioni e gli strumenti disponibili per la mappa.",
          step6Title: "Argo, l'informatrice",
          step6Body:
            "Trovi il pulsante di Argo, l'informatrice, nell'angolo in basso a sinistra della mappa. Fai clic su di esso per aprire Argo e fare domande sul gioco.\n\nNota importante: Argo non è un sistema di IA.\n\nUsa un sistema basato su regole che analizza i tuoi messaggi, cerca parole chiave e schemi, e consulta i dati reali del gioco per trovare le informazioni pertinenti. Le sue risposte derivano da logica programmata e dialoghi scritti, non da un modello di IA che genera risposte.\n\nPer questo può essere un po' pignola su come formuli le cose. Un testo poco chiaro, una frase insolita o una domanda troppo complessa possono produrre risultati imprecisi o inattesi. Se non capisce cosa stai cercando, prova a usare parole chiave specifiche, come nomi di mostri, oggetti, PNG o luoghi.\n\nOra è tutto pronto! Buona esplorazione!"
        },
        mapDataUnavailable: "Dati della mappa non disponibili",
        categorySectionHeader: "ISOLA DEL GIOCATORE"
      },
      towerdefense: {
        eyebrow: "FRACTURED UNDERWORLD / DIFESA DELLE TORRI",
        title: "Fractured Underworld - Difesa delle torri",
        heading: "Difesa delle torri di Fractured Underworld",
        back: "Torna indietro",
        sectionsAria: "Sezioni di Difesa delle torri",
        chapterOverviewAria: "Panoramica dei capitoli di Difesa delle torri",
        chapterListAria: "Elenco dei capitoli di Difesa delle torri",
        chapterSelect: "Selezione capitolo",
        chapter: "Capitolo {number}",
        shopSectionAria: "Sezione negozio di Difesa delle torri",
        shopListAria: "Elenco negozio di Difesa delle torri",
        shopTitle: "Negozio di Difesa delle torri",
        infoSheetTitle: "Scheda informativa di Difesa delle torri",
        closeInfoSheet: "Chiudi la scheda informativa",
        insufficientInfo: "Non ci sono ancora abbastanza informazioni pubblicate per creare una pagina!",
        rewardsHead: "Ricompense",
        wavesHead: "Ondate",
        arcHead: "Arco",
        levelProgression: "Progressione dei livelli",
        currentStats: "Attuali",
        translationNotice:
          "Spiacente, la maggior parte di questa pagina non è ancora tradotta. Chi sviluppa questa pagina è una sola persona, senza abbastanza tempo per raccogliere i dati e tradurre tutto. Le traduzioni potrebbero arrivare in futuro, ma è improbabile.",
        arc1Title: "Arco 1 - Tutorial (Boar Planes)",
        arc1Rewards:
          "Sacchetto da 100 Col (100%), Cristallo di utilità (25%), Runa PvE minore (8%), Chiave del dungeon (4%), Felce (oggetto habitat) (30%), Lanterna brinata (oggetto habitat) (20%), Falò (oggetto habitat) (20%)",
        arc1Waves: "5 ondate. Alla quinta ondata appare un pumba con skin modificata come boss.",
        arc2Title: "Arco 2 - Intermedio (Boar Zones)",
        arc2Rewards:
          "Borsa da 500 Col (100%), Cristallo di utilità (40%), Runa PvE minore (18%), Chiave del dungeon (12%), Felce (habitat) (30%), Balla di fieno (habitat) (20%)",
        arc2Waves: "6 ondate. Alla sesta ondata appare un pumba con skin modificata come boss.",
        sectionEyebrow: "Difesa delle torri",
        progressionEyebrow: "Progressione",
        chapterInformation: "Informazioni sul capitolo",
        shopItemUnit: "Unità",
        shopItemInvocation: "Evocazione",
        shopItemUnlockRequirement: "Requisito di sblocco",
        shopItemBaseStats: "Statistiche base",
        shopItemUpgradeCosts: "Costi di potenziamento",
        shopItems: {
          mageSkeleton: {
            name: "Scheletro mago",
            unlockRequirement: "5 pergamene del mago",
            invocationCost: "200 costo di evocazione",
            levelOne: "Liv. 1: 1,1 velocità d'attacco, 7 portata, 5 danno",
            progression: {
              one: "Liv. 1 -> 2: +0,1 velocità d'attacco, +2 portata, +2 danno (1,2 velocità d'attacco, 9 portata, 7 danno)",
              two: "Liv. 2 -> 3: +0,2 velocità d'attacco, +2 portata, +2 danno (1,4 velocità d'attacco, 11 portata, 9 danno)",
              three:
                "Liv. 3 -> 4: +0,3 velocità d'attacco, +2 portata, +3 danno (1,7 velocità d'attacco, 13 portata, 12 danno)",
              four: "Liv. 4 -> 5 (max): +0,3 velocità d'attacco, +2 portata, +3 danno (2 velocità d'attacco, 15 portata, 15 danno)"
            },
            upgradeCosts: "Costo di potenziamento: Liv.2 80, Liv.3 150, Liv.4 250, Liv.5 400"
          },
          archerSkeleton: {
            name: "Scheletro arciere",
            unlockRequirement: "5 pergamene dell'arciere",
            invocationCost: "150 costo di evocazione",
            levelOne: "Liv. 1: 0,4 velocità d'attacco, 10 portata, 6 danno",
            progression: {
              one: "Liv. 1 -> 2: +0,1 velocità d'attacco, +3 portata, +3 danno (0,5 velocità d'attacco, 13 portata, 9 danno)",
              two: "Liv. 2 -> 3: +3 portata, +4 danno (0,5 velocità d'attacco, 16 portata, 13 danno)",
              three: "Liv. 3 -> 4: N/D (N/D)",
              four: "Liv. 4 -> 5: N/D (N/D)"
            },
            upgradeCosts: "Costo di potenziamento: Liv.2 80, Liv.3 150, Liv.4 250, Liv.5 400"
          },
          swordsmanSkeleton: {
            name: "Scheletro spadaccino",
            unlockRequirement: "5 pergamene dello spadaccino",
            invocationCost: "100 costo di evocazione",
            levelOne: "Liv. 1: 0,7 velocità d'attacco, 4 portata, 8 danno",
            progression: {
              one: "Liv. 1 -> 2: +4 danno (0,7 velocità d'attacco, 4 portata, 12 danno)",
              two: "Liv. 2 -> 3: +0,1 velocità d'attacco, +1 portata, +5 danno (0,8 velocità d'attacco, 5 portata, 17 danno)",
              three: "Liv. 3 -> 4: +7 danno (0,8 velocità d'attacco, 5 portata, 24 danno)",
              four: "Liv. 4 -> 5 (max): +0,1 velocità d'attacco, +1 portata, +8 danno"
            },
            upgradeCosts: "Costo di potenziamento: Liv.2 80, Liv.3 150, Liv.4 250, Liv.5 400"
          }
        }
      },
      maps: {
        title: "Mappa interattiva di SAO",
        floorLabel: "Piano:",
        undergroundLabel: "Sotterraneo:",
        searchPlaceholder: "Cerca marker...",
        clearFilters: "Cancella i filtri",
        mapAlt: "Mappa del piano",
        undergroundAlt: "Sovrapposizione sotterranea",
        resetView: "Reimposta la vista",
        defaultInfoTitle: "Seleziona un marker",
        defaultInfoBody: "Scegli un marker sulla mappa per vedere i dettagli qui.",
        chooseCategoryTitle: "Scegli una categoria",
        chooseCategoryBody:
          "Attiva una o più categorie nella barra laterale per mostrare i marker di questa isola.",
        noSearchTitle: "Nessun risultato",
        noSearchBody: "Nessun marker corrisponde alla ricerca attuale su questa isola.",
        noMarkersTitle: "Nessun marker disponibile",
        noMarkersBody:
          "Non ci sono marker disponibili per le categorie selezionate su questa isola.",
        noMobEntries: "Non ci sono ancora voci sui mostri per questa zona.",
        mobType: "Tipo",
        mobAreaType: "Area dei mostri",
        availableMobs: "Mostri disponibili",
        floorText: "Piano",
        tutorial: "Tutorial",
        coordinates: "Coordinate",
        mobs: "Mostri",
        sharedQuests: "Missioni in questa posizione",
        viewWaypointInfo: "Vedi info sul waypoint",
        clusterTitle: "{count} waypoint",
        clusterBody:
          "Questi {count} waypoint sono vicini a questo livello di zoom. Aprine uno per vedere i dettagli.",
        visitedDefeated: "Sconfitto",
        visitedCompleted: "Completata",
        visitedVisited: "Visitato",
        walkthrough: {
          step1Title: "Navigazione",
          step1Body:
            "Usa la riga in alto per passare tra Bestiario, Equipaggiamento, Missioni, Aggiornamenti, Info. Varie e il Menu.",
          step2Title: "Controlli della mappa",
          step2Body:
            "Scegli il piano, attiva la modalità sotterranea, cerca i marker e cancella i filtri attuali da qui.",
          step3Title: "Filtri",
          step3Body:
            "Usa i filtri delle categorie per decidere quali marker appaiono sulla mappa. I filtri attivi restano evidenziati, così vedi cosa è abilitato.",
          step4Title: "Mappa interattiva",
          step4Body:
            "Trascina per spostarti e usa la rotella per lo zoom. Seleziona un marker per aprire i dettagli e le scorciatoie nel pannello informativo.",
          step5Title: "Menu della mappa con clic destro",
          step5Body:
            "Fai clic destro sulla mappa per aprire il menu delle azioni. Questo menu contiene le azioni e gli strumenti disponibili per la mappa.",
          step6Title: "Argo, l'informatrice",
          step6Body:
            "Trovi il pulsante di Argo, l'informatrice, nell'angolo in basso a sinistra della mappa. Fai clic su di esso per aprire Argo e fare domande sul gioco.\n\nNota importante: Argo non è un sistema di IA.\n\nUsa un sistema basato su regole che analizza i tuoi messaggi, cerca parole chiave e schemi, e consulta i dati reali del gioco per trovare le informazioni pertinenti. Le sue risposte derivano da logica programmata e dialoghi scritti, non da un modello di IA che genera risposte.\n\nPer questo può essere un po' pignola su come formuli le cose. Un testo poco chiaro, una frase insolita o una domanda troppo complessa possono produrre risultati imprecisi o inattesi. Se non capisce cosa stai cercando, prova a usare parole chiave specifiche, come nomi di mostri, oggetti, PNG o luoghi.\n\nOra è tutto pronto! Buona esplorazione!"
        },
        runtimeError: "Impossibile caricare la mappa in questo momento. Aggiorna la pagina e riprova.",
        runtimeTitle: "Mappa non disponibile",
        coordinatesPlaceholder: "X: -- Z: --",
        categories: {
          custom: "Marker personalizzati",
          main: "Missioni principali",
          biomes: "Biomi",
          bossSpawns: "Aree dei boss",
          dungeons: "Dungeon",
          farmingSpots: "Punti di raccolta",
          mobAreas: "Aree dei mostri",
          worldEvents: "Evento mondiale",
          sideQuests: "Missioni secondarie",
          alchemist: "Alchimista",
          lumberjack: "Taglialegna",
          accessoriesMerchants: "Mercante di accessori",
          consumablesMerchants: "Mercante di consumabili",
          equipmentMerchants: "Mercante di equipaggiamento",
          lootBuyers: "Acquirenti di bottino",
          occultMerchants: "Mercante occulto",
          toolMerchants: "Mercante di strumenti",
          travelingMerchants: "Mercanti itineranti",
          weaponSellers: "Venditori di armi",
          accessoriesBlacksmith: "Fabbro di accessori",
          equipmentBlacksmith: "Fabbro di equipaggiamento",
          secretAccessoryBlacksmith: "Fabbro di accessori segreti",
          armorBlacksmith: "Fabbro di armature",
          ingotBlacksmith: "Fabbro di lingotti",
          keyBlacksmith: "Fabbro di chiavi",
          materialsBlacksmith: "Fabbro di materiali",
          refaire: "Refaire",
          runeCraftsmen: "Artigiani di rune",
          weaponsmith: "Fabbro di armi"
        },
        floorOptions: {
          floor1: "Piano 1 - The Town of Beginnings",
          floor2: "Piano 2 - Arid Desert",
          floor3: "Piano 3 - The Forest of Wandering"
        },
        categoryMainTitle: "Principali",
        categoryQuestsTitle: "Missioni",
        categoryJourneymenTitle: "Mestieri",
        categoryMarketTitle: "Mercato",
        categoryCraftsmenTitle: "Artigiani",
        mapContextMenu: {
          title: "AZIONI MAPPA",
          createCustomMarker: "Crea marker personalizzato",
          distancePoint1: "Punto 1 del calcolatore di distanza",
          distancePoint2: "Punto 2 del calcolatore di distanza",
          resetDistance: "Reimposta il calcolatore di distanza",
          exportJourneyMap: "Esporta waypoint di JourneyMap",
          importJourneyMap: "Importa waypoint di JourneyMap",
          waypointTutorial: "Tutorial: come importare/esportare i waypoint",
          exportSuccess: "Esportati {countLabel}.",
          exportWaypointOne: "1 waypoint",
          exportWaypointMany: "{count} waypoint",
          exportNoWaypoints: "Attiva almeno una categoria di waypoint da esportare.",
          exportEmptyCategories: "Le categorie attive non contengono waypoint da esportare.",
          exportFailure: "Esportazione di JourneyMap non riuscita.",
          importSuccess: "Importati {waypoints} {waypointLabel} da {categories} {categoryLabel}.",
          importWaypointOne: "waypoint",
          importWaypointMany: "waypoint",
          importCategoryOne: "categoria",
          importCategoryMany: "categorie",
          importNoWaypoints: "In questo file non sono stati trovati waypoint validi.",
          importInvalid: "Questo file di JourneyMap non è valido.",
          importUnsupported: "Questo file di JourneyMap usa un formato o una dimensione non supportati.",
          importFailure: "Importazione di JourneyMap non riuscita. Nessun waypoint è stato aggiunto.",
          importPartial: "Importati {newLabel}; ignorati {duplicateLabel}.",
          importNewOne: "1 nuovo waypoint",
          importNewMany: "{count} nuovi waypoint",
          importDuplicateOne: "1 waypoint duplicato",
          importDuplicateMany: "{count} waypoint duplicati",
          importDuplicatesOne: "Questo waypoint di JourneyMap era già stato importato.",
          importDuplicatesMany: "{count} waypoint di JourneyMap erano già stati importati."
        },
        distanceCalculator: {
          distance: "Distanza: {value}"
        },
        dataModeBanner: {
          beta: "Questi sono Dati di test beta! Molte informazioni sono imprecise, quindi non venire da me se qualcosa qui è sbagliato. Consiglio di guardare questo tipo di dati solo se non riesci a trovare quello che cerchi nei Dati attuali.",
          current:
            "Questi sono Dati attuali. Se qualche informazione qui è sbagliata, scrivimi in DM e la correggerò il prima possibile. Se non riesci a trovare qualcosa, controlla i Dati di test beta. Tieni solo presente che molte di quelle informazioni sono sbagliate, quindi non prenderle come verità al 100%."
        },
        customWaypoint: {
          category: "Marker personalizzati",
          createTitle: "Crea waypoint personalizzato",
          nameLabel: "Nome del waypoint",
          descriptionLabel: "Descrizione del waypoint",
          coordinatesLabel: "Coordinate",
          xLabel: "X",
          zLabel: "Z",
          buttonLabel: "Pulsante",
          buttonDefault: "Predefinito",
          createButton: "Crea un pulsante",
          buttonNameLabel: "Nome del pulsante",
          logoLabel: "Logo personalizzato",
          logoPin: "Puntina",
          logoStar: "Stella",
          logoFlag: "Bandiera",
          logoHome: "Casa",
          logoChest: "Baule",
          logoSword: "Spada",
          logoShield: "Scudo",
          logoSkull: "Teschio",
          logoDiamond: "Diamante",
          logoTarget: "Bersaglio",
          colorSelectorLabel: "Selettore colore per l'esportazione di \"JourneyMap\"",
          colorHint: "Clicca per scegliere un colore",
          colorHintBiomes: "Il colore dei Biomi è bloccato sul bianco",
          colorPickerAria: "Scegli il colore della categoria JourneyMap",
          colorHexAria: "Colore HEX della categoria JourneyMap",
          colorHexPlaceholder: "#RRGGBB",
          invalidHex: "Colore HEX non valido",
          confirm: "Conferma creazione",
          cancel: "Annulla creazione",
          confirmAction: "Conferma",
          cancelAction: "Annulla",
          copy: "Copia le coordinate",
          copySuccess: "Coordinate copiate.",
          copyError: "Impossibile copiare le coordinate.",
          nameRequired: "Inserisci un nome per il waypoint.",
          coordinatesRequired: "Inserisci coordinate X e Z valide.",
          manualCoordinates:
            "Inserisci X e Z manualmente; questa mappa non ha ancora una calibrazione delle coordinate.",
          performanceWarning:
            "Più waypoint personalizzati possono ridurre le prestazioni della mappa. Un numero elevato di waypoint può rallentarla, soprattutto durante lo zoom o gli spostamenti.",
          delete: "Elimina waypoint personalizzato",
          deleteButton: "Elimina pulsante",
          deleteAction: "Elimina",
          deleteButtonWarning:
            "Tutti i waypoint di questo pulsante verranno rimossi insieme al pulsante",
          areYouSure: "Sei sicuro?",
          confirmDelete: "Conferma eliminazione",
          deleteConfirm: "Eliminare questo waypoint personalizzato?"
        },
        sidebarResizeAria: "Ridimensiona la barra laterale",
        zoomIn: "Zoom avanti",
        zoomOut: "Zoom indietro"
      },
      patchnotes: {
        eyebrow: "AINCRAD / NOTE DI AGGIORNAMENTO",
        title: "Note di aggiornamento di SAO",
        heading: "Note di aggiornamento",
        searchLabel: "Cerca nelle note",
        searchPlaceholder: "Filtra per versione, oggetto o aggiornamento",
        noMatches: "Nessuna nota di aggiornamento corrisponde a questo filtro.",
        noEntries: "Nessuna voce di changelog corrispondente trovata.",
        statusShowing: "Note di aggiornamento: {count}{suffix}.",
        translationNotice:
          "Spiacente, la maggior parte di questa pagina non è ancora tradotta. Chi sviluppa questa pagina è una sola persona, senza abbastanza tempo per raccogliere i dati e tradurre tutto. Le traduzioni potrebbero arrivare in futuro, ma è improbabile.",
        entries: {
          v190: {
            title: "Aggiornamento di contenuti, localizzazione e correzioni",
            version: "Aggiornamento di contenuti, localizzazione e correzioni - v1.9",
            summary:
              "PNG ed equipaggiamento\n• Aggiunto \"Argo, l'informatrice\".\n• Aggiunte nuove posizioni di PNG, tra cui Candelia, Fabbro di Nodachi, Local Minatore, Accessori del lupo e Accessori dei banditi.\n• Aggiunti sette nuovi accessori, tra cui il Set del lupo debole e il Set del bandito, con i loro bonus di set.\n• Aggiornata la posizione di raccolta della Foresta di querce/betulle.\n\nLocalizzazione\n• Aggiunto il supporto per la lingua italiana.\n• Ampliate le traduzioni italiane per equipaggiamento, luoghi della mappa e altri contenuti.\n• Aggiornate e corrette le traduzioni in tutto il sito.\n\nCorrezioni e miglioramenti\n• Corretta la duplicazione dei waypoint di JourneyMap durante l'esportazione e la reimportazione dei waypoint personalizzati.\n• Migliorata la gestione dell'identità dei waypoint per evitare importazioni duplicate senza unire waypoint distinti che condividono lo stesso nome e le stesse coordinate.\n• Corrette aspettative obsolete dei test di rendering dell'equipaggiamento in italiano.\n• Aggiunti test di regressione per l'importazione dei waypoint e le traduzioni dell'equipaggiamento."
          },
          v180: {
            title: "Aggiornamento equipaggiamento di Build del personaggio",
            version: "Aggiornamento equipaggiamento di Build del personaggio - v1.8",
            summary:
              "Build del personaggio\n• Aggiunta una grande raccolta di nuove armi e armature per tutte e cinque le classi.\n• Ampliato l'equipaggiamento disponibile in Build del personaggio e nel Compendio equipaggiamento.\n• Aggiornati la formattazione e le icone usate per statistiche, potenziamenti e bonus degli oggetti.\n• Migliorata la presentazione degli effetti dell'equipaggiamento e dei bonus alle statistiche per renderli più leggibili."
          },
          v170: {
            title: "Aggiornamento albero delle abilità di Build del personaggio",
            version: "Aggiornamento albero delle abilità di Build del personaggio - v1.7",
            summary:
              "Build del personaggio\n• Ricostruito l'albero delle abilità, passando da 9 a 77 abilità, con prerequisiti e percorsi ramificati aggiornati.\n• Aggiunti punti abilità basati sul livello, un interruttore per punti abilità illimitati e uno sblocco delle abilità migliorato.\n• Aggiunti il trascinamento e lo zoom dell'albero delle abilità e correzioni al layout mobile.\n• Corretti i valori base del personaggio e il calcolo delle statistiche delle abilità.\n\nMappe e waypoint\n• Aumentato lo zoom della mappa da 30x a 45x e migliorata la nitidezza con lo zoom.\n• Migliorata la precisione delle coordinate.\n• Aggiornata l'esportazione dei waypoint di JourneyMap per includere le Aree dei mostri.\n\nDati e interfaccia\n• Ampliati e aggiornati i Dati attuali per equipaggiamento, bestiario e waypoint della mappa.\n• Aggiornata l'interfaccia di selezione della versione dei dati e cambiato il badge dei Dati di test beta in LEGACY.\n• Aggiunto un link al Discord dei Moonlit Black Cats nel menu dell'hub.\n\nLocalizzazione e correzioni\n• Corrette le traduzioni spagnole e francesi delle descrizioni della mappa.\n• Aggiornate le traduzioni per il nuovo equipaggiamento e per i mostri rinominati.\n• Corretti i prerequisiti delle abilità di Build del personaggio e il ritaglio su mobile."
          },
          v160: {
            title: "Aggiornamento strumenti mappa e waypoint",
            version: "Aggiornamento strumenti mappa e waypoint - v1.6",
            summary:
              "• Aggiunti i waypoint personalizzati, che permettono di creare categorie e waypoint propri, scegliere i colori delle categorie e gestire i punti direttamente dalla mappa. Più punti personalizzati possono aumentare il rallentamento del sito.\n• Aggiunti importazione ed esportazione dei waypoint di JourneyMap, organizzate in categorie per tipo e categoria di waypoint, più un pulsante tutorial nelle Azioni mappa che apre direttamente il tutorial su YouTube.\n• Aggiunto un calcolatore di distanza al menu con clic destro della mappa. Imposta il Punto 1 e il Punto 2 per calcolare la distanza dalle coordinate X/Z convertite del mondo Minecraft; i risultati restano corretti durante zoom, spostamenti e ridimensionamenti.\n• Aggiunti link a tutorial esterni nei popup informativi dei dungeon, incluso un tutorial di prova per il Dungeon Fallen Labyrinth, senza modificare le coordinate dei dungeon né i dati dei piani già esistenti.\n• Aggiunto il Passo 5 ai tour guidati di Aincrad e Fractured Underworld, che apre temporaneamente il vero menu Azioni mappa al centro ed evidenziato; alla fine del passo si chiude e torna al comportamento normale.\n• Aggiunto un separatore prima del pulsante del tutorial delle Azioni mappa e lasciato crescere il menu naturalmente, così il pulsante resta nei suoi limiti.\n• Rimossa la strana tilde dalla schermata di benvenuto dell'Hub dei mondi."
          },
          v150: {
            title: "Mappe, Build del personaggio e miglioramenti del sito",
            version: "Mappe, Build del personaggio e miglioramenti del sito - v1.5",
            summary:
              "• Corretti il posizionamento delle coordinate sulla mappa e la posizione dei waypoint.\n• Migliorati i calcoli di Build del personaggio, la visualizzazione di equipaggiamento e statistiche, la selezione della build e i controlli di ripristino.\n• Ampliate le traduzioni francesi e spagnole e corretti i testi con lingue mescolate.\n• Aggiornati i tour guidati, inclusi i controlli di livello di Build del personaggio, e migliorato l'avviso del Welcome Mat con un'opzione Salta dopo visite ripetute e un layout adattivo.\n• Rifiniti i layout delle pagine e corretti altri problemi visivi."
          },
          v140: {
            title: "Build del personaggio e aggiornamento importante dell'interfaccia",
            version: "Build del personaggio e aggiornamento importante dell'interfaccia - v1.4",
            summary:
              "• Aggiunto il sistema completo di Build del personaggio con supporto ai Dati attuali e ai Dati di test beta.\n• Aggiunti miglioramenti importanti e una revisione completa dell'interfaccia e della reattività del sito.\n• Ridisegnate le sezioni Equipaggiamento, Missioni, Note di aggiornamento, Info. Varie, Difesa delle torri e Compendio.\n• Aggiunte e ampliate le traduzioni in tutto il sito.\n• Migliorate reattività, prestazioni, caricamento e compatibilità con i browser.\n• Corrette statistiche dell'equipaggiamento mancanti o errate e vari problemi dell'interfaccia.\n• Aggiornato e migliorato il tour guidato del sito.\n• Aggiunti i Dati di test beta e le relative informazioni di caricamento.\n• Effettuate numerose correzioni minori, miglioramenti e modifiche di qualità della vita in tutto il sito."
          },
          v130: {
            title: "Aggiornamento lingue e compatibilità",
            version: "Aggiornamento lingue e compatibilità - v1.3",
            summary:
              "• Aggiunto il supporto alle lingue Français ed Español. Al momento di questa versione la copertura delle traduzioni era ancora incompleta.\n• Aggiunto un tour guidato del sito.\n• Migliorata la compatibilità con più browser.\n• Ottimizzato e riorganizzato il codice per rendere più facili gli aggiornamenti e la manutenzione futuri.\n\n• Questo dovrebbe essere l'ultimo aggiornamento del sito finché il server non torna online."
          },
          v120: {
            title: "Correzione di bug molto piccola",
            version: "Correzione di bug molto piccola - v1.2",
            summary:
              "• Corretto il caricamento infinito del Menu dei comandi.\n• Corretto l'ordine delle note di aggiornamento, dalla data più vecchia alla più recente."
          },
          v111: {
            title: "Rifiniture finali",
            version: "Rifiniture finali fino al rilascio completo - v1.1",
            summary:
              "• Aggiunta una scheda Comandi.\n• Aggiunta una sezione Info. Varie per le informazioni che non trovano posto altrove.\n• Aggiunti pulsanti Torna al menu in tutto il sito.\n• Aggiunta la sezione Fractured Underworld, anche se è ancora nelle prime fasi di sviluppo.\n• Iniziato il lavoro sul supporto e sulle informazioni di Difesa delle torri dentro Fractured Underworld.\n• Aggiunto un piccolo avviso nel Welcome Mat.\n• Corretto un bug dei waypoint.\n• Corretto un bug dell'interfaccia"
          },
          v100: {
            title: "Rilascio completo",
            version: "Rilascio completo - v1.0",
            summary:
              "• Aggiunti il Piano 3 e i suoi waypoint disponibili.\n• Le informazioni sulla missione principale dei Piani da 1 a 3 al momento mancano, quindi non sono ancora state aggiunte.\n• Alcuni waypoint del Piano 3 non funzionano di proposito, per mancanza di informazioni al momento.\n• Ottimizzato il codice in tutto il sito.\n• Iniziato e completato il Compendio equipaggiamento.\n• La maggior parte dei pulsanti è ora ordinata alfabeticamente.\n• Aggiornata e migliorata l'interfaccia del sito.\n• Ridisegnata la pagina iniziale del sito.\n• Aggiunti pulsanti che rimandano al Discord di SAO MC, al Discord di supporto e al mio profilo Discord personale.\n• Contattami su Discord per suggerimenti o segnalazioni di bug"
          },
          v010: {
            title: "Rilascio del sito",
            version: "v0.1.0 Alpha",
            summary:
              "Rilascio iniziale del sito. Aggiunti il Piano 1, le posizioni delle missioni secondarie, le posizioni dei biomi, le posizioni dei dungeon, il Menu delle missioni e il Menu del bestiario."
          },
          v020: {
            title: "Nuove mappe",
            version: "v0.2.0 Alpha",
            summary:
              "Aggiunti il Piano 2, i waypoint principali dei punti di interesse per il Piano 1 e il Piano 2, le interazioni con i waypoint che possono aprire il Bestiario o il Menu delle missioni, e la schermata del menu principale del sito."
          }
        },
        tags: {
          bugFixes: "Correzioni di bug",
          betaTestData: "Dati di test beta",
          characterBuild: "Build del personaggio",
          uiOverhaul: "Revisione dell'interfaccia",
          commands: "Comandi",
          maps: "Mappe",
          release: "Rilascio",
          localization: "Localizzazione",
          performance: "Prestazioni",
          compatibility: "Compatibilità",
          maintenance: "Manutenzione",
          miscInfo: "Info. Varie",
          fracturedUnderworld: "Fractured Underworld",
          towerDefense: "Difesa delle torri",
          welcomeMat: "Welcome Mat",
          floor3: "Piano 3",
          equipment: "Equipaggiamento",
          ui: "Interfaccia",
          discord: "Discord",
          contact: "Contatti",
          floor1: "Piano 1",
          quests: "Missioni",
          biomes: "Biomi",
          dungeons: "Dungeon",
          bestiary: "Bestiario",
          npcs: "PNG",
          floor2: "Piano 2",
          poi: "POI",
          waypoints: "Waypoint",
          mainMenu: "Menu principale",
          compendium: "Compendio"
        },
        loadError: "Impossibile caricare le note di aggiornamento. Aggiorna la pagina e riprova.",
        loadUnavailable: "Le note di aggiornamento al momento non sono disponibili."
      },
      characterBuild: {
        navBack: "Torna al menu",
        eyebrow: "AINCRAD / LABORATORIO DELLE BUILD",
        title: "Modalità Build del personaggio",
        browserTitle: "Modalità Build del personaggio | SAO MC Interactive Map",
        metaDescription:
          "Crea e visualizza in anteprima un personaggio di Aincrad con equipaggiamento e abilità di esempio.",
        subtitle:
          "Componi una dotazione, esamina le sue statistiche di combattimento ed esplora alberi delle abilità prototipo.",
        resetBuild: "Reimposta la build",
        configuration: "Configurazione della build",
        dataSource: "Fonte dei dati",
        currentData: "Dati attuali",
        betaData: "Dati di test beta",
        readingCurrent: "Lettura dal Compendio equipaggiamento dei Dati attuali.",
        buildSlot: "Slot della build",
        buildNumber: "Build {number}",
        level: "Livello",
        class: "Classe",
        loadout: "DOTAZIONE",
        equipment: "Equipaggiamento",
        slots: "{count} slot",
        armor: "Armature",
        accessories: "Accessori",
        weaponsOffhand: "Armi / Mano secondaria",
        characterSheet: "SCHEDA DEL PERSONAGGIO",
        stats: "Statistiche",
        statGroups: {
          itemStats: "Statistiche oggetto"
        },
        base: "Base statistica: {level}",
        placeholderPreview: "ANTEPRIMA PROTOTIPO",
        skillTree: "Albero delle abilità",
        sampleSkills: "Abilità prototipo",
        sampleSkillTree: "Albero delle abilità prototipo",
        placeholderNote:
          "Questi nodi prototipo mostrano una possibile progressione di classe; non sono dati definitivi sulle abilità.",
        equipmentSelector: "SELEZIONE EQUIPAGGIAMENTO",
        selectEquipment: "Seleziona equipaggiamento",
        closeEquipmentSelector: "Chiudi la selezione dell'equipaggiamento",
        searchItems: "Cerca oggetti",
        searchPlaceholder: "Cerca per nome o effetto...",
        rarity: "Rarità",
        allRarities: "Tutte le rarità",
        rune: "Runa",
        selected: "Selezionato",
        locked: "Bloccato",
        available: "Disponibile",
        selectSlot: "Seleziona {slot}",
        selectRune: "Seleziona la runa {number} di {slot}",
        runeSlots: "Slot runa di {slot}",
        equipped: "Equipaggiato",
        unavailable: "Non disponibile nei dati selezionati",
        emptySlot: "Slot vuoto",
        prototypeTree: "Albero prototipo",
        prototypeDataOnly: "Solo dati prototipo",
        requires: "Richiede: {value}",
        requiresAny: "Richiede almeno uno tra: {value}",
        effect: "Effetto: {value}",
        state: "Stato: {value}",
        none: "Nessuno",
        alreadyUnlocked: "Già sbloccata",
        readyToUnlock: "Pronta da sbloccare",
        requiresSkills: "Richiede {value}",
        requiresMorePoints: "Richiede {value}",
        skillPoints: "{class} · {remaining} / {total} punti abilità",
        skillPointsUnlimited: "{class} · {spent} spesi · Punti abilità illimitati",
        unlimitedSkillPoints: "Punti abilità illimitati",
        unlimitedSkillPointsHint:
          "Solo per test: sblocca le abilità senza spendere i punti abilità concessi dal tuo livello.",
        deselectDependent: "Deseleziona prima le abilità dipendenti.",
        noMatchingItems: "Nessun oggetto di tipo {slot} corrisponde a questi filtri al livello {level}.",
        weaponAlreadyEquipped: "Quest'arma è già equipaggiata nell'altro slot arma.",
        twoHanded: "A due mani",
        removeItem: "Rimuovi",
        offhandLocked: "Arma a due mani equipaggiata",
        removeOffhandFirst: "Rimuovi prima l'oggetto equipaggiato nella mano secondaria.",
        selectRuneFor: "Seleziona la runa {number} per {slot}",
        itemLevel: "Livello {level}",
        branchCore: "base",
        branchA: "ramo A",
        branchB: "ramo B",
        select: "Seleziona",
        walkthrough: {
          step1Title: "Build del personaggio",
          step1Body:
            "Configura qui un personaggio, l'equipaggiamento, il livello, la classe, le statistiche, le abilità e le altre informazioni della build.",
          step2Title: "Livello del personaggio",
          step2Body:
            "Cambiando il livello si aggiorna il livello mostrato e si ricalcolano le statistiche della build. Influisce anche su quale equipaggiamento è disponibile al livello scelto.",
          step3Title: "Equipaggiamento",
          step3Body:
            "Usa questa sezione della dotazione per scegliere l'equipaggiamento del personaggio tra i gruppi disponibili.",
          step4Title: "Slot dell'equipaggiamento",
          step4Body:
            "Ogni slot rappresenta un tipo di equipaggiamento, come armature, accessori, un'arma principale o un oggetto per la mano secondaria. Seleziona uno slot per sfogliare gli oggetti corrispondenti.",
          step5Title: "Selezione dell'equipaggiamento",
          step5Body:
            "La selezione elenca gli oggetti che corrispondono allo slot scelto. Usa la ricerca o seleziona un oggetto per equipaggiarlo; il tour guidato ha aperto questa finestra temporaneamente.",
          step6Title: "Filtro rarità",
          step6Body:
            "Usa Rarità per limitare gli oggetti mostrati nella selezione dell'equipaggiamento a una rarità specifica.",
          step7Title: "Statistiche",
          step7Body:
            "Statistiche mostra i valori calcolati per la build attuale, raggruppati in sezioni come Offensive e Difensive. Lo stato attuale delle sezioni pieghevoli resta invariato.",
          step8Title: "Albero delle abilità",
          step8Body:
            "Questo albero delle abilità prototipo mostra le abilità disponibili della classe, le loro relazioni, gli effetti e lo stato di sblocco attuale. I nodi delle abilità sono interattivi.",
          step9Title: "Slot della build",
          step9Body:
            "Scegli uno degli slot della build per lavorare su una configurazione separata. Build del personaggio salva automaticamente le modifiche nel browser.",
          step10Title: "Fonte dei dati",
          step10Body:
            "Dati attuali usa la fonte di equipaggiamento attuale. Dati di test beta è una fonte di dati beta separata e non è attiva finché non la selezioni.",
          step11Title: "Pronto per creare la build",
          step11Body:
            "Ora conosci le parti principali di Build del personaggio. Inizia a configurare il tuo personaggio quando vuoi."
        },
        classes: {
          archer: "Arciere / Ranger",
          assassin: "Assassino / DPS",
          guerrier: "Guerriero / Tank",
          mage: "Mago / Magia a distanza",
          "martial-artist": "Artista marziale / Mischia",
          shaman: "Sciamano / Supporto"
        },
        slotNames: {
          helmet: "Elmo",
          chestplate: "Corazza",
          leggings: "Gambali",
          boots: "Stivali",
          amulet: "Amuleto",
          "ring-1": "Anello 1",
          "ring-2": "Anello 2",
          bracelet: "Bracciale",
          glove: "Guanto",
          "artifact-1": "Artefatto 1",
          "artifact-2": "Artefatto 2",
          "artifact-3": "Artefatto 3",
          offhand: "Mano secondaria",
          "main-weapon": "Arma principale"
        },
        groupNames: {
          offensive: "Offensive",
          defensive: "Difensive",
          mobilityStamina: "Mobilità e stamina",
          healthRegeneration: "Salute e rigenerazione",
          specialEffects: "Effetti speciali"
        },
        statNames: {
          damage: "Danno",
          physicalDamage: "Danno fisico",
          weaponDamage: "Danno dell'arma",
          magicDamage: "Danno magico",
          skillDamage: "Danno delle abilità",
          projectileDamage: "Danno dei proiettili",
          attackSpeed: "Velocità d'attacco",
          criticalHitChance: "Probabilità di critico",
          criticalHitDamage: "Danno critico",
          skillCriticalHitChance: "Probabilità di critico delle abilità",
          skillCriticalHitDamage: "Danno critico delle abilità",
          defense: "Difesa",
          blockProficiency: "Competenza nella parata",
          blockPower: "Potenza di blocco",
          health: "Salute",
          evasion: "Evasione",
          damageReduction: "Riduzione del danno",
          fallDamageReduction: "Riduzione del danno da caduta",
          tenacity: "Tenacia",
          knockbackResistance: "Resistenza al contraccolpo",
          parryChance: "Probabilità di parata",
          haste: "Celerità",
          movementSpeed: "Velocità di movimento",
          crouchingSpeed: "Velocità accovacciato",
          mana: "Mana",
          stamina: "Stamina",
          lifeSteal: "Furto di vita",
          omnivamp: "Vampirismo totale",
          bonusHealing: "Cura bonus",
          healingPower: "Potenza di cura",
          healthRegeneration: "Rigenerazione della salute",
          manaRegeneration: "Rigenerazione del mana",
          staminaRegeneration: "Rigenerazione della stamina",
          flightOfLife: "Volo della vita"
        }
      }
    },
    argo: {
      launcherLabel: "Apri Argo, l'informatrice",
      title: "Argo, l'informatrice",
      closeLabel: "Chiudi Argo, l'informatrice",
      logLabel: "Conversazione con Argo",
      inputLabel: "Chiedi ad Argo informazioni sul gioco",
      inputPlaceholder: "Chiedi di mostri, bottino, oggetti, ricette, PNG, missioni o luoghi...",
      sendLabel: "Invia",
      dragHint: "Trascina la barra del titolo per spostare questa finestra",
      whoArgo: "Argo",
      whoYou: "Tu",
      intro: {
        1: "Ehi! Che informazioni ti servono? Chiedimi di oggetti, mostri, bottino, creazione, missioni, PNG o luoghi della mappa.",
        2: "Sono Argo. Dammi un nome - un oggetto, un mostro, una missione, un mercante - e frugherò nei registri.",
        3: "Di nuovo qui? Bene. Nomina qualcosa e ti dirò quello che so.",
        4: "L'informazione è un mestiere e io sono aperta. Cosa stai cercando?",
        5: "Beh, un cliente. Oggetti, mostri, bottino, missioni: tengo appunti su tutto.",
        6: "Argo mi chiamo e le risposte sono il mio mestiere. Chiedi pure.",
        7: "Hai un nome per me? Un luogo, un mostro, un pezzo di equipaggiamento: qualsiasi cosa abbia un registro dietro.",
        8: "Hm? Oh, sei tu. Vieni a comprare qualcosa o solo a chiacchierare? In ogni caso, chiedi.",
        9: "Tutto quello che vale la pena sapere ad Aincrad prima o poi passa dalle mie mani. Di cosa hai bisogno?",
        10: "Tu hai le domande e io ho gli appunti. Vediamo se combaciano."
      },
      facts: {
        item: {
          1: "Ecco cosa c'è scritto:",
          2: "Ecco cosa ho su questo:",
          3: "I registri dicono questo:"
        },
        recipe: {
          1: "Ecco la lista:",
          2: "Cosa serve:",
          3: "Ecco cosa è registrato:"
        },
        mob: {
          1: "Ecco cosa ho:",
          2: "La pagina dice questo:",
          3: "La voce recita così:"
        },
        mobDrops: {
          1: "Ecco la lista del bottino:",
          2: "Ecco cosa c'è annotato:",
          3: "Quello che ho dice questo:"
        },
        drop: {
          1: "Ecco chi lo tiene:",
          2: "Le liste dicono questo:",
          3: "Ecco cosa ho trovato:"
        },
        npc: {
          1: "Ecco cosa so:",
          2: "Ecco cosa c'è annotato:",
          3: "Gli appunti dicono questo:"
        },
        quest: {
          1: "Ecco il foglio:",
          2: "Ecco cosa c'è sopra:",
          3: "Il foglio dice questo:"
        },
        location: {
          1: "Ecco cosa è segnato:",
          2: "Ecco cosa ho:",
          3: "Gli appunti della mappa dicono questo:"
        }
      },
      type: {
        item: "Oggetto",
        mob: "Mostro",
        boss: "Boss",
        npc: "PNG",
        merchant: "Mercante",
        location: "Luogo",
        dungeon: "Dungeon",
        quest: "Missione"
      },
      help: {
        body: {
          1: "Chiedimi di oggetti ed equipaggiamento, mostri e boss, chi lascia cosa, ricette di creazione, missioni, PNG e mercanti, o luoghi della mappa. Dammi un nome e frugherò nei registri.",
          2: "Io tratto nomi: oggetti, equipaggiamento, mostri, boss, bottino, ricette, missioni, bottegai, luoghi. Dammene uno e ti dirò cosa so.",
          3: "Portami un nome - un mostro, un oggetto, una missione, un mercante, un punto sulla mappa - e controllerò i miei appunti.",
          4: "Mostri, bottino, oggetti, ricette, missioni, PNG, luoghi. Nomina uno di questi e lo cercherò per te."
        }
      },
      label: {
        floor: "Piano {floor}",
        level: "Liv. {level}",
        stats: "Statistiche",
        craftingLocation: "Luogo di creazione",
        craftingResources: "Risorse di creazione",
        droppedBy: "Lasciato da",
        drops: "Bottino",
        spawnArea: "Area di comparsa",
        mobs: "Mostri",
        rewards: "Ricompense",
        requirements: "Requisiti",
        npc: "PNG",
        sells: "Vende",
        quests: "Missioni",
        unknown: "sconosciuto",
        recordsFound: "{label}: {count}",
        moreRecords: "e altri {count} (su {total})",
        rankedBy: "{label} per {field}, {direction}:",
        highestFirst: "dal più alto",
        lowestFirst: "dal più basso",
        bestSource: "Miglior fonte registrata: {mob} ({chance}%)",
        levelField: "Livello",
        typeField: "Tipo",
        categoryField: "Categoria",
        questType: "Tipo di missione",
        bestiaryTab: "Elenco del bestiario",
        target: {
          quest: "Missioni",
          boss: "Boss",
          mob: "Mostri",
          item: "Oggetti",
          npc: "PNG",
          location: "Luoghi",
          dungeon: "Dungeon",
          area: "Aree"
        }
      },
      note: {
        itemRecordMissing: {
          1: "Su questo c'è più di quello che ho nei miei appunti. Per ora posso darti solo questo.",
          2: "È tutto quello che ho - i miei appunti su questo sono scarni.",
          3: "Ti ho dato quello che ho. Il resto non è scritto da nessuna parte che possa raggiungere."
        },
        bestiaryRecordMissing: {
          1: "Non ho nessuna pagina su questo nei miei appunti - solo quello che vedi qui.",
          2: "I miei appunti su questo iniziano e finiscono con quello che vedi.",
          3: "Quello è appena abbozzato. Quello che c'è sopra è tutto."
        },
        noDropRecord: {
          1: "Nessuno ha scritto cosa lascia, quindi non tiro a indovinare.",
          2: "Nessuna lista di bottino su questo - e non me le invento.",
          3: "Non ho nessuna lista di bottino per quello. Preferisco non dire niente che inventarmi qualcosa."
        },
        noRecipe: {
          1: "Non c'è nessuna ricetta scritta, quindi non posso dartene una.",
          2: "Non ho nessuna ricetta per quello.",
          3: "Nessuno ha registrato come si fa, e io non invento ricette."
        },
        noCraftingLocation: {
          1: "I miei appunti non dicono dove si crea o si vende.",
          2: "Nessuna bottega o mercante è annotato accanto a quello.",
          3: "Non posso dirti dove crearlo - quella parte è vuota nei miei appunti."
        },
        noStats: {
          1: "Non ci sono numeri scritti per questo.",
          2: "Nessuno ha registrato le sue statistiche.",
          3: "Non ho nessun valore per quello."
        },
        noSpawnArea: {
          1: "Non è annotata nessuna area di comparsa per questo.",
          2: "I miei appunti non dicono dove compare.",
          3: "Dove vive non è registrato."
        },
        markerNotFound: {
          1: "Non sono riuscita a individuarlo sulla mappa.",
          2: "Quel nome non è segnato da nessuna parte che riesca a vedere.",
          3: "Nessun segno sulla mappa per quello, quindi non posso indicarti la strada."
        },
        questMarkerOnly: {
          1: "Tutto quello che ho è il suo segno sulla mappa, non i dettagli della missione.",
          2: "È scritta solo la sua posizione, non il resto del lavoro.",
          3: "La mappa lo conosce. I miei appunti sulla missione in sé sono vuoti."
        },
        absenceNotProof: {
          1: "Non è una prova che non sia nel gioco - solo che non ce l'ho nei miei appunti.",
          2: "Non prenderlo come prova che non esista. Significa solo che non l'ho annotato.",
          3: "Che io non lo conosca non è la stessa cosa che non esista."
        },
        otherIsland: {
          1: "Quello è su un'isola diversa da quella che stai guardando.",
          2: "Quello appartiene a un'altra isola - tu ne stai vedendo una diversa.",
          3: "Un'isola del tutto diversa, quello."
        },
        englishOnly: {
          1: "Avviso: io leggo le domande in inglese, con qualche parola di spagnolo e francese - tieni i nomi in inglese e ci capiremo.",
          2: "Leggo la domanda in inglese e riconosco qualche parola spagnola o francese, ma i nomi è meglio tenerli in inglese.",
          3: "Le domande le leggo in inglese e raccolgo un po' di spagnolo e francese, ma con i nomi è più sicuro l'inglese."
        },
        floorInferred: {
          1: "Quel registro è al Piano {floor}.",
          2: "Quello l'ho annotato sotto il Piano {floor}.",
          3: "Lo trovi al Piano {floor} nei miei appunti."
        },
        otherFloorRecords: {
          1: "Altri {count} sono registrati su {floors}.",
          2: "Ce ne sono altri {count} su {floors}, se mai andrai da quelle parti.",
          3: "I miei appunti ne tengono altri {count} su {floors}."
        },
        rankingUnknown: {
          1: "{count} di questi non hanno un valore registrato, quindi non li metto in classifica.",
          2: "Altri {count} non hanno nessun numero annotato, quindi li ho lasciati fuori invece di indovinare.",
          3: "Altri {count} non hanno niente di registrato, quindi non sono nella lista."
        },
        chanceNotRecorded: {
          1: "Alcune di quelle percentuali non sono scritte da nessuna parte.",
          2: "Non tutte le fonti hanno una percentuale registrata - io passo solo quello che è scritto.",
          3: "Dove la percentuale non è registrata, l'ho lasciata fuori invece di indovinare."
        },
        noRecordedRate: {
          1: "Nessuno ha scritto una probabilità di drop per nessuna di quelle fonti.",
          2: "Ho le fonti, ma nemmeno una percentuale, quindi non posso dire che una sia la migliore.",
          3: "Le fonti sono registrate; le percentuali no."
        },
        comparisonTruncated: {
          1: "Non sono tutti i campi - in totale sono {count}.",
          2: "Ci sono {count} campi in tutto; ho mostrato i primi.",
          3: "La lista completa arriva a {count} campi."
        }
      },
      status: {
        ambiguous: {
          1: "Hm, potrebbero essere diverse cose. Quale intendevi?",
          2: "Aspetta - ho più di una corrispondenza per questo:",
          3: "Quel nome fa doppio servizio. Quale?",
          4: "Hm, mi hai dato un nome che va bene per più di una cosa:",
          5: "Attenzione - potrebbe essere uno di questi:",
          6: "Ho diverse voci sotto quel nome. Scegli tu:",
          7: "Non è abbastanza preciso per i miei appunti. Quale di questi?",
          8: "Più di una cosa risponde a quel nome. Quale?"
        },
        missing: {
          1: "Hm, ho trovato il nome ma non i dettagli.",
          2: "Ne ho solo una parte.",
          3: "Il nome lo conosco, ma i miei appunti finiscono lì.",
          4: "Quello è scritto solo a metà nel mio libro.",
          5: "Ho il nome e poco altro.",
          6: "Hm, quello è scarno. Ecco cosa ho.",
          7: "Ne ho un pezzo, non tutto.",
          8: "I miei appunti su quello sono incompleti. Ecco cosa c'è."
        },
        unsupported: {
          1: "Hm, non ho ancora una pista affidabile su quello.",
          2: "Quello è fuori dai miei registri, mi dispiace.",
          3: "Non è il tipo di cosa su cui tengo appunti.",
          4: "Non posso aiutarti con quello - non è nel mio campo.",
          5: "Hm, va oltre quello che tratto.",
          6: "Su quello non ho niente, e non me lo invento.",
          7: "Quello è fuori dal mio mestiere, temo.",
          8: "Nessun registro su quello. Prova con qualcosa del gioco."
        },
        candidates: {
          1: "Candidati:",
          2: "Ecco cosa è saltato fuori:",
          3: "Possibili corrispondenze:"
        },
        emptySet: {
          1: "Su questo piano non c'è niente che corrisponda.",
          2: "Quella lista è rimasta vuota, temo.",
          3: "Ho passato in rassegna tutta la lista - qui non c'è niente che corrisponda."
        },
        sourcesAvailable: "Su questa pagina riesco a vedere solo: {sources}.",
        noSources: "Non riesco ancora a vedere nessun registro di gioco su questa pagina.",
        engineMissing: {
          1: "I miei registri non sono ancora caricati su questa pagina, quindi qui non posso cercare niente.",
          2: "Non ho appunti con me su questa pagina. Prova dove sono caricati i miei registri.",
          3: "Il mio libro non è su questa pagina, quindi non c'è niente da controllare.",
          4: "Qui non c'è niente con cui lavorare - i miei registri non sono ancora caricati su questa pagina."
        },
        datasetUnsupported: {
          1: "Eh, ormai tratto solo i Dati attuali. Passa il set di dati ai Dati attuali e vedrò cosa posso trovarti.",
          2: "I miei appunti ora coprono solo i Dati attuali. Passa ai Dati attuali e chiedimi di nuovo.",
          3: "Solo Dati attuali - questa è la mia regola. Cambia il set di dati e frugherò in quello che ho.",
          4: "Da me non avrai risposte sui Dati di test beta; io lavoro sui Dati attuali. Cambia il set di dati e darò un'altra occhiata."
        },
        error: {
          1: "Qualcosa si è inceppato nei miei archivi. Prova a chiedermelo di nuovo?",
          2: "Hm, i miei appunti si sono sparpagliati. Chiedimelo di nuovo?",
          3: "Quello si è perso per strada verso la mia scrivania. Riprova?",
          4: "Qualcosa si è ingarbugliato nei miei appunti. Riprova?"
        }
      },
      close: {
        1: "Questo viene dritto dai registri.",
        2: "Tutto solido - l'ho controllato.",
        3: "Qui dentro non c'è niente di indovinato.",
        4: "Su questo puoi metterci la mano sul fuoco.",
        5: "Ogni riga è scritta da qualche parte.",
        6: "Questo è tutto quello che è registrato.",
        7: "Affidabile, questo. Io non passo pettegolezzi.",
        8: "Questo viene dalla fonte, non dalle chiacchiere.",
        9: "Buona informazione, questa. Vale il prezzo.",
        10: "Questo dicono i registri, e loro non mi mentono.",
        11: "Informazione pulita. Goditela.",
        12: "Questo è confermato, non sentito dire.",
        collection: {
          1: "Questo è l'insieme, completo come lo hanno i registri.",
          2: "Ognuno di quelli è annotato - niente aggiunto.",
          3: "Se non è in quella lista, nemmeno i registri lo conoscono.",
          4: "Questi sono tutti. Buona caccia."
        },
        ranking: {
          1: "Ecco come i registri li mettono in fila.",
          2: "L'ordine è quello dei registri, non la mia opinione.",
          3: "Ecco la classifica come la mettono i registri.",
          4: "Queste sono le posizioni, dritte dalla pagina."
        },
        comparison: {
          1: "Entrambe le voci sono dei registri - trai tu le conclusioni.",
          2: "Eccoli entrambi, campo per campo.",
          3: "Niente di nascosto in quella tabella.",
          4: "Giudica da te - i numeri sono tutti lì."
        },
        farming: {
          1: "Quelle sono le fonti registrate, con le probabilità migliori per prime.",
          2: "Le percentuali sono dei registri; il resto è la tua fortuna.",
          3: "Ecco dove lascia il bottino, per quanto ne sanno i miei appunti.",
          4: "Buona fortuna là fuori - questo è tutto quello che tengono gli appunti."
        }
      },
      lead: {
        item: {
          1: "Oho, ho trovato una pista!",
          2: "Vediamo cosa dicono i registri su questo.",
          3: "Ho il fascicolo proprio qui.",
          4: "Quello mi dice qualcosa. Dammi un momento.",
          5: "Le domande sull'equipaggiamento sono il mio pane.",
          6: "Hm, fammi controllare i miei appunti su questo.",
          7: "Sei fortunato - ho una pagina su questo.",
          8: "Un oggetto, eh? Mi piace quando la gente chiede cose che posso davvero nominare.",
          9: "Scaviamo. Gli oggetti lasciano tracce di carta, e la carta la tengo io.",
          10: "Ho venduto informazioni peggiori per dei buoni Col. Questa è gratis.",
          11: "Bene, quel nome mi è familiare.",
          12: "Vediamo cosa ho scritto.",
          13: "Oho, chiedi della roba buona.",
          14: "Aspettavo che qualcuno me lo chiedesse.",
          15: "Certo, quello lo conosco.",
          16: "Hm, quel nome è da qualche parte nel mio libro.",
          17: "Fammi girare alla pagina giusta.",
          18: "Vuoi i dettagli? Io ho i dettagli.",
          19: "Questo sì che è un nome che vale la pena cercare.",
          20: "Vediamo quanto posso dirti."
        },
        recipe: {
          1: "Ah, una domanda da artigiano. Mi piace.",
          2: "Fammi scovare quella ricetta.",
          3: "Ecco cosa elencano i registri per questo.",
          4: "Stai creando qualcosa, eh? Fammi controllare.",
          5: "Hm, le ricette le tengo in ordine.",
          6: "Vediamo cosa serve per quello.",
          7: "Bene, troviamo i materiali.",
          8: "Un artigiano con Col da spendere. Bene.",
          9: "Fammi vedere cosa dicono i registri che serve.",
          10: "Quello ha una ricetta, ne sono quasi sicura.",
          11: "Fammi tirare su la lista.",
          12: "Hm, fammi controllare cosa serve per quello."
        },
        mob: {
          1: "Oho, una domanda da cacciatore.",
          2: "Vediamo cosa dice il Bestiario.",
          3: "Ho una pagina su questo.",
          4: "Un mostro, hm? Quelli lasciano un sacco di tracce.",
          5: "Sei a caccia, eh? Fammi controllare.",
          6: "Quello ha una brutta reputazione, se ricordo bene.",
          7: "Vediamo cosa dicono i registri su quella bestia.",
          8: "In molti me lo chiedono. Fammi prendere gli appunti.",
          9: "Hm, quel nome lo conosco.",
          10: "Fammi cercare cosa ho su questo.",
          11: "Una domanda da cacciatore. La mia preferita.",
          12: "Bene, quello. Dammi un secondo.",
          13: "Vediamo dove vive e con cosa colpisce.",
          14: "Tengo appunti su tutto quello che ha i denti. Fammi controllare.",
          15: "Questo è un nome che ho sentito più di una volta.",
          16: "Fammi vedere cosa ho scritto su questo.",
          17: "Attenzione con quello - o no, è il tuo collo. Ecco cosa so.",
          18: "Hm, fammi frugare tra le pagine del Bestiario.",
          19: "I mostri sono affari facili. Sono sempre da qualche parte.",
          20: "Vediamo se è cattivo come dicono."
        },
        mobDrops: {
          1: "Ah, una domanda da saccheggiatore!",
          2: "Vediamo cosa lascia.",
          3: "Ecco la lista del bottino che ho.",
          4: "Vuoi frugargli le tasche, eh? Sensato.",
          5: "Vediamo cosa cade da quello.",
          6: "Hm, le liste del bottino le tengo.",
          7: "Vuoi sapere cosa porta addosso. Giusto.",
          8: "Fammi controllare la lista. Queste non le indovino.",
          9: "Quello vale la pena cacciarlo per un motivo.",
          10: "Bene, vediamo cosa lascia dietro di sé.",
          11: "Uccidilo, prendi le sue cose. Sono affari.",
          12: "Fammi vedere cosa ho registrato per quello.",
          13: "Hm, fammi controllare cosa c'è nella lista.",
          14: "Vediamo se vale il tuo tempo."
        },
        drop: {
          1: "Oho, segui una pista di bottino?",
          2: "Vediamo chi lo tiene.",
          3: "Ho frugato nelle liste del bottino per quello.",
          4: "Cerchi da dove viene? Intelligente.",
          5: "Fammi controllare chi lo porta.",
          6: "Hm, quello è un bottino, eh?",
          7: "Qualcuno ce l'ha. Scopriamo chi.",
          8: "Le liste del bottino le tengo in ordine. Dammi un momento.",
          9: "Bene, risaliamo la pista.",
          10: "Fammi vedere quali mostri lo tengono.",
          11: "Dai la caccia a un bottino, eh? Farei lo stesso.",
          12: "Hm, fammi vedere cosa è registrato.",
          13: "Quello non cresce sugli alberi. Fammi guardare.",
          14: "Vediamo chi è abbastanza generoso da mollarlo."
        },
        npc: {
          1: "Chiedi in giro e trovi gente. Fammi controllare.",
          2: "Vediamo dove puoi trovarli.",
          3: "Ho una pista su quello.",
          4: "Cerchi qualcuno? Fammi controllare i miei appunti.",
          5: "Hm, la gente si sposta. Fammi guardare.",
          6: "Bene, vediamo dove hanno aperto bottega.",
          7: "Conosco quasi tutti i bottegai. Fammi guardare.",
          8: "Fammi vedere cosa ho su di loro.",
          9: "Hm, fammi controllare dove sono.",
          10: "Mercanti e girovaghi: tengo traccia di entrambi.",
          11: "Fammi vedere se posso indirizzarti da loro.",
          12: "Bene, troviamoli."
        },
        quest: {
          1: "Ah, una pista per una missione.",
          2: "Diamo un'occhiata al foglio della missione.",
          3: "Ecco cosa ho su quella missione.",
          4: "Lavoro, eh? Fammi controllare il tabellone.",
          5: "Hm, quello è in giro a chiedere aiuto.",
          6: "Fammi vedere cosa ho scritto.",
          7: "Una missione, hm? Su quelle tengo appunti accurati.",
          8: "Bene, vediamo chi la assegna.",
          9: "Qualcuno vuole che si faccia qualcosa. Fammi controllare.",
          10: "Ho appunti su quasi tutte queste.",
          11: "Vediamo i dettagli prima che tu accetti il lavoro.",
          12: "Hm, fammi tirare fuori quel foglio.",
          13: "Il lavoro paga. Vediamo quanto vale.",
          14: "Vediamo la ricompensa prima di impegnarti."
        },
        location: {
          1: "Oho, vuoi orientarti sul territorio?",
          2: "Vediamo dove si trova.",
          3: "Quello ce l'ho segnato sulla mappa.",
          4: "Indicazioni, eh? Le indicazioni le so fare.",
          5: "Fammi controllare gli appunti della mappa.",
          6: "Hm, quello è un luogo, eh? Fammi guardare.",
          7: "Immagino che vorrai le coordinate.",
          8: "Bene, troviamolo sulla mappa.",
          9: "Conosco questi piani meglio di molti altri.",
          10: "Fammi vedere cosa è segnato laggiù.",
          11: "I luoghi di solito riesco a individuarli. Proviamo.",
          12: "Hm, fammi controllare i miei appunti sulla mappa.",
          13: "Abbastanza facile - se i miei appunti sono giusti.",
          14: "Vediamo cosa c'è da quelle parti."
        },
        collection: {
          1: "{label}? Ne ho {count} registrati - eccoli tutti.",
          2: "Una rassegna completa di {label}, eh? {count} nomi, e nemmeno uno indovinato.",
          3: "Lo scaffale dei {label}, eh? {count}, tutti controllati.",
          4: "Cerchi la lista dei {label}. {count} - leggiamoli.",
          5: "Ah, sfogli tutto lo scaffale. {count} {label}, arrivano subito.",
          6: "Bene, fammi tirare fuori il fascicolo dei {label}. {count} - dai un'occhiata."
        },
        ranking: {
          1: "Vediamo chi viene fuori in testa.",
          2: "Una classifica, eh? Questo è il mio tipo di domanda.",
          3: "I numeri non discutono. Mettiamoli in fila.",
          4: "Fammeli ordinare come fanno i registri.",
          5: "Vuoi la cima della lista. Diamo un'occhiata.",
          6: "Oho, soppesiamo il campo. Le classifiche mi piacciono."
        },
        comparison: {
          1: "Uno accanto all'altro, allora. Vediamo come si misurano.",
          2: "Mettiamo quei due vicini - ecco il quadro.",
          3: "Un confronto? Giusto, mettiamoli in fila.",
          4: "Stendiamoli e vediamo chi cede per primo.",
          5: "Due registri, una tabella. Dai un'occhiata.",
          6: "Vuoi pesarli uno contro l'altro. Ecco cosa tengono i registri."
        },
        farming: {
          1: "Lo stai cacciando, eh? Troviamo le probabilità migliori.",
          2: "Una domanda da raccolta. È il tipo pratico - approvo.",
          3: "Quindi lo vuoi in quantità. Ecco da dove viene.",
          4: "Vediamo chi lo lascia e con che frequenza.",
          5: "Ah, una domanda sulle scorte. Il mio tipo di affare preferito.",
          6: "Allora ti servono le fonti. Fammi scovarle."
        }
      }
    }
  });

  const api = {
    DEFAULT_LANGUAGE,
    SUPPORTED_LANGUAGES,
    SUPPORTED_LANGUAGE_CHOICES,
    getSupportedLanguages,
    getSettings: () => Object.assign({}, settingsState),
    updateSettings(patch) {
      saveSettings(patch);
      applyTranslations(document);
      document.dispatchEvent(
        new CustomEvent("sao:settingschange", {
          detail: { settings: Object.assign({}, settingsState) }
        })
      );
    },
    getLanguage,
    getLanguageLabel,
    getLanguageText,
    setLanguage,
    t,
    content,
    getMissingContentKeys: () => Array.from(missingContentKeys),
    applyTranslations,
    onSettingsChange,
    mountSettingsMenu,
    resetWalkthroughProgress
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
