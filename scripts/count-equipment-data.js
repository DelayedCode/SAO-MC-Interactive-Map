const fs = require('fs');
const vm = require('vm');

const files = [
  'Aincrad/eCompendium/ecompendium_floor1.js',
  'Aincrad/eCompendium/ecompendium_floor2.js',
  'Aincrad/eCompendium/ecompendium_floor3.js'
];

let total = 0;

for (const file of files) {
  const text = fs.readFileSync(file, 'utf8');
  const context = { window: {}, console };
  vm.runInNewContext(text, context, { filename: file });
  const dataset = Object.values(context.window).find(value => value && typeof value === 'object' && value.weapon);
  const count = Object.values(dataset || {}).reduce((sum, entries) => sum + (Array.isArray(entries) ? entries.length : 0), 0);
  console.log(file, count);
  total += count;
}

console.log('TOTAL', total);
