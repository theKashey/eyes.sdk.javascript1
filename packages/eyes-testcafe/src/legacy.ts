import type {Driver, Element, Selector} from './spec-driver'
import * as utils from '@applitools/utils'
import * as api from '@applitools/eyes-api'
import * as fs from 'fs'
import * as path from 'path'
import * as spec from './spec-driver'
import {ConfigUtils, TestResultsFormatter} from '@applitools/eyes-sdk-core'

export interface LegacyTestCafeEyes<TDriver, TSelector> {
  open(options: {t: TDriver} & TestCafeConfiguration): Promise<TDriver>
  checkWindow(settings: TestCafeCheckSettings<TSelector>): Promise<api.MatchResult>
  waitForResults(throwErr: boolean): Promise<api.TestResultsSummary>
}

export interface LegacyTestCafeEyesConstructor<TDriver, TElement, TSelector>
  extends Pick<typeof api.Eyes, keyof typeof api.Eyes> {
  new (runner?: api.EyesRunner, config?: api.ConfigurationPlain<TElement, TSelector>): api.Eyes<
    TDriver,
    TElement,
    TSelector
  > &
    LegacyTestCafeEyes<TDriver, TSelector>
  new (config?: api.ConfigurationPlain<TElement, TSelector>, runner?: api.EyesRunner): api.Eyes<
    TDriver,
    TElement,
    TSelector
  > &
    LegacyTestCafeEyes<TDriver, TSelector>
  new (options: {configPath: string; runner?: api.EyesRunner}): api.Eyes<TDriver, TElement, TSelector> &
    LegacyTestCafeEyes<TDriver, TSelector>
}

export function LegacyTestCafeEyesMixin<TDriver extends Driver, TElement extends Element, TSelector extends Selector>(
  Eyes: typeof api.Eyes,
): LegacyTestCafeEyesConstructor<TDriver, TElement, TSelector> {
  return class TestCafeEyes
    extends Eyes<TDriver, TElement, TSelector>
    implements LegacyTestCafeEyes<TDriver, TSelector> {
    private _testcafeConfig: TestCafeConfiguration

    constructor(runner?: api.EyesRunner, config?: api.ConfigurationPlain<TElement, TSelector>)
    constructor(config?: api.ConfigurationPlain<TElement, TSelector>, runner?: api.EyesRunner)
    constructor(options?: {configPath: string; runner?: api.EyesRunner})
    constructor(
      runnerOrConfigOrOptions?:
        | api.EyesRunner
        | api.ConfigurationPlain<TElement, TSelector>
        | {configPath: string; runner?: api.EyesRunner},
      configOrRunner?: api.ConfigurationPlain<TElement, TSelector> | api.EyesRunner,
    ) {
      if (utils.types.isNull(runnerOrConfigOrOptions) || utils.types.has(runnerOrConfigOrOptions, 'configPath')) {
        const testcafeConfig = ConfigUtils.getConfig({configPath: runnerOrConfigOrOptions?.configPath})
        const runner =
          runnerOrConfigOrOptions?.runner ??
          new api.VisualGridRunner({testConcurrency: testcafeConfig.concurrency ?? testcafeConfig.testConcurrency ?? 1})
        super(runner, transformConfig(testcafeConfig))
        testcafeConfig.failTestcafeOnDiff ??= true
        this._testcafeConfig = testcafeConfig
      } else {
        super(runnerOrConfigOrOptions as api.EyesRunner, configOrRunner as api.ConfigurationPlain<TElement, TSelector>)
      }
    }

    async open(driver: TDriver, config?: api.ConfigurationPlain<Element, Selector>): Promise<TDriver>
    async open(
      driver: TDriver,
      appName?: string,
      testName?: string,
      viewportSize?: api.RectangleSizePlain,
      sessionType?: api.SessionType,
    ): Promise<TDriver>
    async open(options: {t: TDriver} & TestCafeConfiguration): Promise<TDriver>
    async open(
      driverOrOptions: TDriver | ({t: TDriver} & TestCafeConfiguration),
      configOrAppName?: api.ConfigurationPlain<Element, Selector> | string,
      testName?: string,
      viewportSize?: api.RectangleSizePlain,
      sessionType?: api.SessionType,
    ): Promise<TDriver> {
      let driver, config
      if (utils.types.has(driverOrOptions, 't')) {
        const {t, ...testcafeConfig} = driverOrOptions
        this._testcafeConfig = {...this._testcafeConfig, ...testcafeConfig}
        driver = t
        config = transformConfig(this._testcafeConfig)
      } else {
        driver = driverOrOptions
        config = configOrAppName
      }
      // driver health check, re: https://trello.com/c/xNCZNfPi
      await spec
        .executeScript(driver, () => true)
        .catch(() => {
          throw new Error(
            `The browser is in an invalid state due to JS errors on the page that TestCafe is unable to handle. Try running the test with TestCafe's --skip-js-errors option enabled: https://devexpress.github.io/testcafe/documentation/reference/configuration-file.html#skipjserrors`,
          )
        })

      return super.open(driver, config as string, testName, viewportSize, sessionType)
    }

    async checkWindow(name?: string, timeout?: number, fully?: boolean): Promise<api.MatchResult>
    async checkWindow(settings: TestCafeCheckSettings<TSelector>): Promise<api.MatchResult>
    async checkWindow(
      nameOrSetting?: string | TestCafeCheckSettings<TSelector>,
      timeout?: number,
      fully = true,
    ): Promise<api.MatchResult> {
      if (utils.types.isObject(nameOrSetting)) {
        return super.check(transformCheckSettings<TElement, TSelector>(nameOrSetting))
      }
      return super.checkWindow(nameOrSetting, timeout, fully)
    }

    async close(throwErr = true): Promise<api.TestResults> {
      return super.close(throwErr && Boolean(this._testcafeConfig?.failTestcafeOnDiff))
    }

    async waitForResults(throwErr = true) {
      const resultsSummary = await this.runner.getAllTestResults(
        throwErr && Boolean(this._testcafeConfig?.failTestcafeOnDiff),
      )
      if (this._testcafeConfig?.tapDirPath) {
        const results = resultsSummary.getAllResults().map(r => r.getTestResults())
        const includeSubTests = false
        const markNewAsPassed = true
        const formatted = new TestResultsFormatter(results).asHierarchicTAPString(includeSubTests, markNewAsPassed)
        fs.writeFileSync(path.resolve(this._testcafeConfig.tapDirPath, 'eyes.tap'), formatted)
      }
      return resultsSummary
    }
  }
}

