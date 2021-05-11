import * as utils from '@applitools/utils'
import * as logger from '@applitools/logger'
import SessionType from './enums/SessionType'
import StitchMode from './enums/StitchMode'
import MatchLevel from './enums/MatchLevel'
import TestResultsStatus from './enums/TestResultsStatus'
import EyesError from './errors/EyesError'
import NewTestError from './errors/NewTestError'
import DiffsFoundError from './errors/DiffsFoundError'
import TestFailedError from './errors/TestFailedError'
import {CheckSettings, CheckSettingsFluent} from './input/CheckSettings'
import {OCRSettings} from './input/OCRSettings'
import {VisualLocatorSettings} from './input/VisualLocatorSettings'
import {ProxySettings, ProxySettingsData} from './input/ProxySettings'
import {Configuration, ConfigurationData} from './input/Configuration'
import {BatchInfo, BatchInfoData} from './input/BatchInfo'
import {RectangleSize, RectangleSizeData} from './input/RectangleSize'
import {Region} from './input/Region'
import {OCRRegion} from './input/OCRRegion'
import {ImageRotation, ImageRotationData} from './input/ImageRotation'
import {CutProviderData} from './input/CutProvider'
import {LogHandlerData, FileLogHandlerData, ConsoleLogHandlerData, NullLogHandlerData} from './input/LogHandler'
import {MatchResult, MatchResultData} from './output/MatchResult'
import {TestResults, TestResultsData} from './output/TestResults'
import {TestResultsSummary} from './output/TestResultsSummary'
import {ValidationInfo} from './output/ValidationInfo'
import {ValidationResult} from './output/ValidationResult'
import {SessionEventHandler, SessionEventHandlers, RemoteSessionEventHandler} from './SessionEventHandlers'
import {RunnerConfiguration, EyesRunner, ClassicRunner} from './Runners'
import {Logger} from './Logger'

type EyesCommands<TElement = unknown, TSelector = unknown> = {
  check(options: {
    settings?: CheckSettings<TElement, TSelector>
    config?: Configuration<TElement, TSelector>
  }): Promise<MatchResult>
  locate<TLocator extends string>(options: {
    settings: VisualLocatorSettings<TLocator>
    config?: Configuration<TElement, TSelector>
  }): Promise<{[key in TLocator]: Region[]}>
  extractTextRegions<TPattern extends string>(options: {
    settings: OCRSettings<TPattern>
    config?: Configuration<TElement, TSelector>
  }): Promise<{[key in TPattern]: string[]}>
  extractText(options: {
    regions: OCRRegion<TElement, TSelector>[]
    config?: Configuration<TElement, TSelector>
  }): Promise<string[]>
  close(): Promise<TestResults>
  abort(): Promise<TestResults>
}

type EyesController<TDriver = unknown, TElement = unknown, TSelector = unknown> = {
  open: (options: {
    driver: TDriver
    config?: Configuration<TElement, TSelector>
    logger?: logger.Logger
    on?: (event: string, data?: Record<string, any>) => any
  }) => Promise<EyesCommands<TElement, TSelector>>
  getResults: () => Promise<TestResultsSummary>
}

type EyesSpec<TDriver = unknown, TElement = unknown, TSelector = unknown> = {
  isDriver(value: any): value is TDriver
  isElement(value: any): value is TElement
  isSelector(value: any): value is TSelector
  makeEyes(config?: RunnerConfiguration): EyesController<TDriver, TElement, TSelector>
  getViewportSize(driver: TDriver): Promise<RectangleSize>
  setViewportSize(driver: TDriver, viewportSize: RectangleSize): Promise<void>
  closeBatch(options: {batchId: string; serverUrl?: string; apiKey?: string; proxy?: ProxySettings}): Promise<void>
  deleteTestResults(results: TestResults): Promise<void>
}

export class Eyes<TDriver = unknown, TElement = unknown, TSelector = unknown> {
  protected static readonly _spec: EyesSpec
  protected readonly _spec: EyesSpec<TDriver, TElement, TSelector>

