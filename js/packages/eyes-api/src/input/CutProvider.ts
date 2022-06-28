import * as utils from '@applitools/utils'

type CutProviderRect = {
  top: number
  right: number
  bottom: number
  left: number
}

type CutProviderRegion = {
  x: number
  y: number
  width: number
  height: number
}

export type CutProvider = CutProviderRect | CutProviderRegion

export class CutProviderData implements Required<CutProviderRegion & CutProviderRect> {
  private _region: CutProviderRegion
  private _rect: CutProviderRect

  constructor(rectOrRegion: CutProvider)
  constructor(top: number, bottom: number, left: number, right: number)
  constructor(rectOrRegionOrTop: CutProvider | number, bottom?: number, left?: number, right?: number) {
    if (utils.types.isNumber(rectOrRegionOrTop)) {
      return new CutProviderData({top: rectOrRegionOrTop, bottom, left, right})
    }

    if (utils.types.has(rectOrRegionOrTop, ['top', 'right', 'bottom', 'left'])) {
      this._rect = rectOrRegionOrTop
    } else if (utils.types.has(rectOrRegionOrTop, ['width', 'height', 'x', 'y'])) {
      this._region = rectOrRegionOrTop
    }
  }

  get top() {
    return this._rect.top
  }
  get right() {
    return this._rect.right
  }
  get bottom() {
    return this._rect.bottom
  }
  get left() {
    return this._rect.left
  }

  get width() {
    return this._region.width
  }
  get height() {
    return this._region.height
  }
  get x() {
    return this._region.x
  }
  get y() {
    return this._region.y
  }

  scale(scaleRatio: number): CutProviderData {
    if (this._rect) {
      return new CutProviderData({
        top: this._rect.top * scaleRatio,
        right: this._rect.right * scaleRatio,
        bottom: this._rect.bottom * scaleRatio,
        left: this._rect.left * scaleRatio,
      })
    } else if (this._region) {
      return new CutProviderData({
        width: this._region.width * scaleRatio,
        height: this._region.height * scaleRatio,
        x: this._region.x * scaleRatio,
        y: this._region.y * scaleRatio,
      })
    } else {
      return new CutProviderData({top: 0, right: 0, bottom: 0, left: 0})
    }
  }

  /** @internal */
  toObject(): CutProvider {
    return this._region ? this._region : this._rect
  }

  /** @internal */
  toJSON(): CutProvider {
    return utils.general.toJSON(this._region ? this._region : this._rect) as CutProvider
  }

  /** @internal */
  toString(): string {
    return utils.general.toString(this)
  }
}

export class FixedCutProviderData extends CutProviderData {}

/** @undocumented */
export class UnscaledFixedCutProviderData extends CutProviderData {
  scale() {
    return new UnscaledFixedCutProviderData(this)
  }
}

export class NullCutProviderData extends CutProviderData {
  constructor() {
    super({top: 0, right: 0, bottom: 0, left: 0})
  }
}