type RegionReference<TSelector> = api.RegionPlain | TSelector | {selector: TSelector}

type FloatingRegionReference<TSelector> = RegionReference<TSelector> & {
  maxUpOffset?: number
  maxDownOffset?: number
  maxLeftOffset?: number
  maxRightOffset?: number
}

type AccessibilityRegionReference<TSelector> = RegionReference<TSelector> & {
  accessibilityType: api.AccessibilityRegionType
}

export type TestCafeCheckSettings<TSelector> = {
  tag?: string
  target?: 'window' | 'region'
  fully?: boolean
  selector?: TSelector
  region?: api.RegionPlain
  ignore?: RegionReference<TSelector> | RegionReference<TSelector>[]
  floating?: FloatingRegionReference<TSelector> | FloatingRegionReference<TSelector>[]
  layout?: RegionReference<TSelector> | RegionReference<TSelector>[]
  content?: RegionReference<TSelector> | RegionReference<TSelector>[]
  strict?: RegionReference<TSelector> | RegionReference<TSelector>[]
  accessibility?: AccessibilityRegionReference<TSelector> | AccessibilityRegionReference<TSelector>[]
  scriptHooks?: {beforeCaptureScreenshot: string}
  sendDom?: boolean
  ignoreDisplacements?: boolean
}

export type TestCafeConfiguration = {
  appName?: string
  testName?: string
  browser?:
    | api.DesktopBrowserInfo
    | api.ChromeEmulationInfo
    | api.IOSDeviceInfo
    | (api.DesktopBrowserInfo | api.ChromeEmulationInfo | api.IOSDeviceInfo)[]
  batchId?: string
  batchName?: string
  batchSequenceName?: string
  batchSequence?: string
  baselineEnvName?: string
  envName?: string
  proxy?: string | api.ProxySettingsPlain
  ignoreCaret?: boolean
  matchLevel?: api.MatchLevel
  baselineBranchName?: string
  baselineBranch?: string
  parentBranchName?: string
  parentBranch?: string
  branchName?: string
  branch?: string
  saveDiffs?: boolean
  saveFailedTests?: boolean
  saveNewTests?: boolean
  properties?: {name: string; value: any}[]
  compareWithParentBranch?: boolean
  ignoreBaseline?: boolean
  accessibilityValidation?: api.AccessibilitySettings
  notifyOnCompletion?: boolean
  batchNotify?: boolean
  isDisabled?: boolean
  ignoreDisplacements?: boolean
  concurrency?: number
  failTestcafeOnDiff?: boolean
  tapDirPath?: string
}

