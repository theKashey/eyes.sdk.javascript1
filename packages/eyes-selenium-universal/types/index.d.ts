export enum AccessibilityGuidelinesVersion {
  WCAG_2_0 = 'WCAG_2_0',
  WCAG_2_1 = 'WCAG_2_1',
}

export enum AccessibilityLevel {
  AA = 'AA',
  AAA = 'AAA',
}

export enum AccessibilityRegionType {
  BoldText = 'BoldText',
  GraphicalObject = 'GraphicalObject',
  IgnoreContrast = 'IgnoreContrast',
  LargeText = 'LargeText',
  RegularText = 'RegularText',
}

export enum AccessibilityStatus {
  Failed = 'Failed',
  Passed = 'Passed',
}

export enum BrowserType {
  CHROME = 'chrome',
  CHROME_ONE_VERSION_BACK = 'chrome-one-version-back',
  CHROME_TWO_VERSIONS_BACK = 'chrome-two-versions-back',
  EDGE = 'edge',
  EDGE_CHROMIUM = 'edgechromium',
  EDGE_CHROMIUM_ONE_VERSION_BACK = 'edgechromium-one-version-back',
  EDGE_CHROMIUM_TWO_VERSIONS_BACK = 'edgechromium-two-versions-back',
  EDGE_LEGACY = 'edgelegacy',
  FIREFOX = 'firefox',
  FIREFOX_ONE_VERSION_BACK = 'firefox-one-version-back',
  FIREFOX_TWO_VERSIONS_BACK = 'firefox-two-versions-back',
  IE_10 = 'ie10',
  IE_11 = 'ie',
  SAFARI = 'safari',
  SAFARI_EARLY_ACCESS = 'safari-earlyaccess',
  SAFARI_ONE_VERSION_BACK = 'safari-one-version-back',
  SAFARI_TWO_VERSIONS_BACK = 'safari-two-versions-back',
}

/** @undocumented */
export enum CorsIframeHandle {
  BLANK = 'BLANK',
  KEEP = 'KEEP',
  SNAPSHOT = 'SNAPSHOT',
}

export enum DeviceName {
  BlackBerry_Z30 = 'BlackBerry Z30',
  Blackberry_PlayBook = 'Blackberry PlayBook',
  Galaxy_A5 = 'Galaxy A5',
  Galaxy_Note_10 = 'Galaxy Note 10',
  Galaxy_Note_10_Plus = 'Galaxy Note 10 Plus',
  Galaxy_Note_2 = 'Galaxy Note 2',
  Galaxy_Note_3 = 'Galaxy Note 3',
  Galaxy_Note_4 = 'Galaxy Note 4',
  Galaxy_Note_8 = 'Galaxy Note 8',
  Galaxy_Note_9 = 'Galaxy Note 9',
  Galaxy_S10 = 'Galaxy S10',
  Galaxy_S10_Plus = 'Galaxy S10 Plus',
  Galaxy_S20 = 'Galaxy S20',
  Galaxy_S3 = 'Galaxy S3',
  Galaxy_S5 = 'Galaxy S5',
  Galaxy_S8 = 'Galaxy S8',
  Galaxy_S8_Plus = 'Galaxy S8 Plus',
  Galaxy_S9 = 'Galaxy S9',
  Galaxy_S9_Plus = 'Galaxy S9 Plus',
  Kindle_Fire_HDX = 'Kindle Fire HDX',
  LG_G6 = 'LG G6',
  LG_Optimus_L70 = 'LG Optimus L70',
  Laptop_with_HiDPI_screen = 'Laptop with HiDPI screen',
  Laptop_with_MDPI_screen = 'Laptop with MDPI screen',
  Laptop_with_touch = 'Laptop with touch',
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
  Pixel_5 = 'Pixel 5',
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
}

export enum FailureReport {
  IMMEDIATE = 'IMMEDIATE',
  ON_CLOSE = 'ON_CLOSE',
}

export enum IosDeviceName {
  iPad_7 = 'iPad (7th generation)',
  iPad_Air_2 = 'iPad Air (2nd generation)',
  iPad_Pro_3 = 'iPad Pro (12.9-inch) (3rd generation)',
  iPhone_11 = 'iPhone 11',
  iPhone_11_Pro = 'iPhone 11 Pro',
  iPhone_11_Pro_Max = 'iPhone 11 Pro Max',
  iPhone_12 = 'iPhone 12',
  iPhone_12_Pro = 'iPhone 12 Pro',
  iPhone_12_Pro_Max = 'iPhone 12 Pro Max',
  iPhone_12_mini = 'iPhone 12 mini',
  iPhone_7 = 'iPhone 7',
  iPhone_8 = 'iPhone 8',
  iPhone_X = 'iPhone X',
  iPhone_XR = 'iPhone XR',
  iPhone_XS = 'iPhone Xs',
}

export enum IosVersion {
  LATEST = 'latest',
  /** @deprecated */
  LATEST_ONE_VERSION_BACK = 'latest-1',
  ONE_VERSION_BACK = 'latest-1',
}

export enum MatchLevel {
  Content = 'Content',
  Exact = 'Exact',
  Layout = 'Layout',
  Layout2 = 'Layout2',
  LegacyLayout = 'Layout1',
  None = 'None',
  Strict = 'Strict',
}

export enum ScreenOrientation {
  LANDSCAPE = 'landscape',
  PORTRAIT = 'portrait',
}

export enum SessionType {
  PROGRESSION = 'PROGRESSION',
  SEQUENTIAL = 'SEQUENTIAL',
}

export enum StitchMode {
  CSS = 'CSS',
  SCROLL = 'Scroll',
}

export enum TestResultsStatus {
  Failed = 'Failed',
  Passed = 'Passed',
  Unresolved = 'Unresolved',
}

export class AccessibilityMatchSettings implements Required<AccessibilityMatchSettingsPlain> {
  constructor(settings: AccessibilityMatchSettingsPlain);
  constructor(region: RegionPlain);
  constructor(
    x: number,
    y: number,
    width: number,
    height: number,
    type?: 'IgnoreContrast' | 'RegularText' | 'LargeText' | 'BoldText' | 'GraphicalObject',
  );
  get region(): RegionPlain;
  set region(region: RegionPlain);
  get type(): 'IgnoreContrast' | 'RegularText' | 'LargeText' | 'BoldText' | 'GraphicalObject';
  set type(type: 'IgnoreContrast' | 'RegularText' | 'LargeText' | 'BoldText' | 'GraphicalObject');
  getHeight(): number;
  getLeft(): number;
  getRegion(): Region;
  getTop(): number;
  getType(): AccessibilityRegionType;
  getWidth(): number;
  setHeight(height: number): void;
  setLeft(left: number): void;
  setRegion(region: RegionPlain): void;
  setTop(top: number): void;
  setType(type: AccessibilityRegionTypePlain): void;
  setWidth(width: number): void;
}

export class ApiUrls implements Required<ApiUrlsPlain> {
  get baselineImage(): string;
  get checkpointImage(): string;
  get checkpointImageThumbnail(): string;
  get currentImage(): string;
  get diffImage(): string;
  getBaselineImage(): string;
  getCheckpointImage(): string;
  getCheckpointImageThumbnail(): string;
  getCurrentImage(): string;
  getDiffImage(): string;
  /** @deprecated */
  setBaselineImage(setBaselineImage: string): void;
  /** @deprecated */
  setCheckpointImage(checkpointImage: string): void;
  /** @deprecated */
  setCheckpointImageThumbnail(checkpointImageThumbnail: string): void;
  /** @deprecated */
  setCurrentImage(currentImage: string): void;
  /** @deprecated */
  setDiffImage(diffImage: string): void;
}

export class AppUrls implements Required<AppUrlsPlain> {
  get step(): string;
  get stepEditor(): string;
  getStep(): string;
  getStepEditor(): string;
  /** @deprecated */
  setStep(step: string): void;
  /** @deprecated */
  setStepEditor(stepEditor: string): void;
}

export class BatchClose {
  constructor(options?: {batchIds: string[]; serverUrl?: string; apiKey?: string; proxy?: ProxySettingsPlain});
  close(): Promise<void>;
  setApiKey(apiKey: string): this;
  setBatchIds(batchIds: string[]): this;
  setProxy(proxy: ProxySettingsPlain): this;
  setUrl(serverUrl: string): this;
  static close(options: {
    batchIds: string[];
    serverUrl?: string;
    apiKey?: string;
    proxy?: ProxySettingsPlain;
  }): Promise<void>;
}

