import * as utils from '@applitools/utils'
import EyesError from './EyesError'
import {TestResults, TestResultsData} from '../output/TestResults'

export default class TestFailedError extends EyesError {
  private _results: TestResults
  constructor(message: string, results?: TestResults)
  constructor(results: TestResults)
  constructor(message: string | TestResults, results?: TestResults) {
    if (!utils.types.isString(message)) {
      results = message
      message = `Test '${results.name}' of '${results.appName}' is failed! See details at ${results.url}`
    }
    super(message)
    if (results) this._results = results
  }

  get testResults(): TestResults {
    return this._results
  }
  getTestResults(): TestResultsData {
    return new TestResultsData(this._results)
  }
}
