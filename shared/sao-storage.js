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
      try {
        this.setItem(key, JSON.stringify(value));
      } catch (error) {
        console.error("Failed to persist JSON data.", error);
      }
    }
  };

  global.SAOStorage = storage;
})(window);
