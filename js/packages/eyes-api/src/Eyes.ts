import * as utils from '@applitools/utils'
import {CoreSpec, CoreEyes, CoreTargetImage} from './Core'
import {EyesSelector} from './input/EyesSelector'
import {SessionType, SessionTypeEnum} from './enums/SessionType'
import {StitchMode, StitchModeEnum} from './enums/StitchMode'
import {MatchLevel, MatchLevelEnum} from './enums/MatchLevel'
import {EyesError} from './errors/EyesError'
import {NewTestError} from './errors/NewTestError'
import {DiffsFoundError} from './errors/DiffsFoundError'
import {TestFailedError} from './errors/TestFailedError'
import {
  CheckSettingsAutomation,
  CheckSettingsAutomationFluent,
  CheckSettingsImage,
  CheckSettingsImageFluent,
} from './input/CheckSettings'
import {Image} from './input/Image'
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
import {
  LogHandlerData,
  FileLogHandlerData,
  ConsoleLogHandlerData,
  NullLogHandlerData,
  LogHandler,
} from './input/LogHandler'
import {TextRegion} from './output/TextRegion'
import {MatchResultData} from './output/MatchResult'
import {TestResults, TestResultsData} from './output/TestResults'
import {ValidationInfo} from './output/ValidationInfo'
import {ValidationResult} from './output/ValidationResult'
import {SessionEventHandler, SessionEventHandlers, RemoteSessionEventHandler} from './SessionEventHandlers'
import {EyesRunner, ClassicRunner} from './Runners'
import {Logger} from './Logger'

export class Eyes<TDriver = unknown, TElement = unknown, TSelector = unknown> {
  protected static readonly _spec: CoreSpec
  protected get _spec(): CoreSpec<TDriver, TElement, TSelector> {
    return (this.constructor as typeof Eyes)._spec as CoreSpec<TDriver, TElement, TSelector>
  }

  private _logger: Logger
  private _config: ConfigurationData<TElement, TSelector>
  private _state: {appName?: string} = {}
  private _runner: EyesRunner
  private _driver: TDriver
  private _eyes: CoreEyes<TDriver, TElement, TSelector>
  private _events: Map<string, Set<(...args: any[]) => any>> = new Map()
  private _handlers: SessionEventHandlers = new SessionEventHandlers()

  static async setViewportSize(driver: unknown, size: RectangleSize) {
    await this._spec.setViewportSize({target: driver, size})
  }

  constructor(runner?: EyesRunner, config?: Configuration<TElement, TSelector>)
  constructor(config?: Configuration<TElement, TSelector>)
  constructor(
    runnerOrConfig?: EyesRunner | Configuration<TElement, TSelector>,
    config?: Configuration<TElement, TSelector>,
  ) {
    if (utils.types.instanceOf(runnerOrConfig, EyesRunner)) {
      this._runner = runnerOrConfig
      this._config = new ConfigurationData(config, this._spec)
    } else {
      this._runner = new ClassicRunner()
      this._config = new ConfigurationData(runnerOrConfig ?? config, this._spec)
    }

    this._runner.attach(this, this._spec)
    this._handlers.attach(this)
    this._logger = new Logger({label: 'Eyes API'})
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
    this._config = new ConfigurationData(config, this._spec)
  }
  getConfiguration(): ConfigurationData<TElement, TSelector> {
    return this._config
  }
  setConfiguration(config: Configuration<TElement, TSelector>) {
    this._config = new ConfigurationData(config, this._spec)
  }

