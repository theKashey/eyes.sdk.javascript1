import {makeCore} from '../../src/core'
import {makeFakeCore} from '../utils/fake-base-core'
import {generateScreenshot} from '../utils/generate-screenshot'
import {MockDriver, spec} from '@applitools/driver/fake'
import assert from 'assert'

describe('check', () => {
  let driver

  beforeEach(() => {
    driver = new MockDriver()
    driver.takeScreenshot = generateScreenshot
    driver.mockElement('element0')
  })

  it("throws error when check region by selector that doesn't exist", async () => {
    const fakeCore = makeFakeCore()
    const core = makeCore({spec, core: fakeCore})
    const eyes = await core.openEyes({
      target: driver,
      settings: {appName: 'app-name', testName: 'test-name'},
    })
    await assert.rejects(eyes.check({settings: {region: 'element that does not exist'}}), error => {
      return error.message === 'Element not found!'
    })
  })

  it("doesn't throw when check with ignore region by selector that doesn't exist", async () => {
    const fakeCore = makeFakeCore()
    const core = makeCore({spec, core: fakeCore})
    const eyes = await core.openEyes({
      target: driver,
      settings: {appName: 'app-name', testName: 'test-name'},
    })
    await eyes.check({
      settings: {ignoreRegions: ['element that does not exist']},
    })
    await eyes.close()
  })
})