export class BatchInfo implements Required<BatchInfoPlain> {
  constructor();
  constructor(batch?: BatchInfoPlain);
  constructor(name?: string, startedAt?: string | Date, id?: string);
  get id(): string;
  set id(id: string);
  get name(): string;
  set name(name: string);
  get notifyOnCompletion(): boolean;
  set notifyOnCompletion(notifyOnCompletion: boolean);
  get properties(): PropertyDataPlain[];
  set properties(properties: PropertyDataPlain[]);
  get sequenceName(): string;
  set sequenceName(sequenceName: string);
  get startedAt(): string | Date;
  set startedAt(startedAt: string | Date);
  addProperty(property: PropertyDataPlain): this;
  getId(): string;
  getName(): string;
  getNotifyOnCompletion(): boolean;
  getProperties(): PropertyData[];
  getSequenceName(): string;
  getStartedAt(): Date | string;
  setId(id: string): this;
  setName(name: string): this;
  setNotifyOnCompletion(notifyOnCompletion: boolean): this;
  setProperties(properties: PropertyDataPlain[]): this;
  setSequenceName(sequenceName: string): this;
  setStartedAt(startedAt: Date): this;
  setStartedAt(startedAt: string): this;
}

export class CheckSettings {
  constructor(settings?: CheckSettingsPlain);
  accessibilityRegion(region: {region: RegionPlain | Element | Selector; type?: AccessibilityRegionTypePlain}): this;
  accessibilityRegion(region: RegionPlain, type?: AccessibilityRegionTypePlain): this;
  accessibilityRegion(region: Element, type?: AccessibilityRegionTypePlain): this;
  accessibilityRegion(region: Selector, type?: AccessibilityRegionTypePlain): this;
  accessibilityRegions(
    ...regions: (
      | {region: RegionPlain | Element | Selector; type?: AccessibilityRegionTypePlain}
      | RegionPlain
      | Element
      | Selector
    )[]
  ): this;
  accessibilityRegions(type: AccessibilityRegionTypePlain, ...regions: (RegionPlain | Element | Selector)[]): this;
  beforeRenderScreenshotHook(script: string): this;
  content(): this;
  contentRegion(region: RegionPlain): this;
  contentRegion(region: Element): this;
  contentRegion(region: Selector): this;
  contentRegions(...regions: (RegionPlain | Element | Selector)[]): this;
  disableBrowserFetching(disableBrowserFetching: boolean): this;
  enablePatterns(enablePatterns?: boolean): this;
  exact(): this;
  /** @deprecated */
  floating(region: {
    region: RegionPlain | Element | Selector;
    maxUpOffset?: number;
    maxDownOffset?: number;
    maxLeftOffset?: number;
    maxRightOffset?: number;
  }): this;
  /** @deprecated */
  floating(region: RegionPlain): this;
  /** @deprecated */
  floating(region: Element): this;
  /** @deprecated */
  floating(region: Selector): this;
  floatingRegion(region: {
    region: RegionPlain | Element | Selector;
    maxUpOffset?: number;
    maxDownOffset?: number;
    maxLeftOffset?: number;
    maxRightOffset?: number;
  }): this;
  floatingRegion(
    region: RegionPlain,
    maxUpOffset?: number,
    maxDownOffset?: number,
    maxLeftOffset?: number,
    maxRightOffset?: number,
  ): this;
  floatingRegion(
    region: Element,
    maxUpOffset?: number,
    maxDownOffset?: number,
    maxLeftOffset?: number,
    maxRightOffset?: number,
  ): this;
  floatingRegion(
    region: Selector,
    maxUpOffset?: number,
    maxDownOffset?: number,
    maxLeftOffset?: number,
    maxRightOffset?: number,
  ): this;
  floatingRegions(
    ...regions: (
      | {
          region: RegionPlain | Element | Selector;
          maxUpOffset?: number;
          maxDownOffset?: number;
          maxLeftOffset?: number;
          maxRightOffset?: number;
        }
      | RegionPlain
      | Element
      | Selector
    )[]
  ): this;
  floatingRegions(maxOffset: number, ...regions: (RegionPlain | Element | Selector)[]): this;
  /** @deprecated */
  floatings(
    ...regions: (
      | {
          region: RegionPlain | Element | Selector;
          maxUpOffset?: number;
          maxDownOffset?: number;
          maxLeftOffset?: number;
          maxRightOffset?: number;
        }
      | RegionPlain
      | Element
      | Selector
    )[]
  ): this;
  /** @deprecated */
  floatings(maxOffset: number, ...regions: (RegionPlain | Element | Selector)[]): this;
  frame(context: {frame: Element | Selector | string | number; scrollRootElement?: Element | Selector}): this;
  frame(frame: Element, scrollRootElement?: Element): this;
  frame(frame: Element, scrollRootElement?: Selector): this;
  frame(frame: Selector, scrollRootElement?: Element): this;
  frame(frame: Selector, scrollRootElement?: Selector): this;
  frame(frame: string, scrollRootElement?: Element): this;
  frame(frame: string, scrollRootElement?: Selector): this;
  frame(frame: number, scrollRootElement?: Element): this;
  frame(frame: number, scrollRootElement?: Selector): this;
  fully(fully?: boolean): this;
  hook(name: string, script: string): this;
  /** @deprecated */
  ignore(ignoreRegion: RegionPlain): this;
  /** @deprecated */
  ignore(ignoreRegion: Element): this;
  /** @deprecated */
  ignore(ignoreRegion: Selector): this;
  ignoreCaret(ignoreCaret?: boolean): this;
  ignoreDisplacements(ignoreDisplacements?: boolean): this;
  ignoreRegion(ignoreRegion: RegionPlain): this;
  ignoreRegion(ignoreRegion: Element): this;
  ignoreRegion(ignoreRegion: Selector): this;
  ignoreRegions(...ignoreRegions: (RegionPlain | Element | Selector)[]): this;
  /** @deprecated */
  ignores(...ignoreRegions: (RegionPlain | Element | Selector)[]): this;
  layout(): this;
  layoutBreakpoints(layoutBreakpoints?: boolean): this;
  layoutBreakpoints(layoutBreakpoints?: number[]): this;
  layoutRegion(layoutRegion: RegionPlain): this;
  layoutRegion(layoutRegion: Element): this;
  layoutRegion(layoutRegion: Selector): this;
  layoutRegions(...layoutRegions: (RegionPlain | Element | Selector)[]): this;
  matchLevel(matchLevel: MatchLevelPlain): this;
  /** @undocumented */
  name(name: string): this;
  region(region: RegionPlain): this;
  region(region: Element): this;
  region(region: Selector): this;
  renderId(renderId: string): this;
  scrollRootElement(scrollRootElement: Element): this;
  scrollRootElement(scrollRootElement: Selector): this;
  sendDom(sendDom?: boolean): this;
  /** @deprecated */
  stitchContent(stitchContent?: boolean): this;
  strict(): this;
  strictRegion(strictRegion: RegionPlain): this;
  strictRegion(strictRegion: Element): this;
  strictRegion(strictRegion: Selector): this;
  strictRegions(...regions: (RegionPlain | Element | Selector)[]): this;
  timeout(timeout: number): this;
  useDom(useDom?: boolean): this;
  variationGroupId(variationGroupId: string): this;
  visualGridOption(key: string, value: any): this;
  visualGridOptions(options: {[key: string]: any}): this;
  /** @deprecated */
  webHook(script: string): this;
  withName(name: string): this;
}

export class ClassicRunner extends EyesRunner {}

