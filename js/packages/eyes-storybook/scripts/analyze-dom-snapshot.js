'use strict';
const fs = require('fs');
const filepath = process.argv[2];

const s = fs.readFileSync(filepath).toString();
const values = s
  .split('\n')
  .map(line => line.match(/\[\+(.+)ms\] processPage end/))
  .filter(x => x)
  .map(x => Number(x[1]));

const avgDomSnapshot = values.reduce((sum, value) => sum + value, 0) / values.length;
const maxDomSnapshot = values.reduce((max, value) => Math.max(max, value));
const top20 = values.sort((a, b) => (a > b ? -1 : a < b ? 1 : 0)).slice(0, 30);

console.log(`across ${values.length} calls:`);
console.log(`  average: ${avgDomSnapshot.toFixed(3)}ms`);
console.log(`  max:     ${maxDomSnapshot}ms`);
console.log(`  top 10:  ${top20}`);
