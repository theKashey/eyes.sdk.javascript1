import * as utils from '@applitools/utils'
import {EyesError} from './EyesError'
import {TestResults, TestResultsData} from '../output/TestResults'

export class TestFailedError extends EyesError {
  private _result: TestResults
  constructor(message: string, results?: TestResults)
  constructor(results: TestResults)
  constructor(message: string | TestResults, results?: TestResults) {
    if (!utils.types.isString(message)) {
      results = message
      message = `Test '${results.name}' of '${results.appName}' is failed! See details at ${results.url}`
    }
    super(message)
    if (results) this._result = results
  }

  get testResults(): TestResults {
    return this._result
  }
  getTestResults(): TestResultsData {
    return new TestResultsData({result: this._result})
  }
}
