import * as Options from './Options'

export type MatchResult = {
  readonly asExpected?: boolean
  readonly windowId?: number
}

export type TestResult = {
  readonly testId?: string
  readonly name?: string
  readonly secretToken?: string
  readonly status?: Options.TestResultsStatus
  readonly appName?: string
  readonly batchId?: string
  readonly batchName?: string
  readonly branchName?: string
  readonly hostOS?: string
  readonly hostApp?: string
  readonly hostDisplaySize?: Options.RectangleSize
  readonly accessibilityStatus?: {
    readonly level: Options.AccessibilityLevel
    readonly version: Options.AccessibilityGuidelinesVersion
    readonly status: Options.AccessibilityStatus
  }
  readonly startedAt?: Date | string
  readonly duration?: number
  readonly isNew?: boolean
  readonly isDifferent?: boolean
  readonly isAborted?: boolean
  readonly appUrls?: SessionUrls
  readonly apiUrls?: SessionUrls
  readonly stepsInfo?: StepInfo[]
  readonly steps?: number
  readonly matches?: number
  readonly mismatches?: number
  readonly missing?: number
  readonly exactMatches?: number
  readonly strictMatches?: number
  readonly contentMatches?: number
  readonly layoutMatches?: number
  readonly noneMatches?: number
  readonly url?: string
}

export type StepInfo = {
  readonly name?: string
  readonly isDifferent?: boolean
  readonly hasBaselineImage?: boolean
  readonly hasCurrentImage?: boolean
  readonly appUrls?: AppUrls
  readonly apiUrls?: ApiUrls
  readonly renderId?: string[]
}

export type ApiUrls = {
  readonly baselineImage?: string
  readonly currentImage?: string
  readonly checkpointImage?: string
  readonly checkpointImageThumbnail?: string
  readonly diffImage?: string
}

export type AppUrls = {
  readonly step?: string
  readonly stepEditor?: string
}

export type SessionUrls = {
  readonly batch?: string
  readonly session?: string
}
