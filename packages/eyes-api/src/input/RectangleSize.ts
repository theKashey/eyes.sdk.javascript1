import * as utils from '@applitools/utils'

export type RectangleSize = {
  width: number
  height: number
}

export class RectangleSizeData implements Required<RectangleSize> {
  private _size: RectangleSize = {} as any

  constructor(size: RectangleSize)
  constructor(width: number, height: number)
  constructor(sizeOrWidth: RectangleSize | number, height?: number) {
    if (utils.types.isNumber(sizeOrWidth)) {
      return new RectangleSizeData({width: sizeOrWidth, height})
    }
    this.width = sizeOrWidth.width
    this.height = sizeOrWidth.height
  }

  get width(): number {
    return this._size.width
  }
  set width(width: number) {
    utils.guard.isNumber(width, {name: 'width', gte: 0})
    this._size.width = width
  }
  getWidth(): number {
    return this.width
  }
  setWidth(width: number) {
    this.width = width
  }

  get height(): number {
    return this._size.height
  }
  set height(height: number) {
    utils.guard.isNumber(height, {name: 'height', gte: 0})
    this._size.height = height
  }
  getHeight(): number {
    return this.height
  }
  setHeight(height: number) {
    this.height = height
  }

  /** @internal */
  toObject(): RectangleSize {
    return this._size
  }

  /** @internal */
  toJSON(): RectangleSize {
    return utils.general.toJSON(this._size)
  }

  /** @internal */
  toString() {
    return utils.general.toString(this)
  }
}
