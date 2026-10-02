(function () {
  "use strict";

  /* Highlights the nav button for the page you are currently on.
     Map zoom buttons are wired by each map controller, not here. */
  function markCurrentNavSection() {
    try {
      var path = String(window.location.pathname || "").toLowerCase();
      /* Identify the page by its exact file name. Matching on a path substring made
         ecompendium.html also match "compendium.html", so page identification silently depended on
         the order of the table below. */
      var pageFile = path.slice(path.lastIndexOf("/") + 1);
      var sectionByFile = {
        "bestiary.html": "bestiary",
        "ecompendium.html": "equipment",
        "compendium.html": "compendium",
        "quests.html": "quests",
        "patchnotes.html": "patchnotes",
        "miscinfo.html": "miscinfo",
        "commands.html": "commands",
        "maps.html": "maps",
        "mainui.html": "mainui",
        "towerdefense.html": "towerDefense"
      };
      var currentSection = Object.prototype.hasOwnProperty.call(sectionByFile, pageFile) ? sectionByFile[pageFile] : "";
      Array.prototype.forEach.call(document.querySelectorAll("button[data-nav-target]"), function (button) {
        var target = button.getAttribute("data-nav-target") || "";
        var isCurrent = Boolean(target) && target === currentSection;
        button.classList.toggle("is-active", isCurrent);
        if (isCurrent) button.setAttribute("aria-current", "page");
        else button.removeAttribute("aria-current");
      });
    } catch (error) {
      /* Nav highlighting is cosmetic; never break the page over it. */
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", markCurrentNavSection);
  } else {
    markCurrentNavSection();
  }

  document.addEventListener("sao:languagechange", function () {
    window.setTimeout(markCurrentNavSection, 0);
  });
})();
