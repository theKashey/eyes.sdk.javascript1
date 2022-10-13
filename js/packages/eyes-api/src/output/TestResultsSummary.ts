import type * as core from '@applitools/core'
import {TestResultContainer, TestResultContainerData} from './TestResultContainer'

export type TestResultsSummary = Iterable<TestResultContainer>

export class TestResultsSummaryData implements Iterable<TestResultContainerData> {
  private _summary: core.TestResultSummary<'classic' | 'ufg'>
  private _deleteTest: core.Core<unknown, unknown, unknown>['deleteTest']

  /** @internal */
  constructor(options?: {
    summary: core.TestResultSummary<'classic' | 'ufg'>
    deleteTest: core.Core<unknown, unknown, unknown>['deleteTest']
  }) {
    if (!options) return

    const {summary, deleteTest} = options

    this._summary = summary
    this._deleteTest = deleteTest
  }

  getAllResults(): TestResultContainerData[] {
    return (
      this._summary?.results.map(container => {
        return new TestResultContainerData({container, deleteTest: this._deleteTest})
      }) ?? []
    )
  }

  [Symbol.iterator](): Iterator<TestResultContainerData> {
    return (
      this._summary?.results
        .map(container => {
          return new TestResultContainerData({container, deleteTest: this._deleteTest})
        })
        [Symbol.iterator]() ?? [][Symbol.iterator]()
    )
  }

  /** @internal */
  toJSON(): core.TestResultContainer<'classic' | 'ufg'>[] {
    return this._summary?.results
  }

  /** @internal */
  toString() {
    return (
      'result summary {' +
      '\n\tpassed=' +
      this._summary.passed +
      '\n\tunresolved=' +
      this._summary.unresolved +
      '\n\tfailed=' +
      this._summary.failed +
      '\n\texceptions=' +
      this._summary.exceptions +
      '\n\tmismatches=' +
      this._summary.mismatches +
      '\n\tmissing=' +
      this._summary.missing +
      '\n\tmatches=' +
      this._summary.matches +
      '\n}'
    )
  }
}
