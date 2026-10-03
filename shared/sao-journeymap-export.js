(function (global) {
  "use strict";

  const TAG_END = 0;
  const TAG_BYTE = 1;
  const TAG_SHORT = 2;
  const TAG_INT = 3;
  const TAG_LONG = 4;
  const TAG_FLOAT = 5;
  const TAG_DOUBLE = 6;
  const TAG_STRING = 8;
  const TAG_LIST = 9;
  const TAG_COMPOUND = 10;
  const FLOAT_TAG_VALUE = Symbol("journeymapFloatTagValue");

  const JOURNEYMAP_DIMENSION_CONFIG = Object.freeze({
    aincrad: Object.freeze({ id: "minecraft:overworld", label: "Aincrad" }),
    underworld: Object.freeze({ id: "minecraft:overworld", label: "Fractured Underworld" }),
    default: Object.freeze({ id: "minecraft:overworld", label: "Overworld" })
  });

  const JOURNEYMAP_ICON_CONFIG = Object.freeze({
    textureWidth: 16,
    textureHeight: 16,
    rotation: 0,
    opacity: 1,
    resourceLocation: "journeymap:textures/waypoint/icon/waypoint-icon.png"
  });

  const colorUtils =
    (typeof require === "function" && typeof module !== "undefined" && module.exports)
      ? require("./sao-color-utils.js")
      : (global.SAOColorUtils || global.SAOJourneyMapColors || {});

  function toUint8Array(source) {
    if (source instanceof Uint8Array) return source;
    if (ArrayBuffer.isView(source)) return new Uint8Array(source.buffer, source.byteOffset, source.byteLength);
    if (source instanceof ArrayBuffer) return new Uint8Array(source);
    if (Array.isArray(source)) return new Uint8Array(source);
    return new Uint8Array(0);
  }

  function utf8Encode(value) {
    return new TextEncoder().encode(String(value ?? ""));
  }

  function utf8Decode(bytes) {
    return new TextDecoder("utf-8", { fatal: false }).decode(bytes);
  }

  function normalizeDimensionId(worldName, explicitDimensionId) {
    const explicit = String(explicitDimensionId || "").trim();
    if (explicit.includes(":")) return explicit;
    const normalizedName = (explicit || String(worldName || "")).trim().toLowerCase();
    if (normalizedName === "underworld" || normalizedName.includes("under") || normalizedName.includes("fu")) {
      return JOURNEYMAP_DIMENSION_CONFIG.underworld.id;
    }
    if (normalizedName === "aincrad" || normalizedName.includes("aincrad"))
      return JOURNEYMAP_DIMENSION_CONFIG.aincrad.id;
    return JOURNEYMAP_DIMENSION_CONFIG.default.id;
  }

  function normalizeCategoryName(value) {
    const trimmed = String(value ?? "").trim();
    return trimmed || "journeymap_group";
  }

  function createUuid(usedIds) {
    let uuid = "";
    do {
      if (global.crypto && typeof global.crypto.randomUUID === "function") {
        uuid = global.crypto.randomUUID();
      } else {
        const bytes = new Uint8Array(16);
        if (global.crypto && typeof global.crypto.getRandomValues === "function") {
          global.crypto.getRandomValues(bytes);
        } else {
          for (let index = 0; index < bytes.length; index += 1) bytes[index] = Math.floor(Math.random() * 256);
        }
        bytes[6] = (bytes[6] & 0x0f) | 0x40;
        bytes[8] = (bytes[8] & 0x3f) | 0x80;
        const hex = Array.from(bytes, (value) => value.toString(16).padStart(2, "0")).join("");
        uuid = `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
      }
    } while (usedIds.has(uuid));
    usedIds.add(uuid);
    return uuid;
  }

  function floatTag(value) {
    return { [FLOAT_TAG_VALUE]: Number(value) };
  }

  function journeyMapIcon(source) {
    if (
      source &&
      typeof source === "object" &&
      typeof source.resourceLocation === "string" &&
      Number.isInteger(Number(source.textureWidth)) &&
      Number.isInteger(Number(source.textureHeight)) &&
      Number.isInteger(Number(source.rotation)) &&
      Number.isFinite(Number(source.opacity))
    ) {
      return {
        textureWidth: Number(source.textureWidth),
        rotation: Number(source.rotation),
        opacity: floatTag(source.opacity),
        resourceLocation: source.resourceLocation,
        textureHeight: Number(source.textureHeight)
      };
    }
    return {
      textureWidth: JOURNEYMAP_ICON_CONFIG.textureWidth,
      rotation: JOURNEYMAP_ICON_CONFIG.rotation,
      opacity: floatTag(JOURNEYMAP_ICON_CONFIG.opacity),
      resourceLocation: JOURNEYMAP_ICON_CONFIG.resourceLocation,
      textureHeight: JOURNEYMAP_ICON_CONFIG.textureHeight
    };
  }

  function normalizeJourneyMapColor(value) {
    if (typeof value === "string") {
      const normalizedHex = colorUtils && typeof colorUtils.normalizeHexColor === "function" ? colorUtils.normalizeHexColor(value) : null;
      if (normalizedHex) {
        const parsed = Number.parseInt(normalizedHex.slice(1), 16);
        return 0xff000000 | parsed;
      }
    }

    let numeric = Number(value);
    if (!Number.isFinite(numeric)) numeric = 0xffffff;
    const unsigned = numeric >>> 0;
    return unsigned <= 0xffffff ? 0xff000000 | unsigned : unsigned | 0;
  }

  function resolveJourneyMapCategoryColor(categoryName, worldName, excludedColors, explicitColor) {
    const targetName = normalizeCategoryName(categoryName);
    if (!targetName) {
      return 0xffffff;
    }

    if (targetName.toLowerCase() === "biomes") {
      return normalizeJourneyMapColor("#FFFFFF");
    }

    if (explicitColor !== undefined && explicitColor !== null) {
      const explicitHex = colorUtils && typeof colorUtils.normalizeHexColor === "function"
        ? colorUtils.normalizeHexColor(explicitColor)
        : null;
      if (explicitHex && colorUtils && typeof colorUtils.rgbToJourneyMapInt === "function") {
        return colorUtils.rgbToJourneyMapInt(explicitHex);
      }
      return normalizeJourneyMapColor(explicitColor);
    }

    const resolvedHex = colorUtils && typeof colorUtils.getJourneyMapColorValue === "function"
      ? colorUtils.getJourneyMapColorValue(targetName, {
          world: worldName,
          excludedColors: excludedColors instanceof Set ? excludedColors : new Set(Array.isArray(excludedColors) ? excludedColors : []),
          color: null
        })
      : null;

    if (!resolvedHex) {
      return 0xffffff;
    }

    const rgbInt =
      colorUtils && typeof colorUtils.rgbToJourneyMapInt === "function"
        ? colorUtils.rgbToJourneyMapInt(resolvedHex)
        : null;
    return rgbInt !== null ? rgbInt : normalizeJourneyMapColor(resolvedHex);
  }

  function normalizeWaypointEntry(entry, dimensionId, groupId, usedIds, categoryColorOverride) {
    const safeName = String(entry && (entry.name || entry.title) ? entry.name || entry.title : "Waypoint").trim();
    const xValue = Number(entry && entry.x !== undefined ? entry.x : entry && entry.coords ? entry.coords.x : 0);
    const zValue = Number(entry && entry.z !== undefined ? entry.z : entry && entry.coords ? entry.coords.z : 0);
    const fallbackColor = entry && (entry.color ?? entry.hexColor ?? entry.colour ?? entry.tint);
    const colorValue =
      entry && entry.waypointColor !== undefined
        ? entry.waypointColor
        : fallbackColor ?? categoryColorOverride ?? 0xffffff;
    const waypointId = createUuid(usedIds);
    return {
      settings: { showDeviation: false, enable: true, persistent: true },
      color: normalizeJourneyMapColor(colorValue),
      pos: {
        x: Number.isFinite(xValue) ? Math.round(xValue) : 0,
        y: -30,
        z: Number.isFinite(zValue) ? Math.round(zValue) : 0,
        dimension: dimensionId
      },
      origin: "journeymap",
      groupId,
      icon: journeyMapIcon(entry && entry.icon),
      name: safeName || "Waypoint",
      guid: waypointId,
      modId: "journeymap",
      dimensions: [dimensionId]
    };
  }

  function createJourneyMapGroupSettings(display, locked, colorOverride) {
    return {
      showDeviation: false,
      enable: true,
      display,
      locked,
      colorOverride
    };
  }

  function createJourneyMapBuiltInGroups(selectedGroupId) {
    return {
      journeymap_all: {
        settings: createJourneyMapGroupSettings(
          {
            hide_empty: "false",
            sort_type: "asc",
            last_selected: selectedGroupId,
            last_selected_group: selectedGroupId,
            dimDisplay: "all",
            sort: "name",
            hide_all: "false",
            hide_empty_death: "false",
            hide_empty_temp: "false"
          },
          true,
          false
        ),
        icon: journeyMapIcon(),
        name: "All",
        guid: "journeymap_all",
        modId: "journeymap"
      },
      journeymap_death: {
        settings: createJourneyMapGroupSettings({}, true, true),
        color: 0xff0000,
        icon: journeyMapIcon(),
        name: "Death",
        guid: "journeymap_death",
        modId: "journeymap"
      },
      journeymap_temp: {
        settings: createJourneyMapGroupSettings({ dimDisplay: "all" }, true, false),
        icon: journeyMapIcon(),
        name: "Temp",
        guid: "journeymap_temp",
        tag: "Temp",
        modId: "journeymap"
      },
      journeymap_default: {
        settings: createJourneyMapGroupSettings(
          { wp_sort: "name", dimDisplay: "all", wp_sort_type: "asc" },
          false,
          false
        ),
        icon: journeyMapIcon(),
        name: "Default",
        guid: "journeymap_default",
        modId: "journeymap"
      }
    };
  }

  function createJourneyMapCustomGroup(name, guid) {
    return {
      settings: createJourneyMapGroupSettings(
        { wp_sort: "name", dimDisplay: "all", wp_sort_type: "asc" },
        false,
        false
      ),
      icon: journeyMapIcon(),
      name,
      guid,
      tag: "",
      modId: "journeymap"
    };
  }

  function toPlainNbtValue(value) {
    if (value && typeof value === "object" && Object.prototype.hasOwnProperty.call(value, FLOAT_TAG_VALUE)) {
      return value[FLOAT_TAG_VALUE];
    }
    if (Array.isArray(value)) return value.map(toPlainNbtValue);
    if (value && typeof value === "object") {
      return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, toPlainNbtValue(child)]));
    }
    return value;
  }

  function writeByte(bytes, value) {
    bytes.push(value & 0xff);
  }

  function writeShort(bytes, value) {
    const numeric = Number(value) | 0;
    bytes.push((numeric >> 8) & 0xff, numeric & 0xff);
  }

  function writeInt(bytes, value) {
    const numeric = Number(value) | 0;
    bytes.push((numeric >>> 24) & 0xff, (numeric >>> 16) & 0xff, (numeric >>> 8) & 0xff, numeric & 0xff);
  }

  function writeLong(bytes, value) {
    const numeric = BigInt(value ?? 0);
    const low = Number(numeric & 0xffffffffn) >>> 0;
    const high = Number((numeric >> 32n) & 0xffffffffn) >>> 0;
    bytes.push(
      (high >>> 24) & 0xff,
      (high >>> 16) & 0xff,
      (high >>> 8) & 0xff,
      high & 0xff,
      (low >>> 24) & 0xff,
      (low >>> 16) & 0xff,
      (low >>> 8) & 0xff,
      low & 0xff
    );
  }

  function writeFloat(bytes, value) {
    const view = new DataView(new ArrayBuffer(4));
    view.setFloat32(0, Number(value), false);
    const raw = new Uint8Array(view.buffer);
    bytes.push(raw[0], raw[1], raw[2], raw[3]);
  }

  function writeDouble(bytes, value) {
    const view = new DataView(new ArrayBuffer(8));
    view.setFloat64(0, Number(value), false);
    const raw = new Uint8Array(view.buffer);
    bytes.push(raw[0], raw[1], raw[2], raw[3], raw[4], raw[5], raw[6], raw[7]);
  }

  function writeString(bytes, value) {
    const encoded = utf8Encode(value ?? "");
    writeShort(bytes, encoded.length);
    for (const byte of encoded) {
      bytes.push(byte);
    }
  }

  function writeNbtValue(bytes, typeId, value) {
    if (value && typeof value === "object" && Object.prototype.hasOwnProperty.call(value, FLOAT_TAG_VALUE)) {
      value = value[FLOAT_TAG_VALUE];
    }
    switch (typeId) {
      case TAG_END:
        return;
      case TAG_BYTE:
        writeByte(bytes, Number(value) & 0xff);
        return;
      case TAG_SHORT:
        writeShort(bytes, Number(value));
        return;
      case TAG_INT:
        writeInt(bytes, Number(value));
        return;
      case TAG_LONG:
        writeLong(bytes, Number(value));
        return;
      case TAG_FLOAT:
        writeFloat(bytes, Number(value));
        return;
      case TAG_DOUBLE:
        writeDouble(bytes, Number(value));
        return;
      case TAG_STRING:
        writeString(bytes, String(value ?? ""));
        return;
      case TAG_LIST: {
        const list = Array.isArray(value) ? value : [];
        const itemType = inferListTypeId(list);
        writeByte(bytes, itemType);
        writeInt(bytes, list.length);
        for (const item of list) {
          writeNbtValue(bytes, itemType, item);
        }
        return;
      }
      case TAG_COMPOUND: {
        if (value && typeof value === "object" && !Array.isArray(value)) {
          for (const [key, childValue] of Object.entries(value)) {
            const childType = inferNbtTypeId(childValue);
            writeByte(bytes, childType);
            writeString(bytes, key);
            writeNbtValue(bytes, childType, childValue);
          }
          writeByte(bytes, TAG_END);
        }
        return;
      }
      default:
        writeString(bytes, String(value ?? ""));
    }
  }

  function inferListTypeId(list) {
    if (!Array.isArray(list) || list.length === 0) return TAG_STRING;
    const firstItem = list[0];
    if (firstItem && typeof firstItem === "object" && !Array.isArray(firstItem)) return TAG_COMPOUND;
    if (typeof firstItem === "number") return Number.isInteger(firstItem) ? TAG_INT : TAG_FLOAT;
    if (typeof firstItem === "boolean") return TAG_BYTE;
    return TAG_STRING;
  }

  function inferNbtTypeId(value) {
    if (value && typeof value === "object" && Object.prototype.hasOwnProperty.call(value, FLOAT_TAG_VALUE)) {
      return TAG_FLOAT;
    }
    if (value === null || value === undefined) return TAG_STRING;
    if (typeof value === "boolean") return TAG_BYTE;
    if (typeof value === "number") return Number.isInteger(value) ? TAG_INT : TAG_FLOAT;
    if (typeof value === "string") return TAG_STRING;
    if (Array.isArray(value)) return TAG_LIST;
    if (value && typeof value === "object") return TAG_COMPOUND;
    return TAG_STRING;
  }

  function serializeJourneyMapNbt(rootValue) {
    const bytes = [];
    writeByte(bytes, TAG_COMPOUND);
    writeString(bytes, "");
    for (const [key, value] of Object.entries(rootValue || {})) {
      const typeId = inferNbtTypeId(value);
      writeByte(bytes, typeId);
      writeString(bytes, key);
      writeNbtValue(bytes, typeId, value);
    }
    writeByte(bytes, TAG_END);
    return new Uint8Array(bytes);
  }

  function buildJourneyMapExport(config) {
    const worldName = String(config && config.world ? config.world : "");
    const dimensionId = normalizeDimensionId(worldName, config && config.dimensionId ? config.dimensionId : null);
    const categories = config && config.categories ? config.categories : {};
    const categoryEntries = Object.entries(categories)
      .map(([categoryName, entries]) => [normalizeCategoryName(categoryName), Array.isArray(entries) ? entries : []])
      .filter(([, entries]) => entries.some((entry) => entry && typeof entry === "object"));
    const usedIds = new Set(["journeymap_all", "journeymap_death", "journeymap_temp", "journeymap_default"]);
    const firstCategoryIsDefault = categoryEntries[0]?.[0].toLowerCase() === "default";
    const selectedGroupId = categoryEntries.length
      ? firstCategoryIsDefault
        ? "journeymap_default"
        : createUuid(usedIds)
      : "journeymap_default";
    const root = {
      groups: createJourneyMapBuiltInGroups(selectedGroupId),
      waypoints: {}
    };
    const assignedCategoryColors = new Set();

    categoryEntries.forEach(([categoryName, entries], categoryIndex) => {
      const normalizedCategory = normalizeCategoryName(categoryName);
      const groupId =
        normalizedCategory.toLowerCase() === "default"
          ? "journeymap_default"
          : categoryIndex === 0
            ? selectedGroupId
            : createUuid(usedIds);
      const excludedHexColors = new Set(
        Array.from(assignedCategoryColors)
          .map((value) =>
            colorUtils && typeof colorUtils.normalizeHexColor === "function" ? colorUtils.normalizeHexColor(value) : null
          )
          .filter(Boolean)
      );
      const explicitCategoryColor = entries
        .map((entry) =>
          entry && typeof entry === "object"
            ? entry.categoryColor ?? entry.color ?? entry.hexColor ?? entry.colour ?? entry.tint
            : null
        )
        .find((value) => value !== undefined && value !== null && (typeof value === "string" || typeof value === "number"));
      const categoryColor = resolveJourneyMapCategoryColor(
        normalizedCategory,
        worldName,
        excludedHexColors,
        explicitCategoryColor
      );
      assignedCategoryColors.add(categoryColor);
      if (groupId !== "journeymap_default") {
        root.groups[groupId] = createJourneyMapCustomGroup(normalizedCategory, groupId);
      } else {
        root.groups[groupId].name = normalizedCategory;
      }
      root.groups[groupId].color = categoryColor & 0x00ffffff;
      entries.forEach((entry) => {
        if (!entry || typeof entry !== "object") return;
        const waypointEntry =
          normalizedCategory.toLowerCase() === "biomes"
            ? { ...entry, color: "#FFFFFF", waypointColor: "#FFFFFF" }
            : entry;
        const waypoint = normalizeWaypointEntry(waypointEntry, dimensionId, groupId, usedIds, categoryColor);
        root.waypoints[waypoint.guid] = waypoint;
      });
    });

    return {
      groups: toPlainNbtValue(root.groups),
      waypoints: toPlainNbtValue(root.waypoints),
      world: worldName,
      dimensionId,
      toUint8Array() {
        return serializeJourneyMapNbt(root);
      },
      toBlob() {
        return new Blob([serializeJourneyMapNbt(root)], { type: "application/octet-stream" });
      }
    };
  }

  function parseJourneyMapDat(input) {
    const bytes = toUint8Array(input);
    if (bytes.length === 0) return null;
    let offset = 0;

    function readByte() {
      return bytes[offset++];
    }

    function readShort() {
      const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
      const value = view.getInt16(offset, false);
      offset += 2;
      return value;
    }

    function readInt() {
      const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
      const value = view.getInt32(offset, false);
      offset += 4;
      return value;
    }

    function readLong() {
      const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
      const value = view.getBigInt64(offset, false);
      offset += 8;
      return value;
    }

    function readFloat() {
      const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
      const value = view.getFloat32(offset, false);
      offset += 4;
      return value;
    }

    function readDouble() {
      const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
      const value = view.getFloat64(offset, false);
      offset += 8;
      return value;
    }

    function readString() {
      const length = readShort();
      const slice = bytes.subarray(offset, offset + length);
      offset += length;
      return utf8Decode(slice);
    }

    function readList(typeId) {
      const items = [];
      const count = readInt();
      for (let index = 0; index < count; index += 1) {
        items.push(readValue(typeId));
      }
      return items;
    }

    function readCompound() {
      const object = {};
      while (offset < bytes.length) {
        const nextType = readByte();
        if (nextType === TAG_END) break;
        const key = readString();
        object[key] = readValue(nextType);
      }
      return object;
    }

    function readValue(tagType) {
      switch (tagType) {
        case TAG_END:
          return null;
        case TAG_BYTE:
          return readByte();
        case TAG_SHORT:
          return readShort();
        case TAG_INT:
          return readInt();
        case TAG_LONG:
          return readLong();
        case TAG_FLOAT:
          return readFloat();
        case TAG_DOUBLE:
          return readDouble();
        case TAG_STRING:
          return readString();
        case TAG_LIST: {
          const itemType = readByte();
          return readList(itemType);
        }
        case TAG_COMPOUND:
          return readCompound();
        default:
          return null;
      }
    }

    const rootType = readByte();
    if (rootType !== TAG_COMPOUND) {
      throw new TypeError("JourneyMap export payload must start with a NBT compound root.");
    }
    const rootName = readString();
    const root = readCompound();
    if (rootName) {
      return { [rootName]: root };
    }
    return root;
  }

  const api = {
    JOURNEYMAP_DIMENSION_CONFIG,
    normalizeDimensionId,
    buildJourneyMapExport,
    parseJourneyMapDat,
    serializeJourneyMapNbt
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  global.SAOJourneyMapExport = api;
})(typeof window !== "undefined" ? window : globalThis);