export class Configuration {
  constructor(config?: ConfigurationPlain);
  get agentId(): string;
  set agentId(agentId: string);
  get apiKey(): string;
  set apiKey(apiKey: string);
  get appName(): string;
  set appName(appName: string);
  get baselineBranchName(): string;
  set baselineBranchName(baselineBranchName: string);
  get baselineEnvName(): string;
  set baselineEnvName(baselineEnvName: string);
  get batch(): BatchInfoPlain;
  set batch(batch: BatchInfoPlain);
  get branchName(): string;
  set branchName(branchName: string);
  get browsersInfo(): (DesktopBrowserInfo | ChromeEmulationInfo | IOSDeviceInfo)[];
  set browsersInfo(browsersInfo: (DesktopBrowserInfo | ChromeEmulationInfo | IOSDeviceInfo)[]);
  get compareWithParentBranch(): boolean;
  set compareWithParentBranch(compareWithParentBranch: boolean);
  /** @undocumented */
  get concurrentSessions(): number;
  /** @undocumented */
  set concurrentSessions(concurrentSessions: number);
  /** @undocumented */
  get connectionTimeout(): number;
  /** @undocumented */
  set connectionTimeout(connectionTimeout: number);
  get cut(): CutProviderPlain;
  set cut(cut: CutProviderPlain);
  /** @undocumented */
  get debugScreenshots(): {save: boolean; path?: string; prefix?: string};
  /** @undocumented */
  set debugScreenshots(debugScreenshots: {save: boolean; path?: string; prefix?: string});
  get defaultMatchSettings(): ImageMatchSettingsPlain;
  set defaultMatchSettings(defaultMatchSettings: ImageMatchSettingsPlain);
  get deviceInfo(): string;
  set deviceInfo(deviceInfo: string);
  get disableBrowserFetching(): boolean;
  set disableBrowserFetching(disableBrowserFetching: boolean);
  get displayName(): string;
  set displayName(displayName: string);
  /** @undocumented */
  get dontCloseBatches(): boolean;
  /** @undocumented */
  set dontCloseBatches(dontCloseBatches: boolean);
  get environmentName(): string;
  set environmentName(environmentName: string);
  get forceFullPageScreenshot(): boolean;
  set forceFullPageScreenshot(forceFullPageScreenshot: boolean);
  get hideCaret(): boolean;
  set hideCaret(hideCaret: boolean);
  get hideScrollbars(): boolean;
  set hideScrollbars(hideScrollbars: boolean);
  get hostApp(): string;
  set hostApp(hostApp: string);
  get hostAppInfo(): string;
  set hostAppInfo(hostAppInfo: string);
  get hostOS(): string;
  set hostOS(hostOS: string);
  get hostOSInfo(): string;
  set hostOSInfo(hostOSInfo: string);
  get ignoreBaseline(): boolean;
  set ignoreBaseline(ignoreBaseline: boolean);
  get isDisabled(): boolean;
  set isDisabled(isDisabled: boolean);
  get layoutBreakpoints(): boolean | number[];
  set layoutBreakpoints(layoutBreakpoints: boolean | number[]);
  /** @undocumented */
  get logs(): LogHandlerPlain;
  /** @undocumented */
  set logs(logs: LogHandlerPlain);
  get matchTimeout(): number;
  set matchTimeout(matchTimeout: number);
  get parentBranchName(): string;
  set parentBranchName(parentBranchName: string);
  get properties(): PropertyDataPlain[];
  set properties(properties: PropertyDataPlain[]);
  get proxy(): ProxySettingsPlain;
  set proxy(proxy: ProxySettingsPlain);
  /** @undocumented */
  get remoteEvents(): {accessKey?: string; serverUrl: string; timeout?: number};
  /** @undocumented */
  set remoteEvents(remoteEvents: {accessKey?: string; serverUrl: string; timeout?: number});
  /** @undocumented */
  get removeSession(): boolean;
  /** @undocumented */
  set removeSession(removeSession: boolean);
  get rotation(): ImageRotationPlain;
  set rotation(rotation: ImageRotationPlain);
  get saveDiffs(): boolean;
  set saveDiffs(saveDiffs: boolean);
  get saveFailedTests(): boolean;
  set saveFailedTests(saveFailedTests: boolean);
  get saveNewTests(): boolean;
  set saveNewTests(saveNewTests: boolean);
  get scaleRatio(): number;
  set scaleRatio(scaleRatio: number);
  get scrollRootElement(): Element | Selector;
  set scrollRootElement(scrollRootElement: Element | Selector);
  get sendDom(): boolean;
  set sendDom(sendDom: boolean);
  get serverUrl(): string;
  set serverUrl(serverUrl: string);
  get sessionType(): 'SEQUENTIAL' | 'PROGRESSION';
  set sessionType(sessionType: 'SEQUENTIAL' | 'PROGRESSION');
  get stitchMode(): 'Scroll' | 'CSS';
  set stitchMode(stitchMode: 'Scroll' | 'CSS');
  get stitchOverlap(): number;
  set stitchOverlap(stitchOverlap: number);
  get testName(): string;
  set testName(testName: string);
  get viewportSize(): RectangleSizePlain;
  set viewportSize(viewportSize: RectangleSizePlain);
  get visualGridOptions(): {[key: string]: any};
  set visualGridOptions(visualGridOptions: {[key: string]: any});
  get waitBeforeScreenshots(): number;
  set waitBeforeScreenshots(waitBeforeScreenshots: number);
  addBrowser(browserInfo: DesktopBrowserInfo): this;
  addBrowser(browserInfo: ChromeEmulationInfo): this;
  addBrowser(browserInfo: IOSDeviceInfo): this;
  addBrowser(browserInfo: {deviceName: DeviceNamePlain; screenOrientation?: ScreenOrientationPlain}): this;
  addBrowser(width: number, height: number, name?: BrowserTypePlain): this;
  addBrowsers(
    ...browsersInfo: (
      | DesktopBrowserInfo
      | ChromeEmulationInfo
      | IOSDeviceInfo
      | {deviceName: DeviceNamePlain; screenOrientation?: ScreenOrientationPlain}
    )[]
  ): this;
  addDeviceEmulation(deviceName: DeviceNamePlain, screenOrientation?: ScreenOrientationPlain): this;
  addProperty(name: string, value: string): this;
  addProperty(prop: PropertyDataPlain): this;
  clearProperties(): this;
  getAccessibilityValidation(): AccessibilitySettings;
  getAgentId(): string;
  getApiKey(): string;
  getAppName(): string;
  getBaselineBranchName(): string;
  getBaselineEnvName(): string;
  getBatch(): BatchInfo;
  getBranchName(): string;
  getBrowsersInfo(): (
    | DesktopBrowserInfo
    | ChromeEmulationInfo
    | IOSDeviceInfo
    | {deviceName: DeviceNamePlain; screenOrientation?: ScreenOrientationPlain}
  )[];
  getCompareWithParentBranch(): boolean;
  /** @undocumented */
  getConcurrentSessions(): number;
  /** @undocumented */
  getConnectionTimeout(): number;
  getCut(): CutProviderPlain;
  /** @undocumented */
  getDebugScreenshotsPath(): string;
  /** @undocumented */
  getDebugScreenshotsPrefix(): string;
  getDefaultMatchSettings(): ImageMatchSettingsPlain;
  getDeviceInfo(): string;
  getDisableBrowserFetching(): boolean;
  getDisplayName(): string;
  /** @undocumented */
  getDontCloseBatches(): boolean;
  getEnablePatterns(): boolean;
  getEnvironmentName(): string;
  getForceFullPageScreenshot(): boolean;
  getHideCaret(): boolean;
  getHideScrollbars(): boolean;
  getHostApp(): string;
  getHostAppInfo(): string;
  getHostOS(): string;
  getHostOSInfo(): string;
  getIgnoreBaseline(): boolean;
  getIgnoreCaret(): boolean;
  getIgnoreDisplacements(): boolean;
  getIsDisabled(): boolean;
  getLayoutBreakpoints(): boolean | number[];
  /** @undocumented */
  getLogHandler(): LogHandlerPlain;
  getMatchLevel(): MatchLevel;
  getMatchTimeout(): number;
  getParentBranchName(): string;
  getProperties(): PropertyData[];
  getProxy(): ProxySettings;
  /** @undocumented */
  getRemoteEvents(): {serverUrl: string; accessKey?: string; timeout?: number};
  /** @undocumented */
  getRemoveSession(): boolean;
  getRotation(): ImageRotation;
  /** @undocumented */
  getSaveDebugScreenshots(): boolean;
  getSaveDiffs(): boolean;
  getSaveFailedTests(): boolean;
  getSaveNewTests(): boolean;
  getScaleRatio(): number;
  getScrollRootElement(): Element | Selector;
  getSendDom(): boolean;
  getServerUrl(): string;
  getSessionType(): SessionType;
  /** @undocumented */
  getShowLogs(): boolean;
  getStitchMode(): StitchMode;
  getStitchOverlap(): number;
  getTestName(): string;
  getUseDom(): boolean;
  getViewportSize(): RectangleSize;
  getVisualGridOptions(): {[key: string]: any};
  getWaitBeforeScreenshots(): number;
  setAccessibilityValidation(accessibilityValidation: AccessibilitySettings): this;
  setAgentId(agentId: string): this;
  setApiKey(apiKey: string): this;
  setAppName(appName: string): this;
  setBaselineBranchName(baselineBranchName: string): this;
  setBaselineEnvName(baselineEnvName: string): this;
  setBatch(batch: BatchInfoPlain): this;
  setBranchName(branchName: string): this;
  setBrowsersInfo(
    browsersInfo: (
      | DesktopBrowserInfo
      | ChromeEmulationInfo
      | IOSDeviceInfo
      | {deviceName: DeviceNamePlain; screenOrientation?: ScreenOrientationPlain}
    )[],
  ): this;
  setCompareWithParentBranch(compareWithParentBranch: boolean): this;
  /** @undocumented */
  setConcurrentSessions(concurrentSessions: number): this;
  /** @undocumented */
  setConnectionTimeout(connectionTimeout: number): this;
  setCut(cut: CutProviderPlain): this;
  /** @undocumented */
  setDebugScreenshotsPath(path: string): this;
  /** @undocumented */
  setDebugScreenshotsPrefix(prefix: string): this;
  setDefaultMatchSettings(defaultMatchSettings: ImageMatchSettingsPlain): this;
  setDeviceInfo(deviceInfo: string): this;
  setDisableBrowserFetching(disableBrowserFetching: boolean): this;
  setDisplayName(displayName: string): this;
  /** @undocumented */
  setDontCloseBatches(dontCloseBatches: boolean): this;
  setEnablePatterns(enablePatterns: boolean): this;
  setEnvironmentName(environmentName: string): this;
  setForceFullPageScreenshot(forceFullPageScreenshot: boolean): this;
  setHideCaret(hideCaret: boolean): this;
  setHideScrollbars(hideScrollbars: boolean): this;
  setHostApp(hostApp: string): this;
  setHostAppInfo(hostAppInfo: string): this;
  setHostOS(hostOS: string): this;
  setHostOSInfo(hostOSInfo: string): this;
  setIgnoreBaseline(ignoreBaseline: boolean): this;
  setIgnoreCaret(ignoreCaret: boolean): this;
  setIgnoreDisplacements(ignoreDisplacements: boolean): this;
  setIsDisabled(isDisabled: boolean): this;
  setLayoutBreakpoints(layoutBreakpoints: boolean): this;
  setLayoutBreakpoints(layoutBreakpoints: number[]): this;
  /** @undocumented */
  setLogHandler(handler: LogHandlerPlain): this;
  setMatchLevel(matchLevel: MatchLevelPlain): this;
  setMatchTimeout(matchTimeout: number): this;
  setParentBranchName(parentBranchName: string): this;
  setProperties(properties: PropertyDataPlain[]): this;
  setProxy(proxy: ProxySettingsPlain): this;
  setProxy(url: string, username?: string, password?: string, isHttpOnly?: boolean): this;
  setProxy(isEnabled: false): this;
  /** @undocumented */
  setRemoteEvents(remoteEvents: {serverUrl: string; accessKey?: string; timeout?: number}): this;
  /** @undocumented */
  setRemoveSession(removeSession: boolean): this;
  setRotation(rotation: ImageRotationPlain): this;
  setRotation(rotation: ImageRotation): this;
  /** @undocumented */
  setSaveDebugScreenshots(save: boolean): this;
  setSaveDiffs(saveDiffs: boolean): this;
  setSaveFailedTests(saveFailedTests: boolean): this;
  setSaveNewTests(saveNewTests: boolean): this;
  setScaleRatio(scaleRatio: number): this;
  setScrollRootElement(scrollRootElement: Element): this;
  setScrollRootElement(scrollRootElement: Selector): this;
  setSendDom(sendDom: boolean): this;
  setServerUrl(serverUrl: string): this;
  setSessionType(sessionType: SessionTypePlain): this;
  /** @undocumented */
  setShowLogs(show: boolean): this;
  setStitchMode(stitchMode: StitchModePlain): this;
  setStitchOverlap(stitchOverlap: number): this;
  setTestName(testName: string): this;
  setUseDom(useDom: boolean): this;
  setViewportSize(viewportSize: RectangleSizePlain): this;
  setVisualGridOption(key: string, value: any): this;
  setVisualGridOptions(visualGridOptions: {[key: string]: any}): this;
  setWaitBeforeScreenshots(waitBeforeScreenshots: number): this;
}

