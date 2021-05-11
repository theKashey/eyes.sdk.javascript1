if (!process.env.APPLITOOLS_SELENIUM_MAJOR_VERSION) {
  const {version} = require('selenium-webdriver/package.json')
  const [major] = version.split('.', 1)
  process.env.APPLITOOLS_SELENIUM_MAJOR_VERSION = major
}

export * from './api'
