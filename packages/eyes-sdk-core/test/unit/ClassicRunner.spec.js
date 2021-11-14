const {MockDriver} = require('@applitools/driver/fake')
const {startFakeEyesServer} = require('@applitools/sdk-fake-eyes-server')
const {generateScreenshot} = require('../utils/FakeScreenshot')
const {EyesClassic} = require('../utils/FakeSDK')

describe('ClassicRunner', () => {
  let server, serverUrl, driver, eyes

  before(async () => {
    driver = new MockDriver()
    driver.takeScreenshot = generateScreenshot
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

  it("getAllTestResults shouldn't throw exception", async () => {
    await eyes.check({})
    await eyes.close(false)

    const throwEx = false
    await eyes.getRunner().getAllTestResults(throwEx)
  })
})