export class ConsoleLogHandler extends LogHandler implements ConsoleLogHandlerPlain {
  readonly type: 'console';
  close(): void;
  onMessage(): void;
  open(): void;
}

export class CutProvider
  implements
    Required<
      {x: number; y: number; width: number; height: number} & {top: number; right: number; bottom: number; left: number}
    > {
  constructor(rectOrRegion: CutProviderPlain);
  constructor(top: number, bottom: number, left: number, right: number);
  get bottom(): number;
  get height(): number;
  get left(): number;
  get right(): number;
  get top(): number;
  get width(): number;
  get x(): number;
  get y(): number;
  scale(scaleRatio: number): CutProvider;
}

export class DiffsFoundError extends TestFailedError {
  constructor(message: string, results?: TestResultsPlain);
  constructor(results: TestResultsPlain);
}

/** @undocumented */
export class ExactMatchSettings implements Required<ExactMatchSettingsPlain> {
  constructor(settings: ExactMatchSettingsPlain);
  get matchThreshold(): number;
  set matchThreshold(matchThreshold: number);
  get minDiffHeight(): number;
  set minDiffHeight(minDiffHeight: number);
  get minDiffIntensity(): number;
  set minDiffIntensity(minDiffIntensity: number);
  get minDiffWidth(): number;
  set minDiffWidth(minDiffWidth: number);
  getMatchThreshold(): number;
  getMinDiffHeight(): number;
  getMinDiffIntensity(): number;
  getMinDiffWidth(): number;
  setMatchThreshold(value: number): void;
  setMinDiffHeight(value: number): void;
  setMinDiffIntensity(value: number): void;
  setMinDiffWidth(value: number): void;
}

export class Eyes {
  constructor(runner?: EyesRunner, config?: ConfigurationPlain);
  constructor(config?: ConfigurationPlain);
  static setViewportSize(driver: Driver, viewportSize: RectangleSize): Promise<void>;
  get configuration(): ConfigurationPlain;
  set configuration(config: ConfigurationPlain);
  get driver(): Driver;
  get isOpen(): boolean;
  get logger(): Logger;
  get runner(): EyesRunner;
  abort(): Promise<TestResults>;
  /** @deprecated */
  abortAsync(): Promise<void>;
  /** @deprecated */
  abortIfNotClosed(): Promise<TestResultsPlain>;
  addProperty(name: string, value: string): Configuration;
  /**
   * @undocumented
   * @deprecated
   */
  addSessionEventHandler(handler: SessionEventHandler): void;
  check(name: string, checkSettings: CheckSettings): Promise<MatchResult>;
  check(checkSettings?: CheckSettingsPlain): Promise<MatchResult>;
  /** @deprecated */
  checkElement(element: Element, timeout?: number, name?: string): Promise<MatchResult>;
  /** @deprecated */
  checkElementBy(selector: Selector, timeout?: number, name?: string): Promise<MatchResult>;
  /** @deprecated */
  checkFrame(element: Element, timeout?: number, name?: string): Promise<MatchResult>;
  /** @deprecated */
  checkFrame(element: Selector, timeout?: number, name?: string): Promise<MatchResult>;
  /** @deprecated */
  checkFrame(element: string, timeout?: number, name?: string): Promise<MatchResult>;
  /** @deprecated */
  checkFrame(element: number, timeout?: number, name?: string): Promise<MatchResult>;
  /** @deprecated */
  checkRegion(region?: RegionPlain, name?: string, timeout?: number): Promise<MatchResult>;
  /** @deprecated */
  checkRegionBy(selector: Selector, name?: string, timeout?: number, fully?: boolean): Promise<MatchResult>;
  /** @deprecated */
  checkRegionByElement(element: Element, name?: string, timeout?: number): Promise<MatchResult>;
  /** @deprecated */
  checkRegionInFrame(
    frame: Element,
    selector: Selector,
    timeout?: number,
    name?: string,
    fully?: boolean,
  ): Promise<MatchResult>;
  /** @deprecated */
  checkRegionInFrame(
    frame: Selector,
    selector: Selector,
    timeout?: number,
    name?: string,
    fully?: boolean,
  ): Promise<MatchResult>;
  /** @deprecated */
  checkRegionInFrame(
    frame: string,
    selector: Selector,
    timeout?: number,
    name?: string,
    fully?: boolean,
  ): Promise<MatchResult>;
  /** @deprecated */
  checkRegionInFrame(
    frame: number,
    selector: Selector,
    timeout?: number,
    name?: string,
    fully?: boolean,
  ): Promise<MatchResult>;
  /** @deprecated */
  checkWindow(name?: string, timeout?: number, fully?: boolean): Promise<MatchResult>;
  clearProperties(): Configuration;
  /**
   * @undocumented
   * @deprecated
   */
  clearSessionEventHandlers(): void;
  close(throwErr?: boolean): Promise<TestResults>;
  /** @deprecated */
  closeAsync(): Promise<void>;
  extractText(regions: OCRRegion[]): Promise<string[]>;
  extractTextRegions<TPattern extends string>(settings: OCRSettings<TPattern>): Promise<Record<TPattern, TextRegion[]>>;
  getApiKey(): string;
  getAppName(): string;
  getBaselineBranchName(): string;
  getBaselineEnvName(): string;
  /** @deprecated */
  getBaselineName(): string;
  getBatch(): BatchInfo;
  getBranchName(): string;
  getConfiguration(): Configuration;
  getDebugScreenshotsPath(): string;
  getDebugScreenshotsPrefix(): string;
  getDeviceInfo(): string;
  getDriver(): Driver;
  getForceFullPageScreenshot(): boolean;
  getHideCaret(): boolean;
  getHideScrollbars(): boolean;
  getHostApp(): string;
  getHostAppInfo(): string;
  getHostOS(): string;
  getHostOSInfo(): string;
  getIgnoreCaret(): boolean;
  getIsCutProviderExplicitlySet(): boolean;
  getIsDisabled(): boolean;
  getIsOpen(): boolean;
  getLogHandler(): LogHandler;
  getLogger(): Logger;
  getMatchLevel(): MatchLevel;
  getMatchTimeout(): number;
  getParentBranchName(): string;
  getProxy(): ProxySettings;
  getRotation(): ImageRotation;
  getRunner(): EyesRunner;
  getSaveDebugScreenshots(): boolean;
  getSaveDiffs(): boolean;
  getSaveNewTests(): boolean;
  getScaleRatio(): number;
  getScrollRootElement(): Element | Selector;
  getSendDom(): boolean;
  getServerUrl(): string;
  /**
   * @undocumented
   * @deprecated
   */
  getSessionEventHandlers(): SessionEventHandlers;
  getStitchMode(): StitchMode;
  getStitchOverlap(): number;
  getTestName(): string;
  getViewportSize(): Promise<RectangleSize>;
  getWaitBeforeScreenshots(): number;
  locate<TLocator extends string>(settings: VisualLocatorSettings<TLocator>): Promise<Record<TLocator, RegionPlain[]>>;
  /** @undocumented */
  off(event: string): void;
  /** @undocumented */
  off(handler: {(...args: any[]): any}): void;
  /** @undocumented */
  on(handler: {(event: string, data?: Record<string, any>): any}): {(): void};
  /** @undocumented */
  on(event: 'setSizeWillStart', handler: {(data: {viewportSize: RectangleSizePlain}): any}): {(): void};
  /** @undocumented */
  on(event: 'setSizeEnded', handler: {(): any}): {(): void};
  /** @undocumented */
  on(event: 'initStarted', handler: {(): any}): {(): void};
  /** @undocumented */
  on(event: 'initEnded', handler: {(): any}): {(): void};
  /** @undocumented */
  on(event: 'testStarted', handler: {(data: {sessionId: string}): any}): {(): void};
  /** @undocumented */
  on(
    event: 'validationWillStart',
    handler: {(data: {sessionId: string; validationInfo: ValidationInfoPlain}): any},
  ): {(): void};
  /** @undocumented */
  on(
    event: 'validationEnded',
    handler: {(data: {sessionId: string; validationId: number; validationResult: ValidationResultPlain}): any},
  ): {(): void};
  /** @undocumented */
  on(event: 'testEnded', handler: {(data: {sessionId: string; testResults: TestResultsPlain}): any}): {(): void};
  open(driver: Driver, config?: ConfigurationPlain): Promise<Driver>;
  open(
    driver: Driver,
    appName?: string,
    testName?: string,
    viewportSize?: RectangleSizePlain,
    sessionType?: SessionTypePlain,
  ): Promise<Driver>;
  /**
   * @undocumented
   * @deprecated
   */
  removeSessionEventHandler(handler: SessionEventHandler): void;
  setApiKey(apiKey: string): void;
  setAppName(appName: string): void;
  setBaselineBranchName(baselineBranchName: string): void;
  setBaselineEnvName(baselineEnvName: string): void;
  /** @deprecated */
  setBaselineName(baselineName: string): void;
  setBatch(batch: BatchInfoPlain): void;
  setBatch(name: string, id?: string, startedAt?: Date): void;
  setBatch(name: string, id?: string, startedAt?: string): void;
  setBranchName(branchName: string): void;
  setConfiguration(config: ConfigurationPlain): void;
  setCutProvider(cutProvider: CutProvider): void;
  setDebugScreenshotsPath(path: string): void;
  setDebugScreenshotsPrefix(prefix: string): void;
  setDeviceInfo(deviceInfo: string): void;
  setForceFullPageScreenshot(forceFullPageScreenshot: boolean): void;
  setHideCaret(hideCaret: boolean): void;
  setHideScrollbars(hideScrollbars: boolean): void;
  setHostApp(hostApp: string): void;
  setHostAppInfo(hostAppInfo: string): void;
  setHostOS(hostOS: string): void;
  setHostOSInfo(hostOSInfo: string): void;
  setIgnoreCaret(ignoreCaret: boolean): void;
  setImageCut(cutProvider: CutProvider): void;
  setIsDisabled(isDisabled: boolean): void;
  setLogHandler(handler: LogHandler): void;
  setMatchLevel(matchLevel: MatchLevelPlain): void;
  setMatchTimeout(matchTimeout: number): void;
  setParentBranchName(parentBranchName: string): void;
  setProxy(proxy: ProxySettingsPlain): void;
  setProxy(url: string, username?: string, password?: string, isHttpOnly?: boolean): void;
  setProxy(isEnabled: false): void;
  setRotation(rotation: ImageRotationPlain): void;
  setRotation(rotation: ImageRotation): void;
  setSaveDebugScreenshots(save: boolean): void;
  setSaveDiffs(saveDiffs: boolean): void;
  setSaveNewTests(saveNewTests: boolean): void;
  setScaleRatio(scaleRatio: number): void;
  setScrollRootElement(scrollRootElement: Element): void;
  setScrollRootElement(scrollRootElement: Selector): void;
  setSendDom(sendDom: boolean): void;
  setServerUrl(serverUrl: string): void;
  setStitchMode(stitchMode: StitchModePlain): void;
  setStitchOverlap(stitchOverlap: number): void;
  setTestName(testName: string): void;
  setViewportSize(size: RectangleSizePlain): Promise<void>;
  setWaitBeforeScreenshots(waitBeforeScreenshots: number): void;
}

