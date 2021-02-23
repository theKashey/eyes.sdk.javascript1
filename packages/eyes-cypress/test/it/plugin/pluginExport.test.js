'use strict';
const {describe, it, beforeEach, afterEach} = require('mocha');
const {expect} = require('chai');
const makePluginExport = require('../../../src/plugin/pluginExport');
const {promisify: p} = require('util');
const psetTimeout = p(setTimeout);
const {makeVisualGridClient, Logger} = require('@applitools/visual-grid-client');

describe('pluginExport', () => {
  let prevEnv, visualGridClient, logger, on;

  async function startServer() {
    return {
      eyesPort: 123,
    };
  }

  beforeEach(() => {
    logger = new Logger(process.env.APPLITOOLS_SHOW_LOGS, 'eyes');
    on = (_event, _callback) => {};
    visualGridClient = makeVisualGridClient({logger});
    prevEnv = process.env;
    process.env = {};
  });

  afterEach(() => {
    process.env = prevEnv;
  });

  it('works', async () => {
    const pluginExport = makePluginExport({startServer, runConfig: {}, visualGridClient, logger});

    const __module = {
      exports: (_on, config) => {
        x = config;
        return {bla: `ret_${config}`};
      },
    };

    let x;

    pluginExport(__module);
    const ret = await __module.exports(on, 'first');

    expect(x).to.equal('first');
    expect(ret).to.eql({
      bla: 'ret_first',
      eyesPort: 123,
      eyesDisableBrowserFetching: false,
      eyesLayoutBreakpoints: undefined,
      eyesFailCypressOnDiff: true,
      eyesIsDisabled: false,
      eyesBrowser: undefined,
    });

    const ret2 = await __module.exports(on, 'second');
    expect(x).to.equal('second');
    expect(ret2).to.eql({
      bla: 'ret_second',
      eyesPort: 123,
      eyesDisableBrowserFetching: false,
      eyesLayoutBreakpoints: undefined,
      eyesFailCypressOnDiff: true,
      eyesIsDisabled: false,
      eyesBrowser: undefined,
    });
  });

  it('handles async module.exports', async () => {
    const pluginExport = makePluginExport({startServer, runConfig: {}, visualGridClient});
    const __module = {
      exports: async (_on, _config) => {
        await psetTimeout(0);
        return {bla: 'bla'};
      },
    };

    const on = (_event, _callback) => {};
    pluginExport(__module);
    const ret = await __module.exports(on, 'some');
    expect(ret).to.eql({
      bla: 'bla',
      eyesPort: 123,
      eyesDisableBrowserFetching: false,
      eyesLayoutBreakpoints: undefined,
      eyesFailCypressOnDiff: true,
      eyesIsDisabled: false,
      eyesBrowser: undefined,
    });
  });

  it('works with disabled eyes', async () => {
    const pluginExport = makePluginExport({
      startServer,
      runConfig: {isDisabled: true},
      visualGridClient,
    });
    const __module = {
      exports: () => ({bla: 'ret'}),
    };

    pluginExport(__module);
    const ret = await __module.exports(on, 'some');
    expect(ret).to.eql({
      bla: 'ret',
      eyesPort: 123,
      eyesIsDisabled: true,
      eyesDisableBrowserFetching: false,
      eyesLayoutBreakpoints: undefined,
      eyesFailCypressOnDiff: true,
      eyesBrowser: undefined,
    });
  });

  it('works with dont fail cypress on diff', async () => {
    const pluginExport = makePluginExport({
      startServer,
      runConfig: {failCypressOnDiff: false},
      visualGridClient,
    });
    const __module = {
      exports: () => ({bla: 'ret'}),
    };

    pluginExport(__module);
    const ret = await __module.exports(on, 'some');
    expect(ret).to.eql({
      bla: 'ret',
      eyesPort: 123,
      eyesDisableBrowserFetching: false,
      eyesLayoutBreakpoints: undefined,
      eyesIsDisabled: false,
      eyesFailCypressOnDiff: false,
      eyesBrowser: undefined,
      eyesTimeout: undefined,
    });
  });

  it('works with eyes timeout', async () => {
    const pluginExport = makePluginExport({
      startServer,
      runConfig: {eyesTimeout: 1234},
      visualGridClient,
    });
    const __module = {
      exports: () => ({bla: 'ret'}),
    };

    pluginExport(__module);
    const ret = await __module.exports(on, 'some');
    expect(ret).to.eql({
      bla: 'ret',
      eyesPort: 123,
      eyesDisableBrowserFetching: false,
      eyesLayoutBreakpoints: undefined,
      eyesIsDisabled: false,
      eyesFailCypressOnDiff: true,
      eyesBrowser: undefined,
      eyesTimeout: 1234,
    });
  });

  it('works with eyes disableBrowserFetching', async () => {
    const pluginExport = makePluginExport({startServer, runConfig: {disableBrowserFetching: true}});
    const __module = {
      exports: () => ({bla: 'ret'}),
    };

    pluginExport(__module);
    const ret = await __module.exports(on, 'some');
    expect(ret).to.eql({
      bla: 'ret',
      eyesPort: 123,
      eyesDisableBrowserFetching: true,
      eyesLayoutBreakpoints: undefined,
      eyesIsDisabled: false,
      eyesFailCypressOnDiff: true,
      eyesBrowser: undefined,
    });
  });
});
