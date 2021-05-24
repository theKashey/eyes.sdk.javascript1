import * as Options from './Options'
import * as Settings from './Settings'

export type EyesManagerConfig<TType extends 'vg' | 'classic' = 'vg' | 'classic'> = {
  type: TType
  concurrency?: TType extends 'vg' ? number : never
  legacy?: TType extends 'vg' ? boolean : never
}

export type EyesMakeConfig<TDriver, TElement, TSelector> = {
  driver: TDriver
  config?: EyesConfig<TElement, TSelector>
  on?: (event: string, data?: Record<string, any>) => any
}

export type EyesBaseConfig = {
  logs?: Options.LogHandler
  debugScreenshots?: Options.DebugScreenshotHandler
  agentId?: string
  apiKey?: string
  serverUrl?: string
  proxy?: Options.Proxy
  isDisabled?: boolean
  connectionTimeout?: number
  removeSession?: boolean
  remoteEvents?: {serverUrl: string; accessKey?: string; timeout?: number}
}

export type EyesOpenConfig = {
  appName?: string
  testName?: string
  displayName?: string
  viewportSize?: Options.RectangleSize
  sessionType?: Options.SessionType
  properties?: Options.CustomProperty[]
  batch?: Options.Batch
  defaultMatchSettings?: Settings.MatchSettings<Options.Region>
  hostApp?: string
  hostOS?: string
  hostAppInfo?: string
  hostOSInfo?: string
  deviceInfo?: string
  baselineEnvName?: string
  environmentName?: string
  branchName?: string
  parentBranchName?: string
  baselineBranchName?: string
  compareWithParentBranch?: boolean
  ignoreBaseline?: boolean
  saveFailedTests?: boolean
  saveNewTests?: boolean
  saveDiffs?: boolean
  dontCloseBatches?: boolean
}

export type EyesCheckConfig = {
  sendDom?: boolean
  matchTimeout?: number
  forceFullPageScreenshot?: boolean
}

export type EyesClassicConfig<TElement = unknown, TSelector = unknown> = {
  waitBeforeScreenshots?: number
  stitchMode?: Options.StitchMode
  hideScrollbars?: boolean
  hideCaret?: boolean
  stitchOverlap?: number
  scrollRootElement?: TElement | TSelector
  cut?: Options.ImageCropRect | Options.ImageCropRegion
  rotation?: Options.ImageRotation
  scaleRatio?: number
}

export type EyesUFGConfig = {
  concurrentSessions?: number
  browsersInfo?: (Options.DesktopBrowserRenderer | Options.ChromeEmulationDeviceRenderer | Options.IOSDeviceRenderer)[]
  visualGridOptions?: Record<string, any>
  layoutBreakpoints?: boolean | number[]
  disableBrowserFetching?: boolean
}

export type EyesConfig<TElement, TSelector> = EyesBaseConfig &
  EyesOpenConfig &
  EyesCheckConfig &
  EyesClassicConfig<TElement, TSelector> &
  EyesUFGConfig
