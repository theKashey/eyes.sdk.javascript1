import {strict as assert} from 'assert'
import {DeviceName, IosDeviceName, AndroidDeviceName} from '../../src'
import fetch from 'node-fetch'

describe('enums', () => {
  // TODO unskip when grid will add Sony Xperia 10 II device
  describe.skip('DeviceName', () => {
    const url = 'https://render-wus.applitools.com/emulated-devices'
    let expectedDeviceNames: string[]
    before(async () => {
      const LEGACY = ['Samsung Galaxy S8', 'Samsung Galaxy A5', 'Galaxy S III', 'Galaxy Note II']
      const {devices}: {devices: any[]} = await fetch(url).then(response => response.json())
      expectedDeviceNames = devices.map(device => device.deviceName).filter(deviceName => !LEGACY.includes(deviceName))
    })

    it('should consists of allowed values', async () => {
      assert.deepEqual(Object.values(DeviceName).sort(), expectedDeviceNames.sort())
    })
  })

  describe('IosDeviceName', () => {
    const url = 'https://render-wus.applitools.com/ios-devices-sizes'
    let expectedDeviceNames: string[]
    before(async () => {
      const devices = await fetch(url).then(response => response.json())
      expectedDeviceNames = Object.keys(devices)
    })

    it('should consists of allowed values', async () => {
      assert.deepEqual(Object.values(IosDeviceName).sort(), expectedDeviceNames.sort())
    })
  })

  // TODO unskip when grid will have all of the devices listed in the endpoint
  describe.skip('AndroidDeviceName', () => {
    const url = 'https://render-wus.applitools.com/public/android-devices'
    let expectedDeviceNames: string[]
    before(async () => {
      const devices = await fetch(url).then(response => response.json())
      expectedDeviceNames = Object.keys(devices)
    })

    it('should consists of allowed values', async () => {
      assert.deepEqual(Object.values(AndroidDeviceName).sort(), expectedDeviceNames.sort())
    })
  })
})
