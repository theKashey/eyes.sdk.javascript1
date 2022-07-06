#!/usr/bin/env node
'use strict';

const chalk = require('chalk');
const {handlePlugin} = require('../src/setup/handlePlugin');
const {handleCommands, handlerCommandsCypress10} = require('../src/setup/handleCommands');
const {handleTypeScript, handlerTypeScriptCypress10} = require('../src/setup/handleTypeScript');
const {version} = require('../package');
const fs = require('fs');
const cwd = process.cwd();

console.log(chalk.cyan('Setup eyes-cypress', version));
const packageJson = JSON.parse(fs.readFileSync('package.json'));
let cypressVersion;

if (packageJson.dependencies && packageJson.dependencies.cypress) {
  cypressVersion = packageJson.dependencies.cypress;
} else if (packageJson.devDependencies && packageJson.devDependencies.cypress) {
  cypressVersion = packageJson.devDependencies.cypress;
}
console.log(chalk.cyan('Cypress version that was found', cypressVersion));
const isCypress10 = parseFloat(cypressVersion, 10) >= 10 ? true : false;
try {
  if (!isCypress10) {
    handlePlugin(cwd, isCypress10);
    handleCommands(cwd);
    handleTypeScript(cwd);
  } else {
    handlePlugin(cwd, isCypress10);
    const supportFilePath = handlerCommandsCypress10(cwd);
    handlerTypeScriptCypress10(supportFilePath);
  }
} catch (e) {
  console.log(chalk.red('Setup error:\n', e));
}

console.log(chalk.cyan('Setup done!'));
