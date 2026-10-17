/* Argo's data frame (loaded by shared/sao-argo-data-frame.html inside a hidden sandboxed iframe).
 *
 * Its only job is to load the site's own Current-Data files in an isolated realm and hand the records
 * back to the page that asked for them. That isolation is the whole point:
 *
 *  - Aincrad/Map/mapData.js declares `DATA` with a top-level `const`, and maps_floor*.js declares
 *    `MOB_AREA_MOBS` the same way, so injecting them into a page that already loaded them (the Map page)
 *    throws "Identifier has already been declared".
 * Inside this frame that cannot happen: the frame has its own global scope and nothing else reads it.
 *
 * The plan below is exactly the Current-Data file list the real pages load, in the order they load it.
 * Nothing here writes, fetches a remote resource, reads storage or touches page UI - the dataset files
 * are pure data. Beta-Test files are deliberately not part of the plan: Argo does not support that mode.
 */
(function (global) {
  "use strict";

  const MESSAGE_TYPE = "sao-argo-data";

  const params = new URLSearchParams(global.location && global.location.search ? global.location.search : "");
  const world = params.get("world") === "underworld" ? "underworld" : "aincrad";
  const token = params.get("token") || "";
  const targetOrigin = params.get("origin") || "*";

  const snapshot = {};
  const failures = [];
  let loaded = 0;

  /* The map datasets are top-level `const` bindings, not window properties, so they are read through
     `typeof` probes - the same technique Aincrad/Map/adapter.js and the engine use. */
  const LEXICAL = Object.freeze({
    DATA: () => (typeof DATA === "undefined" ? undefined : DATA),
    MOB_AREA_MOBS: () => (typeof MOB_AREA_MOBS === "undefined" ? undefined : MOB_AREA_MOBS)
  });

  function readGlobal(name) {
    try {
      return global[name];
    } catch (_error) {
      return undefined;
    }
  }

  function load(src) {
    return { src };
  }

  function capture(key, reader) {
    return {
      run() {
        const value = reader();
        if (value === undefined || value === null) return;
        snapshot[key] = value;
        loaded += 1;
      }
    };
  }

  function buildPlan() {
    if (world === "underworld") {
      /* The Fractured Underworld keeps its own map data in the page; what a page cannot provide is the
         Current-only questline and the (currently empty) Underworld Compendium list. */
      return [
        load("../Fractured%20Underworld/Compendium/compendium_current.js"),
        capture("underworldCompendium", () => readGlobal("SAO_CURRENT_FU_COMPENDIUM_DATA")),
        load("../Aincrad/Quests/quests_current.js"),
        capture("currentQuests", () => readGlobal("SAO_CURRENT_QUEST_ENTRIES_BY_FLOOR"))
      ];
    }

    /* The shared map dataset is loaded because Current Data builds on it: mapData.js declares DATA and
       MOB_AREA_MOBS, floors 1-2 fill the area -> mob rows Current Data corrects, maps_mainquests.js adds
       the Current main-quest markers and maps_current.js adds every Current marker, area and correction.
       Floor 3 only contributes Beta-Test markers, so Argo does not load it at all. */
    return [
      load("../Aincrad/Map/mapData.js"),
      load("../Aincrad/Map/maps_floor1.js"),
      load("../Aincrad/Map/maps_floor2.js"),
      load("../Aincrad/Map/maps_mainquests.js"),
      load("../Aincrad/Map/maps_current.js"),
      capture("markerData", () => LEXICAL.DATA()),
      capture("mobAreaMobs", () => LEXICAL.MOB_AREA_MOBS()),
      capture("currentMobAreas", () => readGlobal("SAO_CURRENT_MOB_AREAS")),
      capture("currentMobAreaLinks", () => readGlobal("SAO_CURRENT_MOB_AREA_MOB_LINKS")),
      load("../Aincrad/Bestiary/bestiary_current.js"),
      capture("currentBestiary", () => readGlobal("SAO_CURRENT_BESTIARY_DATA")),
      load("../Aincrad/eCompendium/ecompendium_current.js"),
      capture("currentEquipment", () => readGlobal("SAO_CURRENT_EQUIPMENT_DATA")),
      load("../Aincrad/Quests/quests_current.js"),
      capture("currentQuests", () => readGlobal("SAO_CURRENT_QUEST_ENTRIES_BY_FLOOR"))
    ];
  }

  /* Posts exactly once. A source whose file failed to load is simply absent from the snapshot, so the
     engine reports it as unavailable instead of being handed an empty stand-in. */
  function publish() {
    const message = {
      type: MESSAGE_TYPE,
      token,
      world,
      ready: loaded > 0,
      sources: snapshot,
      failures
    };
    try {
      global.parent.postMessage(message, targetOrigin);
    } catch (_error) {
      /* The parent went away (or refused the origin); there is nothing else to do. */
    }
  }

  /* One file at a time, in order: mapData.js must declare DATA/MOB_AREA_MOBS before the floor files
     Object.assign into them, and the Current files are captured as soon as they are in place. */
  function runStep(steps) {
    const step = steps.shift();
    if (!step) {
      publish();
      return;
    }
    if (typeof step.run === "function") {
      try {
        step.run();
      } catch (_error) {
        failures.push(step.src || "capture");
      }
      runStep(steps);
      return;
    }
    const script = global.document.createElement("script");
    script.src = step.src;
    script.async = false;
    script.addEventListener(
      "load",
      () => {
        runStep(steps);
      },
      { once: true }
    );
    script.addEventListener(
      "error",
      () => {
        failures.push(step.src);
        runStep(steps);
      },
      { once: true }
    );
    global.document.body.appendChild(script);
  }

  runStep(buildPlan());
})(typeof window !== "undefined" ? window : globalThis);
