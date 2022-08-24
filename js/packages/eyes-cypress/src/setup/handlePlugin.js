'use strict';

const chalk = require('chalk');
const {addEyesCypressPlugin} = require('./addEyesCypressPlugin');
const isPluginDefined = require('./isPluginDefined');
const fs = require('fs');

function handlePlugin(pluginsFilePath) {
  const fileContent = fs.readFileSync(pluginsFilePath, 'utf-8');

  if (!isPluginDefined(fileContent)) {
    fs.writeFileSync(pluginsFilePath, addEyesCypressPlugin(fileContent));
    console.log(chalk.cyan('Plugins defined.'));
  } else {
    console.log(chalk.cyan('Plugins already defined'));
  }
}

module.exports = handlePlugin;
