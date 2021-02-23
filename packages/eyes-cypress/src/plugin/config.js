'use strict';
const {configParams, ConfigUtils, TypeUtils} = require('@applitools/visual-grid-client');
const {version: packageVersion} = require('../../package.json');
const agentId = `eyes-cypress/${packageVersion}`;

function makeConfig() {
  const baseConfig = {};
  const vgConfig = Object.assign(
    {agentId},
    ConfigUtils.getConfig({
      configParams: [...configParams, 'failCypressOnDiff', 'tapDirPath', 'disableBrowserFetching'],
    }),
  );

  if (vgConfig.failCypressOnDiff === '0') {
    baseConfig.failCypressOnDiff = false;
  }

  if (TypeUtils.isString(vgConfig.showLogs)) {
    baseConfig.showLogs = vgConfig.showLogs === 'true' || vgConfig.showLogs === '1';
  }

  const config = Object.assign(vgConfig, baseConfig);

  const eyesConfig = {
    eyesIsDisabled: !!config.isDisabled,
    eyesBrowser: JSON.stringify(config.browser),
    eyesLayoutBreakpoints: JSON.stringify(config.layoutBreakpoints),
    eyesFailCypressOnDiff:
      config.failCypressOnDiff === undefined ? true : !!config.failCypressOnDiff,
    eyesDisableBrowserFetching: !!config.disableBrowserFetching,
    eyesLegacyHooks: true,
  };

  return {config, eyesConfig};
}

module.exports = makeConfig;
