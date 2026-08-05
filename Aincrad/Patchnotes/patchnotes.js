const PATCH_NOTES = [
  {
    version: "Language and Compatibility Update - v1.3",
    date: "2026-08-05",
    title: "Language and Compatibility Update",
    summary: "• Added Français, Español, and Deutsch language support. (Many translations are still missing, but I did my best to translate as much as possible.)\n• Added a website walkthrough/guide.\n• Improved compatibility across more web browsers.\n• Optimized and reorganized code to make future updates and maintenance easier.\n\n• This should be the final website update until the server comes back online.",
    tags: ["Release", "Localization", "Compatibility", "Maintenance"]
  },
  {
    version: "Very Small Bug Fix - v1.2",
    date: "2026-07-29",
    title: "Very Small Bug Fix",
    summary: "• Fixed the Commands Menu loading indefinitely.\n• Fixed patchnote order from lowest to highest date.",
    tags: ["Bug Fixes", "Commands", "Maps"]
  },
  {
    version: "Final Touches Till Full Release - v1.1",
    date: "2026-07-16",
    title: "Final Touches",
    summary: "• Added a Commands tab.\n• Added a Misc. Info section for information that doesn't fit anywhere else.\n• Added Back to Menu buttons throughout the website.\n• Added the Fractured Underworld section, although it is still in the early stages of development.\n• Began work on Tower Defense support and information within Fractured Underworld.\n• Added a small disclaimer to the Welcome Mat.\n• Fixed a wapoint bug.\n• Fixed a UI bug",
    tags: ["Release", "Commands", "Misc Info", "Fractured Underworld", "Tower Defense", "Welcome Mat", "Bug Fixes"]
  },
  {
    version: "Full Release - v1.0",
    date: "2026-07-16",
    title: "Full Release",
    summary: "• Added Floor 3 and its available waypoints.\n• Main Quest information for Floors 1 to 3 is currently missing, so those have not been added yet.\n• Some waypoints on Floor 3 intentionally do not work due to a lack of information at this time.\n• Optimized code across the website.\n• Started and completed the Equipment Compendium.\n• Most buttons are now alphabetically sorted.\n• Updated and improved the website UI.\n• Redesigned the website landing page.\n• Added buttons linking to the SAO MC Discord, the support Discord, and my personal Discord profile.\n• Contact me through discord for Suggestions or Bug Reports",
    tags: ["Release", "Floor 3", "Equipment", "UI", "Discord", "Contact"]
  },
  {
    version: "v0.1.0 Alpha",
    date: "2026-07-11",
    title: "Website Release",
    summary: "Initial website release. Added Floor 1, Side Quest locations, Biome locations, Dungeon locations, the Quest Menu, and the Bestiary Menu.",
    tags: ["Release", "Floor 1", "Quests", "Biomes", "Dungeons", "Bestiary"]
  },
  {
    version: "v0.2.0 Alpha",
    date: "2026-07-13",
    title: "New Maps",
    summary: "Added Floor 2, major POI waypoints for Floor 1 and Floor 2, waypoint interactions that can open the Bestiary or Quest Menu, and the website main menu screen.",
    tags: ["Maps", "Floor 2", "POI", "Waypoints", "Main Menu"]
  }
];

const patchnotesSearchStorageKey = "sao.patchnotes.search";
const i18n = window.SAOI18n || null;
const t = (key, params) => (i18n ? i18n.t(key, params) : key);
const storage = window.SAOStorage || {
  getItem() { return null; },
  setItem() {}
};
const PATCH_NOTE_SEARCH_INDEX = PATCH_NOTES.map(entry => ({
  entry,
  haystack: `${entry.version} ${entry.title} ${entry.summary} ${entry.tags.join(" ")} ${entry.date}`.toLowerCase(),
  parsedDate: new Date(entry.date).getTime() || 0
}));
const SORTED_PATCH_NOTE_SEARCH_INDEX = [...PATCH_NOTE_SEARCH_INDEX].sort((a, b) => (b.parsedDate || 0) - (a.parsedDate || 0));

