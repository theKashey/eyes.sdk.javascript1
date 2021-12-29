const {mochaGrep} = require('@applitools/test-utils')

const tags = [
  'headfull',
  'jsonwire',
  'webdriver',
  'mobile',
  'chrome',
  'firefox',
  'ie',
  'edge',
  'safari',
  'all-cookies'
]

module.exports = {
  spec: [
    './test/generic/*.spec.js',
    './node_modules/@applitools/sdk-shared/coverage-tests/custom/**/*.spec.js',
  ],
  parallel: true,
  jobs: 15,
  timeout: 0,
  reporter: 'spec-xunit-file',
  require: ['@applitools/test-utils/mocha-hooks/docker.js'],
  grep: mochaGrep({tags}),
}
