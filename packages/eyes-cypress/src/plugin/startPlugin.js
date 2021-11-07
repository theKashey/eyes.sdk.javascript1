'use strict';
const {makeVisualGridClient} = require('@applitools/visual-grid-client');
const {makeLogger} = require('@applitools/logger');
const makeStartServer = require('./server');
const makePluginExport = require('./pluginExport');
const {startApp} = require('./app');
const getErrorsAndDiffs = require('./getErrorsAndDiffs');
const processCloseAndAbort = require('./processCloseAndAbort');
const errorDigest = require('./errorDigest');
const makeHandlers = require('./handlers');
const makeConfig = require('./config');
const makeGlobalRunHooks = require('./hooks');

const {config, eyesConfig} = makeConfig();
const logger = makeLogger({level: config.showLogs ? 'info' : 'silent', label: 'eyes'});

const visualGridClient = makeVisualGridClient({...config, logger: logger.extend('vgc')});

const handlers = makeHandlers({
  logger,
  config,
  visualGridClient,
  processCloseAndAbort,
  getErrorsAndDiffs,
  errorDigest,
});

const globalHooks = makeGlobalRunHooks({visualGridClient, logger});

const app = startApp({handlers, logger});
const startServer = makeStartServer({app, logger});
logger.log('eyes-cypress plugin running with config:', config);

module.exports = makePluginExport({startServer, eyesConfig, globalHooks});
