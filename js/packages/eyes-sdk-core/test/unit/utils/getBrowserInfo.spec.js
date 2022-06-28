'use strict'

const assert = require('assert')
const getBrowserInfo = require('../../../lib/utils/getBrowserInfo')

describe('getBrowserInfo(browser)', () => {
  const getEmulatedDevicesSizes = async () => {
    return {
      emulated1: {portrait: {width: 1, height: 11}, landscape: {width: 11, height: 1}},
      emulated2: {portrait: {width: 2, height: 22}, landscape: {width: 22, height: 2}},
    }
  }
  const getIosDevicesSizes = async () => {
    return {
      ios1: {portrait: {width: 10, height: 110}, landscape: {width: 110, height: 10}},
    }
  }

  it('works with desktop browser', async () => {
    const browser = {name: 'browser1', width: 3, height: 33}
    assert.deepStrictEqual(await getBrowserInfo({browser, getEmulatedDevicesSizes, getIosDevicesSizes}), {
      name: 'browser1',
      width: 3,
      height: 33,
    })
  })

  it('works with emulated device syntax', async () => {
    const browser = {deviceName: 'emulated1', name: 'chrome', screenOrientation: 'landscape'}
    assert.deepStrictEqual(await getBrowserInfo({browser, getEmulatedDevicesSizes, getIosDevicesSizes}), {
      name: 'emulated1',
      screenOrientation: 'landscape',
      width: 11,
      height: 1,
    })

    const device1 = {deviceName: 'emulated1'}
    assert.deepStrictEqual(await getBrowserInfo({browser: device1, getEmulatedDevicesSizes, getIosDevicesSizes}), {
      name: 'emulated1',
      screenOrientation: 'portrait',
      width: 1,
      height: 11,
    })
    const device1Portrait = {deviceName: 'emulated1', screenOrientation: 'portrait'}
    assert.deepStrictEqual(
      await getBrowserInfo({browser: device1Portrait, getEmulatedDevicesSizes, getIosDevicesSizes}),
      {
        name: 'emulated1',
        screenOrientation: 'portrait',
        width: 1,
        height: 11,
      },
    )
    const device1Landscape = {deviceName: 'emulated1', screenOrientation: 'landscape'}
    assert.deepStrictEqual(
      await getBrowserInfo({
        browser: device1Landscape,
        getEmulatedDevicesSizes,
        getIosDevicesSizes,
      }),
      {
        name: 'emulated1',
        screenOrientation: 'landscape',
        width: 11,
        height: 1,
      },
    )
    const device2 = {chromeEmulationInfo: {deviceName: 'emulated2'}}
    assert.deepStrictEqual(await getBrowserInfo({browser: device2, getEmulatedDevicesSizes, getIosDevicesSizes}), {
      name: 'emulated2',
      screenOrientation: 'portrait',
      width: 2,
      height: 22,
    })
    const device2Portrait = {
      chromeEmulationInfo: {deviceName: 'emulated2', screenOrientation: 'portrait'},
    }
    assert.deepStrictEqual(
      await getBrowserInfo({browser: device2Portrait, getEmulatedDevicesSizes, getIosDevicesSizes}),
      {
        name: 'emulated2',
        screenOrientation: 'portrait',
        width: 2,
        height: 22,
      },
    )
    const device2Landscape = {
      chromeEmulationInfo: {deviceName: 'emulated2', screenOrientation: 'landscape'},
    }
    assert.deepStrictEqual(
      await getBrowserInfo({
        browser: device2Landscape,
        getEmulatedDevicesSizes,
        getIosDevicesSizes,
      }),
      {
        name: 'emulated2',
        screenOrientation: 'landscape',
        width: 22,
        height: 2,
      },
    )
  })

  it('works with ios device syntax', async () => {
    const device1 = {iosDeviceInfo: {deviceName: 'ios1'}}
    assert.deepStrictEqual(await getBrowserInfo({browser: device1, getEmulatedDevicesSizes, getIosDevicesSizes}), {
      name: 'ios1',
      screenOrientation: 'portrait',
      width: 10,
      height: 110,
    })
    const device1Portrait = {
      iosDeviceInfo: {deviceName: 'ios1', screenOrientation: 'portrait'},
    }
    assert.deepStrictEqual(
      await getBrowserInfo({browser: device1Portrait, getEmulatedDevicesSizes, getIosDevicesSizes}),
      {
        name: 'ios1',
        screenOrientation: 'portrait',
        width: 10,
        height: 110,
      },
    )
    const device1Landscape = {
      iosDeviceInfo: {deviceName: 'ios1', screenOrientation: 'landscape'},
    }
    assert.deepStrictEqual(
      await getBrowserInfo({
        browser: device1Landscape,
        getEmulatedDevicesSizes,
        getIosDevicesSizes,
      }),
      {
        name: 'ios1',
        screenOrientation: 'landscape',
        width: 110,
        height: 10,
      },
    )
  })
})