export class EyesError extends Error {}

export abstract class EyesRunner {
  constructor();
  getAllTestResults(throwErr?: boolean): Promise<TestResultsSummary>;
}

export class FileLogHandler extends LogHandler implements FileLogHandlerPlain {
  constructor(verbose?: boolean, filename?: string, append?: boolean);
  readonly append: boolean;
  readonly filename: string;
  readonly type: 'file';
  close(): void;
  onMessage(): void;
  open(): void;
}

export class FixedCutProvider extends CutProvider {}

/** @undocumented */
export class FloatingMatchSettings implements Required<FloatingMatchSettingsPlain> {
  constructor(settings: FloatingMatchSettingsPlain);
  constructor(region: RegionPlain);
  constructor(
    x: number,
    y: number,
    width: number,
    height: number,
    maxUpOffset?: number,
    maxDownOffset?: number,
    maxLeftOffset?: number,
    maxRightOffset?: number,
  );
  get maxDownOffset(): number;
  set maxDownOffset(maxDownOffset: number);
  get maxLeftOffset(): number;
  set maxLeftOffset(maxLeftOffset: number);
  get maxRightOffset(): number;
  set maxRightOffset(maxRightOffset: number);
  get maxUpOffset(): number;
  set maxUpOffset(maxUpOffset: number);
  get region(): RegionPlain;
  set region(region: RegionPlain);
  getHeight(): number;
  getLeft(): number;
  getMaxDownOffset(): number;
  getMaxLeftOffset(): number;
  getMaxRightOffset(): number;
  getMaxUpOffset(): number;
  getRegion(): Region;
  getTop(): number;
  getWidth(): number;
  setHeight(height: number): void;
  setLeft(left: number): void;
  setMaxDownOffset(maxDownOffset: number): void;
  setMaxLeftOffset(maxLeftOffset: number): void;
  setMaxRightOffset(maxRightOffset: number): void;
  setMaxUpOffset(maxUpOffset: number): void;
  setRegion(region: RegionPlain): void;
  setTop(top: number): void;
  setWidth(width: number): void;
}

/** @undocumented */
export class ImageMatchSettings implements Required<ImageMatchSettingsPlain> {
  constructor(settings?: ImageMatchSettingsPlain);
  get accessibility(): (RegionPlain | AccessibilityMatchSettingsPlain)[];
  set accessibility(accessibilityRegions: (RegionPlain | AccessibilityMatchSettingsPlain)[]);
  get accessibilityRegions(): (RegionPlain | AccessibilityMatchSettingsPlain)[];
  set accessibilityRegions(accessibilityRegions: (RegionPlain | AccessibilityMatchSettingsPlain)[]);
  get accessibilitySettings(): AccessibilitySettings;
  set accessibilitySettings(accessibilitySettings: AccessibilitySettings);
  get content(): RegionPlain[];
  set content(contentRegions: RegionPlain[]);
  get contentRegions(): RegionPlain[];
  set contentRegions(contentRegions: RegionPlain[]);
  get enablePatterns(): boolean;
  set enablePatterns(enablePatterns: boolean);
  get exact(): ExactMatchSettingsPlain;
  set exact(exact: ExactMatchSettingsPlain);
  get floating(): (RegionPlain | FloatingMatchSettingsPlain)[];
  set floating(floatingRegions: (RegionPlain | FloatingMatchSettingsPlain)[]);
  get floatingRegions(): (RegionPlain | FloatingMatchSettingsPlain)[];
  set floatingRegions(floatingRegions: (RegionPlain | FloatingMatchSettingsPlain)[]);
  get ignoreCaret(): boolean;
  set ignoreCaret(ignoreCaret: boolean);
  get ignoreDisplacements(): boolean;
  set ignoreDisplacements(ignoreDisplacements: boolean);
  get ignoreRegions(): RegionPlain[];
  set ignoreRegions(ignoreRegions: RegionPlain[]);
  get layout(): RegionPlain[];
  set layout(layoutRegions: RegionPlain[]);
  get layoutRegions(): RegionPlain[];
  set layoutRegions(layoutRegions: RegionPlain[]);
  get matchLevel(): 'None' | 'Layout1' | 'Layout' | 'Layout2' | 'Content' | 'Strict' | 'Exact';
  set matchLevel(matchLevel: 'None' | 'Layout1' | 'Layout' | 'Layout2' | 'Content' | 'Strict' | 'Exact');
  get strict(): RegionPlain[];
  set strict(strictRegions: RegionPlain[]);
  get strictRegions(): RegionPlain[];
  set strictRegions(strictRegions: RegionPlain[]);
  get useDom(): boolean;
  set useDom(useDom: boolean);
  getAccessibilityRegions(): AccessibilityMatchSettings[];
  getAccessibilitySettings(): AccessibilitySettings;
  getContentRegions(): Region[];
  getEnablePatterns(): boolean;
  getExact(): ExactMatchSettings;
  getFloatingRegions(): FloatingMatchSettings[];
  getIgnoreCaret(): boolean;
  getIgnoreDisplacements(): boolean;
  getIgnoreRegions(): Region[];
  getLayoutRegions(): Region[];
  getMatchLevel(): MatchLevel;
  getStrictRegions(): Region[];
  getUseDom(): boolean;
  setAccessibilityRegions(accessibilityRegions: AccessibilityMatchSettingsPlain[]): void;
  setAccessibilitySettings(accessibilitySettings: AccessibilitySettings): void;
  setContentRegions(contentRegions: RegionPlain[]): void;
  setEnablePatterns(enablePatterns: boolean): void;
  setExact(exact: ExactMatchSettingsPlain): void;
  setFloatingRegions(floatingRegions: FloatingMatchSettingsPlain[]): void;
  setIgnoreCaret(ignoreCaret: boolean): void;
  setIgnoreDisplacements(ignoreDisplacements: boolean): void;
  setIgnoreRegions(ignoreRegions: RegionPlain[]): void;
  setLayoutRegions(layoutRegions: RegionPlain[]): void;
  setMatchLevel(matchLevel: MatchLevelPlain): void;
  setStrictRegions(strictRegions: RegionPlain[]): void;
  setUseDom(useDom: boolean): void;
}

