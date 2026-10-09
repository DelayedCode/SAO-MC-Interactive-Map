const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const source = fs.readFileSync(path.join(root, "shared", "sao-datasets.js"), "utf8");

function createStorage(initial = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem(key) {
      return values.has(key) ? values.get(key) : null;
    },
    setItem(key, value) {
      values.set(key, String(value));
    },
    removeItem(key) {
      values.delete(key);
    },
    snapshot() {
      return Object.fromEntries(values);
    }
  };
}

/* Boots shared/sao-datasets.js against a fake page so the world-scoped mode resolution can be
   exercised without a browser. */
function loadDatasets(options = {}) {
  const storage = options.storage || createStorage();
  const pagePath = options.path || "/index.html";
  const context = vm.createContext({
    console,
    URL,
    URLSearchParams,
    Object,
    Array,
    String,
    Number,
    Boolean,
    RegExp,
    Error,
    JSON,
    Map,
    Set,
    document: { createElement: () => null, head: { appendChild() {} }, body: { appendChild() {} } },
    SAOStorage: storage,
    SAOI18n: { t: (key) => key },
    location: {
      href: `https://example.test${pagePath}`,
      pathname: pagePath,
      search: options.search || "",
      origin: "https://example.test"
    }
  });
  context.window = context;
  context.globalThis = context;
  vm.runInContext(source, context, { filename: "shared/sao-datasets.js" });
  return { datasets: context.window.SAODatasets, storage };
}

/* --- world resolution ------------------------------------------------------ */
{
  const { datasets } = loadDatasets();
  assert.equal(datasets.resolveWorld("/index.html"), "aincrad");
  assert.equal(datasets.resolveWorld("/Aincrad/Bestiary/bestiary.html"), "aincrad");
  assert.equal(datasets.resolveWorld("/Fractured Underworld/Main UI/mainui.html"), "underworld");
  assert.equal(datasets.resolveWorld("/Fractured%20Underworld/Compendium/compendium.html"), "underworld");
  assert.deepEqual(Array.from(datasets.validDatasets), ["beta", "current"]);
  assert.deepEqual(Array.from(datasets.validWorlds), ["aincrad", "underworld"]);
}

/* --- value validation ------------------------------------------------------ */
{
  const { datasets } = loadDatasets();
  assert.equal(datasets.normalizeDataset("beta"), "beta");
  assert.equal(datasets.normalizeDataset("current"), "current");
  for (const invalid of ["", "BETA", "bogus", null, undefined, 7, {}]) {
    assert.equal(datasets.normalizeDataset(invalid), null, `rejects ${JSON.stringify(invalid)}`);
  }
  assert.equal(datasets.getDataset("nonsense"), "beta", "unknown values fall back to the safe default");
  assert.equal(datasets.getDataset("current"), "current");
}

/* --- per-world persistence and separation ---------------------------------- */
{
  const { datasets, storage } = loadDatasets();
  assert.equal(datasets.getActiveDataset("aincrad"), "beta", "an unset world defaults to Beta");

  assert.equal(datasets.setActiveDataset("aincrad", "current"), "current");
  assert.equal(storage.snapshot()["sao.dataset.aincrad"], "current");
  assert.equal(datasets.getActiveDataset("aincrad"), "current");
  assert.equal(datasets.getActiveDataset("underworld"), "beta", "Aincrad's choice never drives FU");

  assert.equal(datasets.setActiveDataset("underworld", "current"), "current");
  assert.equal(storage.snapshot()["sao.dataset.underworld"], "current");
  assert.equal(datasets.getActiveDataset("aincrad"), "current", "FU's choice never drives Aincrad");

  assert.equal(datasets.setActiveDataset("aincrad", "beta"), "beta", "re-choosing overwrites the mode");
  assert.equal(datasets.getActiveDataset("aincrad"), "beta");
  assert.equal(datasets.getActiveDataset("underworld"), "current", "the other world keeps its own mode");
}

