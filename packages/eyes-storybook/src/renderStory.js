'use strict';
const getStoryTitle = require('./getStoryTitle');
const {deprecationWarning} = require('@applitools/eyes-sdk-core').GeneralUtils;

function makeRenderStory({logger, testWindow, performance, timeItAsync}) {
  return function renderStory({config, story, snapshot, url}) {
    const {name, kind, parameters} = story;
    const title = getStoryTitle({name, kind, parameters});
    const eyesOptions = Object.assign({}, config, (parameters && parameters.eyes) || {});
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

    logger.log('running story', title);

    const openParams = {
      testName: title,
      browser: config.browser,
      properties: [
        {name: 'Component name', value: kind},
        {name: 'State', value: name},
        ...(properties || []),
      ],
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

    return timeItAsync(title, async () => {
      return testWindow({openParams, checkParams, throwEx: false});
    }).then(onDoneStory);

    function onDoneStory(results) {
      logger.log('finished story', title, 'in', performance[title]);
      return results;
    }
  };
}

module.exports = makeRenderStory;
