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

function makeConfig(baseConfig = {}) {
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
    baseConfig.failCypressOnDiff = false;
  }
  if (TypeUtils.isString(vgConfig.showLogs)) {
    baseConfig.showLogs = vgConfig.showLogs === 'true' || vgConfig.showLogs === '1';
  }

  if (getProp(vgConfig, 'viewport.height') && getProp(vgConfig, 'viewport.width')) {
    baseConfig.browser = vgConfig.viewport;
  }
  if (getProp(vgConfig, 'userAgent')) {
    baseConfig.userAgent = vgConfig.userAgent;
  }

  const config = Object.assign(vgConfig, baseConfig);

  const eyesConfig = {
    eyesIsDisabled: !!config.isDisabled,
    eyesBrowser: JSON.stringify(config.browser),
    eyesLayoutBreakpoints: JSON.stringify(config.layoutBreakpoints),
    eyesFailCypressOnDiff:
      config.failCypressOnDiff === undefined ? true : !!config.failCypressOnDiff,
    eyesTimeout: config.eyesTimeout,
    eyesDisableBrowserFetching: !!config.disableBrowserFetching,
  };

  return {config, eyesConfig};
}

module.exports = makeConfig;
