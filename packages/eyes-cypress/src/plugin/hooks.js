'use strict';
const makeWaitForBatch = require('./waitForBatch');
const makeHandleBatchResultsFile = require('./makeHandleBatchResultsFile');
const getErrorsAndDiffs = require('./getErrorsAndDiffs');
const processCloseAndAbort = require('./processCloseAndAbort');
const errorDigest = require('./errorDigest');
const runningTests = require('./runningTests');

function makeGlobalRunHooks({visualGridClient, logger}) {
  let waitForBatch;

  return {
    'before:run': ({config}) => {
      const {isTextTerminal, eyesTestConcurrency: testConcurrency} = config;
      if (!config.isTextTerminal) return;

      waitForBatch = makeWaitForBatch({
        logger: (logger.extend && logger.extend('waitForBatch')) || console,
        testConcurrency,
        processCloseAndAbort,
        getErrorsAndDiffs,
        errorDigest,
        isInteractive: !isTextTerminal,
        handleBatchResultsFile: makeHandleBatchResultsFile(config),
      });
    },

    'after:run': async ({config}) => {
      if (!config.isTextTerminal) return;

      try {
        await waitForBatch(runningTests.tests, visualGridClient.closeBatch);
      } catch (e) {
        if (!!config.eyesFailCypressOnDiff) {
          throw e;
        }
      }
    },
  };
}

module.exports = makeGlobalRunHooks;
