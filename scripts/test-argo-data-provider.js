/* Focused checks for Argo's cross-page data access:
 *
 *  - shared/sao-argo-data-provider.js (the parent-side bridge),
 *  - shared/sao-argo-data-frame.js (the isolated realm that loads the real dataset files),
 *  - the world-isolation boundary between them.
 *
 * The provider is exercised in a VM with a DOM stub, so no browser is needed; the frame's file plan is
 * checked against the real repository, which is what catches a typo in a dataset path.
 *
 * Nothing here writes to a dataset, storage or the network. */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

const PROVIDER_SOURCE = read("shared/sao-argo-data-provider.js");
const FRAME_SOURCE = read("shared/sao-argo-data-frame.js");
const FRAME_HTML = read("shared/sao-argo-data-frame.html");
const FLOORS = ["floor1", "floor2", "floor3"];

function stripComments(source) {
  return String(source)
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:])\/\/.*$/gm, "$1");
}

/* --- Provider harness ------------------------------------------------------- */

function createProviderHarness(options = {}) {
  const storageCalls = [];
  const listeners = new Map();
  const frames = [];
  const registered = [];
  const timers = new Map();
  let nextTimer = 0;
  let activeSource = options.activeSource || null;

  const createElement = (tagName) => {
    const element = {
      tagName,
      id: "",
      style: {},
      attributes: {},
      children: [],
      setAttribute(name, value) {
        element.attributes[name] = String(value);
      },
      getAttribute(name) {
        return element.attributes[name];
      },
      appendChild(child) {
        element.children.push(child);
        return child;
      },
      remove() {}
    };
    return element;
  };

  const documentStub = {
    currentScript:
      options.withoutScriptUrl === true
        ? null
        : { src: options.scriptUrl || "https://example.test/shared/sao-argo-data-provider.js" },
    body: {
      appendChild(child) {
        frames.push(child);
        return child;
      }
    },
    createElement,
    /* A stand-in for the Character Build page's own data-source toggle. */
    querySelector: (selector) =>
      selector === ".source-control [data-source].is-active" && activeSource
        ? { getAttribute: (name) => (name === "data-source" ? activeSource : null) }
        : null
  };

  const engine = options.withoutEngine
    ? undefined
    : {
        registerSources(patch) {
          registered.push(patch);
        },
        resetSources() {
          registered.length = 0;
        }
      };

  const globals = {
    console,
    URL,
    document: options.withoutDocument ? undefined : documentStub,
    SAOArgoEngine: engine,
    SAODatasets: options.datasets,
    location: { origin: options.origin === undefined ? "https://example.test" : options.origin, search: "" },
    localStorage: {
      getItem() {
        storageCalls.push("localStorage.getItem");
        throw new Error("the provider must not read storage");
      },
      setItem() {
        storageCalls.push("localStorage.setItem");
        throw new Error("the provider must not write storage");
      }
    },
    setTimeout(handler, delay) {
      nextTimer += 1;
      timers.set(nextTimer, { handler, delay });
      return nextTimer;
    },
    clearTimeout(id) {
      timers.delete(id);
    },
    addEventListener(type, handler) {
      if (!listeners.has(type)) listeners.set(type, new Set());
      listeners.get(type).add(handler);
    },
    removeEventListener(type, handler) {
      listeners.get(type)?.delete(handler);
    },
    dispatch(type, event) {
      for (const handler of [...(listeners.get(type) || [])]) handler({ type, ...event });
    }
  };

  const context = vm.createContext(globals);
  context.window = context;
  context.globalThis = context;
  vm.runInContext(PROVIDER_SOURCE, context, { filename: "shared/sao-argo-data-provider.js" });

  return {
    api: context.SAOArgoData,
    frames,
    registered,
    storageCalls,
    listeners,
    dispatch: globals.dispatch,
    setActiveSource(value) {
      activeSource = value;
    },
    pendingTimers: () => timers.size
  };
}

function flush() {
  return new Promise((resolve) => setImmediate(resolve));
}

/* --- Checks ----------------------------------------------------------------- */

