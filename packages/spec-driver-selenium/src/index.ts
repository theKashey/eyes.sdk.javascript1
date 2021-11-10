import type {SpecDriver} from '@applitools/types'
import * as spec from './spec-driver'

if (!process.env.APPLITOOLS_SELENIUM_MAJOR_VERSION) {
  try {
    const {version} = require('selenium-webdriver/package.json')
    const [major] = version.split('.', 1)
    process.env.APPLITOOLS_SELENIUM_MAJOR_VERSION = major
  } catch {
    // NOTE: ignore error
  }
}

export * from './spec-driver'

export default spec as SpecDriver<spec.Driver, spec.Driver, spec.Element, spec.Selector>
