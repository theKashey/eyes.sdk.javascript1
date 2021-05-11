import * as utils from '@applitools/utils'

/** @undocumented */
export type ValidationResult = {
  readonly asExpected: boolean
}

/** @undocumented */
export class ValidationResultData implements Required<ValidationResult> {
  private _result: ValidationResult

  /** @internal */
  constructor(result: ValidationResult) {
    this._result = result instanceof ValidationResultData ? result.toJSON() : result
  }

  get asExpected(): boolean {
    return this._result.asExpected
  }
  getAsExpected() {
    return this.asExpected
  }

  /** @internal */
  toObject(): ValidationResult {
    return this._result
  }

  /** @internal */
  toJSON(): ValidationResult {
    return utils.general.toJSON(this._result)
  }

  /** @internal */
  toString() {
    return utils.general.toString(this)
  }
}
