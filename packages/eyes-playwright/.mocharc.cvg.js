const tags = ['chrome', 'chromium', 'firefox', 'webkit', 'safari']
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
  grep: new RegExp(`^${grep ? `.*?${grep}.*?` : '[^(]*?'}(\\((?:@(${tags.join('|')}) ?)+\\))?$`, 'i'),
}
