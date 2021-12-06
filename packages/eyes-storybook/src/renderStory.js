'use strict';
const getStoryTitle = require('./getStoryTitle');
const getStoryBaselineName = require('./getStoryBaselineName');
const {deprecationWarning} = require('@applitools/eyes-sdk-core').GeneralUtils;

function makeRenderStory({logger, testWindow, performance, timeItAsync}) {
  return function renderStory({config, story, snapshot, url}) {
    const {name, kind, parameters} = story;
    const baselineName = getStoryBaselineName({name, kind, parameters});
    const title = getStoryTitle({name, kind, parameters});
    const eyesParameters = (parameters && parameters.eyes) || {};
    const eyesOptions = {
      ...config,
      ...eyesParameters,
      properties: [...(config.properties || []), ...(eyesParameters.properties || [])],
    };
    const {
      ignoreDisplacements,
      ignoreRegions,
      accessibilityRegions,
      floatingRegions,
      strictRegions,
      contentRegions,
      layoutRegions,
      scriptHooks,
      sizeMode,
      target,
      fully,
      selector,
      region,
      tag,
      properties,
      ignore,
      accessibilityValidation,
      sendDom,
      visualGridOptions,
      useDom,
      enablePatterns,
    } = eyesOptions;

    if (sizeMode) {
      console.log(deprecationWarning({deprecatedThing: "'sizeMode'", newThing: "'target'"}));
    }

    let ignoreRegionsBackCompat = ignoreRegions;
    if (ignore && ignoreRegions === undefined) {
      console.log(deprecationWarning({deprecatedThing: "'ignore'", newThing: "'ignoreRegions'"}));
      ignoreRegionsBackCompat = ignore;
    }

    logger.log(`running story ${title} with baseline ${baselineName}`);

    const storyProperties = [
      {name: 'Component name', value: kind},
      {name: 'State', value: name},
      ...(properties || []),
    ];

    const openParams = {
      testName: baselineName,
      displayName: title,
      browser: config.browser,
      properties: storyProperties,
      accessibilitySettings: accessibilityValidation,
    };

    const checkParams = {
      url,
      snapshot,
      ignore: ignoreRegionsBackCompat,
      floating: floatingRegions,
      layout: layoutRegions,
      strict: strictRegions,
      content: contentRegions,
      accessibility: accessibilityRegions,
      scriptHooks,
      sizeMode,
      target,
      fully,
      selector,
      region,
      tag,
      sendDom,
      visualGridOptions,
      useDom,
      enablePatterns,
      ignoreDisplacements,
    };

    return timeItAsync(baselineName, async () => {
      return testWindow({openParams, checkParams, throwEx: false});
    }).then(onDoneStory);

    function onDoneStory(results) {
      logger.log('finished story', baselineName, 'in', performance[baselineName]);
      return results;
    }
  };
}

module.exports = makeRenderStory;
