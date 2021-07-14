module.exports = {
  extends: 'https://raw.githubusercontent.com/applitools/sdk.coverage.tests/master/js/config.js',
  env: {
    NO_SDK: true,
    SPEC_DRIVER_PATH: './test/utils/spec-driver.js',
    SETUP_EYES_PATH: './test/utils/setup-eyes.js',
  },
  overrides: [
    'https://raw.githubusercontent.com/applitools/sdk.coverage.tests/master/js/overrides.js',
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
    },
  ],
  emitOnly: test => {
    if (test.api === 'classic') return false
    return true
  },
}
