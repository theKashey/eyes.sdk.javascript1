'use strict';
const {configParams, ConfigUtils, TypeUtils} = require('@applitools/visual-grid-client');
const {version: packageVersion} = require('../../package.json');
const agentId = `eyes-cypress/${packageVersion}`;
const DEFAULT_TEST_CONCURRENCY = 5;

function makeConfig() {
  const config = Object.assign(
    {agentId},
    ConfigUtils.getConfig({
      configParams: [
        ...configParams,
        'failCypressOnDiff',
        'tapDirPath',
        'disableBrowserFetching',
        'testConcurrency',
      ],
    }),
  );

  if (config.failCypressOnDiff === '0') {
    config.failCypressOnDiff = false;
  }

  if (TypeUtils.isString(config.showLogs)) {
    config.showLogs = config.showLogs === 'true' || config.showLogs === '1';
  }

  if (TypeUtils.isString(config.testConcurrency)) {
    config.testConcurrency = Number(config.testConcurrency);
  }

  if (config.accessibilityValidation) {
    config.accessibilitySettings = config.accessibilityValidation;
    delete config.accessiblityValidation;
  }

  const eyesConfig = {
    tapDirPath: config.tapDirPath,
    eyesIsDisabled: !!config.isDisabled,
    eyesBrowser: JSON.stringify(config.browser),
    eyesLayoutBreakpoints: JSON.stringify(config.layoutBreakpoints),
    eyesFailCypressOnDiff:
      config.failCypressOnDiff === undefined ? true : !!config.failCypressOnDiff,
    eyesDisableBrowserFetching: !!config.disableBrowserFetching,
    eyesTestConcurrency: config.testConcurrency || DEFAULT_TEST_CONCURRENCY,
    eyesWaitBeforeCapture: config.waitBeforeCapture,
  };

  return {config, eyesConfig};
}

module.exports = makeConfig;
