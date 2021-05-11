import * as utils from '@applitools/utils'

export type RunnerOptions = {
  testConcurrency?: number
}

/** @deprecated */
export class RunnerOptionsFluent {
  private _options: RunnerOptions = {}

  testConcurrency(concurrency: number): this {
    utils.guard.isInteger(concurrency, {name: 'concurrency', gte: 1})
    this._options.testConcurrency = concurrency
    return this
  }

  /** @internal */
  toObject(): RunnerOptions {
    return this._options
  }

  /** @internal */
  toJSON(): RunnerOptions {
    return utils.general.toJSON(this._options)
  }

  /** @internal */
  toString(): string {
    return utils.general.toString(this)
  }
}

/** @deprecated */
export function RunnerOptionsFluentInit(): RunnerOptionsFluent {
  return new RunnerOptionsFluent()
}
