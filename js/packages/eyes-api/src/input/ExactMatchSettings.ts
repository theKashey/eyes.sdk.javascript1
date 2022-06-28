import * as utils from '@applitools/utils'

/** @undocumented */
export type ExactMatchSettings = {
  minDiffIntensity: number
  minDiffWidth: number
  minDiffHeight: number
  matchThreshold: number
}

/** @undocumented */
export class ExactMatchSettingsData implements Required<ExactMatchSettings> {
  private _settings: ExactMatchSettings = {} as any

  constructor(settings: ExactMatchSettings) {
    this.minDiffIntensity = settings.minDiffIntensity
    this.minDiffWidth = settings.minDiffWidth
    this.minDiffHeight = settings.minDiffHeight
    this.matchThreshold = settings.matchThreshold
  }

  get minDiffIntensity(): number {
    return this._settings.minDiffIntensity
  }
  set minDiffIntensity(minDiffIntensity: number) {
    utils.guard.isNumber(minDiffIntensity, {name: 'minDiffIntensity', strict: false})
    this._settings.minDiffIntensity = minDiffIntensity
  }
  getMinDiffIntensity(): number {
    return this.minDiffIntensity
  }
  setMinDiffIntensity(value: number) {
    this.minDiffIntensity = value
  }

  get minDiffWidth(): number {
    return this._settings.minDiffWidth
  }
  set minDiffWidth(minDiffWidth: number) {
    utils.guard.isNumber(minDiffWidth, {name: 'minDiffWidth', strict: false})
    this._settings.minDiffWidth = minDiffWidth
  }
  getMinDiffWidth() {
    return this.minDiffWidth
  }
  setMinDiffWidth(value: number) {
    this.minDiffWidth = value
  }

  get minDiffHeight(): number {
    return this._settings.minDiffHeight
  }
  set minDiffHeight(minDiffHeight: number) {
    utils.guard.isNumber(minDiffHeight, {name: 'minDiffHeight', strict: false})
    this._settings.minDiffHeight = minDiffHeight
  }
  getMinDiffHeight() {
    return this.minDiffHeight
  }
  setMinDiffHeight(value: number) {
    this.minDiffHeight = value
  }

  get matchThreshold(): number {
    return this._settings.matchThreshold
  }
  set matchThreshold(matchThreshold: number) {
    utils.guard.isNumber(matchThreshold, {name: 'matchThreshold', strict: false})
    this._settings.matchThreshold = matchThreshold
  }
  getMatchThreshold() {
    return this.matchThreshold
  }
  setMatchThreshold(value: number) {
    this.matchThreshold = value
  }

  /** @internal */
  toObject(): ExactMatchSettings {
    return this._settings
  }

  /** @internal */
  toJSON(): ExactMatchSettings {
    return utils.general.toJSON(this._settings)
  }

  /** @internal */
  toString(): string {
    return utils.general.toString(this)
  }
}
