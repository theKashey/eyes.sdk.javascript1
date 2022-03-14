/* eslint-disable */
const {testServer} = require('@applitools/test-server');
const {join} = require('path')

module.exports = async (_on, config) => {
  const staticPath  = config.staticPath || join(__dirname, '../../../../../fixtures')
  const server = await testServer({
    port: config.eyesTestPort || 0,
    staticPath,
    middlewares: config.middlewares,
  });
  return {testPort: server.port};
};
