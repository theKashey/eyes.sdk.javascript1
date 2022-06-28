const path = require('path');

module.exports = {
  appName: 'Cross-origin iframe storybook',
  batchName: 'Cross-origin iframe storybook',
  storybookConfigDir: path.resolve(__dirname, '../../fixtures/crossOriginIframeStorybook'),
  storybookStaticDir: path.resolve(__dirname, '../../fixtures'),
  browser: [{width: 810, height: 480, name: 'chrome'}],
  waitBeforeCapture: 1000,
};
