'use strict';
const {describe, it} = require('mocha');
const {expect} = require('chai');
const makeConfig = require('../../../src/plugin/config');
const fs = require('fs');
const path = require('path');

describe('config', () => {
  it('should create eyes config', () => {
    const {eyesConfig} = makeConfig();
    expect(eyesConfig).to.deep.equal({
      eyesIsDisabled: false,
      eyesBrowser: undefined,
      eyesLayoutBreakpoints: undefined,
      eyesFailCypressOnDiff: true,
      eyesDisableBrowserFetching: false,
      eyesTestConcurrency: 5,
      eyesWaitBeforeCapture: undefined,
      tapDirPath: undefined,
      tapFileName: undefined,
    });
  });

  it('should work with env variables', () => {
    process.env.APPLITOOLS_IS_DISABLED = true;
    process.env.APPLITOOLS_BATCH_ID = 'batchId123';
    const {config, eyesConfig} = makeConfig();
    expect(config.batchId).to.equal('batchId123');
    expect(config.isDisabled).to.be.true;
    expect(eyesConfig).to.deep.equal({
      eyesIsDisabled: true,
      eyesBrowser: undefined,
      eyesLayoutBreakpoints: undefined,
      eyesFailCypressOnDiff: true,
      eyesDisableBrowserFetching: false,
      eyesTestConcurrency: 5,
      eyesWaitBeforeCapture: undefined,
      tapDirPath: undefined,
      tapFileName: undefined,
    });
    delete process.env.APPLITOOLS_BATCH_ID;
  });

  it('should convert accessibilityValidation to acceessibilityValidation', () => {
    const filePath = path.join(__dirname, '../../../applitools.config.js');
    fs.writeFileSync(filePath, "module.exports = {accessibilityValidation: 'AA'};");
    const {config} = makeConfig();
    try {
      expect(config.accessibilitySettings).to.equal('AA');
    } finally {
      fs.unlinkSync(filePath);
    }
  });

  it('should create random batch id when batch id is not defined in config file', () => {
    const filePath = path.join(__dirname, '../../../applitools.config.js');
    fs.writeFileSync(filePath, 'module.exports = {};');
    const {config} = makeConfig();
    expect(config.batch.id).not.undefined;
  });

  it('should not overwrite batch id from config file when passed in an object', () => {
    const filePath = path.join(__dirname, '../../../applitools.config.js');
    fs.writeFileSync(filePath, "module.exports = {batch: {id: '1234'}};");
    const {config} = makeConfig();
    expect(config.batch.id).to.equal('1234');
  });

  it('should not overwrite batch id from config file when passed in as a property', () => {
    const filePath = path.join(__dirname, '../../../applitools.config.js');
    fs.writeFileSync(filePath, "module.exports = {batchId: '1234'};");
    const {config} = makeConfig();
    expect(config.batch).to.be.undefined;
    expect(config.batchId).to.be.equal('1234');
  });

  it('should not overwrite batch name from config file when passed in as an object', () => {
    const filePath = path.join(__dirname, '../../../applitools.config.js');
    fs.writeFileSync(filePath, "module.exports = {batch: {name: '1234'}};");
    const {config} = makeConfig();
    expect(config.batch.name).to.be.equal('1234');
  });
});
