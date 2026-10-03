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
  const SUPPORTED_LANGUAGES = ["en", "es", "fr"];
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
          loading: "Loading..."
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
        betaDescription: "THIS INFO IS FROM BETA TESTS. INFORMATION MAY BE OFF.",
        currentDescription:
          "THIS INFO IS ACTIVELY BEING UPDATED. IF YOU CANNOT FIND SOMETHING, PLEASE CHECK 'BETA-TEST DATA' FOR IT UNTIL WE GET THE INFO FOR IT.",
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
          guildLabel: "Guild: N/A",
          guildAria: "Guild tribute",
          discordModalTitle: "Links",
          discordModalCloseAria: "Close links menu",
          discordModalBody: "Choose where you'd like to go next.",
          creatorDiscord: "Website Creator Discord",
          saoDiscord: "SAO MC Discord",
          supportWebsite: "SAO MC Support Website",
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
              "Right-click the map to open the map action menu. This menu contains the available map actions and tools."
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
          loading: "Cargando..."
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
          guildLabel: "Gremio: N/D",
          guildAria: "Tributo al gremio",
          discordModalTitle: "Enlaces",
          discordModalCloseAria: "Cerrar menú de enlaces",
          discordModalBody: "Elige a donde quieres ir.",
          creatorDiscord: "Discord del creador",
          saoDiscord: "Discord de SAO MC",
          supportWebsite: "Sitio web de soporte de SAO MC",
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
          loading: "Chargement..."
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
          guildLabel: "Guilde : N/D",
          guildAria: "Hommage a la guilde",
          discordModalTitle: "Liens",
          discordModalCloseAria: "Fermer le menu des liens",
          discordModalBody: "Choisissez votre prochaine destination.",
          creatorDiscord: "Discord du createur",
          saoDiscord: "Discord SAO MC",
          supportWebsite: "Site web d'assistance SAO MC",
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
            importDuplicates: "{count} JourneyMap waypoints were already imported.",
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
            countdownRemaining: "{seconds}s remaining",
            deleteConfirm: "Delete this custom waypoint?",
            deleted: "Custom waypoint deleted."
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
            importDuplicates: "{count} JourneyMap waypoints were already imported.",
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
              "Right-click the map to open the map action menu. This menu contains the available map actions and tools."
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
            floor2: "Floor 2",
            poi: "POI",
            waypoints: "Waypoints",
            mainMenu: "Main Menu"
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
          loadUnavailable: "Los datos del bestiario no están disponibles en este momento.",
          notice:
            "La mayor parte del contenido de esta página todavía no está traducida porque el sitio lo mantiene una sola persona con poco tiempo."
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
          notice:
            "La mayor parte del contenido de esta página todavía no está traducida porque el sitio lo mantiene una sola persona con poco tiempo."
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
          loadUnavailable: "Los datos de equipamiento no están disponibles en este momento.",
          notice:
            "La mayor parte del contenido de esta página todavía no está traducida porque el sitio lo mantiene una sola persona con poco tiempo."
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
          loadedStatus: "{count} entradas de misiones cargadas para {floor}.",
          notice:
            "La mayor parte del contenido de esta página todavía no está traducida porque el sitio lo mantiene una sola persona con poco tiempo."
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
              "Haz clic derecho en el mapa para abrir el menú de acciones. Este menú contiene las acciones y herramientas disponibles para el mapa."
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
            importDuplicates: "Estos {count} puntos de ruta de JourneyMap ya se habían importado.",
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
          customWaypoint: {
            category: "Marcadores personalizados",
            createTitle: "Crear punto de ruta personalizado",
            nameLabel: "Nombre del punto de ruta",
            descriptionLabel: "Descripción del punto de ruta",
            coordinatesLabel: "Coordenadas",
            xLabel: "X",
            zLabel: "Z",
            buttonDefault: "Predeterminado",
            createButton: "Crear un botón",
            buttonNameLabel: "Nombre del botón",
            logoLabel: "Icono personalizado",
            logoPin: "Pin",
            logoStar: "Estrella",
            logoFlag: "Bandera",
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
            countdownRemaining: "Quedan {seconds}s",
            deleteConfirm: "¿Eliminar este punto de ruta personalizado?",
            deleted: "Punto de ruta personalizado eliminado."
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
            importDuplicates: "Estos {count} puntos de ruta de JourneyMap ya se habían importado.",
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
              "Haz clic derecho en el mapa para abrir el menú de acciones. Este menú contiene las acciones y herramientas disponibles para el mapa."
          },
          runtimeError: "El mapa no se pudo cargar en este momento. Actualiza la página e inténtalo de nuevo.",
          runtimeTitle: "Mapa no disponible",
          coordinatesPlaceholder: "X: -- Z: --",
          notice:
            "La mayor parte del contenido de esta página todavía no está traducida porque el sitio lo mantiene una sola persona con poco tiempo."
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
            floor2: "Piso 2",
            poi: "POI",
            waypoints: "Waypoints",
            mainMenu: "Menú principal"
          }
        },
        towerdefense: {
          notice:
            "La mayor parte del contenido de esta página todavía no está traducida porque el sitio lo mantiene una sola persona con poco tiempo.",
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
          loadUnavailable: "Les données du bestiaire ne sont actuellement pas disponibles.",
          notice:
            "La majeure partie du contenu de cette page n'est pas encore traduite, car le site est géré par une seule personne avec peu de temps."
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
          notice:
            "La majeure partie du contenu de cette page n'est pas encore traduite, car le site est géré par une seule personne avec peu de temps."
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
          loadUnavailable: "Les données d'équipement ne sont actuellement pas disponibles.",
          notice:
            "La majeure partie du contenu de cette page n'est pas encore traduite, car le site est géré par une seule personne avec peu de temps."
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
          loadedStatus: "{count} entrées de quête chargées pour {floor}.",
          notice:
            "La majeure partie du contenu de cette page n'est pas encore traduite, car le site est géré par une seule personne avec peu de temps."
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
              "Fais un clic droit sur la carte pour ouvrir le menu d'actions. Ce menu contient les actions et outils disponibles pour la carte."
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
            importDuplicates: "Ces {count} points de passage JourneyMap ont déjà été importés.",
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
          customWaypoint: {
            category: "Marqueurs personnalisés",
            createTitle: "Créer un point de passage personnalisé",
            nameLabel: "Nom du point de passage",
            descriptionLabel: "Description du point de passage",
            coordinatesLabel: "Coordonnées",
            xLabel: "X",
            zLabel: "Z",
            buttonDefault: "Par défaut",
            createButton: "Créer un bouton",
            buttonNameLabel: "Nom du bouton",
            logoLabel: "Icône personnalisée",
            logoPin: "Repère",
            logoStar: "Étoile",
            logoFlag: "Drapeau",
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
            countdownRemaining: "{seconds}s restantes",
            deleteConfirm: "Supprimer ce point de passage personnalisé ?",
            deleted: "Point de passage personnalisé supprimé."
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
            importDuplicates: "Ces {count} points de passage JourneyMap ont déjà été importés.",
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
              "Fais un clic droit sur la carte pour ouvrir le menu d'actions. Ce menu contient les actions et outils disponibles pour la carte."
          },
          runtimeError: "La carte n'a pas pu être chargée pour le moment. Actualise la page et réessaie.",
          runtimeTitle: "Carte indisponible",
          coordinatesPlaceholder: "X : -- Z : --",
          notice:
            "La majeure partie du contenu de cette page n'est pas encore traduite, car le site est géré par une seule personne avec peu de temps."
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
            floor2: "Étage 2",
            poi: "POI",
            waypoints: "Waypoints",
            mainMenu: "Menu principal"
          }
        },
        towerdefense: {
          notice:
            "La majeure partie du contenu de cette page n'est pas encore traduite, car le site est géré par une seule personne avec peu de temps.",
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
      betaDescription: "ESTA INFORMACIÓN PROVIENE DE PRUEBAS BETA. PUEDE NO SER PRECISA.",
      currentDescription:
        "ESTA INFORMACIÓN SE ESTÁ ACTUALIZANDO. SI NO ENCUENTRAS ALGO, CONSULTA «DATOS DE PRUEBA BETA» HASTA QUE OBTENGAMOS LA INFORMACIÓN.",
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
      betaDescription: "CES INFORMATIONS PROVIENNENT DE TESTS BÊTA. ELLES PEUVENT ÊTRE INCORRECTES.",
      currentDescription:
        "CES INFORMATIONS SONT ACTIVEMENT MISES À JOUR. SI VOUS NE TROUVEZ PAS QUELQUE CHOSE, CONSULTEZ LES « DONNÉES DE TEST BÊTA » EN ATTENDANT LES INFORMATIONS.",
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
          effect: "Effect: {value}",
          state: "State: {value}",
          none: "None",
          alreadyUnlocked: "Already unlocked",
          readyToUnlock: "Ready to unlock",
          requiresSkills: "Requires {value}",
          deselectDependent: "Deselect dependent skills first.",
          noMatchingItems: "No {slot} items match these filters at level {level}.",
          weaponAlreadyEquipped: "This weapon is already equipped in the other weapon slot.",
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
          effect: "Efecto: {value}",
          state: "Estado: {value}",
          none: "Ninguno",
          alreadyUnlocked: "Ya desbloqueada",
          readyToUnlock: "Lista para desbloquear",
          requiresSkills: "Requiere {value}",
          deselectDependent: "Quita primero las habilidades dependientes.",
          noMatchingItems: "Ningún objeto de {slot} coincide con estos filtros en el nivel {level}.",
          weaponAlreadyEquipped: "Esta arma ya está equipada en el otro espacio de arma.",
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
          effect: "Effet : {value}",
          state: "État : {value}",
          none: "Aucun",
          alreadyUnlocked: "Déjà débloquée",
          readyToUnlock: "Prête à débloquer",
          requiresSkills: "Nécessite {value}",
          deselectDependent: "Désélectionnez d'abord les compétences dépendantes.",
          noMatchingItems: "Aucun objet de {slot} ne correspond à ces filtres au niveau {level}.",
          weaponAlreadyEquipped: "Cette arme est déjà équipée dans l'autre emplacement d'arme.",
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
    languagesText: "English, Español, and Français are available through the shared language system.",
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
    languagesText: "English, Español y Français están disponibles mediante el sistema de idiomas compartido.",
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
    languagesText: "English, Español et Français sont disponibles via le système de langues partagé.",
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
    v160: {
      version: "Map Tools & Waypoint Update - v1.6",
      title: "Map Tools & Waypoint Update",
      summary:
        "• Added Custom Waypoints, letting users create custom categories and waypoints, choose category colors, and manage points directly from the map. More custom points may increase site lag.\n• Added JourneyMap waypoint import and export, organized into categories by waypoint type/category, plus a Map Actions tutorial button that opens the YouTube tutorial directly.\n• Added a Distance Calculator to the map right-click menu. Set Point 1 and Point 2 to calculate distance from converted Minecraft world X/Z coordinates; results stay correct through zooming, panning, and resizing.\n• Added external tutorial links to dungeon information popups, including a test Fallen Labyrinth Dungeon tutorial, without changing existing dungeon coordinates or floor data.\n• Added Step 5 to the Aincrad and Fractured Underworld walkthroughs, temporarily opening the actual Map Actions menu centered and highlighted; it closes and returns to normal behavior when leaving the step.\n• Added a divider before the Map Actions tutorial button and let the menu grow naturally so the button stays within its bounds.\n• Removed the stray tilde-like character from the World Hub welcome screen."
    },
    currentImprovements: {
      version: "Current Improvements",
      title: "Maps, Character Build & Site Improvements",
      summary:
        "• Corrected map coordinate placement and waypoint positioning.\n• Improved Character Build calculations, equipment and stat displays, build selection, and reset controls.\n• Expanded French and Spanish translations and corrected mixed-language text.\n• Updated guided walkthroughs, including Character Build's level controls, and improved the Welcome Mat warning with a Skip option after repeated visits and a responsive layout.\n• Refined page layouts and fixed other visual issues."
    }
  });
  Object.assign(translations.es.page.patchnotes.entries, {
    v160: {
      version: "Actualización de herramientas del mapa y puntos de ruta - v1.6",
      title: "Actualización de herramientas del mapa y puntos de ruta",
      summary:
        "• Se añadieron los puntos de ruta personalizados, que permiten crear categorías y puntos propios, elegir colores para las categorías y administrar los puntos directamente desde el mapa. Tener más puntos personalizados puede aumentar la lentitud del sitio.\n• Se añadió la importación y exportación de puntos de JourneyMap, organizados en categorías según el tipo o la categoría del punto, junto con un botón de tutorial en Acciones del mapa que abre directamente el tutorial de YouTube.\n• Se añadió una calculadora de distancia al menú del mapa con clic derecho. Define el Punto 1 y el Punto 2 para calcular la distancia usando las coordenadas X/Z convertidas del mundo de Minecraft; el resultado sigue siendo correcto al acercar, alejar, desplazar o cambiar el tamaño del mapa.\n• Se añadieron enlaces externos a tutoriales en las ventanas de información de las mazmorras, incluido un enlace de prueba para la mazmorras Fallen Labyrinth, sin modificar sus coordenadas ni los datos de pisos existentes.\n• Se añadió el Paso 5 a los recorridos guiados de Aincrad y Underworld Fragmentado. Abre temporalmente el menú real de Acciones del mapa, centrado y resaltado; al salir del paso, se cierra y vuelve al comportamiento normal.\n• Se añadió un separador antes del botón del tutorial de Acciones del mapa y el menú ahora crece para mantener el botón dentro de sus límites.\n• Se eliminó el carácter similar a una tilde que sobraba en la pantalla de bienvenida de World Hub."
    },
    currentImprovements: {
      version: "Mejoras recientes",
      title: "Mejoras en mapas, Character Build y el sitio",
      summary:
        "• Se corrigieron la ubicación de coordenadas y el posicionamiento de los puntos de ruta del mapa.\n• Se mejoraron los cálculos de Character Build, la visualización del equipo y las estadísticas, la selección de configuraciones y los controles de reinicio.\n• Se ampliaron las traducciones al francés y al español y se corrigieron textos que mezclaban idiomas.\n• Se actualizaron los recorridos guiados, incluida la sección de controles de nivel de Character Build, y se mejoró el aviso de bienvenida con la opción Omitir tras varias visitas y un diseño adaptable.\n• Se ajustaron los diseños de las páginas y se corrigieron otros problemas visuales."
    }
  });
  Object.assign(translations.fr.page.patchnotes.entries, {
    v160: {
      version: "Mise à jour des outils de carte et des points de passage - v1.6",
      title: "Mise à jour des outils de carte et des points de passage",
      summary:
        "• Ajout des points de passage personnalisés : création de catégories et de points, choix de couleurs pour les catégories et gestion des points directement depuis la carte. Un grand nombre de points personnalisés peut ralentir le site.\n• Ajout de l'importation et de l'exportation des points JourneyMap, classés par type ou catégorie, ainsi que d'un bouton de tutoriel dans Actions de la carte qui ouvre directement le tutoriel YouTube.\n• Ajout d'une calculatrice de distance au menu contextuel de la carte. Définis le Point 1 et le Point 2 pour calculer la distance à partir des coordonnées X/Z converties du monde Minecraft ; le résultat reste correct après zoom, déplacement ou redimensionnement de la carte.\n• Ajout de liens externes vers des tutoriels dans les fenêtres d'information des donjons, dont un lien de test pour le donjon Fallen Labyrinth, sans modifier les coordonnées ni les données d'étage existantes.\n• Ajout de l'étape 5 aux visites guidées d'Aincrad et de l'Underworld Fracturé. Elle ouvre temporairement le véritable menu Actions de la carte, centré et mis en évidence ; il se ferme et reprend son comportement normal en quittant l'étape.\n• Ajout d'un séparateur avant le bouton de tutoriel des Actions de la carte ; le menu s'agrandit naturellement pour garder le bouton dans ses limites.\n• Suppression du caractère ressemblant à un tilde qui apparaissait sur l'écran d'accueil de World Hub."
    },
    currentImprovements: {
      version: "Améliorations récentes",
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
    return lookup(getBundle(language), "languageName") || String(language || "").toUpperCase();
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

    if (value === undefined && normalizedKey.endsWith(".translationNotice")) {
      const noticeKey = normalizedKey.replace(/\.translationNotice$/, ".notice");
      value = noticeKey
        .split(".")
        .reduce(
          (result, part) => (result && Object.prototype.hasOwnProperty.call(result, part) ? result[part] : undefined),
          bundle
        );
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

  const api = {
    DEFAULT_LANGUAGE,
    SUPPORTED_LANGUAGES,
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
