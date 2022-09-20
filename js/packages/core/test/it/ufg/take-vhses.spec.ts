import {makeDriver} from '@applitools/driver'
import {MockDriver, spec} from '@applitools/driver/fake'
import {makeLogger} from '@applitools/logger'
import {takeVHSes} from '../../../src/ufg/utils/take-vhses'
import assert from 'assert'

const logger = makeLogger()

describe('take-vhses', () => {
  it('should fail if driver is not Android or iOS', async () => {
    const mock = new MockDriver()
    const driver = await makeDriver({logger, spec, driver: mock})
    await assert.rejects(
      takeVHSes({driver, logger}),
      error => error.message === 'Error while taking VHS - cannot take VHS on mobile device other than iOS or Android',
    )
  })

  it('should fail if UFG_TriggerArea element could not be found- iOS', async () => {
    const mock = new MockDriver({
      device: {isNative: true},
      platform: {name: 'iOS'},
    })
    const driver = await makeDriver({logger, spec, driver: mock})
    await assert.rejects(takeVHSes({driver, logger}), error =>
      error.message.includes('Error while taking VHS - UFG_TriggerArea element could not be found'),
    )
  })

  it('should fail if UFG_TriggerArea element could not be found - Android ', async () => {
    const mock = new MockDriver({
      device: {isNative: true},
      platform: {name: 'Android'},
    })
    const driver = await makeDriver({logger, spec, driver: mock})
    await assert.rejects(takeVHSes({driver, logger}), error =>
      error.message.includes('Error while taking VHS - UFG_TriggerArea element could not be found'),
    )
  })
})
