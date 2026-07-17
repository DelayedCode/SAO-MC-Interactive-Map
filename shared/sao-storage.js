(function (global) {
  "use strict";

  const cookieMaxAgeSeconds = 60 * 60 * 24 * 365 * 5;
  const memoryStore = new Map();

  function getCookie(name) {
    const encodedName = encodeURIComponent(name) + "=";
    const cookies = String(document.cookie || "").split(";");

    for (const cookiePart of cookies) {
      const trimmed = cookiePart.trim();
      if (trimmed.startsWith(encodedName)) {
        return decodeURIComponent(trimmed.slice(encodedName.length));
      }
    }

    return null;
  }

  function setCookie(name, value) {
    document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; path=/; max-age=${cookieMaxAgeSeconds}; SameSite=Lax`;
  }

  function removeCookie(name) {
    document.cookie = `${encodeURIComponent(name)}=; path=/; max-age=0; SameSite=Lax`;
  }

  const storage = {
    getItem(key) {
      const normalizedKey = String(key || "");
      if (!normalizedKey) return null;

      try {
        const value = global.localStorage.getItem(normalizedKey);
        if (value !== null) return value;
      } catch {
        // Continue to cookie fallback.
      }

      try {
        const cookieValue = getCookie(normalizedKey);
        if (cookieValue !== null) return cookieValue;
      } catch {
        // Continue to in-memory fallback.
      }

      return memoryStore.has(normalizedKey) ? memoryStore.get(normalizedKey) : null;
    },

    setItem(key, value) {
      const normalizedKey = String(key || "");
      if (!normalizedKey) return;
      const normalizedValue = String(value);

      try {
        global.localStorage.setItem(normalizedKey, normalizedValue);
        return;
      } catch {
        // Continue to cookie fallback.
      }

      try {
        setCookie(normalizedKey, normalizedValue);
        return;
      } catch {
        // Continue to in-memory fallback.
      }

      memoryStore.set(normalizedKey, normalizedValue);
    },

    removeItem(key) {
      const normalizedKey = String(key || "");
      if (!normalizedKey) return;

      try {
        global.localStorage.removeItem(normalizedKey);
      } catch {
        // Ignore localStorage removal errors.
      }

      try {
        removeCookie(normalizedKey);
      } catch {
        // Ignore cookie removal errors.
      }

      memoryStore.delete(normalizedKey);
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

  const pageUtils = Object.freeze({
    SECTION_PATHS: Object.freeze({
      maps: "../Map/maps.html",
      bestiary: "../Bestiary/bestiary.html",
      equipment: "../eCompendium/ecompendium.html",
      quests: "../Quests/quests.html",
      patchnotes: "../Patchnotes/patchnotes.html",
      commands: "../Commands/commands.html"
    }),
    FLOOR_AWARE_SECTIONS: new Set(["maps", "bestiary", "equipment", "quests", "commands"]),
    buildSectionUrl(section, floor) {
      const path = pageUtils.SECTION_PATHS[section] || "#";
      if (path === "#") return path;
      if (!floor || !pageUtils.FLOOR_AWARE_SECTIONS.has(section)) return path;
      return `${path}?${new URLSearchParams({ floor }).toString()}`;
    },
    attachSectionNavButtons(navSelector = ".nav", floorProvider) {
      const nav = document.querySelector(navSelector);
      if (!nav) return;

      nav.addEventListener("click", event => {
        const button = event.target.closest("button[data-nav-target]");
        if (!button) return;

        const resolvedFloor = typeof floorProvider === "function"
          ? floorProvider()
          : floorProvider;

        window.location.href = pageUtils.buildSectionUrl(button.dataset.navTarget, resolvedFloor);
      });
    }
  });

  global.SAOStorage = storage;
  global.SAOPageUtils = pageUtils;
})(window);