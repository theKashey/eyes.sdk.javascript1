module.exports = {
  extends: 'https://raw.githubusercontent.com/applitools/sdk.coverage.tests/universal-sdk/js/config.js',
  template: './test/coverage/template.hbs',
  overrides: [
    'https://raw.githubusercontent.com/applitools/sdk.coverage.tests/universal-sdk/js/overrides.js',
    {
      'check region by selector with vg classic': {},
      'check frame after manual switch to frame with vg classic': {},
      // 'check region by selector within shadow dom with vg': {skipEmit: true},
      'check region by element within shadow dom with vg': {skipEmit: true},
    },
  ],
}