export class ImageRotation {
  constructor(rotation: ImageRotationPlain);
  get rotation(): ImageRotationPlain;
  set rotation(rotation: ImageRotationPlain);
  getRotation(): ImageRotationPlain;
  setRotation(rotation: ImageRotationPlain): void;
}

export class Location implements Required<LocationPlain> {
  constructor(location: LocationPlain);
  constructor(x: number, y: number);
  get x(): number;
  set x(x: number);
  get y(): number;
  set y(y: number);
  getX(): number;
  getY(): number;
  setX(x: number): void;
  setY(y: number): void;
}

export abstract class LogHandler implements CustomLogHandlerPlain {
  constructor(verbose?: boolean);
  get verbose(): boolean;
  set verbose(verbose: boolean);
  abstract close(): void;
  getIsVerbose(): boolean;
  log(message: string): void;
  abstract onMessage(message: string): void;
  abstract open(): void;
  setIsVerbose(verbose: boolean): void;
}

export class Logger {
  constructor(options?: {handler?: LogHandlerPlain; label?: string; show?: boolean});
  constructor(show?: boolean);
  close(): void;
  error(...messages: any[]): void;
  extend(label?: string, color?: string): Logger;
  extend(label?: string, color?: string[]): Logger;
  fatal(...messages: any[]): void;
  getLogHandler(): LogHandler;
  log(...messages: any[]): void;
  open(): void;
  setLogHandler(handler: LogHandlerPlain): void;
  verbose(...messages: any[]): void;
  warn(...messages: any[]): void;
}

export class MatchResult implements Required<MatchResultPlain> {
  get asExpected(): boolean;
  get windowId(): number;
  getAsExpected(): boolean;
  getWindowId(): number;
  /** @deprecated */
  setAsExpected(asExpected: boolean): void;
  /** @deprecated */
  setWindowId(windowId: number): void;
}

export class NewTestError extends TestFailedError {
  constructor(message: string, results?: TestResultsPlain);
  constructor(results: TestResultsPlain);
}

export class NullLogHandler extends LogHandler {
  close(): void;
  onMessage(): void;
  open(): void;
}

export class PropertyData implements Required<PropertyDataPlain> {
  constructor(property: PropertyDataPlain);
  constructor(name: string, value: string);
  get name(): string;
  set name(name: string);
  get value(): string;
  set value(value: string);
  getName(): string;
  getValue(): string;
  setName(name: string): void;
  setValue(value: string): void;
}

export class ProxySettings implements Required<ProxySettingsPlain> {
  constructor(proxy: ProxySettingsPlain);
  constructor(url: string, username?: string, password?: string, isHttpOnly?: boolean);
  get isHttpOnly(): boolean;
  get password(): string;
  get url(): string;
  get username(): string;
  getIsHttpOnly(): boolean;
  getPassword(): string;
  getUri(): string;
  getUrl(): string;
  getUsername(): string;
}

export class RectangleSize implements Required<RectangleSizePlain> {
  constructor(size: RectangleSizePlain);
  constructor(width: number, height: number);
  get height(): number;
  set height(height: number);
  get width(): number;
  set width(width: number);
  getHeight(): number;
  getWidth(): number;
  setHeight(height: number): void;
  setWidth(width: number): void;
}

export class Region implements Required<RegionPlain> {
  constructor(region: RegionPlain);
  constructor(location: LocationPlain, size: RectangleSizePlain);
  constructor(x: number, y: number, width: number, height: number);
  get height(): number;
  set height(height: number);
  get left(): number;
  set left(left: number);
  get top(): number;
  set top(top: number);
  get width(): number;
  set width(width: number);
  get x(): number;
  set x(x: number);
  get y(): number;
  set y(y: number);
  getHeight(): number;
  getLeft(): number;
  getTop(): number;
  getWidth(): number;
  getX(): number;
  getY(): number;
  setHeight(height: number): void;
  setLeft(left: number): void;
  setTop(top: number): void;
  setWidth(width: number): void;
  setX(x: number): void;
  setY(y: number): void;
}

/**
 * @undocumented
 * @deprecated
 */
export class RemoteSessionEventHandler extends SessionEventHandler {
  constructor(options: {accessKey?: string; serverUrl: string; timeout?: number});
  constructor(serverUrl: string, accessKey?: string, timeout?: number);
  get accessKey(): string;
  set accessKey(accessKey: string);
  get serverUrl(): string;
  set serverUrl(serverUrl: string);
  get timeout(): number;
  set timeout(timeout: number);
  getAccessKey(): string;
  getServerUrl(): string;
  getTimeout(): number;
  initEnded(): void;
  initStarted(): void;
  setAccessKey(accessKey: string): void;
  setServerUrl(serverUrl: string): void;
  setSizeEnded(): void;
  setSizeWillStart(): void;
  setTimeout(timeout: number): void;
  testEnded(): void;
  testStarted(): void;
  validationEnded(): void;
  validationWillStart(): void;
}

/** @deprecated */
export class RunnerOptionsFluent {
  constructor();
  testConcurrency(concurrency: number): this;
}

/** @deprecated */
export abstract class SessionEventHandler {
  constructor();
  abstract initEnded(): any;
  abstract initStarted(): any;
  abstract setSizeEnded(): any;
  abstract setSizeWillStart(viewportSize: RectangleSize): any;
  abstract testEnded(sessionId: string, testResults: TestResults): any;
  abstract testStarted(sessionId: string): any;
  abstract validationEnded(sessionId: string, validationId: number, validationResult: ValidationResult): any;
  abstract validationWillStart(sessionId: string, validationInfo: ValidationInfo): any;
}

/** @deprecated */
export class SessionEventHandlers extends SessionEventHandler {
  addEventHandler(handler: SessionEventHandler): void;
  clearEventHandlers(): void;
  initEnded(): void;
  initStarted(): void;
  removeEventHandler(handler: SessionEventHandler): void;
  setSizeEnded(): void;
  setSizeWillStart(viewportSize: RectangleSize): void;
  testEnded(sessionId: string, testResults: TestResults): void;
  testStarted(sessionId: string): void;
  validationEnded(sessionId: string, validationId: number, validationResult: ValidationResult): void;
  validationWillStart(sessionId: string, validationInfo: ValidationInfo): void;
}

export class SessionUrls implements Required<SessionUrlsPlain> {
  get batch(): string;
  get session(): string;
  getBatch(): string;
  getSession(): string;
  /** @deprecated */
  setBatch(batch: string): void;
  /** @deprecated */
  setSession(session: string): void;
}

export class StepInfo implements Required<StepInfoPlain> {
  get apiUrls(): ApiUrlsPlain;
  get appUrls(): AppUrlsPlain;
  get hasBaselineImage(): boolean;
  get hasCurrentImage(): boolean;
  get isDifferent(): boolean;
  get name(): string;
  get renderId(): string[];
  getApiUrls(): ApiUrls;
  getAppUrls(): AppUrls;
  getHasBaselineImage(): boolean;
  getHasCurrentImage(): boolean;
  getIsDifferent(): boolean;
  getName(): string;
  getRenderId(): string[];
  /** @deprecated */
  setApiUrls(apiUrls: ApiUrlsPlain): void;
  /** @deprecated */
  setAppUrls(appUrls: AppUrlsPlain): void;
  /** @deprecated */
  setHasBaselineImage(value: boolean): void;
  /** @deprecated */
  setHasCurrentImage(hasCurrentImage: boolean): void;
  /** @deprecated */
  setIsDifferent(value: boolean): void;
  /** @deprecated */
  setName(value: string): void;
  /** @deprecated */
  setRenderId(renderId: string[]): void;
}

