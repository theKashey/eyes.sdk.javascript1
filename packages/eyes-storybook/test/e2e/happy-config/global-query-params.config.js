const path = require('path');

module.exports = {
  appName: 'Global query params',
  batchName: 'Global query params',
  storybookConfigDir: path.resolve(__dirname, '../../fixtures/globalQueryParams'),
  storybookStaticDir: path.resolve(__dirname, '../../fixtures'),
  queryParams: [
    {name: 'global', value: 'theme:dark;lang:en'},
    {name: 'global', value: 'theme:dark;lang:uk'},
    {name: 'global', value: 'theme:light;lang:en'},
    {name: 'global', value: 'theme:light;lang:uk'},
  ],
  // puppeteerOptions: {headless: false, devtools: true},
};
