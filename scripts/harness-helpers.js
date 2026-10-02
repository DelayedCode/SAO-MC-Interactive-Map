/* Shared scaffolding for the scripts/ harnesses (test scripts, audits and checks).
 *
 * Everything here is infrastructure that several scripts used to re-declare or inline
 * verbatim: repo-relative file reading, VM script loading, DOM/classList/style stubs,
 * PNG dimension reading, URL description and Playwright page diagnostics.
 *
 * Design rules:
 *  - No shared mutable state. Each factory returns fresh state to its caller, so a
 *    script keeps full control of its own setup and teardown.
 *  - No Playwright dependency. attachDiagnostics() only calls page.on(...), so pure
 *    Node scripts can require this module without pulling in a browser.
 *  - No assertions about application behaviour and no production logic, except the
 *    intrinsic "this file really is a PNG" guard in readPngDimensions().
 */
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const assert = require("node:assert/strict");
const { startStaticServer, isServerReachable } = require("./serve-static");

/* --- Static server for the browser suites ----------------------------------
   The browser checks need the site served from a known origin. This reuses the single
   server implementation in scripts/serve-static.js and reuses an already-running server
   (for example a developer-run `npm run serve`) when one answers at rootUrl. */

/* Resolves to { url, reused, stop }. The started server is unref'd, so it can never keep
   the calling script alive once its checks finish. */
async function ensureStaticServer(rootUrl) {
  const url = rootUrl || process.env.SAO_BASE_URL || "http://127.0.0.1:8080";
  if (await isServerReachable(url)) return { url, reused: true, stop: async () => {} };

  const target = new URL(url);
  const handle = await startStaticServer({
    host: target.hostname || "127.0.0.1",
    port: target.port ? Number(target.port) : 8080,
    unref: true
  });
  return { url: handle.url, reused: false, stop: () => handle.close() };
}

/* Every script lives directly in scripts/, so the repository root is one level up. */
const REPO_ROOT = path.resolve(__dirname, "..");

/* Read a repository-root-relative file as utf8 text. */
function readFile(relativePath) {
  return fs.readFileSync(path.join(REPO_ROOT, relativePath), "utf8");
}

/* Run a repository-relative script inside a VM context.
   The same context object is normally reused across calls so its globals accumulate;
   that works because a context created with vm.createContext() (or already contextified
   by an earlier call) is reused rather than replaced. */
function loadScript(relativePath, context) {
  vm.runInNewContext(readFile(relativePath), context, { filename: relativePath });
}

/* Dimensions of a PNG file, read straight out of the IHDR chunk. */
function readPngDimensions(filePath) {
  const bytes = fs.readFileSync(filePath);
  assert.equal(bytes.toString("ascii", 1, 4), "PNG", `${filePath} is not a PNG file`);
  return {
    width: bytes.readUInt32BE(16),
    height: bytes.readUInt32BE(20)
  };
}

/* The parts of a navigation URL the navigation tests assert on. */
function describeUrl(rawUrl) {
  const url = new URL(rawUrl);
  return {
    pathname: decodeURIComponent(url.pathname),
    floor: url.searchParams.get("floor"),
    dataset: url.searchParams.get("dataset"),
    search: url.search
  };
}

/* --- Fake DOM pieces -------------------------------------------------------
   Small, boring stand-ins that the VM-based tests hand to the page scripts. Each
   call returns a new object; nothing is cached between tests. */

function createClassList() {
  const values = new Set();
  return {
    add(...names) {
      names.forEach((name) => values.add(name));
    },
    remove(...names) {
      names.forEach((name) => values.delete(name));
    },
    toggle(name, force) {
      const enabled = force === undefined ? !values.has(name) : Boolean(force);
      if (enabled) values.add(name);
      else values.delete(name);
      return enabled;
    },
    contains(name) {
      return values.has(name);
    }
  };
}

function createStyleStub() {
  const values = new Map();
  return {
    setProperty(name, value) {
      values.set(name, String(value));
    },
    getPropertyValue(name) {
      return values.has(name) ? values.get(name) : "";
    },
    removeProperty(name) {
      values.delete(name);
    }
  };
}

/* The DOM map createMapRuntime() expects, plus the documentElement the sidebar-resize
   controller writes --sidebar-width to. Pass overrides to replace individual entries
   (for example { mapContainer: null } to exercise the missing-element path). */
function createDom(overrides = {}) {
  const base = {
    mapContainer: {},
    sidebar: {},
    mapLayer: {},
    mapImage: {},
    undergroundMapImage: {},
    mobAreaLayer: {},
    markerLayer: {},
    title: {},
    content: {},
    overlayMappedCoords: {},
    floorSelect: {},
    undergroundToggle: {},
    searchInput: {},
    clearFiltersButton: {},
    zoomLabel: {},
    resetViewButton: {},
    documentElement: { style: { setProperty() {} } }
  };
  return { ...base, ...overrides };
}

/* --- Playwright page diagnostics -------------------------------------------
   Records console errors, uncaught page errors and failed requests for one page.
   The returned arrays keep filling for the lifetime of the page, so callers that
   spread the result get the live arrays. */

function attachDiagnostics(page) {
  const errors = [];
  const failedRequests = [];
  page.on("console", (message) => {
    if (message.type() === "error" && !message.text().includes("frame-ancestors")) errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("requestfailed", (request) => failedRequests.push(request.url()));
  return { errors, failedRequests };
}

module.exports = {
  readFile,
  loadScript,
  readPngDimensions,
  describeUrl,
  createClassList,
  createStyleStub,
  createDom,
  attachDiagnostics,
  ensureStaticServer
};