export class TestFailedError extends EyesError {
  constructor(message: string, results?: TestResultsPlain);
  constructor(results: TestResultsPlain);
  get testResults(): TestResultsPlain;
  getTestResults(): TestResults;
}

export class TestResultContainer implements Required<TestResultContainerPlain> {
  get exception(): EyesError;
  get testResults(): TestResultsPlain;
  getException(): EyesError;
  getTestResults(): TestResults;
}

export class TestResults implements Required<TestResultsPlain> {
  get accessibilityStatus(): TestAccessibilityStatus;
  get apiUrls(): SessionUrlsPlain;
  get appName(): string;
  get appUrls(): SessionUrlsPlain;
  get batchId(): string;
  get batchName(): string;
  get branchName(): string;
  get contentMatches(): number;
  get duration(): number;
  get exactMatches(): number;
  get hostApp(): string;
  get hostDisplaySize(): RectangleSizePlain;
  get hostOS(): string;
  get isAborted(): boolean;
  get isDifferent(): boolean;
  get isNew(): boolean;
  get layoutMatches(): number;
  get matches(): number;
  get mismatches(): number;
  get missing(): number;
  get name(): string;
  get noneMatches(): number;
  get secretToken(): string;
  get startedAt(): string | Date;
  get status(): 'Passed' | 'Failed' | 'Unresolved';
  get steps(): number;
  get stepsInfo(): StepInfoPlain[];
  get strictMatches(): number;
  get testId(): string;
  get url(): string;
  delete(): Promise<void>;
  /** @deprecated */
  deleteSession(): Promise<void>;
  getAccessibilityStatus(): TestAccessibilityStatus;
  getApiUrls(): SessionUrls;
  getAppName(): string;
  getAppUrls(): SessionUrls;
  getBatchId(): string;
  getBatchName(): string;
  getBranchName(): string;
  getContentMatches(): number;
  getDuration(): number;
  getExactMatches(): number;
  getHostApp(): string;
  getHostDisplaySize(): RectangleSize;
  getHostOS(): string;
  getId(): string;
  getIsAborted(): boolean;
  getIsDifferent(): boolean;
  getIsNew(): boolean;
  getLayoutMatches(): number;
  getMatches(): number;
  getMismatches(): number;
  getMissing(): number;
  getName(): string;
  getNoneMatches(): number;
  getSecretToken(): string;
  getStartedAt(): Date;
  getStatus(): TestResultsStatus;
  getSteps(): number;
  getStepsInfo(): StepInfo[];
  getStrictMatches(): number;
  getUrl(): string;
  isPassed(): boolean;
  /** @deprecated */
  setAccessibilityStatus(accessibilityStatus: TestAccessibilityStatus): void;
  /** @deprecated */
  setApiUrls(apiUrls: SessionUrlsPlain): void;
  /** @deprecated */
  setAppName(appName: string): void;
  /** @deprecated */
  setAppUrls(appUrls: SessionUrlsPlain): void;
  /** @deprecated */
  setBatchId(batchId: string): void;
  /** @deprecated */
  setBatchName(batchName: string): void;
  /** @deprecated */
  setBranchName(branchName: string): void;
  /** @deprecated */
  setContentMatches(contentMatches: number): void;
  /** @deprecated */
  setDuration(duration: number): void;
  /** @deprecated */
  setExactMatches(exactMatches: number): void;
  /** @deprecated */
  setHostApp(hostApp: string): void;
  /** @deprecated */
  setHostDisplaySize(hostDisplaySize: RectangleSizePlain): void;
  /** @deprecated */
  setHostOS(hostOS: string): void;
  /** @deprecated */
  setId(id: string): void;
  /** @deprecated */
  setIsAborted(isAborted: boolean): void;
  /** @deprecated */
  setIsDifferent(isDifferent: boolean): void;
  /** @deprecated */
  setIsNew(isNew: boolean): void;
  /** @deprecated */
  setLayoutMatches(layoutMatches: number): void;
  /** @deprecated */
  setMatches(matches: number): void;
  /** @deprecated */
  setMismatches(mismatches: number): void;
  /** @deprecated */
  setMissing(missing: number): void;
  /** @deprecated */
  setName(name: string): void;
  /** @deprecated */
  setNoneMatches(noneMatches: number): void;
  /** @deprecated */
  setSecretToken(secretToken: string): void;
  /** @deprecated */
  setStartedAt(startedAt: Date): void;
  /** @deprecated */
  setStartedAt(startedAt: string): void;
  /** @deprecated */
  setStatus(status: TestResultsStatus): void;
  /** @deprecated */
  setSteps(steps: number): void;
  /** @deprecated */
  setStepsInfo(stepInfo: StepInfoPlain[]): void;
  /** @deprecated */
  setStrictMatches(strictMatches: number): void;
  /** @deprecated */
  setUrl(url: string): void;
}

export class TestResultsSummary implements TestResultsSummaryPlain {
  [Symbol.iterator](): Iterator<TestResultContainer>;
  getAllResults(): TestResultContainer[];
}

/** @undocumented */
export class UnscaledFixedCutProvider extends CutProvider {
  scale(): UnscaledFixedCutProvider;
}

/** @undocumented */
export class ValidationInfo implements Required<ValidationInfoPlain> {
  get tag(): string;
  get validationId(): number;
  getTag(): string;
  getValidationId(): number;
}

/** @undocumented */
export class ValidationResult implements Required<ValidationResultPlain> {
  get asExpected(): boolean;
  getAsExpected(): boolean;
}

export class VisualGridRunner extends EyesRunner {
  constructor(options?: RunnerOptionsPlain);
  /** @deprecated */
  constructor(options?: RunnerOptionsFluent);
  /** @deprecated */
  constructor(legacyConcurrency?: number);
  /** @deprecated */
  get legacyConcurrency(): number;
  get testConcurrency(): number;
  /** @deprecated */
  getConcurrentSessions(): number;
}

export type AccessibilityGuidelinesVersionPlain = undefined;

export type AccessibilityLevelPlain = undefined;

export type AccessibilityMatchSettingsPlain = {region: RegionPlain; type?: AccessibilityRegionTypePlain};

export type AccessibilityRegionTypePlain = undefined;

export type AccessibilitySettings = {
  guidelinesVersion?: AccessibilityGuidelinesVersionPlain;
  level?: AccessibilityLevelPlain;
};

export type AccessibilityStatusPlain = undefined;

export type ApiUrlsPlain = {
  readonly baselineImage?: string;
  readonly checkpointImage?: string;
  readonly checkpointImageThumbnail?: string;
  readonly currentImage?: string;
  readonly diffImage?: string;
};

export type AppUrlsPlain = {readonly step?: string; readonly stepEditor?: string};

export type BatchInfoPlain = {
  id?: string;
  name?: string;
  notifyOnCompletion?: boolean;
  properties?: PropertyDataPlain[];
  sequenceName?: string;
  startedAt?: Date | string;
};

export type BrowserTypePlain = undefined;

export type CheckSettingsPlain = {
  name?: string;
  region?: RegionPlain | Element | Selector;
  frames?: (
    | {frame: Element | Selector | string | number; scrollRootElement?: Element | Selector}
    | Element
    | Selector
    | string
    | number
  )[];
  scrollRootElement?: Element | Selector;
  fully?: boolean;
  matchLevel?: MatchLevelPlain;
  useDom?: boolean;
  sendDom?: boolean;
  enablePatterns?: boolean;
  ignoreDisplacements?: boolean;
  ignoreCaret?: boolean;
  ignoreRegions?: (RegionPlain | Element | Selector)[];
  layoutRegions?: (RegionPlain | Element | Selector)[];
  strictRegions?: (RegionPlain | Element | Selector)[];
  contentRegions?: (RegionPlain | Element | Selector)[];
  floatingRegions?: (
    | {
        region: RegionPlain | Element | Selector;
        maxUpOffset?: number;
        maxDownOffset?: number;
        maxLeftOffset?: number;
        maxRightOffset?: number;
      }
    | RegionPlain
    | Element
    | Selector
  )[];
  accessibilityRegions?: (
    | {region: RegionPlain | Element | Selector; type?: AccessibilityRegionTypePlain}
    | RegionPlain
    | Element
    | Selector
  )[];
  disableBrowserFetching?: boolean;
  layoutBreakpoints?: boolean | number[];
  visualGridOptions?: {[key: string]: any};
  hooks?: {beforeCaptureScreenshot: string};
  renderId?: string;
  variationGroupId?: string;
  timeout?: number;
};

