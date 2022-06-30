import type {SpecDriver} from '@applitools/types'
import * as spec from './spec-driver'

export * from './spec-driver'

const typedSpec: SpecDriver<spec.Driver, spec.Context, spec.Element, spec.Selector> = spec
export default typedSpec
