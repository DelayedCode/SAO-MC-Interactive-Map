const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const runtimePath = path.join(root, "Aincrad", "eCompendium", "ecompendium.js");
const runtime = fs.readFileSync(runtimePath, "utf8");

assert.match(runtime, /const registeredEquipmentDataSets = new WeakSet\(\);/);
assert.match(runtime, /registeredEquipmentDataSets\.has\(dataSet\)/);
assert.match(runtime, /registeredEquipmentDataSets\.add\(dataSet\)/);
assert.doesNotMatch(runtime, /safeEntries\.forEach\(registerEntryTranslations\)/);

console.log("Equipment performance regression guards passed.");
