module.exports = {
  extends: 'https://raw.githubusercontent.com/applitools/sdk.coverage.tests/universal-sdk/js/config.js',
  env: {
    NO_DRIVER: true,
  },
  emitOnly: test => {
    return test.features && test.features.includes('image')
  },
}