export function transformConfig<TElement, TSelector>(
  options: TestCafeConfiguration,
): api.ConfigurationPlain<TElement, TSelector> {
  const config: api.ConfigurationPlain<TElement, TSelector> = {...(options as any)}
  if (options.concurrency) config.concurrentSessions = options.concurrency
  if (options.envName) config.environmentName = options.envName
  if (options.browser) config.browsersInfo = utils.types.isArray(options.browser) ? options.browser : [options.browser]
  if (
    options.batchId ||
    options.batchName ||
    options.notifyOnCompletion ||
    process.env.APPLITOOLS_NOTIFY_ON_COMPLETION
  ) {
    config.batch = {
      id: options.batchId,
      name: options.batchName,
      notifyOnCompletion: options.notifyOnCompletion || !!process.env.APPLITOOLS_NOTIFY_ON_COMPLETION,
    }
  }
  if (options.matchLevel || options.ignoreCaret || options.ignoreDisplacements || options.accessibilityValidation) {
    config.defaultMatchSettings = {
      ignoreCaret: options.ignoreCaret,
      matchLevel: options.matchLevel,
      ignoreDisplacements: options.ignoreDisplacements,
      accessibilitySettings: options.accessibilityValidation,
    }
  }
  if (utils.types.isString(options.proxy)) config.proxy = {url: options.proxy}
  return config
}

export function transformCheckSettings<TElement, TSelector>(
  options: TestCafeCheckSettings<TSelector>,
): api.CheckSettingsPlain<TElement, TSelector> {
  const settings: api.CheckSettingsPlain<TElement, TSelector> = {...options}
  settings.name = options.tag
  settings.hooks = options.scriptHooks
  settings.fully = options.fully ?? options.target !== 'region'
  if (options.target && options.target === 'region' && options.selector) {
    settings.region = options.selector
  }
  if (options.accessibility) {
    const accessibilityRegions = utils.types.isArray(options.accessibility)
      ? options.accessibility
      : [options.accessibility]
    settings.accessibilityRegions = <any>accessibilityRegions.map(accessibilityRegion => {
      const {accessibilityType, ...region} = accessibilityRegion
      if (utils.types.has(region, 'selector') && !utils.types.has(region, 'type')) {
        return {region: region.selector, accessibilityType}
      } else {
        return {region, accessibilityType}
      }
    })
  }
  if (options.floating) {
    const floatingRegions = utils.types.isArray(options.floating) ? options.floating : [options.floating]
    settings.floatingRegions = <any>floatingRegions.map(floatingRegion => {
      const {maxUpOffset, maxDownOffset, maxLeftOffset, maxRightOffset, ...region} = floatingRegion
      if (utils.types.has(region, 'selector') && !utils.types.has(region, 'type')) {
        return {maxUpOffset, maxDownOffset, maxLeftOffset, maxRightOffset, region: region.selector}
      } else {
        return {maxUpOffset, maxDownOffset, maxLeftOffset, maxRightOffset, region}
      }
    })
  }
  if (options.ignore) {
    const ignoreRegions = utils.types.isArray(options.ignore) ? options.ignore : [options.ignore]
    settings.ignoreRegions = <any>ignoreRegions.map(region => {
      if (utils.types.has(region, 'selector') && !utils.types.has(region, 'type')) {
        return region.selector
      } else {
        return region
      }
    })
  }
  if (options.layout) {
    const layoutRegions = utils.types.isArray(options.layout) ? options.layout : [options.layout]
    settings.layoutRegions = <any>layoutRegions.map(region => {
      if (utils.types.has(region, 'selector') && !utils.types.has(region, 'type')) {
        return region.selector
      } else {
        return region
      }
    })
  }
  if (options.strict) {
    const strictRegions = utils.types.isArray(options.strict) ? options.strict : [options.strict]
    settings.strictRegions = <any>strictRegions.map(region => {
      if (utils.types.has(region, 'selector') && !utils.types.has(region, 'type')) {
        return region.selector
      } else {
        return region
      }
    })
  }
  if (options.content) {
    const contentRegions = utils.types.isArray(options.content) ? options.content : [options.content]
    settings.contentRegions = <any>contentRegions.map(region => {
      if (utils.types.has(region, 'selector') && !utils.types.has(region, 'type')) {
        return region.selector
      } else {
        return region
      }
    })
  }

  return settings
}
