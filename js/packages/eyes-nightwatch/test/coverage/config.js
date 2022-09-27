module.exports = {
  extends: 'https://raw.githubusercontent.com/applitools/sdk.coverage.tests/universal-sdk/js/config.js',
  overrides: [
    'https://raw.githubusercontent.com/applitools/sdk.coverage.tests/universal-sdk/js/js-overrides.js',
    'https://raw.githubusercontent.com/applitools/sdk.coverage.tests/universal-sdk/js/overrides.js',
    {
      'check region by selector on ie': {skip: true},
      'should send dom on ie': {skip: true},
      'check region by selector in frame fully on firefox legacy': {skip: true},
    },
  ],
}
