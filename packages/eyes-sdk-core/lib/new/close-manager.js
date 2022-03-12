const DiffsFoundError = require('../errors/DiffsFoundError')
const NewTestError = require('../errors/NewTestError')
const TestFailedError = require('../errors/TestFailedError')
const TestResultsStatuses = require('../TestResultsStatus')

function makeCloseManager({runner}) {
  return async function closeManager({throwErr = false} = {}) {
    const testResultContainers = await runner.getAllTestResults()

    const summary = {
      results: testResultContainers,
      passed: 0,
      unresolved: 0,
      failed: 0,
      exceptions: 0,
      mismatches: 0,
      missing: 0,
      matches: 0,
    }

    for (const {testResults, exception} of testResultContainers) {
      if (throwErr) {
        if (exception) throw exception

        if (testResults.status === TestResultsStatuses.Unresolved) {
          if (testResults.isNew) throw new NewTestError(testResults)
          else throw new DiffsFoundError(testResults)
        } else if (testResults.status === TestResultsStatuses.Failed) {
          throw new TestFailedError(testResults)
        }
      }

      if (exception) summary.exceptions += 1

      if (testResults) {
        if (testResults.status === TestResultsStatuses.Failed) summary.failed += 1
        else if (testResults.status === TestResultsStatuses.Passed) summary.passed += 1
        else if (testResults.status === TestResultsStatuses.Unresolved) summary.unresolved += 1

        summary.matches += testResults.matches
        summary.missing += testResults.missing
        summary.mismatches += testResults.mismatches
      }
    }

    return summary
  }
}

module.exports = makeCloseManager
