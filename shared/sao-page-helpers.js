/* Cross-page helpers shared by the per-feature page scripts.
   Keeps HTML escaping, id slugging, floor deep-link parsing, the storage
   fallback and the i18n lookup wrappers in one place instead of every page
   re-declaring its own copy. Loaded before each page's own script. */
(function (global) {
  "use strict";

  const HTML_ESCAPE_MAP = Object.freeze({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  });

  /* Used when browser storage is unavailable (private mode, blocked cookies). */
  const fallbackStorage = Object.freeze({
    getItem() {
      return null;
    },
    setItem() {},
    removeItem() {},
    getJSON(_key, fallbackValue) {
      return fallbackValue;
    },
    setJSON() {}
  });

  /* Escapes text before it is interpolated into an HTML string. */
  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (character) => HTML_ESCAPE_MAP[character]);
  }

  /* Stable DOM/id-safe slug. Pages needing a different empty-value token pass it in. */
  function slugifyContentId(value, fallback) {
    const emptyToken = fallback === undefined ? "unknown" : String(fallback);
    return (
      String(value || emptyToken)
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") || emptyToken
    );
  }

  /* Reads the ?floor= deep link, falling back to the page's own default floor. */
  function getRequestedFloor(defaultFloor) {
    const fallbackFloor = defaultFloor === undefined ? "floor1" : defaultFloor;
    const requestedFloor = new URLSearchParams(global.location.search).get("floor");
    return requestedFloor && /^floor[123]$/.test(requestedFloor) ? requestedFloor : fallbackFloor;
  }

  /* SAOStorage with a no-op fallback so pages still render when storage is blocked. */
  function getStorage() {
    return global.SAOStorage || fallbackStorage;
  }

  /* Wraps SAOI18n so page code can call t()/content() without null checks. */
  function createTranslators(i18nInstance) {
    const i18n = i18nInstance === undefined ? global.SAOI18n : i18nInstance;
    return Object.freeze({
      t(key, params) {
        return i18n ? i18n.t(key, params) : key;
      },
      content(key, fallback) {
        return i18n && typeof i18n.content === "function" ? i18n.content(key, fallback) : fallback;
      }
    });
  }

  /* Replaces {token} placeholders in a message. Used as the fallback translator by the shared
     walkthrough and welcome-warning controllers when a page does not inject its own. */
  function formatMessage(message, params) {
    if (params && typeof params === "object") {
      return Object.entries(params).reduce(
        (value, [name, replacement]) => value.replace(`{${name}}`, String(replacement)),
        String(message)
      );
    }
    return message;
  }

  global.SAOPageHelpers = Object.freeze({
    escapeHtml,
    slugifyContentId,
    getRequestedFloor,
    getStorage,
    createTranslators,
    formatMessage,
    fallbackStorage
  });
})(typeof window !== "undefined" ? window : globalThis);
