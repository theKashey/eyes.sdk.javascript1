'use strict';

const fs = require('fs');
const chalk = require('chalk');
const addEyesCommands = require('./addEyesCommands');
const isCommandsDefined = require('./isCommandsDefined');

function handleCommands(supportFilePath) {
  if (supportFilePath) {
    const supportFileContent = fs.readFileSync(supportFilePath, 'utf-8');

    if (!isCommandsDefined(supportFileContent)) {
      fs.writeFileSync(supportFilePath, addEyesCommands(supportFileContent));
      console.log(chalk.cyan('Commands defined.'));
    } else {
      console.log(chalk.cyan('Commands already defined.'));
    }
  } else {
    throw new Error('Commands could not be defined. Support file could not be found');
  }
}

module.exports = handleCommands;
