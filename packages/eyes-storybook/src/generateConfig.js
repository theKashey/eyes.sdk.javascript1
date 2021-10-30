'use strict';
const pick = require('lodash.pick');
const {ConfigUtils, GeneralUtils} = require('@applitools/eyes-sdk-core');
const {resolve} = require('path');
const {deprecationWarning} = GeneralUtils;
const uniq = require('./uniq');

function generateConfig({argv = {}, defaultConfig = {}, externalConfigParams = []}) {
  const configPath = argv.conf ? resolve(process.cwd(), argv.conf) : undefined;
  const defaultConfigParams = Object.keys(defaultConfig);
  const configParams = uniq(defaultConfigParams.concat(externalConfigParams));
  const config = ConfigUtils.getConfig({configPath, configParams});
  const argvConfig = pick(argv, configParams);
  const result = Object.assign({}, defaultConfig, config, argvConfig);

  // backward compatibility
  if (result.waitBeforeCapture === defaultConfig.waitBeforeCapture) {
    if (result.waitBeforeScreenshots !== defaultConfig.waitBeforeScreenshots) {
      console.log(
        deprecationWarning({
          deprecatedThing: "'waitBeforeScreenshots'",
          newThing: "'waitBeforeCapture'",
        }),
      );
      result.waitBeforeCapture = result.waitBeforeScreenshots;
    }
    if (result.waitBeforeScreenshot !== defaultConfig.waitBeforeScreenshot) {
      console.log(
        deprecationWarning({
          deprecatedThing: "'waitBeforeScreenshot'",
          newThing: "'waitBeforeCapture'",
        }),
      );
      result.waitBeforeCapture = result.waitBeforeScreenshot;
    }
  }

  if (typeof result.waitBeforeCapture === 'string' && !isNaN(parseInt(result.waitBeforeCapture))) {
    result.waitBeforeCapture = Number(result.waitBeforeCapture);
  }

  if (result.showLogs === '1') {
    result.showLogs = true;
  }

  if (!result.testConcurrency && !result.concurrency) {
    result.testConcurrency = 5; // TODO require from core
  }

  if (result.storyDataGap === undefined) {
    result.storyDataGap = result.testConcurrency;
  }
  return result;
}

module.exports = generateConfig;
