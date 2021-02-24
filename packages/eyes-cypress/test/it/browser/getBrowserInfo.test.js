'use strict';

const {describe, it} = require('mocha');
const {expect} = require('chai');
const {presult} = require('@applitools/functional-commons');
const getBrowserInfo = require('../../../src/browser/getBrowserInfo');

describe('getBrowserInfo', () => {
  it('should return browser name and width', async () => {
    const browser = {name: 'chrome', width: 800};
    const result = await getBrowserInfo(browser, async () => {});
    expect(result).to.deep.equal(browser);
  });

  it('should return emulated device information', async () => {
    let cmd;
    const browser = {
      deviceName: 'Galaxy S20',
      screenOrientation: 'landscape',
    };
    const result = await getBrowserInfo(browser, async ({command}) => {
      cmd = command;
      return {
        'Galaxy S20': {landscape: {width: 500, height: 200}},
      };
    });
    expect(cmd).to.equal('getEmulatedDevicesSizes');
    expect(result).to.deep.equal({
      name: 'Galaxy S20',
      width: 500,
      height: 200,
    });
  });

  it('should return ios device information', async () => {
    let cmd;
    const browser = {
      iosDeviceInfo: {
        deviceName: 'iPhone XR',
        screenOrientation: 'landscape',
      },
    };
    const result = await getBrowserInfo(browser, async ({command}) => {
      cmd = command;
      return {
        'iPhone XR': {landscape: {width: 500, height: 200}},
      };
    });
    expect(cmd).to.equal('getIosDevicesSizes');
    expect(result).to.deep.equal({
      name: 'iPhone XR',
      width: 500,
      height: 200,
    });
  });

  it('throws an informative error message', async () => {
    let cmd;
    const browser = {
      deviceName: 'iPhone 11 Pro',
      screenOrientation: 'landscape',
    };
    const [err] = await presult(
      getBrowserInfo(browser, async ({command}) => {
        cmd = command;
        return {
          'iPhone X': {landscape: {width: 500, height: 200}},
        };
      }),
    );

    expect(cmd).to.equal('getEmulatedDevicesSizes');
    expect(err.toString().split('\n')[0]).to.equal(
      `Error: 'iPhone 11 Pro' does not exist in the list of emulated devices.`,
    );
  });
});
