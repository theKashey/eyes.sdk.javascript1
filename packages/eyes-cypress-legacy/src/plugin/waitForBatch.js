'use strict';
const {concurrencyMsg} = require('./concurrencyMsg');
const flatten = require('lodash.flatten');

function makeWaitForBatch({
  logger,
  testConcurrency,
  processCloseAndAbort,
  getErrorsAndDiffs,
  errorDigest,
  handleBatchResultsFile,
  isInteractive,
}) {
  return async function(runningTests, closeBatch) {
    logger.log(`Waiting for test results of ${runningTests.length} tests.`);

    const testResultsArr = flatten(await processCloseAndAbort({runningTests, closeBatch, logger}));
    const {failed, diffs, passed} = getErrorsAndDiffs(testResultsArr);
    await handleBatchResultsFile(testResultsArr);

    if (Number(testConcurrency) === 5) {
      console.log(concurrencyMsg);
    }

    if (failed.length || diffs.length) {
      throw new Error(errorDigest({passed, failed, diffs, logger, isInteractive}));
    }

    return passed.length;
  };
}

module.exports = makeWaitForBatch;
