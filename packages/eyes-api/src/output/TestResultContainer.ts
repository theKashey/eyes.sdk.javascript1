import * as utils from '@applitools/utils'
import {TestResults, TestResultsData} from './TestResults'

export type TestResultContainer = {
  readonly exception: Error
  readonly testResults: TestResults
}

export class TestResultContainerData implements Required<TestResultContainer> {
  private _container: TestResultContainer = {} as any

  /** @internal */
  constructor(container: TestResultContainer) {
    this._container = container instanceof TestResultContainerData ? container.toJSON() : container
  }

  get testResults(): TestResults {
    return this._container.testResults
  }
  getTestResults(): TestResultsData {
    return new TestResultsData(this.testResults)
  }

  get exception(): Error {
    return this._container.exception
  }
  getException(): Error {
    return this.exception
  }

  /** @internal */
  toObject(): TestResultContainer {
    return this._container
  }

  /** @internal */
  toJSON(): TestResultContainer {
    return utils.general.toJSON(this._container)
  }

  /** @internal */
  toString() {
    return `${this.testResults ? this.testResults : ''} - ${this.exception ? this.exception : ''}`
  }
}
