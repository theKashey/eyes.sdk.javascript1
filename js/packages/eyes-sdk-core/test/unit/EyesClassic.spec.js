'use strict'

const {expect} = require('chai')
const assert = require('assert')
const {startFakeEyesServer} = require('@applitools/sdk-fake-eyes-server')
const {MockDriver} = require('@applitools/driver/fake')
const {EyesClassic} = require('../utils/FakeSDK')
const {generateScreenshot} = require('../utils/FakeScreenshot')

describe('EyesClassic', () => {
  let server, serverUrl, driver, eyes

  before(async () => {
    driver = new MockDriver()
    driver.takeScreenshot = generateScreenshot
    eyes = new EyesClassic()
    server = await startFakeEyesServer({logger: {log: () => {}}, matchMode: 'always'})
    serverUrl = `http://localhost:${server.port}`
    eyes.setServerUrl(serverUrl)
  })

  describe('#close()', () => {
    after(async () => {
      await server.close()
    })
    it('should throw if an internal exception happened during close(false)', async () => {
      eyes._serverConnector.stopSession = () => Promise.reject('some error')
      eyes.setMatchTimeout(0)
      await eyes.open(driver, 'FakeApp', 'FakeTest')
      await eyes.check()
      await assert.rejects(eyes.close(false), /^some error$/)
    })
  })

  describe('should work wait before viewport screenshot after setWaitBeforeScreenshots', () => {
    let checkTimestamp, networkTimestamp, duration, eyes

    const thrownScreenshotDone = Symbol()
    before(async () => {
      eyes = new Proxy(new EyesClassic(), {
        get(target, key, receiver) {
          if (key === 'checkWindowBase') {
            checkTimestamp = Date.now()
          } else if (key === '_ensureRunningSession') {
            networkTimestamp = Date.now()
          } else if (key === 'getScreenshot') {
            const screenshotTimestamp = Date.now()
            duration = screenshotTimestamp - checkTimestamp - (screenshotTimestamp - networkTimestamp)
            throw thrownScreenshotDone
          }
          return Reflect.get(target, key, receiver)
        },
      })
      await eyes.open(driver, 'FakeApp', 'FakeTest')
    })

    afterEach(() => {
      eyes._configuration.setWaitBeforeScreenshots(undefined)
    })

    it('should wait specified amount of time', async () => {
      const delay = 500
      try {
        eyes._configuration.setWaitBeforeScreenshots(delay)
        await eyes.check()
      } catch (caught) {
        if (caught === thrownScreenshotDone) {
          assert(duration >= delay && duration <= delay + 50)
        } else {
          assert.fail()
        }
      }
    })

    it('should wait default amount of time set null', async () => {
      const delay = eyes._configuration.getWaitBeforeScreenshots()
      try {
        eyes._configuration.setWaitBeforeScreenshots(null)
        await eyes.check()
      } catch (caught) {
        if (caught === thrownScreenshotDone) {
          assert(duration >= delay && duration <= delay + 10)
        } else {
          assert.fail()
        }
      }
    })
  })

  describe('check userTestId', () => {
    beforeEach(async () => {
      driver = new MockDriver()
      driver.takeScreenshot = generateScreenshot
      eyes = new EyesClassic()
      server = await startFakeEyesServer({logger: {log: () => {}}, matchMode: 'always'})
      serverUrl = `http://localhost:${server.port}`
      eyes.setServerUrl(serverUrl)
    })
    afterEach(async () => {
      await server.close()
    })

    it('should generate userTestId if not defined', async () => {
      const userTestIdBeforeOpen = eyes._configuration.getUserTestId()
      await eyes.open(driver, 'FakeApp', 'FakeTest')
      const userTestIdAfterOpen = eyes._configuration.getUserTestId()
      await eyes.check()
      await eyes.close(false)
      expect(userTestIdBeforeOpen).to.be.undefined
      expect(userTestIdAfterOpen).to.not.be.undefined
    })

    it('should not override userTestId', async () => {
      const userTestId = 'A_123456_B'
      eyes._configuration.setUserTestId(userTestId)
      await eyes.open(driver, 'FakeApp', 'FakeTest')
      const userTestIdAfterOpen = eyes._configuration.getUserTestId()
      await eyes.check()
      await eyes.close(false)
      expect(userTestId).to.equal(userTestIdAfterOpen)
    })

    it('should have generated userTestId in TestResults and in TestResultsContainer', async () => {
      await eyes.open(driver, 'FakeApp', 'FakeTest')
      await eyes.check()
      const results = await eyes.close(false)
      const resultsContainer = await eyes.getRunner().getAllTestResults(false)
      expect(results[0].userTestId).to.not.be.undefined
      expect(resultsContainer[0].userTestId).to.not.be.undefined
    })

    it('should keep preset userTestId in TestResults and in TestResultsContainer', async () => {
      const userTestId = 'A_123456_B'
      eyes._configuration.setUserTestId(userTestId)
      await eyes.open(driver, 'FakeApp', 'FakeTest')
      await eyes.check()
      const results = await eyes.close(false)
      const resultsContainer = await eyes.getRunner().getAllTestResults(false)
      expect(results[0].userTestId).to.equal(userTestId)
      expect(resultsContainer[0].userTestId).to.equal(userTestId)
    })
  })
})
