'use strict';
const chalk = require('chalk');
const {writeFileSync, existsSync} = require('fs');
const eyesIndexContent = `import "@applitools/eyes-cypress"`;

function handleTypeScript(typeScriptFilePath) {
  if (!existsSync(typeScriptFilePath)) {
    writeFileSync(typeScriptFilePath, eyesIndexContent);
    console.log(chalk.cyan('TypeScript defined.'));
  } else {
    console.log(chalk.cyan('TypeScript already defined.'));
  }
}

module.exports = {handleTypeScript, eyesIndexContent};