async function run() {
  const results = [];

  /* 1. The world boundary: what the engine may be handed for each world. */
  {
    const harness = createProviderHarness();
    const api = harness.api;
    const aincrad = api.aincradSourceKeys;
    const underworld = api.underworldSourceKeys;

    assert.equal(Array.isArray(aincrad) && aincrad.length > 0, true, "the Aincrad source list exists");
    /* The quest file holds both worlds' questlines in one object and the engine filters it by world, so
       it is the one source both worlds may be handed; every other source belongs to exactly one world. */
    const shared = aincrad.filter((key) => underworld.includes(key));
    assert.equal(shared.join(","), "currentQuests", "only the world-filtered questline is shared between worlds");
    assert.equal(aincrad.includes("markerData"), true, "Aincrad pages get the map markers");
    assert.equal(aincrad.includes("mobAreaMobs"), true, "Aincrad pages get the shared area -> mob table");
    assert.equal(aincrad.includes("underworldCompendium"), false, "Aincrad pages never get Underworld data");
    assert.equal(underworld.includes("currentQuests"), true, "Underworld pages get the Current questline");
    assert.equal(underworld.includes("markerData"), false, "Underworld pages never get the Aincrad map");
    assert.equal(underworld.includes("mobAreaMobs"), false, "Underworld pages never get Aincrad area rows");

    /* Every Current-Data source the engine can ingest is reachable, and no Beta-Test key is offered. */
    for (const key of [
      "markerData",
      "mobAreaMobs",
      "currentMobAreas",
      "currentMobAreaLinks",
      "currentBestiary",
      "currentEquipment",
      "currentQuests"
    ]) {
      assert.equal(aincrad.includes(key), true, `an Aincrad page can be handed ${key}`);
    }
    for (const key of [
      "betaMobAreas",
      "betaMobAreaMobs",
      "betaBestiary",
      "betaBestiaryByFloor",
      "betaEquipment",
      "betaEquipmentByFloor",
      "betaQuests"
    ]) {
      assert.equal(aincrad.includes(key), false, `${key} is not a source the provider offers`);
      assert.equal(underworld.includes(key), false, `${key} is never offered to the Underworld either`);
    }

    /* A snapshot holding both worlds is filtered, never merged. */
    const snapshot = {
      markerData: { "a-marker": {} },
      currentEquipment: { floor1: {} },
      currentQuests: { floor1: [] },
      underworldCompendium: [],
      unknownKey: "ignored"
    };
    const aincradSources = api.toEngineSources(snapshot, "aincrad");
    assert.equal(aincradSources.markerData !== undefined, true, "Aincrad keys survive for an Aincrad page");
    assert.equal(aincradSources.currentQuests !== undefined, true, "the Current questline is shared data");
    assert.equal(aincradSources.underworldCompendium, undefined, "Underworld data is dropped for Aincrad");
    assert.equal(aincradSources.unknownKey, undefined, "unknown keys are dropped");

    const underworldSources = api.toEngineSources(snapshot, "underworld");
    assert.equal(underworldSources.markerData, undefined, "Aincrad markers are dropped for the Underworld");
    assert.equal(underworldSources.currentEquipment, undefined, "Aincrad equipment is dropped");
    assert.equal(underworldSources.currentQuests !== undefined, true, "the Underworld keeps the questline");
    assert.equal(underworldSources.underworldCompendium !== undefined, true, "and its own Compendium list");

    /* Missing or malformed input is simply empty, never a crash. */
    assert.deepEqual(Object.keys(api.toEngineSources(null, "aincrad")), []);
    assert.deepEqual(Object.keys(api.toEngineSources("nonsense", "underworld")), []);
    results.push("world-boundary");
  }

  /* 2. The dataset the page is on, resolved per question. */
  {
    /* The site-wide authority wins whenever the page has it. */
    const viaAuthority = createProviderHarness({
      datasets: {
        getDatasetFromLocation: () => "current",
        resolveWorld: () => "aincrad"
      }
    });
    assert.equal(viaAuthority.api.getDatasetHint(), "current", "the site dataset authority is read");

    const betaAuthority = createProviderHarness({
      datasets: {
        getDatasetFromLocation: () => "beta",
        resolveWorld: () => "aincrad"
      }
    });
    assert.equal(betaAuthority.api.getDatasetHint(), "beta", "a Beta selection is reported as Beta, not Current");

    /* A page without the authority: the Character Build source toggle is read instead of guessing. */
    const characterBuild = createProviderHarness({ withoutEngine: true, datasets: undefined, activeSource: "current" });
    assert.equal(characterBuild.api.getDatasetHint(), "current", "the page's own source control is read");
    characterBuild.setActiveSource("beta");
    assert.equal(
      characterBuild.api.getDatasetHint(),
      "beta",
      "switching the page's source while the window is open changes the hint"
    );

    /* A page that cannot say: null, so the engine refuses instead of assuming Current. */
    const unknownPage = createProviderHarness({ withoutEngine: true, datasets: undefined });
    assert.equal(unknownPage.api.getDatasetHint(), null, "a page that cannot say reports no hint");

    /* A broken authority never throws. */
    const brokenAuthority = createProviderHarness({
      datasets: {
        getDatasetFromLocation() {
          throw new Error("boom");
        }
      }
    });
    assert.equal(brokenAuthority.api.getDatasetHint(), null, "a throwing authority degrades to no hint");
    results.push("dataset-hint");
  }

  /* 2. Graceful degradation: no engine, no document, no script URL. */
  {
    const noEngine = createProviderHarness({ withoutEngine: true });
    const noEngineResult = await noEngine.api.ensure();
    assert.equal(noEngineResult.ready, false, "without an engine the provider reports not-ready");
    assert.equal(noEngine.frames.length, 0, "and creates no frame");
    assert.equal(noEngine.api.isReady(), false);

    const noDocument = createProviderHarness({ withoutDocument: true });
    const noDocumentResult = await noDocument.api.ensure();
    assert.equal(noDocumentResult.ready, false, "without a document the provider reports not-ready");

    const noUrl = createProviderHarness({ withoutScriptUrl: true });
    const noUrlResult = await noUrl.api.ensure();
    assert.equal(noUrlResult.ready, false, "without a resolvable script URL the provider reports not-ready");
    assert.equal(noUrl.frames.length, 0, "no frame is created without a base URL");

    assert.deepEqual(noEngine.storageCalls, [], "the provider never touches storage");
    results.push("graceful-degradation");
  }

  /* 3. The frame is created once, hidden and sandboxed, and only a token-matched answer counts. */
  {
    const harness = createProviderHarness();
    const api = harness.api;
    const first = api.ensure();
    const second = api.ensure();
    assert.equal(first, second, "repeated calls share one preparation");
    assert.equal(harness.frames.length, 1, "exactly one frame is created per page session");

    const frame = harness.frames[0];
    assert.equal(frame.id, api.frameId, "the frame carries the documented id");
    assert.equal(frame.getAttribute("sandbox"), "allow-scripts", "the frame runs scripts and nothing else");
    assert.equal(frame.getAttribute("aria-hidden"), "true", "the frame is hidden from assistive tech");
    assert.equal(frame.style.display, "none", "the frame is not displayed");
    assert.equal(String(frame.src).includes("sao-argo-data-frame.html"), true, "the frame loads the data frame");
    assert.equal(String(frame.src).includes("world=aincrad"), true, "the frame is told which world to load");
    assert.equal(
      String(frame.src).includes("origin=https%3A%2F%2Fexample.test"),
      true,
      "the frame is told where to post back"
    );
    const token = new URL(String(frame.src)).searchParams.get("token");
    assert.equal(typeof token === "string" && token.length > 8, true, "the frame is given a one-off token");

    harness.dispatch("message", { data: { type: api.messageType, token: "wrong", ready: true, sources: {} } });
    await flush();
    assert.equal(api.isReady(), false, "a message without the token is ignored");

    harness.dispatch("message", {
      data: {
        type: api.messageType,
        token,
        world: "aincrad",
        ready: true,
        sources: { markerData: { a: {} }, currentQuests: { floor1: [] }, underworldCompendium: [] }
      }
    });
    const result = await first;
    assert.equal(result.ready, true, "the matching message completes the preparation");
    assert.equal(api.isReady(), true, "the provider reports ready");
    assert.equal(harness.registered.length, 1, "the engine is handed the records once");
    assert.equal(harness.registered[0].markerData !== undefined, true, "the Aincrad records are registered");
    assert.equal(harness.registered[0].underworldCompendium, undefined, "the Underworld records are not");
    assert.equal(harness.pendingTimers(), 0, "the watchdog is cleared once the frame answers");
    assert.equal(harness.listeners.get("message").size, 0, "the message listener is removed again");
    assert.deepEqual(harness.storageCalls, [], "preparing the records never touches storage");

    /* Resetting drops the records and lets the engine rebuild from the page. */
    api.reset();
    assert.equal(api.isReady(), false, "reset() clears the prepared state");
    assert.equal(harness.registered.length, 0, "reset() also clears the engine's injected sources");
    results.push("frame-lifecycle");
  }

  /* 4. A frame that never answers leaves the page answering from its own data. */
  {
    const harness = createProviderHarness();
    const pending = harness.api.ensure();
    assert.equal(harness.pendingTimers(), 1, "one watchdog is armed while the frame loads");
    harness.dispatch("message", { data: { type: "something-else", token: "x" } });
    await flush();
    assert.equal(harness.api.isReady(), false, "an unrelated message changes nothing");
    assert.equal(harness.registered.length, 0, "nothing is registered before the frame answers");
    assert.equal(typeof pending.then, "function", "the preparation stays pending until the frame answers");
    results.push("frame-watchdog");
  }

  /* 5. The frame's file plan is real, complete, correctly ordered, and Beta-Test free. */
  {
    const literals = [...FRAME_SOURCE.matchAll(/load\("([^"]+)"\)/g)].map((match) => match[1]);
    const templates = [...FRAME_SOURCE.matchAll(/load\(`([^`]+)`\)/g)].map((match) => match[1]);
    assert.ok(literals.length >= 5, "the frame loads the Current-Data files by name");

    const plan = literals.concat(
      templates.flatMap((template) => FLOORS.map((floor) => template.replace("${floor}", floor)))
    );
    for (const relative of plan) {
      const target = path.join(root, "shared", decodeURIComponent(relative));
      assert.equal(fs.existsSync(target), true, `the frame's plan references a real file: ${relative}`);
    }

    /* No Beta-Test file is ever loaded: not a Bestiary floor, not an equipment floor, not a Beta quest
       file, and not the floor 3 map data (which only carries Beta-Test markers). */
    for (const betaFile of [
      "bestiary_floor1.js",
      "bestiary_floor2.js",
      "bestiary_floor3.js",
      "ecompendium_floor1.js",
      "ecompendium_floor2.js",
      "ecompendium_floor3.js",
      "quests_floor1.js",
      "quests_floor2.js",
      "quests_floor3.js",
      "maps_floor3.js"
    ]) {
      assert.equal(
        plan.some((entry) => entry.endsWith(betaFile)),
        false,
        `the frame never loads ${betaFile}`
      );
    }
    for (const betaGlobal of [
      "REGULAR_MOB_DATA",
      "BOSS_MOB_DATA",
      "DUNGEON_MOB_DATA",
      "DUNGEON_BOSS_MOB_DATA",
      "FLOOR_1_DATA",
      "FLOOR_2_DATA",
      "FLOOR_3_DATA",
      "QUEST_ENTRIES_BY_FLOOR"
    ]) {
      assert.equal(
        FRAME_SOURCE.includes(`readGlobal("${betaGlobal}")`),
        false,
        `the frame never reads the Beta global ${betaGlobal}`
      );
    }

    /* The map data must be declared before the floor files Object.assign into it. */
    const mapIndex = plan.findIndex((entry) => entry.endsWith("mapData.js"));
    const floorIndex = plan.findIndex((entry) => entry.endsWith("maps_floor1.js"));
    assert.ok(mapIndex > -1 && floorIndex > mapIndex, "mapData.js is loaded before the floor data");

    /* Every Current-Data source the engine can use is captured, and the Underworld keeps its own plan. */
    for (const capture of [
      "markerData",
      "mobAreaMobs",
      "currentMobAreas",
      "currentMobAreaLinks",
      "currentBestiary",
      "currentEquipment",
      "currentQuests"
    ]) {
      assert.equal(FRAME_SOURCE.includes(`capture("${capture}"`), true, `the frame captures ${capture}`);
    }
    assert.equal(
      FRAME_SOURCE.includes("Fractured%20Underworld/Compendium/compendium_current.js"),
      true,
      "the Underworld plan loads its own Compendium file"
    );
    results.push("frame-plan");
  }

  return results;
}

/* 6. No persistence, no network and no page UI in either half of the bridge. */
{
  for (const [label, source] of [
    ["the provider", PROVIDER_SOURCE],
    ["the frame", FRAME_SOURCE]
  ]) {
    const executable = stripComments(source);
    assert.equal(
      /localStorage|sessionStorage|indexedDB|document\.cookie|fetch\(|XMLHttpRequest|sendBeacon|SAOStorage/.test(
        executable
      ),
      false,
      `${label} contains no persistence or network call`
    );
  }
  assert.equal(/getElementById|innerHTML/.test(stripComments(FRAME_SOURCE)), false, "the frame touches no page UI");
  assert.equal(FRAME_HTML.includes("sao-argo-data-frame.js"), true, "the frame document loads the frame script");
  assert.equal(/<title>/.test(FRAME_HTML), false, "the frame document carries no player-facing title");
}

/* 7. The provider never injects a script into the page, which is what keeps the map datasets' top-level
   `const` declarations unique (a second DATA/MOB_AREAS/MOB_AREA_MOBS would throw). */
{
  const executable = stripComments(PROVIDER_SOURCE);
  assert.equal(
    /createElement\("script"\)|loadTaggedScriptOnce|appendChild\(script\)/.test(executable),
    false,
    "the provider injects no script into the page"
  );
  assert.equal(/createElement\("iframe"\)/.test(executable), true, "it loads the isolated data frame instead");
  assert.equal(/setAttribute\("sandbox", "allow-scripts"\)/.test(executable), true, "the frame is sandboxed");
  assert.equal(/document\.head/.test(executable), false, "the provider never appends anything to the page's head");
}

run()
  .then((results) => {
    console.log(`Argo data provider checks passed (${results.length} groups):`);
    results.forEach((name) => console.log(`  - ${name}`));
  })
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
