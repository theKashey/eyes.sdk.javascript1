import {LogHandler, DebugScreenshotHandler} from './debug'
import {MatchSettings} from './setting'
import {Selector} from './driver'
import {
  SessionType,
  StitchMode,
  Size,
  Region,
  Proxy,
  AutProxy,
  Batch,
  CustomProperty,
  ImageRotation,
  ImageCropRect,
  ImageCropRegion,
  BrowserInfoRenderer,
} from './data'

export type EyesManagerConfig<TType extends 'vg' | 'classic' = 'vg' | 'classic'> = {
  type: TType
  concurrency?: TType extends 'vg' ? number : never
  legacy?: TType extends 'vg' ? boolean : never
}

export type EyesConfig<TElement, TSelector> = EyesBaseConfig &
  EyesOpenConfig &
  EyesCheckConfig &
  EyesClassicConfig<TElement, TSelector> &
  EyesUFGConfig

export type EyesBaseConfig = {
  logs?: LogHandler
  debugScreenshots?: DebugScreenshotHandler
  agentId?: string
  apiKey?: string
  serverUrl?: string
  proxy?: Proxy
  autProxy?: AutProxy
  isDisabled?: boolean
  connectionTimeout?: number
  removeSession?: boolean
  remoteEvents?: {serverUrl: string; accessKey?: string; timeout?: number}
}

export type EyesOpenConfig = {
  appName?: string
  testName?: string
  displayName?: string
  viewportSize?: Size
  sessionType?: SessionType
  properties?: CustomProperty[]
  batch?: Batch
  defaultMatchSettings?: MatchSettings<Region>
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
  ignoreGitMergeBase?: boolean
  saveFailedTests?: boolean
  saveNewTests?: boolean
  saveDiffs?: boolean
  dontCloseBatches?: boolean
  useCeilForViewportSize?: boolean
}

export type EyesCheckConfig = {
  sendDom?: boolean
  matchTimeout?: number
  forceFullPageScreenshot?: boolean
}

export type EyesClassicConfig<TElement = unknown, TSelector = unknown> = {
  waitBeforeScreenshots?: number
  stitchMode?: StitchMode
  hideScrollbars?: boolean
  hideCaret?: boolean
  stitchOverlap?: number
  scrollRootElement?: TElement | Selector<TSelector>
  cut?: ImageCropRect | ImageCropRegion
  rotation?: ImageRotation
  scaleRatio?: number
  waitBeforeCapture?: number
}

export type EyesUFGConfig = {
  concurrentSessions?: number
  browsersInfo?: BrowserInfoRenderer[]
  visualGridOptions?: Record<string, any>
  layoutBreakpoints?: boolean | number[]
  disableBrowserFetching?: boolean
}
