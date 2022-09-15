import type {Driver, Element, Selector} from '@applitools/spec-driver-selenium'
import spec from '@applitools/spec-driver-selenium'
import * as api from '@applitools/eyes-api'
import {UniversalClient} from '../shared/universal-client'
import type {TransformFunc} from '../shared/universal-client'
import {transformData} from '../shared/transform-data'
import {transformer} from './transformer'

class UniversalClientSelenium extends UniversalClient<Driver, Element, Selector> {
  _transform: TransformFunc = data => transformData({data, spec, transformer})
}

const universalClient = new UniversalClientSelenium()

export * from '@applitools/eyes-api'

export class Eyes extends api.Eyes<Driver, Element, Selector> {
  protected static readonly _spec = universalClient
  static setViewportSize: (driver: Driver, viewportSize: api.RectangleSize) => Promise<void>
}

export type ConfigurationPlain = api.ConfigurationPlain<Element, Selector>

export class Configuration extends api.Configuration<Element, Selector> {
  protected static readonly _spec = universalClient
}

export type OCRRegion = api.OCRRegion<Element, Selector>

export type CheckSettingsPlain = api.CheckSettingsPlain<Element, Selector>

export class CheckSettings extends api.CheckSettings<Element, Selector> {
  protected static readonly _spec = universalClient
}

export const Target: api.Target<Element, Selector> = CheckSettings as any

export class BatchClose extends api.BatchClose {
  protected static readonly _spec = universalClient
}
