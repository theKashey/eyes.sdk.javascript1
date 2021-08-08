'use strict'

const assert = require('assert')

const {EmulationDevice} = require('../../../index')

describe('EmulationDevice', () => {
  it('constructor without arguments', () => {
    const emulationDevice = new EmulationDevice()
    assert.strictEqual(Object.prototype.hasOwnProperty.call(emulationDevice, '_width'), true)
    assert.strictEqual(Object.prototype.hasOwnProperty.call(emulationDevice, '_height'), true)
    assert.strictEqual(Object.prototype.hasOwnProperty.call(emulationDevice, '_deviceScaleFactor'), true)
    assert.strictEqual(Object.prototype.hasOwnProperty.call(emulationDevice, '_mobile'), true)
  })

  it('constructor with arguments', () => {
    const emulationDevice = new EmulationDevice({
      width: 1,
      height: 2,
      deviceScaleFactor: 3,
      mobile: true,
    })
    assert.strictEqual(emulationDevice.getWidth(), 1)
    assert.strictEqual(emulationDevice.getHeight(), 2)
    assert.strictEqual(emulationDevice.getDeviceScaleFactor(), 3)
    assert.strictEqual(emulationDevice.getMobile(), true)
  })

  it('toJSON', () => {
    const emulationDeviceObj = {width: 1, height: 2, deviceScaleFactor: 3, mobile: true}
    const emulationDevice = new EmulationDevice(emulationDeviceObj)
    assert.deepStrictEqual(emulationDevice.toJSON(), emulationDeviceObj)
  })

  it('toString', () => {
    const emulationDeviceObj = {width: 1, height: 2, deviceScaleFactor: 3, mobile: true}
    const emulationDevice = new EmulationDevice(emulationDeviceObj)
    assert.deepStrictEqual(
      emulationDevice.toString(),
      'EmulationDevice { {"width":1,"height":2,"deviceScaleFactor":3,"mobile":true} }',
    )
  })
})
