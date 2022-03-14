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
    };

    const coreConfig = eyesOpenMapValues({
      args,
      appliConfFile: {},
      testName,
      shouldUseBrowserHooks,
      defaultBrowser,
    });
    expect(coreConfig).to.be.deep.equal(expected);
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
    };
    const coreConfig = eyesOpenMapValues({
      args,
      appliConfFile,
      testName,
      shouldUseBrowserHooks,
      defaultBrowser,
    });
    expect(coreConfig).to.be.deep.equal(expected);
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
    };

    const coreConfig = eyesOpenMapValues({
      args,
      appliConfFile,
      testName,
      shouldUseBrowserHooks,
      defaultBrowser,
    });
    expect(coreConfig).to.be.deep.equal(expected);
  });
});
