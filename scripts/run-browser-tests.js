/* Browser-suite orchestrator.
 *
 * Starts the static server (scripts/serve-static.js) once, runs a named suite of existing
 * browser check scripts as child processes, and stops the server afterwards. This removes
 * the "start a server by hand first" step while leaving every individual check script and
 * its behavior untouched.
 *
 * Usage:
 *   node scripts/run-browser-tests.js core     # walkthrough/cluster/navigation/char-build/equipment
 *   node scripts/run-browser-tests.js smoke    # en/es/fr zero-console-error smoke guardrail
 *   node scripts/run-browser-tests.js ui       # verify-ui-polish + visual-quality-inspection
 *   node scripts/run-browser-tests.js all      # every browser suite, in order
 *
 * An already-running server (for example `npm run serve`) is reused.
 */
"use strict";

const { spawn } = require("node:child_process");
const path = require("node:path");
const { startStaticServer, isServerReachable } = require("./serve-static");

const SUITES = Object.freeze({
  core: [
    "test-walkthrough-pages.js",
    "test-cluster-wheel.js",
    "test-miscinfo-navigation.js",
    "test-fu-navigation.js",
    "test-data-mode-pages-browser.js",
    "test-custom-waypoints.js",
    "test-coordinate-lifecycle-browser.js",
    "test-cursor-site-wide.js",
    "test-journeymap-color-picker.js",
    "test-journeymap-category-import-browser.js",
    "test-journeymap-export-colors-browser.js",
    "test-journeymap-import-browser.js",
    "test-journeymap-export-fu-browser.js",
    "test-map-tutorial-action.js",
    "test-map-context-menu.js",
    "test-map-image-runtime.js",
    "test-dungeon-tutorial-browser.js",
    "test-character-build-stats-ui.js",
    "test-character-build-prerequisites.js",
    "test-character-build-picker.js",
    "test-settings-menu.js",
    "equipment-render-check.js"
  ],
  smoke: ["test-browser-smoke.js"],
  ui: ["verify-ui-polish.js", "visual-quality-inspection.js"]
});

function resolveSuiteNames(argument) {
  const requested = String(argument || "core")
    .trim()
    .toLowerCase();
  if (requested === "all") return Object.values(SUITES).flat();
  if (Object.prototype.hasOwnProperty.call(SUITES, requested)) return SUITES[requested].slice();
  return null;
}

function runScript(script, env) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [path.join(__dirname, script)], {
      stdio: "inherit",
      env
    });
    child.on("error", (error) => {
      console.error(`Could not run ${script}: ${error.message}`);
      resolve(1);
    });
    child.on("exit", (code) => resolve(code === 0 ? 0 : code || 1));
  });
}

async function main() {
  const names = resolveSuiteNames(process.argv[2]);
  if (!names || names.length === 0) {
    console.error(`Unknown suite "${process.argv[2] || ""}". Known suites: ${Object.keys(SUITES).join(", ")}, all`);
    process.exitCode = 2;
    return;
  }

  const rootUrl = process.env.SAO_BASE_URL || "http://127.0.0.1:8080";
  let handle = null;

  if (!(await isServerReachable(rootUrl))) {
    const target = new URL(rootUrl);
    try {
      handle = await startStaticServer({
        host: target.hostname || "127.0.0.1",
        port: target.port ? Number(target.port) : 8080,
        unref: false
      });
    } catch (error) {
      console.error(`Could not start the static server at ${rootUrl}: ${error.message}`);
      process.exitCode = 1;
      return;
    }
    console.log(`Static server started at ${handle.url}`);
  } else {
    console.log(`Using existing static server at ${rootUrl}`);
  }

  const env = { ...process.env, SAO_BASE_URL: handle ? handle.url : rootUrl };
  let failedScript = null;

  try {
    for (const script of names) {
      console.log(`\n=== ${script} ===`);
      const code = await runScript(script, env);
      if (code !== 0) {
        failedScript = { script, code };
        break;
      }
      console.log(`PASSED: ${script}`);
    }
  } finally {
    if (handle) await handle.close();
  }

  if (failedScript) {
    console.error(`\nBrowser suite failed: ${failedScript.script} (exit ${failedScript.code})`);
    process.exitCode = 1;
  } else {
    console.log(`\nBrowser suite passed: ${names.length} script(s).`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
