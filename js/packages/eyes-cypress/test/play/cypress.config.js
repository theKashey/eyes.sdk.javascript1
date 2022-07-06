const {defineConfig} = require('cypress');

module.exports = defineConfig({
  video: false,
  chromeWebSecurity: true,
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      return require('../fixtures/testApp/cypress/plugins/index-play.js')(on, config);
    },
    specPattern: '../fixtures/testApp/cypress/integration-play/',
    supportFile: 'support.js',
  },
});