  private _logger: Logger
  private _config: ConfigurationData<TElement, TSelector>
  private _runner: EyesRunner
  private _driver: TDriver
  private _commands: EyesCommands<TElement, TSelector>
  private _events: Map<string, Set<(...args: any[]) => any>> = new Map()
  private _handlers: SessionEventHandlers = new SessionEventHandlers()

  static async setViewportSize(driver: unknown, viewportSize: RectangleSize) {
    await this._spec.setViewportSize(driver, viewportSize)
  }

  constructor(runner?: EyesRunner, config?: Configuration<TElement, TSelector>)
  constructor(config?: Configuration<TElement, TSelector>, runner?: EyesRunner)
  constructor(
    runnerOrConfig?: EyesRunner | Configuration<TElement, TSelector>,
    configOrRunner?: Configuration<TElement, TSelector> | EyesRunner,
  ) {
    if (utils.types.instanceOf(runnerOrConfig, EyesRunner)) {
      this._runner = runnerOrConfig
      this._config = new ConfigurationData(configOrRunner as Configuration<TElement, TSelector>)
    } else if (utils.types.instanceOf(configOrRunner, EyesRunner)) {
      this._runner = configOrRunner
      this._config = new ConfigurationData(runnerOrConfig as Configuration<TElement, TSelector>)
    } else {
      this._runner = new ClassicRunner()
      this._config = new ConfigurationData(runnerOrConfig as Configuration<TElement, TSelector>)
    }
    this._runner.attach(this, config => this._spec.makeEyes(config))
    this._handlers.attach(this)
    this._logger = new Logger({...this._config.logs, label: 'Eyes API'})
  }

  get logger() {
    return this._logger
  }
  getLogger(): Logger {
    return this._logger
  }

  get runner() {
    return this._runner
  }
  getRunner(): EyesRunner {
    return this._runner
  }

  get driver(): TDriver {
    return this._driver
  }
  getDriver(): TDriver {
    return this._driver
  }

  get configuration(): Configuration<TElement, TSelector> {
    return this._config
  }
  set configuration(config: Configuration<TElement, TSelector>) {
    this._config = new ConfigurationData(config)
  }
  getConfiguration(): ConfigurationData<TElement, TSelector> {
    return this._config
  }
  setConfiguration(config: Configuration<TElement, TSelector>) {
    this._config = new ConfigurationData(config)
  }

  get isOpen(): boolean {
    return Boolean(this._commands)
  }
  getIsOpen(): boolean {
    return this.isOpen
  }

  /** @undocumented */
  on(handler: (event: string, data?: Record<string, any>) => any): () => void
  /** @undocumented */
  on(event: 'setSizeWillStart', handler: (data: {viewportSize: RectangleSize}) => any): () => void
  /** @undocumented */
  on(event: 'setSizeEnded', handler: () => any): () => void
  /** @undocumented */
  on(event: 'initStarted', handler: () => any): () => void
  /** @undocumented */
  on(event: 'initEnded', handler: () => any): () => void
  /** @undocumented */
  on(event: 'testStarted', handler: (data: {sessionId: string}) => any): () => void
  /** @undocumented */
  on(
    event: 'validationWillStart',
    handler: (data: {sessionId: string; validationInfo: ValidationInfo}) => any,
  ): () => void
  /** @undocumented */
  on(
    event: 'validationEnded',
    handler: (data: {sessionId: string; validationId: number; validationResult: ValidationResult}) => any,
  ): () => void
  /** @undocumented */
  on(event: 'testEnded', handler: (data: {sessionId: string; testResults: TestResults}) => any): () => void
  on(event: string | ((...args: any[]) => any), handler?: (...args: any[]) => any): () => void {
    if (utils.types.isFunction(event)) [handler, event] = [event, '*']

    let handlers = this._events.get(event)
    if (!handlers) {
      handlers = new Set()
      this._events.set(event, handlers)
    }
    handlers.add(handler)
    return () => handlers.delete(handler)
  }

  /** @undocumented */
  off(event: string): void
  /** @undocumented */
  off(handler: (...args: any[]) => any): void
  off(eventOrHandler: string | ((...args: any[]) => any)): void {
    if (utils.types.isString(eventOrHandler)) {
      this._events.delete(eventOrHandler)
    } else {
      this._events.forEach(handlers => handlers.delete(eventOrHandler))
    }
  }

