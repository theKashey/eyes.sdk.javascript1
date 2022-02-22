'use strict';
const {describe, it, beforeEach, afterEach} = require('mocha');
const {expect} = require('chai');
const makePluginExport = require('../../../src/plugin/pluginExport');
const {promisify: p} = require('util');
const psetTimeout = p(setTimeout);
const makeConfig = require('../../../src/plugin/config');

describe('pluginExport', () => {
  let prevEnv, eyesConfig, globalHooks;

  async function startServer() {
    return {
      eyesPort: 123,
    };
  }

  beforeEach(() => {
    prevEnv = process.env;
    process.env = {};
    eyesConfig = makeConfig().eyesConfig;
    globalHooks = {};
  });

  afterEach(() => {
    process.env = prevEnv;
  });

  it('sets eyesLegcyHooks', async () => {
    const pluginExport = makePluginExport({startServer, eyesConfig, globalHooks});
    let __module = {
      exports: () => ({bla: 'blah'}),
    };

    pluginExport(__module);
    const ret = await __module.exports(() => {}, {});
    expect(ret).to.eql({
      bla: 'blah',
      eyesPort: 123,
      eyesDisableBrowserFetching: false,
      eyesLayoutBreakpoints: undefined,
      eyesFailCypressOnDiff: true,
      eyesIsDisabled: false,
      eyesIsGlobalHooksSupported: false,
      eyesBrowser: undefined,
      eyesTestConcurrency: 5,
      eyesWaitBeforeCapture: undefined,
      tapDirPath: undefined,
    });

    __module = {
      exports: (_on, config) => {
        config.version = '6.5.0';
        config.experimentalRunEvents = true;
        return config;
      },
    };

    pluginExport(__module);
    const ret2 = await __module.exports(() => {}, {});
    expect(ret2).to.eql({
      eyesPort: 123,
      eyesDisableBrowserFetching: false,
      eyesLayoutBreakpoints: undefined,
      eyesFailCypressOnDiff: true,
      eyesIsDisabled: false,
      eyesIsGlobalHooksSupported: false,
      eyesBrowser: undefined,
      eyesTestConcurrency: 5,
      version: '6.5.0',
      experimentalRunEvents: true,
      eyesWaitBeforeCapture: undefined,
      tapDirPath: undefined,
    });
  });

  it('handles async module.exports', async () => {
    const pluginExport = makePluginExport({startServer, eyesConfig, globalHooks});
    const __module = {
      exports: async () => {
        await psetTimeout(0);
        return {bla: 'bla'};
      },
    };

    pluginExport(__module);
    const ret = await __module.exports(() => {}, {});
    expect(ret).to.eql({
      bla: 'bla',
      eyesPort: 123,
      eyesDisableBrowserFetching: false,
      eyesLayoutBreakpoints: undefined,
      eyesFailCypressOnDiff: true,
      eyesIsDisabled: false,
      eyesIsGlobalHooksSupported: false,
      eyesBrowser: undefined,
      eyesTestConcurrency: 5,
      eyesWaitBeforeCapture: undefined,
      tapDirPath: undefined,
    });
  });

  it('works with disabled eyes', async () => {
    eyesConfig.eyesIsDisabled = true;
    const pluginExport = makePluginExport({startServer, eyesConfig, globalHooks});
    const __module = {
      exports: () => ({bla: 'ret'}),
    };

    pluginExport(__module);
    const ret = await __module.exports(() => {}, {});
    expect(ret).to.eql({
      bla: 'ret',
      eyesPort: 123,
      eyesIsDisabled: true,
      eyesIsGlobalHooksSupported: false,
      eyesDisableBrowserFetching: false,
      eyesLayoutBreakpoints: undefined,
      eyesFailCypressOnDiff: true,
      eyesBrowser: undefined,
      eyesTestConcurrency: 5,
      eyesWaitBeforeCapture: undefined,
      tapDirPath: undefined,
    });
  });

  it('works with dont fail cypress on diff', async () => {
    eyesConfig.eyesFailCypressOnDiff = false;
    const __module = {
      exports: () => ({bla: 'ret'}),
    };
    const pluginExport = makePluginExport({startServer, eyesConfig, globalHooks});

    pluginExport(__module);
    const ret = await __module.exports(() => {}, {});
    expect(ret).to.eql({
      bla: 'ret',
      eyesPort: 123,
      eyesDisableBrowserFetching: false,
      eyesLayoutBreakpoints: undefined,
      eyesIsDisabled: false,
      eyesIsGlobalHooksSupported: false,
      eyesFailCypressOnDiff: false,
      eyesBrowser: undefined,
      eyesTestConcurrency: 5,
      eyesWaitBeforeCapture: undefined,
      tapDirPath: undefined,
    });
  });

  it('works with eyes disableBrowserFetching', async () => {
    eyesConfig.eyesDisableBrowserFetching = true;
    const pluginExport = makePluginExport({startServer, eyesConfig, globalHooks});
    const __module = {
      exports: () => ({bla: 'ret'}),
    };

    pluginExport(__module);
    const ret = await __module.exports(() => {}, {});
    expect(ret).to.eql({
      bla: 'ret',
      eyesPort: 123,
      eyesDisableBrowserFetching: true,
      eyesLayoutBreakpoints: undefined,
      eyesIsDisabled: false,
      eyesIsGlobalHooksSupported: false,
      eyesFailCypressOnDiff: true,
      eyesBrowser: undefined,
      eyesTestConcurrency: 5,
      eyesWaitBeforeCapture: undefined,
      tapDirPath: undefined,
    });
  });
});
