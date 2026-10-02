(function (global) {
  "use strict";

  function loadTaggedScriptOnce(options) {
    const { cache, cacheKey, tagAttribute, src, onReady, onError } = options || {};

    if (!tagAttribute || !src) {
      throw new Error("loadTaggedScriptOnce requires tagAttribute and src.");
    }

    const key = String(cacheKey || src);

    if (cache instanceof Set && cache.has(key)) {
      onReady?.();
      return;
    }

    const selector = `script[${tagAttribute}="${key}"]`;
    const existingScript = document.querySelector(selector);
    if (existingScript) {
      if (existingScript.dataset.loaded === "true") {
        cache?.add?.(key);
        onReady?.();
        return;
      }

      existingScript.addEventListener(
        "load",
        () => {
          cache?.add?.(key);
          onReady?.();
        },
        { once: true }
      );
      existingScript.addEventListener(
        "error",
        () => {
          if (typeof onError === "function") {
            onError();
            return;
          }
          onReady?.();
        },
        { once: true }
      );
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.async = false;
    script.setAttribute(tagAttribute, key);
    script.addEventListener(
      "load",
      () => {
        script.dataset.loaded = "true";
        cache?.add?.(key);
        onReady?.();
      },
      { once: true }
    );
    script.addEventListener(
      "error",
      () => {
        if (typeof onError === "function") {
          onError();
          return;
        }
        onReady?.();
      },
      { once: true }
    );

    document.head.appendChild(script);
  }

  global.SAORuntimeUtils = Object.freeze({
    loadTaggedScriptOnce
  });
})(window);
