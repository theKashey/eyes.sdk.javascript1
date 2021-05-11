import * as utils from '@applitools/utils'
import {RunnerOptions, RunnerOptionsFluent} from './input/RunnerOptions'
import {TestResultsSummaryData} from './output/TestResultsSummary'
import type {Eyes} from './Eyes'

export type RunnerConfiguration<TType extends 'vg' | 'classic' = 'vg' | 'classic'> = {
  type: TType
  concurrency?: TType extends 'vg' ? number : never
  legacy?: TType extends 'vg' ? boolean : never
}

export abstract class EyesRunner {
  private _make: (config: RunnerConfiguration) => (...args: any[]) => unknown
  private _controller: any
  private _eyes: Eyes[] = []

  /** @internal */
  abstract get config(): RunnerConfiguration

  /** @internal */
  attach(eyes: Eyes, init: (...args: any) => any) {
    this._eyes.push(eyes)
    this._make = this._make || init
  }

  /** @internal */
  async open(...args: any[]): Promise<any> {
    if (!this._controller) this._controller = this._make(this.config)

    return this._controller.open(...args)
  }

  async getAllTestResults(throwErr = false): Promise<TestResultsSummaryData> {
    const results = await this._controller.getResults()
    if (throwErr) {
      for (const result of results) {
        if (result.exception) throw result.exception
      }
    }
    return new TestResultsSummaryData(results)
  }
}

export class VisualGridRunner extends EyesRunner {
  private _testConcurrency: number
  private _legacyConcurrency: number

  constructor(options: RunnerOptions)
  /** @deprecated */
  constructor(options: RunnerOptionsFluent)
  /** @deprecated */
  constructor(legacyConcurrency: number)
  constructor(optionsOrLegacyConcurrency: RunnerOptions | RunnerOptionsFluent | number) {
    super()
    if (utils.types.isNumber(optionsOrLegacyConcurrency)) {
      this._legacyConcurrency = optionsOrLegacyConcurrency
    } else {
      const options =
        optionsOrLegacyConcurrency instanceof RunnerOptionsFluent
          ? optionsOrLegacyConcurrency.toJSON()
          : optionsOrLegacyConcurrency
      this._testConcurrency = options.testConcurrency
    }
  }

  /** @internal */
  get config(): RunnerConfiguration<'vg'> {
    return {
      type: 'vg',
      concurrency: this._testConcurrency || this._legacyConcurrency,
      legacy: Boolean(this._legacyConcurrency),
    }
  }

  get testConcurrency() {
    return this._testConcurrency
  }

  /** @deprecated */
  get legacyConcurrency() {
    return this._legacyConcurrency
  }

  /** @deprecated */
  getConcurrentSessions() {
    return this._legacyConcurrency
  }
}

export class ClassicRunner extends EyesRunner {
  /** @internal */
  get config(): RunnerConfiguration<'classic'> {
    return {type: 'classic'}
  }
}
