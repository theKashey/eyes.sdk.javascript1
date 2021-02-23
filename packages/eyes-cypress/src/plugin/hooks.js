'use strict';
const makeWaitForBatch = require('./waitForBatch');
const makeHandleBatchResultsFile = require('./makeHandleBatchResultsFile');
const getErrorsAndDiffs = require('./getErrorsAndDiffs');
const processCloseAndAbort = require('./processCloseAndAbort');
const errorDigest = require('./errorDigest');
const {tests} = require('./runningTests');

function setGlobalRunHooks(on, {visualGridClient, logger}) {
  let waitForBatch;

  on('before:run', ({config}) => {
    const {isTextTerminal, testConcurrency} = config;
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
    try {
      await waitForBatch(tests, visualGridClient.closeBatch);
    } catch (e) {
      if (!!config.eyesFailCypressOnDiff) {
        throw e;
      }
    }
  });
}

module.exports = setGlobalRunHooks;
