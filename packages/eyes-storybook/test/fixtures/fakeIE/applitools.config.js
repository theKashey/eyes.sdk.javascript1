const path = require('path');
const dir = path.resolve(__dirname, './');

module.exports = {
  appName: 'faking IE',
  batchName: 'Fake IE story',
  storybookConfigDir: dir,
  fakeIE: true,
  browser: [
    {width: 800, height: 600, name: 'ie'},
    {width: 800, height: 600, name: 'chrome'},
  ],
  // puppeteerOptions: {headless: false},
};
