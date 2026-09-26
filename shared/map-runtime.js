(function (globalObject) {
  "use strict";

  const DEFAULT_REQUIRED_DOM = [
    "mapContainer",
    "sidebar",
    "mapLayer",
    "mapImage",
    "undergroundMapImage",
    "mobAreaLayer",
    "markerLayer",
    "title",
    "content",
    "overlayMappedCoords",
    "floorSelect",
    "undergroundToggle",
    "searchInput",
    "clearFiltersButton",
    "zoomLabel",
    "resetViewButton"
  ];

  const REQUIRED_ADAPTER_FIELDS = [
    "id",
    "label",
    "defaultFloor",
    "floors",
    "categories",
    "mapImageSources",
    "markerDataset",
    "mobAreaDataset",
    "navigationSections",
    "sectionPaths",
    "walkthroughSteps",
    "walkthroughStorageKey"
  ];

  function cloneState(state) {
    return {
      ...state,
      activeCategories: { ...state.activeCategories },
      visitedMarkerIds: new Set(state.visitedMarkerIds)
    };
  }

  function createDisposer() {
    const cleanups = new Set();
    let disposed = false;

    const runCleanup = cleanup => {
      try {
        cleanup();
      } catch (_error) {
        // Cleanup must remain safe when the owner was already removed elsewhere.
      }
    };

    return {
      add(cleanup) {
        if (typeof cleanup !== "function") return cleanup;
        if (disposed) {
          runCleanup(cleanup);
          return cleanup;
        }
        cleanups.add(cleanup);
        return cleanup;
      },
      dispose() {
        if (disposed) return;
        disposed = true;
        for (const cleanup of cleanups) {
          runCleanup(cleanup);
        }
        cleanups.clear();
      },
      get disposed() {
        return disposed;
      }
    };
  }

  function isPlainObject(value) {
    return Boolean(value) && typeof value === "object" && !Array.isArray(value);
  }

  function normalizeCategories(categories) {
    if (!isPlainObject(categories)) {
      return {};
    }

    const normalized = {};
    for (const category of Object.keys(categories)) {
      normalized[category] = Boolean(categories[category]);
    }
    return normalized;
  }

  function validateAdapter(adapter) {
    if (!isPlainObject(adapter)) {
      throw new TypeError("Map runtime requires a valid adapter object.");
    }

    for (const field of REQUIRED_ADAPTER_FIELDS) {
      if (adapter[field] === undefined || adapter[field] === null) {
        throw new TypeError(`Map runtime adapter is missing required field: ${field}`);
      }
    }

    if (!adapter.id || typeof adapter.id !== "string") {
      throw new TypeError("Map runtime adapter id must be a non-empty string.");
    }

    if (!adapter.label || typeof adapter.label !== "string") {
      throw new TypeError("Map runtime adapter label must be a non-empty string.");
    }

    if (!adapter.defaultFloor || typeof adapter.defaultFloor !== "string") {
      throw new TypeError("Map runtime adapter defaultFloor must be a non-empty string.");
    }

    if (!isPlainObject(adapter.floors)) {
      throw new TypeError("Map runtime adapter floors must be an object map.");
    }

    if (!isPlainObject(adapter.categories)) {
      throw new TypeError("Map runtime adapter categories must be an object map.");
    }

    if (!isPlainObject(adapter.mapImageSources)) {
      throw new TypeError("Map runtime adapter mapImageSources must be an object map.");
    }

    if (!isPlainObject(adapter.navigationSections) && !Array.isArray(adapter.navigationSections)) {
      throw new TypeError("Map runtime adapter navigationSections must be an object or array.");
    }

    if (!isPlainObject(adapter.sectionPaths)) {
      throw new TypeError("Map runtime adapter sectionPaths must be an object map.");
    }

    if (!Array.isArray(adapter.walkthroughSteps)) {
      throw new TypeError("Map runtime adapter walkthroughSteps must be an array.");
    }

    if (!adapter.walkthroughStorageKey || typeof adapter.walkthroughStorageKey !== "string") {
      throw new TypeError("Map runtime adapter walkthroughStorageKey must be a non-empty string.");
    }
  }

  function validateDom(dom, requiredElements) {
    if (!dom || typeof dom !== "object") {
      throw new Error("Map runtime requires a DOM-like object for initialization.");
    }

    const names = Array.isArray(requiredElements) && requiredElements.length ? requiredElements : DEFAULT_REQUIRED_DOM;
    const missing = names.filter(name => !dom[name]);

    if (missing.length) {
      throw new Error(`Map runtime is missing required DOM elements: ${missing.join(", ")}.`);
    }
  }

  function defaultRenderer() {
    return {
      renderMapImage() {
        return null;
      },
      renderMarkers() {
        return [];
      },
      renderMobAreas() {
        return [];
      }
    };
  }

  function defaultSearch() {
    return {
      normalizeText(value) {
        return String(value ?? "").trim().toLowerCase();
      },
      filterMarker(marker, query, activeCategories) {
        const normalizedQuery = this.normalizeText(query);
        const categoryState = activeCategories || {};

        if (normalizedQuery) {
          const haystack = [
            marker && marker.title,
            marker && marker.description,
            marker && marker.type,
            marker && marker.category
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          if (!haystack.includes(normalizedQuery)) {
            return false;
          }
        }

        if (marker && marker.category && categoryState[marker.category] === false) {
          return false;
        }

        return true;
      }
    };
  }

  function defaultUrlState() {
    return {
      parse(source) {
        const search = typeof source === "string" ? source : (source && source.search) || "";
        const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
        const categories = {};

        const seenCategoryValues = new Set();
        const rawCategories = params.get("categories");
        if (rawCategories) {
          for (const value of String(rawCategories).split(",")) {
            const normalized = String(value).trim();
            if (!normalized || seenCategoryValues.has(normalized)) continue;
            seenCategoryValues.add(normalized);
            categories[normalized] = true;
          }
        }

        const hasParams = ["floor", "underground", "search", "q", "categories"]
          .some(key => params.has(key));

        return {
          floor: params.get("floor") || null,
          underground: params.get("underground") === "1" || params.get("underground") === "true",
          search: params.get("search") || params.get("q") || "",
          activeCategories: categories,
          hasParams
        };
      },
      serialize(nextState) {
        const params = new URLSearchParams();
        const searchValue = nextState && (nextState.search || nextState.q);
        if (nextState && nextState.floor) {
          params.set("floor", String(nextState.floor));
        }
        if (nextState && nextState.underground) {
          params.set("underground", "1");
        }
        if (searchValue) {
          params.set("search", String(searchValue));
        }
        if (nextState && nextState.activeCategories) {
          const enabled = Object.entries(nextState.activeCategories)
            .filter(([, enabledValue]) => Boolean(enabledValue))
            .map(([key]) => key);
          if (enabled.length) {
            params.set("categories", enabled.join(","));
          }
        }
        return params.toString();
      }
    };
  }

  function defaultWalkthrough() {
    return {
      isCompleted(storage, key) {
        if (!storage || typeof storage.getItem !== "function") return false;
        return storage.getItem(key) === "1";
      },
      markCompleted(storage, key) {
        if (!storage || typeof storage.setItem !== "function") return;
        storage.setItem(key, "1");
      },
      reset(storage, key) {
        if (!storage || typeof storage.removeItem !== "function") return;
        storage.removeItem(key);
      }
    };
  }

  function createSidebarResizeController(runtime, config) {
    const options = Object.assign({
      min: 260,
      max: 520,
      defaultWidth: 320,
      onWidthChange: null,
      onResizeStart: null,
      onResizeEnd: null
    }, config || {});
    const dom = runtime.dom;
    const sidebar = options.sidebar;
    const handle = options.handle || {
      addEventListener() {},
      removeEventListener() {},
      setAttribute() {}
    };
    const documentObject = options.document || (dom && dom.ownerDocument) || null;
    const windowObject = options.window || (documentObject && documentObject.defaultView) || null;

    if (!sidebar || !documentObject || !windowObject ||
      typeof sidebar.getBoundingClientRect !== "function" ||
      typeof handle.addEventListener !== "function" ||
      typeof windowObject.addEventListener !== "function" ||
      typeof documentObject.addEventListener !== "function") {
      return null;
    }

    if (!Number.isFinite(options.min) || !Number.isFinite(options.max) || options.min > options.max) {
      throw new TypeError("Map runtime sidebar resize bounds must be finite and ordered.");
    }

    const resizeState = {
      width: null,
      active: false,
      startX: 0,
      startWidth: 0
    };

    const clampWidth = width => Math.min(options.max, Math.max(options.min, width));
    const notifyWidthChange = width => {
      if (typeof options.onWidthChange === "function") {
        options.onWidthChange(width);
      }
    };
    const applyWidth = width => {
      const numericWidth = Number(width);
      const clampedWidth = clampWidth(Number.isFinite(numericWidth) ? numericWidth : options.defaultWidth);
      const root = documentObject?.documentElement || (dom && dom.documentElement) || null;
      if (root && root.style) {
        root.style.setProperty("--sidebar-width", `${clampedWidth}px`);
      }
      handle.setAttribute?.("aria-valuemin", String(options.min));
      handle.setAttribute?.("aria-valuemax", String(options.max));
      handle.setAttribute?.("aria-valuenow", String(Math.round(clampedWidth)));
      handle.setAttribute?.("aria-valuetext", `${Math.round(clampedWidth)} pixels`);
      resizeState.width = clampedWidth;
      notifyWidthChange(clampedWidth);
      return clampedWidth;
    };
    const start = event => {
      if (event.type === "mousedown" && event.button !== 0) return;
      if (event.type === "pointerdown" && event.pointerType === "mouse" && event.button !== 0) return;
      event.preventDefault?.();
      resizeState.startX = event.clientX;
      resizeState.startWidth = sidebar.getBoundingClientRect().width;
      resizeState.active = true;
      if (typeof options.onResizeStart === "function") {
        options.onResizeStart();
      }
    };
    const move = event => {
      if (!resizeState.active) return;
      const deltaX = event.clientX - resizeState.startX;
      applyWidth(resizeState.startWidth - deltaX);
    };
    const stop = () => {
      if (!resizeState.active) return;
      resizeState.active = false;
      const width = applyWidth(sidebar.getBoundingClientRect().width);
      if (typeof options.onResizeEnd === "function") {
        options.onResizeEnd(width);
      }
    };
    const keydown = event => {
      const currentWidth = sidebar.getBoundingClientRect().width || resizeState.width || options.defaultWidth;
      if (event.key === "ArrowLeft") {
        event.preventDefault?.();
        applyWidth(currentWidth + 16);
        return;
      }
      if (event.key === "ArrowRight") {
        event.preventDefault?.();
        applyWidth(currentWidth - 16);
        return;
      }
      if (event.key === "Home") {
        event.preventDefault?.();
        applyWidth(options.min);
        return;
      }
      if (event.key === "End") {
        event.preventDefault?.();
        applyWidth(options.max);
      }
    };
    const doubleClick = () => {
      const width = applyWidth(options.defaultWidth);
      if (typeof options.onResizeEnd === "function") {
        options.onResizeEnd(width);
      }
    };
    const listeners = [
      [handle, "mousedown", start],
      [handle, "pointerdown", start],
      [handle, "keydown", keydown],
      [handle, "dblclick", doubleClick],
      [windowObject, "mousemove", move],
      [windowObject, "pointermove", move, { passive: false }],
      [documentObject, "mouseup", stop],
      [documentObject, "pointerup", stop],
      [documentObject, "mouseleave", stop],
      [windowObject, "blur", stop]
    ];

    listeners.forEach(([target, type, listener, listenerOptions]) => {
      target.addEventListener(type, listener, listenerOptions);
    });

    return {
      setWidth: applyWidth,
      getState() {
        return { width: resizeState.width, active: resizeState.active };
      },
      destroy() {
        listeners.forEach(([target, type, listener, listenerOptions]) => {
          target.removeEventListener?.(type, listener, listenerOptions);
        });
        if (resizeState.active) {
          resizeState.active = false;
          if (typeof options.onResizeEnd === "function" && resizeState.width !== null) {
            options.onResizeEnd(resizeState.width);
          }
        }
      }
    };
  }

  function createMapRuntime(adapter, options) {
    const runtimeOptions = Object.assign({
      dom: typeof globalObject !== "undefined" && globalObject.document ? globalObject.document : null,
      renderer: defaultRenderer(),
      storage: typeof globalObject !== "undefined" ? globalObject.SAOStorage || null : null,
      coordinateDependencies: null,
      requiredElements: DEFAULT_REQUIRED_DOM,
      search: defaultSearch(),
      urlState: defaultUrlState(),
      walkthrough: defaultWalkthrough(),
      onError: null
    }, options || {});

    validateAdapter(adapter);
    validateDom(runtimeOptions.dom, runtimeOptions.requiredElements);

    const coordinateDependencies = runtimeOptions.coordinateDependencies || adapter.coordinateDependencies || {};
    const normalizedCoordinateDependencies = {
      mapWebsiteCoordinates: typeof coordinateDependencies.mapWebsiteCoordinates === "function"
        ? coordinateDependencies.mapWebsiteCoordinates
        : null,
      invertMapCoordinates: typeof coordinateDependencies.invertMapCoordinates === "function"
        ? coordinateDependencies.invertMapCoordinates
        : null
    };
    const visitedMarkerStorageKey = "sao.visitedMarkers";
    const storedVisitedMarkerIds = runtimeOptions.storage && typeof runtimeOptions.storage.getJSON === "function"
      ? runtimeOptions.storage.getJSON(visitedMarkerStorageKey, [])
      : [];

    const state = {
      activeMapContextId: adapter.defaultFloor,
      zoom: 1,
      panX: 0,
      panY: 0,
      selectedMarkerId: null,
      activeSearch: "",
      activeCategories: normalizeCategories(adapter.categories),
      visitedMarkerIds: new Set(Array.isArray(storedVisitedMarkerIds)
        ? storedVisitedMarkerIds.filter(id => typeof id === "string")
        : []),
      sidebarWidth: null,
      initialized: false,
      destroyed: false,
      pointerDragging: false
    };
    let sidebarResizeController = null;

    const runtime = {
      adapter,
      options: runtimeOptions,
      dom: runtimeOptions.dom,
      storage: runtimeOptions.storage,
      renderer: runtimeOptions.renderer || defaultRenderer(),
      search: runtimeOptions.search || defaultSearch(),
      urlState: runtimeOptions.urlState || defaultUrlState(),
      walkthrough: runtimeOptions.walkthrough || defaultWalkthrough(),
      coordinateDependencies: normalizedCoordinateDependencies,
      getState() {
        return cloneState(state);
      },
      init() {
        if (state.destroyed) {
          throw new Error("Map runtime cannot be initialized after being destroyed.");
        }
        if (state.initialized) {
          throw new Error("Map runtime has already been initialized.");
        }

        state.initialized = true;
        state.destroyed = false;
        return runtime;
      },
      destroy() {
        runtime.destroySidebarResize();
        state.initialized = false;
        state.destroyed = true;
        state.activeMapContextId = null;
        state.selectedMarkerId = null;
        return runtime;
      },
      setActiveMapContext(contextId) {
        if (!contextId || typeof contextId !== "string") {
          throw new TypeError("Map runtime map-context ID must be a non-empty string.");
        }
        if (state.destroyed) {
          throw new Error("Map runtime has been destroyed.");
        }
        state.activeMapContextId = contextId;
        return state.activeMapContextId;
      },
      getActiveMapContext() {
        return state.activeMapContextId;
      },
      clearActiveMapContext() {
        if (state.destroyed) {
          throw new Error("Map runtime has been destroyed.");
        }
        state.activeMapContextId = null;
        return null;
      },
      setSelectedMarker(markerId) {
        if (state.destroyed) {
          throw new Error("Map runtime has been destroyed.");
        }
        state.selectedMarkerId = markerId || null;
        return state.selectedMarkerId;
      },
      getSelectedMarker() {
        return state.selectedMarkerId;
      },
      clearSelectedMarker() {
        if (state.destroyed) {
          throw new Error("Map runtime has been destroyed.");
        }
        state.selectedMarkerId = null;
        return null;
      },
      setCategoryState(category, enabled) {
        if (state.destroyed) {
          throw new Error("Map runtime has been destroyed.");
        }
        if (typeof category !== "string") {
          throw new TypeError("Map runtime category must be a string.");
        }
        if (!Object.prototype.hasOwnProperty.call(state.activeCategories, category)) {
          state.activeCategories[category] = Boolean(enabled);
          return state.activeCategories[category];
        }
        state.activeCategories[category] = Boolean(enabled);
        return state.activeCategories[category];
      },
      applySearch(value) {
        if (state.destroyed) {
          throw new Error("Map runtime has been destroyed.");
        }
        state.activeSearch = runtime.search.normalizeText(value);
        return state.activeSearch;
      },
      normalizeSearchQuery(value) {
        return runtime.search.normalizeText(value);
      },
      getSearchQuery() {
        return state.activeSearch;
      },
      setSearchQuery(value) {
        return runtime.applySearch(value);
      },
      clearSearchQuery() {
        return runtime.applySearch("");
      },
      getCategoryState(category) {
        return Boolean(state.activeCategories[category]);
      },
      getCategoryStates() {
        return { ...state.activeCategories };
      },
      replaceCategoryState(categories) {
        if (state.destroyed) {
          throw new Error("Map runtime has been destroyed.");
        }
        state.activeCategories = normalizeCategories(categories);
        return runtime.getCategoryStates();
      },
      toggleCategory(category) {
        return runtime.setCategoryState(category, !runtime.getCategoryState(category));
      },
      clearCategoryState() {
        if (state.destroyed) {
          throw new Error("Map runtime has been destroyed.");
        }
        state.activeCategories = Object.fromEntries(
          Object.keys(state.activeCategories).map(category => [category, false])
        );
        return runtime.getCategoryStates();
      },
      getVisitedMarkerKey(floor, markerId) {
        return `${String(floor || "unknown")}:${String(markerId || "")}`;
      },
      isMarkerVisited(floor, markerId) {
        const floorAwareKey = runtime.getVisitedMarkerKey(floor, markerId);
        return state.visitedMarkerIds.has(floorAwareKey) || state.visitedMarkerIds.has(markerId);
      },
      setMarkerVisited(floor, markerId, isVisited) {
        const floorAwareKey = runtime.getVisitedMarkerKey(floor, markerId);
        if (isVisited) {
          state.visitedMarkerIds.add(floorAwareKey);
          state.visitedMarkerIds.delete(markerId);
        } else {
          state.visitedMarkerIds.delete(floorAwareKey);
          state.visitedMarkerIds.delete(markerId);
        }
        if (runtime.storage && typeof runtime.storage.setJSON === "function") {
          runtime.storage.setJSON(visitedMarkerStorageKey, Array.from(state.visitedMarkerIds));
        }
        return isVisited;
      },
      parseUrlState(source) {
        return runtime.urlState.parse(source);
      },
      serializeUrlState(nextState) {
        return runtime.urlState.serialize(nextState);
      },
      initializeSidebarResize(config) {
        if (state.destroyed) {
          throw new Error("Map runtime has been destroyed.");
        }
        if (sidebarResizeController) {
          throw new Error("Map runtime sidebar resize has already been initialized.");
        }
        sidebarResizeController = createSidebarResizeController(runtime, {
          ...(config || {}),
          onWidthChange: width => {
            state.sidebarWidth = width;
            config?.onWidthChange?.(width);
          }
        });
        if (!sidebarResizeController) return null;
        return sidebarResizeController;
      },
      setSidebarWidth(width) {
        if (state.destroyed) {
          throw new Error("Map runtime has been destroyed.");
        }
        if (!sidebarResizeController) return null;
        state.sidebarWidth = sidebarResizeController.setWidth(width);
        return state.sidebarWidth;
      },
      getSidebarResizeState() {
        if (!sidebarResizeController) return null;
        return { ...sidebarResizeController.getState() };
      },
      destroySidebarResize() {
        if (!sidebarResizeController) return;
        sidebarResizeController.destroy();
        sidebarResizeController = null;
      },
      getCoordinateDependencies() {
        return { ...normalizedCoordinateDependencies };
      },
      getAdapter() {
        return { ...adapter, floors: { ...adapter.floors }, categories: { ...adapter.categories } };
      },
      isDestroyed() {
        return state.destroyed;
      },
      isInitialized() {
        return state.initialized;
      }
    };

    return runtime;
  }

  const api = { createDisposer, createMapRuntime };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  if (globalObject) {
    globalObject.SAOMapRuntime = api;
    globalObject.createDisposer = createDisposer;
    globalObject.createMapRuntime = createMapRuntime;
  }
})(typeof window !== "undefined" ? window : globalThis);
