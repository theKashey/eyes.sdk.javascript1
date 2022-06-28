const path = require('path')
const {mochaHooks} = require('@applitools/test-utils/mocha-hooks/docker.js')
const {EyesService} = require('../index')

exports.config = {
  runner: 'local',
  specs: [path.join(__dirname, '*.spec.js')],
  capabilities: [
    {
      browserName: 'chrome',
      'goog:chromeOptions': {
        args: ['headless'],
      },
    },
  ],
  logLevel: 'error',
  services: [[EyesService]],
  port: 4444,
  path: '/wd/hub',
  framework: 'mocha',
  reporters: ['dot'],
  mochaOpts: {
    ui: 'bdd',
    timeout: 120000,
    require: [],
  },
  onPrepare: () => mochaHooks.beforeAll(),
}