  get isOpen(): boolean {
    return Boolean(this._eyes)
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

  async open(driver: TDriver, config?: Configuration<TElement, TSelector>): Promise<TDriver>
  async open(
    driver: TDriver,
    appName?: string,
    testName?: string,
    viewportSize?: RectangleSize,
    sessionType?: SessionType,
  ): Promise<TDriver>
  async open(config?: Configuration<TElement, TSelector>): Promise<void>
  async open(
    appName?: string,
    testName?: string,
    viewportSize?: RectangleSize,
    sessionType?: SessionType,
  ): Promise<void>
  async open(
    driverOrConfigOrAppName?: TDriver | Configuration<TElement, TSelector> | string,
    configOrAppNameOrTestName?: Configuration<TElement, TSelector> | string,
    testNameOrViewportSize?: string | RectangleSize,
    viewportSizeOrSessionType?: RectangleSize | SessionType,
    sessionType?: SessionType,
  ): Promise<TDriver | void> {
    if (this._config.isDisabled) return this._driver
    const config = this._config.toJSON()

    if (this._spec.isDriver?.(driverOrConfigOrAppName)) {
      this._driver = driverOrConfigOrAppName
    } else {
      sessionType = viewportSizeOrSessionType as SessionType
      viewportSizeOrSessionType = testNameOrViewportSize as RectangleSize
      testNameOrViewportSize = configOrAppNameOrTestName as string
      configOrAppNameOrTestName = driverOrConfigOrAppName
    }

    if (utils.types.instanceOf(configOrAppNameOrTestName, ConfigurationData)) {
      const transformedConfig = configOrAppNameOrTestName.toJSON()
      config.open = {...config.open, ...transformedConfig.open}
      config.screenshot = {...config.screenshot, ...transformedConfig.screenshot}
      config.check = {...config.check, ...transformedConfig.check}
      config.close = {...config.close, ...transformedConfig.close}
    } else if (utils.types.isObject(configOrAppNameOrTestName)) {
      const transformedConfig = new ConfigurationData(configOrAppNameOrTestName, this._spec).toJSON()
      config.open = {...config.open, ...transformedConfig.open}
      config.screenshot = {...config.screenshot, ...transformedConfig.screenshot}
      config.check = {...config.check, ...transformedConfig.check}
      config.close = {...config.close, ...transformedConfig.close}
    } else if (utils.types.isString(configOrAppNameOrTestName)) {
      config.open.appName = configOrAppNameOrTestName
    }
    if (utils.types.isString(testNameOrViewportSize)) config.open.testName = testNameOrViewportSize
    if (utils.types.has(viewportSizeOrSessionType, ['width', 'height']))
      config.open.environment.viewportSize = viewportSizeOrSessionType
    if (utils.types.isEnumValue(sessionType, SessionTypeEnum)) config.open.sessionType = sessionType

    config.open.keepPlatformNameAsIs = true

    this._state.appName = config.open?.appName

    this._eyes = await this._runner.openEyes({
      target: this._driver,
      config,
      logger: this._logger.getLogger(),
      on: (name: string, data?: Record<string, any>) => {
        const globalHandlers = this._events.get('*')
        if (globalHandlers) globalHandlers.forEach(async handler => handler(name, data))
        const namedHandlers = this._events.get(name)
        if (namedHandlers) namedHandlers.forEach(async handler => handler(data))
      },
    })
    return (
      this._driver &&
      (new Proxy(this._driver as any, {
        get(target, key) {
          if (key === 'then') return
          return Reflect.get(target, key)
        },
      }) as any)
    )
  }

  async check(
    name: string,
    checkSettings: CheckSettingsImageFluent | CheckSettingsAutomationFluent<TElement, TSelector>,
  ): Promise<MatchResultData>
  async check(target: Image, checkSettings?: CheckSettingsImage): Promise<MatchResultData>
  async check(checkSettings?: CheckSettingsAutomation<TElement, TSelector>): Promise<MatchResultData>
  async check(
    checkSettingsOrTargetOrName?: CheckSettingsAutomation<TElement, TSelector> | Image | string,
    checkSettings?: CheckSettingsImage | CheckSettingsImageFluent | CheckSettingsAutomationFluent<TElement, TSelector>,
  ): Promise<MatchResultData> {
    if (this._config.isDisabled) return null
    if (!this.isOpen) throw new EyesError('Eyes not open')

    let serialized: {target: Image; settings: any}
    if (utils.types.isString(checkSettingsOrTargetOrName)) {
      serialized = this._driver
        ? new CheckSettingsAutomationFluent(
            checkSettings as CheckSettingsAutomationFluent<TElement, TSelector>,
            this._spec,
          )
            .name(checkSettingsOrTargetOrName)
            .toJSON()
        : new CheckSettingsImageFluent(checkSettings as CheckSettingsImageFluent)
            .name(checkSettingsOrTargetOrName)
            .toJSON()
    } else if (utils.types.has(checkSettingsOrTargetOrName, 'image')) {
      serialized = new CheckSettingsImageFluent(
        checkSettings as CheckSettingsImage,
        checkSettingsOrTargetOrName,
      ).toJSON()
    } else {
      serialized = new CheckSettingsAutomationFluent(
        checkSettingsOrTargetOrName as CheckSettingsAutomation<TElement, TSelector>,
        this._spec,
      ).toJSON()
    }
    const {target, settings} = serialized
    const config = this._config.toJSON()
    // TODO remove when major version of sdk should be released
    config.screenshot.fully ??= false

    const [result] = await this._eyes.check({target, settings, config})

    return new MatchResultData(result)
  }

  /** @deprecated */
  async checkWindow(name?: string, timeout?: number, fully = false) {
    return this.check({name, timeout, fully})
  }
  /** @deprecated */
  async checkFrame(element: TElement | EyesSelector<TSelector> | string | number, timeout?: number, name?: string) {
    return this.check({name, frames: [element], timeout, fully: true})
  }
  /** @deprecated */
  async checkElement(element: TElement, timeout?: number, name?: string) {
    return this.check({name, region: element, timeout, fully: true})
  }
  /** @deprecated */
  async checkElementBy(selector: EyesSelector<TSelector>, timeout?: number, name?: string) {
    return this.check({name, region: selector, timeout, fully: true})
  }
  /** @deprecated */
  async checkRegion(region: Region, name?: string, timeout?: number): Promise<MatchResultData>
  /** @deprecated */
  async checkRegion(
    image: Buffer | URL | string,
    region: Region,
    name?: string,
    ignoreMismatch?: boolean,
  ): Promise<MatchResultData>
  async checkRegion(
    imageOrRegion: Buffer | URL | string | Region,
    regionOrName?: Region | string,
    nameOrTimeout?: string | number,
    ignoreMismatch = false,
  ) {
    return utils.types.has(imageOrRegion, ['x', 'y', 'width', 'height'])
      ? this.check({region: imageOrRegion, name: regionOrName as string, timeout: nameOrTimeout as number})
      : this.check(
          {image: imageOrRegion},
          {region: regionOrName as Region, name: nameOrTimeout as string, ignoreMismatch},
        )
  }
  /** @deprecated */
  async checkRegionByElement(element: TElement, name?: string, timeout?: number) {
    return this.check({name, region: element, timeout})
  }
  /** @deprecated */
  async checkRegionBy(selector: EyesSelector<TSelector>, name?: string, timeout?: number, fully = false) {
    return this.check({name, region: selector, timeout, fully})
  }
  /** @deprecated */
  async checkRegionInFrame(
    frame: TElement | EyesSelector<TSelector> | string | number,
    selector: EyesSelector<TSelector>,
    timeout?: number,
    name?: string,
    fully = false,
  ) {
    return this.check({name, region: selector, frames: [frame], timeout, fully})
  }
  /** @deprecated */
  async checkImage(image: Buffer | URL | string, name?: string, ignoreMismatch = false) {
    return this.check({image}, {name, ignoreMismatch})
  }

  async locate<TLocator extends string>(
    settings: VisualLocatorSettings<TLocator>,
  ): Promise<Record<TLocator, Region[]>> {
    if (this._config.isDisabled) return null
    if (!this.isOpen) throw new EyesError('Eyes not open')

    const config = this._config.toJSON()

    return this._spec.locate({target: this._driver, settings: {...this._state, ...settings}, config})
  }

  async extractTextRegions<TPattern extends string>(
    target: CoreTargetImage,
    settings: OCRSettings<TPattern>,
  ): Promise<Record<TPattern, TextRegion[]>>
  /** @deprecated */
  async extractTextRegions<TPattern extends string>(
    settingsWithImage: OCRSettings<TPattern> & {image: CoreTargetImage['image']},
  ): Promise<Record<TPattern, TextRegion[]>>
  async extractTextRegions<TPattern extends string>(
    settings: OCRSettings<TPattern>,
  ): Promise<Record<TPattern, TextRegion[]>>
  async extractTextRegions<TPattern extends string>(
    targetOrSettings: CoreTargetImage | (OCRSettings<TPattern> & {image?: CoreTargetImage['image']}),
    settings?: OCRSettings<TPattern>,
  ): Promise<Record<TPattern, TextRegion[]>> {
    if (this._config.isDisabled) return null
    if (!this.isOpen) throw new EyesError('Eyes not open')

    let target: CoreTargetImage
    if (utils.types.has(targetOrSettings, 'patterns')) {
      settings = targetOrSettings
      if (utils.types.has(targetOrSettings, 'image')) {
        target = {image: targetOrSettings.image}
      }
    } else {
      target = targetOrSettings
    }

    const config = this._config.toJSON()

    return this._eyes.locateText({target, settings, config})
  }

  async extractText(target: CoreTargetImage, settings: OCRRegion<TElement, TSelector>[]): Promise<string[]>
  /** @deprecated */
  async extractText(
    settingsWithImage: (OCRRegion<never, never> & {image: CoreTargetImage['image']})[],
  ): Promise<string[]>
  async extractText(settings: OCRRegion<TElement, TSelector>[]): Promise<string[]>
  async extractText(
    targetOrSettings:
      | CoreTargetImage
      | (OCRRegion<never, never> & {image?: CoreTargetImage['image']})[]
      | OCRRegion<TElement, TSelector>[],
    settings?: OCRRegion<TElement, TSelector>[],
  ): Promise<string[]> {
    if (this._config.isDisabled) return null
    if (!this.isOpen) throw new EyesError('Eyes not open')

    let targets: CoreTargetImage[]
    if (utils.types.isArray(targetOrSettings)) {
      settings = targetOrSettings
      targets = targetOrSettings.map(settings => {
        return utils.types.has(settings, 'image') ? {image: settings.image as CoreTargetImage['image']} : undefined
      })
    } else {
      targets = Array(settings.length).fill(targetOrSettings)
    }

    settings = settings.map(settings => ({
      ...settings,
      region:
        utils.types.isPlainObject(settings.target) && utils.types.has(settings.target, ['left', 'top'])
          ? {...settings.target, x: settings.target.left, y: settings.target.top}
          : settings.target,
    }))

    const config = this._config.toJSON()

    return await settings.reduce((results, settings, index) => {
      return results.then(async results => {
        return results.concat(await this._eyes.extractText({target: targets[index], settings, config}))
      })
    }, Promise.resolve([]))
  }

  async close(throwErr = true): Promise<TestResultsData> {
    if (this._config.isDisabled) return null
    if (!this.isOpen) throw new EyesError('Eyes not open')
    const deleteTest = (options: any) =>
      this._spec.deleteTest({
        ...options,
        settings: {
          ...options.settings,
          serverUrl: this._config.serverUrl,
          apiKey: this._config.apiKey,
          proxy: this._config.proxy,
        },
      })
    try {
      const config = this._config.toJSON()

      const [result] = await this._eyes.close({settings: {throwErr}, config})
      return new TestResultsData({result, deleteTest})
    } catch (err) {
      if (!err.info?.result) throw err
      const result = new TestResultsData({result: err.info.result, deleteTest})
      if (err.reason === 'test failed') {
        throw new TestFailedError(err.message, result)
      } else if (err.reason === 'test different') {
        throw new DiffsFoundError(err.message, result)
      } else if (err.reason === 'test new') {
        throw new NewTestError(err.message, result)
      }
    } finally {
      this._eyes = null
    }
  }
  /** @deprecated */
  async closeAsync(): Promise<void> {
    await this.close(false)
  }

  async abort(): Promise<TestResultsData> {
    if (!this.isOpen || this._config.isDisabled) return null
    return this._eyes
      .abort()
      .then(([result]) => {
        return new TestResultsData({
          result,
          deleteTest: options =>
            this._spec.deleteTest({
              ...options,
              settings: {
                ...options.settings,
                serverUrl: this._config.serverUrl,
                apiKey: this._config.apiKey,
                proxy: this._config.proxy,
              },
            }),
        })
      })
      .finally(() => (this._eyes = null))
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
    return (
      this._config.getViewportSize() || new RectangleSizeData(await this._spec.getViewportSize({target: this._driver}))
    )
  }
  async setViewportSize(size: RectangleSize): Promise<void> {
    utils.guard.notNull(size, {name: 'size'})

    if (!this._driver) {
      this._config.setViewportSize(size)
    } else {
      try {
        await this._spec.setViewportSize({target: this._driver, size})
        this._config.setViewportSize(size)
      } catch (err) {
        this._config.setViewportSize(await this._spec.getViewportSize({target: this._driver}))
        throw new TestFailedError('Failed to set the viewport size')
      }
    }
  }

  getScrollRootElement(): TElement | EyesSelector<TSelector> {
    return this._config.getScrollRootElement()
  }
  setScrollRootElement(scrollRootElement: TElement | EyesSelector<TSelector>) {
    this._config.setScrollRootElement(scrollRootElement)
  }

  setLogHandler(handler: LogHandlerData | LogHandler) {
    this._logger.setLogHandler(handler)
  }
  getLogHandler(): LogHandlerData {
    const handler = this._logger.getLogHandler()
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

  getMatchLevel(): MatchLevelEnum {
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

  getStitchMode(): StitchModeEnum {
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
