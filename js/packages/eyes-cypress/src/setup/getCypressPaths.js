'use strict';

const fs = require('fs');
const path = require('path');

function getCypressPaths({cwd, isCypress10}) {
  if (isCypress10) {
    return getCypressPaths10AndAbove(cwd);
  } else {
    return getCypressPaths9AndBelow(cwd);
  }
}

function getCypressPaths10AndAbove(cwd) {
  const cypressConfigPath = path.resolve(cwd, 'cypress.config.js');
  if (fs.existsSync(cypressConfigPath)) {
    const configContent = fs.readFileSync(cypressConfigPath, 'utf-8');
    const supportFilePath = getSupportFilePathFromCypress10Config({cwd, configContent});
    const typeScriptFilePath = supportFilePath
      ? path.resolve(path.dirname(supportFilePath), 'index.d.ts')
      : undefined;
    return {
      config: cypressConfigPath,
      plugin: cypressConfigPath,
      support: supportFilePath,
      typescript: typeScriptFilePath,
    };
  } else {
    throw new Error(
      `No configuration file found at ${cypressConfigPath}. This is usually caused by setting up Eyes before setting up Cypress. Please run "npx cypress open" first.`,
    );
  }
}

function getSupportFilePathFromCypress10Config({cwd, configContent}) {
  let supportFilePath;
  if (configContent.includes('supportFile')) {
    const regex = new RegExp(/(?:supportFile:)(?:\s*)(.*)/g);
    const filePath = regex.exec(configContent)[1].replace(/['|"|,]*/g, '');
    supportFilePath = path.resolve(cwd, filePath);
  } else {
    if (fs.existsSync(path.resolve(cwd, 'cypress/support/e2e.js'))) {
      supportFilePath = path.resolve(cwd, 'cypress/support/e2e.js');
    } else if (fs.existsSync(path.resolve(cwd, 'cypress/support/e2e.ts'))) {
      supportFilePath = path.resolve(cwd, 'cypress/support/e2e.ts');
    } else if (fs.existsSync(path.resolve(cwd, 'cypress/support/component.js'))) {
      supportFilePath = path.resolve(cwd, 'cypress/support/component.js');
    }
  }
  return supportFilePath;
}

function getCypressPaths9AndBelow(cwd) {
  const cypressConfigPath = path.resolve(cwd, 'cypress.json');
  if (fs.existsSync(cypressConfigPath)) {
    try {
      const configContent = JSON.parse(fs.readFileSync(cypressConfigPath));
      const supportFilePath = path.resolve(configContent.supportFile || 'cypress/support/index.js');
      const typeScriptFilePath = supportFilePath
        ? path.resolve(path.dirname(supportFilePath), 'index.d.ts')
        : undefined;
      return {
        config: cypressConfigPath,
        plugin: path.resolve(cwd, configContent.pluginsFile || 'cypress/plugins/index.js'),
        support: supportFilePath,
        typescript: typeScriptFilePath,
      };
    } catch (err) {
      throw new Error(`cypress.json at ${cypressConfigPath} is not a valid JSON: ${err.message}`);
    }
  } else {
    throw new Error(
      `No configuration file found at ${cypressConfigPath}. This is usually caused by setting up Eyes before setting up Cypress. Please run "npx cypress open" first.`,
    );
  }
}

module.exports = getCypressPaths;
