const {defineConfig} = require('cypress');

module.exports = defineConfig({
  chromeWebSecurity: true,
  video: false,
  screenshotOnRunFailure: false,
  defaultCommandTimeout: 86400000,
  eyesIsGlobalHooksSupported: false,
  eyesPort: 51664,
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      return require('./cypress/plugins/index.js')(on, config);
    },
    specPattern: '../generic/cypress/e2e/',
    supportFile: 'cypress/support/index.js',
  },
});
