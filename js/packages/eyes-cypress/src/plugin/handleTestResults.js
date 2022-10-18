const errorDigest = require('./errorDigest');
const {makeLogger} = require('@applitools/logger');
const getErrorsAndDiffs = require('./getErrorsAndDiffs');
const {promisify} = require('util');
const fs = require('fs');
const writeFile = promisify(fs.writeFile);
const {formatters} = require('@applitools/core');
const {resolve} = require('path');

function printTestResults(testResultsArr) {
  const logger = makeLogger({
    level: testResultsArr.resultConfig.showLogs ? 'info' : 'silent',
    label: 'eyes',
  });
  if (!testResultsArr.testResults) return;
  const {passed, failed, diffs} = getErrorsAndDiffs(testResultsArr.testResults);
  if ((failed.length || diffs.length) && !!testResultsArr.resultConfig.eyesFailCypressOnDiff) {
    throw new Error(
      errorDigest({
        passed,
        failed,
        diffs,
        logger,
        isInteractive: !testResultsArr.resultConfig.isTextTerminal,
      }),
    );
  }
}
function handleBatchResultsFile(results, tapFileConfig) {
  const fileName = tapFileConfig.tapFileName || `${new Date().toISOString()}-eyes.tap`;
  const tapFile = resolve(tapFileConfig.tapDirPath, fileName);
  return writeFile(
    tapFile,
    formatters.toHierarchicTAPString(results, {includeSubTests: false, markNewAsPassed: true}),
  );
}

module.exports = {printTestResults, handleBatchResultsFile};
