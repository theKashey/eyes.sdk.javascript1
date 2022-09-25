import type {TestResult} from '@applitools/types/base'
import {CoreError} from '@applitools/core-base'

export class TestError extends CoreError {
  constructor(result: TestResult) {
    if (result.status === 'Failed') {
      super(`Test '${result.name}' of '${result.appName}' is failed! See details at ${result.url}`, {
        reason: 'test failed',
        result,
      })
    } else if (result.status === 'Unresolved') {
      if (result.isNew) {
        super(`Test '${result.name}' of '${result.appName}' is new! Please approve the new baseline at ${result.url}`, {
          reason: 'test new',
          result,
        })
      } else {
        super(`Test '${result.name}' of '${result.appName}' detected differences! See details at: ${result.url}`, {
          reason: 'test different',
          result,
        })
      }
    } else {
      super('')
    }
  }
}