  async open(driver: TDriver, config?: Configuration): Promise<TDriver>
  async open(
    driver: TDriver,
    appName?: string,
    testName?: string,
    viewportSize?: RectangleSize,
    sessionType?: SessionType,
  ): Promise<TDriver>
  async open(
    driver: TDriver,
    configOrAppName?: Configuration | string,
    testName?: string,
    viewportSize?: RectangleSize,
    sessionType?: SessionType,
  ): Promise<TDriver> {
    this._driver = driver

    if (this._config.isDisabled) return driver

    const config = this._config.toJSON()
    if (utils.types.instanceOf(configOrAppName, ConfigurationData)) {
      Object.assign(config, configOrAppName.toJSON())
    } else if (utils.types.isObject(configOrAppName)) {
      Object.assign(config, configOrAppName)
    } else if (utils.types.isString(configOrAppName)) {
      config.appName = configOrAppName
    }
    if (utils.types.isString(testName)) config.testName = testName
    if (utils.types.has(viewportSize, ['width', 'height'])) config.viewportSize = viewportSize
    if (utils.types.isEnumValue(sessionType, SessionType)) config.sessionType = sessionType

    this._commands = await this._runner.open({
      driver,
      config,
      logger: this._logger,
      on: (name: string, data?: Record<string, any>) => {
        const globalHandlers = this._events.get('*')
        if (globalHandlers) globalHandlers.forEach(async handler => handler(name, data))
        const namedHandlers = this._events.get(name)
        if (namedHandlers) namedHandlers.forEach(async handler => handler(data))
      },
    })

    return this._driver
  }

  /** @deprecated */
  async checkWindow(name?: string, timeout?: number, fully = false) {
    return this.check({name, timeout, fully})
  }
  /** @deprecated */
  async checkFrame(element: TElement | TSelector | string | number, timeout?: number, name?: string) {
    return this.check({name, frames: [element], timeout, fully: true})
  }
  /** @deprecated */
  async checkElement(element: TElement, timeout?: number, name?: string) {
    return this.check({name, region: element, timeout, fully: true})
  }
  /** @deprecated */
  async checkElementBy(selector: TSelector, timeout?: number, name?: string) {
    return this.check({name, region: selector, timeout, fully: true})
  }
  /** @deprecated */
  async checkRegion(region?: Region, name?: string, timeout?: number) {
    return this.check({name, region, timeout})
  }
  /** @deprecated */
  async checkRegionByElement(element: TElement, name?: string, timeout?: number) {
    return this.check({name, region: element, timeout})
  }
  /** @deprecated */
  async checkRegionBy(selector: TSelector, name?: string, timeout?: number, fully = false) {
    return this.check({name, region: selector, timeout, fully})
  }
  /** @deprecated */
  async checkRegionInFrame(
    frame: TElement | TSelector | string | number,
    selector: TSelector,
    timeout?: number,
    name?: string,
    fully = false,
  ) {
    return this.check({name, region: selector, frames: [frame], timeout, fully})
  }
  async check(name: string, checkSettings: CheckSettingsFluent<TElement, TSelector>): Promise<MatchResultData>
  async check(checkSettings?: CheckSettings<TElement, TSelector>): Promise<MatchResultData>
  async check(
    checkSettingsOrName?: CheckSettings<TElement, TSelector> | CheckSettingsFluent<TElement, TSelector> | string,
    checkSettings?: CheckSettings<TElement, TSelector> | CheckSettingsFluent<TElement, TSelector>,
  ): Promise<MatchResultData> {
    if (this._config.isDisabled) return null
    if (!this.isOpen) throw new EyesError('Eyes not open')

    let settings
    if (utils.types.isString(checkSettingsOrName)) {
      utils.guard.notNull(checkSettings, {name: 'checkSettings'})
      settings = utils.types.instanceOf(checkSettings, CheckSettingsFluent)
        ? checkSettings.name(checkSettingsOrName).toJSON()
        : {...checkSettings, name: checkSettingsOrName}
    } else {
      settings = utils.types.instanceOf(checkSettingsOrName, CheckSettingsFluent)
        ? checkSettingsOrName.toJSON()
        : {...checkSettingsOrName}
    }

    const result = await this._commands.check({settings, config: this._config.toJSON()})

    return new MatchResultData(result)
  }

