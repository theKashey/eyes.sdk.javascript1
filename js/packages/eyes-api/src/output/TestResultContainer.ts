import * as utils from '@applitools/utils'
import type * as types from '@applitools/types'
import {TestResults, TestResultsData, DeleteTestFunc} from './TestResults'

export type TestResultContainer = types.TestResultContainer

export class TestResultContainerData implements Required<types.TestResultContainer> {
  private _container: types.TestResultContainer = {} as any
  private _deleteTest: DeleteTestFunc

  /** @internal */
  constructor(container: types.TestResultContainer, deleteTest: DeleteTestFunc) {
    this._container = container instanceof TestResultContainerData ? container.toJSON() : container
    this._deleteTest = deleteTest
  }

  get testResults(): TestResults {
    return this._container.testResults
  }
  getTestResults(): TestResultsData {
    return new TestResultsData(this.testResults, this._deleteTest)
  }

  get exception(): Error {
    return this._container.exception
  }
  getException(): Error {
    return this.exception
  }

  get browserInfo(): types.BrowserInfoRenderer {
    return this._container.browserInfo
  }

  getBrowserInfo(): types.BrowserInfoRenderer {
    return this.browserInfo
  }

  /** @internal */
  toObject(): types.TestResultContainer {
    return this._container
  }

  /** @internal */
  toJSON(): types.TestResultContainer {
    return utils.general.toJSON(this._container)
  }

  /** @internal */
  toString() {
    return `${this.testResults ? this.testResults : ''} - ${this.exception ? this.exception : ''}`
  }
}
