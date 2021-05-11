import * as utils from '@applitools/utils'
import TestFailedError from './TestFailedError'
import {TestResults} from '../output/TestResults'

export default class DiffsFoundError extends TestFailedError {
  constructor(message: string, results?: TestResults)
  constructor(results: TestResults)
  constructor(message: string | TestResults, results?: TestResults) {
    if (!utils.types.isString(message)) {
      results = message
      message = `Test '${results.name}' of '${results.appName}' detected differences! See details at: ${results.url}`
    }
    super(message, results)
  }
}
