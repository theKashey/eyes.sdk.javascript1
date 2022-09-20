import {makeCore} from '../../src/core'
import {generateScreenshot} from '../utils/generate-screenshot'
import {MockDriver, spec} from '@applitools/driver/fake'
import {makeFakeCore} from '../utils/fake-base-core'
import assert from 'assert'

describe('close', async () => {
  let driver, core

  before(async () => {
    driver = new MockDriver()
    driver.takeScreenshot = generateScreenshot
    driver.mockElements([
      {selector: 'element0', rect: {x: 1, y: 2, width: 500, height: 501}},
      {selector: 'element1', rect: {x: 10, y: 11, width: 101, height: 102}},
      {selector: 'element2', rect: {x: 20, y: 21, width: 201, height: 202}},
      {selector: 'element3', rect: {x: 30, y: 31, width: 301, height: 302}},
      {selector: 'element4', rect: {x: 40, y: 41, width: 401, height: 402}},
    ])

    const fakeCore = makeFakeCore()
    core = makeCore({spec, core: fakeCore})
  })

  it('should not throw on close', async () => {
    const eyes = await core.openEyes({target: driver, settings: {appName: 'App', testName: 'Test'}})
    await eyes.check({settings: {name: 'diff'}})
    const results = await eyes.close({settings: {throwErr: false}})
    assert.ok(Array.isArray(results))
  })

  it('should throw on close', async () => {
    const eyes = await core.openEyes({target: driver, settings: {appName: 'App', testName: 'Test'}})
    await eyes.check({settings: {name: 'diff'}})
    await assert.rejects(eyes.close({settings: {throwErr: true}}))
  })
})
