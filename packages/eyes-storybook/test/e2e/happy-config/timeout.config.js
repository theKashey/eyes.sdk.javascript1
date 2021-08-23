const path = require('path');

module.exports = {
  appName: 'storybook server timeout',
  batchName: 'storybook server timeout',
  storybookConfigDir: path.resolve(__dirname, '../../fixtures/singleStorybook'),
  storybookStaticDir: path.resolve(__dirname, '../../fixtures'),
  startStorybookServerTimeout: 2,
  browser: [{width: 640, height: 480, name: 'chrome'}],
};
