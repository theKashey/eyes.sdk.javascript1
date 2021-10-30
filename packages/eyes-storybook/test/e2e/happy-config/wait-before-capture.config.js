const path = require('path');

module.exports = {
  appName: 'Wait before capture',
  batchName: 'Wait before capture',
  storybookConfigDir: path.resolve(__dirname, '../../fixtures/waitBeforeCapture'),
  storybookStaticDir: path.resolve(__dirname, '../../fixtures'),
  browser: [
    {name: 'chrome', width: 500, height: 800},
    {name: 'chrome', width: 1000, height: 800},
  ],
  layoutBreakpoints: true,
  waitBeforeCapture: 2000,
};
