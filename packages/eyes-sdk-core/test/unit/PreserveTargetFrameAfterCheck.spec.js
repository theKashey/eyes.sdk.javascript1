const assert = require('assert')
const {startFakeEyesServer} = require('@applitools/sdk-fake-eyes-server')
const {MockDriver} = require('@applitools/driver/fake')
const {EyesClassic} = require('../utils/FakeSDK')
const {generateScreenshot} = require('../utils/FakeScreenshot')

describe('PreserveCheckSettingsFrameAfterCheck', () => {
  let server, serverUrl, driver, eyes

  async function getDocumentElement() {
    return driver.findElement('html')
  }

  before(async () => {
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
    eyes = new EyesClassic()
    server = await startFakeEyesServer({logger: {log: () => {}}, matchMode: 'always'})
    serverUrl = `http://localhost:${server.port}`
    eyes.setServerUrl(serverUrl)
  })

  beforeEach(async () => {
    await driver.switchToFrame(null)
  })

  afterEach(async () => {
    await eyes.abort()
  })

  after(async () => {
    await server.close()
  })

  it('CheckWindow_UnwrappedDriver', async function() {
    await eyes.open(driver, 'FakeApp', 'FakeTest')
    await driver.switchToFrame('frame1')

    const frameElementBeforeCheck = await getDocumentElement()
    await eyes.check()
    const frameElementAfterCheck = await getDocumentElement()

    assert.deepStrictEqual(frameElementAfterCheck, frameElementBeforeCheck)

    return eyes.close()
  })

  it('CheckNestedFrame_UnwrappedDriver', async function() {
    await eyes.open(driver, 'FakeApp', 'FakeTest')
    await driver.switchToFrame('frame1')

    const frameElementBeforeCheck = await getDocumentElement()
    await eyes.check({frames: ['frame1-2', 'frame1-2-3']})
    const frameElementAfterCheck = await getDocumentElement()

    assert.deepStrictEqual(frameElementAfterCheck, frameElementBeforeCheck)

    return eyes.close()
  })

  it('CheckRegionInsideFrameBySelector_UnwrappedDriver', async function() {
    await eyes.open(driver, 'FakeApp', 'FakeTest')
    await driver.switchToFrame('frame1')
    await driver.switchToFrame('frame1-2')
    await driver.switchToFrame('frame1-2-3')

    const frameElementBeforeCheck = await getDocumentElement()
    await eyes.check({region: 'element_3'})
    const frameElementAfterCheck = await getDocumentElement()

    assert.deepStrictEqual(frameElementAfterCheck, frameElementBeforeCheck)

    return eyes.close()
  })

  it('CheckRegionInsideFrameByElement_UnwrappedDriver', async function() {
    await eyes.open(driver, 'FakeApp', 'FakeTest')
    await driver.switchToFrame('frame1')
    await driver.switchToFrame('frame1-2')
    await driver.switchToFrame('frame1-2-3')

    const element = await driver.findElement('element_3')

    const frameElementBeforeCheck = await getDocumentElement()
    await eyes.check({region: element})
    const frameElementAfterCheck = await getDocumentElement()

    assert.deepStrictEqual(frameElementAfterCheck, frameElementBeforeCheck)

    return eyes.close()
  })

  it('CheckFrameFully_UnwrappedDriver', async function() {
    await eyes.open(driver, 'FakeApp', 'FakeTest')
    await driver.switchToFrame('frame1')
    await driver.switchToFrame('frame1-2')

    const frameElementBeforeCheck = await getDocumentElement()
    await eyes.check({frame: ['frame1-2-3'], fully: true})
    const frameElementAfterCheck = await getDocumentElement()

    assert.deepStrictEqual(frameElementAfterCheck, frameElementBeforeCheck)

    return eyes.close()
  })

  it('CheckCORSFrameRegionBySelector_UnwrappedDriver', async function() {
    await eyes.open(driver, 'FakeApp', 'FakeTest')
    await driver.switchToFrame('frame1')
    await driver.switchToFrame('frame1-cors')

    const frameElementBeforeCheck = await getDocumentElement()
    await eyes.check({region: 'element_cors'})
    const frameElementAfterCheck = await getDocumentElement()

    assert.deepStrictEqual(frameElementAfterCheck, frameElementBeforeCheck)

    return eyes.close()
  })

  it('CheckCORSFrameRegionByElement_UnwrappedDriver', async function() {
    await eyes.open(driver, 'FakeApp', 'FakeTest')
    await driver.switchToFrame('frame1')
    await driver.switchToFrame('frame1-cors')

    const element = await driver.findElement('element_cors')

    const frameElementBeforeCheck = await getDocumentElement()
    await eyes.check({region: element})
    const frameElementAfterCheck = await getDocumentElement()

    assert.deepStrictEqual(frameElementAfterCheck, frameElementBeforeCheck)

    return eyes.close()
  })
})
