'use strict'

const {expect} = require('chai')
const assert = require('assert')
const {Console} = require('console')
const {Writable} = require('stream')
const chalk = require('chalk')
const {startFakeEyesServer} = require('@applitools/sdk-fake-eyes-server')
const {EyesVisualGrid} = require('../../utils/FakeSDK')
const {MockDriver} = require('@applitools/driver/fake')
const {generateDomSnapshot} = require('../../utils/FakeDomSnapshot')
const {Configuration} = require('../../../index')

describe('EyesVisualGrid', () => {
  describe('_takeDomSnapshot({breakpoints})', () => {
    let driver, server, eyes, output

    before(async () => {
      server = await startFakeEyesServer({
        logger: {log: () => {}},
        matchMode: 'always',
      })

      driver = new MockDriver({viewport: {width: 600, height: 700}})
      driver.mockScript('dom-snapshot', () => generateDomSnapshot(driver))
      driver.wrapMethod('setWindowRect', (method, driver, [rect]) => {
        if (!Number.isNaN(Number(rect.width))) {
          rect.width = Math.min(Math.max(rect.width, 300), 800)
        }
        if (!Number.isNaN(Number(rect.height))) {
          rect.height = Math.min(Math.max(rect.height, 500), 1000)
        }
        return method.call(driver, rect)
      })
    })

    after(async () => {
      await server.close()
    })

    beforeEach(async () => {
      eyes = new EyesVisualGrid()
      eyes.setServerUrl(`http://localhost:${server.port}`)

      output = []
      const stdout = new Writable({
        write(chunk, _encoding, callback) {
          output.push(chunk.toString())
          callback(null)
        },
      })
      global.originalConsole = global.console
      global.console = new Console({stdout})
    })

    afterEach(async () => {
      global.console = global.originalConsole
    })

    it('should warn if not able to resize to the configuration width', async () => {
      const config = new Configuration()
        .setAppName('appName')
        .setTestName('testName')
        .setViewportSize({width: 600, height: 700})
        .addBrowser({width: 200, height: 400, name: 'chrome'})
        .addBrowser({width: 700, height: 900, name: 'chrome'})
        .addBrowser({width: 1000, height: 1200, name: 'chrome'})

      await eyes.open(driver, config)
      await eyes.check({layoutBreakpoints: true})
      await eyes.close(false)
      const warns = [
        `The following configurations [(chrome)] have a viewport-width of 200 pixels, while your local browser has a limit of 300 pixels, so the SDK couldn't resize it to the desired size. As a fallback, the resources that will be used for these checkpoints have been captured on the browser's limit (300 pixels). To resolve this, you may use a headless browser as it can be resized to any size.`,
        `The following configurations [(chrome)] have a viewport-width of 1000 pixels, while your local browser has a limit of 800 pixels, so the SDK couldn't resize it to the desired size. As a fallback, the resources that will be used for these checkpoints have been captured on the browser's limit (800 pixels). To resolve this, you may use a headless browser as it can be resized to any size.`,
      ]
      warns.forEach((warn, index) => {
        assert.strictEqual(output[index], chalk.yellow(warn) + '\n')
      })
    })

    it('should warn if not able to resize to the breakpoint width', async () => {
      const config = new Configuration()
        .setAppName('appName')
        .setTestName('testName')
        .setViewportSize({width: 600, height: 700})
        .addBrowser({width: 200, height: 400, name: 'chrome'})
        .addBrowser({width: 700, height: 900, name: 'chrome'})
        .addBrowser({width: 1000, height: 1200, name: 'chrome'})
      await eyes.open(driver, config)
      await eyes.check({layoutBreakpoints: [200, 700, 1000]})
      await eyes.close(false)
      const warns = [
        `One of the configured layout breakpoints is 200 pixels, while your local browser has a limit of 300, so the SDK couldn't resize it to the desired size. As a fallback, the resources that will be used for the following configurations: [(chrome, 200)] have been captured on the browser's limit (300 pixels). To resolve this, you may use a headless browser as it can be resized to any size.`,
        `One of the configured layout breakpoints is 1000 pixels, while your local browser has a limit of 800, so the SDK couldn't resize it to the desired size. As a fallback, the resources that will be used for the following configurations: [(chrome, 1000)] have been captured on the browser's limit (800 pixels). To resolve this, you may use a headless browser as it can be resized to any size.`,
      ]
      warns.forEach((warn, index) => {
        assert.strictEqual(output[index], chalk.yellow(warn) + '\n')
      })
    })

    it('warn if device is smaller than the smallest breakpoint', async () => {
      const config = new Configuration()
        .setAppName('appName')
        .setTestName('testName')
        .setViewportSize({width: 600, height: 700})
        .addBrowser({width: 300, height: 400, name: 'chrome'})
        .addBrowser({width: 350, height: 400, name: 'chrome'})
        .addBrowser({width: 700, height: 900, name: 'chrome'})
      await eyes.open(driver, config)
      await eyes.check({layoutBreakpoints: [400, 500]})
      await eyes.close(false)
      const warns = [
        `The following configuration's viewport-widths are smaller than the smallest configured layout breakpoint (400 pixels): [(chrome, 300), (chrome, 350)]. As a fallback, the resources that will be used for these configurations have been captured on a viewport-width of 400 - 1 pixels. If an additional layout breakpoint is needed for you to achieve better results - please add it to your configuration.`,
      ]
      warns.forEach((warn, index) => {
        assert.strictEqual(output[index], chalk.yellow(warn) + '\n')
      })
    })
  })

  describe('check userTestId', () => {
    let server, serverUrl, driver, eyes

    before(async () => {
      server = await startFakeEyesServer({
        logger: {log: () => {}},
        matchMode: 'always',
      })
      serverUrl = `http://localhost:${server.port}`
    })

    beforeEach(async () => {
      driver = new MockDriver()
      driver.mockScript('dom-snapshot', () => generateDomSnapshot(driver))
      eyes = new EyesVisualGrid()
      eyes.setServerUrl(serverUrl)
    })

    after(async () => {
      await server.close()
    })
    it('should generate userTestId if not defined', async () => {
      const userTestIdBeforeOpen = eyes.getConfiguration().getUserTestId()
      const config = new Configuration()
        .setAppName('appName')
        .setTestName('testName')
        .addBrowser({width: 888, height: 666, name: 'chrome'})
      await eyes.open(driver, config)
      const userTestIdAfterOpen = eyes.getConfiguration().getUserTestId()
      await eyes.check()
      await eyes.close()
      expect(userTestIdBeforeOpen).to.be.undefined
      expect(userTestIdAfterOpen).to.not.be.undefined
    })

    it('should not override userTestId', async () => {
      const userTestId = 'A_123456_B'
      const config = new Configuration()
        .setAppName('appName')
        .setTestName('testName')
        .addBrowser({width: 888, height: 666, name: 'chrome'})
        .setUserTestId(userTestId)
      await eyes.open(driver, config)
      const userTestIdAfterOpen = eyes.getConfiguration().getUserTestId()
      await eyes.check()
      await eyes.close()
      expect(userTestId).to.equal(userTestIdAfterOpen)
    })

    it('should keep generated userTestId in TestResults and in TestResultsContainer', async () => {
      const config = new Configuration()
        .setAppName('appName')
        .setTestName('testName')
        .addBrowser({width: 888, height: 666, name: 'chrome'})
      await eyes.open(driver, config)
      await eyes.check()
      const results = await eyes.close(false)
      const resultsContainer = await eyes.getRunner().getAllTestResults(false)
      expect(results[0].userTestId).to.not.be.undefined
      expect(resultsContainer[0].userTestId).to.not.be.undefined
    })

    it('should keep preset userTestId in TestResults and in TestResultsContainer', async () => {
      const userTestId = 'A_123456_B'
      const config = new Configuration()
        .setAppName('appName')
        .setTestName('testName')
        .addBrowser({width: 888, height: 666, name: 'chrome'})
        .setUserTestId(userTestId)
      await eyes.open(driver, config)
      await eyes.check()
      const results = await eyes.close(false)
      const resultsContainer = await eyes.getRunner().getAllTestResults(false)
      expect(results[0].userTestId).to.equal(userTestId)
      expect(resultsContainer[0].userTestId).to.equal(userTestId)
    })
  })
})
