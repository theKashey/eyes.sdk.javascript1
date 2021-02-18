'use strict';

const {
  configParams,
  ConfigUtils,
  GeneralUtils,
  TypeUtils,
} = require('@applitools/visual-grid-client');
const {version: packageVersion} = require('../../package.json');
const agentId = `eyes-cypress/${packageVersion}`;
const getProp = GeneralUtils.getPropertyByPath;

function getConfig() {
  const config = {};
  const vgConfig = Object.assign(
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

  if (vgConfig.failCypressOnDiff === '0') {
    config.failCypressOnDiff = false;
  }
  if (TypeUtils.isString(vgConfig.showLogs)) {
    config.showLogs = vgConfig.showLogs === 'true' || vgConfig.showLogs === '1';
  }

  if (getProp(vgConfig, 'viewport.height') && getProp(vgConfig, 'viewport.width')) {
    config.browser = vgConfig.viewport;
  }
  if (getProp(vgConfig, 'userAgent')) {
    config.userAgent = vgConfig.userAgent;
  }

  return Object.assign({shared: {}}, vgConfig, config);
}

function getEyesConfig(config) {
  return {
    eyesIsDisabled: !!config.isDisabled,
    eyesBrowser: JSON.stringify(config.browser),
    eyesLayoutBreakpoints: JSON.stringify(config.layoutBreakpoints),
    eyesFailCypressOnDiff:
      config.failCypressOnDiff === undefined ? true : !!config.failCypressOnDiff,
    eyesTimeout: config.eyesTimeout,
    eyesDisableBrowserFetching: !!config.disableBrowserFetching,
  };
}

module.exports = {getConfig, getEyesConfig};
