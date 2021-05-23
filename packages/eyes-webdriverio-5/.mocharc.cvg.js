const tags = {
  wd: [
    'headfull',
    'webdriver',
    'mobile',
    'native',
    'native-selectors',
    'chrome',
    'firefox',
    'ie',
    'edge',
    'safari',
  ],
  cdp: ['chrome']
}
const protocol = process.env.APPLITOOLS_WEBDRIVERIO_PROTOCOL in tags ? process.env.APPLITOOLS_WEBDRIVERIO_PROTOCOL : 'wd'
const grep = process.env.MOCHA_GREP

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
  grep: new RegExp(`^${grep ? `.*?${grep}.*?` : '[^(]*?'}(\\((?:@(${tags[protocol].join('|')}) ?)+\\))?$`, 'i'),
}
