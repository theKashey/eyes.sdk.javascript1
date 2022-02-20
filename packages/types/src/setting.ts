import {Selector} from './driver'
import {
  MatchLevel,
  Region,
  AccessibilityRegionType,
  AccessibilityGuidelinesVersion,
  AccessibilityLevel,
  Proxy,
} from './data'

type RegionReference<TElement, TSelector> = Region | ElementReference<TElement, TSelector>

type ElementReference<TElement, TSelector> = TElement | Selector<TSelector>

type FrameReference<TElement, TSelector> = ElementReference<TElement, TSelector> | string | number

type ContextReference<TElement, TSelector> = {
  frame: FrameReference<TElement, TSelector>
  scrollRootElement?: ElementReference<TElement, TSelector>
}

type FloatingRegion<TRegion> = {
  region: TRegion
  maxUpOffset?: number
  maxDownOffset?: number
  maxLeftOffset?: number
  maxRightOffset?: number
}

type AccessibilityRegion<TRegion> = {
  region: TRegion
  type?: AccessibilityRegionType
}

export type MatchSettings<TRegion> = {
  exact?: {
    minDiffIntensity: number
    minDiffWidth: number
    minDiffHeight: number
    matchThreshold: number
  }
  matchLevel?: MatchLevel
  sendDom?: boolean
  useDom?: boolean
  enablePatterns?: boolean
  ignoreCaret?: boolean
  ignoreDisplacements?: boolean
  accessibilitySettings?: {
    level?: AccessibilityLevel
    guidelinesVersion?: AccessibilityGuidelinesVersion
  }
  ignoreRegions?: TRegion[]
  layoutRegions?: TRegion[]
  strictRegions?: TRegion[]
  contentRegions?: TRegion[]
  floatingRegions?: (TRegion | FloatingRegion<TRegion>)[]
  accessibilityRegions?: (TRegion | AccessibilityRegion<TRegion>)[]
  pageId: string
}

export type ScreenshotSettings<TElement, TSelector> = {
  region?: RegionReference<TElement, TSelector>
  frames?: (ContextReference<TElement, TSelector> | FrameReference<TElement, TSelector>)[]
  scrollRootElement?: ElementReference<TElement, TSelector>
  fully?: boolean
}

export type CheckSettings<TElement, TSelector> = MatchSettings<RegionReference<TElement, TSelector>> &
  ScreenshotSettings<TElement, TSelector> & {
    name?: string
    disableBrowserFetching?: boolean
    layoutBreakpoints?: boolean | number[]
    visualGridOptions?: {[key: string]: any}
    hooks?: {beforeCaptureScreenshot: string}
    renderId?: string
    variationGroupId?: string
    timeout?: number
  }

export type OCRExtractSettings<TElement, TSelector> = {
  target: RegionReference<TElement, TSelector>
  hint?: string
  minMatch?: number
  language?: string
}

export type OCRSearchSettings<TPattern extends string> = {
  patterns: TPattern[]
  ignoreCase?: boolean
  firstOnly?: boolean
  language?: string
}

export type LocateSettings<TLocator extends string> = {
  locatorNames: TLocator[]
  firstOnly?: boolean
}

export type CloseBatchesSettings = {
  batchIds: string[]
  serverUrl?: string
  apiKey?: string
  proxy?: Proxy
}

export type DeleteTestSettings = {
  testId: string
  batchId: string
  secretToken: string
  serverUrl?: string
  apiKey?: string
  proxy?: Proxy
}
