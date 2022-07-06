const {defineConfig} = require('cypress');

module.exports = defineConfig({
  video: false,
  chromeWebSecurity: true,
  e2e: {
    setupNodeEvents(on, config) {
      return require('./cypress/plugins/index-run.js')(on, config);
    },
    specPattern: './cypress/integration-run',
    supportFile: './cypress/support/e2e.js',
  },
});