export type ChromeEmulationInfo = {
  chromeEmulationInfo: {deviceName: DeviceNamePlain; screenOrientation?: ScreenOrientationPlain};
};

export type ConfigurationPlain = {
  /** @undocumented */ logs?: LogHandlerPlain /** @undocumented */;
  debugScreenshots?: {save: boolean; path?: string; prefix?: string};
  agentId?: string;
  apiKey?: string;
  serverUrl?: string;
  proxy?: ProxySettingsPlain;
  isDisabled?: boolean /** @undocumented */;
  connectionTimeout?: number /** @undocumented */;
  removeSession?: boolean /** @undocumented */;
  remoteEvents?: {serverUrl: string; accessKey?: string; timeout?: number};
} & {
  appName?: string;
  testName?: string;
  displayName?: string;
  viewportSize?: RectangleSizePlain;
  sessionType?: SessionTypePlain;
  properties?: PropertyDataPlain[];
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
  saveDiffs?: boolean /** @undocumented */;
  dontCloseBatches?: boolean;
} & {sendDom?: boolean; matchTimeout?: number; forceFullPageScreenshot?: boolean} & {
  waitBeforeScreenshots?: number;
  stitchMode?: StitchModePlain;
  hideScrollbars?: boolean;
  hideCaret?: boolean;
  stitchOverlap?: number;
  scrollRootElement?: Element | Selector;
  cut?: CutProviderPlain;
  rotation?: ImageRotationPlain;
  scaleRatio?: number;
} & {
  /** @undocumented */ concurrentSessions?: number;
  browsersInfo?: (DesktopBrowserInfo | ChromeEmulationInfo | IOSDeviceInfo)[];
  visualGridOptions?: Record<string, any>;
  layoutBreakpoints?: boolean | number[];
  disableBrowserFetching?: boolean;
};

export type ConsoleLogHandlerPlain = {type: 'console'};

export type CorsIframeHandlePlain = undefined;

export type CustomLogHandlerPlain = {
  log(message: any): void;
  warn?(message: any): void;
  error?(message: any): void;
  fatal?(message: any): void;
  open?(): void;
  close?(): void;
};

export type CutProviderPlain =
  | {top: number; right: number; bottom: number; left: number}
  | {x: number; y: number; width: number; height: number};

export type DesktopBrowserInfo = {height: number; name?: BrowserTypePlain; width: number};

export type DeviceNamePlain = undefined;

export type Driver = import('selenium-webdriver').WebDriver;

export type Element = import('selenium-webdriver').WebElement;

/** @undocumented */
export type ExactMatchSettingsPlain = {
  matchThreshold: number;
  minDiffHeight: number;
  minDiffIntensity: number;
  minDiffWidth: number;
};

export type FailureReportPlain = undefined;

export type FileLogHandlerPlain = {type: 'file'; filename?: string; append?: boolean};

/** @undocumented */
export type FloatingMatchSettingsPlain = {
  maxDownOffset?: number;
  maxLeftOffset?: number;
  maxRightOffset?: number;
  maxUpOffset?: number;
  region: RegionPlain;
};

export type IOSDeviceInfo = {
  iosDeviceInfo: {
    deviceName: IosDeviceNamePlain;
    iosVersion?: IosVersionPlain;
    screenOrientation?: ScreenOrientationPlain;
  };
};

/** @undocumented */
export type ImageMatchSettingsPlain = {
  accessibilityRegions?: (RegionPlain | AccessibilityMatchSettingsPlain)[];
  accessibilitySettings?: AccessibilitySettings;
  contentRegions?: RegionPlain[];
  enablePatterns?: boolean;
  exact?: ExactMatchSettingsPlain;
  floatingRegions?: (RegionPlain | FloatingMatchSettingsPlain)[];
  ignoreCaret?: boolean;
  ignoreDisplacements?: boolean;
  ignoreRegions?: RegionPlain[];
  layoutRegions?: RegionPlain[];
  matchLevel?: MatchLevelPlain;
  strictRegions?: RegionPlain[];
  useDom?: boolean;
};

export type ImageRotationPlain = -270 | -180 | -90 | 0 | 90 | 180 | 270;

export type IosDeviceNamePlain = undefined;

export type IosVersionPlain = undefined;

export type LocationPlain = {x: number; y: number};

export type LogHandlerPlain = CustomLogHandlerPlain | FileLogHandlerPlain | ConsoleLogHandlerPlain;

export type MatchLevelPlain = undefined;

export type MatchResultPlain = {readonly asExpected?: boolean; readonly windowId?: number};

export type OCRRegion = {target: RegionPlain | Element | Selector; hint?: string; minMatch?: number; language?: string};

export type OCRSettings<TPattern extends string = string> = {
  firstOnly?: boolean;
  ignoreCase?: boolean;
  language?: string;
  patterns: TPattern[];
};

export type PropertyDataPlain = {name: string; value: string};

export type ProxySettingsPlain = {isHttpOnly?: boolean; password?: string; url: string; username?: string};

export type RectangleSizePlain = {height: number; width: number};

export type RegionPlain = LocationPlain & RectangleSizePlain;

export type RunnerOptionsPlain = {testConcurrency?: number};

export type ScreenOrientationPlain = undefined;

export type Selector =
  | import('selenium-webdriver').By
  | import('selenium-webdriver').ByHash
  | string
  | {type: string; selector: string};

export type SessionTypePlain = undefined;

export type SessionUrlsPlain = {readonly batch?: string; readonly session?: string};

export type StepInfoPlain = {
  readonly apiUrls?: ApiUrlsPlain;
  readonly appUrls?: AppUrlsPlain;
  readonly hasBaselineImage?: boolean;
  readonly hasCurrentImage?: boolean;
  readonly isDifferent?: boolean;
  readonly name?: string;
  readonly renderId?: string[];
};

export type StitchModePlain = undefined;

export type TestAccessibilityStatus = {
  readonly level: AccessibilityLevelPlain;
  readonly status: AccessibilityStatusPlain;
  readonly version: AccessibilityGuidelinesVersionPlain;
};

export type TestResultContainerPlain = {readonly exception: EyesError; readonly testResults: TestResultsPlain};

export type TestResultsPlain = {
  readonly accessibilityStatus?: TestAccessibilityStatus;
  readonly apiUrls?: SessionUrlsPlain;
  readonly appName?: string;
  readonly appUrls?: SessionUrlsPlain;
  readonly batchId?: string;
  readonly batchName?: string;
  readonly branchName?: string;
  readonly contentMatches?: number;
  readonly duration?: number;
  readonly exactMatches?: number;
  readonly hostApp?: string;
  readonly hostDisplaySize?: RectangleSizePlain;
  readonly hostOS?: string;
  readonly isAborted?: boolean;
  readonly isDifferent?: boolean;
  readonly isNew?: boolean;
  readonly layoutMatches?: number;
  readonly matches?: number;
  readonly mismatches?: number;
  readonly missing?: number;
  readonly name?: string;
  readonly noneMatches?: number;
  readonly secretToken?: string;
  readonly startedAt?: Date | string;
  readonly status?: TestResultsStatusPlain;
  readonly steps?: number;
  readonly stepsInfo?: StepInfoPlain[];
  readonly strictMatches?: number;
  readonly testId?: string;
  readonly url?: string;
};

export type TestResultsStatusPlain = undefined;

export type TestResultsSummaryPlain = Iterable<TestResultContainerPlain>;

export type TextRegion = {height: number; text: string; width: number; x: number; y: number};

/** @undocumented */
export type ValidationInfoPlain = {readonly tag: string; readonly validationId: number};

/** @undocumented */
export type ValidationResultPlain = {readonly asExpected: boolean};

export type VisualLocatorSettings<TLocator extends string = string> = {firstOnly: boolean; locatorNames: TLocator[]};

export const Target: {
  window(): CheckSettings;
  region(region: RegionPlain): CheckSettings;
  region(region: Element): CheckSettings;
  region(region: Selector): CheckSettings;
  frame(context: {frame: Element | Selector | string | number; scrollRootElement?: Element | Selector}): CheckSettings;
  frame(frame: Element, scrollRootElement?: Element): CheckSettings;
  frame(frame: Element, scrollRootElement?: Selector): CheckSettings;
  frame(frame: Selector, scrollRootElement?: Element): CheckSettings;
  frame(frame: Selector, scrollRootElement?: Selector): CheckSettings;
  frame(frame: string, scrollRootElement?: Element): CheckSettings;
  frame(frame: string, scrollRootElement?: Selector): CheckSettings;
  frame(frame: number, scrollRootElement?: Element): CheckSettings;
  frame(frame: number, scrollRootElement?: Selector): CheckSettings;
};

/** @deprecated */
export function RunnerOptions(): RunnerOptionsFluent;

export function closeBatch(spec: {
  closeBatches(options: {
    batchIds: string[];
    serverUrl?: string;
    apiKey?: string;
    proxy?: ProxySettingsPlain;
  }): Promise<void>;
}): {(options: {batchIds: string[]; serverUrl?: string; apiKey?: string; proxy?: ProxySettingsPlain}): Promise<void>};
