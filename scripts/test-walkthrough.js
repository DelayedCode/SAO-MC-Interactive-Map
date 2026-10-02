const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");

function classList() {
  const values = new Set();
  return {
    add(...names) {
      names.forEach((name) => values.add(name));
    },
    remove(...names) {
      names.forEach((name) => values.delete(name));
    },
    contains(name) {
      return values.has(name);
    }
  };
}

function eventTarget() {
  const listeners = new Map();
  return {
    listeners,
    addEventListener(type, listener) {
      if (!listeners.has(type)) listeners.set(type, new Set());
      listeners.get(type).add(listener);
    },
    removeEventListener(type, listener) {
      listeners.get(type)?.delete(listener);
    },
    dispatch(type, event = {}) {
      for (const listener of listeners.get(type) || []) listener({ type, target: this, ...event });
    }
  };
}

function node(tagName) {
  const target = eventTarget();
  const children = [];
  const findDescendant = (items, predicate) => {
    for (const item of items) {
      if (predicate(item)) return item;
      const nested = findDescendant(item.children || [], predicate);
      if (nested) return nested;
    }
    return null;
  };
  const nodeObject = {
    ...target,
    tagName,
    children,
    dataset: {},
    classList: classList(),
    style: {
      values: new Map(),
      setProperty(name, value) {
        this.values.set(name, value);
      },
      removeProperty(name) {
        this.values.delete(name);
      }
    },
    textContent: "",
    disabled: false,
    appendChild(child) {
      children.push(child);
      child.parentNode = this;
      return child;
    },
    append(...items) {
      items.forEach((item) => this.appendChild(item));
    },
    remove() {
      if (!this.parentNode) return;
      const index = this.parentNode.children.indexOf(this);
      if (index >= 0) this.parentNode.children.splice(index, 1);
      this.parentNode = null;
    },
    setAttribute(name, value) {
      this[name] = String(value);
    },
    getBoundingClientRect() {
      return { left: 10, top: 20, width: 100, height: 40 };
    },
    scrollIntoView(options) {
      this.scrollOptions = options;
    },
    querySelector(selector) {
      if (!selector.startsWith(".")) return null;
      return findDescendant(children, (child) => child.className === selector.slice(1));
    },
    querySelectorAll(selector) {
      if (selector === ".sao-tour-actions button") {
        const actions = findDescendant(children, (child) => child.className === "sao-tour-actions");
        return actions ? actions.children : [];
      }
      return [];
    }
  };
  return nodeObject;
}

function createDocument() {
  const nodes = new Map();
  const documentObject = {
    ...eventTarget(),
    body: node("body"),
    head: node("head"),
    createElement(tagName) {
      return node(tagName);
    },
    getElementById(id) {
      const value = nodes.get(id);
      return value && value.parentNode ? value : null;
    },
    querySelector(selector) {
      return nodes.get(selector) || null;
    },
    register(selector, value) {
      nodes.set(selector, value);
    }
  };
  const originalAppend = documentObject.body.appendChild.bind(documentObject.body);
  documentObject.body.appendChild = (child) => {
    if (child.id) nodes.set(child.id, child);
    originalAppend(child);
    return child;
  };
  return documentObject;
}

const documentObject = createDocument();
const target = node("button");
documentObject.register("#target", target);
const windowObject = {
  document: documentObject,
  getComputedStyle() {
    return { borderRadius: "4px" };
  },
  matchMedia() {
    return { matches: false };
  }
};
const storage = {
  values: new Map(),
  getItem(key) {
    return this.values.get(key) || null;
  },
  setItem(key, value) {
    this.values.set(key, String(value));
  }
};
const context = vm.createContext({
  console,
  window: windowObject,
  globalThis: windowObject,
  document: documentObject,
  Map,
  Set,
  Object,
  Array,
  String,
  Boolean,
  Number,
  Math
});
vm.runInContext(fs.readFileSync(path.join(root, "shared", "sao-walkthrough.js"), "utf8"), context, {
  filename: "shared/sao-walkthrough.js"
});

