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
};

// eslint-disable-next-line
require('../../../../../')(module);
