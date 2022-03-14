// eslint-disable-next-line
const fetch = require('node-fetch');
const path = require('path');

async function getUrls() {
  const sitemapUrl = 'http://a142332.hostedsitemap.com/4049686/urllist.txt';
  const filters = [/\/blog/, /\.png/, /\.pdf/];

  const resp = await fetch(sitemapUrl);
  const text = await resp.text();
  return text.split(/\n/g).filter(u => !filters.some(f => u.match(f)) && u.includes('/docs'));
}

const startServer = require('./start-test-server');

module.exports = async (on, config) => {
  on('task', {getUrls});
  config.eyesTestPort = 5555;
  config.staticPath = path.join(__dirname, '../../..'); // fixtures folder
  // config.middlewares = ['slow'];
  await startServer(on, config);

  on('before:browser:launch', (browser = {}, launchOptions) => {
    // `args` is an array of all the arguments that will
    // be passed to browsers when it launches
    console.log(launchOptions.args); // print all current args

    if (browser.family === 'chromium' && browser.name !== 'electron') {
      // auto open devtools
      launchOptions.args.push('--auto-open-devtools-for-tabs');
    }

    if (browser.family === 'firefox') {
      // auto open devtools
      launchOptions.args.push('-devtools');
    }

    if (browser.name === 'electron') {
      // auto open devtools
      launchOptions.preferences.devTools = true;
    }

    // whatever you return here becomes the launchOptions
    return launchOptions;
  });
};

// eslint-disable-next-line
require('../../../../../')(module);
