const EyesService = require('../../dist/service')
const {parseEnv} = require('@applitools/test-utils')

exports.config = {
  runner: 'local',
  capabilities: [parseEnv({browser: 'chrome'}).capabilities],
  logLevel: 'error',
  services: [[EyesService]],
  port: 4444,
  path: '/wd/hub',
  framework: 'mocha',
  reporters: ['dot'],
  mochaOpts: {
    ui: 'bdd',
    timeout: 120000,
  },
}
