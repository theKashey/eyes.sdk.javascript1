import {makeSDK} from '@applitools/eyes-sdk-core'
import * as spec from './spec-driver'
import {Driver, Element, Eyes, VisualGridRunner, ClassicRunner, ConfigurationPlain, TestResults} from './api'

if (!process.env.APPLITOOLS_WEBDRIVERIO_MAJOR_VERSION) {
  try {
    const {version} = require('webdriverio/package.json')
    const [major] = version.split('.', 1)
    process.env.APPLITOOLS_WEBDRIVERIO_MAJOR_VERSION = major
  } catch {
    // NOTE: ignore error
  }
}

// TODO have to be removed
const sdk = makeSDK({
  name: 'eyes-webdriverio-service',
  version: require('../package.json').version,
  spec,
  cwd: process.cwd(),
  VisualGridClient: require('@applitools/visual-grid-client'),
})
class EyesOverride extends Eyes {
  protected static readonly _spec = sdk
}

interface EyesServiceOptions extends ConfigurationPlain {
  useVisualGrid?: boolean
  concurrency?: number
  eyes?: EyesServiceOptions
}

class EyesService {
  private _eyes: Eyes
  private _appName: string
  private _testResults: TestResults

  constructor({useVisualGrid, concurrency, eyes, ...config}: EyesServiceOptions) {
    const wdioMajorVersion = Number(process.env.APPLITOOLS_WEBDRIVERIO_MAJOR_VERSION)
    config = wdioMajorVersion < 6 ? {...eyes} : config

    if (!useVisualGrid) config.hideScrollbars = true

    this._eyes = new EyesOverride(
      useVisualGrid ? new VisualGridRunner({testConcurrency: concurrency}) : new ClassicRunner(),
      config,
    )
  }
  beforeSession(config: Record<string, unknown>) {
    this._appName = this._eyes.configuration.appName
    if (config.enableEyesLogs) {
      this._eyes.configuration.logs = {type: 'console'}
    }
  }
  before() {
    browser.addCommand('getEyes', () => {
      return this._eyes
    })

    browser.addCommand('eyesCheck', async (title: string, checkSettings: any = {fully: true}) => {
      await this._eyesOpen()
      return this._eyes.check(title, checkSettings)
    })

    // deprecated, alias of eyesCheck
    browser.addCommand('eyesCheckWindow', async (...args: any[]) => {
      return (browser as any).eyesCheck(...args)
    })

    browser.addCommand('eyesSetScrollRootElement', (element: Element) => {
      this._eyes.getConfiguration().setScrollRootElement(element)
    })

    browser.addCommand('eyesAddProperty', (key: string, value: string) => {
      this._eyes.getConfiguration().addProperty(key, value)
    })

    browser.addCommand('eyesClearProperties', () => {
      this._eyes.getConfiguration().clearProperties()
    })

    browser.addCommand('eyesGetTestResults', async () => {
      // because `afterTest` executes after `afterEach`, this is the way to get results in `afterEach` or `it`
      await this._eyesClose()
      return this._testResults
    })

    browser.addCommand('eyesSetConfiguration', (configuration: ConfigurationPlain) => {
      return this._eyes.setConfiguration(configuration)
    })

    browser.addCommand('eyesGetIsOpen', () => {
      return this._eyes.getIsOpen()
    })

    browser.addCommand('eyesGetConfiguration', () => {
      return this._eyes.getConfiguration()
    })

    browser.addCommand('eyesGetAllTestResults', async (throwErr: boolean) => {
      return this._eyes.runner.getAllTestResults(throwErr)
    })
  }
  beforeTest(test: Record<string, string>) {
    const configuration = this._eyes.getConfiguration()
    configuration.setTestName(test.title ?? test.description) // test.title is for mocha, and test.description is for jasmine

    if (!this._appName) {
      configuration.setAppName(test.parent ?? (test.fullName?.replace(` ${test.description}`, '') || test.id)) // test.parent is for mocha, and test.id is for jasmine
    }

    if (!configuration.getViewportSize()) {
      configuration.setViewportSize({width: 800, height: 600})
    }
    this._eyes.setConfiguration(configuration)
  }
  async afterTest() {
    // the next line is required because if we set an element in one test, then the following test
    // will say that the element is not attached to the page (because different browsers are used)
    this._eyes.getConfiguration().setScrollRootElement(null)
    await this._eyesClose()
  }
  async after() {
    await this._eyes.runner.getAllTestResults(false)
    await this._eyes.abort()
  }

  async _eyesOpen() {
    if (!this._eyes.isOpen) {
      this._testResults = null
      await this._eyes.open(browser as Driver)
    }
  }

  async _eyesClose() {
    if (this._eyes.isOpen) {
      this._testResults = await this._eyes.close(false)
    }
  }
}

export = EyesService
