const {mochaGrep} = require('@applitools/test-utils')

const tags = {
  wd: [
    'headfull',
    'webdriver',
    'mobile',
    'native',
    'native-selectors',
    'cached-selectors',
    'chrome',
    'firefox',
    'ie',
    'edge',
    'safari',
    'all-cookies'
  ],
  cdp: ['chrome', 'all-cookies', 'cached-selectors']
}
if (Number(process.env.APPLITOOLS_WEBDRIVERIO_MAJOR_VERSION) < 7) tags.wd.push('jsonwire')

const protocol = process.env.APPLITOOLS_WEBDRIVERIO_PROTOCOL in tags ? process.env.APPLITOOLS_WEBDRIVERIO_PROTOCOL : 'wd'


module.exports = {
  spec: [
    './test/generic/*.spec.js',
    './node_modules/@applitools/sdk-shared/coverage-tests/custom/**/*.spec.js',
  ],
  parallel: true,
  jobs: process.env.MOCHA_JOBS || 15,
  timeout: 0,
  reporter: 'spec-xunit-file',
  require: ['@applitools/test-utils/mocha-hooks/docker.js'],
  grep: mochaGrep({tags: tags[protocol]}),
}