  async locate<TLocator extends string>(
    settings: VisualLocatorSettings<TLocator>,
  ): Promise<{[key in TLocator]: Region[]}> {
    if (this._config.isDisabled) return null
    if (!this.isOpen) throw new EyesError('Eyes not open')

    return this._commands.locate({settings, config: this._config.toJSON()})
  }

  async extractTextRegions<TPattern extends string>(
    settings: OCRSettings<TPattern>,
  ): Promise<{[key in TPattern]: string[]}> {
    if (this._config.isDisabled) return null
    if (!this.isOpen) throw new EyesError('Eyes not open')

    return this._commands.extractTextRegions({settings, config: this._config.toJSON()})
  }

  async extractText(regions: OCRRegion<TElement, TSelector>[]): Promise<string[]> {
    if (this._config.isDisabled) return null
    if (!this.isOpen) throw new EyesError('Eyes not open')

    return this._commands.extractText({regions, config: this._config.toJSON()})
  }

  async close(throwErr = true): Promise<TestResultsData> {
    if (this._config.isDisabled) return null
    if (!this.isOpen) throw new EyesError('Eyes not open')
    const results = new TestResultsData(await this._commands.close(), results => this._spec.deleteTestResults(results))
    this._commands = null
    if (throwErr) {
      if (results.status === TestResultsStatus.Unresolved) {
        if (results.isNew) throw new NewTestError(results)
        else throw new DiffsFoundError(results)
      } else if (results.status === TestResultsStatus.Failed) {
        throw new TestFailedError(results)
      }
    }
    return results
  }
  /** @deprecated */
  async closeAsync(): Promise<void> {
    await this.close(false)
  }

  async abort(): Promise<TestResultsData> {
    if (!this.isOpen || this._config.isDisabled) return null
    const results = new TestResultsData(await this._commands.abort(), results => this._spec.deleteTestResults(results))
    this._commands = null
    return results
  }
  /** @deprecated */
  async abortAsync(): Promise<void> {
    await this.abort()
  }
  /** @deprecated */
  async abortIfNotClosed(): Promise<TestResults> {
    return this.abort()
  }

  // #region CONFIG

  async getViewportSize(): Promise<RectangleSizeData> {
    return this._config.getViewportSize() || new RectangleSizeData(await this._spec.getViewportSize(this._driver))
  }
  async setViewportSize(viewportSize: RectangleSize): Promise<void> {
    utils.guard.notNull(viewportSize, {name: 'viewportSize'})

    if (!this._driver) {
      this._config.setViewportSize(viewportSize)
    } else {
      try {
        await this._spec.setViewportSize(this._driver, viewportSize)
        this._config.setViewportSize(viewportSize)
      } catch (err) {
        this._config.setViewportSize(await this._spec.getViewportSize(this._driver))
        throw new TestFailedError('Failed to set the viewport size')
      }
    }
  }

  getScrollRootElement(): TElement | TSelector {
    return this._config.getScrollRootElement()
  }
  setScrollRootElement(scrollRootElement: TElement | TSelector) {
    this._config.setScrollRootElement(scrollRootElement)
  }

  setLogHandler(handler: LogHandlerData) {
    this._config.setLogHandler(handler)
  }
  getLogHandler(): LogHandlerData {
    const handler = this._config.getLogHandler()
    if (!handler) {
      return new NullLogHandlerData()
    } else if (!utils.types.has(handler, 'type')) {
      return handler as LogHandlerData
    } else if (handler.type === 'file') {
      return new FileLogHandlerData(true, handler.filename, handler.append)
    } else if (handler.type === 'console') {
      return new ConsoleLogHandlerData(true)
    }
  }

  setCutProvider(cutProvider: CutProviderData) {
    this._config.setCut(cutProvider)
  }
  setImageCut(cutProvider: CutProviderData) {
    this.setCutProvider(cutProvider)
  }
  getIsCutProviderExplicitlySet() {
    return Boolean(this._config.getCut())
  }

