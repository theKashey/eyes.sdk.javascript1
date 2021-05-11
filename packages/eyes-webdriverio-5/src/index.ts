if (!process.env.APPLITOOLS_WEBDRIVERIO_MAJOR_VERSION) {
  try {
    const {version} = require('webdriverio/package.json')
    const [major] = version.split('.', 1)
    process.env.APPLITOOLS_WEBDRIVERIO_MAJOR_VERSION = major
  } catch {
    // NOTE: ignore error
  }
}

export * from './api'
