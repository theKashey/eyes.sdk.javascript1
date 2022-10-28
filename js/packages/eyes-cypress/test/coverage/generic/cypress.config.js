const {defineConfig} = require('cypress');

module.exports = defineConfig({
  chromeWebSecurity: true,
  video: false,
  screenshotOnRunFailure: false,
  defaultCommandTimeout: 86400000,
  eyesIsGlobalHooksSupported: false,
  eyesPort: 51664,
  e2e: {
    setupNodeEvents(on, config) {
    },
    specPattern: '../generic/cypress/e2e/',
  },
});
require('../../../')(module)