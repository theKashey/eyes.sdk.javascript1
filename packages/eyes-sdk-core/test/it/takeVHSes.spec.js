const {Driver} = require('@applitools/driver')
const {MockDriver, spec} = require('@applitools/driver/fake')
const {makeLogger} = require('@applitools/logger')
const takeVHSes = require('../../lib/utils/takeVHSes')
const {expect} = require('chai')
const {presult} = require('../../lib/utils/GeneralUtils')

const logger = makeLogger()

describe('takeVHSes', () => {
  it('should fail if driver is not Android or iOS', async () => {
    const mock = new MockDriver()
    const driver = new Driver({logger, spec, driver: mock})
    await driver.init()
    const [error] = await presult(takeVHSes({driver, logger}))
    expect(error).not.to.be.undefined
    expect(error.message).to.equal(
      'Error while taking VHS - cannot take VHS on mobile device other than iOS or Android',
    )
  })

  it('should fail if UFG_TriggerArea element could not be found- iOS', async () => {
    const mock = new MockDriver({
      device: {
        isNative: true,
      },
      platform: {
        name: 'iOS',
      },
    })
    const driver = new Driver({logger, spec, driver: mock})
    await driver.init()
    const [error] = await presult(takeVHSes({driver, logger}))
    expect(error).not.to.be.undefined
    expect(error.message).to.equal('Error while taking VHS - UFG_TriggerArea element could not be found')
  })

  it('should fail if UFG_TriggerArea element could not be found - Android ', async () => {
    const mock = new MockDriver({
      device: {
        isNative: true,
      },
      platform: {
        name: 'Android',
      },
    })
    const driver = new Driver({logger, spec, driver: mock})
    await driver.init()
    const [error] = await presult(takeVHSes({driver, logger}))
    expect(error).not.to.be.undefined
    expect(error.message).to.equal('Error while taking VHS - UFG_TriggerArea element could not be found')
  })
})
