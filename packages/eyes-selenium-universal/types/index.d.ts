export type Driver = import('selenium-webdriver').WebDriver;
export type Element = import('selenium-webdriver').WebElement;
export type Selector = import('selenium-webdriver').By | import('selenium-webdriver').ByHash;
export class Eyes {
    static setViewportSize: (driver: Driver, viewportSize: RectangleSize) => Promise<void>;
    constructor(runner?: EyesRunner, config?: ConfigurationPlain);
    constructor(config?: ConfigurationPlain);
    get logger(): Logger;
    getLogger(): Logger;
    get runner(): EyesRunner;
    getRunner(): EyesRunner;
    get driver(): Driver;
    getDriver(): Driver;
    get configuration(): ConfigurationPlain;
    set configuration(configuration: ConfigurationPlain);
    getConfiguration(): Configuration;
    setConfiguration(config: ConfigurationPlain): void;
    get isOpen(): boolean;
    getIsOpen(): boolean;
    on(handler: (event: string, data?: Record<string, any>) => any): () => void;
    on(event: "setSizeWillStart", handler: (data: { viewportSize: RectangleSizePlain; }) => any): () => void;
    on(event: "setSizeEnded", handler: () => any): () => void;
    on(event: "initStarted", handler: () => any): () => void;
    on(event: "initEnded", handler: () => any): () => void;
    on(event: "testStarted", handler: (data: { sessionId: string; }) => any): () => void;
    on(event: "validationWillStart", handler: (data: { sessionId: string; validationInfo: ValidationInfoPlain; }) => any): () => void;
    on(event: "validationEnded", handler: (data: { sessionId: string; validationId: number; validationResult: ValidationResultPlain; }) => any): () => void;
    on(event: "testEnded", handler: (data: { sessionId: string; testResults: TestResultsPlain; }) => any): () => void;
    off(event: string): void;
    off(handler: (...args: Array<any>) => any): void;
    open(driver: Driver, config?: ConfigurationPlain): Promise<Driver>;
    open(driver: Driver, appName?: string, testName?: string, viewportSize?: RectangleSizePlain, sessionType?: SessionTypePlain): Promise<Driver>;
    checkWindow(name?: string, timeout?: number, fully?: boolean): Promise<MatchResult>;
    checkFrame(element: number | Element | EyesSelector<Selector>, timeout?: number, name?: string): Promise<MatchResult>;
    checkElement(element: Element, timeout?: number, name?: string): Promise<MatchResult>;
    checkElementBy(selector: EyesSelector<Selector>, timeout?: number, name?: string): Promise<MatchResult>;
    checkRegion(region?: RegionPlain, name?: string, timeout?: number): Promise<MatchResult>;
    checkRegionByElement(element: Element, name?: string, timeout?: number): Promise<MatchResult>;
    checkRegionBy(selector: EyesSelector<Selector>, name?: string, timeout?: number, fully?: boolean): Promise<MatchResult>;
    checkRegionInFrame(frame: number | Element | EyesSelector<Selector>, selector: EyesSelector<Selector>, timeout?: number, name?: string, fully?: boolean): Promise<MatchResult>;
    check(name: string, checkSettings: CheckSettings): Promise<MatchResult>;
    check(checkSettings?: CheckSettingsPlain): Promise<MatchResult>;
    locate<TLocator extends string>(settings: VisualLocatorSettings<TLocator>): Promise<Record<TLocator, Array<RegionPlain>>>;
    extractTextRegions<TPattern extends string>(settings: OCRSettings<TPattern>): Promise<Record<TPattern, Array<TextRegion>>>;
    extractText(regions: Array<OCRRegion>): Promise<Array<string>>;
    close(throwErr?: boolean): Promise<TestResults>;
    closeAsync(): Promise<void>;
    abort(): Promise<TestResults>;
    abortAsync(): Promise<void>;
    abortIfNotClosed(): Promise<TestResultsPlain>;
    getViewportSize(): Promise<RectangleSize>;
    setViewportSize(size: RectangleSizePlain): Promise<void>;
    getScrollRootElement(): Element | EyesSelector<Selector>;
    setScrollRootElement(scrollRootElement: Element | EyesSelector<Selector>): void;
    setLogHandler(handler: LogHandler): void;
    getLogHandler(): LogHandler;
    setCutProvider(cutProvider: CutProvider): void;
    setImageCut(cutProvider: CutProvider): void;
    getIsCutProviderExplicitlySet(): boolean;
    getRotation(): ImageRotation;
    setRotation(rotation: ImageRotationPlain | ImageRotation): void;
    getScaleRatio(): number;
    setScaleRatio(scaleRatio: number): void;
    getSaveDebugScreenshots(): boolean;
    setSaveDebugScreenshots(save: boolean): void;
    getDebugScreenshotsPath(): string;
    setDebugScreenshotsPath(path: string): void;
    getDebugScreenshotsPrefix(): string;
    setDebugScreenshotsPrefix(prefix: string): void;
    addProperty(name: string, value: string): Configuration;
    clearProperties(): Configuration;
    getBatch(): BatchInfo;
    setBatch(batch: BatchInfoPlain): void;
    setBatch(name: string, id?: string, startedAt?: string | Date): void;
    getApiKey(): string;
    setApiKey(apiKey: string): void;
    getTestName(): string;
    setTestName(testName: string): void;
    getAppName(): string;
    setAppName(appName: string): void;
    getBaselineBranchName(): string;
    setBaselineBranchName(baselineBranchName: string): void;
    getBaselineName(): string;
    setBaselineName(baselineName: string): void;
    getBaselineEnvName(): string;
    setBaselineEnvName(baselineEnvName: string): void;
    getBranchName(): string;
    setBranchName(branchName: string): void;
    getHostApp(): string;
    setHostApp(hostApp: string): void;
    getHostOS(): string;
    setHostOS(hostOS: string): void;
    getHostAppInfo(): string;
    setHostAppInfo(hostAppInfo: string): void;
    getHostOSInfo(): string;
    setHostOSInfo(hostOSInfo: string): void;
    getDeviceInfo(): string;
    setDeviceInfo(deviceInfo: string): void;
    setIgnoreCaret(ignoreCaret: boolean): void;
    getIgnoreCaret(): boolean;
    getIsDisabled(): boolean;
    setIsDisabled(isDisabled: boolean): void;
    getMatchLevel(): MatchLevel;
    setMatchLevel(matchLevel: MatchLevelPlain): void;
    getMatchTimeout(): number;
    setMatchTimeout(matchTimeout: number): void;
    getParentBranchName(): string;
    setParentBranchName(parentBranchName: string): void;
    setProxy(proxy: ProxySettingsPlain): void;
    setProxy(url: string, username?: string, password?: string, isHttpOnly?: boolean): void;
    setProxy(isEnabled: false): void;
    getProxy(): ProxySettings;
    getSaveDiffs(): boolean;
    setSaveDiffs(saveDiffs: boolean): void;
    getSaveNewTests(): boolean;
    setSaveNewTests(saveNewTests: boolean): void;
    getServerUrl(): string;
    setServerUrl(serverUrl: string): void;
    getSendDom(): boolean;
    setSendDom(sendDom: boolean): void;
    getHideCaret(): boolean;
    setHideCaret(hideCaret: boolean): void;
    getHideScrollbars(): boolean;
    setHideScrollbars(hideScrollbars: boolean): void;
    getForceFullPageScreenshot(): boolean;
    setForceFullPageScreenshot(forceFullPageScreenshot: boolean): void;
    getWaitBeforeScreenshots(): number;
    setWaitBeforeScreenshots(waitBeforeScreenshots: number): void;
    getStitchMode(): StitchMode;
    setStitchMode(stitchMode: StitchModePlain): void;
    getStitchOverlap(): number;
    setStitchOverlap(stitchOverlap: number): void;
    getSessionEventHandlers(): SessionEventHandlers;
    addSessionEventHandler(handler: SessionEventHandler): void;
    removeSessionEventHandler(handler: SessionEventHandler): void;
    clearSessionEventHandlers(): void;
}
export type ConfigurationPlain = {
    logs?: LogHandlerPlain;
    debugScreenshots?: { save: boolean; path?: string; prefix?: string; };
    agentId?: string;
    apiKey?: string;
    serverUrl?: string;
    proxy?: ProxySettingsPlain;
    isDisabled?: boolean;
    connectionTimeout?: number;
    removeSession?: boolean;
    remoteEvents?: { serverUrl: string; accessKey?: string; timeout?: number; };
    appName?: string;
    testName?: string;
    displayName?: string;
    viewportSize?: RectangleSizePlain;
    sessionType?: SessionTypePlain;
    properties?: Array<PropertyDataPlain>;
    batch?: BatchInfoPlain;
    defaultMatchSettings?: ImageMatchSettingsPlain;
    hostApp?: string;
    hostOS?: string;
    hostAppInfo?: string;
    hostOSInfo?: string;
    deviceInfo?: string;
    baselineEnvName?: string;
    environmentName?: string;
    branchName?: string;
    parentBranchName?: string;
    baselineBranchName?: string;
    compareWithParentBranch?: boolean;
    ignoreBaseline?: boolean;
    saveFailedTests?: boolean;
    saveNewTests?: boolean;
    saveDiffs?: boolean;
    dontCloseBatches?: boolean;
    sendDom?: boolean;
    matchTimeout?: number;
    forceFullPageScreenshot?: boolean;
    waitBeforeScreenshots?: number;
    stitchMode?: StitchModePlain;
    hideScrollbars?: boolean;
    hideCaret?: boolean;
    stitchOverlap?: number;
    scrollRootElement?: Element | EyesSelector<Selector>;
    cut?: CutProviderPlain;
    rotation?: ImageRotationPlain;
    scaleRatio?: number;
    waitBeforeCapture?: number;
    concurrentSessions?: number;
    browsersInfo?: Array<DesktopBrowserInfo | ChromeEmulationInfo | IOSDeviceInfo>;
    visualGridOptions?: Record<string, any>;
    layoutBreakpoints?: boolean | Array<number>;
    disableBrowserFetching?: boolean;
};
export class Configuration implements Required<ConfigurationPlain> {
    constructor(config?: ConfigurationPlain);
    get logs(): LogHandlerPlain;
    set logs(logs: LogHandlerPlain);
    getShowLogs(): boolean;
    setShowLogs(show: boolean): Configuration;
    getLogHandler(): LogHandlerPlain;
    setLogHandler(handler: LogHandlerPlain): Configuration;
    get debugScreenshots(): { save: boolean; path?: string; prefix?: string; };
    set debugScreenshots(debugScreenshots: { save: boolean; path?: string; prefix?: string; });
    getSaveDebugScreenshots(): boolean;
    setSaveDebugScreenshots(save: boolean): Configuration;
    getDebugScreenshotsPath(): string;
    setDebugScreenshotsPath(path: string): Configuration;
    getDebugScreenshotsPrefix(): string;
    setDebugScreenshotsPrefix(prefix: string): Configuration;
    get appName(): string;
    set appName(appName: string);
    getAppName(): string;
    setAppName(appName: string): Configuration;
    get testName(): string;
    set testName(testName: string);
    getTestName(): string;
    setTestName(testName: string): Configuration;
    get displayName(): string;
    set displayName(displayName: string);
    getDisplayName(): string;
    setDisplayName(displayName: string): Configuration;
    get isDisabled(): boolean;
    set isDisabled(isDisabled: boolean);
    getIsDisabled(): boolean;
    setIsDisabled(isDisabled: boolean): Configuration;
    get matchTimeout(): number;
    set matchTimeout(matchTimeout: number);
    getMatchTimeout(): number;
    setMatchTimeout(matchTimeout: number): Configuration;
    get sessionType(): SessionTypePlain;
    set sessionType(sessionType: SessionTypePlain);
    getSessionType(): SessionType;
    setSessionType(sessionType: SessionTypePlain): Configuration;
    get viewportSize(): RectangleSizePlain;
    set viewportSize(viewportSize: RectangleSizePlain);
    getViewportSize(): RectangleSize;
    setViewportSize(viewportSize: RectangleSizePlain): Configuration;
    get agentId(): string;
    set agentId(agentId: string);
    getAgentId(): string;
    setAgentId(agentId: string): Configuration;
    get apiKey(): string;
    set apiKey(apiKey: string);
    getApiKey(): string;
    setApiKey(apiKey: string): Configuration;
    get serverUrl(): string;
    set serverUrl(serverUrl: string);
    getServerUrl(): string;
    setServerUrl(serverUrl: string): Configuration;
    get proxy(): ProxySettingsPlain;
    set proxy(proxy: ProxySettingsPlain);
    getProxy(): ProxySettings;
    setProxy(proxy: ProxySettingsPlain): Configuration;
    setProxy(url: string, username?: string, password?: string, isHttpOnly?: boolean): Configuration;
    setProxy(isEnabled: false): Configuration;
    get connectionTimeout(): number;
    set connectionTimeout(connectionTimeout: number);
    getConnectionTimeout(): number;
    setConnectionTimeout(connectionTimeout: number): Configuration;
    get removeSession(): boolean;
    set removeSession(removeSession: boolean);
    getRemoveSession(): boolean;
    setRemoveSession(removeSession: boolean): Configuration;
    get remoteEvents(): { serverUrl: string; accessKey?: string; timeout?: number; };
    set remoteEvents(remoteEvents: { serverUrl: string; accessKey?: string; timeout?: number; });
    getRemoteEvents(): { serverUrl: string; accessKey?: string; timeout?: number; };
    setRemoteEvents(remoteEvents: { serverUrl: string; accessKey?: string; timeout?: number; }): Configuration;
    get batch(): BatchInfoPlain;
    set batch(batch: BatchInfoPlain);
    getBatch(): BatchInfo;
    setBatch(batch: BatchInfoPlain): Configuration;
    get properties(): Array<PropertyDataPlain>;
    set properties(properties: Array<PropertyDataPlain>);
    getProperties(): Array<PropertyData>;
    setProperties(properties: Array<PropertyDataPlain>): Configuration;
    addProperty(name: string, value: string): Configuration;
    addProperty(prop: PropertyDataPlain): Configuration;
    clearProperties(): Configuration;
    get baselineEnvName(): string;
    set baselineEnvName(baselineEnvName: string);
    getBaselineEnvName(): string;
    setBaselineEnvName(baselineEnvName: string): Configuration;
    get environmentName(): string;
    set environmentName(environmentName: string);
    getEnvironmentName(): string;
    setEnvironmentName(environmentName: string): Configuration;
    get branchName(): string;
    set branchName(branchName: string);
    getBranchName(): string;
    setBranchName(branchName: string): Configuration;
    get parentBranchName(): string;
    set parentBranchName(parentBranchName: string);
    getParentBranchName(): string;
    setParentBranchName(parentBranchName: string): Configuration;
    get baselineBranchName(): string;
    set baselineBranchName(baselineBranchName: string);
    getBaselineBranchName(): string;
    setBaselineBranchName(baselineBranchName: string): Configuration;
    get compareWithParentBranch(): boolean;
    set compareWithParentBranch(compareWithParentBranch: boolean);
    getCompareWithParentBranch(): boolean;
    setCompareWithParentBranch(compareWithParentBranch: boolean): Configuration;
    get ignoreBaseline(): boolean;
    set ignoreBaseline(ignoreBaseline: boolean);
    getIgnoreBaseline(): boolean;
    setIgnoreBaseline(ignoreBaseline: boolean): Configuration;
    get saveFailedTests(): boolean;
    set saveFailedTests(saveFailedTests: boolean);
    getSaveFailedTests(): boolean;
    setSaveFailedTests(saveFailedTests: boolean): Configuration;
    get saveNewTests(): boolean;
    set saveNewTests(saveNewTests: boolean);
    getSaveNewTests(): boolean;
    setSaveNewTests(saveNewTests: boolean): Configuration;
    get saveDiffs(): boolean;
    set saveDiffs(saveDiffs: boolean);
    getSaveDiffs(): boolean;
    setSaveDiffs(saveDiffs: boolean): Configuration;
    get sendDom(): boolean;
    set sendDom(sendDom: boolean);
    getSendDom(): boolean;
    setSendDom(sendDom: boolean): Configuration;
    get hostApp(): string;
    set hostApp(hostApp: string);
    getHostApp(): string;
    setHostApp(hostApp: string): Configuration;
    get hostOS(): string;
    set hostOS(hostOS: string);
    getHostOS(): string;
    setHostOS(hostOS: string): Configuration;
    get hostAppInfo(): string;
    set hostAppInfo(hostAppInfo: string);
    getHostAppInfo(): string;
    setHostAppInfo(hostAppInfo: string): Configuration;
    get hostOSInfo(): string;
    set hostOSInfo(hostOSInfo: string);
    getHostOSInfo(): string;
    setHostOSInfo(hostOSInfo: string): Configuration;
    get deviceInfo(): string;
    set deviceInfo(deviceInfo: string);
    getDeviceInfo(): string;
    setDeviceInfo(deviceInfo: string): Configuration;
    get defaultMatchSettings(): ImageMatchSettingsPlain;
    set defaultMatchSettings(defaultMatchSettings: ImageMatchSettingsPlain);
    getDefaultMatchSettings(): ImageMatchSettingsPlain;
    setDefaultMatchSettings(defaultMatchSettings: ImageMatchSettingsPlain): Configuration;
    getMatchLevel(): MatchLevel;
    setMatchLevel(matchLevel: MatchLevelPlain): Configuration;
    getAccessibilityValidation(): AccessibilitySettings;
    setAccessibilityValidation(accessibilityValidation: AccessibilitySettings): Configuration;
    getUseDom(): boolean;
    setUseDom(useDom: boolean): Configuration;
    getEnablePatterns(): boolean;
    setEnablePatterns(enablePatterns: boolean): Configuration;
    getIgnoreDisplacements(): boolean;
    setIgnoreDisplacements(ignoreDisplacements: boolean): Configuration;
    getIgnoreCaret(): boolean;
    setIgnoreCaret(ignoreCaret: boolean): Configuration;
    get forceFullPageScreenshot(): boolean;
    set forceFullPageScreenshot(forceFullPageScreenshot: boolean);
    getForceFullPageScreenshot(): boolean;
    setForceFullPageScreenshot(forceFullPageScreenshot: boolean): Configuration;
    get waitBeforeScreenshots(): number;
    set waitBeforeScreenshots(waitBeforeScreenshots: number);
    getWaitBeforeScreenshots(): number;
    setWaitBeforeScreenshots(waitBeforeScreenshots: number): Configuration;
    get waitBeforeCapture(): number;
    set waitBeforeCapture(waitBeforeCapture: number);
    getWaitBeforeCapture(): number;
    setWaitBeforeCapture(waitBeforeCapture: number): Configuration;
    get stitchMode(): StitchModePlain;
    set stitchMode(stitchMode: StitchModePlain);
    getStitchMode(): StitchMode;
    setStitchMode(stitchMode: StitchModePlain): Configuration;
    get hideScrollbars(): boolean;
    set hideScrollbars(hideScrollbars: boolean);
    getHideScrollbars(): boolean;
    setHideScrollbars(hideScrollbars: boolean): Configuration;
    get hideCaret(): boolean;
    set hideCaret(hideCaret: boolean);
    getHideCaret(): boolean;
    setHideCaret(hideCaret: boolean): Configuration;
    get stitchOverlap(): number;
    set stitchOverlap(stitchOverlap: number);
    getStitchOverlap(): number;
    setStitchOverlap(stitchOverlap: number): Configuration;
    get scrollRootElement(): Element | EyesSelector<Selector>;
    set scrollRootElement(scrollRootElement: Element | EyesSelector<Selector>);
    getScrollRootElement(): Element | EyesSelector<Selector>;
    setScrollRootElement(scrollRootElement: Element | EyesSelector<Selector>): Configuration;
    get cut(): CutProviderPlain;
    set cut(cut: CutProviderPlain);
    getCut(): CutProviderPlain;
    setCut(cut: CutProviderPlain): Configuration;
    get rotation(): ImageRotationPlain;
    set rotation(rotation: ImageRotationPlain);
    getRotation(): ImageRotation;
    setRotation(rotation: ImageRotationPlain | ImageRotation): Configuration;
    get scaleRatio(): number;
    set scaleRatio(scaleRatio: number);
    getScaleRatio(): number;
    setScaleRatio(scaleRatio: number): Configuration;
    get concurrentSessions(): number;
    set concurrentSessions(concurrentSessions: number);
    getConcurrentSessions(): number;
    setConcurrentSessions(concurrentSessions: number): Configuration;
    get browsersInfo(): Array<DesktopBrowserInfo | ChromeEmulationInfo | IOSDeviceInfo>;
    set browsersInfo(browsersInfo: Array<DesktopBrowserInfo | ChromeEmulationInfo | IOSDeviceInfo>);
    getBrowsersInfo(): Array<DesktopBrowserInfo | ChromeEmulationInfo | IOSDeviceInfo | { deviceName: DeviceNamePlain; screenOrientation?: ScreenOrientationPlain; }>;
    setBrowsersInfo(browsersInfo: Array<DesktopBrowserInfo | ChromeEmulationInfo | IOSDeviceInfo | { deviceName: DeviceNamePlain; screenOrientation?: ScreenOrientationPlain; }>): Configuration;
    addBrowsers(...browsersInfo: Array<DesktopBrowserInfo | ChromeEmulationInfo | IOSDeviceInfo | { deviceName: DeviceNamePlain; screenOrientation?: ScreenOrientationPlain; }>): Configuration;
    addBrowser(browserInfo: DesktopBrowserInfo | ChromeEmulationInfo | IOSDeviceInfo | { deviceName: DeviceNamePlain; screenOrientation?: ScreenOrientationPlain; }): Configuration;
    addBrowser(width: number, height: number, name?: BrowserTypePlain): Configuration;
    addDeviceEmulation(deviceName: DeviceNamePlain, screenOrientation?: ScreenOrientationPlain): Configuration;
    get visualGridOptions(): { [key: string]: any; };
    set visualGridOptions(visualGridOptions: { [key: string]: any; });
    getVisualGridOptions(): { [key: string]: any; };
    setVisualGridOptions(visualGridOptions: { [key: string]: any; }): Configuration;
    setVisualGridOption(key: string, value: any): Configuration;
    get layoutBreakpoints(): boolean | Array<number>;
    set layoutBreakpoints(layoutBreakpoints: boolean | Array<number>);
    getLayoutBreakpoints(): boolean | Array<number>;
    setLayoutBreakpoints(layoutBreakpoints: boolean | Array<number>): Configuration;
    get disableBrowserFetching(): boolean;
    set disableBrowserFetching(disableBrowserFetching: boolean);
    getDisableBrowserFetching(): boolean;
    setDisableBrowserFetching(disableBrowserFetching: boolean): Configuration;
    get dontCloseBatches(): boolean;
    set dontCloseBatches(dontCloseBatches: boolean);
    getDontCloseBatches(): boolean;
    setDontCloseBatches(dontCloseBatches: boolean): Configuration;
}
export type OCRRegion = { target: Element | RegionPlain | EyesSelector<Selector>; hint?: string; minMatch?: number; language?: string; };
export type CheckSettingsPlain = {
    name?: string;
    region?: RegionPlain | (Element | (string | Selector | { selector: string | Selector; type?: string; shadow?: EyesSelector<Selector>; frame?: EyesSelector<Selector>; }));
    frames?: Array<{ frame: number | (Element | (string | Selector | { selector: string | Selector; type?: string; shadow?: EyesSelector<Selector>; frame?: EyesSelector<Selector>; })); scrollRootElement?: Element | (string | Selector | { selector: string | Selector; type?: string; shadow?: EyesSelector<Selector>; frame?: EyesSelector<Selector>; }); } | (number | (Element | (string | Selector | { selector: string | Selector; type?: string; shadow?: EyesSelector<Selector>; frame?: EyesSelector<Selector>; })))>;
    scrollRootElement?: Element | (string | Selector | { selector: string | Selector; type?: string; shadow?: EyesSelector<Selector>; frame?: EyesSelector<Selector>; });
    fully?: boolean;
    matchLevel?: MatchLevelPlain;
    useDom?: boolean;
    sendDom?: boolean;
    enablePatterns?: boolean;
    ignoreDisplacements?: boolean;
    ignoreCaret?: boolean;
    ignoreRegions?: Array<RegionPlain | (Element | (string | Selector | { selector: string | Selector; type?: string; shadow?: EyesSelector<Selector>; frame?: EyesSelector<Selector>; }))>;
    layoutRegions?: Array<RegionPlain | (Element | (string | Selector | { selector: string | Selector; type?: string; shadow?: EyesSelector<Selector>; frame?: EyesSelector<Selector>; }))>;
    strictRegions?: Array<RegionPlain | (Element | (string | Selector | { selector: string | Selector; type?: string; shadow?: EyesSelector<Selector>; frame?: EyesSelector<Selector>; }))>;
    contentRegions?: Array<RegionPlain | (Element | (string | Selector | { selector: string | Selector; type?: string; shadow?: EyesSelector<Selector>; frame?: EyesSelector<Selector>; }))>;
    floatingRegions?: Array<(RegionPlain | (Element | (string | Selector | { selector: string | Selector; type?: string; shadow?: EyesSelector<Selector>; frame?: EyesSelector<Selector>; }))) | {
        region: RegionPlain | (Element | (string | Selector | { selector: string | Selector; type?: string; shadow?: EyesSelector<Selector>; frame?: EyesSelector<Selector>; }));
        maxUpOffset?: number;
        maxDownOffset?: number;
        maxLeftOffset?: number;
        maxRightOffset?: number;
    }>;
    accessibilityRegions?: Array<(RegionPlain | (Element | (string | Selector | { selector: string | Selector; type?: string; shadow?: EyesSelector<Selector>; frame?: EyesSelector<Selector>; }))) | { region: RegionPlain | (Element | (string | Selector | { selector: string | Selector; type?: string; shadow?: EyesSelector<Selector>; frame?: EyesSelector<Selector>; })); type?: AccessibilityRegionTypePlain; }>;
    disableBrowserFetching?: boolean;
    layoutBreakpoints?: boolean | Array<number>;
    visualGridOptions?: { [key: string]: any; };
    hooks?: { beforeCaptureScreenshot: string; };
    renderId?: string;
    variationGroupId?: string;
    timeout?: number;
    waitBeforeCapture?: number;
};
export class CheckSettings {
    constructor(settings?: CheckSettingsPlain);
    name(name: string): CheckSettings;
    withName(name: string): CheckSettings;
    region(region: LegacyRegionPlain | (RegionPlain | (Element | (string | Selector | { selector: string | Selector; type?: string; shadow?: EyesSelector<Selector>; frame?: EyesSelector<Selector>; })))): CheckSettings;
    shadow(selector: string | Selector | { selector: string | Selector; type?: string; shadow?: EyesSelector<Selector>; frame?: EyesSelector<Selector>; }): CheckSettings;
    frame(context: { frame: number | (Element | (string | Selector | { selector: string | Selector; type?: string; shadow?: EyesSelector<Selector>; frame?: EyesSelector<Selector>; })); scrollRootElement?: Element | (string | Selector | { selector: string | Selector; type?: string; shadow?: EyesSelector<Selector>; frame?: EyesSelector<Selector>; }); }): CheckSettings;
    frame(frame: number | (Element | (string | Selector | { selector: string | Selector; type?: string; shadow?: EyesSelector<Selector>; frame?: EyesSelector<Selector>; })), scrollRootElement?: Element | (string | Selector | { selector: string | Selector; type?: string; shadow?: EyesSelector<Selector>; frame?: EyesSelector<Selector>; })): CheckSettings;
    ignoreRegion(region: LegacyRegionPlain | (RegionPlain | (Element | (string | Selector | { selector: string | Selector; type?: string; shadow?: EyesSelector<Selector>; frame?: EyesSelector<Selector>; })))): CheckSettings;
    ignoreRegions(...regions: Array<LegacyRegionPlain | (RegionPlain | (Element | (string | Selector | { selector: string | Selector; type?: string; shadow?: EyesSelector<Selector>; frame?: EyesSelector<Selector>; })))>): CheckSettings;
    ignore(region: LegacyRegionPlain | (RegionPlain | (Element | (string | Selector | { selector: string | Selector; type?: string; shadow?: EyesSelector<Selector>; frame?: EyesSelector<Selector>; })))): CheckSettings;
    ignores(...regions: Array<LegacyRegionPlain | (RegionPlain | (Element | (string | Selector | { selector: string | Selector; type?: string; shadow?: EyesSelector<Selector>; frame?: EyesSelector<Selector>; })))>): CheckSettings;
    layoutRegion(region: LegacyRegionPlain | (RegionPlain | (Element | (string | Selector | { selector: string | Selector; type?: string; shadow?: EyesSelector<Selector>; frame?: EyesSelector<Selector>; })))): CheckSettings;
    layoutRegions(...regions: Array<LegacyRegionPlain | (RegionPlain | (Element | (string | Selector | { selector: string | Selector; type?: string; shadow?: EyesSelector<Selector>; frame?: EyesSelector<Selector>; })))>): CheckSettings;
    strictRegion(region: LegacyRegionPlain | (RegionPlain | (Element | (string | Selector | { selector: string | Selector; type?: string; shadow?: EyesSelector<Selector>; frame?: EyesSelector<Selector>; })))): CheckSettings;
    strictRegions(...regions: Array<LegacyRegionPlain | (RegionPlain | (Element | (string | Selector | { selector: string | Selector; type?: string; shadow?: EyesSelector<Selector>; frame?: EyesSelector<Selector>; })))>): CheckSettings;
    contentRegion(region: LegacyRegionPlain | (RegionPlain | (Element | (string | Selector | { selector: string | Selector; type?: string; shadow?: EyesSelector<Selector>; frame?: EyesSelector<Selector>; })))): CheckSettings;
    contentRegions(...regions: Array<LegacyRegionPlain | (RegionPlain | (Element | (string | Selector | { selector: string | Selector; type?: string; shadow?: EyesSelector<Selector>; frame?: EyesSelector<Selector>; })))>): CheckSettings;
    floatingRegion(region: {
        region: RegionPlain | (Element | (string | Selector | { selector: string | Selector; type?: string; shadow?: EyesSelector<Selector>; frame?: EyesSelector<Selector>; }));
        maxUpOffset?: number;
        maxDownOffset?: number;
        maxLeftOffset?: number;
        maxRightOffset?: number;
    }): CheckSettings;
    floatingRegion(region: LegacyRegionPlain | (RegionPlain | (Element | (string | Selector | { selector: string | Selector; type?: string; shadow?: EyesSelector<Selector>; frame?: EyesSelector<Selector>; }))), maxUpOffset?: number, maxDownOffset?: number, maxLeftOffset?: number, maxRightOffset?: number): CheckSettings;
    floatingRegions(...regions: Array<LegacyRegionPlain | (RegionPlain | (Element | (string | Selector | { selector: string | Selector; type?: string; shadow?: EyesSelector<Selector>; frame?: EyesSelector<Selector>; }))) | {
        region: RegionPlain | (Element | (string | Selector | { selector: string | Selector; type?: string; shadow?: EyesSelector<Selector>; frame?: EyesSelector<Selector>; }));
        maxUpOffset?: number;
        maxDownOffset?: number;
        maxLeftOffset?: number;
        maxRightOffset?: number;
    }>): CheckSettings;
    floatingRegions(maxOffset: number, ...regions: Array<LegacyRegionPlain | (RegionPlain | (Element | (string | Selector | { selector: string | Selector; type?: string; shadow?: EyesSelector<Selector>; frame?: EyesSelector<Selector>; })))>): CheckSettings;
    floating(region: {
        region: RegionPlain | (Element | (string | Selector | { selector: string | Selector; type?: string; shadow?: EyesSelector<Selector>; frame?: EyesSelector<Selector>; }));
        maxUpOffset?: number;
        maxDownOffset?: number;
        maxLeftOffset?: number;
        maxRightOffset?: number;
    }): CheckSettings;
    floating(region: LegacyRegionPlain | (RegionPlain | (Element | (string | Selector | { selector: string | Selector; type?: string; shadow?: EyesSelector<Selector>; frame?: EyesSelector<Selector>; })))): CheckSettings;
    floatings(...regions: Array<LegacyRegionPlain | (RegionPlain | (Element | (string | Selector | { selector: string | Selector; type?: string; shadow?: EyesSelector<Selector>; frame?: EyesSelector<Selector>; }))) | {
        region: RegionPlain | (Element | (string | Selector | { selector: string | Selector; type?: string; shadow?: EyesSelector<Selector>; frame?: EyesSelector<Selector>; }));
        maxUpOffset?: number;
        maxDownOffset?: number;
        maxLeftOffset?: number;
        maxRightOffset?: number;
    }>): CheckSettings;
    floatings(maxOffset: number, ...regions: Array<LegacyRegionPlain | (RegionPlain | (Element | (string | Selector | { selector: string | Selector; type?: string; shadow?: EyesSelector<Selector>; frame?: EyesSelector<Selector>; })))>): CheckSettings;
    accessibilityRegion(region: { region: RegionPlain | (Element | (string | Selector | { selector: string | Selector; type?: string; shadow?: EyesSelector<Selector>; frame?: EyesSelector<Selector>; })); type?: AccessibilityRegionTypePlain; }): CheckSettings;
    accessibilityRegion(region: LegacyRegionPlain | (RegionPlain | (Element | (string | Selector | { selector: string | Selector; type?: string; shadow?: EyesSelector<Selector>; frame?: EyesSelector<Selector>; }))), type?: AccessibilityRegionTypePlain): CheckSettings;
    accessibilityRegions(...regions: Array<LegacyRegionPlain | (RegionPlain | (Element | (string | Selector | { selector: string | Selector; type?: string; shadow?: EyesSelector<Selector>; frame?: EyesSelector<Selector>; }))) | { region: RegionPlain | (Element | (string | Selector | { selector: string | Selector; type?: string; shadow?: EyesSelector<Selector>; frame?: EyesSelector<Selector>; })); type?: AccessibilityRegionTypePlain; }>): CheckSettings;
    accessibilityRegions(type: AccessibilityRegionTypePlain, ...regions: Array<LegacyRegionPlain | (RegionPlain | (Element | (string | Selector | { selector: string | Selector; type?: string; shadow?: EyesSelector<Selector>; frame?: EyesSelector<Selector>; })))>): CheckSettings;
    scrollRootElement(scrollRootElement: Element | (string | Selector | { selector: string | Selector; type?: string; shadow?: EyesSelector<Selector>; frame?: EyesSelector<Selector>; })): CheckSettings;
    fully(fully?: boolean): CheckSettings;
    stitchContent(stitchContent?: boolean): CheckSettings;
    matchLevel(matchLevel: MatchLevelPlain): CheckSettings;
    layout(): CheckSettings;
    exact(): CheckSettings;
    strict(): CheckSettings;
    content(): CheckSettings;
    useDom(useDom?: boolean): CheckSettings;
    sendDom(sendDom?: boolean): CheckSettings;
    enablePatterns(enablePatterns?: boolean): CheckSettings;
    ignoreDisplacements(ignoreDisplacements?: boolean): CheckSettings;
    ignoreCaret(ignoreCaret?: boolean): CheckSettings;
    disableBrowserFetching(disableBrowserFetching: boolean): CheckSettings;
    layoutBreakpoints(layoutBreakpoints?: boolean | Array<number>): CheckSettings;
    hook(name: string, script: string): CheckSettings;
    beforeRenderScreenshotHook(script: string): CheckSettings;
    webHook(script: string): CheckSettings;
    visualGridOption(key: string, value: any): CheckSettings;
    visualGridOptions(options: { [key: string]: any; }): CheckSettings;
    renderId(renderId: string): CheckSettings;
    variationGroupId(variationGroupId: string): CheckSettings;
    timeout(timeout: number): CheckSettings;
    waitBeforeCapture(waitBeforeCapture: number): CheckSettings;
}
export const Target: {
    window(): CheckSettings;
    region(region: LegacyRegionPlain | (RegionPlain | (Element | (string | Selector | { selector: string | Selector; type?: string; shadow?: EyesSelector<Selector>; frame?: EyesSelector<Selector>; })))): CheckSettings;
    frame(context: { frame: number | (Element | (string | Selector | { selector: string | Selector; type?: string; shadow?: EyesSelector<Selector>; frame?: EyesSelector<Selector>; })); scrollRootElement?: Element | (string | Selector | { selector: string | Selector; type?: string; shadow?: EyesSelector<Selector>; frame?: EyesSelector<Selector>; }); }): CheckSettings;
    frame(frame: number | (Element | (string | Selector | { selector: string | Selector; type?: string; shadow?: EyesSelector<Selector>; frame?: EyesSelector<Selector>; })), scrollRootElement?: Element | (string | Selector | { selector: string | Selector; type?: string; shadow?: EyesSelector<Selector>; frame?: EyesSelector<Selector>; })): CheckSettings;
    shadow(selector: string | Selector | { selector: string | Selector; type?: string; shadow?: EyesSelector<Selector>; frame?: EyesSelector<Selector>; }): CheckSettings;
};
export class BatchClose {
    static close(settings: { batchIds: Array<string>; serverUrl?: string; apiKey?: string; proxy?: ProxySettingsPlain; }): Promise<void>;
    constructor(options?: { batchIds: Array<string>; serverUrl?: string; apiKey?: string; proxy?: ProxySettingsPlain; });
    close(): Promise<void>;
    setBatchIds(batchIds: Array<string>): BatchClose;
    setUrl(serverUrl: string): BatchClose;
    setApiKey(apiKey: string): BatchClose;
    setProxy(proxy: ProxySettingsPlain): BatchClose;
}
export type AccessibilityGuidelinesVersionPlain = "WCAG_2_0" | "WCAG_2_1";
export enum AccessibilityGuidelinesVersion {
    WCAG_2_0 = 'WCAG_2_0',
    WCAG_2_1 = 'WCAG_2_1'
}
export type AccessibilityLevelPlain = "AA" | "AAA";
export enum AccessibilityLevel {
    AA = 'AA',
    AAA = 'AAA'
}
export type AccessibilityRegionTypePlain = "IgnoreContrast" | "RegularText" | "LargeText" | "BoldText" | "GraphicalObject";
export enum AccessibilityRegionType {
    IgnoreContrast = 'IgnoreContrast',
    RegularText = 'RegularText',
    LargeText = 'LargeText',
    BoldText = 'BoldText',
    GraphicalObject = 'GraphicalObject'
}
export type AccessibilityStatusPlain = "Passed" | "Failed";
export enum AccessibilityStatus {
    Passed = 'Passed',
    Failed = 'Failed'
}
export type BrowserTypePlain = "chrome" | "chrome-one-version-back" | "chrome-two-versions-back" | "firefox" | "firefox-one-version-back" | "firefox-two-versions-back" | "ie" | "ie10" | "edge" | "edgechromium" | "edgelegacy" | "edgechromium-one-version-back" | "edgechromium-two-versions-back" | "safari" | "safari-earlyaccess" | "safari-one-version-back" | "safari-two-versions-back";
export enum BrowserType {
    CHROME = 'chrome',
    CHROME_ONE_VERSION_BACK = 'chrome-one-version-back',
    CHROME_TWO_VERSIONS_BACK = 'chrome-two-versions-back',
    FIREFOX = 'firefox',
    FIREFOX_ONE_VERSION_BACK = 'firefox-one-version-back',
    FIREFOX_TWO_VERSIONS_BACK = 'firefox-two-versions-back',
    IE_11 = 'ie',
    IE_10 = 'ie10',
    EDGE = 'edge',
    EDGE_CHROMIUM = 'edgechromium',
    EDGE_LEGACY = 'edgelegacy',
    EDGE_CHROMIUM_ONE_VERSION_BACK = 'edgechromium-one-version-back',
    EDGE_CHROMIUM_TWO_VERSIONS_BACK = 'edgechromium-two-versions-back',
    SAFARI = 'safari',
    SAFARI_EARLY_ACCESS = 'safari-earlyaccess',
    SAFARI_ONE_VERSION_BACK = 'safari-one-version-back',
    SAFARI_TWO_VERSIONS_BACK = 'safari-two-versions-back'
}
export type CorsIframeHandlePlain = "BLANK" | "KEEP" | "SNAPSHOT";
export enum CorsIframeHandle {
    BLANK = 'BLANK',
    KEEP = 'KEEP',
    SNAPSHOT = 'SNAPSHOT'
}
export type DeviceNamePlain = "Blackberry PlayBook" | "BlackBerry Z30" | "Galaxy A5" | "Galaxy Note 10" | "Galaxy Note 10 Plus" | "Galaxy Note 2" | "Galaxy Note 3" | "Galaxy Note 4" | "Galaxy Note 8" | "Galaxy Note 9" | "Galaxy S3" | "Galaxy S5" | "Galaxy S8" | "Galaxy S8 Plus" | "Galaxy S9" | "Galaxy S9 Plus" | "Galaxy S10" | "Galaxy S10 Plus" | "Galaxy S20" | "iPad" | "iPad 6th Gen" | "iPad 7th Gen" | "iPad Air 2" | "iPad Mini" | "iPad Pro" | "iPhone 11" | "iPhone 11 Pro" | "iPhone 11 Pro Max" | "iPhone 4" | "iPhone 5/SE" | "iPhone 6/7/8" | "iPhone 6/7/8 Plus" | "iPhone X" | "iPhone XR" | "iPhone XS" | "iPhone XS Max" | "Kindle Fire HDX" | "Laptop with HiDPI screen" | "Laptop with MDPI screen" | "Laptop with touch" | "LG G6" | "LG Optimus L70" | "Microsoft Lumia 550" | "Microsoft Lumia 950" | "Nexus 10" | "Nexus 4" | "Nexus 5" | "Nexus 5X" | "Nexus 6" | "Nexus 6P" | "Nexus 7" | "Nokia Lumia 520" | "Nokia N9" | "OnePlus 7T" | "OnePlus 7T Pro" | "Pixel 2" | "Pixel 2 XL" | "Pixel 3" | "Pixel 3 XL" | "Pixel 4" | "Pixel 4 XL" | "Pixel 5";
export enum DeviceName {
    Blackberry_PlayBook = 'Blackberry PlayBook',
    BlackBerry_Z30 = 'BlackBerry Z30',
    Galaxy_A5 = 'Galaxy A5',
    Galaxy_Note_10 = 'Galaxy Note 10',
    Galaxy_Note_10_Plus = 'Galaxy Note 10 Plus',
    Galaxy_Note_2 = 'Galaxy Note 2',
    Galaxy_Note_3 = 'Galaxy Note 3',
    Galaxy_Note_4 = 'Galaxy Note 4',
    Galaxy_Note_8 = 'Galaxy Note 8',
    Galaxy_Note_9 = 'Galaxy Note 9',
    Galaxy_S3 = 'Galaxy S3',
    Galaxy_S5 = 'Galaxy S5',
    Galaxy_S8 = 'Galaxy S8',
    Galaxy_S8_Plus = 'Galaxy S8 Plus',
    Galaxy_S9 = 'Galaxy S9',
    Galaxy_S9_Plus = 'Galaxy S9 Plus',
    Galaxy_S10 = 'Galaxy S10',
    Galaxy_S10_Plus = 'Galaxy S10 Plus',
    Galaxy_S20 = 'Galaxy S20',
    iPad = 'iPad',
    iPad_6th_Gen = 'iPad 6th Gen',
    iPad_7th_Gen = 'iPad 7th Gen',
    iPad_Air_2 = 'iPad Air 2',
    iPad_Mini = 'iPad Mini',
    iPad_Pro = 'iPad Pro',
    iPhone_11 = 'iPhone 11',
    iPhone_11_Pro = 'iPhone 11 Pro',
    iPhone_11_Pro_Max = 'iPhone 11 Pro Max',
    iPhone_4 = 'iPhone 4',
    iPhone_5SE = 'iPhone 5/SE',
    iPhone_6_7_8 = 'iPhone 6/7/8',
    iPhone_6_7_8_Plus = 'iPhone 6/7/8 Plus',
    iPhone_X = 'iPhone X',
    iPhone_XR = 'iPhone XR',
    iPhone_XS = 'iPhone XS',
    iPhone_XS_Max = 'iPhone XS Max',
    Kindle_Fire_HDX = 'Kindle Fire HDX',
    Laptop_with_HiDPI_screen = 'Laptop with HiDPI screen',
    Laptop_with_MDPI_screen = 'Laptop with MDPI screen',
    Laptop_with_touch = 'Laptop with touch',
    LG_G6 = 'LG G6',
    LG_Optimus_L70 = 'LG Optimus L70',
    Microsoft_Lumia_550 = 'Microsoft Lumia 550',
    Microsoft_Lumia_950 = 'Microsoft Lumia 950',
    Nexus_10 = 'Nexus 10',
    Nexus_4 = 'Nexus 4',
    Nexus_5 = 'Nexus 5',
    Nexus_5X = 'Nexus 5X',
    Nexus_6 = 'Nexus 6',
    Nexus_6P = 'Nexus 6P',
    Nexus_7 = 'Nexus 7',
    Nokia_Lumia_520 = 'Nokia Lumia 520',
    Nokia_N9 = 'Nokia N9',
    OnePlus_7T = 'OnePlus 7T',
    OnePlus_7T_Pro = 'OnePlus 7T Pro',
    Pixel_2 = 'Pixel 2',
    Pixel_2_XL = 'Pixel 2 XL',
    Pixel_3 = 'Pixel 3',
    Pixel_3_XL = 'Pixel 3 XL',
    Pixel_4 = 'Pixel 4',
    Pixel_4_XL = 'Pixel 4 XL',
    Pixel_5 = 'Pixel 5'
}
export type FailureReportPlain = "IMMEDIATE" | "ON_CLOSE";
export enum FailureReport {
    IMMEDIATE = 'IMMEDIATE',
    ON_CLOSE = 'ON_CLOSE'
}
export type IosDeviceNamePlain = "iPhone 11" | "iPhone 11 Pro" | "iPhone 11 Pro Max" | "iPhone X" | "iPhone XR" | "iPhone 13 Pro Max" | "iPhone 13 Pro" | "iPhone 13" | "iPhone 12 Pro Max" | "iPhone 12 Pro" | "iPhone 12" | "iPhone 12 mini" | "iPhone Xs" | "iPhone 8" | "iPhone 7" | "iPad Pro (12.9-inch) (3rd generation)" | "iPad (7th generation)" | "iPad (9th generation)" | "iPad Air (2nd generation)";
export enum IosDeviceName {
    iPhone_13_Pro_Max = 'iPhone 13 Pro Max',
    iPhone_13_Pro = 'iPhone 13 Pro',
    iPhone_13 = 'iPhone 13',
    iPhone_12_Pro_Max = 'iPhone 12 Pro Max',
    iPhone_12_Pro = 'iPhone 12 Pro',
    iPhone_12 = 'iPhone 12',
    iPhone_12_mini = 'iPhone 12 mini',
    iPhone_11_Pro = 'iPhone 11 Pro',
    iPhone_11_Pro_Max = 'iPhone 11 Pro Max',
    iPhone_11 = 'iPhone 11',
    iPhone_XR = 'iPhone XR',
    iPhone_XS = 'iPhone Xs',
    iPhone_X = 'iPhone X',
    iPhone_8 = 'iPhone 8',
    iPhone_7 = 'iPhone 7',
    iPad_Pro_3 = 'iPad Pro (12.9-inch) (3rd generation)',
    iPad_7 = 'iPad (7th generation)',
    iPad_9 = 'iPad (9th generation)',
    iPad_Air_2 = 'iPad Air (2nd generation)'
}
export type IosVersionPlain = "latest" | "latest-1";
export enum IosVersion {
    LATEST = 'latest',
    ONE_VERSION_BACK = 'latest-1',
    LATEST_ONE_VERSION_BACK = 'latest-1'
}
export type MatchLevelPlain = "None" | "Layout1" | "Layout" | "Layout2" | "Content" | "Strict" | "Exact";
export enum MatchLevel {
    None = 'None',
    LegacyLayout = 'Layout1',
    Layout = 'Layout',
    Layout2 = 'Layout2',
    Content = 'Content',
    Strict = 'Strict',
    Exact = 'Exact'
}
export type ScreenOrientationPlain = "portrait" | "landscape";
export enum ScreenOrientation {
    PORTRAIT = 'portrait',
    LANDSCAPE = 'landscape'
}
export type SessionTypePlain = "SEQUENTIAL" | "PROGRESSION";
export enum SessionType {
    SEQUENTIAL = 'SEQUENTIAL',
    PROGRESSION = 'PROGRESSION'
}
export type StitchModePlain = "Scroll" | "CSS";
export enum StitchMode {
    SCROLL = 'Scroll',
    CSS = 'CSS'
}
export type TestResultsStatusPlain = "Passed" | "Failed" | "Unresolved";
export enum TestResultsStatus {
    Passed = 'Passed',
    Unresolved = 'Unresolved',
    Failed = 'Failed'
}
export class EyesError extends Error {
}
export class TestFailedError extends EyesError {
    constructor(message: string, results?: TestResultsPlain);
    constructor(results: TestResultsPlain);
    get testResults(): TestResultsPlain;
    getTestResults(): TestResults;
}
export class DiffsFoundError extends TestFailedError {
    constructor(message: string, results?: TestResultsPlain);
    constructor(results: TestResultsPlain);
}
export class NewTestError extends TestFailedError {
    constructor(message: string, results?: TestResultsPlain);
    constructor(results: TestResultsPlain);
}
export type AccessibilityMatchSettingsPlain = { region: RegionPlain; type?: AccessibilityRegionTypePlain; };
export class AccessibilityMatchSettings implements Required<AccessibilityMatchSettingsPlain> {
    constructor(settings: AccessibilityMatchSettingsPlain);
    constructor(region: RegionPlain);
    constructor(x: number, y: number, width: number, height: number, type?: AccessibilityRegionTypePlain);
    get region(): RegionPlain;
    set region(region: RegionPlain);
    getRegion(): Region;
    setRegion(region: RegionPlain): void;
    getLeft(): number;
    setLeft(left: number): void;
    getTop(): number;
    setTop(top: number): void;
    getWidth(): number;
    setWidth(width: number): void;
    getHeight(): number;
    setHeight(height: number): void;
    get type(): AccessibilityRegionTypePlain;
    set type(type: AccessibilityRegionTypePlain);
    getType(): AccessibilityRegionType;
    setType(type: AccessibilityRegionTypePlain): void;
}
export type AccessibilitySettings = { level?: AccessibilityLevelPlain; guidelinesVersion?: AccessibilityGuidelinesVersionPlain; };
export type BatchInfoPlain = {
    id?: string;
    name?: string;
    sequenceName?: string;
    startedAt?: string | Date;
    notifyOnCompletion?: boolean;
    properties?: Array<PropertyDataPlain>;
};
export class BatchInfo implements Required<BatchInfoPlain> {
    constructor();
    constructor(batch?: BatchInfoPlain);
    constructor(name?: string, startedAt?: string | Date, id?: string);
    get id(): string;
    set id(id: string);
    getId(): string;
    setId(id: string): BatchInfo;
    get name(): string;
    set name(name: string);
    getName(): string;
    setName(name: string): BatchInfo;
    get sequenceName(): string;
    set sequenceName(sequenceName: string);
    getSequenceName(): string;
    setSequenceName(sequenceName: string): BatchInfo;
    get startedAt(): string | Date;
    set startedAt(startedAt: string | Date);
    getStartedAt(): string | Date;
    setStartedAt(startedAt: string | Date): BatchInfo;
    get notifyOnCompletion(): boolean;
    set notifyOnCompletion(notifyOnCompletion: boolean);
    getNotifyOnCompletion(): boolean;
    setNotifyOnCompletion(notifyOnCompletion: boolean): BatchInfo;
    get properties(): Array<PropertyDataPlain>;
    set properties(properties: Array<PropertyDataPlain>);
    getProperties(): Array<PropertyData>;
    setProperties(properties: Array<PropertyDataPlain>): BatchInfo;
    addProperty(property: PropertyDataPlain): BatchInfo;
}
export type CutProviderPlain = { top: number; right: number; bottom: number; left: number; } | { x: number; y: number; width: number; height: number; };
export class CutProvider implements Required<{
    x: number;
    y: number;
    width: number;
    height: number;
    top: number;
    right: number;
    bottom: number;
    left: number;
}> {
    constructor(rectOrRegion: CutProviderPlain);
    constructor(top: number, bottom: number, left: number, right: number);
    get top(): number;
    get right(): number;
    get bottom(): number;
    get left(): number;
    get width(): number;
    get height(): number;
    get x(): number;
    get y(): number;
    scale(scaleRatio: number): CutProvider;
}
export class FixedCutProvider extends CutProvider {
}
export class UnscaledFixedCutProvider extends CutProvider {
    scale(): UnscaledFixedCutProvider;
}
export type ExactMatchSettingsPlain = { minDiffIntensity: number; minDiffWidth: number; minDiffHeight: number; matchThreshold: number; };
export class ExactMatchSettings implements Required<ExactMatchSettingsPlain> {
    constructor(settings: ExactMatchSettingsPlain);
    get minDiffIntensity(): number;
    set minDiffIntensity(minDiffIntensity: number);
    getMinDiffIntensity(): number;
    setMinDiffIntensity(value: number): void;
    get minDiffWidth(): number;
    set minDiffWidth(minDiffWidth: number);
    getMinDiffWidth(): number;
    setMinDiffWidth(value: number): void;
    get minDiffHeight(): number;
    set minDiffHeight(minDiffHeight: number);
    getMinDiffHeight(): number;
    setMinDiffHeight(value: number): void;
    get matchThreshold(): number;
    set matchThreshold(matchThreshold: number);
    getMatchThreshold(): number;
    setMatchThreshold(value: number): void;
}
export type FloatingMatchSettingsPlain = {
    region: RegionPlain;
    maxUpOffset?: number;
    maxDownOffset?: number;
    maxLeftOffset?: number;
    maxRightOffset?: number;
};
export class FloatingMatchSettings implements Required<FloatingMatchSettingsPlain> {
    constructor(settings: FloatingMatchSettingsPlain);
    constructor(region: RegionPlain);
    constructor(x: number, y: number, width: number, height: number, maxUpOffset?: number, maxDownOffset?: number, maxLeftOffset?: number, maxRightOffset?: number);
    get region(): RegionPlain;
    set region(region: RegionPlain);
    getRegion(): Region;
    setRegion(region: RegionPlain): void;
    getLeft(): number;
    setLeft(left: number): void;
    getTop(): number;
    setTop(top: number): void;
    getWidth(): number;
    setWidth(width: number): void;
    getHeight(): number;
    setHeight(height: number): void;
    get maxUpOffset(): number;
    set maxUpOffset(maxUpOffset: number);
    getMaxUpOffset(): number;
    setMaxUpOffset(maxUpOffset: number): void;
    get maxDownOffset(): number;
    set maxDownOffset(maxDownOffset: number);
    getMaxDownOffset(): number;
    setMaxDownOffset(maxDownOffset: number): void;
    get maxLeftOffset(): number;
    set maxLeftOffset(maxLeftOffset: number);
    getMaxLeftOffset(): number;
    setMaxLeftOffset(maxLeftOffset: number): void;
    get maxRightOffset(): number;
    set maxRightOffset(maxRightOffset: number);
    getMaxRightOffset(): number;
    setMaxRightOffset(maxRightOffset: number): void;
}
export type ImageMatchSettingsPlain = {
    exact?: ExactMatchSettingsPlain;
    matchLevel?: MatchLevelPlain;
    ignoreCaret?: boolean;
    useDom?: boolean;
    enablePatterns?: boolean;
    ignoreDisplacements?: boolean;
    ignoreRegions?: Array<RegionPlain>;
    layoutRegions?: Array<RegionPlain>;
    strictRegions?: Array<RegionPlain>;
    contentRegions?: Array<RegionPlain>;
    floatingRegions?: Array<FloatingMatchSettingsPlain | RegionPlain>;
    accessibilityRegions?: Array<AccessibilityMatchSettingsPlain | RegionPlain>;
    accessibilitySettings?: AccessibilitySettings;
};
export class ImageMatchSettings implements Required<ImageMatchSettingsPlain> {
    constructor(settings?: ImageMatchSettingsPlain);
    get exact(): ExactMatchSettingsPlain;
    set exact(exact: ExactMatchSettingsPlain);
    getExact(): ExactMatchSettings;
    setExact(exact: ExactMatchSettingsPlain): void;
    get matchLevel(): MatchLevelPlain;
    set matchLevel(matchLevel: MatchLevelPlain);
    getMatchLevel(): MatchLevel;
    setMatchLevel(matchLevel: MatchLevelPlain): void;
    get ignoreCaret(): boolean;
    set ignoreCaret(ignoreCaret: boolean);
    getIgnoreCaret(): boolean;
    setIgnoreCaret(ignoreCaret: boolean): void;
    get useDom(): boolean;
    set useDom(useDom: boolean);
    getUseDom(): boolean;
    setUseDom(useDom: boolean): void;
    get enablePatterns(): boolean;
    set enablePatterns(enablePatterns: boolean);
    getEnablePatterns(): boolean;
    setEnablePatterns(enablePatterns: boolean): void;
    get ignoreDisplacements(): boolean;
    set ignoreDisplacements(ignoreDisplacements: boolean);
    getIgnoreDisplacements(): boolean;
    setIgnoreDisplacements(ignoreDisplacements: boolean): void;
    get ignoreRegions(): Array<RegionPlain>;
    set ignoreRegions(ignoreRegions: Array<RegionPlain>);
    getIgnoreRegions(): Array<Region>;
    setIgnoreRegions(ignoreRegions: Array<RegionPlain>): void;
    get layoutRegions(): Array<RegionPlain>;
    set layoutRegions(layoutRegions: Array<RegionPlain>);
    get layout(): Array<RegionPlain>;
    set layout(layout: Array<RegionPlain>);
    getLayoutRegions(): Array<Region>;
    setLayoutRegions(layoutRegions: Array<RegionPlain>): void;
    get strictRegions(): Array<RegionPlain>;
    set strictRegions(strictRegions: Array<RegionPlain>);
    get strict(): Array<RegionPlain>;
    set strict(strict: Array<RegionPlain>);
    getStrictRegions(): Array<Region>;
    setStrictRegions(strictRegions: Array<RegionPlain>): void;
    get contentRegions(): Array<RegionPlain>;
    set contentRegions(contentRegions: Array<RegionPlain>);
    get content(): Array<RegionPlain>;
    set content(content: Array<RegionPlain>);
    getContentRegions(): Array<Region>;
    setContentRegions(contentRegions: Array<RegionPlain>): void;
    get floatingRegions(): Array<FloatingMatchSettingsPlain | RegionPlain>;
    set floatingRegions(floatingRegions: Array<FloatingMatchSettingsPlain | RegionPlain>);
    get floating(): Array<FloatingMatchSettingsPlain | RegionPlain>;
    set floating(floating: Array<FloatingMatchSettingsPlain | RegionPlain>);
    getFloatingRegions(): Array<FloatingMatchSettings>;
    setFloatingRegions(floatingRegions: Array<FloatingMatchSettingsPlain>): void;
    get accessibilityRegions(): Array<AccessibilityMatchSettingsPlain | RegionPlain>;
    set accessibilityRegions(accessibilityRegions: Array<AccessibilityMatchSettingsPlain | RegionPlain>);
    get accessibility(): Array<AccessibilityMatchSettingsPlain | RegionPlain>;
    set accessibility(accessibility: Array<AccessibilityMatchSettingsPlain | RegionPlain>);
    getAccessibilityRegions(): Array<AccessibilityMatchSettings>;
    setAccessibilityRegions(accessibilityRegions: Array<AccessibilityMatchSettingsPlain>): void;
    get accessibilitySettings(): AccessibilitySettings;
    set accessibilitySettings(accessibilitySettings: AccessibilitySettings);
    getAccessibilitySettings(): AccessibilitySettings;
    setAccessibilitySettings(accessibilitySettings: AccessibilitySettings): void;
}
export type ImageRotationPlain = 0 | 270 | -270 | 180 | -180 | 90 | -90;
export class ImageRotation {
    constructor(rotation: ImageRotationPlain);
    get rotation(): ImageRotationPlain;
    set rotation(rotation: ImageRotationPlain);
    getRotation(): ImageRotationPlain;
    setRotation(rotation: ImageRotationPlain): void;
}
export type LocationPlain = { x: number; y: number; };
export class Location implements Required<LocationPlain> {
    constructor(location: LocationPlain);
    constructor(x: number, y: number);
    get x(): number;
    set x(x: number);
    getX(): number;
    setX(x: number): void;
    get y(): number;
    set y(y: number);
    getY(): number;
    setY(y: number): void;
}
export type LogHandlerPlain = CustomLogHandlerPlain | FileLogHandlerPlain | ConsoleLogHandlerPlain;
export type CustomLogHandlerPlain = {
    log(message: any): void;
    warn?(message: any): void;
    error?(message: any): void;
    fatal?(message: any): void;
    open?(): void;
    close?(): void;
};
export type FileLogHandlerPlain = { type: "file"; filename?: string; append?: boolean; };
export type ConsoleLogHandlerPlain = { type: "console"; };
export abstract class LogHandler implements CustomLogHandlerPlain {
    constructor(verbose?: boolean);
    get verbose(): boolean;
    set verbose(verbose: boolean);
    getIsVerbose(): boolean;
    setIsVerbose(verbose: boolean): void;
    log(message: string): void;
    abstract onMessage(message: string): void;
    abstract open(): void;
    abstract close(): void;
}
export class FileLogHandler extends LogHandler implements FileLogHandlerPlain {
    constructor(verbose?: boolean, filename?: string, append?: boolean);
    readonly type: "file";
    readonly filename: string;
    readonly append: boolean;
    onMessage(): void;
    open(): void;
    close(): void;
}
export class ConsoleLogHandler extends LogHandler implements ConsoleLogHandlerPlain {
    readonly type: "console";
    onMessage(): void;
    open(): void;
    close(): void;
}
export class NullLogHandler extends LogHandler {
    onMessage(): void;
    open(): void;
    close(): void;
}
export type OCRSettings<TPattern extends string = string> = { patterns: Array<TPattern>; ignoreCase?: boolean; firstOnly?: boolean; language?: string; };
export type PropertyDataPlain = { name: string; value: string; };
export class PropertyData implements Required<PropertyDataPlain> {
    constructor(property: PropertyDataPlain);
    constructor(name: string, value: string);
    get name(): string;
    set name(name: string);
    getName(): string;
    setName(name: string): void;
    get value(): string;
    set value(value: string);
    getValue(): string;
    setValue(value: string): void;
}
export type ProxySettingsPlain = { url: string; username?: string; password?: string; isHttpOnly?: boolean; };
export class ProxySettings implements Required<ProxySettingsPlain> {
    constructor(proxy: ProxySettingsPlain);
    constructor(url: string, username?: string, password?: string, isHttpOnly?: boolean);
    get url(): string;
    getUri(): string;
    getUrl(): string;
    get username(): string;
    getUsername(): string;
    get password(): string;
    getPassword(): string;
    get isHttpOnly(): boolean;
    getIsHttpOnly(): boolean;
}
export type RectangleSizePlain = { width: number; height: number; };
export class RectangleSize implements Required<RectangleSizePlain> {
    constructor(size: RectangleSizePlain);
    constructor(width: number, height: number);
    get width(): number;
    set width(width: number);
    getWidth(): number;
    setWidth(width: number): void;
    get height(): number;
    set height(height: number);
    getHeight(): number;
    setHeight(height: number): void;
}
export type RegionPlain = LocationPlain & RectangleSizePlain;
export type LegacyRegionPlain = { left: number; top: number; width: number; height: number; };
export class Region implements Required<RegionPlain> {
    constructor(region: RegionPlain);
    constructor(location: LocationPlain, size: RectangleSizePlain);
    constructor(x: number, y: number, width: number, height: number);
    get x(): number;
    set x(x: number);
    get left(): number;
    set left(left: number);
    getX(): number;
    setX(x: number): void;
    getLeft(): number;
    setLeft(left: number): void;
    get y(): number;
    set y(y: number);
    get top(): number;
    set top(top: number);
    getY(): number;
    setY(y: number): void;
    getTop(): number;
    setTop(top: number): void;
    get width(): number;
    set width(width: number);
    getWidth(): number;
    setWidth(width: number): void;
    get height(): number;
    set height(height: number);
    getHeight(): number;
    setHeight(height: number): void;
}
export type DesktopBrowserInfo = { name?: BrowserTypePlain; width: number; height: number; };
export type ChromeEmulationInfo = { chromeEmulationInfo: { deviceName: DeviceNamePlain; screenOrientation?: ScreenOrientationPlain; }; };
export type IOSDeviceInfo = { iosDeviceInfo: { deviceName: IosDeviceNamePlain; iosVersion?: IosVersionPlain; screenOrientation?: ScreenOrientationPlain; }; };
export type RunnerOptionsPlain = { testConcurrency?: number; };
export class RunnerOptionsFluent {
    testConcurrency(concurrency: number): RunnerOptionsFluent;
}
export function RunnerOptions(): RunnerOptionsFluent;
export type VisualLocatorSettings<TLocator extends string = string> = { locatorNames: Array<TLocator>; firstOnly: boolean; };
export type ApiUrlsPlain = {
    readonly baselineImage?: string;
    readonly currentImage?: string;
    readonly checkpointImage?: string;
    readonly checkpointImageThumbnail?: string;
    readonly diffImage?: string;
};
export class ApiUrls implements Required<ApiUrlsPlain> {
    get baselineImage(): string;
    getBaselineImage(): string;
    setBaselineImage(setBaselineImage: string): void;
    get currentImage(): string;
    getCurrentImage(): string;
    setCurrentImage(currentImage: string): void;
    get checkpointImage(): string;
    getCheckpointImage(): string;
    setCheckpointImage(checkpointImage: string): void;
    get checkpointImageThumbnail(): string;
    getCheckpointImageThumbnail(): string;
    setCheckpointImageThumbnail(checkpointImageThumbnail: string): void;
    get diffImage(): string;
    getDiffImage(): string;
    setDiffImage(diffImage: string): void;
}
export type AppUrlsPlain = { readonly step?: string; readonly stepEditor?: string; };
export class AppUrls implements Required<AppUrlsPlain> {
    get step(): string;
    getStep(): string;
    setStep(step: string): void;
    get stepEditor(): string;
    getStepEditor(): string;
    setStepEditor(stepEditor: string): void;
}
export type MatchResultPlain = { readonly asExpected?: boolean; readonly windowId?: number; };
export class MatchResult implements Required<MatchResultPlain> {
    get asExpected(): boolean;
    getAsExpected(): boolean;
    setAsExpected(asExpected: boolean): void;
    get windowId(): number;
    getWindowId(): number;
    setWindowId(windowId: number): void;
}
export type SessionUrlsPlain = { readonly batch?: string; readonly session?: string; };
export class SessionUrls implements Required<SessionUrlsPlain> {
    get batch(): string;
    getBatch(): string;
    setBatch(batch: string): void;
    get session(): string;
    getSession(): string;
    setSession(session: string): void;
}
export type StepInfoPlain = {
    readonly name?: string;
    readonly isDifferent?: boolean;
    readonly hasBaselineImage?: boolean;
    readonly hasCurrentImage?: boolean;
    readonly appUrls?: AppUrlsPlain;
    readonly apiUrls?: ApiUrlsPlain;
    readonly renderId?: Array<string>;
};
export class StepInfo implements Required<StepInfoPlain> {
    get name(): string;
    getName(): string;
    setName(value: string): void;
    get isDifferent(): boolean;
    getIsDifferent(): boolean;
    setIsDifferent(value: boolean): void;
    get hasBaselineImage(): boolean;
    getHasBaselineImage(): boolean;
    setHasBaselineImage(value: boolean): void;
    get hasCurrentImage(): boolean;
    getHasCurrentImage(): boolean;
    setHasCurrentImage(hasCurrentImage: boolean): void;
    get appUrls(): AppUrlsPlain;
    getAppUrls(): AppUrls;
    setAppUrls(appUrls: AppUrlsPlain): void;
    get apiUrls(): ApiUrlsPlain;
    getApiUrls(): ApiUrls;
    setApiUrls(apiUrls: ApiUrlsPlain): void;
    get renderId(): Array<string>;
    getRenderId(): Array<string>;
    setRenderId(renderId: Array<string>): void;
}
export type TestAccessibilityStatus = { readonly status: AccessibilityStatusPlain; readonly level: AccessibilityLevelPlain; readonly version: AccessibilityGuidelinesVersionPlain; };
export type TestResultsPlain = {
    readonly id?: string;
    readonly name?: string;
    readonly secretToken?: string;
    readonly status?: TestResultsStatusPlain;
    readonly appName?: string;
    readonly batchId?: string;
    readonly batchName?: string;
    readonly branchName?: string;
    readonly hostOS?: string;
    readonly hostApp?: string;
    readonly hostDisplaySize?: RectangleSizePlain;
    readonly accessibilityStatus?: TestAccessibilityStatus;
    readonly startedAt?: string | Date;
    readonly duration?: number;
    readonly isNew?: boolean;
    readonly isDifferent?: boolean;
    readonly isAborted?: boolean;
    readonly appUrls?: SessionUrlsPlain;
    readonly apiUrls?: SessionUrlsPlain;
    readonly stepsInfo?: Array<StepInfoPlain>;
    readonly steps?: number;
    readonly matches?: number;
    readonly mismatches?: number;
    readonly missing?: number;
    readonly exactMatches?: number;
    readonly strictMatches?: number;
    readonly contentMatches?: number;
    readonly layoutMatches?: number;
    readonly noneMatches?: number;
    readonly url?: string;
};
export class TestResults implements Required<TestResultsPlain> {
    get id(): string;
    getId(): string;
    setId(id: string): void;
    get name(): string;
    getName(): string;
    setName(name: string): void;
    get secretToken(): string;
    getSecretToken(): string;
    setSecretToken(secretToken: string): void;
    get status(): TestResultsStatusPlain;
    getStatus(): TestResultsStatus;
    setStatus(status: TestResultsStatus): void;
    get appName(): string;
    getAppName(): string;
    setAppName(appName: string): void;
    get batchName(): string;
    getBatchName(): string;
    setBatchName(batchName: string): void;
    get batchId(): string;
    getBatchId(): string;
    setBatchId(batchId: string): void;
    get branchName(): string;
    getBranchName(): string;
    setBranchName(branchName: string): void;
    get hostOS(): string;
    getHostOS(): string;
    setHostOS(hostOS: string): void;
    get hostApp(): string;
    getHostApp(): string;
    setHostApp(hostApp: string): void;
    get hostDisplaySize(): RectangleSizePlain;
    getHostDisplaySize(): RectangleSize;
    setHostDisplaySize(hostDisplaySize: RectangleSizePlain): void;
    get accessibilityStatus(): TestAccessibilityStatus;
    getAccessibilityStatus(): TestAccessibilityStatus;
    setAccessibilityStatus(accessibilityStatus: TestAccessibilityStatus): void;
    get startedAt(): string | Date;
    getStartedAt(): Date;
    setStartedAt(startedAt: string | Date): void;
    get duration(): number;
    getDuration(): number;
    setDuration(duration: number): void;
    get isNew(): boolean;
    getIsNew(): boolean;
    setIsNew(isNew: boolean): void;
    get isDifferent(): boolean;
    getIsDifferent(): boolean;
    setIsDifferent(isDifferent: boolean): void;
    get isAborted(): boolean;
    getIsAborted(): boolean;
    setIsAborted(isAborted: boolean): void;
    get appUrls(): SessionUrlsPlain;
    getAppUrls(): SessionUrls;
    setAppUrls(appUrls: SessionUrlsPlain): void;
    get apiUrls(): SessionUrlsPlain;
    getApiUrls(): SessionUrls;
    setApiUrls(apiUrls: SessionUrlsPlain): void;
    get stepsInfo(): Array<StepInfoPlain>;
    getStepsInfo(): Array<StepInfo>;
    setStepsInfo(stepInfo: Array<StepInfoPlain>): void;
    get steps(): number;
    getSteps(): number;
    setSteps(steps: number): void;
    get matches(): number;
    getMatches(): number;
    setMatches(matches: number): void;
    get mismatches(): number;
    getMismatches(): number;
    setMismatches(mismatches: number): void;
    get missing(): number;
    getMissing(): number;
    setMissing(missing: number): void;
    get exactMatches(): number;
    getExactMatches(): number;
    setExactMatches(exactMatches: number): void;
    get strictMatches(): number;
    getStrictMatches(): number;
    setStrictMatches(strictMatches: number): void;
    get contentMatches(): number;
    getContentMatches(): number;
    setContentMatches(contentMatches: number): void;
    get layoutMatches(): number;
    getLayoutMatches(): number;
    setLayoutMatches(layoutMatches: number): void;
    get noneMatches(): number;
    getNoneMatches(): number;
    setNoneMatches(noneMatches: number): void;
    get url(): string;
    getUrl(): string;
    setUrl(url: string): void;
    isPassed(): boolean;
    delete(): Promise<void>;
    deleteSession(): Promise<void>;
}
export type TestResultContainerPlain = { readonly exception: Error; readonly testResults: TestResultsPlain; };
export class TestResultContainer implements Required<TestResultContainerPlain> {
    get testResults(): TestResultsPlain;
    getTestResults(): TestResults;
    get exception(): Error;
    getException(): Error;
}
export type TestResultsSummaryPlain = Iterable<TestResultContainerPlain>;
export class TestResultsSummary implements TestResultsSummaryPlain {
    getAllResults(): Array<TestResultContainer>;
    [Symbol.iterator](): Iterator<TestResultContainer, any, undefined>;
}
export type TextRegion = {
    x: number;
    y: number;
    width: number;
    height: number;
    text: string;
};
export type ValidationInfoPlain = { readonly validationId: number; readonly tag: string; };
export class ValidationInfo implements Required<ValidationInfoPlain> {
    get validationId(): number;
    getValidationId(): number;
    get tag(): string;
    getTag(): string;
}
export type ValidationResultPlain = { readonly asExpected: boolean; };
export class ValidationResult implements Required<ValidationResultPlain> {
    get asExpected(): boolean;
    getAsExpected(): boolean;
}
export type EyesSelector<TSelector = never> = string | TSelector | { selector: string | TSelector; type?: string; shadow?: EyesSelector<TSelector>; frame?: EyesSelector<TSelector>; };
export class Logger {
    constructor(options?: { show?: boolean; label?: string; handler?: LogHandlerPlain; });
    constructor(show?: boolean);
    getLogHandler(): LogHandler;
    setLogHandler(handler: LogHandlerPlain): void;
    verbose(...messages: Array<any>): void;
    log(...messages: Array<any>): void;
    warn(...messages: Array<any>): void;
    error(...messages: Array<any>): void;
    fatal(...messages: Array<any>): void;
    open(): void;
    close(): void;
    extend(label?: string, color?: string | Array<string>): Logger;
}
export function closeBatch(spec: { closeBatches(options: { settings: { batchIds: Array<string>; serverUrl?: string; apiKey?: string; proxy?: ProxySettingsPlain; }; }): Promise<void>; }): (options: { batchIds: Array<string>; serverUrl?: string; apiKey?: string; proxy?: ProxySettingsPlain; }) => Promise<void>;
export abstract class EyesRunner {
    getAllTestResults(throwErr?: boolean): Promise<TestResultsSummary>;
}
export class ClassicRunner extends EyesRunner {
}
export class VisualGridRunner extends EyesRunner {
    constructor(options?: RunnerOptionsPlain);
    constructor(options?: RunnerOptionsFluent);
    constructor(legacyConcurrency?: number);
    get testConcurrency(): number;
    get legacyConcurrency(): number;
    getConcurrentSessions(): number;
}
export abstract class SessionEventHandler {
    abstract initStarted(): any;
    abstract initEnded(): any;
    abstract setSizeWillStart(viewportSize: RectangleSize): any;
    abstract setSizeEnded(): any;
    abstract testStarted(sessionId: string): any;
    abstract testEnded(sessionId: string, testResults: TestResults): any;
    abstract validationWillStart(sessionId: string, validationInfo: ValidationInfo): any;
    abstract validationEnded(sessionId: string, validationId: number, validationResult: ValidationResult): any;
}
export class SessionEventHandlers extends SessionEventHandler {
    addEventHandler(handler: SessionEventHandler): void;
    removeEventHandler(handler: SessionEventHandler): void;
    clearEventHandlers(): void;
    initStarted(): void;
    initEnded(): void;
    setSizeWillStart(viewportSize: RectangleSize): void;
    setSizeEnded(): void;
    testStarted(sessionId: string): void;
    testEnded(sessionId: string, testResults: TestResults): void;
    validationWillStart(sessionId: string, validationInfo: ValidationInfo): void;
    validationEnded(sessionId: string, validationId: number, validationResult: ValidationResult): void;
}
export class RemoteSessionEventHandler extends SessionEventHandler {
    constructor(options: { serverUrl: string; accessKey?: string; timeout?: number; });
    constructor(serverUrl: string, accessKey?: string, timeout?: number);
    get serverUrl(): string;
    set serverUrl(serverUrl: string);
    getServerUrl(): string;
    setServerUrl(serverUrl: string): void;
    get accessKey(): string;
    set accessKey(accessKey: string);
    getAccessKey(): string;
    setAccessKey(accessKey: string): void;
    get timeout(): number;
    set timeout(timeout: number);
    setTimeout(timeout: number): void;
    getTimeout(): number;
    initStarted(): void;
    initEnded(): void;
    setSizeWillStart(): void;
    setSizeEnded(): void;
    testStarted(): void;
    testEnded(): void;
    validationWillStart(): void;
    validationEnded(): void;
}
