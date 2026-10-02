const assert = require("assert");
const fs = require("fs");
const vm = require("vm");

const storageKey = "sao.characterBuild.foundation";
const buildTwo = {
  source: "beta",
  level: 12,
  classId: "mage",
  equipment: {
    helmet: {
      name: "Build Two Helmet",
      equipmentKey: "build-two-helmet",
      category: "armor",
      stats: { Health: "25", "Rune Slots": 1 }
    }
  },
  runes: { helmet: [{ runeKey: "christmas-rune" }] },
  selectedSkills: { "mage-root": true }
};
const initialState = {
  activeSlot: "1",
  builds: {
    1: {
      source: "beta",
      level: 8,
      classId: "assassin",
      equipment: {
        helmet: {
          name: "Build One Helmet",
          equipmentKey: "build-one-helmet",
          category: "armor",
          stats: { Health: "15", "Rune Slots": 1 }
        }
      },
      runes: { helmet: [{ runeKey: "christmas-rune" }] },
      selectedSkills: { "assassin-root": true }
    },
    2: buildTwo,
    3: { source: "current", level: 1, classId: "archer", equipment: {}, runes: {}, selectedSkills: {} }
  }
};

class FakeElement {
  constructor() {
    this.listeners = {};
    this.value = "";
    this.innerHTML = "";
    this.open = false;
    this.style = { setProperty() {} };
  }
  addEventListener(type, handler) {
    this.listeners[type] = handler;
  }
  dispatch(type, event = {}) {
    this.listeners[type]?.({ target: this, ...event });
  }
  showModal() {
    this.open = true;
  }
  close() {
    this.open = false;
  }
  focus() {}
  insertAdjacentHTML() {}
  querySelectorAll() {
    return [];
  }
}

function loadUi(store) {
  const elements = new Map();
  const getElement = (id) => {
    if (!elements.has(id)) elements.set(id, new FakeElement());
    return elements.get(id);
  };
  const nav = new FakeElement();
  const document = {
    cookie: "",
    addEventListener(type, handler) {
      if (type === "DOMContentLoaded") handler();
    },
    getElementById: getElement,
    querySelector(selector) {
      return selector === ".nav" ? nav : null;
    },
    querySelectorAll() {
      return [];
    }
  };
  const context = {
    console,
    document,
    requestAnimationFrame: (handler) => handler(),
    window: null,
    globalThis: null,
    SAOStorage: {
      getJSON(key, fallback) {
        return Object.prototype.hasOwnProperty.call(store, key) ? JSON.parse(store[key]) : fallback;
      },
      setJSON(key, value) {
        store[key] = JSON.stringify(value);
      }
    }
  };
  context.window = context;
  context.globalThis = context;
  [1, 2, 3].forEach((floor) =>
    vm.runInNewContext(fs.readFileSync(`Aincrad/eCompendium/ecompendium_floor${floor}.js`, "utf8"), context)
  );
  vm.runInNewContext(fs.readFileSync("shared/sao-page-helpers.js", "utf8"), context);
  [
    "character-build-icons.js",
    "character-build-data.js",
    "character-build-adapter.js",
    "character-build-calculator.js",
    "character-build.js"
  ].forEach((file) => vm.runInNewContext(fs.readFileSync(`Aincrad/Character Build/${file}`, "utf8"), context));
  return { context, elements };
}

const store = { [storageKey]: JSON.stringify(initialState) };
const firstLoad = loadUi(store);
firstLoad.elements.get("resetBuild").dispatch("click");
const afterReset = JSON.parse(store[storageKey]);
assert.deepStrictEqual(afterReset.builds["1"], {
  source: "beta",
  level: 1,
  classId: "archer",
  equipment: {},
  runes: {},
  selectedSkills: {}
});
assert.deepStrictEqual(afterReset.builds["2"], buildTwo);
assert.strictEqual(firstLoad.elements.get("characterLevel").value, 1);
assert.strictEqual(firstLoad.elements.get("levelValue").value, 1);
assert.strictEqual(firstLoad.elements.get("levelValue").textContent, 1);
assert.strictEqual(firstLoad.elements.get("characterClass").value, "archer");
assert(firstLoad.elements.get("armorSlots").innerHTML.includes("Empty slot"));
assert(!firstLoad.elements.get("armorSlots").innerHTML.includes("rune-button"));
assert(!firstLoad.elements.get("skillTree").innerHTML.includes("is-selected"));

firstLoad.elements.get("buildSlot").value = "2";
firstLoad.elements.get("buildSlot").dispatch("change");
const afterSwitch = JSON.parse(store[storageKey]);
assert.strictEqual(afterSwitch.activeSlot, "2");
assert.deepStrictEqual(afterSwitch.builds["2"], buildTwo);

const reloaded = loadUi(store);
assert.strictEqual(reloaded.elements.get("buildSlot").value, "2");
const afterReload = JSON.parse(store[storageKey]);
assert.deepStrictEqual(afterReload.builds["1"], afterReset.builds["1"]);
assert.deepStrictEqual(afterReload.builds["2"], buildTwo);
console.log(
  JSON.stringify(
    { resetActiveBuild: "passed", preservedOtherBuild: "passed", reloadPersistence: "passed", status: "passed" },
    null,
    2
  )
);
