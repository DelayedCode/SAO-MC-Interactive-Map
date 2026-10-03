(function (global) {
  "use strict";

  const colorUtils =
    (typeof require === "function" && typeof module !== "undefined" && module.exports)
      ? require("./sao-color-utils.js")
      : (global.SAOColorUtils || global.SAOJourneyMapColors || {});

  const DEFAULT_CUSTOM_BUTTON = "Default";
  const LOGO_IDS = Object.freeze([
    "pin",
    "star",
    "flag",
    "home",
    "chest",
    "sword",
    "shield",
    "skull",
    "diamond",
    "target"
  ]);

  function normalizeCustomButtonName(value, fallback = DEFAULT_CUSTOM_BUTTON) {
    const trimmed = String(value ?? "").trim();
    return trimmed || fallback;
  }

  function normalizeCustomButtonKey(value) {
    return normalizeCustomButtonName(value, DEFAULT_CUSTOM_BUTTON).toLowerCase();
  }

  const safeColorUtils = {
    normalizeHexColor(value) {
      if (typeof colorUtils !== "undefined" && colorUtils && typeof colorUtils.normalizeHexColor === "function") {
        return colorUtils.normalizeHexColor(value);
      }
      if (typeof value !== "string") return null;
      const trimmed = value.trim();
      if (!trimmed) return null;
      const normalized = trimmed.startsWith("#") ? trimmed.slice(1) : trimmed;
      if (!/^[0-9a-fA-F]{6}$/.test(normalized)) {
        return null;
      }
      return `#${normalized.toUpperCase()}`;
    }
  };

  function normalizeRecord(record, world, floorIds) {
    const buttonName = normalizeCustomButtonName(record && record.button, DEFAULT_CUSTOM_BUTTON);
    return {
      id: record.id,
      name: String(record.name || ""),
      description: typeof record.description === "string" ? record.description : "",
      x: Number(record.x),
      z: Number(record.z),
      floor: record.floor,
      world,
      button: buttonName,
      buttonColor: safeColorUtils.normalizeHexColor(record && record.buttonColor) || undefined,
      waypointColor: safeColorUtils.normalizeHexColor(record && record.waypointColor) || undefined,
      logo: LOGO_IDS.includes(record.logo) ? record.logo : "pin"
    };
  }

  function createCustomWaypointStore(options) {
    const config = options || {};
    const storage = config.storage;
    const world = String(config.world || "");
    const floorIds = new Set(Array.isArray(config.floorIds) ? config.floorIds : []);
    if (!storage || typeof storage.getJSON !== "function" || typeof storage.setJSON !== "function") {
      throw new TypeError("Custom waypoint storage requires SAOStorage JSON helpers.");
    }
    if (!world || floorIds.size === 0) {
      throw new TypeError("Custom waypoint stores require a world and at least one floor.");
    }

    const storageKey = `sao.customWaypoints.${world}`;
    const colorStorageKey = `sao.customWaypoints.colors.${world}`;
    const buttonEnabledStorageKey = `sao.customWaypoints.enabled.${world}`;
    const storedRecords = storage.getJSON(storageKey, []);
    const storedButtonStates = storage.getJSON(buttonEnabledStorageKey, null);
    let buttonEnabledStates =
      storedButtonStates && typeof storedButtonStates === "object" && !Array.isArray(storedButtonStates)
        ? storedButtonStates
        : {};
    let buttonEnabledStateInitialized = Boolean(
      storedButtonStates && typeof storedButtonStates === "object" && !Array.isArray(storedButtonStates)
    );
    const records = Array.isArray(storedRecords)
      ? storedRecords
          .filter(
            (record) =>
              record &&
              typeof record.id === "string" &&
              record.id &&
              record.world === world &&
              floorIds.has(record.floor) &&
              typeof record.name === "string" &&
              record.name.trim() &&
              Number.isFinite(Number(record.x)) &&
              Number.isFinite(Number(record.z))
          )
          .map((record) => normalizeRecord(record, world, floorIds))
      : [];
    const markerDatasets = new Map();
    const recordsByFloor = new Map();
    let revision = 0;

    function persist() {
      storage.setJSON(storageKey, records);
    }

    function invalidate(floor) {
      if (!floor) {
        markerDatasets.clear();
        recordsByFloor.clear();
        return;
      }
      for (const [key] of markerDatasets) {
        if (key.startsWith(`${floor}:`)) {
          markerDatasets.delete(key);
        }
      }
      for (const [key] of recordsByFloor) {
        if (key.startsWith(`${floor}:`)) {
          recordsByFloor.delete(key);
        }
      }
    }

    function getButtonNamesForFloor(floor) {
      const names = [];
      const seen = new Set();
      records.forEach((record) => {
        if (record.floor !== floor) return;
        const buttonName = normalizeCustomButtonName(record.button, DEFAULT_CUSTOM_BUTTON);
        const key = normalizeCustomButtonKey(buttonName);
        if (seen.has(key)) return;
        seen.add(key);
        names.push(buttonName);
      });
      return names;
    }

    function getButtonStateKey(buttonName, floor) {
      return `${String(floor || "").trim()}:${normalizeCustomButtonKey(buttonName)}`;
    }

    function getButtonEnabled(buttonName, floor) {
      const key = getButtonStateKey(buttonName, floor);
      return Object.prototype.hasOwnProperty.call(buttonEnabledStates, key) ? Boolean(buttonEnabledStates[key]) : false;
    }

    function setButtonEnabled(buttonName, floor, enabled) {
      const normalizedButton = normalizeCustomButtonName(buttonName, DEFAULT_CUSTOM_BUTTON);
      const targetFloor = String(floor || "").trim();
      if (!targetFloor || !normalizedButton) return false;
      const key = getButtonStateKey(normalizedButton, targetFloor);
      const nextEnabled = Boolean(enabled);
      if (buttonEnabledStates[key] === nextEnabled) return nextEnabled;
      buttonEnabledStates[key] = nextEnabled;
      buttonEnabledStateInitialized = true;
      storage.setJSON(buttonEnabledStorageKey, buttonEnabledStates);
      invalidate(targetFloor);
      return nextEnabled;
    }

    function getEnabledButtonsForFloor(floor) {
      return getButtonNamesForFloor(floor).filter((buttonName) => getButtonEnabled(buttonName, floor));
    }

    function initializeButtonEnabledState(defaultEnabled) {
      if (buttonEnabledStateInitialized) return false;
      records.forEach((record) => {
        buttonEnabledStates[getButtonStateKey(record.button, record.floor)] = Boolean(defaultEnabled);
      });
      buttonEnabledStateInitialized = true;
      storage.setJSON(buttonEnabledStorageKey, buttonEnabledStates);
      invalidate();
      return true;
    }

    function getRecordsForFloorWithButton(floor, buttonName) {
      const target = normalizeCustomButtonName(buttonName, DEFAULT_CUSTOM_BUTTON);
      return Object.freeze(
        records.filter(
          (record) =>
            record.floor === floor && normalizeCustomButtonName(record.button, DEFAULT_CUSTOM_BUTTON) === target
        )
      );
    }

    function getMarkerDataset(floor) {
      const cacheKey = `${floor}:enabled`;
      if (markerDatasets.has(cacheKey)) return markerDatasets.get(cacheKey);
      const dataset = {};
      const enabledButtons = new Set(getEnabledButtonsForFloor(floor).map(normalizeCustomButtonKey));
      records.forEach((record) => {
        if (record.floor !== floor) return;
        if (!enabledButtons.has(normalizeCustomButtonKey(record.button))) return;
        const markerId = `custom:${record.id}`;
        dataset[markerId] = {
          id: markerId,
          title: record.name,
          description: record.description,
          type: "custom",
          category: "custom",
          floor: record.floor,
          coords: { x: record.x, z: record.z },
          customWaypointId: record.id,
          customLogo: record.logo,
          customWaypointButton: normalizeCustomButtonName(record.button, DEFAULT_CUSTOM_BUTTON),
          customWaypointButtonColor: record.buttonColor || getButtonColor(record.button, record.floor),
          color: record.waypointColor
        };
      });
      markerDatasets.set(cacheKey, Object.freeze(dataset));
      return markerDatasets.get(cacheKey);
    }

    function createId() {
      if (global.crypto && typeof global.crypto.randomUUID === "function") return global.crypto.randomUUID();
      return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
    }

    function prepareMany(values) {
      if (!Array.isArray(values)) return null;
      const prepared = [];
      const seenIds = new Set(records.map((record) => record.id));
      let duplicateCount = 0;

      for (const input of values) {
        if (!input || typeof input !== "object") return null;
        const id = typeof input.id === "string" ? input.id.trim() : "";
        const name = typeof input.name === "string" ? input.name : String(input.name || "");
        const description = typeof input.description === "string" ? input.description.trim() : "";
        const floor = String(input.floor || "");
        const x = Number(input.x);
        const z = Number(input.z);
        const requestedButton = normalizeCustomButtonName(input.button || input.category || "", DEFAULT_CUSTOM_BUTTON);
        const button =
          getButtonNamesForFloor(floor).find((name) => normalizeCustomButtonKey(name) === normalizeCustomButtonKey(requestedButton)) ||
          requestedButton;

        if (!id || !name.trim() || !floorIds.has(floor) || !Number.isFinite(x) || !Number.isFinite(z)) return null;
        if (seenIds.has(id)) {
          duplicateCount += 1;
          continue;
        }

        seenIds.add(id);
        prepared.push({
          id,
          name,
          description,
          x,
          z,
          floor,
          world,
          button,
          buttonColor: safeColorUtils.normalizeHexColor(input.buttonColor || input.categoryColor || input.hexColor || input.color) || undefined,
          waypointColor: safeColorUtils.normalizeHexColor(input.waypointColor) || undefined,
          logo: LOGO_IDS.includes(input.logo) ? input.logo : "pin"
        });
      }
      return { prepared, duplicateCount };
    }

    function readButtonColors() {
      const value = storage.getJSON(colorStorageKey, {});
      return value && typeof value === "object" && !Array.isArray(value) ? value : {};
    }

    function writeButtonColors(nextColors) {
      storage.setJSON(colorStorageKey, nextColors);
      return nextColors;
    }

    function getButtonColor(buttonName, floor) {
      const normalizedButton = normalizeCustomButtonName(buttonName, DEFAULT_CUSTOM_BUTTON);
      const colorMap = readButtonColors();
      const key = `${String(floor || "").trim()}:${normalizedButton.toLowerCase()}`;
      const stored = colorMap[key] || colorMap[normalizedButton.toLowerCase()];
      const normalized = safeColorUtils.normalizeHexColor(stored);
      return normalized || null;
    }

    function setButtonColor(buttonName, floorOrColor, maybeColor) {
      const normalizedButton = normalizeCustomButtonName(buttonName, DEFAULT_CUSTOM_BUTTON);
      const valueIsHex = (value) => typeof value === "string" && !!safeColorUtils.normalizeHexColor(value);
      const floorIsHex = valueIsHex(floorOrColor);
      const colorTarget = safeColorUtils.normalizeHexColor(floorIsHex ? floorOrColor : maybeColor);
      const floorValue = floorIsHex ? String(maybeColor || "") : String(floorOrColor || "");
      if (!colorTarget) return null;
      const key = `${floorValue.trim()}:${normalizedButton.toLowerCase()}`;
      const colorMap = readButtonColors();
      colorMap[key] = colorTarget;
      colorMap[normalizedButton.toLowerCase()] = colorTarget;
      writeButtonColors(colorMap);
      return colorTarget;
    }

    return Object.freeze({
      storageKey,
      world,
      logoIds: LOGO_IDS,
      getRecords() {
        return records.slice();
      },
      getRecord(id) {
        return records.find((record) => record.id === id) || null;
      },
      getRecordsForFloor(floor, buttonName) {
        const cacheKey = `${floor}:${buttonName ? normalizeCustomButtonKey(buttonName) : "all"}`;
        if (recordsByFloor.has(cacheKey)) return recordsByFloor.get(cacheKey);
        const floorRecords = Object.freeze(
          records.filter((record) => {
            if (record.floor !== floor) return false;
            if (buttonName) {
              return normalizeCustomButtonKey(record.button) === normalizeCustomButtonKey(buttonName);
            }
            return true;
          })
        );
        recordsByFloor.set(cacheKey, floorRecords);
        return floorRecords;
      },
      getCustomButtonNames() {
        const names = [];
        const seen = new Set();
        records.forEach((record) => {
          const buttonName = normalizeCustomButtonName(record.button, DEFAULT_CUSTOM_BUTTON);
          const key = normalizeCustomButtonKey(buttonName);
          if (seen.has(key)) return;
          seen.add(key);
          names.push(buttonName);
        });
        return names;
      },
      getCustomButtonsForFloor(floor) {
        return getButtonNamesForFloor(floor);
      },
      getButtonCountsForFloor(floor) {
        const counts = {};
        records.forEach((record) => {
          if (record.floor !== floor) return;
          const buttonName = normalizeCustomButtonName(record.button, DEFAULT_CUSTOM_BUTTON);
          counts[buttonName] = (counts[buttonName] || 0) + 1;
        });
        return counts;
      },
      countForButton(buttonName, floor) {
        const target = normalizeCustomButtonName(buttonName, DEFAULT_CUSTOM_BUTTON);
        return records.reduce(
          (count, record) =>
            count +
            Number(
              record.floor === floor && normalizeCustomButtonName(record.button, DEFAULT_CUSTOM_BUTTON) === target
            ),
          0
        );
      },
      getButtonColor,
      setButtonColor,
      getButtonEnabled,
      setButtonEnabled,
      getEnabledButtonsForFloor,
      hasEnabledButtons(floor) {
        return getEnabledButtonsForFloor(floor).length > 0;
      },
      initializeButtonEnabledState,
      hasAny() {
        return records.length > 0;
      },
      count() {
        return records.length;
      },
      getRevision() {
        return revision;
      },
      canAddMany(values) {
        return prepareMany(values) !== null;
      },
      countForFloor(floor, buttonName) {
        if (buttonName) {
          return getRecordsForFloorWithButton(floor, buttonName).length;
        }
        return records.reduce((count, record) => count + Number(record.floor === floor), 0);
      },
      removeButton(buttonName, floor) {
        const targetFloor = String(floor || "");
        const targetButton = normalizeCustomButtonName(buttonName, DEFAULT_CUSTOM_BUTTON);
        if (!targetFloor || !targetButton) return 0;

        const removed = [];
        const remaining = [];
        records.forEach((record) => {
          const matches =
            record.floor === targetFloor &&
            normalizeCustomButtonName(record.button, DEFAULT_CUSTOM_BUTTON) === targetButton;
          if (matches) {
            removed.push(record.id);
            return;
          }
          remaining.push(record);
        });

        if (removed.length === 0) return 0;

        records.length = 0;
        records.push(...remaining);
        delete buttonEnabledStates[getButtonStateKey(targetButton, targetFloor)];
        storage.setJSON(buttonEnabledStorageKey, buttonEnabledStates);
        revision += 1;
        invalidate(targetFloor);
        persist();
        return removed.length;
      },
      getMarkerDataset,
      add(values) {
        const input = values || {};
        const name = String(input.name || "").trim();
        const description = String(input.description || "").trim();
        const floor = String(input.floor || "");
        const xText = String(input.x ?? "").trim();
        const zText = String(input.z ?? "").trim();
        const x = Number(xText);
        const z = Number(zText);
        if (!name || !xText || !zText || !Number.isFinite(x) || !Number.isFinite(z) || !floorIds.has(floor)) {
          return null;
        }
        const suppliedButton = normalizeCustomButtonName(input.button || input.category || "", DEFAULT_CUSTOM_BUTTON);
        const buttonName =
          getButtonNamesForFloor(floor).find((name) => normalizeCustomButtonKey(name) === normalizeCustomButtonKey(suppliedButton)) ||
          suppliedButton;
        const persistedColor = input.buttonColor || input.categoryColor || input.hexColor || input.color;
        if (persistedColor) {
          setButtonColor(buttonName, floor, persistedColor);
        } else if (!getButtonColor(buttonName, floor)) {
          const generatedColor =
            colorUtils && typeof colorUtils.randomHexColor === "function"
              ? colorUtils.randomHexColor(new Set(["#FFFFFF"]))
              : null;
          if (generatedColor) setButtonColor(buttonName, floor, generatedColor);
        }
        const record = {
          id: createId(),
          name,
          description,
          x,
          z,
          floor,
          world,
          button: buttonName,
          buttonColor: getButtonColor(buttonName, floor) || undefined,
          waypointColor: safeColorUtils.normalizeHexColor(input.waypointColor) || undefined,
          logo: LOGO_IDS.includes(input.logo) ? input.logo : "pin"
        };
        records.push(record);
        revision += 1;
        invalidate(floor);
        persist();
        return record;
      },
      addMany(values) {
        const batch = prepareMany(values);
        if (!batch) return null;
        if (batch.prepared.length === 0) return { records: [], duplicateCount: batch.duplicateCount };
        const nextColors = readButtonColors();
        let colorsChanged = false;
        batch.prepared.forEach((record) => {
          const buttonColor = safeColorUtils.normalizeHexColor(record.buttonColor);
          if (!buttonColor) return;
          const buttonKey = normalizeCustomButtonKey(record.button);
          nextColors[`${record.floor}:${buttonKey}`] = buttonColor;
          nextColors[buttonKey] = buttonColor;
          colorsChanged = true;
          record.buttonColor = buttonColor;
        });
        if (colorsChanged) writeButtonColors(nextColors);
        records.push(...batch.prepared);
        revision += 1;
        invalidate();
        persist();
        return { records: batch.prepared.slice(), duplicateCount: batch.duplicateCount };
      },
      remove(id) {
        const index = records.findIndex((record) => record.id === id);
        if (index < 0) return false;
        const [record] = records.splice(index, 1);
        revision += 1;
        invalidate(record.floor);
        persist();
        return true;
      }
    });
  }

  global.SAOCustomWaypoints = Object.freeze({
    createCustomWaypointStore,
    LOGO_IDS,
    DEFAULT_CUSTOM_BUTTON
  });
})(typeof window !== "undefined" ? window : globalThis);
