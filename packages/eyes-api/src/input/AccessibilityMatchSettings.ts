import * as utils from '@applitools/utils'
import AccessibilityRegionType from '../enums/AccessibilityRegionType'
import {Region, RegionData} from './Region'

export type AccessibilityMatchSettings = {
  region: Region
  type?: AccessibilityRegionType
}

export class AccessibilityMatchSettingsData implements Required<AccessibilityMatchSettings> {
  private _settings: AccessibilityMatchSettings = {} as any

  constructor(settings: AccessibilityMatchSettings)
  constructor(x: number, y: number, width: number, height: number, type?: AccessibilityRegionType)
  constructor(
    settingsOrX: AccessibilityMatchSettings | number,
    y?: number,
    width?: number,
    height?: number,
    type?: AccessibilityRegionType,
  ) {
    if (utils.types.isNumber(settingsOrX)) {
      return new AccessibilityMatchSettingsData({region: {x: settingsOrX, y, width, height}, type})
    }
    this.region = settingsOrX.region
    this.type = settingsOrX.type
  }

  get region(): Region {
    return this._settings.region
  }
  set region(region: Region) {
    utils.guard.isObject(region, {name: 'region'})
    this._settings.region = region
  }
  getRegion(): RegionData {
    return new RegionData(this._settings.region)
  }
  setRegion(region: Region) {
    this.region = region
  }
  getLeft(): number {
    return this.region.x
  }
  setLeft(left: number) {
    this.region.x = left
  }
  getTop(): number {
    return this.region.y
  }
  setTop(top: number) {
    this.region.y = top
  }
  getWidth(): number {
    return this.region.width
  }
  setWidth(width: number) {
    this.region.width = width
  }
  getHeight(): number {
    return this.region.height
  }
  setHeight(height: number) {
    this.region.height = height
  }

  get type(): AccessibilityRegionType {
    return this._settings.type
  }
  set type(type: AccessibilityRegionType) {
    utils.guard.isEnumValue(type, AccessibilityRegionType, {name: 'type', strict: false})
    this._settings.type = type
  }
  getType(): AccessibilityRegionType {
    return this.type
  }
  setType(type: AccessibilityRegionType) {
    this.type = type
  }

  /** @internal */
  toObject(): AccessibilityMatchSettings {
    return this._settings
  }

  /** @internal */
  toJSON(): AccessibilityMatchSettings {
    return utils.general.toJSON(this._settings)
  }

  /** @internal */
  toString(): string {
    return utils.general.toString(this)
  }
}
