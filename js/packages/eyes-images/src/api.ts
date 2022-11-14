import {makeCore} from '@applitools/core'
import * as api from '@applitools/eyes-api'

const core = makeCore({
  agentId: `eyes.images.javascript/${require('../package.json').version}`,
})

export * from '@applitools/eyes-api'

export class Eyes extends api.Eyes<never, never, never> {
  protected static readonly _spec = core
}

export type ConfigurationPlain = api.ConfigurationPlain<never, never>

export class Configuration extends api.Configuration<never, never> {}

export type OCRRegion = api.OCRRegion<never, never>

export const CheckSettings = api.CheckSettingsImage

export const Target: api.TargetImage = api.CheckSettingsImage as any

export class BatchClose extends api.BatchClose {
  protected static readonly _spec = core
}

export const closeBatch = api.closeBatch(core)
