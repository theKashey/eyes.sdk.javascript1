'use strict';
const flatten = require('lodash.flatten');
const chalk = require('./chalkify');
const {TestResultsError, TestResultsFormatter} = require('@applitools/eyes-sdk-core');
const utils = require('@applitools/utils');
const uniq = require('./uniq');
const concurrencyMsg = require('./concurrencyMsg');

function processResults({results = [], totalTime, testConcurrency, saveNewTests = true}) {
  let outputStr = '\n';
  const formatter = new TestResultsFormatter();
  const pluralize = utils.general.pluralize;
  let testResults = results.map(r => r.resultsOrErr);
  testResults = flatten(testResults).filter(r => r.constructor.name !== 'Error');
  const unresolved = testResults.filter(r => r.getIsDifferent());
  const passedOrNew = testResults.filter(r => !r.getIsDifferent());
  const newTests = testResults.filter(r => r.getIsNew());
  const newTestsSize = newTests.length;
  const warnForUnsavedNewTests = !!(!saveNewTests && newTestsSize);

  let errors = results.map(({title, resultsOrErr}) =>
    Array.isArray(resultsOrErr)
      ? resultsOrErr.map(err => ({err, title}))
      : [{err: resultsOrErr, title}],
  );
  errors = flatten(errors).filter(({err}) => err.constructor.name === 'Error');

  const hasResults = unresolved.length || passedOrNew.length;
  const seeDetailsStr =
    hasResults && `See details at ${(passedOrNew[0] || unresolved[0]).getAppUrls().getBatch()}`;

  if (hasResults) {
    outputStr += `${seeDetailsStr}\n\n`;
  }

  outputStr += '[EYES: TEST RESULTS]:\n\n';
  if (passedOrNew.length > 0) {
    outputStr += testResultsOutput(passedOrNew, warnForUnsavedNewTests);
  }
  if (unresolved.length > 0) {
    outputStr += testResultsOutput(unresolved, warnForUnsavedNewTests);
  }
  if (errors.length) {
    const sortedErrors = errors.sort((a, b) => a.title.localeCompare(b.title));
    outputStr += uniq(
      sortedErrors.map(
        ({title, err}) => `${title} - ${chalk.red('Failed')} ${err.message || err.toString()}`,
      ),
    ).join('\n');
    outputStr += '\n';
  }

  if (!errors.length && !hasResults) {
    outputStr += 'Test is finished but no results returned.\n';
  }

  if (errors.length && !unresolved.length) {
    outputStr += chalk.red(
      `\nA total of ${errors.length} stor${pluralize(errors, [
        'ies',
        'y',
      ])} failed for unexpected error${pluralize(errors)}.`,
    );
  } else if (unresolved.length && !errors.length) {
    outputStr += chalk.keyword('orange')(
      `\nA total of ${unresolved.length} difference${pluralize(unresolved, [
        's were',
        ' was',
      ])} found.`,
    );
  } else if (unresolved.length || errors.length) {
    outputStr += chalk.red(
      `\nA total of ${unresolved.length} difference${pluralize(unresolved, [
        's were',
        ' was',
      ])} found and ${errors.length} stor${pluralize(errors, [
        'ies',
        'y',
      ])} failed for ${pluralize(errors, ['', 'an '])}unexpected error${pluralize(errors)}.`,
    );
  } else if (warnForUnsavedNewTests) {
    const countText =
      newTestsSize > 1
        ? `are ${newTestsSize} new tests`
        : `is a new test: '${newTests[0].getName()}'`;
    outputStr += chalk.red(
      `\n'saveNewTests' was set to false and there ${countText}. Please approve ${pluralize(
        newTestsSize,
        ['their', 'its'],
      )} baseline${pluralize(newTestsSize)} in Eyes dashboard.\n`,
    );
  } else if (passedOrNew.length) {
    outputStr += chalk.green(`\nNo differences were found!`);
  }

  if (hasResults) {
    outputStr += `\n${seeDetailsStr}\nTotal time: ${Math.round(totalTime / 1000)} seconds\n`;
  }

  if (Number(testConcurrency) === 5) {
    // TODO require from core
    outputStr += `\n${concurrencyMsg}\n`;
  }

  passedOrNew.forEach(formatter.addTestResults.bind(formatter));
  unresolved.forEach(formatter.addTestResults.bind(formatter));
  errors.forEach(error => {
    formatter.addTestResults(
      new TestResultsError({
        name: error.title,
        error: error.err,
      }),
    );
  });
  const exitCode =
    !warnForUnsavedNewTests && passedOrNew.length && !errors.length && !unresolved.length ? 0 : 1;

  return {
    outputStr,
    formatter,
    exitCode,
  };
}

function testResultsOutput(results, warnForUnsavedNewTests) {
  let outputStr = '';
  const sortedTestResults = results.sort((a, b) => a.getName().localeCompare(b.getName()));
  sortedTestResults.forEach(result => {
    const storyTitle = `${result.getName()} [${result.getHostApp()}] [${result
      .getHostDisplaySize()
      .toString()}] - `;

    if (result.getIsNew()) {
      const newResColor = warnForUnsavedNewTests ? 'orange' : 'blue';
      outputStr += `${storyTitle}${chalk.keyword(newResColor)('New')}\n`;
    } else if (result.isPassed()) {
      outputStr += `${storyTitle}${chalk.green('Passed')}\n`;
    } else {
      outputStr += `${storyTitle}${chalk.keyword('orange')(`Unresolved`)}\n`;
    }
  });
  outputStr += '\n';
  return outputStr;
}

module.exports = processResults;
