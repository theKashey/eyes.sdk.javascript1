const {mochaGrep} = require('@applitools/test-utils')

const tags = ['chrome', 'chromium', 'firefox', 'webkit', 'safari']

module.exports = {
  spec: [
    './test/generic/*.spec.js',
    './node_modules/@applitools/sdk-shared/coverage-tests/custom/**/*.spec.js',
  ],
  parallel: true,
  jobs: process.env.MOCHA_JOBS || 15,
  timeout: 0,
  reporter: 'spec-xunit-file',
  grep: mochaGrep({tags}),
}