const translated = (key, params) =>
  (
    ({
      "ui.walkthrough.step": "Step {current} of {total}",
      "ui.walkthrough.skip": "Skip",
      "ui.walkthrough.back": "Back",
      "ui.walkthrough.next": "Next",
      "ui.walkthrough.finish": "Finish"
    })[key] || key
  )
    .replace("{current}", String(params?.current ?? ""))
    .replace("{total}", String(params?.total ?? ""));
const i18nSource = fs.readFileSync(path.join(root, "shared", "sao-i18n.js"), "utf8");
assert.match(
  i18nSource,
  /(?:["']discordBody["']|\bdiscordBody)\s*:\s*"Open quick links to the SAO MC Support Website, SAO MC Discord, and my Discord Profile\."/
);
assert.match(
  i18nSource,
  /(?:["']step1Body["']|\bstep1Body)\s*:\s*"Use the top row to open Tower Defense, open the Compendium, or return to the Menu\."/
);
const steps = [
  { selector: "#target", title: "First", body: "First body" },
  { selector: "#target", title: "Second", body: "Second body" }
];
const controller = context.window.createWalkthroughController({
  document: documentObject,
  window: windowObject,
  storage,
  storageKey: "walkthrough.test.completed",
  getSteps: () => steps,
  translate: translated
});

assert.equal(controller.start(), true, "starts an incomplete walkthrough");
const overlay = documentObject.getElementById("sao-tour-overlay");
assert.ok(overlay);
assert.equal(overlay.getAttribute, undefined, "test node exposes attributes through properties");
assert.equal(overlay["aria-hidden"], "false");
assert.equal(overlay.querySelector(".sao-tour-title").textContent, "First");
assert.equal(overlay.querySelector(".sao-tour-step").textContent, "Step 1 of 2");
assert.equal(target.classList.contains("sao-tour-focus-target"), true, "target is highlighted");
assert.equal(target.scrollOptions.behavior, "smooth");
assert.equal(target.scrollOptions.block, "center");
assert.equal(target.scrollOptions.inline, "nearest");

const buttons = overlay.querySelectorAll(".sao-tour-actions button");
assert.equal(buttons[1].disabled, true, "back is disabled on the first step");
buttons[2].dispatch("click");
assert.equal(overlay.querySelector(".sao-tour-title").textContent, "Second");
assert.equal(buttons[1].disabled, false, "back is enabled after advancing");
buttons[1].dispatch("click");
assert.equal(overlay.querySelector(".sao-tour-title").textContent, "First");
buttons[2].dispatch("click");
buttons[2].dispatch("click");
assert.equal(storage.getItem("walkthrough.test.completed"), "1", "final next completes the walkthrough");
assert.equal(overlay["aria-hidden"], "true");

assert.equal(controller.start(), false, "completed walkthrough does not restart normally");
assert.equal(controller.start({ force: true }), true, "force restarts a completed walkthrough");
documentObject.dispatch("keydown", { key: "Escape" });
assert.equal(overlay["aria-hidden"], "true", "Escape closes the walkthrough");
assert.equal(storage.getItem("walkthrough.test.completed"), "1");

controller.start({ force: true });
buttons[0].dispatch("click");
assert.equal(overlay["aria-hidden"], "true", "skip closes the walkthrough");
windowObject.matchMedia = () => ({ matches: true });
controller.start({ force: true });
assert.equal(target.scrollOptions.behavior, "auto", "reduced motion disables smooth scrolling");
let requestedSelector = null;
const customTargetController = context.window.createWalkthroughController({
  document: documentObject,
  window: windowObject,
  storage,
  storageKey: "walkthrough.custom-target.completed",
  getSteps: () => [{ selector: "custom-target", title: "Custom", body: "Custom body" }],
  getTarget: (selector) => {
    requestedSelector = selector;
    return target;
  },
  translate: translated
});
customTargetController.start();
assert.equal(requestedSelector, "custom-target", "target lookup remains injectable");
customTargetController.destroy();
controller.start({ force: true });
controller.destroy();
assert.equal(documentObject.getElementById("sao-tour-overlay"), null, "destroy removes overlay DOM");
documentObject.dispatch("keydown", { key: "Escape" });
assert.equal(controller.start({ force: true }), false, "destroy prevents restart");

console.log("Walkthrough controller regression tests passed.");
