import {MockDriver, spec} from '@applitools/driver/fake'
import {generateScreenshot} from '../../utils/generate-screenshot'
import {makeFakeCore} from '../../utils/fake-base-core'
import {makeCore} from '../../../src/classic/core'
import assert from 'assert'

describe('check', () => {
  let driver

  async function getDocumentElement() {
    return driver.findElement('html')
  }

  beforeEach(async () => {
    driver = new MockDriver()
    driver.takeScreenshot = generateScreenshot
    driver.mockElements([
      {
        selector: 'frame1',
        frame: true,
        children: [
          {
            selector: 'frame1-cors',
            frame: true,
            children: [{selector: 'element_cors'}],
          },
          {
            selector: 'frame1-2',
            frame: true,
            children: [
              {
                selector: 'frame1-2-3',
                frame: true,
                children: [{selector: 'element_3'}],
              },
            ],
          },
        ],
      },
    ])
  })

  it('preserves original frame after checking window', async function () {
    const core = await makeCore({spec, core: makeFakeCore()})
    const eyes = await core.openEyes({
      target: driver,
      settings: {serverUrl: 'server-url', apiKey: 'api-key', appName: 'app-name', testName: 'test-name'},
    })
    await driver.switchToFrame('frame1')

    const frameElementBeforeCheck = await getDocumentElement()
    await eyes.check()
    const frameElementAfterCheck = await getDocumentElement()

    assert.deepStrictEqual(frameElementAfterCheck, frameElementBeforeCheck)

    return eyes.close()
  })

  it('preserves original frame after checking nested frame', async function () {
    const core = await makeCore({spec, core: makeFakeCore()})
    const eyes = await core.openEyes({
      target: driver,
      settings: {serverUrl: 'server-url', apiKey: 'api-key', appName: 'app-name', testName: 'test-name'},
    })
    await driver.switchToFrame('frame1')

    const frameElementBeforeCheck = await getDocumentElement()
    await eyes.check({settings: {frames: ['frame1-2', 'frame1-2-3']}})
    const frameElementAfterCheck = await getDocumentElement()

    assert.deepStrictEqual(frameElementAfterCheck, frameElementBeforeCheck)

    return eyes.close()
  })

  it('preserves original frame after checking region within nested frame', async function () {
    const core = await makeCore({spec, core: makeFakeCore()})
    const eyes = await core.openEyes({
      target: driver,
      settings: {serverUrl: 'server-url', apiKey: 'api-key', appName: 'app-name', testName: 'test-name'},
    })
    await driver.switchToFrame('frame1')
    await driver.switchToFrame('frame1-2')
    await driver.switchToFrame('frame1-2-3')

    const frameElementBeforeCheck = await getDocumentElement()
    await eyes.check({settings: {region: 'element_3'}})
    const frameElementAfterCheck = await getDocumentElement()

    assert.deepStrictEqual(frameElementAfterCheck, frameElementBeforeCheck)

    return eyes.close()
  })

  it('preserves original frame after checking nested frame fully', async function () {
    const core = await makeCore({spec, core: makeFakeCore()})
    const eyes = await core.openEyes({
      target: driver,
      settings: {serverUrl: 'server-url', apiKey: 'api-key', appName: 'app-name', testName: 'test-name'},
    })
    await driver.switchToFrame('frame1')
    await driver.switchToFrame('frame1-2')

    const frameElementBeforeCheck = await getDocumentElement()
    await eyes.check({settings: {frames: ['frame1-2-3'], fully: true}})
    const frameElementAfterCheck = await getDocumentElement()

    assert.deepStrictEqual(frameElementAfterCheck, frameElementBeforeCheck)

    return eyes.close()
  })

  it('preserves original frame after checking region within cors frame', async function () {
    const core = await makeCore({spec, core: makeFakeCore()})
    const eyes = await core.openEyes({
      target: driver,
      settings: {serverUrl: 'server-url', apiKey: 'api-key', appName: 'app-name', testName: 'test-name'},
    })
    await driver.switchToFrame('frame1')
    await driver.switchToFrame('frame1-cors')

    const frameElementBeforeCheck = await getDocumentElement()
    await eyes.check({settings: {region: 'element_cors'}})
    const frameElementAfterCheck = await getDocumentElement()

    assert.deepStrictEqual(frameElementAfterCheck, frameElementBeforeCheck)

    return eyes.close()
  })
})