function getRequestedFloor() {
  const requestedFloor = new URLSearchParams(window.location.search).get("floor");
  return requestedFloor && /^floor[123]$/.test(requestedFloor) ? requestedFloor : "";
}

function attachSectionNavButtons() {
  const pageUtils = window.SAOPageUtils;
  if (!pageUtils || typeof pageUtils.attachSectionNavButtons !== "function") {
    console.warn("Patchnotes navigation helper is unavailable.");
    return;
  }

  pageUtils.attachSectionNavButtons(".nav", getRequestedFloor);
}

function showPatchnotesLoadError() {
  const status = document.getElementById("status");
  const list = document.getElementById("patchnotesList");
  if (status) {
    status.textContent = t("page.patchnotes.loadError");
  }
  if (list) {
    const emptyState = document.createElement("div");
    emptyState.className = "patchnote-empty";
    emptyState.textContent = t("page.patchnotes.loadUnavailable");
    list.replaceChildren(emptyState);
  }
}

function buildPatchNoteCard(entry) {
  const article = document.createElement("article");
  article.className = "patchnote-card";

  const meta = document.createElement("div");
  meta.className = "patchnote-meta";

  const version = document.createElement("span");
  version.className = "patchnote-version";
  version.textContent = entry.version;

  const date = document.createElement("span");
  date.className = "patchnote-date";
  date.textContent = entry.date;

  meta.append(version, date);

  const title = document.createElement("h2");
  title.textContent = entry.title;

  const summary = document.createElement("p");
  summary.textContent = entry.summary;
  summary.classList.add("patchnote-summary");

  const tagsWrap = document.createElement("div");
  tagsWrap.className = "patchnote-tags";
  entry.tags.forEach(tagText => {
    const tag = document.createElement("span");
    tag.className = "patchnote-tag";
    tag.textContent = tagText;
    tagsWrap.appendChild(tag);
  });

  article.append(meta, title, summary, tagsWrap);
  return article;
}

window.addEventListener("DOMContentLoaded", () => {
  try {
    const status = document.getElementById("status");
    const searchInput = document.getElementById("patchSearch");
    const patchnotesList = document.getElementById("patchnotesList");
    const persistedSearch = storage.getItem(patchnotesSearchStorageKey) || "";

    attachSectionNavButtons();

  const renderPatchNotes = (filter = "") => {
    if (!patchnotesList) return;

    const normalizedFilter = filter.trim().toLowerCase();
    const visibleNotes = SORTED_PATCH_NOTE_SEARCH_INDEX
      .filter(({ haystack }) => haystack.includes(normalizedFilter))
      .map(({ entry }) => entry);

    if (!visibleNotes.length) {
      const emptyState = document.createElement("div");
      emptyState.className = "patchnote-empty";
      emptyState.textContent = t("page.patchnotes.noMatches");
      patchnotesList.replaceChildren(emptyState);
      if (status) status.textContent = t("page.patchnotes.noEntries");
      return;
    }

    const fragment = document.createDocumentFragment();
    visibleNotes.forEach(entry => fragment.appendChild(buildPatchNoteCard(entry)));
    patchnotesList.replaceChildren(fragment);

    if (status) {
      status.textContent = t("page.patchnotes.statusShowing", {
        count: visibleNotes.length,
        suffix: visibleNotes.length === 1 ? "" : "s"
      });
    }
  };

    searchInput?.addEventListener("input", event => {
      const searchValue = event.target.value;
      storage.setItem(patchnotesSearchStorageKey, searchValue);
      renderPatchNotes(searchValue);
    });

    if (searchInput && persistedSearch) {
      searchInput.value = persistedSearch;
    }

    renderPatchNotes(persistedSearch);

    document.addEventListener("sao:languagechange", () => {
      renderPatchNotes(searchInput ? searchInput.value : "");
    });
  } catch (error) {
    console.error("Failed to initialize patchnotes runtime.", error);
    showPatchnotesLoadError();
  }
});
