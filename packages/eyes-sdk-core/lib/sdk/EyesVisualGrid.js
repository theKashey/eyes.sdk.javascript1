const utils = require('@applitools/utils')
const {Driver} = require('@applitools/driver')
const BrowserType = require('../config/BrowserType')
const Configuration = require('../config/Configuration')
const TypeUtils = require('../utils/TypeUtils')
const GeneralUtils = require('../utils/GeneralUtils')
const ArgumentGuard = require('../utils/ArgumentGuard')
const TestResultsFormatter = require('../TestResultsFormatter')
const CorsIframeHandler = require('../capture/CorsIframeHandler')
const CorsIframeHandles = require('../capture/CorsIframeHandles')
const VisualGridRunner = require('../runner/VisualGridRunner')
const takeDomSnapshots = require('../utils/takeDomSnapshots')
const EyesCore = require('./EyesCore')
const CheckSettingsUtils = require('./CheckSettingsUtils')

class EyesVisualGrid extends EyesCore {
  static specialize({agentId, spec, VisualGridClient}) {
    return class extends EyesVisualGrid {
      static get spec() {
        return spec
      }
      static get VisualGridClient() {
        return VisualGridClient
      }
      get spec() {
        return spec
      }
      getBaseAgentId() {
        return agentId
      }
    }
  }

  constructor(serverUrl, isDisabled, runner = new VisualGridRunner()) {
    super(serverUrl, isDisabled)
    /** @private */
    this._runner = runner
    this._runner.attachEyes(this, this._serverConnector)
    this._runner.makeGetVisualGridClient(this.constructor.VisualGridClient.makeVisualGridClient)

    /** @private @type {boolean} */
    this._isOpen = false
    /** @private @type {boolean} */
    this._isVisualGrid = true
    /** @private @type {CorsIframeHandle} */
    this._corsIframeHandle = CorsIframeHandles.BLANK

    /** @private */
    this._checkWindowCommand = undefined
    /** @private */
    this._closeCommand = undefined
    /** @private */
    this._abortCommand = undefined

    /** @private @type {Promise<void>} */
    this._closePromise = Promise.resolve()
  }

  async open(driver, optArg1, optArg2, optArg3, optArg4) {
    ArgumentGuard.notNull(driver, 'driver')

    this._driver = await new Driver({spec: this.spec, driver, logger: this._logger._getNewLogger()}).init()
    this._context = this._driver.currentContext

    if (optArg1 instanceof Configuration) {
      this._configuration.mergeConfig(optArg1)
    } else {
      this._configuration.setAppName(TypeUtils.getOrDefault(optArg1, this._configuration.getAppName()))
      this._configuration.setTestName(TypeUtils.getOrDefault(optArg2, this._configuration.getTestName()))
      this._configuration.setViewportSize(TypeUtils.getOrDefault(optArg3, this._configuration.getViewportSize()))
      this._configuration.setSessionType(TypeUtils.getOrDefault(optArg4, this._configuration.getSessionType()))
    }

    ArgumentGuard.notNull(this._configuration.getAppName(), 'appName')
    ArgumentGuard.notNull(this._configuration.getTestName(), 'testName')

    const browsersInfo = this._configuration.getBrowsersInfo()
    if (!this._configuration.getViewportSize() && browsersInfo && browsersInfo.length > 0) {
      const browserInfo = browsersInfo.find(browserInfo => browserInfo.width)
      if (browserInfo) {
        this._configuration.setViewportSize({width: browserInfo.width, height: browserInfo.height})
      }
    }

    if (!this._configuration.getViewportSize()) {
      const vs = await this._driver.getViewportSize()
      this._configuration.setViewportSize(vs)
    }

    if (!browsersInfo || browsersInfo.length === 0) {
      const vs = this._configuration.getViewportSize()
      this._configuration.addBrowser(vs.getWidth(), vs.getHeight(), BrowserType.CHROME)
    }

    const {
      openEyes,
      getResourceUrlsInCache,
      getIosDevicesSizes,
      getEmulatedDevicesSizes,
    } = await this._runner.getVisualGridClientWithCache({
      logger: this._logger,
      agentId: this.getFullAgentId(),
      apiKey: this._configuration.getApiKey(),
      showLogs: this._configuration.getShowLogs(),
      proxy: this._configuration.getProxy(),
      serverUrl: this._configuration.getServerUrl(),
      concurrency: this._runner.legacyConcurrency || this._configuration.getConcurrentSessions(),
      testConcurrency: this._runner.testConcurrency,
    })

    if (this._configuration.getViewportSize()) {
      const vs = this._configuration.getViewportSize()
      await this.setViewportSize(vs)
    }

    const openParams = this._configuration.toOpenEyesConfiguration()
    const {checkWindow, close, abort} = await openEyes({
      ...openParams,
      agentRunId: `${openParams.testName}--${GeneralUtils.randomAlphanumeric(10)}`,
    })

    this._isOpen = true
    this._checkWindowCommand = checkWindow
    this._closeCommand = close
    this._abortCommand = abort
    this._getResourceUrlsInCache = getResourceUrlsInCache
    this._getIosDevicesSizes = getIosDevicesSizes
    this._getEmulatedDevicesSizes = getEmulatedDevicesSizes
  }

