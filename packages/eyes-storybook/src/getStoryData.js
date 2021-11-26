'use strict';
const {presult} = require('@applitools/functional-commons');
const {ArgumentGuard} = require('@applitools/eyes-sdk-core');
const renderStoryWithClientAPI = require('../dist/renderStoryWithClientAPI');
const runRunBeforeScript = require('../dist/runRunBeforeScript');
const getStoryBaselineName = require('./getStoryBaselineName');
const {URL} = require('url');
const runRunAfterScript = require('../dist/runRunAfterScript');
const waitFor = require('./waitFor');

function makeGetStoryData({logger, takeDomSnapshots, waitBeforeCapture, reloadPagePerStory}) {
  return async function getStoryData({story, storyUrl, page, waitBeforeStory}) {
    const title = getStoryBaselineName(story);
    logger.log(`getting data from story`, title);

    const eyesParameters = story.parameters && story.parameters.eyes;
    if (story.isApi && !reloadPagePerStory) {
      const actualVariationParam = await getEyesVariationParam(page);
      const expectedVariationUrlParam = eyesParameters
        ? eyesParameters.variationUrlParam
        : undefined;
      if (
        (!actualVariationParam && !expectedVariationUrlParam) ||
        actualVariationParam === expectedVariationUrlParam
      ) {
        const err = await page.evaluate(renderStoryWithClientAPI, story.index);
        err && handleRenderStoryError(err);
      } else {
        await renderStoryLegacy();
      }
    } else {
      await renderStoryLegacy();
    }

    const wait = waitBeforeStory || waitBeforeCapture;
    if (typeof wait === 'number') {
      ArgumentGuard.greaterThanOrEqualToZero(wait, 'waitBeforeCapture', true);
    }
    if (wait) {
      logger.log(`waiting before screenshot of ${title} ${wait}`);
      await waitFor(page, wait);
    }

    if (eyesParameters && eyesParameters.runBefore) {
      await page.evaluate(runRunBeforeScript, story.index).catch(err => {
        logger.log(`error during runBefore: ${err}`); // it might be good to aggregate these errors and output them at the end of the run
      });
    }

    logger.log(`running takeDomSnapshot(s) for story ${title}`);

    const result = await takeDomSnapshots({
      page,
      layoutBreakpoints: eyesParameters ? eyesParameters.layoutBreakpoints : undefined,
      waitBeforeCapture: wait
        ? async () => {
            logger.log(`waiting before screenshot of ${title} ${wait}`);
            await waitFor(page, wait);
          }
        : undefined,
    });

    if (eyesParameters && eyesParameters.runAfter) {
      await page.evaluate(runRunAfterScript, story.index).catch(err => {
        logger.log(`error during runAfter: ${err}`);
      });
    }

    logger.log(`done getting data from story`, title);
    return result;

    async function renderStoryLegacy() {
      logger.log(`getting data from story ${storyUrl}`);
      const [err] = await presult(page.goto(storyUrl, {timeout: 10000}));
      if (err) {
        logger.log(`error navigating to story ${storyUrl}`, err);
        throw err;
      }
    }

    async function getEyesVariationParam() {
      try {
        return new URL(await page.url()).searchParams.get('eyes-variation');
      } catch (ex) {
        logger.log('failed to get url from page (in need of eyes-variation param)');
      }
    }

    // TODO (amit): handle this error in the caller (probably renderStories)
    function handleRenderStoryError(error) {
      logger.log(error.message);
      const versionMsg = error.version
        ? ` The detected version of storybook is ${error.version}.`
        : '';
      throw new Error(
        `Eyes could not render stories properly.${versionMsg} Contact support@applitools.com for troubleshooting.`,
      );
    }
  };
}

module.exports = makeGetStoryData;
