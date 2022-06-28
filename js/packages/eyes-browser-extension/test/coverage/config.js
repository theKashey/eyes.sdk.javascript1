const path = require('path')

module.exports = {
  extends: 'https://raw.githubusercontent.com/applitools/sdk.coverage.tests/universal-sdk/js/config.js',
  env: {
    NO_SDK: true,
    SPEC_DRIVER: path.resolve('./test/utils/spec-driver.js'),
    SETUP_EYES: path.resolve('./test/utils/setup-eyes.js'),
  },
  overrides: [
    'https://raw.githubusercontent.com/applitools/sdk.coverage.tests/universal-sdk/js/overrides.js',
    test => {
      if (!test.vg) return {config: {branchName: 'onscreen'}}
    },
    {
      // not possible because of browser api
      'should not fail if scroll root is stale': {skipEmit: true},
      'should return test results from close with failed classic test': {skipEmit: true}, // no data classes
      'should return test results from close with failed vg test': {skipEmit: true}, // no data classes
      'should return test results from close with passed classic test': {skipEmit: true}, // no data classes
      'should return test results from close with passed vg test': {skipEmit: true}, // no data classes
      // not possible because of core api
      'should throw if no checkpoints before close': {skipEmit: true},
      'should return actual viewport size': {skipEmit: true}, // no data classes
      'should not check if disabled': {skipEmit: true},
      // not possible due to onscreen mode
      'check window with layout breakpoints': {skipEmit: true},
      'check window with layout breakpoints in config': {skipEmit: true},
    },
  ],
  emitOnly: test => {
    if (test.api === 'classic') return false
    return true
  },
}
