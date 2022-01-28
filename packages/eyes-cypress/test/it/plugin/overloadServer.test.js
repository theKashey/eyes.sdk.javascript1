'use strict';
const {describe, it} = require('mocha');
const makePluginExport = require('../../../src/plugin/pluginExport');
const makeConfig = require('../../../src/plugin/config');
const fetch = require('../../util/fetchWithNoCAVerify');
const makeStartServer = require('../../../src/plugin/server');
const {makeVisualGridClient} = require('@applitools/visual-grid-client');
const getErrorsAndDiffs = require('../../../src/plugin/getErrorsAndDiffs');
const processCloseAndAbort = require('../../../src/plugin/processCloseAndAbort');
const errorDigest = require('../../../src/plugin/errorDigest');
const {makeLogger} = require('@applitools/logger');
const makeHandlers = require('../../../src/plugin/handlers');
const {startApp} = require('../../../src/plugin/app');
const makeSend = require('../../../src/browser/makeSend');
const makeSendRequest = require('../../../src/browser/sendRequest');
const {assert} = require('chai');

describe('overload server', () => {
  let getCloseServer, eyesConfig, globalHooks;
  before(() => {
    eyesConfig = makeConfig().eyesConfig;
    globalHooks = {};
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  });

  after(async () => {
    await getCloseServer()();
  });

  it('local server doesnt crash', async () => {
    try {
      const config = {
        apiKey: process.env.APPLITOOLS_API_KEY,
        agentId: 'eyes-cypress',
        isDisabled: false,
        saveNewTests: false,
      };
      const logger = makeLogger({level: 'silent', label: 'eyes'});
      const visualGridClient = makeVisualGridClient({...config, logger});
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
      const pluginExport = makePluginExport({startServer, eyesConfig, globalHooks});
      const __module = {
        exports: () => ({bla: 'blah'}),
      };
      getCloseServer = pluginExport(__module);
      const ret = await __module.exports(() => {}, {});

      const openContent = {appName: 'some app name', testName: 'some test', command: 'open'};
      const send = makeSend(ret.eyesPort, fetch);
      const sendRequest = makeSendRequest(send);
      await sendRequest({
        command: 'open',
        data: openContent,
      });
      const resp = await fetch('https://applitools.com/images/icons/arrow-right-green.svg');
      const url = 'https://applitools.com/images/icons/arrow-right-green.svg';

      const value = await resp.buffer();
      const requests = [];
      for (let i = 0; i < 500; i++) {
        const curr = sendRequest({
          command: `resource/${encodeURIComponent(url)}`,
          data: value,
          method: 'PUT',
          headers: {'Content-Type': 'application/octet-stream'},
        });
        requests.push(curr);
      }

      await Promise.all(requests);
      assert(true);
    } catch (ex) {
      assert(false);
    }
  });
});
