const fs = require("fs");
const vm = require("vm");

const root = process.cwd();
const context = { console, window: {}, globalThis: {} };
context.window = context;
context.globalThis = context;

function load(file) {
  vm.runInNewContext(fs.readFileSync(`${root}/${file}`, "utf8"), context, { filename: file });
}

[1, 2, 3].forEach(floor => load(`Aincrad/eCompendium/ecompendium_floor${floor}.js`));
load("Aincrad/Character Build/character-build-icons.js");
load("Aincrad/Character Build/character-build-data.js");
load("Aincrad/Character Build/character-build-calculator.js");
load("Aincrad/Character Build/character-build-adapter.js");

const audit = context.CharacterBuildAdapter.getAuditReport();
const output = {
  generatedAt: new Date().toISOString(),
  ...audit,
  statisticInventory: audit.statisticInventory,
  statisticsByClassification: audit.statisticsByClassification,
  calculatedStatistics: audit.calculatedStatistics,
  displayedStatistics: audit.displayedStatistics,
  preservedButUnsupportedStatistics: audit.preservedButUnsupportedStatistics,
  uninterpretedStatistics: audit.uninterpretedStatistics
};

fs.mkdirSync(`${root}/docs`, { recursive: true });
fs.writeFileSync(`${root}/docs/character-build-beta-audit.json`, `${JSON.stringify(output, null, 2)}\n`);
console.log(JSON.stringify({
  totalBetaEquipmentRecords: output.totalBetaEquipmentRecords,
  totalSuccessfullyClassified: output.totalSuccessfullyClassified,
  totalUnclassified: output.totalUnclassified,
  distinctStatistics: Object.keys(output.statisticInventory).length,
  calculatedStatistics: output.calculatedStatistics,
  preservedButUnsupportedStatistics: output.preservedButUnsupportedStatistics,
  uninterpretedStatistics: output.uninterpretedStatistics.length
}, null, 2));