/* --- invalid input never persists ------------------------------------------ */
{
  const { datasets, storage } = loadDatasets();
  assert.equal(datasets.setActiveDataset("aincrad", "bogus"), null);
  assert.equal(datasets.setActiveDataset("nope", "current"), null);
  assert.deepEqual(storage.snapshot(), {}, "nothing is written for invalid input");
}

/* --- corrupted stored values are ignored ----------------------------------- */
{
  const { datasets } = loadDatasets({ storage: createStorage({ "sao.dataset.aincrad": "javascript:alert(1)" }) });
  assert.equal(datasets.getActiveDataset("aincrad"), "beta", "a corrupted stored mode falls back to Beta");
}

/* --- the page world decides which stored mode applies ---------------------- */
{
  const storage = createStorage({ "sao.dataset.aincrad": "current", "sao.dataset.underworld": "beta" });
  const aincrad = loadDatasets({ storage, path: "/Aincrad/Map/maps.html" });
  assert.equal(aincrad.datasets.getDatasetFromLocation(), "current");
  const underworld = loadDatasets({ storage, path: "/Fractured Underworld/Main UI/mainui.html" });
  assert.equal(underworld.datasets.getDatasetFromLocation(), "beta");
}

/* --- explicit ?dataset= links override the stored world mode ---------------- */
{
  const { datasets } = loadDatasets({
    storage: createStorage({ "sao.dataset.aincrad": "current" }),
    path: "/Aincrad/Bestiary/bestiary.html",
    search: "?dataset=beta"
  });
  assert.equal(datasets.getDatasetFromLocation(), "beta", "a valid deep link wins over storage");

  const invalidParam = loadDatasets({
    storage: createStorage({ "sao.dataset.aincrad": "current" }),
    path: "/Aincrad/Bestiary/bestiary.html",
    search: "?dataset=bogus"
  });
  assert.equal(invalidParam.datasets.getDatasetFromLocation(), "current", "an invalid deep link is ignored");
}

/* --- URL helper ------------------------------------------------------------ */
{
  const { datasets } = loadDatasets({ path: "/Aincrad/Map/maps.html" });
  assert.match(datasets.addDatasetToUrl("../Bestiary/bestiary.html", "current", true), /dataset=current/);
  assert.equal(
    datasets.addDatasetToUrl("../Bestiary/bestiary.html?dataset=current", "current", false),
    "https://example.test/Aincrad/Bestiary/bestiary.html",
    "dropping the mode removes the query parameter"
  );
}

/* --- Main Quest markers are Current-only ----------------------------------- */
{
  const markerDataset = {
    "mq-1": { category: "mainQuests", floor: "floor1" },
    "biome-1": { category: "biomes", floor: "floor1" },
    "npc-1": { category: "npc", floor: "floor1" }
  };

  const current = loadDatasets({
    storage: createStorage({ "sao.dataset.aincrad": "current" }),
    path: "/Aincrad/Map/maps.html"
  });
  assert.deepEqual(
    Object.keys(current.datasets.filterMarkerDatasetForActiveMode(markerDataset)),
    ["mq-1"],
    "Current keeps only the Main Questline markers"
  );

  const beta = loadDatasets({ path: "/Aincrad/Map/maps.html" });
  assert.deepEqual(
    Object.keys(beta.datasets.filterMarkerDatasetForActiveMode(markerDataset)),
    ["biome-1", "npc-1"],
    "Beta drops the Main Quest markers and keeps the rest"
  );

  const underworldCurrent = loadDatasets({
    storage: createStorage({ "sao.dataset.underworld": "current" }),
    path: "/Fractured Underworld/Main UI/mainui.html"
  });
  assert.deepEqual(
    Object.keys(underworldCurrent.datasets.filterMarkerDatasetForActiveMode(markerDataset)),
    ["mq-1"],
    "the Fractured Underworld follows the same Main-Quest-only rule"
  );

  const alreadyMatching = { "biome-1": { category: "biomes" } };
  assert.equal(
    beta.datasets.filterMarkerDatasetForActiveMode(alreadyMatching),
    alreadyMatching,
    "a dataset that already matches the mode is returned untouched"
  );
}

console.log("Data mode regression tests passed.");
