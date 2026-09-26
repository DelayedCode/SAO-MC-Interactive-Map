const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const controllers = [
  {
    name: "Aincrad",
    file: path.join(root, "Aincrad", "Map", "maps.js"),
    destroy: "__destroyAincradMapRuntime"
  },
  {
    name: "Underworld",
    file: path.join(root, "Fractured Underworld", "Main UI", "mainui.js"),
    destroy: "__destroyUnderworldMapRuntime"
  }
];

for (const controller of controllers) {
  const source = fs.readFileSync(controller.file, "utf8");
  const registrationHelper = source.replace(
    /function addPageEventListener[\s\S]*?function schedulePageTimeout[\s\S]*?return handle;\r?\n}/,
    ""
  );

  assert.match(source, /function addPageEventListener/);
  assert.match(source, /function schedulePageAnimationFrame/);
  assert.match(source, /function schedulePageTimeout/);
  assert.match(source, new RegExp(controller.destroy));
  assert.match(source, /pageDisposer\.dispose\(\)/);
  assert.match(source, /sharedMapRuntime\.destroy\(\)/);
  assert.doesNotMatch(registrationHelper, /\.addEventListener\(/, `${controller.name} has an unowned listener`);
  assert.doesNotMatch(registrationHelper, /window\.requestAnimationFrame\(/, `${controller.name} has an untracked RAF`);
  assert.doesNotMatch(registrationHelper, /window\.setTimeout\(/, `${controller.name} has an untracked timeout`);
}

console.log("Page lifecycle ownership regression tests passed.");
