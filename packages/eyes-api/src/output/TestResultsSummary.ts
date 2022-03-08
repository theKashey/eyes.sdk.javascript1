import * as utils from '@applitools/utils'
import type * as types from '@applitools/types'
import {TestResultContainerData} from './TestResultContainer'
import {DeleteTestFunc} from './TestResults'

export type TestResultsSummary = types.TestResultSummary

export class TestResultsSummaryData implements Iterable<types.TestResultContainer> {
  private _results: TestResultContainerData[] = []
  private _passed = 0
  private _unresolved = 0
  private _failed = 0
  private _exceptions = 0
  private _mismatches = 0
  private _missing = 0
  private _matches = 0

  /** @internal */
  constructor(options?: {summary: types.TestResultSummary; deleteTest: DeleteTestFunc}) {
    if (!options) return

    const {summary, deleteTest} = options

    this._results = summary.results.map(container => new TestResultContainerData(container, deleteTest))
    this._passed = summary.passed
    this._unresolved = summary.unresolved
    this._failed = summary.failed
    this._exceptions = summary.exceptions
    this._mismatches = summary.mismatches
    this._missing = summary.missing
    this._matches = summary.matches
  }

  getAllResults(): TestResultContainerData[] {
    return this._results
  }

  [Symbol.iterator](): Iterator<TestResultContainerData> {
    return this._results[Symbol.iterator]()
  }

  /** @internal */
  toJSON(): Array<types.TestResultContainer> {
    return this._results.map(container => utils.general.toJSON(container))
  }

  /** @internal */
  toString() {
    return (
      'result summary {' +
      '\n\tpassed=' +
      this._passed +
      '\n\tunresolved=' +
      this._unresolved +
      '\n\tfailed=' +
      this._failed +
      '\n\texceptions=' +
      this._exceptions +
      '\n\tmismatches=' +
      this._mismatches +
      '\n\tmissing=' +
      this._missing +
      '\n\tmatches=' +
      this._matches +
      '\n}'
    )
  }
}
