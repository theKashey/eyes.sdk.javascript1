// #region ENUM
export {AccessibilityGuidelinesVersion} from './src/enums/AccessibilityGuidelinesVersion'
export {AccessibilityLevel} from './src/enums/AccessibilityLevel'
export {AccessibilityRegionType} from './src/enums/AccessibilityRegionType'
export {AccessibilityStatus} from './src/enums/AccessibilityStatus'
export {BrowserType} from './src/enums/BrowserType'
export {CorsIframeHandle} from './src/enums/CorsIframeHandle'
export {DeviceName} from './src/enums/DeviceName'
export {FailureReport} from './src/enums/FailureReport'
export {IosDeviceName} from './src/enums/IosDeviceName'
export {IosVersion} from './src/enums/IosVersion'
export {MatchLevel} from './src/enums/MatchLevel'
export {ScreenOrientation} from './src/enums/ScreenOrientation'
export {SessionType} from './src/enums/SessionType'
export {StitchMode} from './src/enums/StitchMode'
export {TestResultsStatus} from './src/enums/TestResultsStatus'
// #endregion

// #region ERROR
export {EyesError} from './src/errors/EyesError'
export {TestFailedError} from './src/errors/TestFailedError'
export {DiffsFoundError} from './src/errors/DiffsFoundError'
export {NewTestError} from './src/errors/NewTestError'
// #endregion

// #region INPUT
export {
  AccessibilityMatchSettings as AccessibilityMatchSettingsPlain,
  AccessibilityMatchSettingsData as AccessibilityMatchSettings,
} from './src/input/AccessibilityMatchSettings'
export {AccessibilitySettings} from './src/input/AccessibilitySettings'
export {BatchInfo as BatchInfoPlain, BatchInfoData as BatchInfo} from './src/input/BatchInfo'
export {
  CheckSettings as CheckSettingsPlain,
  CheckSettingsFluent as CheckSettings,
  Target,
} from './src/input/CheckSettings'
export {Configuration as ConfigurationPlain, ConfigurationData as Configuration} from './src/input/Configuration'
export {
  CutProvider as CutProviderPlain,
  CutProviderData as CutProvider,
  FixedCutProviderData as FixedCutProvider,
  UnscaledFixedCutProviderData as UnscaledFixedCutProvider,
} from './src/input/CutProvider'
export {
  ExactMatchSettings as ExactMatchSettingsPlain,
  ExactMatchSettingsData as ExactMatchSettings,
} from './src/input/ExactMatchSettings'
export {
  FloatingMatchSettings as FloatingMatchSettingsPlain,
  FloatingMatchSettingsData as FloatingMatchSettings,
} from './src/input/FloatingMatchSettings'
export {
  ImageMatchSettings as ImageMatchSettingsPlain,
  ImageMatchSettingsData as ImageMatchSettings,
} from './src/input/ImageMatchSettings'
export {ImageRotation as ImageRotationPlain, ImageRotationData as ImageRotation} from './src/input/ImageRotation'
export {Location as LocationPlain, LocationData as Location} from './src/input/Location'
export {
  LogHandler as LogHandlerPlain,
  CustomLogHandler as CustomLogHandlerPlain,
  FileLogHandler as FileLogHandlerPlain,
  ConsoleLogHandler as ConsoleLogHandlerPlain,
  LogHandlerData as LogHandler,
  FileLogHandlerData as FileLogHandler,
  ConsoleLogHandlerData as ConsoleLogHandler,
  NullLogHandlerData as NullLogHandler,
} from './src/input/LogHandler'
export {OCRRegion} from './src/input/OCRRegion'
export {OCRSettings} from './src/input/OCRSettings'
export {PropertyData as PropertyDataPlain, PropertyDataData as PropertyData} from './src/input/PropertyData'
export {ProxySettings as ProxySettingsPlain, ProxySettingsData as ProxySettings} from './src/input/ProxySettings'
export {RectangleSize as RectangleSizePlain, RectangleSizeData as RectangleSize} from './src/input/RectangleSize'
export {Region as RegionPlain, RegionData as Region} from './src/input/Region'
export {DesktopBrowserInfo, ChromeEmulationInfo, IOSDeviceInfo} from './src/input/RenderInfo'
export {
  RunnerOptions as RunnerOptionsPlain,
  RunnerOptionsFluent,
  RunnerOptionsFluentInit as RunnerOptions,
} from './src/input/RunnerOptions'
export {VisualLocatorSettings} from './src/input/VisualLocatorSettings'
// #endregion

// #region OUTPUT
export {ApiUrls as ApiUrlsPlain, ApiUrlsData as ApiUrls} from './src/output/ApiUrls'
export {AppUrls as AppUrlsPlain, AppUrlsData as AppUrls} from './src/output/AppUrls'
export {MatchResult as MatchResultPlain, MatchResultData as MatchResult} from './src/output/MatchResult'
export {SessionUrls as SessionUrlsPlain, SessionUrlsData as SessionUrls} from './src/output/SessionUrls'
export {StepInfo as StepInfoPlain, StepInfoData as StepInfo} from './src/output/StepInfo'
export {TestAccessibilityStatus} from './src/output/TestAccessibilityStatus'
export {TestResults as TestResultsPlain, TestResultsData as TestResults} from './src/output/TestResults'
export {
  TestResultContainer as TestResultContainerPlain,
  TestResultContainerData as TestResultContainer,
} from './src/output/TestResultContainer'
export {
  TestResultsSummary as TestResultsSummaryPlain,
  TestResultsSummaryData as TestResultsSummary,
} from './src/output/TestResultsSummary'
export {TextRegion} from './src/output/TextRegion'
export {ValidationInfo as ValidationInfoPlain, ValidationInfoData as ValidationInfo} from './src/output/ValidationInfo'
export {
  ValidationResult as ValidationResultPlain,
  ValidationResultData as ValidationResult,
} from './src/output/ValidationResult'
// #endregion

export {Logger} from './src/Logger'
export {Eyes} from './src/Eyes'
export {BatchClose, closeBatch} from './src/BatchClose'
export {EyesRunner, ClassicRunner, VisualGridRunner} from './src/Runners'
export {SessionEventHandler, SessionEventHandlers, RemoteSessionEventHandler} from './src/SessionEventHandlers'
