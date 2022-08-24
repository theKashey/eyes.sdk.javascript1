#!/usr/bin/env node
'use strict';

const chalk = require('chalk');
const handlePlugin = require('../src/setup/handlePlugin');
const handleCommands = require('../src/setup/handleCommands');
const {handleTypeScript} = require('../src/setup/handleTypeScript');
const getCypressVersion = require('../src/setup/getCypressVersion');
const getCypressPaths = require('../src/setup/getCypressPaths');

const cwd = process.cwd();
const semver = require('semver');
const {version} = require('../package');

console.log(chalk.cyan('Setup Eyes-Cypress', version));

const cypressVersion = getCypressVersion();
console.log(chalk.cyan(`Cypress version: ${cypressVersion}`));

const isCypress10 = semver.satisfies(cypressVersion, '>=10.0.0');
try {
  const {plugin, support, typescript} = getCypressPaths({cwd, isCypress10});
  handlePlugin(plugin);
  handleCommands(support);
  handleTypeScript(typescript);
} catch (err) {
  console.log(chalk.red(`Setup error:\n${err.message}`));
  process.exit(1);
}

console.log(chalk.cyan('Setup done!'));
