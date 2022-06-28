const path = require('path');

module.exports = {
  appName: 'Layout breakpoints',
  batchName: 'Layout breakpoints',
  storybookConfigDir: path.resolve(__dirname, '../../fixtures/jsLayoutStorybookLocal'),
  storybookStaticDir: path.resolve(__dirname, '../../fixtures'),
  browser: [
    {name: 'chrome', width: 1000, height: 800},
    {iosDeviceInfo: {deviceName: 'iPad (7th generation)'}},
    {chromeEmulationInfo: {deviceName: 'Pixel 4 XL'}},
  ],
  saveNewTests: false,
};
