'use strict'
const {describe, it} = require('mocha')
const {expect} = require('chai')
const makeRenderingGridClient = require('../../src/sdk/renderingGridClient')

describe('renderingGridClient e2e', () => {
  it('getEmulatedDevicesSizes', async () => {
    const {getEmulatedDevicesSizes} = await makeRenderingGridClient({
      showLogs: process.env.APPLITOOLS_SHOW_LOGS,
    })
    const devicesSizes = await getEmulatedDevicesSizes()
    expect(Object.keys(devicesSizes).length).to.be.greaterThan(0)
    expect(
      Object.values(devicesSizes).every(device => 'portrait' in device && 'landscape' in device),
    ).to.eql(true)
  })

  it('getIosDevicesSizes', async () => {
    const {getIosDevicesSizes} = await makeRenderingGridClient({
      showLogs: process.env.APPLITOOLS_SHOW_LOGS,
    })
    const devicesSizes = await getIosDevicesSizes()
    expect(Object.keys(devicesSizes).length).to.be.greaterThan(0)
    expect(
      Object.values(devicesSizes).every(device => 'portrait' in device && 'landscape' in device),
    ).to.eql(true)
  })
})
