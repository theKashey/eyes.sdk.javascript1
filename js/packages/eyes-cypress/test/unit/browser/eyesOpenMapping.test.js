const {describe, it} = require('mocha');
const {expect} = require('chai');
const {eyesOpenMapValues} = require('../../../src/browser/eyesOpenMapping');

describe('eyes open mapping', () => {
  const shouldUseBrowserHooks = true,
    dontCloseBatches = false,
    testName = 'test open mapping',
    defaultBrowser = {};
  it('should work with eyes open config', () => {
    const args = {
      browser: [
        {width: 1200, height: 1000, name: 'chrome'},
        {width: 800, height: 1000, name: 'chrome'},
      ],
      useDom: true,
      ignoreCaret: true,
      ignoreDisplacements: true,
      accessibilityValidation: {level: 'AAA', guidelinesVersion: 'WCAG_2_0'},
      matchLevel: 'Layout',
      enablePatterns: true,
      batch: {id: '1234'},
    };

    const expected = {
      browsersInfo: [
        {width: 1200, height: 1000, name: 'chrome'},
        {width: 800, height: 1000, name: 'chrome'},
      ],
      dontCloseBatches,
      testName,
      defaultMatchSettings: {
        accessibilitySettings: {level: 'AAA', guidelinesVersion: 'WCAG_2_0'},
        enablePatterns: true,
        ignoreCaret: true,
        ignoreDisplacements: true,
        matchLevel: 'Layout',
        useDom: true,
      },
      batch: {id: '1234'},
    };

    const coreConfig = eyesOpenMapValues({
      args,
      appliConfFile: {},
      testName,
      shouldUseBrowserHooks,
      defaultBrowser,
    });
    expect(coreConfig).to.eql(expected);
  });

  it('should work with config file', () => {
    const args = {};

    const expected = {
      browsersInfo: [
        {width: 1200, height: 1000, name: 'chrome'},
        {width: 800, height: 1000, name: 'chrome'},
      ],
      apiKey: 'my api key',
      showLogs: true,
      testName,
      shouldUseBrowserHooks,
      dontCloseBatches: false,
      defaultMatchSettings: {
        accessibilitySettings: {level: 'AAA', guidelinesVersion: 'WCAG_2_0'},
        enablePatterns: true,
        ignoreCaret: true,
        ignoreDisplacements: true,
        matchLevel: 'Layout',
        useDom: true,
      },
      batch: {id: '1234'},
    };
    const appliConfFile = {
      browser: [
        {width: 1200, height: 1000, name: 'chrome'},
        {width: 800, height: 1000, name: 'chrome'},
      ],
      apiKey: 'my api key',
      showLogs: true,
      dontCloseBatches: false,
      testName,
      shouldUseBrowserHooks,
      useDom: true,
      ignoreCaret: true,
      ignoreDisplacements: true,
      accessibilityValidation: {level: 'AAA', guidelinesVersion: 'WCAG_2_0'},
      matchLevel: 'Layout',
      enablePatterns: true,
      batch: {id: '1234'},
    };
    const coreConfig = eyesOpenMapValues({
      args,
      appliConfFile,
      testName,
      shouldUseBrowserHooks,
      defaultBrowser,
    });
    expect(coreConfig).to.eql(expected);
  });

  it('eyes open config should have precedence over config file', () => {
    const args = {
      browser: [
        {width: 1200, height: 1000, name: 'chrome'},
        {width: 800, height: 1000, name: 'chrome'},
      ],
      testName,
      shouldUseBrowserHooks,
      dontCloseBatches,
      useDom: true,
      ignoreCaret: true,
      ignoreDisplacements: true,
      accessibilityValidation: {level: 'AAA', guidelinesVersion: 'WCAG_2_0'},
      matchLevel: 'Layout',
      enablePatterns: true,
      batchId: '12345',
      batchName: 'test config file mapping 2',
      batchSequenceName: 'S2',
    };

    const expected = {
      browsersInfo: [
        {width: 1200, height: 1000, name: 'chrome'},
        {width: 800, height: 1000, name: 'chrome'},
      ],
      testName,
      dontCloseBatches,
      shouldUseBrowserHooks,
      defaultMatchSettings: {
        accessibilitySettings: {level: 'AAA', guidelinesVersion: 'WCAG_2_0'},
        enablePatterns: true,
        ignoreCaret: true,
        ignoreDisplacements: true,
        matchLevel: 'Layout',
        useDom: true,
      },
      batch: {id: '12345', name: 'test config file mapping 2', sequenceName: 'S2'},
    };
    const appliConfFile = {
      browser: [
        {width: 1100, height: 800, name: 'chrome'},
        {width: 1400, height: 650, name: 'chrome'},
      ],
      testName: 'name from file',
      useDom: false,
      ignoreCaret: false,
      ignoreDisplacements: false,
      accessibilityValidation: {level: 'AA', guidelinesVersion: 'WCAG_2_1'},
      matchLevel: 'Strict',
      enablePatterns: false,
      batch: {id: '1234', name: 'test config file mapping', sequenceName: 'S1'},
    };

    const coreConfig = eyesOpenMapValues({
      args,
      appliConfFile,
      testName,
      shouldUseBrowserHooks,
      defaultBrowser,
    });
    expect(coreConfig).to.eql(expected);
  });

  it('eyesOpen batch mapping, batch properties', () => {
    const args = {
      batchId: '1234',
      batchName: 'test eyesOpen mapping',
      batchSequenceName: 'S1',
    };

    const expected = {
      browsersInfo: undefined,
      defaultMatchSettings: {
        accessibilitySettings: undefined,
        enablePatterns: undefined,
        enablePatterns: undefined,
        ignoreCaret: undefined,
        ignoreDisplacements: undefined,
        matchLevel: undefined,
        useDom: undefined,
      },
      dontCloseBatches,
      testName,
      batch: {id: '1234', name: 'test eyesOpen mapping', sequenceName: 'S1'},
    };

    const coreConfig = eyesOpenMapValues({
      args,
      appliConfFile: {},
      testName,
      shouldUseBrowserHooks,
      defaultBrowser,
    });
    expect(coreConfig).to.eql(expected);
  });

  it('eyesOpen batch mapping, batch object with boolean', () => {
    const args = {
      batch: {
        id: '1234',
        name: 'test eyesOpen mapping',
        sequenceName: 'S1',
        properties: 'Any properties',
        notifyOnCompletion: false,
      },
    };

    const expected = {
      browsersInfo: undefined,
      defaultMatchSettings: {
        accessibilitySettings: undefined,
        enablePatterns: undefined,
        enablePatterns: undefined,
        ignoreCaret: undefined,
        ignoreDisplacements: undefined,
        matchLevel: undefined,
        useDom: undefined,
      },
      dontCloseBatches,
      testName,
      batch: {
        id: '1234',
        name: 'test eyesOpen mapping',
        sequenceName: 'S1',
        notifyOnCompletion: false,
        properties: 'Any properties',
      },
    };

    const coreConfig = eyesOpenMapValues({
      args,
      appliConfFile: {},
      testName,
      shouldUseBrowserHooks,
      defaultBrowser,
    });
    expect(coreConfig).to.eql(expected);
  });

  it('config file batch mapping, batch properties', () => {
    const appliConfFile = {
      batchId: '1234',
      batchName: 'test config file mapping',
      batchSequenceName: 'S1',
    };

    const expected = {
      browsersInfo: undefined,
      defaultMatchSettings: {
        accessibilitySettings: undefined,
        enablePatterns: undefined,
        enablePatterns: undefined,
        ignoreCaret: undefined,
        ignoreDisplacements: undefined,
        matchLevel: undefined,
        useDom: undefined,
      },
      dontCloseBatches,
      testName,
      batch: {id: '1234', name: 'test config file mapping', sequenceName: 'S1'},
    };

    const coreConfig = eyesOpenMapValues({
      args: {},
      appliConfFile,
      testName,
      shouldUseBrowserHooks,
      defaultBrowser,
    });
    expect(coreConfig).to.eql(expected);
  });

  it('config file batch mapping, batch obejct', () => {
    const appliConfFile = {
      batch: {
        id: '1234',
        name: 'test config file mapping',
        sequenceName: 'S1',
        notifyOnCompletion: true,
        properties: 'Any properties',
      },
    };

    const expected = {
      browsersInfo: undefined,
      defaultMatchSettings: {
        accessibilitySettings: undefined,
        enablePatterns: undefined,
        enablePatterns: undefined,
        ignoreCaret: undefined,
        ignoreDisplacements: undefined,
        matchLevel: undefined,
        useDom: undefined,
      },
      dontCloseBatches,
      testName,
      batch: {
        id: '1234',
        name: 'test config file mapping',
        sequenceName: 'S1',
        notifyOnCompletion: true,
        properties: 'Any properties',
      },
    };

    const coreConfig = eyesOpenMapValues({
      args: {},
      appliConfFile,
      testName,
      shouldUseBrowserHooks,
      defaultBrowser,
    });
    expect(coreConfig).to.eql(expected);
  });

  it('make sure applitConfFile stays intact for all tests', () => {
    const args = {};

    const expected = {
      browsersInfo: [
        {width: 1200, height: 1000, name: 'chrome'},
        {width: 800, height: 1000, name: 'chrome'},
      ],
      apiKey: 'my api key',
      showLogs: true,
      testName,
      shouldUseBrowserHooks,
      dontCloseBatches: false,
      defaultMatchSettings: {
        accessibilitySettings: {level: 'AAA', guidelinesVersion: 'WCAG_2_0'},
        enablePatterns: true,
        ignoreCaret: true,
        ignoreDisplacements: true,
        matchLevel: 'Layout',
        useDom: true,
      },
      batch: {id: '1234'},
    };
    const appliConfFile = {
      browser: [
        {width: 1200, height: 1000, name: 'chrome'},
        {width: 800, height: 1000, name: 'chrome'},
      ],
      apiKey: 'my api key',
      showLogs: true,
      dontCloseBatches: false,
      testName,
      shouldUseBrowserHooks,
      useDom: true,
      ignoreCaret: true,
      ignoreDisplacements: true,
      accessibilityValidation: {level: 'AAA', guidelinesVersion: 'WCAG_2_0'},
      matchLevel: 'Layout',
      enablePatterns: true,
      batch: {id: '1234'},
    };
    eyesOpenMapValues({
      args,
      appliConfFile,
      testName,
      shouldUseBrowserHooks,
      defaultBrowser,
    });

    const coreConfigTest2 = eyesOpenMapValues({
      args,
      appliConfFile,
      testName,
      shouldUseBrowserHooks,
      defaultBrowser,
    });
    expect(coreConfigTest2).to.eql(expected);
  });
});
