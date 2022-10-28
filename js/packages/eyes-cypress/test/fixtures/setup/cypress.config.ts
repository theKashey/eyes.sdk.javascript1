import { defineConfig } from 'cypress'

export default defineConfig({
video: false,
failOnStatusCode: false,
eyesIsDisabled: false,
eyesFailCypressOnDiff: true,
eyesDisableBrowserFetching: false,
eyesLegacyHooks: true,
eyesTestConcurrency: 5,
eyesPort: 56123,
  e2e: {
    setupNodeEvents(on, config) {},
  },
  supportFile: 'cypress/support/index-bla-commands.js',
});
