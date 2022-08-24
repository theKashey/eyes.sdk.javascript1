const fs = require('fs');
const path = require('path');
const cwd = process.cwd();

function getCypressVersion() {
  const cypressPackage = require.resolve('cypress', {paths: [cwd]});
  const packageJson = JSON.parse(
    fs.readFileSync(path.resolve(path.dirname(cypressPackage), 'package.json')),
  );
  return packageJson.version;
}

module.exports = getCypressVersion;