  getRotation(): ImageRotationData {
    return this._config.getRotation()
  }
  setRotation(rotation: ImageRotation | ImageRotationData) {
    this._config.setRotation(rotation)
  }

  getScaleRatio(): number {
    return this._config.getScaleRatio()
  }
  setScaleRatio(scaleRatio: number) {
    this._config.setScaleRatio(scaleRatio)
  }

  getSaveDebugScreenshots(): boolean {
    return this._config.getSaveDebugScreenshots()
  }
  setSaveDebugScreenshots(save: boolean) {
    this._config.setSaveDebugScreenshots(save)
  }
  getDebugScreenshotsPath() {
    return this._config.getDebugScreenshotsPath()
  }
  setDebugScreenshotsPath(path: string) {
    this._config.setDebugScreenshotsPath(path)
  }
  getDebugScreenshotsPrefix() {
    return this._config.getDebugScreenshotsPrefix()
  }
  setDebugScreenshotsPrefix(prefix: string) {
    this._config.setDebugScreenshotsPrefix(prefix)
  }

  addProperty(name: string, value: string) {
    return this._config.addProperty(name, value)
  }
  clearProperties() {
    return this._config.setProperties([])
  }

  getBatch(): BatchInfoData {
    return this._config.getBatch()
  }
  setBatch(batch: BatchInfo): void
  setBatch(name: string, id?: string, startedAt?: Date | string): void
  setBatch(batchOrName: BatchInfo | string, id?: string, startedAt?: Date | string) {
    if (utils.types.isString(batchOrName)) {
      this._config.setBatch({name: batchOrName, id, startedAt: new Date(startedAt)})
    } else {
      this._config.setBatch(batchOrName)
    }
  }

  getApiKey(): string {
    return this._config.getApiKey()
  }
  setApiKey(apiKey: string) {
    this._config.setApiKey(apiKey)
  }

  getTestName(): string {
    return this._config.getTestName()
  }
  setTestName(testName: string) {
    this._config.setTestName(testName)
  }

  getAppName(): string {
    return this._config.getAppName()
  }
  setAppName(appName: string) {
    this._config.setAppName(appName)
  }

  getBaselineBranchName(): string {
    return this._config.getBaselineBranchName()
  }
  setBaselineBranchName(baselineBranchName: string) {
    this._config.setBaselineBranchName(baselineBranchName)
  }

  /** @deprecated */
  getBaselineName(): string {
    return this.getBaselineEnvName()
  }
  /** @deprecated */
  setBaselineName(baselineName: string) {
    this.setBaselineEnvName(baselineName)
  }
  getBaselineEnvName(): string {
    return this._config.getBaselineEnvName()
  }
  setBaselineEnvName(baselineEnvName: string) {
    this._config.setBaselineEnvName(baselineEnvName)
  }

  getBranchName(): string {
    return this._config.getBranchName()
  }
  setBranchName(branchName: string) {
    this._config.setBranchName(branchName)
  }

  getHostApp(): string {
    return this._config.getHostApp()
  }
  setHostApp(hostApp: string) {
    this._config.setHostApp(hostApp)
  }

  getHostOS(): string {
    return this._config.getHostOS()
  }
  setHostOS(hostOS: string) {
    this._config.setHostOS(hostOS)
  }

  getHostAppInfo(): string {
    return this._config.getHostAppInfo()
  }
  setHostAppInfo(hostAppInfo: string) {
    this._config.setHostAppInfo(hostAppInfo)
  }

  getHostOSInfo(): string {
    return this._config.getHostOSInfo()
  }
  setHostOSInfo(hostOSInfo: string) {
    this._config.setHostOSInfo(hostOSInfo)
  }

  getDeviceInfo(): string {
    return this._config.getDeviceInfo()
  }
  setDeviceInfo(deviceInfo: string) {
    this._config.setDeviceInfo(deviceInfo)
  }

  setIgnoreCaret(ignoreCaret: boolean) {
    this._config.setIgnoreCaret(ignoreCaret)
  }
  getIgnoreCaret(): boolean {
    return this._config.getIgnoreCaret()
  }

  getIsDisabled(): boolean {
    return this._config.getIsDisabled()
  }
  setIsDisabled(isDisabled: boolean) {
    this._config.setIsDisabled(isDisabled)
  }

