export * from './api'

if (!process.env.APPLITOOLS_NIGHTWATCH_MAJOR_VERSION) {
  try {
    const {version} = require('nightwatch/package.json')
    const [major] = version.split('.', 1)
    process.env.APPLITOOLS_NIGHTWATCH_MAJOR_VERSION = major
  } catch {
    // NOTE: ignore error
  }
}
