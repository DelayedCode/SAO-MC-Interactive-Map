(function attachPersistenceUtils(global) {
  const persistentCookieMaxAge = 31536000;

  function getPersistentItem(key) {
    try {
      return localStorage.getItem(key);
    } catch {
      const cookiePrefix = `${encodeURIComponent(key)}=`;
      const match = document.cookie
        .split(";")
        .map(part => part.trim())
        .find(part => part.startsWith(cookiePrefix));
      return match ? decodeURIComponent(match.slice(cookiePrefix.length)) : null;
    }
  }

  function setPersistentItem(key, value) {
    try {
      localStorage.setItem(key, value);
      return;
    } catch {
      document.cookie = `${encodeURIComponent(key)}=${encodeURIComponent(value)}; path=/; max-age=${persistentCookieMaxAge}; SameSite=Lax`;
    }
  }

  global.SAOMCUtils = global.SAOMCUtils || {};
  global.SAOMCUtils.getPersistentItem = getPersistentItem;
  global.SAOMCUtils.setPersistentItem = setPersistentItem;
})(window);
