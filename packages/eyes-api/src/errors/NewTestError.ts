import * as utils from '@applitools/utils'
import TestFailedError from './TestFailedError'
import {TestResults} from '../output/TestResults'

export default class NewTestError extends TestFailedError {
  constructor(message: string, results?: TestResults)
  constructor(results: TestResults)
  constructor(message: string | TestResults, results?: TestResults) {
    if (!utils.types.isString(message)) {
      results = message
      message = `Test '${results.name}' of '${results.appName}' is new! Please approve the new baseline at ${results.url}`
    }
    super(message, results)
  }
}
