const assert = require('assert')
const {startFakeEyesServer} = require('@applitools/sdk-fake-eyes-server')
const {MockDriver} = require('@applitools/driver/fake')
const {EyesClassic} = require('../utils/FakeSDK')
const {generateScreenshot} = require('../utils/FakeScreenshot')

describe('MarkScrollRootElement', () => {
  let server, serverUrl, driver, eyes

  before(async () => {
    driver = new MockDriver()
    driver.takeScreenshot = generateScreenshot
    driver.mockElement('scroll-root-element')
    eyes = new EyesClassic()
    server = await startFakeEyesServer({logger: {log: () => {}}, matchMode: 'never'})
    serverUrl = `http://localhost:${server.port}`
    eyes.setServerUrl(serverUrl)
  })

  beforeEach(async () => {
    await eyes.open(driver, 'FakeApp', 'FakeTest')
  })

  afterEach(async () => {
    await eyes.abort()
  })

  after(async () => {
    await server.close()
  })

  it('scroll root element is marked', async () => {
    const scrollRootElement = await driver.findElement('scroll-root-element')
    await eyes.check({scrollRootElement, fully: true})
    await eyes.close(false)
    assert.ok(scrollRootElement.attrs['data-applitools-scroll'])
  })
})
