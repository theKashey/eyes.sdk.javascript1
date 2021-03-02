'use strict';
const {makeVisualGridClient, Logger} = require('@applitools/visual-grid-client');
const makeStartServer = require('./server');
const makePluginExport = require('./pluginExport');
const {startApp} = require('./app');
const getErrorsAndDiffs = require('./getErrorsAndDiffs');
const processCloseAndAbort = require('./processCloseAndAbort');
const errorDigest = require('./errorDigest');
const makeHandlers = require('./handlers');
const makeConfig = require('./config');

const {config, eyesConfig} = makeConfig();
const logger = new Logger(config.showLogs, 'eyes');

const visualGridClient = makeVisualGridClient(
  Object.assign(config, {logger: (logger.extend && logger.extend('vgc')) || logger}),
);

const handlers = makeHandlers({
  logger,
  config,
  visualGridClient,
  processCloseAndAbort,
  getErrorsAndDiffs,
  errorDigest,
});

const app = startApp({handlers, logger});
const startServer = makeStartServer({app, logger});
logger.log('eyes-cypress plugin running with config:', config);

module.exports = makePluginExport({startServer, eyesConfig, visualGridClient, logger});
