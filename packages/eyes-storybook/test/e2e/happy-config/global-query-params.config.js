const path = require('path');

module.exports = {
  appName: 'Global query params',
  batchName: 'Global query params',
  storybookConfigDir: path.resolve(__dirname, '../../fixtures/globalQueryParams'),
  storybookStaticDir: path.resolve(__dirname, '../../fixtures'),
  variations: [
    {queryParams: {global: 'theme:dark;lang:en'}},
    {queryParams: {global: 'theme:dark;lang:uk'}},
    {queryParams: {global: 'theme:light;lang:en'}},
    {queryParams: {global: 'theme:light;lang:uk'}},
  ],
  // puppeteerOptions: {headless: false, devtools: true},
};
