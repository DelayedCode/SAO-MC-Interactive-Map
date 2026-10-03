(function (global) {
  "use strict";

  const TAG_END = 0;
  const TAG_BYTE = 1;
  const TAG_SHORT = 2;
  const TAG_INT = 3;
  const TAG_LONG = 4;
  const TAG_FLOAT = 5;
  const TAG_DOUBLE = 6;
  const TAG_BYTE_ARRAY = 7;
  const TAG_STRING = 8;
  const TAG_LIST = 9;
  const TAG_COMPOUND = 10;
  const TAG_INT_ARRAY = 11;
  const TAG_LONG_ARRAY = 12;
  const MAX_NBT_NODES = 1000000;
  const MAX_NBT_ARRAY_LENGTH = 1000000;
  const compoundTagTypes = new WeakMap();
  const listItemTypes = new WeakMap();

  class JourneyMapImportError extends Error {
    constructor(code) {
      super(code);
      this.name = "JourneyMapImportError";
      this.code = code;
    }
  }

  function fail(code) {
    throw new JourneyMapImportError(code);
  }

  function isRecord(value) {
    return Boolean(value && typeof value === "object" && !Array.isArray(value));
  }

  function toUint8Array(input) {
    if (input instanceof Uint8Array) return input;
    if (ArrayBuffer.isView(input)) return new Uint8Array(input.buffer, input.byteOffset, input.byteLength);
    if (input instanceof ArrayBuffer) return new Uint8Array(input);
    fail("invalid");
  }

  function parseJourneyMapDat(input) {
    const bytes = toUint8Array(input);
    if (bytes.length < 3) fail("invalid");
    if ((bytes[0] === 0x1f && bytes[1] === 0x8b) || (bytes[0] === 0x78 && (bytes[1] & 0x20) === 0)) {
      fail("unsupported");
    }

    let offset = 0;
    let nodeCount = 0;
    const decoder = new TextDecoder("utf-8", { fatal: true });

    function ensure(length) {
      if (!Number.isSafeInteger(length) || length < 0 || offset + length > bytes.length) fail("invalid");
    }

    function readByte() {
      ensure(1);
      return bytes[offset++];
    }

    function readUnsignedShort() {
      ensure(2);
      const value = (bytes[offset] << 8) | bytes[offset + 1];
      offset += 2;
      return value;
    }

    function readShort() {
      ensure(2);
      const value = new DataView(bytes.buffer, bytes.byteOffset + offset, 2).getInt16(0, false);
      offset += 2;
      return value;
    }

    function readInt() {
      ensure(4);
      const value = new DataView(bytes.buffer, bytes.byteOffset + offset, 4).getInt32(0, false);
      offset += 4;
      return value;
    }

    function readLong() {
      ensure(8);
      const value = new DataView(bytes.buffer, bytes.byteOffset + offset, 8).getBigInt64(0, false);
      offset += 8;
      return value;
    }

    function readFloat() {
      ensure(4);
      const value = new DataView(bytes.buffer, bytes.byteOffset + offset, 4).getFloat32(0, false);
      offset += 4;
      return value;
    }

    function readDouble() {
      ensure(8);
      const value = new DataView(bytes.buffer, bytes.byteOffset + offset, 8).getFloat64(0, false);
      offset += 8;
      return value;
    }

    function readString() {
      const length = readUnsignedShort();
      ensure(length);
      try {
        const value = decoder.decode(bytes.subarray(offset, offset + length));
        offset += length;
        return value;
      } catch {
        fail("invalid");
      }
    }

    function readArrayLength(bytesPerItem) {
      const length = readInt();
      if (length < 0 || length > MAX_NBT_ARRAY_LENGTH || length * bytesPerItem > bytes.length - offset) fail("invalid");
      return length;
    }

    function readList(itemType, depth) {
      const length = readArrayLength(1);
      if (itemType > TAG_LONG_ARRAY || (itemType === TAG_END && length > 0)) fail("invalid");
      const values = [];
      listItemTypes.set(values, itemType);
      for (let index = 0; index < length; index += 1) values.push(readValue(itemType, depth + 1));
      return values;
    }

    function readCompound(depth) {
      const value = Object.create(null);
      const tagTypes = new Map();
      compoundTagTypes.set(value, tagTypes);
      while (offset < bytes.length) {
        const type = readByte();
        if (type === TAG_END) return value;
        if (type > TAG_LONG_ARRAY) fail("invalid");
        const name = readString();
        if (Object.prototype.hasOwnProperty.call(value, name)) fail("invalid");
        value[name] = readValue(type, depth + 1);
        tagTypes.set(name, type);
      }
      fail("invalid");
    }

    function readValue(type, depth) {
      nodeCount += 1;
      if (depth > 128 || nodeCount > MAX_NBT_NODES) fail("unsupported");
      switch (type) {
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
        case TAG_BYTE_ARRAY: {
          const length = readArrayLength(1);
          const value = bytes.slice(offset, offset + length);
          offset += length;
          return value;
        }
        case TAG_STRING:
          return readString();
        case TAG_LIST: {
          const itemType = readByte();
          return readList(itemType, depth);
        }
        case TAG_COMPOUND:
          return readCompound(depth);
        case TAG_INT_ARRAY: {
          const length = readArrayLength(4);
          const values = [];
          for (let index = 0; index < length; index += 1) values.push(readInt());
          return values;
        }
        case TAG_LONG_ARRAY: {
          const length = readArrayLength(8);
          const values = [];
          for (let index = 0; index < length; index += 1) values.push(readLong());
          return values;
        }
        default:
          fail("invalid");
      }
    }

    const rootType = readByte();
    if (rootType !== TAG_COMPOUND) fail("unsupported");
    const rootName = readString();
    if (rootName) fail("unsupported");
    const root = readCompound(0);
    if (offset !== bytes.length) fail("invalid");
    return root;
  }

  function hashIdentity(identity) {
    let first = 2166136261;
    let second = 2246822519;
    for (let index = 0; index < identity.length; index += 1) {
      const code = identity.charCodeAt(index);
      first = Math.imul(first ^ code, 16777619);
      second = Math.imul(second ^ code, 3266489917);
    }
    return `journeymap-import-${(first >>> 0).toString(16).padStart(8, "0")}${(second >>> 0).toString(16).padStart(8, "0")}`;
  }

  function getNbtTagType(compound, name) {
    return compoundTagTypes.get(compound)?.get(name) ?? null;
  }

  function getNbtListItemType(list) {
    return listItemTypes.get(list) ?? null;
  }

  function identifyWorld(dimension, targetByWorld, preferredWorld) {
    const id = dimension.trim().toLowerCase();
    if (id === "aincrad") return "aincrad";
    if (id === "underworld") return "underworld";
    const matchingTargets = Array.from(targetByWorld.values()).filter(
      (target) => typeof target.journeymapDimensionId === "string" && target.journeymapDimensionId === dimension
    );
    if (preferredWorld && matchingTargets.some((target) => target.id === preferredWorld)) return preferredWorld;
    if (matchingTargets.length === 1) return matchingTargets[0].id;
    fail("unsupported");
  }

  function requireTagType(compound, name, type, errorCode = "invalid") {
    if (!Object.prototype.hasOwnProperty.call(compound, name) || getNbtTagType(compound, name) !== type) {
      fail(errorCode);
    }
  }

  function validateJourneyMapIcon(icon, errorCode) {
    if (!isRecord(icon)) fail(errorCode);
    const required = {
      textureWidth: TAG_INT,
      rotation: TAG_INT,
      opacity: TAG_FLOAT,
      resourceLocation: TAG_STRING,
      textureHeight: TAG_INT
    };
    if (Object.keys(icon).some((name) => !Object.prototype.hasOwnProperty.call(required, name))) fail(errorCode);
    for (const [name, type] of Object.entries(required)) requireTagType(icon, name, type, errorCode);
    if (
      !Number.isFinite(icon.textureWidth) ||
      !Number.isFinite(icon.textureHeight) ||
      !Number.isFinite(icon.rotation) ||
      !Number.isFinite(icon.opacity) ||
      !icon.resourceLocation.trim()
    ) {
      fail(errorCode);
    }
  }

  function validateJourneyMapSettings(settings, isWaypoint) {
    if (!isRecord(settings)) fail("invalid");
    requireTagType(settings, "showDeviation", TAG_BYTE);
    requireTagType(settings, "enable", TAG_BYTE);
    if (isWaypoint) {
      requireTagType(settings, "persistent", TAG_BYTE);
      if (Object.keys(settings).some((key) => !["showDeviation", "enable", "persistent"].includes(key))) {
        fail("unsupported");
      }
      return;
    }
    requireTagType(settings, "display", TAG_COMPOUND);
    requireTagType(settings, "locked", TAG_BYTE);
    requireTagType(settings, "colorOverride", TAG_BYTE);
    if (
      Object.keys(settings).some(
        (key) => !["showDeviation", "enable", "display", "locked", "colorOverride"].includes(key)
      )
    ) {
      fail("unsupported");
    }
  }

  function getLogoIdFromJourneyMapIcon(icon, target) {
    const basename = icon.resourceLocation
      .split("/")
      .pop()
      .replace(/\.png$/i, "")
      .toLowerCase();
    const logoIds = target.logoIds || [];
    return logoIds.includes(basename) ? basename : "pin";
  }

  function journeyMapColorToHex(value) {
    if (typeof value === "string") {
      const normalized = value.trim().replace(/^#/, "");
      return /^[0-9a-f]{6}$/i.test(normalized) ? `#${normalized.toUpperCase()}` : null;
    }
    if (typeof value !== "number" || !Number.isFinite(value)) return null;
    const unsigned = Math.trunc(value) >>> 0;
    const rgb = unsigned > 0xffffff ? unsigned & 0xffffff : unsigned;
    return `#${rgb.toString(16).padStart(6, "0").toUpperCase()}`;
  }

  function prepareCanonicalJourneyMapImport(root, targetByWorld, preferredWorld) {
    if (Object.keys(root).some((key) => key !== "groups" && key !== "waypoints")) fail("unsupported");
    if (!isRecord(root.groups) || !isRecord(root.waypoints)) fail("unsupported");
    requireTagType(root, "groups", TAG_COMPOUND, "unsupported");
    requireTagType(root, "waypoints", TAG_COMPOUND, "unsupported");
    const groups = root.groups;
    const waypoints = root.waypoints;
    if (!Object.prototype.hasOwnProperty.call(groups, "journeymap_all")) fail("unsupported");

    const groupNames = new Map();
    const groupColors = new Map();
    for (const [groupId, group] of Object.entries(groups)) {
      if (!isRecord(group)) fail("unsupported");
      if (
        !["journeymap_all", "journeymap_death", "journeymap_temp", "journeymap_default"].includes(groupId) &&
        !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(groupId)
      ) {
        fail("unsupported");
      }
      const allowedFields = ["settings", "color", "icon", "name", "guid", "tag", "modId"];
      if (Object.keys(group).some((key) => !allowedFields.includes(key))) fail("unsupported");
      requireTagType(group, "settings", TAG_COMPOUND, "unsupported");
      validateJourneyMapSettings(group.settings, false);
      requireTagType(group, "icon", TAG_COMPOUND, "unsupported");
      validateJourneyMapIcon(group.icon, "unsupported");
      requireTagType(group, "name", TAG_STRING, "unsupported");
      requireTagType(group, "guid", TAG_STRING, "unsupported");
      requireTagType(group, "modId", TAG_STRING, "unsupported");
      if (group.color !== undefined) requireTagType(group, "color", TAG_INT, "unsupported");
      if (group.tag !== undefined) requireTagType(group, "tag", TAG_STRING, "unsupported");
      if (!group.name.trim() || group.guid !== groupId || group.modId !== "journeymap") fail("unsupported");
      groupNames.set(groupId, group.name);
      groupColors.set(groupId, journeyMapColorToHex(group.color));
    }

    const categoryColors = new Map(groupColors);
    Object.values(waypoints).forEach((waypoint) => {
      if (categoryColors.get(waypoint.groupId)) return;
      const waypointColor = journeyMapColorToHex(waypoint.color);
      if (waypointColor) categoryColors.set(waypoint.groupId, waypointColor);
    });

    const prepared = [];
    for (const [waypointId, waypoint] of Object.entries(waypoints)) {
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(waypointId)) {
        fail("invalid");
      }
      if (!isRecord(waypoint)) fail("invalid");
      const requiredFields = [
        "settings",
        "color",
        "pos",
        "origin",
        "groupId",
        "icon",
        "name",
        "guid",
        "modId",
        "dimensions"
      ];
      if (requiredFields.some((key) => !Object.prototype.hasOwnProperty.call(waypoint, key))) fail("invalid");
      if (Object.keys(waypoint).some((key) => !requiredFields.includes(key))) fail("unsupported");
      requireTagType(waypoint, "settings", TAG_COMPOUND);
      validateJourneyMapSettings(waypoint.settings, true);
      requireTagType(waypoint, "color", TAG_INT);
      requireTagType(waypoint, "pos", TAG_COMPOUND);
      requireTagType(waypoint, "origin", TAG_STRING);
      requireTagType(waypoint, "groupId", TAG_STRING);
      requireTagType(waypoint, "icon", TAG_COMPOUND);
      validateJourneyMapIcon(waypoint.icon, "invalid");
      requireTagType(waypoint, "name", TAG_STRING);
      requireTagType(waypoint, "guid", TAG_STRING);
      requireTagType(waypoint, "modId", TAG_STRING);
      requireTagType(waypoint, "dimensions", TAG_LIST);
      if (getNbtListItemType(waypoint.dimensions) !== TAG_STRING || waypoint.dimensions.length === 0) fail("invalid");
      if (
        !waypoint.name.trim() ||
        waypoint.guid !== waypointId ||
        waypoint.origin !== "journeymap" ||
        waypoint.modId !== "journeymap"
      ) {
        fail("invalid");
      }
      const groupName = groupNames.get(waypoint.groupId);
      if (!groupName) fail("invalid");

      const position = waypoint.pos;
      if (!isRecord(position)) fail("invalid");
      if (Object.keys(position).some((key) => !["x", "y", "z", "dimension"].includes(key))) fail("unsupported");
      requireTagType(position, "x", TAG_INT);
      requireTagType(position, "y", TAG_INT);
      requireTagType(position, "z", TAG_INT);
      requireTagType(position, "dimension", TAG_STRING);
      if (![position.x, position.y, position.z].every(Number.isSafeInteger) || !position.dimension.trim())
        fail("invalid");
      if (
        waypoint.dimensions.some((dimension) => typeof dimension !== "string") ||
        !waypoint.dimensions.includes(position.dimension)
      ) {
        fail("invalid");
      }

      const world = identifyWorld(position.dimension, targetByWorld, preferredWorld);
      const target = targetByWorld.get(world);
      if (!target || !target.floors || !target.floors[target.defaultFloor]) fail("unsupported");
      const floor = target.defaultFloor;
      const identity = JSON.stringify(["JourneyMap", world, waypoint.groupId, waypoint.guid]);
      prepared.push({
        world,
        record: {
          id: hashIdentity(identity),
          name: waypoint.name,
          description: "",
          x: position.x,
          z: position.z,
          floor,
          button: groupName,
          buttonColor: categoryColors.get(waypoint.groupId) || undefined,
          waypointColor: journeyMapColorToHex(waypoint.color) || undefined,
          logo: getLogoIdFromJourneyMapIcon(waypoint.icon, target)
        }
      });
    }

    return {
      records: prepared,
      groupCount: new Set(prepared.map((entry) => `${entry.world}\u0000${entry.record.button}`)).size
    };
  }

  function prepareLegacyJourneyMapImport(root, targetByWorld, preferredWorld) {
    if (Object.keys(root).length !== 1 || !isRecord(root.groups)) fail("unsupported");
    const rootGroups = root.groups;
    if (Object.keys(rootGroups).length !== 1 || !isRecord(rootGroups.journeymap_all)) fail("unsupported");
    const wrapper = rootGroups.journeymap_all;
    if (Object.keys(wrapper).some((key) => key !== "settings" && key !== "groups")) fail("unsupported");
    if (!isRecord(wrapper.groups) || (wrapper.settings !== undefined && !isRecord(wrapper.settings)))
      fail("unsupported");
    const prepared = [];
    const groups = wrapper.groups;
    for (const [groupName, group] of Object.entries(groups)) {
      if (!groupName.trim() || !isRecord(group)) fail("unsupported");
      if (Object.keys(group).some((key) => key !== "settings" && key !== "waypoints")) fail("unsupported");
      if (group.settings !== undefined && !isRecord(group.settings)) fail("unsupported");
      if (!Array.isArray(group.waypoints)) fail("unsupported");

      const groupRecords = [];
      let firstWaypointColor = null;
      for (const waypoint of group.waypoints) {
        if (!isRecord(waypoint)) fail("invalid");
        if (typeof waypoint.name !== "string" || !waypoint.name.trim()) fail("invalid");
        if (typeof waypoint.x !== "number" || !Number.isFinite(waypoint.x)) fail("invalid");
        if (typeof waypoint.z !== "number" || !Number.isFinite(waypoint.z)) fail("invalid");
        if (waypoint.y !== undefined && (typeof waypoint.y !== "number" || !Number.isFinite(waypoint.y)))
          fail("invalid");
        if (typeof waypoint.dim !== "string" || !waypoint.dim.trim()) fail("invalid");
        if (waypoint.icon !== undefined && typeof waypoint.icon !== "string") fail("invalid");
        if (waypoint.uuid !== undefined && typeof waypoint.uuid !== "string") fail("invalid");
        if (waypoint.id !== undefined && typeof waypoint.id !== "string") fail("invalid");
        if (waypoint.group !== undefined && typeof waypoint.group !== "string") fail("invalid");

        const world = identifyWorld(waypoint.dim, targetByWorld, preferredWorld);
        const target = targetByWorld.get(world);
        if (!target || !target.floors || !target.floors[target.defaultFloor]) fail("unsupported");
        const floor = target.defaultFloor;
        const stableId = waypoint.uuid || waypoint.id;
        const waypointColor = journeyMapColorToHex(waypoint.color);
        if (!firstWaypointColor && waypointColor) firstWaypointColor = waypointColor;
        const identity = stableId
          ? JSON.stringify(["JourneyMap", world, groupName, stableId])
          : JSON.stringify(["JourneyMap", groupName, waypoint.name.trim(), world, floor, waypoint.x, waypoint.z]);
        const logoIds = target.logoIds || [];
        groupRecords.push({
          world,
          record: {
            id: hashIdentity(identity),
            name: waypoint.name,
            description: "",
            x: waypoint.x,
            z: waypoint.z,
            floor,
            button: groupName,
            buttonColor: undefined,
            waypointColor: waypointColor || undefined,
            logo: logoIds.includes(waypoint.icon) ? waypoint.icon : "pin"
          }
        });
      }
      groupRecords.forEach((entry) => {
        entry.record.buttonColor = firstWaypointColor || undefined;
        prepared.push(entry);
      });
    }

    return {
      records: prepared,
      groupCount: new Set(prepared.map((entry) => `${entry.world}\u0000${entry.record.button}`)).size
    };
  }

  function prepareJourneyMapImport(input, targets, preferredWorld) {
    const root = parseJourneyMapDat(input);
    if (!isRecord(root) || !isRecord(root.groups)) fail("unsupported");
    const targetByWorld = new Map();
    (Array.isArray(targets) ? targets : []).forEach((target) => {
      if (target && typeof target.id === "string") targetByWorld.set(target.id, target);
    });
    return Object.prototype.hasOwnProperty.call(root, "waypoints")
      ? prepareCanonicalJourneyMapImport(root, targetByWorld, preferredWorld)
      : prepareLegacyJourneyMapImport(root, targetByWorld, preferredWorld);
  }

  const api = Object.freeze({
    JourneyMapImportError,
    parseJourneyMapDat,
    prepareJourneyMapImport,
    getNbtTagType,
    getNbtListItemType
  });
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  global.SAOJourneyMapImport = api;
})(typeof window !== "undefined" ? window : globalThis);