  async _check(checkSettings, closeAfterMatch = false, throwEx = true) {
    this._logger.verbose(
      `check started with tag "${checkSettings.name}" for test "${this._configuration.getTestName()}"`,
    )

    return this._checkPrepare(checkSettings, async () => {
      const {persistedCheckSettings, cleanupPersistance} = await CheckSettingsUtils.toPersistedCheckSettings({
        checkSettings,
        context: this._context,
        logger: this._logger,
      })

      try {
        const browsers = this._configuration.getBrowsersInfo()
        const breakpoints = TypeUtils.getOrDefault(
          checkSettings.layoutBreakpoints,
          this._configuration.getLayoutBreakpoints(),
        )
        const disableBrowserFetching = TypeUtils.getOrDefault(
          checkSettings.disableBrowserFetching,
          this._configuration.getDisableBrowserFetching(),
        )
        const showLogs = this._configuration.getShowLogs()
        const snapshots = await takeDomSnapshots({
          browsers,
          breakpoints,
          disableBrowserFetching,
          driver: this._driver,
          logger: this._logger,
          skipResources: this._getResourceUrlsInCache(),
          getViewportSize: () => this.getViewportSize().then(rectangleSize => rectangleSize.toJSON()),
          getEmulatedDevicesSizes: this._getEmulatedDevicesSizes,
          getIosDevicesSizes: this._getIosDevicesSizes,
          showLogs,
        })
        const [{url}] = snapshots
        if (this.getCorsIframeHandle() === CorsIframeHandles.BLANK) {
          snapshots.forEach(CorsIframeHandler.blankCorsIframeSrcOfCdt)
        }

        const config = CheckSettingsUtils.toCheckWindowConfiguration({
          checkSettings: persistedCheckSettings,
          configuration: this._configuration,
        })

        return await this._checkWindowCommand({
          ...config,
          closeAfterMatch,
          throwEx,
          snapshot: snapshots,
          url,
        })
      } finally {
        await cleanupPersistance()
      }
    })
  }

  async _checkPrepare(checkSettings, operation) {
    this._context = await this._driver.refreshContexts()
    await this._context.main.setScrollingElement(this._scrollRootElement)
    await this._context.setScrollingElement(checkSettings.scrollRootElement)
    const originalContext = this._context
    if (checkSettings.frames && checkSettings.frames.length > 0) {
      this._context = await this._context.context(
        checkSettings.frames.reduce(
          (parent, frame) => ({
            reference: utils.types.has(frame, 'frame') ? frame.frame : frame,
            scrollingElement: frame.scrollRootElement,
            parent,
          }),
          null,
        ),
      )
      await this._context.focus()
    }
    try {
      return await operation()
    } finally {
      this._context = await originalContext.focus()
    }
  }

  async getScreenshot() {
    return undefined
  }

  async close() {
    let isErrorCaught = false
    this._closePromise = this._closeCommand(true)
      .catch(err => {
        isErrorCaught = true
        return err
      })
      .then(results => {
        this._isOpen = false
        if (isErrorCaught) {
          const error = TypeUtils.isArray(results) ? results.find(result => result instanceof Error) : results
          if (!error.info || !error.info.testResult) throw error
        }
        return results.map(result => (result instanceof Error ? result.info.testResult : result.toJSON()))
      })
      .then(results => {
        if (this._runner) {
          this._runner._allTestResult.push(...results)
        }
        return results
      })

    return this._closePromise
  }

  async closeAndPrintResults(throwEx = true) {
    const results = await this.close(throwEx)

    const testResultsFormatter = new TestResultsFormatter(results)
    // eslint-disable-next-line no-console
    console.log(testResultsFormatter.asFormatterString())
  }

  async abort() {
    this._isOpen = false
    return this._abortCommand()
  }

  async getInferredEnvironment() {
    return undefined
  }
}
module.exports = EyesVisualGrid
