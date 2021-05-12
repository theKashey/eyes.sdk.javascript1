'use strict';
const makeWaitForBatch = require('./waitForBatch');
const makeHandleBatchResultsFile = require('./makeHandleBatchResultsFile');
const getErrorsAndDiffs = require('./getErrorsAndDiffs');
const processCloseAndAbort = require('./processCloseAndAbort');
const errorDigest = require('./errorDigest');
const {tests} = require('./runningTests');

function setGlobalRunHooks(on, {visualGridClient, logger, eyesConfig}) {
  let waitForBatch;

  on('before:run', ({config}) => {
    const {isTextTerminal, eyesTestConcurrency: testConcurrency} = config;
    // ugly but neccessary here - as this is the only place that cypress exposes the run mode on config
    if (!isTextTerminal) return;
    eyesConfig.eyesLegacyHooks = false;

    waitForBatch = makeWaitForBatch({
      logger: (logger.extend && logger.extend('waitForBatch')) || console,
      testConcurrency,
      processCloseAndAbort,
      getErrorsAndDiffs,
      errorDigest,
      isInteractive: !isTextTerminal,
      handleBatchResultsFile: makeHandleBatchResultsFile(config),
    });
  });

  on('after:run', async ({config}) => {
    if (!config.isTextTerminal) return;

    try {
      // we rely on the fact that `runningTests.reset()` wasn't called
      // so that tests that were added in `open` are available here (through `tests` in `runningTests.js`)
      await waitForBatch(tests, visualGridClient.closeBatch);
    } catch (e) {
      if (!!config.eyesFailCypressOnDiff) {
        throw e;
      }
    }
  });
}

module.exports = setGlobalRunHooks;
