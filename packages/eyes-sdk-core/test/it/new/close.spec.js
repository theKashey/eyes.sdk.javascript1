const assert = require('assert')
const assertRejects = require('assert-rejects')
const {startFakeEyesServer, getSession} = require('@applitools/sdk-fake-eyes-server')
const Logger = require('../../../lib/logging/Logger')
const {MockDriver, fake} = require('@applitools/driver')
const {generateScreenshot} = require('../../utils/FakeScreenshot')
const makeSDK = require('../../../lib/new/sdk')

describe('close', async () => {
  let server, serverUrl, driver, manager

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
    const core = new makeSDK({spec: fake.spec})
    server = await startFakeEyesServer({logger: new Logger(), matchMode: 'never'})
    serverUrl = `http://localhost:${server.port}`
    manager = await core.makeManager()
  })

  after(async () => {
    await server.close()
  })

  it('should not throw on close', async () => {
    const eyes = await manager.openEyes({driver, config: {appName: 'App', testName: 'Test', serverUrl}})
    await eyes.check()
    const testResults = await eyes.close({throwErr: false})

    assert.ok(Array.isArray(testResults))
  })

  it('should throw on close', async () => {
    const eyes = await manager.openEyes({driver, config: {appName: 'App', testName: 'Test', serverUrl}})
    await eyes.check()
    await assertRejects(eyes.close({throwErr: true}))
  })
})
