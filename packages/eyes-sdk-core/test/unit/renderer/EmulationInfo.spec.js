'use strict'

const assert = require('assert')

const {EmulationDevice, EmulationInfo, ScreenOrientation} = require('../../../index')

describe('EmulationInfo', () => {
  it('constructor without arguments', () => {
    const emulationInfo = new EmulationInfo()
    assert.strictEqual(Object.prototype.hasOwnProperty.call(emulationInfo, '_device'), true)
    assert.strictEqual(Object.prototype.hasOwnProperty.call(emulationInfo, '_deviceName'), true)
    assert.strictEqual(Object.prototype.hasOwnProperty.call(emulationInfo, '_screenOrientation'), true)
  })

  it('constructor with arguments', () => {
    const device = new EmulationDevice({width: 1, height: 2})
    const emulationInfo = new EmulationInfo({device, screenOrientation: ScreenOrientation.PORTRAIT})
    assert.strictEqual(emulationInfo.getDevice(), device)
    assert.strictEqual(emulationInfo.getDeviceName(), undefined)
    assert.strictEqual(emulationInfo.getScreenOrientation(), ScreenOrientation.PORTRAIT)

    const emulationInfo2 = new EmulationInfo({deviceName: 'name'})
    assert.strictEqual(emulationInfo2.getDevice(), undefined)
    assert.strictEqual(emulationInfo2.getDeviceName(), 'name')
    assert.strictEqual(emulationInfo2.getScreenOrientation(), undefined)
  })

  it('constructor with object', () => {
    const deviceObj = {width: 1, height: 2, deviceScaleFactor: 3, mobile: true}
    const device = new EmulationDevice(deviceObj)

    const emulationInfo = new EmulationInfo({
      screenOrientation: ScreenOrientation.LANDSCAPE,
      device: deviceObj,
    })

    assert.deepStrictEqual(emulationInfo.getDevice(), device)
    assert.strictEqual(emulationInfo.getScreenOrientation(), ScreenOrientation.LANDSCAPE)
  })

  it('toJSON', () => {
    const device = new EmulationDevice({width: 1, height: 2})
    const emulationInfo = new EmulationInfo({
      device,
      screenOrientation: ScreenOrientation.LANDSCAPE,
    })
    assert.deepStrictEqual(emulationInfo.toJSON(), {
      width: 1,
      height: 2,
      mobile: undefined,
      deviceScaleFactor: undefined,
      screenOrientation: ScreenOrientation.LANDSCAPE,
    })

    const emulationInfo2 = new EmulationInfo({deviceName: 'name'})
    assert.deepStrictEqual(emulationInfo2.toJSON(), {
      deviceName: 'name',
      screenOrientation: undefined,
    })
  })

  it('toString', () => {
    const device = new EmulationDevice({width: 1, height: 2})
    const emulationInfo = new EmulationInfo({
      device,
      screenOrientation: ScreenOrientation.LANDSCAPE,
    })
    assert.deepStrictEqual(
      emulationInfo.toString(),
      'EmulationInfo { {"screenOrientation":"landscape","width":1,"height":2} }',
    )

    const emulationInfo2 = new EmulationInfo({deviceName: 'name'})
    assert.deepStrictEqual(emulationInfo2.toString(), 'EmulationInfo { {"deviceName":"name"} }')
  })
})
