'use strict';
const {describe, it, beforeEach, afterEach} = require('mocha');
const {expect} = require('chai');
const makePluginExport = require('../../../src/plugin/pluginExport');
const {promisify: p} = require('util');
const psetTimeout = p(setTimeout);
const {makeVisualGridClient, Logger} = require('@applitools/visual-grid-client');
const makeConfig = require('../../../src/plugin/config');

describe('pluginExport', () => {
  let prevEnv, visualGridClient, logger, on, eyesConfig, __module;

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
    eyesConfig = makeConfig().eyesConfig;
    __module = {
      exports: (_on, config) => {
        config.version = '6.3.0';
        return config;
      },
    };
  });

  afterEach(() => {
    process.env = prevEnv;
  });

  it('sets eyesLegcyHooks', async () => {
    const pluginExport = makePluginExport({startServer, eyesConfig, visualGridClient, logger});

    pluginExport(__module);
    const ret = await __module.exports(on, {});
    expect(ret).to.eql({
      eyesPort: 123,
      eyesDisableBrowserFetching: false,
      eyesLayoutBreakpoints: undefined,
      eyesFailCypressOnDiff: true,
      eyesIsDisabled: false,
      eyesLegacyHooks: true,
      eyesBrowser: undefined,
      version: '6.3.0',
    });

    __module = {
      exports: (_on, config) => {
        config.version = '6.0.0';
        return {bla: 'blah'};
      },
    };
    pluginExport(__module);
    const ret2 = await __module.exports(on, {});
    expect(ret2).to.eql({
      bla: 'blah',
      eyesPort: 123,
      eyesDisableBrowserFetching: false,
      eyesLayoutBreakpoints: undefined,
      eyesFailCypressOnDiff: true,
      eyesLegacyHooks: true,
      eyesIsDisabled: false,
      eyesBrowser: undefined,
    });
  });

  it('handles async module.exports', async () => {
    const pluginExport = makePluginExport({startServer, eyesConfig, visualGridClient});
    const __module = {
      exports: async (_on, config) => {
        await psetTimeout(0);
        config.version = '6.3.0';
        return {bla: 'bla'};
      },
    };

    pluginExport(__module);
    const ret = await __module.exports(on, {});
    expect(ret).to.eql({
      bla: 'bla',
      eyesPort: 123,
      eyesDisableBrowserFetching: false,
      eyesLayoutBreakpoints: undefined,
      eyesFailCypressOnDiff: true,
      eyesLegacyHooks: true,
      eyesIsDisabled: false,
      eyesBrowser: undefined,
    });
  });

  it('works with disabled eyes', async () => {
    const pluginExport = makePluginExport({
      startServer,
      eyesConfig,
      visualGridClient,
    });
    const __module = {
      exports: (_on, config) => {
        config.version = '6.3.0';
        return {bla: 'ret', eyesIsDisabled: true};
      },
    };

    pluginExport(__module);
    const ret = await __module.exports(on, {});
    expect(ret).to.eql({
      bla: 'ret',
      eyesPort: 123,
      eyesIsDisabled: true,
      eyesDisableBrowserFetching: false,
      eyesLayoutBreakpoints: undefined,
      eyesLegacyHooks: true,
      eyesFailCypressOnDiff: true,
      eyesBrowser: undefined,
    });
  });

  it('works with dont fail cypress on diff', async () => {
    const __module = {
      exports: (_on, config) => {
        config.version = '6.3.0';
        return {bla: 'ret', eyesFailCypressOnDiff: false};
      },
    };
    const pluginExport = makePluginExport({
      startServer,
      eyesConfig,
      visualGridClient,
    });

    pluginExport(__module);
    const ret = await __module.exports(on, {});
    expect(ret).to.eql({
      bla: 'ret',
      eyesPort: 123,
      eyesDisableBrowserFetching: false,
      eyesLayoutBreakpoints: undefined,
      eyesLegacyHooks: true,
      eyesIsDisabled: false,
      eyesFailCypressOnDiff: false,
      eyesBrowser: undefined,
    });
  });

  it('works with eyes timeout', async () => {
    const pluginExport = makePluginExport({
      startServer,
      eyesConfig,
      visualGridClient,
    });
    const __module = {
      exports: (_on, config) => {
        config.version = '6.3.0';
        return {bla: 'ret'};
      },
    };

    pluginExport(__module);
    const ret = await __module.exports(on, {});
    expect(ret).to.eql({
      bla: 'ret',
      eyesPort: 123,
      eyesDisableBrowserFetching: false,
      eyesLayoutBreakpoints: undefined,
      eyesLegacyHooks: true,
      eyesIsDisabled: false,
      eyesFailCypressOnDiff: true,
      eyesBrowser: undefined,
    });
  });

  it('works with eyes disableBrowserFetching', async () => {
    const pluginExport = makePluginExport({startServer, eyesConfig});
    const __module = {
      exports: (_on, config) => {
        config.version = '6.3.0';
        return {bla: 'ret', eyesDisableBrowserFetching: true};
      },
    };

    pluginExport(__module);
    const ret = await __module.exports(on, {});
    expect(ret).to.eql({
      bla: 'ret',
      eyesPort: 123,
      eyesDisableBrowserFetching: true,
      eyesLayoutBreakpoints: undefined,
      eyesLegacyHooks: true,
      eyesIsDisabled: false,
      eyesFailCypressOnDiff: true,
      eyesBrowser: undefined,
    });
  });
});