  getMatchLevel(): MatchLevel {
    return this._config.getMatchLevel()
  }
  setMatchLevel(matchLevel: MatchLevel) {
    this._config.setMatchLevel(matchLevel)
  }

  getMatchTimeout(): number {
    return this._config.getMatchTimeout()
  }
  setMatchTimeout(matchTimeout: number) {
    this._config.setMatchTimeout(matchTimeout)
  }

  getParentBranchName(): string {
    return this._config.getParentBranchName()
  }
  setParentBranchName(parentBranchName: string) {
    this._config.setParentBranchName(parentBranchName)
  }

  setProxy(proxy: ProxySettings): void
  setProxy(url: string, username?: string, password?: string, isHttpOnly?: boolean): void
  setProxy(isEnabled: false): void
  setProxy(
    proxyOrUrlOrIsDisabled: ProxySettings | string | false,
    username?: string,
    password?: string,
    isHttpOnly?: boolean,
  ) {
    this._config.setProxy(proxyOrUrlOrIsDisabled as string, username, password, isHttpOnly)
    return this
  }
  getProxy(): ProxySettingsData {
    return this._config.getProxy()
  }

  getSaveDiffs(): boolean {
    return this._config.saveDiffs
  }
  setSaveDiffs(saveDiffs: boolean) {
    this._config.saveDiffs = saveDiffs
  }

  getSaveNewTests(): boolean {
    return this._config.saveNewTests
  }
  setSaveNewTests(saveNewTests: boolean) {
    this._config.saveNewTests = saveNewTests
  }

  getServerUrl(): string {
    return this._config.getServerUrl()
  }
  setServerUrl(serverUrl: string) {
    this._config.setServerUrl(serverUrl)
  }

  getSendDom(): boolean {
    return this._config.getSendDom()
  }
  setSendDom(sendDom: boolean) {
    this._config.setSendDom(sendDom)
  }

  getHideCaret(): boolean {
    return this._config.getHideCaret()
  }
  setHideCaret(hideCaret: boolean) {
    this._config.setHideCaret(hideCaret)
  }

  getHideScrollbars(): boolean {
    return this._config.getHideScrollbars()
  }
  setHideScrollbars(hideScrollbars: boolean) {
    this._config.setHideScrollbars(hideScrollbars)
  }

  getForceFullPageScreenshot(): boolean {
    return this._config.getForceFullPageScreenshot()
  }
  setForceFullPageScreenshot(forceFullPageScreenshot: boolean) {
    this._config.setForceFullPageScreenshot(forceFullPageScreenshot)
  }

  getWaitBeforeScreenshots(): number {
    return this._config.getWaitBeforeScreenshots()
  }
  setWaitBeforeScreenshots(waitBeforeScreenshots: number) {
    this._config.setWaitBeforeScreenshots(waitBeforeScreenshots)
  }

  getStitchMode(): StitchMode {
    return this._config.getStitchMode()
  }
  setStitchMode(stitchMode: StitchMode) {
    this._config.setStitchMode(stitchMode)
  }

  getStitchOverlap(): number {
    return this._config.getStitchOverlap()
  }
  setStitchOverlap(stitchOverlap: number) {
    this._config.setStitchOverlap(stitchOverlap)
  }

  /**
   * @undocumented
   * @deprecated
   */
  getSessionEventHandlers(): SessionEventHandlers {
    return this._handlers
  }
  /**
   * @undocumented
   * @deprecated
   */
  addSessionEventHandler(handler: SessionEventHandler) {
    if (handler instanceof RemoteSessionEventHandler) {
      this._config.setRemoteEvents(handler.toJSON())
    } else {
      this._handlers.addEventHandler(handler)
    }
  }
  /**
   * @undocumented
   * @deprecated
   */
  removeSessionEventHandler(handler: SessionEventHandler) {
    if (handler instanceof RemoteSessionEventHandler) {
      this._config.setRemoteEvents(null)
    } else {
      this._handlers.removeEventHandler(handler)
    }
  }
  /**
   * @undocumented
   * @deprecated
   */
  clearSessionEventHandlers() {
    return this._handlers.clearEventHandlers()
  }

  // #endregion
}
