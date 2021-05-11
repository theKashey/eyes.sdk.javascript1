import * as utils from '@applitools/utils'

export type Location = {
  x: number
  y: number
}

export class LocationData implements Required<Location> {
  private _location: Location

  constructor(location: Location)
  constructor(x: number, y: number)
  constructor(locationOrX: Location | number, y?: number) {
    if (utils.types.isNumber(locationOrX)) {
      return new LocationData({x: locationOrX, y})
    }
    this._location = {} as any
    this.x = locationOrX.x
    this.y = locationOrX.y
  }

  get x(): number {
    return this._location.x
  }
  set x(x: number) {
    utils.guard.isNumber(x, {name: 'x'})
    this._location.x = x
  }
  getX(): number {
    return this.x
  }
  setX(x: number) {
    this.x = x
  }

  get y(): number {
    return this._location.y
  }
  set y(y: number) {
    utils.guard.isNumber(y, {name: 'y'})
    this._location.y = y
  }
  getY(): number {
    return this.y
  }
  setY(y: number) {
    this.y = y
  }

  /** @internal */
  toObject(): Location {
    return this._location
  }

  /** @internal */
  toJSON(): Location {
    return utils.general.toJSON(this._location)
  }

  /** @internal */
  toString() {
    return utils.general.toString(this)
  }
}
