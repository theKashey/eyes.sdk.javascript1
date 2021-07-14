const {mochaGrep} = require('@applitools/test-utils')

const tags = [
  'headfull',
  'chrome',
]

module.exports = {
  spec: [
    './test/generic/*.spec.js',
    // './node_modules/@applitools/sdk-shared/coverage-tests/custom/**/*.spec.js',
  ],
  parallel: true,
  jobs: 15,
  timeout: 0,
  reporter: 'spec-xunit-file',
  grep: mochaGrep({tags}),
}
