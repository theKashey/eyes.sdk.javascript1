'use strict';

const {
  configParams,
  ConfigUtils,
  GeneralUtils,
  TypeUtils,
} = require('@applitools/visual-grid-client');
const {version: packageVersion} = require('../../package.json');
const agentId = `eyes-cypress/${packageVersion}`;

function getRunConfig() {
  const config = Object.assign(
    {agentId},
    ConfigUtils.getConfig({
      configParams: [
        ...configParams,
        'failCypressOnDiff',
        'tapDirPath',
        'eyesTimeout',
        'disableBrowserFetching',
      ],
    }),
  );

  const extraConfig = {};

  if (config.failCypressOnDiff === '0') {
    extraConfig.failCypressOnDiff = false;
  }
  if (TypeUtils.isString(config.showLogs)) {
    extraConfig.showLogs = config.showLogs === 'true' || config.showLogs === '1';
  }

  if (
    GeneralUtils.getPropertyByPath(config, 'viewport.height') &&
    GeneralUtils.getPropertyByPath(config, 'viewport.width')
  ) {
    extraConfig.browser = config.viewport;
  }
  if (GeneralUtils.getPropertyByPath(config, 'userAgent')) {
    extraConfig.userAgent = config.userAgent;
  }

  return Object.assign(extraConfig, config);
}

function getEyesConfig(runConfig) {
  return {
    eyesIsDisabled: !!runConfig.isDisabled,
    eyesBrowser: JSON.stringify(runConfig.browser),
    eyesLayoutBreakpoints: JSON.stringify(runConfig.layoutBreakpoints),
    eyesFailCypressOnDiff:
      runConfig.failCypressOnDiff === undefined ? true : !!runConfig.failCypressOnDiff,
    eyesTimeout: runConfig.eyesTimeout,
    eyesDisableBrowserFetching: !!runConfig.disableBrowserFetching,
  };
}

module.exports = {getRunConfig, getEyesConfig};
