const poll = require('../browser/poll');
// const makeHandleCypressViewport = require('../browser/makeHandleCypressViewport');
// const handleCypressViewport = makeHandleCypressViewport({cy});
const makeWaitForBatch = require('./waitForBatch');
const makeHandleBatchResultsFile = require('./makeHandleBatchResultsFile');
const getErrorsAndDiffs = require('./getErrorsAndDiffs');
const processCloseAndAbort = require('./processCloseAndAbort');
const pollingHandler = require('./pollingHandler');
const errorDigest = require('./errorDigest');
const {tests} = require('./runningTests');

function setGlobalHooks(on, cypressConfig, {visualGridClient, logger}) {
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
    // TODO
    // const userAgent = navigator.userAgent
    // const viewport = {
    //   width: getGlobalConfigProperty('viewportWidth'),
    //   height: getGlobalConfigProperty('viewportHeight'),
    // }
    // let browser = getGlobalConfigProperty('eyesBrowser')
    // handleCypressViewport(browser)
  });

  on('after:run', async ({config}) => {
    const pollBatchEnd = pollingHandler(
      waitForBatch.bind(null, tests, visualGridClient.closeBatch),
      '',
    );
    const closeBatch = poll(async () => pollBatchEnd({args: undefined}));
    try {
      await closeBatch({args: undefined});
    } catch (e) {
      if (!!config.eyesFailCypressOnDiff) {
        throw e;
      }
    }
  });
}

module.exports = setGlobalHooks;
