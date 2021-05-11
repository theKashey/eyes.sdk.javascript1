import * as utils from '@applitools/utils'

/** @undocumented */
export type ValidationInfo = {
  readonly validationId: number
  readonly tag: string
}

/** @undocumented */
export class ValidationInfoData implements Required<ValidationInfo> {
  private _info: ValidationInfo = {} as any

  /** @internal */
  constructor(info: ValidationInfo) {
    this._info = info instanceof ValidationInfoData ? info.toJSON() : info
  }

  get validationId(): number {
    return this._info.validationId
  }
  getValidationId(): number {
    return this.validationId
  }

  get tag(): string {
    return this._info.tag
  }
  getTag(): string {
    return this.tag
  }

  /** @internal */
  toObject(): ValidationInfo {
    return this._info
  }

  /** @internal */
  toJSON(): ValidationInfo {
    return utils.general.toJSON(this._info)
  }

  /** @internal */
  toString() {
    return utils.general.toString(this)
  }
}
