'use strict'
const {describe, it} = require('mocha')
const {expect} = require('chai')
const mapChromeEmulationInfo = require('../../../src/sdk/mapChromeEmulationInfo')

describe('mapChromeEmulationInfo', () => {
  it('returns same browser if `chromeEmulationInfo` is provided', () => {
    const browser = {
      someOtherKey: 'val',
      chromeEmulationInfo: 'chromeEmulationInfo',
    }
    expect(mapChromeEmulationInfo(browser)).to.eql(browser)
  })

  it('returns chromeEmulationInfo if `deviceName` is provided', () => {
    const browser = {
      someOtherKey: 'val',
      deviceName: 'deviceName',
      screenOrientation: 'screenOrientation',
    }
    expect(mapChromeEmulationInfo(browser)).to.eql({
      someOtherKey: 'val',
      chromeEmulationInfo: {
        deviceName: 'deviceName',
        screenOrientation: 'screenOrientation',
      },
    })
  })

  it('returns chromeEmulationInfo if `deviceScaleFactor` is provided', () => {
    const browser = {
      someOtherKey: 'val',
      deviceScaleFactor: 'deviceScaleFactor',
      screenOrientation: 'screenOrientation',
      width: 'width',
      height: 'height',
    }
    expect(mapChromeEmulationInfo(browser)).to.eql({
      someOtherKey: 'val',
      chromeEmulationInfo: {
        deviceScaleFactor: 'deviceScaleFactor',
        screenOrientation: 'screenOrientation',
        width: 'width',
        height: 'height',
        mobile: undefined,
      },
      width: 'width',
      height: 'height',
    })
  })

  it('returns chromeEmulationInfo if `mobile` is provided', () => {
    const browser = {
      someOtherKey: 'val',
      mobile: 'mobile',
      screenOrientation: 'screenOrientation',
      width: 'width',
      height: 'height',
    }
    expect(mapChromeEmulationInfo(browser)).to.eql({
      someOtherKey: 'val',
      chromeEmulationInfo: {
        mobile: 'mobile',
        screenOrientation: 'screenOrientation',
        width: 'width',
        height: 'height',
        deviceScaleFactor: undefined,
      },
      width: 'width',
      height: 'height',
    })
  })

  it('does not return chromeEmulationInfo if there is no indication of emulation info', () => {
    const browser = {
      someOtherKey: 'val',
      iosDeviceInfo: 'iosDeviceInfo',
      screenOrientation: 'screenOrientation',
      width: 'width',
      height: 'height',
    }
    expect(mapChromeEmulationInfo(browser)).to.eql(browser)
  })
})
