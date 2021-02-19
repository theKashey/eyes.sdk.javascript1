'use strict';
const poll = require('../browser/poll');
const makeWaitForBatch = require('./waitForBatch');
const makeHandleBatchResultsFile = require('./makeHandleBatchResultsFile');
const getErrorsAndDiffs = require('./getErrorsAndDiffs');
const processCloseAndAbort = require('./processCloseAndAbort');
const pollingHandler = require('./pollingHandler');
const errorDigest = require('./errorDigest');
const {tests} = require('./runningTests');

function setGlobalRunHooks(on, {visualGridClient, logger}) {
  let waitForBatch;

  on('before:run', ({config}) => {
    waitForBatch = makeWaitForBatch({
      logger: (logger.extend && logger.extend('waitForBatch')) || console,
      concurrency: config.concurrency,
      processCloseAndAbort,
      getErrorsAndDiffs,
      errorDigest,
      isInteractive: !config.isTextTerminal,
      handleBatchResultsFile: makeHandleBatchResultsFile(config),
    });
  });

  on('after:run', async ({config}) => {
    try {
      const pollBatchEnd = pollingHandler(
        waitForBatch.bind(null, tests, visualGridClient.closeBatch),
        '',
      );
      const closeBatch = poll(async () => pollBatchEnd({args: undefined}));
      await closeBatch({args: undefined});
    } catch (e) {
      if (!!config.eyesFailCypressOnDiff) {
        throw e;
      }
    }
  });
}

module.exports = setGlobalRunHooks;
