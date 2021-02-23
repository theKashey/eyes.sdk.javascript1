'use strict';
const {makeVisualGridClient, Logger} = require('@applitools/visual-grid-client');
const makeStartServer = require('./server');
const makePluginExport = require('./pluginExport');
const {startApp} = require('./app');
const getErrorsAndDiffs = require('./getErrorsAndDiffs');
const processCloseAndAbort = require('./processCloseAndAbort');
const errorDigest = require('./errorDigest');
const makeHandlers = require('./handlers');
const {getRunConfig} = require('./config');

const runConfig = getRunConfig();
const logger = new Logger(runConfig.showLogs, 'eyes');

const visualGridClient = makeVisualGridClient(
  Object.assign(runConfig, {logger: (logger.extend && logger.extend('vgc')) || logger}),
);

const handlers = makeHandlers({
  logger,
  runConfig,
  visualGridClient,
  processCloseAndAbort,
  getErrorsAndDiffs,
  errorDigest,
});

const app = startApp({handlers, logger});
const startServer = makeStartServer({app, logger});
logger.log('eyes-cypress plugin running with config:', runConfig);
module.exports = makePluginExport({startServer, runConfig, visualGridClient, logger});
