import type {SpecDriver} from '@applitools/types'
import * as spec from './spec-driver'

export * from './spec-driver'

export default spec as SpecDriver<spec.Driver, spec.Context, spec.Element, spec.Selector>
