/* Cross-page navigation utilities (window.SAOPageUtils).
   Owns the canonical section route maps (Aincrad + Fractured Underworld), the
   safe internal-href resolver, the shared section URL construction, and the
   shared nav-button wiring. Storage lives in sao-storage.js; keep the two
   concerns separate - navigation does not persist anything. */
(function (global) {
  "use strict";

  // Canonical Aincrad section routes, expressed relative to an `Aincrad/<Section>/`
  // page (every feature page lives exactly one directory below its world root).
  const SECTION_PATHS = Object.freeze({
    menu: "../../index.html",
    maps: "../Map/maps.html",
    bestiary: "../Bestiary/bestiary.html",
    equipment: "../eCompendium/ecompendium.html",
    quests: "../Quests/quests.html",
    patchnotes: "../Patchnotes/patchnotes.html",
    commands: "../Commands/commands.html",
    miscinfo: "../Misc Info/miscinfo.html"
  });

  // Canonical Fractured Underworld routes, expressed relative to a
  // `Fractured Underworld/<Section>/` page.
  const UNDERWORLD_SECTION_PATHS = Object.freeze({
    menu: "../../index.html",
    mainui: "../Main UI/mainui.html",
    towerDefense: "../Tower Defense/towerdefense.html",
    compendium: "../Compendium/compendium.html"
  });

  // Sections whose destination URL carries the active floor.
  const FLOOR_AWARE_SECTIONS = new Set(["maps", "bestiary", "equipment", "quests", "commands"]);

  // The Fractured Underworld "floor" is an island id; it rides the same `floor`
  // query parameter through the world's own pages.
  const UNDERWORLD_FLOOR_AWARE_SECTIONS = new Set(["mainui", "towerDefense", "compendium"]);

  function resolveSafeInternalHref(value) {
    const rawValue = String(value || "").trim();
    if (!rawValue) return null;

    try {
      const resolved = new URL(rawValue, window.location.href);
      if (resolved.origin !== window.location.origin) return null;
      if (resolved.protocol !== "http:" && resolved.protocol !== "https:") return null;
      return resolved.href;
    } catch {
      return null;
    }
  }

  // Builds `<path>?<encoded params>`, skipping empty values and omitting the
  // query string entirely when nothing survives.
  function buildQueryUrl(path, params) {
    const query = new URLSearchParams();
    Object.keys(params || {}).forEach((key) => {
      const value = params[key];
      if (value !== undefined && value !== null && value !== "") query.set(key, value);
    });
    const suffix = query.toString();
    return suffix ? `${path}?${suffix}` : path;
  }

  function buildSectionUrl(section, floor, sectionPaths, floorAwareSections) {
    const paths = sectionPaths || SECTION_PATHS;
    const aware = floorAwareSections || FLOOR_AWARE_SECTIONS;
    const path = paths[section] || "#";
    if (path === "#") return path;
    if (!floor || !aware.has(section)) return path;
    return buildQueryUrl(path, { floor });
  }

  // Resolves and performs navigation for one section nav button.
  // Returns "navigate" when the location was reassigned, "dataset" when the
  // dataset selector was opened instead (callers should preventDefault), and
  // null when the target is unknown or unsafe.
  function navigateToSection(button, options) {
    const config = options || {};
    const section = button && button.dataset && button.dataset.navTarget;
    if (!section) return null;

    const floor = typeof config.floorProvider === "function" ? config.floorProvider() : config.floorProvider;

    const nextHref = resolveSafeInternalHref(
      buildSectionUrl(section, floor, config.sectionPaths, config.floorAwareSections)
    );
    if (!nextHref) return null;

    const datasets = global.SAODatasets;
    if (datasets && datasets.affectedSections.has(section)) {
      datasets.installStyles();
      datasets.navigate({
        section,
        url: nextHref,
        title: button.textContent.trim()
      });
      return "dataset";
    }

    window.location.href = nextHref;
    return "navigate";
  }

  function attachSectionNavButtons(navSelector, floorProvider, options) {
    const config = options || {};
    const nav = document.querySelector(navSelector || ".nav");
    if (!nav) return;

    nav.addEventListener("click", (event) => {
      const button = event.target.closest("button[data-nav-target]");
      if (!button) return;

      const outcome = navigateToSection(button, {
        sectionPaths: config.sectionPaths,
        floorAwareSections: config.floorAwareSections,
        floorProvider
      });
      if (outcome === "dataset") event.preventDefault();
    });
  }

  global.SAOPageUtils = Object.freeze({
    SECTION_PATHS,
    UNDERWORLD_SECTION_PATHS,
    FLOOR_AWARE_SECTIONS,
    UNDERWORLD_FLOOR_AWARE_SECTIONS,
    buildQueryUrl,
    buildSectionUrl,
    resolveSafeInternalHref,
    navigateToSection,
    attachSectionNavButtons
  });
})(window);
